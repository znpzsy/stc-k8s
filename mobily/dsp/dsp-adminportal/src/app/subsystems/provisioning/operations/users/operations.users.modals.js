(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning.operations.users.modals', []);

    var ProvisioningUsersModalsOperationsModule = angular.module('adminportal.subsystems.provisioning.operations.users.modals');

    ProvisioningUsersModalsOperationsModule.controller('ProvisioningOperationsModalsPrivilegesModalInstanceCtrl', function ($scope, $log, $uibModalInstance, $filter, NgTableParams, Restangular, resources,
                                                                                                                            itemNameParameter, permissionsParameter, constraintsParameter, titleKey) {
        $log.debug('ProvisioningOperationsModalsPrivilegesModalInstanceCtrl');

        $scope.resources = Restangular.stripRestangular(resources);

        $scope.flatResources = [];

        $scope.itemName = itemNameParameter;

        $scope.titleKey = titleKey;

        $scope.tableParams = new NgTableParams({
            sorting: {
                "resourceName": 'asc',
                "operationName": 'asc'
            }
        }, {
            $scope: $scope,
            groupBy: 'resourceName',
            total: 0,
            getData: function ($defer, params) {
                angular.forEach($scope.resources.resources, function (resource, key) {
                    var preGrantedResources = _.where(permissionsParameter, {resourceId: resource.id});
                    var isResourceGranted = preGrantedResources.length > 0;
                    var grantAllOperations = isResourceGranted ? preGrantedResources[0].operationId === 0 : false;

                    var preDeniedResources = _.where(constraintsParameter, {resourceId: resource.id});
                    var isResourceDenied = preDeniedResources.length > 0;
                    var denyAllOperations = isResourceDenied ? preDeniedResources[0].operationId === 0 : false;

                    angular.forEach(resource.operations, function (operation, key) {
                        var newEntry = {
                            resourceName: resource.name,
                            operationName: operation.name,
                            resourceId: resource.id,
                            operationId: operation.id,
                            operationGranted: false,
                            resourceGranted: false,
                            operationDenied: false,
                            resourceDenied: false
                        };

                        if (grantAllOperations) {
                            newEntry.operationGranted = true;
                            newEntry.resourceGranted = true;
                        } else if (isResourceGranted) {
                            var grantOp = angular.isDefined(_.findWhere(preGrantedResources, {operationName: operation.name}));
                            if (grantOp)
                                newEntry.operationGranted = true;
                        }

                        if (denyAllOperations) {
                            newEntry.operationDenied = true;
                            newEntry.resourceDenied = true;
                        } else if (isResourceDenied) {
                            var denyOp = angular.isDefined(_.findWhere(preDeniedResources, {operationName: operation.name}));
                            if (denyOp) newEntry.operationDenied = true;
                        }
                        this.push(newEntry);
                    }, $scope.flatResources);
                });

                // executes when the modal is opened first time contains both grants and constraints
                $scope.flatResourcesOrig = angular.copy($scope.flatResources);

                $scope.flatResources = $filter('orderBy')($scope.flatResources, ['resourceName', 'operationName']);
                $defer.resolve($scope.flatResources);
            }
        });

        var checkAllGranted = function (resource) {
            var isCheck = _.isUndefined(_.findWhere(resource.data, {operationGranted: false}));

            _.each(resource.data, function (item) {
                item.resourceGranted = isCheck;
            });
        };

        var checkAllDenied = function (resource) {
            var isCheck = _.isUndefined(_.findWhere(resource.data, {operationDenied: false}));

            _.each(resource.data, function (item) {
                item.resourceDenied = isCheck;
            });
        };

        $scope.grantOperation = function (resource, item) {
            item.operationDenied = false;

            checkAllGranted(resource);
            checkAllDenied(resource);
        };

        $scope.grantAllOperations = function (item) {
            var isGranted = item.data[0].resourceGranted;

            for (var i = 0; i < item.data.length; i++) {
                item.data[i].operationGranted = isGranted;
                item.data[i].resourceGranted = isGranted;

                item.data[i].operationDenied = false;
                item.data[i].resourceDenied = false;
            }
        };

        $scope.isAnyGranted = function (items) {
            return !_.isUndefined(_.findWhere(items, {operationGranted: true}));
        };

        $scope.denyOperation = function (resource, item) {
            item.operationGranted = false;

            checkAllDenied(resource);
            checkAllGranted(resource);
        };

        $scope.denyAllOperations = function (item) {
            var isDenied = item.data[0].resourceDenied;

            for (var i = 0; i < item.data.length; i++) {
                item.data[i].operationGranted = false;
                item.data[i].resourceGranted = false;

                item.data[i].operationDenied = isDenied;
                item.data[i].resourceDenied = isDenied;
            }
        };

        $scope.isAnyDenied = function (items) {
            return !_.isUndefined(_.findWhere(items, {operationDenied: true}));
        };

        $scope.ok = function () {
            angular.forEach($scope.flatResources, function (obj, key) {
                var orig = _.findWhere($scope.flatResourcesOrig, {
                    operationName: obj.operationName,
                    resourceName: obj.resourceName
                });
            });

            $uibModalInstance.close($scope.flatResources);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });

    ProvisioningUsersModalsOperationsModule.controller('ProvisioningOperationsModalsUserAccountsModalInstanceCtrl', function ($scope, $uibModalInstance, $log, $filter, NgTableParams, NgTableService, Restangular,
                                                                                                                              userAccountsParameter, itemNameParameter, userAccounts, titleKey) {
        $log.debug('ProvisioningOperationsModalsUserAccountsModalInstanceCtrl');

        $scope.selectedItems = userAccountsParameter ? userAccountsParameter : [];

        $scope.itemName = itemNameParameter;

        $scope.userAccounts = Restangular.stripRestangular(userAccounts);

        $scope.titleKey = titleKey;

        _.each($scope.userAccounts.userAccounts, function (userAccount) {
            userAccount.id = Number(userAccount.id);
        });

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
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.userAccounts.userAccounts);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.userAccounts.userAccounts;
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

        $scope.addToSelection = function (item) {
            var user = _.findWhere($scope.selectedItems, {userName: item.userName});
            if (!user) {
                $scope.selectedItems.push(item);
            }
        };

        $scope.removeFromSelection = function (item) {
            var index = _.indexOf($scope.selectedItems, item);
            if (index !== -1) {
                $scope.selectedItems.splice(index, 1);
            }
        };

        $scope.ok = function () {
            $uibModalInstance.close($scope.selectedItems);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });

})();