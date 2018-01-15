const Config = require('./config');
const Binance = require('./binance');
const Logging = require('./logging');

module.exports = {
	validate: function(error, coin, targetPrice, callback) {
		if (error) return console.error(error);
		
		Binance.checkPrice(null, coin.trim().toUpperCase(), 'ETH', function(currentPrice) {
			// If we get a valid price back, we can assume the coin is valid.
			Config.validCoin = currentPrice != undefined;
			
			// Check to see if the target price is less than the current price.
			if (targetPrice < currentPrice) {
				// If the target price is more than the current price, it is not valid.
				Config.validTargetPrice = false;
			}
			// Check to see if the target price is more than 150% greater than the current price, and that the current price is less than our maximum purchase amount.
			else if (targetPrice < (currentPrice * (1 + 1.50)) && currentPrice < Config.maximumPrice) {
				// If the target price is less than 150% greater than the current price, and that current price is less than the maximum purchase amount, it is a valid target price.
				Config.validTargetPrice = true;
			}
			Logging.log(`validate(): validCoin: ${Config.validCoin}. validTargetPrice: ${Config.validTargetPrice}. currentPrice: ${currentPrice}.`);
			callback(error, coin, currentPrice, targetPrice);
		})
	}
}