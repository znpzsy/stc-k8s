(function () {

    'use strict';

    angular.module('adminportal.services.vsms.message-templates.messagetemplates.greetings', []);

    var VSMSMessageTemplatesOperationsGreetingsModule = angular.module('adminportal.services.vsms.message-templates.messagetemplates.greetings');

    VSMSMessageTemplatesOperationsGreetingsModule.config(function ($stateProvider) {

        $stateProvider.state('services.vsms.message-templates.messagetemplates.greetings', {
            url: "/greetings",
            templateUrl: "services/vsms/message-templates/operations.messagetemplates.main.html",
            data: {
                pageHeaderKey: 'Services.VSMS.Operations.MessageTemplates.Title',
                subPageHeaderKey: 'Services.VSMS.Operations.MessageTemplates.Greetings'
            },
            resolve: {
                languages: function (VSMSConfigurationService) {
                    return VSMSConfigurationService.getLanguages();
                },
                subscriberProfiles: function (VSMSConfigurationService) {
                    return VSMSConfigurationService.getSubscriberProfiles();
                }
            }
        }).state('services.vsms.message-templates.messagetemplates.greetings.view', {
            url: "/:languageCode/:cosId",
            views: {
                'languageForm': {
                    templateUrl: "services/vsms/message-templates/operations.messagetemplates.greetings.html",
                    controller: 'VSMSMessageTemplatesOperationsGreetingsLanguagesCtrl'
                },
                'confForm': {
                    templateUrl: "services/vsms/message-templates/operations.messagetemplates.greetings.detail.html",
                    controller: 'VSMSMessageTemplatesOperationsGreetingsConfCtrl'
                }
            }
        });

    });

    VSMSMessageTemplatesOperationsGreetingsModule.controller('VSMSMessageTemplatesOperationsGreetingsLanguagesCtrl', function ($scope, $log, $state, $stateParams, languages, subscriberProfiles) {
        $log.debug("VSMSMessageTemplatesOperationsGreetingsLanguagesCtrl");

        if ($stateParams.languageCode) {
            $scope.languageCode = $stateParams.languageCode;
        }

        if ($stateParams.cosId) {
            $scope.cosId = s.toNumber($stateParams.cosId);
        }

        // Language list
        $scope.languageList = [];
        _.each(languages.shortCodes, function (shortCode) {
            $scope.languageList.push({
                languageCode: shortCode
            });
        });

        // Subscriber Profile list
        $scope.subscriberProfiles = subscriberProfiles;

        $scope.changeLanguage = function (languageCode) {
            $log.debug("Selected language: ", languageCode);

            $state.transitionTo($state.$current,
                {
                    languageCode: languageCode ? languageCode : undefined,
                    cosId: $scope.subscriberProfiles[0].cosId
                }, {
                    reload: false,
                    inherit: false,
                    notify: true
                }
            );
        };
    });

    VSMSMessageTemplatesOperationsGreetingsModule.controller('VSMSMessageTemplatesOperationsGreetingsConfCtrl', function ($scope, $log, $q, $state, $stateParams, $timeout, $window, $translate, notification, Restangular,
                                                                                                                          ReportingExportService, Upload, VSMSConfigurationService, SERVICES_BASE) {
        $log.debug("VSMSMessageTemplatesOperationsGreetingsConfCtrl");

        if ($stateParams.languageCode && $stateParams.cosId) {
            $scope.languageCode = $stateParams.languageCode;
            $scope.cosId = $stateParams.cosId;

            $scope.showForm = true;
        }

        $scope.removeFile = function () {
            delete $scope.greetingsFile;
        };

        $scope.uploadFile = function (file) {
            $log.debug('Uploading system greeting voice file: ', file);

            file.upload = Upload.http({
                method: 'PUT',
                url: SERVICES_BASE + '/voicesms-rest/cc/v4/greetings/system/' + $scope.languageCode + '/' + $scope.cosId,
                headers: {
                    'Content-Type': 'application/octet-stream'
                },
                data: file
            });

            file.upload.then(function (response) {
                $log.debug('Uploaded system greeting voice file. response: ', response);

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

        $scope.downloadSoundFile = function (languageCode, cosId) {
            var srcUrl = '/voicesms-rest/cc/v4/greetings/system/' + languageCode + '/' + cosId;

            ReportingExportService.showReport(srcUrl, 'WAV');
        };
    });

})();
