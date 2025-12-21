// =====================================================
// SUPABASE CONFIG – GURPS TOOL (FRONTEND)
// =====================================================

// ⚠️ IMPORTANTE:
// Este arquivo DEVE ser carregado DEPOIS do script:
// https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2

// =====================================================
// DADOS DO PROJETO
// =====================================================

const SUPABASE_URL = 'https://ozhoccdcvcksodnyvlug.supabase.co';

const SUPABASE_ANON_KEY =
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96aG9jY2RjdmNrc29kbnl2bHVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMjY0MDEsImV4cCI6MjA4MTkwMjQwMX0.Xa29T0YVnIeGZDdAPivOU21C3HSlflWpVp8McAJwqSQ';

// =====================================================
// CRIAÇÃO DO CLIENTE SUPABASE GLOBAL
// =====================================================

window.supabase = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

// =====================================================
// ALERTAS GLOBAIS
// =====================================================

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

window.clearAlert = function (id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = 'none';
};

// =====================================================
// GERAÇÃO DE ID DE USUÁRIO (7 DÍGITOS)
// =====================================================

window.generateUserId = function () {
  return Math.floor(1000000 + Math.random() * 9000000).toString();
};

// =====================================================
// GERAÇÃO DE ID ÚNICO VALIDADO NO BANCO
// =====================================================

window.generateUniqueUserId = async function () {
  let userId;
  let exists = true;

  while (exists) {
    userId = generateUserId();

    const { data, error } = await window.supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!data && !error) {
      exists = false;
    }
  }

  return userId;
};

// =====================================================
// AUTENTICAÇÃO – FUNÇÕES UTILITÁRIAS
// =====================================================

window.getCurrentSession = async function () {
  const { data, error } = await window.supabase.auth.getSession();
  if (error) return null;
  return data.session;
};

window.getCurrentUser = async function () {
  const { data, error } = await window.supabase.auth.getUser();
  if (error) return null;
  return data.user;
};

window.logoutUser = async function () {
  await window.supabase.auth.signOut();
  window.location.href = 'login.html';
};

// =====================================================
// PROTEÇÃO DE PÁGINAS (USAR EM HOME / DASHBOARD)
// =====================================================

window.requireAuth = async function () {
  const session = await getCurrentSession();
  if (!session) {
    window.location.href = 'login.html';
  }
};
