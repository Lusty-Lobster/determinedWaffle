angular.module('thumbsCheckApp')
  .config(['$routeProvider', 'SECURED_ROUTES', function($routeProvider, SECURED_ROUTES) {
    $routeProvider.whenAuthenticated = function(path, route) {
      route.resolve = route.resolve || {};
      route.resolve.user = ['Auth', function(Auth) {
        return Auth.$requireAuth();
      }];
      $routeProvider.when(path, route);
      SECURED_ROUTES[path] = true;
      return $routeProvider;
    };
  }])

  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .whenAuthenticated('/', {
        redirectTo: '/instructor-main'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })
      .whenAuthenticated('/student-main', {
        templateUrl: 'views/student-main.html',
        controller: 'StudentCtrl'
      })
      .whenAuthenticated('/instructor-main', {
        templateUrl: 'views/instructor-main.html',
        controller: 'InstructorCtrl'
      })
      .whenAuthenticated('/instructor-thumbs', {
        templateUrl: 'views/instructor-thumbs.html',
        controller: 'InstructorCtrl'
      })
      .whenAuthenticated('/pick', {
        templateUrl: 'views/pick.html',
        controller: 'PickCtrl'
      })
      .whenAuthenticated('/instructor-quiz', {
        templateUrl: 'views/instructor-quiz.html',
        controller: 'QuizCtrl'
      })
      .whenAuthenticated('/instructor-townhall', {
        templateUrl: 'views/instructor-townhall.html',
        controller: 'TownHallCtrl'    
      })
      .otherwise({
        redirectTo: '/'
      });
  }])
  .run(['$rootScope', '$location', 'Auth', 'SECURED_ROUTES', 'loginRedirectPath',
    function($rootScope, $location, Auth, SECURED_ROUTES, loginRedirectPath) {
      // watch for login status changes and redirect if appropriate
      Auth.$onAuth(check);

      // some of our routes may reject resolve promises with the special {authRequired: true} error
      // this redirects to the login page whenever that is encountered
      $rootScope.$on('$routeChangeError', function(e, next, prev, err) {
        if (err === 'AUTH_REQUIRED') {
          $location.path(loginRedirectPath);
        }
      });

      function check(user) {
        if (!user && authRequired($location.path())) {
          $location.path(loginRedirectPath);
        }
      }

      function authRequired(path) {
        return SECURED_ROUTES.hasOwnProperty(path);
      }
    }
  ])

  // used by route security
  .constant('SECURED_ROUTES', {});
