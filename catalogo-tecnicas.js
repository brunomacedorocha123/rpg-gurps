// ============================================
// CATÁLOGO DE TÉCNICAS - APENAS OS DADOS
// ============================================

const CATALOGO_TECNICAS = {
    "arquearia-montada": {
        id: "arquearia-montada",
        nome: "Arquearia Montada",
        icone: "fas fa-horse",
        descricao: "Usar arco enquanto cavalga. Penalidades para disparar montado não reduzem abaixo do NH desta técnica.",
        dificuldade: "Difícil",
        atributoBase: "DX",
        periciaBase: "Arco",
        modificadorBase: -4,
        limiteMaximo: "Arco",
        prereq: {
            periciaArco: 4,
            temCavalgar: true
        }
    }
    // AQUI VOCÊ ADICIONA NOVAS TÉCNICAS FUTURAS:
    // "outra-tecnica": { ... },
    // "mais-uma": { ... }
};

// Funções do catálogo
function obterTodasTecnicas() {
    return Object.values(CATALOGO_TECNICAS);
}

function buscarTecnicaPorId(id) {
    return CATALOGO_TECNICAS[id] || null;
}

// Exportar
window.CATALOGO_TECNICAS = CATALOGO_TECNICAS;
window.obterTodasTecnicas = obterTodasTecnicas;
window.buscarTecnicaPorId = buscarTecnicaPorId;