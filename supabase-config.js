// supabase-config.js
const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_ANON_KEY = 'sua-chave-anon-publica';

window.supabase = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// Alertas globais
window.showAlert = function (id, message, type = 'error') {
  const el = document.getElementById(id);
  el.textContent = message;
  el.className = `alert alert-${type}`;
  el.style.display = 'block';
};

window.clearAlert = function (id) {
  const el = document.getElementById(id);
  el.style.display = 'none';
};
