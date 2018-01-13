const Binance = require('node-binance-api');

Binance.options({
    'APIKEY': process.env.BINANCE_API_KEY.trim(),
    'APISECRET': process.env.BINANCE_API_SECRET.trim()
});

module.exports = {
    checkPrice: function(error, coinSymbol, exchangePair, callback) {
        if (error) return console.error(error);
        Binance.prices(function(ticker) {
            callback(ticker[`${coinSymbol}${exchangePair}`])
        })
    },

    buyOrder: function(error, coinSymbol, exchangePair, price, quantity, callback) {
        if (error) return console.error(error);
        console.log(`BINANCE :: Creating buy order for ${quantity} ${coinSymbol} priced at ${price} ${exchangePair} at ${new Date().toLocaleTimeString()}.\n`);
        Binance.buy(`${coinSymbol}${exchangePair}`, quantity, price, {}, function(response) {
            callback(response);
        });
    },

    sellOrder: function(error, coinSymbol, exchangePair, price, quantity, potentialGain, callback) {
        if (error) return console.error(error);
        console.log(`BINANCE :: Creating sell order for ${quantity} ${coinSymbol} priced at ${price} ${exchangePair} for a potential gain of ${potentialGain}% at ${new Date().toLocaleTimeString()}.\n`);
        Binance.sell(`${coinSymbol}${exchangePair}`, quantity, price, {}, function(response) {
            callback(response);
        });
    },

    cancelOrder: function(error, id, side, coinSymbol, exchangePair, callback) {
        if (error) return console.error(error);
        console.log(`BINANCE :: Canceling ${side} order for ${coinSymbol} at ${new Date().toLocaleTimeString()}.\n`)
        Binance.cancel(`${coinSymbol}${exchangePair}`, id, function(response, symbol) {
            callback(response, symbol);
        });
    },

    checkOrderStatus: function(error, id, side, coinSymbol, exchangePair, callback) {
        if (error) return console.error(error);
        console.log(`BINANCE :: Checking status of ${side} order for ${coinSymbol} at ${new Date().toLocaleTimeString()}.\n`);
        Binance.orderStatus(`${coinSymbol}${exchangePair}`, id, function(orderStatus, symbol) {
            callback(orderStatus, symbol);
        });
    },

    checkBalance: function(error, coinSymbol, callback) {
        if (error) return console.error(error);
        console.log(`BINANCE :: Checking balance of ${coinSymbol} at ${new Date().toLocaleTimeString()}.\n`)
        Binance.balance(function(balances) {
            let balance = balances[coinSymbol].available;
            callback(balance);
        });
    }
}