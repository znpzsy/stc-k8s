(function () {

    'use strict';

    angular.module('partnerportal.partner-info', [
        "partnerportal.partner-info.constants",
        "partnerportal.partner-info.filters",
        "partnerportal.partner-info.directives",
        "partnerportal.partner-info.operations",
        "partnerportal.partner-info.partner-profile"
    ]);

    var PartnerInfoModule = angular.module('partnerportal.partner-info');

    PartnerInfoModule.config(function ($stateProvider) {

        $stateProvider.state('partner-info', {
            abstract: true,
            url: "/partner-info",
            templateUrl: 'partner-info/partner-info.html',
            data: {
                headerKey: 'PartnerInfo.PageHeader'
            }
        });

    });

})();
