const Config = require('./config');
const Binance = require('./binance');
const Formatter = require('./formatter');
const Logging = require('./logging');

function calculateBuyPrice(currentPrice) {
    return Formatter.formatPrice(currentPrice * (1 + 0.03));
}

function calculateBuyMaxPotentialGain(buyPrice, targetPrice) {
    return Math.floor((targetPrice - buyPrice) / buyPrice * 100);
}

function calculateBuyQuantity(buyPrice) {
    return Math.floor(Config.maximumPrice / buyPrice);
}

module.exports = {
    calculateBuyOrder: function(error, coin, currentPrice, targetPrice, callback) {
		if (error) return console.error(error);

        // The buy price should be the current price + 3%.
        let buyPrice = calculateBuyPrice(currentPrice);

        // Calculate the potential gain based on the buy price.
        let potentialGain = calculateBuyMaxPotentialGain(buyPrice, targetPrice);
        // We should only do this if the potential gains are greater than 25%.
        Config.highPotentialGain = potentialGain > 25;
		
        // Calculate the quantity. We never want to spend more than 0.05 ETH.
        let quantity = calculateBuyQuantity(buyPrice);
		
        // Ensure that we've passed all the checks, and if we have, place the buy order.
        let approved = Config.validCoin && Config.validTargetPrice && Config.highPotentialGain && Config.noRecentOrder && Config.noRecentCancel;
		
		Logging.log(`calculateBuyOrder(): buyPrice: ${buyPrice}. quantity: ${quantity}. potentialGain: ${potentialGain}. approved: ${approved}.`);
        
        if (approved) {
            Binance.buyOrder(null, coin, 'ETH', buyPrice, quantity, function(response) {
                Config.noRecentOrder = false;
				callback(error, response, buyPrice, quantity, potentialGain);
            })
        }
    }
}