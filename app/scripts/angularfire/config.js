// define constants used elsewhere
angular.module('firebase.config', [])
  .constant('FBURL', 'https://moderate-it.firebaseio.com')
  .constant('SIMPLE_LOGIN_PROVIDERS', ['github'])
  .constant('loginRedirectPath', '/login');