// Mobile Navigation Toggle
const mobileMenu = document.getElementById('mobile-menu');
const navMenu = document.querySelector('.nav-menu');

mobileMenu.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Configurações e variáveis globais
const CONFIG = {
    githubUsername: 'ItaloRochaOliveira',
    chosenProjects: [
        'type-orm-e-docker',
        'desafio-backend', // Substitua com nomes dos seus projetos preferidos
        'projeto3',
        'projeto4', 
        'projeto5'
    ],
    maxProjects: 8,
    autoPlayInterval: 5000
};

// Elementos DOM
const DOM = {
    carousel: document.getElementById('projects-carousel'),
    indicatorsContainer: document.getElementById('carousel-indicators'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn')
};

// Instâncias das utilidades
let githubAPI;
let profileManager;
let cardFactory;
let uiEffects;
let projectCarousel;

// Inicializar aplicação
async function initApp() {
    
    try {
        // Inicializar utilidades
        githubAPI = new GitHubAPI(CONFIG.githubUsername);
        profileManager = new ProfileManager(githubAPI);
        cardFactory = new ProjectCardFactory();
        uiEffects = new UIEffects();
        
        // Configurar efeitos de UI
        uiEffects.init();
        
        // Carregar dados do perfil
        await profileManager.init();
        
        // Carregar projetos
        await loadProjects();
        
        console.log('✅ Aplicação inicializada com sucesso');
        
    } catch (error) {
        console.error('❌ Erro ao inicializar aplicação:', error);
        uiEffects.showError(DOM.carousel, 'Erro ao inicializar a aplicação. Recarregue a página.');
    }
}

// Carregar projetos
async function loadProjects() {
    
    // Mostrar loading
    uiEffects.showLoading(DOM.carousel, 'Carregando projetos...');
    
    try {
        // Buscar projetos via API
        const projects = await githubAPI.fetchProjects(CONFIG.chosenProjects, CONFIG.maxProjects);
        
        if (projects.length === 0) {
            uiEffects.showEmpty(DOM.carousel, 'Nenhum projeto encontrado.');
            return;
        }
        
        // Criar e adicionar cards
        cardFactory.appendCardsToContainer(projects, DOM.carousel);
        
        // Obter estatísticas
        const stats = cardFactory.getProjectStats(projects);
        
        // Inicializar carrossel
        projectCarousel = new ProjectCarousel({
            carousel: DOM.carousel,
            indicatorsContainer: DOM.indicatorsContainer,
            prevBtn: DOM.prevBtn,
            nextBtn: DOM.nextBtn,
            autoPlayInterval: CONFIG.autoPlayInterval
        });
        
        projectCarousel.init(projects);
        
    } catch (error) {
        console.error('❌ Erro ao carregar projetos:', error);
        uiEffects.showError(DOM.carousel, 'Erro ao carregar projetos. Tente novamente mais tarde.');
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initApp);

// Função para copiar email e mostrar mensagem
function copyEmailToClipboard(email, event) {
    navigator.clipboard.writeText(email).then(() => {
        showEmailCopiedMessage(event);
    }).catch(err => {
        console.error('Erro ao copiar email:', err);
        // Fallback para navegadores mais antigos
        const textArea = document.createElement('textarea');
        textArea.value = email;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showEmailCopiedMessage(event);
    });
}

function showEmailCopiedMessage(event) {
    // Criar elemento de mensagem
    const message = document.createElement('div');
    message.textContent = 'Email copiado!';
    message.style.cssText = `
        position: fixed;
        background: rgba(37, 99, 235, 0.9);
        color: white;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        z-index: 1000;
        pointer-events: none;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        transform: translate(-50%, -120%);
        transition: all 0.3s ease;
    `;
    
    // Posicionar próximo ao clique
    const rect = event.target.getBoundingClientRect();
    message.style.left = rect.left + (rect.width / 2) + 'px';
    message.style.top = rect.top + 'px';
    
    document.body.appendChild(message);
    
    // Animar entrada
    setTimeout(() => {
        message.style.transform = 'translate(-50%, -140%)';
        message.style.opacity = '1';
    }, 10);
    
    // Remover mensagem após 2 segundos
    setTimeout(() => {
        message.style.opacity = '0';
        message.style.transform = 'translate(-50%, -120%)';
        setTimeout(() => {
            if (document.body.contains(message)) {
                document.body.removeChild(message);
            }
        }, 300);
    }, 2000);
}
