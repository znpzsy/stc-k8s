(function () {

    'use strict';

    angular.module('adminportal.subsystems.contentmanagement.operations.dsp', [
        'adminportal.subsystems.contentmanagement.operations.dsp.contentcategories',
        'adminportal.subsystems.contentmanagement.operations.dsp.contenttypes',
        'adminportal.subsystems.contentmanagement.operations.dsp.contentmetadatas'
    ]);

    var ContentManagementOperationsDSPModule = angular.module('adminportal.subsystems.contentmanagement.operations.dsp');

    ContentManagementOperationsDSPModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.contentmanagement.operations.dsp', {
            abstract: true,
            url: "/dsp",
            templateUrl: 'subsystems/contentmanagement/operations/dsp/operations.dsp.html'
        });

    });

})();