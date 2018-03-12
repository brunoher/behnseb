

appControllers.controller('signCtrl', function($scope, $state, $http, $ionicPopup, Login, User, Camera, $filter, $localStorage, Animate){
    $scope.data = {};
    $scope.choseArea = {name:"United States","areacode":"1"};
    $scope.showValue = {"type":"password","text":"Show"};
    $scope.login = function(){
        if(!angular.isDefined($scope.data.phone)){
            $scope.data.notification = "Plese enter your phone number to continue";
        } else {
            Animate.loadStrt(5000);
            $scope.data.notification = false;
            $scope.data.fullPhone = $scope.choseArea.areacode + $scope.data.phone;
            $scope.userLogin = Login().get($scope.data.fullPhone);
            $scope.userLogin.$loaded(function(){
                Animate.loadEnd();
                if(angular.isDefined($scope.userLogin.active)){
                    $scope.data.notification = "Your account is inactive, please active mail for register";
                } else {
                    if($scope.userLogin.password == $scope.data.password) {
                        $localStorage.userLogin = {};
                        $localStorage.userLogin.isLogin = true;
                        $localStorage.userLogin.id = $scope.currentUser.uid;
                        // $localStorage.userLogin.phone = $scope.userLogin.$id;
                        //$localStorage.userLogin.password = $scope.data.password;
                        //$localStorage.userLogin.areacode = Number($scope.choseArea.areacode);
                        /*
                        $localStorage.userLogin.id = $scope.userLogin.id;
                        $localStorage.userLogin.phone = $scope.userLogin.$id;
                        $localStorage.userLogin.password = $scope.data.password;
                        $localStorage.userLogin.areacode = Number($scope.choseArea.areacode);
                        */
                        $state.go("app.chat.messages");
                    } else {
                        $scope.data.notification = "The password you entered is incorrect";
                    }
                }
            });
        }
    };
    $scope.register = function(){
        if(!$scope.data.phone || !$scope.data.password){
            $scope.data.notification = "Plese enter data to continue";
        } else if($scope.data.password != $scope.data.repassword) {
            $scope.data.notification = "Confirmation password do not match";
        } else {
            Animate.loadStrt(5000);
            $scope.data.notification = false;
            $scope.data.fullPhone = $scope.choseArea.areacode + $scope.data.phone;
            $scope.userLogin = Login().get($scope.data.fullPhone);
            $scope.userLogin.$loaded(function(){
                if(angular.isUndefined($scope.userLogin.$value)){
                    $scope.data.notification = "Phone number is already registered";
                    Animate.loadEnd();
                } else {
                    $scope.checkEmail = Login().getEmail($scope.data.email);
                    $scope.checkEmail.$loaded(function(){
                        if(angular.isDefined($scope.checkEmail.$value)){
                            Login().set($scope.data.fullPhone);
                            Login().changePass($scope.data.fullPhone,$scope.data.password);
                            $http.head($scope.hostMail+'?email='+$scope.data.email+'&phone='+$scope.data.fullPhone).then(function(){
                                Animate.loadEnd();
                                $state.go('login');
                            });
                        } else {
                            Animate.loadEnd();
                            $scope.data.notification = "Email is already registered";
                        }
                    });
                }
            });
        }
    };
    $scope.showForgot = function() {
        if(!$scope.data.phone){
            $scope.data.notification = "Plese enter your phone number to continue";
        } else {
            Animate.loadStrt(5000);
            $scope.data.notification = false;
            $scope.data.fullPhone = $scope.choseArea.areacode + $scope.data.phone;
            $scope.userForgot = Login().get($scope.data.fullPhone);
            $scope.userForgot.$loaded(function(){
                if(angular.isDefined($scope.userForgot.$value)){
                    Animate.loadEnd();
                    $scope.data.notification = "Phone number is not registered";
                } else {
                    Animate.loadEnd();
                    var confirmPopup = $ionicPopup.confirm({
                        scope: $scope,
                        title: 'Confirm number',
                        cssClass: 'popup-forgot text-center',
                        templateUrl: 'templates/sign/forgot.html',
                        buttons: [
                            { text:'Change'},
                            {
                                text: 'Confirm',
                                onTap: function(e){
                                    Animate.loadStrt(5000);
                                    $http.head($scope.hostMail+'?action=forgot&phone='+$scope.data.fullPhone).then(function(){
                                        Animate.loadEnd();
                                    });
                                }
                            }
                        ]
                    });
                }
            });
        }
    };
    $scope.showPassword = function(){
        if($scope.showValue.type == "password"){
            $scope.showValue = {"type":"text","text":"Hide"}
        } else {
            $scope.showValue = {"type":"password","text":"Show"}
        }
    };
    $scope.takeAvatar = function(){
        var options = {
            sourceType:0,
            allowEdit:true,
            targetWidth:160,
            targetHeight:160,
            destinationType:0
        };
        Camera.getPicture(options).then(function(imageData) {
            $scope.data.avatar = "data:image/jpeg;base64,"+imageData;
        }, function(err) {
            console.log(err);
        });
    };
    $scope.editInfomation = function(){
        delete $scope.data.notification;
        if(angular.isUndefined($scope.data.name) || angular.isUndefined($scope.data.birthday)){
            $scope.data.notification = "Plese enter Name and Birthday to continue";
        } else {
            $scope.data.birthday = $filter('date')($scope.data.birthday,'dd/MM/yyyy');
            $scope.data.phone = $localStorage.userLogin.phone;
            User($localStorage.userLogin.id).set($scope.data);
            $state.go('app.chat.messages');
        }
    };
})

    .controller('tabCtrl', function($scope, $localStorage, Notification,$rootScope, Animate){
    $localStorage.userLogin = $scope.currentUser;
    console.log('ok');
    console.log('SET USER',$scope,$scope.currentUser,$scope.currentAuth);
    //$localStorage.userLogin.id = $scope.currentUser.uid;

    $scope.notification = Notification($scope.currentUser.uid).get();
    $rootScope.hideTabs = false;
})


    .controller('sendLocation', function($scope, Location, $state, $stateParams, $localStorage, Messages, DetailMessages, DetailGroups, $ionicModal){
    Location($localStorage.userLogin.id).update();
    $scope.inputLocation = {"from":0,"type":"location"};
    if(angular.isUndefined($localStorage.recentLocation)) $localStorage.recentLocation = [];
    $scope.recent = $localStorage.recentLocation;
    $scope.Me = Location($localStorage.userLogin.id).get();
    $scope.Me.$loaded(function(){
        if(angular.isDefined($scope.Me.$value)) $scope.Me = {lat:21.036728,lng:105.8346994};
        $scope.location = {};
        $scope.location.lat = $scope.Me.lat;
        $scope.location.lng = $scope.Me.lng;
        var mapOptions = {
            center: {lat: $scope.location.lat, lng: $scope.location.lng},
            zoom: 18,
        };
        $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
        //Marker location of user logined
        $scope.markerIcon = {
            url: 'css/img/icon-location-marker.png',
            scaledSize: new google.maps.Size(32, 32)
        };
        $scope.createMarker = function(){
            $scope.marker = new google.maps.Marker({
                map: $scope.map,
                position: $scope.location,
                icon: $scope.markerIcon
            });
        };
        $scope.createMarker();
        $scope.data = {};
        $scope.$watch('data.search', function(){
            if($scope.data.search){
                var request = {};
                request.query = $scope.data.search;
                $scope.search = new google.maps.places.PlacesService($scope.map);
                $scope.search.textSearch(request, function(resuilt, status){
                    if (status == google.maps.places.PlacesServiceStatus.OK) {
                        $scope.resuilt = resuilt;
                    }
                });
            }
        });
        $scope.selectLocation = function(location){
            $scope.location.lat = location.geometry.location.lat();
            $scope.location.lng = location.geometry.location.lng();
            $scope.data.name = location.name;
            $scope.data.address = location.formatted_address;
            $scope.createMarker();
            $scope.map.panTo($scope.location);
            $scope.closeSearchLocation();
        };
        $scope.selectRecent = function(location){
            $scope.location = location.location;
            $scope.data.name = location.name;
            $scope.data.address = location.address;
            $scope.createMarker();
            $scope.map.panTo($scope.location);
        };
    });

    $ionicModal.fromTemplateUrl('templates/chat/messages/search-location.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalsearchLocation = modal;
    });
    $scope.showSearchLocation = function() {
        $scope.modalsearchLocation.show();
    };
    $scope.closeSearchLocation = function() {
        $scope.modalsearchLocation.hide();
    };

    $scope.sendLocation = function(){
        $scope.inputLocation.content = $scope.location;
        if(angular.isDefined($scope.inputLocation.content)){
            if(angular.isDefined($scope.data.name)){
                var check = true;
                angular.forEach($localStorage.recentLocation, function(value){
                    if(value.name = $scope.data.name) check = false;
                });
                if(check == true){
                    var newRecent = {};
                    newRecent.location = $scope.inputLocation.content;
                    newRecent.name = $scope.data.name;
                    newRecent.address = $scope.data.address;
                    $localStorage.recentLocation.push(newRecent);
                }
            }
            var now = new Date().getTime();
            $scope.inputLocation.time = now;
            if($stateParams.source == 'group'){
                $state.go('groupDetail', {id:$stateParams.id});
                $scope.inputLocation.from = $localStorage.userLogin.id;
                DetailGroups($stateParams.id).post($scope.inputLocation);
                $scope.inputLocation = {"from":0,"type":"location"};
            } else {
                $state.go('detail', {id:$stateParams.id});
                DetailMessages($localStorage.userLogin.id).post($stateParams.id,$scope.inputLocation);
                $scope.Messages = {};
                $scope.Messages.content = '[location]';
                $scope.Messages.time = $scope.inputLocation.time;
                $scope.Messages.unread = 0;
                Messages($localStorage.userLogin.id).post($stateParams.id,$scope.Messages);
                Notification().post($stateParams.id);
                $scope.inputLocation = {"from":0,"type":"location"};
            }
        }
    };
})

    

    .controller('contactsCtrlX', function($scope) {});

appControllers.controller('contactsBookRecommended', function($scope, ContactsBookRecommended, ContactsRecommended,Contacts, User, $localStorage,$state, Animate) {
    Animate.loadStrt(5000);
    $scope.contacts = ContactsBookRecommended($localStorage.userLogin.id).get();
    $scope.contacts.$loaded(function(){
        Animate.loadEnd();
        angular.forEach($scope.contacts, function(value){
            value.name = User(value.$id).getName();
            value.avatar = User(value.$id).getAvatar();
            value.phone = User(value.$id).getPhone();
        });
    });
    $scope.accept = function(id){
        ContactsRecommended($localStorage.userLogin.id).post(id);
        ContactsBookRecommended($localStorage.userLogin.id).remove(id);
        //$state.go('app.contacts');
    };
});

appControllers.controller('contactsRecommended', function($scope, ContactsRecommended, Contacts, User, $localStorage,$state, Animate) {
    Animate.loadStrt(5000);
    $scope.contacts = ContactsRecommended($localStorage.userLogin.id).get();
    $scope.contacts.$loaded(function(){
        Animate.loadEnd();
        angular.forEach($scope.contacts, function(value){
            value.name = User(value.$id).getName();
            value.avatar = User(value.$id).getAvatar();
            value.phone = User(value.$id).getPhone();
        });
    });
    $scope.accept = function(id){
        Contacts($localStorage.userLogin.id).post(id);
        ContactsRecommended($localStorage.userLogin.id).remove(id);
        $state.go('app.contacts');
    };
})

    .controller('contactsAdd', function($scope, $state, $localStorage, $ionicPopup, Login) {
    $scope.choseArea = {name:"United States","areacode":"1"};
    $scope.warning = false;
    $scope.searchPerson = function(phone){
        $scope.warning = false;
        $scope.phoneFull = $scope.choseArea.areacode + phone;
        if($scope.phoneFull.length < 9) { $scope.warning = true }
        else {
            $scope.person = Login().get($scope.phoneFull);
            $scope.person.$loaded(function(){
                if(angular.isDefined($scope.person.id) && $scope.person.id != $localStorage.userLogin.id){
                    $state.go('app.chat.searchContacts', {id:$scope.person.id});
                } else { $scope.warning = true }
            });
        }
    };
    $scope.inviteSms = function(){
        window.plugins.socialsharing.shareViaSMS(
            $scope.inviteText,
            null,
            function(msg) {
                console.log('ok: ' + msg)
            },
            function(msg) {
                alert('Error: ' + msg)
            }
        );
    };
});

appControllers.controller('contactsSearch', function($scope, $state, $stateParams, User, Contacts, $localStorage, Animate){
    Animate.loadStrt(5000);
    $scope.contact = User($stateParams.id).get();
    $scope.contact.$loaded(function(){
        $scope.myFriend = Contacts($localStorage.userLogin.id).getFriend();
        $scope.myFriend.$loaded(function(){
            $scope.myFriend = Object.keys($scope.myFriend);
            if($scope.myFriend.indexOf($scope.contact.$id) != -1) $scope.isFriend = true;
            Animate.loadEnd();
        });
    });
    $scope.inviteFriend = function(id){
        $state.go('app.inviteContacts', {id:id});
    };
});

appControllers.controller('contactsUpdate', function($scope, $timeout, $localStorage, Login, ContactsRecommended,$ionicPlatform, Animate) {
    $scope.lastupdate = $localStorage.lastUpdate;
    document.addEventListener("deviceready", onDeviceReady, false);

    console.log('contactsUpdate');
    /*
    $ionicPlatform.ready(function(){
        console.log('contactsUpdatePlatformReady');
       // onDeviceReady();
    });
    */
    function onDeviceReady() {
        console.log('contactsUpdateonDeviceReady');

        Animate.loadStrt(5000);

        function onSuccess(contacts) {
            console.log('OKOKCONTACT',contacts);
            $scope.contacts = {};
            var nowPhone;
            angular.forEach(contacts, function(value){
                if(angular.isArray(value.phoneNumbers)){
                    angular.forEach(value.phoneNumbers, function(phone){

                        if(phone.type == "mobile") {
                            nowPhone = phone.value.match(/\d/g);

                            if(nowPhone != null) {
                                nowPhone = Number(nowPhone.join(""));
                                // nowPhone= nowPhone.slice(-7);
                                console.log( nowPhone.toString().slice(-7));
                                nowPhone = $localStorage.userLogin.areacode + nowPhone.toString();
                                $scope.contacts[nowPhone] = Login().getId(nowPhone);
                            }
                        }
                    });
                }
            });
            Animate.loadEnd();
            $scope.updateContacts = function(){
                Animate.loadStrt(5000);
                angular.forEach($scope.contacts, function(valuePhone){

                    ContactsRecommended($localStorage.userLogin.id).post(valuePhone.$value);
                });
                $localStorage.lastUpdate = new Date().getTime();
                $scope.lastupdate = $localStorage.lastUpdate;
                Animate.loadEnd();
            };
        };
        function onError(contactError) {
            Animate.loadEnd();
            alert(contactError);
        };
        var fields = ["phoneNumbers"];
        navigator.contacts.find(fields, onSuccess, onError);
        /**/
    }

})


    .controller('nearbyLocation', function($scope, $ionicPopover, $localStorage, Location, User){
    Location($localStorage.userLogin.id).update();
    $scope.Me = Location($localStorage.userLogin.id).get();
    $scope.Me.$loaded(function(){
        if(angular.isDefined($scope.Me.$value)) $scope.Me = {lat:21.036728,lng:105.8346994};
        $scope.location = {};
        $scope.location.lat = $scope.Me.lat;
        $scope.location.lng = $scope.Me.lng;
        var mapOptions = {
            center: {lat: $scope.location.lat, lng: $scope.location.lng},
            zoom: 18,
        };
        $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
        //Marker location of user logined
        $scope.markerIcon = {
            url: 'css/img/icon-location-marker.png',
            scaledSize: new google.maps.Size(32, 32)
        };
        $scope.marker = new google.maps.Marker({
            map: $scope.map,
            position: $scope.location,
            icon: $scope.markerIcon
        });
        $scope.nearby = Location().getNearby($scope.Me.nearby);
        $scope.nearby.$loaded(function(){
            delete $scope.nearby[$localStorage.userLogin.id];
            angular.forEach($scope.nearby, function(value,key){
                value.user = User(key).get();
                value.user.$loaded(function(){
                    var currentYear = new Date().getFullYear();
                    var userAge = value.user.birthday.split('/');
                    var userAge = currentYear-Number(userAge[2]);
                    if(angular.isDefined(value.user.avatar)) $scope.markerAvatar = value.user.avatar;
                    else $scope.markerAvatar = 'css/img/icon-avatar.png';
                    $scope.markerIcon = {
                        url: $scope.markerAvatar,
                        scaledSize: new google.maps.Size(32, 32)
                    };
                    $scope.marker = new google.maps.Marker({
                        map: $scope.map,
                        position: {lat:value.lat,lng:value.lng},
                        icon: $scope.markerIcon,
                    });
                    var content = '<div class="list"><div class="item item-avatar"><img src="';
                    if(angular.isDefined(value.user.avatar)) content = content+value.user.avatar;
                    else content = content+'css/img/icon-avatar.png';
                    content = content+'"><div>'+value.user.name+'</div><span class="positive margin-right ';
                    if(value.user.gender == 'Male') content = content+'ion-male';
                    else content = content+'ion-female';
                    content = content+'"></span> '+userAge+'<a class="button button-outline button-positive" href="#/tab/contacts/invite/'+key+'">+ Add</a></div></div>';
                    $scope.infowindow = new google.maps.InfoWindow({
                        content: content
                    });
                    $scope.marker.addListener('click', function() {
                        $scope.infowindow.open($scope.map, this);
                    });
                });
            });
        });
    });
})
    .controller('eventsCtrl', function($scope, $ionicPopup, IonicClosePopupService, Block, Contacts, ContactsRecommended, User, $localStorage, $filter,Events, Animate) {
    Animate.loadStrt(5000);
    $scope.timeNow = new Date().getTime();
    console.log('evets',$scope);
    $scope.contactRecommended = ContactsRecommended($localStorage.userLogin.id).get();
    $scope.contacts = Events($localStorage.userLogin.id).get();
    $scope.contacts.$loaded(function(){
        Animate.loadEnd();
        angular.forEach($scope.contacts, function(value){
            value.name = User(value.$id).getName();
            value.avatar = User(value.$id).getAvatar();
            value.lastSign = User(value.$id).getLastSign();
        });
        $scope.getAlpha = function(id){
            if(id >= 1){
                $scope.contacts = $filter('orderBy')($scope.contacts, 'name.$value');
                var lastName = $filter('firstChar')($scope.contacts[id-1].name.$value);
                var nowName = $filter('firstChar')($scope.contacts[id].name.$value);
                if(lastName == nowName) return false;
                else return true;
            }
        };
    });
    $scope.showMenuSearch = function(name,id){
        var confirmPopup = $ionicPopup.confirm({
            title: name,
            cssClass: 'popup-menu-contact',
            buttons: [
                {
                    text: 'Block',
                    type: 'button-clear',
                    onTap: function(e){
                        $scope.Block = Block($localStorage.userLogin.id).get(id);
                        $scope.Block.$loaded(function(){
                            if($scope.Block.$value){
                                Block($localStorage.userLogin.id).remove(id);
                                location.reload();
                            } else {
                                var confirmPopup = $ionicPopup.confirm({
                                    template: 'This person will not be able to send messages to you.Block him/her?',
                                    cssClass: 'popup-confirm-delete',
                                    buttons: [
                                        {
                                            text: 'NO',
                                            type: 'button-clear',
                                        },
                                        {
                                            text: 'YES',
                                            type: 'button-clear button-no-delete',
                                            onTap: function(e){
                                                Block($localStorage.userLogin.id).block(id);
                                                location.reload();
                                            }
                                        },
                                    ]
                                });
                            }
                        });
                    }
                },
                {
                    text: 'Remove friend',
                    type: 'button-clear',
                    onTap: function(e){
                        Contacts($localStorage.userLogin.id).remove(id);
                    }
                }
            ]
        });
        IonicClosePopupService.register(confirmPopup);
    };
})


    .controller('eventDetail', function($scope, $state, $localStorage, $ionicModal, $ionicTabsDelegate, $timeout, $ionicScrollDelegate, User, Groups, DetailGroups, Camera, $stateParams, Location, Animate){
    $scope.contentBottom = '100px';
    Animate.loadStrt(5000);
    $scope.Me = $localStorage.userLogin.id;
    $scope.Groups = {};
    $scope.Groups.nameGroup = Groups($stateParams.id).getName();
    $scope.Groups.countUser = Groups($stateParams.id).getNumUser();
    $scope.Groups.user = Groups($stateParams.id).getUser();
    $scope.Groups.user.$loaded(function(){
        $scope.Groups.name = {};
        $scope.Groups.avatar = {};
        angular.forEach($scope.Groups.user, function(item){
            $scope.Groups.name[item.$id] = User(item.$id).getName();
            $scope.Groups.avatar[item.$id] = User(item.$id).getAvatar();
        });
    });
    $scope.Detail = DetailGroups($stateParams.id).get();
    $scope.Detail.$loaded(function(){
        Animate.loadEnd();
        $ionicScrollDelegate.scrollBottom();
    });
    var onNewMessage = firebase.database().ref('detailGroups').child($stateParams.id);
    onNewMessage.on('value', function(){ $ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom(); });

    $scope.messageInput = function(option){
        if(option == "text") $scope.contentBottom = '100px';
        else $scope.contentBottom = '220px';
    };

    $scope.inputText = {"type":"text"};
    $scope.sendText = function(){
        if(angular.isDefined($scope.inputText.content) && angular.isString($scope.inputText.content)){
            var now = new Date().getTime();
            $scope.inputText.time = now;
            $scope.inputText.from = $scope.Me;
            DetailGroups($stateParams.id).post($scope.inputText);
            $scope.inputText = {"type":"text"};
        }
    };

    $scope.inputPicture = {"type":"picture"};
    $scope.takePicture = function(){
        $ionicTabsDelegate.select(1);
        var options = {
            quality:75,
            targetWidth:720,
            targetHeight:1280,
            destinationType:0
        };
        Camera.getPicture(options).then(function(imageData) {
            $scope.inputPicture.content = "data:image/jpeg;base64,"+imageData;
        }, function(err) {
            console.log(err);
        });
    };
    $scope.sendPicture = function(){
        if(angular.isDefined($scope.inputPicture.content)){
            var now = new Date().getTime();
            $scope.inputPicture.time = now;
            $scope.inputPicture.from = $scope.Me;
            DetailGroups($stateParams.id).post($scope.inputPicture);
            $scope.inputPicture = {"type":"picture"};
        } else $scope.takePicture();
    };

    $scope.showInputImages = function(){
        var options = {
            sourceType:0,
            destinationType:0
        };
        Camera.getPicture(options).then(function(imageData) {
            $scope.inputPicture.content = "data:image/jpeg;base64,"+imageData;
            $ionicTabsDelegate.select(1);
        }, function(err) {
            console.log(err);
        });
    };

    $scope.inputSticker = {"type":"sticker"};
    $scope.sendSticker = function(sticker){
        if(angular.isDefined(sticker) && angular.isNumber(sticker)){
            var now = new Date().getTime();
            $scope.inputSticker.time = now;
            $scope.inputSticker.from = $scope.Me;
            $scope.inputSticker.content = sticker;
            DetailGroups($stateParams.id).post($scope.inputSticker);
            $scope.inputSticker = {"type":"sticker"};
        }
    };

    $scope.showSendLocation = function(){
        $state.go('sendLocation',{id:$stateParams.id,source:'group'});
    };
})

    .controller('eventCreate', function($scope, $state, Groups, UserGroups, Contacts, User, $localStorage, $filter,Events, Animate) {
    Animate.loadStrt(5000);
    $scope.contacts = Contacts($localStorage.userLogin.id).get();
    $scope.contacts.$loaded(function(){
        Animate.loadEnd();
        angular.forEach($scope.contacts, function(value){
            value.name = User(value.$id).getName();
            value.avatar = User(value.$id).getAvatar();
        });
        $scope.getAlpha = function(id){
            if(id >= 1){
                $scope.contacts = $filter('orderBy')($scope.contacts, 'name.$value');
                var lastName = $filter('firstChar')($scope.contacts[id-1].name.$value);
                var nowName = $filter('firstChar')($scope.contacts[id].name.$value);
                if(lastName == nowName) return false;
                else return true;
            }
        };
    });
    $scope.contactsSelected = {};
    $scope.selectedCount = 0;
    $scope.change = function(contact){
        if (contact.selected) {
            $scope.contactsSelected[contact.$id] = true;
            $scope.selectedCount++;
        } else {
            delete $scope.contactsSelected[contact.$id];
            $scope.selectedCount--
        }
    };
    $scope.createGroup = function(){
        console.log('ff',$scope);
        if($scope.selectedCount > 0){
            $scope.last = Events().getLast();
            $scope.last.$loaded(function(){
                $scope.last = Number($scope.last.$value) + 1;
                console.log('ff',$scope);
                Events().create($scope.last,$localStorage.userLogin.id,$scope.selectedCount,$scope.contactsSelected,$scope.nameGroup);
                //UserEvents().post($localStorage.userLogin.id,$scope.contactsSelected,$scope.last);
                console.log('f2f',$scope);

                $state.go('eventDetail', {id:$scope.last});
            });
        }
    };
})

    .controller('eventsRecommended', function($scope, ContactsRecommended, Contacts, User, $localStorage, Animate) {
    Animate.loadStrt(5000);
    $scope.contacts = ContactsRecommended($localStorage.userLogin.id).get();
    $scope.contacts.$loaded(function(){
        Animate.loadEnd();
        angular.forEach($scope.contacts, function(value){
            value.name = User(value.$id).getName();
            value.avatar = User(value.$id).getAvatar();
            value.phone = User(value.$id).getPhone();
        });
    });
    $scope.accept = function(id){
        Contacts($localStorage.userLogin.id).post(id);
        ContactsRecommended($localStorage.userLogin.id).remove(id);
    };
})

    .controller('eventsAdd', function($scope, $state, $localStorage, $ionicPopup, Login) {
    $scope.choseArea = {name:"United States","areacode":"1"};
    $scope.warning = false;
    $scope.searchPerson = function(phone){
        $scope.warning = false;
        $scope.phoneFull = $scope.choseArea.areacode + phone;
        if($scope.phoneFull.length < 9) { $scope.warning = true }
        else {
            $scope.person = Login().get($scope.phoneFull);
            $scope.person.$loaded(function(){
                if(angular.isDefined($scope.person.id) && $scope.person.id != $localStorage.userLogin.id){
                    $state.go('tab.searchContacts', {id:$scope.person.id});
                } else { $scope.warning = true }
            });
        }
    };
    $scope.inviteSms = function(){
        window.plugins.socialsharing.shareViaSMS(
            $scope.inviteText,
            null,
            function(msg) {
                console.log('ok: ' + msg)
            },
            function(msg) {
                alert('Error: ' + msg)
            }
        );
    };
})

    .controller('eventsLocation', function($scope, $ionicPopover, $localStorage, Location, User, Animate){
    console.log('eventsNearby');
    $scope.settings = {"gender":"All","fromage":15,"toage":80,"visible":"All"};
    $scope.getRangeAge = function(){
        $scope.beforefrom = $scope.settings.fromage - 1;
        $scope.afterfrom = $scope.settings.fromage + 1;
        $scope.beforeto = $scope.settings.toage - 1;
        $scope.afterto = $scope.settings.toage + 1;
        if($scope.beforefrom < 15) $scope.beforefrom = 80;
        if($scope.beforeto < 15) $scope.beforeto = 80;
        if($scope.afterfrom > 80) $scope.afterfrom = 15;
        if($scope.afterto > 80) $scope.afterto = 15;
    };
    $scope.getRangeAge();
    $scope.selectRange = function(to,number){
        if(to == 1){
            $scope.settings.toage = number;
        } else {
            $scope.settings.fromage = number;
        }
        $scope.getRangeAge();
    };
    $scope.plusFromAge = function(){
        $scope.settings.fromage = $scope.afterfrom;
        $scope.getRangeAge();
    };
    $scope.minusFromAge = function(){
        $scope.settings.fromage = $scope.beforefrom;
        $scope.getRangeAge();
    };
    $scope.plusToAge = function(){
        $scope.settings.toage = $scope.afterto;
        $scope.getRangeAge();
    };
    $scope.minusToAge = function(){
        $scope.settings.toage = $scope.beforeto;
        $scope.getRangeAge();
    };

    $ionicModal.fromTemplateUrl('templates/events/nearby-setting.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalnearbyEventsSetting = modal;
    });
    $scope.showNearbySetting = function() {
        $scope.iSettings = angular.copy($scope.settings);
        $scope.modalnearbyEventsSetting.show();
    };
    $scope.closeNearbySetting = function() {
        $scope.modalnearbyEventsSetting.hide();
    };
    $scope.cancelNearbySetting = function(){
        $scope.settings = $scope.iSettings;
        $scope.closeNearbySetting();
    };
    $scope.updateNearbySetting = function(){
        $scope.closeNearbySetting();
        $scope.updateNearby();
    };

    $scope.selectRangeAge = function() {
        $scope.iRangeAge = angular.copy($scope.settings);
        var selectRangeAge = $ionicPopup.confirm({
            title: 'Select age',
            templateUrl: 'templates/events/select-range-age.html',
            scope: $scope,
            cssClass: 'popup-select-age',
            buttons: [
                {
                    text: 'CANCEL',
                    type: 'button-clear',
                    onTap: function(e){
                        $scope.settings = $scope.iRangeAge;
                        $scope.closeSelectRangeAge();
                    }
                },
                {
                    text: 'OK',
                    type: 'button-clear button-ok',
                    onTap: function(e){
                        if($scope.settings.toage < $scope.settings.fromage){
                            var tg = angular.copy($scope.settings.toage);
                            $scope.settings.toage = angular.copy($scope.settings.fromage);
                            $scope.settings.fromage = tg;
                        }
                        $scope.closeSelectRangeAge();
                    }
                }
            ]
        });
        $scope.closeSelectRangeAge = function(){ selectRangeAge.close(); };
    };
    $scope.updateNearby = function(){
        Animate.loadStrt(5000);
        $scope.nearby = new Array;
        var currentYear = new Date().getFullYear();
        $scope.myFriend = Contacts($localStorage.userLogin.id).getFriend();
        $scope.myFriend.$loaded(function(){
            $scope.myFriend = Object.keys($scope.myFriend);
            $scope.iNearby = User().filter($scope.settings.gender);
            $scope.iNearby.$loaded(function(){
                var userYear;
                angular.forEach($scope.iNearby, function(value){
                    value.age = currentYear - Number(value.birthday.split('/')[2]);
                    if(value.age >= $scope.settings.fromage && value.age <= $scope.settings.toage && $scope.myFriend.indexOf(value.$id) == -1)
                        $scope.nearby.push(value);
                });
                Animate.loadEnd();
            });
        });
    };
    $scope.updateNearby();
})
    .controller('eventsNearby', function($scope, $ionicPopover, $localStorage, Location, User){
    Location($localStorage.userLogin.id).update();
    $scope.Me = Location($localStorage.userLogin.id).get();
    console.log($scope);
    $scope.Me.$loaded(function(){
        if(angular.isDefined($scope.Me.$value)) $scope.Me = {lat:21.036728,lng:105.8346994};
        $scope.location = {};
        $scope.location.lat = $scope.Me.lat;
        $scope.location.lng = $scope.Me.lng;
        var mapOptions = {
            center: {lat: $scope.location.lat, lng: $scope.location.lng},
            zoom: 18,
        };
        $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
        //Marker location of user logined
        $scope.markerIcon = {
            url: 'css/img/icon-location-marker.png',
            scaledSize: new google.maps.Size(32, 32)
        };
        $scope.marker = new google.maps.Marker({
            map: $scope.map,
            position: $scope.location,
            icon: $scope.markerIcon
        });
        $scope.nearby = Location().getNearby($scope.Me.nearby);
        $scope.nearby.$loaded(function(){
            delete $scope.nearby[$localStorage.userLogin.id];
            angular.forEach($scope.nearby, function(value,key){
                value.user = User(key).get();
                value.user.$loaded(function(){
                    var currentYear = new Date().getFullYear();
                    var userAge = value.user.birthday.split('/');
                    var userAge = currentYear-Number(userAge[2]);
                    if(angular.isDefined(value.user.avatar)) $scope.markerAvatar = value.user.avatar;
                    else $scope.markerAvatar = 'css/img/icon-avatar.png';
                    $scope.markerIcon = {
                        url: $scope.markerAvatar,
                        scaledSize: new google.maps.Size(32, 32)
                    };
                    $scope.marker = new google.maps.Marker({
                        map: $scope.map,
                        position: {lat:value.lat,lng:value.lng},
                        icon: $scope.markerIcon,
                    });
                    var content = '<div class="list"><div class="item item-avatar"><img src="';
                    if(angular.isDefined(value.user.avatar)) content = content+value.user.avatar;
                    else content = content+'css/img/icon-avatar.png';
                    content = content+'"><div>'+value.user.name+'</div><span class="positive margin-right ';
                    if(value.user.gender == 'Male') content = content+'ion-male';
                    else content = content+'ion-female';
                    content = content+'"></span> '+userAge+'<a class="button button-outline button-positive" href="#/tab/contacts/invite/'+key+'">+ Add</a></div></div>';
                    $scope.infowindow = new google.maps.InfoWindow({
                        content: content
                    });
                    $scope.marker.addListener('click', function() {
                        $scope.infowindow.open($scope.map, this);
                    });
                });
            });
        });
    });
})

    .controller('contactsInvite', function($scope, $stateParams, ContactsRecommended, $localStorage, User,$state){
    $scope.Me = User($localStorage.userLogin.id).getName();
    $scope.Friend = {};
    $scope.Friend.name = User($stateParams.id).getFormatedName();
    $scope.Friend.phone = User($stateParams.id).getPhone();
    $scope.acceptInvite = function(){
        ContactsRecommended($localStorage.userLogin.id).post($stateParams.id);
        $state.go('app.nearbyContacts');
        //$scope.goBack();
    }
    $scope.addNewInvite = function(uid){
        ContactsRecommended($localStorage.userLogin.id).post(uid);
        $state.go('app.nearbyContacts');
        //$scope.goBack();
    }
})



    .controller('settingsCtrl', function($scope, $ionicModal, $http, $ionicPopup, IonicClosePopupService, $state, $localStorage, User, Settings, Camera) {
    $scope.profile = User($localStorage.userLogin.id).get();
    $scope.changeAvatar = function(){
        var options = {
            sourceType:0,
            allowEdit:true,
            targetWidth:160,
            targetHeight:160,
            destinationType:0
        };
        Camera.getPicture(options).then(function(imageData) {
            $scope.avatar = "data:image/jpeg;base64,"+imageData;
            User($localStorage.userLogin.id).editAvatar($scope.avatar);
        }, function(err) {
            console.log(err);
        });
    };
    $ionicModal.fromTemplateUrl('templates/settings/name.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalChangeName = modal;
    });
    $scope.showChangeName = function() {
        $scope.modalChangeName.show();
    };
    $scope.closeChangeName = function() {
        $scope.modalChangeName.hide();
    };
    $scope.changeName = function(){
        if($scope.profile.name.length <= 20){
            User($localStorage.userLogin.id).editName($scope.profile.name);
            $scope.closeChangeName();
        }
    };
    $ionicModal.fromTemplateUrl('templates/settings/phone.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalChangePhone = modal;
    });
    $scope.showChangePhone = function() {
        $scope.modalChangePhone.show();
    };
    $scope.closeChangePhone = function() {
        $scope.modalChangePhone.hide();
    };
    $scope.dataPhone = {};
    $scope.dataPhone.areacode = $localStorage.userLogin.areacode;
    $scope.alertPhone = function(){
        var confirmPopup = $ionicPopup.confirm({
            template: 'Your phone number is too short in the country enter<br/><br/>Enter the country code if you have not entered',
            cssClass: 'popup-confirm-delete',
            buttons: [
                {
                    text: 'OK',
                    type: 'button-clear button-no-delete col-50 col-offset-50'
                }
            ]
        });
    };
    $scope.changePhone = function(){
        if($scope.dataPhone.areacode && $scope.dataPhone.phone){
            $scope.phoneFull = $scope.dataPhone.areacode.toString() + $scope.dataPhone.phone;
            alert($scope.phoneFull.length);
            if($scope.phoneFull.length >= 10){
                User($localStorage.userLogin.id).editPhone($scope.phoneFull);
                $scope.closeChangePhone();
            } else $scope.alertPhone();
        } else $scope.alertPhone();
    };
    $scope.changeGender = function(gender){
        if(gender == 0) gender = "male";
        else gender = "female";
        User($localStorage.userLogin.id).editGender(gender);
    };

    $scope.settings = {};
    $scope.settings.messages = Settings($localStorage.userLogin.id).get('messages');
    $scope.changeMessages = function(child){
        var data = $scope.settings.messages[child];
        child = 'messages/'+child;
        Settings($localStorage.userLogin.id).change(child,data);
    };

    $scope.lastUpdate = $localStorage.lastUpdate;
    $scope.settings.contacts = Settings($localStorage.userLogin.id).get('contacts');
    $scope.changeContacts = function(child){
        var data = $scope.settings.contacts[child];
        child = 'contacts/'+child;
        Settings($localStorage.userLogin.id).change(child,data);
    };
    $scope.showPopupSettingsListFriends = function() {
        var popupSettingsListFriends = $ionicPopup.show({
            title: 'Friends list show in contacts',
            cssClass: 'popup-select-radio',
            scope: $scope,
            template: '<ion-radio ng-model="settings.contacts.show_friend" ng-value="true" ng-click="changeContacts(\'show_friend\'); closePopupSettingsListFriends()">All friends</ion-radio><ion-radio ng-model="settings.contacts.show_friend" ng-value="false" ng-click="changeContacts(\'show_friend\'); closePopupSettingsListFriends()">Friends who use Hichat</ion-radio>'
        });
        $scope.closePopupSettingsListFriends = function(){
            popupSettingsListFriends.close();
        };
        IonicClosePopupService.register(popupSettingsListFriends);
    };

    $scope.settings.languages = Settings($localStorage.userLogin.id).get('languages');
    $scope.showPopupSettingsLanguages = function() {
        var popupSettingsLanguages = $ionicPopup.show({
            title: 'Language',
            cssClass: 'popup-select-radio',
            scope: $scope,
            templateUrl: 'templates/settings/language.html'
        });
        $scope.closePopupSettingsLanguages = function(){
            popupSettingsLanguages.close();
        };
        IonicClosePopupService.register(popupSettingsLanguages);
    };
    $scope.changeLanguage = function(){
        Settings($localStorage.userLogin.id).change('languages/language',$scope.settings.languages.language);
    }
    $scope.showPopupSettingsFonts = function() {
        var popupSettingsFonts = $ionicPopup.show({
            title: 'Select font',
            cssClass: 'popup-select-radio',
            scope: $scope,
            template: '<ion-radio ng-model="settings.languages.font" ng-value="true" ng-click="changeFont(); closePopupSettingsFonts()">Hichat font</ion-radio><ion-radio ng-model="settings.languages.font" ng-value="false" ng-click="changeFont(); closePopupSettingsFonts()">System font</ion-radio>'
        });
        $scope.closePopupSettingsFonts = function(){
            popupSettingsFonts.close();
        };
        IonicClosePopupService.register(popupSettingsFonts);
    };
    $scope.changeFont = function(){
        Settings($localStorage.userLogin.id).change('languages/font',$scope.settings.languages.font);
    };

    $scope.showPopupLogout = function() {
        var confirmPopup = $ionicPopup.confirm({
            template: 'Log out?',
            cssClass: 'popup-confirm-logout',
            buttons: [
                {
                    text: 'NO',
                    type: 'button-clear button-no-logout'
                },
                {
                    text: 'YES',
                    type: 'button-clear',
                    onTap: function(e){
                        delete $localStorage.userLogin;
                        $state.go('walkthrough');
                    }
                },
            ]
        });
    };
})

    .controller('changePasswordCtrl', function($scope, $ionicPopup, $state, $localStorage, Login){
    $scope.data = {};
    $scope.warning = false;
    $scope.showValue = {"type":"password","text":"Show"}
    $scope.showPassword = function(){
        if($scope.showValue.type == "password"){
            $scope.showValue = {"type":"text","text":"Hide"}
        } else {
            $scope.showValue = {"type":"password","text":"Show"}
        }
    };
    $scope.showcurrentValue = {"type":"password","text":"Show"}
    $scope.showcurrentPassword = function(){
        if($scope.showcurrentValue.type == "password"){
            $scope.showcurrentValue = {"type":"text","text":"Hide"}
        } else {
            $scope.showcurrentValue = {"type":"password","text":"Show"}
        }
    }
    $scope.updatePassword = function(){
        $scope.warning = false;
        if(!$scope.data.oldpassword || !$scope.data.password || !$scope.data.repassword){
            $scope.warning = true;
        } else {	
            if($scope.data.password != $scope.data.repassword) $scope.showPopupError();
            else {
                $scope.User = Login().get($localStorage.userLogin.phone);
                $scope.User.$loaded(function(){
                    if($scope.data.oldpassword != $scope.User.password) $scope.warning = true;
                    else {
                        Login().changePass($localStorage.userLogin.phone,$scope.data.password);
                        $scope.data = {};
                        $state.go('settingsAccount');
                    }
                });
            }
        }
    };
    $scope.showPopupError = function() {
        var confirmPopup = $ionicPopup.confirm({
            template: 'Invalid confirm password, please check and try again.',
            cssClass: 'popup-confirm-logout',
            buttons: [
                {
                    text: 'CLOSE',
                    type: 'button-clear button-no-logout'
                }
            ]
        });
    };
})

    .controller('searchCtrl', function($scope, $state, $localStorage, $ionicPopup, IonicClosePopupService, Contacts, User, Block, Animate){
    Animate.loadStrt(5000);
    if(angular.isUndefined($localStorage.searchRecent)) $localStorage.searchRecent = new Object;
    $scope.Recent = $localStorage.searchRecent;
    $scope.Search = new Array;
    $scope.Contacts = Contacts($localStorage.userLogin.id).get();
    $scope.Contacts.$loaded(function(){
        angular.forEach($scope.Contacts, function(value){
            var Person = {"id":value.$id};
            Person.name = User(value.$id).getFormatedName();
            Person.avatar = User(value.$id).getAvatar();
            $scope.Search.push(Person);
        });
        Animate.loadEnd();
    });
    $scope.viewMessages = function(id){
        $state.go('detail',{id:id});
    };
    $scope.deleteRecent = function(name,id){
        var confirmPopup = $ionicPopup.confirm({
            title: name,
            cssClass: 'popup-menu-contact',
            buttons: [
                {
                    text: 'Clear search history',
                    type: 'button-clear',
                    onTap: function(e){
                        delete $localStorage.searchRecent[id];
                    }
                },
            ]
        });
        IonicClosePopupService.register(confirmPopup);
    };
    $scope.choseContact = function(contact){
        $localStorage.searchRecent[contact.id] = contact;
        $scope.viewMessages(contact.id);
    };
    $scope.showMenuSearch = function(name,id){
        var confirmPopup = $ionicPopup.confirm({
            title: name,
            cssClass: 'popup-menu-contact',
            buttons: [
                {
                    text: 'Block',
                    type: 'button-clear',
                    onTap: function(e){
                        $scope.Block = Block($localStorage.userLogin.id).get(id);
                        $scope.Block.$loaded(function(){
                            if($scope.Block.$value){
                                Block($localStorage.userLogin.id).remove(id);
                                location.reload();
                            } else {
                                var confirmPopup = $ionicPopup.confirm({
                                    template: 'This person will not be able to send messages to you.Block him/her?',
                                    cssClass: 'popup-confirm-delete',
                                    buttons: [
                                        {
                                            text: 'NO',
                                            type: 'button-clear',
                                        },
                                        {
                                            text: 'YES',
                                            type: 'button-clear button-no-delete',
                                            onTap: function(e){
                                                Block($localStorage.userLogin.id).block(id);
                                                location.reload();
                                            }
                                        },
                                    ]
                                });
                            }
                        });
                    }
                },
                {
                    text: 'Remove friend',
                    type: 'button-clear',
                    onTap: function(e){
                        Contacts($localStorage.userLogin.id).remove(id);
                    }
                }
            ]
        });
        IonicClosePopupService.register(confirmPopup);
    };
});
