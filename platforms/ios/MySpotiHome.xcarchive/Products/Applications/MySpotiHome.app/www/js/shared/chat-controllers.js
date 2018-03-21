appControllers.controller('areacodeCtrl', function($scope, $ionicModal, Areacode){
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
});


appControllers.controller('contactsCtrl', function($scope, $ionicPopup, IonicClosePopupService, Block, Contacts, ContactsRecommended, User, $localStorage, $filter,ContactsBook, Animate,ContactsBookRecommended,$mdBottomSheet,$mdDialog,$mdToast,$timeout,Abuse,$state, PopupService) {
    // $localStorage.userLogin = $scope.currentUser;
    $scope.showContactDetailsModal = function (_contact) {
        //_contact.imageUrl == "css/img/icon-camera.png" ? alert("hey") : alert("ho");
        //imgModalLeft = 70;
        var confirmPopup = $ionicPopup.confirm({
            title: _contact.name.$value,
            template: '<span style="position:absolute; top:40%; left:30%; z-index:-1;">Chargement image...</span><img ng-src="'+_contact.avatar.$value+'">',
            buttons: [
                { text: 'Fermer' }
            ]
        });
    }

    Animate.loadStrt(5000);
    $scope.timeNow = new Date().getTime();
    $scope.selectedPhone = User($localStorage.userLogin.id).getPhone();
    //$scope.iNearby = User().filterByPhone($scope.selectedPhone );
    $scope.iNearby = User().filterByImmeuble($scope.currentUser.immeuble );
    var cacheContacts = angular.isUndefined($localStorage.cacheContacts)?null:$localStorage.cacheContacts;
    $scope.friends = [];
    $scope.contactRecommended = ContactsRecommended($localStorage.userLogin.id).get();
    $scope.contactsBookRecommended = ContactsBookRecommended($localStorage.userLogin.id).get();
    $scope.contacts = Contacts($localStorage.userLogin.id).get();

    $scope.acceptContactRequest = function(id){
        Contacts($localStorage.userLogin.id).post(id);
        ContactsRecommended($localStorage.userLogin.id).remove(id);
        ContactsBookRecommended($localStorage.userLogin.id).remove(id);
        /*
        ContactsRecommended($localStorage.userLogin.id).post(id);
        
        */
        //$state.go('app.contacts');
    };
    $scope.rejectContactRequest = function(id){
        //Contacts($localStorage.userLogin.id).post(id);
        ContactsRecommended($localStorage.userLogin.id).remove(id);
        ContactsBookRecommended($localStorage.userLogin.id).remove(id);
        /*
        ContactsRecommended($localStorage.userLogin.id).post(id);
        
        */
        //$state.go('app.contacts');
    };
    $scope.acceptContactSuggestion = function(id,index){
         ContactsRecommended($localStorage.userLogin.id).post(id, $scope.currentUser.formatedName);
         ContactsBookRecommended($localStorage.userLogin.id).remove(id);
         ContactsBookRecommended(id).remove($localStorage.userLogin.id);
        //$state.go('app.contacts');
        //console.log('remove',$scope.myContactsRecommended[index],index,$scope.myContactsRecommended);
        //$scope.myContactsRecommended.re
        //$scope.myContactsRecommended[index].isAdded = true;
        if (index > -1) {
            //$scope.myContactsRecommended.splice(index, 1);
        }

    };
    $scope.loadMyContacts = function(){
        Animate.loadStrt(5000);

        $scope.contactBook = ContactsBook($localStorage.userLogin.id).get();
        //console.log( $scope.contactBook);
        $scope.contactBook.$loaded(function(){
            Animate.loadEnd();
            //$scope.contactBook = $scope.contactBook.slice( 0,10);
            angular.forEach($scope.contactBook, function(value){
                //  value.name = User(value.$id).getName();
                var phone = '0'+value.$id;
                //alert('tryphone'+phone);
                User().filterByPhone(phone).$loaded(function(isFriend){
                    //
                    if(isFriend.length>0){
                        //alert('found'+isFriend[0].$id);
                        if(isFriend[0].$id == $localStorage.userLogin.id){

                        }else{
                            $scope.friends.push(isFriend[0]);
                            //console.log('filterByPhone ok',$scope.friends);
                            ContactsBookRecommended($localStorage.userLogin.id).post(isFriend[0].$id);
                        }


                    }
                });
            });

        });
        //console.log('iNearby',$scope.iNearby,$scope.contactBook, $scope.friends);
    }
    var canAddToRecommended =false;
    $scope.checkIfCanAddToRecommended = function (nearbyUser){
        if($localStorage.userLogin.id === nearbyUser.$id){

        }else{
            canAddToRecommended = true;
        }
        if(canAddToRecommended && $scope.contactsBookRecommended.length>0){
            //console.log('filterByPhone',isFriend);

            angular.forEach($scope.contactsBookRecommended, function(value2){
                var isok = (nearbyUser.$id === value2.$id);
                if(isok){
                    canAddToRecommended = false;
                }else{
                    //$scope.friends.push(isFriend[0]);
                    //console.log('filterByPhone',$scope.friends);
                    // ContactsBookRecommended($localStorage.userLogin.id).post(isFriend[0].$id);
                }
                //console.log('value2',isok,nearbyUser.$id,value2.$id);

            });



        }
        if(canAddToRecommended && $scope.contactRecommended.length>0){
            //console.log('filterByPhone',isFriend);

            angular.forEach($scope.contactRecommended, function(value2){
                var isok = (nearbyUser.$id === value2.$id);
                if(isok){
                    canAddToRecommended = false;
                }else{
                    //$scope.friends.push(isFriend[0]);
                    //console.log('filterByPhone',$scope.friends);
                    // ContactsBookRecommended($localStorage.userLogin.id).post(isFriend[0].$id);
                }
                //console.log('value3',isok,nearbyUser.$id,value2.$id);

            });



        }
        if(canAddToRecommended && $scope.contacts.length>0){
            //console.log('filterByPhone',isFriend);

            angular.forEach($scope.contacts, function(value2){
                var isok = (nearbyUser.$id === value2.$id);
                if(isok){
                    canAddToRecommended = false;

                }else{
                    //$scope.friends.push(isFriend[0]);
                    //console.log('filterByPhone',$scope.friends);
                    // ContactsBookRecommended($localStorage.userLogin.id).post(isFriend[0].$id);
                }
                //console.log('value2contacts',isok,nearbyUser.$id,value2.$id);

            });



        }
        if(canAddToRecommended){
            //console.log('all test ok');
        }else{
            //console.log('all test not ok');

        }
        //alert('test'+canAddToRecommended);

        return canAddToRecommended;
    }
    $timeout(function () { 
        $scope.iNearby.$loaded(function(){
            //console.log('$loaded',$scope.iNearby,$scope.contactsBookRecommended.length);
            if($scope.iNearby.length>0){
                var canAddToRecommended = false;
                angular.forEach($scope.iNearby, function(nearbyUser){
                    //console.log('value',nearbyUser);
                    $scope.iscontactRecommended = ContactsRecommended($localStorage.userLogin.id).isRecommended(nearbyUser.$id);
                    $scope.iscontactRecommended.$loaded(function(){
                        //console.log('iscontactRecommended',$scope.iscontactRecommended);
                        if($scope.iscontactRecommended.$value){

                        }else{
                            //console.log('canstarteverif',$scope.iscontactRecommended);
                            var result = $scope.checkIfCanAddToRecommended(nearbyUser);
                            if(result){  
                                ContactsBookRecommended($localStorage.userLogin.id).post(nearbyUser.$id);
                            }
                        }
                    });
                });
            }
        });
    },1000,false);

    $scope.myContactsRecommended = [];

    $scope.contactsBookRecommended.$loaded(function(){
        Animate.loadEnd();
        angular.forEach($scope.contactsBookRecommended, function(value){
            if (value.$value === true) { 
                /* si dans le noeud "contactsBookrecommended", 
                la valeur du contact recommandé est différente de false,
                ça veut dire que la suggestion n'a pas été acceptée (invitation reçue dans ce cas)
                ou que le contact n'a pas envoyé d'invitation */
                value.name = User(value.$id).getFormatedName();
                value.avatar = User(value.$id).getAvatar();
                value.lastSign = User(value.$id).getLastSign();
                value.address = User(value.$id).getAddress();
                value.isAdded = false;
                $scope.myContactsRecommended.push(value);
            }
        });
        $scope.getAlpha = function(id){
            if(id >= 1){
                $scope.contactsBookRecommended = $filter('orderBy')($scope.contactsBookRecommended, 'name.$value');
                var lastName = $filter('firstChar')($scope.contactsBookRecommended[id-1].name.$value);
                var nowName = $filter('firstChar')($scope.contactsBookRecommended[id].name.$value);
                if(lastName == nowName) return false;
                else return true;
            }
        };
    });
/*
    var unwatch = $scope.contactsBookRecommended.$watch(function() {
        console.log("data changed!");
        angular.forEach($scope.contactsBookRecommended, function(value){
            console.log('valcccc',value.$id);
            value.name = User(value.$id).getFormatedName();
            value.avatar = User(value.$id).getAvatar();
            value.lastSign = User(value.$id).getLastSign();
        });
    });
*/
    
    var unwatch2 = $scope.contactRecommended.$watch(function() {
        //console.log("data changed!");
        angular.forEach($scope.contactRecommended, function(value){
            //console.log('val',value);
            value.name = User(value.$id).getFormatedName();
            value.avatar = User(value.$id).getAvatar();
            value.lastSign = User(value.$id).getLastSign();
            value.address = User(value.$id).getAddress();
        });

    });

    var toastPosition = {
        bottom: false,
        top: true,
        left: false,
        right: true
    };

    $scope.newAbuseRequest=function(abuse){
        //var abuse = {details:text,signaledUser:text};
        var req = Abuse($localStorage.userLogin.id).create(abuse);
        //console.log(req);
    }

    $scope.removePerson = function(contact) {
        $mdBottomSheet.hide();

        var confirmPopup = $ionicPopup.confirm({
            template: 'Cette personne ne fera plus partie de vos contacts. Supprimer '+ contact.name.$value +'?',
            cssClass: 'popup-confirm-delete',
            buttons: [
                {
                    text: 'Annuler',
                    type: 'button-clear',
                    onTap: function(e){ $scope.Block.$value = false }
                },
                {
                    text: 'Confirmer',
                    type: 'button-clear button-no-delete',
                    onTap: function(e){
                        Contacts($localStorage.userLogin.id).remove(contact.$id);

                        $timeout(function () { 
                            $scope.contacts = Contacts($localStorage.userLogin.id).get();
                            $scope.contacts.$loaded(function(){
                                Animate.loadEnd();
                                angular.forEach($scope.contacts, function(value){
                                    value.name = User(value.$id).getName();
                                    value.avatar = User(value.$id).getAvatar();
                                    value.lastSign = User(value.$id).getLastSign();
                                    value.address = User(value.$id).getAddress();
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
                            //  $scope.loadMyContacts();
                        }, 10, false);

                        // location.reload();
                    }
                },
            ]
        });
    }

    $scope.blockPerson = function(contact) {
        $scope.Block = Block($localStorage.userLogin.id).get(contact.$id);
        $scope.Block.$loaded(function(){
            $mdBottomSheet.hide();
            //console.log('block',contact.$id,$scope.Block.$value,$scope.Block);

            if($scope.Block.$value){
                Block($localStorage.userLogin.id).remove(contact.$id);
                // location.reload();
            } else {
                var confirmPopup = $ionicPopup.confirm({
                    template: 'Cette personne ne pourra plus vous contacter. Bloquer '+ contact.name.$value +'?',
                    cssClass: 'popup-confirm-delete',
                    buttons: [
                        {
                            text: 'Annuler',
                            type: 'button-clear',
                            onTap: function(e){ $scope.Block.$value = false }
                        },
                        {
                            text: 'Confirmer',
                            type: 'button-clear button-no-delete',
                            onTap: function(e){
                                Block($localStorage.userLogin.id).block(contact.$id);
                                // location.reload();
                            }
                        },
                    ]
                });
            }
        });
    };

    $scope.openAbusePrompt = function(ev,contact) {
        $scope.abuseSelect = null;
        $scope.confirm = false; 
        $scope.status = "";
        $scope.abuse = {};
        $scope.abuse.userTo = contact.$id;
        $scope.abuse.userFrom = $localStorage.userLogin.id;
        $mdDialog.show({
            templateUrl: 'dialog-select-template.html',
            scope: $scope,
            preserveScope: true,
            targetEvent: ev
        }).then(function(res) {
                if ($scope.abuseSelect !== null && $scope.confirm) {
                    var details = { cat: $scope.abuseSelect};
                    if ($scope.abuseSelectDetails && $scope.abuseSelectDetails.length > 0) {
                        details.text = $scope.abuseSelectDetails;
                    }
                    $scope.abuse.details = details;
                    $scope.status = "Signalement effectué.";// + result + '.';
                    $scope.executeAbusePrompt($scope.status, $scope.abuse);
                } else if ($scope.confirm){
                    $scope.status = "Vous devez selectionner une raison.";
                    $scope.executeAbusePrompt($scope.status); 
                }     
        }, function() {
            $scope.closeAbusePrompt();
        });
         $mdBottomSheet.hide();
    };

    $scope.confirmAbusePrompt = function() {
        $scope.confirm = true;
        $mdDialog.hide();
    }

    $scope.executeAbusePrompt = function(status, abuse) {
        $scope.showSimpleToast(status);
        if (abuse) {
            $scope.newAbuseRequest(abuse);
        }
        $mdDialog.hide();
        $mdBottomSheet.hide();
    };
    
    $scope.closeAbusePrompt = function() { 
        $scope.status = 'Signalement annulé';
        $scope.showSimpleToast($scope.status);
        $mdDialog.hide();
        $mdBottomSheet.hide();
    };

    $scope.showSimpleToast = function(text) {
        //var pinTo = $scope.getToastPosition();
        $mdToast.show(
            $mdToast.simple()
            .textContent(text)
            .position(toastPosition )
            .hideDelay(3000)
        );
    };

    // at some time in the future, we can unregister using
    //unwatch();
    $scope.contactRecommended.$loaded(function(){
        Animate.loadEnd();
        angular.forEach($scope.contactRecommended, function(value){
            // console.log('val',value);
            value.name = User(value.$id).getFormatedName();
            value.avatar = User(value.$id).getAvatar();
            value.lastSign = User(value.$id).getLastSign();
        });
        $scope.getAlpha = function(id){
            if(id >= 1){
                $scope.contactRecommended = $filter('orderBy')($scope.contactRecommended, 'name.$value');
                var lastName = $filter('firstChar')($scope.contactRecommended[id-1].name.$value);
                var nowName = $filter('firstChar')($scope.contactRecommended[id].name.$value);
                if(lastName == nowName) return false;
                else return true;
            }
        };
    });
    $scope.contacts.$loaded(function(){
        Animate.loadEnd();
        angular.forEach($scope.contacts, function(value){
            value.name = User(value.$id).getFormatedName();
            value.avatar = User(value.$id).getAvatar();
            value.lastSign = User(value.$id).getLastSign();
            value.postalCode = User(value.$id).getPostalCode();
            value.address = User(value.$id).getAddress();

            value.blocked = Block(value.$id).get($localStorage.userLogin.id);
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
                                    template: 'Cette personne ne pourra plus vous envoyer de message. Confirmez-vous votre action?',
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

    $scope.actionContactListBottomSheet = function (contractForm) {
        //console.log($scope.currentUserSelected,contractForm);
    };


    $scope.showContactListBottomSheet = function ($event, contact) {
        //console.log('showEditProfileBottomSheet');
        $scope.currentUserSelected = contact;
        // $scope.disableSaveBtn = $scope.validateRequiredField(contractForm);
        //console.log('pp');
        //var test={cool:'yo'};
        $mdBottomSheet.show({
            templateUrl: 'contact-actions-template.html',
            targetEvent: $event,
            scope: $scope.$new(false)
        });
    };// End showing the bottom sheet.
});

appControllers.controller('contactsNearby', function($scope, $http, $ionicModal, $ionicPopup, User, Contacts, $localStorage,$log,$rootScope, Animate,$filter,ContactsRecommended,ContactsRecommendedSend,$firebaseObject){
    var screenHeight = window.screen.height;
    var imgModalLeft;
    var m_top = screenHeight > 900 ? 0 : -5;
    $scope.invitBtn = {"margin-top": m_top+"%"};
    
    $scope.showContactDetailsModal = function (_contact) {
        imgModalLeft = _contact.imageUrl == "css/img/icon-camera.png" ? 50 : 30;

        var confirmPopup = $ionicPopup.confirm({
            title: _contact.formatedName,
            template: '<span style="position:absolute; top:40%; left:'+imgModalLeft+'%; z-index:-1;">Chargement image...</span><img ng-src="'+_contact.imageUrl+'">',
            buttons: [
                { text: 'Fermer' }
            ]
        });
    }

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



    var self = $scope;

    self.simulateQuery = false;
    self.isDisabled    = false;
    $scope.nearby = [];
    $scope.nearby.push({name:'HH',birthday:'07'});


    // list of `state` value/display objects
    self.querySearch   = querySearch;
    self.selectedItemChange = selectedItemChange;
    self.searchTextChange   = searchTextChange;
    $scope.incidentIsUnlistedConfirmation=false;
    $scope.selectedName = '';
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
        console.log('Text changed to ' + text,text.length);
        /*
                   if(angular.isDefined(text) && angular.isDefined(text)){
                $scope.selectedName = text;

            }else{
                $scope.selectedName = '';

            }
            */
        //$scope.updateNearby();
        if(angular.isDefined(text) && text!=='' && text.length>2){
            $scope.selectedName = text;
            var lastName =$filter('filter')($scope.nearby,{formatedName:text});
            // Object.filter($scope.nearby,{firstName:'bb'});//

            $scope.nearbyDisplay = lastName;

        }else{
            $scope.nearbyDisplay = null;

            $scope.selectedName = '';

        }
        //console.log($scope.nearby);
        /*
        var autoChild = document.getElementById('contacts-nearby').firstElementChild;
        var el = angular.element(autoChild);
        el.scope().$mdAutocompleteCtrl.hidden = true;
    */
    }

    function hideSuggestion(item) {
    }

    function selectedItemChange(item) {
        $log.info('Item changed to ' + JSON.stringify(item));
        if(angular.isDefined(item) && angular.isDefined(item.display)){
            $scope.selectedName = item.display;

        }else{
            $scope.selectedName = '';

        }
        $scope.updateNearby();
    }

    /**
         * Build `states` list of key/value pairs
         */

    function loadAll() {
        //console.log($scope.nearby);
        var allStates = 'Ascenseur, Electricité, Dégats des eaux, Nettoyage, Dégradation, Autres';
        //return $scope.nearby;

        return $scope.nearby.map( function (state) {
            return {
                value: state.formatedName.toLowerCase(),//$id,
                display: state.formatedName
            };
        });
    }
    $scope.total = function(){
        var total = 0;
        for(var i = 0; i < $scope.articles.length; i++){
            total += $scope.articles[i].price * $scope.articles[i].quantity;
        }
        return total;
    };
    function calculateDiscount(newValue, oldValue, scope){
        //console.log('fdf',newValue, oldValue);
        //$scope.discount = (newValue > 100) ? newValue * 0.10 : 0;
    };

    $scope.finalTotal = function(){
        return $scope.total() - $scope.discount;   
    };
    self.typeModel = '';

    self.$watch('typeModel', function(newVal, oldVal){
        if(newVal.toLowerCase() === 'pause'){
            alert('Pause!');
        }
    });
    $scope.filterTextNearby = '';
    self.keyUp = function(text){
        searchTextChange(text);
    }
    self.$watch(function() { return self.typeModel; },  function (newValue, oldValue, scope) {
        //Do anything with $scope.letters
    }, true);
    /*
         * Create filter function for a query string
    */
    function createFilterFor(query) {
        var lowercaseQuery = angular.lowercase(query);

        return function filterFn(state) {
            return (state.value.indexOf(lowercaseQuery) === 0);
        };

    }

    $ionicModal.fromTemplateUrl('templates/chat/contacts/nearby-setting.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalnearbySetting = modal;
    });
    $scope.showNearbySetting = function() {
        $scope.iSettings = angular.copy($scope.settings);
        $scope.modalnearbySetting.show();
    };
    $scope.closeNearbySetting = function() {
        $scope.modalnearbySetting.hide();
    };
    $scope.cancelNearbySetting = function(){
        $scope.settings = $scope.iSettings;
        $scope.closeNearbySetting();
    };
    $scope.updateNearbySetting = function(){
        $scope.closeNearbySetting();
        $scope.updateNearby();
    };
    $scope.addNewInvite = function(user){
        var uid = user.id;
        ContactsRecommended($localStorage.userLogin.id).post(uid, $scope.currentUser.formatedName);
        //$state.go('app.nearbyContacts');
        //$scope.goBack();
    };
    $scope.selectRangeAge = function() {
        $scope.iRangeAge = angular.copy($scope.settings);
        var selectRangeAge = $ionicPopup.confirm({
            title: 'Select age',
            templateUrl: 'templates/chat/contacts/select-range-age.html',
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
        Animate.loadStrt(2000);
        $scope.nearby = new Array;
        var currentYear = new Date().getFullYear();
        $scope.invitationSend={};
        $scope.contactsRecommendedSend = ContactsRecommendedSend( $rootScope.loggedInUser.uid).get();
        $scope.contactsRecommendedSend.$loaded(function(){
            $scope.myFriend = Contacts($rootScope.loggedInUser.uid).getFriend();
            //$scope.myFriend = Contacts($localStorage.userLogin.id).getFriend();
            $scope.myFriend.$loaded(function(){
                $scope.myFriend = Object.keys($scope.myFriend);
                //$scope.iNearby = User().filter($scope.settings.gender);
                $scope.iNearby = User().filterByName($scope.selectedName );
                //                      data.coproPosts.splice(posts.indexOf(old), 1);

                $scope.iNearby.$loaded(function(){ 
                    var userYear;
                    angular.forEach($scope.iNearby, function(value){
                        var isInvited = $scope.contactsRecommendedSend.$indexFor(value.$id);
                        //  var b = $scope.contactsRecommendedSend.$keyAt(value.$id);
                        //  console.log('var', a,b,value.$id);
                        value.isInvited=true;
                        User(value.$id).getPostalCode().$loaded(function(data){
                            data.$loaded(function(){
                                //alert('data'+data.$value);
                                var id = data.$value;
                                var immeuble = firebase.database().ref('immeubles/'+id);
                                var cp = immeuble.child('cp');
                                var cpObj = $firebaseObject(cp);
                                cpObj.$loaded(function(){
                                    //alert('cpObj'+cpObj.$value);
                                    value.details = cpObj;
                                    return cpObj;
                                });
                                return cpObj;

                            });

                            /*
                            data.$loaded(function(details){
                                alert(details.$value);
                                value.details = details;//User(value.$id).getPostalCode();

                            });
*/
                        });

                        //   value.details=true;

                        if(isInvited==-1){
                            value.isInvited=false;

                        }
                        // value.birthday = '02/02/1987';
                        //value.age = currentYear - Number(value.birthday.split('/')[2]);
                        //if(value.age >= $scope.settings.fromage && value.age <= $scope.settings.toage && $scope.myFriend.indexOf(value.$id) == -1)
                        if(value.$id !== $localStorage.userLogin.id){
                            $scope.nearby.push(value);

                        }
                    });
                    self.states        = loadAll();
                });
                Animate.loadEnd();
            });
        });
    };
    $scope.updateNearby();
});


appControllers.controller('tabCtrl', function($scope, $localStorage, Notification,$rootScope, Animate){
    $localStorage.userLogin = $scope.currentUser;

    $scope.notification = Notification($scope.currentUser.uid).get();
    $rootScope.hideTabs = false;
});


appControllers.controller('groupCtrl', function($scope, $http, $state, IonicClosePopupService, UserGroups, Groups, User, $ionicPopup, $localStorage, Animate, Confirm){    
    Animate.loadStrt(5000);
     

    $scope.groups = UserGroups($localStorage.userLogin.id).get();
    $scope.groups.$loaded(function(){
          UserGroups($localStorage.userLogin.id).loadGroups($scope.groups).then(function(res){
            $scope.groups = res;
            Animate.loadEnd();
          });
    });
    
    $scope.showPopupMenuGroup = function(id,nameGroup,title) {
        if(nameGroup && angular.isString(nameGroup)) var name = nameGroup;
        else {
            var name = '';
            for(var i=0; i<=2; i++){
                if(title[i].$value) name += title[i].$value + ', ';
            }
        }
        var popupMenuGroup = $ionicPopup.show({
            title: name,
            cssClass: 'popup-menu-group',
            scope: null,
            buttons: [
                { text: 'Quitter ce groupe',type: 'button-clear',onTap: function(e){$scope.confirmLeave(id)} },
                { text: 'Changer le nom du groupe',type: 'button-clear',onTap: function(e){$scope.changeName(id)} },
                { text: 'Ajouter un utilisateur',type: 'button-clear',onTap: function(e){$state.go('addGroup',{id:id});} },
                { text: 'Voir les membres du groupe',type: 'button-clear',onTap: function(e){$state.go('viewGroup',{id:id});} },
            ]
        });
        IonicClosePopupService.register(popupMenuGroup);
    };
    
    $scope.giveName = function(groupId, scopeDataName) {
        Groups(groupId).changeName(scopeDataName);
    }
    
    $scope.data = {newName : ""};

    $scope.changeName = function(groupId){
            var template    = '<input type="text" ng-model="data.newName">';
            var title       = "Saisissez un nouveau nom pour ce groupe.";
            var subtitle    = "";
            var btn_text    = "<b>Confirmer</b>";
            //var cssClass    = "";
            Confirm.showConfirm($scope, template, title, subtitle, btn_text, false, groupId);
    }
    
    $scope.confirmLeave = function(id){
        var title    = "Quitter ce groupe supprimera la conversation de votre historique. Confirmer?";
        //var cssClass    = "popup-confirm-leave";
        var btn_txt = "Confirmer";
        var leaveGroup = function(_id) {
            Groups(_id).leave($localStorage.userLogin.id);
            UserGroups($localStorage.userLogin.id).leave(_id);
        }
               
        Confirm.confirmPopUp(leaveGroup, title, btn_txt, id);
    }

});

appControllers.controller('groupCreate', function(/*$cordovaKeyboard, */$scope, $state, Groups, UserGroups, Contacts, User, $localStorage, $filter, Animate) {
    $scope.$on( "$ionicView.loaded", function() {
        /*if (window.cordova) {
            $cordovaKeyboard.disableScroll(false);
        }*/
    });    
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
        if($scope.selectedCount > 0){
            $scope.last = Groups().getLast();
            $scope.last.$loaded(function(value){
                //console.log("scope",$scope.last,$scope,value); 
                // $scope.last = Number($scope.last.$value) + 1;
                $scope.last = $scope.last.$value + 1;
                // console.log("scope",$scope.last,$scope); 
                //return;
                Groups().create($scope.last,$localStorage.userLogin.id,$scope.selectedCount,$scope.contactsSelected,$scope.nameGroup);
                UserGroups().post($localStorage.userLogin.id,$scope.contactsSelected,$scope.last);
                $state.go('groupDetail', {id:$scope.last});
            });
        }
    };
});

appControllers.controller('groupAdd', function($scope, $stateParams, $state, Groups, UserGroups, Contacts, User, $localStorage, $filter, Animate){
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
                if (lastName == nowName) return false;
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

    $scope.addGroup = function(){
        if($scope.selectedCount > 0){
            Groups($stateParams.id).add($scope.contactsSelected,$scope.selectedCount);
            UserGroups().add($stateParams.id,$scope.contactsSelected);
            $state.go('app.messages');
        }
    };
});

appControllers.controller('groupView', function($scope, $stateParams, Groups, User, $filter, Animate){
    Animate.loadStrt(5000);
    $scope.name = Groups($stateParams.id).getName();
    $scope.count = Groups($stateParams.id).getNumUser();
    $scope.contacts = Groups($stateParams.id).getUser();
    $scope.contacts.$loaded(function(){
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
        Animate.loadEnd();
    });
});

appControllers.controller('messagesDetail', function(/*$cordovaKeyboard, */$scope, $ionicScrollDelegate, $ionicTabsDelegate, $ionicSideMenuDelegate, $timeout, $ionicPopup, IonicClosePopupService, Notification, Block, Messages, Camera, DetailMessages, User, $localStorage, $state, $stateParams, Location, Animate, $ionicActionSheet, Utilities, PopupService, $mdBottomSheet, $ionicPopup){
    $scope.showGroupBottomSheet = function (event, contractForm) {
        $mdBottomSheet.show({
            templateUrl: 'group-actions-modal.html',
            targetEvent: event,
            scope: $scope.$new(false)
        });
    };

    $scope.isIOS = ionic.Platform.isIOS();

    $scope.$on( "$ionicView.loaded", function() {
        $scope.inputText = {};
        $scope.inputSticker = {};
        $scope.inputPicture = {}; 
        $scope.rowsInputMsg = 1; 
        $scope.testKeyboard = 0;
    });
    
    function keyboardShowHandler(e){
        //alert('Keyboard height is: ' + e.keyboardHeight);
        $scope.bottom_ = ($scope.isIOS) ? "-1px" : "7px";
        if ($scope.isIOS) {
            $scope.footerBarHeight = String(5+2.5*$scope.rowsInputMsg)+"%";
        } else {
            $scope.footerBarHeight = String(10+2.5*$scope.rowsInputMsg*1.4)+"%"; 
        } 
    }

    function keyboardHideHandler(e){
        $scope.bottom_ = 0;
        $scope.footerBarHeight = "7.5%";
    }
    if (!$scope.isIOS) {
        $scope.viewUp = function(){
            $scope.bottom_ = "7px";
            //$scope.footerBarHeight = "12.5%";
            $scope.footerBarHeight = String(10+2.5*$scope.rowsInputMsg*1.4)+"%";
        }
        $scope.viewDown = function(){
            $scope.bottom_ = 0;
            $scope.footerBarHeight = "7.5%";
        }
    }
    
   

    if (window.cordova) {
        window.addEventListener('native.keyboardshow', keyboardShowHandler);
        window.addEventListener('native.keyboardhide', keyboardHideHandler);
    }

    $timeout(function(){
        $ionicScrollDelegate.scrollBottom();   
    },1000);
    
    
    var screenWidth = window.screen.width;
    var screenHeight = window.screen.height;
    var rowLength = screenWidth/12.5;
    var coefHeight;
    if (screenHeight > 1000 && screenHeight < 1200)  {
        coefHeight = 1.3;
        $scope.margin_top = "0.8em";
    } else if (screenHeight > 1200) {
        $scope.margin_top = "2em";
        coefHeight = 1;
    } else {
        coefHeight = 2.5;
        $scope.margin_top = "0";
    }    
    //$scope.marginTop = 0;
    
    $scope.footerBarHeight = "7.5%";

    $scope.heightContent = $('#contentOfMessages').css('height');

    $scope.adjustInputHeight = function() {
        if (!$scope.inputText.content) {
            $scope.text = false;
            $scope.rowsInputMsg = 1;
            //$scope.bottom_ = "0px";
        } else {
            $scope.picture = false; $scope.text = true; $scope.sticker = false;
            $scope.rowsInputMsg = Math.ceil($scope.inputText.content.length/rowLength);
            if ($scope.rowsInputMsg > 10) $scope.rowsInputMsg = 10; 
            /*if (!isIOS) {
                if (screenHeight < 640) {
                    $scope.bottom_ = 45;
                } else if (screenHeight < 730){
                    $scope.bottom_ = 39;
                } else if (screenHeight < 850) {
                    $scope.bottom_ = 37;
                } else if (screenHeight < 965) {
                    $scope.bottom_ = 35;
                } else {
                    $scope.bottom_ = 31;
                }
            }*/    
            /*if (!isIOS) $scope.marginTop -= 15;     
            */
            //$scope.picture = false; $scope.text = true; $scope.sticker = false;
            //$scope.rowsInputMsg = Math.ceil($scope.inputText.content.length/(rowLength*1.3));
        }
        if ($scope.isIOS) {
            $scope.footerBarHeight = String(5+coefHeight*$scope.rowsInputMsg)+"%";
        } else {
            $scope.footerBarHeight = String(10+coefHeight*$scope.rowsInputMsg*1.4)+"%"; 
        }    
        
        //$scope.footerBarHeight = 2.75+$scope.rowsInputMsg*1.3+"%";
    }


    var i = 0;
    $(window).click(function() {
        i ++;
        $timeout(function() {
            if($('#emoticons').is(':visible') && i > 2) {
                $scope.sticker = false;
                i = 0;
            }else if (i > 2){
                i = 0;
            }

        }, 100);                
    });  
    /*if($scope.isIOS == true) {
        $scope.contentMarginTop = 'margin-top:-15%;'
    }*/
    Animate.loadStrt(5000);
    $scope.Unread = Messages($localStorage.userLogin.id).getUnread($stateParams.id);
    $scope.Unread.$loaded(function(){
        if($scope.Unread.$value > 0){
            Notification($localStorage.userLogin.id).update($scope.Unread.$value);
            Messages($localStorage.userLogin.id).reset($stateParams.id);
        }
    });
    var onNewMessage = firebase.database().ref('detailMessages/'+$localStorage.userLogin.id).child($stateParams.id);
    onNewMessage.on('value', function(){ $ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom(); });
    $scope.Detail = DetailMessages($localStorage.userLogin.id).get($stateParams.id);
    $scope.Me = {};
    $scope.Me.name = User($localStorage.userLogin.id).getName();
    $scope.Me.avatar = User($localStorage.userLogin.id).getAvatar();
    $scope.Friend = User($stateParams.id).get();
    $scope.$watch(function () {
        return $ionicSideMenuDelegate.getOpenRatio();
    },
    function (right) {
        if (right === -1) $scope.menuRightActived= true;
        else $scope.menuRightActived = false;
    });
    $scope.menuRightActive = function () {
        $ionicSideMenuDelegate.toggleRight(false);
    }
    
    $scope.showPopupMenuMessages = function(type,title,id) {
        $scope.deleteConversation = false;
        if(type != "text") title = "Choisissez une action";
        var popupMenuMessages = $ionicPopup.show({
            title: '"'+title+'"',
            cssClass: 'popup-menu-messages',
            scope: $scope,
            buttons: [
                { text: 'Copier',type: 'button-clear' },
                {
                    text: 'Supprimer',type: 'button-clear',
                    onTap: function(e){
                        DetailMessages($localStorage.userLogin.id).delete($stateParams.id,id);
                    }
                },
            ]
        });
        IonicClosePopupService.register(popupMenuMessages);
    }

    $scope.Block = Block($localStorage.userLogin.id).get($stateParams.id);
    $scope.Block.$loaded(function(){
        

        Animate.loadEnd();
        $ionicScrollDelegate.scrollBottom();
    });
    $scope.messageInput = function(option){
        if(option == "text") $scope.contentBottom = '100px';
        else $scope.contentBottom = '220px';
    };

    $scope.sendText = function(){
        if(angular.isDefined($scope.inputText.content) && angular.isString($scope.inputText.content)){
            $scope.inputText.from = 0;
            $scope.inputText.type = "text";
            var now = new Date().getTime();
            $scope.inputText.time = now;
            DetailMessages($localStorage.userLogin.id).post($stateParams.id,$scope.inputText);
            $scope.Messages = {};
            $scope.Messages.content = $scope.inputText.content;
            $scope.Messages.time = $scope.inputText.time;
            $scope.Messages.unread = 0;
            $scope.Messages.type = "text";
            Messages($localStorage.userLogin.id).post($stateParams.id, $scope.Messages, $scope.currentUser.formatedName);
            Notification().post($stateParams.id);
            $scope.rowsInputMsg = 1;
            $scope.inputText = {};
            $scope.text = false;
        }
    };

    $scope.sendSticker = function(sticker){
        if(angular.isDefined(sticker) && angular.isNumber(sticker)){
            var now = new Date().getTime();
            $scope.inputSticker.time = now;
            $scope.inputSticker.content = sticker;
            $scope.inputSticker.from = 0;
            $scope.inputSticker.type = 'sticker';
            DetailMessages($localStorage.userLogin.id).post($stateParams.id,$scope.inputSticker);
            $scope.Messages = {}; 
            
            $scope.Messages.content = "[sticker]";
            $scope.Messages.time = $scope.inputSticker.time;
            $scope.Messages.unread = 0;
            Messages($localStorage.userLogin.id).post($stateParams.id, $scope.Messages, $scope.currentUser.formatedName);
            Notification().post($stateParams.id);
            $scope.sticker = false;
        }
    };

    if(!ionic.Platform.isIOS()) { 
        var actionSheetClass = 'none-Ios-ActionSheet' 
    }else { 
        var actionSheetClass = ''; 
    } 

    $scope.takePhotoActionSheet = function() {
        var hideSheet = $ionicActionSheet.show({ 
            cssClass: actionSheetClass, 
            buttons: [ 
                { text: 'Choisir photo existante' }, 
                { text: 'Prendre une nouvelle photo' },
                { text: 'Choisir une émoticône' } 
            ], 
            cancelText: 'Cancel', 
            cancel: function() { 

            }, 
            buttonClicked: function(index) { 
                if (index < 2) {
                    $scope.takePicture(index); 
                    return true; 
                }else{
                    i = 1;
                    $scope.picture = false; $scope.text = false; $scope.sticker = true;
                    return true; 
                }

            } 
        }); 
    }; 

    $scope.takePicture = function(index){
        //$ionicTabsDelegate.select(1);
        try {
            Utilities.takePicture(index, false, true, false).then(function(result){
                $scope.picture = true; $scope.text = false; $scope.sticker = false;
                $scope.inputPicture.content = "data:image/jpeg;base64,"+result;
                $timeout(function() {
                    Utilities.readURL(result, '#img');
                }, 1000);
            }), function(error){
                console.log(error);
            };
        } catch (e) {
            console.log(e);
        }
    }
    $scope.sendPicture = function(){
        if(angular.isDefined($scope.inputPicture.content)){
            var now = new Date().getTime();
            $scope.inputPicture.time = now;
            $scope.inputPicture.from = 0;
            $scope.inputPicture.type = "picture";
            DetailMessages($localStorage.userLogin.id).post($stateParams.id,$scope.inputPicture);
            $scope.Messages = {};
            $scope.Messages.content = "image";
            $scope.Messages.time = $scope.inputPicture.time;
            $scope.Messages.unread = 0;
            Messages($localStorage.userLogin.id).post($stateParams.id,$scope.Messages, $scope.currentUser.formatedName);
            Notification().post($stateParams.id);

            $scope.picture = false;
        } else {
            $scope.takePicture();
        }    
    };
    
    $scope.inputSticker = {"from":0,"type":"sticker"};

    $scope.showSendLocation = function(){
        $state.go('sendLocation',{id:$stateParams.id});
    };

    $scope.blockPerson = function() {
        /*if(!$scope.Block.$value){
            Block($localStorage.userLogin.id).remove($stateParams.id);
        } else {*/
            var confirmPopup = $ionicPopup.confirm({
                template: 'Cette personne ne pourra plus vous envoyer de message. Confirmez-vous votre action?',
                cssClass: 'popup-confirm-delete',
                buttons: [
                    {
                        text: 'Non',
                        type: 'button-clear',
                        onTap: function(e){ $scope.Block.$value = false }
                    },
                    {
                        text: 'Oui',
                        type: 'button-clear button-no-delete',
                        onTap: function(e){
                            Block($localStorage.userLogin.id).block($stateParams.id);
                            $state.go('app.contactsList');
                        }
                    },
                ]
            });
        //}
        $mdBottomSheet.hide();
    };

    $scope.clearHistory = function() {
        $mdBottomSheet.hide();
        var confirmPopup = $ionicPopup.confirm({
            template: "Souhaitez-vous effacer l'historique de conversation avec cette personne?",
            cssClass: 'popup-confirm-delete',
            buttons: [
                {
                    text: 'NO',
                    type: 'button-clear button-no-delete'
                },
                {
                    text: 'YES',
                    type: 'button-clear',
                    onTap: function(e){
                        DetailMessages($localStorage.userLogin.id).clear($stateParams.id);
                        Messages($localStorage.userLogin.id).clear($stateParams.id);
                    }
                },
            ]
        });
    };
});

appControllers.controller('messagesCtrl', function($scope, $ionicPopup, $rootScope, Messages, User, $state, $localStorage, Animate) {
    $scope.checkProfiles = User($localStorage.userLogin.id).get();
    
    $scope.checkProfiles.$loaded(function(){
        if(angular.isDefined($scope.checkProfiles.$value)) $state.go("editInfomation");
        else User($localStorage.userLogin.id).update();
    });
    Animate.loadStrt(5000);
    
    $scope.all = [];
    
    /*
    function onMessagesChange(scopeElement, strToWatch1, strToWatch2){
        for (var i = 0, length = scopeElement.length; i < length; i ++) {  
            //console.log(strToWatch1, i); 
            $scope.$watch(strToWatch1+i+strToWatch2, function(newVal, oldVal){
                if (scopeElement == $scope.messages) {console.log(newVal, oldVal)};
                if(oldVal != newVal) {
                    $state.reload();   
                }
            });
        }    
    }
    */
    $scope.messages = Messages($localStorage.userLogin.id).get();

    $scope.initChat = function (groups) { 
        
        $scope.messages.$loaded(function () {
            //$scope.groups = UserGroups($localStorage.userLogin.id).get();
            
            groups.$loaded(function () {
                $scope.groups = groups;
                //onMessagesChange($scope.groups, 'groups[', '].lastMessage.content');
                angular.forEach(groups, function(value, key){  
                    
                    value.type = 'isGroup';
                    //value.content = value.lastMessage.content;
                    $scope.all.push(value);
                   
                    $scope.$watch("all["+$scope.all.indexOf(value)+"].content", function(oldVal, newVal) {
                        console.log(newVal, oldVal);
                        if(oldVal != newVal) {
                            $state.reload();   
                        }
                    });
                    
                });
                //onMessagesChange($scope.messages, 'messages[', '].content');
                angular.forEach($scope.messages, function(value){
                    value.type = 'isMessage';
                    $scope.all.push(value);
                    $scope.$watch("all["+$scope.all.indexOf(value)+"].content", function(oldVal, newVal) {
                        if(oldVal != newVal) {
                            $state.reload();   
                        }
                    });
                    
                });
                
                /*for (var i = 0, length = $scope.all.length; i < length; i++) {
                    $scope.$watch("all["+i+"].content", function(oldVal, newVal) {
                        console.log($scope.all);
                        if(oldVal != newVal) {
                            $state.reload();   
                        }
                    });    
                }*/      
            });    
        });
    };

    //$scope.initChat();

    var counter = 2;

    /*$scope.groups = UserGroups($localStorage.userLogin.id).get();
    $scope.groups.$loaded(function(){
        console.log($scope.groups);
        onMessagesChange($scope.groups, 'groups[', '].lastMessage.content');
    });*/
    
    $scope.messages.$loaded(function(){
        $scope.loadMessage = function(){   
            angular.forEach($scope.messages, function(value, key){  
                //console.log(value, key); 
                value.name = User(value.$id).getFormatedName();
                value.avatar = User(value.$id).getAvatar();
            });

        }

        var watch = firebase.database().ref('messages').child($localStorage.userLogin.id);
        watch.on('value', function(e){ 
            counter ++;
            if(counter >= 3) {
                counter = 0;
                $scope.loadMessage();
            }     
        });
        
        Animate.loadEnd();
       
        $scope.$watch('messages.length', function(newVal, oldVal){
            if(oldVal != newVal) {
                $state.reload();   
            }
        });
    });


    $scope.message = {};
    $scope.choseMessagesCount = 0;
    
    $scope.choseMessage = function(message){
        if (message.selected) {
            $scope.choseMessagesCount++
        } else {
            $scope.choseMessagesCount--
        }
        if($scope.choseMessagesCount == 0) $rootScope.hideTabs = false;
        else $rootScope.hideTabs = true;
    };
    
    $scope.cancelChoseMessages = function () {
        angular.forEach($scope.messages, function(value){
            delete value.selected;
        });
        $scope.choseMessagesCount = 0;
        $rootScope.hideTabs = false;
    };

    $scope.deleteMessages = function() {
        var confirmPopup = $ionicPopup.confirm({
            template: 'Supprimez les messages sélectionnés?',
            cssClass: 'popup-confirm-delete',
            buttons: [
                {
                    text: 'Non',
                    type: 'button-clear button-no-delete'
                },
                {
                    text: 'Effacer',
                    type: 'button-clear',
                    onTap: function(e){
                        angular.forEach($scope.messages, function(value){
                            if(value.selected){ Messages($localStorage.userLogin.id).delete(value.$id,value.unread) }
                        });
                        location.reload();
                    }
                }
            ]
        });
    };
});

appControllers.controller('messagesCall', function($scope, $ionicModal, $timeout){
    $scope.callStatus = "Calling";
    $scope.callTime = {};
    $scope.callTime = {"minute":0,"second":0};
    $scope.call = {};
    $scope.call.recount = 0;
    $scope.call.size = 140;
    $scope.call.spacing = 20;
    $scope.call.margin = -70;
    $scope.call.top = -40;
    $scope.changeBackground = function(){
        if($scope.call.size >= 300) {
            $scope.call.size = 140;
            $scope.call.spacing = 20;
            $scope.call.margin = -70;
            $scope.call.top = -40;
            $scope.call.recount++;
        } else {
            $scope.call.size += 40;
            $scope.call.spacing += 10;
            $scope.call.margin -= 20;
            $scope.call.top -= 20;
        }
        if($scope.call.recount >= 2) $scope.callStatus = "Ringing...";
        if($scope.call.recount >= 3) {
            $scope.callStatus = "Quality:";
            $scope.callListing = true;
        }
        if($scope.callStatus == "Quality:"){
            $scope.callTime.second++;
            if($scope.callTime.second >= 60){
                $scope.callTime.minute++;
                $scope.callTime.second = 0;
            }
        }
        $scope.autoChange = $timeout(function(){$scope.changeBackground();}, 1000);	
    }
    $scope.changeBackground();
    $ionicModal.fromTemplateUrl('templates/chat/messages/call.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalmessagesCall = modal;
    });
    $scope.showMessagesCall = function() {
        $scope.modalmessagesCall.show();
    };
    $scope.closeMessagesCall = function() {
        $scope.modalmessagesCall.hide();
        location.reload();
    };
});
appControllers.controller('groupDetail', function(/*$cordovaKeyboard, */UserGroups, Confirm, PopupService, $scope, $state, $localStorage, $ionicModal, $ionicTabsDelegate, $timeout, $ionicScrollDelegate, User, Groups, DetailGroups, Camera, $stateParams, Location, Animate, $ionicActionSheet, Utilities,$mdBottomSheet){
    
    $scope.isIOS = ionic.Platform.isIOS();
    $scope.$on( "$ionicView.loaded", function() {
        $scope.inputText = {};
        $scope.inputSticker = {};
        $scope.inputPicture = {}; 
        $scope.rowsInputMsg = 1; 
    });
    
    function keyboardShowHandler(e){
        //alert('Keyboard height is: ' + e.keyboardHeight);
        $scope.bottom_ = ($scope.isIOS) ? "-1px" : "7px";
        if ($scope.isIOS) {
            $scope.footerBarHeight = String(5+2.5*$scope.rowsInputMsg)+"%";
        } else {
            $scope.footerBarHeight = String(10+2.5*$scope.rowsInputMsg*1.4)+"%"; 
        } 
    }

    function keyboardHideHandler(e){
        $scope.bottom_ = 0;
        $scope.footerBarHeight = "7.5%";
    }
    
    if (!$scope.isIOS) {
        $scope.viewUp = function(){
            $scope.bottom_ = "7px";
            //$scope.footerBarHeight = "12.5%";
            $scope.footerBarHeight = String(10+2.5*$scope.rowsInputMsg*1.4)+"%";
        }
        $scope.viewDown = function(){
            $scope.bottom_ = 0;
            $scope.footerBarHeight = "7.5%";
        }
    }


   if (window.cordova) {
        window.addEventListener('native.keyboardshow', keyboardShowHandler);
        window.addEventListener('native.keyboardhide', keyboardHideHandler);
    }

    $timeout(function(){
        $ionicScrollDelegate.scrollBottom();   
    },1000);
    
    
    var screenWidth = window.screen.width;
    var screenHeight = window.screen.height;
    var rowLength = screenWidth/12.5;
    //$scope.bottom_ = 0;
    var coefHeight;
    if (screenHeight > 1000 && screenHeight < 1200)  {
        coefHeight = 1.3;
        $scope.margin_top = "0.8em";
    } else if (screenHeight > 1200) {
        $scope.margin_top = "2em";
        coefHeight = 1;
    } else {
        coefHeight = 2.5;
        $scope.margin_top = "0";
    }    

    //$scope.marginTop = 0;
    $scope.footerBarHeight = "7.5%";

    $scope.heightContent = $('#contentOfMessages').css('height');

    $scope.adjustInputHeight = function() {
        if (!$scope.inputText.content) {
            $scope.text = false;
            $scope.rowsInputMsg = 1;
            $scope.bottom_ = 0;
        } else {
            $scope.picture = false; $scope.text = true; $scope.sticker = false;
            $scope.rowsInputMsg = Math.ceil($scope.inputText.content.length/rowLength);
            if ($scope.rowsInputMsg > 10) $scope.rowsInputMsg = 10; 
            /*if (!isIOS) {
                if (screenHeight < 640) {
                    $scope.bottom_ = 45;
                } else if (screenHeight < 730){
                    $scope.bottom_ = 39;
                } else if (screenHeight < 850) {
                    $scope.bottom_ = 37;
                } else if (screenHeight < 965) {
                    $scope.bottom_ = 35;
                } else {
                    $scope.bottom_ = 31;
                }
            }*/    
            /*if (!isIOS) $scope.marginTop -= 15;     
            */
            //$scope.picture = false; $scope.text = true; $scope.sticker = false;
            //$scope.rowsInputMsg = Math.ceil($scope.inputText.content.length/(rowLength*1.3));
        }

        if ($scope.isIOS) {
            $scope.footerBarHeight = String(5+coefHeight*$scope.rowsInputMsg)+"%";
        } else {
            $scope.footerBarHeight = String(10+coefHeight*$scope.rowsInputMsg*1.4)+"%"; 
        }
        //$scope.footerBarHeight = 2.75+$scope.rowsInputMsg*1.3+"%";
    }

    var str = "";
    //Animate.loadStrt(5000);
    $scope.Me = $localStorage.userLogin.id;
    $scope.Groups = {};
    var users_oneSignalId = [];
    $scope.Groups.nameGroup = Groups($stateParams.id).getName();
    $scope.Groups.countUser = Groups($stateParams.id).getNumUser();
    $scope.Groups.lastDate = Groups($stateParams.id).getLastDate();
    $scope.Groups.user = Groups($stateParams.id).getUser();
    $scope.Groups.user.$loaded(function(){
        $scope.Groups.name = {};
        $scope.Groups.avatar = {};
        angular.forEach($scope.Groups.user, function(item){
            $scope.Groups.name[item.$id] = User(item.$id).getFormatedName();
            $scope.Groups.avatar[item.$id] = User(item.$id).getAvatar();
            if (item.$id !== $scope.Me) {
                User(item.$id).getOneSignalId().then(function(res){
                    users_oneSignalId.push(res);
                }), function(error) {
                    //alert(error);
                };
            } 
        });
    });
    $scope.Detail = DetailGroups($stateParams.id).get();

    /*  */
    var onNewMessage = firebase.database().ref('detailGroups').child($stateParams.id);
    onNewMessage.on('value', function(){ $ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom(); });

    $scope.messageInput = function(option){
        if(option == "text") $scope.contentBottom = '200px';
        else $scope.contentBottom = '220px';
    };

    $scope.sendText = function(){
        if(angular.isDefined($scope.inputText.content) && angular.isString($scope.inputText.content) && $scope.inputText.content.length > 0){
            var now = new Date().getTime();
            $scope.inputText.time = now;
            $scope.inputText.from = $scope.Me;
            $scope.inputText.type = "text";
            DetailGroups($stateParams.id).post($scope.inputText, users_oneSignalId, $scope.currentUser.formatedName);
            $scope.rowsInputMsg = 1;
            $scope.inputText = {};
            $scope.text = false;
        }
    };
    
    $scope.giveName = function(groupId, scopeDataName) {
        Groups(groupId).changeName(scopeDataName);
    }
    
    $scope.data = {newName : ""};

    $scope.confirmNewName = function(){
        $mdBottomSheet.hide();
        var template    = '<input type="text" ng-model="data.newName">';
        var title       = "Saisissez un nouveau nom pour ce groupe.";
        var subtitle    = "";
        var btn_text    = "<b>Confirmer</b>";
        Confirm.showConfirm($scope, template, title, subtitle, btn_text, false, $scope.Groups.lastDate.$id);

    }
    
    $scope.confirmLeave = function(){
        $mdBottomSheet.hide();
        var title    = "Quitter ce groupe supprimera la conversation de votre historique. Confirmer?";
        //var cssClass    = "popup-confirm-leave";
        var btn_txt = "Confirmer";
        var leaveGroup = function(_id) {
            Groups(_id).leave($localStorage.userLogin.id);
            UserGroups($localStorage.userLogin.id).leave(_id);
            $state.go('app.messages');
        }        
        Confirm.confirmPopUp(leaveGroup, title, btn_txt, $stateParams.id);
    }
    
    $scope.takePicture = function(index){
        //$ionicTabsDelegate.select(1);
        try {
            Utilities.takePicture(index, false, true, false).then(function(result){
                $scope.picture = true; $scope.text = false; $scope.sticker = false;
                $scope.inputPicture.content = "data:image/jpeg;base64,"+result;
                $timeout(function() {
                    Utilities.readURL(result, '#img');
                }, 1000);
            }), function(error){
                console.log(error);
            };
        } catch (e){
            console.log(e);
        }
    }          

    $scope.sendPicture = function(){
        if(angular.isDefined($scope.inputPicture.content)){
            var now = new Date().getTime();
            $scope.inputPicture.time = now;
            $scope.inputPicture.from = $scope.Me;
            $scope.inputPicture.type = "picture";
            DetailGroups($stateParams.id).post($scope.inputPicture, users_oneSignalId, $scope.currentUser.formatedName);
            $scope.picture = false;
        } else $scope.takePicture();
    };

    var i = 0;

    $(window).click(function() {
        i ++;
        $timeout(function() {
            if($('#emoticons').is(':visible') && i > 2) {
                $scope.sticker = false;
                i = 0;
            }else if (i > 2){
                i = 0;
            }
        }, 100);                
    });    
    $scope.sendSticker = function(sticker){
        if(angular.isDefined(sticker) && angular.isNumber(sticker)){
            var now = new Date().getTime();
            $scope.inputSticker = {};
            $scope.inputSticker.time = now;
            $scope.inputSticker.from = $scope.Me;
            $scope.inputSticker.content = sticker;
            $scope.inputSticker.type = 'sticker';
            DetailGroups($stateParams.id).post($scope.inputSticker, users_oneSignalId, $scope.currentUser.formatedName);
            $scope.sticker = false;
        }
    };
    
    // contractForm(object) = contract object that presenting on the view.
    $scope.showGroupBottomSheet = function ($event, contractForm) {
        //$scope.disableSaveBtn = $scope.validateRequiredField(contractForm);
        $mdBottomSheet.show({
            templateUrl: 'group-actions-modal.html',
            targetEvent: $event,
            scope: $scope.$new(false),
        });
    };// End showing the bottom sheet.

    var actionSheetClass = '';
    if(!$scope.isIOS) actionSheetClass = 'none-Ios-ActionSheet' ;

    $scope.takePhotoActionSheet = function() {
        var hideSheet = $ionicActionSheet.show({ 
            cssClass: actionSheetClass, 
            buttons: [ 
                { text: 'Choisir photo existante' }, 
                { text: 'Prendre une nouvelle photo' },
                { text: 'Choisir une émoticône' } 
            ], 
            cancelText: 'Cancel', 
            cancel: function() { 

            }, 
            buttonClicked: function(index) { 
                if (index < 2) {
                    $scope.takePicture(index); 
                    return true; 
                }else{
                    i = 1;
                    $scope.picture = false; $scope.text = false; $scope.sticker = true;
                    return true; 
                }
            } 
        }); 
    }; 
});