(function () {

    'use strict';

    angular.module('adminportal.products.bulkmessaging.operations.campaigns.bulkivr', [
        'adminportal.products.bulkmessaging.operations.campaigns.bulkivr.announcementfile',
    ]);

    var BulkMessagingCampaignsBulkIVROperationsModule = angular.module('adminportal.products.bulkmessaging.operations.campaigns.bulkivr');

    BulkMessagingCampaignsBulkIVROperationsModule.config(function ($stateProvider) {

        $stateProvider.state('products.bulkmessaging.operations.campaigns.bulkivr', {
            url: "/bulkivr",
            templateUrl: "products/bulkmessaging/operations/campaigns/operations.campaigns.bulkivr.detail.html",
            controller: 'BulkMessagingCampaignsOperationsBulkIVRCtrl',
            data: {
                pageHeaderKey: 'Products.BulkMessaging.Operations.Campaigns.Title',
                subPageHeaderKey: 'Products.BulkMessaging.BulkIVR.Title'
            },
            resolve: {
                operator: function ($rootScope, CMPFService) {
                    return CMPFService.getOperator($rootScope.systemUserOrganizationId, true);
                },
                userAccount: function ($rootScope, CMPFService) {
                    return CMPFService.getUserAccount($rootScope.systemUserId, true);
                },
                settings: function ($stateParams, BulkMessagingConfService) {
                    return BulkMessagingConfService.getIVRConfig();
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

    BulkMessagingCampaignsBulkIVROperationsModule.controller('BulkMessagingCampaignsOperationsBulkIVRCtrl', function ($rootScope, $scope, $q, $log, $controller, $state, $stateParams, $uibModal, $filter, notification, $translate, CMPFService, UtilService,
                                                                                                                      SessionService, ContentManagementService, WorkflowsService, DateTimeConstants, Restangular, BulkMessagingOperationsService, operator,
                                                                                                                      userAccount, settings, globalWhiteLists, orgDistributionLists, userDistributionLists) {
        $log.debug("BulkMessagingCampaignsOperationsBulkIVRCtrl");

        $controller('BulkMessagingCampaignsCommonCtrl', {
            $scope: $scope,
            operator: operator,
            userAccount: userAccount,
            globalWhiteLists: globalWhiteLists,
            orgDistributionLists: orgDistributionLists,
            userDistributionLists: userDistributionLists
        });

        // Initialize Campaign
        $scope.isBulkIvrUser = true;
        if (!$scope.bulkOrganizationProfile || !$scope.bulkUserProfile || !$scope.bulkUserProfile.isBulkIvrUser) {
            $scope.isBulkIvrUser = false;
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

        $scope.bulkIVRPolicyProfile = CMPFService.extractBulkIVRPolicyProfile($scope.userAccount);
        $scope.bulkIVRPolicyProfile.PermissibleAlphanumericSenders = $filter('orderBy')($scope.bulkIVRPolicyProfile.PermissibleAlphanumericSenders, ['value']);
        $scope.bulkIVRPolicyProfile.PermissibleOffnetSenders = $filter('orderBy')($scope.bulkIVRPolicyProfile.PermissibleOffnetSenders, ['value']);

        $scope.isOffNetDeliveryAllowed = angular.copy($scope.bulkIVRPolicyProfile.isOffNetDeliveryAllowed);
        $scope.isDisableChargingAllowed = angular.copy($scope.bulkIVRPolicyProfile.isDisableChargingAllowed);

        // Override the predefined flags as false.
        $scope.bulkIVRPolicyProfile.isTimeConstraintEnforced = false;
        $scope.bulkIVRPolicyProfile.isScreeningListsEnforced = false;
        $scope.bulkIVRPolicyProfile.isOffNetDeliveryAllowed = true;
        $scope.bulkIVRPolicyProfile.isDisableChargingAllowed = false;
        // -------

        $scope.start = function (campaign, dateHolder, bulkIVRPolicyProfile) {
            if (!$scope.bulkIVRPolicyProfile || !$scope.bulkIVRPolicyProfile.SenderMsisdn) {
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
                "campaignDetail": {
                    "campaignStatus": "ACTIVE",
                    "campaignStatusBpms": "SCHEDULED",
                    "campaignUserId": $scope.userId,
                    "campaignOrgId": $scope.organizationId,
                    "campaignFrom": $scope.bulkIVRPolicyProfile.SenderMsisdn,
                    "name": campaign.campaignName,
                    "campaignDescription": campaign.campaignName,
                    "campaignListId": campaign.to,
                    "campaignContent": {},
                    // Extra fields
                    "campaignOffnetEnabled": false,
                    "campaignMaxRetryCount": 0,
                    "campaignChargingDisabled": $scope.isDisableChargingAllowed ? bulkIVRPolicyProfile.isDisableChargingAllowed : false
                }
            };

            // If permissible off net senders is enabled and there are defined off net sender list items.
            if ($scope.isOffNetDeliveryAllowed && bulkIVRPolicyProfile.isOffNetDeliveryAllowed && bulkIVRPolicyProfile.isOffnetSenderListRestricted && campaign.offnetSenders && campaign.offnetSenders.length > 0) {
                campaignItem.campaignDetail.offNetSenderAddresses = _.pluck(campaign.offnetSenders, 'value');
            }

            // If black list settings is enabled and there are defined black list items.
            if ($scope.blackListEnabled && bulkIVRPolicyProfile.isScreeningListsEnforced && campaign.campaignBlackLists && campaign.campaignBlackLists.length > 0) {
                campaignItem.campaignDetail.campaignBlackListId = _.pluck(campaign.campaignBlackLists, 'id');
            }

            // If times constraint values are specified, add them to the campaign object.
            if (bulkIVRPolicyProfile.isTimeConstraintEnforced && bulkIVRPolicyProfile.TimeConstraints && bulkIVRPolicyProfile.TimeConstraints.length > 0) {
                campaignItem.campaignDetail.timeConstraints = [];
                _.each(bulkIVRPolicyProfile.TimeConstraints, function (timeConstraint) {
                    if (timeConstraint.value && timeConstraint.value.split('-').length > 1) {
                        var timeConstraints = timeConstraint.value.split('-');
                        campaignItem.campaignDetail.timeConstraints.push({
                            "startMinuteInWeek": Number(timeConstraints[0]),
                            "endMinuteInWeek": Number(timeConstraints[1]),
                            "finalConstraint": false
                        });
                    }
                });
            }

            // If there is an alphanumeric sender selection.
            if (bulkIVRPolicyProfile.isAlphanumericSenderListRestricted) {
                campaignItem.campaignDetail.campaignFrom = campaign.from;
            }

            // Date time preparation
            campaignItem.campaignDetail.campaignStartTime = $filter('date')(dateHolder.startDate, 'yyyy-MM-dd\'T\'HH:mm:ss' + DateTimeConstants.OFFSET_WITH_COLON);
            // If selected the expiry forcing option.
            if (campaign.forceExpiryDate) {
                campaignItem.campaignDetail.campaignExpiryTime = $filter('date')(dateHolder.endDate, 'yyyy-MM-dd\'T\'HH:mm:ss' + DateTimeConstants.OFFSET_WITH_COLON);
            }

            var contentUploadPromises = [];
            var campaignContent = {};

            // Announcement
            campaignContent = {
                "campaignTemplate": "ANNOUNCEMENT",
                "globalParameters": {
                    "announcement": []
                }
            };

            _.each(campaign.announcementFileList, function (announcementFile) {
                announcementFile.fileId = UtilService.generateObjectId();

                campaignContent.globalParameters.announcement.push(announcementFile.fileId);

                contentUploadPromises.push(ContentManagementService.uploadFile(announcementFile.file, announcementFile.file.name, announcementFile.fileId));
            });

            campaignItem.campaignDetail.campaignContent = JSON.stringify(campaignContent);

            $q.all(contentUploadPromises).then(function (result) {
                // Campaign create method of the flow service.
                WorkflowsService.createCampaignIvr(campaignItem).then(function (response) {
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
            });

        };

        $controller('BulkMessagingCampaignsBulkIVROperationsAnnouncementFileCtrl', {$scope: $scope});
    });

})();
