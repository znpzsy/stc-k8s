(function () {

    'use strict';

    angular.module('ccportal.subscriber-info.directives', []);

    var SubscriberInfoDirectivesModule = angular.module('ccportal.subscriber-info.directives');

    SubscriberInfoDirectivesModule.directive('availablityCheck', function () {
        return {
            // restrict to an attribute type.
            restrict: 'A',
            // element must have ng-model attribute.
            require: 'ngModel',
            // scope = the parent scope
            // elem = the element the directive is on
            // attr = a dictionary of attributes on the element
            // ctrl = the controller for ngModel.
            scope: false,
            link: function (scope, elem, attr, ctrl) {
                var currentList = scope.currentList;

                // add a parser that will process each time the value is
                // parsed into the model when input updates it.
                ctrl.$parsers.unshift(function (value) {
                    // search entered value in the current list.
                    var listItem = _.findWhere(currentList, {screenableEntryId: value});
                    var isAvailable = !_.isEmpty(listItem);

                    ctrl.$setValidity('availablityCheck', !isAvailable);

                    // returns availability value.
                    return value;
                });

                // add a formatter that will process each time the value
                // is updated on the DOM element.
                ctrl.$formatters.unshift(function (value) {
                    // search entered value in the current list.
                    var listItem = _.findWhere(currentList, {screenableEntryId: value});
                    var isAvailable = !_.isEmpty(listItem);

                    ctrl.$setValidity('availablityCheck', !isAvailable);

                    // return the value or nothing will be written to the DOM.
                    return value;
                });
            }
        };
    });

    SubscriberInfoDirectivesModule.directive('subscribersNumberCheck', function () {
        return {
            // restrict to an attribute type.
            restrict: 'A',
            // element must have ng-model attribute.
            require: 'ngModel',
            // scope = the parent scope
            // elem = the element the directive is on
            // attr = a dictionary of attributes on the element
            // ctrl = the controller for ngModel.
            scope: false,
            link: function (scope, elem, attr, ctrl) {
                var currentMsisdn = scope.currentMsisdn;

                // add a parser that will process each time the value is
                // parsed into the model when input updates it.
                ctrl.$parsers.unshift(function (value) {
                    var isCurrentSubscribersNumber = angular.equals(currentMsisdn, value);

                    ctrl.$setValidity('subscribersNumberCheck', !isCurrentSubscribersNumber);

                    return value;
                });

                // add a formatter that will process each time the value
                // is updated on the DOM element.
                ctrl.$formatters.unshift(function (value) {
                    var isCurrentSubscribersNumber = angular.equals(currentMsisdn, value);

                    ctrl.$setValidity('subscribersNumberCheck', !isCurrentSubscribersNumber);

                    // return the value or nothing will be written to the DOM.
                    return value;
                });
            }
        };
    });

})();


