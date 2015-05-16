angular.module('thumbsCheckApp')
  .controller('TownHallCtrl', function($scope, $firebaseObject, $firebaseArray, Ref, user, verifyInstructorService, tallyUpStudentResponsesService, pickRandomService) {
    // To get userID.role from web browser localStorage
    verifyInstructorService.verifyIfInstructor(user.uid);


    var townHallsRef = Ref.child('townHall');  // TODO: rename db entry to 'townHalls'
    console.log('ref',townHallsRef);
    var townHallsObj = $firebaseArray(townHallsRef);
    console.log(townHallsObj);
    // $scope.townHalls = townHallsObj;

    var convertToArray = function (townHalls) {
      return townHalls.map(function (townHall) {
        townHall.questions = Object.keys(townHall.questions).map(function (questionID) {
          return townHall.questions[questionID];
        });
        return townHall;
      });
    };

    townHallsObj.$loaded().then(function (townHalls) {
      $scope.townHalls = convertToArray(townHalls);

      townHallsObj.$watch(function() {
        $scope.townHalls = convertToArray(townHalls);  
      });
    });

    $scope.addTownHall = function(topic) {
      console.log('added');
      var townHall = {};
      townHall.questions = [];
      townHall.topic = topic;
      townHallsObj.$add(townHall);

      // clear form
      $scope.topic = '';
    };

    

    /*Accordion*/
    // quiz trigger
    var stateRef = Ref.child('state');
    var stateObj = $firebaseObject(stateRef);
    $scope.state = stateObj;

    var townHallQuestionsRef; // = townHallsRef.child(stateObj.townHall).child('questions');
    var townHallQuestionsObj; // = $firebaseObject(townHallQuestionsRef);
    // Show only one quiz at a time
    $scope.oneAtATime = true;

    $scope.pushTownHall = function(townHall) {
      // console.log('townHall pushed to students:', townHall.$id);

      stateObj.townHall = townHall.$id;
      stateObj.$save();

      townHallQuestionsRef = townHallsRef.child(stateObj.townHall).child('questions');
      townHallQuestionsObj = $firebaseObject(townHallQuestionsRef);
      // console.log('questions obj', townHallQuestionsObj);

      townHallQuestionsObj.$loaded().then(function() {
        $scope.total();
        townHallQuestionsObj.$watch(function() {
            // results = $scope.total();
            $scope.total();
        });
      });

      // // Initlize variables for $scope.total()
      // $scope.numberOfTopic = quiz.topics.length;
      // $scope.quizData = quiz;
      // $scope.stacked = [];
    };




    $scope.total = function() {
      // Initialize quizCounts and studentList
      // quizResponsesObj.$loaded().then(function(responses) {
      //   tallyUpStudentResponsesService.tallyUpResponses(responses, undefined, studentList, quizCounts);
      //   $scope.populateProgressBar(quizCounts);
      //   $scope.studentList = studentList;
      // });
      // $scope.results = {};

      // once townHallQuestionsObj is loaded, then
      townHallQuestionsObj.$loaded().then(function(questions) {
        // loop - for each question
        questions.forEach(function(question, key) {
          var thumbsCounts = [];
          var studentList = {};
          for (var i = 0; i < 3; i++) {
            thumbsCounts.push(0);
            studentList[i] = [];
          }

          var townHallQuestionRef = townHallQuestionsRef.child(key);
          var townHallQuestionObj = $firebaseObject(townHallQuestionRef);

          townHallQuestionObj.$loaded().then(function(question) {

            question.voteResult = tallyResponses(question.responses, thumbsCounts);



            question.results = populateProgressBar(thumbsCounts);
            question.$save();
          });
        });
      });
    }; 

    

    var tallyResponses = function(responses, thumbsCounts) {
      for (var student in responses) {
        var vote = responses[student].vote;
        if (vote === 'up') {
          thumbsCounts[0]++;
        } else if (vote === 'middle') {
          thumbsCounts[1]++;
        } else {
          thumbsCounts[2]++;
        }
      }
      var sum = thumbsCounts[0] + thumbsCounts[1] + thumbsCounts[2];

      return (thumbsCounts[0] - thumbsCounts[2]) / sum;
    };

    // one progress bar for each question (question_id)
    populateProgressBar = function(quizResult) {
      stacked = [];

      var types = ['success', 'info', 'warning', 'danger'];

      var quizCountsTotal = quizResult.reduce(function(memo, x) {
        return memo + x;
      });

      if (quizCountsTotal === 0) {
        return stacked;
      }

      var choices = ['up', 'mid', 'down'];

      quizResult.forEach(function(val, i) {
        var percent = Math.floor((val / quizCountsTotal) * 100);
        var type = types[i];
        stacked.push({
          value: percent,
          type: type,
          choice: choices[i]
        });
      });

      return stacked;
    };


    /*

    [2,5,6] - per question

    results =
    {
      q1: [{%,type},{%,type},{%,type}],
      q2: [4,5,6]
    }
    */











    // // Quiz Response
    // var quizResponsesRef = Ref.child('quizResponses');
    // var quizResponsesObj = $firebaseObject(quizResponsesRef);
    // $scope.quizResponses = quizResponsesObj;
    // // watch firebase responses, upon change, update counts and studentList
    // quizResponsesObj.$loaded().then(function() {
    //   quizResponsesObj.$watch(function() {
    //       results = $scope.total();
    //   });
    // });


    // // calculate total votes for each category into result
    // // Populate list of students githubID for each catergory into studentList
    // $scope.total = function() {
    //   // Initialize quizCounts and studentList
    //   var quizCounts = [];
    //   var studentList = {};
    //   for (var i = 0; i < $scope.numberOfTopic; i++) {
    //     quizCounts.push(0);
    //     studentList[i] = [];
    //   }
    //   quizResponsesObj.$loaded().then(function(responses) {
    //     tallyUpStudentResponsesService.tallyUpResponses(responses, undefined, studentList, quizCounts);
    //     $scope.populateProgressBar(quizCounts);
    //     $scope.studentList = studentList;
    //   });
    // };


   
  });
