const Config = require('./config');
const fs = require('fs');

var logs = [];

module.exports = {
    log: function(message) {
        var date = new Date();
        // Apparently pop is faster than push by about 10%. Since we're concerned about speed we only want to add the timestamp when we're running in debug mode.
        if (Config.debug) {   
            console.log(`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()} - ${message}`) 
        } else { 
            logs.pop(`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()} - ${message}`) 
        }
    },

    logOutput: function() {
        // Since we're using pop in the log function, we'll have to output the contents in reverse order. We're not concerned with speed here since this will be called after everything has cleaned up.
    },
}
