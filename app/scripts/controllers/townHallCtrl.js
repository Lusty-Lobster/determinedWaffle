angular.module('thumbsCheckApp')
  .controller('TownHallCtrl', function($scope, $firebaseObject, $firebaseArray, Ref, user, verifyInstructorService, tallyUpStudentResponsesService, pickRandomService) {
    // To get userID.role from web browser localStorage
    verifyInstructorService.verifyIfInstructor(user.uid);


    var townHallsRef = Ref.child('townHall');  // TODO: rename db entry to 'townHalls'
    var townHalls = $firebaseArray(townHallsRef);
    console.log(townHalls);
    $scope.townHalls = townHalls;

    $scope.addTownHall = function(topic) {
      console.log('added');
      var townHall = {};
      townHall.questions = [];
      townHall.topic = topic;
      townHalls.$add(townHall);

      // clear form
      $scope.topic = '';
    };


    /*Accordion*/
    // quiz trigger
    var stateRef = Ref.child('state');
    var stateObj = $firebaseObject(stateRef);
    $scope.state = stateObj;

    // Show only one quiz at a time
    $scope.oneAtATime = true;

    $scope.pushTownHall = function(townHall) {
      // console.log('townHall pushed to students:', townHall.$id);

      stateObj.townHall = townHall.$id;
      stateObj.$save();

      // // Initlize variables for $scope.total()
      // $scope.numberOfTopic = quiz.topics.length;
      // $scope.quizData = quiz;
      // $scope.stacked = [];
    };

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
