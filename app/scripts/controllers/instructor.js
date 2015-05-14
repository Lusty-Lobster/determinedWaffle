angular.module('thumbsCheckApp')
  .controller('InstructorCtrl', function($scope, $firebaseObject, Ref, user, pickRandomService, verifyInstructorService, tallyUpStudentResponsesService) {
    // To get userID.role from web browser localStorage
    verifyInstructorService.verifyIfInstructor(user.uid);

    // This is firebase responses table url
    var responsesRef = Ref.child('responses');
    var responsesObj = $firebaseObject(responsesRef);
    // IS $SCOPE.RESPONSES BEING USED?
    $scope.responses = responsesObj;  

    // This is the trigger when instructor press startNew, all students 
    // go to thumbs check view. 
    var triggerRef = Ref.child('trigger');
    $scope.trigger = $firebaseObject(triggerRef);

    // Counts summary as: [up,middle,down]
    $scope.result = [];

    // watch firebase responses, upon change, update counts and studentList
    var results;
    responsesObj.$watch(function() {
      results = $scope.total();
      $scope.result = results[0];
      $scope.studentList = results[1];
    });


    // calculate total votes for each category into result
    // Populate list of students githubID for each catergory into studentList
    // as studentList = {up:[], down:[],middle:[]};
    $scope.total = function() {

      // Counts summary for [up,middle,down]
      var result = [0, 0, 0];

      // for input of $scope.pickRandom()
      var studentList = {
        up: [],
        down: [],
        middle: []
      };

      responsesObj.$loaded().then(function(responses) {
        tallyUpStudentResponsesService.tallyUpResponses(responses, result, studentList);
      });

      return [result, studentList];
    };


    $scope.pickRandom = function(studentList) {
      var randomStudentInfo;
      var studentRef = Ref.child('students');
      randomStudentInfo = pickRandomService.pickRandomStudent(studentList);

      // Retrieve studentName from firebase "students", then generate the pickedStudent object
      $firebaseObject(studentRef).$loaded().then(function(students) {
        $scope.studentName = students[randomStudentInfo.uid];
        $scope.pickedStudent = {
          name: students[randomStudentInfo.uid],
          imageUrl: randomStudentInfo.path
        };
      });
    };

    // Reset firebase responses table
    $scope.reset = function() {
      responsesObj.$remove().then(function() {
        // data has been deleted locally and in Firebase
        $scope.pickedStudent.imageUrl = 'assets/placeholder-hi.png';
        $scope.pickedStudent.name = '';
      }, function(error) {
        console.log('Error:', error);
      });
    };

  });
