const Discord = require('discord.js');
const Config = require('./config');
const Binance = require('./binance');
const Parser = require('./parser');
var client = new Discord.Client();

var timer = 0;
setInterval(function() {
    timer++;
}, 1)

Binance.checkPrice(null, 'REQ', 'ETH', function(price) {
    console.log('That took ' + timer + ' milliseconds to call the API.');
})

// Define global conditions that all must be true in order to initiate a trade.
var validCoin = false;
var validTargetPrice = false;
var highPotentialGain = false; // Potential gain >25%
var noRecentOrder = true;
var noRecentCancel = true;

// Config.messages.forEach(function(message) {
//     parseMessage(message.toUpperCase());
// });

// Parse the message to return the data we need.
function parseMessage(message) {
    var coin = Parser.parseCoin(message);
    validateCoin(coin);
    var targetPrice = Parser.parseTargetPrice(message);
    validateTargetPrice(coin, targetPrice);
}

// Validate that the coin exists in Binance and has an exchange pair for ETH.
function validateCoin(coin) {
    Binance.checkPrice(null, coin, 'ETH', function(price) {
        validCoin = price != undefined;
    });
}

// Validate that the coin is within range of ETH, and is not lower than the current price of ETH.
function validateTargetPrice(coin, targetPrice) {
    Binance.checkPrice(null, coin, 'ETH', function(currentPrice) {
        console.log(`Target Price: ${targetPrice} :: Current Price ${currentPrice}`)
        // If the target price is less than the current price, it's not a valid target price.
        if (targetPrice < currentPrice) {
            validTargetPrice = false;
        // If the target price is less than double of the current price, it's likely the target price. Also, we don't want to buy anything that's more than 0.04 ETH per coin.
        } else if ((targetPrice / 2) < currentPrice && currentPrice < 0.04) {
            validTargetPrice = true;
            calculateBuyOrder(coin, targetPrice, currentPrice)
        }
    })
}

//#region Buy order logic

function calculateBuyOrder(coin, targetPrice, currentPrice) {
    // The buy price should be the current price + 3%.
    var buyPrice = calculateBuyPrice(currentPrice);

    // Calculate the potential gain based on the buy price.
    var potentialGain = calculateBuyMaxPotentialGain(targetPrice, buyPrice);
    // We should only do this if the potential gains are greater than 25%.
    highPotentialGain = potentialGain > 25;

    // Calculate the quantity. We never want to spend more than 0.05 ETH.
    var quantity = calculateBuyQuantity(buyPrice);

    // Ensure that we've passed all the checks, and if we have, place the buy order.
    approved = validCoin && validTargetPrice && noRecentOrder && noRecentCancel && highPotentialGain;

    if (approved) {
        Binance.buyOrder(null, coin, 'ETH', buyPrice, quantity, function(response) {
            noRecentOrder = false;
            calculateSellOrders(coin, buyPrice, targetPrice, quantity, potentialGain);
            if (response.status.trim().toUpperCase() != 'FILLED') {
                stageCancelOrder(response.id.trim(), response.side.trim().toLowerCase(), coin);
            }
        })
    }
}

function calculateBuyPrice(currentPrice) {
    return parseFloat(currentPrice * (1 + 0.03)).toFixed(8);
}

function calculateBuyMaxPotentialGain(targetPrice, buyPrice) {
    return Math.floor((targetPrice - buyPrice) / buyPrice * 100);
}

function calculateBuyQuantity(buyPrice) {
    return Math.floor(0.04 / buyPrice);
}

function stageCancelOrder(id, side, coin) {
    setTimeout(function() {
        Binance.checkOrderStatus(null, id, side, coin, 'ETH', function(orderStatus, symbol) {
            if (orderStatus.status.trim().toUpperCase() != 'FILLED') {
                Binance.cancelOrder(null, id, side, coin, 'ETH', function(response, coinSymbol) {
                })
            }
        })
    }, 1000)
}

//#endregion

//#region Sell order logic

function calculateSellOrders(coin, buyPrice, targetPrice, quantity, potentialGain) {
    // Sell 25% of the quantity at 25% of the total gains, then another 25% at 50%, another 25% at 75%, and the remaining 25% at 90%.
    for (var i = 1; i <= 4; i++) {
        // Calculate the quantity to sell per order, favoring the lowest tier the most.
        var sellQuantity = calculateSellQuantity(i, quantity);

        // Tier the target price to help ensure that we sell all of our coins.
        var sellOrderGain = calculateSellPotentialGain(i, potentialGain);

        // Calculate the sell price
        var sellPrice = calculateSellPrice(i, buyPrice, sellOrderGain);

        Binance.sellOrder(null, coin, 'ETH', sellPrice, sellQuantity, sellOrderGain, function(response) {

        })
    }
}



function calculateSellPrice(i, buyPrice, sellOrderGain) {
    return parseFloat(buyPrice * (1 + (sellOrderGain / 100)).toFixed(8));
}

function calculateSellPotentialGain(i, potentialGain) {
    if (i == 4) {
        return Math.floor(0.9 * potentialGain);
    }
    return Math.floor((i * 0.25) * potentialGain);

}

function calculateSellQuantity(i, quantity) {
    var sellQuantity = 0;
    if (quantity % 4 != 0) {
        if (i == 1) {
            sellQuantity = Math.floor(quantity / 4) + quantity % 4;
        }
        else {
            sellQuantity = Math.floor(quantity / 4);
        }
    } else {
        sellQuantity = quantity / 4;
    }
    return sellQuantity;
}

//#endregion

//#region Discord functionality

// Check to see when we're connected to Discord.
client.on('ready', () => {
    console.log("DISCORD :: Login successful!");
});

// Event handler for new messages.
client.on('message', function(message) {
    // Error catching because sometimes they return different types, and we don't care about the other types they return (VoiceChannel/DirectMessage).
    try {
        var isGuild = message.channel.guild.id.trim() == process.env.DISCORD_GUILD_ID.trim();
        var isChannel = message.channel.name.toUpperCase().trim() == process.env.DISCORD_CHANNEL_NAME.toUpperCase().trim()

        // If it is from the correct guild & the correct channel, try parsing it.
        if(isGuild && isChannel) {
            parseMessage(message.toUpperCase());
        }
    }
    // We don't care about exception handling.
    catch (e) {}
});

// Login to Discord.
//client.login(process.env.DISCORD_TOKEN.trim())

//#endregion