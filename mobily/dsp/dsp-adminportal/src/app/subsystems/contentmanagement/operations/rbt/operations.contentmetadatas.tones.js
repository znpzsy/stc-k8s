(function () {

    'use strict';

    angular.module('adminportal.subsystems.contentmanagement.operations.rbt.contentmetadatas.tones', [
        'adminportal.subsystems.contentmanagement.operations.rbt.contentmetadatas.tones.copyrightfile'
    ]);

    var ContentManagementOperationsContentMetadatasRBTTonesModule = angular.module('adminportal.subsystems.contentmanagement.operations.rbt.contentmetadatas.tones');

    ContentManagementOperationsContentMetadatasRBTTonesModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.contentmanagement.operations.rbt.contentmetadatas.tones', {
            abstract: true,
            url: '/tones',
            template: '<div ui-view></div>',
            data: {
                exportFileName: 'ContentsTonesRBT',
                permissions: [
                    'RBT__OPERATIONS_TONE_READ'
                ]
            }
        }).state('subsystems.contentmanagement.operations.rbt.contentmetadatas.tones.list', {
            url: "",
            templateUrl: "subsystems/contentmanagement/operations/rbt/operations.contentmetadatas.tones.html",
            controller: 'ContentManagementOperationsContentMetadatasRBTTonesCtrl'
        }).state('subsystems.contentmanagement.operations.rbt.contentmetadatas.tones.new', {
            url: "/new",
            templateUrl: "subsystems/contentmanagement/operations/rbt/operations.contentmetadatas.tones.details.html",
            controller: 'ContentManagementOperationsContentMetadatasRBTTonesNewCtrl'
        }).state('subsystems.contentmanagement.operations.rbt.contentmetadatas.tones.update', {
            url: "/update/:id",
            templateUrl: "subsystems/contentmanagement/operations/rbt/operations.contentmetadatas.tones.details.html",
            controller: 'ContentManagementOperationsContentMetadatasRBTTonesUpdateCtrl',
            resolve: {
                tone: function ($stateParams, $q, ContentManagementService, CMPFService) {
                    var deferred = $q.defer();

                    ContentManagementService.getTone($stateParams.id).then(function (_tone) {

                        CMPFService.getOperator(_tone.tone.organizationId, true).then(function (_organization) {
                            _tone.tone.organization = _organization;

                            deferred.resolve(_tone);
                        });
                    });

                    return deferred.promise;
                }
            }
        });

    });

    ContentManagementOperationsContentMetadatasRBTTonesModule.controller('ContentManagementOperationsContentMetadatasRBTTonesCommonCtrl', function ($scope, $log, $q, $state, $controller, $uibModal, $filter, UtilService, SessionService, ContentManagementService, CMPFService,
                                                                                                                                                    CMS_RBT_STATUS_TYPES, CMS_GENDERS, CMS_ACCESS_CHANNELS, DURATION_UNITS, CMS_RBT_REV_SHARE_POLICIES_TONE,
                                                                                                                                                    DEFAULT_REST_QUERY_LIMIT) {
        $log.debug('ContentManagementOperationsContentMetadatasRBTTonesCommonCtrl');

        $controller('GenericDateTimeCtrl', {$scope: $scope});
        $controller('ContentManagementOperationsRBTCommonCtrl', {$scope: $scope});

        $scope.sessionOrganization = SessionService.getSessionOrganization();
        $scope.username = SessionService.getUsername();

        $scope.CMS_RBT_STATUS_TYPES = CMS_RBT_STATUS_TYPES;
        $scope.CMS_GENDERS = CMS_GENDERS;
        $scope.CMS_ACCESS_CHANNELS = CMS_ACCESS_CHANNELS;
        $scope.DURATION_UNITS = DURATION_UNITS;
        $scope.CMS_RBT_REV_SHARE_POLICIES = CMS_RBT_REV_SHARE_POLICIES_TONE;

        $scope.openOrganizations = function (tone) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.organizations.html',
                controller: 'OrganizationsModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    organizationParameter: function () {
                        return angular.copy(tone.organization);
                    },
                    itemName: function () {
                        return tone.name;
                    },
                    allOrganizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllOrganizations(false, true, [CMPFService.OPERATOR_PROFILE, CMPFService.SERVICE_PROVIDER_BUSINESS_TYPE_PROFILE, CMPFService.SERVICE_PROVIDER_SETTLEMENT_TYPE_PROFILE]);
                    },
                    organizationsModalTitleKey: function () {
                        return 'Subsystems.ContentManagement.Operations.RBT.ContentMetadatas.Tones.OrganizationsModalTitle';
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                tone.organization = selectedItem.organization;
                tone.organizationId = selectedItem.organization.id;
            }, function () {
            });
        };

        $scope.contentCategoryList = [];
        $scope.moodList = [];
        $scope.artistList = [];
        $scope.albumList = [];

        $scope.removeSelectedOrganization = function () {
            $scope.contentMetadata.organization = null;
        };

        $scope.toneFileChanged = function (toneFile) {
            $scope.contentMetadata.duration = null;

            toneFile.$$ngfBlobUrlPromise.then(function (ngfBlobUrl) {
                var audioFile = new Audio(ngfBlobUrl);
                audioFile.onloadedmetadata = function () {
                    // Duration in second
                    $scope.contentMetadata.duration = Math.round(audioFile.duration);
                };
            });

            $scope.validationInProgress = true;
            ContentManagementService.validateAudioFile(toneFile).then(function (response) {
                $scope.validationInProgress = false;

                UtilService.setError($scope.form, 'toneFile', 'audioValiditiyCheck', (response && response.code === 2000));
            }, function (response) {
                $scope.validationInProgress = false;

                $log.debug('ERROR: ', response);

                UtilService.setError($scope.form, 'toneFile', 'audioValiditiyCheck', false);
            });
        };

        $scope.settlementTypes = [];
        $scope.$watch('contentMetadata.organization', function (newValue, oldValue) {
            if (newValue) {
                $scope.getPrepareRBTSettelementTypes($scope.contentMetadata).then(function (settlementTypes) {
                    $scope.settlementTypes = settlementTypes;
                });
            }
        });

        $scope.cancel = function () {
            $state.go('subsystems.contentmanagement.operations.rbt.contentmetadatas.tones.list');
        };

        // Call the copyright file controller so it could be mixed with this controller.
        $controller('ContentManagementOperationsContentMetadatasRBTTonesCopyrightFileCtrl', {$scope: $scope});
    });

    ContentManagementOperationsContentMetadatasRBTTonesModule.controller('ContentManagementOperationsContentMetadatasRBTTonesCtrl', function ($rootScope, $scope, $log, $state, $timeout, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                                              Restangular, CMPFService, DateTimeConstants, ContentManagementService, WorkflowsService, SessionService, DEFAULT_REST_QUERY_LIMIT) {
        $log.debug('ContentManagementOperationsContentMetadatasRBTTonesCtrl');

        $scope.sessionOrganization = SessionService.getSessionOrganization();
        $scope.username = SessionService.getUsername();

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
                var preparedFilter = $scope.prepareFilter(params);

                var filter = preparedFilter.filter;
                var additionalFilterFields = preparedFilter.additionalFilterFields;

                if (params.settings().$scope.status !== 'WAITING') {
                    ContentManagementService.getTones(filter.page, filter.limit, filter.sortFieldName, filter.sortOrder, filter.statuses, filter.filterText).then(function (response) {
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
                    WorkflowsService.searchPendingTasks(0, DEFAULT_REST_QUERY_LIMIT, 'RBT_TONE').then(function (waitingToneTask) {
                        if (waitingToneTask && waitingToneTask.detail && waitingToneTask.detail.total > 0) {
                            _.each(waitingToneTask.detail.items, function (toneTask) {
                                if (toneTask && toneTask.name && (toneTask.name.toLowerCase() === 'rbt tone create task')) {
                                    toneTask.objectDetail.taskObjectId = toneTask.rbtContentId;
                                    toneTask.objectDetail.state = 'WAITING FOR APPROVAL';
                                    toneTask.objectDetail.taskName = toneTask.name;

                                    $scope.contentMetadataList.list.push(toneTask.objectDetail);
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
        // END - Tone list

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
                controller: function ($scope, $controller, $uibModalInstance, allOrganizations, moods, artists, albums, contentCategories, taskDetail) {
                    $controller('WorkflowsOperationsTasksDetailRBTToneCtrl', {
                        $scope: $scope,
                        allOrganizations: allOrganizations,
                        moods: moods,
                        artists: artists,
                        albums: albums,
                        contentCategories: contentCategories,
                        taskDetail: taskDetail
                    });

                    $scope.isModal = true;
                    $scope.modalTitle = contentMetadata.taskName;
                    $scope.templateUrl = 'workflows/operations/operations.tasks.rbttones.detail.html';

                    $scope.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'lg',
                resolve: {
                    allOrganizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT, UtilService) {
                        return CMPFService.getAllOrganizations(false, true, [CMPFService.OPERATOR_PROFILE]);
                    },
                    moods: function (ContentManagementService, DEFAULT_REST_QUERY_LIMIT) {
                        return ContentManagementService.getMoods(0, DEFAULT_REST_QUERY_LIMIT);
                    },
                    artists: function (ContentManagementService, DEFAULT_REST_QUERY_LIMIT) {
                        return ContentManagementService.getArtists(0, DEFAULT_REST_QUERY_LIMIT);
                    },
                    albums: function (ContentManagementService, DEFAULT_REST_QUERY_LIMIT) {
                        return ContentManagementService.getAlbums(0, DEFAULT_REST_QUERY_LIMIT);
                    },
                    contentCategories: function (DEFAULT_REST_QUERY_LIMIT, ContentManagementService) {
                        return ContentManagementService.getContentCategoriesRBT(0, DEFAULT_REST_QUERY_LIMIT);
                    },
                    taskDetail: function () {
                        return {
                            toneTask: {
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

                var toneItem = {
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
                    "toneFileId": contentMetadata.toneFileId,
                    "copyrightFiles": contentMetadata.copyrightFiles,
                    "channels": contentMetadata.channels,
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
                    "artistIds": contentMetadata.artistIds,
                    "albumIds": contentMetadata.albumIds,
                    "accessChannels": contentMetadata.accessChannels,
                    "gender": contentMetadata.gender,
                    "fileOrder": contentMetadata.fileOrder,
                    "mimeType": contentMetadata.mimeType,
                    "codec": contentMetadata.codec,
                    "audioBitRate": contentMetadata.audioBitRate,
                    "samplingRate": contentMetadata.samplingRate,
                    "duration": contentMetadata.duration,
                    "userUpdated": $scope.username
                };

                $log.debug('Removing tone: ', toneItem);

                // Tone delete method of the flow service.
                WorkflowsService.deleteToneRBT(toneItem).then(function (response) {
                    if (response && response.code === 2001) {
                        $log.debug('Removed tone: ', toneItem, ', response: ', response);

                        notification.flash({
                            type: 'success',
                            text: $translate.instant('Subsystems.ContentManagement.Operations.RBT.ContentMetadatas.Tones.Messages.DeleteFlowStartedSuccessful' + ($rootScope.isAdminUser ? 'ForAdmin' : ''))
                        });

                        $state.transitionTo($state.current, {}, {reload: true, inherit: true, notify: true});
                    } else {
                        WorkflowsService.showApiError(response);
                    }
                }, function (response) {
                    $log.error('Cannot call the tone delete flow service. Error: ', response);

                    if (response && response.data && response.data.message) {
                        WorkflowsService.showApiError(response);
                    } else {
                        notification({
                            type: 'warning',
                            text: $translate.instant('Subsystems.ContentManagement.Operations.RBT.ContentMetadatas.Tones.Messages.DeleteFlowError')
                        });
                    }
                });
            }, function () {
                contentMetadata.rowSelected = false;
            });
        };
    });

    ContentManagementOperationsContentMetadatasRBTTonesModule.controller('ContentManagementOperationsContentMetadatasRBTTonesNewCtrl', function ($rootScope, $scope, $log, $state, $controller, $q, $filter, $translate, notification, UtilService, ContentManagementService,
                                                                                                                                                 CMPFService, WorkflowsService, SessionService, DateTimeConstants) {
        $log.debug('ContentManagementOperationsContentMetadatasRBTTonesNewCtrl');

        $controller('ContentManagementOperationsContentMetadatasRBTTonesCommonCtrl', {
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
            artistIds: [],
            albumIds: [],
            accessChannels: [],
            chargingDetails: {
                chargingPeriod: {
                    duration: 30,
                    unit: $scope.DURATION_UNITS[0].key
                },
                price: 0,
                subscriptionCode: null
            }
        };

        $scope.sendToWorkflow = function (contentMetadata) {
            var toneItem = {
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
                "artistIds": contentMetadata.artistIds,
                "albumIds": contentMetadata.albumIds,
                "accessChannels": contentMetadata.accessChannels,
                "coverImageId": null,
                "cardImageId": null,
                "thumbnailId": null,
                "toneFileId": null,
                "copyrightFiles": [],
                "gender": contentMetadata.gender,
                "fileOrder": contentMetadata.fileOrder,
                "mimeType": contentMetadata.mimeType,
                "codec": contentMetadata.codec,
                "audioBitRate": contentMetadata.audioBitRate,
                "samplingRate": contentMetadata.samplingRate,
                "duration": contentMetadata.duration,
                "userCreated": $scope.username
            };

            // names
            toneItem.names.push({
                'lang': 'en',
                'name': contentMetadata.nameEn
            });
            toneItem.names.push({
                'lang': 'ar',
                'name': contentMetadata.nameAr
            });

            // descriptions
            toneItem.descriptions.push({
                'lang': 'en',
                'description': contentMetadata.descriptionEn
            });
            toneItem.descriptions.push({
                'lang': 'ar',
                'description': contentMetadata.descriptionAr
            });

            var coverImage, cardImage, thumbnail, toneFile;
            // coverImageId
            if (contentMetadata.coverImage && contentMetadata.coverImage.name) {
                toneItem.coverImageId = UtilService.generateObjectId();
                coverImage = contentMetadata.coverImage;
            }
            // cardImageId
            if (contentMetadata.cardImage && contentMetadata.cardImage.name) {
                toneItem.cardImageId = UtilService.generateObjectId();
                cardImage = contentMetadata.cardImage;
            }
            // thumbnailId
            if (contentMetadata.thumbnail && contentMetadata.thumbnail.name) {
                toneItem.thumbnailId = UtilService.generateObjectId();
                thumbnail = contentMetadata.thumbnail;
            }
            // toneFileId
            if (contentMetadata.toneFile && contentMetadata.toneFile.name) {
                toneItem.toneFileId = UtilService.generateObjectId();
                toneFile = contentMetadata.toneFile;
            }

            // CopyrightFile
            if (contentMetadata.copyrightFileList && contentMetadata.copyrightFileList.length > 0) {
                angular.forEach(contentMetadata.copyrightFileList, function (copyrightFile) {
                    copyrightFile.fileId = UtilService.generateObjectId();

                    toneItem.copyrightFiles.push({
                        "id": copyrightFile.fileId,
                        "startDate": (copyrightFile.startDate ? $filter('date')(copyrightFile.startDate, 'yyyy-MM-dd') + 'T00:00:00' : ''),
                        "endDate": (copyrightFile.endDate ? $filter('date')(copyrightFile.endDate, 'yyyy-MM-dd') + 'T00:00:00' : '')
                    });
                });
            }

            // Charging Details
            if (contentMetadata.chargingDetails) {
                toneItem.offers = [
                    {
                        "chargingPeriodDetail": UtilService.convertSimpleObjectToPeriod(contentMetadata.chargingDetails.chargingPeriod),
                        "price": contentMetadata.chargingDetails.price,
                        "subscriptionCode": contentMetadata.chargingDetails.subscriptionCode,
                        "revSharePolicy": contentMetadata.chargingDetails.revSharePolicy,
                        "settlementType": contentMetadata.chargingDetails.settlementType
                    }
                ];
            }

            $log.debug('Creating tone: ', toneItem);

            // Tone create method of the flow service.
            WorkflowsService.createToneRBT(toneItem).then(function (response) {
                if (response && response.code === 2001) {
                    $log.debug('Save Success. Response: ', response);

                    var promises = [];

                    if (coverImage && coverImage.name) {
                        promises.push(ContentManagementService.uploadFile(coverImage, coverImage.name, toneItem.coverImageId));
                    }

                    if (cardImage && cardImage.name) {
                        promises.push(ContentManagementService.uploadFile(cardImage, cardImage.name, toneItem.cardImageId));
                    }

                    if (thumbnail && thumbnail.name) {
                        promises.push(ContentManagementService.uploadFile(thumbnail, thumbnail.name, toneItem.thumbnailId));
                    }

                    if (toneFile && toneFile.name) {
                        promises.push(ContentManagementService.uploadFile(toneFile, toneFile.name, toneItem.toneFileId));
                    }

                    _.each(contentMetadata.copyrightFileList, function (copyrightFile) {
                        if (copyrightFile.copyrightFile && copyrightFile.copyrightFile.name) {
                            promises.push(ContentManagementService.uploadFile(copyrightFile.copyrightFile, copyrightFile.copyrightFile.name, copyrightFile.fileId));
                        }
                    });

                    $q.all(promises).then(function () {
                        notification.flash({
                            type: 'success',
                            text: $translate.instant('Subsystems.ContentManagement.Operations.RBT.ContentMetadatas.Tones.Messages.CreateFlowStartedSuccessful' + ($rootScope.isAdminUser ? 'ForAdmin' : ''))
                        });

                        $scope.cancel();
                    });
                } else {
                    WorkflowsService.showApiError(response);
                }
            }, function (response) {
                $log.error('Cannot call the tone create flow service. Error: ', response);

                if (response && response.data && response.data.message) {
                    WorkflowsService.showApiError(response);
                } else {
                    notification({
                        type: 'warning',
                        text: $translate.instant('Subsystems.ContentManagement.Operations.RBT.ContentMetadatas.Tones.Messages.CreateFlowError')
                    });
                }
            });
        };
    });

    ContentManagementOperationsContentMetadatasRBTTonesModule.controller('ContentManagementOperationsContentMetadatasRBTTonesUpdateCtrl', function ($rootScope, $scope, $state, $log, $controller, $q, $filter, $translate, notification, UtilService, Restangular,
                                                                                                                                                    CMPFService, WorkflowsService, ContentManagementService, FileDownloadService, SessionService, DateTimeConstants,
                                                                                                                                                    tone) {
        $log.debug('ContentManagementOperationsContentMetadatasRBTTonesUpdateCtrl');

        $controller('ContentManagementOperationsContentMetadatasRBTTonesCommonCtrl', {
            $scope: $scope
        });

        $scope.contentMetadata = tone.tone;

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

        if (!$scope.contentMetadata.moodIds) {
            $scope.contentMetadata.moodIds = [];
        }

        if (!$scope.contentMetadata.artistIds) {
            $scope.contentMetadata.artistIds = [];
        }

        if (!$scope.contentMetadata.albumIds) {
            $scope.contentMetadata.albumIds = [];
        }

        if (!$scope.contentMetadata.accessChannels) {
            $scope.contentMetadata.accessChannels = [];
        }

        // Get the coverImage by id value.
        if ($scope.contentMetadata.coverImageId) {
            $scope.contentMetadata.coverImage = {name: undefined};
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
        if ($scope.contentMetadata.cardImageId) {
            $scope.contentMetadata.cardImage = {name: undefined};
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
        if ($scope.contentMetadata.thumbnailId) {
            $scope.contentMetadata.thumbnail = {name: undefined};
            var srcUrl = ContentManagementService.generateFilePath($scope.contentMetadata.thumbnailId);
            FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                $scope.contentMetadata.thumbnail = blob;
                if (blob) {
                    $scope.contentMetadata.thumbnail.name = fileName;
                }
                $scope.originalContentMetadata = angular.copy($scope.contentMetadata);
            });
        }

        // Get the toneFile by id value.
        if ($scope.contentMetadata.toneFileId) {
            $scope.contentMetadata.toneFile = {name: undefined};
            var srcUrl = ContentManagementService.generateFilePath($scope.contentMetadata.toneFileId);
            FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                $scope.contentMetadata.toneFile = blob;
                if (blob) {
                    $scope.contentMetadata.toneFile.name = fileName;
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
                settlementType: chargingDetails.settlementType,
                revSharePolicy: chargingDetails.revSharePolicy
            };
        } else {
            $scope.contentMetadata.chargingDetails = {
                chargingPeriod: {
                    duration: 30,
                    unit: $scope.DURATION_UNITS[0].key
                },
                price: 0,
                subscriptionCode: null,
                settlementType: null,
                revSharePolicy: null
            };
        }

        $scope.originalContentMetadata = angular.copy($scope.contentMetadata);
        $scope.dateHolderOriginal = angular.copy($scope.dateHolder);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalContentMetadata, $scope.contentMetadata) &&
                angular.equals($scope.dateHolder, $scope.dateHolderOriginal);
        };

        $scope.sendToWorkflow = function (contentMetadata) {
            var toneItem = {
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
                "id": $scope.originalContentMetadata.id,
                "legacyId": $scope.originalContentMetadata.legacyId,
                "coverImageId": $scope.originalContentMetadata.coverImageId,
                "cardImageId": $scope.originalContentMetadata.cardImageId,
                "thumbnailId": $scope.originalContentMetadata.thumbnailId,
                "toneFileId": $scope.originalContentMetadata.toneFileId,
                "channels": $scope.originalContentMetadata.channels,
                "contentType": $scope.originalContentMetadata.contentType,
                "userCreated": $scope.originalContentMetadata.userCreated,
                "dateCreated": $scope.originalContentMetadata.dateCreated,
                "offers": $scope.originalContentMetadata.offers,
                "totalSubscriptionCount": $scope.originalContentMetadata.totalSubscriptionCount,
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
                "artistIds": contentMetadata.artistIds,
                "albumIds": contentMetadata.albumIds,
                "accessChannels": contentMetadata.accessChannels,
                "copyrightFiles": [],
                "gender": contentMetadata.gender,
                "fileOrder": contentMetadata.fileOrder,
                "mimeType": contentMetadata.mimeType,
                "codec": contentMetadata.codec,
                "audioBitRate": contentMetadata.audioBitRate,
                "samplingRate": contentMetadata.samplingRate,
                "duration": contentMetadata.duration,
                "userUpdated": $scope.username
            };

            // names
            toneItem.names.push({
                'lang': 'en',
                'name': contentMetadata.nameEn
            });
            toneItem.names.push({
                'lang': 'ar',
                'name': contentMetadata.nameAr
            });

            // descriptions
            toneItem.descriptions.push({
                'lang': 'en',
                'description': contentMetadata.descriptionEn
            });
            toneItem.descriptions.push({
                'lang': 'ar',
                'description': contentMetadata.descriptionAr
            });

            var coverImage, cardImage, thumbnail, toneFile;
            // coverImageId
            coverImage = contentMetadata.coverImage;
            if (!coverImage || (coverImage && !coverImage.name)) {
                toneItem.coverImageId = null;
            } else if (coverImage instanceof File && !toneItem.coverImageId) {
                toneItem.coverImageId = UtilService.generateObjectId();
            }
            // cardImageId
            cardImage = contentMetadata.cardImage;
            if (!cardImage || (cardImage && !cardImage.name)) {
                toneItem.cardImageId = null;
            } else if (cardImage instanceof File && !toneItem.cardImageId) {
                toneItem.cardImageId = UtilService.generateObjectId();
            }
            // thumbnailId
            thumbnail = contentMetadata.thumbnail;
            if (!thumbnail || (thumbnail && !thumbnail.name)) {
                toneItem.thumbnailId = null;
            } else if (thumbnail instanceof File && !toneItem.thumbnailId) {
                toneItem.thumbnailId = UtilService.generateObjectId();
            }
            // toneFileId
            toneFile = contentMetadata.toneFile;
            if (!toneFile || (toneFile && !toneFile.name)) {
                toneItem.toneFileId = null;
            } else if (toneFile instanceof File && !toneItem.toneFileId) {
                toneItem.toneFileId = UtilService.generateObjectId();
            }

            // CopyrightFile
            if (contentMetadata.copyrightFileList && contentMetadata.copyrightFileList.length > 0) {
                angular.forEach(contentMetadata.copyrightFileList, function (copyrightFile) {
                    if (!copyrightFile.copyrightFile || (copyrightFile.copyrightFile && !copyrightFile.copyrightFile.name)) {
                        copyrightFile.fileId = null;
                    } else if (copyrightFile.copyrightFile instanceof File && !copyrightFile.fileId) {
                        copyrightFile.fileId = UtilService.generateObjectId();
                    }

                    toneItem.copyrightFiles.push({
                        "id": copyrightFile.fileId,
                        "startDate": (copyrightFile.startDate ? $filter('date')(copyrightFile.startDate, 'yyyy-MM-dd') + 'T00:00:00' : ''),
                        "endDate": (copyrightFile.endDate ? $filter('date')(copyrightFile.endDate, 'yyyy-MM-dd') + 'T00:00:00' : '')
                    });
                });
            }

            // Charging Details
            if (contentMetadata.chargingDetails) {
                toneItem.offers = [
                    {
                        "chargingPeriodDetail": UtilService.convertSimpleObjectToPeriod(contentMetadata.chargingDetails.chargingPeriod),
                        "price": contentMetadata.chargingDetails.price,
                        "subscriptionCode": contentMetadata.chargingDetails.subscriptionCode,
                        "revSharePolicy": contentMetadata.chargingDetails.revSharePolicy,
                        "settlementType": contentMetadata.chargingDetails.settlementType
                    }
                ];
            }

            $log.debug('Updating tone: ', toneItem);

            // Tone create method of the flow service.
            WorkflowsService.updateToneRBT(toneItem).then(function (response) {
                if (response && response.code === 2001) {
                    $log.debug('Save Success. Response: ', response);

                    var promises = [];

                    if (coverImage && coverImage.name && (coverImage instanceof File)) {
                        promises.push(ContentManagementService.uploadFile(coverImage, coverImage.name, toneItem.coverImageId));
                    }

                    if (cardImage && cardImage.name && (cardImage instanceof File)) {
                        promises.push(ContentManagementService.uploadFile(cardImage, cardImage.name, toneItem.cardImageId));
                    }

                    if (thumbnail && thumbnail.name && (thumbnail instanceof File)) {
                        promises.push(ContentManagementService.uploadFile(thumbnail, thumbnail.name, toneItem.thumbnailId));
                    }

                    if (toneFile && toneFile.name && (toneFile instanceof File)) {
                        promises.push(ContentManagementService.uploadFile(toneFile, toneFile.name, toneItem.toneFileId));
                    }

                    _.each(contentMetadata.copyrightFileList, function (copyrightFile) {
                        if (copyrightFile.copyrightFile && copyrightFile.copyrightFile.name && (copyrightFile.copyrightFile instanceof File)) {
                            promises.push(ContentManagementService.uploadFile(copyrightFile.copyrightFile, copyrightFile.copyrightFile.name, copyrightFile.fileId));
                        }
                    });

                    $q.all(promises).then(function () {
                        notification.flash({
                            type: 'success',
                            text: $translate.instant('Subsystems.ContentManagement.Operations.RBT.ContentMetadatas.Tones.Messages.UpdateFlowStartedSuccessful' + ($rootScope.isAdminUser ? 'ForAdmin' : ''))
                        });

                        $scope.cancel();
                    });
                } else {
                    WorkflowsService.showApiError(response);
                }
            }, function (response) {
                $log.error('Cannot call the tone update flow service. Error: ', response);

                if (response && response.data && response.data.message) {
                    WorkflowsService.showApiError(response);
                } else {
                    notification({
                        type: 'warning',
                        text: $translate.instant('Subsystems.ContentManagement.Operations.RBT.ContentMetadatas.Tones.Messages.UpdateFlowError')
                    });
                }
            });
        };
    });

})();
