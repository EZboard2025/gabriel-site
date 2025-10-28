// Supabase Configuration
const SUPABASE_URL = 'https://pisvpbscqgoyhnnartwj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpc3ZwYnNjcWdveWhubmFydHdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNTc4NjUsImV4cCI6MjA3NTkzMzg2NX0.IbjiMUc7E7pBtHElwR54DlrylSUNtiCZ5-9skxllUjM';

// Aguardar Supabase SDK carregar completamente
let supabase = null;

// Tentar inicializar Supabase
function initSupabase() {
    if (window.supabase && window.supabase.createClient) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        window.supabaseClient = supabase;
        console.log('Supabase inicializado com sucesso');
        return true;
    }
    return false;
}

// Tentar inicializar imediatamente
if (!initSupabase()) {
    // Se falhar, aguardar o DOM carregar
    document.addEventListener('DOMContentLoaded', function() {
        if (!initSupabase()) {
            console.error('Erro: Supabase SDK não encontrado');
        }
    });
}

// Export para uso em outros arquivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { supabase, SUPABASE_URL, SUPABASE_ANON_KEY };
}
