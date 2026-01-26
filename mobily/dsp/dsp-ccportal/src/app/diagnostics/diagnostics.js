(function () {

    'use strict';

    angular.module('ccportal.diagnostics', [
        'ccportal.diagnostics.auditlogs'
    ]);

    var DiagnosticsModule = angular.module('ccportal.diagnostics');

    DiagnosticsModule.config(function ($stateProvider) {

        $stateProvider.state('diagnostics', {
            url: "/diagnostics",
            abstracte: true,
            templateUrl: 'diagnostics/diagnostics.html',
            data: {
                headerKey: 'Dashboard.PageHeader'
            }
        });

    });

})();