// ============================================
// SCROLL REVEAL ANIMATIONS - RAMPPY
// Sistema inteligente de animações ao rolar
// ============================================

class ScrollReveal {
    constructor(options = {}) {
        this.options = {
            threshold: options.threshold || 0.15, // 15% do elemento visível
            rootMargin: options.rootMargin || '0px 0px -50px 0px',
            once: options.once !== undefined ? options.once : true, // Animar apenas uma vez
            mobile: options.mobile !== undefined ? options.mobile : true, // Animar em mobile
            ...options
        };

        this.observer = null;
        this.elements = [];
        this.init();
    }

    init() {
        // Verificar se deve animar em mobile
        if (!this.options.mobile && window.innerWidth < 768) {
            this.showAllElements();
            return;
        }

        // Criar Intersection Observer
        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            {
                threshold: this.options.threshold,
                rootMargin: this.options.rootMargin
            }
        );

        // Observar todos os elementos com classe scroll-reveal
        this.observeElements();

        // Re-observar elementos quando a página é redimensionada
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.refresh();
            }, 250);
        });
    }

    observeElements() {
        // Buscar todos os elementos com a classe scroll-reveal
        const elements = document.querySelectorAll('.scroll-reveal');

        elements.forEach((element, index) => {
            // Adicionar ao array de elementos
            this.elements.push(element);

            // Adicionar data-index para debug
            element.setAttribute('data-scroll-index', index);

            // Começar a observar
            if (this.observer) {
                this.observer.observe(element);
            }
        });

        console.log(`📜 Scroll Reveal: ${elements.length} elementos sendo observados`);
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Elemento entrou na viewport
                this.animateElement(entry.target);

                // Se once=true, parar de observar após animar
                if (this.options.once) {
                    this.observer.unobserve(entry.target);
                }
            } else if (!this.options.once) {
                // Se once=false, remover classe quando sair da viewport
                entry.target.classList.remove('visible');
            }
        });
    }

    animateElement(element) {
        // Adicionar classe visible para ativar a animação CSS
        element.classList.add('visible');

        // Disparar evento customizado
        const event = new CustomEvent('scrollReveal', {
            detail: { element }
        });
        element.dispatchEvent(event);

        // Log para debug
        const index = element.getAttribute('data-scroll-index');
        console.log(`✨ Elemento ${index} revelado`);
    }

    showAllElements() {
        // Mostrar todos os elementos sem animação
        const elements = document.querySelectorAll('.scroll-reveal');
        elements.forEach(element => {
            element.classList.add('visible');
            element.style.transition = 'none';
        });
    }

    refresh() {
        // Desconectar observer atual
        if (this.observer) {
            this.observer.disconnect();
        }

        // Limpar elementos
        this.elements = [];

        // Reinicializar
        this.init();
    }

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        this.elements = [];
    }
}

// ============================================
// AUTO-INICIALIZAÇÃO
// ============================================

let ramppyScrollReveal;

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollReveal);
} else {
    initScrollReveal();
}

function initScrollReveal() {
    // Configurações padrão para o Ramppy
    ramppyScrollReveal = new ScrollReveal({
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px',
        once: true, // Animar apenas uma vez
        mobile: true // Animar em mobile também
    });

    console.log('🎬 Scroll Reveal System inicializado!');
}

// ============================================
// HELPER FUNCTIONS
// ============================================

// Função para adicionar animação a um elemento específico
function addScrollReveal(selector, animationType = 'slide-up', delay = 0) {
    const element = document.querySelector(selector);
    if (element) {
        element.classList.add('scroll-reveal', animationType);
        if (delay > 0) {
            element.classList.add(`delay-${delay}`);
        }

        // Re-observar
        if (ramppyScrollReveal && ramppyScrollReveal.observer) {
            ramppyScrollReveal.observer.observe(element);
        }
    }
}

// Função para adicionar animação a múltiplos elementos
function addScrollRevealMultiple(selector, animationType = 'slide-up', stagger = true) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element, index) => {
        element.classList.add('scroll-reveal', animationType);
        if (stagger) {
            element.classList.add(`delay-${Math.min(index + 1, 5)}`);
        }

        // Re-observar
        if (ramppyScrollReveal && ramppyScrollReveal.observer) {
            ramppyScrollReveal.observer.observe(element);
        }
    });
}

// Função para revelar elemento manualmente
function revealElement(selector) {
    const element = document.querySelector(selector);
    if (element && ramppyScrollReveal) {
        ramppyScrollReveal.animateElement(element);
    }
}

// Função para reset (útil para testes)
function resetScrollReveal() {
    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach(element => {
        element.classList.remove('visible');
    });

    if (ramppyScrollReveal) {
        ramppyScrollReveal.refresh();
    }
}

// Expor funções globalmente
window.ramppyScrollReveal = ramppyScrollReveal;
window.addScrollReveal = addScrollReveal;
window.addScrollRevealMultiple = addScrollRevealMultiple;
window.revealElement = revealElement;
window.resetScrollReveal = resetScrollReveal;

// Log de boas-vindas
console.log('%c🎬 Ramppy Scroll Animations', 'font-size: 16px; font-weight: bold; color: #22c55e;');
console.log('%cAnimações de scroll carregadas com sucesso!', 'color: #888;');
