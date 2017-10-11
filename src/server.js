import Hapi from 'hapi';

const server = new Hapi.Server();


server.connection({
    port:8000
});

server.route({
    path:'/',
    method:'GET',
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