(function () {

    'use strict';

    angular.module('adminportal.services.mca.messagetemplates', [
        'adminportal.services.mca.messagetemplates.messagetemplates'
    ]);

    var MCAMessageTemplatesModule = angular.module('adminportal.services.mca.messagetemplates');

    MCAMessageTemplatesModule.config(function ($stateProvider) {

        $stateProvider.state('services.mca.messagetemplates', {
            abstract: true,
            url: "",
            templateUrl: "services/mca/message-templates/operations.html"
        });

    });

})();
