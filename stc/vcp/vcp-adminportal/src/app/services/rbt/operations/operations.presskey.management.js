(function () {

    'use strict';

    angular.module('adminportal.services.rbt.operations.presskey.management', [
        'adminportal.services.rbt.operations.presskey.management.new',
        'adminportal.services.rbt.operations.presskey.management.update'
    ])
        // Common functions for file upload/download
        //.service('RbtPromotionFilesService', function($log, Upload, $timeout, notification, $translate, FileDownloadService, SERVICES_BASE) {
        .service('RBTPressKeyManagementService', function($log, Upload, $timeout, notification, $translate, RBTConfService, FileDownloadService, SERVICES_BASE) {

            this.generatePath = function(isBasePath, type, key, params) {
                var apiPath = '/crbt-rest/v1/configurations/enhancedPressOne/promotions/';
                var srcUrl = apiPath + type + '/' + key;
                if (params && params.length > 0) {
                    srcUrl += '/' + params.join('/');
                }
                $log.debug('Generated path: ', srcUrl);
                return isBasePath ? SERVICES_BASE + srcUrl : srcUrl;
            };

            // Function to download a file
            this.downloadFile = function(srcUrl, successCallback, errorCallback) {
                FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, filename, status) {
                    if (status === 200) {
                        if(successCallback) successCallback(blob, filename);
                    } else {
                        $log.debug('Failed to download the file:', status);
                        notification({
                            type: 'warning',
                            text: status + ' - ' + $translate.instant('CommonMessages.GenericServerError')
                        });
                        if(errorCallback) errorCallback(blob, filename, status);
                    }
                });
            };

            // Function to upload a file
            this.uploadFile = function(file, httpMethod, srcUrl, successCallback, errorCallback, eventCallback) {
                $log.debug('Uploading file: ', file);

                file.upload = Upload.http({
                    method: httpMethod,
                    url: srcUrl,
                    headers: {
                        'Content-Type': 'application/octet-stream'
                    },
                    data: file
                });

                file.upload.then(function (response) {
                    $log.debug('Uploaded file. response: ', response);

                    $timeout(function () {
                        file.result = response.data;

                        if (response.data && response.data.errorCode) {
                            notification({
                                type: 'warning',
                                text: response.data.errorCode + ' - ' + response.data.detail
                            });
                            if (errorCallback) errorCallback(response);
                        } else {
                            notification({
                                type: 'success',
                                text: $translate.instant('CommonMessages.FileUploadSucceded')
                            });
                            if (successCallback) successCallback(response);
                        }
                    });
                }, function (response) {
                    $log.debug('Upload error. response: ', response);
                    if (response.data && response.data.errorCode) {
                        notification({
                            type: 'warning',
                            text: response.data.errorCode + ' - ' + response.data.detail
                        });
                    }
                    if (errorCallback) errorCallback(response);
                }, function (evt) {
                    // Math.min is to fix IE which reports 200% sometimes
                    file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                    if(eventCallback) eventCallback(evt);
                    $log.debug('Upload event: ', evt);
                });
            };

            this.uploadFormData = function (paidPromptFile, freePromptFile, path) {
                var fd = new FormData();
                fd.append('paidPrompt', paidPromptFile);
                fd.append('freePrompt', freePromptFile);

                return RBTConfService.uploadPrompt(fd, path);
            }
        });

    var RBTOperationsPressKeyManagementModule = angular.module('adminportal.services.rbt.operations.presskey.management');

    RBTOperationsPressKeyManagementModule.config(function ($stateProvider) {

        $stateProvider.state('services.rbt.operations.presskey.management', {
            url: "/management",
            template: '<div ui-view></div>'
        })
            // State for listing all press key promotions
            .state('services.rbt.operations.presskey.management.list', {
            url: "/list",
            templateUrl: "services/rbt/operations/operations.presskey.management.html",
            controller: 'RBTOperationsPressKeyManagementCtrl',
            data: {
                // View header keys
                pageHeaderKey: 'Services.RBT.Operations.PressKey.Title',
                subPageHeaderKey: 'Services.RBT.Operations.PressKey.Management.Title',
                // States
                listState: "services.rbt.operations.presskey.management.list",
                newState: "services.rbt.operations.presskey.management.new",
                updateState: "services.rbt.operations.presskey.management.update"

            },
            resolve: {
                promotions: function (RBTConfService) {
                    return RBTConfService.getPromotions();
                }
            }
        })
    });

    RBTOperationsPressKeyManagementModule.controller('RBTOperationsPressKeyManagementCommonCtrl', function ($scope, $state, $stateParams, $log) {
        $log.debug('RBTOperationsPressKeyManagementCommonCtrl');
        $scope.listState = $state.current.data.listState;

        $scope.update = function(promotionData) {
            var dtmfKey = encodeURIComponent(promotionData.dtmf);
            var promotionType = promotionData.promotionType.toLowerCase();
            var serviceOfferName = promotionData.serviceOfferName;

            var state = $state.current.data.updateState + '.' + promotionType;
            $log.debug('Update state: ', state);
            $state.go(state, { dtmfKey: dtmfKey, promotionType: promotionType, serviceOfferName: serviceOfferName });
        }

        $scope.addNew = function(promotionData) {
            var dtmfKey = encodeURIComponent(promotionData.dtmf);
            $state.go($state.current.data.newState, { dtmfKey: dtmfKey });
        }

    });

    RBTOperationsPressKeyManagementModule.controller('RBTOperationsPressKeyManagementCtrl', function ($scope, $state, $log, $controller, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                                RBTConfService, RBT_DTMF_KEYS, promotions) {
        $log.debug('RBTOperationsPressKeyManagementCtrl');
        $controller('RBTOperationsPressKeyManagementCommonCtrl', {$scope: $scope});

        $scope.RBT_DTMF_KEYS = RBT_DTMF_KEYS;

        $scope.promotions = promotions ? promotions : [];

        // Function to add missing DTMF keys with promotionType: NONE
        $scope.addMissingKeys = function() {
            var dtmfKeysInResponse = $scope.promotions.map(function(item) {
                return item.dtmf;
            });

            $scope.RBT_DTMF_KEYS.forEach(function(key) {
                // If no configuration has been made for the key yet, add it with promotionType: NONE
                if (dtmfKeysInResponse.indexOf(key) === -1) {
                    $scope.promotions.push({
                        copyFreePromptId: 0,
                        copyPaidPromptId: 0,
                        dtmf: key,
                        promotionType: "NONE",
                        servicePromptId: 0,
                        toneInfoMap: {
                            entry: []
                        }
                    });
                }
            });
        };

        // Call the function to add missing DTMF keys
        $scope.addMissingKeys();


        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'dtmf',
                    headerKey: 'Services.RBT.Operations.PressKey.Management.TableColumns.DTMF'
                },
                {
                    fieldName: 'promotionType',
                    headerKey: 'Services.RBT.Operations.PressKey.Management.TableColumns.PromotionType',
                }
            ]
        };

        // Promotion list
        $scope.promotionList = {
            list: $scope.promotions ? $scope.promotions : [],
            tableParams: {}
        };

        $scope.promotionList.tableParams = new NgTableParams({
            page: 1,
            count: 15,
            sorting: {
                "dtmf": 'asc'
            }
        }, {
            total: $scope.promotionList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.promotionList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.promotionList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Promotion list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.promotionList.tableParams.settings().$scope.filterText = filterText;
            $scope.promotionList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.promotionList.tableParams.page(1);
            $scope.promotionList.tableParams.reload();
        }, 750);

        $scope.remove = function (entry) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing dtmf press key promotion entry: ', entry);
                RBTConfService.deletePromotion(entry.dtmf, entry.promotionType, entry.serviceOfferName).then(function (response) {
                    $log.debug('Removed dtmf press key promotion entry: ', entry, ', response: ', response);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    // $scope.promotionList.tableParams.reload();
                    $state.reload();
                }, function (response) {
                    $log.debug('Cannot delete dtmf press key entry: ', entry, ', response: ', response);
                });
            });
        };
    });


    RBTOperationsPressKeyManagementModule.controller('RBTOperationsPressKeyManagementToneSelectionModalInstanceCtrl', function ($controller, $uibModalInstance, $q, $scope, $log, $state, $timeout, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                                Restangular, FileDownloadService, RBTPressKeyManagementService, CMPFService, DateTimeConstants, ContentManagementService, WorkflowsService, SessionService, CMS_RBT_STATUS_TYPES, allOrganizations) {
        $log.debug('RBTOperationsPressKeyManagementToneSelectionModalInstanceCtrl');
        $controller('ListViewsAudioController', {$scope: $scope});

        $scope.CMS_RBT_STATUS_TYPES = CMS_RBT_STATUS_TYPES;

        var organizations = Restangular.stripRestangular(allOrganizations);
        $scope.allOrganizations = $filter('orderBy')(organizations.organizations, 'id');
        $scope.username = SessionService.getUsername();
        $scope.selectedTone = {};
        $scope.loading_tone = [];

        $scope.dateFilter = {
            status: 'ACTIVE',
            blacklisted: false,
            promoted: true,
            subscriptionEnabled: true,
            alias: '',
            categoryId: null,
            artistId: null,
            playlistId: null
        };

        // --- Filter Form / Search Filters:
        $scope.$watch('dateFilter.categoryId', function (newVal, oldVal) {
            if (!_.isUndefined(newVal) && newVal !== null && newVal !== oldVal) {
                $scope.dateFilter.subcategory = null;
            }
        });

        $scope.searchCategories = _.throttle(function (text) {
            $scope.contentCategoryList = [];

            ContentManagementService.searchContentCategoriesRBT(0, 100, text).then(function (response) {
                $scope.contentCategoryList = response ? response.items : [];
                $scope.contentCategoryList = $filter('orderBy')($scope.contentCategoryList, ['organizationName']);
                $log.debug('Content categories: ', $scope.contentCategoryList);
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
                artistId: dateFilter.artistId
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
        $scope.toneSelected = function(tone) {
            $scope.selectedTone = tone;
            $log.debug('Selected tone: ', tone);
        };

        $scope.ok = function () {
            $uibModalInstance.close($scope.selectedTone);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.removeSelection = function () {
            $scope.selectedTone = null;
            $scope.stopAudio();
        };
        // END --- Modal Actions

    });

})();
