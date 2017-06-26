var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-erase'));

var db = new PouchDB('things');


db.erase().then(function (resp) {

    console.log('clean db ...')
    console.log(resp) 
})