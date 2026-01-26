(function () {

    'use strict';

    angular.module('adminportal.services.vm.message-templates.messagetemplates.greetings', []);

    var VMMessageTemplatesOperationsGreetingsModule = angular.module('adminportal.services.vm.message-templates.messagetemplates.greetings');

    VMMessageTemplatesOperationsGreetingsModule.config(function ($stateProvider) {

        $stateProvider.state('services.vm.message-templates.messagetemplates.greetings', {
            url: "/greetings",
            templateUrl: "services/vm/message-templates/operations.messagetemplates.main.html",
            data: {
                pageHeaderKey: 'Services.VM.Operations.MessageTemplates.Title',
                subPageHeaderKey: 'Services.VM.Operations.MessageTemplates.Greetings'
            },
            resolve: {
                languages: function (VMConfigurationService) {
                    return VMConfigurationService.getLanguages();
                },
                classOfServiceProfiles: function (VMConfigurationService) {
                    return VMConfigurationService.getCoSProfiles();
                }
            }
        }).state('services.vm.message-templates.messagetemplates.greetings.view', {
            url: "/:languageCode/:cosId",
            views: {
                'languageForm': {
                    templateUrl: "services/vm/message-templates/operations.messagetemplates.greetings.html",
                    controller: 'VMMessageTemplatesOperationsGreetingsLanguagesCtrl'
                },
                'confForm': {
                    templateUrl: "services/vm/message-templates/operations.messagetemplates.greetings.detail.html",
                    controller: 'VMMessageTemplatesOperationsGreetingsConfCtrl'
                }
            }
        });

    });

    VMMessageTemplatesOperationsGreetingsModule.controller('VMMessageTemplatesOperationsGreetingsLanguagesCtrl', function ($scope, $log, $state, $stateParams, languages, classOfServiceProfiles) {
        $log.debug("VMMessageTemplatesOperationsGreetingsLanguagesCtrl");

        if ($stateParams.languageCode) {
            $scope.languageCode = $stateParams.languageCode;
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

            $state.transitionTo($state.$current,
                {
                    languageCode: languageCode ? languageCode : undefined,
                    cosId: $scope.cosId
                }, {
                    reload: false,
                    inherit: false,
                    notify: true
                }
            );
        };

        // Class of Service Profile list
        $scope.classOfServiceProfiles = classOfServiceProfiles;

        $scope.changeCosId = function (cosId) {
            $log.debug("Selected Class of Service Profile Id: ", cosId);

            $state.transitionTo($state.$current,
                {
                    languageCode: $scope.languageCode,
                    cosId: !_.isUndefined(cosId) ? cosId : undefined
                }, {
                    reload: false,
                    inherit: false,
                    notify: true
                }
            );
        };

        // Set the first CoS item selected as default since there is only one CoS for Vodafone for now.
        if ($scope.classOfServiceProfiles && $scope.classOfServiceProfiles.length === 1) {
            $scope.cosId = $scope.classOfServiceProfiles[0].cosId;
            $scope.changeCosId($scope.cosId);
        }
    });

    VMMessageTemplatesOperationsGreetingsModule.controller('VMMessageTemplatesOperationsGreetingsConfCtrl', function ($scope, $log, $q, $state, $stateParams, $timeout, $window, $translate, notification, Restangular,
                                                                                                                      ReportingExportService, Upload, VMConfigurationService, SERVICES_BASE) {
        $log.debug("VMMessageTemplatesOperationsGreetingsConfCtrl");

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
                url: SERVICES_BASE + '/voicemail-rest/cc/v4/greetings/system/' + $scope.languageCode + '/' + $scope.cosId,
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
            var srcUrl = '/voicemail-rest/cc/v4/greetings/system/' + languageCode + '/' + cosId;

            ReportingExportService.showReport(srcUrl, 'WAV');
        };
    });

})();
