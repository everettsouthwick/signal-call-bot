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
}