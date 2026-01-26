(function () {

    'use strict';

    angular.module('adminportal.products.bulkmessaging.operations.screeninglists.global', []);

    var BulkMessagingScreeningListsGlobalOperationsModule = angular.module('adminportal.products.bulkmessaging.operations.screeninglists.global');

    BulkMessagingScreeningListsGlobalOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('products.bulkmessaging.operations.screeninglists.global', {
            url: "/global?listName",
            templateUrl: "products/bulkmessaging/operations/operations.screeninglists.main.html",
            data: {
                listType: 'GLOBAL',
                pageHeaderKey: 'Products.BulkMessaging.Operations.ScreeningLists.Title',
                subPageHeaderKey: 'Products.BulkMessaging.Operations.Global.Title',
                listState: 'products.bulkmessaging.operations.screeninglists.global.list',
                createState: 'products.bulkmessaging.operations.screeninglists.global.create',
                updateState: 'products.bulkmessaging.operations.screeninglists.global.update',
                exportName: 'ScreeningListsGlobalRecords',
                permissions: [
                    'BMS__OPERATIONS_BLACKLIST_GLOBAL_READ'
                ]
            },
            resolve: {
                organizations: function () {
                    return [];
                }
            }
        }).state('products.bulkmessaging.operations.screeninglists.global.list', {
            url: "/list",
            templateUrl: "products/bulkmessaging/operations/operations.screeninglists.html",
            controller: 'BulkMessagingScreeningListsOperationsCtrl',
            resolve: {
                screeningLists: function ($stateParams, $q, UtilService, $translate, notification, BulkMessagingOperationsService) {
                    var deferred = $q.defer();

                    var innerDeferred = $q.defer();

                    var lists = [];
                    BulkMessagingOperationsService.getGlobalSMSBlackLists().then(function (responseSMS) {
                        lists = lists.concat(responseSMS.lists);

                        BulkMessagingOperationsService.getGlobalMMSBlackLists().then(function (responseMMS) {
                            lists = lists.concat(responseMMS.lists);

                            BulkMessagingOperationsService.getGlobalIVRBlackLists().then(function (responseIVR) {
                                lists = lists.concat(responseIVR.lists);

                                innerDeferred.resolve(lists);
                            }, function (response) {
                                innerDeferred.resolve(lists);
                            });
                        }, function (response) {
                            innerDeferred.resolve(lists);
                        });
                    }, function (response) {
                        innerDeferred.resolve(lists);
                    });

                    innerDeferred.promise.then(function (response) {
                        deferred.resolve(response);
                    }, function (response) {
                        notification({
                            type: 'warning',
                            text: $translate.instant('Products.BulkMessaging.Operations.Messages.GlobalBlackListNotFound')
                        });

                        deferred.resolve(null);
                    });

                    UtilService.addPromiseToTracker(deferred.promise);

                    return deferred.promise;
                }
            }
        }).state('products.bulkmessaging.operations.screeninglists.global.create', {
            url: "/new",
            templateUrl: "products/bulkmessaging/operations/operations.screeninglists.detail.html",
            controller: 'BulkMessagingScreeningListsOperationsNewCtrl'
        }).state('products.bulkmessaging.operations.screeninglists.global.update', {
            url: "/update",
            templateUrl: "products/bulkmessaging/operations/operations.screeninglists.detail.html",
            controller: 'BulkMessagingScreeningListsOperationsUpdateCtrl',
            resolve: {
                screeningList: function ($stateParams, $q, UtilService, BulkMessagingOperationsService) {
                    var listName = $stateParams.listName;

                    var deferred = $q.defer();

                    BulkMessagingOperationsService.getDistributionList(listName).then(function (response) {
                        deferred.resolve(response);
                    }, function (response) {
                        deferred.resolve([]);
                    });

                    UtilService.addPromiseToTracker(deferred.promise);

                    return deferred.promise;
                }
            }
        });

    });

})();
