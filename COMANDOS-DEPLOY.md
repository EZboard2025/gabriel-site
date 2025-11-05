# Comandos para Deploy - Ramppy
**IP do servidor:** 72.61.219.49
**Domínio:** ramppy.com

## IMPORTANTE: Execute estes comandos UM POR VEZ no terminal da Hostinger

---

## 1. Atualizar sistema e instalar programas necessários

```bash
sudo apt update && sudo apt upgrade -y
```
(Pressione Enter e aguarde terminar - pode demorar alguns minutos)

```bash
sudo apt install nginx -y
```
(Instala o servidor web Nginx)

```bash
sudo apt install certbot python3-certbot-nginx -y
```
(Instala o SSL - certificado de segurança HTTPS)

---

## 2. Criar pasta do site

```bash
sudo mkdir -p /var/www/ramppy.com
```

```bash
sudo chown -R $USER:$USER /var/www/ramppy.com
```

```bash
sudo chmod -R 755 /var/www/ramppy.com
```

---

## 3. Configurar Nginx (servidor web)

```bash
sudo nano /etc/nginx/sites-available/ramppy.com
```

**Cole este conteúdo EXATAMENTE assim:**

```nginx
server {
    listen 80;
    listen [::]:80;

    server_name ramppy.com www.ramppy.com;

    root /var/www/ramppy.com;
    index index.html;

    # Logs
    access_log /var/log/nginx/ramppy.com.access.log;
    error_log /var/log/nginx/ramppy.com.error.log;

    # Cache para assets estáticos
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Configuração principal
    location / {
        try_files $uri $uri/ =404;
    }

    # Segurança
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Compressão
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
}
```

**Para sair do nano:**
1. Pressione `Ctrl + X`
2. Pressione `Y` (para salvar)
3. Pressione `Enter`

---

## 4. Ativar o site

```bash
sudo ln -s /etc/nginx/sites-available/ramppy.com /etc/nginx/sites-enabled/
```

```bash
sudo nginx -t
```
(Deve mostrar: "syntax is ok" e "test is successful")

```bash
sudo systemctl restart nginx
```

---

## 5. Configurar Firewall

```bash
sudo ufw allow 'Nginx Full'
```

```bash
sudo ufw allow OpenSSH
```

```bash
sudo ufw --force enable
```

---

## 6. Fazer upload dos arquivos

**OPÇÃO A: Via Terminal Web da Hostinger**

No seu computador Windows, vou criar um comando para empacotar os arquivos:

```powershell
# Execute no PowerShell do Windows (no seu computador)
cd "d:\gabriel site"
tar -czf ramppy-site.tar.gz *.html *.css *.js *.svg *.png
```

Depois faça upload do arquivo `ramppy-site.tar.gz` via painel da Hostinger ou FileZilla.

No servidor, extraia:
```bash
cd /var/www/ramppy.com
tar -xzf ~/ramppy-site.tar.gz -C /var/www/ramppy.com/
```

**OPÇÃO B: Via FileZilla (RECOMENDADO - Mais Fácil)**

1. Baixe FileZilla: https://filezilla-project.org/
2. Abra o FileZilla
3. Conecte usando:
   - Host: `sftp://72.61.219.49`
   - Usuário: (mesmo usuário do painel Hostinger)
   - Senha: (mesma senha do painel Hostinger)
   - Porta: 22

4. Navegue até: `/var/www/ramppy.com/`
5. Arraste TODOS os arquivos da pasta `d:\gabriel site\` para lá:
   - Todos os .html
   - styles.css
   - Todos os .js
   - logo.svg, logo.png
   - Outros arquivos

---

## 7. Ajustar permissões

```bash
sudo chown -R www-data:www-data /var/www/ramppy.com
```

```bash
sudo chmod -R 755 /var/www/ramppy.com
```

---

## 8. Testar o site

Abra no navegador: http://72.61.219.49

Se aparecer o site, está funcionando! ✅

---

## 9. Instalar SSL (HTTPS) - IMPORTANTE!

**AGUARDE o DNS propagar antes de fazer isso!**

Teste se o DNS propagou: https://dnschecker.org/#A/ramppy.com

Quando estiver verde no Brasil, execute:

```bash
sudo certbot --nginx -d ramppy.com -d www.ramppy.com
```

**Durante a instalação:**
- Email: (coloque seu email)
- Termos: `Y` (yes)
- Compartilhar email: `N` (no)
- Redirect HTTP para HTTPS: `2` (escolha opção 2)

---

## 10. Verificação Final

Teste estas URLs:
- [ ] http://ramppy.com → deve redirecionar para https://ramppy.com
- [ ] http://www.ramppy.com → deve redirecionar para https://ramppy.com
- [ ] https://ramppy.com → deve abrir com cadeado verde
- [ ] Formulário de fila de espera funcionando
- [ ] Página de simulação funcionando

---

## Comandos Úteis

### Ver logs de erro:
```bash
sudo tail -f /var/log/nginx/ramppy.com.error.log
```

### Ver logs de acesso:
```bash
sudo tail -f /var/log/nginx/ramppy.com.access.log
```

### Reiniciar Nginx:
```bash
sudo systemctl restart nginx
```

### Ver status do Nginx:
```bash
sudo systemctl status nginx
```

### Testar configuração do Nginx:
```bash
sudo nginx -t
```

---

## Troubleshooting

### Site não carrega:
1. Verificar se Nginx está rodando: `sudo systemctl status nginx`
2. Verificar logs: `sudo tail -f /var/log/nginx/ramppy.com.error.log`
3. Verificar permissões: `ls -la /var/www/ramppy.com`

### DNS não propagou:
- Aguardar algumas horas
- Testar em: https://dnschecker.org/#A/ramppy.com

### SSL não instala:
- Verificar se DNS está propagado
- Verificar se porta 80 e 443 estão abertas: `sudo ufw status`

---

**Suporte:** Se tiver dúvidas, me envie a mensagem de erro!
