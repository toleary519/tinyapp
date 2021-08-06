
// setup 
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

app.use(express.urlencoded({extended: true}));
app.use(cookieParser())
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))
app.set("view engine", "ejs");

// string generator
const generateRandomString = () => Math.random().toString(32).substr(2,6);

//starting url database
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userId: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userId: "user2RandomID"
  }
};
// user database
const usersDatabase = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "test"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

// finder fn
const { getUserByEmail, getURLByUserId} = require('./helpers')

//homepage
app.get("/", (req, res) => {
  res.render("homepage");
});

//urls
app.get("/urls", (req, res) => {
  
  const userId = req.session.id;
  // console.log("req.cookies", req.cookies);
  if (!userId) {
    res.redirect("/register");
    return
  } 
  const varDatabase = getURLByUserId(userId, urlDatabase)
  
  const templateVars = { urls: varDatabase, username: usersDatabase[userId].email};
  res.render("urls_index", templateVars);
});

//register
app.get("/register", (req, res) => {
  const templateVars = {username: req.session.id}; 
  res.render("registration", templateVars);
});

//login
app.get("/login", (req, res) => {
  const templateVars = {username: req.cookies["username"]}; 
  res.render("login", templateVars);
});

//new urls
app.get("/urls/new", (req, res) => {
const username = req.session.id

  if (!username) {
    res.redirect("/login");
    return
  } 
  const templateVars = {username: username.email};
  res.render("urls_new", templateVars);
});

//show url associated w/ shortURL
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.id
  
  const varDatabase = getURLByUserId(userId, urlDatabase)
  
  const longURL = varDatabase[req.params.shortURL]
  const shortURL = req.params.shortURL
  const templateVars = { shortURL: shortURL, longURL: longURL, username: userId};
  res.render("urls_show", templateVars);
});

//post to create new short url
app.post("/urls", (req, res) => {
  const userId = req.session.id

  const newURL = { userId : userId, longURL : req.body.longURL};

  const shortURL = generateRandomString(6);
  // console.log(req.body);
  urlDatabase[shortURL] = newURL // Log the POST request body to the console
  res.redirect(`/urls/${shortURL}`)
});

// post login
app.post("/login", (req, res) => {

  const email = req.body.email 
  console.log("email", req.body);
  const password = req.body.password 
  const hashedPassword = bcrypt.hashSync(password, 10)
  const user = getUserByEmail(email, usersDatabase);
  console.log("user", user);
  console.log("login user.id:", user.id);
  console.log("user.password", user.password);
  if (!user || !bcrypt.compareSync(password, hashedPassword)) {
    return res.status(400).send("invalid login <a href='/login'> try again</a>");
  }
  req.session.id = user.id;
  res.redirect('/urls');

});

// post register
app.post("/register", (req, res) => {
  const email = req.body.email 
  const password = req.body.password 
  const hashedPassword = bcrypt.hashSync(password, 10)
  if (getUserByEmail(email, usersDatabase)) {
    res.status(400).send("Email taken. <a href='/register'> try again </> ");
  }

  if (!email || !password) {
    res.status(400).send("Missing email or Password. <a href='/register'> try again </> ");
    return; 
  }
  
  const userId = generateRandomString(6)
  const user = {userId, email, password} //bcrypt before pass
  usersDatabase[userId] = user;

  usersDatabase[userId] = { id: userId, email: email, password: hashedPassword };
  
req.session.id = userId;
console.log("user object:", usersDatabase[userId]);
console.log("cookie:", userId, email );
res.redirect(`/urls`)
});

// post logout
app.post("/logout", (req, res) => {
  // const username = req.body.username
  // res.clearCookie("id") 
  req.session = null;
  res.redirect('/login')
});
 
// edit / POST / urls/shortURL
app.post("/urls/:shortURL/edit", (req, res) => {
  const userId = req.session.id
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  
  const editURL = { userId: userId, longURL: longURL}

  urlDatabase[shortURL] = editURL;
  res.redirect('/urls');
})

// delete url
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL

  delete urlDatabase[shortURL];

  res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (!longURL) {
    res.status(404).send("Error 404: Page Not Found")
  } else {
    res.redirect(longURL);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});