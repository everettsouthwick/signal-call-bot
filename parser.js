const Config = require('./config');
const Formatter = require('./formatter');
const Logging = require('./logging');

module.exports = {
    parseCoin: function(message) {
		// Define our coin variable.
		let coin = undefined;
        // Search for a ticker starting with a $ followed by 2 to 5 characters.
        var match = message.match(/\$[A-Za-z0-9]{2,5}/)
        if (match != null && match.length > 0) {
			// If we find a match, return the uppercase variant of that with the $ removed.
            coin = match[0].replace('$', '').trim().toUpperCase();
        } 
		// If we can't find an initial match, we need to iterate through a pre-determined list of coins and try to match against that.
        else {
            var split = message.replace("\n", " ").replace("(", "").replace(")", "").split(" ");
            for (var i = 0; i < split.length; i++) {
                var index = Config.allCoins.indexOf(split[i].trim().toUpperCase());
                if (index != -1) {
					// If we find a match, return the uppercase variant of that.
                    coin = Config.allCoins[index].trim().toUpperCase();
                    break;
                }
            }
            coin = undefined;
        }
		
		Logging.log(`parseCoin(): coin: ${coin}.`);
		return coin;
    },

    parseTargetPrice: function(message) {
		// Define our targetPrice variable.
		let targetPrice = undefined;
        // Search for numbers in the message and sort them from lowest to highest.
        var matches = message.match(/0\.[0-9]{1,8}/g);
        matches.sort();

        // If ETH's target price is included, it will always be the one with the highest value, since BTC has significant price per coin advantage over ETH. We will validate we're not taking the BTC price later.
        targetPrice = Formatter.formatPrice(matches[matches.length - 1]);
		
		Logging.log(`parseTargetPrice(): targetPrice: ${targetPrice}.`);
		return targetPrice;
    }
}