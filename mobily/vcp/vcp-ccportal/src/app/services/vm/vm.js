(function () {

    'use strict';

    angular.module('ccportal.services.vm', [
        'ccportal.services.vm.preferences',
        'ccportal.services.vm.messages',
        'ccportal.services.vm.activity-history',
        'ccportal.services.vm.activity-history-remote'
    ]);

    var VMModule = angular.module('ccportal.services.vm');

    VMModule.config(function ($stateProvider) {

        $stateProvider.state('services.vm', {
            abstract: true,
            url: "/voice-mail",
            templateUrl: 'services/vm/vm.html',
            data: {
                headerKey: 'Services.VM.PageHeader',
                isService: true,
                permissions: [
                    'SERVICES_VM'
                ]
            }
        });

    });

})();
