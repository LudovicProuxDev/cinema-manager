FROM mcr.microsoft.com/dotnet/sdk:10.0

WORKDIR /app

ENV DOTNET_CLI_HOME=/cache/cli \
    DOTNET_CLI_TELEMETRY_OPTOUT=1 \
    DOTNET_NOLOGO=1 \
    DOTNET_SKIP_WORKLOAD_INTEGRITY_CHECK=1 \
    NUGET_PACKAGES=/cache/nuget \
    ASPNETCORE_HTTP_PORTS=8080

RUN mkdir -p /cache/cli /cache/nuget && chmod -R 777 /cache

EXPOSE 8080

CMD ["dotnet", "watch", "run", "--project", "src/CinemaManager.Api", "--no-launch-profile", "--non-interactive", "--no-hot-reload"]
