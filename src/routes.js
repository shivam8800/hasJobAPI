
const db = require('../database').db;
const Usermodel = require('../models/user');
const Joi = require('joi');


const routes =[
    {
        path:'/hasjob/user/{userid}',
        method:'GET',
        config:{
            //include this route in swagger documentation
            tags:['api'],
            description:"demo route for hello world",
            notes:"demo route",
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
    }
]

export default routes;