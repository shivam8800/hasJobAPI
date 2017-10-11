
const db = require('../database').db;

const routes =[
    {
        path:'/hello',
        method:'GET',
        config:{
            //include this route in swagger documentation
            tags:['api'],
            description:"demo route for hello world",
            notes:"demo route"
        },
        handler: (request, reply) =>{
            reply('Hello world!')
        }
    }
]

export default routes;