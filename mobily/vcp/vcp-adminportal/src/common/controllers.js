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

})();
