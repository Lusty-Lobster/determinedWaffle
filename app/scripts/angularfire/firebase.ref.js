// RENAME TO 'ref.js' FOR CONSISTENCY
//
angular.module('firebase.ref', ['firebase', 'firebase.config'])
  .factory('Ref', ['$window', 'FBURL', '$firebaseObject', function($window, FBURL) {
    'use strict';
      return new $window.Firebase(FBURL);
  }]);
