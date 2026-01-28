/**
 * War Analysis Module - Refactored
 * Provides ranked war analysis with improved structure and error handling
 */

/**
 * Calculate base respect for a target based on level and stats
 * @param {Object} target - Target player object
 * @returns {number} - Base respect value
 */
function calculateBaseRespect(target) {
    if (!target || !target.level) {
        return 0;
    }
    
    // Base formula: level factor + stat modifier
    const levelFactor = Math.pow(target.level / 100, 1.5);
    const statModifier = (target.total || 1000) / 10000;
    
    return Math.max(1, Math.round(levelFactor * statModifier * 10));
}

/**
 * Assign tier based on total stats
 * @param {Object} player - Player object with stats
 * @returns {string} - Tier assignment (S, A, B, C, D)
 */
function assignRankedWarTier(player) {
    if (!player || !player.total) {
        return 'D';
    }
    
    const total = player.total;
    
    if (total >= 100000) return 'S';
    if (total >= 50000) return 'A';
    if (total >= 20000) return 'B';
    if (total >= 5000) return 'C';
    return 'D';
}

/**
 * Calculate ranked war respect for a battle
 * @param {Object} attacker - Attacker object
 * @param {Object} defender - Defender object
 * @returns {number} - Calculated respect
 */
function calculateRankedWarRespect(attacker, defender) {
    const baseRespect = calculateBaseRespect(defender);
    const attackerTier = assignRankedWarTier(attacker);
    const defenderTier = assignRankedWarTier(defender);
    
    // Tier multiplier
    const tierDiff = { 'S': 5, 'A': 4, 'B': 3, 'C': 2, 'D': 1 };
    const multiplier = tierDiff[defenderTier] / tierDiff[attackerTier];
    
    return Math.max(1, Math.round(baseRespect * multiplier));
}

/**
 * Get range of beatable targets based on attacker stats
 * @param {Object} attacker - Attacker player object
 * @returns {Object} - Range with min and max values
 */
function getBeatablesRange(attacker) {
    if (!attacker || !attacker.total) {
        return { min: 0, max: 0 };
    }
    
    const attackerTotal = attacker.total;
    
    return {
        min: Math.round(attackerTotal * 0.3),
        max: Math.round(attackerTotal * 1.5)
    };
}

/**
 * Filter beatable targets from a list
 * @param {Object} attacker - Attacker player object
 * @param {Array} targets - Array of potential targets
 * @returns {Array} - Filtered array of beatable targets
 */
function filterBeatablesTargets(attacker, targets) {
    if (!attacker || !Array.isArray(targets)) {
        return [];
    }
    
    const range = getBeatablesRange(attacker);
    
    return targets.filter(target => {
        const targetTotal = target.total || 0;
        return targetTotal >= range.min && targetTotal <= range.max;
    }).sort((a, b) => b.total - a.total);
}

/**
 * Simulate best lineup for war
 * @param {Array} members - Array of faction members
 * @param {Array} enemies - Array of enemy targets
 * @returns {Array} - Optimal matchups
 */
function simulateBestLineup(members, enemies) {
    if (!Array.isArray(members) || !Array.isArray(enemies)) {
        return [];
    }
    
    const lineup = [];
    const sortedMembers = [...members].sort((a, b) => (b.total || 0) - (a.total || 0));
    const sortedEnemies = [...enemies].sort((a, b) => (b.total || 0) - (a.total || 0));
    
    const maxPairs = Math.min(sortedMembers.length, sortedEnemies.length);
    
    for (let i = 0; i < maxPairs; i++) {
        const respect = calculateRankedWarRespect(sortedMembers[i], sortedEnemies[i]);
        lineup.push({
            attacker: sortedMembers[i],
            target: sortedEnemies[i],
            expectedRespect: respect,
            tier: assignRankedWarTier(sortedEnemies[i])
        });
    }
    
    return lineup;
}

/**
 * Calculate overall war verdict
 * @param {Object} analysis - Analysis data object
 * @returns {string} - War verdict
 */
function calculateVerdict(analysis) {
    if (!analysis || !analysis.lineup) {
        return 'Insufficient data for analysis';
    }
    
    const totalRespect = analysis.lineup.reduce((sum, match) => sum + match.expectedRespect, 0);
    const winRate = analysis.lineup.filter(m => 
        (m.attacker.total || 0) > (m.target.total || 0)
    ).length / analysis.lineup.length;
    
    if (winRate >= 0.7 && totalRespect >= 100) {
        return 'HIGHLY FAVORABLE - Strong chance of victory';
    } else if (winRate >= 0.5) {
        return 'FAVORABLE - Good chance of success';
    } else if (winRate >= 0.3) {
        return 'CHALLENGING - Requires strategic coordination';
    } else {
        return 'UNFAVORABLE - Not recommended without reinforcements';
    }
}

/**
 * Main function to analyze ranked war
 * @param {Object} factionData - Faction data object
 * @param {Object} enemyData - Enemy faction data object
 * @returns {Object} - Complete analysis
 */
function analyzeRankedWar(factionData, enemyData) {
    try {
        if (!factionData || !enemyData) {
            throw new Error('Missing faction or enemy data');
        }
        
        const members = Object.values(factionData.members || {});
        const enemies = Object.values(enemyData.members || {});
        
        const lineup = simulateBestLineup(members, enemies);
        const verdict = calculateVerdict({ lineup });
        
        const analysis = {
            verdict,
            lineup,
            totalExpectedRespect: lineup.reduce((sum, m) => sum + m.expectedRespect, 0),
            tierBreakdown: {
                S: lineup.filter(m => m.tier === 'S').length,
                A: lineup.filter(m => m.tier === 'A').length,
                B: lineup.filter(m => m.tier === 'B').length,
                C: lineup.filter(m => m.tier === 'C').length,
                D: lineup.filter(m => m.tier === 'D').length
            },
            recommendations: [
                lineup.length > 0 ? `Target ${lineup.length} matches identified` : 'No suitable matches found',
                verdict.includes('FAVORABLE') ? 'Proceed with confidence' : 'Consider strategic planning',
                'Monitor enemy activity before engagement'
            ],
            beatableTargets: filterBeatablesTargets(
                members[0] || { total: 0 },
                enemies
            ).map(t => t.name || t.player_id)
        };
        
        return analysis;
        
    } catch (error) {
        console.error('War analysis error:', error);
        return {
            verdict: 'Error in analysis',
            lineup: [],
            totalExpectedRespect: 0,
            tierBreakdown: {},
            recommendations: ['Unable to complete analysis due to error'],
            beatableTargets: [],
            error: error.message
        };
    }
}

// DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    displayAnalysis();
});

/**
 * Display analysis from localStorage
 */
function displayAnalysis() {
    const analysisElement = document.getElementById('analysis');
    
    if (!analysisElement) {
        console.error('Analysis element not found');
        return;
    }
    
    try {
        // Fetch analysis data from localStorage
        const storedAnalysis = localStorage.getItem('warAnalysis');
        const analysisData = storedAnalysis ? JSON.parse(storedAnalysis) : null;
        
        if (analysisData && Object.keys(analysisData).length > 0) {
            const recommendations = Array.isArray(analysisData.recommendations) 
                ? analysisData.recommendations.join(', ') 
                : 'No recommendations available';
                
            const tierBreakdown = analysisData.tierBreakdown 
                ? JSON.stringify(analysisData.tierBreakdown) 
                : 'No tier data';
                
            const beatableTargets = Array.isArray(analysisData.beatableTargets) 
                ? analysisData.beatableTargets.join(', ') 
                : 'No targets identified';
            
            analysisElement.innerHTML = `
                <div style="padding: 20px;">
                    <h2>${analysisData.verdict || 'Analysis Complete'}</h2>
                    <div style="margin-top: 15px;">
                        <p><strong>Recommendations:</strong> ${recommendations}</p>
                        <p><strong>Tier Breakdown:</strong> ${tierBreakdown}</p>
                        <p><strong>Beatable Targets:</strong> ${beatableTargets || 'None'}</p>
                        ${analysisData.totalExpectedRespect ? 
                            `<p><strong>Expected Respect:</strong> ${analysisData.totalExpectedRespect}</p>` : 
                            ''}
                    </div>
                    <div style="margin-top: 20px;">
                        <a href="index.html" style="padding: 10px 20px; background: #3498db; color: white; text-decoration: none; border-radius: 5px;">
                            Return to Command Hub
                        </a>
                    </div>
                </div>
            `;
        } else {
            analysisElement.innerHTML = `
                <p>No analysis data available.</p>
                <p>Please load faction data from the <a href="index.html">Command Hub</a> first.</p>
            `;
        }
    } catch (error) {
        console.error('Error displaying analysis:', error);
        analysisElement.innerHTML = `
            <p style="color: red;">Error displaying analysis: ${error.message}</p>
            <p><a href="index.html">Return to Command Hub</a></p>
        `;
    }
}