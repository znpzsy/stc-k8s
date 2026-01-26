(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.screenings.global', [
        "adminportal.products.antispamsms.operations.screenings.global.contentwhitelist",
        "adminportal.products.antispamsms.operations.screenings.global.sourcescreening",
    ]);

    var AntiSpamSMSOperationsScreeningsGlobalModule = angular.module('adminportal.products.antispamsms.operations.screenings.global');

    AntiSpamSMSOperationsScreeningsGlobalModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations.screenings.global', {
            abstract: true,
            url: "/global",
            template: '<div ui-view></div>'
        });

    });

})();
