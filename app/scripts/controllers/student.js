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

    $scope.userExpectationChoices = [
      {
        choice: 'up',
        label: 'Thanks!',
        icon: 'glyphicon glyphicon-thumbs-up'
      },
      {
        choice: 'middle',
        label: 'Whatever',
        icon: 'glyphicon glyphicon-resize-horizontal'
      },
      {
        choice: 'down',
        label: 'Boo!',
        icon: 'glyphicon glyphicon-thumbs-down'
      }
    ];
    $scope.userUsefulnessChoices = [
      {
        choice: 'up',
        label: 'Productive',
        icon: 'glyphicon glyphicon-thumbs-up'
      },
      {
        choice: 'middle',
        label: 'Whatever',
        icon: 'glyphicon glyphicon-resize-horizontal'
      },
      {
        choice: 'down',
        label: 'Counterproductive',
        icon: 'glyphicon glyphicon-thumbs-down'
      }
    ];
    $scope.userExperienceChoices = [
      {
        choice: 'up',
        label: 'Fun',
        icon: 'glyphicon glyphicon-thumbs-up'
      },
      {
        choice: 'middle',
        label: 'Whatever',
        icon: 'glyphicon glyphicon-resize-horizontal'
      },
      {
        choice: 'down',
        label: 'Bummer',
        icon: 'glyphicon glyphicon-thumbs-down'
      }
    ];

    $scope.userThumbsChoices = userThumbsChoices; 

    var triggerRef = Ref.child('state').child('thumbsTrigger');
    var trigObj = $firebaseObject(triggerRef);
    trigObj.$loaded().then(function(data) {
      // When data referenced by triggerRef changes, the listener $watch is invoked
      trigObj.$watch(function() {
        //thumbsTrigger sets ng-show of thumbscheck view
        $scope.thumbsTrigger = true;
      });
    });

    var quizTriggerRef = Ref.child('state').child('quizTrigger');
    var quizTrigObj = $firebaseObject(quizTriggerRef);
    quizTrigObj.$loaded().then(function(data) {
      quizTrigObj.$watch(function() {
        //quizTrigger sets ng-show of quiz view
        $scope.quizTrigger = true;
      });
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
        obj["vote"] = thumbsChoice;
        obj.$save().then(function(ref) {
          console.log('Success');
        }, function(error) {
          console.log('Error:', error);
        });
      });
    };

    var quizResponseRef;
    var quizResponsesObj;

    var newQuizRef;
    var newQuizObj;

    var stateRef = Ref.child('state');
    var stateObj = $firebaseObject(stateRef);

    stateObj.$loaded().then(function() {
      stateObj.$watch(function() {
        console.log('watch is working');
        quizResponsesRef = Ref.child('quizzes').child(stateObj.quiz).child('responses').child(user.uid);
        quizResponsesObj = $firebaseObject(quizResponsesRef);

        newQuizRef = Ref.child('quizzes').child(stateObj.quiz);
        newQuizObj = $firebaseObject(newQuizRef);
        // Always update student view with latest quiz
        newQuizObj.$loaded().then(function(quiz){
          $scope.quiz = quiz;
        });
      });
    })

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

    // ========================== NEW CODE ================
    stateObj.$loaded().then(function( state ) {
      updateTownHall( state );
      updateReflection( state );

      console.log('state loaded');
      stateObj.$watch(function() {
        console.log('state changed');

        if(state.townHall !== $scope.townHall) {
          updateTownHall( state );
        }
        if(state.reflection !== $scope.reflection) {
          updateReflection( state );
        }
      });
    });
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

    // ========================== NEW CODE ================
    $scope.reflection = -1;

    var reflectionsRef = Ref.child('reflections');
    var reflectionsObj = $firebaseObject(reflectionsRef);

    var reflectionRef;
    var reflectionObj;

    var topicsRef;
    var topicsObj;

    var updateReflection = function( state ){
      console.log('reflection changed to ', state.reflection);
      if(state.reflection === -1){
        $scope.reflection = -1;

        reflectionRef     = undefined;
        reflectionObj     = undefined;
      } else {
        $scope.reflection=-2;  // -2 === loading new state

        reflectionRef  = reflectionsRef.child(stateObj.reflection);
        reflectionObj  = $firebaseObject(reflectionRef);

        topicsRef = reflectionRef.child('topics');
        topicsObj = $firebaseArray(topicsRef);

        reflectionObj.$loaded().then(function( ){
          topicsObj.$loaded().then(function( ){
            if($scope.reflection===-2){
              $scope.reflection     = state.reflection;
              $scope.reflectionObj  = reflectionObj;
              $scope.topicsObj = topicsObj;
            }
          });
        });
      }
    }

    $scope.voteReflection = function(topicObj, topic, type) {
      responseRef = topicsRef
        .child(topicObj.$id)
        .child('responses')
        .child(user.uid)
        .child(type);
      responseObj = $firebaseObject(responseRef);

      responseObj.$loaded().then(function( response ){
        responseObj.vote = topic;
        responseObj.$save().then(function(ref) {
          console.log('Successfully saved');
        }, function(error) {
          console.log('Error saving:', error);
        });
      });
    };
  });













