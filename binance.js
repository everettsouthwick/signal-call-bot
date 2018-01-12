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

    buyOrder: function(error, coinSymbol, exchangePair, price, quantity) {
        if (error) return console.error(error);
        console.log(`BINANCE :: Creating buy order for ${quantity} ${coinSymbol}${exchangePair} at ${price} at ${new Date().toLocaleTimeString()}.`);
        //Binance.buy(`${coinSymbol}${exchangePair}`, quantity, price);
    },

    sellOrder: function(error, coinSymbol, exchangePair, price, callback) {

    },

    cancelOrder: function(error, coinSymbol, exchangePair, callback) {

    }
}