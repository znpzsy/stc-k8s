(function () {

    'use strict';

    angular.module('adminportal.subsystems.contentmanagement.operations.rbt.statuses', []);

    var ContentManagementOperationsStatusesRBTModule = angular.module('adminportal.subsystems.contentmanagement.operations.rbt.statuses');

    ContentManagementOperationsStatusesRBTModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.contentmanagement.operations.rbt.statuses', {
            abstract: true,
            url: "/statuses",
            template: '<div ui-view></div>',
            data: {
                exportFileName: 'StatusesRBT',
                permissions: [
                    'RBT__OPERATIONS_SIGNATURE_READ'
                ]
            }
        }).state('subsystems.contentmanagement.operations.rbt.statuses.list', {
            url: "",
            templateUrl: "subsystems/contentmanagement/operations/rbt/operations.statuses.html",
            controller: 'ContentManagementOperationsStatusesRBTCtrl',
            resolve: {
                statuses: function (RBTContentManagementService) {
                    return RBTContentManagementService.getStatuses();
                }
            }
        }).state('subsystems.contentmanagement.operations.rbt.statuses.new', {
            url: "/new",
            templateUrl: "subsystems/contentmanagement/operations/rbt/operations.statuses.details.html",
            controller: 'ContentManagementOperationsStatusesRBTNewCtrl'
        }).state('subsystems.contentmanagement.operations.rbt.statuses.update', {
            url: "/update/:id",
            templateUrl: "subsystems/contentmanagement/operations/rbt/operations.statuses.details.html",
            controller: 'ContentManagementOperationsStatusesRBTUpdateCtrl',
            resolve: {
                statusEn: function ($stateParams, RBTContentManagementService) {
                    return RBTContentManagementService.getStatus($stateParams.id, 'EN');
                },
                statusAr: function ($stateParams, RBTContentManagementService) {
                    return RBTContentManagementService.getStatus($stateParams.id, 'AR');
                },
            }
        });

    });

    ContentManagementOperationsStatusesRBTModule.controller('ContentManagementOperationsStatusesRBTCommonCtrl', function ($scope, $log, $state, $uibModal, $controller, CMS_LANGUAGES, CMS_SIGNATURE_TYPES, ContentManagementService, UtilService) {
        $log.debug('ContentManagementOperationsStatusesRBTCommonCtrl');

        $controller('GenericDateTimeCtrl', {$scope: $scope});

        $scope.CMS_LANGUAGES = CMS_LANGUAGES;
        $scope.CMS_SIGNATURE_TYPES = CMS_SIGNATURE_TYPES;



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
            $state.go('subsystems.contentmanagement.operations.rbt.statuses.list');
        };
    });

    ContentManagementOperationsStatusesRBTModule.controller('ContentManagementOperationsStatusesRBTCtrl', function ($scope, $log, $controller, $state, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                 Restangular, RBTContentManagementService, DEFAULT_REST_QUERY_LIMIT, statuses) {
        $log.debug('ContentManagementOperationsStatusesRBTCtrl');

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'id',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.Statuses.Id'
                },
                {
                    fieldName: 'name',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.Statuses.Name'
                },
                {
                    fieldName: 'description',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.Statuses.Description'
                }
            ]
        };

        // Status list
        $scope.statusList = {
            list: statuses.statusDTOList ? statuses.statusDTOList : [],
            tableParams: {}
        };

        $scope.statusList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "id": 'asc'
            }
        }, {
            total: $scope.statusList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.statusList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.statusList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Status list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.statusList.tableParams.settings().$scope.filterText = filterText;
            $scope.statusList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.statusList.tableParams.page(1);
            $scope.statusList.tableParams.reload();
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
            if (state === 'ALL') {
                delete $scope.statusList.tableParams.settings().$scope.type;
            } else {
                $scope.statusList.tableParams.settings().$scope.type = state;
            }

            $scope.reloadTable($scope.statusList.tableParams);
        };

        $scope.remove = function (status) {
            status.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                status.rowSelected = false;

                $log.debug('Removing status: ', status);

                RBTContentManagementService.deleteStatus(status).then(function (response) {
                    $log.debug('Removed status: ', status, ', response: ', response);

                    if (response && response.errorCode) {
                        RBTContentManagementService.showApiError(response);
                    } else {
                        var deletedListItem = _.findWhere($scope.statusList.list, {id: status.id});
                        $scope.statusList.list = _.without($scope.statusList.list, deletedListItem);

                        $scope.statusList.tableParams.reload();

                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });
                    }
                }, function (response) {
                    $log.debug('Cannot remove status: ', status, ', response: ', response);

                    RBTContentManagementService.showApiError(response);
                });
            }, function () {
                status.rowSelected = false;
            });
        };
    });

    ContentManagementOperationsStatusesRBTModule.controller('ContentManagementOperationsStatusesRBTNewCtrl', function ($scope, $q, $log, $controller, $filter, $translate, notification, UtilService,
                                                                                                                    RBTContentManagementService, ContentManagementService) {
        $log.debug('ContentManagementOperationsStatusesRBTNewCtrl');

        $controller('ContentManagementOperationsStatusesRBTCommonCtrl', {
            $scope: $scope
        });

        $scope.status = {}
        $scope.contentMetadata = {
            toneFileId: '',
            toneFile: '',
            name: ''
        };
        $scope.save = function (status) {

            var statusItem = {
                // Set values
                "names": [
                    {
                        "lang": "EN",
                        "name": status.nameEn
                    },
                    {
                        "lang": "AR",
                        "name": status.nameAr
                    }
                ],
                "descriptions": [
                    {
                        "description": status.descriptionEn,
                        "lang": "EN"
                    },
                    {
                        "description": status.descriptionAr,
                        "lang": "AR"
                    }
                ],
                "statusToneFileId": $scope.contentMetadata.toneFileId
            };

            // toneFileId
            var toneFile;
            if ($scope.contentMetadata.toneFile && $scope.contentMetadata.toneFile.name) {
                statusItem.statusToneFileId = UtilService.generateObjectId();
                toneFile = $scope.contentMetadata.toneFile;
            }

            $log.debug('Creating status: ', statusItem);

            var promises = [];
            // Update status item first
            promises.push(RBTContentManagementService.createStatus(statusItem));
            promises.push(ContentManagementService.uploadFile(toneFile, toneFile.name, statusItem.statusToneFileId));

            $q.all(promises).then(function () {
                notification.flash({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $scope.cancel();
            }, function (error) {
                $log.debug('Server error occured: ', error);

                notification.flash({
                    type: 'error',
                    text: $translate.instant('CommonMessages.GenericServerError')
                });
            });
        };
    });

    ContentManagementOperationsStatusesRBTModule.controller('ContentManagementOperationsStatusesRBTUpdateCtrl', function ($scope, $q, $log, $controller, $stateParams, $filter, $translate, notification, Restangular, UtilService,
                                                                                                                       RBTContentManagementService, ContentManagementService, FileDownloadService, statusEn, statusAr) {
        $log.debug('ContentManagementOperationsStatusesRBTUpdateCtrl');

        $controller('ContentManagementOperationsStatusesRBTCommonCtrl', {
            $scope: $scope
        });

        $scope.status = {
            id: statusEn.statusDTO.id,
            nameEn: statusEn.statusDTO.name,
            nameAr: statusAr.statusDTO.name,
            descriptionEn: statusEn.statusDTO.description,
            descriptionAr: statusAr.statusDTO.description,
            statusToneFileId: statusEn.statusDTO.statusToneFileId,
            statusToneFileUrl: statusEn.statusDTO.statusToneFileUrl

        };
        $scope.originalStatus = angular.copy($scope.status);
        $scope.contentMetadata = {};

        // Get the toneFile by id value, set it to a separate object
        if ($scope.status.statusToneFileId) {
            $scope.contentMetadata.toneFile = {name: undefined};
            var srcUrl = ContentManagementService.generateFilePath($scope.status.statusToneFileId);
            FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                $scope.contentMetadata.toneFile = blob;
                if (blob) {
                    $scope.contentMetadata.toneFile.name = fileName;
                }
                $scope.originalContentMetadata = angular.copy($scope.contentMetadata);
            });
        }

        $scope.isNotChanged = function () {
            return angular.equals($scope.originalStatus, $scope.status) && angular.equals($scope.originalContentMetadata, $scope.contentMetadata)
        };

        $scope.save = function (status) {
            var statusItem = {
                "id": $scope.originalStatus.id,
                // Changed values
                "names": [
                    {
                        "lang": "EN",
                        "name": status.nameEn
                    },
                    {
                        "lang": "AR",
                        "name": status.nameAr
                    }
                ],
                "descriptions": [
                    {
                        "description": status.descriptionEn,
                        "lang": "EN"
                    },
                    {
                        "description": status.descriptionAr,
                        "lang": "AR"
                    }
                ],
                "statusToneFileId": $scope.originalStatus.statusToneFileId
            };

            // toneFileId
            var toneFile;
            if (!angular.equals($scope.originalContentMetadata, $scope.contentMetadata)) {
                statusItem.statusToneFileId = UtilService.generateObjectId();
                toneFile = $scope.contentMetadata.toneFile;
                $scope.status.statusToneFileId = statusItem.statusToneFileId;
            }

            $log.debug('Updating status: ', statusItem);
            var promises = [];

            if(!angular.equals($scope.originalStatus, $scope.status)){
                promises.push(RBTContentManagementService.updateStatus(statusItem));
            }
            if (!angular.equals($scope.originalContentMetadata, $scope.contentMetadata)) {
                promises.push(ContentManagementService.uploadFile(toneFile, toneFile.name, statusItem.statusToneFileId));
            }

            $q.all(promises).then(function () {
                notification.flash({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $scope.cancel();
            }, function (error) {
                $log.debug('Server error occured: ', error);

                notification.flash({
                    type: 'error',
                    text: $translate.instant('CommonMessages.GenericServerError')
                });
            });
        };
    });

})();
