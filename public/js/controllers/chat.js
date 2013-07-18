'use strict';

angular.module('FunWithAngular').controller('ChatCtrl',
	function ($scope, $rootScope, SocketConn, Messages, $location) {

  $scope.socketConnService = SocketConn;
  $scope.usersAmount = 0;
  $scope.usersListPartial = '/partials/usersList';


  $scope.messages = Messages.getMessages();

  $scope.logout = function(e){
  	e.preventDefault();
  	console.log('logout');
  	$location.url('/logout');
  }

  $scope.$watch('socketConnService.getNewJoiner()', function(newVal, oldVal){
  	console.group('watchingNewJoiner');
  	console.log(newVal, oldVal);
  	if(newVal !== undefined && newVal != null ){
  	  console.log("watching new joiner: " + newVal);
  	  $scope.usersAmount = $scope.socketConnService.getUsersAmount();
  	  var msgForChat = {
  	    "authorName" : 'SYSTEM',
  	    "message": newVal +" join to chat.",
  	    "target": 'All',
  	    "userColor" : 'green'
  	  };
      Messages.addMessage(msgForChat);
  	}
  	console.groupEnd('watchingNewJoiner');
  }, true);

  $scope.$watch('socketConnService.getUsers()', function (newVal, oldVal){
  	console.group('watchingGetUsers');
  	console.log(newVal, oldVal);
		if(newVal !== undefined){
			console.log("watching usersList: " + newVal);
			$scope.usersList = newVal;
			$scope.usersAmount = newVal.length;
		}
		console.groupEnd('watchingGetUsers');
  }, true);

  
  $scope.$watch('socketConnService.getNameOfLeaver()', function (newVal, oldVal){
    console.group('watchingNameOfLeaver');
    console.log(newVal, oldVal);
    if(newVal){
      $scope.usersAmount = newVal.amount;
      var msgForChat = {
          "authorName" : 'SYSTEM',
          "message": newVal.userName +" has left the chat.",
          "target": 'All',
          "userColor" : 'orange'
        };
      Messages.addMessage(msgForChat);
    }
    console.groupEnd('watchingNameOfLeaver');
  }, true);

  $scope.$watch('socketConnService.getLastMsg()', function (newVal, oldVal) {
  	console.group('waatchningLastMsg');
  	console.log("msgObj: ", newVal);

  	if(newVal !== undefined){
      Messages.addMessage(newVal);
  	}

  	console.groupEnd('waatchningLastMsg');
  }, true);

  

  function enablePrivMsg(){
    $('#usersList span.user > button').on('click', function(e){
      var destUser = $(this).parent().attr('id').replace('user-', '');
      var target = 'user-' + destUser;
      var targetTab = target + '-tab';
      
      if($('#'+ targetTab).length === 0){
        var newNavToRoom = $("<li><a id='"+targetTab+"' href='#"+target+"' data-toggle='tab'>"+destUser+"</a></li>");
        $("ul#chatRooms").append(newNavToRoom);
        $('#Home.msgWindow').hide();
        $.get('chat/getWindow',
          {'tabID' : target})
            .done(function(data){
              var newTabContent = $('<div id="'+target+'" class="tab-pane"></div>')
              var $data = $(data);
              $data.find('.msgInput').attr('id', 'prv-' + target);
              newTabContent.html($data);
              $('.tab-content').append(newTabContent);
              $('#chatRooms a#'+targetTab).tab('show');
              inputEnterDetection('#prv-' + target);
            });
      } else{
        $('#chatRooms a#'+targetTab).tab('show');
      }
    });
  }

	
	function sendMessage(assignedID) {
		if(assignedID !== ''){
			var trgtUser = assignedID.replace('#prv-user-', '')
	  }

		var msgObj = {
			"authorName"	: $scope.me.userName,
	    "message"			: $('input'+assignedID+'.msgInput').val(),
	    "target"			: trgtUser || 'All'
	  };

	  $scope.socketConnService.sendMessage(msgObj);
	  $('input.msgInput').val("");
	}

  function inputEnterDetection(assignedID){
    if(assignedID === undefined)
	    assignedID = '';
    $('input'+assignedID+'.msgInput').keypress(function(e) {
      if (e.keyCode == 13) {
		    sendMessage(assignedID);
		    e.stopPropagation();
		    e.stopped = true;
		    e.preventDefault();
      }
    });
  }

  inputEnterDetection();
  

}).controller('chatLoginCtrl',
	function($q, $scope, $http, $location, SocketConn, localStorageService){

  $scope.close = function () {
    $scope.closeMsg = 'I was closed at: ' + new Date();
    $scope.shouldBeOpen = false;
  };

  $scope.opts = {
    backdropFade: true,
    dialogFade: true
  };

	$scope.loginFormValid = 'disabled';

	$scope.toggleLoginBtn = function(input){
		if(input !== undefined && input.length > 0 )
	   	$scope.loginFormValid = ''
	  else
	   	$scope.loginFormValid = 'disabled';
	}

  $scope.sendForm = function(){

	SocketConn.addNewUser(this.loginInput)
		.then(function (result) {
			console.log(result);
			if(result.success)
				$http.post('/user/login/', {
					'username' : result.userName,
					'password' : 'pony'
				}).success(function(data, status){
					//success
					console.log(data)
					console.log(status);
					console.log('success with adding new User');
					if(data.user && data.user.id){
						SocketConn.setMyUsrName(data.user.userName);
						$location.path('/chat');
					}
				});
		}, function (result) {
			console.log('error!: ' + result);
			$scope.warning = result;
			$scope.shouldBeOpen = true;
		});
  }
    
}).controller('chatLogoutCtrl',
	function($location, $scope, SocketConn){

	SocketConn.logoutUser();
	$location.path('/');
})
