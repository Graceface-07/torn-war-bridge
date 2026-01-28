// Torn War Bridge - Dashboard JavaScript
const TORN_API_KEY = 'CZP2D2ZnbXWsYiDT';
const SC_KEY = 'rwLgZTyqgWDxhoCx';

// Fetch faction data
async function fetchFactionData() {
    try {
        const response = await fetch(`https://api.torn.com/faction/?selections=basic,members&key=${TORN_API_KEY}`);
        const data = await response.json();
        
        if (data.error) {
            document.getElementById('factionData').innerHTML = `<p>Error: ${data.error.error}</p>`;
            return;
        }

        const html = `
            <p><strong>Faction:</strong> ${data.name}</p>
            <p><strong>Leader:</strong> ${data.leader}</p>
            <p><strong>Members:</strong> ${data.members_count}</p>
            <p><strong>Respect:</strong> ${data.respect.toLocaleString()}</p>
        `;
        
        document.getElementById('factionData').innerHTML = html;
    } catch (error) {
        document.getElementById('factionData').innerHTML = `<p>Error loading faction data: ${error.message}</p>`;
    }
}

// Fetch member stats
async function fetchMemberStats() {
    try {
        const response = await fetch(`https://api.torn.com/user/?selections=basic,stats&key=${TORN_API_KEY}`);
        const data = await response.json();
        
        if (data.error) {
            document.getElementById('memberData').innerHTML = `<p>Error: ${data.error.error}</p>`;
            return;
        }

        const html = `
            <p><strong>Player:</strong> ${data.name}</p>
            <p><strong>Level:</strong> ${data.level}</p>
            <p><strong>Status:</strong> ${data.status.state}</p>
            <p><strong>Strength:</strong> ${data.stats.strength.toLocaleString()}</p>
            <p><strong>Speed:</strong> ${data.stats.speed.toLocaleString()}</p>
        `;
        
        document.getElementById('memberData').innerHTML = html;
    } catch (error) {
        document.getElementById('memberData').innerHTML = `<p>Error loading member data: ${error.message}</p>`;
    }
}

// Fetch weapon info
async function fetchWeaponInfo() {
    try {
        const response = await fetch(`https://api.torn.com/torn/?selections=items&key=${TORN_API_KEY}`);
        const data = await response.json();
        
        if (data.error) {
            document.getElementById('weaponData').innerHTML = `<p>Error: ${data.error.error}</p>`;
            return;
        }

        const weapons = Object.values(data.items)
            .filter(item => item.type === 'Weapon')
            .slice(0, 5);

        let html = '<ul>';
        weapons.forEach(weapon => {
            html += `<li>${weapon.name} - Damage: ${weapon.damage}</li>`;
        });
        html += '</ul>';
        
        document.getElementById('weaponData').innerHTML = html;
    } catch (error) {
        document.getElementById('weaponData').innerHTML = `<p>Error loading weapon data: ${error.message}</p>`;
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    fetchFactionData();
    fetchMemberStats();
    fetchWeaponInfo();

    // Auto-refresh every 30 seconds
    setInterval(() => {
        fetchFactionData();
        fetchMemberStats();
        fetchWeaponInfo();
    }, 30000);
});