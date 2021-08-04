const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// const morgan = require('morgan')
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

app.use(express.urlencoded({extended: true}));
// app.use(morgan());
app.use(cookieParser())
app.set("view engine", "ejs");

const generateRandomString = () => Math.random().toString(32).substr(2,6);

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"], username: res.clearCookie["username"]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  const templateVars = { shortURL: req.params.shortURL, longURL: longURL, username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  console.log(req.body);
  urlDatabase[shortURL] = req.body.longURL  // Log the POST request body to the console
  res.redirect(`/urls/${shortURL}`)
});

// post /login
app.post("/login", (req, res) => {
  const username = req.body.username
  res.cookie('username', username) 
  // console.log(username);
  res.redirect(`/urls`)
});

// post /logout
app.post("/logout", (req, res) => {
  const username = req.body.username
  res.clearCookie('username', username) 
  res.redirect(`/urls`)
});

// edit / POST / urls/shortURL
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  console.log(longURL);
  console.log("req body", req.body);
  urlDatabase[shortURL] = longURL;

  res.redirect('/urls');

})

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL

  delete urlDatabase[shortURL];

  res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (!longURL) {
    res.send("Error 404: Page Not Found")
  } else {
    res.redirect(longURL);
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});