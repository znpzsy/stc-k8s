(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning.operations.organizations', [
        'adminportal.subsystems.provisioning.operations.organizations.operators',
        'adminportal.subsystems.provisioning.operations.organizations.providers'
    ]);

    var ProvisioningOperationsOrganizationsModule = angular.module('adminportal.subsystems.provisioning.operations.organizations');

    ProvisioningOperationsOrganizationsModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.provisioning.operations.organizations', {
            abstract: true,
            url: "/organizations",
            template: "<div ui-view></div>"
        });

    });

    ProvisioningOperationsOrganizationsModule.controller('ProvisioningOperationsOrganizationsProvidersOfOrganizationsModalInstanceCtrl', function ($scope, $uibModalInstance, $log, $filter, NgTableParams, NgTableService, operatorName,
                                                                                                                                                   partnersOfOrganization, modalTitleKey) {
        $log.debug('ProvisioningOperationsOrganizationsProvidersOfOrganizationsModalInstanceCtrl');

        $scope.operatorName = operatorName;

        $scope.partnersOfOrganization = partnersOfOrganization;
        $scope.partnersOfOrganization.partners = $filter('orderBy')($scope.partnersOfOrganization.partners, ['id']);

        $scope.modalTitleKey = modalTitleKey;

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
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.partnersOfOrganization.partners);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.partnersOfOrganization.partners;
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

        $scope.ok = function () {
            $uibModalInstance.close();
        };
    });

    ProvisioningOperationsOrganizationsModule.controller('ProvisioningOperationsOrganizationsServicesModalInstanceCtrl', function ($scope, $uibModalInstance, $log, $filter, NgTableParams, NgTableService, servicesOfPartner,
                                                                                                                                   organizationName, modalTitleKey) {
        $log.debug('ProvisioningOperationsOrganizationsServicesModalInstanceCtrl');

        $scope.organizationName = organizationName;

        $scope.servicesOfPartner = servicesOfPartner;
        $scope.servicesOfPartner.services = $filter('orderBy')($scope.servicesOfPartner.services, ['id']);

        $scope.modalTitleKey = modalTitleKey;

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'id',
                    headerKey: 'Subsystems.Provisioning.Services.Id'
                },
                {
                    fieldName: 'name',
                    headerKey: 'Subsystems.Provisioning.Services.Name'
                },
                {
                    fieldName: 'state',
                    headerKey: 'Subsystems.Provisioning.Services.State'
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
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.servicesOfPartner.services);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.servicesOfPartner.services;
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

        $scope.ok = function () {
            $uibModalInstance.close();
        };
    });

    ProvisioningOperationsOrganizationsModule.controller('ProvisioningOperationsOrganizationsMSISDNPrefixListPatternOperationsCtrl', function ($scope, $log, $filter, $uibModal, $uibModalInstance, NgTableParams, NgTableService,
                                                                                                                                         operator, msisdnPrefixList) {
        $log.debug('ProvisioningOperationsOrganizationsMSISDNPrefixListPatternOperationsCtrl');

        $scope.operator = operator;

        // MSISDN Prefix List definitions
        $scope.patternList = {
            list: msisdnPrefixList ? msisdnPrefixList : [],
            tableParams: {}
        };

        $scope.filterPatternTable = _.debounce(function (filterText, filterColumns) {
            $scope.patternList.tableParams.settings().$scope.filterText = filterText;
            $scope.patternList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.patternList.tableParams.page(1);
            $scope.patternList.tableParams.reload();
        }, 750);

        $scope.patternList.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "value": 'asc' // initial sorting
            }
        }, {
            total: $scope.patternList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.patternList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.patternList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - MSISDN Prefix List definitions

        // Add new pattern
        $scope.addNewPattern = function (value) {
            $scope.patternList.list.push({
                value: value
            });
            $scope.patternList.tableParams.reload();

            angular.element('#form #regex').scope().form.$setPristine();
            delete angular.element('#form #regex').scope().value;
        };

        // Remove pattern
        $scope.removePattern = function (pattern) {
            pattern.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing matching content pattern: ', pattern);

                var deletedListItem = _.findWhere($scope.patternList.list, {
                    value: pattern.value
                });
                $scope.patternList.list = _.without($scope.patternList.list, deletedListItem);

                $scope.patternList.tableParams.reload();

                pattern.rowSelected = false;
            }, function () {
                pattern.rowSelected = false;
            });
        };

        $scope.ok = function () {
            $uibModalInstance.close($scope.patternList.list);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });

})();