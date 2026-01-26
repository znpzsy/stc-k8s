(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning.operations.organizations.operators', []);

    var ProvisioningOperationsOrganizationsOperatorsModule = angular.module('adminportal.subsystems.provisioning.operations.organizations.operators');

    ProvisioningOperationsOrganizationsOperatorsModule.config(function ($stateProvider) {

        // Operators states
        $stateProvider.state('subsystems.provisioning.operations.organizations.operators', {
            abstract: true,
            url: "",
            template: "<div ui-view></div>"
        }).state('subsystems.provisioning.operations.organizations.operators.list', {
            url: "/operators",
            templateUrl: "subsystems/provisioning/operations/organizations/operations.organizations.operators.html",
            controller: 'ProvisioningOperationsOrganizationsOperatorsCtrl',
            resolve: {
                operators: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOperators(0,  DEFAULT_REST_QUERY_LIMIT,false,true);
                }
            }
        }).state('subsystems.provisioning.operations.organizations.operators.newoperator', {
            url: "/newoperator",
            templateUrl: "subsystems/provisioning/operations/organizations/operations.organizations.operators.detail.html",
            controller: 'ProvisioningOperationsOrganizationsOperatorsNewCtrl'
        }).state('subsystems.provisioning.operations.organizations.operators.operatorsupdate', {
            url: "/operators/:id",
            templateUrl: "subsystems/provisioning/operations/organizations/operations.organizations.operators.detail.html",
            controller: 'ProvisioningOperationsOrganizationsOperatorsUpdateCtrl',
            resolve: {
                operator: function ($stateParams, CMPFService) {
                    return CMPFService.getOperator($stateParams.id);
                }
            }
        });

    });

    // Operators controllers
    ProvisioningOperationsOrganizationsOperatorsModule.controller('ProvisioningOperationsOrganizationsOperatorsCommonCtrl', function ($scope, $log, $uibModal, CMPFService) {

        $log.debug('ProvisioningOperationsOrganizationsOperatorsCommonCtrl');

        $scope.cancel = function () {
            $scope.go('subsystems.provisioning.operations.organizations.operators.list');
        };
    });

    ProvisioningOperationsOrganizationsOperatorsModule.controller('ProvisioningOperationsOrganizationsOperatorsCtrl', function ($scope, $state, $log, $filter, $uibModal, $translate, notification, Restangular,
                                                                                                                                NgTableParams, NgTableService, CMPFService, operators) {
        $log.debug('ProvisioningOperationsOrganizationsOperatorsCtrl');

        $scope.operators = Restangular.stripRestangular(operators);
        $scope.operators.networkOperators = $filter('orderBy')($scope.operators.networkOperators, 'id');

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'id',
                    headerKey: 'Subsystems.Provisioning.Operators.Id'
                },
                {
                    fieldName: 'name',
                    headerKey: 'Subsystems.Provisioning.Operators.Name'
                },
                {
                    fieldName: 'parentName',
                    headerKey: 'Subsystems.Provisioning.Operators.ParentName'
                },
                {
                    fieldName: 'description',
                    headerKey: 'Subsystems.Provisioning.Operators.Description'
                },
                {
                    fieldName: 'orgType',
                    headerKey: 'Subsystems.Provisioning.Operators.Type'
                },
                {
                    fieldName: 'state',
                    headerKey: 'Subsystems.Provisioning.Operators.State'
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
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.operators.networkOperators);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.operators.networkOperators;
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

        $scope.showProvidedServices = function (organization) {
            $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/organizations/operations.organizations.operators.modal.services.html',
                controller: 'ProvisioningOperationsOrganizationsServicesModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    organizationName: function () {
                        return organization.name;
                    },
                    servicesOfPartner: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getServicesOfPartner(organization.id, 0, DEFAULT_REST_QUERY_LIMIT);
                    },
                    modalTitleKey: function () {
                        return 'Subsystems.Provisioning.Operators.ServicesModalTitle';
                    }
                }
            });
        };

        $scope.showServiceProviders = function (operator) {
            $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/organizations/operations.organizations.operators.modal.providers.html',
                controller: 'ProvisioningOperationsOrganizationsProvidersOfOrganizationsModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    operatorName: function () {
                        return operator.name;
                    },
                    partnersOfOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getPartnersOfOrganization(operator.id, 0, DEFAULT_REST_QUERY_LIMIT);
                    },
                    modalTitleKey: function () {
                        return 'Subsystems.Provisioning.Operators.ServiceProvidersModalTitle';
                    }
                }
            });
        };

        $scope.remove = function (operator) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                CMPFService.deleteOperator(operator).then(function (response) {
                    $log.debug('Removed. Response: ', response);

                    if (response && response.errorCode) {
                        CMPFService.showApiError(response);
                    } else {
                        var deletedListItem = _.findWhere($scope.operators.networkOperators, {id: operator.id});
                        $scope.operators.networkOperators = _.without($scope.operators.networkOperators, deletedListItem);

                        $scope.tableParams.reload();

                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });
                    }
                }, function (response) {
                    $log.debug('Cannot remove operator list. Error: ', response);

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

    ProvisioningOperationsOrganizationsOperatorsModule.controller('ProvisioningOperationsOrganizationsOperatorsNewCtrl', function ($scope, $state, $log, $controller, $translate, notification, CMPFService, Restangular,
                                                                                                                                   STATUS_TYPES) {
        $log.debug('ProvisioningOperationsOrganizationsOperatorsNewCtrl');

        $controller('ProvisioningOperationsOrganizationsOperatorsCommonCtrl', {$scope: $scope});

        $scope.STATUS_TYPES = STATUS_TYPES;

        $scope.operator = {
            name: '',
            description: '',
            state: STATUS_TYPES[0].name
        };

        $scope.save = function (operator) {
            $log.debug('Trying to save... Operator:', operator);

            var operatorItem = {
                name: operator.name,
                description: operator.description,
                state: operator.state,
                parentId: 0,
                profiles: []
            };

            CMPFService.createOperator([operatorItem]).then(function (response) {
                $log.debug('Save Success. Response: ', response);

                notification.flash({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $scope.cancel();
            }, function (response) {
                $log.debug('Cannot save new operator. Error: ', response);

                if (response.data.errorCode === 5025801 && response.data.errorDescription.indexOf('Duplicate entry')) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.CouldNotCreateNewProviderAlreadyDefined')
                    });
                }
            });
        };
    });

    ProvisioningOperationsOrganizationsOperatorsModule.controller('ProvisioningOperationsOrganizationsOperatorsUpdateCtrl', function ($scope, $state, $log, $controller, $translate, notification, Restangular, CMPFService,
                                                                                                                                      STATUS_TYPES, operator) {
        $log.debug('ProvisioningOperationsOrganizationsOperatorsUpdateCtrl');

        $controller('ProvisioningOperationsOrganizationsOperatorsCommonCtrl', {$scope: $scope});

        $scope.STATUS_TYPES = STATUS_TYPES;

        $scope.operator = Restangular.stripRestangular(operator);

        $scope.operatorOriginal = angular.copy($scope.operator);
        $scope.isNotChanged = function () {
            return angular.equals($scope.operatorOriginal, $scope.operator);
        };

        var prepareProfileListValuesJSON = function (array) {
            var objArray = [];
            _.each(array, function (value) {
                objArray.push({value: (_.isObject(value) ? String(value.value) : value)});
            });

            return objArray;
        };

        $scope.save = function (operator) {
            $log.debug('Trying Update... Operator: ', operator);

            var operatorItem = {
                // Set originals
                type: $scope.operatorOriginal.type,
                id: $scope.operatorOriginal.id,
                name: $scope.operatorOriginal.name,
                orgType: $scope.operatorOriginal.orgType,
                parentId: $scope.operatorOriginal.parentId,
                parentName: $scope.operatorOriginal.parentName,
                // Editable fields on the update mode
                description: operator.description,
                state: operator.state,
                profiles: (operator.profiles === undefined ? [] : operator.profiles)
            };

            CMPFService.updateOperator(operatorItem).then(function (response) {
                $log.debug('Update Success. Response: ', response);

                notification.flash({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $scope.cancel();
            }, function (response) {
                $log.debug('Cannot save new operator. Error: ', response);

                var res = Restangular.stripRestangular(response);
                notification({
                    type: 'warning',
                    text: $translate.instant('CommonMessages.ApiError', {
                        errorCode: res.data.errorCode,
                        errorText: res.data.errorDescription
                    })
                });
            });
        };
    });

})();