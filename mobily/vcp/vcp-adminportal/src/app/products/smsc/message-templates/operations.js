(function () {

    'use strict';

    angular.module('adminportal.products.smsc.message-templates', [
        'adminportal.products.smsc.message-templates.message-templates'
    ]);

    var SmscMessageTemplatesModule = angular.module('adminportal.products.smsc.message-templates');

    SmscMessageTemplatesModule.config(function ($stateProvider) {

        $stateProvider.state('products.smsc.message-templates', {
            abstract: true,
            url: "",
            templateUrl: "products/smsc/message-templates/operations.html"
        });

    });

})();
