(function () {

    'use strict';

    angular.module('adminportal.subsystems.businessmanagement.operations.settlementtypes', []);

    var BusinessManagementOperationsSettlementTypesModule = angular.module('adminportal.subsystems.businessmanagement.operations.settlementtypes');

    BusinessManagementOperationsSettlementTypesModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.businessmanagement.operations.settlementtypes', {
            abstract: true,
            url: "/settlement-types",
            template: '<div ui-view></div>',
            data: {
                exportFileName: 'SettlementTypes',
                permissions: [
                    'BIZ__OPERATIONS_SETTLEMENTTYPE_READ'
                ]
            },
            resolve: {
                settlementTypesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_SETTLEMENT_TYPES_ORGANIZATION_NAME, true);
                }
            }
        }).state('subsystems.businessmanagement.operations.settlementtypes.list', {
            url: "",
            templateUrl: "subsystems/businessmanagement/operations/operations.settlementtypes.html",
            controller: 'BusinessManagementOperationsSettlementTypesCtrl'
        }).state('subsystems.businessmanagement.operations.settlementtypes.new', {
            url: "/new",
            templateUrl: "subsystems/businessmanagement/operations/operations.settlementtypes.details.html",
            controller: 'BusinessManagementOperationsSettlementTypesNewCtrl',
            resolve: {
                organizations: function (CMPFService) {
                    return CMPFService.getAllOrganizationsCustom();
                },
                revenueRangesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_REVENUE_RANGES_ORGANIZATION_NAME, true);
                }
            }
        }).state('subsystems.businessmanagement.operations.settlementtypes.update', {
            url: "/update/:id",
            templateUrl: "subsystems/businessmanagement/operations/operations.settlementtypes.details.html",
            controller: 'BusinessManagementOperationsSettlementTypesUpdateCtrl',
            resolve: {
                organizations: function (CMPFService) {
                    return CMPFService.getAllOrganizationsCustom();
                },
                revenueRangesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_REVENUE_RANGES_ORGANIZATION_NAME, true);
                }
            }
        });

    });

    BusinessManagementOperationsSettlementTypesModule.controller('BusinessManagementOperationsSettlementTypesCommonCtrl', function ($scope, $log, $q, $state, $filter, $uibModal, notification, $translate, CMPFService, settlementTypesOrganization,
                                                                                                                                    BUSINESS_MANAGEMENT_STATUS_TYPES, BUSINESS_MANAGEMENT_SETTLEMENT_MODELS, BUSINESS_MANAGEMENT_REVENUE_SOURCES) {
        $log.debug('BusinessManagementOperationsSettlementTypesCommonCtrl');

        $scope.settlementTypesOrganization = settlementTypesOrganization.organizations[0];

        $scope.settlementTypes = CMPFService.getSettlementTypes($scope.settlementTypesOrganization);
        $scope.settlementTypes = $filter('orderBy')($scope.settlementTypes, 'profileId');

        $scope.BUSINESS_MANAGEMENT_STATUS_TYPES = BUSINESS_MANAGEMENT_STATUS_TYPES;
        $scope.BUSINESS_MANAGEMENT_SETTLEMENT_MODELS = BUSINESS_MANAGEMENT_SETTLEMENT_MODELS;
        $scope.BUSINESS_MANAGEMENT_REVENUE_SOURCES = BUSINESS_MANAGEMENT_REVENUE_SOURCES;

        $scope.revenueRanges = [];

        $scope.updateSettlementType = function (settlementTypesOrganizationOriginal, settlementType, isDelete) {
            var deferred = $q.defer();

            $log.debug('Trying update default organization: ', settlementTypesOrganizationOriginal, settlementType);

            // Update the last update time for create first time or for update everytime.
            settlementType.LastUpdateTime = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');

            var organizationItem = {
                id: settlementTypesOrganizationOriginal.id,
                name: settlementTypesOrganizationOriginal.name,
                type: settlementTypesOrganizationOriginal.type,
                orgType: settlementTypesOrganizationOriginal.orgType,
                parentId: settlementTypesOrganizationOriginal.parentId,
                parentName: settlementTypesOrganizationOriginal.parentName,
                state: settlementTypesOrganizationOriginal.state,
                description: settlementTypesOrganizationOriginal.description,
                // Profiles
                profiles: angular.copy(settlementTypesOrganizationOriginal.profiles)
            };

            var originalSettlementTypeProfiles = CMPFService.findProfilesByName(organizationItem.profiles, CMPFService.ORGANIZATION_SETTLEMENT_TYPE_PROFILE);

            var updatedSettlementTypeProfile = JSON.parse(angular.toJson(settlementType));
            var originalSettlementTypeProfile = _.findWhere(originalSettlementTypeProfiles, {id: updatedSettlementTypeProfile.profileId});

            // Set the Partners list string and remove the dummy holder variable.
            if (updatedSettlementTypeProfile.IsPartnerSpecific && updatedSettlementTypeProfile.partnerIds && updatedSettlementTypeProfile.partnerIds.length > 0) {
                updatedSettlementTypeProfile.Partners = updatedSettlementTypeProfile.partnerIds.join(',');
            } else {
                updatedSettlementTypeProfile.Partners = '';
            }
            delete updatedSettlementTypeProfile.partnerIds;

            if (isDelete) {
                organizationItem.profiles = _.without(organizationItem.profiles, originalSettlementTypeProfile);
            } else {
                var settlementTypeProfileAttrArray = CMPFService.prepareProfile(updatedSettlementTypeProfile, originalSettlementTypeProfile);
                // ---
                if (originalSettlementTypeProfile) {
                    originalSettlementTypeProfile.attributes = settlementTypeProfileAttrArray;
                } else {
                    var settlementTypeProfile = {
                        name: CMPFService.ORGANIZATION_SETTLEMENT_TYPE_PROFILE,
                        profileDefinitionName: CMPFService.ORGANIZATION_SETTLEMENT_TYPE_PROFILE,
                        attributes: settlementTypeProfileAttrArray
                    };

                    organizationItem.profiles.push(settlementTypeProfile);
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

        $scope.updateRevenueRange = function (settlementType, revenueRangesOrganizationOriginal, revenueRanges, isDelete) {
            var deferred = $q.defer();

            $log.debug('Trying update revenue range organization: ', revenueRangesOrganizationOriginal, revenueRanges);

            var organizationItem = {
                id: revenueRangesOrganizationOriginal.id,
                name: revenueRangesOrganizationOriginal.name,
                type: revenueRangesOrganizationOriginal.type,
                orgType: revenueRangesOrganizationOriginal.orgType,
                parentId: revenueRangesOrganizationOriginal.parentId,
                parentName: revenueRangesOrganizationOriginal.parentName,
                state: revenueRangesOrganizationOriginal.state,
                description: revenueRangesOrganizationOriginal.description,
                // Profiles
                profiles: angular.copy(revenueRangesOrganizationOriginal.profiles)
            };

            // Remove the previous RevenueRangeProfile which are related to the current settlement type.
            organizationItem.profiles = _.filter(organizationItem.profiles, function (originalRevenueRangeProfile) {
                var foundRevenueRange = _.findWhere(originalRevenueRangeProfile.attributes, {
                    name: 'SettlementTypeID',
                    value: settlementType.profileId.toString()
                });

                return (foundRevenueRange === undefined);
            });

            var originalRevenueRangeProfiles = CMPFService.findProfilesByName(organizationItem.profiles, CMPFService.ORGANIZATION_REVENUE_RANGE_PROFILE);

            if (!isDelete) {
                _.each(revenueRanges, function (revenueRange) {
                    revenueRange.SettlementTypeID = settlementType.profileId;

                    var updatedRevenueRangeProfile = JSON.parse(angular.toJson(revenueRange));
                    var originalRevenueRangeProfile = _.findWhere(originalRevenueRangeProfiles, {id: updatedRevenueRangeProfile.profileId});

                    var revenueRangeProfileAttrArray = CMPFService.prepareProfile(updatedRevenueRangeProfile, originalRevenueRangeProfile);
                    // ---
                    if (originalRevenueRangeProfile) {
                        originalRevenueRangeProfile.attributes = revenueRangeProfileAttrArray;
                    } else {
                        var revenueRangeProfile = {
                            name: CMPFService.ORGANIZATION_REVENUE_RANGE_PROFILE,
                            profileDefinitionName: CMPFService.ORGANIZATION_REVENUE_RANGE_PROFILE,
                            attributes: revenueRangeProfileAttrArray
                        };

                        organizationItem.profiles.push(revenueRangeProfile);
                    }
                });
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

        // Revenue range list editing methods
        $scope.addUpdateRevenueRange = function (revenueRange) {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/businessmanagement/operations/operations.settlementtypes.revenurange.modal.html',
                controller: function ($scope, $uibModalInstance, settlementTypeNameParameter) {
                    $scope.settlementTypeName = settlementTypeNameParameter;

                    if (revenueRange) {
                        $scope.revenueRange = angular.copy(revenueRange);
                    } else {
                        $scope.revenueRange = {
                            PartnerPercentage: 0,
                            CarrierPercentage: 100
                        }
                    }

                    // Partner percentage watcher.
                    $scope.$watch('revenueRange.CarrierPercentage', function (newValue, oldValue) {
                        if (newValue) {
                            $scope.revenueRange.PartnerPercentage = (new Decimal(100)).minus(newValue).toNumber();
                        } else {
                            $scope.revenueRange.PartnerPercentage = 100;
                        }
                    });

                    $scope.revenueRangeOriginal = angular.copy($scope.revenueRange);
                    $scope.isNotChanged = function () {
                        return angular.equals($scope.revenueRangeOriginal, $scope.revenueRange);
                    };

                    $scope.save = function (revenueRange) {
                        var response = {
                            oldValue: $scope.revenueRangeOriginal,
                            newValue: revenueRange
                        };

                        $uibModalInstance.close(response);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'md',
                resolve: {
                    settlementTypeNameParameter: function () {
                        return $scope.settlementType.Name;
                    }
                }
            });

            modalInstance.result.then(function (response) {
                var oldValue = response.oldValue;
                var newValue = response.newValue;

                var maxRevenueRangeOrderNo = 0;
                if ($scope.revenueRanges && $scope.revenueRanges.length > 0) {
                    maxRevenueRangeOrderNo = _.max($scope.revenueRanges, function (revenueRange) {
                        return revenueRange.OrderNo;
                    }).OrderNo + 1;
                }

                // If the value was not already defined on the list
                if (!_.findWhere($scope.revenueRanges, {
                    StartPoint: newValue.StartPoint,
                    EndPoint: newValue.EndPoint,
                    CarrierPercentage: newValue.CarrierPercentage,
                    PartnerPercentage: newValue.PartnerPercentage
                })) {
                    // If it is editing or not
                    if (oldValue && oldValue.OrderNo !== undefined) {
                        var revenueRangeItem = _.findWhere($scope.revenueRanges, {OrderNo: oldValue.OrderNo});

                        revenueRangeItem.StartPoint = newValue.StartPoint;
                        revenueRangeItem.EndPoint = newValue.EndPoint;
                        revenueRangeItem.CarrierPercentage = newValue.CarrierPercentage;
                        revenueRangeItem.PartnerPercentage = newValue.PartnerPercentage;
                    } else {
                        if (!$scope.revenueRanges) {
                            $scope.revenueRanges = [];
                        }

                        $scope.revenueRanges.push({
                            OrderNo: maxRevenueRangeOrderNo,
                            StartPoint: newValue.StartPoint,
                            EndPoint: newValue.EndPoint,
                            CarrierPercentage: newValue.CarrierPercentage,
                            PartnerPercentage: newValue.PartnerPercentage
                        });
                    }
                }
            }, function () {
            });
        };
        $scope.removeRevenueRange = function (revenueRange) {
            if ($scope.revenueRanges) {
                var deletingItem = _.findWhere($scope.revenueRanges, {OrderNo: revenueRange.OrderNo});
                $scope.revenueRanges = _.without($scope.revenueRanges, deletingItem);
            }

            // Update indexes.
            _.each($scope.revenueRanges, function (revenueRange, index) {
                revenueRange.OrderNo = index;
            });
        };

        $scope.cancel = function () {
            $state.go('subsystems.businessmanagement.operations.settlementtypes.list');
        };
    });

    BusinessManagementOperationsSettlementTypesModule.controller('BusinessManagementOperationsSettlementTypesCtrl', function ($scope, $log, $controller, $state, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                              settlementTypesOrganization, DateTimeConstants, CMPFService, DEFAULT_REST_QUERY_LIMIT) {
        $log.debug('BusinessManagementOperationsSettlementTypesCtrl');

        $controller('BusinessManagementOperationsSettlementTypesCommonCtrl', {
            $scope: $scope,
            settlementTypesOrganization: settlementTypesOrganization
        });

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'profileId',
                    headerKey: 'Subsystems.BusinessManagement.Operations.SettlementTypes.Id'
                },
                {
                    fieldName: 'Name',
                    headerKey: 'Subsystems.BusinessManagement.Operations.SettlementTypes.Name'
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

        // Settlement type list
        $scope.settlementTypeList = {
            list: $scope.settlementTypes,
            tableParams: {}
        };

        $scope.settlementTypeList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "profileId": 'asc'
            }
        }, {
            total: $scope.settlementTypeList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.settlementTypeList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.settlementTypeList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Settlement type list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.settlementTypeList.tableParams.settings().$scope.filterText = filterText;
            $scope.settlementTypeList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.settlementTypeList.tableParams.page(1);
            $scope.settlementTypeList.tableParams.reload();
        }, 750);

        var findBusinessTypesUsingTheSettlementType = function (allBusinessTypes, settlementType) {
            var businessTypes = [];
            _.each(allBusinessTypes, function (businessType) {
                var foundSettlementType = _.findWhere(businessType.SettlementTypes, {value: settlementType.profileId.toString()});
                if (foundSettlementType) {
                    businessTypes.push(businessType);
                }
            });

            return businessTypes;
        };

        // Business Types
        $scope.viewBusinessTypes = function (settlementType) {
            $uibModal.open({
                templateUrl: 'subsystems/businessmanagement/operations/operations.businesstypes.view.modal.html',
                controller: function ($scope, $uibModalInstance, businessTypesOrganization) {
                    $scope.pageHeaderKey = 'Subsystems.BusinessManagement.Operations.SettlementTypes.BusinessTypesModalTitle';
                    $scope.itemName = settlementType.Name;

                    $scope.businessTypesOrganization = businessTypesOrganization.organizations[0];
                    var allBusinessTypes = CMPFService.getBusinessTypes($scope.businessTypesOrganization);
                    allBusinessTypes = $filter('orderBy')(allBusinessTypes, 'profileId');

                    $scope.businessTypes = findBusinessTypesUsingTheSettlementType(allBusinessTypes, settlementType);

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

        $scope.remove = function (settlementType) {
            CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_BUSINESS_TYPES_ORGANIZATION_NAME).then(function (businessTypesOrganization) {
                CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_REVENUE_RANGES_ORGANIZATION_NAME).then(function (revenueRangesOrganization) {
                    var allBusinessTypes = CMPFService.getBusinessTypes(businessTypesOrganization.organizations[0]);
                    var businessTypes = findBusinessTypesUsingTheSettlementType(allBusinessTypes, settlementType);

                    var revenueRangesOrganization = revenueRangesOrganization.organizations[0];

                    if (businessTypes && businessTypes.length > 0) {
                        notification({
                            type: 'warning',
                            text: $translate.instant('CommonMessages.ThereAreLinkedBusinessTypes')
                        });
                    } else {
                        settlementType.rowSelected = true;

                        var modalInstance = $uibModal.open({
                            templateUrl: 'partials/modal/modal.confirmation.html',
                            controller: 'ConfirmationModalInstanceCtrl',
                            size: 'sm'
                        });

                        modalInstance.result.then(function () {
                            settlementType.rowSelected = false;

                            $scope.updateSettlementType($scope.settlementTypesOrganization, settlementType, true).then(function (response) {
                                // Delete all revenue ranges for this settlement type too.
                                $scope.updateRevenueRange(settlementType, revenueRangesOrganization, settlementType.revenueRanges, true).then(function () {
                                    var deletedListItem = _.findWhere($scope.settlementTypeList.list, {profileId: settlementType.profileId});
                                    $scope.settlementTypeList.list = _.without($scope.settlementTypeList.list, deletedListItem);

                                    $scope.settlementTypeList.tableParams.reload();

                                    notification({
                                        type: 'success',
                                        text: $translate.instant('CommonLabels.OperationSuccessful')
                                    });
                                }, function (response) {
                                    CMPFService.showApiError(response);
                                });
                            }, function (response) {
                                CMPFService.showApiError(response);
                            });
                        }, function () {
                            settlementType.rowSelected = false;
                        });
                    }
                });
            });
        };
    });

    BusinessManagementOperationsSettlementTypesModule.controller('BusinessManagementOperationsSettlementTypesNewCtrl', function ($scope, $log, $controller, $filter, $translate, notification, Restangular, CMPFService,
                                                                                                                                 organizations, settlementTypesOrganization, revenueRangesOrganization) {
        $log.debug('BusinessManagementOperationsSettlementTypesNewCtrl');

        $controller('BusinessManagementOperationsSettlementTypesCommonCtrl', {
            $scope: $scope,
            settlementTypesOrganization: settlementTypesOrganization
        });

        var organizations = Restangular.stripRestangular(organizations);
        $scope.organizations = $filter('orderBy')(organizations.organizations, 'name');

        $scope.revenueRangesOrganization = revenueRangesOrganization.organizations[0];

        $scope.settlementType = {
            Name: '',
            Description: '',
            Status: null,
            LastUpdateTime: null,
            BusinessTypeID: -1,
            SettlementModel: 'FIXED_PERCENTAGE',
            RevenueSource: 'BASED_ON_ALL_INCOME',
            PartnerPercentage: 0.0,
            CarrierPercentage: 100.0,
            IsPartnerSpecific: false,
            Partners: null
        };

        // Partner percentage watcher.
        $scope.$watch('settlementType.CarrierPercentage', function (newValue, oldValue) {
            if ($scope.settlementType.SettlementModel === 'FIXED_PERCENTAGE' && (newValue !== oldValue)) {
                if (newValue) {
                    $scope.settlementType.PartnerPercentage = (new Decimal(100)).minus(newValue).toNumber();
                } else {
                    $scope.settlementType.PartnerPercentage = 100;
                }
            }
        });

        // Settlement model watcher.
        $scope.$watch('settlementType.SettlementModel', function (newValue, oldValue) {
            if ((newValue !== oldValue) && newValue) {
                $scope.settlementType.PartnerPercentage = 0;

                if ($scope.settlementType.SettlementModel === 'PERCENTAGE_FOR_RESELLER') {
                    $scope.settlementType.CarrierPercentage = 0;
                } else {
                    $scope.settlementType.CarrierPercentage = 100;
                }
            }
        });

        $scope.save = function (settlementType) {
            $scope.updateSettlementType($scope.settlementTypesOrganization, settlementType).then(function (response) {
                if ($scope.revenueRanges && $scope.revenueRanges.length > 0) {
                    var settlementTypeProfiles = CMPFService.getSettlementTypes(response);

                    // Search the latest written profile instance by Name and LastUpdateTime attributes.
                    var foundSettlementType = _.findWhere(settlementTypeProfiles, {
                        Name: settlementType.Name,
                        LastUpdateTime: settlementType.LastUpdateTime.toString()
                    });

                    $scope.updateRevenueRange(foundSettlementType, $scope.revenueRangesOrganization, $scope.revenueRanges).then(function () {
                        notification.flash({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });

                        $scope.go('subsystems.businessmanagement.operations.settlementtypes.list');
                    }, function (response) {
                        CMPFService.showApiError(response);
                    });
                } else {
                    notification.flash({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $scope.go('subsystems.businessmanagement.operations.settlementtypes.list');
                }
            }, function (response) {
                CMPFService.showApiError(response);
            });
        };
    });

    BusinessManagementOperationsSettlementTypesModule.controller('BusinessManagementOperationsSettlementTypesUpdateCtrl', function ($scope, $log, $controller, $stateParams, $filter, $translate, notification, Restangular, CMPFService,
                                                                                                                                    organizations, settlementTypesOrganization, revenueRangesOrganization) {
        $log.debug('BusinessManagementOperationsSettlementTypesUpdateCtrl');

        $controller('BusinessManagementOperationsSettlementTypesCommonCtrl', {
            $scope: $scope,
            settlementTypesOrganization: settlementTypesOrganization
        });

        var organizations = Restangular.stripRestangular(organizations);
        $scope.organizations = $filter('orderBy')(organizations.organizations, 'name');

        $scope.revenueRangesOrganization = revenueRangesOrganization.organizations[0];

        var id = $stateParams.id;

        // SettlementTypeProfile
        var settlementTypeProfiles = CMPFService.getSettlementTypes($scope.settlementTypesOrganization);
        if (settlementTypeProfiles.length > 0) {
            var foundSettlementType = _.findWhere(settlementTypeProfiles, {"profileId": Number(id)});

            if (foundSettlementType.Partners) {
                foundSettlementType.partnerIds = String(foundSettlementType.Partners).split(',');
                foundSettlementType.partnerIds = _.map(foundSettlementType.partnerIds, function (num) {
                    return Number(num);
                });
            }

            $scope.settlementType = angular.copy(foundSettlementType);

            // Partner percentage watcher.
            $scope.$watch('settlementType.CarrierPercentage', function (newValue, oldValue) {
                if ($scope.settlementType.SettlementModel === 'FIXED_PERCENTAGE' && (newValue !== oldValue)) {
                    if (newValue) {
                        $scope.settlementType.PartnerPercentage = (new Decimal(100)).minus(newValue).toNumber();
                    } else {
                        $scope.settlementType.PartnerPercentage = 100;
                    }
                }
            });

            // Settlement model watcher.
            $scope.$watch('settlementType.SettlementModel', function (newValue, oldValue) {
                if ((newValue !== oldValue) && newValue) {
                    $scope.settlementType.PartnerPercentage = 0;

                    if ($scope.settlementType.SettlementModel === 'FIXED_PERCENTAGE') {
                        $scope.settlementType.CarrierPercentage = (new Decimal(100)).minus($scope.settlementType.PartnerPercentage).toNumber();
                    } else {
                        $scope.settlementType.CarrierPercentage = 0;
                    }
                }
            });

            $scope.settlementType.CarrierPercentage = Number($scope.settlementType.CarrierPercentage);
            $scope.settlementType.PartnerPercentage = Number($scope.settlementType.PartnerPercentage);
        }
        // RevenueRangeProfile
        var revenueRangeProfiles = CMPFService.getRevenueRanges($scope.revenueRangesOrganization);
        if (revenueRangeProfiles.length > 0) {
            $scope.revenueRanges = _.where(revenueRangeProfiles, {SettlementTypeID: Number(id)});
            _.each($scope.revenueRanges, function (revenueRange) {
                revenueRange.OrderNo = Number(revenueRange.OrderNo);
                revenueRange.StartPoint = Number(revenueRange.StartPoint);
                revenueRange.EndPoint = Number(revenueRange.EndPoint);
                revenueRange.CarrierPercentage = Number(revenueRange.CarrierPercentage);
                revenueRange.PartnerPercentage = Number(revenueRange.PartnerPercentage);
            });

            $scope.revenueRanges = $filter('orderBy')($scope.revenueRanges, 'OrderNo');
        }

        $scope.originalSettlementType = angular.copy($scope.settlementType);
        $scope.originalRevenueRanges = angular.copy($scope.revenueRanges);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalSettlementType, $scope.settlementType) &&
                angular.equals($scope.originalRevenueRanges, $scope.revenueRanges);
        };

        $scope.save = function (settlementType) {
            $scope.updateSettlementType($scope.settlementTypesOrganization, settlementType).then(function () {
                if ($scope.revenueRanges && $scope.revenueRanges.length > 0) {
                    $scope.updateRevenueRange($scope.settlementType, $scope.revenueRangesOrganization, $scope.revenueRanges, true).then(function () {
                        $scope.updateRevenueRange($scope.settlementType, $scope.revenueRangesOrganization, $scope.revenueRanges).then(function () {
                            notification.flash({
                                type: 'success',
                                text: $translate.instant('CommonLabels.OperationSuccessful')
                            });

                            $scope.go('subsystems.businessmanagement.operations.settlementtypes.list');
                        }, function (response) {
                            CMPFService.showApiError(response);
                        });
                    }, function (response) {
                        CMPFService.showApiError(response);
                    });
                } else {
                    notification.flash({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $scope.go('subsystems.businessmanagement.operations.settlementtypes.list');
                }
            }, function (response) {
                CMPFService.showApiError(response);
            });
        };
    });

})();
