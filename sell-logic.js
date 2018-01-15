const Config = require('./config');
const Binance = require('./binance');
const Formatter = require('./formatter');
const Logging = require('./logging');

function calculateSellPrice(i, buyPrice, sellOrderGain) {
    return Formatter.formatPrice(buyPrice * (1 + (sellOrderGain / 100)));
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
    return sellQuantity - 1;
}

module.exports = {
    calculateSellOrders: function(error, coin, buyPrice, targetPrice, quantity, potentialGain, callback) {
        if (error) return console.error(error);
		
        // Sell 25% of the quantity at 25% of the total gains, then another 25% at 50%, another 25% at 75%, and the remaining 25% at 90%.
        for (var i = 1; i <= 4; i++) {
            // Calculate the quantity to sell per order, favoring the lowest tier the most.
            let sellQuantity = calculateSellQuantity(i, quantity);
    
            // Tier the target price to help ensure that we sell all of our coins.
            let sellOrderPotentialGain = calculateSellPotentialGain(i, potentialGain);
    
            // Calculate the sell price
            let sellPrice = calculateSellPrice(i, buyPrice, sellOrderPotentialGain);
    		
			let approved = sellQuantity > 0;
			Logging.log(`calculateBuyOrder(): sellPrice: ${sellPrice}. sellQuantity: ${sellQuantity}. sellOrderPotentialGain: ${sellOrderPotentialGain}. approved: ${approved}.`);
			
			if (approved) {
	            Binance.sellOrder(null, coin, 'ETH', sellPrice, sellQuantity, sellOrderPotentialGain, function(response) {
					callback(error, response, coin, buyPrice)
	            })				
			}
        }
    }
}