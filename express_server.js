
// setup
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.set("view engine", "ejs");

//starting url database
const urlDatabase = {};
// user database
const usersDatabase = {};

// helper functions
const { getUserByEmail, getURLByUserId, generateRandomString} = require('./helpers');

//homepage
app.get("/", (req, res) => {
  res.redirect("/login");
});

//urls
app.get("/urls", (req, res) => {
  const userId = req.session.id;
  
  if (!userId) {
    return res.status(400).send("you must be logged in <a href='/login'> try again</a>");
  }
  
  const varDatabase = getURLByUserId(userId, urlDatabase);
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
  const userId = req.session.id;

  if (!userId) {
    return res.status(400).send("you must be logged in <a href='/login'> try again</a>");
  }
  const templateVars = {username: usersDatabase[userId].email};
  res.render("urls_new", templateVars);
});

//show url associated w/ shortURL
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.id;
  const shortURL = req.params.shortURL;

  if (!urlDatabase[shortURL]) {
    return res.status(404).send("404 PAGE NOT FOUND");
  }

  if (!userId) {
    return res.status(400).send("you must be logged in <a href='/login'> try again</a>");
  }

  if (urlDatabase[shortURL].userId !== userId) {
    return res.status(403).send("Access Denied <a href='/urls'> try again</a>");
  }

  const varDatabase = getURLByUserId(userId, urlDatabase);
  const longURL = varDatabase[req.params.shortURL];
  const templateVars = { shortURL: shortURL, longURL: longURL, username: usersDatabase[userId].email};
  
  res.render("urls_show", templateVars);
});

//post to create new short url
app.post("/urls", (req, res) => {
  const userId = req.session.id;

  if (!userId) {
    return res.status(400).send("you must be logged in <a href='/login'> try again</a>");
  }

  const newURL = { userId : userId, longURL : req.body.longURL};
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = newURL;

  res.redirect(`/urls/${shortURL}`);
});

// post login
app.post("/login", (req, res) => {

  const email = req.body.email;
  if (!email) {
    return res.status(400).send("invalid email <a href='/login'> try again</a>");
  }
  const password = req.body.password;
  const user = getUserByEmail(email, usersDatabase);
  const testPassword = user.password;
  if (!user || !bcrypt.compareSync(password, testPassword)) {
    return res.status(400).send("invalid login <a href='/login'> try again</a>");
  }
  req.session.id = user.id;
  
  res.redirect('/urls');
});

// post register
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  if (getUserByEmail(email, usersDatabase)) {
    res.status(400).send("Email taken. <a href='/register'> try again </> ");
  }
  if (!email || !password) {
    res.status(400).send("Missing email or Password. <a href='/register'> try again </> ");
    return;
  }
  
  const userId = generateRandomString(6);
  const user = {userId, email, password};
  usersDatabase[userId] = user;
  usersDatabase[userId] = { id: userId, email: email, password: hashedPassword };
  req.session.id = userId;

  res.redirect(`/urls`);
});

// post logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});
 
// edit / POST / urls/shortURL
app.post("/urls/:shortURL/edit", (req, res) => {
  const userId = req.session.id;
  const shortURL = req.params.shortURL;
  
  if (!userId) {
    return res.status(400).send("you must be logged in <a href='/login'> try again</a>");
  }
  if (urlDatabase[shortURL].userId !== userId) {
    return res.status(403).send("Access Denied <a href='/urls'> try again</a>");
  }
  
  const longURL = req.body.longURL;
  const editURL = { userId: userId, longURL: longURL};
  urlDatabase[shortURL] = editURL;
  
  res.redirect('/urls');
});

// delete url
app.post('/urls/:shortURL/delete', (req, res) => {
  const userId = req.session.id;
  const shortURL = req.params.shortURL;
  
  if (!userId) {
    return res.status(400).send("you must be logged in <a href='/login'> try again</a>");
  }
  
  if (urlDatabase[shortURL].userId !== userId) {
    return res.status(403).send("Access Denied <a href='/login'> try again</a>");
  }

  delete urlDatabase[shortURL];

  res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("404 PAGE NOT FOUND");
  }
  
  const longURL = urlDatabase[shortURL].longURL;
  
  if (!longURL) {
    res.status(404).send("Error 404: Page Not Found");
  } else {
    res.redirect(longURL);
  }
});
// listening ...
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});