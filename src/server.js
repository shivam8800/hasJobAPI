import Hapi from 'hapi';
import Inert from 'inert';
import Vision from 'vision';
import jwt from 'jsonwebtoken'
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

server.register( require( 'hapi-auth-jwt' ), ( err ) => {
    server.auth.strategy( 'token', 'jwt', {

        key: 'vZiYpmTzqXMp8PpYXKwqc9ShQ1UhyAfy',

        verifyOptions: {
            algorithms: [ 'HS256' ],
        }

    } );
    // We move this in the callback because we want to make sure that the authentication module has loaded before we attach the routes. It will throw an error, otherwise. 
    routes.forEach( ( route ) => {
	    console.log( `attaching ${ route.path }` );
	    server.route( route );
	} );

} );

server.start(err =>{
    if (err){
        console.log(err);
    }
    console.log("you server is running at :", server.info.uri);
})