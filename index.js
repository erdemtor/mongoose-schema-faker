/**
 * Created by erdem on 8.08.16.
 */
const Factory = require("./lib/factory");
const fs = require("fs");
const Async = require("async");
const callback = function (err, res) {
    endTime = new Date().getTime();
    console.log((endTime - startTime)/1000);
    console.log(res)
};
let startTime, endTime;
Async.auto({
    "connect" : function(acb){
        require("./lib/floppy")(require("./config/config").mongooseUrl,acb)
    },
    "create": ["connect", function (result ,acb) {
       let factory = new Factory("/home/erdem/WebstormProjects/mongoose-schema-faker/model");
        startTime = new Date().getTime();
        factory.readAndCreate()
    }]
},callback);






