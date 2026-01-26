(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning.operations.organizations.providers', []);

    var ProvisioningOperationsOrganizationsProvidersModule = angular.module('adminportal.subsystems.provisioning.operations.organizations.providers');

    ProvisioningOperationsOrganizationsProvidersModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.provisioning.operations.organizations.providers', {
            abstract: true,
            url: "",
            template: "<div ui-view></div>"

        }).state('subsystems.provisioning.operations.organizations.providers.list', {
            url: "/providers",
            templateUrl: "subsystems/provisioning/operations/organizations/operations.organizations.providers.html",
            controller: 'ProvisioningOperationsOrganizationsProvidersCtrl',
            resolve: {
                partners: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getPartners(0, DEFAULT_REST_QUERY_LIMIT);
                }
            }
        }).state('subsystems.provisioning.operations.organizations.providers.update', {
            url: "/providers/:id",
            templateUrl: "subsystems/provisioning/operations/organizations/operations.organizations.providers.detail.html",
            controller: 'ProvisioningOperationsOrganizationsProviderUpdateCtrl',
            resolve: {
                partner: function ($stateParams, CMPFService) {
                    return CMPFService.getPartner($stateParams.id);
                },
                categoryList: function (ContentManagementService,DEFAULT_REST_QUERY_LIMIT) {
                    return ContentManagementService.getContentCategoriesRBT(0,DEFAULT_REST_QUERY_LIMIT, "name")
                },
                subCategoryList: function(ContentManagementService,DEFAULT_REST_QUERY_LIMIT) {
                    return ContentManagementService.getSubcategoriesRBT(0,DEFAULT_REST_QUERY_LIMIT, "name")
                },
            }
        }).state('subsystems.provisioning.operations.organizations.providers.new', {
            url: "/newprovider",
            templateUrl: "subsystems/provisioning/operations/organizations/operations.organizations.providers.detail.html",
            controller: 'ProvisioningOperationsOrganizationsProvidersNewCtrl'
        });

    });

    ProvisioningOperationsOrganizationsProvidersModule.controller('ProvisioningOperationsOrganizationsProvidersCommonCtrl', function ($scope, $log, $q, notification, $translate, $filter, $controller, $uibModal, CMPFService, ContentManagementService) {
        $log.debug('ProvisioningOperationsOrganizationsProvidersCommonCtrl');

        $controller('GenericDateTimeCtrl', {$scope: $scope});

        $scope.openOrganizations = function (provider) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.organizations.html',
                controller: 'OrganizationsModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    organizationParameter: function () {
                        return angular.copy($scope.selectedOrganization);
                    },
                    itemName: function () {
                        return provider.name;
                    },
                    allOrganizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllOperators(0,  DEFAULT_REST_QUERY_LIMIT,false,true);
                    },
                    organizationsModalTitleKey: function () {
                        return 'Subsystems.Provisioning.ServiceProviders.OrganizationModalTitle';
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selectedOrganization = selectedItem.organization;
            }, function () {
            });
        };

        $scope.generateServiceProviderLegacyIDProfiles = function(){
            return  {
                name: CMPFService.SERVICE_PROVIDER_LEGACY_ID_PROFILE,
                profileDefinitionName: CMPFService.SERVICE_PROVIDER_LEGACY_ID_PROFILE,
                attributes: [
                    {
                        "name": "LegacyID",
                        "value": ""
                    },
                    {
                        "name": "LegacyStatus",
                        "value": "NORMAL"
                    }]};
        };

        $scope.generateServiceProviderCommonProfiles = function (serviceProviderCommonProfile) {
            var serviceProviderCommonProfileObj = {
                name: CMPFService.SERVICE_PROVIDER_COMMON_PROFILE,
                profileDefinitionName: CMPFService.SERVICE_PROVIDER_COMMON_PROFILE,
                attributes: [
                    {
                        "name": "CompanyName",
                        "value": serviceProviderCommonProfile.PrimaryContactName
                    },
                    {
                        "name": "CompanyLogo",
                        "value": serviceProviderCommonProfile.CompanyLogo
                    },
                    {
                        "name": "MaxAllowedTonesCount",
                        "value": serviceProviderCommonProfile.MaxAllowedTonesCount
                    },
                    {
                        "name": "StartDate",
                        "value": $scope.dateHolder.startDate? $filter('date')($scope.dateHolder.startDate, 'yyyy-MM-dd') + 'T00:00:00':""
                    },
                    {
                        "name": "EndDate",
                        "value":$scope.dateHolder.endDate? $filter('date')($scope.dateHolder.endDate, 'yyyy-MM-dd') + 'T00:00:00':""
                    }
                ]
            };

            return serviceProviderCommonProfileObj;
        };

        $scope.generateServiceProviderAddressProfiles = function (serviceProviderAddressProfile) {
            var serviceProviderAddressProfileObj = {
                name: CMPFService.SERVICE_PROVIDER_ADDRESS_PROFILE,
                profileDefinitionName: CMPFService.SERVICE_PROVIDER_ADDRESS_PROFILE,
                attributes: [
                    {
                        "name": "CompanyAddress",
                        "value": serviceProviderAddressProfile.CompanyAddress
                    },
                    {
                        "name": "CompanyCountry",
                        "value": serviceProviderAddressProfile.CompanyCountry
                    },
                    {
                        "name": "CompanyFax",
                        "value": serviceProviderAddressProfile.CompanyFax
                    },
                    {
                        "name": "CompanyPhone",
                        "value": serviceProviderAddressProfile.CompanyPhone
                    },
                    {
                        "name": "CompanyPostalCode",
                        "value": serviceProviderAddressProfile.CompanyPostalCode
                    },
                    {
                        "name": "CompanyWeb",
                        "value": serviceProviderAddressProfile.CompanyWeb
                    }
                ]
            };

            return serviceProviderAddressProfileObj;
        };

        $scope.generateServiceProviderContactsProfiles = function (serviceProviderContactsProfile) {
            var serviceProviderContactsProfileObj = {
                name: CMPFService.SERVICE_PROVIDER_CONTACTS_PROFILE,
                profileDefinitionName: CMPFService.SERVICE_PROVIDER_CONTACTS_PROFILE,
                attributes: [
                    {
                        "name": "PrimaryContactName",
                        "value": serviceProviderContactsProfile.PrimaryContactName
                    },
                    {
                        "name": "PrimaryContactMobilePhone",
                        "value": serviceProviderContactsProfile.PrimaryContactMobilePhone
                    },
                    {
                        "name": "PrimaryContactFixedPhone",
                        "value": serviceProviderContactsProfile.PrimaryContactFixedPhone
                    },
                    {
                        "name": "PrimaryContactEmail",
                        "value": serviceProviderContactsProfile.PrimaryContactEmail
                    },
                    {
                        "name": "AlternativeContactName",
                        "value": serviceProviderContactsProfile.AlternativeContactName
                    },
                    {
                        "name": "AlternativeContactMobilePhone",
                        "value": serviceProviderContactsProfile.AlternativeContactMobilePhone
                    },
                    {
                        "name": "AlternativeContactFixedPhone",
                        "value": serviceProviderContactsProfile.AlternativeContactFixedPhone
                    },
                    {
                        "name": "AlternativeContactEmail",
                        "value": serviceProviderContactsProfile.AlternativeContactEmail
                    }
                ]
            };

            return serviceProviderContactsProfileObj;
        };

        $scope.generateServiceProviderAllowedCategoryProfiles = function (serviceProviderAllowedCategoryProfiles) {
            var serviceProviderAllowedCategoryProfileArray = [];

            _.each(serviceProviderAllowedCategoryProfiles, function (allowedCategoryProfile) {
                var serviceProviderAllowedCategoryProfileObj = {
                    name: CMPFService.SERVICE_PROVIDER_ALLOWED_CATEGORY_PROFILE,
                    profileDefinitionName: CMPFService.SERVICE_PROVIDER_ALLOWED_CATEGORY_PROFILE,
                    attributes: [
                        {
                            "name": "MainCategoryID",
                            "value": allowedCategoryProfile.MainCategoryID
                        },
                        {
                            "name": "SubCategoryID",
                            "value": allowedCategoryProfile.SubCategoryID
                        }
                    ]
                };

                serviceProviderAllowedCategoryProfileArray.push(serviceProviderAllowedCategoryProfileObj);
            });

            return serviceProviderAllowedCategoryProfileArray;
        };

        $scope.showCategorySelectionModal = function (provider) {

            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/organizations/operations.organizations.provider.modal.category.html',
                controller:'ProvisioningOperationsOrganizationsProvidersCategoryModalInstanceCtrl',
                resolve: {
                    provider:function(){
                        return $scope.provider;
                    }
                }
            });

            modalInstance.result.then(function (categoryProfile) {

                provider.serviceProviderAllowedCategoryProfiles = provider.serviceProviderAllowedCategoryProfiles || [];

                var categoryItem = {
                    MainCategoryID: categoryProfile.categoryId,
                    categoryName : categoryProfile.categoryName,
                    SubCategoryID: categoryProfile.subCategoryId,
                    subCategoryName : categoryProfile.subCategoryName
                }
                provider.serviceProviderAllowedCategoryProfiles.push(categoryItem);
                // enforce uniqueness by SubCategoryID
                provider.serviceProviderAllowedCategoryProfiles = _.uniq(
                    provider.serviceProviderAllowedCategoryProfiles,
                    function(item) { return item.SubCategoryID; }
                );
                $scope.provider.serviceProviderAllowedCategoryProfiles = $filter('orderBy')(provider.serviceProviderAllowedCategoryProfiles, ['categoryName','subCategoryName']);

            });
        };

        $scope.removeAllowedCategoryProfile = function (provider, categoryProfile) {

            if (!provider.id) {
                $scope.removeCategoryProfile(provider, categoryProfile);
            } else {
                // Query if there are any tones assigned to this category for this provider
                ContentManagementService.searchTonesBySubCategoryAndOrganization(provider.id, categoryProfile.SubCategoryID).then(function (response) {
                    if (response && response.errorCode) {
                        CMPFService.showApiError(response);
                    } else {
                        if (response.totalCount > 0) {

                            var modalInstance = $uibModal.open({
                                templateUrl: 'partials/modal/modal.alert.html',
                                controller: function ($scope, $state, $uibModalInstance, $translate, $controller, $sce, response, categoryProfile) {
                                    $scope.alertTitle = $translate.instant('CommonLabels.Warning');
                                    var toneLabel = response.totalCount === 1 ? 'tone' : 'tones';

                                    var message = $translate.instant('Subsystems.Provisioning.ServiceProviders.Messages.CouldNotRemoveCategoryProfile', {
                                        categoryName: '[' + categoryProfile.categoryName + '] - [' + categoryProfile.subCategoryName + ']',
                                        totalCount: response.totalCount,
                                        toneLabel: toneLabel
                                    });

                                    $scope.alertMessage = $sce.trustAsHtml(message);

                                    $controller('AlertModalInstanceCtrl', {
                                        $scope: $scope,
                                        $uibModalInstance: $uibModalInstance
                                    });
                                },
                                resolve: {
                                    categoryProfile: function () {
                                        return categoryProfile;
                                    },
                                    response: function () {
                                        return response;
                                    }
                                }
                            });

                        } else {
                            // Remove the category profile
                            $scope.removeCategoryProfile(provider, categoryProfile);
                        }
                    }
                }, function (error) {
                    $log.debug('Cannot remove category profile. Error: ', error);
                    CMPFService.showApiError(error);
                });
            }

        };

        $scope.removeCategoryProfile = function (provider, categoryProfile) {
            var index = _.indexOf(provider.serviceProviderAllowedCategoryProfiles, categoryProfile);
            if (index !== -1) {
                var deletedItem = provider.serviceProviderAllowedCategoryProfiles[index];
                provider.serviceProviderAllowedCategoryProfiles = _.without(provider.serviceProviderAllowedCategoryProfiles, deletedItem);
            }
        };

        $scope.getCategoryString = function (categoryProfile) {
            var resultStr = 'Category: ' + categoryProfile.categoryName + ', SubCategory: ' + categoryProfile.subCategoryName ;
            return resultStr;
        };

        $scope.showSuccessMessage = function () {
            notification.flash({
                type: 'success',
                text: $translate.instant('CommonLabels.OperationSuccessful')
            });

            $scope.cancel();
        };

        $scope.cancel = function () {
            $scope.go('subsystems.provisioning.operations.organizations.providers.list');
        };
    });


    ProvisioningOperationsOrganizationsProvidersModule.controller('ProvisioningOperationsOrganizationsProvidersCategoryModalInstanceCtrl', function ($rootScope, $window, $uibModalInstance, $q, $scope, $log, $state, $timeout, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                                                     Restangular, WorkflowsService, ContentManagementService, CMS_ACCESS_CHANNELS, provider) {
        $log.debug('ProvisioningOperationsOrganizationsProvidersCategoryModalInstanceCtrl');

        $scope.providerName = provider.name;
        $scope.accessChannels = CMS_ACCESS_CHANNELS.find(function (channel) { return channel.label === 'GENERAL'}).value

        $scope.categoryProfile = {
            categoryId: null,
            categoryName: "",
            subCategoryId:null,
            subCategoryName:""
        };

        $scope.$watch('categoryProfile.category', function (newVal, oldVal) {

            if(!newVal && oldVal){
                $scope.categoryProfile.subCategory = null;
                $scope.categoryProfile.subCategoryId = null;
            }

            if (newVal && !angular.equals(newVal, oldVal)) {
                $scope.categoryProfile.categoryId = newVal.id;
                $scope.categoryProfile.categoryName = newVal.name;
                $scope.categoryProfile.subCategoryName = "";
                $scope.categoryProfile.subCategory = null;

            }

        });

        $scope.$watch('categoryProfile.subCategory', function (newVal, oldVal) {
            if(!newVal && oldVal){
                $scope.categoryProfile.subCategoryId = null;
            }
            if (newVal && !angular.equals(newVal, oldVal)) {
                $scope.categoryProfile.subCategoryId = newVal.id;
                $scope.categoryProfile.subCategoryName = newVal.name;
            }
        });

        $scope.save = function (categoryProfile) {
            $uibModalInstance.close(categoryProfile);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.checkIfAllowed = function (contentSubcategoryListItem) {
            var item = _.findWhere(provider.serviceProviderAllowedCategoryProfiles,{SubCategoryID: contentSubcategoryListItem.id});
            return !!item;
        }

        $scope.searchCategories = _.throttle(function (text) {
            $scope.contentCategoryList = [];
            ContentManagementService.searchContentCategoriesRBT(0, 100, text, undefined, undefined, $scope.accessChannels).then(function (response) {
                $scope.contentCategoryList = $scope.contentCategoryList.concat(response ? response.items : []);
                $scope.contentCategoryList = $filter('orderBy')($scope.contentCategoryList, ['name']);
            });

        }, 500);

        $scope.searchSubcategories = _.throttle(function (text, categoryId) {
            $scope.contentSubcategoryList = [];

            var promise = ContentManagementService.searchSubcategoriesRBTFiltered(0, 100, text, categoryId);

            promise.then(function(response) {
                $scope.contentSubcategoryList = response ? response.items : [];
                $scope.contentSubcategoryList = $filter('orderBy')($scope.contentSubcategoryList, ['name']);
            });

        }, 500);

    });

    ProvisioningOperationsOrganizationsProvidersModule.controller('ProvisioningOperationsOrganizationsProvidersCtrl', function ($scope, $state, $log, $filter, $uibModal, $translate, notification, Restangular,
                                                                                                                                NgTableParams, NgTableService, CMPFService, partners) {
        $log.debug('ProvisioningOperationsOrganizationsProvidersCtrl');

        $scope.partners = Restangular.stripRestangular(partners);
        $scope.partners.partners = $filter('orderBy')($scope.partners.partners, 'id');

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
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.partners.partners);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.partners.partners;
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

        $scope.viewProvidedServices = function (serviceProvider) {
            $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/organizations/operations.organizations.operators.modal.services.html',
                controller: 'ProvisioningOperationsOrganizationsServicesModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    organizationName: function () {
                        return serviceProvider.name;
                    },
                    servicesOfPartner: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getServicesOfPartner(serviceProvider.id, 0, DEFAULT_REST_QUERY_LIMIT);
                    },
                    modalTitleKey: function () {
                        return 'Subsystems.Provisioning.ServiceProviders.ServicesModalTitle';
                    }
                }
            });
        };

        $scope.remove = function (partner) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                CMPFService.deletePartner(partner).then(function (response) {
                    $log.debug('Removed. Response: ', response);

                    if (response && response.errorCode) {
                        CMPFService.showApiError(response);
                    } else {
                        var deletedListItem = _.findWhere($scope.partners.partners, {id: partner.id});
                        $scope.partners.partners = _.without($scope.partners.partners, deletedListItem);

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
            });
        };
    });

    ProvisioningOperationsOrganizationsProvidersModule.controller('ProvisioningOperationsOrganizationsProvidersNewCtrl', function ($scope, $controller, $state, $log, $q, $uibModal,  $filter, $translate , notification, CMPFService,
                                                                                                                                   STATUS_TYPES,UtilService, ContentManagementService) {
        $log.debug('ProvisioningOperationsOrganizationsProvidersNewCtrl');

        $controller('ProvisioningOperationsOrganizationsProvidersCommonCtrl', {$scope: $scope});

        $scope.STATUS_TYPES = STATUS_TYPES;

        $scope.dateHolder.startDate = null;
        $scope.dateHolder.endDate = null;

        $scope.provider = {
            name: '',
            description: '',
            state: STATUS_TYPES[0].name,
            // Profiles
            serviceProviderAddressProfile: {},
            serviceProviderContactsProfile: {},
            serviceProviderCommonProfile: {},
            serviceProviderAllowedCategoryProfiles:[]
        };

        $scope.selectedOrganization = {};

        $scope.save = function (provider) {
            $log.debug('Trying to save... Parent:', $scope.selectedOrganization);

            var providerItem = {
                name: provider.name,
                description: provider.description,
                state: provider.state,
                parentId: $scope.selectedOrganization.id,
                profiles: []
            };


            // Legacy Details
            var serviceProviderLegacyIDProfiles = $scope.generateServiceProviderLegacyIDProfiles();
            providerItem.profiles = providerItem.profiles.concat(serviceProviderLegacyIDProfiles);

            // Address Details
            var serviceProviderAddressProfiles = $scope.generateServiceProviderAddressProfiles(provider.serviceProviderAddressProfile);
            providerItem.profiles = providerItem.profiles.concat(serviceProviderAddressProfiles);

            // Common Details
            var logo;
            if (provider.serviceProviderCommonProfile.Logo && provider.serviceProviderCommonProfile.Logo.name) {
                provider.serviceProviderCommonProfile.CompanyLogo = UtilService.generateObjectId();
                logo = provider.serviceProviderCommonProfile.Logo;
            }
            var serviceProviderCommonProfiles = $scope.generateServiceProviderCommonProfiles(provider.serviceProviderCommonProfile);
            providerItem.profiles = providerItem.profiles.concat(serviceProviderCommonProfiles);

            //ProviderAllowedCategoryProfile
            var serviceProviderAllowedCategoryProfiles = $scope.generateServiceProviderAllowedCategoryProfiles(provider.serviceProviderAllowedCategoryProfiles);
            providerItem.profiles = providerItem.profiles.concat(serviceProviderAllowedCategoryProfiles);

            // Contact Details
            var serviceProviderContactsProfiles = $scope.generateServiceProviderContactsProfiles(provider.serviceProviderContactsProfile);
            providerItem.profiles = providerItem.profiles.concat(serviceProviderContactsProfiles);

            CMPFService.createPartner([providerItem]).then(function (response) {
                $log.debug('Save Success. Response: ', response);

                if (response && response.errorCode) {
                    CMPFService.showApiError(response);
                } else {
                    var promises = [];
                    // Upload files with the generated content ids.
                    if (logo && logo.name) {
                        promises.push(ContentManagementService.uploadFile(logo, logo.name, provider.serviceProviderCommonProfile.CompanyLogo));
                    }

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

    ProvisioningOperationsOrganizationsProvidersModule.controller('ProvisioningOperationsOrganizationsProviderUpdateCtrl', function ($scope, $controller, $log, $q, Restangular, $translate,$filter, $timeout, notification, DateTimeConstants, CMPFService, ReportingExportService,
                                                                                                                                     STATUS_TYPES, partner, UtilService, DEFAULT_REST_QUERY_LIMIT, ContentManagementService, FileDownloadService, categoryList, subCategoryList) {
        $log.debug('ProvisioningOperationsOrganizationsProviderUpdateCtrl');
        $scope.STATUS_TYPES = STATUS_TYPES;
        $scope.provider = Restangular.stripRestangular(partner);
        $scope.categoryList = filterCategoryByChannels(categoryList);
        $scope.subCategoryList =  filterCategoryByChannels(subCategoryList);

        function filterCategoryByChannels(categoryList) {
            categoryList = Restangular.stripRestangular(categoryList);

            var categories =[];

            _.each(categoryList.items, function (category) {

                if(category.accessChannels.indexOf('IVR')==-1 && category.accessChannels.indexOf('USSD')==-1) {
                    categories.push(category);
                }
            });

            return $filter('orderBy')( categories, 'name');
        }

        $controller('ProvisioningOperationsOrganizationsProvidersCommonCtrl', {$scope: $scope});

        // ServiceProviderCommonProfile
        var serviceProviderCommonProfiles = CMPFService.getProfileAttributes($scope.provider.profiles, CMPFService.SERVICE_PROVIDER_COMMON_PROFILE);

        if (serviceProviderCommonProfiles.length > 0) {
            $scope.provider.serviceProviderCommonProfile = angular.copy(serviceProviderCommonProfiles[0]);
            $scope.dateHolder.startDate = ($scope.provider.serviceProviderCommonProfile.StartDate ? new Date($filter('date')($scope.provider.serviceProviderCommonProfile.StartDate, 'yyyy-MM-dd\'T\'HH:mm:ss' + DateTimeConstants.OFFSET_WITH_COLON)) : '');
            $scope.dateHolder.endDate = new Date($filter('date')($scope.provider.serviceProviderCommonProfile.EndDate, 'yyyy-MM-dd\'T\'HH:mm:ss' + DateTimeConstants.OFFSET_WITH_COLON));

            // Get the CompanyLogo by id value.
            $scope.provider.serviceProviderCommonProfile.Logo = {name: undefined};

            if ($scope.provider.serviceProviderCommonProfile.CompanyLogo) {
                var srcUrl = ContentManagementService.generateFilePath($scope.provider.serviceProviderCommonProfile.CompanyLogo);
                FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                    $scope.provider.serviceProviderCommonProfile.Logo = blob;
                    if (blob) {
                        $scope.provider.serviceProviderCommonProfile.Logo.name = fileName;
                    }
                    $scope.providerOriginal = angular.copy($scope.provider);
                });
            }
        }

        //ProviderAllowedCategoryProfile
        var serviceProviderAllowedCategoryProfiles = CMPFService.getProfileTextAttributes($scope.provider.profiles, CMPFService.SERVICE_PROVIDER_ALLOWED_CATEGORY_PROFILE);
        if (serviceProviderAllowedCategoryProfiles.length > 0) {
            _.each(serviceProviderAllowedCategoryProfiles, function (categoryProfile) {

                var category = _.findWhere($scope.categoryList, {id: categoryProfile.MainCategoryID.toString()});
                categoryProfile.categoryName = (category ? category.name : 'N/A');

                var subCategory = _.findWhere($scope.subCategoryList, {id: categoryProfile.SubCategoryID.toString()});
                categoryProfile.subCategoryName = (subCategory ? subCategory.name : 'N/A');

            });
            serviceProviderAllowedCategoryProfiles = $filter('orderBy')(serviceProviderAllowedCategoryProfiles, ['categoryName','subCategoryName']);
            $scope.provider.serviceProviderAllowedCategoryProfiles = angular.copy(serviceProviderAllowedCategoryProfiles);

        }

        // ProviderContactsProfile
        var serviceProviderContactsProfiles = CMPFService.getProfileAttributes($scope.provider.profiles, CMPFService.SERVICE_PROVIDER_CONTACTS_PROFILE);
        if (serviceProviderContactsProfiles.length > 0) {
            $scope.provider.serviceProviderContactsProfile = angular.copy(serviceProviderContactsProfiles[0]);
        }

        //ProviderAddressProfile
        var serviceProviderAddressProfiles = CMPFService.getProfileAttributes($scope.provider.profiles, CMPFService.SERVICE_PROVIDER_ADDRESS_PROFILE);
        if (serviceProviderAddressProfiles.length > 0) {
            $scope.provider.serviceProviderAddressProfile = angular.copy(serviceProviderAddressProfiles[0]);
        }

        // ProviderLegacyIDProfile
        var serviceProviderLegacyIDProfiles = CMPFService.getProfileAttributes($scope.provider.profiles, CMPFService.SERVICE_PROVIDER_LEGACY_ID_PROFILE);
        if (serviceProviderLegacyIDProfiles.length > 0) {
            $scope.provider.serviceProviderLegacyIDProfile = angular.copy(serviceProviderLegacyIDProfiles[0]);
        }

        $scope.dateHolderOriginal = angular.copy($scope.dateHolder);
        $scope.providerOriginal = angular.copy($scope.provider);

        $scope.isNotChanged = function () {
            return angular.equals($scope.dateHolder, $scope.dateHolderOriginal) &&
                angular.equals($scope.provider, $scope.providerOriginal) ;
        };


        $scope.save = function (provider) {
            $log.debug('Trying Update provider: ', provider);

            var providerItem = {
                type: $scope.providerOriginal.type,
                id: $scope.providerOriginal.id,
                name: $scope.providerOriginal.name,
                orgType: $scope.providerOriginal.orgType,
                parentId: $scope.providerOriginal.parentId,
                parentName: $scope.providerOriginal.parentName,
                description: provider.description,
                state: provider.state,
                profiles: []
            };

            // ProviderCommonProfile
            var logo;
            if (provider.serviceProviderCommonProfile) {
                // CompanyLogo
                logo = provider.serviceProviderCommonProfile.Logo;
                if (!logo || (logo && !logo.name)) {
                    provider.serviceProviderCommonProfile.CompanyLogo = '';
                } else if (logo instanceof File && !provider.serviceProviderCommonProfile.CompanyLogo) {
                    provider.serviceProviderCommonProfile.CompanyLogo = UtilService.generateObjectId();
                }

                var originalServiceProviderCommonProfile = CMPFService.findProfileByName($scope.providerOriginal.profiles, CMPFService.SERVICE_PROVIDER_COMMON_PROFILE);
                var updatedServiceProviderCommonProfile = JSON.parse(angular.toJson(provider.serviceProviderCommonProfile));

                // Start/End Dates
                if ($scope.dateHolder.startDate) {
                    updatedServiceProviderCommonProfile.StartDate = $filter('date')($scope.dateHolder.startDate, 'yyyy-MM-dd') + 'T00:00:00';
                } else {
                    updatedServiceProviderCommonProfile.StartDate = '';
                }
                if ($scope.dateHolder.endDate) {
                    updatedServiceProviderCommonProfile.EndDate = $filter('date')($scope.dateHolder.endDate, 'yyyy-MM-dd') + 'T00:00:00';
                } else {
                    updatedServiceProviderCommonProfile.EndDate = '';
                }

                delete updatedServiceProviderCommonProfile.Logo;
                var serviceProviderCommonProfileArray = CMPFService.prepareProfile(updatedServiceProviderCommonProfile, originalServiceProviderCommonProfile);

                if (originalServiceProviderCommonProfile) {
                    originalServiceProviderCommonProfile.attributes = serviceProviderCommonProfileArray;
                    providerItem.profiles.push(originalServiceProviderCommonProfile);
                } else {
                    var serviceProviderCommonProfile = {
                        name: CMPFService.SERVICE_PROVIDER_COMMON_PROFILE,
                        profileDefinitionName: CMPFService.SERVICE_PROVIDER_COMMON_PROFILE,
                        attributes: serviceProviderCommonProfileArray
                    };
                    providerItem.profiles.push(serviceProviderCommonProfile);
                }
            }

            // ProviderLegacyIdProfile
            if (provider.serviceProviderLegacyIDProfile) {
                var originalServiceProviderLegacyIDProfile = CMPFService.findProfileByName($scope.providerOriginal.profiles, CMPFService.SERVICE_PROVIDER_LEGACY_ID_PROFILE);
                var updatedServiceProviderLegacyIDProfile = JSON.parse(angular.toJson(provider.serviceProviderLegacyIDProfile));
                var serviceProviderLegacyIDProfileArray = CMPFService.prepareProfile(updatedServiceProviderLegacyIDProfile, originalServiceProviderLegacyIDProfile);

                if (originalServiceProviderLegacyIDProfile) {
                    originalServiceProviderLegacyIDProfile.attributes = serviceProviderLegacyIDProfileArray;
                    providerItem.profiles.push(originalServiceProviderLegacyIDProfile);
                } else {
                    var serviceProviderLegacyIDProfile = {
                        name: CMPFService.SERVICE_PROVIDER_LEGACY_ID_PROFILE,
                        profileDefinitionName: CMPFService.SERVICE_PROVIDER_LEGACY_ID_PROFILE,
                        attributes: serviceProviderLegacyIDProfileArray
                    };
                    providerItem.profiles.push(serviceProviderLegacyIDProfile);
                }
            }

            // ProviderContactsProfile
            if (provider.serviceProviderContactsProfile) {
                var originalServiceProviderContactsProfile = CMPFService.findProfileByName($scope.providerOriginal.profiles, CMPFService.SERVICE_PROVIDER_CONTACTS_PROFILE);
                var updatedServiceProviderContactsProfile = JSON.parse(angular.toJson(provider.serviceProviderContactsProfile));
                var serviceProviderContactsProfileArray = CMPFService.prepareProfile(updatedServiceProviderContactsProfile, originalServiceProviderContactsProfile);

                if (originalServiceProviderContactsProfile) {
                    originalServiceProviderContactsProfile.attributes = serviceProviderContactsProfileArray;
                    providerItem.profiles.push(originalServiceProviderContactsProfile);
                } else {
                    var serviceProviderContactsProfile = {
                        name: CMPFService.SERVICE_PROVIDER_CONTACTS_PROFILE,
                        profileDefinitionName: CMPFService.SERVICE_PROVIDER_CONTACTS_PROFILE,
                        attributes: serviceProviderContactsProfileArray
                    };
                    providerItem.profiles.push(serviceProviderContactsProfile);
                }
            }

            // ProviderAddressProfile
            if (provider.serviceProviderAddressProfile) {
                var originalServiceProviderAddressProfile = CMPFService.findProfileByName($scope.providerOriginal.profiles, CMPFService.SERVICE_PROVIDER_ADDRESS_PROFILE);
                var updatedServiceProviderAddressProfile = JSON.parse(angular.toJson(provider.serviceProviderAddressProfile));
                var serviceProviderAddressProfileArray = CMPFService.prepareProfile(updatedServiceProviderAddressProfile, originalServiceProviderAddressProfile);

                if (originalServiceProviderAddressProfile) {
                    originalServiceProviderAddressProfile.attributes = serviceProviderAddressProfileArray;
                    providerItem.profiles.push(originalServiceProviderAddressProfile);
                } else {
                    var serviceProviderAddressProfile = {
                        name: CMPFService.SERVICE_PROVIDER_ADDRESS_PROFILE,
                        profileDefinitionName: CMPFService.SERVICE_PROVIDER_ADDRESS_PROFILE,
                        attributes: serviceProviderAddressProfileArray
                    };
                    providerItem.profiles.push(serviceProviderAddressProfile);
                }
            }

            // ProviderAllowedCategoryProfile
            if (provider.serviceProviderAllowedCategoryProfiles && provider.serviceProviderAllowedCategoryProfiles.length > 0) {

                var originalServiceProviderAllowedCategoryProfiles = CMPFService.findProfilesByName($scope.providerOriginal.profiles, CMPFService.SERVICE_PROVIDER_ALLOWED_CATEGORY_PROFILE);
                _.each(provider.serviceProviderAllowedCategoryProfiles, function (updatedServiceProviderAllowedCategoryProfile) {
                    delete updatedServiceProviderAllowedCategoryProfile.categoryName;
                    delete updatedServiceProviderAllowedCategoryProfile.subCategoryName;

                    updatedServiceProviderAllowedCategoryProfile = JSON.parse(angular.toJson(updatedServiceProviderAllowedCategoryProfile));
                    var originalServiceProviderAllowedCategoryProfile = _.findWhere(originalServiceProviderAllowedCategoryProfiles, {id: updatedServiceProviderAllowedCategoryProfile.profileId});
                    var serviceProviderAllowedCategoryProfileAttrArray = CMPFService.prepareProfile(updatedServiceProviderAllowedCategoryProfile, originalServiceProviderAllowedCategoryProfile);

                    if (originalServiceProviderAllowedCategoryProfile) {
                        originalServiceProviderAllowedCategoryProfile.attributes = serviceProviderAllowedCategoryProfileAttrArray;
                        providerItem.profiles.push(originalServiceProviderAllowedCategoryProfile);
                    } else {
                        var serviceProviderAllowedCategoryProfile = {
                            name: CMPFService.SERVICE_PROVIDER_ALLOWED_CATEGORY_PROFILE,
                            profileDefinitionName: CMPFService.SERVICE_PROVIDER_ALLOWED_CATEGORY_PROFILE,
                            attributes: serviceProviderAllowedCategoryProfileAttrArray
                        };
                        providerItem.profiles.push(serviceProviderAllowedCategoryProfile);
                    }
                });
            }

            CMPFService.updatePartner(providerItem).then(function (response) {
                $log.debug('Update Success. Response: ', response);

                if (response && response.errorCode) {
                    CMPFService.showApiError(response);
                } else {
                    var promises = [];
                    // Upload files with the generated content ids.
                    if (logo && logo.name && (logo instanceof File)) {
                        promises.push(ContentManagementService.uploadFile(logo, logo.name, provider.serviceProviderCommonProfile.CompanyLogo));
                    }
                    $q.all(promises).then(function () {
                        $scope.showSuccessMessage();
                    });
                }
            }, function (response) {
                $log.debug('Cannot update provider. Error: ', response);

                CMPFService.showApiError(response);
            });
        };
    });

})();
