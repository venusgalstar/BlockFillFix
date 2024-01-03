var FixClient = require('./fixClient.js');

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

getDictionary("fix.4.4", function(err, dic){
    client = new FixClient("fixuat.blockfills.com", 62481, "FIX.4.4", dic, "comp_id: ", "BLOCKFILLS", {"outgoingSeqNum":"1"});
    client.createConnection(function(error, client){
        client.sendLogon({"553":"user", "554":"password", "108":30});
        client.sendMsg({"35":"0"}, function(msg){});
        // Showing Market List
        //client.sendMsg({"35":"x", "320":1, "559":4}, function(msg){console.log(msg);});

        // Send to view Feed
        /*
        client.sendMsg({"35":"V", "262":"1", "263":"1", "266":"N", "267":2, "269":"1", "146":[{"55":"ETH/USD"}]}, function(msg){
            console.log(msg);
        });
        */

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



//client.session.sendLogon(null);

//client.sendLogon(null);
//client.sendLogoff(null);


