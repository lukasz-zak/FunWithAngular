'use strict'

angular.module('FunWithAngular.services')
  .factory('Messages', ['socket', function (socket) {

    var messages = [];

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

    function isWindowIsActive(){
      return window.document.hasFocus();
    }

    function addNewMessage(msg){
      msg.time = getMsgTime();
      msg.message = chatStringCreateUrls(removeHtmlTags(msg.message));
      messages.push(msg);
    }

    (function addAudioToPage(){
      $('<audio id="chatAudio"><source src="sounds/notify.mp3" type="audio/mpeg"></audio>').appendTo('body');
    })();

    socket.on('newMessage', function(msg){
      addNewMessage(msg);

      $('.msgWindow').animate({
        "scrollTop" : $('.msgWindow')[0].scrollHeight
      }, "slow");

      if(isWindowIsActive()){
        $('#chatAudio')[0].play();

        if(window.webkitNotifications !== undefined){
          if (window.webkitNotifications.checkPermission() == 0) {
            var notify = window.webkitNotifications.createNotification(
              "http://devgirl.org/wp-content/uploads/2013/03/angular-logo.jpeg",
              msg.authorName,
              msg.message
            );
            notify.addEventListener('click', function () { window.focus(); })
            notify.show(); // note the show()
                   
            setTimeout(function() {
              notify.close();
            }, 5000);
          }
        }
      }
    });

  
    return {

      getMessages : function(){
        return messages;
      },

      addMessage : function (msg) {
        addNewMessage(msg);
      }

    };
  }])