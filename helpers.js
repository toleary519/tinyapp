// finder fn


const getUserByEmail = function(email, usersDatabase) {
  const users = Object.values(usersDatabase);
  for (const user of users) {
    if(user.email === email) {
      return user;
    }
    if(!user.email) {
      return undefined;
    }
  }
}

const getURLByUserId = function(userId, urlDatabase) {
  const filteredData ={};
  
  for (const key in urlDatabase) {
    if (urlDatabase[key].userId === userId) {
      filteredData[key] = urlDatabase[key].longURL
    }
  }

  return filteredData; 
}

module.exports = {getUserByEmail, getURLByUserId}; 



