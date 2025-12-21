// supabase-config.js
// ================== CONFIGURAÇÃO SUPABASE ==================

const SUPABASE_URL = 'https://ozhoccdcvcksodnyvlug.supabase.co';
const SUPABASE_ANON_KEY = 'SUA_ANON_PUBLIC_KEY_AQUI'; // começa com eyJ...

// Criar cliente Supabase global
window.supabase = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// ================== FUNÇÕES GLOBAIS ==================

// Gerar ID único de 7 dígitos
window.generateUserId = function () {
  return Math.floor(1000000 + Math.random() * 9000000).toString();
};

// Mostrar alertas
window.showAlert = function (id, message, type = 'error') {
  const el = document.getElementById(id);
  if (!el) return;

  el.textContent = message;
  el.className = `alert alert-${type}`;
  el.style.display = 'block';

  if (type === 'success') {
    setTimeout(() => {
      el.style.display = 'none';
    }, 3000);
  }
};

// Limpar alerta
window.clearAlert = function (id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = 'none';
};

// ================== FUNÇÃO UTILITÁRIA ==================

// Gera um ID de 7 dígitos GARANTIDO (verifica no banco)
window.generateUniqueUserId = async function () {
  let unique = false;
  let userId = null;

  while (!unique) {
    userId = generateUserId();

    const { data, error } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!data && !error) {
      unique = true;
    }
  }

  return userId;
};
