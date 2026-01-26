(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.counters', [
        "adminportal.products.antispamsms.operations.counters.addressranges",
        "adminportal.products.antispamsms.operations.counters.mosmscounter",
        "adminportal.products.antispamsms.operations.counters.mtsmscounter"
    ]);

    var AntiSpamSMSOperationsCountersModule = angular.module('adminportal.products.antispamsms.operations.counters');

    AntiSpamSMSOperationsCountersModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations.counters', {
            abstract: true,
            url: "/counters",
            template: '<div ui-view></div>'
        });

    });

})();
