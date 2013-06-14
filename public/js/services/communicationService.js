'use strict';

angular.module('FunWithAngular.services')
 	.factory('SocketConn', function($timeout, $q, $rootScope, socket, localStorageService){
 		
 		var usersList,
 			newJoiner,
 			myUsrName,
 			amount,
 			getCookies;

 		socket.on('usersList', function(data){
 			usersList = data;
 			console.log('usersList: ', usersList);
 			//$rootScope.$apply();
 		})

 		socket.on('newUserJoin', function(data){
 			newJoiner = data.userName;
 			localStorageService.add('user', JSON.stringify(data));
 			amount = data.amount;
 			//$rootScope.$apply();
 		})


 		socket.on('error', function(error){
 			if(error.userNameInUse && error.userNameInUse === true){
 				isAnyError = true;
 			}
 		});

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

 			reconnectUser : function (usrData) {
 				console.log('emit for reconnectUser');
 				socket.emit('reconnectUser', usrData);
 				myUsrName = usrData.userName;
 			},

 			logoutUser : function (id) {
 				console.log('emit for logout user');
 				//socket.emit('logoutUser', id);
 				socket.removeAllListeners();
 			},

 			getUsersAmount: function(){
 				return amount;
 			}, 

 			getUsers: function () {
 				return usersList;
 			},

 			getMyUsrName: function () {
 				console.log('getMyUsrName')
 				return myUsrName;
 			},

 			getNewJoiner : function(){
 				return newJoiner;
 			},

 			setMyUsrName: function (name) {
 				console.log('setUsrName' + name)
 				myUsrName = name;
 			},
 		}

 		//Socket listeneres
	  	//=============================================

	 //  	socket.on('disconnect', function(){
		//     console.log('disconnected !!')
		//     if(myUserName && myUserName.length > 0) {
		//         socket.emit('set_username', myUserName);
		//     }
		// });

		// socket.on('userJoined', function(msg) {
	 //        appendNewUser(msg.userName);
	 //        setUsersAmount(msg.amount);
	 //    });

	 //    socket.on('userLeft', function(msg) {
	 //        handleUserLeft(msg);
	 //    });

	 //    socket.on('message', function(msg) {
	 //        appendNewMessage(msg);
	 //    });

	 //    socket.on('welcome', function(msg) {
	 //        $scope.userName = "Hello " + msg.userName;
	 //        $('form').hide();
	 //        $('.msgWindow').removeClass('hidden');
	        
	 //        setFeedback("Username available. You can begin chatting.", 'success');
	        
	 //        setCurrentUsers(msg.currentUsers);
	 //        enableUsernameField(false);
	 //    });

	 //    socket.on('error', function(msg) {
	 //        if (msg.userNameInUse) {
	 //            setFeedback("Username already in use. Try another name.", 'error');
	 //            $('button#startChat').text('Start');
	 //        }
	 //    });

	});