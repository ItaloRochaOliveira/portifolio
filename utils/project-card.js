// Project Card Utils - Lógica de criação de cards de projetos
class ProjectCardFactory {
    constructor() {
        // Ícones das linguagens de programação
        this.languageIcons = {
            'JavaScript': 'fab fa-js-square',
            'HTML/CSS': 'fab fa-html5',
            'React': 'fab fa-react',
            'Node.js': 'fab fa-node-js',
            'Python': 'fab fa-python',
            'TypeScript': 'fab fa-js-square',
            'Vue': 'fab fa-vuejs',
            'Angular': 'fab fa-angular',
            'Java': 'fab fa-java',
            'PHP': 'fab fa-php',
            'Go': 'fab fa-golang',
            'Ruby': 'fab fa-ruby',
            'C++': 'fas fa-code',
            'C#': 'fas fa-code',
            'Swift': 'fab fa-swift',
            'Kotlin': 'fab fa-android',
            'Rust': 'fab fa-rust',
            'Docker': 'fab fa-docker'
        };
    }
    
    // Obter ícone baseado na linguagem
    getLanguageIcon(language) {
        return this.languageIcons[language] || 'fas fa-code';
    }
    
    // Formatar número com sufixo (1K, 1M, etc)
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
    
    // Criar elemento HTML para o card
    createCard(project) {
        
        const card = document.createElement('div');
        card.className = 'carousel-item';
        
        const iconClass = this.getLanguageIcon(project.language);
        const formattedStars = this.formatNumber(project.stars);
        const formattedForks = this.formatNumber(project.forks);
        
        card.innerHTML = `
            <div class="project-card">
                <div class="project-image">
                    <i class="${iconClass}"></i>
                </div>
                <div class="project-content">
                    <h3 class="project-title">${this.escapeHtml(project.name)}</h3>
                    <p class="project-description">${this.escapeHtml(project.description)}</p>
                    <div class="project-stats">
                        <span class="stat">
                            <i class="fas fa-star"></i> ${formattedStars}
                        </span>
                        <span class="stat">
                            <i class="fas fa-code-branch"></i> ${formattedForks}
                        </span>
                    </div>
                    <div class="project-tech">
                        <span class="tech-tag">${this.escapeHtml(project.language)}</span>
                        ${project.topics.map(topic => 
                            `<span class="tech-tag">${this.escapeHtml(topic)}</span>`
                        ).join('')}
                    </div>
                    <div class="project-links">
                        <a href="${project.html_url}" target="_blank" class="project-link">
                            <i class="fab fa-github"></i>
                            Ver no GitHub
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        return card;
    }
    
    // Criar múltiplos cards
    createCards(projects) {
        
        return projects.map(project => this.createCard(project));
    }
    
    // Escapar HTML para prevenir XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Adicionar cards ao container
    appendCardsToContainer(projects, container) {
        // Limpar container
        container.innerHTML = '';
        
        // Criar e adicionar cada card
        projects.forEach((project, index) => {
            const card = this.createCard(project);
            container.appendChild(card);
        });
    }
    
    // Obter estatísticas dos projetos
    getProjectStats(projects) {
        const stats = {
            total: projects.length,
            totalStars: projects.reduce((sum, p) => sum + p.stars, 0),
            totalForks: projects.reduce((sum, p) => sum + p.forks, 0),
            languages: [...new Set(projects.map(p => p.language))],
            mostStarred: projects.reduce((max, p) => p.stars > max.stars ? p : max, projects[0])
        };
        
        return stats;
    }
}

// Exportar para uso global
window.ProjectCardFactory = ProjectCardFactory;
