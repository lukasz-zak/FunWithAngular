var UsersDB = function () {
    this.users = [];

    this.addNewUser = function (id, userName) {
        this.users.push({
            'id'        : id,
            'userName'  : userName,
            'color'     : getRandomColor()
        });
    }

    this.removeUser = function(id){
        this.users.pop(this.findUserById(id));
    }

    this.getList = function() {
        return this.users;
    }

    this.findUserById = function(id){
        var user;
        this.users.forEach(function(usr) {
            if(usr.id === id)
                user = usr;
        });
        return user;
    }

    this.socketIdExist = function(id){
        this.users.forEach(function(usr) {
            if(usr.id === id)
                return true;
            else
                return false;
        });   
    }

    this.nameNotExist = function(userName){
        var exist;
        if(this.users.length > 0){
            this.users.forEach(function(usr) {
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

module.exports = UsersDB;