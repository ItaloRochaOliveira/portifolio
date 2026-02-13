// UI Effects Utils - Efeitos de interface e animações
class UIEffects {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                }
            });
        }, this.observerOptions);
    }
    
    // Animar elemento com fade-in
    animateElement(element, options = {}) {
        const {
            opacity = 1,
            transform = 'translateY(0)',
            duration = 600,
            delay = 0
        } = options;
        
        element.style.opacity = opacity;
        element.style.transform = transform;
        element.style.transition = `opacity ${duration}ms ease ${delay}ms, transform ${duration}ms ease ${delay}ms`;
    }
    
    // Configurar animação para múltiplos elementos
    setupScrollAnimations(selectors, staggerDelay = 100) {
        
        selectors.forEach((selector, index) => {
            const elements = document.querySelectorAll(selector);
            
            elements.forEach((element, elementIndex) => {
                // Estado inicial
                element.style.opacity = '0';
                element.style.transform = 'translateY(30px)';
                
                // Calcular delay baseado no índice
                const delay = index * staggerDelay + elementIndex * 50;
                
                // Observar para animação
                this.observer.observe(element);
                
                // Configurar animação customizada
                element.addEventListener('intersect', () => {
                    this.animateElement(element, { delay });
                });
            });
        });
    }
    
    // Efeito de digitação
    typeWriter(element, text, speed = 100, callback = null) {
        
        let i = 0;
        element.textContent = '';
        
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else if (callback) {
                callback();
            }
        }
        
        type();
    }
    
    // Efeito de header com scroll
    setupHeaderScrollEffect(headerSelector = '.header', scrollThreshold = 100) {
        
        const header = document.querySelector(headerSelector);
        if (!header) {
            return;
        }
        
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            
            if (scrollY > scrollThreshold) {
                header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                header.style.backdropFilter = 'blur(10px)';
            } else {
                header.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                header.style.backdropFilter = 'blur(0px)';
            }
        });
    }
    
    // Efeito de parallax simples
    setupParallax(elements, speed = 0.5) {
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            
            elements.forEach(element => {
                const rect = element.getBoundingClientRect();
                const speed = element.dataset.speed || speed;
                const yPos = -(scrolled * speed);
                
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }
    
    // Loading states
    showLoading(container, message = 'Carregando...') {
        
        container.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;
    }
    
    showError(container, message = 'Erro ao carregar. Tente novamente.') {
        
        container.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
            </div>
        `;
    }
    
    showEmpty(container, message = 'Nenhum item encontrado.') {
        
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>${message}</p>
            </div>
        `;
    }
    
    // Smooth scroll para elementos
    smoothScrollTo(target, duration = 800) {
        
        const targetElement = typeof target === 'string' ? 
            document.querySelector(target) : target;
            
        if (!targetElement) {
            return;
        }
        
        const startPosition = window.pageYOffset;
        const targetPosition = targetElement.offsetTop - 80; // Offset para header fixo
        const distance = targetPosition - startPosition;
        let startTime = null;
        
        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = ease(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }
        
        // Função de easing
        function ease(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }
        
        requestAnimationFrame(animation);
    }
    
    // Configurar navegação suave
    setupSmoothNavigation() {
        
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = anchor.getAttribute('href');
                this.smoothScrollTo(target);
            });
        });
    }
    
    // Adicionar CSS dinamicamente
    addCSS(css) {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }
    
    // Inicializar todos os efeitos
    init() {
        
        // Configurar animações de scroll
        this.setupScrollAnimations([
            'section',
            '.project-card'
        ]);
        
        // Configurar efeito no header
        this.setupHeaderScrollEffect();
        
        // Configurar navegação suave
        this.setupSmoothNavigation();
        
        // Adicionar CSS para loading states
        this.addCSS(`
            .loading {
                text-align: center;
                padding: 3rem;
                color: var(--text-light);
            }
            
            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid var(--border-color);
                border-top: 4px solid var(--primary-color);
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .error, .empty-state {
                text-align: center;
                padding: 3rem;
                color: var(--text-light);
            }
            
            .error {
                color: #dc2626;
            }
            
            .error i, .empty-state i {
                font-size: 3rem;
                margin-bottom: 1rem;
                display: block;
            }
        `);
    }
}

// Exportar para uso global
window.UIEffects = UIEffects;
