(function () {

    'use strict';

    angular.module('adminportal.products.bulkmessaging.operations.interactivecampaigns.bulksms', [
        'adminportal.products.bulkmessaging.operations.interactivecampaigns.pollchoicetext',
        'adminportal.products.bulkmessaging.operations.interactivecampaigns.questionanswertext',
        'adminportal.products.bulkmessaging.operations.interactivecampaigns.rule'
    ]);

    var BulkMessagingInteractiveCampaignsBulkSmsOperationsModule = angular.module('adminportal.products.bulkmessaging.operations.interactivecampaigns.bulksms');

    BulkMessagingInteractiveCampaignsBulkSmsOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('products.bulkmessaging.operations.interactivecampaigns.bulksms', {
            url: "/bulksms",
            templateUrl: "products/bulkmessaging/operations/interactivecampaigns/operations.interactivecampaigns.bulksms.detail.html",
            controller: 'BulkMessagingInteractiveCampaignsOperationsBulkSMSCtrl',
            data: {
                pageHeaderKey: 'Products.BulkMessaging.Operations.InteractiveCampaigns.Title',
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

    BulkMessagingInteractiveCampaignsBulkSmsOperationsModule.controller('BulkMessagingInteractiveCampaignsOperationsBulkSMSCtrl', function ($rootScope, $scope, $q, $log, $controller, $state, $uibModal, $filter, notification, $translate, CMPFService, UtilService,
                                                                                                                                            ContentManagementService, SessionService, WorkflowsService, DateTimeConstants, Restangular, BulkMessagingOperationsService,
                                                                                                                                            operator, userAccount, settings, globalWhiteLists, orgDistributionLists, userDistributionLists, BMS_SMS_INTERACTIVITY_TEMPLATES,
                                                                                                                                            DURATION_UNITS) {
        $log.debug("BulkMessagingInteractiveCampaignsOperationsBulkSMSCtrl");

        $controller('BulkMessagingCampaignsCommonCtrl', {
            $scope: $scope,
            operator: operator,
            userAccount: userAccount,
            globalWhiteLists: globalWhiteLists,
            orgDistributionLists: orgDistributionLists,
            userDistributionLists: userDistributionLists
        });

        $scope.BMS_INTERACTIVITY_TEMPLATES = BMS_SMS_INTERACTIVITY_TEMPLATES;
        $scope.DURATION_UNITS = DURATION_UNITS;

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
            campaignBlackLists: [],
            messageContent: '',
            tryAndBuyEnabled: false,
            trialPeriod: {
                duration: 1,
                unit: $scope.DURATION_UNITS[0].key
            }
        };
        $scope.listType = undefined;

        $scope.maxMaxRetryCount = settings.messageRetryMaxCount;
        $scope.blackListEnabled = settings.blackListEnabled;

        $scope.bulkUserProfile = CMPFService.extractBulkUserProfile($scope.userAccount);
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
                "interactiveSmsCampaignDetail": {
                    "campaignStatus": "ACTIVE",
                    "campaignStatusBpms": "SCHEDULED",
                    "campaignUserId": $scope.userId,
                    "campaignOrgId": $scope.organizationId,
                    "campaignFrom": $scope.bulkSMSPolicyProfile.SenderMsisdn,
                    "name": campaign.campaignName,
                    "campaignDescription": campaign.campaignName,
                    "campaignListId": campaign.to,
                    "campaignContent": {},
                    // Extra fields
                    "campaignOffnetEnabled": $scope.isOffNetDeliveryAllowed ? bulkSMSPolicyProfile.isOffNetDeliveryAllowed : false,
                    "campaignChargingDisabled": $scope.isDisableChargingAllowed ? bulkSMSPolicyProfile.isDisableChargingAllowed : false,
                    "campaignMaxRetryCount": campaign.maxRetryCount
                }
            };

            // If permissible off net senders is enabled and there are defined off net sender list items.
            if ($scope.isOffNetDeliveryAllowed && bulkSMSPolicyProfile.isOffNetDeliveryAllowed && bulkSMSPolicyProfile.isOffnetSenderListRestricted && campaign.offnetSenders && campaign.offnetSenders.length > 0) {
                campaignItem.interactiveSmsCampaignDetail.offNetSenderAddresses = _.pluck(campaign.offnetSenders, 'value');
            }

            // If black list settings is enabled and there are defined black list items.
            if ($scope.blackListEnabled && bulkSMSPolicyProfile.isScreeningListsEnforced && campaign.campaignBlackLists && campaign.campaignBlackLists.length > 0) {
                campaignItem.interactiveSmsCampaignDetail.campaignBlackListId = _.pluck(campaign.campaignBlackLists, 'id');
            }

            // If times constraint values are specified, add them to the campaign object.
            if (bulkSMSPolicyProfile.isTimeConstraintEnforced && bulkSMSPolicyProfile.TimeConstraints && bulkSMSPolicyProfile.TimeConstraints.length > 0) {
                campaignItem.interactiveSmsCampaignDetail.timeConstraints = [];
                _.each(bulkSMSPolicyProfile.TimeConstraints, function (timeConstraint) {
                    if (timeConstraint.value && timeConstraint.value.split('-').length > 1) {
                        var timeConstraints = timeConstraint.value.split('-');
                        campaignItem.interactiveSmsCampaignDetail.timeConstraints.push({
                            "startMinuteInWeek": Number(timeConstraints[0]),
                            "endMinuteInWeek": Number(timeConstraints[1]),
                            "finalConstraint": false
                        });
                    }
                });
            }

            // If there is an alphanumeric sender selection.
            if (bulkSMSPolicyProfile.isAlphanumericSenderListRestricted) {
                campaignItem.interactiveSmsCampaignDetail.campaignFrom = campaign.from;
            }

            // Date time preparation
            campaignItem.interactiveSmsCampaignDetail.campaignStartTime = $filter('date')(dateHolder.startDate, 'yyyy-MM-dd\'T\'HH:mm:ss' + DateTimeConstants.OFFSET_WITH_COLON);
            // If selected the expiry forcing option.
            if (campaign.forceExpiryDate) {
                campaignItem.interactiveSmsCampaignDetail.campaignExpiryTime = $filter('date')(dateHolder.endDate, 'yyyy-MM-dd\'T\'HH:mm:ss' + DateTimeConstants.OFFSET_WITH_COLON);
            }

            var campaignContent = {};

            // Poll
            if (campaign.interactivityTemplate.value === 'Poll') {
                campaignContent = {
                    "campaignTemplate": "POLL",
                    "globalParameters": {
                        "introList": [],
                        "options": [],
                        "outroList": []
                    }
                };

                if (campaign.introText && campaign.introText !== null) {
                    campaignContent.globalParameters.introList.push(campaign.introText);
                }

                // Add choice texts
                _.each(campaign.choiceList, function (choice) {
                    var choiceItem = {
                        "text": choice.text ? choice.text : '',
                        "keyword": choice.keyword,
                        "identifier": choice.identifier
                    };

                    campaignContent.globalParameters.options.push(choiceItem);
                });

                if (campaign.outroText && campaign.outroText !== null) {
                    campaignContent.globalParameters.outroList.push(campaign.outroText);
                }
            }
            // Questionnaire
            else if (campaign.interactivityTemplate.value === 'Questionnaire') {
                campaignContent = {
                    "campaignTemplate": "QUESTIONNAIRE",
                    "globalParameters": {
                        "introList": [],
                        "questions": [],
                        "rules": [],
                        "outroList": []
                    }
                };

                if (campaign.introText && campaign.introText !== null) {
                    campaignContent.globalParameters.introList.push(campaign.introText);
                }

                // Add question&answer texts
                _.each(campaign.questionAnswerList, function (questionAnswer) {
                    var questionAnswerItem = {
                        "text": questionAnswer.questionText ? questionAnswer.questionText : '',
                        "keywords": questionAnswer.keywords,
                        "identifiers": questionAnswer.identifiers
                    };

                    campaignContent.globalParameters.questions.push(questionAnswerItem);
                });

                // Add rules
                _.each(campaign.ruleList, function (rule) {
                    campaignContent.globalParameters.rules.push(rule.question.name + ':' + rule.answer.value + ':' + rule.action.value);
                });

                if (campaign.outroText && campaign.outroText !== null) {
                    campaignContent.globalParameters.outroList.push(campaign.outroText);
                }
            }
            // RBT Poll
            else if (campaign.interactivityTemplate.value === 'RBT Poll') {
                campaignContent = {
                    "campaignTemplate": "RBT_POLL",
                    "globalParameters": {
                        "introList": [],
                        "options": [],
                        "promotionInstructionList": [],
                        "subscriptionAcknowledgementList": [],
                        "optoutAcknowledgementList": [],
                        "outroList": [],
                        "tryAndBuyEnabled": campaign.tryAndBuyEnabled
                    }
                };

                if (campaign.tryAndBuyEnabled) {
                    campaignContent.globalParameters.trialPeriod = UtilService.convertSimpleObjectToPeriod(campaign.trialPeriod);
                }

                if (campaign.introText && campaign.introText !== null) {
                    campaignContent.globalParameters.introList.push(campaign.introText);
                }

                // Add choice texts
                _.each(campaign.choiceList, function (choice) {
                    var choiceItem = {
                        "text": choice.text ? choice.text : '',
                        "keyword": choice.keyword,
                        "identifier": choice.identifier,
                        "subscriptionCode": "UNKNOWN"
                    };

                    // Add promotion announcement tone
                    if (choice.promotedTone) {
                        choiceItem.promotedTone = choice.promotedTone.name;

                        if (choice.promotedTone.offers && choice.promotedTone.offers.length > 0) {
                            choiceItem.subscriptionCode = choice.promotedTone.offers[0].subscriptionCode;
                        }
                    }
                    campaignContent.globalParameters.options.push(choiceItem);
                });

                if (campaign.promotionInstructionText && campaign.promotionInstructionText !== null) {
                    campaignContent.globalParameters.promotionInstructionList.push(campaign.promotionInstructionText);
                }

                if (campaign.successfulSubscriptionText && campaign.successfulSubscriptionText !== null) {
                    campaignContent.globalParameters.subscriptionAcknowledgementList.push(campaign.successfulSubscriptionText);
                }

                if (campaign.optOutText && campaign.optOutText !== null) {
                    campaignContent.globalParameters.optoutAcknowledgementList.push(campaign.optOutText);
                }

                if (campaign.outroText && campaign.outroText !== null) {
                    campaignContent.globalParameters.outroList.push(campaign.outroText);
                }
            }
            // RBT Questionnaire
            else if (campaign.interactivityTemplate.value === 'RBT Questionnaire') {
                campaignContent = {
                    "campaignTemplate": "RBT_QUESTIONNAIRE",
                    "globalParameters": {
                        "introList": [],
                        "questions": [],
                        "rules": [],
                        "promotionInstructionList": [],
                        "subscriptionAcknowledgementList": [],
                        "optoutAcknowledgementList": [],
                        "outroList": [],
                        "tryAndBuyEnabled": campaign.tryAndBuyEnabled
                    }
                };

                if (campaign.tryAndBuyEnabled) {
                    campaignContent.globalParameters.trialPeriod = UtilService.convertSimpleObjectToPeriod(campaign.trialPeriod);
                }

                if (campaign.introText && campaign.introText !== null) {
                    campaignContent.globalParameters.introList.push(campaign.introText);
                }

                // Add question&answer texts
                _.each(campaign.questionAnswerList, function (questionAnswer) {
                    var questionAnswerItem = {
                        "text": questionAnswer.questionText ? questionAnswer.questionText : '',
                        "keywords": questionAnswer.keywords,
                        "identifiers": questionAnswer.identifiers,
                        "promotions": []
                    };
                    // Add promotion announcement tones
                    if (questionAnswer.promotedTones) {
                        _.each(questionAnswer.promotedTones, function (promotedTone) {
                            var promotionItem = {
                                "promotedTone": promotedTone ? promotedTone.name : "",
                                "subscriptionCode": "UNKNOWN",
                            }

                            if (promotedTone && promotedTone.offers && promotedTone.offers.length > 0) {
                                promotionItem.subscriptionCode = promotedTone.offers[0].subscriptionCode;
                            }

                            questionAnswerItem.promotions.push(promotionItem);
                        });
                    }
                    campaignContent.globalParameters.questions.push(questionAnswerItem);
                });

                // Add rules
                _.each(campaign.ruleList, function (rule) {
                    campaignContent.globalParameters.rules.push(rule.question.name + ':' + rule.answer.value + ':' + rule.action.value);
                });

                if (campaign.promotionInstructionText && campaign.promotionInstructionText !== null) {
                    campaignContent.globalParameters.promotionInstructionList.push(campaign.promotionInstructionText);
                }

                if (campaign.successfulSubscriptionText && campaign.successfulSubscriptionText !== null) {
                    campaignContent.globalParameters.subscriptionAcknowledgementList.push(campaign.successfulSubscriptionText);
                }

                if (campaign.optOutText && campaign.optOutText !== null) {
                    campaignContent.globalParameters.optoutAcknowledgementList.push(campaign.optOutText);
                }

                if (campaign.outroText && campaign.outroText !== null) {
                    campaignContent.globalParameters.outroList.push(campaign.outroText);
                }
            }

            campaignItem.interactiveSmsCampaignDetail.campaignContent = JSON.stringify(campaignContent);

            // Interactive Campaign create method of the flow service.
            WorkflowsService.createInteractiveCampaignSms(campaignItem).then(function (response) {
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

        $controller('BulkMessagingInteractiveCampaignsOperationsPollChoiceTextCtrl', {$scope: $scope});
        $controller('BulkMessagingInteractiveCampaignsOperationsQuestionnaireQuestionAnswerTextCtrl', {$scope: $scope});
        $controller('BulkMessagingInteractiveCampaignsOperationsRuleCtrl', {$scope: $scope});
    });

})();
