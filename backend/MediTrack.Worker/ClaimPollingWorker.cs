using MediTrack.Core.Interfaces;
using MediTrack.Core.Models;

namespace MediTrack.Worker;

public class ClaimPollingWorker : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ClaimPollingWorker> _logger;
    private readonly TimeSpan _interval;

    public ClaimPollingWorker(
        IServiceScopeFactory scopeFactory,
        IConfiguration config,
        ILogger<ClaimPollingWorker> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
        _interval = TimeSpan.FromSeconds(config.GetValue<int>("Worker:PollingIntervalSeconds", 30));
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation(
            "ClaimPollingWorker started. Polling every {Interval}s", _interval.TotalSeconds);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessBatchAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break; // graceful shutdown
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled error in polling batch");
            }

            await Task.Delay(_interval, stoppingToken);
        }

        _logger.LogInformation("ClaimPollingWorker stopped gracefully");
    }

    private async Task ProcessBatchAsync(CancellationToken ct)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        var processor = scope.ServiceProvider.GetRequiredService<IClaimProcessor>();

        var claims = await processor.GetPendingBatchAsync(batchSize: 50, ct);
        if (!claims.Any())
        {
            _logger.LogDebug("No pending claims to process");
            return;
        }

        _logger.LogInformation("Processing batch of {Count} claims", claims.Count);

        // Process in parallel with max concurrency to avoid overwhelming payer API
        var semaphore = new SemaphoreSlim(10);
        var tasks = claims.Select(async claim =>
        {
            await semaphore.WaitAsync(ct);
            try { await processor.ProcessClaimAsync(claim, ct); }
            finally { semaphore.Release(); }
        });

        await Task.WhenAll(tasks);
        _logger.LogInformation("Batch complete. Processed {Count} claims", claims.Count);
    }
}
