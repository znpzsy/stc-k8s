(function () {

    'use strict';

    angular.module('adminportal.subsystems.subscriptionmanagement.operations.offers', [
        'adminportal.subsystems.subscriptionmanagement.operations.offers.new',
        'adminportal.subsystems.subscriptionmanagement.operations.offers.update',
        'adminportal.subsystems.subscriptionmanagement.operations.offers.smsportali18nprofile',
        'adminportal.subsystems.subscriptionmanagement.operations.offers.screening-lists'
    ]);

    var SubscriptionManagementOperationsOffersModule = angular.module('adminportal.subsystems.subscriptionmanagement.operations.offers');

    SubscriptionManagementOperationsOffersModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.subscriptionmanagement.operations.offers', {
            abstract: true,
            url: "/offers",
            data: {
                listState: 'subsystems.subscriptionmanagement.operations.offers.list',
                newState: 'subsystems.subscriptionmanagement.operations.offers.new',
                updateState: 'subsystems.subscriptionmanagement.operations.offers.update',
                permissions: [
                    'SSM__OPERATIONS_OFFER_READ'
                ]
            },
            template: '<div ui-view></div>'
        }).state('subsystems.subscriptionmanagement.operations.offers.list', {
            url: "",
            templateUrl: "subsystems/subscriptionmanagement/operations/offers/operations.offers.html",
            controller: 'SubscriptionManagementOperationsOffersCtrl',
            resolve: {
                offers: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOffers(false, true, false);
                }
            }
        });

    });

    SubscriptionManagementOperationsOffersModule.controller('SubscriptionManagementOperationsOffersCommonCtrl', function ($scope, $log, $controller, $state, $filter, $uibModal, notification, $translate, UtilService,
                                                                                                                          Restangular, CMPFService, OFFER_STATUS_TYPES, DURATION_UNITS, OFFER_CHARGING_POLICIES, OFFER_HANDLERS,
                                                                                                                          OFFER_INITIAL_CHARGING_POLICIES, OFFER_CHARGING_FAILURE_POLICIES, OFFER_CHARGE_ONS, OFFER_TERMINATION_POLICIES,
                                                                                                                          OFFER_RENEWAL_POLICIES, OFFER_BLACK_LISTED_SUBSCRIBER_POLICIES, OFFER_PACKAGE_ELIGIBILITIES,
                                                                                                                          businessTypesOrganization, settlementTypesOrganization, serviceCategoriesOrganization, packageList) {
        $log.debug('SubscriptionManagementOperationsOffersCommonCtrl');

        $controller('GenericDateTimeCtrl', {$scope: $scope});

        // Package list
        var packageList = Restangular.stripRestangular(packageList);
        $scope.packageList = [];
        if (packageList && packageList.length > 0 && packageList[0].attributes.length > 0) {
            $scope.packageList = _.findWhere(packageList[0].attributes, {name: 'PackageListNameList'}).listValues;
            $scope.packageList = $filter('orderBy')($scope.packageList, 'value');
        }

        $scope.shortCodeList = [];

        var businessTypesOrganizationItem = businessTypesOrganization.organizations[0];
        var allBusinessTypes = CMPFService.getBusinessTypes(businessTypesOrganizationItem);
        $scope.businessTypes = [];

        var settlementTypesOrganizationItem = settlementTypesOrganization.organizations[0];
        var allSettlementTypes = CMPFService.getSettlementTypes(settlementTypesOrganizationItem);
        $scope.settlementTypes = [];

        var providerSettlementTypeProfiles;

        // Organization selection listener
        $scope.$watch('offer.organization', function (newValue, oldValue) {
            $scope.shortCodeList = [];
            $scope.businessTypes = [];
            if (newValue && $scope.offer.organization) {
                // Prepare short code list. It should be matched with the selected organization and status equals to USED.
                $scope.shortCodeList = _.filter($scope.shortCodes, function (shortCode) {
                    return ((shortCode.ProviderID === $scope.offer.organization.id) && (shortCode.Status === 'USED'));
                });

                // Prepare business type list.
                var providerBusinessTypeProfiles = CMPFService.getProfileAttributes($scope.offer.organization.profiles, CMPFService.SERVICE_PROVIDER_BUSINESS_TYPE_PROFILE);
                _.each(providerBusinessTypeProfiles, function (providerBusinessTypeProfile) {
                    var foundBusinessType = _.findWhere(allBusinessTypes, {profileId: providerBusinessTypeProfile.BusinessTypeID});
                    if (foundBusinessType) {
                        $scope.businessTypes.push(foundBusinessType);
                    }
                });
                $scope.businessTypes = $filter('orderBy')($scope.businessTypes, 'Name');

                var foundBusinessType = _.findWhere($scope.businessTypes, {profileId: $scope.offer.bundleOfferProfile.BusinessTypeID});
                if ($scope.offer.bundleOfferProfile.BusinessTypeID && !foundBusinessType) {
                    $scope.offer.bundleOfferProfile.BusinessTypeID = null
                }

                // Prepare settlement type list.
                providerSettlementTypeProfiles = CMPFService.getProfileAttributes($scope.offer.organization.profiles, CMPFService.SERVICE_PROVIDER_SETTLEMENT_TYPE_PROFILE);
            }

            if (!angular.equals(newValue, oldValue)) {
                $scope.selectedServices = [];
            }
        });

        // Business type selection listener
        $scope.$watch('offer.bundleOfferProfile.BusinessTypeID', function (newValue, oldValue) {
            $scope.settlementTypes = [];
            if (!newValue) {
                $scope.offer.bundleOfferProfile.SettlementTypeID = null;
            }

            if (newValue && $scope.offer.organization) {
                var foundBusinessType = _.findWhere(allBusinessTypes, {profileId: newValue});
                if (foundBusinessType) {
                    var allSettlementTypeIds = _.pluck(foundBusinessType.SettlementTypes, "value");
                    _.each(providerSettlementTypeProfiles, function (providerSettlementTypeProfile) {
                        var foundSettlementType = _.findWhere(allSettlementTypes, {profileId: providerSettlementTypeProfile.SettlementTypeID});
                        if (allSettlementTypeIds && foundSettlementType && _.contains(allSettlementTypeIds, foundSettlementType.profileId.toString())) {
                            if (foundSettlementType.IsPartnerSpecific) {
                                if (foundSettlementType.Partners) {
                                    var partnerIds = String(foundSettlementType.Partners).split(',');
                                    if (partnerIds.indexOf(String($scope.offer.organization.id)) > -1) {
                                        $scope.settlementTypes.push(foundSettlementType);
                                    }
                                }
                            } else {
                                $scope.settlementTypes.push(foundSettlementType);
                            }
                        }
                    });
                }
                $scope.settlementTypes = $filter('orderBy')($scope.settlementTypes, 'Name');

                var foundSettlementType = _.findWhere($scope.settlementTypes, {profileId: $scope.offer.bundleOfferProfile.SettlementTypeID});
                if ($scope.offer.bundleOfferProfile.SettlementTypeID && !foundSettlementType) {
                    $scope.offer.bundleOfferProfile.SettlementTypeID = null
                }
            }
        });

        // Check renewal periods by main charging period
        var validateRenewalPeriodByChargingPeriod = function (periodObject, formObject) {
            var difference = UtilService.comparePeriods(periodObject, $scope.offer.xsmChargingProfile.ChargingPeriod);

            if (formObject) {
                formObject.$setValidity('chargingPeriodLimit', difference < 0);
            }
        };
        $scope.$watch('offer.xsmOfferProfile.NotificationEventDuration.duration', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                validateRenewalPeriodByChargingPeriod($scope.offer.xsmOfferProfile.NotificationEventDuration, $scope.form.notificationEventDurationPeriod);
            }
        });
        $scope.$watch('offer.xsmOfferProfile.NotificationEventDuration.unit', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                validateRenewalPeriodByChargingPeriod($scope.offer.xsmOfferProfile.NotificationEventDuration, $scope.form.notificationEventDurationPeriod);
            }
        });
        $scope.$watch('offer.xsmOfferProfile.ConfirmationEventDuration.duration', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                validateRenewalPeriodByChargingPeriod($scope.offer.xsmOfferProfile.ConfirmationEventDuration, $scope.form.confirmationEventDurationPeriod);
            }
        });
        $scope.$watch('offer.xsmOfferProfile.ConfirmationEventDuration.unit', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                validateRenewalPeriodByChargingPeriod($scope.offer.xsmOfferProfile.ConfirmationEventDuration, $scope.form.confirmationEventDurationPeriod);
            }
        });
        $scope.validateRenewalDurations = function () {
            validateRenewalPeriodByChargingPeriod($scope.offer.xsmOfferProfile.NotificationEventDuration, $scope.form.notificationEventDurationPeriod);
            validateRenewalPeriodByChargingPeriod($scope.offer.xsmOfferProfile.ConfirmationEventDuration, $scope.form.confirmationEventDurationPeriod);
        };

        $scope.serviceSubCategories = [];
        if (serviceCategoriesOrganization.organizations && serviceCategoriesOrganization.organizations.length > 0) {
            $scope.serviceCategoriesOrganization = serviceCategoriesOrganization.organizations[0];

            // ServiceMainCategoryProfile
            var serviceMainCategoryProfiles = CMPFService.getMainServiceCategories($scope.serviceCategoriesOrganization);

            // Filter out the related sub categories.
            $scope.serviceSubCategories = CMPFService.getSubServiceCategories($scope.serviceCategoriesOrganization);
            $scope.serviceSubCategories = _.each($scope.serviceSubCategories, function (serviceSubCategory) {
                if (serviceMainCategoryProfiles.length > 0) {
                    var foundServiceMainCategory = _.findWhere(serviceMainCategoryProfiles, {"profileId": Number(serviceSubCategory.MainCategoryID)});
                    serviceSubCategory.serviceCategory = angular.copy(foundServiceMainCategory);
                }

                return serviceSubCategory;
            });
            $scope.serviceSubCategories = $filter('orderBy')($scope.serviceSubCategories, ['serviceCategory.Name', 'Name']);
        }

        $scope.OFFER_STATUS_TYPES = OFFER_STATUS_TYPES;
        $scope.DURATION_UNITS = DURATION_UNITS;
        $scope.OFFER_CHARGING_POLICIES = OFFER_CHARGING_POLICIES;
        $scope.OFFER_HANDLERS = OFFER_HANDLERS;
        $scope.OFFER_INITIAL_CHARGING_POLICIES = OFFER_INITIAL_CHARGING_POLICIES;
        $scope.OFFER_CHARGING_FAILURE_POLICIES = OFFER_CHARGING_FAILURE_POLICIES;
        $scope.OFFER_CHARGE_ONS = OFFER_CHARGE_ONS;
        $scope.OFFER_TERMINATION_POLICIES = OFFER_TERMINATION_POLICIES;
        $scope.OFFER_RENEWAL_POLICIES = OFFER_RENEWAL_POLICIES;
        $scope.OFFER_BLACK_LISTED_SUBSCRIBER_POLICIES = OFFER_BLACK_LISTED_SUBSCRIBER_POLICIES;
        $scope.OFFER_PACKAGE_ELIGIBILITIES = OFFER_PACKAGE_ELIGIBILITIES;

        $scope.showServiceProviders = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.organizations.html',
                controller: 'OrganizationsModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    organizationParameter: function () {
                        return $scope.offer.organization;
                    },
                    itemName: function () {
                        return $scope.offer.name;
                    },
                    allOrganizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllOperatorsAndPartners(false, true, [CMPFService.OPERATOR_PROFILE, CMPFService.SERVICE_PROVIDER_BUSINESS_TYPE_PROFILE, CMPFService.SERVICE_PROVIDER_SETTLEMENT_TYPE_PROFILE]);
                    },
                    organizationsModalTitleKey: function () {
                        return 'Subsystems.SubscriptionManagement.Operations.Offers.OrganizationModalTitle';
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.offer.organization = selectedItem.organization;
                $scope.offer.organizationId = selectedItem.organization.id;
            }, function () {
                //
            });
        };

        $scope.showServices = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/subscriptionmanagement/operations/offers/operations.offers.modal.services.html',
                controller: 'SubscriptionManagementOperationsOfferServicesModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    servicesParameter: function () {
                        return angular.copy($scope.selectedServices);
                    },
                    offerNameParameter: function () {
                        return $scope.offer.name;
                    },
                    services: function ($q, CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        var deferred = $q.defer();

                        if ($scope.offer.organizationId) {
                            CMPFService.getAllServicesByOrganizationId($scope.offer.organizationId, false, false, 'ACTIVE', null).then(function (services) {
                                /*
                                services.services = _.filter(services.services, function (service) {
                                    var serviceProfiles = CMPFService.getProfileAttributes(service.profiles, CMPFService.SERVICE_PROFILE);
                                    if (serviceProfiles.length > 0) {
                                        var serviceProfile = angular.copy(serviceProfiles[0]);

                                        if (service.state === 'ACTIVE') {
                                            if (((serviceProfile.Type.startsWith('DCB_') || serviceProfile.Type.startsWith('CUSTOMIZED_')) && serviceProfile.Usage === 'SUBSCRIPTION') ||
                                                (serviceProfile.Type.startsWith('STANDARD_') && serviceProfile.Template !== 'ON_DEMAND')) {
                                                return true;
                                            }
                                        }

                                        return false;
                                    }
                                });
                                */

                                deferred.resolve(services);
                            });
                        } else {
                            deferred.resolve({services: []})
                        }

                        return deferred.promise;
                    }
                }
            });

            modalInstance.result.then(function (selectedItems) {
                $scope.selectedServices = $filter('orderBy')(selectedItems, 'id');
            }, function () {
                //
            });
        };

        $scope.removeService = function (service) {
            var index = _.indexOf($scope.selectedServices, service);
            if (index !== -1) {
                $scope.selectedServices.splice(index, 1);
            }
        };

        $scope.prepareOfferi18nProfiles = function (offeri18nProfiles) {
            var offeri18nProfileArray = [];

            angular.forEach(offeri18nProfiles, function (offeri18nProfile) {
                var newi18NProfile = {
                    name: CMPFService.OFFER_I18N_PROFILE,
                    profileDefinitionName: CMPFService.OFFER_I18N_PROFILE,
                    attributes: [
                        {
                            "name": "Name",
                            "value": offeri18nProfile.Name
                        },
                        {
                            "name": "Language",
                            "value": offeri18nProfile.Language
                        },
                        {
                            "name": "Description",
                            "value": offeri18nProfile.Description
                        },
                        {
                            "name": "SearchKeyword",
                            "value": offeri18nProfile.SearchKeyword
                        },
                        {
                            "name": "SubscriptionDescription",
                            "value": offeri18nProfile.SubscriptionDescription
                        },
                        {
                            "name": "UnsubscriptionDescription",
                            "value": offeri18nProfile.UnsubscriptionDescription
                        }
                    ]
                };

                this.push(newi18NProfile);
            }, offeri18nProfileArray);

            return offeri18nProfileArray;
        };

        $scope.prepareXsmOfferProfile = function (dateHolder, xsmOfferProfile) {
            return {
                name: CMPFService.XSM_OFFER_PROFILE,
                profileDefinitionName: CMPFService.XSM_OFFER_PROFILE,
                attributes: [
                    {
                        "name": "Description",
                        "value": xsmOfferProfile.Description
                    },
                    {
                        "name": "FirstSubscriptionDate",
                        "value": (dateHolder.startDate ? $filter('date')(dateHolder.startDate, 'yyyy-MM-dd') + 'T00:00:00' : '')
                    },
                    {
                        "name": "LastSubscriptionDate",
                        "value": $filter('date')(dateHolder.endDate, 'yyyy-MM-dd') + 'T00:00:00'
                    },
                    {
                        "name": "SubscriptionDuration",
                        "value": xsmOfferProfile.SubscriptionDuration
                    },
                    {
                        "name": "ConfirmationEventDuration",
                        "value": UtilService.convertSimpleObjectToPeriod(xsmOfferProfile.ConfirmationEventDuration)
                    },
                    {
                        "name": "NotificationEventDuration",
                        "value": UtilService.convertSimpleObjectToPeriod(xsmOfferProfile.NotificationEventDuration)
                    },
                    {
                        "name": "NotificationEventTimeRelativeFromCharging",
                        "value": xsmOfferProfile.NotificationEventTimeRelativeFromCharging
                    },
                    {
                        "name": "NotifySubscriberOnStateChanges",
                        "value": xsmOfferProfile.NotifySubscriberOnStateChanges
                    },
                    {
                        "name": "TerminationPolicy",
                        "value": xsmOfferProfile.TerminationPolicy
                    },
                    {
                        "name": "NotificationSenderID",
                        "value": xsmOfferProfile.NotificationSenderID
                    },
                    {
                        "name": "LastUpdateTime",
                        "value": xsmOfferProfile.LastUpdateTime
                    }
                ]
            };
        };

        $scope.prepareXsmChargingProfile = function (xsmChargingProfile) {
            return {
                name: CMPFService.XSM_CHARGING_PROFILE,
                profileDefinitionName: CMPFService.XSM_CHARGING_PROFILE,
                attributes: [
                    {
                        "name": "ChargingPeriod",
                        "value": UtilService.convertSimpleObjectToPeriod(xsmChargingProfile.ChargingPeriod)
                    },
                    {
                        "name": "MainPrice",
                        "value": xsmChargingProfile.MainPrice
                    },
                    {
                        "name": "ChargingPolicy",
                        "value": xsmChargingProfile.ChargingPolicy
                    },
                    {
                        "name": "Handler",
                        "value": xsmChargingProfile.Handler
                    },
                    {
                        "name": "InitialChargingPolicy",
                        "value": xsmChargingProfile.InitialChargingPolicy
                    },
                    {
                        "name": "MaxFailedChargingAttemptCount",
                        "value": xsmChargingProfile.MaxFailedChargingAttemptCount
                    },
                    {
                        "name": "ChargingFailurePolicy",
                        "value": xsmChargingProfile.ChargingFailurePolicy
                    },
                    {
                        "name": "RetryPeriod",
                        "value": UtilService.convertSimpleObjectToPeriod(xsmChargingProfile.RetryPeriod)
                    },
                    {
                        "name": "MaxRetryCount",
                        "value": xsmChargingProfile.MaxRetryCount
                    },
                    {
                        "name": "PartialChargingEnabled",
                        "value": xsmChargingProfile.PartialChargingEnabled
                    },
                    {
                        "name": "SmartChargingEnabled",
                        "value": xsmChargingProfile.SmartChargingEnabled
                    },
                    {
                        "name": "MicroChargingEnabled",
                        "value": xsmChargingProfile.MicroChargingEnabled
                    },
                    {
                        "name": "MicroChargingPeriod",
                        "value": UtilService.convertSimpleObjectToPeriod(xsmChargingProfile.MicroChargingPeriod)
                    },
                    {
                        "name": "MicroPrice",
                        "value": xsmChargingProfile.MicroPrice
                    },
                    {
                        "name": "MicroChargingEnabledAtInitialSubscription",
                        "value": xsmChargingProfile.MicroChargingEnabledAtInitialSubscription
                    },
                    {
                        "name": "MicroChargingEnabledAtRenewals",
                        "value": xsmChargingProfile.MicroChargingEnabledAtRenewals
                    },
                    {
                        "name": "MicroChargingEnabledAtTrialEnd",
                        "value": xsmChargingProfile.MicroChargingEnabledAtTrialEnd
                    },
                    {
                        "name": "MaxMicroChargingEventCount",
                        "value": xsmChargingProfile.MaxMicroChargingEventCount
                    },
                    {
                        "name": "ChargeOn",
                        "value": xsmChargingProfile.ChargeOn
                    }
                ]
            };
        };

        $scope.prepareXsmRenewalProfile = function (xsmRenewalProfile) {
            return {
                name: CMPFService.XSM_RENEWAL_PROFILE,
                profileDefinitionName: CMPFService.XSM_RENEWAL_PROFILE,
                attributes: [
                    {
                        "name": "RenewalPolicy",
                        "value": xsmRenewalProfile.RenewalPolicy
                    },
                    {
                        "name": "AllowedNextRenewalNotificationPeriod",
                        "value": xsmRenewalProfile.AllowedNextRenewalNotificationPeriod ? UtilService.convertSimpleObjectToPeriod(xsmRenewalProfile.AllowedNextRenewalNotificationPeriod) : ''
                    },
                    {
                        "name": "BlacklistedSubscriberPolicy",
                        "value": xsmRenewalProfile.BlacklistedSubscriberPolicy
                    }
                ]
            };
        };

        $scope.prepareXsmTrialProfile = function (xsmTrialProfile) {
            return {
                name: CMPFService.XSM_TRIAL_PROFILE,
                profileDefinitionName: CMPFService.XSM_TRIAL_PROFILE,
                attributes: [
                    {
                        "name": "TryAndBuyEnabled",
                        "value": xsmTrialProfile.TryAndBuyEnabled
                    },
                    {
                        "name": "TryAndBuyPolicy",
                        "value": xsmTrialProfile.TryAndBuyPolicy
                    },
                    {
                        "name": "TrialPeriod",
                        "value": UtilService.convertSimpleObjectToPeriod(xsmTrialProfile.TrialPeriod)
                    },
                    {
                        "name": "NextAllowedTrialUsagePeriod",
                        "value": UtilService.convertSimpleObjectToPeriod(xsmTrialProfile.NextAllowedTrialUsagePeriod)
                    },
                    {
                        "name": "TrialByDefault",
                        "value": xsmTrialProfile.TrialByDefault
                    },
                    {
                        "name": "NotificationEventDuration",
                        "value": UtilService.convertSimpleObjectToPeriod(xsmTrialProfile.NotificationEventDuration)
                    },
                    {
                        "name": "ConfirmationEventDuration",
                        "value": UtilService.convertSimpleObjectToPeriod(xsmTrialProfile.ConfirmationEventDuration)
                    },
                    {
                        "name": "NextOfferId",
                        "value": xsmTrialProfile.NextOfferId
                    },
                    {
                        "name": "NextOfferSubscriptionText",
                        "value": xsmTrialProfile.NextOfferSubscriptionText
                    }
                ]
            };
        };

        $scope.prepareSMSPortali18nProfiles = function (smsPortali18nProfiles) {
            var smsPortali18nProfileArray = [];

            angular.forEach(smsPortali18nProfiles, function (smsPortali18nProfile) {
                var newSMSPortali18nProfile = {
                    name: CMPFService.SMS_PORTAL_I18N_PROFILE,
                    profileDefinitionName: CMPFService.SMS_PORTAL_I18N_PROFILE,
                    attributes: [
                        {
                            "name": "IsDefault",
                            "value": smsPortali18nProfile.IsDefault
                        },
                        {
                            "name": "Language",
                            "value": smsPortali18nProfile.Language
                        },
                        {
                            "name": "SubUnsubShortCode",
                            "value": smsPortali18nProfile.SubUnsubShortCode
                        },
                        {
                            "name": "SubCommands",
                            "value": smsPortali18nProfile.SubCommands
                        },
                        {
                            "name": "SubConfirmationMessage",
                            "value": smsPortali18nProfile.SubConfirmationMessage
                        },
                        {
                            "name": "UnsubCommands",
                            "value": smsPortali18nProfile.UnsubCommands
                        },
                        {
                            "name": "UnsubConfirmationMessage",
                            "value": smsPortali18nProfile.UnsubConfirmationMessage
                        }
                    ]
                };

                this.push(newSMSPortali18nProfile);
            }, smsPortali18nProfileArray);

            return smsPortali18nProfileArray;
        };

        $scope.prepareOfferEligibilityProfile = function (offerEligibilityProfile) {
            return {
                name: CMPFService.OFFER_ELIGIBILITY_PROFILE,
                profileDefinitionName: CMPFService.OFFER_ELIGIBILITY_PROFILE,
                attributes: [
                    {
                        "name": "PackageEligibility",
                        "value": offerEligibilityProfile.PackageEligibility
                    },
                    {
                        "name": "PackageList",
                        "value": (offerEligibilityProfile.PackageList ? offerEligibilityProfile.PackageList.join(';') : '')
                    }
                ]
            };
        };

        $scope.prepareSubscriptionRenewalNotificationProfile = function (subscriptionRenewalNotificationProfile) {
            return {
                name: CMPFService.SUBSCRIPTION_RENEWAL_NOTIFICATION_PROFILE,
                profileDefinitionName: CMPFService.SUBSCRIPTION_RENEWAL_NOTIFICATION_PROFILE,
                attributes: [
                    {
                        "name": "RecurRenewalCount",
                        "value": subscriptionRenewalNotificationProfile.RecurRenewalCount
                    },
                    {
                        "name": "RecurDayOfMonth",
                        "value": subscriptionRenewalNotificationProfile.RecurDayOfMonth
                    },
                    {
                        "name": "SpecificRenewal",
                        "value": subscriptionRenewalNotificationProfile.SpecificRenewal
                    },
                    {
                        "name": "NotificationTemplate",
                        "value": subscriptionRenewalNotificationProfile.NotificationTemplate
                    },
                    {
                        "name": "NotificationScheduleType",
                        "value": subscriptionRenewalNotificationProfile.NotificationScheduleType
                    }
                ]
            };
        };

        $scope.prepareBundleOfferProfile = function (bundleOfferProfile) {
            return {
                name: CMPFService.BUNDLE_OFFER_PROFILE,
                profileDefinitionName: CMPFService.BUNDLE_OFFER_PROFILE,
                attributes: [
                    {
                        "name": "BusinessTypeID",
                        "value": bundleOfferProfile.BusinessTypeID
                    },
                    {
                        "name": "SettlementTypeID",
                        "value": bundleOfferProfile.SettlementTypeID
                    },
                    {
                        "name": "CategoryID",
                        "value": bundleOfferProfile.CategoryID
                    },
                    {
                        "name": "BundleID",
                        "value": 'DSP'
                    }
                ]
            };
        };

        $scope.cancel = function () {
            $scope.go($state.current.data.listState);
        };

        // Call the service SMSPortali18nProfile controller so it could be mixed with this controller.
        $controller('SubscriptionManagementOperationsOffersSMSPortali18nProfileCtrl', {$scope: $scope});
    });

    SubscriptionManagementOperationsOffersModule.controller('SubscriptionManagementOperationsOffersCtrl', function ($rootScope, $scope, $log, $state, $uibModal, $filter, $translate, notification, NgTableParams,
                                                                                                                    NgTableService, Restangular, AuthorizationService, CMPFService, SessionService,
                                                                                                                    WorkflowsService, offers, DEFAULT_REST_QUERY_LIMIT) {
        $log.debug('SubscriptionManagementOperationsOffersCtrl');

        var sessionOrganization = SessionService.getSessionOrganization();
        var username = SessionService.getUsername();

        $scope.stateFilter = 'ALL';
        $scope.stateFilterChange = function (state) {
            if (state !== 'ALL') {
                if (state === 'WAITING') {
                    $scope.offers = [];

                    CMPFService.getAllOrganizations(false, true, [CMPFService.OPERATOR_PROFILE]).then(function (organizations) {
                        var organizationList = Restangular.stripRestangular(organizations).organizations;
                        $scope.organizationList = $filter('orderBy')(organizationList, ['name']);

                        WorkflowsService.getPendingTasks(0, DEFAULT_REST_QUERY_LIMIT, 'OFFER').then(function (waitingOfferTasks) {
                            if (waitingOfferTasks && waitingOfferTasks.length > 0) {
                                _.each(waitingOfferTasks, function (offerTask) {
                                    if (offerTask && offerTask.name && (offerTask.name.toLowerCase() === 'offer create task')) {
                                        offerTask.objectDetail.taskObjectId = offerTask.offerId;
                                        offerTask.objectDetail.state = 'WAITING FOR APPROVAL';
                                        offerTask.objectDetail.taskName = offerTask.name;

                                        var foundOrganization = _.findWhere($scope.organizationList, {id: Number(offerTask.objectDetail.organizationId)});
                                        if (foundOrganization) {
                                            offerTask.objectDetail.organization = foundOrganization;
                                        } else {
                                            offerTask.objectDetail.organization = {
                                                name: 'N/A'
                                            };
                                        }

                                        $scope.offers.push(offerTask.objectDetail);
                                    }
                                });
                            }

                            $scope.tableParams.page(1);
                            $scope.tableParams.reload();
                        });
                    });
                } else {
                    $scope.offers = _.where($scope.originalOffers, {state: state});
                }
            } else {
                $scope.offers = angular.copy($scope.originalOffers);
            }

            $scope.tableParams.page(1);
            $scope.tableParams.reload();
        };

        // Task details modal window.
        $scope.showTaskDetails = function (offer) {
            offer.rowSelected = true;

            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'partials/modal/empty.modal.html',
                controller: function ($scope, $controller, $uibModalInstance, allOrganizations, taskDetail) {
                    $controller('WorkflowsOperationsTasksDetailOfferCtrl', {
                        $scope: $scope,
                        allOrganizations: allOrganizations,
                        taskDetail: taskDetail
                    });

                    $scope.isModal = true;
                    $scope.modalTitle = offer.taskName;
                    $scope.templateUrl = 'workflows/operations/operations.tasks.offers.detail.html';

                    $scope.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'lg',
                resolve: {
                    allOrganizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT, UtilService) {
                        return CMPFService.getAllOrganizations();
                    },
                    taskDetail: function () {
                        return {
                            offerTask: {
                                objectDetail: offer
                            }
                        };
                    }
                }
            });

            modalInstance.result.then(function () {
                offer.rowSelected = false;
            }, function () {
                offer.rowSelected = false;
            });
        };

        var offers = Restangular.stripRestangular(offers);
        $scope.offers = $filter('orderBy')(offers.offers, 'id');
        _.each($scope.offers, function (offer) {
            if (!offer.organization) {
                offer.organization = {
                    name: 'N/A'
                };
            }
        });
        $scope.originalOffers = angular.copy($scope.offers);

        $scope.exportAllData = function (fileNamePrefix, exporter) {
            CMPFService.getAllOffers(true, false, true, [CMPFService.XSM_OFFER_PROFILE]).then(function (exportingOffers) {
                var exportingOfferList = $filter('orderBy')(exportingOffers.offers, 'id');

                // Reformatted all records again to show meaningful data on the exporting data.
                _.each(exportingOfferList, function (offer) {
                    offer.serviceNames = _.pluck(offer.services, 'name').toString();

                    var xsmOfferProfiles = CMPFService.getProfileAttributes(offer.profiles, CMPFService.XSM_OFFER_PROFILE);
                    if (xsmOfferProfiles.length > 0) {
                        offer.xsmOfferProfile = angular.copy(xsmOfferProfiles[0]);
                    }
                });

                exporter.download(fileNamePrefix, exportingOfferList);
            });
        };

        // Table export options
        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'id',
                    headerKey: 'Subsystems.SubscriptionManagement.Operations.Offers.Id'
                },
                {
                    fieldName: 'name',
                    headerKey: 'Subsystems.SubscriptionManagement.Operations.Offers.Name'
                },
                {
                    fieldName: 'xsmOfferProfile.Description',
                    headerKey: 'Subsystems.SubscriptionManagement.Operations.Offers.XsmOfferProfile.Description'
                },
                {
                    fieldName: 'organization.name',
                    headerKey: 'Subsystems.SubscriptionManagement.Operations.Offers.Organization'
                },
                {
                    fieldName: 'serviceNames',
                    headerKey: 'Subsystems.SubscriptionManagement.Operations.Offers.Services'
                },
                {
                    fieldName: 'state',
                    headerKey: 'Subsystems.SubscriptionManagement.Operations.Offers.State'
                },
                {
                    fieldName: 'xsmOfferProfile.FirstSubscriptionDate',
                    headerKey: 'GenericFormFields.StartDate.Label',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss']}
                },
                {
                    fieldName: 'xsmOfferProfile.LastSubscriptionDate',
                    headerKey: 'GenericFormFields.EndDate.Label',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss']}
                }
            ]
        };

        $scope.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "id": 'asc'
            }
        }, {
            $scope: $scope,
            total: 0,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.offers);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.offers;
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

        $scope.remove = function (offer) {
            offer.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: function ($scope, $uibModalInstance, $translate, $controller, $sce) {
                    var message = $translate.instant('CommonLabels.ConfirmationRemoveMessage');
                    message = message + ' [' + offer.name + ']';
                    $scope.confirmationMessage = $sce.trustAsHtml(message);

                    $controller('ConfirmationModalInstanceCtrl', {
                        $scope: $scope,
                        $uibModalInstance: $uibModalInstance
                    });
                },
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Remove offer:', offer.name);

                CMPFService.deleteOffer(offer).then(function (response) {
                    $log.debug('Removed offer. Response: ', response);

                    if (response && response.errorCode) {
                        CMPFService.showApiError(response);
                    } else {
                        var deletedListItem = _.findWhere($scope.offers, {id: offer.id});
                        $scope.offers = _.without($scope.offers, deletedListItem);

                        $scope.tableParams.reload();

                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });
                    }
                }, function (response) {
                    $log.debug('Cannot remove offer. Error: ', response);

                    if (response.data && response.data.errorDescription &&
                        response.data.errorDescription.indexOf('SM_OFFER_SUBSCRIPTION') > -1) {
                        notification({
                            type: 'warning',
                            text: $translate.instant('CommonMessages.ThereAreOfferSubscriptions')
                        });
                    } else {
                        CMPFService.showApiError(response);
                    }
                });

                offer.rowSelected = false;
            }, function () {
                offer.rowSelected = false;
            });
        };

        $scope.updateOfferStateByMobilyUser = function (offer, newState) {
            offer.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: function ($scope, $uibModalInstance, $translate, $controller, $sce) {
                    var message = '';
                    if (newState === 'SUSPENDED') {
                        message = $translate.instant('Subsystems.SubscriptionManagement.Operations.Offers.Messages.SuspendConfirmationMessage');
                    } else if (newState === 'ACTIVE') {
                        message = $translate.instant('Subsystems.SubscriptionManagement.Operations.Offers.Messages.ActivateConfirmationMessage');
                    } else if (newState === 'INACTIVE') {
                        message = $translate.instant('Subsystems.SubscriptionManagement.Operations.Offers.Messages.InactivateConfirmationMessage');
                    } else if (newState === 'HIDDEN') {
                        message = $translate.instant('Subsystems.SubscriptionManagement.Operations.Offers.Messages.HideConfirmationMessage');
                    } else if (newState === 'UNHIDDEN') {
                        message = $translate.instant('Subsystems.SubscriptionManagement.Operations.Offers.Messages.UnhideConfirmationMessage');
                        newState = 'ACTIVE';
                    }

                    message = message + ' [' + offer.name + ']';
                    $scope.confirmationMessage = $sce.trustAsHtml(message);

                    $controller('ConfirmationModalInstanceCtrl', {
                        $scope: $scope,
                        $uibModalInstance: $uibModalInstance
                    });
                },
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Change state of offer:', offer.name);

                CMPFService.getOffer(offer.id, true, true).then(function (offerResponse) {
                    offerResponse = Restangular.stripRestangular(offerResponse);

                    // Changed values
                    offerResponse.state = newState;

                    CMPFService.checkEntityAuditProfile(offerResponse.profiles);

                    // Workflows special offer object
                    var offerItem = {
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
                        "offerDetail": offerResponse
                    };

                    $log.debug('Trying to update offer: ', offerItem);

                    // Service update method of the flow offer.
                    WorkflowsService.updateOffer(offerItem).then(function (response) {
                        if (response && response.code === 2001) {
                            notification.flash({
                                type: 'success',
                                text: $translate.instant('Subsystems.SubscriptionManagement.Operations.Offers.Messages.OfferUpdateFlowStartedSuccessful' + ($rootScope.isAdminUser ? 'ForAdmin' : ''))
                            });

                            $state.transitionTo($state.current, {}, {reload: true, inherit: true, notify: true});
                        }
                    }, function (response) {
                        $log.error('Cannot call the offer update flow offer. Error: ', response);

                        notification({
                            type: 'warning',
                            text: $translate.instant('Subsystems.SubscriptionManagement.Operations.Offers.Messages.OfferUpdateFlowError')
                        });
                    });
                });

                offer.rowSelected = false;
            }, function () {
                offer.rowSelected = false;
            });

        };

        // Show services of an offer
        $scope.showServices = function (entity) {
            entity.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.services.html',
                controller: 'ServicesModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    modalTitleKey: function () {
                        return 'Subsystems.SubscriptionManagement.Operations.Offers.ServicesModalTitle';
                    },
                    entityParameter: function () {
                        return entity;
                    },
                    services: function ($q, CMPFService) {
                        var deferred = $q.defer();

                        CMPFService.getOffer(entity.id, true, false).then(function (offer) {
                            var services = offer.services;

                            deferred.resolve(services);
                        });

                        return deferred.promise;
                    }
                }
            });

            modalInstance.result.then(function () {
                entity.rowSelected = false;
            }, function () {
                entity.rowSelected = false;
            });
        };

        // Show subscriptions of an offer
        $scope.showOfferSubscriptions = function (offer) {
            offer.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/subscriptionmanagement/operations/offers/operations.offers.modal.subscriptions.html',
                controller: 'SubscriptionManagementOperationsOfferSubscriptionsModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    offerParameter: function () {
                        return offer;
                    }
                }
            });

            modalInstance.result.then(function () {
                offer.rowSelected = false;
            }, function () {
                offer.rowSelected = false;
            });
        };

        // Show subscriptions of the content
        $scope.showContentSubscriptions = function (offer) {
            offer.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/subscriptionmanagement/operations/offers/operations.offers.modal.contentsubscriptions.html',
                controller: 'SubscriptionManagementOperationsContentSubscriptionsModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    offerParameter: function () {
                        return offer;
                    }
                }
            });

            modalInstance.result.then(function () {
                offer.rowSelected = false;
            }, function () {
                offer.rowSelected = false;
            });
        };
    });

    SubscriptionManagementOperationsOffersModule.controller('SubscriptionManagementOperationsOfferServicesModalInstanceCtrl', function ($scope, $uibModalInstance, $log, $filter, NgTableParams, NgTableService, Restangular,
                                                                                                                                        CMPFService, servicesParameter, offerNameParameter, services) {
        $log.debug('SubscriptionManagementOperationsOfferServicesModalInstanceCtrl');

        $scope.selectedItems = servicesParameter ? servicesParameter : [];
        $scope.offerName = offerNameParameter;

        $scope.services = Restangular.stripRestangular(services).services;
        _.each($scope.selectedItems, function (selectedItem) {
            var foundService = _.findWhere($scope.services, {id: selectedItem.id});
            if (foundService) {
                foundService.selected = true;
            }
        });

        $scope.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "id": 'asc'
            }
        }, {
            $scope: $scope,
            total: 0,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.services);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.services;
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

        $scope.addToSelection = function (item) {
            var foundService = _.findWhere($scope.selectedItems, {id: item.id});
            if (!foundService) {
                $scope.selectedItems.push(item);
            }
        };

        $scope.removeFromSelection = function (item) {
            var index = _.indexOf($scope.selectedItems, item);
            if (index !== -1) {
                $scope.selectedItems.splice(index, 1);
            }
        };

        $scope.ok = function () {
            $uibModalInstance.close($scope.selectedItems);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });

    SubscriptionManagementOperationsOffersModule.controller('SubscriptionManagementOperationsOfferSubscriptionsModalInstanceCtrl', function ($scope, $uibModalInstance, $log, $timeout, $filter, $translate, notification, NgTableParams, NgTableService, Restangular,
                                                                                                                                             SSMSubscribersService, offerParameter) {
        $log.debug('SubscriptionManagementOperationsOfferSubscriptionsModalInstanceCtrl');

        $scope.isInProgress = false;

        $scope.offer = offerParameter;

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'msisdn',
                    headerKey: 'Subsystems.SubscriptionManagement.Operations.Offers.SubscriberId'
                },
                {
                    fieldName: 'san',
                    headerKey: 'Subsystems.SubscriptionManagement.Operations.Offers.SAN'
                },
                {
                    fieldName: 'fakeId',
                    headerKey: 'Subsystems.SubscriptionManagement.Operations.Offers.FakeId'
                },
                {
                    fieldName: 'subscriberState',
                    headerKey: 'Subsystems.SubscriptionManagement.Operations.Offers.SubscriberState'
                },
                {
                    fieldName: 'subscriptionState',
                    headerKey: 'Subsystems.SubscriptionManagement.Operations.Offers.SubscriptionState'
                },
                {
                    fieldName: 'lastSubscriptionDate',
                    headerKey: 'Subsystems.SubscriptionManagement.Operations.Offers.LastSubscriptionDate',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss']}
                }
            ]
        };

        $scope.fetchAllOfferSubscriptionsData = function () {
            var filterText = $scope.tableParams.settings().$scope.filterText;
            var filterColumns = $scope.tableParams.settings().$scope.filterColumns;

            $scope.offerSubscriptionsDataAccumulator = [];
            $scope.isDataFetchingInProgress = true;
            $scope.dataFetchingPercent = 0;

            var page = 0;
            var defaultSize = 1000;

            var getData = function (page, size) {
                var sortingPair = _.pairs($scope.tableParams.sorting());

                // Do not sort the date while downloading.
                var sort = null;//sortingPair[0][0] + ',' + sortingPair[0][1];

                SSMSubscribersService.getOfferSubscriptions(page, size, sort, $scope.offer.id).then(function (response) {
                    var filteredContent = NgTableService.filterList(filterText, filterColumns, response.content);
                    var orderedContent = $scope.tableParams.sorting() ? $filter('orderBy')(filteredContent, $scope.tableParams.orderBy()) : filteredContent;
                    $scope.offerSubscriptionsDataAccumulator = $scope.offerSubscriptionsDataAccumulator.concat(orderedContent);

                    $scope.dataFetchingPercent = Math.round(($scope.offerSubscriptionsDataAccumulator.length / response.totalElements) * 100);

                    if (size <= response.numberOfElements && $scope.isDataFetchingInProgress) {
                        getData(++page, size);
                    } else {
                        $timeout(function () {
                            $scope.isDataFetchingInProgress = false;
                            $scope.isDataFetched = true;
                        }, 1000);
                    }
                });
            };

            getData(page, defaultSize);
        };

        $scope.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "msisdn": 'asc'
            }
        }, {
            $scope: $scope,
            total: 0,
            getData: function ($defer, params) {
                $scope.isInProgress = true;

                var page = params.page() - 1;
                var size = params.count();

                // Do not sort the date while getting.
                //var sortingPair = _.pairs(params.sorting());
                var sort = null;//sortingPair[0][0] + ',' + sortingPair[0][1];

                SSMSubscribersService.getOfferSubscriptions(page, size, sort, $scope.offer.id).then(function (response) {
                    if (response) {
                        $scope.offerSubscriptions = response.content;

                        params.total(response.totalElements);
                        $defer.resolve($scope.offerSubscriptions);
                    } else {
                        params.total(0);
                        $defer.resolve([]);
                    }

                    $scope.isInProgress = false;
                }, function (response) {
                    $log.debug('Cannot read offer subscriptions. Error: ', response);

                    params.total(0);
                    $defer.resolve([]);

                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.GenericServerError')
                    });

                    $scope.isInProgress = false;
                });
            }
        });

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.tableParams.settings().$scope.filterText = filterText;
            $scope.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.tableParams.page(1);
            $scope.tableParams.reload();
        }, 500);

        $scope.close = function () {
            $uibModalInstance.close();
        };

        $uibModalInstance.result.then(function () {
            $scope.isDataFetchingInProgress = false;
        }, function () {
            $scope.isDataFetchingInProgress = false;
        });
    });

    SubscriptionManagementOperationsOffersModule.controller('SubscriptionManagementOperationsContentSubscriptionsModalInstanceCtrl', function ($scope, $uibModalInstance, $log, $timeout, $filter, $translate, notification, NgTableParams, NgTableService, Restangular,
                                                                                                                                               SSMSubscribersService, offerParameter) {
        $log.debug('SubscriptionManagementOperationsContentSubscriptionsModalInstanceCtrl');

        $scope.isInProgress = false;

        $scope.offer = offerParameter;

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'msisdn',
                    headerKey: 'Subsystems.SubscriptionManagement.Operations.Offers.SubscriberId'
                },
                {
                    fieldName: 'san',
                    headerKey: 'Subsystems.SubscriptionManagement.Operations.Offers.SAN'
                },
                {
                    fieldName: 'fakeId',
                    headerKey: 'Subsystems.SubscriptionManagement.Operations.Offers.FakeId'
                },
                {
                    fieldName: 'contentId',
                    headerKey: 'Subsystems.SubscriptionManagement.Operations.Offers.ContentId'
                },
                {
                    fieldName: 'contentName',
                    headerKey: 'Subsystems.SubscriptionManagement.Operations.Offers.ContentName'
                },
                {
                    fieldName: 'subscriberState',
                    headerKey: 'Subsystems.SubscriptionManagement.Operations.Offers.SubscriberState'
                },
                {
                    fieldName: 'subscriptionState',
                    headerKey: 'Subsystems.SubscriptionManagement.Operations.Offers.SubscriptionState'
                },
                {
                    fieldName: 'lastSubscriptionDate',
                    headerKey: 'Subsystems.SubscriptionManagement.Operations.Offers.LastSubscriptionDate',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss']}
                }
            ]
        };

        $scope.fetchAllOfferSubscriptionsData = function () {
            var filterText = $scope.tableParams.settings().$scope.filterText;
            var filterColumns = $scope.tableParams.settings().$scope.filterColumns;

            $scope.contentSubscriptionsDataAccumulator = [];
            $scope.isDataFetchingInProgress = true;
            $scope.dataFetchingPercent = 0;

            var page = 0;
            var defaultSize = 1000;

            var getData = function (page, size) {
                SSMSubscribersService.getContentSubscriptionsByOfferId(page, size, $scope.offer.id).then(function (response) {
                    var filteredContent = NgTableService.filterList(filterText, filterColumns, response.content);
                    $scope.contentSubscriptionsDataAccumulator = $scope.contentSubscriptionsDataAccumulator.concat(filteredContent);

                    $scope.dataFetchingPercent = Math.round(($scope.contentSubscriptionsDataAccumulator.length / response.totalElements) * 100);

                    if (size <= response.numberOfElements && $scope.isDataFetchingInProgress) {
                        getData(++page, size);
                    } else {
                        $timeout(function () {
                            $scope.isDataFetchingInProgress = false;
                            $scope.isDataFetched = true;
                        }, 1000);
                    }
                });
            };

            getData(page, defaultSize);
        };

        $scope.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "msisdn": 'asc'
            }
        }, {
            $scope: $scope,
            total: 0,
            getData: function ($defer, params) {
                $scope.isInProgress = true;

                var page = params.page() - 1;
                var size = params.count();

                SSMSubscribersService.getContentSubscriptionsByOfferId(page, size, $scope.offer.id).then(function (response) {
                    if (response) {
                        $scope.contentSubscriptions = response.content;

                        params.total(response.totalElements);
                        $defer.resolve($scope.contentSubscriptions);
                    } else {
                        params.total(0);
                        $defer.resolve([]);
                    }

                    $scope.isInProgress = false;
                }, function (response) {
                    $log.debug('Cannot read offer subscriptions. Error: ', response);

                    params.total(0);
                    $defer.resolve([]);

                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.GenericServerError')
                    });

                    $scope.isInProgress = false;
                });
            }
        });

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.tableParams.settings().$scope.filterText = filterText;
            $scope.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.tableParams.page(1);
            $scope.tableParams.reload();
        }, 500);

        $scope.close = function () {
            $uibModalInstance.close();
        };

        $uibModalInstance.result.then(function () {
            $scope.isDataFetchingInProgress = false;
        }, function () {
            $scope.isDataFetchingInProgress = false;
        });
    });

})();
