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

    ProvisioningOperationsOrganizationsModule.controller('ProvisioningOperationsOrganizationsContentMetadatasModalInstanceCtrl', function ($scope, $uibModalInstance, $log, $filter, NgTableParams, NgTableService, contentMetadatasOfPartner,
                                                                                                                                           organizationName, modalTitleKey, services) {
        $log.debug('ProvisioningOperationsOrganizationsContentMetadatasModalInstanceCtrl');

        $scope.organizationName = organizationName;

        $scope.serviceList = services.services;
        $scope.serviceList = $filter('orderBy')($scope.serviceList, ['organization.name', 'name']);

        $scope.contentMetadatasOfPartner = [];
        if (contentMetadatasOfPartner && contentMetadatasOfPartner.detail) {
            $scope.contentMetadatasOfPartner = contentMetadatasOfPartner.detail.contentList;
        }
        $scope.contentMetadatasOfPartner = $filter('orderBy')($scope.contentMetadatasOfPartner, ['id']);

        _.each($scope.contentMetadatasOfPartner, function (contentMetadata) {
            var foundService = _.findWhere($scope.serviceList, {id: Number(contentMetadata.serviceId)});
            if (foundService) {
                contentMetadata.service = foundService;
            } else {
                contentMetadata.service = {
                    name: 'N/A'
                };
            }
        });

        $scope.modalTitleKey = modalTitleKey;

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'id',
                    headerKey: 'Subsystems.ContentManagement.Operations.ContentMetadatas.Id'
                },
                {
                    fieldName: 'name',
                    headerKey: 'Subsystems.ContentManagement.Operations.ContentMetadatas.Name'
                },
                {
                    fieldName: 'service.name',
                    headerKey: 'CommonLabels.Service'
                },
                {
                    fieldName: 'status',
                    headerKey: 'CommonLabels.State'
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
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.contentMetadatasOfPartner);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.contentMetadatasOfPartner;
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

    ProvisioningOperationsOrganizationsModule.controller('ProvisioningOperationsOrganizationsOffersModalInstanceCtrl', function ($scope, $uibModalInstance, $log, $filter, NgTableParams, NgTableService, offersOfPartner,
                                                                                                                                 organizationName, modalTitleKey) {
        $log.debug('ProvisioningOperationsOrganizationsServicesModalInstanceCtrl');

        $scope.organizationName = organizationName;

        $scope.offersOfPartner = offersOfPartner;
        $scope.offersOfPartner.offers = $filter('orderBy')($scope.offersOfPartner.offers, ['id']);

        $scope.modalTitleKey = modalTitleKey;

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'id',
                    headerKey: 'Subsystems.SubscriptionManagement.Operations.Offers.Id'
                },
                {
                    fieldName: 'name',
                    headerKey: 'Subsystems.SubscriptionManagement.Operations.Offers.Name'
                },
                {
                    fieldName: 'state',
                    headerKey: 'Subsystems.SubscriptionManagement.Operations.Offers.State'
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
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.offersOfPartner.offers);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.offersOfPartner.offers;
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

})();