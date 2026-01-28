// statusIndicator.js

// Function to create a status indicator with click functionality
class StatusIndicator {
    constructor() {
        this.apiStatuses = {
            tornAPI: 'unknown',
            ffScouter: 'unknown'
        };
        this.element = document.createElement('div');
        this.element.classList.add('status-indicator');
        this.render();
    }

    setStatus(api, status) {
        this.apiStatuses[api] = status;
        this.render();
    }

    render() {
        this.element.innerHTML = '';
        for (const [api, status] of Object.entries(this.apiStatuses)) {
            const dot = document.createElement('div');
            dot.classList.add('dot', status);
            dot.addEventListener('click', () => this.showDataLogger(api));
            this.element.appendChild(dot);
        }
    }

    showDataLogger(api) {
        // Logic to show modal with API call details and error messages
        alert(`Showing data logger for ${api}`); // Placeholder for modal logic
    }
}

// Usage
const statusIndicator = new StatusIndicator();

// Simulating status updates
setTimeout(() => statusIndicator.setStatus('tornAPI', 'green'), 1000);
setTimeout(() => statusIndicator.setStatus('ffScouter', 'amber'), 2000);
setTimeout(() => statusIndicator.setStatus('tornAPI', 'red'), 3000);

// Add to the document
document.body.appendChild(statusIndicator.element);