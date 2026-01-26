(function () {

    'use strict';

    angular.module('ccportal.services.vsms', [
        'ccportal.services.vsms.preferences',
        'ccportal.services.vsms.messages',
        "ccportal.services.vsms.activity-history"
    ]);

    var VSMSModule = angular.module('ccportal.services.vsms');

    VSMSModule.config(function ($stateProvider) {

        $stateProvider.state('services.vsms', {
            abstract: true,
            url: "/voice-sms",
            templateUrl: 'services/vsms/vsms.html',
            data: {
                headerKey: 'Services.VSMS.PageHeader',
                isService: true
            }
        });

    });

})();
