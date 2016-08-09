/**
 * Created by erdem on 8.08.16.
 */
const functionMap = {
    "Array" : createArray,
    "String": createString,
    "Number": createNumber
};
const illegal_keys = ["_id","__v"];
let schema = require("./model/event").schema.paths;
let _ = require("lodash");


console.log(createObject(schema));

function createNumber(){
    return Math.round(Math.random()*150);
}
function createString(specs){
    return randomString();
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
        if(functionMap[specs.instance]) {
            let value = checkEnumValues(specs) || functionMap[specs.instance](specs);
            outputObject[key] = value;
        }
    });
    return JSON.parse(JSON.stringify(outputObject));
}
function  checkEnumValues(specs) {
    if(specs.enumValues && specs.enumValues.length > 0){
        let randomIndex =Math.floor((Math.random() * specs.enumValues.length));
        return specs.enumValues[randomIndex];
    }
    return undefined;
}

function randomString()
{
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomNumber = Math.round(Math.random()*10)+1;
    for( let i=0; i < randomNumber; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}