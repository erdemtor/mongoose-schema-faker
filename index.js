/**
 * Created by erdem on 8.08.16.
 */
const functionMap = {
    "Array" : createArray,
    "String": createString,
    "Number": createNumber
};
const RandExp = require("randexp"); // must require on node
//new RandExp(/<([a-z]\w{0,20})>foo<\1>/).gen();
const illegal_keys = ["_id","__v"];
let schema = require("./model/event").schema.paths;
let _ = require("lodash");


console.log(createObject(schema));

function createNumber(specs){
    let Min = specs.options.min || Number.MIN_SAFE_INTEGER;
    let Max = specs.options.max || Number.MAX_SAFE_INTEGER;
    return  Min + Math.floor(Math.random() * ((Max - Min) + 1))
}
function createString(specs){
    return specs.options.match ? new RandExp(specs.options.match).gen() : new RandExp(/\w{6,30}/).gen();
}
function createArray(specs) {
    if (specs.$isMongooseDocumentArray){ // if specs has a schema then it means in the array there are objects
        let createdArray = [];
        let randomNumber = Math.round(Math.random()*10)+1;
        for(let i = 0; i < randomNumber; i++){
            let outputValue = createObject(specs.schema.paths);;
            createdArray.push(outputValue);
        }
        return createdArray;
    }
    else{
        let createdArray = [];
        let randomNumber = Math.round(Math.random()*10)+1;
        for(let i = 0; i < randomNumber; i++){
            let outputValue = functionMap[specs.caster.instance](specs.caster);
            createdArray.push(outputValue);
        }
        return createdArray;
    }
}
function createObject(schema){
    let outputObject ={};
    let keys = Object.keys(schema);
    _.each(keys, function (key) {
        if(illegal_keys.indexOf(key) >= 0) return;
        let specs = schema[key];
        if(!specs.isRequired && Math.random() < 0.2) return; // if not required then p(not creating this object) ~= 0.2
        if(functionMap[specs.instance]) {
            let value = checkEnumValues(specs) || functionMap[specs.instance](specs);
            outputObject[key] = value;
        }
    });
    return outputObject;
}
function  checkEnumValues(specs) {
    if(specs.enumValues && specs.enumValues.length > 0){
        let randomIndex =Math.floor((Math.random() * specs.enumValues.length));
        return specs.enumValues[randomIndex];
    }
    return undefined;
}