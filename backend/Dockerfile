FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY backend/LaReserva.slnx backend/
COPY backend/src/LaReserva.Domain/LaReserva.Domain.csproj backend/src/LaReserva.Domain/
COPY backend/src/LaReserva.Application/LaReserva.Application.csproj backend/src/LaReserva.Application/
COPY backend/src/LaReserva.Infrastructure/LaReserva.Infrastructure.csproj backend/src/LaReserva.Infrastructure/
COPY backend/src/LaReserva.Api/LaReserva.Api.csproj backend/src/LaReserva.Api/
RUN dotnet restore backend/src/LaReserva.Api/LaReserva.Api.csproj
COPY backend/src backend/src
COPY shared shared
RUN dotnet publish backend/src/LaReserva.Api/LaReserva.Api.csproj --no-restore -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build --chown=app:app /app/publish .
COPY --chown=app:app frontend/public/data ./seed
RUN mkdir /app/uploads && chown app:app /app/uploads
USER app
EXPOSE 8080
ENTRYPOINT ["dotnet", "LaReserva.Api.dll"]
