(function () {

    'use strict';

    angular.module('adminportal.products.smsc.operations.retrypolicies.errorbased', [
        'adminportal.products.smsc.operations.retrypolicies.errorbased.policies',
        'adminportal.products.smsc.operations.retrypolicies.errorbased.suberrors'
    ]);

    var SmscRetryPoliciesErrorBasedErrorCodeOperationsModule = angular.module('adminportal.products.smsc.operations.retrypolicies.errorbased');

    SmscRetryPoliciesErrorBasedErrorCodeOperationsModule.config(function ($stateProvider) {

        // Global
        $stateProvider.state('products.smsc.operations.retrypolicies.errorbased-global', {
            abstract: true,
            url: "/errorbased/smsc",
            template: "<div ui-view></div>",
            data: {
                "isGlobal": true,
                "listState": "products.smsc.operations.retrypolicies.errorbased-global.list",
                "newState": "products.smsc.operations.retrypolicies.errorbased-global.new",
                "updateState": "products.smsc.operations.retrypolicies.errorbased-global.update",
                "policiesState": "products.smsc.operations.retrypolicies.errorbased-global-policies.list",
                "subErrorsState": "products.smsc.operations.retrypolicies.suberrorbased-global.list",
                "pageHeaderKey": "Products.SMSC.Operations.RetryPolicies.ErrorBased.PageHeader",
                "subPageHeaderKey": "Products.SMSC.Operations.RetryPolicies.Global.PageHeader"
            },
            resolve: {
                retryPoliciesErrorBased: function (SmscConfService) {
                    return SmscConfService.getRetryPoliciesErrorBased();
                },
                smppApplications: function () {
                    return [];
                },
                organizations: function () {
                    return {organizations: []};
                }
            }
        }).state('products.smsc.operations.retrypolicies.errorbased-global.list', {
            url: "",
            templateUrl: "products/smsc/operations/operations.retrypolicies.errorbased.html",
            controller: 'SmscRetryPoliciesErrorBasedErrorCodeOperationsCtrl'
        }).state('products.smsc.operations.retrypolicies.errorbased-global.new', {
            url: "/new",
            templateUrl: "products/smsc/operations/operations.retrypolicies.errorbased.details.html",
            controller: 'SmscRetryPoliciesNewErrorBasedErrorCodeOperationsCtrl'
        }).state('products.smsc.operations.retrypolicies.errorbased-global.update', {
            url: "/update/:contextName/{errorCode:[0-9]*}",
            templateUrl: "products/smsc/operations/operations.retrypolicies.errorbased.details.html",
            controller: 'SmscRetryPoliciesUpdateErrorBasedErrorCodeOperationsCtrl',
            resolve: {
                retryPolicyErrorBased: function ($stateParams, SmscConfService) {
                    var contextName = $stateParams.contextName;
                    var errorCode = $stateParams.errorCode;

                    return SmscConfService.getRetryPolicyErrorBasedByErrorCode(contextName, errorCode);
                }
            }
        });

        // Per Orig. Application
        $stateProvider.state('products.smsc.operations.retrypolicies.errorbased-per-application', {
            abstract: true,
            url: "/errorbased/per-application",
            template: "<div ui-view></div>",
            data: {
                "isGlobal": false,
                "listState": "products.smsc.operations.retrypolicies.errorbased-per-application.list",
                "newState": "products.smsc.operations.retrypolicies.errorbased-per-application.new",
                "updateState": "products.smsc.operations.retrypolicies.errorbased-per-application.update",
                "policiesState": "products.smsc.operations.retrypolicies.errorbased-per-application-policies.list",
                "subErrorsState": "products.smsc.operations.retrypolicies.suberrorbased-per-application.list",
                "pageHeaderKey": "Products.SMSC.Operations.RetryPolicies.ErrorBased.PageHeader",
                "subPageHeaderKey": "Products.SMSC.Operations.RetryPolicies.PerOrigApplication.PageHeader"
            },
            resolve: {
                smppApplications: function (SmscProvService) {
                    return SmscProvService.getAllSMPPApplications();
                },
                organizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizations(0, DEFAULT_REST_QUERY_LIMIT);
                }
            }
        }).state('products.smsc.operations.retrypolicies.errorbased-per-application.list', {
            url: "/{appId:[0-9]*}",
            templateUrl: "products/smsc/operations/operations.retrypolicies.errorbased.html",
            controller: 'SmscRetryPoliciesErrorBasedErrorCodeOperationsCtrl',
            resolve: {
                retryPoliciesErrorBased: function ($stateParams, SmscConfService) {
                    var appId = $stateParams.appId;

                    if (appId) {
                        return SmscConfService.getRetryPoliciesErrorBased(appId);
                    }

                    return [];
                }
            }
        }).state('products.smsc.operations.retrypolicies.errorbased-per-application.new', {
            url: "/new/{appId:[0-9]*}",
            templateUrl: "products/smsc/operations/operations.retrypolicies.errorbased.details.html",
            controller: 'SmscRetryPoliciesNewErrorBasedErrorCodeOperationsCtrl',
            resolve: {
                retryPoliciesErrorBased: function ($stateParams, SmscConfService) {
                    var appId = $stateParams.appId;

                    return SmscConfService.getRetryPoliciesErrorBased(appId);
                }
            }
        }).state('products.smsc.operations.retrypolicies.errorbased-per-application.update', {
            url: "/update/:contextName/{errorCode:[0-9]*}/{appId:[0-9]*}",
            templateUrl: "products/smsc/operations/operations.retrypolicies.errorbased.details.html",
            controller: 'SmscRetryPoliciesUpdateErrorBasedErrorCodeOperationsCtrl',
            resolve: {
                retryPoliciesErrorBased: function ($stateParams, SmscConfService) {
                    var appId = $stateParams.appId;

                    return SmscConfService.getRetryPoliciesErrorBased(appId);
                },
                retryPolicyErrorBased: function ($stateParams, SmscConfService) {
                    var contextName = $stateParams.contextName;
                    var errorCode = $stateParams.errorCode;
                    var appId = $stateParams.appId;

                    return SmscConfService.getRetryPolicyErrorBasedByErrorCode(contextName, errorCode, appId);
                }
            }
        });

    });

    SmscRetryPoliciesErrorBasedErrorCodeOperationsModule.controller('SmscRetryPoliciesErrorBasedErrorCodeOperationsCtrl', function ($scope, $log, $state, $stateParams, $translate, $filter, notification, $uibModal,
                                                                                                                                                  $timeout, SmscConfService, Restangular, NgTableParams, NgTableService,
                                                                                                                                                  retryPoliciesErrorBased, smppApplications, organizations) {
        $log.debug("SMSCRetryPoliciesErrorBasedErrorCodeOperationsCtrl");

        // Get state urls for using in generic pages.
        $scope.isGlobal = $state.current.data.isGlobal;
        $scope.listState = $state.current.data.listState;
        $scope.newState = $state.current.data.newState;
        $scope.updateState = $state.current.data.updateState;
        $scope.policiesState = $state.current.data.policiesState;
        $scope.subErrorsState = $state.current.data.subErrorsState;

        var retryPolicyErrorCodeList = Restangular.stripRestangular(retryPoliciesErrorBased);
        var smppApplicationList = Restangular.stripRestangular(smppApplications);
        var organizationList = Restangular.stripRestangular(organizations).organizations;

        // Initialize application list by taking organization and application names.
        $scope.smppApplicationList = _.filter(smppApplicationList, function (smppApplication) {
            smppApplication.organization = _.findWhere(organizationList, {id: smppApplication.organizationId});

            // Preparing the uib-dropdown error code as "<organization name> - <application name>"
            smppApplication.label = (smppApplication.organization ? smppApplication.organization.name + ' - ' : '') + smppApplication.name;

            $log.debug("Found SMPP Application: ", smppApplication, ", Organization: ", smppApplication.organization);

            return true;
        });
        $scope.smppApplicationList = $filter('orderBy')($scope.smppApplicationList, ['organization.name', 'name']);
        $scope.smppApplication = {};

        if ($stateParams.appId || $scope.isGlobal) {
            $scope.showTable = true;
        }

        // Check the if any application selected before and send over URL.
        var selectedSMPPApplication = _.findWhere($scope.smppApplicationList, {id: Number($stateParams.appId)});
        if (selectedSMPPApplication) {
            $scope.smppApplication.selected = selectedSMPPApplication;
        }

        // Triggers when application has changed on the form and takes selected application to use it for getting per application retry policies.
        $scope.changeSMPPApplication = function (selectedSMPPApplication) {
            $log.debug("Selected SMPP Application: ", selectedSMPPApplication);

            $state.transitionTo($state.$current, {appId: selectedSMPPApplication ? selectedSMPPApplication.id : undefined}, {
                reload: false,
                inherit: false,
                notify: true
            });
        };

        // Retry Policies Error Based list
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
                "contextName": 'asc', // initial sorting
                "errorCode": 'asc' // initial sorting
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
        // END - Retry Policies Error Based list

        $scope.removeErrorCode = function (retryPoliciesErrorBased) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing Retry Policy Error Code Error Based: ', retryPoliciesErrorBased);

                SmscConfService.deleteRetryPolicyErrorBasedByErrorCode(retryPoliciesErrorBased.contextName, retryPoliciesErrorBased.errorCode, $scope.smppApplication.selected ? $scope.smppApplication.selected.id : null).then(function (response) {
                    $log.debug('Removed Retry Policy Error Code Error Based: ', response);

                    var deletedListItem = _.findWhere($scope.retryPolicyErrorCodeList.list, {
                        contextName: retryPoliciesErrorBased.contextName,
                        errorCode: retryPoliciesErrorBased.errorCode
                    });
                    $scope.retryPolicyErrorCodeList.list = _.without($scope.retryPolicyErrorCodeList.list, deletedListItem);

                    $scope.retryPolicyErrorCodeList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete Retry Policy Error Code Error Based: ', response);
                });
            });
        };

    });

    SmscRetryPoliciesErrorBasedErrorCodeOperationsModule.controller('SmscRetryPoliciesNewErrorBasedErrorCodeOperationsCtrl', function ($scope, $state, $stateParams, $log, $translate, $filter,
                                                                                                                                                     notification, $uibModal, UtilService, SmscConfService, Restangular,
                                                                                                                                                     retryPoliciesErrorBased, RETRY_POLICIES_CONTEXT_NAMES, RETRY_POLICIES_ERROR_TYPES) {
        $log.debug("SMSCRetryPoliciesNewErrorBasedErrorCodeOperationsCtrl");

        // put all retry policy error code list to the scope
        $scope.retryPolicyErrorCodeList = Restangular.stripRestangular(retryPoliciesErrorBased);

        // Get state urls for using in generic pages.
        $scope.isGlobal = $state.current.data.isGlobal;
        $scope.listState = $state.current.data.listState;

        $scope.RETRY_POLICIES_CONTEXT_NAMES = RETRY_POLICIES_CONTEXT_NAMES;
        $scope.RETRY_POLICIES_ERROR_TYPES = RETRY_POLICIES_ERROR_TYPES;

        $scope.retryPolicyErrorCode = {
            contextName: RETRY_POLICIES_CONTEXT_NAMES[0],
            errorType: RETRY_POLICIES_ERROR_TYPES[0]
        };

        $scope.save = function (retryPolicyErrorCode) {
            var retryPolicyErrorCodeItem = {
                "errorCode": retryPolicyErrorCode.errorCode,
                "contextName": retryPolicyErrorCode.contextName,
                "policyName": retryPolicyErrorCode.policyName,
                "errorType": retryPolicyErrorCode.errorType
            };

            SmscConfService.addRetryPolicyErrorBased(retryPolicyErrorCodeItem, $stateParams.appId).then(function (response) {
                $log.debug('Added Retry Policy Error Code Error Based: ', response);

                var apiResponse = Restangular.stripRestangular(response);

                // If there is an error message appears a notification bar.
                if (apiResponse.errorCode === 500 && apiResponse.errorMsg) {
                    if (apiResponse.errorMsg.indexOf('already') > -1) {
                        notification({
                            type: 'danger',
                            text: $translate.instant('Products.SMSC.Operations.RetryPolicies.Messages.PolicyErrorCodeAlreadyDefinedError', {
                                context: retryPolicyErrorCode.contextName,
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
                $log.debug('Cannot add Retry Policy Error Code Error Based: ', response);
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

    SmscRetryPoliciesErrorBasedErrorCodeOperationsModule.controller('SmscRetryPoliciesUpdateErrorBasedErrorCodeOperationsCtrl', function ($scope, $state, $stateParams, $log, $translate, $filter, notification,
                                                                                                                                                        $uibModal, UtilService, SmscConfService, Restangular, retryPoliciesErrorBased,
                                                                                                                                                        retryPolicyErrorBased, RETRY_POLICIES_CONTEXT_NAMES, RETRY_POLICIES_ERROR_TYPES) {
        $log.debug("SMSCRetryPoliciesUpdateErrorBasedErrorCodeOperationsCtrl");

        // put all retry policy error code list to the scope
        $scope.retryPolicyErrorCodeList = Restangular.stripRestangular(retryPoliciesErrorBased);

        // Get state urls for using in generic pages.
        $scope.isGlobal = $state.current.data.isGlobal;
        $scope.listState = $state.current.data.listState;

        $scope.RETRY_POLICIES_CONTEXT_NAMES = RETRY_POLICIES_CONTEXT_NAMES;
        $scope.RETRY_POLICIES_ERROR_TYPES = RETRY_POLICIES_ERROR_TYPES;

        $scope.retryPolicyErrorCode = Restangular.stripRestangular(retryPolicyErrorBased)[0];
        $scope.retryPolicyErrorCode.id = _.uniqueId(); // Set to id field in order to use decision is this update or create in the detail form.

        $scope.retryPolicyErrorCodeOriginal = angular.copy($scope.retryPolicyErrorCode);
        $scope.isRetryPolicyNotChanged = function () {
            return angular.equals($scope.retryPolicyErrorCode, $scope.retryPolicyErrorCodeOriginal);
        };

        $scope.save = function (retryPolicyErrorCode) {
            var retryPolicyErrorCodeItem = {
                "errorCode": $scope.retryPolicyErrorCodeOriginal.errorCode,
                "contextName": $scope.retryPolicyErrorCodeOriginal.contextName,
                "policyName": $scope.retryPolicyErrorCodeOriginal.policyName,
                "errorType": retryPolicyErrorCode.errorType
            };

            SmscConfService.updateRetryPolicyErrorBased(retryPolicyErrorCodeItem, $stateParams.appId).then(function (response) {
                $log.debug('Updated Retry Policy Error Code Error Based: ', response);

                var apiResponse = Restangular.stripRestangular(response);

                // If there is an error message appears a notification bar.
                if (apiResponse.errorCode === 500 && apiResponse.errorMsg) {
                    if (apiResponse.errorMsg.indexOf('already') > -1) {
                        notification({
                            type: 'danger',
                            text: $translate.instant('Products.SMSC.Operations.RetryPolicies.Messages.PolicyErrorCodeAlreadyDefinedError', {
                                context: retryPolicyErrorCode.contextName,
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
                $log.debug('Cannot update Retry Policy Error Code Error Based: ', response);
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
