import Hapi from 'hapi';
import Inert from 'inert';
import Vision from 'vision';
const server = new Hapi.Server();


server.connection({
    port:8000
});

server.register([
    Inert,
    Vision,
    {
        register:require('hapi-swagger')
    }],
    function(err){
    if(err){
        server.log(['error'], 'hapi-swagger load error: ' + err)
    }
    else{
    }
        server.log(['start'], "hapi-swagger interface loaded!")
});

server.route({
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
});

server.start(err =>{
    if (err){
        console.log(err);
    }
    console.log("you server is running at :", server.info.uri);
})