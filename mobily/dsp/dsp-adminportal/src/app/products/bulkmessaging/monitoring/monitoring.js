(function () {

    'use strict';

    angular.module('adminportal.products.bulkmessaging.monitoring', []);

    var BulkMessagingMonitoringModule = angular.module('adminportal.products.bulkmessaging.monitoring');

    BulkMessagingMonitoringModule.config(function ($stateProvider) {

        $stateProvider.state('products.bulkmessaging.monitoring', {
            url: "/monitoring",
            template: '<div ui-view></div>',
            resolve: {
                organizations: function ($rootScope, $stateParams, CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    if ($rootScope.isBMSAdminUser) {
                        return CMPFService.getAllOperatorsAndPartners(false, true, [CMPFService.OPERATOR_PROFILE, CMPFService.BULK_ORGANIZATION_PROFILE]);
                    } else {
                        return {organizations: []};
                    }
                }
            }
        }).state('products.bulkmessaging.monitoring.list', {
            url: "/:campaignType/:campaignStatus",
            templateUrl: "products/bulkmessaging/monitoring/monitoring.html",
            controller: "BulkMessagingMonitoringCtrl"
        });

    });

    BulkMessagingMonitoringModule.controller('BulkMessagingMonitoringCtrl', function ($rootScope, $scope, $log, $state, $stateParams, $controller, $timeout, $filter, $translate, notification, Restangular,
                                                                                      UtilService, PlotService, DateTimeConstants, CMPFService, BulkMessagingOperationsService, organizations, BMS_CAMPAIGN_STATUSES,
                                                                                      DEFAULT_REST_QUERY_LIMIT) {
        $log.debug('BulkMessagingMonitoringCtrl');

        // Calling the date time controller which initializes date/time pickers and necessary functions.
        $controller('GenericDateTimeCtrl', {$scope: $scope});

        $scope.showRecords = false;

        // Initialize the campaign status and type selections.
        if ($stateParams.campaignStatus) {
            $scope.campaignStatus = $stateParams.campaignStatus;
        }
        if ($stateParams.campaignType && ($stateParams.campaignType === 'bulk-sms' || $stateParams.campaignType === 'bulk-mms' || $stateParams.campaignType === 'bulk-ivr')) {
            $scope.campaignType = $stateParams.campaignType;
        } else {
            $scope.campaignType = 'bulk-sms';
        }

        // Organization list
        var organizationList = _.filter(organizations.organizations, function (organization) {
            return CMPFService.getBulkOrganizationProfile(organization) !== undefined;
        });
        $scope.organizationList = $filter('orderBy')(organizationList, ['orgType', 'name']);

        $scope.userAccountList = [];
        var getUserAccounts = function (organizationId) {
            // Find out the users of the selected organization.
            CMPFService.getUserAccountsByOrganizationId(0, DEFAULT_REST_QUERY_LIMIT, false, true, organizationId).then(function (userAccounts) {
                if (userAccounts && userAccounts.userAccounts) {
                    // Filter out the bulk messaging users and whether these are bulk sms users.
                    $scope.userAccountList = _.filter(userAccounts.userAccounts, function (userAccount) {
                        var bulkUserProfile = CMPFService.extractBulkUserProfile(userAccount);
                        if (!_.isEmpty(bulkUserProfile)) {
                            return bulkUserProfile.isBulkSmsUser;
                        }

                        return false;
                    });
                    $scope.userAccountList = $filter('orderBy')(userAccountList, ['name']);
                }
            });
        }

        // Organization selection.
        $scope.changeOrganization = function (organizationId) {
            $log.debug("Selected organization: ", organizationId);

            if (organizationId) {
                getUserAccounts(organizationId);
            } else {
                $scope.userAccountList = [];
            }
        };

        $scope.dateFilter.startDate = UtilService.getOneDayAgo();
        $scope.dateFilter.startTime = UtilService.getOneDayAgo();

        // Set default values of the filter fields.
        if (!$rootScope.isBMSAdminUser) {
            $scope.dateFilter.orgId = $rootScope.systemUserOrganizationId;
            $scope.dateFilter.userId = $rootScope.systemUserId;
        }

        $scope.BMS_CAMPAIGN_STATUSES = BMS_CAMPAIGN_STATUSES;

        $scope.$watch('campaignStatus', function (newVal, oldVal) {
            if (newVal && newVal !== oldVal) {
                $state.transitionTo($state.$current, {
                        campaignType: $scope.campaignType,
                        campaignStatus: newVal
                    }, {
                        reload: false,
                        inherit: false,
                        notify: false
                    }
                );

                $scope.reloadTable();
            }
        });

        $scope.$watch('campaignType', function (newVal, oldVal) {
            if (newVal && newVal !== oldVal) {
                $state.transitionTo($state.$current, {
                        campaignType: newVal,
                        campaignStatus: $scope.campaignStatus
                    }, {
                        reload: false,
                        inherit: false,
                        notify: false
                    }
                );

                $scope.reloadTable();
            }
        });

        $scope.runningCampaignList = [];
        $scope.completedCampaignList = [];
        $scope.pausedCampaignList = [];
        $scope.cancelledCampaignList = [];
        $scope.scheduledCampaignList = [];

        var prepareDetailPopoverEvents = function () {
            $scope.campaignList.forEach(function (campaign) {
                // Watch the all isDetailPopoverOpen properties of the accordions to be able to query price groups when any accordion element opened.
                var isDetailPopoverOpen = false;
                if (_.isUndefined(campaign.isDetailPopoverOpen)) {
                    Object.defineProperty(campaign, "isDetailPopoverOpen", {
                        get: function () {
                            return isDetailPopoverOpen;
                        },
                        set: function (newValue) {
                            isDetailPopoverOpen = newValue;

                            campaign.noDataAvailable = false;

                            if (isDetailPopoverOpen) {
                                if (campaign.campaignRecipientCount > 0 || campaign.delivered > 0 || campaign.failed > 0 || campaign.notStarted > 0 || campaign.blackListed > 0) {
                                    $timeout(function () {
                                        var sentMessages = campaign.campaignRecipientCount - (campaign.failed + campaign.dailyLimitFail + campaign.notStarted + campaign.blackListed);

                                        PlotService.drawDonut('#campaign-progress-donut-chart', [
                                            {label: "Sent", data: sentMessages},
                                            {label: "Failed", data: campaign.failed},
                                            {label: "Daily Limit", data: campaign.dailyLimitFail},
                                            {label: "Not Started", data: campaign.notStarted},
                                            {label: "Black Listed", data: campaign.blackListed}
                                        ], true);
                                    }, 250);
                                } else {
                                    campaign.noDataAvailable = true;
                                }
                            }
                        }
                    });
                }
            });
        };

        $scope.reloadTable = function (promiseTracker) {
            var method;
            if ($scope.campaignType === 'bulk-sms') {
                method = BulkMessagingOperationsService.getAllBulkSMSCampaigns;
            } else if ($scope.campaignType === 'bulk-mms') {
                method = BulkMessagingOperationsService.getBulkMMSCampaigns;
            } else if ($scope.campaignType === 'bulk-ivr') {
                method = BulkMessagingOperationsService.getAllInteractiveBulkIVRCampaigns;
            }

            var preparedFilter = $scope.prepareFilter($scope.dateFilter);

            method.call(BulkMessagingOperationsService, preparedFilter.startDate, preparedFilter.endDate, preparedFilter.campaignStatus, preparedFilter.orgId, preparedFilter.userId, promiseTracker).then(function (response) {
                if (response.data && response.data.status !== 200) {
                    notification({
                        type: 'warning',
                        text: response.data.explanation
                    });
                } else {
                    var campaignList = response.smsCampaigns || response.mmsCampaigns || response.ivrCampaigns;

                    // Find organizations and users of all campaigns to be able to show on the table.
                    _.each(campaignList, function (campaign) {
                        // Calculate the percentage of the job progress.
                        var started = (campaign.campaignRecipientCount - campaign.notStarted);
                        campaign.progressPercentage = Math.round(started * 100 / campaign.campaignRecipientCount);

                        var organization = _.findWhere($scope.organizationList, {id: campaign.campaignOrganizationId});
                        campaign.campaignOrganizationName = 'N/A';
                        if (organization) {
                            campaign.campaignOrganizationName = organization.name;
                        }

                        var userAccount = _.findWhere($scope.allUserAccounts, {id: campaign.campaignUserId});
                        campaign.campaignUserName = 'N/A';
                        if (userAccount) {
                            campaign.campaignUserName = userAccount.userName;
                        }
                    });

                    $scope.showRecords = true;
                    $scope.filterFormLayer.isFilterFormOpen = false;

                    $scope.campaignList = $filter('orderBy')(campaignList, ['campaignUpdateTime'], true);

                    prepareDetailPopoverEvents();
                }
            }, function (response) {
                notification({
                    type: 'warning',
                    text: $translate.instant('CommonMessages.GenericServerError')
                });
            });
        };

        $scope.getProgressBarClass = function (campaignStatus) {
            var className = 'progress-bar-success';
            if (campaignStatus === BMS_CAMPAIGN_STATUSES.COMPLETED) {
                className = 'progress-bar-tertiary'
            } else if (campaignStatus === BMS_CAMPAIGN_STATUSES.PAUSED) {
                className = 'progress-bar-warning'
            } else if (campaignStatus === BMS_CAMPAIGN_STATUSES.CANCELLED) {
                className = 'progress-bar-danger'
            } else if (campaignStatus === BMS_CAMPAIGN_STATUSES.SCHEDULED) {
                className = 'progress-bar-secondary'
            }

            return className;
        };

        $scope.prepareFilter = function (dateFilter) {
            var startDateIso = $filter('date')(dateFilter.startDate, 'yyyy-MM-dd\'T\'HH:mm:ss.sss' + DateTimeConstants.OFFSET);
            var endDateIso = $filter('date')(dateFilter.endDate, 'yyyy-MM-dd\'T\'HH:mm:ss.sss' + DateTimeConstants.OFFSET);

            var filter = {
                startDate: startDateIso,
                endDate: endDateIso,
                campaignStatus: $scope.campaignStatus,
                orgId: dateFilter.orgId,
                userId: dateFilter.userId
            };

            return filter;
        };

        $scope.throttledReloadTable = _.throttle(function () {
            $scope.reloadTable();
        }, 500);

        $controller('BulkMessagingMonitoringTableCtrl', {$scope: $scope});
    });

    BulkMessagingMonitoringModule.controller('BulkMessagingMonitoringTableCtrl', function ($rootScope, $scope, $state, $log, $filter, $uibModal, $interval, $translate, notification, DateTimeConstants, SessionService,
                                                                                           WorkflowsService, CMPFService, BulkMessagingOperationsService, AdmPortalDashboardPromiseTracker) {
        $log.debug('BulkMessagingMonitoringTableCtrl');

        var sessionOrganization = SessionService.getSessionOrganization();
        var username = SessionService.getUsername();

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'campaignStartTime',
                    headerKey: 'Products.BulkMessaging.Monitoring.TableColumns.Date',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                }
            ]
        };

        $scope.isCampaignExpiryEnabled = function (campaign) {
            return campaign.campaignExpiryEnabled ? Number(campaign.campaignExpiryEnabled) > 0 : false;
        };

        // Search initially.
        $scope.reloadTable();

        // Cancel a campaign job.
        $scope.cancelCampaign = function (campaign) {
            campaign.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: function ($scope, $uibModalInstance, $translate, $controller, $sce) {
                    var message = $translate.instant('Products.BulkMessaging.Monitoring.Messages.CancelMessage');
                    message = message + ' ' + campaign.campaignDescription + ' [Job ID = ' + campaign.campaignId + ']';
                    $scope.confirmationMessage = $sce.trustAsHtml(message);

                    $controller('ConfirmationModalInstanceCtrl', {
                        $scope: $scope,
                        $uibModalInstance: $uibModalInstance
                    });
                }
            });

            modalInstance.result.then(function () {
                campaign.rowSelected = false;

                // Workflows special campaign object
                var campaignItem = {
                    "from": {
                        "isAdmin": $rootScope.isAdminUser,
                        "userId": username,
                        "orgId": sessionOrganization.name,
                        "groupId": null
                    },
                    "to": {
                        "userId": null,
                        "orgId": null,
                        "groupId": CMPFService.DSP_MARKETING_ADMIN_GROUP
                    }
                };

                var campaignStartTimeFormatted = moment(new Date(campaign.campaignStartTime)).format();
                var campaignUpdateTimeFormatted = moment(new Date(campaign.campaignUpdateTime)).format();

                var defaultObject = {
                    "id": campaign.campaignId,
                    "campaignStatus": campaign.campaignStatus,
                    "campaignUserId": campaign.campaignUserId,
                    "campaignOrgId": campaign.campaignOrganizationId,
                    "campaignFrom": campaign.campaignFrom,
                    "name": campaign.campaignDescription,
                    "campaignDescription": campaign.campaignDescription,
                    "campaignListId": campaign.campaignListId,
                    "campaignStartTime": campaignStartTimeFormatted,
                    "campaignUpdateTime": campaignUpdateTimeFormatted,
                    // Extra fields
                    "campaignOffnetEnabled": campaign.campaignOffnetEnabled,
                    "campaignChargingDisabled": campaign.campaignChargingDisabled,
                    "campaignMaxRetryCount": campaign.campaignMaxRetryCount
                };

                var updateMethod;
                if ($scope.campaignType === 'bulk-sms') {
                    campaignItem.smsCampaignDetails = angular.copy(defaultObject);
                    campaignItem.smsCampaignDetails.campaignContent = campaign.campaignContent;
                    // Changed values
                    campaignItem.smsCampaignDetails.campaignStatusBpms = "CANCELLED";

                    // "campaignExpiryTime": "string", // Bu alan campaign bilgisinde yer almıyor.
                    // "campaignListId": 0, // Bu alanın değeri campaign bilgisinde 0 geliyor.
                    // "campaignBlackListId": [0], // Bu alanın değeri campaign bilgisinde yer almıyor.
                    // "timeConstraints": [{ "endMinuteInWeek": 0, "finalConstraint": true, "startMinuteInWeek": 0 }] // Bu alanın değeri campaign bilgisinde yer almıyor.

                    if (campaign.type === 'bulk-interactive-sms') {
                        updateMethod = WorkflowsService.updateInteractiveCampaignSms;
                    } else {
                        updateMethod = WorkflowsService.updateCampaignSms;
                    }
                } else if ($scope.campaignType === 'bulk-mms') {
                    campaignItem.mmsCampaignDetails = angular.copy(defaultObject);
                    campaignItem.mmsCampaignDetails.campaignSubject = campaign.campaignSubject;
                    campaignItem.mmsCampaignDetails.campaignTrackForwards = campaign.campaignTrackForwards;
                    // Changed values
                    campaignItem.mmsCampaignDetails.campaignStatusBpms = "CANCELLED";

                    updateMethod = WorkflowsService.updateCampaignMms;
                } else if ($scope.campaignType === 'bulk-ivr') {
                    campaignItem.campaignDetail = angular.copy(defaultObject);
                    campaignItem.campaignDetail.campaignContent = campaign.campaignContent;
                    // Changed values
                    campaignItem.campaignDetail.campaignStatusBpms = "CANCELLED";

                    if (campaign.type === 'bulk-interactive-fastkey') {
                        updateMethod = WorkflowsService.updateInteractiveCampaignFastKey;
                    } else {
                        updateMethod = WorkflowsService.updateCampaignIvr;
                    }
                }

                // Campaign update method of the flow service.
                updateMethod.call(WorkflowsService, campaignItem).then(function (response) {
                    if (response && response.code === 2001) {
                        notification.flash({
                            type: 'success',
                            text: $translate.instant('Products.BulkMessaging.Messages.CampaignCancelFlowStartedSuccessful' + ($rootScope.isAdminUser ? 'ForAdmin' : ''))
                        });

                        $state.transitionTo($state.current, {}, {reload: true, inherit: true, notify: true});
                    } else {
                        WorkflowsService.showApiError(response);
                    }
                }, function (response) {
                    $log.error('Cannot call the campaign cancel flow. Error: ', response);

                    if (response && response.data && response.data.message) {
                        WorkflowsService.showApiError(response);
                    } else {
                        notification({
                            type: 'warning',
                            text: $translate.instant('Products.BulkMessaging.Messages.CampaignCancelFlowError')
                        });
                    }
                });
            }, function () {
                campaign.rowSelected = false;
            });
        };

        // Switch state of a campaign job.
        $scope.changeStateOfCampaign = function (campaign, newState) {
            campaign.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: function ($scope, $uibModalInstance, $translate, $controller, $sce, BMS_CAMPAIGN_STATUSES) {
                    var message = '';
                    if (campaign.campaignStatus === BMS_CAMPAIGN_STATUSES.RUNNING) {
                        message = $translate.instant('Products.BulkMessaging.Monitoring.Messages.PauseMessage');
                    } else if (campaign.campaignStatus === BMS_CAMPAIGN_STATUSES.PAUSED) {
                        message = $translate.instant('Products.BulkMessaging.Monitoring.Messages.ResumeMessage');
                    }
                    message = message + ' ' + campaign.campaignDescription + ' [Job ID = ' + campaign.campaignId + ']';
                    $scope.confirmationMessage = $sce.trustAsHtml(message);

                    $controller('ConfirmationModalInstanceCtrl', {
                        $scope: $scope,
                        $uibModalInstance: $uibModalInstance
                    });
                }
            });

            modalInstance.result.then(function () {
                campaign.rowSelected = false;

                // Workflows special campaign object
                var campaignItem = {
                    "from": {
                        "isAdmin": $rootScope.isAdminUser,
                        "userId": username,
                        "orgId": sessionOrganization.name,
                        "groupId": null
                    },
                    "to": {
                        "userId": null,
                        "orgId": null,
                        "groupId": CMPFService.DSP_MARKETING_ADMIN_GROUP
                    }
                };

                var campaignStartTimeFormatted = moment(new Date(campaign.campaignStartTime)).format();
                var campaignUpdateTimeFormatted = moment(new Date(campaign.campaignUpdateTime)).format();

                var defaultObject = {
                    "id": campaign.campaignId,
                    "campaignStatus": campaign.campaignStatus,
                    "campaignUserId": campaign.campaignUserId,
                    "campaignOrgId": campaign.campaignOrganizationId,
                    "campaignFrom": campaign.campaignFrom,
                    "name": campaign.campaignDescription,
                    "campaignDescription": campaign.campaignDescription,
                    "campaignListId": campaign.campaignListId,
                    "campaignStartTime": campaignStartTimeFormatted,
                    "campaignUpdateTime": campaignUpdateTimeFormatted,
                    // Extra fields
                    "campaignOffnetEnabled": campaign.campaignOffnetEnabled,
                    "campaignChargingDisabled": campaign.campaignChargingDisabled,
                    "campaignMaxRetryCount": campaign.campaignMaxRetryCount
                };

                var updateMethod;
                if ($scope.campaignType === 'bulk-sms') {
                    campaignItem.smsCampaignDetails = angular.copy(defaultObject);
                    campaignItem.smsCampaignDetails.campaignContent = campaign.campaignContent;
                    // Changed values
                    campaignItem.smsCampaignDetails.campaignStatusBpms = newState;

                    // "campaignExpiryTime": "string", // Bu alan campaign bilgisinde yer almıyor.
                    // "campaignListId": 0, // Bu alanın değeri campaign bilgisinde 0 geliyor.
                    // "campaignBlackListId": [0], // Bu alanın değeri campaign bilgisinde yer almıyor.
                    // "timeConstraints": [{ "endMinuteInWeek": 0, "finalConstraint": true, "startMinuteInWeek": 0 }] // Bu alanın değeri campaign bilgisinde yer almıyor.

                    if (campaign.type === 'bulk-interactive-sms') {
                        updateMethod = WorkflowsService.updateInteractiveCampaignSms;
                    } else {
                        updateMethod = WorkflowsService.updateCampaignSms;
                    }
                } else if ($scope.campaignType === 'bulk-mms') {
                    campaignItem.mmsCampaignDetails = angular.copy(defaultObject);
                    campaignItem.mmsCampaignDetails.campaignSubject = campaign.campaignSubject;
                    campaignItem.mmsCampaignDetails.campaignTrackForwards = campaign.campaignTrackForwards;
                    // Changed values
                    campaignItem.mmsCampaignDetails.campaignStatusBpms = newState;

                    updateMethod = WorkflowsService.updateCampaignMms;
                } else if ($scope.campaignType === 'bulk-ivr') {
                    campaignItem.campaignDetail = angular.copy(defaultObject);
                    campaignItem.campaignDetail.campaignContent = campaign.campaignContent;
                    // Changed values
                    campaignItem.campaignDetail.campaignStatusBpms = newState;

                    if (campaign.type === 'bulk-interactive-fastkey') {
                        updateMethod = WorkflowsService.updateInteractiveCampaignFastKey;
                    } else {
                        updateMethod = WorkflowsService.updateCampaignIvr;
                    }
                }

                // Campaign update method of the flow service.
                updateMethod.call(WorkflowsService, campaignItem).then(function (response) {
                    if (response && response.code === 2001) {
                        notification.flash({
                            type: 'success',
                            text: $translate.instant('Products.BulkMessaging.Messages.CampaignUpdateFlowStartedSuccessful' + ($rootScope.isAdminUser ? 'ForAdmin' : ''))
                        });

                        $state.transitionTo($state.current, {}, {reload: true, inherit: true, notify: true});
                    } else {
                        WorkflowsService.showApiError(response);
                    }
                }, function (response) {
                    $log.error('Cannot call the campaign update flow. Error: ', response);

                    if (response && response.data && response.data.message) {
                        WorkflowsService.showApiError(response);
                    } else {
                        notification({
                            type: 'warning',
                            text: $translate.instant('Products.BulkMessaging.Messages.CampaignUpdateFlowError')
                        });
                    }
                });
            }, function () {
                campaign.rowSelected = false;
            });
        };

        var rebuild = $interval(function () {
            $log.debug('reloading');

            $scope.reloadTable(AdmPortalDashboardPromiseTracker);
        }, 90000);

        $scope.$on('$destroy', function () {
            if (angular.isDefined(rebuild)) {
                $log.debug('Cancelled timer');
                $interval.cancel(rebuild);
                rebuild = undefined;
            }
        });
    });

})();
