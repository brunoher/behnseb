// Controller of menu toggle.
// Learn more about Sidenav directive of angular material
// https://material.angularjs.org/latest/#/demo/material.components.sidenav
appControllers.controller('NavCtrl', function($cordovaAppVersion, $rootScope, $scope, $ionicSideMenuDelegate, Auth, $localStorage, $state, $ionicLoading) {
    $scope.showMenu = function () {
        $ionicSideMenuDelegate.toggleLeft();
    };
    function userIsNull () {
        $scope.currentUser = null;
        $scope.loggedInUser = null;
        $rootScope.currentUser = null;
        $rootScope.loggedInUser = null;
        $localStorage.LoggedInUser = null;
        $localStorage.userLogin = null;
    } 

    var fbLogout = function() {
        //alert("facebook Logout");
        facebookConnectPlugin.logout(function() {
            userIsNull();
            $ionicLoading.hide();
            $state.go('public.tryApp');
        });   
    }

    var googleLogout = function(){
        userIsNull();
        $ionicLoading.hide();
        $state.go('public.tryApp');
    }

    $scope.logout = function() {
        var firebaseLogout = firebase.auth().signOut();
        
        $ionicLoading.show({
          template: 'Déconnexion...'
        });
        firebaseLogout.then(function() {
            if ($scope.currentUser) {
                if ($scope.currentUser.provider === "facebook") {
                    fbLogout();
                } else/* if ($scope.currentUser.provider === "google+") */{
                    googleLogout();
                }
            } else {
                //alert("provider !== \"facebook\" && \"google+\"");
                userIsNull();
                $ionicLoading.hide();
                $state.go('public.tryApp');
            }
        }).catch(function(error){
            alert("logoutError : " + error);
        });    
    };

    /*$scope.logout = function() {
        var logout = firebase.auth().signOut();

        $scope.currentUser = null;
        $scope.loggedInUser = null;

        $rootScope.currentUser = null;
        $rootScope.loggedInUser = null;

        $localStorage.LoggedInUser = null;
        $localStorage.userLogin = null;
        logout.then(function(){
            $state.go('public.tryApp');

        }, function(error){
            alert("logoutError : " + error);
        });


    };*/
    document.addEventListener("deviceready", function () {
        $cordovaAppVersion.getVersionNumber().then(function (version) {
            $scope.appVersion = version;
        });
    }, false);

    /*
    $cordovaAppVersion.getVersionNumber().then(function (version) {
        $scope.appVersion = version;
    });

    $cordovaAppVersion.getVersionCode().then(function (build) {
        $scope.appBuild = build;
    });
    $cordovaAppVersion.getAppName().then(function (name) {
        $scope.appName = name;
    });
    $cordovaAppVersion.getPackageName().then(function (package) {
        $scope.appPackage = package;
    });
    */
    
    /*
    $scope.showRightMenu = function () {
        $ionicSideMenuDelegate.toggleRight();
    };
    */
});

appControllers.controller('transitionCtrl', function($scope, $state) {
    $scope.$on("$ionicView.enter", function() {
        $state.go("app.homeDashboard");       
    })
});

appControllers.controller('profileCtrl', function($rootScope, $scope, $state, Utilities, $ionicPopup, PopupService, SignInService, DataService, CreateUser, $timeout, IgnApiService, Confirm, Animate){
    //$rootScope.isSidemenu = true;
    /*
    $scope.sendNotif = function(){
        var notificationObj = { 
            contents: {en: "message body", fr:"Un nouveau message pour la copro"},
            filters: [
                {"field": "tag", "key": "copro", "relation": "=", "value": $scope.currentUser.immeuble},
                {"field": "tag", "key": "uid", "relation": "!=", "value": $scope.currentUser.id},
                {"field": "last_session", "relation": ">", "value": "0.001"}
            ]
        };
        window.plugins.OneSignal.postNotification(notificationObj).then(function(successResponse) {
            console.log("Notification Post Success:", successResponse);
        }), function (failedResponse) {
            console.log("Notification Post Failed: ", failedResponse);
            alert("Notification Post Failed:\n" + JSON.stringify(failedResponse));
        }
    }
    */
    $scope.isIos = ionic.Platform.isIOS();
    $scope.isAndroid = ionic.Platform.isAndroid();
    $scope.isIpad = ionic.Platform.isIPad();
    var screenHeight = window.screen.height;
    var screenWidth = window.screen.width;
    var imgContainer_height = screenHeight *0.43;
    var imgContainer_width = imgContainer_height;
    var fieldsContainer_top;
    var imgContainerLeft = (screenWidth - imgContainer_width)/2;
    var subscriptionDate_top;
    var modifBtn_top;
    var syndicMember_top = '170%';
    var marginTopChangeSyndicBtn = 87; 
    
    if (screenHeight > 720 && screenHeight < 1000 && !$scope.isIos) {
        syndicMember_top = '155%';
    } else if (screenHeight < 1250 && screenHeight > 1000){
        syndicMember_top = '100%';
    } else if (screenHeight > 1250) {
        syndicMember_top = '95%';
    } else if (screenHeight > 720 && screenHeight < 1000) {
         syndicMember_top = '150%'
    }

    if( screenWidth >= 6000/9) {
        //imgContainerLeft = 'calc((100% - 600px)/2 - 2%)';
        fieldsContainer_top = 70;
        subscriptionDate_top = '35%';
        modifBtn_top = '62%';
        marginTopChangeSyndicBtn = 62;
    } else if (screenWidth > 400){
        //imgContainerLeft = '3%';
        fieldsContainer_top = 100;
        subscriptionDate_top = '55%';
        modifBtn_top = '85%';
    } else {
        //imgContainerLeft = 2;
        subscriptionDate_top = '65%';
        modifBtn_top = '85%';
        fieldsContainer_top = 105;
    }
    
    /*if ($scope.isIos) {
        modifImgBtn_top = 50; 
    } else {
    */    
        modifImgBtn_top = 50;
   // }

    $scope.changeSyndicStatusStyle = {'margin-top': marginTopChangeSyndicBtn+'%'}; 
    $scope.imgContainer_style = {'height': imgContainer_height+'px', 'margin-left': imgContainerLeft+'px', 'width': imgContainer_width+'px'};
    $scope.cardBottomStyle = {'text-align': 'center', 'font-size':imgContainer_height/30+'px', 'margin-top': subscriptionDate_top};
    $scope.buttonModifImgTop = {'top': modifImgBtn_top+'%'};
    $scope.fieldsContainerTop = {'margin-top' : fieldsContainer_top+'%'};
    $scope.modifBtnStyle = {'margin-top':modifBtn_top};
    $scope.syndicMemberStyle = {'margin-top':syndicMember_top}; 

    $scope.$on( "$ionicView.loaded", function() {
        $scope.data = SignInService.initSelects();
        $scope.o = {};
        $scope.o.isSyndicMember = false; 
        $scope.img_profile = {};               
    });

    $scope.$on("$ionicView.enter", function() {
        $scope.edit_phone = false;
        $scope.edit_photo = false;
        $scope.edit_isSyndicMember = false;

        // Si pas d'image de profile
        if (!$rootScope.currentUser.imageUrl && !$scope.currentUser.imageUrl) {

            var ref = "users/"+$scope.currentUser.id+"/imageUrl";
            DataService.getElement(ref).then(function(imageUrl){
                $scope.img_profile.src = imageUrl;
            });


        } else if ($scope.currentUser.imageUrl) {

            if ($scope.img_profile && $scope.img_profile.src && $scope.img_profile.src.length > 40) {
                
                $scope.currentUser.imageUrl = $scope.img_profile.src;    
            
            } else {
                
                $scope.img_profile.src = $scope.currentUser.imageUrl;
            }
            
        } else {
            $scope.img_profile.src = $rootScope.currentUser.imageUrl;
        }

        $scope.newImg = $scope.img_profile.src; 
        $scope.form = {
            newPhone: $rootScope.currentUser.phone
        }
        $scope.syndicStatus = $scope.currentUser.isSyndicMember;    

        if(!Utilities.isIncorrectValue([DataService.getNewAddress()])) {
            $scope.o = DataService.getNewAddress();
            //alert($scope.o.addressSelected);
            $scope.o.isSyndicMember = $scope.o.isSyndicMember !== true ? false : true;
            $scope.form.newAddress = $scope.o.addressSelected;
            $scope.edit_address = true;
        } else {
            //alert($rootScope.currentUser.fullAddress);
            $scope.form.newAddress = $rootScope.currentUser.fullAddress
            $scope.currentUser.fullAddress = $rootScope.currentUser.fullAddress;
            $scope.edit_address = false;
        }
    });

    function setuserTag (o){
        var user_tag = {};
        user_tag['copro'] = o.immeuble;
        user_tag['isSyndicMember'] = o.isSyndicMember;
        if(o.batName) {
            user_tag['batiment'] = o.batName;
        }
        return user_tag;
    }

    /*var alert = function(){
        $ionicPopup.alert({
            title: 'Tout compte fait...',
            template: 'Vos infos ne seront pas modifiées.'
        });
    }*/    

    $scope.goBack = function () {
        $state.go('profile');
    }

    function setNewAddress(o) {
        DataService.setNewAddress(o);
    }

    $scope.changeAddress = function() {
        if (Utilities.isIncorrectValue([$scope.o.floor, $scope.o.status])){
            PopupService.show('alertIncomplete');
        }else {
            setNewAddress($scope.o);

            $state.go("profile");
        }
    }  

    $scope.abortNewPhone = function() {
        $scope.form.newPhone = $rootScope.currentUser.phone;
        $scope.editPhone = false;
        $scope.edit_phone = false;
        $('#myCheckBox').prop('disabled', false);
    }

    $scope.abortNewAddress = function() {
        $scope.form.newAddress = $rootScope.currentUser.fullAddress;
        $scope.edit_address = false;
    }

    $scope.abortNewPhoto = function() {
        if($rootScope.currentUser.imageUrl) {
            $scope.img_profile.src = $rootScope.currentUser.imageUrl;    
        } else {
            $scope.img_profile.src = "css/img/icon-camera.png";
        }
        $scope.edit_photo = false;
    }

    function _editPhone () {
        if (!SignInService.phoneIsCorrect($scope.form.newPhone)) {
            PopupService.show('alertPhoneProblem');
        }else if ($scope.form.newPhone !== $rootScope.currentUser.phone) {
            DataService.addCustom('users/'+$rootScope.currentUser.id+'/phone', $scope.form.newPhone);
            $rootScope.currentUser.phone = $scope.form.newPhone;
            $scope.currentUser.phone = $rootScope.currentUser.phone;
            $scope.edit_phone = false;
            $('#myCheckBox').prop('disabled', false);     
        }
    }

    $scope._editPhone = function() {
        _editPhone();
    }

    function initObject(newAddress){
        return new Promise (function(resolve) {
            var _id = Utilities.createRandomKey(28);
            var output = {
                addressSelected: newAddress.addressSelected,
                bat: {
                    copro: newAddress.cadastralParcel,
                    fullAddress: newAddress.addressSelected,
                    id: _id
                },
                batimentIndex: {},
                bId: _id,
                cadastralParcel: newAddress.cadastralParcel,
                city: newAddress.city,
                cp: newAddress.cadastralParcel,
                flat: {
                    cadastralParcel: newAddress.cadastralParcel,
                    createdAt: new Date().getTime(),
                    cp: newAddress.postalCode,
                    network: {},
                    bats: {}
                },

                flats: {
                    cadastralParcel: newAddress.cadastralParcel,
                    floor: newAddress.floor,
                    status: newAddress.status
                },
                immeubleIndex: {},
                isSyndicMember: newAddress.isSyndicMember,
                status: newAddress.status,
                userId: $rootScope.currentUser.id

            };
            output.batimentIndex[_id] = true; 
            output.flat.bats[_id] = true;
            output.flat.network[$rootScope.currentUser.id] = true;
            output.immeubleIndex[newAddress.cadastralParcel] = true;
            if (newAddress.batName) {
                output.bat.name = newAddress.batName;
                output.batName = newAddress.batName;
            } else {
                output.bat.name = "";
                output.batName = "";
            }
            resolve(output);
        }).catch(function(e){
            PopupService.show('showError');
            console.log(e);
        });
    }

    $scope._editAdress = function () {    
        new Promise(function(resolve, reject){
            initObject($scope.o).then(function(_newAddress){
                var newAddress = _newAddress;
                CreateUser.changeUserAddress($rootScope.currentUser, newAddress).then(function(newAddressUpdated){
                    newAddress = newAddressUpdated;

                    $rootScope.currentUser.fullAddress = newAddress.bat.fullAddress;
                    $rootScope.currentUser.immeuble = newAddress.cp;
                    $rootScope.currentUser.batiment = newAddress.bId;
                    $rootScope.currentUser.batimentIndex = newAddress.batimentIndex;
                    $rootScope.currentUser.immeubleIndex = newAddress.immeubleIndex;
                    $rootScope.currentUser.isSyndicMember = newAddress.isSyndicMember;
                    $rootScope.currentUser.city = newAddress.city;
                    $rootScope.currentUser.batName = newAddress.batName;
                    
                    $scope.edit_address = false;
                    
                    $scope.currentUser = $rootScope.currentUser;
                    
                    $scope.syndicStatus = $scope.currentUser.isSyndicMember;

                    setNewAddress(null);
                    resolve([$rootScope.currentUser,$scope.edit_address, $scope.currentUser, $scope.syndicStatus]);
                });
            }), function(error){
                console.log(error);
            }; 
        }).then(function(res){
            PopupService.show('modifiedWithSuccess');
            $rootScope.currentUser = res[0];
            $rootScope.edit_address = res[1];
            $scope.currentUser = res[2];
            var user_tag = setuserTag(res[0]);
            if (window.plugins) DataService.updateUserAddressInOneSignal($rootScope.currentUser.id, user_tag);
        }).catch(function(e){
            console.log(e);
        });               
    }

    $scope.readOnlyPhone = function (syndicStatus) {
        $scope.editPhone = !$scope.editPhone;
        $scope.form.newPhone = "";
        $scope.edit_phone = true;
        syndicStatus = $scope.currentUser.isSyndicMember;
        $('#myCheckBox').prop('checked', $scope.syndicStatus);
        $('#myCheckBox').prop('disabled', true);
        $scope.modifSyndicBtn = false;

    }

    $scope.modifSyndicBtnTrue = function() {
        $scope.modifSyndicBtn = true;
    }

    $scope.suggestions = [{fullText:""}];
    $scope.suggest = function (form, data) {
        if (form.typed && form.typed.length > 3) {
            SignInService.getSuggestions(form, data).then(function(obj) {
                $scope.o = null;
                $scope.displayResult = obj.displayResult;
                $scope.showButton = obj.showButton;
                if (obj.suggestions && obj.suggestions.length > 0) {
                    $scope.suggestions = obj.suggestions;
                }  
            });
        }
    }

    $scope.addStreetNumber = function() {
        var nmbr = $scope.data.streetNumber; 
        if (!isNaN(parseInt(nmbr))) {
            $scope.data.selectedSuggestion.fullText = nmbr + " " + $scope.data.selectedSuggestion.fullText;
            IgnApiService.formatString($scope.data.selectedSuggestion.fullText);   
            IgnApiService.setUserFullAdress($scope.data, $scope.form).then(function(obj) {
                $scope.o = obj;
                //$scope.o.addressSelected = $scope.data.selectedSuggestion.fullText;
                $scope.displayResult = obj.displayResult;
                $scope.showButton = obj.showButton;
                //$scope.o.streetNumber = nmbr;
                $scope.data.streetNumber = null;
             }), function (err) {
                console.log(err);
            }; 
        } else {
            PopupService.show("invalidStreetNumber");
            delete $scope.o;
        } 
    }

    $scope.setUserFullAdress = function() {
        Animate.loadStrt();
        SignInService.setUserFullAdress($scope.data, $scope.form).then(function(obj) {
            $scope.o = obj;
            if (isNaN(parseInt($scope.o.streetNumber))) {
                var template = '<input type="text" ng-model="data.streetNumber">';
                var title = "Numéro de rue manquant : souhaitez vous ajouter un numéro de rue à l'adresse :<br>'"+ $scope.data.selectedSuggestion.fullText+"' ?";
                Confirm.addStreetNumber($scope, template, title);
                //PopupService.show("invalidStreetNumber");
                //delete $scope.o;
            }else {
                Animate.loadEnd();
                $scope.displayResult = obj.displayResult;
                $scope.showButton = obj.showButton;
            }
        }), function (e){
            //console.log(e);
        }
    }

    $scope.takePicture = function(index, img) {    
        $scope.showActionSheet = false;
        Utilities.takePicture(index, img, false, true).then(function(result){
            $scope.img_profile.src = result;
            $timeout(function() {
                Utilities.readURL(result, '#img_profile');
            }, 1000);
            $scope.edit_photo = true;
        }), function(error){
            console.log(error);
        }; 
    };

    /*if($scope.isIos === false) {
        var actionSheetClass = 'none-Ios-ActionSheet';
    }else {
        var actionSheetClass = '';
    }*/

    $scope.displayActionSheet = function() {
        $scope.showActionSheet = true;
    };
    $scope.hideActionSheet = function() {
        $scope.showActionSheet = false;
    };

    /*$scope.updateImg = function() {
        //Utilities.readURL($scope.img.src, '#img');
        $scope.img.src = $scope.currentUser.imageUrl;
        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete'); 
    };*/

    $scope.editAddress = function(){
        $scope.edit_address = false;
    }


    $scope.editImage = function(){
        if($scope.img_profile.src !== 'css/img/icon-camera.png' && $scope.img_profile.src !== $rootScope.currentUser.imageUrl){    
            new Promise(function(resolve, reject){
                Utilities.setImageReadyToExportToFirebase($scope.img_profile.src).then(function(result) {
                    Utilities.putImageInFirebaseStorage('images', $rootScope.currentUser.id, result).then(function(res) {
                        Utilities.setImageUrl('images/'+res, 'users/'+$rootScope.currentUser.id+'/imageUrl').then(function(resolved) {
                            //if($scope.currentUser.imageUrl === "css/img/icon-camera.png") { 
                                $scope.img_profile.src = resolved[0]; 
                                $scope.currentUser.imageUrl = $scope.img_profile.src; 
                                $rootScope.currentUser.imageUrl = $scope.img_profile.src; 
                            //} 
                            $scope.edit_photo = false;
                            resolve([$rootScope.currentUser.imageUrl, $scope.currentUser.imageUrl, $scope.edit_photo, $scope.img_profile.src]);
                        }), function(e){
                            console.log(e);
                        };
                    }), function(e){
                        console.log(e);
                    };
                }), function(e){
                    console.log(e)
                };    
            }).then(function(r){
                /*
                $rootScope.currentUser = r[0];
                $scope.currentUser = r[1];
                */
                PopupService.show('modifImage');
            }).catch(function(error){
                PopupService.show('showError');
                console.log(error);
            });  
        } else {
            PopupService.show('selectAFile');
        }
    }

    $scope.editSyndicStatus = function (syndicStatus) {
        if (syndicStatus !== $scope.currentUser.isSyndicMember) {
            DataService.addCustom('users/'+$rootScope.currentUser.id+'/isSyndicMember', syndicStatus); 
            PopupService.show('modifiedWithSuccess');
            $rootScope.currentUser.isSyndicMember = syndicStatus;
            $scope.currentUser.isSyndicMember = syndicStatus;
            $scope.edit_syndicMember = false;
        }
    }

    $scope.date = new Date($rootScope.currentUser.createdAt).toLocaleString();
    $scope.monImmeubleSelected = false;
    $scope.immeubleSelected = function(){
        $scope.monImmeubleSelected = !$scope.monImmeubleSelected;
    }

    $scope.mesDonneesPersoSelected = false;
    $scope.donneesPersoSelected = function(){
        $scope.mesDonneesPersoSelected = !$scope.mesDonneesPersoSelected;
    }
});

appControllers.controller('preferencesCtrl', function($scope){
});

appControllers.controller('cguCtrl', function($scope, $cordovaDevice){      
    if(window.Cordova){
        $scope.myDeviceModel = $cordovaDevice.getPlatform(); 
    }  
});

appControllers.controller('infosCtrl', function($scope){  
});

appControllers.controller('legalsCtrl', function($scope){});

appControllers.controller('menuCtrlD', function () {

});
appControllers.controller('menuCtrl', function (Utilities, $scope, $timeout, $mdUtil, $mdSidenav, $localStorage, $ionicHistory, $state, $ionicPlatform, $mdDialog, $mdBottomSheet, $mdMenu, $mdSelect,userAuth,userData,IncidentService,ImmeubleService,BatimentService,UserService,Auth,$rootScope, Animate) {
    //$scope.isIos = ionic.Platform.isIOS();
    //$scope.isAndroid = ionic.Platform.isAndroid();
    //$scope.isIpad = ionic.Platform.isIPad();
    //$scope.device = ionic.Platform.device();
    var height;
    var addressFontSize;
    var address_marginTop;
    if(window.screen.height > 1000) {
        address_marginTop = 15;
        height = 80;
        addressFontSize = 240;
    } else {
        address_marginTop = 3;
        height = 50;
        addressFontSize = 120;
    }
    $scope.iconHeight = {'height': height+'%'};
    $scope.addressStyle = {'font-size':addressFontSize+'%', 'margin-top':address_marginTop+"%", "text-align":"center"};
    

    $scope.goBackSlide = function() {
        var index = Animate.slide().currentIndex();
        console.log(index);
        if (index>0) {
            Animate.slide().slide(index-1);
        } else {
            //Animate.slide().slide(3);
            $state.go('app.homeDashboard');
        }
    }


    $scope.toggleLeft = buildToggler('left');
    // buildToggler is for create menu toggle.
    // Parameter :  
    // navID = id of navigation bar.

    function buildToggler(navID) {
        var debounceFn = $mdUtil.debounce(function () {
            $mdSidenav(navID).toggle();
        }, 0);
        return debounceFn;
    }// End buildToggler.
    $scope.loggedInUser = userAuth;
    $scope.currentUser = userData[userAuth.uid];
    $rootScope.loggedInUser = userAuth;
    $rootScope.currentUser = userData[userAuth.uid]; 
    //         $rootScope.currentUser = loggedInUserAuth;

    $localStorage.userLogin = {};
    $localStorage.userLogin.id = $scope.loggedInUser.uid;

    $scope.$on( "$ionicView.enter", function() {
        if(Utilities.isIncorrectValue([$scope.currentUser])) {
            $state.go('public.tryApp');

        }
        if(angular.isUndefined(userData[userAuth.uid]) || angular.isUndefined(userData[userAuth.uid].immeuble)){
            console.log('heyhey');
            $state.go('editProfile');
        }
        console.log($scope.currentUser, $rootScope.currentUser);
    })

    $scope.formSelectList = {};// localStorage.get("LoggedInUser");
    $scope.formSelectList.immeubles = ImmeubleService.all();
    $scope.formSelectList.batiments = BatimentService.all();
    $scope.formSelectList.status = {open:{id:'open',name:'En cours'},solved:{id:'solved',name:'Terminé'}};
    $scope.incidentTypes=[];
    $scope.incidentPlaces=[];
    var type = {name:'Accès et sécurité',value:'acces_securite',icon:'N_acces_securite'};
    var type1 = {name:'Ascenseur',value:'ascenseur',icon:'N_ascenceur'};
    var type2 = {name:'Chauffage et Climatisation',value:'chauffage',icon:'N_chauffage'};
    var type3 = {name:'Dégât des eaux',value:'degats_eaux',icon:'N_degat-eau'};
    var type4 = {name:'Electricité',value:'electricite',icon:'N_electricite'};
    var type5 = {name:'Nettoyage et propreté',value:'nettoyage',icon:'N_nettoyage'};
    var type6 = {name:'Problèmes divers',value:'divers',icon:'divers'};

    $scope.incidentTypes.push(type);
    $scope.incidentTypes.push(type1);
    $scope.incidentTypes.push(type2);
    $scope.incidentTypes.push(type3);
    $scope.incidentTypes.push(type4);
    $scope.incidentTypes.push(type5);
    $scope.incidentTypes.push(type6);




    $scope.hasSelectedType=false;
    var zone = {name:'Cage d\'escaliers',value:'other',icon:'cage-escalier'};
    var zone1 = {name:'Espace-vert',value:'espace-vert',icon:'L_espace-vert'};
    var zone2 = {name:'Local poubelle',value:'poubelle',icon:'L_poubelle'};
    var zone3 = {name:'Parking',value:'parking',icon:'L_parking'};
    var zone4 = {name:'Sous-sol et Caves',value:'cave',icon:'L_cave'};
    var zone5 = {name:'Batiment',value:'batiment',icon:'L_immeuble'};
    var zone6 = {name:'Autre lieu',value:'autre',icon:'L_Autre-lieu'};

    $scope.incidentPlaces.push(zone);
    $scope.incidentPlaces.push(zone1);
    $scope.incidentPlaces.push(zone2);
    $scope.incidentPlaces.push(zone3);
    $scope.incidentPlaces.push(zone4);
    $scope.incidentPlaces.push(zone5);
    $scope.incidentPlaces.push(zone6);

    $scope.incidentFloors=[];
    for(var i=-2; i<=40; i++){
        var j = {};
        if (i < 0){
            j.value = '-0'+Math.abs(i);
        }else if (i == 0){
            j.value = 'Rdc';
        }else if (i == 1){
            j.value = 'ES';
        } else if (i<10){
            j.value = '0'+i-1;
        }else {
            j.value = i-1;
        }
       $scope.incidentFloors.push(j);
    }

   // $scope.incidentFloors.push(zone);

    // navigateTo is for navigate to other page 
    // by using targetPage to be the destination state. 
    // Parameter :  
    // stateNames = target state to go
    $scope.navigateTo = function (stateName) {
        console.log('navigate',stateName);
        $timeout(function () {
            $mdSidenav('left').close();
            if ($ionicHistory.currentStateName() != stateName) {
                $ionicHistory.nextViewOptions({
                    disableAnimate: true,
                    disableBack: true
                });
                $state.go(stateName);
            }
        }, ($scope.isAndroid == false ? 300 : 0));
    };// End navigateTo.

    //closeSideNav is for close side navigation
    //It will use with event on-swipe-left="closeSideNav()" on-drag-left="closeSideNav()"
    //When user swipe or drag md-sidenav to left side
    $scope.closeSideNav = function(){
        $mdSidenav('left').close();
    };
    //End closeSideNav

    //  $ionicPlatform.registerBackButtonAction(callback, priority, [actionId])
    //
    //     Register a hardware back button action. Only one action will execute
    //  when the back button is clicked, so this method decides which of
    //  the registered back button actions has the highest priority.
    //
    //     For example, if an actionsheet is showing, the back button should
    //  close the actionsheet, but it should not also go back a page view
    //  or close a modal which may be open.
    //
    //  The priorities for the existing back button hooks are as follows:
    //  Return to previous view = 100
    //  Close side menu         = 150
    //  Dismiss modal           = 200
    //  Close action sheet      = 300
    //  Dismiss popup           = 400
    //  Dismiss loading overlay = 500
    //
    //  Your back button action will override each of the above actions
    //  whose priority is less than the priority you provide. For example,
    //  an action assigned a priority of 101 will override the ‘return to
    //  previous view’ action, but not any of the other actions.
    //
    //  Learn more at : http://ionicframework.com/docs/api/service/$ionicPlatform/#registerBackButtonAction

    // For show show List Bottom Sheet.
    $scope.showListBottomSheet = function ($event) {
        $mdBottomSheet.show({
            templateUrl: 'ui-list-bottom-sheet-template',
            targetEvent: $event,
            scope: $scope.$new(false),
        });
    };// End of showListBottomSheet.

    // For show Grid Bottom Sheet.
    $scope.showGridBottomSheet = function ($event) {
        $mdBottomSheet.show({
            templateUrl: 'ui-grid-bottom-sheet-template',
            targetEvent: $event,
            scope: $scope.$new(false),
        });
    };// End of showGridBottomSheet.


    // For close list bottom sheet.
    $scope.closeListBottomSheet = function () {
        $mdBottomSheet.hide();
    } // End of closeListBottomSheet.

    $scope.addNewIncidentStepOne = function(){
        //  var stateParams = { typeIncident: params.value };
        //console.log(stateParams);
        $state.go('app.addIncident');
    }

    $scope.goToSyndic = function() {
        $state.go('app.syndic');
    }

    $scope.listIncidents = function(){
        //  var stateParams = { typeIncident: params.value };
        //console.log(stateParams);
        $state.go('app.listIncidents');
    }

    $scope.listAnnonces = function(){
        //  var stateParams = { typeIncident: params.value };
        //console.log(stateParams);
        $state.go('app.listAnnonces');
    }

    $scope.showCurrentUserProfile = function(){
        //  var stateParams = { typeIncident: params.value };
        //console.log(stateParams);
        $state.go('app.currentUserProfile');
    }

    $scope.showCurrentUserNetwork= function(){
        //  var stateParams = { typeIncident: params.value };
        //console.log(stateParams);
        $scope.closeListBottomSheet();
        //$state.go('app.network.invitations');
        $state.go('app.currentUserNetwork');


    }
    $ionicPlatform.registerBackButtonAction(function(){

        if($mdSidenav("left").isOpen()){
            //If side navigation is open it will close and then return
            $mdSidenav('left').close();
        }
        else if(jQuery('md-bottom-sheet').length > 0 ) {
            //If bottom sheet is open it will close and then return
            $mdBottomSheet.cancel();
        }
        else if(jQuery('[id^=dialog]').length > 0 ){
            //If popup dialog is open it will close and then return
            $mdDialog.cancel();
        }
        else if(jQuery('md-menu-content').length > 0 ){
            //If md-menu is open it will close and then return
            $mdMenu.hide();
        }
        else if(jQuery('md-select-menu').length > 0 ){
            //If md-select is open it will close and then return
            $mdSelect.hide();
        }

        else{

            // If control :
            // side navigation,
            // bottom sheet,
            // popup dialog,
            // md-menu,
            // md-select
            // is not opening, It will show $mdDialog to ask for
            // Confirmation to close the application or go to the view of lasted state.

            // Check for the current state that not have previous state.
            // It will show $mdDialog to ask for Confirmation to close the application.

            if($ionicHistory.backView() == null){

                //Check is popup dialog is not open.
                if(jQuery('[id^=dialog]').length == 0 ) {

                    // mdDialog for show $mdDialog to ask for
                    // Confirmation to close the application.

                    $mdDialog.show({
                        controller: 'DialogController',
                        templateUrl: 'confirm-dialog.html',
                        targetEvent: null,
                        locals: {
                            displayOption: {
                                title: "Confirmation",
                                content: "Do you want to close the application?",
                                ok: "Confirm",
                                cancel: "Cancel"
                            }
                        }
                    }).then(function () {
                        //If user tap Confirm at the popup dialog.
                        //Application will close.
                        ionic.Platform.exitApp();
                    }, function () {
                        // For cancel button actions.
                    }); //End mdDialog
                }
            }
            else{
                //Go to the view of lasted state.
                $ionicHistory.goBack();
            }
        }

    },100);
    //End of $ionicPlatform.registerBackButtonAction

}); // End of menu toggle controller.