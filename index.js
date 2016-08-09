/**
 * Created by erdem on 8.08.16.
 */
const functionMap = {
    "Array" : createArray,
    "String": createString
};
const illegal_keys = ["_id","__v"];
let schema = require("./model/university").schema.paths;
let _ = require("lodash");


createObject(schema);


function createString(specs){
    return randomString();
}
function createArray(specs) {
    if (specs.$isMongooseDocumentArray){ // if specs has a schema then it means in the array there are objects

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
    let keys = Object.keys(schema);
    _.each(keys, function (key) {
        if(illegal_keys.indexOf(key) >= 0) return;
        let specs = schema[key];
        console.log(key);
        if(functionMap[specs.instance])
            console.log(functionMap[specs.instance](specs));

    });
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