var mongoose = require('mongoose')

var Schema = mongoose.Schema;

var JobsSchema = new Schema({
    jobtitle:{ type: String, required: true},
    jobtype:String,
    jobcategory:String,
    joblocation:String,
    salary:Number,
    companyname:{ type: String, required: true},
    companywebsite:String,
    companydescription:String,
    skillsrequired:Array,
    jobdescription:String,
    numberofjobs:Number,
    createdat:{ type: Date,required: true, default: Date.now },
    applied: Array,
    upforinterview:Array,
	interviewed: Array,
    rejected: Array,
    selected:Array  
});

const Jobs =  mongoose.model('Jobs', JobsSchema);

module.exports = Jobs;