const vision = require('@google-cloud/vision');

var timer = 0;
setInterval(function() {
  timer++;
}, 1)

// Creates a client
const client = new vision.ImageAnnotatorClient();

/**
 * TODO(developer): Uncomment the following line before running the sample.
 */
const fileName = 'image.jpg';

// Performs text detection on the local file
client
  .textDetection(fileName)
  .then(results => {
    console.log(timer + ' Returned with API results');
    // const detections = results[0].textAnnotations;
    // console.log('Text:');
    // detections.forEach(text => console.log(text));
  })
  .catch(err => {
    console.error('ERROR:', err);
  });