//Directive numbersOnly :
//Use for change input to have ability accept only number.
//Example : <input ng-model="contract.age" numbers-only type="tel">
//
appControllers.directive('numbersOnly', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
                if (text) {
                    var transformedInput = text.replace(/[^0-9]/g, '');

                    if (transformedInput !== text) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    return transformedInput;
                }
                return undefined;
            }

            ngModelCtrl.$parsers.push(fromUser);
        }
    };
});// End Directive numbersOnly.

appControllers.directive('hideTabs', function($rootScope) {
  return {
      restrict: 'A',
      link: function($scope, $el) {
        $rootScope.hideTabs = 'tabs-item-hide';
        $scope.$on('$destroy', function() {

              $rootScope.hideTabs = '';

        });      
      }
  };
});

appControllers.directive('hideTabs1', function($rootScope) {
    return {
        restrict: 'A',
        link: function(scope, element, attributes) {
            scope.$watch(attributes.hideTabs, function(value){
                $rootScope.hideTabs = value;
            });
            scope.$on('$ionicView.beforeLeave', function() {
                $rootScope.hideTabs = false;
            });
        }
    };
});

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
            scope.test = !scope.test;
            if (newValue) {
                elem.attr("type", "text");
            } else {
                elem.attr("type", "password");
            };
        });
    };
})

appControllers.directive('hideTabs2', function($rootScope) {
  return {
      restrict: 'A',
      link: function($scope, $el) {
          $rootScope.hideTabs = 'tabs-item-hide';
          $scope.$on('$destroy', function() {
              $rootScope.hideTabs = '';
          });
      }
  };
});
