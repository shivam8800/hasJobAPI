
const db = require('../database').db;
const jobsModel = require('../models/jobs');
const userModel = require('../models/user');
const Joi = require('joi');

import jwt from 'jsonwebtoken';

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
    }
]

export default routes;