(function () {

    'use strict';

    angular.module('partnerportal.partner-info.operations.dsp.contentmetadatas', [
        'partnerportal.partner-info.operations.dsp.contentmetadatas.contentfiles',
        'partnerportal.partner-info.operations.dsp.contentmetadatas.copyrightfile'
    ]);

    var PartnerInfoContentManagementContentMetadatasModule = angular.module('partnerportal.partner-info.operations.dsp.contentmetadatas');

    PartnerInfoContentManagementContentMetadatasModule.config(function ($stateProvider) {

        $stateProvider.state('partner-info.operations.dsp.contentmetadatas', {
            abstract: true,
            url: "/content-metadata",
            template: "<div ui-view></div>",
            data: {
                exportFileName: 'Contents',
                permissions: [
                    'PRM__CONTENT_READ'
                ]
            },
            resolve: {
                contentCategories: function (ContentManagementService) {
                    return ContentManagementService.getContentCategories();
                },
                contentTypes: function (ContentManagementService) {
                    return ContentManagementService.getContentTypes();
                },
                services: function ($rootScope, CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    var organizationId = $rootScope.getOrganizationId();

                    return CMPFService.getServicesByOrganizationId(organizationId, true);
                }
            }
        }).state('partner-info.operations.dsp.contentmetadatas.list', {
            url: "",
            templateUrl: "partner-info/content/dsp/operations.contentmetadatas.html",
            controller: 'PartnerInfoContentManagementContentMetadatasCtrl'
        });

        // New
        $stateProvider.state('partner-info.operations.dsp.contentmetadatas.new', {
            url: "/new",
            templateUrl: "partner-info/content/dsp/operations.contentmetadatas.details.html",
            controller: 'PartnerInfoContentManagementContentMetadatasNewCtrl',
            data: {
                cancelState: "partner-info.operations.dsp.contentmetadatas.list"
            },
            resolve: {
                contentMetadata: function () {
                    return null;
                }
            }
        }).state('partner-info.operations.dsp.contentmetadatas.resendcreatetask', {
            url: "/resend-create/:id",
            templateUrl: "partner-info/content/dsp/operations.contentmetadatas.details.html",
            controller: 'PartnerInfoContentManagementContentMetadatasNewCtrl',
            data: {
                cancelState: {url: "workflows.operations.tasks", params: {taskStatus: 'rejected'}}
            },
            resolve: {
                contentMetadata: function ($stateParams, $q, WorkflowsService) {
                    var deferred = $q.defer();

                    WorkflowsService.getContentMetadata($stateParams.id).then(function (contentMetadataResponse) {
                        deferred.resolve(contentMetadataResponse.objectDetail);
                    }, function (errorResponse) {
                        deferred.reject(errorResponse);
                    });

                    return deferred.promise;
                }
            }
        });

        // Update
        $stateProvider.state('partner-info.operations.dsp.contentmetadatas.update', {
            url: "/update/:id",
            templateUrl: "partner-info/content/dsp/operations.contentmetadatas.details.html",
            controller: 'PartnerInfoContentManagementContentMetadatasUpdateCtrl',
            data: {
                cancelState: "partner-info.operations.dsp.contentmetadatas.list"
            },
            resolve: {
                contentMetadata: function ($stateParams, ContentManagementService) {
                    return ContentManagementService.getContentMetadata($stateParams.id);
                }
            }
        }).state('partner-info.operations.dsp.contentmetadatas.resendupdatetask', {
            url: "/resend-update/:id",
            templateUrl: "partner-info/content/dsp/operations.contentmetadatas.details.html",
            controller: 'PartnerInfoContentManagementContentMetadatasUpdateCtrl',
            data: {
                cancelState: {url: "workflows.operations.tasks", params: {taskStatus: 'rejected'}}
            },
            resolve: {
                contentMetadata: function ($stateParams, $q, WorkflowsService) {
                    var deferred = $q.defer();

                    WorkflowsService.getContentMetadata($stateParams.id).then(function (contentMetadataResponse) {
                        deferred.resolve({
                            detail: contentMetadataResponse.objectDetail
                        });
                    }, function (errorResponse) {
                        deferred.reject(errorResponse);
                    });

                    return deferred.promise;
                }
            }
        });

    });

    PartnerInfoContentManagementContentMetadatasModule.controller('PartnerInfoContentManagementContentMetadatasCommonCtrl', function ($scope, $log, $state, $filter, $uibModal, $controller, SessionService, contentCategories,
                                                                                                                                      contentTypes, services, CMS_STATUS_TYPES, PROVISIONING_LANGUAGES) {
        $log.debug('PartnerInfoContentManagementContentMetadatasCommonCtrl');

        $controller('GenericDateTimeCtrl', {$scope: $scope});

        $scope.sessionOrganization = SessionService.getSessionOrganization();
        $scope.username = SessionService.getUsername();

        $scope.contentCategoryList = contentCategories.detail;
        _.each($scope.contentCategoryList, function (contentCategory) {
            var foundContentCategory = _.findWhere($scope.contentCategoryList, {id: contentCategory.parent});
            if (foundContentCategory) {
                contentCategory.title = foundContentCategory.title + ' - ' + contentCategory.title;
            }
        });
        $scope.contentCategoryList = $filter('orderBy')($scope.contentCategoryList, ['title']);

        $scope.contentTypeList = contentTypes.detail;
        $scope.contentTypeList = $filter('orderBy')($scope.contentTypeList, 'name');

        $scope.serviceList = services.services;
        $scope.serviceList = $filter('orderBy')($scope.serviceList, ['name']);

        $scope.CMS_STATUS_TYPES = CMS_STATUS_TYPES;
        $scope.PROVISIONING_LANGUAGES = PROVISIONING_LANGUAGES;

        $scope.cancel = function () {
            if ($state.current.data.cancelState.url) {
                $state.go($state.current.data.cancelState.url, $state.current.data.cancelState.params);
            } else {
                $state.go($state.current.data.cancelState);
            }
        };

        // Call the copyright file controller so it could be mixed with this controller.
        $controller('PartnerInfoContentManagementContentMetadatasCopyrightFileCtrl', {$scope: $scope});
    });

    PartnerInfoContentManagementContentMetadatasModule.controller('PartnerInfoContentManagementContentMetadatasCtrl', function ($scope, $log, $filter, $controller, $uibModal, $translate, notification, NgTableParams, NgTableService,
                                                                                                                                Restangular, SessionService, WorkflowsService, DEFAULT_REST_QUERY_LIMIT, ContentManagementService,
                                                                                                                                CMPFService, DateTimeConstants, contentCategories, contentTypes, services) {
        $log.debug('PartnerInfoContentManagementContentMetadatasCtrl');

        $controller('PartnerInfoContentManagementContentMetadatasCommonCtrl', {
            $scope: $scope,
            contentCategories: contentCategories,
            contentTypes: contentTypes,
            services: services
        });

        $scope.filter = {};

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'id',
                    headerKey: 'PartnerInfo.Contents.ContentMetadatas.Id'
                },
                {
                    fieldName: 'name',
                    headerKey: 'PartnerInfo.Contents.ContentMetadatas.Name'
                },
                {
                    fieldName: 'description',
                    headerKey: 'CommonLabels.Description'
                },
                {
                    fieldName: 'status',
                    headerKey: 'CommonLabels.State'
                },
                {
                    fieldName: 'dateLaunch',
                    headerKey: 'GenericFormFields.StartDate.Label',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'dateExpiry',
                    headerKey: 'GenericFormFields.EndDate.Label',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'dateCreated',
                    headerKey: 'CommonLabels.CreatedOn',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'userCreated',
                    headerKey: 'CommonLabels.CreatedBy'
                },
                {
                    fieldName: 'dateUpdated',
                    headerKey: 'CommonLabels.UpdatedOn',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'userUpdated',
                    headerKey: 'CommonLabels.UpdatedBy'
                }
            ]
        };

        // Content metadata list
        $scope.contentMetadataList = {
            list: [],
            showTable: true,
            tableParams: {}
        };

        $scope.contentMetadataList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "id": 'asc'
            }
        }, {
            $scope: $scope,
            getData: function ($defer, params) {
                var preparedFilter = $scope.prepareFilter($scope.filter, params);

                var filter = preparedFilter.filter;

                if (params.settings().$scope.justReloadTheTableWithTheList) {
                    var orderedData = params.sorting() ? $filter('orderBy')($scope.contentMetadataList.list, params.orderBy()) : $scope.contentMetadataList.list;
                    params.total(orderedData.length); // set total for recalc pagination
                    if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                        params.page(params.page() - 1);
                    }

                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));

                    // Hide the filter form.
                    $scope.filterFormLayer.isFilterFormOpen = false;

                    $scope.contentMetadataList.showTable = true;
                } else {
                    ContentManagementService.getContentMetadatas(filter).then(function (response) {
                        if (response && response.detail) {
                            $scope.contentMetadataList.list = response.detail.contentList;

                            _.each($scope.contentMetadataList.list, function (contentMetadata) {
                                contentMetadata.organization = $scope.sessionOrganization;

                                var foundService = _.findWhere($scope.serviceList, {id: Number(contentMetadata.serviceId)});
                                if (foundService) {
                                    contentMetadata.service = foundService;
                                } else {
                                    contentMetadata.service = {
                                        name: 'N/A'
                                    };
                                }
                            });

                            // Hide the filter form.
                            $scope.filterFormLayer.isFilterFormOpen = false;

                            $scope.contentMetadataList.showTable = true;

                            params.total(response.detail.totalCount);
                            $defer.resolve($scope.contentMetadataList.list);
                        } else {
                            // Hide the filter form.
                            $scope.filterFormLayer.isFilterFormOpen = false;

                            $scope.contentMetadataList.showTable = true;

                            params.total(0);
                            $defer.resolve([]);
                        }
                    }, function (response) {
                        $log.debug('Cannot read content metadata records. Error: ', response);

                        // Hide the filter form.
                        $scope.filterFormLayer.isFilterFormOpen = false;

                        $scope.contentMetadataList.showTable = true;

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
        // END - Content metadata list

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

        $scope.prepareFilter = function (filter, tableParams) {
            var result = {};

            result.filter = {
                orgId: $scope.sessionOrganization.id,
                // Filtered values
                categoryId: filter.categoryId || undefined,
                language: filter.language || undefined,
                type: filter.type || undefined,
                label: filter.label || undefined,
                keyword: filter.keyword || undefined,
                serviceId: filter.serviceId || undefined
            };

            if (tableParams) {
                //result.filter.sortFieldName = s.words(tableParams.orderBy()[0], /\-|\+/)[0];
                //result.filter.sortOrder = s.include(tableParams.orderBy()[0], '+') ? '"asc"' : '"desc"';
                result.filter.page = tableParams.page() - 1;
                result.filter.size = tableParams.count();

                if (tableParams.settings().$scope.stateFilter && tableParams.settings().$scope.stateFilter !== 'ALL') {
                    result.filter.status = tableParams.settings().$scope.stateFilter;
                } else {
                    delete result.filter.status;
                }
            }

            return result;
        };

        $scope.throttledReloadTable = _.throttle(function () {
            $scope.reloadTable($scope.contentMetadataList.tableParams);
        }, 500);

        $scope.filterTable = _.debounce(function (text, columns) {
            $scope.contentMetadataList.tableParams.settings().$scope.quickSearchText = text;
            $scope.contentMetadataList.tableParams.settings().$scope.quickSearchColumns = columns;

            $scope.reloadTable($scope.contentMetadataList.tableParams);
        }, 500);

        $scope.stateFilter = 'ALL';
        $scope.stateFilterChange = _.debounce(function (state) {
            if (state !== 'ALL') {
                if (state === 'WAITING') {
                    $scope.contentMetadataList.list = [];
                    WorkflowsService.getPendingTasks(0, DEFAULT_REST_QUERY_LIMIT, 'CONTENT_METADATA').then(function (waitingContentMetadataTasks) {
                        if (waitingContentMetadataTasks && waitingContentMetadataTasks.length > 0) {
                            _.each(waitingContentMetadataTasks, function (contentMetadataTask) {
                                if (contentMetadataTask && contentMetadataTask.name && (contentMetadataTask.name.toLowerCase() === 'content create task')) {
                                    contentMetadataTask.objectDetail.taskObjectId = contentMetadataTask.contentMetadataId;
                                    contentMetadataTask.objectDetail.status = 'WAITING FOR APPROVAL';
                                    contentMetadataTask.objectDetail.taskName = contentMetadataTask.name;

                                    var foundService = _.findWhere($scope.serviceList, {id: Number(contentMetadataTask.objectDetail.serviceId)});
                                    if (foundService) {
                                        contentMetadataTask.objectDetail.service = foundService;
                                    } else {
                                        contentMetadataTask.objectDetail.service = {
                                            name: 'N/A'
                                        };
                                    }

                                    $scope.contentMetadataList.list.push(contentMetadataTask.objectDetail);
                                }
                            });
                        }

                        $scope.contentMetadataList.tableParams.settings().$scope.justReloadTheTableWithTheList = true;
                        $scope.contentMetadataList.tableParams.page(1);
                        $scope.contentMetadataList.tableParams.reload();
                    });
                } else {
                    $scope.contentMetadataList.tableParams.settings().$scope.justReloadTheTableWithTheList = false;

                    $scope.contentMetadataList.tableParams.settings().$scope.stateFilter = state;
                    $scope.reloadTable($scope.contentMetadataList.tableParams);
                }
            } else {
                $scope.contentMetadataList.tableParams.settings().$scope.stateFilter = 'ALL';

                $scope.contentMetadataList.tableParams.settings().$scope.justReloadTheTableWithTheList = false;

                $scope.reloadTable($scope.contentMetadataList.tableParams);
            }
        }, 500);

        // Task details modal window.
        $scope.showTaskDetails = function (contentMetadata) {
            contentMetadata.rowSelected = true;

            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'partials/modal/empty.modal.html',
                controller: function ($scope, $controller, $uibModalInstance, services, contentCategories, contentTypes, taskDetail) {
                    $controller('WorkflowsOperationsTasksDetailContentMetadataCtrl', {
                        $scope: $scope,
                        services: services,
                        contentCategories: contentCategories,
                        contentTypes: contentTypes,
                        taskDetail: taskDetail
                    });

                    $scope.isModal = true;
                    $scope.modalTitle = contentMetadata.taskName;
                    $scope.templateUrl = 'workflows/operations/operations.tasks.contentmetadatas.detail.html';

                    $scope.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'lg',
                resolve: {
                    services: function ($rootScope, CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        var organizationId = $rootScope.getOrganizationId();

                        return CMPFService.getServicesByOrganizationId(organizationId, true);
                    },
                    contentCategories: function (ContentManagementService) {
                        return ContentManagementService.getContentCategories();
                    },
                    contentTypes: function (ContentManagementService) {
                        return ContentManagementService.getContentTypes();
                    },
                    taskDetail: function () {
                        return {
                            contentMetadataTask: {
                                objectDetail: contentMetadata
                            }
                        };
                    }
                }
            });

            modalInstance.result.then(function () {
                contentMetadata.rowSelected = false;
            }, function () {
                contentMetadata.rowSelected = false;
            });
        };

        $scope.remove = function (contentMetadata) {
            contentMetadata.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                contentMetadata.rowSelected = false;

                var currentDateTime = new Date();

                var contentMetadataItem = {
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
                    "id": contentMetadata.id,
                    "orgId": $scope.sessionOrganization.id,
                    // Details attributes
                    "userCreated": contentMetadata.userCreated,
                    "dateCreated": contentMetadata.dateCreated,
                    "name": contentMetadata.name,
                    "description": contentMetadata.description,
                    "status": contentMetadata.status,
                    "author": contentMetadata.author,
                    "businessType": contentMetadata.businessType,
                    "label": contentMetadata.label,
                    "language": contentMetadata.language,
                    "categoryId": contentMetadata.categoryId,
                    "type": contentMetadata.type,
                    "serviceId": contentMetadata.serviceId,
                    "detail": contentMetadata.detail,
                    "keywords": contentMetadata.keywords,
                    "iconId": contentMetadata.iconId,
                    "copyrightFiles": contentMetadata.copyrightFiles,
                    "dateLaunch": contentMetadata.dateLaunch,
                    "dateExpiry": contentMetadata.dateExpiry,
                    "userUpdated": $scope.username,
                    "dateUpdated": $filter('date')(currentDateTime, 'yyyy-MM-dd\'T\'HH:mm:ss' + DateTimeConstants.OFFSET)
                };

                $log.debug('Removing content: ', contentMetadataItem);

                // Content metadata delete method of the flow service.
                WorkflowsService.deleteContentMetadata(contentMetadataItem).then(function (response) {
                    if (response && response.code === 2001) {
                        $log.debug('Removed content metadata: ', contentMetadataItem, ', response: ', response);

                        notification.flash({
                            type: 'success',
                            text: $translate.instant('PartnerInfo.Contents.ContentMetadatas.Messages.ContentDeleteFlowStartedSuccessful')
                        });

                        $state.transitionTo($state.current, {}, {reload: true, inherit: true, notify: true});
                    } else {
                        WorkflowsService.showApiError(response);
                    }
                }, function (response) {
                    $log.error('Cannot call the content metadata delete flow service. Error: ', response);

                    if (response && response.data && response.data.message) {
                        WorkflowsService.showApiError(response);
                    } else {
                        notification({
                            type: 'warning',
                            text: $translate.instant('PartnerInfo.Contents.ContentMetadatas.Messages.ContentDeleteFlowError')
                        });
                    }
                });
            }, function () {
                contentMetadata.rowSelected = false;
            });
        };
    });

    PartnerInfoContentManagementContentMetadatasModule.controller('PartnerInfoContentManagementContentMetadatasNewCtrl', function ($scope, $log, $controller, $q, $filter, $translate, notification, UtilService, CMPFService, ContentManagementService,
                                                                                                                                   WorkflowsService, SessionService, DateTimeConstants, contentCategories, contentTypes, services, contentMetadata) {
        $log.debug('PartnerInfoContentManagementContentMetadatasNewCtrl');

        $controller('PartnerInfoContentManagementContentMetadatasCommonCtrl', {
            $scope: $scope,
            contentCategories: contentCategories,
            contentTypes: contentTypes,
            services: services
        });

        $scope.contentMetadata = {
            name: null,
            status: 'ACTIVE',
            contentInfo: {},
            contentTemplate: {}
        };

        $scope.dateHolder.startDate = null;
        $scope.dateHolder.endDate = null;

        // If coming here from the create task page for resending the form with little updates for create again.
        if (contentMetadata) {
            $controller('PartnerInfoContentManagementContentMetadatasUpdateCtrl', {
                $scope: $scope,
                contentCategories: contentCategories,
                contentTypes: contentTypes,
                services: services,
                contentMetadata: contentMetadata
            });
        }

        $scope.save = function (contentMetadata) {
            var currentDateTime = new Date();

            var contentMetadataItem = {
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
                "orgId": $scope.sessionOrganization.id,
                "status": 'ACTIVE',
                "businessType": 'WAP_WEB',
                // Changed values
                "name": contentMetadata.name,
                "description": contentMetadata.description,
                "iconId": null,
                "copyrightFiles": [],
                "author": '',
                "label": contentMetadata.contentTemplate.label,
                "language": contentMetadata.contentTemplate.language,
                "categoryId": contentMetadata.contentTemplate.contentCategory,
                "type": contentMetadata.contentTemplate.contentType,
                "serviceId": contentMetadata.contentTemplate.service,
                "detail": [
                    {
                        "lang": 'en',
                        "title": contentMetadata.contentInfo.titleen,
                        "description": contentMetadata.contentInfo.descriptionen,
                        "searchKeyword": contentMetadata.contentInfo.searchkeyworden
                    },
                    {
                        "lang": 'ar',
                        "title": contentMetadata.contentInfo.titlear,
                        "description": contentMetadata.contentInfo.descriptionar,
                        "searchKeyword": contentMetadata.contentInfo.searchkeywordar
                    }
                ],
                "dateLaunch": ($scope.dateHolder.startDate ? $filter('date')($scope.dateHolder.startDate, 'yyyy-MM-dd') + 'T00:00:00' : ''),
                "dateExpiry": ($scope.dateHolder.endDate ? $filter('date')($scope.dateHolder.endDate, 'yyyy-MM-dd') + 'T00:00:00' : ''),
                "userCreated": $scope.username,
                "userUpdated": $scope.username,
                "dateCreated": $filter('date')(currentDateTime, 'yyyy-MM-dd\'T\'HH:mm:ss' + DateTimeConstants.OFFSET),
                "dateUpdated": $filter('date')(currentDateTime, 'yyyy-MM-dd\'T\'HH:mm:ss' + DateTimeConstants.OFFSET)
            };

            var webIconFile;
            // iconId
            if (contentMetadata.contentInfo.webIconFile && contentMetadata.contentInfo.webIconFile.name) {
                contentMetadataItem.iconId = UtilService.generateObjectId();
                webIconFile = contentMetadata.contentInfo.webIconFile;
            }

            // CopyrightFile
            if (contentMetadata.copyrightFileList && contentMetadata.copyrightFileList.length > 0) {
                angular.forEach(contentMetadata.copyrightFileList, function (copyrightFile) {
                    copyrightFile.fileId = UtilService.generateObjectId();

                    contentMetadataItem.copyrightFiles.push({
                        "id": copyrightFile.fileId,
                        "startDate": (copyrightFile.startDate ? $filter('date')(copyrightFile.startDate, 'yyyy-MM-dd') + 'T00:00:00' : ''),
                        "endDate": (copyrightFile.endDate ? $filter('date')(copyrightFile.endDate, 'yyyy-MM-dd') + 'T00:00:00' : '')
                    });
                });
            }


            $log.debug('Trying to create content metadata: ', contentMetadataItem);

            // Content Metadata create method of the flow service.
            WorkflowsService.createContentMetadata(contentMetadataItem).then(function (response) {
                if (response && response.code === 2001) {
                    $log.debug('Save Success. Response: ', response);

                    var promises = [];

                    if (webIconFile && webIconFile.name) {
                        promises.push(ContentManagementService.uploadFile(webIconFile, webIconFile.name, contentMetadataItem.iconId));
                    }

                    _.each(contentMetadata.copyrightFileList, function (copyrightFile) {
                        if (copyrightFile.copyrightFile && copyrightFile.copyrightFile.name) {
                            promises.push(ContentManagementService.uploadFile(copyrightFile.copyrightFile, copyrightFile.copyrightFile.name, copyrightFile.fileId));
                        }
                    });

                    $q.all(promises).then(function () {
                        notification.flash({
                            type: 'success',
                            text: $translate.instant('PartnerInfo.Contents.ContentMetadatas.Messages.ContentCreateFlowStartedSuccessful')
                        });

                        $scope.cancel();
                    });
                } else {
                    WorkflowsService.showApiError(response);
                }
            }, function (response) {
                $log.error('Cannot call the content metadata create flow service. Error: ', response);

                if (response && response.data && response.data.message) {
                    WorkflowsService.showApiError(response);
                } else {
                    notification({
                        type: 'warning',
                        text: $translate.instant('PartnerInfo.Contents.ContentMetadatas.Messages.ContentCreateFlowError')
                    });
                }
            });
        };
    });

    PartnerInfoContentManagementContentMetadatasModule.controller('PartnerInfoContentManagementContentMetadatasUpdateCtrl', function ($scope, $log, $controller, $q, $filter, $translate, notification, UtilService, CMPFService, ContentManagementService,
                                                                                                                                      WorkflowsService, FileDownloadService, SessionService, DateTimeConstants, contentCategories, contentTypes, services,
                                                                                                                                      contentMetadata) {
        $log.debug('PartnerInfoContentManagementContentMetadatasUpdateCtrl');

        $controller('PartnerInfoContentManagementContentMetadatasCommonCtrl', {
            $scope: $scope,
            contentCategories: contentCategories,
            contentTypes: contentTypes,
            services: services
        });

        var contentMetadataMetadata = contentMetadata.detail;

        $scope.contentMetadata = {
            id: contentMetadataMetadata.id,
            orgId: $scope.sessionOrganization.id,
            organization: $scope.sessionOrganization,
            userCreated: contentMetadataMetadata.userCreated,
            dateCreated: contentMetadataMetadata.dateCreated,
            name: contentMetadataMetadata.name,
            description: contentMetadataMetadata.description,
            status: contentMetadataMetadata.status,
            author: contentMetadataMetadata.author,
            businessType: contentMetadataMetadata.businessType,
            copyrightFiles: contentMetadataMetadata.copyrightFiles,
            contentInfo: {},
            contentTemplate: {
                label: contentMetadataMetadata.label,
                language: contentMetadataMetadata.language,
                contentCategory: contentMetadataMetadata.categoryId,
                contentType: contentMetadataMetadata.type,
                service: contentMetadataMetadata.serviceId
            },
            userUpdated: contentMetadataMetadata.userUpdated,
            dateUpdated: contentMetadataMetadata.dateUpdated
        };

        var detailEn = _.findWhere(contentMetadataMetadata.detail, {lang: 'en'});
        if (detailEn) {
            $scope.contentMetadata.contentInfo.titleen = detailEn.title;
            $scope.contentMetadata.contentInfo.descriptionen = detailEn.description;
            $scope.contentMetadata.contentInfo.searchkeyworden = detailEn.searchKeyword;
        }
        var detailAr = _.findWhere(contentMetadataMetadata.detail, {lang: 'ar'});
        if (detailAr) {
            $scope.contentMetadata.contentInfo.titlear = detailAr.title;
            $scope.contentMetadata.contentInfo.descriptionar = detailAr.description;
            $scope.contentMetadata.contentInfo.searchkeywordar = detailAr.searchKeyword;
        }

        $scope.dateHolder = {
            startDate: (contentMetadataMetadata.dateLaunch ? new Date(moment(contentMetadataMetadata.dateLaunch).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss')) : ''),
            endDate: new Date(moment(contentMetadataMetadata.dateExpiry).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss'))
        };

        // Get the WEBIcon by id value.
        $scope.contentMetadata.contentInfo.webIconFile = {name: undefined};
        if (contentMetadataMetadata.iconId) {
            var srcUrl = ContentManagementService.generateFilePath(contentMetadataMetadata.iconId);
            FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                $scope.contentMetadata.contentInfo.webIconFile = blob;
                if (blob) {
                    $scope.contentMetadata.contentInfo.webIconFile.name = fileName;
                }
                $scope.originalContentMetadata = angular.copy($scope.contentMetadata);
            });
        }

        $scope.contentMetadata.copyrightFileList = [];
        if ($scope.contentMetadata.copyrightFiles && $scope.contentMetadata.copyrightFiles.length > 0) {
            _.each($scope.contentMetadata.copyrightFiles, function (copyrightFile) {
                var copyrightFileItem = {};

                copyrightFileItem.id = _.uniqueId();
                copyrightFileItem.copyrightFile = {name: undefined};
                copyrightFileItem.fileId = copyrightFile.id;

                if (copyrightFile.startDate) {
                    copyrightFileItem.startDate = new Date(moment(copyrightFile.startDate).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss'));
                } else {
                    copyrightFileItem.startDate = moment().startOf('day').toDate();
                }
                if (copyrightFile.endDate) {
                    copyrightFileItem.endDate = new Date(moment(copyrightFile.endDate).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss'));
                } else {
                    copyrightFileItem.endDate = moment().endOf('day').add(1, 'years').toDate();
                }

                // Get the CopyrightFile by id value.
                var srcUrl = ContentManagementService.generateFilePath(copyrightFileItem.fileId);
                FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                    copyrightFileItem.copyrightFile = blob;
                    if (blob) {
                        copyrightFileItem.copyrightFile.name = fileName;
                    }

                    $scope.originalContentMetadata = angular.copy($scope.contentMetadata);
                    $scope.contentMetadata.copyrightFileList = $filter('orderBy')($scope.contentMetadata.copyrightFileList, ['copyrightFile.name']);
                });

                $scope.contentMetadata.copyrightFileList.push(copyrightFileItem);
            });
        }

        $scope.originalContentMetadata = angular.copy($scope.contentMetadata);
        $scope.originalDateHolder = angular.copy($scope.dateHolder);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalContentMetadata, $scope.contentMetadata) &&
                angular.equals($scope.dateHolder, $scope.originalDateHolder);
        };

        $scope.save = function (contentMetadata) {
            var currentDateTime = new Date();

            // Workflows special content metadata object
            var contentMetadataItem = {
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
                "userCreated": $scope.originalContentMetadata.userCreated,
                "dateCreated": $scope.originalContentMetadata.dateCreated,
                "id": $scope.originalContentMetadata.id,
                "orgId": $scope.sessionOrganization.id,
                // Changed values
                "iconId": null,
                "copyrightFiles": [],
                "name": contentMetadata.name,
                "description": contentMetadata.description,
                "status": contentMetadata.status,
                "author": contentMetadata.author,
                "businessType": contentMetadata.businessType,
                "label": contentMetadata.contentTemplate.label,
                "language": contentMetadata.contentTemplate.language,
                "categoryId": contentMetadata.contentTemplate.contentCategory,
                "type": contentMetadata.contentTemplate.contentType,
                "serviceId": contentMetadata.contentTemplate.service,
                "detail": [
                    {
                        "lang": 'en',
                        "title": contentMetadata.contentInfo.titleen,
                        "description": contentMetadata.contentInfo.descriptionen,
                        "searchKeyword": contentMetadata.contentInfo.searchkeyworden
                    },
                    {
                        "lang": 'ar',
                        "title": contentMetadata.contentInfo.titlear,
                        "description": contentMetadata.contentInfo.descriptionar,
                        "searchKeyword": contentMetadata.contentInfo.searchkeywordar
                    }
                ],
                "dateLaunch": ($scope.dateHolder.startDate ? $filter('date')($scope.dateHolder.startDate, 'yyyy-MM-dd') + 'T00:00:00' : ''),
                "dateExpiry": ($scope.dateHolder.endDate ? $filter('date')($scope.dateHolder.endDate, 'yyyy-MM-dd') + 'T00:00:00' : ''),
                "userUpdated": $scope.username,
                "dateUpdated": $filter('date')(currentDateTime, 'yyyy-MM-dd\'T\'HH:mm:ss' + DateTimeConstants.OFFSET)
            };

            var webIconFile;
            // iconId
            webIconFile = contentMetadata.contentInfo.webIconFile;
            if (!webIconFile || (webIconFile && !webIconFile.name)) {
                contentMetadataItem.iconId = '';
            } else if (webIconFile instanceof File && !contentMetadata.iconId) {
                contentMetadataItem.iconId = UtilService.generateObjectId();
            }

            // CopyrightFile
            if (contentMetadata.copyrightFileList && contentMetadata.copyrightFileList.length > 0) {
                angular.forEach(contentMetadata.copyrightFileList, function (copyrightFile) {
                    if (!copyrightFile.copyrightFile || (copyrightFile.copyrightFile && !copyrightFile.copyrightFile.name)) {
                        copyrightFile.fileId = null;
                    } else if (copyrightFile.copyrightFile instanceof File && !copyrightFile.fileId) {
                        copyrightFile.fileId = UtilService.generateObjectId();
                    }

                    contentMetadataItem.copyrightFiles.push({
                        "id": copyrightFile.fileId,
                        "startDate": (copyrightFile.startDate ? $filter('date')(copyrightFile.startDate, 'yyyy-MM-dd') + 'T00:00:00' : ''),
                        "endDate": (copyrightFile.endDate ? $filter('date')(copyrightFile.endDate, 'yyyy-MM-dd') + 'T00:00:00' : '')
                    });
                });
            }

            $log.debug('Trying to update content metadata: ', contentMetadataItem);

            // Content Metadata update method of the flow service.
            WorkflowsService.updateContentMetadata(contentMetadataItem).then(function (response) {
                if (response && response.code === 2001) {
                    $log.debug('Save Success. Response: ', response);

                    var promises = [];

                    if (webIconFile && webIconFile.name && (webIconFile instanceof File)) {
                        promises.push(ContentManagementService.uploadFile(webIconFile, webIconFile.name, contentMetadataItem.iconId));
                    }

                    _.each(contentMetadata.copyrightFileList, function (copyrightFile) {
                        if (copyrightFile.copyrightFile && copyrightFile.copyrightFile.name && (copyrightFile.copyrightFile instanceof File)) {
                            promises.push(ContentManagementService.uploadFile(copyrightFile.copyrightFile, copyrightFile.copyrightFile.name, copyrightFile.fileId));
                        }
                    });

                    $q.all(promises).then(function () {
                        notification.flash({
                            type: 'success',
                            text: $translate.instant('PartnerInfo.Contents.ContentMetadatas.Messages.ContentUpdateFlowStartedSuccessful')
                        });

                        $scope.cancel();
                    });
                } else {
                    WorkflowsService.showApiError(response);
                }
            }, function (response) {
                $log.error('Cannot call the content metadata update flow service. Error: ', response);

                if (response && response.data && response.data.message) {
                    WorkflowsService.showApiError(response);
                } else {
                    notification({
                        type: 'warning',
                        text: $translate.instant('PartnerInfo.Contents.ContentMetadatas.Messages.ContentUpdateFlowError')
                    });
                }
            });
        };
    });

})();
