FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["MediTrack.Worker/MediTrack.Worker.csproj", "MediTrack.Worker/"]
COPY ["MediTrack.Core/MediTrack.Core.csproj", "MediTrack.Core/"]
COPY ["MediTrack.Infrastructure/MediTrack.Infrastructure.csproj", "MediTrack.Infrastructure/"]
RUN dotnet restore "MediTrack.Worker/MediTrack.Worker.csproj"
COPY . .
RUN dotnet build "MediTrack.Worker/MediTrack.Worker.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "MediTrack.Worker/MediTrack.Worker.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
USER app
ENTRYPOINT ["dotnet", "MediTrack.Worker.dll"]
