require('dotenv').config();
const express = require("express")
const bodyParser = require("body-parser")
// Level 4
// const bcrypt = require('bcrypt')
// const saltRounds = 10;
const mongoose = require("mongoose")
const ejs = require('ejs')
// Level 5 cookies and sessions
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose');
const { Passport } = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-find-or-create')
const multer = require('multer');

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
let fs = require('fs');
let path = require('path');


let upload = multer({ 
    storage: storage
    // ,
    // limits: 1024*1024*3
});
// const upload = multer({ dest: 'uploads/' })

let imgModel = require('./model');
let postModel = require('./postModel')
let moment = require('moment');
// Level 3 included hashing
// const md5 = require("md5")
// const encrypt = require("mongoose-encryption")
const app = express()
const port = 3000 || process.env.PORT


app.use(express.static("public"));
app.use(bodyParser.urlencoded({
    extended: true
}))
app.set('view engine', 'ejs');
app.locals.moment = require('moment');
// console.log(process.env.SECRET)

// Sessions options
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
    // cookie: { secure: true }
  }))

//   passport initialisation for aunth
app.use(passport.initialize());
// Session initialization for session management
app.use(passport.session());
// DB Connectin
const url = "mongodb://localhost:27017/userDB";
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true 
}

mongoose.connect(url, options)

// Level one starts here
// For level 2 to work i had to change
const userSchema =new mongoose.Schema({
    email: String,
    password : String,
    googleId : String,
    secret: String,
    img:
    {
    data: Buffer,
    contentType: String
    }
    },{
        timestamps: true
    }
);

userSchema.plugin(passportLocalMongoose)
userSchema.plugin(findOrCreate)
// Level 2 is right here
// var secret = process.env.SOME_LONG_UNGUESSABLE_STRING;
// Check 
// This encrypts the whole database.
// But when you add a option then it encrypts it
// The plugin her eis used to encrypt the password for
// Level 2 Environment Variable.
// userSchema.plugin(encrypt, { secret: process.env.SECRET , encryptedFields: ['password']});

const User = new mongoose.model("User", userSchema)

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
      console.log(profile)
      
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


// Moment Js 

// ROUTES
app.get('/', (req, res)=>{
    imgModel.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
            res.render('home', { items: items });
        }
    });
    
    
})
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

  app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });
app.get('/login', (req, res)=>{
    res.render('login')
})

app.get('/register', (req, res)=>{
    res.render('register')
})

app.get('/profile', (req, res) => {
    imgModel.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
            res.render('profile', { items: items });
        }
    });
});


app.get('/secrets', (req, res)=>{
    if(req.isAuthenticated()){
    //     User.find({"secret":{$ne:null}}, function(err, foundUsers){
    //         if(err){
    //             console.log(err)
    //         }else{
    //             if(foundUsers){
    //                 res.render("secrets", {usersWithSecrets: foundUsers});
    //             }
    //         }
    //     })
    // }else{
    //     res.redirect("/login")
    // }
    // ejs.filters.fromNow = function(date) {
    //     return moment(date).fromNow();
    // }
    // exports.index = function(req, res) {
    //     // send moment to your ejs
    //     res.render('index', { moment: moment });
    // }
   postModel.find({"details":{$ne: null }}, function(err, foundPosts){
       if(err){
           console.log(err)
       }else{
           if(foundPosts){
               res.render("secrets", {usersWithSecrets: foundPosts})
           }
       }
   })
    }else{
    res.redirect('/login')
}
})
app.get('/submit', (req, res)=>{
    if(req.isAuthenticated()){
        res.render("submit")
    }else{
        res.redirect("/login")
    }
});
// Post requests
// This was just level  one 
app.post("/register", function(req, res){
    // level 4 salting
    // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    //     // Store hash in your password DB.
    //     const newUser = new User({
    //         email: req.body.username,
    //         password: hash
    //         })
        
    //         newUser.save(function(err){
    //             if(err){
    //                 console.log(err)
    //             }else{
    //                 res.render("secrets")
    //             }
    //         });
    // });
    // level 5 Cookies and session 
    User.register({username: req.body.username}, req.body.password, function(err , user){
        if(err){
            console.log(err);
            res.redirect("/register")
        }else{
            // Cookie created
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets")
            });
        }
    });
});


// Level one 

app.post('/login', function(req,res){
    // Level 4 salting
    // const username = req.body.username;
    // const password = req.body.password;

    // User.findOne({email: username}, function(err, foundUser){
    //     if(err){
    //         console.log(err)
    //     }else{
    //         if(foundUser){
    //             bcrypt.compare(password, foundUser.password , function (err, results){
    //                 if(results=== true){
    //                     res.render("secrets")
    //                 }
    //             });
    //         }
    //     }
    // });

    const user = new User({
        username: req.body.username, 
        password:req.body.password
    })

    req.login(user, function(err){
        if(err){
            console.log(err)
        }else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets")
            })
        }
    })
});
app.get('/logout', (req, res)=>{
    req.logout();
    res.redirect('/')
});

app.post('/submit', (req, res)=>{
    const submittedSecrets = req.body.secret;

    const post = new postModel({
        details: submittedSecrets
    })

    post.save((err)=>{
        if(err){
            console.log(err)
        }else{
            res.redirect("/secrets")
        }
    })
    
    // User details saved
    // console.log(req.user.id)
    // User.findById(req.user.id, function(err, foundUser){
    //     if(err){
    //         console.log(err)
    //     }else{
    //         // here we find the user, give and submit the secret the user submitted
    //         if(foundUser){
    //             foundUser.secret = submittedSecrets;
    //             foundUser.save(function(){
    //                 res.redirect("/secrets")
    //             })
    //         }
    //     }
    // });
});

app.post('/profile', upload.single('image'), (req, res, next) => {
  
    let obj = {
        name: req.body.name,
        googleId : String,
        secret: String,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/public/uploads/' + req.file.filename)),
            contentType: 'image/png'
        }
    }
   
    imgModel.create(obj, (err, item) => {
        if (err) {
            console.log(err);
        }
        else {
            // item.save();
            console.log(obj)
            res.redirect('/profile');
        }
    });
});
// Level 1 = Username and password 
// Level 2 = Encryption
// Level 3 = Environment variables
// Level 4 = Salting
// Level 5 = Cookies and session

app.listen(port, function(){
    console.log("The server is running on port 3000")
})
