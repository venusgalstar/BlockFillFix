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