(function () {

    'use strict';

    angular.module('ccportal.screening-lists.factories', []);

    var ScreeningListsFactoriesModule = angular.module('ccportal.screening-lists.factories');

    ScreeningListsFactoriesModule.factory('ScreeningManagerHelper', function (Restangular, UtilService) {
        return {
            purifyScreeningMode: function (currentScope) {
                if (!angular.isUndefined(currentScope.screeningScope)) {
                    delete(currentScope.screeningScope.whiteList);
                    delete(currentScope.screeningScope.blackList);
                }

                return currentScope;
            },
            resetScreeningMode: function (defaultModeType) {
                var screeningMode = {
                    modeType: defaultModeType,
                    timeConstraintAvailable: false,
                    timeConstraintType: 'absolute',
                    absolute: {
                        active: false,
                        startDate: {},
                        startTime: {},
                        endDate: {},
                        endTime: {}
                    },
                    recurring: {
                        active: false,
                        startTime: {},
                        endTime: {},
                        daysOfWeek: [0, 0, 0, 0, 0, 0, 0],
                        masks: {},
                        timeExcluded: false
                    }
                };

                return screeningMode;
            },
            initializeDateTimeFields: function ($scope) {
                $scope.hstep = 1;
                $scope.mstep = 1;

                // Absolute date time assignments, initializations and watcher functions.
                $scope.screeningMode.absolute.startDate = UtilService.getTodayBegin();
                $scope.screeningMode.absolute.startTime = UtilService.getTodayBegin();
                $scope.screeningMode.absolute.endDate = UtilService.getTodayEnd();
                $scope.screeningMode.absolute.endTime = UtilService.getTodayEnd();

                $scope.updateStartDate = function () {
                    $scope.screeningMode.absolute.startDate = UtilService.calculateDate($scope.screeningMode.absolute.startDate, $scope.screeningMode.absolute.startTime.getHours(), $scope.screeningMode.absolute.startTime.getMinutes());
                };
                $scope.updateStartDateTime = function () {
                    $scope.screeningMode.absolute.startDate = UtilService.calculateDate($scope.screeningMode.absolute.startDate, $scope.screeningMode.absolute.startTime.getHours(), $scope.screeningMode.absolute.startTime.getMinutes());

                    if ($scope.screeningMode.absolute.endDate < $scope.screeningMode.absolute.startDate) {
                        $scope.screeningMode.absolute.endDate = UtilService.calculateDate($scope.screeningMode.absolute.endDate, $scope.screeningMode.absolute.startTime.getHours(), $scope.screeningMode.absolute.startTime.getMinutes());
                        $scope.screeningMode.absolute.endTime = UtilService.calculateDate($scope.screeningMode.absolute.endTime, $scope.screeningMode.absolute.startTime.getHours(), $scope.screeningMode.absolute.startTime.getMinutes());
                    }
                };
                $scope.updateEndDate = function () {
                    $scope.screeningMode.absolute.endDate = UtilService.calculateDate($scope.screeningMode.absolute.endDate, $scope.screeningMode.absolute.endTime.getHours(), $scope.screeningMode.absolute.endTime.getMinutes());
                };
                $scope.updateEndDateTime = function () {
                    $scope.screeningMode.absolute.endDate = UtilService.calculateDate($scope.screeningMode.absolute.endDate, $scope.screeningMode.absolute.endTime.getHours(), $scope.screeningMode.absolute.endTime.getMinutes());

                    if ($scope.screeningMode.absolute.endDate < $scope.screeningMode.absolute.startDate) {
                        $scope.screeningMode.absolute.startDate = UtilService.calculateDate($scope.screeningMode.absolute.startDate, $scope.screeningMode.absolute.endTime.getHours(), $scope.screeningMode.absolute.endTime.getMinutes());
                        $scope.screeningMode.absolute.startTime = UtilService.calculateDate($scope.screeningMode.absolute.startTime, $scope.screeningMode.absolute.endTime.getHours(), $scope.screeningMode.absolute.endTime.getMinutes());
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

                // Recurring date time assignments, initializations and watcher functions.
                $scope.screeningMode.recurring.startTime = UtilService.getTodayBegin();
                $scope.screeningMode.recurring.endTime = UtilService.getTodayEnd();
                $scope.updateStartTime = function (form) {
                    if ($scope.screeningMode.recurring.endTime < $scope.screeningMode.recurring.startTime) {
                        $scope.screeningMode.recurring.endTime = UtilService.calculateDate($scope.screeningMode.recurring.endTime, $scope.screeningMode.recurring.startTime.getHours(), $scope.screeningMode.recurring.startTime.getMinutes());
                    }

                    $scope.updateTimeRangeViewer($scope.screeningMode.recurring.startTime, $scope.screeningMode.recurring.endTime);

                    UtilService.setError(form, 'startTime', 'maxTimeExceeded', true);
                };
                $scope.updateEndTime = function (form) {
                    if ($scope.screeningMode.recurring.endTime < $scope.screeningMode.recurring.startTime) {
                        $scope.screeningMode.recurring.startTime = UtilService.calculateDate($scope.screeningMode.recurring.startTime, $scope.screeningMode.recurring.endTime.getHours(), $scope.screeningMode.recurring.endTime.getMinutes());
                    }

                    $scope.updateTimeRangeViewer($scope.screeningMode.recurring.startTime, $scope.screeningMode.recurring.endTime);

                    UtilService.setError(form, 'startTime', 'maxTimeExceeded', true);
                };
            }
        }
    });

})();
