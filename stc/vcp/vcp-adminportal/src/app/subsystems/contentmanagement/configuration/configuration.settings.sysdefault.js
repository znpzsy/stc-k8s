(function () {

    'use strict';

    angular.module('adminportal.subsystems.contentmanagement.configuration.settings.sysdefault', []);

    var ContentManagementConfigurationSettingsSysDefaultModule = angular.module('adminportal.subsystems.contentmanagement.configuration.settings.sysdefault');

    ContentManagementConfigurationSettingsSysDefaultModule.config(function ($stateProvider) {
        $stateProvider.state('subsystems.contentmanagement.configuration.settings.sysdefault', {
            url: "/sysdefault",
            templateUrl: "subsystems/contentmanagement/configuration/configuration.settings.sysdefault.html",
            controller: "ContentManagementConfigurationSettingsSysDefaultController",
            resolve: {
                cmsSysDefault: function (RBTContentManagementService) {
                    return RBTContentManagementService.getSystemDefaultTone();
                },
                cmsGracePeriod: function (RBTContentManagementService) {
                    return RBTContentManagementService.getGracePeriodTone();
                }
            }
        });
    });

    ContentManagementConfigurationSettingsSysDefaultModule.controller('ContentManagementConfigurationSettingsSysDefaultCommonController', function ($scope, $log, $state, $translate, $uibModal, notification, Restangular,
                                                                                                                                            UtilService, ContentManagementService, RBTContentManagementService, FileDownloadService) {
        $log.debug('ContentManagementConfigurationSettingsSysDefaultCommonController');

        $scope.toneFileChanged = function (toneFile, inputName) {

            $scope.validationInProgress = true;

            ContentManagementService.validateAudioFile(toneFile).then(function (response) {
                $scope.validationInProgress = false;

                UtilService.setError($scope.form, inputName, 'audioValiditiyCheck', (response && response.code === 2000));
            }, function (response) {
                $scope.validationInProgress = false;

                $log.debug('ERROR: ', response);

                UtilService.setError($scope.form, inputName, 'audioValiditiyCheck', false);
            });
        };

        $scope.sysDefaultToneUnchanged = function () {
            return angular.equals($scope.originalSystemDefaultTone, $scope.systemDefaultTone);
        }

        $scope.gracePeriodToneUnchanged = function () {
            return angular.equals($scope.originalGracePeriodTone, $scope.gracePeriodTone);
        }

        $scope.isNotChanged = function () {
            return $scope.sysDefaultToneUnchanged() && $scope.gracePeriodToneUnchanged();
        };

        $scope.downloadFile = function (fileId, fileName) {
            if (fileId) {
                FileDownloadService.downloadFile(fileId, fileName);
            } else {
                notification({
                    type: 'warning',
                    text: $translate.instant('CommonMessages.FileNotFound')
                });
            }
        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };

        $scope.$on('$destroy', function() {
            // Revoke any blob URLs if they were created
            $log.debug('Revoke blob URL for systemDefaultTone.toneFile:')
            var file = $scope.systemDefaultTone.toneFile;
            if (file && file instanceof Blob && file.url) {
                URL.revokeObjectURL(file.url);
            }
            $log.debug('Revoke blob URL for systemDefaultTone.toneFile:')
            var file = $scope.gracePeriodTone.toneFile;
            if (file && file instanceof Blob && file.url) {
                URL.revokeObjectURL(file.url);
            }
        });
    });



    ContentManagementConfigurationSettingsSysDefaultModule.controller('ContentManagementConfigurationSettingsSysDefaultController', function ($scope, $log, $state, $controller, $translate, $uibModal, notification, Restangular,
                                                                                                                                              UtilService, ContentManagementService, RBTContentManagementService, FileDownloadService,
                                                                                                                                              cmsSysDefault, cmsGracePeriod) {
        $log.debug('ContentManagementConfigurationSettingsSysDefaultController');
        $controller('ContentManagementConfigurationSettingsSysDefaultCommonController', {$scope: $scope});

        $scope.systemDefaultTone = cmsSysDefault.systemWideDefaultToneDTO;
        $scope.gracePeriodTone = cmsGracePeriod.rbtGracePeriodToneDTO;

        // Get the sys default tone by id value.
        $scope.sysDefaultDownloading = true;
        if ($scope.systemDefaultTone.id) {
            $scope.systemDefaultTone.toneFile = {name: undefined};
            var srcUrl = ContentManagementService.generateFilePath($scope.systemDefaultTone.id);
            FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                $scope.systemDefaultTone.toneFile = blob;
                if (blob) {
                    $scope.systemDefaultTone.toneFile.name = fileName;
                }
                $scope.originalSystemDefaultTone = angular.copy($scope.systemDefaultTone);
                $scope.sysDefaultDownloading = false;
            });
        }

        // Get the grace period tone by id value.
        $scope.gracePeriodDownloading = true;
        if ($scope.gracePeriodTone.id) {
            $scope.gracePeriodTone.toneFile = {name: undefined};
            var srcUrl = ContentManagementService.generateFilePath($scope.gracePeriodTone.id);
            FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                $scope.gracePeriodTone.toneFile = blob;
                if (blob) {
                    $scope.gracePeriodTone.toneFile.name = fileName;
                }
                $scope.originalGracePeriodTone = angular.copy($scope.gracePeriodTone);
                $scope.gracePeriodDownloading = false;
            });
        }

        $scope.save = function () {
            $log.debug('Saving System Default Tone & Grace Period Tone Configuration:');

            // System Default Tone has updates
            if(!$scope.sysDefaultToneUnchanged()){
                var sysDefaultToneItem = $scope.systemDefaultTone.toneFile;

                RBTContentManagementService.updateSystemDefaultTone(sysDefaultToneItem).then(function (response) {
                    $log.debug('System Default Tone Update response: ', response);
                    if (response && response.systemWideDefaultToneDTO && response.systemWideDefaultToneDTO.id) {
                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });

                    } else {
                        if (response && response.data && response.data.message) {
                            ContentManagementService.showApiError(response);
                        } else {
                            notification({
                                type: 'warning',
                                text: $translate.instant('CommonMessages.GenericServerError')
                            });
                        }
                    }
                    $state.go($state.$current, null, {reload: true});

                }, function (error) {
                    $log.debug('System Default Tone Update Error response: ', error);
                    if (error && error.data && error.data.message) {
                        ContentManagementService.showApiError(error);
                    } else {
                        notification({
                            type: 'warning',
                            text: $translate.instant('CommonMessages.GenericServerError')
                        });
                    }

                })

            }


            // Grace Period Tone has updatess
            if(!$scope.gracePeriodToneUnchanged()){
                var gracePeriodToneItem = $scope.gracePeriodTone.toneFile;

                RBTContentManagementService.updateGracePeriodTone(gracePeriodToneItem).then(function (response) {
                    $log.debug('Grace Period Tone Update response: ', response);

                    if (response && response.rbtGracePeriodToneDTO && response.rbtGracePeriodToneDTO.id) {
                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });

                    } else {
                        if (response && response.data && response.data.message) {
                            ContentManagementService.showApiError(response);
                        } else {
                            notification({
                                type: 'warning',
                                text: $translate.instant('CommonMessages.GenericServerError')
                            });
                        }
                    }
                    $state.go($state.$current, null, {reload: true});

                }, function (error) {
                    $log.debug('Grace Period Tone Update Error response: ', error);
                    if (error && error.data && error.data.message) {
                        ContentManagementService.showApiError(error);
                    } else {
                        notification({
                            type: 'warning',
                            text: $translate.instant('Subsystems.ContentManagement.Operations.RBT.ContentMetadatas.Tones.Messages.UpdateFlowError')
                        });
                    }
                })

            }

        }


    });


})();
