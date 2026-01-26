(function () {

    'use strict';

    angular.module('adminportal.subsystems.licensing', [
        "adminportal.subsystems.licensing.dashboards",
        "adminportal.subsystems.licensing.operations"
    ]);

    var LicensingModule = angular.module('adminportal.subsystems.licensing');

    LicensingModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.licensing', {
            abstract: true,
            url: "/licensing",
            templateUrl: 'subsystems/licensing/licensing.html',
            data: {
                headerKey: 'Subsystems.Licensing.PageHeader',
                permissions: [
                    'SUBSYSTEMS_LICENSEMGMT'
                ]
            }
        });

    });

})();
