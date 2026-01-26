(function () {

    'use strict';

    angular.module('partnerportal.partner-info.operations.rbt.contentmetadatas.albums', []);

    var PartnerInfoContentManagementContentMetadatasRBTAlbumsModule = angular.module('partnerportal.partner-info.operations.rbt.contentmetadatas.albums');

    PartnerInfoContentManagementContentMetadatasRBTAlbumsModule.config(function ($stateProvider) {

        $stateProvider.state('partner-info.operations.rbt.contentmetadatas.albums', {
            abstract: true,
            url: '/albums',
            template: '<div ui-view></div>',
            data: {
                exportFileName: 'ContentAlbumsRBT',
                permissions: [
                    'RBT__ALBUM_READ'
                ]
            }
        }).state('partner-info.operations.rbt.contentmetadatas.albums.list', {
            url: "",
            templateUrl: "partner-info/content/rbt/operations.contentmetadatas.albums.html",
            controller: 'PartnerInfoContentManagementContentMetadatasRBTAlbumsCtrl'
        });

        // Create
        $stateProvider.state('partner-info.operations.rbt.contentmetadatas.albums.new', {
            url: "/new",
            templateUrl: "partner-info/content/rbt/operations.contentmetadatas.albums.details.html",
            controller: 'PartnerInfoContentManagementContentMetadatasRBTAlbumsNewCtrl',
            resolve: {
                album: function () {
                    return null;
                }
            }
        }).state('partner-info.operations.rbt.contentmetadatas.albums.resendcreatetask', {
            url: "/resend-create/:id",
            templateUrl: "partner-info/content/rbt/operations.contentmetadatas.albums.details.html",
            controller: 'PartnerInfoContentManagementContentMetadatasRBTAlbumsNewCtrl',
            data: {
                cancelState: {url: "workflows.operations.tasks", params: {taskStatus: 'rejected'}}
            },
            resolve: {
                album: function ($stateParams, $q, WorkflowsService) {
                    var deferred = $q.defer();

                    WorkflowsService.getAlbumRBT($stateParams.id).then(function (albumResponse) {
                        deferred.resolve({
                            album: albumResponse.objectDetail
                        });
                    }, function (errorResponse) {
                        deferred.reject(errorResponse);
                    });

                    return deferred.promise;
                }
            }
        });

        // Update
        $stateProvider.state('partner-info.operations.rbt.contentmetadatas.albums.update', {
            url: "/update/:id",
            templateUrl: "partner-info/content/rbt/operations.contentmetadatas.albums.details.html",
            controller: 'PartnerInfoContentManagementContentMetadatasRBTAlbumsUpdateCtrl',
            resolve: {
                album: function ($stateParams, ContentManagementService) {
                    return ContentManagementService.getAlbum($stateParams.id);
                }
            }
        }).state('partner-info.operations.rbt.contentmetadatas.albums.resendupdatetask', {
            url: "/resend-update/:id",
            templateUrl: "partner-info/content/rbt/operations.contentmetadatas.albums.details.html",
            controller: 'PartnerInfoContentManagementContentMetadatasRBTAlbumsUpdateCtrl',
            data: {
                cancelState: {url: "workflows.operations.tasks", params: {taskStatus: 'rejected'}}
            },
            resolve: {
                album: function ($stateParams, $q, WorkflowsService) {
                    var deferred = $q.defer();

                    WorkflowsService.getAlbumRBT($stateParams.id).then(function (albumResponse) {
                        deferred.resolve({
                            album: albumResponse.objectDetail
                        });
                    }, function (errorResponse) {
                        deferred.reject(errorResponse);
                    });

                    return deferred.promise;
                }
            }
        });

    });

    PartnerInfoContentManagementContentMetadatasRBTAlbumsModule.controller('PartnerInfoContentManagementContentMetadatasRBTAlbumsCommonCtrl', function ($scope, $log, $q, $state, $controller, $filter, UtilService, SessionService, ContentManagementService, CMPFService,
                                                                                                                                                        CMS_RBT_STATUS_TYPES, CMS_ACCESS_CHANNELS, DURATION_UNITS, CMS_RBT_REV_SHARE_POLICIES_ALL, DEFAULT_REST_QUERY_LIMIT,
                                                                                                                                                        CMS_RBT_REV_SHARE_CARRIER_DEDUCTION, CMS_RBT_REV_SHARE_SPLIT_ACROSS_TONES_ALBUM) {
        $log.debug('PartnerInfoContentManagementContentMetadatasRBTAlbumsCommonCtrl');

        $controller('GenericDateTimeCtrl', {$scope: $scope});
        $controller('PartnerInfoContentManagementRBTCommonCtrl', {$scope: $scope});

        $scope.sessionOrganization = SessionService.getSessionOrganization();
        $scope.username = SessionService.getUsername();

        $scope.CMS_RBT_STATUS_TYPES = CMS_RBT_STATUS_TYPES;
        $scope.CMS_ACCESS_CHANNELS = CMS_ACCESS_CHANNELS;
        $scope.DURATION_UNITS = DURATION_UNITS;
        $scope.CMS_RBT_REV_SHARE_POLICIES = CMS_RBT_REV_SHARE_POLICIES_ALL;
        $scope.CMS_RBT_REV_SHARE_CARRIER_DEDUCTION = CMS_RBT_REV_SHARE_CARRIER_DEDUCTION;
        $scope.CMS_RBT_REV_SHARE_SPLIT_ACROSS_TONES = CMS_RBT_REV_SHARE_SPLIT_ACROSS_TONES_ALBUM;

        $scope.contentCategoryList = [];
        $scope.moodList = [];
        $scope.toneList = [];

        $scope.cancel = function () {
            $state.go('partner-info.operations.rbt.contentmetadatas.albums.list');
        };
    });

    PartnerInfoContentManagementContentMetadatasRBTAlbumsModule.controller('PartnerInfoContentManagementContentMetadatasRBTAlbumsCtrl', function ($rootScope, $scope, $log, $controller, $state, $timeout, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                                                  Restangular, CMPFService, DateTimeConstants, ContentManagementService, WorkflowsService, SessionService, DEFAULT_REST_QUERY_LIMIT) {
        $log.debug('PartnerInfoContentManagementContentMetadatasRBTAlbumsCtrl');

        $controller('PartnerInfoContentManagementRBTCommonCtrl', {$scope: $scope});

        $scope.sessionOrganization = SessionService.getSessionOrganization();
        $scope.username = SessionService.getUsername();

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
                orgId: $scope.sessionOrganization.id,
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

        // Album list
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

                if (params.settings().$scope.status !== 'WAITING') {
                    ContentManagementService.getAlbumsByOrganizationId(filter.page, filter.limit, filter.sortFieldName, filter.sortOrder, filter.statuses, filter.filterText, filter.orgId).then(function (response) {
                        $log.debug("Found records: ", response);

                        $scope.contentMetadataList.list = (response ? response.items : []);

                        params.total(response ? response.totalCount : 0);
                        $defer.resolve($scope.contentMetadataList.list);
                    }, function (error) {
                        $log.debug('Error: ', error);
                        params.total(0);
                        $defer.resolve([]);
                    });
                } else {
                    $scope.contentMetadataList.list = [];
                    WorkflowsService.searchPendingTasks(0, DEFAULT_REST_QUERY_LIMIT, 'RBT_ALBUM').then(function (waitingAlbumTask) {
                        if (waitingAlbumTask && waitingAlbumTask.detail && waitingAlbumTask.detail.total > 0) {
                            _.each(waitingAlbumTask.detail.items, function (albumTask) {
                                if (albumTask && albumTask.name && (albumTask.name.toLowerCase() === 'rbt album create task')) {
                                    albumTask.objectDetail.taskObjectId = albumTask.rbtContentId;
                                    albumTask.objectDetail.state = 'WAITING FOR APPROVAL';
                                    albumTask.objectDetail.taskName = albumTask.name;

                                    $scope.contentMetadataList.list.push(albumTask.objectDetail);
                                }
                            });
                        }

                        params.total($scope.contentMetadataList.list.length);
                        $defer.resolve($scope.contentMetadataList.list);
                    }, function (error) {
                        $log.debug('Error: ', error);
                        params.total(0);
                        $defer.resolve([]);
                    });
                }
            }
        });
        // END - Album list

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
                controller: function ($scope, $controller, $uibModalInstance, moods, contentCategories, tones, taskDetail) {
                    $controller('WorkflowsOperationsTasksDetailRBTAlbumCtrl', {
                        $scope: $scope,
                        moods: moods,
                        contentCategories: contentCategories,
                        tones: tones,
                        taskDetail: taskDetail
                    });

                    $scope.isModal = true;
                    $scope.modalTitle = contentMetadata.taskName;
                    $scope.templateUrl = 'workflows/operations/operations.tasks.rbtalbums.detail.html';

                    $scope.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'lg',
                resolve: {
                    moods: function ($rootScope, ContentManagementService, DEFAULT_REST_QUERY_LIMIT) {
                        var organizationId = $rootScope.getOrganizationId();

                        return ContentManagementService.getMoodsByOrganizationId(0, DEFAULT_REST_QUERY_LIMIT, organizationId);
                    },
                    contentCategories: function ($rootScope, DEFAULT_REST_QUERY_LIMIT, ContentManagementService) {
                        var organizationId = $rootScope.getOrganizationId();

                        return ContentManagementService.getContentCategoriesRBTByOrganizationId(0, DEFAULT_REST_QUERY_LIMIT, organizationId);
                    },
                    tones: function ($rootScope, ContentManagementService, DEFAULT_REST_QUERY_LIMIT) {
                        var organizationId = $rootScope.getOrganizationId();

                        return ContentManagementService.getTonesByOrganizationId(0, DEFAULT_REST_QUERY_LIMIT, organizationId);
                    },
                    taskDetail: function () {
                        return {
                            albumTask: {
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

        $scope.removeOnWorkflow = function (rbtProviderBusinessTypeProfile, contentMetadata) {
            contentMetadata.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                contentMetadata.rowSelected = false;

                var albumItem = {
                    "from": {
                        "isAdmin": (rbtProviderBusinessTypeProfile.TrustedStatus === 'TRUSTED'),
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

                $log.debug('Removing album: ', albumItem);

                // Album delete method of the flow service.
                WorkflowsService.deleteAlbumRBT(albumItem).then(function (response) {
                    if (response && response.code === 2001) {
                        $log.debug('Removed album: ', albumItem, ', response: ', response);

                        notification.flash({
                            type: 'success',
                            text: $translate.instant('PartnerInfo.Contents.RBT.ContentMetadatas.Albums.Messages.DeleteFlowStartedSuccessful' + ((rbtProviderBusinessTypeProfile.TrustedStatus === 'TRUSTED') ? 'ForAdmin' : ''))
                        });

                        $state.transitionTo($state.current, {}, {reload: true, inherit: true, notify: true});
                    } else {
                        WorkflowsService.showApiError(response);
                    }
                }, function (response) {
                    $log.error('Cannot call the album delete flow service. Error: ', response);

                    if (response && response.data && response.data.message) {
                        WorkflowsService.showApiError(response);
                    } else {
                        notification({
                            type: 'warning',
                            text: $translate.instant('PartnerInfo.Contents.RBT.ContentMetadatas.Albums.Messages.DeleteFlowError')
                        });
                    }
                });
            }, function () {
                contentMetadata.rowSelected = false;
            });
        };
    });

    PartnerInfoContentManagementContentMetadatasRBTAlbumsModule.controller('PartnerInfoContentManagementContentMetadatasRBTAlbumsNewCtrl', function ($rootScope, $scope, $log, $state, $controller, $q, $filter, $translate, notification, UtilService, ContentManagementService,
                                                                                                                                                     CMPFService, WorkflowsService, SessionService, DateTimeConstants, album) {
        $log.debug('PartnerInfoContentManagementContentMetadatasRBTAlbumsNewCtrl');

        $controller('PartnerInfoContentManagementContentMetadatasRBTAlbumsCommonCtrl', {
            $scope: $scope
        });

        $scope.dateHolder.startDate = null;
        $scope.dateHolder.endDate = null;

        $scope.contentMetadata = {
            status: 'ACTIVE',
            subscriptionEnabled: true,
            promoted: false,
            tags: [],
            categoryIds: [],
            moodIds: [],
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

        // If coming here from the create task page for resending the form with little updates for create again.
        if (album) {
            $controller('PartnerInfoContentManagementContentMetadatasRBTMoodsUpdateCtrl', {
                $scope: $scope,
                album: album
            });
        }

        $scope.sendToWorkflow = function (rbtProviderBusinessTypeProfile, contentMetadata) {
            var albumItem = {
                "from": {
                    "isAdmin": (rbtProviderBusinessTypeProfile.TrustedStatus === 'TRUSTED'),
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
                "organizationId": $scope.sessionOrganization.id,
                "organizationName": $scope.sessionOrganization.name,
                // Changed values
                "name": contentMetadata.name,
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
                "coverImageId": null,
                "cardImageId": null,
                "thumbnailId": null,
                "defaultToneId": contentMetadata.defaultToneId,
                "userCreated": $scope.username
            };

            // names
            albumItem.names.push({
                'lang': 'en',
                'name': contentMetadata.nameEn
            });
            albumItem.names.push({
                'lang': 'ar',
                'name': contentMetadata.nameAr
            });

            // descriptions
            albumItem.descriptions.push({
                'lang': 'en',
                'description': contentMetadata.descriptionEn
            });
            albumItem.descriptions.push({
                'lang': 'ar',
                'description': contentMetadata.descriptionAr
            });

            var coverImage, cardImage, thumbnail;
            // coverImageId
            if (contentMetadata.coverImage && contentMetadata.coverImage.name) {
                albumItem.coverImageId = UtilService.generateObjectId();
                coverImage = contentMetadata.coverImage;
            }
            // cardImageId
            if (contentMetadata.cardImage && contentMetadata.cardImage.name) {
                albumItem.cardImageId = UtilService.generateObjectId();
                cardImage = contentMetadata.cardImage;
            }
            // thumbnailId
            if (contentMetadata.thumbnail && contentMetadata.thumbnail.name) {
                albumItem.thumbnailId = UtilService.generateObjectId();
                thumbnail = contentMetadata.thumbnail;
            }

            // Charging Details
            if (contentMetadata.chargingDetails) {
                var offer = {
                    "chargingPeriodDetail": UtilService.convertSimpleObjectToPeriod(contentMetadata.chargingDetails.chargingPeriod),
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

                albumItem.offers = [
                    offer
                ];
            }

            $log.debug('Creating album: ', albumItem);

            // Album create method of the flow service.
            WorkflowsService.createAlbumRBT(albumItem).then(function (response) {
                if (response && response.code === 2001) {
                    $log.debug('Save Success. Response: ', response);

                    var promises = [];

                    if (coverImage && coverImage.name) {
                        promises.push(ContentManagementService.uploadFile(coverImage, coverImage.name, albumItem.coverImageId));
                    }

                    if (cardImage && cardImage.name) {
                        promises.push(ContentManagementService.uploadFile(cardImage, cardImage.name, albumItem.cardImageId));
                    }

                    if (thumbnail && thumbnail.name) {
                        promises.push(ContentManagementService.uploadFile(thumbnail, thumbnail.name, albumItem.thumbnailId));
                    }

                    $q.all(promises).then(function () {
                        notification.flash({
                            type: 'success',
                            text: $translate.instant('PartnerInfo.Contents.RBT.ContentMetadatas.Albums.Messages.CreateFlowStartedSuccessful' + ((rbtProviderBusinessTypeProfile.TrustedStatus === 'TRUSTED') ? 'ForAdmin' : ''))
                        });

                        $scope.cancel();
                    });
                } else {
                    WorkflowsService.showApiError(response);
                }
            }, function (response) {
                $log.error('Cannot call the album create flow service. Error: ', response);

                if (response && response.data && response.data.message) {
                    WorkflowsService.showApiError(response);
                } else {
                    notification({
                        type: 'warning',
                        text: $translate.instant('PartnerInfo.Contents.RBT.ContentMetadatas.Albums.Messages.CreateFlowError')
                    });
                }
            });
        };
    });

    PartnerInfoContentManagementContentMetadatasRBTAlbumsModule.controller('PartnerInfoContentManagementContentMetadatasRBTAlbumsUpdateCtrl', function ($scope, $state, $log, $controller, $q, $filter, $translate, notification, UtilService, CMPFService,
                                                                                                                                                        ContentManagementService, WorkflowsService, FileDownloadService, SessionService, DateTimeConstants,
                                                                                                                                                        album) {
        $log.debug('PartnerInfoContentManagementContentMetadatasRBTAlbumsUpdateCtrl');

        $controller('PartnerInfoContentManagementContentMetadatasRBTAlbumsCommonCtrl', {
            $scope: $scope
        });

        $scope.contentMetadata = album.album;
        $scope.contentMetadata.organization = $scope.sessionOrganization;

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

        if (!$scope.contentMetadata.tags) {
            $scope.contentMetadata.tags = [];
        }
        if (!$scope.contentMetadata.categoryIds) {
            $scope.contentMetadata.categoryIds = [];
        }
        if (!$scope.contentMetadata.moodIds) {
            $scope.contentMetadata.moodIds = [];
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

        $scope.sendToWorkflow = function (rbtProviderBusinessTypeProfile, contentMetadata) {
            var albumItem = {
                "from": {
                    "isAdmin": (rbtProviderBusinessTypeProfile.TrustedStatus === 'TRUSTED'),
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
                "id": $scope.originalContentMetadata.id,
                "legacyId": $scope.originalContentMetadata.legacyId,
                "organizationId": $scope.originalContentMetadata.organizationId,
                "organizationName": $scope.originalContentMetadata.organizationName,
                "coverImageId": $scope.originalContentMetadata.coverImageId,
                "cardImageId": $scope.originalContentMetadata.cardImageId,
                "thumbnailId": $scope.originalContentMetadata.thumbnailId,
                "contentType": $scope.originalContentMetadata.contentType,
                "userCreated": $scope.originalContentMetadata.userCreated,
                "dateCreated": $scope.originalContentMetadata.dateCreated,
                "offers": $scope.originalContentMetadata.offers,
                "totalSubscriptionCount": $scope.originalContentMetadata.totalSubscriptionCount,
                "status": $scope.originalContentMetadata.status,
                // Changed values
                "name": contentMetadata.name,
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
                "userUpdated": $scope.username
            };

            // names
            albumItem.names.push({
                'lang': 'en',
                'name': contentMetadata.nameEn
            });
            albumItem.names.push({
                'lang': 'ar',
                'name': contentMetadata.nameAr
            });

            // descriptions
            albumItem.descriptions.push({
                'lang': 'en',
                'description': contentMetadata.descriptionEn
            });
            albumItem.descriptions.push({
                'lang': 'ar',
                'description': contentMetadata.descriptionAr
            });

            var coverImage, cardImage, thumbnail;
            // coverImageId
            coverImage = contentMetadata.coverImage;
            if (!coverImage || (coverImage && !coverImage.name)) {
                albumItem.coverImageId = null;
            } else if (coverImage instanceof File && !albumItem.coverImageId) {
                albumItem.coverImageId = UtilService.generateObjectId();
            }
            // cardImageId
            cardImage = contentMetadata.cardImage;
            if (!cardImage || (cardImage && !cardImage.name)) {
                albumItem.cardImageId = null;
            } else if (cardImage instanceof File && !albumItem.cardImageId) {
                albumItem.cardImageId = UtilService.generateObjectId();
            }
            // thumbnailId
            thumbnail = contentMetadata.thumbnail;
            if (!thumbnail || (thumbnail && !thumbnail.name)) {
                albumItem.thumbnailId = null;
            } else if (thumbnail instanceof File && !albumItem.thumbnailId) {
                albumItem.thumbnailId = UtilService.generateObjectId();
            }

            // Charging Details
            if (contentMetadata.chargingDetails) {
                var offer = {
                    "chargingPeriodDetail": UtilService.convertSimpleObjectToPeriod(contentMetadata.chargingDetails.chargingPeriod),
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

                albumItem.offers = [
                    offer
                ];
            }

            $log.debug('Updating album: ', albumItem);

            // Album create method of the flow service.
            WorkflowsService.updateAlbumRBT(albumItem).then(function (response) {
                if (response && response.code === 2001) {
                    $log.debug('Save Success. Response: ', response);

                    var promises = [];

                    if (coverImage && coverImage.name && (coverImage instanceof File)) {
                        promises.push(ContentManagementService.uploadFile(coverImage, coverImage.name, albumItem.coverImageId));
                    }

                    if (cardImage && cardImage.name && (cardImage instanceof File)) {
                        promises.push(ContentManagementService.uploadFile(cardImage, cardImage.name, albumItem.cardImageId));
                    }

                    if (thumbnail && thumbnail.name && (thumbnail instanceof File)) {
                        promises.push(ContentManagementService.uploadFile(thumbnail, thumbnail.name, albumItem.thumbnailId));
                    }

                    $q.all(promises).then(function () {
                        notification.flash({
                            type: 'success',
                            text: $translate.instant('PartnerInfo.Contents.RBT.ContentMetadatas.Albums.Messages.UpdateFlowStartedSuccessful' + ((rbtProviderBusinessTypeProfile.TrustedStatus === 'TRUSTED') ? 'ForAdmin' : ''))
                        });

                        $scope.cancel();
                    });
                } else {
                    WorkflowsService.showApiError(response);
                }
            }, function (response) {
                $log.error('Cannot call the album update flow service. Error: ', response);

                if (response && response.data && response.data.message) {
                    WorkflowsService.showApiError(response);
                } else {
                    notification({
                        type: 'warning',
                        text: $translate.instant('PartnerInfo.Contents.RBT.ContentMetadatas.Albums.Messages.UpdateFlowError')
                    });
                }
            });
        };
    });

})();
