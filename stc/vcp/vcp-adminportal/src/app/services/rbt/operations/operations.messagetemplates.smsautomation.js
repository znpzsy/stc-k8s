(function () {

    'use strict';

    angular.module('adminportal.services.rbt.operations.messagetemplates.smsautomation', []);

    var RBTOperationsMessageTemplatesSMSAutomationModule = angular.module('adminportal.services.rbt.operations.messagetemplates.smsautomation');

    RBTOperationsMessageTemplatesSMSAutomationModule.config(function ($stateProvider) {

        $stateProvider.state('services.rbt.operations.messagetemplates.smsautomation', {
            url: "/smsautomation",
            templateUrl: "services/rbt/operations/operations.messagetemplates.main.html",
            data: {
                pageHeaderKey: 'Services.RBT.Operations.MessageTemplates.Title',
                subPageHeaderKey: 'Services.RBT.Operations.MessageTemplates.SMSAutomation'
            },
            resolve: {

                languages: function (RBTConfService) {
                    return RBTConfService.getLanguages();
                }
            }
        }).state('services.rbt.operations.messagetemplates.smsautomation.view', {
            url: "/:languageCode",
            views: {
                'languageForm': {
                    templateUrl: "services/rbt/operations/operations.language.html",
                    controller: 'RBTOperationsMessageTemplatesLanguagesCtrl'
                },
                'confForm': {
                    templateUrl: "services/rbt/operations/operations.messagetemplates.texts.detail.html",
                    controller: 'RBTOperationsMessageTemplatesSMSAutomationConfCtrl',
                    resolve: {
                        messageTemplates: function ($stateParams, RBTSMSAutomationService) {
                            if ($stateParams.languageCode)
                                return RBTSMSAutomationService.getMessageTemplates($stateParams.languageCode);
                            else
                                return {};
                        }
                    }
                }
            }
        });

    });

     RBTOperationsMessageTemplatesSMSAutomationModule.controller('RBTOperationsMessageTemplatesSMSAutomationConfCtrl', function ($scope, $log, $q, $state, $stateParams, $translate, $controller, notification, Restangular,
                                                                                                                                 RBTSMSAutomationService, messageTemplates) {
        $log.debug("RBTOperationsMessageTemplatesSMSAutomationConfCtrl");

        $controller('RBTOperationsMessageTemplatesCommonCtrl', {$scope: $scope});

        if ($stateParams.languageCode) {
            $scope.languageCode = $stateParams.languageCode;
        }

        $scope.showForm = !_.isEmpty(messageTemplates);

        $scope.conf = {
            id: _.uniqueId(),
            messageText: messageTemplates.advertContent
        };

        $scope.originalConf = angular.copy($scope.conf);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalConf, $scope.conf);
        };

        $scope.save = function (conf) {

            var messageTemplatesPayload = {
                "advertContent": conf.messageText
            };

            RBTSMSAutomationService.updateMessageTemplates($scope.languageCode, messageTemplatesPayload).then(function (response) {
                $log.debug('Updated sms automation template: ', messageTemplatesPayload, ', response: ', response);

               // $scope.originalServiceProfile = angular.copy(serviceProfile);

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });
            }, function (response) {
                $log.debug('Cannot update sms automation templae profile: ', messageTemplatesPayload, ', response: ', response);
            });
        };

        $scope.cancel = function () {
             $state.go($state.$current, null, {reload: true});
         };

    });

})();

