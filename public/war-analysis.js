// War Analysis Implementation

function formatNum(n) {
    if (!n || isNaN(n)) return '0';
    if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return n.toLocaleString();
}

function analyzeRankedWar() {
    // Get scan results from localStorage
    const scanResults = JSON.parse(localStorage.getItem('scanResults')) || [];
    const playerData = JSON.parse(localStorage.getItem('playerData')) || {};
    const factionData = JSON.parse(localStorage.getItem('factionData')) || {};
    
    if (scanResults.length === 0) {
        return {
            hasData: false,
            message: 'No scan data available. Please run a tactical scan first.'
        };
    }
    
    // Calculate tier breakdown
    const tierBreakdown = scanResults.reduce((acc, target) => {
        acc[target.tier] = (acc[target.tier] || 0) + 1;
        return acc;
    }, { secure: 0, prime: 0, risky: 0, suicide: 0 });
    
    // Get beatable targets (secure + prime)
    const beatableTargets = scanResults.filter(t => 
        t.tier === 'secure' || t.tier === 'prime'
    ).sort((a, b) => b.stats - a.stats);
    
    // Calculate verdict
    const totalTargets = scanResults.length;
    const beatableCount = beatableTargets.length;
    const beatablePercent = (beatableCount / totalTargets) * 100;
    
    let verdict, verdictColor;
    if (beatablePercent >= 70) {
        verdict = 'Highly Favorable - Strong chance of victory';
        verdictColor = '#10b981';
    } else if (beatablePercent >= 50) {
        verdict = 'Favorable - Good tactical position';
        verdictColor = '#3b82f6';
    } else if (beatablePercent >= 30) {
        verdict = 'Challenging - Strategic approach required';
        verdictColor = '#f59e0b';
    } else {
        verdict = 'Difficult - Consider alternative strategies';
        verdictColor = '#ef4444';
    }
    
    // Generate recommendations
    const recommendations = [];
    
    if (tierBreakdown.secure > 0) {
        recommendations.push(`Focus on ${tierBreakdown.secure} secure targets for guaranteed respect gains`);
    }
    
    if (tierBreakdown.prime > 0) {
        recommendations.push(`Prioritize ${tierBreakdown.prime} prime targets for optimal fair fight multipliers`);
    }
    
    if (tierBreakdown.risky > tierBreakdown.secure + tierBreakdown.prime) {
        recommendations.push('Exercise caution - majority of targets are risky or above your level');
    }
    
    if (beatableTargets.length > 0) {
        const avgFF = beatableTargets.reduce((sum, t) => sum + t.ff, 0) / beatableTargets.length;
        recommendations.push(`Average fair fight multiplier for beatable targets: ${avgFF.toFixed(2)}x`);
    }
    
    // Calculate estimated respect gain
    const estimatedRespect = beatableTargets.reduce((sum, t) => {
        // Simplified respect calculation
        const baseRespect = t.ff * 10; // Approximate
        return sum + baseRespect;
    }, 0);
    
    return {
        hasData: true,
        verdict,
        verdictColor,
        tierBreakdown,
        beatableTargets: beatableTargets.slice(0, 10), // Top 10
        recommendations,
        stats: {
            totalTargets,
            beatableCount,
            beatablePercent: beatablePercent.toFixed(1),
            estimatedRespect: estimatedRespect.toFixed(0)
        },
        playerData,
        factionData
    };
}

function displayAnalysis() {
    const container = document.getElementById('analysis-content');
    const analysis = analyzeRankedWar();
    
    if (!analysis.hasData) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📊</div>
                <h3>No Analysis Data Available</h3>
                <p>${analysis.message}</p>
                <p style="margin-top: 1rem;">
                    <a href="/" style="color: var(--primary); text-decoration: none;">
                        ← Return to Dashboard to run a scan
                    </a>
                </p>
            </div>
        `;
        return;
    }
    
    // Verdict section
    let html = `
        <div class="verdict-box" style="border-left-color: ${analysis.verdictColor}">
            <div class="verdict-text" style="color: ${analysis.verdictColor}">
                ${analysis.verdict}
            </div>
        </div>
    `;
    
    // Stats overview
    html += `
        <div class="stats-grid">
            <div class="stat-box">
                <div class="stat-value" style="color: var(--primary)">${analysis.stats.totalTargets}</div>
                <div class="stat-label">Total Targets</div>
            </div>
            <div class="stat-box">
                <div class="stat-value" style="color: var(--success)">${analysis.stats.beatableCount}</div>
                <div class="stat-label">Beatable Targets</div>
            </div>
            <div class="stat-box">
                <div class="stat-value" style="color: var(--info)">${analysis.stats.beatablePercent}%</div>
                <div class="stat-label">Win Rate</div>
            </div>
            <div class="stat-box">
                <div class="stat-value" style="color: var(--warning)">${formatNum(analysis.stats.estimatedRespect)}</div>
                <div class="stat-label">Est. Respect</div>
            </div>
        </div>
    `;
    
    // Tier breakdown
    html += `
        <h3 style="margin-bottom: 1rem;">📊 Target Distribution</h3>
        <div class="stats-grid" style="margin-bottom: 2rem;">
            <div class="stat-box">
                <div class="stat-value" style="color: var(--success)">${analysis.tierBreakdown.secure}</div>
                <div class="stat-label">Secure</div>
            </div>
            <div class="stat-box">
                <div class="stat-value" style="color: var(--info)">${analysis.tierBreakdown.prime}</div>
                <div class="stat-label">Prime</div>
            </div>
            <div class="stat-box">
                <div class="stat-value" style="color: var(--warning)">${analysis.tierBreakdown.risky}</div>
                <div class="stat-label">Risky</div>
            </div>
            <div class="stat-box">
                <div class="stat-value" style="color: var(--danger)">${analysis.tierBreakdown.suicide}</div>
                <div class="stat-label">Suicide</div>
            </div>
        </div>
    `;
    
    // Recommendations
    if (analysis.recommendations.length > 0) {
        html += `
            <h3 style="margin-bottom: 1rem;">💡 Tactical Recommendations</h3>
            <div class="recommendations">
                ${analysis.recommendations.map(rec => `
                    <div class="recommendation-item">${rec}</div>
                `).join('')}
            </div>
        `;
    }
    
    // Top beatable targets
    if (analysis.beatableTargets.length > 0) {
        html += `
            <h3 style="margin-top: 2rem; margin-bottom: 1rem;">🎯 Priority Targets</h3>
            <div class="target-list">
                ${analysis.beatableTargets.map(target => `
                    <div class="target-item ${target.tier}">
                        <div>
                            <strong>${target.name}</strong>
                            <div style="font-size: 0.875rem; color: var(--text-secondary);">
                                ID: ${target.id}
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: 600;">${target.ff.toFixed(2)}x FF</div>
                            <div style="font-size: 0.875rem; color: var(--text-secondary);">
                                ${formatNum(target.stats)} BS
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    container.innerHTML = html;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', displayAnalysis);