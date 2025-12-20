# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["CarWashBooking.Api.csproj", "."]
RUN dotnet restore "CarWashBooking.Api.csproj"
COPY . .
RUN dotnet publish "CarWashBooking.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "CarWashBooking.Api.dll"]
