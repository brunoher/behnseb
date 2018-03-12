// Controller of menu dashboard page.
appControllers.controller('incidentsDashboardCtrl', function ($scope, $mdToast,$mdBottomSheet,IncidentService,$mdDialog,$stateParams,$timeout,$ionicHistory,$ionicViewSwitcher,$state,$log,CommentaireService,$rootScope,$filter,Auth,filterFilter) {
    //ShowToast for show toast when user press button.
    $scope.addNewIncidentStepOne = function(){
        //  var stateParams = { typeIncident: params.value };
        //console.log(stateParams);
        $state.go('app.addIncident');
    }
    //console.log($stateParams,$filter('orderBy'));
    $scope.list = false;
    var self = $scope;

    self.simulateQuery = false;
    self.isDisabled    = false;

    // list of `state` value/display objects
    self.states        = loadAll();
    self.querySearch   = querySearch;
    self.selectedItemChange = selectedItemChange;
    self.searchTextChange   = searchTextChange;
    $scope.incidentIsUnlistedConfirmation=false;
    self.newState = newState;

    function newState(state) {
        alert("Sorry! You'll need to create a Constitution for " + state + " first!");
    }

    // ******************************
    // Internal methods
    // ******************************

    /**
     * Search for states... use $timeout to simulate
     * remote dataservice call.
     */
    function querySearch (query) {
        var results = query ? self.states.filter( createFilterFor(query) ) : self.states,
            deferred;
        if (self.simulateQuery) {
            deferred = $q.defer();
            $timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
            return deferred.promise;
        } else {
            return results;
        }
    }

    function searchTextChange(text) {
        console.log('Text changed to ' + text);

    }

    function selectedItemChange(item) {
        $log.info('Item changed to ' + JSON.stringify(item));
    }

    /**
     * Build `states` list of key/value pairs
     */
    function loadAll() {
        var allStates = 'Ascenseur, Electricité, Dégats des eaux, Nettoyage, Dégradation, Autres';

        return allStates.split(/, +/g).map( function (state) {
            return {
                value: state.toLowerCase(),
                display: state
            };
        });
    }

    /**
     * Create filter function for a query string
     */
    function createFilterFor(query) {
        var lowercaseQuery = angular.lowercase(query);

        return function filterFn(state) {
            return (state.value.indexOf(lowercaseQuery) === 0);
        };

    }

    $scope.loadPage = function(){
        $scope.loadUserIncidents();
        $scope.loadIncidents();



    }

    $scope.templates =
        [{ name: 'template1.html', url: 'templates/incidents/html/single-incident.html'},
         { name: 'template2.html', url: 'template2.html'}];
    $scope.template = $scope.templates[0];

    $scope.loadUserIncidents = function(){
        //  var stateParams = { typeIncident: params.value };
        //$state.go('app.addIncident');
        var index = 'userIndex';
        console.log('rrot',$rootScope,Auth,Auth.$getAuth().uid);
        var key = Auth.$getAuth().uid;//$rootScope.loggedInUser.uid;
        var value = true;
        $scope.userIncidentsList = IncidentService.allByIndex(index,key,value);
        //console.log($scope.list,value);
    }
    $scope.paging={};// = false;
    $scope.paging.shouldLoadData = false;
    $scope.isLoading = false;
    var orderBy = $filter('orderBy');
    $scope.incidentIsUnlistedConfirmation=false;

    $scope.navigateTo = function (stateName,objectData,id) {
        /*
        if ($ionicHistory.currentStateName() != stateName) {
            $ionicHistory.nextViewOptions({
                disableAnimate: false,
                disableBack: true
            });
*/
        //Next view animate will display in back direction
        //   $ionicViewSwitcher.nextDirection('back');
        //:console.log(objectData);
        $state.go(stateName, {
            item: objectData,
            id: id
        });
        // }
    }; // End of navigateTo.
    $scope.$on( "$ionicView.enter", function() {
        console.log('$ionicView');
        //
        $timeout(function () {         
            $scope.doRefresh();
        },
                 3000, false);
    })

    // doRefresh is for refresh feed.
    $scope.doRefresh = function (refresher) {
        console.log('doRefresh');
        $scope.paging.shouldLoadData = false;
        //$scope.getFeedData(false);
        $scope.listData = [];
        $scope.loadIncidents();
        $timeout(function(){ 
            if ($scope.isLoading == false) {
                //      $scope.isLoading = true;
                $scope.$broadcast('scroll.refreshComplete');
                //refresher.complete();
            }else{
                //$scope.isLoading = true;

            }
            // $scope.isLoading = false;
            console.log('doRefresh3');

            // To stop loading progress.
            //  $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.isLoading = false;
        }, 1000);


    };// End doRefresh.
    var contacts = [ 
        {'givenName' : 'Lisa',	'familyName' : 'Adams'	},
        {'givenName' : 'Bob',	'familyName' : 'Arnet'	},
        {'givenName' : 'Frank',	'familyName' : 'Able'	},
        {'givenName' : 'John',	'familyName' : 'Crow'	},
        {'givenName' : 'Bill',	'familyName' : 'Ward'	}
    ];



    // loadMore is for loading more feed.
    $scope.loadMore = function () {
        if ($scope.isLoading == false) {
            $scope.isLoading = true;
            if ($scope.paging.next == "") {
                //$scope.getFeedData(true);
            } else {
                //$scope.getNextFeedData();
            }

        }
    };// End loadMore.
    $scope.filteredIncidents = [];
    function dynamicSort(property) {
        var sortOrder = 1;
        if(property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }
        return function (a,b) {
            var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result * sortOrder;
        }
    }
    $scope.listData = [];
    $scope.loadIncidents = function(){
        //  var stateParams = { typeIncident: params.value };
        //console.log('ZZZZZZZ');
        $timeout(function () {
            if ($scope.isAndroid) {
                jQuery('#incident-post-loading-progress').show();
            }
            else {
                jQuery('#incident-post-loading-progress').fadeIn(700);
            }
        }, 400);


        //$state.go('app.addIncident');
        //console.log($scope,$scope.currentUser,$scope.currentAuth);
        var index = 'immeubleIndex';
        var key = $rootScope.currentUser.immeuble;

        //var key = $scope.loggedInUser.uid;
        var value = true;

        var promise = IncidentService.allByIndex(index,key,value);
        //$scope.list = IncidentService.all();
        //console.log('load',$scope.currentUser,$scope.list,value);


        promise.$loaded().then(function(data){
            //$scope.list.isloaded = true;
            //$scope.list.sort(dynamicSort("description"));
            // $scope.list = data;

            angular.forEach(data, function(element,key) {
                // $scope.filteredIncidents.push(element);
                //console.log('las',element,key,data[key].last_comment,key);
                //return;
                if(data[key].last_comment){
                    //          data[key].last_comment=null;
                    /*
                    var commentPromise = data[key].last_comment.$loaded();
                    commentPromise.then(function(comment){
                        console.log('com',comment);
                        if(comment.length){
                       //     data[key].last_comment_details = CommentaireService.getByKey(comment[0].$id);
                        //    data[key].comments_amount = comment.length;
                        }


                    });
                    */
                }
                var item = {};
                item.user = element.user;
                item.key = element.key;
                item.description = element.description;
                item.immeuble = element.immeuble;
                item.batiment = element.batiment;
                item.zone = element.zone;
                item.type = element.type;
                item.status = element.status;
                item.picture = element.picture;
                item.last_comment = element.last_comment;
                item.timestamp = element.timestamp;
                item.last_comment_details = {};
                item.id = element.id;
                var commentPromise = item.last_comment.$loaded();

                commentPromise.then(function(comment){
                    if(comment.length){
                        $scope.propertyName = 'timestamp';
                        $scope.reverse = true;
                        comment = orderBy(comment, $scope.propertyName, $scope.reverse);
                        console.log(comment);


                        // item.last_comment_details = CommentaireService.getByKey(comment[0].$id);
                        //    data[key].comments_amount = comment.length;
                        var commentKey = comment[0].$id;
                        var commentDetailsPromise = CommentaireService.getByKey(commentKey);
                        //   console.log('com',commentDetailsPromise);
                        commentDetailsPromise.$loaded(function(com){
                            //         console.log('comcomcom',com[commentKey]);
                            com[commentKey].links={};
                            item.last_comment_details = com[commentKey];
                        });
                    }else{
                        item.last_comment_details = false;
                    }


                });
                $scope.listData.push(item);


            });

            $scope.propertyName = 'timestamp';
            $scope.reverse = true;

            $scope.listData = orderBy($scope.listData, $scope.propertyName, $scope.reverse);
            $scope.listDataByDay = {};
            $scope.listDataOpenByDay = {};
            $scope.listDataCloseByDay = {};
            $scope.listDataUserAll = {};

            $scope.listDataOpen = filterFilter( $scope.listData, {status:'open'});
            $scope.listDataClose = filterFilter( $scope.listData, {status:'solved'});
            $scope.listDataUser = filterFilter( $scope.listData, {user:$scope.loggedInUser.uid});


            var listDataOpenLength = $scope.listDataOpen.length;
            var listDataCloseLength = $scope.listDataClose.length;
            var listDataUserLength = $scope.listDataUser.length;

            var firstLetter;
            for(var i = 0; i < listDataCloseLength; i++) {
                firstLetter = $scope.listDataClose[i].description.substring(0,1).toUpperCase();
                firstLetter = new Date($scope.listDataClose[i].timestamp);
                //firstLetter.toISOString().substring(0, 10);
                firstLetter = moment(firstLetter).format('DD/MM/YYYY');

                //console.log('fir',firstLetter);
                if(!$scope.listDataCloseByDay[firstLetter]) $scope.listDataCloseByDay[firstLetter] = [];

                $scope.listDataCloseByDay[firstLetter].push ( $scope.listDataClose[i] );
            }

            for(var i = 0; i < listDataOpenLength; i++) {
                firstLetter = $scope.listDataOpen[i].description.substring(0,1).toUpperCase();
                firstLetter = new Date($scope.listDataOpen[i].timestamp);
                //firstLetter.toISOString().substring(0, 10);
                firstLetter = moment(firstLetter).format('DD/MM/YYYY');

                //console.log('fir',firstLetter);
                if(!$scope.listDataOpenByDay[firstLetter]) $scope.listDataOpenByDay[firstLetter] = [];

                $scope.listDataOpenByDay[firstLetter].push ( $scope.listDataOpen[i] );
            }

            for(var i = 0; i < listDataUserLength; i++) {
                firstLetter = new Date($scope.listDataUser[i].timestamp);
                //firstLetter.toISOString().substring(0, 10);
                firstLetter = moment(firstLetter).format('DD/MM/YYYY');

                //console.log('fir',firstLetter);
                if(!$scope.listDataUserAll[firstLetter]) $scope.listDataUserAll[firstLetter] = [];

                $scope.listDataUserAll[firstLetter].push ( $scope.listDataUser[i] );
            }

            console.log('xx',$scope.listDataUserAll,$scope.loggedInUser);
            console.log($scope.comments);

            console.log('li',$scope.listData.length);
            $timeout(function () {
                jQuery('#incident-post-loading-progress').hide();
                jQuery('#social-feed-content').fadeIn();
            }, 1000);// End loading progress. 
        });

        return promise;

    }
    $scope.loadPage();


    //$scope.existingIncidents = [];
    //console.log();
    // For show show List Bottom Sheet.
    $scope.showListBottomSheet = function ($event) {
        $mdBottomSheet.show({
            templateUrl: 'ui-list-bottom-sheet-templatez',
            targetEvent: $event,
            scope: $scope.$new(false),
        });
    };// End of showListBottomSheet.

    // For show Grid Bottom Sheet.
    $scope.showGridBottomSheet = function ($event) {
        console.log('ok');
        $mdBottomSheet.show({
            templateUrl: 'ui-grid-bottom-sheet-templatez',
            targetEvent: $event,
            scope: $scope.$new(false),
        });
    };// End of showGridBottomSheet.

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
}).controller('singleIncidentPageCtrl', function ($scope, $mdToast,$state,$stateParams,$mdBottomSheet,$mdDialog,IncidentService,$ionicSlideBoxDelegate,$timeout,CommentaireService,$rootScope,$filter,$firebaseObject) {

    $scope.form = {};
    //console.log($stateParams);
    //$scope.item = $stateParams.item;
    $scope.comments = [];
    $scope.canEditEvent = false;

    IncidentService.getByKey($stateParams.id).$loaded().then(function(data){
        $scope.item  = data[0];//$stateParams.id
        console.log(data,$scope.form);
        if($scope.item.user === $scope.currentUser.id && $scope.item.status === "open") {
            $scope.canEditEvent = true;
        }
    });
    $scope.getImage = function(uid) {
        //console.log();
        var imageRef = firebase.database().ref('images/'+uid);
        $scope.image = $firebaseObject(imageRef);

        $scope.image.$loaded().then(function(snapshot) {
            //PopupService.show("debug");
            console.log('getImage a base64 string!',snapshot);
            // var imageRef = firebase.database().ref('incidents/-Kq5vsErfREpl1g0V8rI/images/'+snapshot.key).set(true);
            // $scope.form.picture.push(snapshot.key);
        });

        return $scope.image;

    }
    $scope.loadIncidentCommentaires = function(){
        //  var stateParams = { typeIncident: params.value };
        //$state.go('app.addIncident');
        var index = 'incidentIndex';
        var key = $stateParams.id;
        var value = true;
        $scope.comments = [];
        $scope.incidentCommentairesList = CommentaireService.allByIndex(index,key,value);
        console.log($scope.list,value);
        $scope.incidentCommentairesList.$loaded().then(function(list){
            angular.forEach($scope.incidentCommentairesList, function(element) {
                $scope.comments.push(element);
            });

            var orderBy = $filter('orderBy');
            $scope.propertyName = 'timestamp';
            $scope.reverse = false;
            $scope.comments = orderBy($scope.comments, $scope.propertyName, $scope.reverse);
            console.log($scope.comments);


        });

        console.log($scope);

    }

    $scope.loadIncidentCommentaires();

    // $scope.comments.push({content:'ok',author:{name:'Jean'}});
    console.log('single',$scope.item,$state,$stateParams);
    //$stateParams.id=33;
    // Loading progress.
    $scope.$on( "$ionicView.enter", function( scopes, states ) {
        if( states.fromCache && states.stateName == "your view" ) {
            // do whatever
        }

        $scope.loadPage();
    });
    
    $scope.addComment=function(data){
        //$scope.form = {};
        //$scope.form.content = data.comment;
 
        if ($scope.form.content.length > 1) {
            $scope.form.user = $rootScope.loggedInUser.uid;
            console.log('$scope.loggedInUser',$rootScope,$scope.form,$stateParams);
            $scope.form.incident = $scope.item.key;
            $scope.form.immeuble = $scope.item.immeuble;
            $scope.form.batiment = $scope.item.batiment;
            // $scope.form.user = $scope.loggedInUser.uid;
            $scope.isEditCommentForm = false;
            //$scope.form.image = $scope.myImage ;

            $scope.form.links={};
            //return;

            if ($scope.isEditCommentForm) {
                CommentaireService.save($stateParams.id,$scope.form);
            } else {
                CommentaireService.add($scope.form);
            }

            $scope.form = null;
            $scope.form = {};
            $scope.loadIncidentCommentaires();
        }
    }

    $scope.loadPage = function(){
        $timeout(function () {
            if ($scope.isAndroid) {
                jQuery('#incident-post-loading-progress').show();
            }
            else {
                jQuery('#incident-post-loading-progress').fadeIn(700);
            }
        }, 400);
        $timeout(function () {
            jQuery('#incident-post-loading-progress').hide();
            jQuery('#wordpress-post-content').fadeIn();
        }, 1000);// End loading progress. 
    }



}).controller('addIncidentDashboardCtrl', function (Confirm, Animate, DataService, $scope, $mdToast,$state,$stateParams,$mdBottomSheet,$mdDialog,IncidentService,$ionicSlideBoxDelegate,Camera,$rootScope,$ionicSideMenuDelegate,$firebaseArray,$firebaseObject, PopupService, Utilities, $timeout) {
    //ShowToast for show toast when user press button.
    
    /*--------------------Style-----------------------*/


    /*------------------------------------------------*/
    var typeIncident = $state.params.typeIncident;
    console.log('ff',$state.params,typeIncident);
    $ionicSideMenuDelegate.canDragContent(false);
    $scope.selectPhoto = function (_event) {

        if (_event.keyCode == 13 || _event.x == 0) {
            //event.preventDefault();
            return true;
        }
        var options = {
            'buttonLabels': ['Take Picture', 'Select From Gallery'],
            'addCancelButtonWithLabel': 'Cancel'
        };
        window.plugins.actionsheet.show(options, function (_btnIndex) {
            if (_btnIndex === 1) {
                doGetProfilePhoto();
            } else if (_btnIndex === 2) {
                doGetGalleryPhoto();
            }
        });
    }


    /**
 * displays the photo gallery for the user to select an image to
 * work with
 */
    function doGetGalleryPhoto() {
        CameraService.getPicturesFromGallery().then(function (imageURI) {
            console.log(imageURI);
            vm.lastPhoto = imageURI;
            vm.newPhoto = true;
        }, function (err) {
            console.log(err);
            vm.newPhoto = false;
            //alert("Buddy Connector", "Error Getting Photo " + err);
        });
    }

    /**
 * displays the camera for the user to select/take a photo
 */
    function doGetProfilePhoto() {
        var picOptions = {
            destinationType: navigator.camera.DestinationType.FILE_URI,
            quality: 75,
            targetWidth: 500,
            targetHeight: 500,
            allowEdit: true,
            saveToPhotoAlbum: false
        };


        CameraService.getPicture(picOptions).then(function (imageURI) {
            console.log(imageURI);
            vm.lastPhoto = imageURI;
            vm.newPhoto = true;

        }, function (err) {
            console.log(err);
            vm.newPhoto = false;
            //alert("Buddy Connector", "Error Getting Photo " + err);
        });
    }
    $scope.incidentIsUnlistedConfirmation=false;
    $scope.addNewIncident = function(params){
        var stateParams = { typeIncident: params.value };
        //console.log(stateParams);
        $state.go('app.addIncidentStepTwo',stateParams);
    }
    $scope.nextSlide = function() {
        $ionicSlideBoxDelegate.next();
    };
    $scope.previousSlide = function() {
        $ionicSlideBoxDelegate.previous();
    };
    $scope.goToSlide = function(i){
        //var stateParams = { typeIncident: params.value };
        //console.log(stateParams);
        $ionicSlideBoxDelegate.slide(i, [10])
    }
    $scope.isEditForm=false;
    $scope.refreshIncidents = function(){
        console.log($scope.form.type);
        //console.log($scope,$scope.currentUser,$scope.currentAuth);
        var index = 'immeubleIndex';
        var key = $rootScope.currentUser.immeuble;

        //var key = $scope.loggedInUser.uid;
        var value = true;

        var promise = IncidentService.allByIndex(index,key,value);
        //$scope.list = IncidentService.all();
        console.log('load',$scope.currentUser,$scope.list,value);


        promise.$loaded().then(function(data){
            console.log('refreshIncidents',data);
        });

        //  $scope.test=$scope.listData.length;
    }
    $scope.refreshIncidentsData = function(data){
        console.log(data);
        $scope.listData = data;
        //  $scope.test=$scope.listData.length;
    }

    $scope.$watch('listData', function(newValue, oldValue) {
        console.log('listData',newValue.length, oldValue.length);
        console.log('listData',newValue, oldValue);
        // scope.counter = scope.counter + 1;
    });
    $scope.initialForm = function () {
        if($stateParams.id!==null && $stateParams.id!==undefined){
            $scope.isEditForm=true;
        }
        // $scope.disableSaveBtn is  the variable for setting disable or enable the save button.
        $scope.disableSaveBtn = false;
        // $scope.contract is the variable that store contract detail data that receive form contract list page.
        // Parameter :  
        // $stateParams.actionDelete(bool) = status that pass from contract list page.
        // $stateParams.contractdetail(object) = contract that user select from contract list page.
        $scope.form ={titre:'',description:''};// $scope.getContractData($stateParams.actionDelete, $stateParams.contractdetail);
        $scope.form.batiment = $scope.currentUser.batiment;
        $scope.form.immeuble = $scope.currentUser.immeuble;
        $scope.form.status = 'open';
        $scope.form.picture = [];
        $scope.form.read = 0;
        //$scope.form.image = $scope.myImage ;
        if($scope.isEditForm){
            console.log('stayt',$state,$stateParams,$stateParams.id);

            IncidentService.getByKey($stateParams.id).$loaded().then(function(data){
                $scope.form = data[0];//$stateParams.id
            });

        }

        //$scope.actionDelete is the variable for allow or not allow to delete data.
        // It will allow to delete data when have data in the database.
        $scope.actionDelete = $stateParams.actionDelete;
    }; //End initialForm.

    $scope.img = {};

    $scope.takePicture = function(index, imgSrc) {    
        $scope.showActionSheet = false;
        Utilities.takePicture(index, imgSrc, false, false, true).then(function(result){
            $scope.img.src = result;
            $mdBottomSheet.hide();
            $timeout(function() {
                Utilities.readURL(result, '#img', true);
                Utilities.readURL(result, '#img2', true);
            }, 1000);
        }), function(error){
            console.log(error);
        }; 
    };

    

    $scope.saveIncident = function (form, $event) {
        $mdBottomSheet.hide();
        //mdDialog.show use for show alert box for Confirm to save data.
        $mdDialog.show({
            controller: 'DialogController',
            templateUrl: 'confirm-dialog.html',
            targetEvent: $event,
            locals: {
                displayOption: {
                    title: "Sauvegarder les modifications ?",
                    content: "Votre incident sera publié.",
                    ok: "Confirmer",
                    cancel: "Fermer"
                }
            }
        }).then(function () {
            $scope.form.user = $scope.loggedInUser.uid;
            //$scope.form.image = $scope.myImage ;

            console.log($scope,$scope.form);
            $scope.form.links={};


            if ($scope.isEditForm) {
                IncidentService.save($stateParams.id,$scope.form).then(function(form){
                    postImage($stateParams.id).then(function(incidentPicture_value) {});  
                })
      
            } else {
                IncidentService.add($scope.form).then(function(incidentId){
                    postImage(incidentId).then(function(incidentPicture_value){
                        //alert(incidentPicture_value);
                    });
                });
            }
            
            // $scope.form={};
            $state.go('app.listIncidents');
            return ;
            // For confirm button to save data.
            try {
                // To update data by calling ContractDB.update(contract) service.
                if ($scope.actionDelete) {
                    if ($scope.contract.id == null) {
                        $scope.contract.id = $scope.contractList[$scope.contractList.length - 1].id;
                    }
                    ContractDB.update(contract);
                } // End update data. 

                // To add new data by calling ContractDB.add(contract) service.
                else {
                    ContractDB.add(contract);
                    $scope.contractList = ContractDB.all();
                    $scope.actionDelete = true;
                }// End  add new  data. 

                // Showing toast for save data is success.
                $mdToast.show({
                    controller: 'toastController',
                    templateUrl: 'toast.html',
                    hideDelay: 400,
                    position: 'top',
                    locals: {
                        displayOption: {
                            title: "Data Saved !"
                        }
                    }
                });//End showing toast.
            }
            catch (e) {
                // Showing toast for unable to save data.
                $mdToast.show({
                    controller: 'toastController',
                    templateUrl: 'toast.html',
                    hideDelay: 800,
                    position: 'top',
                    locals: {
                        displayOption: {
                            title: window.globalVariable.message.errorMessage
                        }
                    }
                });//End showing toast.
            }
        }, function () {
            // For cancel button to save data.
        });// End alert box.
    };// End save contract.

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

    $scope.deleteContract = function (contract, $event) {
        //$mdBottomSheet.hide() use for hide bottom sheet.
        $mdBottomSheet.hide();
        //mdDialog.show use for show alert box for Confirm to delete data.
        $mdDialog.show({
            controller: 'DialogController',
            templateUrl: 'confirm-dialog.html',
            targetEvent: $event,
            locals: {
                displayOption: {
                    title: "Confirm to remove data?",
                    content: "Data will remove form SQLite.",
                    ok: "Confirm",
                    cancel: "Close"
                }
            }
        }).then(function () {
            // For confirm button to remove data.
            try {
                // Remove contract by calling ContractDB.remove(contract)service.
                if ($scope.contract.id == null) {
                    $scope.contract.id = $scope.contractList[$scope.contractList.length - 1].id;
                }
                ContractDB.remove(contract);
                $ionicHistory.goBack();
            }// End remove contract.
            catch (e) {
                // Showing toast for unable to remove data.
                $mdToast.show({
                    controller: 'toastController',
                    templateUrl: 'toast.html',
                    hideDelay: 800,
                    position: 'top',
                    locals: {
                        displayOption: {
                            title: window.globalVariable.message.errorMessage
                        }
                    }
                });// End showing toast.
            }
        }, function () {
            // For cancel button to remove data.
        });// End alert box.
    };// End remove contract.

    $scope.validateRequiredField = function (form) {
        return !(   
            (form.description.$error.required == undefined)
        );
    };

    function makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 5; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    } 

    $scope.uploadToStorage=function(base64,postId){
        var uid = makeid();
        var img = {};
        var storageRef = rootRef.child("incidents/"+uid);

        var task = storageRef.putString(base64, 'data_url').then(function(snapshot) {
            storageRef.getDownloadURL().then(function(url) {
                // img.base64=null;
                img.url= url;
                $scope.imgs.$add(img).then(function(snapshot) {
                    if (postId) {
                        // var imageRef = firebase.database().ref('incidents/'+postId+'/images/'+snapshot.key).set(true);
                        var imgs = [];
                        imgs.push(snapshot.key);
                        var imageRef = firebase.database().ref('incidents/'+postId+'/picture/').set(imgs);
                        $scope.form.picture= null;
                        $scope.form.picture= [];

                    }
                    $scope.form.picture.push(snapshot.key);
                });
            });
        });
        //return $scope.imgs.$add(img);
    }

    var postImage = function(incidentId){
        new Promise(function(resolve, reject){
            var output = [{}, ""];
            
            if ($scope.img.src) {
                var storageId = makeid(),
                url = "",
                incidentPicture_key = "incidents/"+incidentId+"/picture",
                incidentPicture_value = [],
                img = rootRef.child('images'),
                imgs = $firebaseArray(img);
                
                if ($scope.isEditForm && $scope.form.picture) {
                    angular.copy($scope.form.picture, incidentPicture_value);
                    //alert(incidentPicture_value[0]);
                }
  
                Utilities.setImageReadyToExportToFirebase($scope.img.src).then(function(imageConvertedToBlob) {
              
                    Utilities.putImageInFirebaseStorage('incidents', storageId, imageConvertedToBlob).then(function(imageName) {
                        
                        var locationInStorage = 'incidents/'+imageName;
                        
                        Utilities.setImageUrl(locationInStorage).then(function(url_and_null) {
                            //url_and_null[0] = url vers l'image dans le storage
                            url = url_and_null[0];
                            
                            imgs.$add({url: url}).then(function(snapshot) { // snapshot : $id de l'image dans le noeud '/images'
                                incidentPicture_value.push(snapshot.key);
                                DataService.addCustom(incidentPicture_key, incidentPicture_value);    
                                resolve(incidentPicture_value);   
                            });
                        });
                    });
                });        
            
            } else {
                resolve("noImage");
            }
            
        }).catch(function(error){
            PopupService.show('showError');
            console.log(error);
        });   
    }

    var deletePic = function() {
        $scope.img.src = null;
    }

    $scope.deleteimg = function(imgid) {
        var title = "Suppression image.",
        btn_text = "Supprimer",
        param = false,
        templateTxt = "Souhaitez-vous supprimer cette image ?";

        Confirm.confirmPopUp(deletePic, title, btn_text, param, templateTxt);
        
    }
    

    // contractForm(object) = contract object that presenting on the view.
    $scope.showAddImageBottomSheet = function ($event, contractForm) {
        //$scope.disableSaveBtn = $scope.validateRequiredField(contractForm);
        $mdBottomSheet.show({
            templateUrl: 'image-actions-template.html',
            targetEvent: $event,
            scope: $scope.$new(false),
        });
    };// End showing the bottom sheet.

    // contractForm(object) = contract object that presenting on the view.
    $scope.showAddIncidentBottomSheet = function ($event, contractForm) {
        console.log('sho');
        $scope.disableSaveBtn = $scope.validateRequiredField(contractForm);
        $mdBottomSheet.show({
            templateUrl: 'incident-actions-template.html',
            targetEvent: $event,
            scope: $scope.$new(false),
        });
    };// End showing the bottom sheet.
    $scope.showListBottomSheet = function ($event, noteForm) {

        $scope.disableSaveBtn = $scope.validateRequiredField(noteForm);

        $mdBottomSheet.show({
            templateUrl: 'contract-actions-template',
            targetEvent: $event,
            scope: $scope.$new(false),
        });
    };// End showing the bottom sheet.

    $scope.deleteimgEdit = function(imgid) {
        var r = confirm("Souhaitez-vous supprimer cette image ?");
        if (r == true) {
            $scope.img.src = null;
        }
    };
    $scope.initialForm();

     /*

    $scope.inputPicture = {"from":0,"type":"picture"};
    $scope.takePicture = function(){
        // $ionicTabsDelegate.select(1);
        var options = {
            quality:65,
            targetWidth:400,
            targetHeight:400,
            destinationType:0,
            correctOrientation: true

        };
        $mdBottomSheet.hide();
        return Camera.getPicture(options).then(function(imageData) {
            Animate.loadStrt(3000);
            imageData  = "data:image/jpeg;base64,"+imageData;
            $scope.uploadToStorage(imageData);

            // $scope.inputPicture.content = "data:image/jpeg;base64,"+imageData;
        }, function(err) {
            console.log(err);
        });
    };
    
    $scope.sendPicture = function(){
        if(angular.isDefined($scope.inputPicture.content)){
            var now = new Date().getTime();
            $scope.inputPicture.time = now;
            DetailMessages($localStorage.userLogin.id).post($stateParams.id,$scope.inputPicture);
            $scope.Messages = {};
            $scope.Messages.content = "[picture]";
            $scope.Messages.time = $scope.inputPicture.time;
            $scope.Messages.unread = 0;
            Messages($localStorage.userLogin.id).post($stateParams.id,$scope.Messages);
            Notification().post($stateParams.id);
            $scope.inputPicture = {"from":0,"type":"picture"};
        } else $scope.takePicture();
    };

    $scope.showInputImages = function(){
        var options = {  
            sourceType:0,
            quality:75,
            targetWidth:720,
            targetHeight:1280,
            destinationType:0,
            correctOrientation: true
        };
        Camera.getPicture(options).then(function(imageData) {
            // $scope.form.picture = "data:image/jpeg;base64,"+imageData;
            Animate.loadStrt(3000);
            imageData  = "data:image/jpeg;base64,"+imageData;
            $scope.uploadToStorage(imageData);
            // $scope.inputPicture.content = "data:image/jpeg;base64,"+imageData;
            // $ionicTabsDelegate.select(1);
        }, function(err) {
            console.log(err);
        });
        $mdBottomSheet.hide();
    };

    $scope.uploadFile = function() {
        var sFileName = $("#nameImg").val();
        if (sFileName.length > 0) {
            var blnValid = false;
            for (var j = 0; j < _validFileExtensions.length; j++) {
                var sCurExtension = _validFileExtensions[j];
                if (sFileName.substr(sFileName.length - sCurExtension.length, sCurExtension.length).toLowerCase() == sCurExtension.toLowerCase()) {
                    blnValid = true;
                    var filesSelected = document.getElementById("nameImg").files;
                    if (filesSelected.length > 0) {
                        var fileToLoad = filesSelected[0];

                        var fileReader = new FileReader();


                        fileReader.readAsDataURL(fileToLoad);
                        return fileReader;
                    }
                    break;
                }
            }

            if (!blnValid) {
                alert('File is not valid');
                return false;
            }
        }

        return true;
    }

    $scope.uploadFileX = function() {
        //console.log();
        var fileReader = $scope.uploadFile();
        fileReader.onload = function(fileLoadedEvent) {
            var textAreaFileContents = document.getElementById(
                "textAreaFileContents"
            );
            var img = {
                date: '001',// firebae.ServerValue.TIMESTAMP,
                base64: fileLoadedEvent.target.result
            };
            $scope.uploadToStorage(img.base64);
            console.log(img);

        };

    }

    $scope.getIncidentData = function (id) {
        // tempContract is  temporary contract data detail.
        var tempContract = {
            id: null,
            firstName: '',
            lastName: '',
            telephone: '',
            email: '',
            createDate: $filter('date')(new Date(), 'MMM dd yyyy'),
            age: null,
            isEnable: false
        }
        // If actionDelete is true Contract Detail Page will show contract detail that receive form contract list page.
        // else it will show tempContract for user to add new data.
        return (actionDelete ? angular.copy(contractDetail) : tempContract);
    };//End get contract detail data.
    
    $scope.getImage = function(uid) {
        //console.log();
        var imageRef = firebase.database().ref('users/0IdeJ4UYg3WAfcSmLAlkGkkEmXt2');
        $scope.image = $firebaseObject(imageRef);

        $scope.image.$loaded().then(function(snapshot) {
            
            // var imageRef = firebase.database().ref('incidents/-Kq5vsErfREpl1g0V8rI/images/'+snapshot.key).set(true);
            // $scope.form.picture.push(snapshot.key);
        });

        return $scope.image;

    }

    $scope.addInputImagesToIncident=function(){
        // $ionicTabsDelegate.select(1);
        var postId = $stateParams.id;

        var options = {  
            sourceType:0,
            quality:50,
            targetWidth:360,
            targetHeight:640,
            destinationType:0,
            correctOrientation: true
        };
        Camera.getPicture(options).then(function(imageData) {
            // $scope.form.picture = "data:image/jpeg;base64,"+imageData;
            imageData  = "data:image/jpeg;base64,"+imageData;

            $scope.uploadToStorage(imageData,postId);
            // $scope.inputPicture.content = "data:image/jpeg;base64,"+imageData;
            // $ionicTabsDelegate.select(1);
        }, function(err) {
            console.log(err);
        });
        $mdBottomSheet.hide();
    };


    $scope.addImageToIncident=function(){
        // $ionicTabsDelegate.select(1);
        var postId = $stateParams.id;
        var options = {
            quality:50,
            targetWidth:360,
            targetHeight:640,
            destinationType:0,
            correctOrientation: true

        };
        Camera.getPicture(options).then(function(imageData) {
            //alert('okdd'+postId);
            imageData  = "data:image/jpeg;base64,"+imageData;
            $scope.uploadToStorage(imageData,postId);

            // $scope.inputPicture.content = "data:image/jpeg;base64,"+imageData;
        }, function(err) {
            console.log(err);
        });
        $mdBottomSheet.hide();

    }

    $scope.removeimage = function(imgid) {
        var r = confirm("Do you want to remove this image ?");
        if (r == true) {
            $scope.form.picture.forEach(function(childSnapshot) {
                if (childSnapshot.$id == imgid) {
                    $scope.imgs.$remove(childSnapshot).then(function(ref) {
                        ref.key === childSnapshot.$id; // true
                        var imageRef = firebase.database().ref('incidents/'+$stateParams.id+'/images').set(null);
                        $scope.image = null;
                        $scope.form.picture = null;
                        $scope.form.picture = [];

                    });
                }
            });
        }
    }

    // var img = firebase.database().ref('images');

    // $scope.imgs = $firebaseArray(img);

    // var _validFileExtensions = [".jpg", ".jpeg", ".bmp", ".gif", ".png"];

    */

}).controller('addIncidentStepTwoCtrl', function ($scope, $mdToast,$state,$stateParams,Poster,$q) {
    var stateParams=$stateParams;
    
    $scope.myCroppedImage = '';
    $scope.picThumb = '';
    $scope.canAddPic = true;
    $scope.canEditPic = false;
    $scope.canSavePic = false;
    $scope.hasSavePic = false;
    console.log('Ctr2',$scope);
    $scope.performClick = function (elemId) {
        console.log('ok');
        var elem = document.getElementById(elemId);
        if (elem && document.createEvent) {
            var evt = document.createEvent("MouseEvents");
            evt.initEvent("click", true, false);
            elem.dispatchEvent(evt);
        }
    }
    this.handleFileSelect = function (files) {
        console.log('rrrr', files)
        //var files = evt.target.files; // FileList object
        // Loop through the FileList and render image files as thumbnails.
        for (var i = 0, f; f = files[i]; i++) {
            // Only process image files.
            if (!f.type.match('image.*')) {
                continue;
            }
            // _this.form.files = f;
            _this.currentFile = f;
            console.log(f);
            var reader = new FileReader();
            // Closure to capture the file information.
            reader.onload = (function (theFile) {
                return function (e) {
                    console.log('onload', files)
                    document.getElementById('newPictureContainer').src = e.target.result;
                    //_this.form.cover = e.target.result;
                    // Render thumbnail.
                    /*
                        var span = document.createElement('span');
                        span.innerHTML = ['<img class="thumb" src="', e.target.result
                                , '" title="', escape(theFile.name), '"/>'].join('');
                        document.getElementById('list').insertBefore(span, null);
                        */
                };
            })(f);
            // Read in the image file as a data URL.
            reader.readAsDataURL(f);
        }
    }

    $scope.performFileInputChange = function (elemId) {
        console.log('performFileInputChange')
        $scope.hasSavePic = false;
        $scope.canAddPic = false;
        var files = angular.element(elemId)[0].files;
        // var image = angular.element('croppie');
        var image = angular.element(document.querySelector("#croppie img"));
        var opts = {};
        var args = {};
        //    var c = new Croppie(document.querySelector("#croppie img"), {});
        // console.log(c); //var c = new Croppie(document.getElementById('croppie'), opts);
        // call a method
        //c.method(args);
        /*
                    var media = angular.element(elemId)[0].files[0];
                    var vendorURL = window.URL || window.webkitURL;
                    var video = vendorURL.createObjectURL(media);
                    console.log('change', video, $scope.test, angular.element(elemId), media);
                    $scope.test = video;
                    takepicture();
                    */
        //    Poster.handleFileSelect(files);
        // var handleFileSelect=function(evt) {
        var file = files[0];
        var reader = new FileReader();
        reader.onload = function (evt) {
            $scope.$apply(function ($scope) {
                $scope.myImage = evt.target.result;
                console.log($scope.myImage);
                $scope.form.image64 = $scope.myImage;
                $scope.canSavePic = true; //  console.log(image, image[0], c.croppie());
                //image.croppie();
            });
        };
        reader.readAsDataURL(file);
    };
    $scope.resizePic = function (myCroppedImage) {
        // console.log('resize', myCroppedImage, $scope.myCroppedImage);
        //  $scope.$apply(function ($scope) {
        $scope.picThumb = myCroppedImage;
        $scope.canSavePic = false;
        $scope.canEditPic = true;
        $scope.hasSavePic = true;
        // });
    }
    $scope.uploadPic = function () {
        //console.log('resize', myCroppedImage, $scope.myCroppedImage);
        //$scope.picThumb = myCroppedImage;
    }
    $scope.resetPic = function () {
        //console.log('resize', myCroppedImage, $scope.myCroppedImage);
        //$scope.picThumb = myCroppedImage;
        $scope.picThumb = '';
        $scope.canSavePic = true;
        $scope.canEditPic = false;
        $scope.hasSavePic = false;
    }
    this.saveImage = function (data) {
        var picData = {
            type: 'images',
            name: 'zz'//this.currentFile.name
        }
        angular.extend(picData, data);
        console.log('saveimg', picData, data);
        return this.generateImages().then(function (pics) {
            return _this.storeImage(pics.full, pics.thumb, picData).then(function (postId) {
                return postId;
            });
        });
    }
    var _this = this;
    this.generateImages = function () {
        var _this = this;
        // console.log('$q', $q.defer());
        var fullDeferred = new $q.defer(); // $.Deferred(); //$q.defer(); //new $
        var thumbDeferred = new $q.defer(); //$.Deferred(); //new $.Deferred();
        var resolveFullBlob = function (blob) {
            console.log(fullDeferred);
            return fullDeferred.resolve(blob);
        };
        var resolveThumbBlob = function (blob) {
            return thumbDeferred.resolve(blob);
        };
        var displayPicture = function (url) {
            var image = new Image();
            image.src = url;
            console.log('displayPicture')
            // Generate thumb.
            var maxThumbDimension = _this.THUMB_IMAGE_SPECS.maxDimension;
            var thumbCanvas = _this._getScaledCanvas(image, maxThumbDimension);
            thumbCanvas.toBlob(resolveThumbBlob, 'image/jpeg', _this.THUMB_IMAGE_SPECS.quality);
            // Generate full sized image.
            var maxFullDimension = _this.FULL_IMAGE_SPECS.maxDimension;
            var fullCanvas = _this._getScaledCanvas(image, maxFullDimension);
            fullCanvas.toBlob(resolveFullBlob, 'image/jpeg', _this.FULL_IMAGE_SPECS.quality);
        };
        var reader = new FileReader();
        reader.onload = function (e) {
            return displayPicture(e.target.result);
        };
        reader.readAsDataURL($scope.myImage);
        //console.log('this.currentFile', this.currentFile, fullDeferred)
        return fullDeferred.promise.then(function (results1) {
            return thumbDeferred.promise.then(function (results2) {
                console.log(this, results1, results2);
                // _this.uploadNewPic(results1, results2);
                return {
                    full: results1,
                    thumb: results2
                };
            });
        });
    };
    $scope.saveEvent = function (data) {
        console.log(data, $scope.myImage);
        //return;
        var picData = {
            type: 'images',
            name: 'aa'//$scope.currentFile.name
        }
        data = $scope.myImage;
        var saveImage = _this.saveImage(picData);
        //console.log('okok', uploadImage);
        return saveImage.then(function (pics) {
            // Upload the File upload to Firebase Storage and create new post.
            //  var data = angular.extend({}, form)
            console.log('saveEvent', data, pics);
            //return pics;
            data.cover = angular.extend({}, pics.urls);
            return _this.prepareImagePost(pics, picData).then(function (postKey) {
                // _this.form.cover = data;
                //Poster.saveImage(data);
                console.log('saveEventPicpostKey', postKey, picData);
                var image = {};
                var type = {};
                image[postKey] = true;
                type['images'] = true;
                data.images = image;
                data.types = type;
                console.log("before-preepareeventspost", data, postKey)
                return _this.prepareEventPost(data).then(function (postKey) {
                    console.log("preepareeventspost", data, postKey)
                    _this.setGeo(data.location.geo, postKey);
                    return postKey;
                });
            })
            //return _this.prepareImagePost(pics, picData);
            //return _this.prepareEventPost(urls, pic, thumb, picData, picRef, thumbRef);
            // var saveEvent = _this.addPost(data);
            // console.log('saveEvent', pics, saveEvent);
        })
        /*
                angular.extend(picData, data);
                console.log('saveEvent', picData, data);
                return this.generateImages().then(function (pics) {
                    return _this.storeImage(pics.full, pics.thumb, picData).then(function (postId) {
                        return postId;
                    });
                });
                */
    }
});// End of controller menu dashboard.