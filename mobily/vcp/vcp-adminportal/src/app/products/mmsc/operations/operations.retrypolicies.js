(function () {

    'use strict';

    angular.module('adminportal.products.mmsc.operations.retrypolicies', [
        'adminportal.products.mmsc.operations.retrypolicies.useragents',
        'adminportal.products.mmsc.operations.retrypolicies.externalservers',
        'adminportal.products.mmsc.operations.retrypolicies.operators',
        'adminportal.products.mmsc.operations.retrypolicies.applications',
        'adminportal.products.mmsc.operations.retrypolicies.errorbased',
        'adminportal.products.mmsc.operations.retrypolicies.errorbasedpolicies'
    ]);

    var MMSCOperationsRetryPoliciesModule = angular.module('adminportal.products.mmsc.operations.retrypolicies');

    MMSCOperationsRetryPoliciesModule.config(function ($stateProvider) {

        $stateProvider.state('products.mmsc.operations.retrypolicies', {
            abstract: true,
            url: "/retrypolicies",
            templateUrl: "products/mmsc/operations/operations.abstract.html"
        });

    });

    MMSCOperationsRetryPoliciesModule.controller('MMSCOperationsRetryPoliciesPolicyTableCtrl', function ($scope, $state, $log, $filter, NgTableParams, NgTableService, MmscOperationService,
                                                                                                         agent) {
        $log.debug('MMSCOperationsRetryPoliciesPolicyTableCtrl');

        // Policy list
        $scope.policyList = {
            list: agent.policy,
            tableParams: {}
        };

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.policyList.tableParams.settings().$scope.filterText = filterText;
            $scope.policyList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.policyList.tableParams.page(1);
            $scope.policyList.tableParams.reload();
        }, 500);

        $scope.policyList.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "preference": 'asc'
            }
        }, {
            total: $scope.policyList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.policyList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.policyList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Policy list

    });

})();
