(function () {

    'use strict';

    angular.module('adminportal.services.vsms.message-templates', [
        'adminportal.services.vsms.message-templates.messagetemplates'
    ]);

    var VSMSMessageTemplatesModule = angular.module('adminportal.services.vsms.message-templates');

    VSMSMessageTemplatesModule.config(function ($stateProvider) {

        $stateProvider.state('services.vsms.message-templates', {
            abstract: true,
            url: "",
            templateUrl: "services/vsms/message-templates/operations.html"
        });

    });

})();
