(function () {

    'use strict';

    angular.module('partnerportal.partner-info.services', [
        'partnerportal.partner-info.services.templates',
        'partnerportal.partner-info.services.servicecapabilityaccess',
        'partnerportal.partner-info.services.servicefees',
        'partnerportal.partner-info.services.keywordchaptermapping',
        'partnerportal.partner-info.services.ondemandi18n',
        'partnerportal.partner-info.services.servicecopyrightfile',
        'partnerportal.partner-info.services.contentbasedsettlement',
        'partnerportal.partner-info.services.sla',
        'partnerportal.partner-info.services.new',
        'partnerportal.partner-info.services.update'
    ]);

    var PartnerInfoServicesModule = angular.module('partnerportal.partner-info.services');

    PartnerInfoServicesModule.config(function ($stateProvider) {

        $stateProvider.state('partner-info.services', {
            abstract: true,
            url: "/services",
            template: "<div ui-view></div>",
            data: {
                permissions: [
                    'PRM__SERVICE_READ'
                ]
            }
        }).state('partner-info.services.list', {
            url: "",
            templateUrl: "partner-info/services/operations.services.html",
            controller: 'PartnerInfoServicesCtrl',
            resolve: {
                services: function ($rootScope, CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    var organizationId = $rootScope.getOrganizationId();

                    return CMPFService.getServicesByOrganizationId(organizationId);
                }
            }
        });

    });

    PartnerInfoServicesModule.controller('PartnerInfoServicesCommonCtrl', function ($scope, $log, $controller, $state, $filter, $uibModal, SessionService, CMPFService,
                                                                                    SERVICE_TYPES, SERVICE_LANGUAGES, SERVICE_USAGES, SERVICE_TEMPLATES, SERVICE_HIDE_MSISDN_WITH_VALUES,
                                                                                    SERVICE_LEGACY_PRODUCT_STATUSES, SERVICE_CURRENCIES, SERVICE_DCB_SUBSCRIBER_IDS_AT_OPERATOR, SERVICE_NOTIFICATION_PROTOCOLS,
                                                                                    SERVICE_OUTBOUND_APIS, SERVICE_VAT_CATEGORIES, businessTypesOrganization, settlementTypesOrganization) {
        $log.debug('PartnerInfoServicesCommonCtrl');

        $controller('GenericDateTimeCtrl', {$scope: $scope});

        $scope.sessionOrganization = SessionService.getSessionOrganization();
        $scope.username = SessionService.getUsername();

        var ORIGINAL_SERVICE_TYPES = angular.copy(SERVICE_TYPES);
        $scope.SERVICE_TYPES = angular.copy(ORIGINAL_SERVICE_TYPES);
        $scope.SERVICE_LANGUAGES = SERVICE_LANGUAGES;
        $scope.SERVICE_USAGES = SERVICE_USAGES;
        $scope.SERVICE_TEMPLATES = SERVICE_TEMPLATES;
        $scope.SERVICE_HIDE_MSISDN_WITH_VALUES = SERVICE_HIDE_MSISDN_WITH_VALUES;
        $scope.SERVICE_LEGACY_PRODUCT_STATUSES = SERVICE_LEGACY_PRODUCT_STATUSES;
        $scope.SERVICE_CURRENCIES = SERVICE_CURRENCIES;
        $scope.SERVICE_DCB_SUBSCRIBER_IDS_AT_OPERATOR = SERVICE_DCB_SUBSCRIBER_IDS_AT_OPERATOR;
        $scope.SERVICE_NOTIFICATION_PROTOCOLS = SERVICE_NOTIFICATION_PROTOCOLS;
        $scope.SERVICE_OUTBOUND_APIS = SERVICE_OUTBOUND_APIS;
        $scope.SERVICE_VAT_CATEGORIES = SERVICE_VAT_CATEGORIES;

        var businessTypesOrganizationItem = businessTypesOrganization.organizations[0];
        var allBusinessTypes = CMPFService.getBusinessTypes(businessTypesOrganizationItem);
        $scope.businessTypes = [];

        var settlementTypesOrganizationItem = settlementTypesOrganization.organizations[0];
        var allSettlementTypes = CMPFService.getSettlementTypes(settlementTypesOrganizationItem);
        $scope.settlementTypes = [];

        $scope.initializeBusinessTypeList = function () {
            // Prepare business type list.
            var providerBusinessTypeProfiles = CMPFService.getProfileAttributes($scope.sessionOrganization.profiles, CMPFService.SERVICE_PROVIDER_BUSINESS_TYPE_PROFILE);
            _.each(providerBusinessTypeProfiles, function (providerBusinessTypeProfile) {
                var foundBusinessType = _.findWhere(allBusinessTypes, {profileId: providerBusinessTypeProfile.BusinessTypeID});
                if (foundBusinessType) {
                    $scope.businessTypes.push(foundBusinessType);
                }
            });
            $scope.businessTypes = $filter('orderBy')($scope.businessTypes, 'Name');

            var foundBusinessType = _.findWhere($scope.businessTypes, {profileId: $scope.service.serviceProfile.BusinessTypeID});
            if ($scope.service.serviceProfile.BusinessTypeID && !foundBusinessType) {
                $scope.service.serviceProfile.BusinessTypeID = null
            }
        };

        // Prepare settlement type list.
        var providerSettlementTypeProfiles = CMPFService.getProfileAttributes($scope.sessionOrganization.profiles, CMPFService.SERVICE_PROVIDER_SETTLEMENT_TYPE_PROFILE);

        // Business type selection listener
        $scope.$watch('service.serviceProfile.BusinessTypeID', function (newValue, oldValue) {
            $scope.settlementTypes = [];
            var foundBusinessType = _.findWhere(allBusinessTypes, {profileId: newValue});
            if (foundBusinessType) {
                // Filter out the service types
                if (foundBusinessType.Name === 'AppStore') {
                    $scope.SERVICE_TYPES = _.filter(ORIGINAL_SERVICE_TYPES, function (serviceType) {
                        return serviceType.value === 'DCB_SERVICE';
                    });
                } else if (foundBusinessType.Name === 'SMS') {
                    $scope.SERVICE_TYPES = _.filter(ORIGINAL_SERVICE_TYPES, function (serviceType) {
                        return serviceType.value.includes('SMS');
                    });
                } else if (foundBusinessType.Name === 'MMS') {
                    $scope.SERVICE_TYPES = _.filter(ORIGINAL_SERVICE_TYPES, function (serviceType) {
                        return serviceType.value.includes('MMS');
                    });
                } else if (foundBusinessType.Name === 'WAP/WEB') {
                    $scope.SERVICE_TYPES = _.filter(ORIGINAL_SERVICE_TYPES, function (serviceType) {
                        return serviceType.value === 'CUSTOMIZED_WEB_WAP_SERVICE';
                    });
                } else if (foundBusinessType.Name === 'Multi-Capability Service') {
                    $scope.SERVICE_TYPES = _.filter(ORIGINAL_SERVICE_TYPES, function (serviceType) {
                        return serviceType.value === 'MULTI_CAPABILITY_SERVICE';
                    });
                } else {
                    $scope.SERVICE_TYPES = angular.copy(ORIGINAL_SERVICE_TYPES);
                }

                var allSettlementTypeIds = _.pluck(foundBusinessType.SettlementTypes, "value");
                _.each(providerSettlementTypeProfiles, function (providerSettlementTypeProfile) {
                    var foundSettlementType = _.findWhere(allSettlementTypes, {profileId: providerSettlementTypeProfile.SettlementTypeID});
                    if (allSettlementTypeIds && foundSettlementType && _.contains(allSettlementTypeIds, foundSettlementType.profileId.toString())) {
                        if (foundSettlementType.IsPartnerSpecific) {
                            if (foundSettlementType.Partners) {
                                var partnerIds = String(foundSettlementType.Partners).split(',');
                                if (partnerIds.indexOf(String($scope.sessionOrganization.id)) > -1) {
                                    $scope.settlementTypes.push(foundSettlementType);
                                }
                            }
                        } else {
                            $scope.settlementTypes.push(foundSettlementType);
                        }
                    }
                });
            } else {
                $scope.SERVICE_TYPES = angular.copy(ORIGINAL_SERVICE_TYPES);
            }
            $scope.settlementTypes = $filter('orderBy')($scope.settlementTypes, 'Name');

            var foundSettlementType = _.findWhere($scope.settlementTypes, {profileId: $scope.service.serviceProfile.SettlementTypeID});
            if ($scope.service.serviceProfile.SettlementTypeID && !foundSettlementType) {
                $scope.service.serviceProfile.SettlementTypeID = null
            }
        });

        $scope.prepareServicei18nProfiles = function (servicei18nProfiles) {
            var servicei18nProfileArray = [];

            angular.forEach(servicei18nProfiles, function (servicei18nProfile) {
                var newi18NProfile = {
                    name: CMPFService.SERVICE_I18N_PROFILE,
                    profileDefinitionName: CMPFService.SERVICE_I18N_PROFILE,
                    attributes: [
                        {
                            "name": "Name",
                            "value": servicei18nProfile.Name
                        },
                        {
                            "name": "Language",
                            "value": servicei18nProfile.Language
                        },
                        {
                            "name": "Description",
                            "value": servicei18nProfile.Description
                        },
                        {
                            "name": "IsDefault",
                            "value": servicei18nProfile.IsDefault
                        },
                        {
                            "name": "SearchKeyword",
                            "value": servicei18nProfile.SearchKeyword
                        }
                    ]
                };

                this.push(newi18NProfile);
            }, servicei18nProfileArray);

            return servicei18nProfileArray;
        };

        $scope.prepareServiceProfile = function (dateHolder, serviceProfile) {
            return {
                name: CMPFService.SERVICE_PROFILE,
                profileDefinitionName: CMPFService.SERVICE_PROFILE,
                attributes: [
                    {
                        "name": "Description",
                        "value": serviceProfile.Description
                    },
                    {
                        "name": "StartDate",
                        "value": (dateHolder.startDate ? $filter('date')(dateHolder.startDate, 'yyyy-MM-dd') + 'T00:00:00' : '')
                    },
                    {
                        "name": "EndDate",
                        "value": $filter('date')(dateHolder.endDate, 'yyyy-MM-dd') + 'T00:00:00'
                    },
                    {
                        "name": "Language",
                        "value": serviceProfile.Language
                    },
                    {
                        "name": "Type",
                        "value": serviceProfile.Type
                    },
                    {
                        "name": "Template",
                        "value": serviceProfile.Template
                    },
                    {
                        "name": "Usage",
                        "value": serviceProfile.Usage
                    },
                    {
                        "name": "NotificationURL",
                        "value": serviceProfile.NotificationURL
                    },
                    {
                        "name": "CategoryID",
                        "value": serviceProfile.CategoryID
                    },
                    {
                        "name": "LabelID",
                        "value": serviceProfile.LabelID
                    },
                    {
                        "name": "IsHidingMSISDN",
                        "value": serviceProfile.IsHidingMSISDN
                    },
                    {
                        "name": "HideMSISDNWith",
                        "value": serviceProfile.HideMSISDNWith
                    },
                    {
                        "name": "Capabilities",
                        "listValues": serviceProfile.Capabilities
                    },
                    {
                        "name": "WEBIconID",
                        "value": serviceProfile.WEBIconID
                    },
                    {
                        "name": "WAPIconID",
                        "value": serviceProfile.WAPIconID
                    },
                    {
                        "name": "BusinessTypeID",
                        "value": serviceProfile.BusinessTypeID
                    },
                    {
                        "name": "SettlementTypeID",
                        "value": serviceProfile.SettlementTypeID
                    },
                    {
                        "name": "CopyrightFileID",
                        "value": serviceProfile.CopyrightFileID
                    },
                    {
                        "name": "LastUpdateTime",
                        "value": serviceProfile.LastUpdateTime
                    },
                    {
                        "name": "URLForMOSMS",
                        "value": serviceProfile.URLForMOSMS
                    },
                    {
                        "name": "URLForMOMMS",
                        "value": serviceProfile.URLForMOMMS
                    },
                    {
                        "name": "LegacyVsNewOutboundAPI",
                        "value": serviceProfile.LegacyVsNewOutboundAPI
                    }
                ]
            };
        };

        $scope.prepareAlertTemplateProfile = function (templateAttributes) {
            return {
                name: CMPFService.SERVICE_ALERT_TEMPLATE_PROFILE,
                profileDefinitionName: CMPFService.SERVICE_ALERT_TEMPLATE_PROFILE,
                attributes: [
                    {
                        "name": "IsDynamicContent",
                        "value": templateAttributes.IsDynamicContent
                    },
                    {
                        "name": "DynamicContentURL",
                        "value": templateAttributes.DynamicContentURL
                    },
                    {
                        "name": "IsTriggerSending",
                        "value": templateAttributes.IsTriggerSending
                    },
                    {
                        "name": "AlertScheduling",
                        "value": templateAttributes.AlertScheduling
                    },
                    {
                        "name": "CyclePeriod",
                        "value": templateAttributes.CyclePeriod
                    },
                    {
                        "name": "TimesOfDay",
                        "value": templateAttributes.TimesOfDay ? templateAttributes.TimesOfDay.join(';') : ''
                    },
                    {
                        "name": "DaysOfWeek",
                        "value": templateAttributes.CyclePeriod === 'WEEK' ? (templateAttributes.DaysOfWeek ? templateAttributes.DaysOfWeek.join(';') : '') : ''
                    },
                    {
                        "name": "DaysOfMonth",
                        "value": templateAttributes.CyclePeriod === 'MONTH' ? (templateAttributes.DaysOfMonth ? templateAttributes.DaysOfMonth.join(';') : '') : ''
                    }
                ]
            };
        };

        $scope.prepareOnDemandTemplateProfile = function (templateAttributes) {
            return {
                name: CMPFService.SERVICE_ON_DEMAND_TEMPLATE_PROFILE,
                profileDefinitionName: CMPFService.SERVICE_ON_DEMAND_TEMPLATE_PROFILE,
                attributes: [
                    {
                        "name": "IsDynamicContent",
                        "value": templateAttributes.IsDynamicContent
                    },
                    {
                        "name": "DynamicContentURL",
                        "value": templateAttributes.DynamicContentURL
                    },
                    {
                        "name": "ResponseMessageLangEN",
                        "value": templateAttributes.ResponseMessageLangEN
                    },
                    {
                        "name": "ResponseMessageLangOther",
                        "value": templateAttributes.ResponseMessageLangOther
                    },
                    {
                        "name": "ServiceProposalFileID",
                        "value": templateAttributes.ServiceProposalFileID
                    }
                ]
            };
        };

        $scope.prepareOtherTemplateProfile = function (templateAttributes) {
            return {
                name: CMPFService.SERVICE_OTHER_TEMPLATE_PROFILE,
                profileDefinitionName: CMPFService.SERVICE_OTHER_TEMPLATE_PROFILE,
                attributes: [
                    {
                        "name": "IsDynamicContent",
                        "value": templateAttributes.IsDynamicContent
                    },
                    {
                        "name": "DynamicContentURL",
                        "value": templateAttributes.DynamicContentURL
                    },
                    {
                        "name": "IsTriggerSending",
                        "value": templateAttributes.IsTriggerSending
                    },
                    {
                        "name": "IsChapteredContent",
                        "value": templateAttributes.IsChapteredContent
                    },
                    {
                        "name": "ServiceProposalFileID",
                        "value": templateAttributes.ServiceProposalFileID
                    }
                ]
            };
        };

        $scope.prepareServiceCapabilityAccessProfiles = function (serviceCapabilityAccessProfiles) {
            var serviceCapabilityAccessProfileArray = [];

            angular.forEach(serviceCapabilityAccessProfiles, function (serviceCapabilityAccessProfile) {
                var newServiceCapabilityAccessProfile = {
                    name: CMPFService.SERVICE_CAPABILITY_ACCESS_PROFILE,
                    profileDefinitionName: CMPFService.SERVICE_CAPABILITY_ACCESS_PROFILE,
                    attributes: [
                        {
                            "name": "CapabilityName",
                            "value": serviceCapabilityAccessProfile.CapabilityName
                        }
                    ]
                };

                this.push(newServiceCapabilityAccessProfile);
            }, serviceCapabilityAccessProfileArray);

            return serviceCapabilityAccessProfileArray;
        };

        $scope.prepareProductProfile = function (productProfile) {
            return {
                name: CMPFService.SERVICE_PRODUCT_PROFILE,
                profileDefinitionName: CMPFService.SERVICE_PRODUCT_PROFILE,
                attributes: [
                    {
                        "name": "Code",
                        "value": productProfile.Code
                    },
                    {
                        "name": "LegacyProductStatus",
                        "value": productProfile.LegacyProductStatus
                    },
                    {
                        "name": "NameLangEN",
                        "value": productProfile.NameLangEN
                    },
                    {
                        "name": "DescriptionLangEN",
                        "value": productProfile.DescriptionLangEN
                    },
                    {
                        "name": "NameLangOther",
                        "value": productProfile.NameLangOther
                    },
                    {
                        "name": "DescriptionLangOther",
                        "value": productProfile.DescriptionLangOther
                    }
                ]
            };
        };

        $scope.prepareMOChargingProfile = function (serviceMOChargingProfile) {
            return {
                name: CMPFService.SERVICE_MO_CHARGING_PROFILE,
                profileDefinitionName: CMPFService.SERVICE_MO_CHARGING_PROFILE,
                attributes: [
                    {
                        "name": "Fee",
                        "value": serviceMOChargingProfile.Fee
                    }
                ]
            };
        };

        $scope.prepareMTChargingProfiles = function (serviceMTChargingProfiles) {
            var serviceMTChargingProfileArray = [];

            angular.forEach(serviceMTChargingProfiles, function (serviceMTChargingProfile) {
                var newServiceMTChargingProfile = {
                    name: CMPFService.SERVICE_MT_CHARGING_PROFILE,
                    profileDefinitionName: CMPFService.SERVICE_MT_CHARGING_PROFILE,
                    attributes: [
                        {
                            "name": "ShortCode",
                            "value": serviceMTChargingProfile.ShortCode
                        },
                        {
                            "name": "Fee",
                            "value": serviceMTChargingProfile.Fee
                        }
                    ]
                };

                this.push(newServiceMTChargingProfile);
            }, serviceMTChargingProfileArray);

            return serviceMTChargingProfileArray;
        };

        $scope.prepareSenderIdProfile = function (senderIdProfile) {
            return {
                name: CMPFService.SERVICE_SENDER_ID_PROFILE,
                profileDefinitionName: CMPFService.SERVICE_SENDER_ID_PROFILE,
                attributes: [
                    {
                        "name": "SenderID",
                        "value": senderIdProfile.SenderID
                    }
                ]
            };
        };

        $scope.prepareKeywordChapterMappingProfiles = function (serviceKeywordChapterMappingProfiles) {
            var serviceKeywordChapterMappingProfileArray = [];

            angular.forEach(serviceKeywordChapterMappingProfiles, function (serviceKeywordChapterMappingProfile) {
                var newServiceKeywordChapterMappingProfile = {
                    name: CMPFService.SERVICE_KEYWORD_CHAPTER_MAPPING_PROFILE,
                    profileDefinitionName: CMPFService.SERVICE_KEYWORD_CHAPTER_MAPPING_PROFILE,
                    attributes: [
                        {
                            "name": "ChapterKeyword",
                            "value": serviceKeywordChapterMappingProfile.ChapterKeyword
                        },
                        {
                            "name": "ChapterId",
                            "value": serviceKeywordChapterMappingProfile.ChapterId
                        }
                    ]
                };

                this.push(newServiceKeywordChapterMappingProfile);
            }, serviceKeywordChapterMappingProfileArray);

            return serviceKeywordChapterMappingProfileArray;
        };

        $scope.prepareOnDemandi18nProfiles = function (serviceOnDemandi18nProfiles) {
            var serviceOnDemandi18nProfileArray = [];

            angular.forEach(serviceOnDemandi18nProfiles, function (serviceOnDemandi18nProfile) {
                var newServiceOnDemandi18nProfile = {
                    name: CMPFService.SERVICE_ON_DEMAND_I18N_PROFILE,
                    profileDefinitionName: CMPFService.SERVICE_ON_DEMAND_I18N_PROFILE,
                    attributes: [
                        {
                            "name": "Language",
                            "value": serviceOnDemandi18nProfile.Language
                        },
                        {
                            "name": "IsDefault",
                            "value": serviceOnDemandi18nProfile.IsDefault
                        },
                        {
                            "name": "OnDemandShortCode",
                            "value": serviceOnDemandi18nProfile.OnDemandShortCode
                        },
                        {
                            "name": "OnDemandCommands",
                            "value": serviceOnDemandi18nProfile.OnDemandCommands
                        },
                        {
                            "name": "OnDemandResponseMessage",
                            "value": serviceOnDemandi18nProfile.OnDemandResponseMessage
                        }
                    ]
                };

                this.push(newServiceOnDemandi18nProfile);
            }, serviceOnDemandi18nProfileArray);

            return serviceOnDemandi18nProfileArray;
        };

        $scope.prepareSubscriptionNotificationProfile = function (subscriptionNotificationProfile) {
            return {
                name: CMPFService.SERVICE_SUBSCRIPTION_NOTIFICATION_PROFILE,
                profileDefinitionName: CMPFService.SERVICE_SUBSCRIPTION_NOTIFICATION_PROFILE,
                attributes: [
                    {
                        "name": "url",
                        "value": subscriptionNotificationProfile.url
                    },
                    {
                        "name": "LegacyVsNewNotification",
                        "value": subscriptionNotificationProfile.LegacyVsNewNotification
                    }
                ]
            };
        };

        $scope.prepareServiceCopyrightFileProfiles = function (dateHolder, serviceCopyrightFileProfiles) {
            var serviceCopyrightFileProfileArray = [];

            angular.forEach(serviceCopyrightFileProfiles, function (serviceCopyrightFileProfile) {
                var newServiceCopyrightFileProfile = {
                    name: CMPFService.SERVICE_COPYRIGHT_FILE_PROFILE,
                    profileDefinitionName: CMPFService.SERVICE_COPYRIGHT_FILE_PROFILE,
                    attributes: [
                        {
                            "name": "CopyrightFileID",
                            "value": serviceCopyrightFileProfile.CopyrightFileID
                        },
                        {
                            "name": "ValidFrom",
                            "value": (serviceCopyrightFileProfile.ValidFrom ? $filter('date')(serviceCopyrightFileProfile.ValidFrom, 'yyyy-MM-dd') + 'T00:00:00' : '')
                        },
                        {
                            "name": "ValidTo",
                            "value": (serviceCopyrightFileProfile.ValidTo ? $filter('date')(serviceCopyrightFileProfile.ValidTo, 'yyyy-MM-dd') + 'T00:00:00' : '')
                        }
                    ]
                };

                this.push(newServiceCopyrightFileProfile);
            }, serviceCopyrightFileProfileArray);

            return serviceCopyrightFileProfileArray;
        };

        $scope.prepareServiceVATProfile = function (serviceVATProfile) {
            return {
                name: CMPFService.SERVICE_VAT_PROFILE,
                profileDefinitionName: CMPFService.SERVICE_VAT_PROFILE,
                attributes: [
                    {
                        "name": "HasSpecialVATPercentage",
                        "value": serviceVATProfile.HasSpecialVATPercentage
                    },
                    {
                        "name": "VATCategory",
                        "value": serviceVATProfile.VATCategory
                    },
                    {
                        "name": "VATPercentage",
                        "value": serviceVATProfile.VATPercentage
                    }
                ]
            };
        };

        $scope.prepareServiceContentBasedSettlementProfiles = function (serviceContentBasedSettlementProfiles) {
            var serviceContentBasedSettlementProfileArray = [];

            angular.forEach(serviceContentBasedSettlementProfiles, function (serviceContentBasedSettlementProfile) {
                var newServiceContentBasedSettlementProfile = {
                    name: CMPFService.SERVICE_CONTENT_BASED_SETTLEMENT_PROFILE,
                    profileDefinitionName: CMPFService.SERVICE_CONTENT_BASED_SETTLEMENT_PROFILE,
                    attributes: [
                        {
                            "name": "ProductCategoryID",
                            "value": serviceContentBasedSettlementProfile.ProductCategoryID
                        },
                        {
                            "name": "ContentTypeID",
                            "value": serviceContentBasedSettlementProfile.ContentTypeID
                        },
                        {
                            "name": "SettlementTypeID",
                            "value": serviceContentBasedSettlementProfile.SettlementTypeID
                        },
                        {
                            "name": "ContentTypeName",
                            "value": serviceContentBasedSettlementProfile.ContentTypeName
                        }
                    ]
                };

                this.push(newServiceContentBasedSettlementProfile);
            }, serviceContentBasedSettlementProfileArray);

            return serviceContentBasedSettlementProfileArray;
        };

        $scope.prepareDCBServiceProfile = function (dcbServiceProfile) {
            return {
                name: CMPFService.SERVICE_DCB_SERVICE_PROFILE,
                profileDefinitionName: CMPFService.SERVICE_DCB_SERVICE_PROFILE,
                attributes: [
                    {
                        "name": "AggregatorName",
                        "value": dcbServiceProfile.AggregatorName
                    },
                    {
                        "name": "AssociationAPIURL",
                        "value": dcbServiceProfile.AssociationAPIURL
                    },
                    {
                        "name": "CarrierId",
                        "value": dcbServiceProfile.CarrierId
                    },
                    {
                        "name": "ClientAPIPassword",
                        "value": dcbServiceProfile.ClientAPIPassword
                    },
                    {
                        "name": "ClientAPIUsername",
                        "value": dcbServiceProfile.ClientAPIUsername
                    },
                    {
                        "name": "Currency",
                        "value": dcbServiceProfile.Currency
                    },
                    {
                        "name": "DeassociationAPIURL",
                        "value": dcbServiceProfile.DeassociationAPIURL
                    },
                    {
                        "name": "IsCapped",
                        "value": dcbServiceProfile.IsCapped
                    },
                    {
                        "name": "OTTName",
                        "value": dcbServiceProfile.OTTName
                    },
                    {
                        "name": "SilentSMSShortCode",
                        "value": dcbServiceProfile.SilentSMSShortCode
                    },
                    {
                        "name": "TrustStatus",
                        "value": dcbServiceProfile.TrustStatus
                    },
                    {
                        "name": "BlockDCBEnabled",
                        "value": dcbServiceProfile.BlockDCBEnabled
                    }
                ]
            };
        };

        $scope.prepareDCBServiceActivationProfile = function (dcbServiceActivationProfile) {
            return {
                name: CMPFService.SERVICE_DCB_SERVICE_ACTIVATION_PROFILE,
                profileDefinitionName: CMPFService.SERVICE_DCB_SERVICE_ACTIVATION_PROFILE,
                attributes: [
                    {
                        "name": "SubscriberIDatOTT",
                        "value": dcbServiceActivationProfile.SubscriberIDatOTT
                    },
                    {
                        "name": "UseHeaderEnrichment",
                        "value": dcbServiceActivationProfile.UseHeaderEnrichment
                    },
                    {
                        "name": "UseOperatorOTP",
                        "value": dcbServiceActivationProfile.UseOperatorOTP
                    },
                    {
                        "name": "UseOTTOTP",
                        "value": dcbServiceActivationProfile.UseOTTOTP
                    },
                    {
                        "name": "SubscriberIDatOperator",
                        "value": dcbServiceActivationProfile.SubscriberIDatOperator
                    },
                    {
                        "name": "UseSilentSMS",
                        "value": dcbServiceActivationProfile.UseSilentSMS
                    }
                ]
            };
        };

        $scope.cancel = function () {
            if ($state.current.data.cancelState.url) {
                $state.go($state.current.data.cancelState.url, $state.current.data.cancelState.params);
            } else {
                $state.go($state.current.data.cancelState);
            }
        };

        // Call the templates controller so it could be mixed with this controller.
        $controller('PartnerInfoServicesTemplatesCtrl', {$scope: $scope});

        // Call the service capability access controller so it could be mixed with this controller.
        $controller('PartnerInfoServiceCapabilityAccessCtrl', {$scope: $scope});

        // Call the service fees controller so it could be mixed with this controller.
        $controller('PartnerInfoServicesFeesCtrl', {$scope: $scope});

        // Call the service keyword chapter mapping controller so it could be mixed with this controller.
        $controller('PartnerInfoKeywordChapterMappingCtrl', {$scope: $scope});

        // Call the service on-demand i18n controller so it could be mixed with this controller.
        $controller('PartnerInfoOnDemandi18nCtrl', {$scope: $scope});

        // Call the service copyright file controller so it could be mixed with this controller.
        $controller('PartnerInfoServiceCopyrightFileCtrl', {$scope: $scope});

        // Call the service content based settlement controller so it could be mixed with this controller.
        $controller('PartnerInfoServiceContentBasedSettlementProfileCtrl', {$scope: $scope});
    });

    PartnerInfoServicesModule.controller('PartnerInfoServicesCtrl', function ($scope, $log, $state, $filter, $uibModal, $translate, notification, NgTableParams, NgTableService, Restangular,
                                                                              SessionService, WorkflowsService, CMPFService, services, DEFAULT_REST_QUERY_LIMIT) {
        $log.debug('PartnerInfoServicesCtrl');

        $scope.sessionOrganization = SessionService.getSessionOrganization();
        $scope.username = SessionService.getUsername();

        $scope.stateFilter = 'ALL';
        $scope.stateFilterChange = function (state) {
            if (state !== 'ALL') {
                if (state === 'WAITING') {
                    $scope.services.list = [];
                    WorkflowsService.getPendingTasks(0, DEFAULT_REST_QUERY_LIMIT, 'SERVICE').then(function (waitingServiceTasks) {
                        if (waitingServiceTasks && waitingServiceTasks.length > 0) {
                            _.each(waitingServiceTasks, function (serviceTask) {
                                if (serviceTask && serviceTask.name && (serviceTask.name.toLowerCase() === 'service create task')) {
                                    serviceTask.objectDetail.taskObjectId = serviceTask.serviceId;
                                    serviceTask.objectDetail.state = 'WAITING FOR APPROVAL';
                                    serviceTask.objectDetail.taskName = serviceTask.name;

                                    $scope.services.list.push(serviceTask.objectDetail);
                                }
                            });
                        }

                        $scope.services.tableParams.page(1);
                        $scope.services.tableParams.reload();
                    });
                } else {
                    $scope.services.list = _.where($scope.originalServiceList, {state: state});
                }
            } else {
                $scope.services.list = angular.copy($scope.originalServiceList);
            }

            $scope.services.tableParams.page(1);
            $scope.services.tableParams.reload();
        };

        // Task details modal window.
        $scope.showTaskDetails = function (service) {
            service.rowSelected = true;

            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'partials/modal/empty.modal.html',
                controller: function ($scope, $controller, $uibModalInstance, taskDetail) {
                    $controller('WorkflowsOperationsTasksDetailServiceCtrl', {
                        $scope: $scope,
                        taskDetail: taskDetail
                    });

                    $scope.isModal = true;
                    $scope.modalTitle = service.taskName;
                    $scope.templateUrl = 'workflows/operations/operations.tasks.services.detail.html';

                    $scope.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'lg',
                resolve: {
                    taskDetail: function () {
                        return {
                            serviceTask: {
                                objectDetail: service
                            }
                        };
                    }
                }
            });

            modalInstance.result.then(function () {
                service.rowSelected = false;
            }, function () {
                service.rowSelected = false;
            });
        };

        var serviceList = $filter('orderBy')(services.services, 'id');
        _.each(serviceList, function (service) {
            // Watch the all isEllipseButtonOpen properties of the accordions to be able to query price groups when any accordion element opened.
            var isEllipseButtonOpen = false;
            if (_.isUndefined(service.isEllipseButtonOpen)) {
                Object.defineProperty(service, 'isEllipseButtonOpen', {
                    get: function () {
                        return isEllipseButtonOpen;
                    },
                    set: function (newValue) {
                        if (service.isEllipseButtonOpen && !service.serviceProfile) {
                            // Call service
                            CMPFService.getService(service.id).then(function (serviceResponse) {
                                var serviceProfiles = CMPFService.getProfileAttributes(serviceResponse.profiles, CMPFService.SERVICE_PROFILE);
                                if (serviceProfiles.length > 0) {
                                    service.serviceProfile = angular.copy(serviceProfiles[0]);
                                }

                                service.showEllipseMenuContent = true;
                            });
                        } else {
                            service.showEllipseMenuContent = service.isEllipseButtonOpen;
                        }

                        isEllipseButtonOpen = newValue;
                    },
                    configurable: true
                });
            }
        });
        $scope.originalServiceList = angular.copy(serviceList);

        $scope.exportAllData = function (fileNamePrefix, exporter) {
            CMPFService.getServicesByOrganizationId($scope.sessionOrganization.id, true, true, null, [CMPFService.SERVICE_PROFILE]).then(function (exportingServices) {
                var exportingServiceList = $filter('orderBy')(exportingServices.services, 'id');
                // Reformatted all records again to show meaningful data on the exporting data.
                _.each(exportingServiceList, function (service) {
                    var serviceProfiles = CMPFService.getProfileAttributes(service.profiles, CMPFService.SERVICE_PROFILE);
                    if (serviceProfiles.length > 0) {
                        service.serviceProfile = angular.copy(serviceProfiles[0]);
                    }
                });

                exporter.download(fileNamePrefix, exportingServiceList);
            });
        };

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'id',
                    headerKey: 'PartnerInfo.Services.Id'
                },
                {
                    fieldName: 'name',
                    headerKey: 'PartnerInfo.Services.Name'
                },
                {
                    fieldName: 'serviceProfile.Description',
                    headerKey: 'PartnerInfo.Services.ServiceProfile.Description'
                },
                {
                    fieldName: 'state',
                    headerKey: 'PartnerInfo.Services.State'
                },
                {
                    fieldName: 'serviceProfile.StartDate',
                    headerKey: 'GenericFormFields.StartDate.Label',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss']}
                },
                {
                    fieldName: 'serviceProfile.EndDate',
                    headerKey: 'GenericFormFields.EndDate.Label',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss']}
                }
            ]
        };

        // Service list
        $scope.services = {
            list: serviceList,
            tableParams: {}
        };

        $scope.services.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "id": 'asc'
            }
        }, {
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.services.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.services.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Service list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.services.tableParams.settings().$scope.filterText = filterText;
            $scope.services.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.services.tableParams.page(1);
            $scope.services.tableParams.reload();
        }, 500);

        $scope.remove = function (service) {
            service.rowSelected = true;

            var currentSDPService;

            var modalInstance = $uibModal.open({
                size: 'sm',
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: function ($scope, $uibModalInstance, $translate, $controller, $sce, service) {
                    var message = $translate.instant('CommonLabels.ConfirmationRemoveMessage');
                    message = message + ' [' + service.name + ']';
                    $scope.confirmationMessage = $sce.trustAsHtml(message);

                    currentSDPService = service;

                    $controller('ConfirmationModalInstanceCtrl', {
                        $scope: $scope,
                        $uibModalInstance: $uibModalInstance
                    });

                },
                resolve: {
                    service: function (CMPFService) {
                        return CMPFService.getService(service.id);
                    }
                }
            });

            modalInstance.result.then(function () {
                $log.debug('Trying to remove service: ', currentSDPService);

                var serviceItem = {
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
                    "serviceDetail": {
                        "serviceId": currentSDPService.id,
                        "name": currentSDPService.name,
                        "serviceProviderId": currentSDPService.organizationId,
                        "state": currentSDPService.state
                        // Changed attributes.
                        // ...
                    }
                };

                /*
                // Service deletion workflow is starting.
                WorkflowsService.deleteService(serviceItem).then(function (createResponse) {
                    $log.debug('Service Deleted Successfully. Response: ', createResponse);

                    if (createResponse && createResponse.message) {
                        WorkflowsService.showApiError(createResponse);
                    } else {
                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });
                    }
                }, function (createErrorResponse) {
                    $log.debug('Service cannot be deleted. Error: ', createErrorResponse);

                    WorkflowsService.showApiError(createErrorResponse);
                });
                */

                service.rowSelected = false;
            }, function () {
                service.rowSelected = false;
            });
        };

        $scope.updateServiceStateByMobilyUser = function (service, newState) {
            service.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: function ($scope, $uibModalInstance, $translate, $controller, $sce) {
                    var message = '';
                    if (newState === 'SUSPENDED') {
                        message = $translate.instant('PartnerInfo.Services.Messages.SuspendConfirmationMessage');
                    } else if (newState === 'ACTIVE') {
                        message = $translate.instant('PartnerInfo.Services.Messages.ActivateConfirmationMessage');
                    } else if (newState === 'INACTIVE') {
                        message = $translate.instant('PartnerInfo.Services.Messages.InactivateConfirmationMessage');
                    } else if (newState === 'HIDDEN') {
                        message = $translate.instant('PartnerInfo.Services.Messages.HideConfirmationMessage');
                    } else if (newState === 'UNHIDDEN') {
                        message = $translate.instant('PartnerInfo.Services.Messages.UnhideConfirmationMessage');
                        newState = 'ACTIVE';
                    }

                    message = message + ' [' + service.name + ']';
                    $scope.confirmationMessage = $sce.trustAsHtml(message);

                    $controller('ConfirmationModalInstanceCtrl', {
                        $scope: $scope,
                        $uibModalInstance: $uibModalInstance
                    });
                },
                size: 'sm'
            });

            modalInstance.result.then(function () {
                    $log.debug('Change state of service:', service.name);

                    CMPFService.getService(service.id).then(function (serviceResponse) {
                        serviceResponse = Restangular.stripRestangular(serviceResponse);

                        // Changed values
                        serviceResponse.state = newState;

                        CMPFService.checkEntityAuditProfile(serviceResponse.profiles);

                        // Workflows special service object
                        var serviceItem = {
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
                            "serviceDetail": serviceResponse
                        };

                        $log.debug('Trying to update service: ', serviceItem);

                        // Service update method of the flow service.
                        WorkflowsService.updateService(serviceItem).then(function (response) {
                            if (response && response.code === 2001) {
                                notification.flash({
                                        type: 'success',
                                        text: $translate.instant('PartnerInfo.Services.Messages.ServiceUpdateFlowStartedSuccessful')
                                    }
                                );

                                $state.transitionTo($state.current, {}, {reload: true, inherit: true, notify: true});
                            }
                        }, function (response) {
                            $log.error('Cannot call the service update flow service. Error: ', response);

                            notification({
                                type: 'warning',
                                text: $translate.instant('PartnerInfo.Services.Messages.ServiceUpdateFlowError')
                            });
                        });
                    });

                    service.rowSelected = false;
                },
                function () {
                    service.rowSelected = false;
                }
            );
        };

        $scope.showContents = function (entity) {
            entity.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.contents.html',
                controller: 'ContentsModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    modalTitleKey: function () {
                        return 'PartnerInfo.Services.ContentsModalTitle';
                    },
                    entityParameter: function () {
                        return entity;
                    },
                    contents: function ($q, $rootScope, ContentManagementService, DEFAULT_REST_QUERY_LIMIT) {
                        var deferred = $q.defer();

                        var organizationId = $rootScope.getOrganizationId();

                        var filter = {
                            orgId: $rootScope.getOrganizationId(),
                            serviceId: entity.id,
                            page: 0,
                            size: DEFAULT_REST_QUERY_LIMIT
                        };

                        ContentManagementService.getContentMetadatas(filter).then(function (contents) {
                            if (contents && contents.detail) {
                                deferred.resolve(contents);
                            } else {
                                deferred.resolve({
                                    detail: {
                                        contentList: []
                                    }
                                });
                            }
                        }, function (response) {
                            deferred.resolve({
                                detail: {
                                    contentList: []
                                }
                            });
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

        $scope.showOffers = function (entity) {
            entity.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.offers.html',
                controller: 'OffersModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    modalTitleKey: function () {
                        return 'PartnerInfo.Services.OffersModalTitle';
                    },
                    entityParameter: function () {
                        return entity;
                    },
                    offers: function ($rootScope, CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        var organizationId = $rootScope.getOrganizationId();

                        return CMPFService.getOffersByOrganizationIdByServiceName(0, DEFAULT_REST_QUERY_LIMIT, organizationId, entity.name);
                    }
                }
            });

            modalInstance.result.then(function () {
                entity.rowSelected = false;
            }, function () {
                entity.rowSelected = false;
            });
        };
    });

})();
