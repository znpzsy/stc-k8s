(function () {
    'use strict';

    /* Directives */
    angular.module('adminportal.subsystems.directives', []);

    var SubsystemsDirectives = angular.module('adminportal.subsystems.directives');

    // to destroy value of the additional parameters if field invisible.
    SubsystemsDirectives.directive('destroyAdditionalField', function ($parse) {
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, elem, attrs, ngModel) {
                var modelExp = attrs.ngModel;
                var idxOfDot = modelExp.lastIndexOf(".");
                var parentExp = modelExp.substring(0, idxOfDot);
                var propExp = modelExp.substring(idxOfDot + 1);

                var parsedParentExp = $parse(parentExp);

                scope.$on("$destroy", function () {
                    var p = parsedParentExp(scope);
                    if (p) {
                        delete p[propExp];
                    }
                });
            }
        }
    });

})();
