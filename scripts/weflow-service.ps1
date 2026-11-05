param(
    [ValidateSet('start', 'stop', 'restart', 'status')]
    [string]$Action = 'start'
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$runtimeDir = Join-Path $projectRoot '.tmp\weflow'
$statePath = Join-Path $runtimeDir 'service.json'
$stdoutPath = Join-Path $runtimeDir 'stdout.log'
$stderrPath = Join-Path $runtimeDir 'stderr.log'
$vitePath = Join-Path $projectRoot 'apps\web\node_modules\vite\bin\vite.js'
$url = 'http://localhost:5173'
New-Item -ItemType Directory -Path $runtimeDir -Force | Out-Null

function Get-ServiceProcess {
    if (-not (Test-Path -LiteralPath $statePath)) { return $null }
    try {
        $state = Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
        $serviceProcess = Get-Process -Id $state.pid -ErrorAction Stop
        if ($serviceProcess.StartTime.ToUniversalTime().Ticks.ToString() -ne $state.startTicks) {
            return $null
        }
        $info = Get-CimInstance Win32_Process -Filter "ProcessId = $($state.pid)"
        if ($info.CommandLine -and $info.CommandLine.Contains($vitePath)) {
            return $serviceProcess
        }
    } catch { return $null }
    return $null
}

function Stop-ServiceProcess {
    $serviceProcess = Get-ServiceProcess
    if ($null -eq $serviceProcess) {
        Remove-Item -LiteralPath $statePath -Force -ErrorAction SilentlyContinue
        Write-Host 'WeFlow is already stopped (no managed process).'
        return
    }
    # Terminate the verified server process tree, including Vite and esbuild.
    & taskkill.exe /PID $serviceProcess.Id /T /F | Out-Null
    if ($LASTEXITCODE -ne 0 -and (Get-ServiceProcess)) {
        throw 'Could not stop WeFlow. Retry from the same Windows account.'
    }
    $serviceProcess.WaitForExit(10000) | Out-Null
    if (Get-ServiceProcess) { throw 'WeFlow did not stop within 10 seconds.' }
    Remove-Item -LiteralPath $statePath -Force -ErrorAction SilentlyContinue
    Write-Host 'WeFlow stopped.'
}

function Start-ServiceProcess {
    $existing = Get-ServiceProcess
    if ($null -ne $existing) {
        Write-Host "WeFlow is already running (PID $($existing.Id)): $url"
        return
    }
    Remove-Item -LiteralPath $statePath -Force -ErrorAction SilentlyContinue
    $node = Get-Command node.exe -ErrorAction SilentlyContinue
    if ($null -eq $node) { throw 'Node.js is missing. Install Node.js 22 and pnpm 9 first.' }
    $nodeVersion = & $node.Source -p 'process.versions.node'
    if ($LASTEXITCODE -ne 0 -or [int]($nodeVersion.Split('.')[0]) -lt 22) {
        throw "Node.js 22 or later is required. Found: $nodeVersion"
    }
    if (-not (Test-Path -LiteralPath $vitePath)) {
        $pnpm = Get-Command pnpm.cmd -ErrorAction SilentlyContinue
        if ($null -eq $pnpm) { throw 'pnpm is missing. Install pnpm 9, then run this script again.' }
        Write-Host 'Installing dependencies...'
        Push-Location $projectRoot
        try {
            & $pnpm.Source install --frozen-lockfile
            if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed.' }
        } finally { Pop-Location }
    }
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 5173)
    try { $listener.Start() }
    catch { throw 'Port 5173 is occupied. Stop the application using it, then retry.' }
    finally { $listener.Stop() }

    $serviceProcess = $null
    try {
        # CIM creates a detached process without inheriting the caller's terminal handles.
        $commandLine = 'cmd.exe /d /s /c ""{0}" "{1}" --host 127.0.0.1 --port 5173 --strictPort > "{2}" 2> "{3}""' -f $node.Source, $vitePath, $stdoutPath, $stderrPath
        $startup = New-CimInstance -ClassName Win32_ProcessStartup -ClientOnly -Property @{ ShowWindow = [uint16]0 }
        $created = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{
            CommandLine = $commandLine
            CurrentDirectory = (Join-Path $projectRoot 'apps\web')
            ProcessStartupInformation = $startup
        }
        if ($created.ReturnValue -ne 0) { throw "Could not create server process (code $($created.ReturnValue))." }
        $serviceProcess = Get-Process -Id $created.ProcessId
        @{
            pid = $serviceProcess.Id
            startTicks = $serviceProcess.StartTime.ToUniversalTime().Ticks.ToString()
        } | ConvertTo-Json | Set-Content -LiteralPath $statePath -Encoding UTF8
        $deadline = [DateTime]::UtcNow.AddSeconds(60)
        while ([DateTime]::UtcNow -lt $deadline) {
            if ($serviceProcess.HasExited) { throw 'The server exited during startup.' }
            try {
                $response = Invoke-WebRequest -Uri 'http://127.0.0.1:5173' -UseBasicParsing -TimeoutSec 2
                if ($response.StatusCode -eq 200) {
                    Write-Host "WeFlow started (PID $($serviceProcess.Id)): $url"
                    Write-Host "Logs: $runtimeDir"
                    return
                }
            } catch { }
            Start-Sleep -Milliseconds 500
        }
        throw 'The server did not become ready within 60 seconds.'
    } catch {
        $startupError = $_
        if ($null -ne $serviceProcess -and (Get-ServiceProcess)) { Stop-ServiceProcess }
        Write-Host "Check logs: $stdoutPath and $stderrPath"
        throw $startupError
    }
}

$lock = $null
try {
    try {
        $lock = [System.IO.File]::Open((Join-Path $runtimeDir 'service.lock'), 'OpenOrCreate', 'ReadWrite', 'None')
    } catch { throw 'Another WeFlow command is in progress. Retry after it completes.' }
    switch ($Action) {
        'start' { Start-ServiceProcess }
        'stop' { Stop-ServiceProcess }
        'restart' { Stop-ServiceProcess; Start-ServiceProcess }
        'status' {
            $serviceProcess = Get-ServiceProcess
            if ($null -ne $serviceProcess) {
                Write-Host "WeFlow is running (PID $($serviceProcess.Id)): $url"
            } else { Write-Host 'WeFlow is stopped (no managed process).' }
        }
    }
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    if ($null -ne $lock) { $lock.Dispose() }
}
