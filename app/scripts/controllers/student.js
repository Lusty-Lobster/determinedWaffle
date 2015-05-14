angular.module('thumbsCheckApp')
  .controller('StudentCtrl', function($scope, $firebaseObject, $firebaseArray, Ref, user) {
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
      }
    ];

    $scope.userThumbsChoices = userThumbsChoices; 

    var triggerRef = Ref.child('trigger');
    var trigObj = $firebaseObject(triggerRef);
    trigObj.$loaded().then(function(data) {
      // When data referenced by triggerRef changes, the listener $watch is invoked
      trigObj.$watch(function() {
        //thumbsTrigger sets ng-show of thumbscheck view
        $scope.thumbsTrigger = true;
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


    var newQuizRef = Ref.child('newQuiz').child('quiz');
    var newQuizObj = $firebaseObject(newQuizRef);
    // Always update student view with latest quiz
    newQuizObj.$loaded().then(function(quiz){
      $scope.quiz = quiz;
    });



    $scope.clicked = function(thumbsChoice) {
      // Hide thumbs choice after student made a choice
      $scope.thumbsTrigger = false;
      // Reset state of $scope.userThumbsChoices, so that upon trigObj.$watch, it is redefined. 
      // $scope.userThumbsChoices = undefined;
      // Ref.child('responses') grabs responses table
        // .child(user.uid) grabs a particular user
      var studentResponseRef = Ref.child('responses').child(user.uid); 
      var obj = $firebaseObject(studentResponseRef);
      obj.$loaded().then(function(data) {
        obj[user.uid] = thumbsChoice;
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
        quizResponsesObj[user.uid] = choice;
        quizResponsesObj.$save().then(function(ref) {
          console.log('Success');
        }, function(error) {
          console.log('Error:', error);
        });
      });
    };

    // ========================== NEW CODE ================
    $scope.townHall = -1;
    
    var stateRef = Ref.child('state');
    var stateObj = $firebaseObject(stateRef);

    var townHallsRef = Ref.child('townHall');
    var townHallsObj = $firebaseObject(townHallsRef);
    
    var townHallRef;
    var townHallObj;

    var questionsRef;
    var questionsObj;

    var updateTownHall = function( state ){
      console.log('town hall changed to ', state.townHall);
      if(state.townHall === -1){
        $scope.townHall = -1;

        townHallRef     = undefined;
        townHallObj     = undefined;
      } else {
        $scope.townHall=-2;  // -2 === loading new state

        townHallRef  = townHallsRef.child(stateObj.townHall);
        townHallObj  = $firebaseObject(townHallRef);

        questionsRef = townHallRef.child('questions');
        questionsObj = $firebaseArray(questionsRef);

        townHallObj.$loaded().then(function( ){
          questionsObj.$loaded().then(function( ){
            if($scope.townHall===-2){
              console.log('all loaded ', state.townHall);

              $scope.townHall     = state.townHall;
              $scope.townHallObj  = townHallObj;
              $scope.questionsObj = questionsObj;
            }
          });
        });
      }
    }

    stateObj.$loaded().then(function( state ) {
      updateTownHall( state );

      console.log('state loaded');
      stateObj.$watch(function() {
        console.log('state changed');

        if(state.townHall !== $scope.townHall) {
          updateTownHall( state );
        }
      });
    });

    $scope.addQuestion = function(question) {
      questionsObj.$add({
        question: question,
        responses: {},
        student_id: user.uid
      });

      // clear form
      $scope.question = '';
    };

    $scope.vote = function(questionObj, choice) {
      responseRef = questionsRef
        .child(questionObj.$id)
        .child('responses')
        .child(user.uid);
      responseObj = $firebaseObject(responseRef);

      responseObj.$loaded().then(function( response ){
        responseObj.vote = choice;
        responseObj.$save().then(function(ref) {
          console.log('Successfully saved');
        }, function(error) {
          console.log('Error saving:', error);
        });
      });
    };

  });













