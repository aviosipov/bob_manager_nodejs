var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://192.168.1.21')
var PouchDB = require('pouchdb');
var db = new PouchDB('things');
var _ = require('lodash')

client.on('connect', function () {

    /// events i'm interested in 
    /// client_connected 
    /// client_disconnected 
    
    client.subscribe('#') 
    

})

client.on('message', function (topic, message) {

    /// basically this code converts from robot/sensors/battery = 5v to 
    /// { _id : 'robot', sensors : [ battery : '5v' ] }

    let topicKeys = topic.split('/')
    let data = message.toString() 
    let _id = topicKeys.shift()

    try {
        data = JSON.parse(data) 
    } catch (e) {
        /// do not care ... its a string 
    }
   

    /// save in memory db    

    db.get(_id).then(function(doc) {


        _.set(doc,topicKeys.join('.'),data)
        
        console.log('----------------- about to save -----------------')
        console.log(doc)
        console.log('----------------- about to save -----------------')

        return db.put(doc)

    }).then(function() {

        console.log('updated!')      


    }).then(function(){

        db.allDocs({include_docs: true}).then(function(result) {

            result.rows.forEach(function(item) {

                console.log(item.doc) 

            })

            
            
        }).catch(function (err) {
            
            console.log(err)
        })

    }).catch(function(err) {

        console.log('not found, creating new') 
    
        if (err.name == 'not_found') {           

            let thing = { '_id' : _id }   
            _.set(thing,topicKeys.join('.'),data)            
            return db.put(thing)            

        } else {
            console.log(err)
        }


    }).catch(function(err) {
        console.log(err)
    })

    




})