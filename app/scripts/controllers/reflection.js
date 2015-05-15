angular.module('thumbsCheckApp')
.controller('ReflectionCtrl', function($scope, $firebaseObject, $firebaseArray, Ref, user, verifyInstructorService, tallyUpStudentResponsesService, pickRandomService) {
  // To get userID.role from web browser localStorage
  verifyInstructorService.verifyIfInstructor(user.uid);

  // Show only one reflection at a time
  $scope.oneAtATime = true;

  $scope.reflections = $firebaseArray(Ref.child('reflections'));
  $scope.state = $firebaseObject(Ref.child('state'));

  $scope.curReflection;
  $scope.curTopic;

  $scope.state.$loaded().then(function(){
    $scope.state.$watch(function(){
      $scope.curReflection = $firebaseObject(
        Ref.child('reflections')
        .child($scope.state.reflection)
      );
      $scope.curTopic = $firebaseArray(
        Ref.child('reflections')
        .child($scope.state.reflection)
        .child('topics')
      );
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
    Ref.child('reflections').child(reflection.$id).child('topics')
    .$asArray().$loaded().then(function(topics){
      console.log(topics);
      topics.$add({
        topic: topic,
        responses: []
      });
    });

    $scope.topic = '';
  };

  $scope.pushReflection = function(reflection) {
    console.log(reflection);  
    $scope.state.$loaded().then(function(){
      $scope.state.reflection = reflection.$id;

      $scope.state.$save();
    });
  }
});
