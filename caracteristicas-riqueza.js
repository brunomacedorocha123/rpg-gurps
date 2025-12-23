/* =========================================== */
/* SISTEMA DE RIQUEZA - PROFISSIONAL E COMPLETO */
/* =========================================== */

/**
 * CLASSE PRINCIPAL DO SISTEMA DE RIQUEZA
 * Sistema robusto com gerenciamento de estado, persistência, validação
 * e integração completa com o sistema de pontos da ficha.
 */
class WealthSystem {
    constructor(config = {}) {
        // Configurações do sistema
        this.config = {
            currencySymbol: '$',
            currencyFormat: 'en-US',
            autoSave: true,
            enableAnimations: true,
            pointsSystem: null,
            ...config
        };
        
        // Estado do sistema
        this.state = {
            currentLevel: '0',
            previousLevel: null,
            totalSpent: 0,
            history: [],
            isInitialized: false
        };
        
        // Definições completas dos níveis de riqueza
        this.wealthLevels = {
            '-25': {
                id: '-25',
                label: 'Falido',
                displayLabel: 'Falido [-25 pts]',
                points: -25,
                multiplier: 0.1,
                monthlyIncome: 0,
                description: 'Sem recursos, dependendo da caridade. Precisa de ajuda para sobreviver.',
                features: [
                    'Sem residência fixa',
                    'Alimentação precária',
                    'Sem acesso a cuidados médicos',
                    'Vive de esmolas/caridade'
                ],
                socialStatus: 'Marginalizado',
                colorClass: 'wealth-bankrupt',
                icon: 'fa-skull-crossbones'
            },
            '-15': {
                id: '-15',
                label: 'Pobre',
                displayLabel: 'Pobre [-15 pts]',
                points: -15,
                multiplier: 0.3,
                monthlyIncome: 300,
                description: 'Recursos mínimos para sobrevivência básica.',
                features: [
                    'Moradia precária',
                    'Alimentação básica',
                    'Trabalho instável',
                    'Sem reservas financeiras'
                ],
                socialStatus: 'Baixa',
                colorClass: 'wealth-poor',
                icon: 'fa-house-damage'
            },
            '-10': {
                id: '-10',
                label: 'Batalhador',
                displayLabel: 'Batalhador [-10 pts]',
                points: -10,
                multiplier: 0.6,
                monthlyIncome: 800,
                description: 'Vive com dificuldade, mas consegue se manter.',
                features: [
                    'Moradia simples',
                    'Alimentação regular',
                    'Trabalho estável',
                    'Poucas reservas'
                ],
                socialStatus: 'Baixa-Média',
                colorClass: 'wealth-struggling',
                icon: 'fa-hard-hat'
            },
            '0': {
                id: '0',
                label: 'Médio',
                displayLabel: 'Médio [0 pts]',
                points: 0,
                multiplier: 1.0,
                monthlyIncome: 1000,
                description: 'Nível de recursos pré-definido padrão. Vida confortável dentro dos padrões.',
                features: [
                    'Moradia adequada',
                    'Alimentação balanceada',
                    'Trabalho regular',
                    'Algumas reservas',
                    'Acesso a educação básica'
                ],
                socialStatus: 'Média',
                colorClass: 'wealth-average',
                icon: 'fa-home'
            },
            '10': {
                id: '10',
                label: 'Confortável',
                displayLabel: 'Confortável [+10 pts]',
                points: 10,
                multiplier: 2.0,
                monthlyIncome: 2500,
                description: 'Vive bem, sem grandes preocupações financeiras.',
                features: [
                    'Boa moradia',
                    'Alimentação de qualidade',
                    'Trabalho bem remunerado',
                    'Reservas consideráveis',
                    'Lazer regular'
                ],
                socialStatus: 'Média-Alta',
                colorClass: 'wealth-comfortable',
                icon: 'fa-couch'
            },
            '20': {
                id: '20',
                label: 'Rico',
                displayLabel: 'Rico [+20 pts]',
                points: 20,
                multiplier: 5.0,
                monthlyIncome: 8000,
                description: 'Recursos abundantes, estilo de vida luxuoso.',
                features: [
                    'Excelente moradia',
                    'Alimentação gourmet',
                    'Profissão de prestígio',
                    'Grandes investimentos',
                    'Serviços domésticos'
                ],
                socialStatus: 'Alta',
                colorClass: 'wealth-rich',
                icon: 'fa-gem'
            },
            '30': {
                id: '30',
                label: 'Muito Rico',
                displayLabel: 'Muito Rico [+30 pts]',
                points: 30,
                multiplier: 10.0,
                monthlyIncome: 15000,
                description: 'Fortuna considerável, influência econômica significativa.',
                features: [
                    'Múltiplas propriedades',
                    'Chef particular',
                    'Empresário/Investidor',
                    'Portfólio diversificado',
                    'Influência social'
                ],
                socialStatus: 'Elite',
                colorClass: 'wealth-very-rich',
                icon: 'fa-crown'
            },
            '50': {
                id: '50',
                label: 'Podre de Rico',
                displayLabel: 'Podre de Rico [+50 pts]',
                points: 50,
                multiplier: 25.0,
                monthlyIncome: 40000,
                description: 'Riqueza excepcional, poder econômico que transcende fronteiras.',
                features: [
                    'Palácios/mansões',
                    'Equipe de serviço completa',
                    'Magnata/Industrial',
                    'Influência política',
                    'Patrimônio geracional'
                ],
                socialStatus: 'Aristocracia',
                colorClass: 'wealth-filthy-rich',
                icon: 'fa-landmark'
            }
        };
        
        // Cache de elementos DOM
        this.elements = {};
        
        // Sistema de eventos
        this.events = {
            onWealthChange: [],
            onPointsUpdate: [],
            onSave: [],
            onError: []
        };
        
        // Inicialização
        this.initialize();
    }
    
    /**
     * INICIALIZAÇÃO DO SISTEMA
     */
    initialize() {
        try {
            this.cacheDOMElements();
            this.loadSavedState();
            this.bindEvents();
            this.setupUI();
            this.updateAllDisplays();
            this.setupPointsSystem();
            
            this.state.isInitialized = true;
            this.log('Sistema de riqueza inicializado com sucesso', 'success');
            
            // Disparar evento de inicialização
            this.dispatchEvent('system:initialized', this.state);
            
        } catch (error) {
            this.handleError('Erro na inicialização', error);
        }
    }
    
    /**
     * CACHE DE ELEMENTOS DOM
     */
    cacheDOMElements() {
        const requiredElements = {
            // Elementos principais
            nivelRiqueza: 'nivelRiqueza',
            pontosRiqueza: 'pontosRiqueza',
            multiplicadorRiqueza: 'multiplicadorRiqueza',
            rendaMensal: 'rendaMensal',
            descricaoRiqueza: 'descricaoRiqueza',
            
            // Containers para UI avançada
            riquezaContainer: 'riqueza-container',
            sectionHeader: '.section-header'
        };
        
        for (const [key, selector] of Object.entries(requiredElements)) {
            const element = selector.startsWith('.') || selector.startsWith('#') 
                ? document.querySelector(selector)
                : document.getElementById(selector);
            
            if (!element) {
                this.log(`Elemento não encontrado: ${selector}`, 'warn');
            }
            
            this.elements[key] = element;
        }
        
        // Validar elementos críticos
        if (!this.elements.nivelRiqueza) {
            throw new Error('Elemento crítico "nivelRiqueza" não encontrado');
        }
    }
    
    /**
     * CONFIGURAR SISTEMA DE PONTOS
     */
    setupPointsSystem() {
        if (!this.config.pointsSystem) {
            // Tentar encontrar sistema global
            if (window.fichaPointsSystem) {
                this.config.pointsSystem = window.fichaPointsSystem;
            } else if (window.pointsManager) {
                this.config.pointsSystem = window.pointsManager;
            } else {
                this.log('Sistema de pontos não configurado. Usando modo standalone.', 'info');
                this.setupMockPointsSystem();
            }
        }
        
        if (this.config.pointsSystem) {
            this.log('Sistema de pontos integrado', 'success');
            this.updatePointsAvailability();
        }
    }
    
    /**
     * MOCK DO SISTEMA DE PONTOS (para desenvolvimento)
     */
    setupMockPointsSystem() {
        this.config.pointsSystem = {
            availablePoints: 100,
            spentPoints: 0,
            categories: {},
            
            canSpend: (amount, category = 'wealth') => {
                return this.config.pointsSystem.availablePoints >= amount;
            },
            
            spend: (amount, category = 'wealth') => {
                if (this.config.pointsSystem.canSpend(amount, category)) {
                    this.config.pointsSystem.availablePoints -= amount;
                    this.config.pointsSystem.spentPoints += amount;
                    this.config.pointsSystem.categories[category] = 
                        (this.config.pointsSystem.categories[category] || 0) + amount;
                    return true;
                }
                return false;
            },
            
            refund: (amount, category = 'wealth') => {
                this.config.pointsSystem.availablePoints += amount;
                this.config.pointsSystem.spentPoints -= amount;
                this.config.pointsSystem.categories[category] = 
                    Math.max(0, (this.config.pointsSystem.categories[category] || 0) - amount);
            },
            
            getAvailable: () => this.config.pointsSystem.availablePoints,
            getSpent: (category) => category ? 
                (this.config.pointsSystem.categories[category] || 0) : 
                this.config.pointsSystem.spentPoints
        };
        
        window.mockPointsSystem = this.config.pointsSystem;
    }
    
    /**
     * CONFIGURAR INTERFACE DO USUÁRIO
     */
    setupUI() {
        this.enhanceSelectElement();
        this.createAdvancedDisplay();
        this.createControlPanel();
        this.createWealthDetailsPanel();
        this.applyInitialStyles();
    }
    
    /**
     * MELHORAR ELEMENTO SELECT
     */
    enhanceSelectElement() {
        const select = this.elements.nivelRiqueza;
        if (!select) return;
        
        // Adicionar classes CSS
        select.classList.add('wealth-select-enhanced');
        
        // Adicionar tooltip dinâmico
        select.addEventListener('mouseover', (e) => {
            const level = this.wealthLevels[e.target.value];
            if (level) {
                this.showTooltip(select, this.createLevelTooltip(level));
            }
        });
        
        select.addEventListener('mouseout', () => {
            this.hideTooltip();
        });
    }
    
    /**
     * CRIAR DISPLAY AVANÇADO
     */
    createAdvancedDisplay() {
        const container = this.elements.riquezaContainer;
        if (!container) return;
        
        // Criar display de status avançado
        const advancedDisplay = document.createElement('div');
        advancedDisplay.className = 'wealth-advanced-display';
        advancedDisplay.innerHTML = `
            <div class="wealth-status-card">
                <div class="wealth-status-header">
                    <i class="fas fa-chart-line"></i>
                    <h5>Status Financeiro Detalhado</h5>
                </div>
                <div class="wealth-status-body">
                    <div class="status-item">
                        <span class="status-label">Patrimônio Estimado:</span>
                        <span class="status-value" id="wealth-estimated-value">-</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">Poder de Compra:</span>
                        <span class="status-value" id="wealth-purchasing-power">-</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">Influência Social:</span>
                        <span class="status-value" id="wealth-social-influence">-</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">Custo de Vida:</span>
                        <span class="status-value" id="wealth-living-cost">-</span>
                    </div>
                </div>
            </div>
        `;
        
        // Adicionar ao container
        const infoDiv = container.querySelector('.riqueza-info');
        if (infoDiv) {
            container.insertBefore(advancedDisplay, infoDiv.nextSibling);
        } else {
            container.appendChild(advancedDisplay);
        }
        
        // Cache dos novos elementos
        this.elements.estimatedValue = document.getElementById('wealth-estimated-value');
        this.elements.purchasingPower = document.getElementById('wealth-purchasing-power');
        this.elements.socialInfluence = document.getElementById('wealth-social-influence');
        this.elements.livingCost = document.getElementById('wealth-living-cost');
    }
    
    /**
     * CRIAR PAINEL DE CONTROLE
     */
    createControlPanel() {
        const container = this.elements.riquezaContainer;
        if (!container) return;
        
        const controlPanel = document.createElement('div');
        controlPanel.className = 'wealth-control-panel';
        controlPanel.innerHTML = `
            <div class="control-header">
                <i class="fas fa-sliders-h"></i>
                <span>Controles Rápidos</span>
            </div>
            <div class="control-buttons">
                <button type="button" class="wealth-btn wealth-btn-down" title="Nível mais baixo">
                    <i class="fas fa-arrow-down"></i>
                    <span>Mais Pobre</span>
                </button>
                <button type="button" class="wealth-btn wealth-btn-up" title="Nível mais alto">
                    <i class="fas fa-arrow-up"></i>
                    <span>Mais Rico</span>
                </button>
                <button type="button" class="wealth-btn wealth-btn-reset" title="Resetar para médio">
                    <i class="fas fa-undo"></i>
                    <span>Resetar</span>
                </button>
                <button type="button" class="wealth-btn wealth-btn-save" title="Salvar configuração">
                    <i class="fas fa-save"></i>
                    <span>Salvar</span>
                </button>
            </div>
            <div class="control-info">
                <div class="info-item">
                    <span>Pontos disponíveis:</span>
                    <strong id="wealth-available-points">100</strong>
                </div>
                <div class="info-item">
                    <span>Custo desta mudança:</span>
                    <strong id="wealth-change-cost">0</strong>
                </div>
            </div>
        `;
        
        container.appendChild(controlPanel);
        
        // Cache e eventos dos botões
        this.setupControlButtons();
        this.elements.availablePoints = document.getElementById('wealth-available-points');
        this.elements.changeCost = document.getElementById('wealth-change-cost');
    }
    
    /**
     * CONFIGURAR BOTÕES DE CONTROLE
     */
    setupControlButtons() {
        const buttons = {
            'wealth-btn-down': () => this.decreaseWealthLevel(),
            'wealth-btn-up': () => this.increaseWealthLevel(),
            'wealth-btn-reset': () => this.resetWealthLevel(),
            'wealth-btn-save': () => this.saveConfiguration()
        };
        
        for (const [className, handler] of Object.entries(buttons)) {
            const button = document.querySelector(`.${className}`);
            if (button) {
                button.addEventListener('click', handler);
                
                // Efeitos visuais
                button.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-2px) scale(1.05)';
                });
                
                button.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0) scale(1)';
                });
            }
        }
    }
    
    /**
     * CRIAR PAINEL DE DETALHES
     */
    createWealthDetailsPanel() {
        const container = this.elements.riquezaContainer;
        if (!container) return;
        
        const detailsPanel = document.createElement('div');
        detailsPanel.className = 'wealth-details-panel';
        detailsPanel.innerHTML = `
            <div class="details-header" onclick="this.parentElement.classList.toggle('expanded')">
                <i class="fas fa-info-circle"></i>
                <h6>Detalhes do Nível de Riqueza</h6>
                <i class="fas fa-chevron-down toggle-icon"></i>
            </div>
            <div class="details-content">
                <div class="details-section">
                    <h7><i class="fas fa-home"></i> Padrão de Vida</h7>
                    <ul id="wealth-lifestyle-features"></ul>
                </div>
                <div class="details-section">
                    <h7><i class="fas fa-users"></i> Status Social</h7>
                    <p id="wealth-social-status"></p>
                </div>
                <div class="details-section">
                    <h7><i class="fas fa-balance-scale"></i> Vantagens & Desvantagens</h7>
                    <div id="wealth-advantages"></div>
                </div>
                <div class="details-section">
                    <h7><i class="fas fa-exchange-alt"></i> Transições Possíveis</h7>
                    <div id="wealth-transitions"></div>
                </div>
            </div>
        `;
        
        container.appendChild(detailsPanel);
        
        // Cache dos elementos
        this.elements.lifestyleFeatures = document.getElementById('wealth-lifestyle-features');
        this.elements.socialStatus = document.getElementById('wealth-social-status');
        this.elements.advantages = document.getElementById('wealth-advantages');
        this.elements.transitions = document.getElementById('wealth-transitions');
    }
    
    /**
     * APLICAR ESTILOS INICIAIS
     */
    applyInitialStyles() {
        // Adicionar estilos CSS dinamicamente
        if (!document.getElementById('wealth-system-styles')) {
            const styles = document.createElement('style');
            styles.id = 'wealth-system-styles';
            styles.textContent = this.getSystemStyles();
            document.head.appendChild(styles);
        }
    }
    
    /**
     * ESTILOS CSS DO SISTEMA
     */
    getSystemStyles() {
        return `
            /* Sistema de Riqueza - Estilos Avançados */
            .wealth-select-enhanced {
                background: linear-gradient(145deg, rgba(44, 32, 8, 0.9), rgba(26, 18, 0, 0.95)) !important;
                border: 2px solid var(--primary-gold) !important;
                color: var(--text-gold) !important;
                font-weight: bold;
                transition: all 0.3s ease;
            }
            
            .wealth-select-enhanced:hover {
                border-color: var(--secondary-gold) !important;
                box-shadow: 0 0 15px rgba(212, 175, 55, 0.3) !important;
            }
            
            .wealth-select-enhanced option {
                background: rgba(26, 18, 0, 0.95);
                color: var(--text-light);
                padding: 10px;
            }
            
            .wealth-select-enhanced option[value="-25"],
            .wealth-select-enhanced option[value="-15"],
            .wealth-select-enhanced option[value="-10"] {
                color: #e74c3c;
            }
            
            .wealth-select-enhanced option[value="10"],
            .wealth-select-enhanced option[value="20"] {
                color: #2ecc71;
            }
            
            .wealth-select-enhanced option[value="30"],
            .wealth-select-enhanced option[value="50"] {
                color: #f1c40f;
                font-weight: bold;
            }
            
            /* Display Avançado */
            .wealth-advanced-display {
                background: linear-gradient(145deg, rgba(26, 18, 0, 0.8), rgba(44, 32, 8, 0.9));
                border: 1px solid rgba(212, 175, 55, 0.3);
                border-radius: 8px;
                padding: 15px;
                margin-top: 15px;
            }
            
            .wealth-status-card {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .wealth-status-header {
                display: flex;
                align-items: center;
                gap: 10px;
                color: var(--text-gold);
                border-bottom: 1px solid rgba(212, 175, 55, 0.2);
                padding-bottom: 8px;
            }
            
            .wealth-status-header i {
                font-size: 1.2rem;
            }
            
            .wealth-status-header h5 {
                margin: 0;
                font-size: 1rem;
                font-weight: bold;
            }
            
            .wealth-status-body {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 10px;
            }
            
            .status-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 5px 0;
            }
            
            .status-label {
                color: var(--wood-light);
                font-size: 0.85rem;
            }
            
            .status-value {
                color: var(--text-gold);
                font-weight: bold;
                font-family: 'Cinzel', serif;
            }
            
            /* Painel de Controle */
            .wealth-control-panel {
                background: linear-gradient(145deg, rgba(44, 32, 8, 0.7), rgba(26, 18, 0, 0.8));
                border: 1px solid rgba(212, 175, 55, 0.4);
                border-radius: 8px;
                padding: 15px;
                margin-top: 15px;
            }
            
            .control-header {
                display: flex;
                align-items: center;
                gap: 10px;
                color: var(--text-gold);
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid rgba(212, 175, 55, 0.2);
            }
            
            .control-buttons {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 10px;
                margin-bottom: 15px;
            }
            
            .wealth-btn {
                padding: 8px 12px;
                background: linear-gradient(145deg, var(--wood-dark), #4a352b);
                border: 1px solid var(--wood-light);
                border-radius: 6px;
                color: var(--text-light);
                cursor: pointer;
                font-family: 'Cinzel', serif;
                font-size: 0.9rem;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .wealth-btn:hover {
                background: linear-gradient(145deg, var(--wood-light), var(--wood-dark));
                border-color: var(--primary-gold);
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(212, 175, 55, 0.2);
            }
            
            .wealth-btn:active {
                transform: translateY(0);
            }
            
            .wealth-btn-up {
                background: linear-gradient(145deg, rgba(46, 125, 50, 0.3), rgba(27, 94, 32, 0.4));
                border-color: #2e7d32;
            }
            
            .wealth-btn-down {
                background: linear-gradient(145deg, rgba(183, 28, 28, 0.3), rgba(136, 14, 14, 0.4));
                border-color: #b71c1c;
            }
            
            .wealth-btn-reset {
                background: linear-gradient(145deg, rgba(26, 18, 0, 0.8), rgba(44, 32, 8, 0.9));
                border-color: var(--primary-gold);
                color: var(--text-gold);
            }
            
            .wealth-btn-save {
                background: linear-gradient(145deg, rgba(30, 136, 229, 0.3), rgba(21, 101, 192, 0.4));
                border-color: #1e88e5;
            }
            
            .control-info {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                padding-top: 10px;
                border-top: 1px solid rgba(212, 175, 55, 0.2);
            }
            
            .control-info .info-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .control-info .info-item span {
                color: var(--wood-light);
                font-size: 0.9rem;
            }
            
            .control-info .info-item strong {
                color: var(--text-gold);
                font-size: 1.1rem;
                font-family: 'Cinzel', serif;
            }
            
            /* Painel de Detalhes */
            .wealth-details-panel {
                background: linear-gradient(145deg, rgba(26, 18, 0, 0.8), rgba(44, 32, 8, 0.9));
                border: 1px solid rgba(212, 175, 55, 0.3);
                border-radius: 8px;
                margin-top: 15px;
                overflow: hidden;
            }
            
            .details-header {
                padding: 12px 15px;
                background: rgba(212, 175, 55, 0.1);
                display: flex;
                align-items: center;
                gap: 10px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .details-header:hover {
                background: rgba(212, 175, 55, 0.15);
            }
            
            .details-header i:first-child {
                color: var(--secondary-gold);
            }
            
            .details-header h6 {
                margin: 0;
                flex: 1;
                color: var(--text-gold);
                font-size: 0.95rem;
            }
            
            .toggle-icon {
                transition: transform 0.3s ease;
            }
            
            .wealth-details-panel.expanded .toggle-icon {
                transform: rotate(180deg);
            }
            
            .details-content {
                padding: 15px;
                display: none;
                animation: slideDown 0.3s ease;
            }
            
            .wealth-details-panel.expanded .details-content {
                display: block;
            }
            
            .details-section {
                margin-bottom: 20px;
            }
            
            .details-section:last-child {
                margin-bottom: 0;
            }
            
            .details-section h7 {
                display: flex;
                align-items: center;
                gap: 8px;
                color: var(--text-gold);
                margin-bottom: 10px;
                font-size: 0.9rem;
                font-weight: bold;
            }
            
            .details-section ul {
                margin: 0;
                padding-left: 20px;
                color: var(--wood-light);
                font-size: 0.85rem;
                line-height: 1.5;
            }
            
            .details-section li {
                margin-bottom: 5px;
            }
            
            /* Animações */
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes wealthPulse {
                0% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(212, 175, 55, 0); }
                100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); }
            }
            
            .wealth-updating {
                animation: wealthPulse 1s ease;
            }
            
            /* Responsividade */
            @media (max-width: 768px) {
                .control-buttons {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .control-info {
                    grid-template-columns: 1fr;
                    gap: 10px;
                }
                
                .wealth-status-body {
                    grid-template-columns: 1fr;
                }
            }
            
            @media (max-width: 480px) {
                .control-buttons {
                    grid-template-columns: 1fr;
                }
            }
        `;
    }
    
    /**
     * VINCULAR EVENTOS
     */
    bindEvents() {
        // Evento principal do select
        if (this.elements.nivelRiqueza) {
            this.elements.nivelRiqueza.addEventListener('change', (e) => {
                this.changeWealthLevel(e.target.value);
            });
        }
        
        // Eventos de teclado para navegação rápida
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'ArrowUp') {
                e.preventDefault();
                this.increaseWealthLevel();
            } else if (e.ctrlKey && e.key === 'ArrowDown') {
                e.preventDefault();
                this.decreaseWealthLevel();
            } else if (e.ctrlKey && e.key === 'Home') {
                e.preventDefault();
                this.resetWealthLevel();
            }
        });
        
        // Evento de salvamento automático
        if (this.config.autoSave) {
            window.addEventListener('beforeunload', () => this.saveState());
        }
    }
    
    /**
     * ALTERAR NÍVEL DE RIQUEZA
     */
    changeWealthLevel(newLevel, options = {}) {
        try {
            // Validar entrada
            if (!this.wealthLevels[newLevel]) {
                throw new Error(`Nível de riqueza inválido: ${newLevel}`);
            }
            
            const oldLevel = this.state.currentLevel;
            const oldData = this.wealthLevels[oldLevel];
            const newData = this.wealthLevels[newLevel];
            
            // Calcular custo em pontos
            const pointsCost = newData.points - oldData.points;
            
            // Verificar se pode fazer a transição
            if (!this.canChangeWealthLevel(newLevel)) {
                this.showNotification(
                    `Pontos insuficientes para ${newData.label}. Necessários: ${pointsCost} pontos.`,
                    'error'
                );
                return false;
            }
            
            // Atualizar estado anterior
            this.state.previousLevel = oldLevel;
            
            // Processar transação de pontos
            if (pointsCost > 0) {
                // Gastar pontos
                const success = this.spendPoints(pointsCost, 'wealth');
                if (!success) {
                    this.showNotification('Erro ao processar pontos', 'error');
                    return false;
                }
                this.state.totalSpent += pointsCost;
            } else if (pointsCost < 0) {
                // Receber pontos de volta
                this.refundPoints(Math.abs(pointsCost), 'wealth');
                this.state.totalSpent += pointsCost; // pointsCost é negativo
            }
            
            // Atualizar estado atual
            this.state.currentLevel = newLevel;
            
            // Adicionar ao histórico
            this.state.history.push({
                timestamp: new Date().toISOString(),
                from: oldLevel,
                to: newLevel,
                points: pointsCost,
                totalSpent: this.state.totalSpent
            });
            
            // Limitar histórico
            if (this.state.history.length > 50) {
                this.state.history.shift();
            }
            
            // Atualizar interface
            this.updateAllDisplays();
            
            // Animar mudança
            if (this.config.enableAnimations) {
                this.animateWealthChange(oldLevel, newLevel);
            }
            
            // Disparar eventos
            this.dispatchEvent('wealth:changed', {
                oldLevel, newLevel, oldData, newData, pointsCost
            });
            
            // Salvar estado
            if (this.config.autoSave) {
                this.saveState();
            }
            
            // Mostrar confirmação
            if (!options.silent) {
                this.showNotification(
                    `Riqueza alterada para: ${newData.label}`,
                    'success'
                );
            }
            
            return true;
            
        } catch (error) {
            this.handleError('Erro ao alterar nível de riqueza', error);
            return false;
        }
    }
    
    /**
     * VERIFICAR SE PODE ALTERAR NÍVEL
     */
    canChangeWealthLevel(targetLevel) {
        if (!this.wealthLevels[targetLevel]) return false;
        
        const currentData = this.wealthLevels[this.state.currentLevel];
        const targetData = this.wealthLevels[targetLevel];
        const pointsNeeded = targetData.points - currentData.points;
        
        // Se está diminuindo (ganhando pontos), sempre permite
        if (pointsNeeded <= 0) return true;
        
        // Se está aumentando, verifica pontos disponíveis
        return this.config.pointsSystem ?
            this.config.pointsSystem.canSpend(pointsNeeded, 'wealth') :
            true; // Sem sistema de pontos, permite tudo
    }
    
    /**
     * AUMENTAR NÍVEL DE RIQUEZA
     */
    increaseWealthLevel() {
        const levels = Object.keys(this.wealthLevels);
        const currentIndex = levels.indexOf(this.state.currentLevel);
        
        if (currentIndex < levels.length - 1) {
            const nextLevel = levels[currentIndex + 1];
            return this.changeWealthLevel(nextLevel);
        }
        
        return false;
    }
    
    /**
     * DIMINUIR NÍVEL DE RIQUEZA
     */
    decreaseWealthLevel() {
        const levels = Object.keys(this.wealthLevels);
        const currentIndex = levels.indexOf(this.state.currentLevel);
        
        if (currentIndex > 0) {
            const prevLevel = levels[currentIndex - 1];
            return this.changeWealthLevel(prevLevel);
        }
        
        return false;
    }
    
    /**
     * RESETAR PARA NÍVEL PADRÃO
     */
    resetWealthLevel() {
        return this.changeWealthLevel('0');
    }
    
    /**
     * GASTAR PONTOS
     */
    spendPoints(amount, category = 'wealth') {
        if (!this.config.pointsSystem) return true;
        
        try {
            const success = this.config.pointsSystem.spend(amount, category);
            if (success) {
                this.dispatchEvent('points:spent', { amount, category });
                this.updatePointsDisplay();
                return true;
            }
            return false;
        } catch (error) {
            this.handleError('Erro ao gastar pontos', error);
            return false;
        }
    }
    
    /**
     * REEMBOLSAR PONTOS
     */
    refundPoints(amount, category = 'wealth') {
        if (!this.config.pointsSystem) return;
        
        try {
            this.config.pointsSystem.refund(amount, category);
            this.dispatchEvent('points:refunded', { amount, category });
            this.updatePointsDisplay();
        } catch (error) {
            this.handleError('Erro ao reembolsar pontos', error);
        }
    }
    
    /**
     * ATUALIZAR TODOS OS DISPLAYS
     */
    updateAllDisplays() {
        const currentData = this.wealthLevels[this.state.currentLevel];
        if (!currentData) return;
        
        // Atualizar elementos principais
        this.updateMainDisplay(currentData);
        
        // Atualizar display avançado
        this.updateAdvancedDisplay(currentData);
        
        // Atualizar painel de detalhes
        this.updateDetailsPanel(currentData);
        
        // Atualizar disponibilidade de pontos
        this.updatePointsAvailability();
        
        // Atualizar select
        if (this.elements.nivelRiqueza) {
            this.elements.nivelRiqueza.value = this.state.currentLevel;
        }
    }
    
    /**
     * ATUALIZAR DISPLAY PRINCIPAL
     */
    updateMainDisplay(data) {
        // Pontos
        if (this.elements.pontosRiqueza) {
            this.elements.pontosRiqueza.textContent = 
                `${data.points >= 0 ? '+' : ''}${data.points} pts`;
            
            // Aplicar classes CSS baseadas no valor
            this.elements.pontosRiqueza.className = 'pontos-badge';
            if (data.points >= 30) {
                this.elements.pontosRiqueza.classList.add('destaque-positivo', 'status-ok');
            } else if (data.points >= 10) {
                this.elements.pontosRiqueza.classList.add('status-ok');
            } else if (data.points >= 0) {
                this.elements.pontosRiqueza.classList.add('status-warning');
            } else {
                this.elements.pontosRiqueza.classList.add('destaque-negativo', 'status-danger');
            }
        }
        
        // Multiplicador
        if (this.elements.multiplicadorRiqueza) {
            this.elements.multiplicadorRiqueza.textContent = `${data.multiplier.toFixed(1)}x`;
        }
        
        // Renda mensal
        if (this.elements.rendaMensal) {
            this.elements.rendaMensal.textContent = this.formatCurrency(data.monthlyIncome);
        }
        
        // Descrição
        if (this.elements.descricaoRiqueza) {
            this.elements.descricaoRiqueza.textContent = data.description;
        }
    }
    
    /**
     * ATUALIZAR DISPLAY AVANÇADO
     */
    updateAdvancedDisplay(data) {
        if (!this.elements.estimatedValue) return;
        
        // Calcular valores avançados
        const estimatedValue = data.monthlyIncome * 120; // 10 anos de renda
        const purchasingPower = this.calculatePurchasingPower(data.multiplier);
        const socialInfluence = this.calculateSocialInfluence(data.points);
        const livingCost = data.monthlyIncome * 0.6; // 60% da renda
        
        // Atualizar elementos
        this.elements.estimatedValue.textContent = this.formatCurrency(estimatedValue);
        this.elements.purchasingPower.textContent = purchasingPower;
        this.elements.socialInfluence.textContent = socialInfluence;
        this.elements.livingCost.textContent = this.formatCurrency(livingCost);
    }
    
    /**
     * ATUALIZAR PAINEL DE DETALHES
     */
    updateDetailsPanel(data) {
        if (!this.elements.lifestyleFeatures) return;
        
        // Características do estilo de vida
        this.elements.lifestyleFeatures.innerHTML = data.features
            .map(feature => `<li>${feature}</li>`)
            .join('');
        
        // Status social
        if (this.elements.socialStatus) {
            this.elements.socialStatus.textContent = data.socialStatus;
        }
        
        // Vantagens
        if (this.elements.advantages) {
            const advantages = this.getAdvantagesForLevel(data.id);
            this.elements.advantages.innerHTML = advantages
                .map(adv => `<div class="advantage-item">${adv}</div>`)
                .join('');
        }
        
        // Transições possíveis
        if (this.elements.transitions) {
            const transitions = this.getPossibleTransitions(data.id);
            this.elements.transitions.innerHTML = transitions
                .map(trans => `<div class="transition-item">${trans}</div>`)
                .join('');
        }
    }
    
    /**
     * ATUALIZAR DISPONIBILIDADE DE PONTOS
     */
    updatePointsAvailability() {
        if (!this.config.pointsSystem) return;
        
        // Atualizar display de pontos disponíveis
        if (this.elements.availablePoints) {
            const available = this.config.pointsSystem.getAvailable();
            this.elements.availablePoints.textContent = available;
            
            // Estilo baseado na quantidade
            this.elements.availablePoints.style.color = 
                available >= 20 ? '#2ecc71' : 
                available >= 10 ? '#f39c12' : 
                '#e74c3c';
        }
        
        // Atualizar custo da próxima mudança
        if (this.elements.changeCost) {
            const currentIndex = Object.keys(this.wealthLevels).indexOf(this.state.currentLevel);
            const nextLevel = Object.keys(this.wealthLevels)[currentIndex + 1];
            
            if (nextLevel) {
                const currentData = this.wealthLevels[this.state.currentLevel];
                const nextData = this.wealthLevels[nextLevel];
                const cost = nextData.points - currentData.points;
                
                this.elements.changeCost.textContent = cost;
                this.elements.changeCost.style.color = 
                    this.config.pointsSystem.canSpend(cost, 'wealth') ? 
                    '#2ecc71' : '#e74c3c';
            } else {
                this.elements.changeCost.textContent = 'Máx.';
                this.elements.changeCost.style.color = '#3498db';
            }
        }
        
        // Atualizar estado das opções do select
        this.updateSelectOptionsAvailability();
    }
    
    /**
     * ATUALIZAR DISPONIBILIDADE DAS OPÇÕES DO SELECT
     */
    updateSelectOptionsAvailability() {
        const select = this.elements.nivelRiqueza;
        if (!select) return;
        
        const currentData = this.wealthLevels[this.state.currentLevel];
        
        Array.from(select.options).forEach(option => {
            const levelData = this.wealthLevels[option.value];
            if (levelData) {
                const pointsNeeded = levelData.points - currentData.points;
                
                if (pointsNeeded > 0) {
                    // Aumento requer pontos
                    const canAfford = this.config.pointsSystem ?
                        this.config.pointsSystem.canSpend(pointsNeeded, 'wealth') :
                        false;
                    
                    option.disabled = !canAfford;
                    option.style.opacity = canAfford ? '1' : '0.5';
                    option.title = canAfford ? 
                        `Custo: ${pointsNeeded} pontos` : 
                        `Pontos insuficientes. Necessários: ${pointsNeeded}`;
                } else {
                    // Diminuição ou mesmo nível
                    option.disabled = false;
                    option.style.opacity = '1';
                    option.title = pointsNeeded < 0 ? 
                        `Recebe ${Math.abs(pointsNeeded)} pontos` : 
                        levelData.description;
                }
            }
        });
    }
    
    /**
     * ATUALIZAR DISPLAY DE PONTOS
     */
    updatePointsDisplay() {
        // Esta função seria chamada quando o sistema de pontos é atualizado
        this.updatePointsAvailability();
    }
    
    /**
     * ANIMAR MUDANÇA DE RIQUEZA
     */
    animateWealthChange(oldLevel, newLevel) {
        // Animar o container principal
        const container = this.elements.riquezaContainer;
        if (container) {
            container.classList.add('wealth-updating');
            setTimeout(() => {
                container.classList.remove('wealth-updating');
            }, 1000);
        }
        
        // Animar o badge de pontos
        if (this.elements.pontosRiqueza) {
            this.elements.pontosRiqueza.style.transform = 'scale(1.2)';
            setTimeout(() => {
                this.elements.pontosRiqueza.style.transform = 'scale(1)';
            }, 300);
        }
    }
    
    /**
     * CALCULAR PODER DE COMPRA
     */
    calculatePurchasingPower(multiplier) {
        const levels = [
            'Mínimo', 'Baixo', 'Moderado', 'Adequado', 
            'Bom', 'Alto', 'Muito Alto', 'Excepcional'
        ];
        const index = Math.min(Math.floor(multiplier / 3.5), levels.length - 1);
        return levels[index];
    }
    
    /**
     * CALCULAR INFLUÊNCIA SOCIAL
     */
    calculateSocialInfluence(points) {
        if (points >= 40) return 'Aristocrática';
        if (points >= 25) return 'Elite';
        if (points >= 15) return 'Alta';
        if (points >= 5) return 'Média-Alta';
        if (points >= 0) return 'Média';
        if (points >= -10) return 'Baixa-Média';
        if (points >= -20) return 'Baixa';
        return 'Marginalizada';
    }
    
    /**
     * OBTER VANTAGENS DO NÍVEL
     */
    getAdvantagesForLevel(level) {
        const advantages = {
            '-25': ['Recebe 25 pontos para usar em outras áreas'],
            '-15': ['Recebe 15 pontos para usar em outras áreas'],
            '-10': ['Recebe 10 pontos para usar em outras áreas'],
            '0': ['Equilíbrio ideal para início de campanha'],
            '10': ['+1 em testes sociais com comerciantes', 'Desconto de 10% em compras'],
            '20': ['+2 em testes sociais com nobres', 'Acesso a itens de qualidade'],
            '30': ['+3 em testes de influência', 'Pode financiar pequenos projetos'],
            '50': ['+5 em testes de autoridade', 'Pode bancar expedições inteiras']
        };
        
        return advantages[level] || [];
    }
    
    /**
     * OBTER TRANSIÇÕES POSSÍVEIS
     */
    getPossibleTransitions(level) {
        const transitions = [];
        const currentIndex = Object.keys(this.wealthLevels).indexOf(level);
        const levels = Object.keys(this.wealthLevels);
        
        if (currentIndex > 0) {
            const prevLevel = levels[currentIndex - 1];
            const prevData = this.wealthLevels[prevLevel];
            const pointsGained = this.wealthLevels[level].points - prevData.points;
            transitions.push(`▼ ${prevData.label}: Recebe ${Math.abs(pointsGained)} pontos`);
        }
        
        if (currentIndex < levels.length - 1) {
            const nextLevel = levels[currentIndex + 1];
            const nextData = this.wealthLevels[nextLevel];
            const pointsNeeded = nextData.points - this.wealthLevels[level].points;
            transitions.push(`▲ ${nextData.label}: Custa ${pointsNeeded} pontos`);
        }
        
        return transitions;
    }
    
    /**
     * FORMATAR MOEDA
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat(this.config.currencyFormat, {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount).replace('USD', this.config.currencySymbol);
    }
    
    /**
     * CRIAR TOOLTIP PARA NÍVEL
     */
    createLevelTooltip(levelData) {
        return `
            <div class="wealth-tooltip">
                <strong>${levelData.label}</strong>
                <div class="tooltip-content">
                    <div>Pontos: ${levelData.points >= 0 ? '+' : ''}${levelData.points}</div>
                    <div>Multiplicador: ${levelData.multiplier.toFixed(1)}x</div>
                    <div>Renda: ${this.formatCurrency(levelData.monthlyIncome)}/mês</div>
                    <div>Status: ${levelData.socialStatus}</div>
                </div>
            </div>
        `;
    }
    
    /**
     * MOSTRAR TOOLTIP
     */
    showTooltip(element, content) {
        // Implementar tooltip avançado
        // (código simplificado para exemplo)
        console.log('Tooltip:', content);
    }
    
    /**
     * ESCONDER TOOLTIP
     */
    hideTooltip() {
        // Implementar
    }
    
    /**
     * MOSTRAR NOTIFICAÇÃO
     */
    showNotification(message, type = 'info') {
        // Criar notificação estilizada
        const notification = document.createElement('div');
        notification.className = `wealth-notification wealth-notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Estilos da notificação
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'rgba(46, 125, 50, 0.9)' : 
                         type === 'error' ? 'rgba(183, 28, 28, 0.9)' : 
                         'rgba(21, 101, 192, 0.9)'};
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remover após 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    /**
     * SALVAR CONFIGURAÇÃO
     */
    saveConfiguration() {
        const config = {
            currentLevel: this.state.currentLevel,
            totalSpent: this.state.totalSpent,
            timestamp: new Date().toISOString()
        };
        
        // Disparar evento antes de salvar
        this.dispatchEvent('config:beforeSave', config);
        
        this.saveState();
        
        this.showNotification('Configuração salva com sucesso', 'success');
        
        // Disparar evento após salvar
        this.dispatchEvent('config:saved', config);
    }
    
    /**
     * SALVAR ESTADO
     */
    saveState() {
        try {
            const stateToSave = {
                currentLevel: this.state.currentLevel,
                totalSpent: this.state.totalSpent,
                history: this.state.history.slice(-10), // Salvar apenas últimos 10
                savedAt: new Date().toISOString()
            };
            
            localStorage.setItem('wealthSystemState', JSON.stringify(stateToSave));
            
            // Disparar evento
            this.dispatchEvent('state:saved', stateToSave);
            
        } catch (error) {
            this.handleError('Erro ao salvar estado', error);
        }
    }
    
    /**
     * CARREGAR ESTADO SALVO
     */
    loadSavedState() {
        try {
            const saved = localStorage.getItem('wealthSystemState');
            if (saved) {
                const state = JSON.parse(saved);
                
                // Validar e restaurar
                if (state.currentLevel && this.wealthLevels[state.currentLevel]) {
                    this.state.currentLevel = state.currentLevel;
                    this.state.totalSpent = state.totalSpent || 0;
                    this.state.history = state.history || [];
                    
                    this.log('Estado carregado do armazenamento local', 'info');
                    
                    // Disparar evento
                    this.dispatchEvent('state:loaded', state);
                }
            }
        } catch (error) {
            this.handleError('Erro ao carregar estado salvo', error);
        }
    }
    
    /**
     * REGISTRAR NO HISTÓRICO
     */
    log(message, level = 'info') {
        const timestamp = new Date().toISOString();
        const logEntry = { timestamp, level, message };
        
        console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
            `[WealthSystem ${timestamp}] ${message}`
        );
        
        // Disparar evento de log
        this.dispatchEvent('system:log', logEntry);
    }
    
    /**
     * MANIPULAR ERROS
     */
    handleError(message, error) {
        const errorObj = {
            message,
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        };
        
        this.log(`${message}: ${error.message}`, 'error');
        
        // Disparar evento de erro
        this.dispatchEvent('system:error', errorObj);
        
        // Mostrar notificação de erro para o usuário
        this.showNotification(`${message}. Verifique o console para detalhes.`, 'error');
    }
    
    /**
     * DISPARAR EVENTO
     */
    dispatchEvent(eventName, data) {
        // Disparar evento DOM
        const domEvent = new CustomEvent(`wealth:${eventName}`, {
            detail: data,
            bubbles: true
        });
        
        if (this.elements.nivelRiqueza) {
            this.elements.nivelRiqueza.dispatchEvent(domEvent);
        }
        
        // Chamar callbacks registrados
        const callbacks = this.events[eventName] || [];
        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('Erro em callback de evento:', error);
            }
        });
    }
    
    /**
     * REGISTRAR LISTENER DE EVENTO
     */
    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }
    
    /**
     * OBTER DADOS ATUAIS (API PÚBLICA)
     */
    getCurrentData() {
        return {
            ...this.wealthLevels[this.state.currentLevel],
            state: { ...this.state },
            canIncrease: this.canChangeWealthLevel(
                Object.keys(this.wealthLevels)[
                    Object.keys(this.wealthLevels).indexOf(this.state.currentLevel) + 1
                ] || this.state.currentLevel
            ),
            canDecrease: this.state.currentLevel !== '-25'
        };
    }
    
    /**
     * API PÚBLICA - SETAR NÍVEL
     */
    setLevel(level) {
        return this.changeWealthLevel(level, { silent: true });
    }
    
    /**
     * API PÚBLICA - OBTER HISTÓRICO
     */
    getHistory() {
        return [...this.state.history];
    }
    
    /**
     * API PÚBLICA - EXPORTAR DADOS
     */
    exportData() {
        return {
            system: 'WealthSystem v1.0',
            timestamp: new Date().toISOString(),
            config: { ...this.config },
            state: { ...this.state },
            currentData: this.getCurrentData(),
            wealthLevels: Object.keys(this.wealthLevels).reduce((acc, key) => {
                acc[key] = {
                    label: this.wealthLevels[key].label,
                    points: this.wealthLevels[key].points,
                    multiplier: this.wealthLevels[key].multiplier
                };
                return acc;
            }, {})
        };
    }
    
    /**
     * API PÚBLICA - RESETAR SISTEMA
     */
    resetSystem() {
        if (confirm('Tem certeza que deseja resetar o sistema de riqueza? Todo o histórico será perdido.')) {
            this.state = {
                currentLevel: '0',
                previousLevel: null,
                totalSpent: 0,
                history: [],
                isInitialized: true
            };
            
            // Reembolsar pontos gastos
            if (this.config.pointsSystem) {
                const spent = this.config.pointsSystem.getSpent('wealth');
                if (spent > 0) {
                    this.refundPoints(spent, 'wealth');
                }
            }
            
            this.updateAllDisplays();
            localStorage.removeItem('wealthSystemState');
            
            this.showNotification('Sistema de riqueza resetado', 'info');
            this.dispatchEvent('system:reset', {});
            
            return true;
        }
        return false;
    }
}

/* =========================================== */
/* INICIALIZAÇÃO GLOBAL DO SISTEMA */
/* =========================================== */

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se já existe uma instância
    if (window.wealthSystem) {
        console.warn('WealthSystem já está inicializado');
        return;
    }
    
    // Configurar opções do sistema
    const systemConfig = {
        currencySymbol: '$',
        currencyFormat: 'pt-BR',
        autoSave: true,
        enableAnimations: true,
        pointsSystem: window.fichaPointsSystem || window.pointsManager || null
    };
    
    try {
        // Criar instância do sistema
        window.wealthSystem = new WealthSystem(systemConfig);
        
        // Expor API global
        window.WealthSystemAPI = {
            getLevel: () => window.wealthSystem.getCurrentData(),
            setLevel: (level) => window.wealthSystem.setLevel(level),
            increase: () => window.wealthSystem.increaseWealthLevel(),
            decrease: () => window.wealthSystem.decreaseWealthLevel(),
            reset: () => window.wealthSystem.resetWealthLevel(),
            export: () => window.wealthSystem.exportData(),
            resetSystem: () => window.wealthSystem.resetSystem(),
            on: (event, callback) => window.wealthSystem.on(event, callback)
        };
        
        // Log de sucesso
        console.log('%c⚜️ Wealth System v1.0 Inicializado ⚜️', 
            'color: gold; font-size: 14px; font-weight: bold;');
        console.log('API disponível em:', window.WealthSystemAPI);
        
        // Evento global de inicialização
        const event = new CustomEvent('wealthSystem:ready', {
            detail: { version: '1.0', timestamp: new Date().toISOString() }
        });
        document.dispatchEvent(event);
        
    } catch (error) {
        console.error('Falha crítica na inicialização do WealthSystem:', error);
        
        // Fallback básico
        setupBasicWealthSystem();
    }
});

/* =========================================== */
/* FALLBACK BÁSICO (em caso de falha crítica) */
/* =========================================== */

function setupBasicWealthSystem() {
    console.log('Iniciando fallback básico do sistema de riqueza');
    
    const select = document.getElementById('nivelRiqueza');
    if (!select) return;
    
    const basicData = {
        '-25': { pts: -25, mult: '0.1x', renda: '$0' },
        '-15': { pts: -15, mult: '0.3x', renda: '$300' },
        '-10': { pts: -10, mult: '0.6x', renda: '$800' },
        '0': { pts: 0, mult: '1.0x', renda: '$1.000' },
        '10': { pts: 10, mult: '2.0x', renda: '$2.500' },
        '20': { pts: 20, mult: '5.0x', renda: '$8.000' },
        '30': { pts: 30, mult: '10.0x', renda: '$15.000' },
        '50': { pts: 50, mult: '25.0x', renda: '$40.000' }
    };
    
    function update() {
        const value = select.value;
        const data = basicData[value];
        
        if (data) {
            const pontos = document.getElementById('pontosRiqueza');
            const mult = document.getElementById('multiplicadorRiqueza');
            const renda = document.getElementById('rendaMensal');
            
            if (pontos) pontos.textContent = data.pts + ' pts';
            if (mult) mult.textContent = data.mult;
            if (renda) renda.textContent = data.renda;
        }
    }
    
    select.addEventListener('change', update);
    update(); // Atualizar inicial
    
    console.log('Fallback básico ativado');
}

/* =========================================== */
/* POLYFILLS E COMPATIBILIDADE */
/* =========================================== */

// Garantir que CustomEvent funcione em navegadores antigos
(function() {
    if (typeof window.CustomEvent === "function") return;
    
    function CustomEvent(event, params) {
        params = params || { bubbles: false, cancelable: false, detail: null };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }
    
    CustomEvent.prototype = window.Event.prototype;
    window.CustomEvent = CustomEvent;
})();

// Log de inicialização
console.log('WealthSystem Script Carregado - Aguardando inicialização...');