(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning.operations.users.accounts.bulkmessagingpolicies', []);

    var ProvisioningUsersAccountsBulkMessagingPoliciesOperationsModule = angular.module('adminportal.subsystems.provisioning.operations.users.accounts.bulkmessagingpolicies');

    ProvisioningUsersAccountsBulkMessagingPoliciesOperationsModule.controller('ProvisioningUsersAccountsBulkMessagingPoliciesOperationsCtrl', function ($scope, $uibModal, $log) {
        $log.debug("ProvisioningUsersAccountsBulkMessagingPoliciesOperationsCtrl");

        $scope.hstep = 1;
        $scope.mstep = 1;

        $scope.dateFormat = 'MMMM d, y';
        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1,
            showWeeks: false
        };

        $scope.bulkSMSPolicyQuotaStartDateDay = {
            opened: false
        };
        $scope.bulkSMSPolicyQuotaExpiryDateDay = {
            opened: false
        };

        $scope.bulkMMSPolicyQuotaStartDateDay = {
            opened: false
        };
        $scope.bulkMMSPolicyQuotaExpiryDateDay = {
            opened: false
        };

        $scope.openDatePicker = function ($event, datePicker) {
            $event.preventDefault();
            $event.stopPropagation();
            datePicker.opened = true;
        };

        var defaultBulkUserPolicyProfile = {
            // Main flags
            "isModerated": false,
            "isApiAccessAllowed": false,
            // Ip address
            "isIpAddressListRestricted": false,
            "PermissibleIpAddresses": [],
            // Time contraints
            "isTimeConstraintEnforced": false,
            "TimeConstraints": [],
        };

        var defaultBulkSMSPolicyProfile = {
            "SenderMsisdn": null,
            // Alphanumeric sender list
            "isAlphanumericSenderListRestricted": false,
            "PermissibleAlphanumericSenders": [],
            // Main flags
            "isOffNetDeliveryAllowed": false,
            "isOffnetSenderListRestricted": false,
            "PermissibleOffnetSenders": [],
            "isDisableChargingAllowed": false,
            // Quota
            "isQuotaLimited": false,
            "AvailableQuotaAmount": null,
            "QuotaStartDate": new Date(),
            "QuotaExpiryDate": new Date(),
            "isQuotaRefundedUponDeliveryFailure": false,
            // Throughput
            "isThroughputLimited": false,
            "ThroughputLimit": null
        };

        var defaultBulkMMSPolicyProfile = {
            "ChargingMsisdn": null,
            // Alphanumeric sender list
            "isAlphanumericSenderListRestricted": false,
            "PermissibleAlphanumericSenders": [],
            // Main flags
            "isOffNetDeliveryAllowed": false,
            "isForwardTrackingAllowed": false,
            "isDisableChargingAllowed": false,
            // Quota
            "isQuotaLimited": false,
            "AvailableQuotaAmount": null,
            "QuotaStartDate": new Date(),
            "QuotaExpiryDate": new Date(),
            "isQuotaRefundedUponDeliveryFailure": false,
            // Throughput
            "isThroughputLimited": false,
            "ThroughputLimit": null
        };

        // Assign the default Bulk User and SMS profile if the user account does not have one.
        if ($scope.userAccount) {
            $scope.userAccount.bulkUserPolicyProfile = $scope.userAccount.bulkUserPolicyProfile ? $scope.userAccount.bulkUserPolicyProfile : defaultBulkUserPolicyProfile;
            $scope.userAccount.bulkSMSPolicyProfile = $scope.userAccount.bulkSMSPolicyProfile ? $scope.userAccount.bulkSMSPolicyProfile : defaultBulkSMSPolicyProfile;
            $scope.userAccount.bulkMMSPolicyProfile = $scope.userAccount.bulkMMSPolicyProfile ? $scope.userAccount.bulkMMSPolicyProfile : defaultBulkMMSPolicyProfile;
        }

        // Permissible Offnet Sender list editing methods
        $scope.addUpdatePermissibleOffnetSender = function (userAccount, profileName, permissibleOffnetSender) {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/users/operations.users.accounts.bulkmessagingpolicies.offnetsender.modal.html',
                controller: function ($scope, $uibModalInstance, userAccount, permissibleOffnetSender) {
                    $scope.userAccount = userAccount;

                    if (permissibleOffnetSender) {
                        $scope.permissibleOffnetSender = permissibleOffnetSender;
                    }

                    $scope.permissibleOffnetSenderOriginal = angular.copy(permissibleOffnetSender);
                    $scope.isNotChanged = function () {
                        return angular.equals($scope.permissibleOffnetSenderOriginal, $scope.permissibleOffnetSender);
                    };

                    $scope.save = function (permissibleOffnetSender) {
                        var response = {
                            oldValue: $scope.permissibleOffnetSenderOriginal,
                            newValue: permissibleOffnetSender
                        };

                        $uibModalInstance.close(response);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'md',
                resolve: {
                    userAccount: function () {
                        return userAccount;
                    },
                    permissibleOffnetSender: function () {
                        return angular.copy(permissibleOffnetSender);
                    }
                }
            });

            modalInstance.result.then(function (response) {
                var oldValue = response.oldValue;
                var newValue = response.newValue;

                // If the value was not already defined on the list
                if (!_.findWhere(userAccount[profileName].PermissibleOffnetSenders, {value: newValue.value})) {
                    // If it is editing or not
                    if (newValue.id) {
                        var permissibleOffnetSenderItem = _.findWhere(userAccount[profileName].PermissibleOffnetSenders, {id: newValue.id})
                        permissibleOffnetSenderItem.value = newValue.value;
                    } else if (oldValue) {
                        var permissibleOffnetSenderItem = _.findWhere(userAccount[profileName].PermissibleOffnetSenders, {value: oldValue.value})
                        permissibleOffnetSenderItem.value = newValue.value;
                    } else {
                        if (!userAccount[profileName].PermissibleOffnetSenders) {
                            userAccount[profileName].PermissibleOffnetSenders = [];
                        }

                        userAccount[profileName].PermissibleOffnetSenders.push({value: newValue.value});
                    }
                }
            }, function () {
            });
        };
        $scope.removePermissibleOffnetSender = function (userAccount, profileName, permissibleOffnetSender) {
            if (userAccount[profileName].PermissibleOffnetSenders) {
                var deletingItem = _.findWhere(userAccount[profileName].PermissibleOffnetSenders, {value: permissibleOffnetSender.value});
                userAccount[profileName].PermissibleOffnetSenders = _.without(userAccount[profileName].PermissibleOffnetSenders, deletingItem);
            }
        };

        // Permissible Alphanumeric Sender list editing methods
        $scope.addUpdatePermissibleAlphanumericSender = function (userAccount, profileName, permissibleAlphanumericSender) {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/users/operations.users.accounts.bulkmessagingpolicies.alphanumericsender.modal.html',
                controller: function ($scope, $uibModalInstance, userAccount, permissibleAlphanumericSender) {
                    $scope.userAccount = userAccount;

                    if (permissibleAlphanumericSender) {
                        $scope.permissibleAlphanumericSender = permissibleAlphanumericSender;
                    }

                    $scope.permissibleAlphanumericSenderOriginal = angular.copy(permissibleAlphanumericSender);
                    $scope.isNotChanged = function () {
                        return angular.equals($scope.permissibleAlphanumericSenderOriginal, $scope.permissibleAlphanumericSender);
                    };

                    $scope.save = function (permissibleAlphanumericSender) {
                        var response = {
                            oldValue: $scope.permissibleAlphanumericSenderOriginal,
                            newValue: permissibleAlphanumericSender
                        };

                        $uibModalInstance.close(response);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'md',
                resolve: {
                    userAccount: function () {
                        return userAccount;
                    },
                    permissibleAlphanumericSender: function () {
                        return angular.copy(permissibleAlphanumericSender);
                    }
                }
            });

            modalInstance.result.then(function (response) {
                var oldValue = response.oldValue;
                var newValue = response.newValue;

                // If the value was not already defined on the list
                if (!_.findWhere(userAccount[profileName].PermissibleAlphanumericSenders, {value: newValue.value})) {
                    // If it is editing or not
                    if (newValue.id) {
                        var permissibleAlphanumericSenderItem = _.findWhere(userAccount[profileName].PermissibleAlphanumericSenders, {id: newValue.id})
                        permissibleAlphanumericSenderItem.value = newValue.value;
                    } else if (oldValue) {
                        var permissibleAlphanumericSenderItem = _.findWhere(userAccount[profileName].PermissibleAlphanumericSenders, {value: oldValue.value})
                        permissibleAlphanumericSenderItem.value = newValue.value;
                    } else {
                        if (!userAccount[profileName].PermissibleAlphanumericSenders) {
                            userAccount[profileName].PermissibleAlphanumericSenders = [];
                        }

                        userAccount[profileName].PermissibleAlphanumericSenders.push({value: newValue.value});
                    }
                }
            }, function () {
            });
        };
        $scope.removePermissibleAlphanumericSender = function (userAccount, profileName, permissibleAlphanumericSender) {
            if (userAccount[profileName].PermissibleAlphanumericSenders) {
                var deletingItem = _.findWhere(userAccount[profileName].PermissibleAlphanumericSenders, {value: permissibleAlphanumericSender.value});
                userAccount[profileName].PermissibleAlphanumericSenders = _.without(userAccount[profileName].PermissibleAlphanumericSenders, deletingItem);
            }
        };

        // Permissible IP Address list editing methods
        $scope.addUpdatePermissibleIpAddress = function (userAccount, profileName, permissibleIpAddress) {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/users/operations.users.accounts.bulkmessagingpolicies.ipaddress.modal.html',
                controller: function ($scope, $uibModalInstance, userAccount, permissibleIpAddress) {
                    $scope.userAccount = userAccount;

                    if (permissibleIpAddress) {
                        $scope.permissibleIpAddress = permissibleIpAddress;
                    }

                    $scope.permissibleIpAddressOriginal = angular.copy(permissibleIpAddress);
                    $scope.isNotChanged = function () {
                        return angular.equals($scope.permissibleIpAddressOriginal, $scope.permissibleIpAddress);
                    };

                    $scope.save = function (permissibleIpAddress) {
                        var response = {
                            oldValue: $scope.permissibleIpAddressOriginal,
                            newValue: permissibleIpAddress
                        };

                        $uibModalInstance.close(response);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'md',
                resolve: {
                    userAccount: function () {
                        return userAccount;
                    },
                    permissibleIpAddress: function () {
                        return angular.copy(permissibleIpAddress);
                    }
                }
            });

            modalInstance.result.then(function (response) {
                var oldValue = response.oldValue;
                var newValue = response.newValue;

                // If the value was not already defined on the list
                if (!_.findWhere(userAccount[profileName].PermissibleIpAddresses, {value: newValue.value})) {
                    // If it is editing or not
                    if (newValue.id) {
                        var permissibleIpAddressItem = _.findWhere(userAccount[profileName].PermissibleIpAddresses, {id: newValue.id})
                        permissibleIpAddressItem.value = newValue.value;
                    } else if (oldValue) {
                        var permissibleIpAddressItem = _.findWhere(userAccount[profileName].PermissibleIpAddresses, {value: oldValue.value})
                        permissibleIpAddressItem.value = newValue.value;
                    } else {
                        if (!userAccount[profileName].PermissibleIpAddresses) {
                            userAccount[profileName].PermissibleIpAddresses = [];
                        }

                        userAccount[profileName].PermissibleIpAddresses.push({value: newValue.value});
                    }
                }
            }, function () {
            });
        };
        $scope.removePermissibleIpAddress = function (userAccount, profileName, permissibleIpAddress) {
            if (userAccount[profileName].PermissibleIpAddresses) {
                var deletingItem = _.findWhere(userAccount[profileName].PermissibleIpAddresses, {value: permissibleIpAddress.value});
                userAccount[profileName].PermissibleIpAddresses = _.without(userAccount[profileName].PermissibleIpAddresses, deletingItem);
            }
        };

        // Time Constraint list editing methods
        $scope.addUpdateTimeConstraint = function (userAccount, timeConstraint) {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/users/operations.users.accounts.bulkmessagingpolicies.timeconstraint.modal.html',
                controller: function ($scope, $uibModalInstance, userAccount, timeConstraint, UtilService, DAYS_OF_WEEK) {
                    $scope.userAccount = userAccount;

                    $scope.DAYS_OF_WEEK = DAYS_OF_WEEK;

                    $scope.hstep = 1;
                    $scope.mstep = 5;

                    $scope.dateFormat = 'MMMM d, y';
                    $scope.dateOptions = {
                        formatYear: 'yy',
                        startingDay: 1,
                        showWeeks: false
                    };

                    $scope.timeConstraint = {
                        startDay: 1,
                        startTime: UtilService.getTodayBegin(),
                        endDay: 1,
                        endTime: UtilService.calculateDate(UtilService.getTodayEnd(), 23, 30)
                    };

                    var convertToDayAndTime = function (durationInMinutes) {
                        var minutes = durationInMinutes % 60;
                        var hours = ((durationInMinutes - minutes) / 60) % 24;
                        var days = Math.floor(((durationInMinutes - minutes) / 60) / 24);

                        return {days: days, hours: hours, minutes: minutes};
                    };

                    var calculateDurationInMinutes = function (day, time) {
                        return ((day - 1) * 24 * 60) + (moment(time).get('hour') * 60) + moment(time).get('minute');
                    };

                    if (timeConstraint && timeConstraint.value && timeConstraint.value.split('-').length > 0) {
                        $scope.timeConstraint.id = timeConstraint.id;

                        var timeConstraints = timeConstraint.value.split('-');

                        var startTimeInMinutes = Number(timeConstraints[0]);
                        var startDayTime = convertToDayAndTime(startTimeInMinutes);
                        $scope.timeConstraint.startDay = startDayTime.days + 1;
                        $scope.timeConstraint.startTime.setHours(startDayTime.hours);
                        $scope.timeConstraint.startTime.setMinutes(startDayTime.minutes);

                        var endTimeInMinutes = Number(timeConstraints[1]);
                        var endDayTime = convertToDayAndTime(endTimeInMinutes);
                        $scope.timeConstraint.endDay = endDayTime.days + 1;
                        $scope.timeConstraint.endTime.setHours(endDayTime.hours);
                        $scope.timeConstraint.endTime.setMinutes(endDayTime.minutes);
                    }

                    $scope.timeConstraintOriginal = angular.copy(timeConstraint);
                    $scope.isNotChanged = function () {
                        return angular.equals($scope.timeConstraintOriginal, $scope.timeConstraint);
                    };

                    var checkRangeValidity = function () {
                        var startInMinutes = calculateDurationInMinutes($scope.timeConstraint.startDay, $scope.timeConstraint.startTime);
                        var endInMinutes = calculateDurationInMinutes($scope.timeConstraint.endDay, $scope.timeConstraint.endTime);

                        return (startInMinutes > endInMinutes);
                    };

                    $scope.$watch('timeConstraint.startDay', function (newValue, oldValue) {
                        if (newValue && newValue !== oldValue) {
                            UtilService.setError($scope.form, 'timeConstraintStartDay', 'maxDateExceeded', !checkRangeValidity());
                            UtilService.setError($scope.form, 'timeConstraintEndDay', 'minDateExceeded', true);
                        }
                    });
                    $scope.$watch('timeConstraint.startTime', function (newValue, oldValue) {
                        if (newValue && newValue !== oldValue) {
                            UtilService.setError($scope.form, 'timeConstraintStartDay', 'maxDateExceeded', !checkRangeValidity());
                            UtilService.setError($scope.form, 'timeConstraintEndDay', 'minDateExceeded', true);
                        }
                    });
                    $scope.$watch('timeConstraint.endDay', function (newValue, oldValue) {
                        if (newValue && newValue !== oldValue) {
                            UtilService.setError($scope.form, 'timeConstraintStartDay', 'maxDateExceeded', true);
                            UtilService.setError($scope.form, 'timeConstraintEndDay', 'minDateExceeded', !checkRangeValidity());
                        }
                    });
                    $scope.$watch('timeConstraint.endTime', function (newValue, oldValue) {
                        if (newValue && newValue !== oldValue) {
                            UtilService.setError($scope.form, 'timeConstraintStartDay', 'maxDateExceeded', true);
                            UtilService.setError($scope.form, 'timeConstraintEndDay', 'minDateExceeded', !checkRangeValidity());
                        }
                    });

                    $scope.save = function (timeConstraint) {
                        var startInMinutes = calculateDurationInMinutes(timeConstraint.startDay, timeConstraint.startTime);
                        var endInMinutes = calculateDurationInMinutes(timeConstraint.endDay, timeConstraint.endTime);
                        var timeConstraintStr = startInMinutes + '-' + endInMinutes;
                        var timeConstraintCmpfObj = {
                            value: timeConstraintStr
                        };
                        if (timeConstraint.id) {
                            timeConstraintCmpfObj.id = timeConstraint.id;
                        }

                        var response = {
                            oldValue: $scope.timeConstraintOriginal,
                            newValue: timeConstraintCmpfObj
                        };

                        $uibModalInstance.close(response);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'md',
                resolve: {
                    userAccount: function () {
                        return userAccount;
                    },
                    timeConstraint: function () {
                        return angular.copy(timeConstraint);
                    }
                }
            });

            modalInstance.result.then(function (response) {
                var oldValue = response.oldValue;
                var newValue = response.newValue;

                // If the value was not already defined on the list
                if (!_.findWhere(userAccount.bulkUserPolicyProfile.TimeConstraints, {value: newValue.value})) {
                    // If it is editing or not
                    if (newValue.id) {
                        var timeConstraintItem = _.findWhere(userAccount.bulkUserPolicyProfile.TimeConstraints, {id: newValue.id})
                        timeConstraintItem.value = newValue.value;
                    } else if (oldValue) {
                        var timeConstraintItem = _.findWhere(userAccount.bulkUserPolicyProfile.TimeConstraints, {value: oldValue.value})
                        timeConstraintItem.value = newValue.value;
                    } else {
                        if (!userAccount.bulkUserPolicyProfile.TimeConstraints) {
                            userAccount.bulkUserPolicyProfile.TimeConstraints = [];
                        }

                        userAccount.bulkUserPolicyProfile.TimeConstraints.push({value: newValue.value});
                    }
                }
            }, function () {
            });
        };
        $scope.removeTimeConstraint = function (userAccount, timeConstraint) {
            if (userAccount.bulkUserPolicyProfile.TimeConstraints) {
                var deletingItem = _.findWhere(userAccount.bulkUserPolicyProfile.TimeConstraints, {value: timeConstraint.value});
                userAccount.bulkUserPolicyProfile.TimeConstraints = _.without(userAccount.bulkUserPolicyProfile.TimeConstraints, deletingItem);
            }
        };
    });

})();
