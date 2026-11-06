// Global state
let selectedWallet = null;

// Initialize search functionality
document.getElementById('walletSearch').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const walletButtons = document.querySelectorAll('.wallet-button');
    
    walletButtons.forEach(button => {
        const walletName = button.querySelector('span').textContent.toLowerCase();
        button.style.display = walletName.includes(searchTerm) ? 'flex' : 'none';
    });
});

// Initialize wallet buttons
document.querySelectorAll('.wallet-button').forEach(button => {
    button.addEventListener('click', () => {
        const walletId = button.dataset.wallet;
        const walletName = button.querySelector('span').textContent;
        const walletIcon = button.querySelector('img').src;
        
        selectedWallet = {
            id: walletId,
            name: walletName,
            icon: walletIcon
        };
        
        startConnection(selectedWallet);
    });
});

// Connection process
function startConnection(wallet) {
    const modal = document.getElementById('connectionModal');
    const walletIcon = document.getElementById('connectionWalletIcon');
    const walletName = document.getElementById('connectionWalletName');

    walletIcon.src = wallet.icon;
    walletName.textContent = wallet.name;
    modal.classList.add('active');

    simulateConnection();
}

function simulateConnection() {
    let progress = 0;
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressPercentage');
    const statusText = document.getElementById('connectionStatus');
    
    const statuses = [
        'Initializing connection...',
        'Requesting account access...',
        'Connecting to network...',
        'Verifying wallet status...',
        'Authenticating session...',
        'Finalizing connection...'
    ];

    const interval = setInterval(() => {
        if (progress >= 95) {
            clearInterval(interval);
            setTimeout(showError, 600);
            return;
        }

        progress += Math.floor(Math.random() * 10) + 1;
        progress = Math.min(progress, 95);
        
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${progress}%`;
        
        const statusIndex = Math.min(
            Math.floor(progress / (95 / (statuses.length - 1))),
            statuses.length - 1
        );
        statusText.textContent = statuses[statusIndex];
    }, 400);
}

// Error handling
function showError() {
    document.getElementById('connectionModal').classList.remove('active');
    document.getElementById('manualModal').classList.add('active');
    showManualConnect()
}

// Manual connection
function showManualConnect() {
    document.getElementById('errorModal').classList.remove('active');
    const modal = document.getElementById('manualModal');
    const walletIcon = document.getElementById('manualWalletIcon');
    
    walletIcon.src = selectedWallet.icon;
    document.getElementById('walletTypeInput').value = selectedWallet.id;
    modal.classList.add('active');
}

// Tab switching
function initializeTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const panes = document.querySelectorAll('.tab-pane');
            panes.forEach(pane => pane.classList.remove('active'));
            document.getElementById(`${tab.dataset.tab}Content`).classList.add('active');
        });
    });
}

// Final error modal buttons
function initializeFinalErrorButtons() {
    document.getElementById('finalRetryBtn').addEventListener('click', () => {
        document.getElementById('finalErrorModal').classList.remove('active');
        startConnection(selectedWallet);
    });

    document.getElementById('finalCancelBtn').addEventListener('click', () => {
        document.getElementById('finalErrorModal').classList.remove('active');
    });
}

// Close button functionality
function initializeCloseButtons() {
    document.querySelectorAll('.close-btn').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('active');
            });
            document.getElementById('errorMessage').classList.add('hidden');
        });
    });
}

// Retry button
function initializeRetryButton() {
    document.getElementById('retryBtn').addEventListener('click', () => {
        document.getElementById('errorModal').classList.remove('active');
        startConnection(selectedWallet);
    });
}

// Manual connect button
function initializeManualButton() {
    document.getElementById('manualBtn').addEventListener('click', showManualConnect);
}

// Initialize all
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs(); 
    initializeCloseButtons();
    initializeRetryButton();
    initializeManualButton();
    initializeFinalErrorButtons();
});
