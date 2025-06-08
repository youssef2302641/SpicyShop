
import { Router } from "express";
import {handleSignup,login,checkUN,handlefgtpass,validToken,GetUser,logoutUser,ajax1} from '../controllers/users.js'

import {signup_model} from '../models/signupschema.js'
import bodyParser from "body-parser";

const router = Router();
router.use(bodyParser.json());


router.get("/login", (req, res)=> {
  // req.session.user=req.body.username;
  res.render("login", { user: (req.session.user === undefined ? "" : req.session.user) });
});
router.post("/login", login);


// router.post("/login", login,async (req, res)=> {
//   const check = await signup_model.findOne({username:req.body.username});
//   console.log(req.body.username)
//   req.session.user=req.body.username;
//   console.log(req.session.user);
//   res.redirect('/')
//   // res.render('home',{ user: (req.session.user === undefined ? "" : req.session.user) })
//   console.log(user.type);
//   });
router.get("/signup", function (req, res) {
  // req.session.user=req.body.username;
  res.render("signup",{ user: (req.session.user === undefined ? "" : req.session.user) });
});

router.post('/signup',ajax1,handleSignup)


router.get('/forget-pass',(req,res)=>{
  res.render('forget-pass')
});
router.post('/forget-pass',handlefgtpass);

router.get('/chat',(req,res)=>{
  res.render('chatbox')
});


router.get('/reset',(req,res)=>{
  res.render('reset')
})
router.post('/reset',validToken);


router.get('/profile', (req, res) => {
  res.render('profile', { user: (req.session.user === undefined ? "" : req.session.user) });
});
router.post('/profile',GetUser);


router.post('/checkUN', checkUN);

router.get('/logout', logoutUser);


// check if logged in
router.use((req, res, next) => {
  req.session.user=req.body.username;
  if (req.session.user !== undefined) 
  {
      next();
  }
  else {
      res.render('error', { err: 'You must login to access this page', user: (req.session.user === undefined ? "" : req.session.user) })
  }
});
// router.post("/chatt",msg);





export default router;