# nodeFix
Fix protocol implementation by NodeJS

# 20231218
- Added the document of FIX.4.4 protocol for Blockfill.
- Added FIX.4.4 protocol according to the document.

# 20240125 Usage
- You have to change app.js to view market data or buy/sell coins

- When you need to simplify this operation, I could do it for you.

- To print the Market data
  This code is added to show Market data.
  Here {'55':'ETH/USD_CFD'} is used for indicate the currency rate.
  
    client.sendMsg({"35":"V", "262":"1", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'ETH/USD_CFD'}]}, function(msg){});

- To send order
  You can see the commented text "Send Order" on app.js

    client.sendMsg({"35":"D", "11":"3", "60":"20231231-06:17:34.379", "54":"2", "55":"ETH/USD", "38":"0.001", "40":"1", "59":"3"}, function(msg){
      console.log(msg);
    });

  Here you could indicate the crypto with {"55":"ETH/USD"}, amount with {"38":"0.001"}, sell or buy with {"54":"2"}.

- To cancel order
  You can see the commented text "Cancel Order" on app.js

    client.sendMsg({"35":"F", "11":"2", "60":"20231231-03:17:34.379", "41":"3", "55":"ETH/USD"}, function(msg){
      console.log(msg);
    });

  Here you could indicate the crypto with {"55":"ETH/USD"}, and {"41":"3"} should be same as order id {"11":"3"}.

- Scan market prices for pairs
http://localhost:4000/get?pair=BTC/USD

The pair name should be in the pairs array: 
{"pairs":[
	{"1":"ETH/USD_CFD"},
	{"2":"BTC/USD_CFD"},
	{"3":"LTC/BTC"},
	{"4":"WAXP/USC"},
	{"5":"ETH/BTC"},
	{"6":"TUSD/USC"},
	{"7":"LTC/USD_CFD"},
	{"8":"DOGE/USC"},
	{"9":"LTC/USC"},
	{"10":"BCH/USC"},
	{"11":"XRP/JPY_CFD"},
	{"12":"XRP/JPY"},
	{"13":"XRP/USD_CFD"},
	{"14":"LTC/JPY_CFD"},
	{"15":"LTC/JPY"},
	{"16":"BCH/JPY"},
	{"17":"BCH/USD_CFD"},
	{"18":"ETH/JPY_CFD"},
	{"19":"ETH/JPY"},
	{"20":"DASH/USDC"},
	{"21":"ETH/USDC"},
	{"22":"LTC/USD"},
	{"23":"BCH/USDC"},
	{"24":"BCH/JPY_CFD"},
	{"25":"ETH/USD"},
	{"26":"DASH/USD"},
	{"27":"PAX/USDC"},
	{"28":"PAXG/USDC"},
	{"29":"XRP/USDC"},
	{"30":"DOGE/USDC"},
	{"31":"BTC/UST"},
	{"32":"TUSD/USDC"},
	{"33":"BCH/UST"},
	{"34":"WAXP/USD"},
	{"35":"DASH/USDT"},
	{"36":"USDT/USD"},
	{"37":"PAXG/USC"},
	{"38":"XRP/USDT"},
	{"39":"LTC/USDC"},
	{"40":"USDC/USD"},
	{"41":"DOGE/USDT"},
	{"42":"ALGO/USD"},
	{"43":"BTC/USD"},
	{"44":"BTC/JPY"},
	{"45":"LTC/UST"},
	{"46":"DOGE/USD"},
	{"47":"BTC/USDT"},
	{"48":"BTC/USDC"},
	{"49":"BCH/USD"},
	{"50":"ETH/USDT"},
	{"51":"ETH/UST"},
	{"52":"BCH/USDT"},
	{"53":"PAX/USC"},
	{"54":"DASH/USC"},
	{"55":"BTC/USC"},
	{"56":"XRP/UST"},
	{"57":"LTC/USDT"},
	{"58":"ETH/USC"},
	{"59":"XRP/USC"},
	{"60":"BTC/JPY_CFD"}
]}

Otherwise, it would show all pairs.