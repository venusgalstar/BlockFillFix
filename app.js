const express = require("express");
var FixClient = require('./fixClient.js');
var cors = require('cors')
const bodyParser = require("body-parser");

var fs = require('fs');
var moment = require('moment');
var path = require('path');

var dictPath = require("path").join(__dirname, "dict");

var uuid = exports.uuid = function() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

var randomString = exports.randomString = function(seed, length){
    var text = "";
    var possible = seed == undefined ? "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789" : seed;

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

var randomDouble = exports.randomDouble = function(min, max, round) {
    return (Math.random() < 0.5 ? ((1-Math.random()) * (max-min) + min) : (Math.random() * (max-min) + min)).toFixed(round == undefined ? 2 : round);
}

var getDictionary  = exports.getDictionary = function(dict_file_name, cb) {
    fs.readFile(dictPath+'/'+dict_file_name+'.json', 'utf8', function (err, data) {
        if (err) cb(err, null);
        else {
            var dict_data = JSON.parse(data);
            cb(null, loadSpec(dict_data));
        }
    });
}

var loadSpec = function(dict_data) {
    if ('header' in dict_data.fix) {
        _loadFields(dict_data, dict_data.fix.header.field);
    }

    if ('trailer' in dict_data.fix) {
        _loadFields(dict_data, dict_data.fix.trailer.field);
    }

    dict_data.fix.messages.message.forEach(function(message) {
        _loadFields(dict_data, message.field);
        if ('group' in message) {
            _loadGroups(dict_data, message.group);
        }
        if ('component' in message) {
            _loadComponents(dict_data, message.component);
        }
    });

    return dict_data;
}

var _loadFields = function(protocol_data, fields) {
    if(!fields)
        return;
    if (Array.isArray(fields)) {
        fields.forEach(function(field) {
            var f = protocol_data.fix.fields.field.filter(function(o) { return o._name == field._name})[0];
            for(key in f) {
                if (f.hasOwnProperty(key)) {
                    field[key] = f[key];
                }
            }
        });
    } else {
        var f = protocol_data.fix.fields.field.filter(function(o) { return o._name == fields._name})[0];
        for(key in f) {
            if (f.hasOwnProperty(key)) {
                fields[key] = f[key];
            }
        }
    }
}

var _loadGroups = function(protocol_data, group) {
    if (Array.isArray(group)) {
        group.forEach(function(gp) {
            var g = protocol_data.fix.fields.field.filter(function(o) { return o._name == gp._name})[0];
            for(key in g) {
                if (g.hasOwnProperty(key)) {
                    gp[key] = g[key];
                }
            }

            if ('field' in gp) {
                _loadFields(protocol_data, gp.field);
            }

            if ('group' in gp) {
                _loadGroups(protocol_data, gp.group);
            }

            if ('component' in gp) {
                _loadComponents(protocol_data, gp.component);
            }
        });
    } else {
        var g = protocol_data.fix.fields.field.filter(function(o) { return o._name == group._name})[0];

        for(key in g) {
            if (g.hasOwnProperty(key)) {
                group[key] = g[key];
            }
        }

        if ('field' in group) {
            _loadFields(protocol_data, group.field);
        }

        if ('group' in group) {
            _loadGroups(protocol_data, group.group);
        }

        if ('component' in group) {
            _loadComponents(protocol_data, group.component);
        }
    }
}

var _loadComponents = function(protocol_data, components) {
    if (Array.isArray(components)) {
        components.forEach(function(component) {

            var comp = protocol_data.fix.components.component.filter(function(o) { return o._name == component._name})[0];

            for(key in comp) {
                if (comp.hasOwnProperty(key)) {
                    component[key] = comp[key];
                }
            }

            if ('field' in component) {
                _loadFields(protocol_data, component.field);
            }

            if ('group' in component) {
                _loadGroups(protocol_data, component.group);
            }

            if ('component' in component) {
                _loadComponents(protocol_data, component.component);
            }
        });
    } else {
        var comp = protocol_data.fix.components.component.filter(function(o) { return o._name == components._name})[0];
        for(key in comp) {
            if (comp.hasOwnProperty(key)) {
                components[key] = comp[key];
            }
        }

        if ('field' in components) {
            _loadFields(protocol_data, components.field);
        }

        if ('group' in components) {
            _loadGroups(protocol_data, components.group);
        }

        if ('component' in components) {
            _loadComponents(protocol_data, components.component);
        }
    }

}

global.fixValues = [];

getDictionary("fix.4.4", function(err, dic){
    client = new FixClient("fixuat.blockfills.com", 62481, "FIX.4.4", dic, "SPDY_SWISS_ALPHA_UAT", "BLOCKFILLS", {"outgoingSeqNum":"1"});
    client.createConnection(function(error, client){
        client.sendLogon({"553":"spdyswiss", "554":"spdyswiss", "108":30});
        client.sendMsg({"35":"0"}, function(msg){});
        // Showing Market List
        //client.sendMsg({"35":"x", "320":1, "559":4}, function(msg){console.log(msg);});

        // Send to view Feed
        client.sendMsg({"35":"V", "262":"1", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'ETH/USD_CFD'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"2", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'BTC/USD_CFD'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"3", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'LTC/BTC'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"4", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'WAXP/USC'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"5", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'ETH/BTC'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"6", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'TUSD/USC'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"7", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'LTC/USD_CFD'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"8", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'DOGE/USC'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"9", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'LTC/USC'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"10", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'BCH/USC'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"11", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'XRP/JPY_CFD'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"12", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'XRP/JPY'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"13", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'XRP/USD_CFD'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"14", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'LTC/JPY_CFD'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"15", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'LTC/JPY'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"16", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'BCH/JPY'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"17", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'BCH/USD_CFD'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"18", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'ETH/JPY_CFD'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"19", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'ETH/JPY'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"20", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'DASH/USDC'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"21", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'ETH/USDC'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"22", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'LTC/USD'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"23", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'BCH/USDC'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"24", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'BCH/JPY_CFD'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"25", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'ETH/USD'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"26", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'DASH/USD'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"27", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'PAX/USDC'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"28", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'PAXG/USDC'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"29", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'XRP/USDC'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"30", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'DOGE/USDC'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"31", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'BTC/UST'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"32", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'TUSD/USDC'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"33", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'BCH/UST'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"34", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'WAXP/USD'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"35", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'DASH/USDT'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"36", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'USDT/USD'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"37", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'PAXG/USC'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"38", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'XRP/USDT'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"39", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'LTC/USDC'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"40", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'USDC/USD'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"41", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'DOGE/USDT'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"42", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'ALGO/USD'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"43", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'BTC/USD'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"44", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'BTC/JPY'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"45", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'LTC/UST'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"46", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'DOGE/USD'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"47", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'BTC/USDT'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"48", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'BTC/USDC'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"49", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'BCH/USD'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"50", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'ETH/USDT'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"51", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'ETH/UST'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"52", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'BCH/USDT'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"53", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'PAX/USC'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"54", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'DASH/USC'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"55", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'BTC/USC'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"56", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'XRP/UST'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"57", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'LTC/USDT'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"58", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'ETH/USC'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"59", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'XRP/USC'}]}, function(msg){});
        client.sendMsg({"35":"V", "262":"60", "263":"1", "266":"N", "267":2, "269":"1", "146":[{'55':'BTC/JPY_CFD'}]}, function(msg){});

        setInterval(function() {
            client.sendMsg({"35":"0"}, function(msg){});
        }, 30000);
        
        // Send Order
        /*
        client.sendMsg({"35":"D", "11":"3", "60":"20231231-06:17:34.379", "54":"2", "55":"ETH/USD", "38":"0.001", "40":"1", "59":"3"}, function(msg){
            console.log(msg);
        });
        */

        // Cancel Order
        /*
        client.sendMsg({"35":"F", "11":"2", "60":"20231231-03:17:34.379", "41":"3", "55":"ETH/USD"}, function(msg){
            console.log(msg);
        });
        */
    });
});

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

app.listen(4000,() => console.log("Server listening at port 4000"));

app.get("/get", (req, resp, next) => {
    const { pair } = req.query;
    if(global.fixValues[pair])
        resp.send(global.fixValues[pair]);
    else
    {
        var pairs = [{ '1': 'ETH/USD_CFD' }, { '2': 'BTC/USD_CFD' }, { '3': 'LTC/BTC' },
        { '4': 'WAXP/USC' },    { '5': 'ETH/BTC' },     { '6': 'TUSD/USC' },
        { '7': 'LTC/USD_CFD' }, { '8': 'DOGE/USC' },    { '9': 'LTC/USC' },
        { '10': 'BCH/USC' },     { '11': 'XRP/JPY_CFD' }, { '12': 'XRP/JPY' },
        { '13': 'XRP/USD_CFD' }, { '14': 'LTC/JPY_CFD' }, { '15': 'LTC/JPY' },
        { '16': 'BCH/JPY' },     { '17': 'BCH/USD_CFD' }, { '18': 'ETH/JPY_CFD' },
        { '19': 'ETH/JPY' },     { '20': 'DASH/USDC' },   { '21': 'ETH/USDC' },
        { '22': 'LTC/USD' },     { '23': 'BCH/USDC' },    { '24': 'BCH/JPY_CFD' },
        { '25': 'ETH/USD' },     { '26': 'DASH/USD' },    { '27': 'PAX/USDC' },
        { '28': 'PAXG/USDC' },   { '29': 'XRP/USDC' },    { '30': 'DOGE/USDC' },
        { '31': 'BTC/UST' },     { '32': 'TUSD/USDC' },   { '33': 'BCH/UST' },
        { '34': 'WAXP/USD' },    { '35': 'DASH/USDT' },   { '36': 'USDT/USD' },
        { '37': 'PAXG/USC' },    { '38': 'XRP/USDT' },    { '39': 'LTC/USDC' },
        { '40': 'USDC/USD' },    { '41': 'DOGE/USDT' },   { '42': 'ALGO/USD' },
        { '43': 'BTC/USD' },     { '44': 'BTC/JPY' },     { '45': 'LTC/UST' },
        { '46': 'DOGE/USD' },    { '47': 'BTC/USDT' },    { '48': 'BTC/USDC' },
        { '49': 'BCH/USD' },     { '50': 'ETH/USDT' },    { '51': 'ETH/UST' },
        { '52': 'BCH/USDT' },    { '53': 'PAX/USC' },     { '54': 'DASH/USC' },
        { '55': 'BTC/USC' },     { '56': 'XRP/UST' },     { '57': 'LTC/USDT' },
        { '58': 'ETH/USC' },     { '59': 'XRP/USC' },     { '60': 'BTC/JPY_CFD' }];

        resp.send({"pairs" : pairs});
    }
});