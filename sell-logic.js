const Config = require('./config');

function calculateSellPrice(i, buyPrice, sellOrderGain) {
    return parseFloat(buyPrice * (1 + (sellOrderGain / 100)).toFixed(6));
}

function calculateSellPotentialGain(i, potentialGain) {
    if (i == 4) {
        return Math.floor(0.9 * potentialGain);
    }
    return Math.floor((i * 0.25) * potentialGain);

}

function calculateSellQuantity(i, quantity) {
    var sellQuantity = 0;
    if (quantity % 4 != 0) {
        if (i == 1) {
            sellQuantity = Math.floor(quantity / 4) + quantity % 4;
        }
        else {
            sellQuantity = Math.floor(quantity / 4);
        }
    } else {
        sellQuantity = quantity / 4;
    }
    return sellQuantity;
}

module.exports = {
    calculateSellOrders: function(coin, buyPrice, targetPrice, quantity, potentialGain) {
        if (Config.debug) { console.debug(`DEBUG :: Calculating sell orders...`); }
        // Sell 25% of the quantity at 25% of the total gains, then another 25% at 50%, another 25% at 75%, and the remaining 25% at 90%.
        for (var i = 1; i <= 4; i++) {
            // Calculate the quantity to sell per order, favoring the lowest tier the most.
            var sellQuantity = calculateSellQuantity(i, quantity);
    
            // Tier the target price to help ensure that we sell all of our coins.
            var sellOrderGain = calculateSellPotentialGain(i, potentialGain);
    
            // Calculate the sell price
            var sellPrice = calculateSellPrice(i, buyPrice, sellOrderGain);
    
            if (Config.debug) { console.debug(`DEBUG :: (\$${coin}) Sell Price: ${sellPrice} Potential Gain: ${sellOrderGain} Quantity: ${sellQuantity}`); }
    
            Binance.sellOrder(null, coin, 'ETH', sellPrice, sellQuantity, sellOrderGain, function(response) {
                // We want to cancel all of our sell orders if they haven't been filled after 5 minutes.
                stageCancelOrder(response.id.trim(), response.side.trim().toLowerCase(), coin, buyPrice, 300000)
            })
        }
    }
}