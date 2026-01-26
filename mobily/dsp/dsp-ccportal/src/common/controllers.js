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

    ApplicationControllers.factory('CCPortalMainPromiseTracker', function (promiseTracker) {
        return promiseTracker();
    });

    ApplicationControllers.controller('MainController', function ($scope, $rootScope, $state, $interval, $timeout, $window, SessionService) {

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
                    headerKey: 'SubscriberInfo.Services.Offers.Id'
                },
                {
                    fieldName: 'name',
                    headerKey: 'SubscriberInfo.Services.Offers.Name'
                },
                {
                    fieldName: 'state',
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
                    headerKey: 'SubscriberInfo.Services.Contents.Id'
                },
                {
                    fieldName: 'name',
                    headerKey: 'SubscriberInfo.Services.Contents.Name'
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

    ApplicationControllers.controller('ConfirmationModalInstanceCtrl', function ($scope, $uibModalInstance, $log) {
        $log.debug('ConfirmationModalInstanceCtrl');

        $scope.ok = function () {
            $uibModalInstance.close();
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });

})();
