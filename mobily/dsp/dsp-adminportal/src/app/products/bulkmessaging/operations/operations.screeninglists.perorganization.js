(function () {

    'use strict';

    angular.module('adminportal.products.bulkmessaging.operations.screeninglists.perorganization', []);

    var BulkMessagingScreeningListsPerOrganizationOperationsModule = angular.module('adminportal.products.bulkmessaging.operations.screeninglists.perorganization');

    BulkMessagingScreeningListsPerOrganizationOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('products.bulkmessaging.operations.screeninglists.perorganization', {
            url: "/per-organization?organizationId&listName",
            templateUrl: "products/bulkmessaging/operations/operations.screeninglists.main.html",
            controller: 'BulkMessagingScreeningListsOrganizationsCtrl',
            data: {
                listType: 'ORGANIZATION',
                pageHeaderKey: 'Products.BulkMessaging.Operations.ScreeningLists.Title',
                subPageHeaderKey: 'Products.BulkMessaging.Operations.PerOrganization.Title',
                listState: 'products.bulkmessaging.operations.screeninglists.perorganization.list',
                createState: 'products.bulkmessaging.operations.screeninglists.perorganization.create',
                updateState: 'products.bulkmessaging.operations.screeninglists.perorganization.update',
                exportName: 'ScreeningListsPerOrganizationRecords',
                permissions: [
                    'BMS__OPERATIONS_BLACKLIST_PERORGANIZATION_READ'
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
        }).state('products.bulkmessaging.operations.screeninglists.perorganization.list', {
            url: "/list",
            templateUrl: "products/bulkmessaging/operations/operations.screeninglists.html",
            controller: 'BulkMessagingScreeningListsOperationsCtrl',
            resolve: {
                screeningLists: function () {
                    return [];
                }
            }
        }).state('products.bulkmessaging.operations.screeninglists.perorganization.create', {
            url: "/new",
            templateUrl: "products/bulkmessaging/operations/operations.screeninglists.detail.html",
            controller: 'BulkMessagingScreeningListsOperationsNewCtrl',
            data: {
                subPageHeaderKey: 'Products.BulkMessaging.Operations.PerOrganization.Title'
            }
        }).state('products.bulkmessaging.operations.screeninglists.perorganization.update', {
            url: "/update",
            templateUrl: "products/bulkmessaging/operations/operations.screeninglists.detail.html",
            controller: 'BulkMessagingScreeningListsOperationsUpdateCtrl',
            resolve: {
                screeningList: function ($stateParams, $q, UtilService, BulkMessagingOperationsService) {
                    var organizationId = $stateParams.organizationId;
                    var listName = $stateParams.listName;

                    var deferred = $q.defer();

                    if (organizationId) {
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
                subPageHeaderKey: 'Products.BulkMessaging.Operations.PerOrganization.Title'
            }
        });

    });

})();
