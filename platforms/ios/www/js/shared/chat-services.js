//angular.module('starter.services', ['firebase'])

appServices.factory("Areacode", function($firebaseArray) {
    var item = firebase.database().ref('areacode');
    return $firebaseArray(item);
});

appServices.factory("Login", function($firebaseObject) {
    return function(){
        var item = firebase.database().ref('login');
        return {
            get: function(phone){
                item = item.child(phone);
                return $firebaseObject(item)
            },
            getId: function(phone){
                item = item.child(phone+'/id');
                return $firebaseObject(item);
            },
            getEmail: function(email){
                item = item.orderByChild('email/value').equalTo(email);
                return $firebaseObject(item);
            },
            set: function(phone){
                item = item.child('maxID');
                maxID = $firebaseObject(item);
                maxID.$loaded(function(){
                    userID = maxID.$value +1;
                    var user = firebase.database().ref('login').child(phone);
                    user.child('id').set(userID);
                    item.set(userID);
                });
            },
            changePass: function(phone,pass){
                item.child(phone+'/password').set(pass);
            }
        }
    }
});

appServices.factory("User", function($firebaseObject, $firebaseArray, DataService) {
    return function(id){
        var item = firebase.database().ref('users/'+id);
        return {
            get: function(){ return $firebaseObject(item) },
            set: function(data){ item.set(data); },
            getAvatar: function(){
                item = item.child('imageUrl');
                return $firebaseObject(item)
            },
            getOneSignalId: function() {
                return new Promise(function(resolve, reject){
                    var ref = "users/"+id+"/oneSignalId";
                    DataService.getElement(ref).then(function(res){
                        var oneSignalId = res;
                        resolve(oneSignalId); 
                    }), function(error) {
                        //alert("l.58",error);
                    }    
                }).catch(function(e){
                    //alert(e);
                });
            },
            getName: function(){
                item = item.child('name');
                return $firebaseObject(item)
            },
            getFirstName: function(){
                item = item.child('firstName');
                return $firebaseObject(item)
            },
            getFormatedName: function(){
                item = item.child('formatedName');
                return $firebaseObject(item)
            },
            getPhone: function(){
                item = item.child('phone');
                return $firebaseObject(item)
            },
            getPostalCode: function(){
                var data = $firebaseObject(item.child('immeuble'));
                return data;
                // 
                //return $firebaseObject(item)
            },
            getAddress: function() {
                var address = $firebaseObject(item.child('fullAddress'));
                return address;
            },
            getLastSign: function(){
                item = item.child('lastSign');
                return $firebaseObject(item)
            },
            editAvatar: function(avatar){
                item = item.child('avatar').set(avatar);
            },
            editName: function(name){
                item.child('name').set(name);
            },
            editPhone: function(phone){
                item.child('phone').set(phone);
            },
            editGender: function(gender){
                item.child('gender').set(gender);
            },
            update: function(){
                var now = new Date().getTime();
                item.child('lastSign').set(now);
            },
            filter: function(gender){
                var filter = firebase.database().ref('users');
                console.log('gen',gender);
                if(gender != 'All') filter = filter.orderByChild('gender').equalTo(gender);
                return $firebaseArray(filter);
            },
            filterByName: function(name){
                var filter = firebase.database().ref('users');
                console.log('name',name);
                if( angular.isDefined(name)  && name != '') filter = filter.orderByChild('formatedName').equalTo(name);
                return $firebaseArray(filter);
            },
            filterByPhone: function(phone){
                var filter = firebase.database().ref('users');
                //console.log('phone',phone);
                //if( angular.isDefined(phone)  && phone != '') 
                filter = filter.orderByChild('phone').equalTo(phone).limitToFirst(1);
                return $firebaseArray(filter);
            },
            filterByImmeuble: function(immeuble){
                var filter = firebase.database().ref('users');
                //console.log('phone',phone);
                //if( angular.isDefined(phone)  && phone != '') .limitToFirst(1)
                filter = filter.orderByChild('immeuble').equalTo(immeuble);
                return $firebaseArray(filter);
            }
        }
    }
});

appServices.factory("Block", function($firebaseObject){
    return function(id){
        var item = firebase.database().ref('block/'+id);
        return {
            get: function(user){
                item = item.child(user);
                return $firebaseObject(item)
            },
            remove: function(user){
                item.child(user).remove();
                var friend = firebase.database().ref('block/'+user);
                friend.child(id).remove();
            },
            block: function(user){
                item.child(user).set(true);
                var friend = firebase.database().ref('block/'+user);
                friend.child(id).set(true);
            }
        }
    }
});

appServices.factory("Notification", function($firebaseObject) {
    return function(id){
        var item = firebase.database().ref('notification/'+id);
        return {
            get: function(){ return $firebaseObject(item) },
            post: function(friend){
                item = firebase.database().ref('notification/'+friend);
                var data = $firebaseObject(item.child('messagesNew'));
                data.$loaded(function(){
                    var newNotification = Number(data.$value) + 1;
                    item.child('messagesNew').set(newNotification);
                });
            },
            update: function(readed){
                var data = $firebaseObject(item.child('messagesNew'));
                data.$loaded(function(){
                    var newNotification = Number(data.$value) - readed;
                    if(angular.isNumber(data.$value) && newNotification > 0) item.child('messagesNew').set(newNotification);
                    else item.child('messagesNew').remove();
                });
            }
        }
    }
});

appServices.factory("Messages", function($firebaseArray, $firebaseObject, NotifService) {
    return function(id){
        var item = firebase.database().ref('messages/'+id);
        return {
            get: function(){ return $firebaseArray(item) },
            getUnread: function(friend){
                item = item.child(friend);
                return $firebaseObject(item.child('unread'));
            },
            post: function(friend, data, userId){
                item = item.child(friend);
                item.set(data);
                var notifTxt = (data.type === "text") ? " : "+data.content : " vous a envoyé une image.";
                notifTxt = userId + notifTxt;
                var messages = firebase.database().ref('messages/'+friend).child(id);
                messages.child('content').set(data.content);
                messages.child('time').set(data.time);
                var unread = $firebaseObject(messages.child('unread'));
                unread.$loaded(function(){
                    var newUnread = unread.$value + 1;
                    if(angular.isNumber(unread.$value)) messages.child('unread').set(newUnread);
                    else messages.child('unread').set(1);
                    NotifService.sendNotif("message", false, false, notifTxt, friend, userId).then(function(res) {
                        console.log(res);
                    }), function(error) {
                        console.log(error);
                    };
                });
            },
            delete: function(friend, unread){
                var userUnread = firebase.database().ref('notification/'+id+'/messagesNew');
                var nowUnread = $firebaseObject(userUnread);
                nowUnread.$loaded(function(){
                    if(angular.isNumber(nowUnread.$value) && nowUnread.$value >0){
                        userUnread.set(nowUnread.$value -unread)
                    }
                    item.child(friend).remove();
                    item = firebase.database().ref('detailMessages/'+id).child(friend);
                    item.remove();
                });
            },
            reset: function(friend){
                item = item.child(friend);
                item.child('unread').remove();
            },
            clear: function(friend){ item.child(friend).remove() }
        }
    }
});

appServices.factory("DetailMessages", function(PopupService, $firebaseArray, $ionicScrollDelegate) {
    return function(id){
        var item = firebase.database().ref('detailMessages/'+id);
        return {
            get: function(friend){
                item = item.child(friend);
                return $firebaseArray(item)
            },
            post: function(friend,data){
                var friends_array = [];
                friends_array.push(friend);
                try {
                    item = item.child(friend);
                    var onComplete = function(){
                        $ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom();
                    };
                    item.push().set(data, onComplete);
                    var friend = firebase.database().ref('detailMessages/'+friend).child(id);
                    data.from = 1;
                    friend.push().set(data); 
                } catch (e) {
                    console.log(e);
                }

            },
            delete: function(friend,id){
                item.child(friend+'/'+id).remove();
            },
            clear: function(friend){ item.child(friend).remove() }
        }
    }
});

appServices.factory("Contacts", function($firebaseArray, $firebaseObject) {
    return function(id){
        var item = firebase.database().ref('contacts/'+id);
        return {
            get: function(){ return $firebaseArray(item) },
            getFriend: function(){ return $firebaseObject(item) },
            post: function(friend){
                item.child(friend).set(true);
                var friend = firebase.database().ref('contacts/'+friend);
                friend.child(id).set(true);
            },
            remove: function(friend){
                item.child(friend).remove();
                var friend = firebase.database().ref('contacts/'+friend);
                friend.child(id).remove();
            }
        }
    }
});
appServices.factory("ContactsBookRecommended", function($firebaseArray, $firebaseObject) {
    return function(id){
        var item = firebase.database().ref('contactsBookRecommended/'+id);
        return {
            get: function(){
            //    item.child(id).remove();
                return $firebaseArray(item); 
            },
            getFriend: function(){ return $firebaseObject(item) },
            post: function(friend){
                item.child(friend).set(true);
                var friend = rootRef.child('contactsBookRecommended/'+friend);
                friend.child(id).set(true);
            },
            remove: function(friend){
                //alert('1');
                var friend = rootRef.child('contactsBookRecommended/'+friend);
                friend.child(id).set(false);
            }
        }
    }
});

appServices.factory("ContactsRecommended", function($firebaseArray,$firebaseObject, NotifService) {
    return function(id){
        var item = firebase.database().ref('contactsRecommended/'+id);
        return {
            get: function(){ return $firebaseArray(item) },
            post: function(friend, senderFormatedName){
                item = firebase.database().ref('contactsRecommended/'+friend);
                item.child(id).set(true);
                NotifService.sendNotif("invitation", false, false, "", friend, senderFormatedName).then(function(res){
                    console.log(res);
                }), function(error) {
                    console.log(error);
                };
            },
            isRecommended: function(friend){
                //console.log('contactsRecommended/'+friend+'/'+id);
                item = rootRef.child('contactsRecommended/'+friend+'/'+id);

                return $firebaseObject(item);
            },
            remove: function(friend){
                //alert('2');
                item.child(friend).remove();
            }
        }
    }
});
appServices.factory("ContactsRecommendedSend", function($firebaseArray) {
    return function(id){
        var item = firebase.database().ref('contactsRecommended/').orderByChild(id).equalTo(true);
        return {
            get: function(){ return $firebaseArray(item) },
            post: function(friend){
                item = firebase.database().ref('contactsRecommended/'+friend);
                item.child(id).set(true);
            },
            remove: function(friend){
                //alert('3');
                item.child(friend).remove();
            }
        }
    }
});
appServices.factory("ContactsBook", function($firebaseArray) {
    return function(id){
        var item = firebase.database().ref('contactsBook/'+id);
        return {
            get: function(){ return $firebaseArray(item) },
            set: function(data){ 
                //  item = firebase.database().ref('contactsBook/'+friend);
                item.set(data);
            },
            post: function(friend){
                console.log(friend);
                console.log(id);
                item = firebase.database().ref('contactsBook/'+friend);
                item.child(id).set(true);
            },
            addToUser: function(friend){
                console.log(friend);
                console.log(id);
                item = firebase.database().ref('contactsBook/'+id);
                item.child(friend).set(true);
            },
            remove: function(friend){
                item.child(friend).remove();
            }
        }
    }
});

appServices.factory("Abuse", function($firebaseArray,$firebaseObject, DataService) {
    return function(id){
        var item = firebase.database().ref('abuse/'+id);
        return {
            getUser: function(number){
                if(angular.isDefined(number) && angular.isNumber(number)){
                    item = item.child('users').limitToFirst(number);
                } else item = item.child('users');
                return $firebaseArray(item)
            },
            getName: function(){
                var name = item.child('name');
                return $firebaseObject(name);
            },
            getLast: function(){
                var last = firebase.database().ref('abuse').child('last');
                console.log('LAAS',last);
                return $firebaseObject(last);
            },
            getNumUser: function(){
                item = item.child('countUser');
                return $firebaseObject(item)
            },
            create: function(data, postId){
                if (!postId) {
                    var groups = firebase.database().ref('abuse');
                    var item = groups.push();
                    item.set(data);
                    return $firebaseObject(item);
                } else {
                    var updates = {};
                    var ref = '/postIts/'+ postId;
                    updates[ref +'/signalMotif'] = data.cat;
                    if (data.text) {
                        updates[ref +'/signalComment'] = data.text;
                    }
                    updates[ref +'/isSignaled'] = true;
                    updates[ref +'/signalBy'] = id;
                    return rootRef.update(updates);
                    /*
                    var ref = rootRef.child('postIts/'+postId);
                    var signalMotifRef = ref.child('signalMotif');
                    var signalCommentRef = ref.child('signalComment');
                    DataService.addCustom(signalMotifRef, data.cat);
                    DataService.addCustom(signalCommentRef, data.text);
                    */
                }
            },
            getLastDate: function(){
                var group = firebase.database().ref('abuse');
                var item = group.limitToLast(1);
                return $firebaseObject(item)
            }

        }
    }
});
appServices.factory("Groups", function($firebaseArray, $firebaseObject, DataService) {
    return function(id){
        var item = firebase.database().ref('groups/'+id);
        return {
            getUser: function(number){
                if(angular.isDefined(number) && angular.isNumber(number)){
                    item = item.child('users').limitToFirst(number);
                } else item = item.child('users');
                return $firebaseArray(item)
            },
            getName: function(){
                var name = item.child('name');
                return $firebaseObject(name);
            },
            getLast: function(){
                var last = firebase.database().ref('groups').child('last');
                console.log('LAAS',last);
                return $firebaseObject(last); 
            },
            getNumUser: function(){
                item = item.child('countUser');
                return $firebaseObject(item)
            },
            create: function(id,me,count,list,name){
                var groups = firebase.database().ref('groups');
                groups.child('last').set(id);
                groups = groups.child(id);
                groups.child('countUser').set(count+1);
                groups.child('users/'+me).set(true);
                if(name && angular.isString(name)) groups.child('name').set(name);
                angular.forEach(list, function(value,key){
                    groups.child('users/'+key).set(true);
                });
            },
            getLastDate: function(){
                var group = firebase.database().ref('detailGroups/'+id);
                var item = group.limitToLast(1);
                return $firebaseObject(item)
            },

            add: function(list,count){
                var numUser = $firebaseObject(item.child('countUser'));
                numUser.$loaded(function(){
                    item.child('countUser').set(numUser.$value + count);
                    angular.forEach(list, function(value,key){
                        item.child('users/'+key).set(true);
                    });
                });

            },
            leave: function(userid){
                item.child('user/'+userid).remove();
                var numUser = $firebaseObject(item.child('countUser'));
                numUser.$loaded(function(){
                    if(numUser.$value <= 3){
                        var user = $firebaseArray(item.child('users'));
                        var userGroups = firebase.database().ref('userGroups');
                        user.$loaded(function(){
                            angular.forEach(user, function(value){
                                userGroups.child(value.$id+'/'+id).remove();
                            });
                            item.remove();
                        });
                    }
                    item.child('countUser').set((numUser.$value)-1);
                });
            },
            changeName: function(name){
                
                item.child('name').set(name);
            }
        }
    }
});

appServices.factory("Events", function($firebaseArray, $firebaseObject) {
    return function(id){
        var item = firebase.database().ref('events/'+id);
        return {
            getUser: function(number){
                if(angular.isDefined(number) && angular.isNumber(number)){
                    item = item.child('user').limitToFirst(number);
                } else item = item.child('user');
                return $firebaseArray(item)
            },
            getName: function(){
                var name = item.child('name');
                return $firebaseObject(name);
            },
            getLast: function(){
                var last = firebase.database().ref('events').child('last');
                return $firebaseObject(last);
            },
            getNumUser: function(){
                item = item.child('countUser');
                return $firebaseObject(item)
            },
            create: function(id,me,count,list,name){
                var groups = firebase.database().ref('events');
                groups.child('last').set(id);
                groups = groups.child(id);
                groups.child('countUser').set(count+1);
                groups.child('user/'+me).set(true);
                if(name && angular.isString(name)) groups.child('name').set(name);
                angular.forEach(list, function(value,key){
                    groups.child('user/'+key).set(true);
                });
            },
            add: function(list,count){
                var numUser = $firebaseObject(item.child('countUser'));
                numUser.$loaded(function(){
                    item.child('countUser').set(numUser.$value +count);
                    angular.forEach(list, function(value,key){
                        item.child('user/'+key).set(true);
                    });
                });
            },
            leave: function(userid){
                item.child('user/'+userid).remove();
                var numUser = $firebaseObject(item.child('countUser'));
                numUser.$loaded(function(){
                    if(numUser.$value <= 3){
                        var user = $firebaseArray(item.child('user'));
                        var userGroups = firebase.database().ref('userEvents');
                        user.$loaded(function(){
                            angular.forEach(user, function(value){
                                userGroups.child(value.$id+'/'+id).remove();
                            });
                            item.remove();
                        });
                    }
                    item.child('countUser').set((numUser.$value)-1);
                });
            },
            changeName: function(name){
                item.child('name').set(name);
            },
            get: function(){ return $firebaseArray(item) },
            getFriend: function(){ return $firebaseObject(item) },
            post: function(friend){
                item.child(friend).set(true);
                var friend = firebase.database().ref('contacts/'+friend);
                friend.child(id).set(true);
            },
            remove: function(friend){
                item.child(friend).remove();
                var friend = firebase.database().ref('contacts/'+friend);
                friend.child(id).remove();
            }

        }
    }
});


appServices.factory("DetailEvents", function($firebaseArray, $ionicScrollDelegate) {
    return function(id){
        var item = firebase.database().ref('detailEvents/'+id);
        return {
            get: function(){ return $firebaseArray(item) },
            post: function(data){
                var onComplete = function(){
                    $ionicScrollDelegate.scrollBottom();
                };
                item.push().set(data, onComplete);
            }
        }
    }
});

appServices.factory("UserEvents", function($firebaseArray) {
    return function(id){
        var item = firebase.database().ref('userEvents/'+id);
        return {
            get: function(){ return $firebaseArray(item) },
            post: function(me,list,id){
                var groups = firebase.database().ref('userEvents');
                groups.child(me+'/'+id).set(true);
                angular.forEach(list, function(value,key){
                    groups.child(key+'/'+id).set(true);
                });
            },
            add: function(id,list){
                var groups = firebase.database().ref('userEvents');
                angular.forEach(list, function(value,key){
                    groups.child(key+'/'+id).set(true);
                });
            },
            leave: function(id){
                item.child(id).remove();
            }
        }
    }
});


appServices.factory("DetailGroups", function($firebaseArray, $ionicScrollDelegate, NotifService) {
    return function(id){
        var item = firebase.database().ref('detailGroups/'+id);
        return {
            get: function(){ return $firebaseArray(item) },
            post: function(data, users_oneSignalId, senderId){
                var notifTxt = (data.type === "text") ? " : "+data.content : " vous a envoyé une image.";
                notifTxt = senderId + notifTxt;
                var onComplete = function(){
                    $ionicScrollDelegate.scrollBottom();
        
                    NotifService.sendNotif("messages", false, false, notifTxt, users_oneSignalId, senderId).then(function(res){
                        //console.log(res);
                    }), function(error) {
                        //console.log(error);
                    };
                };
                item.push().set(data, onComplete);
            }
        }
    }
});

appServices.factory("UserGroups", function($firebaseArray, Groups, User) {
    return function(id){
        var item = firebase.database().ref('userGroups/'+id);
        return {
            get: function(){ return $firebaseArray(item) },
 
            loadGroups: function(groups){
                return new Promise(function(resolve, reject){
                   angular.forEach(groups, function(item){
                        item.avatar = new Array;
                        item.numUser = Groups(item.$id).getNumUser();
                        item.nameGroup = Groups(item.$id).getName();
                        item.user = Groups(item.$id).getUser(4);
                        item.lastMessage = Groups(item.$id).getLastDate();
                        item.time = false;
                        item.user.$loaded(function(){
                            item.name = new Array;
                            angular.forEach(item.user, function(user){
                                item.name.push(User(user.$id).getName());
                                item.avatar.push(User(user.$id).getAvatar());
                            });
                        });
                        item.lastMessage.$loaded(function(data){
                            angular.forEach(data, function(message){
                                item.lastMessage = message;
                                item.time = message.time;
                            });

                        });   
                    });
                    
                    resolve(groups);   
               }).catch(function(e){
                    console.log(e);
               });
            },

            post: function(me,list,id){
                var groups = firebase.database().ref('userGroups');
                groups.child(me+'/'+id).set(true);
                angular.forEach(list, function(value,key){
                    groups.child(key+'/'+id).set(true);
                });
            },
            add: function(id,list){
                var groups = firebase.database().ref('userGroups');
                angular.forEach(list, function(value,key){
                    groups.child(key+'/'+id).set(true);
                });
            },
            leave: function(id){
                item.child(id).remove();
            }
        }
    }
});

appServices.factory("Settings", function($firebaseObject) {
    return function(id){
        var item = firebase.database().ref('settings/'+id);
        return {
            get: function(child){
                item = item.child(child);
                return $firebaseObject(item)
            },
            change: function(child,data){
                item.child(child).set(data);
            }
        }
    }
});

appServices.factory('Camera', function($q) {
    return {
        getPicture: function(options) {
            var q = $q.defer();
            navigator.camera.getPicture(function(result) {
                q.resolve(result);
            }, function(err) {
                q.reject(err);
            }, options);
            return q.promise;
        }
    }
});

appServices.factory('Location', function($firebaseObject, $ionicPopup){
    return function(id){
        var item = firebase.database().ref('location/'+id);
        return {
            get: function(){ return $firebaseObject(item) },
            getNearby: function(location){
                item = item.parent.orderByChild('nearby').equalTo(location);
                return $firebaseObject(item);
            },
            update: function(){
                function onSuccess(data){
                    var location = {};
                    location.lat = data.coords.latitude;
                    location.lng = data.coords.longitude;
                    location.nearby = data.coords.latitude.toFixed(2)+'_'+data.coords.longitude.toFixed(2);
                    item.set(location);
                }
                function onError(err){
                    var confirmPopup = $ionicPopup.confirm({
                        template: '<p><b class="dark">Error: The Geolocation service failed.</b></p>You should enable to share your position on your mobile',
                        cssClass: 'popup-confirm-delete',
                        buttons: [
                            {
                                text: 'Read More',
                                type: 'button-clear col-66 button-no-delete',
                                onTap: function(){
                                    var ref = cordova.InAppBrowser.open('https://support.google.com/maps/answer/2839911?co=GENIE.Platform%3DAndroid&hl=en&oco=1', '_blank', 'location=yes');
                                }
                            },
                            {
                                text: 'OK',
                                type: 'button-clear col-33 button-no-delete'
                            }
                        ]
                    });
                }
                navigator.geolocation.getCurrentPosition(onSuccess, onError);
            }
        }
    }
});

