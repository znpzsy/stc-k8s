(function () {

    'use strict';

    angular.module('adminportal.subsystems.contentmanagement.operations.rbt', [
        'adminportal.subsystems.contentmanagement.operations.rbt.contentcategories',
        'adminportal.subsystems.contentmanagement.operations.rbt.contentsubcategories',
        'adminportal.subsystems.contentmanagement.operations.rbt.contentmetadatas',
        'adminportal.subsystems.contentmanagement.operations.rbt.signatures',
        'adminportal.subsystems.contentmanagement.operations.rbt.diy',
        'adminportal.subsystems.contentmanagement.operations.rbt.statuses'
    ]);

    var ContentManagementOperationsRBTModule = angular.module('adminportal.subsystems.contentmanagement.operations.rbt');

    ContentManagementOperationsRBTModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.contentmanagement.operations.rbt', {
            abstract: true,
            url: "/rbt",
            templateUrl: 'subsystems/contentmanagement/operations/rbt/operations.rbt.html',
            controller: 'ContentManagementOperationsRBTCtrl'
        });

    });

    ContentManagementOperationsRBTModule.controller('ContentManagementOperationsRBTCommonCtrl', function ($scope, $log, $q, $filter, UtilService, CMPFService, ContentManagementService,
                                                                                                          DEFAULT_REST_QUERY_LIMIT) {
        $log.debug('ContentManagementOperationsRBTCommonCtrl');

        var checkSubscriptionCode = function (contentObject) {
            var deferred = $q.defer();

            var isError = false;
            $scope.form.$invalid = true;
            if (contentObject.chargingDetails.subscriptionCode) {
                ContentManagementService.getContentOffersBySubscriptionCode(contentObject.chargingDetails.subscriptionCode).then(function (response) {
                    if (response && response.items && response.items.length > 0) {
                        var content = response.items[0];
                        if (content.contentId !== contentObject.id) {
                            isError = true;
                        }
                    }

                    UtilService.setError($scope.form, 'subscriptionCode', 'availabilityCheck', !isError);

                    deferred.resolve(!isError);
                });
            } else {
                deferred.resolve(true);
            }

            return deferred.promise;
        };

        $scope.setAccessChannels = function (accessType) {
            // Filter CMS_ACCESS_CHANNELS to find the matching entry
            var accessChannel = $scope.CMS_ACCESS_CHANNELS.find(function (channel) {
                return channel.label === accessType;
            });
            return accessChannel ? accessChannel.value : null;
        };

        $scope.searchCategories = _.throttle(function (text, accessType) {
            $scope.contentCategoryList = [];
            var accessChannels = $scope.setAccessChannels(accessType);

            ContentManagementService.searchContentCategoriesRBT(0, 100, text, undefined, undefined, accessChannels).then(function (response) {

                // For IVR & USSD, only show leaf categories
                if (accessType == 'USSD' || accessType == 'IVR' ) {

                    var leafCategories = _.filter(response.items, function (category) {
                        return !category.toneIds || category.toneIds.length === 0;
                    });
                    $scope.contentCategoryList = $scope.contentCategoryList.concat(leafCategories ? leafCategories : []);
                    $scope.contentCategoryList = $filter('orderBy')($scope.contentCategoryList, ['name']);

                } else {
                    // for GENERAL and unspecified, show all categories
                    $scope.contentCategoryList = $scope.contentCategoryList.concat(response ? response.items : []);
                    $scope.contentCategoryList = $filter('orderBy')($scope.contentCategoryList, ['name']);
                }
            });

        }, 500);

        $scope.searchSubcategories = _.throttle(function (text, accessType) {
            $scope.contentSubcategoryList = [];
            var accessChannels = $scope.setAccessChannels(accessType)

            ContentManagementService.searchSubcategoriesRBT(0, 100, text, undefined, undefined, accessChannels).then(function (response) {
                $scope.contentSubcategoryList = $scope.contentSubcategoryList.concat(response ? response.items : []);
                $scope.contentSubcategoryList = $filter('orderBy')($scope.contentSubcategoryList, ['name']);
            });


        }, 500);

        $scope.searchMoods = _.throttle(function (text, orgId) {
            $scope.moodList = [];

            var promises = [];

            if (orgId && orgId !== $scope.defaultRBTOrganization.id) {
                promises.push(ContentManagementService.searchMoods(0, 100, text, orgId));
            }
            promises.push(ContentManagementService.searchMoods(0, 100, text, $scope.defaultRBTOrganization.id));

            $q.all(promises).then(function (responses) {
                _.each(responses, function (response) {
                    $scope.moodList = $scope.moodList.concat(response ? response.items : []);
                })

                $scope.moodList = $filter('orderBy')($scope.moodList, ['organizationName']);
            });
        }, 500);

        $scope.searchArtists = _.throttle(function (text, orgId) {
            $scope.artistList = [];

            ContentManagementService.searchArtists(0, 100, text).then(function (response) {
                $scope.artistList = $scope.artistList.concat(response ? response.items : []);
                $scope.artistList = $filter('orderBy')($scope.artistList, ['organizationName']);
            });

            /*var promises = [];

            if (orgId && orgId !== $scope.defaultRBTOrganization.id) {
                promises.push(ContentManagementService.searchArtists(0, 100, text, orgId));
            }
            promises.push(ContentManagementService.searchArtists(0, 100, text, $scope.defaultRBTOrganization.id));

            $q.all(promises).then(function (responses) {
                _.each(responses, function (response) {
                    $scope.artistList = $scope.artistList.concat(response ? response.items : []);
                })

                $scope.artistList = $filter('orderBy')($scope.artistList, ['organizationName']);
            });*/

        }, 500);

        $scope.searchAlbums = _.throttle(function (text, orgId) {
            $scope.albumList = [];

            var promises = [];

            if (orgId && orgId !== $scope.defaultRBTOrganization.id) {
                promises.push(ContentManagementService.searchPlaylists(0, 100, text, orgId));
            }
            promises.push(ContentManagementService.searchPlaylists(0, 100, text, $scope.defaultRBTOrganization.id));

            $q.all(promises).then(function (responses) {
                _.each(responses, function (response) {
                    $scope.albumList = $scope.albumList.concat(response ? response.items : []);
                })

                $scope.albumList = $filter('orderBy')($scope.albumList, ['organizationName']);
            });
        }, 500);

        $scope.searchPlaylists = _.throttle(function (text, orgId) {
            $scope.playlistList = [];

            ContentManagementService.searchPlaylists(0, 100, text).then(function (response) {
                $scope.playlistList = $scope.playlistList.concat(response ? response.items : []);
                $scope.playlistList = $filter('orderBy')($scope.playlistList, ['organizationName']);
            });

           /* var promises = [];

            if (orgId && orgId !== $scope.defaultRBTOrganization.id) {
                promises.push(ContentManagementService.searchPlaylists(0, 100, text, orgId));
            }
            promises.push(ContentManagementService.searchPlaylists(0, 100, text, $scope.defaultRBTOrganization.id));

            $q.all(promises).then(function (responses) {
                _.each(responses, function (response) {
                    $scope.playlistList = $scope.playlistList.concat(response ? response.items : []);
                })

                $scope.playlistList = $filter('orderBy')($scope.playlistList, ['organizationName']);
            });*/

        }, 500);

        $scope.searchTones = _.throttle(function (text, orgId) {
            $scope.toneList = [];


            ContentManagementService.searchTones(0, 100, text).then(function (response) {
                $scope.toneList = $scope.toneList.concat(response ? response.items : []);
                $scope.toneList = $filter('orderBy')($scope.toneList, ['organizationName']);
            });

            /*var promises = [];

            if (orgId && orgId !== $scope.defaultRBTOrganization.id) {
                promises.push(ContentManagementService.searchTones(0, 100, text, orgId));
            }
            promises.push(ContentManagementService.searchTones(0, 100, text, $scope.defaultRBTOrganization.id));

            $q.all(promises).then(function (responses) {
                _.each(responses, function (response) {
                    $scope.toneList = $scope.toneList.concat(response ? response.items : []);
                })

                $scope.toneList = $filter('orderBy')($scope.toneList, ['organizationName']);
            });*/

        }, 500);

        $scope.searchTonesList = _.throttle(function (text, orgId) {
            $scope.toneIdsList = [];


            ContentManagementService.searchTones(0, 100, text).then(function (response) {
                $scope.toneIdsList = $scope.toneIdsList.concat(response ? response.items : []);
                $scope.toneIdsList = $filter('orderBy')($scope.toneIdsList, ['organizationName']);
            });

            /*var promises = [];

            if (orgId && orgId !== $scope.defaultRBTOrganization.id) {
                promises.push(ContentManagementService.searchTones(0, 100, text, orgId));
            }
            promises.push(ContentManagementService.searchTones(0, 100, text, $scope.defaultRBTOrganization.id));

            $q.all(promises).then(function (responses) {
                _.each(responses, function (response) {
                    $scope.toneIdsList = $scope.toneIdsList.concat(response ? response.items : []);
                })

                $scope.toneIdsList = $filter('orderBy')($scope.toneIdsList, ['organizationName']);
            });*/

        }, 500);

        $scope.searchTonesByArtist = _.throttle(function (text, artistId) {
            $scope.toneList = [];

            ContentManagementService.searchTonesByArtist(0, 100, text, artistId).then(function (response) {
                $scope.toneList = (response ? response.items : []);

                $scope.toneList = $filter('orderBy')($scope.toneList, ['organizationName']);
            });
        }, 500)

        $scope.searchTonesByPlaylist = _.throttle(function (text, playlistId) {
            $scope.toneList = [];

            ContentManagementService.searchTonesByPlaylist(0, 100, text, playlistId).then(function (response) {
                $scope.toneList = (response ? response.items : []);

                $scope.toneList = $filter('orderBy')($scope.toneList, ['organizationName']);
            });
        }, 500);

        $scope.searchTonesByAlbum = _.throttle(function (text, albumId) {
            $scope.toneList = [];

            ContentManagementService.searchTonesByAlbum(0, 100, text, albumId).then(function (response) {
                $scope.toneList = (response ? response.items : []);

                $scope.toneList = $filter('orderBy')($scope.toneList, ['organizationName']);
            });
        }, 500);

        $scope.searchTonesByMood = _.throttle(function (text, moodId) {
            $scope.toneList = [];

            ContentManagementService.searchTonesByMood(0, 100, text, moodId).then(function (response) {
                $scope.toneList = (response ? response.items : []);

                $scope.toneList = $filter('orderBy')($scope.toneList, ['organizationName']);
            });
        }, 500);

        $scope.searchTonesByCategory = _.throttle(function (text, categoryId) {
            $scope.toneList = [];

            ContentManagementService.searchTonesByCategory(0, 100, text, categoryId).then(function (response) {
                $scope.toneList = (response ? response.items : []);

                $scope.toneList = $filter('orderBy')($scope.toneList, ['organizationName']);
            });
        }, 500);

        // TODO: Clarify if this will be needed.
        $scope.getPrepareRBTSettelementTypes = function (contentObject) {
            var settlementTypes = [];
            var deferred = $q.defer();

            CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_BUSINESS_TYPES_ORGANIZATION_NAME).then(function (businessTypeOrganizationRes) {
                var businessTypeOrganization = businessTypeOrganizationRes.organizations[0];
                var businessTypeProfiles = CMPFService.getBusinessTypes(businessTypeOrganization);

                CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_SETTLEMENT_TYPES_ORGANIZATION_NAME).then(function (settlementTypeOrganizationRes) {
                    var settlementTypesOrganization = settlementTypeOrganizationRes.organizations[0];
                    var allSettlementTypes = CMPFService.getSettlementTypes(settlementTypesOrganization);
                    allSettlementTypes = $filter('orderBy')(allSettlementTypes, 'profileId');

                    if (businessTypeProfiles.length > 0) {
                        var foundRBTBusinessType = _.findWhere(businessTypeProfiles, {"Name": 'RBT'});

                        // Prepare settlement type list.
                        var providerSettlementTypeProfiles = CMPFService.getProfileAttributes(contentObject.organization.profiles, CMPFService.SERVICE_PROVIDER_SETTLEMENT_TYPE_PROFILE);

                        // Filter out the settlement types
                        var allSettlementTypeIds = _.pluck(foundRBTBusinessType.SettlementTypes, "value");
                        _.each(providerSettlementTypeProfiles, function (providerSettlementTypeProfile) {
                            var foundSettlementType = _.findWhere(allSettlementTypes, {profileId: providerSettlementTypeProfile.SettlementTypeID});
                            if (allSettlementTypeIds && foundSettlementType && _.contains(allSettlementTypeIds, foundSettlementType.profileId.toString())) {
                                if (foundSettlementType.IsPartnerSpecific) {
                                    if (foundSettlementType.Partners) {
                                        var partnerIds = String(foundSettlementType.Partners).split(',');
                                        if (partnerIds.indexOf(String(contentObject.organization.id)) > -1) {
                                            settlementTypes.push(foundSettlementType);
                                        }
                                    }
                                } else {
                                    settlementTypes.push(foundSettlementType);
                                }
                            }
                        });

                        deferred.resolve(settlementTypes);
                    }
                });
            });

            return deferred.promise;
        };

        $scope.save = function (contentObject) {
            checkSubscriptionCode(contentObject).then(function (result) {
                $log.debug('checkSubscriptionCode', result);
                if (result) {
                    // Send to the workflow
                    $log.debug('sending to cms', contentObject);
                    $scope.sendToWorkflow(contentObject);
                }
            });
        };
    });
    ContentManagementOperationsRBTModule.controller('ContentManagementOperationsRBTPlaylistsModalCtrl', function ($scope, $log, $filter, $uibModalInstance, NgTableParams, NgTableService ,  playlists, entity, titleKey ) {
        $log.debug('ContentManagementOperationsRBTPlaylistModalCtrl');

        $scope.object = entity;
        $scope.titleKey = titleKey;

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

        $scope.playlists = playlists ? (playlists.items ? playlists.items : []) : [];

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
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.playlists);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.playlists;
                params.total(orderedData.length); // set total for recalc pagination
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

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });

    ContentManagementOperationsRBTModule.controller('ContentManagementOperationsRBTTonesModalCtrl', function ($scope,$log, $filter, $uibModalInstance,  NgTableParams, NgTableService, tones, entity, titleKey) {
        $log.debug('ContentManagementOperationsRBTTonesModalCtrl');

        $scope.object = entity;
        $scope.titleKey = titleKey;

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'id',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.ContentMetadatas.Tones.Id'
                },
                {
                    fieldName: 'name',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.ContentMetadatas.Tones.Name'
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

        $scope.tones = tones ? (tones.items ? tones.items : []) : [];

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
                params.total(orderedData.length); // set total for recalc pagination
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

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

    });

    ContentManagementOperationsRBTModule.controller('ContentManagementOperationsRBTCtrl', function ($scope, $log, $q, $uibModal) {
        $log.debug('ContentManagementOperationsRBTCtrl');

        // Playlists
        $scope.viewPlaylists = function (contextKey, entity, titleKey) {
            $uibModal.open({
                templateUrl: 'subsystems/contentmanagement/operations/rbt/operations.playlists.modal.html',
                controller: 'ContentManagementOperationsRBTPlaylistsModalCtrl',
                size: 'lg',
                resolve: {
                    playlists: function (ContentManagementService, DEFAULT_REST_QUERY_LIMIT) {
                        return ContentManagementService.getPlaylistsByContextRBT(contextKey, entity.id, 0, DEFAULT_REST_QUERY_LIMIT);
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
                        if (contextKey === 'artists') {
                            return ContentManagementService.searchTonesByArtist(0, DEFAULT_REST_QUERY_LIMIT, null, entity.id);
                        } else {
                            return ContentManagementService.getTonesByContextRBT(contextKey, entity.id, 0, DEFAULT_REST_QUERY_LIMIT);
                        }
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

        // Tone Selection Common Functions
        $scope.openToneSelectionModal = function (selectedTones, onTonesSelectedCallback, initConfig) {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/contentmanagement/operations/rbt/operations.tones.selection.modal.html',
                controller: 'ContentManagementOperationsRBTToneSelectionModalCtrl',
                size: 'lg',
                resolve: {
                    allOrganizations: function (CMPFService) {
                        return CMPFService.getAllOrganizations(0, 100);
                    },
                    selectedTones: function() {
                        return selectedTones;
                    },
                    initConfig: function() {
                        // Default configuration
                        var defaults = {
                            titleKey: 'Tones',
                            dateFilter: {
                                status: 'ACTIVE',
                                startDate: undefined,
                                endDate: undefined,
                                blacklisted: undefined,
                                promoted: undefined,
                                subscriptionEnabled: undefined,
                                alias: '',
                                categoryId: null,
                                artistId: null,
                                playlistId: null
                            },
                            enableToneOrdering: false,
                            accessType: undefined,
                            selectionLimit: null,
                            isAuthorized: true
                        };
                        return initConfig ? _.extend(defaults, initConfig) : defaults;
                    }
                }
            });

            modalInstance.result.then(function (selectedTones) {
                if (typeof onTonesSelectedCallback === 'function') {
                    $log.debug('onTonesSelectedCallback: ', selectedTones);
                    onTonesSelectedCallback(selectedTones);
                }
            }, function () {
                $log.debug('Modal dismissed at: ' + new Date());
            });

        };

        $scope.setToneIds = function(toneIdList, tonesList) {
            if(tonesList && tonesList.length > 0) {
                toneIdList = _.pluck(tonesList, 'id');
            } else {
                toneIdList = [];
                tonesList = [];
            }
            $log.debug('Content - list of [toneIds]: ', toneIdList);

            // Broadcast the event with the updated toneIds
            $scope.$broadcast('toneIdsUpdated', toneIdList);
        }

        $scope.shift = function(toneIdList, tonesList, index, increment) {
            var temp = tonesList[index];
            tonesList[index] = tonesList[index + increment];
            tonesList[index + increment] = temp;
            $scope.setToneIds(toneIdList, tonesList);
        };

        $scope.removeToneSelection = function(toneIdList, tonesList, index) {
            $log.debug('Content - removing tone: ', tonesList[index], 'toneIdList', toneIdList, 'index', index);
            tonesList[index].selected = false;
            tonesList.splice(index, 1);
            $scope.setToneIds(toneIdList, tonesList);
            $log.debug('Content - removed tone: ', toneIdList, tonesList);
        };
    });


    ContentManagementOperationsRBTModule.controller('ContentManagementOperationsRBTToneSelectionModalCtrl', function ($controller, $uibModalInstance, $q, $scope, $log, $state, $timeout, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                                Restangular, UtilService, FileDownloadService, RBTPressKeyManagementService, CMPFService, DateTimeConstants, ContentManagementService, WorkflowsService,
                                                                                                                                SessionService, CMS_RBT_STATUS_TYPES, CMS_ACCESS_CHANNELS, allOrganizations, selectedTones, initConfig) {
        $log.debug('ContentManagementOperationsRBTToneSelectionModalCtrl');
        $controller('ListViewsAudioController', {$scope: $scope});
        $controller('ContentManagementOperationsRBTCtrl', {$scope: $scope});
        $controller('ContentManagementOperationsRBTCommonCtrl', {$scope: $scope});

        $controller('GenericDateTimeCtrl', {$scope: $scope});

        $scope.CMS_RBT_STATUS_TYPES = CMS_RBT_STATUS_TYPES;
        $scope.CMS_ACCESS_CHANNELS = CMS_ACCESS_CHANNELS;

        var organizations = Restangular.stripRestangular(allOrganizations);
        $scope.allOrganizations = $filter('orderBy')(organizations.organizations, 'id');
        $scope.username = SessionService.getUsername();
        $scope.selectedTones = selectedTones ? angular.copy(selectedTones) : [];
        $scope.loading_tone = [];

        $scope.dateFilter = initConfig.dateFilter;
        $scope.enableToneOrdering = initConfig.enableToneOrdering;
        $scope.isAuthorized = initConfig.isAuthorized;
        $scope.accessType = initConfig.accessType;
        $scope.titleKey = initConfig.titleKey;
        $scope.selectionLimit = initConfig.selectionLimit;

        // --- Selection model
        $scope.selectedIds = Object.create(null);
        // Sticky bulk toggle memory (false = next click will select all)
        $scope.headerToggleState = false;

        // Seed selection from incoming selectedTones (if any)
        angular.forEach($scope.selectedTones, function (t) {
            $scope.selectedIds[t.id] = true;
        });

        $scope.recomputeHeaderState = function(tableData){
            var total = (tableData && tableData.length) || 0;
            var sel = total ? _.filter(tableData, {selected: true}).length : 0;
            $scope.selectAll = total > 0 && sel === total;           // visual checkmark
            $scope.selectIndeterminate = sel > 0 && sel < total;     // visual dash

            // set this here
            $scope.headerToggleState = (sel === total && total > 0);
        };

        $scope.toggleRow = function(item){
            item.selected = !item.selected;
            if (item.selected) {
                $scope.selectedIds[item.id] = true;
                if (!_.findWhere($scope.selectedTones, {id: item.id})) {
                    $scope.selectedTones.push(item);
                }
            } else {
                delete $scope.selectedIds[item.id];
                $scope.selectedTones = _.reject($scope.selectedTones, {id: item.id});
            }
        };

        // --- Filter Form / Search Filters:
        $scope.setError= function(form, fieldName, errorKey, isValid) {
            if (form[fieldName]) {
                form[fieldName].$setValidity(errorKey, isValid);
            }
        }

        $scope.validateDates = function () {

            UtilService.setError($scope.filterForm, 'startDate', 'maxDateExceeded', true);
            UtilService.setError($scope.filterForm, 'startDate', 'maxToday', true);

            UtilService.setError($scope.filterForm, 'endDate', 'minDateExceeded', true);
            UtilService.setError($scope.filterForm, 'endDate', 'maxToday', true);
            var startDate = UtilService.calculateDate($scope.dateFilter.startDate, 0, 0);
            var endDate = UtilService.calculateDate($scope.dateFilter.endDate, 23, 59);
            var startDateTime = new Date(startDate);
            var endDateTime = new Date(endDate);
            // Create a `today` object set to 23:59:59.999
            var today = new Date();
            today.setHours(23, 59, 59, 999);

            var diffMs = endDateTime - startDateTime;
            $log.debug("$scope.dateFilter.endDate", $scope.dateFilter.endDate);
            $log.debug("$scope.dateFilter.startDate", $scope.dateFilter.startDate);
            $log.debug("diffMs", diffMs);

            $scope.setError($scope.filterForm, 'startDate', 'maxDateExceeded', !(diffMs < 0));
            $scope.setError($scope.filterForm, 'endDate', 'minDateExceeded', !(diffMs < 0));
            // Check if the dates are after today
            $scope.setError($scope.filterForm, 'startDate', 'maxToday', !(startDateTime > today));
            $scope.setError($scope.filterForm, 'endDate', 'maxToday', !(endDateTime > today));

        };

        $scope.$watch('dateFilter.startDate', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                $scope.validateDates();
            }
        });
        $scope.$watch('dateFilter.endDate', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                $scope.validateDates();
            }
        });
        $scope.$watch('dateFilter.categoryId', function (newVal, oldVal) {
            if (!_.isUndefined(newVal) && newVal !== null && newVal !== oldVal) {
                $scope.dateFilter.subcategory = null;
            }
        });

        // If there is a limit, watch the length of the selected items
        var limitModalOpen = false;

        if ($scope.selectionLimit && Number($scope.selectionLimit) > 0) {
            var limitModalOpen = false;
            $scope.$watch(
                function () { return ($scope.selectedTones || []).length; },
                function (newLen, oldLen) {
                    if (!limitModalOpen && oldLen <= $scope.selectionLimit && newLen > $scope.selectionLimit) {

                        limitModalOpen = true;

                        var modalInstance = $uibModal.open({
                            templateUrl: 'partials/modal/modal.alert.html',
                            controller: function ($scope, $uibModalInstance, $translate, $controller, $sce, limit, $log) {

                                $scope.alertTitle = $translate.instant('CommonLabels.Warning');
                                var message = $translate.instant('Subsystems.ContentManagement.Operations.RBT.ContentMetadatas.Tones.BulkOperations.MaxSelectionLimit', { selectionLimit: limit });
                                $scope.alertMessage = $sce.trustAsHtml(message);

                                $controller('AlertModalInstanceCtrl', { $scope: $scope, $uibModalInstance: $uibModalInstance });
                            },
                            resolve: {
                                limit: function () { return $scope.selectionLimit; }
                            }
                        });

                        modalInstance.result.finally(function () {
                            limitModalOpen = false;
                        });
                    }
                }
            );
        }


        $scope.searchCategories = _.throttle(function (text) {
            $scope.contentCategoryList = [];
            var accessChannels = $scope.setAccessChannels(initConfig.accessType)

            ContentManagementService.searchContentCategoriesRBT(0, 100, text, undefined, ['ACTIVE'], accessChannels).then(function (response) {
                $scope.contentCategoryList = $scope.contentCategoryList.concat(response ? response.items : []);
                $scope.contentCategoryList = $filter('orderBy')($scope.contentCategoryList, ['name']);
            });

        }, 500);

        $scope.searchSubcategories = _.throttle(function (text, categoryId) {
            $scope.contentSubcategoryList = [];

            var promise = categoryId ? ContentManagementService.searchSubcategoriesRBTFiltered(0, 100, text, categoryId) : ContentManagementService.searchSubcategoriesRBTFiltered(0, 100, text);

            promise.then(function(response) {
                $scope.contentSubcategoryList = response ? response.items : [];
                $scope.contentSubcategoryList = $filter('orderBy')($scope.contentSubcategoryList, ['categoryId']);
                $log.debug('Content subcategories: ', $scope.contentSubcategoryList);
            });

        }, 500);

        $scope.searchArtists = _.throttle(function (text) {
            $scope.artistList = [];
            ContentManagementService.searchArtists(0, 100, text).then(function (response) {
                $scope.artistList = response ? response.items : [];
                $scope.artistList = $filter('orderBy')($scope.artistList, ['organizationName']);
                $log.debug('Artists: ', $scope.artistList);
            });

        }, 500);
        // END --- Filter Form / Search Filters:

        // --- Results Table:
        $scope.isToneSelected = function(id) {
            return _.findIndex($scope.selectedTones, {id: id}) > -1;
        };

        $scope.filterFormLayer = {
            isFilterFormOpen: false
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

        $scope.throttledReloadTable = _.throttle(function () {
            $scope.reloadTable($scope.contentMetadataList.tableParams, true);
        }, 500);

        $scope.prepareFilter = function (tableParams, dateFilter) {
            var result = {};

            result.filter = {
            };

            result.additionalFilterFields = {
                statuses: dateFilter.status ? [dateFilter.status] : [],
                organizationId: dateFilter.organizationId,
                promoted: dateFilter.promoted,
                blacklisted: dateFilter.blacklisted,
                subscriptionEnabled: dateFilter.subscriptionEnabled,
                alias: dateFilter.alias,
                categoryId: dateFilter.categoryId,
                subcategory: dateFilter.subcategory,
                artistId: dateFilter.artistId,
                startDate: dateFilter.startDate ? $filter('date')(dateFilter.startDate, 'yyyy-MM-dd') + 'T00:00:00' : undefined,
                endDate: dateFilter.endDate ? $filter('date')(dateFilter.endDate, 'yyyy-MM-dd') + 'T23:59:59' : undefined
            };

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

        // Tone list
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
                var preparedFilter = $scope.prepareFilter(params, $scope.dateFilter);

                var filter = preparedFilter.filter;
                var additionalFilterFields = preparedFilter.additionalFilterFields;

                ContentManagementService.searchTonesByRichFilter(filter.page, filter.limit, filter.sortFieldName, filter.sortOrder, filter.filterText, additionalFilterFields).then(function (response) {
                    $log.debug("Found records: ", response);
                    $scope.contentMetadataList.list = (response ? response.items : []);

                    // Restore selection flags from selectedIds
                    angular.forEach($scope.contentMetadataList.list, function (row) {
                        row.selected = !!$scope.selectedIds[row.id];
                    });

                    // Update header tri-state
                    $scope.recomputeHeaderState($scope.contentMetadataList.list);

                    params.total(response ? response.totalCount : 0);
                    $defer.resolve($scope.contentMetadataList.list);
                }, function (error) {
                    $log.debug('Error: ', error);
                    params.total(0);
                    $defer.resolve([]);
                });
                $scope.stopAudio();
            }
        });
        // END - Tone list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.contentMetadataList.tableParams.settings().$scope.filterText = filterText;
            $scope.contentMetadataList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.contentMetadataList.tableParams.page(1);
            $scope.contentMetadataList.tableParams.reload();
        }, 750);
        // END --- Results Table


        // --- Modal Actions:

        $scope.updateSelection = function(tableData) {
            $scope.selectedTones = _.filter(tableData, { selected: true });
        };

        // --- Table Actions:
        $scope.toneSelected = function(tone, tableData) {
            $log.debug('Selected tone: ', tone);
           // Check for authorization
           if($scope.isAuthorized){
               tone.selected = !tone.selected;
               if($scope.isToneSelected(tone.id)){
                   $scope.selectedTones = _.reject($scope.selectedTones, {id: tone.id});
               } else {
                   $scope.selectedTones.push(tone);
               }
           }
            $scope.updateSelection(tableData);
        };

        $scope.toggleSelectAll = function(tableData){
            // Flip last state
            var newState = !$scope.headerToggleState;    // true = select all, false = deselect all

            angular.forEach(tableData, function (item) {
                if (!!item.selected !== newState) {
                    item.selected = newState;
                    if (newState) {
                        $scope.selectedIds[item.id] = true;
                        if (!_.findWhere($scope.selectedTones, {id: item.id})) {
                            $scope.selectedTones.push(item);
                        }
                    } else {
                        delete $scope.selectedIds[item.id];
                        $scope.selectedTones = _.reject($scope.selectedTones, {id: item.id});
                    }
                }
            });

            // Lock in the latest intent
            $scope.headerToggleState = newState;
            $scope.recomputeHeaderState(tableData);
        };


        $scope.updateTableData = function(selectedTones) {
            $scope.selectedIds = Object.create(null);
            angular.forEach(selectedTones, function (t) {
                $scope.selectedIds[t.id] = true;
            });
            $scope.reloadTable($scope.contentMetadataList.tableParams, $scope.contentMetadataList.tableParams.page());
        };

        $scope.ok = function () {
            if ($scope.selectionLimit && $scope.selectionLimit > 0) {
                $scope.selectedTones = $scope.selectedTones.slice(0, $scope.selectionLimit);
            }
            $uibModalInstance.close($scope.selectedTones);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
        // END --- Modal Actions

    });


    ContentManagementOperationsRBTModule.controller('AllowedCategoriesCommonCtrl', function ($scope, $log, $q, $state, $controller, $filter, $uibModal, UtilService, SessionService) {
        $log.debug('AllowedCategoriesCommonCtrl');

        $scope.sessionOrganization = SessionService.getSessionOrganization();
        $scope.username = SessionService.getUsername();
        //$scope.availableCategories = SessionService.getRbtAllowedCategories();

        $scope.isIVR = function (item) {
            return item.accessChannels && item.accessChannels.length > 0  && item.accessChannels[0] === 'IVR';
        };

        $scope.isUSSD = function (item) {
            return item.accessChannels && item.accessChannels.length > 0  && item.accessChannels[0] === 'USSD';
        };

        $scope.isGeneral = function (item) {
            return !$scope.isIVR(item) && !$scope.isUSSD(item);
        };

        $scope.getAccessType = function (item) {
            if ($scope.isIVR(item)) {
                return 'IVR';
            } else if ($scope.isUSSD(item)) {
                return 'USSD';
            } else {
                return 'GENERAL';
            }
        }

        $scope.hasGeneral = function (list) {
            return _.some(list, function (item) {
                return $scope.isGeneral(item);
            });
        };


        $scope.isSubcategoryAllowed = function (id) {
            return _.findIndex($scope.availableCategories, {SubCategoryID: id}) > -1;
        }

        var modalInstance;
        $scope.showAllowedCategories = function (organizationId, selectedSubcategories, onSelectionCallback, config) {
            modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.allowed.category.html',
                size: 'md',
                backdrop: 'static',  // Prevents accidental closure by clicking outside the modal
                controller: 'AllowedCategoriesModalPopupCtrl',
                resolve: {
                    organizationInfo: function (CMPFService) {
                        return CMPFService.getPartner(organizationId);
                    },
                    categoryList: function ($log, ContentManagementService, CMS_ACCESS_CHANNELS, DEFAULT_REST_QUERY_LIMIT) {
                        var accessChannels = CMS_ACCESS_CHANNELS.find(function (channel) { return channel.label === 'GENERAL'; });
                        accessChannels = (accessChannels) ? accessChannels.value : null;
                        $log.debug('accessChannels: ', accessChannels);
                        return ContentManagementService.getContentCategoriesRBT(0, DEFAULT_REST_QUERY_LIMIT, null, null, null, null, accessChannels);
                    },
                    subcategoryList: function(ContentManagementService, CMS_ACCESS_CHANNELS, DEFAULT_REST_QUERY_LIMIT) {
                        // Filter CMS_ACCESS_CHANNELS to find the matching entry
                        var accessChannels = CMS_ACCESS_CHANNELS.find(function (channel) {
                            return (channel.label === 'GENERAL') ? channel.value : null;
                        });
                        accessChannels = (accessChannels) ? accessChannels.value : null;
                        return ContentManagementService.getSubcategoriesRBT(0, DEFAULT_REST_QUERY_LIMIT, null, null, null, null, accessChannels);
                    },
                    selectedSubcategories: function () {
                        return selectedSubcategories ? selectedSubcategories : [];
                    },
                    config: function () {
                        return config;
                    }
                }
            });

            modalInstance.result.then(function(selectedSubcategories) {
                if (typeof onSelectionCallback === 'function') {
                    onSelectionCallback(selectedSubcategories);
                }
            }, function () {
                $log.debug('Modal closed');
            })
        };

        // Function to close the modal if the state changes
        $scope.$on('$stateChangeStart', function() {
            if (modalInstance) {
                modalInstance.close();  // Close the modal
            }
        });

/*
        $scope.setIds = function(idList, entityList) {
            if(entityList && entityList.length > 0) {
                idList = _.pluck(entityList, 'id');
            } else {
                idList = [];
                entityList = [];
            }
            // Broadcast the event with the updated id's
            $scope.$broadcast('subcategoryIdsUpdated', idList);
        }

        $scope.removeSelection = function(idList, entityList, index) {
            $log.warn("Content - removing selection:",
                "\n----------------------------------",
                "\nidList:", idList,
                "\nentityList", entityList,
                "\nindex", index,
                "\nentityList[index]", entityList[index]
                );
            entityList = entityList.splice(index, 1);
            $scope.setIds(idList, entityList);
            $log.warn("Content - removed selection:",
                "\n----------------------------------",
                "\nidList:", idList,
                "\nentityList", entityList
            );
        };
*/
    });


    ContentManagementOperationsRBTModule.controller('AllowedCategoriesModalPopupCtrl', function($scope, $log, $controller, $uibModalInstance, $filter, NgTableParams, NgTableService, Restangular, CMPFService, organizationInfo, categoryList, subcategoryList, selectedSubcategories) {


        $log.debug('AllowedCategoriesModalPopupCtrl');
        $controller('AllowedCategoriesCommonCtrl', {$scope: $scope});

        $scope.selectedSubcategories = angular.copy(selectedSubcategories);
        $scope.selectedSubcategoriesOriginal = angular.copy(selectedSubcategories);
        $scope.selected_general = _.filter($scope.selectedSubcategories, function (item) {
            return $scope.isGeneral(item);
        });
        $scope.selected_others = _.filter($scope.selectedSubcategories, function (item) {
            return $scope.isIVR(item) || $scope.isUSSD(item);
        });

        $scope.provider = Restangular.stripRestangular(organizationInfo);
        $scope.provider.serviceProviderAllowedCategoryProfiles = CMPFService.prepareProviderAllowedCategoryProfiles($scope.provider, categoryList.items, subcategoryList.items);
        $scope.categoryList = categoryList.items;
        $scope.subcategoryList = subcategoryList.items;

        $scope.getCategoryString = function (categoryProfile) {
            return 'Category: ' + categoryProfile.categoryName + ', Subcategory: ' + categoryProfile.subCategoryName;
        };
        $scope.getSubcategoryId = function (categoryProfile) {
            return 'Subcategory ID: ' + categoryProfile.subcategory.id;
        };


        $scope.listData = [];
        var categoriesMap = {};
        _.each($scope.provider.serviceProviderAllowedCategoryProfiles, function(item) {
            var categoryId = item.MainCategoryID;
            var subcategoryId = item.SubCategoryID;

            if (!categoriesMap[subcategoryId]) {
                // Add subcategory with its corresponding category details
                categoriesMap[subcategoryId] = angular.extend({}, item.subcategory, {
                    category: item.category
                });
                $scope.listData.push(categoriesMap[subcategoryId]);
            }
            //$log.debug('categoriesMap: ', categoriesMap, 'listData', $scope.listData);
        });

        // Subcategories list
        $scope.subcategoriesList = {
            list: $scope.listData,
            tableParams: {}
        };

        $scope.subcategoriesList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "category.name": 'asc'
            }
        }, {
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.subcategoriesList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.subcategoriesList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Subcategories list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.subcategoriesList.tableParams.settings().$scope.filterText = filterText;
            $scope.subcategoriesList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.subcategoriesList.tableParams.page(1);
            $scope.subcategoriesList.tableParams.reload();
        }, 750);

        $scope.isSubcategorySelected = function(id) {
            return _.findIndex($scope.selectedSubcategories, {id: id}) > -1;
        };

        // --- Modal Actions:
        $scope.subcategorySelected = function(category) {
            $scope.selected_general = [category];
            $scope.selectedSubcategories = $scope.selected_others.concat($scope.selected_general);
        };

        $scope.isNotChanged = function() {
            return angular.equals($scope.selectedSubcategories, $scope.selectedSubcategoriesOriginal);
        }

        $scope.ok = function () {
            $uibModalInstance.close($scope.selectedSubcategories);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
        // END --- Modal Actions

    });



    ContentManagementOperationsRBTModule.controller('CategorySelectionModalPopupCtrl', function ($rootScope, $window, $uibModalInstance, $q, $scope, $log, $state, $timeout, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                           Restangular, WorkflowsService, ContentManagementService, CMS_ACCESS_CHANNELS, contentMetadata) {
        $log.debug('CategorySelectionModalPopupCtrl');

        $scope.contentMetadata = contentMetadata;
        $scope.accessChannels = CMS_ACCESS_CHANNELS.find(function (channel) { return channel.label === 'GENERAL'}).value

        $scope.categoryProfile = {
            categoryId: null,
            categoryName: "",
            subCategoryId:null,
            subCategoryName:"",
        };

        $scope.$watch('categoryProfile.category', function (newVal, oldVal) {

            if(!newVal && oldVal){
                $scope.categoryProfile.subCategory = null;
                $scope.categoryProfile.subCategoryId = null;
            }

            if (newVal && !angular.equals(newVal, oldVal)) {
                $scope.categoryProfile.categoryId = newVal.id;
                $scope.categoryProfile.categoryName = newVal.name;
                $scope.categoryProfile.subCategoryName = "";
                $scope.categoryProfile.subCategory = null;
            }

        });

        $scope.$watch('categoryProfile.subCategory', function (newVal, oldVal) {
            if(!newVal && oldVal){
                $scope.categoryProfile.subCategoryId = null;
            }
            if (newVal && !angular.equals(newVal, oldVal)) {
                $scope.categoryProfile.subCategoryId = newVal.id;
                $scope.categoryProfile.subCategoryName = newVal.name;
            }
        });

        $scope.save = function (categoryProfile) {
            $uibModalInstance.close(categoryProfile);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.checkIfAllowed = function (contentSubcategoryListItem) {
            var item = _.findWhere($scope.contentMetadata.subcategories,{id: contentSubcategoryListItem.id});
            return !!item ;
        }


        $scope.searchCategories = _.throttle(function (text) {
            $scope.contentCategoryList = [];
            ContentManagementService.searchContentCategoriesRBT(0, 100, text, undefined, undefined, $scope.accessChannels).then(function (response) {
                $scope.contentCategoryList = $scope.contentCategoryList.concat(response ? response.items : []);
                $scope.contentCategoryList = $filter('orderBy')($scope.contentCategoryList, ['name']);
            });

        }, 500);

        $scope.searchSubcategories = _.throttle(function (text, categoryId) {
            $scope.contentSubcategoryList = [];

            var promise = ContentManagementService.searchSubcategoriesRBTFiltered(0, 100, text, categoryId);

            promise.then(function(response) {
                $scope.contentSubcategoryList = response ? response.items : [];
                $scope.contentSubcategoryList = $filter('orderBy')($scope.contentSubcategoryList, ['name']);
            });

        }, 500);

    });
})();
