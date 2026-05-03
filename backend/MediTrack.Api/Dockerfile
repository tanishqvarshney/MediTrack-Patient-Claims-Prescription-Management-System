FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["MediTrack.Api/MediTrack.Api.csproj", "MediTrack.Api/"]
COPY ["MediTrack.Core/MediTrack.Core.csproj", "MediTrack.Core/"]
COPY ["MediTrack.Infrastructure/MediTrack.Infrastructure.csproj", "MediTrack.Infrastructure/"]
RUN dotnet restore "MediTrack.Api/MediTrack.Api.csproj"
COPY . .
RUN dotnet build "MediTrack.Api/MediTrack.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "MediTrack.Api/MediTrack.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
USER app
ENTRYPOINT ["dotnet", "MediTrack.Api.dll"]
