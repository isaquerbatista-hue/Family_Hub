// Sistema de Gerenciamento de Recompensas - Family Hub

class RecompensasManager {
    constructor() {
        // Estado da aplicação
        this.recompensas = [];
        this.usuarioAtual = { pontos: 5000, nome: 'Mãe' };
        this.viewMode = 'grid'; // 'grid' ou 'lista'
        
        // Elementos do DOM
        this.recompensasContainer = document.getElementById('recompensas-container');
        this.btnNovaRecompensa = document.getElementById('btn-nova-recompensa');
        this.btnToggleView = document.getElementById('btn-toggle-view');
        this.modalRecompensa = document.getElementById('modal-recompensa');
        this.modalResgate = document.getElementById('modal-resgate');
        this.formRecompensa = document.getElementById('form-recompensa');
        this.pontosAtuais = document.getElementById('pontos-atuais');
        
        // Filtros
        this.buscaInput = document.getElementById('busca-recompensa');
        this.filtroPontos = document.getElementById('filtro-pontos');
        
        // Inicialização
        this.init();
    }
    
    init() {
        // Carregar dados iniciais
        this.carregarDados();
        
        // Atualizar pontos do usuário
        this.atualizarPontosUsuario();
        
        // Event listeners
        this.setupEventListeners();
        
        // Renderizar interface
        this.renderizarCategorias();
        
        console.log('Sistema de Recompensas inicializado');
    }
    
    setupEventListeners() {
        // Botão nova recompensa
        this.btnNovaRecompensa.addEventListener('click', () => this.abrirModalRecompensa());
        
        // Botão toggle view
        this.btnToggleView.addEventListener('click', () => this.toggleViewMode());
        
        // Filtros
        this.buscaInput.addEventListener('input', () => this.aplicarFiltros());
        this.filtroPontos.addEventListener('change', () => this.aplicarFiltros());
        
        // Modal recompensa
        document.getElementById('fechar-modal').addEventListener('click', () => this.fecharModalRecompensa());
        document.getElementById('cancelar-recompensa').addEventListener('click', () => this.fecharModalRecompensa());
        
        // Modal resgate
        document.getElementById('fechar-modal-resgate').addEventListener('click', () => this.fecharModalResgate());
        document.getElementById('cancelar-resgate').addEventListener('click', () => this.fecharModalResgate());
        document.getElementById('confirmar-resgate').addEventListener('click', () => this.confirmarResgate());
        
        // Formulário
        this.formRecompensa.addEventListener('submit', (e) => this.handleSubmitRecompensa(e));
        
        // Fechar modais ao clicar fora
        this.modalRecompensa.addEventListener('click', (e) => {
            if (e.target === this.modalRecompensa) this.fecharModalRecompensa();
        });
        this.modalResgate.addEventListener('click', (e) => {
            if (e.target === this.modalResgate) this.fecharModalResgate();
        });
    }
    
    atualizarPontosUsuario() {
        this.pontosAtuais.textContent = this.usuarioAtual.pontos;
    }
    
    toggleViewMode() {
        this.viewMode = this.viewMode === 'grid' ? 'lista' : 'grid';
        
        // Atualizar ícones
        const iconGrid = this.btnToggleView.querySelector('.icon-grid');
        const iconList = this.btnToggleView.querySelector('.icon-list');
        
        if (this.viewMode === 'grid') {
            iconGrid.style.display = 'block';
            iconList.style.display = 'none';
        } else {
            iconGrid.style.display = 'none';
            iconList.style.display = 'block';
        }
        
        // Re-renderizar com nova visualização
        this.aplicarFiltros();
    }
    
    carregarDados() {
        // Recompensas completas
        this.recompensas = [
            // ✈️ Viagens
            {
                id: 1,
                nome: 'Passeio no parque local',
                descricao: 'Passeio divertido no parque da cidade',
                pontos: 300,
                categoria: 'viagem',
                limite: null,
                ativo: true,
                status: 'disponivel'
            },
            {
                id: 2,
                nome: 'Ida ao cinema com a família',
                descricao: 'Ingressos para o cinema em família',
                pontos: 500,
                categoria: 'viagem',
                limite: null,
                ativo: true,
                status: 'disponivel'
            },
            {
                id: 3,
                nome: 'Dia em um parque aquático',
                descricao: 'Dia inteiro de diversão no parque aquático',
                pontos: 1200,
                categoria: 'viagem',
                limite: 2,
                ativo: true,
                status: 'disponivel'
            },
            {
                id: 4,
                nome: 'Viagem de fim de semana',
                descricao: 'Viagem para uma cidade próxima',
                pontos: 2500,
                categoria: 'viagem',
                limite: 1,
                ativo: true,
                status: 'disponivel'
            },
            {
                id: 5,
                nome: 'Escolher o próximo destino da família',
                descricao: 'Você escolhe para onde a família vai viajar',
                pontos: 4000,
                categoria: 'viagem',
                limite: 1,
                ativo: true,
                status: 'disponivel'
            },
            // 🎮 Entretenimento
            {
                id: 6,
                nome: '1h extra de videogame',
                descricao: 'Uma hora adicional para jogar videogame',
                pontos: 200,
                categoria: 'entretenimento',
                limite: 5,
                ativo: true,
                status: 'disponivel'
            },
            {
                id: 7,
                nome: 'Escolher o filme da noite',
                descricao: 'Você escolhe o filme para assistir em família',
                pontos: 300,
                categoria: 'entretenimento',
                limite: null,
                ativo: true,
                status: 'disponivel'
            },
            {
                id: 8,
                nome: 'Noite de jogos em família',
                descricao: 'Noite dedicada a jogos de tabuleiro em família',
                pontos: 400,
                categoria: 'entretenimento',
                limite: 3,
                ativo: true,
                status: 'disponivel'
            },
            {
                id: 9,
                nome: 'Assinar um jogo/app por 1 mês',
                descricao: 'Assinatura mensal de um jogo ou app escolhido',
                pontos: 800,
                categoria: 'entretenimento',
                limite: 2,
                ativo: true,
                status: 'disponivel'
            },
            {
                id: 10,
                nome: 'Comprar um jogo novo',
                descricao: 'Comprar um jogo novo de sua escolha',
                pontos: 1500,
                categoria: 'entretenimento',
                limite: 1,
                ativo: true,
                status: 'disponivel'
            },
            // 😴 Descanso
            {
                id: 11,
                nome: 'Dormir 1h mais tarde',
                descricao: 'Permissão para dormir uma hora mais tarde',
                pontos: 250,
                categoria: 'descanso',
                limite: 5,
                ativo: true,
                status: 'disponivel'
            },
            {
                id: 12,
                nome: 'Dia sem tarefas domésticas',
                descricao: 'Férias das tarefas domésticas por um dia',
                pontos: 600,
                categoria: 'descanso',
                limite: 3,
                ativo: true,
                status: 'disponivel'
            },
            {
                id: 13,
                nome: 'Manhã livre (sem obrigações)',
                descricao: 'Manhã inteira livre para fazer o que quiser',
                pontos: 700,
                categoria: 'descanso',
                limite: 2,
                ativo: true,
                status: 'disponivel'
            },
            {
                id: 14,
                nome: 'Dia completo de descanso',
                descricao: 'Dia livre de todas as responsabilidades',
                pontos: 1200,
                categoria: 'descanso',
                limite: 1,
                ativo: true,
                status: 'disponivel'
            },
            {
                id: 15,
                nome: 'Fim de semana relax',
                descricao: 'Fim de semana sem responsabilidades',
                pontos: 2500,
                categoria: 'descanso',
                limite: 1,
                ativo: true,
                status: 'disponivel'
            },
            // 🛍️ Compras
            {
                id: 16,
                nome: 'Escolher um doce na loja',
                descricao: 'Escolher um doce de sua preferência',
                pontos: 150,
                categoria: 'compras',
                limite: 10,
                ativo: true,
                status: 'disponivel'
            },
            {
                id: 17,
                nome: 'Ganhar R$20 para gastar',
                descricao: 'R$20 para gastar como quiser',
                pontos: 400,
                categoria: 'compras',
                limite: 5,
                ativo: true,
                status: 'disponivel'
            },
            {
                id: 18,
                nome: 'Escolher uma roupa nova',
                descricao: 'Escolher uma peça de roupa nova',
                pontos: 900,
                categoria: 'compras',
                limite: 2,
                ativo: true,
                status: 'disponivel'
            },
            {
                id: 19,
                nome: 'Ganhar R$100 para gastar',
                descricao: 'R$100 para gastar como quiser',
                pontos: 1800,
                categoria: 'compras',
                limite: 1,
                ativo: true,
                status: 'disponivel'
            },
            {
                id: 20,
                nome: 'Comprar algo grande desejado',
                descricao: 'Comprar um item grande que você deseja',
                pontos: 3500,
                categoria: 'compras',
                limite: 1,
                ativo: true,
                status: 'disponivel'
            },
            // 🍔 Comida
            {
                id: 21,
                nome: 'Escolher o jantar',
                descricao: 'Você escolhe o que a família vai jantar',
                pontos: 300,
                categoria: 'comida',
                limite: null,
                ativo: true,
                status: 'disponivel'
            },
            {
                id: 22,
                nome: 'Pedir fast food',
                descricao: 'Pedir fast food para a família',
                pontos: 600,
                categoria: 'comida',
                limite: 3,
                ativo: true,
                status: 'disponivel'
            },
            {
                id: 23,
                nome: 'Sobremesa especial',
                descricao: 'Sobremesa especial do restaurante escolhido',
                pontos: 250,
                categoria: 'comida',
                limite: 5,
                ativo: true,
                status: 'disponivel'
            },
            {
                id: 24,
                nome: 'Comer fora em restaurante',
                descricao: 'Jantar completo em restaurante escolhido',
                pontos: 1000,
                categoria: 'comida',
                limite: 2,
                ativo: true,
                status: 'disponivel'
            },
            {
                id: 25,
                nome: 'Dia livre de dieta (com controle)',
                descricao: 'Dia para comer o que quiser com moderação',
                pontos: 1500,
                categoria: 'comida',
                limite: 1,
                ativo: true,
                status: 'disponivel'
            },
            // ⚽ Esportes
            {
                id: 26,
                nome: 'Escolher a atividade esportiva do dia',
                descricao: 'Você escolhe o esporte que a família vai praticar',
                pontos: 300,
                categoria: 'esportes',
                limite: null,
                ativo: true,
                status: 'disponivel'
            },
            {
                id: 27,
                nome: 'Jogar bola com a família/amigos',
                descricao: 'Partida de futebol com família e amigos',
                pontos: 200,
                categoria: 'esportes',
                limite: null,
                ativo: true,
                status: 'disponivel'
            },
            {
                id: 28,
                nome: 'Ir ao parque andar de bike',
                descricao: 'Passeio de bike no parque',
                pontos: 500,
                categoria: 'esportes',
                limite: 3,
                ativo: true,
                status: 'disponivel'
            },
            {
                id: 29,
                nome: 'Ir a um evento esportivo',
                descricao: 'Assistir a um evento esportivo ao vivo',
                pontos: 1500,
                categoria: 'esportes',
                limite: 1,
                ativo: true,
                status: 'disponivel'
            },
            {
                id: 30,
                nome: 'Ganhar um item esportivo',
                descricao: 'Ganhar bola, chuteira ou outro item esportivo',
                pontos: 2000,
                categoria: 'esportes',
                limite: 1,
                ativo: true,
                status: 'disponivel'
            }
        ];
    }
    
    aplicarFiltros() {
        const busca = this.buscaInput.value.toLowerCase();
        const filtroPontos = this.filtroPontos.value;
        
        const recompensasFiltradas = this.recompensas.filter(recompensa => {
            // Filtro de busca
            const matchBusca = !busca || 
                recompensa.nome.toLowerCase().includes(busca) ||
                recompensa.descricao.toLowerCase().includes(busca);
            
            // Filtro de pontos
            let matchPontos = true;
            if (filtroPontos === 'baixo') matchPontos = recompensa.pontos <= 500;
            else if (filtroPontos === 'medio') matchPontos = recompensa.pontos > 500 && recompensa.pontos <= 1500;
            else if (filtroPontos === 'alto') matchPontos = recompensa.pontos > 1500;
            
            return matchBusca && matchPontos && recompensa.ativo;
        });
        
        this.renderizarCategorias(recompensasFiltradas);
    }
    
    renderizarCategorias(recompensas = this.recompensas) {
        this.recompensasContainer.innerHTML = '';
        
        // Agrupar por categoria
        const categorias = {
            viagem: [],
            entretenimento: [],
            descanso: [],
            compras: [],
            comida: [],
            esportes: []
        };
        
        recompensas.forEach(recompensa => {
            if (categorias[recompensa.categoria]) {
                categorias[recompensa.categoria].push(recompensa);
            }
        });
        
        // Ordem das categorias
        const ordemCategorias = ['viagem', 'entretenimento', 'descanso', 'compras', 'comida', 'esportes'];
        
        ordemCategorias.forEach(categoriaKey => {
            const recompensasCategoria = categorias[categoriaKey];
            
            if (recompensasCategoria.length === 0) return;
            
            // Criar seção da categoria
            const secao = document.createElement('div');
            secao.className = 'categoria-section';
            
            const categoriaIcon = this.getCategoriaIcon(categoriaKey);
            const categoriaNome = this.formatarCategoria(categoriaKey);
            
            secao.innerHTML = `
                <div class="categoria-header">
                    <span class="categoria-icon">${categoriaIcon}</span>
                    <h3 class="categoria-titulo">${categoriaNome}</h3>
                </div>
                <div class="categoria-divider"></div>
                <div class="recompensas-grid ${this.viewMode === 'lista' ? 'lista-mode' : ''}">
                </div>
            `;
            
            const grid = secao.querySelector('.recompensas-grid');
            
            recompensasCategoria.forEach(recompensa => {
                const card = this.criarCardRecompensa(recompensa);
                grid.appendChild(card);
            });
            
            this.recompensasContainer.appendChild(secao);
        });
    }
    
    criarCardRecompensa(recompensa) {
        const card = document.createElement('div');
        card.className = `recompensa-card ${this.viewMode === 'lista' ? 'lista-mode' : ''}`;
        card.dataset.id = recompensa.id;
        
        const categoriaIcon = this.getCategoriaIcon(recompensa.categoria);
        const statusClass = recompensa.status === 'disponivel' ? 'disponivel' : 
                           recompensa.status === 'resgatado' ? 'resgatado' : 'indisponivel';
        const imageUrl = this.getCategoriaImageUrl(recompensa.categoria);
        
        card.innerHTML = `
            <div class="recompensa-imagem">
                <img src="${imageUrl}" alt="${recompensa.nome}" loading="lazy">
                ${this.viewMode === 'grid' ? `
                <div class="recompensa-header">
                    <span class="recompensa-categoria">${categoriaIcon} ${this.formatarCategoria(recompensa.categoria)}</span>
                    <span class="recompensa-status ${statusClass}">${this.formatarStatus(recompensa.status)}</span>
                </div>
                ` : ''}
            </div>
            <div class="recompensa-body">
                <h4 class="recompensa-nome">${recompensa.nome}</h4>
                ${this.viewMode === 'grid' ? `<p class="recompensa-descricao">${recompensa.descricao}</p>` : ''}
                <div class="recompensa-pontos">
                    <span class="pontos-valor">${recompensa.pontos}</span>
                    <span class="pontos-label">pontos</span>
                </div>
                ${this.viewMode === 'grid' && recompensa.limite ? `<div class="recompensa-limite">Disponível: ${recompensa.limite}</div>` : ''}
            </div>
            <div class="recompensa-actions">
                <button class="btn-resgatar" data-id="${recompensa.id}" ${recompensa.status !== 'disponivel' ? 'disabled' : ''}>
                    Resgatar
                </button>
            </div>
        `;
        
        // Event listener do botão resgatar
        card.querySelector('.btn-resgatar').addEventListener('click', () => this.abrirModalResgate(recompensa));
        
        return card;
    }
    
    getCategoriaIcon(categoria) {
        const icons = {
            viagem: '✈️',
            entretenimento: '�',
            descanso: '😴',
            compras: '🛍️',
            comida: '🍔',
            esportes: '⚽'
        };
        return icons[categoria] || '🎁';
    }
    
    getCategoriaImageUrl(categoria) {
        const images = {
            viagem: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=250&fit=crop',
            entretenimento: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=250&fit=crop',
            descanso: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=250&fit=crop',
            compras: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=250&fit=crop',
            comida: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=250&fit=crop',
            esportes: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=250&fit=crop'
        };
        return images[categoria] || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=250&fit=crop';
    }
    
    formatarCategoria(categoria) {
        const nomes = {
            viagem: 'Viagens',
            entretenimento: 'Entretenimento',
            descanso: 'Descanso',
            compras: 'Compras',
            comida: 'Comida',
            esportes: 'Esportes'
        };
        return nomes[categoria] || categoria;
    }
    
    formatarStatus(status) {
        const nomes = {
            disponivel: 'Disponível',
            resgatado: 'Resgatado',
            indisponivel: 'Indisponível'
        };
        return nomes[status] || status;
    }
    
    abrirModalRecompensa() {
        document.getElementById('modal-titulo').textContent = 'Nova Recompensa';
        this.formRecompensa.reset();
        document.getElementById('ativo-recompensa').checked = true;
        this.modalRecompensa.style.display = 'flex';
    }
    
    fecharModalRecompensa() {
        this.modalRecompensa.style.display = 'none';
        this.formRecompensa.reset();
    }
    
    handleSubmitRecompensa(event) {
        event.preventDefault();
        
        const dados = {
            nome: document.getElementById('nome-recompensa').value,
            descricao: document.getElementById('descricao-recompensa').value,
            pontos: parseInt(document.getElementById('pontos-recompensa').value),
            categoria: document.getElementById('categoria-recompensa').value,
            limite: document.getElementById('limite-recompensa').value ? parseInt(document.getElementById('limite-recompensa').value) : null,
            ativo: document.getElementById('ativo-recompensa').checked
        };
        
        // Criar nova recompensa
        const novaRecompensa = {
            id: Date.now(),
            ...dados,
            status: 'disponivel'
        };
        this.recompensas.push(novaRecompensa);
        console.log('Nova recompensa criada:', novaRecompensa);
        
        this.fecharModalRecompensa();
        this.aplicarFiltros();
    }
    
    abrirModalResgate(recompensa) {
        document.getElementById('resgate-nome').textContent = recompensa.nome;
        document.getElementById('resgate-pontos').textContent = `${recompensa.pontos} pontos`;
        document.getElementById('pontos-usuario').textContent = this.usuarioAtual.pontos;
        
        // Armazenar ID da recompensa para resgate
        this.modalResgate.dataset.recompensaId = recompensa.id;
        
        this.modalResgate.style.display = 'flex';
    }
    
    fecharModalResgate() {
        this.modalResgate.style.display = 'none';
        delete this.modalResgate.dataset.recompensaId;
    }
    
    confirmarResgate() {
        const recompensaId = parseInt(this.modalResgate.dataset.recompensaId);
        const recompensa = this.recompensas.find(r => r.id === recompensaId);
        
        if (!recompensa) return;
        
        // Verificar se usuário tem pontos suficientes
        if (this.usuarioAtual.pontos < recompensa.pontos) {
            alert('Você não tem pontos suficientes para resgatar esta recompensa!');
            return;
        }
        
        // Realizar resgate
        this.usuarioAtual.pontos -= recompensa.pontos;
        
        // Atualizar status da recompensa
        recompensa.status = 'resgatado';
        if (recompensa.limite) recompensa.limite--;
        
        // Atualizar pontos no header
        this.atualizarPontosUsuario();
        
        console.log('Resgate realizado:', {
            recompensa: recompensa.nome,
            pontos: recompensa.pontos,
            pontosRestantes: this.usuarioAtual.pontos
        });
        
        this.fecharModalResgate();
        this.aplicarFiltros();
    }
    
    atualizarPontosUsuario() {
        this.pontosAtuais.textContent = this.usuarioAtual.pontos;
    }
}

// Inicializar o sistema quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new RecompensasManager();
});
