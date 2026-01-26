(function () {

    'use strict';

    angular.module('partnerportal.partner-info.services.update', []);

    var PartnerInfoServicesUpdateServiceModule = angular.module('partnerportal.partner-info.services.update');

    PartnerInfoServicesUpdateServiceModule.config(function ($stateProvider) {

        $stateProvider.state('partner-info.services.update', {
            url: "/:id",
            templateUrl: "partner-info/services/operations.services.detail.html",
            controller: 'PartnerInfoServicesUpdateServiceCtrl',
            data: {
                cancelState: "partner-info.services.list"
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
                serviceLabelsOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_SERVICE_LABELS_ORGANIZATION_NAME);
                },
                shortCodesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_SHORT_CODES_ORGANIZATION_NAME);
                },
                service: function ($stateParams, CMPFService) {
                    return CMPFService.getService($stateParams.id);
                }
            }
        }).state('partner-info.services.resendupdatetask', {
            url: "/resend-update/:id",
            templateUrl: "partner-info/services/operations.services.detail.html",
            controller: 'PartnerInfoServicesUpdateServiceCtrl',
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
                serviceLabelsOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_SERVICE_LABELS_ORGANIZATION_NAME);
                },
                shortCodesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_SHORT_CODES_ORGANIZATION_NAME);
                },
                service: function ($stateParams, $q, WorkflowsService) {
                    var deferred = $q.defer();

                    WorkflowsService.getService($stateParams.id).then(function (serviceResponse) {
                        deferred.resolve(serviceResponse.objectDetail);
                    }, function (errorResponse) {
                        deferred.reject(errorResponse);
                    });

                    return deferred.promise;
                }
            }
        });

    });

    PartnerInfoServicesUpdateServiceModule.controller('PartnerInfoServicesUpdateServiceCtrl', function ($rootScope, $scope, $log, $controller, $q, $filter, $uibModal, notification, $translate, Restangular, UtilService,
                                                                                                        CMPFService, SessionService, FileDownloadService, ContentManagementService, WorkflowsService, DateTimeConstants,
                                                                                                        businessTypesOrganization, settlementTypesOrganization, serviceCategoriesOrganization, serviceLabelsOrganization,
                                                                                                        shortCodesOrganization, service) {
        $log.debug('PartnerInfoServicesUpdateServiceCtrl');

        $controller('PartnerInfoServicesCommonCtrl', {
            $scope: $scope,
            businessTypesOrganization: businessTypesOrganization,
            settlementTypesOrganization: settlementTypesOrganization
        });

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

        $scope.serviceLabelsOrganization = serviceLabelsOrganization.organizations[0];
        $scope.serviceLabels = CMPFService.getServiceLabels($scope.serviceLabelsOrganization);
        $scope.serviceLabels = $filter('orderBy')($scope.serviceLabels, 'Name');

        $scope.shortCodesOrganization = shortCodesOrganization.organizations[0];
        $scope.shortCodes = CMPFService.getShortCodes($scope.shortCodesOrganization);
        $scope.shortCodes = $filter('orderBy')($scope.shortCodes, 'ShortCode');

        // Prepare short code list. It should be matched with the selected organization and status equals to USED.
        $scope.shortCodeList = _.filter($scope.shortCodes, function (shortCode) {
            return ((shortCode.ProviderID === $scope.sessionOrganization.id) && (shortCode.Status === 'USED'));
        });

        $scope.service = Restangular.stripRestangular(service);

        $scope.service.serviceProfile = {};

        // Servicei18nProfile
        var servicei18nProfiles = CMPFService.getProfileAttributes($scope.service.profiles, CMPFService.SERVICE_I18N_PROFILE);
        $scope.service.servicei18nProfiles = [];
        if (servicei18nProfiles.length > 0) {
            var servicei18nProfilesEn = _.findWhere(servicei18nProfiles, {Language: 'EN'});
            if (servicei18nProfilesEn) {
                $scope.service.servicei18nProfiles.push(servicei18nProfilesEn);
            } else {
                $scope.service.servicei18nProfiles.push({
                    Language: 'EN',
                    Name: '',
                    Description: '',
                    IsDefault: false,
                    SearchKeyword: ''
                });
            }

            var servicei18nProfilesAr = _.findWhere(servicei18nProfiles, {Language: 'AR'});
            if (servicei18nProfilesAr) {
                $scope.service.servicei18nProfiles.push(servicei18nProfilesAr);
            } else {
                $scope.service.servicei18nProfiles.push({
                    Language: 'AR',
                    Name: '',
                    Description: '',
                    IsDefault: false,
                    SearchKeyword: ''
                });
            }
        }

        // ServiceProfile
        $scope.dateHolder.startDate = null;
        $scope.dateHolder.endDate = null;
        var serviceProfiles = CMPFService.getProfileAttributes($scope.service.profiles, CMPFService.SERVICE_PROFILE);
        if (serviceProfiles.length > 0) {
            $scope.service.serviceProfile = angular.copy(serviceProfiles[0]);

            if ($scope.service.serviceProfile.StartDate) {
                $scope.dateHolder.startDate = new Date(moment($scope.service.serviceProfile.StartDate).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss'));
            }

            if ($scope.service.serviceProfile.EndDate) {
                $scope.dateHolder.endDate = new Date(moment($scope.service.serviceProfile.EndDate).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss'));
            }

            $scope.service.serviceProfile.BusinessTypeID = Number($scope.service.serviceProfile.BusinessTypeID);
            $scope.service.serviceProfile.SettlementTypeID = Number($scope.service.serviceProfile.SettlementTypeID);

            // Get the WEBIcon by id value.
            $scope.service.serviceProfile.webIconFile = {name: undefined};
            if ($scope.service.serviceProfile.WEBIconID) {
                var srcUrl = ContentManagementService.generateFilePath($scope.service.serviceProfile.WEBIconID);
                FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                    $scope.service.serviceProfile.webIconFile = blob;
                    if (blob) {
                        $scope.service.serviceProfile.webIconFile.name = fileName;
                    }
                    $scope.originalService = angular.copy($scope.service);
                });
            }

            // Get the WAPIcon by id value.
            $scope.service.serviceProfile.wapIconFile = {name: undefined};
            if ($scope.service.serviceProfile.WAPIconID) {
                var srcUrl = ContentManagementService.generateFilePath($scope.service.serviceProfile.WAPIconID);
                FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                    $scope.service.serviceProfile.wapIconFile = blob;
                    if (blob) {
                        $scope.service.serviceProfile.wapIconFile.name = fileName;
                    }
                    $scope.originalService = angular.copy($scope.service);
                });
            }
        } else {
            $scope.service.serviceProfile = {
                CategoryID: null,
                IsHidingMSISDN: false,
                WEBIconID: null,
                WAPIconID: null
            }
        }

        // ServiceCapabilityAccessProfile
        var serviceCapabilityAccessProfiles = CMPFService.getProfileAttributes($scope.service.profiles, CMPFService.SERVICE_CAPABILITY_ACCESS_PROFILE);
        $scope.service.serviceCapabilityAccessProfileList = [];
        if (serviceCapabilityAccessProfiles.length > 0) {
            _.each(serviceCapabilityAccessProfiles, function (serviceCapabilityAccessProfile) {
                var serviceCapabilityAccessProfileItem = _.extend({id: _.uniqueId()}, serviceCapabilityAccessProfile);

                $scope.service.serviceCapabilityAccessProfileList.push(serviceCapabilityAccessProfileItem);
            });

            $scope.service.serviceCapabilityAccessProfileList = $filter('orderBy')($scope.service.serviceCapabilityAccessProfileList, ['CapabilityName']);
        }

        // MOChargingProfile
        var moChargingProfiles = CMPFService.getProfileAttributes($scope.service.profiles, CMPFService.SERVICE_MO_CHARGING_PROFILE);
        if (moChargingProfiles.length > 0) {
            $scope.service.moChargingProfile = angular.copy(moChargingProfiles[0]);
        }

        // MTChargingProfile
        var mtChargingProfiles = CMPFService.getProfileAttributes($scope.service.profiles, CMPFService.SERVICE_MT_CHARGING_PROFILE);
        $scope.service.mtServiceFeeList = [];
        if (mtChargingProfiles.length > 0) {
            _.each(mtChargingProfiles, function (mtChargingProfile) {
                var mtChargingProfileItem = _.extend({
                    id: _.uniqueId(),
                    profileId: mtChargingProfile.profileId
                }, mtChargingProfile);

                $scope.service.mtServiceFeeList.push(mtChargingProfileItem);
            });

            $scope.service.mtServiceFeeList = $filter('orderBy')($scope.service.mtServiceFeeList, ['ShortCode']);
        }

        if ($scope.service.serviceProfile && $scope.service.serviceProfile.Type && $scope.service.serviceProfile.Type.startsWith('STANDARD_')) {
            if ($scope.service.serviceProfile.Template === 'ALERTS' || $scope.service.serviceProfile.Template === 'SEQUENTIAL') {
                // AlertTemplateProfile
                var alertTemplateProfiles = CMPFService.getProfileAttributes($scope.service.profiles, CMPFService.SERVICE_ALERT_TEMPLATE_PROFILE);
                if (alertTemplateProfiles.length > 0) {
                    $scope.service.templateAttributes = angular.copy(alertTemplateProfiles[0]);

                    if ($scope.service.templateAttributes.TimesOfDay) {
                        $scope.service.templateAttributes.TimesOfDay = $scope.service.templateAttributes.TimesOfDay.split(';');
                    } else {
                        $scope.service.templateAttributes.TimesOfDay = [];
                    }
                    if ($scope.service.templateAttributes.DaysOfWeek) {
                        $scope.service.templateAttributes.DaysOfWeek = $scope.service.templateAttributes.DaysOfWeek.split(';');
                    } else {
                        $scope.service.templateAttributes.DaysOfWeek = [];
                    }
                    if ($scope.service.templateAttributes.DaysOfMonth) {
                        $scope.service.templateAttributes.DaysOfMonth = $scope.service.templateAttributes.DaysOfMonth.toString();
                        $scope.service.templateAttributes.DaysOfMonth = $scope.service.templateAttributes.DaysOfMonth.split(';');
                    } else {
                        $scope.service.templateAttributes.DaysOfMonth = [];
                    }
                }
            } else if ($scope.service.serviceProfile.Template === 'ON_DEMAND') {
                // OnDemandTemplateProfile
                var onDemandTemplateProfiles = CMPFService.getProfileAttributes($scope.service.profiles, CMPFService.SERVICE_ON_DEMAND_TEMPLATE_PROFILE);
                if (onDemandTemplateProfiles.length > 0) {
                    $scope.service.templateAttributes = angular.copy(onDemandTemplateProfiles[0]);
                }
            } else if ($scope.service.serviceProfile.Template === 'OTHER') {
                // OtherTemplateProfile
                var otherTemplateProfiles = CMPFService.getProfileAttributes($scope.service.profiles, CMPFService.SERVICE_OTHER_TEMPLATE_PROFILE);
                if (otherTemplateProfiles.length > 0) {
                    $scope.service.templateAttributes = angular.copy(otherTemplateProfiles[0]);
                }
            }

            // Get the ServiceProposalFile by id value.
            if ($scope.service.templateAttributes && ($scope.service.serviceProfile.Template === 'ON_DEMAND' || $scope.service.serviceProfile.Template === 'OTHER')) {
                $scope.service.templateAttributes.serviceProposalFile = {name: undefined};
                if ($scope.service.templateAttributes && $scope.service.templateAttributes.ServiceProposalFileID) {
                    var srcUrl = ContentManagementService.generateFilePath($scope.service.templateAttributes.ServiceProposalFileID);
                    FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                        $scope.service.templateAttributes.serviceProposalFile = blob;
                        if (blob) {
                            $scope.service.templateAttributes.serviceProposalFile.name = fileName;
                        }
                        $scope.originalService = angular.copy($scope.service);
                    });
                }
            }
        }

        // ProductProfile
        var productProfiles = CMPFService.getProfileAttributes($scope.service.profiles, CMPFService.SERVICE_PRODUCT_PROFILE);
        if (productProfiles.length > 0) {
            $scope.service.productProfile = angular.copy(productProfiles[0]);
        }

        // SenderIdProfile
        var senderIdProfiles = CMPFService.getProfileAttributes($scope.service.profiles, CMPFService.SERVICE_SENDER_ID_PROFILE);
        if (senderIdProfiles.length > 0) {
            $scope.service.senderIdProfile = angular.copy(senderIdProfiles[0]);
        }

        // DCBServiceProfile
        var dcbServiceProfiles = CMPFService.getProfileAttributes($scope.service.profiles, CMPFService.SERVICE_DCB_SERVICE_PROFILE);
        if (dcbServiceProfiles.length > 0) {
            $scope.service.dcbServiceProfile = angular.copy(dcbServiceProfiles[0]);
        } else {
            $scope.service.dcbServiceProfile = {
                SenderID: '',
                AggregatorName: '',
                OTTName: '',
                CarrierId: '',
                SilentSMSShortCode: '',
                Currency: 'SAR',
                TrustStatus: 'UNTRUSTED',
                IsCapped: false,
                AssociationAPIURL: '',
                DeassociationAPIURL: '',
                ClientAPIUsername: '',
                ClientAPIPassword: '',
                BlockDCBEnabled: false
            };
        }

        // DCBServiceActivationProfile
        var dcbServiceActivationProfiles = CMPFService.getProfileAttributes($scope.service.profiles, CMPFService.SERVICE_DCB_SERVICE_ACTIVATION_PROFILE);
        if (dcbServiceActivationProfiles.length > 0) {
            $scope.service.dcbServiceActivationProfile = angular.copy(dcbServiceActivationProfiles[0]);
        } else {
            // DCBServiceActivationProfile
            $scope.service.dcbServiceActivationProfile = {
                UseHeaderEnrichment: false,
                UseSilentSMS: false,
                UseOTTOTP: false,
                UseOperatorOTP: false,
                SubscriberIDatOperator: 'SAN',
                SubscriberIDatOTT: ''
            };
        }

        // SenderIdProfile
        var senderIdProfiles = CMPFService.getProfileAttributes($scope.service.profiles, CMPFService.SERVICE_SENDER_ID_PROFILE);
        if (senderIdProfiles.length > 0) {
            $scope.service.senderIdProfile = angular.copy(senderIdProfiles[0]);
        }

        // KeywordChapterMappingProfile
        var keywordChapterMappingProfiles = CMPFService.getProfileAttributes($scope.service.profiles, CMPFService.SERVICE_KEYWORD_CHAPTER_MAPPING_PROFILE);
        $scope.service.keywordChapterMappingList = [];
        if (keywordChapterMappingProfiles.length > 0) {
            _.each(keywordChapterMappingProfiles, function (keywordChapterMappingProfile) {
                var keywordChapterMappingProfileItem = _.extend({
                    id: _.uniqueId(),
                    profileId: keywordChapterMappingProfile.profileId
                }, keywordChapterMappingProfile);

                $scope.service.keywordChapterMappingList.push(keywordChapterMappingProfileItem);
            });

            $scope.service.keywordChapterMappingList = $filter('orderBy')($scope.service.keywordChapterMappingList, ['ChapterKeyword']);
        }

        // OnDemandi18nProfile
        var onDemandi18nProfiles = CMPFService.getProfileAttributes($scope.service.profiles, CMPFService.SERVICE_ON_DEMAND_I18N_PROFILE);
        $scope.service.onDemandi18nList = [];
        if (onDemandi18nProfiles.length > 0) {
            _.each(onDemandi18nProfiles, function (onDemandi18nProfile) {
                var onDemandi18nProfileItem = _.extend({
                    id: _.uniqueId(),
                    profileId: onDemandi18nProfile.profileId
                }, onDemandi18nProfile);

                $scope.service.onDemandi18nList.push(onDemandi18nProfileItem);
            });

            $scope.service.onDemandi18nList = $filter('orderBy')($scope.service.onDemandi18nList, ['Language']);
        }

        // SubscriptionNotificationProfile
        var subscriptionNotificationProfiles = CMPFService.getProfileAttributes($scope.service.profiles, CMPFService.SERVICE_SUBSCRIPTION_NOTIFICATION_PROFILE);
        if (subscriptionNotificationProfiles.length > 0) {
            $scope.service.subscriptionNotificationProfile = angular.copy(subscriptionNotificationProfiles[0]);
        }

        // ServiceCopyrightFileProfile
        var serviceCopyrightFileProfiles = CMPFService.getProfileAttributes($scope.service.profiles, CMPFService.SERVICE_COPYRIGHT_FILE_PROFILE);
        $scope.service.serviceCopyrightFileProfileList = [];
        if (serviceCopyrightFileProfiles.length > 0) {
            _.each(serviceCopyrightFileProfiles, function (serviceCopyrightFileProfile) {
                var serviceCopyrightFileProfileItem = angular.copy(serviceCopyrightFileProfile);
                if (serviceCopyrightFileProfileItem.ValidFrom) {
                    serviceCopyrightFileProfileItem.ValidFrom = new Date(moment(serviceCopyrightFileProfileItem.ValidFrom).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss'));
                }
                if (serviceCopyrightFileProfileItem.ValidTo) {
                    serviceCopyrightFileProfileItem.ValidTo = new Date(moment(serviceCopyrightFileProfileItem.ValidTo).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss'));
                }

                // Get the CopyrightFile by id value.
                serviceCopyrightFileProfileItem.copyrightFile = {name: undefined};
                if (serviceCopyrightFileProfileItem.CopyrightFileID) {
                    var srcUrl = ContentManagementService.generateFilePath(serviceCopyrightFileProfileItem.CopyrightFileID);
                    FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                        serviceCopyrightFileProfileItem.copyrightFile = blob;
                        if (blob) {
                            serviceCopyrightFileProfileItem.copyrightFile.name = fileName;
                        }

                        $scope.originalService = angular.copy($scope.service);

                        $scope.service.serviceCopyrightFileProfileList = $filter('orderBy')($scope.service.serviceCopyrightFileProfileList, ['copyrightFile.name']);
                    });
                }

                $scope.service.serviceCopyrightFileProfileList.push(serviceCopyrightFileProfileItem);
            });
        }

        // ServiceVATProfile
        var serviceVATProfiles = CMPFService.getProfileAttributes($scope.service.profiles, CMPFService.SERVICE_VAT_PROFILE);
        if (serviceVATProfiles.length > 0) {
            $scope.service.serviceVATProfile = angular.copy(serviceVATProfiles[0]);
        }

        // ServiceContentBasedSettlementProfile
        var serviceContentBasedSettlementProfiles = CMPFService.getProfileAttributes($scope.service.profiles, CMPFService.SERVICE_CONTENT_BASED_SETTLEMENT_PROFILE);
        $scope.service.contentBasedSettlementList = [];
        if (serviceContentBasedSettlementProfiles.length > 0) {
            _.each(serviceContentBasedSettlementProfiles, function (serviceContentBasedSettlementProfile) {
                var serviceContentBasedSettlementProfileItem = _.extend({
                    id: _.uniqueId(),
                    profileId: serviceContentBasedSettlementProfile.profileId
                }, serviceContentBasedSettlementProfile);

                $scope.service.contentBasedSettlementList.push(serviceContentBasedSettlementProfileItem);
            });

            $scope.service.contentBasedSettlementList = $filter('orderBy')($scope.service.contentBasedSettlementList, ['ContentTypeName']);
        }

        $scope.initializeBusinessTypeList();

        // EntityAuditProfile
        var entityAuditProfiles = CMPFService.getProfileAttributes($scope.service.profiles, CMPFService.ENTITY_AUDIT_PROFILE);
        if (entityAuditProfiles.length > 0) {
            $scope.service.entityAuditProfile = angular.copy(entityAuditProfiles[0]);
        }

        $scope.originalService = angular.copy($scope.service);
        $scope.originalDateHolder = angular.copy($scope.dateHolder);
        $scope.isNotChanged = function () {
            return angular.equals($scope.service, $scope.originalService) &&
                angular.equals($scope.dateHolder, $scope.originalDateHolder);
        };

        $scope.save = function (service) {
            var serviceItem = {
                id: $scope.originalService.id,
                name: $scope.originalService.name,
                organizationId: $scope.originalService.organizationId,
                state: $scope.originalService.state,
                // Changed fields
                profiles: ($scope.originalService.profiles === undefined ? [] : $scope.originalService.profiles)
            };

            // ServiceProfile
            var webIconFile, wapIconFile;
            if (service.serviceProfile) {
                // WEBIconID
                webIconFile = service.serviceProfile.webIconFile;
                if (!webIconFile || (webIconFile && !webIconFile.name)) {
                    service.serviceProfile.WEBIconID = '';
                } else if (webIconFile instanceof File && !service.serviceProfile.WEBIconID) {
                    service.serviceProfile.WEBIconID = UtilService.generateObjectId();
                }
                // WAPIconID
                wapIconFile = service.serviceProfile.wapIconFile;
                if (!wapIconFile || (wapIconFile && !wapIconFile.name)) {
                    service.serviceProfile.WAPIconID = '';
                } else if (wapIconFile instanceof File && !service.serviceProfile.WAPIconID) {
                    service.serviceProfile.WAPIconID = UtilService.generateObjectId();
                }

                var originalServiceProfile = CMPFService.findProfileByName(serviceItem.profiles, CMPFService.SERVICE_PROFILE);
                var updatedServiceProfile = JSON.parse(angular.toJson(service.serviceProfile));

                // Update the last update time for create first time or for update everytime.
                updatedServiceProfile.LastUpdateTime = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');
                if ($scope.dateHolder.startDate) {
                    updatedServiceProfile.StartDate = $filter('date')($scope.dateHolder.startDate, 'yyyy-MM-dd') + 'T00:00:00';
                } else {
                    updatedServiceProfile.StartDate = '';
                }
                updatedServiceProfile.EndDate = $filter('date')($scope.dateHolder.endDate, 'yyyy-MM-dd') + 'T00:00:00';
                // Update service profile template as empty for non-standard service types
                if (service.serviceProfile.Type && !service.serviceProfile.Type.startsWith('STANDARD_')) {
                    updatedServiceProfile.Template = '';
                }
                delete updatedServiceProfile.webIconFile;
                delete updatedServiceProfile.wapIconFile;

                var serviceProfileArray = CMPFService.prepareProfile(updatedServiceProfile, originalServiceProfile);
                // ---
                if (originalServiceProfile) {
                    originalServiceProfile.attributes = serviceProfileArray;
                } else {
                    var serviceProfile = {
                        name: CMPFService.SERVICE_PROFILE,
                        profileDefinitionName: CMPFService.SERVICE_PROFILE,
                        attributes: serviceProfileArray
                    };

                    serviceItem.profiles.push(serviceProfile);
                }
            }

            var serviceProposalFile;
            if (service.serviceProfile.Type.startsWith('STANDARD_')) {
                if (service.serviceProfile.Template === 'ALERTS' || service.serviceProfile.Template === 'SEQUENTIAL') {
                    // AlertTemplateProfile
                    if (service.templateAttributes) {
                        var originalAlertTemplateProfile = CMPFService.findProfileByName(serviceItem.profiles, CMPFService.SERVICE_ALERT_TEMPLATE_PROFILE);
                        var updatedAlertTemplateProfile = JSON.parse(angular.toJson(service.templateAttributes));

                        if (updatedAlertTemplateProfile.TimesOfDay) {
                            updatedAlertTemplateProfile.TimesOfDay = updatedAlertTemplateProfile.TimesOfDay.join(';');
                        } else {
                            updatedAlertTemplateProfile.TimesOfDay = '';
                        }

                        if (updatedAlertTemplateProfile.CyclePeriod === 'WEEK' && updatedAlertTemplateProfile.DaysOfWeek) {
                            updatedAlertTemplateProfile.DaysOfWeek = updatedAlertTemplateProfile.DaysOfWeek.join(';');
                        } else {
                            updatedAlertTemplateProfile.DaysOfWeek = '';
                        }
                        if (updatedAlertTemplateProfile.CyclePeriod === 'MONTH' && updatedAlertTemplateProfile.DaysOfMonth) {
                            updatedAlertTemplateProfile.DaysOfMonth = updatedAlertTemplateProfile.DaysOfMonth.join(';');
                        } else {
                            updatedAlertTemplateProfile.DaysOfMonth = '';
                        }

                        var alertTemplateProfileArray = CMPFService.prepareProfile(updatedAlertTemplateProfile, originalAlertTemplateProfile);
                        // ---
                        if (originalAlertTemplateProfile) {
                            originalAlertTemplateProfile.attributes = alertTemplateProfileArray;
                        } else {
                            var alertTemplateProfile = {
                                name: CMPFService.SERVICE_ALERT_TEMPLATE_PROFILE,
                                profileDefinitionName: CMPFService.SERVICE_ALERT_TEMPLATE_PROFILE,
                                attributes: alertTemplateProfileArray
                            };

                            serviceItem.profiles.push(alertTemplateProfile);
                        }
                    }
                } else if (service.serviceProfile.Template === 'ON_DEMAND') {
                    // ServiceProposalFileID
                    serviceProposalFile = service.templateAttributes.serviceProposalFile;
                    if (!serviceProposalFile || (serviceProposalFile && !serviceProposalFile.name)) {
                        service.templateAttributes.ServiceProposalFileID = '';
                    } else if (serviceProposalFile instanceof File && !service.templateAttributes.ServiceProposalFileID) {
                        service.templateAttributes.ServiceProposalFileID = UtilService.generateObjectId();
                    }

                    // OnDemandTemplateProfile
                    if (service.templateAttributes) {
                        var originalOnDemandTemplateProfile = CMPFService.findProfileByName(serviceItem.profiles, CMPFService.SERVICE_ON_DEMAND_TEMPLATE_PROFILE);
                        var updatedOnDemandTemplateProfile = JSON.parse(angular.toJson(service.templateAttributes));
                        delete updatedOnDemandTemplateProfile.serviceProposalFile;
                        var onDemandTemplateProfileArray = CMPFService.prepareProfile(updatedOnDemandTemplateProfile, originalOnDemandTemplateProfile);
                        // ---
                        if (originalOnDemandTemplateProfile) {
                            originalOnDemandTemplateProfile.attributes = onDemandTemplateProfileArray;
                        } else {
                            var onDemandTemplateProfile = {
                                name: CMPFService.SERVICE_ON_DEMAND_TEMPLATE_PROFILE,
                                profileDefinitionName: CMPFService.SERVICE_ON_DEMAND_TEMPLATE_PROFILE,
                                attributes: onDemandTemplateProfileArray
                            };

                            serviceItem.profiles.push(onDemandTemplateProfile);
                        }
                    }
                } else if (service.serviceProfile.Template === 'OTHER') {
                    // ServiceProposalFileID
                    serviceProposalFile = service.templateAttributes.serviceProposalFile;
                    if (!serviceProposalFile || (serviceProposalFile && !serviceProposalFile.name)) {
                        service.templateAttributes.ServiceProposalFileID = '';
                    } else if (serviceProposalFile instanceof File && !service.templateAttributes.ServiceProposalFileID) {
                        service.templateAttributes.ServiceProposalFileID = UtilService.generateObjectId();
                    }

                    // OtherTemplateProfile
                    if (service.templateAttributes) {
                        var originalOtherTemplateProfile = CMPFService.findProfileByName(serviceItem.profiles, CMPFService.SERVICE_OTHER_TEMPLATE_PROFILE);
                        var updatedOtherTemplateProfile = JSON.parse(angular.toJson(service.templateAttributes));
                        delete updatedOtherTemplateProfile.serviceProposalFile;
                        var otherTemplateProfileArray = CMPFService.prepareProfile(updatedOtherTemplateProfile, originalOtherTemplateProfile);
                        // ---
                        if (originalOtherTemplateProfile) {
                            originalOtherTemplateProfile.attributes = otherTemplateProfileArray;
                        } else {
                            var otherTemplateProfile = {
                                name: CMPFService.SERVICE_OTHER_TEMPLATE_PROFILE,
                                profileDefinitionName: CMPFService.SERVICE_OTHER_TEMPLATE_PROFILE,
                                attributes: otherTemplateProfileArray
                            };

                            serviceItem.profiles.push(otherTemplateProfile);
                        }
                    }
                }
            }

            // Servicei18nProfile
            if (service.servicei18nProfiles && service.servicei18nProfiles.length > 0) {
                var originalServicei18nProfiles = CMPFService.findProfilesByName(serviceItem.profiles, CMPFService.SERVICE_I18N_PROFILE);
                _.each(service.servicei18nProfiles, function (updatedServicei18nProfile) {
                    updatedServicei18nProfile = JSON.parse(angular.toJson(updatedServicei18nProfile));
                    var originalServicei18nProfile = _.findWhere(originalServicei18nProfiles, {id: updatedServicei18nProfile.profileId});
                    var servicei18nProfileAttrArray = CMPFService.prepareProfile(updatedServicei18nProfile, originalServicei18nProfile);
                    // ---
                    if (originalServicei18nProfile) {
                        originalServicei18nProfile.attributes = servicei18nProfileAttrArray;
                    } else {
                        var servicei18nProfile = {
                            name: CMPFService.SERVICE_I18N_PROFILE,
                            profileDefinitionName: CMPFService.SERVICE_I18N_PROFILE,
                            attributes: servicei18nProfileAttrArray
                        };

                        serviceItem.profiles.push(servicei18nProfile);
                    }
                });
            }

            // ServiceCapabilityAccessProfile
            if (service.serviceCapabilityAccessProfileList && service.serviceCapabilityAccessProfileList.length > 0 &&
                service.serviceProfile.Type && !service.serviceProfile.Type.startsWith('STANDARD_')) {
                // Filter out the removed items from the list.
                serviceItem.profiles = _.filter(serviceItem.profiles, function (originalServiceCapabilityAccessProfile) {
                    if (originalServiceCapabilityAccessProfile.name === CMPFService.SERVICE_CAPABILITY_ACCESS_PROFILE) {
                        return _.findWhere(service.serviceCapabilityAccessProfileList, {profileId: originalServiceCapabilityAccessProfile.id});
                    } else {
                        return true;
                    }
                });

                var originalServiceCapabilityAccessProfiles = CMPFService.findProfilesByName(serviceItem.profiles, CMPFService.SERVICE_CAPABILITY_ACCESS_PROFILE);

                _.each(service.serviceCapabilityAccessProfileList, function (updatedServiceCapabilityAccessProfile) {
                    updatedServiceCapabilityAccessProfile = JSON.parse(angular.toJson(updatedServiceCapabilityAccessProfile));
                    // Modify some attributes here.
                    delete updatedServiceCapabilityAccessProfile.id;

                    var originalServiceCapabilityAccessProfile = _.findWhere(originalServiceCapabilityAccessProfiles, {id: updatedServiceCapabilityAccessProfile.profileId});
                    var serviceCapabilityAccessProfileAttrArray = CMPFService.prepareProfile(updatedServiceCapabilityAccessProfile, originalServiceCapabilityAccessProfile);
                    // ---
                    if (originalServiceCapabilityAccessProfile) {
                        originalServiceCapabilityAccessProfile.attributes = serviceCapabilityAccessProfileAttrArray;
                    } else {
                        var serviceCapabilityAccessProfile = {
                            name: CMPFService.SERVICE_CAPABILITY_ACCESS_PROFILE,
                            profileDefinitionName: CMPFService.SERVICE_CAPABILITY_ACCESS_PROFILE,
                            attributes: serviceCapabilityAccessProfileAttrArray
                        };

                        serviceItem.profiles.push(serviceCapabilityAccessProfile);
                    }
                });
            } else {
                // Remove ServiceCapabilityAccessProfile instances
                serviceItem.profiles = _.filter(serviceItem.profiles, function (profile) {
                    return profile.profileDefinitionName !== CMPFService.SERVICE_CAPABILITY_ACCESS_PROFILE;
                });
            }

            // MOChargingProfile
            if (service.moChargingProfile &&
                ((service.serviceProfile.Type.startsWith('STANDARD_') && service.serviceProfile.Template === 'ON_DEMAND') ||
                    ((service.serviceProfile.Type.startsWith('DCB_') || service.serviceProfile.Type.startsWith('CUSTOMIZED_')) && service.serviceProfile.Usage === 'ON_DEMAND'))) {
                var originalMOChargingProfile = CMPFService.findProfileByName(serviceItem.profiles, CMPFService.SERVICE_MO_CHARGING_PROFILE);
                var updatedMOChargingProfile = JSON.parse(angular.toJson(service.moChargingProfile));
                var moChargingProfileArray = CMPFService.prepareProfile(updatedMOChargingProfile, originalMOChargingProfile);
                // ---
                if (originalMOChargingProfile) {
                    originalMOChargingProfile.attributes = moChargingProfileArray;
                } else {
                    var moChargingProfile = {
                        name: CMPFService.SERVICE_MO_CHARGING_PROFILE,
                        profileDefinitionName: CMPFService.SERVICE_MO_CHARGING_PROFILE,
                        attributes: moChargingProfileArray
                    };

                    serviceItem.profiles.push(moChargingProfile);
                }
            } else {
                // Remove MOChargingProfile instances
                serviceItem.profiles = _.filter(serviceItem.profiles, function (profile) {
                    return profile.profileDefinitionName !== CMPFService.SERVICE_MO_CHARGING_PROFILE;
                });
            }

            // MTChargingProfile
            if (service.mtServiceFeeList && service.mtServiceFeeList.length > 0 &&
                ((service.serviceProfile.Type.startsWith('STANDARD_') && service.serviceProfile.Template === 'ON_DEMAND') ||
                    ((service.serviceProfile.Type.startsWith('DCB_') || service.serviceProfile.Type.startsWith('CUSTOMIZED_')) && service.serviceProfile.Usage === 'ON_DEMAND'))) {
                // Filter out the removed items from the list.
                serviceItem.profiles = _.filter(serviceItem.profiles, function (originalMTChargingProfile) {
                    if (originalMTChargingProfile.name === CMPFService.SERVICE_MT_CHARGING_PROFILE) {
                        return _.findWhere(service.mtServiceFeeList, {profileId: originalMTChargingProfile.id});
                    } else {
                        return true;
                    }
                });

                var originalMTChargingProfiles = CMPFService.findProfilesByName(serviceItem.profiles, CMPFService.SERVICE_MT_CHARGING_PROFILE);

                _.each(service.mtServiceFeeList, function (updatedMTChargingProfile) {
                    updatedMTChargingProfile = JSON.parse(angular.toJson(updatedMTChargingProfile));
                    // Modify some attributes here.
                    delete updatedMTChargingProfile.id;

                    var originalMTChargingProfile = _.findWhere(originalMTChargingProfiles, {id: updatedMTChargingProfile.profileId});
                    var mtChargingProfileAttrArray = CMPFService.prepareProfile(updatedMTChargingProfile, originalMTChargingProfile);
                    // ---
                    if (originalMTChargingProfile) {
                        originalMTChargingProfile.attributes = mtChargingProfileAttrArray;
                    } else {
                        var mtChargingProfile = {
                            name: CMPFService.SERVICE_MT_CHARGING_PROFILE,
                            profileDefinitionName: CMPFService.SERVICE_MT_CHARGING_PROFILE,
                            attributes: mtChargingProfileAttrArray
                        };

                        serviceItem.profiles.push(mtChargingProfile);
                    }
                });
            } else {
                // Remove MTChargingProfile instances
                serviceItem.profiles = _.filter(serviceItem.profiles, function (profile) {
                    return profile.profileDefinitionName !== CMPFService.SERVICE_MT_CHARGING_PROFILE;
                });
            }

            // ProductProfile
            if (service.productProfile &&
                ((service.serviceProfile.Type.startsWith('STANDARD_') && service.serviceProfile.Template === 'ON_DEMAND') ||
                    ((service.serviceProfile.Type.startsWith('DCB_') || service.serviceProfile.Type.startsWith('CUSTOMIZED_')) && service.serviceProfile.Usage === 'ON_DEMAND'))) {
                var originalProductProfile = CMPFService.findProfileByName(serviceItem.profiles, CMPFService.SERVICE_PRODUCT_PROFILE);
                var updatedProductProfile = JSON.parse(angular.toJson(service.productProfile));

                if (updatedProductProfile.Code === 'DSP') {
                    updatedProductProfile.Code = 'DSP' + service.id;
                    updatedProductProfile.NameLangEN = service.servicei18nProfiles[0].Name;
                    updatedProductProfile.DescriptionLangEN = service.servicei18nProfiles[0].Description;
                    updatedProductProfile.NameLangOther = service.servicei18nProfiles[1].Name;
                    updatedProductProfile.DescriptionLangOther = service.servicei18nProfiles[1].Description;
                    updatedProductProfile.LegacyProductStatus = "COMMERCIAL";
                }

                var productProfileArray = CMPFService.prepareProfile(updatedProductProfile, originalProductProfile);
                // ---
                if (originalProductProfile) {
                    originalProductProfile.attributes = productProfileArray;
                } else {
                    var productProfile = {
                        name: CMPFService.SERVICE_PRODUCT_PROFILE,
                        profileDefinitionName: CMPFService.SERVICE_PRODUCT_PROFILE,
                        attributes: productProfileArray
                    };

                    serviceItem.profiles.push(productProfile);
                }
            } else {
                // Remove ProductProfile instances
                serviceItem.profiles = _.filter(serviceItem.profiles, function (profile) {
                    return profile.profileDefinitionName !== CMPFService.SERVICE_PRODUCT_PROFILE;
                });
            }

            // SenderIdProfile
            if (service.senderIdProfile) {
                var originalSenderIdProfile = CMPFService.findProfileByName(serviceItem.profiles, CMPFService.SERVICE_SENDER_ID_PROFILE);
                var updatedSenderIdProfile = JSON.parse(angular.toJson(service.senderIdProfile));
                var senderIdProfileArray = CMPFService.prepareProfile(updatedSenderIdProfile, originalSenderIdProfile);
                // ---
                if (originalSenderIdProfile) {
                    originalSenderIdProfile.attributes = senderIdProfileArray;
                } else {
                    var senderIdProfile = {
                        name: CMPFService.SERVICE_SENDER_ID_PROFILE,
                        profileDefinitionName: CMPFService.SERVICE_SENDER_ID_PROFILE,
                        attributes: senderIdProfileArray
                    };

                    serviceItem.profiles.push(senderIdProfile);
                }
            } else {
                // Remove SenderIdProfile instances
                serviceItem.profiles = _.filter(serviceItem.profiles, function (profile) {
                    return profile.profileDefinitionName !== CMPFService.SERVICE_SENDER_ID_PROFILE;
                });
            }

            // KeywordChapterMappingProfile
            if (service.keywordChapterMappingList && service.keywordChapterMappingList.length > 0 &&
                (service.serviceProfile.Type.startsWith('STANDARD_') && service.serviceProfile.Template === 'CHAPTERED')) {
                // Filter out the removed items from the list.
                serviceItem.profiles = _.filter(serviceItem.profiles, function (originalKeywordChapterMappingProfile) {
                    if (originalKeywordChapterMappingProfile.name === CMPFService.SERVICE_KEYWORD_CHAPTER_MAPPING_PROFILE) {
                        return _.findWhere(service.keywordChapterMappingList, {profileId: originalKeywordChapterMappingProfile.id});
                    } else {
                        return true;
                    }
                });

                var originalKeywordChapterMappingProfiles = CMPFService.findProfilesByName(serviceItem.profiles, CMPFService.SERVICE_KEYWORD_CHAPTER_MAPPING_PROFILE);

                _.each(service.keywordChapterMappingList, function (updatedKeywordChapterMappingProfile) {
                    updatedKeywordChapterMappingProfile = JSON.parse(angular.toJson(updatedKeywordChapterMappingProfile));
                    // Modify some attributes here.
                    delete updatedKeywordChapterMappingProfile.id;

                    var originalKeywordChapterMappingProfile = _.findWhere(originalKeywordChapterMappingProfiles, {id: updatedKeywordChapterMappingProfile.profileId});
                    var keywordChapterMappingProfileAttrArray = CMPFService.prepareProfile(updatedKeywordChapterMappingProfile, originalKeywordChapterMappingProfile);
                    // ---
                    if (originalKeywordChapterMappingProfile) {
                        originalKeywordChapterMappingProfile.attributes = keywordChapterMappingProfileAttrArray;
                    } else {
                        var keywordChapterMappingProfile = {
                            name: CMPFService.SERVICE_KEYWORD_CHAPTER_MAPPING_PROFILE,
                            profileDefinitionName: CMPFService.SERVICE_KEYWORD_CHAPTER_MAPPING_PROFILE,
                            attributes: keywordChapterMappingProfileAttrArray
                        };

                        serviceItem.profiles.push(keywordChapterMappingProfile);
                    }
                });
            } else {
                // Remove KeywordChapterMappingProfile instances
                serviceItem.profiles = _.filter(serviceItem.profiles, function (profile) {
                    return profile.profileDefinitionName !== CMPFService.SERVICE_KEYWORD_CHAPTER_MAPPING_PROFILE;
                });
            }

            // OnDemandi18nProfile
            if (service.onDemandi18nList && service.onDemandi18nList.length > 0 &&
                ((service.serviceProfile.Type.startsWith('STANDARD_') && (service.serviceProfile.Template === 'CHAPTERED' || service.serviceProfile.Template === 'ON_DEMAND')) ||
                    ((service.serviceProfile.Type.startsWith('DCB_') || service.serviceProfile.Type.startsWith('CUSTOMIZED_')) && service.serviceProfile.Usage === 'ON_DEMAND'))) {
                // Filter out the removed items from the list.
                serviceItem.profiles = _.filter(serviceItem.profiles, function (originalOnDemandi18nProfile) {
                    if (originalOnDemandi18nProfile.name === CMPFService.SERVICE_ON_DEMAND_I18N_PROFILE) {
                        return _.findWhere(service.onDemandi18nList, {profileId: originalOnDemandi18nProfile.id});
                    } else {
                        return true;
                    }
                });

                var originalOnDemandi18nProfiles = CMPFService.findProfilesByName(serviceItem.profiles, CMPFService.SERVICE_ON_DEMAND_I18N_PROFILE);

                _.each(service.onDemandi18nList, function (updatedOnDemandi18nProfile) {
                    updatedOnDemandi18nProfile = JSON.parse(angular.toJson(updatedOnDemandi18nProfile));
                    // Modify some attributes here.
                    delete updatedOnDemandi18nProfile.id;

                    var originalOnDemandi18nProfile = _.findWhere(originalOnDemandi18nProfiles, {id: updatedOnDemandi18nProfile.profileId});
                    var onDemandi18nProfileAttrArray = CMPFService.prepareProfile(updatedOnDemandi18nProfile, originalOnDemandi18nProfile);
                    // ---
                    if (originalOnDemandi18nProfile) {
                        originalOnDemandi18nProfile.attributes = onDemandi18nProfileAttrArray;
                    } else {
                        var onDemandi18nProfile = {
                            name: CMPFService.SERVICE_ON_DEMAND_I18N_PROFILE,
                            profileDefinitionName: CMPFService.SERVICE_ON_DEMAND_I18N_PROFILE,
                            attributes: onDemandi18nProfileAttrArray
                        };

                        serviceItem.profiles.push(onDemandi18nProfile);
                    }
                });
            } else {
                // Remove OnDemandi18nProfile instances
                serviceItem.profiles = _.filter(serviceItem.profiles, function (profile) {
                    return profile.profileDefinitionName !== CMPFService.SERVICE_ON_DEMAND_I18N_PROFILE;
                });
            }

            // SubscriptionNotificationProfile
            if (service.serviceProfile.Type.startsWith('STANDARD_') && service.serviceProfile.Template !== 'ON_DEMAND') {
                service.subscriptionNotificationProfile = {
                    url: '',
                    RequiresNotification: false
                };
            }
            if ((service.subscriptionNotificationProfile && ((service.serviceProfile.Type.startsWith('DCB_') || service.serviceProfile.Type.startsWith('CUSTOMIZED_')) && service.serviceProfile.Usage === 'SUBSCRIPTION')) ||
                (service.serviceProfile.Type.startsWith('STANDARD_') && service.serviceProfile.Template !== 'ON_DEMAND')) {
                var originalSubscriptionNotificationProfile = CMPFService.findProfileByName(serviceItem.profiles, CMPFService.SERVICE_SUBSCRIPTION_NOTIFICATION_PROFILE);
                var updatedSubscriptionNotificationProfile = JSON.parse(angular.toJson(service.subscriptionNotificationProfile));
                var subscriptionNotificationProfileArray = CMPFService.prepareProfile(updatedSubscriptionNotificationProfile, originalSubscriptionNotificationProfile);
                // ---
                if (originalSubscriptionNotificationProfile) {
                    originalSubscriptionNotificationProfile.attributes = subscriptionNotificationProfileArray;
                } else {
                    var subscriptionNotificationProfile = {
                        name: CMPFService.SERVICE_SUBSCRIPTION_NOTIFICATION_PROFILE,
                        profileDefinitionName: CMPFService.SERVICE_SUBSCRIPTION_NOTIFICATION_PROFILE,
                        attributes: subscriptionNotificationProfileArray
                    };

                    serviceItem.profiles.push(subscriptionNotificationProfile);
                }
            } else {
                // Remove SubscriptionNotificationProfile instances
                serviceItem.profiles = _.filter(serviceItem.profiles, function (profile) {
                    return profile.profileDefinitionName !== CMPFService.SERVICE_SUBSCRIPTION_NOTIFICATION_PROFILE;
                });
            }

            // ServiceCopyrightFileProfile
            var serviceCopyrightFileProfiles = [];
            if (service.serviceCopyrightFileProfileList && service.serviceCopyrightFileProfileList.length > 0) {
                // Filter out the removed items from the list.
                serviceItem.profiles = _.filter(serviceItem.profiles, function (originalServiceCopyrightFileProfile) {
                    if (originalServiceCopyrightFileProfile.name === CMPFService.SERVICE_COPYRIGHT_FILE_PROFILE) {
                        return _.findWhere(service.serviceCopyrightFileProfileList, {profileId: originalServiceCopyrightFileProfile.id});
                    } else {
                        return true;
                    }
                });

                var originalServiceCopyrightFileProfiles = CMPFService.findProfilesByName(serviceItem.profiles, CMPFService.SERVICE_COPYRIGHT_FILE_PROFILE);

                _.each(service.serviceCopyrightFileProfileList, function (updatedServiceCopyrightFileProfile) {
                    // CopyrightFileID
                    var copyrightFile = updatedServiceCopyrightFileProfile.copyrightFile;
                    if (!copyrightFile || (copyrightFile && !copyrightFile.name)) {
                        updatedServiceCopyrightFileProfile.CopyrightFileID = '';
                    } else if (copyrightFile instanceof File && !updatedServiceCopyrightFileProfile.CopyrightFileID) {
                        updatedServiceCopyrightFileProfile.CopyrightFileID = UtilService.generateObjectId();
                    }
                    serviceCopyrightFileProfiles.push(updatedServiceCopyrightFileProfile)

                    updatedServiceCopyrightFileProfile = JSON.parse(angular.toJson(updatedServiceCopyrightFileProfile));
                    // Modify some attributes here.
                    delete updatedServiceCopyrightFileProfile.id;
                    delete updatedServiceCopyrightFileProfile.copyrightFile;
                    if (updatedServiceCopyrightFileProfile.ValidFrom) {
                        updatedServiceCopyrightFileProfile.ValidFrom = $filter('date')(updatedServiceCopyrightFileProfile.ValidFrom, 'yyyy-MM-dd') + 'T00:00:00';
                    } else {
                        updatedServiceCopyrightFileProfile.ValidFrom = '';
                    }
                    if (updatedServiceCopyrightFileProfile.ValidTo) {
                        updatedServiceCopyrightFileProfile.ValidTo = $filter('date')(updatedServiceCopyrightFileProfile.ValidTo, 'yyyy-MM-dd') + 'T00:00:00';
                    } else {
                        updatedServiceCopyrightFileProfile.ValidTo = '';
                    }

                    var originalServiceCopyrightFileProfile = _.findWhere(originalServiceCopyrightFileProfiles, {id: updatedServiceCopyrightFileProfile.profileId});
                    var serviceCopyrightFileProfileAttrArray = CMPFService.prepareProfile(updatedServiceCopyrightFileProfile, originalServiceCopyrightFileProfile);
                    // ---
                    if (originalServiceCopyrightFileProfile) {
                        originalServiceCopyrightFileProfile.attributes = serviceCopyrightFileProfileAttrArray;
                    } else {
                        var serviceCopyrightFileProfile = {
                            name: CMPFService.SERVICE_COPYRIGHT_FILE_PROFILE,
                            profileDefinitionName: CMPFService.SERVICE_COPYRIGHT_FILE_PROFILE,
                            attributes: serviceCopyrightFileProfileAttrArray
                        };

                        serviceItem.profiles.push(serviceCopyrightFileProfile);
                    }
                });
            } else {
                // Remove ServiceCopyrightFileProfile instances
                serviceItem.profiles = _.filter(serviceItem.profiles, function (profile) {
                    return profile.profileDefinitionName !== CMPFService.SERVICE_COPYRIGHT_FILE_PROFILE;
                });
            }

            // ServiceVATProfile
            if (service.serviceVATProfile && service.serviceVATProfile.VATCategory) {
                var originalServiceVATProfile = CMPFService.findProfileByName(serviceItem.profiles, CMPFService.SERVICE_VAT_PROFILE);
                var updatedServiceVATProfile = JSON.parse(angular.toJson(service.serviceVATProfile));
                var serviceVATProfileArray = CMPFService.prepareProfile(updatedServiceVATProfile, originalServiceVATProfile);
                // ---
                if (originalServiceVATProfile) {
                    originalServiceVATProfile.attributes = serviceVATProfileArray;
                } else {
                    var serviceVATProfile = {
                        name: CMPFService.SERVICE_VAT_PROFILE,
                        profileDefinitionName: CMPFService.SERVICE_VAT_PROFILE,
                        attributes: serviceVATProfileArray
                    };

                    serviceItem.profiles.push(serviceVATProfile);
                }
            } else {
                // Remove ServiceVATProfile instances
                serviceItem.profiles = _.filter(serviceItem.profiles, function (profile) {
                    return profile.profileDefinitionName !== CMPFService.SERVICE_VAT_PROFILE;
                });
            }

            // ServiceContentBasedSettlementProfile
            if (service.contentBasedSettlementList && service.contentBasedSettlementList.length > 0 && service.serviceProfile.Type.startsWith('DCB_')) {
                // Filter out the removed items from the list.
                serviceItem.profiles = _.filter(serviceItem.profiles, function (originalServiceContentBasedSettlementProfile) {
                    if (originalServiceContentBasedSettlementProfile.name === CMPFService.SERVICE_CONTENT_BASED_SETTLEMENT_PROFILE) {
                        return _.findWhere(service.contentBasedSettlementList, {profileId: originalServiceContentBasedSettlementProfile.id});
                    } else {
                        return true;
                    }
                });

                var originalServiceContentBasedSettlementProfiles = CMPFService.findProfilesByName(serviceItem.profiles, CMPFService.SERVICE_CONTENT_BASED_SETTLEMENT_PROFILE);

                _.each(service.contentBasedSettlementList, function (updatedServiceContentBasedSettlementProfile) {
                    updatedServiceContentBasedSettlementProfile = JSON.parse(angular.toJson(updatedServiceContentBasedSettlementProfile));
                    // Modify some attributes here.
                    delete updatedServiceContentBasedSettlementProfile.id;

                    var originalServiceContentBasedSettlementProfile = _.findWhere(originalServiceContentBasedSettlementProfiles, {id: updatedServiceContentBasedSettlementProfile.profileId});
                    var serviceContentBasedSettlementProfileAttrArray = CMPFService.prepareProfile(updatedServiceContentBasedSettlementProfile, originalServiceContentBasedSettlementProfile);
                    // ---
                    if (originalServiceContentBasedSettlementProfile) {
                        originalServiceContentBasedSettlementProfile.attributes = serviceContentBasedSettlementProfileAttrArray;
                    } else {
                        var serviceContentBasedSettlementProfile = {
                            name: CMPFService.SERVICE_CONTENT_BASED_SETTLEMENT_PROFILE,
                            profileDefinitionName: CMPFService.SERVICE_CONTENT_BASED_SETTLEMENT_PROFILE,
                            attributes: serviceContentBasedSettlementProfileAttrArray
                        };

                        serviceItem.profiles.push(serviceContentBasedSettlementProfile);
                    }
                });
            } else {
                // Remove ServiceContentBasedSettlementProfile instances
                serviceItem.profiles = _.filter(serviceItem.profiles, function (profile) {
                    return profile.profileDefinitionName !== CMPFService.SERVICE_CONTENT_BASED_SETTLEMENT_PROFILE;
                });
            }

            // DCBServiceProfile
            if (service.dcbServiceProfile) {
                var originalDCBServiceProfile = CMPFService.findProfileByName(serviceItem.profiles, CMPFService.SERVICE_DCB_SERVICE_PROFILE);
                var updatedDCBServiceProfile = JSON.parse(angular.toJson(service.dcbServiceProfile));
                var dcbServiceProfileArray = CMPFService.prepareProfile(updatedDCBServiceProfile, originalDCBServiceProfile);
                // ---
                if (originalDCBServiceProfile) {
                    originalDCBServiceProfile.attributes = dcbServiceProfileArray;
                } else {
                    var dcbServiceProfile = {
                        name: CMPFService.SERVICE_DCB_SERVICE_PROFILE,
                        profileDefinitionName: CMPFService.SERVICE_DCB_SERVICE_PROFILE,
                        attributes: dcbServiceProfileArray
                    };

                    serviceItem.profiles.push(dcbServiceProfile);
                }
            }

            // DCBServiceActivationProfile
            if (service.dcbServiceActivationProfile && service.serviceProfile && service.serviceProfile.Type.startsWith('DCB_')) {
                var originalDCBServiceActivationProfile = CMPFService.findProfileByName(serviceItem.profiles, CMPFService.SERVICE_DCB_SERVICE_ACTIVATION_PROFILE);
                var updatedDCBServiceActivationProfile = JSON.parse(angular.toJson(service.dcbServiceActivationProfile));
                var dcbServiceActivationProfileArray = CMPFService.prepareProfile(updatedDCBServiceActivationProfile, originalDCBServiceActivationProfile);
                // ---
                if (originalDCBServiceActivationProfile) {
                    originalDCBServiceActivationProfile.attributes = dcbServiceActivationProfileArray;
                } else {
                    var dcbServiceActivationProfile = {
                        name: CMPFService.SERVICE_DCB_SERVICE_ACTIVATION_PROFILE,
                        profileDefinitionName: CMPFService.SERVICE_DCB_SERVICE_ACTIVATION_PROFILE,
                        attributes: dcbServiceActivationProfileArray
                    };

                    serviceItem.profiles.push(dcbServiceActivationProfile);
                }
            }

            CMPFService.checkEntityAuditProfile(serviceItem.profiles);

            // Workflows special service object
            var serviceItemPayload = {
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
                "serviceDetail": serviceItem
            };

            $log.debug('Trying to update service: ', serviceItemPayload);

            // Service update method of the flow service.
            WorkflowsService.updateService(serviceItemPayload).then(function (response) {
                if (response && response.code === 2001) {
                    var promises = [];

                    if (webIconFile && webIconFile.name && (webIconFile instanceof File)) {
                        promises.push(ContentManagementService.uploadFile(webIconFile, webIconFile.name, service.serviceProfile.WEBIconID));
                    }

                    if (wapIconFile && wapIconFile.name && (wapIconFile instanceof File)) {
                        promises.push(ContentManagementService.uploadFile(wapIconFile, wapIconFile.name, service.serviceProfile.WAPIconID));
                    }

                    if (serviceProposalFile && serviceProposalFile.name && (serviceProposalFile instanceof File)) {
                        promises.push(ContentManagementService.uploadFile(serviceProposalFile, serviceProposalFile.name, service.templateAttributes.ServiceProposalFileID));
                    }

                    _.each(serviceCopyrightFileProfiles, function (serviceCopyrightFileProfile) {
                        if (serviceCopyrightFileProfile.copyrightFile && serviceCopyrightFileProfile.copyrightFile.name && (serviceCopyrightFileProfile.copyrightFile instanceof File)) {
                            promises.push(ContentManagementService.uploadFile(serviceCopyrightFileProfile.copyrightFile, serviceCopyrightFileProfile.copyrightFile.name, serviceCopyrightFileProfile.CopyrightFileID));
                        }
                    });

                    $q.all(promises).then(function () {
                        notification.flash({
                            type: 'success',
                            text: $translate.instant('PartnerInfo.Services.Messages.ServiceUpdateFlowStartedSuccessful')
                        });

                        $scope.cancel();
                    });
                }
            }, function (response) {
                $log.error('Cannot call the service update flow service. Error: ', response);

                notification({
                    type: 'warning',
                    text: $translate.instant('PartnerInfo.Services.Messages.ServiceUpdateFlowError')
                });
            });
        };
    });

})();
