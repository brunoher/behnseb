appServices.service('Poster', function ($log, $q, Auth, $cordovaCamera) {
    $log.log('Hello from your Service: Poster in module main');
    this.Uploader = function () {
        Object.defineProperty(this, "FULL_IMAGE_SPECS", {
            /**
             * @return {number}
             */
            get: function () {
                return {
                    maxDimension: 1280,
                    quality: 0.9
                };
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(this, "THUMB_IMAGE_SPECS", {
            /**
             * @return {number}
             */
            get: function () {
                return {
                    maxDimension: 640,
                    quality: 0.7
                };
            },
            enumerable: true,
            configurable: true
        });
        var _this = this;
        // Firebase SDK
        this.database = firebase.app().database();
        this.auth = firebase.app().auth();
        this.storage = firebase.app().storage();
        this.author = {};
        // this.currentUser = User.getUserProfile();
        this.newPictureContainer = angular.element(document.getElementById('newPictureContainer'));
        this.uploadButton = angular.element(document.getElementById('fp-upload'));
        // console.log('.$loaded()', this.currentUser);
        /*this.currentUser.then(function (user) {
            var author = user.profile;
            console.log('authorloaded', author)
            _this.author = {
                    name: author.name
                    , cover: author.cover
                        // , location: _this.currentUser.location
                        
                    , about: author.about
                    , uid: _this.auth.currentUser.uid
                }
                // console.log('authorloaded', _this.author, author)
        })*/
        this.editProfile = function (form) {
            console.log(form)
            var update = {};
            update[("/users/" + _this.auth.currentUser.uid + "/profile")] = form;
            return _this.database.ref().update(update).then(function (up) {
                console.log('editProfile', _this.auth.currentUser.uid, up);
                return _this.database.ref('user/' + _this.auth.currentUser.uid)
            });
        }
        this.displayPicture = function (url) {
            // console.log("this.newPictureContainer", this.newPictureContainer.attr('src'))
            this.newPictureContainer.attr('src', url);
        }
        this.saveEventImage = function (data, name) {
            var picData = {
                    type: 'images',
                    name: name
                }
                // angular.extend(picData, data);
                //console.log('saveimg', picData, data);
            return this.generateProfileImages(data).then(function (pics) {
                return _this.storeImage(pics.full, pics.thumb, picData).then(function (postId) {
                    return postId;
                });
            });
        }
        this.saveProfileImage = function (data) {
            var picData = {
                    type: 'images',
                    name: _this.auth.currentUser.uid
                }
                // angular.extend(picData, data);
                //console.log('saveimg', picData, data);
            return this.generateProfileImages(data).then(function (pics) {
                return _this.storeImage(pics.full, pics.thumb, picData).then(function (postId) {
                    return postId;
                });
            });
        }
        this.generateProfileImages = function (base64) {
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
            displayPicture(base64);
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
            reader.readAsDataURL(this.currentFile);
            console.log('this.currentFile', this.currentFile, fullDeferred)
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
        this.updateAvatar = function (data) {
            var saveImage = _this.saveImage(data);
            console.log('updateAvatar', data);
            saveImage.then(function (pics) {
                // Upload the File upload to Firebase Storage and create new post.
                //  var data = angular.extend({}, form)
                console.log('end - updateAvatar', data, pics);
            });
            // return _this.author;
        }
        this.readImage = function () {
            return _this.author;
        }
        this.saveImage = function (data) {
            var picData = {
                type: 'images',
                name: this.currentFile.name
            }
            angular.extend(picData, data);
            console.log('saveimg', picData, data);
            return this.generateImages().then(function (pics) {
                return _this.storeImage(pics.full, pics.thumb, picData).then(function (postId) {
                    return postId;
                });
            });
        }
        this.saveGeneratedImage = function (pics, data) {
            var picData = {
                type: 'images',
                name: this.currentFile.name
            }
            angular.extend(picData, data);
            console.log('pics,pics', pics)
            return _this.storeImage(pics.full, pics.thumb, picData).then(function (postId) {
                return postId;
            });
        }
        this.saveEvent = function (data) {
            console.log(data, this.currentFile);
            //return;
            var picData = {
                type: 'images',
                name: this.currentFile.name
            }
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
        this.saveProfile = function (data) {
            console.log(data, this.currentFile);
            //return;
            if (angular.isUndefined(this.currentFile) || this.currentFile === false) {
                return _this.updateUserProfile(data);
            }
            var picData = {
                type: 'images',
                name: this.currentFile.name
            }
            var saveImage = _this.saveImage(picData);
            //console.log('okok', uploadImage);
            return saveImage.then(function (pics) {
                console.log('saveEvent', data, pics);
                data.cover = angular.extend({}, pics.urls);
                return _this.prepareImagePost(pics, picData).then(function (postKey) {
                    angular.extend(data.cover, {
                        key: postKey
                    });
                    console.log('saveProfile', postKey, picData, data);
                    var image = {};
                    //image[postKey] = true;
                    //  data.gallery[postKey] = true;
                    _this.currentFile = false
                    return _this.updateUserProfile(data);
                })
            })
        }
        this.updateUserProfile = function (data) {
            var update = {};
            update[("/users/" + User.currentUser.uid + "/profile/")] = data;
            // update[("/" + type + "/" + author.uid + "/" + newPostKey)] = true;
            var updateRef = _this.database.ref().update(update);
            return updateRef.then(function (up) {
                console.log('updateUserProfile', up);
                return up;
            });
        }
        this.storeImage = function (pic, thumb, picData) {
            var _this = this;
            var fileName = picData.name;
            // console.log('upload', picData, _this, this, _this.currentFile.name, _this.currentFile)
            // Start the pic file upload to Firebase Storage.
            var picRef = this.storage.ref(this.auth.currentUser.uid + "/full/" + Date.now() + "/" + fileName);
            var metadata = {
                contentType: pic.type
            };
            var picUploadTask = picRef.put(pic, metadata).then(function (snapshot) {
                console.log('New pic uploaded. Size:', snapshot.totalBytes, 'bytes.');
                var url = snapshot.metadata.downloadURLs[0];
                console.log('File available at', url);
                return url;
            }).catch(function (error) {
                console.error('Error while uploading new pic', error);
            });
            // Start the thumb file upload to Firebase Storage.
            var thumbRef = this.storage.ref(this.auth.currentUser.uid + "/thumb/" + Date.now() + "/" + fileName);
            var tumbUploadTask = thumbRef.put(thumb, metadata).then(function (snapshot) {
                console.log('New thumb uploaded. Size:', snapshot.totalBytes, 'bytes.');
                var url = snapshot.metadata.downloadURLs[0];
                console.log('File available at', url);
                return url;
            }).catch(function (error) {
                console.error('Error while uploading new thumb', error);
            });
            return Promise.all([picUploadTask, tumbUploadTask]).then(function (urls) {
                // Once both pics and thumbanils has been uploaded add a new post in the Firebase Database and
                // to its fanned out posts lists (user's posts and home post).
                console.log('finish', urls, picData);
                var pics = {
                    urls: {
                        full_url: urls[0],
                        thumb_url: urls[1]
                    },
                    refs: {
                        picRef: picRef,
                        thumbRef: thumbRef
                    }
                }
                return pics;
                /*
                if (picData.type === 'events') {
                    return _this.prepareEventPost(urls, pic, thumb, picData, picRef, thumbRef);
                }
                else if (picData.type === 'images') {
                    return _this.prepareImagePost(urls, pic, thumb, picData, picRef, thumbRef);
                }
                */
            });
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
        this.prepareEventPost = function (picData) {
            console.log(picData);
            var content = {
                //   full_url: urls[0]
                //    , thumb_url: urls[1]
                text: picData.text,
                title: picData.title,
                cover: picData.cover,
                type: picData.type,
                location: picData.location,
                images: picData.images,
                timestamp: firebase.database.ServerValue.TIMESTAMP
                    //  , full_storage_uri: picRef.toString()
                    //  , thumb_storage_uri: thumbRef.toString()

                ,
                author: _this.author
                    /* */
            };
            var author = _this.author;
            return _this.addPost(picData.type, content, author);
        }
        this.prepareImagePost = function (pics, picData) {
            var content = {
                full_url: pics.urls.full_url,
                thumb_url: pics.urls.thumb_url,
                type: picData.type
                    //   , location: picData.location

                ,
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                full_storage_uri: pics.refs.picRef.toString(),
                thumb_storage_uri: pics.refs.thumbRef.toString()
                    // , author: _this.author
                    /* */
            };
            var author = _this.author;
            console.log(picData.type, content, author);
            return _this.addPost('images', content, author);
        }
        this.addPost = function (type, content, authorUID) {
            // author = angular.extend({}, author, _this.author);
            type = "events";
            var by = {};
            by[authorUID] = true;
            content = angular.extend({}, content, {
                'postedBy': by
            });
            console.log('conten', content)
            var newPostKey = _this.database.ref('' + type).push().key;
            var update = {};
            update[("/" + type + "/" + newPostKey)] = content;
            update[("/users/" + authorUID + "/" + type + "/" + newPostKey)] = true;
            update[("/posts/" + type + "/" + newPostKey)] = true;
            var updateRef = _this.database.ref().update(update);
            _this.setGeo([48.829761, 2.3720], newPostKey);
            return updateRef.then(function () {
                console.log('POSTED', newPostKey);
                return newPostKey;
            });
            //var newPostKey = _this.database.ref('/' + type).push().key;
            // update[("/" + type + "/" + this.auth.currentUser.uid + "/" + newPostKey)] = true;
            // console.log('addPost', User.getUserData(), User.currentUser, this.auth.currentUser.uid, User.auth.$getAuth().uid, User, type, content, author, newPostKey)
            // update[("/" + type + "/" + newPostKey)] = content;
            //var by = {};
            //by[author.uid] = true;
            // update[("/posts/" + newPostKey + "/author/" + author.uid)] = true;
            // console.log('eaddPost', updateRef, "/" + type + "/" + author.uid + "/" + newPostKey, type, content, author, author.uid);
        }
        this.disableUploadUi = function () {
            return _this.author;
        }
        this.b64toBlob = function (b64, onsuccess, onerror) {
            var contentType = 'image/jpeg';
            var dataUrl = 'data:' + contentType + ';base64,' + b64;
            console.log('b64toBlob::')
            var img = new Image();
            img.onerror = onerror;
            img.onload = function onload() {
                var canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob(onsuccess);
            };
            img.src = dataUrl;
        }
        this._getScaledCanvas = function (image, maxDimension) {
            // console.log('_getScaledCanvas', image);
            var thumbCanvas = document.createElement('canvas');
            if (image.width > maxDimension || image.height > maxDimension) {
                if (image.width > image.height) {
                    thumbCanvas.width = maxDimension;
                    thumbCanvas.height = maxDimension * image.height / image.width;
                } else {
                    thumbCanvas.width = maxDimension * image.width / image.height;
                    thumbCanvas.height = maxDimension;
                }
            } else {
                thumbCanvas.width = image.width;
                thumbCanvas.height = image.height;
            }
            var context = thumbCanvas.getContext('2d');
            var caption = ""; //Grosse soirée techno dans un batiment desaffecté ca vous tente ou quoi tesss";
            context.drawImage(image, 0, 0, image.width, image.height, 0, 0, thumbCanvas.width, thumbCanvas.height);
            //   context.drawImage(source,0,0);
            context.font = "100px impact";
            var textWidth = context.measureText(caption).width;
            if (textWidth > thumbCanvas.offsetWidth) {
                context.font = "40px impact";
            }
            context.textAlign = 'center';
            context.fillStyle = 'white';
            context.fillText(caption, thumbCanvas.width / 2, thumbCanvas.height * 0.8);
            return thumbCanvas;
        };
        this.readImageFromForm = function (event) {
            var readerDeferred = new $q.defer(); // $.Deferred(); //$q.defer(); //new $
            var file = event.files[0]; // FileList object
            //console.log('readImageFromForm', this, file);
            this.currentFile = file;
            // Clear the selection in the file picker input.
            //this.imageInput.wrap('<form>').closest('form').get(0).reset();
            //this.imageInput.unwrap();
            // Only process image files.
            console.log(file);
            if (file.type.match('image.*')) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    return _this.generateImages().then(function (pics) {
                        readerDeferred.resolve(pics);
                        // Upload the File upload to Firebase Storage and create new post.
                        var reader = new window.FileReader();
                        reader.readAsDataURL(pics.thumb);
                        reader.onloadend = function () {
                                var base64data = reader.result;
                                //  console.log(base64data);
                                return _this.displayPicture(base64data);
                            }
                            // console.log('generated', pics);
                            //return _this.displayPicture(reader.readAsDataURL(pics.thumb));
                    });
                    //return _this.displayPicture(e.target.result);
                };
                // Read in the image file as a data URL.
                reader.readAsDataURL(file);
                this.disableUploadUi(false);
            }
            return readerDeferred.promise; //_this.author;
        }
        this.setGeo = function (location, item) {
            console.log('setge', location, item);
            var firebaseRef = firebase.database().ref().child('geo/events');
            // Create a GeoFire index
            /*
        var localisation = location.split(",", -1);
        localisation = _.map(localisation, function (num) {
            return Number(num);
        });
        console.log(localisation);
        //return;
        */
            var geoFire = new GeoFire(firebaseRef);
            geoFire.set(item, location).then(function () {
                console.log("ProvidedsetGeo key has been added to GeoFire");
            }, function (error) {
                console.log("Error: " + error);
            });
        };
        this.addPolyfills = function () {
            // Polyfill for canvas.toBlob().
            if (!HTMLCanvasElement.prototype.toBlob) {
                Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
                    value: function (callback, type, quality) {
                        var binStr = atob(this.toDataURL(type, quality).split(',')[1]);
                        var len = binStr.length;
                        var arr = new Uint8Array(len);
                        for (var i = 0; i < len; i++) {
                            arr[i] = binStr.charCodeAt(i);
                        }
                        callback(new Blob([arr], {
                            type: type || 'image/png'
                        }));
                    }
                });
            }
        };
        this.addPolyfills();
    }
    this.UploaderInstance = new this.Uploader;
    return this.UploaderInstance;
});
