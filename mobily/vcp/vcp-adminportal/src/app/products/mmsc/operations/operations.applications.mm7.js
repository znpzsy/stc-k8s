(function () {

    'use strict';

    angular.module('adminportal.products.mmsc.operations.applications.mm7', [
        'adminportal.products.mmsc.operations.applications.mm7.tariffs'
    ]);

    var MMSCApplicationsMM7Module = angular.module('adminportal.products.mmsc.operations.applications.mm7');

    MMSCApplicationsMM7Module.config(function ($stateProvider) {

        $stateProvider.state('products.mmsc.operations.applications.mm7', {
            url: "/mm7",
            templateUrl: "products/mmsc/operations/operations.applications.mm7.html",
            controller: 'MMSCMM7OperationsCtrl',
            resolve: {
                vasApplications: function (MmscOperationService) {
                    return MmscOperationService.getOrderedVasApplicationList();
                }
            }
        }).state('products.mmsc.operations.applications.mm7-new', {
            url: "/mm7-new",
            templateUrl: "products/mmsc/operations/operations.applications.mm7.details.html",
            controller: 'MMSCMM7OperationsNewCtrl'
        }).state('products.mmsc.operations.applications.mm7-update', {
            url: "/mm7-update/:vasId",
            templateUrl: "products/mmsc/operations/operations.applications.mm7.details.html",
            controller: 'MMSCMM7OperationsUpdateCtrl',
            resolve: {
                vasApplication: function (MmscOperationService, $stateParams) {
                    var vasId = $stateParams.vasId;
                    return MmscOperationService.getVas(vasId);
                },
                organization: function (CMPFService, vasApplication) {
                    return CMPFService.getOperator(vasApplication.organizationId);
                }
            }
        });
    });

    MMSCApplicationsMM7Module.controller('MMSCMM7OperationsCtrl', function ($scope, $state, $log, $filter, $uibModal, notification, $translate, NgTableParams, NgTableService, ReportingExportService,
                                                                            UtilService, MmscOperationService, Restangular, vasApplications) {
        $log.debug('MMSCMM7OperationsCtrl');

        $scope.vasList = {
            list: vasApplications.vasList,
            tableParams: {}
        };

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.vasList.tableParams.settings().$scope.filterText = filterText;
            $scope.vasList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.vasList.tableParams.page(1);
            $scope.vasList.tableParams.reload();
        }, 500);

        $scope.vasList.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "vasId": 'asc'
            }
        }, {
            total: $scope.vasList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.vasList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.vasList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        $scope.remove = function (vas) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                MmscOperationService.deleteVas(vas.vasId).then(function (response) {
                    $log.debug('Removed vas. Response: ', response);

                    if (response && (response.errorCode || response.code)) {
                        notification({
                            type: 'warning',
                            text: $translate.instant('CommonMessages.ApiError', {
                                errorCode: response.errorCode || response.code,
                                errorText: response.errorMsg || response.message
                            })
                        });
                    } else {
                        var deletedListItem = _.findWhere($scope.vasList.list, {vasId: vas.vasId});
                        $scope.vasList.list = _.without($scope.vasList.list, deletedListItem);

                        $scope.vasList.tableParams.reload();

                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });
                    }
                }, function (response) {
                    $log.debug('Cannot remove operator. Error: ', response);
                });
            });
        };

        $scope.showTariffs = function (vas) {
            $uibModal.open({
                templateUrl: 'products/mmsc/operations/operations.applications.mm7.modal.tariffs.html',
                size: 'lg',
                controller: function ($scope, $uibModalInstance, $controller, MmscOperationService, Restangular) {
                    $scope.app = vas;
                    MmscOperationService.getVasTariffs(vas.vasId).then(function (response) {
                        var tariffs = Restangular.stripRestangular(response);

                        $controller('MMSCApplicationsTariffsCtrl', {
                            $scope: $scope,
                            $uibModalInstance: $uibModalInstance,
                            tariffs: tariffs
                        });
                    });
                }
            });
        };

        $scope.exportRecords = function (mimeType) {
            var srcUrl = '/mmsc-operation-gr-rest/v1/services/export?response-content-type=' + mimeType;

            $log.debug('Downloading MMSC mm7 applicataion records. URL: ', srcUrl);

            ReportingExportService.showReport(srcUrl, mimeType.toUpperCase());
        };

    });

    MMSCApplicationsMM7Module.controller('MMSCMM7OperationsNewCtrl', function ($scope, $state, $log, $filter, $uibModal, $translate, MmscOperationService, STATUS_TYPES, Restangular, notification,
                                                                               SENDER_ADDRESS_POLICY, SURPLUSRECIPIENTSPOLICY,  MMSC_DELIVERY_REPORT_POLICY) {
        $log.debug('MMSCMM7OperationsNewCtrl');

        $scope.STATUS_TYPES = STATUS_TYPES;
        $scope.state = STATUS_TYPES[0];
        $scope.senderAddressPolicies = SENDER_ADDRESS_POLICY;
        $scope.senderAddressPolicy = SENDER_ADDRESS_POLICY[0];
        $scope.policies = SURPLUSRECIPIENTSPOLICY;
        $scope.policy = SURPLUSRECIPIENTSPOLICY[0];
        $scope.app = {};
        $scope.deliveryReportAOMTPolicies = MMSC_DELIVERY_REPORT_POLICY;
        $scope.deliveryReportMOATPolicies = MMSC_DELIVERY_REPORT_POLICY.slice(0, 2);
        $scope.deliveryReportAOMTPolicy = MMSC_DELIVERY_REPORT_POLICY[1];
        $scope.deliveryReportMOATPolicy = MMSC_DELIVERY_REPORT_POLICY[1];

        $scope.openServiceProviders = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.organizations.html',
                controller: 'OrganizationsModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    organizationParameter: function () {
                        return $scope.app.organization;
                    },
                    itemName: function () {
                        return $scope.app.vasId;
                    },
                    allOrganizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllOrganizations(0, DEFAULT_REST_QUERY_LIMIT);
                    },
                    organizationsModalTitleKey: function () {
                        return 'Products.MMSC.Operations.Applications.MM7.OrganizationModalTitle';
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.organization = selectedItem.organization;

                if ($scope.organization) {
                    $scope.app.organizationId = $scope.organization.id;
                }
            });
        };

        $scope.save = function () {
            $scope.app.status = $scope.state === STATUS_TYPES[1] ? 'DISABLED' : 'ENABLED';
            $scope.app.senderAddressPolicy = $scope.senderAddressPolicy;
            $scope.app.policy = $scope.policy === SURPLUSRECIPIENTSPOLICY[0] ? 'Accept' : 'Reject';

            $scope.app.organizationId = $scope.organization.id;

            $scope.app.sendDeliveryReport = MMSC_DELIVERY_REPORT_POLICY.indexOf($scope.deliveryReportAOMTPolicy);
            $scope.app.requestDeliveryReport = MMSC_DELIVERY_REPORT_POLICY.indexOf($scope.deliveryReportMOATPolicy);
            MmscOperationService.createVas($scope.app).then(function (response) {
                $log.debug('Created vas: ', response);

                var apiResponse = Restangular.stripRestangular(response);

                if (apiResponse && (apiResponse.errorCode || apiResponse.code)) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: apiResponse.errorCode || apiResponse.code,
                            errorText: apiResponse.errorMsg || apiResponse.message
                        })
                    });
                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $scope.go('products.mmsc.operations.applications.mm7');
                }
            }, function (response) {
                $log.debug('Cannot create vas: ', response);
            });
        };

        $scope.cancel = function () {
            $scope.go('products.mmsc.operations.applications.mm7');
        };
    });

    MMSCApplicationsMM7Module.controller('MMSCMM7OperationsUpdateCtrl', function ($scope, $state, $log, $filter, $uibModal, $translate, MmscOperationService, vasApplication, organization, STATUS_TYPES, Restangular, notification,
                                                                                  SENDER_ADDRESS_POLICY, SURPLUSRECIPIENTSPOLICY, MMSC_DELIVERY_REPORT_POLICY) {

        $log.debug('MMSCMM7OperationsUpdateCtrl');

        $scope.app = vasApplication;
        $scope.organization = organization;

        $scope.STATUS_TYPES = STATUS_TYPES;
        if ($scope.app.status == 'DISABLED') {
            $scope.state = STATUS_TYPES[1];
        } else {
            $scope.state = STATUS_TYPES[0];
        }
        $scope.senderAddressPolicies = SENDER_ADDRESS_POLICY;
        if (angular.equals($scope.app.senderAddressPolicy, SENDER_ADDRESS_POLICY[0])) {
            $scope.senderAddressPolicy = SENDER_ADDRESS_POLICY[0];
        } else {
            $scope.senderAddressPolicy = SENDER_ADDRESS_POLICY[1];
        }
        $scope.policies = SURPLUSRECIPIENTSPOLICY;
        if ($scope.app.policy == 'Accept') {
            $scope.policy = SURPLUSRECIPIENTSPOLICY[0];
        } else {
            $scope.policy = SURPLUSRECIPIENTSPOLICY[1];
        }
        $scope.deliveryReportAOMTPolicies = MMSC_DELIVERY_REPORT_POLICY;
        $scope.deliveryReportMOATPolicies = MMSC_DELIVERY_REPORT_POLICY.slice(0, 2);
        $scope.deliveryReportAOMTPolicy = MMSC_DELIVERY_REPORT_POLICY[vasApplication.sendDeliveryReport];
        $scope.deliveryReportMOATPolicy = MMSC_DELIVERY_REPORT_POLICY[vasApplication.requestDeliveryReport];

        $scope.originalApp = angular.copy($scope.app);
        $scope.originalState = angular.copy($scope.state);
        $scope.originalSenderAddressPolicy = angular.copy($scope.senderAddressPolicy);
        $scope.originalPolicy = angular.copy($scope.policy);
        $scope.isConfigurationNotChanged = function () {
            return angular.equals($scope.originalApp, $scope.app) &&
                angular.equals($scope.originalState, $scope.state) &&
                angular.equals($scope.originalSenderAddressPolicy, $scope.senderAddressPolicy) &&
                angular.equals($scope.originalPolicy, $scope.policy) &&
                angular.equals(MMSC_DELIVERY_REPORT_POLICY[vasApplication.sendDeliveryReport], $scope.deliveryReportAOMTPolicy) &&
                angular.equals(MMSC_DELIVERY_REPORT_POLICY[vasApplication.requestDeliveryReport], $scope.deliveryReportMOATPolicy);
        };

        $scope.openServiceProviders = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.organizations.html',
                controller: 'OrganizationsModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    organizationParameter: function () {
                        return $scope.app.organization;
                    },
                    itemName: function () {
                        return $scope.app.vasId;
                    },
                    allOrganizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllOrganizations(0, DEFAULT_REST_QUERY_LIMIT);
                    },
                    organizationsModalTitleKey: function () {
                        return 'Products.MMSC.Operations.Applications.MM7.OrganizationModalTitle';
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.organization = selectedItem.organization;

                if ($scope.organization) {
                    $scope.app.organizationId = $scope.organization.id;
                }
            });
        };

        $scope.save = function () {
            $scope.app.status = $scope.state === STATUS_TYPES[1] ? 'DISABLED' : 'ENABLED';
            $scope.app.senderAddressPolicy = $scope.senderAddressPolicy;
            $scope.app.policy = $scope.policy === SURPLUSRECIPIENTSPOLICY[0] ? 'Accept' : 'Reject';

            $scope.app.organizationId = $scope.organization.id;

            $scope.app.sendDeliveryReport = MMSC_DELIVERY_REPORT_POLICY.indexOf($scope.deliveryReportAOMTPolicy);
            $scope.app.requestDeliveryReport = MMSC_DELIVERY_REPORT_POLICY.indexOf($scope.deliveryReportMOATPolicy);
            MmscOperationService.updateVas($scope.app.vasId, $scope.app).then(function (response) {
                $log.debug('Updated vas: ', response);

                var apiResponse = Restangular.stripRestangular(response);

                if (apiResponse && (apiResponse.errorCode || apiResponse.code)) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: apiResponse.errorCode || apiResponse.code,
                            errorText: apiResponse.errorMsg || apiResponse.message
                        })
                    });
                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $scope.go('products.mmsc.operations.applications.mm7');
                }
            }, function (response) {
                $log.debug('Cannot update vas: ', response);
            });
        };

        $scope.cancel = function () {
            $scope.go('products.mmsc.operations.applications.mm7');
        };
    });

    MMSCApplicationsMM7Module.constant('SENDER_ADDRESS_POLICY', [
        'VAS_SHORT_CODE', 'VAS_SENDER_FREELY_SET'
    ]);

    MMSCApplicationsMM7Module.constant('SURPLUSRECIPIENTSPOLICY', [
        'ACCEPT', 'REJECT'
    ]);

})();
