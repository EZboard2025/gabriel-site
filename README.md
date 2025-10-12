# Ramppy - Landing Page

Landing page oficial da Ramppy, plataforma de inteligência comercial potencializada por IA.

## Sobre o Projeto

Esta landing page foi desenvolvida para apresentar a Ramppy ao mercado durante a fase de desenvolvimento do produto. O site serve como cartão de visitas e permite que interessados entrem na fila de espera para acesso antecipado.

## Funcionalidades

### Implementadas ✅

- **Hero Section**: Apresentação impactante com animações e visual moderno
- **Sobre a Ramppy**: História, missão, visão e valores da empresa
- **Como Funciona**: Tutorial em 4 passos sobre o uso da plataforma
- **Funcionalidades**: Showcase dos principais recursos do produto
- **Fila de Espera**: Formulário completo para cadastro de interessados
- **FAQ**: Perguntas frequentes com accordion interativo
- **Design Responsivo**: Funciona perfeitamente em desktop, tablet e mobile
- **Animações**: Efeitos visuais modernos e profissionais
- **Dark Mode**: Design escuro elegante inspirado na Assiny

### Em Desenvolvimento 🚧

- Integração com API backend para salvar dados do formulário
- Sistema de analytics (Google Analytics/Mixpanel)
- Sistema de e-mail marketing (envio de boas-vindas)
- Blog/Central de conteúdo
- Área de login (futura)
- Sistema de pagamentos (futuro)

## Estrutura de Arquivos

```
gabriel site/
├── index.html          # Página principal
├── styles.css          # Estilos e design system
├── script.js           # Interações e funcionalidades
├── logo.svg            # Logo da Ramppy
└── README.md           # Este arquivo
```

## Como Usar

### Abrir Localmente

1. Abra o arquivo `index.html` diretamente no navegador
2. Ou use um servidor local:

```bash
# Com Python 3
python -m http.server 8000

# Com Node.js (http-server)
npx http-server

# Com PHP
php -S localhost:8000
```

3. Acesse `http://localhost:8000` no navegador

### Deploy

O site é estático e pode ser hospedado em qualquer serviço:

#### Vercel
```bash
npm i -g vercel
vercel
```

#### Netlify
Arraste a pasta para [app.netlify.com/drop](https://app.netlify.com/drop)

#### GitHub Pages
1. Suba os arquivos para um repositório GitHub
2. Vá em Settings > Pages
3. Selecione a branch e pasta
4. Salve

## Personalização

### Cores

As cores principais estão definidas no `:root` do `styles.css`:

```css
--primary-green: #22c55e;      /* Verde principal */
--primary-green-dark: #16a34a;  /* Verde escuro */
--primary-green-light: #4ade80; /* Verde claro */
```

### Conteúdo

Todo o conteúdo pode ser editado diretamente no `index.html`. As principais seções são:

- **Hero** (linha ~28): Título e descrição principal
- **Sobre** (linha ~93): História da empresa
- **Como Funciona** (linha ~146): Passos do tutorial
- **Funcionalidades** (linha ~202): Recursos do produto
- **FAQ** (linha ~314): Perguntas frequentes

### Formulário

O formulário atualmente salva os dados no `localStorage` do navegador (apenas para demo).

Para integrar com backend real, edite a função no `script.js` (linha ~69):

```javascript
// Substitua por sua API
const response = await fetch('https://sua-api.com/waitlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
});
```

## Tecnologias

- **HTML5**: Estrutura semântica
- **CSS3**: Animações, Grid, Flexbox
- **JavaScript**: Vanilla JS (sem frameworks)
- **Google Fonts**: Inter

## Otimizações

### Performance
- CSS e JS inline reduzidos
- Imagens otimizadas (SVG)
- Lazy loading de seções
- Animações com GPU acceleration

### SEO
- Meta tags otimizadas
- Estrutura semântica HTML5
- Schema markup (a ser implementado)
- Sitemap (a ser criado)

### Acessibilidade
- Contraste WCAG AA
- ARIA labels
- Navegação por teclado
- Focus states visíveis

## Próximos Passos

### Fase 1 - MVP (Atual)
- [x] Design e desenvolvimento da landing page
- [x] Formulário de fila de espera
- [x] Design responsivo
- [ ] Integração com backend

### Fase 2 - Lançamento
- [ ] Conectar com API real
- [ ] Implementar analytics
- [ ] Sistema de e-mail marketing
- [ ] Blog/conteúdo

### Fase 3 - Pós-Lançamento
- [ ] Área de login
- [ ] Dashboard do usuário
- [ ] Sistema de pagamentos
- [ ] Onboarding interativo

## Suporte aos Navegadores

- Chrome/Edge: 90+
- Firefox: 88+
- Safari: 14+
- Opera: 76+

## Licença

© 2024 Ramppy. Todos os direitos reservados.

## Contato

Para dúvidas ou sugestões sobre a landing page, entre em contato com a equipe de desenvolvimento.

---

**Powered by OpenAI · Ramppy Engine™**
