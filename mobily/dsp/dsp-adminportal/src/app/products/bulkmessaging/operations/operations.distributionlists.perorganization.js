(function () {

    'use strict';

    angular.module('adminportal.products.bulkmessaging.operations.distributionlists.perorganization', []);

    var BulkMessagingDistributionListsPerOrganizationOperationsModule = angular.module('adminportal.products.bulkmessaging.operations.distributionlists.perorganization');

    BulkMessagingDistributionListsPerOrganizationOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('products.bulkmessaging.operations.distributionlists.perorganization', {
            url: "/per-organization?organizationId&listName",
            templateUrl: "products/bulkmessaging/operations/operations.distributionlists.main.html",
            controller: 'BulkMessagingDistributionListsOrganizationsCtrl',
            data: {
                listType: 'ORGANIZATION',
                pageHeaderKey: 'Products.BulkMessaging.Operations.DistributionLists.Title',
                subPageHeaderKey: 'Products.BulkMessaging.Operations.PerOrganization.Title',
                listState: 'products.bulkmessaging.operations.distributionlists.perorganization.list',
                createState: 'products.bulkmessaging.operations.distributionlists.perorganization.create',
                updateState: 'products.bulkmessaging.operations.distributionlists.perorganization.update',
                exportName: 'DistributionListsPerOrganizationRecords',
                permissions: [
                    'BMS__OPERATIONS_DISTROLIST_PERORGANIZATION_READ'
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
        }).state('products.bulkmessaging.operations.distributionlists.perorganization.list', {
            url: "/list",
            templateUrl: "products/bulkmessaging/operations/operations.distributionlists.html",
            controller: 'BulkMessagingDistributionListsOperationsCtrl',
            resolve: {
                distributionLists: function () {
                    return [];
                }
            }
        }).state('products.bulkmessaging.operations.distributionlists.perorganization.create', {
            url: "/new",
            templateUrl: "products/bulkmessaging/operations/operations.distributionlists.detail.html",
            controller: 'BulkMessagingDistributionListsOperationsNewCtrl',
            data: {
                subPageHeaderKey: 'Products.BulkMessaging.Operations.PerOrganization.Title'
            }
        }).state('products.bulkmessaging.operations.distributionlists.perorganization.update', {
            url: "/update",
            templateUrl: "products/bulkmessaging/operations/operations.distributionlists.detail.html",
            controller: 'BulkMessagingDistributionListsOperationsUpdateCtrl',
            resolve: {
                distributionList: function ($stateParams, $q, UtilService, BulkMessagingOperationsService) {
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
