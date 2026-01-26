(function () {

    'use strict';

    angular.module('ccportal.subscriber-info.dcb.operations', [
        'ccportal.subscriber-info.dcb.operations.dcbinformation'
    ]);

    var DCBOperationsModule = angular.module('ccportal.subscriber-info.dcb.operations');

    DCBOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('subscriber-info.dcb.operations', {
            abstract: true,
            url: "/operations",
            templateUrl: "subscriber-info/dcb/operations/operations.html"
        });

    });

})();


