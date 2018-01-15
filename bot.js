const Discord = require('discord.js');
const Config = require('./config');
const Binance = require('./binance');
const Parser = require('./parser');
const Validator = require('./validator');
const Buy = require('./buy-logic');
const Sell = require('./sell-logic');
const Logging = require('./logging');

var client = new Discord.Client();

function main() {
	// Check to see if there were any command line arguments passed.
	if (process.argv.length > 2) {
		// Remove the two default process arguments for simplicity.
		let args = process.argv.slice(2);
		// Check if we're running in manual mode.
		let manual = args[0].trim().toLowerCase() === "manual";
		
		// If we're running in manual mode, we know the coin and target price and can immediately kick off the validation process.
		if (manual) {
			let coin = args[1].trim().toUpperCase();
			let targetPrice = args[2].trim();
			// Validate the target price so we can continue.
			Validator.validate(null, coin, targetPrice, function(error, coin, currentPrice, targetPrice) {
				if (Config.validCoin && Config.validTargetPrice) {
					buy(coin, currentPrice, targetPrice);
				}
			});
			return;
		}
	}
	
	// Check if we're running in debug mode.
	if (Config.debug) {
		// If we're running in debug mode, iterate through the saved messages.
        Config.messages.forEach(function(message) {
			message = message.toLowerCase();
            parse(message);
        });
	}
}

main();

function parse(message) {
	let coin = Parser.parseCoin(message);
	let targetPrice = Parser.parseTargetPrice(message);
	validate(coin, targetPrice);
}

function validate(coin, targetPrice) {
	Validator.validate(null, coin, targetPrice, function(error, coin, currentPrice, targetPrice) {
		if (Config.validCoin && Config.validTargetPrice) {
			buy(coin, currentPrice, targetPrice);
		}
	});
}

function buy(coin, currentPrice, targetPrice) {
	Buy.calculateBuyOrder(null, coin, currentPrice, targetPrice, function(error, response, buyPrice, quantity, potentialGain) {
        if (Config.debug) {
        	sell(coin, buyPrice, targetPrice, quantity, potentialGain)
			return;
        }
		
		if (response.status.trim() != 'FILLED') {
            // If the order isn't immediately filled, we want to wait 1 second before creating the sell orders.
            setTimeout(function() {
                sell(coin, buyPrice, targetPrice, quantity, potentialGain);
            }, 1000)

            // We want to cancel the buy order after 5 seconds if it isn't filled.
            stageCancelOrder(response.id.trim(), response.side.trim().toLowerCase(), coin, buyPrice, 5000);
        } else {
            // If the order is immediately filled, we want to start creating the sell orders.
            sell(coin, buyPrice, targetPrice, quantity, potentialGain);
        }
	});
}

function sell(coin, buyPrice, targetPrice, quantity, potentialGain) {
	Sell.calculateSellOrders(null, coin, buyPrice, targetPrice, quantity, potentialGain, function(error, response, coin, buyPrice) {
		stageCancelOrder(response.id.trim(), response.side.trim().toLowerCase(), coin, sellPrice, 300000)
	});
}


function stageCancelOrder(id, side, coin, buyPrice, time) {
    setTimeout(function() {
        Binance.checkOrderStatus(null, id, side, coin, 'ETH', function(orderStatus, symbol) {
            if (orderStatus.status.trim() != 'FILLED') {
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
	Logging.logOutput();
}

//#region Discord functionality

// Check to see when we're connected to Discord.
client.on('ready', () => {
    log.log("DISCORD :: Login successful!");
});

// Event handler for new messages.
client.on('message', function(message) {
    // Error catching because sometimes they return different types, and we don't care about the other types they return (VoiceChannel/DirectMessage).
    try {
        var isGuild = message.channel.guild.id.trim() == process.env.DISCORD_GUILD_ID.trim();
        var isChannel = message.channel.name.toLowerCase().trim() == process.env.DISCORD_CHANNEL_NAME.toLowerCase().trim()

        // If it is from the correct guild & the correct channel, try parsing it.
        if(isGuild && isChannel) {
            parse(message.content.toLowerCase());
        }
    }
    // We don't care about exception handling.
    catch (e) {}
});

// Login to Discord.
// if (!Config.debug) { client.login(process.env.DISCORD_TOKEN.trim()); }

//#endregion