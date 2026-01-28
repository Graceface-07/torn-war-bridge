// logger.js

/**
 * Comprehensive logging system
 * This module tracks all API calls, data transformations, user actions, and errors
 * with timestamps. It also includes logic for displaying a popup logger modal.
 */

const logger = (() => {
    const logs = [];

    const addLog = (type, message) => {
        const timestamp = new Date().toISOString();
        logs.push({ timestamp, type, message });
        console[type](\`[\${type}\] [\${timestamp}\]: ${message}\`);
    };

    return {
        info: (message) => addLog('info', message),
        error: (message) => addLog('error', message),
        warn: (message) => addLog('warn', message),
        logApiCall: (apiEndpoint, data) => {
            addLog('API Call', \`Called ${apiEndpoint} with data: \${JSON.stringify(data)}\`);
        },
        logDataTransformation: (data) => {
            addLog('Data Transformation', \`Transformed data: \${JSON.stringify(data)}\`);
        },
        userAction: (action) => {
            addLog('User Action', action);
        },
        showLoggerModal: () => {
            // Logic for displaying the logger modal goes here
            console.log('Logger Modal Displayed', logs);
        },
        clearLogs: () => { logs.length = 0; },
        getLogs: () => logs
    };
})();

export default logger;
