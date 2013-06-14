var usersDB = require('./users.js');

passport.use(new LocalStrategy(
  function(username, password, done) {
    process.nextTick(function(){
      usersDB.findUserByName(username, function (err, user) {
        console.log('^^^^^^');
        console.log(user);
        console.log('^^^^^^');
        if(err) { return done(err);}
        if(!user) {return done(null, false, {message: 'Unknown user ' + username});}
        return done(null, user);
      })
    });
  }));


passport.serializeUser(function(user, done) {
  console.log('serialize: ' + user.storeId);
  done(null, user.storeId);
});

passport.deserializeUser(function(id, done) {
  console.log('deserialize');
  usersDB.findById(id, function (err, user) {
    done(err, user);
  });
});
