// Supabase Configuration
const SUPABASE_URL = 'https://pisvpbscqgoyhnnartwj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpc3ZwYnNjcWdveWhubmFydHdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNTc4NjUsImV4cCI6MjA3NTkzMzg2NX0.IbjiMUc7E7pBtHElwR54DlrylSUNtiCZ5-9skxllUjM';

// Inicializar cliente Supabase
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

console.log('Supabase inicializado:', supabase ? 'Sim' : 'Não');

// Export para uso em outros arquivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { supabase, SUPABASE_URL, SUPABASE_ANON_KEY };
}
