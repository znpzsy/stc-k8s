(function () {

    'use strict';

    angular.module('adminportal.services.rbt.operations.presskey.management.update', []);

    var RBTOperationsPressKeyUpdateManagementModule = angular.module('adminportal.services.rbt.operations.presskey.management.update');

    RBTOperationsPressKeyUpdateManagementModule.config(function ($stateProvider) {

        $stateProvider.state('services.rbt.operations.presskey.management.update', {
            url: "/update/:dtmfKey",
            templateUrl: "services/rbt/operations/operations.presskey.management.detail.html",
            controller: 'RBTOperationsPressKeyManagementUpdateCtrl',
            data: {
                // View Header Keys
                pageHeaderKey: 'Services.RBT.Operations.PressKey.Title',
                subPageHeaderKey: 'Services.RBT.Operations.PressKey.Management.Title',
                contentTypeHeaderKey: 'Services.RBT.Operations.PressKey.Management.Update',
            },
            params: {
                promotionType: null  // copy, service, tone
            },
            resolve: {
                dtmfKey: function ($stateParams, $log) {
                    $log.debug('dtmfKey: ', $stateParams.dtmfKey);
                    return decodeURIComponent($stateParams.dtmfKey);
                }
            }
        })
            .state('services.rbt.operations.presskey.management.update.copy', {
                url: "/copy",
                templateUrl: "services/rbt/operations/operations.presskey.management.detail.copy.html",
                controller: 'RBTOperationsPressKeyManagementUpdateCopyCtrl',
            })
            .state('services.rbt.operations.presskey.management.update.service', {
                url: "/service/:serviceOfferName",
                templateUrl: "services/rbt/operations/operations.presskey.management.detail.service.html",
                controller: 'RBTOperationsPressKeyManagementUpdateServiceCtrl',
                resolve: {
                    serviceOfferName: function ($stateParams, $log) {
                        $log.debug('serviceOfferName: ' + $stateParams.serviceOfferName);
                        return $stateParams.serviceOfferName;
                    },
                    offers: function ($stateParams, CMPFService) {
                        return CMPFService.findOfferByName($stateParams.serviceOfferName);
                    }
                }
            })
            .state('services.rbt.operations.presskey.management.update.tone', {
                url: "/tone",
                templateUrl: "services/rbt/operations/operations.presskey.management.detail.tone.html",
                controller: 'RBTOperationsPressKeyManagementUpdateToneCtrl',
                resolve: {
                    tonePromotions: function ($stateParams, $log, $q, RBTConfService, ContentManagementService, dtmfKey) {
                        var deferred = $q.defer();
                        RBTConfService.getTonePromotions(encodeURIComponent(dtmfKey)).then(function (response) {
                            $log.debug('tonePromotions: ', response);
                            var tonePromotions = response ? response : [];

                            // In case rbt server content storage errors out
                            if(tonePromotions.length > 0) {
                                var subscriptionCodes = response.map(function(item) {
                                    return item.subscriptionCode;
                                });

                                var contentOfferRequests = subscriptionCodes.map(function(subscriptionCode) {
                                    return ContentManagementService.getContentOffers(0, 1, false, 'subscriptionCode', subscriptionCode);
                                });

                                $q.all(contentOfferRequests).then(function(responses) {
                                    // All requests succeeded, responses will be an array of response data
                                    $log.debug('All requests succeeded:', responses);
                                    _.each(responses, function (response) {
                                        if(response && response.items && response.items.length > 0) {
                                            var tonePromotion = _.find(tonePromotions, function(tonePromotion) {
                                                return tonePromotion.subscriptionCode === response.items[0].subscriptionCode;
                                            });
                                            if(tonePromotion) {
                                                tonePromotion.contentId = response.items[0].contentId;
                                                tonePromotion.toneFileId = response.items[0].content.toneFileId;
                                                tonePromotion.contentOfferTone = response.items[0].content;
                                            }
                                        }
                                    });
                                    $log.debug('tonePromotions: ', tonePromotions);
                                    deferred.resolve(tonePromotions);
                                }, function(error) {
                                    // Handle any error from any of the requests
                                    $log.debug('One or more requests failed:', error);
                                    deferred.resolve([]);
                                });
                            }
                            deferred.resolve(tonePromotions);

                        }, function (response) {
                            deferred.resolve([]);
                        });
                        return deferred.promise;
                    }
                }
            });
    });


    RBTOperationsPressKeyUpdateManagementModule.controller('RBTOperationsPressKeyManagementUpdateCommonCtrl', function ($scope, $state, $log, $translate, $timeout, notification, Upload, SERVICES_BASE, RBT_DTMF_KEYS, RBT_DTMF_PROMOTION_TYPES, UtilService) {
        $log.debug('RBTOperationsPressKeyManagementUpdateCommonCtrl');
        $scope.RBT_DTMF_KEYS = RBT_DTMF_KEYS;
        $scope.RBT_DTMF_PROMOTION_TYPES = RBT_DTMF_PROMOTION_TYPES;
        $scope.newRecord = false;

        $scope.cancel = function() {
            $state.go('services.rbt.operations.presskey.management.list');
        };

        $scope.toneFileChanged = function (file, formCtrlId, form) {

            // TODO: Implement audio file validation when the RBT Service Validation endpoint is ready
            $log.debug('Validation in progress, toneFileChanged: ', file);

            $scope.validationInProgress = true;

            file.upload = Upload.http({
                method: 'PUT',
                url: SERVICES_BASE + '/rbt-audio-rest/v1/audiofiles/validation',
                headers: {
                    'Content-Type': 'application/octet-stream'
                },
                data: file
            });

            file.upload.then(function (response) {
                $log.debug('Validated file. response: ', response);

                $timeout(function () {
                    $scope.validationInProgress = false;
                    file.result = response.data;

                    UtilService.setError(form, formCtrlId, 'audioValiditiyCheck', (response && response.data && response.data.allowed));

                });
            }, function (response) {

                $log.debug('Validation upload error. response: ', response);
                $scope.validationInProgress = false;
                UtilService.setError(form, formCtrlId, 'audioValiditiyCheck', (response && response.data && response.data.allowed));

            }, function (evt) {
                // Math.min is to fix IE which reports 200% sometimes
                file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                $scope.validationInProgress = true;
                $log.debug('Upload event: ', evt);
            });
        };

    });

    RBTOperationsPressKeyUpdateManagementModule.controller('RBTOperationsPressKeyManagementUpdateCtrl', function ($scope, $controller, $state, $stateParams, $log, dtmfKey) {
        $log.debug('RBTOperationsPressKeyManagementUpdateCtrl');
        $controller('RBTOperationsPressKeyManagementUpdateCommonCtrl', {$scope: $scope});
        $scope.promotionType = s.contains($state.current.url, 'service') ? 'SERVICE' : $state.current.url.replace('/','').toUpperCase();
        $scope.dtmfKey = dtmfKey;
    });

    RBTOperationsPressKeyUpdateManagementModule.controller('RBTOperationsPressKeyManagementUpdateCopyCtrl', function ($scope, $q, $state, $controller, $log, $filter, $timeout, $translate, Upload, notification, Restangular, RBTPressKeyManagementService) {
        $log.debug('RBTOperationsPressKeyManagementUpdateCopyCtrl');

        $scope.key = encodeURIComponent($scope.$parent.dtmfKey);
        $scope.contentMetadata = { freePrompt: {name: undefined}, paidPrompt: {name: undefined} };

        if ($scope.key) {
            // Get the paidPrompt
            var srcUrl = RBTPressKeyManagementService.generatePath(false, 'copy', $scope.key, ['paid']);
            $scope.contentMetadata.paidPrompt = {name: undefined};
            $scope.paidPromptLoading = true;
            RBTPressKeyManagementService.downloadFile(srcUrl, function(blob, filename) {
                $scope.contentMetadata.paidPrompt = blob;
                if (blob) {
                    $scope.contentMetadata.paidPrompt.name = filename;
                }
                $scope.originalContentMetadata = angular.copy($scope.contentMetadata);
                $scope.paidPromptLoading = false;
            });

            // Get the freePrompt
            var srcUrl = RBTPressKeyManagementService.generatePath(false, 'copy', $scope.key, ['free']);
            $scope.contentMetadata.freePrompt = {name: undefined};
            $scope.freePromptLoading = true;
            RBTPressKeyManagementService.downloadFile(srcUrl, function(blob, filename) {
                $scope.contentMetadata.freePrompt = blob;
                if (blob) {
                    $scope.contentMetadata.freePrompt.name = filename;
                }
                $scope.originalContentMetadata = angular.copy($scope.contentMetadata);
                $scope.freePromptLoading = false;
            });
        }

        $scope.isNotChanged = function () {
            return angular.equals($scope.originalContentMetadata, $scope.contentMetadata)
        };

        $scope.uploadPromptFile = function (file, promptType) {
            var src = RBTPressKeyManagementService.generatePath(true, 'copy', $scope.key, [promptType]);
            RBTPressKeyManagementService.uploadFile(file, 'PUT', src, function(response) {
                $log.debug('RbtPromotionFilesService uploaded the file with success:', response);
                $scope.cancel();
            }, function(error) {
                $log.debug('Failed to upload the file:', error);
            });
        };

        $scope.save = function() {
            if($scope.isNotChanged()) {
                $log.debug('No changes detected. Nothing to save.');
            } else {
                if (!angular.equals($scope.originalContentMetadata.freePrompt, $scope.contentMetadata.freePrompt)) {
                    $scope.uploadPromptFile($scope.contentMetadata.freePrompt, 'free');
                }
                if (!angular.equals($scope.originalContentMetadata.paidPrompt, $scope.contentMetadata.paidPrompt)) {
                    $scope.uploadPromptFile($scope.contentMetadata.paidPrompt, 'paid');
                }
            }

        };

    });

    RBTOperationsPressKeyUpdateManagementModule.controller('RBTOperationsPressKeyManagementUpdateServiceCtrl', function ($scope, $state, $controller, $log, $filter, $timeout, $translate, Upload, notification, Restangular, RBTPressKeyManagementService, serviceOfferName, offers) {
        $log.debug('RBTOperationsPressKeyManagementUpdateServiceCtrl');

        var offers = Restangular.stripRestangular(offers);
        $scope.offers = $filter('orderBy')(offers.offers, 'id');
        $scope.offer = serviceOfferName;

        $scope.key = encodeURIComponent($scope.$parent.dtmfKey);
        $scope.serviceOfferName = serviceOfferName;
        $scope.servicePromptFile = {name: undefined};
        $scope.originalPrompt = angular.copy($scope.servicePromptFile);
        $scope.removeFile = function() {
            delete $scope.servicePromptFile;
        };

        $scope.isNotChanged = function () {
            return angular.equals($scope.originalPrompt, $scope.servicePromptFile)
        };

        if ($scope.key) {
            var srcUrl = RBTPressKeyManagementService.generatePath(false, 'service', $scope.key, [$scope.offer]);
            $scope.servicePromptLoading = true;
            RBTPressKeyManagementService.downloadFile(srcUrl, function(blob, filename) {
                $scope.servicePromptFile = blob;
                if (blob) {
                    $scope.servicePromptFile.name = filename;
                }
                $scope.servicePromptLoading = false;
                $scope.originalPrompt = angular.copy($scope.servicePromptFile);
            }, function(error) {
                $scope.cancel()
            });
        }

        $scope.save = function() {
            if($scope.isNotChanged()) {
                $log.debug('No changes detected. Nothing to save.');
            } else {
                var src = RBTPressKeyManagementService.generatePath(true, 'service', $scope.key, [$scope.offer]);
                RBTPressKeyManagementService.uploadFile($scope.servicePromptFile, 'PUT', src, function(response) {
                    $scope.cancel();
                }, function(error) {
                    $log.debug('Failed to upload the file:', error);
                });
            }
        };

    });

    RBTOperationsPressKeyUpdateManagementModule.controller('RBTOperationsPressKeyManagementUpdateToneCtrl', function ($scope, $q, $state, $controller, $timeout, $log, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                      Upload, RBTPressKeyManagementService, Restangular, RBTConfService, ContentManagementService, tonePromotions) {
        $log.debug('RBTOperationsPressKeyManagementUpdateToneCtrl');
        $controller('ListViewsAudioController', {$scope: $scope});

        $scope.promotionType = 'TONE';
        $scope.key = encodeURIComponent($scope.$parent.dtmfKey);

        $scope.toneIdsList = [];
        $scope.newTonePromotionData = { tonePromptFile: undefined, toneSubscriptionCode: undefined, alias: undefined };

        $scope.promotions = tonePromotions ? Restangular.stripRestangular(tonePromotions) : [];

        // Promotion list
        $scope.promotionList = {
            list: $scope.promotions ? $scope.promotions : [],
            tableParams: {}
        };

        $scope.promotionList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "promptId": 'asc'
            }
        }, {
            total: $scope.promotionList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.promotionList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.promotionList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Promotion list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.promotionList.tableParams.settings().$scope.filterText = filterText;
            $scope.promotionList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.promotionList.tableParams.page(1);
            $scope.promotionList.tableParams.reload();
        }, 750);

        $scope.remove = function (entry) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing dtmf press key promotion entry: ', entry);
                RBTConfService.deleteTonePromotion($scope.key, $scope.promotionType, entry.subscriptionCode).then(function (response) {
                    $log.debug('Removed dtmf press key promotion entry: ', entry, ', response: ', response);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                    $state.reload();

                }, function (response) {
                    $log.debug('Cannot delete dtmf press key entry: ', entry, ', response: ', response);
                });
            });
        };

        $scope.uploadFile = function (file, subscriptionCode) {
            $log.debug('Uploading tone prompt audio file: ', file);
            var srcUrl = RBTPressKeyManagementService.generatePath(true, 'tone', $scope.key, [subscriptionCode]);
            RBTPressKeyManagementService.uploadFile(file, 'POST', srcUrl, function(response) {
                $scope.cancel();
            }, function(error) {
                $log.debug('Failed to upload the file:', error);
            });
        };

        $scope.save = function() {
            $log.debug('Saving tone promotion entry: ', $scope.toneId, $scope.newTonePromotionData, $scope.newTonePromotionData.tonePromptFile);

            $scope.uploadFile($scope.newTonePromotionData.tonePromptFile, $scope.newTonePromotionData.toneSubscriptionCode);
        };

        $scope.removeFile = function() {
            delete $scope.newTonePromotionData.tonePromptFile;
        };

        $scope.searchTonesList = _.throttle(function (text, orgId) {
            $scope.toneIdsList = [];

            var promises = [];

            promises.push(ContentManagementService.getTones(0, 1000, 'name', 'ASC', null, text, true));
            // promises.push(ContentManagementService.searchTones(0, 100, text, $scope.defaultRBTOrganization.id, true));

            $q.all(promises).then(function (responses) {
                _.each(responses, function (response) {
                    $scope.toneIdsList = $scope.toneIdsList.concat(response ? response.items : []);
                })

                $scope.toneIdsList = $filter('orderBy')($scope.toneIdsList, ['organizationName']);
            });
        }, 500);

        $scope.promptFilePathGenerator = function (subscriptionCode) {
            return RBTPressKeyManagementService.generatePath(false, 'tone', $scope.key, [subscriptionCode]);
        };

        var openTonePromptUpdateModal = function (data, key) {
            return $uibModal.open({
                templateUrl: 'services/rbt/operations/operations.presskey.management.detail.toneprompt.modal.html',
                controller: 'RBTOperationsPressKeyManagementUpdateTonePromptsCtrl',
                resolve: {
                    data: function () {
                        return data;
                    },
                    key: function () {
                        return key;
                    }
                }
            });
        };

        $scope.updateEntry = function (data) {
            var modalInstance = openTonePromptUpdateModal(data, $scope.key);

            modalInstance.result.then(function (entry) {
                $scope.searchTonesList.tableParams.reload();
                $state.go($state.$current, null, {reload: true});
            }, function () {
                // Ignored
            });
        };

        $scope.removeToneSelection = function (data) {
            $scope.newTonePromotionData.toneSubscriptionCode = undefined;
            $scope.stopAudio();
        };

        $scope.openToneSelectionModal = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'services/rbt/operations/operations.presskey.management.toneselection.modal.html',
                controller: 'RBTOperationsPressKeyManagementToneSelectionModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    allOrganizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllOrganizationsCustom(false, true, [CMPFService.OPERATOR_PROFILE]);
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $log.debug('Selected tone: ', selectedItem);
                $scope.newTonePromotionData.toneSubscriptionCode = selectedItem.offers[0].subscriptionCode;
                $scope.newTonePromotionData.alias = selectedItem.alias;
                $scope.newTonePromotionData.name = selectedItem.name;
                $scope.newTonePromotionData.organizationName = selectedItem.organizationName;
            }, function () {
            });
        };


    });

    RBTOperationsPressKeyUpdateManagementModule.controller('RBTOperationsPressKeyManagementUpdateTonePromptsCtrl', function ($scope, $log, $controller, $uibModalInstance, $translate, notification, RBTPressKeyManagementService, data, key) {
        $log.debug('RBTOperationsPressKeyManagementUpdateTonePromptsCtrl');
        $controller('RBTOperationsPressKeyManagementUpdateCommonCtrl', {$scope: $scope});

        $scope.pageHeaderKey = 'Services.RBT.Operations.PressKey.Management.UpdateTonePrompt';

        $scope.data = data ? data : {};
        $scope.key = key;

        if(data && !data.promptFile){
            if(data && !data.promptFile){
                $scope.tonePromptLoading = true;
                var srcUrl = RBTPressKeyManagementService.generatePath(false,'tone', key, [data.subscriptionCode]);
                RBTPressKeyManagementService.downloadFile(srcUrl, function (blob, filename, status) {

                    data.promptFile = blob;
                    if (blob) {
                        data.promptFile.name = filename;
                    }
                    if(status){
                        data.promptFile = new Blob([null], {type: 'audio/wav'});
                        data.promptFile.$error = status;
                    }

                    $scope.tonePromptLoading = false;
                    return data;

                }, function (error) {
                    $log.debug('Failed to download the audio file:', error);
                    data.promptFile = null; //new Blob([null], {type: 'audio/wav'});
                    $scope.tonePromptLoading = false;
                    return data;
                });
            }
        }

        $scope.entry = data;
        $scope.subscriptionCode = data.subscriptionCode;
        $scope.originalEntry = angular.copy($scope.entry);

        $scope.isNotChanged = function () {
            return angular.equals($scope.originalEntry.promptFile, $scope.entry.promptFile);
        };

        // Save entry
        $scope.save = function (entry) {
            $log.debug('Uploading tone prompt audio file: ', entry);
            var srcUrl = RBTPressKeyManagementService.generatePath(true, 'tone', $scope.key, [$scope.subscriptionCode]);
            RBTPressKeyManagementService.uploadFile(entry.promptFile, 'PUT', srcUrl, function(response) {
                $scope.cancel();
            }, function(error) {
                $log.debug('Failed to upload the file:', error);
            });

        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
    });

})();
