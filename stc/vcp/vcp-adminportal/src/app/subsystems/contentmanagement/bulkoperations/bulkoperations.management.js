(function () {

    'use strict';

    angular.module('adminportal.subsystems.contentmanagement.bulkoperations.management', []);

    var ContentManagementOperationsBulkRBTModule = angular.module('adminportal.subsystems.contentmanagement.bulkoperations.management');

    ContentManagementOperationsBulkRBTModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.contentmanagement.bulkoperations.management', {
            abstract: true,
            url: "",
            template: '<div ui-view></div>'
        })
            // list state
            .state('subsystems.contentmanagement.bulkoperations.management.list', {
                url: "/list",
                templateUrl: "subsystems/contentmanagement/bulkoperations/bulkoperations.management.html",
                controller: 'ContentManagementBulkOperationsManagementCtrl',
                resolve: {
                    allOrganizations: function (CMPFService) {
                        return CMPFService.getAllOrganizationsCustom(false, true, [CMPFService.OPERATOR_PROFILE]);
                    },
                    categoryList: function (ContentManagementService) {
                        return ContentManagementService.searchContentCategoriesRBT(0, 500, null, null);
                    },
                    subcategoryList: function (ContentManagementService) {
                        return ContentManagementService.searchSubcategoriesRBT(0, 500, null, null);
                    }
                }
            })

    });


    ContentManagementOperationsBulkRBTModule.controller('ContentManagementBulkOperationsManagementCommonCtrl', function ($scope, $log, $q, $translate, $uibModal, $timeout, $window, $state, $controller, $filter, notification, NgTableParams, NgTableService,
                                                                                                                         Restangular, UtilService, SessionService, ContentManagementService, CMPFService, FileDownloadService, CMS_RBT_STATUS_TYPES,
                                                                                                                         allOrganizations, categoryList, subcategoryList) {
        $log.debug('ContentManagementBulkOperationsManagementCommonCtrl');


        $controller('GenericDateTimeCtrl', {$scope: $scope});

        $scope.CMS_RBT_STATUS_TYPES = CMS_RBT_STATUS_TYPES;
        $scope.CMS_RBT_BULK_ACTIONS = {
            'PENDING': ['reject', 'activate', 'move'],
            'REJECTED': ['inactivate', 'move'],
            'ACTIVE': ['inactivate', 'hide', 'suspend', 'move'],
            'HIDDEN': ['activate', 'suspend', 'inactivate', 'move'],
            'SUSPENDED': ['activate', 'hide', 'inactivate', 'move'],
            'INACTIVE': ['move']
        };

        $scope.availableActions = ['move'];

        var organizations = Restangular.stripRestangular(allOrganizations);
        $scope.allOrganizations = $filter('orderBy')(organizations.organizations, 'id');

        $scope.categoryList = _.filter(categoryList.items, function (category) {

            if(category.accessChannels.indexOf('IVR')==-1 && category.accessChannels.indexOf('USSD')==-1) {
                return category;
            }
        });
        $scope.subcategoryList = _.filter(subcategoryList.items, function (subcategory) {

            if(subcategory.accessChannels.indexOf('IVR')==-1 && subcategory.accessChannels.indexOf('USSD')==-1) {
                return subcategory;
            }
        });

        $scope.username = SessionService.getUsername();
        $scope.sessionOrganization = SessionService.getSessionOrganization();
        $scope.selectAll = false;
        $scope.selectedTones = [];
        $scope.preSelectedTones = [];
        $scope.loading_tone = [];

        $scope.actionFilter = {};

        $scope.dateFilter = {
            status: undefined,
            startDate: undefined,
            endDate: undefined,
            blacklisted: undefined,
            promoted: undefined,
            subscriptionEnabled: undefined,
            alias: '',
            categoryId: null,
            artistId: null,
            playlistId: null
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
            $scope.dateFilter.subcategory = null;
            if (!_.isUndefined(newVal) && newVal !== null && newVal !== oldVal) {
                ContentManagementService.searchSubcategoriesRBTFiltered(0, 500, null, newVal).then(function (response) {
                    $scope.subcategoryList = _.filter(response.items, function (subcategory) {

                        if(subcategory.accessChannels.indexOf('IVR')==-1 && subcategory.accessChannels.indexOf('USSD')==-1) {
                            return subcategory;
                        }
                    });
                });
            }
        });
        $scope.$watch('dateFilter.status', function(newStatus, oldStatus) {
            if (newStatus !== oldStatus) {
                $scope.throttledReloadTable();
                $scope.updateBulkOperations(newStatus);
            }
        });

        $scope.updateBulkOperations = function(status) {
            // Set the available actions for the selected status
            $scope.availableActions = $scope.CMS_RBT_BULK_ACTIONS[status] || ['move'];
        };

        // END --- Filter Form / Search Filters

    });


    ContentManagementOperationsBulkRBTModule.controller('ContentManagementBulkOperationsManagementCtrl', function ($scope, $log, $q, $translate, $uibModal, $timeout, $window, $state, $controller, $filter, notification, NgTableParams, NgTableService,
                                                                                                                   Restangular, UtilService, SessionService, ContentManagementService, CMPFService, ReportingExportService,
                                                                                                                   FileDownloadService, CMS_RBT_STATUS_TYPES, allOrganizations, categoryList, subcategoryList) {
        $log.debug('ContentManagementBulkOperationsManagementCtrl');

        $controller('GenericDateTimeCtrl', {$scope: $scope});
        $controller('ListViewsAudioController', {$scope: $scope});
        $controller('ContentManagementBulkOperationsManagementCommonCtrl', {$scope: $scope, allOrganizations:allOrganizations, categoryList:categoryList, subcategoryList:subcategoryList});
        $controller('ContentManagementOperationsRBTCommonCtrl', {$scope: $scope});

        // --- Results Table:
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

            result.filter = {};

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
                // TODO: Check if this is necessary
                $scope.selectedTones = [];
                $scope.selectAll = false;
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
            count: 50,
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


        // --- Table Actions:
        $scope.toneSelected = function(tone, tableData) {
            tone.selected = !tone.selected;
            $scope.updateSelection(tableData);
        };

        $scope.toggleSelectAll = function(tableData) {
            //$log.debug('toggleSelectAll - $scope.selectAll:', $scope.selectAll);
            $scope.updateIndeterminateState(tableData);
            angular.forEach(tableData, function (item) {
                item.selected = $scope.selectAll;
            });
            $scope.updateSelection(tableData);
        };

        $scope.isAnySelected = function (tableData) {
            return !_.isUndefined(_.findWhere(tableData, {selected: true}));
        };

        $scope.updateSelection = function(tableData) {
            $scope.selectedTones = _.filter(tableData, { selected: true });
        };

        $scope.updateIndeterminateState = function(tableData) {
            var selectedCount = _.filter(tableData, {selected: true}).length;
            if (selectedCount === 0) {
                $scope.selectAll = !$scope.selectAll;
            } else if (selectedCount === tableData.length) {
                $scope.selectAll = !$scope.selectAll;
            } else {
                $scope.selectAll = ($scope.isAnySelected(tableData) && $scope.selectAll===false) ? true : !$scope.selectAll;
            }
            //$log.debug('updateIndeterminateState, $scope.selectAll:', $scope.selectAll);
        }

        $scope.downloadCopyrightFiles = function(copyrights){
            if (copyrights && copyrights.length > 0) {
                _.each(copyrights, function (copyrightFile) {
                    var copyrightFileItem = {};

                    copyrightFileItem.id = _.uniqueId();
                    copyrightFileItem.copyrightFile = {name: undefined};
                    copyrightFileItem.fileId = copyrightFile.id;

                    // Get the CopyrightFile by id value.
                    var srcUrl = ContentManagementService.generateFilePath(copyrightFileItem.fileId);
                    FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                        copyrightFileItem.copyrightFile = blob;
                        if (blob) {
                            var fileTitle = (copyrightFile.startDate ? '_' + moment(copyrightFile.startDate).format('YYYYMMDD') : '' + copyrightFile.endDate ? '_' + moment(copyrightFile.endDate).format('YYYYMMDD') : '') + fileName;

                            // Create an Object URL for the Blob
                            var fileUrl = URL.createObjectURL(blob);

                            // Open a new tab and display the PDF
                            var fileWindow = window.open();

                             if (blob.type === 'application/pdf' || fileName.endsWith('.pdf')) {
                                // If it's a PDF, display it using an embed tag
                                fileWindow.document.write('<html><head><title>PDF (' + fileTitle + ') </title></head><body><embed width="100%" height="100%" src="' + fileUrl + '" type="application/pdf"></body></html>');
                            } else if (blob.type.startsWith('image/') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png') || fileName.endsWith('.gif')) {
                                // If it's an image, display it in an img tag
                                fileWindow.document.write('<html><head><title>Image (' + fileTitle + ')</title></head><body><img src="' + fileUrl + '" width="100%" height="auto"></body></html>');
                            } else if (blob.type.startsWith('text/')) {
                                // If it's a text file, display it as plain text
                                fileWindow.document.write('<html><head><title>Text (' + fileTitle + ')</title></head><body><pre>' + blob + '</pre></body></html>');
                            } else {
                                // If it's another type of file, you can handle it accordingly
                                fileWindow.document.write('<html><head><title>File (' + fileTitle + ')</title></head><body><a href="' + fileUrl + '" download>Download the file</a></body></html>');
                            }
                        }
                    });
                });
            }
        }

        $scope.review = function(contentMetadata){
            $log.debug('Reviewing tone: ', contentMetadata);
            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'subsystems/contentmanagement/bulkoperations/bulkoperations.management.quickreview.modal.html',
                controller: function ($scope, $uibModalInstance, contentMetadata, ContentManagementService, FileDownloadService) {
                    $scope.contentMetadata = contentMetadata;

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
                    // Get the coverImage by id value.
                    if ($scope.contentMetadata.coverImageId) {
                        $scope.contentMetadata.coverImage = {name: undefined};
                        var srcUrl = ContentManagementService.generateFilePath($scope.contentMetadata.coverImageId);
                        FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                            $scope.contentMetadata.coverImage = blob;
                            if (blob) {
                                $scope.contentMetadata.coverImage.name = fileName;
                            }
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
                        });
                    }

                    $scope.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'lg',
                resolve: {
                    contentMetadata: function () {
                        return contentMetadata;
                    }
                }
            });

            modalInstance.result.then(function () {
                $log.debug('Modal closed');
            }, function () {
                $log.debug('Modal dismissed');
            });
        }


        // END --- Table Actions

        // --- Performing Save: Bulk Operations

        function handleApiError(response, defaultMessageKey) {
            $log.debug('handleApiError, response:', response);
            var type = 'warning', message;

            if (response) {
                if (response.code > 2000 && response.code < 3000) {
                    type = 'success';
                    message = $translate.instant('CommonLabels.OperationSuccessful');
                } else if (response.code >= 3000) {
                    message = $translate.instant('CommonMessages.GenericServerError');
                } else if (response.message) {
                    message = response.message.split(':')[0] + '...';
                } else if (response.data) {
                    if (response.data.message) {
                        message = response.data.message.split(':')[0] + '...';
                    } else {
                        type = 'danger';
                        message = $translate.instant('CommonMessages.ApiError', {
                            errorCode: response.data.code ? response.data.code : response.data.status,
                            errorText: response.data.description? response.data.description: response.data.error
                        });
                    }
                } else {
                    message = $translate.instant(defaultMessageKey);
                }
            } else {
                message = $translate.instant(defaultMessageKey);
            }

            notification({ type: type, text: message });
        }

        // This method is being called two different ways
        // 1. From the panel down below the table, without passing any toneItem and a specific bulk operation. (Uses `actionFilter` to set params)
        // 2. From the data table's actions, passing a toneItem and a specific bulk operation. (Uses `toneItem` and `bulkOp` to set params)
        $scope.bulkOperation = function(toneItem, bulkOp) {
            var operationType = (bulkOp) ? bulkOp : $scope.actionFilter.selectedBulkOperation;
            var selectedItems = (toneItem && toneItem.id) ? [toneItem] : $scope.selectedTones;

            //var organizations = $scope.allOrganizations;
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/contentmanagement/bulkoperations/bulkoperations.management.confirmation.modal.html',
                controller: function ($scope, $uibModalInstance, allOrganizations, selectedItems, operationType, orgId, rejectReason) {
                    $scope.selectedItems = selectedItems;
                    $scope.allOrganizations = allOrganizations;
                    $scope.availableActions = [operationType];
                    $scope.orgId = orgId;
                    $scope.rejectReason = rejectReason;
                    $scope.filter = {
                        operationType: operationType,
                        orgId: orgId,
                        rejectReason: rejectReason
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };

                    $scope.submit = function() {
                        $scope.filter.selectedItems = $scope.selectedItems;
                        $uibModalInstance.close($scope.filter);
                    }
                },
                size: 'md',
                resolve: {
                    allOrganizations: function(){
                        return $scope.allOrganizations;
                    },
                    operationType: function(){
                        return operationType;
                    },
                    selectedItems: function () {
                        return selectedItems;
                    },
                    orgId: function(){
                        return (!bulkOp) ? $scope.actionFilter.organizationId : undefined;
                    },
                    rejectReason: function(){
                        return (!bulkOp) ? $scope.actionFilter.rejectReason : null;
                    }
                }
            });

            modalInstance.result.then(function (filter) {
                $log.debug('Performing Bulk Operation: ', filter);
                $scope.performBulkOperation(filter.selectedItems, filter.operationType, filter.orgId, filter.rejectReason)

            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });


        }

        $scope.performBulkOperation = function (selectedItems, operationType, orgId, rejectReason){

            var toneIds = _.pluck(selectedItems, 'id');
            $log.debug('performBulkOperation: operationType', operationType, ', toneIds: ', toneIds, 'rejectReason', rejectReason, ', orgId: ', orgId);

            var promise;
            switch (operationType) {
                case 'activate':
                    promise = ContentManagementService.bulkActivate(toneIds);
                    break;
                case 'inactivate':
                    promise = ContentManagementService.bulkInactivate(toneIds);
                    break;
                case 'reject':
                    promise = ContentManagementService.bulkReject(toneIds, rejectReason);
                    break;
                case 'move':
                    promise = ContentManagementService.bulkMove(toneIds, orgId);
                    break;
                case 'hide':
                    promise = ContentManagementService.bulkHide(toneIds);
                    break;
                case 'unhide':
                    promise = ContentManagementService.bulkUnhide(toneIds);
                    break;
                case 'suspend':
                    promise = ContentManagementService.bulkSuspend(toneIds);
                    break;
                case 'unsuspend':
                    promise = ContentManagementService.bulkUnsuspend(toneIds);
                    break;
                default:
                    $log.debug('Unknown operation type: ', operationType);
                    break;
            }

            promise.then(function (response) {
                $log.debug('Bulk Operation response: ', response);
                handleApiError(response, 'CommonMessages.GenericServerError');
            }, function (error) {
                $log.debug('Error: ', error);
                handleApiError(error, 'CommonMessages.GenericServerError');
            }).finally(function () {
                $scope.reloadTable($scope.contentMetadataList.tableParams);
                $scope.selectedTones = [];
                $scope.selectAll = false;
                $scope.actionFilter = {};
            });
        }
        // END --- Bulk Operations

    });

})();
