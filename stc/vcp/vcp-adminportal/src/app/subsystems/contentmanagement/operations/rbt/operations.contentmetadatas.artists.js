(function () {

    'use strict';

    angular.module('adminportal.subsystems.contentmanagement.operations.rbt.contentmetadatas.artists', []);

    var ContentManagementOperationsContentMetadatasRBTArtistsModule = angular.module('adminportal.subsystems.contentmanagement.operations.rbt.contentmetadatas.artists');

    ContentManagementOperationsContentMetadatasRBTArtistsModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.contentmanagement.operations.rbt.contentmetadatas.artists', {
            abstract: true,
            url: '/artists',
            template: '<div ui-view></div>',
            data: {
                exportFileName: 'ContentsArtistsRBT',
                permissions: [
                    'RBT__OPERATIONS_ARTIST_READ'
                ]
            }
        }).state('subsystems.contentmanagement.operations.rbt.contentmetadatas.artists.list', {
            url: "",
            templateUrl: "subsystems/contentmanagement/operations/rbt/operations.contentmetadatas.artists.html",
            controller: 'ContentManagementOperationsContentMetadatasRBTArtistsCtrl'
        }).state('subsystems.contentmanagement.operations.rbt.contentmetadatas.artists.new', {
            url: "/new",
            templateUrl: "subsystems/contentmanagement/operations/rbt/operations.contentmetadatas.artists.details.html",
            controller: 'ContentManagementOperationsContentMetadatasRBTArtistsNewCtrl'
        }).state('subsystems.contentmanagement.operations.rbt.contentmetadatas.artists.update', {
            url: "/update/:id",
            templateUrl: "subsystems/contentmanagement/operations/rbt/operations.contentmetadatas.artists.details.html",
            controller: 'ContentManagementOperationsContentMetadatasRBTArtistsUpdateCtrl',
            resolve: {
                artist: function ($stateParams, $q, ContentManagementService, CMPFService) {
                    var deferred = $q.defer();

                    ContentManagementService.getArtist($stateParams.id, ['TONE', 'CATEGORY', 'SUBCATEGORY']).then(function (_artist) {
                        CMPFService.getOperator(_artist.artist.organizationId, true).then(function (_organization) {
                            _artist.artist.organization = _organization;

                            deferred.resolve(_artist);
                        });
                    });

                    return deferred.promise;
                }
            }
        });

    });

    ContentManagementOperationsContentMetadatasRBTArtistsModule.controller('ContentManagementOperationsContentMetadatasRBTArtistsCommonCtrl', function ($scope, $log, $q, $state, $uibModal, $controller, $filter, $translate, AuthorizationService, UtilService, SessionService, ContentManagementService, CMPFService,
                                                                                                                                                        CMS_RBT_STATUS_TYPES, CMS_GENDERS, CMS_ACCESS_CHANNELS, DURATION_UNITS, CMS_RBT_REV_SHARE_POLICIES_ALL, DEFAULT_REST_QUERY_LIMIT,
                                                                                                                                                        CMS_RBT_REV_SHARE_CARRIER_DEDUCTION, CMS_RBT_REV_SHARE_SPLIT_ACROSS_TONES_ALL) {
        $log.debug('ContentManagementOperationsContentMetadatasRBTArtistsCommonCtrl');

        $controller('GenericDateTimeCtrl', {$scope: $scope});
        $controller('ContentManagementOperationsRBTCommonCtrl', {$scope: $scope});
        $controller('AllowedCategoriesCommonCtrl', {$scope: $scope});

        $scope.sessionOrganization = SessionService.getSessionOrganization();
        $scope.username = SessionService.getUsername();

        $scope.CMS_RBT_STATUS_TYPES = CMS_RBT_STATUS_TYPES;
        $scope.CMS_GENDERS = CMS_GENDERS;
        $scope.CMS_ACCESS_CHANNELS = CMS_ACCESS_CHANNELS;
        $scope.DISPLAY_ACCESS_CHANNELS = _.flatten(_.map(CMS_ACCESS_CHANNELS, 'value'));
        $scope.DURATION_UNITS = DURATION_UNITS;
        $scope.CMS_RBT_REV_SHARE_POLICIES = CMS_RBT_REV_SHARE_POLICIES_ALL;
        $scope.CMS_RBT_REV_SHARE_CARRIER_DEDUCTION = CMS_RBT_REV_SHARE_CARRIER_DEDUCTION;
        $scope.CMS_RBT_REV_SHARE_SPLIT_ACROSS_TONES = CMS_RBT_REV_SHARE_SPLIT_ACROSS_TONES_ALL;

        $scope.openOrganizations = function (artist) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.organizations.html',
                controller: 'OrganizationsModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    organizationParameter: function () {
                        return angular.copy(artist.organization);
                    },
                    itemName: function () {
                        return artist.name;
                    },
                    allOrganizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllOrganizationsCustom(false, true, [CMPFService.OPERATOR_PROFILE, CMPFService.SERVICE_PROVIDER_BUSINESS_TYPE_PROFILE, CMPFService.SERVICE_PROVIDER_SETTLEMENT_TYPE_PROFILE]);
                    },
                    organizationsModalTitleKey: function () {
                        return 'Subsystems.ContentManagement.Operations.RBT.ContentMetadatas.Artists.OrganizationsModalTitle';
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                artist.organization = selectedItem.organization;
                artist.organizationId = selectedItem.organization.id;
                artist.defaultToneId = null;
            }, function () {
            });
        };

        $scope.toneList = [];
        $scope.toneIdsList = [];


        $scope.$on('toneIdsUpdated', function (event, toneIdList) {
            // Update contentMetadata.toneIds and trigger the watcher
            $scope.contentMetadata.toneIds = toneIdList;

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
            title += ' [Artist = ' + ($scope.contentMetadata.name ? $scope.contentMetadata.name : 'New Artist ')+']';

            var config = {
                titleKey: title,
                dateFilter: {
                    status: 'ACTIVE'
                },
                enableToneOrdering: $scope.enableToneOrdering,
                accessType: $scope.accessType,
                isAuthorized: $scope.contentMetadata.id ? AuthorizationService.canRBTOperationsArtistUpdate($scope.contentMetadata.status) : AuthorizationService.canRBTOperationsArtistCreate()
            };
            $scope.openToneSelectionModal($scope.contentMetadata.tones, setToneSelection, config)
        };

        $scope.removeSelectedOrganization = function () {
            $scope.contentMetadata.organization = null;
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
            $state.go('subsystems.contentmanagement.operations.rbt.contentmetadatas.artists.list');
        };
    });

    ContentManagementOperationsContentMetadatasRBTArtistsModule.controller('ContentManagementOperationsContentMetadatasRBTArtistsCtrl', function ($rootScope, $scope, $log, $controller, $state, $timeout, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                                                  Restangular, CMPFService, DateTimeConstants, ContentManagementService, WorkflowsService, SessionService, DEFAULT_REST_QUERY_LIMIT) {
        $log.debug('ContentManagementOperationsContentMetadatasRBTArtistsCtrl');

        $scope.sessionOrganization = SessionService.getSessionOrganization();
        $scope.username = SessionService.getUsername();

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'id',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.ContentMetadatas.Artists.Id'
                },
                {
                    fieldName: 'name',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.ContentMetadatas.Artists.Name'
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

        // Artist list
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

                // WAITING status removed, no BPMS Workflows for Artists
                ContentManagementService.getArtists(filter.page, filter.limit, filter.sortFieldName, filter.sortOrder, filter.statuses, filter.filterText).then(function (response) {
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
        // END - Artist list

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
                controller: function ($scope, $controller, $uibModalInstance, allOrganizations, tones, taskDetail) {
                    $controller('WorkflowsOperationsTasksDetailRBTArtistCtrl', {
                        $scope: $scope,
                        allOrganizations: allOrganizations,
                        tones: tones,
                        taskDetail: taskDetail
                    });

                    $scope.isModal = true;
                    $scope.modalTitle = contentMetadata.taskName;
                    $scope.templateUrl = 'workflows/operations/operations.tasks.rbtartists.detail.html';

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
                            artistTask: {
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

                var artistItem = {
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
                    "launchDate": contentMetadata.launchDate,
                    "expireDate": contentMetadata.expireDate,
                    "gender": contentMetadata.gender,
                    "subscriptionEnabled": contentMetadata.subscriptionEnabled,
                    "promoted": contentMetadata.promoted,
                    "defaultToneId": contentMetadata.defaultToneId,
                    "names": contentMetadata.names,
                    "descriptions": contentMetadata.descriptions,
                    "tags": contentMetadata.tags,
                    "accessChannels": contentMetadata.accessChannels,
                    "userUpdated": $scope.username
                };

                $log.debug('Removing artist: ', artistItem);

                // Artist delete method of the flow service.
                ContentManagementService.deleteArtist(artistItem).then(function (response) {
                    if (response && response.code === 2003) {
                        $log.debug('Removed artist: ', artistItem, ', response: ', response);

                        notification.flash({
                            type: 'success',
                            text: $translate.instant('Subsystems.ContentManagement.Operations.RBT.ContentMetadatas.Artists.Messages.DeleteFlowStartedSuccessful' + ($rootScope.isAdminUser ? 'ForAdmin' : ''))
                        });

                        $state.transitionTo($state.current, {}, {reload: true, inherit: true, notify: true});
                    } else {
                        WorkflowsService.showApiError(response);
                    }
                }, function (response) {
                    $log.error('Cannot call the artist delete flow service. Error: ', response);

                    if (response && response.data && response.data.message) {
                        WorkflowsService.showApiError(response);
                    } else {
                        var message = $translate.instant('Subsystems.ContentManagement.Operations.RBT.ContentMetadatas.Artists.Messages.DeleteFlowError')
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

    ContentManagementOperationsContentMetadatasRBTArtistsModule.controller('ContentManagementOperationsContentMetadatasRBTArtistsNewCtrl', function ($rootScope, $scope, $log, $state, $controller, $q, $filter, $translate, notification, UtilService, ContentManagementService,
                                                                                                                                                     CMPFService, WorkflowsService, SessionService, DateTimeConstants) {
        $log.debug('ContentManagementOperationsContentMetadatasRBTArtistsNewCtrl');

        $controller('ContentManagementOperationsContentMetadatasRBTArtistsCommonCtrl', { $scope: $scope });

        $scope.dateHolder.startDate = moment().startOf('day').toDate();
        $scope.dateHolder.endDate = moment().endOf('day').add(10, 'years').toDate();

        $scope.contentMetadata = {
            status: 'ACTIVE',
            subscriptionEnabled: true,
            promoted: false,
            tags: [],
            accessChannels: ["IVR", "USSD", "SMS", "SMS_HU", "IVR_FK", "CC", "AdminPortal", "RBTPortal", "RBTMobileApp", "MySTC", "CPWhiteBrandedPortal", "CorporatePortal", "BackOfficeBulkOps", "RBTBackend", "RBTDecisionEngine"],
            categoryIds: [],
            subcategoryIds: [],
            toneIds: [],
            chargingDetails: {
                chargingPeriod: {
                    duration: 30,
                    unit: $scope.DURATION_UNITS[0].key
                },
                price: 0,
                subscriptionCode: null,
                revShare: {
                    type: 'EQUAL'
                },
                revSharePolicy: null
            }
        };
        $scope.originalContentMetadata = angular.copy($scope.contentMetadata);

        $scope.sendToWorkflow = function (contentMetadata) {
            var artistItem = {
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
                "accessChannels": contentMetadata.accessChannels,
                "cardImageId": "",
                "cardImageUrl": "",
                "thumbnailId": "",
                "thumbnailUrl": "",
                "coverImageId": "",
                "coverImageUrl": "",
                "gender": contentMetadata.gender,
                "defaultToneId": contentMetadata.defaultToneId,
                "dtoneId": contentMetadata.defaultToneId,
                "userCreated": $scope.username,
                "dateCreated": $filter('date')(Date.now(), 'yyyy-MM-dd') + 'T00:00:00',
                "categoryIds": contentMetadata.categoryIds,
                "subcategoryIds": contentMetadata.subcategoryIds,
                "toneIds": contentMetadata.toneIds,
                "contentType": "ARTIST",
                "dateUpdated": "",
                "descriptionList": [],
                "featuredDescriptionList": [],
                "featuredDescriptions": [],
                "featuredTitleList": [],
                "featuredTitles": [],
                "id": null,
                "legacyId": "",
                "nameList": [],
                "numberOfTones": 0,
                "offers": [],
                "totalSubscriptionCount": 0
            };

            // names
            artistItem.names.push({ lang: 'en', name: contentMetadata.nameEn });
            artistItem.names.push({ lang: 'ar', name: contentMetadata.nameAr });

            // descriptions
            artistItem.descriptions.push({ lang: 'en', description: contentMetadata.descriptionEn });
            artistItem.descriptions.push({ lang: 'ar', description: contentMetadata.descriptionAr });

            // featuredTitles & featuredDescriptions (only if promoted)
            if (contentMetadata.promoted) {
                artistItem.featuredTitles.push({ lang: 'en', name: contentMetadata.featuredTitleEn });
                artistItem.featuredTitles.push({ lang: 'ar', name: contentMetadata.featuredTitleAr });
                artistItem.featuredDescriptions.push({ lang: 'en', description: contentMetadata.featuredDescriptionEn });
                artistItem.featuredDescriptions.push({ lang: 'ar', description: contentMetadata.featuredDescriptionAr });
            }

            // Charging Details
            if (contentMetadata.chargingDetails) {
                var offer = {
                    "chargingPeriodDetail": UtilService.convertSimpleObjectToPeriod(contentMetadata.chargingDetails.chargingPeriod),
                    "chargingPeriod": contentMetadata.chargingDetails.chargingPeriod.duration,
                    "price": contentMetadata.chargingDetails.price,
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

                artistItem.offers = [
                    offer
                ];
            }

            // Image files handling
            var cardImage = contentMetadata.cardImage;
            var coverImage = contentMetadata.coverImage;
            // Generate IDs upfront for any images that will be uploaded
            if (cardImage && cardImage.name) {
                artistItem.cardImageId = UtilService.generateObjectId();
            }
            if (coverImage && coverImage.name) {
                artistItem.coverImageId = UtilService.generateObjectId();
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
                    .uploadFile(cardImage, cardImage.name, artistItem.cardImageId)
                    .then(function () {
                        preUploaded.card = true;
                    });
            }

            $log.debug('Preparing to create artist (with pre-uploaded card if any): ', artistItem);

            // Promise Chain
            // pre-upload, then create metadata, then post-upload, then notify success
            preUploadPromise
                .then(function () {
                    // Create metadata after card upload
                    $log.debug("Creating artist metadata", artistItem);
                    return ContentManagementService.createArtist(artistItem);
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
                        postUploads.push(ContentManagementService.uploadFile(coverImage, coverImage.name, artistItem.coverImageId));
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
                    if (preUploaded.card && artistItem.cardImageId) {
                        cleanup.push(bestEffortDelete(artistItem.cardImageId));
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

    ContentManagementOperationsContentMetadatasRBTArtistsModule.controller('ContentManagementOperationsContentMetadatasRBTArtistsUpdateCtrl', function ($rootScope, $scope, $state, $log, $controller, $q, $filter, $translate, notification, UtilService, Restangular,
                                                                                                                                                        CMPFService, WorkflowsService, ContentManagementService, FileDownloadService, SessionService, DateTimeConstants,
                                                                                                                                                        artist) {
        $log.debug('ContentManagementOperationsContentMetadatasRBTArtistsUpdateCtrl');

        $controller('ContentManagementOperationsContentMetadatasRBTArtistsCommonCtrl', {
            $scope: $scope
        });

        $scope.contentMetadata = artist.artist;

        // // Set the default tone if it is not found.
        // if ($scope.contentMetadata.defaultToneId && !artist.defaultTone) {
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
                subscriptionCode: null, //chargingDetails.subscriptionCode,
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

            var artistItem = {
                // Unchanged / server-controlled fields
                "id": original.id,
                "legacyId": original.legacyId,
                "coverImageId": original.coverImageId,
                "cardImageId": original.cardImageId,
                "thumbnailId": original.thumbnailId,
                "contentType": original.contentType,
                "userCreated": original.userCreated,
                "dateCreated": original.dateCreated,
                "offers": original.offers, //"offers": $scope.contentMetadata.offers,
                "totalSubscriptionCount": original.totalSubscriptionCount,
                "nameList": original.nameList,
                "numberOfTones": original.numberOfTones,
                "descriptionList": original.descriptionList,
                // Changed values
                "name": contentMetadata.name,
                "organizationId": contentMetadata.organization.id,
                "organizationName": contentMetadata.organization.name,
                "status": contentMetadata.status,
                "launchDate": ($scope.dateHolder.startDate ? $filter('date')($scope.dateHolder.startDate, 'yyyy-MM-dd') + 'T00:00:00' : ''),
                "expireDate": ($scope.dateHolder.endDate ? $filter('date')($scope.dateHolder.endDate, 'yyyy-MM-dd') + 'T00:00:00' : ''),
                "gender": contentMetadata.gender,
                "subscriptionEnabled": contentMetadata.subscriptionEnabled,
                "promoted": contentMetadata.promoted,
                "defaultToneId": contentMetadata.defaultToneId,
                "dtoneId": contentMetadata.defaultToneId,
                "toneIds": contentMetadata.toneIds,
                "names": [],
                "descriptions": [],
                "tags": contentMetadata.tags,
                "accessChannels": contentMetadata.accessChannels,
                "userUpdated": $scope.username,
                "categoryIds": contentMetadata.categoryIds,
                "subcategoryIds": contentMetadata.subcategoryIds,
                "dateUpdated": $filter('date')(Date.now(), 'yyyy-MM-dd') + 'T00:00:00',
                "featuredDescriptionList": [],
                "featuredDescriptions": [],
                "featuredTitleList": [],
                "featuredTitles": [],
            };

            // names
            artistItem.names.push({ lang: 'en', name: contentMetadata.nameEn });
            artistItem.names.push({ lang: 'ar', name: contentMetadata.nameAr });

            // descriptions
            artistItem.descriptions.push({ lang: 'en', description: contentMetadata.descriptionEn });
            artistItem.descriptions.push({ lang: 'ar', description: contentMetadata.descriptionAr });

            // featuredTitles & featuredDescriptions (only if promoted)
            if (contentMetadata.promoted) {
                artistItem.featuredTitles.push({ lang: 'en', name: contentMetadata.featuredTitleEn });
                artistItem.featuredTitles.push({ lang: 'ar', name: contentMetadata.featuredTitleAr });
                artistItem.featuredDescriptions.push({ lang: 'en', description: contentMetadata.featuredDescriptionEn });
                artistItem.featuredDescriptions.push({ lang: 'ar', description: contentMetadata.featuredDescriptionAr });
            } else {
                artistItem.featuredTitles = [];
                artistItem.featuredDescriptions = [];
            }


            // Charging Details
            if (contentMetadata.chargingDetails) {
                var offer = {
                    "chargingPeriodDetail": UtilService.convertSimpleObjectToPeriod(contentMetadata.chargingDetails.chargingPeriod),
                    "chargingPeriod": contentMetadata.chargingDetails.chargingPeriod.duration,
                    "price": contentMetadata.chargingDetails.price,
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

                artistItem.offers = [
                    offer
                ];
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
                artistItem.cardImageId = "";
                filesToDeleteAfterSuccess.push(originalCardId);
            } else if (cardReplaced) {
                newCardId = UtilService.generateObjectId();
                artistItem.cardImageId = newCardId;

                if (originalCardId) {
                    filesToDeleteAfterSuccess.push(originalCardId);
                }
            } else {
                artistItem.cardImageId = originalCardId;
            }

            // Cover Image
            var coverRemoved  = (!coverImage || !coverImage.name) && !!originalCoverId;
            var coverReplaced = (coverImage && coverImage.name && (coverImage instanceof File));

            if (coverRemoved) {
                artistItem.coverImageId = "";
                filesToDeleteAfterSuccess.push(originalCoverId);
            } else if (coverReplaced) {
                // Reuse existing ID if present, otherwise assign new id.
                artistItem.coverImageId = originalCoverId || UtilService.generateObjectId();

                postUploadTasks.push(function () {
                    return ContentManagementService.uploadFile(
                        coverImage,
                        coverImage.name,
                        artistItem.coverImageId
                    );
                });
            } else {
                artistItem.coverImageId = originalCoverId;
            }

            $log.debug('Updating artist (with resolved image IDs): ', artistItem);

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
                    return ContentManagementService.updateArtist(artistItem);
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
