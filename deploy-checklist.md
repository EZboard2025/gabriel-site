# Checklist de Deploy - Ramppy

## 1. Preparação Local

### Arquivos necessários para upload:
- [ ] Todos os arquivos .html
- [ ] styles.css
- [ ] script.js e todos os arquivos .js
- [ ] logo.svg, logo.png
- [ ] Outros assets (imagens, fontes)
- [ ] .env (configurar variáveis de ambiente)

### Verificações antes do deploy:
- [ ] Remover console.logs desnecessários
- [ ] Verificar todas as URLs de API
- [ ] Configurar variáveis de ambiente (Supabase, n8n)
- [ ] Testar formulários
- [ ] Verificar links quebrados

## 2. Configuração do Servidor VPS

### Conectar ao VPS via SSH:
```bash
ssh root@SEU_IP_VPS
# ou
ssh seu_usuario@SEU_IP_VPS
```

### Instalar dependências (Ubuntu/Debian):
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Nginx
sudo apt install nginx -y

# Instalar Node.js (se necessário para algum backend)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar Certbot (SSL)
sudo apt install certbot python3-certbot-nginx -y

# Instalar Git (para deploy automático)
sudo apt install git -y
```

### Criar diretório do site:
```bash
sudo mkdir -p /var/www/ramppy.com
sudo chown -R $USER:$USER /var/www/ramppy.com
```

## 3. Configurar Nginx

### Criar arquivo de configuração:
```bash
sudo nano /etc/nginx/sites-available/ramppy.com
```

### Conteúdo do arquivo:
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
}
```

### Ativar site:
```bash
sudo ln -s /etc/nginx/sites-available/ramppy.com /etc/nginx/sites-enabled/
sudo nginx -t  # Testar configuração
sudo systemctl restart nginx
```

## 4. Configurar DNS

### No painel do seu provedor de domínio, adicione:

**Registro A:**
- Nome: @ (ou deixe vazio)
- Tipo: A
- Valor: SEU_IP_VPS
- TTL: 3600

**Registro A para www:**
- Nome: www
- Tipo: A
- Valor: SEU_IP_VPS
- TTL: 3600

**Ou usar CNAME para www:**
- Nome: www
- Tipo: CNAME
- Valor: ramppy.com
- TTL: 3600

## 5. Upload dos Arquivos

### Opção 1: Via SCP (do seu computador local)
```bash
scp -r "d:/gabriel site/"* seu_usuario@SEU_IP_VPS:/var/www/ramppy.com/
```

### Opção 2: Via Git
```bash
# No servidor
cd /var/www/ramppy.com
git clone SEU_REPOSITORIO .
```

### Opção 3: Via FTP/SFTP
Use FileZilla ou WinSCP para fazer upload

## 6. Instalar SSL (HTTPS)

```bash
# Obter certificado SSL gratuito
sudo certbot --nginx -d ramppy.com -d www.ramppy.com

# Seguir instruções
# Escolher: Redirect - Make all requests redirect to secure HTTPS

# Renovação automática (verificar)
sudo certbot renew --dry-run
```

## 7. Configurações de Segurança

### Firewall:
```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

### Permissões:
```bash
sudo chown -R www-data:www-data /var/www/ramppy.com
sudo chmod -R 755 /var/www/ramppy.com
```

## 8. Verificações Finais

- [ ] Site acessível via http://ramppy.com
- [ ] Site acessível via https://ramppy.com
- [ ] Redirect de www para não-www (ou vice-versa) funcionando
- [ ] SSL válido (cadeado verde)
- [ ] Formulários funcionando
- [ ] Imagens carregando
- [ ] Scripts funcionando
- [ ] Console do navegador sem erros

## 9. Monitoramento

### Ver logs:
```bash
sudo tail -f /var/log/nginx/ramppy.com.access.log
sudo tail -f /var/log/nginx/ramppy.com.error.log
```

### Status do Nginx:
```bash
sudo systemctl status nginx
```

## 10. Deploy Contínuo (Opcional)

### Criar script de deploy:
```bash
nano ~/deploy-ramppy.sh
```

```bash
#!/bin/bash
cd /var/www/ramppy.com
git pull origin main
sudo systemctl reload nginx
echo "Deploy concluído!"
```

```bash
chmod +x ~/deploy-ramppy.sh
```

## Troubleshooting

### Nginx não inicia:
```bash
sudo nginx -t  # Ver erros de configuração
sudo systemctl status nginx
```

### Site não carrega:
- Verificar DNS propagado: https://dnschecker.org
- Verificar firewall: `sudo ufw status`
- Verificar logs do Nginx

### SSL não funciona:
```bash
sudo certbot certificates  # Ver certificados
sudo certbot renew  # Renovar
```

## Variáveis de Ambiente

Criar arquivo .env no servidor com:
```env
SUPABASE_URL=sua_url
SUPABASE_ANON_KEY=sua_key
N8N_WEBHOOK_URL=sua_url
```

---

**Domínio:** ramppy.com
**IP VPS:** [seu IP aqui]
**Data Deploy:** [data]
