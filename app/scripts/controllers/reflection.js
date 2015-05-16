angular.module('thumbsCheckApp')
.controller('ReflectionCtrl', function($scope, $firebaseObject, $firebaseArray, Ref, user, verifyInstructorService, tallyUpStudentResponsesService, pickRandomService) {
  // To get userID.role from web browser localStorage
  verifyInstructorService.verifyIfInstructor(user.uid);

  // Show only one reflection at a time
  $scope.oneAtATime = true;

  var reflections = $firebaseArray(Ref.child('reflections'));
  $scope.state = $firebaseObject(Ref.child('state'));


  $scope.curReflection;
  $scope.curTopics;
  $scope.curResponses;

  var topicsRef; // = townHallsRef.child(stateObj.townHall).child('questions');
  var topicsObj; // = $firebaseObject(topicsRef);

  var convertToArray = function (reflections) {
    return reflections.map(function (reflection) {
      console.log(reflection.topics);
      reflection.topics = reflection.topics || {};
      reflection.topics = Object.keys(reflection.topics).map(function (topicId) {
        return reflection.topics[topicId];
      });
      return reflection;
    });
  };


  reflections.$loaded().then(function(reflections) {
    $scope.reflections = convertToArray(reflections);

    reflections.$watch(function() {
      $scope.reflections = convertToArray(reflections);  
    });
  });



  $scope.state.$loaded().then(function(){

    // console.log('questions obj', topicsObj);
    $scope.state.$watch(function(){
      topicsRef = Ref.child('reflections').child($scope.state.reflection).child('topics');
      topicsObj = $firebaseObject(topicsRef);

      topicsObj.$loaded().then(function() {
        $scope.total();
        topicsObj.$watch(function() {
          $scope.total();
        });
      });

      $scope.curReflection = $firebaseObject(
        Ref.child('reflections')
        .child($scope.state.reflection)
      );
      $scope.curTopics = $firebaseArray(
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

  $scope.total = function() {
    // Initialize quizCounts and studentList
    // quizResponsesObj.$loaded().then(function(responses) {
    //   tallyUpStudentResponsesService.tallyUpResponses(responses, undefined, studentList, quizCounts);
    //   $scope.populateProgressBar(quizCounts);
    //   $scope.studentList = studentList;
    // });
    // $scope.results = {};

    // once townHallQuestionsObj is loaded, then
    topicsObj.$loaded().then(function(topics) {
      // loop - for each question
      topics.forEach(function(topic, key) {
        var thumbsCounts = [];
        var studentList = {};
        for (var i = 0; i < 3; i++) {
          thumbsCounts.push(0);
          studentList[i] = [];
        }

        var topicRef = topicsRef.child(key);
        var topicObj = $firebaseObject(topicRef);

        topicObj.$loaded().then(function(topic) {

          topic.voteResult = tallyResponses(topic.responses, thumbsCounts);

          topic.results = populateProgressBar(thumbsCounts);
          topic.$save();
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

});
