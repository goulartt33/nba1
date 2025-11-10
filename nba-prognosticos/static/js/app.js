class NBAPrognosticosApp {
    constructor() {
        this.matches = [];
        this.bets = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadMatches();
    }

    bindEvents() {
        document.getElementById('loadMatches').addEventListener('click', () => this.loadMatches());
        document.getElementById('loadLiveMatches').addEventListener('click', () => this.loadLiveMatches());
        document.getElementById('generateBets').addEventListener('click', () => this.generateBets());
        document.getElementById('sendTelegram').addEventListener('click', () => this.sendTelegram());
    }

    async loadMatches() {
        this.showLoading('Carregando jogos NBA...');
        
        try {
            const response = await fetch('/api/matches');
            const data = await response.json();
            
            if (data.success) {
                this.matches = data.data;
                this.displayMatches(this.matches);
                this.showAlert(`✅ ${data.message}`, 'success');
            } else {
                this.showAlert('❌ Nenhum jogo encontrado', 'error');
            }
        } catch (error) {
            console.error('Erro ao carregar jogos:', error);
            this.showAlert('❌ Erro ao carregar jogos', 'error');
        }
    }

    async loadLiveMatches() {
        this.showLoading('Buscando jogos ao vivo NBA...');
        
        try {
            const response = await fetch('/api/live-matches');
            const data = await response.json();
            
            if (data.success) {
                this.displayMatches(data.data, true);
                this.showAlert(`🔴 ${data.message}`, 'success');
            } else {
                this.showAlert('❌ Nenhum jogo ao vivo', 'error');
            }
        } catch (error) {
            console.error('Erro ao carregar jogos ao vivo:', error);
            this.showAlert('❌ Erro ao carregar jogos ao vivo', 'error');
        }
    }

    displayMatches(matches, isLive = false) {
        const container = document.getElementById('matchesContainer');
        
        if (!matches || matches.length === 0) {
            container.innerHTML = '<div class="alert alert-error">Nenhum jogo NBA encontrado</div>';
            return;
        }

        container.innerHTML = matches.map(match => this.createMatchCard(match, isLive)).join('');
    }

    createMatchCard(match, isLive) {
        const isLiveGame = isLive || match.status === 'AO VIVO';
        
        return `
            <div class="match-card">
                <div class="match-header">
                    <div class="teams">${match.homeTeam} vs ${match.awayTeam}</div>
                    <div class="match-status ${isLiveGame ? 'live' : ''}">
                        ${isLiveGame ? '<span class="live-indicator"></span>' : ''}
                        ${match.status}
                    </div>
                </div>
                
                <div class="match-details">
                    <div class="detail">
                        <span>🏆 Liga:</span>
                        <span>${match.league}</span>
                    </div>
                    <div class="detail">
                        <span>📅 Data:</span>
                        <span>${match.date}</span>
                    </div>
                    <div class="detail">
                        <span>⏰ Horário:</span>
                        <span>${match.time}</span>
                    </div>
                    ${match.score ? `
                    <div class="detail">
                        <span>📊 Placar:</span>
                        <span><strong>${match.score}</strong></span>
                    </div>
                    ` : ''}
                </div>

                ${match.analysis ? `
                <div class="match-analysis">
                    <div class="detail">
                        <span>🎯 Recomendação:</span>
                        <span><strong>${match.analysis.recommended_bet}</strong></span>
                    </div>
                    <div class="detail">
                        <span>📈 Probabilidade:</span>
                        <span>${match.analysis.probability}</span>
                    </div>
                </div>
                ` : ''}

                <div class="predictions">
                    <h4>📊 Previsões do Jogo</h4>
                    ${match.predictions ? match.predictions.slice(0, 3).map(pred => `
                        <div class="prediction-item confidence-${pred.confidence}">
                            <div><strong>${pred.name}:</strong> ${pred.value}</div>
                        </div>
                    `).join('') : 'Sem previsões disponíveis'}
                </div>

                ${match.player_stats ? `
                <div class="player-stats">
                    <h4>⭐ Jogadores em Destaque</h4>
                    ${match.player_stats.slice(0, 2).map(player => `
                        <div class="player-stat">
                            <span>${player.nome} (${player.posicao})</span>
                            <span>${player.estatisticas.pontos} pts</span>
                        </div>
                    `).join('')}
                </div>
                ` : ''}

                <button class="btn btn-success" onclick="app.viewMatchDetails(${match.id})" style="margin-top: 10px; width: 100%;">
                    📈 Ver Detalhes Completos
                </button>
            </div>
        `;
    }

    async viewMatchDetails(matchId) {
        try {
            const response = await fetch(`/api/player-stats/${matchId}`);
            const data = await response.json();
            
            if (data.success) {
                this.showPlayerStats(data.data);
            }
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        }
    }

    showPlayerStats(stats) {
        const modal = this.createStatsModal(stats);
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    createStatsModal(stats) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 1000;
            overflow-y: auto;
        `;

        modal.innerHTML = `
            <div style="background: white; margin: 50px auto; padding: 20px; border-radius: 10px; max-width: 800px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2>📊 Estatísticas Detalhadas</h2>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
                </div>
                <div>
                    ${this.createTeamStats(stats.home_team, 'Casa')}
                    ${this.createTeamStats(stats.away_team, 'Visitante')}
                </div>
            </div>
        `;

        return modal;
    }

    createTeamStats(players, teamName) {
        return `
            <div style="margin-bottom: 30px;">
                <h3>🏀 ${teamName}</h3>
                ${players.map(player => `
                    <div style="background: #f8f9fa; padding: 15px; margin-bottom: 10px; border-radius: 5px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <strong>${player.nome} #${player.numero} (${player.posicao})</strong>
                            <span>⭐ ${player.avaliacao}/10</span>
                        </div>
                        <div class="stats-grid">
                            ${Object.entries(player.estatisticas).map(([key, value]) => `
                                <div class="stat-item">
                                    <div style="font-size: 0.7rem; color: #666;">${this.formatStatName(key)}</div>
                                    <div style="font-weight: bold;">${value}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    formatStatName(key) {
        const names = {
            'pontos': 'PTS',
            'rebotes': 'REB',
            'assistencias': 'AST',
            'roubos_bola': 'STL',
            'tocos': 'BLK',
            'erros': 'TO',
            'minutos': 'MIN',
            'arremessos_3pts': '3PT',
            'arremessos_campo': 'FG',
            'lances_livres': 'FT'
        };
        return names[key] || key;
    }

    async generateBets() {
        if (this.matches.length === 0) {
            this.showAlert('❌ Carregue os jogos primeiro', 'error');
            return;
        }

        this.showLoading('Gerando bilhetes NBA...');

        try {
            const response = await fetch('/api/generate-bets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ matches: this.matches })
            });

            const data = await response.json();
            
            if (data.success) {
                this.bets = data.data;
                this.displayBets();
                this.showAlert(`✅ ${data.message}`, 'success');
            } else {
                this.showAlert('❌ Erro ao gerar bilhetes', 'error');
            }
        } catch (error) {
            console.error('Erro ao gerar bilhetes:', error);
            this.showAlert('❌ Erro ao gerar bilhetes', 'error');
        }
    }

    displayBets() {
        const container = document.getElementById('betsContainer');
        
        if (!this.bets || this.bets.length === 0) {
            container.innerHTML = '<div class="alert alert-error">Nenhum bilhete gerado</div>';
            return;
        }

        container.innerHTML = this.bets.map(bet => `
            <div class="bet-card">
                <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 10px;">
                    <h3>${bet.title}</h3>
                    <div class="odds">Odds: ${bet.odds}</div>
                </div>
                <div style="margin-bottom: 10px;">
                    ${bet.matches.map(match => `
                        <div style="margin-bottom: 5px;">
                            <strong>${match.teams}</strong><br>
                            <span>🎯 ${match.prediction}</span>
                        </div>
                    `).join('')}
                </div>
                <div style="color: #666; font-size: 0.9rem;">
                    ${bet.player_analysis}
                </div>
                <button class="btn btn-success" style="margin-top: 10px; width: 100%;" onclick="app.sendToTelegram(${bet.id})">
                    📱 Enviar para Telegram
                </button>
            </div>
        `).join('');
    }

    async sendToTelegram(betId) {
        const bet = this.bets.find(b => b.id === betId);
        if (!bet) return;

        const message = this.formatTelegramMessage(bet);

        try {
            const response = await fetch('/api/send-telegram', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });

            const data = await response.json();
            
            if (data.success) {
                this.showAlert('✅ Bilhete enviado para Telegram!', 'success');
            } else {
                this.showAlert('❌ Erro ao enviar para Telegram', 'error');
            }
        } catch (error) {
            console.error('Erro ao enviar para Telegram:', error);
            this.showAlert('❌ Erro ao enviar para Telegram', 'error');
        }
    }

    formatTelegramMessage(bet) {
        return `
🏀 BILHETE NBA - ${bet.title}

${bet.matches.map(match => `
🔸 ${match.teams}
🎯 ${match.prediction}
`).join('')}

📊 Análise: ${bet.player_analysis}
💰 Odds: ${bet.odds}
⚡ Confiança: ${bet.confidence}

✅ Gerado por NBA Prognósticos
        `.trim();
    }

    async sendTelegram() {
        if (this.bets.length === 0) {
            this.showAlert('❌ Gere os bilhetes primeiro', 'error');
            return;
        }

        // Envia todos os bilhetes
        for (const bet of this.bets) {
            await this.sendToTelegram(bet.id);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Delay entre envios
        }
    }

    showLoading(message) {
        const container = document.getElementById('matchesContainer');
        container.innerHTML = `
            <div class="loading">
                <div>⏳ ${message}</div>
            </div>
        `;
    }

    showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        
        document.querySelector('.container').insertBefore(alertDiv, document.querySelector('.controls'));
        
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
}

// Inicializar a aplicação
const app = new NBAPrognosticosApp();