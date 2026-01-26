(function () {

    'use strict';

    angular.module('adminportal.services.rbt.operations.messagetemplates.prayertimes', []);

    var RBTOperationsMessageTemplatesPromotedModule = angular.module('adminportal.services.rbt.operations.messagetemplates.prayertimes');

    RBTOperationsMessageTemplatesPromotedModule.config(function ($stateProvider) {

        $stateProvider.state('services.rbt.operations.messagetemplates.prayertimes', {
            url: "/prayertimes",
            templateUrl: "services/rbt/operations/operations.messagetemplates.main.html",
            data: {
                pageHeaderKey: 'Services.RBT.Operations.MessageTemplates.Title',
                subPageHeaderKey: 'Services.RBT.Operations.MessageTemplates.PrayerTimes'
            },
            resolve: {

                languages: function (RBTConfService) {
                    return RBTConfService.getLanguages();
                }
            }
        }).state('services.rbt.operations.messagetemplates.prayertimes.view', {
            url: "/:languageCode",
            views: {
                'languageForm': {
                    templateUrl: "services/rbt/operations/operations.language.html",
                    controller: 'RBTOperationsMessageTemplatesLanguagesCtrl'
                },
                'confForm': {
                    templateUrl: "services/rbt/operations/operations.messagetemplates.texts.detail.html",
                    controller: 'RBTOperationsMessageTemplatesPrayertimesConfCtrl',
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

    RBTOperationsMessageTemplatesPromotedModule.controller('RBTOperationsMessageTemplatesPrayertimesConfCtrl', function ($scope, $log, $q, $state, $stateParams, $translate,  $controller,notification, Restangular,
                                                                                                                  RBTConfService, messageTemplates) {
        $log.debug("RBTOperationsMessageTemplatesPrayertimesConfCtrl");

        $controller('RBTOperationsMessageTemplatesCommonCtrl', {$scope: $scope});

        if ($stateParams.languageCode) {
            $scope.languageCode = $stateParams.languageCode;
        }

        $scope.showForm = !_.isEmpty(messageTemplates);

        $scope.conf = {
            id: _.uniqueId(),
            messageText: messageTemplates.hangupMessageForPrayerTimes,
            hangupMessageForPromotedTone:messageTemplates.hangupMessageForPromotedTone,
            hangupMessageHangup:messageTemplates.hangupMessage
        };

        $scope.originalConf = angular.copy($scope.conf);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalConf, $scope.conf);
        };

        $scope.save = function (conf) {

            var messageTemplatesPayload = {
                "hangupMessageForPrayerTimes": conf.messageText,
                "hangupMessageForPromotedTone":$scope.originalConf.hangupMessageForPromotedTone,
                "hangupMessage":$scope.originalConf.hangupMessageHangup
            };

            $scope.saveMessageTemplates(messageTemplatesPayload);

        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };

    });

})();

