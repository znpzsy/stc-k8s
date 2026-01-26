(function () {

    'use strict';

    angular.module('adminportal.products.smsc.operations.retrypolicies.errorbased.suberrors', [
        'adminportal.products.smsc.operations.retrypolicies.suberrorbased.suberrors.policies'
    ]);

    var SmscRetryPoliciesErrorBasedSubErrorCodeOperationsModule = angular.module('adminportal.products.smsc.operations.retrypolicies.errorbased.suberrors');

    SmscRetryPoliciesErrorBasedSubErrorCodeOperationsModule.config(function ($stateProvider) {

        // Global Sub Errors
        $stateProvider.state('products.smsc.operations.retrypolicies.suberrorbased-global', {
            abstract: true,
            url: "/errorbased/smsc/suberrors/:contextName/{errorCode:[0-9]*}",
            template: "<div ui-view></div>",
            data: {
                "isGlobal": true,
                "listState": "products.smsc.operations.retrypolicies.suberrorbased-global.list",
                "newState": "products.smsc.operations.retrypolicies.suberrorbased-global.new",
                "updateState": "products.smsc.operations.retrypolicies.suberrorbased-global.update",
                "policiesState": "products.smsc.operations.retrypolicies.suberrorbased-global-policies.list",
                "backState": "products.smsc.operations.retrypolicies.errorbased-global.list",
                "pageHeaderKey": "Products.SMSC.Operations.RetryPolicies.SubErrorBased.PageHeader",
                "subPageHeaderKey": "Products.SMSC.Operations.RetryPolicies.GlobalSubErrors.PageHeader"
            },
            resolve: {
                retryPoliciesErrorBased: function ($stateParams, SmscConfService) {
                    var errorCode = $stateParams.errorCode;

                    return SmscConfService.getRetryPoliciesErrorBasedSubErrors(errorCode);
                }
            }
        }).state('products.smsc.operations.retrypolicies.suberrorbased-global.list', {
            url: "",
            templateUrl: "products/smsc/operations/operations.retrypolicies.errorbased.suberrors.html",
            controller: 'SmscRetryPoliciesErrorBasedSubErrorCodeOperationsCtrl'
        }).state('products.smsc.operations.retrypolicies.suberrorbased-global.new', {
            url: "/new",
            templateUrl: "products/smsc/operations/operations.retrypolicies.errorbased.suberrors.details.html",
            controller: 'SmscRetryPoliciesNewErrorBasedSubErrorCodeOperationsCtrl'
        }).state('products.smsc.operations.retrypolicies.suberrorbased-global.update', {
            url: "/update/{subErrorCode:[0-9]*}",
            templateUrl: "products/smsc/operations/operations.retrypolicies.errorbased.suberrors.details.html",
            controller: 'SmscRetryPoliciesUpdateErrorBasedSubErrorCodeOperationsCtrl',
            resolve: {
                retryPolicyErrorBased: function ($stateParams, SmscConfService) {
                    var errorCode = $stateParams.errorCode;
                    var subErrorCode = $stateParams.subErrorCode;

                    return SmscConfService.getRetryPolicyErrorBasedBySubErrorCode(errorCode, subErrorCode);
                }
            }
        });

        // Per Orig. Application
        $stateProvider.state('products.smsc.operations.retrypolicies.suberrorbased-per-application', {
            abstract: true,
            url: "/errorbased/per-application/suberrors/:contextName/{errorCode:[0-9]*}",
            template: "<div ui-view></div>",
            data: {
                "isGlobal": false,
                "listState": "products.smsc.operations.retrypolicies.suberrorbased-per-application.list",
                "newState": "products.smsc.operations.retrypolicies.suberrorbased-per-application.new",
                "updateState": "products.smsc.operations.retrypolicies.suberrorbased-per-application.update",
                "policiesState": "products.smsc.operations.retrypolicies.suberrorbased-per-application-policies.list",
                "backState": "products.smsc.operations.retrypolicies.errorbased-per-application.list",
                "pageHeaderKey": "Products.SMSC.Operations.RetryPolicies.SubErrorBased.PageHeader",
                "subPageHeaderKey": "Products.SMSC.Operations.RetryPolicies.PerOrigApplicationSubErrors.PageHeader"
            }
        }).state('products.smsc.operations.retrypolicies.suberrorbased-per-application.list', {
            url: "/{appId:[0-9]*}",
            templateUrl: "products/smsc/operations/operations.retrypolicies.errorbased.suberrors.html",
            controller: 'SmscRetryPoliciesErrorBasedSubErrorCodeOperationsCtrl',
            resolve: {
                retryPoliciesErrorBased: function ($stateParams, SmscConfService) {
                    var errorCode = $stateParams.errorCode;
                    var appId = $stateParams.appId;

                    if (appId) {
                        return SmscConfService.getRetryPoliciesErrorBasedSubErrors(errorCode, appId);
                    }

                    return [];
                }
            }
        }).state('products.smsc.operations.retrypolicies.suberrorbased-per-application.new', {
            url: "/new/{appId:[0-9]*}",
            templateUrl: "products/smsc/operations/operations.retrypolicies.errorbased.suberrors.details.html",
            controller: 'SmscRetryPoliciesNewErrorBasedSubErrorCodeOperationsCtrl',
            resolve: {
                retryPoliciesErrorBased: function ($stateParams, SmscConfService) {
                    var errorCode = $stateParams.errorCode;
                    var appId = $stateParams.appId;

                    return SmscConfService.getRetryPoliciesErrorBasedSubErrors(errorCode, appId);
                }
            }
        }).state('products.smsc.operations.retrypolicies.suberrorbased-per-application.update', {
            url: "/update/{subErrorCode:[0-9]*}/{appId:[0-9]*}",
            templateUrl: "products/smsc/operations/operations.retrypolicies.errorbased.suberrors.details.html",
            controller: 'SmscRetryPoliciesUpdateErrorBasedSubErrorCodeOperationsCtrl',
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

    SmscRetryPoliciesErrorBasedSubErrorCodeOperationsModule.controller('SmscRetryPoliciesErrorBasedSubErrorCodeOperationsCtrl', function ($scope, $log, $state, $stateParams, $translate, $filter, notification, $uibModal,
                                                                                                                                                        $timeout, SmscConfService, Restangular, NgTableParams, NgTableService,
                                                                                                                                                        retryPoliciesErrorBased) {
        $log.debug("SMSCRetryPoliciesErrorBasedSubErrorCodeOperationsCtrl");

        $scope.appId = $stateParams.appId;

        // Get state urls for using in generic pages.
        $scope.isGlobal = $state.current.data.isGlobal;
        $scope.listState = $state.current.data.listState;
        $scope.newState = $state.current.data.newState;
        $scope.updateState = $state.current.data.updateState;
        $scope.policiesState = $state.current.data.policiesState;
        $scope.backState = $state.current.data.backState;

        var retryPolicyErrorCodeList = retryPoliciesErrorBased ? Restangular.stripRestangular(retryPoliciesErrorBased).subErrorBasedRetryPolicies : [];

        // Retry Policies Error Based Sub Error list
        $scope.retryPolicyErrorCodeList = {
            list: retryPolicyErrorCodeList,
            tableParams: {}
        };

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.retryPolicyErrorCodeList.tableParams.settings().$scope.filterText = filterText;
            $scope.retryPolicyErrorCodeList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.retryPolicyErrorCodeList.tableParams.page(1);
            $scope.retryPolicyErrorCodeList.tableParams.reload();
        }, 750);

        $scope.retryPolicyErrorCodeList.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "subErrorCode": 'asc' // initial sorting
            }
        }, {
            total: $scope.retryPolicyErrorCodeList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.retryPolicyErrorCodeList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.retryPolicyErrorCodeList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Retry Policies Error Based Sub Error list

        $scope.removeErrorCodeSubError = function (errorCode, retryPoliciesErrorBased) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing Retry Policy Error Based:', errorCode, ' Sub Error Code: ', retryPoliciesErrorBased);

                SmscConfService.deleteRetryPolicyErrorBasedBySubErrorCode(errorCode, retryPoliciesErrorBased.subErrorCode, $scope.appId).then(function (response) {
                    $log.debug('Removed Retry Policy Error Based:', errorCode, ' Response: ', response);

                    var deletedListItem = _.findWhere($scope.retryPolicyErrorCodeList.list, {
                        subErrorCode: retryPoliciesErrorBased.subErrorCode
                    });
                    $scope.retryPolicyErrorCodeList.list = _.without($scope.retryPolicyErrorCodeList.list, deletedListItem);

                    $scope.retryPolicyErrorCodeList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete Retry Policy Error Based:', errorCode, ' Response: ', response);
                });
            });
        };

    });

    SmscRetryPoliciesErrorBasedSubErrorCodeOperationsModule.controller('SmscRetryPoliciesNewErrorBasedSubErrorCodeOperationsCtrl', function ($scope, $state, $stateParams, $log, $translate, $filter,
                                                                                                                                                           notification, $uibModal, UtilService, SmscConfService, Restangular,
                                                                                                                                                           retryPoliciesErrorBased, RETRY_POLICIES_ERROR_TYPES) {
        $log.debug("SMSCRetryPoliciesNewErrorBasedSubErrorCodeOperationsCtrl");

        // put all retry policy error code list to the scope
        $scope.retryPolicyErrorCodeList = retryPoliciesErrorBased ? Restangular.stripRestangular(retryPoliciesErrorBased).subErrorBasedRetryPolicies : [];

        // Get state urls for using in generic pages.
        $scope.isGlobal = $state.current.data.isGlobal;
        $scope.listState = $state.current.data.listState;

        $scope.RETRY_POLICIES_ERROR_TYPES = RETRY_POLICIES_ERROR_TYPES;

        $scope.retryPolicyErrorCode = {
            errorType: RETRY_POLICIES_ERROR_TYPES[0]
        };

        $scope.save = function (errorCode, retryPolicyErrorCode) {
            var retryPolicyErrorCodeItem = {
                "subErrorCode": retryPolicyErrorCode.subErrorCode,
                "errorType": retryPolicyErrorCode.errorType
            };

            SmscConfService.addRetryPolicyErrorBasedSubError(errorCode, retryPolicyErrorCodeItem, $stateParams.appId).then(function (response) {
                $log.debug('Added Retry Policy Error Based:', errorCode, ' Response: ', response);

                var apiResponse = Restangular.stripRestangular(response);

                // If there is an error message appears a notification bar.
                if (apiResponse.errorCode === 500 && apiResponse.errorMsg) {
                    if (apiResponse.errorMsg.indexOf('already') > -1) {
                        notification({
                            type: 'danger',
                            text: $translate.instant('Products.SMSC.Operations.RetryPolicies.Messages.PolicySubErrorCodeAlreadyDefinedError', {
                                error_code: retryPolicyErrorCode.errorCode
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
                $log.debug('Cannot add Retry Policy Error Based:', errorCode, ' Response: ', response);
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

    SmscRetryPoliciesErrorBasedSubErrorCodeOperationsModule.controller('SmscRetryPoliciesUpdateErrorBasedSubErrorCodeOperationsCtrl', function ($scope, $state, $stateParams, $log, $translate, $filter, notification,
                                                                                                                                                              $uibModal, UtilService, SmscConfService, Restangular, retryPolicyErrorBased,
                                                                                                                                                              RETRY_POLICIES_ERROR_TYPES) {
        $log.debug("SMSCRetryPoliciesUpdateErrorBasedSubErrorCodeOperationsCtrl");

        // Get state urls for using in generic pages.
        $scope.isGlobal = $state.current.data.isGlobal;
        $scope.listState = $state.current.data.listState;

        $scope.RETRY_POLICIES_ERROR_TYPES = RETRY_POLICIES_ERROR_TYPES;

        $scope.retryPolicyErrorCode = Restangular.stripRestangular(retryPolicyErrorBased);
        $scope.retryPolicyErrorCode.id = _.uniqueId(); // Set to id field in order to use decision is this update or create in the detail form.

        $scope.retryPolicyErrorCodeOriginal = angular.copy($scope.retryPolicyErrorCode);
        $scope.isRetryPolicyNotChanged = function () {
            return angular.equals($scope.retryPolicyErrorCode, $scope.retryPolicyErrorCodeOriginal);
        };

        $scope.save = function (errorCode, retryPolicyErrorCode) {
            var retryPolicyErrorCodeItem = {
                "subErrorCode": $scope.retryPolicyErrorCodeOriginal.subErrorCode,
                "errorType": retryPolicyErrorCode.errorType
            };

            SmscConfService.updateRetryPolicyErrorBasedSubError(errorCode, retryPolicyErrorCodeItem, $stateParams.appId).then(function (response) {
                $log.debug('Updated Retry Policy Error Based:', errorCode, ' Response: ', response);

                var apiResponse = Restangular.stripRestangular(response);

                // If there is an error message appears a notification bar.
                if (apiResponse.errorCode === 500 && apiResponse.errorMsg) {
                    if (apiResponse.errorMsg.indexOf('already') > -1) {
                        notification({
                            type: 'danger',
                            text: $translate.instant('Products.SMSC.Operations.RetryPolicies.Messages.PolicySubErrorCodeAlreadyDefinedError', {
                                error_code: retryPolicyErrorCode.errorCode
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
                $log.debug('Cannot update Retry Policy Error Based:', errorCode, ' Response: ', response);
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
