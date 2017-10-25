
const db = require('../database').db;
const jobsModel = require('../models/jobs');
var request = require('request');
const userModel = require('../models/user');
const Joi = require('joi');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cheerio = require('cheerio');
const app     = express();



import jwt from 'jsonwebtoken';


app.get('/scrape', function(req, res){

url = 'http://www.imdb.com/title/tt1229340/';

request(url, function(error, response, html){
    if(!error){
        var $ = cheerio.load(html);

    var title, release, rating;
    var json = { title : "", release : "", rating : ""};

    $('.header').filter(function(){
        var data = $(this);
        title = data.children().first().text();            
        release = data.children().last().children().text();

        json.title = title;
        json.release = release;
    })

    $('.star-box-giga-star').filter(function(){
        var data = $(this);
        rating = data.text();

        json.rating = rating;
    })
}

// To write to the system we will use the built in 'fs' library.
// In this example we will pass 3 parameters to the writeFile function
// Parameter 1 :  output.json - this is what the created filename will be called
// Parameter 2 :  JSON.stringify(json, null, 4) - the data to write, here we do an extra step by calling JSON.stringify to make our JSON easier to read
// Parameter 3 :  callback function - a callback function to let us know the status of our function

fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){

    console.log('File successfully written! - Check your project directory for the output.json file');

})

// Finally, we'll just send out a message to the browser reminding you that this app does not have a UI.
res.send('Check your console!')

    }) ;
})

const routes =[
    {
        method:'POST',
        path:'/auth',
        config:{
            //include this route in swagger documentation
            tags:['api'],
            description:"getting details of a particular user",
            notes:"getting details of particular user",
            validate:{
                payload:{
                    username:Joi.string(),
                    password:Joi.string()
                }
            }
        },
        handler: function(request, reply){
            userModel.find({'username': request.payload.username}, function(err, data){
                if (err){
                    reply({
                        'error': err
                    });
                } else if (data.length ==0){
                    reply({
                        'data': "user does not exist!"
                    });
                } else {
                    if (request.payload.password == data[0]['password']){
                        var username =request.payload.username;
                        const token = jwt.sign({
                            username,
                            userid:data[0]['_id'],
    
                        },'vZiYpmTzqXMp8PpYXKwqc9ShQ1UhyAfy', {
                            algorithm: 'HS256',
                            expiresIn: '1h',
                        });
    
                         reply( {
                            token,
                            userid: data[0]['_id'],
                        } );
                    }
                }
            })

        }
    },
    // here we get the jobs datewise with limit 20 jobs
    {
        method:'GET',        
        path:'/hasjob/jobs/datewise/todaydate/',
        config:{
            //include this route in swagger documentation
            tags:['api'],
            description:"getting details of a particular user",
            notes:"getting details of particular user",
            auth: {
                strategy: 'token',
            }
        },
        handler: function(request, reply){
            var date = new Date();
            jobsModel.find({"createdat": {"$lt": date}}).sort({createdat: 'descending'}).limit(20).exec(function(err, data){
                if(err){
                    reply({"error": err});
                } else {
                    reply({"data": data});
                }
            });
		}
    },
    // isme last request k hisab se hum next 20 jobs return karwayenge datewise.
    {
        method:'GET',
        path:'/hasjob/jobs/datewise/{lastdate}',
        config:{
            //include this route in swagger documentation
            tags:['api'],
            description:"getting details of a particular user",
            notes:"getting details of particular user",
            validate:{
                params:{
                    lastdate:Joi.date().iso()
                }
            },
            auth: {
                strategy: 'token',
            }
        },
        handler: function(request, reply){
            var lastdate = request.params.lastdate;
            jobsModel.find({"createdat": {"$lt": lastdate}}).sort({createdat: 'descending'}).limit(20).exec(function(err, data){
                if(err){
                    reply({"error": err});
                } else {
                    reply({"data": data});
                }
            });
        }
    },
    {
        method:'GET',
        path:'/hasjob/jobs/{joblocation}/{jobtype}/{jobcategory}/{jobtitle}',
        config:{
            //include this route in swagger documentation
            tags:['api'],
            description:"getting details of a particular user",
            notes:"getting details of particular user",
            validate:{
                params:{
                    joblocation:Joi.string(),
                    jobtype:Joi.string(),
                    jobcategory:Joi.string(),
                    jobtitle:Joi.string()
                }
            },
            auth: {
                strategy: 'token',
            }
        },
        handler: function(request, reply){
            var query = {$and:[{joblocation:{$regex: request.params.joblocation, $options: 'i'}},{jobtype:{$regex: request.params.jobtype, $options: 'i'}},{jobcategory:{$regex: request.params.jobcategory, $options: 'i'}},{jobtitle:{$regex: request.params.jobtitle, $options: 'i'}}]}
            
            jobsModel.find(query,function(err, data){
                if(err){
                    reply({'error':err});
                } else {
                    reply({'date':data});
                }
            });
        }
    },
    //getting details of all companies in which user have applied
    {
        method:'GET',
        path:'/hasjob/jobs/companies/{userid}',
        config:{
            tags:['api'],
            description:'getting details of all company in which have applied',
            notes:'getting details of all company in which have applied',
            validate:{
                params:{
                    userid:Joi.string()
                }
            },
            auth: {
                strategy: 'token',
            }
        },
        handler: function(request, reply){
            jobsModel.find({'applied': request.params.userid}, function(err, data){
                if (err){
                    reply({
                        'error':err
                    });
                } else {
                    var listOfCompanies = []
                    var count = 0;
                    for (var i = 0; i<data.length; i++){
                        if (listOfCompanies.indexOf(data[i]['companyname']) > -1){
                            
                        } else {
                            listOfCompanies.push(data[i]['companyname']);
                        }
                    }
                    reply({
                        'companyName': listOfCompanies
                    });
                }
            })
        }
    },
    //getting details of all jobs in companies
    {
        method:'GET',
        path:'/hasjob/jobs/jobtitle/{userid}',
        config:{
            tags:['api'],
            description:'getting details of all jobs in companies',
            notes:'getting details of all jobs in companies',
            validate:{
                params:{
                    userid:Joi.string()
                }
            },
            auth: {
                strategy: 'token',
            }
        },
        handler:function(request, reply){
            jobsModel.find({'applied': request.params.userid}, function(err, data){
                if (err){
                    console.log(err);
                    reply({
                        'error':err
                    });
                } else {
                    var jobsDetails = []
                    for (var i=0; i <data.length; i++){
                        var oneJob ={}
                        oneJob.companyname =data[i]['companyname'];
                        oneJob.jobtitle =data[i]['jobtitle'];
                        console.log(oneJob);
                        jobsDetails.push(oneJob);
                    }
                    reply({
                        'data':jobsDetails
                    });
                }
            });
        }
    },
    // ======================put requests=================================================
    //apply for a company
    {
        method:'PUT',
        path:'/hasjob/jobs/applied/{userid}/{companyname}/{jobtitle}',
        config:{
            tags:['api'],
            description:'apply for a job',
            notes:'apply for a job',
            validate:{
                params:{
                    userid:Joi.string(),
                    companyname:Joi.string(),
                    jobtitle:Joi.string()
                }
            },
            auth: {
                strategy: 'token',
            }
        },
        handler: function(request, reply){
            var query = {$and:[{companyname:{$regex: request.params.companyname, $options: 'i'}},{jobtitle:{$regex: request.params.jobtitle, $options: 'i'}}]}
            
            jobsModel.find(query,function(err, data){
                if(err){
                    reply({'error':err});
                } else {
                    jobsModel.findOneAndUpdate(
                        { _id: data[0]['_id'] }, 
                        { $push: { applied: request.params.userid } }, function(err, updatedata){
                        if (err){
                            reply({
                                'error':error
                            });
                        } else {
                            reply({
                                'message':'succussfully applied for an job!',
                                'data':updatedata
                            });
                        }
                    });
                }
            });
        }
    },
    //call for an interview
    {
        method:'PUT',
        path:'/hasjob/jobs/upforinterview/{userid}/{companyname}/{jobtitle}',
        config:{
            tags:['api'],
            description:'go for an interview',
            notes:'go for an interview',
            validate:{
                params:{
                    userid:Joi.string(),
                    companyname:Joi.string(),
                    jobtitle:Joi.string()
                }
            },
            auth: {
                strategy: 'token',
            }
        },
        handler: function(request, reply){
            var query = {$and:[{companyname:{$regex: request.params.companyname, $options: 'i'}},{jobtitle:{$regex: request.params.jobtitle, $options: 'i'}}]}
            
            jobsModel.find(query,function(err, data){
                if(err){
                    reply({'error':err});
                } else {
                    jobsModel.findOneAndUpdate(
                        { _id: data[0]['_id'] }, 
                        { $push: { upforinterview: request.params.userid } }, function(err, updatedata){
                        if (err){
                            reply({
                                'error':error
                            });
                        } else {
                            reply({
                                'message':'succussfully call for an interview!',
                                'data':updatedata
                            });
                        }
                    });
                }
            });
        }
    },
    //interview is done
    {
        method:'PUT',
        path:'/hasjob/jobs/interviewed/{userid}/{companyname}/{jobtitle}',
        config:{
            tags:['api'],
            description:'go for an interview',
            notes:'go for an interview',
            validate:{
                params:{
                    userid:Joi.string(),
                    companyname:Joi.string(),
                    jobtitle:Joi.string()
                }
            },
            auth: {
                strategy: 'token',
            }
        },
        handler: function(request, reply){
            var query = {$and:[{companyname:{$regex: request.params.companyname, $options: 'i'}},{jobtitle:{$regex: request.params.jobtitle, $options: 'i'}}]}
            
            jobsModel.find(query,function(err, data){
                if(err){
                    reply({'error':err});
                } else {
                    jobsModel.findOneAndUpdate(
                        { _id: data[0]['_id'] }, 
                        { $push: { interviewed: request.params.userid } }, function(err, updatedata){
                        if (err){
                            reply({
                                'error':error
                            });
                        } else {
                            reply({
                                'message':'succussfully interview is done!',
                                'data':updatedata
                            });
                        }
                    });
                }
            });
        }
    },
    //for rejecting a user
    {
        method:'PUT',
        path:'/hasjob/jobs/rejected/{userid}/{companyname}/{jobtitle}',
        config:{
            tags:['api'],
            description:'go for an interview',
            notes:'go for an interview',
            validate:{
                params:{
                    userid:Joi.string(),
                    companyname:Joi.string(),
                    jobtitle:Joi.string()
                }
            },
            auth: {
                strategy: 'token',
            }
        },
        handler: function(request, reply){
            var query = {$and:[{companyname:{$regex: request.params.companyname, $options: 'i'}},{jobtitle:{$regex: request.params.jobtitle, $options: 'i'}}]}
            
            jobsModel.find(query,function(err, data){
                if(err){
                    reply({'error':err});
                } else {
                    jobsModel.findOneAndUpdate(
                        { _id: data[0]['_id'] }, 
                        { $push: { rejected: request.params.userid } }, function(err, updatedata){
                        if (err){
                            reply({
                                'error':error
                            });
                        } else {
                            reply({
                                'message':'succussfully rejected a user!',
                                'data':updatedata
                            });
                        }
                    });
                }
            });
        }
    },
    //selecting a user
    {
        method:'PUT',
        path:'/hasjob/jobs/selected/{userid}/{companyname}/{jobtitle}',
        config:{
            tags:['api'],
            description:'go for an interview',
            notes:'go for an interview',
            validate:{
                params:{
                    userid:Joi.string(),
                    companyname:Joi.string(),
                    jobtitle:Joi.string()
                }
            },
            auth: {
                strategy: 'token',
            }
        },
        handler: function(request, reply){
            var query = {$and:[{companyname:{$regex: request.params.companyname, $options: 'i'}},{jobtitle:{$regex: request.params.jobtitle, $options: 'i'}}]}
            
            jobsModel.find(query,function(err, data){
                if(err){
                    reply({'error':err});
                } else {
                    jobsModel.findOneAndUpdate(
                        { _id: data[0]['_id'] }, 
                        { $push: { selected: request.params.userid } }, function(err, updatedata){
                        if (err){
                            reply({
                                'error':error
                            });
                        } else {
                            reply({
                                'message':'succussfully rejected a user!',
                                'data':updatedata
                            });
                        }
                    });
                }
            });
        }
    },
    // user delete data with paticular id
    {
      method: 'DELETE',
      path: '/hasjob/deleteUserData/{id}',
      config: {
        // swager documention fields tags, descrioption and, note
        tags : ['api'],
        description: 'remove particular user data with his ID',
        notes: 'remove data',

        // Joi api validation
        validate: {
            params: {
                id: Joi.string().required()
            }
        },
        auth: {
            strategy: 'token',
        }
      },
      handler: function(request, reply){
        //find user data from his ID and remove data into databases.
        Usermodel.findOneAndRemove({_id: request.params.id}, function (error){
          if(error){
            reply({
              statusCode: 503,
              message: 'Error in romoving user',
              data: error
            });
          }else{
            reply({
              statusCode: 200,
              message: 'user data deleted Successfully'
            });
          }
        });
      }
    },
    // employer post new jobs 
    {
        method:'POST',
        path:'/hasjob/employerPostJobs',
        config:{
            //tags enable swagger to document api
            tags:['api'],
            description:"save user data",
            notes:"save user data",
            //we joi plugin to validate request
            validate:{
                payload:{
                    jobtitle:Joi.string().required(),
                    jobtype:Joi.string(),
                    jobcategory:Joi.string(),
                    joblocation:Joi.string(),
                    salary:Joi.number(),
                    companyname:Joi.string(),
                    companywebsite:Joi.string(),
                    companydescription:Joi.string(),
                    skillsrequired:Joi.array(),
                    jobdescription:Joi.string(),
                    numberofjobs:Joi.number(),
                    applied: Joi.array(),
                    upforinterview:Joi.array(),
                    interviewed: Joi.array(),
                    rejected: Joi.array(),
                    selected:Joi.array()
                }
            },
            auth: {
                strategy: 'token',
            }
        },
        handler: function(request, reply){
           var newJobs = new jobsModel({
                    "jobtitle": request.payload.jobtitle,
                    "jobtype":request.payload.jobtype,
                    "jobcategory": request.payload.jobcategory,
                    "joblocation": request.payload.joblocation,
                    "salary": request.payload.salary,
                    "companyname": request.payload.companyname,
                    "companywebsite": request.payload.companywebsite,
                    "companydescription": request.payload.companydescription,
                    "skillsrequired": request.payload.skillsrequired,
                    "jobdescription": request.payload.jobdescription,
                    "numberofjobs": request.payload.numberofjobs,
                    "applied": request.payload.applied,
                    "upforinterview": request.payload.upforinterview,
                    "interviewed": request.payload.interviewed,
                    "rejected": request.payload.rejected,
                    "selected": request.payload.selected
           });

           newJobs.save(function(err,data){
               if (err){
                   throw err;
                   console.log(err);
               } else if (employers === true){
                   reply({
                        statusCode: 200,
                        message: 'Jobs created Successfully',
                        data: data
                    });   
               }
           });
       }
    },
    // user get jobs with jobtitle
    {
        path:'/hasjob/getJobByJobtitle/{jobtitle}',
        method:'GET',
        config:{
            //include this route in swagger documentation
            tags:['api'],
            description:"user get job by jobtitle",
            notes:"user get jobs",
            validate:{
                //jobtitile is required field
                params:{
                    jobtitle:Joi.string().required()
                }
            },
            auth: {
                strategy: 'token',
            }
        },
        handler: (request, reply) =>{
            console.log(request.params.jobtitle);
            jobsModel.find({"jobtitle":request.params.jobtitle}, function(err, data){
                if(err){
                    reply({
                        statusCode:503,
                        message:"Failed to get data",
                        data:err
                    });
                }
                else if (data.length === 0 ){
                    console.log(data);
                    reply({
                        statusCode:200,
                        message:"Jobs does not exist",
                        data:data
                    });
                }
                else {
                    reply({
                        statusCode:200,
                        message:"jobtitle related Jobs Successfully Fetched",
                        data:data
                    });
                }
            });
        }
    },
    // user get jobs with joblocation
    {
        path:'/hasjob/getJobsByJoblocation/{joblocation}',
        method:'GET',
        config:{
            //include this route in swagger documentation
            tags:['api'],
            description:"user get job by joblocation",
            notes:"user get jobs",
            validate:{
                //id is required field
                params:{
                    joblocation:Joi.string().required()
                }
            },
            auth: {
                strategy: 'token',
            }
        },
        handler: (request, reply) =>{
            console.log(request.params.joblocation);
            jobsModel.find({"joblocation":request.params.joblocation}, function(err, data){
                if(err){
                    reply({
                        statusCode:503,
                        message:"Failed to get data",
                        data:err
                    });
                }
                else if (data.length === 0 ){
                    console.log(data);
                    reply({
                        statusCode:200,
                        message:"Jobs does not exist",
                        data:data
                    });
                }
                else {
                    reply({
                        statusCode:200,
                        message:"joblocation related Jobs Successfully Fetched",
                        data:data
                    });
                }
            });
        }
    },
    {
        path:'/hasjob/getJobsByJobcategory/{jobcategory}',
        method:'GET',
        config:{
            //include this route in swagger documentation
            tags:['api'],
            description:"user get job by jobcategory",
            notes:"user get jobs",
            validate:{
                //jobcategory is required field
                params:{
                    jobcategory:Joi.string().required()
                }
            },
            auth: {
                strategy: 'token',
            }
        },
        handler: (request, reply) =>{
            console.log(request.params.jobcategory);
            jobsModel.find({"jobcategory":request.params.jobcategory}, function(err, data){
                if(err){
                    reply({
                        statusCode:503,
                        message:"Failed to get data",
                        data:err
                    });
                }
                else if (data.length === 0 ){
                    console.log(data);
                    reply({
                        statusCode:200,
                        message:"Jobs does not exist",
                        data:data
                    });
                }
                else {
                    reply({
                        statusCode:200,
                        message:"jobcategory related Jobs Successfully Fetched",
                        data:databasesa
                    });
                }
            });
        }
    },
    {
        path:'/hasjob/getJobsByjobtype/{jobtype}',
        method:'GET',
        config:{
            //include this route in swagger documentation
            tags:['api'],
            description:"user get job by jobtype",
            notes:"user get jobs",
            validate:{
                //jobtype is required field
                params:{
                    jobtype:Joi.string().required()
                }
            },
            auth: {
                strategy: 'token',
            }
        },
        handler: (request, reply) =>{
            jobsModel.find({"jobtype":request.params.jobtype}, function(err, data){
                if(err){
                    reply({
                        statusCode:503,
                        message:"Failed to get data",
                        data:err
                    });
                }
                else if (data.length === 0 ){
                    console.log(data);
                    reply({
                        statusCode:200,
                        message:"Jobs does not exist",
                        data:data
                    });
                }
                else {
                    reply({
                        statusCode:200,
                        message:"jobtype related Jobs Successfully Fetched",
                        data:data
                    });
                }
            });
        }
    },
    {
        path:'/hasjob/getApplied/ByCompanyName/{companyname}',
        method:'GET',
        config:{
            //include this route in swagger documentation
            tags:['api'],
            description:"user get job by companyname",
            notes:"user get jobs",
            validate:{
                //jobtype is required field
                params:{
                    companyname:Joi.string().required()
                }
            },
            auth: {
                strategy: 'token',
            }
        },
        handler: (request, reply) =>{
            jobsModel.find({"companyname":request.params.companyname}, function(err, data){
                if(err){
                    reply({
                        statusCode:503,
                        message:"Failed to get data",
                        data:err
                    });
                }
                else if (data.length === 0 ){
                    console.log(data);
                    reply({
                        statusCode:200,
                        message:"Jobs does not exist",
                        data:data
                    });
                }
                else {
                    reply({
                        statusCode:200,
                        message:"companyname related applied user Successfully Fetched",
                        data:data[0]["applied"]
                    });
                }
            });
        }
    },
    // get rejected list by company name
    {
        path:'/hasjob/getrejectedList/ByCompanyName/{companyname}',
        method:'GET',
        config:{
            //include this route in swagger documentation
            tags:['api'],
            description:"employers get rejected users companyname",
            notes:"user get jobs",
            validate:{
                //jobtype is required field
                params:{
                    companyname:Joi.string().required()
                }
            },
            auth: {
                strategy: 'token',
            }
        },
        handler: (request, reply) =>{
            jobsModel.find({"companyname":request.params.companyname}, function(err, data){
                if(err){
                    reply({
                        statusCode:503,
                        message:"Failed to get data",
                        data:err
                    });
                }
                else if (data.length === 0 ){
                    console.log(data);
                    reply({
                        statusCode:200,
                        message:"Jobs does not exist",
                        data:data
                    });
                }
                else {
                    reply({
                        statusCode:200,
                        message:"companyname related applied user Successfully Fetched",
                        data:data[0]["rejected"]
                    });
                }
            });
        }
    },
    {
        path:'/hasjob/getinterviewedList/ByCompanyName/{companyname}',
        method:'GET',
        config:{
            //include this route in swagger documentation
            tags:['api'],
            description:"employers get rejected users companyname",
            notes:"user get jobs",
            validate:{
                //jobtype is required field
                params:{
                    companyname:Joi.string().required()
                }
            },
            auth: {
                strategy: 'token',
            }
        },
        handler: (request, reply) =>{
            jobsModel.find({"companyname":request.params.companyname}, function(err, data){
                if(err){
                    reply({
                        statusCode:503,
                        message:"Failed to get data",
                        data:err
                    });
                }
                else if (data.length === 0 ){
                    console.log(data);
                    reply({
                        statusCode:200,
                        message:"Jobs does not exist",
                        data:data
                    });
                }
                else {
                    reply({
                        statusCode:200,
                        message:"companyname related applied user Successfully Fetched",
                        data:data[0]["interviewed"]
                    });
                }
            });
        }
    },
    {
        path:'/hasjob/getUpForinterviewList/ByCompanyName/{companyname}',
        method:'GET',
        config:{
            //include this route in swagger documentation
            tags:['api'],
            description:"employers get rejected users companyname",
            notes:"user get jobs",
            validate:{
                //jobtype is required field
                params:{
                    companyname:Joi.string().required()
                }
            },
            auth: {
                strategy: 'token',
            }
        },
        handler: (request, reply) =>{
            jobsModel.find({"companyname":request.params.companyname}, function(err, data){
                if(err){
                    reply({
                        statusCode:503,
                        message:"Failed to get data",
                        data:err
                    });
                }
                else if (data.length === 0 ){
                    console.log(data);
                    reply({
                        statusCode:200,
                        message:"Jobs does not exist",
                        data:data
                    });
                }
                else {
                    reply({
                        statusCode:200,
                        message:"companyname related applied user Successfully Fetched",
                        data:data[0]["upforinterview"]
                    });
                }
            });
        }
    },
    {
        path:'/hasjob/getSelectedList/ByCompanyName/{companyname}',
        method:'GET',
        config:{
            //include this route in swagger documentation
            tags:['api'],
            description:"employers get rejected users companyname",
            notes:"user get jobs",
            validate:{
                //jobtype is required field
                params:{
                    companyname:Joi.string().required()
                }
            },
            auth: {
                strategy: 'token',
            }
        },
        handler: (request, reply) =>{
            jobsModel.find({"companyname":request.params.companyname}, function(err, data){
                if(err){
                    reply({
                        statusCode:503,
                        message:"Failed to get data",
                        data:err
                    });
                }
                else if (data.length === 0 ){
                    console.log(data);
                    reply({
                        statusCode:200,
                        message:"Jobs does not exist",
                        data:data
                    });
                }
                else {
                    reply({
                        statusCode:200,
                        message:"companyname related applied user Successfully Fetched",
                        data:data[0]["selected"]
                    });
                }
            });
        }
    },
    // new user post 
    {
        path: '/hasjob/postNew/user',
        method: 'POST',
        config: {
            tags: ['api'],
            description: 'Post New User With His Full Details',
            notes: 'Post New User',
            // we joi plugin to validate request
            validate:{
              payload:{
                    firstname:Joi.string().required(),
                    lastname:Joi.string(),
                    username:Joi.string().required(),
                    password:Joi.string().required(),
                    emailid:Joi.string().required(),
                    gender:Joi.string(),
                    employers:Joi.boolean(),
                    contactNumber:Joi.number(),
                }
            }
        },
        handler: function(request, reply){
           var newUser = new Usermodel({
               "firstname" : request.payload.firstname,
               "lastname" : request.payload.lastname,
               "username" : request.payload.username,
               "password" : request.payload.password,
               "emailid" : request.payload.emailid,
               "gender" : request.payload.gender,
               "createat":new Date(),
               "employers" : request.payload.employers,
               "contactNumber" : request.payload.contactNumber,
           });

           newUser.save(function(err, data){
               if (err){
                   throw err;
                   console.log(err);
               } else{
                   reply({
                        statusCode: 200,
                        message: 'User created Successfully',
                        data: data
                    });   
               }
           });
       }
    },
    //for uploading a resume
    {
        method: 'POST',
        path: '/submit',
        config: {
    
            payload: {
                output: 'stream',
                parse: true,
                allow: 'multipart/form-data'
            },
            auth: {
                strategy: 'token',
            },
    
            handler: function (request, reply) {
                var data = request.payload;
                if (data.resume) {
                    var name = request.auth.credentials.username + ".pdf";
                    const __dirname = '/home/navgurukul/Desktop/project/Nodejs/hasJobAPI/hasJobAPI'
                    var path = __dirname + "/uploads/" + name;
                    var file = fs.createWriteStream(path);
    
                    file.on('error', function (err) { 
                        console.error(err) 
                    });
    
                    data.resume.pipe(file);
    
                    data.resume.on('end', function (err) {
                        var ret = {
                            filename: request.auth.credentials.username + ".pdf",
                            headers: data.resume.hapi.headers
                        }
                        reply(JSON.stringify(ret));
                    })
                }
    
            }
        }
    },
        
    //showing  resume file
    {
        method: 'GET',
        path: '/file/{username}',
        config:{
            validate:{
                params:{
                    username:Joi.string()
                }
            }
        },
        handler: function(request,reply){
            const __dirname = '/home/navgurukul/Desktop/project/Nodejs/hasJobAPI/hasJobAPI/uploads'
            var file = path.join(__dirname, request.params.username + ".pdf");

            fs.readFile(file , function (err,data){
                return reply(data)
                .header('Content-disposition', 'attachment; filename=' + request.params.username + ".pdf")
            });

        }   
    },
    // user update data with user ID
    {
      method: 'PUT',
      path: '/hasjob/updateUser/{id}',
      config: {
        // swager documention fields tags, descrioption and, note
        tags: ['api'],
        description: 'Update specific user data',
        notes: 'Update specific user data',

        // Joi api validation
        validate: {
          params: {
            // `id` is required field and can accepte string data
            id: Joi.string().required()
          },
          payload: {
                    firstname:Joi.string().required(),
                    lastname:Joi.string(),
                    username:Joi.string().required(),
                    password:Joi.string().required(),
                    emailid:Joi.string().required(),
                    gender:Joi.string(),
                    employers:Joi.boolean(),
                    contactNumber:Joi.number(),
          }
        }
      },
      handler: function(request, reply) {
        // find user with his id and update user data
        Usermodel.findOneAndUpdate({_id: request.params.id}, request.payload, function (error, data) {
          if(error){
            reply({
              statusCode: 503,
              message: 'Failed to get data',
              data: error
            });
          }else{
            reply({
              statusCode: 200,
              message: 'User Update Successfully',
              data: data
            });
          }
        });
      }
    }
]

export default routes;

