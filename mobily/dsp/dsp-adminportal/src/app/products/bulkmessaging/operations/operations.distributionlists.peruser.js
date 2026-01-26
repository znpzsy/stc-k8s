(function () {

    'use strict';

    angular.module('adminportal.products.bulkmessaging.operations.distributionlists.peruser', []);

    var BulkMessagingDistributionListsPerUserOperationsModule = angular.module('adminportal.products.bulkmessaging.operations.distributionlists.peruser');

    BulkMessagingDistributionListsPerUserOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('products.bulkmessaging.operations.distributionlists.peruser', {
            url: "/per-user?organizationId&userId&listName",
            templateUrl: "products/bulkmessaging/operations/operations.distributionlists.main.html",
            controller: 'BulkMessagingDistributionListsOrganizationsUserAccountsCtrl',
            data: {
                listType: 'USER',
                pageHeaderKey: 'Products.BulkMessaging.Operations.DistributionLists.Title',
                subPageHeaderKey: 'Products.BulkMessaging.Operations.PerUser.Title',
                listState: 'products.bulkmessaging.operations.distributionlists.peruser.list',
                createState: 'products.bulkmessaging.operations.distributionlists.peruser.create',
                updateState: 'products.bulkmessaging.operations.distributionlists.peruser.update',
                exportName: 'DistributionListsPerUserRecords',
                permissions: [
                    'BMS__OPERATIONS_DISTROLIST_PERUSERACCOUNT_READ'
                ]
            },
            resolve: {
                organizations: function ($rootScope, $state, $stateParams, CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    if (!$state.params.doNotResolveEntities) {
                        if ($rootScope.isBMSAdminUser) {
                            return CMPFService.getAllOperatorsAndPartners(false, true, [CMPFService.OPERATOR_PROFILE, CMPFService.BULK_ORGANIZATION_PROFILE]);
                        } else {
                            return {organizations: []};
                        }
                    } else {
                        return {organizations: []};
                    }
                }
            }
        }).state('products.bulkmessaging.operations.distributionlists.peruser.list', {
            url: "/list",
            templateUrl: "products/bulkmessaging/operations/operations.distributionlists.html",
            controller: 'BulkMessagingDistributionListsOperationsCtrl',
            resolve: {
                distributionLists: function () {
                    return [];
                }
            }
        }).state('products.bulkmessaging.operations.distributionlists.peruser.create', {
            url: "/new",
            templateUrl: "products/bulkmessaging/operations/operations.distributionlists.detail.html",
            controller: 'BulkMessagingDistributionListsOperationsNewCtrl',
            data: {
                subPageHeaderKey: 'Products.BulkMessaging.Operations.PerUser.Title'
            }
        }).state('products.bulkmessaging.operations.distributionlists.peruser.update', {
            url: "/update",
            templateUrl: "products/bulkmessaging/operations/operations.distributionlists.detail.html",
            controller: 'BulkMessagingDistributionListsOperationsUpdateCtrl',
            resolve: {
                distributionList: function ($stateParams, $q, UtilService, BulkMessagingOperationsService) {
                    var userId = $stateParams.userId;
                    var listName = $stateParams.listName;

                    var deferred = $q.defer();

                    if (userId) {
                        BulkMessagingOperationsService.getDistributionList(listName).then(function (response) {
                            deferred.resolve(response);
                        }, function (response) {
                            deferred.resolve([]);
                        });
                    } else {
                        deferred.resolve();
                    }

                    UtilService.addPromiseToTracker(deferred.promise);

                    return deferred.promise;
                }
            },
            data: {
                subPageHeaderKey: 'Products.BulkMessaging.Operations.PerUser.Title'
            }
        });

    });

})();
