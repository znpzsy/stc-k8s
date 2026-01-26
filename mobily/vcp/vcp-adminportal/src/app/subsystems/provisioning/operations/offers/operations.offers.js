(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning.operations.offers', []);

    var ProvisioningOffersOperationsModule = angular.module('adminportal.subsystems.provisioning.operations.offers');

    ProvisioningOffersOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.provisioning.operations.offers', {
            abstract: true,
            url: "/offers",
            data: {
                listState: 'subsystems.provisioning.operations.offers.list',
                newState: 'subsystems.provisioning.operations.offers.new',
                updateState: 'subsystems.provisioning.operations.offers.update'
            },
            template: '<div ui-view></div>'
        }).state('subsystems.provisioning.operations.offers.list', {
            url: "",
            templateUrl: "subsystems/provisioning/operations/offers/operations.offers.html",
            controller: 'ProvisioningOperationsOffersCtrl',
            resolve: {
                offers: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getOffers(0, DEFAULT_REST_QUERY_LIMIT);
                }
            }
        }).state('subsystems.provisioning.operations.offers.new', {
            url: "/new",
            templateUrl: "subsystems/provisioning/operations/offers/operations.offers.detail.html",
            controller: 'ProvisioningOperationsNewOfferCtrl',
            resolve: {
                offerTemplate: function (CMPFService) {
                    return CMPFService.getOfferTemplateByName(CMPFService.OFFER_TEMPLATE_NAME);
                }
            }
        }).state('subsystems.provisioning.operations.offers.update', {
            url: "/update/:id",
            templateUrl: "subsystems/provisioning/operations/offers/operations.offers.detail.html",
            controller: 'ProvisioningOperationsUpdateOfferCtrl',
            resolve: {
                offerTemplate: function (CMPFService) {
                    return CMPFService.getOfferTemplateByName(CMPFService.OFFER_TEMPLATE_NAME);
                },
                offer: function ($stateParams, $q, $log, notification, $translate, Restangular, CMPFService) {
                    var offerId = $stateParams.id;

                    var deferred = $q.defer();

                    CMPFService.getOffer(offerId).then(function (offerResponse) {
                        $log.debug('Offer found:', offerResponse);

                        var offer = Restangular.stripRestangular(offerResponse);

                        CMPFService.getOperator(offer.organizationId, false).then(function (organizationResponse) {
                            $log.debug('Organization found:', organizationResponse);

                            offerResponse.organization = Restangular.stripRestangular(organizationResponse);

                            deferred.resolve(offerResponse);
                        }, function (errorResponse) {
                            $log.debug('Cannot find organization. Error:', errorResponse);

                            notification({
                                type: 'warning',
                                text: $translate.instant('Subsystems.Provisioning.Offers.Messages.OrganizationNotFound')
                            });

                            offerResponse.organization = {};

                            deferred.resolve(offerResponse);
                        });
                    }, function (errorResponse) {
                        deferred.reject();
                    });

                    return deferred.promise;
                },
                offers: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getOffers(0, DEFAULT_REST_QUERY_LIMIT, true, false);
                }
            }
        });

    });

    ProvisioningOffersOperationsModule.controller('ProvisioningOperationsCommonCtrl', function ($scope, $log, $controller, $state, $filter, $uibModal, notification, $translate, UtilService,
                                                                                                Restangular, CMPFService, STATUS_TYPES, DURATION_UNITS, CHARGING_FAILURE_POLICIES,
                                                                                                CHARGING_HANDLERS, TERMINATION_POLICIES, RENEWAL_POLICIES, TRIAL_POLICIES) {
        $log.debug('ProvisioningOperationsCommonCtrl');

        $controller('GenericDateTimeCtrl', {$scope: $scope});

        $scope.STATUS_TYPES = STATUS_TYPES;
        $scope.DURATION_UNITS = DURATION_UNITS;
        $scope.CHARGING_FAILURE_POLICIES = CHARGING_FAILURE_POLICIES;
        $scope.CHARGING_HANDLERS = CHARGING_HANDLERS;
        $scope.TERMINATION_POLICIES = TERMINATION_POLICIES;
        $scope.RENEWAL_POLICIES = RENEWAL_POLICIES;
        $scope.TRIAL_POLICIES = TRIAL_POLICIES;

        $scope.dateFilter.startDate = $scope.getOneDayAgo();
        $scope.dateFilter.startTime = $scope.getOneDayAgo();
        $scope.dateFilter.endDate = $scope.getTodayBegin();
        $scope.dateFilter.endTime = $scope.getTodayBegin();

        // I18N
        $scope.addI18NText = function (entityi18nProfiles) {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/offers/operations.offers.new.modal.i18n.html',
                controller: function ($scope, $uibModalInstance, entityi18nProfile, offerParameter, XSM_SMS_PROFILE_LANGUAGES) {
                    $scope.XSM_SMS_PROFILE_LANGUAGES = XSM_SMS_PROFILE_LANGUAGES;

                    $scope.offer = offerParameter;
                    $scope.entityi18nProfile = entityi18nProfile;

                    $scope.save = function (entityi18nProfile) {
                        $uibModalInstance.close(entityi18nProfile);
                    };
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'lg',
                resolve: {
                    entityi18nProfile: function () {
                        return {IsDefault: false};
                    },
                    offerParameter: function () {
                        return $scope.offer;
                    }
                }
            });

            modalInstance.result.then(function (entityi18nProfile) {
                entityi18nProfiles.push(entityi18nProfile);
            }, function () {
            });
        };

        $scope.editI18NText = function (originalEntityi18nProfile) {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/offers/operations.offers.new.modal.i18n.html',
                controller: function ($scope, $uibModalInstance, entityi18nProfile, offerParameter, XSM_SMS_PROFILE_LANGUAGES) {
                    $scope.XSM_SMS_PROFILE_LANGUAGES = XSM_SMS_PROFILE_LANGUAGES;

                    $scope.offer = offerParameter;
                    $scope.entityi18nProfile = entityi18nProfile;

                    $scope.isEntityI18nNotChanged = function () {
                        return angular.equals($scope.entityi18nProfile, originalEntityi18nProfile);
                    };

                    $scope.save = function (entityi18nProfile) {
                        $uibModalInstance.close(entityi18nProfile);
                    };
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'lg',
                resolve: {
                    entityi18nProfile: function () {
                        return angular.copy(originalEntityi18nProfile);
                    },
                    offerParameter: function () {
                        return $scope.offer;
                    }
                }
            });

            modalInstance.result.then(function (entityi18nProfile) {
                angular.copy(entityi18nProfile, originalEntityi18nProfile);
            }, function () {
                angular.copy(originalEntityi18nProfile, entityi18nProfile);
            });
        };

        $scope.removeI18NText = function (entityi18nProfiles, i18n) {
            var index = _.indexOf(entityi18nProfiles, i18n);
            if (index !== -1) {
                entityi18nProfiles.splice(index, 1);
            }
        };

        // Short Code and Keywords
        $scope.addShortcodeAndKeyword = function (shortcodeAndKeywords) {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/offers/operations.offers.new.modal.shortcodeandkeyword.html',
                controller: function ($scope, $uibModalInstance, shortcodeAndKeyword, offerParameter, SHORT_CODE_AND_KEYWORD_ACTIONS) {
                    $scope.SHORT_CODE_AND_KEYWORD_ACTIONS = SHORT_CODE_AND_KEYWORD_ACTIONS;

                    $scope.offer = offerParameter;
                    $scope.shortcodeAndKeyword = shortcodeAndKeyword;

                    $scope.save = function (shortcodeAndKeyword) {
                        $uibModalInstance.close(shortcodeAndKeyword);
                    };
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'lg',
                resolve: {
                    shortcodeAndKeyword: function () {
                        return {};
                    },
                    offerParameter: function () {
                        return $scope.offer;
                    }
                }
            });

            modalInstance.result.then(function (shortcodeAndKeyword) {
                shortcodeAndKeywords.push(shortcodeAndKeyword);
            }, function () {
            });
        };

        $scope.editShortcodeAndKeyword = function (originalShortcodeAndKeyword) {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/offers/operations.offers.new.modal.shortcodeandkeyword.html',
                controller: function ($scope, $uibModalInstance, shortcodeAndKeyword, offerParameter, SHORT_CODE_AND_KEYWORD_ACTIONS) {
                    $scope.SHORT_CODE_AND_KEYWORD_ACTIONS = SHORT_CODE_AND_KEYWORD_ACTIONS;

                    $scope.offer = offerParameter;
                    $scope.shortcodeAndKeyword = shortcodeAndKeyword;

                    $scope.isEntityI18nNotChanged = function () {
                        return angular.equals($scope.shortcodeAndKeyword, originalShortcodeAndKeyword);
                    };

                    $scope.save = function (shortcodeAndKeyword) {
                        $uibModalInstance.close(shortcodeAndKeyword);
                    };
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'lg',
                resolve: {
                    shortcodeAndKeyword: function () {
                        return angular.copy(originalShortcodeAndKeyword);
                    },
                    offerParameter: function () {
                        return $scope.offer;
                    }
                }
            });

            modalInstance.result.then(function (shortcodeAndKeyword) {
                angular.copy(shortcodeAndKeyword, originalShortcodeAndKeyword);
            }, function () {
                angular.copy(originalShortcodeAndKeyword, shortcodeAndKeyword);
            });
        };

        $scope.removeShortcodeAndKeyword = function (shortcodeAndKeywords, i18n) {
            var index = _.indexOf(shortcodeAndKeywords, i18n);
            if (index !== -1) {
                shortcodeAndKeywords.splice(index, 1);
            }
        };

        $scope.showOperators = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.organizations.html',
                controller: 'OrganizationsModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    organizationParameter: function () {
                        return angular.copy($scope.selectedOperator);
                    },
                    itemName: function () {
                        return $scope.offer.name;
                    },
                    allOrganizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllOperatorsAndVirtualOperators(0, DEFAULT_REST_QUERY_LIMIT);
                    },
                    organizationsModalTitleKey: function () {
                        return 'Subsystems.Provisioning.Offers.OrganizationModalTitle';
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selectedOperator = selectedItem.organization;
            }, function () {
                //
            });
        };

        $scope.showTrialNextOffers = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.offers.html',
                controller: 'OffersModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    offerParameter: function () {
                        return angular.copy($scope.selectedTrialNextOffer);
                    },
                    itemName: function () {
                        return $scope.offer.name;
                    },
                    allOffers: function ($q, CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        var deferred = $q.defer();

                        // Filter out the try & buy offers from the all offers list that will be show on the modal window.
                        CMPFService.getOffers(0, DEFAULT_REST_QUERY_LIMIT, true, true).then(function (response) {
                            if (response && response.offers && response.offers.length > 0) {
                                response.offers = _.reject(response.offers, function (offer) {
                                    var xsmTrialProfiles = CMPFService.getProfileAttributes(offer.profiles, CMPFService.XSM_TRIAL_PROFILE);

                                    return (xsmTrialProfiles.length > 0) && xsmTrialProfiles[0].TryAndBuyEnabled;
                                });
                            }

                            deferred.resolve(response);
                        });

                        return deferred.promise;
                    },
                    offersModalTitleKey: function () {
                        return 'Subsystems.Provisioning.Offers.XsmTrial.NextOfferModalTitle';
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selectedTrialNextOffer = selectedItem.offer;
            }, function () {
                //
            });
        };

        $scope.showServices = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/offers/operations.offers.modal.services.html',
                controller: 'OfferServicesModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    servicesParameter: function () {
                        return angular.copy($scope.selectedServices);
                    },
                    offerNameParameter: function () {
                        return $scope.offer.name;
                    },
                    services: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getServices(0, DEFAULT_REST_QUERY_LIMIT);
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

        $scope.extractOfferProfiles = function (profiles) {
            var offerProfiles = {};

            offerProfiles.entityi18nProfiles = CMPFService.getProfileAttributes(profiles, CMPFService.ENTITY_I18N_PROFILE);

            // XsmChargingProfile
            var xsmChargingProfiles = CMPFService.getProfileAttributes(profiles, CMPFService.XSM_CHARGING_PROFILE);
            if (xsmChargingProfiles.length > 0) {
                offerProfiles.xsmChargingProfile = {
                    profileId: xsmChargingProfiles[0].profileId,
                    ChargingPeriod: UtilService.convertPeriodStringToSimpleObject(xsmChargingProfiles[0].ChargingPeriod),
                    ChargingFailurePolicy: xsmChargingProfiles[0].ChargingFailurePolicy,
                    MaxFailedChargingAttemptCount: Number(xsmChargingProfiles[0].MaxFailedChargingAttemptCount),
                    MaxRetryCount: Number(xsmChargingProfiles[0].MaxRetryCount),
                    RetryPeriod: UtilService.convertPeriodStringToSimpleObject(xsmChargingProfiles[0].RetryPeriod),
                    Handler: xsmChargingProfiles[0].Handler
                };
            }

            // XsmOfferProfile
            var xsmOfferProfiles = CMPFService.getProfileAttributes(profiles, CMPFService.XSM_OFFER_PROFILE);
            if (xsmOfferProfiles.length > 0) {
                offerProfiles.xsmOfferProfile = {
                    profileId: xsmOfferProfiles[0].profileId,
                    SubscriptionDuration: Number(xsmOfferProfiles[0].SubscriptionDuration),
                    LastSubscriptionDate: new Date(xsmOfferProfiles[0].LastSubscriptionDate),
                    TerminationPolicy: xsmOfferProfiles[0].TerminationPolicy,
                    NotifySubscriberOnStateChanges: xsmOfferProfiles[0].NotifySubscriberOnStateChanges
                };
            } else {
                offerProfiles.xsmOfferProfile = {
                    LastSubscriptionDate: $scope.getTodayBegin()
                };
            }

            // XsmRenewalProfile
            var xsmRenewalProfiles = CMPFService.getProfileAttributes(profiles, CMPFService.XSM_RENEWAL_PROFILE);
            if (xsmRenewalProfiles.length > 0) {
                offerProfiles.xsmRenewalProfile = {
                    profileId: xsmRenewalProfiles[0].profileId,
                    RenewalPolicy: xsmRenewalProfiles[0].RenewalPolicy
                };
            }

            // XsmTrialProfile
            var xsmTrialProfiles = CMPFService.getProfileAttributes(profiles, CMPFService.XSM_TRIAL_PROFILE);
            if (xsmTrialProfiles.length > 0) {
                offerProfiles.xsmTrialProfile = {
                    profileId: xsmTrialProfiles[0].profileId,
                    TryAndBuyEnabled: xsmTrialProfiles[0].TryAndBuyEnabled,
                    TryAndBuyPolicy: xsmTrialProfiles[0].TryAndBuyPolicy,
                    TrialPeriod: UtilService.convertPeriodStringToSimpleObject(xsmTrialProfiles[0].TrialPeriod),
                    NotificationEventDuration: UtilService.convertPeriodStringToSimpleObject(xsmTrialProfiles[0].NotificationEventDuration),
                    NextOfferId: xsmTrialProfiles[0].NextOfferId
                };
            }

            // Find offer profile reference from the related profile.
            var offerProfileProfiles = CMPFService.getProfileAttributes(profiles, CMPFService.OFFER_PROFILE);
            if (offerProfileProfiles.length > 0) {
                offerProfiles.offerProfile = {
                    profileId: offerProfileProfiles[0].profileId,
                    Description: offerProfileProfiles[0].Description
                };
            } else {
                offerProfiles.offerProfile = {
                    Description: ''
                }
            }

            return offerProfiles;
        };

        // Profile generation methods
        $scope.generateEntityi18nProfiles = function (entityi18nProfiles) {
            var entityi18nProfileArray = [];

            angular.forEach(entityi18nProfiles, function (smsLang, key) {
                var newi18NProfile = {
                    name: CMPFService.ENTITY_I18N_PROFILE,
                    profileDefinitionName: CMPFService.ENTITY_I18N_PROFILE,
                    attributes: [
                        {
                            "name": "IsDefault",
                            "value": smsLang.IsDefault
                        },
                        {
                            "name": "Language",
                            "value": smsLang.Language
                        },
                        {
                            "name": "Title",
                            "value": smsLang.Title
                        },
                        {
                            "name": "Description",
                            "value": smsLang.Description
                        }
                    ]
                };

                this.push(newi18NProfile);
            }, entityi18nProfileArray);

            return entityi18nProfileArray;
        };

        $scope.MaxFailedChargingAttemptCountDefault = 0;
        $scope.MaxRetryCountDefault = 90;
        $scope.RetryPeriodDefault = UtilService.convertSimpleObjectToPeriod({duration: 1, unit: 'Days'});
        $scope.ChargingFailurePolicyDefault = $scope.CHARGING_FAILURE_POLICIES[0].key;
        $scope.HandlerDefault = $scope.CHARGING_HANDLERS[0].key;
        $scope.TerminationPolicyDefault = $scope.TERMINATION_POLICIES[1].key;

        $scope.generateXsmChargingProfiles = function (xsmChargingProfile) {
            var xsmChargingProfileObj = {
                name: CMPFService.XSM_CHARGING_PROFILE,
                profileDefinitionName: CMPFService.XSM_CHARGING_PROFILE,
                attributes: [
                    {
                        "name": "MaxFailedChargingAttemptCount",
                        "value": $scope.MaxFailedChargingAttemptCountDefault
                    },
                    {
                        "name": "MaxRetryCount",
                        "value": $scope.MaxRetryCountDefault
                    },
                    {
                        "name": "RetryPeriod",
                        "value": $scope.RetryPeriodDefault
                    },
                    {
                        "name": "ChargingPeriod",
                        "value": UtilService.convertSimpleObjectToPeriod(xsmChargingProfile.ChargingPeriod)
                    },
                    {
                        "name": "ChargingFailurePolicy",
                        "value": $scope.ChargingFailurePolicyDefault
                    },
                    {
                        "name": "Handler",
                        "value": $scope.HandlerDefault
                    },
                ]
            };

            return xsmChargingProfileObj;
        };

        $scope.generateXsmOfferProfiles = function (xsmOfferProfile) {
            var LastSubscriptionDateStr = $filter('date')(xsmOfferProfile.LastSubscriptionDate, 'yyyy-MM-dd') + 'T00:00:00';

            var xsmOfferProfileObj = {
                name: CMPFService.XSM_OFFER_PROFILE,
                profileDefinitionName: CMPFService.XSM_OFFER_PROFILE,
                attributes: [
                    {
                        "name": "LastSubscriptionDate",
                        "value": LastSubscriptionDateStr
                    },
                    {
                        "name": "SubscriptionDuration",
                        "value": xsmOfferProfile.SubscriptionDuration
                    },
                    {
                        "name": "TerminationPolicy",
                        "value": $scope.TerminationPolicyDefault
                    },
                    {
                        "name": "NotifySubscriberOnStateChanges",
                        "value": xsmOfferProfile.NotifySubscriberOnStateChanges
                    },
                ]
            };

            return xsmOfferProfileObj;
        };

        $scope.generateXsmRenewalProfile = function (xsmRenewalProfile) {
            var xsmRenewalProfileObj = {
                name: CMPFService.XSM_RENEWAL_PROFILE,
                profileDefinitionName: CMPFService.XSM_RENEWAL_PROFILE,
                attributes: [
                    {
                        "name": "RenewalPolicy",
                        "value": xsmRenewalProfile.RenewalPolicy
                    }
                ]
            };

            return xsmRenewalProfileObj;
        };

        $scope.generateXsmTrialProfile = function (xsmTrialProfile) {
            var xsmTrialProfileObj = {
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
                        "name": "NotificationEventDuration",
                        "value": UtilService.convertSimpleObjectToPeriod(xsmTrialProfile.NotificationEventDuration)
                    },
                    {
                        "name": "NextOfferId",
                        "value": xsmTrialProfile.NextOfferId
                    }
                ]
            };

            return xsmTrialProfileObj;
        };

        $scope.generateOfferProfile = function (offerProfile) {
            var offerProfileObj = {
                name: CMPFService.OFFER_PROFILE,
                profileDefinitionName: CMPFService.OFFER_PROFILE,
                attributes: [
                    {
                        "name": "Description",
                        "value": offerProfile.Description
                    }
                ]
            };

            return offerProfileObj;
        };

        $scope.prepareProfile = function (updatedProfile, originalProfile) {
            // First we delete the profileId since it is for internal usage.
            delete updatedProfile.profileId;

            var attrArray = [];

            // Check the all fields of the updated object and put them into the new array
            // or the previous one.
            _.each(updatedProfile, function (value, key) {
                var attr;
                if (originalProfile) {
                    attrArray = originalProfile.attributes;
                    attr = _.find(attrArray, function (attribute) {
                        return attribute.name === key;
                    });
                }

                if (attr) {
                    if (value && _.isArray(value)) {
                        attr.listValues = value;
                    } else {
                        attr.value = value;
                    }
                } else {
                    if (value && _.isArray(value)) {
                        attrArray.push({
                            "name": key,
                            "listValues": value
                        });
                    } else {
                        attrArray.push({
                            "name": key,
                            "value": value
                        });
                    }
                }
            });

            return attrArray;
        };

        $scope.cancel = function () {
            $scope.go($state.current.data.listState);
        };
    });

    ProvisioningOffersOperationsModule.controller('ProvisioningOperationsOffersCtrl', function ($scope, $log, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                Restangular, AuthorizationService, CMPFService, SubscriptionManagementService,
                                                                                                offers, DEFAULT_REST_QUERY_LIMIT, STATUS_TYPES) {
        $log.debug('ProvisioningOperationsOffersCtrl');

        $scope.STATUS_TYPES = STATUS_TYPES;

        $scope.stateFilter = 'ALL';
        $scope.stateFilterChange = function (state) {
            if (state !== 'ALL') {
                $scope.offers = _.where($scope.originalOffers, {state: state});
            } else {
                $scope.offers = angular.copy($scope.originalOffers);
            }

            $scope.tableParams.page(1);
            $scope.tableParams.reload();
        };

        var offers = Restangular.stripRestangular(offers);
        $scope.offers = $filter('orderBy')(offers.offers, 'id');
        // Reformatted all records again to show meaningful data on the table
        _.each($scope.offers, function (offer) {
            offer.organization = {
                name: CMPFService.DEFAULT_ORGANIZATION_NAME
            };
        });
        $scope.originalOffers = angular.copy($scope.offers);

        $scope.exportAllData = function(fileNamePrefix, exporter) {
            CMPFService.getOffers(0, DEFAULT_REST_QUERY_LIMIT, true, true).then(function(exportingOffers) {
                var exportingOfferList = exportingOffers.offers;

                // Reformatted all records again to show meaningful data on the exporting data.
                _.each(exportingOfferList, function (offer) {
                    offer.serviceNames = _.pluck(offer.services, 'name').toString();
                });

                exporter.download(fileNamePrefix, exportingOfferList);
            });
        };

        // Table export options
        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'id',
                    headerKey: 'Subsystems.Provisioning.Offers.Id'
                },
                {
                    fieldName: 'name',
                    headerKey: 'Subsystems.Provisioning.Offers.Name'
                },
                {
                    fieldName: 'organization.name',
                    headerKey: 'Subsystems.Provisioning.Offers.Organization'
                },
                {
                    fieldName: 'serviceNames',
                    headerKey: 'Subsystems.Provisioning.Offers.Services'
                },
                {
                    fieldName: 'state',
                    headerKey: 'Subsystems.Provisioning.Offers.State'
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
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
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

                    if (response.data && response.data.errorDescription && response.data.errorDescription.indexOf('SM_OFFER_SUBSCRIPTION') > -1) {
                        notification({
                            type: 'warning',
                            text: $translate.instant('CommonMessages.ThereAreOfferSubscriptions')
                        });
                    } else {
                        CMPFService.showApiError(response);
                    }
                });
            }, function () {
                //
            });
        };

        $scope.showServices = function (offer) {
            $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/offers/operations.offers.modal.services.view.html',
                controller: 'OffersOwnServicesModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    offerNameParameter: function () {
                        return offer.name;
                    },
                    offer: function (CMPFService) {
                        return CMPFService.getOffer(offer.id);
                    }
                }
            });
        };

        $scope.showSubscriptions = function (offer) {
            $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/offers/operations.offers.modal.subscriptions.html',
                controller: 'OfferSubscriptionsModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    offerParameter: function () {
                        return offer;
                    }
                }
            });
        };
    });

    ProvisioningOffersOperationsModule.controller('ProvisioningOperationsNewOfferCtrl', function ($scope, $log, $state, $controller, $filter, $uibModal, $translate, notification, Restangular, UtilService,
                                                                                                  CMPFService, offerTemplate) {
        $log.debug('ProvisioningOperationsNewOfferCtrl');

        $controller('ProvisioningOperationsCommonCtrl', {
            $scope: $scope
        });

        // Empty offer object.
        $scope.offer = {
            name: '',
            state: $scope.STATUS_TYPES[0].name,
            entityi18nProfiles: [], // This does not using anywhere.
            offerProfile: {
                Description: ''
            },
            xsmChargingProfile: {},
            xsmOfferProfile: {},
            xsmRenewalProfile: {},
            xsmTrialProfile: {}

        };
        $scope.selectedOperator = {};
        $scope.selectedTrialNextOffer = {};
        $scope.selectedServices = [];

        var offerTemplate = Restangular.stripRestangular(offerTemplate).offerTemplates[0];
        if (offerTemplate) {
            var offerProfiles = $scope.extractOfferProfiles(offerTemplate.profiles);

            // Entityi18nProfile this is attaching to the scope because it is using from there in the view.
            $scope.entityi18nProfiles = offerProfiles.entityi18nProfiles;

            // XsmChargingProfile
            $scope.offer.xsmChargingProfile = offerProfiles.xsmChargingProfile;

            // XsmOfferProfile
            $scope.offer.xsmOfferProfile = offerProfiles.xsmOfferProfile;

            // XsmOfferProfile
            $scope.offer.xsmRenewalProfile = offerProfiles.xsmRenewalProfile;

            // XsmTrialProfile
            $scope.offer.xsmTrialProfile = offerProfiles.xsmTrialProfile;
        }

        $scope.save = function (offer) {
            if (!$scope.selectedOperator.name) {
                notification({
                    type: 'warning',
                    text: $translate.instant('Subsystems.Provisioning.Offers.Messages.SelectOrganization')
                });

                return;
            }

            if (!$scope.selectedServices.length) {
                notification({
                    type: 'warning',
                    text: $translate.instant('Subsystems.Provisioning.Offers.Messages.SelectService')
                });

                return;
            }

            var offerObj = {
                name: offer.name,
                state: offer.state,
                organizationId: $scope.selectedOperator.id,
                profiles: []
            };

            var entityi18nProfiles = $scope.generateEntityi18nProfiles($scope.entityi18nProfiles);
            offerObj.profiles = offerObj.profiles.concat(entityi18nProfiles);

            var xsmChargingProfile = $scope.generateXsmChargingProfiles(offer.xsmChargingProfile);
            offerObj.profiles = offerObj.profiles.concat(xsmChargingProfile);

            var xsmOfferProfile = $scope.generateXsmOfferProfiles(offer.xsmOfferProfile);
            offerObj.profiles = offerObj.profiles.concat(xsmOfferProfile);

            var xsmRenewalProfile = $scope.generateXsmRenewalProfile(offer.xsmRenewalProfile);
            offerObj.profiles = offerObj.profiles.concat(xsmRenewalProfile);

            // Set the selected trial next offer to the related property of the trial profile.
            offer.xsmTrialProfile.NextOfferId = (!_.isEmpty($scope.selectedTrialNextOffer) && !_.isUndefined($scope.selectedTrialNextOffer) ? $scope.selectedTrialNextOffer.id : 0);
            var xsmTrialProfile = $scope.generateXsmTrialProfile(offer.xsmTrialProfile);
            offerObj.profiles = offerObj.profiles.concat(xsmTrialProfile);

            var offerProfile = $scope.generateOfferProfile(offer.offerProfile);
            offerObj.profiles = offerObj.profiles.concat(offerProfile);

            $log.debug('Saving offer:', offerObj);

            CMPFService.createOffer([offerObj]).then(function (response) {
                $log.debug('Created new offer. Response: ', response);

                if (response && response.errorCode) {
                    CMPFService.showApiError(response);
                } else {
                    var offerId = Restangular.stripRestangular(response)[0].id;

                    // Add services to the offer
                    CMPFService.addServicesToOffer(offerId, $scope.selectedServices).then(function (response) {
                        $log.debug('Added services to offer. Response: ', response);

                        if (response && response.errorCode) {
                            CMPFService.showApiError(response);
                        }
                    }, function (response) {
                        $log.debug('Cannot add service to offer. Error: ', response);

                        CMPFService.showApiError(response);
                    });

                    notification.flash({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $scope.cancel();
                }
            }, function (response) {
                $log.debug('Cannot save offer. Error: ', response);

                CMPFService.showApiError(response);
            });
        };
    });

    ProvisioningOffersOperationsModule.controller('ProvisioningOperationsUpdateOfferCtrl', function ($scope, $state, $log, $controller, $filter, $timeout, $q, notification, $translate, $uibModal, Restangular,
                                                                                                     AuthorizationService, CMPFService, UtilService, offer, offerTemplate, offers) {
        $log.debug('ProvisioningOperationsUpdateOfferCtrl');

        $controller('ProvisioningOperationsCommonCtrl', {
            $scope: $scope
        });

        // Offer object.
        $scope.offer = Restangular.stripRestangular(offer);

        var offerProfiles = $scope.extractOfferProfiles(offer.profiles);

        var offerTemplate = Restangular.stripRestangular(offerTemplate).offerTemplates[0];

        // Entityi18nProfile this is attaching to the scope because it is using from there in the view.
        $scope.entityi18nProfiles = offerProfiles.entityi18nProfiles;
        $scope.originalEntityi18nProfiles = angular.copy($scope.entityi18nProfiles);

        // XsmChargingProfile
        $scope.offer.xsmChargingProfile = offerProfiles.xsmChargingProfile;

        // XsmOfferProfile
        $scope.offer.xsmOfferProfile = offerProfiles.xsmOfferProfile;

        // XsmRenewalProfile
        $scope.offer.xsmRenewalProfile = offerProfiles.xsmRenewalProfile;

        // XsmTrialProfile
        $scope.offer.xsmTrialProfile = offerProfiles.xsmTrialProfile;
        // Find the selected offer from all offer list if selected before.
        $scope.selectedTrialNextOffer = {}
        if ($scope.offer.xsmTrialProfile) {
            if ($scope.offer.xsmTrialProfile.NextOfferId && Number($scope.offer.xsmTrialProfile.NextOfferId) > 0) {
                $scope.selectedTrialNextOffer = _.findWhere(offers.offers, {id: Number($scope.offer.xsmTrialProfile.NextOfferId)});
            }
        } else if (offerTemplate) {
            var offerTemplateProfiles = $scope.extractOfferProfiles(offerTemplate.profiles);

            // XsmTrialProfile
            $scope.offer.xsmTrialProfile = offerTemplateProfiles.xsmTrialProfile;
        }
        $scope.originalSelectedTrialNextOffer = angular.copy($scope.selectedTrialNextOffer);

        // OfferProfile
        $scope.offer.offerProfile = offerProfiles.offerProfile;

        $scope.originalOffer = angular.copy($scope.offer);

        $scope.selectedOperator = $scope.offer.organization;
        $scope.originalSelectedOperator = angular.copy($scope.selectedOperator);

        $scope.originalServices = $filter('orderBy')($scope.offer.services, 'id');
        $scope.selectedServices = angular.copy($scope.originalServices);

        $scope.isNotChanged = function () {
            return angular.equals($scope.offer, $scope.originalOffer)
                && angular.equals($scope.selectedOperator, $scope.originalSelectedOperator)
                && angular.equals($scope.selectedTrialNextOffer, $scope.originalSelectedTrialNextOffer)
                && angular.equals($scope.selectedServices, $scope.originalServices)
                && angular.equals($scope.entityi18nProfiles, $scope.originalEntityi18nProfiles);
        };

        var deleteServices = function (offer) {
            var deferred = $q.defer();
            if ($scope.originalServices.length > 0) {
                var service = $scope.originalServices.shift();

                // Check is the old one removed from the list.
                var foundService = _.findWhere($scope.selectedServices, {id: service.id});
                if (!foundService) {
                    CMPFService.removeServicesFromOffer(offer.id, service).then(function (response) {
                        if (response && response.errorCode) {
                            CMPFService.showApiError(response);
                        }
                    }, function (response) {
                        $log.error('Cannot remove service from offer. Error: ', response);

                        CMPFService.showApiError(response);
                    });
                }

                $timeout(function () {
                    deleteServices(offer);
                }, 1000);
            } else {
                deferred.resolve(offer);
            }

            return deferred.promise;
        };

        $scope.save = function (offer) {
            if (!$scope.selectedOperator.name) {
                notification({
                    type: 'warning',
                    text: $translate.instant('Subsystems.Provisioning.Offers.Messages.SelectOrganization')
                });

                return;
            }

            if (!$scope.selectedServices.length) {
                notification({
                    type: 'warning',
                    text: $translate.instant('Subsystems.Provisioning.Offers.Messages.SelectService')
                });

                return;
            }

            var offerObj = {
                id: $scope.originalOffer.id,
                name: offer.name,
                state: offer.state,
                organizationId: $scope.selectedOperator.id,
                services: $scope.selectedServices,
                profiles: $scope.originalOffer.profiles
            };

            // Entityi18nProfiles
            var originalEntityi18nProfiles = CMPFService.findProfilesByName(offerObj.profiles, CMPFService.ENTITY_I18N_PROFILE);
            _.each($scope.entityi18nProfiles, function (updatedEntityi18nProfile) {
                updatedEntityi18nProfile = JSON.parse(angular.toJson(updatedEntityi18nProfile));

                var originalEntityi18nProfile = _.findWhere(originalEntityi18nProfiles, {id: updatedEntityi18nProfile.profileId});
                var entityi18nProfileAttrArray = $scope.prepareProfile(updatedEntityi18nProfile, originalEntityi18nProfile);
                if (originalEntityi18nProfile) {
                    originalEntityi18nProfile.attributes = entityi18nProfileAttrArray;
                } else {
                    var entityi18nProfile = {
                        name: CMPFService.ENTITY_I18N_PROFILE,
                        profileDefinitionName: CMPFService.ENTITY_I18N_PROFILE,
                        attributes: entityi18nProfileAttrArray
                    };

                    offerObj.profiles.push(entityi18nProfile);
                }
            });

            // XsmChargingProfile
            var originalXsmChargingProfile = CMPFService.findProfileByName(offerObj.profiles, CMPFService.XSM_CHARGING_PROFILE);
            offer.xsmChargingProfile.ChargingPeriod.toJSON = function () {
                return UtilService.convertSimpleObjectToPeriod(this);
            };
            offer.xsmChargingProfile.RetryPeriod.toJSON = function () {
                return UtilService.convertSimpleObjectToPeriod(this);
            };
            var updatedXsmChargingProfile = JSON.parse(angular.toJson(offer.xsmChargingProfile));
            var xsmChargingProfileArray = $scope.prepareProfile(updatedXsmChargingProfile, originalXsmChargingProfile);
            // Set default values
            var MaxFailedChargingAttemptCountAttr = _.findWhere(xsmChargingProfileArray, {name: 'MaxFailedChargingAttemptCount'});
            if (MaxFailedChargingAttemptCountAttr) {
                MaxFailedChargingAttemptCountAttr.value = $scope.MaxFailedChargingAttemptCountDefault;
            }
            var MaxRetryCountAttr = _.findWhere(xsmChargingProfileArray, {name: 'MaxRetryCount'});
            if (MaxRetryCountAttr) {
                MaxRetryCountAttr.value = $scope.MaxRetryCountDefault;
            }
            var RetryPeriodAttr = _.findWhere(xsmChargingProfileArray, {name: 'RetryPeriod'});
            if (RetryPeriodAttr) {
                RetryPeriodAttr.value = $scope.RetryPeriodDefault;
            }
            var ChargingFailurePolicyAttr = _.findWhere(xsmChargingProfileArray, {name: 'ChargingFailurePolicy'});
            if (ChargingFailurePolicyAttr) {
                ChargingFailurePolicyAttr.value = $scope.ChargingFailurePolicyDefault;
            }
            var HandlerAttr = _.findWhere(xsmChargingProfileArray, {name: 'Handler'});
            if (HandlerAttr) {
                HandlerAttr.value = $scope.HandlerDefault;
            }
            // ---
            if (originalXsmChargingProfile) {
                originalXsmChargingProfile.attributes = xsmChargingProfileArray;
            } else {
                var xsmChargingProfile = {
                    name: CMPFService.XSM_CHARGING_PROFILE,
                    profileDefinitionName: CMPFService.XSM_CHARGING_PROFILE,
                    attributes: xsmChargingProfileArray
                };

                offerObj.profiles.push(xsmChargingProfile);
            }

            // XsmOfferProfile
            var originalXsmOfferProfile = CMPFService.findProfileByName(offerObj.profiles, CMPFService.XSM_OFFER_PROFILE);
            offer.xsmOfferProfile.LastSubscriptionDate.toJSON = function () {
                return $filter('date')(this, 'yyyy-MM-dd') + 'T00:00:00';
            }
            var updatedXsmOfferProfile = JSON.parse(angular.toJson(offer.xsmOfferProfile));
            var xsmOfferProfileArray = $scope.prepareProfile(updatedXsmOfferProfile, originalXsmOfferProfile);
            // Set default values
            var TerminationPolicyAttr = _.findWhere(xsmOfferProfileArray, {name: 'TerminationPolicy'});
            if (TerminationPolicyAttr) {
                TerminationPolicyAttr.value = $scope.TerminationPolicyDefault;
            }
            // ---
            if (originalXsmOfferProfile) {
                originalXsmOfferProfile.attributes = xsmOfferProfileArray;
            } else {
                var xsmOfferProfile = {
                    name: CMPFService.XSM_OFFER_PROFILE,
                    profileDefinitionName: CMPFService.XSM_OFFER_PROFILE,
                    attributes: xsmOfferProfileArray
                };

                offerObj.profiles.push(xsmOfferProfile);
            }

            // XsmRenewalProfile
            var originalXsmRenewalProfile = CMPFService.findProfileByName(offerObj.profiles, CMPFService.XSM_RENEWAL_PROFILE);
            var updatedXsmRenewalProfile = JSON.parse(angular.toJson(offer.xsmRenewalProfile));
            var xsmRenewalProfileArray = $scope.prepareProfile(updatedXsmRenewalProfile, originalXsmRenewalProfile);
            if (originalXsmRenewalProfile) {
                originalXsmRenewalProfile.attributes = xsmRenewalProfileArray;
            } else {
                var xsmRenewalProfile = {
                    name: CMPFService.XSM_RENEWAL_PROFILE,
                    profileDefinitionName: CMPFService.XSM_RENEWAL_PROFILE,
                    attributes: xsmRenewalProfileArray
                };

                offerObj.profiles.push(xsmRenewalProfile);
            }

            // XsmTrialProfile
            var originalXsmTrialProfile = CMPFService.findProfileByName(offerObj.profiles, CMPFService.XSM_TRIAL_PROFILE);
            offer.xsmTrialProfile.TrialPeriod.toJSON = function () {
                return UtilService.convertSimpleObjectToPeriod(this);
            };
            offer.xsmTrialProfile.NotificationEventDuration.toJSON = function () {
                return UtilService.convertSimpleObjectToPeriod(this);
            };
            offer.xsmTrialProfile.NextOfferId = (!_.isEmpty($scope.selectedTrialNextOffer) && !_.isUndefined($scope.selectedTrialNextOffer) ? $scope.selectedTrialNextOffer.id : 0);
            var updatedXsmTrialProfile = JSON.parse(angular.toJson(offer.xsmTrialProfile));
            var xsmTrialProfileArray = $scope.prepareProfile(updatedXsmTrialProfile, originalXsmTrialProfile);
            if (originalXsmTrialProfile) {
                originalXsmTrialProfile.attributes = xsmTrialProfileArray;
            } else {
                var xsmTrialProfile = {
                    name: CMPFService.XSM_TRIAL_PROFILE,
                    profileDefinitionName: CMPFService.XSM_TRIAL_PROFILE,
                    attributes: xsmTrialProfileArray
                };

                offerObj.profiles.push(xsmTrialProfile);
            }

            // OfferProfile
            var originalOfferProfile = CMPFService.findProfileByName(offerObj.profiles, CMPFService.OFFER_PROFILE);
            var updatedOfferProfile = JSON.parse(angular.toJson(offer.offerProfile));
            var offerProfileArray = $scope.prepareProfile(updatedOfferProfile, originalOfferProfile);
            if (originalOfferProfile) {
                originalOfferProfile.attributes = offerProfileArray;
            } else {
                var offerProfile = {
                    name: CMPFService.OFFER_PROFILE,
                    profileDefinitionName: CMPFService.OFFER_PROFILE,
                    attributes: offerProfileArray
                };

                offerObj.profiles.push(offerProfile);
            }

            $log.debug('Updating offer:', offerObj);

            CMPFService.updateOffer(offerObj).then(function (response) {
                $log.debug('Updated offer. Response: ', response);

                if (response && response.errorCode) {
                    CMPFService.showApiError(response);
                } else {
                    deleteServices(offerObj).then(function (response) {
                        $log.debug('Removed unselected services from the offer: ', response);

                        if (response && response.errorCode) {
                            CMPFService.showApiError(response);
                        }
                    }, function (response) {
                        $log.debug('Cannot removed unselected services from the offer. Error: ', response);

                        CMPFService.showApiError(response);
                    });

                    notification.flash({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $scope.cancel();
                }
            }, function (response) {
                $log.debug('Cannot update offer. Error: ', response);

                CMPFService.showApiError(response);
            });
        };
    });

    ProvisioningOffersOperationsModule.controller('OffersOwnServicesModalInstanceCtrl', function ($scope, $uibModalInstance, $log, $filter, NgTableParams, NgTableService, Restangular,
                                                                                                  CMPFService, offerNameParameter, offer) {
        $log.debug('OffersOwnServicesModalInstanceCtrl');

        $scope.offerName = offerNameParameter;

        $scope.services = Restangular.stripRestangular(offer).services;
        $scope.services = $filter('orderBy')($scope.services, ['id']);

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'id',
                    headerKey: 'Subsystems.Provisioning.Services.Id'
                },
                {
                    fieldName: 'name',
                    headerKey: 'Subsystems.Provisioning.Services.Name'
                },
                {
                    fieldName: 'state',
                    headerKey: 'Subsystems.Provisioning.Services.State'
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

        $scope.ok = function () {
            $uibModalInstance.close();
        };
    });

    ProvisioningOffersOperationsModule.controller('OfferSubscriptionsModalInstanceCtrl', function ($scope, $uibModalInstance, $log, $timeout, $translate, NgTableParams, CMPFService, Restangular,
                                                                                                   offerParameter, MAXIMUM_RECORD_DOWNLOAD_SIZE) {
        $log.debug('OfferSubscriptionsModalInstanceCtrl');

        $scope.offer = offerParameter;

        $scope.apiResponse = {};

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'ms',
                    headerKey: 'Subsystems.Provisioning.Offers.SubscriberId'
                },
                {
                    fieldName: 'snst',
                    headerKey: 'Subsystems.Provisioning.Offers.SubscriptionState'
                }
            ]
        };

        $scope.tableParams = new NgTableParams({
            page: 1,
            count: 10
        }, {
            $scope: $scope,
            total: 0,
            getData: function ($defer, params) {
                var offset = (params.page() - 1) * params.count();
                var limit = params.count();

                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;

                CMPFService.getOfferSubscriptionsSummary($scope.offer.id, offset, limit, filterText).then(function (response) {
                    $scope.apiResponse = Restangular.stripRestangular(response);

                    var totalCount = $scope.apiResponse.metaData.totalCount;

                    $scope.isDataFetched = false;
                    $scope.selectedOffset = undefined;

                    // Prepare data range array to guiding data generate operation.
                    $scope.dataRangeArray = [];
                    for (var i = 0; i < totalCount; i += MAXIMUM_RECORD_DOWNLOAD_SIZE) {
                        var maxLimit = (i + MAXIMUM_RECORD_DOWNLOAD_SIZE)
                        if (maxLimit > totalCount) {
                            maxLimit = totalCount;
                        }

                        $scope.dataRangeArray.push({
                            label: i + ' - ' + maxLimit,
                            value: i
                        });
                    }

                    params.total(totalCount);
                    $defer.resolve($scope.apiResponse.offerSubscriptions);
                }, function (response) {
                    $log.debug('Cannot read service subscriptions. Error: ', response);
                });
            }
        });

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.tableParams.settings().$scope.filterText = filterText;
            $scope.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.tableParams.page(1);
            $scope.tableParams.reload();
        }, 500);

        $scope.fetchOfferSubscriptionsData = function (offset) {
            var firstOffset = offset;
            var filterText = $scope.tableParams.settings().$scope.filterText;

            var offset = offset ? offset : 0;
            $scope.offerSubscriptionsDataAccumulator = [];
            $scope.isDataFetchingInProgress = true;
            $scope.dataFetchingPercent = 0;

            var limit = 1000;

            var getData = function (offset, limit) {
                CMPFService.getOfferSubscriptionsSummary($scope.offer.id, offset, limit, filterText, null, true).then(function (response) {
                    $scope.offerSubscriptionsDataAccumulator = $scope.offerSubscriptionsDataAccumulator.concat(response.offerSubscriptions);

                    var totalRecordCount = response.metaData.totalCount < MAXIMUM_RECORD_DOWNLOAD_SIZE ? response.metaData.totalCount : MAXIMUM_RECORD_DOWNLOAD_SIZE;

                    $scope.dataFetchingPercent = Math.round(($scope.offerSubscriptionsDataAccumulator.length / totalRecordCount) * 100);

                    if (((offset + limit) - firstOffset) < totalRecordCount && $scope.isDataFetchingInProgress) {
                        getData(offset + limit, limit);
                    } else {
                        $timeout(function () {
                            $scope.isDataFetchingInProgress = false;
                            $scope.isDataFetched = true;
                        }, 1000);
                    }
                });
            }

            getData(offset, limit);
        };

        $scope.close = function () {
            $uibModalInstance.close();
        };

        $uibModalInstance.result.then(function () {
            $scope.isDataFetchingInProgress = false;
        }, function () {
            $scope.isDataFetchingInProgress = false;
        });
    });

    ProvisioningOffersOperationsModule.controller('OfferServicesModalInstanceCtrl', function ($scope, $uibModalInstance, $log, $filter, NgTableParams, NgTableService, Restangular,
                                                                                              CMPFService, servicesParameter, offerNameParameter, services) {
        $log.debug('OfferServicesModalInstanceCtrl');

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

})();
