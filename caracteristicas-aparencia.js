// caracteristicas-aparencia.js - VERSÃO QUE FUNCIONA
console.log('🎭 Sistema de Aparência carregando...');

// 1. Quando clicar na tab características, inicializar
document.addEventListener('click', function(e) {
    if (e.target.closest('.tab-btn[data-tab="caracteristicas"]')) {
        console.log('🎯 Clicou na tab características');
        setTimeout(iniciarAparencia, 100);
    }
});

function iniciarAparencia() {
    console.log('🚀 Iniciando sistema de aparência...');
    
    // Pegar elementos
    const select = document.getElementById('nivelAparencia');
    const badge = document.getElementById('pontosAparencia');
    const display = document.getElementById('displayAparencia');
    
    console.log('Elementos encontrados:', {
        select: !!select,
        badge: !!badge,
        display: !!display
    });
    
    if (!select || !badge || !display) {
        console.error('❌ Elementos não encontrados!');
        return;
    }
    
    console.log('✅ Elementos OK!');
    
    // Configurar evento
    select.addEventListener('change', function() {
        console.log('🔄 Select mudou:', this.value);
        atualizarAparencia(this.value);
    });
    
    // Inicializar
    atualizarAparencia(select.value);
    console.log('🎉 Sistema configurado!');
}

function atualizarAparencia(valor) {
    console.log('📊 Atualizando com valor:', valor);
    
    const select = document.getElementById('nivelAparencia');
    const badge = document.getElementById('pontosAparencia');
    const display = document.getElementById('displayAparencia');
    
    if (!select || !badge || !display) return;
    
    // Converter valor para número
    const pontos = Number(valor);
    console.log('Pontos calculados:', pontos);
    
    // ATUALIZAR BADGE (OS PONTOS)
    if (pontos > 0) {
        badge.textContent = `+${pontos} pts`;
        badge.style.backgroundColor = '#27ae60';
        badge.style.color = 'white';
    } else if (pontos < 0) {
        badge.textContent = `${pontos} pts`;
        badge.style.backgroundColor = '#e74c3c';
        badge.style.color = 'white';
    } else {
        badge.textContent = '0 pts';
        badge.style.backgroundColor = '#3498db';
        badge.style.color = 'white';
    }
    
    console.log('✅ Badge atualizado:', badge.textContent);
    
    // ATUALIZAR DISPLAY (NOME E DESCRIÇÃO)
    let nome, reacao, desc, icone, cor;
    
    switch(pontos) {
        case -24:
            nome = "Horrendo"; reacao = "-6"; desc = "Indescritivelmente monstruoso ou repugnante";
            icone = "fas fa-skull-crossbones"; cor = "#8B0000"; break;
        case -20:
            nome = "Monstruoso"; reacao = "-5"; desc = "Horrível e obviamente anormal";
            icone = "fas fa-ghost"; cor = "#DC143C"; break;
        case -16:
            nome = "Hediondo"; reacao = "-4"; desc = "Característica repugnante na aparência";
            icone = "fas fa-meh-rolling-eyes"; cor = "#FF4500"; break;
        case -8:
            nome = "Feio"; reacao = "-2"; desc = "Cabelo seboso, dentes tortos, etc.";
            icone = "fas fa-meh"; cor = "#FF6347"; break;
        case -4:
            nome = "Sem Atrativos"; reacao = "-1"; desc = "Algo antipático, mas não específico";
            icone = "fas fa-meh-blank"; cor = "#FFA500"; break;
        case 0:
            nome = "Comum"; reacao = "+0"; desc = "Aparência padrão, sem modificadores";
            icone = "fas fa-user"; cor = "#3498db"; break;
        case 4:
            nome = "Atraente"; reacao = "+1"; desc = "Boa aparência, +1 em testes de reação";
            icone = "fas fa-smile"; cor = "#2ecc71"; break;
        case 12:
            nome = "Elegante"; reacao = "+3"; desc = "Poderia entrar em concursos de beleza";
            icone = "fas fa-grin-stars"; cor = "#1abc9c"; break;
        case 16:
            nome = "Muito Elegante"; reacao = "+4"; desc = "Poderia vencer concursos de beleza";
            icone = "fas fa-crown"; cor = "#9b59b6"; break;
        case 20:
            nome = "Lindo"; reacao = "+5"; desc = "Espécime ideal, aparência divina";
            icone = "fas fa-star"; cor = "#f1c40f"; break;
        default:
            nome = "Comum"; reacao = "+0"; desc = "Aparência padrão";
            icone = "fas fa-user"; cor = "#3498db";
    }
    
    display.innerHTML = `
        <div class="display-header">
            <i class="${icone}" style="color: ${cor}"></i>
            <div>
                <strong style="color: ${cor}">${nome}</strong>
                <small style="color: ${cor}">Reação: ${reacao}</small>
            </div>
        </div>
        <p class="display-desc">${desc}</p>
    `;
    
    console.log('✅ Display atualizado:', nome);
}

// Inicializar automaticamente se já estiver na tab
setTimeout(() => {
    const tabAtiva = document.querySelector('#caracteristicas.tab-pane.active');
    if (tabAtiva) {
        console.log('🔍 Tab características já está ativa');
        iniciarAparencia();
    }
}, 2000);

console.log('✅ Script carregado');