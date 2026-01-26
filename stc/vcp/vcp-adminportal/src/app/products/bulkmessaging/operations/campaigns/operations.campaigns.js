(function () {

    'use strict';

    angular.module('adminportal.products.bulkmessaging.operations.campaigns', [
        'adminportal.products.bulkmessaging.operations.campaigns.bulksms',
        'adminportal.products.bulkmessaging.operations.campaigns.bulkmms',
        'adminportal.products.bulkmessaging.operations.campaigns.bulkivr'
    ]);

    var BulkMessagingCampaignsOperationsModule = angular.module('adminportal.products.bulkmessaging.operations.campaigns');

    BulkMessagingCampaignsOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('products.bulkmessaging.operations.campaigns', {
            url: "/campaigns",
            templateUrl: "products/bulkmessaging/operations/operations.campaigns.main.html",
            data: {
                permissions: [
                    'BMS__OPERATIONS_CAMPAIGN_READ'
                ]
            }
        });

    });

    BulkMessagingCampaignsOperationsModule.controller('BulkMessagingCampaignsCommonCtrl', function ($rootScope, $scope, $log, $q, $controller, $state, $stateParams, $filter, $uibModal, $translate, notification,
                                                                                                    CMPFService, SessionService, operator, userAccount, globalWhiteLists, orgDistributionLists, userDistributionLists,
                                                                                                    BMS_DISTRIBUTION_LIST_TYPES) {
        $log.debug("BulkMessagingCampaignsCommonCtrl");

        $scope.sessionOrganization = SessionService.getSessionOrganization();
        $scope.organizationId = $rootScope.systemUserOrganizationId;
        $scope.username = SessionService.getUsername();
        $scope.userId = $rootScope.systemUserId;

        // Calling the date time controller which initializes date/time pickers and necessary functions.
        $controller('GenericDateTimeCtrl', {$scope: $scope});

        $scope.BMS_DISTRIBUTION_LIST_TYPES = BMS_DISTRIBUTION_LIST_TYPES;

        $scope.bulkOrganizationProfile = CMPFService.getBulkOrganizationProfile(operator);
        // Find the user account selected on the top dropdown.
        $scope.userAccount = userAccount;
        // Extract bulk user profile and it's bulk sms policy profile to build campaign form for some logics.
        $scope.bulkUserProfile = CMPFService.extractBulkUserProfile($scope.userAccount);

        // Prepare distribution list array by types.
        $scope.globalDistributionList = $filter('orderBy')(globalWhiteLists ? globalWhiteLists.lists : [], ['name']);
        $scope.organizationDistributionList = $filter('orderBy')(orgDistributionLists ? orgDistributionLists.lists : [], ['name']);
        $scope.userDistributionList = $filter('orderBy')(userDistributionLists ? userDistributionLists.lists : [], ['name']);
        $scope.distributionListArray = [
            {type: 'GLOBAL', list: $scope.globalDistributionList},
            {type: 'PER_ORGANIZATION', list: $scope.organizationDistributionList},
            {type: 'PER_USER', list: $scope.userDistributionList}
        ];

        $scope.cancel = function () {
            $state.transitionTo($state.$current, {}, {
                reload: true,
                inherit: true,
                notify: true
            });
        };

        // Black lists selection methods
        $scope.addBlackList = function (campaign, campaignBlackLists) {
            var modalInstance = $uibModal.open({
                templateUrl: 'products/bulkmessaging/operations/operations.campaigns.blacklist.modal.html',
                controller: function ($scope, $uibModalInstance, $filter, BMS_DISTRIBUTION_LIST_TYPES, organizationDistributionList, userDistributionList) {
                    $scope.BMS_DISTRIBUTION_LIST_TYPES = _.reject(BMS_DISTRIBUTION_LIST_TYPES, function (blackList) {
                        return blackList.key === 'GLOBAL';
                    });
                    $scope.campaign = campaign;

                    // Prepare screening distribution list array by types.
                    organizationDistributionList = $filter('orderBy')(organizationDistributionList, ['name']);
                    userDistributionList = $filter('orderBy')(userDistributionList, ['name']);
                    $scope.blackListArray = [
                        {type: 'PER_ORGANIZATION', list: organizationDistributionList},
                        {type: 'PER_USER', list: userDistributionList}
                    ];

                    $scope.save = function (campaignBlackList) {
                        $uibModalInstance.close(campaignBlackList);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'md',
                resolve: {
                    organizationDistributionList: function ($rootScope, $stateParams, $q, UtilService, $translate, notification, BulkMessagingOperationsService) {
                        var organizationId = $rootScope.systemUserOrganizationId;

                        var deferred = $q.defer();

                        BulkMessagingOperationsService.getDistributionListsPerOrganization(organizationId, 'USER_BLACKLIST').then(function (organizationResponse) {
                            var distList = organizationResponse.lists;

                            distList = _.filter(distList, function (list) {
                                return list.listSize > 0;
                            });

                            deferred.resolve(distList);
                        }, function (response) {
                            notification({
                                type: 'warning',
                                text: $translate.instant('Products.BulkMessaging.Operations.Messages.OrganizationNotFound')
                            });

                            deferred.resolve(null);
                        });

                        UtilService.addPromiseToTracker(deferred.promise);

                        return deferred.promise;
                    },
                    userDistributionList: function ($rootScope, $stateParams, $q, UtilService, $translate, notification, BulkMessagingOperationsService) {
                        var userId = $rootScope.systemUserId;

                        var deferred = $q.defer();

                        BulkMessagingOperationsService.getDistributionListsPerUser(userId, 'USER_BLACKLIST').then(function (userResponse) {
                            var distList = userResponse.lists;

                            distList = _.filter(distList, function (list) {
                                return list.listSize > 0;
                            });

                            deferred.resolve(distList);
                        }, function (response) {
                            notification({
                                type: 'warning',
                                text: $translate.instant('Products.BulkMessaging.Operations.Messages.UserNotFound')
                            });

                            deferred.resolve(null);
                        });

                        UtilService.addPromiseToTracker(deferred.promise);

                        return deferred.promise;
                    }
                }
            });

            modalInstance.result.then(function (campaignBlackList) {
                // If the value was not already selected
                if (!_.findWhere(campaignBlackLists, {id: campaignBlackList.id})) {
                    campaignBlackLists.push(campaignBlackList);
                }
            }, function () {
            });
        };
        $scope.removeBlackList = function (campaign, campaignBlackList) {
            if (campaign.campaignBlackLists && campaignBlackList) {
                var deletingItem = _.findWhere(campaign.campaignBlackLists, {id: campaignBlackList.id});
                campaign.campaignBlackLists = _.without(campaign.campaignBlackLists, deletingItem);
            }
        };

        // Off net operations
        $scope.openOffnetSenders = function (bulkSMSPolicyProfile, campaign) {
            var modalInstance = $uibModal.open({
                templateUrl: 'products/bulkmessaging/operations/operations.campaigns.offnetsenders.modal.html',
                controller: function ($scope, $uibModalInstance, $filter, NgTableParams, NgTableService, permissibleOffnetSenders, offnetSenders) {
                    $scope.campaign = campaign;
                    $scope.permissibleOffnetSenders = permissibleOffnetSenders;
                    $scope.offnetSenders = offnetSenders ? angular.copy(offnetSenders) : [];

                    $scope.tableParams = new NgTableParams({
                        page: 1,
                        count: 10,
                        sorting: {
                            "value": 'asc'
                        }
                    }, {
                        $scope: $scope,
                        total: 0,
                        getData: function ($defer, params) {
                            var filterText = params.settings().$scope.filterText;
                            var filterColumns = params.settings().$scope.filterColumns;
                            var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.permissibleOffnetSenders);
                            var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.permissibleOffnetSenders;
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

                    $scope.addToSelection = function (offnetSender) {
                        var user = _.findWhere($scope.offnetSenders, {value: offnetSender.value});
                        if (!user)
                            $scope.offnetSenders.push(offnetSender);
                    };

                    $scope.removeFromSelection = function (offnetSender) {
                        var index = _.indexOf($scope.offnetSenders, offnetSender);
                        if (index !== -1) {
                            $scope.offnetSenders.splice(index, 1);
                        }
                    };

                    $scope.save = function (offnetSenders) {
                        $uibModalInstance.close(offnetSenders);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'md',
                resolve: {
                    permissibleOffnetSenders: function () {
                        return bulkSMSPolicyProfile.PermissibleOffnetSenders;
                    },
                    offnetSenders: function () {
                        return campaign.offnetSenders;
                    }
                }
            });

            modalInstance.result.then(function (offnetSenders) {
                campaign.offnetSenders = offnetSenders;
            }, function () {
            });
        };
        $scope.removeSelectedOffnetSender = function (offnetSenders, i) {
            var index = _.indexOf(offnetSenders, i);
            if (index != -1) {
                offnetSenders.splice(index, 1);
            }
        };

        // Time Constraint list editing methods
        $scope.addUpdateTimeConstraint = function (campaign, policyProfile, timeConstraint) {
            var modalInstance = $uibModal.open({
                templateUrl: 'products/bulkmessaging/operations/operations.campaigns.timeconstraint.modal.html',
                controller: function ($scope, $uibModalInstance, timeConstraint, UtilService, DAYS_OF_WEEK) {
                    $scope.campaign = campaign;

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
                    timeConstraint: function () {
                        return angular.copy(timeConstraint);
                    }
                }
            });

            modalInstance.result.then(function (response) {
                var oldValue = response.oldValue;
                var newValue = response.newValue;

                // If the value was not already defined on the list
                if (!_.findWhere(policyProfile.TimeConstraints, {value: newValue.value})) {
                    // If it is editing or not
                    if (newValue.id) {
                        var timeConstraintItem = _.findWhere(policyProfile.TimeConstraints, {id: newValue.id})
                        timeConstraintItem.value = newValue.value;
                    } else if (oldValue) {
                        var timeConstraintItem = _.findWhere(policyProfile.TimeConstraints, {value: oldValue.value})
                        timeConstraintItem.value = newValue.value;
                    } else {
                        if (!policyProfile.TimeConstraints) {
                            policyProfile.TimeConstraints = [];
                        }

                        policyProfile.TimeConstraints.push({value: newValue.value});
                    }
                }
            }, function () {
            });
        };
        $scope.removeTimeConstraint = function (policyProfile, timeConstraint) {
            if (policyProfile.TimeConstraints) {
                var deletingItem = _.findWhere(policyProfile.TimeConstraints, {value: timeConstraint.value});
                policyProfile.TimeConstraints = _.without(policyProfile.TimeConstraints, deletingItem);
            }
        }
    });

})();
