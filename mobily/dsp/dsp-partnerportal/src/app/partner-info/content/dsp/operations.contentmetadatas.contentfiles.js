(function () {

    'use strict';

    angular.module('partnerportal.partner-info.operations.dsp.contentmetadatas.contentfiles', []);

    var PartnerInfoContentManagementContentMetadatasContentFilesModule = angular.module('partnerportal.partner-info.operations.dsp.contentmetadatas.contentfiles');

    PartnerInfoContentManagementContentMetadatasContentFilesModule.config(function ($stateProvider) {

        $stateProvider.state('partner-info.operations.dsp.contentmetadatas.contentfiles', {
            abstract: true,
            url: "/:contentMetadataId/content-files",
            template: '<div ui-view></div>',
            data: {
                exportFileName: 'ContentFiles',
                backState: 'partner-info.operations.dsp.contentmetadatas.list'
            },
            resolve: {
                contentMetadata: function ($stateParams, ContentManagementService) {
                    return ContentManagementService.getContentMetadata($stateParams.contentMetadataId);
                }
            }
        }).state('partner-info.operations.dsp.contentmetadatas.contentfiles.list', {
            url: "",
            templateUrl: "partner-info/content/dsp/operations.contentmetadatas.contentfiles.html",
            controller: 'PartnerInfoContentManagementContentMetadatasContentFilesCtrl'
        });

        // New
        $stateProvider.state('partner-info.operations.dsp.contentmetadatas.contentfiles.new', {
            url: "/new",
            templateUrl: "partner-info/content/dsp/operations.contentmetadatas.contentfiles.details.html",
            controller: 'PartnerInfoContentManagementContentMetadatasContentFilesNewCtrl',
            resolve: {
                checkPermission: function ($state, contentMetadata) {
                    if (contentMetadata && contentMetadata.detail && contentMetadata.detail.status !== 'ACTIVE') {
                        $state.go('partner-info.operations.dsp.contentmetadatas.contentfiles.list');
                    }
                }
            }
        });

        // Update
        $stateProvider.state('partner-info.operations.dsp.contentmetadatas.contentfiles.update', {
            url: "/update/:id",
            templateUrl: "partner-info/content/dsp/operations.contentmetadatas.contentfiles.details.html",
            controller: 'PartnerInfoContentManagementContentMetadatasContentFilesUpdateCtrl',
            resolve: {
                contentFile: function ($q, $stateParams, contentMetadata, ContentManagementService, FileDownloadService) {
                    var deferred = $q.defer();

                    // Get the content metadata file by id value.
                    var srcUrl = ContentManagementService.generateContentMetadataFilePath($stateParams.id);
                    FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                        var contentFile = {
                            id: $stateParams.id,
                            file: blob,
                            fileName: fileName,
                            fileType: blob.type
                        };

                        if (blob) {
                            contentFile.file.name = fileName;
                        }

                        deferred.resolve(contentFile);
                    });

                    return deferred.promise;
                }
            }
        });

    });

    PartnerInfoContentManagementContentMetadatasContentFilesModule.controller('PartnerInfoContentManagementContentMetadatasContentFilesCommonCtrl', function ($scope, $log, $state, contentMetadata, SessionService) {
        $log.debug('PartnerInfoContentManagementContentMetadatasContentFilesCommonCtrl');

        $scope.sessionOrganization = SessionService.getSessionOrganization();
        $scope.username = SessionService.getUsername();

        $scope.contentMetadata = contentMetadata.detail;

        $scope.cancel = function () {
            $state.go('partner-info.operations.dsp.contentmetadatas.contentfiles.list');
        };
    });

    PartnerInfoContentManagementContentMetadatasContentFilesModule.controller('PartnerInfoContentManagementContentMetadatasContentFilesCtrl', function ($scope, $log, $state, $stateParams, $filter, $uibModal, $translate, notification, contentMetadata, NgTableParams,
                                                                                                                                                        DEFAULT_REST_QUERY_LIMIT, CMPFService, SessionService, WorkflowsService, ContentManagementService) {
        $log.debug('PartnerInfoContentManagementContentMetadatasContentFilesCtrl');

        $scope.sessionOrganization = SessionService.getSessionOrganization();
        $scope.username = SessionService.getUsername();

        $scope.contentMetadata = contentMetadata.detail;

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'id',
                    headerKey: 'PartnerInfo.Contents.ContentMetadatas.ManageContentFiles.FileId'
                },
                {
                    fieldName: 'fileName',
                    headerKey: 'PartnerInfo.Contents.ContentMetadatas.ManageContentFiles.FileName'
                },
                {
                    fieldName: 'fileType',
                    headerKey: 'PartnerInfo.Contents.ContentMetadatas.ManageContentFiles.FileType'
                }
            ]
        };

        // Content file list
        $scope.contentFileList = {
            list: [],
            tableParams: {}
        };

        $scope.contentFileList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "id": 'asc'
            }
        }, {
            total: $scope.contentFileList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var page = params.page() - 1;
                var size = params.count();

                var sortingPair = _.pairs(params.sorting());
                var sort = sortingPair[0][0] + ',' + sortingPair[0][1];

                if (params.settings().$scope.justReloadTheTableWithTheList) {
                    var orderedData = params.sorting() ? $filter('orderBy')($scope.contentFileList.list, params.orderBy()) : $scope.contentFileList.list;
                    params.total(orderedData.length); // set total for recalc pagination
                    if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                        params.page(params.page() - 1);
                    }

                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                } else {
                    ContentManagementService.getContentMetadataFiles(page, size, $stateParams.contentMetadataId).then(function (response) {
                        if (response && response.detail) {
                            $scope.contentFileList.list = response.detail.fileInfoList;

                            params.total(response.detail.totalCount);
                            $defer.resolve($scope.contentFileList.list);
                        } else {
                            params.total(0);
                            $defer.resolve([]);
                        }
                    }, function (response) {
                        $log.debug('Cannot read content files. Error: ', response);

                        params.total(0);
                        $defer.resolve([]);

                        notification({
                            type: 'warning',
                            text: $translate.instant('CommonMessages.GenericServerError')
                        });
                    });
                }
            }
        });
        // END - Content file list

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

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.contentFileList.tableParams.settings().$scope.filterText = filterText;
            $scope.contentFileList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.contentFileList.tableParams.page(1);
            $scope.contentFileList.tableParams.reload();
        }, 750);

        $scope.stateFilter = 'ALL';
        $scope.stateFilterChange = _.debounce(function (state) {
            if (state === 'ALL') {
                $scope.contentFileList.tableParams.settings().$scope.justReloadTheTableWithTheList = false;

                $scope.reloadTable($scope.contentFileList.tableParams);
            } else {
                $scope.contentFileList.list = [];
                WorkflowsService.getPendingTasks(0, DEFAULT_REST_QUERY_LIMIT, 'CONTENT_FILE').then(function (waitingContentFileTasks) {
                    if (waitingContentFileTasks && waitingContentFileTasks.length > 0) {
                        _.each(waitingContentFileTasks, function (contentFileTask) {
                            if (contentFileTask && contentFileTask.name && (contentFileTask.name.toLowerCase() === 'content file create task') &&
                                (contentFileTask.objectDetail.contentId === $stateParams.contentMetadataId)) {
                                contentFileTask.objectDetail.taskObjectId = contentFileTask.realContentFileId || contentFileTask.contentFileId;
                                contentFileTask.objectDetail.status = 'WAITING FOR APPROVAL';
                                contentFileTask.objectDetail.taskName = contentFileTask.name;

                                $scope.contentFileList.list.push(contentFileTask.objectDetail);
                            }
                        });
                    }

                    $scope.contentFileList.tableParams.settings().$scope.justReloadTheTableWithTheList = true;
                    $scope.contentFileList.tableParams.page(1);
                    $scope.contentFileList.tableParams.reload();
                });
            }
        }, 500);

        // Task details modal window.
        $scope.showTaskDetails = function (contentFile) {
            contentFile.rowSelected = true;

            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'partials/modal/empty.modal.html',
                controller: function ($scope, $controller, $uibModalInstance, taskDetail) {
                    $controller('WorkflowsOperationsTasksDetailContentFileCtrl', {
                        $scope: $scope,
                        taskDetail: taskDetail
                    });

                    $scope.isModal = true;
                    $scope.modalTitle = contentFile.taskName;
                    $scope.templateUrl = 'workflows/operations/operations.tasks.contentfiles.detail.html';

                    $scope.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'lg',
                resolve: {
                    taskDetail: function ($q, Restangular, ContentManagementService) {
                        var deferred = $q.defer();

                        var task = {
                            contentFileTask: {
                                objectDetail: contentFile
                            }
                        };

                        ContentManagementService.getContentMetadata(task.contentFileTask.objectDetail.contentId).then(function (contentMetadataResponse) {
                            task.contentFileTask.contentMetadata = contentMetadataResponse;

                            deferred.resolve(task);
                        });

                        return deferred.promise;
                    }
                }
            });

            modalInstance.result.then(function () {
                contentFile.rowSelected = false;
            }, function () {
                contentFile.rowSelected = false;
            });
        };

        $scope.remove = function (contentFile) {
            if ($scope.contentMetadata.status !== 'ACTIVE') {
                return;
            }

            contentFile.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                contentFile.rowSelected = false;

                var contentFileItem = {
                    "from": {
                        "userId": $scope.username,
                        "orgId": $scope.sessionOrganization.name,
                        "groupId": null
                    },
                    "to": {
                        "userId": null,
                        "orgId": null,
                        "groupId": CMPFService.DSP_BUSINESS_ADMIN_GROUP
                    },
                    "contentId": $scope.contentMetadata.id,
                    "fileId": contentFile.id,
                    "fileName": contentFile.fileName,
                    "fileType": contentFile.fileType || 'text'
                };

                $log.debug('Removing content file: ', contentFileItem);

                // Content file delete method of the flow service.
                WorkflowsService.deleteContentFile(contentFileItem).then(function (response) {
                    if (response && response.code === 2001) {
                        $log.debug('Removed content file: ', contentFileItem, ', response: ', response);

                        notification({
                            type: 'success',
                            text: $translate.instant('PartnerInfo.Contents.ContentMetadatas.Messages.ContentFileDeleteFlowStartedSuccessful')
                        });

                        $scope.contentFileList.tableParams.reload();
                    } else {
                        WorkflowsService.showApiError(response);
                    }
                }, function (response) {
                    $log.error('Cannot call the content file delete flow service. Error: ', response);

                    if (response && response.data && response.data.message) {
                        WorkflowsService.showApiError(response);
                    } else {
                        notification({
                            type: 'warning',
                            text: $translate.instant('PartnerInfo.Contents.ContentMetadatas.Messages.ContentFileDeleteFlowError')
                        });
                    }
                });
            }, function () {
                contentFile.rowSelected = false;
            });
        };
    });

    PartnerInfoContentManagementContentMetadatasContentFilesModule.controller('PartnerInfoContentManagementContentMetadatasContentFilesNewCtrl', function ($scope, $log, $controller, $state, $translate, notification, UtilService, CMPFService,
                                                                                                                                                           WorkflowsService, contentMetadata) {
        $log.debug('PartnerInfoContentManagementContentMetadatasContentFilesNewCtrl');

        $controller('PartnerInfoContentManagementContentMetadatasContentFilesCommonCtrl', {
            $scope: $scope,
            contentMetadata: contentMetadata
        });

        $scope.contentFile = {
            file: null
        }

        $scope.save = function (contentFile) {
            var contentFileItem = {
                "from": {
                    "userId": $scope.username,
                    "orgId": $scope.sessionOrganization.name,
                    "groupId": null
                },
                "to": {
                    "userId": null,
                    "orgId": null,
                    "groupId": CMPFService.DSP_BUSINESS_ADMIN_GROUP
                },
                "contentId": $scope.contentMetadata.id,
                "fileName": contentFile.file.name,
                "fileType": contentFile.file.type || 'text'
            };

            $log.debug('Trying to create content file: ', contentFileItem);

            // Content file create method of the flow service.
            WorkflowsService.createContentFile(contentFile.file, contentFileItem).then(function (response) {
                if (response && response.code === 2001) {
                    notification.flash({
                        type: 'success',
                        text: $translate.instant('PartnerInfo.Contents.ContentMetadatas.Messages.ContentFileCreateFlowStartedSuccessful')
                    });

                    $scope.cancel();
                } else {
                    WorkflowsService.showApiError(response);

                }
            }, function (response) {
                $log.error('Cannot call the content file create flow service. Error: ', response);

                if (response && response.data && response.data.message) {
                    WorkflowsService.showApiError(response);
                } else {
                    notification({
                        type: 'warning',
                        text: $translate.instant('PartnerInfo.Contents.ContentMetadatas.Messages.ContentFileCreateFlowError')
                    });
                }
            });
        };
    });

    PartnerInfoContentManagementContentMetadatasContentFilesModule.controller('PartnerInfoContentManagementContentMetadatasContentFilesUpdateCtrl', function ($scope, $log, $controller, $state, $translate, notification, UtilService, CMPFService,
                                                                                                                                                              WorkflowsService, contentMetadata, contentFile) {
        $log.debug('PartnerInfoContentManagementContentMetadatasContentFilesUpdateCtrl');

        $controller('PartnerInfoContentManagementContentMetadatasContentFilesCommonCtrl', {
            $scope: $scope,
            contentMetadata: contentMetadata
        });

        $scope.contentFile = {
            id: contentFile.id,
            file: contentFile.file,
            fileName: contentFile.fileName,
            fileType: contentFile.fileType
        };

        $scope.originalContentFile = angular.copy($scope.contentFile);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalContentFile, $scope.contentFile)
        };

        $scope.save = function (contentFile) {
            var contentFileItem = {
                "from": {
                    "userId": $scope.username,
                    "orgId": $scope.sessionOrganization.name,
                    "groupId": null
                },
                "to": {
                    "userId": null,
                    "orgId": null,
                    "groupId": CMPFService.DSP_BUSINESS_ADMIN_GROUP
                },
                "contentId": $scope.contentMetadata.id,
                "id": $scope.originalContentFile.id,
                // Changed values
                "fileName": contentFile.file.name,
                "fileType": contentFile.file.type || 'text'
            };

            $log.debug('Trying to udpate content file: ', contentFileItem);

            // Content file update method of the flow service.
            WorkflowsService.updateContentFile(contentFile.file, contentFileItem).then(function (response) {
                if (response && response.code === 2001) {
                    notification.flash({
                        type: 'success',
                        text: $translate.instant('PartnerInfo.Contents.ContentMetadatas.Messages.ContentFileUpdateFlowStartedSuccessful')
                    });

                    $scope.cancel();
                } else {
                    WorkflowsService.showApiError(response);
                }
            }, function (response) {
                $log.error('Cannot call the content file update flow service. Error: ', response);

                if (response && response.data && response.data.message) {
                    WorkflowsService.showApiError(response);
                } else {
                    notification({
                        type: 'warning',
                        text: $translate.instant('PartnerInfo.Contents.ContentMetadatas.Messages.ContentFileUpdateFlowError')
                    });
                }
            });
        };
    });

})();
