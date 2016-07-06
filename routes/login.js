var express = require('express');
//var database = require('../bin/database.js');

get = function(req, res, next) {
	//req.session.destroy();
	res.render('login', { title: 'Login' });
};

post = function(req, res, next) {
	database.checkIfExists(req.body.username, req.body.password, function(result) {
		if (result == false) {
			res.render('login', { title: 'Login' , message:'Failed to log in. Try again.'});
		} else {
			req.session.username = req.body.username;
			res.redirect('/regex');
		}
	});
};

module.exports = {get: get, post: post};