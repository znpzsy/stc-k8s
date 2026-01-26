(function () {

    'use strict';

    angular.module('adminportal.products.mmsc.operations.retrypolicies.operators', []);

    var MMSCOperationsRetryPoliciesOperatorsModule = angular.module('adminportal.products.mmsc.operations.retrypolicies.operators');

    MMSCOperationsRetryPoliciesOperatorsModule.config(function ($stateProvider) {

        $stateProvider.state('products.mmsc.operations.retrypolicies.operators', {
            url: "/operators",
            templateUrl: "products/mmsc/operations/operations.retrypolicies.policies.html",
            controller: 'MMSCOperationsRetryPoliciesOperatorsCtrl',
            resolve: {
                operators: function (MmscOperationService) {
                    return MmscOperationService.getMM4AgentRetryPolicies();
                }
            }
        }).state('products.mmsc.operations.retrypolicies.operators-new', {
            url: "/operators-new",
            templateUrl: "products/mmsc/operations/operations.retrypolicies.policies.detail.html",
            controller: 'MMSCOperationsRetryPoliciesOperatorsNewCtrl'
        }).state('products.mmsc.operations.retrypolicies.operators-update', {
            url: "/operators-update/:preference",
            templateUrl: "products/mmsc/operations/operations.retrypolicies.policies.detail.html",
            controller: 'MMSCOperationsRetryPoliciesOperatorsUpdateCtrl',
            resolve: {
                policy: function ($stateParams, MmscOperationService) {
                    return MmscOperationService.getMM4AgentRetryPolicy($stateParams.preference);
                }
            }
        });
    });

    MMSCOperationsRetryPoliciesOperatorsModule.controller('MMSCOperationsRetryPoliciesOperatorsCtrl', function ($scope, $state, $log, $controller, $uibModal, notification, $translate, operators,
                                                                                                                ReportingExportService, UtilService, MmscOperationService) {
        $log.debug('MMSCOperationsRetryPoliciesOperatorsCtrl');

        $scope.headerKey = 'Products.MMSC.Operations.RetryPolicies.Operators.PageHeader';
        $scope.newUrl = 'products.mmsc.operations.retrypolicies.operators-new';
        $scope.updateUrl = 'products.mmsc.operations.retrypolicies.operators-update({ preference : data.preference })';

        $controller('MMSCOperationsRetryPoliciesPolicyTableCtrl', {$scope: $scope, agent: operators});

        $scope.remove = function (policy) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });
            modalInstance.result.then(function () {
                MmscOperationService.deleteMM4AgentRetryPolicy(policy.preference).then(function (response) {
                    $log.debug('Removed retry policy.');

                    if (response && (response.errorCode || response.code)) {
                        notification({
                            type: 'warning',
                            text: $translate.instant('CommonMessages.ApiError', {
                                errorCode: response.errorCode || response.code,
                                errorText: response.errorMsg || response.message
                            })
                        });
                    } else {
                        $scope.policyList.list = _.without($scope.policyList.list, policy);
                        $scope.policyList.tableParams.reload();

                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });
                    }
                }, function (response) {
                    $log.debug('Cannot remove retry policy. Error: ', response);
                });
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.exportRecords = function (mimeType) {
            var srcUrl = '/mmsc-operation-gr-rest/v1/retrypolicies/mm4agent/export?response-content-type=' + mimeType;

            $log.debug('Downloading MMSC retry policies operator records. URL: ', srcUrl);

            ReportingExportService.showReport(srcUrl, mimeType.toUpperCase());
        };

    });

    MMSCOperationsRetryPoliciesOperatorsModule.controller('MMSCOperationsRetryPoliciesOperatorsNewCtrl', function ($scope, $state, $log, $translate, MmscOperationService, notification) {
        $log.debug('MMSCOperationsRetryPoliciesOperatorsNewCtrl');
        $scope.headerKey = 'Products.MMSC.Operations.RetryPolicies.Operators.PageHeader';
        $scope.cancelUrl = 'products.mmsc.operations.retrypolicies.operators';
        $scope.save = function () {
            MmscOperationService.createMM4AgentRetryPolicy($scope.retryProfile).then(function (response) {
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

                    $scope.go('products.mmsc.operations.retrypolicies.operators');
                }
            }, function (response) {
                $log.debug('Cannot create retry policy. Error: ', response);
            });
        };
    });

    MMSCOperationsRetryPoliciesOperatorsModule.controller('MMSCOperationsRetryPoliciesOperatorsUpdateCtrl', function ($scope, $state, $log, $translate, policy, MmscOperationService, notification) {
        $log.debug('MMSCOperationsRetryPoliciesOperatorsUpdateCtrl');
        $scope.headerKey = 'Products.MMSC.Operations.RetryPolicies.Operators.PageHeader';
        $scope.cancelUrl = 'products.mmsc.operations.retrypolicies.operators';
        $scope.retryProfile = policy;

        $scope.retryProfile.id = $scope.retryProfile.preference;

        $scope.originalRetryProfile = angular.copy($scope.retryProfile);
        $scope.isConfigurationNotChanged = function () {
            return angular.equals($scope.originalRetryProfile, $scope.retryProfile);
        };

        $scope.save = function () {
            MmscOperationService.updateMM4AgentRetryPolicy($scope.retryProfile).then(function (response) {
                $log.debug('Retry policy is updated. Response: ', response);

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

                    $scope.go('products.mmsc.operations.retrypolicies.operators');
                }
            }, function (response) {
                $log.debug('Cannot update retry policy. Error: ', response);
            });
        };
    });
})();
