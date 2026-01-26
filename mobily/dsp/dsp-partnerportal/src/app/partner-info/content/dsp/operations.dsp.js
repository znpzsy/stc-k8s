(function () {

    'use strict';

    angular.module('partnerportal.partner-info.operations.dsp', [
        'partnerportal.partner-info.operations.dsp.contentmetadatas'
    ]);

    var PartnerInfoContentManagementDSPModule = angular.module('partnerportal.partner-info.operations.dsp');

    PartnerInfoContentManagementDSPModule.config(function ($stateProvider) {

        $stateProvider.state('partner-info.operations.dsp', {
            abstract: true,
            url: "/dsp",
            template: "<div ui-view></div>"
        });

    });

})();