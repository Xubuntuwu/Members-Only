const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require("passport");
const { body, validationResult } = require("express-validator");
const { DateTime } = require('luxon');


const User = require('../models/user');
const Message = require('../models/message');
const Password = require('../models/memberpassword');

// standard page is sign in
router.get('/', (req, res, next)=>{
    const taglines = ['What secrets are you keeping?', 'What\'s your secret?', 'There\'s always one person who knows your secrets.', 'The only thing more powerful than a secret is a secret shared.', 'The only way to truly be in on it, is to be yourself.', "Secrecy is the keystone of all tyranny. Not force, but secrecy and censorship. When any government or church for that matter, undertakes to say to its subjects, 'This you may not read, this you must not know,' the end result is tyranny and oppression, no matter how holy the motives. Mighty little force is needed to control a man who has been hoodwinked in this fashion. An enormous amount of propaganda can be disguised as education.",
                    "You're not safe. I'm always watching. I know what you're thinking. I'm going to find you. You can't hide from me.", "I am watching you. I know where you live, what you like to eat, and what you are afraid of. I am always watching you. I will never let you out of my sight.", "You will be watched. Every move you make, every step you take, I'll be there. You can run, but you can't hide. I know where you are, I know what you're doing. I'm always one step ahead.", 
                ]
    const tagline = taglines[Math.floor(Math.random()*taglines.length)];
    if(req.user && req.user.username){
        res.render('index', {layout: 'inside', user: req.user})
    }
    else{
        res.render('index', {tagline: tagline});
    }
});
router.get('/about', (req, res, next)=>{

    res.render('about', {});
});

// sign up page
router.get('/sign-up', (req, res, next)=>{
    res.render('sign-up');
});

router.post('/sign-up', async(req, res, next) => {
    const sameuser = await User.find({username: req.body.username}).lean().exec();
    // console.log('same user' ,sameuser)
    if(sameuser.length>=1){
        res.render('sign-up', {signup_error: 'Username already exists, choose a different one'})
    }
    else{
        bcrypt.hash(req.body.password, 10, async(err, hashedPassword) => {
          if (err) { 
            return next(err);
          }    
          const totalusers = await User.find().countDocuments();
          let membership=false;
          if (totalusers<100){
            membership= true;
          }
          else{
            membership= false;
          }
          const user = new User({
            username: req.body.username,
            password: hashedPassword,
            admin: false,
            member: membership,
            location: req.socket.remoteAddress,
          }).save((err, user) => {
            if (err) { 
              return next(err);
            }
            req.login(user, function (err) {
                if ( ! err ){
                    res.redirect('/');
                } else {
                    return next(err);
                }
            })
          });
        });
    }
})

// standard page is sign in
router.get('/log-in', (req, res, next)=>{
    res.render('log-in');
})

router.post('/log-in', 
    passport.authenticate("local", {
        failureRedirect: "/"
    }), (req, res, next)=>{
        // res.render('/', {message: 'Login Succesful!', messagetype: 'success'})
        res.redirect('/');
    }
)


// logged out page
router.post('/sign-out', (req, res, next)=>{
    req.logout(function (err) {
        if (err) {
          return next(err);
        }
        res.redirect("/");
      });
});

// account pages
router.get('/account/personal', async(req, res, next)=>{
    if(req.user){
        res.render('account', {layout: 'inside', title: 'My Account'});
    }
    else{
        res.redirect('/log-in');
    }
});


router.get('/account/:id', async (req, res, next)=>{
    if(req.params.id && req.user){
        const user = await User.find({_id: req.params.id}).lean().exec();
    
        res.render('account', {layout: 'inside', user: user});
    }
    else if(req.user){
        res.status(404).render('/not-found');
    }
    else{
        res.redirect('/log-in');
    }
});

router.post('/request-membership', async (req, res, next)=>{
    if(req.user){
        req.body.password

        Password.findOne({}, (err, password) => {
            if (err) { 
                return next(err);
            }
            bcrypt.compare(req.body.password, password.password, (err, res) => {
                if (res) {
                User.findByIdAndUpdate(req.user, {member: true}, {}, (err, theuser) => {
                    if (err) {
                        return next(err);
                    }
                    res.render('/account/personal', {layout: 'inside', title: 'My Account', user: theuser})
                });
            } else {
                // passwords do not match!
                res.render('/account/personal', {layout: 'inside', title: 'My Account', message: 'Wrong Password'})
            }
            })
            });
    }
    else{
        res.redirect('/log-in');
    }
});

// create a new message 
router.post('/new-message', [

    body("user", "Name must not be empty.")
    .escape(),
  body("message", "Message Content must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

async (req, res, next)=>{
    const errors = validationResult(req);

    if(req.user){
        const message = new Message({
            user: req.user._id,
            timestamp: Date.now(),
            content: req.body.message
          });
          if (!errors.isEmpty()) {
            console.log(errors.array());
            res.redirect('/messaging-board');
          }
          message.save((err)=>{
            if(err){
                return next(err);
            }
            res.redirect('/messaging-board');
          })
    }
    else{
        res.redirect('/log-in');
    }
}]
);

// account pages
router.get('/messaging-board', async(req, res, next)=>{
    const messages = await Message.find().populate('user').lean().exec();
    messages.forEach((mess)=>{
        mess.timestamp = mess.timestamp.toLocaleString(DateTime.DATETIME_MED);
    })
    if(req.user){
        res.render('board', {layout: 'inside', user: req.user, messages: messages});
    }
    else{
        res.render('board', {messages: messages});
    }
});

module.exports = router;