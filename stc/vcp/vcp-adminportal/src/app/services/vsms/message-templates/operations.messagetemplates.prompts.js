(function () {

    'use strict';

    angular.module('adminportal.services.vsms.message-templates.messagetemplates.prompts', []);

    var VSMSMessageTemplatesOperationsPromptsModule = angular.module('adminportal.services.vsms.message-templates.messagetemplates.prompts');

    VSMSMessageTemplatesOperationsPromptsModule.config(function ($stateProvider) {

        $stateProvider.state('services.vsms.message-templates.messagetemplates.prompts', {
            url: "/prompts/:contentType",
            templateUrl: "services/vsms/message-templates/operations.messagetemplates.main.html",
            data: {
                pageHeaderKey: 'Services.VSMS.Operations.MessageTemplates.Title',
                subPageHeaderKey: 'Services.VSMS.Operations.MessageTemplates.Prompts'
            },
            resolve: {
                languages: function (VSMSConfigurationService) {
                    return VSMSConfigurationService.getLanguages();
                },
                promptList: function ($stateParams, VSMSConfigurationService) {
                    return VSMSConfigurationService.getPromptList($stateParams.contentType);
                }
            }
        }).state('services.vsms.message-templates.messagetemplates.prompts.view', {
            url: "/:languageCode/:contentKey",
            views: {
                'languageForm': {
                    templateUrl: "services/vsms/message-templates/operations.messagetemplates.prompts.html",
                    controller: 'VSMSMessageTemplatesOperationsPromptsLanguagesCtrl'
                },
                'confForm': {
                    templateUrl: "services/vsms/message-templates/operations.messagetemplates.prompts.detail.html",
                    controller: 'VSMSMessageTemplatesOperationsPromptsConfCtrl'
                }
            }
        });

    });

    VSMSMessageTemplatesOperationsPromptsModule.controller('VSMSMessageTemplatesOperationsPromptsLanguagesCtrl', function ($scope, $log, $state, $stateParams, languages, promptList) {
        $log.debug("VSMSMessageTemplatesOperationsPromptsLanguagesCtrl");

        if ($stateParams.contentType) {
            $state.current.data.contentTypeHeaderKey = 'Services.VSMS.Operations.MessageTemplates.' + s.capitalize($stateParams.contentType);
        }

        if ($stateParams.languageCode) {
            $scope.languageCode = $stateParams.languageCode;
        }

        if ($stateParams.contentKey) {
            $scope.contentKey = $stateParams.contentKey;
        }

        // Language list
        $scope.languageList = [];
        _.each(languages.shortCodes, function (shortCode) {
            $scope.languageList.push({
                languageCode: shortCode
            });
        });

        $scope.changeLanguage = function (languageCode) {
            $log.debug("Selected language: ", languageCode);

            $scope.languageCode = languageCode;

            $state.transitionTo($state.$current,
                {
                    contentType: $stateParams.contentType,
                    languageCode: languageCode ? languageCode : undefined,
                    contentKey: $scope.contentKey
                }, {
                    reload: false,
                    inherit: false,
                    notify: true
                }
            );
        };

        // Prompt list
        $scope.promptList = promptList

        $scope.changeContentKey = function (contentKey) {
            $log.debug("Selected Prompt Content Key: ", contentKey);

            $scope.contentKey = contentKey;

            $state.transitionTo($state.$current,
                {
                    contentType: $stateParams.contentType,
                    languageCode: $scope.languageCode,
                    contentKey: !_.isUndefined(contentKey) ? contentKey : undefined
                }, {
                    reload: false,
                    inherit: false,
                    notify: true
                }
            );
        };
    });

    VSMSMessageTemplatesOperationsPromptsModule.controller('VSMSMessageTemplatesOperationsPromptsConfCtrl', function ($scope, $log, $q, $state, $stateParams, $timeout, $window, $translate, notification, Restangular,
                                                                                                                      ReportingExportService, Upload, VSMSConfigurationService, SERVICES_BASE) {
        $log.debug("VSMSMessageTemplatesOperationsPromptsConfCtrl");

        if ($stateParams.languageCode && $stateParams.contentKey) {
            $scope.languageCode = $stateParams.languageCode;
            $scope.contentKey = $stateParams.contentKey;

            $scope.showForm = true;
        }

        $scope.removeFile = function () {
            delete $scope.promptsFile;
        };

        $scope.uploadFile = function (file) {
            $log.debug('Uploading system prompt voice file: ', file);

            file.upload = Upload.http({
                method: 'PUT',
                url: SERVICES_BASE + '/voicesms-rest/cc/v4/contents/static/' + $scope.languageCode + '/' + $scope.contentKey,
                headers: {
                    'Content-Type': 'application/octet-stream'
                },
                data: file
            });

            file.upload.then(function (response) {
                $log.debug('Uploaded system prompt voice file. response: ', response);

                $timeout(function () {
                    file.result = response.data;

                    if (response.data && response.data.errorCode) {
                        notification({
                            type: 'warning',
                            text: response.data.errorCode + ' - ' + response.data.detail
                        });
                    } else {
                        notification({
                            type: 'success',
                            text: $translate.instant('CommonMessages.FileUploadSucceded')
                        });
                    }
                });
            }, function (response) {
                $log.debug('Upload error. response: ', response);

                if (response.status > 0) {
                    var message = '';
                    if (response.data && response.data.errorCode) {
                        message = response.data.errorCode + ' - ' + response.data.detail;
                    } else {
                        message = response.status + ' - ' + response.data;
                    }

                    notification({
                        type: 'warning',
                        text: message
                    });
                }
            }, function (evt) {
                // Math.min is to fix IE which reports 200% sometimes
                file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));

                $log.debug('Upload error. event: ', evt);
            });
        };

        $scope.downloadSoundFile = function (languageCode, contentKey) {
            var srcUrl = '/voicesms-rest/cc/v4/contents/static/' + languageCode + '/' + contentKey;

            ReportingExportService.showReport(srcUrl, 'WAV');
        };
    });

})();
