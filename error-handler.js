// Sistema de Tratamento de Erros com Sugestões
class RamppyErrorHandler {
    constructor() {
        this.setupErrorHandlers();
        this.errorMessages = {
            'Failed to fetch': {
                title: 'Erro de Conexão',
                message: 'Não foi possível conectar ao servidor.',
                suggestions: [
                    '• Verifique sua conexão com a internet',
                    '• Recarregue a página (F5)',
                    '• Tente novamente em alguns instantes',
                    '• Se o problema persistir, entre em contato com o suporte'
                ],
                type: 'error'
            },
            'NetworkError': {
                title: 'Erro de Rede',
                message: 'Problemas na comunicação com o servidor.',
                suggestions: [
                    '• Verifique se você está conectado à internet',
                    '• Desative extensões do navegador que possam bloquear conexões',
                    '• Tente usar outro navegador',
                    '• Verifique se seu firewall não está bloqueando a conexão'
                ],
                type: 'error'
            },
            'CORS': {
                title: 'Erro de Permissão',
                message: 'O navegador bloqueou a conexão por questões de segurança.',
                suggestions: [
                    '• Se você é desenvolvedor, verifique as configurações CORS do servidor',
                    '• Tente acessar o site diretamente (não pelo IP local)',
                    '• Desative temporariamente extensões de segurança do navegador'
                ],
                type: 'warning'
            },
            'Unauthorized': {
                title: 'Acesso Não Autorizado',
                message: 'Você não tem permissão para acessar este recurso.',
                suggestions: [
                    '• Faça login novamente',
                    '• Verifique suas credenciais',
                    '• Entre em contato com o administrador se você deveria ter acesso'
                ],
                type: 'warning'
            },
            'NotFound': {
                title: 'Recurso Não Encontrado',
                message: 'O item solicitado não foi encontrado.',
                suggestions: [
                    '• Verifique se o endereço está correto',
                    '• O item pode ter sido movido ou deletado',
                    '• Volte para a página inicial e tente navegar novamente'
                ],
                type: 'warning'
            },
            'ServerError': {
                title: 'Erro no Servidor',
                message: 'O servidor encontrou um problema ao processar sua solicitação.',
                suggestions: [
                    '• Aguarde alguns minutos e tente novamente',
                    '• Se o erro persistir, entre em contato com o suporte',
                    '• Nossos engenheiros foram notificados sobre o problema'
                ],
                type: 'error'
            },
            'Timeout': {
                title: 'Tempo Esgotado',
                message: 'A operação demorou muito e foi cancelada.',
                suggestions: [
                    '• Verifique sua velocidade de conexão',
                    '• Tente novamente com uma conexão mais estável',
                    '• Se estiver enviando arquivos grandes, tente arquivos menores'
                ],
                type: 'warning'
            },
            'ValidationError': {
                title: 'Erro de Validação',
                message: 'Os dados fornecidos não são válidos.',
                suggestions: [
                    '• Verifique se todos os campos obrigatórios foram preenchidos',
                    '• Confirme se os dados estão no formato correto',
                    '• Revise as informações e tente novamente'
                ],
                type: 'warning'
            }
        };
    }

    setupErrorHandlers() {
        // Capturar erros não tratados
        window.addEventListener('unhandledrejection', (event) => {
            event.preventDefault();
            this.handleError(event.reason);
        });

        // Capturar erros de JavaScript
        window.addEventListener('error', (event) => {
            if (event.message && event.message.includes('fetch')) {
                event.preventDefault();
                this.handleError(new Error('Failed to fetch'));
            }
        });

        // Interceptar fetch para adicionar tratamento de erro
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args);

                // Verificar status HTTP
                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error('Unauthorized');
                    } else if (response.status === 404) {
                        throw new Error('NotFound');
                    } else if (response.status >= 500) {
                        throw new Error('ServerError');
                    }
                }

                return response;
            } catch (error) {
                // Verificar tipo de erro
                if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                    this.handleError(new Error('Failed to fetch'));
                } else if (error.name === 'AbortError') {
                    this.handleError(new Error('Timeout'));
                } else {
                    this.handleError(error);
                }
                throw error;
            }
        };
    }

    handleError(error) {
        console.error('Erro capturado:', error);

        // Identificar o tipo de erro
        let errorKey = 'Failed to fetch'; // Padrão

        if (error.message) {
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                errorKey = 'Failed to fetch';
            } else if (error.message.includes('CORS')) {
                errorKey = 'CORS';
            } else if (error.message.includes('Unauthorized') || error.message.includes('401')) {
                errorKey = 'Unauthorized';
            } else if (error.message.includes('NotFound') || error.message.includes('404')) {
                errorKey = 'NotFound';
            } else if (error.message.includes('ServerError') || error.message.includes('500')) {
                errorKey = 'ServerError';
            } else if (error.message.includes('Timeout')) {
                errorKey = 'Timeout';
            } else if (error.message.includes('Validation')) {
                errorKey = 'ValidationError';
            }
        }

        // Obter mensagem de erro apropriada
        const errorInfo = this.errorMessages[errorKey] || {
            title: 'Erro Desconhecido',
            message: error.message || 'Ocorreu um erro inesperado.',
            suggestions: ['• Recarregue a página', '• Entre em contato com o suporte se o problema persistir'],
            type: 'error'
        };

        // Montar mensagem com sugestões
        const fullMessage = `
            <div style="margin-bottom: 12px;">${errorInfo.message}</div>
            <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px; margin-top: 12px;">
                <strong style="display: block; margin-bottom: 8px;">O que você pode fazer:</strong>
                <div style="font-size: 13px; line-height: 1.6; opacity: 0.9;">
                    ${errorInfo.suggestions.join('<br>')}
                </div>
            </div>
        `;

        // Mostrar notificação usando o sistema Ramppy
        if (window.notify) {
            window.notify.modal({
                title: errorInfo.title,
                message: fullMessage,
                type: errorInfo.type,
                confirmText: 'Entendi'
            });
        } else {
            // Fallback se o sistema de notificações não estiver carregado
            console.error('Sistema de notificações não encontrado. Erro:', errorInfo);
        }
    }

    // Método para adicionar novos tipos de erro
    addErrorType(key, errorInfo) {
        this.errorMessages[key] = errorInfo;
    }

    // Método para testar erros (útil para desenvolvimento)
    testError(errorType) {
        const error = new Error(errorType);
        this.handleError(error);
    }
}

// Inicializar o handler de erros
const ramppyErrorHandler = new RamppyErrorHandler();
window.ramppyErrorHandler = ramppyErrorHandler;

// Log de confirmação
console.log('🛡️ Sistema de tratamento de erros Ramppy carregado!');