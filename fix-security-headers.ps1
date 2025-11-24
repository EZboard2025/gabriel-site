# Script para corrigir headers de segurança em todos os HTML
# Remove meta tags que só funcionam via HTTP headers

Get-ChildItem -Path "." -Filter "*.html" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -Encoding UTF8

    # Remove X-Frame-Options (só funciona via HTTP header)
    $content = $content -replace '.*<meta http-equiv="X-Frame-Options".*\r?\n', ''

    # Remove X-XSS-Protection (obsoleto e pode causar problemas)
    $content = $content -replace '.*<meta http-equiv="X-XSS-Protection".*\r?\n', ''

    # Remove Permissions-Policy via meta (só funciona via HTTP header)
    $content = $content -replace '.*<meta http-equiv="Permissions-Policy".*\r?\n', ''

    # Remove integrity incorreto do Supabase
    $content = $content -replace 'integrity="sha384-[^"]*"', ''

    # Limpa linhas vazias extras
    $content = $content -replace '(\r?\n){3,}', "`r`n`r`n"

    Set-Content -Path $_.FullName -Value $content -Encoding UTF8
    Write-Host "Corrigido: $($_.Name)" -ForegroundColor Green
}

Write-Host "`nTodos os arquivos foram corrigidos!" -ForegroundColor Cyan