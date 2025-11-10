// Fix para formulário mobile - previne fechamento de campos
// Este script deve ser carregado DEPOIS de todos os outros

(function() {
    'use strict';

    console.log('🔧 Fix Mobile Form - Carregado');

    // Aguardar DOM carregar completamente
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        const form = document.getElementById('waitlist-form');
        if (!form) {
            console.warn('Formulário não encontrado');
            return;
        }

        // Prevenir qualquer evento que possa estar fechando os campos
        const formInputs = form.querySelectorAll('input, select, textarea');

        formInputs.forEach(input => {
            // Remover qualquer listener de blur que possa estar causando problema
            const newInput = input.cloneNode(true);
            input.parentNode.replaceChild(newInput, input);

            // Adicionar eventos para prevenir fechamento
            newInput.addEventListener('touchstart', function(e) {
                e.stopPropagation();
            }, { passive: true });

            newInput.addEventListener('touchend', function(e) {
                e.stopPropagation();
            }, { passive: true });

            newInput.addEventListener('focus', function(e) {
                e.stopPropagation();
                // Garantir que o elemento permanece focado
                setTimeout(() => {
                    if (document.activeElement !== this) {
                        this.focus();
                    }
                }, 100);
            });

            // Para selects, garantir que o menu não fecha prematuramente
            if (newInput.tagName.toLowerCase() === 'select') {
                newInput.addEventListener('click', function(e) {
                    e.stopPropagation();
                }, { passive: false });

                newInput.addEventListener('mousedown', function(e) {
                    e.stopPropagation();
                }, { passive: false });
            }
        });

        // Prevenir que o formulário responda a cliques externos durante edição
        form.addEventListener('click', function(e) {
            e.stopPropagation();
        }, { passive: true });

        // Prevenir scroll indesejado quando focar em inputs
        window.addEventListener('scroll', function() {
            const activeElement = document.activeElement;
            if (activeElement && (
                activeElement.tagName === 'INPUT' ||
                activeElement.tagName === 'SELECT' ||
                activeElement.tagName === 'TEXTAREA'
            )) {
                // Não fazer nada - deixar o navegador gerenciar o scroll
            }
        }, { passive: true });

        console.log('✅ Fix Mobile Form - Ativo');
    }
})();
