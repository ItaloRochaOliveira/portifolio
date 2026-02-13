// GitHub API Utils - Lógica de busca e processamento de projetos
class GitHubAPI {
    constructor(username) {
        this.username = username;
        this.baseURL = 'https://api.github.com';
        this.cache = new Map();
    }
    
    // Buscar informações do perfil do GitHub
    async fetchProfile() {
        // Verificar cache primeiro
        if (this.cache.has('profile')) {
            return this.cache.get('profile');
        }
        
        try {
            const response = await fetch(`${this.baseURL}/users/${this.username}`);
            
            if (!response.ok) {
                // Se for rate limit, esperar e tentar novamente
                if (response.status === 403) {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    return this.cache.get('profile') || this.getDefaultProfile();
                }
                
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const profile = await response.json();
            
            // Salvar no cache
            this.cache.set('profile', profile);
            
            return {
                name: profile.name || profile.login,
                bio: profile.bio || '',
                location: profile.location || '',
                company: profile.company || '',
                blog: profile.blog || '',
                public_repos: profile.public_repos,
                followers: profile.followers,
                following: profile.following,
                created_at: profile.created_at,
                avatar_url: profile.avatar_url,
                html_url: profile.html_url
            };
            
        } catch (error) {
            // Se for rate limit, usar cache
            if (this.cache.has('profile')) {
                return this.cache.get('profile');
            }
            
            // Fallback com dados básicos
            return this.getDefaultProfile();
        }
    }
    
    // Obter perfil padrão (fallback)
    getDefaultProfile() {
        return {
            name: this.username,
            bio: '',
            location: '',
            company: '',
            blog: '',
            public_repos: 0,
            followers: 0,
            following: 0,
            created_at: new Date().toISOString(),
            avatar_url: '',
            html_url: `https://github.com/${this.username}`
        };
    }
    
    // Buscar todos os repositórios do usuário
    async fetchAllRepos() {
        
        try {
            const response = await fetch(`${this.baseURL}/users/${this.username}/repos?sort=updated&per_page=100`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const repos = await response.json();
            
            return repos;
        } catch (error) {
            throw error;
        }
    }
    
    // Processar e filtrar repositórios
    processRepos(repos, chosenProjects = []) {
        
        // Filtrar repositórios válidos (sem fork)
        const validRepos = repos.filter(repo => !repo.fork);
        
        // Mapear para formato padronizado
        const processedRepos = validRepos.map(repo => ({
            name: this.formatRepoName(repo.name),
            originalName: repo.name,
            description: repo.description || `Repositório ${repo.name} sem descrição disponível.`,
            html_url: repo.html_url,
            language: repo.language || 'Outro',
            topics: repo.topics ? repo.topics.slice(0, 3) : [],
            stars: repo.stargazers_count || 0,
            forks: repo.forks_count || 0,
            created_at: repo.created_at,
            updated_at: repo.updated_at
        }));
        
        // Separar projetos escolhidos e aleatórios
        const { selected, random } = this.separateProjects(processedRepos, chosenProjects);
        
        
        return { selected, random };
    }
    
    // Formatar nome do repositório
    formatRepoName(name) {
        return name.replace(/-/g, ' ').replace(/_/g, ' ');
    }
    
    // Separar projetos escolhidos dos aleatórios
    separateProjects(projects, chosenProjects) {
        const selected = [];
        const random = [];
        
        projects.forEach(project => {
            const repoName = project.originalName.toLowerCase();
            if (chosenProjects.includes(repoName)) {
                selected.push(project);
            } else {
                random.push(project);
            }
        });
        
        return { selected, random };
    }
    
    // Completar com projetos aleatórios
    completeWithRandom(selected, random, totalNeeded = 8) {
        const remainingSlots = totalNeeded - selected.length;
        let finalProjects = [...selected];
        
        if (remainingSlots > 0 && random.length > 0) {
            // Embaralhar e selecionar projetos aleatórios
            const shuffled = this.shuffleArray([...random]);
            const randomSelection = shuffled.slice(0, remainingSlots);
            finalProjects = [...selected, ...randomSelection];
        }
        
        return finalProjects;
    }
    
    // Embaralhar array (Fisher-Yates)
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    // Ordenar projetos: escolhidos primeiro, depois por estrelas
    sortProjects(projects, chosenProjects) {
        return projects.sort((a, b) => {
            const aIsChosen = chosenProjects.includes(a.originalName.toLowerCase());
            const bIsChosen = chosenProjects.includes(b.originalName.toLowerCase());
            
            // Projetos escolhidos vêm primeiro
            if (aIsChosen && !bIsChosen) return -1;
            if (!aIsChosen && bIsChosen) return 1;
            
            // Depois ordenar por estrelas
            return (b.stars || 0) - (a.stars || 0);
        });
    }
    
    // Buscar projetos completos
    async fetchProjects(chosenProjects = [], maxProjects = 8) {
        try {
            const repos = await this.fetchAllRepos();
            
            const { selected, random } = this.processRepos(repos, chosenProjects);
            
            // Completar com projetos aleatórios
            let finalProjects = this.completeWithRandom(selected, random, maxProjects);
            
            // Ordenar projetos finais
            finalProjects = this.sortProjects(finalProjects, chosenProjects);
            
            // Limitar quantidade máxima
            finalProjects = finalProjects.slice(0, maxProjects);
            
            
            return finalProjects;
            
        } catch (error) {
            return this.getSampleProjects();
        }
    }
    
    // Extrair conteúdo completo do README formatado
    async fetchProfileReadmeContent() {
        try {
            const response = await fetch(`${this.baseURL}/repos/${this.username}/${this.username}/readme`);
            
            if (!response.ok) {
                return null; // Não encontrou README
            }
            
            const readmeData = await response.json();
            
            // Decodificar conteúdo base64
            const content = atob(readmeData.content);
            
            // Processar o conteúdo para extrair texto limpo
            return this.processReadmeContent(content);
            
        } catch (error) {
            console.error('❌ Erro ao buscar README do perfil:', error);
            return null;
        }
    }
    
    // Processar conteúdo do README para extrair texto limpo
    processReadmeContent(content) {
        // Remover tags HTML e markdown
        let cleanContent = content
            // Remover tags HTML
            .replace(/<[^>]*>/g, '')
            // Remover links de imagens
            .replace(/!\[.*?\]\(.*?\)/g, '')
            // Remover badges e shields
            .replace(/\[!\[.*?\]\(.*?\)\]\(.*?\)/g, '')
            .replace(/https:\/\/img\.shields\.io\/[^\s]*/g, '')
            // Remover headers markdown
            .replace(/^#+\s*/gm, '')
            // Remover linhas de ---
            .replace(/^---\s*$/gm, '')
            // Remover div align
            .replace(/<div[^>]*>/g, '')
            .replace(/<\/div>/g, '')
            // Remover picture tags
            .replace(/<picture[^>]*>/g, '')
            .replace(/<\/picture>/g, '')
            // Remover img tags
            .replace(/<img[^>]*>/g, '')
            // Remover linhas com URLs
            .replace(/^https?:\/\/.*$/gm, '')
            // Remover linhas com apenas "##" ou títulos
            .replace(/^##\s*$/gm, '')
            // Remover linhas que contêm "align="center""
            .replace(/.*align="center".*/g, '')
            // Remover linhas vazias excessivas
            .replace(/\n\s*\n\s*\n/g, '\n\n')
            .trim();
        
        // Dividir em linhas e filtrar conteúdo relevante
        const lines = cleanContent.split('\n');
        const relevantLines = [];
        
        let inRelevantSection = false;
        for (const line of lines) {
            const trimmedLine = line.trim();
            
            // Ignorar linhas muito curtas ou com apenas caracteres especiais
            if (trimmedLine.length < 10) continue;
            
            // Começar a capturar após encontrar "Sobre" ou conteúdo relevante
            if (trimmedLine.toLowerCase().includes('sobre') || 
                trimmedLine.toLowerCase().includes('olá') ||
                trimmedLine.toLowerCase().includes('nome') ||
                inRelevantSection) {
                
                inRelevantSection = true;
                
                // Parar de capturar ao chegar em seções não desejadas
                if (trimmedLine.toLowerCase().includes('status') ||
                    trimmedLine.toLowerCase().includes('linguagen') ||
                    trimmedLine.toLowerCase().includes('contato') ||
                    trimmedLine.toLowerCase().includes('##')) {
                    break;
                }
                
                relevantLines.push(trimmedLine);
            }
        }
        
        // Juntar as linhas relevantes
        return relevantLines.join(' ');
    }
    
    // Buscar bio do README do perfil (mantido para compatibilidade)
    async fetchProfileReadme() {
        try {
            const response = await fetch(`${this.baseURL}/repos/${this.username}/${this.username}/readme`);
            
            if (!response.ok) {
                return null; // Não encontrou README
            }
            
            const readmeData = await response.json();
            
            // Decodificar conteúdo base64
            const content = atob(readmeData.content);
            
            // Extrair primeira linha ou parágrafo significativo
            const lines = content.split('\n');
            let bio = '';
            
            for (const line of lines) {
                const trimmedLine = line.trim();
                // Ignorar linhas de cabeçalho, badges, linhas vazias
                if (trimmedLine && 
                    !trimmedLine.startsWith('#') && 
                    !trimmedLine.startsWith('!') && 
                    !trimmedLine.startsWith('<') &&
                    !trimmedLine.includes('badge') &&
                    trimmedLine.length > 10) {
                    bio = trimmedLine;
                    break;
                }
            }
            
            return bio || null;
            
        } catch (error) {
            console.error('❌ Erro ao buscar README do perfil:', error);
            return null;
        }
    }
    
    // Analisar tecnologias mais usadas nos repositórios
    async analyzeTechnologies() {
        try {
            const repos = await this.fetchAllRepos();
            const languageCount = {};
            
            // Contar linguagens dos repositórios
            repos.forEach(repo => {
                if (repo.language && repo.language.trim() !== '') {
                    const lang = repo.language.trim();
                    languageCount[lang] = (languageCount[lang] || 0) + 1;
                }
            });
            
            // Se não encontrar linguagens, retornar array vazio
            if (Object.keys(languageCount).length === 0) {
                return [];
            }
            
            // Converter para array e ordenar por frequência
            const technologies = Object.entries(languageCount)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 8); // Top 8 tecnologias
            
            return technologies;
            
        } catch (error) {
            console.error('❌ Erro ao analisar tecnologias:', error);
            return []; // Retornar array vazio em caso de erro
        }
    }
    
    // Projetos exemplo (fallback)
    getSampleProjects() {
        
        return [
            {
                name: 'Portfolio Website',
                originalName: 'portfolio',
                description: 'Site portfólio moderno e responsivo desenvolvido com HTML, CSS e JavaScript puro.',
                html_url: `https://github.com/${this.username}/portfolio`,
                language: 'HTML/CSS',
                topics: ['frontend', 'portfolio', 'responsive'],
                stars: 42,
                forks: 12
            },
            {
                name: 'Task Manager App',
                originalName: 'task-manager',
                description: 'Aplicação de gerenciamento de tarefas com interface intuitiva e persistência de dados.',
                html_url: `https://github.com/${this.username}/task-manager`,
                language: 'JavaScript',
                topics: ['javascript', 'dom', 'localstorage'],
                stars: 28,
                forks: 8
            },
            {
                name: 'Weather Dashboard',
                originalName: 'weather-dashboard',
                description: 'Dashboard meteorológico com API de previsão do tempo e design responsivo.',
                html_url: `https://github.com/${this.username}/weather-dashboard`,
                language: 'JavaScript',
                topics: ['api', 'weather', 'dashboard'],
                stars: 35,
                forks: 15
            },
            {
                name: 'Blog Platform',
                originalName: 'blog-platform',
                description: 'Plataforma de blog com sistema de comentários e gerenciamento de conteúdo.',
                html_url: `https://github.com/${this.username}/blog-platform`,
                language: 'JavaScript',
                topics: ['blog', 'cms', 'comments'],
                stars: 19,
                forks: 6
            },
            {
                name: 'E-commerce Store',
                originalName: 'ecommerce-store',
                description: 'Loja virtual com carrinho de compras e sistema de pagamento integrado.',
                html_url: `https://github.com/${this.username}/ecommerce-store`,
                language: 'JavaScript',
                topics: ['ecommerce', 'shopping-cart', 'payment'],
                stars: 45,
                forks: 20
            },
            {
                name: 'Social Media App',
                originalName: 'social-media-app',
                description: 'Aplicação de rede social com feed, perfis e sistema de mensagens.',
                html_url: `https://github.com/${this.username}/social-media-app`,
                language: 'JavaScript',
                topics: ['social', 'messaging', 'profiles'],
                stars: 67,
                forks: 25
            },
            {
                name: 'Game Engine',
                originalName: 'game-engine',
                description: 'Motor de jogo 2D com física básica e sistema de renderização.',
                html_url: `https://github.com/${this.username}/game-engine`,
                language: 'JavaScript',
                topics: ['game', 'physics', 'rendering'],
                stars: 89,
                forks: 30
            },
            {
                name: 'Data Visualization',
                originalName: 'data-visualization',
                description: 'Biblioteca para visualização de dados com gráficos interativos e dashboards.',
                html_url: `https://github.com/${this.username}/data-visualization`,
                language: 'JavaScript',
                topics: ['charts', 'data', 'visualization'],
                stars: 52,
                forks: 18
            }
        ];
    }
}

// Exportar para uso global
window.GitHubAPI = GitHubAPI;