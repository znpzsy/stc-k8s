(function () {

    'use strict';

    angular.module('adminportal.subsystems.contentmanagement.operations.dsp.contentmetadatas.contentfiles', []);

    var ContentManagementOperationsContentMetadatasContentFilesModule = angular.module('adminportal.subsystems.contentmanagement.operations.dsp.contentmetadatas.contentfiles');

    ContentManagementOperationsContentMetadatasContentFilesModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.contentmanagement.operations.dsp.contentmetadatas.contentfiles', {
            abstract: true,
            url: "/:contentMetadataId/content-files",
            template: '<div ui-view></div>',
            data: {
                exportFileName: 'ContentFiles',
                backState: 'subsystems.contentmanagement.operations.dsp.contentmetadatas.list'
            },
            resolve: {
                contentMetadata: function ($stateParams, ContentManagementService) {
                    return ContentManagementService.getContentMetadata($stateParams.contentMetadataId);
                }
            }
        }).state('subsystems.contentmanagement.operations.dsp.contentmetadatas.contentfiles.list', {
            url: "",
            templateUrl: "subsystems/contentmanagement/operations/dsp/operations.contentmetadatas.contentfiles.html",
            controller: 'ContentManagementOperationsContentMetadatasContentFilesCtrl'
        }).state('subsystems.contentmanagement.operations.dsp.contentmetadatas.contentfiles.new', {
            url: "/new",
            templateUrl: "subsystems/contentmanagement/operations/dsp/operations.contentmetadatas.contentfiles.details.html",
            controller: 'ContentManagementOperationsContentMetadatasContentFilesNewCtrl'
        }).state('subsystems.contentmanagement.operations.dsp.contentmetadatas.contentfiles.update', {
            url: "/update/:id",
            templateUrl: "subsystems/contentmanagement/operations/dsp/operations.contentmetadatas.contentfiles.details.html",
            controller: 'ContentManagementOperationsContentMetadatasContentFilesUpdateCtrl'
        });

    });

    ContentManagementOperationsContentMetadatasContentFilesModule.controller('ContentManagementOperationsContentMetadatasContentFilesCommonCtrl', function ($scope, $log, $state, contentMetadata) {
        $log.debug('ContentManagementOperationsContentMetadatasContentFilesCommonCtrl');

        $scope.contentMetadata = contentMetadata.detail;

        $scope.cancel = function () {
            $state.go('subsystems.contentmanagement.operations.dsp.contentmetadatas.contentfiles.list');
        };
    });

    ContentManagementOperationsContentMetadatasContentFilesModule.controller('ContentManagementOperationsContentMetadatasContentFilesCtrl', function ($rootScope, $scope, $log, $state, $stateParams, $timeout, $filter, $uibModal, $translate, notification, contentMetadata, NgTableParams,
                                                                                                                                                      CMPFService, SessionService, WorkflowsService, ContentManagementService, DEFAULT_REST_QUERY_LIMIT) {
        $log.debug('ContentManagementOperationsContentMetadatasContentFilesCtrl');

        var sessionOrganization = SessionService.getSessionOrganization();
        var username = SessionService.getUsername();

        $scope.contentMetadata = contentMetadata.detail;

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'id',
                    headerKey: 'Subsystems.ContentManagement.Operations.ContentMetadatas.ManageContentFiles.FileId'
                },
                {
                    fieldName: 'fileName',
                    headerKey: 'Subsystems.ContentManagement.Operations.ContentMetadatas.ManageContentFiles.FileName'
                },
                {
                    fieldName: 'fileType',
                    headerKey: 'Subsystems.ContentManagement.Operations.ContentMetadatas.ManageContentFiles.FileType'
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
                        "isAdmin": $rootScope.isAdminUser,
                        "userId": username,
                        "orgId": sessionOrganization.name,
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
                            text: $translate.instant('Subsystems.ContentManagement.Operations.ContentMetadatas.Messages.ContentFileDeleteFlowStartedSuccessful' + ($rootScope.isAdminUser ? 'ForAdmin' : ''))
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
                            text: $translate.instant('Subsystems.ContentManagement.Operations.ContentMetadatas.Messages.ContentFileDeleteFlowError')
                        });
                    }
                });
            }, function () {
                contentFile.rowSelected = false;
            });
        };
    });

    ContentManagementOperationsContentMetadatasContentFilesModule.controller('ContentManagementOperationsContentMetadatasContentFilesNewCtrl', function ($rootScope, $scope, $log, $controller, $state, $translate, notification, UtilService, CMPFService,
                                                                                                                                                         SessionService, WorkflowsService, contentMetadata) {
        $log.debug('ContentManagementOperationsContentMetadatasContentFilesNewCtrl');

        $controller('ContentManagementOperationsContentMetadatasContentFilesCommonCtrl', {
            $scope: $scope,
            contentMetadata: contentMetadata
        });

        var sessionOrganization = SessionService.getSessionOrganization();
        var username = SessionService.getUsername();

        $scope.contentFile = {
            file: null
        }

        $scope.save = function (contentFile) {
            var contentFileItem = {
                "from": {
                    "isAdmin": $rootScope.isAdminUser,
                    "userId": username,
                    "orgId": sessionOrganization.name,
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
                        text: $translate.instant('Subsystems.ContentManagement.Operations.ContentMetadatas.Messages.ContentFileCreateFlowStartedSuccessful' + ($rootScope.isAdminUser ? 'ForAdmin' : ''))
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
                        text: $translate.instant('Subsystems.ContentManagement.Operations.ContentMetadatas.Messages.ContentFileCreateFlowError')
                    });
                }
            });
        };
    });

    ContentManagementOperationsContentMetadatasContentFilesModule.controller('ContentManagementOperationsContentMetadatasContentFilesUpdateCtrl', function ($rootScope, $scope, $log, $controller, $state, $stateParams, $translate, notification, UtilService, CMPFService,
                                                                                                                                                            ContentManagementService, SessionService, WorkflowsService, FileDownloadService, contentMetadata) {
        $log.debug('ContentManagementOperationsContentMetadatasContentFilesUpdateCtrl');

        $controller('ContentManagementOperationsContentMetadatasContentFilesCommonCtrl', {
            $scope: $scope,
            contentMetadata: contentMetadata
        });

        var sessionOrganization = SessionService.getSessionOrganization();
        var username = SessionService.getUsername();

        $scope.contentFile = {
            id: $stateParams.id,
            file: {name: undefined}
        };

        // Get the content metadata file by id value.
        var srcUrl = ContentManagementService.generateContentMetadataFilePath($scope.contentFile.id);
        FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
            $scope.contentFile.file = blob;
            if (blob) {
                $scope.contentFile.file.name = fileName;
                $scope.contentFile.fileName = fileName;
                $scope.contentFile.fileType = blob.type;
            }
            $scope.originalContentFile = angular.copy($scope.contentFile);
        });

        $scope.originalContentFile = angular.copy($scope.contentFile);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalContentFile, $scope.contentFile)
        };

        $scope.save = function (contentFile) {
            var contentFileItem = {
                "from": {
                    "isAdmin": $rootScope.isAdminUser,
                    "userId": username,
                    "orgId": sessionOrganization.name,
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
                        text: $translate.instant('Subsystems.ContentManagement.Operations.ContentMetadatas.Messages.ContentFileUpdateFlowStartedSuccessful' + ($rootScope.isAdminUser ? 'ForAdmin' : ''))
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
                        text: $translate.instant('Subsystems.ContentManagement.Operations.ContentMetadatas.Messages.ContentFileUpdateFlowError')
                    });
                }
            });
        };
    });

})();
