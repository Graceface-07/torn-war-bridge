class RankWarAnalysis {
    constructor() {
        this.hitsThreshold = 20;
        this.weaponMultipliers = {
            "pistol": 1.0,
            "rifle": 1.5,
            "shotgun": 2.0,
            "sniper": 2.5
        };
    }

    calculateRespectPerHit(weapon, hits) {
        const multiplier = this.weaponMultipliers[weapon] || 1;
        const respect = hits * multiplier;
        return respect;
    }

    categorizeRespect(respect) {
        if (respect > 100) {
            return "Good";
        } else if (respect > 50) {
            return "Bad";
        } else {
            return "Not Worth It";
        }
    }

    evaluateViability(hits, weapon) {
        if (hits < this.hitsThreshold) {
            return { category: "Not Worth It", recommendation: "Increase number of hits to 20 or more." };
        }

        const respect = this.calculateRespectPerHit(weapon, hits);
        const category = this.categorizeRespect(respect);
        return { category, respect, recommendation: this.getRecommendation(category) };
    }

    getRecommendation(category) {
        switch (category) {
            case "Good":
                return "Continue with this strategy for high rewards.";
            case "Bad":
                return "Re-evaluate weapon choice and strategy.";
            case "Not Worth It":
                return "Consider alternatives or focus on increasing hits.";
            default:
                return "No recommendations available.";
        }
    }
}

// Example usage:
const analysis = new RankWarAnalysis();
const result = analysis.evaluateViability(25, 'rifle');
console.log(result); // { category: "Good", respect: 37.5, recommendation: "Continue with this strategy for high rewards." }
