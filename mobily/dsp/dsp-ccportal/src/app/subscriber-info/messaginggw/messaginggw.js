(function () {

    'use strict';

    angular.module('ccportal.subscriber-info.messaginggw', [
        'ccportal.subscriber-info.messaginggw.constants',
        'ccportal.subscriber-info.messaginggw.filters',
        'ccportal.subscriber-info.messaginggw.directives'
    ]);

    var MessagingGwModule = angular.module('ccportal.subscriber-info.messaginggw');

    MessagingGwModule.config(function ($stateProvider) {

        $stateProvider.state('subscriber-info.messaginggw', {
            abstract: true,
            template: '<div ui-view></div>'
        });

    });

})();
