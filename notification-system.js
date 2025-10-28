// Sistema de Notificações Ramppy
class RamppyNotifications {
    constructor() {
        this.container = null;
        this.init();
        this.overrideNativeAlerts();
    }

    init() {
        // Criar container de notificações se não existir
        if (!document.querySelector('.ramppy-notification-container')) {
            this.container = document.createElement('div');
            this.container.className = 'ramppy-notification-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.querySelector('.ramppy-notification-container');
        }
    }

    show(message, type = 'info', title = null, duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `ramppy-notification ${type}`;

        // Ícones para cada tipo
        const icons = {
            success: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',
            error: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            warning: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            info: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
        };

        // Títulos padrão para cada tipo
        const defaultTitles = {
            success: 'Sucesso',
            error: 'Erro',
            warning: 'Atenção',
            info: 'Informação'
        };

        const notificationTitle = title || defaultTitles[type];

        notification.innerHTML = `
            <div class="ramppy-notification-icon">
                ${icons[type]}
            </div>
            <div class="ramppy-notification-content">
                <div class="ramppy-notification-title">${notificationTitle}</div>
                <div class="ramppy-notification-message">${message}</div>
            </div>
            <button class="ramppy-notification-close">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;

        // Adicionar ao container
        this.container.appendChild(notification);

        // Fechar ao clicar no X
        notification.querySelector('.ramppy-notification-close').addEventListener('click', () => {
            this.hide(notification);
        });

        // Auto-fechar após duração
        if (duration > 0) {
            setTimeout(() => {
                this.hide(notification);
            }, duration);
        }
    }

    hide(notification) {
        notification.classList.add('hiding');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }

    success(message, title = null, duration = 5000) {
        this.show(message, 'success', title, duration);
    }

    error(message, title = null, duration = 7000) {
        this.show(message, 'error', title, duration);
    }

    warning(message, title = null, duration = 6000) {
        this.show(message, 'warning', title, duration);
    }

    info(message, title = null, duration = 5000) {
        this.show(message, 'info', title, duration);
    }

    // Criar modal/popup customizado
    modal(options = {}) {
        const {
            title = 'Atenção',
            message = '',
            type = 'info',
            confirmText = 'OK',
            cancelText = 'Cancelar',
            showCancel = false,
            onConfirm = () => {},
            onCancel = () => {}
        } = options;

        // Remover modal existente se houver
        const existingModal = document.querySelector('.ramppy-modal-overlay');
        if (existingModal) {
            existingModal.remove();
        }

        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'ramppy-modal-overlay';

        const icons = {
            success: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',
            error: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            warning: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            info: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
            question: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
        };

        modalOverlay.innerHTML = `
            <div class="ramppy-modal">
                <div class="ramppy-modal-header">
                    <div class="ramppy-modal-icon">
                        ${icons[type] || icons.info}
                    </div>
                    <div class="ramppy-modal-title">${title}</div>
                </div>
                <div class="ramppy-modal-content">
                    ${message}
                </div>
                <div class="ramppy-modal-actions">
                    ${showCancel ? `<button class="ramppy-modal-btn ramppy-modal-btn-secondary" id="modal-cancel">${cancelText}</button>` : ''}
                    <button class="ramppy-modal-btn ramppy-modal-btn-primary" id="modal-confirm">${confirmText}</button>
                </div>
            </div>
        `;

        document.body.appendChild(modalOverlay);
        modalOverlay.classList.add('active');

        // Event handlers
        const confirmBtn = modalOverlay.querySelector('#modal-confirm');
        const cancelBtn = modalOverlay.querySelector('#modal-cancel');

        confirmBtn.addEventListener('click', () => {
            onConfirm();
            modalOverlay.remove();
        });

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                onCancel();
                modalOverlay.remove();
            });
        }

        // Fechar ao clicar fora
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                if (showCancel) {
                    onCancel();
                }
                modalOverlay.remove();
            }
        });
    }

    // Override dos alerts nativos
    overrideNativeAlerts() {
        // Salvar referências originais
        const originalAlert = window.alert;
        const originalConfirm = window.confirm;

        // Override alert
        window.alert = (message) => {
            this.modal({
                title: 'Aviso',
                message: message,
                type: 'info',
                confirmText: 'OK',
                showCancel: false
            });
        };

        // Override confirm
        window.confirm = (message) => {
            return new Promise((resolve) => {
                this.modal({
                    title: 'Confirmação',
                    message: message,
                    type: 'question',
                    confirmText: 'Sim',
                    cancelText: 'Não',
                    showCancel: true,
                    onConfirm: () => resolve(true),
                    onCancel: () => resolve(false)
                });
            });
        };

        // Manter originais disponíveis se necessário
        window.originalAlert = originalAlert;
        window.originalConfirm = originalConfirm;
    }
}

// Inicializar o sistema quando o DOM carregar
const RamppyNotify = new RamppyNotifications();

// Exportar para uso global
window.RamppyNotify = RamppyNotify;

// Funções de conveniência
window.notify = {
    success: (msg, title) => RamppyNotify.success(msg, title),
    error: (msg, title) => RamppyNotify.error(msg, title),
    warning: (msg, title) => RamppyNotify.warning(msg, title),
    info: (msg, title) => RamppyNotify.info(msg, title),
    modal: (options) => RamppyNotify.modal(options)
};

console.log('🔔 Sistema de notificações Ramppy carregado!');