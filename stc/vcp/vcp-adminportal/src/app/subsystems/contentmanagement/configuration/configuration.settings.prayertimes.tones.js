(function () {

    'use strict';

    angular.module('adminportal.subsystems.contentmanagement.configuration.settings.prayertimestones', []);

    var ContentManagementConfigurationSettingsPrayerTonesModule = angular.module('adminportal.subsystems.contentmanagement.configuration.settings.prayertimestones');

    ContentManagementConfigurationSettingsPrayerTonesModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.contentmanagement.configuration.settings.prayertimestones', {
            abstract: true,
            url: "/prayer-times-tones",
            template: "<div ui-view></div>"
        }).state('subsystems.contentmanagement.configuration.settings.prayertimestones.list', {
            url: "/list",
            templateUrl: "subsystems/contentmanagement/configuration/configuration.settings.prayertimes.tones.html",
            controller: 'ContentManagementConfigurationSettingsPrayerTimesTonesCtrl',
            resolve: {
                prayerTimesTones: function (RBTContentManagementService) {
                    return RBTContentManagementService.getPrayerTimesTonesGrouped();
                }
            }
        }).state('subsystems.contentmanagement.configuration.settings.prayertimestones.new', {
            url: "/new",
            templateUrl: "subsystems/contentmanagement/configuration/configuration.settings.prayertimes.tones.details.html",
            controller: 'ContentManagementConfigurationSettingsPrayerTimesTonesNewCtrl'
        }).state('subsystems.contentmanagement.configuration.settings.prayertimestones.update', {
            url: "/update/:id",
            templateUrl: "subsystems/contentmanagement/configuration/configuration.settings.prayertimes.tones.details.html",
            controller: 'ContentManagementConfigurationSettingsPrayerTimesTonesUpdateCtrl',
            resolve: {
                prayerTimesTones: function ($stateParams, RBTContentManagementService) {
                    return RBTContentManagementService.getPrayerTimesTonesByPersonName($stateParams.id);
                }
            }
        });

    });

    ContentManagementConfigurationSettingsPrayerTonesModule.controller('ContentManagementConfigurationSettingsPrayerTimesTonesCommonCtrl', function ($scope, $log, $q, $state, $filter, $translate, $uibModal, notification, UtilService,
                                                                                                                                                     RBTContentManagementService, ContentManagementService, config) {
        $log.debug('ContentManagementConfigurationSettingsPrayerTimesTonesCommonCtrl');
        var config = config;

        // Check if at least one tone file is being uploaded by the user
        $scope.hasAtLeastOneToneFile = function () {

            var prayerTimesTones = $scope.prayerTimesTonesData.prayerTimesTones;
            return config.some(function (item) {
                var toneFile = prayerTimesTones[item.property];
                return toneFile && toneFile.name;
            });
        }

        $scope.toneFileChanged = function(toneFile, prayerTimeToneName) {
            $scope.validationInProgress = true;

            ContentManagementService.validateAudioFile(toneFile).then(
                function(response) {
                    $scope.validationInProgress = false;
                    var isValid = response && response.code === 2000;
                    UtilService.setError($scope.form, prayerTimeToneName, 'audioValiditiyCheck', isValid);
                },
                function(error) {
                    $scope.validationInProgress = false;
                    $log.error('Audio validation error:', error);
                    UtilService.setError($scope.form, prayerTimeToneName, 'audioValiditiyCheck', false);
                }
            );
        }

        $scope.isNotChanged = function() {
            return angular.equals($scope.prayerTimesTonesData, $scope.prayerTimesTonesDataOriginal);
        };

        $scope.handleSaveSuccess = function() {

            notification({
                type: 'success',
                text: $translate.instant('CommonLabels.OperationSuccessful')
            });

            $state.go('subsystems.contentmanagement.configuration.settings.prayertimestones.list');
        };

        $scope.handleSaveError = function(error, context) {
            $log.error('Error during ' + context + ':', error);
            var message = (error && error.description) ? error.description : $translate.instant('CommonMessages.GenericServerError');

            notification({
                type: 'warning',
                text: message
            });
        };

        $scope.cancel = function() {
            $state.go('subsystems.contentmanagement.configuration.settings.prayertimestones.list');
        };

        $scope.$on('$destroy', function() {
            // Revoke any blob URLs if they were created
            config.forEach(function(conf) {
                $log.debug('Revoke blob URL for:', conf.property);
                var file = $scope.prayerTimesTonesData.prayerTimesTones[conf.property];
                if (file && file instanceof Blob && file.url) {
                    URL.revokeObjectURL(file.url);
                }
            });
        });

    });

    ContentManagementConfigurationSettingsPrayerTonesModule.controller('ContentManagementConfigurationSettingsPrayerTimesTonesCtrl', function ($scope, $log, $q, $state, $filter, $translate, $uibModal, $controller, notification,
                                                                                                                                               NgTableParams, NgTableService, UtilService, RBTContentManagementService,
                                                                                                                                               ContentManagementService, FileDownloadService, prayerTimesTones) {

        $log.debug('ContentManagementConfigurationSettingsPrayerTimesTonesCtrl');
        $controller('ListViewsAudioController', {$scope: $scope});

        var ALL_PRAYER_TIMES = ['FAJR', 'ZUHR', 'ASR', 'MAGHRIB', 'ISHA'];

        var processPrayerTimesData = function(prayerTimesList) {
            var data = _.map(prayerTimesList, function(item) {
                var prayerTimesMap = _.indexBy(item.prayerTimes, 'prayerTime');
                var completePrayerTimes = _.map(ALL_PRAYER_TIMES, function(prayerTime) {
                    if (prayerTimesMap[prayerTime]) {
                        // if tone uploaded for this prayer time, mark it with hasFile flag
                        return _.extend({}, prayerTimesMap[prayerTime], {
                            hasFile: true
                        });
                    } else {
                        // no tone uploaded for this prayer time, create placeholder (hasFile: false)
                        return {
                            prayerTime: prayerTime,
                            personName: item.personName,
                            toneFileId: null,
                            toneFileUrl: null,
                            isDefault: false,
                            hasFile: false
                        };
                    }
                });

                var uploadedPrayerTimes = _.filter(completePrayerTimes, function(pt) { return pt.hasFile;});
                var prayerTimesText = _.pluck(uploadedPrayerTimes, 'prayerTime').join(', ');
                var isDefault = uploadedPrayerTimes.length > 0 && _.every(uploadedPrayerTimes, { isDefault: true });

                return {
                    personName: item.personName,
                    prayerTimes: completePrayerTimes, // full list (FAJR, ZUHR, ASR, MAGHRIB & ISHA) with hasFile flags, for the audio player buttons
                    prayerTimesText: prayerTimesText, // text summary of uploaded prayer times, used in ordering
                    isDefault: isDefault, // overall default flag, marks row
                    uploadedCount: uploadedPrayerTimes.length,
                    totalCount: ALL_PRAYER_TIMES.length
                };
            });

            return $filter('orderBy')(data, 'personName');
        };
        $scope.serviceDataObj = processPrayerTimesData(prayerTimesTones.prayerTimes);

        $log.debug('Table data:', $scope.serviceDataObj);

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'personName',
                    headerKey: 'Subsystems.ContentManagement.Configuration.PersonName'
                },
                {
                    fieldName: 'prayerTimesText',
                    headerKey: 'Subsystems.ContentManagement.Configuration.PrayerTimes.Tones'
                }
            ]
        };

        $scope.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "id": 'asc'
            }
        }, {
            total: 0,
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.serviceDataObj);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.serviceDataObj;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.tableParams.settings().$scope.filterText = filterText;
            $scope.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.tableParams.page(1);
            $scope.tableParams.reload();
        }, 500);

        $scope.getPrayerTimeLabel = function(prayerTime) {
            var labelKey = 'Subsystems.ContentManagement.Configuration.PrayerTimes.' + prayerTime;
            return $translate.instant(labelKey);
        };

        $scope.remove = function (prayer) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing prayer times tone:', prayer.personName);

                RBTContentManagementService.deletePrayerTimesTonesByPersonName(prayer.personName).then(function (response) {
                    $log.debug('Removed successfully. Response:', response);
                    var deletedListItem = _.findWhere($scope.serviceDataObj, {personName: prayer.personName});
                    $scope.serviceDataObj = _.without($scope.serviceDataObj, deletedListItem);

                    $scope.tableParams.reload();
                }, function (error) {
                    $log.error('Cannot remove prayer list. Error:', error);

                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.GenericServerError')
                    });
                });
            });
        };

    });

    ContentManagementConfigurationSettingsPrayerTonesModule.controller('ContentManagementConfigurationSettingsPrayerTimesTonesNewCtrl', function ($scope, $log, $q, $state, $translate, $controller, notification, UtilService,
                                                                                                                                                  RBTContentManagementService, ContentManagementService) {
            $log.debug('ContentManagementConfigurationSettingsPrayerTimesTonesNewCtrl');
            // Configuration object
            var PRAYER_TIMES_CONFIG = [
                { key: 'fajr', property: 'morningFajrToneFile' },
                { key: 'zuhr', property: 'noonZuhrToneFile' },
                { key: 'asr', property: 'afternoonAsrToneFile' },
                { key: 'maghrib', property: 'eveningMaghribToneFile' },
                { key: 'isha', property: 'nightIshaToneFile' }
            ];
            $controller('ContentManagementConfigurationSettingsPrayerTimesTonesCommonCtrl', {$scope: $scope, config: PRAYER_TIMES_CONFIG});

            // Initialize data structure
            $scope.prayerTimesTonesData = {
                personName: '',
                isDefault: false,
                fajr: {},
                zuhr: {},
                asr: {},
                maghrib: {},
                isha: {},
                prayerTimesTones: {
                    morningFajrToneFile: undefined,
                    noonZuhrToneFile: undefined,
                    afternoonAsrToneFile: undefined,
                    eveningMaghribToneFile: undefined,
                    nightIshaToneFile: undefined
                }
            };

            $scope.prayerTimesTonesDataOriginal = angular.copy($scope.prayerTimesTonesData);

            var setToneId = function(toneFile) {
                var id;

                if (!toneFile || !toneFile.name) {
                    id = null;
                } else if (toneFile instanceof File && !toneFile.toneFileId) {
                    id = UtilService.generateObjectId();
                } else {
                    id = toneFile.toneFileId;
                }

                toneFile.toneFileId = id;
                return toneFile;
            };

            var buildCreatePayload = function(dataObj) {
                var payload = {
                    personName: dataObj.personName,
                    isDefault: dataObj.isDefault,
                    toneIds: {
                        fajr: null,
                        zuhr: null,
                        asr: null,
                        maghrib: null,
                        isha: null
                    }
                };

                var filesToUpload = {};
                var prayerTimesTones = dataObj.prayerTimesTones;

                PRAYER_TIMES_CONFIG.forEach(function(config) {
                    var toneFile = prayerTimesTones[config.property];

                    if (toneFile && toneFile.name) {
                        var fileWithId = setToneId(toneFile);
                        payload.toneIds[config.key] = fileWithId.toneFileId;
                        filesToUpload[config.key] = fileWithId;
                    }
                });

                return {
                    payload: payload,
                    filesToUpload: filesToUpload
                };
            };

            var uploadFiles = function(filesToUpload) {
                var uploadPromises = [];

                PRAYER_TIMES_CONFIG.forEach(function(config) {
                    var file = filesToUpload[config.key];
                    if (file && file.name) {
                        uploadPromises.push(
                            ContentManagementService.uploadFile(file, file.name, file.toneFileId)
                        );
                    }
                });

                return uploadPromises;
            };

            $scope.save = function(dataObj) {
                $log.debug('PrayerTimesTones: save', dataObj);

                var createData = buildCreatePayload(dataObj);

                RBTContentManagementService.createPrayerTimeTonesByPersonName(createData.payload).then(
                    function(response) {
                        $log.debug('Response for create prayer time tones:', response);

                        if (response && !response.code) {
                            // Create successful, now upload files
                            var fileUploadPromises = uploadFiles(createData.filesToUpload);

                            if (fileUploadPromises.length === 0) {
                                // No files to upload, just show success
                                $scope.handleSaveSuccess();
                                return;
                            }

                            $q.all(fileUploadPromises).then(
                                function(results) {
                                    $log.debug('Uploaded files with results:', results);
                                    $scope.handleSaveSuccess();
                                },
                                function(errorFileUpload) {
                                    $scope.handleSaveError(errorFileUpload, 'file upload');
                                }
                            );
                        } else {
                            // Create failed
                            $scope.handleSaveError(response, 'create');
                        }
                    },
                    function(errorCreate) {
                        $scope.handleSaveError(errorCreate, 'create');
                    }
                );
            };
    });

    ContentManagementConfigurationSettingsPrayerTonesModule.controller('ContentManagementConfigurationSettingsPrayerTimesTonesUpdateCtrl', function ($scope, $log, $q, $state, $timeout, $translate, $controller, notification, UtilService,
                                                                                                                                                     RBTContentManagementService, ContentManagementService, FileDownloadService, prayerTimesTones) {

            $log.debug('ContentManagementConfigurationSettingsPrayerTimesTonesUpdateCtrl');

            var PRAYER_TIMES_CONFIG = [
                { key: 'fajr', property: 'morningFajrToneFile', downloadingFlag: 'morningFajrDownloading' },
                { key: 'zuhr', property: 'noonZuhrToneFile', downloadingFlag: 'noonZuhrDownloading' },
                { key: 'asr', property: 'afternoonAsrToneFile', downloadingFlag: 'afternoonAsrDownloading' },
                { key: 'maghrib', property: 'eveningMaghribToneFile', downloadingFlag: 'eveningMaghribDownloading' },
                { key: 'isha', property: 'nightIshaToneFile', downloadingFlag: 'nightIshaDownloading' }
            ];
            $controller('ContentManagementConfigurationSettingsPrayerTimesTonesCommonCtrl', {$scope: $scope, config: PRAYER_TIMES_CONFIG});

            // Initialize data structure
            $scope.prayerTimesTonesData = _.indexBy(
                prayerTimesTones.prayerTimeToneDTOs,
                function(item) {
                    return item.prayerTime.toLowerCase();
                }
            );
            $scope.prayerTimesTonesData.isDefault = _.every(prayerTimesTones.prayerTimeToneDTOs, 'isDefault');
            $scope.prayerTimesTonesData.id = $state.params.id;
            $scope.prayerTimesTonesData.personName = $state.params.id;
            $scope.prayerTimesTonesData.prayerTimesTones = {
                morningFajrToneFile: undefined,
                noonZuhrToneFile: undefined,
                afternoonAsrToneFile: undefined,
                eveningMaghribToneFile: undefined,
                nightIshaToneFile: undefined
            };
            $scope.prayerTimesTonesDataOriginal = angular.copy($scope.prayerTimesTonesData);

            // Load prayer tone file (download it and store in scope)
            var loadPrayerToneFile = function(config, toneFileId) {
                if (!toneFileId) {
                    return;
                }

                $scope[config.downloadingFlag] = true;
                $scope.prayerTimesTonesData.prayerTimesTones[config.property] = { name: undefined };

                var srcUrl = ContentManagementService.generateFilePath(toneFileId);

                FileDownloadService.downloadFileAndGetBlob(srcUrl, function(blob, fileName) {
                    // Use $timeout to safely update scope
                    $timeout(function() {
                        if (blob) {
                            blob.name = fileName;
                            blob.toneFileId = toneFileId;
                            $scope.prayerTimesTonesData.prayerTimesTones[config.property] = blob;
                            $scope.prayerTimesTonesDataOriginal.prayerTimesTones[config.property] = blob;
                        } else {
                            $scope.prayerTimesTonesData.prayerTimesTones[config.property] = {
                                name: undefined,
                                toneFileId: toneFileId
                            };
                            $scope.prayerTimesTonesDataOriginal.prayerTimesTones[config.property] = {
                                name: undefined,
                                toneFileId: toneFileId
                            };
                        }
                        $scope[config.downloadingFlag] = false;
                    });
                }, function(error) {
                    // Error handler
                    $timeout(function() {
                        $log.error('Failed to download tone file:', config.key, error);
                        $scope[config.downloadingFlag] = false;
                    });
                });
            };

            var initializePrayerToneFiles = function() {
                if (!$scope.prayerTimesTonesData) {
                    return;
                }

                PRAYER_TIMES_CONFIG.forEach(function(config) {
                    var prayerData = $scope.prayerTimesTonesData[config.key];
                    if (prayerData && prayerData.toneFileId) {
                        loadPrayerToneFile(config, prayerData.toneFileId);
                    }
                });
            };

            initializePrayerToneFiles();

            var setToneId = function(toneFile) {
                var id;

                if (!toneFile || !toneFile.name) {
                    id = null;
                } else if (toneFile instanceof File && !toneFile.toneFileId) {
                    id = UtilService.generateObjectId();
                } else {
                    id = toneFile.toneFileId;
                }

                // If deleted, return empty object with no id
                if (!toneFile) {
                    toneFile = {};
                }

                toneFile.toneFileId = id;
                return toneFile;
            };

            var buildUpdatePayload = function(currentData, originalData) {
                var prayerTimesTones = currentData.prayerTimesTones;
                var prayerTimesTonesOriginal = originalData.prayerTimesTones;

                var payload = {
                    personName: originalData.personName, // cannot be changed
                    isDefault: currentData.isDefault,
                    toneIds: {}
                };

                var changedFiles = {};

                PRAYER_TIMES_CONFIG.forEach(function(config) {
                    var currentFile = prayerTimesTones[config.property];
                    var originalFile = prayerTimesTonesOriginal[config.property];

                    // Set original tone ID as default
                    payload.toneIds[config.key] = originalFile ? originalFile.toneFileId : null;

                    // Check if file has changed
                    if (!angular.equals(currentFile, originalFile)) {
                        var updatedFile = setToneId(currentFile);
                        payload.toneIds[config.key] = updatedFile.toneFileId;
                        changedFiles[config.key] = updatedFile;
                    }
                });

                return {
                    payload: payload,
                    changedFiles: changedFiles
                };
            };

            var uploadChangedFiles = function(changedFiles) {
                var uploadPromises = [];

                PRAYER_TIMES_CONFIG.forEach(function(config) {
                    var file = changedFiles[config.key];
                    if (file && file.name) {
                        uploadPromises.push(
                            ContentManagementService.uploadFile(file, file.name, file.toneFileId)
                        );
                    }
                });

                return uploadPromises;
            };

            $scope.save = function(dataObj) {
                var updateData = buildUpdatePayload(dataObj, $scope.prayerTimesTonesDataOriginal);

                RBTContentManagementService.updatePrayerTimeTonesByPersonName(updateData.payload).then(
                    function(response) {
                        $log.debug('Response for update prayer time tones:', response);

                        if (response && !response.code) {
                            // Update successful, now upload changed files
                            var fileUploadPromises = uploadChangedFiles(updateData.changedFiles);

                            if (fileUploadPromises.length === 0) {
                                // No files to upload, just show success
                                $scope.handleSaveSuccess();
                                return;
                            }

                            $q.all(fileUploadPromises).then(
                                function(results) {
                                    $log.debug('Uploaded files with results:', results);
                                    $scope.handleSaveSuccess();
                                },
                                function(errorFileUpload) {
                                    $scope.handleSaveError(errorFileUpload, 'file upload');
                                }
                            );
                        } else {
                            // Update failed
                            $scope.handleSaveError(response, 'update');
                        }
                    },
                    function(errorUpdate) {
                        $scope.handleSaveError(errorUpdate, 'update');
                    }
                );
            };

    });

})();
