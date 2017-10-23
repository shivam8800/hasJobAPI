var mongoose = require('mongoose');
const Email = require('mongoose-type-mail');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
    firstname:String,
    lastname:String,
    username:{ type: String, required: true, unique: true },
    password:{ type: String, required: true },
    emailid:{type:Email, required:true, unique:true},
    gender:String,
    createat: { type: Date,required: true, default: Date.now },
    employers: Boolean,
    contactNumber:Number,
    resume:{type: Buffer,required: true}
});

const User = mongoose.model('User', UserSchema)

module.exports = User;