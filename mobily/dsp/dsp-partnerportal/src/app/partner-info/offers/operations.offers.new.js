(function () {

    'use strict';

    angular.module('partnerportal.partner-info.offers.new', []);

    var PartnerInfoOffersNewOfferModule = angular.module('partnerportal.partner-info.offers.new');

    PartnerInfoOffersNewOfferModule.config(function ($stateProvider) {

        $stateProvider.state('partner-info.offers.new', {
            url: "/new",
            templateUrl: "partner-info/offers/operations.offers.detail.html",
            controller: 'PartnerInfoOffersNewOfferCtrl',
            data: {
                cancelState: "partner-info.offers.list"
            },
            resolve: {
                businessTypesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_BUSINESS_TYPES_ORGANIZATION_NAME);
                },
                settlementTypesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_SETTLEMENT_TYPES_ORGANIZATION_NAME);
                },
                serviceCategoriesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_SERVICE_CATEGORIES_ORGANIZATION_NAME);
                },
                shortCodesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_SHORT_CODES_ORGANIZATION_NAME);
                },
                packageList: function (CMPFService) {
                    return CMPFService.getOrphanProfilesByProfileDefName(CMPFService.PACKAGE_LIST_PROFILE);
                },
                offer: function () {
                    return null;
                }
            }
        }).state('partner-info.offers.resendcreatetask', {
            url: "/resend-create/:id",
            templateUrl: "partner-info/offers/operations.offers.detail.html",
            controller: 'PartnerInfoOffersNewOfferCtrl',
            data: {
                cancelState: {url: "workflows.operations.tasks", params: {taskStatus: 'rejected'}}
            },
            resolve: {
                businessTypesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_BUSINESS_TYPES_ORGANIZATION_NAME);
                },
                settlementTypesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_SETTLEMENT_TYPES_ORGANIZATION_NAME);
                },
                serviceCategoriesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_SERVICE_CATEGORIES_ORGANIZATION_NAME);
                },
                shortCodesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_SHORT_CODES_ORGANIZATION_NAME);
                },
                packageList: function (CMPFService) {
                    return CMPFService.getOrphanProfilesByProfileDefName(CMPFService.PACKAGE_LIST_PROFILE);
                },
                offer: function ($stateParams, $q, WorkflowsService) {
                    var deferred = $q.defer();

                    WorkflowsService.getOffer($stateParams.id).then(function (offerResponse) {
                        deferred.resolve(offerResponse.objectDetail);
                    }, function (errorResponse) {
                        deferred.reject(errorResponse);
                    });

                    return deferred.promise;
                }
            }
        });

    });

    PartnerInfoOffersNewOfferModule.controller('PartnerInfoOffersNewOfferCtrl', function ($rootScope, $scope, $log, $controller, $filter, $uibModal, notification, $translate, UtilService, SessionService,
                                                                                          CMPFService, WorkflowsService, shortCodesOrganization, businessTypesOrganization, settlementTypesOrganization,
                                                                                          serviceCategoriesOrganization, packageList, offer) {
        $log.debug('PartnerInfoOffersNewOfferCtrl');

        $controller('PartnerInfoOffersCommonCtrl', {
            $scope: $scope,
            shortCodesOrganization: shortCodesOrganization,
            businessTypesOrganization: businessTypesOrganization,
            settlementTypesOrganization: settlementTypesOrganization,
            serviceCategoriesOrganization: serviceCategoriesOrganization,
            packageList: packageList
        });

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
                NotificationSenderID: 'MOBILY',
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

        $scope.dateHolder.startDate = null;
        $scope.dateHolder.endDate = null;

        $scope.initializeBusinessTypeList();

        // If coming here from the create task page for resending the form with little updates for create again.
        if (offer) {
            $controller('PartnerInfoOffersUpdateOfferCtrl', {
                $scope: $scope,
                shortCodesOrganization: shortCodesOrganization,
                businessTypesOrganization: businessTypesOrganization,
                settlementTypesOrganization: settlementTypesOrganization,
                serviceCategoriesOrganization: serviceCategoriesOrganization,
                packageList: packageList,
                offer: offer
            });
        }

        $scope.save = function (offer) {
            var offerItem = {
                name: offer.name,
                organizationId: SessionService.getSessionOrganization().id,
                state: offer.state,
                services: $scope.selectedServices,
                profiles: []
            };

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

            // Workflows special offer object
            var offerItemPayload = {
                "from": {
                    "userId": $scope.username,
                    "orgId": $scope.sessionOrganization.name,
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
                if (response && response.code === 2001) {
                    notification.flash({
                        type: 'success',
                        text: $translate.instant('PartnerInfo.Offers.Messages.OfferCreateFlowStartedSuccessful')
                    });

                    $scope.cancel();
                } else {
                    notification({
                        type: 'warning',
                        text: response.detail
                    });
                }
            }, function (response) {
                $log.error('Cannot call the offer create flow service. Error: ', response);

                if (response && response.data && response.data.detail) {
                    notification({
                        type: 'warning',
                        text: response.data.detail
                    });
                } else {
                    notification({
                        type: 'warning',
                        text: $translate.instant('PartnerInfo.Offers.Messages.OfferCreateFlowError')
                    });
                }
            });
        };
    });

})();
