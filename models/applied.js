var mongoose = require('mongoose')

var Schema = mongoose.Schema;

var AppliedSchema = new Schema({
    username:{ type: String, required: true, unique: true },
    company:[
        {   
            name:{ type: String, required: true, unique: true },
            status:String
        }
    ],
    createdat:{ type: Date, default: Date.now },
    resume:String,
    emailid:Email
});

const Applied = mongoose.model('applied', AppliedSchema);

module.exports = Applied;