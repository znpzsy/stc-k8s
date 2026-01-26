(function () {

    'use strict';

    angular.module('adminportal.services.vsms.operations', [
        'adminportal.services.vsms.operations.subscriberprofiles',
        'adminportal.services.vsms.operations.subscriptions'
    ]);

    var VSMSOperationsModule = angular.module('adminportal.services.vsms.operations');

    VSMSOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('services.vsms.operations', {
            abstract: true,
            url: "/operations",
            templateUrl: "services/vsms/operations/operations.html"
        });

    });

})();
