(function () {

    'use strict';

    angular.module('adminportal.products.bulkmessaging.operations.campaigns.bulksms', []);

    var BulkMessagingCampaignsBulkSmsOperationsModule = angular.module('adminportal.products.bulkmessaging.operations.campaigns.bulksms');

    BulkMessagingCampaignsBulkSmsOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('products.bulkmessaging.operations.campaigns.bulksms', {
            url: "/bulksms",
            templateUrl: "products/bulkmessaging/operations/campaigns/operations.campaigns.bulksms.detail.html",
            controller: 'BulkMessagingCampaignsOperationsBulkSMSCtrl',
            data: {
                pageHeaderKey: 'Products.BulkMessaging.Operations.Campaigns.Title',
                subPageHeaderKey: 'Products.BulkMessaging.BulkSMS.Title'
            },
            resolve: {
                operator: function ($rootScope, CMPFService) {
                    return CMPFService.getOperator($rootScope.systemUserOrganizationId, true);
                },
                userAccount: function ($rootScope, CMPFService) {
                    return CMPFService.getUserAccount($rootScope.systemUserId, true);
                },
                settings: function ($stateParams, BulkMessagingConfService) {
                    return BulkMessagingConfService.getSMSConfig();
                },
                globalWhiteLists: function (BulkMessagingOperationsService) {
                    return BulkMessagingOperationsService.getGlobalWhiteLists();
                },
                orgDistributionLists: function ($rootScope, BulkMessagingOperationsService) {
                    return BulkMessagingOperationsService.getDistributionListsPerOrganization($rootScope.systemUserOrganizationId, 'USER_LIST');
                },
                userDistributionLists: function ($rootScope, BulkMessagingOperationsService) {
                    return BulkMessagingOperationsService.getDistributionListsPerUser($rootScope.systemUserId, 'USER_LIST');
                }
            }
        });

    });

    BulkMessagingCampaignsBulkSmsOperationsModule.controller('BulkMessagingCampaignsOperationsBulkSMSCtrl', function ($rootScope, $scope, $log, $controller, $state, $uibModal, $filter, notification, $translate, CMPFService, SessionService,
                                                                                                                      WorkflowsService, DateTimeConstants, Restangular, BulkMessagingOperationsService, operator, userAccount, settings,
                                                                                                                      globalWhiteLists, orgDistributionLists, userDistributionLists) {
        $log.debug("BulkMessagingCampaignsOperationsBulkSMSCtrl");

        $controller('BulkMessagingCampaignsCommonCtrl', {
            $scope: $scope,
            operator: operator,
            userAccount: userAccount,
            globalWhiteLists: globalWhiteLists,
            orgDistributionLists: orgDistributionLists,
            userDistributionLists: userDistributionLists
        });

        // Initialize Campaign
        $scope.isBulkSmsUser = true;
        if (!$scope.bulkOrganizationProfile || !$scope.bulkUserProfile || !$scope.bulkUserProfile.isBulkSmsUser) {
            $scope.isBulkSmsUser = false;
            return;
        }

        $scope.campaign = {
            maxRetryCount: 0,
            campaignExpiryInterval: 1,
            forceExpiryDate: false,
            campaignBlackLists: []
        };
        $scope.listType = undefined;

        $scope.maxMaxRetryCount = settings.messageRetryMaxCount;
        $scope.blackListEnabled = settings.blackListEnabled;

        $scope.bulkUserPolicyProfile = CMPFService.extractBulkUserPolicyProfile($scope.userAccount);

        $scope.bulkSMSPolicyProfile = CMPFService.extractBulkSMSPolicyProfile($scope.userAccount);
        $scope.bulkSMSPolicyProfile.PermissibleAlphanumericSenders = $filter('orderBy')($scope.bulkSMSPolicyProfile.PermissibleAlphanumericSenders, ['value']);
        $scope.bulkSMSPolicyProfile.PermissibleOffnetSenders = $filter('orderBy')($scope.bulkSMSPolicyProfile.PermissibleOffnetSenders, ['value']);

        $scope.isTimeConstraintEnforced = angular.copy($scope.bulkUserPolicyProfile.isTimeConstraintEnforced);
        $scope.isOffNetDeliveryAllowed = angular.copy($scope.bulkSMSPolicyProfile.isOffNetDeliveryAllowed);
        $scope.isDisableChargingAllowed = angular.copy($scope.bulkSMSPolicyProfile.isDisableChargingAllowed);

        // Override the predefined flags as false.
        $scope.bulkSMSPolicyProfile.isTimeConstraintEnforced = false;
        $scope.bulkSMSPolicyProfile.isScreeningListsEnforced = false;
        $scope.bulkSMSPolicyProfile.isOffNetDeliveryAllowed = true;
        $scope.bulkSMSPolicyProfile.isDisableChargingAllowed = false;
        // -------

        $scope.start = function (campaign, dateHolder, bulkSMSPolicyProfile) {
            if (!$scope.bulkSMSPolicyProfile || !$scope.bulkSMSPolicyProfile.SenderMsisdn) {
                notification({
                    type: 'warning',
                    text: $translate.instant('Products.BulkMessaging.Messages.SenderNumberRequired')
                });

                return;
            }

            // Workflows special campaign object
            var campaignItem = {
                "from": {
                    "isAdmin": $rootScope.isAdminUser,
                    "userId": $scope.username,
                    "orgId": $scope.sessionOrganization.name,
                    "groupId": null
                },
                "to": {
                    "userId": null,
                    "orgId": null,
                    "groupId": CMPFService.DSP_MARKETING_ADMIN_GROUP
                },
                "smsCampaignDetails": {
                    "campaignStatus": "ACTIVE",
                    "campaignStatusBpms": "SCHEDULED",
                    "campaignUserId": $scope.userId,
                    "campaignOrgId": $scope.organizationId,
                    "campaignFrom": $scope.bulkSMSPolicyProfile.SenderMsisdn,
                    "name": campaign.campaignName,
                    "campaignDescription": campaign.campaignName,
                    "campaignListId": campaign.to,
                    "campaignContent": campaign.messageContent,
                    // Extra fields
                    "campaignOffnetEnabled": $scope.isOffNetDeliveryAllowed ? bulkSMSPolicyProfile.isOffNetDeliveryAllowed : false,
                    "campaignChargingDisabled": $scope.isDisableChargingAllowed ? bulkSMSPolicyProfile.isDisableChargingAllowed : false,
                    "campaignMaxRetryCount": campaign.maxRetryCount
                }
            };

            // If permissible off net senders is enabled and there are defined off net sender list items.
            if ($scope.isOffNetDeliveryAllowed && bulkSMSPolicyProfile.isOffNetDeliveryAllowed && bulkSMSPolicyProfile.isOffnetSenderListRestricted && campaign.offnetSenders && campaign.offnetSenders.length > 0) {
                campaignItem.smsCampaignDetails.offNetSenderAddresses = _.pluck(campaign.offnetSenders, 'value');
            }

            // If black list settings is enabled and there are defined black list items.
            if ($scope.blackListEnabled && bulkSMSPolicyProfile.isScreeningListsEnforced && campaign.campaignBlackLists && campaign.campaignBlackLists.length > 0) {
                campaignItem.smsCampaignDetails.campaignBlackListId = _.pluck(campaign.campaignBlackLists, 'id');
            }

            // If times constraint values are specified, add them to the campaign object.
            if (bulkSMSPolicyProfile.isTimeConstraintEnforced && bulkSMSPolicyProfile.TimeConstraints && bulkSMSPolicyProfile.TimeConstraints.length > 0) {
                campaignItem.smsCampaignDetails.timeConstraints = [];
                _.each(bulkSMSPolicyProfile.TimeConstraints, function (timeConstraint) {
                    if (timeConstraint.value && timeConstraint.value.split('-').length > 1) {
                        var timeConstraints = timeConstraint.value.split('-');
                        campaignItem.smsCampaignDetails.timeConstraints.push({
                            "startMinuteInWeek": Number(timeConstraints[0]),
                            "endMinuteInWeek": Number(timeConstraints[1]),
                            "finalConstraint": false
                        });
                    }
                });
            }

            // If there is an alphanumeric sender selection.
            if (bulkSMSPolicyProfile.isAlphanumericSenderListRestricted) {
                campaignItem.smsCampaignDetails.campaignFrom = campaign.from;
            }

            // Date time preparation
            campaignItem.smsCampaignDetails.campaignStartTime = $filter('date')(dateHolder.startDate, 'yyyy-MM-dd\'T\'HH:mm:ss' + DateTimeConstants.OFFSET_WITH_COLON);
            // If selected the expiry forcing option.
            if (campaign.forceExpiryDate) {
                campaignItem.smsCampaignDetails.campaignExpiryTime = $filter('date')(dateHolder.endDate, 'yyyy-MM-dd\'T\'HH:mm:ss' + DateTimeConstants.OFFSET_WITH_COLON);
            }

            // Campaign create method of the flow service.
            WorkflowsService.createCampaignSms(campaignItem).then(function (response) {
                if (response && response.code === 2001) {
                    notification.flash({
                        type: 'success',
                        text: $translate.instant('Products.BulkMessaging.Messages.CampaignCreateFlowStartedSuccessful' + ($rootScope.isAdminUser ? 'ForAdmin' : ''))
                    });

                    $state.transitionTo($state.current, {}, {reload: true, inherit: true, notify: true});
                } else {
                    WorkflowsService.showApiError(response);
                }
            }, function (response) {
                $log.error('Cannot call the campaign create flow. Error: ', response);

                if (response && response.data && response.data.message) {
                    WorkflowsService.showApiError(response);
                } else {
                    notification({
                        type: 'warning',
                        text: $translate.instant('Products.BulkMessaging.Messages.CampaignCreateFlowError')
                    });
                }
            });
        };
    });

})();
