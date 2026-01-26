(function () {

    'use strict';

    angular.module('ccportal.screening-lists.mode', []);

    var ScreeningListsModeModule = angular.module('ccportal.screening-lists.mode');

    // Screening List Mode Controller
    ScreeningListsModeModule.controller('ScreeningListsModeCtrl', function ($scope, $rootScope, $log, $translate, $timeout, $state, notification, Restangular, ScreeningManagerService, ScreeningManagerHelper,
                                                                            DateTimeConstants, UtilService, DAYS_OF_WEEK, ruleTypes, scopeKey, currentScope) {
        var msisdn = UtilService.getSubscriberMsisdn();

        if (currentScope && currentScope.error_message) {
            $scope.error_message = currentScope.error_message;
            return;
        }

        if (_.isUndefined(currentScope) || _.isUndefined(currentScope.screeningScope)) {
            $scope.initializeScreeningManagerScope(currentScope);
            return;
        }

        // Purifies the current taken screening scope object.
        $scope.currentScope = ScreeningManagerHelper.purifyScreeningMode(currentScope);

        $scope.DAYS_OF_WEEK = DAYS_OF_WEEK;
        $scope.SCREENING_LISTS_MODE_TYPES = ruleTypes;

        $scope.selectedMasks = [];
        $scope.toggleMask = function (maskName) {
            var isAvailable = _.contains($scope.selectedMasks, maskName);
            if (!isAvailable) {
                $scope.selectedMasks.push(maskName);
            } else {
                $scope.selectedMasks = _.without($scope.selectedMasks, maskName);
            }
        };

        $scope.updateTimeRangeViewer = function (startTime, endTime) {
            var beginOfTheDay = UtilService.calculateDate(new Date(), 0, 0);
            var beginSpaceRange = startTime.getTime() - beginOfTheDay.getTime();
            $scope.beginSpaceRangePercent = (((beginSpaceRange / 1000 / 60) * 100) / 1440);
            var endSpaceRange = endTime.getTime() - beginOfTheDay.getTime();
            $scope.endSpaceRangePercent = (((endSpaceRange / 1000 / 60) * 100) / 1440);
        };

        // Listens mode type changes in order to reflecting to the form which is on front-end side.
        $scope.updateModeType = function (newType) {
            $timeout(function () {
                $scope.selectedMasks = [];

                $scope.screeningMode = ScreeningManagerHelper.resetScreeningMode(newType);

                // Initializes date/time pickers and necessary update event functions.
                ScreeningManagerHelper.initializeDateTimeFields($scope);

                // Initialize the time range viewer values;
                $scope.updateTimeRangeViewer(UtilService.calculateDate(new Date(), 0, 0), UtilService.calculateDate(new Date(), 23, 59));

                var foundScreeningMode = _.findWhere($scope.currentScope.screeningScope.screeningModes, {screeningModeType: newType});
                if (foundScreeningMode !== undefined) {
                    if (!_.isEmpty(foundScreeningMode.absoluteTimeConstraint)) {
                        $scope.screeningMode.timeConstraintAvailable = true;
                        $scope.screeningMode.timeConstraintType = 'absolute';

                        $scope.screeningMode.absolute.active = foundScreeningMode.absoluteTimeConstraint.activated;

                        $scope.screeningMode.absolute.startDate = new Date(moment(foundScreeningMode.absoluteTimeConstraint.startDate).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss'));
                        $scope.screeningMode.absolute.startTime = $scope.screeningMode.absolute.startDate;

                        $scope.screeningMode.absolute.endDate = new Date(moment(foundScreeningMode.absoluteTimeConstraint.endDate).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss'));
                        $scope.screeningMode.absolute.endTime = $scope.screeningMode.absolute.endDate;
                    } else if (!_.isEmpty(foundScreeningMode.recurringTimeConstraint)) {
                        $scope.screeningMode.timeConstraintAvailable = true;
                        $scope.screeningMode.timeConstraintType = 'recurring';

                        $scope.screeningMode.recurring.active = foundScreeningMode.recurringTimeConstraint.activated;

                        if (_.contains(foundScreeningMode.recurringTimeConstraint.masks, "HourOfDay")) {
                            $scope.screeningMode.recurring.masks.hoursOfDay = true;
                            $scope.toggleMask('hoursOfDay');

                            var startTime = s.words(foundScreeningMode.recurringTimeConstraint.startTime, ":");
                            $scope.screeningMode.recurring.startTime = UtilService.calculateDate(new Date(), s.toNumber(startTime[0]), s.toNumber(startTime[1]));

                            var endTime = s.words(foundScreeningMode.recurringTimeConstraint.endTime, ":");
                            $scope.screeningMode.recurring.endTime = UtilService.calculateDate(new Date(), s.toNumber(endTime[0]), s.toNumber(endTime[1]));

                            $scope.screeningMode.recurring.timeExcluded = foundScreeningMode.recurringTimeConstraint.timeExcluded;

                            $scope.updateTimeRangeViewer($scope.screeningMode.recurring.startTime, $scope.screeningMode.recurring.endTime);
                        }

                        if (_.contains(foundScreeningMode.recurringTimeConstraint.masks, "DayOfWeek")) {
                            $scope.screeningMode.recurring.masks.daysOfWeek = true;
                            $scope.toggleMask('daysOfWeek');

                            for (var i = 0; i < 7; ++i) {
                                var daysOfWeek = foundScreeningMode.recurringTimeConstraint.daysOfWeek;
                                var dayIndex = i + 1;
                                $scope.screeningMode.recurring.daysOfWeek[i] = _.contains(daysOfWeek, dayIndex) ? dayIndex : 0;
                            }
                        }
                    }

                    if (typeof $scope.originalScreeningMode === 'undefined') {
                        // Makes a copy from initialized screening mode object as an original.
                        $scope.originalScreeningMode = angular.copy($scope.screeningMode);
                    }
                }
            }, 0);
        };

        // Applies taken current scope contents to the viewed form.
        if ($scope.currentScope !== undefined && $scope.currentScope.screeningScope !== undefined && !_.isEmpty($scope.currentScope.screeningScope.screeningModes)) {
            $scope.updateModeType($scope.currentScope.screeningScope.selectedScreeningModeType);
        }

        // Checks equality between original and changed screening modes in order that understand whether anything has changed.
        $scope.isScreeningModeChanged = function () {
            return !angular.equals($scope.originalScreeningMode, $scope.screeningMode);
        };

        var validateDateTime = function (form) {
            if ($scope.screeningMode.timeConstraintAvailable) {
                if ($scope.screeningMode.timeConstraintType === 'absolute') {
                    if ($scope.screeningMode.absolute.startDate.getTime() == $scope.screeningMode.absolute.endDate.getTime()) {
                        UtilService.setError(form, 'startDate', 'maxDateExceeded', false);
                        return false;
                    }
                } else if ($scope.screeningMode.timeConstraintType === 'recurring' && $scope.screeningMode.recurring.masks.hoursOfDay) {
                    if ($scope.screeningMode.recurring.startTime.getTime() == $scope.screeningMode.recurring.endTime.getTime()) {
                        UtilService.setError(form, 'startTime', 'maxTimeExceeded', false);
                        return false;
                    }
                }
            }

            return true;
        };

        $scope.saveScreeningMode = function (form, screeningMode, isCreateScope) {
            if (!validateDateTime(form)) {
                return;
            }

            ScreeningManagerService.updateScreeningMode(scopeKey, msisdn, screeningMode).then(function (response) {
                if ((typeof response !== 'undefined') && response.errorCode === ScreeningManagerService.errorCodes.WRONG_REQUEST_ERROR) {
                    // If there is a wrong request error
                    notification({
                        type: 'warning',
                        text: $translate.instant('ScreeningLists.Messages.ScreeningModeCouldNotBeUpdated')
                    });
                } else {
                    $log.debug('Screening mode [', scopeKey, '] has been updated successfully.');

                    var currentScopeProm = ScreeningManagerService.getScopeByScopeKey(scopeKey, msisdn);
                    currentScopeProm.then(function (response) {
                        $scope.originalScreeningMode = undefined;
                        $scope.currentScope = Restangular.stripRestangular(response);

                        // Makes a copy from initialized screening mode object as an original.
                        $scope.updateModeType($scope.currentScope.screeningScope.selectedScreeningModeType);

                        var messageKey = isCreateScope ? 'ScreeningLists.Messages.ScreeningScopeCreatedSuccessfully' : 'ScreeningLists.Messages.ScreeningModeUpdatedSuccessfully';
                        var message = $translate.instant(messageKey, {name: scopeKey});
                        notification({
                            type: 'success',
                            text: message
                        });
                    }, function (response) {
                        $log.debug('Error: ', response);
                    });
                }
            }, function (response) {
                $log.debug('Error: ', response);
            });
        };

    });

})();
