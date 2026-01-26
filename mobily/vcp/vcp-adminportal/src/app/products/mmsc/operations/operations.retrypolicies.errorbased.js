(function () {

    'use strict';

    angular.module('adminportal.products.mmsc.operations.retrypolicies.errorbased', []);

    var MMSCOperationsRetryPoliciesErrorBasedModule = angular.module('adminportal.products.mmsc.operations.retrypolicies.errorbased');

    MMSCOperationsRetryPoliciesErrorBasedModule.config(function ($stateProvider) {

        $stateProvider.state('products.mmsc.operations.retrypolicies.errorbased', {
            url: "/errorbased",
            templateUrl: "products/mmsc/operations/operations.retrypolicies.errorbased.html",
            controller: 'MMSCOperationsRetryPoliciesErrorBasedCtrl',
            resolve: {
                errorBased: function (MmscOperationService) {
                    return MmscOperationService.getErrorCodePolicies();
                }
            }
        }).state('products.mmsc.operations.retrypolicies.errorbased-new', {
            url: "/errorbased-new",
            templateUrl: "products/mmsc/operations/operations.retrypolicies.errorbased.detail.html",
            controller: 'MMSCOperationsRetryPoliciesErrorBasedNewCtrl'
        }).state('products.mmsc.operations.retrypolicies.errorbased-update', {
            url: "/errorbased-update/:context/:code",
            templateUrl: "products/mmsc/operations/operations.retrypolicies.errorbased.detail.html",
            controller: 'MMSCOperationsRetryPoliciesErrorBasedUpdateCtrl',
            resolve: {
                policy: function ($stateParams, MmscOperationService) {
                    return MmscOperationService.getErrorCodePolicy($stateParams.context, $stateParams.code);
                }
            }
        });
    });

    MMSCOperationsRetryPoliciesErrorBasedModule.controller('MMSCOperationsRetryPoliciesErrorBasedCtrl', function ($scope, $state, $log, $filter, $uibModal, notification, $translate, NgTableParams, NgTableService,
                                                                                                                  ReportingExportService, UtilService, MmscOperationService, errorBased) {
        $log.debug('MMSCOperationsRetryPoliciesErrorBasedCtrl');

        // Error policy list
        $scope.policyList = {
            list: errorBased.errorPolicy,
            tableParams: {}
        };

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.policyList.tableParams.settings().$scope.filterText = filterText;
            $scope.policyList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.policyList.tableParams.page(1);
            $scope.policyList.tableParams.reload();
        }, 500);

        $scope.policyList.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "errorCode": 'asc'
            }
        }, {
            total: $scope.policyList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.policyList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.policyList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

        $scope.remove = function (data) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });
            modalInstance.result.then(function () {
                MmscOperationService.deleteErrorCodePolicy(data.errorContext, data.errorCode).then(function (response) {
                    $log.debug('Removed error code');

                    if (response && (response.errorCode || response.code)) {
                        notification({
                            type: 'warning',
                            text: $translate.instant('CommonMessages.ApiError', {
                                errorCode: response.errorCode || response.code,
                                errorText: response.errorMsg || response.message
                            })
                        });
                    } else {
                        $scope.policyList.list = _.without($scope.policyList.list, data);
                        $scope.policyList.tableParams.reload();

                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });
                    }
                }, function (response) {
                    $log.debug('Cannot remove error code. Error: ', response);
                });
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.exportRecords = function (mimeType) {
            var srcUrl = '/mmsc-operation-gr-rest/v1/retrypolicies/errors/export?response-content-type=' + mimeType;

            $log.debug('Downloading MMSC retry policies error based records. URL: ', srcUrl);

            ReportingExportService.showReport(srcUrl, mimeType.toUpperCase());
        };

    });

    MMSCOperationsRetryPoliciesErrorBasedModule.controller('MMSCOperationsRetryPoliciesErrorBasedNewCtrl', function ($scope, $state, $log, $translate, MmscOperationService, notification, ErrorTypes, ErrorContexts) {
        $log.debug('MMSCOperationsRetryPoliciesErrorBasedNewCtrl');
        $scope.ErrorTypes = ErrorTypes;
        $scope.ErrorContexts = ErrorContexts;
        $scope.errorBasedProfile = {
            errorType: ErrorTypes[0],
            errorContext: ErrorContexts[0]
        };
        $scope.save = function () {
            MmscOperationService.createErrorCodePolicy($scope.errorBasedProfile).then(function (response) {
                $log.debug('Retry policy is created. Response: ', response);

                if (response && (response.errorCode || response.code)) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: response.errorCode || response.code,
                            errorText: response.errorMsg || response.message
                        })
                    });
                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $scope.go('products.mmsc.operations.retrypolicies.errorbased');
                }
            }, function (response) {
                $log.debug('Cannot create retry policy. Error: ', response);
            });
        };

    });

    MMSCOperationsRetryPoliciesErrorBasedModule.controller('MMSCOperationsRetryPoliciesErrorBasedUpdateCtrl', function ($scope, $state, $log, $translate, MmscOperationService, notification, policy, ErrorTypes, ErrorContexts) {
        $log.debug('MMSCOperationsRetryPoliciesErrorBasedUpdateCtrl');
        $scope.errorBasedProfile = policy;
        $scope.update = true;
        $scope.ErrorTypes = ErrorTypes;
        $scope.ErrorContexts = ErrorContexts;

        $scope.originalErrorBasedProfile = angular.copy($scope.errorBasedProfile);
        $scope.isConfigurationNotChanged = function () {
            return angular.equals($scope.originalErrorBasedProfile, $scope.errorBasedProfile);
        };

        $scope.save = function () {
            MmscOperationService.updateErrorCodePolicy($scope.errorBasedProfile.errorContext, $scope.errorBasedProfile.errorCode, $scope.errorBasedProfile).then(function (response) {
                $log.debug('Error based policy is updated. Response: ', response);

                if (response && (response.errorCode || response.code)) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: response.errorCode || response.code,
                            errorText: response.errorMsg || response.message
                        })
                    });
                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $scope.go('products.mmsc.operations.retrypolicies.errorbased');
                }
            }, function (response) {
                $log.debug('Cannot update error based policy. Error: ', response);
            });
        };
    });

    MMSCOperationsRetryPoliciesErrorBasedModule.constant('ErrorContexts', [
        'MMSC', 'SMTP', 'SOAP'
    ]);

    MMSCOperationsRetryPoliciesErrorBasedModule.constant('ErrorTypes', [
        'TEMPORARY', 'PERMANENT'
    ]);

})();
