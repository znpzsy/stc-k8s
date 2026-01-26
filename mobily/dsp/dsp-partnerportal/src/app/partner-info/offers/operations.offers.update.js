(function () {

    'use strict';

    angular.module('partnerportal.partner-info.offers.update', []);

    var PartnerInfoOffersUpdateOfferModule = angular.module('partnerportal.partner-info.offers.update');

    PartnerInfoOffersUpdateOfferModule.config(function ($stateProvider) {

        $stateProvider.state('partner-info.offers.update', {
            url: "/:id",
            templateUrl: "partner-info/offers/operations.offers.detail.html",
            controller: 'PartnerInfoOffersUpdateOfferCtrl',
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
                offer: function ($stateParams, CMPFService) {
                    return CMPFService.getOffer($stateParams.id, true, true);
                }
            }
        }).state('partner-info.offers.resendupdatetask', {
            url: "/resend-update/:id",
            templateUrl: "partner-info/offers/operations.offers.detail.html",
            controller: 'PartnerInfoOffersUpdateOfferCtrl',
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

    PartnerInfoOffersUpdateOfferModule.controller('PartnerInfoOffersUpdateOfferCtrl', function ($rootScope, $scope, $log, $controller, $filter, $uibModal, notification, $translate, Restangular,
                                                                                                UtilService, CMPFService, SessionService, DateTimeConstants, WorkflowsService, offer, shortCodesOrganization,
                                                                                                businessTypesOrganization, settlementTypesOrganization, serviceCategoriesOrganization, packageList) {
        $log.debug('PartnerInfoOffersUpdateOfferCtrl');

        $controller('PartnerInfoOffersCommonCtrl', {
            $scope: $scope,
            shortCodesOrganization: shortCodesOrganization,
            businessTypesOrganization: businessTypesOrganization,
            settlementTypesOrganization: settlementTypesOrganization,
            serviceCategoriesOrganization: serviceCategoriesOrganization,
            packageList: packageList
        });

        $scope.offer = Restangular.stripRestangular(offer);

        // Offeri18nProfile
        $scope.offer.offeri18nProfiles = [];
        var offeri18nProfiles = CMPFService.getProfileAttributes($scope.offer.profiles, CMPFService.OFFER_I18N_PROFILE);
        if (offeri18nProfiles.length > 0) {
            var offeri18nProfilesEn = _.findWhere(offeri18nProfiles, {Language: 'EN'});
            if (offeri18nProfilesEn) {
                $scope.offer.offeri18nProfiles.push(offeri18nProfilesEn);
            } else {
                $scope.offer.offeri18nProfiles.push({
                    Language: 'EN',
                    Name: '',
                    Description: '',
                    SearchKeyword: '',
                    SubscriptionDescription: '',
                    UnsubscriptionDescription: ''
                });
            }

            var offeri18nProfilesAr = _.findWhere(offeri18nProfiles, {Language: 'AR'});
            if (offeri18nProfilesAr) {
                $scope.offer.offeri18nProfiles.push(offeri18nProfilesAr);
            } else {
                $scope.offer.offeri18nProfiles.push({
                    Language: 'AR',
                    Name: '',
                    Description: '',
                    SearchKeyword: '',
                    SubscriptionDescription: '',
                    UnsubscriptionDescription: ''
                });
            }
        }

        // XsmOfferProfile
        $scope.dateHolder.startDate = null;
        $scope.dateHolder.endDate = null;
        $scope.offer.xsmOfferProfile = {};
        var xsmOfferProfiles = CMPFService.getProfileAttributes($scope.offer.profiles, CMPFService.XSM_OFFER_PROFILE);
        if (xsmOfferProfiles.length > 0) {
            $scope.offer.xsmOfferProfile = angular.copy(xsmOfferProfiles[0]);

            $scope.offer.xsmOfferProfile.NotificationEventDuration = UtilService.convertPeriodStringToSimpleObject($scope.offer.xsmOfferProfile.NotificationEventDuration);
            $scope.offer.xsmOfferProfile.ConfirmationEventDuration = UtilService.convertPeriodStringToSimpleObject($scope.offer.xsmOfferProfile.ConfirmationEventDuration);

            if ($scope.offer.xsmOfferProfile.FirstSubscriptionDate) {
                $scope.dateHolder.startDate = new Date(moment($scope.offer.xsmOfferProfile.FirstSubscriptionDate).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss'));
            }

            if ($scope.offer.xsmOfferProfile.LastSubscriptionDate) {
                $scope.dateHolder.endDate = new Date(moment($scope.offer.xsmOfferProfile.LastSubscriptionDate).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss'));
            }
        }

        // XsmChargingProfile
        var xsmChargingProfiles = CMPFService.getProfileAttributes($scope.offer.profiles, CMPFService.XSM_CHARGING_PROFILE);
        if (xsmChargingProfiles.length > 0) {
            $scope.offer.xsmChargingProfile = angular.copy(xsmChargingProfiles[0]);

            $scope.offer.xsmChargingProfile.ChargingPeriod = UtilService.convertPeriodStringToSimpleObject($scope.offer.xsmChargingProfile.ChargingPeriod);
            $scope.offer.xsmChargingProfile.RetryPeriod = UtilService.convertPeriodStringToSimpleObject($scope.offer.xsmChargingProfile.RetryPeriod);
            $scope.offer.xsmChargingProfile.MicroChargingPeriod = UtilService.convertPeriodStringToSimpleObject($scope.offer.xsmChargingProfile.MicroChargingPeriod);
        }

        // XsmRenewalProfile
        var xsmRenewalProfiles = CMPFService.getProfileAttributes($scope.offer.profiles, CMPFService.XSM_RENEWAL_PROFILE);
        if (xsmRenewalProfiles.length > 0) {
            $scope.offer.xsmRenewalProfile = angular.copy(xsmRenewalProfiles[0]);
        } else {
            $scope.offer.xsmRenewalProfile = {
                RenewalPolicy: null,
                AllowedNextRenewalNotificationPeriod: {
                    duration: 0,
                    unit: $scope.DURATION_UNITS[0].key
                },
                BlacklistedSubscriberPolicy: null
            };
        }

        // XsmTrialProfile
        var xsmTrialProfiles = CMPFService.getProfileAttributes($scope.offer.profiles, CMPFService.XSM_TRIAL_PROFILE);
        if (xsmTrialProfiles.length > 0) {
            $scope.offer.xsmTrialProfile = angular.copy(xsmTrialProfiles[0]);

            $scope.offer.xsmTrialProfile.TrialPeriod = UtilService.convertPeriodStringToSimpleObject($scope.offer.xsmTrialProfile.TrialPeriod);
            $scope.offer.xsmTrialProfile.NextAllowedTrialUsagePeriod = UtilService.convertPeriodStringToSimpleObject($scope.offer.xsmTrialProfile.NextAllowedTrialUsagePeriod);
        } else {
            $scope.offer.xsmTrialProfile = {
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
            }
        }

        // SMSPortali18nProfile
        var smsPortali18nProfiles = CMPFService.getProfileAttributes($scope.offer.profiles, CMPFService.SMS_PORTAL_I18N_PROFILE);
        $scope.offer.smsPortali18nProfileList = [];
        if (smsPortali18nProfiles.length > 0) {
            _.each(smsPortali18nProfiles, function (smsPortali18nProfile) {
                $scope.offer.smsPortali18nProfileList.push(smsPortali18nProfile);
            });

            $scope.offer.smsPortali18nProfileList = $filter('orderBy')($scope.offer.smsPortali18nProfileList, ['Language']);
        }

        // OfferEligibilityProfile
        var offerEligibilityProfiles = CMPFService.getProfileAttributes($scope.offer.profiles, CMPFService.OFFER_ELIGIBILITY_PROFILE);
        if (offerEligibilityProfiles.length > 0) {
            $scope.offer.offerEligibilityProfile = angular.copy(offerEligibilityProfiles[0]);

            if ($scope.offer.offerEligibilityProfile.PackageList) {
                $scope.offer.offerEligibilityProfile.PackageList = $scope.offer.offerEligibilityProfile.PackageList.split(';');
            }
        }

        // SubscriptionRenewalNotificationProfile
        var subscriptionRenewalNotificationProfiles = CMPFService.getProfileAttributes($scope.offer.profiles, CMPFService.SUBSCRIPTION_RENEWAL_NOTIFICATION_PROFILE);
        if (subscriptionRenewalNotificationProfiles.length > 0) {
            $scope.offer.subscriptionRenewalNotificationProfile = angular.copy(subscriptionRenewalNotificationProfiles[0]);

            if ($scope.offer.subscriptionRenewalNotificationProfile.RecurRenewalCount && $scope.offer.subscriptionRenewalNotificationProfile.RecurRenewalCount >= 1) {
                $scope.offer.subscriptionRenewalNotificationProfile.RecurRenewalCount = 1;
            } else {
                $scope.offer.subscriptionRenewalNotificationProfile.RecurRenewalCount = 0;
            }
        }

        // BundleOfferProfile
        var bundleOfferProfiles = CMPFService.getProfileAttributes($scope.offer.profiles, CMPFService.BUNDLE_OFFER_PROFILE);
        if (bundleOfferProfiles.length > 0) {
            $scope.offer.bundleOfferProfile = angular.copy(bundleOfferProfiles[0]);
        } else {
            $scope.offer.bundleOfferProfile = {SettlementTypeID: null};
        }

        $scope.initializeBusinessTypeList();

        // EntityAuditProfile
        var entityAuditProfiles = CMPFService.getProfileAttributes($scope.offer.profiles, CMPFService.ENTITY_AUDIT_PROFILE);
        if (entityAuditProfiles.length > 0) {
            $scope.offer.entityAuditProfile = angular.copy(entityAuditProfiles[0]);
        }

        $scope.originalOffer = angular.copy($scope.offer);
        $scope.selectedServices = $filter('orderBy')($scope.offer.services, 'id');
        $scope.originalSelectedServices = angular.copy($scope.selectedServices);
        $scope.originalDateHolder = angular.copy($scope.dateHolder);
        $scope.isNotChanged = function () {
            return angular.equals($scope.offer, $scope.originalOffer) &&
                angular.equals($scope.dateHolder, $scope.originalDateHolder) &&
                angular.equals($scope.selectedServices, $scope.originalSelectedServices);
        };

        $scope.save = function (offer) {
            var offerItem = {
                id: $scope.originalOffer.id,
                name: $scope.originalOffer.name,
                organizationId: $scope.originalOffer.organizationId,
                state: $scope.originalOffer.state,
                // Changed fields
                services: $scope.selectedServices,
                profiles: ($scope.originalOffer.profiles === undefined ? [] : $scope.originalOffer.profiles)
            };

            // Offeri18nProfile
            if (offer.offeri18nProfiles && offer.offeri18nProfiles.length > 0) {
                var originalOfferi18nProfiles = CMPFService.findProfilesByName(offerItem.profiles, CMPFService.OFFER_I18N_PROFILE);
                _.each(offer.offeri18nProfiles, function (updatedOfferi18nProfile) {
                    updatedOfferi18nProfile = JSON.parse(angular.toJson(updatedOfferi18nProfile));
                    var originalOfferi18nProfile = _.findWhere(originalOfferi18nProfiles, {id: updatedOfferi18nProfile.profileId});
                    var offeri18nProfileAttrArray = CMPFService.prepareProfile(updatedOfferi18nProfile, originalOfferi18nProfile);
                    // ---
                    if (originalOfferi18nProfile) {
                        originalOfferi18nProfile.attributes = offeri18nProfileAttrArray;
                    } else {
                        var offeri18nProfile = {
                            name: CMPFService.OFFER_I18N_PROFILE,
                            profileDefinitionName: CMPFService.OFFER_I18N_PROFILE,
                            attributes: offeri18nProfileAttrArray
                        };

                        offerItem.profiles.push(offeri18nProfile);
                    }
                });
            }

            // XsmOfferProfile
            if (offer.xsmOfferProfile) {
                var originalOfferProfile = CMPFService.findProfileByName(offerItem.profiles, CMPFService.XSM_OFFER_PROFILE);
                var updatedXsmOfferProfile = JSON.parse(angular.toJson(offer.xsmOfferProfile));

                // Update the last update time for create first time or for update everytime.
                updatedXsmOfferProfile.LastUpdateTime = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');

                updatedXsmOfferProfile.NotificationEventDuration = UtilService.convertSimpleObjectToPeriod(updatedXsmOfferProfile.NotificationEventDuration);
                updatedXsmOfferProfile.ConfirmationEventDuration = UtilService.convertSimpleObjectToPeriod(updatedXsmOfferProfile.ConfirmationEventDuration);
                updatedXsmOfferProfile.FirstSubscriptionDate = ($scope.dateHolder.startDate ? $filter('date')($scope.dateHolder.startDate, 'yyyy-MM-dd') + 'T00:00:00' : '');
                updatedXsmOfferProfile.LastSubscriptionDate = $filter('date')($scope.dateHolder.endDate, 'yyyy-MM-dd') + 'T00:00:00';

                // Set as default value in case of any offer updating.
                updatedXsmOfferProfile.SubscriptionDuration = 0;
                updatedXsmOfferProfile.NotificationEventTimeRelativeFromCharging = 0;

                var xsmOfferProfileArray = CMPFService.prepareProfile(updatedXsmOfferProfile, originalOfferProfile);
                // ---
                if (originalOfferProfile) {
                    originalOfferProfile.attributes = xsmOfferProfileArray;
                } else {
                    var xsmOfferProfile = {
                        name: CMPFService.XSM_OFFER_PROFILE,
                        profileDefinitionName: CMPFService.XSM_OFFER_PROFILE,
                        attributes: xsmOfferProfileArray
                    };

                    offerItem.profiles.push(xsmOfferProfile);
                }
            }

            // XsmChargingProfile
            if (offer.xsmChargingProfile) {
                var originalOfferProfile = CMPFService.findProfileByName(offerItem.profiles, CMPFService.XSM_CHARGING_PROFILE);
                var updatedXsmChargingProfile = JSON.parse(angular.toJson(offer.xsmChargingProfile));

                updatedXsmChargingProfile.ChargingPeriod = UtilService.convertSimpleObjectToPeriod(updatedXsmChargingProfile.ChargingPeriod);
                updatedXsmChargingProfile.RetryPeriod = UtilService.convertSimpleObjectToPeriod(updatedXsmChargingProfile.RetryPeriod);
                updatedXsmChargingProfile.MicroChargingPeriod = UtilService.convertSimpleObjectToPeriod(updatedXsmChargingProfile.MicroChargingPeriod);

                // Set as default value in case of any offer updating.
                updatedXsmChargingProfile.Handler = 'Suspended';
                updatedXsmChargingProfile.ChargingFailurePolicy = 'ContinueWithDebt';
                updatedXsmChargingProfile.InitialChargingPolicy = 'ChargingOnAttempt';

                if (updatedXsmChargingProfile.PartialChargingEnabled) {
                    updatedXsmChargingProfile.MicroChargingEnabled = false;
                    updatedXsmChargingProfile.SmartChargingEnabled = false;
                }

                var xsmChargingProfileArray = CMPFService.prepareProfile(updatedXsmChargingProfile, originalOfferProfile);
                // ---
                if (originalOfferProfile) {
                    originalOfferProfile.attributes = xsmChargingProfileArray;
                } else {
                    var xsmChargingProfile = {
                        name: CMPFService.XSM_CHARGING_PROFILE,
                        profileDefinitionName: CMPFService.XSM_CHARGING_PROFILE,
                        attributes: xsmChargingProfileArray
                    };

                    offerItem.profiles.push(xsmChargingProfile);
                }
            }

            // XsmRenewalProfile
            if (offer.xsmRenewalProfile) {
                var originalOfferProfile = CMPFService.findProfileByName(offerItem.profiles, CMPFService.XSM_RENEWAL_PROFILE);
                var updatedXsmRenewalProfile = JSON.parse(angular.toJson(offer.xsmRenewalProfile));

                if (offer.xsmRenewalProfile.AllowedNextRenewalNotificationPeriod) {
                    updatedXsmRenewalProfile.AllowedNextRenewalNotificationPeriod = UtilService.convertSimpleObjectToPeriod(offer.xsmRenewalProfile.AllowedNextRenewalNotificationPeriod);
                } else {
                    updatedXsmRenewalProfile.AllowedNextRenewalNotificationPeriod = '';
                }

                var xsmRenewalProfileArray = CMPFService.prepareProfile(updatedXsmRenewalProfile, originalOfferProfile);
                // ---
                if (originalOfferProfile) {
                    originalOfferProfile.attributes = xsmRenewalProfileArray;
                } else {
                    var xsmRenewalProfile = {
                        name: CMPFService.XSM_RENEWAL_PROFILE,
                        profileDefinitionName: CMPFService.XSM_RENEWAL_PROFILE,
                        attributes: xsmRenewalProfileArray
                    };

                    offerItem.profiles.push(xsmRenewalProfile);
                }
            }

            // XsmTrialProfile
            if (offer.xsmTrialProfile) {
                var originalXsmTrialProfile = CMPFService.findProfileByName(offerItem.profiles, CMPFService.XSM_TRIAL_PROFILE);
                var updatedXsmTrialProfile = JSON.parse(angular.toJson(offer.xsmTrialProfile));

                updatedXsmTrialProfile.TrialPeriod = UtilService.convertSimpleObjectToPeriod(updatedXsmTrialProfile.TrialPeriod);
                updatedXsmTrialProfile.NextAllowedTrialUsagePeriod = UtilService.convertSimpleObjectToPeriod(updatedXsmTrialProfile.NextAllowedTrialUsagePeriod);

                // Set with the default values because of they are hidden.
                updatedXsmTrialProfile.TryAndBuyPolicy = 'AutoBuyWithoutNotification';
                updatedXsmTrialProfile.TrialByDefault = true;
                updatedXsmTrialProfile.ConfirmationEventDuration = 'P000Y000M0028DT000H00M000S';
                updatedXsmTrialProfile.NotificationEventDuration = 'P000Y000M0028DT000H00M000S';
                updatedXsmTrialProfile.NextOfferId = 0;
                updatedXsmTrialProfile.NextOfferSubscriptionText = '';

                var xsmTrialProfileArray = CMPFService.prepareProfile(updatedXsmTrialProfile, originalXsmTrialProfile);
                // ---
                if (originalXsmTrialProfile) {
                    originalXsmTrialProfile.attributes = xsmTrialProfileArray;
                } else {
                    var xsmTrialProfile = {
                        name: CMPFService.XSM_TRIAL_PROFILE,
                        profileDefinitionName: CMPFService.XSM_TRIAL_PROFILE,
                        attributes: xsmTrialProfileArray
                    };

                    offerItem.profiles.push(xsmTrialProfile);
                }
            }

            // SMSPortali18nProfile
            if (offer.smsPortali18nProfileList && offer.smsPortali18nProfileList.length > 0) {
                // Filter out the removed items from the list.
                offerItem.profiles = _.filter(offerItem.profiles, function (originalSMSPortali18nProfile) {
                    if (originalSMSPortali18nProfile.name === CMPFService.SMS_PORTAL_I18N_PROFILE) {
                        return _.findWhere(offer.smsPortali18nProfileList, {profileId: originalSMSPortali18nProfile.id});
                    } else {
                        return true;
                    }
                });

                var originalSMSPortali18nProfiles = CMPFService.findProfilesByName(offerItem.profiles, CMPFService.SMS_PORTAL_I18N_PROFILE);

                _.each(offer.smsPortali18nProfileList, function (updatedSMSPortali18nProfile) {
                    updatedSMSPortali18nProfile = JSON.parse(angular.toJson(updatedSMSPortali18nProfile));
                    // Modify some attributes here.
                    delete updatedSMSPortali18nProfile.id;

                    var originalSMSPortali18nProfile = _.findWhere(originalSMSPortali18nProfiles, {id: updatedSMSPortali18nProfile.profileId});
                    var smsPortali18nProfileAttrArray = CMPFService.prepareProfile(updatedSMSPortali18nProfile, originalSMSPortali18nProfile);
                    // ---
                    if (originalSMSPortali18nProfile) {
                        originalSMSPortali18nProfile.attributes = smsPortali18nProfileAttrArray;
                    } else {
                        var smsPortali18nProfile = {
                            name: CMPFService.SMS_PORTAL_I18N_PROFILE,
                            profileDefinitionName: CMPFService.SMS_PORTAL_I18N_PROFILE,
                            attributes: smsPortali18nProfileAttrArray
                        };

                        offerItem.profiles.push(smsPortali18nProfile);
                    }
                });
            } else {
                // Remove SMSPortali18nProfile instances
                offerItem.profiles = _.filter(offerItem.profiles, function (profile) {
                    return profile.profileDefinitionName !== CMPFService.SMS_PORTAL_I18N_PROFILE;
                });
            }

            // OfferEligibilityProfile
            if (offer.offerEligibilityProfile) {
                var originalOfferProfile = CMPFService.findProfileByName(offerItem.profiles, CMPFService.OFFER_ELIGIBILITY_PROFILE);
                var updatedOfferEligibilityProfile = JSON.parse(angular.toJson(offer.offerEligibilityProfile));

                // Modify some attributes here.
                if (updatedOfferEligibilityProfile.PackageList) {
                    updatedOfferEligibilityProfile.PackageList = updatedOfferEligibilityProfile.PackageList.join(';');
                }

                var offerEligibilityProfileArray = CMPFService.prepareProfile(updatedOfferEligibilityProfile, originalOfferProfile);
                // ---
                if (originalOfferProfile) {
                    originalOfferProfile.attributes = offerEligibilityProfileArray;
                } else {
                    var offerEligibilityProfile = {
                        name: CMPFService.OFFER_ELIGIBILITY_PROFILE,
                        profileDefinitionName: CMPFService.OFFER_ELIGIBILITY_PROFILE,
                        attributes: offerEligibilityProfileArray
                    };

                    offerItem.profiles.push(offerEligibilityProfile);
                }
            }

            // SubscriptionRenewalNotificationProfile
            if (offer.subscriptionRenewalNotificationProfile) {
                var originalSubscriptionRenewalNotificationProfile = CMPFService.findProfileByName(offerItem.profiles, CMPFService.SUBSCRIPTION_RENEWAL_NOTIFICATION_PROFILE);
                var updatedSubscriptionRenewalNotificationProfile = JSON.parse(angular.toJson(offer.subscriptionRenewalNotificationProfile));
                var subscriptionRenewalNotificationProfileArray = CMPFService.prepareProfile(updatedSubscriptionRenewalNotificationProfile, originalSubscriptionRenewalNotificationProfile);
                // ---
                if (originalSubscriptionRenewalNotificationProfile) {
                    originalSubscriptionRenewalNotificationProfile.attributes = subscriptionRenewalNotificationProfileArray;
                } else {
                    var subscriptionRenewalNotificationProfile = {
                        name: CMPFService.SUBSCRIPTION_RENEWAL_NOTIFICATION_PROFILE,
                        profileDefinitionName: CMPFService.SUBSCRIPTION_RENEWAL_NOTIFICATION_PROFILE,
                        attributes: subscriptionRenewalNotificationProfileArray
                    };

                    offerItem.profiles.push(subscriptionRenewalNotificationProfile);
                }
            } else {
                // Remove SubscriptionRenewalNotificationProfile instances
                offerItem.profiles = _.filter(offerItem.profiles, function (profile) {
                    return profile.profileDefinitionName !== CMPFService.SUBSCRIPTION_RENEWAL_NOTIFICATION_PROFILE;
                });
            }

            // BundleOfferProfile
            if ($scope.selectedServices && $scope.selectedServices.length > 1 && offer.bundleOfferProfile) {
                var originalBundleOfferProfile = CMPFService.findProfileByName(offerItem.profiles, CMPFService.BUNDLE_OFFER_PROFILE);
                var updatedBundleOfferProfile = JSON.parse(angular.toJson(offer.bundleOfferProfile));
                if (!updatedBundleOfferProfile.BundleID) {
                    updatedBundleOfferProfile.BundleID = 'DSP' + $scope.originalOffer.id;
                }
                var bundleOfferProfileArray = CMPFService.prepareProfile(updatedBundleOfferProfile, originalBundleOfferProfile);
                // ---
                if (originalBundleOfferProfile) {
                    originalBundleOfferProfile.attributes = bundleOfferProfileArray;
                } else {
                    var bundleOfferProfile = {
                        name: CMPFService.BUNDLE_OFFER_PROFILE,
                        profileDefinitionName: CMPFService.BUNDLE_OFFER_PROFILE,
                        attributes: bundleOfferProfileArray
                    };

                    offerItem.profiles.push(bundleOfferProfile);
                }
            } else {
                // Remove BundleOfferProfile instances
                offerItem.profiles = _.filter(offerItem.profiles, function (profile) {
                    return profile.profileDefinitionName !== CMPFService.BUNDLE_OFFER_PROFILE;
                });
            }

            CMPFService.checkEntityAuditProfile(offerItem.profiles);

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

            $log.debug('Trying to update offer: ', offerItemPayload);

            // Offer update method of the flow service.
            WorkflowsService.updateOffer(offerItemPayload).then(function (response) {
                if (response && response.code === 2001) {
                    notification.flash({
                        type: 'success',
                        text: $translate.instant('PartnerInfo.Offers.Messages.OfferUpdateFlowStartedSuccessful')
                    });

                    $scope.cancel();
                }
            }, function (response) {
                $log.error('Cannot call the offer update flow service. Error: ', response);

                notification({
                    type: 'warning',
                    text: $translate.instant('PartnerInfo.Offers.Messages.OfferUpdateFlowError')
                });
            });
        };
    });

})();
