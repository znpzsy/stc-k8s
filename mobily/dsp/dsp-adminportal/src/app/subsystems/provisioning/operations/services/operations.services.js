(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning.operations.services', [
        'adminportal.subsystems.provisioning.operations.services.templates',
        'adminportal.subsystems.provisioning.operations.services.servicecapabilityaccess',
        'adminportal.subsystems.provisioning.operations.services.servicefees',
        'adminportal.subsystems.provisioning.operations.services.keywordchaptermapping',
        'adminportal.subsystems.provisioning.operations.services.ondemandi18n',
        'adminportal.subsystems.provisioning.operations.services.dcb',
        'adminportal.subsystems.provisioning.operations.services.dcbtemplates',
        'adminportal.subsystems.provisioning.operations.services.dcbreconciliationsettings',
        'adminportal.subsystems.provisioning.operations.services.sla',
        'adminportal.subsystems.provisioning.operations.services.servicecopyrightfile',
        'adminportal.subsystems.provisioning.operations.services.contentbasedsettlement',
        'adminportal.subsystems.provisioning.operations.services.new',
        'adminportal.subsystems.provisioning.operations.services.update'
    ]);

    var ProvisioningOperationsServicesModule = angular.module('adminportal.subsystems.provisioning.operations.services');

    ProvisioningOperationsServicesModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.provisioning.operations.services', {
            abstract: true,
            url: "/services",
            template: "<div ui-view></div>",
            data: {
                permissions: [
                    'CMPF__OPERATIONS_SERVICE_READ'
                ]
            }
        }).state('subsystems.provisioning.operations.services.list', {
            url: "",
            templateUrl: "subsystems/provisioning/operations/services/operations.services.html",
            controller: 'ProvisioningOperationsServicesCtrl',
            resolve: {
                services: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllServices(true, false);
                }
            }
        });

    });

    ProvisioningOperationsServicesModule.controller('ProvisioningOperationsServicesCommonCtrl', function ($scope, $log, $uibModal, $controller, $filter, CMPFService, SERVICE_STATUS_TYPES,
                                                                                                          SERVICE_TYPES, SERVICE_LANGUAGES, SERVICE_USAGES, SERVICE_TEMPLATES, SERVICE_HIDE_MSISDN_WITH_VALUES,
                                                                                                          SERVICE_LEGACY_PRODUCT_STATUSES, SERVICE_NOTIFICATION_PROTOCOLS, SERVICE_OUTBOUND_APIS, SERVICE_VAT_CATEGORIES,
                                                                                                          businessTypesOrganization, settlementTypesOrganization) {
        $log.debug('ProvisioningOperationsServicesCommonCtrl');

        $controller('GenericDateTimeCtrl', {$scope: $scope});

        var ORIGINAL_SERVICE_TYPES = angular.copy(SERVICE_TYPES);
        $scope.SERVICE_TYPES = angular.copy(ORIGINAL_SERVICE_TYPES);
        $scope.SERVICE_STATUS_TYPES = SERVICE_STATUS_TYPES;
        $scope.SERVICE_LANGUAGES = SERVICE_LANGUAGES;
        $scope.SERVICE_USAGES = SERVICE_USAGES;
        $scope.SERVICE_TEMPLATES = SERVICE_TEMPLATES;
        $scope.SERVICE_HIDE_MSISDN_WITH_VALUES = SERVICE_HIDE_MSISDN_WITH_VALUES;
        $scope.SERVICE_LEGACY_PRODUCT_STATUSES = SERVICE_LEGACY_PRODUCT_STATUSES;
        $scope.SERVICE_NOTIFICATION_PROTOCOLS = SERVICE_NOTIFICATION_PROTOCOLS;
        $scope.SERVICE_OUTBOUND_APIS = SERVICE_OUTBOUND_APIS;
        $scope.SERVICE_VAT_CATEGORIES = SERVICE_VAT_CATEGORIES;

        $scope.shortCodeList = [];

        var businessTypesOrganizationItem = businessTypesOrganization.organizations[0];
        var allBusinessTypes = CMPFService.getBusinessTypes(businessTypesOrganizationItem);
        $scope.businessTypes = [];

        var settlementTypesOrganizationItem = settlementTypesOrganization.organizations[0];
        var allSettlementTypes = CMPFService.getSettlementTypes(settlementTypesOrganizationItem);
        $scope.settlementTypes = [];

        var providerSettlementTypeProfiles;
        // Organization selection listener
        $scope.$watch('service.organization', function (newValue, oldValue) {
            $scope.shortCodeList = [];
            $scope.businessTypes = [];
            if (newValue && $scope.service.organization) {
                // Prepare short code list. It should be matched with the selected organization and status equals to USED.
                $scope.shortCodeList = _.filter($scope.shortCodes, function (shortCode) {
                    return ((shortCode.ProviderID === $scope.service.organization.id) && (shortCode.Status === 'USED'));
                });

                // Prepare business type list.
                var providerBusinessTypeProfiles = CMPFService.getProfileAttributes($scope.service.organization.profiles, CMPFService.SERVICE_PROVIDER_BUSINESS_TYPE_PROFILE);
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

                // Prepare settlement type list.
                providerSettlementTypeProfiles = CMPFService.getProfileAttributes($scope.service.organization.profiles, CMPFService.SERVICE_PROVIDER_SETTLEMENT_TYPE_PROFILE);
            }
        });

        // Business type selection listener
        $scope.$watch('service.serviceProfile.BusinessTypeID', function (newValue, oldValue) {
            $scope.settlementTypes = [];
            if (!newValue) {
                $scope.service.serviceProfile.SettlementTypeID = null;
            }

            if (newValue && $scope.service.organization) {
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

                    // Filter out the settlement types
                    var allSettlementTypeIds = _.pluck(foundBusinessType.SettlementTypes, "value");
                    _.each(providerSettlementTypeProfiles, function (providerSettlementTypeProfile) {
                        var foundSettlementType = _.findWhere(allSettlementTypes, {profileId: providerSettlementTypeProfile.SettlementTypeID});
                        if (allSettlementTypeIds && foundSettlementType && _.contains(allSettlementTypeIds, foundSettlementType.profileId.toString())) {
                            if (foundSettlementType.IsPartnerSpecific) {
                                if (foundSettlementType.Partners) {
                                    var partnerIds = String(foundSettlementType.Partners).split(',');
                                    if (partnerIds.indexOf(String($scope.service.organization.id)) > -1) {
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

            }
        });

        $scope.showServiceProviders = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.organizations.html',
                controller: 'OrganizationsModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    organizationParameter: function () {
                        return $scope.service.organization;
                    },
                    itemName: function () {
                        return $scope.service.name;
                    },
                    allOrganizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllOrganizations(false, true, [CMPFService.OPERATOR_PROFILE, CMPFService.SERVICE_PROVIDER_BUSINESS_TYPE_PROFILE, CMPFService.SERVICE_PROVIDER_SETTLEMENT_TYPE_PROFILE]);
                    },
                    organizationsModalTitleKey: function () {
                        return 'Subsystems.Provisioning.Services.OrganizationsModalTitle';
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.service.organization = selectedItem.organization;
                $scope.service.organizationId = selectedItem.organization.id;
            }, function () {
                //
            });
        };

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

        $scope.cancel = function () {
            $scope.go('subsystems.provisioning.operations.services.list');
        };

        // Call the templates controller so it could be mixed with this controller.
        $controller('ProvisioningOperationsServicesTemplatesCtrl', {$scope: $scope});

        // Call the service capability access controller so it could be mixed with this controller.
        $controller('ProvisioningOperationsServiceCapabilityAccessCtrl', {$scope: $scope});

        // Call the service fees controller so it could be mixed with this controller.
        $controller('ProvisioningOperationsServicesFeesCtrl', {$scope: $scope});

        // Call the service keyword chapter mapping controller so it could be mixed with this controller.
        $controller('ProvisioningOperationsKeywordChapterMappingCtrl', {$scope: $scope});

        // Call the service on-demand i18n controller so it could be mixed with this controller.
        $controller('ProvisioningOperationsOnDemandi18nCtrl', {$scope: $scope});

        // Call the service copyright file controller so it could be mixed with this controller.
        $controller('ProvisioningOperationsServiceCopyrightFileCtrl', {$scope: $scope});

        // Call the service content based settlement controller so it could be mixed with this controller.
        $controller('ProvisioningOperationsServiceContentBasedSettlementProfileCtrl', {$scope: $scope});
    });

    ProvisioningOperationsServicesModule.controller('ProvisioningOperationsServicesCtrl', function ($rootScope, $scope, $log, $q, $state, $uibModal, $filter, $translate, notification, NgTableParams,
                                                                                                    NgTableService, AuthorizationService, Restangular, CMPFService, SessionService,
                                                                                                    WorkflowsService, services, DEFAULT_REST_QUERY_LIMIT) {
        $log.debug('ProvisioningOperationsServicesCtrl');

        var sessionOrganization = SessionService.getSessionOrganization();
        var username = SessionService.getUsername();

        $scope.stateFilter = 'ALL';
        $scope.stateFilterChange = function (state) {
            if (state !== 'ALL') {
                if (state === 'WAITING') {
                    $scope.services = [];

                    CMPFService.getAllOrganizations(false, true, [CMPFService.OPERATOR_PROFILE]).then(function (organizations) {
                        var organizationList = Restangular.stripRestangular(organizations).organizations;
                        organizationList = $filter('orderBy')(organizationList, ['name']);

                        WorkflowsService.getPendingTasks(0, DEFAULT_REST_QUERY_LIMIT, 'SERVICE').then(function (waitingServiceTasks) {
                            if (waitingServiceTasks && waitingServiceTasks.length > 0) {
                                _.each(waitingServiceTasks, function (serviceTask) {
                                    if (serviceTask && serviceTask.name && (serviceTask.name.toLowerCase() === 'service create task')) {
                                        serviceTask.objectDetail.taskObjectId = serviceTask.serviceId;
                                        serviceTask.objectDetail.state = 'WAITING FOR APPROVAL';
                                        serviceTask.objectDetail.taskName = serviceTask.name;

                                        var foundOrganization = _.findWhere(organizationList, {id: Number(serviceTask.objectDetail.organizationId)});
                                        if (foundOrganization) {
                                            serviceTask.objectDetail.organization = foundOrganization;
                                        } else {
                                            serviceTask.objectDetail.organization = {
                                                name: 'N/A'
                                            };
                                        }

                                        $scope.services.push(serviceTask.objectDetail);
                                    }
                                });
                            }

                            $scope.tableParams.page(1);
                            $scope.tableParams.reload();
                        });
                    });
                } else {
                    $scope.services = _.where($scope.originalServices, {state: state});
                }
            } else {
                $scope.services = angular.copy($scope.originalServices);
            }

            $scope.tableParams.page(1);
            $scope.tableParams.reload();
        };

        // Task details modal window.
        $scope.showTaskDetails = function (service) {
            service.rowSelected = true;

            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'partials/modal/empty.modal.html',
                controller: function ($scope, $controller, $uibModalInstance, allOrganizations, taskDetail) {
                    $controller('WorkflowsOperationsTasksDetailServiceCtrl', {
                        $scope: $scope,
                        allOrganizations: allOrganizations,
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
                    allOrganizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT, UtilService) {
                        return CMPFService.getAllOrganizations(false, true, [CMPFService.OPERATOR_PROFILE]);
                    },
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

        var services = Restangular.stripRestangular(services);
        $scope.services = $filter('orderBy')(services.services, 'id');
        _.each($scope.services, function (service) {
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
        $scope.originalServices = angular.copy($scope.services);

        $scope.exportAllData = function (fileNamePrefix, exporter) {
            CMPFService.getAllServices(true, true, null, [CMPFService.SERVICE_PROFILE]).then(function (exportingServices) {
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
                    headerKey: 'Subsystems.Provisioning.Services.Id'
                },
                {
                    fieldName: 'name',
                    headerKey: 'Subsystems.Provisioning.Services.Name'
                },
                {
                    fieldName: 'serviceProfile.Description',
                    headerKey: 'Subsystems.Provisioning.Services.ServiceProfile.Description'
                },
                {
                    fieldName: 'organization.name',
                    headerKey: 'Subsystems.Provisioning.Services.Organization'
                },
                {
                    fieldName: 'state',
                    headerKey: 'Subsystems.Provisioning.Services.State'
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
        $scope.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "id": 'asc'
            }
        }, {
            $scope: $scope,
            getData: function ($defer, params) {
                var deferred = $q.defer();

                var filterTextShortCode = params.settings().$scope.filterTextShortCode;
                if (filterTextShortCode) {
                    CMPFService.getServiceByProfileDefValue(0, DEFAULT_REST_QUERY_LIMIT, true, false, 'OnDemandi18nProfile', 'OnDemandShortCode', filterTextShortCode).then(function (response1) {
                        CMPFService.getServiceByProfileDefValue(0, DEFAULT_REST_QUERY_LIMIT, true, false, 'MTChargingProfile', 'ShortCode', filterTextShortCode).then(function (response2) {
                            var services1 = $filter('orderBy')(response1.services, 'id');
                            var services2 = $filter('orderBy')(response2.services, 'id');

                            deferred.resolve(services1.concat(services2));
                        });
                    });
                } else {
                    deferred.resolve($scope.services);
                }

                deferred.promise.then(function (services) {
                    var filterText = params.settings().$scope.filterText;
                    var filterColumns = params.settings().$scope.filterColumns;
                    var filteredListData = NgTableService.filterList(filterText, filterColumns, services);
                    var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : services;
                    params.total(orderedData.length); // set total for recalc pagination
                    if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                        params.page(params.page() - 1);
                    }

                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                });
            }
        });
        // END - Service list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.tableParams.settings().$scope.filterText = filterText;
            $scope.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.tableParams.page(1);
            $scope.tableParams.reload();
        }, 500);

        $scope.filterTableByShortCode = _.debounce(function (filterTextShortCode) {
            $scope.tableParams.settings().$scope.filterTextShortCode = filterTextShortCode;
            $scope.tableParams.page(1);
            $scope.tableParams.reload();
        }, 500);

        $scope.remove = function (service) {
            service.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: function ($scope, $uibModalInstance, $translate, $controller, $sce) {
                    var message = $translate.instant('CommonLabels.ConfirmationRemoveMessage');
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
                $log.debug('Remove service:', service.name);

                CMPFService.deleteService(service).then(function (response) {
                    $log.debug('Removed service. Response: ', response);

                    if (response && response.errorCode) {
                        CMPFService.showApiError(response);
                    } else {
                        var deletedListItem = _.findWhere($scope.services, {id: service.id});
                        $scope.services = _.without($scope.services, deletedListItem);

                        $scope.tableParams.reload();

                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });
                    }
                }, function (response) {
                    $log.debug('Cannot remove services. Error: ', response);

                    if (response.data && response.data.errorDescription) {
                        var message = response.data.errorDescription;
                        if (message.indexOf('SM_SERVICE_SUBSCRIPTION') > -1) {
                            message = $translate.instant('CommonMessages.ThereAreServiceSubscriptions');
                        } else if (message.indexOf('SCM_LNK_OFFER_SERVICE') > -1) {
                            message = $translate.instant('CommonMessages.ThereAreLinkedOffers');
                        }

                        notification({
                            type: 'warning',
                            text: message
                        });
                    } else {
                        CMPFService.showApiError(response);
                    }
                });

                // TODO - delete the file content here

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
                        message = $translate.instant('Subsystems.Provisioning.Services.Messages.SuspendConfirmationMessage');
                    } else if (newState === 'ACTIVE') {
                        message = $translate.instant('Subsystems.Provisioning.Services.Messages.ActivateConfirmationMessage');
                    } else if (newState === 'INACTIVE') {
                        message = $translate.instant('Subsystems.Provisioning.Services.Messages.InactivateConfirmationMessage');
                    } else if (newState === 'HIDDEN') {
                        message = $translate.instant('Subsystems.Provisioning.Services.Messages.HideConfirmationMessage');
                    } else if (newState === 'UNHIDDEN') {
                        message = $translate.instant('Subsystems.Provisioning.Services.Messages.UnhideConfirmationMessage');
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
                        "serviceDetail": serviceResponse
                    };

                    $log.debug('Trying to update service: ', serviceItem);

                    // Service update method of the flow service.
                    WorkflowsService.updateService(serviceItem).then(function (response) {
                        if (response && response.code === 2001) {
                            notification.flash({
                                type: 'success',
                                text: $translate.instant('Subsystems.Provisioning.Services.Messages.ServiceUpdateFlowStartedSuccessful' + ($rootScope.isAdminUser ? 'ForAdmin' : ''))
                            });

                            $state.transitionTo($state.current, {}, {reload: true, inherit: true, notify: true});
                        }
                    }, function (response) {
                        $log.error('Cannot call the service update flow service. Error: ', response);

                        notification({
                            type: 'warning',
                            text: $translate.instant('Subsystems.Provisioning.Services.Messages.ServiceUpdateFlowError')
                        });
                    });
                });

                service.rowSelected = false;
            }, function () {
                service.rowSelected = false;
            });
        };

        $scope.showContents = function (entity) {
            entity.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.contents.html',
                controller: 'ContentsModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    modalTitleKey: function () {
                        return 'Subsystems.Provisioning.Services.ContentsModalTitle';
                    },
                    entityParameter: function () {
                        return entity;
                    },
                    contents: function ($q, ContentManagementService, DEFAULT_REST_QUERY_LIMIT) {
                        var deferred = $q.defer();

                        var filter = {
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
                        return 'Subsystems.Provisioning.Services.OffersModalTitle';
                    },
                    entityParameter: function () {
                        return entity;
                    },
                    offers: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getOffersByServiceName(0, DEFAULT_REST_QUERY_LIMIT, entity.name);
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

    ProvisioningOperationsServicesModule.controller('ServicesOffersModalInstanceCtrl', function ($scope, $uibModalInstance, $log, $filter, NgTableParams, NgTableService, Restangular,
                                                                                                 CMPFService, serviceParameter, offersByServiceName) {
        $log.debug('ServicesOffersModalInstanceCtrl');

        $scope.service = serviceParameter;

        $scope.offersByServiceName = Restangular.stripRestangular(offersByServiceName);
        $scope.offersByServiceName.offers = $filter('orderBy')($scope.offersByServiceName.offers, ['id']);

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
                    fieldName: 'state',
                    headerKey: 'Subsystems.SubscriptionManagement.Operations.Offers.State'
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
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.offersByServiceName.offers);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.offersByServiceName.offers;
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

        $scope.close = function () {
            $uibModalInstance.close();
        };
    });

})();
