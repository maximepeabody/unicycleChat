app.controller('FeedCtrl', ['$scope', 'Facebook', function($scope, Facebook) {
   
        var getFeed = function(){
            Facebook.api('/115835695144753?fields=feed', function(response) {
                $scope.$apply(function() {
                    $scope.feed = response;
                });
            });
        };
        getFeed();             
        
}]);