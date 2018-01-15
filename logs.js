const Config = require('./config');
const fs = require('fs');

var logs = [];

module.exports = {
    log: function(message) {
        // Apparently pop is faster than push by about 10%. Since we're concerned about speed we only want to add the timestamp when we're running in debug mode.
        if (Config.debug) { 
            var date = new Date();
            logs.pop(`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()} - ${message}`) 
        } else { 
            logs.pop(message) 
        }
    },

    logOutput: function() {
        // Since we're using pop in the log function, we'll have to output the contents in reverse order. We're not concerned with speed here since this will be called after everything has cleaned up.
    },

    // DEPRECATED
    binanceBuyOrderLog: function(coinSymbol, exchangePair, price, quantitiy) {
        fs.writeFile("logs/binanceBuyOrderLog.txt", `\nBINANCE :: Creating buy order for ${quantity} ${coinSymbol} priced at ${price} ${exchangePair} at ${new Date().toLocaleTimeString()}.\n`, function(error) {
            if(error) {
                console.log(err);
            }
            console.log("the binanceBuyOrderLog was saved!")
        })
    },

    // DEPRECATED
    binanceSellOrderLog: function(coinSymbol, exchangePair, price, quantity, potentialGain) {
        fs.writeFile("logs/binanceSellOrderLog.txt", `\nBINANCE :: Creating sell order for ${quantity} ${coinSymbol} priced at ${price} ${exchangePair} for a potential gain of ${potentialGain}% at ${new Date().toLocaleTimeString()}.\n`, function(error) {
            if(error) {
                console.log(err);
            }
            console.log("the binanceSellOrderLog was saved!")
        })
    },

    // DEPRECATED
    binanceCancelOrderLog: function(coinSymbol, exchangePair, price, quantity, potentialGain) {
        fs.writeFile("logs/binanceCancelOrderLog.txt", `\nBINANCE :: Canceling ${side} order for ${coinSymbol} at ${new Date().toLocaleTimeString()}.\n`, function(error) {
            if(error) {
                console.log(err);
            }
            console.log("the binanceCancelOrderLog was saved!")
        })
    },

    // DEPRECATED
    binanceCheckOrderStatusLog: function(id, side, coinSymbol, exchangePair) {
        fs.writeFile("logs/binanceCheckOrderStatusLog.txt", `\nBINANCE :: Checking status of ${side} order for ${coinSymbol} at ${new Date().toLocaleTimeString()}.\n`, function(error) {
            if(error) {
                console.log(err);
            }
            console.log("the binanceCheckOrderStatusLog was saved!")
        })
    },

    // DEPRECATED
    binanceCheckBalanceLog: function(coinSymbol) {
        fs.writeFile("logs/binanceCheckBalanceLog.txt", `\nBINANCE :: Checking balance of ${coinSymbol} at ${new Date().toLocaleTimeString()}.\n`, function(error) {
            if(error) {
                console.log(err);
            }
            console.log("the binanceCheckBalanceLog was saved!")
        })
    },

    // DEPRECATED
    botValidateCoinLog: function(coin) {
        fs.writeFile("logs/botValidateCoinLog.txt", `\nDEBUG :: Validating ${coin} has an ETH exchange on Binance.\n`, function(error) {
            if(error) {
                console.log(err);
            }
            console.log("the botValidateCoinLog was saved!")
        })
    },

    // DEPRECATED
    botValidateTargetPriceLog: function(coin, targetPrice, validTargetPrice) {
        fs.writeFile("logs/botValidateTargetPriceLog.txt", `\nDEBUG :: (\$${coin}) Target price: ${targetPrice} Current price: ${currentPrice} Valid target price: ${validTargetPrice}\n`, function(error) {
            if(error) {
                console.log(err);
            }
            console.log("the botValidateTargetPriceLog was saved!")
        })
    },

    // DEPRECATED
    calculateBuyOrderLog: function(coin, buyPrice, potentialGain, quantity, approved) {
        fs.writeFile("logs/calculateBuyOrder.txt", `DEBUG :: (\$${coin}) Buy Price: ${buyPrice} Potential Gain: ${potentialGain} Quantity: ${quantity} Approved: ${approved}`, function(error) {
            if(error) {
                console.log(err);
            }
            console.log("the calculateBuyOrderLog was saved!")
        })
    },
}