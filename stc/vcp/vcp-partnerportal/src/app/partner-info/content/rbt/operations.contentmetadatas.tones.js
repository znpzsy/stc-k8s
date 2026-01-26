(function () {

    'use strict';

    angular.module('partnerportal.partner-info.operations.rbt.contentmetadatas.tones', [
        'partnerportal.partner-info.operations.rbt.contentmetadatas.tones.copyrightfile'
    ]);

    var PartnerInfoContentManagementContentMetadatasRBTTonesModule = angular.module('partnerportal.partner-info.operations.rbt.contentmetadatas.tones');

    PartnerInfoContentManagementContentMetadatasRBTTonesModule.config(function ($stateProvider) {

        $stateProvider.state('partner-info.operations.rbt.contentmetadatas.tones', {
            abstract: true,
            url: '/tones',
            template: '<div ui-view></div>',
            data: {
                exportFileName: 'ContentTonesRBT',
                permissions: [
                    'RBT__TONE_READ'
                ]
            }
        });
        // Create
        $stateProvider.state('partner-info.operations.rbt.contentmetadatas.tones.new', {
            url: "/new",
            templateUrl: "partner-info/content/rbt/operations.contentmetadatas.tones.details.html",
            controller: 'PartnerInfoContentManagementContentMetadatasRBTTonesNewCtrl',
            resolve: {
                tone: function () {
                    return null;
                }
            }
        })
        // Update
        $stateProvider.state('partner-info.operations.rbt.contentmetadatas.tones.update', {
            url: "/update/:id",
            templateUrl: "partner-info/content/rbt/operations.contentmetadatas.tones.details.html",
            controller: 'PartnerInfoContentManagementContentMetadatasRBTTonesUpdateCtrl',
            resolve: {
                tone: function ($stateParams, ContentManagementService) {
                    return ContentManagementService.getTone($stateParams.id, ['CATEGORY', 'SUBCATEGORY']);
                }
            }
        });
        // // List
        // $stateProvider.state('partner-info.operations.rbt.contentmetadatas.tones.list', {
        //     url: "",
        //     templateUrl: "partner-info/content/rbt/operations.contentmetadatas.tones.html",
        //     controller: 'PartnerInfoContentManagementContentMetadatasRBTTonesCtrl'
        // });
    });

    PartnerInfoContentManagementContentMetadatasRBTTonesModule.controller('PartnerInfoContentManagementContentMetadatasRBTTonesCommonCtrl', function ($scope, $log, $q, $state, $controller, $translate, $filter, UtilService, SessionService, ContentManagementService, CMPFService,
                                                                                                                                                      CMS_CODECS, CMS_RBT_STATUS_TYPES, CMS_GENDERS, CMS_ACCESS_CHANNELS, DURATION_UNITS, CMS_RBT_REV_SHARE_POLICIES_TONE, DEFAULT_REST_QUERY_LIMIT) {
        $log.debug('PartnerInfoContentManagementContentMetadatasRBTTonesCommonCtrl');

        $controller('GenericDateTimeCtrl', {$scope: $scope});
        $controller('PartnerInfoContentManagementRBTCommonCtrl', {$scope: $scope});
        $controller('AllowedCategoriesCommonCtrl', {$scope: $scope});

        $scope.sessionOrganization = SessionService.getSessionOrganization();
        $scope.username = SessionService.getUsername();

        $scope.CMS_RBT_STATUS_TYPES = CMS_RBT_STATUS_TYPES;
        $scope.CMS_GENDERS = CMS_GENDERS;
        $scope.CMS_CODECS = CMS_CODECS;
        $scope.CMS_ACCESS_CHANNELS = CMS_ACCESS_CHANNELS;
        $scope.DURATION_UNITS = DURATION_UNITS;
        $scope.CMS_RBT_REV_SHARE_POLICIES = CMS_RBT_REV_SHARE_POLICIES_TONE;
        $scope.contentCategoryList = [];
        $scope.contentSubcategoryList = [];
        $scope.viewOnlyCategorizationItems = []; // List of categories or subcategories already associated with the tone, which are not to be edited.

        $scope.playlistList = [];
        $scope.moodList = [];


        // Categorization - Category Selection Callback
        var setCategorySelection = function (selectedSubcategories) {
            // newly selected GENERAL subcat + other (IVR/USSD) subcat ==> seletedSubcategories
            // Set subcategories for tone
            $scope.contentMetadata.subcategories = selectedSubcategories;
            $scope.contentMetadata.subcategoryIds = _.pluck(selectedSubcategories, 'id');

            // setting for the view & category ids
            var selected_general_subcategory = _.filter(selectedSubcategories, function (item) {
                return $scope.isGeneral(item);
            });
            var selected_general_category = angular.copy(selected_general_subcategory[0].category);
            var categoriesNotToBeEdited = _.filter($scope.viewOnlyCategorizationItems, function (entry) {
                return entry && entry.type === 'category' && entry.item && !entry.general;
            });
            var subcategoriesNotToBeEdited = _.filter($scope.viewOnlyCategorizationItems, function (entry) {
                return entry && entry.type === 'subcategory' && entry.item && !entry.general;
            });

            var finalizeViewOnly = [{
                type: 'category',
                item: selected_general_category,
                general: true
            }];
            finalizeViewOnly = finalizeViewOnly.concat(subcategoriesNotToBeEdited).concat(categoriesNotToBeEdited);
            $scope.contentMetadata.categoryIds =  _.compact(_.uniq(_.map(finalizeViewOnly, function(obj) {
                if (obj && obj.item && obj.type === 'category') {
                    return obj.item.id
                }
            })));

            $log.warn('setCategorySelection\n General SubCategory: ', selected_general_subcategory,
                "\n General Category: ", selected_general_category,
                "\n subcategoriesNotToBeEdited: ", subcategoriesNotToBeEdited,
                "\n categoriesNotToBeEdited", categoriesNotToBeEdited,
                "\n finalizeViewOnly", finalizeViewOnly,
                "\n subcategoryIds updated", $scope.contentMetadata.subcategoryIds,
                "\n categoryIds updated: ", $scope.contentMetadata.categoryIds);

            $scope.viewOnlyCategorizationItems = finalizeViewOnly;
        };

        $scope.artistList = [];
        $scope.albumList = [];


        $scope.openCategorySelection = function () {
            // Configuration for the tone selection modal

            var title = $translate.instant('PartnerInfo.Contents.RBT.ContentMetadatas.Tones.Title');
            title += ' [Tone = ' + ($scope.contentMetadata.name ? $scope.contentMetadata.name : 'New Tone ')+']';

            var config = {
                titleKey: title,
                dateFilter: {
                    status: 'ACTIVE'
                },
                enableToneOrdering: $scope.enableToneOrdering,
                //isAuthorized: $scope.contentMetadata.id ? AuthorizationService.canRBTOperationsCategoryUpdate($scope.contentMetadata.status) : AuthorizationService.canRBTOperationsCategoryCreate()
            };
            $scope.showAllowedCategories($scope.contentMetadata.subcategories, setCategorySelection, config)
        };

        $scope.toneFileChanged = function (toneFile) {
            $scope.contentMetadata.duration = null;

            toneFile.$$ngfBlobUrlPromise.then(function (ngfBlobUrl) {
                var audioFile = new Audio(ngfBlobUrl);
                $log.debug('audioFile: ', audioFile);
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

        $scope.mp3FileChanged = function (mp3File) {
            $scope.validationInProgress = true;
            ContentManagementService.validateMp3File(mp3File).then(function (response) {
                $scope.validationInProgress = false;

                UtilService.setError($scope.form, 'mp3File', 'audioValiditiyCheck', (response && response.code === 2000));
            }, function (response) {
                $scope.validationInProgress = false;

                $log.debug('ERROR: ', response);

                UtilService.setError($scope.form, 'mp3File', 'audioValiditiyCheck', false);
            });
        };

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
            } else if($scope.contentMetadata.chargingDetails.originalPrice && $scope.contentMetadata.chargingDetails.originalPrice >= 0) {
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

        $scope.$on('subcategoryIdsUpdated', function (event, subcategoryIdList) {
            $log.debug('Received subcategoryIdsUpdated event with subcategoryIds: ', subcategoryIdList);

            // Update contentCategory.toneIds and trigger the watcher
            $scope.contentMetadata.subcategoryIds = subcategoryIdList;
        });

        $scope.cancel = function () {
            //$state.go('partner-info.operations.rbt.contentmetadatas.tones.list');
            $state.go('partner-info.operations.rbt.bulk.management.list');
        };

        // Call the copyright file controller so it could be mixed with this controller.
        $controller('PartnerInfoContentManagementContentMetadatasRBTTonesCopyrightFileCtrl', {$scope: $scope});
    });

    PartnerInfoContentManagementContentMetadatasRBTTonesModule.controller('PartnerInfoContentManagementContentMetadatasRBTTonesCtrl', function ($rootScope, $scope, $log, $controller, $state, $timeout, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                                                Restangular, CMPFService, DateTimeConstants, ContentManagementService, WorkflowsService, SessionService, DEFAULT_REST_QUERY_LIMIT) {
        $log.debug('PartnerInfoContentManagementContentMetadatasRBTTonesCtrl');

        $controller('PartnerInfoContentManagementRBTCommonCtrl', {$scope: $scope});

        $scope.sessionOrganization = SessionService.getSessionOrganization();
        $scope.username = SessionService.getUsername();

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

                // WAITING status removed, no BPMS Workflows for Tones
                ContentManagementService.getTonesByOrganizationId(filter.page, filter.limit, filter.sortFieldName, filter.sortOrder, filter.statuses, filter.filterText, $scope.sessionOrganization.id).then(function (response) {
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

    });

    PartnerInfoContentManagementContentMetadatasRBTTonesModule.controller('PartnerInfoContentManagementContentMetadatasRBTTonesNewCtrl', function ($rootScope, $scope, $log, $state, $controller, $q, $filter, $translate, notification,
                                                                                                                                                   UtilService, ContentManagementService, CMPFService, WorkflowsService, SessionService, DateTimeConstants,
                                                                                                                                                   tone) {
        $log.debug('PartnerInfoContentManagementContentMetadatasRBTTonesNewCtrl');

        $controller('PartnerInfoContentManagementContentMetadatasRBTTonesCommonCtrl', {
            $scope: $scope
        });

        $scope.dateHolder.startDate = moment().startOf('day').toDate();
        $scope.dateHolder.endDate = moment().endOf('day').add(10, 'years').toDate();

        $scope.contentMetadata = {
            status: 'PENDING',
            subscriptionEnabled: false,
            promoted: false,
            isBlacklisted: false,
            codec: "ULAW",
            channels: "MONO",
            mimeType: "audio/x-wav",
            samplingRate: 8,
            audioBitRate: 16,
            tags: [],
            categoryIds: [],
            categories: [],
            subcategoryIds: [],
            subcategories: [],
            moodIds: [],
            artistIds: [],
            albumIds: [],
            playlistIds: [],
            accessChannels: ["IVR", "USSD", "SMS", "SMS_HU", "IVR_FK", "CC", "AdminPortal", "RBTPortal", "RBTMobileApp", "MySTC", "CPWhiteBrandedPortal", "CorporatePortal", "BackOfficeBulkOps", "RBTBackend", "RBTDecisionEngine"],
            chargingDetails: {
                chargingPeriod: {
                    duration: 30,
                    unit: $scope.DURATION_UNITS[0].key
                },
                price: 0,
                originalPrice: null,
                subscriptionCode: null,
                revSharePolicy: 'COMPLEX'
            }
        };

        $scope.sendToWorkflow = function (contentMetadata) {
            $log.debug('PartnerInfoContentManagementContentMetadatasRBTTonesNewCtrl sendToWorkflow: ', contentMetadata);
            $log.debug('PartnerInfoContentManagementContentMetadatasRBTTonesNewCtrl $scope.sessionOrganization: ', $scope.sessionOrganization);


            var toneItem = {
                // Changed values
                "name": contentMetadata.name,
                "nameList": [],
                "names": [],
                "organizationId": $scope.sessionOrganization.id,
                "organizationName": $scope.sessionOrganization.name,
                "status": contentMetadata.status,
                "subcategoryIds": contentMetadata.subcategoryIds,
                "subscriptionEnabled": contentMetadata.subscriptionEnabled,
                "promoted": contentMetadata.promoted,
                "isBlacklisted": contentMetadata.isBlacklisted,
                "launchDate": ($scope.dateHolder.startDate ? $filter('date')($scope.dateHolder.startDate, 'yyyy-MM-dd') + 'T00:00:00' : ''),
                "expireDate": ($scope.dateHolder.endDate ? $filter('date')($scope.dateHolder.endDate, 'yyyy-MM-dd') + 'T00:00:00' : ''),
                "descriptions": [],
                "descriptionList": [],
                "tags": contentMetadata.tags,
                "categoryIds": contentMetadata.categoryIds,
                "moodIds": contentMetadata.moodIds,
                "artistIds": contentMetadata.artistIds,
                "playlistIds": contentMetadata.playlistIds,
                "albumIds": contentMetadata.albumIds,
                "accessChannels": contentMetadata.accessChannels,
                "cardImageId": "",
                "cardImageUrl": "",
                "thumbnailId": "",
                "thumbnailUrl": "",
                "coverImageId": "",
                "coverImageUrl": "",
                "mp3FileId": null,
                "toneFileId": null,
                "toneFileUrl": null,
                "copyrightFiles": [],
                "gender": contentMetadata.gender,
                "fileOrder": contentMetadata.fileOrder,
                "mimeType": contentMetadata.mimeType,
                "codec": contentMetadata.codec,
                "audioBitRate": contentMetadata.audioBitRate,
                "samplingRate": contentMetadata.samplingRate,
                "duration": contentMetadata.duration,
                "featuredTitleList": [],
                "featuredDescriptionList": [],
                //ADDED
                "channels": "string",
                "contentType": "TONE",
                "dateCreated": $filter('date')(Date.now(), 'yyyy-MM-dd') + 'T00:00:00',
                "dateUpdated": $filter('date')(Date.now(), 'yyyy-MM-dd') + 'T00:00:00',
                "featuredDescriptions": [],
                "featuredTitles": [],
                "id": null,
                "legacyId": null,
                "offers": [],
                "totalSubscriptionCount": 0
            };

            // names
            toneItem.names.push({ 'lang': 'en', 'name': contentMetadata.nameEn });
            toneItem.names.push({ 'lang': 'ar', 'name': contentMetadata.nameAr });

            // descriptions
            toneItem.descriptions.push({ 'lang': 'en', 'description': contentMetadata.descriptionEn });
            toneItem.descriptions.push({ 'lang': 'ar', 'description': contentMetadata.descriptionAr });

            // featuredTitles & featuredDescriptions -- Only if promoted
            if (contentMetadata.promoted) {
                toneItem.featuredTitles.push({ 'lang': 'en', 'name': contentMetadata.featuredTitleEn });
                toneItem.featuredTitles.push({ 'lang': 'ar', 'name': contentMetadata.featuredTitleAr });
                toneItem.featuredDescriptions.push({ 'lang': 'en', 'description': contentMetadata.featuredDescriptionEn });
                toneItem.featuredDescriptions.push({ 'lang': 'ar', 'description': contentMetadata.featuredDescriptionAr });
            }

            var coverImage, cardImage, toneFile, mp3File;
            // coverImageId
            if (contentMetadata.coverImage && contentMetadata.coverImage.name) {
                toneItem.coverImageId = UtilService.generateObjectId();
                coverImage = contentMetadata.coverImage;
            }
            // cardImageId (if selected, will be pre-uploaded)
            if (contentMetadata.cardImage && contentMetadata.cardImage.name) {
                toneItem.cardImageId = UtilService.generateObjectId();
                cardImage = contentMetadata.cardImage;
            }
            // toneFileId
            if (contentMetadata.toneFile && contentMetadata.toneFile.name) {
                toneItem.toneFileId = UtilService.generateObjectId();
                toneFile = contentMetadata.toneFile;
            }
            // mp3FileId
            if (contentMetadata.mp3File && contentMetadata.mp3File.name) {
                toneItem.mp3FileId = UtilService.generateObjectId();
                mp3File = contentMetadata.mp3File;
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

                // The "Charging Period" field should default to "30 DAYS." and should be non-editable, as per the STC requirement. Reset the value to 30 if it is different.
                contentMetadata.chargingDetails.chargingPeriod.duration = 30;
                contentMetadata.chargingDetails.chargingPeriod.unit = $scope.DURATION_UNITS[0].key;

                toneItem.offers = [
                    {
                        "chargingPeriodDetail": UtilService.convertSimpleObjectToPeriod(contentMetadata.chargingDetails.chargingPeriod),
                        "chargingPeriod": contentMetadata.chargingDetails.chargingPeriod.duration,
                        "price": contentMetadata.chargingDetails.price,
                        "originalPrice": contentMetadata.chargingDetails.originalPrice,
                        "subscriptionCode": null, // Do not let the user to set this value, even if he tampers with the html and enables the input
                        "revSharePolicy": contentMetadata.chargingDetails.revSharePolicy,
                        "settlementType": contentMetadata.chargingDetails.settlementType
                    }
                ];
            }

            $log.debug('Handling files for tone: ', toneItem);

            // File Handling
            var cardSelected = !!(cardImage && cardImage.name);
            var preUploadedCard = false;

            // helper for rollback
            function bestEffortDelete(fileId) {
                if (!fileId) return $q.when();
                return ContentManagementService.deleteFile(fileId)["catch"](angular.noop);
            }

            // Post-success uploads
            function uploadAllOtherFiles() {
                var promises = [];

                if (coverImage && coverImage.name) {
                    promises.push(ContentManagementService.uploadFile(coverImage, coverImage.name, toneItem.coverImageId));
                }

                if (cardImage && cardImage.name) {
                    promises.push(ContentManagementService.uploadFile(cardImage, cardImage.name, toneItem.cardImageId));
                }

                if (toneFile && toneFile.name) {
                    promises.push(ContentManagementService.uploadFile(toneFile, toneFile.name, toneItem.toneFileId));
                }

                if (mp3File && mp3File.name) {
                    promises.push(ContentManagementService.uploadFile(mp3File, mp3File.name, toneItem.mp3FileId));
                }

                if (contentMetadata.copyrightFileList && contentMetadata.copyrightFileList.length > 0) {
                    _.each(contentMetadata.copyrightFileList, function (copyrightFile) {
                        if (copyrightFile.copyrightFile && copyrightFile.copyrightFile.name) {
                            promises.push(ContentManagementService.uploadFile(copyrightFile.copyrightFile, copyrightFile.copyrightFile.name, copyrightFile.fileId));
                        }
                    });
                }
                return $q.all(promises);
            }

            // Chain
            var preUploadPromise = $q.when();

            // Upload card image first, if present.
            if (cardSelected) {
                preUploadPromise = ContentManagementService.uploadFile(cardImage, cardImage.name, toneItem.cardImageId)
                    .then(function () {
                        preUploadedCard = true;
                    });
            }

            preUploadPromise
                .then(function () {
                    $log.debug('Creating tone: ', toneItem);
                    return ContentManagementService.createTone(toneItem);
                })
                .then(function (response) {
                    if (!response) {
                        var err = new Error('Tone create failed');
                        err.apiResponse = response;
                        throw err;
                    }

                    $log.debug('Save Success. Response: ', response);

                    // Upload the remaining files (cover, tone, mp3, copyright)
                    return uploadAllOtherFiles()
                        .then(function () {
                            notification.flash({
                                type: 'success',
                                text: $translate.instant('PartnerInfo.Contents.RBT.ContentMetadatas.Tones.Messages.CreateFlowStartedSuccessful')
                            });

                            $scope.cancel();
                        });
                })
                .catch(function (err) {
                    // If metadata failed card image upload, rollback card.
                    $log.error('Cannot complete tone create flow. Error: ', err);

                    var cleanup = [];

                    if (preUploadedCard && toneItem.cardImageId) {
                        cleanup.push(bestEffortDelete(toneItem.cardImageId));
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
                                text: $translate.instant('PartnerInfo.Contents.RBT.ContentMetadatas.Tones.Messages.CreateFlowError')
                            });
                        }
                    });
                });
        };
    });

    PartnerInfoContentManagementContentMetadatasRBTTonesModule.controller('PartnerInfoContentManagementContentMetadatasRBTTonesUpdateCtrl', function ($rootScope, $scope, $state, $log, $controller, $q, $filter, $translate, notification, UtilService,
                                                                                                                                                      CMPFService, WorkflowsService, ContentManagementService, FileDownloadService, SessionService, DateTimeConstants,
                                                                                                                                                      tone) {

        $log.debug('PartnerInfoContentManagementContentMetadatasRBTTonesUpdateCtrl');

        $controller('PartnerInfoContentManagementContentMetadatasRBTTonesCommonCtrl', {
            $scope: $scope
        });

        $scope.contentMetadata = tone.tone;
        $scope.contentMetadata.organization = $scope.sessionOrganization;

        if ($scope.contentMetadata.categories) {
            $scope.contentMetadata.categories.forEach(function (cat) {
                $scope.viewOnlyCategorizationItems.push({
                    type: 'category',
                    item: cat,
                    general: $scope.isGeneral(cat)
                });
            });
        }

        if ($scope.contentMetadata.subcategories) {
            $scope.contentMetadata.subcategories.forEach(function (sc) {
                if ($scope.isIVR(sc) || $scope.isUSSD(sc)) {
                    $scope.viewOnlyCategorizationItems.push({
                        type: 'subcategory',
                        item: sc,
                        general: $scope.isGeneral(sc)
                    });
                }
            });
        }

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
        if (!$scope.contentMetadata.artistIds) {
            $scope.contentMetadata.artistIds = [];
        }
        if (!$scope.contentMetadata.playlistIds) {
            $scope.contentMetadata.playlistIds = [];
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

        // Get the mp3File by id value.
        if ($scope.contentMetadata.mp3FileId) {
            $scope.contentMetadata.mp3File = {name: undefined};
            var srcUrl = ContentManagementService.generateFilePath($scope.contentMetadata.mp3FileId);
            FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                $scope.contentMetadata.mp3File = blob;
                if (blob) {
                    $scope.contentMetadata.mp3File.name = fileName;
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
                originalPrice: chargingDetails.originalPrice ? Number(chargingDetails.originalPrice): null,
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
                originalPrice: null,
                subscriptionCode: null,
                settlementType: null,
                revSharePolicy: 'COMPLEX'
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

            var toneItem = {
                "id": original.id,
                "legacyId": original.legacyId,
                "channels": original.channels,
                "contentType": original.contentType,
                "dateCreated": original.dateCreated,
                "offers": original.offers,
                "totalSubscriptionCount": original.totalSubscriptionCount,
                "rejectReason": original.rejectReason,
                "accessChannels": original.accessChannels,
                "mp3FileId": original.mp3FileId,
                "toneFileId": original.toneFileId,
                "toneFileUrl": original.toneFileUrl,
                // Will be decided below for each image
                "coverImageId": original.coverImageId,
                "coverImageUrl": original.coverImageUrl,
                "cardImageId": original.cardImageId,
                "cardImageUrl": original.cardImageUrl,
                "thumbnailId": original.thumbnailId,
                // Changed values
                "name": contentMetadata.name,
                "organizationId": contentMetadata.organization.id,
                "organizationName": contentMetadata.organization.name,
                "status": contentMetadata.status,
                "subscriptionEnabled": contentMetadata.subscriptionEnabled,
                "promoted": contentMetadata.promoted,
                "isBlacklisted": contentMetadata.isBlacklisted,
                "launchDate": ($scope.dateHolder.startDate ? $filter('date')($scope.dateHolder.startDate, 'yyyy-MM-dd') + 'T00:00:00' : ''),
                "expireDate": ($scope.dateHolder.endDate ? $filter('date')($scope.dateHolder.endDate, 'yyyy-MM-dd') + 'T00:00:00' : ''),
                "names": [],
                "descriptions": [],
                "tags": contentMetadata.tags,
                "categoryIds": contentMetadata.categoryIds,
                "moodIds": contentMetadata.moodIds,
                "artistIds": contentMetadata.artistIds,
                "albumIds": contentMetadata.albumIds,
                "playlistIds": contentMetadata.playlistIds,
                "copyrightFiles": [],
                "gender": contentMetadata.gender,
                "fileOrder": contentMetadata.fileOrder,
                "mimeType": contentMetadata.mimeType,
                "codec": contentMetadata.codec,
                "audioBitRate": contentMetadata.audioBitRate,
                "samplingRate": contentMetadata.samplingRate,
                "duration": contentMetadata.duration,
                "nameList": contentMetadata.nameList,
                "descriptionList": contentMetadata.descriptionList,
                "featuredTitleList": [],
                "featuredDescriptionList": [],
                "subcategoryIds": contentMetadata.subcategoryIds,
                "dateUpdated": $filter('date')(Date.now(), 'yyyy-MM-dd') + 'T00:00:00',
                "featuredDescriptions": [],
                "featuredTitles": []
            };

            // names
            toneItem.names.push({ 'lang': 'en', 'name': contentMetadata.nameEn });
            toneItem.names.push({ 'lang': 'ar', 'name': contentMetadata.nameAr });

            // descriptions
            toneItem.descriptions.push({ 'lang': 'en', 'description': contentMetadata.descriptionEn });
            toneItem.descriptions.push({ 'lang': 'ar', 'description': contentMetadata.descriptionAr });

            // featuredTitles & featuredDescriptions -- Only if promoted
            if (contentMetadata.promoted) {
                toneItem.featuredTitles.push({ 'lang': 'en', 'name': contentMetadata.featuredTitleEn });
                toneItem.featuredTitles.push({ 'lang': 'ar', 'name': contentMetadata.featuredTitleAr });
                toneItem.featuredDescriptions.push({ 'lang': 'en', 'description': contentMetadata.featuredDescriptionEn });
                toneItem.featuredDescriptions.push({ 'lang': 'ar', 'description': contentMetadata.featuredDescriptionAr });
            }

            // Charging Details
            if (contentMetadata.chargingDetails) {

                // The "Charging Period" field should default to "30 DAYS." and should be non-editable, as per the STC requirement. Reset the value to 30 if it is different.
                contentMetadata.chargingDetails.chargingPeriod.duration = 30;
                contentMetadata.chargingDetails.chargingPeriod.unit = $scope.DURATION_UNITS[0].key;

                toneItem.offers = [
                    {
                        "chargingPeriodDetail": UtilService.convertSimpleObjectToPeriod(contentMetadata.chargingDetails.chargingPeriod),
                        "chargingPeriod": contentMetadata.chargingDetails.chargingPeriod.duration,
                        "price": contentMetadata.chargingDetails.price,
                        "originalPrice": contentMetadata.chargingDetails.originalPrice,
                        "subscriptionCode": contentMetadata.chargingDetails.subscriptionCode,
                        "revSharePolicy": contentMetadata.chargingDetails.revSharePolicy,
                        "settlementType": contentMetadata.chargingDetails.settlementType
                    }
                ];
            }

            // File Handling
            var coverImage = contentMetadata.coverImage;
            var cardImage = contentMetadata.cardImage;
            var toneFile = contentMetadata.toneFile;
            var mp3File = contentMetadata.mp3File;

            var originalCoverId = original.coverImageId;
            var originalCardId = original.cardImageId;
            var originalToneFileId = original.toneFileId;
            var originalMp3FileId = original.mp3FileId;

            var preUploadedCard= false;
            var newCardId= null;

            var postUploadTasks = [];
            var filesToDeleteAfterSuccess = [];

            function bestEffortDelete(fileId) {
                if (!fileId) return $q.when();
                return ContentManagementService.deleteFile(fileId)["catch"](angular.noop);
            }

            // Card Image (to be pre-uploaded if present)
            var cardRemoved  = (!cardImage || !cardImage.name) && !!originalCardId;
            var cardReplaced = (cardImage && cardImage.name && (cardImage instanceof File));

            if (cardRemoved) {
                toneItem.cardImageId = "";
                filesToDeleteAfterSuccess.push(originalCardId);
            } else if (cardReplaced) {
                newCardId = UtilService.generateObjectId();
                toneItem.cardImageId = newCardId;

                if (originalCardId) {
                    filesToDeleteAfterSuccess.push(originalCardId);
                }
            } else {
                toneItem.cardImageId = originalCardId; // unchanged
            }

            // Cover Image
            var coverRemoved  = (!coverImage || !coverImage.name) && !!originalCoverId;
            var coverReplaced = (coverImage && coverImage.name && (coverImage instanceof File));

            if (coverRemoved) {
                toneItem.coverImageId = "";
                filesToDeleteAfterSuccess.push(originalCoverId);
            } else if (coverReplaced) {
                toneItem.coverImageId = originalCoverId || UtilService.generateObjectId();
                postUploadTasks.push(function () {
                    return ContentManagementService.uploadFile(
                        coverImage,
                        coverImage.name,
                        toneItem.coverImageId
                    );
                });
            } else {
                toneItem.coverImageId = originalCoverId;
            }

            // Tone File
            var toneRemoved  = (!toneFile || !toneFile.name) && !!originalToneFileId;
            var toneReplaced = (toneFile && toneFile.name && (toneFile instanceof File));

            if (toneRemoved) {
                toneItem.toneFileId = null;
                filesToDeleteAfterSuccess.push(originalToneFileId);
            } else if (toneReplaced) {
                toneItem.toneFileId = originalToneFileId || UtilService.generateObjectId();

                postUploadTasks.push(function () {
                    return ContentManagementService.uploadFile(
                        toneFile,
                        toneFile.name,
                        toneItem.toneFileId
                    );
                });
            } else {
                toneItem.toneFileId = originalToneFileId;
            }

            // Mp3 File
            var mp3Removed  = (!mp3File || !mp3File.name) && !!originalMp3FileId;
            var mp3Replaced = (mp3File && mp3File.name && (mp3File instanceof File));

            if (mp3Removed) {
                toneItem.mp3FileId = null;
                filesToDeleteAfterSuccess.push(originalMp3FileId);
            } else if (mp3Replaced) {
                toneItem.mp3FileId = originalMp3FileId || UtilService.generateObjectId();

                postUploadTasks.push(function () {
                    return ContentManagementService.uploadFile(
                        mp3File,
                        mp3File.name,
                        toneItem.mp3FileId
                    );
                });
            } else {
                toneItem.mp3FileId = originalMp3FileId;
            }

            // Copyright Files
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
            _.each(contentMetadata.copyrightFileList, function (copyrightFile) {
                if (copyrightFile.copyrightFile && copyrightFile.copyrightFile.name && (copyrightFile.copyrightFile instanceof File)) {
                    postUploadTasks.push(function () {
                        return ContentManagementService.uploadFile(
                            copyrightFile.copyrightFile,
                            copyrightFile.copyrightFile.name,
                            copyrightFile.fileId
                        );
                    });
                }
            });

            $log.debug('Updating tone (resolved file IDs): ', toneItem);

            function runPostUploadsAndCleanup() {
                var tasks = [];

                angular.forEach(postUploadTasks, function (fn) {
                    tasks.push(fn());
                });

                angular.forEach(filesToDeleteAfterSuccess, function (fileId) {
                    tasks.push(bestEffortDelete(fileId));
                });

                return $q.all(tasks);
            }

            // Chain
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
                    $log.debug('Updating tone: ', toneItem);
                    return ContentManagementService.updateTone(toneItem);
                })
                .then(function (response) {
                    if (!response) {
                        var err = new Error('Tone update failed');
                        err.apiResponse = response;
                        throw err;
                    }

                    $log.debug('Update Success. Response: ', response);

                    // After metadata success:
                    //  - upload remaining files (cover, tone, mp3, copyright)
                    //  - delete old files marked for removal
                    return runPostUploadsAndCleanup()
                        .then(function () {
                            notification.flash({
                                type: 'success',
                                text: $translate.instant('PartnerInfo.Contents.RBT.ContentMetadatas.Tones.Messages.UpdateFlowStartedSuccessful')
                            });

                            $scope.cancel();
                        });
                })
                .catch(function (err) {
                    $log.error('Cannot complete tone update flow. Error: ', err);

                    var cleanup = [];

                    // If we pre-uploaded a new card image and something failed (metadata or later),
                    // roll it back. Other uploads are never started if metadata fails.
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
                                text: $translate.instant('PartnerInfo.Contents.RBT.ContentMetadatas.Tones.Messages.UpdateFlowError')
                            });
                        }
                    });
                });

        };
    });


})();
