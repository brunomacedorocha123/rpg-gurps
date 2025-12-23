// caracteristicas-aparencia.js - VERSÃO CORRIGIDA
console.log('🎭 SISTEMA DE APARÊNCIA - CARREGANDO');

class SistemaAparencia {
    constructor() {
        console.log('✅ SistemaAparencia criado');
        this.inicializado = false;
    }
    
    inicializar() {
        if (this.inicializado) {
            console.log('⚠️ Já estava inicializado');
            return;
        }
        
        console.log('🚀 Inicializando sistema de aparência...');
        
        // 1. PEGAR OS ELEMENTOS
        this.select = document.getElementById('nivelAparencia');
        this.badge = document.getElementById('pontosAparencia');
        this.display = document.getElementById('displayAparencia');
        
        console.log('🔍 Procurando elementos:', {
            select: this.select ? '✅' : '❌',
            badge: this.badge ? '✅' : '❌',
            display: this.display ? '✅' : '❌'
        });
        
        if (!this.select || !this.badge || !this.display) {
            console.log('⚠️ Elementos não encontrados, tentando novamente em 1s...');
            setTimeout(() => this.inicializar(), 1000);
            return;
        }
        
        console.log('✅ Todos elementos encontrados!');
        
        // 2. CONFIGURAR EVENTO DO SELECT
        this.select.addEventListener('change', (event) => {
            this.atualizarTudo();
        });
        
        // 3. INICIALIZAR COM VALOR ATUAL
        this.atualizarTudo();
        
        this.inicializado = true;
        console.log('🎉 Sistema de aparência INICIALIZADO!');
    }
    
    atualizarTudo() {
        if (!this.select) return;
        
        const valorTexto = this.select.value;
        console.log(`📊 Valor do select: "${valorTexto}"`);
        
        // Converter para número (tratar caso de valor vazio)
        const pontos = parseInt(valorTexto);
        
        console.log(`📈 Pontos calculados: ${pontos} (${isNaN(pontos) ? 'NaN - Vamos usar 0' : 'OK'})`);
        
        // Se for NaN, usar 0
        const pontosFinais = isNaN(pontos) ? 0 : pontos;
        
        // ATUALIZAR BADGE
        this.atualizarBadge(pontosFinais);
        
        // ATUALIZAR DISPLAY
        this.atualizarDisplay(pontosFinais);
        
        console.log('✅ Aparência atualizada!');
    }
    
    atualizarBadge(pontos) {
        if (!this.badge) return;
        
        console.log(`📛 Atualizando badge com: ${pontos} pontos`);
        
        // Garantir que pontos é um número
        const pontosNum = Number(pontos);
        
        // Formatar texto
        let texto;
        if (pontosNum > 0) {
            texto = `+${pontosNum} pts`;
        } else if (pontosNum < 0) {
            texto = `${pontosNum} pts`;
        } else {
            texto = `0 pts`;
        }
        
        // Atualizar texto
        this.badge.textContent = texto;
        console.log(`✅ Badge texto: ${texto}`);
        
        // Mudar cores
        if (pontosNum > 0) {
            this.badge.style.backgroundColor = '#2ecc71';
            this.badge.style.color = 'white';
        } else if (pontosNum < 0) {
            this.badge.style.backgroundColor = '#e74c3c';
            this.badge.style.color = 'white';
        } else {
            this.badge.style.backgroundColor = '#3498db';
            this.badge.style.color = 'white';
        }
    }
    
    atualizarDisplay(pontos) {
        if (!this.display) return;
        
        console.log(`🖥️ Atualizando display com: ${pontos} pontos`);
        
        // Dados baseados nos pontos
        let dados;
        
        switch(pontos) {
            case -24:
                dados = { nome: "Horrendo", reacao: "-6", desc: "Indescritivelmente monstruoso ou repugnante", icone: "fas fa-skull-crossbones", cor: "#8B0000" };
                break;
            case -20:
                dados = { nome: "Monstruoso", reacao: "-5", desc: "Horrível e obviamente anormal", icone: "fas fa-ghost", cor: "#DC143C" };
                break;
            case -16:
                dados = { nome: "Hediondo", reacao: "-4", desc: "Característica repugnante na aparência", icone: "fas fa-meh-rolling-eyes", cor: "#FF4500" };
                break;
            case -8:
                dados = { nome: "Feio", reacao: "-2", desc: "Cabelo seboso, dentes tortos, etc.", icone: "fas fa-meh", cor: "#FF6347" };
                break;
            case -4:
                dados = { nome: "Sem Atrativos", reacao: "-1", desc: "Algo antipático, mas não específico", icone: "fas fa-meh-blank", cor: "#FFA500" };
                break;
            case 0:
                dados = { nome: "Comum", reacao: "+0", desc: "Aparência padrão, sem modificadores", icone: "fas fa-user", cor: "#3498db" };
                break;
            case 4:
                dados = { nome: "Atraente", reacao: "+1", desc: "Boa aparência, +1 em testes de reação", icone: "fas fa-smile", cor: "#2ecc71" };
                break;
            case 12:
                dados = { nome: "Elegante", reacao: "+3", desc: "Poderia entrar em concursos de beleza", icone: "fas fa-grin-stars", cor: "#1abc9c" };
                break;
            case 16:
                dados = { nome: "Muito Elegante", reacao: "+4", desc: "Poderia vencer concursos de beleza", icone: "fas fa-crown", cor: "#9b59b6" };
                break;
            case 20:
                dados = { nome: "Lindo", reacao: "+5", desc: "Espécime ideal, aparência divina", icone: "fas fa-star", cor: "#f1c40f" };
                break;
            default:
                dados = { nome: "Comum", reacao: "+0", desc: "Aparência padrão", icone: "fas fa-user", cor: "#3498db" };
        }
        
        console.log(`📋 Dados do nível: ${dados.nome}`);
        
        // Atualizar HTML
        this.display.innerHTML = `
            <div class="display-header">
                <i class="${dados.icone}" style="color: ${dados.cor}; font-size: 1.8em;"></i>
                <div>
                    <strong style="color: ${dados.cor}; font-size: 1.2em;">${dados.nome}</strong>
                    <small style="color: ${dados.cor}; margin-left: 10px;">Reação: ${dados.reacao}</small>
                </div>
            </div>
            <p class="display-desc" style="margin-top: 10px; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 5px; border-left: 3px solid ${dados.cor}">
                ${dados.desc}
            </p>
        `;
    }
}

// ========================
// INICIALIZAÇÃO
// ========================

window.sistemaAparencia = new SistemaAparencia();

// Quando DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado');
});

// Quando clicar na tab características
document.addEventListener('click', function(event) {
    const tabBtn = event.target.closest('.tab-btn[data-tab="caracteristicas"]');
    if (tabBtn) {
        console.log('🎯 Clicou na tab características');
        setTimeout(() => {
            if (window.sistemaAparencia) {
                window.sistemaAparencia.inicializar();
            }
        }, 300);
    }
});

// Inicializar automaticamente
setTimeout(function() {
    const tabAtiva = document.querySelector('#caracteristicas.tab-pane.active');
    if (tabAtiva && window.sistemaAparencia) {
        console.log('🔍 Tab características já ativa, inicializando...');
        window.sistemaAparencia.inicializar();
    }
}, 1500);

console.log('✅ Sistema de aparência pronto!');