/**
 * Created by erdem on 10.08.16.
 */



const RandExp = require("randexp");
const illegal_keys = ["_id","__v"];
const _ = require("lodash");
const Async = require("async");
function randomDate(start, end) {
    start = start || new Date(1970,1,1);
    end = end || new Date(2100,1,1);
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
class Factory {
       constructor(model) {
        this.model = model;
        this.functionMap = {
            "Array" : this.createArray,
            "String": this.createString,
            "Number": this.createNumber,
            "Date": this.createDate,
            "Boolean" : this.createBoolean
        };
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
        if (specs.$isMongooseDocumentArray){ // if specs has a schema then it means in the array there are objects
            let randomNumber = Math.round(Math.random()*10)+1;
            return this.createObject(specs.schema.paths, randomNumber);
        }
        else{
            let createdArray = [];
            let randomNumber = Math.round(Math.random()*10)+1;
            for(let i = 0; i < randomNumber; i++){
                let outputValue = this.functionMap[specs.caster.instance](specs.caster);
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

    createObject(schema, howMany = 1, callback){
        let outputObject ={};
        let keys = Object.keys(schema);
        let resultArray = [];
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
                throw new Error("Never seen such an instance before, are we outdated?: "+ specs.instance);

            });
            resultArray.push(outputObject);
        }
        if(callback){
            this.sendToDatabase(resultArray, callback)
        }
        return resultArray;
    };

    sendToDatabase(array,callback){
        let self = this;
        Async.each(array, function(element, eachCB){
            self.model.create(element, eachCB);

        }, callback);
    }


}

module.exports = Factory;