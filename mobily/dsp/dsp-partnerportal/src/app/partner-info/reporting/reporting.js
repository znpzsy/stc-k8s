(function () {

    'use strict';

    angular.module('partnerportal.partner-info.reporting', [
        "partnerportal.partner-info.reporting.reports",
    ]);

    var ReportingModule = angular.module('partnerportal.partner-info.reporting');

    ReportingModule.config(function ($stateProvider) {

        $stateProvider.state('partner-info.reporting', {
            abstract: true,
            url: "/reporting",
            templateUrl: 'partner-info/reporting/reporting.html',
            data: {
                permissions: [
                    'PRM__REPORTS_ONDEMAND_READ'
                ]
            }
        }).state('partner-info.reporting-dashboards', {
            url: "/reporting/dashboard",
            templateUrl: 'partner-info/reporting/reporting.html',
            data: {
                permissions: [
                    'PRM__REPORTS_ONDEMAND_READ'
                ]
            }
        });

    });

})();
