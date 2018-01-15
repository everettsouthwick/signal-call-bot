const Config = require('./config');

// requires logs.js
const logs = require('./logs');

function calculateBuyPrice(currentPrice) {
    return parseFloat(currentPrice * (1 + 0.03)).toFixed(6);
}

function calculateBuyMaxPotentialGain(targetPrice, buyPrice) {
    return Math.floor((targetPrice - buyPrice) / buyPrice * 100);
}

function calculateBuyQuantity(buyPrice) {
    return Math.floor(0.04 / buyPrice);
}

module.exports = {
    calculateBuyOrder: function(coin, targetPrice, currentPrice) {
        logs.log(`DEBUG :: Calculating buy order...`);

        // The buy price should be the current price + 3%.
        var buyPrice = calculateBuyPrice(currentPrice);

        // Calculate the potential gain based on the buy price.
        var potentialGain = calculateBuyMaxPotentialGain(targetPrice, buyPrice);
        // We should only do this if the potential gains are greater than 25%.
        highPotentialGain = potentialGain > 25;

        // Calculate the quantity. We never want to spend more than 0.05 ETH.
        var quantity = calculateBuyQuantity(buyPrice);

        // Ensure that we've passed all the checks, and if we have, place the buy order.
        approved = validCoin && validTargetPrice && noRecentOrder && noRecentCancel && highPotentialGain;

        logs.log(`DEBUG :: (\$${coin}) Buy Price: ${buyPrice} Potential Gain: ${potentialGain} Quantity: ${quantity} Approved: ${approved}`);
        
        if (approved) {
            Binance.buyOrder(null, coin, 'ETH', buyPrice, quantity, function(response) {
                noRecentOrder = false;
                
                if (response.status.trim().toLowerCase() != 'FILLED') {
                    // If the order isn't immediately filled, we want to wait 1 second before creating the sell orders.
                    setTimeout(function() {
                        calculateSellOrders(coin, buyPrice, targetPrice, quantity, potentialGain);
                    }, 1000)

                    // We want to cancel the buy order after 5 seconds if it isn't filled.
                    stageCancelOrder(response.id.trim(), response.side.trim().toLowerCase(), coin, buyPrice, 5000);
                } else {
                    // If the order is immediately filled, we want to start creating the sell orders.
                    calculateSellOrders(coin, buyPrice, targetPrice, quantity, potentialGain);
                }
            })
        }
    }
}