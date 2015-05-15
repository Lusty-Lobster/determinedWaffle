angular.module('thumbsCheckApp')
  .controller('QuizCtrl', function($scope, $firebaseObject, $firebaseArray, Ref, user, verifyInstructorService, tallyUpStudentResponsesService, pickRandomService) {
    // To get userID.role from web browser localStorage
    verifyInstructorService.verifyIfInstructor(user.uid);


    /*Quiz*/
    $scope.choices = [];
    var quizesRef = Ref.child('quizzes');
    var quizes = $firebaseArray(quizesRef);
    $scope.quizes = quizes;

    $scope.add = function() {
      $scope.choices.push('');
    };

    $scope.remove = function(index) {
      $scope.choices.splice(index, 1);
    };

    $scope.addQuiz = function(question, choices) {
      var quiz = {};
      quiz.question = question;
      quiz.choices = choices;
      quizes.$add(quiz);

      // clear form
      $scope.question = '';
      $scope.choices = [];
    };

    $scope.saveChange = function($index, choice) {
      // saves user input into $scope.choices based on ng-Change
      $scope.choices[$index] = choice;
    };



    /*Accordion*/
    // quiz trigger
    var triggerRef = Ref.child('state').child('quizTrigger');
    $scope.quizTrigger = $firebaseObject(triggerRef);

    var stateRef = Ref.child('state');
    var stateObj = $firebaseObject(stateRef);

    var currentQuizRef;
    var currentQuizObj;

    var responsesRef;
    var responsesObj;

    var choicesRef;
    var choicesObj;

    // Show only one quiz at a time
    $scope.oneAtATime = true;
    $scope.pushQuiz = function(quiz) {
      //add value here before saving it
      $scope.stacked = [];

      stateObj.quiz = quiz.$id;
      stateObj.$save();
    };

    stateObj.$loaded().then(function() { //Error over here Joseph :(
      stateObj.$watch(function() {
        currentQuizRef = Ref.child('quizzes').child(stateObj.quiz);
        currentQuizObj = $firebaseObject(currentQuizRef);

        choicesRef = Ref.child('quizzes').child(stateObj.quiz).child('choices');
        choicesObj = $firebaseArray(choicesRef);

        responsesRef = Ref.child('state').child(stateObj.quiz).child('responses');
        responsesObj = $firebaseObject(responsesRef);

        // watch firebase responses, upon change, update counts and studentList
        responsesObj.$loaded().then(function() {
          choicesObj.$loaded().then(function() {
            results = $scope.total();
            responsesObj.$watch(function() {
              results = $scope.total();
            });
          });
        });

      });
    });

    // var tallyUpResponses = function(responses) {
    //   // Make key: $id and $priority non-enumerable
    //   Object.defineProperty(responses, '$id', {
    //     enumerable: false
    //   });

    //   Object.defineProperty(responses, '$priority', {
    //     enumerable: false
    //   });

    //   Object.defineProperty(responses, '$$conf', {
    //     enumerable: false
    //   });
    //   var quizCounts=[];
    //   for (var i = 0; i < choicesObj.length; i++) {
    //     quizCounts.push(0);
    //   }
    //   for (var key in responses) {
    //     if (responses.hasOwnProperty(key)) {
    //       if (quizCounts !== undefined && result === undefined) {
    //         if (responses[key] !== null) {
    //           response = responses[key][key];
    //           console.log('response', response);
    //           quizCounts[response] += 1;
    //           studentList[response].push(key);
    //         } 
    //       } else {
    //         var response = responses[key];
    //         // After reset(), on responses obj, there is a key value pair ($value:null)
    //         if (response === null) {
    //           // Return upon empty responses
    //           return [result, studentList];
    //         } else {
    //           response = response[key];
    //           if (response === 'up') {
    //             result[0] += 1;
    //             studentList.up.push(key);
    //           } else if (response === 'middle') {
    //             result[1] += 1;
    //             studentList.middle.push(key);
    //           } else if (response === 'down') {
    //             result[2] += 1;
    //             studentList.down.push(key);
    //           }
    //         }
    //       }
    //     }
    //   }
    // };
    // calculate total votes for each category into result
    // Populate list of students githubID for each catergory into studentList
    $scope.total = function() {

      choicesObj.$loaded().then(function() {
        // Initialize quizCounts and studentList
        var quizCounts = [];
        var studentList = {};
        for (var i = 0; i < choicesObj.length; i++) {
          quizCounts.push(0);
          studentList[i] = [];
        }
        responsesObj.$loaded().then(function() {
          console.log('before', quizCounts);
          //quizCounts=[1,2,3];
          tallyUpStudentResponsesService.tallyUpResponses(responsesObj, undefined, studentList, quizCounts);
          console.log('after', quizCounts);
          $scope.populateProgressBar(quizCounts);
          $scope.studentList = studentList;
        });
      });
    };


    $scope.pickRandom = function(array) {
      var randomStudentInfo;
      randomStudentInfo = pickRandomService.pickRandomStudent(studentList);

      var studentRef = Ref.child('students');
      // Retrieve studentName from firebase "students", then generate the pickedStudent object

      $firebaseObject(studentRef).$loaded().then(function(students) {
        $scope.studentName = students[randomStudentInfo.uid];
        $scope.pickedStudent = {
          name: students[randomStudentInfo.uid],
          imageUrl: randomStudentInfo.path
        };
      });
    };

    $scope.populateProgressBar = function(quizResult) {
      $scope.stacked = [];

      var types = ['success', 'info', 'warning', 'danger'];
      var quizCountsTotal = quizResult.reduce(function(memo, x) {
        return memo + x;
      });

      if (quizCountsTotal === 0) {
        return $scope.stacked;
      }

      quizResult.forEach(function(val, i) {
        var percent = Math.floor((val / quizCountsTotal) * 100);
        var type = types[i];
        $scope.stacked.push({
          value: percent,
          type: type,
          choice: currentQuizObj.choices[i]
        });
      });
    };

  });
