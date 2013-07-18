var http    = require('http'),
    usersDB = require('./modules/users.js'),
    flash = require('connect-flash')
    express = require('express'),
    app = express(),
    server = http.createServer(app),
    io = require('socket.io').listen(server),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    auth = require('./modules/auth.js'),
    cleaningInterval = undefined;


app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {
    layout: false,
    pretty: true,
  });
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(express.static(__dirname + '/public'));
  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
});


app.get('/auth', function(req, res, next) {
    clearInterval(cleaningInterval);
    cleaningInterval = setInterval(cleanUsersList, 30000);

    if (req.isAuthenticated()) { return next(); }
    else res.json({'isAuthenticated' : false});
  }, function(req, res){
    console.log('isAuthenticated');
    res.json({'isAuthenticated' : true, 'user' : req.user});
});


app.get('/login', function(req, res){
  res.render('partials/chatLogin', { user: req.user, message: req.flash('error') });
});

app.get('/logout', function(req, res){
  if(usersDB.logoutUser(req.user)){
      req.session.destroy();
      res.json({'removed' : true, 'userName' : req.user.userName});   
      userLeft(req.user.userName);
  }else
      res.json({'removed' : false});
});

app.post('/user/login', 
  passport.authenticate('local', {failureRedirect: '/login', failureFlash: true }),
  function(req, res) {
      console.log('usr/login');
    res.json({
        user : req.user,
    });
  });

app.get('/partials/:view', function(req, res){
    var name = req.params.view;
    console.log('-------name-' + name);
    res.render('partials/' + name, { user: req.user, message: req.flash('error') });
}).get('/', function(req, res){
    console.log('/index')
    res.render('index')
})


io.set('log level', 2);

io.sockets.on('connection', function(socket) {
    console.log("========================================");
    
    socket.on('addNewUser', function(usrName, fn){
        console.log('...adding new user: '+ usrName) + "with id: " + socket.id;

        if (usersDB.nameNotExist(usrName)) {
            console.log('//userNotExist');

            usersDB.addNewUser(socket.id, usrName);
            fn(true);
        } else if(usersDB.socketIdExist(socket.id)) {
            console.log('exist in db');
        } else{
            //userNameAlreadyInUse(socket.id, usrName);
            console.log('//userEXIST');
            fn(false);
        }
    });

    socket.on('logoutUser', function (id) {
        console.log('logoutUser...');
        var usr = usersDB.findUserById(id);
        console.log('userToLogout: ', usr);
        if(usr !== undefined){
            usersDB.removeUser(id);
            userLeft(usr.userName);
            emitUsersList();
        }
        usersDB.removeIdFromTmp(id);
        socket.disconnect();
    })

    socket.on('fetchUserData', function(data){
        if(data != null){
          emitInfoAboutNewUser(data.userName);
          emitUsersList();
        }
    })

    socket.on('updateSocketID', function (user) {
        usersDB.updateSocketID(user, socket.id);
    })


    socket.on('sendMessage', function(msg) {
        usersDB.findUserByName(msg.authorName, function(zero, author){
            console.log("user from callback", author);

             if (msg.target == "All") {
                // broadcast
                console.log("emit newMsg....");
                io.sockets.emit('newMessage', {
                    "authorName"    : msg.authorName,
                    "message"       : msg.message,
                    "target"        : msg.target,
                    "userColor"     : author.color
                });
            } else {
                // Look up the socket id
                console.log('target: ' + msg.target);
                console.log('clients: ' + clients[msg.target]);
                io.sockets.sockets[clients[msg.target]].emit('message', {
                    "source": srcUser,
                    "message": msg.message,
                    "target": msg.target
                });
            }
        });
    })

    socket.on('disconnect', function() {
        console.log('//userDisconnect')
        //not implemented
    })
})


var emitInfoAboutNewUser = function (uName) {
    console.log('....emitting info about new user');
    var list = usersDB.getList();
    var clients = io.sockets.clients();
    clients.forEach(function(client){
        io.sockets.sockets[client.id].emit('newUserJoin', {
            "userName": uName
            ,"amount": list.length
        });
    });
}

var emitUsersList = function () {
    console.log('....emitting users list')
    var list = usersDB.getList();
    var clients = io.sockets.clients();
    if(list.length > 0){
        clients.forEach(function(client){
            io.sockets.sockets[client.id].emit('usersList', list);
        });
    }
}


function userJoined(uName) {
    console.log('//userJoined')
    usersDB.getList().forEach(function(user){
        io.sockets.sockets[user.id].emit('userJoined', {
            "userName": uName,
            "amount": usersDB.getList().length,
            "userColor": user.color
        });
    });
}

function userLeft(uName) {
    console.log('//userLeft')
    io.sockets.emit('userLeft', {
        "userName": uName,
        "amount": usersDB.getList().length
    });
}

function cleanUsersList () {
    var clients = io.sockets.clients();
    var list = usersDB.getList();

    if(clients.length !== list.length){
        list.forEach(function (user) {
            var flag = true;
            clients.forEach(function (client) {
                if(user.id === client.id){
                    flag = false;
                    return;
                }
            });
            if(flag){
                usersDB.removeUser(user);
                userLeft(user.userName);
                emitUsersList();
            }
        })
    }
}

cleaningInterval = setInterval(cleanUsersList, 30000);

server.listen(process.env.PORT || 9000);