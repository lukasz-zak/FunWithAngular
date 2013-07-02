'use strict';

angular.module('FunWithAngular')
  .controller('ChatCtrl', function ($scope, $rootScope, SocketConn, $location) {

	$scope.socketConnService = SocketConn;
  $scope.usersAmount = 0;
  $scope.usersListPartial = '/partials/usersList';

  $scope.logout = function(e){
  	e.preventDefault();
  	console.log('logout');
  	$location.url('/logout');
  }

  //to check if user on list is me or not
  $scope.checkIfMe = function(index){
    if(!angular.isUndefined($scope.usersList) 
        && $scope.usersList[index].userName === $scope.me.userName)
  		return 'itsMe';
  	else
  		return '';
  }

	$scope.$watch('socketConnService.getNewJoiner()', function(newVal, oldVal){
		console.group('watchingNewJoiner');
		console.log(newVal, oldVal);
		if(newVal !== undefined && newVal != null ){
			console.log("watching new joiner: " + newVal);
			$scope.usersAmount = $scope.socketConnService.getUsersAmount();
		    var msgForChat = {
	        "source": {
	        	'userName': 'SYSTEM'
	        },
	        "message": newVal +" join to chat.",
	        "target": 'All',
	        "userColor" : 'green'
	    	};
			appendNewMessage(msgForChat);
		}
		console.groupEnd('watchingNewJoiner');
    }, true);

  $scope.$watch('socketConnService.getUsers()', function(newVal, oldVal){
  	console.group('watchingGetUsers');
  	console.log(newVal, oldVal);
		if(newVal !== undefined){
			console.log("watching usersList: " + newVal);
			$scope.usersList = newVal;
			$scope.usersAmount = newVal.length;
		}
		console.groupEnd('watchingGetUsers');
  }, true);

  
  $scope.$watch('socketConnService.getNameOfLeaver()', function(newVal, oldVal){
    console.group('watchingNameOfLeaver');
    console.log(newVal, oldVal);
    if(newVal !== undefined){
      $scope.usersAmount = newVal.amount;
      var msgForChat = {
          "source": {
            'userName': 'SYSTEM'
          },
          "message": newVal.userName +" has left the chat.",
          "target": 'All',
          "userColor" : 'orange'
        };
      appendNewMessage(msgForChat);
    }
    console.groupEnd('watchingNameOfLeaver');
  }, true);

  var hidden = 'hidden';

	function onchange (evt) {
	    var v = 'visible', h = 'hidden',
	        evtMap = { 
	            focus:v, focusin:v, pageshow:v, blur:h, focusout:h, pagehide:h 
	        };

	    evt = evt || window.event;
	    if (evt.type in evtMap)
	        document.body.className = evtMap[evt.type];
	    else        
	        document.body.className = this[hidden] ? "hidden" : "visible";
	}

	function isWindowIsActive(){
    // Standards:
    if (hidden in document)
      document.addEventListener("visibilitychange", onchange);
    else if ((hidden = "mozHidden") in document)
      document.addEventListener("mozvisibilitychange", onchange);
    else if ((hidden = "webkitHidden") in document)
      document.addEventListener("webkitvisibilitychange", onchange);
    else if ((hidden = "msHidden") in document)
      document.addEventListener("msvisibilitychange", onchange);
    // IE 9 and lower:
    else if ('onfocusin' in document)
      document.onfocusin = document.onfocusout = onchange;
    // All others:
    else
      window.onpageshow = window.onpagehide = window.onfocus = window.onblur = onchange;
	}

	function addAudioToPage(){
	  $('<audio id="chatAudio"><source src="/sounds/notify.ogg" type="audio/ogg"><source src="notify.mp3" type="audio/mpeg"><source src="notify.wav" type="audio/wav"></audio>').appendTo('body');
	}



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
              enableMsgInput('enable');
              inputEnterDetection('#prv-' + target);
            });
      } else{
        $('#chatRooms a#'+targetTab).tab('show');
      }
    });
	}

	function enableUsernameField(enable) {
	    $('input#userName').prop('disabled', !enable);
	    if(enable)
	        $('#startChat').removeClass('disabled');
	    else
	        $('#startChat').addClass('disabled');
	}

	function getMsgTime(){
	    var d = new Date();
	    var HH = d.getHours() < 10 ? "0" + d.getHours() : d.getHours();
	    var MM = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();
	    var SS = d.getSeconds() < 10 ? "0" + d.getSeconds() : d.getSeconds();
	    return HH + ":" + MM + ":" + SS;
	}

	function chatStringCreateUrls(input){
	    return input
	        .replace(/<br>/gim, '\n')
	        .replace(/(ftp|http|https|file):\/\/[\S]+(\b|$)/gim, '<a href="$&" class="my_link" target="_blank">$&</a>')
	        .replace(/([^\/])(www[\S]+(\b|$))/gim, '$1<a href="http://$2" class="my_link" target="_blank">$2</a>')
	        .replace(/\n/gim, '<br>');
	}

	function removeHtmlTags(input){
	    return input.replace(/(<([^>]+)>)/ig,"");
	}

	function appendNewMessage(msg) {
	    window.document.title = getMsgTime() + " " + msg.source.userName;
	    
	    var html
	    var span = $("<span></span>");
	    span.addClass('allMsg').css('color', msg.userColor);
	    
	    var b = $("<b></b>");
	    var user = b.append(" " + msg.source.userName);
	    
	    var timeTag = $("<code></code>");
	    timeTag.append(getMsgTime());
	    
	    span.prepend(timeTag);
	    span.append(user);
	    span.append(": " + chatStringCreateUrls(removeHtmlTags(msg.message)));
	    span.append("<br />");
	    
	    if (msg.target == "All") {
	        html = span;
	    }else {
	        // It is a private message to me
	        html = "<span class='privMsg'>" + msg.source + " (P) : " + msg.message + "</span><br/>";
	    }
	    $('.msgWindow').append(html);
	    $('.msgWindow').animate({
	        "scrollTop": $('.msgWindow')[0].scrollHeight
	        }, "slow");
	    if($('body').hasClass('hidden')){
	        $('#chatAudio')[0].play();
	        if(window.webkitNotifications !== undefined){
	            if (window.webkitNotifications.checkPermission() == 0) {
	                var notify = window.webkitNotifications.createNotification(
	                    "http://www.w3.org/html/logo/downloads/HTML5_Logo_256.png",
	                    msg.source,
	                    msg.message);
	                    
	                notify.show(); // note the show()
	                
	                setTimeout(function() {
	                    notify.close();
	                }, 5000);
	            }
	        }
	    }
	}

	function handleUserLeft(msg) {
	    Users.removeByName(msg.userName);
	    var msgForChat = {
	            "source": 'SYSTEM',
	            "message": msg.userName+" has left chat.",
	            "target": 'All',
	            "userColor" : 'red'
	    };
	    appendNewMessage(msgForChat)
	    setUsersAmount(msg.amount);
	}

	function setFeedback(msg, type) {
	    var alertCont = $("<div class='alert fade in'>"
	            + "<a class='close' data-dismiss='alert' href='#'>&times;</a>"
	            + "<em></em>"
	            + "</div>");
	    
	    alertCont.find('em').html(msg);
	    alertCont.addClass('alert-'+ type);
	    $('#alertsDiv').append(alertCont);
	    alertCont.fadeIn().delay(10000).fadeOut('slow', function(){
	        $(this).remove();
	    });
	}

	function setUsersAmount(amount){
	    $scope.usersAmount = amount;
	}

	function setUsername(usrName) {
	    //myUserName = $('input#userName').val();
	    //$('button#startChat').text('Please wait...');
	    socket.emit('set_username', usrName);
	}

	function sendMessage(assignedID) {
	    if(assignedID !== ''){
	        var trgtUser = assignedID.replace('#prv-user-', '')
	    }
	    socket.emit('message', {
	        "inferSrcUser": true,
	        "source": "",
	        "message": $('input'+assignedID+'.msgInput').val(),
	        "target": trgtUser || 'All'
	    });
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

    addAudioToPage();
    isWindowIsActive();
    inputEnterDetection()
    
    //Bootrap scripts
    $(".alert").alert();
  })
.controller('chatLoginCtrl', function($q, $scope, $http, $location, SocketConn, localStorageService){

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
    
}).controller('chatLogoutCtrl', function($location, $scope, SocketConn){
	SocketConn.logoutUser();

	$location.path('/');
})
