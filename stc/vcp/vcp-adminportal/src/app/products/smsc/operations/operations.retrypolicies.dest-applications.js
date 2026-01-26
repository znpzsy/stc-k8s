(function () {

    'use strict';

    angular.module('adminportal.products.smsc.operations.retrypolicies.dest-applications', []);

    var SmscRetryPoliciesDestinationApplicationOperationsModule = angular.module('adminportal.products.smsc.operations.retrypolicies.dest-applications');

    SmscRetryPoliciesDestinationApplicationOperationsModule.config(function ($stateProvider) {

        // Global
        $stateProvider.state('products.smsc.operations.retrypolicies.dest-applications-global', {
            abstract: true,
            url: "/dest-applications/smsc",
            template: "<div ui-view></div>",
            data: {
                "isGlobal": true,
                "listState": "products.smsc.operations.retrypolicies.dest-applications-global.list",
                "newState": "products.smsc.operations.retrypolicies.dest-applications-global.new",
                "updateState": "products.smsc.operations.retrypolicies.dest-applications-global.update",
                "pageHeaderKey": "Products.SMSC.Operations.RetryPolicies.DestApplications.PageHeader",
                "subPageHeaderKey": "Products.SMSC.Operations.RetryPolicies.Global.MenuLabel"
            },
            resolve: {
                retryPoliciesDestinationApplication: function (SmscConfService) {
                    return SmscConfService.getRetryPoliciesDestinationApplication();
                },
                smppApplications: function () {
                    return [];
                },
                organizations: function () {
                    return {organizations: []};
                }
            }
        }).state('products.smsc.operations.retrypolicies.dest-applications-global.list', {
            url: "",
            templateUrl: "products/smsc/operations/operations.retrypolicies.html",
            controller: 'SmscRetryPoliciesDestinationApplicationOperationsCtrl'
        }).state('products.smsc.operations.retrypolicies.dest-applications-global.new', {
            url: "/new",
            templateUrl: "products/smsc/operations/operations.retrypolicies.details.html",
            controller: 'SmscRetryPoliciesNewDestinationApplicationOperationsCtrl'
        }).state('products.smsc.operations.retrypolicies.dest-applications-global.update', {
            url: "/update/{preference:[0-9]*}",
            templateUrl: "products/smsc/operations/operations.retrypolicies.details.html",
            controller: 'SmscRetryPoliciesUpdateDestinationApplicationOperationsCtrl'
        });

        // Per Dest. Application
        $stateProvider.state('products.smsc.operations.retrypolicies.dest-applications-per-application', {
            abstract: true,
            url: "/dest-applications/per-application",
            template: "<div ui-view></div>",
            data: {
                "isGlobal": false,
                "listState": "products.smsc.operations.retrypolicies.dest-applications-per-application.list",
                "newState": "products.smsc.operations.retrypolicies.dest-applications-per-application.new",
                "updateState": "products.smsc.operations.retrypolicies.dest-applications-per-application.update",
                "pageHeaderKey": "Products.SMSC.Operations.RetryPolicies.DestApplications.PageHeader",
                "subPageHeaderKey": "Products.SMSC.Operations.RetryPolicies.PerDestApplication.MenuLabel"
            },
            resolve: {
                smppApplications: function (SmscProvService) {
                    return SmscProvService.getAllSMPPApplications();
                },
                organizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizations(0, DEFAULT_REST_QUERY_LIMIT);
                }
            }
        }).state('products.smsc.operations.retrypolicies.dest-applications-per-application.list', {
            url: "/{appId:[0-9]*}",
            templateUrl: "products/smsc/operations/operations.retrypolicies.html",
            controller: 'SmscRetryPoliciesDestinationApplicationOperationsCtrl',
            resolve: {
                retryPoliciesDestinationApplication: function ($stateParams, SmscConfService) {
                    var appId = $stateParams.appId;

                    if (appId) {
                        return SmscConfService.getRetryPoliciesDestinationApplication(appId);
                    }

                    return {retryPolicyItems: []};
                }
            }
        }).state('products.smsc.operations.retrypolicies.dest-applications-per-application.new', {
            url: "/new/{appId:[0-9]*}",
            templateUrl: "products/smsc/operations/operations.retrypolicies.details.html",
            controller: 'SmscRetryPoliciesNewDestinationApplicationOperationsCtrl',
            resolve: {
                retryPoliciesDestinationApplication: function (SmscConfService, $stateParams) {
                    return SmscConfService.getRetryPoliciesDestinationApplication($stateParams.appId);
                }
            }
        }).state('products.smsc.operations.retrypolicies.dest-applications-per-application.update', {
            url: "/update/{appId:[0-9]*}/{preference:[0-9]*}",
            templateUrl: "products/smsc/operations/operations.retrypolicies.details.html",
            controller: 'SmscRetryPoliciesUpdateDestinationApplicationOperationsCtrl',
            resolve: {
                retryPoliciesDestinationApplication: function (SmscConfService, $stateParams) {
                    return SmscConfService.getRetryPoliciesDestinationApplication($stateParams.appId);
                }
            }
        });

    });

    SmscRetryPoliciesDestinationApplicationOperationsModule.controller('SmscRetryPoliciesDestinationApplicationOperationsCtrl', function ($scope, $log, $state, $stateParams, $translate, $filter, notification, $uibModal,
                                                                                                                                                        $timeout, SmscConfService, Restangular, NgTableParams, NgTableService,
                                                                                                                                                        retryPoliciesDestinationApplication, smppApplications, organizations) {
        $log.debug("SMSCRetryPoliciesDestinationApplicationOperationsCtrl");

        // Get state urls for using in generic pages.
        $scope.isGlobal = $state.current.data.isGlobal;
        $scope.listState = $state.current.data.listState;
        $scope.newState = $state.current.data.newState;
        $scope.updateState = $state.current.data.updateState;

        var retryPolicyList = Restangular.stripRestangular(retryPoliciesDestinationApplication).retryPolicyItems;
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

        $scope.remove = function (retryPoliciesDestinationApplication) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing Retry Policies Destination Application: ', retryPoliciesDestinationApplication);

                SmscConfService.deleteRetryPolicyDestinationApplicationByPreference(retryPoliciesDestinationApplication.preference, $scope.smppApplication.selected ? $scope.smppApplication.selected.id : null).then(function (response) {
                    $log.debug('Removed Retry Policies Destination Application: ', response);

                    var deletedListItem = _.findWhere($scope.retryPolicyList.list, {
                        preference: retryPoliciesDestinationApplication.preference
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

    SmscRetryPoliciesDestinationApplicationOperationsModule.controller('SmscRetryPoliciesNewDestinationApplicationOperationsCtrl', function ($scope, $state, $stateParams, $log, $translate, $filter, notification,
                                                                                                                                                           $uibModal, UtilService, SmscConfService, Restangular, INTERVAL_UNITS) {
        $log.debug("SMSCRetryPoliciesNewDestinationApplicationOperationsCtrl");

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

            SmscConfService.addRetryPolicyDestinationApplication(retryPolicyItem, $stateParams.appId).then(function (response) {
                $log.debug('Added Retry Policies Destination Application: ', response);

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
                $log.debug('Cannot add Retry Policies Destination Application: ', response);
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

    SmscRetryPoliciesDestinationApplicationOperationsModule.controller('SmscRetryPoliciesUpdateDestinationApplicationOperationsCtrl', function ($scope, $state, $stateParams, $log, $translate, $filter, notification,
                                                                                                                                                              $uibModal, UtilService, SmscConfService, Restangular, INTERVAL_UNITS,
                                                                                                                                                              retryPoliciesDestinationApplication) {
        $log.debug("SMSCRetryPoliciesUpdateDestinationApplicationOperationsCtrl");

        // Get state urls for using in generic pages.
        $scope.isGlobal = $state.current.data.isGlobal;
        $scope.listState = $state.current.data.listState;

        $scope.INTERVAL_UNITS = INTERVAL_UNITS;

        var retryPoliciesDestinationApplicationList = Restangular.stripRestangular(retryPoliciesDestinationApplication).retryPolicyItems;
        if (retryPoliciesDestinationApplicationList.length > 0) {
            $scope.retryPolicy = _.findWhere(retryPoliciesDestinationApplicationList, {preference: Number($stateParams.preference)});
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

            SmscConfService.updateRetryPolicyDestinationApplication(retryPolicyItem, $stateParams.appId).then(function (response) {
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

                    $state.transitionTo($scope.listState, {appId: $stateParams.appId}, {
                        reload: true,
                        inherit: true,
                        notify: true
                    });
                }
            }, function (response) {
                $log.debug('Cannot update Retry Policies Destination Application: ', response);
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
