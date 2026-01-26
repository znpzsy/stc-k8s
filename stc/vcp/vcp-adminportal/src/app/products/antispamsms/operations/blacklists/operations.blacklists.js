(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.blacklists', [
        'adminportal.products.antispamsms.operations.blacklists.url',
        'adminportal.products.antispamsms.operations.blacklists.urlanomaly',
        'adminportal.products.antispamsms.operations.blacklists.phone'
    ]);

    var AntiSpamSMSOperationsBlackListsModule = angular.module('adminportal.products.antispamsms.operations.blacklists');

    AntiSpamSMSOperationsBlackListsModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations.blacklists', {
            url: "/blacklists",
            template: '<div ui-view></div>'
        })
    });

})();
