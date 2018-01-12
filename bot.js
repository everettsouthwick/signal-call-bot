const Discord = require('discord.js');
const Config = require('./config');
const Binance = require('./binance');
const Parser = require('./parser');
var client = new Discord.Client();

// Define global conditions that all must be true in order to initiate a trade.
var validCoin = false;
var validTargetPrice = false;
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

// Validate that the coin is within range of ETH, and is not lower than the current price of ETH.
function validateTargetPrice(coin, targetPrice) {
    Binance.checkPrice(null, coin, 'ETH', function(price) {
        console.log(`Target Price: ${targetPrice} :: Current Price ${price}`)
        // If the target price is less than the current price, it's not a valid target price.
        if (targetPrice < price) {
            console.log('hit first');
            validTargetPrice = false;
        // If the target price is less than double of the current price, it's likely the target price.
        } else if ((targetPrice / 2) < price) {
            console.log('hit second');
            validTargetPrice = true;
        } else {
            console.log('hit third');
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