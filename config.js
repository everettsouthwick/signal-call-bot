var messages = [];

messages.push(`Coin: GVT
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

exports.messages = messages;
exports.debug = true;
exports.validCoin = false;
exports.validTargetPrice = false;
exports.highPotentialGain = false;
exports.noRecentOrder = true;
exports.noRecentCancel = true;