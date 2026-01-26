(function () {

    'use strict';

    angular.module('ccportal.subscriber-info.rbt', [
        'ccportal.subscriber-info.rbt.operations'
    ]);

    var DcbModule = angular.module('ccportal.subscriber-info.rbt');

    DcbModule.config(function ($stateProvider) {

        $stateProvider.state('subscriber-info.rbt', {
            abstract: true,
            url: "/ring-back-tone",
            template: '<div ui-view></div>',
            data: {
                headerKey: 'Dashboard.PageHeader'
            }
        });

    });

})();
