// catalogo-desvantagens.js - CATÁLOGO DE DESVANTAGENS
const CATALOGO_DESVANTAGENS = {
    'alcoolismo': {
        id: 'alcoolismo',
        nome: 'Alcoolismo',
        categoria: 'mental',
        tipo: 'opcoes',
        icone: 'fa-wine-bottle',
        descricao: 'O personagem é um viciado em álcool. Em circunstâncias normais, pode limitar o uso ao período noturno, mas toda vez que se vir frente a frente com o álcool, precisará obter sucesso em teste de Vontade para não sucumbir ao vício.',
        custoBase: -10, // Base para Alcoolismo comum
        configuracao: {
            tipo: 'opcoes-multiplas',
            opcoes: [
                { 
                    id: 'comum', 
                    nome: 'Alcoolismo Comum', 
                    custo: -15, 
                    desc: 'O alcoolismo é considerado um Vício. Barato, incapacitante e normalmente legal. Vale -15 pontos. Um fracasso no teste de Vontade significa um porre de 2d horas seguido de ressaca. Personagem pode ter oscilações súbitas de humor.' 
                },
                { 
                    id: 'ilegal', 
                    nome: 'Alcoolismo Ilegal', 
                    custo: -20, 
                    desc: 'Funciona como Alcoolismo Comum, mas como é ilegal no cenário, vale -20 pontos. Mais arriscado e com consequências legais adicionais.' 
                }
            ],
            multiplo: false // Não pode escolher ambas
        }
    },

    'altruismo': {
        id: 'altruismo',
        nome: 'Altruísmo',
        categoria: 'social',
        tipo: 'simples',
        icone: 'fa-hand-holding-heart',
        descricao: 'O personagem é altruísta — se sacrifica por outras pessoas e pouco se importa com fama ou riqueza pessoal. Precisa de sucesso em teste de autocontrole para colocar suas necessidades na frente de outras pessoas.',
        custoBase: -5,
        configuracao: null
    },

    'fobia': {
        id: 'fobia',
        nome: 'Fobia',
        categoria: 'mental',
        tipo: 'selecao',
        icone: 'fa-ghost',
        descricao: 'Medo mórbido, irracional e ilógico de um objeto, criatura ou circunstância específica. Quanto mais comum o objeto ou situação, maior o valor em pontos. O personagem deve fazer teste de autocontrole quando exposto à fobia.',
        custoBase: 0, // Será calculado com base nas seleções
        configuracao: {
            tipo: 'selecao-multipla',
            opcoes: [
                { id: 'acrofobia', nome: 'Acrofobia (Alturas)', custo: -10, desc: 'Não consegue ir voluntariamente a lugares com mais de 5m de altura.' },
                { id: 'agorafobia', nome: 'Agorafobia (Espaços Abertos)', custo: -10, desc: 'Desconfortável em lugares abertos, aterrorizado sem paredes num raio de 15m.' },
                { id: 'aracnofobia', nome: 'Aracnofobia (Aranhas)', custo: -5, desc: 'Medo de aranhas e outros aracnídeos.' },
                { id: 'autofobia', nome: 'Autofobia (Solidão)', custo: -15, desc: 'Não suporta ficar sozinho, evita isso a todo custo.' },
                { id: 'brontofobia', nome: 'Brontofobia (Ruídos Altos)', custo: -10, desc: 'Evita situações com possibilidade de ruídos altos.' },
                { id: 'cinofobia', nome: 'Cinofobia (Cães)', custo: -5, desc: 'Medo de cães e outros canídeos (lobos, raposas, etc.).' },
                { id: 'claustrofobia', nome: 'Claustrofobia (Espaços Fechados)', custo: -15, desc: 'Aterrorizado em ambientes fechados, sente que as paredes se fecham.' },
                { id: 'coitofobia', nome: 'Coitofobia (Sexo)', custo: -10, desc: 'Terror só de pensar em relação sexual.' },
                { id: 'demofobia', nome: 'Demofobia (Multidões)', custo: -15, desc: 'Medo de grupos com mais de uma dúzia de pessoas.' },
                { id: 'ecmofobia', nome: 'Ecmofobia (Coisas Afiadas)', custo: -10, desc: 'Medo de objetos contundentes (espadas, facas, agulhas).' },
                { id: 'elurofobia', nome: 'Elurofobia (Gatos)', custo: -5, desc: 'Medo de gatos e felinos.' },
                { id: 'entomofobia', nome: 'Entomofobia (Insetos)', custo: -10, desc: 'Medo de insetos em geral.' },
                { id: 'hematofobia', nome: 'Hematofobia (Sangue)', custo: -10, desc: 'Arrepios ao ver sangue, teste de autocontrole em combates.' },
                { id: 'heliofobia', nome: 'Heliofobia (Luz Solar)', custo: -15, desc: 'Medo da luz solar.' },
                { id: 'hoplofobia', nome: 'Hoplofobia (Armas)', custo: -20, desc: 'Transtornado por qualquer tipo de arma.' },
                { id: 'manafobia', nome: 'Manafobia (Magia)', custo: -10, desc: 'Incapaz de aprender magia, reage mal na presença de magia.' },
                { id: 'misofobia', nome: 'Misofobia (Sujeira)', custo: -10, desc: 'Medo de infecção ou sujeira, age de modo afetado.' },
                { id: 'necrofobia', nome: 'Necrofobia (Morte/Mortos)', custo: -10, desc: 'Terror com a ideia da morte e presença de mortos.' },
                { id: 'nictofobia', nome: 'Nictofobia (Escuridão)', custo: -15, desc: 'Medo comum mas incapacitante da escuridão.' },
                { id: 'ofiofobia', nome: 'Ofiofobia (Répteis)', custo: -10, desc: 'Terror de répteis, anfíbios e criaturas escamosas.' },
                { id: 'pirofobia', nome: 'Pirofobia (Fogo)', custo: -5, desc: 'Incomodado até por cigarro aceso a menos de 5 metros.' },
                { id: 'psicofobia', nome: 'Psicofobia (Poderes Psíquicos)', custo: -10, desc: 'Medo de pessoas com poderes psíquicos.' },
                { id: 'talassofobia', nome: 'Talassofobia (Oceanos)', custo: -10, desc: 'Medo de grandes massas de água, viagens marítimas inconcebíveis.' },
                { id: 'tecnofobia', nome: 'Tecnofobia (Maquinário)', custo: -15, desc: 'Incapaz de consertar máquinas, recusa usar tecnologia complexa.' },
                { id: 'teratofobia', nome: 'Teratofobia (Monstros)', custo: -15, desc: 'Medo de criaturas "antinaturais", penalidade varia com perigo.' },
                { id: 'triscedecofobia', nome: 'Triscedecofobia (Número 13)', custo: -5, desc: 'Teste de autocontrole para ações envolvendo o número 13.' },
                { id: 'xenofobia', nome: 'Xenofobia (Coisas Estranhas)', custo: -15, desc: 'Transtornado por circunstâncias estranhas e pessoas estranhas.' }
            ],
            multiplo: true, // Pode escolher várias fobias
            maximo: 10, // Limite razoável de fobias
            custoTotal: true // Soma os custos de todas as fobias selecionadas
        }
    }
};

// Função para buscar desvantagens por categoria
function filtrarDesvantagens(filtro = 'todos') {
    if (filtro === 'todos') {
        return Object.values(CATALOGO_DESVANTAGENS);
    }
    
    return Object.values(CATALOGO_DESVANTAGENS).filter(v => {
        if (filtro === 'opcoes') return v.tipo === 'opcoes';
        if (filtro === 'simples') return v.tipo === 'simples';
        if (filtro === 'selecao') return v.tipo === 'selecao';
        return v.categoria === filtro;
    });
}

// Função para buscar desvantagem por ID
function getDesvantagemPorId(id) {
    // Converter para minúsculas e remover acentos
    const idNormalizado = id.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // Primeiro tenta encontrar exato
    if (CATALOGO_DESVANTAGENS[id]) {
        return CATALOGO_DESVANTAGENS[id];
    }
    
    // Tenta encontrar normalizado
    for (const key in CATALOGO_DESVANTAGENS) {
        const keyNormalizado = key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (keyNormalizado === idNormalizado) {
            return CATALOGO_DESVANTAGENS[key];
        }
        
        // Também verifica pelo nome
        const nomeNormalizado = CATALOGO_DESVANTAGENS[key].nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (nomeNormalizado.includes(idNormalizado) || idNormalizado.includes(nomeNormalizado)) {
            return CATALOGO_DESVANTAGENS[key];
        }
    }
    
    console.error('Desvantagem não encontrada:', id);
    return null;
}

// Exportar para uso em desvantagens.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CATALOGO_DESVANTAGENS, filtrarDesvantagens, getDesvantagemPorId };
}