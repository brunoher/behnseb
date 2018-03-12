// Controller of menu dashboard page.
appControllers.controller('homeDashboardCtrl', function ($rootScope, $scope, $mdToast,$state,Auth,$localStorage,DataService,IncidentService,ImmeubleService,UserService,$timeout) {
    //$rootScope.isSidemenu = true;
    if(ionic.Platform.isIOS()) {
       $scope.myStyle={'position':'absolute', 'top':'220%'}; 
    } else {
        $scope.myStyle={'position':'absolute', 'top':'60%'};
    }
    
    $scope.isAndroid = ionic.Platform.isAndroid();
    $scope.loadPage = function(){
        $timeout(function () {
            if ($scope.isAndroid) {
                jQuery('#home-loading-progress').show();
            }
            else {
                jQuery('#home-loading-progress').fadeIn(700);
            }
        }, 400);
        $timeout(function () {
            jQuery('#home-loading-progress').hide();
            jQuery('#menu-dashboard-content .container').fadeIn();
        }, 1000);// End loading progress. 
    }

    $scope.$on( "$ionicView.enter", function() { 
         //jQuery('#menu-dashboard-content .container').hide(0);
        /*if ($scope.currentUser && $scope.currentUser.batiment === undefined){
            $state.go('public.fakeWizardSignUp');
        }else*/ 
        /*$timeout($timeout(
            function() {

                if (!$scope.currentUser || !$scope.currentUser.batiment){
                    //   $state.go('public.tryApp');
                }             
            },200)
                );
        */
        if($rootScope.currentUser.fullAddress !== $scope.currentUser.fullAddress) {
            $scope.currentUser.fullAddress = $rootScope.currentUser.fullAddress;
        }
        //alert($rootScope.currentUser.fullAddress);
        //alert($scope.currentUser.fullAddress);
        $scope.loadPage();
    })
    //console.log(UserService.getByKey($scope.loggedInUser.uid)); //console.log($scope.loggedInUser.uid,DataService.getChild('incidents'),DataService.getChild('users/'+$scope.loggedInUser.uid),IncidentService.save());
    /*$scope.$on( "$ionicView.enter", function(scopes, states) { 
        if (!$scope.currentUser){
            $state.go('public.fakeWizardSignUp');
        }
    })*/

    //ShowToast for show toast when user press button.
    $scope.showToast = function (menuName) {
        //Calling $mdToast.show to show toast.
        $mdToast.show({
            controller: 'toastController',
            templateUrl: 'toast.html',
            hideDelay: 800,
            position: 'top',
            locals: {
                displayOption: {
                    title: 'Going to ' + menuName + " !!"
                }
            }
        });
    }// End showToast.
});// End of controller menu dashboard.