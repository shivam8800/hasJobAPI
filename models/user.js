var mongoose = require('mongoose');
const Email = require('mongoose-type-mail');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
    firstname:String,
    lastname:String,
    username:{ type: String, required: true, unique: true },
    password:{ type: String, required: true },
    emailid:Email,
    gender:String,
    createat: { type: Date, default: Date.now },
    employers: Boolean,
    contactNumber:{ type: Number },
    resume:String
}); 

const User = mongoose.model('User', UserSchema)

module.exports = User;