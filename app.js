const express = require("express")
const bodyParser = require("body-parser")
const ejs = require('ejs')
const mongoose = require("mongoose")
const encrypt = require("mongoose-encryption")
const app = express()
const port = 3000 || process.env.PORT

app.use(express.static("public"));
app.use(bodyParser.urlencoded({
    extended: true
}))
app.set('view engine', 'ejs');
const url = "mongodb://localhost:27017/userDB";
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true 
}

mongoose.connect(url, options)

// Level one starts here
const userSchema =new mongoose.Schema({
    email: String,
    password : String
});



// Level 2 is right here
// var secret = process.env.SOME_LONG_UNGUESSABLE_STRING;
const secret = "Telvinsdirtysecret";
// This encrypts the whole database.
// But when you add a option then it encrypts it
// The plugin her eis used to encrypt the password fir
userSchema.plugin(encrypt, { secret: secret , encryptedFields: ['password']});

const User = new mongoose.model("User", userSchema)

// ROUTES
app.get('/', (req, res)=>{
    res.render('home')
})

app.get('/login', (req, res)=>{
    res.render('login')
})

app.get('/register', (req, res)=>{
    res.render('register')
})


app.get('/secrets', (req, res)=>{
    res.render('secrets')
})


// Post requests
// This was just level  one 
app.post("/register", function(req, res){
    const newUser = new User({
    email: req.body.username,
    password: req.body.password
    })

    newUser.save(function(err){
        if(err){
            console.log(err)
        }else{
            res.render("secrets")
        }
    })
})

// Level one 
app.post('/login', function(req,res){
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username}, function(err, foundUser){
        if(err){
            console.log(err)
        }else{
            if(foundUser){
                if(foundUser.password === password){
                    res.render("secrets")
                }
            }
        }
    })
});
// app.get('/', (req, res)=>{
//     res.render('submit')
// })







app.listen(port, function(){
    console.log("The server is running on port 3000")
})
