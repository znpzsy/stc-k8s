(function () {

    'use strict';

    angular.module('adminportal.services.vm.message-templates.messagetemplates', [
        'adminportal.services.vm.message-templates.messagetemplates.greetings',
        'adminportal.services.vm.message-templates.messagetemplates.prompts',
        'adminportal.services.vm.message-templates.messagetemplates.texts'
    ]);

    var VMMessageTemplatesOperationsModule = angular.module('adminportal.services.vm.message-templates.messagetemplates');

    VMMessageTemplatesOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('services.vm.message-templates.messagetemplates', {
            abstract: true,
            url: "/message-templates",
            template: "<div ui-view></div>"
        });

    });

    VMMessageTemplatesOperationsModule.controller('VMMessageTemplatesOperationsConfCtrl', function ($scope, $log, $q, $state, $stateParams, $translate, notification, Restangular,
                                                                                                    messageTemplates, updateMethod) {
        $log.debug("VMMessageTemplatesOperationsConfCtrl");

        if ($stateParams.languageCode) {
            $scope.languageCode = $stateParams.languageCode;
        }

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });

    VMMessageTemplatesOperationsModule.directive('acceptWawFile', function () {
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
