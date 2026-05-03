using Microsoft.EntityFrameworkCore;
using MediTrack.Core.Interfaces;
using MediTrack.Infrastructure.Data;
using MediTrack.Infrastructure.Services;
using Serilog;

// Configure Serilog early
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

var host = Host.CreateDefaultBuilder(args)
    .UseSerilog((ctx, services, config) =>
        config.ReadFrom.Configuration(ctx.Configuration)
              .ReadFrom.Services(services)
              .WriteTo.Console())
    .ConfigureServices((ctx, services) =>
    {
        // Database
        services.AddDbContext<MediTrackDbContext>(opts =>
            opts.UseSqlServer(
                ctx.Configuration.GetConnectionString("Default"),
                sql => sql.EnableRetryOnFailure(3)));

        // External HTTP clients
        services.AddHttpClient<IPayerApiClient, MockPayerApiClient>(client =>
        {
            client.BaseAddress = new Uri(ctx.Configuration["PayerApi:BaseUrl"] ?? "https://mock-payer.io");
            client.Timeout = TimeSpan.FromSeconds(
                ctx.Configuration.GetValue<int>("PayerApi:TimeoutSeconds", 30));
        });

        // Services
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<MediTrack.Worker.IClaimProcessor, MediTrack.Worker.ClaimProcessor>();

        // Background worker
        services.AddHostedService<MediTrack.Worker.ClaimPollingWorker>();
    })
    .UseWindowsService()   // runs as Windows Service in production; no-op on Linux/macOS
    .Build();

Log.Information("MediTrack Worker Service starting...");

try
{
    await host.RunAsync();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Worker Service terminated unexpectedly");
}
finally
{
    await Log.CloseAndFlushAsync();
}
