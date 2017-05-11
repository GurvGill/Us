var bodyParser = require('body-parser');
var path = require('path');
var express = require('express');
var mongoose = require('mongoose');
var session = require('client-sessions');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var User = mongoose.model('User', new Schema({
	id: ObjectId,
	company: String,
	username: {type: String, unique: true},
	email: {type: String, unique: true},
	password: String,
}));

var app = express();
app.set('view engine', 'ejs');
app.locals.pretty = true;


// connect to mongo
mongoose.connect('mongodb://Gurvir:hello1@ds133271.mlab.com:33271/us-db');

//middleware
app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
	cookieName: 'session',
	secret: 'asdfghjkl1234567890',
	duration: 30 * 60 * 1000,
	activeDuration: 5 * 60 * 1000,
}));

app.get('/', function (req, res) {
  res.render('index', {error: ''});
});

app.get('/register', function(req,res) {
	res.render('register', {error: ''});
});

app.post('/register', function(req,res) {
	var user = new User({
		company: req.body.company,
		username: req.body.username,
		email: req.body.email,
		password: req.body.password,
	});
	user.save(function(err) {
		if(err){
			if(err.code == 11000)
			{
				res.render('register', {error: 'That email is taken, please try another email.'});
			}
		}
		else{
			User.findOne( {email: req.body.email} , function(err, user) {
    			if(!user){
    				res.render('login', {error: 'Invalid email or password'});
    			}else{
    				if(req.body.password == user.password){
    					req.session.user = user;
    					res.redirect('/profile');
    				} else{
    					res.render('login', {error: 'Invalid email or password'});
    				}	
    			}
    		});
		}
	})
});

app.get('/login', function(req,res) {
	res.render('login', {error: ''});
});

app.post('/login', function(req,res) {
	User.findOne( {email: req.body.email} , function(err, user) {
    	if(!user){
    		res.render('login', {error: 'Invalid email or password'});
    	}else{
    		if(req.body.password == user.password){
    			req.session.user = user;
    			res.redirect('/profile');
    		} else{
    			res.render('login', {error: 'Invalid email or password'});
    		}
    	}
    });
});

app.get('/profile', function(req,res) {
	if(req.session && req.session.user){
		User.findOne( { email: req.session.user.email }, function(err, user){
			if(!user){
				req.session.reset();
				res.redirect('/login');
			} else {
				res.locals.user = user;
				res.render('profile', {error: 'Profile found.'});
			}
		});
	} else {
		res.render('login', {error: 'You must Sign In to view your profile.'});
	}
});

app.listen(3000);