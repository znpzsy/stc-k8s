(function () {

    'use strict';

    angular.module('adminportal.products.smsc.operations.retrypolicies.ss7', []);

    var SmscRetryPoliciesSS7OperationsModule = angular.module('adminportal.products.smsc.operations.retrypolicies.ss7');

    SmscRetryPoliciesSS7OperationsModule.config(function ($stateProvider) {

        // Global
        $stateProvider.state('products.smsc.operations.retrypolicies.ss7', {
            abstract: true,
            url: "/ss7",
            template: "<div ui-view></div>",
            data: {
                "isGlobal": true,
                "listState": "products.smsc.operations.retrypolicies.ss7.list",
                "newState": "products.smsc.operations.retrypolicies.ss7.new",
                "updateState": "products.smsc.operations.retrypolicies.ss7.update",
                "pageHeaderKey": "Products.SMSC.Operations.RetryPolicies.SS7RetryPolicies.PageHeader"
            },
            resolve: {
                retryPoliciesSS7: function (SmscConfService) {
                    return SmscConfService.getRetryPoliciesSS7();
                }
            }
        }).state('products.smsc.operations.retrypolicies.ss7.list', {
            url: "",
            templateUrl: "products/smsc/operations/operations.retrypolicies.html",
            controller: 'SmscRetryPoliciesSS7OperationsCtrl'
        }).state('products.smsc.operations.retrypolicies.ss7.new', {
            url: "/new",
            templateUrl: "products/smsc/operations/operations.retrypolicies.details.html",
            controller: 'SmscRetryPoliciesNewSS7OperationsCtrl'
        }).state('products.smsc.operations.retrypolicies.ss7.update', {
            url: "/update/:preference",
            templateUrl: "products/smsc/operations/operations.retrypolicies.details.html",
            controller: 'SmscRetryPoliciesUpdateSS7OperationsCtrl'
        });

    });

    SmscRetryPoliciesSS7OperationsModule.controller('SmscRetryPoliciesSS7OperationsCtrl', function ($scope, $log, $state, $translate, $filter, notification, $uibModal,
                                                                                                                  $timeout, SmscConfService, Restangular, NgTableParams, NgTableService,
                                                                                                                  retryPoliciesSS7) {
        $log.debug("SMSCRetryPoliciesSS7OperationsCtrl");

        // Get state urls for using in generic pages.
        $scope.isGlobal = $state.current.data.isGlobal;
        $scope.listState = $state.current.data.listState;
        $scope.newState = $state.current.data.newState;
        $scope.updateState = $state.current.data.updateState;

        $scope.showTable = true;

        var retryPolicyList = Restangular.stripRestangular(retryPoliciesSS7).retryPolicyItems;

        // Defining an empty application list since there is no application based ss7 retry policies.
        $scope.smppApplicationList = [];

        // Retry Policies Destination Application list
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
        // END - Retry Policies Destination Application list

        $scope.remove = function (retryPoliciesSS7) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing Retry Policies Destination Application: ', retryPoliciesSS7);

                SmscConfService.deleteRetryPolicySS7ByPreference(retryPoliciesSS7.preference).then(function (response) {
                    $log.debug('Removed Retry Policies Destination Application: ', response);

                    var deletedListItem = _.findWhere($scope.retryPolicyList.list, {
                        preference: retryPoliciesSS7.preference
                    });
                    $scope.retryPolicyList.list = _.without($scope.retryPolicyList.list, deletedListItem);

                    $scope.retryPolicyList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete Retry Policies Destination Application: ', response);
                });
            });
        };

    });

    SmscRetryPoliciesSS7OperationsModule.controller('SmscRetryPoliciesNewSS7OperationsCtrl', function ($scope, $state, $stateParams, $log, $translate, $filter, notification,
                                                                                                                     $uibModal, UtilService, SmscConfService, Restangular, INTERVAL_UNITS) {
        $log.debug("SMSCRetryPoliciesNewSS7OperationsCtrl");

        // Get state urls for using in generic pages.
        $scope.isGlobal = $state.current.data.isGlobal;
        $scope.listState = $state.current.data.listState;

        $scope.INTERVAL_UNITS = INTERVAL_UNITS;

        $scope.retryPolicy = {
            retryIntervalUnit: INTERVAL_UNITS[1]
        };

        $scope.save = function (retryPolicy) {
            var retryPolicyItem = {
                "preference": retryPolicy.preference,
                "retryCount": retryPolicy.retryCount,
                "retryInterval": retryPolicy.retryInterval,
                "retryIntervalUnit": retryPolicy.retryIntervalUnit
            };

            SmscConfService.addRetryPolicySS7(retryPolicyItem).then(function (response) {
                $log.debug('Added Retry Policies Destination Application: ', response);

                var apiResponse = Restangular.stripRestangular(response);

                if (apiResponse.errorCode === 500 && apiResponse.errorMsg) {
                    // If there is an error message it shows as a notification bar.
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

                    $state.transitionTo($scope.listState, {}, {
                        reload: true,
                        inherit: true,
                        notify: true
                    });
                }
            }, function (response) {
                $log.debug('Cannot add Retry Policies Destination Application: ', response);
            });
        };

        $scope.cancel = function () {
            $state.transitionTo($scope.listState, {}, {
                reload: true,
                inherit: true,
                notify: true
            });
        };
    });

    SmscRetryPoliciesSS7OperationsModule.controller('SmscRetryPoliciesUpdateSS7OperationsCtrl', function ($scope, $state, $stateParams, $log, $translate, $filter, notification,
                                                                                                                        $uibModal, UtilService, SmscConfService, Restangular, INTERVAL_UNITS,
                                                                                                                        retryPoliciesSS7) {
        $log.debug("SMSCRetryPoliciesUpdateSS7OperationsCtrl");

        // Get state urls for using in generic pages.
        $scope.isGlobal = $state.current.data.isGlobal;
        $scope.listState = $state.current.data.listState;

        $scope.INTERVAL_UNITS = INTERVAL_UNITS;

        var retryPoliciesSS7List = Restangular.stripRestangular(retryPoliciesSS7).retryPolicyItems;
        if (retryPoliciesSS7List.length > 0) {
            $scope.retryPolicy = _.findWhere(retryPoliciesSS7List, {preference: Number($stateParams.preference)});
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

            SmscConfService.updateRetryPolicySS7(retryPolicyItem).then(function (response) {
                $log.debug('Updated Retry Policies Destination Application: ', response);

                var apiResponse = Restangular.stripRestangular(response);

                if (apiResponse.errorCode) {
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

                    $state.transitionTo($scope.listState, {}, {
                        reload: true,
                        inherit: true,
                        notify: true
                    });
                }
            }, function (response) {
                $log.debug('Cannot update Retry Policies SS7: ', response);
            });
        };

        $scope.cancel = function () {
            $state.transitionTo($scope.listState, {}, {
                reload: true,
                inherit: true,
                notify: true
            });
        };
    });

})();
