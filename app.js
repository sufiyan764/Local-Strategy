const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const session = require("express-session");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended : true }));
app.use(express.static("public"));

app.use(session({
	secret : "my big secret",
	resave : false,
	saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/loginDB", {useNewUrlParser : true});

const userSchema = new mongoose.Schema({
	username : "String",
	password : "String"
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done){
	done(null, user.id);
});

passport.deserializeUser(function(id, done){
	User.findById(id, function(err, user){
		done(err, user);
	});
});

app.get("/", function(req, res){
	res.render("home");
});

app.get("/register", function(req, res){
	res.render("register");
});
app.get("/login", function(req, res){
	res.render("login");
});

app.post("/register", function(req, res){
	User.register({username : req.body.username}, req.body.password, function(err, user){
		if(err){
			console.log(err);
			res.redirect("/register");
		} else {
			passport.authenticate("local")(req, res, function(){
				res.redirect("/dashboard");
			});
		}
	});
});

app.post("/login", function(req, res){
	const user = new User({
		username : req.body.username,
		password : req.body.password
	}); 
	req.login(user, function(err){
		if(err){
			console.log(err);
			res.redirect("/login");
		} else {
			passport.authenticate("local")(req, res, function(){
				res.redirect("/dashboard");
			});
		}
	});
});

app.get("/dashboard", function(req, res){
	if(req.isAuthenticated()){
		res.render("dashboard");
	} else {
		res.redirect("/login");
	}
});

app.get("/logout", function(req, res){
	req.logout();
	res.redirect("/login");
});

app.listen("3000", function(){
	console.log("Server running on port 3000");
});