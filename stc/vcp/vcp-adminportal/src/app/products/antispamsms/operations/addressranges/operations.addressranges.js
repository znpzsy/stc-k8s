(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.addressranges', [
        "adminportal.products.antispamsms.operations.addressranges.msisdn"
    ]);

    var AntiSpamSMSOperationsCountersModule = angular.module('adminportal.products.antispamsms.operations.addressranges');

    AntiSpamSMSOperationsCountersModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations.addressranges', {
            abstract: true,
            url: "/addressranges",
            template: '<div ui-view></div>',
            data: {
                permissions: [
                    'READ_ANTISPAM_ANTISPAMLISTS_OPERATIONS'
                ]
            }
        });

    });

})();
