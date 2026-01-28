/**
 * FF Scouter Analysis Implementation
 * Calculates respect values and categorizes targets for war analysis
 */

/**
 * Calculate Base Respect
 * Base Respect = (Ln(level) + 1.0) / 4.0
 */
function calculateBaseRespect(level) {
    if (!level || level < 1) return 0;
    return (Math.log(level) + 1.0) / 4.0;
}

/**
 * Calculate Fair Fight Multiplier
 * FF Multiplier = 1 + [8/3 * (Defender_BS / Attacker_BS)]
 * Capped between 1x and 3x
 */
function calculateFFMultiplier(defenderBS, attackerBS) {
    if (!defenderBS || !attackerBS || attackerBS === 0) return 1;
    let multiplier = 1 + (8/3) * (defenderBS / attackerBS);
    // Cap between 1x and 3x
    return Math.max(1, Math.min(3, multiplier));
}

/**
 * Calculate Expected Respect
 * Expected Respect = Base R × Fair Fight × 1.25 (chain/overseas baseline)
 */
function calculateExpectedRespect(baseRespect, ffMultiplier) {
    return baseRespect * ffMultiplier * 1.25;
}

/**
 * Categorize target based on FF Multiplier
 */
function categorizeTarget(ffMultiplier, expectedRespect) {
    if (ffMultiplier >= 2.5) {
        return {
            category: 'SAFE',
            icon: '✓',
            color: 'green',
            advice: 'Easy target - high respect gain, minimal risk'
        };
    } else if (ffMultiplier >= 1.8) {
        return {
            category: 'PRIME',
            icon: '★',
            color: 'gold',
            advice: 'Optimal target - good respect, fair fight'
        };
    } else if (ffMultiplier >= 1.2) {
        return {
            category: 'RISKY',
            icon: '⚠',
            color: 'orange',
            advice: 'Challenging - low respect, harder fight'
        };
    } else {
        return {
            category: 'SUICIDE',
            icon: '✗',
            color: 'red',
            advice: 'Avoid - minimal respect, likely loss'
        };
    }
}

/**
 * Analyze a single target
 */
function analyzeTarget(playerBS, targetData) {
    const baseRespect = calculateBaseRespect(targetData.level);
    const ffMultiplier = calculateFFMultiplier(targetData.battleScore || 0, playerBS);
    const expectedRespect = calculateExpectedRespect(baseRespect, ffMultiplier);
    const categorization = categorizeTarget(ffMultiplier, expectedRespect);

    return {
        id: targetData.id,
        name: targetData.name,
        level: targetData.level,
        battleScore: targetData.bs_estimate_human || 'N/A',
        baseRespect: baseRespect.toFixed(4),
        ffMultiplier: ffMultiplier.toFixed(2),
        expectedRespect: expectedRespect.toFixed(2),
        ...categorization
    };
}

/**
 * Analyze entire faction against player at given battle stat level
 */
function analyzeFaction(playerBS, factionMembers) {
    const results = factionMembers.map(member => analyzeTarget(playerBS, member));
    
    // Sort by expected respect (descending)
    results.sort((a, b) => parseFloat(b.expectedRespect) - parseFloat(a.expectedRespect));
    
    // Summarize by category
    const summary = {
        safe: results.filter(r => r.category === 'SAFE').length,
        prime: results.filter(r => r.category === 'PRIME').length,
        risky: results.filter(r => r.category === 'RISKY').length,
        suicide: results.filter(r => r.category === 'SUICIDE').length,
        totalTargets: results.length,
        topTargets: results.slice(0, 15)
    };

    return { results, summary };
}

/**
 * Generate comprehensive war report
 */
function generateWarReport(playerData, factionData) {
    const scenario72M = analyzeFaction(72000000, factionData);
    const scenario82M = analyzeFaction(82000000, factionData);

    return {
        player: playerData,
        scenario72M: scenario72M,
        scenario82M: scenario82M,
        generatedAt: new Date().toLocaleString()
    };
}

/**
 * Format number with thousand separators
 */
function formatNumber(num) {
    return parseFloat(num).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/**
 * Create HTML for scenario analysis
 */
function createScenarioHTML(scenarioName, analysis) {
    const { summary, results } = analysis;
    
    let html = `<h2>${scenarioName} Battle Stats Analysis</h2>`;
    
    // Summary statistics
    html += `
        <div class="summary-stats">
            <div class="stat-box safe">
                <div class="stat-number">${summary.safe}</div>
                <div class="stat-label">SAFE</div>
            </div>
            <div class="stat-box prime">
                <div class="stat-number">${summary.prime}</div>
                <div class="stat-label">PRIME</div>
            </div>
            <div class="stat-box risky">
                <div class="stat-number">${summary.risky}</div>
                <div class="stat-label">RISKY</div>
            </div>
            <div class="stat-box suicide">
                <div class="stat-number">${summary.suicide}</div>
                <div class="stat-label">SUICIDE</div>
            </div>
        </div>
    `;
    
    // Top targets table
    html += `
        <h3>Top 15 Targets by Respect Gain</h3>
        <table class="targets-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Level</th>
                    <th>Battle Stats</th>
                    <th>Base Respect</th>
                    <th>FF Multiplier</th>
                    <th>Expected Respect</th>
                    <th>Category</th>
                    <th>Advice</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    summary.topTargets.forEach(target => {
        const categoryClass = `category-${target.category.toLowerCase()}`;
        html += `
            <tr>
                <td><strong>${target.name}</strong></td>
                <td>${target.level}</td>
                <td>${target.battleScore}</td>
                <td>${target.baseRespect}</td>
                <td>${target.ffMultiplier}x</td>
                <td><strong>${formatNumber(target.expectedRespect)}</strong></td>
                <td><span class="${categoryClass}">${target.category}</span></td>
                <td><span class="advice">${target.advice}</span></td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    return html;
}

/**
 * Run the war analysis
 */
function runWarAnalysis() {
    try {
        // Retrieve data from localStorage
        const playerDataStr = localStorage.getItem('playerData');
        const factionDataStr = localStorage.getItem('factionData');
        
        if (!playerDataStr || !factionDataStr) {
            document.getElementById('loadingIndicator').style.display = 'none';
            document.getElementById('errorContainer').innerHTML = `
                <div class="error">
                    <strong>Error:</strong> No faction data found. Please load faction data from the dashboard first.
                </div>
            `;
            return;
        }
        
        const playerData = JSON.parse(playerDataStr);
        const factionData = JSON.parse(factionDataStr);
        
        // Display player info in header
        document.getElementById('playerId').textContent = playerData.id || '-';
        document.getElementById('playerStats').textContent = playerData.stats?.bs_estimate_human || '-';
        document.getElementById('playerFF').textContent = playerData.stats?.fair_fight || '-';
        document.getElementById('generatedTime').textContent = new Date().toLocaleString();
        
        // Generate war report
        const report = generateWarReport(playerData, factionData);
        
        // Display scenarios
        document.getElementById('scenario72M').innerHTML = createScenarioHTML('72M', report.scenario72M);
        document.getElementById('scenario82M').innerHTML = createScenarioHTML('82M', report.scenario82M);
        
        // Hide loading, show results
        document.getElementById('loadingIndicator').style.display = 'none';
        document.getElementById('analysisResults').style.display = 'block';
        
    } catch (error) {
        console.error('Analysis error:', error);
        document.getElementById('loadingIndicator').style.display = 'none';
        document.getElementById('errorContainer').innerHTML = `
            <div class="error">
                <strong>Error:</strong> ${error.message}
            </div>
        `;
    }
}