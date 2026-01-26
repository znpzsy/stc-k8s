

(function () {

    'use strict';

    angular.module('adminportal.services.rbt.operations', [
        'adminportal.services.rbt.operations.messagetemplates',
        'adminportal.services.rbt.operations.presskey',
        'adminportal.services.rbt.operations.hotcodes'
    ]);

    var RBTMessageTemplatesModule = angular.module('adminportal.services.rbt.operations');

    RBTMessageTemplatesModule.config(function ($stateProvider) {

        $stateProvider.state('services.rbt.operations', {
            abstract: true,
            url: "/operations",
            templateUrl: "services/rbt/operations/operations.html"
        });

    });

})();