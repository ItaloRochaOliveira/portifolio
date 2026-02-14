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
    // Usar email do CONTACT_CONFIG se não for passado como parâmetro
    const emailToCopy = email || (window.CONTACT_CONFIG ? window.CONTACT_CONFIG.email : 'italo.rocha.de.oliveira@gmail.com');
    
    navigator.clipboard.writeText(emailToCopy).then(() => {
        showEmailCopiedMessage(event);
    }).catch(err => {
        console.error('Erro ao copiar email:', err);
        // Fallback para navegadores mais antigos
        const textArea = document.createElement('textarea');
        textArea.value = emailToCopy;
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

// Função para download do currículo
function downloadCV() {
    // Verificar se CONTACT_CONFIG existe, senão usar fallback
    const curriculumPath = window.CONTACT_CONFIG ? window.CONTACT_CONFIG.curriculum : './asents/docs/Italo Rocha Oliveira - Curriculo.pdf';
    
    // Criar um link temporário para download
    const link = document.createElement('a');
    link.href = curriculumPath;
    link.download = 'Italo_Rocha_Oliveira_Curriculo.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Mostrar mensagem de sucesso
    showSuccessMessage('Download do currículo iniciado!');
}

// Função para mostrar mensagem de sucesso genérica
function showSuccessMessage(text) {
    const message = document.createElement('div');
    message.textContent = text;
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(16, 185, 129, 0.9);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 500;
        z-index: 1000;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.style.opacity = '0';
        message.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(message)) {
                document.body.removeChild(message);
            }
        }, 300);
    }, 3000);
}

// Funcionalidade do formulário de contato
document.addEventListener('DOMContentLoaded', function() {
    // Usar configurações do config.js
    const EMAILJS_PUBLIC_KEY = EMAILJS_CONFIG.PUBLIC_KEY;
    const EMAILJS_SERVICE_ID = EMAILJS_CONFIG.SERVICE_ID;
    const EMAILJS_TEMPLATE_ID = EMAILJS_CONFIG.TEMPLATE_ID;
    
    // Inicializar EmailJS com as variáveis
    if (EMAILJS_PUBLIC_KEY !== 'SUA_PUBLIC_KEY_AQUI') {
        emailjs.init(EMAILJS_PUBLIC_KEY);
        console.log('✅ EmailJS inicializado com sucesso');
    } else {
        console.log('📝 Configure suas credenciais EmailJS no config.js.');
    }
    
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Desabilitado temporariamente - funcionalidade virá em atualizações futuras
            // Para habilitar, remova o comentário do bloco abaixo e comente a mensagem futura
            showSuccessMessage('Funcionalidade de envio de email virá em atualizações futuras!');
            contactForm.reset();
            
            /*
            // Código original (comentado) - descomente para habilitar envio real
            // Verificar se as credenciais foram configuradas
            if (EMAILJS_PUBLIC_KEY === 'SUA_PUBLIC_KEY_AQUI' || 
                EMAILJS_SERVICE_ID === 'SEU_SERVICE_ID' || 
                EMAILJS_TEMPLATE_ID === 'SEU_TEMPLATE_ID') {
                showErrorMessage('Configure as credenciais do EmailJS no config.js.');
                return;
            }
            
            // Obter dados do formulário
            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const message = formData.get('message');
            
            // Parâmetros para o template do EmailJS
            const templateParams = {
                from_name: name,
                from_email: email,
                message: message,
                to_email: 'italo.rocha.de.oliveira@gmail.com'
            };
            
            // Enviar email
            emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
                .then(function(response) {
                    showSuccessMessage('Mensagem enviada com sucesso! Entrarei em contato em breve.');
                    contactForm.reset();
                }, function(error) {
                    console.error('Erro ao enviar email:', error);
                    showErrorMessage('Erro ao enviar mensagem. Tente novamente mais tarde.');
                });
            */
        });
    }
});

// Função para mostrar mensagem de erro
function showErrorMessage(text) {
    const message = document.createElement('div');
    message.textContent = text;
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(239, 68, 68, 0.9);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 500;
        z-index: 1000;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.style.opacity = '0';
        message.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(message)) {
                document.body.removeChild(message);
            }
        }, 300);
    }, 3000);
}
