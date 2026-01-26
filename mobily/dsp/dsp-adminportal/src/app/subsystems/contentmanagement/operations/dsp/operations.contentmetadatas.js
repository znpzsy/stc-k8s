(function () {

    'use strict';

    angular.module('adminportal.subsystems.contentmanagement.operations.dsp.contentmetadatas', [
        'adminportal.subsystems.contentmanagement.operations.dsp.contentmetadatas.contentfiles',
        'adminportal.subsystems.contentmanagement.operations.dsp.contentmetadatas.copyrightfile'
    ]);

    var ContentManagementOperationsContentMetadatasModule = angular.module('adminportal.subsystems.contentmanagement.operations.dsp.contentmetadatas');

    ContentManagementOperationsContentMetadatasModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.contentmanagement.operations.dsp.contentmetadatas', {
            abstract: true,
            url: '/content-metadata',
            template: '<div ui-view></div>',
            data: {
                exportFileName: 'ContentsDSP',
                permissions: [
                    'CMS__OPERATIONS_CONTENTMETADATA_READ'
                ]
            },
            resolve: {
                contentCategories: function (ContentManagementService) {
                    return ContentManagementService.getContentCategories();
                },
                contentTypes: function (ContentManagementService) {
                    return ContentManagementService.getContentTypes();
                },
                organizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizations(false, true, [CMPFService.OPERATOR_PROFILE]);
                },
                services: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllServices(true);
                }
            }
        }).state('subsystems.contentmanagement.operations.dsp.contentmetadatas.list', {
            url: "",
            templateUrl: "subsystems/contentmanagement/operations/dsp/operations.contentmetadatas.html",
            controller: 'ContentManagementOperationsContentMetadatasCtrl'
        }).state('subsystems.contentmanagement.operations.dsp.contentmetadatas.new', {
            url: "/new",
            templateUrl: "subsystems/contentmanagement/operations/dsp/operations.contentmetadatas.details.html",
            controller: 'ContentManagementOperationsContentMetadatasNewCtrl'
        }).state('subsystems.contentmanagement.operations.dsp.contentmetadatas.update', {
            url: "/update/:id",
            templateUrl: "subsystems/contentmanagement/operations/dsp/operations.contentmetadatas.details.html",
            controller: 'ContentManagementOperationsContentMetadatasUpdateCtrl',
            resolve: {
                contentMetadata: function ($stateParams, ContentManagementService) {
                    return ContentManagementService.getContentMetadata($stateParams.id);
                }
            }
        });

    });

    ContentManagementOperationsContentMetadatasModule.controller('ContentManagementOperationsContentMetadatasCommonCtrl', function ($rootScope, $scope, $log, $q, $state, $filter, $controller, $uibModal, notification, $translate, DateTimeConstants,
                                                                                                                                    CMPFService, SessionService, ContentManagementService, WorkflowsService, contentCategories,
                                                                                                                                    contentTypes, services, CMS_STATUS_TYPES, PROVISIONING_LANGUAGES) {
        $log.debug('ContentManagementOperationsContentMetadatasCommonCtrl');

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

        $scope.originalServiceList = services.services;
        $scope.serviceList = [];

        $scope.CMS_STATUS_TYPES = CMS_STATUS_TYPES;
        $scope.PROVISIONING_LANGUAGES = PROVISIONING_LANGUAGES;

        $scope.$watch('filter.orgId', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                $scope.serviceList = _.filter($scope.originalServiceList, {organizationId: Number(newValue)});
                $scope.serviceList = $filter('orderBy')($scope.serviceList, ['name']);
            }
        });

        $scope.openOrganizations = function (contentMetadata) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.organizations.html',
                controller: 'OrganizationsModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    organizationParameter: function () {
                        return angular.copy($scope.contentMetadata.organization);
                    },
                    itemName: function () {
                        return contentMetadata.name;
                    },
                    allOrganizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllOrganizations(false, true, [CMPFService.OPERATOR_PROFILE]);
                    },
                    organizationsModalTitleKey: function () {
                        return 'Subsystems.ContentManagement.Operations.ContentMetadatas.OrganizationsModalTitle';
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.contentMetadata.organization = selectedItem.organization;

                $scope.serviceList = _.filter($scope.originalServiceList, {organizationId: $scope.contentMetadata.organization.id});
                $scope.serviceList = $filter('orderBy')($scope.serviceList, ['name']);
            }, function () {
            });
        };

        $scope.removeSelectedOrganization = function () {
            $scope.contentMetadata.organization = null;
        };

        $scope.updateContentMetadataStateByMobilyUser = function (contentMetadata, newState) {
            contentMetadata.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: function ($scope, $uibModalInstance, $translate, $controller, $sce) {
                    var message = '';
                    if (newState === 'SUSPENDED') {
                        message = $translate.instant('Subsystems.ContentManagement.Operations.ContentMetadatas.Messages.SuspendConfirmationMessage');
                    } else if (newState === 'ACTIVE') {
                        message = $translate.instant('Subsystems.ContentManagement.Operations.ContentMetadatas.Messages.ActivateConfirmationMessage');
                    } else if (newState === 'INACTIVE') {
                        message = $translate.instant('Subsystems.ContentManagement.Operations.ContentMetadatas.Messages.InactivateConfirmationMessage');
                    }

                    message = message + ' [' + contentMetadata.name + ']';
                    $scope.confirmationMessage = $sce.trustAsHtml(message);

                    $controller('ConfirmationModalInstanceCtrl', {
                        $scope: $scope,
                        $uibModalInstance: $uibModalInstance
                    });
                },
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Change state of content metadata:', contentMetadata.name);

                ContentManagementService.getContentMetadata(contentMetadata.id).then(function (contentMetadataResponse) {
                    var contentMetadataDetail = contentMetadataResponse.detail;

                    var currentDateTime = new Date();

                    // Workflows special content metadata object
                    var contentMetadataItem = {
                        "from": {
                            "isAdmin": $rootScope.isAdminUser,
                            "userId": $scope.username,
                            "orgId": $scope.sessionOrganization.name,
                            "groupId": null
                        },
                        "to": {
                            "userId": null,
                            "orgId": null,
                            "groupId": CMPFService.DSP_BUSINESS_ADMIN_GROUP
                        },
                        "userCreated": contentMetadataDetail.userCreated,
                        "dateCreated": contentMetadataDetail.dateCreated,
                        "id": contentMetadataDetail.id,
                        "orgId": contentMetadataDetail.orgId,
                        "name": contentMetadataDetail.name,
                        "description": contentMetadataDetail.description,
                        "author": contentMetadataDetail.author,
                        "businessType": contentMetadataDetail.businessType,
                        "label": contentMetadataDetail.label,
                        "language": contentMetadataDetail.language,
                        "categoryId": contentMetadataDetail.categoryId,
                        "type": contentMetadataDetail.type,
                        "serviceId": contentMetadataDetail.serviceId,
                        "detail": contentMetadataDetail.detail,
                        "iconId": contentMetadataDetail.iconId,
                        "copyrightFiles": contentMetadataDetail.copyrightFiles,
                        "dateLaunch": contentMetadataDetail.dateLaunch,
                        "dateExpiry": contentMetadataDetail.dateExpiry,
                        // Changed values
                        "status": newState,
                        "userUpdated": $scope.username,
                        "dateUpdated": $filter('date')(currentDateTime, 'yyyy-MM-dd\'T\'HH:mm:ss' + DateTimeConstants.OFFSET)
                    };

                    $log.debug('Trying to update content metadata: ', contentMetadataItem);

                    // Content update method of the flow service.
                    WorkflowsService.updateContentMetadata(contentMetadataItem).then(function (response) {
                        if (response && response.code === 2001) {
                            notification.flash({
                                type: 'success',
                                text: $translate.instant('Subsystems.ContentManagement.Operations.ContentMetadatas.Messages.ContentUpdateFlowStartedSuccessful' + ($rootScope.isAdminUser ? 'ForAdmin' : ''))
                            });

                            $state.transitionTo($state.current, {}, {reload: true, inherit: true, notify: true});
                        } else {
                            WorkflowsService.showApiError(response);
                        }
                    }, function (response) {
                        $log.error('Cannot call the content metadata update flow. Error: ', response);

                        if (response && response.data && response.data.message) {
                            WorkflowsService.showApiError(response);
                        } else {
                            notification({
                                type: 'warning',
                                text: $translate.instant('Subsystems.ContentManagement.Operations.ContentMetadatas.Messages.ContentUpdateFlowError')
                            });
                        }
                    });
                });

                contentMetadata.rowSelected = false;
            }, function () {
                contentMetadata.rowSelected = false;
            });
        };

        $scope.cancel = function () {
            $state.go('subsystems.contentmanagement.operations.dsp.contentmetadatas.list');
        };

        // Call the copyright file controller so it could be mixed with this controller.
        $controller('ContentManagementOperationsContentMetadatasCopyrightFileCtrl', {$scope: $scope});
    });

    ContentManagementOperationsContentMetadatasModule.controller('ContentManagementOperationsContentMetadatasCtrl', function ($rootScope, $scope, $log, $controller, $state, $timeout, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                              CMPFService, DateTimeConstants, ContentManagementService, WorkflowsService, DEFAULT_REST_QUERY_LIMIT, contentCategories,
                                                                                                                              contentTypes, organizations, services) {
        $log.debug('ContentManagementOperationsContentMetadatasCtrl');

        $controller('ContentManagementOperationsContentMetadatasCommonCtrl', {
            $scope: $scope,
            contentCategories: contentCategories,
            contentTypes: contentTypes,
            services: services
        });

        $scope.filter = {};

        $scope.organizationList = organizations.organizations;
        $scope.organizationList = $filter('orderBy')($scope.organizationList, ['name']);

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'id',
                    headerKey: 'Subsystems.ContentManagement.Operations.ContentMetadatas.Id'
                },
                {
                    fieldName: 'name',
                    headerKey: 'Subsystems.ContentManagement.Operations.ContentMetadatas.Name'
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
                    headerKey: 'CommonLabels.LastUpdateTime',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'userUpdated',
                    headerKey: 'CommonLabels.LastUpdatedBy'
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
                                var foundOrganization = _.findWhere($scope.organizationList, {id: Number(contentMetadata.orgId)});
                                if (foundOrganization) {
                                    contentMetadata.organization = foundOrganization;
                                } else {
                                    contentMetadata.organization = {
                                        name: 'N/A'
                                    };
                                }

                                var foundService = _.findWhere($scope.originalServiceList, {id: Number(contentMetadata.serviceId)});
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
                categoryId: filter.categoryId || undefined,
                language: filter.language || undefined,
                type: filter.type || undefined,
                keyword: filter.keyword || undefined,
                orgId: filter.orgId || undefined,
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

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.contentMetadataList.tableParams.settings().$scope.filterText = filterText;
            $scope.contentMetadataList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.contentMetadataList.tableParams.page(1);
            $scope.contentMetadataList.tableParams.reload();
        }, 750);

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

                                    var foundOrganization = _.findWhere($scope.organizationList, {id: Number(contentMetadataTask.objectDetail.orgId)});
                                    if (foundOrganization) {
                                        contentMetadataTask.objectDetail.organization = foundOrganization;
                                    } else {
                                        contentMetadataTask.objectDetail.organization = {
                                            name: 'N/A'
                                        };
                                    }

                                    var foundService = _.findWhere($scope.originalServiceList, {id: Number(contentMetadataTask.objectDetail.serviceId)});
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
                controller: function ($scope, $controller, $uibModalInstance, services, contentCategories, contentTypes, allOrganizations, taskDetail) {
                    $controller('WorkflowsOperationsTasksDetailContentMetadataCtrl', {
                        $scope: $scope,
                        services: services,
                        contentCategories: contentCategories,
                        contentTypes: contentTypes,
                        allOrganizations: allOrganizations,
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
                    services: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllServices(true);
                    },
                    contentCategories: function (ContentManagementService) {
                        return ContentManagementService.getContentCategories();
                    },
                    contentTypes: function (ContentManagementService) {
                        return ContentManagementService.getContentTypes();
                    },
                    allOrganizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT, UtilService) {
                        return CMPFService.getAllOrganizations(false, true, [CMPFService.OPERATOR_PROFILE]);
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
                        "isAdmin": $rootScope.isAdminUser,
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
                            text: $translate.instant('Subsystems.ContentManagement.Operations.ContentMetadatas.Messages.ContentDeleteFlowStartedSuccessful' + ($rootScope.isAdminUser ? 'ForAdmin' : ''))
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
                            text: $translate.instant('Subsystems.ContentManagement.Operations.ContentMetadatas.Messages.ContentDeleteFlowError')
                        });
                    }
                });
            }, function () {
                contentMetadata.rowSelected = false;
            });
        };
    });

    ContentManagementOperationsContentMetadatasModule.controller('ContentManagementOperationsContentMetadatasNewCtrl', function ($rootScope, $scope, $log, $state, $controller, $q, $filter, $translate, notification, UtilService, ContentManagementService,
                                                                                                                                 CMPFService, WorkflowsService, SessionService, DateTimeConstants, contentCategories, contentTypes, services) {
        $log.debug('ContentManagementOperationsContentMetadatasNewCtrl');

        $controller('ContentManagementOperationsContentMetadatasCommonCtrl', {
            $scope: $scope,
            contentCategories: contentCategories,
            contentTypes: contentTypes,
            services: services
        });

        $scope.dateHolder.startDate = null;
        $scope.dateHolder.endDate = null;

        $scope.contentMetadata = {
            name: null,
            organization: {},
            status: 'ACTIVE',
            contentInfo: {},
            contentTemplate: {}
        };

        $scope.saveOnCMS = function (contentMetadata) {
            var currentDateTime = new Date();
            var username = SessionService.getUsername();

            var contentMetadataItem = {
                name: contentMetadata.name,
                description: contentMetadata.description,
                status: contentMetadata.status,
                author: null,
                businessType: 'WAP_WEB',
                label: contentMetadata.contentTemplate.label,
                language: contentMetadata.contentTemplate.language,
                categoryId: contentMetadata.contentTemplate.contentCategory,
                type: contentMetadata.contentTemplate.contentType,
                orgId: contentMetadata.organization.id,
                serviceId: contentMetadata.contentTemplate.service,
                detail: [
                    {
                        lang: 'en',
                        title: contentMetadata.contentInfo.titleen,
                        description: contentMetadata.contentInfo.descriptionen,
                        searchKeyword: contentMetadata.contentInfo.searchkeywordsen
                    },
                    {
                        lang: 'ar',
                        title: contentMetadata.contentInfo.titlear,
                        description: contentMetadata.contentInfo.descriptionar,
                        searchKeyword: contentMetadata.contentInfo.searchkeywordsar
                    }
                ],
                iconId: null,
                copyrightFiles: [],
                dateLaunch: ($scope.dateHolder.startDate ? $filter('date')($scope.dateHolder.startDate, 'yyyy-MM-dd') + 'T00:00:00' : ''),
                dateExpiry: ($scope.dateHolder.endDate ? $filter('date')($scope.dateHolder.endDate, 'yyyy-MM-dd') + 'T00:00:00' : ''),
                userCreated: username,
                userUpdated: username,
                dateCreated: $filter('date')(currentDateTime, 'yyyy-MM-dd\'T\'HH:mm:ss' + DateTimeConstants.OFFSET),
                dateUpdated: $filter('date')(currentDateTime, 'yyyy-MM-dd\'T\'HH:mm:ss' + DateTimeConstants.OFFSET)
            };

            var webIconFile, copyrightFile;
            // iconId
            if (contentMetadata.contentInfo.webIconFile && contentMetadata.contentInfo.webIconFile.name) {
                contentMetadataItem.iconId = UtilService.generateObjectId();
                webIconFile = contentMetadata.contentInfo.webIconFile;
            }
            // copyrightFileId
            if (contentMetadata.contentInfo.copyrightFile && contentMetadata.contentInfo.copyrightFile.name) {
                contentMetadataItem.copyrightFileId = UtilService.generateObjectId();
                copyrightFile = contentMetadata.contentInfo.copyrightFile;
            }

            $log.debug('Creating content metadata: ', contentMetadataItem);

            ContentManagementService.createContentMetadata(contentMetadataItem).then(function (response) {
                if (response && response.code === 2001) {
                    $log.debug('Created content metadata: ', contentMetadataItem, ', response: ', response);

                    var promises = [];

                    if (webIconFile && webIconFile.name) {
                        promises.push(ContentManagementService.uploadFile(webIconFile, webIconFile.name, contentMetadataItem.iconId));
                    }

                    if (copyrightFile && copyrightFile.name) {
                        promises.push(ContentManagementService.uploadFile(copyrightFile, copyrightFile.name, contentMetadataItem.copyrightFileId));
                    }

                    $q.all(promises).then(function () {
                        notification.flash({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });

                        $scope.cancel();
                    });
                } else {
                    ContentManagementService.showApiError(response);
                }
            }, function (response) {
                $log.debug('Cannot create content metadata: ', contentTypeItem, ', response: ', response);

                ContentManagementService.showApiError(response);
            });
        };

        $scope.save = function (contentMetadata) {
            var currentDateTime = new Date();

            // Workflows special content metadata object
            var contentMetadataItem = {
                "from": {
                    "isAdmin": $rootScope.isAdminUser,
                    "userId": $scope.username,
                    "orgId": $scope.sessionOrganization.name,
                    "groupId": null
                },
                "to": {
                    "userId": null,
                    "orgId": null,
                    "groupId": CMPFService.DSP_BUSINESS_ADMIN_GROUP
                },
                "author": null,
                "businessType": 'WAP_WEB',
                "iconId": null,
                "copyrightFiles": [],
                "orgId": contentMetadata.organization.id,
                "name": contentMetadata.name,
                "description": contentMetadata.description,
                "label": contentMetadata.contentTemplate.label,
                "language": contentMetadata.contentTemplate.language,
                "categoryId": contentMetadata.contentTemplate.contentCategory,
                "type": contentMetadata.contentTemplate.contentType,
                "status": contentMetadata.status,
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
                            text: $translate.instant('Subsystems.ContentManagement.Operations.ContentMetadatas.Messages.ContentCreateFlowStartedSuccessful' + ($rootScope.isAdminUser ? 'ForAdmin' : ''))
                        });

                        $scope.cancel();
                    });
                } else {
                    WorkflowsService.showApiError(response);
                }
            }, function (response) {
                $log.error('Cannot call the content metadata create flow. Error: ', response);

                if (response && response.data && response.data.message) {
                    WorkflowsService.showApiError(response);
                } else {
                    notification({
                        type: 'warning',
                        text: $translate.instant('Subsystems.ContentManagement.Operations.ContentMetadatas.Messages.ContentCreateFlowError')
                    });
                }
            });
        };
    });

    ContentManagementOperationsContentMetadatasModule.controller('ContentManagementOperationsContentMetadatasUpdateCtrl', function ($rootScope, $scope, $state, $log, $controller, $q, $filter, $translate, notification, UtilService, ContentManagementService,
                                                                                                                                    CMPFService, WorkflowsService, FileDownloadService, SessionService, DateTimeConstants, contentCategories, contentTypes,
                                                                                                                                    organizations, services, contentMetadata) {
        $log.debug('ContentManagementOperationsContentMetadatasUpdateCtrl');

        $controller('ContentManagementOperationsContentMetadatasCommonCtrl', {
            $scope: $scope,
            contentCategories: contentCategories,
            contentTypes: contentTypes,
            services: services
        });

        var contentMetadataMetadata = contentMetadata.detail;

        $scope.organizationList = organizations.organizations;
        $scope.organizationList = $filter('orderBy')($scope.organizationList, ['name']);

        $scope.serviceList = _.filter($scope.originalServiceList, {organizationId: Number(contentMetadataMetadata.orgId)});
        $scope.serviceList = $filter('orderBy')($scope.serviceList, ['name']);

        $scope.contentMetadata = {
            id: contentMetadataMetadata.id,
            orgId: contentMetadataMetadata.orgId,
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

        var foundOrganization = _.findWhere($scope.organizationList, {id: Number(contentMetadataMetadata.orgId)});
        if (foundOrganization) {
            $scope.contentMetadata.organization = foundOrganization;
        } else {
            $scope.contentMetadata.organization = {
                name: 'N/A'
            };
        }

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

        $scope.saveOnCMS = function (contentMetadata) {
            var currentDateTime = new Date();
            var username = SessionService.getUsername();

            var contentMetadataItem = {
                id: $scope.originalContentMetadata.id,
                userCreated: $scope.originalContentMetadata.userCreated,
                dateCreated: $scope.originalContentMetadata.dateCreated,
                // Changed values
                name: contentMetadata.name,
                description: contentMetadata.description,
                status: contentMetadata.status,
                author: '',
                businessType: 'WAP_WEB',
                label: contentMetadata.contentTemplate.label,
                language: contentMetadata.contentTemplate.language,
                categoryId: contentMetadata.contentTemplate.contentCategory,
                type: contentMetadata.contentTemplate.contentType,
                orgId: contentMetadata.organization.id,
                serviceId: contentMetadata.contentTemplate.service,
                detail: [
                    {
                        lang: 'en',
                        title: contentMetadata.contentInfo.titleen,
                        description: contentMetadata.contentInfo.descriptionen,
                        searchKeyword: contentMetadata.contentInfo.searchkeyworden
                    },
                    {
                        lang: 'ar',
                        title: contentMetadata.contentInfo.titlear,
                        description: contentMetadata.contentInfo.descriptionar,
                        searchKeyword: contentMetadata.contentInfo.searchkeywordar
                    }
                ],
                iconId: null,
                copyrightFiles: null,
                dateLaunch: ($scope.dateHolder.startDate ? $filter('date')($scope.dateHolder.startDate, 'yyyy-MM-dd') + 'T00:00:00' : ''),
                dateExpiry: ($scope.dateHolder.endDate ? $filter('date')($scope.dateHolder.endDate, 'yyyy-MM-dd') + 'T00:00:00' : ''),
                userUpdated: username,
                dateUpdated: $filter('date')(currentDateTime, 'yyyy-MM-dd\'T\'HH:mm:ss' + DateTimeConstants.OFFSET)
            };

            var webIconFile, copyrightFile;
            // iconId
            webIconFile = contentMetadata.contentInfo.webIconFile;
            if (!webIconFile || (webIconFile && !webIconFile.name)) {
                contentMetadataItem.iconId = '';
            } else if (webIconFile instanceof File && !contentMetadata.iconId) {
                contentMetadataItem.iconId = UtilService.generateObjectId();
            }
            // copyrightFileId
            copyrightFile = contentMetadata.contentInfo.copyrightFile;
            if (!copyrightFile || (copyrightFile && !copyrightFile.name)) {
                contentMetadataItem.copyrightFileId = '';
            } else if (copyrightFile instanceof File && !contentMetadata.copyrightFileId) {
                contentMetadataItem.copyrightFileId = UtilService.generateObjectId();
            }

            $log.debug('Updating content metadata: ', contentMetadataItem);

            ContentManagementService.updateContentMetadata(contentMetadataItem).then(function (response) {
                if (response && response.code === 2002) {
                    $log.debug('Updated content metadata: ', contentMetadataItem, ', response: ', response);

                    var promises = [];

                    if (webIconFile && webIconFile.name && (webIconFile instanceof File)) {
                        promises.push(ContentManagementService.uploadFile(webIconFile, webIconFile.name, contentMetadataItem.iconId));
                    }

                    if (copyrightFile && copyrightFile.name && (copyrightFile instanceof File)) {
                        promises.push(ContentManagementService.uploadFile(copyrightFile, copyrightFile.name, contentMetadataItem.copyrightFileId));
                    }

                    $q.all(promises).then(function () {
                        notification.flash({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });

                        $scope.cancel();
                    });
                } else {
                    ContentManagementService.showApiError(response);
                }
            }, function (response) {
                $log.debug('Cannot update content metadata: ', contentTypeItem, ', response: ', response);

                ContentManagementService.showApiError(response);
            });
        };

        $scope.save = function (contentMetadata) {
            var currentDateTime = new Date();

            // Workflows special content metadata object
            var contentMetadataItem = {
                "from": {
                    "isAdmin": $rootScope.isAdminUser,
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
                // Changed values
                "iconId": null,
                "copyrightFiles": [],
                "orgId": contentMetadata.organization.id,
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
                            text: $translate.instant('Subsystems.ContentManagement.Operations.ContentMetadatas.Messages.ContentUpdateFlowStartedSuccessful' + ($rootScope.isAdminUser ? 'ForAdmin' : ''))
                        });

                        $scope.cancel();
                    });
                } else {
                    WorkflowsService.showApiError(response);
                }
            }, function (response) {
                $log.error('Cannot call the content metadata update flow. Error: ', response);

                if (response && response.data && response.data.message) {
                    WorkflowsService.showApiError(response);
                } else {
                    notification({
                        type: 'warning',
                        text: $translate.instant('Subsystems.ContentManagement.Operations.ContentMetadatas.Messages.ContentUpdateFlowError')
                    });
                }
            });
        };
    });

})();
