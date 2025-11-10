class NBAAPI {
    constructor() {
        this.baseURL = '';
    }

    async getMatches() {
        return this.fetchAPI('/api/matches');
    }

    async getLiveMatches() {
        return this.fetchAPI('/api/live-matches');
    }

    async getPlayerStats(matchId) {
        return this.fetchAPI(`/api/player-stats/${matchId}`);
    }

    async analyzeMatches(matches) {
        return this.postAPI('/api/analyze', { matches });
    }

    async generateBets(matches) {
        return this.postAPI('/api/generate-bets', { matches });
    }

    async sendTelegram(message) {
        return this.postAPI('/api/send-telegram', { message });
    }

    async fetchAPI(endpoint) {
        try {
            const response = await fetch(endpoint);
            return await response.json();
        } catch (error) {
            console.error(`API Error ${endpoint}:`, error);
            return { success: false, error: error.message };
        }
    }

    async postAPI(endpoint, data) {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error(`API POST Error ${endpoint}:`, error);
            return { success: false, error: error.message };
        }
    }
}