// finder fn


const getUserByEmail = function(email, usersDatabase) {
  const users = Object.values(usersDatabase);
  for (const user of users) {
    if(user.email === email) {
      return user.id;
    }
    if(!user.email) {
      return undefined;
    }
  }
}

module.exports = getUserByEmail; 



