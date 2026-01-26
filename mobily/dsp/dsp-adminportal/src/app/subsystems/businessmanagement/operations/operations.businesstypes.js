(function () {

    'use strict';

    angular.module('adminportal.subsystems.businessmanagement.operations.businesstypes', []);

    var BusinessManagementOperationsBusinessTypesModule = angular.module('adminportal.subsystems.businessmanagement.operations.businesstypes');

    BusinessManagementOperationsBusinessTypesModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.businessmanagement.operations.businesstypes', {
            abstract: true,
            url: "/business-types",
            template: '<div ui-view></div>',
            data: {
                exportFileName: 'BusinessTypes',
                permissions: [
                    'BIZ__OPERATIONS_BUSINESSTYPE_READ'
                ]
            },
            resolve: {
                businessTypesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_BUSINESS_TYPES_ORGANIZATION_NAME);
                },
                agreementsOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_AGREEMENTS_ORGANIZATION_NAME);
                },
                channelsOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_CHANNELS_ORGANIZATION_NAME);
                },
                settlementTypesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_SETTLEMENT_TYPES_ORGANIZATION_NAME);
                },
                serviceTypesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_SERVICE_TYPES_ORGANIZATION_NAME);
                }
            }
        }).state('subsystems.businessmanagement.operations.businesstypes.list', {
            url: "",
            templateUrl: "subsystems/businessmanagement/operations/operations.businesstypes.html",
            controller: 'BusinessManagementOperationsBusinessTypesCtrl'
        }).state('subsystems.businessmanagement.operations.businesstypes.new', {
            url: "/new",
            templateUrl: "subsystems/businessmanagement/operations/operations.businesstypes.details.html",
            controller: 'BusinessManagementOperationsBusinessTypesNewCtrl'
        }).state('subsystems.businessmanagement.operations.businesstypes.update', {
            url: "/update/:id",
            templateUrl: "subsystems/businessmanagement/operations/operations.businesstypes.details.html",
            controller: 'BusinessManagementOperationsBusinessTypesUpdateCtrl'
        });

    });

    BusinessManagementOperationsBusinessTypesModule.controller('BusinessManagementOperationsBusinessTypesCommonCtrl', function ($scope, $log, $q, $state, $filter, $uibModal, notification, $translate, CMPFService, businessTypesOrganization, agreementsOrganization,
                                                                                                                                channelsOrganization, settlementTypesOrganization, serviceTypesOrganization, BUSINESS_MANAGEMENT_STATUS_TYPES, BUSINESS_MANAGEMENT_APPLICANT_SCOPES,
                                                                                                                                BUSINESS_MANAGEMENT_DOCUMENT_TYPES) {
        $log.debug('BusinessManagementOperationsBusinessTypesCommonCtrl');

        $scope.businessTypesOrganization = businessTypesOrganization.organizations[0];
        $scope.agreementsOrganization = agreementsOrganization.organizations[0];
        $scope.channelsOrganization = channelsOrganization.organizations[0];
        $scope.settlementTypesOrganization = settlementTypesOrganization.organizations[0];
        $scope.serviceTypesOrganization = serviceTypesOrganization.organizations[0];

        $scope.BUSINESS_MANAGEMENT_STATUS_TYPES = BUSINESS_MANAGEMENT_STATUS_TYPES;
        $scope.BUSINESS_MANAGEMENT_APPLICANT_SCOPES = BUSINESS_MANAGEMENT_APPLICANT_SCOPES;
        $scope.BUSINESS_MANAGEMENT_DOCUMENT_TYPES = BUSINESS_MANAGEMENT_DOCUMENT_TYPES;

        $scope.agreements = CMPFService.getAgreements($scope.agreementsOrganization);
        $scope.agreements = _.filter($scope.agreements, function (agreement) {
            return agreement.Type !== 'COMMON';
        });
        $scope.agreements = $filter('orderBy')($scope.agreements, 'profileId');

        $scope.channels = CMPFService.getChannels($scope.channelsOrganization);
        $scope.channels = $filter('orderBy')($scope.channels, 'profileId');

        $scope.updateBusinessType = function (businessTypesOrganizationOriginal, businessType, isDelete) {
            var deferred = $q.defer();

            $log.debug('Trying update default organization: ', businessTypesOrganizationOriginal, businessType);

            // Update the last update time for create first time or for update everytime.
            businessType.LastUpdateTime = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');

            var organizationItem = {
                id: businessTypesOrganizationOriginal.id,
                name: businessTypesOrganizationOriginal.name,
                type: businessTypesOrganizationOriginal.type,
                orgType: businessTypesOrganizationOriginal.orgType,
                parentId: businessTypesOrganizationOriginal.parentId,
                parentName: businessTypesOrganizationOriginal.parentName,
                state: businessTypesOrganizationOriginal.state,
                description: businessTypesOrganizationOriginal.description,
                // Profiles
                profiles: angular.copy(businessTypesOrganizationOriginal.profiles)
            };

            // Create partner type array from the selected partner types.
            businessType.PartnerType = _.map($scope.selectedPartnerTypes, function (selectedPartnerType) {
                return {value: selectedPartnerType};
            });

            // Create settlement type array from the selected settlement types.
            businessType.SettlementTypes = _.map($scope.selectedSettlementTypes, function (selectedSettlementType) {
                return {value: selectedSettlementType.profileId};
            });

            // Create service type array from the selected service types.
            businessType.ServiceTypes = _.map($scope.selectedServiceTypes, function (selectedServiceType) {
                return {value: selectedServiceType.profileId};
            });

            var originalBusinessTypeProfiles = CMPFService.findProfilesByName(organizationItem.profiles, CMPFService.ORGANIZATION_BUSINESS_TYPE_PROFILE);

            var updatedBusinessTypeProfile = JSON.parse(angular.toJson(businessType));
            var originalBusinessTypeProfile = _.findWhere(originalBusinessTypeProfiles, {id: updatedBusinessTypeProfile.profileId});

            if (isDelete) {
                organizationItem.profiles = _.without(organizationItem.profiles, originalBusinessTypeProfile);
            } else {
                var businessTypeProfileAttrArray = CMPFService.prepareProfile(updatedBusinessTypeProfile, originalBusinessTypeProfile);
                // ---
                if (originalBusinessTypeProfile) {
                    originalBusinessTypeProfile.attributes = businessTypeProfileAttrArray;
                } else {
                    var businessTypeProfile = {
                        name: CMPFService.ORGANIZATION_BUSINESS_TYPE_PROFILE,
                        profileDefinitionName: CMPFService.ORGANIZATION_BUSINESS_TYPE_PROFILE,
                        attributes: businessTypeProfileAttrArray
                    };

                    organizationItem.profiles.push(businessTypeProfile);
                }
            }

            CMPFService.updateOperator(organizationItem).then(function (response) {
                $log.debug('Update Success. Response: ', response);

                if (response && response.errorCode) {
                    deferred.reject(response)
                } else {
                    deferred.resolve(response)
                }
            }, function (response) {
                $log.debug('Cannot save the organization. Error: ', response);

                deferred.reject(response)
            });

            return deferred.promise;
        };

        // Service Types
        $scope.showServiceTypes = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/businessmanagement/operations/operations.businesstypes.servicetypes.modal.html',
                controller: 'BusinessManagementOperationsBusinessTypesServiceTypesModalCtrl',
                size: 'lg',
                resolve: {
                    serviceTypesParameter: function () {
                        return angular.copy($scope.selectedServiceTypes);
                    },
                    businessTypeNameParameter: function () {
                        return $scope.businessType.Name;
                    },
                    serviceTypesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_SERVICE_TYPES_ORGANIZATION_NAME);
                    }
                }
            });

            modalInstance.result.then(function (selectedItems) {
                $scope.selectedServiceTypes = selectedItems;
            }, function () {
            });
        };

        $scope.removeServiceType = function (serviceType) {
            var index = _.indexOf($scope.selectedServiceTypes, serviceType);
            if (index != -1) {
                $scope.selectedServiceTypes.splice(index, 1);
            }
        };

        // Settlement Types
        $scope.showSettlementTypes = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/businessmanagement/operations/operations.businesstypes.settlementtypes.modal.html',
                controller: 'BusinessManagementOperationsBusinessTypesSettlementTypesModalCtrl',
                size: 'lg',
                resolve: {
                    settlementTypesParameter: function () {
                        return angular.copy($scope.selectedSettlementTypes);
                    },
                    businessTypeNameParameter: function () {
                        return $scope.businessType.Name;
                    },
                    settlementTypesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_SETTLEMENT_TYPES_ORGANIZATION_NAME);
                    }
                }
            });

            modalInstance.result.then(function (selectedItems) {
                $scope.selectedSettlementTypes = selectedItems;
            }, function () {
            });
        };

        $scope.removeSettlementType = function (settlementType) {
            var index = _.indexOf($scope.selectedSettlementTypes, settlementType);
            if (index != -1) {
                $scope.selectedSettlementTypes.splice(index, 1);
            }
        };

        // Partner Types
        $scope.showPartnerTypes = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/businessmanagement/operations/operations.businesstypes.partnertypes.modal.html',
                controller: 'BusinessManagementOperationsBusinessTypesPartnerTypesModalCtrl',
                size: 'md',
                resolve: {
                    partnerTypesParameter: function () {
                        return angular.copy($scope.selectedPartnerTypes);
                    },
                    businessTypeNameParameter: function () {
                        return $scope.businessType.Name;
                    }
                }
            });

            modalInstance.result.then(function (selectedItems) {
                $scope.selectedPartnerTypes = selectedItems;
            }, function () {
            });
        };

        $scope.removePartnerType = function (partnerType) {
            var index = _.indexOf($scope.selectedPartnerTypes, partnerType);
            if (index != -1) {
                $scope.selectedPartnerTypes.splice(index, 1);
            }
        };

        $scope.cancel = function () {
            $state.go('subsystems.businessmanagement.operations.businesstypes.list');
        };
    });

    BusinessManagementOperationsBusinessTypesModule.controller('BusinessManagementOperationsBusinessTypesCtrl', function ($scope, $log, $controller, $state, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                          businessTypesOrganization, agreementsOrganization, channelsOrganization, settlementTypesOrganization,
                                                                                                                          serviceTypesOrganization, DateTimeConstants, CMPFService, DEFAULT_REST_QUERY_LIMIT) {
        $log.debug('BusinessManagementOperationsBusinessTypesCtrl');

        $controller('BusinessManagementOperationsBusinessTypesCommonCtrl', {
            $scope: $scope,
            businessTypesOrganization: businessTypesOrganization,
            agreementsOrganization: agreementsOrganization,
            channelsOrganization: channelsOrganization,
            settlementTypesOrganization: settlementTypesOrganization,
            serviceTypesOrganization: serviceTypesOrganization
        });

        $scope.businessTypes = CMPFService.getBusinessTypes($scope.businessTypesOrganization);
        $scope.businessTypes = $filter('orderBy')($scope.businessTypes, 'profileId');

        _.each($scope.businessTypes, function (businessType) {
            var foundAgreement = _.findWhere($scope.agreements, {profileId: Number(businessType.AgreementID)});
            if (foundAgreement) {
                businessType.Agreement = foundAgreement
            } else {
                businessType.Agreement = {
                    Name: 'N/A'
                };
            }

            var foundChannel = _.findWhere($scope.channels, {profileId: Number(businessType.ChannelID)});
            if (foundChannel) {
                businessType.Channel = foundChannel
            } else {
                businessType.Channel = {
                    Name: 'N/A'
                };
            }
        });

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'profileId',
                    headerKey: 'Subsystems.BusinessManagement.Operations.BusinessTypes.Id'
                },
                {
                    fieldName: 'Name',
                    headerKey: 'Subsystems.BusinessManagement.Operations.BusinessTypes.Name'
                },
                {
                    fieldName: 'LastUpdateTime',
                    headerKey: 'CommonLabels.LastUpdateTime',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'LegacyID',
                    headerKey: 'CommonLabels.LegacyID'
                },
                {
                    fieldName: 'Description',
                    headerKey: 'CommonLabels.Description'
                },
                {
                    fieldName: 'Status',
                    headerKey: 'CommonLabels.State'
                }
            ]
        };

        // Business type list
        $scope.businessTypeList = {
            list: $scope.businessTypes,
            tableParams: {}
        };

        $scope.businessTypeList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "profileId": 'asc'
            }
        }, {
            total: $scope.businessTypeList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.businessTypeList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.businessTypeList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Business type list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.businessTypeList.tableParams.settings().$scope.filterText = filterText;
            $scope.businessTypeList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.businessTypeList.tableParams.page(1);
            $scope.businessTypeList.tableParams.reload();
        }, 750);

        var findProjectsUsingTheBusinessType = function (allProjects, businessType) {
            var projects = [];
            _.each(allProjects, function (project) {
                var foundBusinessType = _.findWhere(project.BusinessTypes, {value: businessType.profileId.toString()});
                if (foundBusinessType) {
                    projects.push(project);
                }
            });

            return projects;
        };

        // Projects
        $scope.viewProjects = function (businessType) {
            $uibModal.open({
                templateUrl: 'subsystems/businessmanagement/operations/operations.projects.view.modal.html',
                controller: function ($scope, $uibModalInstance, projectsOrganization) {
                    $scope.pageHeaderKey = 'Subsystems.BusinessManagement.Operations.BusinessTypes.ProjectsModalTitle';
                    $scope.itemName = businessType.Name;

                    $scope.projectsOrganization = projectsOrganization.organizations[0];
                    var allProjects = CMPFService.getProjects($scope.projectsOrganization);
                    allProjects = $filter('orderBy')(allProjects, 'profileId');

                    $scope.projects = findProjectsUsingTheBusinessType(allProjects, businessType);

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
                            var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.projects);
                            var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.projects;
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

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'lg',
                resolve: {
                    projectsOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_PROJECTS_ORGANIZATION_NAME);
                    }
                }
            });
        };

        $scope.remove = function (businessType) {

            CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_PROJECTS_ORGANIZATION_NAME).then(function (response) {
                var allProjects = CMPFService.getProjects(response.organizations[0]);
                var projects = findProjectsUsingTheBusinessType(allProjects, businessType);

                if (projects && projects.length > 0) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ThereAreLinkedProjects')
                    });
                } else {
                    businessType.rowSelected = true;

                    var modalInstance = $uibModal.open({
                        templateUrl: 'partials/modal/modal.confirmation.html',
                        controller: 'ConfirmationModalInstanceCtrl',
                        size: 'sm'
                    });

                    modalInstance.result.then(function () {
                        businessType.rowSelected = false;

                        $scope.updateBusinessType($scope.businessTypesOrganization, businessType, true).then(function (response) {
                            var deletedListItem = _.findWhere($scope.businessTypeList.list, {profileId: businessType.profileId});
                            $scope.businessTypeList.list = _.without($scope.businessTypeList.list, deletedListItem);

                            $scope.businessTypeList.tableParams.reload();

                            notification({
                                type: 'success',
                                text: $translate.instant('CommonLabels.OperationSuccessful')
                            });
                        }, function (response) {
                            CMPFService.showApiError(response);
                        });
                    }, function (response) {
                        businessType.rowSelected = false;
                    });
                }
            });
        };
    });

    BusinessManagementOperationsBusinessTypesModule.controller('BusinessManagementOperationsBusinessTypesNewCtrl', function ($scope, $log, $controller, $filter, $translate, notification, CMPFService,
                                                                                                                             businessTypesOrganization, agreementsOrganization, channelsOrganization,
                                                                                                                             settlementTypesOrganization, serviceTypesOrganization) {
        $log.debug('BusinessManagementOperationsBusinessTypesNewCtrl');

        $controller('BusinessManagementOperationsBusinessTypesCommonCtrl', {
            $scope: $scope,
            businessTypesOrganization: businessTypesOrganization,
            agreementsOrganization: agreementsOrganization,
            channelsOrganization: channelsOrganization,
            settlementTypesOrganization: settlementTypesOrganization,
            serviceTypesOrganization: serviceTypesOrganization
        });

        $scope.businessType = {
            Name: '',
            Description: '',
            Status: null,
            LastUpdateTime: null,
            BadDebtDeducted: false,
            CompanyProfileDocReq: 'IRRELEVANT',
            CORDocReq: 'IRRELEVANT',
            POACopyDocReq: 'IRRELEVANT',
            CITCLicenseDocReq: 'IRRELEVANT',
            MOCILicenseDocReq: 'IRRELEVANT'
        };

        $scope.save = function (businessType) {
            $scope.updateBusinessType($scope.businessTypesOrganization, businessType).then(function (response) {
                notification.flash({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $scope.go('subsystems.businessmanagement.operations.businesstypes.list');
            }, function (response) {
                CMPFService.showApiError(response);
            });
        };
    });

    BusinessManagementOperationsBusinessTypesModule.controller('BusinessManagementOperationsBusinessTypesUpdateCtrl', function ($scope, $log, $controller, $stateParams, $filter, $translate, notification, CMPFService,
                                                                                                                                businessTypesOrganization, agreementsOrganization, channelsOrganization,
                                                                                                                                settlementTypesOrganization, serviceTypesOrganization) {
        $log.debug('BusinessManagementOperationsBusinessTypesUpdateCtrl');

        $controller('BusinessManagementOperationsBusinessTypesCommonCtrl', {
            $scope: $scope,
            businessTypesOrganization: businessTypesOrganization,
            agreementsOrganization: agreementsOrganization,
            channelsOrganization: channelsOrganization,
            settlementTypesOrganization: settlementTypesOrganization,
            serviceTypesOrganization: serviceTypesOrganization
        });

        var id = $stateParams.id;

        $scope.selectedPartnerTypes = [];
        $scope.selectedSettlementTypes = [];
        $scope.selectedServiceTypes = [];

        // BusinessTypeProfile
        var businessTypeProfiles = CMPFService.getBusinessTypes($scope.businessTypesOrganization);
        if (businessTypeProfiles.length > 0) {
            var foundBusinessType = _.findWhere(businessTypeProfiles, {"profileId": Number(id)});
            $scope.businessType = angular.copy(foundBusinessType);

            var ChannelID = Number($scope.businessType.ChannelID);
            var foundChannel = _.findWhere($scope.channels, {profileId: Number(ChannelID)});
            if (foundChannel) {
                $scope.businessType.ChannelID = angular.isNumber(ChannelID) && !isNaN(ChannelID) ? ChannelID : undefined;
            } else {
                $scope.businessType.ChannelID = null;
            }

            var AgreementID = Number($scope.businessType.AgreementID);
            var foundAgreement = _.findWhere($scope.agreements, {profileId: Number(AgreementID)});
            if (foundAgreement) {
                $scope.businessType.AgreementID = angular.isNumber(AgreementID) && !isNaN(AgreementID) ? AgreementID : undefined;
            } else {
                $scope.businessType.AgreementID = null;
            }

            _.each($scope.businessType.PartnerType, function (partnerType) {
                $scope.selectedPartnerTypes.push(partnerType.value);
            });

            var settlementTypes = CMPFService.getSettlementTypes($scope.settlementTypesOrganization);
            _.each($scope.businessType.SettlementTypes, function (settlementType) {
                var foundSettlementType = _.findWhere(settlementTypes, {profileId: Number(settlementType.value)});
                if (foundSettlementType) {
                    $scope.selectedSettlementTypes.push(foundSettlementType);
                }
            });

            var serviceTypes = CMPFService.getServiceTypes($scope.serviceTypesOrganization);
            _.each($scope.businessType.ServiceTypes, function (serviceType) {
                var foundServiceType = _.findWhere(serviceTypes, {profileId: Number(serviceType.value)});
                if (foundServiceType) {
                    $scope.selectedServiceTypes.push(foundServiceType);
                }
            });
        }

        $scope.originalBusinessType = angular.copy($scope.businessType);
        $scope.originalSelectedPartnerTypes = angular.copy($scope.selectedPartnerTypes);
        $scope.originalSelectedSettlementTypes = angular.copy($scope.selectedSettlementTypes);
        $scope.originalSelectedServiceTypes = angular.copy($scope.selectedServiceTypes);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalBusinessType, $scope.businessType) &&
                angular.equals($scope.originalSelectedPartnerTypes, $scope.selectedPartnerTypes) &&
                angular.equals($scope.originalSelectedSettlementTypes, $scope.selectedSettlementTypes) &&
                angular.equals($scope.originalSelectedServiceTypes, $scope.selectedServiceTypes);
        };

        $scope.save = function (businessType) {
            $scope.updateBusinessType($scope.businessTypesOrganization, businessType).then(function (response) {
                notification.flash({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $scope.go('subsystems.businessmanagement.operations.businesstypes.list');
            }, function (response) {
                CMPFService.showApiError(response);
            });
        };
    });

    BusinessManagementOperationsBusinessTypesModule.controller('BusinessManagementOperationsBusinessTypesServiceTypesModalCtrl', function ($scope, $uibModalInstance, $log, $filter, NgTableParams, NgTableService, Restangular,
                                                                                                                                           serviceTypesParameter, businessTypeNameParameter, serviceTypesOrganization, CMPFService) {
        $log.debug('BusinessManagementOperationsBusinessTypesServiceTypesModalCtrl');

        $scope.selectedItems = serviceTypesParameter ? serviceTypesParameter : [];

        $scope.businessTypeName = businessTypeNameParameter;

        $scope.serviceTypesOrganization = serviceTypesOrganization.organizations[0];
        $scope.serviceTypes = CMPFService.getServiceTypes($scope.serviceTypesOrganization);
        $scope.serviceTypes = $filter('orderBy')($scope.serviceTypes, 'profileId');

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
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.serviceTypes);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.serviceTypes;
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
            var serviceType = _.findWhere($scope.selectedItems, {profileId: item.profileId});
            if (!serviceType) {
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

    BusinessManagementOperationsBusinessTypesModule.controller('BusinessManagementOperationsBusinessTypesSettlementTypesModalCtrl', function ($scope, $uibModalInstance, $log, $filter, NgTableParams, NgTableService, Restangular,
                                                                                                                                              settlementTypesParameter, businessTypeNameParameter, settlementTypesOrganization, CMPFService) {
        $log.debug('BusinessManagementOperationsBusinessTypesSettlementTypesModalCtrl');

        $scope.selectedItems = settlementTypesParameter ? settlementTypesParameter : [];

        $scope.businessTypeName = businessTypeNameParameter;

        $scope.settlementTypesOrganization = settlementTypesOrganization.organizations[0];
        $scope.settlementTypes = CMPFService.getSettlementTypes($scope.settlementTypesOrganization);
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

        $scope.ok = function () {
            $uibModalInstance.close($scope.selectedItems);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });

    BusinessManagementOperationsBusinessTypesModule.controller('BusinessManagementOperationsBusinessTypesPartnerTypesModalCtrl', function ($scope, $uibModalInstance, $log, $filter, NgTableParams, NgTableService, Restangular,
                                                                                                                                           partnerTypesParameter, businessTypeNameParameter, BUSINESS_MANAGEMENT_PARTNER_TYPES) {
        $log.debug('BusinessManagementOperationsBusinessTypesPartnerTypesModalCtrl');

        $scope.selectedItems = partnerTypesParameter ? partnerTypesParameter : [];

        $scope.businessTypeName = businessTypeNameParameter;

        $scope.partnerTypes = _.map(BUSINESS_MANAGEMENT_PARTNER_TYPES, function (value) {
            return {value: value};
        });

        $scope.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "value": 'asc'
            }
        }, {
            $scope: $scope,
            total: 0,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.partnerTypes);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.partnerTypes;
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
            var index = _.indexOf($scope.selectedItems, item);
            if (index === -1) {
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
