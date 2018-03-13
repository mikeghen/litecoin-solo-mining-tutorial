// Shared private key for all coins
var ci = require('coininfo')
var CoinKey = require('coinkey')
var secureRandom = require('secure-random')
var privateKey = secureRandom.randomBuffer(32)

console.log("PRIVATE KEY: ", privateKey) // SAVE THIS!

var dogeKey = new CoinKey(privateKey, ci('DOGE'))
var ltcKey = new CoinKey(privateKey, ci('LTC'))
var viaKey = new CoinKey(privateKey, ci('VIA'))

console.log("Litecoin Public Address : ", ltcKey.publicAddress) // For mining
console.log("Litecoin Private WIF: ", ltcKey.privateWif)     // Import to wallet
console.log("Dogecoin Private WIF: ", dogeKey.privateWif)    // Import to wallet

// NOTE: For more wallet addresses, use:
// https://github.com/MichaelMure/WalletGenerator.net
