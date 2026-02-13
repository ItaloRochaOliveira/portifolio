// Carousel Utils - Lógica do carrossel de projetos
class ProjectCarousel {
    constructor(options = {}) {
        this.carousel = options.carousel;
        this.indicatorsContainer = options.indicatorsContainer;
        this.prevBtn = options.prevBtn;
        this.nextBtn = options.nextBtn;
        this.autoPlayInterval = options.autoPlayInterval || 5000;
        
        this.currentIndex = 0;
        this.projects = [];
        this.autoPlayTimer = null;
        this.isTransitioning = false;
        this.isAutoPlayNavigating = false;
        
    }
    
    // Criar indicadores do carrossel
    createIndicators() {
        this.indicatorsContainer.innerHTML = '';
        this.projects.forEach((_, index) => {
            const indicator = document.createElement('button');
            indicator.className = `indicator ${index === 0 ? 'active' : ''}`;
            indicator.addEventListener('click', () => this.goToSlide(index));
            this.indicatorsContainer.appendChild(indicator);
        });
    }
    
    // Atualizar indicadores ativos
    updateIndicators() {
        const indicators = this.indicatorsContainer.querySelectorAll('.indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
        });
    }
    
    // Navegar para slide específico
    goToSlide(index) {
        // Prevenir múltiplas navegações simultâneas
        if (this.isTransitioning) {
            return;
        }
        
        this.isTransitioning = true;
        
        if (index < 0) {
            index = this.projects.length - 1;
        }
        if (index >= this.projects.length) {
            index = 0;
        }
        
        this.currentIndex = index;
        this.carousel.style.transform = `translateX(-${this.currentIndex * 100}%)`;
        this.updateIndicators();
        
        // Resetar flag de transição após completar a animação
        setTimeout(() => {
            this.isTransitioning = false;
        }, 500); // Mesma duração da transição CSS
        
        // Resetar auto-play apenas se não for chamado pelo auto-play
        if (!this.isAutoPlayNavigating) {
            this.resetAutoPlay();
        }
    }
    
    // Próximo slide
    nextSlide() {
        this.goToSlide(this.currentIndex + 1);
    }
    
    // Slide anterior
    prevSlide() {
        this.goToSlide(this.currentIndex - 1);
    }
    
    // Auto-play
    startAutoPlay() {
        // Limpar qualquer timer existente
        this.stopAutoPlay();
        
        // Criar novo timer
        this.autoPlayTimer = setTimeout(() => {
            this.isAutoPlayNavigating = true;
            this.nextSlide();
            this.isAutoPlayNavigating = false;
            // Reiniciar o próximo ciclo após completar a animação
            this.startAutoPlay();
        }, this.autoPlayInterval);
    }
    
    stopAutoPlay() {
        this.isAutoPlayNavigating = false;
        if (this.autoPlayTimer) {
            clearTimeout(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
    }
    
    resetAutoPlay() {
        this.stopAutoPlay();
        this.startAutoPlay();
    }
    
    // Configurar event listeners
    setupEventListeners() {
        // Botões de navegação
        this.prevBtn.addEventListener('click', () => {
            this.prevSlide();
        });
        
        this.nextBtn.addEventListener('click', () => {
            this.nextSlide();
        });
        
        // Pausar auto-play no hover
        this.carousel.addEventListener('mouseenter', () => {
            this.stopAutoPlay();
        });
        
        this.carousel.addEventListener('mouseleave', () => {
            this.startAutoPlay();
        });
        
        // Navegação por teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prevSlide();
            }
            if (e.key === 'ArrowRight') {
                this.nextSlide();
            }
        });
        
        // Touch/swipe support para mobile
        this.setupTouchSupport();
    }
    
    // Configurar suporte a touch/swipe
    setupTouchSupport() {
        let touchStartX = 0;
        let touchEndX = 0;
        
        this.carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        this.carousel.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        });
    }
    
    // Manipular swipe
    handleSwipe(touchStartX, touchEndX) {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.nextSlide(); // Swipe left - next slide
            } else {
                this.prevSlide(); // Swipe right - previous slide
            }
        }
    }
    
    // Inicializar carrossel com projetos
    init(projects) {
        this.projects = projects;
        this.currentIndex = 0;
        
        if (this.projects.length === 0) {
            return;
        }
        
        this.createIndicators();
        this.setupEventListeners();
        this.startAutoPlay();
    }
    
    // Destruir carrossel (limpar event listeners)
    destroy() {
        this.stopAutoPlay();
        
        // Remover event listeners (simplificado - em produção seria mais robusto)
        this.prevBtn.replaceWith(this.prevBtn.cloneNode(true));
        this.nextBtn.replaceWith(this.nextBtn.cloneNode(true));
    }
}

// Exportar para uso global
window.ProjectCarousel = ProjectCarousel;
