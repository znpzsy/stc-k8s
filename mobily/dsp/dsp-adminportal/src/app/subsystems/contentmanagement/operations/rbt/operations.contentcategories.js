(function () {

    'use strict';

    angular.module('adminportal.subsystems.contentmanagement.operations.rbt.contentcategories', []);

    var ContentManagementOperationsContentCategoriesRBTModule = angular.module('adminportal.subsystems.contentmanagement.operations.rbt.contentcategories');

    ContentManagementOperationsContentCategoriesRBTModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.contentmanagement.operations.rbt.contentcategories', {
            abstract: true,
            url: "/content-categories",
            template: '<div ui-view></div>',
            data: {
                exportFileName: 'ContentCategoriesRBT',
                permissions: [
                    'RBT__OPERATIONS_CATEGORY_READ'
                ]
            }
        }).state('subsystems.contentmanagement.operations.rbt.contentcategories.list', {
            url: "",
            templateUrl: "subsystems/contentmanagement/operations/rbt/operations.contentcategories.html",
            controller: 'ContentManagementOperationsContentCategoriesRBTCtrl'
        }).state('subsystems.contentmanagement.operations.rbt.contentcategories.new', {
            url: "/new",
            templateUrl: "subsystems/contentmanagement/operations/rbt/operations.contentcategories.details.html",
            controller: 'ContentManagementOperationsContentCategoriesRBTNewCtrl'
        }).state('subsystems.contentmanagement.operations.rbt.contentcategories.update', {
            url: "/update/:id",
            templateUrl: "subsystems/contentmanagement/operations/rbt/operations.contentcategories.details.html",
            controller: 'ContentManagementOperationsContentCategoriesRBTUpdateCtrl',
            resolve: {
                contentCategory: function ($stateParams, $q, ContentManagementService, CMPFService) {
                    var deferred = $q.defer();

                    ContentManagementService.getContentCategoryRBT($stateParams.id).then(function (_category) {
                        CMPFService.getOperator(_category.category.organizationId, true).then(function (_organization) {
                            _category.category.organization = _organization;

                            deferred.resolve(_category);
                        });
                    });

                    return deferred.promise;
                }
            }
        });

    });

    ContentManagementOperationsContentCategoriesRBTModule.controller('ContentManagementOperationsContentCategoriesRBTCommonCtrl', function ($scope, $log, $q, $state, $uibModal, $controller, $filter, UtilService, SessionService, ContentManagementService, CMPFService,
                                                                                                                                            CMS_RBT_STATUS_TYPES, CMS_ACCESS_CHANNELS, DURATION_UNITS, CMS_RBT_REV_SHARE_POLICIES_ALL, DEFAULT_REST_QUERY_LIMIT,
                                                                                                                                            CMS_RBT_REV_SHARE_CARRIER_DEDUCTION, CMS_RBT_REV_SHARE_SPLIT_ACROSS_TONES_ALL) {
        $log.debug('ContentManagementOperationsContentCategoriesRBTCommonCtrl');

        $controller('GenericDateTimeCtrl', {$scope: $scope});
        $controller('ContentManagementOperationsRBTCommonCtrl', {$scope: $scope});

        $scope.sessionOrganization = SessionService.getSessionOrganization();
        $scope.username = SessionService.getUsername();

        $scope.CMS_RBT_STATUS_TYPES = CMS_RBT_STATUS_TYPES;
        $scope.CMS_ACCESS_CHANNELS = CMS_ACCESS_CHANNELS;
        $scope.DURATION_UNITS = DURATION_UNITS;
        $scope.CMS_RBT_REV_SHARE_POLICIES = CMS_RBT_REV_SHARE_POLICIES_ALL;
        $scope.CMS_RBT_REV_SHARE_CARRIER_DEDUCTION = CMS_RBT_REV_SHARE_CARRIER_DEDUCTION;
        $scope.CMS_RBT_REV_SHARE_SPLIT_ACROSS_TONES = CMS_RBT_REV_SHARE_SPLIT_ACROSS_TONES_ALL;

        $scope.openOrganizations = function (contentCategory) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.organizations.html',
                controller: 'OrganizationsModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    organizationParameter: function () {
                        return angular.copy(contentCategory.organization);
                    },
                    itemName: function () {
                        return contentCategory.name;
                    },
                    allOrganizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllOrganizations(false, true, [CMPFService.OPERATOR_PROFILE, CMPFService.SERVICE_PROVIDER_BUSINESS_TYPE_PROFILE, CMPFService.SERVICE_PROVIDER_SETTLEMENT_TYPE_PROFILE]);
                    },
                    organizationsModalTitleKey: function () {
                        return 'Subsystems.ContentManagement.Operations.RBT.ContentCategories.OrganizationsModalTitle';
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                contentCategory.organization = selectedItem.organization;
                contentCategory.organizationId = selectedItem.organization.id;
                contentCategory.defaultToneId = null;
            }, function () {
            });
        };

        $scope.toneList = [];

        $scope.removeSelectedOrganization = function () {
            $scope.contentCategory.organization = null;
        };

        $scope.cancel = function () {
            $state.go('subsystems.contentmanagement.operations.rbt.contentcategories.list');
        };
    });

    ContentManagementOperationsContentCategoriesRBTModule.controller('ContentManagementOperationsContentCategoriesRBTCtrl', function ($rootScope, $scope, $log, $controller, $state, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                                      Restangular, DateTimeConstants, ContentManagementService, WorkflowsService, SessionService, CMPFService, DEFAULT_REST_QUERY_LIMIT) {
        $log.debug('ContentManagementOperationsContentCategoriesRBTCtrl');

        $scope.sessionOrganization = SessionService.getSessionOrganization();
        $scope.username = SessionService.getUsername();

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'id',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.ContentCategories.Id'
                },
                {
                    fieldName: 'name',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.ContentMetadatas.ContentInfo.ContentCategory'
                },
                {
                    fieldName: 'organizationName',
                    headerKey: 'CommonLabels.Organization'
                },
                {
                    fieldName: 'subscriptionEnabled',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.ContentCategories.SubscriptionEnabled',
                    filter: {name: 'YesNoFilter'}
                },
                {
                    fieldName: 'promoted',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.ContentCategories.Promoted',
                    filter: {name: 'YesNoFilter'}
                },
                {
                    fieldName: 'totalSubscriptionCount',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.ContentCategories.Subscriptions'
                },
                {
                    fieldName: 'status',
                    headerKey: 'CommonLabels.State'
                }
            ]
        };

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

        $scope.prepareFilter = function (tableParams) {
            var result = {};

            result.filter = {
                statuses: [tableParams.settings().$scope.status]
            };

            result.additionalFilterFields = {};

            if (tableParams) {
                result.filter.sortFieldName = s.words(tableParams.orderBy()[0], /\-|\+/)[0];
                result.filter.sortOrder = s.include(tableParams.orderBy()[0], '+') ? 'ASC' : 'DESC';
                result.filter.limit = tableParams.count();
                result.filter.page = tableParams.page() - 1;

                result.filter.filterText = tableParams.settings().$scope.filterText;
                result.filter.filterColumns = tableParams.settings().$scope.filterColumns;
            }

            return result;
        };

        // Content category list
        $scope.contentCategoryList = {
            list: [],
            tableParams: {}
        };
        $scope.originalContentCategories = angular.copy($scope.contentCategoryList.list);

        $scope.contentCategoryList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "id": 'asc'
            }
        }, {
            total: $scope.contentCategoryList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var preparedFilter = $scope.prepareFilter(params);

                var filter = preparedFilter.filter;
                var additionalFilterFields = preparedFilter.additionalFilterFields;

                if (params.settings().$scope.status !== 'WAITING') {
                    ContentManagementService.getContentCategoriesRBT(filter.page, filter.limit, filter.sortFieldName, filter.sortOrder, filter.statuses, filter.filterText).then(function (response) {
                        $log.debug("Found records: ", response);

                        $scope.contentCategoryList.list = (response ? response.items : []);

                        params.total(response ? response.totalCount : 0);
                        $defer.resolve($scope.contentCategoryList.list);
                    }, function (error) {
                        $log.debug('Error: ', error);
                        params.total(0);
                        $defer.resolve([]);
                    });
                } else {
                    $scope.contentCategoryList.list = [];
                    WorkflowsService.searchPendingTasks(0, DEFAULT_REST_QUERY_LIMIT, 'RBT_CATEGORY').then(function (waitingRBTCategoryTask) {
                        if (waitingRBTCategoryTask && waitingRBTCategoryTask.detail && waitingRBTCategoryTask.detail.total > 0) {
                            _.each(waitingRBTCategoryTask.detail.items, function (rbtCategoryTask) {
                                if (rbtCategoryTask && rbtCategoryTask.name && (rbtCategoryTask.name.toLowerCase() === 'rbt category create task')) {
                                    rbtCategoryTask.objectDetail.taskObjectId = rbtCategoryTask.rbtContentId;
                                    rbtCategoryTask.objectDetail.state = 'WAITING FOR APPROVAL';
                                    rbtCategoryTask.objectDetail.taskName = rbtCategoryTask.name;

                                    $scope.contentCategoryList.list.push(rbtCategoryTask.objectDetail);
                                }
                            });
                        }

                        params.total($scope.contentCategoryList.list.length);
                        $defer.resolve($scope.contentCategoryList.list);
                    }, function (error) {
                        $log.debug('Error: ', error);
                        params.total(0);
                        $defer.resolve([]);
                    });
                }
            }
        });
        // END - Content category list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.contentCategoryList.tableParams.settings().$scope.filterText = filterText;
            $scope.contentCategoryList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.contentCategoryList.tableParams.page(1);
            $scope.contentCategoryList.tableParams.reload();
        }, 750);

        $scope.stateFilter = 'ALL';
        $scope.stateFilterChange = function (state) {
            if (state === 'ALL') {
                delete $scope.contentCategoryList.tableParams.settings().$scope.status;
            } else {
                $scope.contentCategoryList.tableParams.settings().$scope.status = state;
            }

            $scope.reloadTable($scope.contentCategoryList.tableParams);
        };

        // Task details modal window.
        $scope.showTaskDetails = function (rbtCategory) {
            rbtCategory.rowSelected = true;

            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'partials/modal/empty.modal.html',
                controller: function ($scope, $controller, $uibModalInstance, allOrganizations, tones, taskDetail) {
                    $controller('WorkflowsOperationsTasksDetailRBTCategoryCtrl', {
                        $scope: $scope,
                        allOrganizations: allOrganizations,
                        tones: tones,
                        taskDetail: taskDetail
                    });

                    $scope.isModal = true;
                    $scope.modalTitle = rbtCategory.taskName;
                    $scope.templateUrl = 'workflows/operations/operations.tasks.rbtcategories.detail.html';

                    $scope.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'lg',
                resolve: {
                    allOrganizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT, UtilService) {
                        return CMPFService.getAllOrganizations(false, true, [CMPFService.OPERATOR_PROFILE]);
                    },
                    tones: function (ContentManagementService, DEFAULT_REST_QUERY_LIMIT) {
                        return ContentManagementService.getTones(0, DEFAULT_REST_QUERY_LIMIT);
                    },
                    taskDetail: function () {
                        return {
                            rbtCategoryTask: {
                                objectDetail: rbtCategory
                            }
                        };
                    }
                }
            });

            modalInstance.result.then(function () {
                rbtCategory.rowSelected = false;
            }, function () {
                rbtCategory.rowSelected = false;
            });
        };

        $scope.remove = function (contentCategory) {
            contentCategory.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                contentCategory.rowSelected = false;

                var contentCategoryItem = {
                    "from": {
                        "isAdmin": $rootScope.isAdminUser,
                        "userId": $scope.username,
                        "orgId": $scope.sessionOrganization.name,
                        "groupId": null
                    },
                    "to": {
                        "isAdmin": false,
                        "userId": null,
                        "orgId": null,
                        "groupId": CMPFService.DSP_MARKETING_ADMIN_GROUP
                    },
                    "id": contentCategory.id,
                    "legacyId": contentCategory.legacyId,
                    "organizationId": contentCategory.organizationId,
                    "organizationName": contentCategory.organizationName,
                    "coverImageId": contentCategory.coverImageId,
                    "cardImageId": contentCategory.cardImageId,
                    "thumbnailId": contentCategory.thumbnailId,
                    "contentType": contentCategory.contentType,
                    "dateCreated": contentCategory.dateCreated,
                    "totalSubscriptionCount": contentCategory.totalSubscriptionCount,
                    "status": contentCategory.status,
                    "name": contentCategory.name,
                    "launchDate": contentCategory.launchDate,
                    "expireDate": contentCategory.expireDate,
                    "defaultToneId": contentCategory.defaultToneId,
                    "names": contentCategory.names,
                    "descriptions": contentCategory.descriptions,
                    "tags": contentCategory.tags,
                    "accessChannels": contentCategory.accessChannels,
                    "subscriptionEnabled": contentCategory.subscriptionEnabled,
                    "promoted": contentCategory.promoted
                };

                $log.debug('Removing content category: ', contentCategoryItem);

                // Content category rbt delete method of the flow service.
                WorkflowsService.deleteContentCategoryRBT(contentCategoryItem).then(function (response) {
                    if (response && response.code === 2001) {
                        $log.debug('Removed content category rbt: ', contentCategoryItem, ', response: ', response);

                        notification.flash({
                            type: 'success',
                            text: $translate.instant('Subsystems.ContentManagement.Operations.RBT.ContentCategories.Messages.DeleteFlowStartedSuccessful' + ($rootScope.isAdminUser ? 'ForAdmin' : ''))
                        });

                        $state.transitionTo($state.current, {}, {reload: true, inherit: true, notify: true});
                    } else {
                        WorkflowsService.showApiError(response);
                    }
                }, function (response) {
                    $log.error('Cannot call the content category rbt delete flow service. Error: ', response);

                    if (response && response.data && response.data.message) {
                        WorkflowsService.showApiError(response);
                    } else {
                        notification({
                            type: 'warning',
                            text: $translate.instant('Subsystems.ContentManagement.Operations.RBT.ContentCategories.Messages.DeleteFlowError')
                        });
                    }
                });
            }, function () {
                contentCategory.rowSelected = false;
            });
        };
    });

    ContentManagementOperationsContentCategoriesRBTModule.controller('ContentManagementOperationsContentCategoriesRBTNewCtrl', function ($rootScope, $scope, $log, $state, $controller, $q, $filter, $translate, notification, UtilService, DateTimeConstants,
                                                                                                                                         CMPFService, WorkflowsService, ContentManagementService) {
        $log.debug('ContentManagementOperationsContentCategoriesRBTNewCtrl');

        $controller('ContentManagementOperationsContentCategoriesRBTCommonCtrl', {
            $scope: $scope
        });

        $scope.dateHolder.startDate = null;
        $scope.dateHolder.endDate = null;

        $scope.contentCategory = {
            status: 'ACTIVE',
            subscriptionEnabled: true,
            promoted: false,
            tags: [],
            accessChannels: [],
            chargingDetails: {
                chargingPeriod: {
                    duration: 30,
                    unit: $scope.DURATION_UNITS[0].key
                },
                price: 0,
                subscriptionCode: null,
                revShare: {
                    type: 'EQUAL'
                }
            }
        };

        $scope.sendToWorkflow = function (contentCategory) {
            var contentCategoryItem = {
                "from": {
                    "isAdmin": $rootScope.isAdminUser,
                    "userId": $scope.username,
                    "orgId": $scope.sessionOrganization.name,
                    "groupId": null
                },
                "to": {
                    "isAdmin": false,
                    "userId": null,
                    "orgId": null,
                    "groupId": CMPFService.DSP_MARKETING_ADMIN_GROUP
                },
                // Changed values
                "name": contentCategory.name,
                "organizationId": contentCategory.organization.id,
                "organizationName": contentCategory.organization.name,
                "status": contentCategory.status,
                "launchDate": ($scope.dateHolder.startDate ? $filter('date')($scope.dateHolder.startDate, 'yyyy-MM-dd') + 'T00:00:00' : ''),
                "expireDate": ($scope.dateHolder.endDate ? $filter('date')($scope.dateHolder.endDate, 'yyyy-MM-dd') + 'T00:00:00' : ''),
                "names": [],
                "descriptions": [],
                "tags": contentCategory.tags,
                "accessChannels": contentCategory.accessChannels,
                "coverImageId": null,
                "cardImageId": null,
                "thumbnailId": null,
                "defaultToneId": contentCategory.defaultToneId,
                "subscriptionEnabled": contentCategory.subscriptionEnabled,
                "promoted": contentCategory.promoted
            };

            // names
            contentCategoryItem.names.push({
                'lang': 'en',
                'name': contentCategory.nameEn
            });
            contentCategoryItem.names.push({
                'lang': 'ar',
                'name': contentCategory.nameAr
            });

            // descriptions
            contentCategoryItem.descriptions.push({
                'lang': 'en',
                'description': contentCategory.descriptionEn
            });
            contentCategoryItem.descriptions.push({
                'lang': 'ar',
                'description': contentCategory.descriptionAr
            });

            var coverImage, cardImage, thumbnail, defaultTone;
            // coverImageId
            if (contentCategory.coverImage && contentCategory.coverImage.name) {
                contentCategoryItem.coverImageId = UtilService.generateObjectId();
                coverImage = contentCategory.coverImage;
            }
            // cardImageId
            if (contentCategory.cardImage && contentCategory.cardImage.name) {
                contentCategoryItem.cardImageId = UtilService.generateObjectId();
                cardImage = contentCategory.cardImage;
            }
            // thumbnailId
            if (contentCategory.thumbnail && contentCategory.thumbnail.name) {
                contentCategoryItem.thumbnailId = UtilService.generateObjectId();
                thumbnail = contentCategory.thumbnail;
            }

            // Charging Details
            if (contentCategory.chargingDetails) {
                var offer = {
                    "chargingPeriodDetail": UtilService.convertSimpleObjectToPeriod(contentCategory.chargingDetails.chargingPeriod),
                    "price": contentCategory.chargingDetails.price,
                    "subscriptionCode": contentCategory.chargingDetails.subscriptionCode,
                    "revSharePolicy": contentCategory.chargingDetails.revSharePolicy
                };

                if (contentCategory.chargingDetails.revSharePolicy === 'COMPLEX') {
                    offer.revShare = {
                        "operatorDeductionType": contentCategory.chargingDetails.revShare.operatorDeductionType ? contentCategory.chargingDetails.revShare.operatorDeductionType : "NONE",
                        "operatorDeduction": contentCategory.chargingDetails.revShare.operatorDeduction ? contentCategory.chargingDetails.revShare.operatorDeduction : 0,
                        "type": contentCategory.chargingDetails.revShare.type ? contentCategory.chargingDetails.revShare.type : null,
                        "baseShareType": "NONE",
                        "baseShare": 0,
                        "operatorShare": 0
                    };
                }

                contentCategoryItem.offers = [
                    offer
                ];
            }

            $log.debug('Creating content category: ', contentCategoryItem);

            // Content Category RBT create method of the flow service.
            WorkflowsService.createContentCategoryRBT(contentCategoryItem).then(function (response) {
                if (response && response.code === 2001) {
                    $log.debug('Save Success. Response: ', response);

                    var promises = [];

                    if (coverImage && coverImage.name) {
                        promises.push(ContentManagementService.uploadFile(coverImage, coverImage.name, contentCategoryItem.coverImageId));
                    }

                    if (cardImage && cardImage.name) {
                        promises.push(ContentManagementService.uploadFile(cardImage, cardImage.name, contentCategoryItem.cardImageId));
                    }

                    if (thumbnail && thumbnail.name) {
                        promises.push(ContentManagementService.uploadFile(thumbnail, thumbnail.name, contentCategoryItem.thumbnailId));
                    }

                    $q.all(promises).then(function () {
                        notification.flash({
                            type: 'success',
                            text: $translate.instant('Subsystems.ContentManagement.Operations.RBT.ContentCategories.Messages.CreateFlowStartedSuccessful' + ($rootScope.isAdminUser ? 'ForAdmin' : ''))
                        });

                        $scope.cancel();
                    });
                } else {
                    WorkflowsService.showApiError(response);
                }
            }, function (response) {
                $log.error('Cannot call the content category rbt create flow service. Error: ', response);

                if (response && response.data && response.data.message) {
                    WorkflowsService.showApiError(response);
                } else {
                    notification({
                        type: 'warning',
                        text: $translate.instant('Subsystems.ContentManagement.Operations.RBT.ContentCategories.Messages.CreateFlowError')
                    });
                }
            });
        };
    });

    ContentManagementOperationsContentCategoriesRBTModule.controller('ContentManagementOperationsContentCategoriesRBTUpdateCtrl', function ($rootScope, $scope, $state, $log, $controller, $q, $filter, $translate, notification, Restangular, UtilService,
                                                                                                                                            CMPFService, WorkflowsService, DateTimeConstants, FileDownloadService, ContentManagementService,
                                                                                                                                            contentCategory) {
        $log.debug('ContentManagementOperationsContentCategoriesRBTUpdateCtrl');

        $controller('ContentManagementOperationsContentCategoriesRBTCommonCtrl', {
            $scope: $scope
        });

        $scope.contentCategory = contentCategory.category;

        // Set the default tone if it is not found.
        if ($scope.contentCategory.defaultToneId && !contentCategory.defaultTone) {
            $scope.toneList.push({
                id: $scope.contentCategory.defaultToneId,
                name: 'N/A'
            });
        }

        if ($scope.contentCategory.names && $scope.contentCategory.names.length > 0) {
            $scope.contentCategory.nameEn = 'N/A';
            var foundContentCategoryNameEn = _.findWhere($scope.contentCategory.names, {lang: 'en'});
            if (foundContentCategoryNameEn) {
                $scope.contentCategory.nameEn = foundContentCategoryNameEn.name;
            }

            $scope.contentCategory.nameAr = 'N/A';
            var foundContentCategoryNameAr = _.findWhere($scope.contentCategory.names, {lang: 'ar'});
            if (foundContentCategoryNameAr) {
                $scope.contentCategory.nameAr = foundContentCategoryNameAr.name;
            }
        }

        if ($scope.contentCategory.descriptions && $scope.contentCategory.descriptions.length > 0) {
            $scope.contentCategory.descriptionEn = 'N/A';
            var foundContentCategoryDescriptionEn = _.findWhere($scope.contentCategory.descriptions, {lang: 'en'});
            if (foundContentCategoryDescriptionEn) {
                $scope.contentCategory.descriptionEn = foundContentCategoryDescriptionEn.description;
            }

            $scope.contentCategory.descriptionAr = 'N/A';
            var foundContentCategoryDescriptionAr = _.findWhere($scope.contentCategory.descriptions, {lang: 'ar'});
            if (foundContentCategoryDescriptionAr) {
                $scope.contentCategory.descriptionAr = foundContentCategoryDescriptionAr.description;
            }
        }

        if (!$scope.contentCategory.tags) {
            $scope.contentCategory.tags = [];
        }
        if (!$scope.contentCategory.accessChannels) {
            $scope.contentCategory.accessChannels = [];
        }

        // Get the coverImage by id value.
        $scope.contentCategory.coverImage = {name: undefined};
        if ($scope.contentCategory.coverImageId) {
            var srcUrl = ContentManagementService.generateFilePath($scope.contentCategory.coverImageId);
            FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                $scope.contentCategory.coverImage = blob;
                if (blob) {
                    $scope.contentCategory.coverImage.name = fileName;
                }
                $scope.originalContentCategory = angular.copy($scope.contentCategory);
            });
        }

        // Get the cardImage by id value.
        $scope.contentCategory.cardImage = {name: undefined};
        if ($scope.contentCategory.cardImageId) {
            var srcUrl = ContentManagementService.generateFilePath($scope.contentCategory.cardImageId);
            FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                $scope.contentCategory.cardImage = blob;
                if (blob) {
                    $scope.contentCategory.cardImage.name = fileName;
                }
                $scope.originalContentCategory = angular.copy($scope.contentCategory);
            });
        }

        // Get the thumbnail by id value.
        $scope.contentCategory.thumbnail = {name: undefined};
        if ($scope.contentCategory.thumbnailId) {
            var srcUrl = ContentManagementService.generateFilePath($scope.contentCategory.thumbnailId);
            FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                $scope.contentCategory.thumbnail = blob;
                if (blob) {
                    $scope.contentCategory.thumbnail.name = fileName;
                }
                $scope.originalContentCategory = angular.copy($scope.contentCategory);
            });
        }

        $scope.dateHolder = {
            startDate: ($scope.contentCategory.launchDate ? new Date(moment($scope.contentCategory.launchDate).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss')) : ''),
            endDate: ($scope.contentCategory.expireDate ? new Date(moment($scope.contentCategory.expireDate).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss')) : '')
        };

        if ($scope.contentCategory && $scope.contentCategory.offers && $scope.contentCategory.offers.length > 0) {
            var chargingDetails = $scope.contentCategory.offers[0];

            $scope.contentCategory.chargingDetails = {
                chargingPeriod: UtilService.convertPeriodStringToSimpleObject(chargingDetails.chargingPeriodDetail),
                price: Number(chargingDetails.price),
                subscriptionCode: chargingDetails.subscriptionCode,
                revSharePolicy: chargingDetails.revSharePolicy,
                revShare: chargingDetails.revShare
            };
        } else {
            $scope.contentCategory.chargingDetails = {
                chargingPeriod: {
                    duration: 30,
                    unit: $scope.DURATION_UNITS[0].key
                },
                price: 0,
                subscriptionCode: null,
                revSharePolicy: null,
                revShare: {
                    operatorDeductionType: null,
                    operatorDeduction: null,
                    type: 'EQUAL',
                    baseShareType: null,
                    baseShare: null,
                    operatorShare: null
                }
            };
        }

        $scope.originalContentCategory = angular.copy($scope.contentCategory);
        $scope.dateHolderOriginal = angular.copy($scope.dateHolder);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalContentCategory, $scope.contentCategory) &&
                angular.equals($scope.dateHolder, $scope.dateHolderOriginal);
        };

        $scope.sendToWorkflow = function (contentCategory) {
            var contentCategoryItem = {
                "from": {
                    "isAdmin": $rootScope.isAdminUser,
                    "userId": $scope.username,
                    "orgId": $scope.sessionOrganization.name,
                    "groupId": null
                },
                "to": {
                    "isAdmin": false,
                    "userId": null,
                    "orgId": null,
                    "groupId": CMPFService.DSP_MARKETING_ADMIN_GROUP
                },
                "id": $scope.originalContentCategory.id,
                "legacyId": $scope.originalContentCategory.legacyId,
                "coverImageId": $scope.originalContentCategory.coverImageId,
                "cardImageId": $scope.originalContentCategory.cardImageId,
                "thumbnailId": $scope.originalContentCategory.thumbnailId,
                "contentType": $scope.originalContentCategory.contentType,
                "dateCreated": $scope.originalContentCategory.dateCreated,
                "totalSubscriptionCount": $scope.originalContentCategory.totalSubscriptionCount,
                // Changed values
                "name": contentCategory.name,
                "organizationId": contentCategory.organization.id,
                "organizationName": contentCategory.organization.name,
                "status": contentCategory.status,
                "launchDate": ($scope.dateHolder.startDate ? $filter('date')($scope.dateHolder.startDate, 'yyyy-MM-dd') + 'T00:00:00' : ''),
                "expireDate": ($scope.dateHolder.endDate ? $filter('date')($scope.dateHolder.endDate, 'yyyy-MM-dd') + 'T00:00:00' : ''),
                "defaultToneId": contentCategory.defaultToneId,
                "names": [],
                "descriptions": [],
                "tags": contentCategory.tags,
                "accessChannels": contentCategory.accessChannels,
                "subscriptionEnabled": contentCategory.subscriptionEnabled,
                "promoted": contentCategory.promoted
            };

            // names
            contentCategoryItem.names.push({
                'lang': 'en',
                'name': contentCategory.nameEn
            });
            contentCategoryItem.names.push({
                'lang': 'ar',
                'name': contentCategory.nameAr
            });

            // descriptions
            contentCategoryItem.descriptions.push({
                'lang': 'en',
                'description': contentCategory.descriptionEn
            });
            contentCategoryItem.descriptions.push({
                'lang': 'ar',
                'description': contentCategory.descriptionAr
            });

            var coverImage, cardImage, thumbnail;
            // coverImageId
            coverImage = contentCategory.coverImage;
            if (!coverImage || (coverImage && !coverImage.name)) {
                contentCategoryItem.coverImageId = null;
            } else if (coverImage instanceof File && !contentCategoryItem.coverImageId) {
                contentCategoryItem.coverImageId = UtilService.generateObjectId();
            }
            // cardImageId
            cardImage = contentCategory.cardImage;
            if (!cardImage || (cardImage && !cardImage.name)) {
                contentCategoryItem.cardImageId = null;
            } else if (cardImage instanceof File && !contentCategoryItem.cardImageId) {
                contentCategoryItem.cardImageId = UtilService.generateObjectId();
            }
            // thumbnailId
            thumbnail = contentCategory.thumbnail;
            if (!thumbnail || (thumbnail && !thumbnail.name)) {
                contentCategoryItem.thumbnailId = null;
            } else if (thumbnail instanceof File && !contentCategoryItem.thumbnailId) {
                contentCategoryItem.thumbnailId = UtilService.generateObjectId();
            }

            // Charging Details
            if (contentCategory.chargingDetails) {
                var offer = {
                    "chargingPeriodDetail": UtilService.convertSimpleObjectToPeriod(contentCategory.chargingDetails.chargingPeriod),
                    "price": contentCategory.chargingDetails.price,
                    "subscriptionCode": contentCategory.chargingDetails.subscriptionCode,
                    "revSharePolicy": contentCategory.chargingDetails.revSharePolicy
                };

                if (contentCategory.chargingDetails.revSharePolicy === 'COMPLEX') {
                    offer.revShare = {
                        "operatorDeductionType": contentCategory.chargingDetails.revShare.operatorDeductionType ? contentCategory.chargingDetails.revShare.operatorDeductionType : "NONE",
                        "operatorDeduction": contentCategory.chargingDetails.revShare.operatorDeduction ? contentCategory.chargingDetails.revShare.operatorDeduction : 0,
                        "type": contentCategory.chargingDetails.revShare.type ? contentCategory.chargingDetails.revShare.type : null,
                        "baseShareType": "NONE",
                        "baseShare": 0,
                        "operatorShare": 0
                    };
                }

                contentCategoryItem.offers = [
                    offer
                ];
            }

            $log.debug('Updating content category: ', contentCategoryItem);

            // Content Category RBT update method of the flow service.
            WorkflowsService.updateContentCategoryRBT(contentCategoryItem).then(function (response) {
                if (response && response.code === 2001) {
                    $log.debug('Save Success. Response: ', response);

                    var promises = [];

                    if (coverImage && coverImage.name && (coverImage instanceof File)) {
                        promises.push(ContentManagementService.uploadFile(coverImage, coverImage.name, contentCategoryItem.coverImageId));
                    }

                    if (cardImage && cardImage.name && (cardImage instanceof File)) {
                        promises.push(ContentManagementService.uploadFile(cardImage, cardImage.name, contentCategoryItem.cardImageId));
                    }

                    if (thumbnail && thumbnail.name && (thumbnail instanceof File)) {
                        promises.push(ContentManagementService.uploadFile(thumbnail, thumbnail.name, contentCategoryItem.thumbnailId));
                    }

                    $q.all(promises).then(function () {
                        notification.flash({
                            type: 'success',
                            text: $translate.instant('Subsystems.ContentManagement.Operations.RBT.ContentCategories.Messages.UpdateFlowStartedSuccessful' + ($rootScope.isAdminUser ? 'ForAdmin' : ''))
                        });

                        $scope.cancel();
                    });
                } else {
                    ContentManagementService.showApiError(response);
                }
            }, function (response) {
                $log.error('Cannot call the content category rbt update flow service. Error: ', response);

                if (response && response.data && response.data.message) {
                    WorkflowsService.showApiError(response);
                } else {
                    notification({
                        type: 'warning',
                        text: $translate.instant('Subsystems.ContentManagement.Operations.RBT.ContentCategories.Messages.UpdateFlowError')
                    });
                }
            });
        };
    });

})();
