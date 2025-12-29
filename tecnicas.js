// TECNICAS-CORRETO.js - SISTEMA QUE FUNCIONA
console.log("🔥 TÉCNICAS - SISTEMA INICIADO");

// DADOS DA TÉCNICA
const TECNICA_ARQUEARIA = {
    id: "arquearia-montada",
    nome: "Arquearia Montada",
    descricao: "Atirar com arco enquanto cavalga. Penalidade base de -4.",
    prereq: "Arco e Cavalgar",
    dificuldade: "Difícil"
};

// ===== 1. INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM Carregado");
    
    // Configurar clique nas abas
    const botoes = document.querySelectorAll('.subtab-btn-pericias');
    botoes.forEach(botao => {
        botao.addEventListener('click', function() {
            if (this.dataset.subtab === 'tecnicas') {
                console.log("🎯 Clicou em Técnicas");
                setTimeout(carregarTecnica, 100);
            }
        });
    });
    
    // Se já estiver na aba, carregar agora
    const abaTecnicas = document.getElementById('subtab-tecnicas');
    if (abaTecnicas && abaTecnicas.classList.contains('active')) {
        carregarTecnica();
    }
});

// ===== 2. CARREGAR A TÉCNICA =====
function carregarTecnica() {
    console.log("🚀 Carregando técnica...");
    
    const container = document.getElementById('lista-tecnicas');
    if (!container) {
        console.error("❌ Container não encontrado!");
        return;
    }
    
    console.log("✅ Container encontrado!");
    
    // Limpar e adicionar técnica
    container.innerHTML = '';
    container.appendChild(criarCardTecnica());
}

// ===== 3. CRIAR CARD DA TÉCNICA =====
function criarCardTecnica() {
    const card = document.createElement('div');
    card.className = 'tecnica-item';
    
    card.innerHTML = `
        <div style="padding: 20px; background: rgba(44, 32, 8, 0.8); border-radius: 8px; border: 1px solid #8B4513;">
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                <i class="fas fa-horse" style="font-size: 2em; color: #D4AF37;"></i>
                <div>
                    <h3 style="margin: 0; color: #D4AF37;">🏹 ${TECNICA_ARQUEARIA.nome}</h3>
                    <div style="display: flex; gap: 10px; margin-top: 5px;">
                        <span style="background: #8B0000; color: white; padding: 3px 10px; border-radius: 4px; font-size: 0.8em;">
                            ${TECNICA_ARQUEARIA.dificuldade}
                        </span>
                        <span style="color: #DEB887; font-size: 0.9em;">
                            Pré-requisito: ${TECNICA_ARQUEARIA.prereq}
                        </span>
                    </div>
                </div>
            </div>
            
            <p style="color: #F5DEB3; line-height: 1.5; margin-bottom: 20px;">
                ${TECNICA_ARQUEARIA.descricao}
            </p>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0;">
                <div style="text-align: center; padding: 10px; background: rgba(139, 0, 0, 0.2); border-radius: 6px;">
                    <div style="color: #B8860B; font-size: 0.9em;">Custo por Nível</div>
                    <div style="color: #D4AF37; font-weight: bold; font-size: 1.2em;">2 pontos</div>
                </div>
                <div style="text-align: center; padding: 10px; background: rgba(139, 0, 0, 0.2); border-radius: 6px;">
                    <div style="color: #B8860B; font-size: 0.9em;">Níveis Máximos</div>
                    <div style="color: #D4AF37; font-weight: bold; font-size: 1.2em;">+4</div>
                </div>
                <div style="text-align: center; padding: 10px; background: rgba(139, 0, 0, 0.2); border-radius: 6px;">
                    <div style="color: #B8860B; font-size: 0.9em;">Limite</div>
                    <div style="color: #D4AF37; font-weight: bold; font-size: 0.9em;">Não excede NH em Arco</div>
                </div>
            </div>
            
            <button onclick="abrirModalTecnica()" 
                    style="width: 100%; padding: 12px; background: linear-gradient(to right, #228B22, #006400); color: white; border: none; border-radius: 6px; font-family: 'Cinzel', serif; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 1em;"
                    onmouseover="this.style.transform='scale(1.02)'" 
                    onmouseout="this.style.transform='scale(1)'">
                <i class="fas fa-shopping-cart"></i>
                ADQUIRIR TÉCNICA
            </button>
        </div>
    `;
    
    return card;
}

// ===== 4. MODAL DE AQUISIÇÃO =====
function abrirModalTecnica() {
    console.log("📖 Abrindo modal...");
    
    // Criar overlay do modal
    const overlay = document.createElement('div');
    overlay.id = 'modal-tecnica-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    // Conteúdo do modal
    overlay.innerHTML = `
        <div style="background: linear-gradient(145deg, #2C2008, #1A1200); border: 3px solid #D4AF37; border-radius: 15px; width: 90%; max-width: 500px; padding: 25px; color: #F5DEB3;">
            <!-- CABEÇALHO -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #D4AF37;">
                <h3 style="margin: 0; color: #D4AF37; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-horse"></i> ${TECNICA_ARQUEARIA.nome}
                </h3>
                <button onclick="fecharModal()" style="background: none; border: none; color: #F5DEB3; font-size: 1.5em; cursor: pointer;">&times;</button>
            </div>
            
            <!-- DESCRIÇÃO -->
            <p style="color: #DEB887; line-height: 1.5; margin-bottom: 25px;">
                ${TECNICA_ARQUEARIA.descricao}
                <br><br>
                <strong style="color: #D4AF37;">Regra:</strong> Não pode exceder o NH em Arco. Penalidades para disparar a cavalo não reduzem abaixo do NH desta técnica.
            </p>
            
            <!-- SELEÇÃO DE PONTOS -->
            <div style="background: rgba(139, 0, 0, 0.2); border-radius: 10px; padding: 20px; margin-bottom: 25px;">
                <h4 style="color: #D4AF37; margin-top: 0; text-align: center;">Selecione os pontos a investir</h4>
                
                <div style="display: flex; justify-content: center; gap: 15px; margin: 20px 0;">
                    <div class="opcao-pontos" data-pontos="2" onclick="selecionarPontos(2)" style="width: 80px; height: 80px; border: 3px solid #8B4513; border-radius: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s;">
                        <div style="font-size: 1.8em; font-weight: bold; color: #FFD700;">2</div>
                        <div style="font-size: 0.9em; color: #B8860B;">pts</div>
                        <div style="font-size: 0.8em; color: #DEB887; margin-top: 5px;">+1 nível</div>
                    </div>
                    
                    <div class="opcao-pontos" data-pontos="3" onclick="selecionarPontos(3)" style="width: 80px; height: 80px; border: 3px solid #8B4513; border-radius: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s;">
                        <div style="font-size: 1.8em; font-weight: bold; color: #FFD700;">3</div>
                        <div style="font-size: 0.9em; color: #B8860B;">pts</div>
                        <div style="font-size: 0.8em; color: #DEB887; margin-top: 5px;">+2 níveis</div>
                    </div>
                    
                    <div class="opcao-pontos" data-pontos="4" onclick="selecionarPontos(4)" style="width: 80px; height: 80px; border: 3px solid #8B4513; border-radius: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s;">
                        <div style="font-size: 1.8em; font-weight: bold; color: #FFD700;">4</div>
                        <div style="font-size: 0.9em; color: #B8860B;">pts</div>
                        <div style="font-size: 0.8em; color: #DEB887; margin-top: 5px;">+3 níveis</div>
                    </div>
                    
                    <div class="opcao-pontos" data-pontos="5" onclick="selecionarPontos(5)" style="width: 80px; height: 80px; border: 3px solid #8B4513; border-radius: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s;">
                        <div style="font-size: 1.8em; font-weight: bold; color: #FFD700;">5</div>
                        <div style="font-size: 0.9em; color: #B8860B;">pts</div>
                        <div style="font-size: 0.8em; color: #DEB887; margin-top: 5px;">+4 níveis</div>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 15px; color: #B8860B; font-size: 0.9em;">
                    Difícil: 2 pontos por nível (ex: +2 níveis = 3 pontos)
                </div>
            </div>
            
            <!-- RESUMO -->
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(26, 18, 0, 0.8); padding: 15px; border-radius: 8px; margin-bottom: 25px; border: 1px solid #8B4513;">
                <div>
                    <div style="color: #B8860B; font-size: 0.9em;">Investimento</div>
                    <div style="color: #FFD700; font-size: 1.5em; font-weight: bold;" id="pontos-selecionados">2 pontos</div>
                </div>
                <div>
                    <div style="color: #B8860B; font-size: 0.9em;">Nível da Técnica</div>
                    <div style="color: #90EE90; font-size: 1.5em; font-weight: bold;" id="nivel-selecionado">+1</div>
                </div>
            </div>
            
            <!-- RODAPÉ -->
            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 20px; border-top: 2px solid #8B4513;">
                <button onclick="fecharModal()" style="padding: 12px 25px; background: rgba(139, 0, 0, 0.3); border: 2px solid #8B0000; color: #F5DEB3; border-radius: 6px; cursor: pointer; font-family: 'Cinzel', serif; font-weight: bold;">
                    Cancelar
                </button>
                
                <button onclick="confirmarCompra(2)" id="btn-confirmar" style="padding: 12px 25px; background: linear-gradient(to right, #228B22, #006400); border: none; color: white; border-radius: 6px; cursor: pointer; font-family: 'Cinzel', serif; font-weight: bold; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-check"></i>
                    Confirmar - 2 pontos
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Adicionar estilos para seleção
    setTimeout(() => {
        selecionarPontos(2); // Selecionar 2 pontos por padrão
    }, 10);
}

// ===== 5. FUNÇÕES DO MODAL =====
function selecionarPontos(pontos) {
    console.log(`🎯 Selecionou ${pontos} pontos`);
    
    // Atualizar display
    document.getElementById('pontos-selecionados').textContent = `${pontos} pontos`;
    
    // Calcular nível baseado nos pontos (Difícil: 2,3,4,5 pontos = +1,+2,+3,+4)
    const nivel = pontos === 2 ? 1 : 
                  pontos === 3 ? 2 : 
                  pontos === 4 ? 3 : 4;
    
    document.getElementById('nivel-selecionado').textContent = `+${nivel}`;
    
    // Atualizar botão de confirmar
    const btnConfirmar = document.getElementById('btn-confirmar');
    btnConfirmar.textContent = `Confirmar - ${pontos} pontos`;
    btnConfirmar.onclick = () => confirmarCompra(pontos);
    
    // Destacar opção selecionada
    document.querySelectorAll('.opcao-pontos').forEach(opcao => {
        if (parseInt(opcao.dataset.pontos) === pontos) {
            opcao.style.borderColor = '#228B22';
            opcao.style.background = 'rgba(34, 139, 34, 0.2)';
            opcao.style.transform = 'scale(1.05)';
        } else {
            opcao.style.borderColor = '#8B4513';
            opcao.style.background = 'transparent';
            opcao.style.transform = 'scale(1)';
        }
    });
}

function confirmarCompra(pontos) {
    console.log(`💰 Confirmando compra por ${pontos} pontos`);
    
    // Calcular nível
    const nivel = pontos === 2 ? 1 : 
                  pontos === 3 ? 2 : 
                  pontos === 4 ? 3 : 4;
    
    // Mensagem de sucesso
    alert(`✅ ${TECNICA_ARQUEARIA.nome} adquirida!\n\n• Nível: +${nivel}\n• Custo: ${pontos} pontos\n• Pré-requisito: ${TECNICA_ARQUEARIA.prereq}`);
    
    // Aqui você salvaria no localStorage
    const tecnicaAprendida = {
        id: TECNICA_ARQUEARIA.id,
        nome: TECNICA_ARQUEARIA.nome,
        nivel: nivel,
        pontos: pontos,
        data: new Date().toLocaleDateString()
    };
    
    // Salvar no localStorage
    let aprendidas = JSON.parse(localStorage.getItem('tecnicas_aprendidas')) || [];
    aprendidas.push(tecnicaAprendida);
    localStorage.setItem('tecnicas_aprendidas', JSON.stringify(aprendidas));
    
    // Fechar modal
    fecharModal();
    
    // Atualizar lista de aprendidas
    atualizarAprendidas();
}

function fecharModal() {
    const modal = document.getElementById('modal-tecnica-overlay');
    if (modal) {
        modal.remove();
    }
}

// ===== 6. ATUALIZAR TÉCNICAS APRENDIDAS =====
function atualizarAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) return;
    
    const aprendidas = JSON.parse(localStorage.getItem('tecnicas_aprendidas')) || [];
    
    if (aprendidas.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: rgba(212, 175, 55, 0.5);">
                <i class="fas fa-tools" style="font-size: 3em; margin-bottom: 15px;"></i>
                <div style="font-size: 1.1em;">Nenhuma técnica aprendida</div>
                <small>As técnicas que você adquirir aparecerão aqui</small>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    aprendidas.forEach(tecnica => {
        const item = document.createElement('div');
        item.style.cssText = `
            background: rgba(34, 139, 34, 0.1);
            border: 2px solid #228B22;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
            color: #F5DEB3;
        `;
        
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <strong style="color: #90EE90;">
                    <i class="fas fa-horse"></i> ${tecnica.nome}
                </strong>
                <span style="background: rgba(212, 175, 55, 0.2); padding: 3px 10px; border-radius: 4px; color: #D4AF37;">
                    Nível +${tecnica.nivel}
                </span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.9em;">
                <span>Custo: <strong style="color: #FFD700;">${tecnica.pontos} pts</strong></span>
                <span>Adquirida: ${tecnica.data}</span>
            </div>
            <button onclick="removerTecnica('${tecnica.id}')" style="margin-top: 10px; padding: 5px 10px; background: rgba(139, 0, 0, 0.2); border: 1px solid #8B0000; color: #F5DEB3; border-radius: 4px; cursor: pointer; font-size: 0.8em;">
                <i class="fas fa-trash"></i> Remover
            </button>
        `;
        
        container.appendChild(item);
    });
}

function removerTecnica(id) {
    if (confirm('Remover esta técnica?')) {
        let aprendidas = JSON.parse(localStorage.getItem('tecnicas_aprendidas')) || [];
        aprendidas = aprendidas.filter(t => t.id !== id);
        localStorage.setItem('tecnicas_aprendidas', JSON.stringify(aprendidas));
        atualizarAprendidas();
    }
}

// ===== 7. INICIALIZAR TÉCNICAS APRENDIDAS =====
setTimeout(() => {
    atualizarAprendidas();
}, 500);

console.log("✅ SISTEMA DE TÉCNICAS CARREGADO");