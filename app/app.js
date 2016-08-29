/* global angular */
var app = angular.module('app', ['facebook'])


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
.filter('trustAsResourceUrl', ['$sce', function($sce) {
    return function(val) {
        return $sce.trustAsResourceUrl(val);
    };
}])
/* query service */
.factory('Query', function() {
    return {string:'', in:'',filter:'',order:''};
})
.factory('CurrentGroup', function(){
    var group = {};
    group.defaultId = '115835695144753';
    group.id = group.defaultId;
    group.setId = function(id) {
      group.id = id;
    }
    return group;
})
.controller('CategoryCtrl', [
    '$scope',
    'CurrentGroup',
    function($scope, CurrentGroup) {
      $scope.currentGroup = CurrentGroup;
      $scope.groups = [
        {id: '1170550659625884', name: "Urban Unicycle chat"},
        {id: '115835695144753', name: "Unicycle Chat"},
        {id: '528112983875724', name:"Unicycle Memes"},
        {id: '1413498285528904', name: "Unicycle Trading Post"}
      ];

      $scope.setCurrentGroup = function(id) {
        CurrentGroup.id = id;
        $scope.loadFeed(CurrentGroup.id);
      }

    }])

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
      'Query',
      'CurrentGroup',
      '$sce',
    function($scope, $timeout, Facebook, Query, CurrentGroup, $sce) {

        $scope.search = Query;
        $scope.facebookBusy = false;


        // Define user empty data :/
        $scope.user = {};
        var groupId = CurrentGroup.id;
        $scope.loggedIn = false;

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
            $scope.loadFeed(CurrentGroup.id);
            $scope.loadGroupCover();
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
                $scope.loadFeed(CurrentGroup.id);
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

        $scope.loadGroupCover = function() {
            var cover;
            Facebook.api('/'+groupId + '?fields=cover', function(response) {
                Facebook.api('/'+response.cover.id, function(response) {
                    $scope.cover = response.images;
                });
            });
            //return cover;
        };

        $scope.submitComment = function(comment, id) {
            console.log(comment);
            console.log(id);
            Facebook.api('/'+id+'/comments', 'POST',{'message':comment}, function(response){
                console.log(response);
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
        };

        $scope.loadFeed = function(id){
            Facebook.api('/' + id + '?fields=feed{from,message,link,picture,source,full_picture,likes,type}&limit=15', function(response) {
                console.log(response);

                $scope.$apply(function() {
                    $scope.feed = response.feed;
                    $scope.loadFeedProfilePictures($scope.feed);
                    $scope.loadVideos($scope.feed);
                    $scope.loadGroupCover();
                    $scope.nextPage = $scope.feed.paging.next;//.substring(31);
                });
            });
        };

        $scope.getProfilePicture = function(user) {
          Facebook.api('/'+user.id+'/picture?type=square', function(response) {
            user.picture = response.data.url;
          });
        };

        $scope.loadFeedProfilePictures = function(feed) {
          for(var i = 0; i<feed.data.length; i++) {
            $scope.getProfilePicture(feed.data[i].from);
          }
        };

        // go through the feed and load the proper source for embeded video //
        $scope.loadVideos = function(feed) {
          for(var i =0 ; i<feed.data.length; i++) {
            var post = feed.data[i];
            getVideoSource(post);
          }
        };
        var getVideoSource = function(post) {
          if(post.type==='video') {
            if(post.link.indexOf("facebook") >=0 ) {
              var tempStringArray = post.link.split('/');
              var videoId = tempStringArray[tempStringArray.length - 1];
              if(videoId==="") {
                videoId = tempStringArray[tempStringArray.length - 2];
              }
              Facebook.api('/' + videoId + '?fields=embed_html', function(response) {
                if(response.error) {
                  console.log(response);
                  console.log(videoId);
                }
                else{
                   post.source2 = response.embed_html.split("\"")[1];
                }
              });
            }
            else {
              post.source2 = post.source.replace("autoplay=1", "autoplay=0");
            }
          }
        }
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
