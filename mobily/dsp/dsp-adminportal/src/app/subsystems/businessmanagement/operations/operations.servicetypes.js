(function () {

    'use strict';

    angular.module('adminportal.subsystems.businessmanagement.operations.servicetypes', []);

    var BusinessManagementOperationsServiceTypesModule = angular.module('adminportal.subsystems.businessmanagement.operations.servicetypes');

    BusinessManagementOperationsServiceTypesModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.businessmanagement.operations.servicetypes', {
            abstract: true,
            url: "/service-types",
            template: '<div ui-view></div>',
            data: {
                exportFileName: 'ServiceTypes',
                permissions: [
                    'BIZ__OPERATIONS_SERVICETYPE_READ'
                ]
            },
            resolve: {
                serviceTypesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_SERVICE_TYPES_ORGANIZATION_NAME);
                },
                channelsOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_CHANNELS_ORGANIZATION_NAME);
                }
            }
        }).state('subsystems.businessmanagement.operations.servicetypes.list', {
            url: "",
            templateUrl: "subsystems/businessmanagement/operations/operations.servicetypes.html",
            controller: 'BusinessManagementOperationsServiceTypesCtrl'
        }).state('subsystems.businessmanagement.operations.servicetypes.new', {
            url: "/new",
            templateUrl: "subsystems/businessmanagement/operations/operations.servicetypes.details.html",
            controller: 'BusinessManagementOperationsServiceTypesNewCtrl'
        }).state('subsystems.businessmanagement.operations.servicetypes.update', {
            url: "/update/:id",
            templateUrl: "subsystems/businessmanagement/operations/operations.servicetypes.details.html",
            controller: 'BusinessManagementOperationsServiceTypesUpdateCtrl'
        });

    });

    BusinessManagementOperationsServiceTypesModule.controller('BusinessManagementOperationsServiceTypesCommonCtrl', function ($scope, $log, $q, $state, $filter, $uibModal, notification, $translate, CMPFService,
                                                                                                                              serviceTypesOrganization, channelsOrganization, BUSINESS_MANAGEMENT_STATUS_TYPES) {
        $log.debug('BusinessManagementOperationsServiceTypesCommonCtrl');

        $scope.serviceTypesOrganization = serviceTypesOrganization.organizations[0];
        $scope.channelsOrganization = channelsOrganization.organizations[0];

        $scope.BUSINESS_MANAGEMENT_STATUS_TYPES = BUSINESS_MANAGEMENT_STATUS_TYPES;

        $scope.channels = CMPFService.getChannels($scope.channelsOrganization);
        $scope.channels = $filter('orderBy')($scope.channels, 'profileId');

        $scope.updateServiceType = function (serviceTypesOrganizationOriginal, serviceType, isDelete) {
            var deferred = $q.defer();

            $log.debug('Trying update default organization: ', serviceTypesOrganizationOriginal, serviceType);

            // Update the last update time for create first time or for update everytime.
            serviceType.LastUpdateTime = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');

            var organizationItem = {
                id: serviceTypesOrganizationOriginal.id,
                name: serviceTypesOrganizationOriginal.name,
                type: serviceTypesOrganizationOriginal.type,
                orgType: serviceTypesOrganizationOriginal.orgType,
                parentId: serviceTypesOrganizationOriginal.parentId,
                parentName: serviceTypesOrganizationOriginal.parentName,
                state: serviceTypesOrganizationOriginal.state,
                description: serviceTypesOrganizationOriginal.description,
                // Profiles
                profiles: angular.copy(serviceTypesOrganizationOriginal.profiles)
            };

            // Create provision array from the selected provisions.
            serviceType.Provision = _.map($scope.selectedProvisions, function (selectedProvision) {
                return {value: selectedProvision};
            });

            var originalServiceTypeProfiles = CMPFService.findProfilesByName(organizationItem.profiles, CMPFService.ORGANIZATION_SERVICE_TYPE_PROFILE);

            var updatedServiceTypeProfile = JSON.parse(angular.toJson(serviceType));
            var originalServiceTypeProfile = _.findWhere(originalServiceTypeProfiles, {id: updatedServiceTypeProfile.profileId});

            if (isDelete) {
                organizationItem.profiles = _.without(organizationItem.profiles, originalServiceTypeProfile);
            } else {
                var serviceTypeProfileAttrArray = CMPFService.prepareProfile(updatedServiceTypeProfile, originalServiceTypeProfile);
                // ---
                if (originalServiceTypeProfile) {
                    originalServiceTypeProfile.attributes = serviceTypeProfileAttrArray;
                } else {
                    var serviceTypeProfile = {
                        name: CMPFService.ORGANIZATION_SERVICE_TYPE_PROFILE,
                        profileDefinitionName: CMPFService.ORGANIZATION_SERVICE_TYPE_PROFILE,
                        attributes: serviceTypeProfileAttrArray
                    };

                    organizationItem.profiles.push(serviceTypeProfile);
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

        // Provisions
        $scope.showProvisions = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/businessmanagement/operations/operations.servicetypes.provisions.modal.html',
                controller: 'BusinessManagementOperationsServiceTypesProvisionsModalCtrl',
                size: 'md',
                resolve: {
                    provisionsParameter: function () {
                        return angular.copy($scope.selectedProvisions);
                    },
                    serviceTypeNameParameter: function () {
                        return $scope.serviceType.Name;
                    }
                }
            });

            modalInstance.result.then(function (selectedItems) {
                $scope.selectedProvisions = selectedItems;
            }, function () {
            });
        };

        $scope.removeProvision = function (provision) {
            var index = _.indexOf($scope.selectedProvisions, provision);
            if (index != -1) {
                $scope.selectedProvisions.splice(index, 1);
            }
        };

        $scope.cancel = function () {
            $state.go('subsystems.businessmanagement.operations.servicetypes.list');
        };
    });

    BusinessManagementOperationsServiceTypesModule.controller('BusinessManagementOperationsServiceTypesCtrl', function ($scope, $log, $controller, $state, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                        serviceTypesOrganization, channelsOrganization, DateTimeConstants, CMPFService, DEFAULT_REST_QUERY_LIMIT) {
        $log.debug('BusinessManagementOperationsServiceTypesCtrl');

        $controller('BusinessManagementOperationsServiceTypesCommonCtrl', {
            $scope: $scope,
            serviceTypesOrganization: serviceTypesOrganization,
            channelsOrganization: channelsOrganization
        });

        $scope.serviceTypes = CMPFService.getServiceTypes($scope.serviceTypesOrganization);
        $scope.serviceTypes = $filter('orderBy')($scope.serviceTypes, 'profileId');

        _.each($scope.serviceTypes, function (serviceType) {
            var foundChannel = _.findWhere($scope.channels, {profileId: Number(serviceType.ChannelID)});
            if (foundChannel) {
                serviceType.Channel = foundChannel
            } else {
                serviceType.Channel = {
                    Name: 'N/A'
                };
            }
        });

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'profileId',
                    headerKey: 'Subsystems.BusinessManagement.Operations.ServiceTypes.Id'
                },
                {
                    fieldName: 'Name',
                    headerKey: 'Subsystems.BusinessManagement.Operations.ServiceTypes.Name'
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

        // Service type list
        $scope.serviceTypeList = {
            list: $scope.serviceTypes,
            tableParams: {}
        };

        $scope.serviceTypeList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "profileId": 'asc'
            }
        }, {
            total: $scope.serviceTypeList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.serviceTypeList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.serviceTypeList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Service type list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.serviceTypeList.tableParams.settings().$scope.filterText = filterText;
            $scope.serviceTypeList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.serviceTypeList.tableParams.page(1);
            $scope.serviceTypeList.tableParams.reload();
        }, 750);

        var findBusinessTypesUsingTheServiceType = function (allBusinessTypes, serviceType) {
            var businessTypes = [];
            _.each(allBusinessTypes, function (businessType) {
                var foundServiceType = _.findWhere(businessType.ServiceTypes, {value: serviceType.profileId.toString()});
                if (foundServiceType) {
                    businessTypes.push(businessType);
                }
            });

            return businessTypes;
        };

        // Business Types
        $scope.viewBusinessTypes = function (serviceType) {
            $uibModal.open({
                templateUrl: 'subsystems/businessmanagement/operations/operations.businesstypes.view.modal.html',
                controller: function ($scope, $uibModalInstance, businessTypesOrganization) {
                    $scope.pageHeaderKey = 'Subsystems.BusinessManagement.Operations.ServiceTypes.BusinessTypesModalTitle';
                    $scope.itemName = serviceType.Name;

                    $scope.businessTypesOrganization = businessTypesOrganization.organizations[0];
                    var allBusinessTypes = CMPFService.getBusinessTypes($scope.businessTypesOrganization);
                    allBusinessTypes = $filter('orderBy')(allBusinessTypes, 'profileId');

                    $scope.businessTypes = findBusinessTypesUsingTheServiceType(allBusinessTypes, serviceType);

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

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'lg',
                resolve: {
                    businessTypesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_BUSINESS_TYPES_ORGANIZATION_NAME);
                    }
                }
            });
        };

        $scope.remove = function (serviceType) {

            CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_BUSINESS_TYPES_ORGANIZATION_NAME).then(function (response) {
                var allBusinessTypes = CMPFService.getBusinessTypes(response.organizations[0]);
                var businessTypes = findBusinessTypesUsingTheServiceType(allBusinessTypes, serviceType);

                if (businessTypes && businessTypes.length > 0) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ThereAreLinkedBusinessTypes')
                    });
                } else {
                    serviceType.rowSelected = true;

                    var modalInstance = $uibModal.open({
                        templateUrl: 'partials/modal/modal.confirmation.html',
                        controller: 'ConfirmationModalInstanceCtrl',
                        size: 'sm'
                    });

                    modalInstance.result.then(function () {
                        serviceType.rowSelected = false;

                        $scope.updateServiceType($scope.serviceTypesOrganization, serviceType, true).then(function (response) {
                            var deletedListItem = _.findWhere($scope.serviceTypeList.list, {profileId: serviceType.profileId});
                            $scope.serviceTypeList.list = _.without($scope.serviceTypeList.list, deletedListItem);

                            $scope.serviceTypeList.tableParams.reload();

                            notification({
                                type: 'success',
                                text: $translate.instant('CommonLabels.OperationSuccessful')
                            });
                        }, function (response) {
                            CMPFService.showApiError(response);
                        });
                    }, function () {
                        serviceType.rowSelected = false;
                    });
                }
            });
        };
    });

    BusinessManagementOperationsServiceTypesModule.controller('BusinessManagementOperationsServiceTypesNewCtrl', function ($scope, $log, $controller, $filter, $translate, notification, CMPFService,
                                                                                                                           serviceTypesOrganization, channelsOrganization) {
        $log.debug('BusinessManagementOperationsServiceTypesNewCtrl');

        $controller('BusinessManagementOperationsServiceTypesCommonCtrl', {
            $scope: $scope,
            serviceTypesOrganization: serviceTypesOrganization,
            channelsOrganization: channelsOrganization
        });

        $scope.serviceType = {
            Name: '',
            Description: '',
            Status: null,
            LastUpdateTime: null
        };

        $scope.save = function (serviceType) {
            $scope.updateServiceType($scope.serviceTypesOrganization, serviceType).then(function (response) {
                notification.flash({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $scope.go('subsystems.businessmanagement.operations.servicetypes.list');
            }, function (response) {
                CMPFService.showApiError(response);
            });
        };
    });

    BusinessManagementOperationsServiceTypesModule.controller('BusinessManagementOperationsServiceTypesUpdateCtrl', function ($scope, $log, $controller, $stateParams, $filter, $translate, notification, CMPFService,
                                                                                                                              serviceTypesOrganization, channelsOrganization) {
        $log.debug('BusinessManagementOperationsServiceTypesUpdateCtrl');

        $controller('BusinessManagementOperationsServiceTypesCommonCtrl', {
            $scope: $scope,
            serviceTypesOrganization: serviceTypesOrganization,
            channelsOrganization: channelsOrganization
        });

        var id = $stateParams.id;

        $scope.selectedProvisions = [];

        // ServiceTypeProfile
        var serviceTypeProfiles = CMPFService.getServiceTypes($scope.serviceTypesOrganization);
        if (serviceTypeProfiles.length > 0) {
            var foundServiceType = _.findWhere(serviceTypeProfiles, {"profileId": Number(id)});
            $scope.serviceType = angular.copy(foundServiceType);

            var ChannelID = Number($scope.serviceType.ChannelID);
            var foundChannel = _.findWhere($scope.channels, {profileId: Number(ChannelID)});
            if (foundChannel) {
                $scope.serviceType.ChannelID = angular.isNumber(ChannelID) && !isNaN(ChannelID) ? ChannelID : undefined;
            } else {
                $scope.serviceType.ChannelID = null;
            }

            if ($scope.serviceType.Provision) {
                _.each($scope.serviceType.Provision, function (provision) {
                    $scope.selectedProvisions.push(provision.value);
                });
            } else {
                $scope.selectedProvisions = null;
            }
        }

        $scope.originalServiceType = angular.copy($scope.serviceType);
        $scope.originalSelectedProvisions = angular.copy($scope.selectedProvisions);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalServiceType, $scope.serviceType) &&
                angular.equals($scope.originalSelectedProvisions, $scope.selectedProvisions);
        };

        $scope.save = function (serviceType) {
            $scope.updateServiceType($scope.serviceTypesOrganization, serviceType).then(function (response) {
                notification.flash({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $scope.go('subsystems.businessmanagement.operations.servicetypes.list');
            }, function (response) {
                CMPFService.showApiError(response);
            });
        };
    });

    BusinessManagementOperationsServiceTypesModule.controller('BusinessManagementOperationsServiceTypesProvisionsModalCtrl', function ($scope, $uibModalInstance, $log, $filter, NgTableParams, NgTableService, Restangular,
                                                                                                                                       provisionsParameter, serviceTypeNameParameter, BUSINESS_MANAGEMENT_PROVISION_TYPES) {
        $log.debug('BusinessManagementOperationsServiceTypesProvisionsModalCtrl');

        $scope.selectedItems = provisionsParameter ? provisionsParameter : [];

        $scope.serviceTypeName = serviceTypeNameParameter;

        $scope.provisions = _.map(BUSINESS_MANAGEMENT_PROVISION_TYPES, function (value) {
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
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.provisions);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.provisions;
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
