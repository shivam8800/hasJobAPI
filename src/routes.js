
const db = require('../database').db;
const Usermodel = require('../models/user');
const Joi = require('joi');
const Jobsmodel = require('../models/jobs');


const routes =[
            // get user data with user id
    {
        path:'/hasjob/user/{userid}',
        method:'GET',
        config:{
            //include this route in swagger documentation
            tags:['api'],
            description:"get user data with user id",
            notes:"route for get user data with id",
            validate:{
				//id is required field
				params:{
				    userid:Joi.string().required()
				}
			}
        },
        handler: (request, reply) =>{
            console.log(request.params.userid);
            Usermodel.find({_id:request.params.userid}, function(err, data){
                if(err){
					reply({
						statusCode:503,
						message:"Failed to get data",
						data:err
					});
				}
				else if (data.length == 0 ){
                    console.log(data);
					reply({
						statusCode:200,
						message:"user does not exist",
						data:data
					});
				}
				else {
					reply({
						statusCode:200,
						message:"data user Successfully Fetched",
    						data:data
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
                    resume:Joi.string()
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
               "resume" : request.payload.resume
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
                    resume:Joi.string()
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
            }
        },
        handler: function(request, reply){
           var newJobs = new Jobsmodel({
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
            }
        },
        handler: (request, reply) =>{
            console.log(request.params.jobtitle);
            Jobsmodel.find({"jobtitle":request.params.jobtitle}, function(err, data){
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
            }
        },
        handler: (request, reply) =>{
            console.log(request.params.joblocation);
            Jobsmodel.find({"joblocation":request.params.joblocation}, function(err, data){
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
            }
        },
        handler: (request, reply) =>{
            console.log(request.params.jobcategory);
            Jobsmodel.find({"jobcategory":request.params.jobcategory}, function(err, data){
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
            }
        },
        handler: (request, reply) =>{
            Jobsmodel.find({"jobtype":request.params.jobtype}, function(err, data){
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
            }
        },
        handler: (request, reply) =>{
            Jobsmodel.find({"companyname":request.params.companyname}, function(err, data){
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
            }
        },
        handler: (request, reply) =>{
            Jobsmodel.find({"companyname":request.params.companyname}, function(err, data){
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
            }
        },
        handler: (request, reply) =>{
            Jobsmodel.find({"companyname":request.params.companyname}, function(err, data){
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
            }
        },
        handler: (request, reply) =>{
            Jobsmodel.find({"companyname":request.params.companyname}, function(err, data){
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
            }
        },
        handler: (request, reply) =>{
            Jobsmodel.find({"companyname":request.params.companyname}, function(err, data){
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
    }
]

export default routes;