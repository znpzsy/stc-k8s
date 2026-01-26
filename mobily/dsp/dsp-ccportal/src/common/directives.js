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

                    var dateVal = scope.$eval('dateHolder.' + attr.name);

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

    ApplicationDirectives.directive('ccportalPasswordVerify', function () {
        return {
            require: "ngModel",
            scope: {
                ccportalPasswordVerify: '='
            },
            link: function (scope, element, attrs, ctrl) {

                // add a parser that will process each time the value is
                // parsed into the model when input updates it.
                ctrl.$parsers.unshift(function (viewValue) {
                    var origin = scope.ccportalPasswordVerify;

                    if (scope.$parent.form.password) {
                        scope.$parent.form.password.$setValidity('passwordVerify', true);
                    }
                    if (scope.$parent.form.confirmpassword) {
                        scope.$parent.form.confirmpassword.$setValidity('passwordVerify', true);
                    }

                    var isNotVerified = (_.isEmpty(viewValue) || origin === viewValue);
                    ctrl.$setValidity("passwordVerify", isNotVerified);

                    return viewValue;
                });

                // add a formatter that will process each time the value
                // is updated on the DOM element.
                ctrl.$formatters.unshift(function (viewValue) {
                    var origin = scope.ccportalPasswordVerify;

                    var isNotVerified = (_.isEmpty(viewValue) || origin === viewValue);
                    ctrl.$setValidity("passwordVerify", isNotVerified);

                    return viewValue;
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
                itemId: "=itemId",
                idFieldName: "@",
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

                        var isAvailable = false;
                        if (scope.itemId) {
                            var isDifferent = foundItem ? foundItem[scope.idFieldName] !== scope.itemId : false;
                            isAvailable = isDifferent && foundItem;
                        } else {
                            isAvailable = !_.isUndefined(foundItem);
                        }

                        ctrl.$setValidity('availabilityCheck', !isAvailable);
                    }

                    // returns availability value.
                    return value;
                };

                ctrl.$parsers.push(availabilityValidator);
                ctrl.$formatters.push(availabilityValidator);
            }
        };
    });

    ApplicationDirectives.directive('activeLoadingIndicator', function ($interval, $timeout, cfpLoadingBar) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                var indicatorValue = cfpLoadingBar.status();

                scope.isLoadingActive = (indicatorValue !== 0);

                var fieldset;
                var init = _.throttle(function () {
                    if (element.find('.title-spinner').length === 0) {
                        element.append('<span class="title-spinner">&nbsp;<i class="fa fa-spinner fa-spin"></i></span>');
                        fieldset = element.parents('.portlet').find('fieldset');
                        fieldset.attr('disabled', 'disabled');
                        fieldset.find('span.selected-item-label').before('<span class="indicator">&nbsp;<i class="fa fa-spinner fa-spin"></i></span>')
                            .css('display', 'none');
                    }
                }, 1000);

                init();

                scope.$watch(
                    function () {
                        return cfpLoadingBar.status();
                    },
                    function (newValue, oldValue) {
                        if (newValue === 0 && oldValue === 1) {
                            scope.$emit('LoadingIndicatorChanged');
                        } else {
                            init();
                        }
                    }
                );

                scope.$on('LoadingIndicatorChanged', function (event) {
                    _.delay(function () {
                        scope.isLoadingActive = false;

                        fieldset = element.parents('.portlet').find('fieldset');
                        if (fieldset) {
                            fieldset.attr('disabled', null);
                            fieldset.find('span.indicator').remove();
                            fieldset.find('span.selected-item-label').css('display', 'inline-block');
                        }

                        element.find('.title-spinner').remove();
                    }, 1000);
                });
            }
        };
    });

    ApplicationDirectives.directive('ccportalHeader', function () {
        return {
            restrict: 'E',
            templateUrl: 'partials/header/header.html',
            controller: function ($scope, UtilService, ServerConfigurationService) {
                ServerConfigurationService.getSiteInformation().then(function (siteInformation) {
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

})();
