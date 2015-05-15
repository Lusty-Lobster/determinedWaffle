angular.module('thumbsCheckApp')
.controller('ReflectionCtrl', function($scope, $firebaseObject, $firebaseArray, Ref, user, verifyInstructorService, tallyUpStudentResponsesService, pickRandomService) {
  // To get userID.role from web browser localStorage
  verifyInstructorService.verifyIfInstructor(user.uid);

  // Show only one reflection at a time
  $scope.oneAtATime = true;

  $scope.reflections = $firebaseArray(Ref.child('reflections'));
  $scope.state = $firebaseObject(Ref.child('state'));

  $scope.curReflection;
  $scope.curTopics;
  $scope.curResponses;

  $scope.state.$loaded().then(function(){
    $scope.state.$watch(function(){
      $scope.curReflection = $firebaseObject(
        Ref.child('reflections')
        .child($scope.state.reflection)
      );
      $scope.curTopics = $firebaseArray(
        Ref.child('reflections')
        .child($scope.state.reflection)
        .child('topics')
      );
      $scope.curTopics.$loaded().then(function(){
        $scope.curTopics.$watch(function(){
          $scope.stackedResponses=[ ];
          for( var i=0; i<$scope.curTopics.length; i++ ){
            console.log('curtopics ', $scope.curTopics);
            console.log('length ', $scope.curTopics[i].responses.length);
            for( var k=0; k<$scope.curTopics[i].responses.length; k++){

            }
          }
          console.log('changed', $scope.curResponses);
        });
      });
      console.log($scope.curResponses);
    });
  })

  $scope.addReflection = function( title ) {
    $scope.reflections.$loaded().then(function(){
      $scope.reflections.$add({
        title: title,
        topics: []
      });
    });

    $scope.topic = '';
  };

  $scope.addTopicToReflection = function(reflection, topic) {
    $firebaseArray(
      Ref.child('reflections')
      .child(reflection.$id)
      .child('topics')
    )
    .$loaded().then(function(topics){
      console.log(topics);
      topics.$add({
        topic: topic,
        responses: []
      });
    });

    $scope.topic = '';
  };

  $scope.pushReflection = function(reflection) {
    $scope.state.$loaded().then(function(){
      console.log('state.reflection = ', reflection.$id);  
      $scope.state.reflection = reflection.$id;

      $scope.state.$save();
    });
  }
});
