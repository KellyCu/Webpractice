const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const { TRUE } = require('sass');
const app = express();
const uuid = require('uuid');


const MONGO_URI1 = fs.readFileSync('URI1.txt', 'utf8').trim();
const MONGO_URI2 = fs.readFileSync('URI2.txt', 'utf8').trim();

const db1 = mongoose.connect(MONGO_URI1, {useUnifiedTopology: true});
mongoose.connection.on('open', () => console.log('CONNECTED TO URI 1'));
mongoose.connection.on('error', (err) => console.error(err));

const db2 = mongoose.createConnection(MONGO_URI2, {useUnifiedTopology: true});
db2.on('open', () => console.log('CONNECTED TO URI 2'));
db2.on('error', (err) => console.error(err));



app.use(cors());
app.use(bodyParser.json())
app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended:true}))


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true
    },
    pass: String
})

const postSchema = new mongoose.Schema({
    text: String
});

let User;
let Post;

try {
  User = mongoose.model('User', userSchema);
  Post = db2.model('Post', postSchema);
} catch (error) {
  console.error(error);
}

app.post("/signup", async (req, res) => {
    var email = req.body.email;
    var pass = req.body.password;

    const userExist = await User.findOne({email:email});
    if(userExist){
        res.send(`
        <script> 
            alert("You already have an account");
            window.location.href = "sign.html";
        </script>
        `);
    }
    else {
        const user = new User({email:email, pass:pass});
        await user.save();
        return res.redirect("Log.html");
    }
});


app.post("/Login", async (req, res) => {
    var email = req.body.email;
    var pass = req.body.password;

    const user = await User.findOne({email:email, pass:pass});
    
    if(user){
        return res.redirect('/post');
    }
    else {
        res.send(`
        <script>
            alert("Invalid email or password");
            window.location.href = "Log.html";
        </script>
        `);
    }
});

app.post("/post", async (req, res) => {
    var text = req.body.text;
    const newPost = new Post({text:text});
    await newPost.save();
    res.redirect('/post');
});

app.get("/post", async (req, res) => {
    const strings = await Post.find();
    const divs = strings.map((string) => {
      return `<div id="pst">${string.text}</div>`;
    });
    const hp1 = fs.readFileSync(__dirname + "/public/Homepage.html", "utf8");
    const updatedHTML = hp1.replace(
      '<div id="db-contents">',
      `<div id="posto">\n${divs.join('\n')}\n`
    );
    console.log(updatedHTML);
    res.send(updatedHTML);
});
  




app.get("/", (req, res) => {
    res.set({
        "Allow-access-Allow-Origin":"*"
    })
    return res.redirect("Sign.html");
}).listen(3000);


console.log("Listening to Port 3000");








