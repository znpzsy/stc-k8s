(function () {

    'use strict';

    angular.module('adminportal.products.smsc.operations.retrypolicies.prioritybased', [
        'adminportal.products.smsc.operations.retrypolicies.prioritybased.policies'
    ]);

    var SmscRetryPoliciesPriorityLevelBasedOperationsModule = angular.module('adminportal.products.smsc.operations.retrypolicies.prioritybased');

    SmscRetryPoliciesPriorityLevelBasedOperationsModule.config(function ($stateProvider) {

        // Global
        $stateProvider.state('products.smsc.operations.retrypolicies.prioritybased', {
            abstract: true,
            url: "/prioritybased/smsc",
            template: "<div ui-view></div>",
            data: {
                "listState": "products.smsc.operations.retrypolicies.prioritybased.list",
                "newState": "products.smsc.operations.retrypolicies.prioritybased.new",
                "updateState": "products.smsc.operations.retrypolicies.prioritybased.update",
                "policiesState": "products.smsc.operations.retrypolicies.prioritybased-policies.list",
                "pageHeaderKey": "Products.SMSC.Operations.RetryPolicies.PriorityBased.PageHeader"
            },
            resolve: {
                retryPoliciesPriorityLevelBased: function (SmscConfService) {
                    return SmscConfService.getRetryPoliciesPriorityLevelBased();
                }
            }
        }).state('products.smsc.operations.retrypolicies.prioritybased.list', {
            url: "",
            templateUrl: "products/smsc/operations/operations.retrypolicies.prioritybased.html",
            controller: 'SmscRetryPoliciesPriorityLevelBasedOperationsCtrl'
        }).state('products.smsc.operations.retrypolicies.prioritybased.new', {
            url: "/new",
            templateUrl: "products/smsc/operations/operations.retrypolicies.prioritybased.details.html",
            controller: 'SmscRetryPoliciesPriorityBasedNewLevelOperationsCtrl'
        }).state('products.smsc.operations.retrypolicies.prioritybased.update', {
            url: "/update/:policyName",
            templateUrl: "products/smsc/operations/operations.retrypolicies.prioritybased.details.html",
            controller: 'SmscRetryPoliciesPriorityBasedUpdateLevelOperationsCtrl',
            resolve: {
                retryPolicyPriorityLevelBased: function ($stateParams, SmscConfService) {
                    var policyName = $stateParams.policyName;

                    return SmscConfService.getRetryPoliciesPriorityLevelBasedByPolicyName(policyName);
                }
            }
        });

    });

    SmscRetryPoliciesPriorityLevelBasedOperationsModule.controller('SmscRetryPoliciesPriorityLevelBasedOperationsCtrl', function ($scope, $log, $state, $stateParams, $translate, $filter, notification, $uibModal,
                                                                                                                                                $timeout, SmscConfService, Restangular, NgTableParams, NgTableService,
                                                                                                                                                retryPoliciesPriorityLevelBased) {
        $log.debug("SMSCRetryPoliciesPriorityLevelBasedOperationsCtrl");

        // Get state urls for using in generic pages.
        $scope.listState = $state.current.data.listState;
        $scope.newState = $state.current.data.newState;
        $scope.updateState = $state.current.data.updateState;
        $scope.policiesState = $state.current.data.policiesState;

        var retryPoliciesPriorityLevelList = Restangular.stripRestangular(retryPoliciesPriorityLevelBased);

        // Retry Policies Priority Level list
        $scope.retryPoliciesPriorityLevelList = {
            list: retryPoliciesPriorityLevelList,
            tableParams: {}
        };

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.retryPoliciesPriorityLevelList.tableParams.settings().$scope.filterText = filterText;
            $scope.retryPoliciesPriorityLevelList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.retryPoliciesPriorityLevelList.tableParams.page(1);
            $scope.retryPoliciesPriorityLevelList.tableParams.reload();
        }, 750);

        $scope.retryPoliciesPriorityLevelList.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "priorityLevel": 'asc' // initial sorting
            }
        }, {
            total: $scope.retryPoliciesPriorityLevelList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.retryPoliciesPriorityLevelList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.retryPoliciesPriorityLevelList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Retry Policies Priority Level list

        $scope.removePriorityLevel = function (retryPolicyPriorityLevel) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing Retry Policy Priority Level: ', retryPolicyPriorityLevel);

                SmscConfService.deleteRetryPolicyPriorityLevelBasedByPolicyName(retryPolicyPriorityLevel.policyName).then(function (response) {
                    $log.debug('Removed Retry Policy Priority Level: ', response);

                    var deletedListItem = _.findWhere($scope.retryPoliciesPriorityLevelList.list, {
                        policyName: retryPolicyPriorityLevel.policyName
                    });
                    $scope.retryPoliciesPriorityLevelList.list = _.without($scope.retryPoliciesPriorityLevelList.list, deletedListItem);

                    $scope.retryPoliciesPriorityLevelList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete Retry Policy Priority Level: ', response);
                });
            });
        };

    });

    SmscRetryPoliciesPriorityLevelBasedOperationsModule.controller('SmscRetryPoliciesPriorityBasedNewLevelOperationsCtrl', function ($scope, $state, $stateParams, $log, $translate, $filter, $timeout,
                                                                                                                                                   notification, $uibModal, UtilService, SmscConfService, Restangular,
                                                                                                                                                   retryPoliciesPriorityLevelBased, RETRY_POLICIES_PRIORITY_LEVELS, STATUS_TYPES) {
        $log.debug("SMSCRetryPoliciesPriorityBasedNewLevelOperationsCtrl");

        // put all retry policy error code list to the scope
        $scope.retryPoliciesPriorityLevelList = Restangular.stripRestangular(retryPoliciesPriorityLevelBased);

        // Get state urls for using in generic pages.
        $scope.listState = $state.current.data.listState;

        $scope.RETRY_POLICIES_PRIORITY_LEVELS = RETRY_POLICIES_PRIORITY_LEVELS;
        $scope.STATUS_TYPES = STATUS_TYPES;

        $scope.retryPolicyPriorityLevel = {
            status: STATUS_TYPES[0],
            priorityLevel: RETRY_POLICIES_PRIORITY_LEVELS[0]
        };

        // $timeout because of the form has not created yet it just makes the set call asynchronous.
        $timeout(function () {
            $scope.form.priorityLevel.$setViewValue($scope.form.priorityLevel.$viewValue);
        }, 0);

        $scope.save = function (retryPolicyPriorityLevel) {
            var retryPolicyPriorityLevelItem = {
                "policyName": retryPolicyPriorityLevel.priorityLevel,
                "priorityLevel": retryPolicyPriorityLevel.priorityLevel,
                "enabled": (retryPolicyPriorityLevel.status.value === 0) // 0 means ACTIVE
            };

            SmscConfService.addRetryPolicyPriorityLevelBased(retryPolicyPriorityLevelItem).then(function (response) {
                $log.debug('Added Retry Policy Priority Level: ', response);

                var apiResponse = Restangular.stripRestangular(response);

                // If there is an error message appears a notification bar.
                if (apiResponse.errorCode === 500 && apiResponse.errorMsg) {
                    if (apiResponse.errorMsg.indexOf('already') > -1) {
                        notification({
                            type: 'danger',
                            text: $translate.instant('Products.SMSC.Operations.RetryPolicies.Messages.PolicyPriorityLevelAlreadyDefinedError', {
                                context: retryPolicyPriorityLevel.contextName,
                                error_code: retryPolicyPriorityLevel.errorCode
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

                    $state.transitionTo($scope.listState, {appId: $stateParams.appId}, {
                        reload: true,
                        inherit: true,
                        notify: true
                    });
                }
            }, function (response) {
                $log.debug('Cannot add Retry Policy Priority Level: ', response);
            });
        };

        $scope.cancel = function () {
            $state.transitionTo($scope.listState, {appId: $stateParams.appId}, {
                reload: true,
                inherit: true,
                notify: true
            });
        };

    });

    SmscRetryPoliciesPriorityLevelBasedOperationsModule.controller('SmscRetryPoliciesPriorityBasedUpdateLevelOperationsCtrl', function ($scope, $state, $stateParams, $log, $translate, $filter, notification,
                                                                                                                                                      $uibModal, UtilService, SmscConfService, Restangular,
                                                                                                                                                      retryPolicyPriorityLevelBased, RETRY_POLICIES_PRIORITY_LEVELS, STATUS_TYPES) {
        $log.debug("SMSCRetryPoliciesPriorityBasedUpdateLevelOperationsCtrl");

        // Get state urls for using in generic pages.
        $scope.listState = $state.current.data.listState;

        $scope.RETRY_POLICIES_PRIORITY_LEVELS = RETRY_POLICIES_PRIORITY_LEVELS;
        $scope.STATUS_TYPES = STATUS_TYPES;

        // put all retry policy error code list to the scope
        $scope.retryPolicyPriorityLevel = Restangular.stripRestangular(retryPolicyPriorityLevelBased)[0];
        $scope.retryPolicyPriorityLevel.status = ($scope.retryPolicyPriorityLevel.enabled ? STATUS_TYPES[0] : STATUS_TYPES[1]);
        $scope.retryPolicyPriorityLevel.id = $scope.retryPolicyPriorityLevel.policyName; // Set to id field in order to use decision is this update or create in the detail form.

        $scope.retryPolicyPriorityLevelOriginal = angular.copy($scope.retryPolicyPriorityLevel);
        $scope.isRetryPolicyNotChanged = function () {
            return angular.equals($scope.retryPolicyPriorityLevel, $scope.retryPolicyPriorityLevelOriginal);
        };

        $scope.save = function (retryPolicyPriorityLevel) {
            var retryPolicyPriorityLevelItem = {
                "policyName": $scope.retryPolicyPriorityLevelOriginal.priorityLevel,
                "priorityLevel": $scope.retryPolicyPriorityLevelOriginal.priorityLevel,
                "enabled": (retryPolicyPriorityLevel.status.value === 0)
            };

            SmscConfService.updateRetryPolicyPriorityLevelBased(retryPolicyPriorityLevelItem).then(function (response) {
                $log.debug('Updated Retry Policy Priority Level: ', response);

                var apiResponse = Restangular.stripRestangular(response);

                // If there is an error message appears a notification bar.
                if (apiResponse.errorCode === 500 && apiResponse.errorMsg) {
                    if (apiResponse.errorMsg.indexOf('already') > -1) {
                        notification({
                            type: 'danger',
                            text: $translate.instant('Products.SMSC.Operations.RetryPolicies.Messages.PolicyPriorityLevelAlreadyDefinedError', {
                                context: retryPolicyPriorityLevel.contextName,
                                error_code: retryPolicyPriorityLevel.errorCode
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

                    $state.transitionTo($scope.listState, {appId: $stateParams.appId}, {
                        reload: true,
                        inherit: true,
                        notify: true
                    });
                }
            }, function (response) {
                $log.debug('Cannot update Retry Policy Priority Level: ', response);
            });
        };

        $scope.cancel = function () {
            $state.transitionTo($scope.listState, {appId: $stateParams.appId}, {
                reload: true,
                inherit: true,
                notify: true
            });
        };

    });

})();
