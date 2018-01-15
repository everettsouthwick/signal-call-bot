const Config = require('./config');
const Logging = require('./logging');

module.exports = {
	formatPrice: function(price) {
		let decimalPlaces = price.length - 2;
		let formattedPrice = undefined;
		
		if (decimalPlaces <= 6) {
			formattedPrice = Math.round(price * 1000000) / 1000000;
		} else if (decimalPlaces > 8) {
			formattedPrice = parseFloat(price).toFixed(8);
		} else {
			formattedPrice = parseFloat(price).toFixed(decimalPlaces);
		}
		Logging.log(`formatPrice(): price: ${price}. formattedPrice: ${formattedPrice}.`);
		return formattedPrice;
	}
}