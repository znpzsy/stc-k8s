(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning.operations.organizations.providers', [
        'adminportal.subsystems.provisioning.operations.organizations.providers.legaldocs'
    ]);

    var ProvisioningOperationsOrganizationsProvidersModule = angular.module('adminportal.subsystems.provisioning.operations.organizations.providers');

    ProvisioningOperationsOrganizationsProvidersModule.config(function ($stateProvider) {

        // Service providers states
        $stateProvider.state('subsystems.provisioning.operations.organizations.providers', {
            abstract: true,
            url: "",
            template: "<div ui-view></div>",
            data: {
                permissions: [
                    'CMPF__OPERATIONS_SERVICEPROVIDER_READ'
                ]
            }
        }).state('subsystems.provisioning.operations.organizations.providers.list', {
            url: "/providers",
            templateUrl: "subsystems/provisioning/operations/organizations/operations.organizations.providers.html",
            controller: 'ProvisioningOperationsOrganizationsProvidersCtrl',
            resolve: {
                partners: function (CMPFService) {
                    return CMPFService.getAllPartners();
                }
            }
        }).state('subsystems.provisioning.operations.organizations.providers.providerupdate', {
            url: "/providers/:id",
            templateUrl: "subsystems/provisioning/operations/organizations/operations.organizations.providers.detail.html",
            controller: 'ProvisioningOperationsOrganizationsProviderUpdateCtrl',
            resolve: {
                partners: function (CMPFService) {
                    return CMPFService.getAllPartners(false, true, [CMPFService.SERVICE_PROVIDER_AUTH_PROFILE]);
                },
                partner: function ($stateParams, CMPFService) {
                    return CMPFService.getPartner($stateParams.id);
                },
                businessTypesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_BUSINESS_TYPES_ORGANIZATION_NAME);
                },
                settlementTypesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_SETTLEMENT_TYPES_ORGANIZATION_NAME);
                }
            }
        }).state('subsystems.provisioning.operations.organizations.providers.newprovider', {
            url: "/newprovider",
            templateUrl: "subsystems/provisioning/operations/organizations/operations.organizations.providers.detail.html",
            controller: 'ProvisioningOperationsOrganizationsProvidersNewCtrl',
            resolve: {
                partners: function (CMPFService) {
                    return CMPFService.getAllPartners(false, true, [CMPFService.SERVICE_PROVIDER_AUTH_PROFILE]);
                }
            }
        });

    });

    // Providers controllers
    ProvisioningOperationsOrganizationsProvidersModule.controller('ProvisioningOperationsOrganizationsProvidersCommonCtrl', function ($scope, $log, $q, $controller, $filter, notification, $translate, $uibModal, Upload, SERVICES_BASE, CMPFService,
                                                                                                                                      UtilService, SERVICE_PROVIDER_STATUS_TYPES, SERVICE_PROVIDER_HTTP_AUTHENTICATION_POLICIES, SERVICE_PROVIDER_BANK_ACCOUNT_TYPES,
                                                                                                                                      SERVICE_PROVIDER_LEGAL_FILE_TYPES, SERVICE_PROVIDER_BUSINESS_TYPE_TRUST_STATUSES) {
        $log.debug('ProvisioningOperationsOrganizationsProvidersCommonCtrl');

        $controller('GenericDateTimeCtrl', {$scope: $scope});

        $controller('ProvisioningOperationsOrganizationsProvidersLegalDocsRegisterLegalDocumentsCtrl', {$scope: $scope});

        $scope.SERVICE_PROVIDER_STATUS_TYPES = SERVICE_PROVIDER_STATUS_TYPES;
        $scope.SERVICE_PROVIDER_HTTP_AUTHENTICATION_POLICIES = SERVICE_PROVIDER_HTTP_AUTHENTICATION_POLICIES;
        $scope.SERVICE_PROVIDER_BANK_ACCOUNT_TYPES = SERVICE_PROVIDER_BANK_ACCOUNT_TYPES;
        $scope.SERVICE_PROVIDER_BUSINESS_TYPE_TRUST_STATUSES = SERVICE_PROVIDER_BUSINESS_TYPE_TRUST_STATUSES;

        $scope.showSuccessMessage = function () {
            notification.flash({
                type: 'success',
                text: $translate.instant('CommonLabels.OperationSuccessful')
            });

            $scope.cancel();
        };

        $scope.showParentOrganization = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.organizations.html',
                controller: 'OrganizationsModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    organizationParameter: function () {
                        return $scope.selected.organization;
                    },
                    itemName: function () {
                        return $scope.provider.name;
                    },
                    allOrganizations: function (CMPFService) {
                        return CMPFService.getAllOperators(false, true, [CMPFService.OPERATOR_PROFILE]);
                    },
                    organizationsModalTitleKey: function () {
                        return 'Subsystems.Provisioning.ServiceProviders.OrganizationModalTitle';
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            });
        };

        // Profile generation methods
        $scope.generateServiceProviderProfiles = function (serviceProviderProfile) {
            var serviceProviderProfileObj = {
                name: CMPFService.SERVICE_PROVIDER_PROFILE,
                profileDefinitionName: CMPFService.SERVICE_PROVIDER_PROFILE,
                attributes: [
                    {
                        "name": "EffectiveDate",
                        "value": serviceProviderProfile.EffectiveDate
                    },
                    {
                        "name": "ExpiryDate",
                        "value": serviceProviderProfile.ExpiryDate
                    },
                    {
                        "name": "LastUpdateTime",
                        "value": serviceProviderProfile.LastUpdateTime
                    },
                    {
                        "name": "IsBlacklisted",
                        "value": serviceProviderProfile.IsBlacklisted ? serviceProviderProfile.IsBlacklisted : false
                    },
                    // Company Address
                    {
                        "name": "Address",
                        "value": serviceProviderProfile.Address
                    },
                    {
                        "name": "POBox",
                        "value": serviceProviderProfile.POBox
                    },
                    {
                        "name": "Country",
                        "value": serviceProviderProfile.Country
                    },
                    {
                        "name": "Phone",
                        "value": serviceProviderProfile.Phone
                    },
                    {
                        "name": "Fax",
                        "value": serviceProviderProfile.Fax ? serviceProviderProfile.Fax : ''
                    },
                    {
                        "name": "WebSite",
                        "value": serviceProviderProfile.WebSite ? serviceProviderProfile.WebSite : ''
                    },
                    // Account Details
                    {
                        "name": "ProviderSuffix",
                        "value": serviceProviderProfile.ProviderSuffix
                    },
                    {
                        "name": "AdminUserAccount",
                        "value": serviceProviderProfile.AdminUserAccount
                    },
                    {
                        "name": "CRNO",
                        "value": serviceProviderProfile.CRNO
                    },
                    {
                        "name": "SiteID",
                        "value": serviceProviderProfile.SiteID
                    },
                    {
                        "name": "FTPAccount",
                        "value": serviceProviderProfile.FTPAccount
                    },
                    {
                        "name": "FTPPath",
                        "value": serviceProviderProfile.FTPPath
                    },
                    {
                        "name": "FTPName",
                        "value": serviceProviderProfile.FTPName
                    },
                    {
                        "name": "FTPPassword",
                        "value": serviceProviderProfile.FTPPassword
                    },
                    {
                        "name": "CMSCompanyLogoID",
                        "value": serviceProviderProfile.CMSCompanyLogoID
                    },
                    // Others
                    {
                        "name": "SettlementGroupID",
                        "value": serviceProviderProfile.SettlementGroupID
                    },
                    {
                        "name": "SettlementReferenceNo",
                        "value": serviceProviderProfile.SettlementReferenceNo
                    },
                    {
                        "name": "WithholdingTaxDeducted",
                        "value": serviceProviderProfile.WithholdingTaxDeducted
                    }
                ]
            };

            return serviceProviderProfileObj;
        };

        $scope.generateServiceProvideri18nProfiles = function (serviceProvideri18nProfiles) {
            var serviceProvideri18nProfileArray = [];

            angular.forEach(serviceProvideri18nProfiles, function (smsLang, key) {
                var newi18NProfile = {
                    name: CMPFService.SERVICE_PROVIDER_I18N_PROFILE,
                    profileDefinitionName: CMPFService.SERVICE_PROVIDER_I18N_PROFILE,
                    attributes: [
                        {
                            "name": "IsDefault",
                            "value": smsLang.IsDefault ? smsLang.IsDefault : false
                        },
                        {
                            "name": "Language",
                            "value": smsLang.Language
                        },
                        {
                            "name": "Name",
                            "value": smsLang.Name
                        },
                        {
                            "name": "Description",
                            "value": smsLang.Description
                        }
                    ]
                };

                this.push(newi18NProfile);
            }, serviceProvideri18nProfileArray);

            return serviceProvideri18nProfileArray;
        };

        $scope.generateServiceProviderContactsProfiles = function (serviceProviderContactsProfile) {
            var serviceProviderContactsProfileObj = {
                name: CMPFService.SERVICE_PROVIDER_CONTACTS_PROFILE,
                profileDefinitionName: CMPFService.SERVICE_PROVIDER_CONTACTS_PROFILE,
                attributes: [
                    {
                        "name": "CEOName",
                        "value": serviceProviderContactsProfile.CEOName
                    },
                    {
                        "name": "CEOMobilePhone",
                        "value": serviceProviderContactsProfile.CEOMobilePhone
                    },
                    {
                        "name": "CEOFixedPhone",
                        "value": serviceProviderContactsProfile.CEOFixedPhone ? serviceProviderContactsProfile.CEOFixedPhone : ''
                    },
                    {
                        "name": "CEOEmail",
                        "value": serviceProviderContactsProfile.CEOEmail
                    },
                    {
                        "name": "AccContactName",
                        "value": serviceProviderContactsProfile.AccContactName
                    },
                    {
                        "name": "AccContactMobilePhone",
                        "value": serviceProviderContactsProfile.AccContactMobilePhone
                    },
                    {
                        "name": "AccContactFixedPhone",
                        "value": serviceProviderContactsProfile.AccContactFixedPhone ? serviceProviderContactsProfile.AccContactFixedPhone : ''
                    },
                    {
                        "name": "AccContactEmail",
                        "value": serviceProviderContactsProfile.AccContactEmail
                    },
                    {
                        "name": "TechContactName",
                        "value": serviceProviderContactsProfile.TechContactName
                    },
                    {
                        "name": "TechContactPhone",
                        "value": serviceProviderContactsProfile.TechContactPhone
                    },
                    {
                        "name": "TechContactEmail",
                        "value": serviceProviderContactsProfile.TechContactEmail
                    },
                    {
                        "name": "AltContactName",
                        "value": serviceProviderContactsProfile.AltContactName
                    },
                    {
                        "name": "AltContactPhone",
                        "value": serviceProviderContactsProfile.AltContactPhone
                    },
                    {
                        "name": "AltContactEmail",
                        "value": serviceProviderContactsProfile.AltContactEmail
                    }
                ]
            };

            return serviceProviderContactsProfileObj;
        };

        $scope.generateServiceProviderAuthProfiles = function (serviceProviderAuthProfile) {
            var serviceProviderAuthProfileObj = {
                name: CMPFService.SERVICE_PROVIDER_AUTH_PROFILE,
                profileDefinitionName: CMPFService.SERVICE_PROVIDER_AUTH_PROFILE,
                attributes: [
                    {
                        "name": "HTTPAuthenticationType",
                        "value": serviceProviderAuthProfile.HTTPAuthenticationType
                    },
                    {
                        "name": "HTTPUsername",
                        "value": serviceProviderAuthProfile.HTTPUsername
                    },
                    {
                        "name": "HTTPPassword",
                        "value": serviceProviderAuthProfile.HTTPPassword
                    },
                    {
                        "name": "HTTPSourceIP",
                        "value": serviceProviderAuthProfile.HTTPSourceIP ? serviceProviderAuthProfile.HTTPSourceIP : ''
                    }
                ]
            };

            return serviceProviderAuthProfileObj;
        };

        $scope.generateServiceProviderBankAccountProfiles = function (serviceProviderBankAccountProfile) {
            var serviceProviderBankAccountProfileObj = {
                name: CMPFService.SERVICE_PROVIDER_BANK_ACCOUNT_PROFILE,
                profileDefinitionName: CMPFService.SERVICE_PROVIDER_BANK_ACCOUNT_PROFILE,
                attributes: [
                    {
                        "name": "BankAccountName",
                        "value": serviceProviderBankAccountProfile.BankAccountName
                    },
                    {
                        "name": "BankName",
                        "value": serviceProviderBankAccountProfile.BankName
                    },
                    {
                        "name": "Location",
                        "value": serviceProviderBankAccountProfile.Location
                    },
                    {
                        "name": "AuthorizedPersonMobilePhone",
                        "value": serviceProviderBankAccountProfile.AuthorizedPersonMobilePhone
                    },
                    {
                        "name": "BankAccountType",
                        "value": serviceProviderBankAccountProfile.BankAccountType
                    },
                    {
                        "name": "Country",
                        "value": serviceProviderBankAccountProfile.Country
                    },
                    {
                        "name": "BankAccountNumber",
                        "value": serviceProviderBankAccountProfile.BankAccountNumber
                    },
                    {
                        "name": "AuthorizedPersonName",
                        "value": serviceProviderBankAccountProfile.AuthorizedPersonName
                    },
                    {
                        "name": "SupplierID",
                        "value": serviceProviderBankAccountProfile.SupplierID ? serviceProviderBankAccountProfile.SupplierID : ''
                    }
                ]
            };
            return serviceProviderBankAccountProfileObj;
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
                            "value": providerBusinessTypeProfile.TrustedStatus
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

        $scope.generateServiceProviderLegalDocsProfilesForCMPF = function (serviceProviderLegalDocsProfile) {
            var serviceProviderLegalDocsProfileObj = {
                name: CMPFService.SERVICE_PROVIDER_LEGAL_DOCS_PROFILE,
                profileDefinitionName: CMPFService.SERVICE_PROVIDER_LEGAL_DOCS_PROFILE,
                attributes: [
                    {
                        "name": "CMSPOACopyID",
                        "value": serviceProviderLegalDocsProfile.CMSPOACopyID
                    },
                    {
                        "name": "POACopyValidFrom",
                        "value": serviceProviderLegalDocsProfile.POACopyValidFrom
                    },
                    {
                        "name": "POACopyValidTo",
                        "value": serviceProviderLegalDocsProfile.POACopyValidTo
                    },

                    {
                        "name": "CMSMOCILicenseID",
                        "value": serviceProviderLegalDocsProfile.CMSMOCILicenseID
                    },
                    {
                        "name": "MOCILicenseValidFrom",
                        "value": serviceProviderLegalDocsProfile.MOCILicenseValidFrom
                    },
                    {
                        "name": "MOCILicenseValidTo",
                        "value": serviceProviderLegalDocsProfile.MOCILicenseValidTo
                    },

                    {
                        "name": "CMSCompanyProfileID",
                        "value": serviceProviderLegalDocsProfile.CMSCompanyProfileID
                    },
                    {
                        "name": "CompanyProfileValidFrom",
                        "value": serviceProviderLegalDocsProfile.CompanyProfileValidFrom
                    },
                    {
                        "name": "CompanyProfileValidTo",
                        "value": serviceProviderLegalDocsProfile.CompanyProfileValidTo
                    },

                    {
                        "name": "CMSCORID",
                        "value": serviceProviderLegalDocsProfile.CMSCORID
                    },
                    {
                        "name": "CORValidFrom",
                        "value": serviceProviderLegalDocsProfile.CORValidFrom
                    },
                    {
                        "name": "CORValidTo",
                        "value": serviceProviderLegalDocsProfile.CORValidTo
                    },

                    {
                        "name": "CMSCITCLicenseID",
                        "value": serviceProviderLegalDocsProfile.CMSCITCLicenseID
                    },
                    {
                        "name": "CITCLicenseValidFrom",
                        "value": serviceProviderLegalDocsProfile.CITCLicenseValidFrom
                    },
                    {
                        "name": "CITCLicenseValidTo",
                        "value": serviceProviderLegalDocsProfile.CITCLicenseValidTo
                    }
                ]
            };
            return serviceProviderLegalDocsProfileObj;
        };

        $scope.generateServiceProviderRegistrationProfiles = function (serviceProviderRegistrationProfile) {
            var serviceProviderRegistrationProfileObj = {
                name: CMPFService.SERVICE_PROVIDER_REGISTRATION_PROFILE,
                profileDefinitionName: CMPFService.SERVICE_PROVIDER_REGISTRATION_PROFILE,
                attributes: [
                    {
                        "name": "ApplicantName",
                        "value": serviceProviderRegistrationProfile.ApplicantName
                    },
                    {
                        "name": "Position",
                        "value": serviceProviderRegistrationProfile.Position
                    },
                    {
                        "name": "IsEmailVerified",
                        "value": serviceProviderRegistrationProfile.IsEmailVerified ? serviceProviderRegistrationProfile.IsEmailVerified : false
                    },
                    {
                        "name": "IsMobilePhoneVerified",
                        "value": serviceProviderRegistrationProfile.IsMobilePhoneVerified ? serviceProviderRegistrationProfile.IsMobilePhoneVerified : false
                    },
                    {
                        "name": "Email",
                        "value": serviceProviderRegistrationProfile.Email
                    },
                    {
                        "name": "MobilePhone",
                        "value": serviceProviderRegistrationProfile.MobilePhone
                    },
                    {
                        "name": "IsLegalAgreementAccepted",
                        "value": serviceProviderRegistrationProfile.IsLegalAgreementAccepted ? serviceProviderRegistrationProfile.IsLegalAgreementAccepted : false
                    },
                    {
                        "name": "RegistrationDate",
                        "value": serviceProviderRegistrationProfile.RegistrationDate
                    }
                ]
            };
            return serviceProviderRegistrationProfileObj;
        };

        $scope.cancel = function () {
            $scope.go('subsystems.provisioning.operations.organizations.providers.list');
        };
    });

    ProvisioningOperationsOrganizationsProvidersModule.controller('ProvisioningOperationsOrganizationsProvidersCtrl', function ($rootScope, $scope, $log, $state, $uibModal, $filter, $translate, notification, NgTableParams,
                                                                                                                                NgTableService, AuthorizationService, DateTimeConstants, Restangular, CMPFService,
                                                                                                                                DEFAULT_REST_QUERY_LIMIT, SessionService, WorkflowsService, partners) {
        $log.debug('ProvisioningOperationsOrganizationsProvidersCtrl');

        var sessionOrganization = SessionService.getSessionOrganization();
        var username = SessionService.getUsername();

        $scope.stateFilter = 'ALL';
        $scope.stateFilterChange = function (state) {
            if (state !== 'ALL') {
                if (state === 'WAITING') {
                    $scope.partners = [];

                    CMPFService.getAllOrganizations(false, true, [CMPFService.OPERATOR_PROFILE]).then(function (organizations) {
                        var organizationList = Restangular.stripRestangular(organizations).organizations;
                        organizationList = $filter('orderBy')(organizationList, ['name']);

                        WorkflowsService.getPendingTasks(0, DEFAULT_REST_QUERY_LIMIT, 'PARTNER').then(function (waitingPartnerTasks) {
                            if (waitingPartnerTasks && waitingPartnerTasks.length > 0) {
                                _.each(waitingPartnerTasks, function (partnerTask) {
                                    if (partnerTask && partnerTask.name && (partnerTask.name.toLowerCase() === 'partner register task')) {
                                        partnerTask.objectDetail.taskObjectId = partnerTask.partnerId || _.uniqueId();
                                        partnerTask.objectDetail.parentName = CMPFService.DEFAULT_ORGANIZATION_NAME;
                                        partnerTask.objectDetail.state = 'WAITING FOR APPROVAL';
                                        partnerTask.objectDetail.taskName = partnerTask.name;

                                        var foundOrganization = _.findWhere($scope.organizationList, {id: Number(partnerTask.objectDetail.organizationId)});
                                        if (foundOrganization) {
                                            partnerTask.objectDetail.organization = foundOrganization;
                                        } else {
                                            partnerTask.objectDetail.organization = {
                                                name: 'N/A'
                                            };
                                        }

                                        $scope.partners.push(partnerTask.objectDetail);
                                    }
                                });
                            }

                            $scope.tableParams.page(1);
                            $scope.tableParams.reload();
                        });
                    });
                } else {
                    $scope.partners = _.where($scope.originalPartners, {state: state});
                }
            } else {
                $scope.partners = angular.copy($scope.originalPartners);
            }

            $scope.tableParams.page(1);
            $scope.tableParams.reload();
        };

        // Task details modal window.
        $scope.showTaskDetails = function (partner) {
            partner.rowSelected = true;

            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'partials/modal/empty.modal.html',
                controller: function ($scope, $controller, $uibModalInstance, allOrganizations, taskDetail) {
                    $controller('WorkflowsOperationsTasksDetailPartnerCtrl', {
                        $scope: $scope,
                        allOrganizations: allOrganizations,
                        taskDetail: taskDetail
                    });

                    $scope.isModal = true;
                    $scope.modalTitle = partner.taskName;
                    $scope.templateUrl = 'workflows/operations/operations.tasks.partners.detail.html';

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
                            partnerTask: {
                                objectDetail: partner
                            }
                        };
                    }
                }
            });

            modalInstance.result.then(function () {
                partner.rowSelected = false;
            }, function () {
                partner.rowSelected = false;
            });
        };

        var partners = Restangular.stripRestangular(partners);
        $scope.partners = $filter('orderBy')(partners.partners, 'id');
        $scope.originalPartners = angular.copy($scope.partners);

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'id',
                    headerKey: 'Subsystems.Provisioning.ServiceProviders.Id'
                },
                {
                    fieldName: 'name',
                    headerKey: 'Subsystems.Provisioning.ServiceProviders.Name'
                },
                {
                    fieldName: 'parentName',
                    headerKey: 'Subsystems.Provisioning.ServiceProviders.ParentOrganization'
                },
                {
                    fieldName: 'description',
                    headerKey: 'Subsystems.Provisioning.ServiceProviders.Description'
                },
                {
                    fieldName: 'orgType',
                    headerKey: 'Subsystems.Provisioning.ServiceProviders.Type'
                },
                {
                    fieldName: 'state',
                    headerKey: 'Subsystems.Provisioning.ServiceProviders.State'
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
            total: 0,
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.partners);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.partners;
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

        $scope.remove = function (partner) {
            partner.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                partner.rowSelected = false;

                CMPFService.deletePartner(partner).then(function (response) {
                    $log.debug('Removed. Response: ', response);

                    if (response && response.errorCode) {
                        CMPFService.showApiError(response);
                    } else {
                        var deletedListItem = _.findWhere($scope.partners, {id: partner.id});
                        $scope.partners = _.without($scope.partners, deletedListItem);

                        $scope.tableParams.reload();

                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });
                    }
                }, function (response) {
                    $log.debug('Cannot remove partner list. Error: ', response);

                    if (response.data && response.data.errorDescription) {
                        var message = response.data.errorDescription;
                        if (response.data.errorDescription.indexOf('SCM_SERVICE') > -1) {
                            message = $translate.instant('CommonMessages.ThereAreLinkedServices');
                        } else if (response.data.errorDescription.indexOf('SCM_OFFER') > -1) {
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
            }, function () {
                partner.rowSelected = false;
            });
        };

        $scope.updatePartnerStateByMobilyUser = function (partner, newState) {
            partner.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: function ($scope, $uibModalInstance, $translate, $controller, $sce) {
                    var message = '';
                    if (newState === 'SUSPENDED') {
                        message = $translate.instant('Subsystems.Provisioning.ServiceProviders.Messages.SuspendConfirmationMessage');
                    } else if (newState === 'ACTIVE') {
                        message = $translate.instant('Subsystems.Provisioning.ServiceProviders.Messages.ActivateConfirmationMessage');
                    } else if (newState === 'INACTIVE') {
                        message = $translate.instant('Subsystems.Provisioning.ServiceProviders.Messages.InactivateConfirmationMessage');
                    } else if (newState === 'HIDDEN') {
                        message = $translate.instant('Subsystems.Provisioning.ServiceProviders.Messages.HideConfirmationMessage');
                    } else if (newState === 'UNHIDDEN') {
                        message = $translate.instant('Subsystems.Provisioning.ServiceProviders.Messages.UnhideConfirmationMessage');
                        newState = 'ACTIVE';
                    }

                    message = message + ' [' + partner.name + ']';
                    $scope.confirmationMessage = $sce.trustAsHtml(message);

                    $controller('ConfirmationModalInstanceCtrl', {
                        $scope: $scope,
                        $uibModalInstance: $uibModalInstance
                    });
                },
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Change state of partner:', partner.name);

                CMPFService.getPartner(partner.id).then(function (partnerResponse) {
                    partnerResponse = Restangular.stripRestangular(partnerResponse);

                    // Changed values
                    partnerResponse.state = newState;

                    CMPFService.checkEntityAuditProfile(partnerResponse.profiles);

                    // Workflows special partner object
                    var partnerItem = {
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
                        "partnerDetail": partnerResponse
                    };

                    $log.debug('Trying to update partner: ', partnerItem);

                    // Partner update method of the flow service.
                    WorkflowsService.updatePartner(partnerItem).then(function (response) {
                        if (response && response.code === 2001) {
                            notification.flash({
                                type: 'success',
                                text: $translate.instant('Subsystems.Provisioning.ServiceProviders.Messages.PartnerUpdateFlowStartedSuccessful' + ($rootScope.isAdminUser ? 'ForAdmin' : ''))
                            });

                            $state.transitionTo($state.current, {}, {reload: true, inherit: true, notify: true});
                        }
                    }, function (response) {
                        $log.error('Cannot call the first time partner update flow service. Error: ', response);

                        notification({
                            type: 'warning',
                            text: $translate.instant('Subsystems.Provisioning.ServiceProviders.Messages.PartnerUpdateFlowError')
                        });
                    });
                });

                partner.rowSelected = false;
            }, function () {
                partner.rowSelected = false;
            });
        };

        $scope.showProvidedServices = function (partner) {
            partner.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/organizations/operations.organizations.operators.modal.services.html',
                controller: 'ProvisioningOperationsOrganizationsServicesModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    organizationName: function () {
                        return partner.name;
                    },
                    servicesOfPartner: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllServicesByOrganizationId(partner.id);
                    },
                    modalTitleKey: function () {
                        return 'Subsystems.Provisioning.ServiceProviders.ServicesModalTitle';
                    }
                }
            });

            modalInstance.result.then(function () {
                partner.rowSelected = false;
            }, function () {
                partner.rowSelected = false;
            });
        };

        $scope.showProviderContentMetadatas = function (partner) {
            partner.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/organizations/operations.organizations.operators.modal.contentmetadatas.html',
                controller: 'ProvisioningOperationsOrganizationsContentMetadatasModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    organizationName: function () {
                        return partner.name;
                    },
                    services: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllServices(true);
                    },
                    contentMetadatasOfPartner: function (ContentManagementService, DEFAULT_REST_QUERY_LIMIT) {
                        var filter = {
                            orgId: partner.id,
                            page: 0,
                            size: DEFAULT_REST_QUERY_LIMIT
                        };

                        return ContentManagementService.getContentMetadatas(filter);
                    },
                    modalTitleKey: function () {
                        return 'Subsystems.Provisioning.ServiceProviders.ContentMetadatasModalTitle';
                    }
                }
            });

            modalInstance.result.then(function () {
                partner.rowSelected = false;
            }, function () {
                partner.rowSelected = false;
            });
        };

        $scope.showProvidedOffers = function (partner) {
            partner.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/organizations/operations.organizations.operators.modal.offers.html',
                controller: 'ProvisioningOperationsOrganizationsOffersModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    organizationName: function () {
                        return partner.name;
                    },
                    offersOfPartner: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllOffersByOrganizationId(partner.id);
                    },
                    modalTitleKey: function () {
                        return 'Subsystems.Provisioning.ServiceProviders.OffersModalTitle';
                    }
                }
            });

            modalInstance.result.then(function () {
                partner.rowSelected = false;
            }, function () {
                partner.rowSelected = false;
            });
        };
    });

    ProvisioningOperationsOrganizationsProvidersModule.controller('ProvisioningOperationsOrganizationsProvidersNewCtrl', function ($scope, $controller, $state, $log, $q, $filter, $translate, notification, Restangular,
                                                                                                                                   SessionService, CMPFService, ContentManagementService, partners) {
        $log.debug('ProvisioningOperationsOrganizationsProvidersNewCtrl');

        $controller('ProvisioningOperationsOrganizationsProvidersCommonCtrl', {$scope: $scope});

        $scope.dateHolder.startDate = null;
        $scope.dateHolder.endDate = null;

        var partnerList = Restangular.stripRestangular(partners).partners;
        $scope.partnerList = $filter('orderBy')(partnerList, 'id');
        _.each($scope.partnerList, function (partner) {
            var foundServiceProviderAuthProfile = _.findWhere(partner.profiles, {name: CMPFService.SERVICE_PROVIDER_AUTH_PROFILE});
            if (foundServiceProviderAuthProfile) {
                var foundServiceProviderAuthProfileSystemId = _.findWhere(foundServiceProviderAuthProfile.attributes, {name: 'HTTPUsername'});
                if (foundServiceProviderAuthProfileSystemId) {
                    partner.HTTPUsername = foundServiceProviderAuthProfileSystemId.value;
                }
            }
        });

        $scope.provider = {
            name: '',
            description: '',
            state: 'ACTIVE',
            // Profiles
            serviceProviderProfile: {},
            serviceProvideri18nProfiles: [
                {
                    Language: 'EN',
                    Name: '',
                    Description: ''
                },
                {
                    Language: 'AR',
                    Name: '',
                    Description: ''
                }
            ],
            serviceProviderContactsProfile: {},
            serviceProviderAuthProfile: {
                HTTPAuthenticationType: 'USRID+PWD'
            },
            serviceProviderRegistrationProfile: {
                RegistrationDate: new Date()
            },
            serviceProviderLegalDocsProfile: {},
            serviceProviderBankAccountProfile: {
                BankAccountType: 'IBAN'
            }
        };

        $scope.selected = {};

        $scope.save = function (provider) {
            $log.debug('Trying to save... Parent:', $scope.selected.organization);

            var providerItem = {
                name: provider.name,
                description: provider.description,
                state: provider.state,
                parentId: $scope.selected.organization.id,
                profiles: []
            };

            // Start/End Dates, Company Address, Account Details
            if ($scope.dateHolder.startDate) {
                provider.serviceProviderProfile.EffectiveDate = $filter('date')($scope.dateHolder.startDate, 'yyyy-MM-dd') + 'T00:00:00';
            } else {
                provider.serviceProviderProfile.EffectiveDate = '';
            }
            provider.serviceProviderProfile.ExpiryDate = $filter('date')($scope.dateHolder.endDate, 'yyyy-MM-dd') + 'T00:00:00';

            var companyLogo;
            // CMSCompanyLogoID
            if (provider.serviceProviderProfile.companyLogo && provider.serviceProviderProfile.companyLogo.name) {
                provider.serviceProviderProfile.CMSCompanyLogoID = UtilService.generateObjectId();
                companyLogo = provider.serviceProviderProfile.companyLogo;
            }
            // Set the suffix as partner name.
            provider.serviceProviderProfile.ProviderSuffix = provider.name;
            provider.serviceProviderProfile.LastUpdateTime = $filter('date')(new Date(), 'yyyy-MM-dd') + 'T00:00:00';
            var serviceProviderProfiles = $scope.generateServiceProviderProfiles(provider.serviceProviderProfile);
            providerItem.profiles = providerItem.profiles.concat(serviceProviderProfiles);

            // UI Details
            var serviceProvideri18nProfiles = $scope.generateServiceProvideri18nProfiles(provider.serviceProvideri18nProfiles);
            providerItem.profiles = providerItem.profiles.concat(serviceProvideri18nProfiles);

            // Contact Details
            var serviceProviderContactsProfiles = $scope.generateServiceProviderContactsProfiles(provider.serviceProviderContactsProfile);
            providerItem.profiles = providerItem.profiles.concat(serviceProviderContactsProfiles);

            // Bank Account Information
            var serviceProviderBankAccountProfiles = $scope.generateServiceProviderBankAccountProfiles(provider.serviceProviderBankAccountProfile);
            providerItem.profiles = providerItem.profiles.concat(serviceProviderBankAccountProfiles);

            // HTTP Authentication
            var serviceProviderAuthProfiles = $scope.generateServiceProviderAuthProfiles(provider.serviceProviderAuthProfile);
            providerItem.profiles = providerItem.profiles.concat(serviceProviderAuthProfiles);

            // Registration Details
            if (provider.serviceProviderRegistrationProfile) {
                provider.serviceProviderRegistrationProfile.RegistrationDate = $filter('date')(provider.serviceProviderRegistrationProfile.RegistrationDate, 'yyyy-MM-dd') + 'T00:00:00';
                var serviceProviderRegistrationProfiles = $scope.generateServiceProviderRegistrationProfiles(provider.serviceProviderRegistrationProfile);
                providerItem.profiles = providerItem.profiles.concat(serviceProviderRegistrationProfiles);
            }

            // ProviderBusinessTypeProfile
            if ($scope.selectedBusinessTypes && $scope.selectedBusinessTypes.length > 0) {
                var providerBusinessTypeProfiles = $scope.generateServiceProviderBusinessTypeProfiles($scope.selectedBusinessTypes);
                providerItem.profiles = providerItem.profiles.concat(providerBusinessTypeProfiles);

                // ProviderSettlementTypeProfile
                _.each($scope.selectedBusinessTypes, function (selectedBusinessType) {
                    var providerSettlementTypes = $scope.generateServiceProviderSettlementTypeProfiles(selectedBusinessType.selectedSettlementTypes);
                    providerItem.profiles = providerItem.profiles.concat(providerSettlementTypes);
                });
            }

            // ProviderLegalDocsProfile
            var serviceProviderLegalDocs;
            if ($scope.businessTypeLegalFiles && $scope.businessTypeLegalFiles.list.length > 0) {
                serviceProviderLegalDocs = $scope.prepareLegalFileList($scope.businessTypeLegalFiles.list);
                var serviceProviderLegalDocsProfile = $scope.generateServiceProviderLegalDocsProfilesForCMPF(serviceProviderLegalDocs);
                providerItem.profiles = providerItem.profiles.concat(serviceProviderLegalDocsProfile);
            }

            // EntityAuditProfile
            var currentTimestamp = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');
            providerItem.profiles.push({
                "name": CMPFService.ENTITY_AUDIT_PROFILE,
                "profileDefinitionName": CMPFService.ENTITY_AUDIT_PROFILE,
                "attributes": [
                    {
                        "name": "CreatedBy",
                        "value": SessionService.getUsername()
                    },
                    {
                        "name": "CreatedOn",
                        "value": currentTimestamp
                    },
                    {
                        "name": "CreateApprovedBy",
                        "value": SessionService.getUsername()
                    },
                    {
                        "name": "CreateApprovedOn",
                        "value": currentTimestamp
                    }
                ]
            });

            CMPFService.createPartner([providerItem]).then(function (response) {
                if (response && response.errorCode) {
                    CMPFService.showApiError(response);
                } else {
                    $log.debug('Save Success. Response: ', response);

                    var promises = [];

                    // Upload files with the generated content ids.
                    if (companyLogo && companyLogo.name) {
                        promises.push(ContentManagementService.uploadFile(companyLogo, companyLogo.name, provider.serviceProviderProfile.CMSCompanyLogoID));
                    }
                    _.each(serviceProviderLegalDocs, function (attr, name) {
                        if (name.indexOf('_FileAttachment') > -1) {
                            if (attr && attr.name) {
                                var contentId = serviceProviderLegalDocs[name.split('_FileAttachment')[0]];

                                promises.push(ContentManagementService.uploadFile(attr, attr.name, contentId));
                            }
                        }
                    });

                    $q.all(promises).then(function () {
                        $scope.showSuccessMessage();
                    });
                }
            }, function (response) {
                $log.debug('Cannot save new provider. Error: ', response);

                if (response.data.errorCode === 5025801 && response.data.errorDescription.indexOf('Duplicate entry')) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.CouldNotCreateNewOperatorAlreadyDefined')
                    });
                } else {
                    CMPFService.showApiError(response);
                }
            });
        };
    });

    ProvisioningOperationsOrganizationsProvidersModule.controller('ProvisioningOperationsOrganizationsProviderUpdateCtrl', function ($rootScope, $scope, $controller, $log, $q, $filter, $timeout, $translate, notification, Restangular, DateTimeConstants, CMPFService, FileDownloadService,
                                                                                                                                     UtilService, WorkflowsService, ContentManagementService, ReportingExportService, SessionService, partners, partner, businessTypesOrganization,
                                                                                                                                     settlementTypesOrganization, SERVICE_PROVIDER_LEGAL_FILE_TYPES) {
        $log.debug('ProvisioningOperationsOrganizationsProviderUpdateCtrl');

        $scope.provider = Restangular.stripRestangular(partner);

        $controller('ProvisioningOperationsOrganizationsProvidersCommonCtrl', {$scope: $scope});

        var sessionOrganization = SessionService.getSessionOrganization();
        var username = SessionService.getUsername();

        var partnerList = Restangular.stripRestangular(partners).partners;
        $scope.partnerList = $filter('orderBy')(partnerList, 'id');
        _.each($scope.partnerList, function (partner) {
            var foundServiceProviderAuthProfile = _.findWhere(partner.profiles, {name: CMPFService.SERVICE_PROVIDER_AUTH_PROFILE});
            if (foundServiceProviderAuthProfile) {
                var foundServiceProviderAuthProfileSystemId = _.findWhere(foundServiceProviderAuthProfile.attributes, {name: 'HTTPUsername'});
                if (foundServiceProviderAuthProfileSystemId) {
                    partner.HTTPUsername = foundServiceProviderAuthProfileSystemId.value;
                }
            }
        });

        // ServiceProviderProfile
        var serviceProviderProfiles = CMPFService.getProfileAttributes($scope.provider.profiles, CMPFService.SERVICE_PROVIDER_PROFILE);
        if (serviceProviderProfiles.length > 0) {
            $scope.provider.serviceProviderProfile = angular.copy(serviceProviderProfiles[0]);
            $scope.dateHolder.startDate = ($scope.provider.serviceProviderProfile.EffectiveDate ? new Date($filter('date')($scope.provider.serviceProviderProfile.EffectiveDate, 'yyyy-MM-dd\'T\'HH:mm:ss' + DateTimeConstants.OFFSET_WITH_COLON)) : '');
            $scope.dateHolder.endDate = new Date($filter('date')($scope.provider.serviceProviderProfile.ExpiryDate, 'yyyy-MM-dd\'T\'HH:mm:ss' + DateTimeConstants.OFFSET_WITH_COLON));

            // Get the CMSCompanyLogo by id value.
            $scope.provider.serviceProviderProfile.companyLogo = {name: undefined};
            if ($scope.provider.serviceProviderProfile.CMSCompanyLogoID) {
                var srcUrl = ContentManagementService.generateFilePath($scope.provider.serviceProviderProfile.CMSCompanyLogoID);
                FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                    $scope.provider.serviceProviderProfile.companyLogo = blob;
                    if (blob) {
                        $scope.provider.serviceProviderProfile.companyLogo.name = fileName;
                    }
                    $scope.providerOriginal = angular.copy($scope.provider);
                });
            }
        }

        // Provideri18nProfile
        var serviceProvideri18nProfiles = CMPFService.getProfileAttributes($scope.provider.profiles, CMPFService.SERVICE_PROVIDER_I18N_PROFILE);
        $scope.provider.serviceProvideri18nProfiles = [];
        if (serviceProvideri18nProfiles.length > 0) {
            var serviceProvideri18nProfilesEn = _.findWhere(serviceProvideri18nProfiles, {Language: 'EN'});
            if (serviceProvideri18nProfilesEn) {
                $scope.provider.serviceProvideri18nProfiles.push(serviceProvideri18nProfilesEn);
            } else {
                $scope.provider.serviceProvideri18nProfiles.push({
                    Language: 'EN',
                    Name: '',
                    Description: '',
                    IsDefault: false
                });
            }

            var serviceProvideri18nProfilesAr = _.findWhere(serviceProvideri18nProfiles, {Language: 'AR'});
            if (serviceProvideri18nProfilesAr) {
                $scope.provider.serviceProvideri18nProfiles.push(serviceProvideri18nProfilesAr);
            } else {
                $scope.provider.serviceProvideri18nProfiles.push({
                    Language: 'AR',
                    Name: '',
                    Description: '',
                    IsDefault: false
                });
            }
        } else {
            $scope.provider.serviceProvideri18nProfiles = [
                {
                    Language: 'EN',
                    Name: '',
                    Description: ''
                },
                {
                    Language: 'AR',
                    Name: '',
                    Description: ''
                }
            ];
        }

        // ProviderContactsProfile
        var serviceProviderContactsProfiles = CMPFService.getProfileAttributes($scope.provider.profiles, CMPFService.SERVICE_PROVIDER_CONTACTS_PROFILE);
        if (serviceProviderContactsProfiles.length > 0) {
            $scope.provider.serviceProviderContactsProfile = angular.copy(serviceProviderContactsProfiles[0]);
        }

        // ProviderBankAccountProfile
        var serviceProviderBankAccountProfiles = CMPFService.getProfileAttributes($scope.provider.profiles, CMPFService.SERVICE_PROVIDER_BANK_ACCOUNT_PROFILE);
        if (serviceProviderBankAccountProfiles.length > 0) {
            $scope.provider.serviceProviderBankAccountProfile = angular.copy(serviceProviderBankAccountProfiles[0]);
            $scope.provider.serviceProviderBankAccountProfile.SupplierID = Number($scope.provider.serviceProviderBankAccountProfile.SupplierID);
        }

        // ProviderAuthProfile
        var serviceProviderAuthProfiles = CMPFService.getProfileAttributes($scope.provider.profiles, CMPFService.SERVICE_PROVIDER_AUTH_PROFILE);
        if (serviceProviderAuthProfiles.length > 0) {
            $scope.provider.serviceProviderAuthProfile = angular.copy(serviceProviderAuthProfiles[0]);
        }

        // ProviderRegistrationProfile
        var serviceProviderRegistrationProfiles = CMPFService.getProfileAttributes($scope.provider.profiles, CMPFService.SERVICE_PROVIDER_REGISTRATION_PROFILE);
        if (serviceProviderRegistrationProfiles.length > 0) {
            $scope.provider.serviceProviderRegistrationProfile = angular.copy(serviceProviderRegistrationProfiles[0]);
            $scope.provider.serviceProviderRegistrationProfile.RegistrationDate = new Date($filter('date')($scope.provider.serviceProviderRegistrationProfile.RegistrationDate, 'yyyy-MM-dd\'T\'HH:mm:ss' + DateTimeConstants.OFFSET_WITH_COLON));
        }

        var businessTypesOrganizationItem = businessTypesOrganization.organizations[0];
        var businessTypes = CMPFService.getBusinessTypes(businessTypesOrganizationItem);

        // ProviderBusinessTypeProfile
        var providerBusinessTypeProfiles = CMPFService.getProfileAttributes($scope.provider.profiles, CMPFService.SERVICE_PROVIDER_BUSINESS_TYPE_PROFILE);

        var settlementTypesOrganizationItem = settlementTypesOrganization.organizations[0];
        var settlementTypes = CMPFService.getSettlementTypes(settlementTypesOrganizationItem);

        // ProviderSettlementTypeProfile
        var providerSettlementTypeProfiles = CMPFService.getProfileAttributes($scope.provider.profiles, CMPFService.SERVICE_PROVIDER_SETTLEMENT_TYPE_PROFILE);

        if (providerBusinessTypeProfiles.length > 0) {
            _.each(providerBusinessTypeProfiles, function (providerBusinessTypeProfile) {
                var selectedBusinessType = angular.copy(_.findWhere(businessTypes, {profileId: Number(providerBusinessTypeProfile.BusinessTypeID)}));
                if (selectedBusinessType) {
                    selectedBusinessType.TrustedStatus = providerBusinessTypeProfile.TrustedStatus;

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

                    $scope.selectedBusinessTypes.push(selectedBusinessType);
                }
            });

            $scope.rearrangeSelectedBusinessTypes();
        }

        // ProviderLegalDocsProfile
        var providerLegalDocsProfiles = CMPFService.getProfileAttributes($scope.provider.profiles, CMPFService.SERVICE_PROVIDER_LEGAL_DOCS_PROFILE);
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
                                $scope.businessTypeLegalFilesListOriginal = angular.copy($scope.businessTypeLegalFiles.list);
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

        // EntityAuditProfile
        var entityAuditProfiles = CMPFService.getProfileAttributes($scope.provider.profiles, CMPFService.ENTITY_AUDIT_PROFILE);
        if (entityAuditProfiles.length > 0) {
            $scope.provider.entityAuditProfile = angular.copy(entityAuditProfiles[0]);
        }

        $timeout(function () {
            $scope.dateHolderOriginal = angular.copy($scope.dateHolder);
            $scope.providerOriginal = angular.copy($scope.provider);
            $scope.selectedBusinessTypesOriginal = angular.copy($scope.selectedBusinessTypes);
            $scope.businessTypeLegalFilesListOriginal = angular.copy($scope.businessTypeLegalFiles.list);
        }, 1000);
        $scope.isNotChanged = function () {
            return angular.equals($scope.dateHolder, $scope.dateHolderOriginal) &&
                angular.equals($scope.provider, $scope.providerOriginal) &&
                angular.equals($scope.selectedBusinessTypes, $scope.selectedBusinessTypesOriginal) &&
                angular.equals($scope.businessTypeLegalFilesListOriginal, $scope.businessTypeLegalFiles.list);
        };

        $scope.save = function (provider) {
            var providerItem = {
                id: $scope.providerOriginal.id,
                name: $scope.providerOriginal.name,
                type: $scope.providerOriginal.type,
                orgType: $scope.providerOriginal.orgType,
                parentId: $scope.providerOriginal.parentId,
                parentName: $scope.providerOriginal.parentName,
                state: provider.state,
                description: provider.description,
                // Profiles
                profiles: ($scope.providerOriginal.profiles === undefined ? [] : $scope.providerOriginal.profiles)
            };

            // ServiceProviderProfile
            var companyLogo;
            if (provider.serviceProviderProfile) {
                // CMSCompanyLogoID
                companyLogo = provider.serviceProviderProfile.companyLogo;
                if (!companyLogo || (companyLogo && !companyLogo.name)) {
                    provider.serviceProviderProfile.CMSCompanyLogoID = '';
                } else if (companyLogo instanceof File && !provider.serviceProviderProfile.CMSCompanyLogoID) {
                    provider.serviceProviderProfile.CMSCompanyLogoID = UtilService.generateObjectId();
                }

                var originalServiceProviderProfile = CMPFService.findProfileByName(providerItem.profiles, CMPFService.SERVICE_PROVIDER_PROFILE);
                var updatedServiceProviderProfile = JSON.parse(angular.toJson(provider.serviceProviderProfile));

                // Start/End Dates
                if ($scope.dateHolder.startDate) {
                    updatedServiceProviderProfile.EffectiveDate = $filter('date')($scope.dateHolder.startDate, 'yyyy-MM-dd') + 'T00:00:00';
                } else {
                    updatedServiceProviderProfile.EffectiveDate = '';
                }
                updatedServiceProviderProfile.ExpiryDate = $filter('date')($scope.dateHolder.endDate, 'yyyy-MM-dd') + 'T00:00:00';
                updatedServiceProviderProfile.LastUpdateTime = $filter('date')(new Date(), 'yyyy-MM-dd') + 'T00:00:00';

                // Set the suffix as partner name.
                updatedServiceProviderProfile.ProviderSuffix = $scope.providerOriginal.name;
                updatedServiceProviderProfile.AdminUserAccount = updatedServiceProviderProfile.AdminUserAccount ? updatedServiceProviderProfile.AdminUserAccount : 'N/A';

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
            if (provider.serviceProvideri18nProfiles && provider.serviceProvideri18nProfiles.length > 0) {
                var originalServiceProvideri18nProfiles = CMPFService.findProfilesByName(providerItem.profiles, CMPFService.SERVICE_PROVIDER_I18N_PROFILE);
                _.each(provider.serviceProvideri18nProfiles, function (updatedServiceProvideri18nProfile) {
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
            if (provider.serviceProviderContactsProfile) {
                var originalServiceProviderContactsProfile = CMPFService.findProfileByName(providerItem.profiles, CMPFService.SERVICE_PROVIDER_CONTACTS_PROFILE);
                var updatedServiceProviderContactsProfile = JSON.parse(angular.toJson(provider.serviceProviderContactsProfile));
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

            // ServiceProviderAuthProfile
            if (provider.serviceProviderAuthProfile) {
                var originalServiceProviderAuthProfile = CMPFService.findProfileByName(providerItem.profiles, CMPFService.SERVICE_PROVIDER_AUTH_PROFILE);
                var updatedServiceProviderAuthProfile = JSON.parse(angular.toJson(provider.serviceProviderAuthProfile));
                var serviceProviderAuthProfileArray = CMPFService.prepareProfile(updatedServiceProviderAuthProfile, originalServiceProviderAuthProfile);
                // ---
                if (originalServiceProviderAuthProfile) {
                    originalServiceProviderAuthProfile.attributes = serviceProviderAuthProfileArray;
                } else {
                    var serviceProviderAuthProfile = {
                        name: CMPFService.SERVICE_PROVIDER_AUTH_PROFILE,
                        profileDefinitionName: CMPFService.SERVICE_PROVIDER_AUTH_PROFILE,
                        attributes: serviceProviderAuthProfileArray
                    };

                    providerItem.profiles.push(serviceProviderAuthProfile);
                }
            }

            // ServiceProviderBankAccountProfiles
            if (provider.serviceProviderBankAccountProfile) {
                var originalServiceProviderBankAccountProfile = CMPFService.findProfileByName(providerItem.profiles, CMPFService.SERVICE_PROVIDER_BANK_ACCOUNT_PROFILE);
                var updatedServiceProviderBankAccountProfile = JSON.parse(angular.toJson(provider.serviceProviderBankAccountProfile));
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
            if ($scope.selectedBusinessTypes && $scope.selectedBusinessTypes.length > 0) {
                var providerBusinessTypeProfiles = $scope.generateServiceProviderBusinessTypeProfiles($scope.selectedBusinessTypes);
                var originalProviderBusinessTypeProfiles = _.where($scope.providerOriginal.profiles, {profileDefinitionName: CMPFService.SERVICE_PROVIDER_BUSINESS_TYPE_PROFILE});
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
                _.each($scope.selectedBusinessTypes, function (selectedBusinessType) {
                    var providerSettlementTypes = $scope.generateServiceProviderSettlementTypeProfiles(selectedBusinessType.selectedSettlementTypes);
                    allProviderSettlementTypes = allProviderSettlementTypes.concat(providerSettlementTypes);
                });
                var originalProviderSettlementTypeProfiles = _.where($scope.providerOriginal.profiles, {profileDefinitionName: CMPFService.SERVICE_PROVIDER_SETTLEMENT_TYPE_PROFILE});
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
            if ($scope.businessTypeLegalFiles && $scope.businessTypeLegalFiles.list.length > 0) {
                var originalProviderLegalDocsProfile = CMPFService.findProfileByName(providerItem.profiles, CMPFService.SERVICE_PROVIDER_LEGAL_DOCS_PROFILE);

                serviceProviderLegalDocs = $scope.prepareLegalFileList($scope.businessTypeLegalFiles.list, originalProviderLegalDocsProfile ? originalProviderLegalDocsProfile.id : null);
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
            var providerItemPayload = {
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
                "partnerDetail": providerItem
            };

            $log.debug('Trying update service provider: ', providerItemPayload);

            // Call the first time partner update method of the flow service.
            WorkflowsService.updatePartner(providerItemPayload).then(function (response) {
                if (response && response.code === 2001) {

                    var promises = [];

                    // Upload files with the generated content ids.
                    if (companyLogo && companyLogo.name && (companyLogo instanceof File)) {
                        promises.push(ContentManagementService.uploadFile(companyLogo, companyLogo.name, provider.serviceProviderProfile.CMSCompanyLogoID));
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
                        notification.flash({
                            type: 'success',
                            text: $translate.instant('Subsystems.Provisioning.ServiceProviders.Messages.PartnerUpdateFlowStartedSuccessful' + ($rootScope.isAdminUser ? 'ForAdmin' : ''))
                        });

                        $scope.cancel();
                    });
                } else {
                    notification({
                        type: 'warning',
                        text: $translate.instant('Subsystems.Provisioning.ServiceProviders.Messages.PartnerUpdateFlowError')
                    });
                }
            }, function (response) {
                $log.error('Cannot call the first time partner update flow service. Error: ', response);

                notification({
                    type: 'warning',
                    text: $translate.instant('Subsystems.Provisioning.ServiceProviders.Messages.PartnerUpdateFlowError')
                });
            });

            /*
            CMPFService.updatePartner(providerItem).then(function (response) {
                if (response && response.errorCode) {
                    CMPFService.showApiError(response);
                } else {
                    $log.debug('Update Success. Response: ', response);

                    // Upload files with the generated content ids.
                    if (companyLogo && companyLogo.name && (companyLogo instanceof File)) {
                        ContentManagementService.uploadFile(companyLogo, companyLogo.name, provider.serviceProviderProfile.CMSCompanyLogoID);
                    }
                    _.each(serviceProviderLegalDocs, function (attr, name) {
                        if (name.indexOf('_FileAttachment') > -1) {
                            if (attr && attr.name && (attr instanceof File)) {
                                var contentId = serviceProviderLegalDocs[name.split('_FileAttachment')[0]];

                                ContentManagementService.uploadFile(attr, attr.name, contentId);
                            }
                        }
                    });

                    $scope.showSuccessMessage();
                }
            }, function (response) {
                $log.debug('Cannot save new provider. Error: ', response);

                CMPFService.showApiError(response);
            });
            */
        };
    });

})();