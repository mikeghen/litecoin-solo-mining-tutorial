# Merge Mining on Dogecoin and Litecoin Testnet
This directory contains information about testing merge mining on the Litecoin and Dogecoin test networks.

I used this as a way to test that merge mining is working with this codebase.

## Setup Daemons
The first step involves installing the Daemons on the server.

### Litecoin
1. Download and extract Litecoin Core:
```
cd /opt
wget https://download.litecoin.org/litecoin-0.14.2/linux/litecoin-0.14.2-x86_64-linux-gnu.tar.gz
tar -xvzf litecoin-0.14.2-x86_64-linux-gnu.tar.gz
rm -rf litecoin-0.14.2-x86_64-linux-gnu.tar.gz
cd /opt/litecoin-0.14.2
```
2. Edit the config file:
```
mkdir /dogetest
vi /dogetest/dogecoin.conf
```
**Sample Litecoin Testnet Daemon Configuration**
```
datadir=/ltctest    # Keep data isolated
testnet=1           # Tell the daemon to use the testnet

# RPC commands so NOMP can connect for mining
rpcuser=litecointestrpc
rpcpassword=pickASecureTestPassword
rpcport=2300
daemon=1
server=1
gen=1
```
3. Start the daemon:
```
bin/litecoind -datadir="/ltctest"
```
4. Confirm its running:
```
bin/litecoin-cli -datadir="/ltctest" getinfo
```
:star: Remember to use `-datadir` on all Litecoin CLI calls when working with test.
### Dogecoin
```
cd /opt
wget https://github.com/dogecoin/dogecoin/releases/download/v1.10.0/dogecoin-1.10.0-linux64.tar.gz
tar -xvzf dogecoin-1.10.0-linux64.tar.gz
rm -rf dogecoin-1.10.0-linux64.tar.gz
cd /opt/dogecoin-1.10.0
```
Edit the config file:
```
mkdir /dogetest
vi /dogetest/dogecoin.conf
```
**Sample Dogecoin Testnet Daemon Configuration**
```
datadir=/dogetest    # Keep data isolated
testnet=1           # Tell the daemon to use the testnet

# RPC commands so NOMP can connect for mining
rpcuser=dogecointestrpc
rpcpassword=pickASecureTestPassword
rpcport=2301
daemon=1
server=1
gen=1
```
Start the daemon:
```
cd /opt/dogecoin-1.10.0
bin/dogecoind -datadir="/dogetest"
```
Confirm its running:
```
bin/dogecoin-cli -datadir="/dogetest" getinfo
```
:star: Remember to use `-datadir` on all Dogecoin CLI calls when working with test.

## Generating Merge Mining Addresses
This example will generate a testnet address for Litecoin and Dogecoin using the same private key. Apparently this is how we merge mine (maybe?).

First, install some Node.js Packages.

```javascript
// Shared private key for all coins
var ci = require('coininfo')
var CoinKey = require('coinkey')
var secureRandom = require('secure-random')
var privateKey = secureRandom.randomBuffer(32)

console.log("PRIVATE KEY: ", privateKey) // SAVE THIS!

var dogeKey = new CoinKey(privateKey, ci('DOGE-TEST'))
var ltcKey = new CoinKey(privateKey, ci('LTC-TEST'))

console.log("Litecoin Public Address : ", ltcKey.publicAddress) // For mining
console.log("Litecoin Private WIF: ", ltcKey.privateWif)     // Import to wallet
console.log("Dogecoin Private WIF: ", dogeKey.privateWif)    // Import to wallet
```
You will be able to import the Private WIF (which means Wallet Import Format) using these commands:
```
/opt/litecoin-0.14.2/bin/litecoin-cli -datadir="/ltctest" importprivkey "cTv1M7ZBveUkByFPkhmfzFANuB5pN94UC2Q4zir1nDDZV9goLxoe"
/opt/dogecoin-1.10.0/bin/dogecoin-cli -datadir="/dogetest" importprivkey "cm5GVSGzGxK291GvrrZTabMMQ3V82ybvWueL7dYCmAiz3ozaPZYq"
```
:information_source: I don't know why but one time this command took a very long time to import... so be patient after you run these commands.

## Setup Stratum Server for Merge Mining
You will also need a Testnet address and you will need to adjust your `server.js` file. See my example file.
