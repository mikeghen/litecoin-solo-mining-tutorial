var Stratum = require('stratum-pool');

var myCoin = {
  "name": "Litecoin",
  "symbol": "LTC",
  "algorithm": "scrypt",
  "peerMagic": "fbc0b6db",
  "peerMagicTestnet": "fcc1b7dc"
};

var myAuxCoins = [{
  "name": "Dogecoin",
  "symbol": "DOGE",
  "algorithm": "scrypt",
  "peerMagic": "fbc0b6db",
  "peerMagicTestnet": "fcc1b7dc",

    /*  */
    "daemons": [
        {   //Main daemon instance
            "host": "127.0.0.1",
            "port": 2301, // **NOT ACTUAL PORT**
            "user": "dogecoinrpc",
            "password": "securepasswordfordogecoinmining"
        }
	],
}];

var pool = Stratum.createPool({

    "coin": myCoin,

    "auxes": myAuxCoins,

    // For merge mining you need to generate an address using a private key you
    // will share across all the wallets you're merge mining with.
    // See: generate-test-addresses.js
    "address": "LczqGbNvdeszU8UdVdms1p2yU9CHb1KRPe",

    "blockRefreshInterval": 1000,

    /* Some miner apps will consider the pool dead/offline if it doesn't receive anything new jobs
       for around a minute, so every time we broadcast jobs, set a timeout to rebroadcast
       in this many seconds unless we find a new job. Set to zero or remove to disable this. */
    "jobRebroadcastTimeout": 55,

    /* Some attackers will create thousands of workers that use up all available socket connections,
       usually the workers are zombies and don't submit shares after connecting. This features
       detects those and disconnects them. */
    "connectionTimeout": 600, //Remove workers that haven't been in contact for this many seconds

    /* Sometimes you want the block hashes even for shares that aren't block candidates. */
    "emitInvalidBlockHashes": false,

    /* Enable for client IP addresses to be detected when using a load balancer with TCP proxy
       protocol enabled, such as HAProxy with 'send-proxy' param:
       http://haproxy.1wt.eu/download/1.5/doc/configuration.txt */
    "tcpProxyProtocol": false,

    /* If a worker is submitting a high threshold of invalid shares we can temporarily ban their IP
       to reduce system/network load. Also useful to fight against flooding attacks. If running
       behind something like HAProxy be sure to enable 'tcpProxyProtocol', otherwise you'll end up
       banning your own IP address (and therefore all workers). */
    "banning": {
        "enabled": true,
        "time": 600, //How many seconds to ban worker for
        "invalidPercent": 50, //What percent of invalid shares triggers ban
        "checkThreshold": 500, //Check invalid percent when this many shares have been submitted
        "purgeInterval": 300 //Every this many seconds clear out the list of old bans
    },

    /* Each pool can have as many ports for your miners to connect to as you wish. Each port can
       be configured to use its own pool difficulty and variable difficulty settings. varDiff is
       optional and will only be used for the ports you configure it for. */
    "ports": {
        "3333": { //A port for your miners to connect to
            "diff": 131072, //the pool difficulty for this port
        },
        "3334": { //Another port for your miners to connect to, this port does not use varDiff
            "diff": 131072/2 //The pool difficulty
        }
    },

    /* Recommended to have at least two daemon instances running in case one drops out-of-sync
       or offline. For redundancy, all instances will be polled for block/transaction updates
       and be used for submitting blocks. Creating a backup daemon involves spawning a daemon
       using the "-datadir=/backup" argument which creates a new daemon instance with it's own
       RPC config. For more info on this see:
          - https://en.bitcoin.it/wiki/Data_directory
          - https://en.bitcoin.it/wiki/Running_bitcoind */
    // This is just for the primary coin
    "daemons": [
        {   //Main daemon instance
            "host": "127.0.0.1",
            "port": 2300,
            "user": "litecoinrpc",
            "password": "securePasswordForLitecoinDaemon"
        }
    ],


    /* This allows the pool to connect to the daemon as a node peer to receive block updates.
       It may be the most efficient way to get block updates (faster than polling, less
       intensive than blocknotify script). It requires the additional field "peerMagic" in
       the coin config. */
    // Again, this is just for the primary coin
    "p2p": {
        "enabled": false,

        /* Host for daemon */
        "host": "127.0.0.1",

        /* Port configured for daemon (this is the actual peer port not RPC port) */
        "port": 19333,

        /* If your coin daemon is new enough (i.e. not a shitcoin) then it will support a p2p
           feature that prevents the daemon from spamming our peer node with unnecessary
           transaction data. Assume its supported but if you have problems try disabling it. */
        "disableTransactions": true
    }

// This is the authorize function. Connect this to the database in your code to check if the client is valid
}, function(ip, port , workerName, password, callback){ //stratum authorization function
    console.log("Authorize " + workerName + ":" + password + "@" + ip);
    callback({
        error: null,
        authorized: true,
        disconnect: false
    });
});

/*
'data' object contains:
    job: 4, //stratum work job ID
    ip: '71.33.19.37', //ip address of client
    port: 3333, //port of the client
    worker: 'matt.worker1', //stratum worker name
    height: 443795, //block height
    blockReward: 5000000000, //the number of satoshis received as payment for solving this block
    difficulty: 64, //stratum worker difficulty
    shareDiff: 78, //actual difficulty of the share
    blockDiff: 3349, //block difficulty adjusted for share padding
    blockDiffActual: 3349 //actual difficulty for this block
    //AKA the block solution - set if block was found
    blockHash: '110c0447171ad819dd181216d5d80f41e9218e25d833a2789cb8ba289a52eee4',
    //Exists if "emitInvalidBlockHashes" is set to true
    blockHashInvalid: '110c0447171ad819dd181216d5d80f41e9218e25d833a2789cb8ba289a52eee4'
    //txHash is the coinbase transaction hash from the block
    txHash: '41bb22d6cc409f9c0bae2c39cecd2b3e3e1be213754f23d12c5d6d2003d59b1d,
    error: 'low share difficulty' //set if share is rejected for some reason
*/
pool.on('share', function(isValidShare, isValidBlock, data){

    //maincoin
    var coin = myCoin.name;
    storeShare(isValidShare, isValidBlock, data, coin);

	//loop through auxcoins
	for(var i = 0; i < myAuxCoins.length; i++) {
		coin = myAuxCoins[i].name;
		storeShare(isValidShare, isValidBlock, data, coin);
	}

});

// Don't store share... just log
function storeShare(isValidShare, isValidBlock, data, coin) {

    console.log('share data: ' + JSON.stringify(data));
}

/*
    Called when a block, auxillery or primary, is found
    coin: The symbol of the coin found. ex: 'LTC'
    blockHash: The hash of the block found and confirmed (at least for now) is in the blockchain.
*/
pool.on('block', function(coin, height, blockHash, txHash) {
    console.log('Mined block on ' + coin + ' network!');
    console.log('HEIGHT: ' + height);
    console.log('HASH: ' + blockHash);
    console.log('TX: ' + txHash);
});

/*
'severity': can be 'debug', 'warning', 'error'
'logKey':   can be 'system' or 'client' indicating if the error
            was caused by our system or a stratum client
*/
// Go ahead and combine these with your logs if you want :)
pool.on('log', function(severity, logKey, logText){
    console.log(severity + ': ' + '[' + logKey + '] ' + logText);
});

// Start the pool!
pool.start();
