(function () {

    'use strict';

    angular.module('adminportal.subsystems.contentmanagement.operations.rbt.contentmetadatas', [
        'adminportal.subsystems.contentmanagement.operations.rbt.contentmetadatas.albums',
        'adminportal.subsystems.contentmanagement.operations.rbt.contentmetadatas.artists',
        'adminportal.subsystems.contentmanagement.operations.rbt.contentmetadatas.tones',
        'adminportal.subsystems.contentmanagement.operations.rbt.contentmetadatas.moods'
    ]);

    var ContentManagementOperationsContentMetadatasRBTModule = angular.module('adminportal.subsystems.contentmanagement.operations.rbt.contentmetadatas');

    ContentManagementOperationsContentMetadatasRBTModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.contentmanagement.operations.rbt.contentmetadatas', {
            abstract: true,
            url: '/content-metadata',
            template: '<div ui-view></div>'
        });

    });

})();
