(function () {

    'use strict';

    angular.module('adminportal.services.vsms.message-templates.messagetemplates.texts', []);

    var VSMSMessageTemplatesOperationsCopyModule = angular.module('adminportal.services.vsms.message-templates.messagetemplates.texts');

    VSMSMessageTemplatesOperationsCopyModule.config(function ($stateProvider) {

        $stateProvider.state('services.vsms.message-templates.messagetemplates.texts', {
            url: "/notifications",
            templateUrl: "services/vsms/message-templates/operations.messagetemplates.main.html",
            data: {
                pageHeaderKey: 'Services.VSMS.Operations.MessageTemplates.Title',
                subPageHeaderKey: 'Services.VSMS.Operations.MessageTemplates.Texts'
            },
            resolve: {
                languages: function (VSMSConfigurationService) {
                    return VSMSConfigurationService.getLanguages();
                }
            }
        }).state('services.vsms.message-templates.messagetemplates.texts.view', {
            url: "/:languageCode",
            views: {
                'languageForm': {
                    templateUrl: "services/vsms/message-templates/operations.language.html",
                    controller: 'VSMSMessageTemplatesOperationsLanguagesCtrl'
                },
                'confForm': {
                    templateUrl: "services/vsms/message-templates/operations.messagetemplates.texts.detail.html",
                    controller: 'VSMSMessageTemplatesOperationsNotificationConfCtrl',
                    resolve: {
                        notifications: function ($stateParams, VSMSConfigurationService) {
                            if ($stateParams.languageCode)
                                return VSMSConfigurationService.getNotificationText($stateParams.languageCode);
                            else
                                return {};
                        }
                    }
                }
            }
        });

    });

    VSMSMessageTemplatesOperationsCopyModule.controller('VSMSMessageTemplatesOperationsLanguagesCtrl', function ($scope, $log, $state, $stateParams, languages) {
        $log.debug("VSMSMessageTemplatesOperationsLanguagesCtrl");

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

    VSMSMessageTemplatesOperationsCopyModule.controller('VSMSMessageTemplatesOperationsNotificationConfCtrl', function ($scope, $log, $q, $state, $stateParams, $translate, notification, Restangular,
                                                                                                                        VSMSConfigurationService, notifications) {
        $log.debug("VSMSMessageTemplatesOperationsNotificationConfCtrl");

        if ($stateParams.languageCode) {
            $scope.languageCode = $stateParams.languageCode;
        }

        $scope.showForm = !_.isEmpty(notifications);

        $scope.conf = {
            id: _.uniqueId(),
            notifications: Restangular.stripRestangular(notifications)
        };

        $scope.originalConf = angular.copy($scope.conf);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalConf, $scope.conf);
        };

        $scope.save = function (conf) {
            $log.debug('Updating VSMS [', $scope.languageCode, '] notifications configuration: ', conf);

            var apiCall = VSMSConfigurationService.updateNotificationText($stateParams.languageCode, conf.notifications);
            apiCall.then(function (response) {
                var apiResponse = Restangular.stripRestangular(response);

                $log.debug('Updated VSMS [', $scope.languageCode, '] notifications configuration: ', conf, ', response: ', apiResponse);

                if (apiResponse.errorCode) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: apiResponse.errorCode,
                            errorText: apiResponse.detail
                        })
                    });
                } else {
                    $scope.originalConf = angular.copy($scope.conf);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }
            }, function (response) {
                $log.debug('Cannot update VSMS [', $scope.languageCode, '] notifications configuration: ', conf, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });

})();
