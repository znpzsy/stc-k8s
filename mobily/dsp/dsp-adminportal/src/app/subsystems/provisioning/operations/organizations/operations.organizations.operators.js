(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning.operations.organizations.operators', []);

    var ProvisioningOperationsOrganizationsOperatorsModule = angular.module('adminportal.subsystems.provisioning.operations.organizations.operators');

    ProvisioningOperationsOrganizationsOperatorsModule.config(function ($stateProvider) {

        // Operators states
        $stateProvider.state('subsystems.provisioning.operations.organizations.operators', {
            abstract: true,
            url: "",
            template: "<div ui-view></div>",
            data: {
                permissions: [
                    'CMPF__OPERATIONS_OPERATOR_READ'
                ]
            }
        }).state('subsystems.provisioning.operations.organizations.operators.list', {
            url: "/operators",
            templateUrl: "subsystems/provisioning/operations/organizations/operations.organizations.operators.html",
            controller: 'ProvisioningOperationsOrganizationsOperatorsCtrl',
            resolve: {
                operators: function (CMPFService) {
                    return CMPFService.getAllOperators(false, true, [CMPFService.OPERATOR_PROFILE]);
                }
            }
        }).state('subsystems.provisioning.operations.organizations.operators.update', {
            url: "/operators/:id",
            templateUrl: "subsystems/provisioning/operations/organizations/operations.organizations.operators.detail.html",
            controller: 'ProvisioningOperationsOrganizationsOperatorsUpdateCtrl',
            resolve: {
                operator: function ($stateParams, CMPFService) {
                    return CMPFService.getOperator($stateParams.id, true);
                }
            }
        });

    });

    // Operators controllers
    ProvisioningOperationsOrganizationsOperatorsModule.controller('ProvisioningOperationsOrganizationsOperatorsCommonCtrl', function ($scope, $log, $uibModal, CMPFService) {

        $log.debug('ProvisioningOperationsOrganizationsOperatorsCommonCtrl');

        $scope.prepareNewBulkOrganizationProfile = function (bulkOrganizationProfile) {
            return {
                "name": CMPFService.BULK_ORGANIZATION_PROFILE,
                "profileDefinitionName": CMPFService.BULK_ORGANIZATION_PROFILE,
                "attributes": [
                    {"name": "ContactPerson", "value": bulkOrganizationProfile.ContactPerson},
                    {"name": "Phone", "value": bulkOrganizationProfile.Phone},
                    {"name": "Email", "value": bulkOrganizationProfile.Email},
                    {"name": "Fax", "value": bulkOrganizationProfile.Fax},
                    {"name": "WebSite", "value": bulkOrganizationProfile.WebSite},
                    {"name": "Address", "value": bulkOrganizationProfile.Address}
                ]
            };
        };

        $scope.cancel = function () {
            $scope.go('subsystems.provisioning.operations.organizations.operators.list');
        };
    });

    ProvisioningOperationsOrganizationsOperatorsModule.controller('ProvisioningOperationsOrganizationsOperatorsCtrl', function ($scope, $state, $log, $filter, $uibModal, $translate, notification, Restangular,
                                                                                                                                NgTableParams, NgTableService, CMPFService, operators) {
        $log.debug('ProvisioningOperationsOrganizationsOperatorsCtrl');

        $scope.DEFAULT_ORGANIZATION_NAME = CMPFService.DEFAULT_ORGANIZATION_NAME;

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

        $scope.viewServiceProviders = function (operator) {
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
            operator.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                operator.rowSelected = false;

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
            }, function () {
                operator.rowSelected = false;
            });
        };
    });

    ProvisioningOperationsOrganizationsOperatorsModule.controller('ProvisioningOperationsOrganizationsOperatorsUpdateCtrl', function ($scope, $state, $log, $controller, $translate, notification, Restangular, CMPFService,
                                                                                                                                      STATUS_TYPES, operator) {
        $log.debug('ProvisioningOperationsOrganizationsOperatorsUpdateCtrl');

        $controller('ProvisioningOperationsOrganizationsOperatorsCommonCtrl', {$scope: $scope});

        $scope.STATUS_TYPES = STATUS_TYPES;

        $scope.operator = Restangular.stripRestangular(operator);
        // BulkOrganizationProfile
        var bulkOrganizationProfiles = CMPFService.getProfileAttributes($scope.operator.profiles, CMPFService.BULK_ORGANIZATION_PROFILE);
        if (bulkOrganizationProfiles.length > 0) {
            $scope.operator.bulkOrganizationProfile = angular.copy(bulkOrganizationProfiles[0]);
            $scope.operator.bulkMessagingOrganization = true;
        }

        $scope.operatorOriginal = angular.copy($scope.operator);
        $scope.isNotChanged = function () {
            return angular.equals($scope.operator, $scope.operatorOriginal);
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

            // If Bulk Messaging Organization flag enabled
            if (operator.bulkMessagingOrganization) {
                var originalBulkOrganizationProfiles = CMPFService.findProfilesByName(operatorItem.profiles, CMPFService.BULK_ORGANIZATION_PROFILE);

                var updatedBulkOrganizationProfile = JSON.parse(angular.toJson(operator.bulkOrganizationProfile));
                var originalBulkOrganizationProfile = _.findWhere(originalBulkOrganizationProfiles, {id: updatedBulkOrganizationProfile.profileId});

                var bulkOrganizationProfileAttrArray = CMPFService.prepareProfile(updatedBulkOrganizationProfile, originalBulkOrganizationProfile);
                // ---
                if (originalBulkOrganizationProfile) {
                    originalBulkOrganizationProfile.attributes = bulkOrganizationProfileAttrArray;
                } else {
                    var bulkOrganizationProfile = {
                        name: CMPFService.BULK_ORGANIZATION_PROFILE,
                        profileDefinitionName: CMPFService.BULK_ORGANIZATION_PROFILE,
                        attributes: bulkOrganizationProfileAttrArray
                    };

                    operatorItem.profiles.push(bulkOrganizationProfile);
                }
            } else {
                // Remove the bulk organization profiles
                operatorItem.profiles = _.without(operatorItem.profiles, _.findWhere(operator.profiles, {profileDefinitionName: CMPFService.BULK_ORGANIZATION_PROFILE}));
            }

            CMPFService.updateOperator(operatorItem).then(function (response) {
                $log.debug('Update Success. Response: ', response);

                if (response && response.errorCode) {
                    CMPFService.showApiError(response);
                } else {
                    notification.flash({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $scope.cancel();
                }
            }, function (response) {
                $log.debug('Cannot save new operator. Error: ', response);

                CMPFService.showApiError(response);
            });
        };
    });

})();