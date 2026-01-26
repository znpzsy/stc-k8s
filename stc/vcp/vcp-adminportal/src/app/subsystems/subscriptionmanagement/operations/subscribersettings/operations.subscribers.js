(function () {

    'use strict';

    angular.module('adminportal.subsystems.subscriptionmanagement.operations.subscriberssettings', []);

    var SubscriptionManagementOperationsSubscribersModule = angular.module('adminportal.subsystems.subscriptionmanagement.operations.subscriberssettings');

    SubscriptionManagementOperationsSubscribersModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.subscriptionmanagement.operations.subscriberssettings', {
            abstract: true,
            url: "/subscriber-settings",
            template: '<div ui-view></div>'
        }).state('subsystems.subscriptionmanagement.operations.subscriberssettings.list', {
            url: "",
            templateUrl: "subsystems/subscriptionmanagement/operations/subscribersettings/operations.subscribers.html",
            controller: 'SubscriptionManagementOperationsSubscribersCtrl'
        });

    });

    SubscriptionManagementOperationsSubscribersModule.controller('SubscriptionManagementOperationsSubscribersCtrl', function ($scope, $controller, $state, $log, NgTableParams, $translate, notification, $filter, $uibModal,
                                                                                                                              Restangular, UtilService, DEFAULT_REST_QUERY_LIMIT, PROVISIONING_PAYMENT_TYPES, SSMSubscribersService) {
        $log.debug('SubscriptionManagementOperationsSubscribersCtrl');

        var showMessage = function (type, message) {
            notification({
                type: type,
                text: message
            });
        };

        // Offer Subscriptions
        (function () {
            $scope.offerSubscriptions = {
                list: [],
                tableParams: {}
            };
            $scope.offerSubscriptions.tableParams = new NgTableParams({
                page: 1,
                count: 5,
                sorting: {
                    "offer.id": 'asc'
                }
            }, {
                total: 0,
                $scope: $scope,
                getData: function ($defer, params) {
                    var orderedData = params.sorting() ? $filter('orderBy')($scope.offerSubscriptions.list, params.orderBy()) : $scope.ranges;
                    params.total(orderedData.length); // set total for recalc pagination
                    if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                        params.page(params.page() - 1);
                    }

                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            });
        })();

        // Service Subscriptions
        (function () {
            $scope.serviceSubscriptions = {
                list: [],
                tableParams: {}
            };
            $scope.serviceSubscriptions.tableParams = new NgTableParams({
                page: 1,
                count: 5,
                sorting: {
                    "service.id": 'asc'
                }
            }, {
                total: 0,
                $scope: $scope,
                getData: function ($defer, params) {
                    var orderedData = params.sorting() ? $filter('orderBy')($scope.serviceSubscriptions.list, params.orderBy()) : $scope.ranges;
                    params.total(orderedData.length); // set total for recalc pagination
                    if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                        params.page(params.page() - 1);
                    }

                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            });
        })();

        // Search method
        $scope.search = function (msisdn) {
            // Check the subscriber on the NgSSM to get it's information
            SSMSubscribersService.getSubscriberByMsisdn(msisdn).then(function (response) {
                $log.debug('Found ldap subscriber: ', response);

                if (response && response.errorCode && response.message) {
                    showMessage('warning', response.message);
                } else {
                    $scope.subscriber = Restangular.stripRestangular(response);

                    // Reset the search form.
                    $scope.msisdn = '';
                    $scope.form.$setPristine();
                }
            }, function (response) {
                $log.error('Cannot read subscriptions. Error: ', response);

                if (response.data && response.data.errorMsg) {
                    showMessage('warning', response.data.errorMsg);
                } else {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: response.data.errorCode,
                            errorText: response.data.message
                        })
                    });
                }
            })
        };
    });

})();
