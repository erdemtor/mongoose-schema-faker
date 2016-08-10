/**
 * Created by erdem on 10.08.16.
 */



const RandExp = require("randexp");
const illegal_keys = ["_id","__v"];
const _ = require("lodash");
function randomDate(start, end) {
    start = start || new Date(1970,1,1);
    end = end || new Date(2100,1,1);
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
class Factory {
    static checkEnumValues(specs) {
        if(specs.enumValues && specs.enumValues.length > 0){
            let randomIndex =Math.floor((Math.random() * specs.enumValues.length));
            return specs.enumValues[randomIndex];
        }
        return undefined;
    }
    static createNumber(specs){
        let Min = specs.options.min || Number.MIN_SAFE_INTEGER;
        let Max = specs.options.max || Number.MAX_SAFE_INTEGER;
        return  Min + Math.floor(Math.random() * ((Max - Min) + 1))
    }

    static createString(specs){
        let minlength = specs.options.minlength || 6;
        let maxLength = specs.options.maxlength || 30;
        let regex = new RegExp("\\w{"+minlength+","+maxLength+"}");
        return specs.options.match ? new RandExp(specs.options.match).gen() : new RandExp(regex).gen();
    }

    static createArray(specs) {
        if (specs.$isMongooseDocumentArray){ // if specs has a schema then it means in the array there are objects
            let createdArray = [];
            let randomNumber = Math.round(Math.random()*10)+1;
            for(let i = 0; i < randomNumber; i++){
                let outputValue = Factory.createObject(specs.schema.paths);;
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

    static createDate(specs){
        return randomDate()
    }

    static createObject(schema){
        let outputObject ={};
        let keys = Object.keys(schema);
        _.each(keys, function (key) {
            if(illegal_keys.indexOf(key) >= 0) return;
            let specs = schema[key];
            if(!specs.isRequired && Math.random() < 0.2) return; // if not required then p(not creating this object) ~= 0.2
            if(functionMap[specs.instance]) {
                let value = Factory.checkEnumValues(specs) || functionMap[specs.instance](specs);
                outputObject[key] = value;
                return;
            }
            throw new Error("Never seen such an instance before, are we outdated?: "+ specs.instance);

        });
        return outputObject;
    }



}
const functionMap = {
    "Array" : Factory.createArray,
    "String": Factory.createString,
    "Number": Factory.createNumber,
    "Date": Factory.createDate
};
module.exports = Factory;