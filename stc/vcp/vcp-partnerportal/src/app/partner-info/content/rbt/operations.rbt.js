(function () {

    'use strict';

    angular.module('partnerportal.partner-info.operations.rbt', [
        'partnerportal.partner-info.operations.rbt.contentmetadatas',
        'partnerportal.partner-info.operations.rbt.bulk'
    ]);

    var PartnerInfoContentManagementRBTModule = angular.module('partnerportal.partner-info.operations.rbt');

    PartnerInfoContentManagementRBTModule.config(function ($stateProvider) {

        $stateProvider.state('partner-info.operations.rbt', {
            abstract: true,
            url: "/rbt",
            templateUrl: 'partner-info/content/rbt/operations.rbt.html',
            controller: 'PartnerInfoContentManagementRBTCtrl'
        });

    });

    PartnerInfoContentManagementRBTModule.controller('PartnerInfoContentManagementRBTCommonCtrl', function ($scope, $log, $q, $filter, Restangular, UtilService, CMPFService, ContentManagementService, SessionService,
                                                                                                            DEFAULT_REST_QUERY_LIMIT) {
        $log.debug('PartnerInfoContentManagementRBTCommonCtrl');

        var sessionOrganization = SessionService.getSessionOrganization();

        var getRBTProviderBusinessTypeProfile = function () {
            var deferred = $q.defer();

            CMPFService.getPartnerById(sessionOrganization.id).then(function (partner) {
                var partnerSimple = Restangular.stripRestangular(partner);
                UtilService.putToSessionStore(UtilService.USER_ORGANIZATION_KEY, partnerSimple);

                CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_BUSINESS_TYPES_ORGANIZATION_NAME).then(function (response) {
                    var businessTypesOrganization = _.findWhere(response.organizations, {name: CMPFService.DEFAULT_BUSINESS_TYPES_ORGANIZATION_NAME});
                    var businessTypes = CMPFService.getBusinessTypes(businessTypesOrganization);
                    var rbtBusinessType = _.findWhere(businessTypes, {Name: 'RBT'});

                    var providerBusinessTypeProfiles = CMPFService.getProfileAttributes(partnerSimple.profiles, CMPFService.SERVICE_PROVIDER_BUSINESS_TYPE_PROFILE);

                    var rbtProviderBusinessTypeProfile;
                    if (providerBusinessTypeProfiles) {
                        rbtProviderBusinessTypeProfile = _.findWhere(providerBusinessTypeProfiles, {'BusinessTypeID': rbtBusinessType.profileId});
                    }

                    deferred.resolve(rbtProviderBusinessTypeProfile || {TrustedStatus: "UNTRUSTED"});
                });
            });

            return deferred.promise;
        };

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

        $scope.searchCategories = _.throttle(function (text, orgId) {
            $scope.contentCategoryList = [];

            ContentManagementService.searchContentCategoriesRBT(0, 100, text).then(function (response) {
                $scope.contentCategoryList = $scope.contentCategoryList.concat(response ? response.items : []);
                $scope.contentCategoryList = $filter('orderBy')($scope.contentCategoryList, ['organizationName']);
            });

            /*var promises = [];

            if (orgId && orgId !== $scope.defaultRBTOrganization.id) {
                promises.push(ContentManagementService.searchContentCategoriesRBT(0, 100, text, orgId));
            }
            promises.push(ContentManagementService.searchContentCategoriesRBT(0, 100, text, $scope.defaultRBTOrganization.id));

            $q.all(promises).then(function (responses) {
                _.each(responses, function (response) {
                    $scope.contentCategoryList = $scope.contentCategoryList.concat(response ? response.items : []);
                })

                $scope.contentCategoryList = $filter('orderBy')($scope.contentCategoryList, ['organizationName']);
            });*/

        }, 500);

        $scope.searchSubcategories = _.throttle(function (text, orgId) {
            $scope.contentSubcategoryList = [];

            ContentManagementService.searchSubcategoriesRBT(0, 100, text).then(function (response) {
                $scope.contentSubcategoryList = $scope.contentSubcategoryList.concat(response ? response.items : []);
                $scope.contentSubcategoryList = $filter('orderBy')($scope.contentSubcategoryList, ['organizationName']);
            });

            /*var promises = [];

            if (orgId && orgId !== $scope.defaultRBTOrganization.id) {
                promises.push(ContentManagementService.searchSubcategoriesRBT(0, 100, text, orgId));
            }
            promises.push(ContentManagementService.searchSubcategoriesRBT(0, 100, text, $scope.defaultRBTOrganization.id));

            $q.all(promises).then(function (responses) {
                _.each(responses, function (response) {
                    $scope.contentSubcategoryList = $scope.contentSubcategoryList.concat(response ? response.items : []);
                })

                $scope.contentSubcategoryList = $filter('orderBy')($scope.contentSubcategoryList, ['organizationName']);
            });*/

        }, 500);

        $scope.searchArtists = _.throttle(function (text) {
            $scope.artistList = [];

            ContentManagementService.searchArtists(0, 100, text).then(function (response) {
                $scope.artistList = $scope.artistList.concat(response ? response.items : []);
                $scope.artistList = $filter('orderBy')($scope.artistList, ['organizationName']);
            });

            /*var promises = [];

            if (sessionOrganization.id !== $scope.defaultRBTOrganization.id) {
                promises.push(ContentManagementService.searchArtists(0, 100, text, sessionOrganization.id));
            }
            promises.push(ContentManagementService.searchArtists(0, 100, text, $scope.defaultRBTOrganization.id));

            $q.all(promises).then(function (responses) {
                _.each(responses, function (response) {
                    $scope.artistList = $scope.artistList.concat(response ? response.items : []);
                })

                $scope.artistList = $filter('orderBy')($scope.artistList, ['organizationName']);
            });*/

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

        $scope.searchTones = _.throttle(function (text) {
            $scope.toneList = [];
            ContentManagementService.searchTones(0, 100, text).then(function (response) {
                $scope.toneList = $scope.toneList.concat(response ? response.items : []);
                $scope.toneList = $filter('orderBy')($scope.toneList, ['organizationName']);
            });

            /*var promises = [];

            if (sessionOrganization.id !== $scope.defaultRBTOrganization.id) {
                promises.push(ContentManagementService.searchTones(0, 100, text, sessionOrganization.id));
            }
            promises.push(ContentManagementService.searchTones(0, 100, text, $scope.defaultRBTOrganization.id));

            $q.all(promises).then(function (responses) {
                _.each(responses, function (response) {
                    $scope.toneList = $scope.toneList.concat(response ? response.items : []);
                })

                $scope.toneList = $filter('orderBy')($scope.toneList, ['organizationName']);
            });*/

        }, 500);

        $scope.searchTonesByArtist = _.throttle(function (text, artistId) {
            $scope.toneList = [];

            ContentManagementService.searchTonesByArtist(0, 100, text, artistId).then(function (response) {
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

        /*$scope.searchMoods = _.throttle(function (text) {
            $scope.moodList = [];

            var promises = [];

            if (sessionOrganization.id !== $scope.defaultRBTOrganization.id) {
                promises.push(ContentManagementService.searchMoods(0, 100, text, sessionOrganization.id));
            }
            promises.push(ContentManagementService.searchMoods(0, 100, text, $scope.defaultRBTOrganization.id));

            $q.all(promises).then(function (responses) {
                _.each(responses, function (response) {
                    $scope.moodList = $scope.moodList.concat(response ? response.items : []);
                })

                $scope.moodList = $filter('orderBy')($scope.moodList, ['organizationName']);
            });
        }, 500);

        $scope.searchAlbums = _.throttle(function (text) {
            $scope.albumList = [];

            var promises = [];

            if (sessionOrganization.id !== $scope.defaultRBTOrganization.id) {
                promises.push(ContentManagementService.searchAlbums(0, 100, text, sessionOrganization.id));
            }
            promises.push(ContentManagementService.searchAlbums(0, 100, text, $scope.defaultRBTOrganization.id));

            $q.all(promises).then(function (responses) {
                _.each(responses, function (response) {
                    $scope.albumList = $scope.albumList.concat(response ? response.items : []);
                })

                $scope.albumList = $filter('orderBy')($scope.albumList, ['organizationName']);
            });
        }, 500);*/

        // TODO: Seems irrelevant for STC, clarify if this is needed
        $scope.getPrepareRBTSettelementTypes = function () {
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
                        var providerSettlementTypeProfiles = CMPFService.getProfileAttributes($scope.sessionOrganization.profiles, CMPFService.SERVICE_PROVIDER_SETTLEMENT_TYPE_PROFILE);

                        // Filter out the settlement types
                        var allSettlementTypeIds = _.pluck(foundRBTBusinessType.SettlementTypes, "value");
                        _.each(providerSettlementTypeProfiles, function (providerSettlementTypeProfile) {
                            var foundSettlementType = _.findWhere(allSettlementTypes, {profileId: providerSettlementTypeProfile.SettlementTypeID});
                            if (allSettlementTypeIds && foundSettlementType && _.contains(allSettlementTypeIds, foundSettlementType.profileId.toString())) {
                                if (foundSettlementType.IsPartnerSpecific) {
                                    if (foundSettlementType.Partners) {
                                        var partnerIds = String(foundSettlementType.Partners).split(',');
                                        if (partnerIds.indexOf(String($scope.sessionOrganization.id)) > -1) {
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

        $scope.remove = function (contentObject) {
            getRBTProviderBusinessTypeProfile().then(function (rbtProviderBusinessTypeProfile) {
                // Send to the workflow
                $scope.removeOnWorkflow(rbtProviderBusinessTypeProfile, contentObject);
            })
        };
    });

    PartnerInfoContentManagementRBTModule.controller('PartnerInfoContentManagementRBTCtrl', function ($scope, $log, $uibModal, ContentManagementService) {
        $log.debug('PartnerInfoContentManagementRBTCtrl');

        // Albums
        $scope.viewAlbums = function (contextKey, entity, titleKey) {
            $uibModal.open({
                templateUrl: 'partner-info/content/rbt/operations.albums.modal.html',
                controller: function ($scope, $filter, $uibModalInstance, albums, NgTableParams, NgTableService) {
                    $scope.object = entity;

                    $scope.titleKey = titleKey;

                    $scope.exportOptions = {
                        columns: [
                            {
                                fieldName: 'id',
                                headerKey: 'PartnerInfo.Contents.RBT.ContentMetadatas.Albums.Id'
                            },
                            {
                                fieldName: 'name',
                                headerKey: 'PartnerInfo.Contents.RBT.ContentMetadatas.Albums.Name'
                            },
                            {
                                fieldName: 'subscriptionEnabled',
                                headerKey: 'PartnerInfo.Contents.RBT.ContentMetadatas.SubscriptionEnabled',
                                filter: {name: 'YesNoFilter'}
                            },
                            {
                                fieldName: 'promoted',
                                headerKey: 'PartnerInfo.Contents.RBT.ContentMetadatas.Promoted',
                                filter: {name: 'YesNoFilter'}
                            },
                            {
                                fieldName: 'totalSubscriptionCount',
                                headerKey: 'PartnerInfo.Contents.RBT.ContentMetadatas.Subscriptions'
                            },
                            {
                                fieldName: 'status',
                                headerKey: 'CommonLabels.State'
                            }
                        ]
                    };

                    $scope.albums = albums ? albums.items : [];

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
                            var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.albums);
                            var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.albums;
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
                },
                size: 'lg',
                resolve: {
                    albums: function (ContentManagementService, DEFAULT_REST_QUERY_LIMIT) {
                        return ContentManagementService.getAlbumsByContextRBT(contextKey, entity.id, 0, DEFAULT_REST_QUERY_LIMIT);
                    }
                }
            });
        };

        // Tones
        $scope.viewTones = function (contextKey, entity, titleKey) {
            $uibModal.open({
                templateUrl: 'partner-info/content/rbt/operations.tones.modal.html',
                controller: function ($scope, $filter, $uibModalInstance, tones, NgTableParams, NgTableService) {
                    $scope.object = entity;

                    $scope.titleKey = titleKey;

                    $scope.exportOptions = {
                        columns: [
                            {
                                fieldName: 'id',
                                headerKey: 'PartnerInfo.Contents.RBT.ContentMetadatas.Tones.Id'
                            },
                            {
                                fieldName: 'name',
                                headerKey: 'PartnerInfo.Contents.RBT.ContentMetadatas.Tones.Name'
                            },
                            {
                                fieldName: 'subscriptionEnabled',
                                headerKey: 'PartnerInfo.Contents.RBT.ContentMetadatas.SubscriptionEnabled',
                                filter: {name: 'YesNoFilter'}
                            },
                            {
                                fieldName: 'promoted',
                                headerKey: 'PartnerInfo.Contents.RBT.ContentMetadatas.Promoted',
                                filter: {name: 'YesNoFilter'}
                            },
                            {
                                fieldName: 'totalSubscriptionCount',
                                headerKey: 'PartnerInfo.Contents.RBT.ContentMetadatas.Subscriptions'
                            },
                            {
                                fieldName: 'status',
                                headerKey: 'CommonLabels.State'
                            }
                        ]
                    };

                    $scope.tones = tones ? tones.items : [];

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
                },
                size: 'lg',
                resolve: {
                    tones: function (ContentManagementService, DEFAULT_REST_QUERY_LIMIT) {
                        if (contextKey === 'artists') {
                            return ContentManagementService.searchTonesByArtist(0, DEFAULT_REST_QUERY_LIMIT, null, entity.id);
                        } else {
                            return ContentManagementService.getTonesByContextRBT(contextKey, entity.id, 0, DEFAULT_REST_QUERY_LIMIT);
                        }
                    }
                }
            });

        };
    });

})();