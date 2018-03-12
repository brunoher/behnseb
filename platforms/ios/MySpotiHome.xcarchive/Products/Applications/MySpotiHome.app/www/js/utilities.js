appServices.factory('Utilities', function ($firebase, $ionicPopup, PopupService, $cordovaCamera, Camera){
  
  return{

    sortByValue: function (collection, prop) {
      var output = [collection[0]];
      for (i = 1 ; i < collection.length; i++) {
        for (j = 0; j < output.length; j++) {
          if (collection[i]['prop'] <= output[j]['prop']) {
            output.splice(j, 0, collection[i]);
            j = output.length;
          } else if (j == output.length-1) {
            output.push(collection[i]);
            j = output.length;
          }
        }
      }
      return output;
    },

    timeBetweenTimeStamps: function (tStamp1, tStamp2, delay) {
      var time;
      var diff = tStamp2 - tStamp1;
      (delay) ? time = delay - diff : time = diff; 
      var hours = (time)/3600000; // nombre d'heures
      var roundHours = hours - hours%1; // heure sans la décimale
      var roundMinutes = Math.round((hours%1)*60); // ex: 0.5h -> 30 minutes
      if(roundMinutes > 59) {
        roundMinutes = 59;
      }else if (roundMinutes < 1) {
        roundMinutes = "";
      }
      return roundHours +'h'+roundMinutes;
    },

    isEighteen: function(yearOfBirth) {
      var yearOfToday = new Date().getFullYear();
      if (yearOfToday - 18 > yearOfBirth) {
        return true; 
      } else if (yearOfToday - 18 < yearOfBirth) {
        return false;
      } else if (yearOfBirth == yearOfToday - 18){
        return "askForMajority";
      } else {
        return 'error';
      }
      /*var m = today.getMonth();
      var y = today.getYear()+1900;
      var d = today.getDate();
      var bDay = birthDay.getTime();
      var back18 = new Date(y-18, m, d);
      var ago = back18.getTime();
      return bDay <= ago;
      */
    },

    /* Rajouter des zéros avant un nombre tant qu'il est inférieur à une certaine puissance de 10 */
    add0: function (item, onMaxNumber){
      var output = "";
      var tenTimesItem = item;
      while(tenTimesItem < onMaxNumber/10){
        output += '0';
        tenTimesItem *= 10;
      }
      return output+item;
    },

    /* Obtenir une date au format 'Jour/Mois/Année' */
    getFormatedDate: function (){
      var date = new Date();
      var day = date.getDate();
      var month = date.getMonth() +1;
      var year = date.getYear();
      
      return this.add0(day, 100) +'/'+ this.add0(month, 100) +'/'+ String(1900+year); 
    },

    createRandomKey: function (length){
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for( var i=0; i < length; i++ )
          text += possible.charAt(Math.floor(Math.random() * possible.length));

      return text;
    },


   /* Fonction utilitaire pour convertir un canvas en BLOB */
    dataURLToBlob: function (dataURL) {
      var BASE64_MARKER = ';base64,';
      if (dataURL.indexOf(BASE64_MARKER) == -1) {
        var parts = dataURL.split(',');
        var contentType = parts[0].split(':')[1];
        var raw = parts[1];

        return new Blob([raw], {type: contentType});
      }

      var parts = dataURL.split(BASE64_MARKER);
      var contentType = parts[0].split(':')[1];
      var raw = window.atob(parts[1]);
      var rawLength = raw.length;

      var uInt8Array = new Uint8Array(rawLength);

      for (var i = 0; i < rawLength; ++i) {
          uInt8Array[i] = raw.charCodeAt(i);
      }

      return new Blob([uInt8Array], {type: contentType});
    },

    blobToDataURL: function (blob, file){
      var reader = new window.FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = function(){
        base64data = reader.result;
        return file.imageDataURL = base64data;
      }
    },

    setBase64UrlFromUrl: function (element, url){
      var that = this;
      var xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
    
      xhr.onload = function(event) {
        var blob = xhr.response;
        //On appelle la fonction 'blobToDataUrl' de mon factory 'Utilities' pour convertir le Blob en Base64
        that.blobToDataURL(blob, element);   
      };
      xhr.open('GET', url);
      xhr.send();
    },
   
    setImageReadyToExportToFirebase: function (imageSelected, param){
      var that = this;
      return new Promise(function (resolve,reject){
        if (imageSelected){
          
          var file = imageSelected;
          //var newFile = new Blob([], { "type" : "text\/xml" }); 

          // On s'assure que "file" est bien une image
          //if(file.type.match(/image.*/)) {
            //console.log('le fichier chargé est bien une image!');

            // On charge l'image
            var reader = new FileReader();
            reader.onload = function (readerEvent) {
              var image = new Image();
              image.onload = function (imageEvent) {
                // On redimensionne l'image
                var canvas = document.createElement('canvas');
                max_size = 300,// TODO : on modifie la taille maximum acceptée
                width = image.width,
                height = image.height;
                if (width > height) {
                  if (width > max_size) {
                    height *= max_size / width;
                    width = max_size;
                  }
                } else {
                  if (height > max_size) {
                    width *= max_size / height;
                    height = max_size;
                  }
                }
                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(image, 0, 0, width, height);
                var dataUrl = canvas.toDataURL('image/jpeg');
                var resizedImage = that.dataURLToBlob(dataUrl);
                if(!param){
                  resolve(resizedImage);
                }else{
                  resolve(dataUrl);
                }
                 
              }
              image.src = readerEvent.target.result;
            }
            reader.readAsDataURL(file)
          /*}else {
            console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@ Utilities 151', imageSelected);
            resolve(file);
          }*/
        }else{
          var f = new File([""], "filename.txt", {type: "image/jpeg", lastModified: new Date()});
          resolve(f);
        }
      }).catch(function(error){
        PopupService.show('showError');
        //console.log(error);
      });
    },

    putImageInFirebaseStorage: function (refInFirebaseStorage, imageName, imageReady){
      var that = this;
      return new Promise(function(resolve, reject){
        firebase.storage().ref('/'+ refInFirebaseStorage +'/'+imageName).put(imageReady).then(function(snapshot) {
          //console.log('Uploaded a photo!');
          resolve(imageName);
        }), function(err){
          //console.log(err);
          resolve(imageName);
        }    
      }).catch(function(err){
        //console.log(err);
        PopupService.show('showError'); 
      });  
    },

    setImageUrl: function(storageRepo, prop, uid) {
        var that = this;
        return new Promise (function(resolve) {    
            that.getFirebaseImageUrl(storageRepo).then(function(url) {
                if (prop) firebase.database().ref().child(prop).set(url); // url: imageUrl in firebase bucket
                resolve([url, uid]);
            }), function(error) {
                console.log(error);
            };    
        }).catch(function(e) {
            console.log(e);
            PopupService.show('showError');
        });
    },

    setBase64UrlToFileWithFirebaseUrl: function (users){
      var that = this;
      return new Promise(function(resolve, reject){
        for (i=0; i<users.length; i++){
          (function(index) { 
            if(!users[index].imageDataURL && users[index].image){ 
              firebase.storage().ref('/images/'+users[index].image).getDownloadURL().then(function(url) {
                //L'url récuérée depuis le storage de firebase est convertie en Blob
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                
                xhr.onload = function(event) {
                  var blob = xhr.response;
                  //On appelle la fonction 'blobToDataUrl' de mon factory 'Utilities' pour convertir le Blob en Base64
                  that.blobToDataURL(blob, users[index]);  
                  if(index == users.length-1){
                    resolve(users);
                  } 
                };
                xhr.open('GET', url);
                xhr.send();
              }).catch(function(error) {
                //console.log('erreur: '+error);
                users[index].imageDataURL = 'img/noPhotoProfile.png';      
              })
            }else if(!users[index].image){
              users[index].imageDataURL = 'img/noPhotoProfile.png';   
              if(index == users.length-1){
                resolve(users);
              }
            }else{
              if(index == users.length-1){
                resolve(users);  
              }  
            }
          })(i);   
        }
      }).catch(function(error){
        //console.log(error);
        PopupService.show('showError'); 
      });   
    },

    loadValueFromFirebase: function (stringUrl){
      var that = this;
      return new Promise (function(resolve, reject){
        if (rootRef.child(stringUrl)){
          rootRef.child(stringUrl).on('value', function(snapshot) {
            var output = [];
            for (key in snapshot.val()){  
              output.push(key);
            }  
            resolve(output); 
          });
        }else{
          resolve([]);
        }
      }).catch(function(err){
        //console.log(err);
        PopupService.show('showError'); 
      });
    },

    loadValueObjectFromFirebase: function (stringUrl){
      var that = this;
      return new Promise (function(resolve, reject){
        if (rootRef.child(stringUrl)){
          rootRef.child(stringUrl).on('value', function(snapshot) {
            var output = {};
            for (key in snapshot.val()){  
              output[key] = snapshot.val()[key];
            }  
            resolve(output); 
          });
        }else{
          resolve([]);
        }
      }).catch(function(err){
        //console.log(err);
        PopupService.show('showError'); 
      });
    },

    getFirebaseImageUrl: function(imageId) {
      return new Promise (function(resolve) {
        storageRef.child(imageId).getDownloadURL().then(function(url) {
          resolve(url);
        }), function(error) {
          console.log(error);
        };
      }).catch(function(e) {
        console.log(e);
        PopupService.show(showError);
      });
    },

    sendNotif: function (message) {
      /*  
          message.type     : 'incident' || 'mokole' || 'message' || 'messages' || 'invitation'
          message.id       : id de l'incident ou du nouveau mot
          message.txt      : texte de la notification
          message.copro    : tag copro pour trier les users qui recevront la notif
          message.userId   : idDuReceveur || [idDesReceveurs, '', ''] (type === "message(s)")
          message.senderId : oneSignalId de l'envoyeur du message

          portNumber: 8443 (si https) ou 8080
      */
      return new Promise (function(resolve, reject) {
        var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
        xmlhttp.open("POST", "http://92.222.93.121:8080/send-notification");
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.setRequestHeader("Authorization", OWN_API_KEY);
        xmlhttp.setRequestHeader("Origin", "mshios");
        xmlhttp.onreadystatechange = function() {//Call a function when the state changes.
          if(xmlhttp.readyState === XMLHttpRequest.DONE && xmlhttp.status === 200) {
            //PopupService.show('debug', 'succes! '+xmlhttp.status);
            resolve(xmlhttp.responseText);
          } else {
            resolve('notif did not worked (utilities.sendNotif)');
            //PopupService.show('debug', 'status erreur: '+xmlhttp.status);
          }
        }
        xmlhttp.send(JSON.stringify(message));
      }).catch(function(e) {
        Alert(e);
      });
    },

    sendNotifFromApp: function(userIds, notifTxt) {
      return new Promise(function(resolve, reject) {
          var notificationObj = { 
            contents: {"en": notifTxt, "fr": notifTxt},
            include_player_ids: userIds
          };
          //alert(userIds);
          window.plugins.OneSignal.postNotification(notificationObj,
            function(successResponse) {
              console.log("Notification Post Success:", successResponse);
              resolve(successResponse);
            },
            function (failedResponse) {
              console.log("Notification Post Failed: ", failedResponse);
              alert("Notification Post Failed:\n" + JSON.stringify(failedResponse));
              resolve(successResponse);
            }
          );
      }).catch(function(e){
        PopupService.show('debug', e);
        console.log(e);
      });
    },

    formatStringWithRegularChars: function (specialCharsArray, stringToTest, charOfString){
    /* Cette fonction remplace les caracteres spéciaux d'une string en caracteres réguliers
    Elle est appelée dans 2 cas: 1/ pour une string en train d'être tapée (ng-keyup)
    Dans ce cas on ne lui donne que 2 parametres. Elle teste systèmatiquement le dernier caractere de la chaine
    2/ pour tester une string finie. Dans ce cas on lui donne la string entiere + le caractere à tester */

      var b = stringToTest;

      if(!charOfString){
        var a = b[b.length-1];  // 1er cas
      }else{
        var a = charOfString; //2eme cas
      }
      var newReg = new RegExp(a, "gi")
      for (i in specialCharsArray){   
        if (specialCharsArray[i].indexOf(a)>-1){
          if (i == 0){ b = b.replace(newReg, 'a'); return b;
          }else if (i == 1){ b = b.replace(newReg, 'c'); return b;
          }else if (i == 2){ b = b.replace(newReg, 'e'); return b;
          }else if (i == 3){ b = b.replace(newReg, 'i'); return b;
          }else if (i == 4){ b = b.replace(newReg, 'n'); return b;
          }else if (i == 5){ b = b.replace(newReg, 'o'); return b;
          }else if (i == 6){ b = b.replace(newReg, 's'); return b;
          }else if (i == 7){ b = b.replace(newReg, 'u'); return b;
          }else if (i == 8){ b = b.replace(newReg, 'y'); return b;
          }else{return b;};
        }
      }
      return b;
    },

     

      // fonction qui est appelée en ng-keyup
    autoComplete: function( scopeData, elementSearchedId, resultDivId, formatedList, listToImplementWith, scopeResult){
      var thingTyped = document.getElementById(elementSearchedId).value;
      scopeData.typedLength = thingTyped.length;
    

     // on formate en minuscule le contact recherché
      var myRegExp = new RegExp(thingTyped.toLowerCase(), "gi");
      // 'scopeResult' est remis à zéro, à chaque nouveau caractère tapé ou supprimé
      // pour que les nouveaux matchs soient mis à jour
      scopeData.result = [];
      for (i=0; i<formatedList.length; i++){    
        if((formatedList[i]).toLowerCase().match(myRegExp)){
          // en cas de match entre les contatcs et la recherche tapée:
          scopeData.showDiv = true; //ng-if="showDiv == true"
          scopeData.showButton = true; //ng-if="showButton == true"
          scopeData.result.push(listToImplementWith[i]); 
        }     
      }
           
      if (resultDivId != ""){
        var resultDiv = document.getElementById(resultDivId);
        var resultStr= "";

        for (j=0; j<scopeData.result.length; j++) {
          resultStr+= '<option value="'+j+'">'+scopeData.result[j].formatedName+'</option>';
        }
        
        // 'scopeDataSectionFilled' correspond au ng-model de l'input du champs de recherche
        
          if(resultDiv){
            resultDiv.innerHTML = resultStr;
          }
        
      }
      return scopeData;
    },

    isIncorrectValue: function(values) {
      for (i=0; i<values.length; i++) {
        var a = values[i];
        if ((angular.isUndefined(a) || a === null || a == "") === true) {
          return true;
        }
      }
    },

    readURL: function (_file, str, isIncident) {
      var hw = isIncident ? null : 150;
      var reader = new FileReader();
      reader.onload = function (e) {
        $(str)
          .attr('src', e.target.result)
          .width(hw)
          .height(hw);
      };
      reader.readAsDataURL(_file);
    },

    base64ToBlob: function(b64Data, contentType, sliceSize) {
      return new Promise(function(resolve){
        contentType = contentType || '';
          sliceSize = sliceSize || 512;

          var byteCharacters = atob(b64Data);
          var byteArrays = [];

          for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);
            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
          }

          var blob = new Blob(byteArrays, {type: contentType});
          resolve(blob);
      }).catch(function(e){
        console.log(e);
        PopupService.show('showError');
      }); 
    },

    takePicture: function(index, img, dataUrl, cropImg, isIncident) {    
      var that = this;
      var dimensions = 400;

      return new Promise(function(resolve){
        var options = {
          quality: 50,
          destinationType: /*Camera.DestinationType.DATA_URL*/0,
          allowEdit: cropImg,
          //encodingType: Camera.EncodingType.JPEG,
          targetWidth: dimensions,
          targetHeight: dimensions,
          //popoverOptions: CameraPopoverOptions,
          correctOrientation:true
        };
        if(index == 0) {
          //options.saveToPhotoAlbum = false;
          //if(ionic.Platform.isIOS()) {
            options.sourceType = 0;
          /*  options.sourceType = Camera.PictureSourceType.SAVEDPHOTOALBUM;
          }else {
            //options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
          }

        }else {
          options.sourceType = Camera.PictureSourceType.CAMERA;
          options.saveToPhotoAlbum = true;
        }*/
        }  
        Camera.getPicture(options).then(function(imageData) {
          if (dataUrl === false) {
            that.base64ToBlob(imageData).then(function(res){
              img = res;
              that.readURL(img, '#img', isIncident);
              resolve(res);
            }), function(e) {
              //PopupService.show("debug", "535", e);
            };  
          } else {
            resolve(imageData);
          }

        }, function(err) {
          console.log(err);
        });
        /*$cordovaCamera.getPicture(options).then(function(imageURI) {
          var image = document.getElementById('profileImage');
          image.src = imageURI;
        }, function(err) {
          PopupService.show('alertCameraFailure');
          console.log(err);
        });*/
      }).catch(function(e){
        console.log(e);
        //PopupService.show("debug", "error in Utilities.takePicture()", e);
      });
    }
  }
})