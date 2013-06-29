var http    = require('http'),
    usersDB = require('./modules/users.js'),
    flash = require('connect-flash')
    express = require('express'),
    app = express(),
    server = http.createServer(app),
    io = require('socket.io').listen(server),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    auth = require('./modules/auth.js');


//usersDB.addNewUser('adadda@#Edadq', 'Woo');


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
      if (req.isAuthenticated()) { return next(); }
      else res.json({'isAuthenticated' : false});
  }, function(req, res){
      console.log('isAuthenticated');
    var users = usersDB.getList();
    console.log('================USER: ', req.user);
    res.json({'isAuthenticated' : true, 'user' : req.user});
});


app.get('/login', function(req, res){
  res.render('partials/main', { user: req.user, message: req.flash('error') });
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
    console.log('/main')
    res.render('index')
})
// .get('*', function(req, res){
//     console.log('***')
//     res.render('index')
// });


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

    // socket.on('reconnectUser', function(data){
    //     console.log('reconnecting user', data.id, data.userName);
    //     usersDB.addReconnectedUser(socket.id, data);
    //     emitInfoAboutNewUser(data.userName);
    //     emitUsersList();
    // });

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




    socket.on('message', function(msg) {
        var srcUser;
        if (msg.inferSrcUser) {
            srcUser = usersDB.findUserById(socket.id);
            console.log(srcUser);
        }
        else {
            srcUser = msg.source;
        }

        if (msg.target == "All") {
            // broadcast
            io.sockets.emit('message', {
                "source": srcUser,
                "message": msg.message,
                "target": msg.target,
                "userColor" : srcUser.color
            });
        }
        else {
            // Look up the socket id
            console.log('target: ' + msg.target);
            console.log('clients: ' + clients[msg.target]);
            io.sockets.sockets[clients[msg.target]].emit('message', {
                "source": srcUser,
                "message": msg.message,
                "target": msg.target
            });
        }
    })

    socket.on('disconnect', function() {
        console.log('//userDisconnect')
         // var usr = usersDB.findUserById(socket.id);
         // console.log('urs: ', usr);
         // if(usr !== undefined){
         //     usersDB.removeUser(socket.id);
         //     userLeft(usr.userName);
         //     emitUsersList();
         // }
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

server.listen(process.env.PORT || 9000);