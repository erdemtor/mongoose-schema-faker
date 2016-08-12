/**
 * Created by erdem on 12.08.16.
 */
"use strict";
const mongoose = require('mongoose');
module.exports = function (mongooseURL, callback) {
    let options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
        replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };
    mongoose.connect(mongooseURL, options);
    let conn = mongoose.connection;
    conn.on('error', console.error.bind(console, 'connection error:'));
    conn.once('open', function(errors) {
        console.log(errors || "Succesfully connected to database!");
        callback();
        // Wait for the database connection to establish, then start the app.
    });

};

