var express = require('express');
var database = require('../bin/database.js');
var Firebase = require("firebase");
var FirebaseRef = new Firebase("https://powercloud-bf968.firebaseio.com/");

FirebaseRef.on("value", function(snapshot) {
  FirebaseContent = snapshot.val();
}, function(errorObject) {
  console.log("The read failed: " + errorObject.code);
});

get = function(req, res, next) {
	res.render('register', { title: 'Registration' });
};

post = function(req, res, next) {
	console.log("Tried to register: " + JSON.stringify(req.body));
	database.createUser(req.body.email, req.body.password);
	req.session.username = req.body.username;
	res.redirect('/regex');
};

module.exports = {get: get, post: post};