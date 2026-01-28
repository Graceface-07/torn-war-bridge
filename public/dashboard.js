/**
 * Legacy Dashboard Module - Refactored
 * Maintains backward compatibility while using the new API service
 */

// Store playerData and factionData in localStorage when loaded
window.onload = function() {
    // Load data from localStorage if available
    const playerData = JSON.parse(localStorage.getItem('playerData') || 'null');
    const factionData = JSON.parse(localStorage.getItem('factionData') || 'null');
    
    if (playerData) {
        console.log('Player data loaded:', playerData.name);
    }
    if (factionData) {
        console.log('Faction data loaded:', factionData.name);
    }
    
    addWarAnalysisLink();
    addCommandHubLink();
};

// Function to add a link to navigate to war-analysis.html
function addWarAnalysisLink() {
    const link = document.createElement('a');
    link.href = 'war-analysis.html';
    link.innerText = 'Go to War Analysis';
    link.style.marginRight = '10px';
    document.body.appendChild(link);
}

// Function to add a link to navigate to the Command Hub
function addCommandHubLink() {
    const link = document.createElement('a');
    link.href = 'index.html';
    link.innerText = 'Go to Command Hub';
    document.body.appendChild(link);
}