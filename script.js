// Player balances
let balances = {
    blue: 250000,
    green: 250000,
    pink: 250000,
    yellow: 250000
};

// Player loan balances
let loanBalances = {
    blue: 0,
    green: 0,
    pink: 0,
    yellow: 0
};

// Retirement tracking
let retiredPlayers = [];
let retirementOrder = [];

// Current turn
let currentTurn = 'blue';

// Player salary settings
let playerSalaries = {
    blue: { basePay: 20000, bonus: 0, jobTitle: 'Teacher' },
    green: { basePay: 20000, bonus: 0, jobTitle: 'Teacher' },
    pink: { basePay: 20000, bonus: 0, jobTitle: 'Teacher' },
    yellow: { basePay: 20000, bonus: 0, jobTitle: 'Teacher' }
};

// Transaction history
let transactions = [];

// Update balance display
function updateBalance(player) {
    document.getElementById(`balance-${player}`).textContent = balances[player].toLocaleString();
}

// Update loan balance display
function updateLoanBalance(player) {
    document.getElementById(`loan-balance-${player}`).textContent = loanBalances[player].toLocaleString();
}

// Add loan
function addLoan(amount) {
    const player = currentTurn;
    const amountValue = parseInt(amount.replace('k', '000'));
    
    // Add to both regular balance (money received) and loan balance (debt)
    balances[player] += amountValue;
    loanBalances[player] += amountValue;
    updateBalance(player);
    updateLoanBalance(player);
    
    // Add transaction record
    const transaction = {
        id: Date.now(),
        player: player,
        amount: amountValue,
        description: `Loan Received: $${amountValue.toLocaleString()}`,
        type: 'loan',
        timestamp: new Date()
    };
    
    transactions.unshift(transaction);
    updateTransactionList();
}

// Pay loan
function payLoan() {
    const player = currentTurn;
    const amount = parseInt(document.getElementById('pay-loan-amount').value);
    
    if (!amount || amount <= 0) {
        alert('Please enter a valid amount to pay');
        return;
    }
    
    if (amount > loanBalances[player]) {
        alert('Cannot pay more than the loan balance!');
        return;
    }
    
    if (amount > balances[player]) {
        alert('Insufficient funds to pay this amount!');
        return;
    }
    
    // Deduct from regular balance and loan balance
    balances[player] -= amount;
    loanBalances[player] -= amount;
    
    updateBalance(player);
    updateLoanBalance(player);
    
    // Add transaction record
    const transaction = {
        id: Date.now(),
        player: player,
        amount: -amount,
        description: `Loan Payment: $${amount.toLocaleString()}`,
        type: 'loan-payment',
        timestamp: new Date()
    };
    
    transactions.unshift(transaction);
    updateTransactionList();
    
    // Clear form
    document.getElementById('pay-loan-amount').value = '';
    
    // Show success message
    const playerNames = {
        blue: 'Blue Vehicle',
        green: 'Green Vehicle',
        pink: 'Pink Vehicle',
        yellow: 'Yellow Vehicle'
    };
    
    alert(`💳 Loan payment processed for ${playerNames[player]}!\nAmount paid: $${amount.toLocaleString()}\nRemaining loan: $${loanBalances[player].toLocaleString()}`);
}

// Retire player
function retirePlayer() {
    const player = currentTurn;
    
    // Check if player is already retired
    if (retiredPlayers.includes(player)) {
        alert('This player has already retired!');
        return;
    }
    
    const playerNames = {
        blue: 'Blue Vehicle',
        green: 'Green Vehicle',
        pink: 'Pink Vehicle',
        yellow: 'Yellow Vehicle'
    };
    
    // Calculate retirement bonus based on order
    const retirementBonus = [200000, 100000, 50000, 10000];
    const bonusIndex = retirementOrder.length;
    const bonus = retirementBonus[bonusIndex];
    
    // Calculate loan penalty
    const loanAmount = loanBalances[player];
    const loanPenalty = Math.floor(loanAmount / 50000) * 60000;
    
    // Calculate net retirement amount
    const netAmount = bonus - loanPenalty;
    
    // Add retirement bonus to balance
    balances[player] += bonus;
    
    // Clear loan balance (loans are forgiven upon retirement)
    loanBalances[player] = 0;
    
    // Update displays
    updateBalance(player);
    updateLoanBalance(player);
    
    // Add to retired players list
    retiredPlayers.push(player);
    retirementOrder.push(player);
    
    // Create transaction records
    const bonusTransaction = {
        id: Date.now() + 1,
        player: player,
        amount: bonus,
        description: `Retirement Bonus (${bonusIndex + 1}${getOrdinalSuffix(bonusIndex + 1)} place): $${bonus.toLocaleString()}`,
        type: 'retirement',
        timestamp: new Date()
    };
    
    transactions.unshift(bonusTransaction);
    
    if (loanPenalty > 0) {
        const penaltyTransaction = {
            id: Date.now() + 2,
            player: player,
            amount: -loanPenalty,
            description: `Loan Penalty: $${loanPenalty.toLocaleString()} (for $${loanAmount.toLocaleString()} in loans)`,
            type: 'retirement',
            timestamp: new Date()
        };
        transactions.unshift(penaltyTransaction);
    }
    
    updateTransactionList();
    
    // Show retirement summary
    let summary = `🏖️ ${playerNames[player]} has retired!\n\n`;
    summary += `Position: ${bonusIndex + 1}${getOrdinalSuffix(bonusIndex + 1)}\n`;
    summary += `Retirement Bonus: $${bonus.toLocaleString()}\n`;
    summary += `Loans Forgiven: $${loanAmount.toLocaleString()}\n`;
    
    if (loanPenalty > 0) {
        summary += `Loan Penalty: -$${loanPenalty.toLocaleString()}\n`;
    }
    
    summary += `Net Retirement: $${netAmount.toLocaleString()}\n\n`;
    summary += `Final Balance: $${balances[player].toLocaleString()}`;
    
    alert(summary);
    
    // Update retirement display
    updateRetirementDisplay();
    
    // Check if all players have retired
    if (retiredPlayers.length === 4) {
        showFinalRankings();
    }
}

// Helper function for ordinal suffixes
function getOrdinalSuffix(num) {
    if (num === 1) return 'st';
    if (num === 2) return 'nd';
    if (num === 3) return 'rd';
    return 'th';
}

// Update retirement display
function updateRetirementDisplay() {
    const playerNames = {
        blue: 'Blue Vehicle',
        green: 'Green Vehicle',
        pink: 'Pink Vehicle',
        yellow: 'Yellow Vehicle'
    };
    
    const retirementBonus = [200000, 100000, 50000, 10000];
    
    const retirementList = document.getElementById('retirement-list');
    
    if (retirementOrder.length === 0) {
        retirementList.innerHTML = 'No players have retired yet.';
    } else {
        let html = '';
        retirementOrder.forEach((player, index) => {
            const bonus = retirementBonus[index];
            html += `<div style="margin-bottom: 5px;"><strong>${index + 1}.</strong> ${playerNames[player]} - $${bonus.toLocaleString()}</div>`;
        });
        retirementList.innerHTML = html;
    }
}

// Show final rankings when all players have retired
function showFinalRankings() {
    const playerNames = {
        blue: 'Blue Vehicle',
        green: 'Green Vehicle',
        pink: 'Pink Vehicle',
        yellow: 'Yellow Vehicle'
    };
    
    const retirementBonus = [200000, 100000, 50000, 10000];
    
    // Calculate final standings based on total money
    const finalStandings = [];
    
    ['blue', 'green', 'pink', 'yellow'].forEach(player => {
        finalStandings.push({
            player: player,
            name: playerNames[player],
            totalMoney: balances[player],
            retirementPosition: retirementOrder.indexOf(player) + 1,
            retirementBonus: retirementOrder.indexOf(player) >= 0 ? retirementBonus[retirementOrder.indexOf(player)] : 0
        });
    });
    
    // Sort by total money (highest first)
    finalStandings.sort((a, b) => b.totalMoney - a.totalMoney);
    
    // Create rankings display
    let rankingsHTML = '<div style="text-align: center; padding: 20px;">';
    rankingsHTML += '<h2 style="color: #2c3e50; margin-bottom: 20px;">🏆 FINAL RANKINGS 🏆</h2>';
    
    finalStandings.forEach((player, index) => {
        const position = index + 1;
        const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : '🏅';
        
        rankingsHTML += '<div style="background: white; border-radius: 10px; padding: 15px; margin-bottom: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">';
        rankingsHTML += `<div style="font-size: 1.5rem; font-weight: bold; color: #2c3e50;">${medal} ${position}${getOrdinalSuffix(position)} Place</div>`;
        rankingsHTML += `<div style="font-size: 1.2rem; color: #34495e; margin: 5px 0;">${player.name}</div>`;
        rankingsHTML += `<div style="font-size: 1.1rem; color: #27ae60; font-weight: bold;">Final Balance: $${player.totalMoney.toLocaleString()}</div>`;
        
        if (player.retirementPosition > 0) {
            rankingsHTML += `<div style="font-size: 0.9rem; color: #7f8c8d;">Retired ${player.retirementPosition}${getOrdinalSuffix(player.retirementPosition)} (Bonus: $${player.retirementBonus.toLocaleString()})</div>`;
        }
        
        rankingsHTML += '</div>';
    });
    
    rankingsHTML += '</div>';
    
    // Create modal overlay
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        border-radius: 20px;
        padding: 30px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    `;
    
    modalContent.innerHTML = rankingsHTML;
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.cssText = `
        background: #e74c3c;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
        margin-top: 20px;
        width: 100%;
    `;
    closeButton.onclick = () => {
        document.body.removeChild(modal);
    };
    
    modalContent.appendChild(closeButton);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Auto-close after 10 seconds
    setTimeout(() => {
        if (document.body.contains(modal)) {
            document.body.removeChild(modal);
        }
    }, 10000);
}

// Add custom transaction
function addCustomTransaction() {
    const player = currentTurn;
    const amount = parseInt(document.getElementById('custom-amount').value);
    const description = document.getElementById('custom-description').value || 'Custom transaction';
    
    console.log('addCustomTransaction called:', { player, amount, description, currentTurn });
    
    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    balances[player] += amount;
    updateBalance(player);
    
    const transaction = {
        id: Date.now(),
        player: player,
        amount: amount,
        description: description,
        type: 'add',
        timestamp: new Date()
    };
    
    transactions.unshift(transaction);
    updateTransactionList();
    
    // Clear form
    document.getElementById('custom-amount').value = '';
    document.getElementById('custom-description').value = '';
}

// Remove custom transaction
function removeCustomTransaction() {
    const player = currentTurn;
    const amount = parseInt(document.getElementById('custom-amount').value);
    const description = document.getElementById('custom-description').value || 'Custom removal';
    
    console.log('removeCustomTransaction called:', { player, amount, description, currentTurn });
    
    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    if (balances[player] < amount) {
        alert('Insufficient funds!');
        return;
    }
    
    balances[player] -= amount;
    updateBalance(player);
    
    const transaction = {
        id: Date.now(),
        player: player,
        amount: -amount,
        description: description,
        type: 'remove',
        timestamp: new Date()
    };
    
    transactions.unshift(transaction);
    updateTransactionList();
    
    // Clear form
    document.getElementById('custom-amount').value = '';
    document.getElementById('custom-description').value = '';
}

// Process payday
function processPayday() {
    const player = document.getElementById('payday-player').value;
    
    // Auto-load saved salary settings for this player
    const savedSalary = playerSalaries[player];
    if (savedSalary) {
        document.getElementById('base-pay').value = savedSalary.basePay;
        document.getElementById('bonus-amount').value = savedSalary.bonus;
        document.getElementById('payday-description').value = savedSalary.jobTitle;
    }
    
    const basePay = parseInt(document.getElementById('base-pay').value) || 0;
    const bonus = parseInt(document.getElementById('bonus-amount').value) || 0;
    const jobDescription = document.getElementById('payday-description').value || 'Payday';
    
    if (basePay <= 0 && bonus <= 0) {
        alert('Please enter a valid base pay or bonus amount');
        return;
    }
    
    const totalPay = basePay + bonus;
    balances[player] += totalPay;
    updateBalance(player);
    
    // Create transaction record
    let description = `${jobDescription}: $${basePay.toLocaleString()}`;
    if (bonus > 0) {
        description += ` + $${bonus.toLocaleString()} bonus`;
    }
    
    const transaction = {
        id: Date.now(),
        player: player,
        amount: totalPay,
        description: description,
        type: 'payday',
        timestamp: new Date()
    };
    
    transactions.unshift(transaction);
    updateTransactionList();
    
    // Show success message
    const playerNames = {
        blue: 'Blue Vehicle',
        green: 'Green Vehicle',
        pink: 'Pink Vehicle',
        yellow: 'Yellow Vehicle'
    };
    
    alert(`💰 Payday processed for ${playerNames[player]}!\nBase Pay: $${basePay.toLocaleString()}\nBonus: $${bonus.toLocaleString()}\nTotal: $${totalPay.toLocaleString()}`);
    
    // Reset bonus to 0, keep base pay for convenience
    document.getElementById('bonus-amount').value = '0';
}

// Process money transfer
function processTransfer() {
    const fromPlayer = document.getElementById('transfer-from').value;
    const toPlayer = document.getElementById('transfer-to').value;
    const amount = parseInt(document.getElementById('transfer-amount').value);
    const description = document.getElementById('transfer-description').value || 'Money transfer';
    
    if (!amount || amount <= 0) {
        alert('Please enter a valid transfer amount');
        return;
    }
    
    const playerNames = {
        blue: 'Blue Vehicle',
        green: 'Green Vehicle',
        pink: 'Pink Vehicle',
        yellow: 'Yellow Vehicle'
    };
    
    if (fromPlayer === 'all-others') {
        // Transfer from all other players to one player
        const allPlayers = ['blue', 'green', 'pink', 'yellow'];
        const otherPlayers = allPlayers.filter(player => player !== toPlayer);
        const totalReceived = amount * otherPlayers.length;
        
        // Check if all other players have sufficient funds
        const insufficientPlayers = otherPlayers.filter(player => balances[player] < amount);
        if (insufficientPlayers.length > 0) {
            const insufficientNames = insufficientPlayers.map(player => playerNames[player]).join(', ');
            alert(`Insufficient funds! The following players don't have enough money: ${insufficientNames}`);
            return;
        }
        
        // Process transfers from all other players
        otherPlayers.forEach(player => {
            balances[player] -= amount;
            updateBalance(player);
            
            // Create transaction record for sender
            const senderTransaction = {
                id: Date.now() + Math.random(),
                player: player,
                amount: -amount,
                description: `Transfer to ${playerNames[toPlayer]}: ${description}`,
                type: 'transfer',
                timestamp: new Date()
            };
            transactions.unshift(senderTransaction);
        });
        
        // Add money to the receiving player
        balances[toPlayer] += totalReceived;
        updateBalance(toPlayer);
        
        // Create transaction record for receiver
        const receiverTransaction = {
            id: Date.now() + Math.random(),
            player: toPlayer,
            amount: totalReceived,
            description: `Transfer from all others (${otherPlayers.length} players): ${description}`,
            type: 'transfer',
            timestamp: new Date()
        };
        transactions.unshift(receiverTransaction);
        
        updateTransactionList();
        
        // Show success message
        const otherPlayerNames = otherPlayers.map(player => playerNames[player]).join(', ');
        alert(`💸 Transfer from all others completed!\n${otherPlayerNames} → ${playerNames[toPlayer]}\nAmount per player: $${amount.toLocaleString()}\nTotal received: $${totalReceived.toLocaleString()}\nDescription: ${description}`);
        
    } else if (toPlayer === 'all-others') {
        // Transfer to all other players
        const allPlayers = ['blue', 'green', 'pink', 'yellow'];
        const otherPlayers = allPlayers.filter(player => player !== fromPlayer);
        const totalCost = amount * otherPlayers.length;
        
        if (balances[fromPlayer] < totalCost) {
            alert(`Insufficient funds! You need $${totalCost.toLocaleString()} to transfer $${amount.toLocaleString()} to each of the ${otherPlayers.length} other players.`);
            return;
        }
        
        // Process transfers to all other players
        balances[fromPlayer] -= totalCost;
        
        otherPlayers.forEach(player => {
            balances[player] += amount;
            updateBalance(player);
            
            // Create transaction record for receiver
            const receiverTransaction = {
                id: Date.now() + Math.random(),
                player: player,
                amount: amount,
                description: `Transfer from ${playerNames[fromPlayer]}: ${description}`,
                type: 'transfer',
                timestamp: new Date()
            };
            transactions.unshift(receiverTransaction);
        });
        
        updateBalance(fromPlayer);
        
        // Create transaction record for sender
        const senderTransaction = {
            id: Date.now() + Math.random(),
            player: fromPlayer,
            amount: -totalCost,
            description: `Transfer to all others (${otherPlayers.length} players): ${description}`,
            type: 'transfer',
            timestamp: new Date()
        };
        transactions.unshift(senderTransaction);
        
        updateTransactionList();
        
        // Show success message
        const otherPlayerNames = otherPlayers.map(player => playerNames[player]).join(', ');
        alert(`💸 Transfer to all others completed!\n${playerNames[fromPlayer]} → ${otherPlayerNames}\nAmount per player: $${amount.toLocaleString()}\nTotal cost: $${totalCost.toLocaleString()}\nDescription: ${description}`);
        
    } else {
        // Single player transfer
        if (fromPlayer === toPlayer) {
            alert('Cannot transfer money to the same player!');
            return;
        }
        
        if (balances[fromPlayer] < amount) {
            alert('Insufficient funds for transfer!');
            return;
        }
        
        // Process the transfer
        balances[fromPlayer] -= amount;
        balances[toPlayer] += amount;
        
        updateBalance(fromPlayer);
        updateBalance(toPlayer);
        
        // Transaction for sender (negative)
        const senderTransaction = {
            id: Date.now() + 1,
            player: fromPlayer,
            amount: -amount,
            description: `Transfer to ${playerNames[toPlayer]}: ${description}`,
            type: 'transfer',
            timestamp: new Date()
        };
        
        // Transaction for receiver (positive)
        const receiverTransaction = {
            id: Date.now() + 2,
            player: toPlayer,
            amount: amount,
            description: `Transfer from ${playerNames[fromPlayer]}: ${description}`,
            type: 'transfer',
            timestamp: new Date()
        };
        
        transactions.unshift(receiverTransaction);
        transactions.unshift(senderTransaction);
        updateTransactionList();
        
        // Show success message
        alert(`💸 Transfer completed!\n${playerNames[fromPlayer]} → ${playerNames[toPlayer]}\nAmount: $${amount.toLocaleString()}\nDescription: ${description}`);
    }
    
    // Clear form
    document.getElementById('transfer-amount').value = '';
    document.getElementById('transfer-description').value = '';
}

// Update transaction list
function updateTransactionList() {
    const transactionList = document.getElementById('transaction-list');
    transactionList.innerHTML = '';
    
    transactions.forEach(transaction => {
        const transactionItem = document.createElement('div');
        transactionItem.className = 'transaction-item';
        
        const playerColors = {
            blue: '#3498db',
            green: '#2ecc71',
            pink: '#e91e63',
            yellow: '#f1c40f'
        };
        
        const playerNames = {
            blue: 'Blue Vehicle',
            green: 'Green Vehicle',
            pink: 'Pink Vehicle',
            yellow: 'Yellow Vehicle'
        };
        
        // Add icon based on transaction type
        let transactionIcon = '💰';
        if (transaction.type === 'loan') transactionIcon = '🏦';
        if (transaction.type === 'payday') transactionIcon = '💸';
        if (transaction.type === 'remove') transactionIcon = '💸';
        if (transaction.type === 'transfer') transactionIcon = '💸';
        
        transactionItem.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-amount ${transaction.amount >= 0 ? 'positive' : 'negative'}">
                    ${transactionIcon} ${transaction.amount >= 0 ? '+' : ''}$${transaction.amount.toLocaleString()}
                </div>
                <div class="transaction-details">
                    <strong style="color: ${playerColors[transaction.player]}">${playerNames[transaction.player]}</strong> - ${transaction.description}
                </div>
                <div class="transaction-details">
                    ${transaction.timestamp.toLocaleString()}
                </div>
            </div>
            <button class="delete-transaction" onclick="deleteTransaction(${transaction.id})">🗑️</button>
        `;
        
        transactionList.appendChild(transactionItem);
    });
}

// Delete transaction
function deleteTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
        // Reverse the transaction based on type
        if (transaction.type === 'loan') {
            // Reverse loan - reduce both regular balance and loan balance
            balances[transaction.player] -= transaction.amount;
            loanBalances[transaction.player] -= transaction.amount;
            updateBalance(transaction.player);
            updateLoanBalance(transaction.player);
        } else if (transaction.type === 'loan-payment') {
            // Reverse loan payment - add back to loan balance and regular balance
            loanBalances[transaction.player] += Math.abs(transaction.amount);
            balances[transaction.player] += Math.abs(transaction.amount);
            updateLoanBalance(transaction.player);
            updateBalance(transaction.player);
        } else if (transaction.type === 'retirement') {
            // Retirement transactions cannot be deleted (they're permanent)
            alert('Retirement transactions cannot be deleted!');
            return;
        } else {
            // Regular transaction - reverse regular balance
            balances[transaction.player] -= transaction.amount;
            updateBalance(transaction.player);
        }
        
        // Remove from transactions array
        transactions = transactions.filter(t => t.id !== id);
        updateTransactionList();
    }
}

// Set custom amount from quick buttons
function setCustomAmount(amount) {
    console.log('setCustomAmount called with:', amount);
    document.getElementById('custom-amount').value = amount;
}

// Save player salary settings
function autoSaveSalary() {
    const player = currentTurn;
    const basePay = parseInt(document.getElementById('saved-base-pay').value) || 0;
    const bonus = parseInt(document.getElementById('saved-bonus').value) || 0;
    const jobTitle = document.getElementById('saved-job-title').value || 'Unknown Job';
    
    playerSalaries[player] = {
        basePay: basePay,
        bonus: bonus,
        jobTitle: jobTitle
    };
}

// Load player salary settings
function loadPlayerSalary() {
    const player = currentTurn;
    const salary = playerSalaries[player];
    
    document.getElementById('saved-base-pay').value = salary.basePay;
    document.getElementById('saved-bonus').value = salary.bonus;
    document.getElementById('saved-job-title').value = salary.jobTitle;
}

// Get paid function
function getPaid() {
    const player = currentTurn;
    const basePay = parseInt(document.getElementById('saved-base-pay').value) || 0;
    const jobTitle = document.getElementById('saved-job-title').value || 'Payday';
    
    if (basePay <= 0) {
        alert('Please set a valid base pay amount first');
        return;
    }
    
    balances[player] += basePay;
    updateBalance(player);
    
    // Create transaction record
    const transaction = {
        id: Date.now(),
        player: player,
        amount: basePay,
        description: `${jobTitle}: $${basePay.toLocaleString()}`,
        type: 'payday',
        timestamp: new Date()
    };
    
    transactions.unshift(transaction);
    updateTransactionList();
    
    // Show success message
    const playerNames = {
        blue: 'Blue Vehicle',
        green: 'Green Vehicle',
        pink: 'Pink Vehicle',
        yellow: 'Yellow Vehicle'
    };
    
    alert(`💰 ${playerNames[player]} got paid!\nAmount: $${basePay.toLocaleString()}\nJob: ${jobTitle}`);
}

// Get bonus function
function getBonus() {
    const player = currentTurn;
    const bonus = parseInt(document.getElementById('saved-bonus').value) || 0;
    const jobTitle = document.getElementById('saved-job-title').value || 'Bonus';
    
    if (bonus <= 0) {
        alert('Please set a valid bonus amount first');
        return;
    }
    
    balances[player] += bonus;
    updateBalance(player);
    
    // Create transaction record
    const transaction = {
        id: Date.now(),
        player: player,
        amount: bonus,
        description: `${jobTitle} Bonus: $${bonus.toLocaleString()}`,
        type: 'bonus',
        timestamp: new Date()
    };
    
    transactions.unshift(transaction);
    updateTransactionList();
    
    // Show success message
    const playerNames = {
        blue: 'Blue Vehicle',
        green: 'Green Vehicle',
        pink: 'Pink Vehicle',
        yellow: 'Yellow Vehicle'
    };
    
    alert(`🎁 ${playerNames[player]} got a bonus!\nAmount: $${bonus.toLocaleString()}\nJob: ${jobTitle}`);
}

// Update current turn
function updateCurrentTurn() {
    const turnSelect = document.getElementById('current-turn');
    currentTurn = turnSelect.value;
    
    const playerColors = {
        blue: '#3498db',
        green: '#2ecc71',
        pink: '#e91e63',
        yellow: '#f1c40f'
    };
    
    const playerNames = {
        blue: 'Blue Vehicle',
        green: 'Green Vehicle',
        pink: 'Pink Vehicle',
        yellow: 'Yellow Vehicle'
    };
    
    const displayElement = document.getElementById('current-turn-display');
    displayElement.innerHTML = `Current Turn: <span style="color: ${playerColors[currentTurn]};">${playerNames[currentTurn]}</span>`;
    
    // Load salary settings for the current player
    loadPlayerSalary();
}

// Initialize the app
function init() {
    updateBalance('blue');
    updateBalance('green');
    updateBalance('pink');
    updateBalance('yellow');
    updateLoanBalance('blue');
    updateLoanBalance('green');
    updateLoanBalance('pink');
    updateLoanBalance('yellow');
    updateTransactionList();
    
    // Load initial salary settings for the first player
    loadPlayerSalary();
    
    // Initialize current turn display
    updateCurrentTurn();
    
    // Initialize retirement display
    updateRetirementDisplay();
}

// Switch tabs
function switchTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = '#ecf0f1';
        btn.style.color = '#2c3e50';
    });
    
    // Show selected tab content
    const selectedTab = document.getElementById(tabName + '-tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
        selectedTab.style.display = 'block';
    }
    
    // Activate selected tab button
    const selectedButton = event.target;
    selectedButton.classList.add('active');
    selectedButton.style.background = '#3498db';
    selectedButton.style.color = 'white';
}

// Start the app
init(); 