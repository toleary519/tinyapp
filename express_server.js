
// setup 
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

app.use(express.urlencoded({extended: true}));
app.use(cookieParser())
app.set("view engine", "ejs");

// string generator
const generateRandomString = () => Math.random().toString(32).substr(2,6);

//starting url database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
const getUserByEmail = function(email) {
  const users = Object.values(usersDatabase);
  for (const user of users) {
    if(user.email === email) {
      return user;
    }
  }
}

//homepage
app.get("/", (req, res) => {
  res.render("homepage");
});

//urls
app.get("/urls", (req, res) => {
  
  const userId = req.cookies["id"];
  console.log("req.cookies", req.cookies);
  if (!userId) {
    res.redirect("/register");
    return
  } 
  
  const templateVars = { urls: urlDatabase, username: usersDatabase[userId].email};
  res.render("urls_index", templateVars);
});

//register
app.get("/register", (req, res) => {
  const templateVars = {username: req.cookies["username"]}; 
  res.render("registration", templateVars);
});

//login
app.get("/login", (req, res) => {
  const templateVars = {username: req.cookies["username"]}; 
  res.render("login", templateVars);
});

//new urls
app.get("/urls/new", (req, res) => {
const username = usersDatabase[req.cookies["id"]]

  if (!username) {
    res.redirect("/register");
    return
  } 
  const templateVars = {username: username};
  res.render("urls_new", templateVars);
});

//show url associated w/ shortURL
app.get("/urls/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  const shortURL = req.params.shortURL
  const username = req.cookies["username"]
  const templateVars = { shortURL: shortURL, longURL: longURL, username: username};
  res.render("urls_show", templateVars);
});

//post to create new short url
app.post("/urls", (req, res) => {


  const shortURL = generateRandomString(6);
  // console.log(req.body);
  urlDatabase[shortURL] = req.body.longURL  // Log the POST request body to the console
  res.redirect(`/urls/${shortURL}`)
});

// post login
app.post("/login", (req, res) => {

  const email = req.body.email 
  console.log("email", req.body);
  const password = req.body.password 

  const user = getUserByEmail(email);
  console.log(user);
  if (!user || user.password !== password){
    return res.status(400).send("invalid login <a href='/login'> try again</a>");
  }
  res.cookie("id", user.id);
  res.redirect('/urls');

});

// post register
app.post("/register", (req, res) => {
  const email = req.body.email 
  const password = req.body.password 

  if (getUserByEmail(email)) {
    res.status(400).send("Email taken. <a href='/register'> try again </> ");
  }

  if (!email || !password) {
    res.status(400).send("Missing email or Password. <a href='/register'> try again </> ");
    return; 
  }
  
  const userId = generateRandomString(6)
  const user = {userId, email, password} //bcrypt before pass
  usersDatabase[userId] = user;

  usersDatabase[userId] = { id: userId, email: email, password: password };
  
res.cookie("id", userId);
console.log("cookie:", userId, email );
res.redirect(`/urls`)
});

// post logout
app.post("/logout", (req, res) => {
  // const username = req.body.username
  res.clearCookie("id") 
  res.redirect('/login')
});
 
// edit / POST / urls/shortURL
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  // console.log(longURL);
  // console.log("req body", req.body);
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
})

// delete url
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL

  delete urlDatabase[shortURL];

  res.redirect('/urls');
});

app.get("/error", (req, res) => {
  res.send("Error 404");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (!longURL) {
    res.send("Error 404: Page Not Found")
  } else {
    res.redirect(longURL);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});