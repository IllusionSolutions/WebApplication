var express = require('express');
var Firebase = require("firebase");
 /*var FirebaseRef = new Firebase("https://powercloud-bf968.firebaseio.com/");
var FirebaseContent = {};

FirebaseRef.on("value", function(snapshot) {
  FirebaseContent = snapshot.val();
}, function(errorObject) {
  console.log("The read failed: " + errorObject.code);
}); */

var router = express.Router();
//var FirebaseRef = new Firebase("https://powercloud-bf968.firebaseio.com/");
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Index' });
});

module.exports = router;
