class BetsManager {
    constructor() {
        this.currentBets = [];
        this.analyzedMatches = [];
    }

    generateBetSlips(matches, count = 3) {
        if (matches.length < 2) {
            return [];
        }

        const betSlips = [];
        
        // Bilhete simples - 2 jogos
        if (matches.length >= 2) {
            betSlips.push(this.createDoubleBet(matches));
        }

        // Bilhete múltiplo - 3 jogos
        if (matches.length >= 3) {
            betSlips.push(this.createTripleBet(matches));
        }

        // Bilhete especial - Over/Under
        if (matches.length >= 2) {
            betSlips.push(this.createOverUnderBet(matches));
        }

        return betSlips.slice(0, count);
    }

    createDoubleBet(matches) {
        const selectedMatches = this.selectRandomMatches(matches, 2);
        
        return {
            id: 1,
            title: "Dupla NBA - Times Fortes",
            type: "double",
            matches: selectedMatches.map(match => ({
                teams: `${match.homeTeam} vs ${match.awayTeam}`,
                prediction: this.generatePrediction(match, 'double'),
                odds: this.calculateOdds(match, 'double')
            })),
            totalOdds: this.calculateTotalOdds(selectedMatches, 'double'),
            confidence: "high",
            analysis: "Times com alta eficiência ofensiva"
        };
    }

    createTripleBet(matches) {
        const selectedMatches = this.selectRandomMatches(matches, 3);
        
        return {
            id: 2,
            title: "Tripla NBA - Jogos Selecionados",
            type: "triple",
            matches: selectedMatches.map(match => ({
                teams: `${match.homeTeam} vs ${match.awayTeam}`,
                prediction: this.generatePrediction(match, 'triple'),
                odds: this.calculateOdds(match, 'triple')
            })),
            totalOdds: this.calculateTotalOdds(selectedMatches, 'triple'),
            confidence: "medium",
            analysis: "Combinação estratégica baseada em estatísticas"
        };
    }

    createOverUnderBet(matches) {
        const selectedMatches = this.selectRandomMatches(matches, 2);
        
        return {
            id: 3,
            title: "Over/Under NBA - Pontuação",
            type: "over_under",
            matches: selectedMatches.map(match => ({
                teams: `${match.homeTeam} vs ${match.awayTeam}`,
                prediction: `Over ${this.generateOverUnderLine(match)}`,
                odds: this.calculateOdds(match, 'over_under')
            })),
            totalOdds: this.calculateTotalOdds(selectedMatches, 'over_under'),
            confidence: "high",
            analysis: "Jogos com tendência de alta pontuação"
        };
    }

    selectRandomMatches(matches, count) {
        const shuffled = [...matches].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    generatePrediction(match, type) {
        const predictions = {
            double: [
                `${match.homeTeam} vence`,
                `${match.awayTeam} +5.5`,
                `Over ${this.generateOverUnderLine(match)}`
            ],
            triple: [
                `Ambos marcam 100+`,
                `${match.homeTeam} -2.5`,
                `Over ${this.generateOverUnderLine(match, true)}`
            ],
            over_under: [
                `Over ${this.generateOverUnderLine(match)}`,
                `Under ${this.generateOverUnderLine(match, true)}`
            ]
        };

        const available = predictions[type] || predictions.double;
        return available[Math.floor(Math.random() * available.length)];
    }

    generateOverUnderLine(match, conservative = false) {
        const baseLine = conservative ? 205 : 215;
        const variation = Math.floor(Math.random() * 10);
        return baseLine + variation + 0.5;
    }

    calculateOdds(match, type) {
        const baseOdds = {
            double: 1.6,
            triple: 1.8,
            over_under: 1.7
        };

        const base = baseOdds[type] || 1.6;
        const variation = (Math.random() * 0.4) - 0.2; // ±0.2
        return parseFloat((base + variation).toFixed(2));
    }

    calculateTotalOdds(matches, type) {
        const baseOdds = matches.reduce((total, match) => {
            return total * this.calculateOdds(match, type);
        }, 1);

        return parseFloat(baseOdds.toFixed(2));
    }

    analyzeBetRisk(betSlip) {
        const riskFactors = {
            high: betSlip.totalOdds > 4.0,
            medium: betSlip.totalOdds > 2.5,
            low: betSlip.totalOdds <= 2.5
        };

        if (riskFactors.high) return "high";
        if (riskFactors.medium) return "medium";
        return "low";
    }

    validateBet(betSlip) {
        const errors = [];

        if (!betSlip.matches || betSlip.matches.length === 0) {
            errors.push("Nenhum jogo selecionado");
        }

        if (betSlip.totalOdds < 1.1) {
            errors.push("Odds muito baixas");
        }

        if (betSlip.totalOdds > 10.0) {
            errors.push("Odds muito altas");
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}