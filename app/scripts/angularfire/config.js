//This is where we define some constants that are used in other places
angular.module('firebase.config', [])
  .constant('FBURL', 'https://moderate-it.firebaseio.com')
  .constant('SIMPLE_LOGIN_PROVIDERS', ['github'])

  .constant('loginRedirectPath', '/login');