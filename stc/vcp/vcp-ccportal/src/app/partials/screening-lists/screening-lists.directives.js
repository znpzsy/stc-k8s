(function () {

    'use strict';

    angular.module('ccportal.screening-lists.directives', []);

    var ScreeningListsDirectivesModule = angular.module('ccportal.screening-lists.directives');

    ScreeningListsDirectivesModule.directive('ccportalScreeningListsTemplates', function () {
        return {
            restrict: 'E',
            templateUrl: 'partials/screening-lists/screening-lists.templates.html'
        };
    });

})();
