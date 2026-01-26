(function () {

    'use strict';

    angular.module('adminportal.services.cc', [
        "adminportal.services.cc.operations",
        "adminportal.services.cc.dashboards",
        "adminportal.services.cc.configuration",
        "adminportal.services.cc.troubleshooting"
    ]);

    var CCModule = angular.module('adminportal.services.cc');

    CCModule.config(function ($stateProvider) {

        $stateProvider.state('services.cc', {
            abstract: true,
            url: "/collect-call",
            templateUrl: 'services/cc/cc.html',
            data: {
                headerKey: 'Services.CC.PageHeader',
                permissions: [
                    'SERVICES_CC'
                ]
            }
        });

    });

})();
