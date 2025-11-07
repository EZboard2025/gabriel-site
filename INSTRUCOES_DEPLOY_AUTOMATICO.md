# 🚀 CONFIGURAR DEPLOY AUTOMÁTICO PARA RAMPPY.COM

## 📋 O QUE ISSO FAZ?

Sempre que você fizer um commit e push para o GitHub, o site será automaticamente atualizado em ramppy.com!

## 🔧 CONFIGURAÇÃO (5 minutos)

### PASSO 1: Acesse seu repositório no GitHub

1. Vá para: https://github.com/EZboard2025/gabriel-site
2. Clique em **Settings** (Configurações)

### PASSO 2: Configure o Secret

1. No menu lateral, clique em **Secrets and variables** > **Actions**
2. Clique no botão **"New repository secret"**
3. Adicione o seguinte secret:

   **Nome:** `DEPLOY_PASSWORD`
   **Valor:** `Seta@2598601`

4. Clique em **"Add secret"**

### PASSO 3: Ative o GitHub Actions

1. Vá para a aba **Actions** no seu repositório
2. Se aparecer uma mensagem pedindo para ativar, clique em **"Enable Actions"**

### PASSO 4: Faça o primeiro deploy

No seu terminal/VSCode:

```bash
git add .
git commit -m "Adicionar deploy automático"
git push
```

## ✅ PRONTO!

Agora, sempre que você fizer:
```bash
git push
```

O site será automaticamente atualizado em https://ramppy.com

## 🔍 COMO VERIFICAR?

1. Após fazer push, vá em **Actions** no GitHub
2. Você verá o deploy rodando (bolinha amarela girando)
3. Quando ficar verde ✅, o site foi atualizado!

## 📝 ARQUIVOS QUE SÃO ENVIADOS

- ✅ Todos os arquivos .html
- ✅ Todos os arquivos .css
- ✅ Todos os arquivos .js
- ✅ Pastas assets, img, fonts (se existirem)

## 🚨 IMPORTANTE

- O deploy demora cerca de 30 segundos
- Se der erro, verifique na aba Actions do GitHub
- A senha está segura (encrypted) no GitHub Secrets

## 💡 DICAS

### Deploy Manual
Se quiser fazer deploy manual sem fazer commit:
1. Vá em **Actions**
2. Clique em **"Auto Deploy para Ramppy.com"**
3. Clique em **"Run workflow"**

### Desativar Deploy Automático
Se quiser pausar o deploy automático, renomeie o arquivo:
`.github/workflows/auto-deploy.yml` para `.github/workflows/auto-deploy.yml.disabled`

## 🐛 TROUBLESHOOTING

**Erro: Permission denied**
- Verifique se a senha está correta no Secret

**Erro: Connection refused**
- O servidor pode estar fora do ar, teste http://72.61.219.49

**Site não atualiza**
- Limpe o cache do navegador (Ctrl+F5)

---

## 📧 SUPORTE

Se precisar de ajuda, me avise!