var http    = require('http'),
    fs      = require('fs'),
    usersDB = require('./modules/users.js'),
    io      = require('socket.io').listen(9001); // for npm, otherwise use require('./path/to/socket.io') 

// Reducing socket.io log (debug) statements
io.set('log level', 2);

io.sockets.on('connection', function(socket) {
    console.log("========================================");
    
    socket.on('addNewUser', function(usrName, fn){
        console.log('...adding new user: '+ usrName) + "with id: " + socket.id;

        if (usersDB.nameNotExist(usrName)) {
            console.log('//userNotExist');

            usersDB.addNewUser(socket.id, usrName);
            emitInfoAboutNewUser(usrName);
            emitUsersList();
            fn(true);
        } else if(usersDB.socketIdExist(socket.id)) {
            console.log('exist in db');
        } else{
            userNameAlreadyInUse(socket.id, usrName);
            fn(false);
        }
    });

    socket.on('reconnectUser', function(data){
        console.log('reconnecting user', data.id, data.userName);
        usersDB.addReconnectedUser(socket.id, data);
        emitInfoAboutNewUser(data.userName);
        emitUsersList();
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
        console.log('urs: ', usr);
        if(usr !== undefined){
            usersDB.removeUser(socket.id);
            userLeft(usr.userName);
            emitUsersList();
        }
    })
})


var emitInfoAboutNewUser = function (uName) {
    console.log('....emitting info about new user');
    var list = usersDB.getList();
    list.forEach(function(user){
        io.sockets.sockets[user.id].emit('newUserJoin', {
            "userName": uName
            ,"amount": list.length
            ,"userColor": user.color
            ,'id': user.id
        });
        //io.sockets.sockets[user.id].emit('newUserJoin', uName);
    });
}

var emitUsersList = function () {
    console.log('....emitting users list')
    var list = usersDB.getList();
    if(list.length > 0){
        list.forEach(function(user){
            io.sockets.sockets[user.id].emit('usersList', list);
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
    io.sockets.sockets[sId].emit('error', {
        "userNameInUse": true
    });
}
