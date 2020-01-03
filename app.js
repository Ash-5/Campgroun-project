var express = require("express");
var app=express();
var bodyParser=require("body-parser");
var passport= require("passport");
var localStrategy= require("passport-local");
var User= require("./models/user")
var mongoose= require("mongoose");
var flash= require("connect-flash");
var seedDB= require("./seed");
var Comment= require("./models/comment");
var middleware= require("./middleware");
var passportLocalMongoose= require("passport-local-mongoose");
var methodOverride= require("method-override");

seedDB();
mongoose.connect("mongodb://localhost/yelp_camp_v1", { useNewUrlParser: true });

Campground = require("./models/campground.js");
app.use(bodyParser.urlencoded({extended : true}));

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

//passport configuration
app.use(require("express-session")({
    secret: "I love animals",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/campgrounds",function(req,res){
    //Get all campground from db
    Campground.find({},function(err,Allcampgrounds){
        if(err){
            console.log("Something went wrong");
            console.log(err);
        }else{
         //   console.log("User ==> ", req.user);
            
               res.render("campgrounds/index",{data: Allcampgrounds, currentUser: req.user});
        }
    });
   // res.render("campgrounds",{data: data});
});

app.post("/campgrounds",function(req, res){
    //res.send("YOU HIT POST ROUTE!!");
    var name= req.body.name;
    var image= req.body.image;
    var price= req.body.price;
    var description=req.body.description;
    var author = {id : req.user._id, username : req.user.username};
    var newcampground = {name, image, price, description, author};
     //create new campground and save it to database
     //redirect back to campgrounds page
    Campground.create(newcampground,function(err, newlycreated){
        if(err){
            console.log("Something went wrong");
        }else{
            res.redirect("/campgrounds");
        }
    })
});

app.get("/campgrounds/new",middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new",{currentUser: req.user});
});

//SHOW- shows more information about the perticular campgrounds
app.get("/campgrounds/:id",function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log("OPSS!! Something went wrong");
            console.log(err);
        }else{
                console.log(foundCampground);
                //console.log("User 2 ==> ", req.user);
                
                // render show tamplate with that campgrounds
                res.render("campgrounds/show", {campground: foundCampground, currentUser: req.user});
        }
    });
});

// EDIT CAMPGROUND ROUTE
app.get("/campgrounds/:id/edit",middleware.checkCampgroundOwnership,function(req, res){
        Campground.findById(req.params.id , function(err, foundCampground){
            if(err){
                console.log(err);
                res.redirect("/campgrounds");
            }else{
                console.log(foundCampground);
                console.log(req.user._id);
                res.render("campgrounds/edit",{currentUser : req.user,campground : foundCampground});
            }
        });
});

app.put("/campgrounds/:id",function(req, res){
    if(req.isAuthenticated()){
        
    }
    Campground.findByIdAndUpdate(req.params.id, req.body.data,function(err, updatedCampground){
        if(err){
            res.redirect("/campgrounds");
        }else{
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});
//destroy campground route

app.delete("/campgrounds/:id", function(req, res){
    Campground.findByIdAndRemove
    (req.params.id, function(err){
        if(err){
            res.redirect("/campgrounds");
        }else{
            res.redirect("/campgrounds");
        }
    })
});
//UPDATE CAMPGROUND ROUTE
//====================
//COMMENTS ROUTE
//====================
app.get("/campgrounds/:id/comments/new",middleware.isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        }else{
            res.render("comments/new",{campground: campground, currentUser: req.user});
        }
    })
});

app.post("/campgrounds/:id/comments",function(req, res){
    //console.log(req.params);
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        }else{
            //console.log(req.body);   
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                }else{
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;

                    //save comment 
                    comment.save();  
                    campground.comments.push(comment);
                    campground.save();
                    //console.log(comment1);
                    res.redirect("/campgrounds/"+campground._id);
                  //  console.log("Commnet =>", comment);
                    // campground.comments.push(comment);
                     //campground.save();
                    // res.redirect("/campgrounds/"+campground._id);
                }
            });
        }
    });
});

//comment eddit rout
app.get("/campgrounds/:id/comments/:comment_id/edit",middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            res.redirect("back");
        }else{
            res.render("comments/edit",{campground_id: req.params.id, comment: foundComment, currentUser:req.user});
        }
    })
});
//comment update route
app.put("/campgrounds/:id/comments/:comment_id",middleware.checkCommentOwnership,function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        }else{
            res.redirect("/campgrounds/"+ req.params.id)
        }
    })
});

//comment destroy route

app.delete("/campgrounds/:id/comments/:comment_id",middleware.checkCommentOwnership,function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        }else{
            res.redirect("/campgrounds/"+ req.params.id);
        }
    });
});

//AUTH ROUTE
app.get("/",function(req, res){
    //res.send("This will be landing page soon");
    res.render("landing",{ currentUser : req.user });
});
app.get("/register",function(req, res){
    res.render("register",{ currentUser : req.user });
});
app.post("/register", function(req, res){
    User.register(new User({username: req.body.username}),req.body.password,function(err,user){
        if(err){
            console.log(err);
            return res.render("/register");
        }
        passport.authenticate("local")(req, res, function(){
             res.redirect("/campgrounds");
        })
    })
});
app.get("/login",function(req, res){
    res.render("login",{ currentUser : req.user });
});
app.post("/login",passport.authenticate("local",
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }),function(req, res){
        console.log("Login ==> ", req.user);        
});
app.get("/logout",function(req, res){
    req.logOut();
    res.redirect("/")
});

app.listen(3000,function(){
    console.log("The Yelcamp server has started!!");
})