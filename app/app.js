/* global angular */
var app = angular.module('app', ['facebook'])

.config(['FacebookProvider', function(FacebookProvider) {
     var myAppId = '333316433531846';
     
     // You can set appId with setApp method
     // FacebookProvider.setAppId('myAppId');
     
     /**
      * After setting appId you need to initialize the module.
      * You can pass the appId on the init method as a shortcut too.
      */
     FacebookProvider.init(myAppId);
     
    }
])
  .controller('MainCtrl', [
    '$scope',
    '$timeout',
    'Facebook',
    function($scope, $timeout, Facebook) {
      
      // Define user empty data :/
      $scope.user = {};

      // Defining user logged status
      $scope.loggedIn = false;
      
      // And some fancy flags to display messages upon user status change
      $scope.byebye = false;
      $scope.salutation = false;
      var userIsConnected = false;
        

      
      /**
       * Watch for Facebook to be ready.
       * There's also the event that could be used
       */
      $scope.$watch(
        function() {
          return Facebook.isReady();
        },
        function(newVal) {
          if (newVal)
            $scope.facebookReady = true;
        }
      );
      
      // to check if user is logged in or not. If he is, load up the $scope.me function
      Facebook.getLoginStatus(function(response) {
        if (response.status == 'connected') {
          $scope.loggedIn = true;
          $scope.me();
          $scope.getFeed();
          console.log('feed:' + $scope.feed);
        }
      });
      
      /**
       * Intent to login
       */
      $scope.intentLogin = function() {
        alert("trying to login");
        if(!userIsConnected) {
          $scope.login();
        }
      };
      
      /**
       * Successful Login
       */
       $scope.login = function() {
         Facebook.login(function(response) {
          if (response.status == 'connected') {
            $scope.loggedIn = true;
            $scope.me();
            $scope.getFeed();
          }
        
        });
       };
       
       /**
        * me funtion, loads up the user information
        */
        $scope.me = function() {
          Facebook.api('/me', function(response) {
            /**
             * Using $scope.$apply since this happens outside angular framework.
             */
            $scope.$apply(function() {
              $scope.user = response;
            });
            
          });
        };
      
      /**
       * Logout
       */
      $scope.logout = function() {
        Facebook.logout(function() {
          $scope.$apply(function() {
            $scope.user   = {};
            $scope.loggedIn = false;  
          });
        });
      }
      
      $scope.getFeed = function(){
            Facebook.api('/115835695144753?fields=feed', function(response) {
                console.log(response);
                $scope.$apply(function() {
                    $scope.feed = response.feed;
                });
            });
        };
      
      /**
       * Taking approach of Events :D
       */
      $scope.$on('Facebook:statusChange', function(ev, data) {
        console.log('Status: ', data);
        if (data.status == 'connected') {
          $scope.$apply(function() {
            $scope.salutation = true;
            $scope.byebye     = false;    
          });
        } else {
          $scope.$apply(function() {
            $scope.salutation = false;
            $scope.byebye     = true;
            
            // Dismiss byebye message after two seconds
            $timeout(function() {
              $scope.byebye = false;
            }, 2000)
          });
        }
        
        
      });
        
    
      
      
    }
  ])
  
  /**
   * Just for debugging purposes.
   * Shows objects in a pretty way
   */
  .directive('debug', function() {
		return {
			restrict:	'E',
			scope: {
				expression: '=val'
			},
			template:	'<pre>{{debug(expression)}}</pre>',
			link:	function(scope) {
				// pretty-prints
				scope.debug = function(exp) {
					return angular.toJson(exp, true);
				};
			}
		}
	});


