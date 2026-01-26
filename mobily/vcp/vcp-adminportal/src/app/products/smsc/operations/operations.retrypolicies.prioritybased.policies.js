(function () {

    'use strict';

    angular.module('adminportal.products.smsc.operations.retrypolicies.prioritybased.policies', []);

    var SmscRetryPoliciesPriorityLevelBasedPoliciesOperationsModule = angular.module('adminportal.products.smsc.operations.retrypolicies.prioritybased.policies');

    SmscRetryPoliciesPriorityLevelBasedPoliciesOperationsModule.config(function ($stateProvider) {

        // GLOBAL
        $stateProvider.state('products.smsc.operations.retrypolicies.prioritybased-policies', {
            abstract: true,
            url: "/prioritybased/policies/:policyName",
            template: "<div ui-view></div>",
            data: {
                "listState": "products.smsc.operations.retrypolicies.prioritybased-policies.list",
                "newState": "products.smsc.operations.retrypolicies.prioritybased-policies.new",
                "updateState": "products.smsc.operations.retrypolicies.prioritybased-policies.update",
                "backState": "products.smsc.operations.retrypolicies.prioritybased.list",
                "pageHeaderKey": "Products.SMSC.Operations.RetryPolicies.PriorityBasedPolicies.PageHeader"
            },
            resolve: {
                retryPoliciesPriorityLevelBased: function ($stateParams, SmscConfService) {
                    var policyName = $stateParams.policyName;

                    return SmscConfService.getRetryPoliciesPriorityLevelBasedByPolicyName(policyName);
                }
            }
        }).state('products.smsc.operations.retrypolicies.prioritybased-policies.list', {
            url: "",
            templateUrl: "products/smsc/operations/operations.retrypolicies.html",
            controller: 'SmscRetryPoliciesPriorityLevelBasedPoliciesOperationsCtrl'
        }).state('products.smsc.operations.retrypolicies.prioritybased-policies.new', {
            url: "/new",
            templateUrl: "products/smsc/operations/operations.retrypolicies.details.html",
            controller: 'SmscRetryPoliciesPriorityLevelBasedNewPoliciesOperationsCtrl'
        }).state('products.smsc.operations.retrypolicies.prioritybased-policies.update', {
            url: "/update/{preference:[0-9]*}",
            templateUrl: "products/smsc/operations/operations.retrypolicies.details.html",
            controller: 'SmscRetryPoliciesPriorityLevelBasedUpdatePoliciesOperationsCtrl'
        });

    });

    SmscRetryPoliciesPriorityLevelBasedPoliciesOperationsModule.controller('SmscRetryPoliciesPriorityLevelBasedPoliciesOperationsCtrl', function ($scope, $log, $state, $stateParams, $translate, $filter, notification, $uibModal,
                                                                                                                                                                $timeout, SmscConfService, Restangular, NgTableParams, NgTableService,
                                                                                                                                                                retryPoliciesPriorityLevelBased) {

        $log.debug("SMSCRetryPoliciesPriorityLevelBasedPoliciesOperationsCtrl");

        $scope.policyName = $stateParams.policyName;

        // Get state urls for using in generic pages.
        $scope.listState = $state.current.data.listState;
        $scope.backState = $state.current.data.backState;
        $scope.newState = $state.current.data.newState;
        $scope.updateState = $state.current.data.updateState;

        $scope.showTable = true;
        $scope.hideSMPPApplications = true;

        var retryPolicyList = Restangular.stripRestangular(retryPoliciesPriorityLevelBased)[0].retryPolicyItems;

        // Retry Policies Priority Level Based list
        $scope.retryPolicyList = {
            list: retryPolicyList,
            tableParams: {}
        };

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.retryPolicyList.tableParams.settings().$scope.filterText = filterText;
            $scope.retryPolicyList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.retryPolicyList.tableParams.page(1);
            $scope.retryPolicyList.tableParams.reload();
        }, 750);

        $scope.retryPolicyList.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "preference": 'asc' // initial sorting
            }
        }, {
            total: $scope.retryPolicyList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.retryPolicyList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.retryPolicyList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Retry Policies Priority Level Based list

        $scope.remove = function (retryPolicyPriorityLevelBased) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing Retry Policies Priority Level Based: ', retryPolicyPriorityLevelBased);

                SmscConfService.deleteRetryPolicyPriorityLevelBasedByPreference($scope.policyName, retryPolicyPriorityLevelBased.preference).then(function (response) {
                    $log.debug('Removed Retry Policies Priority Level Based: ', response);

                    var deletedListItem = _.findWhere($scope.retryPolicyList.list, {
                        preference: retryPolicyPriorityLevelBased.preference
                    });
                    $scope.retryPolicyList.list = _.without($scope.retryPolicyList.list, deletedListItem);

                    $scope.retryPolicyList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete Retry Policies Priority Level Based: ', response);
                });
            });
        };

    });

    SmscRetryPoliciesPriorityLevelBasedPoliciesOperationsModule.controller('SmscRetryPoliciesPriorityLevelBasedNewPoliciesOperationsCtrl', function ($scope, $state, $stateParams, $log, $translate, $filter,
                                                                                                                                                                   notification, $uibModal, UtilService, SmscConfService, Restangular,
                                                                                                                                                                   retryPoliciesPriorityLevelBased, INTERVAL_UNITS) {
        $log.debug("SMSCRetryPoliciesPriorityLevelBasedNewPoliciesOperationsCtrl");

        $scope.policyName = $stateParams.policyName;

        // Get state urls for using in generic pages.
        $scope.listState = $state.current.data.listState;

        $scope.INTERVAL_UNITS = INTERVAL_UNITS;

        $scope.retryPolicy = {
            retryIntervalUnit: INTERVAL_UNITS[1]
        };

        var retryPolicyPriorityLevel = Restangular.stripRestangular(retryPoliciesPriorityLevelBased)[0];

        $scope.save = function (retryPolicy) {
            var retryPolicyItem = {
                "preference": retryPolicy.preference,
                "retryCount": retryPolicy.retryCount,
                "retryInterval": retryPolicy.retryInterval,
                "retryIntervalUnit": retryPolicy.retryIntervalUnit
            };

            var retryPolicyPriorityLevelItem = {
                "enabled": retryPolicyPriorityLevel.enabled,
                "policyName": retryPolicyPriorityLevel.policyName,
                "priorityLevel": retryPolicyPriorityLevel.priorityLevel,
                "retryPolicyItems": [
                    retryPolicyItem
                ]
            };

            SmscConfService.addRetryPolicyPriorityLevelBased(retryPolicyPriorityLevelItem).then(function (response) {
                $log.debug('Added Retry Policies Priority Level Based: ', response);

                var apiResponse = Restangular.stripRestangular(response);

                if (apiResponse.errorCode === 500 && apiResponse.errorMsg) {
                    // If there is an error message appears a notification bar.
                    if (apiResponse.errorMsg.indexOf('already') > -1) {
                        notification({
                            type: 'danger',
                            text: $translate.instant('Products.SMSC.Operations.RetryPolicies.Messages.PolicyAlreadyDefinedError', {
                                preference: retryPolicyItem.preference
                            })
                        });
                    } else {
                        notification({
                            type: 'danger',
                            text: apiResponse.errorMsg
                        });
                    }
                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $state.transitionTo($scope.listState, {policyName: $stateParams.policyName}, {
                        reload: true,
                        inherit: true,
                        notify: true
                    });
                }
            }, function (response) {
                $log.debug('Cannot add Retry Policies Priority Level Based: ', response);
            });
        };

        $scope.cancel = function () {
            $state.transitionTo($scope.listState, {policyName: $stateParams.policyName}, {
                reload: true,
                inherit: true,
                notify: true
            });
        };
    });

    SmscRetryPoliciesPriorityLevelBasedPoliciesOperationsModule.controller('SmscRetryPoliciesPriorityLevelBasedUpdatePoliciesOperationsCtrl', function ($scope, $state, $stateParams, $log, $translate, $filter,
                                                                                                                                                                      notification, $uibModal, UtilService, SmscConfService, Restangular,
                                                                                                                                                                      retryPoliciesPriorityLevelBased, INTERVAL_UNITS) {
        $log.debug("SMSCRetryPoliciesPriorityLevelBasedUpdatePoliciesOperationsCtrl");

        $scope.policyName = $stateParams.policyName;

        // Get state urls for using in generic pages.
        $scope.listState = $state.current.data.listState;

        $scope.INTERVAL_UNITS = INTERVAL_UNITS;

        $scope.retryPolicy = {
            retryIntervalUnit: INTERVAL_UNITS[1]
        };

        var retryPolicyPriorityLevel = Restangular.stripRestangular(retryPoliciesPriorityLevelBased)[0];
        var retryPolicyPriorityLevelList = retryPolicyPriorityLevel.retryPolicyItems;
        if (retryPolicyPriorityLevelList.length > 0) {
            $scope.retryPolicy = _.findWhere(retryPolicyPriorityLevelList, {preference: Number($stateParams.preference)});
            $scope.retryPolicy.id = $scope.retryPolicy.preference; // Set to id field in order to use decision is this update or create in the detail form.
        }

        $scope.retryPolicyOriginal = angular.copy($scope.retryPolicy);
        $scope.isRetryPolicyNotChanged = function () {
            return angular.equals($scope.retryPolicy, $scope.retryPolicyOriginal);
        };

        $scope.save = function (retryPolicy) {
            var retryPolicyItem = {
                "preference": $scope.retryPolicy.id,
                "retryCount": retryPolicy.retryCount,
                "retryInterval": retryPolicy.retryInterval,
                "retryIntervalUnit": retryPolicy.retryIntervalUnit
            };

            var retryPolicyPriorityLevelItem = {
                "enabled": retryPolicyPriorityLevel.enabled,
                "policyName": retryPolicyPriorityLevel.policyName,
                "priorityLevel": retryPolicyPriorityLevel.priorityLevel,
                "retryPolicyItems": [
                    retryPolicyItem
                ]
            };

            SmscConfService.updateRetryPolicyPriorityLevelBased(retryPolicyPriorityLevelItem).then(function (response) {
                $log.debug('Updated Retry Policies Priority Level Based: ', response);

                var apiResponse = Restangular.stripRestangular(response);

                // If there is an error message appears a notification bar.
                if (apiResponse.errorCode === 500 && apiResponse.errorMsg) {
                    notification({
                        type: 'danger',
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

                    $state.transitionTo($scope.listState, {policyName: $stateParams.policyName}, {
                        reload: true,
                        inherit: true,
                        notify: true
                    });
                }
            }, function (response) {
                $log.debug('Cannot update Retry Policies Priority Level Based: ', response);
            });
        };

        $scope.cancel = function () {
            $state.transitionTo($scope.listState, {policyName: $stateParams.policyName}, {
                reload: true,
                inherit: true,
                notify: true
            });
        };
    });

})();
