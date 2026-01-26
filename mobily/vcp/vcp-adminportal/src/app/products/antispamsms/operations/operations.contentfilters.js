(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.contentfilters', [
        "adminportal.products.antispamsms.operations.contentfilters.addressranges",
        "adminportal.products.antispamsms.operations.contentfilters.mosmscontent",
        "adminportal.products.antispamsms.operations.contentfilters.mtsmscontent",
        "adminportal.products.antispamsms.operations.contentfilters.aosmscontent"
    ]);

    var AntiSpamSMSOperationsContentFiltersModule = angular.module('adminportal.products.antispamsms.operations.contentfilters');

    AntiSpamSMSOperationsContentFiltersModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations.contentfilters', {
            abstract: true,
            url: "/contentfilters",
            template: '<div ui-view></div>'
        });

    });

})();
