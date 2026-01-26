(function () {

    'use strict';

    angular.module('partnerportal.partner-info.operations.rbt.contentmetadatas', [
        'partnerportal.partner-info.operations.rbt.contentmetadatas.albums',
        'partnerportal.partner-info.operations.rbt.contentmetadatas.artists',
        'partnerportal.partner-info.operations.rbt.contentmetadatas.tones',
        'partnerportal.partner-info.operations.rbt.contentmetadatas.moods'
    ]);

    var PartnerInfoContentManagementContentMetadatasRBTModule = angular.module('partnerportal.partner-info.operations.rbt.contentmetadatas');

    PartnerInfoContentManagementContentMetadatasRBTModule.config(function ($stateProvider) {

        $stateProvider.state('partner-info.operations.rbt.contentmetadatas', {
            abstract: true,
            url: '/content-metadata',
            template: '<div ui-view></div>'
        });

    });

})();
