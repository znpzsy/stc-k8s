(function () {

    'use strict';

    angular.module('adminportal.products.usc.operations.smppapps', []);

    var USCOperationsSMPPAppsModule = angular.module('adminportal.products.usc.operations.smppapps');

    USCOperationsSMPPAppsModule.config(function ($stateProvider) {

        $stateProvider.state('products.usc.operations.applications.smppapps', {
            url: "/smppapps",
            templateUrl: "products/usc/operations/operations.smppapps.html",
            controller: 'USCSmppAppsOperationsCtrl',
            resolve: {
                organizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizations(0, DEFAULT_REST_QUERY_LIMIT);
                },
                ussdApplications: function (UssdGwProvService) {
                    return UssdGwProvService.getAllUssdApplications();
                }
            }
        }).state('products.usc.operations.applications.smppappsnew', {
            url: "/smppapps/new",
            templateUrl: "products/usc/operations/operations.smppapps.detail.html",
            controller: 'USCNewSmppAppsOperationsCtrl'
        }).state('products.usc.operations.applications.smppappsupdate', {
            url: "/smppapps/:appId",
            templateUrl: "products/usc/operations/operations.smppapps.detail.html",
            controller: 'USCUpdateSmppAppsOperationsCtrl',
            resolve: {
                ussdApplication: function ($stateParams, UssdGwProvService) {
                    return UssdGwProvService.getUssdApplication($stateParams.appId);
                }
            }
        });

    });

    USCOperationsSMPPAppsModule.controller('USCSmppAppsOperationsCtrl', function ($scope, $log, NgTableParams, NgTableService, $uibModal, $filter, notification, CMPFService,
                                                                                  $translate, UssdGwProvService, Restangular, ussdApplications, organizations) {
        $log.debug("USCSmppAppsOperationsCtrl");

        $scope.ussdApplications = Restangular.stripRestangular(ussdApplications);
        organizations = Restangular.stripRestangular(organizations).organizations;

        // Finds suitable organizations for each smpp applications and set to it.
        _.each($scope.ussdApplications, function (ussdApplication) {
            var foundOrganization = _.findWhere(organizations, {"id": Number(ussdApplication.organizationId)});
            ussdApplication.organization = _.isUndefined(foundOrganization) ? {name: CMPFService.DEFAULT_ORGANIZATION_NAME} : foundOrganization;
        });
        $scope.ussdApplications = $filter('orderBy')($scope.ussdApplications, 'name');

        $log.debug('All Smpp Applications : ', ussdApplications);

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'id',
                    headerKey: 'Products.USC.Operations.AppId'
                },
                {
                    fieldName: 'name',
                    headerKey: 'Products.USC.Operations.AppName'
                },
                {
                    fieldName: 'descriptiveText',
                    headerKey: 'Products.USC.Operations.Description'
                },
                {
                    fieldName: 'organization.name',
                    headerKey: 'Products.USC.Operations.Organization'
                },
                {
                    fieldName: 'state',
                    headerKey: 'Products.USC.Operations.State'
                },
                {
                    fieldName: 'systemId',
                    headerKey: 'Products.USC.Operations.SystemId'
                },
                {
                    fieldName: 'direction',
                    headerKey: 'Products.USC.Operations.Direction'
                },
                {
                    fieldName: 'inputWindowSize',
                    headerKey: 'Products.USC.Operations.InputWindowSize'
                },
                {
                    fieldName: 'outputWindowSize',
                    headerKey: 'Products.USC.Operations.OutputWindowSize'
                },
                {
                    fieldName: 'maxConnections',
                    headerKey: 'Products.USC.Operations.MaxConnections'
                },
                {
                    fieldName: 'transactionResponseTimeout',
                    headerKey: 'Products.USC.Operations.TransactionResponseTimeout'
                },
                {
                    fieldName: 'sessionLimit',
                    headerKey: 'Products.USC.Operations.UssdSessionLimit'
                }
            ]
        };

        $scope.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "name": 'asc'
            }
        }, {
            total: $scope.ussdApplications.length,
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.ussdApplications);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.ussdApplications;
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

        $scope.remove = function (app) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Deleting Smpp Application: ', app);

                UssdGwProvService.deleteUssdApplication(app).then(function (response) {
                    $log.debug('Deleted Smpp Application: ', response);

                    var deletedListItem = _.findWhere($scope.ussdApplications, {
                        id: app.id
                    });
                    $scope.ussdApplications = _.without($scope.ussdApplications, deletedListItem);

                    $scope.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete Smpp Application : ', response);
                });
            });
        };

        $scope.showServiceCodeRoutings = function (app) {
            $uibModal.open({
                templateUrl: 'products/usc/operations/operations.smppapps.modal.routings.html',
                controller: 'USCRoutingModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    appRouting: function (UssdGwConfService) {
                        return UssdGwConfService.getApplicationRouting(app.id);
                    },
                    appIdParameter: function () {
                        return app.id;
                    },
                    appNameParameter: function () {
                        return app.name;
                    }
                }
            });
        };
    });

    USCOperationsSMPPAppsModule.controller('USCNewSmppAppsOperationsCtrl', function ($scope, $log, $uibModal, notification, $translate, Restangular, UssdGwProvService,
                                                                                     USC_STATUS_TYPES, USC_APPS_DIRECTIONS) {
        $log.debug("USCNewSmppAppsOperationsCtrl");

        $scope.USC_STATUS_TYPES = USC_STATUS_TYPES;
        $scope.USC_APPS_DIRECTIONS = USC_APPS_DIRECTIONS;

        $scope.app = {
            state: USC_STATUS_TYPES[0],
            direction: USC_APPS_DIRECTIONS[0],
            inputWindowSize: 1000,
            outputWindowSize: 1000,
            maxConnections: 2,
            transactionResponseTimeout: 20000,
            sessionLimit: 100,
            sourceAddressOverride: false,
            sourceAddressValidation: false,
            organizationId: ''
        };

        $scope.operator = {};

        $scope.showOperators = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.organizations.html',
                controller: 'OrganizationsModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    organizationParameter: function () {
                        return $scope.operator.organization;
                    },
                    itemName: function () {
                        return $scope.app.name;
                    },
                    allOrganizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllOrganizations(0, DEFAULT_REST_QUERY_LIMIT, true);
                    },
                    organizationsModalTitleKey: function () {
                        return 'Products.USC.Operations.OrganizationModalTitleSMPPApp';
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.operator.organization = selectedItem.organization;
            }, function () {
                // ignored
            });
        };

        $scope.save = function () {
            if ($scope.operator.organization) {
                $scope.app.organizationId = $scope.operator.organization.id;
            }

            UssdGwProvService.addUssdApplication($scope.app).then(function (response) {
                $log.debug('Added Smpp Application : ', response);
                var apiResponse = Restangular.stripRestangular(response);
                if (apiResponse.errorCode) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: apiResponse.errorCode,
                            errorText: apiResponse.errorMsg
                        })
                    });
                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                    $scope.go('products.usc.operations.applications.smppapps');
                }
            }, function (response) {
                $log.debug('Cannot add Smpp Application : ', response);
            });
        };

        $scope.cancel = function () {
            $log.debug('Cancel');
            $scope.go('products.usc.operations.applications.smppapps');
        };
    });

    USCOperationsSMPPAppsModule.controller('USCUpdateSmppAppsOperationsCtrl', function ($scope, $log, $stateParams, $uibModal, notification, $translate, Restangular, UssdGwProvService, CMPFService,
                                                                                        USC_STATUS_TYPES, USC_APPS_DIRECTIONS, ussdApplication) {
        $log.debug("USCUpdateSmppAppsOperationsCtrl");

        $scope.USC_STATUS_TYPES = USC_STATUS_TYPES;
        $scope.USC_APPS_DIRECTIONS = USC_APPS_DIRECTIONS;

        $scope.app = Restangular.stripRestangular(ussdApplication);
        $scope.operator = {
            organization: {
                id: 1,
                name: CMPFService.DEFAULT_ORGANIZATION_NAME
            }
        };

        $scope.originalApp = angular.copy($scope.app);
        $scope.originalOperator = angular.copy($scope.operator);
        $scope.isConfigurationNotChanged = function () {
            return angular.equals($scope.originalApp, $scope.app) && angular.equals($scope.originalOperator, $scope.operator);
        };

        var findOrganization = function (orgId) {
            if (orgId) {
                return CMPFService.getPartner(orgId).then(function (response) {
                    $scope.operator = {
                        organization: Restangular.stripRestangular(response)
                    };

                    $scope.originalOperator = angular.copy($scope.operator);
                }, function (response) {
                    $log.debug('Cannot read organization. Error: ', response);
                });
            }
        };

        findOrganization($scope.app.organizationId);

        $scope.showOperators = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.organizations.html',
                controller: 'OrganizationsModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    organizationParameter: function () {
                        return $scope.operator.organization;
                    },
                    itemName: function () {
                        return $scope.app.name;
                    },
                    allOrganizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllOrganizations(0, DEFAULT_REST_QUERY_LIMIT, true);
                    },
                    organizationsModalTitleKey: function () {
                        return 'Products.USC.Operations.OrganizationModalTitleSMPPApp';
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.operator.organization = selectedItem.organization;
            }, function () {
                // ignored
            });
        };

        $scope.save = function () {
            if ($scope.operator.organization) {
                $scope.app.organizationId = $scope.operator.organization.id;
            }

            UssdGwProvService.updateUssdApplication($scope.app).then(function (response) {
                $log.debug('Updated Smpp Application : ', response);
                var apiResponse = Restangular.stripRestangular(response);
                if (apiResponse.errorCode) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: apiResponse.errorCode,
                            errorText: apiResponse.msg
                        })
                    });
                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                    $scope.go('products.usc.operations.applications.smppapps');
                }
            }, function (response) {
                $log.debug('Cannot update Smpp Application : ', response);
            });
        };

        $scope.cancel = function () {
            $log.debug('Cancel');
            $scope.go('products.usc.operations.applications.smppapps');
        };
    });

})();
