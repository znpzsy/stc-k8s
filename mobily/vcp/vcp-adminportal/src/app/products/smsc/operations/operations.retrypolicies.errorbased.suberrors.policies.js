(function () {

    'use strict';

    angular.module('adminportal.products.smsc.operations.retrypolicies.suberrorbased.suberrors.policies', []);

    var SmscRetryPoliciesErrorBasedSubErrorCodePoliciesOperationsModule = angular.module('adminportal.products.smsc.operations.retrypolicies.suberrorbased.suberrors.policies');

    SmscRetryPoliciesErrorBasedSubErrorCodePoliciesOperationsModule.config(function ($stateProvider) {

        // Global Sub Errors Policies
        $stateProvider.state('products.smsc.operations.retrypolicies.suberrorbased-global-policies', {
            abstract: true,
            url: "/errorbased/smsc/suberrors/policies/:contextName/{errorCode:[0-9]*}/{subErrorCode:[0-9]*}",
            template: "<div ui-view></div>",
            data: {
                "isGlobal": true,
                "listState": "products.smsc.operations.retrypolicies.suberrorbased-global-policies.list",
                "newState": "products.smsc.operations.retrypolicies.suberrorbased-global-policies.new",
                "updateState": "products.smsc.operations.retrypolicies.suberrorbased-global-policies.update",
                "backState": "products.smsc.operations.retrypolicies.suberrorbased-global.list",
                "pageHeaderKey": "Products.SMSC.Operations.RetryPolicies.SubErrorBased.PageHeader",
                "subPageHeaderKey": "Products.SMSC.Operations.RetryPolicies.GlobalSubErrorsPolicies.PageHeader"
            },
            resolve: {
                retryPolicyErrorBased: function ($stateParams, SmscConfService) {
                    var errorCode = $stateParams.errorCode;
                    var subErrorCode = $stateParams.subErrorCode;

                    return SmscConfService.getRetryPolicyErrorBasedBySubErrorCode(errorCode, subErrorCode);
                }
            }
        }).state('products.smsc.operations.retrypolicies.suberrorbased-global-policies.list', {
            url: "",
            templateUrl: "products/smsc/operations/operations.retrypolicies.html",
            controller: 'SmscRetryPoliciesErrorBasedSubErrorCodePoliciesOperationsCtrl'
        }).state('products.smsc.operations.retrypolicies.suberrorbased-global-policies.new', {
            url: "/new",
            templateUrl: "products/smsc/operations/operations.retrypolicies.details.html",
            controller: 'SmscRetryPoliciesNewErrorBasedSubErrorCodePolicyOperationsCtrl'
        }).state('products.smsc.operations.retrypolicies.suberrorbased-global-policies.update', {
            url: "/update/{preference:[0-9]*}",
            templateUrl: "products/smsc/operations/operations.retrypolicies.details.html",
            controller: 'SmscRetryPoliciesUpdateErrorBasedSubErrorCodePolicyOperationsCtrl'
        });

        // Per Orig. Application Sub Errors Policies
        $stateProvider.state('products.smsc.operations.retrypolicies.suberrorbased-per-application-policies', {
            abstract: true,
            url: "/errorbased/per-application/suberrors/policies/:contextName/{errorCode:[0-9]*}/{subErrorCode:[0-9]*}/{appId:[0-9]*}",
            template: "<div ui-view></div>",
            data: {
                "isGlobal": true,
                "listState": "products.smsc.operations.retrypolicies.suberrorbased-per-application-policies.list",
                "newState": "products.smsc.operations.retrypolicies.suberrorbased-per-application-policies.new",
                "updateState": "products.smsc.operations.retrypolicies.suberrorbased-per-application-policies.update",
                "backState": "products.smsc.operations.retrypolicies.suberrorbased-per-application.list",
                "pageHeaderKey": "Products.SMSC.Operations.RetryPolicies.SubErrorBased.PageHeader",
                "subPageHeaderKey": "Products.SMSC.Operations.RetryPolicies.PerOrigApplicationSubErrorsPolicies.PageHeader"
            },
            resolve: {
                retryPolicyErrorBased: function ($stateParams, SmscConfService) {
                    var errorCode = $stateParams.errorCode;
                    var subErrorCode = $stateParams.subErrorCode;
                    var appId = $stateParams.appId;

                    return SmscConfService.getRetryPolicyErrorBasedBySubErrorCode(errorCode, subErrorCode, appId);
                }
            }
        }).state('products.smsc.operations.retrypolicies.suberrorbased-per-application-policies.list', {
            url: "",
            templateUrl: "products/smsc/operations/operations.retrypolicies.html",
            controller: 'SmscRetryPoliciesErrorBasedSubErrorCodePoliciesOperationsCtrl'
        }).state('products.smsc.operations.retrypolicies.suberrorbased-per-application-policies.new', {
            url: "/new",
            templateUrl: "products/smsc/operations/operations.retrypolicies.details.html",
            controller: 'SmscRetryPoliciesNewErrorBasedSubErrorCodePolicyOperationsCtrl'
        }).state('products.smsc.operations.retrypolicies.suberrorbased-per-application-policies.update', {
            url: "/update/{preference:[0-9]*}",
            templateUrl: "products/smsc/operations/operations.retrypolicies.details.html",
            controller: 'SmscRetryPoliciesUpdateErrorBasedSubErrorCodePolicyOperationsCtrl',
            resolve: {
                retryPolicyErrorBased: function ($stateParams, SmscConfService) {
                    var errorCode = $stateParams.errorCode;
                    var subErrorCode = $stateParams.subErrorCode;
                    var appId = $stateParams.appId;

                    return SmscConfService.getRetryPolicyErrorBasedBySubErrorCode(errorCode, subErrorCode, appId);
                }
            }
        });
    });

    SmscRetryPoliciesErrorBasedSubErrorCodePoliciesOperationsModule.controller('SmscRetryPoliciesErrorBasedSubErrorCodePoliciesOperationsCtrl', function ($scope, $log, $state, $stateParams, $translate, $filter, notification, $uibModal,
                                                                                                                                                                        $timeout, SmscConfService, Restangular, NgTableParams, NgTableService,
                                                                                                                                                                        retryPolicyErrorBased) {
        $log.debug("SMSCRetryPoliciesErrorBasedSubErrorCodePoliciesOperationsCtrl");

        $scope.contextName = $stateParams.contextName;
        $scope.errorCode = $stateParams.errorCode;
        $scope.subErrorCode = $stateParams.subErrorCode;
        $scope.appId = $stateParams.appId;

        // Get state urls for using in generic pages.
        $scope.isGlobal = $state.current.data.isGlobal;
        $scope.listState = $state.current.data.listState;
        $scope.backState = $state.current.data.backState;
        $scope.newState = $state.current.data.newState;
        $scope.updateState = $state.current.data.updateState;

        $scope.showTable = true;
        $scope.hideSMPPApplications = true;

        var retryPolicyList = Restangular.stripRestangular(retryPolicyErrorBased).retryPolicyItems;

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
                $log.debug('Removing Retry Policy Error Based:', $scope.errorCode, ' Sub Error Code: ', $scope.subErrorCode, ', Policy: ', retryPolicyErrorBased);

                SmscConfService.deleteRetryPolicyErrorBasedBySubErrorCodeByPreference($scope.errorCode, $scope.subErrorCode, retryPolicyErrorBased.preference, $scope.appId).then(function (response) {
                    $log.debug('Removed Retry Policy Error Based:', $scope.errorCode, ' Sub Error Code: ', $scope.subErrorCode, ', Response: ', response);

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
                    $log.debug('Cannot delete Retry Policy Error Based:', $scope.errorCode, ' Sub Error Code: ', $scope.subErrorCode, ', Response: ', reponse);
                });
            });
        };

    });

    SmscRetryPoliciesErrorBasedSubErrorCodePoliciesOperationsModule.controller('SmscRetryPoliciesNewErrorBasedSubErrorCodePolicyOperationsCtrl', function ($scope, $state, $stateParams, $log, $translate, $filter,
                                                                                                                                                                         notification, $uibModal, UtilService, SmscConfService, Restangular,
                                                                                                                                                                         retryPolicyErrorBased, INTERVAL_UNITS) {
        $log.debug("SMSCRetryPoliciesNewErrorBasedSubErrorCodePolicyOperationsCtrl");

        $scope.contextName = $stateParams.contextName;
        $scope.errorCode = $stateParams.errorCode;
        $scope.subErrorCode = $stateParams.subErrorCode;
        $scope.appId = $stateParams.appId;

        // Get state urls for using in generic pages.
        $scope.isGlobal = $state.current.data.isGlobal;
        $scope.listState = $state.current.data.listState;

        $scope.INTERVAL_UNITS = INTERVAL_UNITS;

        $scope.retryPolicy = {
            retryIntervalUnit: INTERVAL_UNITS[1]
        };

        $scope.retryPolicyItems = Restangular.stripRestangular(retryPolicyErrorBased).retryPolicyItems;

        $scope.save = function (retryPolicy) {
            var retryPolicyItem = {
                "preference": retryPolicy.preference,
                "retryCount": retryPolicy.retryCount,
                "retryInterval": retryPolicy.retryInterval,
                "retryIntervalUnit": retryPolicy.retryIntervalUnit
            };

            SmscConfService.addRetryPolicyErrorBasedSubErrorPolicy($scope.errorCode, $scope.subErrorCode, retryPolicyItem, $stateParams.appId).then(function (response) {
                $log.debug('Added Retry Policy Error Based:', $scope.errorCode, ' Sub Error Code: ', $scope.subErrorCode, ', Response: ', response);

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
                        subErrorCode: $stateParams.subErrorCode,
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
                subErrorCode: $stateParams.subErrorCode,
                appId: $stateParams.appId
            }, {
                reload: true,
                inherit: true,
                notify: true
            });
        };
    });

    SmscRetryPoliciesErrorBasedSubErrorCodePoliciesOperationsModule.controller('SmscRetryPoliciesUpdateErrorBasedSubErrorCodePolicyOperationsCtrl', function ($scope, $state, $stateParams, $log, $translate, $filter,
                                                                                                                                                                            notification, $uibModal, UtilService, SmscConfService, Restangular,
                                                                                                                                                                            retryPolicyErrorBased, INTERVAL_UNITS) {
        $log.debug("SMSCRetryPoliciesUpdateErrorBasedSubErrorCodePolicyOperationsCtrl");

        $scope.contextName = $stateParams.contextName;
        $scope.errorCode = $stateParams.errorCode;
        $scope.subErrorCode = $stateParams.subErrorCode;
        $scope.appId = $stateParams.appId;

        // Get state urls for using in generic pages.
        $scope.isGlobal = $state.current.data.isGlobal;
        $scope.listState = $state.current.data.listState;

        $scope.INTERVAL_UNITS = INTERVAL_UNITS;

        var retryPolicyErrorCode = Restangular.stripRestangular(retryPolicyErrorBased);
        var retryPolicyErrorBasedList = retryPolicyErrorCode.retryPolicyItems;
        if (retryPolicyErrorBasedList.length > 0) {
            $scope.retryPolicy = _.findWhere(retryPolicyErrorBasedList, {preference: Number($stateParams.preference)});
            $scope.retryPolicy.id = _.uniqueId(); // Set to id field in order to use decision is this update or create in the detail form.
        }

        $scope.retryPolicyOriginal = angular.copy($scope.retryPolicy);
        $scope.isRetryPolicyNotChanged = function () {
            return angular.equals($scope.retryPolicy, $scope.retryPolicyOriginal);
        };

        $scope.save = function (retryPolicy) {
            var retryPolicyItem = {
                "preference": retryPolicy.preference,
                "retryCount": retryPolicy.retryCount,
                "retryInterval": retryPolicy.retryInterval,
                "retryIntervalUnit": retryPolicy.retryIntervalUnit
            };

            SmscConfService.updateRetryPolicyErrorBasedSubErrorPolicy($scope.errorCode, $scope.subErrorCode, retryPolicyItem, $stateParams.appId).then(function (response) {
                $log.debug('Updated Retry Policy Error Based:', $scope.errorCode, ' Sub Error Code: ', $scope.subErrorCode, ', Response: ', response);

                var apiResponse = Restangular.stripRestangular(response);

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
                        subErrorCode: $stateParams.subErrorCode,
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
                subErrorCode: $stateParams.subErrorCode,
                appId: $stateParams.appId
            }, {
                reload: true,
                inherit: true,
                notify: true
            });
        };
    });

})();
