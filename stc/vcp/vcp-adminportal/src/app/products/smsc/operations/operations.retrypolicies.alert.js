(function () {

    'use strict';

    angular.module('adminportal.products.smsc.operations.retrypolicies.alert', []);

    var SmscRetryPoliciesAlertOperationsModule = angular.module('adminportal.products.smsc.operations.retrypolicies.alert');

    SmscRetryPoliciesAlertOperationsModule.config(function ($stateProvider) {

        // Global
        $stateProvider.state('products.smsc.operations.retrypolicies.alert-global', {
            abstract: true,
            url: "/alert/smsc",
            template: "<div ui-view></div>",
            data: {
                "isGlobal": true,
                "listState": "products.smsc.operations.retrypolicies.alert-global.list",
                "newState": "products.smsc.operations.retrypolicies.alert-global.new",
                "updateState": "products.smsc.operations.retrypolicies.alert-global.update",
                "pageHeaderKey": "Products.SMSC.Operations.RetryPolicies.Alert.PageHeader",
                "subPageHeaderKey": "Products.SMSC.Operations.RetryPolicies.Global.MenuLabel"
            },
            resolve: {
                retryPoliciesAlert: function (SmscConfService) {
                    return SmscConfService.getRetryPoliciesAlert();
                },
                smppApplications: function () {
                    return [];
                },
                organizations: function () {
                    return {organizations: []};
                }
            }
        }).state('products.smsc.operations.retrypolicies.alert-global.list', {
            url: "",
            templateUrl: "products/smsc/operations/operations.retrypolicies.html",
            controller: 'SmscRetryPoliciesAlertOperationsCtrl'
        }).state('products.smsc.operations.retrypolicies.alert-global.new', {
            url: "/new",
            templateUrl: "products/smsc/operations/operations.retrypolicies.details.html",
            controller: 'SmscRetryPoliciesNewAlertOperationsCtrl'
        }).state('products.smsc.operations.retrypolicies.alert-global.update', {
            url: "/update/{preference:[0-9]*}",
            templateUrl: "products/smsc/operations/operations.retrypolicies.details.html",
            controller: 'SmscRetryPoliciesUpdateAlertOperationsCtrl'
        });

        // Per Orig. Application
        $stateProvider.state('products.smsc.operations.retrypolicies.alert-per-application', {
            abstract: true,
            url: "/alert/per-application",
            template: "<div ui-view></div>",
            data: {
                "isGlobal": false,
                "listState": "products.smsc.operations.retrypolicies.alert-per-application.list",
                "newState": "products.smsc.operations.retrypolicies.alert-per-application.new",
                "updateState": "products.smsc.operations.retrypolicies.alert-per-application.update",
                "pageHeaderKey": "Products.SMSC.Operations.RetryPolicies.Alert.PageHeader",
                "subPageHeaderKey": "Products.SMSC.Operations.RetryPolicies.PerOrigApplication.MenuLabel"
            },
            resolve: {
                smppApplications: function (SmscProvService) {
                    return SmscProvService.getAllSMPPApplications();
                },
                organizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizations(0, DEFAULT_REST_QUERY_LIMIT);
                }
            }
        }).state('products.smsc.operations.retrypolicies.alert-per-application.list', {
            url: "/{appId:[0-9]*}",
            templateUrl: "products/smsc/operations/operations.retrypolicies.html",
            controller: 'SmscRetryPoliciesAlertOperationsCtrl',
            resolve: {
                retryPoliciesAlert: function ($stateParams, SmscConfService) {
                    var appId = $stateParams.appId;

                    if (appId) {
                        return SmscConfService.getRetryPoliciesAlert(appId);
                    }

                    return {retryPolicyItems: []};
                }
            }
        }).state('products.smsc.operations.retrypolicies.alert-per-application.new', {
            url: "/new/{appId:[0-9]*}",
            templateUrl: "products/smsc/operations/operations.retrypolicies.details.html",
            controller: 'SmscRetryPoliciesNewAlertOperationsCtrl',
            resolve: {
                retryPoliciesAlert: function (SmscConfService, $stateParams) {
                    return SmscConfService.getRetryPoliciesAlert($stateParams.appId);
                }
            }
        }).state('products.smsc.operations.retrypolicies.alert-per-application.update', {
            url: "/update/{appId:[0-9]*}/{preference:[0-9]*}",
            templateUrl: "products/smsc/operations/operations.retrypolicies.details.html",
            controller: 'SmscRetryPoliciesUpdateAlertOperationsCtrl',
            resolve: {
                retryPoliciesAlert: function (SmscConfService, $stateParams) {
                    return SmscConfService.getRetryPoliciesAlert($stateParams.appId);
                }
            }
        });

    });

    SmscRetryPoliciesAlertOperationsModule.controller('SmscRetryPoliciesAlertOperationsCtrl', function ($scope, $log, $state, $stateParams, $translate, $filter, notification, $uibModal,
                                                                                                                      $timeout, SmscConfService, Restangular, NgTableParams, NgTableService,
                                                                                                                      retryPoliciesAlert, smppApplications, organizations) {
        $log.debug("SMSCRetryPoliciesAlertOperationsCtrl");

        // Get state urls for using in generic pages.
        $scope.isGlobal = $state.current.data.isGlobal;
        $scope.listState = $state.current.data.listState;
        $scope.newState = $state.current.data.newState;
        $scope.updateState = $state.current.data.updateState;

        var retryPolicyList = Restangular.stripRestangular(retryPoliciesAlert).retryPolicyItems;
        var smppApplicationList = Restangular.stripRestangular(smppApplications);
        var organizationList = Restangular.stripRestangular(organizations).organizations;

        // Initialize application list by taking organization and application names.
        $scope.smppApplicationList = _.filter(smppApplicationList, function (smppApplication) {
            smppApplication.organization = _.findWhere(organizationList, {id: smppApplication.organizationId});

            // Preparing the uib-dropdown content ad "<organization name> - <application name>"
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

        // Retry Policies Alert list
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
        // END - Retry Policies Alert list

        $scope.remove = function (retryPoliciesAlert) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing Retry Policies Alert: ', retryPoliciesAlert);

                SmscConfService.deleteRetryPolicyAlertByPreference(retryPoliciesAlert.preference, $scope.smppApplication.selected ? $scope.smppApplication.selected.id : null).then(function (response) {
                    $log.debug('Removed Retry Policies Alert: ', response);

                    var deletedListItem = _.findWhere($scope.retryPolicyList.list, {
                        preference: retryPoliciesAlert.preference
                    });
                    $scope.retryPolicyList.list = _.without($scope.retryPolicyList.list, deletedListItem);

                    $scope.retryPolicyList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete Retry Policies Alert: ', response);
                });
            });
        };

    });

    SmscRetryPoliciesAlertOperationsModule.controller('SmscRetryPoliciesNewAlertOperationsCtrl', function ($scope, $state, $stateParams, $log, $translate, $filter, notification,
                                                                                                                         $uibModal, UtilService, SmscConfService, Restangular, INTERVAL_UNITS) {
        $log.debug("SMSCRetryPoliciesNewAlertOperationsCtrl");

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

            SmscConfService.addRetryPolicyAlert(retryPolicyItem, $stateParams.appId).then(function (response) {
                $log.debug('Added Retry Policies Alert: ', response);

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

                    $state.transitionTo($scope.listState, {appId: $stateParams.appId}, {
                        reload: true,
                        inherit: true,
                        notify: true
                    });
                }
            }, function (response) {
                $log.debug('Cannot add Retry Policies Alert: ', response);
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

    SmscRetryPoliciesAlertOperationsModule.controller('SmscRetryPoliciesUpdateAlertOperationsCtrl', function ($scope, $state, $stateParams, $log, $translate, $filter, notification,
                                                                                                                            $uibModal, UtilService, SmscConfService, Restangular, INTERVAL_UNITS,
                                                                                                                            retryPoliciesAlert) {
        $log.debug("SMSCRetryPoliciesUpdateAlertOperationsCtrl");

        // Get state urls for using in generic pages.
        $scope.isGlobal = $state.current.data.isGlobal;
        $scope.listState = $state.current.data.listState;

        $scope.INTERVAL_UNITS = INTERVAL_UNITS;

        var retryPoliciesAlertList = Restangular.stripRestangular(retryPoliciesAlert).retryPolicyItems;
        if (retryPoliciesAlertList.length > 0) {
            $scope.retryPolicy = _.findWhere(retryPoliciesAlertList, {preference: Number($stateParams.preference)});
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

            SmscConfService.updateRetryPolicyAlert(retryPolicyItem, $stateParams.appId).then(function (response) {
                $log.debug('Updated Retry Policies Alert: ', response);

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

                    $state.transitionTo($scope.listState, {appId: $stateParams.appId}, {
                        reload: true,
                        inherit: true,
                        notify: true
                    });
                }
            }, function (response) {
                $log.debug('Cannot update Retry Policies Alert: ', response);
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
