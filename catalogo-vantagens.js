// catalogo-vantagens.js - APENAS AS VANTAGENS QUE VOCÊ PEDIU
const CATALOGO_VANTAGENS = {
    // MENTAL/SOBRENATURAL
    'aptidao-magica': {
        id: 'aptidao-magica',
        nome: 'Aptidão Mágica',
        categoria: 'mental',
        tipo: 'opcoes',
        icone: 'fa-hat-wizard',
        descricao: 'O personagem é um adepto da magia. Aptidão Mágica 0 dá consciência mágica básica. Níveis mais altos dão bônus em magias.',
        custoBase: 5, // Aptidão Mágica 0
        configuracao: {
            tipo: 'niveis-com-limites',
            niveis: [
                { nivel: 0, custo: 5, desc: 'Aptidão Mágica 0 (consciência básica)' },
                { nivel: 1, custo: 15, desc: 'Aptidão Mágica 1 (+1 em magias)' },
                { nivel: 2, custo: 25, desc: 'Aptidão Mágica 2 (+2 em magias)' },
                { nivel: 3, custo: 35, desc: 'Aptidão Mágica 3 (+3 em magias)' }
            ],
            limiteNiveis: 3, // Máximo 3 como você mencionou
            limitações: [
                { id: 'canção', nome: 'Canção', percent: -40, desc: 'Tem que cantar para fazer mágicas' },
                { id: 'dança', nome: 'Dança', percent: -40, desc: 'Precisa realizar movimentos corporais' },
                { id: 'diurna', nome: 'Manifestação Diurna', percent: -40, desc: 'Só durante o dia' },
                { id: 'noturna', nome: 'Manifestação Noturna', percent: -40, desc: 'Só durante a noite' },
                { id: 'obscura', nome: 'Manifestação Obscura', percent: -50, desc: 'Só na escuridão' },
                { id: 'musical', nome: 'Musical', percent: -50, desc: 'Usa instrumento musical' },
                { id: 'solitaria', nome: 'Solitária', percent: -40, desc: '-3 por pessoa próxima' },
                { id: 'unica-escola', nome: 'Uma Única Escola', percent: -40, desc: 'Apenas uma escola de magia' }
            ]
        }
    },

    'abençoado': {
        id: 'abençoado',
        nome: 'Abençoado',
        categoria: 'mental',
        tipo: 'opcoes',
        icone: 'fa-hands-praying',
        descricao: 'O personagem está sintonizado com um deus, senhor demoníaco, grande espírito, poder cósmico, etc.',
        custoBase: 10,
        configuracao: {
            tipo: 'opcoes-multiplas',
            opcoes: [
                { 
                    id: 'basico', 
                    nome: 'Abençoado', 
                    custo: 10, 
                    desc: 'De vez em quando recebe sabedoria da entidade. Após comungar por 1 hora, recebe visões sobre eventos futuros. Teste de IQ secreto do Mestre para informação útil. Perde 10 PF no ritual. +1 de bônus de reação com seguidores.' 
                },
                { 
                    id: 'muito', 
                    nome: 'Muito Abençoado', 
                    custo: 20, 
                    desc: 'Funciona como Abençoado, mas teste de IQ para interpretar visões tem +5 de bônus. Bônus de reação dos seguidores é +2.' 
                },
                { 
                    id: 'feitos', 
                    nome: 'Feitos Heroicos', 
                    custo: 10, 
                    desc: 'Uma vez por sessão pode adicionar 1 dado à ST, DX ou HT por 3d segundos. Especificar característica ao comprar.' 
                }
            ],
            multiplo: false // Só pode escolher uma opção
        }
    },

    'adaptabilidade-cultural': {
        id: 'adaptabilidade-cultural',
        nome: 'Adaptabilidade Cultural',
        categoria: 'social',
        tipo: 'opcoes',
        icone: 'fa-globe-americas',
        descricao: 'O personagem está familiarizado com uma grande variedade de culturas. Nunca sofre penalidade de -3 por "desconhecimento cultural".',
        custoBase: 10,
        configuracao: {
            tipo: 'opcoes-multiplas',
            opcoes: [
                { 
                    id: 'basico', 
                    nome: 'Adaptabilidade Cultural', 
                    custo: 10, 
                    desc: 'Está familiarizado com todas as culturas de sua própria raça.' 
                },
                { 
                    id: 'xeno', 
                    nome: 'Xeno-Adaptabilidade', 
                    custo: 20, 
                    desc: 'Está familiarizado com todas as culturas do cenário, independente da raça.' 
                }
            ],
            multiplo: false
        }
    },

    'ambidestria': {
        id: 'ambidestria',
        nome: 'Ambidestria',
        categoria: 'fisica',
        tipo: 'simples',
        icone: 'fa-hands',
        descricao: 'O personagem é capaz de lutar e manusear igualmente bem com qualquer uma das mãos e nunca sofre a penalidade de -4 na DX por estar usando a mão inábil. Não permite ações adicionais no combate - para isso precisa de Ataque Adicional.',
        custoBase: 5,
        configuracao: null // Nenhuma configuração especial - vantagem simples
    }
};

// Função para buscar vantagens por categoria
function filtrarVantagens(filtro = 'todos') {
    if (filtro === 'todos') {
        return Object.values(CATALOGO_VANTAGENS);
    }
    
    return Object.values(CATALOGO_VANTAGENS).filter(v => {
        if (filtro === 'opcoes') return v.tipo === 'opcoes';
        if (filtro === 'simples') return v.tipo === 'simples';
        return v.categoria === filtro;
    });
}

// Função para buscar vantagem por ID
function getVantagemPorId(id) {
    return CATALOGO_VANTAGENS[id] || null;
}

// Exportar para uso em vantagens.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CATALOGO_VANTAGENS, filtrarVantagens, getVantagemPorId };
}