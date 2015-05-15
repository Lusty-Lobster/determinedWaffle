angular.module('thumbsCheckApp')
  .controller('QuizCtrl', function($scope, $firebaseObject, $firebaseArray, Ref, user, verifyInstructorService, tallyUpStudentResponsesService, pickRandomService) {
    // To get userID.role from web browser localStorage
    verifyInstructorService.verifyIfInstructor(user.uid);


    /*Quiz*/
    $scope.choices = [];
    var quizesRef = Ref.child('quizes');
    var quizes = $firebaseArray(quizesRef);
    $scope.quizes = quizes;

    $scope.add = function() {
      $scope.choices.push('');
    };

    $scope.remove = function(index) {
      console.log(index);
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
    var triggerRef = Ref.child('quizTrigger');
    $scope.quizTrigger = $firebaseObject(triggerRef);

    // Show only one quiz at a time
    $scope.oneAtATime = true;
    $scope.pushQuiz = function(quiz) {
      // console.log('clicked', quiz);
      
      var newQuizRef = Ref.child('newQuiz');
      var newQuizObj = $firebaseObject(newQuizRef);
      newQuizObj.quiz = quiz;
      newQuizObj.$save();
      // Remove the quizResponses table
      $firebaseObject(Ref.child('quizResponses')).$remove();

      // Initlize variables for $scope.total()
      $scope.numberOfChoice = quiz.choices.length;
      $scope.quizData = quiz;
      $scope.stacked = [];
    };

    // Quiz Response
    var quizResponsesRef = Ref.child('quizResponses');
    var quizResponsesObj = $firebaseObject(quizResponsesRef);
    $scope.quizResponses = quizResponsesObj;
    // watch firebase responses, upon change, update counts and studentList
    quizResponsesObj.$loaded().then(function() {
      quizResponsesObj.$watch(function() {
          // results = $scope.total();
          $scope.total();
      });
    });


    // calculate total votes for each category into result
    // Populate list of students githubID for each catergory into studentList
    $scope.total = function() {
      // Initialize quizCounts and studentList
      var quizCounts = [];
      var studentList = {};
      for (var i = 0; i < $scope.numberOfChoice; i++) {
        quizCounts.push(0);
        studentList[i] = [];
      }
      quizResponsesObj.$loaded().then(function(responses) {
        tallyUpStudentResponsesService.tallyUpResponses(responses, undefined, studentList, quizCounts);
        $scope.populateProgressBar(quizCounts);
        $scope.studentList = studentList;
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
          choice: $scope.quizData.choices[i]
        });
      });
    };

  });
