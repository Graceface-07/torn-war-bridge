/**
 * Command Hub Main Controller
 * Handles UI interactions and data presentation
 */

// Configuration constants
const HUB_CONFIG = {
    ACTIVITY_WINDOW: 86400, // 24 hours in seconds
    READINESS_THRESHOLD: 70  // Percentage threshold for good readiness
};

class CommandHub {
    constructor() {
        this.apiKey = localStorage.getItem('tornApiKey') || '';
        this.currentPlayerId = null;
        this.currentFactionId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadApiKeyStatus();
    }

    setupEventListeners() {
        // API Key management
        document.getElementById('saveApiKey').addEventListener('click', () => this.saveApiKey());
        
        // Quick action buttons
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleAction(action);
            });
        });

        // Refresh buttons
        document.querySelectorAll('[data-refresh]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.refresh;
                this.handleAction(action, true);
            });
        });

        // Modal close
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        window.addEventListener('click', (e) => {
            if (e.target.id === 'modal') {
                this.closeModal();
            }
        });
    }

    saveApiKey() {
        const apiKeyInput = document.getElementById('apiKey');
        const apiKey = apiKeyInput.value.trim();
        
        if (!apiKey) {
            this.showStatus('Please enter a valid API key', 'error');
            return;
        }

        this.apiKey = apiKey;
        localStorage.setItem('tornApiKey', apiKey);
        this.showStatus('API Key saved successfully!', 'success');
        apiKeyInput.value = '';
    }

    loadApiKeyStatus() {
        if (this.apiKey) {
            this.showStatus('API Key loaded', 'success');
        }
    }

    showStatus(message, type) {
        const statusElement = document.getElementById('apiStatus');
        statusElement.textContent = message;
        statusElement.className = `status ${type}`;
        
        setTimeout(() => {
            statusElement.className = 'status';
            statusElement.textContent = '';
        }, 3000);
    }

    showLoading() {
        document.getElementById('loadingOverlay').classList.add('active');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('active');
    }

    async handleAction(action, forceRefresh = false) {
        if (!this.apiKey) {
            this.showStatus('Please set your API key first', 'error');
            return;
        }

        this.showLoading();

        try {
            switch (action) {
                case 'player':
                    await this.loadPlayerStats(forceRefresh);
                    break;
                case 'faction':
                    await this.loadFactionInsights(forceRefresh);
                    break;
                case 'war':
                    await this.loadWarAnalysis(forceRefresh);
                    break;
                case 'members':
                    await this.loadMemberStats(forceRefresh);
                    break;
            }
        } catch (error) {
            this.showStatus(`Error: ${error.message}`, 'error');
            console.error('Action error:', error);
        } finally {
            this.hideLoading();
        }
    }

    async loadPlayerStats(forceRefresh = false) {
        if (forceRefresh) {
            apiService.clearCache();
        }

        try {
            // Fetch current user data
            const playerData = await apiService.getPlayerData('', this.apiKey, 'profile,battlestats,personalstats');
            
            const content = document.getElementById('playerContent');
            content.innerHTML = `
                <div class="data-row">
                    <span class="data-label">Player Name:</span>
                    <span class="data-value">${playerData.name || 'N/A'}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Level:</span>
                    <span class="data-value">${playerData.level || 'N/A'}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Faction:</span>
                    <span class="data-value">${playerData.faction?.faction_name || 'None'}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Life:</span>
                    <span class="data-value">${playerData.life?.current || 0} / ${playerData.life?.maximum || 0}</span>
                </div>
                <div class="stat-grid">
                    <div class="stat-item">
                        <div class="label">Strength</div>
                        <div class="value">${this.formatNumber(playerData.strength || 0)}</div>
                    </div>
                    <div class="stat-item">
                        <div class="label">Defense</div>
                        <div class="value">${this.formatNumber(playerData.defense || 0)}</div>
                    </div>
                    <div class="stat-item">
                        <div class="label">Speed</div>
                        <div class="value">${this.formatNumber(playerData.speed || 0)}</div>
                    </div>
                    <div class="stat-item">
                        <div class="label">Dexterity</div>
                        <div class="value">${this.formatNumber(playerData.dexterity || 0)}</div>
                    </div>
                </div>
            `;

            this.currentPlayerId = playerData.player_id;
            this.currentFactionId = playerData.faction?.faction_id;
            
            // Store in localStorage for compatibility
            localStorage.setItem('playerData', JSON.stringify(playerData));
            
        } catch (error) {
            document.getElementById('playerContent').innerHTML = 
                `<p class="placeholder" style="color: var(--danger-color);">Error loading player data: ${error.message}</p>`;
            throw error;
        }
    }

    async loadFactionInsights(forceRefresh = false) {
        if (forceRefresh) {
            apiService.clearCache();
        }

        if (!this.currentFactionId) {
            // Try to get faction ID from player data first
            await this.loadPlayerStats();
        }

        if (!this.currentFactionId) {
            document.getElementById('factionContent').innerHTML = 
                '<p class="placeholder">You are not in a faction</p>';
            return;
        }

        try {
            const factionData = await apiService.getFactionData(this.currentFactionId, this.apiKey, 'basic,territory,stats');
            
            const content = document.getElementById('factionContent');
            content.innerHTML = `
                <div class="data-row">
                    <span class="data-label">Faction Name:</span>
                    <span class="data-value">${factionData.name || 'N/A'}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Tag:</span>
                    <span class="data-value">${factionData.tag || 'N/A'}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Members:</span>
                    <span class="data-value">${factionData.members?.length || 0}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Respect:</span>
                    <span class="data-value">${this.formatNumber(factionData.respect || 0)}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Age:</span>
                    <span class="data-value">${factionData.age || 0} days</span>
                </div>
                <div class="stat-grid">
                    <div class="stat-item">
                        <div class="label">Best Chain</div>
                        <div class="value">${this.formatNumber(factionData.best_chain || 0)}</div>
                    </div>
                    <div class="stat-item">
                        <div class="label">Territory</div>
                        <div class="value">${Object.keys(factionData.territory || {}).length}</div>
                    </div>
                </div>
            `;

            // Store in localStorage for compatibility
            localStorage.setItem('factionData', JSON.stringify(factionData));
            
        } catch (error) {
            document.getElementById('factionContent').innerHTML = 
                `<p class="placeholder" style="color: var(--danger-color);">Error loading faction data: ${error.message}</p>`;
            throw error;
        }
    }

    async loadWarAnalysis(forceRefresh = false) {
        if (forceRefresh) {
            apiService.clearCache();
        }

        const content = document.getElementById('warContent');
        
        try {
            // Get faction data for war analysis
            if (!this.currentFactionId) {
                await this.loadPlayerStats();
            }

            if (!this.currentFactionId) {
                content.innerHTML = '<p class="placeholder">No faction data available for war analysis</p>';
                return;
            }

            const factionData = await apiService.getFactionData(this.currentFactionId, this.apiKey, 'basic,members,stats');
            
            // Calculate basic war metrics
            const members = Object.values(factionData.members || {});
            const totalMembers = members.length;
            const activeMembers = members.filter(m => 
                m.last_action?.timestamp > Date.now() / 1000 - HUB_CONFIG.ACTIVITY_WINDOW
            ).length;
            
            content.innerHTML = `
                <div class="data-row">
                    <span class="data-label">Total Members:</span>
                    <span class="data-value">${totalMembers}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Active (24h):</span>
                    <span class="data-value">${activeMembers}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Best Chain:</span>
                    <span class="data-value">${this.formatNumber(factionData.best_chain || 0)}</span>
                </div>
                <div class="stat-grid">
                    <div class="stat-item">
                        <div class="label">Readiness</div>
                        <div class="value">${Math.round((activeMembers / totalMembers) * 100)}%</div>
                    </div>
                    <div class="stat-item">
                        <div class="label">Total Respect</div>
                        <div class="value">${this.formatNumber(factionData.respect || 0)}</div>
                    </div>
                </div>
                <button class="btn btn-primary" style="margin-top: 15px; width: 100%;" onclick="commandHub.showWarDetails()">
                    View Detailed Analysis
                </button>
            `;

            // Store war analysis data
            const warAnalysis = {
                totalMembers,
                activeMembers,
                readiness: Math.round((activeMembers / totalMembers) * 100),
                bestChain: factionData.best_chain || 0,
                respect: factionData.respect || 0
            };
            localStorage.setItem('warAnalysis', JSON.stringify(warAnalysis));
            
        } catch (error) {
            content.innerHTML = 
                `<p class="placeholder" style="color: var(--danger-color);">Error loading war analysis: ${error.message}</p>`;
            throw error;
        }
    }

    async loadMemberStats(forceRefresh = false) {
        if (forceRefresh) {
            apiService.clearCache();
        }

        if (!this.currentFactionId) {
            await this.loadPlayerStats();
        }

        if (!this.currentFactionId) {
            document.getElementById('membersContent').innerHTML = 
                '<p class="placeholder">No faction data available</p>';
            return;
        }

        try {
            const memberStats = await apiService.getMemberStats(this.currentFactionId, this.apiKey);
            
            const members = Object.values(memberStats.members || {});
            const onlineMembers = members.filter(m => m.last_action?.status === 'Online').length;
            const offlineMembers = members.filter(m => m.last_action?.status === 'Offline').length;
            
            const content = document.getElementById('membersContent');
            content.innerHTML = `
                <div class="data-row">
                    <span class="data-label">Total Members:</span>
                    <span class="data-value">${memberStats.totalMembers}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Online:</span>
                    <span class="data-value">${onlineMembers}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Offline:</span>
                    <span class="data-value">${offlineMembers}</span>
                </div>
                <div class="stat-grid">
                    <div class="stat-item">
                        <div class="label">Online Rate</div>
                        <div class="value">${Math.round((onlineMembers / memberStats.totalMembers) * 100)}%</div>
                    </div>
                    <div class="stat-item">
                        <div class="label">Total Members</div>
                        <div class="value">${memberStats.totalMembers}</div>
                    </div>
                </div>
                <button class="btn btn-primary" style="margin-top: 15px; width: 100%;" onclick="commandHub.showMemberDetails()">
                    View Member List
                </button>
            `;
            
        } catch (error) {
            document.getElementById('membersContent').innerHTML = 
                `<p class="placeholder" style="color: var(--danger-color);">Error loading member stats: ${error.message}</p>`;
            throw error;
        }
    }

    showWarDetails() {
        const warAnalysis = JSON.parse(localStorage.getItem('warAnalysis') || '{}');
        const modalBody = document.getElementById('modalBody');
        
        modalBody.innerHTML = `
            <h2>⚔️ Detailed War Analysis</h2>
            <div style="margin-top: 20px;">
                <h3>Overview</h3>
                <div class="data-row">
                    <span class="data-label">Total Members:</span>
                    <span class="data-value">${warAnalysis.totalMembers || 0}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Active Members (24h):</span>
                    <span class="data-value">${warAnalysis.activeMembers || 0}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Faction Readiness:</span>
                    <span class="data-value">${warAnalysis.readiness || 0}%</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Best Chain:</span>
                    <span class="data-value">${this.formatNumber(warAnalysis.bestChain || 0)}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Total Respect:</span>
                    <span class="data-value">${this.formatNumber(warAnalysis.respect || 0)}</span>
                </div>
                
                <h3 style="margin-top: 20px;">Recommendations</h3>
                <ul style="margin-left: 20px;">
                    <li>${warAnalysis.readiness > HUB_CONFIG.READINESS_THRESHOLD ? 'Good readiness level' : 'Consider improving member activity'}</li>
                    <li>${warAnalysis.bestChain > 100 ? 'Strong chaining capability' : 'Work on improving chain attacks'}</li>
                    <li>Monitor member activity regularly</li>
                    <li>Coordinate war timing with active members</li>
                </ul>
            </div>
        `;
        
        this.showModal();
    }

    async showMemberDetails() {
        if (!this.currentFactionId) {
            return;
        }

        this.showLoading();
        
        try {
            const memberStats = await apiService.getMemberStats(this.currentFactionId, this.apiKey);
            const members = Object.values(memberStats.members || {});
            
            const modalBody = document.getElementById('modalBody');
            modalBody.innerHTML = `
                <h2>📊 Member Details</h2>
                <div style="margin-top: 20px; max-height: 500px; overflow-y: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: var(--secondary-color); color: white;">
                                <th style="padding: 10px; text-align: left;">Name</th>
                                <th style="padding: 10px; text-align: left;">Level</th>
                                <th style="padding: 10px; text-align: left;">Status</th>
                                <th style="padding: 10px; text-align: left;">Position</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${members.map((member, index) => `
                                <tr style="border-bottom: 1px solid var(--border-color); ${index % 2 === 0 ? 'background: var(--light-bg);' : ''}">
                                    <td style="padding: 10px;">${member.name || 'Unknown'}</td>
                                    <td style="padding: 10px;">${member.level || 'N/A'}</td>
                                    <td style="padding: 10px;">${member.last_action?.status || 'Unknown'}</td>
                                    <td style="padding: 10px;">${member.position || 'Member'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            
            this.showModal();
        } catch (error) {
            this.showStatus(`Error loading member details: ${error.message}`, 'error');
        } finally {
            this.hideLoading();
        }
    }

    showModal() {
        document.getElementById('modal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('modal').style.display = 'none';
    }

    formatNumber(num) {
        return new Intl.NumberFormat().format(num);
    }
}

// Initialize Command Hub
const commandHub = new CommandHub();
