//const Binance = require('./binance');

var messages = [];
var allCoins = [];

messages.push(`Coin: $GVT
price (BTC): 0.00200 Goal (BTC): 0.0039500
price (ETH): 0.02090 Goal (ETH): 0.039000`);
messages.push(`Coin is: $nav
Goal (btc): 0.0004900
Goal: (eth): 0.0072000
Trade safe, Don't buy higher than target!`);
messages.push(`The coin is $KMD (Komodo)
Our goal is (btc) 0.0011800
Current price (btc): 0.0006700
Buy safe! Goodluck!`);

// Binance.allCoins(null, function(balances) {
//     for (var coin in balances) {
//         // We don't care about ETH, BTC, or USDT.
//         if (coin != 'ETH' && coin != 'BTC' && coin != 'USDT') {
//             allCoins.push(coin.trim().toUpperCase());
//         }
//     }
// 	module.exports.allCoins = allCoins;
// });

module.exports = {
	// Debug mode.
	debug: true, 
	// Parameters that will have to be met in order to initiate orders.
	validCoin: false,
	validTargetPrice: false,
	highPotentialGain: false,
	noRecentOrder: true,
	noRecentCancel: true,
	// The stored messages.
	messages: messages,
	// Our purchase price limit in ETH.
	maximumPrice: 0.05,
	allCoins: allCoins
}