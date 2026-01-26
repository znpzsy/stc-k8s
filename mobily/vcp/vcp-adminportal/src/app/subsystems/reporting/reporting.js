(function () {

    'use strict';

    angular.module('adminportal.subsystems.reporting', [
        "adminportal.subsystems.reporting.reports",
        "adminportal.subsystems.reporting.schedules"
    ]);

    var ReportingModule = angular.module('adminportal.subsystems.reporting');

    ReportingModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.reporting', {
            abstract: true,
            url: "/reporting",
            templateUrl: 'subsystems/reporting/reporting.html',
            data: {
                headerKey: 'Subsystems.Reporting.PageHeader',
                permissions: [
                    'SUBSYSTEMS_REPORTGENERATION'
                ]
            }
        });

    });

})();
