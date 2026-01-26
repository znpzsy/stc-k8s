(function () {

    'use strict';

    angular.module('ccportal.services.coc', [
        'ccportal.services.coc.screening-lists',
        'ccportal.services.coc.activity-history'
    ]);

    var COCModule = angular.module('ccportal.services.coc');

    COCModule.config(function ($stateProvider) {

        $stateProvider.state('services.coc', {
            abstract: true,
            url: "/collect-call",
            templateUrl: 'services/coc/collect-call.html',
            data: {
                headerKey: 'Services.CC.PageHeader',
                isService: true,
                permissions: [
                    'SERVICES_CC'
                ]
            }
        });

    });

})();
