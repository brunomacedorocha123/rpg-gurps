// caracteristicas-aparencia.js - VERSÃO QUE FUNCIONA DE VERDADE
class SistemaAparencia {
    constructor() {
        console.log('🎭 SISTEMA APARÊNCIA INICIADO - PRONTO PRA TRABALHAR');
        
        // CONFIGURAÇÃO COMPLETA DOS NÍVEIS
        this.niveisAparencia = {
            "-24": { 
                nome: "Horrendo", 
                pontos: -24, 
                reacao: "-6",
                desc: "Indescritivelmente monstruoso ou repugnante",
                icone: "fas fa-skull-crossbones",
                cor: "#8B0000"
            },
            "-20": { 
                nome: "Monstruoso", 
                pontos: -20, 
                reacao: "-5",
                desc: "Horrível e obviamente anormal",
                icone: "fas fa-ghost",
                cor: "#DC143C"
            },
            "-16": { 
                nome: "Hediondo", 
                pontos: -16, 
                reacao: "-4",
                desc: "Característica repugnante na aparência",
                icone: "fas fa-meh-rolling-eyes",
                cor: "#FF4500"
            },
            "-8": { 
                nome: "Feio", 
                pontos: -8, 
                reacao: "-2",
                desc: "Cabelo seboso, dentes tortos, etc.",
                icone: "fas fa-meh",
                cor: "#FF6347"
            },
            "-4": { 
                nome: "Sem Atrativos", 
                pontos: -4, 
                reacao: "-1",
                desc: "Algo antipático, mas não específico",
                icone: "fas fa-meh-blank",
                cor: "#FFA500"
            },
            "0": { 
                nome: "Comum", 
                pontos: 0, 
                reacao: "+0",
                desc: "Aparência padrão, sem modificadores",
                icone: "fas fa-user",
                cor: "#3498db"
            },
            "4": { 
                nome: "Atraente", 
                pontos: 4, 
                reacao: "+1",
                desc: "Boa aparência, +1 em testes de reação",
                icone: "fas fa-smile",
                cor: "#2ecc71"
            },
            "12": { 
                nome: "Elegante", 
                pontos: 12, 
                reacao: "+3",
                desc: "Poderia entrar em concursos de beleza",
                icone: "fas fa-grin-stars",
                cor: "#1abc9c"
            },
            "16": { 
                nome: "Muito Elegante", 
                pontos: 16, 
                reacao: "+4",
                desc: "Poderia vencer concursos de beleza",
                icone: "fas fa-crown",
                cor: "#9b59b6"
            },
            "20": { 
                nome: "Lindo", 
                pontos: 20, 
                reacao: "+5",
                desc: "Espécime ideal, aparência divina",
                icone: "fas fa-star",
                cor: "#f1c40f"
            }
        };
        
        // ESTADO ATUAL
        this.pontosAtuais = 0;
        this.nivelAtual = "Comum";
        this.inicializado = false;
        
        console.log('✅ Configuração carregada - ' + Object.keys(this.niveisAparencia).length + ' níveis disponíveis');
    }

    inicializar() {
        if (this.inicializado) {
            console.log('⚠️ Sistema já inicializado');
            return;
        }
        
        console.log('🚀 INICIALIZANDO SISTEMA APARÊNCIA...');
        
        try {
            // 1. CAPTURAR ELEMENTOS CRÍTICOS
            this.selectAparencia = document.getElementById('nivelAparencia');
            this.badgePontos = document.getElementById('pontosAparencia');
            this.displayAparencia = document.getElementById('displayAparencia');
            
            if (!this.selectAparencia || !this.badgePontos || !this.displayAparencia) {
                console.error('❌ ELEMENTOS NÃO ENCONTRADOS!');
                console.log('- selectAparencia:', !!this.selectAparencia);
                console.log('- badgePontos:', !!this.badgePontos);
                console.log('- displayAparencia:', !!this.displayAparencia);
                return;
            }
            
            console.log('✅ Elementos capturados com sucesso');
            
            // 2. CONFIGURAR EVENTO NO SELECT
            this.selectAparencia.addEventListener('change', (e) => {
                console.log('🔄 Evento change disparado - valor:', e.target.value);
                this.atualizarSistema(e.target.value);
            });
            
            // 3. CONFIGURAR VALOR INICIAL
            const valorInicial = this.selectAparencia.value;
            console.log('📊 Valor inicial:', valorInicial);
            this.atualizarSistema(valorInicial);
            
            // 4. CRIAR ELEMENTO DE DEBUG (OPCIONAL)
            this.criarDebugPanel();
            
            this.inicializado = true;
            console.log('🎉 SISTEMA APARÊNCIA INICIALIZADO COM SUCESSO!');
            
        } catch (error) {
            console.error('💥 ERRO NA INICIALIZAÇÃO:', error);
        }
    }

    atualizarSistema(valor) {
        console.log('🔄 Atualizando sistema com valor:', valor);
        
        const nivel = this.niveisAparencia[valor];
        if (!nivel) {
            console.error('❌ Nível não encontrado para valor:', valor);
            return;
        }
        
        // ATUALIZAR ESTADO
        this.pontosAtuais = nivel.pontos;
        this.nivelAtual = nivel.nome;
        
        console.log(`📈 Nível: ${nivel.nome}, Pontos: ${nivel.pontos}, Reação: ${nivel.reacao}`);
        
        // EXECUTAR TODAS AS ATUALIZAÇÕES
        this.atualizarBadge();
        this.atualizarDisplay();
        this.atualizarTotalGeral();
        this.dispararEventos();
        
        console.log('✅ Atualização completa');
    }

    atualizarBadge() {
        if (!this.badgePontos) return;
        
        const nivel = this.niveisAparencia[this.pontosAtuais];
        if (!nivel) return;
        
        const pontos = nivel.pontos;
        const textoPontos = pontos >= 0 ? `+${pontos} pts` : `${pontos} pts`;
        
        // Atualizar texto
        this.badgePontos.textContent = textoPontos;
        
        // Atualizar cores
        if (pontos > 0) {
            // POSITIVO - Verde
            this.badgePontos.style.background = 'linear-gradient(135deg, rgba(46, 204, 113, 0.2), rgba(39, 174, 96, 0.3))';
            this.badgePontos.style.border = '2px solid #2ecc71';
            this.badgePontos.style.color = '#2ecc71';
            this.badgePontos.style.textShadow = '0 0 10px rgba(46, 204, 113, 0.3)';
        } else if (pontos < 0) {
            // NEGATIVO - Vermelho
            this.badgePontos.style.background = 'linear-gradient(135deg, rgba(231, 76, 60, 0.2), rgba(192, 57, 43, 0.3))';
            this.badgePontos.style.border = '2px solid #e74c3c';
            this.badgePontos.style.color = '#e74c3c';
            this.badgePontos.style.textShadow = '0 0 10px rgba(231, 76, 60, 0.3)';
        } else {
            // NEUTRO - Azul
            this.badgePontos.style.background = 'linear-gradient(135deg, rgba(52, 152, 219, 0.2), rgba(41, 128, 185, 0.3))';
            this.badgePontos.style.border = '2px solid #3498db';
            this.badgePontos.style.color = '#3498db';
            this.badgePontos.style.textShadow = '0 0 10px rgba(52, 152, 219, 0.3)';
        }
        
        console.log('📛 Badge atualizado:', textoPontos);
    }

    atualizarDisplay() {
        if (!this.displayAparencia) return;
        
        const nivel = this.niveisAparencia[this.pontosAtuais];
        if (!nivel) return;
        
        console.log('🖥️ Atualizando display com:', nivel.nome);
        
        // Atualizar ícone
        const icone = this.displayAparencia.querySelector('.display-header i');
        if (icone) {
            icone.className = nivel.icone;
            icone.style.color = nivel.cor;
            icone.style.transition = 'all 0.3s ease';
            icone.style.fontSize = '1.8em';
        }
        
        // Atualizar título
        const titulo = this.displayAparencia.querySelector('.display-header strong');
        if (titulo) {
            titulo.textContent = nivel.nome;
            titulo.style.color = nivel.cor;
            titulo.style.transition = 'color 0.3s ease';
        }
        
        // Atualizar reação
        const reacao = this.displayAparencia.querySelector('.display-header small');
        if (reacao) {
            reacao.textContent = `Reação: ${nivel.reacao}`;
            
            // Colorir baseado no valor
            if (nivel.reacao.startsWith('+')) {
                reacao.style.color = '#2ecc71';
            } else if (nivel.reacao.startsWith('-')) {
                reacao.style.color = '#e74c3c';
            } else {
                reacao.style.color = '#3498db';
            }
        }
        
        // Atualizar descrição
        const desc = this.displayAparencia.querySelector('.display-desc');
        if (desc) {
            desc.textContent = nivel.desc;
            desc.style.color = '#ecf0f1';
            desc.style.padding = '10px';
            desc.style.borderRadius = '5px';
            desc.style.background = 'rgba(0, 0, 0, 0.2)';
            desc.style.borderLeft = `3px solid ${nivel.cor}`;
        }
        
        // Efeito visual
        this.displayAparencia.style.transition = 'all 0.5s ease';
        this.displayAparencia.style.transform = 'scale(1.02)';
        setTimeout(() => {
            this.displayAparencia.style.transform = 'scale(1)';
        }, 300);
    }

    atualizarTotalGeral() {
        // PROCURAR POR ELEMENTOS QUE MOSTRAM O TOTAL
        
        // 1. No card da página principal
        const cardsTotais = [
            'totalPontosAparencia',
            'totalPontos',
            'pontuacaoTotal',
            'resumoPontos'
        ];
        
        cardsTotais.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                const pontos = this.pontosAtuais;
                elemento.textContent = pontos >= 0 ? `+${pontos} pts` : `${pontos} pts`;
                elemento.style.color = pontos >= 0 ? '#2ecc71' : '#e74c3c';
                elemento.style.fontWeight = 'bold';
                console.log(`💰 Total atualizado no elemento #${id}: ${pontos} pts`);
            }
        });
        
        // 2. Se não encontrar, criar um display
        if (!document.getElementById('displayTotalAparencia')) {
            this.criarDisplayTotal();
        } else {
            const display = document.getElementById('displayTotalAparencia');
            const pontos = this.pontosAtuais;
            display.textContent = `Aparência: ${pontos >= 0 ? '+' : ''}${pontos} pts`;
            display.style.color = pontos >= 0 ? '#2ecc71' : '#e74c3c';
        }
    }

    criarDisplayTotal() {
        // Criar um display flutuante se não existir
        const display = document.createElement('div');
        display.id = 'displayTotalAparencia';
        display.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            border: 2px solid #3498db;
            font-size: 1.2em;
            font-weight: bold;
            z-index: 9999;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            transition: all 0.3s ease;
        `;
        
        const pontos = this.pontosAtuais;
        display.textContent = `Aparência: ${pontos >= 0 ? '+' : ''}${pontos} pts`;
        display.style.color = pontos >= 0 ? '#2ecc71' : '#e74c3c';
        display.style.borderColor = pontos >= 0 ? '#2ecc71' : '#e74c3c';
        
        document.body.appendChild(display);
        console.log('📍 Display total criado');
    }

    dispararEventos() {
        const nivel = this.niveisAparencia[this.pontosAtuais];
        if (!nivel) return;
        
        // Evento personalizado para outros componentes
        const evento = new CustomEvent('aparenciaAlterada', {
            detail: {
                pontos: nivel.pontos,
                nivel: nivel.nome,
                reacao: nivel.reacao,
                timestamp: new Date().toISOString(),
                elementoId: 'nivelAparencia'
            },
            bubbles: true,
            cancelable: true
        });
        
        document.dispatchEvent(evento);
        console.log('📡 Evento disparado:', evento.detail);
        
        // Também atualiza o localStorage
        this.salvarNoStorage();
    }

    salvarNoStorage() {
        const dados = {
            pontos: this.pontosAtuais,
            nivel: this.nivelAtual,
            ultimaAtualizacao: new Date().toISOString()
        };
        
        localStorage.setItem('aparenciaConfig', JSON.stringify(dados));
        console.log('💾 Dados salvos no localStorage');
    }

    criarDebugPanel() {
        // Painel de debug (remove em produção)
        if (document.getElementById('debugAparencia')) return;
        
        const debug = document.createElement('div');
        debug.id = 'debugAparencia';
        debug.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.9);
            color: #0f0;
            padding: 15px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 9999;
            max-width: 300px;
            border: 1px solid #0f0;
            display: none;
        `;
        
        debug.innerHTML = `
            <h4 style="margin: 0 0 10px 0; color: #0f0;">DEBUG APARÊNCIA</h4>
            <div>Status: <span id="debugStatus">Ativo</span></div>
            <div>Pontos: <span id="debugPontos">0</span></div>
            <div>Nível: <span id="debugNivel">Comum</span></div>
            <div>Inicializado: <span id="debugInicializado">Sim</span></div>
            <button onclick="document.getElementById('debugAparencia').style.display='none'" 
                    style="margin-top: 10px; background: #f00; color: white; border: none; padding: 5px 10px;">
                Fechar
            </button>
        `;
        
        document.body.appendChild(debug);
        
        // Tecla de atalho para debug (Ctrl+Shift+A)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                debug.style.display = debug.style.display === 'none' ? 'block' : 'none';
            }
        });
        
        // Atualizar debug em tempo real
        setInterval(() => {
            document.getElementById('debugPontos').textContent = this.pontosAtuais;
            document.getElementById('debugNivel').textContent = this.nivelAtual;
        }, 1000);
    }

    // GETTERS
    getPontos() {
        return this.pontosAtuais;
    }

    getNivel() {
        return this.nivelAtual;
    }

    getDetalhes() {
        const nivel = this.niveisAparencia[this.pontosAtuais];
        return nivel || null;
    }
}

// ================ INICIALIZAÇÃO AUTOMÁTICA ================
console.log('📦 Carregando SistemaAparencia...');

// Criar instância global
window.sistemaAparencia = new SistemaAparencia();

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM Carregado - Inicializando sistema...');
    setTimeout(() => {
        window.sistemaAparencia.inicializar();
    }, 100);
});

// Também inicializar quando clicar na aba
document.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-tab="caracteristicas"]');
    if (tab) {
        console.log('🎯 Aba características clicada');
        setTimeout(() => {
            if (window.sistemaAparencia && !window.sistemaAparencia.inicializado) {
                window.sistemaAparencia.inicializar();
            }
        }, 200);
    }
});

// Inicialização de segurança
setTimeout(() => {
    if (window.sistemaAparencia && !window.sistemaAparencia.inicializado) {
        console.log('🕐 Inicialização de segurança após 3 segundos');
        window.sistemaAparencia.inicializar();
    }
}, 3000);

console.log('✅ SistemaAparencia carregado e pronto para uso!');