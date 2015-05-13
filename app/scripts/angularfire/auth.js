//This is where we create firebase.auth, we inject the firebase dependency as well as the factory we created in firebase.ref
(function() {
  'use strict';
  angular.module('firebase.auth', ['firebase', 'firebase.ref'])
    .factory('Auth', function($firebaseAuth, Ref) {
      return $firebaseAuth(Ref);
    });
})();
