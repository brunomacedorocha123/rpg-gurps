// SISTEMA DE RIQUEZA - CÓDIGO DIRETO E FUNCIONAL
(function() {
    console.log('🔥 INICIANDO SISTEMA DE RIQUEZA');
    
    // Esperar DOM carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100);
    }
    
    function init() {
        console.log('🎯 Inicializando...');
        
        // Elementos ESSENCIAIS
        const elementos = {
            select: document.getElementById('nivelRiqueza'),
            pontos: document.getElementById('pontosRiqueza'),
            mult: document.getElementById('multiplicadorRiqueza'),
            renda: document.getElementById('rendaMensal'),
            desc: document.getElementById('descricaoRiqueza')
        };
        
        // Log dos elementos encontrados
        console.log('📋 Elementos:', elementos);
        
        // Se não encontrar o select, procurar por qualquer select na seção de riqueza
        if (!elementos.select) {
            console.log('⚠️ Select não encontrado pelo ID, buscando alternativas...');
            const riquezaSection = document.querySelector('.riqueza-container');
            if (riquezaSection) {
                elementos.select = riquezaSection.querySelector('select');
                console.log('🔍 Select encontrado por query:', elementos.select);
            }
        }
        
        // Verificar se tem os elementos mínimos
        if (!elementos.select) {
            console.error('❌ ERRO CRÍTICO: Select de riqueza não encontrado!');
            console.error('📌 IDs procurados: nivelRiqueza');
            console.error('📌 HTML atual:', document.body.innerHTML.substring(0, 1000));
            return;
        }
        
        // Dados COMPLETOS da riqueza
        const dadosRiqueza = {
            '-25': { 
                pontos: "-25 pts", 
                multiplicador: "0.1x", 
                renda: "$0", 
                desc: "Falido - Sem recursos, dependendo da caridade" 
            },
            '-15': { 
                pontos: "-15 pts", 
                multiplicador: "0.3x", 
                renda: "$300", 
                desc: "Pobre - Recursos mínimos para sobrevivência" 
            },
            '-10': { 
                pontos: "-10 pts", 
                multiplicador: "0.6x", 
                renda: "$800", 
                desc: "Batalhador - Vive com dificuldade, mas se mantém" 
            },
            '0': { 
                pontos: "0 pts", 
                multiplicador: "1.0x", 
                renda: "$1.000", 
                desc: "Médio - Nível de recursos pré-definido padrão" 
            },
            '10': { 
                pontos: "+10 pts", 
                multiplicador: "2.0x", 
                renda: "$2.500", 
                desc: "Confortável - Vive bem, sem grandes preocupações financeiras" 
            },
            '20': { 
                pontos: "+20 pts", 
                multiplicador: "5.0x", 
                renda: "$8.000", 
                desc: "Rico - Recursos abundantes, estilo de vida luxuoso" 
            },
            '30': { 
                pontos: "+30 pts", 
                multiplicador: "10.0x", 
                renda: "$15.000", 
                desc: "Muito Rico - Fortuna considerável, influência econômica" 
            },
            '50': { 
                pontos: "+50 pts", 
                multiplicador: "25.0x", 
                renda: "$40.000", 
                desc: "Podre de Rico - Riqueza excepcional, poder econômico significativo" 
            }
        };
        
        // FUNÇÃO PRINCIPAL - Atualiza TUDO
        function atualizarRiqueza() {
            console.log('🔄 ATUALIZANDO RIQUEZA...');
            
            const valorSelecionado = elementos.select.value;
            console.log('📊 Valor selecionado:', valorSelecionado);
            
            const dados = dadosRiqueza[valorSelecionado];
            if (!dados) {
                console.error('❌ Dados não encontrados para valor:', valorSelecionado);
                return;
            }
            
            console.log('📈 Dados encontrados:', dados);
            
            // ATUALIZAR PONTOS
            if (elementos.pontos) {
                elementos.pontos.textContent = dados.pontos;
                console.log('✅ Pontos atualizados:', elementos.pontos.textContent);
                
                // Estilizar baseado no valor
                elementos.pontos.style.color = 
                    valorSelecionado >= '10' ? '#2ecc71' : 
                    valorSelecionado >= '0' ? '#f39c12' : 
                    '#e74c3c';
            }
            
            // ATUALIZAR MULTIPLICADOR
            if (elementos.mult) {
                elementos.mult.textContent = dados.multiplicador;
                console.log('✅ Multiplicador atualizado:', elementos.mult.textContent);
            }
            
            // ATUALIZAR RENDA
            if (elementos.renda) {
                elementos.renda.textContent = dados.renda;
                console.log('✅ Renda atualizada:', elementos.renda.textContent);
            }
            
            // ATUALIZAR DESCRIÇÃO
            if (elementos.desc) {
                elementos.desc.textContent = dados.desc;
                console.log('✅ Descrição atualizada:', elementos.desc.textContent);
            }
            
            // Efeito visual
            if (elementos.select) {
                elementos.select.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.5)';
                setTimeout(() => {
                    elementos.select.style.boxShadow = '';
                }, 300);
            }
            
            console.log('🎉 ATUALIZAÇÃO COMPLETA!');
        }
        
        // ADICIONAR EVENTO ao select
        elementos.select.addEventListener('change', atualizarRiqueza);
        console.log('✅ Evento "change" adicionado');
        
        // Atualizar IMEDIATAMENTE
        atualizarRiqueza();
        
        // Adicionar botões de controle
        adicionarControles();
        
        console.log('🚀 SISTEMA DE RIQUEZA INICIALIZADO COM SUCESSO!');
        
        // Forçar uma atualização extra depois de 1 segundo
        setTimeout(() => {
            console.log('🔄 Forçando atualização final...');
            atualizarRiqueza();
        }, 1000);
    }
    
    function adicionarControles() {
        const container = document.querySelector('.riqueza-container') || 
                         document.querySelector('.dashboard-section');
        
        if (!container) {
            console.log('⚠️ Container não encontrado para adicionar controles');
            return;
        }
        
        const controlesHTML = `
            <div style="
                margin-top: 15px;
                padding: 10px;
                background: rgba(0,0,0,0.3);
                border-radius: 5px;
                border: 1px solid gold;
            ">
                <div style="
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                    flex-wrap: wrap;
                    margin-bottom: 10px;
                ">
                    <button onclick="window.riquezaTeste('down')" style="
                        padding: 8px 15px;
                        background: linear-gradient(to bottom, #8B0000, #660000);
                        border: 1px solid #FF4444;
                        border-radius: 4px;
                        color: white;
                        cursor: pointer;
                        font-weight: bold;
                    ">
                        ▼ Mais Pobre
                    </button>
                    <button onclick="window.riquezaTeste('reset')" style="
                        padding: 8px 15px;
                        background: linear-gradient(to bottom, #D4AF37, #B8860B);
                        border: 1px solid gold;
                        border-radius: 4px;
                        color: black;
                        cursor: pointer;
                        font-weight: bold;
                    ">
                        ⏻ Reset
                    </button>
                    <button onclick="window.riquezaTeste('up')" style="
                        padding: 8px 15px;
                        background: linear-gradient(to bottom, #006400, #004d00);
                        border: 1px solid #00FF00;
                        border-radius: 4px;
                        color: white;
                        cursor: pointer;
                        font-weight: bold;
                    ">
                        ▲ Mais Rico
                    </button>
                </div>
                <div style="
                    text-align: center;
                    color: #D4AF37;
                    font-size: 12px;
                    border-top: 1px solid rgba(212, 175, 55, 0.3);
                    padding-top: 5px;
                ">
                    Sistema de Riqueza Ativo
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', controlesHTML);
        
        // Adicionar funções globais para os botões
        window.riquezaTeste = function(acao) {
            const select = document.getElementById('nivelRiqueza');
            const niveis = ['-25', '-15', '-10', '0', '10', '20', '30', '50'];
            const atual = select.value;
            const indexAtual = niveis.indexOf(atual);
            
            if (acao === 'up' && indexAtual < niveis.length - 1) {
                select.value = niveis[indexAtual + 1];
            } else if (acao === 'down' && indexAtual > 0) {
                select.value = niveis[indexAtual - 1];
            } else if (acao === 'reset') {
                select.value = '0';
            }
            
            // Disparar evento change
            select.dispatchEvent(new Event('change'));
        };
        
        console.log('✅ Controles adicionados');
    }
})();