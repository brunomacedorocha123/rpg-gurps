// ============================================
// TECNICAS.JS - FUNCIONAL AGORA MESMO
// ============================================

// 1. DADOS DA TÉCNICA
const TECNICA = {
    id: "arquearia-montada",
    nome: "Arquearia Montada",
    icone: "fas fa-horse",
    descricao: "Atirar com arco enquanto cavalga. Penalidade base de -4. Cada nível investido reduz esta penalidade em 1.",
    modificadorBase: -4,
    prereq: ["Arco", "Cavalgar"]
};

// 2. CUSTOS
const CUSTOS = [
    { niveis: 1, pontos: 2, texto: "2 pts (+1 nível)" },
    { niveis: 2, pontos: 3, texto: "3 pts (+2 níveis)" },
    { niveis: 3, pontos: 4, texto: "4 pts (+3 níveis)" },
    { niveis: 4, pontos: 5, texto: "5 pts (+4 níveis)" }
];

// 3. ESTADO
let tecnicasAprendidas = JSON.parse(localStorage.getItem('tecnicas_aprendidas') || '[]');
let pontosTecnicas = parseInt(localStorage.getItem('pontos_tecnicas') || '0');

// 4. VERIFICA SE TEM PERÍCIA
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

// 5. RENDERIZA CATÁLOGO
function renderizarCatalogo() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) return;
    
    const arco = temPericia("Arco");
    const cavalgar = temPericia("Cavalgar");
    const podeAprender = arco.tem && cavalgar.tem;
    const jaAprendida = tecnicasAprendidas.find(t => t.id === TECNICA.id);
    
    container.innerHTML = `
        <div class="tecnica-item">
            <div class="tecnica-header">
                <div class="tecnica-nome">
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
                    <span class="label">Base:</span>
                    <span class="valor">${TECNICA.periciaBase} ${arco.tem ? `(NH ${arco.nivel})` : ''}</span>
                </div>
                <div class="info-item">
                    <span class="label">Penalidade:</span>
                    <span class="valor">${TECNICA.modificadorBase}</span>
                </div>
            </div>
            
            <div class="tecnica-prereq">
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

// 6. FUNÇÃO SIMPLES PARA ABRIR MODAL
function abrirModalTecnica() {
    const arco = temPericia("Arco");
    const cavalgar = temPericia("Cavalgar");
    const podeAprender = arco.tem && cavalgar.tem;
    const jaAprendida = tecnicasAprendidas.find(t => t.id === TECNICA.id);
    
    if (!podeAprender && !jaAprendida) {
        alert('Você precisa aprender Arco e Cavalgar primeiro!');
        return;
    }
    
    // Cria modal SIMPLES e DIRETO
    const modalHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        " id="modal-tecnica-simples">
            <div style="
                background: #2d3748;
                color: white;
                border-radius: 10px;
                padding: 25px;
                width: 90%;
                max-width: 500px;
                border: 3px solid #d4af37;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0; color: #d4af37;">
                        <i class="${TECNICA.icone}"></i> ${TECNICA.nome}
                    </h3>
                    <button onclick="fecharModal()" style="
                        background: none;
                        border: none;
                        color: white;
                        font-size: 24px;
                        cursor: pointer;
                    ">&times;</button>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <p>${TECNICA.descricao}</p>
                </div>
                
                <div style="background: #4a5568; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <h4 style="margin-top: 0; color: #e2e8f0;">Escolha os níveis:</h4>
                    <div id="opcoes-container" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                        ${CUSTOS.map((opcao, index) => {
                            const selecionado = jaAprendida ? jaAprendida.niveis === opcao.niveis : index === 0;
                            const nhArco = arco.nivel || 0;
                            const nhFinal = Math.min(nhArco + TECNICA.modificadorBase + opcao.niveis, nhArco);
                            
                            return `
                                <button onclick="selecionarOpcao(${opcao.pontos}, ${opcao.niveis}, ${nhFinal})" 
                                        style="
                                            background: ${selecionado ? '#2d5433' : '#4a5568'};
                                            border: 2px solid ${selecionado ? '#68d391' : '#718096'};
                                            border-radius: 8px;
                                            padding: 15px;
                                            color: white;
                                            cursor: pointer;
                                            transition: all 0.3s;
                                        "
                                        id="opcao-${opcao.pontos}">
                                    <div style="font-size: 18px; font-weight: bold; color: #68d391;">${opcao.pontos} pts</div>
                                    <div style="font-size: 14px; margin: 5px 0;">+${opcao.niveis} nível${opcao.niveis > 1 ? 's' : ''}</div>
                                    <div style="font-size: 12px; color: #cbd5e0;">NH: ${nhFinal}</div>
                                </button>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <div style="background: #4a5568; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <h4 style="margin-top: 0; color: #e2e8f0;">Resumo</h4>
                    <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                        <span>Arco (NH ${arco.nivel}):</span>
                        <strong>${arco.nivel}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                        <span>Penalidade:</span>
                        <strong>${TECNICA.modificadorBase}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                        <span>Níveis:</span>
                        <strong id="resumo-niveis">+${jaAprendida ? jaAprendida.niveis : 1}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin: 8px 0; padding-top: 10px; border-top: 2px solid #68d391;">
                        <span style="font-weight: bold;">NH final:</span>
                        <strong style="color: #68d391; font-size: 18px;" id="resumo-nh">
                            ${Math.min((arco.nivel || 0) + TECNICA.modificadorBase + (jaAprendida ? jaAprendida.niveis : 1), (arco.nivel || 0))}
                        </strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                        <span>Pontos:</span>
                        <strong id="resumo-pontos">${jaAprendida ? jaAprendida.pontos : 2}</strong>
                    </div>
                </div>
                
                <div style="display: flex; justify-content: flex-end; gap: 10px;">
                    <button onclick="fecharModal()" style="
                        background: #4a5568;
                        border: 2px solid #718096;
                        color: white;
                        padding: 10px 20px;
                        border-radius: 6px;
                        cursor: pointer;
                    ">Cancelar</button>
                    <button onclick="confirmarCompra(${jaAprendida ? 'true' : 'false'})" style="
                        background: #2d5433;
                        border: none;
                        color: white;
                        padding: 10px 20px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: bold;
                    ">
                        <i class="fas fa-check"></i> ${jaAprendida ? 'Atualizar' : 'Adquirir'}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Injeta modal no body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Armazena dados selecionados
    window.tecnicaSelecionada = {
        pontos: jaAprendida ? jaAprendida.pontos : 2,
        niveis: jaAprendida ? jaAprendida.niveis : 1,
        nhArco: arco.nivel || 0
    };
}

// 7. FUNÇÕES DO MODAL
function selecionarOpcao(pontos, niveis, nhFinal) {
    // Atualiza visual
    document.querySelectorAll('#opcoes-container button').forEach(btn => {
        btn.style.background = '#4a5568';
        btn.style.borderColor = '#718096';
    });
    
    const btnSelecionado = document.getElementById(`opcao-${pontos}`);
    if (btnSelecionado) {
        btnSelecionado.style.background = '#2d5433';
        btnSelecionado.style.borderColor = '#68d391';
    }
    
    // Atualiza resumo
    document.getElementById('resumo-niveis').textContent = `+${niveis}`;
    document.getElementById('resumo-nh').textContent = nhFinal;
    document.getElementById('resumo-pontos').textContent = `${pontos}`;
    
    // Atualiza dados
    window.tecnicaSelecionada = {
        pontos: pontos,
        niveis: niveis,
        nhArco: window.tecnicaSelecionada.nhArco
    };
}

function confirmarCompra(ehEdicao) {
    if (!window.tecnicaSelecionada) return;
    
    const confirmacao = confirm(
        `${ehEdicao ? 'Atualizar' : 'Adquirir'} ${TECNICA.nome}?\n\n` +
        `Pontos: ${window.tecnicaSelecionada.pontos}\n` +
        `Níveis: +${window.tecnicaSelecionada.niveis}\n` +
        `NH final: ${Math.min(window.tecnicaSelecionada.nhArco + TECNICA.modificadorBase + window.tecnicaSelecionada.niveis, window.tecnicaSelecionada.nhArco)}`
    );
    
    if (!confirmacao) return;
    
    const index = tecnicasAprendidas.findIndex(t => t.id === TECNICA.id);
    
    if (index >= 0) {
        // Atualiza
        pontosTecnicas += (window.tecnicaSelecionada.pontos - tecnicasAprendidas[index].pontos);
        tecnicasAprendidas[index] = {
            id: TECNICA.id,
            nome: TECNICA.nome,
            icone: TECNICA.icone,
            niveis: window.tecnicaSelecionada.niveis,
            pontos: window.tecnicaSelecionada.pontos
        };
    } else {
        // Adiciona nova
        tecnicasAprendidas.push({
            id: TECNICA.id,
            nome: TECNICA.nome,
            icone: TECNICA.icone,
            niveis: window.tecnicaSelecionada.niveis,
            pontos: window.tecnicaSelecionada.pontos
        });
        pontosTecnicas += window.tecnicaSelecionada.pontos;
    }
    
    // Salva
    localStorage.setItem('tecnicas_aprendidas', JSON.stringify(tecnicasAprendidas));
    localStorage.setItem('pontos_tecnicas', pontosTecnicas);
    
    // Fecha e atualiza
    fecharModal();
    renderizarTodas();
    alert(`${TECNICA.nome} ${ehEdicao ? 'atualizada' : 'adquirida'} com sucesso!`);
}

function fecharModal() {
    const modal = document.getElementById('modal-tecnica-simples');
    if (modal) modal.remove();
    window.tecnicaSelecionada = null;
}

// 8. RENDERIZA APRENDIDAS
function renderizarAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) return;
    
    if (tecnicasAprendidas.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">Nenhuma técnica aprendida</div>';
        return;
    }
    
    container.innerHTML = tecnicasAprendidas.map(t => {
        const nhArco = temPericia("Arco").nivel || 0;
        const nh = Math.min(nhArco + TECNICA.modificadorBase + t.niveis, nhArco);
        
        return `
            <div style="background: #374151; border: 2px solid #4b5563; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-weight: bold; color: white;">
                        <i class="${t.icone}"></i> ${t.nome}
                    </div>
                    <div style="color: #68d391; font-weight: bold;">NH: ${nh}</div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 14px;">
                    <span>Pontos: <strong>${t.pontos}</strong></span>
                    <span>Níveis: <strong>+${t.niveis}</strong></span>
                </div>
                <div style="margin-top: 10px; display: flex; gap: 10px;">
                    <button onclick="abrirModalTecnica()" style="
                        background: #4b5563;
                        border: 1px solid #6b7280;
                        color: white;
                        padding: 5px 10px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 13px;
                    ">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button onclick="removerTecnica('${t.id}')" style="
                        background: #7f1d1d;
                        border: 1px solid #991b1b;
                        color: white;
                        padding: 5px 10px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 13px;
                    ">
                        <i class="fas fa-trash"></i> Remover
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// 9. REMOVER TÉCNICA
function removerTecnica(id) {
    if (!confirm('Remover esta técnica?')) return;
    
    const index = tecnicasAprendidas.findIndex(t => t.id === id);
    if (index === -1) return;
    
    pontosTecnicas -= tecnicasAprendidas[index].pontos || 0;
    tecnicasAprendidas.splice(index, 1);
    
    localStorage.setItem('tecnicas_aprendidas', JSON.stringify(tecnicasAprendidas));
    localStorage.setItem('pontos_tecnicas', pontosTecnicas);
    
    renderizarTodas();
}

// 10. FUNÇÃO PRINCIPAL
function renderizarTodas() {
    renderizarCatalogo();
    renderizarAprendidas();
    
    // Atualiza estatísticas
    const totalEl = document.getElementById('total-tecnicas');
    const pontosEl = document.getElementById('pontos-tecnicas');
    if (totalEl) totalEl.textContent = tecnicasAprendidas.length;
    if (pontosEl) pontosEl.textContent = pontosTecnicas;
}

// 11. INICIALIZAÇÃO
function inicializar() {
    // Carrega dados
    try {
        const dados = localStorage.getItem('tecnicas_aprendidas');
        if (dados) tecnicasAprendidas = JSON.parse(dados);
        
        const pontos = localStorage.getItem('pontos_tecnicas');
        if (pontos) pontosTecnicas = parseInt(pontos);
    } catch(e) {}
    
    // Configura botão atualizar
    const btn = document.getElementById('btn-atualizar-tecnicas');
    if (btn) btn.onclick = renderizarTodas;
    
    // Configura ESC para fechar modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') fecharModal();
    });
    
    // Renderiza
    renderizarTodas();
}

// 12. EXPORTA FUNÇÕES
window.abrirModalTecnica = abrirModalTecnica;
window.selecionarOpcao = selecionarOpcao;
window.confirmarCompra = confirmarCompra;
window.fecharModal = fecharModal;
window.removerTecnica = removerTecnica;
window.renderizarTodas = renderizarTodas;
window.inicializar = inicializar;

// 13. INICIA QUANDO CARREGA A ABA
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.subtab-btn-pericias').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.dataset.subtab === 'tecnicas') {
                setTimeout(inicializar, 100);
            }
        });
    });
    
    const abaTecnicas = document.getElementById('subtab-tecnicas');
    if (abaTecnicas && abaTecnicas.classList.contains('active')) {
        setTimeout(inicializar, 100);
    }
});

console.log('✅ TECNICAS.JS CARREGADO - VERSÃO SIMPLES');