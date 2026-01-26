(function () {

    'use strict';

    angular.module('adminportal.products.mmsc.operations.retrypolicies.applications', []);

    var MMSCOperationsRetryPoliciesApplicationsModule = angular.module('adminportal.products.mmsc.operations.retrypolicies.applications');

    MMSCOperationsRetryPoliciesApplicationsModule.config(function ($stateProvider) {

        $stateProvider.state('products.mmsc.operations.retrypolicies.applications', {
            url: "/applications",
            templateUrl: "products/mmsc/operations/operations.retrypolicies.policies.html",
            controller: 'MMSCOperationsRetryPoliciesApplicationsCtrl',
            resolve: {
                applications: function (MmscOperationService) {
                    return MmscOperationService.getMM7AgentRetryPolicies();
                }
            }
        }).state('products.mmsc.operations.retrypolicies.applications-new', {
            url: "/applications-new",
            templateUrl: "products/mmsc/operations/operations.retrypolicies.policies.detail.html",
            controller: 'MMSCOperationsRetryPoliciesApplicationsNewCtrl'
        }).state('products.mmsc.operations.retrypolicies.applications-update', {
            url: "/applications-update/:preference",
            templateUrl: "products/mmsc/operations/operations.retrypolicies.policies.detail.html",
            controller: 'MMSCOperationsRetryPoliciesApplicationsUpdateCtrl',
            resolve: {
                policy: function ($stateParams, MmscOperationService) {
                    return MmscOperationService.getMM7AgentRetryPolicy($stateParams.preference);
                }
            }
        });
    });

    MMSCOperationsRetryPoliciesApplicationsModule.controller('MMSCOperationsRetryPoliciesApplicationsCtrl', function ($scope, $state, $log, $controller, notification, $translate, $uibModal, ReportingExportService,
                                                                                                                      applications, UtilService, MmscOperationService) {
        $log.debug('MMSCOperationsRetryPoliciesApplicationsCtrl');

        $scope.headerKey = 'Products.MMSC.Operations.RetryPolicies.Applications.PageHeader';
        $scope.newUrl = 'products.mmsc.operations.retrypolicies.applications-new';
        $scope.updateUrl = 'products.mmsc.operations.retrypolicies.applications-update({ preference : data.preference })';

        $controller('MMSCOperationsRetryPoliciesPolicyTableCtrl', {$scope: $scope, agent: applications});

        $scope.remove = function (policy) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });
            modalInstance.result.then(function () {
                MmscOperationService.deleteMM7AgentRetryPolicy(policy.preference).then(function (response) {
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
            var srcUrl = '/mmsc-operation-gr-rest/v1/retrypolicies/mm7agent/export?response-content-type=' + mimeType;

            $log.debug('Downloading MMSC retry policies application records. URL: ', srcUrl);

            ReportingExportService.showReport(srcUrl, mimeType.toUpperCase());
        };

    });

    MMSCOperationsRetryPoliciesApplicationsModule.controller('MMSCOperationsRetryPoliciesApplicationsNewCtrl', function ($scope, $state, $log, $translate, MmscOperationService, notification) {
        $log.debug('MMSCOperationsRetryPoliciesApplicationsNewCtrl');
        $scope.headerKey = 'Products.MMSC.Operations.RetryPolicies.Applications.PageHeader';
        $scope.cancelUrl = 'products.mmsc.operations.retrypolicies.applications';

        $scope.save = function () {
            MmscOperationService.createMM7AgentRetryPolicy($scope.retryProfile).then(function (response) {
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
                    $scope.go('products.mmsc.operations.retrypolicies.applications');
                }
            }, function (response) {
                $log.debug('Cannot create retry policy. Error: ', response);
            });
        };
    });

    MMSCOperationsRetryPoliciesApplicationsModule.controller('MMSCOperationsRetryPoliciesApplicationsUpdateCtrl', function ($scope, $state, $log, $translate, policy, MmscOperationService, notification) {
        $log.debug('MMSCOperationsRetryPoliciesApplicationsUpdateCtrl');
        $scope.headerKey = 'Products.MMSC.Operations.RetryPolicies.Applications.PageHeader';
        $scope.cancelUrl = 'products.mmsc.operations.retrypolicies.applications';
        $scope.retryProfile = policy;

        $scope.retryProfile.id = $scope.retryProfile.preference;

        $scope.originalRetryProfile = angular.copy($scope.retryProfile);
        $scope.isConfigurationNotChanged = function () {
            return angular.equals($scope.originalRetryProfile, $scope.retryProfile);
        };

        $scope.save = function () {
            MmscOperationService.updateMM7AgentRetryPolicy($scope.retryProfile).then(function (response) {
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

                    $scope.go('products.mmsc.operations.retrypolicies.applications');
                }
            }, function (response) {
                $log.debug('Cannot update retry policy. Error: ', response);
            });
        };
    });

})();
