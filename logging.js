const fs = require('fs');
const Config = require('./config');

var logs = [];

module.exports = {
    log: function(message) {
        // If we're running in debug mode, we want to prepend the timestamp to see how fast our bot operates. This is not necessary in production, and adds an unncessary hindrance on performance.
        if (Config.debug) {   
            let date = new Date();
            let logString = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()} ${message}`;
            console.log(logString) 
            logs.pop(logString)
        }
        // Otherwise, we'll just add the original message to the logs array.
        else { 
            logs.pop(message) 
        }
    },

    logOutput: function() {
        // Since we're using pop in the log function, we'll have to output the contents in reverse order. We're not concerned with speed here since this will be called after everything has cleaned up.
        let filePath = `./logs/${Date.now()}-log.txt`;
        let output = logs.reverse().join('\n');

        fs.writeFile(filePath, output, function(error) { 
            if (error) return console.error(error);
            console.log(`Logs have been saved to ${filePath}.`);
        });
    },
}

