(function () {

    'use strict';

    angular.module('adminportal.services.vsms.message-templates.messagetemplates', [
        'adminportal.services.vsms.message-templates.messagetemplates.greetings',
        'adminportal.services.vsms.message-templates.messagetemplates.prompts',
        'adminportal.services.vsms.message-templates.messagetemplates.texts'
    ]);

    var VSMSMessageTemplatesOperationsModule = angular.module('adminportal.services.vsms.message-templates.messagetemplates');

    VSMSMessageTemplatesOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('services.vsms.message-templates.messagetemplates', {
            abstract: true,
            url: "/messagetemplates",
            templateUrl: "partials/simple.abstract.html"
        });

    });

    VSMSMessageTemplatesOperationsModule.controller('VSMSMessageTemplatesOperationsConfCtrl', function ($scope, $log, $q, $state, $stateParams, $translate, notification, Restangular,
                                                                                                    messageTemplates, updateMethod) {
        $log.debug("VSMSMessageTemplatesOperationsConfCtrl");

        if ($stateParams.languageCode) {
            $scope.languageCode = $stateParams.languageCode;
        }

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });

    VSMSMessageTemplatesOperationsModule.directive('acceptWawFile', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: false,
            link: function (scope, elem, attr, ctrl) {
                scope.$watch(attr.acceptWawFile, function (newValue) {
                    var acceptWawFile = scope.$eval(attr.acceptWawFile);
                    if (acceptWawFile) {
                        var fileName = acceptWawFile.name;
                        var fileExtension = fileName.substr(fileName.lastIndexOf('.') + 1);

                        ctrl.$setValidity('wawFileTypeError', (fileExtension === 'wav'));
                    }
                });
            }
        };
    });

})();
