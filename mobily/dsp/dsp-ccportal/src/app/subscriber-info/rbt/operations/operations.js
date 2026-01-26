(function () {

    'use strict';

    angular.module('ccportal.subscriber-info.rbt.operations', [
        'ccportal.subscriber-info.rbt.operations.activedefaulttone',
        'ccportal.subscriber-info.rbt.operations.specialconditionassignment'
    ]);

    var RBTOperationsModule = angular.module('ccportal.subscriber-info.rbt.operations');

    RBTOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('subscriber-info.rbt.operations', {
            abstract: true,
            url: "/operations",
            templateUrl: "subscriber-info/rbt/operations/operations.html"
        });

    });

})();


