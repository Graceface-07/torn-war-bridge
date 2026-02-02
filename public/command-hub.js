const TORN_API_KEY = 'CZP2D2ZnbXWsYiDT';
const SC_KEY = 'rwLgZTyqgWDxhoCx';

class CommandHub {
    constructor() {
        this.uid = localStorage.getItem('tornUserId') || '';
        this.fid = localStorage.getItem('tornFactionId') || '';
        this.session = { name: '', myStats: 0, members: [], faction: null };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadIdsStatus();
    }

    setupEventListeners() {
        document.getElementById('saveIds').addEventListener('click', () => this.saveIds());
        document.getElementById('checkPermissions').addEventListener('click', () => this.checkPermissions());
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', e => this.handleAction(e.currentTarget.dataset.action));
        });
        document.getElementById('generateReportBtn').addEventListener('click', () => this.generateReports());
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        window.addEventListener('click', e => {
            if (e.target.id === 'modal') this.closeModal();
        });
    }

    saveIds() {
        const userIdInput = document.getElementById('userId');
        const factionIdInput = document.getElementById('factionId');
        const uid = userIdInput.value.trim();
        const fid = factionIdInput.value.trim();
        if (!uid || !fid) {
            this.showStatus('IDs required', 'error');
            return;
        }
        this.uid = uid;
        this.fid = fid;
        localStorage.setItem('tornUserId', uid);
        localStorage.setItem('tornFactionId', fid);
        this.showStatus('User & Faction IDs saved!', 'success');
        userIdInput.value = '';
        factionIdInput.value = '';
    }

    loadIdsStatus() {
        if (this.uid && this.fid) { this.showStatus('IDs loaded', 'success'); }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatPermissions(selections) {
        return Array.isArray(selections) 
            ? selections.map(s => this.escapeHtml(s)).join(', ')
            : 'None';
    }

    generatePermissionsHtml(keyName, colorVar, perms) {
        return `
            <div class="perm-header">
                <span class="data-label" style="font-weight: bold; color: var(${colorVar});">${this.escapeHtml(keyName)}</span>
            </div>
            <div class="data-row">
                <span class="data-label">Access Level:</span>
                <span class="data-value">${this.escapeHtml(perms.access_level)}</span>
            </div>
            <div class="data-row">
                <span class="data-label">Access Type:</span>
                <span class="data-value">${this.escapeHtml(perms.access_type)}</span>
            </div>
            <div class="data-row">
                <span class="data-label">Permissions:</span>
                <span class="data-value perm-list">${this.formatPermissions(perms.selections)}</span>
            </div>`;
    }

    async checkPermissions() {
        this.showLoading();
        try {
            let permissionsHtml = '';
            
            // Check Torn API key permissions
            try {
                const tornKeyPerms = await apiService.getKeyPermissions(TORN_API_KEY);
                permissionsHtml += '<div style="margin-bottom: 20px;">' + 
                    this.generatePermissionsHtml('Torn API Key', '--primary-color', tornKeyPerms) + 
                    '</div>';
            } catch (error) {
                permissionsHtml += `
                    <div style="margin-bottom: 20px;">
                        <div class="perm-header">
                            <span class="data-label" style="font-weight: bold; color: var(--primary-color);">Torn API Key</span>
                        </div>
                        <p style="color: var(--danger-color);">Error: ${this.escapeHtml(error.message)}</p>
                    </div>`;
            }
            
            // Check Scouter API key permissions
            try {
                const scKeyPerms = await apiService.getKeyPermissions(SC_KEY);
                permissionsHtml += '<div>' + 
                    this.generatePermissionsHtml('Scouter API Key', '--accent-color', scKeyPerms) + 
                    '</div>';
            } catch (error) {
                permissionsHtml += `
                    <div>
                        <div class="perm-header">
                            <span class="data-label" style="font-weight: bold; color: var(--accent-color);">Scouter API Key</span>
                        </div>
                        <p style="color: var(--danger-color);">Error: ${this.escapeHtml(error.message)}</p>
                    </div>`;
            }

            document.getElementById('permissionsContent').innerHTML = permissionsHtml;
            this.showStatus('API permissions loaded', 'success');
        } catch (error) {
            document.getElementById('permissionsContent').innerHTML =
                `<p style="color: var(--danger-color);">Error loading permissions: ${this.escapeHtml(error.message)}</p>`;
            this.showStatus(`Error: ${error.message}`, 'error');
            console.error('Permissions check error:', error);
        } finally {
            this.hideLoading();
        }
    }

    showStatus(msg, type) {
        const statusElement = document.getElementById('apiStatus');
        statusElement.textContent = msg;
        statusElement.className = `status ${type}`;
        setTimeout(() => {
            statusElement.className = 'status';
            statusElement.textContent = '';
        }, 3000);
    }

    showLoading() {
        document.getElementById('loadingOverlay')?.classList.add('active');
    }
    hideLoading() {
        document.getElementById('loadingOverlay')?.classList.remove('active');
    }

    async handleAction(action, forceRefresh = false) {
        if (!this.uid || !this.fid) {
            this.showStatus('Set User ID and Faction ID', 'error');
            return;
        }
        this.showLoading();
        try {
            switch (action) {
                case 'player':
                    await this.loadPlayerStats(forceRefresh);
                    break;
                case 'faction':
                    await this.loadFactionStats(forceRefresh);
                    break;
                case 'members':
                    await this.loadMembers(forceRefresh);
                    break;
            }
        } catch (err) {
            this.showStatus(`Error: ${err.message}`, 'error');
            console.error('Action error:', err);
        } finally {
            this.hideLoading();
        }
    }

    async loadPlayerStats(forceRefresh = false) {
        if (forceRefresh) apiService.clearCache();
        try {
            const res = await apiService.getUserDisplay(this.uid, SC_KEY);
            this.session.name = res.name;
            this.session.myStats = res.total;
            document.getElementById('h-user').textContent = res.name;
            document.getElementById('h-power').textContent = this.formatStats(res.total);

            document.getElementById('playerContent').innerHTML = `
                <div class="data-row"><span class="data-label">Operator:</span><span class="data-value">${res.name}</span></div>
                <div class="data-row"><span class="data-label">Power Stats:</span><span class="data-value">${this.formatStats(res.total)}</span></div>
            `;
            localStorage.setItem('playerData', JSON.stringify(res));
        } catch (error) {
            document.getElementById('playerContent').innerHTML =
                `<p class="placeholder" style="color: var(--danger-color);">Error loading player: ${error.message}</p>`;
            throw error;
        }
    }

    async loadFactionStats(forceRefresh = false) {
        if (forceRefresh) apiService.clearCache();
        try {
            const f = await apiService.getFactionData(this.fid, TORN_API_KEY);
            this.session.faction = f;
            const basic = f.basic ? f.basic : {};
            document.getElementById('factionContent').innerHTML = `
                <div class="data-row"><span class="data-label">Faction Name:</span><span class="data-value">${basic.name || 'N/A'}</span></div>
                <div class="data-row"><span class="data-label">Members:</span><span class="data-value">${Object.keys(f.members || {}).length}</span></div>
                <div class="data-row"><span class="data-label">Respect:</span><span class="data-value">${this.formatStats(basic.respect || 0)}</span></div>
                <div class="data-row"><span class="data-label">Age:</span><span class="data-value">${basic.age || 0}</span></div>
            `;
            localStorage.setItem('factionData', JSON.stringify(f));
        } catch (error) {
            document.getElementById('factionContent').innerHTML =
                `<p class="placeholder" style="color: var(--danger-color);">Error loading faction: ${error.message}</p>`;
            throw error;
        }
    }

    async loadMembers(forceRefresh = false) {
        if (forceRefresh) apiService.clearCache();
        try {
            const f = await apiService.getFactionData(this.fid, TORN_API_KEY);
            this.session.members = [];
            const cont = document.getElementById('membersContent');
            cont.innerHTML = '';
            Object.keys(f.members || {}).forEach(id => {
                const m = f.members[id];
                this.session.members.push(m);
                cont.innerHTML += `
                    <div class="data-row" style="margin-bottom:8px;">
                        <span class="data-label">Name:</span>
                        <span class="data-value">${m.name || "N/A"}</span>
                        <span class="data-label">Level:</span>
                        <span class="data-value">${m.level || "?"}</span>
                        <span class="data-label">Days in Faction:</span>
                        <span class="data-value">${m.days_in_faction || "?"}</span>
                        <span class="data-label">Position:</span>
                        <span class="data-value">${m.position || "?"}</span>
                        <span class="data-label">Status:</span>
                        <span class="data-value">${(m.last_action && m.last_action.status) || "?"}</span>
                    </div>
                `;
            });
            localStorage.setItem('membersData', JSON.stringify(this.session.members));
        } catch (error) {
            document.getElementById('membersContent').innerHTML =
                `<p class="placeholder" style="color: var(--danger-color);">Error loading members: ${error.message}</p>`;
            throw error;
        }
    }

    generateReports() {
        // Operator Report
        const player = this.session.name || "---";
        const power = this.session.myStats ? this.formatStats(this.session.myStats) : "---";
        document.getElementById('operatorReport').innerHTML = `
            <div class="data-row"><span class="data-label">Operator:</span><span class="data-value">${player}</span></div>
            <div class="data-row"><span class="data-label">Power:</span><span class="data-value">${power}</span></div>
        `;

        // Faction Comparison
        let compHTML = '';
        const f = this.session.faction;
        const basic = (f && f.basic) ? f.basic : {};
        if (f) {
            compHTML = `
                <div class="data-row"><span class="data-label">Name:</span><span class="data-value">${basic.name || 'N/A'}</span></div>
                <div class="data-row"><span class="data-label">Respect:</span><span class="data-value">${this.formatStats(basic.respect || 0)}</span></div>
                <div class="data-row"><span class="data-label">Age:</span><span class="data-value">${basic.age || 0}</span></div>
                <div class="data-row"><span class="data-label">Members:</span><span class="data-value">${Object.keys(f.members || {}).length}</span></div>
            `;
        } else {
            compHTML = `<span style="color:var(--danger-color);">No faction data loaded.</span>`;
        }
        document.getElementById('factionComparison').innerHTML = compHTML;
    }

    closeModal() { document.getElementById('modal')?.style.display == 'none'; }
    formatStats(num) {
        if (!num || num === 0) return "---";
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
        return Number(num).toLocaleString();
    }
}

window.commandHub = new CommandHub();