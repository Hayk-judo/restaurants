const express = require('express');
const app = express();
const path = require('path');
const ejsEngine = require('ejs-locals');
const mysql = require('mysql2');
const session = require('express-session');
const bcrypt = require('bcrypt')
const { body, validationResult } = require('express-validator');


const hostname = "127.0.0.1";
const port = 3000;

const connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'hayk',
    password : 'Zz123456',
    database : 'nodelogin'
});

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}))

app.use(express.static('public'))
app.use(express.static(__dirname + 'public/css/style.css'))
app.use(express.static(__dirname + 'public/img'))

app.set('views', path.join(__dirname, './views'))
app.set('view engine', 'ejs');
app.engine('ejs', ejsEngine);
app.set('css', path.join(__dirname, './css'))

app.use(function(req, res, next) {
    res.locals.user = req.session.user;
    next();
});

app.get('/login',(req, res)=> {
    res.render('auth/login')
});

app.get('/register',(req, res)=> {
    res.render('auth/register')
});

app.post('/register',(req, res)=> {
    const { email, username, password } = req.body;

    bcrypt.hash(password, 10).then(function(hash) {
        connection.query(
            "INSERT INTO `accounts` (`username`, `password`, `email`) VALUES (?,?,?)",
            [username, hash, email], function(error, results, fields) {
               if(username.length > 2 && password.length > 8){
                   return res.redirect('/login')
               }else {
                   return res.render('auth/register', {
                       username,
                       password,
                       email,
                       message: "Password example: Aa1234568 username length min 7"
                   });
               }

            })
    });
});

app.post('/auth', function(req, res) {
    let username = req.body.username;
    let password = req.body.password;

        connection.query('SELECT * FROM accounts WHERE username = ?', [username], function(error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {
                const [account] = results;

                return bcrypt.compare(password, account.password).then((isValid) => {
                    if(isValid) {
                        req.session.user = {
                         id: account.id,
                         username
                        }
                        return res.redirect('/');
                    } else {
                        return res.render('auth/login', {
                            username,
                            password,
                            message: "Inccorect Username and/or password."
                        });
                    }

                })

            } else {
                return res.render('auth/login', {
                    username,
                    password,
                    message: "Inccorect Username and/or password."
                });
            }

        });

});

app.get('/logout', (req,res,next) => {
    req.session.user = null;

    return res.redirect('/')
})

app.get('/',( req, res, next) => {
    res.render('index/home')
})

app.get('/about',( req, res, next) => {
    res.render('index/about')
})

app.get('/projects',( req, res, next) => {
    res.render('index/projects')
})

app.get('/vanatur',( req, res, next) => {
    res.render('restorant/vanatur')
})

app.get('/alexandrapol',( req, res, next) => {
    res.render('restorant/alexandrapol')
})

app.get('/imperial',( req, res, next) => {
    res.render('restorant/imperial')
})

app.get('/florenc',( req, res, next) => {
    res.render('restorant/florenc')
})

app.get('/vale',( req, res, next) => {
    res.render('restorant/vale')
})

app.get('/cherkez',( req, res, next) => {
    res.render('restorant/cherkez')
})




app.listen(port, hostname, ()=> {
    console.log('server is runing');
})