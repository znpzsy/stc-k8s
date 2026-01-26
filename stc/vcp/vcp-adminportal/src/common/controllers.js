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

    ApplicationControllers.factory('AdmPortalMainPromiseTracker', function (promiseTracker) {
        return promiseTracker();
    });

    ApplicationControllers.factory('AdmPortalDashboardPromiseTracker', function (promiseTracker) {
        return promiseTracker();
    });

    ApplicationControllers.factory('AdmPortalNotificationListPromiseTracker', function (promiseTracker) {
        return promiseTracker();
    });

    ApplicationControllers.controller('MainController', function ($scope, $rootScope, $state, $interval, $timeout, $window, SessionService,
                                                                  AdmPortalDashboardPromiseTracker, AdmPortalNotificationListPromiseTracker) {
        $rootScope.showTitleSpinner = false;

        // Watcher for main promise indicator (loading state spinner layer)
        $rootScope.$watch(AdmPortalDashboardPromiseTracker.active, function (isActive) {
            $rootScope.showTitleSpinner = isActive;
        });

        $rootScope.showNotificationListSpinner = false;

        // Watcher for main notification list indicator
        $rootScope.$watch(AdmPortalNotificationListPromiseTracker.active, function (isActive) {
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
                    $state.reload();
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
            if (newDate) {
                $scope.dateHolder.startDate = $scope.calculateDate($scope.dateHolder.startDate, newDate.getHours(), newDate.getMinutes());
            }
        };
        $scope.updateEndDate = function (newDate) {
            if (newDate !== undefined) {
                $scope.dateHolder.endDate = $scope.calculateDate(newDate, $scope.dateHolder.endTime.getHours(), $scope.dateHolder.endTime.getMinutes());
            }
        };
        $scope.updateEndDateTime = function (newDate) {
            if (newDate) {
                $scope.dateHolder.endDate = $scope.calculateDate($scope.dateHolder.endDate, newDate.getHours(), newDate.getMinutes());
            }
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

    ApplicationControllers.controller('AlertModalInstanceCtrl', function ($scope, $uibModalInstance, $log) {
        $log.debug('AlertModalInstanceCtrl');

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });

    ApplicationControllers.controller('ConfirmationModalInstanceCtrl', function ($scope, $controller, $uibModalInstance, $log) {
        $log.debug('ConfirmationModalInstanceCtrl');

        $controller('AlertModalInstanceCtrl', {
            $scope: $scope,
            $uibModalInstance: $uibModalInstance
        });

        $scope.ok = function () {
            $uibModalInstance.close();
        };
    });

    ApplicationControllers.controller('DistributionModalInstanceCtrl', function ($scope, $uibModalInstance, $log, $filter, NgTableParams, NgTableService,
                                                                                 servicePriceData, fullPrice, remainingPrice) {
        $log.debug('DistributionModalInstanceCtrl');
        $scope.originalPrice = fullPrice
        $scope.remainingPrice = remainingPrice;
        var serviceData = servicePriceData;
        $scope.calculate = function (value,i){
            if (!value){
                serviceData[i].price = "";
                serviceData[i].percentage = 0;
            }
            else if(value>$scope.remainingPrice){
                var sum = 0;
                for(var k=0; k<serviceData.length; k++){
                    if (serviceData[k].price && i!==k)
                        sum+=serviceData[k].price
                }
                serviceData[i].price = Math.min($scope.originalPrice - sum, value);
                serviceData[i].percentage = ((serviceData[i].price*100) / $scope.originalPrice).toFixed(1);
            }
            else{
                serviceData[i].percentage = ((value*100) / $scope.originalPrice).toFixed(1);
            }
            var sum = 0
            for(var j=0; j<serviceData.length; j++){
                if (serviceData[j].price)
                    sum+=serviceData[j].price
            }
            $scope.remainingPrice = $scope.originalPrice - sum;
        }
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
                var filteredListData = NgTableService.filterList(filterText, filterColumns, serviceData);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : serviceData;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });



        $scope.ok = function () {
            $uibModalInstance.close(serviceData);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

    });

    ApplicationControllers.controller('OrganizationsModalInstanceCtrl', function ($scope, $uibModalInstance, $log, $filter, NgTableParams, NgTableService, CMPFService,
                                                                                  Restangular, organizationParameter, itemName, allOrganizations, organizationsModalTitleKey) {
        $log.debug('OrganizationsModalInstanceCtrl');

        $scope.selected = {
            organization: organizationParameter
        };

        $scope.itemName = itemName;
        $scope.organizationsModalTitleKey = organizationsModalTitleKey;

        $scope.allOrganizations = Restangular.stripRestangular(allOrganizations);

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
                var organizations = angular.copy($scope.allOrganizations.partners);

                if (!organizations) {
                    organizations = angular.copy($scope.allOrganizations.networkOperators);
                }

                if (!organizations) {
                    organizations = angular.copy($scope.allOrganizations.organizations);
                }

                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, organizations);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : organizations;
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

        $scope.removeSelection = function () {
            $scope.selected.organization = {};
        };

        $scope.ok = function () {
            $uibModalInstance.close($scope.selected);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

    });

    ApplicationControllers.controller('ScreeningsListsCtrl', function ($scope, $log, $filter, $uibModalInstance, NgTableParams, listParameter,
                                                                       scopeNameParameter, modalTitleParameter) {
        $log.debug('ScreeningsListsCtrl');

        $scope.list = listParameter;
        $scope.modalTitle = modalTitleParameter;
        $scope.scopeName = scopeNameParameter;

        $scope.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "screenableCorrelator": 'asc'
            }
        }, {
            total: $scope.list.length, // length of organizations
            $scope: $scope,
            getData: function ($defer, params) {
                var orderedData = params.sorting() ? $filter('orderBy')($scope.list, params.orderBy()) : $scope.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

        $scope.close = function () {
            $uibModalInstance.close();
        };
    });

    ApplicationControllers.controller('ScreeningsConstraintsCtrl', function ($scope, $log, $uibModalInstance, scopeParameter, NgTableParams, DAYS_OF_WEEK) {
        $log.debug('ScreeningsConstraintsCtrl');

        $log.debug("Scope parameter: ", scopeParameter);

        $scope.screeningScope = scopeParameter;

        var selectedMode = $scope.screeningScope.selectedScreeningModeType;
        var selectedModeDetails = _.findWhere($scope.screeningScope.screeningModes, {screeningModeType: selectedMode});
        var absoluteTimeConstraint;
        var recurringTimeConstraint;
        if (selectedModeDetails) {
            absoluteTimeConstraint = selectedModeDetails.absoluteTimeConstraint;
            recurringTimeConstraint = selectedModeDetails.recurringTimeConstraint;
        }

        if (absoluteTimeConstraint) {
            $scope.absoluteTimeConstraint = absoluteTimeConstraint;
        } else if (recurringTimeConstraint) {
            $scope.recurringTimeConstraint = selectedModeDetails.recurringTimeConstraint;

            $scope.days = [
                {active: false, day: DAYS_OF_WEEK[0]},
                {active: false, day: DAYS_OF_WEEK[1]},
                {active: false, day: DAYS_OF_WEEK[2]},
                {active: false, day: DAYS_OF_WEEK[3]},
                {active: false, day: DAYS_OF_WEEK[4]},
                {active: false, day: DAYS_OF_WEEK[5]},
                {active: false, day: DAYS_OF_WEEK[6]}
            ];

            var daysOfWeek = $scope.recurringTimeConstraint.daysOfWeek;
            for (var i = 0; i < daysOfWeek.length; i++) {
                var activeDay = daysOfWeek[i];
                $scope.days[activeDay - 1].active = true;
            }
        }

        $scope.close = function () {
            $uibModalInstance.close();
        };
    });

    ApplicationControllers.controller('OffersModalInstanceCtrl', function ($scope, $uibModalInstance, $log, $filter, NgTableParams, NgTableService, CMPFService,
                                                                           Restangular, offerParameter, itemName, allOffers, offersModalTitleKey) {
        $log.debug('OffersModalInstanceCtrl');

        $scope.selected = {
            offer: offerParameter
        };

        $scope.itemName = itemName;
        $scope.offersModalTitleKey = offersModalTitleKey;

        $scope.allOffers = Restangular.stripRestangular(allOffers);

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
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.allOffers.offers);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.allOffers.offers;
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

        $scope.removeSelection = function () {
            $scope.selected.offer = {};
        };

        $scope.ok = function () {
            $uibModalInstance.close($scope.selected);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
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
                    headerKey: 'Subsystems.Provisioning.Services.Id'
                },
                {
                    fieldName: 'name',
                    headerKey: 'Subsystems.Provisioning.Services.Name'
                },
                {
                    fieldName: 'state',
                    headerKey: 'Subsystems.Provisioning.Services.State'
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
                    headerKey: 'Subsystems.ContentManagement.Operations.ContentMetadatas.Id'
                },
                {
                    fieldName: 'name',
                    headerKey: 'Subsystems.ContentManagement.Operations.ContentMetadatas.Name'
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

        $scope.playAudio = function(rowIndex, audioFileId, path) {
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
                var srcUrl = path ? path : ContentManagementService.generateFilePath(audioFileId);
                FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                    var blobUrl= '';
                    if(blob) {
                        audioFile = blob;
                        audioFile.name = fileName;
                        blobUrl = URL.createObjectURL(audioFile);
                    }
                    var audioElement = new Audio(blobUrl);

                    audioElement.play().then(function() {
                        $scope.audio.isLoading = false;
                        $scope.audio.element = audioElement;
                        $log.debug('audio playing:', $scope.audio, audioElement);
                        //$scope.$apply(); // Update the view
                    }).catch(function(error) {
                        $log.debug('Error downloading audio file:', error);
                        $scope.audio.isLoading = false;
                        $scope.audio['error_'+ rowIndex + '_' + audioFileId] = true;
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



})();
