const Discord = require('discord.js');
const Config = require('./config');
const Binance = require('./binance');
const Parser = require('./parser');
const Buy = require('./buy-logic');
const Sell = require('./sell-logic');
const logs = require('./logs');

var client = new Discord.Client();

// Remove the default arguments from the process.
var args = process.argv.slice(2);
var manual = args[0].trim().toLowerCase() == "MANUAL";
// Check to see if this is a manual entry.
if (manual) {
    // We know the coin is valid because it's manual.
    validCoin = true;
    // Validate the target price entered, we know it's valid, we just need to call this to validate the current price as well as trigger the buy and sell logic.
    validateTargetPrice(args[1], args[2]);
}

// Get a list of all available coins on Binance right now.
var allCoins = [];
Binance.allCoins(null, function(balances) {
    for (var coin in balances) {
        // We don't care about ETH, BTC, or USDT.
        if (coin.toLowerCase().trim() != 'ETH' || coin.toLowerCase().trim() == 'BTC' || coin.toLowerCase().trim() == 'USDT') {
            allCoins.push(coin.toLowerCase().trim());
        }
    }
    // If debug mode is enabled, we want to parse through the config messages.
    if (Config.debug) {
        Config.messages.forEach(function(message) {
            parseMessage(message.toLowerCase());
        });
    }
});




// Parse the message to return the data we need.
function parseMessage(message) {
    var coin = Parser.parseCoin(message, allCoins);
    validateCoin(coin);
    var targetPrice = Parser.parseTargetPrice(message);
    validateTargetPrice(coin, targetPrice);
}

// Validate that the coin exists in Binance and has an exchange pair for ETH.
function validateCoin(coin) {
    if (Config.debug) { console.debug(`DEBUG :: Validating ${coin} has an ETH exchange on Binance.`); }
    Binance.checkPrice(null, coin, 'ETH', function(price) {
        validCoin = price != undefined;
    });
}

// Validate that the coin is within range of ETH, and is not lower than the current price of ETH.
function validateTargetPrice(coin, targetPrice) {
    if (Config.debug) { console.debug(`DEBUG :: Validating ${coin} the price of the coin on Binance.`); }
    Binance.checkPrice(null, coin, 'ETH', function(currentPrice) {
        
        // If the target price is less than the current price, it's not a valid target price.
        if (targetPrice < currentPrice) {
            validTargetPrice = false;
        // If the target price is less than double of the current price, it's likely the target price. Also, we don't want to buy anything that's more than 0.04 ETH per coin.
        } else if ((targetPrice / 2) < currentPrice && currentPrice < 0.04) {
            validTargetPrice = true;
            calculateBuyOrder(coin, targetPrice, currentPrice)
        }
        if (Config.debug) {
            console.debug(`DEBUG :: (\$${coin}) Target price: ${targetPrice} Current price: ${currentPrice} Valid target price: ${validTargetPrice}`);
            logs.validateTargetPrice(coin, targetPrice, validateTargetPrice);
        }
    })
}


function stageCancelOrder(id, side, coin, buyPrice, time) {
    setTimeout(function() {
        Binance.checkOrderStatus(null, id, side, coin, 'ETH', function(orderStatus, symbol) {
            if (orderStatus.status.trim().toLowerCase() != 'FILLED') {
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
    if (Config.debug) { console.debug(`DEBUG :: Cleaning up any remaining balance...`); }
    Binance.checkBalance(null, coin, function(balance) {
        // If there's any remaining balance of the coin, sell it.
        if (Math.floor(balance) > 0) {
            // We're going to sell it for a 1% gain, because at this point we just don't want to lose anything.
            let sellPrice = parseFloat(buyPrice * (1 + 0.01).toFixed(6));
            Binance.sellOrder(null, coin, 'ETH', sellPrice, Math.floor(balance), '1', function(response) {

            });
        }
    })
}

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
        var isChannel = message.channel.name.toLowerCase().trim() == process.env.DISCORD_CHANNEL_NAME.toLowerCase().trim()

        // If it is from the correct guild & the correct channel, try parsing it.
        if(isGuild && isChannel) {
            parseMessage(message.content.toLowerCase());
        }
    }
    // We don't care about exception handling.
    catch (e) {}
});

// Login to Discord.
if (!Config.debug && !manual) { client.login(process.env.DISCORD_TOKEN.trim()); }

//#endregion