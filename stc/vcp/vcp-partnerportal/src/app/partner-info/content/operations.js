(function () {

    'use strict';

    angular.module('partnerportal.partner-info.operations', [
        'partnerportal.partner-info.operations.rbt'
    ]);

    var PartnerInfoOperationsModule = angular.module('partnerportal.partner-info.operations');

    PartnerInfoOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('partner-info.operations', {
            abstract: true,
            url: "/operations",
            template: "<div ui-view></div>"
        });

    });

})();