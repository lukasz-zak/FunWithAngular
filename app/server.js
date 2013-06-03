var http = require('http'),
    fs   = require('fs'),
    io   = require('socket.io').listen(9001); // for npm, otherwise use require('./path/to/socket.io') 

// Reducing socket.io log (debug) statements
io.set('log level', 2);
  
var clients = {};
var userColors = {};
var socketsOfClients = {};

io.sockets.on('connection', function(socket) {
    console.log("socketID: ", socket.id);
    
    socket.on('set_username', function(userName) {
        console.info('set username:', userName);
        // Is this an existing user name?
        if (clients[userName] === undefined) {
            // Does not exist ... so, proceed
            clients[userName] = socket.id;
            socketsOfClients[socket.id] = userName;
            userColors[userName] = get_random_color();
            userNameAvailable(socket.id, userName);
            userJoined(userName);
        }
        else if (clients[userName] === socket.id) {
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
            // Infer user name based on the socket id
            srcUser = socketsOfClients[socket.id];
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
                "userColor" : userColors[srcUser]
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
        var uName = socketsOfClients[socket.id];
        delete socketsOfClients[socket.id];
        delete clients[uName];

        // relay this message to all the clients
        userLeft(uName);
    })
})

function userJoined(uName) {
    console.log('userJoined', uName)
    Object.keys(socketsOfClients).forEach(function(sId) {
        io.sockets.sockets[sId].emit('userJoined', {
            "userName": uName,
            "amount": Object.keys(clients).length,
            "userColor": userColors[uName]
        });
    })
}

function get_random_color() {
    var letters = '0123456789ABCD'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * (letters.length - 1))];
    }
    return color;
}

function userLeft(uName) {
    io.sockets.emit('userLeft', {
        "userName": uName,
        "amount": Object.keys(clients).length
    });
}

function userNameAvailable(sId, uName) {
    setTimeout(function() {

        console.log('Sending welcome msg to ' + uName + ' at ' + sId);
        io.sockets.sockets[sId].emit('welcome', {
            "userName": uName,
            "currentUsers": JSON.stringify(Object.keys(clients))
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
