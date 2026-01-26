(function () {

    'use strict';

    angular.module('adminportal.services.vm.message-templates', [
        'adminportal.services.vm.message-templates.messagetemplates'
    ]);

    var VMMessageTemplatesModule = angular.module('adminportal.services.vm.message-templates');

    VMMessageTemplatesModule.config(function ($stateProvider) {

        $stateProvider.state('services.vm.message-templates', {
            abstract: true,
            url: "",
            templateUrl: "services/vm/message-templates/operations.html"
        });

    });

})();
