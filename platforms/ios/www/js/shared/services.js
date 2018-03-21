/* Global appServices,appServices */
appServices.factory('Animate', function($ionicModal, $ionicLoading, $ionicSlideBoxDelegate){
    return {
        loadStrt: function(duration) {
            $ionicLoading.show({
                content: 'Loading',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0,
                duration: duration
            });
        },
        loadEnd: function() {
            $ionicLoading.hide();
        },
        slide: function() {
            return $ionicSlideBoxDelegate;
        }
    }
});

appServices.factory ('StorageService', function(){
    return {
        get: function(stringValue){
            if (!localStorage[stringValue]) {
                return null;
            }else {
                var a = localStorage.getItem(stringValue);
                var b = JSON.parse(a);
                return b;
            }
        }, 
        set: function(stringValue, value, type, strObj) {
            var output = this.get(stringValue); 

            if (type == 'array') {
                output.push(value);
            } else if (type == 'obj') {
                output[strObj] = value;
            } else {
                output = value;
            }
            localStorage.setItem(stringValue, JSON.stringify(output));
        }
    }    
});

appServices.factory('LogInService', function(Auth, DataService){
    function _authUser() {
        return new Promise (function(resolve) {
            var a = Auth.$waitForSignIn();
            resolve(a);
        }).catch(function(e){
            console.log(e);
        });
    }  

    return {
        authData: function() {
            return new Promise (function(resolve) {
                var data = {};
                _authUser().then(function(res){
                    data.auth = res;
                    var uid = res.uid;
                    DataService.getByUid('users', uid).then(function(r){
                        data.data = r;
                        resolve(data);
                    }), function(error){
                        console.log(error);
                    };
                }), function(error){
                    console.log(error);
                };
            }).catch(function(e){
                console.log(e);
            });
        },
        showBtn: function (caller, data) {
            if (caller == '1') {
                data.showBtn = false;
                data.showPassword = true;
            }else {
                data.showBtn = true;
                data.showPassword = false;
            }
            return data;
        }
    }  
});

appServices.factory("Auth", ["$firebaseAuth",
                             function($firebaseAuth) {
                                 return $firebaseAuth();
                             }
]);
/*
appServices.factory("Firebase", function() {
    var config = {
        apiKey: "AIzaSyCPfLymyg5Ekf8RhxKxZ74LNv2LpQ6RxMo",
        authDomain: "imsh2-d4cb7.firebaseapp.com",
        databaseURL: "https://msh2-d4cb7.firebaseio.com",
        projectId: "msh2-d4cb7",
        storageBucket: "msh2-d4cb7.appspot.com",
        messagingSenderId: "373460998251"
    };
     return firebase.initializeApp(config);
});
*/
appServices.factory("Init", function(Utilities, PopupService) {

    function initUser(u, o, data, uid) {
        var user = {
            createdAt: data.createdAt,
            city: o.city,
            fullAddress: o.addressSelected,
            gender: u.gender,
            firstName: u.firstName,
            name: u.name,
            mail: u.mail,
            phone: u.phone,
            acceptAdd: u.acceptAdd,
            isSyndicMember: u.isSyndicMember,
            signaledAt: "",
            formatedName: u.firstName+" "+u.name,
            role: "USER",
            status: "ok",
            signaledReason: "",
            id: uid,
            oneSignalId: u.oneSignalId?u.oneSignalId:'',
            immeuble: data.cp,
            flats: {
                cadastralParcel: data.cp,
                status: u.status?u.status:'owner',
                floor: u.floor
            }
        }
        if ( u.yearOfBirth) {
            user.yearOfBirth = u.yearOfBirth;
        }
        if (!o.batName) {
            user.batName = "";
        } else {
            user.batName = o.batName;
        }
        if (u.provider) {
            user.provider = u.provider;
        } else {
            user.provider = "";
        }
        user.immeubleIndex = {};
        user.immeubleIndex[data.cp] = true;
        return user;
    }

    function initBat(data, o) {   
        var bat = {
            copro: data.cp,
            fullAddress: o.addressSelected,
            id: data.bId,
        }
        if(o.batName) {
            bat.name = o.batName;
        }else {
            bat.name = "";
        }
        return bat;
    }

    function initFlat(data, u, uid, o) {
        var flat = {
            cadastralParcel: data.cp,
            createdAt: data.createdAt,
            cp: o.postalCode,
            network: {},
            bats: {},
            name: o.addressSelected,
            city: o.city
        };
        flat.network[uid] = true;
        flat.bats[data.bId] = true;
        return flat;
    }

    return {
        initUser: function (user, o, data, uid) {
            return initUser (user, o, data, uid);
        },
        initBat: function (data, o) {
            return initBat(data, o);
        },
        initFlat: function (data, u, uid, o) { 
            return initFlat (data, u, uid, o);
        }
    }  
})

appServices.factory("UserService", function(DataService,Auth) {
    currentRef = rootRef.child('users');
    // var incidentsByUserRef = incidentsRef.orderByChild("userIndex/"+Auth.$getAuth().uid).equalTo(true);
    var User = {
        //profile:
    }
    var formatItem = function(o,k){
        var author=false;
        var batiment=false;
        var immeuble=false;
        var key=k;
        // var authorRef = ref.child('users/'+o.declaredBy);
        //var immeubleRef = ref.child('immeubles/'+o.copro);
        var immeubleRef = rootRef.child('immeubles/'+o.immeuble);
        var batimentRef = rootRef.child('batiments/'+o.batiment);
        //var author = DataService.load(authorRef);//DataService.getChild('users')[o.declaredBy];
        var immeuble = DataService.load(immeubleRef);//DataService.getChild('immeubles')[o.copro];
        var batiment = DataService.load(batimentRef);//DataService.getChild('immeubles')[o.copro];
        //var batiment = DataService.getChild('batiments')[o.declaredBy];
        o.key=key;
        var links = {};
        // links.author=author;
        links.immeuble=immeuble;
        links.batiment=batiment;
        o.links = links;
        return o;
        //    return o;

    }
    var all = function(key,value){
        var usersItemsAllRef =  currentRef;//.orderByChild("status").equalTo('solved');
        if(key && value){
            usersItemsAllRef = usersItemsAllRef.orderByChild(key).equalTo(value);
        }        

        return get(usersItemsAllRef);
    }

    var allByIndex = function(index,key,value){
        var usersItemsByIndexRef = currentRef.orderByChild(index+"/"+key).equalTo(value);
        return get(usersItemsByIndexRef);
    }

    var getByKey = function(key){
        //var usersItemsByKeyRef  = ref.child('users/'+key);
        var usersItemsByKeyRef  = rootRef.child('users').orderByKey().equalTo(key);

        //var itemsByKeyRef = currentRef.child('incidents');
        return get(usersItemsByKeyRef);
    }

    var get = function(ref){
        var obj = DataService.load(ref);//DataService.getChild('incidents');
        var data = {};
        obj.$loaded().then(function(){
            angular.forEach(obj,function(o,k){
                var item = formatItem(o,k);
                //console.log('dd',item,o,k);
                obj[k] = angular.extend({},item);
                //data[k]=incident;
            });
        })
        //console.log(obj);
        return obj;

    }

    var add = function(form){
        var data = { foo: "bar" };
        var post = angular.extend({},form,data);
        var userIndex = {};
        userIndex[post.user]=true;
        post.userIndex=userIndex;
        var newItem = DataService.add(incidentsRef,post);
        //console.log(newItem);
        newItem.then(function(itemId){
            //console.log(itemId);
            DataService.indexItem('users','incidents',itemId);
            //DataService.indexItem('incidents','users',itemId);

        })
    }

    var save = function(key,form){
        var itemRef = rootRef.child('users/'+key);
        //var data = { foo: "bar" };
        var post = angular.extend({},form/*,data*/);
        /*
        var userIndex = {};
        userIndex[post.user]=true;
        post.userIndex=userIndex;
        */
        var immeubleIndex = {};
        immeubleIndex[post.immeuble]=true;
        post.immeubleIndex=immeubleIndex;
        var batimentIndex = {};
        batimentIndex[post.batiment]=true;
        post.batimentIndex=batimentIndex;
        //var data = { foo: "bar" };
        return DataService.save(itemRef,post);

    }

    var getById = function(_uid) {
        return DataService.getByUid('users', _uid);
    }

    var currentUser = {};
    var loggedUser = {};

    var setUser = function(user_data) {
        window.localStorage.starter_facebook_user = JSON.stringify(user_data);
    };

    var getUser = function(){
        return JSON.parse(window.localStorage.starter_facebook_user || '{}');
    };


        
    

    return {
        getUser: getUser,
        
        setUser: setUser,
        
        setCurrent: function(current) {
            currentUser = current;
        },
        getCurrent: function() {
            return currentUser;
        },
        setLogged: function(logged) {
            loggedUser = logged;
        },
        getLogged: function() {
            return loggedUser;
        },
        getById:function(_uid){
            return getById(_uid);
        },
        all:function(){
            return all();
        },
        allByIndex:function(index,key,value){
            return allByIndex(index,key,value);
        },
        get:function(ref){
            return get(ref);
        },
        getByKey:function(key){
            return getByKey(key);
        },
        add:function(data){
            return add(data);
        },
        save:function(key,form){
            return save(key,form);
        }
    }
});

appServices.factory("CreateUser", function(DataService, PopupService, Utilities, Auth, UserService, Init, Animate, NotifService/*, $timeout*/) {
    return {
        isIdentical: function() {
            return new Promise (function(resolve,reject) {
                var identicalMail = false;
                var identicalPhone = false;
                var users = DataService.fbArray('users');
                for (i=0; i<users.length; i++){
                    (function(iteration){
                        if (users[iteration].mail == newUser.mail){
                            identicalUser = true;
                        }else if (users[iteration].phone == newUser.phone){
                            identicalPhone = true;
                        }
                    })(i)
                }
                resolve([identicalMail, identicalPhone]);
            }).catch(function(e){
                PopupService.show('showError');
                Animate.loadEnd();
                //console.log(e);
            });
        },

        isNewCopro: function(userCopro) {
            return new Promise (function(resolve, reject) {
                DataService.checkBats(userCopro).then(function(result) {
                    resolve(result);
                }), function(error) {
                    console.log(error);
                };    
            }).catch(function(e) {
                PopupService.show('showError');
                Animate.loadEnd();
                //console.log(e);
            })  
        },

        init: function(user, uid, o){
            return new Promise(function(resolve) {
                var data = {};
                data.createdAt = new Date().getTime();
                data.bId = Utilities.createRandomKey(23);
                data.cp = o.cadastralParcel;
                data.flatRef = 'immeubles/'+data.cp;
                var a = Init.initBat(data, o);
                data.bat = a;
                var b = Init.initFlat(data, user, uid, o);
                data.flat = b;
                var c = Init.initUser(user, o, data, uid);
                data.user = c; 
                resolve(data);
            }).catch(function(e){
                //console.log(e);
                Animate.loadEnd();
                PopupService.show('showError');
            });
        },

        editFlatUser: function(o, flatAndBat, uid, updateUser, formerFlat) {
            return new Promise(function(resolve, reject){
                if(updateUser === false) {
                    o.user.batimentIndex = {};
                    if(!flatAndBat[0]) { //si cet immeuble n'existe pas  
                        DataService.addCustom('immeubles/'+o.cp, o.flat);
                        DataService.addCustom('batiments/'+o.bId, o.bat);
                        o.user.batiment = o.bId;
                        o.user.batimentIndex[o.bId] = true;
                        // Si la copro existe déjà:
                    }else if(!flatAndBat[1]) {
                        // Si la copro existe déjà mais que le user s'inscrit dans un nouveau batiment
                        DataService.addCustom('batiments/'+o.bId, o.bat);
                        DataService.addCustom(o.flatRef+'/bats/'+o.bId, true);
                        o.user.batiment = o.bId;
                        o.user.batimentIndex[o.bId] = true;
                    }else {
                        o.user.batiment = flatAndBat[2];
                        o.user.batimentIndex[flatAndBat[2]] = true;     
                    }     
                    DataService.addCustom(o.flatRef+'/network/'+uid, true);
                    // A son inscription, le user envoie une suggestion à tout les membres du réseau de la copro   
                    DataService.addCustom('users/'+uid, o.user);               
                
                } else {
                    if(!flatAndBat[0]) { //si cet immeuble n'existe pas  
                        DataService.addCustom('immeubles/'+o.cp, o.flat);
                        DataService.addCustom('batiments/'+o.bId, o.bat);
                        // Si la copro existe déjà:
                    }else if(!flatAndBat[1]) {
                        // Si la copro existe déjà mais que le user s'inscrit dans un nouveau batiment
                        DataService.addCustom('batiments/'+o.bId, o.bat);
                        DataService.addCustom('immeubles/'+o.cp+'/bats/'+o.bId, true);
                    }else {
                        o.bId = flatAndBat[2];
                    }
                    DataService.deleteInFirebase('immeubles/'+formerFlat+'/network/'+uid);  
                    DataService.addCustom('immeubles/'+o.cp+'/network/'+o.userId, true); 
                }    
                resolve([o, uid]);
            }).catch(function(e){
                console.log(e);
                Animate.loadEnd();
                PopupService.show('showError');
            });
        },

        changeUserAddress: function(user, copro) {
            var that = this;
            var newAddress = {};
            return new Promise(function(resolve, reject) {
                that.isNewCopro(copro).then(function(existing){
                    that.editFlatUser(copro, existing, user.id, true, user.immeuble).then(function(o){
                        newAddress = o[0];
                        DataService.updateUserAddress(newAddress).then(function(res){
                            resolve(newAddress);
                        });
                    }), function(error) {
                        console.log(error);
                    };
                }),function(error) {
                    console.log(error);
                };
            }).catch(function(e) {
                console.log(e);
            });
        },

        stepsDuringUserCreation: function (image, user, uid, userCopro) {
            //console.log('############## 2.1.1');
            var that = this;
            var flatAndBat = [];
            var resUser = {};
            var imageUrlRef = 'users/'+uid+'/imageUrl';
            return new Promise(function(resolve, reject) {  
                //console.log('@@@@@@@@@@@@@@@ 2.1.2',image, user, uid, userCopro);
                that.isNewCopro(userCopro).then(function(existing){
                    //console.log('################# 2.1.3', existing,user, uid, userCopro);
                    flatAndBat = existing;
                    that.init(user, uid, userCopro).then(function(data) {
                        //console.log('@@@@@@@@@@@@@@@@@ 2.1.4', data);
                        that.editFlatUser(data, flatAndBat, uid, false).then(function(r){
                            resUser = r.user
                            if (image !== 'css/img/icon-camera.png') {
                                Utilities.setImageReadyToExportToFirebase(image).then(function(result) {
                                    /*var id =  resUser.name+resUser.firstName+resUser.phone;
                                    var imageName = Utilities.createRandomKey(5)+id;*/
                                    Utilities.putImageInFirebaseStorage('images', uid, result).then(function(res) {
                                        Utilities.setImageUrl('images/'+res, imageUrlRef, uid).then(function(resolved) {
                                            resolve(resolved); // resolved = [imageUrl, uid]
                                        }), function(error) {
                                            //console.lo(error);
                                        };
                                    }), function(error){
                                        //console.log(error);
                                    };
                                }), function(error){
                                    //console.log(error);
                                };
                            }else {
                                DataService.addCustom(imageUrlRef, image);
                                resolve(r); // r = [object, uid]
                            }
                        }), function(error){
                            //console.log(error);
                        }; 
                    }), function(error){
                        //console.log(error);
                    };
                }), function(error){
                    //console.log(error);
                };
            }).catch(function(e){
                //console.log(e);
            });                             
        },        

        firebaseFinishUser: function (user, image, userCopro) {
            //console.log('firebaseFinishUser', user, image,userCopro);
            var that = this;
            return new Promise(function(resolve,reject) {
                //  Auth.$createUserWithEmailAndPassword(user.mail, user.pw).then(function(e) {
                var uid = user.uid;
                //console.log(' #################### 2.1X', uid);
                user.id = uid;  
                that.stepsDuringUserCreation(image, user, uid, userCopro).then(function(result) {
                    PopupService.show('showSuccessInscription');
                    resolve(result);
                }), function (error){
                    //console.log(error);
                };
                /*
                }).catch(function(firebaseError){
                    PopupService.show('alertCreateUserWithEmailAndPassword', firebaseError);
                    Animate.loadEnd();
                    //console.log(firebaseError);
                })
                */
            }).catch(function(error){
                //console.log(error);
                Animate.loadEnd();
                PopupService.show('showError');
            });

        },        

        firebaseCreateUser: function (user, userIsIdentical, image, userCopro) {
            //console.log(user, userIsIdentical, image, userCopro);
            // console.log(' @@@@@@@@@@@@@@@@@ 4', user, userIsIdentical, userCopro);
            var that = this;
            return new Promise(function(resolve,reject) {
                if(userIsIdentical[0] == false && userIsIdentical[1] == false) {
                    // Auth.$getAuth().then(function(e) {
                    Auth.$createUserWithEmailAndPassword(user.mail, user.pw).then(function(e) {
                        var uid = e.uid;
                        //  console.log(' ################### 2.1', uid);
                        user.id = uid;  
                        that.stepsDuringUserCreation(image, user, uid, userCopro).then(function(result) {
                            // console.log(' @@@@@@@@@@@@@@@@@@@ 2.2', result);
                            PopupService.show('showSuccessInscription', '');
                            resolve(result); // si l'utilisateur a une image:  result = [imageUrl, userId], sinon result = []
                        }), function (error){
                            //console.log(error);
                        };
                    }).catch(function(firebaseError){
                        PopupService.show('alertCreateUserWithEmailAndPassword', firebaseError);
                        Animate.loadEnd();
                        //console.log(firebaseError);
                    })
                }else{
                    if (userIsIdentical[0] == true || userIsIdentical[1] == true) {
                        PopupService.show('alertIdenticalUser');
                    }
                    resolve(user);
                }
            }).catch(function(error){
                //console.log(error);
                Animate.loadEnd();
                PopupService.show('showError');
            });
        },

        createUserInFirebase: function(user, image, userCopro, user_tag) {
            that = this;
            return new Promise(function(resolve, reject){
                //console.log('1', user);
                that.isIdentical().then(function(identical){
                    //console.log('2', identical);
                    that.firebaseCreateUser(user, identical, image, userCopro).then(function(userCreated){
                        //console.log('3', userCreated); // userCreated[1] = uid
                        NotifService.sendTags(user_tag, userCreated[1]).then(function(r) {          
                            resolve(user_tag);
                        }), function(error) {
                        };
                    }), function(error){
                        PopupService.show('alertIdenticalUser');
                    };
                }), function(error){
                    PopupService.show('alertIdenticalUser');
                };
            }).catch(function(e){
                Animate.loadEnd();
                PopupService.show('alertIdenticalUser');
            });
        }      
    }   
});

appServices.factory("SignInService", function(IgnApiService) { 
    return {
        phoneIsCorrect: function (phone) {
            for (var i=0; i<phone.length; i++){
                // pour s'assurer que que le numero donné est correctement formaté
                if(isNaN(parseInt(phone[i]))){
                    return false
                }
            }
            if (!phone || phone.length != 10 || phone[0] != 0 || (phone[1] != 6 && phone[1] != 7)){
                return false;
            }else {
                return true;
            }    
        },
        // initialisation des selects 'étage' et 'département'
        initSelects: function() {   
            var data = {
                genders: [
                    {name: "Monsieur", value: "male"},
                    {name: "Madame", value: "female"}
                ],
                status: [
                    {name:"Propriétaire", value:"owner"},
                    {name:"Locataire", value:"lodger"},
                    {name:"Occupant", value:"occupier"},
                    {name:"Propriétaire non occupant", value:"ownerNoOccupier"}
                ], 
                departements:[],
                floors: []
            }
            var a = this.initFloors();
            data.floors = a.floors;
            data.departements = a.departements;
            return data;
        },
        initFloors: function() {
            var data = { floors: [], departements: []};

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
                data.floors.push(j);
            };

            for(var k=1; k<=97; k++){
                var l = {};
                if(k<10){
                    l.value = '0'+k;
                }else{
                    l.value = String(k);
                }
                if(k !== 96){
                    data.departements.push(l);
                }  
            };
            return data;
        },   
        passwordLength: function (pw) {
            return pw.length >= 6;
        },
        getSuggestions: function(form, data, scopeO){
            return IgnApiService.suggest(form, data, scopeO);
        },
        setUserFullAdress: function(data, form/*, displayResult, result, cadastralParcel, city, addressSelected, showButton*/) {
            return IgnApiService.setUserFullAdress(data, form/*, displayResult, result, cadastralParcel, city, addressSelected, showButton*/);
        }
    }
});

appServices.factory("ImmeubleService", function(DataService,Auth) {
    immeublesRef = rootRef.child('immeubles');
    // var incidentsByUserRef = incidentsRef.orderByChild("userIndex/"+Auth.$getAuth().uid).equalTo(true);

    var formatItem = function(o,k){
        /*
        var author=false;
        var batiment=false;
        var immeuble=false;
        var key=k;
        var authorRef = ref.child('users/'+o.declaredBy);
        var immeubleRef = ref.child('immeubles/'+o.copro);
        var author = DataService.load(authorRef);//DataService.getChild('users')[o.declaredBy];
        var immeuble = DataService.load(immeubleRef);//DataService.getChild('immeubles')[o.copro];
        //var batiment = DataService.getChild('batiments')[o.declaredBy];
        o.key=key;
        o.author=author;
        o.immeuble=immeuble;
        */
        return o;

    }
    var all = function(){
        //currentRef = currentRef;//.orderByChild("status").equalTo('solved');

        return get(immeublesRef);
    }

    var allByIndex = function(index,key,value){
        var itemsByUserRef = currentRef.orderByChild(index+"/"+key).equalTo(value);
        return get(itemsByUserRef);
    }

    var get = function(ref){
        var obj = DataService.load(ref);//DataService.getChild('incidents');
        var data = {};
        obj.$loaded().then(function(){
            angular.forEach(obj,function(o,k){
                var item = formatItem(o,k);
                obj[k] = angular.extend({},item);
                //data[k]=incident;
            });
        })
        return obj;
    }

    var add = function(form){
        var data = { foo: "bar" };
        var post = angular.extend({},form,data);
        var userIndex = {};
        userIndex[post.user]=true;
        post.userIndex=userIndex;
        var newItem = DataService.add(incidentsRef,post);
        newItem.then(function(itemId){
            DataService.indexItem('users','incidents',itemId);
            //DataService.indexItem('incidents','users',itemId);
        })
    }
    var save = function(data){
        var data = { foo: "bar" };
        //DataService.save(ref,data);
    }
    return {
        all:function(){
            return all();
        },
        allByIndex:function(index,key,value){
            return allByIndex(index,key,value);
        },
        get:function(ref){
            return get(ref);
        },
        add:function(data){
            return add(data);
        },
        save:function(data){
            return save(data);
        }
    }
});

appServices.factory("BatimentService", function(DataService,Auth) {
    batimentsRef = rootRef.child('batiments');
    // var incidentsByUserRef = incidentsRef.orderByChild("userIndex/"+Auth.$getAuth().uid).equalTo(true);

    var formatItem = function(o,k){
        /*
        var author=false;
        var batiment=false;
        var immeuble=false;
        var key=k;
        var authorRef = ref.child('users/'+o.declaredBy);
        var immeubleRef = ref.child('immeubles/'+o.copro);
        var author = DataService.load(authorRef);//DataService.getChild('users')[o.declaredBy];
        var immeuble = DataService.load(immeubleRef);//DataService.getChild('immeubles')[o.copro];
        //var batiment = DataService.getChild('batiments')[o.declaredBy];
        o.key=key;
        o.author=author;
        o.immeuble=immeuble;
        */
        return o;

    }
    var all = function(){
        // currentRef = currentRef;//.orderByChild("status").equalTo('solved');

        return get(batimentsRef);
    }

    var allByIndex = function(index,key,value){
        var itemsByUserRef = currentRef.orderByChild(index+"/"+key).equalTo(value);
        return get(itemsByUserRef);
    }

    var get = function(ref){
        var obj = DataService.load(ref);//DataService.getChild('incidents');
        var data = {};
        obj.$loaded().then(function(){
            angular.forEach(obj,function(o,k){
                var item = formatItem(o,k);
                obj[k] = angular.extend({},item);
                //data[k]=incident;
            });
        })

        return obj;
    }

    var add = function(form){
        var data = { foo: "bar" };
        var post = angular.extend({},form,data);
        var userIndex = {};
        userIndex[post.user]=true;
        post.userIndex=userIndex;
        var newItem = DataService.add(incidentsRef,post);
        newItem.then(function(itemId){
            DataService.indexItem('users','incidents',itemId);
            //DataService.indexItem('incidents','users',itemId);

        })
    }
    var save = function(data){
        var data = { foo: "bar" };
        //DataService.save(ref,data);
    }
    return {
        all:function(){
            return all();
        },
        allByIndex:function(index,key,value){
            return allByIndex(index,key,value);
        },
        get:function(ref){
            return get(ref);
        },
        add:function(data){
            return add(data);
        },
        save:function(data){
            return save(data);
        }
    }
});

appServices.factory("IncidentService", function(DataService,Auth,CommentaireService, NotifService) {
    var incidentsRef = rootRef.child('incidents');
    var incidentsByUserRef = incidentsRef.orderByChild("userIndex/"+Auth.$getAuth().uid).equalTo(true);

    var formatIncident = function(o,k){

        var author=false;
        var batiment=false;
        var immeuble=false;
        //var key=k;
        var key = o.$id;
        var authorRef = rootRef.child('users/'+o.user);
        //var immeubleRef = ref.child('immeubles/'+o.copro);
        var immeubleRef = rootRef.child('immeubles/'+o.immeuble);
        var batimentRef = rootRef.child('batiments/'+o.batiment);
        var lastcommentaireRef = rootRef.child('commentaires').orderByChild("incidentIndex/"+key).equalTo(true).limitToLast(1);
        var commentairesRef = rootRef.child('commentaires').orderByChild("incidentIndex/"+key).equalTo(true);
        var author = DataService.load(authorRef);//DataService.getChild('users')[o.declaredBy];
        var immeuble = DataService.load(immeubleRef);//DataService.getChild('immeubles')[o.copro];
        var batiment = DataService.load(batimentRef);//DataService.getChild('immeubles')[o.copro];
        var commentaires = DataService.loadAsArray(commentairesRef);//DataService.getChild('immeubles')[o.copro];
        var lastcommentaire = DataService.loadAsArray(lastcommentaireRef);//DataService.getChild('immeubles')[o.copro];
        //var batiment = DataService.getChild('batiments')[o.declaredBy];
        var index = 'incidentIndex';
        //var key = $stateParams.id;
        var value = true;
        o.incidentCommentairesList = CommentaireService.allByIndex(index,key,value);
        lastcommentaire.$loaded().then(function(){
            if(lastcommentaire.length){
                // o.last_comment = CommentaireService.getByKey(lastcommentaire[0].$id);
            }

        });
        o.key=key;
        o.last_comment = lastcommentaire;
        var links = {};
        links.author=author;
        links.immeuble=immeuble;
        links.batiment=batiment;
        links.commentaires=commentaires;
        o.links = links;
        return o;

    }
    var all = function(){
        incidentsRef = incidentsRef;//.orderByChild("status").equalTo('solved');

        return get(incidentsRef);
    }

    var allByIndex = function(index,key,value){
        var incidentsByUserRef = incidentsRef.orderByChild(index+"/"+key).equalTo(value);
        return get(incidentsByUserRef);
    }

    var getByKey = function(key){
        var incidentsByKeyRef  = rootRef.child('incidents').orderByKey().equalTo(key);
        // ref.child('incidents/'+key);
        /*
           var incidentsByKeyRef = firebase.database().ref('incidents/'+key);
        var incident = DataService.load(incidentsByKeyRef);//DataService.getChild('incidents');
        incident.$loaded().then(function(){
        });
        //var itemsByKeyRef = currentRef.child('incidents');
        return incident;
        */
        //var itemsByKeyRef = currentRef.child('incidents');
        return get(incidentsByKeyRef);
    }

    var get = function(ref){
        var incidents = DataService.loadAsArray(ref);//DataService.getChild('incidents');
        var data = {};
        incidents.$loaded().then(function(){
            angular.forEach(incidents,function(o,k){
                var incident = formatIncident(o,k);
                incidents[k] = angular.extend({},incident);
                //data[k]=incident;
            });
        })
        return incidents;
    }

    var add = function(form){
        return new Promise(function(resolve, reject) {
            var itemId;
            var data = { foo: "bar" };
            var post = angular.extend({},form,data);

            var userIndex = {};
            userIndex[post.user]=true;
            post.userIndex=userIndex;

            var immeubleIndex = {};
            immeubleIndex[post.immeuble]=true;
            post.immeubleIndex=immeubleIndex;

            var timestamp = new Date().getTime();
            post.timestamp=timestamp;

            var batimentIndex = {};
            batimentIndex[post.batiment]=true;
            post.batimentIndex=batimentIndex;
            DataService.getByProperty('incidents', 'immeuble', form.immeuble). then(function(coproIncidents) {
                post.id = DataService.setCustomId(coproIncidents);
                var newItem = DataService.add(incidentsRef,post);
                newItem.then(function(_itemId) {
                     itemId = _itemId;
                    DataService.indexItem('users','incidents',itemId);
                    NotifService.sendNotif('incident', form.immeuble, itemId, false, false, form.user).then(function(res) {
                        //alert(res);
                        resolve(itemId);
                    }).catch(function(error) { 
                        alert(error);
                        resolve(itemId); 
                    });
                    //DataService.indexItem('immeubles','incidents',itemId);
                    //DataService.indexItem('incidents','users',itemId);
                }), function(error) {};
            });
        }).catch(function(e){
            alert("error : "+e);
        });
    }
    var save = function(key,form){
        return new Promise(function(resolve, reject) {
            var itemRef = rootRef.child('incidents/'+key);

            var data = { foo: "bar" };
            var post = angular.extend({},form,data);

            var userIndex = {};
            userIndex[post.user]=true;
            post.userIndex=userIndex;

            var immeubleIndex = {};
            immeubleIndex[post.immeuble]=true;
            post.immeubleIndex=immeubleIndex;


            var batimentIndex = {};
            batimentIndex[post.batiment]=true;
            post.batimentIndex=batimentIndex;

            //var data = { foo: "bar" };
            DataService.save(itemRef,post);
            resolve(form);
        }).catch(function(e){
            alert("error : "+e);
        });
    }
    return {
        all:function(){
            return all();
        },
        allByIndex:function(index,key,value){
            return allByIndex(index,key,value);
        },
        get:function(ref){
            return get(ref);
        },
        getByKey:function(key){
            return getByKey(key);
        },
        add:function(data){
            return add(data);
        },
        save:function(key,data){
            return save(key,data);
        }
    }
});

appServices.factory('DigipostService', function(Auth, DataService, Utilities, PopupService, StorageService, $q, NotifService){
    var postsRef = DataService.getRef('postIts'); 
    var data = {};
    var prov = '';

    return {

        timeBetweenTwoPosts: function(tStamp) {
            return (parseInt(new Date().getTime()) - parseInt(tStamp))/1000;
        },

        setUserPosts: function(scopeDataUserPosts){
            data.userPosts = scopeDataUserPosts;
        },

        setCoproPosts: function(scopeDataCoproPosts){
            data.coproPosts = scopeDataCoproPosts;
        },

        get: function(){
            return data.coproPosts;
        },

        getUserPosts: function() {
            return data.userPosts;
        },

        setData: function(edit, card) {
            data.edit = edit;
            if(card) {
                data.card = card;
            }
        },

        getData: function() {
            return data;
        },

        setProv: function(provider) {
            prov = provider;
        },

        getProv: function() {
            return prov;
        },

        loadPostIts: function(postIts){
            var output = [];
            var deferred = $q.defer();
            if (postIts.length > 0) {
                output = DataService.sortData(postIts);
                deferred.resolve(output);           
            } else {
                nothingToDisplay = {
                    content:"Aucun message n'est disponible. Vous avez quelque chose à communiquer aux résidents de votre immeuble, rédigez votre 'mokolé'!",
                    noPosts: true
                };
                output.push(nothingToDisplay);
                deferred.resolve(output);
            }
            return deferred.promise;
        },

        add: function(posts, newPost, old){
            return new Promise(function(resolve, reject){
                if(old !== false) {
                    data.coproPosts.splice(posts.indexOf(old), 1);
                    data.userPosts.splice(posts.indexOf(old), 1);
                }
                data.coproPosts.push(angular.extend({}, newPost));
                data.userPosts.push(angular.extend({}, newPost));
                resolve(data);
            }).catch(function(e){
                console.log(e);
            });
        },

        setImage: function(_newPost, image) {
            return new Promise(function(resolve){
                var data = {_newPost: _newPost};
                if (image) {
                    if(_newPost.img != image) {
                        Utilities.setImageReadyToExportToFirebase(image).then(function(result) {
                            Utilities.putImageInFirebaseStorage('digiposts', _newPost._id, result).then(function(res) {
                                Utilities.setImageUrl('digiposts/'+res, 'postIts/'+res+'/img').then(function(resolved) {
                                    data.resolved = resolved;
                                    resolve(data);
                                }), function(error){};
                            }), function(error){};
                        }), function(error){};  
                    } else {
                        resolve(data);
                    }   
                } else {
                    resolve(data);
                }
            }).catch(function(e) {
                console.log(e);
                PopupService.show('showError');
            });
        },

        edit_2: function(_result, old, _data, _user){
            return new Promise(function(resolve){
                _data.post = _result;
                if (old == false) {
                    _data.post.modifs = 0;
                    DataService.getDigiPosts(_user).then(function(res) {
                        _data.post._id = Utilities.createRandomKey(28);
                        _data.post.id = DataService.setCustomId(res);                
                        resolve(_data);
                    }),function(error){};
                }else {
                    _data.post.modifs = old.modifs+=1;
                    _data.post._id = old._id;
                    resolve(_data);
                }
            }).catch(function(e) {
                PopupService.show('showError');
                console.log(e);
            })
        },

        edit: function(image, newPost, _user, old) {
            var that = this;
            var deferred = $q.defer();
            var data = {};
            new Promise(function(resolve, reject){
                var post = {
                    content: newPost.content,
                    creator: newPost.creator,
                    creatorId: _user.id,
                    timeStamp: newPost.timeStamp,
                    date: Utilities.getFormatedDate(),
                    copro: _user.immeuble,
                    isSignaled: false,
                    delete: false,
                    status: 'ok',
                    nbDays: 5,
                    signalBy: "",
                    signalMotif: "",
                    signalComment: ""
                };
                if (old !== false && old.img) {
                    post.img = old.img;
                }
                resolve(post);
            }).then(function(result){
                that.edit_2(result, old, data, _user).then(function(_data) {
                    console.log(_data);
                    var res = _data.post;
                    new Promise(function(resolve){
                        DataService.addCustom('postIts/'+res._id, res);
                        var newTimeStamp = res.timeStamp;
                        StorageService.set('persistTimeStamp', newTimeStamp);
                        resolve(localStorage.persistTimeStamp);
                    }).then(function(result2){
                        that.setImage(res, image).then(function(result3) {
                            var finalPost = result3._newPost;
                            NotifService.sendNotif('mokole', _user.immeuble, finalPost._id, false, false, _user.id).then(function(res){
                                PopupService.show('newPostAdded');
                                deferred.resolve(res);
                            }), function(error) {
                                console.log(error);
                            };
                            
                        });
                    }).catch(function(e){
                        console.log(e);
                        PopupService.show('showError');    
                    });
                }),function(error){};
            }).catch(function(err){
                console.log(err);
                PopupService.show('showError');
            });
            return deferred.promise;
        }        
    }
});

appServices.factory("CommentaireService", function(DataService,Auth) {
    var commentairesRef = rootRef.child('commentaires');
    var commentairesByUserRef = commentairesRef.orderByChild("userIndex/"+Auth.$getAuth().uid).equalTo(true);
    // var commentairesByUserRef = incidentsRef.orderByChild("userIndex/"+Auth.$getAuth().uid).equalTo(true);

    var formatData = function(o,k){

        var author=false;
        var batiment=false;
        var immeuble=false;
        var incident=false;
        var key=k;
        var authorRef = rootRef.child('users/'+o.user);
        //var immeubleRef = ref.child('immeubles/'+o.copro);
        var immeubleRef = rootRef.child('immeubles/'+o.immeuble);
        var batimentRef = rootRef.child('batiments/'+o.batiment);
        var incidentRef = rootRef.child('incidents/'+o.incident);
        var author = DataService.load(authorRef);//DataService.getChild('users')[o.declaredBy];
        var immeuble = DataService.load(immeubleRef);//DataService.getChild('immeubles')[o.copro];
        var batiment = DataService.load(batimentRef);//DataService.getChild('immeubles')[o.copro];
        var incident = DataService.load(incidentRef);//DataService.getChild('immeubles')[o.copro];
        //var batiment = DataService.getChild('batiments')[o.declaredBy];
        o.key=key;
        var links = {};
        links.author=author;
        links.immeuble=immeuble;
        links.incident=incident;
        links.batiment=batiment;
        o.links = links;
        return o;

    }
    var all = function(){
        //incidentsRef = incidentsRef;//.orderByChild("status").equalTo('solved');

        return get(commentairesRef);
    }

    var allByIndex = function(index,key,value){
        var commentairesByIncidentRef = commentairesRef.orderByChild(index+"/"+key).equalTo(value);
        return get(commentairesByIncidentRef);
    }

    var getByKey = function(key){
        var commentairesByKeyRef  = rootRef.child('commentaires').orderByKey().equalTo(key);
        // ref.child('incidents/'+key);
        /*
           var incidentsByKeyRef = firebase.database().ref('incidents/'+key);
        var incident = DataService.load(incidentsByKeyRef);//DataService.getChild('incidents');
        incident.$loaded().then(function(){
        });
        //var itemsByKeyRef = currentRef.child('incidents');
        return incident;
        */
        //var itemsByKeyRef = currentRef.child('incidents');
        return get(commentairesByKeyRef);
    }

    var get = function(ref){
        var commentaires = DataService.load(ref);//DataService.getChild('incidents');
        var data = {};
        commentaires.$loaded().then(function(){
            angular.forEach(commentaires,function(o,k){
                var commentaire = formatData(o,k);
                commentaires[k] = angular.extend({},commentaire);
                //data[k]=incident;
            });
        })
        return commentaires;
    }

    var add = function(form){
        var data = { foo: "bar" };
        var post = angular.extend({},form,data);

        var userIndex = {};
        userIndex[post.user]=true;
        post.userIndex=userIndex;

        var immeubleIndex = {};
        immeubleIndex[post.immeuble]=true;
        post.immeubleIndex=immeubleIndex;

        var incidentIndex = {};
        incidentIndex[post.incident]=true;
        post.incidentIndex=incidentIndex;

        var timestamp = new Date().getTime();
        post.timestamp=timestamp;

        var batimentIndex = {};
        batimentIndex[post.batiment]=true;
        post.batimentIndex=batimentIndex;

        var newItem = DataService.add(commentairesRef,post);
        newItem.then(function(itemId){
            DataService.indexItem('incidents','commentaires',itemId);
            //DataService.indexItem('immeubles','incidents',itemId);
            //DataService.indexItem('incidents','users',itemId);
        });
    }
    var save = function(key,form){
        var itemRef = rootRef.child('commentaires/'+key);

        var data = { foo: "bar" };
        var post = angular.extend({},form,data);

        var userIndex = {};
        userIndex[post.user]=true;
        post.userIndex=userIndex;

        var immeubleIndex = {};
        immeubleIndex[post.immeuble]=true;
        post.immeubleIndex=immeubleIndex;


        var batimentIndex = {};
        batimentIndex[post.batiment]=true;
        post.batimentIndex=batimentIndex;

        //var data = { foo: "bar" };
        DataService.save(itemRef,post);
    }
    return {
        all:function(){
            return all();
        },
        allByIndex:function(index,key,value){
            return allByIndex(index,key,value);
        },
        get:function(ref){
            return get(ref);
        },
        getByKey:function(key){
            return getByKey(key);
        },
        add:function(data){
            return add(data);
        },
        save:function(key,data){
            return save(key,data);
        }
    }
});

appServices.factory("DataService", function($firebaseObject,$firebaseArray,Auth, $q, NotifService) {
    var newAddress = "";

    var getElement = function(ref) {
        return new Promise(function(resolve, reject){
            rootRef.child(ref).on('value', function(snapshot){
                var element = snapshot.val(); 
                resolve(element);
            }), function(error){
                console.log(error);    
            }
        }).catch(function(e){
            console.log(e);
        });
    } 

    var updateUserAddress = function(o) {
        return new Promise(function(resolve, reject) {
            var updates = {};
            var userRef = rootRef.child('users/'+o.userId);
            updates['/batName'] = o.bat.name;
            updates['/batiment'] = o.bId;
            updates['/batimentIndex'] = o.batimentIndex;
            updates['/city'] = o.city;
            updates['/flats'] = o.flats;
            updates['/fullAddress'] = o.bat.fullAddress;
            updates['/immeuble'] = o.cp;
            updates['/incidents'] = null;
            updates['/immeubleIndex'] = o.immeubleIndex;
            updates['/isSyndicMember'] = o.isSyndicMember;
            userRef.update(updates);
            resolve(updates);
        }).catch(function(e){
            console.log(e);
            PopupService.show('showError');
        });
    }

    var updateUserAddressInOneSignal = function(uid, user_tag) {
        
        NotifService.sendTags(user_tag, uid).then(function(r) {          
            console.log(JSON.stringify(r));
        }), function(error) {
        };
    }

    var suggestions = function(uid){
        var deferred = $q.defer();
        var output = [];
        var ref_1 = rootRef.child('users/'+uid+'/beforeContacts');
        var beforeList = $firebaseArray(ref_1);
        var ref_2 = rootRef.child('users/')
        var users = $firebaseArray(ref_2);
        for(i=0; i < beforeList.length; i++) {
            var a = beforeList[i].$id;
            var rec = users.$getRecord(a);
            output.push(rec);
            if(i == beforeList.length-1) {
                deferred.resolve(output);
            }
        }
        return deferred.promise;
    }
    var Annonces = function(){
        return data.incidents;   
    }
    var initData = function(){
        var incidentsRef = rootRef.child('incidents');
        var incidentsByUserRef = incidentsRef.orderByChild("userIndex/"+Auth.$getAuth().uid).equalTo(true);
        return load(incidentsRef);
    }
    var data = {};
    var load = function(ref){
        var obj = $firebaseObject(ref);
        //var incidentsObj = $firebaseObject(incidentsRef);
        //var data = {};
        /*
        // to take an action after the data loads, use the $loaded() promise
        incidentsObj.$loaded().then(function(values) {

        });
    */
        // to take an action after the data loads, use the $loaded() promise
        obj.$loaded().then(function(values) {
            // To iterate the key/value pairs of the object, use angular.forEach()
            angular.forEach(obj, function(value, key) {
            });
        });
        // To make the data available in the DOM, assign it to $scope
        data = obj;

        return obj;//.$loaded();
        // For three-way data bindings, bind it to the scope instead
        // obj.$bindTo($scope, "data");
    }
    var loadAsArray = function(ref){
        var obj = $firebaseArray(ref);

        obj.$loaded().then(function(values) {
            // To iterate the key/value pairs of the object, use angular.forEach()
            angular.forEach(obj, function(value, key) {
            });
        });
        data = obj;

        return obj;//.$loaded();

    }
    var add = function(ref,data){
        var list = $firebaseArray(ref);
        return list.$add(data).then(function(ref) {
            var id = ref.key;
            list.$indexFor(id); // returns location in the array
            return id;
        });
    }
    var addCustom = function(str, data){
        var ref = rootRef.child(str);
        ref.set(data);
    }
    var indexItem = function(ref,type,key){
        var refUser = firebase.database().ref('users/'+Auth.$getAuth().uid+'/'+type);
        //+'/'+key
        var obj = $firebaseObject(refUser);
        obj.$loaded().then(function(values) {
            var d ={};
            obj[key]=true;
            //obj.usersIndex=d;
            //obj = angular.extend(obj,true);
            obj.$save().then(function(ref) {
                ref.key === obj.$id; // true
            }, function(error) {});
        });

    }
    var save = function(ref,data){
        var deferred = $q.defer();
        var obj = $firebaseObject(ref);
        obj.$loaded().then(function(){
            angular.extend(obj,data);
            //obj.foo = "bar2";
            obj.$save().then(function() {
                ref.key === obj.$id; // true
                deferred.resolve(ref);
            }, function(error) {
                console.log("Error:", error);
            });
        });

        return deferred.promise;
    }
    var setKey = function(str){
        var ref = rootRef.child(str).push();
        return ref.key();

    }
    var getByProperty = function(ref, str, prop, isDigipost){
        var _ref = rootRef.child(ref);
        var output = [];
        var today = new Date().getTime();
        var duration = 1000 * 3600 * 24; // 5 = nbOfDays (nombre de jours d'affichage du post)
        return new Promise(function(resolve) {
            _ref.orderByChild(str).equalTo(prop).on('value', function(snapshot) {
                angular.forEach(snapshot.val(),function(o,k) {
                    if (isDigipost) {
                        if (o.status === "ok" && (today - o.timeStamp <= (duration * o.nbDays))) {
                            output.push(o);
                        }
                    } else {
                        output.push(o);
                    }
                });
                resolve(output);
            }), function(error) {};
        }).catch(function(e) {
            alert(e);
            console.log(e);
        });
    }
    var checkBats = function(userCopro) {   
        //retourne [copro existante, batiment existant]
        // si batiment existant = true: [copro existante (true), batiment existant (true), id du batiment existant]
        var deferred = $q.defer();
        fbFilter('batiments', 'copro', userCopro.cadastralParcel).then(function(res) {
            if (res.length > 0) { // si la copro existe déja
                for (i=0; i<res.length; i ++) { // on parcourt son(ses) batiment(s)
                    if (userCopro.addressSelected == res[i].fullAddress) { // si même adresse entre nouveau batiment et batiment existant
                        if((userCopro.batName && res[i].name && (res[i].name == userCopro.batName)) || (!userCopro.batName && !res[i].name)) {
                            deferred.resolve([true, true, res[i].id]); // si batiment existant + user.batiment ont le même nom ou qu'ils n'ont pas de nom tous les deux: on considere que le batiment n'est pas nouveau
                        }else if (i == res.length-1){ // si condition ci-dessus jamais remplie: nouveau batiment
                            deferred.resolve([true, false]);
                        }    
                    } else if (i == res.length-1) { // si le dernier batiment parcouru n'a pas la même adresse, le batiment est nouveau 
                        deferred.resolve([true, false]);
                    }
                }
            } else { // si aucune réponse, nouvel immeuble et donc nouveau batiment
                deferred.resolve([false, false]);
            };
        }).catch(function() {
            deferred.reject();
        });
        return deferred.promise;
    }
    var getDigiPosts = function(user) {
        var deferred = $q.defer();
        getByProperty('postIts', 'copro', user.immeuble, true).then(function(res) {
            output = res;
            deferred.resolve(output);
        }), function(error) {
            console.log(error);
            deferred.reject();
        };
        return deferred.promise;  
    }
    var setCustomId = function(items) {
        var length = String(items.length+1);
        var date = new Date();
        var month = String(date.getMonth() + 1);
        month = ( month.length === 1 ) ? '0' + month : month;
        return String(date.getFullYear()) + month + "-" + length;
    }

    var getRef = function(str) {
        return rootRef.child(str);
    }
    var isEmpty = function(ref, child, val) {
        rootRef.child(ref).orderByChild(child).equalTo(val).on('value', function(snapshot) {
            var i = 0
            for (key in snapshot.val()){
                i ++;
            }
            return i === 0;
        });
    }
    var fbFilter = function(rf, child, val) {
        var deferred = $q.defer();
        var output = [];
        rootRef.child(rf).orderByChild(child).equalTo(val).on('value', function(snapshot) {
            angular.forEach(snapshot.val(),function(o,k) {
                output.push(o); 
            });
            deferred.resolve(output);
        }), function(error) {
            console.log(error);
            deferred.reject(output);
        };
        return deferred.promise;
    }
    var getOrderedBy = function(rf, child) {
        var deferred = $q.defer();
        var output = [];
        rootRef.child(rf).orderByChild(child).on('value', function(snapshot) {
            angular.forEach(snapshot.val(),function(o,k) {
                output.push(o); 
            });
            deferred.resolve(output);
        }), function(error) {
            console.log(error);
            deferred.reject(output);
        };
        return deferred.promise;
    }
    var getFbObject = function(strRef, str) {
        return $firebaseObject(rootRef.child(strRef+'/'+str));
    }
    var deleteIt = function(item) {
        var updates = {};
        updates['/postIts/'+ item._id+'/delete'] = new Date().getTime();
        return rootRef.update(updates);
    }
    var sortData = function(arr) {
        //$scope.postIts = sortNewest(postIts);
        var output = arr.sort(function(a,b){
            return a.timeStamp-b.timeStamp;
        });
        return output.reverse();
    }
    var setNewAddress = function(scopeNewAddress) {
        newAddress = scopeNewAddress;
    }

    var getNewAddress = function() {
        return newAddress;
    }
    var deleteInFirebase = function(str) {
        var ref = rootRef.child(str);
        ref.set(null);
    }

    return {
        getElement: function(ref) {
            return getElement(ref);
        },
        updateUserAddress: function(o) {
            return updateUserAddress(o);
        },
        updateUserAddressInOneSignal: function(uid, user_tag) {
            return updateUserAddressInOneSignal(uid, user_tag);
        },
        setNewAddress: function(scopeNewAddress) {
            return setNewAddress(scopeNewAddress);
        },
        getNewAddress: function() {
            return getNewAddress();
        },
        sortData: function(arr) {
            return sortData(arr);
        },
        checkBats: function(userCopro) {
            return checkBats(userCopro);
        },
        fbFilter: function(rf, child, val) {
            return checkBats(rf, child, va);
        },
        getFbObject: function(strRef, str) {
            return getFbObject(strRef, str);
        },
        delete: function(item) {
            return deleteIt(item);
        },
        getOrderedBy: function(rf, child) {
            return getOrderedBy(rf, child);
        },
        getDigiPosts: function (user) {
            return getDigiPosts(user);
        },
        setCustomId: function (posts) {
            return setCustomId(posts);
        },
        get: function(user){
            return get(user);
        },
        getRef: function(str) {
            return getRef(str);
        },
        isEmpty: function(ref, child, val) {
            return isEmpty(ref, child, val);
        },
        suggestions: function(uid) {
            return suggestions(uid);
        },
        getByProperty: function(ref, str, prop, isDigipost) {
            return getByProperty(ref, str, prop, isDigipost);
        }, 
        addCustom: function(str, val) {
            return addCustom(str, val);
        },
        setKey: function(str) {
            return setKey(str);
        },
        fbArray: function(str) {
            return $firebaseArray(rootRef.child(str));
        },
        fbObj: function(str) {
            return $firebaseObj(rootRef.child(str));
        },
        initData:function(){
            return initData();
        },      
        load:function(ref){
            return load(ref);
        },      
        loadAsArray:function(ref){
            return loadAsArray(ref);
        },
        add:function(ref,data){
            return add(ref,data);
        },      
        indexItem:function(ref,type,key){
            return indexItem(ref,type,key);
        },      
        save:function(ref,data){
            return save(ref,data);
        },      
        data:function(){
            return data;
        },
        getChild:function(n){
            return data[n];
        },
        getParent:function(n){
            return data[n];
        },
        deleteInFirebase:function(str){
            return deleteInFirebase(str);
        }
        //Annonces();
    }
});

appServices.factory("LoggedInUser", function() {
    var Annonces = function(){
        return true;   
    };

    return Annonces;
});

appServices.factory ('IgnApiService', function ($q){
    return {

        formatString: function(location) {
            if(location[0]=='0'){  //si l'utilisateur tape '08' on transforme ce résultat en '8' (l'API ne reconnait pas '08' mais '8')
                location = location.slice(1, location.length);
            }
            for(i=0; i<location.length; i++){ // si dans la string tapée on a un chiffre et que le caractère juste après existe, que c'est une lettre, que ce n'est pas un espace: 
                if (!isNaN(parseInt(location[i])) && isNaN(parseInt(location[i+1])) && location[i+1] && location[i+1] !== ' '){
                    var first = location.slice(0, i+1);
                    var last = location.slice(i+1, location.length);
                    var newLocation = first+' '+last; // on ajoute un espace entre le caractere chiffre et le caractere lettre
                    location = newLocation;
                }// le but est de pouvoir taper '2bis' alors que l'autocomplétion ne comprend que '2 bis'
            }
            return location;
        },

        //fonction qui récupère dans l'API IGN toutes les adresses correspondant aux caractères tapés dans la barre de recherche
        suggest: function(form, data){
            var defer = $q.defer();
            var obj = {
                displayResult: false,
                showButton: false,
                str: "",
                suggestions: []
            };
            var location = form.typed; 
            var resultDiv = form.result; // balise html dans laquelle on affiche le 'select' des résultats
            location = this.formatString(location);

            var fo= {} ;
            fo.territory = [data.foString]; // data.foString est égal au numero de département sélectionné dans le 'select'
            fo.type = ["StreetAddress"]; // on filtre les résultats dans l'API qui ne cortrespondent qu'à des adresses de rue (pas de lieu dits genre 'tour eiffel...') 
            try {
                Gp.Services.autoComplete({
                    text: location,
                    apiKey: "22726iz9m8ficsgf2hmiicpd",
                    filterOptions: fo,
                    onSuccess: function(result) {
                        obj.displayResult = true; // boolean pour afficher le résultat dans ma balise html dont l'id est 'result'
                        obj.showButton = true; // le bouton pour valider le choix parmis les suggestions est affiché
                        var index= [];

                        if (result.suggestedLocations) {
                            for (i=0; i<result.suggestedLocations.length; i++) {
                                var loc= result.suggestedLocations[i] ;
                                obj.str+= '<option value="'+i+'">'+loc.fullText+'</option>';
                                obj.suggestions.push(loc);// le 'select' est un tableau des résultats sont implémentés avec le même index pour les résultats
                                obj.displayResult = true
                            }

                        }
                        if (location.length < 4){ // tant qu'il y a moins de 3 caractères tapés, on affiche pas le résultat des suggestions
                            obj.displayResult = false;
                            obj.showButton = false;

                        }else{    
                            obj.displayResult = true;
                        }
                        defer.resolve(obj);   
                    },
                    onFailure: function(error) {
                        defer.reject()
                    }
                });
            } catch (e) {
                console.log("Erreur IgnApiService.suggest() : ", e);
            }
            return defer.promise;
        },

        setUserFullAdress: function(data, form) { // Cette fonction complète la précédente: une fois qu'on a sélectionné une adresse suggérée, on 'redonne' cette adresse suggérée à l'API pour qu'elle nous retourne tous ses attributs (parcelle cadastrale, etc...)
            var defer = $q.defer();
            var obj = {
                displayResult: false,
                cadastralParcel: "",
                showButton: false,
                city: {},
                street: {},
                addressSelected: ""
            };
            obj.displayResult = false;

            obj.streetNumber = data.streetNumber ? data.streetNumber : {};
            var postalCode = data.foString;
            //*** : toutes les balises html correspondant aux champs à compléter par l'utilisatuer sont complétées avec les résultats de l'autocomplétion
            if (data.selectedSuggestion){
                obj.addressSelected = data.selectedSuggestion.fullText;
                ((function(addressSelected){   // fonction de l'API pour retourner la parcelle cadastrale et tous les autres attributs de l'adresse
                    Gp.Services.geocode({       // elle prend en paramètre la string de l'adresse sélectionnée
                        apiKey : "22726iz9m8ficsgf2hmiicpd",
                        location : addressSelected,  
                        filterOptions : {
                            type : ["StreetAddress"]
                        },
                        onSuccess : function (result) {  // en cas de succès de fonction: s'il y a match entre l'adresse donnée en paramètres et l'adresse qui existe dans l'API:

                            obj.postalCode = result.locations[0].placeAttributes.postalCode;  // dans result, ce qui nous intéresse, c'est l'attribut 'location', et plus particulièrement le 1er index
                            obj.city = result.locations[0].placeAttributes.municipality;     // c'est le match le plus précis par rapport à l'adresse rentrée en paramètres
                            obj.street = result.locations[0].placeAttributes.street;        // toutes le infos qui nous intéressent sont récupérées (rue, numéro, ville, code postal...)        
                            
                            if(result.locations[0].placeAttributes.number != undefined){
                                obj.streetNumber = result.locations[0].placeAttributes.number;
                            }

                            var positionX = result.locations[0].position.x;  // les coordonnées GPS 'lat' et 'long' sont aussi récupérées pour être envoyées en paramètres de la fonction qui récupère la parcelle cadastrale 
                            var positionY = result.locations[0]. position.y;
                            ((function(positionX, positionY){

                                Gp.Services.reverseGeocode({
                                    apiKey : "22726iz9m8ficsgf2hmiicpd", 
                                    position : {                         
                                        x: positionY,
                                        y: positionX
                                    },
                                    filterOptions : {
                                        type : ["CadastralParcel"]    
                                    },
                                    onSuccess : function (result) {
                                        obj.cadastralParcel = result.locations[0].placeAttributes.cadastralParcel;
                                        obj.city = result.locations[0].placeAttributes.municipality;
                                        obj.show = true;
                                        defer.resolve(obj);
                                    }

                                });
                            }))(positionX, positionY);
                        }
                    });
                })(obj.addressSelected));
            }    
            obj.showButton = false;  
            return defer.promise;
        }

    }      
});

appServices.factory('NotifService', function (Utilities, PopupService) { 
    return {
        sendNotif: function(type, _userCopro, _itemId, msgTxt, recieverId, senderId) {
            //type : ""
            return new Promise (function(resolve, reject) {
                var itemId = _itemId;
                var notifTxt; 
                var userCopro = _userCopro;
                var userId = (recieverId) ? recieverId : "";
                if(type === 'incident') {
                    notifTxt = 'Un nouvel incident a été déclaré dans votre copropriété.';
                } else if (type === 'message' || type === 'messages') {
                    notifTxt = msgTxt;
                } else if (type === 'invitation') {
                    notifTxt = senderId+' vous invite à rejoindre son réseau.';
                } else {
                    notifTxt = 'Un nouveau mot a été posté dans votre copropriété.';
                }
                
                var notif = {
                    type: type,
                    id: itemId,
                    txt: notifTxt,
                    copro: userCopro,
                    userId: userId,
                    senderId : senderId
                }

                Utilities.sendNotif(notif).then(function(res) {
                    resolve(res);    
                }), function(error) {};
            }).catch(function(e){
                console.log(e);
            })
        },    
        sendTags: function (user_tag, uid) {
            return new Promise (function(resolve) {
                user_tag['uid'] = uid;
                window.plugins.OneSignal.sendTags(user_tag);
                resolve(user_tag);
            }).catch(function(e){
                console.log(e);
                resolve('ok');
            });
            
        }          
    }
});    

appServices.factory('Confirm', function (PopupService, $ionicPopup, Animate) {
    return {
        showConfirm: function(scope, template, title, subtitle, btn_text, forgotPass, groupeId){
            var confirm = false;

            var myPopup = $ionicPopup.show({
                template: template,
                title: title,
                subTitle: subtitle,
                scope: scope,
                buttons: [
                    { text: 'Annuler' },
                    {
                        text: btn_text,
                        type: 'button',
                        onTap: function(e) {
                            if(e){
                                confirm = true; 
                            }
                            if ((!scope.form || !scope.form.mail) && !scope.data.newName) {
                                e.preventDefault();
                            } else { 
                                return scope.data.newName || scope.form.mail;
                            }
                        }
                    }
                ]
            });
            myPopup.then(function(res) {
                if(confirm == true){
                    if(forgotPass){
                        firebase.auth().sendPasswordResetEmail(scope.form.mail).then(function() {
                            PopupService.show('emailWasSentFromFirebase', scope.form.mail);
                        }).catch(function(){   
                            PopupService.show('displayFirebaseCodeError', scope.form.mail);
                            myPopup.close();   
                        });    
                    } else if (scope.data && scope.data.newName) {
                        scope.giveName(groupeId, scope.data.newName);
                    }  
                }    
            });
        },
        confirmPopUp: function(func, title, btn_text, param, templateTxt) {
            var confirm = false;
            var txt = templateTxt ? templateTxt : "";
            var myPopup = $ionicPopup.show({
                title: title,
                template : txt,
                buttons: [
                    { text: 'Annuler' },
                    {
                        text: "<b>"+btn_text+"</b>",
                        type: 'button',
                        onTap: function(e) {
                            if(e){
                                confirm = true; 
                            }
                        }
                    }
                ]
            });
            myPopup.then(function(res) {
                if (confirm == true) { 
                    param ? func(param) : func();
                }    
            });
        },
        addStreetNumber: function(scope, template, title) {
            Animate.loadEnd()
            var confirm = false;
            var myPopup = $ionicPopup.show({
                template: template,
                title: title,
                scope: scope,
                buttons: [
                    { text: 'Non merci' },
                    {
                        text: "<b>Confirmer</b>",
                        type: 'button',
                        onTap: function(e) {
                            if(e){
                                confirm = true; 
                            }
                        }
                    }
                ]
            });
            myPopup.then(function(res) {
                if (confirm === true) {
                    scope.addStreetNumber();
                } else {
                    scope.o.streetNumber = ""; 
                    //delete scope.o; 
                }     
            });   
        }
    }    
});

appServices.factory('SyndicService', function ($q, DataService, $ionicPopup) {
    return {
        getConseil: function(copro) {
            return new Promise(function(resolve, reject) {
                var output = [];
                DataService.getByProperty('users', 'immeuble', copro).then(function(res){
                    for (i=0; i< res.length; i ++) {
                        if (res[i].isSyndicMember === true) {
                            output.push({
                                formatedName: res[i].formatedName,
                                mail: res[i].mail,
                                imageUrl: res[i].imageUrl       
                            });
                        }   
                    }
                    resolve(output);
                }), function(error) {}
            }).catch(function(e) {
                PopupService.show('showError', e);
            });  
        },

        get: function(copro, str1, str2, isSyndic) { 
            var defer = $q.defer();
            rootRef.child('immeubles/'+copro+'/'+str1).on('value', function(snapshot) {
                var id = snapshot.val();
                rootRef.child(str2+'/'+id).on('value', function(snapshot){
                    var obj = snapshot.val();
                    if (isSyndic) {
                        (obj && obj.mail) ? defer.resolve(obj) : defer.resolve(false);        
                    } else {
                        if (obj && obj.mail) {
                            var gestionnaire = {
                                mail: obj.mail,
                                formatedName: obj.formatedName
                            };
                            obj.mobile ? gestionnaire.phone = obj.mobile : gestionnaire.phone = obj.phone;
                            defer.resolve(gestionnaire);     
                        } else {
                            defer.resolve(false); 
                        }  
                    }
                    
                }), function(error) {
                    defer.reject(error);
                };
            }), function(error) {
                defer.reject(error);
            };  
            return defer.promise;
        }
    }
});
/*appServices.service('UserService', function() {

//for the purpose of this example I will store user data on ionic local storage but you should save it on a database

  var setUser = function(user_data) {
    window.localStorage.starter_facebook_user = JSON.stringify(user_data);
  };

  var getUser = function(){
    return JSON.parse(window.localStorage.starter_facebook_user || '{}');
  };

  return {
    getUser: getUser,
    setUser: setUser
  };
});
*/

appServices.factory('PopupService', function ($ionicPopup) {
    if(ionic.Platform.isIOS()) {
        var noIosPopup = '';
    } else {
        var noIosPopup = 'noIosPopup';
    }
    return{
        show: function (o, param, param2) {
            var a = this.popups(param, param2);
            var popup = a[o];
            $ionicPopup.alert({
                cssClass: noIosPopup,
                title: popup.title,
                template: popup.template
            });     
        },
    
        popups: function (param, param2 ){  
            var popup = {
              /*INSCRIPTION*/
              alertPhoneProblem: {
                  title: 'Numéro de téléphone incorrect :(',
                  template: "Votre numéro ne semble pas correspondre à un numéro valide. Etes-vous sûr de l'avoir correctement saisi?"
              },
              alertIncomplete: {
                  title: 'Infos incomplètes :(',
                  template: "Il vous reste encore certains champs à compléter avant de pouvoir poursuivre."
              },
              invalidStreetNumber: {
                  title: 'Numéro de voie non valide',
                  template: "Veuillez saisir un nouveau numéro."
              },
              redirectToLogin: {
                  title: "Adresse mail déjà utilisée",
                  template: "Cette adresse mail est déjà associée à un compte. Vous pouvez vous essayer de vous connecter avec pour accéder au service ou finir de compléter les information de votre inscription"  
              },
              pwIsTooShort: {
                  title: "Mot de passe trop court",
                  template: "Votre mot de passe doit être égal à au moins six caractères."  
              },
              /*LOGIN*/ 
              badlyFormatedEmail: {
                  title: 'oh oh...',
                  template: "Il semble qu'il y ait une erreur de saisie dans votre email."
              }, 
              mismatch: {
                  title: 'Mots de passe non identiques',
                  template: 'Vos deux mots de passe doivent correspondre'
              },
              /*DIGIPOSTS*/
              showLimitedMokolesPerHour: {
                  title: 'Délais trop court entre deux posts!',
                  template: 'Vous pourrez coller un nouveau mot dans '+param+' minutes'
              },
              postsLimitExceeded: {
                    title: "Vous ne pouvez poster plus de 4 posts toutes les 24h.", 
                    template: "Vous pourrez reposter un mot dans "+param+"."   
              },
              limitPostModifs: {
                    title: "Limite de modifications atteinte", 
                    template: "Vous ne pouvez modifier plus de 4 fois un même mot."
              },
              /*PROFILE*/
              modifiedWithSuccess: {
                  title: 'Félicitations!',
                  template: "Votre profile a bien été modifié."
              }, 
              showLContactAlert: {
                  title: 'Succès',
                  template: 'Contact ajouté!'
              },
              alertCreateUserWithEmailAndPassword: {
                  title: param,
                  template: param
              },
              alertCameraFailure: {
                  title: 'Erreur de la photo',
                  template: 'Causes de cette erreur: ' + param
              },
              alertIdenticalUser: {
                  title: 'Utilisateur déjà enregistré!',
                  template:  "Les informations que vous avez fournies sont identiques à celles d'un autre utlisateur: nous ne pouvons donc vous enregistrer."
              },
              alreadySelectedForChat: {
                  title: 'Utilisateur déjà choisi(e)',
                  template: "Vous avez déjà sélectionné "+param+" pour faire partie de cette nouvelle discussion."
              },
              showError: {
                  title: 'Une erreur est survenue',
                  template: "L'opération n'a pu aboutir, veuillez recommencer."
              },
              showIncomplete: {
                  title: 'Informations incomplètes',
                  template: "L'étage et le lieu de l'incident sont nécessaires à sa déclaration."
              },
              showSuccessInscription: {
                  title: "Félicitations!",
                  template: "Vous venez de rejoindre la communauté de MySpotiHome et le réseau de voisinage de votre résidence. Utilisez nos services et invitez vos voisins à vous rejoindre, pour créer votre réseau de voisinage… Grâce à MySpotiHome, simplifiez-vous le quotidien et celui de vos voisins !"
              },
              displayFirebaseCodeError: {
                  title: "Erreur lors de la saisie de votre adresse mail",
                  template: "Assurez-vous d'avoir correctement saisi votre adresse mail dans 'identifiant'. Cette adresse doit être celle que vous utilisez pour vous connecter à cette application."
              },
              emailWasSentFromFirebase: {
                  title: "Email envoyé avec succès!",
                  template: "Un lien pour réinitialiser votre mot de passe vous a été envoyé à l'adresse "+param+" ."
              },
              showProvider: {
                  title: "Provider:",
                  template: param
              },
              showSendInvitation: {
                  title:  'Inviter '+param,
                  template: 'Souhaitez-vous inviter '+param2+' à rejoindre votre réseau?'
              },
              showContactAlreadyAdded: {
                  title: "Contact déjà existant.",
                  template: param+" fait dèjà parti de vos contacts."
              },
              selectAFile: {
                  title: "Aucune photo choisie",
                  template: "Vous devez choisir une photo pour modifier votre profile."
              },
              showIncidentUpdatedTooSoon: {
                  title: 'Echec mise à jour incident',
                  template: "Un même incident ne peut pas être mis à jour plus d'une fois par heure! Dernière mise à jour: il y a "+Math.round(param/60)+" minutes."
              },
              showClosedIncident: {
                  title: "Félicitation",
                  template: "Suite à votre demande, cet incident a bien été clos."
              },
              showMustAddDescription: {
                  title: 'Echec de mise à jour incident',
                  template: "Vous devez ajouter des précisions pour que votre modification soit prise en compte."
              },
              newPostAdded: {
                  title: 'Félicitations!',
                  template: "Vous venez de poster un nouveau message pour votre immeuble."
              },
              incidentUpdated: {
                  title: 'Félicitations!',
                  template: "Votre mise à jour de l'incident est désormais accessible à tous les membres de votre copropriété!"
              },
              incidentAdded: {
                  title: 'Nouvel incident créé',
                  template: "Le nouvel incident que vous avez créé est porté a l'attention de votre syndic. Il est aussi visible par tous les membres de votre immeuble."
              },
              wrongMail: {
                  title: "Adresse mail inconnue",
                  template: "Nous ne reconnaissons pas cette adresse. Assurez-vous d'avoir saisi la bonne adresse mail."
              },
              wrongPassword: {
                  title: "Mot de passe incorrect",
                  template: "Soit votre login soit votre mot de passe est incorrect. En cas d’oubli, vous pouvez changer votre mot de passe avec le lien « mot de passe oublié »."
              },
              verificationEmailHAsBeenSent: {
                  title: "Confirmation de votre adresse mail",
                  template: "Un email de confirmation vous a été envoyé à l'adresse mail que vous avez indiquée lors de la création de votre compte. Suivez le lien d'activation pour valider votre compte et accéder à l'application."
              },
              debug: {
                  title: "debug: ",
                  template: param  
              },
              underAge: {
                  title: "Moins de 18 ans",
                  template: "Vous devez être majeur pour accéder aux services de cette application."  
              },
              mustCkeckMajority: {
                  title: "Avez-vous plus de 18 ans ?",
                  template: "Vous devez cocher la case \"J'ai 18 ans ou plus\" pour confirmer que vous êtes majeur (si vous l'êtes)."
              },
              dateIncorrect: { 
                  title: "Date non-valide", 
                  template: "Assurez-vous d'avoir saisi une date de naissance valide."   
              },
              noStreetNumber: { 
                  title: "Aucun numéro de rue détecté", 
                  template: "Veuillez saisir de nouveau votre adresse en respectant l'ordre: n° de voie, type de voie(rue, avenue...) et votre ville. Vous devrez sélectionner la proposition qui correspond à votre adresse."   
              },
              mustAcceptCGU: { 
                  title: "CGU non acceptées", 
                  template: "Vous devez avoir lu et accepter les conditions générales d'utilisation avant de poursuivre."   
              },
              missingFloor: {
                    title: "Quel est votre étage?", 
                    template: "Vous n'avez pas renseigné votre étage."   
              },
              showPhoneNumber: {
                    title: "Vos infos sims", 
                    template: param   
              },
              notifsCallBack: {
                    title: "Notifs callback", 
                    template: param
              },
              notModified: { 
                    title: "Tout compte fait ...", 
                    template: "Vous annulez votre modification." 
              }, 
              modifImage: { 
                    title: "Félicitations!", 
                    template: "Votre photo a bien été modifiée." 
              }
            }
            return popup;
        }
    }           
});