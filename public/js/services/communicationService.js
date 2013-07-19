'use strict';

angular.module('FunWithAngular.services')
 	.factory('SocketConn', function($timeout, $q, $http, $location, $rootScope, socket){
 		
 		var usersList,
 			newJoiner,
 			myUsrName,
 			amount,
      userWhoLeft,
      lastMessage;


    //Listeners for sockets
 		socket.on('usersList', function(data){
 			usersList = data;
 			console.log('usersList: ', usersList);
 		})

 		socket.on('newUserJoin', function(data){
 			newJoiner = data.userName;
 			amount = data.amount;
 		})

    socket.on('userLeft', function (data) {
      console.log("SockOn => UserLeft:", data);
      userWhoLeft = data;
    })

 		return {
			addNewUser: function(usrName){
				console.log('emit add new user');

				var result = {
					userName: '',
					success: false
				},
				defer = $q.defer();

				socket.emit('addNewUser', usrName, function(response){
					if (response) {
						result.success = true;
						result.userName = usrName;
						
						defer.resolve(result);
					} else{
						defer.reject('User name already used');
					}
				});
				return defer.promise;
			},
            
      isAuthenticated : function(destPath){
        var defer = $q.defer();
        var user;

        $http.get('/auth').success(function(data, status){
          if(data.isAuthenticated === true && destPath === '/chat'){

            socket.emit('fetchUserData', data.user, function (response) {
              if(response){
                socket.emit('updateSocketID', data.user, function (response) {
                  if(response){
                    defer.resolve(data);
                  }
                });
              }
            });
          } else if(data.isAuthenticated === true && destPath === '/'){
            defer.reject(data)
            $location.path('/chat');
          } else if(data.isAuthenticated === false && destPath === '/chat'){
            defer.reject(data)
            $location.path('/');
          } else if(data.isAuthenticated === false && destPath === '/'){
            defer.resolve(data)
          }
        })
        
        return {
        	'promise' : defer.promise,
        	'user'	: user
        }
      },

 			logoutUser : function () {
        var defer = $q.defer();

        $http.get('/logout').success(function(data, status){
          if(data.removed){
            newJoiner = null;
            usersList = [];
            defer.resolve();
          }
        });

        return defer.promise;
 			},

 			getUsersAmount: function(){
 				return amount;
 			}, 

 			getUsers: function () {
 				return usersList;
 			},

 			getNewJoiner : function(){
 				return newJoiner;
 			},

      getNameOfLeaver: function () {
        var info = userWhoLeft;
        userWhoLeft = null;
        return info;
      },

      getLastMsg : function () {
        return lastMessage;
      },

 			setMyUsrName: function (name) {
 				console.log('setUsrName' + name)
 				myUsrName = name;
 			},

      sendMessage: function (msgObj) {
        socket.emit('sendMessage', msgObj);
      }
 		}

	});