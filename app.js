var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://192.168.1.21')
var PouchDB = require('pouchdb');
var db = new PouchDB('things',{revs_limit: 5,auto_compaction: true});
var _ = require('lodash')
var remoteDB = new PouchDB('http://localhost:5984/iot')
//var io = require('socket.io')(http);

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);



io.on('connection', function(socket){
  socket.on('message', function(msg){
    console.log('message: ' + msg);
    client.publish( 'bob30/hw_control' , msg ); 
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

db.sync(remoteDB, {
  live: true
}).on('change', function (change) {

}).on('error', function (err) {
    console.log('replication error')
    console.log(err)  
});






client.on('connect', function () {

    /// events i'm interested in 
    /// client_connected 
    /// client_disconnected 
    
    client.subscribe('#')     

})


client.on('message', function (topic, message) {

    /// basically this code converts from robot/sensors/battery = 5v to 
    /// { _id : 'robot', sensors : [ battery : '5v' ] }

    if (topic.includes('hw_control'))
        return; 

    let topicKeys = topic.split('/')
    let data = message.toString() 
    let _id = topicKeys.shift()

//    if (topicKeys.includes('hw_control'))
  //      return;
        

    try {
        data = JSON.parse(data) 
    } catch (e) {
        /// do not care ... its a string 
    }

    /// save in memory db    

    db.get(_id).then(function(doc) {

        _.set(doc,topicKeys.join('.'),data)        
        return db.put(doc)

    }).catch(function(err) {

        console.log('not found, creating new') 
    
        if (err.name == 'not_found') {           

            let thing = { '_id' : _id }   
            _.set(thing,topicKeys.join('.'),data)            
            return db.put(thing)            

        } else {
            console.log(err)
        }


    }).then(function(item) {


        db.get(_id).then(function(doc) {

            /// manage state 

            console.log('ready ...')
            console.log(doc)

            /// handle state 
            /// update robot 



            client.publish( doc._id + '/hw_control' , 'f' ) ; 

            setTimeout(function() {

                client.publish( doc._id + '/hw_control' , 's' ); 


                setTimeout(function() {

                    client.publish( doc._id + '/hw_control' , 'r' ); 

                    setTimeout(function() {

                        client.publish( doc._id + '/hw_control' , 's' ); 
                        
                    }, 80);


                    
                }, 80);


                
            }, 80);



        })




    }).catch(function(err) {
        console.log(err)
    })

    




})