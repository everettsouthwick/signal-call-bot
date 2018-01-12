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

Config.messages.forEach(function(message) {
    parseMessage(message.toUpperCase());
});

// Parse the message to return the data we need.
function parseMessage(message) {
    var coin = Parser.parseCoin(message);
    validateCoin(coin);
    var targetPrice = Parser.parseTargetPrice(message);
    validateTargetPrice(coin, targetPrice);
}

// Validate that the coin exists in Binance and has an exchange pair to at least BTC.
function validateCoin(coin) {
    Binance.checkPrice(null, coin, 'BTC', function(price) {
        validCoin = price != undefined;
    });
}

console.log(parseFloat(100 * (1 + 0.1)));

// Validate that the coin is within range of ETH, and is not lower than the current price of ETH.
function validateTargetPrice(coin, targetPrice) {
    Binance.checkPrice(null, coin, 'ETH', function(price) {
        console.log(`Target Price: ${targetPrice} :: Current Price ${price}`)
        // If the target price is less than the current price, it's not a valid target price.
        if (targetPrice < price) {
            validTargetPrice = false;
        // If the target price is less than double of the current price, it's likely the target price. Also, we don't want to buy anything that's more than 0.05 ETH per coin.
        } else if ((targetPrice / 2) < price && price < 0.05) {
            validTargetPrice = true;

            // The buy price should be the current price + 5%.
            var buyPrice = (price * (1 + 0.05));
            // Calculate the potential gain based on the buy price.
            var potentialGain = Math.floor((targetPrice - price) / price * 100);
            // We should only do this if the potential gains are greater than 25%.
            highPotentialGain = potentialGain > 25;
            // Calculate the quantity. We never want to spend more than 0.05 ETH.
            var quantity = Math.floor(0.05 / buyPrice);

            // Ensure that we've passed all the checks.
            approved = validCoin && validTargetPrice && noRecentOrder && noRecentCancel && highPotentialGain;
            if (approved) {
                Binance.buyOrder(null, coin, 'ETH', buyPrice, quantity)
                noRecentOrder = false;
            }
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
client.login(process.env.DISCORD_TOKEN.trim())

//#endregion