# Solo Litecoin Mining on Testnet
This directory contains information about setting up for mining on the Litecoin test network.

I used this as a way to test that I am properly configuring for solo mining.

Just follow the normal setup but use this for `litecoin.conf`

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
gen=0
```

You will also need a Testnet address and you will need to adjust your `server.js` file.
