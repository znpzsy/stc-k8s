(function () {

    'use strict';

    angular.module('partnerportal.partner-info.services.new', []);

    var PartnerInfoServicesNewServiceModule = angular.module('partnerportal.partner-info.services.new');

    PartnerInfoServicesNewServiceModule.config(function ($stateProvider) {

        $stateProvider.state('partner-info.services.new', {
            url: "/new",
            templateUrl: "partner-info/services/operations.services.detail.html",
            controller: 'PartnerInfoServicesNewServiceCtrl',
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
                service: function () {
                    return null;
                }
            }
        }).state('partner-info.services.resendcreatetask', {
            url: "/resend-create/:id",
            templateUrl: "partner-info/services/operations.services.detail.html",
            controller: 'PartnerInfoServicesNewServiceCtrl',
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

    PartnerInfoServicesNewServiceModule.controller('PartnerInfoServicesNewServiceCtrl', function ($rootScope, $scope, $log, $controller, $q, $filter, $uibModal, notification, $translate, UtilService, CMPFService,
                                                                                                  SessionService, ContentManagementService, WorkflowsService, businessTypesOrganization, settlementTypesOrganization,
                                                                                                  serviceCategoriesOrganization, serviceLabelsOrganization, shortCodesOrganization, service) {
        $log.debug('PartnerInfoServicesNewServiceCtrl');

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

        $scope.service = {
            name: '',
            // Profiles
            servicei18nProfiles: [
                {Language: 'EN', Name: '', Description: '', IsDefault: false, SearchKeyword: ''},
                {Language: 'AR', Name: '', Description: '', IsDefault: false, SearchKeyword: ''}
            ],
            serviceProfile: {
                Description: '',
                StartDate: '',
                EndDate: '',
                Language: null,
                Type: null,
                Template: null,
                Usage: null,
                CategoryID: null,
                LabelID: null,
                NotificationURL: null,
                IsHidingMSISDN: false,
                Capabilities: [],
                WEBIconID: null,
                WAPIconID: null,
                BusinessTypeID: null,
                SettlementTypeID: null,
                CopyrightFileID: null,
                LastUpdateTime: null,
                URLForMOSMS: '',
                URLForMOMMS: '',
                LegacyVsNewOutboundAPI: 'NEW_REST'
            },
            subscriptionNotificationProfile: {
                url: '',
                LegacyVsNewNotification: 'NEW_REST'
            },
            dcbServiceProfile: {
                TrustStatus: 'UNTRUSTED'
            },
            serviceVATProfile: {
                VATCategory: null,
                HasSpecialVATPercentage: false,
                VATPercentage: 15
            }
        };

        $scope.dateHolder.startDate = null;
        $scope.dateHolder.endDate = null;

        $scope.initializeBusinessTypeList();

        // If coming here from the create task page for resending the form with little updates for create again.
        if (service) {
            $controller('PartnerInfoServicesUpdateServiceCtrl', {
                $scope: $scope,
                businessTypesOrganization: businessTypesOrganization,
                settlementTypesOrganization: settlementTypesOrganization,
                serviceCategoriesOrganization: serviceCategoriesOrganization,
                serviceLabelsOrganization: serviceLabelsOrganization,
                shortCodesOrganization: shortCodesOrganization,
                service: service
            });
        }

        $scope.save = function (service) {
            var serviceItem = {
                name: service.name,
                organizationId: SessionService.getSessionOrganization().id,
                state: service.state,
                profiles: []
            };

            // ServiceProfile
            service.serviceProfile.LastUpdateTime = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');
            var webIconFile, wapIconFile;
            // WEBIconID
            if (service.serviceProfile.webIconFile && service.serviceProfile.webIconFile.name) {
                service.serviceProfile.WEBIconID = UtilService.generateObjectId();
                webIconFile = service.serviceProfile.webIconFile;
            }
            // WAPIconID
            if (service.serviceProfile.wapIconFile && service.serviceProfile.wapIconFile.name) {
                service.serviceProfile.WAPIconID = UtilService.generateObjectId();
                wapIconFile = service.serviceProfile.wapIconFile;
            }
            var serviceProfile = $scope.prepareServiceProfile($scope.dateHolder, service.serviceProfile);
            serviceItem.profiles.push(serviceProfile);

            // Servicei18nProfile
            var servicei18nProfiles = $scope.prepareServicei18nProfiles(service.servicei18nProfiles);
            serviceItem.profiles = serviceItem.profiles.concat(servicei18nProfiles);

            // ServiceCapabilityAccessProfile
            if (service.serviceCapabilityAccessProfileList && service.serviceCapabilityAccessProfileList.length > 0 &&
                service.serviceProfile.Type && !service.serviceProfile.Type.startsWith('STANDARD_')) {
                var serviceCapabilityAccessProfiles = $scope.prepareServiceCapabilityAccessProfiles(service.serviceCapabilityAccessProfileList);
                serviceItem.profiles = serviceItem.profiles.concat(serviceCapabilityAccessProfiles);
            }

            // MOChargingProfile
            if (service.moChargingProfile &&
                ((service.serviceProfile.Type.startsWith('STANDARD_') && service.serviceProfile.Template === 'ON_DEMAND') ||
                    ((service.serviceProfile.Type.startsWith('DCB_') || service.serviceProfile.Type.startsWith('CUSTOMIZED_')) && service.serviceProfile.Usage === 'ON_DEMAND'))) {
                var moChargingProfile = $scope.prepareMOChargingProfile(service.moChargingProfile);
                serviceItem.profiles = serviceItem.profiles.concat(moChargingProfile);
            }

            // MTChargingProfile
            if (service.mtServiceFeeList && service.mtServiceFeeList.length > 0 &&
                ((service.serviceProfile.Type.startsWith('STANDARD_') && service.serviceProfile.Template === 'ON_DEMAND') ||
                    ((service.serviceProfile.Type.startsWith('DCB_') || service.serviceProfile.Type.startsWith('CUSTOMIZED_')) && service.serviceProfile.Usage === 'ON_DEMAND'))) {
                var mtChargingProfiles = $scope.prepareMTChargingProfiles(service.mtServiceFeeList);
                serviceItem.profiles = serviceItem.profiles.concat(mtChargingProfiles);
            }

            // Template profiles
            var serviceProposalFile;
            if (service.serviceProfile.Type.startsWith('STANDARD_')) {
                if (service.serviceProfile.Template === 'ALERTS' || service.serviceProfile.Template === 'SEQUENTIAL') {
                    var alertTemplateProfile = $scope.prepareAlertTemplateProfile(service.templateAttributes);
                    serviceItem.profiles.push(alertTemplateProfile);
                } else if (service.serviceProfile.Template === 'ON_DEMAND') {
                    // ServiceProposalFileID
                    if (service.templateAttributes.serviceProposalFile && service.templateAttributes.serviceProposalFile.name) {
                        service.templateAttributes.ServiceProposalFileID = UtilService.generateObjectId();
                        serviceProposalFile = service.templateAttributes.serviceProposalFile;
                    }

                    var onDemandTemplateProfile = $scope.prepareOnDemandTemplateProfile(service.templateAttributes);
                    serviceItem.profiles.push(onDemandTemplateProfile);
                } else if (service.serviceProfile.Template === 'OTHER') {
                    // ServiceProposalFileID
                    if (service.templateAttributes.serviceProposalFile && service.templateAttributes.serviceProposalFile.name) {
                        service.templateAttributes.ServiceProposalFileID = UtilService.generateObjectId();
                        serviceProposalFile = service.templateAttributes.serviceProposalFile;
                    }

                    var otherTemplateProfile = $scope.prepareOtherTemplateProfile(service.templateAttributes);
                    serviceItem.profiles.push(otherTemplateProfile);
                }
            }

            // SenderIdProfile
            if (service.senderIdProfile) {
                var senderIdProfile = $scope.prepareSenderIdProfile(service.senderIdProfile);
                serviceItem.profiles.push(senderIdProfile);
            }

            // KeywordChapterMappingProfile
            if (service.keywordChapterMappingList && service.keywordChapterMappingList.length > 0 &&
                (service.serviceProfile.Type.startsWith('STANDARD_') && service.serviceProfile.Template === 'CHAPTERED')) {
                var keywordChapterMappingProfiles = $scope.prepareKeywordChapterMappingProfiles(service.keywordChapterMappingList);
                serviceItem.profiles = serviceItem.profiles.concat(keywordChapterMappingProfiles);
            }

            // OnDemandi18nProfile
            if (service.onDemandi18nList && service.onDemandi18nList.length > 0 &&
                ((service.serviceProfile.Type.startsWith('STANDARD_') && (service.serviceProfile.Template === 'CHAPTERED' || service.serviceProfile.Template === 'ON_DEMAND')) ||
                    ((service.serviceProfile.Type.startsWith('DCB_') || service.serviceProfile.Type.startsWith('CUSTOMIZED_')) && service.serviceProfile.Usage === 'ON_DEMAND'))) {
                var onDemandi18nProfiles = $scope.prepareOnDemandi18nProfiles(service.onDemandi18nList);
                serviceItem.profiles = serviceItem.profiles.concat(onDemandi18nProfiles);
            }

            // SubscriptionNotificationProfile
            if (service.subscriptionNotificationProfile &&
                ((service.serviceProfile.Type.startsWith('DCB_') || service.serviceProfile.Type.startsWith('CUSTOMIZED_')) && service.serviceProfile.Usage === 'SUBSCRIPTION')) {
                var subscriptionNotificationProfile = $scope.prepareSubscriptionNotificationProfile(service.subscriptionNotificationProfile);
                serviceItem.profiles.push(subscriptionNotificationProfile);
            } else if (service.serviceProfile.Type.startsWith('STANDARD_') && service.serviceProfile.Template !== 'ON_DEMAND') {
                var subscriptionNotificationProfile = {
                    name: CMPFService.SERVICE_SUBSCRIPTION_NOTIFICATION_PROFILE,
                    profileDefinitionName: CMPFService.SERVICE_SUBSCRIPTION_NOTIFICATION_PROFILE,
                    attributes: [
                        {
                            "name": "url",
                            "value": ''
                        },
                        {
                            "name": "RequiresNotification",
                            "value": false
                        }
                    ]
                };

                serviceItem.profiles.push(subscriptionNotificationProfile);
            }

            // ProductProfile
            if ((service.serviceProfile.Type.startsWith('STANDARD_') && service.serviceProfile.Template === 'ON_DEMAND') ||
                ((service.serviceProfile.Type.startsWith('DCB_') || service.serviceProfile.Type.startsWith('CUSTOMIZED_')) && service.serviceProfile.Usage === 'ON_DEMAND')) {
                service.productProfile = {
                    "Code": "DSP",
                    "NameLangEN": service.servicei18nProfiles[0].Name,
                    "DescriptionLangEN": service.servicei18nProfiles[0].Description,
                    "NameLangOther": service.servicei18nProfiles[1].Name,
                    "DescriptionLangOther": service.servicei18nProfiles[1].Description,
                    "LegacyProductStatus": "COMMERCIAL"
                };

                var productProfile = $scope.prepareProductProfile(service.productProfile);
                serviceItem.profiles.push(productProfile);
            }

            // ServiceCopyrightFileProfile
            if (service.serviceCopyrightFileProfileList && service.serviceCopyrightFileProfileList.length > 0) {
                angular.forEach(service.serviceCopyrightFileProfileList, function (serviceCopyrightFileProfile) {
                    serviceCopyrightFileProfile.CopyrightFileID = UtilService.generateObjectId();
                });

                var serviceCopyrightFileProfiles = $scope.prepareServiceCopyrightFileProfiles($scope.dateHolder, service.serviceCopyrightFileProfileList);
                serviceItem.profiles = serviceItem.profiles.concat(serviceCopyrightFileProfiles);
            }

            // ServiceVATProfile
            if (service.serviceVATProfile && service.serviceVATProfile.VATCategory) {
                var serviceVATProfile = $scope.prepareServiceVATProfile(service.serviceVATProfile);
                serviceItem.profiles = serviceItem.profiles.concat(serviceVATProfile);
            }

            // ServiceContentBasedSettlementProfile
            if (service.contentBasedSettlementList && service.contentBasedSettlementList.length > 0 && service.serviceProfile.Type.startsWith('DCB_')) {
                var serviceContentBasedSettlementProfiles = $scope.prepareServiceContentBasedSettlementProfiles(service.contentBasedSettlementList);
                serviceItem.profiles = serviceItem.profiles.concat(serviceContentBasedSettlementProfiles);
            }

            // DCBServiceProfile
            if (service.dcbServiceProfile) {
                var dcbServiceProfile = $scope.prepareDCBServiceProfile(service.dcbServiceProfile);
                serviceItem.profiles = serviceItem.profiles.concat(dcbServiceProfile);
            }

            // DCBServiceActivationProfile
            if (service.dcbServiceActivationProfile && service.serviceProfile && service.serviceProfile.Type.startsWith('DCB_')) {
                var dcbServiceActivationProfile = $scope.prepareDCBServiceActivationProfile(service.dcbServiceActivationProfile);
                serviceItem.profiles = serviceItem.profiles.concat(dcbServiceActivationProfile);
            }

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

            $log.debug('Trying to create service: ', serviceItemPayload);

            // Service create method of the flow service.
            WorkflowsService.createService(serviceItemPayload).then(function (response) {
                if (response && response.code === 2001) {
                    $log.debug('Save Success. Response: ', response);

                    var promises = [];

                    if (webIconFile && webIconFile.name) {
                        promises.push(ContentManagementService.uploadFile(webIconFile, webIconFile.name, service.serviceProfile.WEBIconID));
                    }

                    if (wapIconFile && wapIconFile.name) {
                        promises.push(ContentManagementService.uploadFile(wapIconFile, wapIconFile.name, service.serviceProfile.WAPIconID));
                    }

                    if (serviceProposalFile && serviceProposalFile.name) {
                        promises.push(ContentManagementService.uploadFile(serviceProposalFile, serviceProposalFile.name, service.templateAttributes.ServiceProposalFileID));
                    }

                    _.each(service.serviceCopyrightFileProfileList, function (serviceCopyrightFileProfile) {
                        if (serviceCopyrightFileProfile.copyrightFile && serviceCopyrightFileProfile.copyrightFile.name) {
                            promises.push(ContentManagementService.uploadFile(serviceCopyrightFileProfile.copyrightFile, serviceCopyrightFileProfile.copyrightFile.name, serviceCopyrightFileProfile.CopyrightFileID));
                        }
                    });

                    $q.all(promises).then(function () {
                        notification.flash({
                            type: 'success',
                            text: $translate.instant('PartnerInfo.Services.Messages.ServiceCreateFlowStartedSuccessful')
                        });

                        $scope.cancel();
                    });
                } else {
                    notification({
                        type: 'warning',
                        text: response.detail
                    });
                }
            }, function (response) {
                $log.error('Cannot call the service create flow service. Error: ', response);

                if (response && response.data && response.data.detail) {
                    notification({
                        type: 'warning',
                        text: response.data.detail
                    });
                } else {
                    notification({
                        type: 'warning',
                        text: $translate.instant('PartnerInfo.Services.Messages.ServiceCreateFlowError')
                    });
                }
            });
        };
    });

})();
