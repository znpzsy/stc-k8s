(function () {

    'use strict';

    angular.module('partnerportal.partner-info.operations.rbt.contentmetadatas', [
        'partnerportal.partner-info.operations.rbt.contentmetadatas.tones'
    ]);

    var PartnerInfoContentManagementContentMetadatasRBTModule = angular.module('partnerportal.partner-info.operations.rbt.contentmetadatas');

    PartnerInfoContentManagementContentMetadatasRBTModule.config(function ($stateProvider) {

        $stateProvider.state('partner-info.operations.rbt.contentmetadatas', {
            abstract: true,
            url: '/content',
            template: '<div ui-view></div>'
        });

    });

})();
