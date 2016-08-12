/**
 * Created by erdem on 8.08.16.
 */
const Factory = require("./lib/factory");
const fs = require("fs");
const Async = require("async");
let model = require("./model/tag");
let schema = model.schema.paths;
const callback = function (err, res) {
    console.log(err + " "+ res);
};
Async.auto({
    "connect" : function(acb){
        require("./lib/floppy")(require("./config/config").mongooseUrl,acb)
    },
    "create": ["connect", function (result ,acb) {
       let factory = new Factory(model);
        factory.createObject(schema,100000,acb);
    }]
},callback);






