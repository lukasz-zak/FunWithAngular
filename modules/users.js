var UsersDB = function () {
    var that = this;
    that.users = [];

    var idsForVerify = []; //to check if reconnected user was here before

    that.addNewUser = function (id, userName) {
        that.users.push({
            'storeId'   : that.users.length + 1, 
            'id'        : id,
            'userName'  : userName,
            'color'     : getRandomColor()
        });
        idsForVerify.push(id);
        that.getList();
    }

    that.logoutUser = function (user) {
        console.log("user to logout", user);
        if(that.removeUser(user))
          return true;
        else
          return false;
    }

    that.removeUser = function(user){
        console.log('@: removing user');
        if(user){
          that.users.pop(user);
          return true;
        }else{
          return false;
        }
    }

    that.removeIdFromTmp = function(id){
        console.log('@: removing id from tmp array: ' + id);
        var index = idsForVerify.indexOf(id);
        idsForVerify.splice(index, 1);
    }

    that.getList = function() {
        return that.users;
    }

    that.findUserById = function(id){
        console.log('find user by id');
        var user;
        that.users.forEach(function(usr) {
            if(usr.id === id)
                user = usr;
        });
        return user;
    }

    that.findUserByName = function (name, fn) {
        console.log('find user by name: ' + name);
        var user;
        that.users.forEach(function(usr) {
            console.log('usr : ' + usr.userName);
            if(usr.userName === name){
                user = usr;
                console.log('yeah!');
            }
        });
        return fn(null, user);
    }

    that.updateSocketID = function (user, socketID) {
        that.users[user.storeId - 1].id = socketID;
    }


    that.findById = function(id, fn) {
        console.log('id: ' + id);
        var idx = id - 1;
        if (that.users[idx]) {
            console.log('retun : ' + that.users[idx]);
            fn(null, that.users[idx]);
        } else {
            fn(new Error('User ' + id + ' does not exist'));
        }
    }

    that.socketIdExist = function(id){
        that.users.forEach(function(usr) {
            if(usr.id === id)
                return true;
            else
                return false;
        });   
    }

    that.nameNotExist = function(userName){
        var exist;
        if(that.users.length > 0){
            that.users.forEach(function(usr) {
                usr.userName === userName
                    ? exist = false
                    : exist = true;
            });
        } else exist = true;

        return exist;
    }

    //private method
    var getRandomColor = function() {
	    var letters = '0123456789ABCD'.split('');
	    var color = '#';
	    for (var i = 0; i < 6; i++ ) {
	        color += letters[Math.round(Math.random() * (letters.length - 1))];
	    }
	    return color;
	}

};

module.exports = new UsersDB();