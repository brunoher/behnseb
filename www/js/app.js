//
//Welcome to app.js
//This is main application config of project. You can change a setting of :
//  - Global Variable
//  - Theme setting
//  - Icon setting
//  - Register View
//  - Spinner setting
//  - Custom style
//
//Global variable use for setting color, start page, message, oAuth key.
var db = null; //Use for SQLite database.
window.globalVariable = {
    //custom color style variable
    color: {
        appPrimaryColor: "",
        dropboxColor: "#017EE6",
        facebookColor: "#3C5C99",
        foursquareColor: "#F94777",
        googlePlusColor: "#D73D32",
        instagramColor: "#517FA4",
        wordpressColor: "#0087BE"
    },// End custom color style variable
    startPage2: {
        url: "/app/home/dashboard",//Url of start page.
        state: "app.homeDashboard"//State name of start page.
    },
    startPage: {
        url: "/public/tryApp",//Url of start page.
        state: "public.tryApp"//State name of start page.
    },
    message: {
        errorMessage: "Technical error please try again later." //Default error message.
    },
    oAuth: {
        dropbox: "your_api_key",//Use for Dropbox API clientID.
        facebook: "your_api_key",//Use for Facebook API appID.
        foursquare: "your_api_key", //Use for Foursquare API clientID.
        instagram: "your_api_key",//Use for Instagram API clientID.
        googlePlus: "373460998251-28uoi9jp6mg2f1s7ijumkjr36ija1hs5.apps.googleusercontent.com"//Use for Google API clientID.
    },
    adMob: "your_api_key" //Use for AdMob API clientID.
};// End Global variable

//######################Version prod###############################
var config = {
    apiKey: "AIzaSyCPfLymyg5Ekf8RhxKxZ74LNv2LpQ6RxMo",
    authDomain: "msh2-d4cb7.firebaseapp.com",
    databaseURL: "https://msh2-d4cb7.firebaseio.com",
    projectId: "msh2-d4cb7",
    storageBucket: "msh2-d4cb7.appspot.com",
    messagingSenderId: "373460998251"
}

//######################Version dev############################### 
/*var config = { 
    apiKey: "AIzaSyCWrnqD7ycey6HYw6ADxWUlftAsLminDaM", 
    authDomain: "myspotihome-prod.firebaseapp.com", 
    databaseURL: "https://myspotihome-prod.firebaseio.com", 
    projectId: "myspotihome-prod", 
    storageBucket: "myspotihome-prod.appspot.com", 
    messagingSenderId: "459587234881" 
};*/

firebase.initializeApp(config);
var storageRef = firebase.storage().ref();
var rootRef = firebase.database().ref();
var oneSignal_id = "29d9ec7c-51e1-49e8-a18e-58f72cb91e63";
var oneSignal_userId = "";
var hostApi = "http://92.222.93.121";
var portNumber = "8080";
var OWN_API_KEY = "ZnJvbXRoZWFwcA==";

angular.module('starter', ['ionic', 'ionic.cloud', 'ngIOS9UIWebViewPatch', 'ngMaterial', 'ngCordova', 'firebase', 'tabSlideBox', 'ngImgCrop', 'ionic.contrib.ui.cards','ionic.closePopup','ngStorage', 'pascalprecht.translate', 'angular.filter', 'starter.controllers', 'starter.services'])
    .run(function ($ionicPlatform, $cordovaSQLite, $rootScope, $ionicHistory, $state, $mdDialog, $mdBottomSheet, Auth, $localStorage, DataService, $ionicLoading, $ionicPopup, $cordovaKeyboard) {
    //console.log(firebase.initializeApp());
    //Create database table of contracts by using sqlite database.
    //Table schema :
    //Column       Type      Primary key
    //  id          Integer     Yes
    //  firstName   Text        No
    //  lastName    Text        No
    //  telephone   Text        No
    //  email       Text        No
    //  note        Text        No
    //  createDate  DateTime    No
    //  age         Integer     No
    //  isEnable    Boolean     No
   
    function onLoad() {
        console.log('RR2contactsUpdate');
        document.addEventListener("deviceready", onDeviceReady, false);
    }

    // device APIs are available
    //
    function onDeviceReady() {
        console.log('RR2contactsUpdateonDeviceReady');
    }


    function initialSQLite() {
        db = window.cordova ? $cordovaSQLite.openDB("contract.db") : window.openDatabase("contract.db", "1.0", "IonicMaterialDesignDB", -1);
        $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS contracts " +
                               "( id           integer primary key   , "   +
                               "  firstName    text                  , "   +
                               "  lastName     text                  , "   +
                               "  telephone    text                  , "   +
                               "  email        text                  , "   +
                               "  note         text                  , "   +
                               "  createDate   dateTime              , "   +
                               "  age          integer               , "   +
                               "  isEnable     Boolean)                ");
    }
    // End creating SQLite database table.

    // Create custom defaultStyle.
    function getDefaultStyle() {
        return "" +
            ".material-background-nav-bar { " +
            "   background-color        : " + appPrimaryColor + " !important; " +
            "   border-style            : none;" +
            "}" +
            ".md-primary-color {" +
            "   color                     : " + appPrimaryColor + " !important;" +
            "}";
    }// End create custom defaultStyle

    // Create custom style for product view.
    function getProductStyle() {
        return "" +
            ".material-background-nav-bar { " +
            "   background-color        : " + appPrimaryColor + " !important;" +
            "   border-style            : none;" +
            "   background-image        : url('img/background_cover_pixels.png') !important;" +
            "   background-size         : initial !important;" +
            "}" +
            ".md-primary-color {" +
            "   color                     : " + appPrimaryColor + " !important;" +
            "}";
    }// End create custom style for product view.

    // Create custom style for contract us view.
    function getContractUsStyle() {
        return "" +
            ".material-background-nav-bar { " +
            "background-color        : transparent !important;" +
            "border-style            : none;" +
            "background-image        : none !important;" +
            "background-position-y   : 4px !important;" +
            "background-size         : initial !important;" +
            "}" +
            ".md-primary-color {" +
            "   color                     : " + appPrimaryColor + " !important;" + "}";
    } // End create custom style for contract us view.

    // Create custom style for Social Network view.
    function getSocialNetworkStyle(socialColor) {
        return "" +
            ".material-background-nav-bar {" +
            "background              : " + socialColor + "!important;" +
            "border-style            : none;" +
            "} " +
            "md-ink-bar {" +
            "color                   : " + socialColor + "!important;" +
            "background              : " + socialColor + "!important;" +
            "}" +
            "md-tab-item {" +
            "color                   : " + socialColor + " !important;" +
            "}" +
            " md-progress-circular.md-warn .md-inner .md-left .md-half-circle {" +
            "   border-left-color       : " + socialColor + " !important;" +
            "}" +
            " md-progress-circular.md-warn .md-inner .md-left .md-half-circle, md-progress-circular.md-warn .md-inner .md-right .md-half-circle {" +
            "    border-top-color       : " + socialColor + " !important;" +
            "}" +
            " md-progress-circular.md-warn .md-inner .md-gap {" +
            "   border-top-color        : " + socialColor + " !important;" +
            "   border-bottom-color     : " + socialColor + " !important;" +
            "}" +
            "md-progress-circular.md-warn .md-inner .md-right .md-half-circle {" +
            "  border-right-color       : " + socialColor + " !important;" +
            " }" +
            ".spinner-android {" +
            "   stroke                  : " + socialColor + " !important;" +
            "}" +
            ".md-primary-color {" +
            "   color                   : " + socialColor + " !important;" +
            "}" +
            "a.md-button.md-primary, .md-button.md-primary {" +
            "   color                   : " + socialColor + " !important;" +
            "}";
    }// End create custom style for Social Network view.

    function initialRootScope() {
        $rootScope.appPrimaryColor = appPrimaryColor;// Add value of appPrimaryColor to rootScope for use it to base color.
        $rootScope.isAndroid = ionic.Platform.isAndroid();// Check platform of running device is android or not.
        $rootScope.isIOS = ionic.Platform.isIOS();// Check platform of running device is ios or not.
    }

    function initAuth() {
        var register = false;
        var loggedInUser = false;
        loggedInUser = $localStorage.LoggedInUser;//(localStorage.get("LoggedInUser"));
        console.log(loggedInUser);
        // loggedInUser = (localStorage.get("LoggedInUser"));
        if(!loggedInUser){
            // $state.go('app.fakeLogin');
        }



        Auth.$onAuthStateChanged(function(loggedInUserAuth) {
            console.log('State change',loggedInUserAuth);
            return;
            if (loggedInUserAuth) {
                console.log('Logged',loggedInUserAuth);

                var a = DataService.getByProperty('users', 'id', loggedInUserAuth.uid);
                $rootScope.currentUser = a[loggedInUserAuth.uid];
                $rootScope.loggedInUser = loggedInUserAuth;
                // UserService.setCurrent($rootScope.currentUser);
                //UserService.setLogged($rootScope.loggedInUser);
                /* */

                 $state.go('app.homeDashboard');

                $localStorage.currentUser = a[loggedInUserAuth.uid];
                $localStorage.LoggedInUser = loggedInUserAuth;
            } else {
                console.log("Signed out");
                $localStorage.currentUser = null;
                $localStorage.LoggedInUser = null;

            }
            //$localStorage.LoggedInUser = loggedInUser;
            //localStorage.set("LoggedInUser", loggedInUser);
        });

    }

    function hideActionControl() {
        //For android if user tap hardware back button, Action and Dialog should be hide.
        $mdBottomSheet.cancel();
        $mdDialog.cancel();
    }
    $rootScope.goBack = function(){
        $ionicHistory.goBack();
    };

    $rootScope.showLoading = function(template) {
        $ionicLoading.show({
            template: template
        });
    };
    $rootScope.hideLoading = function(){
        $ionicLoading.hide();
    };
    $rootScope.openLink = function(link){
        var ref = cordova.InAppBrowser.open(link, '_blank', 'location=yes');
    };

    // createCustomStyle will change a style of view while view changing.
    // Parameter :
    // stateName = name of state that going to change for add style of that page.
    function createCustomStyle(stateName) {
        var customStyle =
            ".material-background {" +
            "   background-color          : " + appPrimaryColor + " !important;" +
            "   border-style              : none;" +
            "   color              : #FFF!important;" +
            "}" +
            ".spinner-android {" +
            "   stroke                    : " + appPrimaryColor + " !important;" +
            "}";

        switch (stateName) {
            case "app.productList" :
            case "app.productDetail":
            case "app.productCheckout":
            case "app.clothShop" :
            case "app.catalog" :
                customStyle += getProductStyle();
                break;
            case "app.dropboxLogin" :
            case "app.dropboxProfile":
            case "app.dropboxFeed" :
                customStyle += getSocialNetworkStyle(window.globalVariable.color.dropboxColor);
                break;
            case "app.facebookLogin" :
            case "app.facebookProfile":
            case "app.facebookFeed" :
            case "app.facebookFriendList":
                customStyle += getSocialNetworkStyle(window.globalVariable.color.facebookColor);
                break;
            case "app.foursquareLogin" :
            case "app.foursquareProfile":
            case "app.foursquareFeed" :
                customStyle += getSocialNetworkStyle(window.globalVariable.color.foursquareColor);
                break;
            case "app.googlePlusLogin" :
            case "app.googlePlusProfile":
            case "app.googlePlusFeed" :
                customStyle += getSocialNetworkStyle(window.globalVariable.color.googlePlusColor);
                break;
            case "app.instagramLogin" :
            case "app.instagramProfile":
            case "app.instagramFeed" :
                customStyle += getSocialNetworkStyle(window.globalVariable.color.instagramColor);
                break;
            case "app.wordpressLogin" :
            case "app.wordpressFeed":
            case "app.wordpressPost" :
                customStyle += getSocialNetworkStyle(window.globalVariable.color.wordpressColor);
                break;
            case "app.contractUs":
                customStyle += getContractUsStyle();
                break;
            default:
                customStyle += getDefaultStyle();
                break;
                         }
        return customStyle;
    }// End createCustomStyle

    // Add custom style while initial application.
    $rootScope.customStyle = createCustomStyle(window.globalVariable.startPage.state);
    //initAuth();
   // $rootScope.currentUser = $localStorage.currentUser;
   // $scope
    //$rootScope.currentUser = $localStorage.currentUser;
    $rootScope.loggedInUser =Auth.$getAuth();
    Auth.$waitForSignIn().then(function(loggedInUserAuth) {  
        if(loggedInUserAuth === null){
            $state.go('public.tryApp');
        }else{
                                initAuth();
     $rootScope.loggedInUser = loggedInUserAuth;



        }
    });
    /*
    $ionicPlatform.ready(function(){
        console.log('contactsUpdatePlatformReady22');
        //onDeviceReady();
    });
    */
    
    $ionicPlatform.ready(function () {
        ionic.Platform.isFullScreen = true;
        if (window.cordova) {
            if(ionic.Platform.isIOS){
                Keyboard.hideFormAccessoryBar(true);
            }
            //cordova.plugins.Keyboard.disableScroll(true);
            /*$cordovaKeyboard.hideAccessoryBar(true);
            $cordovaKeyboard.disableScroll(false);*/
            //$cordovaKeyboard.close()
            var notificationOpenedCallback = function(jsonData) {
                //alert('notifsCallBack', JSON.stringify(jsonData));
                //$state.go('app.chat.group');
            };
            window.plugins.OneSignal
                .startInit(oneSignal_id)
                .inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.None) 
                .endInit();
               
            function successCallback(result) {
                console.log(result);
            }

            function errorCallback(error) {
                console.log(error);
            } 
              // Call syncHashedEmail anywhere in your app if you have the user's email.
              // This improves the effectiveness of OneSignal's "best-time" notification scheduling feature.
              // window.plugins.OneSignal.syncHashedEmail(userEmail);
            if (ionic.Platform.isAndroid()) {
                window.plugins.sim.hasReadPermission(successCallback, errorCallback);
                window.plugins.sim.requestReadPermission(successCallback, errorCallback);

            } else {
                window.plugins.sim.getSimInfo(successCallback, errorCallback);
            }               
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }

         // Enable to debug issues.
        // window.plugins.OneSignal.setLogLevel({logLevel: 4, visualLevel: 4});
        //initialSQLite();
        initialRootScope();


        //Checking if view is changing it will go to this function.
        $rootScope.$on('$ionicView.beforeEnter', function () {
            //hide Action Control for android back button.
            hideActionControl();
            // Add custom style ti view.
            $rootScope.customStyle = createCustomStyle($ionicHistory.currentStateName());
        });
    });

})

    .config(function ($ionicConfigProvider, $stateProvider, $urlRouterProvider, $mdThemingProvider, $mdIconProvider, $mdColorPalette, $mdIconProvider, $mdGestureProvider, $ionicCloudProvider, $translateProvider) {

    $mdGestureProvider.skipClickHijack();
    // Use for change ionic spinner to android pattern.
    $ionicConfigProvider.spinner.icon("android");
    $ionicConfigProvider.views.swipeBackEnabled(false);
    $ionicConfigProvider.tabs.position('bottom');
    // $ionicConfigProvider.tabs.position('top');

    // mdIconProvider is function of Angular Material.
    // It use for reference .SVG file and improve performance loading.
    $mdIconProvider
        .icon('facebook', 'img/icons/facebook.svg')
        .icon('twitter', 'img/icons/twitter.svg')
        .icon('mail', 'img/icons/mail.svg')
        .icon('message', 'img/icons/message.svg')
        .icon('share-arrow', 'img/icons/share-arrow.svg')
        .icon('more', 'img/icons/more_vert.svg');

    //mdThemingProvider use for change theme color of Ionic Material Design Application.
    /* You can select color from Material Color List configuration :
         * red
         * pink
         * purple
         * purple
         * deep-purple
         * indigo
         * blue
         * light-blue
         * cyan
         * teal
         * green
         * light-green
         * lime
         * yellow
         * amber
         * orange
         * deep-orange
         * brown
         * grey
         * blue-grey
         */
    //Learn more about material color patten: https://www.materialpalette.com/
    //Learn more about material theme: https://material.angularjs.org/latest/#/Theming/01_introduction
    $mdThemingProvider
        .theme('default')
        .primaryPalette('light-blue')
        .accentPalette('blue-grey');

    appPrimaryColor = $mdColorPalette[$mdThemingProvider._THEMES.default.colors.primary.name]["500"]; //Use for get base color of theme.

    //$stateProvider is using for add or edit HTML view to navigation bar.
    //
    //Schema :
    //state_name(String)      : Name of state to use in application.
    //page_name(String)       : Name of page to present at localhost url.
    //cache(Bool)             : Cache of view and controller default is true. Change to false if you want page reload when application navigate back to this view.
    //html_file_path(String)  : Path of html file.
    //controller_name(String) : Name of Controller.
    //
    //Learn more about ionNavView at http://ionicframework.com/docs/api/directive/ionNavView/
    //Learn more about  AngularUI Router's at https://github.com/angular-ui/ui-router/wiki
    $stateProvider
        .state('app', {
        url: "/app",
        abstract: true,
        templateUrl: "templates/menu/html/menu.html",
        resolve: {
            userAuth: function($stateParams, Auth) {
                return Auth.$waitForSignIn();
            }, 
            userData : function(UserService,userAuth){
                var uid = userAuth.uid;
                //console.log(UserService.getByKey(uid));
                return UserService.getByKey(uid).$loaded();
            },
            tasks: function(DataService, userAuth) {
                return DataService.initData(); //true;//
            }
            /*
            tasks: function(DataService, user) {
                return user.canHaveTasks() ?
                    TaskService.find(user.id) : [];
            },
            */
        },
        controller: 'menuCtrl'
    })



        .state('app.chat', {
        cache: false,
        url: '/chat',
        abstract: true,
        views: {
            'tab-messages': {
                templateUrl: 'templates/chat/tabs.html',
                controller: 'tabCtrl'
            },
        }
    })
        .state('walkthrough', {
        url: '/walkthrough',
        templateUrl: 'templates/chat/sign/walkthrough.html',
    })

        .state('register', {
        url: '/register',
        templateUrl: 'templates/chat/sign/register.html',
        controller: 'signCtrl'
    })

        .state('login', {
        url: '/login',
        templateUrl: 'templates/chat/sign/login.html',
        controller: 'signCtrl'
    })

        .state('app.contacts', {
        cache: false,
        url: '/contacts',
        views: {
            'tab-contacts': {
                templateUrl: 'templates/chat/contacts/index.html',
                controller: 'contactsCtrl'
            }
        }
    })

        .state('app.contactsList', {
        cache: false,
        url: '/list-contacts',
        views: {
            'tab-contacts': {
                templateUrl: 'templates/chat/contacts/list.html',
                controller: 'contactsCtrl'
            }
        }
    })

        .state('app.messages', {
        cache: false,
        url: '/messages',
        views: {
            'tab-messages': {
                templateUrl: 'templates/chat/messages/index.html',
                controller: 'messagesCtrl'
            }
        }
    })

        .state('app.chat.group', {
        //cache: false,
        url: '/group',

        views: {
            'tab-group': {
                templateUrl: 'templates/chat/group/index.html',
                controller: 'groupCtrl'
            }
        }
    })
        .state('viewGroup', {
        cache: false,
        url: '/view/:id',
 

                templateUrl: 'templates/chat/group/view.html',
                controller: 'groupView'
            
        
    })
        .state('addGroup', {
        url: '/add/:id',
 
                templateUrl: 'templates/chat/group/add.html',
                controller: 'groupAdd'
  
    })
        .state('groupDetail', {
        cache: false,
        url: '/group/detail/:id',
        templateUrl: 'templates/chat/group/detail.html',
        controller: 'groupDetail'
    })
    /*
        .state('app.groupDetail', {
        cache: false,
        url: '/group/detail/:id',
        views: {
            'menuContent': {
                templateUrl: 'templates/chat/group/detail.html',
                controller: 'groupDetail'   
            }
        }
    })
*/
        .state('editInfomation', {
        url: '/editInfomation',
        templateUrl: 'templates/chat/sign/edit-infomation.html',
        controller: 'signCtrl'
    })

        .state('app.chat.settings', {
        cache: false,
        url: '/settings',
        views: {
            'tab-settings': {
                templateUrl: 'templates/chat/settings/index.html',
                controller: 'userNetworkCtrl'
            }
        }
    })

        .state('app.contactsRecommended', {
        cache: false,
        url: '/recommended',
        views: {
            'tab-contacts': {
                templateUrl: 'templates/chat/contacts/recommended.html',
                controller: 'contactsRecommended'
            }
        }
    })
        .state('app.contactsBookRecommended', {
        cache: false,
        url: '/book-recommended',
        views: {
            'tab-contacts': {
                templateUrl: 'templates/chat/contacts/book-recommended.html',
                controller: 'contactsBookRecommended'
            }
        }
    })
            .state('app.startConversation', {
        cache: false,
        url: '/conversations/create',
        views: {
            'tab-messages': {
                templateUrl: 'templates/chat/messages/create.html',
                controller: 'contactsCtrl'
            },
        }
    })
        .state('app.createGroup', {
        cache: false,
        url: '/group/create',
        views: {
            'tab-messages': {
                templateUrl: 'templates/chat/group/create.html',
                controller: 'groupCreate'
            },
        }
    })
    /*
        .state('app.chat.detail', {
        cache: false,
        url: '/messages/detail/:id',
        templateUrl: 'templates/chat/messages/detail.html',
        controller: 'messagesDetail'
    })
    */
        .state('detail', {
        cache: false,
        url: '/messages/detail/:id',
        templateUrl: 'templates/chat/messages/detail.html',
        controller: 'messagesDetail'
    })
        .state('app.chat.addContacts', {
        cache: false,
        url: '/contacts/add',
        views: {
            'tab-contacts': {
                templateUrl: 'templates/chat/contacts/add.html',
                controller: 'contactsAdd'
            }
        }
    })
        .state('app.chat.searchContacts', {
        cache: false,
        url: '/contacts/search/:id',
        views: {
            'tab-contacts': {
                templateUrl: 'templates/chat/contacts/search.html',
                controller: 'contactsSearch'
            }
        }
    })
/*
        .state('app.inviteContacts', {
        url: '/contacts/invite/:id',
        views: {
            'tab-contacts': {
                templateUrl: 'templates/chat/contacts/invite.html',
                controller: 'contactsInvite'
            }
        }
    })
*/
        .state('app.updateContacts', {
        url: '/contacts/update',
        views: {
            'tab-contacts': {
                templateUrl: 'templates/chat/contacts/phonebook.html',
                controller: 'mobileContractListCtrl'
            }
        }
    }) 

        .state('app.nearbyContacts', {
        cache: false,
        url: '/contacts/nearby',
        views: {
            'tab-contacts': {
                templateUrl: 'templates/chat/contacts/nearby.html',
                controller: 'contactsNearby'
            }
        }
    })

        .state('public', {
        url: "/public",
        abstract: true,
        templateUrl: "templates/authentication/html/tabs.html",

        controller: 'authController'
    })

        .state('app.fakeLogin', {
        url: "/fakeLogin",
        cache: false,
        views: {
            'menuContent': {
                templateUrl: "templates/authentication/html/fake-login.html",
                controller: 'authController'
            }
        }
    })

        .state('public.fakeSignUp', {
        url: "/fakeSignUp",
        cache: false,
        views: {
            'menuContent': {
                templateUrl: "templates/authentication/html/fake-sign-up.html",
                controller: 'authController'

            }
        }
    }) /**/

    /*----------------------------------------------------------------------------*/

        .state('app.tryAppNoBackBtn', {
        url: "/tryAppNoBackBtn",
        cache: false,
        views: {
            'menuContent': {
                templateUrl: "templates/welcome/html/try-app-no-back-btn.html"
            }
        }
    })

    /*
        .state('app.pricing', {
        url: "/pricing",
        views: {
            'menuContent': {
                templateUrl: "templates/themes/pricing/html/pricing.html"
            }
        }
    })
        .state('app.menuDashboard', {
        url: "/menuDashboard",
        views: {
            'menuContent': {
                templateUrl: "templates/themes/menu-dashboard/html/menu-dashboard.html",
                controller: "menuDashboardCtrl"
            }
        }
    })      
     */
        .state('app.homeDashboard', {
        url: "/home/dashboard",
        views: {
            'tab-dashboard': {
                templateUrl: "templates/dashboard/html/home-dashboard.html",
                controller: "homeDashboardCtrl"
            }
        }
    })


        .state('public.fakeLogin', {
        url: "/fakeLogin",
        cache: false,
        views: {
            'menuContent': {
                templateUrl: "templates/authentication/html/fake-login.html",
                controller: 'authController'
            }
        }
    })

        .state('public.fakeWizardSignUp', {
        url: "/fakeWizardSignUp",
        cache: false,
        views: {
            'menuContent': {
                templateUrl: "templates/authentication/html/wizzard-sign-up.html",
                controller: 'wizzardSignUpController'
            }
        }
    })

        .state('public.tryApp', {
        url: "/tryApp",
        cache: false,
        views: {
            'menuContent': {
                templateUrl: "templates/welcome/html/try-app.html",
                controller: 'authController'

            }
        }
    })

        .state('profile', {
        url: "/profile",
//        views: {
//            'tab-annonces': {
                templateUrl: "templates/sideMenu/profile.html",
                controller: 'profileCtrl'
//            }
//        }
    })
        .state('preferences', {
        url: "/preferences",
    //    views: {
    //        'tab-annonces': {
                templateUrl: "templates/sideMenu/preferences.html",
                controller: 'preferencesCtrl'   
    //        }
    //    }
    })
        .state('cgu', {
        url: "/cgu",
    //    views: {
    //        'tab-annonces': {
                templateUrl: "templates/sideMenu/cgu.html",
                controller: 'cguCtrl'
    //        }
    //    }   
    })
        .state('infos', {
        url: "/infos",
    //    views: {
    //        'tab-annonces': {
                templateUrl: "templates/sideMenu/infos.html",
                controller: 'infosCtrl'
    //        }
    //    }
    })
        .state('legals', {
        url: "/legals",
    //    views: {
    //        'tab-annonces': {
                templateUrl: "templates/sideMenu/legals.html",
                controller: 'legalsCtrl'
    //        }
    //    }
    })
        .state('chartData', {
        url: "/chartData",
    //    views : {
    //        'tab-annonces': {
                templateUrl: "templates/sideMenu/chartData.html"
    //        }
    //    }
    })
        .state('app.syndic', {
        url: "/syndic/syndic",
        views: {
            'tab-syndic': {
        templateUrl: "templates/syndic/syndic.html",
        controller: "syndicCtrl"
        }}
    })

/*
        .state('app.currentUserNetwork', {
        url: "/incidents/list",
        params: {
            item: null
        },
        views: {
            'menuContent': {
                templateUrl: "templates/incidents/html/list-incidents.html",
                controller: "incidentsDashboardCtrl"
            }
        }
    })
  */  
        .state('editProfile', {
        url: "/profile/edit",
        cache: false,     
               templateUrl: "templates/authentication/html/wizzard-sign-up.html",
                controller: 'wizzardSignUpController'
         
         /*
                   templateUrl: "templates/authentication/html/finish-profile.html",
                controller: 'userProfileCtrl'
   
   */
    })

        .state('app.inviteContacts', {
        url: '/contacts/invite/:id',
        views: {
            'tab-contacts': {
                templateUrl: 'templates/chat/contacts/invite.html',
                controller: 'contactsInvite'
            }
        }
    })
    /*
        .state('app.network.invitations', {
        url: "/network/invitations",
        params: {
            item: null
        },
        views: {
            'menuContent': {
                templateUrl: "templates/incidents/html/list-incidents.html",
                controller: "incidentsDashboardCtrl"
            }
        }
    })
    */

        .state('app.transition', {
        url: "annonces/transition",
        views: {
            'tab-annonces': {
                templateUrl: "templates/transition.html",
                controller: "transitionCtrl"
            }
        }
    })
        .state('app.listAnnonces', {
        url: "/annonces/list",
        views: {
            'tab-annonces': {
                templateUrl: "templates/digiposts/html/digipost.html",
                controller: "digipostCtrl"
            }
        }
    })

        .state('app.newAnnonce', {
        url: "/annonces/new",
        views: {
            'tab-annonces': {
                templateUrl: "templates/digiposts/html/digipost-edit.html",
                controller: "digipostEditCtrl"
            }
        }
    })
        .state('app.changeAddressForm', {
        url: "/profile/changeAddressForm",
        views: {
            'tab-annonces': {
                templateUrl: "templates/authentication/html/changeAddressForm.html",
                controller: "profileCtrl"
            }
        }
    })

/*
        .state('app.incidentsDashboard', {
        url: "/incidents/dashboard",
        views: {
            'tab-incidents': {
                templateUrl: "templates/incidents/html/incidents-dashboard.html",
                controller: "incidentsDashboardCtrl"
            }
        }
    })  */

        .state('app.incidentDetail', {
        url: "/incidentdetail",
        params: {
            contractdetail: null,
            actionDelete: false
        },
        views: {
            'tab-incidents': {
                templateUrl: "templates/incidents/html/incident-detail.html",
                controller: 'addIncidentDashboardCtrl'
            }
        }
    })

        .state('app.addIncident', {
        url: "/incidents/create",
        views: {
            'tab-incidents': {
                templateUrl: "templates/incidents/html/add-incident-wizard.html",
                controller: "addIncidentDashboardCtrl"
            }
        }
    })        

        .state('app.listIncidents', {
        url: "/incidents/list",
        params: {
            item: null
        },
        views: {
            'tab-incidents': {
                templateUrl: "templates/incidents/html/list-incidents.html",
                controller: "incidentsDashboardCtrl"
            }
        }
    })
        .state('app.incidentUpdate', {
        url: "/incident/edit/:id",
        params: {
            contractdetail: null,
            actionDelete: false
        },
        views: {
            'tab-incidents': {
                templateUrl: "templates/incidents/html/incident-detail.html",
                controller: 'addIncidentDashboardCtrl'
            }
        }
    })

        .state('app.viewIncident', {
        url: "/incidents/view/:id",
        params: {
            item: null,
            id: null

        },
        views: {
            'tab-incidents': {
                templateUrl: "templates/incidents/html/page-incident.html",
                controller: 'singleIncidentPageCtrl'
            }
        }
    })
    /*
        .state('app.addIncidentStepTwo', {
        url: "/addIncidentStepTwo/:typeIncident",
        views: {
            'menuContent': {
                templateUrl: "templates/incidents/html/add-incident-step-two.html",
                controller: "addIncidentStepTwoCtrl"
            }
        }
    })*/
    ;
    /*
        .state('app.expense', {
        url: "/expense",
        params:{
            isAnimated:true
        },
        views: {
            'menuContent': {
                templateUrl: "templates/themes/expense-dashboard/html/expense-dashboard.html",
                controller: "expenseDashboardCtrl"
            }
        }
    })
        .state('app.expenseSetting', {
        url: "/expenseSetting",
        views: {
            'menuContent': {
                templateUrl: "templates/themes/expense-dashboard/html/expense-dashboard-setting.html",
                controller: "expenseDashboardSettingCtrl"
            }
        }
    })
        .state('app.newsFeed', {
        url: "/newsFeed",
        views: {
            'menuContent': {
                templateUrl: "templates/themes/news-feed/html/news-feed.html"
            }
        }
    })
        .state('app.clothShop', {
        url: "/clothShop",
        views: {
            'menuContent': {
                templateUrl: "templates/themes/cloth-shop/html/cloth-shop.html"
            }
        }
    })
        .state('app.onlineCourse', {
        url: "/onlineCourse",
        views: {
            'menuContent': {
                templateUrl: "templates/themes/online-course/html/online-course.html"
            }
        }
    })
        .state('app.catalog', {
        url: "/catalog",
        views: {
            'menuContent': {
                templateUrl: "templates/themes/catalog/html/catalog.html",
                controller: "catalogCtrl"
            }
        }
    })
        .state('app.locationFeed', {
        url: "/locationFeed",
        views: {
            'menuContent': {
                templateUrl: "templates/themes/location-feed/html/location-feed.html"
            }
        }
    })
        .state('app.cubeFeed', {
        url: "/cubeFeed",
        views: {
            'menuContent': {
                templateUrl: "templates/themes/cube-feed/html/cube-feed.html"
            }
        }
    })
        .state('app.restaurant', {
        url: "/restaurant",
        views: {
            'menuContent': {
                templateUrl: "templates/themes/restaurant/html/restaurant.html"
            }
        }
    })
        .state('app.singlePushNotification', {
        url: "/singlePushNotification",
        views: {
            'menuContent': {
                templateUrl: "templates/push-notification/single-push-notification/html/single-push-notification.html",
                controller: "singlePushNotificationCtrl"
            }
        }
    })
        .state('app.schedulePushNotification', {
        url: "/schedulePushNotification",
        views: {
            'menuContent': {
                templateUrl: "templates/push-notification/schedule-push-notification/html/schedule-push-notification.html",
                controller: "schedulePushNotificationCtrl"
            }
        }
    })
        .state('app.iosMapConnect', {
        url: "/iosMapConnect",
        views: {
            'menuContent': {
                templateUrl: "templates/map-and-location/ios-map-connect/html/ios-map-connect.html",
                controller: "iosMapConnectCtrl"
            }
        }
    })


        .state('app.androidMapConnect', {
        url: "/androidMapConnect",
        views: {
            'menuContent': {
                templateUrl: "templates/map-and-location/android-map-connect/html/android-map-connect.html",
                controller: "androidMapConnectCtrl"
            }
        }
    });// End $stateProvider

    */
    $urlRouterProvider.otherwise('public/fakeLogin');

    //Use $urlRouterProvider.otherwise(Url);
    ///// $urlRouterProvider.otherwise('app/home/dashboard');
    $translateProvider.useSanitizeValueStrategy('escape'); // gestion des caractères d’échappement
    $translateProvider.useStaticFilesLoader({prefix: 'languages/', suffix: '.json'}); // chargement des fichiers de langues
    $translateProvider.registerAvailableLanguageKeys(['en','fr'], {'en_US': 'en', 'en_UK': 'en', 'fr_FR': 'fr', 'fr_BE': 'fr'}) // définition des langues disponibles
    .determinePreferredLanguage(); // sélection de la langue du système
    $translateProvider.use();

    $ionicCloudProvider.init({
        "core": {
          "app_id": "7e164c5b"
        }
    });

});
