// caracteristicas-aparencia.js - VERSÃO CORRIGIDA PARA HTML NOVO
console.log('🎭 CARREGANDO SISTEMA DE APARÊNCIA - VERSÃO ATUALIZADA');

class SistemaAparencia {
    constructor() {
        console.log('⚙️ SistemaAparencia criado');
        
        // Configuração dos níveis - VERSÃO SIMPLIFICADA
        this.niveisAparencia = {
            "-24": { nome: "Horrendo", pontos: -24, reacao: "-6", desc: "Indescritivelmente monstruoso ou repugnante", icone: "fas fa-skull-crossbones", cor: "#8B0000" },
            "-20": { nome: "Monstruoso", pontos: -20, reacao: "-5", desc: "Horrível e obviamente anormal", icone: "fas fa-ghost", cor: "#DC143C" },
            "-16": { nome: "Hediondo", pontos: -16, reacao: "-4", desc: "Característica repugnante na aparência", icone: "fas fa-meh-rolling-eyes", cor: "#FF4500" },
            "-8": { nome: "Feio", pontos: -8, reacao: "-2", desc: "Cabelo seboso, dentes tortos, etc.", icone: "fas fa-meh", cor: "#FF6347" },
            "-4": { nome: "Sem Atrativos", pontos: -4, reacao: "-1", desc: "Algo antipático, mas não específico", icone: "fas fa-meh-blank", cor: "#FFA500" },
            "0": { nome: "Comum", pontos: 0, reacao: "+0", desc: "Aparência padrão, sem modificadores", icone: "fas fa-user", cor: "#3498db" },
            "4": { nome: "Atraente", pontos: 4, reacao: "+1", desc: "Boa aparência, +1 em testes de reação", icone: "fas fa-smile", cor: "#2ecc71" },
            "12": { nome: "Elegante", pontos: 12, reacao: "+3", desc: "Poderia entrar em concursos de beleza", icone: "fas fa-grin-stars", cor: "#1abc9c" },
            "16": { nome: "Muito Elegante", pontos: 16, reacao: "+4", desc: "Poderia vencer concursos de beleza", icone: "fas fa-crown", cor: "#9b59b6" },
            "20": { nome: "Lindo", pontos: 20, reacao: "+5", desc: "Espécime ideal, aparência divina", icone: "fas fa-star", cor: "#f1c40f" }
        };
        
        this.pontosAtuais = 0;
        this.nivelAtual = "Comum";
        this.inicializado = false;
        
        console.log('✅ Configuração carregada');
    }

    inicializar() {
        if (this.inicializado) {
            console.log('⚠️ Já inicializado');
            return;
        }
        
        console.log('🚀 INICIALIZANDO SISTEMA...');
        
        try {
            // CAPTURAR ELEMENTOS DO HTML ATUAL
            this.selectAparencia = document.getElementById('nivelAparencia');
            this.badgePontos = document.getElementById('pontosAparencia');
            this.displayAparencia = document.getElementById('displayAparencia');
            
            console.log('🔍 Procurando elementos:');
            console.log('- Select:', !!this.selectAparencia);
            console.log('- Badge:', !!this.badgePontos);
            console.log('- Display:', !!this.displayAparencia);
            
            // VERIFICAR SE ELEMENTOS EXISTEM
            if (!this.selectAparencia) {
                console.error('❌ SELECT não encontrado! Procurando alternativas...');
                this.selectAparencia = document.querySelector('select[id*="aparencia"], select[name*="aparencia"]');
                console.log('Select alternativo:', !!this.selectAparencia);
            }
            
            if (!this.badgePontos) {
                console.error('❌ BADGE não encontrado!');
            }
            
            if (!this.displayAparencia) {
                console.error('❌ DISPLAY não encontrado!');
            }
            
            if (!this.selectAparencia || !this.badgePontos || !this.displayAparencia) {
                console.error('❌ Não é possível inicializar - elementos faltando');
                return;
            }
            
            console.log('✅ Elementos encontrados com sucesso');
            
            // CONFIGURAR EVENTO NO SELECT
            this.selectAparencia.addEventListener('change', (e) => {
                console.log('🔄 Select alterado - Valor:', e.target.value);
                this.atualizarTudo(e.target.value);
            });
            
            // CONFIGURAR VALOR INICIAL
            const valorInicial = this.selectAparencia.value;
            console.log('📊 Valor inicial do select:', valorInicial);
            this.atualizarTudo(valorInicial);
            
            this.inicializado = true;
            console.log('🎉 SISTEMA INICIALIZADO COM SUCESSO!');
            
        } catch (error) {
            console.error('💥 ERRO NA INICIALIZAÇÃO:', error);
        }
    }

    atualizarTudo(valor) {
        console.log('🔄 Atualizando tudo com valor:', valor);
        
        // Obter dados do nível
        const nivel = this.niveisAparencia[valor];
        if (!nivel) {
            console.error('❌ Nível não encontrado para valor:', valor);
            return;
        }
        
        console.log('📈 Nível encontrado:', nivel.nome);
        
        // Atualizar estado
        this.pontosAtuais = nivel.pontos;
        this.nivelAtual = nivel.nome;
        
        // Executar atualizações
        this.atualizarBadge(nivel);
        this.atualizarDisplay(nivel);
        
        console.log('✅ Atualização completa');
    }

    atualizarBadge(nivel) {
        if (!this.badgePontos) return;
        
        const pontos = nivel.pontos;
        const textoPontos = pontos >= 0 ? `+${pontos} pts` : `${pontos} pts`;
        
        // Atualizar texto
        this.badgePontos.textContent = textoPontos;
        
        // Atualizar cores
        if (pontos > 0) {
            this.badgePontos.style.background = '#27ae60';
            this.badgePontos.style.color = 'white';
            this.badgePontos.style.borderColor = '#2ecc71';
        } else if (pontos < 0) {
            this.badgePontos.style.background = '#e74c3c';
            this.badgePontos.style.color = 'white';
            this.badgePontos.style.borderColor = '#c0392b';
        } else {
            this.badgePontos.style.background = '#3498db';
            this.badgePontos.style.color = 'white';
            this.badgePontos.style.borderColor = '#2980b9';
        }
        
        console.log('📛 Badge atualizado:', textoPontos);
    }

    atualizarDisplay(nivel) {
        if (!this.displayAparencia) return;
        
        console.log('🖥️ Atualizando display...');
        
        // CRIAR HTML PARA O DISPLAY ATUAL
        // Seu HTML atual tem esta estrutura:
        // <div class="aparencia-display" id="displayAparencia">
        //     <div class="display-header">
        //         <i class="fas fa-user-circle"></i>
        //         <div>
        //             <strong>Comum</strong>
        //             <small>Reação: +0</small>
        //         </div>
        //     </div>
        //     <p class="display-desc">Aparência padrão, sem modificadores</p>
        // </div>
        
        const html = `
            <div class="display-header">
                <i class="${nivel.icone}" style="color: ${nivel.cor}; font-size: 1.8em;"></i>
                <div>
                    <strong style="color: ${nivel.cor}; font-size: 1.2em;">${nivel.nome}</strong>
                    <small style="color: ${nivel.cor}; margin-left: 10px;">Reação: ${nivel.reacao}</small>
                </div>
            </div>
            <p class="display-desc" style="margin-top: 10px; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 5px; border-left: 3px solid ${nivel.cor}">
                ${nivel.desc}
            </p>
        `;
        
        // Aplicar HTML ao display
        this.displayAparencia.innerHTML = html;
        
        console.log('✅ Display atualizado com:', nivel.nome);
    }

    // GETTERS simples
    getPontos() {
        return this.pontosAtuais;
    }

    getNivel() {
        return this.nivelAtual;
    }

    getDetalhes() {
        return this.niveisAparencia[this.pontosAtuais];
    }
}

// ================ INICIALIZAÇÃO AUTOMÁTICA ================
console.log('📦 Criando instância global do SistemaAparencia');

// Criar instância global
window.sistemaAparencia = new SistemaAparencia();

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM Carregado - Preparando inicialização...');
});

// Inicializar quando clicar na tab características
document.addEventListener('click', (e) => {
    const tabBtn = e.target.closest('.tab-btn[data-tab="caracteristicas"]');
    if (tabBtn) {
        console.log('🎯 Clicou na tab características');
        setTimeout(() => {
            if (window.sistemaAparencia && !window.sistemaAparencia.inicializado) {
                window.sistemaAparencia.inicializar();
            } else if (window.sistemaAparencia) {
                console.log('⚠️ Sistema já inicializado, apenas verificando...');
                // Verificar se elementos ainda estão válidos
                window.sistemaAparencia.atualizarTudo(window.sistemaAparencia.selectAparencia?.value || "0");
            }
        }, 300);
    }
});

// Inicializar se já estiver na tab características
setTimeout(() => {
    const tabAtiva = document.querySelector('#caracteristicas.tab-pane.active');
    if (tabAtiva && window.sistemaAparencia && !window.sistemaAparencia.inicializado) {
        console.log('🔍 Tab características já está ativa, inicializando...');
        window.sistemaAparencia.inicializar();
    }
}, 1500);

// Inicialização de segurança (após 3 segundos)
setTimeout(() => {
    if (window.sistemaAparencia && !window.sistemaAparencia.inicializado) {
        console.log('🕐 Inicialização de segurança após 3 segundos');
        window.sistemaAparencia.inicializar();
    }
}, 3000);

console.log('✅ SistemaAparencia carregado e pronto para inicialização');