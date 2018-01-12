const Discord = require('discord.js');
const Config = require('./config');
const Binance = require('./binance')
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
    var coin = parseCoin(message);
    if (coin != undefined) {
        validateCoin(null, coin, function(valid) {
            validCoin = valid;
            console.log(validCoin);
        })
    }
}

// Extract the ticker symbol from the message.
function parseCoin(message) {
    var match = message.match(/\$[A-Za-z0-9]{2,5}/)
    if (match != null && match.length > 0) {
        return match[0].replace('$', '');
    } 
    else {
        return undefined;
    }
}

// Validate that the coin exists in Binance and has an exchange pair to at least BTC.
function validateCoin(error, coin, callback) {
    Binance.checkPrice(null, coin, 'BTC', function(price) {
        var valid = price != undefined;
        callback(valid);
    });
}

// Extract the target price from the message.
function parseTargetPrice(message) {
    // Initialize booleans for whether or not there are certain parameters we're looking for.
    var hasBtc, hasEth;

    // Validate there is BTC and/or ETH.
    hasBtc = message.indexOf('(BTC)') != -1;
    hasEth = message.indexOf('(ETH)') != -1;
    if (!hasBtc) {
        hasBtc = message.indexOf(' BTC ') != -1;
    }
    if (!hasEth) {
        hasEth = message.indexOf(' ETH ') != -1;
    }

    // Search for numbers in the message and sort them from lowest to highest.
    var numMatches = message.match(/0\.[0-9]{1,8}/g);
    numMatches.sort();

    // Search for Ethereum prices at runtime if they only supply BTC values, otherwise use the target price they specify for ETH.
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