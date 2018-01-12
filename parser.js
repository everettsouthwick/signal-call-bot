module.exports = {
    parseCoin: function(message) {
        // Search for a ticker starting with a $ followed by 2 to 5 characters.
        var match = message.match(/\$[A-Za-z0-9]{2,5}/)
        if (match != null && match.length > 0) {
            return match[0].replace('$', '');
        } 
        else {
            return undefined;
        }
    },

    parseTargetPrice: function(message) {
        // Search for numbers in the message and sort them from lowest to highest.
        var matches = message.match(/0\.[0-9]{1,8}/g);
        matches.sort();

        // If ETH's target price is included, it will always be the one with the highest value, since BTC has significant price per coin advantage over ETH. We will validate we're not taking the BTC price later.
        return matches[matches.length - 1]
    }
}