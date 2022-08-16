const mongoose = require("mongoose");
// const config = require('../config');
require("dotenv/config");

const q = require("q");
const deferred = q.defer();
let connection;

function connect(){
    console.log("Mongo: Initilized connection..");
    connection = mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true, 
        useUnifiedTopology: true,
        useFindAndModify: false
    });
    return connection;
}
function dbConnection(callback){
    mongoose.connection.on("error", err => {
        console.log(`Mongo: Error ${err}`);
        deferred.reject(err);
    });
    mongoose.connection.on("connecting", () => {
        console.log("Mongo: Connecting..");
    });
    mongoose.connection.on("open", () => {
        console.log("Mongo: Connected..");
        return callback && typeof callback === 'function' && callback();
    });
    return connect();
}
dbConnection(() => {
    deferred.resolve(connection);
});
module.exports = deferred.promise;