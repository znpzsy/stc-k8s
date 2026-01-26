(function () {

    'use strict';

    angular.module('partnerportal.partnerregistration', []);

    var PartnerRegistrationModule = angular.module('partnerportal.partnerregistration');

    PartnerRegistrationModule.config(function ($stateProvider) {

        $stateProvider.state('partnerregistration', {
            url: "",
            template: "<div ui-view></div>",
            data: {
                headerKey: 'FirstPartnerRegistration.Title'
            }
        }).state('partnerregistration.register', {
            url: "/partner-registration",
            templateUrl: 'partner-registration/partner-registration.html',
            controller: 'PartnerRegistrationRegisterCtrl',
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
                lastRejectedTask: function ($q, WorkflowsService, WORKFLOWS_STATUSES) {
                    var deferred = $q.defer();

                    WorkflowsService.getTasks(0, 1, WORKFLOWS_STATUSES.COMPLETED).then(function (tasks) {
                        var taskList = (tasks && tasks.detail) ? tasks.detail.items : [];
                        var lastRejectedTask = _.findWhere(taskList, {response: 'REJECT'});

                        deferred.resolve(lastRejectedTask);
                    }, function (errorResponse) {
                        deferred.reject(errorResponse);
                    });

                    return deferred.promise;
                }
            }
        });

    });

    PartnerRegistrationModule.controller('PartnerRegistrationRegisterCtrl', function ($scope, $log, $q, $state, $controller, $filter, $timeout, $interval, $uibModal, $translate, notification, UtilService,
                                                                                      CMPFService, SessionService, WorkflowsService, ContentManagementService, IdleServiceFactory, businessTypesOrganization,
                                                                                      settlementTypesOrganization, agreementsOrganization, SERVICE_PROVIDER_LEGAL_FILE_TYPES, lastRejectedTask) {
        $log.debug('PartnerRegistrationRegisterCtrl');

        var sessionOrganization = SessionService.getSessionOrganization();
        var username = SessionService.getUsername();

        $scope.lastRejectedTask = lastRejectedTask;

        // Agreement form.
        $scope.agreement = {
            // Initial value of the agreement checkbox.
            checked: false
        };

        $scope.isListsProperlySelected = function () {
            if ($scope.selectedBusinessTypes && $scope.selectedBusinessTypes.length > 0) {
                return _.every($scope.selectedBusinessTypes, function (selectedBusinessType) {
                    return selectedBusinessType.selectedSettlementTypes.length > 0;
                });
            } else {
                return false;
            }
        };

        // Company information form.
        $scope.companyInformationForm = {};
        $scope.companyInformation = {};
        $scope.companyLogo = {};
        // Listen companyInformationForm changes.
        $scope.$on('PartnerRegistrationRegisterCompanyInformationFormChanged', function (event, formAndObject) {
            $log.debug('PartnerRegistrationRegisterCompanyInformationFormChanged: ', formAndObject);

            $scope.companyInformationForm = angular.copy(formAndObject.companyInformationForm);

            if (!$scope.steps[0].disabled && !$scope.companyInformationForm.$invalid) {
                $scope.companyInformation = formAndObject.companyInformation;
                $scope.companyLogo = formAndObject.companyLogo;
            } else {
                $scope.steps[1].disabled = true;
                $scope.steps[2].disabled = true;
                $scope.steps[3].disabled = true;

                delete $scope.companyInformation;
            }
        });

        // Bank information form.
        $scope.bankInformationForm = {};
        $scope.bankInformation = {};
        // Listen bankInformationForm changes.
        $scope.$on('PartnerRegistrationRegisterBankInformationFormChanged', function (event, formAndObject) {
            $log.debug('PartnerRegistrationRegisterBankInformationFormChanged: ', formAndObject);

            $scope.bankInformationForm = angular.copy(formAndObject.bankInformationForm);

            if (!$scope.steps[1].disabled && !$scope.bankInformationForm.$invalid) {
                $scope.bankInformation = formAndObject.bankInformation;
            } else {
                $scope.steps[2].disabled = true;
                $scope.steps[3].disabled = true;

                delete $scope.bankInformation;
            }
        });

        // Legal documents form.
        $scope.businessTypeLegalFilesForm = {};
        $scope.businessTypeLegalFiles = [];
        $scope.selectedBusinessTypes = [];
        $scope.selectedAgreements = [];
        // Listen selectedBusinessTypes changes.
        $scope.$on('PartnerRegistrationRegisterSelectedBusinessTypesChanged', function (event, formAndObject) {
            $log.debug('PartnerRegistrationRegisterSelectedBusinessTypesChanged: ', formAndObject);

            $scope.businessTypeLegalFilesForm = angular.copy(formAndObject.businessTypeLegalFilesForm);
            $scope.businessTypeLegalFiles = formAndObject.businessTypeLegalFiles;
            $scope.selectedBusinessTypes = formAndObject.selectedBusinessTypes;
            $scope.selectedAgreements = formAndObject.selectedAgreements;

            if ($scope.steps[2].disabled || !$scope.isListsProperlySelected() || $scope.businessTypeLegalFilesForm.$invalid) {
                $scope.steps[3].disabled = true;

                delete $scope.businessTypeLegalFilesForm;
                delete $scope.businessTypeLegalFiles;
                delete $scope.selectedBusinessTypes;
                delete $scope.selectedAgreementAgreements;
            } else {
                $scope.prepareAccordionEvents();
            }
        });

        // Steps to be used as tabs.
        if ($scope.lastRejectedTask) {
            // If found a rejected registration task, enable all tabs then.
            $scope.steps = [
                {active: true, disabled: false},
                {active: false, disabled: false},
                {active: false, disabled: false},
                {active: false, disabled: false}
            ];
        } else {
            $scope.steps = [
                {active: true, disabled: false},
                {active: false, disabled: true},
                {active: false, disabled: true},
                {active: false, disabled: true}
            ];
        }

        $scope.currentStep = 0;

        // Step 1 - Open the bank information entry form.
        $scope.nextAndEnterBankInformation = function () {
            // Enter and enable the tab of step 1.
            $scope.currentStep = 1;
            $scope.steps[1].disabled = false;
        };

        // Step 2 - Open the legal documents entry form.
        $scope.nextAndEnterLegalDocuments = function () {
            // Enter and enable the tab of step 2.
            $scope.currentStep = 2;
            $scope.steps[2].disabled = false;
        };

        // Step 3 - Open the terms and conditions agrement form.
        $scope.nextAndEnterAgreeTermsAndConditions = function () {
            // Enter and enable the tab of step 3.
            $scope.currentStep = 3;
            $scope.steps[3].disabled = false;
        };
        $scope.prepareAccordionEvents = function () {
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

        var showSuccessMessage = function () {
            notification.flash({
                type: 'success',
                text: $translate.instant('FirstPartnerRegistration.RegisterFlowStartedSuccessful')
            });

            // Stop idle watch.
            IdleServiceFactory.idleUnwatch();

            // Invalidate session.
            SessionService.sessionInvalidate();

            // Redirect to the login again.
            $state.go('login');
        };

        // ProviderRegistrationProfile
        var providerRegistrationProfiles = CMPFService.getProfileAttributes(sessionOrganization.profiles, CMPFService.SERVICE_PROVIDER_REGISTRATION_PROFILE);
        if (providerRegistrationProfiles && providerRegistrationProfiles.length > 0) {
            $scope.providerRegistrationProfile = providerRegistrationProfiles[0];
        }

        $scope.save = function (companyInformation, companyLogo, bankInformation, selectedBusinessTypes, businessTypeLegalFiles) {
            $scope.isPartnerRegistrationFlowStarted = true;

            var providerItem = {
                id: sessionOrganization.id,
                name: sessionOrganization.name,
                type: sessionOrganization.type,
                orgType: sessionOrganization.orgType,
                parentId: sessionOrganization.parentId,
                parentName: sessionOrganization.parentName,
                state: 'ACTIVE',
                description: sessionOrganization.description,
                // Profiles
                profiles: (sessionOrganization.profiles === undefined ? [] : sessionOrganization.profiles)
            };

            // ProviderRegistrationProfile
            if ($scope.providerRegistrationProfile) {
                var originalProviderRegistrationProfile = CMPFService.findProfileByName(providerItem.profiles, CMPFService.SERVICE_PROVIDER_REGISTRATION_PROFILE);
                var updatedProviderRegistrationProfile = JSON.parse(angular.toJson($scope.providerRegistrationProfile));

                // Modify some attributes here.
                updatedProviderRegistrationProfile.IsRegistrationCompleted = true;

                var providerRegistrationProfileArray = CMPFService.prepareProfile(updatedProviderRegistrationProfile, originalProviderRegistrationProfile);
                // ---
                if (originalProviderRegistrationProfile) {
                    originalProviderRegistrationProfile.attributes = providerRegistrationProfileArray;
                } else {
                    var providerRegistrationProfile = {
                        name: CMPFService.SERVICE_PROVIDER_REGISTRATION_PROFILE,
                        profileDefinitionName: CMPFService.SERVICE_PROVIDER_REGISTRATION_PROFILE,
                        attributes: providerRegistrationProfileArray
                    };

                    providerItem.profiles.push(providerRegistrationProfile);
                }
            }

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

                // Modify some attributes here.
                updatedServiceProviderProfile.LastUpdateTime = $filter('date')(new Date(), 'yyyy-MM-dd') + 'T00:00:00';
                // Set the suffix as partner name.
                updatedServiceProviderProfile.ProviderSuffix = sessionOrganization.name;
                updatedServiceProviderProfile.AdminUserAccount = username;
                updatedServiceProviderProfile.SettlementGroupID = '';
                updatedServiceProviderProfile.SettlementReferenceNo = '';
                updatedServiceProviderProfile.WithholdingTaxDeducted = false;

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
            if (companyInformation.serviceProvideri18nProfiles && !_.isEmpty(companyInformation.serviceProvideri18nProfiles)) {
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
            if (businessTypeLegalFiles && businessTypeLegalFiles.length > 0) {
                var originalProviderLegalDocsProfile = CMPFService.findProfileByName(providerItem.profiles, CMPFService.SERVICE_PROVIDER_LEGAL_DOCS_PROFILE);

                serviceProviderLegalDocs = $scope.prepareLegalFileList(businessTypeLegalFiles, originalProviderLegalDocsProfile ? originalProviderLegalDocsProfile.id : null);
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
            WorkflowsService.partnerFirstLoginInformation(partnerItemPayload).then(function (response) {
                if (response && response.code === 2001) {
                    // Upload files with the generated content ids.
                    var deferredCompanyLogo = $q.defer();
                    if (companyLogo && companyLogo.file && companyLogo.file.name) {
                        ContentManagementService.uploadFile(companyLogo.file, companyLogo.file.name, companyInformation.serviceProviderProfile.CMSCompanyLogoID).then(function () {
                            deferredCompanyLogo.resolve();
                        }, function () {
                            deferredCompanyLogo.resolve();
                        });
                    } else {
                        deferredCompanyLogo.resolve();
                    }
                    var deferredProviderLegalDocsPromises = [];
                    deferredCompanyLogo.promise.then(function () {
                        _.each(serviceProviderLegalDocs, function (attr, name) {
                            if (name.indexOf('_FileAttachment') > -1) {
                                if (attr && attr.name) {
                                    var contentId = serviceProviderLegalDocs[name.split('_FileAttachment')[0]];

                                    var promise = ContentManagementService.uploadFile(attr, attr.name, contentId);
                                    deferredProviderLegalDocsPromises.push(promise);
                                }
                            }
                        });

                        if (deferredProviderLegalDocsPromises.length > 0) {
                            $q.all(deferredProviderLegalDocsPromises).then(function () {
                                showSuccessMessage();
                            });
                        } else {
                            showSuccessMessage();
                        }
                    });
                } else {
                    $scope.isPartnerRegistrationFlowStarted = false;

                    notification({
                        type: 'warning',
                        text: $translate.instant('FirstPartnerRegistration.RegisterFlowError')
                    });
                }
            }, function (response) {
                $log.error('Cannot call the first time partner update flow service. Error: ', response);

                $scope.isPartnerRegistrationFlowStarted = false;

                notification({
                    type: 'warning',
                    text: $translate.instant('FirstPartnerRegistration.RegisterFlowError')
                });
            });
        };

        // If the last registration request was rejected.
        if ($scope.lastRejectedTask) {
            $controller('PIPartnerProfileCompanyInformationFormCtrl', {
                $scope: $scope,
                partner: $scope.lastRejectedTask.objectDetail
            });

            $controller('PIPartnerProfileBankInformationFormCtrl', {
                $scope: $scope,
                partner: $scope.lastRejectedTask.objectDetail
            });
            $scope.$emit('PartnerRegistrationRegisterBankInformationFormChanged', {
                bankInformationForm: $scope.bankInformationForm,
                bankInformation: $scope.bankInformation
            });

            $controller('PIPartnerProfileLegalDocumentsCtrl', {
                $scope: $scope,
                businessTypesOrganization: businessTypesOrganization,
                settlementTypesOrganization: settlementTypesOrganization,
                agreementsOrganization: agreementsOrganization,
                partner: $scope.lastRejectedTask.objectDetail
            });
        }
    });

    PartnerRegistrationModule.controller('PartnerRegistrationRegisterCompanyInformationFormCtrl', function ($scope, $log) {
        $log.debug('PartnerRegistrationRegisterCompanyInformationFormCtrl');

        $scope.companyInformationForm = $scope.companyInformationForm || {};
        $scope.companyInformation = $scope.companyInformation || {};
        $scope.companyLogo = $scope.companyLogo || {};

        if (!$scope.companyInformation.serviceProvideri18nProfiles) {
            $scope.companyInformation.serviceProvideri18nProfiles = [
                {
                    Language: 'EN',
                    Name: '',
                    Description: '',
                    IsDefault: false
                },
                {
                    Language: 'AR',
                    Name: '',
                    Description: '',
                    IsDefault: false
                }
            ];
        } else {
            $scope.companyInformationForm.$name = 'companyInformationForm';
        }

        var emitCompanyInformationFormChanges = function () {
            $log.debug('PartnerRegistrationRegisterCompanyInformationFormChanged:emit');

            $scope.$emit('PartnerRegistrationRegisterCompanyInformationFormChanged', {
                companyInformationForm: $scope.companyInformationForm,
                companyInformation: $scope.companyInformation,
                companyLogo: $scope.companyLogo
            });
        };

        $scope.$watch('companyInformation', function (newVal, oldVal) {
            if (newVal !== oldVal) {
                emitCompanyInformationFormChanges();
            }
        }, true);

        $scope.$watch('companyLogo.file.name', function (newVal, oldVal) {
            if (newVal !== oldVal) {
                emitCompanyInformationFormChanges();
            }
        });
    });

    PartnerRegistrationModule.controller('PartnerRegistrationRegisterBankInformationFormCtrl', function ($scope, $log, SERVICE_PROVIDER_BANK_ACCOUNT_TYPES) {
        $log.debug('PartnerRegistrationRegisterBankInformationFormCtrl');

        $scope.SERVICE_PROVIDER_BANK_ACCOUNT_TYPES = SERVICE_PROVIDER_BANK_ACCOUNT_TYPES;

        $scope.bankInformationForm = $scope.bankInformationForm || {};
        $scope.bankInformation = $scope.bankInformation || {};

        $scope.$watch('bankInformation', function (newVal, oldVal) {
            if (newVal !== oldVal) {
                $log.debug('PartnerRegistrationRegisterBankInformationFormChanged:emit');

                $scope.$emit('PartnerRegistrationRegisterBankInformationFormChanged', {
                    bankInformationForm: $scope.bankInformationForm,
                    bankInformation: $scope.bankInformation
                });
            }
        }, true);
    });

    PartnerRegistrationModule.controller('PartnerRegistrationRegisterLegalDocumentsCtrl', function ($scope, $q, $log, $controller, $filter, $uibModal, ContentManagementService, FileDownloadService,
                                                                                                    CMPFService, UtilService, DateTimeConstants, SessionService, SERVICE_PROVIDER_LEGAL_FILE_TYPES) {
        $log.debug('PartnerRegistrationRegisterLegalDocumentsCtrl');

        // Call the controller in order to prepare legal files tables.
        $controller('PartnerRegistrationRegisterOrganizationLegalFilesCtrl', {
            $scope: $scope
        });

        var sessionOrganization = SessionService.getSessionOrganization();

        $scope.businessTypeLegalFilesForm = $scope.businessTypeLegalFilesForm || {};
        $scope.selectedBusinessTypes = $scope.selectedBusinessTypes || [];
        $scope.selectedAgreements = $scope.selectedAgreements || [];

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

        var emitBusinessTypeLegalFilesFormChanges = function () {
            $log.debug('PartnerRegistrationRegisterSelectedBusinessTypesChanged:emit');

            $scope.$emit('PartnerRegistrationRegisterSelectedBusinessTypesChanged', {
                businessTypeLegalFilesForm: $scope.businessTypeLegalFilesForm,
                businessTypeLegalFiles: $scope.businessTypeLegalFiles.list,
                selectedBusinessTypes: $scope.selectedBusinessTypes,
                selectedAgreements: $scope.selectedAgreements
            });
        };

        // Business type list selection watcher.
        $scope.$watch('selectedBusinessTypes', function (newVal, oldVal) {
            if (newVal !== oldVal) {
                emitBusinessTypeLegalFilesFormChanges();
            }
        }, true);

        // Legal files attachment form watcher.
        $scope.$watch(function () {
            return $scope.businessTypeLegalFilesForm.$valid;
        }, function (newVal, oldVal) {
            if (newVal !== oldVal) {
                emitBusinessTypeLegalFilesFormChanges();
            }
        });

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
                    });
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
                        return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_BUSINESS_TYPES_ORGANIZATION_NAME);
                    },
                    agreementsOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_AGREEMENTS_ORGANIZATION_NAME);
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
                        return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_SETTLEMENT_TYPES_ORGANIZATION_NAME);
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
    });

    PartnerRegistrationModule.controller('PartnerRegistrationRegisterOrganizationBusinessTypesModalCtrl', function ($scope, $uibModalInstance, $log, $filter, NgTableParams, NgTableService, Restangular,
                                                                                                                    CMPFService, businessTypesParameter, businessTypesOrganization, agreementsOrganization) {
        $log.debug('PartnerRegistrationRegisterOrganizationBusinessTypesModalCtrl');

        $scope.selectedItems = businessTypesParameter ? businessTypesParameter : [];

        $scope.businessTypesOrganization = businessTypesOrganization.organizations[0];
        $scope.businessTypes = CMPFService.getBusinessTypes($scope.businessTypesOrganization);
        $scope.businessTypes = $filter('orderBy')($scope.businessTypes, 'profileId');
        $scope.businessTypes = _.filter($scope.businessTypes, {Status: 'COMMERCIAL'});

        $scope.agreementsOrganization = agreementsOrganization.organizations[0];
        $scope.agreements = CMPFService.getAgreements($scope.agreementsOrganization);

        _.each($scope.businessTypes, function (businessType) {
            var foundAgreement = _.findWhere($scope.agreements, {profileId: Number(businessType.AgreementID)});
            if (foundAgreement) {
                businessType.Agreement = foundAgreement
            } else {
                businessType.Agreement = {
                    Name: 'N/A'
                };
            }
        });

        $scope.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "profileId": 'asc'
            }
        }, {
            $scope: $scope,
            total: 0,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.businessTypes);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.businessTypes;
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
            var businessType = _.findWhere($scope.selectedItems, {profileId: item.profileId});
            if (!businessType) {
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
            $uibModalInstance.close({
                selectedItems: $scope.selectedItems,
                allAgreements: $scope.agreements
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });

    PartnerRegistrationModule.controller('PartnerRegistrationRegisterOrganizationLegalFilesCtrl', function ($scope, $log, $filter, NgTableParams, UtilService) {
        $log.debug('PartnerRegistrationRegisterOrganizationLegalFilesCtrl');

        $scope.dateFormat = 'MMMM d, y';
        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1,
            showWeeks: false
        };

        if ($scope.businessTypeLegalFiles && $scope.businessTypeLegalFiles.list) {
            $scope.businessTypeLegalFiles = {
                list: $scope.businessTypeLegalFiles.list,
                tableParams: {}
            };
        } else {
            $scope.businessTypeLegalFiles = {
                list: [],
                tableParams: {}
            };
        }

        $scope.businessTypeLegalFiles.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "name": 'asc'
            }
        }, {
            $scope: $scope,
            total: 0,
            getData: function ($defer, params) {
                var orderedData = params.sorting() ? $filter('orderBy')($scope.businessTypeLegalFiles.list, params.orderBy()) : $scope.businessTypeLegalFiles.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));

                // Data is loaded. Initialize the date fields.
                $defer.promise.then(function (dataArray) {
                    _.each(dataArray, function (data) {
                        if (data.required) {
                            data.startDate = data.startDate ? data.startDate : UtilService.getTodayBegin();
                            data.endDate = data.endDate ? data.endDate : moment(UtilService.getTodayEnd()).year(2099).toDate();
                        }
                    });
                });
            }
        });

        $scope.openFromDatePicker = function ($event, data) {
            $event.preventDefault();
            $event.stopPropagation();
            data.startDatePicker = {
                opened: true
            };
        };
        $scope.openToDatePicker = function ($event, data) {
            $event.preventDefault();
            $event.stopPropagation();

            data.endDatePicker = {
                opened: true
            };
        };
    });

    PartnerRegistrationModule.controller('PartnerRegistrationRegisterOrganizationSettlementTypesCtrl', function ($scope, $log, $filter, NgTableParams, selectedBusinessType) {
        $log.debug('PartnerRegistrationRegisterOrganizationSettlementTypesCtrl');

        if (!selectedBusinessType.selectedSettlementTypes) {
            selectedBusinessType.selectedSettlementTypes = [];
        }

        selectedBusinessType.selectedSettlementTypesTableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "profileId": 'asc'
            }
        }, {
            $scope: $scope,
            total: 0,
            getData: function ($defer, params) {
                var orderedData = params.sorting() ? $filter('orderBy')(selectedBusinessType.selectedSettlementTypes, params.orderBy()) : selectedBusinessType.selectedSettlementTypes;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
    });

    PartnerRegistrationModule.controller('PartnerRegistrationRegisterOrganizationSettlementTypesModalCtrl', function ($scope, $log, $filter, $uibModal, $uibModalInstance, NgTableParams, NgTableService, Restangular,
                                                                                                                      settlementTypesParameter, selectedBusinessType, settlementTypesOrganization, CMPFService,
                                                                                                                      SessionService, showDetailsFunction) {
        $log.debug('PartnerRegistrationRegisterOrganizationSettlementTypesModalCtrl');

        var sessionOrganization = SessionService.getSessionOrganization();

        $scope.selectedItems = settlementTypesParameter ? settlementTypesParameter : [];
        $scope.selectedBusinessType = selectedBusinessType;

        $scope.settlementTypesOrganization = settlementTypesOrganization.organizations[0];
        $scope.settlementTypes = [];

        var settlementTypes = CMPFService.getSettlementTypes($scope.settlementTypesOrganization);

        // Filter out the items of the business types's settlement types and COMMERCIAL ones.
        _.each($scope.selectedBusinessType.SettlementTypes, function (settlementType) {
            var foundSettlementType = _.findWhere(settlementTypes, {profileId: Number(settlementType.value)});
            if (foundSettlementType && foundSettlementType.Status === 'COMMERCIAL') {
                if (foundSettlementType.IsPartnerSpecific) {
                    if (foundSettlementType.Partners) {
                        var partnerIds = String(foundSettlementType.Partners).split(',');
                        if (partnerIds.indexOf(String(sessionOrganization ? sessionOrganization.id : 0)) > -1) {
                            $scope.settlementTypes.push(foundSettlementType);
                        }
                    }
                } else {
                    $scope.settlementTypes.push(foundSettlementType);
                }
            }
        });
        $scope.settlementTypes = $filter('orderBy')($scope.settlementTypes, 'profileId');

        $scope.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "profileId": 'asc'
            }
        }, {
            $scope: $scope,
            total: 0,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.settlementTypes);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.settlementTypes;
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
            var settlementType = _.findWhere($scope.selectedItems, {profileId: item.profileId});
            if (!settlementType) {
                $scope.selectedItems.push(item);
            }
        };

        $scope.removeFromSelection = function (item) {
            var index = _.indexOf($scope.selectedItems, item);
            if (index !== -1) {
                $scope.selectedItems.splice(index, 1);
            }
        };

        // Details modal window.
        $scope.showDetails = showDetailsFunction;

        $scope.ok = function () {
            $uibModalInstance.close($scope.selectedItems);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });

})();
