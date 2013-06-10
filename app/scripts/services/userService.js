'use strict';

//TODO: remove in future...

angular.module('FunWithAngular.services')
 	.factory('Users', function(SocketConn, $rootScope){
		var user = {};
		var usersList = [];

		user.addNew = function(userName, isItMe){
			usersList.push({
				'userName' 	: userName,
				'isItMe' 	: isItMe || false
			});
		}

		user.removeByName = function(name){
			angular.forEach(usersList, function(value, key){
				if(value.userName === name)
					usersList.splice(key, 1);
			});
		}

		user.removeAll = function(){
			usersList.splice(0, usersList.length);
		}

		user.getUsersList = function(){
			console.log(usersList);
			return usersList;
		}

		return user;
	});