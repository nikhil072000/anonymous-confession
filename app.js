//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const supervillains = require('supervillains');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const session = require("express-session");


const homeStartingContent = "'Confession.io' is an only online platform where users can post there secrets, confession, stories anonymously. We dont disclose user's identity your post will be uploaded with a unique name randomly generated by the system. So that you can share your feelings without any hesitation. If you want ot search your confession in future just enter your title (case sensitive).";
const aboutContent = "Sharing your feelings is the most important thing. We provide a platform to help people share out their stories, experiences, incidents, feelings for someone, helping them lighten their mood. ";
const contactContent = "If you have any queries or want  to report any confession/secret mail us at abc@secret.com a representative will be appointed and will contact you with in 48 hours\n Our working hours:9AM - 6PM";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret: "This is our secret.",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://admin-nikhil:test123@cluster0.y481n.mongodb.net/blogDB?retryWrites=true&w=majority");
// mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

const postSchema = new mongoose.Schema({
   name: {
     type: mongoose.Schema.Types.ObjectId,
     ref: "User"
   },
  title: String,
  content: String
});

const Post = mongoose.model("Post", postSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res){
res.render("homelogin");
});

app.get("/login", function(req,res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});

app.get("/posts", function(req, res){
  if(req.isAuthenticated()){
    Post.find({}, function(err, posts){
      res.render("home", {
        startingContent: homeStartingContent,
        posts: posts
        });
    });
  } else{
     res.redirect("/login");
  }
});

app.post("/register", function(req, res){
  User.register({username: req.body.username}, req.body.password, function(err,user){
    if(err){
      console.log(err);
      res.redirect("/register");
    } else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/posts");
      })
    }
  });
})


app.post("/login", function(req,res){
    const user = new User({
      username: req.body.username,
      password: req.body.password,
    });

    req.login(user, function(err){
      if(err)
      console.log(err);
      else{
        passport.authenticate("local")(req, res, function(){
          res.redirect("/posts");
        })
      }
    });
});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.post("/compose", function(req, res){
  const post = new Post({
    title: supervillains.random(),
    content: req.body.postBody
  });

  post.save(function(err){
    if (!err){
        res.redirect("/posts");
    }
  });
});

app.get("/posts/:postName", function(req, res){
const requestedPostName = req.params.postName;
  Post.findOne({title : requestedPostName}, function(err, post){
    if(post != null){
      res.render("post", {
        title: post.title,
        content: post.content
      });
    }else{
      res.redirect("/compose");
    }

  });
});

app.post("/post", function(req, res){
  res.redirect("/");
});

app.post("/abc", function(req, res){
  const aa = req.body.sear;
  res.redirect("/posts/"+aa);
})

app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.listen(port, function() {
  console.log("Server has started sucessfully");
});
