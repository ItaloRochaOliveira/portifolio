// Profile Utils - Lógica para gerenciar informações do perfil
class ProfileManager {
    constructor(githubAPI) {
        this.githubAPI = githubAPI;
        this.profile = null;
    }
    
    // Buscar perfil do GitHub
    async fetchProfile() {
        try {
            this.profile = await this.githubAPI.fetchProfile();
            return this.profile;
        } catch (error) {
            console.error('❌ Erro ao buscar perfil:', error);
            // Fallback com dados básicos
            this.profile = {
                name: this.githubAPI.username,
                bio: '',
                location: '',
                company: '',
                blog: '',
                public_repos: 0,
                followers: 0,
                following: 0,
                created_at: new Date().toISOString(),
                avatar_url: '',
                html_url: `https://github.com/${this.githubAPI.username}`
            };
            return this.profile;
        }
    }
    
    // Atualizar seção "Sobre Mim" no HTML
    async updateAboutSection(profile, technologies = null) {
        const aboutContent = document.querySelector('.about-content');
        if (!aboutContent) {
            return;
        }
        
        // Tentar buscar conteúdo completo do README primeiro, senão usar do perfil
        let bioText = profile.bio || '';
        if (!bioText) {
            const readmeContent = await this.githubAPI.fetchProfileReadmeContent();
            bioText = readmeContent || 'Sem bio disponível.';
        }
        
        // Formatar o conteúdo em parágrafos
        const bioHTML = this.formatBioContent(bioText);
        
        const locationHTML = profile.location ? 
            `<p><strong>Localização:</strong> ${this.escapeHtml(profile.location)}</p>` : '';
        
        const companyHTML = profile.company ? 
            `<p><strong>Empresa:</strong> ${this.escapeHtml(profile.company)}</p>` : '';
        
        const blogHTML = profile.blog ? 
            `<p><strong>Website:</strong> <a href="${this.escapeHtml(profile.blog)}" target="_blank" rel="noopener">${this.escapeHtml(profile.blog)}</a></p>` : '';
        
        const statsHTML = `
            <div class="profile-stats">
                <div class="stat-item">
                    <span class="stat-number">${profile.public_repos}</span>
                    <span class="stat-label">Repositórios</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${profile.followers}</span>
                    <span class="stat-label">Seguidores</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${profile.following}</span>
                    <span class="stat-label">Seguindo</span>
                </div>
            </div>
        `;
        
        // Usar tecnologias analisadas dos repositórios GitHub
        const techTags = technologies && technologies.length > 0 ? 
            technologies.map(tech => `<span class="skill-tag">${this.escapeHtml(tech.name)}</span>`).join('') :
            '<p class="no-technologies">Nenhuma tecnologia encontrada nos repositórios.</p>';
        
        aboutContent.innerHTML = `
            <div class="about-text">
                ${bioHTML}
                ${locationHTML}
                ${companyHTML}
                ${blogHTML}
                ${statsHTML}
            </div>
            <div class="skills">
                <h3>Tecnologias</h3>
                <div class="skill-tags">
                    ${techTags}
                </div>
            </div>
        `;
        
        // Adicionar animação
        aboutContent.style.opacity = '0';
        aboutContent.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            aboutContent.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            aboutContent.style.opacity = '1';
            aboutContent.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // Formatar conteúdo do README em parágrafos HTML
    formatBioContent(content) {
        // Dividir o conteúdo em sentenças ou parágrafos lógicos
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        
        // Agrupar sentenças em parágrafos de tamanho razoável
        const paragraphs = [];
        let currentParagraph = '';
        
        sentences.forEach((sentence, index) => {
            const trimmedSentence = sentence.trim();
            
            // Se adicionar esta sentença exceder 300 caracteres, começar novo parágrafo
            if (currentParagraph.length + trimmedSentence.length > 300 && currentParagraph.length > 0) {
                paragraphs.push(currentParagraph.trim() + '.');
                currentParagraph = trimmedSentence;
            } else {
                currentParagraph += (currentParagraph ? ' ' : '') + trimmedSentence;
            }
        });
        
        // Adicionar o último parágrafo
        if (currentParagraph.trim()) {
            paragraphs.push(currentParagraph.trim() + '.');
        }
        
        // Converter para HTML
        return paragraphs
            .map(paragraph => `<p>${this.escapeHtml(paragraph)}</p>`)
            .join('');
    }
    
    // Atualizar informações do hero
    updateHeroSection(profile) {
        const heroTitle = document.querySelector('.hero-title');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        const profileImg = document.querySelector('.profile-img');
        
        if (heroTitle && profile.name) {
            const titleText = `Olá, sou ${profile.name}`;
            heroTitle.textContent = titleText;
            
            // Aplicar efeito de digitação
            const uiEffects = new UIEffects();
            uiEffects.typeWriter(heroTitle, titleText, 80);
        }
        
        if (heroSubtitle) {
            const yearsOfExperience = this.calculateExperience(profile.created_at);
            heroSubtitle.textContent = `Desenvolvedor de Software • ${yearsOfExperience} anos de experiência`;
        }
        
        if (profileImg && profile.avatar_url) {
            profileImg.innerHTML = `<img src="${profile.avatar_url}" alt="${profile.name}" class="profile-avatar">`;
        }
        
    }
    
    // Calcular anos de experiência
    calculateExperience(createdAt) {
        const created = new Date(createdAt);
        const now = new Date();
        const years = Math.floor((now - created) / (365.25 * 24 * 60 * 60 * 1000));
        return years > 0 ? years : 1;
    }
    
    // Escapar HTML para prevenir XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Adicionar CSS para estatísticas do perfil
    addProfileStyles() {
        const styles = `
            .profile-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 1rem;
                margin-top: 2rem;
                padding: 1.5rem;
                background: var(--bg-white);
                border-radius: 12px;
                box-shadow: var(--shadow-sm);
            }
            
            .stat-item {
                text-align: center;
                padding: 1rem;
                border-radius: 8px;
                background: var(--bg-light);
                transition: transform 0.3s ease;
            }
            
            .stat-item:hover {
                transform: translateY(-2px);
            }
            
            .stat-number {
                display: block;
                font-size: 1.5rem;
                font-weight: 700;
                color: var(--primary-color);
                margin-bottom: 0.25rem;
            }
            
            .stat-label {
                font-size: 0.875rem;
                color: var(--text-light);
                font-weight: 500;
            }
            
            .no-technologies {
                color: var(--text-light);
                font-style: italic;
                text-align: center;
                padding: 1rem;
                background: var(--bg-light);
                border-radius: 8px;
                margin: 1rem 0;
            }
            
            .profile-avatar {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                object-fit: cover;
            }
            
            @media (max-width: 768px) {
                .profile-stats {
                    grid-template-columns: repeat(3, 1fr);
                    gap: 0.5rem;
                    padding: 1rem;
                }
                
                .stat-number {
                    font-size: 1.25rem;
                }
            }
        `;
        
        const styleElement = document.createElement('style');
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);
    }
    
    // Inicializar perfil completo
    async init() {
        try {
            // Adicionar estilos
            this.addProfileStyles();
            
            // Buscar perfil
            const profile = await this.fetchProfile();
            
            // Analisar tecnologias mais usadas dos repositórios
            const technologies = await this.githubAPI.analyzeTechnologies();
            
            // Atualizar seções com dados do GitHub
            await this.updateAboutSection(profile, technologies);
            this.updateHeroSection(profile);
            
        } catch (error) {
            console.error('❌ Erro ao inicializar perfil:', error);
        }
    }
}

// Exportar para uso global
window.ProfileManager = ProfileManager;
