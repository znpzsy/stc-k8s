(function () {

    'use strict';

    angular.module('adminportal.subsystems.contentmanagement.operations.rbt.diy', []);

    var ContentManagementOperationsDIYRBTModule = angular.module('adminportal.subsystems.contentmanagement.operations.rbt.diy');

    ContentManagementOperationsDIYRBTModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.contentmanagement.operations.rbt.diy', {
            abstract: true,
            url: "/diy",
            templateUrl: "subsystems/contentmanagement/operations/rbt/operations.diy.html",
            data: {
                exportFileName: 'DoItYourselfRBT',
                permissions: [
                    'RBT__OPERATIONS_DIY_READ'
                ]
            }
        }).state('subsystems.contentmanagement.operations.rbt.diy.list', {
            url: "/list",
            templateUrl: "subsystems/contentmanagement/operations/rbt/operations.diy.list.html",
            controller: 'ContentManagementOperationsDIYRBTCtrl',
            data: {
                stateTitle: 'Subsystems.ContentManagement.Operations.RBT.DIY.Title'
            },
            resolve: {
                diyTones: function (RBTContentManagementService) {
                    return RBTContentManagementService.getDIYTones();
                }
            }
        }).state('subsystems.contentmanagement.operations.rbt.diy.timeline', {
            url: "/timeline",
            templateUrl: "subsystems/contentmanagement/operations/rbt/operations.diy.timeline.html",
            controller: 'ContentManagementOperationsDIYRBTCtrl',
            data: {
                stateTitle: 'Subsystems.ContentManagement.Operations.RBT.DIY.Title'
            },
            resolve: {
                diyTones: function (RBTContentManagementService) {
                    return RBTContentManagementService.getDIYTones();
                }
            }
        }).state('subsystems.contentmanagement.operations.rbt.diy.config', {
            url: "/config",
            templateUrl: "subsystems/contentmanagement/operations/rbt/operations.diy.config.html",
            controller: 'ContentManagementOperationsDIYRBTConfigCtrl',
            resolve: {
                diyTonesConfig: function ($stateParams, RBTContentManagementService) {
                    return RBTContentManagementService.getDIYTonesConfig($stateParams.id);
                }
            }
        }).state('subsystems.contentmanagement.operations.rbt.diy.update', {
            url: "/update/:id",
            templateUrl: "subsystems/contentmanagement/operations/rbt/operations.diy.details.html",
            controller: 'ContentManagementOperationsDIYRBTUpdateCtrl',
            resolve: {
                diyTone: function ($stateParams, RBTContentManagementService) {
                    return RBTContentManagementService.getDIYTone($stateParams.id);
                }
            }
        });

    });

    ContentManagementOperationsDIYRBTModule.controller('ContentManagementOperationsDIYRBTCommonCtrl', function ($scope, $log, $state, $uibModal, $controller, CMS_LANGUAGES, CMS_RBT_DIY_STATUS_TYPES, DURATION_UNITS,
                                                                                                                RBTContentManagementService, ContentManagementService, UtilService) {
        $log.debug('ContentManagementOperationsDIYRBTCommonCtrl');

        $controller('GenericDateTimeCtrl', {$scope: $scope});

        $scope.DURATION_UNITS = DURATION_UNITS;
        $scope.CMS_LANGUAGES = CMS_LANGUAGES;
        $scope.CMS_RBT_DIY_STATUS_TYPES = CMS_RBT_DIY_STATUS_TYPES;

        $scope.toneFileChanged = function (toneFile) {
            $scope.contentMetadata.duration = null;

            toneFile.$$ngfBlobUrlPromise.then(function (ngfBlobUrl) {
                var audioFile = new Audio(ngfBlobUrl);
                audioFile.onloadedmetadata = function () {
                    // Duration in second
                    $scope.contentMetadata.duration = Math.round(audioFile.duration);
                };
            });

            $scope.validationInProgress = true;

            ContentManagementService.validateAudioFile(toneFile).then(function (response) {
                $scope.validationInProgress = false;

                UtilService.setError($scope.form, 'toneFile', 'audioValiditiyCheck', (response && response.code === 2000));
            }, function (response) {
                $scope.validationInProgress = false;

                $log.debug('ERROR: ', response);

                UtilService.setError($scope.form, 'toneFile', 'audioValiditiyCheck', false);
            });
        };

        $scope.cancel = function () {
            $state.go('subsystems.contentmanagement.operations.rbt.diy.list');
        };

        // Config view price checks
        $scope.$watch('contentMetadata.chargingDetails.price', function (newValue, oldValue) {
            // original price should be greater than the price
            var originalPriceValid = false;
            if(newValue == null && oldValue == null){
                originalPriceValid = true;
            } else if($scope.contentMetadata.chargingDetails.originalPrice && $scope.contentMetadata.chargingDetails.originalPrice >= 0) {
                originalPriceValid = $scope.contentMetadata.chargingDetails.originalPrice > $scope.contentMetadata.chargingDetails.price;
            } else {
                originalPriceValid = !$scope.form.originalprice.$modelValue  ? true : ($scope.form.originalprice.$modelValue > newValue);
                // 0 > 0  = false , check for zeros
                originalPriceValid = ($scope.form.originalprice.$modelValue == 0) ? $scope.form.originalprice.$modelValue > newValue : originalPriceValid;
            }

            UtilService.setError($scope.form, 'originalprice', 'pricerange', originalPriceValid);

        });

        $scope.$watch('contentMetadata.chargingDetails.originalPrice', function (newValue, oldValue) {

            // original price should be greater than the price
            var originalPriceValid = false;

            if(newValue == null && oldValue == null){
                originalPriceValid = true;
            } else if ($scope.contentMetadata.chargingDetails.originalPrice && $scope.contentMetadata.chargingDetails.originalPrice >= 0) {
                originalPriceValid = $scope.contentMetadata.chargingDetails.originalPrice > $scope.contentMetadata.chargingDetails.price;
            } else {
                originalPriceValid = (newValue == null || newValue == undefined || newValue == 0) ? true : $scope.form.price.$modelValue < newValue;
                // 0 < 0  = false , check for zeros
                originalPriceValid = (newValue == 0) ? $scope.form.price.$modelValue < newValue : originalPriceValid;
            }
            UtilService.setError($scope.form, 'originalprice', 'pricerange', originalPriceValid);
        });
    });

    ContentManagementOperationsDIYRBTModule.controller('ContentManagementOperationsDIYRBTCtrl', function ($scope, $log, $controller, $state, $timeout,  $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                        Restangular, RBTContentManagementService, diyTones, DEFAULT_REST_QUERY_LIMIT) {
        $log.debug('ContentManagementOperationsDIYRBTCtrl');
        $scope.msisdn = '';
        $scope.originalDiyTonesList = diyTones.diyToneList || [];

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'id',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.DIY.Id'
                },
                {
                    fieldName: 'artistName',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.DIY.ArtistName'
                },
                {
                    fieldName: 'recordName',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.DIY.RecordName'
                },
                {
                    fieldName: 'status',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.DIY.Status'
                }
            ]
        };

        // DIY Tone List
        $scope.diyTonesList = {
            list:  diyTones.diyToneList || [],
            tableParams: {}
        };

        $scope.diyTonesList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "id": 'asc'
            }
        }, {
            total: $scope.diyTonesList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.diyTonesList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.diyTonesList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - DIY Tone List

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.diyTonesList.tableParams.settings().$scope.filterText = filterText;
            $scope.diyTonesList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.diyTonesList.tableParams.page(1);
            $scope.diyTonesList.tableParams.reload();
        }, 750);


        $scope.reloadTable = function (tableParams, _pageNumber) {
            var pageNumber = _pageNumber ? _pageNumber : 1;
            if (tableParams.page() === pageNumber) {
                tableParams.reload();
            } else {
                $timeout(function () {
                    tableParams.page(pageNumber);
                }, 0);
            }
        };

        $scope.stateFilter = 'ALL';
        $scope.stateFilterChange = function (state) {
            if(state !== 'ALL') {
                $scope.diyTonesList.list = _.where($scope.originalDiyTonesList, {status: state});
            }
            else {
                $scope.diyTonesList.list = angular.copy($scope.originalDiyTonesList);

            }
            $scope.diyTonesList.tableParams.page(1);
            $scope.reloadTable($scope.diyTonesList.tableParams);
        };

        $scope.remove = function (diyTone) {
            diyTone.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                diyTone.rowSelected = false;

                $log.debug('Removing diyTone: ', diyTone);

                RBTContentManagementService.deleteDIYTone(diyTone).then(function (response) {
                    $log.debug('Removed diyTone: ', diyTone, ', response: ', response);

                    if (response && response.errorCode) {
                        RBTContentManagementService.showApiError(response);
                    } else {
                        var deletedListItem = _.findWhere($scope.diyTonesList.list, {id: diyTone.id});
                        $scope.diyTonesList.list = _.without($scope.diyTonesList.list, deletedListItem);

                        $scope.diyTonesList.tableParams.reload();

                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });
                    }
                }, function (response) {
                    $log.debug('Cannot remove diyTone: ', diyTone, ', response: ', response);

                    RBTContentManagementService.showApiError(response);
                });
            }, function () {
                diyTone.rowSelected = false;
            });
        };

        $scope.search = _.debounce(function (msisdn) {
            if (msisdn) {
                $scope.subscriberNumber = null;
                RBTContentManagementService.getDIYTones(msisdn).then(function (response) {
                    $scope.apiResponse = null;
                    var apiResponse = Restangular.stripRestangular(response);

                    $log.debug('Get DIY Tones. Response: ', apiResponse);

                    if (apiResponse.errorCode) {
                        notification({
                            type: 'warning',
                            text: $translate.instant('CommonMessages.ApiError', {
                                errorCode: apiResponse.errorCode,
                                errorText: apiResponse.message
                            })
                        });
                    } else if (!apiResponse) {
                        notification({
                            type: 'warning',
                            text: $translate.instant('CommonMessages.SubscriptionDoesNotExist')
                        });
                    } else {
                        $scope.apiResponse = response;
                        $scope.subscriberNumber = msisdn;
                        $scope.msisdn = '';
                        $scope.diyTonesList.list = apiResponse.usersDIYToneList;
                        $scope.stateFilterChange('ALL');

                    }
                }, function (response) {
                    $log.error('Cannot read DIY tones for subscriber. Error: ', response);
                    if (response && response.data && response.data.errorCode) {
                        notification({
                            type: 'warning',
                            text: $translate.instant('CommonMessages.ApiError', {
                                errorCode: response.data.errorCode,
                                errorText: response.data.message
                            })
                        });
                    } else {
                        notification({
                            type: 'warning',
                            text: $translate.instant('CommonMessages.GenericServerError')
                        });
                    }
                    $scope.apiResponse = null;
                });
            }
        }, 750, {immediate: true});





        //timeline view
        $scope.getBgColorByState = function (state) {
            var bgColorClass = 'bg-default';
            if (state === 'PENDING') {
                bgColorClass = 'bg-warning';
            } else if (state === 'ACTIVE') {
                bgColorClass = 'bg-success';
            } else if (state === 'REJECTED') {
                bgColorClass = 'bg-danger';
            }

            return bgColorClass;
        };

        $scope.getIconByState = function (state) {
            var iconClass = 'fa-square-o';
            if (state === 'PENDING') {
                iconClass = 'fa-hourglass-o';
            } else if (state === 'ACTIVE') {
                iconClass = 'fa-thumbs-up'
            } else if (state === 'REJECTED') {
                iconClass = 'fa-thumbs-down'
            }

            return iconClass;
        };

        $scope.getLabelByState = function (state) {
            var label = state;
            if (state === 'PENDING') {
                label = 'Pending';
            } else if (state === 'ACTIVE') {
                label = 'Active';
            } else if (state === 'REJECTED') {
                label = 'Rejected';
            }

            return s(label).humanize().titleize().value();
        };

        $scope.approve = function (diyTone) {
            var diyToneItem = {
                "id": diyTone.id,
                "status": 'ACTIVE'
            };
            $scope.update(diyToneItem);
        };

        $scope.reject = function (diyTone) {
            var diyToneItem = {
                "id": diyTone.id,
                "status": 'REJECTED'
            };
            $scope.update(diyToneItem);

        };

        $scope.update = function (diyToneItem) {
            $log.debug('Updating diyTone: ', diyToneItem);

            RBTContentManagementService.updateDIYToneStatus(diyToneItem).then(function (response) {
                $log.debug('Updated diyTone: ', diyToneItem, ', response: ', response);

                if (response && response.errorCode) {
                    RBTContentManagementService.showApiError(response);
                } else {
                    notification.flash({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                    $state.reload();
                }
            }, function (response) {
                $log.debug('Cannot update diyTone: ', diyToneItem, ', response: ', response);

                RBTContentManagementService.showApiError(response);
            });

        };
    });

    ContentManagementOperationsDIYRBTModule.controller('ContentManagementOperationsDIYRBTConfigCtrl', function ($scope, $log, $controller, $uibModal, $filter, $translate, notification, UtilService, diyTonesConfig,
                                                                                                                           Restangular, RBTContentManagementService) {
        $log.debug('ContentManagementOperationsDIYRBTConfigCtrl');

        $controller('ContentManagementOperationsDIYRBTCommonCtrl', {
            $scope: $scope
        });

        $scope.diyTonesConfig = Restangular.stripRestangular(diyTonesConfig);

        $scope.contentMetadata = {
            chargingDetails: {
                chargingPeriod: UtilService.convertPeriodStringToSimpleObject($scope.diyTonesConfig.chargingPeriodDetail),
                price: Number($scope.diyTonesConfig.price),
                originalPrice: $scope.diyTonesConfig.originalPrice ? Number($scope.diyTonesConfig.originalPrice) : null
            }
        };

        $scope.originalContentMetadata = angular.copy($scope.contentMetadata);

        $scope.isNotChanged = function () {
            return angular.equals($scope.originalContentMetadata, $scope.contentMetadata);
        };

        $scope.save = function (diyConfig) {
            var diyTonesConfigItem = {
                "chargingPeriod": diyConfig.chargingDetails.chargingPeriod.duration,
                "chargingPeriodDetail": UtilService.convertSimpleObjectToPeriod(diyConfig.chargingDetails.chargingPeriod),
                "price": diyConfig.chargingDetails.price,
                "originalPrice": diyConfig.chargingDetails.originalPrice
            };

            $log.debug('Creating diyConfig: ', diyTonesConfigItem);

            RBTContentManagementService.postDIYTonesConfig(diyTonesConfigItem).then(function (response) {
                $log.debug('Created diyConfig: ', diyTonesConfigItem, ', response: ', response);

                if (response && response.errorCode) {
                    RBTContentManagementService.showApiError(response);
                } else {
                    notification.flash({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $scope.cancel();
                }
            }, function (response) {
                $log.debug('Cannot create diyConfig: ', diyTonesConfigItem, ', response: ', response);

                RBTContentManagementService.showApiError(response);
            });
        };
    });

    ContentManagementOperationsDIYRBTModule.controller('ContentManagementOperationsDIYRBTUpdateCtrl', function ($scope, $log, $controller, $stateParams, $filter, $translate, notification, Restangular, UtilService,
                                                                                                                FileDownloadService, RBTContentManagementService, ContentManagementService, diyTone) {
        $log.debug('ContentManagementOperationsDIYRBTUpdateCtrl');

        $controller('ContentManagementOperationsDIYRBTCommonCtrl', {
            $scope: $scope
        });

        $scope.diyTone = diyTone.diyToneDTO;
        // TODO: Temporary mock for tone file & image - content metadata
        $scope.contentMetadata = {
            toneFileId: $scope.diyTone.toneId,
            toneImageId: $scope.diyTone.toneImageId
        };

        // Get the toneFile by id value.
        if ($scope.contentMetadata.toneFileId) {
            $scope.contentMetadata.toneFile = {name: undefined};
            var srcUrl = ContentManagementService.generateFilePath($scope.contentMetadata.toneFileId);
            FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                $scope.contentMetadata.toneFile = blob;
                if (blob) {
                    $scope.contentMetadata.toneFile.name = fileName;
                }
                $scope.originalContentMetadata = angular.copy($scope.contentMetadata);
            });
        }

        // Get the coverImage by id value.
        if ($scope.contentMetadata.toneImageId) {
            $scope.contentMetadata.coverImage = {name: undefined};
            var srcUrl = ContentManagementService.generateFilePath($scope.contentMetadata.toneImageId);
            FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                $scope.contentMetadata.coverImage = blob;
                if (blob) {
                    $scope.contentMetadata.coverImage.name = fileName;
                }
                $scope.originalContentMetadata = angular.copy($scope.contentMetadata);
            });
        }

        // set up charging details
        $scope.contentMetadata.chargingDetails = {
            chargingPeriod: UtilService.convertPeriodStringToSimpleObject($scope.diyTone.chargingPeriodDetail),
            price: Number($scope.diyTone.price),
            originalPrice: $scope.diyTone.originalPrice ? Number($scope.diyTone.originalPrice): null,
            subscriptionCode: $scope.diyTone.subscriptionCode
        };

        $scope.originalDiyTone = angular.copy($scope.diyTone);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalDiyTone, $scope.diyTone) && angular.equals($scope.originalContentMetadata, $scope.contentMetadata);
        };

        $scope.save = function (diyTone) {
            var diyToneItem = {
                "id": $scope.originalDiyTone.id,
                "status": diyTone.status
                // // Changed values
                // "artistName": diyTone.artistName,
                // "recordName": diyTone.recordName,
                // "toneId": $scope.contentMetadata.toneFileId,
                // "toneImageId": $scope.contentMetadata.toneImageId,
                // "chargingPeriodDetail": UtilService.convertSimpleObjectToPeriod($scope.contentMetadata.chargingDetails.chargingPeriod),
                // "chargingPeriod": $scope.contentMetadata.chargingDetails.chargingPeriod.duration,
                // "price": $scope.contentMetadata.chargingDetails.price,
                // "originalPrice": $scope.contentMetadata.chargingDetails.originalPrice
            };

            $log.debug('Updating diyTone: ', diyToneItem);

            RBTContentManagementService.updateDIYToneStatus(diyToneItem).then(function (response) {
                $log.debug('Updated diyTone: ', diyToneItem, ', response: ', response);

                if (response && response.errorCode) {
                    RBTContentManagementService.showApiError(response);
                } else {
                    notification.flash({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $scope.cancel();
                }
            }, function (response) {
                $log.debug('Cannot update diyTone: ', diyToneItem, ', response: ', response);

                RBTContentManagementService.showApiError(response);
            });
        };
    });

})();
