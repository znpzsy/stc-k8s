(function () {

    'use strict';

    angular.module('ccportal.subscriber-info.dcb', [
        'ccportal.subscriber-info.dcb.constants',
        'ccportal.subscriber-info.dcb.filters',
        'ccportal.subscriber-info.dcb.directives',
        'ccportal.subscriber-info.dcb.operations'
    ]);

    var DcbModule = angular.module('ccportal.subscriber-info.dcb');

    DcbModule.config(function ($stateProvider) {

        $stateProvider.state('subscriber-info.dcb', {
            abstract: true,
            url: "/direct-carrier-billing",
            template: '<div ui-view></div>',
            data: {
                headerKey: 'Dashboard.PageHeader'
            }
        });

    });

})();
