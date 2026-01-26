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

    ApplicationDirectives.directive('partnerportalTranslateCloak', function ($rootScope, $translate) {
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

    ApplicationDirectives.directive('partnerportalPasswordVerify', function () {
        return {
            require: "ngModel",
            scope: {
                partnerportalPasswordVerify: '=',
                formName: '@'
            },
            link: function (scope, element, attrs, ctrl) {
                var formObj = scope.formName ? scope.$parent[scope.formName] : scope.$parent.form;

                // add a parser that will process each time the value is
                // parsed into the model when input updates it.
                ctrl.$parsers.unshift(function (viewValue) {
                    var origin = scope.partnerportalPasswordVerify;

                    if (formObj.password) {
                        formObj.password.$setValidity('passwordVerify', true);
                    }
                    if (formObj.confirmpassword) {
                        formObj.confirmpassword.$setValidity('passwordVerify', true);
                    }

                    var isNotVerified = (_.isEmpty(viewValue) || origin === viewValue);
                    ctrl.$setValidity("passwordVerify", isNotVerified);

                    return viewValue;
                });

                // add a formatter that will process each time the value
                // is updated on the DOM element.
                ctrl.$formatters.unshift(function (viewValue) {
                    var origin = scope.partnerportalPasswordVerify;

                    var isNotVerified = (_.isEmpty(viewValue) || origin === viewValue);
                    ctrl.$setValidity("passwordVerify", isNotVerified);

                    return viewValue;
                });
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

    ApplicationDirectives.directive('reportButtonIndicator', function ($interval, cfpLoadingBar) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                scope.showSpinner = false;

                var _interval;

                element.on('click', function (event) {
                    scope.showSpinner = true;

                    element.addClass('disabled').attr('disabled', 'disabled');

                    _interval = $interval(function () {
                        scope.$emit('ReportButtonIndicatorChanged', cfpLoadingBar.status());
                    }, 500);
                });

                scope.$on('ReportButtonIndicatorChanged', function (event, indicatorValue) {
                    if (indicatorValue === 0) {
                        $interval.cancel(_interval);

                        scope.showSpinner = false;

                        element.removeClass('disabled').attr('disabled', null);
                    }
                });
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

    ApplicationDirectives.directive('partnerportalHeader', function () {
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

    ApplicationDirectives.directive('partnerportalNavbar', function () {
        return {
            restrict: 'E',
            templateUrl: 'partials/navbar/navbar.html'
        };
    });

    ApplicationDirectives.directive('partnerportalFooter', function ($timeout) {
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
