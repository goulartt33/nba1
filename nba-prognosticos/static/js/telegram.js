class TelegramIntegration {
    constructor() {
        this.botToken = null;
        this.chatId = null;
        this.isConfigured = false;
    }

    configure(token, chatId) {
        this.botToken = token;
        this.chatId = chatId;
        this.isConfigured = !!token && !!chatId;
        
        if (this.isConfigured) {
            console.log('Telegram configurado com sucesso');
        }
    }

    async sendMessage(message) {
        if (!this.isConfigured) {
            console.warn('Telegram não configurado');
            return { success: false, error: 'Telegram não configurado' };
        }

        try {
            // Simulação de envio - na implementação real, usar a API do Telegram
            console.log('📱 Mensagem Telegram:', message);
            
            // Para implementação real, descomentar:
            /*
            const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: this.chatId,
                    text: message,
                    parse_mode: 'HTML'
                })
            });

            const data = await response.json();
            return { success: data.ok, data: data };
            */

            // Simulação de sucesso
            await new Promise(resolve => setTimeout(resolve, 1000));
            return { success: true, data: { message_id: Date.now() } };

        } catch (error) {
            console.error('Erro ao enviar para Telegram:', error);
            return { success: false, error: error.message };
        }
    }

    async sendBetSlip(betSlip) {
        const message = this.formatBetSlipMessage(betSlip);
        return await this.sendMessage(message);
    }

    formatBetSlipMessage(betSlip) {
        return `
🏀 <b>${betSlip.title}</b>

${betSlip.matches.map((match, index) => `
${index + 1}. <b>${match.teams}</b>
   🎯 ${match.prediction}
   📊 Odds: ${match.odds}
`).join('')}

<b>💰 ODDS TOTAIS: ${betSlip.totalOdds}</b>
⚡ Confiança: ${betSlip.confidence}
📈 Análise: ${betSlip.analysis}

<i>Gerado por NBA Prognósticos</i>
        `.trim();
    }

    async sendMatchAlert(match) {
        const message = this.formatMatchAlert(match);
        return await this.sendMessage(message);
    }

    formatMatchAlert(match) {
        const isLive = match.status === 'AO VIVO';
        
        return `
${isLive ? '🔴' : '🟢'} <b>${match.homeTeam} vs ${match.awayTeam}</b>

🏆 ${match.league}
📅 ${match.date} ⏰ ${match.time}
${match.score ? `📊 <b>${match.score}</b>` : ''}

${match.analysis ? `
🎯 <b>Recomendação:</b> ${match.analysis.recommended_bet}
📈 <b>Probabilidade:</b> ${match.analysis.probability}
` : ''}

<i>NBA Prognósticos - Análise em Tempo Real</i>
        `.trim();
    }

    async sendDailySummary(matches) {
        const liveMatches = matches.filter(m => m.status === 'AO VIVO');
        const upcomingMatches = matches.filter(m => m.status === 'Agendado');

        const message = `
📊 <b>RESUMO DIÁRIO NBA</b>

🔴 <b>Jogos Ao Vivo:</b> ${liveMatches.length}
🟢 <b>Próximos Jogos:</b> ${upcomingMatches.length}

${liveMatches.length > 0 ? `
<b>🔴 AO VIVO AGORA:</b>
${liveMatches.map(match => `• ${match.homeTeam} vs ${match.awayTeam} - ${match.score}`).join('\n')}
` : ''}

${upcomingMatches.slice(0, 3).map(match => `
🟢 <b>${match.homeTeam} vs ${match.awayTeam}</b>
⏰ ${match.time} | 🎯 ${match.analysis?.recommended_bet || 'Análise pendente'}
`).join('')}

<i>NBA Prognósticos - Sua análise completa da NBA</i>
        `.trim();

        return await this.sendMessage(message);
    }
}

// Instância global para uso na aplicação
const telegramBot = new TelegramIntegration();