# 🚀 Guia Rápido - Deploy Ramppy

## 📋 Ordem de Execução

### 1️⃣ CONFIGURAR DNS (FAZER PRIMEIRO!)
**No painel Hostinger** → Domínios → ramppy.com → DNS

Adicionar:
```
Tipo A: @ → 72.61.219.49
Tipo A: www → 72.61.219.49
```

⏰ Aguardar propagação (5 min a 24h)

---

### 2️⃣ ACESSAR SERVIDOR
**Painel Hostinger** → VPS → Terminal SSH

Ou usar FileZilla:
- Host: `sftp://72.61.219.49`
- Porta: 22
- Usuário/Senha: mesmo do painel

---

### 3️⃣ INSTALAR PROGRAMAS
Copie e cole no terminal, um por vez:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install nginx certbot python3-certbot-nginx -y
```

---

### 4️⃣ CRIAR PASTA DO SITE
```bash
sudo mkdir -p /var/www/ramppy.com
sudo chown -R $USER:$USER /var/www/ramppy.com
```

---

### 5️⃣ CONFIGURAR NGINX
```bash
sudo nano /etc/nginx/sites-available/ramppy.com
```

Cole o conteúdo do arquivo COMANDOS-DEPLOY.md

Salvar: `Ctrl+X` → `Y` → `Enter`

Ativar:
```bash
sudo ln -s /etc/nginx/sites-available/ramppy.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

### 6️⃣ UPLOAD DOS ARQUIVOS

**Opção FileZilla (RECOMENDADO):**
1. Baixar: https://filezilla-project.org/
2. Conectar em `sftp://72.61.219.49`
3. Ir em `/var/www/ramppy.com/`
4. Arrastar TODOS os arquivos de `d:\gabriel site\`

**Ou via Terminal:**
```bash
# Fazer upload do arquivo .tar.gz
cd /var/www/ramppy.com
# extrair arquivos aqui
```

---

### 7️⃣ PERMISSÕES
```bash
sudo chown -R www-data:www-data /var/www/ramppy.com
sudo chmod -R 755 /var/www/ramppy.com
```

---

### 8️⃣ TESTAR
Abrir: http://72.61.219.49

Se funcionar, prosseguir ✅

---

### 9️⃣ INSTALAR SSL (HTTPS)
⚠️ **AGUARDAR DNS PROPAGAR ANTES!**

Testar em: https://dnschecker.org/#A/ramppy.com

Quando estiver OK:
```bash
sudo certbot --nginx -d ramppy.com -d www.ramppy.com
```

Escolher opção `2` (redirect)

---

### 🎉 PRONTO!

Acessar: https://ramppy.com

---

## 🆘 Problemas?

**Site não carrega:**
```bash
sudo systemctl status nginx
sudo tail -f /var/log/nginx/ramppy.com.error.log
```

**DNS não propagou:**
- Aguardar algumas horas
- Verificar em https://dnschecker.org

**SSL falhou:**
- DNS precisa estar propagado primeiro
- Tentar novamente: `sudo certbot --nginx -d ramppy.com -d www.ramppy.com`
