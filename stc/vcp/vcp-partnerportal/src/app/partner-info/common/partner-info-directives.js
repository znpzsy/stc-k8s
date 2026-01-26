(function () {
    'use strict';

    /* Directives */
    angular.module('partnerportal.partner-info.directives', []);

    var PartnerInfoDirectives = angular.module('partnerportal.partner-info.directives');

    // to destroy value of the additional parameters if field invisible.
    PartnerInfoDirectives.directive('destroyAdditionalField', function ($parse) {
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, elem, attrs, ngModel) {
                var modelExp = attrs.ngModel;
                var idxOfDot = modelExp.lastIndexOf(".");
                var parentExp = modelExp.substring(0, idxOfDot);
                var propExp = modelExp.substring(idxOfDot + 1);

                var parsedParentExp = $parse(parentExp);

                scope.$watch('reportCategory', function (newValue, oldValue) {
                    if (newValue !== oldValue) {
                        var p = parsedParentExp(scope);
                        if (p) {
                            delete p[propExp];
                        }

                        scope.form.$setPristine();
                    }
                });
            }
        }
    });

})();
