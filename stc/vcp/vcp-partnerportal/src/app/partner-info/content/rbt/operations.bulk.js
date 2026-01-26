(function () {

    'use strict';

    angular.module('partnerportal.partner-info.operations.rbt.bulk', [
        'partnerportal.partner-info.operations.rbt.bulk.upload',
        'partnerportal.partner-info.operations.rbt.bulk.management'
    ]);

    var PartnerInfoContentManagementBulkRBTModule = angular.module('partnerportal.partner-info.operations.rbt.bulk');

    PartnerInfoContentManagementBulkRBTModule.config(function ($stateProvider) {

        $stateProvider.state('partner-info.operations.rbt.bulk', {
            abstract: true,
            url: '/bulk-content',
            template: '<div ui-view></div>',
        });

    });

})();
