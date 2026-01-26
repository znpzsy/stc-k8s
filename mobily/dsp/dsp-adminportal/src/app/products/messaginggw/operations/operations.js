(function () {

    'use strict';

    angular.module('adminportal.products.messaginggw.operations', [
        'adminportal.products.messaginggw.operations.routingtables',
        'adminportal.products.messaginggw.operations.keywordscreening'
    ]);

    var MessagingGwOperationsModule = angular.module('adminportal.products.messaginggw.operations');

    MessagingGwOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('products.messaginggw.operations', {
            abstract: true,
            url: "/operations",
            templateUrl: "products/messaginggw/operations/operations.html"
        });

    });

})();
