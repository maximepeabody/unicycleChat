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
]).service('facebookAPI', ['facebook', function(facebook) {
    //user, loggedIn and ready variables //
    /*
    this.user = {};
    this.loggedIn = false;
    */
    this.isReady = function() { 
        return facebook.isReady();
    };
    
    
    //check if the user is currnetly logged in to facebook //
    this.connection = function() {
        return facebook.getLoginStatus(function(response) {
            return response.status;
        });
    };
    
    //
                            
    // facebook api get and post with id and fields//
    this.getUserInfo = function(){
        return facebook.api('/me', function(response) {
            return response;
        });
    };
    
    this.getFeed = function(groupId){
        return facebook.api('/'+ groupId+'feed', function(response){
            return response;
        });
    };
    
    this.postMessage = function(groupId, message){
        return facebook.api('/'+groupId+'/feed', 'post', {"message":message}, function(response) {
            return response;
        }); 
    }
    
    // log in to facebook //
    this.logIn = function() {
        return facebook.login(function(response) {
          return response.status;
        });
    };
                                                   
}])

    .controller('MainCtrl', [
    '$scope',
    '$timeout',
    'facebookAPI',
    function($scope, $timeout, facebookAPI) {
      
      var groupId = '115835695144753';
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
          return facebookAPI.isReady();
        },
        function(newVal) {
          if (newVal)
            $scope.facebookReady = true;
            initializeMe();

        }
      );
      
      // to check if user is logged in or not. If he is, load up the $scope.me function
     var initializeMe = function() {
         if(facebookAPI.connection == 'connected') {
             $scope.user = facebookAPI.getUserInfo();
             $scope.loggedIn = true;
             
         }
     }
      
      /**
       * Intent to login
       */
      $scope.intentLogin = function() {
        alert("trying to login");
        if(!userIsConnected) {
          login();
        }
      };
      
      /**
       * Successful Login
       */
       var login = function() {
         if(facebookAPI.login() == 'connected') {
            $scope.loggedIn = true;
            $scope.me = facebookAPI.getUserInfo();
            $scope.feed = facebookAPI.getFeed(groupId);
          }
        
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







