// Store playerData and factionData in localStorage when loaded
window.onload = function() {
    if (playerData) {
        localStorage.setItem('playerData', JSON.stringify(playerData));
    }
    if (factionData) {
        localStorage.setItem('factionData', JSON.stringify(factionData));
    }
    addWarAnalysisLink();
};

// Function to add a link to navigate to war-analysis.html
function addWarAnalysisLink() {
    const link = document.createElement('a');
    link.href = 'war-analysis.html';
    link.innerText = 'Go to War Analysis';
    document.body.appendChild(link);
}