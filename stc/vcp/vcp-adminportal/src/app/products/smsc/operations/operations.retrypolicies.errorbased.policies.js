(function () {

    'use strict';

    angular.module('adminportal.products.smsc.operations.retrypolicies.errorbased.policies', []);

    var SmscRetryPoliciesErrorBasedErrorCodePoliciesOperationsModule = angular.module('adminportal.products.smsc.operations.retrypolicies.errorbased.policies');

    SmscRetryPoliciesErrorBasedErrorCodePoliciesOperationsModule.config(function ($stateProvider) {

        // Global
        $stateProvider.state('products.smsc.operations.retrypolicies.errorbased-global-policies', {
            abstract: true,
            url: "/errorbased/smsc/policies/:contextName/{errorCode:[0-9]*}",
            template: "<div ui-view></div>",
            data: {
                "isGlobal": true,
                "listState": "products.smsc.operations.retrypolicies.errorbased-global-policies.list",
                "newState": "products.smsc.operations.retrypolicies.errorbased-global-policies.new",
                "updateState": "products.smsc.operations.retrypolicies.errorbased-global-policies.update",
                "backState": "products.smsc.operations.retrypolicies.errorbased-global.list",
                "pageHeaderKey": "Products.SMSC.Operations.RetryPolicies.ErrorBased.PageHeader",
                "subPageHeaderKey": "Products.SMSC.Operations.RetryPolicies.GlobalPolicies.PageHeader"
            },
            resolve: {
                retryPoliciesErrorBased: function ($stateParams, SmscConfService) {
                    var contextName = $stateParams.contextName;
                    var errorCode = $stateParams.errorCode;

                    return SmscConfService.getRetryPolicyErrorBasedByErrorCode(contextName, errorCode);
                }
            }
        }).state('products.smsc.operations.retrypolicies.errorbased-global-policies.list', {
            url: "",
            templateUrl: "products/smsc/operations/operations.retrypolicies.html",
            controller: 'SmscRetryPoliciesErrorBasedErrorCodePoliciesOperationsCtrl'
        }).state('products.smsc.operations.retrypolicies.errorbased-global-policies.new', {
            url: "/new",
            templateUrl: "products/smsc/operations/operations.retrypolicies.details.html",
            controller: 'SmscRetryPoliciesErrorBasedNewPolicyOperationsCtrl'
        }).state('products.smsc.operations.retrypolicies.errorbased-global-policies.update', {
            url: "/update/{preference:[0-9]*}",
            templateUrl: "products/smsc/operations/operations.retrypolicies.details.html",
            controller: 'SmscRetryPoliciesErrorBasedUpdatePolicyOperationsCtrl'
        });

        // Per Orig. Application
        $stateProvider.state('products.smsc.operations.retrypolicies.errorbased-per-application-policies', {
            abstract: true,
            url: "/errorbased/per-application/policies/:contextName/{errorCode:[0-9]*}/{appId:[0-9]*}",
            template: "<div ui-view></div>",
            data: {
                "isGlobal": false,
                "listState": "products.smsc.operations.retrypolicies.errorbased-per-application-policies.list",
                "newState": "products.smsc.operations.retrypolicies.errorbased-per-application-policies.new",
                "updateState": "products.smsc.operations.retrypolicies.errorbased-per-application-policies.update",
                "backState": "products.smsc.operations.retrypolicies.errorbased-per-application.list",
                "pageHeaderKey": "Products.SMSC.Operations.RetryPolicies.ErrorBased.PageHeader",
                "subPageHeaderKey": "Products.SMSC.Operations.RetryPolicies.PerOrigApplicationPolicies.PageHeader"
            },
            resolve: {
                retryPoliciesErrorBased: function ($stateParams, SmscConfService) {
                    var contextName = $stateParams.contextName;
                    var errorCode = $stateParams.errorCode;
                    var appId = $stateParams.appId;

                    return SmscConfService.getRetryPolicyErrorBasedByErrorCode(contextName, errorCode, appId);
                }
            }
        }).state('products.smsc.operations.retrypolicies.errorbased-per-application-policies.list', {
            url: "",
            templateUrl: "products/smsc/operations/operations.retrypolicies.html",
            controller: 'SmscRetryPoliciesErrorBasedErrorCodePoliciesOperationsCtrl'
        }).state('products.smsc.operations.retrypolicies.errorbased-per-application-policies.new', {
            url: "/new",
            templateUrl: "products/smsc/operations/operations.retrypolicies.details.html",
            controller: 'SmscRetryPoliciesErrorBasedNewPolicyOperationsCtrl'
        }).state('products.smsc.operations.retrypolicies.errorbased-per-application-policies.update', {
            url: "/update/{preference:[0-9]*}",
            templateUrl: "products/smsc/operations/operations.retrypolicies.details.html",
            controller: 'SmscRetryPoliciesErrorBasedUpdatePolicyOperationsCtrl',
            resolve: {
                retryPoliciesErrorBased: function (SmscConfService, $stateParams) {
                    var contextName = $stateParams.contextName;
                    var errorCode = $stateParams.errorCode;
                    var appId = $stateParams.appId;

                    return SmscConfService.getRetryPolicyErrorBasedByErrorCode(contextName, errorCode, appId);
                }
            }
        });

    });

    SmscRetryPoliciesErrorBasedErrorCodePoliciesOperationsModule.controller('SmscRetryPoliciesErrorBasedErrorCodePoliciesOperationsCtrl', function ($scope, $log, $state, $stateParams, $translate, $filter, notification, $uibModal,
                                                                                                                                                                  $timeout, SmscConfService, Restangular, NgTableParams, NgTableService,
                                                                                                                                                                  retryPoliciesErrorBased) {

        $log.debug("SMSCRetryPoliciesErrorBasedErrorCodePoliciesOperationsCtrl");

        $scope.contextName = $stateParams.contextName;
        $scope.errorCode = $stateParams.errorCode;
        $scope.appId = $stateParams.appId;

        // Get state urls for using in generic pages.
        $scope.isGlobal = $state.current.data.isGlobal;
        $scope.listState = $state.current.data.listState;
        $scope.backState = $state.current.data.backState;
        $scope.newState = $state.current.data.newState;
        $scope.updateState = $state.current.data.updateState;

        $scope.showTable = true;
        $scope.hideSMPPApplications = true;

        var retryPolicyList = Restangular.stripRestangular(retryPoliciesErrorBased)[0].retryPolicyItems;

        // Retry Policies Error Based list
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
        // END - Retry Policies Error Based list

        $scope.remove = function (retryPolicyErrorBased) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing Retry Policies Error Based: ', retryPolicyErrorBased);

                SmscConfService.deleteRetryPolicyErrorBasedPolicyByPreference($scope.contextName, $scope.errorCode, retryPolicyErrorBased.preference, $scope.appId).then(function (response) {
                    $log.debug('Removed Retry Policies Error Based: ', response);

                    var deletedListItem = _.findWhere($scope.retryPolicyList.list, {
                        preference: retryPolicyErrorBased.preference
                    });
                    $scope.retryPolicyList.list = _.without($scope.retryPolicyList.list, deletedListItem);

                    $scope.retryPolicyList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete Retry Policies Error Based: ', response);
                });
            });
        };

    });

    SmscRetryPoliciesErrorBasedErrorCodePoliciesOperationsModule.controller('SmscRetryPoliciesErrorBasedNewPolicyOperationsCtrl', function ($scope, $state, $stateParams, $log, $translate, $filter,
                                                                                                                                                          notification, $uibModal, UtilService, SmscConfService, Restangular,
                                                                                                                                                          retryPoliciesErrorBased, INTERVAL_UNITS) {
        $log.debug("SMSCRetryPoliciesErrorBasedNewPolicyOperationsCtrl");

        $scope.contextName = $stateParams.contextName;
        $scope.errorCode = $stateParams.errorCode;
        $scope.appId = $stateParams.appId;

        // Get state urls for using in generic pages.
        $scope.isGlobal = $state.current.data.isGlobal;
        $scope.listState = $state.current.data.listState;

        $scope.INTERVAL_UNITS = INTERVAL_UNITS;

        $scope.retryPolicy = {
            retryIntervalUnit: INTERVAL_UNITS[1]
        };

        var retryPolicyErrorCode = Restangular.stripRestangular(retryPoliciesErrorBased)[0];

        $scope.save = function (retryPolicy) {
            var retryPolicyItem = {
                "preference": retryPolicy.preference,
                "retryCount": retryPolicy.retryCount,
                "retryInterval": retryPolicy.retryInterval,
                "retryIntervalUnit": retryPolicy.retryIntervalUnit
            };

            var retryPolicyContentItem = {
                "contextName": retryPolicyErrorCode.contextName,
                "errorCode": retryPolicyErrorCode.errorCode,
                "errorType": retryPolicyErrorCode.errorType,
                "policyName": retryPolicyErrorCode.policyName,
                "retryPolicyItems": [
                    retryPolicyItem
                ]
            };

            SmscConfService.addRetryPolicyErrorBased(retryPolicyContentItem, $stateParams.appId).then(function (response) {
                $log.debug('Added Retry Policies Error Based: ', response);

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

                    $state.transitionTo($scope.listState, {
                        contextName: $stateParams.contextName,
                        errorCode: $stateParams.errorCode,
                        appId: $stateParams.appId
                    }, {
                        reload: true,
                        inherit: true,
                        notify: true
                    });
                }
            }, function (response) {
                $log.debug('Cannot add Retry Policies Error Based: ', response);
            });
        };

        $scope.cancel = function () {
            $state.transitionTo($scope.listState, {
                contextName: $stateParams.contextName,
                errorCode: $stateParams.errorCode,
                appId: $stateParams.appId
            }, {
                reload: true,
                inherit: true,
                notify: true
            });
        };
    });

    SmscRetryPoliciesErrorBasedErrorCodePoliciesOperationsModule.controller('SmscRetryPoliciesErrorBasedUpdatePolicyOperationsCtrl', function ($scope, $state, $stateParams, $log, $translate, $filter,
                                                                                                                                                             notification, $uibModal, UtilService, SmscConfService, Restangular,
                                                                                                                                                             retryPoliciesErrorBased, INTERVAL_UNITS) {
        $log.debug("SMSCRetryPoliciesErrorBasedUpdatePolicyOperationsCtrl");

        $scope.contextName = $stateParams.contextName;
        $scope.errorCode = $stateParams.errorCode;
        $scope.appId = $stateParams.appId;

        // Get state urls for using in generic pages.
        $scope.isGlobal = $state.current.data.isGlobal;
        $scope.listState = $state.current.data.listState;

        $scope.INTERVAL_UNITS = INTERVAL_UNITS;

        var retryPolicyErrorCode = Restangular.stripRestangular(retryPoliciesErrorBased)[0];
        var retryPoliciesErrorBasedList = retryPolicyErrorCode.retryPolicyItems;
        if (retryPoliciesErrorBasedList.length > 0) {
            $scope.retryPolicy = _.findWhere(retryPoliciesErrorBasedList, {preference: Number($stateParams.preference)});
            $scope.retryPolicy.id = _.uniqueId(); // Set to id field in order to use decision is this update or create in the detail form.
        }

        $scope.retryPolicyOriginal = angular.copy($scope.retryPolicy);
        $scope.isRetryPolicyNotChanged = function () {
            return angular.equals($scope.retryPolicy, $scope.retryPolicyOriginal);
        };

        $scope.save = function (retryPolicy) {
            var retryPolicyItem = {
                "preference": $scope.retryPolicyOriginal.preference,
                "retryCount": retryPolicy.retryCount,
                "retryInterval": retryPolicy.retryInterval,
                "retryIntervalUnit": retryPolicy.retryIntervalUnit
            };

            var retryPolicyContentItem = {
                "contextName": retryPolicyErrorCode.contextName,
                "errorCode": retryPolicyErrorCode.errorCode,
                "errorType": retryPolicyErrorCode.errorType,
                "policyName": retryPolicyErrorCode.policyName,
                "retryPolicyItems": [
                    retryPolicyItem
                ]
            };

            SmscConfService.updateRetryPolicyErrorBased(retryPolicyContentItem, $stateParams.appId).then(function (response) {
                $log.debug('Updated Retry Policies Error Based: ', response);

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

                    $state.transitionTo($scope.listState, {
                        contextName: $stateParams.contextName,
                        errorCode: $stateParams.errorCode,
                        appId: $stateParams.appId
                    }, {
                        reload: true,
                        inherit: true,
                        notify: true
                    });
                }
            }, function (response) {
                $log.debug('Cannot update Retry Policies Error Based: ', response);
            });
        };

        $scope.cancel = function () {
            $state.transitionTo($scope.listState, {
                contextName: $stateParams.contextName,
                errorCode: $stateParams.errorCode,
                appId: $stateParams.appId
            }, {
                reload: true,
                inherit: true,
                notify: true
            });
        };
    });

})();
