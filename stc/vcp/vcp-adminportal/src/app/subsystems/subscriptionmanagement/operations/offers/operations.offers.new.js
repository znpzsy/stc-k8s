(function () {

    'use strict';

    angular.module('adminportal.subsystems.subscriptionmanagement.operations.offers.new', []);

    var SubscriptionManagementOperationsNewOffersModule = angular.module('adminportal.subsystems.subscriptionmanagement.operations.offers.new');

    SubscriptionManagementOperationsNewOffersModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.subscriptionmanagement.operations.offers.new', {
            url: "/new",
            templateUrl: "subsystems/subscriptionmanagement/operations/offers/operations.offers.detail.html",
            controller: 'SubscriptionManagementOperationsOffersNewCtrl',
            resolve: {
                shortCodesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_SHORT_CODES_ORGANIZATION_NAME);
                },
                packageList: function (CMPFService) {
                    return CMPFService.getOrphanProfilesByProfileDefName(CMPFService.PACKAGE_LIST_PROFILE);
                },
                businessTypesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_BUSINESS_TYPES_ORGANIZATION_NAME);
                },
                settlementTypesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_SETTLEMENT_TYPES_ORGANIZATION_NAME);
                },
                serviceCategoriesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_SERVICE_CATEGORIES_ORGANIZATION_NAME);
                }
            }
        });

    });

    SubscriptionManagementOperationsNewOffersModule.controller('SubscriptionManagementOperationsOffersNewCtrl', function ($rootScope, $scope, $log, $controller, $filter, $uibModal, $translate, notification, UtilService, SessionService,
                                                                                                                          CMPFService, WorkflowsService, shortCodesOrganization, businessTypesOrganization, settlementTypesOrganization,
                                                                                                                          serviceCategoriesOrganization, packageList) {
        $log.debug('SubscriptionManagementOperationsOffersNewCtrl');

        $controller('SubscriptionManagementOperationsOffersCommonCtrl', {
            $scope: $scope,
            businessTypesOrganization: businessTypesOrganization,
            settlementTypesOrganization: settlementTypesOrganization,
            serviceCategoriesOrganization: serviceCategoriesOrganization,
            packageList: packageList
        });

        var sessionOrganization = SessionService.getSessionOrganization();
        var username = SessionService.getUsername();

        $scope.dateHolder.startDate = null;
        $scope.dateHolder.endDate = null;

        $scope.shortCodesOrganization = shortCodesOrganization.organizations[0];
        $scope.shortCodes = CMPFService.getShortCodes($scope.shortCodesOrganization);
        $scope.shortCodes = $filter('orderBy')($scope.shortCodes, 'ShortCode');

        // Empty offer object.
        $scope.offer = {
            name: '',
            state: 'ACTIVE',
            // Profiles
            offeri18nProfiles: [
                {
                    Language: 'EN',
                    Name: '',
                    Description: '',
                    SearchKeyword: '',
                    SubscriptionDescription: '',
                    UnsubscriptionDescription: ''
                },
                {
                    Language: 'AR',
                    Name: '',
                    Description: '',
                    SearchKeyword: '',
                    SubscriptionDescription: '',
                    UnsubscriptionDescription: ''
                }
            ],
            offerBundlingProfile:{
                BundlingEnabled: false,
                BundlingOption: "STC"
            },
            xsmOfferProfile: {
                Description: '',
                FirstSubscriptionDate: null,
                LastSubscriptionDate: null,
                NotificationEventDuration: {
                    duration: 0,
                    unit: $scope.DURATION_UNITS[0].key
                },
                ConfirmationEventDuration: {
                    duration: 0,
                    unit: $scope.DURATION_UNITS[0].key
                },
                NotifySubscriberOnStateChanges: true,
                NotificationSenderID: 'STC',
                TerminationPolicy: 'ImmediateTermination',
                SubscriptionDuration: 0,
                NotificationEventTimeRelativeFromCharging: 0
            },
            xsmChargingProfile: {
                ChargingPeriod: {
                    duration: 0,
                    unit: $scope.DURATION_UNITS[0].key
                },
                MainPrice: 0,
                ChargingPolicy: 'Immediate',
                Handler: 'Suspended',
                InitialChargingPolicy: 'ChargingOnAttempt',
                MaxFailedChargingAttemptCount: 0,
                ChargingFailurePolicy: 'ContinueWithDebt',
                RetryPeriod: {
                    duration: 0,
                    unit: $scope.DURATION_UNITS[0].key
                },
                MaxRetryCount: 180,
                PartialChargingEnabled: false,
                SmartChargingEnabled: false,
                MicroChargingEnabled: false,
                MicroChargingPeriod: {
                    duration: 0,
                    unit: $scope.DURATION_UNITS[0].key
                },
                MicroPrice: 0,
                MicroChargingEnabledAtInitialSubscription: false,
                MicroChargingEnabledAtRenewals: false,
                MicroChargingEnabledAtTrialEnd: false,
                MaxMicroChargingEventCount: 60,
                ChargeOn: 'MT'
            },
            xsmRenewalProfile: {
                RenewalPolicy: 'Auto',
                AllowedNextRenewalNotificationPeriod: {
                    duration: 0,
                    unit: $scope.DURATION_UNITS[0].key
                },
                BlacklistedSubscriberPolicy: 'SuspendSubscription'
            },
            xsmTrialProfile: {
                TryAndBuyEnabled: false,
                TryAndBuyPolicy: 'AutoBuyWithoutNotification',
                TrialPeriod: {
                    duration: 1,
                    unit: $scope.DURATION_UNITS[0].key
                },
                NextAllowedTrialUsagePeriod: {
                    duration: 60,
                    unit: $scope.DURATION_UNITS[0].key
                },
                TrialByDefault: true,
                NotificationEventDuration: {
                    duration: 28,
                    unit: $scope.DURATION_UNITS[0].key
                },
                ConfirmationEventDuration: {
                    duration: 28,
                    unit: $scope.DURATION_UNITS[0].key
                },
                NextOfferId: 0,
                NextOfferSubscriptionText: ''
            },
            smsPortali18nProfileList: [],
            offerEligibilityProfile: {
                PackageEligibility: 'NoControl',
                PackageList: null
            },
            subscriptionRenewalNotificationProfile: {
                RecurRenewalCount: 0
            },
            bundleOfferProfile: {
                BusinessTypeID: null,
                SettlementTypeID: null,
                CategoryID: null,
                BundleID: 'DSP'
            }
        };
        $scope.selectedServices = [];

        $scope.save = function (offer) {
            var offerItem = {
                name: offer.name,
                organizationId: offer.organizationId,
                state: offer.state,
                profiles: [],
                services: $scope.selectedServices
            };
            if(offer.offerBundlingProfile.BundlingEnabled && offer.offerBundlingProfile.BundlingOption === 'STC'){
                offerItem.state = 'PENDING';
            }

            // Offeri18nProfile
            var offeri18nProfiles = $scope.prepareOfferi18nProfiles(offer.offeri18nProfiles);
            offerItem.profiles = offerItem.profiles.concat(offeri18nProfiles);

            // XsmOfferProfile
            offer.xsmOfferProfile.LastUpdateTime = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');
            var xsmOfferProfile = $scope.prepareXsmOfferProfile($scope.dateHolder, offer.xsmOfferProfile);
            offerItem.profiles.push(xsmOfferProfile);

            // XsmChargingProfile
            if (offer.xsmChargingProfile.PartialChargingEnabled) {
                offer.xsmChargingProfile.MicroChargingEnabled = false;
                offer.xsmChargingProfile.SmartChargingEnabled = false;
            }
            var xsmChargingProfile = $scope.prepareXsmChargingProfile(offer.xsmChargingProfile);
            offerItem.profiles.push(xsmChargingProfile);

            // XsmRenewalProfile
            var xsmRenewalProfile = $scope.prepareXsmRenewalProfile(offer.xsmRenewalProfile);
            offerItem.profiles.push(xsmRenewalProfile);

            // XsmTrialProfile
            if (offer.xsmTrialProfile) {
                var xsmTrialProfile = $scope.prepareXsmTrialProfile(offer.xsmTrialProfile);
                offerItem.profiles.push(xsmTrialProfile);
            }

            // SMSPortali18nProfile
            var smsPortali18nProfiles = $scope.prepareSMSPortali18nProfiles(offer.smsPortali18nProfileList);
            offerItem.profiles = offerItem.profiles.concat(smsPortali18nProfiles);

            // OfferEligibilityProfile
            var offerEligibilityProfile = $scope.prepareOfferEligibilityProfile(offer.offerEligibilityProfile);
            offerItem.profiles.push(offerEligibilityProfile);

            // SubscriptionRenewalNotificationProfile
            if (offer.subscriptionRenewalNotificationProfile && offer.xsmRenewalProfile.RenewalPolicy !== 'NoRenewal') {
                var subscriptionRenewalNotificationProfile = $scope.prepareSubscriptionRenewalNotificationProfile(offer.subscriptionRenewalNotificationProfile);
                offerItem.profiles.push(subscriptionRenewalNotificationProfile);
            }

            // BundleOfferProfile
            if ($scope.selectedServices && $scope.selectedServices.length > 1 && offer.bundleOfferProfile) {
                var bundleOfferProfile = $scope.prepareBundleOfferProfile(offer.bundleOfferProfile);
                offerItem.profiles.push(bundleOfferProfile);
            }

            if ($scope.selectedServices && $scope.selectedServices.length > 1 && offer.offerBundlingProfile && offer.offerBundlingProfile.BundlingOption === "STC" && $scope.servicePriceData && $scope.servicePriceData.length > 0){
                for(var i = 0; i< $scope.servicePriceData.length ; i++){
                    var revshareProfile = $scope.perpareOfferBundlingRevshareProfile($scope.servicePriceData[i]);
                    offerItem.profiles.push(revshareProfile);
                }
            }

            // OfferBundlingProfile
            if (offer.offerBundlingProfile) {
                var copyOfferBundlingProfile = angular.copy(offer.offerBundlingProfile);

                if (copyOfferBundlingProfile.BundlingEnabled && copyOfferBundlingProfile.BundlingOption !== 'STC') {
                    if(copyOfferBundlingProfile.BundlingType === "SOFT_BUNDLE" && copyOfferBundlingProfile.MainOfferList){
                        copyOfferBundlingProfile.MainOfferList = copyOfferBundlingProfile.MainOfferList.join('|');
                    }
                    else{
                        copyOfferBundlingProfile.MainOfferList = '';
                    }

                    if (copyOfferBundlingProfile.EligibilityEvalCustomerProfiles && copyOfferBundlingProfile.EligibilityEvalCustomerProfiles.length > 0) {
                        copyOfferBundlingProfile.EligibilityEvalCustomerProfiles = _.pluck(copyOfferBundlingProfile.EligibilityEvalCustomerProfiles, 'Name').join('|');
                    } else {
                        copyOfferBundlingProfile.EligibilityEvalCustomerProfiles = '';
                    }
                } else {
                    copyOfferBundlingProfile.BundlingType = "STC";
                    copyOfferBundlingProfile.EligibilityEvalPolicy = '';
                    copyOfferBundlingProfile.EligibilityEvalCustomerProfiles = '';
                    copyOfferBundlingProfile.MainOfferEvalPolicy = '';
                    copyOfferBundlingProfile.MainOfferList = '';
                }

                var offerBundlingProfile = $scope.prepareOfferBundlingProfile(copyOfferBundlingProfile);
                offerItem.profiles.push(offerBundlingProfile);
            }

            $log.debug('Trying to create offer: ', offerItem);
            var offerItemPayload = {
                "from": {
                    "isAdmin": $rootScope.isAdminUser,
                    "userId": username,
                    "orgId": sessionOrganization.name,
                    "groupId": null
                },
                "to": {
                    "userId": null,
                    "orgId": null,
                    "groupId": CMPFService.DSP_BUSINESS_ADMIN_GROUP
                },
                "offerDetail": offerItem
            };
            $log.debug('Trying to create offer: ', offerItemPayload);
            // Offer create method of the flow service.
            WorkflowsService.createOffer(offerItemPayload).then(function (response) {
                if (response) {
                    if(response.code === 2001){
                        notification.flash({
                            type: 'success',
                            text: $translate.instant('Subsystems.SubscriptionManagement.Operations.Offers.Messages.OfferCreateFlowStartedSuccessful' + ($rootScope.isAdminUser ? 'ForAdmin' : ''))
                        });

                        $scope.cancel();
                    }
                    else{
                        $log.error('Cannot call the offer create flow service. Error: ', response.detail);

                        notification({
                            type: 'warning',
                            text: $translate.instant('Subsystems.SubscriptionManagement.Operations.Offers.Messages.OfferCreateFlowError')
                        });
                    }

                }

            }, function (response) {
                $log.error('Cannot call the offer create flow service. Error: ', response);

                notification({
                    type: 'warning',
                    text: $translate.instant('Subsystems.SubscriptionManagement.Operations.Offers.Messages.OfferCreateFlowError')
                });
            });
        };
    });

})();
