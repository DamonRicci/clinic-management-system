const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const authRoutes = require('./routes/auth');
const app = express();
const db = require('./database');
const bcrypt = require('bcrypt');
require('dotenv').config();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));

passport.use(new LocalStrategy(
    function(username, password, done) {
      db.query('SELECT `id`, `username`, `password` FROM `users` WHERE `username` = ?', [username], function(err, results) {
        if (err) throw err;

        console.log(results); // this line is for debugging
        
        if (results.length === 0) {
          return done(null, false, { message: 'Incorrect username.' });
        }

        const user = results[0];
  
        // compare the input password with the user's password in the database
        bcrypt.compare(password, user.password, function(err, isMatch) {
            if (err) throw err;

            if (isMatch) {
                return done(null, user);
            } else {
                console.log('wrong password');
                return done(null, false, { message: 'Incorrect password.' });
            }
        });
      });
    }
));


passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    // TODO: get the user from the database
});

app.use('/auth', authRoutes);

app.get('/login', (req, res) => { // new
    res.render('login');
});

app.get('/', (req, res) => {
    res.send('Hello world');
});


app.get('/', (req, res) => {
    db.query(
        'SELECT `users`.`id`, `users`.`username`, `users`.`password` FROM `clinic_management`.`users`', 
        function(error, results, fields) {
            if (error) throw error;

            // Log the results
            console.log(results);

            // Send the results as the response
            res.send(results);
        }
    );
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});