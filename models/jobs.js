var mongooose = require('mongoose')

var Schema = mongoose.Schema;

var JobsSchema = new Schema({
    headline:String,
    jobtype:String,
    jobcategory:String,
    joblocation:String,
    salary:Number,
    companyname:{ type: String, required: true, unique: true },
    companywebsite:String,
    companydescription:String,
    skillsrequired:Array,
    jobdescription:String,
    numberofjobs:Number,
    createdat:{ type: Date, default: Date.now }
});

const Jobs =  mongoose.model('Jobs', JobsSchema);

module.exports = Jobs;