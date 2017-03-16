db = require('../db');

// interruption signal control
process.on('SIGINT', function(){  
    console.log('\nInterruption signal received.'); 
    db.connection.close(function(){ 
        console.log('Database disconnected.');
        process.exit(0); 
    }); 
    console.log('Exiting....');
}); 
