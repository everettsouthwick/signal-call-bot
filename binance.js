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
        /*Binance.buy(`${coinSymbol}${exchangePair}`, Math.floor(quantity), parseFloat(price).toFixed(8), {}, function(response) {
            callback(response);
        });*/
    },

    sellOrder: function(error, coinSymbol, exchangePair, price, quantity, potentialGain, callback) {
        if (error) return console.error(error);
        console.log(`BINANCE :: Creating sell order for ${quantity} ${coinSymbol} priced at ${price} ${exchangePair} for a potential gain of ${potentialGain}% at ${new Date().toLocaleTimeString()}.\n`);
        /*Binance.sell(`${coinSymbol}${exchangePair}`, Math.floor(quantity), parseFloat(price).toFixed(8), {}, function(response) {
            callback(response);
        })*/
    },

    cancelOrder: function(error, coinSymbol, exchangePair, callback) {

    }
}