param(
    [string]$GatewayUrl = "http://localhost:5000",
    [int]$RequestsPerMethod = 50
)

$methods = @("GET", "POST", "PUT", "DELETE")
$stats = @{}

Write-Host "============================================="
Write-Host "ЛАБОРАТОРНАЯ РАБОТА 5 - ТЕСТИРОВАНИЕ BALANCER"
Write-Host "============================================="
Write-Host "Gateway URL: $GatewayUrl"
Write-Host "Запросов на метод: $RequestsPerMethod"
Write-Host ""

foreach ($method in $methods) {
    Write-Host "Выполняем $RequestsPerMethod запросов $method /lb ..."
    
    for ($i = 1; $i -le $RequestsPerMethod; $i++) {
        try {
            $response = $null
            
            switch ($method) {
                "GET" {
                    $response = Invoke-RestMethod -Uri "$GatewayUrl/lb" -Method Get -TimeoutSec 10
                }
                "POST" {
                    $body = @{ requestNumber = $i } | ConvertTo-Json
                    $response = Invoke-RestMethod -Uri "$GatewayUrl/lb" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 10
                }
                "PUT" {
                    $body = @{ requestNumber = $i } | ConvertTo-Json
                    $response = Invoke-RestMethod -Uri "$GatewayUrl/lb" -Method Put -Body $body -ContentType "application/json" -TimeoutSec 10
                }
                "DELETE" {
                    $response = Invoke-RestMethod -Uri "$GatewayUrl/lb" -Method Delete -TimeoutSec 10
                }
            }
            
            $nick = $response.Nick
            
            if (-not $stats.ContainsKey($method)) {
                $stats[$method] = @{}
            }
            if (-not $stats[$method].ContainsKey($nick)) {
                $stats[$method][$nick] = 0
            }
            $stats[$method][$nick]++
            
            if ($i % 10 -eq 0) {
                Write-Host "  Прогресс $method : $i / $RequestsPerMethod"
            }
        }
        catch {
            Write-Host "  Ошибка запроса $method #$i" -ForegroundColor Red
        }
    }
    Write-Host "  Завершено $method"
    Write-Host ""
}

Write-Host "============================================="
Write-Host "РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ"
Write-Host "============================================="
Write-Host ""

$totalRequests = 0
$totalByServer = @{}

foreach ($method in $methods) {
    Write-Host "$method запросы:"
    $methodTotal = 0
    
    if ($stats.ContainsKey($method)) {
        foreach ($server in @("X", "Y", "Z")) {
            $count = 0
            if ($stats[$method].ContainsKey($server)) {
                $count = $stats[$method][$server]
            }
            $percentage = ($count / $RequestsPerMethod) * 100
            Write-Host "  Сервер $server : $count запросов ($([math]::Round($percentage, 1))%)"
            $methodTotal += $count
            
            if (-not $totalByServer.ContainsKey($server)) {
                $totalByServer[$server] = 0
            }
            $totalByServer[$server] += $count
        }
    }
    
    Write-Host "  Итого по $method : $methodTotal запросов"
    Write-Host ""
    $totalRequests += $methodTotal
}

Write-Host "ОБЩАЯ СТАТИСТИКА (все методы):"
foreach ($server in @("X", "Y", "Z")) {
    $count = 0
    if ($totalByServer.ContainsKey($server)) {
        $count = $totalByServer[$server]
    }
    $percentage = ($count / $totalRequests) * 100
    Write-Host "  Сервер $server : $count запросов ($([math]::Round($percentage, 1))%)"
}

Write-Host ""
Write-Host "Всего запросов: $totalRequests"
Write-Host "============================================="