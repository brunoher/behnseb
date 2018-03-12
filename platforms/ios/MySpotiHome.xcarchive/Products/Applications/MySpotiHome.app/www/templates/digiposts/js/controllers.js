appControllers.controller('digipostCtrl', function ($timeout, Confirm, Abuse, $mdToast, $mdDialog, $mdBottomSheet, $localStorage, $ionicModal, $scope, Animate, $state, Utilities, DigipostService, PopupService, DataService,$rootScope, $ionicScrollDelegate) { 

    $scope.closeModal = function() {
        $scope.modal.hide();
    }

    $scope.showModal = function(card){
        $scope.card = card;
        $ionicModal.fromTemplateUrl('templates/digiposts/html/digipost-modal.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function(modal) {
          $scope.modal = modal;
          $scope.modal.show();
        })
    }  

    /*$scope.scrollToBottom = function() {
        $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();
    };*/

    /*--------------Nav--------------*/    
    $scope.back = function () {
        $state.go('app.homeDashboard')
    }

    $scope.toEdit = function (edit) {
        if ($scope.currentCard) {
            DigipostService.setData(edit, $scope.currentCard);
        }else {
            DigipostService.setData(edit, false);
        }
        $state.go('app.newAnnonce');
    }

    /*-------------------------------*/

    $scope.$on( "$ionicView.enter", function(scopes, states) {
        if (DigipostService.getProv() == 'edit'){
            DigipostService.setProv('noEdit');
            $scope.loadPosts.then(function(res){
                DigipostService.setData(false);
            });
        }
    });

    /*-------------------Style selon devices---------------------*/
    var isIos = ionic.Platform.isIOS();
    var currentPlatformVersion = ionic.Platform.version();
    var postWidth;
    var postHeight;
    var left;
    var screenHeight = window.screen.height;
    var screenWidth = window.screen.width;
    var textPost_top;
    var imgContainer_top;
    var txtUnderImg_top = 145;
    var btnShowMore_bot = -90;
    var img_height; 
    if (screenHeight > 1000) {
        if (screenHeight >  1000 && screenHeight < 1050) {
            img_height = 350;
            textPost_top = -1;
            imgContainer_top = 10;
        } else {
            img_height = 300;
            textPost_top = -1.5;
            imgContainer_top = 40;
        }
        btnShowMore_bot -=7;
        postWidth = screenWidth - 200;
        postHeight = screenHeight - 185;
        left = 6;
        
    } else {
        btnShowMore_bot -=4;
        postWidth = screenWidth - 50;
        postHeight = screenHeight - 175;
        left = 5;
        textPost_top = -1.1;
        imgContainer_top = -30;
        img_height = 400;
    }
    if (!isIos) {
        textPost_top -= 3.1;
        txtUnderImg_top += 10;
        btnShowMore_bot -= 10;
    }
    if (screenWidth < 365) {
        txtUnderImg_top -= 25;
        btnShowMore_bot += 20;
    }
    var coefFontSize = 2.5/800;
    
    var vpHSize = screenHeight*coefFontSize + 1;
    var vpHSize_Date = postWidth / 18;
    $scope.postSize = {'width':postWidth+'px', 'height':postHeight+'px', 'left':left+'em'};
    $scope.fontSize = {'font-size': vpHSize+'vh'};
    $scope.fontSizeDate = {'font-size': vpHSize_Date+'px'};
    $scope.textPost_top = {'top': textPost_top+'em'};
    $scope.imgContainer_top = {'top': imgContainer_top+'%'};
    $scope.textUnderImg_top = {'top': txtUnderImg_top+'%'};
    $scope.showMore_top = {'bottom': btnShowMore_bot+'%'};
    $scope.digipostImg_height = {'height' : img_height+'%'};

    /*-----------------------------------------------------------*/
    

    /*------------------Déclarer un abus-------------------------*/
    $scope.abuseSelect = null;

    $scope.openAbusePrompt = function(ev,cardId) {
        var abuse = {};
        $mdDialog.show({
            templateUrl: 'dialog-select-template.html',
            scope: $scope,
            preserveScope: true,
            targetEvent: ev
        }).then(function(result) {
            if ($scope.abuseSelect !== null) {
                abuse.cat = $scope.abuseSelect;
                if ($scope.abuseSelectDetails) {
                    abuse.text = $scope.abuseSelectDetails;
                }
                //console.log('résultat: ', result, $scope.abuseSelect);
                var sendAbuse = function() {
                    $scope.status = 'Signalement effectué ';
                    showSimpleToast( $scope.status);
                    newAbuseRequest(abuse, cardId);    
                }
                var title = "Confirmez vous votre signalement?";
                var btn_txt = "Envoyer";
                Confirm.confirmPopUp(sendAbuse, title, btn_txt);     
            } else {
                //console.log('ok');
                $scope.status = "Vous devez sélectionner une catégorie d'abus";
                showSimpleToast( $scope.status); 
            }   
        }, function() {
            $scope.status = 'Signalement annulé';
            showSimpleToast( $scope.status);
        });
        $mdBottomSheet.hide();
    };

    $scope.closeAbusePrompt = function() {   
        $mdDialog.hide();
    };

    var toastPosition = {
        bottom: false,
        top: true,
        left: false,
        right: true
    };

    var showSimpleToast = function(text) {
        //var pinTo = $scope.getToastPosition();
        $mdToast.show(
            $mdToast.simple()
            .textContent(text)
            .position(toastPosition)
            .hideDelay(3000)
        );
    };

    var newAbuseRequest=function(abuse, cardId){
        //var abuse = {details:text,signaledUser:text};
        var req = Abuse($localStorage.userLogin.id).create(abuse, cardId);
        //console.log(req);
    }

    /*-----------------------------------------------------------*/
    
    $scope.displayActionSheet = function(card) {
        $scope.showActionSheet = true;
        $scope.currentCard = card;
    };
    
    $scope.hideActionSheet = function() {
        $scope.showActionSheet = false;
    };

    $scope.delete = function() {
        DataService.delete($scope.currentCard);
        $scope.postIts.splice($scope.cardIndex, 1);
        Animate.loadStrt(2000)
        initCards($scope.postIts).then(function(res){
            $scope.hideActionSheet();
            Animate.loadEnd();
        }), function(error) {
            console.log(error);
            PopupService.show('showError');
        }
    }

    $scope.edit = false;
    //$scope.$on( "$ionicView.enter", function(scopes, states) {
    /*
    J'ai du faire ce fix parce que sinon ça chargeait avant que l'utilisateur soit loaded
    */
    //$scope.loadPosts;
    $scope.initPostIts = function(){
        if($scope.postIts && $scope.postIts.length){
            $scope.postIts = DigipostService.get();
            initCards($scope.postIts).then(function(success){
                
            }), function(e){
                console.log(e);
            }
        }else{
            $scope.loadPosts = new Promise(function(resolve, reject){
                $scope.postIts = [];
                Animate.loadStrt(30000);
                DataService.getDigiPosts($rootScope.currentUser).then(function(postIts) {
                    DigipostService.loadPostIts(postIts).then(function(result) {   
                        if (!$scope.nothingToDisplay.content) {
                            new Promise(function(resolve) {
                                var _data = {
                                    undeleted: [],
                                    userPosts: []
                                }
                                for (i=0; i<result.length; i++) {
                                    if (result[i].delete == false) {
/**/                                    result[i].content = result[i].content.replace(/nbsp;/g, " ");                                        
                                        _data.undeleted.push(result[i]);
                                    }
                                    if (result[i].creatorId == $rootScope.currentUser.id){

                                        _data.userPosts.push(result[i]);
                                    }
                                }
                                resolve(_data);
                            }).then(function(res) {
                                var posts = Utilities.sortByValue(res.userPosts, 'timeStamp');
                                DigipostService.setUserPosts(posts);
                                DigipostService.setCoproPosts(res.undeleted);
                                initCards(res.undeleted).then(function(success){
                                    swipeAllCards(success).then(function(res) {
                                        console.log(res);
                                        Animate.loadEnd();
                                        $scope.cardSwiped($scope.cards[0]); 
                                    }), function(error) {
                                        console.log(error);
                                    }
                                    resolve(success);
                                }), function(error) {
                                    console.log(error);
                                };
                            }).catch(function(e) {
                                console.log(e);
                                PopupService.show('showError');
                            });
                        } else {
                            resolve(result);
                        }    
                    }), function (err){
                        PopupService.show('showError');
                        console.log(err);
                    };

                }), function(error){
                    PopupService.show('showError');
                    console.log(error);
                };
            }).catch(function(e){
                console.log(e);
                PopupService.show('showError');
            })    
        }   
    }
    //});

    $scope.nothingToDisplay = {};

    function initCards(result) {
        $scope.postIts = result;
        return new Promise(function(resolve) {
            $scope.cards = Array.prototype.slice.call($scope.postIts, 0);
            $scope.tempCard = $scope.postIts[0];
            resolve($scope.cards);      
        }).catch(function(e) {
            console.log(e);
            PopupService.show('showError');
        })
    }
    function swipeAllCards (cardsResolved) {
        return new Promise(function(resolve) {
            for (var i = 0, length = cardsResolved.length; i < length; i ++) {
                $scope.cardSwiped(cardsResolved[i]);
            }
            resolve(cardsResolved); 
        }).catch(function(e) {
            alert(e);
        });
    }

    /*-------------SwipeCards---------------*/
    $scope.cardIndex = -1;
    $scope.rank = 1; 

    $scope.cardSwiped = function(card) {
        if ($scope.cardIndex < $scope.cards.length - 2){
            $scope.cardIndex += 1;
        }else{
            $scope.cardIndex = 0;
        }
        $scope.rank = $scope.cardIndex+1;
        var a = $scope.postIts[$scope.rank - 1].content.length;
        a > 100 ? $scope.showMore = true: $scope.showMore = false;
        $scope.addCard($scope.cardIndex);
        $scope.cardDestroyed();
    };

    $scope.cardDestroyed = function() {
        $scope.cards.splice($scope.cardIndex, 1);
    };

    $scope.addCard = function(cardIndex) {
        if($scope.tempCard == false) {
            var newCard = $scope.postIts[cardIndex];
            //console.log('no tempCard', newCard);
            $scope.cards.push(angular.extend({}, newCard));
        } else {
            //console.log('tempCard: ', $scope.tempCard);
            $scope.cards.push(angular.extend({}, newCard));
            $scope.cards.push(angular.extend({}, $scope.tempCard));
            $scope.tempCard = false;
        }
    }
    /*--------------------------------------*/
});


appControllers.controller('digipostEditCtrl', function ($scope, $rootScope, DigipostService, StorageService, PopupService, Utilities, $ionicPopup, $state, $timeout, $ionicLoading) {
    var screenHeight = window.screen.height;
    var postWidth;
    var coefFontSize = 2.5/800;
    var postHeight;
    var vpHSize = screenHeight * coefFontSize * 0.6 + 2;
    var left;
    if (screenHeight > 1000) {
        postWidth = window.screen.width - 250 + screenHeight/30;
        postHeight = screenHeight - 375 + screenHeight/10;
        left = 1.4;  
    } else {
        postWidth = window.screen.width - 60 + screenHeight/30;
        postHeight = screenHeight - 135;
        left = 0.6;
    }
    $scope.postSize = {'width':postWidth+'px', 'height':postHeight+'px', 'left':left+'em', 'top':'1em'};
    $scope.fontSize = {'font-size': vpHSize+'vh'};
    $scope.btnPosition = {'margin-top': screenHeight+'px'};
    if($scope.isIpad === true) {
        $scope.btn_width = 50;
    } else {
        $scope.btn_width = 80;
    }

    $scope.$on( "$ionicView.leave", function() {
        $scope.newPost.content = "";
        DigipostService.setData(false, {});
    });

    $scope.$on( "$ionicView.enter", function() {
        $scope.postIts = DigipostService.get();
        $scope.userPosts = DigipostService.getUserPosts();
        var data = DigipostService.getData();
        $scope.newPost = {
            creator: $rootScope.currentUser.formatedName,
            creatorId: $rootScope.currentUser.id,
            timeStamp: new Date().getTime(),
            content: '',
            img: '',
            status: 'ok'
        }
        if(data['card']) {
            $scope.newPost.content = data.card.content;
            $scope.card = data.card;
            //$scope.newPost.img = data.card.img;
            /*$scope.img = {
                src: data.card.img
            };*/          
        }
        $scope.edit = data.edit;
        $scope.img = {
            src: false
        };
        //$scope.newImg = $scope.img.src; 
    });

    $scope.post = function(image){    
        var date = new Date().getTime();
        if($scope.userPosts && $scope.userPosts.length > 4) {
            var length = $scope.userPosts.length;
            var post = $scope.userPosts[4]
            var _24h = 24*3600*1000;
            var timeLeft = Utilities.timeBetweenTimeStamps(post.timeStamp, date, _24h);
        }        
        if ($scope.newPost && $scope.newPost.content && $scope.newPost.content.length >= 5) {
            var persistTimeStamp = StorageService.get('persistTimeStamp');
            var timeElapsed = DigipostService.timeBetweenTwoPosts(persistTimeStamp);
            if (!isNaN(parseInt(timeElapsed)) && timeElapsed < 3 && $scope.edit == false) { // 300 correspond au nombre de secondes que l'utilisateur doit attendre avant de pouvoir poster un nouveau 'mokolé'
                var timeBeforeNextPost = Math.round((300 - timeElapsed) / 60);
                PopupService.show('showLimitedMokolesPerHour', timeBeforeNextPost);
            } else if ($scope.edit == false && post && (date - post.timeStamp < _24h)) {
                PopupService.show('postsLimitExceeded', timeLeft);
            } else if ($scope.edit !== false && $scope.card.modifs > 3){
                PopupService.show('limitPostModifs');
            } else { 
                var head; var body;
                if ($scope.edit == false) {
                    var oldCard = false;
                    head = 'Vous postez un nouveau mot.';
                    body = "Le contenu de ce mot sera accessible à l'ensembe de votre copropriété. Confirmez-vous l'action?";
                } else {
                    var oldCard = $scope.card;
                    head = 'Vous modifier votre mot.';
                    body = "Validez-vous les modifications apportées?";
                }
                var confirmPopup = $ionicPopup.confirm({
                    title: head,
                    template: body
                });
                confirmPopup.then(function(res) {
                    if (res) {
                        $ionicLoading.show({
                            template: 'Votre mot est ajouté...'
                        });
                        DigipostService.add($scope.postIts, $scope.newPost, oldCard).then(function(result){
                            DigipostService.edit(image, $scope.newPost, $rootScope.currentUser, oldCard).then(function(notif) {
                                /*if ($scope.cards[0] && $scope.cards[0].noPosts == true) {
                                    console.log('1', $scope.postIts);
                                    $scope.postIts.splice(0, 1, newPost);
                                    console.log($scope.postIts);

                                }else if ($scope.edit == true) {
                                    var a = $scope.postIts.indexOf(oldCard);
                                    console.log('2', $scope.postIts);
                                    console.log('2', $scope.postIts[a]);
                                    $scope.postIts.splice(a, 1, newPost);
                                    console.log($scope.postIts);
                                }else {
                                    console.log('3', $scope.postIts);
                                    $scope.postIts.splice(0, 0, newPost);  
                                    console.log($scope.postIts);
                                }
                                Animate.loadStrt(2000);
                                initCards($scope.postIts).then(function(r) {
                                    console.log(r, r.length);
                                    Animate.loadEnd();
                                }), function(error) {
                                    PopupService.show('showError');
                                };*/
                                DigipostService.setProv('edit');
                                $ionicLoading.hide();
                                $state.go('app.listAnnonces');

                                //$scope.cards.push(angular.extend({}, newPost));

                            }), function(error) {
                                console.log(error);
                            };  
                        }), function(e){
                            console.log(e);
                        };
                    }
                });
            } 
        }
    }

    $scope.takePicture = function(index, img) {    
        $scope.showActionSheet = false;
        Utilities.takePicture(index, img, false, false).then(function(result){
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
        $scope.$broadcast('scroll.refreshComplete'); 
    }
});
