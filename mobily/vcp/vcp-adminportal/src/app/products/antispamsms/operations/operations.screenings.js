(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.screenings', [
        "adminportal.products.antispamsms.operations.screenings.applicationmt",
        "adminportal.products.antispamsms.operations.screenings.intltoinboundroamer",
        "adminportal.products.antispamsms.operations.screenings.moinboundoutboundroamer",
        "adminportal.products.antispamsms.operations.screenings.mtsmshub",
        "adminportal.products.antispamsms.operations.screenings.pduparameter",
        "adminportal.products.antispamsms.operations.screenings.srism",
        "adminportal.products.antispamsms.operations.screenings.localincomingmo"
    ]);

    var AntiSpamSMSOperationsScreeningsModule = angular.module('adminportal.products.antispamsms.operations.screenings');

    AntiSpamSMSOperationsScreeningsModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations.screenings', {
            abstract: true,
            url: "/screenings",
            template: '<div ui-view></div>'
        });

    });

})();
