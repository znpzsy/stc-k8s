(function () {

    'use strict';

    angular.module('adminportal.products.bulkmessaging.operations.distributionlists.global', []);

    var BulkMessagingDistributionListsGlobalOperationsModule = angular.module('adminportal.products.bulkmessaging.operations.distributionlists.global');

    BulkMessagingDistributionListsGlobalOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('products.bulkmessaging.operations.distributionlists.global', {
            url: "/global?listName",
            templateUrl: "products/bulkmessaging/operations/operations.distributionlists.main.html",
            data: {
                listType: 'GLOBAL',
                pageHeaderKey: 'Products.BulkMessaging.Operations.DistributionLists.Title',
                subPageHeaderKey: 'Products.BulkMessaging.Operations.Global.Title',
                listState: 'products.bulkmessaging.operations.distributionlists.global.list',
                createState: 'products.bulkmessaging.operations.distributionlists.global.create',
                updateState: 'products.bulkmessaging.operations.distributionlists.global.update',
                exportName: 'DistributionListsGlobalRecords',
                permissions: [
                    'BMS__OPERATIONS_DISTROLIST_GLOBAL_READ'
                ]
            },
            resolve: {
                organizations: function () {
                    return [];
                }
            }
        }).state('products.bulkmessaging.operations.distributionlists.global.list', {
            url: "/list",
            templateUrl: "products/bulkmessaging/operations/operations.distributionlists.html",
            controller: 'BulkMessagingDistributionListsOperationsCtrl',
            resolve: {
                distributionLists: function ($q, UtilService, $translate, notification, BulkMessagingOperationsService) {
                    var deferred = $q.defer();

                    BulkMessagingOperationsService.getGlobalWhiteLists().then(function (response) {
                        deferred.resolve(response.lists);
                    }, function (response) {
                        notification({
                            type: 'warning',
                            text: $translate.instant('Products.BulkMessaging.Operations.Messages.GlobalWhiteListNotFound')
                        });

                        deferred.resolve(null);
                    });

                    UtilService.addPromiseToTracker(deferred.promise);

                    return deferred.promise;
                }
            }
        }).state('products.bulkmessaging.operations.distributionlists.global.create', {
            url: "/new",
            templateUrl: "products/bulkmessaging/operations/operations.distributionlists.detail.html",
            controller: 'BulkMessagingDistributionListsOperationsNewCtrl'
        }).state('products.bulkmessaging.operations.distributionlists.global.update', {
            url: "/update",
            templateUrl: "products/bulkmessaging/operations/operations.distributionlists.detail.html",
            controller: 'BulkMessagingDistributionListsOperationsUpdateCtrl',
            resolve: {
                distributionList: function ($stateParams, $q, UtilService, BulkMessagingOperationsService) {
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
