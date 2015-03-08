/* global angular */
var app = angular.module('app', ['facebook', 'mongolabResourceHttp', 'infinite-scroll'])


/* config facebook api provider */
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
/*  mongolabresource service */
 .factory('Archive', function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('archives');
  })
  .constant('MONGOLAB_CONFIG',{API_KEY:'kKzRztkYviZTkqkp0YPH_BqW9AfhHjLA', DB_NAME:'unicyclechat'})


/* query service */
.factory('Query', function() {
    return {string:'', in:'',filter:'',order:''};
})
.factory('CurrentGroup', function(){
    defaultId = '115835695144753';
    return id;
})
.controller('CategoryCtrl', [ 
    '$scope',
    'Currentgroup',
    function($scope, CurrentGroup) {
        $scope.category = CurrentGroup;
    }
])

.controller('HeaderCtrl', [
    '$scope',
    'Query',
    function($scope, Query) {
        $scope.search = Query;
        $scope.search.in = 'Recent';
        $scope.search.filter = 'Content';
        $scope.search.order = 'Date';
        $scope.setIn = function(s) {$scope.search.in = s};
        $scope.setFilter = function(s) {$scope.search.filter = s};
        $scope.setOrder = function(s) {$scope.search.order = s};
    }])
         
  .controller('MainCtrl', [
    '$scope',
    '$timeout',
    'Facebook',
      'Archive',
      'Query',
      'CurrentGroup',
    function($scope, $timeout, Facebook, Archive, Query, CurrentGroup) {
        
      
        $scope.search = Query;
        $scope.facebookBusy = false;
        /*
        Archive.query({"post.from.name":"Maxime Peabody"}).then(function(posts){
            $scope.archive = posts;
            console.log(posts);
        });*/
        
        /*
        Archive.all({limit:100}).then(function(posts){
            $scope.postsByMaxime = posts;
            console.log($scope.postsByMaxime);

        });*/
        $scope.toArchive = [];
        $scope.toUpdate = [];
        
        
        // Define user empty data :/
        $scope.user = {};
        var groupId = CurrentGroup;
        $scope.loggedIn = false;
        $scope.currentPage = '/'+CurrentGroup+'?fields=feed';
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
            // $scope.getBigFeed();
            $scope.getGroupCover();

            }
        });
      
        /**
        * Intent to login
        */
        $scope.intentLogin = function() {
            alert("trying to login");
           // if(!userIsConnected) {
                $scope.login();
           // }
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
                //   $scope.getBigFeed();
            }
            }, {scope:'publish_actions'});
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
        
        $scope.getGroupCover = function() {
            var cover;
            Facebook.api('/'+groupId + '?fields=cover', function(response) {
                Facebook.api('/'+response.cover.id, function(response) {
                    cover = response.images;
                });
            });
            return cover;
        };
        
        $scope.submitComment = function(comment, id) {
            console.log(comment);
            console.log(id);
            Facebook.api('/'+id+'/comments', 'POST',{'message':comment}, function(response){
                console.log(response);
            });
        }
      
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
            Facebook.api('/115835695144753?fields=feed&limit=1000', function(response) {
                console.log(response);
                $scope.$apply(function() {
                    $scope.feed = response.feed;
                    //$scope.getBigFeed();
                    $scope.currentPage= $scope.feed.paging.next.substring(31);
                    recursiveFeed($scope.currentPage,0,5);
                });
            });
        };
        
        $scope.getArchive = function() {
            
        }
      
        
       /*$scope.getFeed = function(){
            //var currentPage =$scope.feed.paging.next.substring(31);
            var count = 0;
            $scope.feed = {data:[]};
          
            //recursiveFeed($scope.currentPage,0, 1);
        }*/
        var recursiveFeed = function(page, count, limit) {
             if(count < limit && page !=null) {
                Facebook.api(page, function(response) {
                        count++;
                        if(response.paging == undefined)
                        {
                            $scope.currentPage = null;
                        }
                        else{
                        $scope.currentPage = response.paging.next.substring(31);    
                        console.log($scope.currentPage);
                        for(var i = 0; i<response.data.length; i++) {
                            if(count<2){
                                $scope.feed.data.push(response.data[i]);
                            }
                            
                         
                            var newArchive = new Archive();
                            newArchive.post = response.data[i];
                            console.log(response.data[i]);
                            $scope.toArchive.push(newArchive);

                        }
                        console.log(response);
                        }
                        recursiveFeed($scope.currentPage,count,limit);
                    });
             }
                            
            else{
                Archive.save($scope.toArchive);
            }
        }; 
        /*
        $scope.getMore = function() {
            console.log('fetching more posts...');
            if(!$scope.facebookBusy)
                recursiveFeed($scope.currentPage,0, 1);
           // $scope.feed=$scope.bigFeed;
        }
        */
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


