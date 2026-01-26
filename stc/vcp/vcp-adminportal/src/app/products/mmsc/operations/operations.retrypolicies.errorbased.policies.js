(function () {

    'use strict';

    angular.module('adminportal.products.mmsc.operations.retrypolicies.errorbasedpolicies', []);

    var MMSCOperationsRetryPoliciesErrorBasedPoliciesModule = angular.module('adminportal.products.mmsc.operations.retrypolicies.errorbasedpolicies');

    MMSCOperationsRetryPoliciesErrorBasedPoliciesModule.config(function ($stateProvider) {

        $stateProvider.state('products.mmsc.operations.retrypolicies.errorbasedpolicies', {
            url: "/errorbasedpolicies/:context/:code",
            templateUrl: "products/mmsc/operations/operations.retrypolicies.policies.html",
            controller: 'MMSCOperationsRetryPoliciesErrorBasedPoliciesCtrl',
            resolve: {
                errorBasedPolicy: function (MmscOperationService, $stateParams) {
                    return MmscOperationService.getErrorCodePolicy($stateParams.context, $stateParams.code);
                }
            }
        }).state('products.mmsc.operations.retrypolicies.errorbasedpolicies-new', {
            url: "/errorbasedpolicies-new/:context/:code",
            templateUrl: "products/mmsc/operations/operations.retrypolicies.policies.detail.html",
            controller: 'MMSCOperationsRetryPoliciesErrorBasedPoliciesNewCtrl'
        }).state('products.mmsc.operations.retrypolicies.errorbasedpolicies-update', {
            url: "/errorbasedpolicies-update/:context/:code/:id",
            templateUrl: "products/mmsc/operations/operations.retrypolicies.policies.detail.html",
            controller: 'MMSCOperationsRetryPoliciesErrorBasedPoliciesUpdateCtrl',
            resolve: {
                policy: function (MmscOperationService, $stateParams) {
                    return MmscOperationService.getErrorCodeRetryPolicy($stateParams.context, $stateParams.code, $stateParams.id);
                }
            }
        });
    });

    MMSCOperationsRetryPoliciesErrorBasedPoliciesModule.controller('MMSCOperationsRetryPoliciesErrorBasedPoliciesCtrl', function ($scope, $state, $stateParams, $log, $controller, $uibModal, notification, $translate,
                                                                                                                                  errorBasedPolicy, MmscOperationService) {
        $log.debug('MMSCOperationsRetryPoliciesErrorBasedPoliciesCtrl');
        $scope.policy = angular.copy(errorBasedPolicy);
        $scope.context = $stateParams.context;
        $scope.code = $stateParams.code;
        $scope.headerKey = 'Products.MMSC.Operations.RetryPolicies.ErrorBased.PageHeader';
        $scope.additionalHeaderText = ' [Context = ' + $scope.context + ', Code = ' + $scope.code + ']';
        $scope.newUrl = 'products.mmsc.operations.retrypolicies.errorbasedpolicies-new({ context: context, code: code})';
        $scope.updateUrl = 'products.mmsc.operations.retrypolicies.errorbasedpolicies-update({ context: context, code: code, id : data.preference })';
        $scope.backUrl = 'products.mmsc.operations.retrypolicies.errorbased';
        $controller('MMSCOperationsRetryPoliciesPolicyTableCtrl', {
            $scope: $scope,
            agent: errorBasedPolicy.retryPolicies
        });
        $scope.remove = function (policy) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });
            modalInstance.result.then(function () {
                MmscOperationService.deleteErrorCodeRetryPolicy($scope.policy.errorContext, $scope.policy.errorCode, policy.preference).then(function (response) {
                    $log.debug('Removed retry policy.');

                    if (response && response.code && (response.errorMsg || response.message)) {
                        notification({
                            type: 'warning',
                            text: $translate.instant('CommonMessages.ApiError', {
                                errorCode: response.code || response.errorCode,
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
    });

    MMSCOperationsRetryPoliciesErrorBasedPoliciesModule.controller('MMSCOperationsRetryPoliciesErrorBasedPoliciesNewCtrl', function ($scope, $state, $stateParams, $log, $translate, MmscOperationService, notification) {
        $log.debug('MMSCOperationsRetryPoliciesErrorBasedPoliciesNewCtrl');
        $scope.context = $stateParams.context;
        $scope.code = $stateParams.code;
        $scope.headerKey = 'Products.MMSC.Operations.RetryPolicies.ErrorBased.PageHeader';
        $scope.additionalHeaderText = ' [Context = ' + $scope.context + ', Code = ' + $scope.code + ']';
        $scope.cancelUrl = 'products.mmsc.operations.retrypolicies.errorbasedpolicies({ context: context, code: code})';
        $scope.save = function () {
            MmscOperationService.createErrorCodeRetryPolicy($scope.context, $scope.code, $scope.retryProfile).then(function (response) {
                $log.debug('Retry policy is created. Response: ', response);

                if (response && response.code && (response.errorMsg || response.message)) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: response.code || response.errorCode,
                            errorText: response.errorMsg || response.message
                        })
                    });
                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $state.transitionTo('products.mmsc.operations.retrypolicies.errorbasedpolicies',
                        {context: $stateParams.context, code: $stateParams.code},
                        {reload: true, inherit: true, notify: true}
                    );
                }
            }, function (response) {
                $log.debug('Cannot create retry policy. Error: ', response);
            });
        };
    });

    MMSCOperationsRetryPoliciesErrorBasedPoliciesModule.controller('MMSCOperationsRetryPoliciesErrorBasedPoliciesUpdateCtrl', function ($scope, $state, $stateParams, $log, $translate, policy, MmscOperationService, notification) {
        $log.debug('MMSCOperationsRetryPoliciesErrorBasedPoliciesUpdateCtrl');
        $scope.context = $stateParams.context;
        $scope.code = $stateParams.code;
        $scope.retryProfile = policy;
        $scope.headerKey = 'Products.MMSC.Operations.RetryPolicies.ErrorBased.PageHeader';
        $scope.additionalHeaderText = ' [Context = ' + $scope.context + ', Code = ' + $scope.code + ' - ' + $scope.retryProfile.preference + ']';
        $scope.cancelUrl = 'products.mmsc.operations.retrypolicies.errorbasedpolicies({ context: context, code: code})';

        $scope.retryProfile.id = $scope.retryProfile.preference;

        $scope.originalRetryProfile = angular.copy($scope.retryProfile);
        $scope.isConfigurationNotChanged = function () {
            return angular.equals($scope.originalRetryProfile, $scope.retryProfile);
        };

        $scope.save = function () {
            MmscOperationService.updateErrorCodeRetryPolicy($stateParams.context, $stateParams.code, $scope.retryProfile).then(function (response) {
                $log.debug('Retry policy is updated. Response: ', response);

                if (response && response.code && (response.errorMsg || response.message)) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: response.code || response.errorCode,
                            errorText: response.errorMsg || response.message
                        })
                    });
                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $state.transitionTo('products.mmsc.operations.retrypolicies.errorbasedpolicies',
                        {context: $stateParams.context, code: $stateParams.code},
                        {reload: true, inherit: true, notify: true}
                    );
                }
            }, function (response) {
                $log.debug('Cannot update retry policy. Error: ', response);
            });
        };
    });
})();
