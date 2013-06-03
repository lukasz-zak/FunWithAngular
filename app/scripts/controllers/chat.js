'use strict';

angular.module('FunWithAngular')
  .controller('ChatCtrl', function ($scope, socket, Users) {

  	//Socket listeneres
  	//=============================================

  	socket.on('disconnect', function(){
	    console.log('disconnected !!')
	    if(myUserName && myUserName.length > 0) {
	        socket.emit('set_username', myUserName);
	    }
	});

	socket.on('userJoined', function(msg) {
        appendNewUser(msg.userName);
        setUsersAmount(msg.amount);
    });

    socket.on('userLeft', function(msg) {
        handleUserLeft(msg);
    });

    socket.on('message', function(msg) {
        appendNewMessage(msg);
    });

    socket.on('welcome', function(msg) {
        $scope.userName = "Hello " + msg.userName;
        $('form').hide();
        $('.msgWindow').removeClass('hidden');
        
        setFeedback("Username available. You can begin chatting.", 'success');
        
        setCurrentUsers(msg.currentUsers);
        enableMsgInput(true);
        enableUsernameField(false);
    });

    socket.on('error', function(msg) {
        if (msg.userNameInUse) {
            setFeedback("Username already in use. Try another name.", 'error');
            $('button#startChat').text('Start');
        }
    });

    $scope.usersAmount = 0;
    $scope.partialsUrl = '/views/partials/';
    $scope.usersListPartial = $scope.partialsUrl + 'usersList.html';

    //to check if user on list is me or not
    $scope.checkIfMe = function(index){
    	if($scope.usersList[index].isItMe == true)
    		return 'itsMe';
    	else
    		return '';
    }

    $scope.$watch(function(){
    	$scope.usersList = Users.getUsersList();
    });


    var hidden = 'hidden';
	var myUserName;

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
	        window.onpageshow = window.onpagehide 
	            = window.onfocus = window.onblur = onchange;
	}

	function addAudioToPage(){
	    $('<audio id="chatAudio"><source src="/sounds/notify.ogg" type="audio/ogg"><source src="notify.mp3" type="audio/mpeg"><source src="notify.wav" type="audio/wav"></audio>').appendTo('body');
	}

	function checkNotificationPermission(){
	    if(window.webkitNotifications !== undefined){
	        if (window.webkitNotifications.checkPermission() === 0) { // 0 is PERMISSION_ALLOWED
	            console.log("webkitNotifications permission not granded");
	        } else {
	            window.webkitNotifications.requestPermission();
	        }
	    }
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

	function enableMsgInput(enable) {
	    $('input.msgInput').prop('disabled', !enable);
	    enablePrivMsg();
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
	    window.document.title = getMsgTime() + " " + msg.source;
	    
	    var html
	    var span = $("<span></span>");
	    span.addClass('allMsg').css('color', msg.userColor);
	    
	    var b = $("<b></b>");
	    var user = b.append(" " + msg.source);
	    
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

	function appendNewUser(uName) {
	    var meClass = '';
	    if(uName === myUserName)
	        meClass = 'itsMe';
	    
	    var newUser = $("<span id='user-"+uName+"' class='user "+meClass+"'>"
	            + "<i class='icon-chevron-right'></i> "+ uName
	            + "<button class='hide btn btn-mini' type='button'><i class='icon-comment'></i></button></span>");

	    Users.addNew(uName, uName === myUserName);
	    checkNotificationPermission();
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

	function setUsername() {
	    myUserName = $('input#userName').val();
	    $('button#startChat').text('Please wait...');
	    socket.emit('set_username', $('input#userName').val());
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

	function setCurrentUsers(usersStr) {
	    Users.removeAll();
	    JSON.parse(usersStr).forEach(function(name) {
	        appendNewUser(name);});
	    enablePrivMsg();
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

	    enableMsgInput(false);
	    addAudioToPage();
	    isWindowIsActive();
	    
	    //Bootrap scripts
	    $(".alert").alert();

	    $('#startChat').on('click', function(e){
	        e.preventDefault();
	        setUsername();
	    });
	    
	    $('#userName').on('click', function(){
	       checkNotificationPermission();
	    });

	    inputEnterDetection();
  });
