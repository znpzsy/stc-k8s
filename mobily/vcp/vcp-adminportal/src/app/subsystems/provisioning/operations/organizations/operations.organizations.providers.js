(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning.operations.organizations.providers', []);

    var ProvisioningOperationsOrganizationsProvidersModule = angular.module('adminportal.subsystems.provisioning.operations.organizations.providers');

    ProvisioningOperationsOrganizationsProvidersModule.config(function ($stateProvider) {

        // Service providers states
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
        }).state('subsystems.provisioning.operations.organizations.providers.providerupdate', {
            url: "/providers/:id",
            templateUrl: "subsystems/provisioning/operations/organizations/operations.organizations.providers.detail.html",
            controller: 'ProvisioningOperationsOrganizationsProviderUpdateCtrl',
            resolve: {
                partner: function ($stateParams, CMPFService) {
                    return CMPFService.getPartner($stateParams.id);
                }
            }
        }).state('subsystems.provisioning.operations.organizations.providers.newprovider', {
            url: "/newprovider",
            templateUrl: "subsystems/provisioning/operations/organizations/operations.organizations.providers.detail.html",
            controller: 'ProvisioningOperationsOrganizationsProvidersNewCtrl'
        });

    });

    // Providers controllers
    ProvisioningOperationsOrganizationsProvidersModule.controller('ProvisioningOperationsOrganizationsProvidersCommonCtrl', function ($scope, $log, $q, notification, $translate, $uibModal, CMPFService) {
        $log.debug('ProvisioningOperationsOrganizationsProvidersCommonCtrl');

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
                        return CMPFService.getAllOrganizations(0, DEFAULT_REST_QUERY_LIMIT);
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

    ProvisioningOperationsOrganizationsProvidersModule.controller('ProvisioningOperationsOrganizationsProvidersNewCtrl', function ($scope, $controller, $state, $log, $uibModal, $translate, notification, CMPFService,
                                                                                                                                   STATUS_TYPES) {
        $log.debug('ProvisioningOperationsOrganizationsProvidersNewCtrl');

        $controller('ProvisioningOperationsOrganizationsProvidersCommonCtrl', {$scope: $scope});

        $scope.STATUS_TYPES = STATUS_TYPES;

        $scope.provider = {
            name: '',
            description: '',
            state: STATUS_TYPES[0].name
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

            CMPFService.createPartner([providerItem]).then(function (response) {
                $log.debug('Save Success. Response: ', response);

                if (response && response.errorCode) {
                    CMPFService.showApiError(response);
                } else {
                    $scope.showSuccessMessage();
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

    ProvisioningOperationsOrganizationsProvidersModule.controller('ProvisioningOperationsOrganizationsProviderUpdateCtrl', function ($scope, $controller, $log, Restangular, $translate, notification, CMPFService, ReportingExportService,
                                                                                                                                     STATUS_TYPES, partner) {
        $log.debug('ProvisioningOperationsOrganizationsProviderUpdateCtrl');

        $controller('ProvisioningOperationsOrganizationsProvidersCommonCtrl', {$scope: $scope});

        $scope.STATUS_TYPES = STATUS_TYPES;

        $scope.provider = Restangular.stripRestangular(partner);

        $scope.providerOriginal = angular.copy($scope.provider);
        $scope.isNotChanged = function () {
            return angular.equals($scope.providerOriginal, $scope.provider);
        };

        $scope.save = function (provider) {
            $log.debug('Trying Update provider: ', provider);

            var providerItem = {
                // Set originals
                type: $scope.providerOriginal.type,
                id: $scope.providerOriginal.id,
                name: $scope.providerOriginal.name,
                orgType: $scope.providerOriginal.orgType,
                parentId: $scope.providerOriginal.parentId,
                parentName: $scope.providerOriginal.parentName,
                // Editable fields on the update mode
                description: provider.description,
                state: provider.state,
                profiles: $scope.providerOriginal.profiles
            };

            CMPFService.updatePartner(providerItem).then(function (response) {
                $log.debug('Update Success. Response: ', response);

                if (response && response.errorCode) {
                    CMPFService.showApiError(response);
                } else {
                    $scope.showSuccessMessage();
                }
            }, function (response) {
                $log.debug('Cannot save new provider. Error: ', response);

                CMPFService.showApiError(response);
            });
        };
    });

})();