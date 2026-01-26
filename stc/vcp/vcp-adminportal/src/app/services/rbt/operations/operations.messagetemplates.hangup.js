(function () {

    'use strict';

    angular.module('adminportal.services.rbt.operations.messagetemplates.hangup', []);

    var RBTOperationsMessageTemplatesHangupModule = angular.module('adminportal.services.rbt.operations.messagetemplates.hangup');

    RBTOperationsMessageTemplatesHangupModule.config(function ($stateProvider) {

        $stateProvider.state('services.rbt.operations.messagetemplates.hangup', {
            url: "/hangup",
            templateUrl: "services/rbt/operations/operations.messagetemplates.main.html",
            data: {
                pageHeaderKey: 'Services.RBT.Operations.MessageTemplates.Title',
                subPageHeaderKey: 'Services.RBT.Operations.MessageTemplates.Hangup'
            },
            resolve: {

                languages: function (RBTConfService) {
                    return RBTConfService.getLanguages();
                }
            }
        }).state('services.rbt.operations.messagetemplates.hangup.view', {
            url: "/:languageCode",
            views: {
                'languageForm': {
                    templateUrl: "services/rbt/operations/operations.language.html",
                    controller: 'RBTOperationsMessageTemplatesLanguagesCtrl'
                },
                'confForm': {
                    templateUrl: "services/rbt/operations/operations.messagetemplates.texts.detail.html",
                    controller: 'RBTOperationsMessageTemplatesHangupConfCtrl',
                    resolve: {
                        messageTemplates: function ($stateParams, RBTConfService) {
                            if ($stateParams.languageCode)
                                return RBTConfService.getMessageTemplates($stateParams.languageCode);
                            else
                                return {};
                        }
                    }
                }
            }
        });

    });

     RBTOperationsMessageTemplatesHangupModule.controller('RBTOperationsMessageTemplatesHangupConfCtrl', function ($scope, $log, $q, $state, $stateParams, $translate, $controller, notification, Restangular,
                                                                                                                  RBTConfService, messageTemplates) {
        $log.debug("RBTOperationsMessageTemplatesHangupConfCtrl");

        $controller('RBTOperationsMessageTemplatesCommonCtrl', {$scope: $scope});

        if ($stateParams.languageCode) {
            $scope.languageCode = $stateParams.languageCode;
        }

        $scope.showForm = !_.isEmpty(messageTemplates);

        $scope.conf = {
            id: _.uniqueId(),
            messageText: messageTemplates.hangupMessage,
            hangupMessageForPrayerTimes:messageTemplates.hangupMessageForPrayerTimes,
            hangupMessageForPromotedTone:messageTemplates.hangupMessageForPromotedTone
        };

        $scope.originalConf = angular.copy($scope.conf);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalConf, $scope.conf);
        };

        $scope.save = function (conf) {

            var messageTemplatesPayload = {
                "hangupMessage": conf.messageText,
                "hangupMessageForPrayerTimes":$scope.originalConf.hangupMessageForPrayerTimes,
                "hangupMessageForPromotedTone":$scope.originalConf.hangupMessageForPromotedTone
            };

          $scope.saveMessageTemplates(messageTemplatesPayload);
        };

        $scope.cancel = function () {
             $state.go($state.$current, null, {reload: true});
         };

    });

})();

