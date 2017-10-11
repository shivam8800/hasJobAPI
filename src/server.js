import Hapi from 'hapi';
import Inert from 'inert';
import Vision from 'vision';
const server = new Hapi.Server();

import routes from './routes'

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

server.route(routes)

server.start(err =>{
    if (err){
        console.log(err);
    }
    console.log("you server is running at :", server.info.uri);
})