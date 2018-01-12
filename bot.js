const Discord = require('discord.js');
const Binance = require('node-binance-api');
var client = new Discord.Client();

// Define global conditions that all must be true in order to initiate a trade.
var validCoin = false;

Binance.options({
    'APIKEY': process.env.BINANCE_API_KEY.trim(),
    'APISECRET': process.env.BINANCE_API_SECRET.trim()
});

// Check the current price of a symbol/exchange pair. Example: ETHUSDT (Ethereum's current price in USD)
function checkPrice(targetSymbol, exchangeSymbol) {
    Binance.prices(function(ticker) {
        console.log(ticker[targetSymbol + exchangeSymbol])
    })
}

// Example messages.
var message1 = `Coin is: $nav
Goal (btc): 0.0004900
Goal: (eth): 0.0072000
Trade safe, Don't buy higher than target!`
var message2 = `The coin is $KMD (Komodo)
Our goal is (btc) 0.0011800
Current price (btc): 0.0006700
Buy safe! Goodluck!`

// Parse the message to return the data we need.
function parseMessage(message) {
    // Expected output: NAV
    console.log(parseCoin(message1));

    // Expected output: KMD
    console.log(parseCoin(message2));
}

// Extract the ticker symbol from the message.
function parseCoin(message) {
    var match = message.match(/\$[A-Za-z0-9]{2,5}/)
    if (match != null && match.length > 0) {
        // Rather than setting valid coin to true here, we should instead ensure its validity by doing a binance call to check the price of that coin. For now, this implementation works.
        validCoin = true;
        return match[0].replace('%', '');
    } 
    else {
        return 'Coin not found!';
    }
}

// Extract the target price from the message.
function parseTargetPrice(message) {
    // Initialize booleans for whether or not there are certain parameters we're looking for.
    var hasBtc, hasEth;

    // Validate there is BTC and/or ETH.
    hasBtc = message.indexOf('BTC') != -1;
    hasEth = message.indexOf('ETH') != -1;

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