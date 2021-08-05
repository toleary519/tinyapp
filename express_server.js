
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
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

//homepage
app.get("/", (req, res) => {
  res.send("Hello!");
});

//urls
app.get("/urls", (req, res) => {
  
  if (!usersDatabase[req.cookies["id"]]) {
    res.redirect("/register");
    return
  } 
  
  
  const templateVars = { urls: urlDatabase, username: usersDatabase[req.cookies["id"]].email};
  //, username: res.clearCookie["id"]
  // console.log("req.cook.id:", usersDatabase[req.cookies["id"]].email);
  // console.log("template vars", templateVars);
  res.render("urls_index", templateVars);
});

//register
app.get("/register", (req, res) => {
  const templateVars = {username: req.cookies["username"]}; 
  res.render("registration", templateVars);
});

//new urls
app.get("/urls/new", (req, res) => {
  const templateVars = {username: usersDatabase[req.cookies["id"]].email};
  res.render("urls_new", templateVars);
});

//show url associated w/ shortURL
app.get("/urls/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  const templateVars = { shortURL: req.params.shortURL, longURL: longURL, username: req.cookies["username"]};
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
  const username = req.body.username
  res.cookie('username', username) 
  // console.log(username);
  res.redirect(`/urls`)
});

// post register
app.post("/register", (req, res) => {
  
  for (const userId in usersDatabase) {
    if (usersDatabase[userId].email === req.body.email) {
      res.redirect("/register");
      return;
    }
  }
  if (req.body.email.length === 0 || req.body.password.length === 0) {
    res.redirect("/register");
    return; 
  }
  const userId = generateRandomString(6)
  console.log("req.body", req.body)
  usersDatabase[userId] = { id: userId, email: req.body.email, password: req.body.password };
  
res.cookie("id", userId)
// console.log(usersDatabase)
res.redirect(`/urls`)
});

// post logout
app.post("/logout", (req, res) => {
  // const username = req.body.username
  res.clearCookie("id") 
  res.redirect(`/urls`)
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