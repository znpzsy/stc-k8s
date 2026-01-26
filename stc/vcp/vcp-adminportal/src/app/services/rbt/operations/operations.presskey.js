
(function () {

    'use strict';

    angular.module('adminportal.services.rbt.operations.presskey', [
        'adminportal.services.rbt.operations.presskey.configuration',
        'adminportal.services.rbt.operations.presskey.management'
    ]);

    var RBTOperationsPressKeyModule = angular.module('adminportal.services.rbt.operations.presskey');

    RBTOperationsPressKeyModule.config(function ($stateProvider) {

        $stateProvider.state('services.rbt.operations.presskey', {
            abstract: true,
            url: "/presskey",
            template: "<div ui-view></div>"
        });

    });

})();