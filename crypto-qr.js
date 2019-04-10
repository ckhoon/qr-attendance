"use strict"
// Nodejs encryption with CTR
const crypto = require('crypto');
//const algorithm = 'aes-256-cbc';
const algorithm = 'aes-128-cbc';
//random key everytime the server restart
const key = crypto.randomBytes(16);

function encrypt(text) {
 //let cipher = crypto.createCipher(algorithm, Buffer.from(key));
	let cipher = crypto.createCipher(algorithm, key);
	let encrypted = cipher.update(text, 'utf8', 'hex');
	encrypted += cipher.final('hex');
	return encrypted;
}

function decrypt(text) {
 let decipher = crypto.createDecipher(algorithm, key);
 let decrypted = decipher.update(text, 'hex', 'utf8');
 decrypted += decipher.final('utf8');
 return decrypted;
}

module.exports = {
	encrypt : encrypt,
	decrypt : decrypt
}