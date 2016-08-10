/**
 * Created by erdem on 8.08.16.
 */
const Factory = require("./lib/factory");
let schema = require("./model/university").schema.paths;
console.log(Factory.createObject(schema));






