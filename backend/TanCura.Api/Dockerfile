FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["TanCura.Api/TanCura.Api.csproj", "TanCura.Api/"]
COPY ["TanCura.Core/TanCura.Core.csproj", "TanCura.Core/"]
COPY ["TanCura.Infrastructure/TanCura.Infrastructure.csproj", "TanCura.Infrastructure/"]
RUN dotnet restore "TanCura.Api/TanCura.Api.csproj"
COPY . .
RUN dotnet build "TanCura.Api/TanCura.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "TanCura.Api/TanCura.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
USER app
ENTRYPOINT ["dotnet", "TanCura.Api.dll"]
