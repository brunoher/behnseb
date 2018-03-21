appControllers.directive('fileInput', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attributes) {
            element.bind('change', function () {
                $parse(attributes.fileInput)
                    .assign(scope,element[0].files)
                scope.$apply()
            });
        }
    };
}]);

appControllers.directive("showPassword", function() { 
    return function linkFn(scope, elem, attrs) {
        scope.$watch(attrs.showPassword, function(newValue) {
            if (newValue) {
                elem.attr("type", "text");
            } else {
                elem.attr("type", "password");
            };
        });
    };
});

//This is Controller for Dialog box.
appControllers.controller('DialogController', function ($scope, $mdDialog, displayOption) {

    //This variable for display wording of dialog.
    //object schema:
    //displayOption: {
    //        title: "Confirm to remove all data?",
    //        content: "All data will remove from local storage.",
    //        ok: "Confirm",
    //        cancel: "Close"
    //}
    $scope.displayOption = displayOption;

    $scope.cancel = function () {
        $mdDialog.cancel(); //close dialog.
    };

    $scope.ok = function () {
        $mdDialog.hide();//hide dialog.
    };
});// End Controller for Dialog box.

//Controller for Toast.
appControllers.controller('toastController', function ($scope, displayOption) {

    //this variable for display wording of toast.
    //object schema:
    // displayOption: {
    //    title: "Data Saved !"
    //}

    $scope.displayOption = displayOption;
});// End Controller for Toast.

//Controller for Toast.
function LoginCtrl(Auth, $state) {
    this.loginWithGoogle = function loginWithGoogle() {
        Auth.$authWithOAuthPopup('google')
            .then(function(authData) {
            $state.go('tab.dash');
        });
    };
}
LoginCtrl.$inject = ['Auth', '$state'];

appControllers.controller('LoginCtrl', LoginCtrl);

appControllers.controller('WelcomeCtrl', function($scope, $state, $q, UserService, $ionicLoading) {


});

appControllers.controller('authController', function ($q, $state, $ionicActionSheet, $ionicLoading, $rootScope, $scope, $state, Auth, PopupService, Animate, Confirm, Utilities, $localStorage, DataService, LogInService,$timeout, UserService,$ionicHistory,$firebaseAuth,Firebase, NotifService) {
    // CallBack en cas de succes de la méthode 'login' de facebookConnectPlugin
    $scope.imgSrc = "";
    var fbLoginSuccess = function(response) {
        //alert("1");
        if (!response.authResponse){
            fbLoginError("Cannot find the authResponse");
            //alert("2");
            return;
        }

        var authResponse = response.authResponse;
        var credential = firebase.auth.FacebookAuthProvider.credential(authResponse.accessToken);
        //alert("3 - " + JSON.stringify(authResponse));
        getFacebookProfileInfo(authResponse)
        .then(function(profileInfo) {
            //alert("3.5 profileInfo - " + JSON.stringify(profileInfo));
            $scope.imgSrc = "http://graph.facebook.com/" + authResponse.userID + "/picture?type=large"
            UserService.setUser({
                authResponse : authResponse,
                userID : profileInfo.id,
                name : profileInfo.name,
                email : profileInfo.email,
                picture : $scope.imgSrc,
                provider : "facebook"
            });
            firebase.auth().signInWithCredential(credential).catch(function(error) {
                var errorCode = error.code;
                var errorMessage = error.message;
                // The email of the user's account used.
                var email = error.email;
                // The firebase.auth.AuthCredential type that was used.
                var credential = error.credential;
                //alert("3.6 fbErrorCredentials - " + JSON.stringify(errorMessage) + "emailError : " + JSON.stringify(email));
            }).then(function(result) {
                //alert("3.75 - " + JSON.stringify(result));
                $ionicLoading.hide();
            });
            //alert("4 : " + authResponse.userID);
            $state.go('app.fakeLogin');

        }, function(fail){
            console.log('profile info fail', fail);
        });
    };


    // CallBack en cas d'erreur de la méthode 'login' de facebookConnectPlugin
    var fbLoginError = function(error){
        //alert("5 - " + error);
        //console.log('fbLoginError', error);
        $ionicLoading.hide();
    };

    //Cette méthode sert à récupérer les infos du profile de l'utilisateur via la facebook api
    var getFacebookProfileInfo = function (authResponse) {
        var info = $q.defer();

        facebookConnectPlugin.api('/me?fields=email,name&access_token=' + authResponse.accessToken, null,
            function (response) {
                console.log(response);
                info.resolve(response);
            },
            function (error) {
                console.log(error);
                info.reject(error);
            }
        );
        return info.promise;
    };

    $scope.facebookSignIn = function() {
        facebookConnectPlugin.getLoginStatus(function(success){
            if (success.status === 'connected') {
                //alert("6 : connected - " + JSON.stringify(success));
                // the user's ID, a valid access token, a signed request, and the time the access token
                // and signed request each expire
                //alert('getLoginStatus', success.status);
                fbLogout();

                //on vérifie si l'utilisateur est déjà stocké dans l'app
                var user = UserService.getUser();

                if (!user.userID) {
                    getFacebookProfileInfo(success.authResponse)
                    .then(function(profileInfo) {
                        //alert("7 : "+JSON.stringify(profileInfo));               
                        $scope.form.img
                        UserService.setUser({
                            authResponse: success.authResponse,
                            userID: profileInfo.id,
                            name: profileInfo.name,
                            email: profileInfo.email,
                            picture : "http://graph.facebook.com/" + success.authResponse.userID + "/picture?type=large"
                        });
                        
                        $state.go('app.fakeLogin');

                    }, function(fail){
                        console.log('profile info fail', fail);
                    });
                } else {
                    //alert("8 : "+user.userID);
                    $state.go('app.fakeLogin');
                }

            } else {
                //if (success.status === 'not_authorized') the user is logged in to Facebook, but has not authenticated your app
                //else The person is not logged into Facebook, so we're not sure if they are logged into this app or not.
                //console.log('getLoginStatus', success.status);
                //alert("9 'getLoginStatus' ; " + JSON.stringify(success));

                $ionicLoading.show({
                    template: 'Connexion...'
                });
                //alert("10");
                //ask the permissions you need. You can learn more about FB permissions here: https://developers.facebook.com/docs/facebook-login/permissions/v2.4
                facebookConnectPlugin.login(['email', 'public_profile'], fbLoginSuccess, fbLoginError);
            }
        }).catch(function(error) {
           // alert("11 : error - "+error);
        });
    };
    var fbLogout = function() {
        //alert("fbLogout");
        facebookConnectPlugin.logout(function(){
            Auth.$signOut();
            $ionicLoading.hide();
            $state.go('public.tryApp');
        }, function(fail){
            $ionicLoading.hide();
        });     
    }

    var googleLogout = function() {   
        window.plugins.googleplus.logout(
            function (msg) {
                console.log(msg);
                $ionicLoading.hide();
                $state.go('welcome');
            },
            function(fail){
                console.log(fail);
            }
        );    
    }
    $scope.googleSignIn = function() {
        $ionicLoading.show({
            template: 'Logging in...'
        });

        window.plugins.googleplus.login(
            {},
            function (user_data) {
                var credential = firebase.auth.GoogleAuthProvider.credential(user_data.idToken);
                UserService.setUser({
                    userID: user_data.userId,
                    name: user_data.displayName,
                    email: user_data.email,
                    picture: user_data.imageUrl,
                    accessToken: user_data.accessToken,
                    idToken: user_data.idToken,
                    provider: "google+"
                });
                //alert("user_data : " + JSON.stringify(user_data));
                
                firebase.auth().signInWithCredential(credential).catch(function(error) {
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    
                    var email = error.email;
                  
                    var credential = error.credential;
                    //alert("Error signing in with credential : " + JSON.stringify(errorMessage) + "emailError : " + JSON.stringify(email));
                    googleLogout();
                }).then(function(result) {
                    //alert("3.75 - " + JSON.stringify(result));
                    $ionicLoading.hide();
                    $state.go('app.fakeLogin');
                });
            },function (msg) {
                //alert("msg : " + JSON.stringify(msg));
                $ionicLoading.hide();
            }
        );
    };

    //$scope.isIos = ionic.Platform.isIOS();
    //$scope.isAndroid = ionic.Platform.isAndroid();
    var isIpad = ionic.Platform.isIPad();
    $scope.screenHeight = String(window.screen.height) + "px";
    $scope.showPwd_width = isIpad ? "3" : "5";

/*
    var signUp_Height;
    var title_Height;
    var login_Height;
    var btn_width;
    var emailBtn_marginTop;

    if($scope.isIos && $scope.isIpad) {
        $scope.ipadShow = true;
        signUp_Height = "-520";
        title_Height = "450";
        login_Height = "-460";
        btn_width = 50;
        $scope.showPwd_width = "3";
    } else if ($scope.isAndroid){
        $scope.ipadShow = false;
        signUp_Height = "30";
        title_Height = "50";
        login_Height = "20";
        btn_width = 80;
        $scope.showPwd_width = "5";
        emailBtn_marginTop = -25;
    } else if ($scope.isIos) {
        $scope.ipadShow = false;
        signUp_Height = "-220";
        title_Height = "200";
        login_Height = "-180";
        btn_width = 80;
        $scope.showPwd_width = "5";
        emailBtn_marginTop = 0;
    }
    $scope.signUpBtnStyle = {"font-size":"120%","color": "rgb(3,169,244)","bottom": signUp_Height+"%","width": btn_width+"%", 'left': (100-btn_width)/2+"%"};
    //$scope.welcomeTitleStyle = {"top":title_Height+"%"};
    $scope.loginBtnStyle = {"bottom":login_Height+"%", "width": btn_width+"%", "left": (100-btn_width)/2+"%"};
    $scope.fbBtnStyle = {"width": btn_width+"%", "left":(100-btn_width)/2+"%", "margin-top": "20%"};
    $scope.googleBtnStyle = {"width": btn_width+"%", "left":(100-btn_width)/2+"%", "margin-top": "8%"};
    //$scope.emailBtnStyle = {"width": btn_width+"%", "left": (100-btn_width)/2+"%", "margin-top": emailBtn_marginTop+"%"};
*/

    function back () {
        $state.go('public.tryApp');
    }

    function userAuth () {
        return new Promise(function(resolve) {
            resolve(Auth.$waitForSignIn());
        }).catch(function(e) {
            console.log(e);
            PopupService.show('showError');
        }); 
    } 

    function userData (uAuth){
        return new Promise(function(resolve) {
            var uid = uAuth.uid;
            //console.log(UserService.getByKey(uid));
            resolve(UserService.getByKey(uid).$loaded());
        }).catch(function(e) {
            console.log(e);
            PopupService.show('showError');
        });
    }

    $scope.loadPage = function(){
        $timeout(function () {
            if ($scope.isAndroid) {
                //jQuery('#auth-loading-progress').show();
                Animate.loadStrt(5000);
            }
            else {
                //jQuery('#auth-loading-progress').fadeIn(700);
                Animate.loadStrt(7000);
            }
        }, 400);
        $timeout(function () {
            //jQuery('#auth-loading-progress').hide();
            Animate.loadEnd();
            jQuery('#social-login-form').fadeIn();
        }, 1000);// End loading progress. 
    }

    var login = function(form, socialProvider) {
        return new Promise(function(resolve) {
            var user_tag = {};
            if (Utilities.isIncorrectValue([form.mail, form.password]) && !socialProvider) {
                resolve(false);
            } else {
                //$scope.loadPage();
                Auth.$signInWithEmailAndPassword(form.mail, form.password).then(function(authData) {
                    userAuth().then(function(res) {
                        $scope.loggedInUser = res;
                        $rootScope.loggedInUser = $scope.loggedInUser;
                        userData($scope.loggedInUser).then(function(result) {
                            $scope.currentUser = result[$scope.loggedInUser.uid];
                            $rootScope.currentUser = $scope.currentUser;
                            user_tag.copro = $scope.currentUser.immeuble; 
                            user_tag.isSyndicMember = $scope.currentUser.isSyndicMember;
                            if ($scope.currentUser.batName) {
                                user_tag.batiment = $scope.currentUser.batName;
                            };
                            if (window.plugins) {
                                NotifService.sendTags(user_tag, $scope.currentUser.id).then(function(r) {
                                    window.plugins.OneSignal.getIds(function(ids) {
                                        oneSignal_userId = ids.userId;
                                        var userRef = "users/"+$scope.currentUser.id+"/oneSignalId";
                                        DataService.addCustom(userRef, oneSignal_userId);
                                        resolve(oneSignal_userId);
                                    });
                                }), function(error) {
                                    console.log(error);
                                };
                            }        
                        }), function(error) {
                            console.log(error);
                        };
                    }), function(error){
                        console.log(error);
                    };
                }).catch(function(error) {
                    //alert("1"+error.code);
                    if (error.code == "auth/user-not-found"){
                        PopupService.show('wrongMail');
                    }else if (error.code == "auth/invalid-email") {
                        PopupService.show('badlyFormatedEmail');
                    }else if (error.code == "auth/wrong-password"){
                        PopupService.show('wrongPassword');
                    }
                });
            }
        }).catch(function(e) {
            alert(e);
            PopupService.show('showError');
        });
    }
    
    $scope.loginUser = function(_form) {
        Animate.loadStrt(5000);
        login(_form).then(function(cur) {
            Animate.loadEnd();
            if (cur == false) {
                PopupService.show('alertIncomplete');
            } else {
                $state.go('app.homeDashboard');
            }
        });
    }

    $scope.logUser = function(_form) {
        $scope.loginUser(_form);
    }

    $scope.data = {
        showBtn: true,
        showPassword: false
    }  

    $scope.loadThisPage = function() {
        $scope.loadPage();
    }

    $scope.forgotPassword = function(){
        var template = '<input type="email" ng-model="form.mail">';
        var title = "Entrez votre adresse mail";
        var subtitle = "Il s'agit de l'adresse qui vous sert d'identifiant dans cette application";
        var btn_text = "<b>Envoyer</b>";
        Confirm.showConfirm($scope, template, title, subtitle, btn_text, true);
    }    

    $scope.showPW = function(caller) {
        console.log($scope.data.showBtn);
        LogInService.showBtn(caller, $scope.data);
    }
    $scope.$on( "$ionicView.enter", function( scopes, states ) {
        if( states.fromCache && states.stateName == "your view" ) {
            // do whatever
        }
        Auth.$onAuthStateChanged(function(currentSignIn) {
            if( currentSignIn) {
                // do whatever
                /**/            $state.go('app.homeDashboard');
            }else{

            }
        });
        $ionicHistory.clearCache();

        $scope.loadThisPage();
    });


    $scope.form = {
        mail: "",
        password: ""
    }

    $scope.slide = function(to) {
        $scope.current = to;
        Animate.slide().slide(to);
    }
    $scope.back = function(index){
        $scope.slide(index);
    }
});

appControllers.controller('wizzardSignUpController', function ($ionicModal, $scope, $state, Auth, Utilities, PopupService, SignInService, CreateUser, Animate, $timeout, LogInService, UserService, $cordovaDatePicker,$rootScope, Confirm, IgnApiService) {  
    var isAndroid = ionic.Platform.isAndroid();
    var pwd_eye, eye_marginTop;
    var goodPwdTop = "20em";
    var goodPwdTop2 = "24.8em";
    var goodPwdLeft = "100%";

    var screenHeight = window.screen.height;
    
    if(screenHeight > 1000){
       pwd_eye = "4%";
       eye_marginTop = "2%";
       goodPwdTop = "22.4em";
       goodPwdTop2 = "26.8em";
       goodPwdLeft = "96%";
    }
    
    var miss_input = {"background-color":"red", "opacity":"0.5", "margin-left":"-5%", "color":"#ffffff"};
    var miss_select = {"color":"red"};
    $scope.pwdEye = {"width": pwd_eye, "margin-top": eye_marginTop};
    $scope.goodPwdStyle = {"top":goodPwdTop, "left": goodPwdLeft};
    $scope.goodPwdStyle2 = {"top": goodPwdTop2, "left": goodPwdLeft};

    $scope.closeModal = function() {
        $scope.modal.hide();
    }

    $scope.showModal = function(){
        $ionicModal.fromTemplateUrl('templates/authentication/html/cgu-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
        })
    } 

    $scope.b_Day = {};
    $scope.goBackSlide = function() {
        var index = Animate.slide().currentIndex();
        console.log(index);
        if (index>0) {
            Animate.slide().slide(index-1);
        } else {
            //Animate.slide().slide(2);
            $state.go('public.tryApp');
        }
    }
    $scope.yearOfToday = new Date().getFullYear();
    
    $scope.getB_dayYearPlus18 = function (bDayYear) {
        $scope.b_dayYearPlus18 = parseInt(bDayYear) + 18;
    }

    $scope.showCGU = function() {
        $scope.showModal();
    }

    /*$scope.getAge = function () {
        var options = {
            date: new Date(),
            mode: 'date', // ou 'time' pour une heure
            allowOldDates: true,
            allowFutureDates: false,
            doneButtonLabel: 'DONE',
            doneButtonColor: '#F2F3F4',
            cancelButtonLabel: 'CANCEL',
            cancelButtonColor: '#000000'
        };
        $cordovaDatePicker.show(options).then(function(date){
            var a  = new String(date);
            var from = a.split(" ");
            var day = $scope.date.day[from[0].toLowerCase()];
            var month = $scope.date.month[from[1].toLowerCase()];
            var date = from[2];
            var year = from[3];

            $scope.b_Day[0] = year; 
            $scope.b_Day[1] = String(month[0]); 
            $scope.b_Day[2] = date;
            $scope.form.user.birthday = day[1] +" "+date+" "+month[1]+" "+year;
            $scope.display = true;
        }).catch(function(e) {
            console.log(e);
        });
    }*/

    /*$scope.majority = function(bday){ 
        if(bday && !isNaN(parseInt(bday.year)+parseInt(bday.month)+parseInt(bday.day))){ 
            var f = new Date(parseInt(bday.year), parseInt(bday.month)-1, parseInt(bday.day)); 
            $scope.form.user.birthday = f.getTime(); 
            console.log(f);
            $scope.isEighteen = Utilities.isEighteen(f); 
            return $scope.isEighteen; 
        }else { 
            return 'invalid_date'; 
        } 

    }*/

    $scope.date = {
        day: {
            sun: [0, 'dimanche'], mon: [1, 'lundi'], tue: [2, 'mardi'],
            wed: [3, 'mercredi'], thu: [4, 'jeudi'], fri: [5, 'vendredi'], 
            sat: [6, 'samedi']
        },
        month: {
            jan: [0, 'janvier'], feb: [1, 'févirer'], mar: [2, 'mars'], 
            apr: [3, 'avril'], may: [4, 'mai'], jun: [5, 'juin'], 
            jul: [6, 'jullet'], aug: [7, 'aout'], sep: [8, 'septembre'], 
            oct: [9, 'octobre'], nov: [10, 'novembre'], dec: [11, 'décembre']
        }   
    };

    //$scope.isEighteen = false;
    //$scope.confirmEighteen;
    $scope.display = false;

    $scope.data = {
        showBtn: true,
        showPassword: false
    };  

    $scope.showPW = function(caller) {
        LogInService.showBtn(caller, $scope.data);
    }

    var user = UserService.getUser();
    $scope.img = {src: 'css/img/icon-camera.png'};

    /*$scope.refresh = function() {
    $timeout(function() {
      window.location.reload(true);
    });
  }*/
    $scope.takePicture = function(index, img) {    
        $scope.showActionSheet = false;
        Utilities.takePicture(index, img, false, true).then(function(result){
            $scope.img.src = result;
            $timeout(function() {
                Utilities.readURL(result, '#img');
            }, 1000);
        }), function(error){
            console.log(error);
        }; 
    };
    
    $scope.displayActionSheet = function() {
        $scope.showActionSheet = true;
    };
    
    $scope.hideActionSheet = function() {
        $scope.showActionSheet = false;
    };
   
    $scope.readURL = function(scopeImage, str) {
        Utilities.readURL(scopeImage, str);
        $scope.form.user.image = scopeImage; 
    }        

    $scope.$on( "$ionicView.beforeLeave", function(scopes, states) { 
        $scope.showCodeSyndic = false;
    });

    $scope.data = SignInService.initSelects();

    $scope.showCodeSyndic = false;

    $scope.form = {
        majorityChecked: false,
        syndicNumber: "",
        hasRead: false,
        user: {
            isSyndicMember: false,
            yearOfBirth: false,
            acceptAdd: false
        }
    };
    if(window.plugins) {
         window.plugins.OneSignal.getIds(function(ids) {
            $scope.form.user.oneSignalId = ids.userId;

        });     
    }
   
      /**/
    // $scope.form.user.isSyndicMember = false;
    //   console.log($scope.form,$rootScope.loggedInUser);
    $scope.o = {};
    $scope.tmpUser = false;
    Auth.$waitForSignIn().then(function(loggedInUserAuth) {  
        console.log('function change',loggedInUserAuth); 
        if(loggedInUserAuth === null){
            // $state.go('public.tryApp');
        }else{
            //      initAuth();
            $rootScope.loggedInUser = loggedInUserAuth;
            $scope.tmpUser = {uid:loggedInUserAuth.uid,mail:loggedInUserAuth.email,displayName:loggedInUserAuth.displayName,photoURL:loggedInUserAuth.photoURL};
            $scope.form.user = angular.extend({}, $scope.form.user,$scope.tmpUser);
            $scope.form.user.pw='xxxxxx';
            $scope.form.user.pw_2='xxxxxx';
            var str = $scope.tmpUser.displayName;
            var names = ['',''];
            if(str){
                names = str.split(" ");
            }

            if(names){
                $scope.form.user.firstName = names[0];
                $scope.form.user.name = names[1];
            }
            console.log('scope.form.user'+JSON.stringify($scope.form.user));//,$rootScope.loggedInUser);


        }
    });

    $scope.passValide = false;

    $scope.lockSlide = function () {
        Animate.slide().enableSlide( false );
    }

    $scope.showCodeSyndicFunc = function(){
        $scope.showCodeSyndic = !$scope.showCodeSyndic;
    } 

    $scope.implement_1 = function(o, bday) {
        if (window.plugins) {
            window.plugins.OneSignal.getIds(function(ids) {
                $scope.form.user.oneSignalId = ids.userId;
            });
        }
        /*
        if(window.cordova) {
            $cordovaKeyboard.hideAccessoryBar(false);
        }
        */
        if(Utilities.isIncorrectValue([o.mail, o.pw, o.firstName, o.name, o.gender])) {
            PopupService.show('alertIncomplete');
            (!o.mail) ? $scope.miss_mail = miss_input : $scope.miss_mail = "";
            (!o.firstName) ? $scope.miss_firstName = miss_input : $scope.miss_firstName = "";
            (!o.name) ? $scope.miss_name = miss_input : $scope.miss_name = "";
            (!o.gender) ? $scope.miss_gender = miss_select : $scope.miss_gender = "";
        } else if (/*o.mail !== o.email_2 || */o.pw !== o.pw_2) {
            PopupService.show('mismatch');
        } else if (!SignInService.phoneIsCorrect(o.phone)) {
            PopupService.show('alertPhoneProblem');
        } else if(!SignInService.passwordLength(o.pw)) {
            PopupService.show('pwIsTooShort');
        } else if (/*bday.day > 31 || bday.month > 12 || */!$scope.b_Day.year || isNaN(parseInt($scope.b_Day.year)) || $scope.b_Day.year < 1900) {
            PopupService.show('dateIncorrect');
        } else if (Utilities.isEighteen($scope.b_Day.year) == false) { 
                PopupService.show('underAge'); 
        } else if (Utilities.isEighteen($scope.b_Day.year) == "askForMajority" && !$scope.form.majorityChecked) {
                PopupService.show('mustCkeckMajority');
        } else {
            $scope.form.user.yearOfBirth = $scope.b_Day.year; 
            Animate.slide().slide(1);
            $scope.miss_mail = ""; $scope.miss_firstName = "";
            $scope.miss_name = ""; $scope.miss_gender = "";

        }
    } 

    var user_tag = {};
    $scope.implement_2 = function (user) {
        /*
        if(window.cordova) {
            $cordovaKeyboard.hideAccessoryBar(true);
        }
        */
        if (Utilities.isIncorrectValue([$scope.form.user.status, $scope.form.user.floor])){
            PopupService.show('alertIncomplete');
            (!$scope.form.user.status) ? $scope.miss_status = miss_select : $scope.miss_status = "";
            (!$scope.form.user.floor) ? $scope.miss_floor = miss_select : $scope.miss_floor = "";
        }else if($scope.form.hasRead !== true) {
            PopupService.show('mustAcceptCGU');
        }else {
            ($scope.form.user.acceptAdd !== true) ? $scope.form.user.acceptAdd = false : $scope.form.user.acceptAdd = true;
            Animate.slide().slide(2);
            user_tag['copro'] = $scope.o.cadastralParcel;
            user_tag['isSyndicMember'] = user.isSyndicMember;
            if($scope.o.batName) {
                user_tag['batiment'] = $scope.o.batName;
            }
            $scope.miss_status = "";
            $scope.miss_floor = "";
        }
    }  
    $scope.suggestions = [{fullText:""}];
    $scope.suggest = function (form, data) {
        if(form.typed && form.typed.length > 3) {
            SignInService.getSuggestions(form, data).then(function(obj) {
                $scope.o = null;
                $scope.displayResult = obj.displayResult;
                $scope.showButton = obj.showButton;
                if(obj.suggestions && obj.suggestions.length > 0){
                    $scope.suggestions = obj.suggestions;
                }  
            });
        }
    }

    $scope.addStreetNumber = function() {
        var nmbr = $scope.data.streetNumber; 
        if(!isNaN(parseInt(nmbr))) {
            $scope.data.selectedSuggestion.fullText = nmbr + " " + $scope.data.selectedSuggestion.fullText;
            IgnApiService.formatString($scope.data.selectedSuggestion.fullText);   
            IgnApiService.setUserFullAdress($scope.data, $scope.form).then(function(obj) {
                $scope.o = obj;
                //$scope.o.addressSelected = $scope.data.selectedSuggestion.fullText;
                $scope.displayResult = obj.displayResult;
                $scope.showButton = obj.showButton;
                //$scope.o.streetNumber = obj.streetNumber;
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
                var title = "Numéro de rue manquant : souhaitez vous compléter un numéro de rue à l'adresse :<br>'"+ $scope.data.selectedSuggestion.fullText+"' ?";
                Confirm.addStreetNumber($scope, template, title);
                /*PopupService.show("invalidStreetNumber");
                delete $scope.o;*/
            } else {
                Animate.loadEnd();
                $scope.displayResult = obj.displayResult;
                $scope.showButton = obj.showButton;
            }
        }), function (e){
            //console.log(e);
        }
    }

    $scope.saveCompleteProfile = function (){
        //Animate.loadStrt();
        $scope.form.user.links = {};
        var uid = $scope.loggedInUser.uid;
        var userCopro = $scope.o;
        var user = $scope.form.user;
        var profile = UserService.save(uid,user);

        profile.then(function(dataRes){
            console.log(profile,dataRes);
            CreateUser.stepsDuringUserCreation('', user, uid, userCopro).then(function(res){
                //Animate.loadEnd();
                console.log('done',res);
                $state.go('app.homeDashboard');
            }), function (e) {
                //console.log(e);
            }   
            $state.go('app.homeDashboard');

        })
        return ;


    }  

    $scope.finishUser = function (user, image, o){
        console.log(user, image, o);
        Animate.loadStrt(8000);//createUserInFirebase
        var tempUser = UserService.getUser();
        user.provider = tempUser.provider;
        CreateUser.firebaseFinishUser(user, image, o).then(function(res){
            Animate.loadEnd();
            $state.go("app.homeDashboard");
            $scope.loginUser(user);
        }), function (e) {
            //console.log(e);
        }   
    }  

    $scope.createUser = function (user, image, o){
        Animate.loadStrt(8000);
        CreateUser.createUserInFirebase(user, image, o, user_tag).then(function(res){
            Animate.loadEnd();
            var form = {};
            form.mail = user.mail;
            form.password = user.pw;
            $scope.loginUser(form);

            // $state.go('app.homeDashboard');
        }), function (e) {
            //console.log(e);
        }   
    }  
});

appControllers.controller('userProfileCtrl', function ($scope, $localStorage, Auth, $state, $mdBottomSheet, $mdDialog, UserService) {
    $scope.userInfo = $localStorage.LoggedInUser;//localStorage.get("LoggedInUser");
    $scope.form = {};

    $scope.toSignUp = function() {
        $state.go('public.fakeWizardSignUp'); 
    }
    $scope.editProfile = function() {
        $state.go('app.editUserProfile');
    };  
    //console.log($scope.currentUser,$scope.userInfo, Auth.$getAuth());
    if($scope.currentUser!==undefined){
        $scope.form.uid = $scope.currentUser.id;
        $scope.form.mail = $scope.currentUser.mail;
        $scope.form.formatedName = $scope.currentUser.formatedName;
        $scope.form.batiment=$scope.currentUser.batiment;
        $scope.form.immeuble=$scope.currentUser.immeuble;     
    }


    $scope.showEditProfileBottomSheet = function ($event, contractForm) {
        // $scope.disableSaveBtn = $scope.validateRequiredField(contractForm);
        $mdBottomSheet.show({
            templateUrl: 'incident-actions-template.html',
            targetEvent: $event,
            scope: $scope.$new(false),
        });
    };// End showing the bottom sheet.

    $scope.saveProfile = function (form, $event) {
        $mdBottomSheet.hide();

        $mdDialog.show({
            controller: 'DialogController',
            templateUrl: 'confirm-dialog.html',
            targetEvent: $event,
            locals: {
                displayOption: {
                    title: "Confirm to save incident?",
                    content: "Data will save to Fb.",
                    ok: "Confirmer",
                    cancel: "Fermer"
                }
            }
        }).then(function () {
            //$scope.form.user = $scope.loggedInUser.uid;
            $scope.form.links = {};
            //UserService.add($scope.form);
            UserService.save($scope.userInfo.uid,$scope.form);
            // IncidentService.add($scope.form);
            return ;
        });
    };
});

appControllers.controller('syndicCtrl', function ($ionicPopup, $scope, SyndicService, $cordovaEmailComposer) {
    $scope.syndicSelected = true;
    $scope.conseilSelected = false;
    $scope.corpSelected = false;
    var screenWidth = window.screen.width;
    var screenHeight = window.screen.height;
    var marginTop_btn;
    if (screenHeight > 700 && screenHeight < 950) {
        marginTop_btn = 8;
    } else if(screenHeight > 950 && screenHeight < 1250) {
        marginTop_btn = 12;
    } else if (screenHeight > 1250) {
        marginTop_btn = 16;
    }
    $scope.fontSizeName = {'font-size':screenWidth/30+'px'};
    $scope.fontSizeTitle = {'font-size':screenWidth/20+'px'};
    $scope.btn_size = {'width': screenWidth/7+'px', 'height': screenHeight/20+'px'};
    $scope.btn_size_conseil = {'width': screenWidth/7+'px', 'height': screenHeight/20+'px', 'margin-top':marginTop_btn+'%' };
    $scope.conseilCard = {'margin-top':'3%', 'height':screenHeight-250+'px'};

    $scope.showContactDetailsModal = function (member) {
        var confirmPopup = $ionicPopup.confirm({
            title: member.formatedName,
            template: '<span style="position:absolute; top:40%; left:30%; z-index:-1;">Chargement image...</span><img ng-src="'+member.imageUrl+'">',
            buttons: [
                { text: 'Fermer' }
            ]
        });
    }
    
    $scope.max = 2; // index maximum
    $scope.selectedIndex = 0;

    $scope.nextTab = function() {
        var index = ($scope.selectedIndex == $scope.max) ? 0 : $scope.selectedIndex + 1;
        $scope.selectedIndex = index;

    };


    SyndicService.getConseil($scope.currentUser.immeuble).then(function(conseil) {
        $scope.conseil = conseil;
    }, function(error) {
        console.log(error);
    });

    SyndicService.get($scope.currentUser.immeuble, 'syndic', 'syndics', true).then(function(syndic) {
        $scope.syndic = syndic;
        if (syndic) {
            $scope.members = [{
                name: syndic.nomComptable,
                function: 'Comptable',
                mail: syndic.mailComptable,
                phone: syndic.telComptable
            }];
        } 
    }, function(error) {
        console.log(error);
    });

    SyndicService.get($scope.currentUser.immeuble, 'gestionnaire', 'users', false).then(function(gestionnaire) {
        $scope.gestionnaire = gestionnaire;
    }, function(error) {
        console.log(error);
    });

    $scope.sendMail = function(mailAddress) {
        $cordovaEmailComposer.isAvailable(mailAddress).then(function() {
            var email = {
                to: mailAddress,
                cc: '',
                bcc: [],
                attachments: [],
                subject: '',
                body: '',
                isHtml: true
            };
            $cordovaEmailComposer.open(email).then(function () {});
        }, function () {
            // not available
        });
    }  
});

/*appControllers.controller('areacodeCtrlXX', function($scope, $ionicModal, Areacode){
    $scope.areacodes = Areacode;
    $ionicModal.fromTemplateUrl('templates/sign/areacode.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.areaCode = modal;
    });
    $scope.closeareaCode = function() {
        $scope.areaCode.hide();
    };
    $scope.showareaCode = function() {
        $scope.areaCode.show();
    };
    $scope.choseAreaCode = function(name,areacode){
        $scope.choseArea.name = name;
        $scope.choseArea.areacode = areacode;
        $scope.closeareaCode();
    };
})*/


    



