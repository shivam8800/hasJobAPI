var mongooose = require('mongoose')

var Schema = mongoose.Schema;

var JobsSchema = new Schema({
    jobtitle:{ type: String, required: true, unique: true },
    jobtype:String,
    jobcategory:String,
    joblocation:String,
    salary:Number,
    companyname:String,
    companywebsite:String,
    companydescription:String,
    skillsrequired:Array,
    jobdescription:String,
    numberofjobs:Number,
    createdat:{ type: Date, default: Date.now },
    applied: Array,
    upforinterview:Array,
	interviewed: Array,
    rejected: Array,
    selected:Array
});

const Jobs =  mongoose.model('Jobs', JobsSchema);

module.exports = Jobs;