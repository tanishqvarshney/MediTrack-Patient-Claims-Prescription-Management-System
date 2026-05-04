FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["TanCura.Worker/TanCura.Worker.csproj", "TanCura.Worker/"]
COPY ["TanCura.Core/TanCura.Core.csproj", "TanCura.Core/"]
COPY ["TanCura.Infrastructure/TanCura.Infrastructure.csproj", "TanCura.Infrastructure/"]
RUN dotnet restore "TanCura.Worker/TanCura.Worker.csproj"
COPY . .
RUN dotnet build "TanCura.Worker/TanCura.Worker.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "TanCura.Worker/TanCura.Worker.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
USER app
ENTRYPOINT ["dotnet", "TanCura.Worker.dll"]
