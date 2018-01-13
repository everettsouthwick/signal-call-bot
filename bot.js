const Discord = require('discord.js');
const Config = require('./config');
const Binance = require('./binance');
const Parser = require('./parser');
var client = new Discord.Client();

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
            
            if (response.status.trim().toUpperCase() != 'FILLED') {
                // If the order isn't immediately filled, we want to wait 1 second before creating the sell orders.
                setTimeout(function() {
                    calculateSellOrders(coin, buyPrice, targetPrice, quantity, potentialGain);
                }, 1000)

                // We want to cancel the buy order after 5 seconds if it isn't filled.
                stageCancelOrder(response.id.trim(), response.side.trim().toLowerCase(), coin, buyPrice, 5000);
            } else {
                // If the order is immediately filled, we want to start creating the sell orders.
                calculateSellOrders(coin, buyPrice, targetPrice, quantity, potentialGain);
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

//#endregion

function stageCancelOrder(id, side, coin, buyPrice, time) {
    setTimeout(function() {
        Binance.checkOrderStatus(null, id, side, coin, 'ETH', function(orderStatus, symbol) {
            if (orderStatus.status.trim().toUpperCase() != 'FILLED') {
                Binance.cancelOrder(null, id, side, coin, 'ETH', function(response, coinSymbol) {
                    noRecentCancel = false;
                    if (side == "sell") {
                        // Once we cancel the open sell orders (if any), we want to create a sell order to sell any remaining balance for what we bought it for originally to prevent loss.
                        cleanRemainingBalance(coin, buyPrice);
                    }
                })
            }
        })
    }, time)
}

function cleanRemainingBalance(coin, buyPrice) {
    Binance.checkBalance(null, coin, function(balance) {
        // If there's any remaining balance of the coin, sell it.
        if (Math.floor(balance) > 0) {
            // We're going to sell it for a 1% gain, because at this point we just don't want to lose anything.
            let sellPrice = parseFloat(buyPrice * (1 + 0.01).toFixed(8));
            Binance.sellOrder(null, coin, 'ETH', sellPrice, Math.floor(balance), '1', function(response) {

            });
        }
    })
}


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
            // We want to cancel all of our sell orders if they haven't been filled after 5 minutes.
            stageCancelOrder(response.id.trim(), response.side.trim().toLowerCase(), coin, buyPrice, 300000)
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
            parseMessage(message.content.toUpperCase());
        }
    }
    // We don't care about exception handling.
    catch (e) {}
});

// Login to Discord.
client.login(process.env.DISCORD_TOKEN.trim())

//#endregion