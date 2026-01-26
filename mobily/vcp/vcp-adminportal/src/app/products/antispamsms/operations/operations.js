(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations', [
        "adminportal.products.antispamsms.operations.addressranges",
        "adminportal.products.antispamsms.operations.contentfilters",
        "adminportal.products.antispamsms.operations.counters",
        "adminportal.products.antispamsms.operations.greylists",
        "adminportal.products.antispamsms.operations.antispamlists",
        "adminportal.products.antispamsms.operations.screenings",
        "adminportal.products.antispamsms.operations.scamodifiers"
    ]);

    var AntiSpamSMSOperationsModule = angular.module('adminportal.products.antispamsms.operations');

    AntiSpamSMSOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations', {
            abstract: true,
            url: "/operations",
            templateUrl: "products/antispamsms/operations/operations.html"
        });

    });

})();
