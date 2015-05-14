angular.module('thumbsCheckApp')
  .controller('StudentCtrl', function($scope, $firebaseObject, Ref, user) {
    // Default userThumbsChoices
    var userThumbsChoices = [
    {
      choice: 'up',
      icon: 'glyphicon glyphicon-thumbs-up'
    },
    {
      choice: 'middle',
      icon: 'glyphicon glyphicon-resize-horizontal'
    },
    {
      choice: 'down',
      icon: 'glyphicon glyphicon-thumbs-down'
    }];


    var triggerRef = Ref.child('trigger');
    var trigObj = $firebaseObject(triggerRef);
    trigObj.$loaded().then(function(data) {
      // When data referenced by triggerRef changes, the listener $watch is invoked
      trigObj.$watch(function() {
        //thumbsTrigger sets ng-show of thumbscheck view
        $scope.thumbsTrigger = true;
        $scope.userThumbsChoices = userThumbsChoices; 
      });
    });

    var quizTriggerRef = Ref.child('quizTrigger');
    var quizTrigObj = $firebaseObject(quizTriggerRef);
    quizTrigObj.$loaded().then(function(data) {
      quizTrigObj.$watch(function() {
        //quizTrigger sets ng-show of quiz view
        $scope.quizTrigger = true;
      });
    });


    var newQuizRef = Ref.child('currentQuiz').child('quiz');
    var newQuizObj = $firebaseObject(newQuizRef);
    // Always update student view with latest quiz
    newQuizObj.$loaded().then(function(quiz){
      $scope.quiz = quiz;
    });



    $scope.clicked = function(thumbsChoice) {
      // Hide thumbs choice after student made a choice
      $scope.thumbsTrigger = false;
      // Reset state of $scope.userThumbsChoices, so that upon trigObj.$watch, it is redefined. 
      $scope.userThumbsChoices = undefined;
      // Ref.child('responses') grabs responses table
        // .child(user.uid) grabs a particular user
      var studentResponseRef = Ref.child('responses').child(user.uid); 
      var obj = $firebaseObject(studentResponseRef);
      obj.$loaded().then(function(data) {
        obj["vote"] = thumbsChoice;
        obj.$save().then(function(ref) {
          console.log('Success');
        }, function(error) {
          console.log('Error:', error);
        });
      });
    };

    var quizResponsesRef = Ref.child('quizResponses').child(user.uid);
    var quizResponsesObj = $firebaseObject(quizResponsesRef);
    $scope.submitQuizChoice = function(choice) {
      // Hide quiz after student made a choice
      $scope.quizTrigger = false;
      quizResponsesObj.$loaded().then(function(data) {
        quizResponsesObj["selection"] = choice;
        quizResponsesObj.$save().then(function(ref) {
          console.log('Success');
        }, function(error) {
          console.log('Error:', error);
        });
      });
    };


  });

