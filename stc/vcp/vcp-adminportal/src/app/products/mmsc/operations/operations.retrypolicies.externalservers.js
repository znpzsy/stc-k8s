(function () {

    'use strict';

    angular.module('adminportal.products.mmsc.operations.retrypolicies.externalservers', []);

    var MMSCOperationsRetryPoliciesExternalServersModule = angular.module('adminportal.products.mmsc.operations.retrypolicies.externalservers');

    MMSCOperationsRetryPoliciesExternalServersModule.config(function ($stateProvider) {

        $stateProvider.state('products.mmsc.operations.retrypolicies.externalservers', {
            url: "/externalservers",
            templateUrl: "products/mmsc/operations/operations.retrypolicies.policies.html",
            controller: 'MMSCOperationsRetryPoliciesExternalServersCtrl',
            resolve: {
                externalServers: function (MmscOperationService) {
                    return MmscOperationService.getMM3AgentRetryPolicies();
                }
            }
        }).state('products.mmsc.operations.retrypolicies.externalservers-new', {
            url: "/externalservers-new",
            templateUrl: "products/mmsc/operations/operations.retrypolicies.policies.detail.html",
            controller: 'MMSCOperationsRetryPoliciesExternalServersNewCtrl'
        }).state('products.mmsc.operations.retrypolicies.externalservers-update', {
            url: "/externalservers-update/:preference",
            templateUrl: "products/mmsc/operations/operations.retrypolicies.policies.detail.html",
            controller: 'MMSCOperationsRetryPoliciesExternalServersUpdateCtrl',
            resolve: {
                policy: function ($stateParams, MmscOperationService) {
                    return MmscOperationService.getMM3AgentRetryPolicy($stateParams.preference);
                }
            }
        });

    });

    MMSCOperationsRetryPoliciesExternalServersModule.controller('MMSCOperationsRetryPoliciesExternalServersCtrl', function ($scope, $state, $log, $controller, $uibModal, $translate, notification, ReportingExportService,
                                                                                                                            UtilService, MmscOperationService, externalServers) {
        $log.debug('MMSCOperationsRetryPoliciesExternalServersCtrl');

        $scope.headerKey = 'Products.MMSC.Operations.RetryPolicies.ExternalServers.PageHeader';
        $scope.newUrl = 'products.mmsc.operations.retrypolicies.externalservers-new';
        $scope.updateUrl = 'products.mmsc.operations.retrypolicies.externalservers-update({ preference : data.preference })';

        $controller('MMSCOperationsRetryPoliciesPolicyTableCtrl', {$scope: $scope, agent: externalServers});

        $scope.remove = function (policy) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });
            modalInstance.result.then(function () {
                MmscOperationService.deleteMM3AgentRetryPolicy(policy.preference).then(function (response) {
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
            var srcUrl = '/mmsc-operation-gr-rest/v1/retrypolicies/mm3agent/export?response-content-type=' + mimeType;

            $log.debug('Downloading MMSC retry policies external server records. URL: ', srcUrl);

            ReportingExportService.showReport(srcUrl, mimeType.toUpperCase());
        };

    });

    MMSCOperationsRetryPoliciesExternalServersModule.controller('MMSCOperationsRetryPoliciesExternalServersNewCtrl', function ($scope, $state, $log, $translate, MmscOperationService, notification) {
        $log.debug('MMSCOperationsRetryPoliciesUseragentsNewCtrl');
        $scope.headerKey = 'Products.MMSC.Operations.RetryPolicies.ExternalServers.PageHeader';
        $scope.cancelUrl = 'products.mmsc.operations.retrypolicies.externalservers';
        $scope.save = function () {
            MmscOperationService.createMM3AgentRetryPolicy($scope.retryProfile).then(function (response) {
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

                    $scope.go('products.mmsc.operations.retrypolicies.externalservers');
                }
            }, function (response) {
                $log.debug('Cannot create retry policy. Error: ', response);
            });
        };
    });

    MMSCOperationsRetryPoliciesExternalServersModule.controller('MMSCOperationsRetryPoliciesExternalServersUpdateCtrl', function ($scope, $state, $log, $translate, policy, MmscOperationService, notification) {
        $log.debug('MMSCOperationsRetryPoliciesUseragentsUpdateCtrl');
        $scope.headerKey = 'Products.MMSC.Operations.RetryPolicies.ExternalServers.PageHeader';
        $scope.cancelUrl = 'products.mmsc.operations.retrypolicies.externalservers';
        $scope.retryProfile = policy;

        $scope.retryProfile.id = $scope.retryProfile.preference;

        $scope.originalRetryProfile = angular.copy($scope.retryProfile);
        $scope.isConfigurationNotChanged = function () {
            return angular.equals($scope.originalRetryProfile, $scope.retryProfile);
        };

        $scope.save = function () {
            MmscOperationService.updateMM3AgentRetryPolicy($scope.retryProfile).then(function (response) {
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

                    $scope.go('products.mmsc.operations.retrypolicies.externalservers');
                }
            }, function (response) {
                $log.debug('Cannot update retry policy. Error: ', response);
            });
        };
    });

})();
