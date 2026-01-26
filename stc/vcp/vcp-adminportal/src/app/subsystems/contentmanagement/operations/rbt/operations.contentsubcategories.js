(function () {

    'use strict';

    angular.module('adminportal.subsystems.contentmanagement.operations.rbt.contentsubcategories', []);

    var ContentManagementOperationsContentSubcategoriesRBTModule = angular.module('adminportal.subsystems.contentmanagement.operations.rbt.contentsubcategories');

    var accessType = function ($stateParams, $state) {
        if($stateParams.accessType){
            return $stateParams.accessType;
        } else {
            $state.go('subsystems.contentmanagement.operations.rbt.contentmetadatas.tones.list');
        }
    };

    ContentManagementOperationsContentSubcategoriesRBTModule.config(function ($stateProvider) {

        $stateProvider
            .state('subsystems.contentmanagement.operations.rbt.contentsubcategories', {
                abstract: true,
                url: "/content-subcategories",
                template: '<div ui-view></div>',
                data: {
                    exportFileName: 'ContentSubcategoriesRBT',
                    permissions: [
                        'RBT__OPERATIONS_SUBCATEGORY_READ'
                    ]
                }
            })
            // Generic list view for each subcategory
            .state('subsystems.contentmanagement.operations.rbt.contentsubcategories.list', {
                url: "/:accessType", // Can be ivr, ussd or general
                templateUrl: "subsystems/contentmanagement/operations/rbt/operations.contentsubcategories.html",
                controller: 'ContentManagementOperationsContentSubcategoriesRBTCtrl',
                resolve: {
                    accessType: accessType
                }
            })
            // New entry for a specific subcategory
            .state('subsystems.contentmanagement.operations.rbt.contentsubcategories.new', {
                url: "/:accessType/new",
                templateUrl: "subsystems/contentmanagement/operations/rbt/operations.contentsubcategories.details.html",
                controller: 'ContentManagementOperationsContentSubcategoriesRBTNewCtrl',
                resolve: {
                    accessType: accessType
                }
            })
            // Update entry for a specific subcategory
            .state('subsystems.contentmanagement.operations.rbt.contentsubcategories.update', {
                url: "/:accessType/update/:id",
                templateUrl: "subsystems/contentmanagement/operations/rbt/operations.contentsubcategories.details.html",
                controller: 'ContentManagementOperationsContentSubcategoriesRBTUpdateCtrl',
                resolve: {
                    accessType: accessType,
                    contentSubcategory: function ($stateParams, $q, ContentManagementService, CMPFService) {
                        var deferred = $q.defer();

                        ContentManagementService.getSubcategoryRBT($stateParams.id, ['TONE']).then(function (_subcategory) {
                            CMPFService.getOperator(_subcategory.subcategory.organizationId, true).then(function (_organization) {
                                _subcategory.subcategory.organization = _organization;

                                deferred.resolve(_subcategory);
                            });
                        });

                        return deferred.promise;
                    }
                }
            });
    });


    ContentManagementOperationsContentSubcategoriesRBTModule.controller('ContentManagementOperationsContentSubcategoriesRBTCommonCtrl', function ($scope, $log, $q, $state, $stateParams, $uibModal, $controller, $translate, $filter, UtilService, SessionService, AuthorizationService, ContentManagementService, CMPFService,
                                                                                                                                            CMS_RBT_STATUS_TYPES, CMS_ACCESS_CHANNELS, DURATION_UNITS, CMS_RBT_REV_SHARE_POLICIES_ALL, DEFAULT_REST_QUERY_LIMIT,
                                                                                                                                            CMS_RBT_REV_SHARE_CARRIER_DEDUCTION, CMS_RBT_REV_SHARE_SPLIT_ACROSS_TONES_ALL) {
        $log.debug('ContentManagementOperationsContentSubcategoriesRBTCommonCtrl');

        $controller('GenericDateTimeCtrl', {$scope: $scope});
        $controller('ContentManagementOperationsRBTCommonCtrl', {$scope: $scope});

        $scope.defaultRBTOrganization = SessionService.getDefaultRBTOrganization();
        $scope.sessionOrganization = SessionService.getSessionOrganization();
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

        // Tone Selection
        var setToneSelection = function (selectedTones) {
            $scope.contentSubcategory.tones = selectedTones;
            $scope.contentSubcategory.toneIds = _.pluck(selectedTones, 'id');
            $log.debug("ordered toneIds: ", $scope.contentSubcategory.toneIds);
        };

        $scope.openToneSelection = function () {
            // Configuration for the tone selection modal

            var title = $translate.instant('Subsystems.ContentManagement.Operations.RBT.ContentMetadatas.Tones.Title');
            title += ' [Subcategory = ' + ($scope.contentSubcategory.name ? $scope.contentSubcategory.name : 'New Subcategory ') + ' (' + $scope.accessType + ')]';

            var config = {
                titleKey: title,
                dateFilter: {
                    status: 'ACTIVE'
                },
                enableToneOrdering: $scope.enableToneOrdering,
                isAuthorized: $scope.contentSubcategory.id ? AuthorizationService.canRBTOperationsSubcategoryUpdate($scope.contentSubcategory.status) : AuthorizationService.canRBTOperationsSubcategoryCreate()
            };
            $scope.openToneSelectionModal($scope.contentSubcategory.tones, setToneSelection, config)
        };

        $scope.setAccessChannel = function(subcategory) {
            var matchingOption = _.find(CMS_ACCESS_CHANNELS, function(opt) {
                return angular.equals(opt.value.sort(), subcategory.accessChannels.sort());
            });

            return matchingOption ? matchingOption.value : [];
        };

        $scope.cancel = function () {
            $state.go('subsystems.contentmanagement.operations.rbt.contentsubcategories.list', {accessType: $scope.accessType});
        };
    });

    ContentManagementOperationsContentSubcategoriesRBTModule.controller('ContentManagementOperationsContentSubcategoriesRBTCtrl', function ($rootScope, $scope, $log, $controller, $state, $timeout, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                                      Restangular, DateTimeConstants, ContentManagementService, WorkflowsService, SessionService, CMPFService, DEFAULT_REST_QUERY_LIMIT, accessType) {
        $log.debug('ContentManagementOperationsContentSubcategoriesRBTCtrl');
        $controller('ContentManagementOperationsContentSubcategoriesRBTCommonCtrl', {
            $scope: $scope
        });
        $scope.accessType = accessType;

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'id',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.ContentSubcategories.Id'
                },
                {
                    fieldName: 'name',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.ContentSubcategories.SubcategoryTitle'
                },
                {
                    fieldName: 'organizationName',
                    headerKey: 'CommonLabels.Organization'
                },
                {
                    fieldName: 'subscriptionEnabled',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.ContentSubcategories.SubscriptionEnabled',
                    filter: {name: 'YesNoFilter'}
                },
                {
                    fieldName: 'promoted',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.ContentSubcategories.Promoted',
                    filter: {name: 'YesNoFilter'}
                },
                {
                    fieldName: 'totalSubscriptionCount',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.ContentSubcategories.Subscriptions'
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
            // Filter CMS_ACCESS_CHANNELS to find the matching entry
            var accessChannel = $scope.CMS_ACCESS_CHANNELS.find(function (channel) {
                return channel.label === $scope.accessType;
            });

            result.filter = {
                statuses: tableParams.settings().$scope.status ? [tableParams.settings().$scope.status] : null,
                accessChannels: accessChannel ? accessChannel.value : null
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
        $scope.contentSubcategoryList = {
            list: [],
            tableParams: {}
        };

        $scope.originalContentSubcategories = angular.copy($scope.contentSubcategoryList.list);

        $scope.contentSubcategoryList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "id": 'asc'
            }
        }, {
            total: $scope.contentSubcategoryList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var preparedFilter = $scope.prepareFilter(params);

                var filter = preparedFilter.filter;
                var additionalFilterFields = preparedFilter.additionalFilterFields;

                // WAITING status removed, no BPMS Workflows for Categories
                ContentManagementService.getSubcategoriesRBT(filter.page, filter.limit, filter.sortFieldName, filter.sortOrder, filter.statuses, filter.filterText, filter.accessChannels).then(function (response) {
                    $log.debug("Found records: ", response);

                    $scope.contentSubcategoryList.list = (response ? response.items : []);

                    params.total(response ? response.totalCount : 0);
                    $defer.resolve($scope.contentSubcategoryList.list);
                }, function (error) {
                    $log.debug('Error: ', error);
                    params.total(0);
                    $defer.resolve([]);
                });

            }
        });
        // END - Content category list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.contentSubcategoryList.tableParams.settings().$scope.filterText = filterText;
            $scope.contentSubcategoryList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.contentSubcategoryList.tableParams.page(1);
            $scope.contentSubcategoryList.tableParams.reload();
        }, 750);

        $scope.stateFilter = 'ALL';
        $scope.stateFilterChange = function (state) {
            if (state === 'ALL') {
                delete $scope.contentSubcategoryList.tableParams.settings().$scope.status;
            } else {
                $scope.contentSubcategoryList.tableParams.settings().$scope.status = state;
            }

            $scope.reloadTable($scope.contentSubcategoryList.tableParams);
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

        $scope.remove = function (contentSubcategory) {
            contentSubcategory.rowSelected = true;

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
                contentSubcategory.rowSelected = false;

                var contentSubcategoryItem = {
                    "id": contentSubcategory.id
                };

                $log.debug('Removing content subcategory: ', contentSubcategoryItem);

                // Content category rbt delete method of the flow service.
                ContentManagementService.deleteSubcategoryRBT(contentSubcategoryItem).then(function (response) {
                    if (response && response.code === 2003) {
                        $log.debug('Removed content subcategory rbt: ', contentSubcategoryItem, ', response: ', response);

                        notification.flash({
                            type: 'success',
                            text: $translate.instant('Subsystems.ContentManagement.Operations.RBT.ContentSubcategories.Messages.DeleteFlowStartedSuccessful' + ($rootScope.isAdminUser ? 'ForAdmin' : ''))
                        });

                        $state.transitionTo($state.current, {}, {reload: true, inherit: true, notify: true});
                    } else {
                        WorkflowsService.showApiError(response);
                    }
                }, function (response) {
                    $log.error('Cannot call the content subcategory rbt delete flow service. Error: ', response);

                    if (response && response.data && response.data.message) {
                        WorkflowsService.showApiError(response);
                    } else {
                        var message = $translate.instant('Subsystems.ContentManagement.Operations.RBT.ContentSubcategories.Messages.DeleteFlowError');

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
                contentSubcategory.rowSelected = false;
            });
        };

        // Playlists
        $scope.viewPlaylists = function (contextKey, entity, titleKey) {
            $uibModal.open({
                templateUrl: 'subsystems/contentmanagement/operations/rbt/operations.playlists.modal.html',
                controller: 'ContentManagementOperationsRBTPlaylistsModalCtrl',
                size: 'lg',
                resolve: {
                    playlists: function (ContentManagementService, DEFAULT_REST_QUERY_LIMIT) {
                        return ContentManagementService.searchPlayListsBySubCategory(0,DEFAULT_REST_QUERY_LIMIT,null,entity.id);
                    },
                    entity: function() {
                        return entity;
                    },
                    titleKey: function(){
                        return titleKey;
                    }

                }
            });
        };

        // Tones
        $scope.viewTones = function (contextKey, entity, titleKey) {
            $uibModal.open({
                templateUrl: 'subsystems/contentmanagement/operations/rbt/operations.tones.modal.html',
                controller: 'ContentManagementOperationsRBTTonesModalCtrl',
                size: 'lg',
                resolve: {
                    tones: function (ContentManagementService, DEFAULT_REST_QUERY_LIMIT) {
                        return   ContentManagementService.searchTonesBySubCategory(0,DEFAULT_REST_QUERY_LIMIT,null,entity.id);
                    },
                    entity: function() {
                        return entity;
                    },
                    titleKey: function(){
                        return titleKey;
                    }
                }
            });
        };
    });

    ContentManagementOperationsContentSubcategoriesRBTModule.controller('ContentManagementOperationsContentSubcategoriesRBTNewCtrl', function ($rootScope, $scope, $log, $state, $controller, $q, $filter, $translate, notification, UtilService, DateTimeConstants,
                                                                                                                                         CMPFService, WorkflowsService, ContentManagementService) {
        $log.debug('ContentManagementOperationsContentSubcategoriesRBTNewCtrl');

        $controller('ContentManagementOperationsContentSubcategoriesRBTCommonCtrl', {
            $scope: $scope
        });

        $scope.dateHolder.startDate = moment().startOf('day').toDate();
        $scope.dateHolder.endDate = moment().endOf('day').add(10, 'years').toDate();

        $scope.contentSubcategory = {
            status: 'ACTIVE',
            subscriptionEnabled: true,
            promoted: false,
            tags: [],
            playlistIds: [],
            artistIds: [],
            toneIds: [],
            featuredDescriptions: [],
            featuredTitles: [],
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
            },
            organizationName: $scope.defaultRBTOrganization.name,
            organizationId: $scope.defaultRBTOrganization.id
        };

        // Set default accessChannels value based on accessType (IVR, USSD, or GENERAL)
        angular.forEach($scope.CMS_ACCESS_CHANNELS, function (channel) {
            if (channel.label.indexOf($scope.accessType) !== -1) {
                $scope.contentSubcategory.accessChannels = channel.value;
            }

        });

        $scope.sendToWorkflow = function (contentSubcategory) {
            var contentSubcategoryItem = {
                "name": contentSubcategory.name,
                "organizationId": contentSubcategory.organizationId,
                "organizationName": contentSubcategory.organizationName,
                "status": contentSubcategory.status,
                "launchDate": ($scope.dateHolder.startDate ? $filter('date')($scope.dateHolder.startDate, 'yyyy-MM-dd') + 'T00:00:00' : ''),
                "expireDate": ($scope.dateHolder.endDate ? $filter('date')($scope.dateHolder.endDate, 'yyyy-MM-dd') + 'T00:00:00' : ''),
                "names": [],
                "descriptions": [],
                "tags": contentSubcategory.tags,
                "accessChannels": contentSubcategory.accessChannels,
                "cardImageId": "",
                "cardImageUrl": "",
                "thumbnailId": "",
                "thumbnailUrl": "",
                "coverImageId": "",
                "coverImageUrl": "",
                "defaultToneId": contentSubcategory.defaultToneId,
                "subscriptionEnabled": contentSubcategory.subscriptionEnabled,
                "promoted": contentSubcategory.promoted,
                "artistIds": contentSubcategory.artistIds,
                "playlistIds": contentSubcategory.playlistIds,
                "categoryId": contentSubcategory.categoryId,
                "toneIds": contentSubcategory.tones ? _.pluck(contentSubcategory.tones, 'id') : contentSubcategory.toneIds,
                "contentType": "SUBCATEGORY",
                "dateCreated": "20:02:00 T00:00:00",
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
                "subcategoryIds": [],
                "numberOfTones": null,
                "offers": [],
                "totalSubscriptionCount": 0
            };

            // names
            contentSubcategoryItem.names.push({ lang: 'en', name: contentSubcategory.nameEn });
            contentSubcategoryItem.names.push({ lang: 'ar', name: contentSubcategory.nameAr });

            // descriptions
            contentSubcategoryItem.descriptions.push({ lang: 'en', description: contentSubcategory.descriptionEn });
            contentSubcategoryItem.descriptions.push({ lang: 'ar', description: contentSubcategory.descriptionAr });

            // featuredTitles & featuredDescriptions (only if promoted)
            if (contentSubcategory.promoted) {
                contentSubcategoryItem.featuredTitles.push({ lang: 'en', name: contentSubcategory.featuredTitleEn });
                contentSubcategoryItem.featuredTitles.push({ lang: 'ar', name: contentSubcategory.featuredTitleAr });
                contentSubcategoryItem.featuredDescriptions.push({ lang: 'en', description: contentSubcategory.featuredDescriptionEn });
                contentSubcategoryItem.featuredDescriptions.push({ lang: 'ar', description: contentSubcategory.featuredDescriptionAr });
            }

            // Charging Details
            if (contentSubcategory.chargingDetails) {
                var offer = {
                    "chargingPeriodDetail": UtilService.convertSimpleObjectToPeriod(contentSubcategory.chargingDetails.chargingPeriod),
                    "price": contentSubcategory.chargingDetails.price,
                    "subscriptionCode": contentSubcategory.chargingDetails.subscriptionCode,
                    "revSharePolicy": contentSubcategory.chargingDetails.revSharePolicy
                };

                if (contentSubcategory.chargingDetails.revSharePolicy === 'COMPLEX') {
                    offer.revShare = {
                        "operatorDeductionType": contentSubcategory.chargingDetails.revShare.operatorDeductionType ? contentSubcategory.chargingDetails.revShare.operatorDeductionType : "NONE",
                        "operatorDeduction": contentSubcategory.chargingDetails.revShare.operatorDeduction ? contentSubcategory.chargingDetails.revShare.operatorDeduction : 0,
                        "type": contentSubcategory.chargingDetails.revShare.type ? contentSubcategory.chargingDetails.revShare.type : null,
                        "baseShareType": "NONE",
                        "baseShare": 0,
                        "operatorShare": 0
                    };
                }

                contentSubcategoryItem.offers = [ offer ];
            }

            // Access Channels
            contentSubcategoryItem.accessChannels = contentSubcategory.accessChannels;

            // IVR & USSD - no artists, no playlists should be related
            if ($scope.accessType === 'IVR' || $scope.accessType === 'USSD') {
                contentSubcategoryItem.artistIds = [];
                contentSubcategoryItem.playlistIds = [];
            }

            $log.debug('Creating content subcategory: ', contentSubcategoryItem);

            var cardImage = contentSubcategory.cardImage;
            var coverImage = contentSubcategory.coverImage;
            // Generate IDs upfront for any images that will be uploaded
            if (cardImage && cardImage.name) {
                contentSubcategoryItem.cardImageId = UtilService.generateObjectId();
            }
            if (coverImage && coverImage.name) {
                contentSubcategoryItem.coverImageId = UtilService.generateObjectId();
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
                    .uploadFile(cardImage, cardImage.name, contentSubcategoryItem.cardImageId)
                    .then(function () {
                        preUploaded.card = true;
                    });
            }

            $log.debug('Preparing to create content category (with pre-uploaded card if any): ', contentSubcategoryItem);

            // Promise Chain
            // pre-upload, then create metadata, then post-upload, then notify success
            preUploadPromise
                .then(function () {
                    // Create metadata after card upload
                    return ContentManagementService.createSubcategoryRBT(contentSubcategoryItem);
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
                        postUploads.push(ContentManagementService.uploadFile(coverImage, coverImage.name, contentSubcategoryItem.coverImageId));
                    }

                    return $q.all(postUploads).then(function () {
                        notification.flash({
                            type: 'success',
                            text: $translate.instant('Subsystems.ContentManagement.Operations.RBT.ContentSubcategories.Messages.CreateFlowStartedSuccessful' + ($rootScope.isAdminUser ? 'ForAdmin' : ''))
                        });
                        $scope.cancel();
                    });
                })
                .catch(function (err) {
                    $log.error('Create flow failed, starting rollback if needed. Error: ', err);

                    var cleanup = [];
                    if (preUploaded.card && contentSubcategoryItem.cardImageId) {
                        cleanup.push(bestEffortDelete(contentSubcategoryItem.cardImageId));
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
                                text: $translate.instant('Subsystems.ContentManagement.Operations.RBT.ContentSubcategories.Messages.CreateFlowError')
                            });
                        }
                    });
                });

        };
    });

    ContentManagementOperationsContentSubcategoriesRBTModule.controller('ContentManagementOperationsContentSubcategoriesRBTUpdateCtrl', function ($rootScope, $scope, $state, $log, $controller, $q, $filter, $translate, notification, Restangular, UtilService,
                                                                                                                                            CMPFService, WorkflowsService, DateTimeConstants, FileDownloadService, ContentManagementService,
                                                                                                                                            contentSubcategory) {
        $log.debug('ContentManagementOperationsContentSubcategoriesRBTUpdateCtrl');

        $controller('ContentManagementOperationsContentSubcategoriesRBTCommonCtrl', {
            $scope: $scope
        });

        $scope.contentSubcategory = contentSubcategory.subcategory; 
        $scope.contentSubcategory.accessChannels = $scope.setAccessChannel(contentSubcategory.subcategory);

        // expanded tones list is not ordered, so we need to sort it by the order of toneIds
        $scope.contentSubcategory.tones = _.sortBy($scope.contentSubcategory.tones, function(tone) {
            return _.indexOf($scope.contentSubcategory.toneIds, tone.id);
        });


        // Set the default tone if it is not found.
        if ($scope.contentSubcategory.defaultToneId && !contentSubcategory.defaultTone) {
            $scope.toneList.push({
                id: $scope.contentSubcategory.defaultToneId,
                name: 'N/A'
            });
        }

        if ($scope.contentSubcategory.names && $scope.contentSubcategory.names.length > 0) {
            $scope.contentSubcategory.nameEn = 'N/A';
            var foundContentCategoryNameEn = _.findWhere($scope.contentSubcategory.names, {lang: 'en'});
            if (foundContentCategoryNameEn) {
                $scope.contentSubcategory.nameEn = foundContentCategoryNameEn.name;
            }

            $scope.contentSubcategory.nameAr = 'N/A';
            var foundContentCategoryNameAr = _.findWhere($scope.contentSubcategory.names, {lang: 'ar'});
            if (foundContentCategoryNameAr) {
                $scope.contentSubcategory.nameAr = foundContentCategoryNameAr.name;
            }
        }

        if ($scope.contentSubcategory.descriptions && $scope.contentSubcategory.descriptions.length > 0) {
            $scope.contentSubcategory.descriptionEn = 'N/A';
            var foundContentCategoryDescriptionEn = _.findWhere($scope.contentSubcategory.descriptions, {lang: 'en'});
            if (foundContentCategoryDescriptionEn) {
                $scope.contentSubcategory.descriptionEn = foundContentCategoryDescriptionEn.description;
            }

            $scope.contentSubcategory.descriptionAr = 'N/A';
            var foundContentCategoryDescriptionAr = _.findWhere($scope.contentSubcategory.descriptions, {lang: 'ar'});
            if (foundContentCategoryDescriptionAr) {
                $scope.contentSubcategory.descriptionAr = foundContentCategoryDescriptionAr.description;
            }
        }


        $scope.contentSubcategory.featuredTitles = $scope.contentSubcategory.featuredTitles ? $scope.contentSubcategory.featuredTitles : [];
        $scope.contentSubcategory.featuredDescriptions = $scope.contentSubcategory.featuredDescriptions ? $scope.contentSubcategory.featuredDescriptions : [];
        if ($scope.contentSubcategory.featuredTitles && $scope.contentSubcategory.featuredTitles.length > 0) {
            $scope.contentSubcategory.featuredTitleEn = 'N/A';
            var foundContentMetadataNameEn = _.findWhere($scope.contentSubcategory.featuredTitles, {lang: 'en'});
            if (foundContentMetadataNameEn) {
                $scope.contentSubcategory.featuredTitleEn = foundContentMetadataNameEn.name;
            }

            $scope.contentSubcategory.featuredTitleAr = 'N/A';
            var foundContentMetadataNameAr = _.findWhere($scope.contentSubcategory.featuredTitles, {lang: 'ar'});
            if (foundContentMetadataNameAr) {
                $scope.contentSubcategory.featuredTitleAr = foundContentMetadataNameAr.name;
            }
        }
        if ($scope.contentSubcategory.featuredDescriptions && $scope.contentSubcategory.featuredDescriptions.length > 0) {
            $scope.contentSubcategory.featuredDescriptionEn = 'N/A';
            var foundContentMetadataDescriptionEn = _.findWhere($scope.contentSubcategory.featuredDescriptions, {lang: 'en'});
            if (foundContentMetadataDescriptionEn) {
                $scope.contentSubcategory.featuredDescriptionEn = foundContentMetadataDescriptionEn.description;
            }

            $scope.contentSubcategory.featuredDescriptionAr = 'N/A';
            var foundContentMetadataDescriptionAr = _.findWhere($scope.contentSubcategory.featuredDescriptions, {lang: 'ar'});
            if (foundContentMetadataDescriptionAr) {
                $scope.contentSubcategory.featuredDescriptionAr = foundContentMetadataDescriptionAr.description;
            }
        }

        // init lists if not present in response
        $scope.contentSubcategory.tags = $scope.contentSubcategory.tags ? $scope.contentSubcategory.tags : [];
        $scope.contentSubcategory.accessChannels = $scope.contentSubcategory.accessChannels ? $scope.contentSubcategory.accessChannels : [];
        $scope.contentSubcategory.artistIds = $scope.contentSubcategory.artistIds ? $scope.contentSubcategory.artistIds : [];
        $scope.contentSubcategory.playlistIds = $scope.contentSubcategory.playlistIds ? $scope.contentSubcategory.playlistIds : [];
        $scope.contentSubcategory.toneIds = $scope.contentSubcategory.toneIds ? $scope.contentSubcategory.toneIds : [];


        // Get the coverImage by id value.
        $scope.contentSubcategory.coverImage = {name: undefined};
        if ($scope.contentSubcategory.coverImageId) {
            var srcUrl = ContentManagementService.generateFilePath($scope.contentSubcategory.coverImageId);
            FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                $scope.contentSubcategory.coverImage = blob;
                if (blob) {
                    $scope.contentSubcategory.coverImage.name = fileName;
                }
                $scope.originalContentSubcategory = angular.copy($scope.contentSubcategory);
            });
        }

        // Get the cardImage by id value.
        $scope.contentSubcategory.cardImage = {name: undefined};
        if ($scope.contentSubcategory.cardImageId) {
            var srcUrl = ContentManagementService.generateFilePath($scope.contentSubcategory.cardImageId);
            FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                $scope.contentSubcategory.cardImage = blob;
                if (blob) {
                    $scope.contentSubcategory.cardImage.name = fileName;
                }
                $scope.originalContentSubcategory = angular.copy($scope.contentSubcategory);
            });
        }

        // Get the thumbnail by id value.
        $scope.contentSubcategory.thumbnail = {name: undefined};
        if ($scope.contentSubcategory.thumbnailId) {
            var srcUrl = ContentManagementService.generateFilePath($scope.contentSubcategory.thumbnailId);
            FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                $scope.contentSubcategory.thumbnail = blob;
                if (blob) {
                    $scope.contentSubcategory.thumbnail.name = fileName;
                }
                $scope.originalContentSubcategory = angular.copy($scope.contentSubcategory);
            });
        }

        $scope.dateHolder = {
            startDate: ($scope.contentSubcategory.launchDate ? new Date(moment($scope.contentSubcategory.launchDate).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss')) : ''),
            endDate: ($scope.contentSubcategory.expireDate ? new Date(moment($scope.contentSubcategory.expireDate).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss')) : '')
        };

        if ($scope.contentSubcategory && $scope.contentSubcategory.offers && $scope.contentSubcategory.offers.length > 0) {
            var chargingDetails = $scope.contentSubcategory.offers[0];

            $scope.contentSubcategory.chargingDetails = {
                chargingPeriod: UtilService.convertPeriodStringToSimpleObject(chargingDetails.chargingPeriodDetail),
                price: Number(chargingDetails.price),
                subscriptionCode: chargingDetails.subscriptionCode,
                revSharePolicy: chargingDetails.revSharePolicy,
                revShare: chargingDetails.revShare
            };
        } else {
            $scope.contentSubcategory.chargingDetails = {
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

        $scope.originalContentSubcategory = angular.copy($scope.contentSubcategory);
        $scope.dateHolderOriginal = angular.copy($scope.dateHolder);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalContentSubcategory, $scope.contentSubcategory) &&
                angular.equals($scope.dateHolder, $scope.dateHolderOriginal);
        };

        $scope.sendToWorkflow = function (contentSubcategory) {
            var original = $scope.originalContentSubcategory;

            var contentSubcategoryItem = {
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
                // Changed values
                "name": contentSubcategory.name,
                "status": contentSubcategory.status,
                "launchDate": ($scope.dateHolder.startDate ? $filter('date')($scope.dateHolder.startDate, 'yyyy-MM-dd') + 'T00:00:00' : ''),
                "expireDate": ($scope.dateHolder.endDate ? $filter('date')($scope.dateHolder.endDate, 'yyyy-MM-dd') + 'T00:00:00' : ''),
                "defaultToneId": contentSubcategory.defaultToneId,
                "names": [],
                "descriptions": [],
                "tags": contentSubcategory.tags,
                "accessChannels": contentSubcategory.accessChannels,
                "subscriptionEnabled": contentSubcategory.subscriptionEnabled,
                "promoted": contentSubcategory.promoted,
                "artistIds": contentSubcategory.artistIds,
                "playlistIds": contentSubcategory.playlistIds,
                "categoryId": contentSubcategory.categoryId,
                "subcategoryIds": [],
                "toneIds": contentSubcategory.tones ? _.pluck(contentSubcategory.tones, 'id') : contentSubcategory.toneIds,
                "cardImageUrl": contentSubcategory.cardImageUrl,
                "thumbnailUrl": contentSubcategory.thumbnailUrl,
                "coverImageUrl": contentSubcategory.coverImageUrl,
                "dateUpdated": $filter('date')(Date.now(), 'yyyy-MM-dd') + 'T00:00:00' ,
                "descriptionList": contentSubcategory.descriptionList,
                "dtoneId": contentSubcategory.dtoneId,
                "featuredDescriptionList": contentSubcategory.featuredDescriptionList,
                "featuredDescriptions": contentSubcategory.featuredDescriptions,
                "featuredTitleList": contentSubcategory.featuredTitleList,
                "featuredTitles": contentSubcategory.featuredTitles,
                "nameList": contentSubcategory.nameList,
                "numberOfTones": contentSubcategory.numberOfTones,
                "offers": contentSubcategory.offers
            };

            // names
            contentSubcategoryItem.names.push({ lang: 'en', name: contentSubcategory.nameEn });
            contentSubcategoryItem.names.push({ lang: 'ar', name: contentSubcategory.nameAr });

            // descriptions
            contentSubcategoryItem.descriptions.push({ lang: 'en', description: contentSubcategory.descriptionEn });
            contentSubcategoryItem.descriptions.push({ lang: 'ar', description: contentSubcategory.descriptionAr });

            // If subcategory is promoted, ensure featured titles & descriptions
            if (contentSubcategoryItem.promoted) {
                contentSubcategoryItem.featuredTitles.push({ lang: 'en', name: contentSubcategory.featuredTitleEn });
                contentSubcategoryItem.featuredTitles.push({ lang: 'ar', name: contentSubcategory.featuredTitleAr });

                contentSubcategoryItem.featuredDescriptions.push({ lang: 'en', description: contentSubcategory.featuredDescriptionEn });
                contentSubcategoryItem.featuredDescriptions.push({ lang: 'ar', description: contentSubcategory.featuredDescriptionAr });
            }

            // Charging Details
            if (contentSubcategory.chargingDetails) {
                var offer = {
                    "chargingPeriodDetail": UtilService.convertSimpleObjectToPeriod(contentSubcategory.chargingDetails.chargingPeriod),
                    "price": contentSubcategory.chargingDetails.price,
                    "subscriptionCode": contentSubcategory.chargingDetails.subscriptionCode,
                    "revSharePolicy": contentSubcategory.chargingDetails.revSharePolicy
                };

                if (contentSubcategory.chargingDetails.revSharePolicy === 'COMPLEX') {
                    offer.revShare = {
                        "operatorDeductionType": contentSubcategory.chargingDetails.revShare.operatorDeductionType ? contentSubcategory.chargingDetails.revShare.operatorDeductionType : "NONE",
                        "operatorDeduction": contentSubcategory.chargingDetails.revShare.operatorDeduction ? contentSubcategory.chargingDetails.revShare.operatorDeduction : 0,
                        "type": contentSubcategory.chargingDetails.revShare.type ? contentSubcategory.chargingDetails.revShare.type : null,
                        "baseShareType": "NONE",
                        "baseShare": 0,
                        "operatorShare": 0
                    };
                }

                contentSubcategoryItem.offers = [ offer ];
            }

            // Access Channels - Set default accessChannels value based on accessType (IVR, USSD, or GENERAL)
            angular.forEach($scope.CMS_ACCESS_CHANNELS, function (channel) {
                if (channel.value.indexOf($scope.accessType) !== -1) {
                    contentSubcategoryItem.accessChannels = channel.value;
                }
            });

            // IVR & USSD - no artists, no playlists should be related
            if ($scope.accessType === 'IVR' || $scope.accessType === 'USSD') {
                contentSubcategoryItem.artistIds = [];
                contentSubcategoryItem.playlistIds = [];
            }

            // Image File Handling
            var coverImage = contentSubcategory.coverImage;
            var cardImage  = contentSubcategory.cardImage;

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
                contentSubcategoryItem.cardImageId = "";
                filesToDeleteAfterSuccess.push(originalCardId);
            } else if (cardReplaced) {
                newCardId = UtilService.generateObjectId();
                contentSubcategoryItem.cardImageId = newCardId;

                if (originalCardId) {
                    filesToDeleteAfterSuccess.push(originalCardId);
                }
            } else {
                contentSubcategoryItem.cardImageId = originalCardId;
            }

            // Cover Image
            var coverRemoved  = (!coverImage || !coverImage.name) && !!originalCoverId;
            var coverReplaced = (coverImage && coverImage.name && (coverImage instanceof File));

            if (coverRemoved) {
                contentSubcategoryItem.coverImageId = "";
                filesToDeleteAfterSuccess.push(originalCoverId);
            } else if (coverReplaced) {
                // Reuse existing ID if present, otherwise assign new id.
                contentSubcategoryItem.coverImageId = originalCoverId || UtilService.generateObjectId();

                postUploadTasks.push(function () {
                    return ContentManagementService.uploadFile(
                        coverImage,
                        coverImage.name,
                        contentSubcategoryItem.coverImageId
                    );
                });
            } else {
                contentSubcategoryItem.coverImageId = originalCoverId;
            }

            $log.debug('Updating content category (with resolved image IDs): ', contentSubcategoryItem);

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
                    return ContentManagementService.updateSubcategoryRBT(contentSubcategoryItem);
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

            /*

            $log.debug('Updating content subcategory: ', contentSubcategoryItem);
            // Content Subcategory RBT create method of CMS, no Workflow involved
            ContentManagementService.updateSubcategoryRBT(contentSubcategoryItem).then(function (response) {
                if (response && response.code === 2002) {
                    $log.debug('Save Success. Response: ', response);

                    var promises = [];

                    if (coverImage && coverImage.name && (coverImage instanceof File)) {
                        promises.push(ContentManagementService.uploadFile(coverImage, coverImage.name, contentSubcategoryItem.coverImageId));
                    }

                    if (cardImage && cardImage.name && (cardImage instanceof File)) {
                        promises.push(ContentManagementService.uploadFile(cardImage, cardImage.name, contentSubcategoryItem.cardImageId));
                    }

                    if (thumbnail && thumbnail.name && (thumbnail instanceof File)) {
                        promises.push(ContentManagementService.uploadFile(thumbnail, thumbnail.name, contentSubcategoryItem.thumbnailId));
                    }

                    $q.all(promises).then(function () {
                        notification.flash({
                            type: 'success',
                            text: $translate.instant('Subsystems.ContentManagement.Operations.RBT.ContentSubcategories.Messages.UpdateFlowStartedSuccessful' + ($rootScope.isAdminUser ? 'ForAdmin' : ''))
                        });

                        $scope.cancel();
                    });
                } else {
                    ContentManagementService.showApiError(response);
                }
            }, function (response) {
                $log.error('Cannot call the content subcategory rbt update flow service. Error: ', response);

                if (response && response.data && response.data.message) {
                    WorkflowsService.showApiError(response);
                } else {
                    notification({
                        type: 'warning',
                        text: $translate.instant('Subsystems.ContentManagement.Operations.RBT.ContentSubcategories.Messages.UpdateFlowError')
                    });
                }
            });
            */
        };
    });
})();
