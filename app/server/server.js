var http    = require('http'),
    fs      = require('fs'),
    usersDB = require('./modules/users.js'),
    io      = require('socket.io').listen(9001); // for npm, otherwise use require('./path/to/socket.io') 

// Reducing socket.io log (debug) statements
io.set('log level', 2);

io.sockets.on('connection', function(socket) {
    console.log("========================================");
    
    socket.on('set_username', function(userName) {
        console.info('set username:', userName);
        console.info('for id:', socket.id);
        console.log("========================================");

        if (usersDB.nameNotExist(userName)) {
            console.log('//userNotExist');

            usersDB.addNewUser(socket.id, userName);
            userNameAvailable(socket.id, userName);
            userJoined(userName);
        }
        else if (usersDB.socketIdExist(socket.id)) {
            socketsOfClients[socket.id] = userName;
            userNameAvailable(socket.id, userName);
            userJoined(userName);
        }
        else {
            userNameAlreadyInUse(socket.id, userName);
        }
    });
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
        var usr = usersDB.findUserById(socket.id);
        usersDB.removeUser(socket.id);

        userLeft(usr.userName);
    })
})

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

function userNameAvailable(sId, uName) {
    setTimeout(function() {

        console.log('Sending welcome msg to ' + uName + ' at ' + sId);
        io.sockets.sockets[sId].emit('welcome', {
            "userName": uName,
            "currentUsers": JSON.stringify(usersDB.getList())
        });

    }, 500);
}

function userNameAlreadyInUse(sId, uName) {
    setTimeout(function() {
        io.sockets.sockets[sId].emit('error', {
            "userNameInUse": true
        });
    }, 500);
}
