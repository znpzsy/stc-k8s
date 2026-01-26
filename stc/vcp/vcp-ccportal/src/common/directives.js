(function () {

    'use strict';

    /* Directives */
    angular.module('Application.directives', []);

    var ApplicationDirectives = angular.module('Application.directives');

    //http://victorblog.com/2014/01/12/fixing-autocomplete-autofill-on-angularjs-form-submit/
    ApplicationDirectives.directive('formAutofillFix', function () {
        return function (scope, elem, attrs) {
            // Fixes Chrome bug: https://groups.google.com/forum/#!topic/angular/6NlucSskQjY
            elem.prop('method', 'POST');

            // Fix autofill issues where Angular doesn't know about autofilled inputs
            if (attrs.ngSubmit) {
                setTimeout(function () {
                    elem.unbind('submit').bind('submit', function (e) {
                        e.preventDefault();
                        elem.find('input, textarea, select').trigger('input').trigger('change').trigger('keydown');
                        scope.$apply(attrs.ngSubmit);
                    });
                }, 0);
            }
        };
    });

    ApplicationDirectives.directive('ccportalTranslateCloak', function ($rootScope, $translate) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                $rootScope.$on('$translateLoadingSuccess', function () {
                    element.removeClass($translate.cloakClassName());
                });
                element.addClass($translate.cloakClassName());
            }
        };
    });

    ApplicationDirectives.directive('minMaxCheck', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: false,
            link: function (scope, elem, attr, ctrl) {
                if (typeof scope.dateElements === 'undefined')
                    scope.dateElements = {};

                scope.dateElements[attr.name] = {
                    elem: elem,
                    ctrl: ctrl
                };

                var validateValue = function (value) {
                    scope.dateElements['startDate'].ctrl.$setValidity('maxDateExceeded', true);
                    scope.dateElements['endDate'].ctrl.$setValidity('minDateExceeded', true);

                    var dateVal =  scope.$eval('dateHolder.' + attr.name);

                    if (attr.name === 'startDate') {
                        ctrl.$setValidity('maxDateExceeded', !(new Date(dateVal) > scope.$eval(attr.maxDate)));
                    } else {
                        ctrl.$setValidity('minDateExceeded', !(new Date(dateVal) < scope.$eval(attr.minDate)));
                    }

                    ctrl.$setDirty();

                    return value;
                };

                ctrl.$parsers.unshift(function (value) {
                    return validateValue(value);
                });

                ctrl.$formatters.unshift(function (value) {
                    return validateValue(value);
                });
            }
        };
    });

    ApplicationDirectives.directive('hiddenFilterForm', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: false,
            link: function (scope, elem, attr, ctrl) {
                scope.$watch('filterFormLayer.isFilterFormOpen', function (newValue, oldValue) {
                    if (newValue)
                        angular.element(elem).slideDown('fast');
                    else
                        angular.element(elem).slideUp('fast');
                });
            }
        };
    });

    ApplicationDirectives.directive('passwordVerify', function () {
        return {
            require: "ngModel",
            scope: {
                passwordVerify: '='
            },
            link: function (scope, element, attrs, ctrl) {
                scope.$watch(function () {
                    var combined;

                    if (scope.passwordVerify || ctrl.$viewValue) {
                        combined = scope.passwordVerify + '_' + ctrl.$viewValue;
                    }
                    return combined;
                }, function (value) {
                    if (value) {
                        ctrl.$parsers.unshift(function (viewValue) {
                            var origin = scope.passwordVerify;
                            if (origin !== viewValue) {
                                ctrl.$setValidity("passwordVerify", false);
                                return undefined;
                            } else {
                                ctrl.$setValidity("passwordVerify", true);
                                return viewValue;
                            }
                        });
                    }
                });
            }
        };
    });

    ApplicationDirectives.directive('ccportalHeader', function () {
        return {
            restrict: 'E',
            templateUrl: 'partials/header/header.html',
            controller: function ($scope, UtilService, ServerConfigurationService) {
                ServerConfigurationService.getSiteInformation().then(function(siteInformation) {
                    $scope.siteInformation = siteInformation;

                    UtilService.putToSessionStore(UtilService.SITE_INFORMATION_KEY, siteInformation);
                });
            }
        };
    });

    ApplicationDirectives.directive('ccportalNavbar', function () {
        return {
            restrict: 'E',
            templateUrl: 'partials/navbar/navbar.html'
        };
    });

    ApplicationDirectives.directive('ccportalFooter', function ($timeout) {
        return {
            restrict: 'E',
            templateUrl: 'partials/footer/footer.html',
            link: function (scope, element, attrs) {
                $timeout(function () {
                    mvpready_admin.init();
                }, 0);
            }
        };
    });



    ApplicationDirectives.directive('uiSelectMaxlength', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                var $uiSelect = angular.element(element[0].querySelector('.ui-select-search'));
                $uiSelect.attr("maxlength", attr.uiSelectMaxlength);
            }
        }
    });

})();
