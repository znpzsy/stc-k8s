(function () {

    'use strict';

    angular.module('adminportal.products.usc.operations.wsapps', []);

    var USCOperationsWSAppsModule = angular.module('adminportal.products.usc.operations.wsapps');

    USCOperationsWSAppsModule.config(function ($stateProvider) {

        $stateProvider.state('products.usc.operations.applications.wsapps', {
            url: "/wsapps",
            templateUrl: "products/usc/operations/operations.wsapps.html",
            controller: 'USCWsAppsOperationsCtrl',
            resolve: {
                organizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizations(0, DEFAULT_REST_QUERY_LIMIT);
                },
                applications: function (UssdBrowserService) {
                    return UssdBrowserService.getApplications();
                }
            }
        }).state('products.usc.operations.applications.wsappsnew', {
            url: "/wsapps/new",
            templateUrl: "products/usc/operations/operations.wsapps.detail.html",
            controller: 'USCNewWsAppsOperationsCtrl'
        }).state('products.usc.operations.applications.wsappsupdate', {
            url: "/wsapps/:appName/:orgId",
            templateUrl: "products/usc/operations/operations.wsapps.detail.html",
            controller: 'USCUpdateWsAppsOperationsCtrl',
            resolve: {
                application: function ($stateParams, $q, $translate, notification, UssdBrowserService) {
                    var deferred = $q.defer();

                    UssdBrowserService.getApplication($stateParams.appName).then(function (response) {
                        if (_.isEmpty(response) || response === undefined || response.serviceId === undefined) {
                            notification({
                                type: 'warning',
                                text: $translate.instant('Products.USC.Operations.ApplicationNotFound')
                            });

                            deferred.reject();
                        } else {
                            deferred.resolve(response);
                        }
                    }, function (response) {
                        deferred.reject();
                    });

                    return deferred.promise;
                },
                organization: function ($stateParams, CMPFService) {
                    if ($stateParams.orgId) {
                        return CMPFService.getPartner($stateParams.orgId);
                    } else {
                        return {
                            id: 1,
                            name: CMPFService.DEFAULT_ORGANIZATION_NAME
                        };
                    }
                }
            }
        });

    });

    USCOperationsWSAppsModule.controller('USCWsAppsOperationsCtrl', function ($scope, $log, NgTableParams, NgTableService, $uibModal, $translate, $filter, CMPFService,
                                                                              UssdBrowserService, Restangular, notification, organizations, applications) {
        $log.debug("USCWsAppsOperationsCtrl");

        organizations = Restangular.stripRestangular(organizations).organizations;
        $scope.applications = Restangular.stripRestangular(applications);
        // Finds suitable organizations for each ws applications and set to it.
        _.each($scope.applications, function (wsApp) {
            var foundOrganization = _.findWhere(organizations, {"id": s.toNumber(wsApp.corporateId)});
            wsApp.organization = _.isUndefined(foundOrganization) ? CMPFService.DEFAULT_ORGANIZATION_NAME : foundOrganization.name;
            wsApp.shortCode = s.toNumber(wsApp.shortCode);
            wsApp.serviceId = s.toNumber(wsApp.serviceId);
        });
        $scope.applications = $filter('orderBy')($scope.applications, 'name');

        $log.debug('Ussd Browser applications: ', $scope.applications);

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'serviceId',
                    headerKey: 'Products.USC.Operations.AppId'
                },
                {
                    fieldName: 'name',
                    headerKey: 'Products.USC.Operations.AppName'
                },
                {
                    fieldName: 'organization',
                    headerKey: 'Products.USC.Operations.Organization'
                },
                {
                    fieldName: 'shortCode',
                    headerKey: 'Products.USC.Operations.ShortCode'
                },
                {
                    fieldName: 'state',
                    headerKey: 'Products.USC.Operations.State',
                    filter: {name: 'StatusTypeFilter'}
                },
                {
                    fieldName: 'sessionShortcode',
                    headerKey: 'Products.USC.Operations.SessionShortCode'
                },
                {
                    fieldName: 'msisdnType',
                    headerKey: 'Products.USC.Operations.MsisdnType'
                },
                {
                    fieldName: 'isAuthorizationActive',
                    headerKey: 'Products.USC.Operations.IsAuthorizationActive',
                    filter: {name: 'YesNoFilter'}
                },
                {
                    fieldName: 'username',
                    headerKey: 'Products.USC.Operations.UserName'
                },
                {
                    fieldName: 'webServiceUrl',
                    headerKey: 'Products.USC.Operations.WebServiceUrl'
                },
                {
                    fieldName: 'requestTimeout',
                    headerKey: 'Products.USC.Operations.RequestTimeout'
                },
                {
                    fieldName: 'appSessionLimit',
                    headerKey: 'Products.USC.Operations.AppSessionLimit'
                },
                {
                    fieldName: 'rateLimiterActive',
                    headerKey: 'Products.USC.Operations.RateLimiterActive',
                    filter: {name: 'YesNoFilter'}
                },
                {
                    fieldName: 'tpm',
                    headerKey: 'Products.USC.Operations.Tpm'
                },
                {
                    fieldName: 'routingApp',
                    headerKey: 'Products.USC.Operations.RoutingApp',
                    filter: {name: 'YesNoFilter'}
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
            total: 10,
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.applications);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.applications;
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
                UssdBrowserService.deleteApplication(app).then(function (response) {
                    $log.debug('Removed Web Application: ', response);

                    var deletedListItem = _.findWhere($scope.applications, {
                        name: app.name
                    });
                    $scope.applications = _.without($scope.applications, deletedListItem);

                    $scope.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot remove app. Error: ', response);
                });
            });
        };

    });

    USCOperationsWSAppsModule.controller('USCNewWsAppsOperationsCtrl', function ($scope, $log, $uibModal, $translate, notification, Restangular, UssdBrowserService, CMPFService,
                                                                                 USC_STATUS_TYPES, USC_MSISDN_TYPES, USC_ACCESS_PROTOCOLS) {
        $log.debug("USCNewWsAppsOperationsCtrl");

        $scope.USC_STATUS_TYPES = USC_STATUS_TYPES;
        $scope.USC_MSISDN_TYPES = USC_MSISDN_TYPES;
        $scope.USC_ACCESS_PROTOCOLS = USC_ACCESS_PROTOCOLS;

        $scope.app = {
            msisdnType: $scope.USC_MSISDN_TYPES[0],
            requestTimeout: 10,
            tpm: 1,
            isAuthorizationActive: false,
            appSessionLimit: 0,
            rateLimiterActive: false,
            routingApp: false,
            accessProtocol: 'SOAP'
        };

        $scope.state = $scope.USC_STATUS_TYPES[0];

        $scope.operator = {};
        $scope.shortCode = {};

        $scope.isStcOrganization = function (organization) {
            return !_.isUndefined(organization) && (organization.name === CMPFService.DEFAULT_ORGANIZATION_NAME);
        };

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
                        return 'Products.USC.Operations.OrganizationModalTitleWSApp';
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.shortCode = {};

                if (selectedItem)
                    $scope.operator.organization = selectedItem.organization;

                $scope.ussdCorporateCodeList = [];

                // If there are profiles and selected organization different from STC
                if ($scope.operator.organization && $scope.operator.organization.profiles && !$scope.isStcOrganization($scope.operator.organization)) {
                    var ussdCorporateCodeList = CMPFService.extractUssdCorporateCodeListProfile($scope.operator.organization);
                    if (ussdCorporateCodeList && ussdCorporateCodeList.length > 0) {
                        $scope.ussdCorporateCodeList = ussdCorporateCodeList;
                        $scope.shortCode = {
                            profile: $scope.ussdCorporateCodeList[0]
                        };
                    } else {
                        notification({
                            type: 'warning',
                            text: $translate.instant('CommonMessages.ThereIsNoCorporateDetailProfile')
                        });
                    }
                }
            }, function () {
                // ignored
            });
        };

        $scope.save = function () {
            $scope.app.state = ($scope.state === $scope.USC_STATUS_TYPES[0]);

            if ($scope.operator.organization) {
                $scope.app.corporateId = $scope.operator.organization.id;
            }

            if ($scope.shortCode.profile) {
                $scope.app.shortCode = $scope.shortCode.profile.ussdCode;
            } else {
                $scope.app.shortCode = $scope.shortCode.local;
            }

            UssdBrowserService.addApplication($scope.app).then(function (response) {
                $log.debug('Added Ussd Browser application: ', response);
                var apiResponse = Restangular.stripRestangular(response);
                if (apiResponse.errorCode) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: apiResponse.errorCode,
                            errorText: apiResponse.errorText
                        })
                    });
                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                    $scope.go('products.usc.operations.applications.wsapps');
                }
            }, function (response) {
                if (response.message) {
                    notification({
                        type: 'warning',
                        text: response.message
                    });
                }

                $log.debug('Cannot add ussd browser application. Error: ', response);
            });
        };

        $scope.cancel = function () {
            $scope.go('products.usc.operations.applications.wsapps');
        };
    });

    USCOperationsWSAppsModule.controller('USCUpdateWsAppsOperationsCtrl', function ($scope, $log, $stateParams, $uibModal, $translate, notification, Restangular, UssdBrowserService,
                                                                                    CMPFService, USC_STATUS_TYPES, USC_MSISDN_TYPES, USC_ACCESS_PROTOCOLS, application, organization) {
        $log.debug("USCUpdateWsAppsOperationsCtrl");

        $scope.USC_STATUS_TYPES = USC_STATUS_TYPES;
        $scope.USC_MSISDN_TYPES = USC_MSISDN_TYPES;
        $scope.USC_ACCESS_PROTOCOLS = USC_ACCESS_PROTOCOLS;

        $scope.isStcOrganization = function (organization) {
            return !_.isUndefined(organization) && (organization.name === CMPFService.DEFAULT_ORGANIZATION_NAME);
        };

        $scope.app = application;
        $scope.app.id = _.uniqueId();
        $scope.app.sessionShortcode = ($scope.app.sessionShortcode ? s.toNumber($scope.app.sessionShortcode) : undefined);
        $scope.operator = {organization: organization};
        $scope.shortCode = {};
        $scope.ussdCorporateCodeList = [];
        $scope.state = ($scope.app.state ? $scope.USC_STATUS_TYPES[0] : $scope.USC_STATUS_TYPES[1]);

        // If there are profiles and selected organization different from STC
        if ($scope.operator.organization.profiles && !$scope.isStcOrganization($scope.operator.organization)) {
            var ussdCorporateCodeList = CMPFService.extractUssdCorporateCodeListProfile($scope.operator.organization);
            if (ussdCorporateCodeList && ussdCorporateCodeList.length > 0) {
                $scope.ussdCorporateCodeList = ussdCorporateCodeList;
                $scope.shortCode.profile = _.findWhere($scope.ussdCorporateCodeList, {ussdCode: s.toNumber($scope.app.shortCode)});
            } else {
                notification({
                    type: 'warning',
                    text: $translate.instant('CommonMessages.ThereIsNoCorporateDetailProfile')
                });
            }
        } else {
            $scope.shortCode.local = s.toNumber($scope.app.shortCode);
        }

        $scope.originalApp = angular.copy($scope.app);
        $scope.originalState = angular.copy($scope.state);
        $scope.originalOperator = angular.copy($scope.operator);
        $scope.originalShortCode = angular.copy($scope.shortCode);
        $scope.isConfigurationNotChanged = function () {
            return angular.equals($scope.originalApp, $scope.app) &&
                angular.equals($scope.originalState, $scope.state) &&
                angular.equals($scope.originalOperator, $scope.operator) &&
                angular.equals($scope.originalShortCode, $scope.shortCode);
        };

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
                        return 'Products.USC.Operations.OrganizationModalTitleWSApp';
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.shortCode = {};

                if (selectedItem)
                    $scope.operator.organization = selectedItem.organization;

                $scope.ussdCorporateCodeList = [];

                // If there are profiles and selected organization different from STC
                if ($scope.operator.organization && $scope.operator.organization.profiles && !$scope.isStcOrganization($scope.operator.organization)) {
                    var ussdCorporateCodeList = CMPFService.extractUssdCorporateCodeListProfile($scope.operator.organization);
                    if (ussdCorporateCodeList && ussdCorporateCodeList.length > 0) {
                        $scope.ussdCorporateCodeList = ussdCorporateCodeList;
                        $scope.shortCode = {
                            profile: $scope.ussdCorporateCodeList[0]
                        };
                    } else {
                        notification({
                            type: 'warning',
                            text: $translate.instant('CommonMessages.ThereIsNoCorporateDetailProfile')
                        });
                    }
                }
            }, function () {
                // ignored
            });
        };

        $scope.save = function () {
            var app = angular.copy($scope.app);

            app.state = ($scope.state === $scope.USC_STATUS_TYPES[0]);

            if ($scope.operator.organization) {
                app.corporateId = $scope.operator.organization.id;
            }

            if ($scope.shortCode.profile) {
                app.shortCode = $scope.shortCode.profile.ussdCode;
            } else {
                app.shortCode = $scope.shortCode.local;
            }

            app.serviceId = $scope.originalApp.serviceId;
            delete app.id;

            UssdBrowserService.updateApplication(app).then(function (response) {
                $log.debug('Updated ussd Browser application: ', response);
                var apiResponse = Restangular.stripRestangular(response);
                if (apiResponse.errorCode) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: apiResponse.errorCode,
                            errorText: apiResponse.errorText
                        })
                    });
                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                    $scope.go('products.usc.operations.applications.wsapps');
                }
            }, function (response) {
                $log.debug('Cannot update ussd application. Error: ', response);
            });
        };

        $scope.cancel = function () {
            $scope.go('products.usc.operations.applications.wsapps');
        };
    });


})();
