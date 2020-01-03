var mongoose= require("mongoose");
var Campground= require("./models/campground");
var Comment= require("./models/comment");
data=[
    {
        name: "Dharamshala",
        image: "https://image.shutterstock.com/z/stock-photo-a-tent-glows-under-a-night-sky-full-of-stars-281939390.jpg",
        description: " This is a beautiful campground"
    },
    {
        name: "Machloreganj",
        image: "https://cdn.pixabay.com/photo/2016/11/21/16/03/campfire-1846142_960_720.jpg",
        description: "This is just amazing"
    },
    {
        name: "salt lake",
        image: "https://cdn.pixabay.com/photo/2013/06/09/17/04/fire-123784_960_720.jpg",
        description: "This is just beautifull"
    }
];

function seedDB(){
    //REMOVE ALL CAMPGROUNDS
    Campground.remove({},function(err){
        if(err){
            console.log(err);
        }else{
            console.log("removerd campground");
            //ADD FEW CAMPGROUND
            data.forEach(function(seed){
                 Campground.create(seed,function(err,campground){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("New campground added");
                        Comment.create({
                            text: "I wish it have internet connectivity",
                            author: "ashish"
                        },function(err,comment){
                            if(err){
                                console.log(err);
                            }else{
                                campground.comments.push(comment);
                                campground.save();
                                console.log("comment created");
                            }
                        });
                    }
                });
            }); 
        }
    });    
}
module.exports = seedDB;