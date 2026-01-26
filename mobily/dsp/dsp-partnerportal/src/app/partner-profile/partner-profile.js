(function () {

    'use strict';

    angular.module('partnerportal.partner-profile', []);

    var PIPartnerProfileModule = angular.module('partnerportal.partner-profile');

    PIPartnerProfileModule.config(function ($stateProvider) {

        $stateProvider.state('partner-profile', {
            url: "/partner-profile",
            templateUrl: "partner-profile/partner-profile.html",
            data: {
                headerKey: 'PartnerProfile.Title',
                permissions: [
                    'PRM__PROFILE_READ'
                ]
            },
            controller: 'PIPartnerProfileCtrl',
            resolve: {
                businessTypesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_BUSINESS_TYPES_ORGANIZATION_NAME);
                },
                settlementTypesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_SETTLEMENT_TYPES_ORGANIZATION_NAME);
                },
                agreementsOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_AGREEMENTS_ORGANIZATION_NAME);
                },
                partner: function ($q, SessionService, CMPFService, UtilService, Restangular) {
                    var deferred = $q.defer();

                    var sessionOrganizationId = SessionService.getSessionOrganizationId();
                    // Get the organization of the user account and write to the session store.
                    CMPFService.getPartnerById(sessionOrganizationId).then(function (partner) {
                        var partnerSimple = Restangular.stripRestangular(partner);

                        UtilService.putToSessionStore(UtilService.USER_ORGANIZATION_KEY, partnerSimple);

                        deferred.resolve(partnerSimple);
                    });

                    return deferred.promise;
                }
            }
        }).state('partner-profile-resendupdatetask', {
            url: "/resend-update/:id",
            templateUrl: "partner-profile/partner-profile.html",
            controller: 'PIPartnerProfileCtrl',
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
                agreementsOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_AGREEMENTS_ORGANIZATION_NAME);
                },
                partner: function ($stateParams, $q, WorkflowsService) {
                    var deferred = $q.defer();

                    WorkflowsService.getPartner($stateParams.id).then(function (partnerResponse) {
                        deferred.resolve(partnerResponse.objectDetail);
                    }, function (errorResponse) {
                        deferred.reject(errorResponse);
                    });

                    return deferred.promise;
                }
            }
        });

    });

    // Partner Profile Controller
    PIPartnerProfileModule.controller('PIPartnerProfileCtrl', function ($scope, $log, $state, $controller, $q, $filter, $timeout, $translate, notification, CMPFService, UtilService,
                                                                        SessionService, WorkflowsService, ContentManagementService, businessTypesOrganization, settlementTypesOrganization,
                                                                        agreementsOrganization, SERVICE_PROVIDER_LEGAL_FILE_TYPES, partner) {
        $log.debug('PIPartnerProfileCtrl');

        var sessionOrganization = partner;
        var username = SessionService.getUsername();

        $scope.isListsProperlySelected = function () {
            if ($scope.selectedBusinessTypes && $scope.selectedBusinessTypes.length > 0) {
                return _.every($scope.selectedBusinessTypes, function (selectedBusinessType) {
                    return selectedBusinessType.selectedSettlementTypes.length > 0;
                });
            } else {
                return false;
            }
        };

        // Agreement form.
        $scope.agreement = {
            // Initial value of the agreement checkbox.
            checked: false
        };

        // Steps to be used as tabs.
        $scope.steps = [
            {active: true, disabled: false},
            {active: false, disabled: false},
            {active: false, disabled: false},
            {active: false, disabled: false}
        ];

        $scope.currentStep = 0;

        // Go to the last step.
        $scope.submitForm = function () {
            // Enter and enable the tab of step 3.
            $scope.currentStep = 3;
        };

        $scope.generateServiceProviderBusinessTypeProfiles = function (providerBusinessTypeProfiles) {
            var providerBusinessTypeProfileArray = [];

            angular.forEach(providerBusinessTypeProfiles, function (providerBusinessTypeProfile) {
                var providerBusinessTypeProfileObj = {
                    name: CMPFService.SERVICE_PROVIDER_BUSINESS_TYPE_PROFILE,
                    profileDefinitionName: CMPFService.SERVICE_PROVIDER_BUSINESS_TYPE_PROFILE,
                    attributes: [
                        {
                            "name": "BusinessTypeID",
                            "value": providerBusinessTypeProfile.profileId
                        },
                        {
                            "name": "BusinessStatus",
                            "value": 'DRAFT'
                        },
                        {
                            "name": "TrustedStatus",
                            "value": 'UNTRUSTED'
                        }
                    ]
                };

                this.push(providerBusinessTypeProfileObj);
            }, providerBusinessTypeProfileArray);

            return providerBusinessTypeProfileArray;
        };

        $scope.generateServiceProviderSettlementTypeProfiles = function (providerSettlementTypeProfiles) {
            var providerSettlementTypeProfileArray = [];

            angular.forEach(providerSettlementTypeProfiles, function (providerSettlementTypeProfile) {
                var providerSettlementTypeProfileObj = {
                    name: CMPFService.SERVICE_PROVIDER_SETTLEMENT_TYPE_PROFILE,
                    profileDefinitionName: CMPFService.SERVICE_PROVIDER_SETTLEMENT_TYPE_PROFILE,
                    attributes: [
                        {
                            "name": "SettlementTypeID",
                            "value": providerSettlementTypeProfile.profileId
                        },
                        {
                            "name": "SettlementStatus",
                            "value": 'DRAFT'
                        }
                    ]
                };

                this.push(providerSettlementTypeProfileObj);
            }, providerSettlementTypeProfileArray);

            return providerSettlementTypeProfileArray;
        };

        $scope.prepareLegalFileList = function (fileList, profileId) {
            var serviceProviderLegalDocs = {};

            _.each(SERVICE_PROVIDER_LEGAL_FILE_TYPES, function (legalFileTypeName) {
                var keyword = legalFileTypeName.split('DocReq')[0];

                var record = _.findWhere(fileList, {name: legalFileTypeName});
                if (record) {
                    serviceProviderLegalDocs['CMS' + keyword + 'ID'] = record['CMS' + keyword + 'ID'];

                    if (record.legalFileAttachment) {
                        serviceProviderLegalDocs['CMS' + keyword + 'ID_FileAttachment'] = record.legalFileAttachment;
                    }

                    if (!record.legalFileAttachment || (record.legalFileAttachment && !record.legalFileAttachment.name)) {
                        serviceProviderLegalDocs['CMS' + keyword + 'ID'] = '';
                    } else if (record.legalFileAttachment instanceof File && !serviceProviderLegalDocs['CMS' + keyword + 'ID']) {
                        serviceProviderLegalDocs['CMS' + keyword + 'ID'] = UtilService.generateObjectId();
                    }

                    if (record.startDate) {
                        serviceProviderLegalDocs[keyword + 'ValidFrom'] = $filter('date')(record.startDate, 'yyyy-MM-dd\'T\'HH:mm:ss');
                    }
                    if (record.endDate) {
                        serviceProviderLegalDocs[keyword + 'ValidTo'] = $filter('date')(record.endDate, 'yyyy-MM-dd\'T\'HH:mm:ss');
                    }
                }
            });

            if (profileId) {
                serviceProviderLegalDocs.profileId = profileId;
            }

            return serviceProviderLegalDocs;
        };

        $timeout(function () {
            $scope.originalCompanyInfromation = angular.copy($scope.companyInformation);
            $scope.originalBankInformation = angular.copy($scope.bankInformation);
            $scope.originalCompanyLogo = angular.copy($scope.companyLogo);
            $scope.originalSelectedBusinessTypes = angular.copy($scope.selectedBusinessTypes);
            $scope.originalBusinessTypeLegalFilesList = angular.copy($scope.businessTypeLegalFiles.list);
        }, 1000);
        $scope.isNotChanged = function () {
            return angular.equals($scope.companyInformation, $scope.originalCompanyInfromation) &&
                angular.equals($scope.bankInformation, $scope.originalBankInformation) &&
                angular.equals($scope.companyLogo, $scope.originalCompanyLogo) &&
                angular.equals($scope.selectedBusinessTypes, $scope.originalSelectedBusinessTypes) &&
                angular.equals($scope.businessTypeLegalFiles.list, $scope.originalBusinessTypeLegalFilesList);
        };

        $scope.save = function (companyInformation, companyLogo, bankInformation, selectedBusinessTypes, businessTypeLegalFiles) {
            $scope.isPartnerRegistrationFlowStarted = true;

            var providerItem = {
                id: sessionOrganization.id,
                name: sessionOrganization.name,
                type: sessionOrganization.type,
                orgType: sessionOrganization.orgType,
                parentId: sessionOrganization.parentId,
                parentName: sessionOrganization.parentName,
                state: sessionOrganization.state,
                description: sessionOrganization.description,
                // Profiles
                profiles: (sessionOrganization.profiles === undefined ? [] : sessionOrganization.profiles)
            };

            // ServiceProviderProfile
            if (companyInformation.serviceProviderProfile) {
                // CMSCompanyLogoID
                if (!companyLogo || !companyLogo.file || (companyLogo.file && !companyLogo.file.name)) {
                    companyInformation.serviceProviderProfile.CMSCompanyLogoID = '';
                } else if (companyLogo.file instanceof File && !companyInformation.serviceProviderProfile.CMSCompanyLogoID) {
                    companyInformation.serviceProviderProfile.CMSCompanyLogoID = UtilService.generateObjectId();
                }

                var originalServiceProviderProfile = CMPFService.findProfileByName(providerItem.profiles, CMPFService.SERVICE_PROVIDER_PROFILE);
                var updatedServiceProviderProfile = JSON.parse(angular.toJson(companyInformation.serviceProviderProfile));

                // Start/End Dates
                if (companyInformation.serviceProviderProfile.EffectiveDate) {
                    updatedServiceProviderProfile.EffectiveDate = $filter('date')(companyInformation.serviceProviderProfile.EffectiveDate, 'yyyy-MM-dd') + 'T00:00:00';
                } else {
                    updatedServiceProviderProfile.EffectiveDate = '';
                }
                updatedServiceProviderProfile.ExpiryDate = $filter('date')(companyInformation.serviceProviderProfile.ExpiryDate, 'yyyy-MM-dd') + 'T00:00:00';
                updatedServiceProviderProfile.LastUpdateTime = $filter('date')(new Date(), 'yyyy-MM-dd') + 'T00:00:00';

                // Set the suffix as partner name.
                updatedServiceProviderProfile.ProviderSuffix = sessionOrganization.name;

                delete updatedServiceProviderProfile.companyLogo;

                var serviceProviderProfileArray = CMPFService.prepareProfile(updatedServiceProviderProfile, originalServiceProviderProfile);
                // ---
                if (originalServiceProviderProfile) {
                    originalServiceProviderProfile.attributes = serviceProviderProfileArray;
                } else {
                    var serviceProviderProfile = {
                        name: CMPFService.SERVICE_PROVIDER_PROFILE,
                        profileDefinitionName: CMPFService.SERVICE_PROVIDER_PROFILE,
                        attributes: serviceProviderProfileArray
                    };

                    providerItem.profiles.push(serviceProviderProfile);
                }
            }

            // Provideri18nProfile
            if (companyInformation.serviceProvideri18nProfiles && companyInformation.serviceProvideri18nProfiles.length > 0) {
                var originalServiceProvideri18nProfiles = CMPFService.findProfilesByName(providerItem.profiles, CMPFService.SERVICE_PROVIDER_I18N_PROFILE);
                _.each(companyInformation.serviceProvideri18nProfiles, function (updatedServiceProvideri18nProfile) {
                    updatedServiceProvideri18nProfile = JSON.parse(angular.toJson(updatedServiceProvideri18nProfile));
                    var originalServiceProvideri18nProfile = _.findWhere(originalServiceProvideri18nProfiles, {id: updatedServiceProvideri18nProfile.profileId});
                    var serviceProvideri18nProfileAttrArray = CMPFService.prepareProfile(updatedServiceProvideri18nProfile, originalServiceProvideri18nProfile);
                    // ---
                    if (originalServiceProvideri18nProfile) {
                        originalServiceProvideri18nProfile.attributes = serviceProvideri18nProfileAttrArray;
                    } else {
                        var serviceProvideri18nProfile = {
                            name: CMPFService.SERVICE_PROVIDER_I18N_PROFILE,
                            profileDefinitionName: CMPFService.SERVICE_PROVIDER_I18N_PROFILE,
                            attributes: serviceProvideri18nProfileAttrArray
                        };

                        providerItem.profiles.push(serviceProvideri18nProfile);
                    }
                });
            }

            // ServiceProviderContactsProfile
            if (companyInformation.serviceProviderContactsProfile) {
                var originalServiceProviderContactsProfile = CMPFService.findProfileByName(providerItem.profiles, CMPFService.SERVICE_PROVIDER_CONTACTS_PROFILE);
                var updatedServiceProviderContactsProfile = JSON.parse(angular.toJson(companyInformation.serviceProviderContactsProfile));
                var serviceProviderContactsProfileArray = CMPFService.prepareProfile(updatedServiceProviderContactsProfile, originalServiceProviderContactsProfile);
                // ---
                if (originalServiceProviderContactsProfile) {
                    originalServiceProviderContactsProfile.attributes = serviceProviderContactsProfileArray;
                } else {
                    var serviceProviderContactsProfile = {
                        name: CMPFService.SERVICE_PROVIDER_CONTACTS_PROFILE,
                        profileDefinitionName: CMPFService.SERVICE_PROVIDER_CONTACTS_PROFILE,
                        attributes: serviceProviderContactsProfileArray
                    };

                    providerItem.profiles.push(serviceProviderContactsProfile);
                }
            }

            // ServiceProviderBankAccountProfiles
            if (bankInformation.serviceProviderBankAccountProfile) {
                var originalServiceProviderBankAccountProfile = CMPFService.findProfileByName(providerItem.profiles, CMPFService.SERVICE_PROVIDER_BANK_ACCOUNT_PROFILE);
                var updatedServiceProviderBankAccountProfile = JSON.parse(angular.toJson(bankInformation.serviceProviderBankAccountProfile));
                var serviceProviderBankAccountProfilesArray = CMPFService.prepareProfile(updatedServiceProviderBankAccountProfile, originalServiceProviderBankAccountProfile);
                // ---
                if (originalServiceProviderBankAccountProfile) {
                    originalServiceProviderBankAccountProfile.attributes = serviceProviderBankAccountProfilesArray;
                } else {
                    var serviceProviderBankAccountProfile = {
                        name: CMPFService.SERVICE_PROVIDER_BANK_ACCOUNT_PROFILE,
                        profileDefinitionName: CMPFService.SERVICE_PROVIDER_BANK_ACCOUNT_PROFILE,
                        attributes: serviceProviderBankAccountProfilesArray
                    };

                    providerItem.profiles.push(serviceProviderBankAccountProfile);
                }
            }

            // Remove the all ProviderBusinessTypeProfile profiles
            providerItem.profiles = _.filter(providerItem.profiles, function (profile) {
                return profile.profileDefinitionName !== CMPFService.SERVICE_PROVIDER_BUSINESS_TYPE_PROFILE;
            });
            // Remove the all ProviderSettlementTypeProfile profiles
            providerItem.profiles = _.filter(providerItem.profiles, function (profile) {
                return profile.profileDefinitionName !== CMPFService.SERVICE_PROVIDER_SETTLEMENT_TYPE_PROFILE;
            });

            // ProviderBusinessTypeProfile
            if (selectedBusinessTypes && selectedBusinessTypes.length > 0) {
                var providerBusinessTypeProfiles = $scope.generateServiceProviderBusinessTypeProfiles(selectedBusinessTypes);
                var originalProviderBusinessTypeProfiles = _.where(sessionOrganization.profiles, {profileDefinitionName: CMPFService.SERVICE_PROVIDER_BUSINESS_TYPE_PROFILE});
                _.each(originalProviderBusinessTypeProfiles, function (originalProviderBusinessTypeProfile, profileIndex) {
                    if (providerBusinessTypeProfiles[profileIndex]) {
                        providerBusinessTypeProfiles[profileIndex].id = originalProviderBusinessTypeProfile.id;

                        _.findWhere(providerBusinessTypeProfiles[profileIndex].attributes, {name: "BusinessTypeID"}).id = _.findWhere(originalProviderBusinessTypeProfile.attributes, {name: "BusinessTypeID"}).id;
                        _.findWhere(providerBusinessTypeProfiles[profileIndex].attributes, {name: "BusinessStatus"}).id = _.findWhere(originalProviderBusinessTypeProfile.attributes, {name: "BusinessStatus"}).id;
                        _.findWhere(providerBusinessTypeProfiles[profileIndex].attributes, {name: "TrustedStatus"}).id = _.findWhere(originalProviderBusinessTypeProfile.attributes, {name: "TrustedStatus"}).id;
                    }
                });
                providerItem.profiles = providerItem.profiles.concat(providerBusinessTypeProfiles);

                // ProviderSettlementTypeProfile
                var allProviderSettlementTypes = [];
                _.each(selectedBusinessTypes, function (selectedBusinessType) {
                    var providerSettlementTypes = $scope.generateServiceProviderSettlementTypeProfiles(selectedBusinessType.selectedSettlementTypes);
                    allProviderSettlementTypes = allProviderSettlementTypes.concat(providerSettlementTypes);
                });
                var originalProviderSettlementTypeProfiles = _.where(sessionOrganization.profiles, {profileDefinitionName: CMPFService.SERVICE_PROVIDER_SETTLEMENT_TYPE_PROFILE});
                _.each(originalProviderSettlementTypeProfiles, function (originalProviderSettlementTypeProfile, profileIndex) {
                    if (allProviderSettlementTypes[profileIndex]) {
                        allProviderSettlementTypes[profileIndex].id = originalProviderSettlementTypeProfile.id;

                        _.findWhere(allProviderSettlementTypes[profileIndex].attributes, {name: "SettlementTypeID"}).id = _.findWhere(originalProviderSettlementTypeProfile.attributes, {name: "SettlementTypeID"}).id;
                        _.findWhere(allProviderSettlementTypes[profileIndex].attributes, {name: "SettlementStatus"}).id = _.findWhere(originalProviderSettlementTypeProfile.attributes, {name: "SettlementStatus"}).id;
                    }
                });
                providerItem.profiles = providerItem.profiles.concat(allProviderSettlementTypes);
            }

            // ProviderLegalDocsProfile
            var serviceProviderLegalDocs;
            if (businessTypeLegalFiles && businessTypeLegalFiles.list.length > 0) {
                var originalProviderLegalDocsProfile = CMPFService.findProfileByName(providerItem.profiles, CMPFService.SERVICE_PROVIDER_LEGAL_DOCS_PROFILE);

                serviceProviderLegalDocs = $scope.prepareLegalFileList(businessTypeLegalFiles.list, originalProviderLegalDocsProfile ? originalProviderLegalDocsProfile.id : null);
                var updatedProviderLegalDocsProfile = JSON.parse(angular.toJson(serviceProviderLegalDocs));

                // Remove the unnecessary fields.
                _.each(updatedProviderLegalDocsProfile, function (attr, name) {
                    if (name.indexOf('_FileAttachment') > -1) {
                        delete updatedProviderLegalDocsProfile[name];
                    }
                });

                var providerLegalDocsProfilesArray = CMPFService.prepareProfile(updatedProviderLegalDocsProfile, originalProviderLegalDocsProfile);
                // ---
                if (originalProviderLegalDocsProfile) {
                    originalProviderLegalDocsProfile.attributes = providerLegalDocsProfilesArray;
                } else {
                    var providerLegalDocsProfile = {
                        name: CMPFService.SERVICE_PROVIDER_LEGAL_DOCS_PROFILE,
                        profileDefinitionName: CMPFService.SERVICE_PROVIDER_LEGAL_DOCS_PROFILE,
                        attributes: providerLegalDocsProfilesArray
                    };

                    providerItem.profiles.push(providerLegalDocsProfile);
                }
            }

            CMPFService.checkEntityAuditProfile(providerItem.profiles);

            // Workflows special partner object updating.
            var partnerItemPayload = {
                "from": {
                    "userId": username,
                    "orgId": sessionOrganization.name,
                    "groupId": null
                },
                "to": {
                    "userId": null,
                    "orgId": null,
                    "groupId": CMPFService.DSP_BUSINESS_ADMIN_GROUP
                },
                "partnerDetail": providerItem
            };

            $log.debug('Trying update service provider: ', partnerItemPayload);

            // Call the first time partner update method of the flow service.
            WorkflowsService.updatePartner(partnerItemPayload).then(function (response) {
                if (response && response.code === 2001) {
                    var promises = [];

                    // Upload files with the generated content ids.
                    if (companyLogo && companyLogo.file && companyLogo.file.name && (companyLogo.file instanceof File)) {
                        promises.push(ContentManagementService.uploadFile(companyLogo.file, companyLogo.file.name, companyInformation.serviceProviderProfile.CMSCompanyLogoID));
                    }
                    _.each(serviceProviderLegalDocs, function (attr, name) {
                        if (name.indexOf('_FileAttachment') > -1) {
                            if (attr && attr.name && (attr instanceof File)) {
                                var contentId = serviceProviderLegalDocs[name.split('_FileAttachment')[0]];

                                promises.push(ContentManagementService.uploadFile(attr, attr.name, contentId));
                            }
                        }
                    });

                    $q.all(promises).then(function () {
                        notification({
                            type: 'success',
                            text: $translate.instant('PartnerProfile.PartnerUpdateFlowStartedSuccessful')
                        });

                        $scope.cancel();
                    });
                } else {
                    $scope.isPartnerRegistrationFlowStarted = false;

                    notification({
                        type: 'warning',
                        text: $translate.instant('PartnerProfile.PartnerUpdateFlowError')
                    });
                }
            }, function (response) {
                $log.error('Cannot call the first time partner update flow service. Error: ', response);

                $scope.isPartnerRegistrationFlowStarted = false;

                notification({
                    type: 'warning',
                    text: $translate.instant('PartnerProfile.PartnerUpdateFlowError')
                });
            });
        };

        $scope.cancel = function () {
            if ($state.current.data.cancelState) {
                $state.go($state.current.data.cancelState.url, $state.current.data.cancelState.params);
            } else {
                $state.go('partner-info.reporting-dashboards');
            }
        };

        $controller('PIPartnerProfileCompanyInformationFormCtrl', {$scope: $scope, partner: partner});
        $controller('PIPartnerProfileBankInformationFormCtrl', {$scope: $scope, partner: partner});
        $controller('PIPartnerProfileLegalDocumentsCtrl', {
            $scope: $scope,
            businessTypesOrganization: businessTypesOrganization,
            settlementTypesOrganization: settlementTypesOrganization,
            agreementsOrganization: agreementsOrganization,
            partner: partner
        });
    });

    PIPartnerProfileModule.controller('PIPartnerProfileCompanyInformationFormCtrl', function ($scope, $log, $controller, $filter, SessionService, DateTimeConstants, CMPFService, ContentManagementService,
                                                                                              FileDownloadService, partner) {
        $log.debug('PIPartnerProfileCompanyInformationFormCtrl');

        $controller('GenericDateTimeCtrl', {$scope: $scope});

        var sessionOrganization = SessionService.getSessionOrganization();
        if (partner) {
            partner.name = sessionOrganization.name;
            sessionOrganization = partner;
        }

        $scope.companyInformationForm = {};
        $scope.companyInformation = {};
        $scope.companyLogo = {};

        // ServiceProviderProfile
        var serviceProviderProfiles = CMPFService.getProfileAttributes(sessionOrganization.profiles, CMPFService.SERVICE_PROVIDER_PROFILE);
        if (serviceProviderProfiles.length > 0) {
            $scope.companyInformation.serviceProviderProfile = angular.copy(serviceProviderProfiles[0]);
            $scope.companyInformation.serviceProviderProfile.EffectiveDate = ($scope.companyInformation.serviceProviderProfile ? new Date($filter('date')($scope.companyInformation.serviceProviderProfile.EffectiveDate, 'yyyy-MM-dd\'T\'HH:mm:ss' + DateTimeConstants.OFFSET_WITH_COLON)) : '');
            $scope.companyInformation.serviceProviderProfile.ExpiryDate = new Date($filter('date')($scope.companyInformation.serviceProviderProfile.ExpiryDate, 'yyyy-MM-dd\'T\'HH:mm:ss' + DateTimeConstants.OFFSET_WITH_COLON));

            // Get the CMSCompanyLogo by id value.
            $scope.companyLogo = {
                file: {
                    name: undefined
                }
            };
            if ($scope.companyInformation.serviceProviderProfile.CMSCompanyLogoID) {
                var srcUrl = ContentManagementService.generateFilePath($scope.companyInformation.serviceProviderProfile.CMSCompanyLogoID);
                FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                    $scope.companyLogo.file = blob;
                    if (blob) {
                        $scope.companyLogo.file.name = fileName;
                    }

                    $scope.originalCompanyLogo = angular.copy($scope.companyLogo);
                });
            }
        } else {
            $scope.companyInformation.serviceProviderProfile = {
                EffectiveDate: $scope.getTodayBegin(),
                ExpiryDate: $scope.getTodayEnd()
            };
        }

        // Provideri18nProfile
        var serviceProvideri18nProfiles = CMPFService.getProfileAttributes(sessionOrganization.profiles, CMPFService.SERVICE_PROVIDER_I18N_PROFILE);
        $scope.companyInformation.serviceProvideri18nProfiles = [];
        if (serviceProvideri18nProfiles.length > 0) {
            var serviceProvideri18nProfilesEn = _.findWhere(serviceProvideri18nProfiles, {Language: 'EN'});
            if (serviceProvideri18nProfilesEn) {
                $scope.companyInformation.serviceProvideri18nProfiles.push(serviceProvideri18nProfilesEn);
            } else {
                $scope.companyInformation.serviceProvideri18nProfiles.push({
                    Language: 'EN',
                    Name: '',
                    Description: '',
                    IsDefault: false
                });
            }

            var serviceProvideri18nProfilesAr = _.findWhere(serviceProvideri18nProfiles, {Language: 'AR'});
            if (serviceProvideri18nProfilesAr) {
                $scope.companyInformation.serviceProvideri18nProfiles.push(serviceProvideri18nProfilesAr);
            } else {
                $scope.companyInformation.serviceProvideri18nProfiles.push({
                    Language: 'AR',
                    Name: '',
                    Description: '',
                    IsDefault: false
                });
            }
        }

        // ProviderContactsProfile
        var providerContactsProfiles = CMPFService.getProfileAttributes(sessionOrganization.profiles, CMPFService.SERVICE_PROVIDER_CONTACTS_PROFILE);
        if (providerContactsProfiles.length > 0) {
            $scope.companyInformation.serviceProviderContactsProfile = angular.copy(providerContactsProfiles[0]);
        }
    });

    PIPartnerProfileModule.controller('PIPartnerProfileBankInformationFormCtrl', function ($scope, $log, SessionService, CMPFService, SERVICE_PROVIDER_BANK_ACCOUNT_TYPES, partner) {
        $log.debug('PIPartnerProfileBankInformationFormCtrl');

        var sessionOrganization = SessionService.getSessionOrganization();
        if (partner) {
            partner.name = sessionOrganization.name;
            sessionOrganization = partner;
        }

        $scope.SERVICE_PROVIDER_BANK_ACCOUNT_TYPES = SERVICE_PROVIDER_BANK_ACCOUNT_TYPES;

        $scope.bankInformationForm = {};
        $scope.bankInformation = {};

        // ProviderBankAccountProfile
        var providerBankAccountProfiles = CMPFService.getProfileAttributes(sessionOrganization.profiles, CMPFService.SERVICE_PROVIDER_BANK_ACCOUNT_PROFILE);
        if (providerBankAccountProfiles.length > 0) {
            providerBankAccountProfiles[0].SupplierID = Number(providerBankAccountProfiles[0].SupplierID);
            $scope.bankInformation.serviceProviderBankAccountProfile = angular.copy(providerBankAccountProfiles[0]);
        }
    });

    PIPartnerProfileModule.controller('PIPartnerProfileLegalDocumentsCtrl', function ($scope, $log, $q, $controller, $filter, $uibModal, NgTableParams, NgTableService, SessionService, CMPFService,
                                                                                      UtilService, DateTimeConstants, ContentManagementService, FileDownloadService, businessTypesOrganization,
                                                                                      settlementTypesOrganization, agreementsOrganization, SERVICE_PROVIDER_LEGAL_FILE_TYPES, partner) {
        $log.debug('PIPartnerProfileLegalDocumentsCtrl');

        // Call the controller in order to prepare legal files tables.
        $controller('PartnerRegistrationRegisterOrganizationLegalFilesCtrl', {
            $scope: $scope
        });

        var sessionOrganization = SessionService.getSessionOrganization();
        if (partner) {
            partner.name = sessionOrganization.name;
            sessionOrganization = partner;
        }

        $scope.businessTypeLegalFilesForm = {};
        $scope.selectedBusinessTypes = [];
        $scope.selectedAgreements = [];

        // Details modal window.
        $scope.showSettlementTypeDetails = function (settlementType, $event) {
            $event.preventDefault();
            $event.stopPropagation();

            settlementType.rowSelected = true;

            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'partner-registration/partner-registration.settlementtypes.details.modal.html',
                controller: function ($scope, $uibModalInstance) {
                    $scope.settlementType = settlementType;

                    $scope.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                }
            });

            modalInstance.result.then(function () {
                settlementType.rowSelected = false;
            }, function () {
                settlementType.rowSelected = false;
            });
        };

        $scope.selectBusinessTypeTab = function (selectedIndex) {
            _.each($scope.selectedBusinessTypes, function (selectedBusinessType, index) {
                selectedBusinessType.active = (selectedIndex === index);
            });
        };

        var generateNecessaryFileList = function (selectedBusinessTypes) {
            _.each(SERVICE_PROVIDER_LEGAL_FILE_TYPES, function (fileType) {
                _.each(selectedBusinessTypes, function (selectedBusinessType) {
                    if (selectedBusinessType[fileType] && selectedBusinessType[fileType] !== 'IRRELEVANT') {
                        var foundBusinessTypeLegalFile = _.findWhere($scope.businessTypeLegalFiles.list, {name: fileType});
                        if (foundBusinessTypeLegalFile) {
                            foundBusinessTypeLegalFile.required = (selectedBusinessType[fileType] === 'MANDATORY');
                        } else {
                            $scope.businessTypeLegalFiles.list.push({
                                id: _.uniqueId(),
                                name: fileType,
                                required: (selectedBusinessType[fileType] === 'MANDATORY')
                            });
                        }
                    }
                });
            });

            // If there is no selected business type.
            if (selectedBusinessTypes.length === 0) {
                $scope.businessTypeLegalFiles.list = [];
            } else {
                $scope.businessTypeLegalFiles.list = _.filter($scope.businessTypeLegalFiles.list, function (businessTypeLegalFile) {
                    var validFileTypes = _.filter(selectedBusinessTypes, function (selectedBusinessType) {
                        var fileType = selectedBusinessType[businessTypeLegalFile.name];

                        return (fileType && fileType !== 'IRRELEVANT');
                    });

                    return validFileTypes && validFileTypes.length > 0;
                });
            }

            $scope.businessTypeLegalFiles.tableParams.page(1);
            $scope.businessTypeLegalFiles.tableParams.reload();
        };

        var prepareAccordionEvents = function () {
            $scope.selectedAgreements.forEach(function (agreement) {
                var isAccordionOpen = false;
                if (_.isUndefined(agreement.isAccordionOpen)) {
                    Object.defineProperty(agreement, "isAccordionOpen", {
                        get: function () {
                            return isAccordionOpen;
                        },
                        set: function (newValue) {
                            isAccordionOpen = newValue;

                            if (isAccordionOpen) {
                                var container = angular.element('#embeddedAgreementDocument' + agreement.index);
                                if (container.length > 0) {
                                    container.html(agreement.CMSContentBlobText);
                                }
                            }
                        }
                    });
                }
            });
        };

        var downloadAgreementFiles = function (allUniqAgreementRecords) {
            var downloadAllAgreementFilesDeferred = $q.defer();

            // Filter out the garbage t&c agreement items.
            allUniqAgreementRecords = _.filter(allUniqAgreementRecords, function (agreement) {
                return agreement.profileId && agreement.Type !== 'COMMON';
            });
            // Find out the common agreement.
            var foundCommonAgreement = _.findWhere($scope.agreements, {Type: 'COMMON'});
            if (foundCommonAgreement) {
                allUniqAgreementRecords.unshift(foundCommonAgreement);
            }

            var promiseList = [];
            _.each(allUniqAgreementRecords, function (agreement) {
                if (agreement.CMSContentID) {
                    var srcUrl = ContentManagementService.generateFilePath(agreement.CMSContentID);
                    var downloadAgreementFileDeferred = $q.defer();

                    var reader = new FileReader();
                    reader.onload = function () {
                        var object = {};
                        object.serial = _.uniqueId();
                        object.date = moment().format('YYYY-MM-DD HH:mm:ss');
                        object.companyName = $scope.companyInformation.serviceProvideri18nProfiles[0].Name || '';
                        object.countryName = $scope.companyInformation.serviceProviderProfile.Country || '';
                        object.companyAddress = $scope.companyInformation.serviceProviderProfile.Address || '';
                        object.certificateNumber = $scope.companyInformation.serviceProviderProfile.CRNO || '';
                        // ProviderRegistrationProfile
                        var providerRegistrationProfiles = CMPFService.getProfileAttributes(sessionOrganization.profiles, CMPFService.SERVICE_PROVIDER_REGISTRATION_PROFILE);
                        if (providerRegistrationProfiles && providerRegistrationProfiles.length > 0) {
                            object.signeeFullName = providerRegistrationProfiles[0].ApplicantName || '';
                            object.signeePosition = providerRegistrationProfiles[0].Position || '';
                        }

                        agreement.CMSContentBlobText = UtilService.replaceParametersValues(object, reader.result);

                        downloadAgreementFileDeferred.resolve(agreement.CMSContentBlobText);
                    }
                    FileDownloadService.downloadFile(srcUrl, function (blob, fileName) {
                        reader.readAsText(blob);
                    });

                    promiseList.push(downloadAgreementFileDeferred.promise);
                }
            });

            $q.all(promiseList).then(function () {
                downloadAllAgreementFilesDeferred.resolve(allUniqAgreementRecords);
            });

            return downloadAllAgreementFilesDeferred.promise;
        };

        // Business Types
        var rearrangeSelectedBusinessTypes = function () {
            // Make unique the list in order not to query same content twice.
            var allUniqAgreementRecords = _.uniq(_.map($scope.selectedBusinessTypes, function (selectedBusinessType) {
                return {
                    profileId: selectedBusinessType.Agreement.profileId,
                    Name: selectedBusinessType.Agreement.Name,
                    Type: selectedBusinessType.Agreement.Type,
                    CMSContentID: selectedBusinessType.Agreement.CMSContentID
                };
            }), function (agreement) {
                return agreement.CMSContentID;
            });

            // Download files and prepare blob texts.
            downloadAgreementFiles(allUniqAgreementRecords).then(function (agreementsWithCMSContentBlobTexts) {
                $scope.selectedAgreements = agreementsWithCMSContentBlobTexts;

                prepareAccordionEvents();
            });

            // Make a decision about necessary documents for all selected business types.
            generateNecessaryFileList($scope.selectedBusinessTypes);

            if ($scope.selectedBusinessTypes && $scope.selectedBusinessTypes.length > 0) {
                $scope.selectedBusinessTypes = $filter('orderBy')($scope.selectedBusinessTypes, ['Name']);

                // Initialize the attributes of the selected business types.
                _.each($scope.selectedBusinessTypes, function (selectedBusinessType) {
                    selectedBusinessType.active = false;

                    // Call the controller for selected business types.
                    $controller('PartnerRegistrationRegisterOrganizationSettlementTypesCtrl', {
                        $scope: $scope,
                        selectedBusinessType: selectedBusinessType
                    })
                });

                $scope.selectedBusinessTypes[0].active = true;
            }
        };

        $scope.showBusinessTypes = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'partner-registration/partner-registration.businesstypes.modal.html',
                controller: 'PartnerRegistrationRegisterOrganizationBusinessTypesModalCtrl',
                size: 'lg',
                resolve: {
                    businessTypesParameter: function () {
                        return angular.copy($scope.selectedBusinessTypes);
                    },
                    businessTypesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return businessTypesOrganization;
                    },
                    agreementsOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return agreementsOrganization;
                    }
                }
            });

            modalInstance.result.then(function (result) {
                $scope.selectedBusinessTypes = result.selectedItems;
                $scope.agreements = result.allAgreements;

                rearrangeSelectedBusinessTypes();
            }, function () {
            });
        };

        $scope.removeSelectedBusinessType = function (selectedBusinessType) {
            var index = _.indexOf($scope.selectedBusinessTypes, selectedBusinessType);
            if (index != -1) {
                $scope.selectedBusinessTypes.splice(index, 1);

                rearrangeSelectedBusinessTypes();
            }
        };

        // Settlement Types
        $scope.showSettlementTypesByBusinessType = function (selectedBusinessType) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partner-registration/partner-registration.settlementtypes.modal.html',
                controller: 'PartnerRegistrationRegisterOrganizationSettlementTypesModalCtrl',
                size: 'lg',
                resolve: {
                    settlementTypesParameter: function () {
                        return angular.copy(selectedBusinessType.selectedSettlementTypes);
                    },
                    selectedBusinessType: function () {
                        return angular.copy(selectedBusinessType);
                    },
                    settlementTypesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return settlementTypesOrganization;
                    },
                    showDetailsFunction: function () {
                        return $scope.showSettlementTypeDetails;
                    }
                }
            });

            modalInstance.result.then(function (selectedItems) {
                selectedBusinessType.selectedSettlementTypes = $filter('orderBy')(selectedItems, ['Name']);

                selectedBusinessType.selectedSettlementTypesTableParams.page(1);
                selectedBusinessType.selectedSettlementTypesTableParams.reload();
            }, function () {
            });
        };

        $scope.removeSettlementType = function (selectedBusinessType, settlementType) {
            var index = _.indexOf(selectedBusinessType.selectedSettlementTypes, settlementType);
            if (index != -1) {
                selectedBusinessType.selectedSettlementTypes.splice(index, 1);

                selectedBusinessType.selectedSettlementTypesTableParams.page(1);
                selectedBusinessType.selectedSettlementTypesTableParams.reload();
            }
        };

        var businessTypesOrganizationItem = businessTypesOrganization.organizations[0];
        var businessTypes = CMPFService.getBusinessTypes(businessTypesOrganizationItem);

        // ProviderBusinessTypeProfile
        var providerBusinessTypeProfiles = CMPFService.getProfileAttributes(sessionOrganization.profiles, CMPFService.SERVICE_PROVIDER_BUSINESS_TYPE_PROFILE);

        var settlementTypesOrganizationItem = settlementTypesOrganization.organizations[0];
        var settlementTypes = CMPFService.getSettlementTypes(settlementTypesOrganizationItem);

        // ProviderSettlementTypeProfile
        var providerSettlementTypeProfiles = CMPFService.getProfileAttributes(sessionOrganization.profiles, CMPFService.SERVICE_PROVIDER_SETTLEMENT_TYPE_PROFILE);

        // AgreementProfile
        $scope.agreementsOrganization = agreementsOrganization.organizations[0];
        $scope.agreements = CMPFService.getAgreements($scope.agreementsOrganization);

        if (providerBusinessTypeProfiles.length > 0) {
            _.each(providerBusinessTypeProfiles, function (providerBusinessTypeProfile) {
                var selectedBusinessType = angular.copy(_.findWhere(businessTypes, {profileId: Number(providerBusinessTypeProfile.BusinessTypeID)}));
                if (selectedBusinessType) {
                    selectedBusinessType.selectedSettlementTypes = [];

                    if (providerSettlementTypeProfiles.length > 0) {
                        _.each(providerSettlementTypeProfiles, function (providerSettlementTypeProfile) {
                            var selectedSettlementType = angular.copy(_.findWhere(settlementTypes, {profileId: Number(providerSettlementTypeProfile.SettlementTypeID)}));
                            if (selectedSettlementType) {
                                var allSettlementTypeIDs = _.pluck(selectedBusinessType.SettlementTypes, 'value');
                                if (_.contains(allSettlementTypeIDs, selectedSettlementType.profileId.toString())) {
                                    selectedBusinessType.selectedSettlementTypes.push(selectedSettlementType);
                                }
                            }
                        });
                    }

                    // Find out and assign related Agreement items.
                    var foundAgreement = _.findWhere($scope.agreements, {profileId: Number(selectedBusinessType.AgreementID)});
                    if (foundAgreement) {
                        selectedBusinessType.Agreement = foundAgreement
                    } else {
                        selectedBusinessType.Agreement = {
                            Name: 'N/A'
                        };
                    }

                    $scope.selectedBusinessTypes.push(selectedBusinessType);
                }
            });

            rearrangeSelectedBusinessTypes();
        }

        // ProviderLegalDocsProfile
        var providerLegalDocsProfiles = CMPFService.getProfileAttributes(sessionOrganization.profiles, CMPFService.SERVICE_PROVIDER_LEGAL_DOCS_PROFILE);
        if (providerLegalDocsProfiles.length > 0) {
            var providerLegalDocsProfile = angular.copy(providerLegalDocsProfiles[0]);

            if ($scope.businessTypeLegalFiles && $scope.businessTypeLegalFiles.list) {
                _.each(SERVICE_PROVIDER_LEGAL_FILE_TYPES, function (legalFileTypeName) {
                    var businessTypeLegalFile = _.findWhere($scope.businessTypeLegalFiles.list, {name: legalFileTypeName});
                    var keyword = legalFileTypeName.split('DocReq')[0];
                    if (businessTypeLegalFile) {
                        var localDocContentID = providerLegalDocsProfile['CMS' + keyword + 'ID'];
                        if (localDocContentID) {
                            businessTypeLegalFile['CMS' + keyword + 'ID'] = localDocContentID;

                            var srcUrl = ContentManagementService.generateFilePath(localDocContentID);
                            FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                                businessTypeLegalFile.legalFileAttachment = blob;
                                if (blob) {
                                    businessTypeLegalFile.legalFileAttachment.name = fileName;
                                }

                                $scope.originalBusinessTypeLegalFilesList = _.deepClone($scope.businessTypeLegalFiles.list);
                            });
                        }

                        var localDocValidFrom = providerLegalDocsProfile[keyword + 'ValidFrom'];
                        if (localDocValidFrom) {
                            businessTypeLegalFile.startDate = new Date(moment(localDocValidFrom).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss'));
                        }

                        var localDocValidTo = providerLegalDocsProfile[keyword + 'ValidTo'];
                        if (localDocValidTo) {
                            businessTypeLegalFile.endDate = new Date(moment(localDocValidTo).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss'));
                        }
                    }
                });
            }
        }
    });

})();
