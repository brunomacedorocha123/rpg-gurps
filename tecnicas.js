// ============================================
// TECNICAS.JS - SISTEMA COMPLETO
// ============================================

// ===== 1. DADOS DA TÉCNICA =====
const TECNICA = {
    id: "arquearia-montada",
    nome: "Arquearia Montada",
    icone: "fas fa-horse",
    descricao: "Atirar com arco enquanto cavalga. Penalidade base de -4. Cada nível investido reduz esta penalidade em 1. O NH da técnica nunca pode exceder o NH em Arco.",
    modificadorBase: -4,
    prereq: ["Arco", "Cavalgar"]
};

const CUSTOS = [
    { niveis: 1, pontos: 2 },
    { niveis: 2, pontos: 3 },
    { niveis: 3, pontos: 4 },
    { niveis: 4, pontos: 5 }
];

// ===== 2. ESTADO =====
let tecnicasAprendidas = JSON.parse(localStorage.getItem('tecnicas_aprendidas') || '[]');
let pontosTecnicas = parseInt(localStorage.getItem('pontos_tecnicas') || '0');

// ===== 3. FUNÇÕES SIMPLES =====
function temPericia(nome) {
    try {
        const dados = localStorage.getItem('gurps_pericias');
        if (!dados) return false;
        
        const parsed = JSON.parse(dados);
        const pericias = parsed.periciasAprendidas || parsed.pericias || parsed;
        
        if (!Array.isArray(pericias)) return false;
        
        for (const p of pericias) {
            if (!p || !p.nome) continue;
            if (p.nome.toLowerCase().includes(nome.toLowerCase())) {
                return { tem: true, nivel: p.nivel || p.valor || 1, nome: p.nome };
            }
        }
    } catch(e) {}
    return { tem: false, nivel: 0, nome: nome };
}

function calcularNH(niveis = 0) {
    const arco = temPericia("Arco");
    if (!arco.tem) return 0;
    
    const nhArco = arco.nivel;
    const nhFinal = nhArco + TECNICA.modificadorBase + niveis;
    
    // Limites
    if (nhFinal > nhArco) return nhArco;
    if (nhFinal < 0) return 0;
    return nhFinal;
}

// ===== 4. RENDERIZAR CATÁLOGO =====
function renderizarCatalogo() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) return;
    
    const arco = temPericia("Arco");
    const cavalgar = temPericia("Cavalgar");
    const podeAprender = arco.tem && cavalgar.tem;
    const jaAprendida = tecnicasAprendidas.find(t => t.id === TECNICA.id);
    const nhAtual = calcularNH(jaAprendida ? jaAprendida.niveis : 0);
    
    container.innerHTML = `
        <div class="tecnica-item">
            <div class="tecnica-header">
                <div class="tecnica-titulo">
                    <i class="${TECNICA.icone}"></i>
                    <h4>${TECNICA.nome}</h4>
                </div>
                <span class="tecnica-status ${jaAprendida ? 'aprendida' : podeAprender ? 'disponivel' : 'bloqueada'}">
                    ${jaAprendida ? '✓ Aprendida' : podeAprender ? 'Disponível' : 'Bloqueada'}
                </span>
            </div>
            
            <div class="tecnica-desc">${TECNICA.descricao}</div>
            
            <div class="tecnica-info">
                <div class="info-item">
                    <span class="label">Base (Arco):</span>
                    <span class="valor">NH ${arco.nivel || 0}</span>
                </div>
                <div class="info-item">
                    <span class="label">Penalidade:</span>
                    <span class="valor">${TECNICA.modificadorBase}</span>
                </div>
                <div class="info-item">
                    <span class="label">NH Atual:</span>
                    <span class="valor">${nhAtual > 0 ? nhAtual : '--'}</span>
                </div>
            </div>
            
            <div class="tecnica-prereq">
                <div class="prereq-titulo">Pré-requisitos:</div>
                <div class="prereq-item ${arco.tem ? 'ok' : 'falta'}">
                    <i class="fas fa-${arco.tem ? 'check' : 'times'}"></i>
                    Arco ${arco.tem ? `(NH ${arco.nivel})` : ''}
                </div>
                <div class="prereq-item ${cavalgar.tem ? 'ok' : 'falta'}">
                    <i class="fas fa-${cavalgar.tem ? 'check' : 'times'}"></i>
                    Cavalgar ${cavalgar.tem ? `(NH ${cavalgar.nivel})` : ''}
                </div>
            </div>
            
            <div class="tecnica-acoes">
                <button class="btn-tecnica ${jaAprendida ? 'aprendida' : podeAprender ? 'disponivel' : 'bloqueada'}" 
                        onclick="abrirModalTecnica()"
                        ${!podeAprender && !jaAprendida ? 'disabled' : ''}>
                    <i class="fas ${jaAprendida ? 'fa-edit' : 'fa-plus-circle'}"></i>
                    ${jaAprendida ? 'Editar' : podeAprender ? 'Adquirir' : 'Bloqueada'}
                </button>
            </div>
        </div>
    `;
}

// ===== 5. ABRIR MODAL =====
function abrirModalTecnica() {
    const arco = temPericia("Arco");
    const cavalgar = temPericia("Cavalgar");
    const podeAprender = arco.tem && cavalgar.tem;
    const jaAprendida = tecnicasAprendidas.find(t => t.id === TECNICA.id);
    
    if (!podeAprender && !jaAprendida) {
        alert('❌ Você precisa aprender Arco e Cavalgar primeiro!');
        return;
    }
    
    // Cria modal
    const modalHTML = `
        <div id="modal-tecnica-overlay" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        ">
            <div style="
                background: #2d3748;
                color: white;
                border-radius: 10px;
                width: 90%;
                max-width: 500px;
                max-height: 85vh;
                overflow-y: auto;
                border: 3px solid #d4af37;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            ">
                <!-- Cabeçalho -->
                <div style="
                    background: #1a202c;
                    padding: 20px;
                    border-radius: 10px 10px 0 0;
                    border-bottom: 2px solid #d4af37;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <h3 style="margin: 0; color: #d4af37; display: flex; align-items: center; gap: 10px;">
                        <i class="${TECNICA.icone}"></i> ${TECNICA.nome}
                    </h3>
                    <button onclick="fecharModal()" style="
                        background: none;
                        border: none;
                        color: white;
                        font-size: 24px;
                        cursor: pointer;
                        width: 40px;
                        height: 40px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 50%;
                        transition: background 0.3s;
                    " onmouseover="this.style.background='rgba(139,0,0,0.3)'" 
                      onmouseout="this.style.background='none'">&times;</button>
                </div>
                
                <!-- Corpo -->
                <div style="padding: 20px;">
                    <!-- Descrição -->
                    <div style="margin-bottom: 20px;">
                        <p style="color: #e2e8f0; line-height: 1.6;">${TECNICA.descricao}</p>
                    </div>
                    
                    <!-- Pré-requisitos -->
                    <div style="background: #4a5568; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <h4 style="margin-top: 0; color: #d4af37; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-clipboard-check"></i> Pré-requisitos
                        </h4>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            <div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 6px; border-left: 4px solid ${arco.tem ? '#48bb78' : '#f56565'};">
                                <i class="fas fa-${arco.tem ? 'check-circle' : 'times-circle'}" style="color: ${arco.tem ? '#48bb78' : '#f56565'};"></i>
                                <div>
                                    <div style="font-weight: bold;">Arco</div>
                                    <div style="font-size: 14px; color: #cbd5e0;">${arco.tem ? `NH ${arco.nivel}` : 'Não aprendido'}</div>
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 6px; border-left: 4px solid ${cavalgar.tem ? '#48bb78' : '#f56565'};">
                                <i class="fas fa-${cavalgar.tem ? 'check-circle' : 'times-circle'}" style="color: ${cavalgar.tem ? '#48bb78' : '#f56565'};"></i>
                                <div>
                                    <div style="font-weight: bold;">Cavalgar (qualquer)</div>
                                    <div style="font-size: 14px; color: #cbd5e0;">${cavalgar.tem ? `NH ${cavalgar.nivel}` : 'Não aprendido'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Opções de níveis -->
                    <div id="opcoes-container" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px;">
                        ${CUSTOS.map((opcao, index) => {
                            const selecionado = jaAprendida ? jaAprendida.niveis === opcao.niveis : index === 0;
                            const nhFinal = calcularNH(opcao.niveis);
                            
                            return `
                                <button onclick="selecionarOpcao(${opcao.pontos}, ${opcao.niveis})" 
                                        style="
                                            background: ${selecionado ? '#2d5433' : '#4a5568'};
                                            border: 2px solid ${selecionado ? '#68d391' : '#718096'};
                                            border-radius: 8px;
                                            padding: 15px;
                                            color: white;
                                            cursor: pointer;
                                            transition: all 0.3s;
                                            text-align: center;
                                        "
                                        onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(104,211,145,0.2)'"
                                        onmouseout="this.style.transform='none'; this.style.boxShadow='none'"
                                        id="opcao-${opcao.pontos}">
                                    <div style="font-size: 18px; font-weight: bold; color: #68d391; margin-bottom: 5px;">${opcao.pontos} pts</div>
                                    <div style="font-size: 14px; margin: 5px 0;">+${opcao.niveis} nível${opcao.niveis > 1 ? 's' : ''}</div>
                                    <div style="font-size: 12px; color: #cbd5e0;">NH: ${nhFinal}</div>
                                    ${selecionado ? '<div style="margin-top: 5px;"><i class="fas fa-check" style="color: #68d391;"></i></div>' : ''}
                                </button>
                            `;
                        }).join('')}
                    </div>
                    
                    <!-- Cálculo -->
                    <div style="background: #4a5568; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h4 style="margin-top: 0; color: #d4af37; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-calculator"></i> Cálculo do NH
                        </h4>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                                <span>NH do Arco:</span>
                                <strong style="color: white;">${arco.nivel || 0}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                                <span>Penalidade base:</span>
                                <strong style="color: white;">${TECNICA.modificadorBase}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                                <span>Níveis adicionais:</span>
                                <strong style="color: white;" id="resumo-niveis">+${jaAprendida ? jaAprendida.niveis : 1}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 10px 0; margin-top: 5px; border-top: 2px solid #d4af37;">
                                <span style="font-weight: bold;">NH final:</span>
                                <strong style="color: #d4af37; font-size: 20px;" id="resumo-nh">${calcularNH(jaAprendida ? jaAprendida.niveis : 1)}</strong>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Rodapé -->
                <div style="
                    background: #1a202c;
                    padding: 15px 20px;
                    border-radius: 0 0 10px 10px;
                    border-top: 2px solid #4a5568;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="color: #cbd5e0;">Custo total:</span>
                        <strong style="color: #d4af37; font-size: 18px;" id="resumo-pontos">${jaAprendida ? jaAprendida.pontos : 2} pontos</strong>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="fecharModal()" style="
                            background: #4a5568;
                            border: 2px solid #718096;
                            color: white;
                            padding: 10px 20px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-family: 'Cinzel', serif;
                            transition: all 0.3s;
                        " onmouseover="this.style.background='#718096'" 
                          onmouseout="this.style.background='#4a5568'">Cancelar</button>
                        <button onclick="confirmarCompra()" style="
                            background: #2d5433;
                            border: none;
                            color: white;
                            padding: 10px 20px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-family: 'Cinzel', serif;
                            font-weight: bold;
                            transition: all 0.3s;
                        " onmouseover="this.style.background='#38a169'; this.style.transform='translateY(-2px)'" 
                          onmouseout="this.style.background='#2d5433'; this.style.transform='none'">
                            <i class="fas fa-check"></i> ${jaAprendida ? 'Atualizar' : 'Adquirir'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove modal anterior se existir
    const modalAnterior = document.getElementById('modal-tecnica-overlay');
    if (modalAnterior) modalAnterior.remove();
    
    // Adiciona novo modal
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Armazena dados iniciais
    window.tecnicaSelecionada = {
        pontos: jaAprendida ? jaAprendida.pontos : 2,
        niveis: jaAprendida ? jaAprendida.niveis : 1
    };
}

// ===== 6. FUNÇÕES DO MODAL =====
function selecionarOpcao(pontos, niveis) {
    // Atualiza visual das opções
    document.querySelectorAll('#opcoes-container button').forEach(btn => {
        btn.style.background = '#4a5568';
        btn.style.borderColor = '#718096';
    });
    
    const btnSelecionado = document.getElementById(`opcao-${pontos}`);
    if (btnSelecionado) {
        btnSelecionado.style.background = '#2d5433';
        btnSelecionado.style.borderColor = '#68d391';
    }
    
    // Atualiza cálculos
    const arco = temPericia("Arco");
    const nhFinal = calcularNH(niveis);
    
    // Atualiza resumo
    document.getElementById('resumo-niveis').textContent = `+${niveis}`;
    document.getElementById('resumo-nh').textContent = nhFinal;
    document.getElementById('resumo-pontos').textContent = `${pontos} pontos`;
    
    // Atualiza dados selecionados
    window.tecnicaSelecionada = {
        pontos: pontos,
        niveis: niveis
    };
}

function confirmarCompra() {
    if (!window.tecnicaSelecionada) return;
    
    const arco = temPericia("Arco");
    const nhFinal = calcularNH(window.tecnicaSelecionada.niveis);
    const jaAprendida = tecnicasAprendidas.find(t => t.id === TECNICA.id);
    
    const confirmacao = confirm(
        `${jaAprendida ? 'Atualizar' : 'Adquirir'} "${TECNICA.nome}"?\n\n` +
        `• Pontos: ${window.tecnicaSelecionada.pontos}\n` +
        `• Níveis: +${window.tecnicaSelecionada.niveis}\n` +
        `• NH final: ${nhFinal}\n` +
        `• Base (Arco): NH ${arco.nivel || 0}`
    );
    
    if (!confirmacao) return;
    
    const index = tecnicasAprendidas.findIndex(t => t.id === TECNICA.id);
    
    if (index >= 0) {
        // Atualizar técnica existente
        const pontosAntigos = tecnicasAprendidas[index].pontos || 0;
        pontosTecnicas += (window.tecnicaSelecionada.pontos - pontosAntigos);
        
        tecnicasAprendidas[index] = {
            id: TECNICA.id,
            nome: TECNICA.nome,
            icone: TECNICA.icone,
            niveis: window.tecnicaSelecionada.niveis,
            pontos: window.tecnicaSelecionada.pontos,
            periciaBase: "Arco",
            modificadorBase: TECNICA.modificadorBase
        };
    } else {
        // Adicionar nova técnica
        tecnicasAprendidas.push({
            id: TECNICA.id,
            nome: TECNICA.nome,
            icone: TECNICA.icone,
            niveis: window.tecnicaSelecionada.niveis,
            pontos: window.tecnicaSelecionada.pontos,
            periciaBase: "Arco",
            modificadorBase: TECNICA.modificadorBase,
            dataAquisicao: new Date().toISOString()
        });
        pontosTecnicas += window.tecnicaSelecionada.pontos;
    }
    
    // Salvar
    localStorage.setItem('tecnicas_aprendidas', JSON.stringify(tecnicasAprendidas));
    localStorage.setItem('pontos_tecnicas', pontosTecnicas.toString());
    
    // Fechar modal
    fecharModal();
    
    // Atualizar interface
    renderizarTodas();
    
    // Feedback
    setTimeout(() => {
        alert(`✅ ${TECNICA.nome} ${index >= 0 ? 'atualizada' : 'adquirida'} com sucesso!\n\nNH: ${nhFinal}`);
    }, 100);
}

function fecharModal() {
    const modal = document.getElementById('modal-tecnica-overlay');
    if (modal) modal.remove();
    window.tecnicaSelecionada = null;
}

// ===== 7. RENDERIZAR APRENDIDAS =====
function renderizarAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) return;
    
    if (tecnicasAprendidas.length === 0) {
        container.innerHTML = `
            <div class="vazio">
                <i class="fas fa-tools"></i>
                <p>Nenhuma técnica aprendida</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    tecnicasAprendidas.forEach(tecnica => {
        const nh = calcularNH(tecnica.niveis || 0);
        const arco = temPericia("Arco");
        
        const card = document.createElement('div');
        card.className = 'tecnica-aprendida';
        card.innerHTML = `
            <div class="aprendida-header">
                <div class="aprendida-titulo">
                    <i class="${tecnica.icone}"></i>
                    <h4>${tecnica.nome}</h4>
                </div>
                <div class="aprendida-nh">NH: ${nh}</div>
            </div>
            
            <div class="aprendida-detalhes">
                <div class="detalhe">
                    <span>Pontos:</span>
                    <strong>${tecnica.pontos || 0} pts</strong>
                </div>
                <div class="detalhe">
                    <span>Níveis:</span>
                    <strong>+${tecnica.niveis || 0}</strong>
                </div>
                <div class="detalhe">
                    <span>Base (Arco):</span>
                    <strong>NH ${arco.nivel || 0}</strong>
                </div>
            </div>
            
            <div class="aprendida-acoes">
                <button class="btn-editar" onclick="abrirModalTecnica()">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-remover" onclick="removerTecnica('${tecnica.id}')">
                    <i class="fas fa-trash"></i> Remover
                </button>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// ===== 8. REMOVER TÉCNICA =====
function removerTecnica(id) {
    const tecnica = tecnicasAprendidas.find(t => t.id === id);
    if (!tecnica) return;
    
    if (!confirm(`Remover "${tecnica.nome}"?`)) return;
    
    const index = tecnicasAprendidas.findIndex(t => t.id === id);
    if (index === -1) return;
    
    // Remove pontos
    pontosTecnicas -= tecnica.pontos || 0;
    
    // Remove da lista
    tecnicasAprendidas.splice(index, 1);
    
    // Salva
    localStorage.setItem('tecnicas_aprendidas', JSON.stringify(tecnicasAprendidas));
    localStorage.setItem('pontos_tecnicas', pontosTecnicas.toString());
    
    // Atualiza
    renderizarTodas();
    
    // Feedback
    setTimeout(() => {
        alert(`🗑️ ${tecnica.nome} removida!`);
    }, 100);
}

// ===== 9. ATUALIZAR ESTATÍSTICAS =====
function atualizarEstatisticas() {
    const totalElement = document.getElementById('total-tecnicas');
    const pontosElement = document.getElementById('pontos-tecnicas');
    const pontosAprendidasElement = document.getElementById('pontos-tecnicas-aprendidas');
    
    if (totalElement) totalElement.textContent = tecnicasAprendidas.length;
    if (pontosElement) pontosElement.textContent = pontosTecnicas;
    if (pontosAprendidasElement) pontosAprendidasElement.textContent = `${pontosTecnicas} pts`;
}

// ===== 10. FUNÇÃO PRINCIPAL =====
function renderizarTodas() {
    renderizarCatalogo();
    renderizarAprendidas();
    atualizarEstatisticas();
}

// ===== 11. INICIALIZAÇÃO =====
function inicializarSistemaTecnicas() {
    console.log('🚀 Inicializando sistema de técnicas...');
    
    // Carrega dados salvos
    try {
        const dadosTecnicas = localStorage.getItem('tecnicas_aprendidas');
        if (dadosTecnicas) tecnicasAprendidas = JSON.parse(dadosTecnicas);
        
        const dadosPontos = localStorage.getItem('pontos_tecnicas');
        if (dadosPontos) pontosTecnicas = parseInt(dadosPontos);
    } catch(e) {
        console.log('📁 Nenhum dado anterior de técnicas');
    }
    
    // Configura botão atualizar
    const btnAtualizar = document.getElementById('btn-atualizar-tecnicas');
    if (btnAtualizar) {
        btnAtualizar.onclick = renderizarTodas;
    }
    
    // Configura tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            fecharModal();
        }
    });
    
    // Renderiza
    renderizarTodas();
    
    console.log('✅ Sistema de técnicas pronto!');
}

// ===== 12. EXPORTAR FUNÇÕES =====
window.abrirModalTecnica = abrirModalTecnica;
window.fecharModal = fecharModal;
window.selecionarOpcao = selecionarOpcao;
window.confirmarCompra = confirmarCompra;
window.removerTecnica = removerTecnica;
window.renderizarTodas = renderizarTodas;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;

// ===== 13. INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa quando clicar na aba de técnicas
    document.querySelectorAll('.subtab-btn-pericias').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.dataset.subtab === 'tecnicas') {
                setTimeout(inicializarSistemaTecnicas, 100);
            }
        });
    });
    
    // Inicializa se já estiver na aba de técnicas
    const abaTecnicas = document.getElementById('subtab-tecnicas');
    if (abaTecnicas && abaTecnicas.classList.contains('active')) {
        setTimeout(inicializarSistemaTecnicas, 100);
    }
});

console.log('🎯 TECNICAS.JS CARREGADO - PRONTO PARA USAR!');