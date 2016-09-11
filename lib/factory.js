/**
 * Created by erdem on 10.08.16.
 */



const RandExp = require("randexp");
const illegal_keys = ["_id","__v"];
const _ = require("lodash");
const Async = require("async");
const fs = require("fs");
function randomDate(start, end) {
    start = start || new Date(1970,1,1);
    end = end || new Date(2100,1,1);
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
class Factory {
    constructor(modelOrAddress) {
        this.model = modelOrAddress; // if it is for all models then it must be an address
        let self = this;
        this.functionMap = {
            "Array" : this.createArray,
            "String": this.createString,
            "Number": this.createNumber,
            "Date": this.createDate,
            "Boolean" : this.createBoolean,
            "self" : self
        };
        this.models = {};
    }

    checkEnumValues(specs) {
        if(specs.enumValues && specs.enumValues.length > 0){
            let randomIndex =Math.floor((Math.random() * specs.enumValues.length));
            return specs.enumValues[randomIndex];
        }
        return undefined;
    }

    createNumber(specs){
        let Min = specs.options.min !== undefined ? specs.options.min:  Number.MIN_SAFE_INTEGER;
        let Max = specs.options.max !== undefined ? specs.options.max:  Number.MAX_SAFE_INTEGER;
        return  Min + Math.floor(Math.random() * ((Max - Min) + 1))
    }

    createString(specs){
        let minlength = specs.options.minlength || 6;
        let maxLength = specs.options.maxlength || 30;
        let regex = new RegExp("\\w{"+minlength+","+maxLength+"}");
        return specs.options.match ? new RandExp(specs.options.match).gen() : new RandExp(regex).gen();
    }

    createArray(specs) {
        let self = this.self;

        if (specs.$isMongooseDocumentArray){ // if specs has a schema then it means in the array there are objects
            let randomNumber = Math.round(Math.random()*10)+1;
            return self.createObject(randomNumber, null, specs.schema.paths);
        }
        else {
            let createdArray = [];
            let randomNumber = Math.round(Math.random()*10)+1;
            for(let i = 0; i < randomNumber; i++){
                let outputValue = self.functionMap[specs.caster.instance](specs.caster);
                createdArray.push(outputValue);
            }
            return createdArray;
        }
    }

    createDate(specs){
        return randomDate()
    }

    createBoolean(specs){
        return Math.random() < 0.5;
    }
    createAllObjects() {
        let array = Object.keys(this.models);
        for (let i = 0; i < array.length; i++) {
            let modelName = array[i];
            this.model = this.models[modelName];
            this.createObject(2, function () {
                console.log(modelName +" done")
                }
            ,this.models[modelName].schema.paths)

        }

    }
    createObject(howMany = 1, callback,schema = this.model.schema.paths){
        let outputObject ={};
        let keys = Object.keys(schema);
        let resultArray = [];
        if(callback){

        }
        let self = this;
        for (let i = 0; i < howMany; i++){
            outputObject ={};
            keys.forEach(function (key) {
                if(illegal_keys.indexOf(key) >= 0) return;
                let specs = schema[key];
                if(!specs.isRequired && Math.random() < 0.2) return; // if not required then p(not creating this object) ~= 0.2
                if(self.functionMap[specs.instance]) {
                    let value = self.checkEnumValues(specs) || self.functionMap[specs.instance](specs);
                    outputObject[key] = value;
                    return;
                }
                throw new Error(specs.instance+ ": Never seen such an instance before, are we outdated?");
            });
            resultArray.push(outputObject);
        }
        if(callback){
            return this.sendToDatabase(resultArray, callback)
        }
        return resultArray;
    };
    sendToDatabase(array,callback){
        let self = this;
        Async.each(array, function(element, eachCB){

            self.model.create(element, function (err, data) {

                eachCB(err, data);
            });

        }, callback);
    }

    readAndCreate(){
        let self = this;
        fs.readdirSync(this.model).forEach(function(file) {
            let path = require("path").join(self.model, file);
            let modelX = require(path);
            self.models[modelX.modelName] = modelX;
        });
        this.createAllObjects();
    }


}

module.exports = Factory;