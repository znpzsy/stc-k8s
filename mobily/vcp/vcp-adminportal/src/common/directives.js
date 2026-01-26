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

    ApplicationDirectives.directive('adminportalTranslateCloak', function ($rootScope, $translate) {
        return {
            restrict: 'A',
            link: function (scope, element) {
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

    ApplicationDirectives.directive('minMaxLicenseCheck', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: false,
            link: function (scope, elem, attr, ctrl) {
                ctrl.$formatters.unshift(function (value) {
                    ctrl.$setValidity('max', (value <= scope.$eval(attr.maxValue)));
                    return value;
                });

                ctrl.$parsers.unshift(function (value) {
                    ctrl.$setValidity('max', (value <= scope.$eval(attr.maxValue)));
                    return value;
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
                var checkValue = function (value) {
                    var origin = scope.passwordVerify;
                    if (origin) {
                        ctrl.$setValidity("passwordVerify", (origin.localeCompare(value) === 0));
                    } else {
                        ctrl.$setValidity("passwordVerify", true);
                    }

                    return value;
                };

                ctrl.$formatters.unshift(function (value) {
                    return checkValue(value);
                });

                ctrl.$parsers.unshift(function (value) {
                    return checkValue(value);
                });
            }
        };
    });

    ApplicationDirectives.directive('passwordStrengthValidator', function () {
        return {
            require: "ngModel",
            link: function (scope, element, attrs, ctrl) {
                scope.$watch(function () {
                    return Number(scope.$eval(attrs.passwordStrengthValidator));
                }, function (value) {
                    ctrl.$setValidity("weak", !(value < 50));
                });
            }
        };
    });

    ApplicationDirectives.directive('licensePercentCheck', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: false,
            link: function (scope, elem, attr, ctrl) {
                ctrl.$formatters.unshift(function (value) {
                    return Number(value) * 100;
                });

                ctrl.$parsers.unshift(function (value) {
                    return Number(value) / 100;
                });
            }
        };
    });

    ApplicationDirectives.directive('hiddenFilterForm', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: false,
            link: function (scope, elem) {
                scope.$watch('filterFormLayer.isFilterFormOpen', function (newValue) {
                    if (newValue)
                        angular.element(elem).slideDown('fast');
                    else
                        angular.element(elem).slideUp('fast');
                });
            }
        };
    });

    ApplicationDirectives.directive('listAvailabilityCheck', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {
                list: "=list",
                propertyname: "@"
            },
            link: function (scope, elem, attr, ctrl) {
                var propertyname = scope.propertyname;

                var availabilityValidator = function (value) {
                    var currentList = scope.list;

                    ctrl.$setValidity('availabilityCheck', true);

                    if (!_.isUndefined(value) && !s.isBlank(value)) {
                        // search entered value in the current list.
                        var foundItem = _.find(currentList, function (item) {
                            var itemPropertyValue = eval('item.' + propertyname);

                            return (String(itemPropertyValue) === String(value));
                        });

                        ctrl.$setValidity('availabilityCheck', _.isUndefined(foundItem));
                    }

                    // returns availability value.
                    return value;
                };

                ctrl.$parsers.push(availabilityValidator);
                ctrl.$formatters.push(availabilityValidator);
            }
        };
    });

    ApplicationDirectives.directive('ngMinValue', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, elem, attr, ctrl) {
                var minValidator = function (value) {
                    var min = scope.$eval(attr.ngMinValue);
                    if (!_.isUndefined(value) && !s.isBlank(value) && Number(value) < min) {
                        ctrl.$setValidity('ngMinValue', false);
                    } else {
                        ctrl.$setValidity('ngMinValue', true);
                    }

                    return value;
                };

                ctrl.$parsers.push(minValidator);
                ctrl.$formatters.push(minValidator);
            }
        };
    });

    ApplicationDirectives.directive('ngMaxValue', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, elem, attr, ctrl) {
                var maxValidator = function (value) {
                    var max = scope.$eval(attr.ngMaxValue);
                    if (!_.isUndefined(value) && !s.isBlank(value) && Number(value) > max) {
                        ctrl.$setValidity('ngMaxValue', false);
                    } else {
                        ctrl.$setValidity('ngMaxValue', true);
                    }

                    return value;
                };

                ctrl.$parsers.push(maxValidator);
                ctrl.$formatters.push(maxValidator);
            }
        };
    });

    /**
     * Provides an easy way to toggle a checkboxes indeterminate property
     *
     * @example <input type="checkbox" ui-indeterminate="isUnkown">
     */
    ApplicationDirectives.directive('uiIndeterminate', function () {
        return {
            compile: function (tElm, tAttrs) {
                if (!tAttrs.type || tAttrs.type.toLowerCase() !== 'checkbox') {
                    return angular.noop;
                }

                return function ($scope, elm, attrs) {
                    $scope.$watch(attrs.uiIndeterminate, function (newVal) {
                        elm[0].indeterminate = !!newVal;
                    });
                };
            }
        };
    });

    ApplicationDirectives.directive('tabAuthenticator', function () {
        return {
            restrict: 'A',
            scope: {
                tabAuthenticator: "="
            },
            link: function (scope, elem, attr, ctrl) {
                var isAuth = scope.tabAuthenticator;
                if (!isAuth) {
                    elem.addClass('disabled');
                    elem.find('a').remove('ui-sref').attr('href', 'javascript:;').off();
                }
            }
        };
    });

    ApplicationDirectives.directive('clearInput', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attr) {
                var htmlMarkup = attr.clearBtnMarkup ? attr.clearBtnMarkup : '<i class="fa fa-times" aria-hidden="true"></i>';
                var btn = angular.element(htmlMarkup);
                btn.addClass(attr.clearBtnClass ? attr.clearBtnClass : "clear-btn");
                element.after(btn);

                btn.on('click', function (event) {
                    if (attr.clearInput) {
                        var fn = $parse(attr.clearInput);
                        scope.$apply(function () {
                            fn(scope, {
                                $event: event
                            });
                        });
                    } else {
                        scope[attr.ngModel] = null;
                        scope.$digest();
                    }
                });

                scope.$watch(attr.ngModel, function (val) {
                    var hasValue = val && String(val).length > 0;
                    if (!attr.clearDisableVisibility) {
                        btn.css('visibility', hasValue ? 'visible' : 'hidden');
                    }

                    if (hasValue && !btn.hasClass('clear-visible')) {
                        btn.removeClass('clear-hidden').addClass('clear-visible');
                    } else if (!hasValue && !btn.hasClass('clear-hidden')) {
                        btn.removeClass('clear-visible').addClass('clear-hidden');
                    }
                });
            }
        };
    }]);

    ApplicationDirectives.directive('adminportalHeader', function () {
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

    ApplicationDirectives.directive('adminportalNavbar', function () {
        return {
            restrict: 'E',
            templateUrl: 'partials/navbar/navbar.html'
        };
    });

    ApplicationDirectives.directive('adminportalFooter', function ($timeout) {
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

})();
