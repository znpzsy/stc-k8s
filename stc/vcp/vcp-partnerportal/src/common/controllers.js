(function () {

    'use strict';

    /* Controllers */
    angular.module('Application.controllers', [
        'ajoslin.promise-tracker'
    ]);

    var ApplicationControllers = angular.module('Application.controllers');

    ApplicationControllers.controller('LanguageController', function ($scope, $rootScope, $translate) {

        $scope.items = [
            {label: 'Language.Items.English', key: 'en'}
        ];

        $scope.showCurrentLanguage = function () {
            var currLangKey = $translate.use();
            angular.forEach($scope.items, function (lang, index) {
                if (lang.key === currLangKey) {
                    $scope.language = $scope.items[index];
                    return;
                }
            });
        };

        $scope.showCurrentLanguage();
        $rootScope.$on('$translateChangeSuccess', function () {
            $scope.showCurrentLanguage();
        });

        $scope.changeLanguage = function (lang) {
            $translate.use(lang.key);
            $scope.language = lang;
        };

    });

    ApplicationControllers.factory('PartnerPortalMainPromiseTracker', function (promiseTracker) {
        return promiseTracker();
    });

    ApplicationControllers.factory('PartnerPortalDashboardPromiseTracker', function (promiseTracker) {
        return promiseTracker();
    });

    ApplicationControllers.factory('PartnerPortalNotificationListPromiseTracker', function (promiseTracker) {
        return promiseTracker();
    });

    ApplicationControllers.controller('MainController', function ($scope, $rootScope, $state, $interval, $timeout, $window, SessionService,
                                                                  PartnerPortalDashboardPromiseTracker, PartnerPortalNotificationListPromiseTracker) {
        $rootScope.showTitleSpinner = false;

        // Watcher for main promise indicator (loading state spinner layer)
        $rootScope.$watch(PartnerPortalDashboardPromiseTracker.active, function (isActive) {
            $rootScope.showTitleSpinner = isActive;
        });

        $rootScope.showNotificationListSpinner = false;

        // Watcher for main notification list indicator
        $rootScope.$watch(PartnerPortalNotificationListPromiseTracker.active, function (isActive) {
            $rootScope.showNotificationListSpinner = isActive;
        });

        // This session checker controls the session validity. If there is no valid session, redirects the state
        // to the login page.
        SessionService.sessionChecker = $interval(function () {
            // Update current session token
            var sessionKey = SessionService.getSessionKey();
            SessionService.setAuthorizationHeader(sessionKey.token);

            if (SessionService.isSessionValid() && $state.current.name === 'login') {
                $timeout(function () {
                    $state.reload()
                }, 0);
            }
        }, 3000);
    });

    ApplicationControllers.controller('GenericDateTimeCtrl', function ($scope, UtilService) {
        $scope.getOneWeekAgo = UtilService.getOneWeekAgo;
        $scope.getOneDayAgo = UtilService.getOneDayAgo;
        $scope.getTodayBegin = UtilService.getTodayBegin;
        $scope.getTodayEnd = UtilService.getTodayEnd;
        $scope.calculateDate = UtilService.calculateDate;

        $scope.hstep = 1;
        $scope.mstep = 1;

        // Filter initializations
        $scope.dateHolder = {
            startDate: $scope.getTodayBegin(),
            startTime: $scope.getTodayBegin(),
            endDate: $scope.getTodayEnd(),
            endTime: $scope.getTodayEnd()
        };

        $scope.dateFilter = $scope.dateHolder;

        $scope.updateStartDate = function (newDate) {
            if (newDate !== undefined) {
                $scope.dateHolder.startDate = $scope.calculateDate(newDate, $scope.dateHolder.startTime.getHours(), $scope.dateHolder.startTime.getMinutes());
            }
        };
        $scope.updateStartDateTime = function (newDate) {
            $scope.dateHolder.startDate = $scope.calculateDate($scope.dateHolder.startDate, newDate.getHours(), newDate.getMinutes());
        };
        $scope.updateEndDate = function (newDate) {
            if (newDate !== undefined) {
                $scope.dateHolder.endDate = $scope.calculateDate(newDate, $scope.dateHolder.endTime.getHours(), $scope.dateHolder.endTime.getMinutes());
            }
        };
        $scope.updateEndDateTime = function (newDate) {
            $scope.dateHolder.endDate = $scope.calculateDate($scope.dateHolder.endDate, newDate.getHours(), newDate.getMinutes());
        };

        $scope.dateFormat = 'MMMM d, y';
        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1,
            showWeeks: false
        };

        $scope.openStartDatePicker = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.startDatePicker = {
                opened: true
            };
        };
        $scope.openEndDatePicker = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.endDatePicker = {
                opened: true
            };
        };

    });

    ApplicationControllers.controller('ConfirmationModalInstanceCtrl', function ($scope, $uibModalInstance, $log) {
        $log.debug('ConfirmationModalInstanceCtrl');

        $scope.ok = function () {
            $uibModalInstance.close();
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });

    ApplicationControllers.controller('OffersModalInstanceCtrl', function ($scope, $uibModalInstance, $log, $filter, NgTableParams, NgTableService, Restangular,
                                                                           CMPFService, modalTitleKey, entityParameter, offers) {
        $log.debug('OffersModalInstanceCtrl');

        $scope.modalTitleKey = modalTitleKey;
        $scope.entity = entityParameter;

        $scope.offers = Restangular.stripRestangular(offers);
        $scope.offers.offers = $filter('orderBy')($scope.offers.offers, ['id']);
        $scope.offerList = angular.copy($scope.offers.offers);

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'id',
                    headerKey: 'PartnerInfo.Offers.Id'
                },
                {
                    fieldName: 'name',
                    headerKey: 'PartnerInfo.Offers.Name'
                },
                {
                    fieldName: 'state',
                    headerKey: 'PartnerInfo.Offers.State'
                }
            ]
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
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.offers.offers);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.offers.offers;
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
            $uibModalInstance.close();
        };
    });

    ApplicationControllers.controller('ServicesModalInstanceCtrl', function ($scope, $uibModalInstance, $log, $filter, NgTableParams, NgTableService, Restangular,
                                                                             CMPFService, modalTitleKey, entityParameter, services) {
        $log.debug('ServicesModalInstanceCtrl');

        $scope.modalTitleKey = modalTitleKey;
        $scope.entity = entityParameter;

        $scope.services = services;
        $scope.services = $filter('orderBy')($scope.services, ['id']);
        $scope.serviceList = angular.copy($scope.services);

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'id',
                    headerKey: 'PartnerInfo.Services.Id'
                },
                {
                    fieldName: 'name',
                    headerKey: 'PartnerInfo.Services.Name'
                },
                {
                    fieldName: 'state',
                    headerKey: 'PartnerInfo.Services.State'
                }
            ]
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
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.services);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.services;
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

        $scope.ok = function () {
            $uibModalInstance.close();
        };
    });

    ApplicationControllers.controller('ContentsModalInstanceCtrl', function ($scope, $uibModalInstance, $log, $filter, NgTableParams, NgTableService, Restangular,
                                                                             CMPFService, modalTitleKey, entityParameter, contents) {
        $log.debug('ContentsModalInstanceCtrl');

        $scope.modalTitleKey = modalTitleKey;
        $scope.entity = entityParameter;

        $scope.contents = contents.detail.contentList;
        $scope.contents = $filter('orderBy')($scope.contents, ['id']);
        $scope.contentList = angular.copy($scope.contents);

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'id',
                    headerKey: 'PartnerInfo.Contents.ContentMetadatas.Id'
                },
                {
                    fieldName: 'name',
                    headerKey: 'PartnerInfo.Contents.ContentMetadatas.Name'
                },
                {
                    fieldName: 'status',
                    headerKey: 'CommonLabels.State'
                }
            ]
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
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.contents);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.contents;
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

        $scope.ok = function () {
            $uibModalInstance.close();
        };
    });

    ApplicationControllers.controller('ListViewsAudioController', function ($scope, $log, FileDownloadService, ContentManagementService) {

        // ---- Audio Player, Audio File Handling
        $scope.stopAudio = function(index, audioFileId) {
            $log.debug('$scope.stopAudio, index:', index, ', audioFileId:', audioFileId, 'audio: ', $scope.audio);
            var Id = index + '_' + audioFileId;
            if ($scope.audio.element) {
                $scope.audio.element.pause();
                if($scope.audio.elementId !== Id){
                    $scope.audio.element.currentTime = 0;
                    URL.revokeObjectURL($scope.audio.element.src); // Release memory used by the blob
                    $scope.audio.element = null;
                }
            }
        }

        $scope.audio = {
            elementId: null, // HTML audio id (rowIndex + '_' + audioFileId)
            element: null, // HTML audio
            isLoading: false, // Loading state for spinner,
            isPlaying: function(id) {
                if (this.element) {
                    return this.elementId == id && !this.element.paused && !this.element.ended && this.element.readyState > 2;
                }
                return false;
            },
            checkId: function(rowIndex, audioFileId) { return this.elementId === rowIndex + '_' + audioFileId; },
            canDisplayButton: function(rowIndex, audioFileId, buttonType) {
                if (buttonType === 'play') {
                    return !this.checkId(rowIndex, audioFileId) || (!this.isPlaying(rowIndex + '_' + audioFileId) && !this.isLoading);
                } else if (buttonType === 'spinner') {
                    return this.checkId(rowIndex, audioFileId) && this.isLoading;
                } else if(buttonType === 'stop') {
                    return this.element && this.isPlaying(rowIndex + '_' + audioFileId);
                }
                return false;
            },
            getLabel: function(rowIndex, audioFileId) {
                var lbl= 'CommonLabels.DownloadAndPlay';
                if(this.checkId(rowIndex, audioFileId)){
                    if(this.canDisplayButton(rowIndex, audioFileId, 'spinner')){
                        lbl = 'CommonLabels.Loading';
                    } else if(this.canDisplayButton(rowIndex, audioFileId, 'stop')) {
                        lbl = 'CommonLabels.Stop';
                    } else if(this.canDisplayButton(rowIndex, audioFileId, 'play')) {
                        lbl = 'CommonLabels.Play';
                    }
                }
                return lbl;
            }
        };

        $scope.playAudio = function(rowIndex, audioFileId) {
            var elemId = rowIndex + '_' + audioFileId;
            $log.debug('playAudio: elemId,', elemId,' $scope.audio,', $scope.audio, 'rowIndex:', rowIndex, ', audioFileId:', audioFileId);

            // If the user is trying to resume playing the same audio file
            if(!$scope.audio.isLoading && $scope.audio.element){
                // If the exact file was already retreived
                if($scope.audio.checkId(rowIndex, audioFileId)){
                    if(!$scope.audio.isPlaying(elemId)){
                        $scope.audio.element.play();
                    } else {
                        $scope.stopAudio(rowIndex, audioFileId);
                    }
                    return;
                }
            }

            // If the user is trying to play a different audio file, download the file
            if(!$scope.audio.checkId(rowIndex, audioFileId)) {
                $scope.stopAudio(rowIndex, audioFileId);
                // Download the audio file by id value
                $scope.audio.isLoading = true;
                $scope.audio.elementId = elemId;
                var audioFile = {name: undefined};
                var srcUrl = ContentManagementService.generateFilePath(audioFileId);
                FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                    audioFile = blob;
                    if (blob) {
                        audioFile.name = fileName;
                    }
                    var blobUrl = URL.createObjectURL(audioFile);
                    var audioElement = new Audio(blobUrl);

                    audioElement.play().then(function() {
                        $scope.audio.isLoading = false;
                        $scope.audio.element = audioElement;
                        $log.debug('audio playing:', $scope.audio, audioElement);
                        //$scope.$apply(); // Update the view
                    }).catch(function(error) {
                        $log.debug('Error downloading audio file:', error);
                        $scope.audio.isLoading = false;
                        //$scope.$apply();
                    });
                });
            }
        };

        // Cleanup event on scope destroy to avoid memory leaks
        $scope.$on('$destroy', function() {
            $log.debug('ListViewsAudioController $destroy');
            $scope.stopAudio();
        });

        // END ---- Audio Player, Audio File Handling
    });


    ApplicationControllers.controller('AllowedCategoriesCommonCtrl', function ($scope, $log, $q, $state, $controller, $filter, $uibModal, UtilService, SessionService) {
        $log.debug('AllowedCategoriesCommonCtrl');

        $scope.sessionOrganization = SessionService.getSessionOrganization();
        $scope.username = SessionService.getUsername();
        $scope.availableCategories = SessionService.getRbtAllowedCategories();


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

        $scope.showAllowedCategories = function (selectedSubcategories, onSelectionCallback, config) {
            // Merge default config with passed config
            var modalConfig = angular.extend({
                disableSelection: false,
                readOnly: false
            }, config);

            $log.debug("modalConfig: " + modalConfig);

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.allowed.category.html',
                size: 'md',
                controller: 'AllowedCategoriesModalPopupCtrl',
                resolve: {
                    allowedCategories: function (SessionService) {
                        return SessionService.getRbtAllowedCategories();
                    },
                    selectedSubcategories: function () {
                        return selectedSubcategories;
                    },
                    config: function () {
                        return modalConfig;
                    }
                }
            });

            modalInstance.result.then(function(selectedSubcategories) {
                if (typeof onSelectionCallback === 'function') {
                    $log.debug('onSelectionCallback: ', selectedSubcategories);
                    onSelectionCallback(selectedSubcategories);
                }
            }, function () {
                $log.debug('Modal closed');
            })
        };

        $scope.setIds = function(idList, entityList) {
            if(entityList && entityList.length > 0) {
                idList = _.pluck(entityList, 'id');
            } else {
                idList = [];
                entityList = [];
            }
            $log.debug('Content - list of [id]: ', idList);

            // Broadcast the event with the updated id's
            $scope.$broadcast('subcategoryIdsUpdated', idList);
        }

        $scope.removeSelection = function(idList, entityList, index) {
            $log.debug('Content - removing: ', entityList[index], idList);
            entityList.splice(index, 1);
            $scope.setIds(idList, entityList);
            $log.debug('Content - removed: ', idList, entityList);
        };

    });


    ApplicationControllers.controller('AllowedCategoriesModalPopupCtrl', function($scope, $log, $controller, $uibModalInstance, $filter, NgTableParams, NgTableService, Restangular, CMPFService, allowedCategories, selectedSubcategories, config) {


        $log.debug('AllowedCategoriesModalPopupCtrl');
        $controller('AllowedCategoriesCommonCtrl', {$scope: $scope});

        $scope.config = config;
        $scope.selectedSubcategories = angular.copy(selectedSubcategories);
        $scope.selectedSubcategoriesOriginal = angular.copy(selectedSubcategories);
        $scope.selected_general = _.filter($scope.selectedSubcategories, function (item) {
            return $scope.isGeneral(item);
        });
        $scope.selected_others = _.filter($scope.selectedSubcategories, function (item) {
            return $scope.isIVR(item) || $scope.isUSSD(item);
        });

        $scope.serviceProviderAllowedCategoryProfiles = $filter('orderBy')(allowedCategories, ['categoryName','subCategoryName']);

        $scope.getCategoryString = function (categoryProfile) {
            var resultStr = 'Category: ' + categoryProfile.categoryName + ', Subcategory: ' + categoryProfile.subCategoryName ;
            return resultStr;
        };
        $scope.getSubcategoryId = function (categoryProfile) {
            var resultStr = 'Subcategory ID: ' + categoryProfile.subcategory.id ;
            return resultStr;
        };

        $scope.listData = [];
        var categoriesMap = {};
        _.each($scope.serviceProviderAllowedCategoryProfiles, function(item) {
            var categoryId = item.MainCategoryID;
            var subcategoryId = item.SubCategoryID;

            if (!categoriesMap[subcategoryId]) {
                // Add subcategory with its corresponding category details
                categoriesMap[subcategoryId] = angular.extend({}, item.subcategory, {
                    category: item.category
                });
                $scope.listData.push(categoriesMap[subcategoryId]);
            }
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

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.subcategoriesList.tableParams.settings().$scope.filterText = filterText;
            $scope.subcategoriesList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.subcategoriesList.tableParams.page(1);
            $scope.subcategoriesList.tableParams.reload();
        }, 750);

        $scope.isSubcategorySelected = function(id) {
            return _.findIndex($scope.selectedSubcategories, {id: id}) > -1;
        };

        // Modal Actions:
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

    });



})();
