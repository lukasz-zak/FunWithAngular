'use strict';

angular.module('FunWithAngular')
    .controller('MainCtrl', function ($scope, localStorageService) {
    
    // $scope.todos = [
    //     'item 1',
    //     'item 2',
    //     'item 3'
    // ];
    $scope.sortableOptions = {
        update: function(e, ui) {
            console.log(ui.item);
            $('body').css('background-color', 'red');
            //console.log($scope.todos);
        },
        "cursor" : "move"
    };
    
    
    var todosInStore = localStorageService.get('todos');
    $scope.todos = todosInStore && todosInStore.split('\n') || [];
    $scope.$watch(function(){
        console.log($scope.todos[0]);
        localStorageService.add('todos', $scope.todos.join('\n'));
    })
    
    $scope.addTodo = function(){
        $scope.todos.push($scope.todo);
        $scope.todo = '';
    };
    
    $scope.removeItem = function(index){
        $scope.todos.splice(index, 1);
    }
    
  });
