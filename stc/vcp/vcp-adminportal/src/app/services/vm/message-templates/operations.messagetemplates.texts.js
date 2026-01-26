(function () {

    'use strict';

    angular.module('adminportal.services.vm.message-templates.messagetemplates.texts', []);

    var VMMessageTemplatesOperationsCopyModule = angular.module('adminportal.services.vm.message-templates.messagetemplates.texts');

    VMMessageTemplatesOperationsCopyModule.config(function ($stateProvider) {

        $stateProvider.state('services.vm.message-templates.messagetemplates.texts', {
            url: "/notifications",
            templateUrl: "services/vm/message-templates/operations.messagetemplates.main.html",
            data: {
                pageHeaderKey: 'Services.VM.Operations.MessageTemplates.Title',
                subPageHeaderKey: 'Services.VM.Operations.MessageTemplates.Texts'
            },
            resolve: {
                languages: function (VMConfigurationService) {
                    return VMConfigurationService.getLanguages();
                }
            }
        }).state('services.vm.message-templates.messagetemplates.texts.view', {
            url: "/:languageCode",
            views: {
                'languageForm': {
                    templateUrl: "services/vm/message-templates/operations.language.html",
                    controller: 'VMMessageTemplatesOperationsLanguagesCtrl'
                },
                'confForm': {
                    templateUrl: "services/vm/message-templates/operations.messagetemplates.texts.detail.html",
                    controller: 'VMMessageTemplatesOperationsNotificationConfCtrl',
                    resolve: {
                        notificationText: function ($stateParams, VMConfigurationService) {
                            if ($stateParams.languageCode)
                                return VMConfigurationService.getNotificationText($stateParams.languageCode);
                            else
                                return {};
                        }
                    }
                }
            }
        });

    });

    VMMessageTemplatesOperationsCopyModule.controller('VMMessageTemplatesOperationsLanguagesCtrl', function ($scope, $log, $state, $stateParams, languages) {
        $log.debug("VMMessageTemplatesOperationsLanguagesCtrl");

        // Language list
        $scope.languageList = [];
        _.each(languages.shortCodes, function (shortCode) {
            $scope.languageList.push({
                languageCode: shortCode
            });
        });

        if ($stateParams.languageCode) {
            $scope.languageCode = $stateParams.languageCode;
        }

        $scope.changeLanguage = function (languageCode) {
            $log.debug("Selected language: ", languageCode);

            $state.transitionTo($state.$current, {languageCode: languageCode ? languageCode : undefined}, {
                reload: false,
                inherit: false,
                notify: true
            });
        };
    });

    VMMessageTemplatesOperationsCopyModule.controller('VMMessageTemplatesOperationsNotificationConfCtrl', function ($scope, $log, $q, $state, $stateParams, $translate, notification, Restangular,
                                                                                                                    VMConfigurationService, notificationText) {
        $log.debug("VMMessageTemplatesOperationsNotificationConfCtrl");

        if ($stateParams.languageCode) {
            $scope.languageCode = $stateParams.languageCode;
        }

        $scope.showForm = !_.isEmpty(notificationText);

        $scope.conf = {
            id: _.uniqueId(),
            notificationText: notificationText.notificationText
        };

        $scope.originalConf = angular.copy($scope.conf);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalConf, $scope.conf);
        };

        $scope.save = function (conf) {
            $log.debug('Updating VM [', $scope.languageCode, '] notifications configuration: ', conf);

            var notificationTextPayload = {
                "notificationText": conf.notificationText
            };
            VMConfigurationService.updateNotificationText($stateParams.languageCode, notificationTextPayload).then(function (notificationTextResponse) {
                $log.debug('Updated VM [', $scope.languageCode, '] notification text configuration: ', conf, ', response: ', notificationTextResponse);


                if ((notificationTextResponse && notificationTextResponse.errorCode)) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: notificationTextResponse.errorCode,
                            errorText: notificationTextResponse.detail
                        })
                    });
                } else {
                    $scope.originalConf = angular.copy($scope.conf);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }
            });

        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });

})();
