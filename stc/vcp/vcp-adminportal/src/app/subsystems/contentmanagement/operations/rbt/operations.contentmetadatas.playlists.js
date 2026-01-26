(function () {

    'use strict';

    angular.module('adminportal.subsystems.contentmanagement.operations.rbt.contentmetadatas.playlists', []);

    var ContentManagementOperationsContentMetadatasRBTPlaylistsModule = angular.module('adminportal.subsystems.contentmanagement.operations.rbt.contentmetadatas.playlists');

    ContentManagementOperationsContentMetadatasRBTPlaylistsModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.contentmanagement.operations.rbt.contentmetadatas.playlists', {
            abstract: true,
            url: '/playlists',
            template: '<div ui-view></div>',
            data: {
                exportFileName: 'ContentsPlaylistsRBT',
                permissions: [
                    'RBT__OPERATIONS_PLAYLIST_READ'
                ]
            }
        }).state('subsystems.contentmanagement.operations.rbt.contentmetadatas.playlists.list', {
            url: "",
            templateUrl: "subsystems/contentmanagement/operations/rbt/operations.contentmetadatas.playlists.html",
            controller: 'ContentManagementOperationsContentMetadatasRBTPlaylistsCtrl'
        }).state('subsystems.contentmanagement.operations.rbt.contentmetadatas.playlists.new', {
            url: "/new",
            templateUrl: "subsystems/contentmanagement/operations/rbt/operations.contentmetadatas.playlists.details.html",
            controller: 'ContentManagementOperationsContentMetadatasRBTPlaylistsNewCtrl'
        }).state('subsystems.contentmanagement.operations.rbt.contentmetadatas.playlists.update', {
            url: "/update/:id",
            templateUrl: "subsystems/contentmanagement/operations/rbt/operations.contentmetadatas.playlists.details.html",
            controller: 'ContentManagementOperationsContentMetadatasRBTPlaylistsUpdateCtrl',
            resolve: {
                playlist: function ($stateParams, $q, ContentManagementService, CMPFService) {
                    var deferred = $q.defer();

                    ContentManagementService.getPlaylist($stateParams.id, ['TONE', 'CATEGORY', 'SUBCATEGORY']).then(function (_playlist) {
                        CMPFService.getOperator(_playlist.playlist.organizationId, true).then(function (_organization) {
                            _playlist.playlist.organization = _organization;

                            deferred.resolve(_playlist);
                        });
                    });

                    return deferred.promise;
                }
            }
        });

    });

    ContentManagementOperationsContentMetadatasRBTPlaylistsModule.controller('ContentManagementOperationsContentMetadatasRBTPlaylistsCommonCtrl', function ($scope, $log, $q, $state, $translate, $controller, $uibModal, $filter, UtilService, SessionService, AuthorizationService, ContentManagementService, CMPFService,
                                                                                                                                                      CMS_RBT_STATUS_TYPES, CMS_ACCESS_CHANNELS, DURATION_UNITS, CMS_RBT_REV_SHARE_POLICIES_ALL, DEFAULT_REST_QUERY_LIMIT,
                                                                                                                                                      CMS_RBT_REV_SHARE_CARRIER_DEDUCTION, CMS_RBT_REV_SHARE_SPLIT_ACROSS_TONES_ALBUM) {
        $log.debug('ContentManagementOperationsContentMetadatasRBTPlaylistsCommonCtrl');

        $controller('GenericDateTimeCtrl', {$scope: $scope});
        $controller('ContentManagementOperationsRBTCommonCtrl', {$scope: $scope});
        $controller('AllowedCategoriesCommonCtrl', {$scope: $scope});

        $scope.sessionOrganization = SessionService.getSessionOrganization();
        $scope.username = SessionService.getUsername();
        $scope.contentSubcategoryList = [];

        $scope.CMS_RBT_STATUS_TYPES = _.without(CMS_RBT_STATUS_TYPES, 'PENDING', 'REJECTED');
        // See bulk operations, CMS_RBT_BULK_ACTIONS
        $scope.CMS_RBT_AVAILABLE_STATES = {
            'PENDING': ['PENDING', 'ACTIVE', 'REJECTED'],
            'REJECTED': ['REJECTED', 'INACTIVE'],
            'ACTIVE': ['ACTIVE', 'HIDDEN', 'SUSPENDED', 'INACTIVE'],
            'HIDDEN': ['HIDDEN', 'ACTIVE', 'SUSPENDED', 'INACTIVE'],
            'SUSPENDED': ['SUSPENDED', 'ACTIVE', 'HIDDEN', 'INACTIVE'],
            'INACTIVE': ['INACTIVE']
        };

        $scope.CMS_ACCESS_CHANNELS = CMS_ACCESS_CHANNELS;
        $scope.DISPLAY_ACCESS_CHANNELS = _.flatten(_.map(CMS_ACCESS_CHANNELS, 'value'));

        $scope.DURATION_UNITS = DURATION_UNITS;
        $scope.CMS_RBT_REV_SHARE_POLICIES = CMS_RBT_REV_SHARE_POLICIES_ALL;
        $scope.CMS_RBT_REV_SHARE_CARRIER_DEDUCTION = CMS_RBT_REV_SHARE_CARRIER_DEDUCTION;
        $scope.CMS_RBT_REV_SHARE_SPLIT_ACROSS_TONES = CMS_RBT_REV_SHARE_SPLIT_ACROSS_TONES_ALBUM;

        $scope.openOrganizations = function (playlist) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.organizations.html',
                controller: 'OrganizationsModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    organizationParameter: function () {
                        return angular.copy(playlist.organization);
                    },
                    itemName: function () {
                        return playlist.name;
                    },
                    allOrganizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllOrganizationsCustom(false, true, [CMPFService.OPERATOR_PROFILE, CMPFService.SERVICE_PROVIDER_BUSINESS_TYPE_PROFILE, CMPFService.SERVICE_PROVIDER_SETTLEMENT_TYPE_PROFILE]);
                    },
                    organizationsModalTitleKey: function () {
                        return 'Subsystems.ContentManagement.Operations.RBT.ContentMetadatas.Playlists.OrganizationsModalTitle';
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                playlist.organization = selectedItem.organization;
                if(playlist.organizationId !== selectedItem.organization.id){playlist.defaultToneId = null;}
                playlist.organizationId = selectedItem.organization.id;
            }, function () {
            });
        };

        $scope.contentCategoryList = [];
        $scope.moodList = [];
        $scope.toneList = [];
        $scope.toneIdsList = [];

        $scope.$watch('contentMetadata.chargingDetails.subscriptionCode', function (newValue, oldValue) {
            if(newValue !== oldValue){
                // When subscription code value is changed, clear validation errors. Check availability only when save is clicked.
                UtilService.setError($scope.form, 'subscriptionCode', 'availabilityCheck', true);
                // Check if the new value is not a number
                UtilService.setError($scope.form, 'subscriptionCode', 'numericCheck', (newValue && /^\d+$/.test(newValue)));
            }
        });

        $scope.$watch('contentMetadata.chargingDetails.price', function (newValue, oldValue) {
            // original price should be greater than the price
            var originalPriceValid = false;
            if(newValue == null && oldValue == null){
                originalPriceValid = true;
            } else if ($scope.contentMetadata.chargingDetails.originalPrice && $scope.contentMetadata.chargingDetails.originalPrice >= 0) {
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

        $scope.$on('toneIdsUpdated', function (event, toneIdList) {
            $log.debug('Received toneIdsUpdated event with toneIds: ', toneIdList);

            // Update contentMetadata.toneIds and trigger the watcher
            $scope.contentMetadata.toneIds = toneIdList;
            // Manually mark the form control as dirty
            if ($scope.form && $scope.form.selectTones) {
                $scope.form.selectTones.$setDirty();
            }

        });

        $scope.$watch('contentMetadata.toneIds', function (newValue, oldValue) {
            // at least 2 tones should be selected
            var minimumTones = $scope.contentMetadata.toneIds && $scope.contentMetadata.toneIds.length > 1;
            UtilService.setError($scope.form, 'selectTones', 'minimumTones', minimumTones);
        });

        // Tone Selection callback
        var setToneSelection = function (selectedTones) {
            $scope.contentMetadata.tones = selectedTones;
            $scope.contentMetadata.toneIds = _.pluck(selectedTones, 'id');
            // Manually mark the form control as dirty
            if ($scope.form && $scope.form.selectTones) {
                $scope.form.selectTones.$setDirty();
            }
        };

        $scope.openToneSelection = function () {
            // Configuration for the tone selection modal
            var title = $translate.instant('Subsystems.ContentManagement.Operations.RBT.ContentMetadatas.Tones.Title');
            title += ' [Playlist = ' + ($scope.contentMetadata.name ? $scope.contentMetadata.name : 'New Playlist ')+']';

            var config = {
                titleKey: title,
                dateFilter: {
                    status: 'ACTIVE'
                },
                enableToneOrdering: $scope.enableToneOrdering,
                accessType: $scope.accessType,
                isAuthorized: $scope.contentMetadata.id ? AuthorizationService.canRBTOperationsCategoryUpdate($scope.contentMetadata.status) : AuthorizationService.canRBTOperationsCategoryCreate()
            };
            $scope.openToneSelectionModal($scope.contentMetadata.tones, setToneSelection, config)
        };

        $scope.removeSelectedOrganization = function () {
            $scope.contentMetadata.organization = null;
        };

        $scope.getAvailableStates = function (originalContentMetadata) {

            if(!originalContentMetadata){
                return $scope.CMS_RBT_STATUS_TYPES;
            } else {
                return $scope.CMS_RBT_AVAILABLE_STATES[originalContentMetadata.status];
            }
        };

        $scope.checkCategoryAssociation = function (subcategory) {
            var hasParent = _.findWhere($scope.contentMetadata.categories,{id: subcategory.categoryId});
            return !hasParent;
        }


        $scope.setCategoryIds = function () {
            $scope.contentMetadata.categoryIds =  _.compact(_.uniq(_.map($scope.contentMetadata.categories, function(obj) {
                if (obj && obj.id) {
                    return obj.id
                }
            })));
            $scope.contentMetadata.subcategoryIds =  _.compact(_.uniq(_.map($scope.contentMetadata.subcategories, function(obj) {
                if (obj && obj.id) {
                    return obj.id
                }
            })));
        }

        $scope.canRemoveCategory = function (item) {
            var parentOf = _.findWhere($scope.contentMetadata.subcategories,{categoryId: item.id});
            return !parentOf;
        }

        $scope.openCategorySelection = function () {

            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/contentmanagement/operations/rbt/operations.category.selection.modal.html',
                controller:'CategorySelectionModalPopupCtrl',
                resolve: {
                    contentMetadata: function () {
                        return $scope.contentMetadata;
                    }
                }
            });

            modalInstance.result.then(function (categoryProfile) {
                $scope.contentMetadata.categories = $scope.contentMetadata.categories || [];
                $scope.contentMetadata.subcategories = $scope.contentMetadata.subcategories || [];

                var category = _.findWhere($scope.contentMetadata.categories,{id: categoryProfile.category.id});
                if(!category)
                    $scope.contentMetadata.categories.push(categoryProfile.category);

                var subcategory = categoryProfile.subCategory ? _.findWhere($scope.contentMetadata.subcategories,{id: categoryProfile.subCategory.id}) : null;
                if(categoryProfile.subCategory && !subcategory)
                    $scope.contentMetadata.subcategories.push(categoryProfile.subCategory);

                $scope.setCategoryIds();
            });
        };

        $scope.removeCategorySelection = function(categoryIdList, categoriesList, index, type) {
            if(type == 'subcategory' || $scope.canRemoveCategory(categoriesList[index])) {
                categoriesList[index].selected = false;
                categoriesList.splice(index, 1);
                $scope.setCategoryIds();
            }
        }

        $scope.cancel = function () {
            $state.go('subsystems.contentmanagement.operations.rbt.contentmetadatas.playlists.list');
        };
    });

    ContentManagementOperationsContentMetadatasRBTPlaylistsModule.controller('ContentManagementOperationsContentMetadatasRBTPlaylistsCtrl', function ($rootScope, $scope, $log, $controller, $state, $timeout, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                                                Restangular, CMPFService, DateTimeConstants, ContentManagementService, WorkflowsService, SessionService, DEFAULT_REST_QUERY_LIMIT) {
        $log.debug('ContentManagementOperationsContentMetadatasRBTPlaylistsCtrl');

        $scope.sessionOrganization = SessionService.getSessionOrganization();
        $scope.username = SessionService.getUsername();

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'id',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.ContentMetadatas.Playlists.Id'
                },
                {
                    fieldName: 'name',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.ContentMetadatas.Playlists.Name'
                },
                {
                    fieldName: 'organizationName',
                    headerKey: 'CommonLabels.Organization'
                },
                {
                    fieldName: 'subscriptionEnabled',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.ContentMetadatas.SubscriptionEnabled',
                    filter: {name: 'YesNoFilter'}
                },
                {
                    fieldName: 'promoted',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.ContentMetadatas.Promoted',
                    filter: {name: 'YesNoFilter'}
                },
                {
                    fieldName: 'totalSubscriptionCount',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.ContentMetadatas.Subscriptions'
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

        // Playlist list
        $scope.contentMetadataList = {
            list: [],
            showTable: true,
            tableParams: {}
        };
        $scope.originalContentMetadatas = angular.copy($scope.contentMetadataList.list);

        $scope.contentMetadataList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "id": 'asc'
            }
        }, {
            total: 0,
            $scope: $scope,
            getData: function ($defer, params) {
                var preparedFilter = $scope.prepareFilter(params);

                var filter = preparedFilter.filter;
                var additionalFilterFields = preparedFilter.additionalFilterFields;

                // WAITING status removed, no BPMS Workflows for Playlists
                ContentManagementService.getPlaylists(filter.page, filter.limit, filter.sortFieldName, filter.sortOrder, filter.statuses, filter.filterText).then(function (response) {
                    $log.debug("Found records: ", response);

                    $scope.contentMetadataList.list = (response ? response.items : []);

                    params.total(response ? response.totalCount : 0);
                    $defer.resolve($scope.contentMetadataList.list);
                }, function (error) {
                    $log.debug('Error: ', error);
                    params.total(0);
                    $defer.resolve([]);
                });
            }
        });
        // END - Playlist list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.contentMetadataList.tableParams.settings().$scope.filterText = filterText;
            $scope.contentMetadataList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.contentMetadataList.tableParams.page(1);
            $scope.contentMetadataList.tableParams.reload();
        }, 750);

        $scope.stateFilter = 'ALL';
        $scope.stateFilterChange = function (state) {
            if (state === 'ALL') {
                delete $scope.contentMetadataList.tableParams.settings().$scope.status;
            } else {
                $scope.contentMetadataList.tableParams.settings().$scope.status = state;
            }

            $scope.reloadTable($scope.contentMetadataList.tableParams);
        };

        // Task details modal window.
        $scope.showTaskDetails = function (contentMetadata) {
            contentMetadata.rowSelected = true;

            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'partials/modal/empty.modal.html',
                controller: function ($scope, $controller, $uibModalInstance, allOrganizations, moods, contentCategories, tones, taskDetail) {
                    $controller('WorkflowsOperationsTasksDetailRBTPlaylistCtrl', {
                        $scope: $scope,
                        allOrganizations: allOrganizations,
                        moods: moods,
                        contentCategories: contentCategories,
                        tones: tones,
                        taskDetail: taskDetail
                    });

                    $scope.isModal = true;
                    $scope.modalTitle = contentMetadata.taskName;
                    $scope.templateUrl = 'workflows/operations/operations.tasks.rbtplaylists.detail.html';

                    $scope.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'lg',
                resolve: {
                    allOrganizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT, UtilService) {
                        return CMPFService.getAllOrganizationsCustom(false, true, [CMPFService.OPERATOR_PROFILE]);
                    },
                    moods: function (ContentManagementService, DEFAULT_REST_QUERY_LIMIT) {
                        return ContentManagementService.getMoods(0, DEFAULT_REST_QUERY_LIMIT);
                    },
                    contentCategories: function (DEFAULT_REST_QUERY_LIMIT, ContentManagementService) {
                        return ContentManagementService.getContentCategoriesRBT(0, DEFAULT_REST_QUERY_LIMIT);
                    },
                    tones: function (ContentManagementService, DEFAULT_REST_QUERY_LIMIT) {
                        return ContentManagementService.getTones(0, DEFAULT_REST_QUERY_LIMIT);
                    },
                    taskDetail: function () {
                        return {
                            playlistTask: {
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

        var preparePlaylistItem = function (contentMetadata, isForceAdmin) {
            var playlistItem = {
                "from": {
                    "isAdmin": isForceAdmin ? true : $rootScope.isAdminUser,
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
                "id": contentMetadata.id,
                "legacyId": contentMetadata.legacyId,
                "organizationId": contentMetadata.organizationId,
                "organizationName": contentMetadata.organizationName,
                "coverImageId": contentMetadata.coverImageId,
                "cardImageId": contentMetadata.cardImageId,
                "thumbnailId": contentMetadata.thumbnailId,
                "contentType": contentMetadata.contentType,
                "userCreated": contentMetadata.userCreated,
                "dateCreated": contentMetadata.dateCreated,
                "offers": contentMetadata.offers,
                "totalSubscriptionCount": contentMetadata.totalSubscriptionCount,
                "status": contentMetadata.status,
                "name": contentMetadata.name,
                "subscriptionEnabled": contentMetadata.subscriptionEnabled,
                "promoted": contentMetadata.promoted,
                "launchDate": contentMetadata.launchDate,
                "expireDate": contentMetadata.expireDate,
                "names": contentMetadata.names,
                "descriptions": contentMetadata.descriptions,
                "tags": contentMetadata.tags,
                "categoryIds": contentMetadata.categoryIds,
                "moodIds": contentMetadata.moodIds,
                "accessChannels": contentMetadata.accessChannels,
                "defaultToneId": contentMetadata.defaultToneId,
                "userUpdated": $scope.username
            };

            return playlistItem;
        };

        // Manage revenue settings by tones
        $scope.manageRevenueSettings = function (contextKey, entity, titleKey) {
            entity.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/contentmanagement/operations/rbt/operations.tones.managerevenuesettings.modal.html',
                controller: function ($scope, $filter, $uibModalInstance, tones, Restangular, NgTableParams, NgTableService) {
                    $scope.object = entity;

                    $scope.titleKey = titleKey;

                    $scope.tones = tones ? tones.items : [];

                    if ($scope.object.offers && $scope.object.offers.length > 0 && $scope.object.offers[0].revShare && $scope.object.offers[0].revShare.shares) {
                        if ($scope.object.offers[0].revSharePolicy === 'COMPLEX') {
                            _.each($scope.tones, function (tone) {
                                var foundShare = _.findWhere($scope.object.offers[0].revShare.shares, {toneId: tone.id});
                                if ($scope.object.offers[0].revShare.type === 'EQUAL') {
                                    tone.freeOfCharge = (foundShare !== null && foundShare !== undefined);
                                    tone.share = (foundShare ? 0 : undefined);
                                } else {
                                    tone.freeOfCharge = (foundShare === null || foundShare === undefined);
                                    tone.share = (foundShare ? foundShare.share : 0);
                                }
                            });
                        }
                    }

                    $scope.tonesOriginal = angular.copy($scope.tones);
                    $scope.isNotChanged = function () {
                        return angular.equals($scope.tones, $scope.tonesOriginal);
                    };

                    $scope.tableParams = new NgTableParams({
                        page: 1,
                        count: 10,
                        sorting: {
                            "id": 'asc'
                        }
                    }, {
                        $scope: $scope,
                        total: 0,
                        getData: function ($defer, params) {
                            var filterText = params.settings().$scope.filterText;
                            var filterColumns = params.settings().$scope.filterColumns;
                            var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.tones);
                            var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.tones;
                            params.total(orderedData.length);
                            if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                                params.page(params.page() - 1);
                            }

                            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                        }
                    });

                    $scope.filterTable = _.debounce(function (filterText, filterColumns) {
                        $scope.tableParams.settings().$scope.filterText = filterText;
                        $scope.tableParams.settings().$scope.filterColumns = filterColumns;
                        $scope.tableParams.page(1);
                        $scope.tableParams.reload();
                    }, 500);

                    $scope.save = function (playlist, tones) {
                        var playlistItem = preparePlaylistItem(playlist, true);

                        var offers = playlistItem.offers;

                        if (offers && offers.length > 0 && offers[0].revShare) {
                            offers[0].revShare.shares = [];

                            _.each(tones, function (tone) {
                                var share = {
                                    "toneId": tone.id,
                                    "share": 0
                                };

                                // If the type is EQUAL add the share if it is not Free of Charge.
                                if (offers[0].revShare.type === 'EQUAL' && tone.freeOfCharge) {
                                    offers[0].revShare.shares.push(share);
                                } else
                                    // If the type is EQUAL add the share if it is not Free of Charge.
                                if ((offers[0].revShare.type === 'WEIGHTED' || offers[0].revShare.type === 'PERCENTAGES') && !tone.freeOfCharge) {
                                    share.share = tone.share;
                                    offers[0].revShare.shares.push(share);
                                }
                            })
                        }

                        $log.debug('Updating playlist: ', playlistItem);

                        // Playlist create method of the flow service.
                        WorkflowsService.updatePlaylistRBT(playlistItem).then(function (response) {
                            if (response && response.code === 2001) {
                                $log.debug('Save Success. Response: ', response);

                                notification({
                                    type: 'success',
                                    text: $translate.instant('Subsystems.ContentManagement.Operations.RBT.ContentMetadatas.Playlists.Messages.UpdateFlowStartedSuccessful' + ($rootScope.isAdminUser ? 'ForAdmin' : ''))
                                });

                                $scope.cancel();
                            } else {
                                WorkflowsService.showApiError(response);
                            }
                        }, function (response) {
                            $log.error('Cannot call the playlist update flow service. Error: ', response);

                            if (response && response.data && response.data.message) {
                                WorkflowsService.showApiError(response);
                            } else {
                                notification({
                                    type: 'warning',
                                    text: $translate.instant('Subsystems.ContentManagement.Operations.RBT.ContentMetadatas.Playlists.Messages.UpdateFlowError')
                                });
                            }
                        });
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'lg',
                resolve: {
                    tones: function (ContentManagementService, DEFAULT_REST_QUERY_LIMIT) {
                        return ContentManagementService.getTonesByContextRBT(contextKey, entity.id, 0, DEFAULT_REST_QUERY_LIMIT);
                    }
                }
            });

            modalInstance.result.then(function () {
                entity.rowSelected = false;
            }, function () {
                entity.rowSelected = false;
            });
        };

        $scope.remove = function (contentMetadata) {
            contentMetadata.rowSelected = true;

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
                contentMetadata.rowSelected = false;

                var playlistItem = preparePlaylistItem(contentMetadata, false);

                $log.debug('Removing playlist: ', playlistItem);

                // Playlist delete method of the flow service.
                ContentManagementService.deletePlaylist(playlistItem).then(function (response) {
                    if (response && response.code === 2003) {
                        $log.debug('Removed playlist: ', playlistItem, ', response: ', response);

                        notification.flash({
                            type: 'success',
                            text: $translate.instant('Subsystems.ContentManagement.Operations.RBT.ContentMetadatas.Playlists.Messages.DeleteFlowStartedSuccessful' + ($rootScope.isAdminUser ? 'ForAdmin' : ''))
                        });

                        $state.transitionTo($state.current, {}, {reload: true, inherit: true, notify: true});
                    } else {
                        WorkflowsService.showApiError(response);
                    }
                }, function (response) {
                    $log.error('Cannot call the playlist delete flow service. Error: ', response);

                    if (response && response.data && response.data.message) {
                        WorkflowsService.showApiError(response);
                    } else {
                        var message = $translate.instant('Subsystems.ContentManagement.Operations.RBT.ContentMetadatas.Playlists.Messages.DeleteFlowError');
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
                contentMetadata.rowSelected = false;
            });
        };
    });

    ContentManagementOperationsContentMetadatasRBTPlaylistsModule.controller('ContentManagementOperationsContentMetadatasRBTPlaylistsNewCtrl', function ($rootScope, $scope, $log, $state, $controller, $q, $filter, $translate, notification, UtilService, ContentManagementService,
                                                                                                                                                   CMPFService, WorkflowsService, SessionService, DateTimeConstants) {
        $log.debug('ContentManagementOperationsContentMetadatasRBTPlaylistsNewCtrl');

        $controller('ContentManagementOperationsContentMetadatasRBTPlaylistsCommonCtrl', {
            $scope: $scope
        });

        $scope.dateHolder.startDate = moment().startOf('day').toDate();
        $scope.dateHolder.endDate = moment().endOf('day').add(10, 'years').toDate();

        $scope.contentMetadata = {
            status: 'ACTIVE',
            subscriptionEnabled: true,
            promoted: false,
            tags: [],
            categoryIds: [],
            moodIds: [],
            toneIds: [],
            accessChannels: $scope.DISPLAY_ACCESS_CHANNELS,
            featuredTitles: [],
            featuredDescriptions: [],
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
            }
        };
        $scope.originalContentMetadata = angular.copy($scope.contentMetadata);


        $scope.sendToWorkflow = function (contentMetadata) {
            $log.debug('Creating playlist: ', contentMetadata);
            var playlistItem = {
                // Changed values
                "name": contentMetadata.name,
                "organizationId": contentMetadata.organization.id,
                "organizationName": contentMetadata.organization.name,
                "status": contentMetadata.status,
                "subscriptionEnabled": contentMetadata.subscriptionEnabled,
                "promoted": contentMetadata.promoted,
                "launchDate": ($scope.dateHolder.startDate ? $filter('date')($scope.dateHolder.startDate, 'yyyy-MM-dd') + 'T00:00:00' : ''),
                "expireDate": ($scope.dateHolder.endDate ? $filter('date')($scope.dateHolder.endDate, 'yyyy-MM-dd') + 'T00:00:00' : ''),
                "names": [],
                "descriptions": [],
                "tags": contentMetadata.tags,
                "categoryIds": contentMetadata.categoryIds,
                "subcategoryIds": contentMetadata.subcategoryIds,
                "moodIds": contentMetadata.moodIds,
                "accessChannels": contentMetadata.accessChannels,
                "defaultToneId": contentMetadata.defaultToneId,
                "dtoneId": contentMetadata.defaultToneId,
                "toneIds": contentMetadata.tones ? _.pluck(contentMetadata.tones, 'id') : contentMetadata.toneIds,
                "userCreated": $scope.username,
                "cardImageId": "",
                "cardImageUrl": "",
                "thumbnailId": "",
                "thumbnailUrl": "",
                "coverImageId": "",
                "coverImageUrl": "",
                "contentType": "PLAYLIST",
                "dateCreated": $filter('date')(Date.now(), 'yyyy-MM-dd') + 'T00:00:00',
                "dateUpdated": null,
                "descriptionList": [],
                "featuredDescriptionList": [],
                "featuredDescriptions": [],
                "featuredTitleList": [],
                "featuredTitles": [],
                "id": null,
                "legacyId": "",
                "nameList": [],
                "offers": []
            };

            // names
            playlistItem.names.push({ lang: 'en', name: contentMetadata.nameEn });
            playlistItem.names.push({ lang: 'ar', name: contentMetadata.nameAr });

            // descriptions
            playlistItem.descriptions.push({ lang: 'en', description: contentMetadata.descriptionEn });
            playlistItem.descriptions.push({ lang: 'ar', description: contentMetadata.descriptionAr });

            // featuredTitles & featuredDescriptions (only if promoted)
            if (contentMetadata.promoted) {
                playlistItem.featuredTitles.push({ lang: 'en', name: contentMetadata.featuredTitleEn });
                playlistItem.featuredTitles.push({ lang: 'ar', name: contentMetadata.featuredTitleAr });
                playlistItem.featuredDescriptions.push({ lang: 'en', description: contentMetadata.featuredDescriptionEn });
                playlistItem.featuredDescriptions.push({ lang: 'ar', description: contentMetadata.featuredDescriptionAr });
            }

            // Charging Details
            if (contentMetadata.chargingDetails) {
                // The "Charging Period" field should default to "30 DAYS." and should be non-editable, as per the STC requirement.
                contentMetadata.chargingDetails.chargingPeriod.duration = 30;
                contentMetadata.chargingDetails.chargingPeriod.unit = $scope.DURATION_UNITS[0].key;

                var offer = {
                    "chargingPeriodDetail": UtilService.convertSimpleObjectToPeriod(contentMetadata.chargingDetails.chargingPeriod),
                    "chargingPeriod": contentMetadata.chargingDetails.chargingPeriod.duration,
                    "price": Number(contentMetadata.chargingDetails.price),
                    "originalPrice": Number(contentMetadata.chargingDetails.originalPrice),
                    "subscriptionCode": contentMetadata.chargingDetails.subscriptionCode,
                    "revSharePolicy": contentMetadata.chargingDetails.revSharePolicy
                };

                if (contentMetadata.chargingDetails.revSharePolicy === 'COMPLEX') {
                    offer.revShare = {
                        "operatorDeductionType": contentMetadata.chargingDetails.revShare.operatorDeductionType ? contentMetadata.chargingDetails.revShare.operatorDeductionType : "NONE",
                        "operatorDeduction": contentMetadata.chargingDetails.revShare.operatorDeduction ? contentMetadata.chargingDetails.revShare.operatorDeduction : 0,
                        "type": contentMetadata.chargingDetails.revShare.type ? contentMetadata.chargingDetails.revShare.type : null,
                        "baseShareType": "NONE",
                        "baseShare": 0,
                        "operatorShare": 0
                    };

                    if (contentMetadata.chargingDetails.revShare.operatorDeductionType === 'NONE' && contentMetadata.chargingDetails.revShare.type === 'PERCENTAGES') {
                        offer.revShare.operatorShare = (contentMetadata.chargingDetails.revShare.operatorShare ? contentMetadata.chargingDetails.revShare.operatorShare : 0);
                        offer.revShare.operatorDeduction = 0;
                    }
                }

                playlistItem.offers = [ offer ];
            }

            var cardImage = contentMetadata.cardImage;
            var coverImage = contentMetadata.coverImage;
            // Generate IDs upfront for any images that will be uploaded
            if (cardImage && cardImage.name) {
                playlistItem.cardImageId = UtilService.generateObjectId();
            }
            if (coverImage && coverImage.name) {
                playlistItem.coverImageId = UtilService.generateObjectId();
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
                    .uploadFile(cardImage, cardImage.name, playlistItem.cardImageId)
                    .then(function () {
                        preUploaded.card = true;
                    });
            }

            $log.debug('Preparing to create playlist (with pre-uploaded card if any): ', playlistItem);

            // Promise Chain
            // pre-upload, then create metadata, then post-upload, then notify success
            preUploadPromise
                .then(function () {
                    // Create metadata AFTER card upload
                    return ContentManagementService.createPlaylist(playlistItem);
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
                        postUploads.push(ContentManagementService.uploadFile(coverImage, coverImage.name, playlistItem.coverImageId));
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
                    if (preUploaded.card && playlistItem.cardImageId) {
                        cleanup.push(bestEffortDelete(playlistItem.cardImageId));
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

    ContentManagementOperationsContentMetadatasRBTPlaylistsModule.controller('ContentManagementOperationsContentMetadatasRBTPlaylistsUpdateCtrl', function ($rootScope, $scope, $state, $log, $controller, $q, $filter, $translate, notification, Restangular, UtilService, CMPFService,
                                                                                                                                                      ContentManagementService, WorkflowsService, FileDownloadService, SessionService, DateTimeConstants,
                                                                                                                                                      playlist) {
        $log.debug('ContentManagementOperationsContentMetadatasRBTPlaylistsUpdateCtrl');

        $controller('ContentManagementOperationsContentMetadatasRBTPlaylistsCommonCtrl', {
            $scope: $scope
        });

        $scope.contentMetadata = playlist.playlist;

        // // Set the default tone if it is not found.
        // if ($scope.contentMetadata.defaultToneId && !playlist.defaultTone) {
        //     $scope.toneList.push({
        //         id: $scope.contentMetadata.defaultToneId,
        //         name: 'N/A'
        //     });
        // }

        if ($scope.contentMetadata.names && $scope.contentMetadata.names.length > 0) {
            $scope.contentMetadata.nameEn = 'N/A';
            var foundContentMetadataNameEn = _.findWhere($scope.contentMetadata.names, {lang: 'en'});
            if (foundContentMetadataNameEn) {
                $scope.contentMetadata.nameEn = foundContentMetadataNameEn.name;
            }

            $scope.contentMetadata.nameAr = 'N/A';
            var foundContentMetadataNameAr = _.findWhere($scope.contentMetadata.names, {lang: 'ar'});
            if (foundContentMetadataNameAr) {
                $scope.contentMetadata.nameAr = foundContentMetadataNameAr.name;
            }
        }

        if ($scope.contentMetadata.descriptions && $scope.contentMetadata.descriptions.length > 0) {
            $scope.contentMetadata.descriptionEn = 'N/A';
            var foundContentMetadataDescriptionEn = _.findWhere($scope.contentMetadata.descriptions, {lang: 'en'});
            if (foundContentMetadataDescriptionEn) {
                $scope.contentMetadata.descriptionEn = foundContentMetadataDescriptionEn.description;
            }

            $scope.contentMetadata.descriptionAr = 'N/A';
            var foundContentMetadataDescriptionAr = _.findWhere($scope.contentMetadata.descriptions, {lang: 'ar'});
            if (foundContentMetadataDescriptionAr) {
                $scope.contentMetadata.descriptionAr = foundContentMetadataDescriptionAr.description;
            }
        }

        if ($scope.contentMetadata.featuredTitles && $scope.contentMetadata.featuredTitles.length > 0) {
            $scope.contentMetadata.featuredTitleEn = 'N/A';
            var foundContentMetadataNameEn = _.findWhere($scope.contentMetadata.featuredTitles, {lang: 'en'});
            if (foundContentMetadataNameEn) {
                $scope.contentMetadata.featuredTitleEn = foundContentMetadataNameEn.name;
            }

            $scope.contentMetadata.featuredTitleAr = 'N/A';
            var foundContentMetadataNameAr = _.findWhere($scope.contentMetadata.featuredTitles, {lang: 'ar'});
            if (foundContentMetadataNameAr) {
                $scope.contentMetadata.featuredTitleAr = foundContentMetadataNameAr.name;
            }
        }

        if ($scope.contentMetadata.featuredDescriptions && $scope.contentMetadata.featuredDescriptions.length > 0) {
            $scope.contentMetadata.featuredDescriptionEn = 'N/A';
            var foundContentMetadataDescriptionEn = _.findWhere($scope.contentMetadata.featuredDescriptions, {lang: 'en'});
            if (foundContentMetadataDescriptionEn) {
                $scope.contentMetadata.featuredDescriptionEn = foundContentMetadataDescriptionEn.description;
            }

            $scope.contentMetadata.featuredDescriptionAr = 'N/A';
            var foundContentMetadataDescriptionAr = _.findWhere($scope.contentMetadata.featuredDescriptions, {lang: 'ar'});
            if (foundContentMetadataDescriptionAr) {
                $scope.contentMetadata.featuredDescriptionAr = foundContentMetadataDescriptionAr.description;
            }
        }

        if (!$scope.contentMetadata.tags) {
            $scope.contentMetadata.tags = [];
        }
        if (!$scope.contentMetadata.categoryIds) {
            $scope.contentMetadata.categoryIds = [];
        }
        if (!$scope.contentMetadata.subcategoryIds) {
            $scope.contentMetadata.subcategoryIds = [];
        }
        if (!$scope.contentMetadata.moodIds) {
            $scope.contentMetadata.moodIds = [];
        }
        if (!$scope.contentMetadata.toneIds) {
            $scope.contentMetadata.toneIds = [];
        }
        if (!$scope.contentMetadata.accessChannels) {
            $scope.contentMetadata.accessChannels = [];
        }

        // Get the coverImage by id value.
        $scope.contentMetadata.coverImage = {name: undefined};
        if ($scope.contentMetadata.coverImageId) {
            var srcUrl = ContentManagementService.generateFilePath($scope.contentMetadata.coverImageId);
            FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                $scope.contentMetadata.coverImage = blob;
                if (blob) {
                    $scope.contentMetadata.coverImage.name = fileName;
                }
                $scope.originalContentMetadata = angular.copy($scope.contentMetadata);
            });
        }

        // Get the cardImage by id value.
        $scope.contentMetadata.cardImage = {name: undefined};
        if ($scope.contentMetadata.cardImageId) {
            var srcUrl = ContentManagementService.generateFilePath($scope.contentMetadata.cardImageId);
            FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                $scope.contentMetadata.cardImage = blob;
                if (blob) {
                    $scope.contentMetadata.cardImage.name = fileName;
                }
                $scope.originalContentMetadata = angular.copy($scope.contentMetadata);
            });
        }

        // Get the thumbnail by id value.
        $scope.contentMetadata.thumbnail = {name: undefined};
        if ($scope.contentMetadata.thumbnailId) {
            var srcUrl = ContentManagementService.generateFilePath($scope.contentMetadata.thumbnailId);
            FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                $scope.contentMetadata.thumbnail = blob;
                if (blob) {
                    $scope.contentMetadata.thumbnail.name = fileName;
                }
                $scope.originalContentMetadata = angular.copy($scope.contentMetadata);
            });
        }

        $scope.dateHolder = {
            startDate: ($scope.contentMetadata.launchDate ? new Date(moment($scope.contentMetadata.launchDate).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss')) : ''),
            endDate: ($scope.contentMetadata.expireDate ? new Date(moment($scope.contentMetadata.expireDate).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss')) : '')
        };

        if ($scope.contentMetadata && $scope.contentMetadata.offers && $scope.contentMetadata.offers.length > 0) {
            var chargingDetails = $scope.contentMetadata.offers[0];

            $scope.contentMetadata.chargingDetails = {
                chargingPeriod: UtilService.convertPeriodStringToSimpleObject(chargingDetails.chargingPeriodDetail),
                price: Number(chargingDetails.price),
                originalPrice: chargingDetails.originalPrice ? Number(chargingDetails.originalPrice): null,
                subscriptionCode: chargingDetails.subscriptionCode,
                revSharePolicy: chargingDetails.revSharePolicy,
                revShare: chargingDetails.revShare
            };
        } else {
            $scope.contentMetadata.chargingDetails = {
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

        $scope.originalContentMetadata = angular.copy($scope.contentMetadata);
        $scope.dateHolderOriginal = angular.copy($scope.dateHolder);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalContentMetadata, $scope.contentMetadata) &&
                angular.equals($scope.dateHolder, $scope.dateHolderOriginal);
        };

        $scope.sendToWorkflow = function (contentMetadata) {
            var original = $scope.originalContentMetadata;

            var playlistItem = {
                // Unchanged / server-controlled fields
                "id": original.id,
                "legacyId": original.legacyId,
                "contentType": original.contentType,
                "userCreated": original.userCreated,
                "dateCreated": original.dateCreated,
                "offers": original.offers,
                "totalSubscriptionCount": original.totalSubscriptionCount,
                // Changed values
                "name": contentMetadata.name,
                "organizationId": contentMetadata.organization.id,
                "organizationName": contentMetadata.organization.name,
                "status": contentMetadata.status,
                "subscriptionEnabled": contentMetadata.subscriptionEnabled,
                "promoted": contentMetadata.promoted,
                "launchDate": ($scope.dateHolder.startDate ? $filter('date')($scope.dateHolder.startDate, 'yyyy-MM-dd') + 'T00:00:00' : ''),
                "expireDate": ($scope.dateHolder.endDate ? $filter('date')($scope.dateHolder.endDate, 'yyyy-MM-dd') + 'T00:00:00' : ''),
                "names": [],
                "descriptions": [],
                "tags": contentMetadata.tags,
                "categoryIds": contentMetadata.categoryIds,
                "moodIds": contentMetadata.moodIds,
                "accessChannels": contentMetadata.accessChannels,
                "defaultToneId": contentMetadata.defaultToneId,
                "dtoneId": contentMetadata.defaultToneId,
                "toneIds": contentMetadata.tones ? _.pluck(contentMetadata.tones, 'id') : contentMetadata.toneIds,
                "userUpdated": $scope.username,
                // Will be decided below for each image
                "coverImageId": contentMetadata.coverImageId,
                "coverImageUrl": contentMetadata.coverImageUrl,
                "cardImageId": contentMetadata.cardImageId,
                "cardImageUrl": contentMetadata.cardImageUrl,
                "thumbnailId": contentMetadata.thumbnailId,
                "thumbnailUrl": contentMetadata.thumbnailUrl,
                "dateUpdated": $filter('date')(Date.now(), 'yyyy-MM-dd') + 'T00:00:00',
                "descriptionList": [],
                "featuredDescriptionList": [],
                "featuredDescriptions": [],
                "featuredTitleList": [],
                "featuredTitles": [],
                "nameList": [],
                "subcategoryIds": contentMetadata.subcategoryIds
            };

            $log.debug('Updating playlist: ', playlistItem);

            // names
            playlistItem.names.push({ lang: 'en', name: contentMetadata.nameEn });
            playlistItem.names.push({ lang: 'ar', name: contentMetadata.nameAr });

            // descriptions
            playlistItem.descriptions.push({ lang: 'en', description: contentMetadata.descriptionEn });
            playlistItem.descriptions.push({ lang: 'ar', description: contentMetadata.descriptionAr });

            // featuredTitles & featuredDescriptions (only if promoted)
            if (contentMetadata.promoted) {
                playlistItem.featuredTitles.push({ lang: 'en', name: contentMetadata.featuredTitleEn });
                playlistItem.featuredTitles.push({ lang: 'ar', name: contentMetadata.featuredTitleAr });
                playlistItem.featuredDescriptions.push({ lang: 'en', description: contentMetadata.featuredDescriptionEn });
                playlistItem.featuredDescriptions.push({ lang: 'ar', description: contentMetadata.featuredDescriptionAr });
            }
            
            // Charging Details
            if (contentMetadata.chargingDetails) {
                // The "Charging Period" field should default to "30 DAYS." and should be non-editable, as per the STC requirement. Reset the value to 30 if it is different.
                contentMetadata.chargingDetails.chargingPeriod.duration = 30;
                contentMetadata.chargingDetails.chargingPeriod.unit = $scope.DURATION_UNITS[0].key;

                var offer = {
                    "chargingPeriodDetail": UtilService.convertSimpleObjectToPeriod(contentMetadata.chargingDetails.chargingPeriod),
                    "chargingPeriod": contentMetadata.chargingDetails.chargingPeriod.duration,
                    "price": contentMetadata.chargingDetails.price,
                    "originalPrice": contentMetadata.chargingDetails.originalPrice,
                    "subscriptionCode": contentMetadata.chargingDetails.subscriptionCode,
                    "revSharePolicy": contentMetadata.chargingDetails.revSharePolicy
                };

                if (contentMetadata.chargingDetails.revSharePolicy === 'COMPLEX') {
                    offer.revShare = {
                        "operatorDeductionType": contentMetadata.chargingDetails.revShare.operatorDeductionType ? contentMetadata.chargingDetails.revShare.operatorDeductionType : "NONE",
                        "operatorDeduction": contentMetadata.chargingDetails.revShare.operatorDeduction ? contentMetadata.chargingDetails.revShare.operatorDeduction : 0,
                        "type": contentMetadata.chargingDetails.revShare.type ? contentMetadata.chargingDetails.revShare.type : null,
                        "baseShareType": "NONE",
                        "baseShare": 0,
                        "operatorShare": 0
                    };
                }

                if (contentMetadata.chargingDetails.revShare && contentMetadata.chargingDetails.revShare.operatorDeductionType === 'NONE' && contentMetadata.chargingDetails.revShare.type === 'PERCENTAGES') {
                    offer.revShare.operatorShare = (contentMetadata.chargingDetails.revShare.operatorShare ? contentMetadata.chargingDetails.revShare.operatorShare : 0);
                    offer.revShare.operatorDeduction = 0;
                }

                playlistItem.offers = [ offer ];
            }

            // Image File Handling
            var coverImage = contentMetadata.coverImage;
            var cardImage = contentMetadata.cardImage;

            var originalCoverId = original.coverImageId;
            var originalCardId = original.cardImageId;

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
                playlistItem.cardImageId = "";
                filesToDeleteAfterSuccess.push(originalCardId);
            } else if (cardReplaced) {
                newCardId = UtilService.generateObjectId();
                playlistItem.cardImageId = newCardId;

                if (originalCardId) {
                    filesToDeleteAfterSuccess.push(originalCardId);
                }
            } else {
                playlistItem.cardImageId = originalCardId;
            }

            // Cover Image
            var coverRemoved  = (!coverImage || !coverImage.name) && !!originalCoverId;
            var coverReplaced = (coverImage && coverImage.name && (coverImage instanceof File));

            if (coverRemoved) {
                playlistItem.coverImageId = "";
                filesToDeleteAfterSuccess.push(originalCoverId);
            } else if (coverReplaced) {
                // Reuse existing ID if present, otherwise assign new id.
                playlistItem.coverImageId = originalCoverId || UtilService.generateObjectId();

                postUploadTasks.push(function () {
                    return ContentManagementService.uploadFile(
                        coverImage,
                        coverImage.name,
                        playlistItem.coverImageId
                    );
                });
            } else {
                playlistItem.coverImageId = originalCoverId;
            }

            $log.debug('Updating playlist (with resolved image IDs): ', playlistItem);

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
                    return ContentManagementService.updatePlaylist(playlistItem);
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
