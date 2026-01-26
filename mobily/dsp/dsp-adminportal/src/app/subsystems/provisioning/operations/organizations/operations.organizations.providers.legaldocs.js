(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning.operations.organizations.providers.legaldocs', []);

    var ProvisioningOperationsOrganizationsProvidersLegalDocsModule = angular.module('adminportal.subsystems.provisioning.operations.organizations.providers.legaldocs');

    ProvisioningOperationsOrganizationsProvidersLegalDocsModule.controller('ProvisioningOperationsOrganizationsProvidersLegalDocsRegisterLegalDocumentsCtrl', function ($scope, $log, $q, $controller, $filter, $uibModal, ContentManagementService,
                                                                                                                                                                        SERVICE_PROVIDER_LEGAL_FILE_TYPES) {
        $log.debug('ProvisioningOperationsOrganizationsProvidersLegalDocsRegisterLegalDocumentsCtrl');

        $controller('ProvisioningOperationsOrganizationsProvidersLegalDocsRegisterOrganizationLegalFilesCtrl', {$scope: $scope});

        $scope.isListsProperlySelected = function () {
            if ($scope.selectedBusinessTypes && $scope.selectedBusinessTypes.length > 0) {
                return _.every($scope.selectedBusinessTypes, function (selectedBusinessType) {
                    return selectedBusinessType.selectedSettlementTypes.length > 0;
                });
            } else {
                return false;
            }
        };

        $scope.selectedBusinessTypes = [];

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

        // Business Types
        $scope.rearrangeSelectedBusinessTypes = function () {
            // Make a decision about necessary documents for all selected business types.
            generateNecessaryFileList($scope.selectedBusinessTypes);

            if ($scope.selectedBusinessTypes && $scope.selectedBusinessTypes.length > 0) {
                $scope.selectedBusinessTypes = $filter('orderBy')($scope.selectedBusinessTypes, ['Name']);

                // Initialize the attributes of the selected business types.
                _.each($scope.selectedBusinessTypes, function (selectedBusinessType) {
                    selectedBusinessType.active = false;

                    // Call the controller for selected business types.
                    $controller('ProvisioningOperationsOrganizationsProvidersLegalDocsRegisterOrganizationSettlementTypesCtrl', {
                        $scope: $scope,
                        selectedBusinessType: selectedBusinessType
                    })
                });

                $scope.selectedBusinessTypes[0].active = true;
            }
        };

        $scope.showBusinessTypes = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/organizations/operations.organizations.providers.businesstypes.modal.html',
                controller: 'ProvisioningOperationsOrganizationsProvidersLegalDocsRegisterOrganizationBusinessTypesModalCtrl',
                size: 'lg',
                resolve: {
                    businessTypesParameter: function () {
                        return angular.copy($scope.selectedBusinessTypes);
                    },
                    businessTypesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_BUSINESS_TYPES_ORGANIZATION_NAME);
                    }
                }
            });

            modalInstance.result.then(function (selectedItems) {
                $scope.selectedBusinessTypes = selectedItems;

                $scope.rearrangeSelectedBusinessTypes();
            }, function () {
            });
        };

        $scope.removeSelectedBusinessType = function (selectedBusinessType) {
            var index = _.indexOf($scope.selectedBusinessTypes, selectedBusinessType);
            if (index != -1) {
                $scope.selectedBusinessTypes.splice(index, 1);

                $scope.rearrangeSelectedBusinessTypes();
            }
        };

        // Settlement Types
        $scope.showSettlementTypesByBusinessType = function (selectedBusinessType) {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/organizations/operations.organizations.providers.settlementtypes.modal.html',
                controller: 'ProvisioningOperationsOrganizationsProvidersLegalDocsRegisterOrganizationSettlementTypesModalCtrl',
                size: 'lg',
                resolve: {
                    provider: function () {
                        return $scope.provider;
                    },
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

        // Details modal window.
        $scope.showSettlementTypeDetails = function (settlementType, $event) {
            $event.preventDefault();
            $event.stopPropagation();

            settlementType.rowSelected = true;

            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'subsystems/provisioning/operations/organizations/operations.organizations.providers.settlementtypes.details.modal.html',
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
    });

    ProvisioningOperationsOrganizationsProvidersLegalDocsModule.controller('ProvisioningOperationsOrganizationsProvidersLegalDocsRegisterOrganizationLegalFilesCtrl', function ($scope, $log, $filter, NgTableParams, UtilService) {
        $log.debug('ProvisioningOperationsOrganizationsProvidersLegalDocsRegisterOrganizationLegalFilesCtrl');

        $scope.dateFormat = 'MMMM d, y';
        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1,
            showWeeks: false
        };

        $scope.businessTypeLegalFiles = {
            list: [],
            tableParams: {}
        };

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

    ProvisioningOperationsOrganizationsProvidersLegalDocsModule.controller('ProvisioningOperationsOrganizationsProvidersLegalDocsRegisterOrganizationBusinessTypesModalCtrl', function ($scope, $uibModalInstance, $log, $filter, NgTableParams, NgTableService, Restangular,
                                                                                                                                                                                        businessTypesParameter, businessTypesOrganization, CMPFService) {
        $log.debug('ProvisioningOperationsOrganizationsProvidersLegalDocsRegisterOrganizationBusinessTypesModalCtrl');

        $scope.selectedItems = businessTypesParameter ? businessTypesParameter : [];

        $scope.businessTypesOrganization = businessTypesOrganization.organizations[0];
        $scope.businessTypes = CMPFService.getBusinessTypes($scope.businessTypesOrganization);
        $scope.businessTypes = $filter('orderBy')($scope.businessTypes, 'profileId');
        $scope.businessTypes = _.filter($scope.businessTypes, {Status: 'COMMERCIAL'});

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
                item.TrustedStatus = 'UNTRUSTED';
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

    ProvisioningOperationsOrganizationsProvidersLegalDocsModule.controller('ProvisioningOperationsOrganizationsProvidersLegalDocsRegisterOrganizationSettlementTypesCtrl', function ($scope, $log, $filter, NgTableParams, selectedBusinessType) {
        $log.debug('ProvisioningOperationsOrganizationsProvidersLegalDocsRegisterOrganizationSettlementTypesCtrl');

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

    ProvisioningOperationsOrganizationsProvidersLegalDocsModule.controller('ProvisioningOperationsOrganizationsProvidersLegalDocsRegisterOrganizationSettlementTypesModalCtrl', function ($scope, $log, $filter, $uibModal, $uibModalInstance, NgTableParams, NgTableService, Restangular,
                                                                                                                                                                                          provider, settlementTypesParameter, selectedBusinessType, settlementTypesOrganization, CMPFService,
                                                                                                                                                                                          showDetailsFunction) {
        $log.debug('ProvisioningOperationsOrganizationsProvidersLegalDocsRegisterOrganizationSettlementTypesModalCtrl');

        $scope.provider = provider;

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
                        if (partnerIds.indexOf(String($scope.provider ? $scope.provider.id : 0)) > -1) {
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
