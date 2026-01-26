(function () {

    'use strict';

    angular.module('adminportal.subsystems.contentmanagement.operations.rbt.contentcategories', []);

    var ContentManagementOperationsContentCategoriesRBTModule = angular.module('adminportal.subsystems.contentmanagement.operations.rbt.contentcategories');

    var accessType = function ($stateParams, $state) {
        if($stateParams.accessType){
            return $stateParams.accessType;
        } else {
            $state.go('subsystems.contentmanagement.operations.rbt.contentmetadatas.tones.list');
        }
    };

    ContentManagementOperationsContentCategoriesRBTModule.config(function ($stateProvider) {

        $stateProvider
            .state('subsystems.contentmanagement.operations.rbt.contentcategories', {
                abstract: true,
                url: "/content-categories",
                template: '<div ui-view></div>',
                data: {
                    exportFileName: 'ContentCategoriesRBT',
                    permissions: [
                        'RBT__OPERATIONS_CATEGORY_READ'
                    ]
                }
            })
            // Generic list view for each category
            .state('subsystems.contentmanagement.operations.rbt.contentcategories.list', {
                url: "/:accessType", // Can be ivr, ussd or general
                templateUrl: "subsystems/contentmanagement/operations/rbt/operations.contentcategories.html",
                controller: 'ContentManagementOperationsContentCategoriesRBTCtrl',
                resolve: {
                    accessType: accessType
                }
            })
            // New entry for a specific category
            .state('subsystems.contentmanagement.operations.rbt.contentcategories.new', {
                url: "/:accessType/new",
                templateUrl: "subsystems/contentmanagement/operations/rbt/operations.contentcategories.details.html",
                controller: 'ContentManagementOperationsContentCategoriesRBTNewCtrl',
                resolve: {
                    accessType: accessType
                }
            })
            // Update entry for a specific category
            .state('subsystems.contentmanagement.operations.rbt.contentcategories.update', {
                url: "/:accessType/update/:id",
                templateUrl: "subsystems/contentmanagement/operations/rbt/operations.contentcategories.details.html",
                controller: 'ContentManagementOperationsContentCategoriesRBTUpdateCtrl',
                resolve: {
                    accessType: accessType,
                    contentCategory: function ($stateParams, $q, ContentManagementService, CMPFService) {
                        var deferred = $q.defer();

                        ContentManagementService.getContentCategoryRBT($stateParams.id, ['TONE']).then(function (_category) {
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


    ContentManagementOperationsContentCategoriesRBTModule.controller('ContentManagementOperationsContentCategoriesRBTCommonCtrl', function ($scope, $log, $q, $state, $stateParams, $uibModal, $controller, $filter, $translate, UtilService, SessionService, AuthorizationService, ContentManagementService, CMPFService,
                                                                                                                                            CMS_RBT_STATUS_TYPES, CMS_ACCESS_CHANNELS, DURATION_UNITS, CMS_RBT_REV_SHARE_POLICIES_ALL, DEFAULT_REST_QUERY_LIMIT,
                                                                                                                                            CMS_RBT_REV_SHARE_CARRIER_DEDUCTION, CMS_RBT_REV_SHARE_SPLIT_ACROSS_TONES_ALL) {
        $log.debug('ContentManagementOperationsContentCategoriesRBTCommonCtrl');

        $controller('GenericDateTimeCtrl', {$scope: $scope});
        $controller('ContentManagementOperationsRBTCommonCtrl', {$scope: $scope});

        $scope.sessionOrganization = SessionService.getSessionOrganization();
        $scope.defaultRBTOrganization = SessionService.getDefaultRBTOrganization();
        $scope.username = SessionService.getUsername();
        $scope.accessType = $stateParams.accessType;
        $scope.enableToneOrdering = $scope.accessType === 'IVR' || $scope.accessType === 'USSD';

        $scope.CMS_RBT_STATUS_TYPES = _.without(CMS_RBT_STATUS_TYPES, 'PENDING', 'REJECTED', 'HIDDEN', 'SUSPENDED');
        $scope.CMS_ACCESS_CHANNELS = CMS_ACCESS_CHANNELS;
        $scope.DURATION_UNITS = DURATION_UNITS;
        $scope.CMS_RBT_REV_SHARE_POLICIES = CMS_RBT_REV_SHARE_POLICIES_ALL;
        $scope.CMS_RBT_REV_SHARE_CARRIER_DEDUCTION = CMS_RBT_REV_SHARE_CARRIER_DEDUCTION;
        $scope.CMS_RBT_REV_SHARE_SPLIT_ACROSS_TONES = CMS_RBT_REV_SHARE_SPLIT_ACROSS_TONES_ALL;

        $scope.toneList = [];
        $scope.toneIdsList = [];
        $scope.contentCategoryList = [];
        $scope.contentSubcategoryList = [];
        $scope.playlistList = [];
        $scope.artistList = [];

        $scope.setAccessChannel = function(category) {
            var matchingOption = _.find(CMS_ACCESS_CHANNELS, function(opt) {
                return angular.equals(opt.value.sort(), category.accessChannels.sort());
            });

            return matchingOption ? matchingOption.value : [];
        };

        $scope.cancel = function () {
            $state.go('subsystems.contentmanagement.operations.rbt.contentcategories.list', {accessType: $scope.accessType});
        };

        // Tone Selection
        var setToneSelection = function (selectedTones) {
            $scope.contentCategory.tones = selectedTones;
            $scope.contentCategory.toneIds = _.pluck(selectedTones, 'id');
            $log.debug("ordered toneIds: ", $scope.contentCategory.toneIds);
        };

        $scope.openToneSelection = function () {
            // Configuration for the tone selection modal

            var title = $translate.instant('Subsystems.ContentManagement.Operations.RBT.ContentMetadatas.Tones.Title');
            title += ' [Category = ' + ($scope.contentCategory.name ? $scope.contentCategory.name : 'New Category ') + ' (' + $scope.accessType + ')]';

            var config = {
                titleKey: title,
                dateFilter: {
                    status: 'ACTIVE'
                },
                enableToneOrdering: $scope.enableToneOrdering,
                isAuthorized: $scope.contentCategory.id ? AuthorizationService.canRBTOperationsCategoryUpdate($scope.contentCategory.status) : AuthorizationService.canRBTOperationsCategoryCreate()
            };
            $scope.openToneSelectionModal($scope.contentCategory.tones, setToneSelection, config)
        };

        $scope.$watch('contentCategory.subcategoryIds', function (newValue, oldValue) {
            $log.debug('subcategoryIds changed: ', newValue, oldValue, 'boolean set: ', !(newValue && newValue.length > 0));
            // If there are bound subcategories to this category, tone selection should error out
            if (newValue && newValue !== oldValue) {
                if ($scope.contentCategory.toneIds && $scope.contentCategory.toneIds.length > 0) {
                    UtilService.setError($scope.form, 'selectTones', 'leafCategoryCheck', !(newValue && newValue.length > 0));
                    UtilService.setError($scope.form, 'subcategoryIds', 'leafCategoryCheck', !(newValue && newValue.length > 0));
                }
            }
        });

        $scope.$watch('contentCategory.toneIds', function (newValue, oldValue) {
            $log.debug('ToneIds changed: ', newValue, oldValue);
            if (newValue && newValue !== oldValue) {
                if ($scope.contentCategory.subcategoryIds && $scope.contentCategory.subcategoryIds.length > 0) {
                    UtilService.setError($scope.form, 'selectTones', 'leafCategoryCheck',!(newValue && newValue.length > 0));
                    UtilService.setError($scope.form, 'subcategoryIds', 'leafCategoryCheck',!(newValue && newValue.length > 0));
                }
            }
        });

        $scope.$on('toneIdsUpdated', function (event, toneIdList) {
            $log.debug('Received toneIdsUpdated event with toneIds: ', toneIdList);

            // Update contentCategory.toneIds and trigger the watcher
            $scope.contentCategory.toneIds = toneIdList;
        });

    });

    ContentManagementOperationsContentCategoriesRBTModule.controller('ContentManagementOperationsContentCategoriesRBTCtrl', function ($rootScope, $scope, $log, $controller, $state, $timeout, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                                      Restangular, DateTimeConstants, ContentManagementService, WorkflowsService, SessionService, CMPFService, DEFAULT_REST_QUERY_LIMIT, accessType) {
        $log.debug('ContentManagementOperationsContentCategoriesRBTCtrl');
        $controller('ContentManagementOperationsContentCategoriesRBTCommonCtrl', {
            $scope: $scope
        });
        $scope.accessType = accessType;

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'id',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.ContentCategories.Id'
                },
                {
                    fieldName: 'name',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.ContentCategories.ContentCategory'
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
                statuses: tableParams.settings().$scope.status ? [tableParams.settings().$scope.status] : null,
                accessChannels: $scope.setAccessChannels($scope.accessType)
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

                // WAITING status removed, no BPMS Workflows for Categories
                ContentManagementService.getContentCategoriesRBT(filter.page, filter.limit, filter.sortFieldName, filter.sortOrder, filter.statuses, filter.filterText, filter.accessChannels).then(function (response) {
                    $log.debug("Found records: ", response);

                    $scope.contentCategoryList.list = (response ? response.items : []);

                    params.total(response ? response.totalCount : 0);
                    $defer.resolve($scope.contentCategoryList.list);
                }, function (error) {
                    $log.debug('Error: ', error);
                    params.total(0);
                    $defer.resolve([]);
                });

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
                        return CMPFService.getAllOrganizationsCustom(false, true, [CMPFService.OPERATOR_PROFILE]);
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
                controller: function ($scope, $uibModalInstance, $translate) {
                    var messageText = $translate.instant('CommonLabels.ConfirmationDeactivationMessage');
                    $scope.confirmationMessage = messageText;

                    $scope.ok = function () {
                        $uibModalInstance.close();
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'sm'
            });

            modalInstance.result.then(function () {
                contentCategory.rowSelected = false;

                var contentCategoryItem = {
                    "id": contentCategory.id
                };

                $log.debug('Removing content category: ', contentCategoryItem);

                // Content category rbt delete method of the flow service.
                ContentManagementService.deleteContentCategoryRBT(contentCategoryItem).then(function (response) {
                    if (response && response.code === 2003) {
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
                        var message = $translate.instant('Subsystems.ContentManagement.Operations.RBT.ContentCategories.Messages.DeleteFlowError');

                        // Add detail to the response message
                        if(response && response.data && response.data.code > 3000){
                            message = message + '<br>'+ '[' + response.data.code+ '] - ' + (response.data.detail ? response.data.detail : '');
                            message = message.replace(/delete/gi, 'deactivate');
                        }

                        notification({
                            type: 'warning',
                            text: message
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

        $scope.dateHolder.startDate = moment().startOf('day').toDate();
        $scope.dateHolder.endDate = moment().endOf('day').add(10, 'years').toDate();

        $scope.contentCategory = {
            status: 'ACTIVE',
            subscriptionEnabled: true,
            promoted: false,
            tags: [],
            subcategoryIds: [],
            artistIds: [],
            playlistIds: [],
            toneIds: [],
            chargingDetails: {
                chargingPeriod: {
                    duration: 30,
                    unit: $scope.DURATION_UNITS[0].key
                },
                price: 0,
                originalPrice: null,
                subscriptionCode: null,
                revShare: {
                    type: 'EQUAL'
                }
            },
            organizationName: $scope.defaultRBTOrganization.name,
            organizationId: $scope.defaultRBTOrganization.id
        };
        // Set default accessChannels value based on accessType (IVR, USSD, or GENERAL)
        angular.forEach($scope.CMS_ACCESS_CHANNELS, function (channel) {
            if (channel.label.indexOf($scope.accessType) !== -1) {
                $scope.contentCategory.accessChannels = channel.value;
            }
        });

        $scope.sendToWorkflow = function (contentCategory) {
            var contentCategoryItem = {
                "name": contentCategory.name,
                "organizationId": contentCategory.organizationId,
                "organizationName": contentCategory.organizationName,
                "status": contentCategory.status,
                "launchDate": ($scope.dateHolder.startDate ? $filter('date')($scope.dateHolder.startDate, 'yyyy-MM-dd') + 'T00:00:00' : ''),
                "expireDate": ($scope.dateHolder.endDate ? $filter('date')($scope.dateHolder.endDate, 'yyyy-MM-dd') + 'T00:00:00' : ''),
                "names": [],
                "descriptions": [],
                "tags": contentCategory.tags,
                "accessChannels": contentCategory.accessChannels,
                "cardImageId": "",
                "cardImageUrl": "",
                "thumbnailId": "",
                "thumbnailUrl": "",
                "coverImageId": "",
                "coverImageUrl": "",
                "defaultToneId": contentCategory.defaultToneId,
                "subscriptionEnabled": contentCategory.subscriptionEnabled,
                "promoted": contentCategory.promoted,
                "subcategoryIds": contentCategory.subcategoryIds,
                "toneIds": contentCategory.tones ? _.pluck(contentCategory.tones, 'id') : contentCategory.toneIds,
                "artistIds": contentCategory.artistIds,
                "playlistIds": contentCategory.playlistIds,
                "contentType": "CATEGORY",
                "dateCreated": "",
                "dateUpdated": "",
                "descriptionList": [],
                "dtoneId": null,
                "featuredDescriptionList": [],
                "featuredDescriptions": [],
                "featuredTitleList": [],
                "featuredTitles": [],
                "id": "",
                "legacyId": null,
                "nameList": [],
                "numberOfTones": null,
                "offers": [],
                "totalSubscriptionCount": 0
            };

            // names
            contentCategoryItem.names.push({ lang: 'en', name: contentCategory.nameEn });
            contentCategoryItem.names.push({ lang: 'ar', name: contentCategory.nameAr });

            // descriptions
            contentCategoryItem.descriptions.push({ lang: 'en', description: contentCategory.descriptionEn });
            contentCategoryItem.descriptions.push({ lang: 'ar', description: contentCategory.descriptionAr });

            // featuredTitles & featuredDescriptions (only if promoted)
            if (contentCategory.promoted) {
                contentCategoryItem.featuredTitles.push({ lang: 'en', name: contentCategory.featuredTitleEn });
                contentCategoryItem.featuredTitles.push({ lang: 'ar', name: contentCategory.featuredTitleAr });
                contentCategoryItem.featuredDescriptions.push({ lang: 'en', description: contentCategory.featuredDescriptionEn });
                contentCategoryItem.featuredDescriptions.push({ lang: 'ar', description: contentCategory.featuredDescriptionAr });
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
                        "operatorDeductionType": contentCategory.chargingDetails.revShare.operatorDeductionType || "NONE",
                        "operatorDeduction": contentCategory.chargingDetails.revShare.operatorDeduction || 0,
                        "type": contentCategory.chargingDetails.revShare.type || null,
                        "baseShareType": "NONE",
                        "baseShare": 0,
                        "operatorShare": 0
                    };
                }
                contentCategoryItem.offers = [ offer ];
            }

            // Access Channels
            contentCategoryItem.accessChannels = contentCategory.accessChannels;

            // IVR & USSD - no artists, no playlists should be related
            if ($scope.accessType === 'IVR' || $scope.accessType === 'USSD') {
                contentCategoryItem.artistIds = [];
                contentCategoryItem.playlistIds = [];
            }

            $log.debug('Creating content category: ', contentCategoryItem);

            var cardImage = contentCategory.cardImage;
            var coverImage = contentCategory.coverImage;
            // Generate IDs upfront for any images that will be uploaded
            if (cardImage && cardImage.name) {
                contentCategoryItem.cardImageId = UtilService.generateObjectId();
            }
            if (coverImage && coverImage.name) {
                contentCategoryItem.coverImageId = UtilService.generateObjectId();
            }

            // track files in case they need to be deleted
            var preUploaded = { card: false };

            function bestEffortDelete(fileId) {
                if (!fileId) return $q.when();
                return ContentManagementService.deleteFile(fileId)["catch"](angular.noop);
            }

            // Pre-upload: Card image (only if provided)
            var preUploadPromise = $q.when();
            if (cardImage && cardImage.name) {
                preUploadPromise = ContentManagementService
                    .uploadFile(cardImage, cardImage.name, contentCategoryItem.cardImageId)
                    .then(function () {
                        preUploaded.card = true;
                    });
            }

            $log.debug('Preparing to create content category (with pre-uploaded card if any): ', contentCategoryItem);

            // Promise Chain
            // pre-upload, then create metadata, then post-upload, then notify success
            preUploadPromise
                .then(function () {
                    // Create metadata AFTER card upload
                    return ContentManagementService.createContentCategoryRBT(contentCategoryItem);
                })
                .then(function (response) {
                    if (!response || response.code !== 2001) {
                        // Force catch block to handle rollback
                        var err = new Error('Create failed');
                        err.apiResponse = response;
                        throw err;
                    }

                    $log.debug('Save Success. Response: ', response);

                    // post-uploads - handle optional files
                    var postUploads = [];

                    if (coverImage && coverImage.name) {
                        postUploads.push(ContentManagementService.uploadFile(coverImage, coverImage.name, contentCategoryItem.coverImageId));
                    }

                    return $q.all(postUploads).then(function () {
                        notification.flash({
                            type: 'success',
                            text: $translate.instant('Subsystems.ContentManagement.Operations.RBT.ContentCategories.Messages.CreateFlowStartedSuccessful' + ($rootScope.isAdminUser ? 'ForAdmin' : ''))
                        });
                        $scope.cancel();
                    });
                })
                .catch(function (err) {
                    $log.error('Create flow failed, starting rollback if needed. Error: ', err);

                    var cleanup = [];
                    if (preUploaded.card && contentCategoryItem.cardImageId) {
                        cleanup.push(bestEffortDelete(contentCategoryItem.cardImageId));
                    }

                    return $q.all(cleanup).finally(function () {
                        var res = err && err.apiResponse ? err.apiResponse : err;
                        if (res && res.data && res.data.message) {
                            WorkflowsService.showApiError(res);
                        } else if (res && res.apiResponse) {
                            WorkflowsService.showApiError(res.apiResponse);
                        } else {
                            notification({
                                type: 'warning',
                                text: $translate.instant('Subsystems.ContentManagement.Operations.RBT.ContentCategories.Messages.CreateFlowError')
                            });
                        }
                    });
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
        $scope.contentCategory.accessChannels = $scope.setAccessChannel(contentCategory.category);

        // expanded tones list is not ordered, so we need to sort it by the order of toneIds
        $scope.contentCategory.tones = _.sortBy($scope.contentCategory.tones, function(tone) {
            return _.indexOf($scope.contentCategory.toneIds, tone.id);
        });


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

        $scope.contentCategory.featuredTitles = $scope.contentCategory.featuredTitles ? $scope.contentCategory.featuredTitles : [];
        $scope.contentCategory.featuredDescriptions = $scope.contentCategory.featuredDescriptions ? $scope.contentCategory.featuredDescriptions : [];
        if ($scope.contentCategory.featuredTitles && $scope.contentCategory.featuredTitles.length > 0) {
            $scope.contentCategory.featuredTitleEn = 'N/A';
            var foundContentMetadataNameEn = _.findWhere($scope.contentCategory.featuredTitles, {lang: 'en'});
            if (foundContentMetadataNameEn) {
                $scope.contentCategory.featuredTitleEn = foundContentMetadataNameEn.name;
            }

            $scope.contentCategory.featuredTitleAr = 'N/A';
            var foundContentMetadataNameAr = _.findWhere($scope.contentCategory.featuredTitles, {lang: 'ar'});
            if (foundContentMetadataNameAr) {
                $scope.contentCategory.featuredTitleAr = foundContentMetadataNameAr.name;
            }
        }
        if ($scope.contentCategory.featuredDescriptions && $scope.contentCategory.featuredDescriptions.length > 0) {
            $scope.contentCategory.featuredDescriptionEn = 'N/A';
            var foundContentMetadataDescriptionEn = _.findWhere($scope.contentCategory.featuredDescriptions, {lang: 'en'});
            if (foundContentMetadataDescriptionEn) {
                $scope.contentCategory.featuredDescriptionEn = foundContentMetadataDescriptionEn.description;
            }

            $scope.contentCategory.featuredDescriptionAr = 'N/A';
            var foundContentMetadataDescriptionAr = _.findWhere($scope.contentCategory.featuredDescriptions, {lang: 'ar'});
            if (foundContentMetadataDescriptionAr) {
                $scope.contentCategory.featuredDescriptionAr = foundContentMetadataDescriptionAr.description;
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
            var original = $scope.originalContentCategory;

            var contentCategoryItem = {
                // Unchanged / server-controlled fields
                "id": original.id,
                "organizationId": original.organizationId,
                "organizationName": original.organizationName,
                "legacyId": original.legacyId,
                "contentType": original.contentType,
                "dateCreated": original.dateCreated,
                "totalSubscriptionCount": original.totalSubscriptionCount,
                // Will be decided below for each image
                "coverImageId": original.coverImageId,
                "cardImageId": original.cardImageId,
                "thumbnailId": original.thumbnailId,
                // Changed fields
                "name": contentCategory.name,
                "status": contentCategory.status,
                "launchDate": ($scope.dateHolder.startDate ? $filter('date')($scope.dateHolder.startDate, 'yyyy-MM-dd') + 'T00:00:00' : ''),
                "expireDate": ($scope.dateHolder.endDate ? $filter('date')($scope.dateHolder.endDate, 'yyyy-MM-dd') + 'T00:00:00' : ''),
                "defaultToneId": contentCategory.defaultToneId,
                "names": [],
                "descriptions": [],
                "tags": contentCategory.tags,
                "accessChannels": contentCategory.accessChannels,
                "subscriptionEnabled": contentCategory.subscriptionEnabled,
                "promoted": contentCategory.promoted,
                "artistIds": contentCategory.artistIds,
                "playlistIds": contentCategory.playlistIds,
                "subcategoryIds": contentCategory.subcategoryIds,
                "toneIds": contentCategory.tones ? _.pluck(contentCategory.tones, 'id') : contentCategory.toneIds,
                "cardImageUrl": contentCategory.cardImageUrl,
                "thumbnailUrl": contentCategory.thumbnailUrl,
                "coverImageUrl": contentCategory.coverImageUrl,
                "dateUpdated": $filter('date')(Date.now(), 'yyyy-MM-dd') + 'T00:00:00',
                "descriptionList": contentCategory.descriptionList,
                "dtoneId": contentCategory.dtoneId,
                "featuredDescriptionList": contentCategory.featuredDescriptionList,
                "featuredDescriptions": contentCategory.featuredDescriptions,
                "featuredTitleList": contentCategory.featuredTitleList,
                "featuredTitles": contentCategory.featuredTitles,
                "nameList": contentCategory.nameList,
                "numberOfTones": contentCategory.numberOfTones,
                "offers": contentCategory.offers
            };

            // names
            contentCategoryItem.names.push({ lang: 'en', name: contentCategory.nameEn });
            contentCategoryItem.names.push({ lang: 'ar', name: contentCategory.nameAr });

            // descriptions
            contentCategoryItem.descriptions.push({ lang: 'en', description: contentCategory.descriptionEn });
            contentCategoryItem.descriptions.push({ lang: 'ar', description: contentCategory.descriptionAr });

            // If category is promoted, ensure featured titles & descriptions
            if (contentCategoryItem.promoted) {
                contentCategoryItem.featuredTitles.push({ lang: 'en', name: contentCategory.featuredTitleEn });
                contentCategoryItem.featuredTitles.push({ lang: 'ar', name: contentCategory.featuredTitleAr });

                contentCategoryItem.featuredDescriptions.push({ lang: 'en', description: contentCategory.featuredDescriptionEn });
                contentCategoryItem.featuredDescriptions.push({ lang: 'ar', description: contentCategory.featuredDescriptionAr });
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
                        "operatorDeductionType": contentCategory.chargingDetails.revShare.operatorDeductionType || "NONE",
                        "operatorDeduction": contentCategory.chargingDetails.revShare.operatorDeduction || 0,
                        "type": contentCategory.chargingDetails.revShare.type || null,
                        "baseShareType": "NONE",
                        "baseShare": 0,
                        "operatorShare": 0
                    };
                }

                contentCategoryItem.offers = [ offer ];
            }

            // Access Channels - Set default accessChannels value based on accessType (IVR, USSD, or GENERAL)
            angular.forEach($scope.CMS_ACCESS_CHANNELS, function (channel) {
                if (channel.value.indexOf($scope.accessType) !== -1) {
                    contentCategoryItem.accessChannels = channel.value;
                }
            });

            // IVR & USSD - no artists, no playlists should be related
            if ($scope.accessType === 'IVR' || $scope.accessType === 'USSD') {
                contentCategoryItem.artistIds = [];
                contentCategoryItem.playlistIds = [];
            }

            // Image File Handling
            var coverImage = contentCategory.coverImage;
            var cardImage  = contentCategory.cardImage;

            var originalCoverId     = original.coverImageId;
            var originalCardId      = original.cardImageId;

            var preUploadedCard = false;
            var newCardId = null;

            var postUploadTasks = [];
            var filesToDeleteAfterSuccess = [];

            function bestEffortDelete(fileId) {
                if (!fileId) return $q.when();
                return ContentManagementService.deleteFile(fileId)["catch"](angular.noop);
            }

            // Card Image
            var cardRemoved  = (!cardImage || !cardImage.name) && !!originalCardId; // User cleared card image
            var cardReplaced = (cardImage && cardImage.name && (cardImage instanceof File)); // User updated card image

            if (cardRemoved) {
                contentCategoryItem.cardImageId = "";
                filesToDeleteAfterSuccess.push(originalCardId);
            } else if (cardReplaced) {
                newCardId = UtilService.generateObjectId();
                contentCategoryItem.cardImageId = newCardId;

                if (originalCardId) {
                    filesToDeleteAfterSuccess.push(originalCardId);
                }
            } else {
                contentCategoryItem.cardImageId = originalCardId;
            }

            // Cover Image
            var coverRemoved  = (!coverImage || !coverImage.name) && !!originalCoverId;
            var coverReplaced = (coverImage && coverImage.name && (coverImage instanceof File));

            if (coverRemoved) {
                contentCategoryItem.coverImageId = "";
                filesToDeleteAfterSuccess.push(originalCoverId);
            } else if (coverReplaced) {
                // Reuse existing ID if present, otherwise assign new id.
                contentCategoryItem.coverImageId = originalCoverId || UtilService.generateObjectId();

                postUploadTasks.push(function () {
                    return ContentManagementService.uploadFile(
                        coverImage,
                        coverImage.name,
                        contentCategoryItem.coverImageId
                    );
                });
            } else {
                contentCategoryItem.coverImageId = originalCoverId;
            }

            $log.debug('Updating content category (with resolved image IDs): ', contentCategoryItem);

            // PROMISE CHAIN
            var preUploadPromise = $q.when();

            if (cardReplaced) {
                preUploadPromise = ContentManagementService
                    .uploadFile(cardImage, cardImage.name, newCardId)
                    .then(function () {
                        preUploadedCard = true;
                    });
            }

            preUploadPromise
                .then(function () {
                    return ContentManagementService.updateContentCategoryRBT(contentCategoryItem);
                })
                .then(function (response) {
                    if (!response || response.code !== 2002) {
                        var err = new Error('Update failed');
                        err.apiResponse = response;
                        throw err;
                    }

                    $log.debug('Update Success. Response: ', response);

                    // After successful metadata update:
                    //    - upload cover/thumbnail (if any)
                    //    - delete old files that were removed/replaced
                    var followUps = [];

                    angular.forEach(postUploadTasks, function (fn) {
                        followUps.push(fn());
                    });

                    angular.forEach(filesToDeleteAfterSuccess, function (fileId) {
                        followUps.push(bestEffortDelete(fileId));
                    });

                    return $q.all(followUps).then(function () {
                        notification.flash({
                            type: 'success',
                            text: $translate.instant(
                                'Subsystems.ContentManagement.Operations.RBT.ContentCategories.Messages.UpdateFlowStartedSuccessful'
                                + ($rootScope.isAdminUser ? 'ForAdmin' : '')
                            )
                        });

                        $scope.cancel();
                    });
                })
                .catch(function (err) {
                    // Rollback if metadata update failed
                    $log.error('Cannot complete content category update flow. Error: ', err);

                    var cleanup = [];

                    if (preUploadedCard && newCardId) {
                        cleanup.push(bestEffortDelete(newCardId));
                    }

                    return $q.all(cleanup).finally(function () {
                        var res = err && err.apiResponse ? err.apiResponse : err;

                        if (res && res.data && res.data.message) {
                            WorkflowsService.showApiError(res);
                        } else if (res && res.apiResponse) {
                            WorkflowsService.showApiError(res.apiResponse);
                        } else {
                            notification({
                                type: 'warning',
                                text: $translate.instant(
                                    'Subsystems.ContentManagement.Operations.RBT.ContentCategories.Messages.UpdateFlowError'
                                )
                            });
                        }
                    });
                });
        };

    });

})();
