const express = require( "express");
const expressSession = require("express-session");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy
const cors = require("cors");
const uuid = require("uuid");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
var port = process.env.PORT || 3000;
var server = express();

//middle ware
// server.use(cors());
// server.use(express.json())
// server.use(express.urlencoded({
//     extended: false
// }));
// server.use(bodyParser.json({limit: '2mb'}));
// server.use(bodyParser.urlencoded({limit: '2mb', extended: false}));

var data = require("./data.js");

//CREDENTIAL SETUP
server.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", req.get("origin"));
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "DELETE, PUT");
    next();
});
server.options("*", function(req, res, next) {
    res.header("Access-Control-Allow-Headers", "Content-type");
    next();
});
server.use(express.json());
server.use(express.urlencoded({extended: false}));

// Passport Middleware
server.use(expressSession({
    secret: "", //removed
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 3600000 // 1 hour
    }
}));

server.use(passport.initialize());
server.use(passport.session());

passport.serializeUser(function(user, callback) {
    callback(null, user.id);
});

passport.deserializeUser(function(id, callback) {
    userModel.findById(id, function(error, user) {
        callback(error, user);
    });
});

passport.use(new LocalStrategy(
    {
        usernameField: 'email',
    },
    function(email, password, done) {
        userModel.findOne({
            email: email
        }, function(error, user) {
            if (error) {
                return done(error);
            }
            if (!user) {
                console.log("username not found")
                return done(null, false);
            }
            bcrypt.compare(password, user.password, function(error, isMatch) {
                if (isMatch) {
                    //console.log(user.id)
                    return done(null, user);
                } else {
                    console.log("password was wrong")
                    return done(null, false);
                }
            });
        });
    }
));
var ensureAuthentication = function(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(403); // Forbidden
        res.json({
            msg: "Please login first"
        });
    }
};

// Models
var userModel = require("./models/user.js");

// Endpoints
server.get("/private", ensureAuthentication, function(req, res) {
    res.json({
        msg: `Hello ${req.user.email}`
    });
});

////////////////User section mongoose/////////////////////////

//REGISTER
server.post("/users/register", function(req, res) {
    userModel.findOne({
        email: req.body.email
    }).then(function(user) {
        if (user) {
            res.status(422); // unprocessable
            res.json({
                msg: "That email is already in use."
            });
        } else {
            // Create the user, but first encrypt the password
            bcrypt.genSalt(10, function(error, salt) {
                bcrypt.hash(req.body.password, salt, function(error, hashed_password) {
                    userModel.create({
                        email: req.body.email,
                        password: hashed_password
                    }).then(function(new_user) {
                        res.status(201);
                        res.json({
                            user: new_user
                        });
                    }).catch(function(error) {
                        res.status(400).json({msg: error.message});
                    });
                });
            });
        }
    }).catch(function(error) {
        res.status(400).json({msg: error.message});
    });
});

//LOGIN
server.post("/users/login",
    passport.authenticate("local", { failureRedirect: "/users/login/error" }),
    function(req, res, next) {
        res.redirect("/users/login/success");
    }
);

// Login error and success
server.get("/users/login/error", function(req, res) {
    res.status(403); // forbidden
    res.json({
        msg: "Invalid email or password"
    });
});

server.get("/users/login/success", function(req, res) {
    res.json({
        msg: `Welcome ${req.user.email}`,
        user_id: req.user._id
    });
});

//////////mongoose edition endpoints//////////////////////////////////////////

//Create new tutorial
server.post("/users/:id/create", function(req, res){
    
    var new_tutorial = {
        title: req.body.title,
        intro_text: req.body.intro_text,
        intro_img: req.body.intro_img,
        steps: req.body.steps,
        outro_text: req.body.outro_text,
        outro_img: req.body.outro_img,
    }

    userModel.findById(req.params.id).then(function(user){
        if (user == null){
            res.status(404);
            //console.log("user null")
            res.json({msg:`there was no user by ${req.params.id}`})
        } else {
            user.user_tut_list.unshift(new_tutorial)

            user.save().then(function(){
                res.status(201);
                res.json({
                    user: user
                });
            });
        }
    }).catch(function(error){
        res.status(400).json({msg: error.message})
    })

})

//Get entire USER
server.get("/users/:id/tutorials", function(req, res){
    userModel.findById(req.params.id).then(function(user){
        if (user == null){
            res.status(404);
            //console.log("user null")
            res.json({msg:`there was no user by ${req.params.id}`})
        } else {
            res.json({
                user:user
            })
        }
    }).catch(function(error){
        res.status(400).json({msg: error.message})
    })
})

//Get specific tutorial from user
server.get("/users/:user_id/tutorials/:tut_id", function (req,res){
    userModel.findById(req.params.user_id).then(function(user){
        if (user == null){
            res.status(404);
            //console.log("user null")
            res.json({msg:`there was no user by ${req.params.user_id}`})
        } else {
            user.user_tut_list.forEach(function(tut){
                if(req.params.tut_id == tut._id){
                    res.json({
                        the_user_tut: tut
                    })
                }
            });
        }
    }).catch(function(error){
        res.status(400).json({msg: error.message})
    })
})

//if already logged in get the id
server.get("/user/get/login", ensureAuthentication,function (req,res){
    res.json({
        user_id: req.user._id
    })
})

//Delete tutorial
server.delete("/users/:user_id/tutorials/:tut_id", function(req, res) {
    userModel.findById(req.params.user_id).then(function(user) {
        // res.status(204);
        // res.send();
        //res.status(204).send();
        if (user == null){
            res.status(404)
            res.json({msg:`there was no user by ${req.params.user_id}`})
        } else {
            for(var i =0; i< user.user_tut_list.length; i ++){
                if (user.user_tut_list[i]._id == req.params.tut_id){
                    user.user_tut_list.splice(i,1);
                    user.save()
                }
            }
            res.status(204)
            res.send()
            // user.save().then(function(){
            //     console.log(user)
            //     res.status(204);
            //     res.json({
            //         user: user
            //     });
            // });
        }

    }).catch(function(error) {
        res.status(400).json({msg: error.message});
    });
});

//edit a tutorial
server.put("/users/:user_id/tutorials/:tut_id", function(req, res){
    userModel.findById(req.params.user_id).then(function(user) {
        if (user == null){
            res.status(404)
            res.json({msg:`there was no user by ${req.params.user_id}`})
        } else {
            for(var i =0; i< user.user_tut_list.length; i ++){
                if (user.user_tut_list[i]._id == req.params.tut_id){
                    //
                    user.user_tut_list[i].title = req.body.title
                    user.user_tut_list[i].intro_text = req.body.intro_text
                    user.user_tut_list[i].intro_img = req.body.intro_img
                    user.user_tut_list[i].steps = req.body.steps
                    user.user_tut_list[i].outro_text = req.body.outro_text
                    user.user_tut_list[i].outro_img = req.body.outro_img

                }
            }
            user.save().then(function(){
                res.status(204);
                res.json({
                    user: user
                });
            });
        }
    }).catch(function(error) {
        res.status(400).json({msg: error.message});
    });
})

server.get('/logout', function(req, res){
    req.logout();
    res.send();
  });

////////////////Genral section///////////////////////

//GET genral
server.get("/tutorials", function(req, res){
    //console.log("get all tutorials: ", data.tutorial_list)
    var response ={
        all_tutorials: data.tutorial_list
    }
    res.json(response)
});

//RETREIVE genral
server.get("/tutorials/:id", function(req, res){
    //console.log( req.params.id );
    the_tutorial = {};
    data.tutorial_list.forEach(function(tut){
        if (tut.ID == req.params.id){
            the_tutorial = tut;
        }
    })

    if (the_tutorial == {}){
        res.status(404);
        var response = {
            msg: "couldnt find that ID"
        };
        console.log("404 error");
        res.json(response);
    } else {
        console.log("get specific tutorial: ", the_tutorial)
        var response = {
            the_tutorial: the_tutorial
        }
        res.json(response);
    }
});

//POST genral
server.post("/tutorial", function(req, res){
    //console.log("post body sent",req.body)
    //load the steps
    load_steps = [];
    for (var i =0; i < req.body.steps.length; i ++){
        var step = {
            step_text: req.body.steps[i].step_text,
            step_ref: req.body.steps[i].step_ref,
            step_img: req.body.steps[i].step_img
        }
        load_steps.push(step);
    }
    //console.log(load_steps)
    var new_tutorial = {
        title: req.body.title,
        intro_text: req.body.intro_text,
        intro_img: req.body.intro_img,
        steps: load_steps,
        outro_text: req.body.outro_text,
        outro_img: req.body.outro_img,
        ID: uuid.v4(),
    }
    console.log("Posting new_tutorial: ", new_tutorial);
    data.tutorial_list.unshift(new_tutorial);
    res.status(201)
    res.send()
});

//DELETE genral
server.delete("/tutorials/:id", function(req, res){
    for(var i =0; i< data.tutorial_list.length; i ++){
        if (data.tutorial_list[i].ID == req.params.id){
            data.tutorial_list.splice(i,1);
        }
    }
    res.status(204);
    res.send();
});

// comments removed


//Connect to databse
mongoose.connect("", { //removed
    useNewUrlParser: true
}).then(function() {
    server.listen(port, function() {
        console.log(`Listening on port ${port}`);
    });
});

// server.listen( port, function(){
// 	console.log(`listening on port ${ port }`);
// });