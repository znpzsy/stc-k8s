(function () {
    'use strict';

    /* Directives */
    angular.module('adminportal.products.antispamsms.directives', []);

    var AntiSpamSMSDirectives = angular.module('adminportal.products.antispamsms.directives');

    AntiSpamSMSDirectives.directive('spaceToUnderscore', function() {
        return {
            require: 'ngModel',
            link: function(scope, element, attrs, ngModelCtrl) {
                /*// Format the value going to the view (ngModel to view)
                ngModelCtrl.$formatters.push(function(value) {
                    if (value) {
                        return value.replace(/ /g, '_');
                    }
                    return value;
                });*/
                // Parse the value coming from the view
                ngModelCtrl.$parsers.push(function(value) {
                    if (value) {
                        var replaced = value.replace(/ /g, '_');
                        if (replaced !== value) {
                            ngModelCtrl.$setViewValue(replaced);
                            ngModelCtrl.$render();
                        }
                        return replaced;
                    }
                    return value;
                });

                // Handle paste events
                element.on('paste', function(e) {
                    setTimeout(function() {
                        var value = element.val();
                        if (value && value.indexOf(' ') !== -1) {
                            var replaced = value.replace(/ /g, '_');
                            ngModelCtrl.$setViewValue(replaced);
                            ngModelCtrl.$render();
                            scope.$apply();
                        }
                    }, 0);
                });
            }
        };
    });

})();
