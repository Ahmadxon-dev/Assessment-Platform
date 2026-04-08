const {Schema, model} = require("mongoose");


const personSchema = new Schema({
    email:{type:String, required:true, unique:true},
    password: {type:String, required:true},
    name: {type:String, required:true},
    role: {type: String, enum: ["admin", "user", "bosh admin"], default:"user", required: true},
    isAbleToChangeRoles: {type: Boolean, default: false},
}, {timestamps:true, collection: "Users"})

personSchema.pre('save', function (next) {
    if (this.isNew) { // Only run logic on new documents (not updates)
        if (this.role === 'admin') {
        } else if (this.role === 'bosh admin') {
            this.isAbleToChangeRoles = true;
        } else if (this.role === 'user') {
            this.isAbleToChangeRoles = false;
        }
    }
    next();
});

module.exports = model( "Person", personSchema)