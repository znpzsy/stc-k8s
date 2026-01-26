(function () {

    'use strict';

    angular.module('adminportal.subsystems.subscriptionmanagement.operations.subscribers', [
        'adminportal.subsystems.subscriptionmanagement.operations.subscribers.update'
    ]);

    var SubscriptionManagementOperationsSubscribersModule = angular.module('adminportal.subsystems.subscriptionmanagement.operations.subscribers');

    SubscriptionManagementOperationsSubscribersModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.subscriptionmanagement.operations.subscribers', {
            abstract: true,
            url: "/subscribers",
            template: '<div ui-view></div>',
            data: {
                permissions: [
                    'SSM__OPERATIONS_SUBSCRIBER_READ'
                ]
            }
        }).state('subsystems.subscriptionmanagement.operations.subscribers.list', {
            url: "",
            templateUrl: "subsystems/subscriptionmanagement/operations/subscribers/operations.subscribers.html",
            controller: 'SubscriptionManagementOperationsSubscribersCtrl'
        });

    });

    SubscriptionManagementOperationsSubscribersModule.controller('SubscriptionManagementOperationsSubscribersCtrl', function ($scope, $log, $q, $controller, $timeout, $translate, notification, $uibModal, NgTableParams, UtilService,
                                                                                                                              Restangular, SSMSubscribersService, CMPFService) {
        $log.debug('SubscriptionManagementOperationsSubscribersCtrl');

        // // Calling screening management controllers for using black listing functionality.
        // $controller('ScreeningManagementOperationsScreeningListsGlobalMsisdnCtrl', {$scope: $scope});

        $scope.subscriberList = {
            list: [],
            tableParams: {}
        };

        // Subscriber list of current scope definitions
        $scope.subscriberList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "msisdn": 'desc'
            }
        }, {
            total: $scope.subscriberList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var msisdnFilterText = params.settings().$scope.msisdnFilterText;
                var sanFilterText = params.settings().$scope.sanFilterText;

                var deferred = $q.defer();

                if (sanFilterText) {
                    SSMSubscribersService.getSubscriberBySAN(sanFilterText).then(function (response) {
                        $log.debug('Subscriber: ', response);

                        var subscribersResponse = Restangular.stripRestangular(response);
                        if (subscribersResponse) {
                            deferred.resolve({total: 1, list: [subscribersResponse]});
                        } else {
                            deferred.resolve({total: 0, list: []});
                        }
                    }, function (response) {
                        $log.debug('Cannot read subscriber by san. Error: ', response);

                        deferred.resolve({total: 0, list: []});
                    });
                } else {
                    SSMSubscribersService.getSubscribers(params.page() - 1, params.count(), msisdnFilterText).then(function (response) {
                        $log.debug('Subscribers: ', response);

                        var subscribersResponse = Restangular.stripRestangular(response);
                        if (subscribersResponse) {
                            deferred.resolve({
                                total: subscribersResponse.totalElements,
                                list: subscribersResponse.content
                            });
                        } else {
                            deferred.resolve({total: 0, list: []});
                        }
                    }, function (response) {
                        $log.debug('Cannot read subscribers. Error: ', response);

                        deferred.resolve({total: 0, list: []});
                    });
                }

                deferred.promise.then(function (response) {
                    $scope.subscriberList.list = response.list;

                    params.total(response.total);
                    $defer.resolve(response.list);
                });
            }
        });
        // END - Subscriber list of current scope definitions

        $scope.filterTableByMsisdn = _.throttle(function (msisdnFilterText) {
            $scope.subscriberList.tableParams.settings().$scope.msisdnFilterText = msisdnFilterText;
            $scope.subscriberList.tableParams.page(1);
            $scope.subscriberList.tableParams.reload();
        }, 2000);
        $scope.filterTableByMsisdnChange = function (msisdnFilterText) {
            if (!msisdnFilterText) {
                $scope.filterTableByMsisdn(null);
            }
        };


        // TODO: Removing a subscriber is to be discussed, it is not part of the current scope for now
        $scope.remove = function (subscriber) {
            // subscriber.rowSelected = true;
            //
            // var modalInstance = $uibModal.open({
            //     templateUrl: 'partials/modal/modal.confirmation.html',
            //     controller: 'ConfirmationModalInstanceCtrl',
            //     size: 'sm'
            // });
            //
            // modalInstance.result.then(function () {
            //     return SSMSubscribersService.deleteSubscriber(subscriber).then(function () {
            //         $log.debug('Deleted subscriber: ', subscriber);
            //
            //         notification({
            //             type: 'success',
            //             text: $translate.instant('Subsystems.SubscriptionManagement.Operations.Subscribers.Messages.SubscriberDeletingSucceded')
            //         });
            //
            //         subscriber.rowSelected = false;
            //
            //         // Reduce the total count if the last one record is deleted on the last page.
            //         var tableParams = $scope.subscriberList.tableParams;
            //         tableParams.total(tableParams.total() - 1);
            //         if ((tableParams.total() > 0) && (tableParams.total() === (tableParams.count() * (tableParams.page() - 1)))) {
            //             tableParams.page(tableParams.page() - 1);
            //         }
            //
            //         $scope.subscriberList.tableParams.reload();
            //     }, function (response) {
            //         $log.debug('Cannot remove subscriber. Error: ', response);
            //
            //         if (!_.isUndefined(response.data) && !_.isUndefined(response.data.message)) {
            //             notification({
            //                 type: 'warning',
            //                 text: response.data.message
            //             });
            //         } else {
            //             notification({
            //                 type: 'danger',
            //                 text: $translate.instant('Subsystems.SubscriptionManagement.Operations.Subscribers.Messages.SubscriberDeletingError')
            //             });
            //         }
            //
            //         subscriber.rowSelected = false;
            //     });
            // }, function () {
            //     subscriber.rowSelected = false;
            // });
        };

        // // DCB details modal window.
        // $scope.showSubscriberDCBStatistics = function (subscriber) {
        //     subscriber.rowSelected = true;

        //     var modalInstance = $uibModal.open({
        //         animation: false,
        //         templateUrl: 'subsystems/subscriptionmanagement/operations/subscribers/operations.subscribers.dcbstatistics.modal.html',
        //         controller: function ($scope, $uibModalInstance, dcbSettingsOrganization, services, dcbStatistics) {
        //             $scope.dcbSettingsOrganization = dcbSettingsOrganization.organizations[0] || {};

        //             // DCBProfile
        //             var dcbProfiles = CMPFService.getProfileAttributes($scope.dcbSettingsOrganization.profiles, CMPFService.SERVICE_DCB_PROFILE);
        //             if (dcbProfiles.length > 0) {
        //                 $scope.dcbSettingsOrganization.dcbProfile = angular.copy(dcbProfiles[0]);
        //             } else {
        //                 $scope.dcbSettingsOrganization.dcbProfile = {
        //                     SenderID: '',
        //                     Currency: 'SAR',
        //                     IsCapped: false,
        //                     LastUpdateTime: null
        //                 };
        //             }

        //             $scope.msisdn = subscriber.msisdn;

        //             var serviceMap = {};
        //             _.each(services.services, function (service) {
        //                 serviceMap[service.id] = service.name + " (" + service.id + ")";
        //             });

        //             $scope.dcbStatistics = dcbStatistics;

        //             $scope.dcbStatistics.dailySpent = (parseFloat($scope.dcbStatistics.dailyCharge) - parseFloat($scope.dcbStatistics.dailyRefund)).toFixed(2);
        //             $scope.dcbStatistics.monthlySpent = (parseFloat($scope.dcbStatistics.monthlyCharge) - parseFloat($scope.dcbStatistics.monthlyRefund)).toFixed(2);

        //             $scope.dcbStatistics.serviceUsageList = [];
        //             _.each($scope.dcbStatistics.serviceUsage, function (serviceUsage, serviceId) {
        //                 var serviceUsageItem = _.extend({
        //                     serviceId: serviceId,
        //                     dailySpent: parseFloat(serviceUsage.dailyCharge) - parseFloat(serviceUsage.dailyRefund),
        //                     monthlySpent: parseFloat(serviceUsage.monthlyCharge) - parseFloat(serviceUsage.monthlyRefund)
        //                 }, serviceUsage);

        //                 $scope.dcbStatistics.serviceUsageList.push(serviceUsageItem);
        //             });

        //             $scope.dcbStatistics.limitList = [];
        //             _.each($scope.dcbStatistics.limit, function (limit, serviceId) {
        //                 if (serviceId !== 'null') {
        //                     var limitItem = _.extend({serviceId: serviceId}, limit);
        //                     $scope.dcbStatistics.limitList.push(limitItem);
        //                 }
        //             });

        //             $scope.close = function () {
        //                 $uibModalInstance.dismiss('cancel');
        //             };
        //         },
        //         resolve: {
        //             services: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
        //                 return CMPFService.getAllServices();
        //             },
        //             dcbSettingsOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
        //                 return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_DCB_SETTINGS_ORGANIZATION_NAME, true);
        //             },
        //             dcbStatistics: function ($rootScope, $q, UtilService, SSMSubscribersService, DcbService) {
        //                 var deferred = $q.defer();

        //                 SSMSubscribersService.getSubscriberByMsisdn(subscriber.msisdn).then(function (subscriberResponse) {
        //                     DcbService.getSubscriberStatistics(subscriberResponse.msisdn, subscriberResponse.subscriberAccountNumber).then(function (response) {
        //                         deferred.resolve(response);
        //                     }, function (response) {
        //                         notification({
        //                             type: 'warning',
        //                             text: $translate.instant('Subsystems.SubscriptionManagement.Operations.Subscribers.DcbStatistics.Messages.NotFound')
        //                         });

        //                         deferred.reject(response);
        //                     });
        //                 }, function (subscriberErrorResponse) {
        //                     deferred.reject(subscriberErrorResponse)
        //                 });

        //                 return deferred.promise;
        //             }
        //         }
        //     });

        //     modalInstance.result.then(function () {
        //         subscriber.rowSelected = false;
        //     }, function () {
        //         subscriber.rowSelected = false;
        //     });
        // };

        $scope.showOfferSubscriptions = function (subscriber) {
            subscriber.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/subscriptionmanagement/operations/subscribers/operations.subscribers.modal.subscriptions.html',
                controller: 'SubscriptionManagementOperationsSubscribersOfferSubscriptionsModalCtrl',
                size: 'lg',
                resolve: {
                    subscriberParameter: function () {
                        return subscriber;
                    },
                    offerSubscriptions: function (SSMSubscribersService) {
                        return SSMSubscribersService.getOfferSubscriptionsForSubscriber(subscriber.msisdn);
                    }
                }
            });

            modalInstance.result.then(function () {
                subscriber.rowSelected = false;
            }, function () {
                subscriber.rowSelected = false;
            });
        };

        $scope.showContentSubscriptions = function (subscriber) {
            subscriber.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/subscriptionmanagement/operations/subscribers/operations.subscribers.modal.contentsubscriptions.html',
                controller: 'SubscriptionManagementOperationsSubscribersContentSubscriptionsModalCtrl',
                size: 'lg',
                resolve: {
                    subscriberParameter: function () {
                        return subscriber;
                    },
                    contentSubscriptions: function (SSMSubscribersService) {
                        return SSMSubscribersService.getContentSubscriptionsForSubscriber(subscriber.msisdn);
                    }
                }
            });

            modalInstance.result.then(function () {
                subscriber.rowSelected = false;
            }, function () {
                subscriber.rowSelected = false;
            });
        };
    });

    SubscriptionManagementOperationsSubscribersModule.controller('SubscriptionManagementOperationsSubscribersOfferSubscriptionsModalCtrl', function ($scope, $uibModalInstance, $log, $timeout, $filter, NgTableParams, NgTableService, Restangular, SSMSubscribersService,
                                                                                                                                                     subscriberParameter, offerSubscriptions) {
        $log.debug('SubscriptionManagementOperationsSubscribersOfferSubscriptionsModalCtrl');

        $scope.subscriber = subscriberParameter;

        var subscriptions = Restangular.stripRestangular(offerSubscriptions);
        $scope.offerSubscriptions = subscriptions.offerSubscriptions ? subscriptions.offerSubscriptions : [];
        $log.debug("offerSubscriptions: ", $scope.offerSubscriptions);

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'offerId',
                    headerKey: 'Subsystems.SubscriptionManagement.Operations.Subscribers.TableColumns.OfferId'
                },
                {
                    fieldName: 'offerName',
                    headerKey: 'Subsystems.SubscriptionManagement.Operations.Subscribers.TableColumns.OfferName'
                },
                {
                    fieldName: 'state.currentState',
                    headerKey: 'Subsystems.SubscriptionManagement.Operations.Subscribers.TableColumns.SubscriptionState'
                },
                  {
                    fieldName: 'subscriptionRequestDate',
                    headerKey: 'Subsystems.SubscriptionManagement.Operations.Subscribers.TableColumns.SubscriptionRequestDate',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss']}
                }
            ]
        };

        $scope.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "id": 'asc'
            }
        }, {
            $scope: $scope,
            total: 0,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.offerSubscriptions);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.offerSubscriptions;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.tableParams.settings().$scope.filterText = filterText;
            $scope.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.tableParams.page(1);
            $scope.tableParams.reload();
        }, 500);

        $scope.close = function () {
            $uibModalInstance.close();
        };

        $uibModalInstance.result.then(function () {
            $scope.isDataFetchingInProgress = false;
        }, function () {
            $scope.isDataFetchingInProgress = false;
        });
    });

    SubscriptionManagementOperationsSubscribersModule.controller('SubscriptionManagementOperationsSubscribersContentSubscriptionsModalCtrl', function ($scope, $uibModalInstance, $log, $timeout, $filter, NgTableParams, NgTableService, Restangular, SSMSubscribersService,
                                                                                                                                                       subscriberParameter, contentSubscriptions) {
        $log.debug('SubscriptionManagementOperationsSubscribersContentSubscriptionsModalCtrl');

        $scope.subscriber = subscriberParameter;

        var subscriptions = Restangular.stripRestangular(contentSubscriptions);
        $scope.contentSubscriptions = subscriptions.contentSubscriptions ? subscriptions.contentSubscriptions : [];

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'subscriptionCode',
                    headerKey: 'Subsystems.SubscriptionManagement.Operations.Subscribers.TableColumns.SubscriptionCode'
                },
                {
                    fieldName: 'contentId',
                    headerKey: 'Subsystems.SubscriptionManagement.Operations.Subscribers.TableColumns.ContentId'
                },
                {
                    fieldName: 'contentName',
                    headerKey: 'Subsystems.SubscriptionManagement.Operations.Subscribers.TableColumns.ContentName'
                },
                {
                    fieldName: 'contentType',
                    headerKey: 'Subsystems.SubscriptionManagement.Operations.Subscribers.TableColumns.SubscriptionType'
                },
                {
                    fieldName: 'state.currentState',
                    headerKey: 'Subsystems.SubscriptionManagement.Operations.Subscribers.TableColumns.SubscriptionState'
                },
                {
                    fieldName: 'subscriptionRequestDate',
                    headerKey: 'Subsystems.SubscriptionManagement.Operations.Subscribers.TableColumns.SubscriptionRequestDate',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss']}
                }
            ]
        };

        $scope.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "id": 'asc'
            }
        }, {
            $scope: $scope,
            total: 0,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.contentSubscriptions);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.contentSubscriptions;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.tableParams.settings().$scope.filterText = filterText;
            $scope.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.tableParams.page(1);
            $scope.tableParams.reload();
        }, 500);

        $scope.close = function () {
            $uibModalInstance.close();
        };

        $uibModalInstance.result.then(function () {
            $scope.isDataFetchingInProgress = false;
        }, function () {
            $scope.isDataFetchingInProgress = false;
        });
    });

})();
