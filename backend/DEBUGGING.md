# Debugging in VS Code

Quick steps to debug this project in Visual Studio Code.

1. Install the recommended extension: C# (ms-dotnettools.csharp).
2. Build the project (Task: `build`) or run the `dotnet build` command.
3. Press F5 to start the ".NET Launch (web)" configuration. This sets `ASPNETCORE_ENVIRONMENT=Development`.
4. To attach to an already-running process, use the ".NET Attach" configuration.

Commands:

```bash
dotnet build
dotnet run --project CarWashBooking.Api.csproj
```

Notes:
- The `preLaunchTask` in `launch.json` runs the `build` task before launching.
- If you need to debug a different framework or output folder, update `program` in `.vscode/launch.json` accordingly.
