(function () {

    'use strict';

    angular.module('adminportal.products.bulkmessaging.operations.interactivecampaigns.bulkivr', [
        'adminportal.products.bulkmessaging.operations.interactivecampaigns.introfile',
        'adminportal.products.bulkmessaging.operations.interactivecampaigns.outrofile',
        'adminportal.products.bulkmessaging.operations.interactivecampaigns.pollchoicefile',
        'adminportal.products.bulkmessaging.operations.interactivecampaigns.promotioninstructionfile',
        'adminportal.products.bulkmessaging.operations.interactivecampaigns.questionnairequestionfile',
        'adminportal.products.bulkmessaging.operations.interactivecampaigns.rule',
        'adminportal.products.bulkmessaging.operations.interactivecampaigns.successfulsubscriptionfile',
        'adminportal.products.bulkmessaging.operations.interactivecampaigns.optoutfile'
    ]);

    var BulkMessagingInteractiveCampaignsBulkIVROperationsModule = angular.module('adminportal.products.bulkmessaging.operations.interactivecampaigns.bulkivr');

    BulkMessagingInteractiveCampaignsBulkIVROperationsModule.config(function ($stateProvider) {

        $stateProvider.state('products.bulkmessaging.operations.interactivecampaigns.bulkivr', {
            url: "/bulkivr",
            templateUrl: "products/bulkmessaging/operations/interactivecampaigns/operations.interactivecampaigns.bulkivr.detail.html",
            controller: 'BulkMessagingInteractiveCampaignsOperationsBulkIVRCtrl',
            data: {
                pageHeaderKey: 'Products.BulkMessaging.Operations.InteractiveCampaigns.Title',
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

    BulkMessagingInteractiveCampaignsBulkIVROperationsModule.controller('BulkMessagingInteractiveCampaignsOperationsBulkIVRCtrl', function ($rootScope, $scope, $q, $log, $controller, $state, $stateParams, $uibModal, $filter, notification, $translate, CMPFService, UtilService,
                                                                                                                                            ContentManagementService, SessionService, WorkflowsService, DateTimeConstants, Restangular, BulkMessagingOperationsService, operator,
                                                                                                                                            userAccount, settings, globalWhiteLists, orgDistributionLists, userDistributionLists, BMS_IVR_INTERACTIVITY_TEMPLATES, DURATION_UNITS) {
        $log.debug("BulkMessagingInteractiveCampaignsOperationsBulkIVRCtrl");

        $controller('BulkMessagingCampaignsCommonCtrl', {
            $scope: $scope,
            operator: operator,
            userAccount: userAccount,
            globalWhiteLists: globalWhiteLists,
            orgDistributionLists: orgDistributionLists,
            userDistributionLists: userDistributionLists
        });

        $scope.BMS_INTERACTIVITY_TEMPLATES = BMS_IVR_INTERACTIVITY_TEMPLATES;
        $scope.DURATION_UNITS = DURATION_UNITS;

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
            campaignBlackLists: [],
            messageContent: '',
            tryAndBuyEnabled: false,
            trialPeriod: {
                duration: 1,
                unit: $scope.DURATION_UNITS[0].key
            }
        };
        $scope.listType = undefined;
        $scope.showExtraSettings = false;

        $scope.maxMaxRetryCount = settings.messageRetryMaxCount;
        $scope.blackListEnabled = settings.blackListEnabled;

        $scope.bulkUserProfile = CMPFService.extractBulkUserProfile($scope.userAccount);
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

        $scope.toneList = [];
        $scope.searchPromotedTones = _.throttle(function (text) {
            $scope.toneList = [];
            ContentManagementService.searchTones(0, 100, text, null, true).then(function (response) {
                $scope.toneList = (response ? response.items : []);
            });
        }, 500);

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
                "interactiveIvrCampaignDetail": {
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
                campaignItem.interactiveIvrCampaignDetail.offNetSenderAddresses = _.pluck(campaign.offnetSenders, 'value');
            }

            // If black list settings is enabled and there are defined black list items.
            if ($scope.blackListEnabled && bulkIVRPolicyProfile.isScreeningListsEnforced && campaign.campaignBlackLists && campaign.campaignBlackLists.length > 0) {
                campaignItem.interactiveIvrCampaignDetail.campaignBlackListId = _.pluck(campaign.campaignBlackLists, 'id');
            }

            // If times constraint values are specified, add them to the campaign object.
            if (bulkIVRPolicyProfile.isTimeConstraintEnforced && bulkIVRPolicyProfile.TimeConstraints && bulkIVRPolicyProfile.TimeConstraints.length > 0) {
                campaignItem.interactiveIvrCampaignDetail.timeConstraints = [];
                _.each(bulkIVRPolicyProfile.TimeConstraints, function (timeConstraint) {
                    if (timeConstraint.value && timeConstraint.value.split('-').length > 1) {
                        var timeConstraints = timeConstraint.value.split('-');
                        campaignItem.interactiveIvrCampaignDetail.timeConstraints.push({
                            "startMinuteInWeek": Number(timeConstraints[0]),
                            "endMinuteInWeek": Number(timeConstraints[1]),
                            "finalConstraint": false
                        });
                    }
                });
            }

            // If there is an alphanumeric sender selection.
            if (bulkIVRPolicyProfile.isAlphanumericSenderListRestricted) {
                campaignItem.interactiveIvrCampaignDetail.campaignFrom = campaign.from;
            }

            // Date time preparation
            campaignItem.interactiveIvrCampaignDetail.campaignStartTime = $filter('date')(dateHolder.startDate, 'yyyy-MM-dd\'T\'HH:mm:ss' + DateTimeConstants.OFFSET_WITH_COLON);
            // If selected the expiry forcing option.
            if (campaign.forceExpiryDate) {
                campaignItem.interactiveIvrCampaignDetail.campaignExpiryTime = $filter('date')(dateHolder.endDate, 'yyyy-MM-dd\'T\'HH:mm:ss' + DateTimeConstants.OFFSET_WITH_COLON);
            }

            var contentUploadPromises = [];
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

                // Add intro files
                _.each(campaign.introFileList, function (introFile) {
                    introFile.fileId = UtilService.generateObjectId();

                    campaignContent.globalParameters.introList.push(introFile.fileId);

                    contentUploadPromises.push(ContentManagementService.uploadFile(introFile.file, introFile.file.name, introFile.fileId));
                });

                // Add option files and other necessary informations
                _.each(campaign.optionInfoLists, function (optionInfo) {
                    var choices = [];
                    _.each(optionInfo.choiceFileList, function (choiceFile) {
                        choiceFile.fileId = UtilService.generateObjectId();

                        choices.push(choiceFile.fileId);

                        contentUploadPromises.push(ContentManagementService.uploadFile(choiceFile.file, choiceFile.file.name, choiceFile.fileId));
                    });

                    campaignContent.globalParameters.options.push({
                        "fileIdList": (choices.length > 0 ? choices : []),
                        "dtmfCode": optionInfo.dtmfCode,
                        "identifier": optionInfo.identifier,
                    });
                });

                // Add outro files
                _.each(campaign.outroFileList, function (outroFile) {
                    outroFile.fileId = UtilService.generateObjectId();

                    campaignContent.globalParameters.outroList.push(outroFile.fileId);

                    contentUploadPromises.push(ContentManagementService.uploadFile(outroFile.file, outroFile.file.name, outroFile.fileId));
                });
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

                // Add intro files
                _.each(campaign.introFileList, function (introFile) {
                    introFile.fileId = UtilService.generateObjectId();

                    campaignContent.globalParameters.introList.push(introFile.fileId);

                    contentUploadPromises.push(ContentManagementService.uploadFile(introFile.file, introFile.file.name, introFile.fileId));
                });

                // Add question and answer files
                _.each(campaign.qaInfoLists, function (qaInfo) {
                    var questions = [];
                    _.each(qaInfo.questionFileList, function (questionFile) {
                        questionFile.fileId = UtilService.generateObjectId();

                        questions.push(questionFile.fileId);

                        contentUploadPromises.push(ContentManagementService.uploadFile(questionFile.file, questionFile.file.name, questionFile.fileId));
                    });

                    var questionItem = {
                        "questionList": (questions.length > 0 ? questions : []),
                        "dtmfCodes": qaInfo.dtmfCodes,
                        "identifiers": qaInfo.identifiers
                    };
                    campaignContent.globalParameters.questions.push(questionItem);
                });

                // Add rules
                _.each(campaign.ruleList, function (rule) {
                    campaignContent.globalParameters.rules.push(rule.question.name + ':' + rule.answer.value + ':' + rule.action.value);
                });

                // Add outro files
                _.each(campaign.outroFileList, function (outroFile) {
                    outroFile.fileId = UtilService.generateObjectId();

                    campaignContent.globalParameters.outroList.push(outroFile.fileId);

                    contentUploadPromises.push(ContentManagementService.uploadFile(outroFile.file, outroFile.file.name, outroFile.fileId));
                });
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

                // Add intro files
                _.each(campaign.introFileList, function (introFile) {
                    introFile.fileId = UtilService.generateObjectId();

                    campaignContent.globalParameters.introList.push(introFile.fileId);

                    contentUploadPromises.push(ContentManagementService.uploadFile(introFile.file, introFile.file.name, introFile.fileId));
                });

                // Add option files and other necessary informations
                _.each(campaign.optionInfoLists, function (optionInfo) {
                    var choices = [];
                    _.each(optionInfo.choiceFileList, function (choiceFile) {
                        choiceFile.fileId = UtilService.generateObjectId();

                        choices.push(choiceFile.fileId);

                        contentUploadPromises.push(ContentManagementService.uploadFile(choiceFile.file, choiceFile.file.name, choiceFile.fileId));
                    });

                    var choiceItem = {
                        "fileIdList": (choices.length > 0 ? choices : []),
                        "dtmfCode": optionInfo.dtmfCode,
                        "identifier": optionInfo.identifier,
                        "subscriptionCode": "UNKNOWN"
                    };
                    // Add promotion announcement tone
                    if (optionInfo.promotedTone) {
                        choiceItem.promotedTone = optionInfo.promotedTone.id;

                        if (optionInfo.promotedTone.offers && optionInfo.promotedTone.offers.length > 0) {
                            choiceItem.subscriptionCode = optionInfo.promotedTone.offers[0].subscriptionCode;
                        }
                    }
                    campaignContent.globalParameters.options.push(choiceItem);
                });

                // Add promotion instruction files
                _.each(campaign.promotionInstructionFileList, function (promotionInstructionFile) {
                    promotionInstructionFile.fileId = UtilService.generateObjectId();

                    campaignContent.globalParameters.promotionInstructionList.push(promotionInstructionFile.fileId);

                    contentUploadPromises.push(ContentManagementService.uploadFile(promotionInstructionFile.file, promotionInstructionFile.file.name, promotionInstructionFile.fileId));
                });

                // Add successful subscription announcement files
                _.each(campaign.successfulSubscriptionFileList, function (successfulSubscriptionFile) {
                    successfulSubscriptionFile.fileId = UtilService.generateObjectId();

                    campaignContent.globalParameters.subscriptionAcknowledgementList.push(successfulSubscriptionFile.fileId);

                    contentUploadPromises.push(ContentManagementService.uploadFile(successfulSubscriptionFile.file, successfulSubscriptionFile.file.name, successfulSubscriptionFile.fileId));
                });

                // Add out-out announcement files
                _.each(campaign.optOutFileList, function (optoutFile) {
                    optoutFile.fileId = UtilService.generateObjectId();

                    campaignContent.globalParameters.optoutAcknowledgementList.push(optoutFile.fileId);

                    contentUploadPromises.push(ContentManagementService.uploadFile(optoutFile.file, optoutFile.file.name, optoutFile.fileId));
                });

                // Add outro files
                _.each(campaign.outroFileList, function (outroFile) {
                    outroFile.fileId = UtilService.generateObjectId();

                    campaignContent.globalParameters.outroList.push(outroFile.fileId);

                    contentUploadPromises.push(ContentManagementService.uploadFile(outroFile.file, outroFile.file.name, outroFile.fileId));
                });
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

                // Add intro files
                _.each(campaign.introFileList, function (introFile) {
                    introFile.fileId = UtilService.generateObjectId();

                    campaignContent.globalParameters.introList.push(introFile.fileId);

                    contentUploadPromises.push(ContentManagementService.uploadFile(introFile.file, introFile.file.name, introFile.fileId));
                });

                // Add question and answer files
                _.each(campaign.qaInfoLists, function (qaInfo) {
                    var questions = [];
                    _.each(qaInfo.questionFileList, function (questionFile) {
                        questionFile.fileId = UtilService.generateObjectId();

                        questions.push(questionFile.fileId);

                        contentUploadPromises.push(ContentManagementService.uploadFile(questionFile.file, questionFile.file.name, questionFile.fileId));
                    });

                    var questionAnswerItem = {
                        "questionList": (questions.length > 0 ? questions : []),
                        "dtmfCodes": qaInfo.dtmfCodes,
                        "identifiers": qaInfo.identifiers,
                        "promotions": []
                    };
                    // Add promotion announcement tones
                    if (qaInfo.promotedTones) {
                        _.each(qaInfo.promotedTones, function (promotedTone) {
                            var promotionItem = {
                                "promotedTone": promotedTone ? promotedTone.id : "",
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

                // Add promotion instruction files
                _.each(campaign.promotionInstructionFileList, function (promotionInstructionFile) {
                    promotionInstructionFile.fileId = UtilService.generateObjectId();

                    campaignContent.globalParameters.promotionInstructionList.push(promotionInstructionFile.fileId);

                    contentUploadPromises.push(ContentManagementService.uploadFile(promotionInstructionFile.file, promotionInstructionFile.file.name, promotionInstructionFile.fileId));
                });

                // Add successful subscription announcement files
                _.each(campaign.successfulSubscriptionFileList, function (successfulSubscriptionFile) {
                    successfulSubscriptionFile.fileId = UtilService.generateObjectId();

                    campaignContent.globalParameters.subscriptionAcknowledgementList.push(successfulSubscriptionFile.fileId);

                    contentUploadPromises.push(ContentManagementService.uploadFile(successfulSubscriptionFile.file, successfulSubscriptionFile.file.name, successfulSubscriptionFile.fileId));
                });

                // Add out-out announcement files
                _.each(campaign.optOutFileList, function (optoutFile) {
                    optoutFile.fileId = UtilService.generateObjectId();

                    campaignContent.globalParameters.optoutAcknowledgementList.push(optoutFile.fileId);

                    contentUploadPromises.push(ContentManagementService.uploadFile(optoutFile.file, optoutFile.file.name, optoutFile.fileId));
                });

                // Add outro files
                _.each(campaign.outroFileList, function (outroFile) {
                    outroFile.fileId = UtilService.generateObjectId();

                    campaignContent.globalParameters.outroList.push(outroFile.fileId);

                    contentUploadPromises.push(ContentManagementService.uploadFile(outroFile.file, outroFile.file.name, outroFile.fileId));
                });
            }
            // RBT Outdial
            else if (campaign.interactivityTemplate.value === 'RBT Outdial') {
                campaignContent = {
                    "campaignTemplate": "RBT_OUTDIAL",
                    "globalParameters": {
                        "introList": [],
                        "promotedTone": null,
                        "subscriptionCode": "UNKNOWN",
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

                // Add intro files
                _.each(campaign.introFileList, function (introFile) {
                    introFile.fileId = UtilService.generateObjectId();

                    campaignContent.globalParameters.introList.push(introFile.fileId);

                    contentUploadPromises.push(ContentManagementService.uploadFile(introFile.file, introFile.file.name, introFile.fileId));
                });

                // Add promotion announcement tone
                if (campaign.promotedTone) {
                    campaignContent.globalParameters.promotedTone = campaign.promotedTone.id;

                    if (campaign.promotedTone.offers && campaign.promotedTone.offers.length > 0) {
                        campaignContent.globalParameters.subscriptionCode = campaign.promotedTone.offers[0].subscriptionCode;
                    }
                }

                // Add promotion instruction files
                _.each(campaign.promotionInstructionFileList, function (promotionInstructionFile) {
                    promotionInstructionFile.fileId = UtilService.generateObjectId();

                    campaignContent.globalParameters.promotionInstructionList.push(promotionInstructionFile.fileId);

                    contentUploadPromises.push(ContentManagementService.uploadFile(promotionInstructionFile.file, promotionInstructionFile.file.name, promotionInstructionFile.fileId));
                });

                // Add successful subscription announcement files
                _.each(campaign.successfulSubscriptionFileList, function (successfulSubscriptionFile) {
                    successfulSubscriptionFile.fileId = UtilService.generateObjectId();

                    campaignContent.globalParameters.subscriptionAcknowledgementList.push(successfulSubscriptionFile.fileId);

                    contentUploadPromises.push(ContentManagementService.uploadFile(successfulSubscriptionFile.file, successfulSubscriptionFile.file.name, successfulSubscriptionFile.fileId));
                });

                // Add out-out announcement files
                _.each(campaign.optOutFileList, function (optoutFile) {
                    optoutFile.fileId = UtilService.generateObjectId();

                    campaignContent.globalParameters.optoutAcknowledgementList.push(optoutFile.fileId);

                    contentUploadPromises.push(ContentManagementService.uploadFile(optoutFile.file, optoutFile.file.name, optoutFile.fileId));
                });

                // Add outro files
                _.each(campaign.outroFileList, function (outroFile) {
                    outroFile.fileId = UtilService.generateObjectId();

                    campaignContent.globalParameters.outroList.push(outroFile.fileId);

                    contentUploadPromises.push(ContentManagementService.uploadFile(outroFile.file, outroFile.file.name, outroFile.fileId));
                });
            }
            // RBT Fast-Key
            else if (campaign.interactivityTemplate.value === 'RBT Fast-Key') {
                campaignContent = {
                    "campaignTemplate": "RBT_FASTKEY",
                    "globalParameters": {
                        "promotedToneList": [],
                        "tryAndBuyEnabled": campaign.tryAndBuyEnabled
                    }
                };

                if (campaign.tryAndBuyEnabled) {
                    campaignContent.globalParameters.trialPeriod = UtilService.convertSimpleObjectToPeriod(campaign.trialPeriod);
                }

                // Add successful promoted tone files
                _.each(campaign.promotedToneList, function (promotedTone) {
                    campaignContent.globalParameters.promotedToneList.push({
                        "id": promotedTone.id,
                        "name": promotedTone.name,
                        "organizationId": promotedTone.organizationId,
                        "organizationName": promotedTone.organizationName,
                        "subscriptionCode": (promotedTone.offers && promotedTone.offers.length > 0 ? promotedTone.offers[0].subscriptionCode : ''),
                        "artistIds": (promotedTone.artistIds && promotedTone.artistIds.length > 0 ? promotedTone.artistIds : [])
                    });
                });
            }

            campaignItem.interactiveIvrCampaignDetail.campaignContent = JSON.stringify(campaignContent);
            campaignItem.campaignDetail = angular.copy(campaignItem.interactiveIvrCampaignDetail);
            delete campaignItem.interactiveIvrCampaignDetail;

            $q.all(contentUploadPromises).then(function (result) {
                var promise = null;
                if (campaign.interactivityTemplate.value === 'RBT Fast-Key') {
                    promise = WorkflowsService.createInteractiveCampaignFastKey(campaignItem);
                } else {
                    promise = WorkflowsService.createInteractiveCampaignIvr(campaignItem);
                }

                // Interactive Campaign create method of the flow service.
                promise.then(function (response) {
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

        $scope.interactivityTemplateChanged = function (template) {
            if (template.value == "RBT Fast-Key") {
                $scope.showExtraSettings = true;
                $log.debug("forceExpiry: ", $scope.campaign.forceExpiryDate);
                $scope.campaign.forceExpiryDate = true;
            } else {
                $scope.showExtraSettings = false;
                $scope.campaign.forceExpiryDate = false;
                $scope.bulkIVRPolicyProfile.isScreeningListsEnforced = false;
                $scope.bulkIVRPolicyProfile.isTimeConstraintEnforced = false;
            }
        };

        $scope.forceExpiryDisabled = function () {
            if ($scope.campaign.interactivityTemplate && $scope.campaign.interactivityTemplate.value == "RBT Fast-Key") {
                return true;
            }
            return false;
        };

        $controller('BulkMessagingInteractiveCampaignsOperationsIntroFileCtrl', {$scope: $scope});
        $controller('BulkMessagingInteractiveCampaignsOperationsOutroFileCtrl', {$scope: $scope});
        $controller('BulkMessagingInteractiveCampaignsOperationsPollChoiceFileCtrl', {$scope: $scope});
        $controller('BulkMessagingInteractiveCampaignsOperationsPromotionInstructionFileCtrl', {$scope: $scope});
        $controller('BulkMessagingInteractiveCampaignsOperationsQuestionnaireQuestionFileCtrl', {$scope: $scope});
        $controller('BulkMessagingInteractiveCampaignsOperationsRuleCtrl', {$scope: $scope});
        $controller('BulkMessagingInteractiveCampaignsOperationsSuccessfulSubscriptionFileCtrl', {$scope: $scope});
        $controller('BulkMessagingInteractiveCampaignsOperationsOptOutFileCtrl', {$scope: $scope});
    });

})();
