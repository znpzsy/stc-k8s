(function () {

    'use strict';

    angular.module('adminportal.products.mmsc.operations.retrypolicies.useragents', []);

    var MMSCOperationsRetryPoliciesUserAgentsModule = angular.module('adminportal.products.mmsc.operations.retrypolicies.useragents');

    MMSCOperationsRetryPoliciesUserAgentsModule.config(function ($stateProvider) {

        $stateProvider.state('products.mmsc.operations.retrypolicies.useragents', {
            url: "/useragents",
            templateUrl: "products/mmsc/operations/operations.retrypolicies.policies.html",
            controller: 'MMSCOperationsRetryPoliciesUserAgentsCtrl',
            resolve: {
                userAgents: function (MmscOperationService) {
                    return MmscOperationService.getMM1AgentRetryPolicies();
                }
            }
        }).state('products.mmsc.operations.retrypolicies.useragents-new', {
            url: "/useragents-new",
            templateUrl: "products/mmsc/operations/operations.retrypolicies.policies.detail.html",
            controller: 'MMSCOperationsRetryPoliciesUserAgentsNewCtrl'
        }).state('products.mmsc.operations.retrypolicies.useragents-update', {
            url: "/useragents-update/:preference",
            templateUrl: "products/mmsc/operations/operations.retrypolicies.policies.detail.html",
            controller: 'MMSCOperationsRetryPoliciesUserAgentsUpdateCtrl',
            resolve: {
                policy: function ($stateParams, MmscOperationService) {
                    return MmscOperationService.getMM1AgentRetryPolicy($stateParams.preference);
                }
            }
        });

    });

    MMSCOperationsRetryPoliciesUserAgentsModule.controller('MMSCOperationsRetryPoliciesUserAgentsCtrl', function ($scope, $state, $log, $controller, $uibModal, notification, $translate, userAgents,
                                                                                                                  ReportingExportService, UtilService, MmscOperationService) {
        $log.debug('MMSCOperationsRetryPoliciesUserAgentsCtrl');

        $scope.headerKey = 'Products.MMSC.Operations.RetryPolicies.UserAgents.PageHeader';
        $scope.newUrl = 'products.mmsc.operations.retrypolicies.useragents-new';
        $scope.updateUrl = 'products.mmsc.operations.retrypolicies.useragents-update({ preference : data.preference })';

        $controller('MMSCOperationsRetryPoliciesPolicyTableCtrl', {$scope: $scope, agent: userAgents});

        $scope.remove = function (policy) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });
            modalInstance.result.then(function () {
                MmscOperationService.deleteMM1AgentRetryPolicy(policy.preference).then(function (response) {
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
                    }
                }, function (response) {
                    $log.debug('Cannot remove retry policy. Error: ', response);
                });
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.exportRecords = function (mimeType) {
            var srcUrl = '/mmsc-operation-gr-rest/v1/retrypolicies/mm1agent/export?response-content-type=' + mimeType;

            $log.debug('Downloading MMSC retry policies user agent records. URL: ', srcUrl);

            ReportingExportService.showReport(srcUrl, mimeType.toUpperCase());
        };

    });

    MMSCOperationsRetryPoliciesUserAgentsModule.controller('MMSCOperationsRetryPoliciesUserAgentsNewCtrl', function ($scope, $state, $log, $translate, MmscOperationService, notification) {
        $log.debug('MMSCOperationsRetryPoliciesUseragentsNewCtrl');
        $scope.headerKey = 'Products.MMSC.Operations.RetryPolicies.UserAgents.PageHeader';
        $scope.cancelUrl = 'products.mmsc.operations.retrypolicies.useragents';
        $scope.save = function () {
            MmscOperationService.createMM1AgentRetryPolicy($scope.retryProfile).then(function (response) {
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

                    $scope.go('products.mmsc.operations.retrypolicies.useragents');
                }
            }, function (response) {
                $log.debug('Cannot create retry policy. Error: ', response);
            });
        };
    });

    MMSCOperationsRetryPoliciesUserAgentsModule.controller('MMSCOperationsRetryPoliciesUserAgentsUpdateCtrl', function ($scope, $state, $log, $translate, policy, MmscOperationService, notification) {
        $log.debug('MMSCOperationsRetryPoliciesUseragentsUpdateCtrl');
        $scope.headerKey = 'Products.MMSC.Operations.RetryPolicies.UserAgents.PageHeader';
        $scope.cancelUrl = 'products.mmsc.operations.retrypolicies.useragents';
        $scope.retryProfile = policy;

        $scope.retryProfile.id = $scope.retryProfile.preference;

        $scope.originalRetryProfile = angular.copy($scope.retryProfile);
        $scope.isConfigurationNotChanged = function () {
            return angular.equals($scope.originalRetryProfile, $scope.retryProfile);
        };

        $scope.save = function () {
            MmscOperationService.updateMM1AgentRetryPolicy($scope.retryProfile).then(function (response) {
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

                    $scope.go('products.mmsc.operations.retrypolicies.useragents');
                }
            }, function (response) {
                $log.debug('Cannot update retry policy. Error: ', response);
            });
        };
    });

})();
