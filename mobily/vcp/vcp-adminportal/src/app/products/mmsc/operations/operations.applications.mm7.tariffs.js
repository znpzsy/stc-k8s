(function () {

    'use strict';

    angular.module('adminportal.products.mmsc.operations.applications.mm7.tariffs', []);

    var MMSCVasTariffOperationsModule = angular.module('adminportal.products.mmsc.operations.applications.mm7.tariffs');

    MMSCVasTariffOperationsModule.controller('MMSCApplicationsTariffsCtrl', function ($scope, $uibModalInstance, $log, $timeout, notification, $translate, $filter, $uibModal, NgTableParams, NgTableService, Restangular, MmscOperationService, tariffs) {
        $log.debug("MMSCApplicationsTariffsCtrl");
        // app is taking and set to the $scope from where the $uibModal window is initializing.
        var appId = $scope.app.vasId;
        tariffs = Restangular.stripRestangular(tariffs);

        // SMPP charging tariff id list
        $scope.allowedTariffIdList = {
            list: tariffs.tariffIds ? tariffs.tariffIds : [],
            tableParams: {}
        };

        $scope.filterTable = _.throttle(function (filterText, filterColumns) {
            $scope.allowedTariffIdList.tableParams.settings().$scope.filterText = filterText;
            $scope.allowedTariffIdList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.allowedTariffIdList.tableParams.page(1);
            $scope.allowedTariffIdList.tableParams.reload();
        }, 500);

        $scope.allowedTariffIdList.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "tariffId": 'asc'
            }
        }, {
            total: $scope.allowedTariffIdList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.allowedTariffIdList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.allowedTariffIdList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        $scope.addNewTariffId = function (tariffIdValue) {
            var tariffIdItem = {
                "tariffId": tariffIdValue
            };

            MmscOperationService.createVasTariff(appId, tariffIdItem).then(function (response) {
                $log.debug('Added charging tariff id: ', tariffIdItem);
                var apiResponse = Restangular.stripRestangular(response);
                if (apiResponse && (apiResponse.errorCode || apiResponse.code)) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: apiResponse.errorCode || apiResponse.code,
                            errorText: apiResponse.errorMsg || apiResponse.message
                        })
                    });
                } else {
                    $scope.allowedTariffIdList.list.push(tariffIdItem);
                    $scope.allowedTariffIdList.tableParams.reload();
                    $scope.allowedTariffIdList.tableParams.settings().$scope.form.$setPristine();
                    delete $scope.allowedTariffIdList.tableParams.settings().$scope.newTariffIdValue;
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }
            }, function (response) {
                $log.debug('Cannot add tariff id: ', response);
            });
        };

        // Remove tariff id
        $scope.removeTariffId = function (tariffIdItem) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });
            modalInstance.result.then(function () {
                $log.debug('Removing tariff id: ', tariffIdItem);
                MmscOperationService.deleteVasTariff(appId, tariffIdItem.tariffId).then(function (response) {
                    $log.debug('Removed tariff id: ', response);

                    if (response && (response.errorCode || response.code)) {
                        notification({
                            type: 'warning',
                            text: $translate.instant('CommonMessages.ApiError', {
                                errorCode: response.errorCode || response.code,
                                errorText: response.errorMsg || response.message
                            })
                        });
                    } else {
                        var deletedListItem = _.findWhere($scope.allowedTariffIdList.list, {tariffId: tariffIdItem.tariffId});
                        $scope.allowedTariffIdList.list = _.without($scope.allowedTariffIdList.list, deletedListItem);
                        $scope.allowedTariffIdList.tableParams.reload();
                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });
                    }
                }, function (response) {
                    $log.debug('Cannot delete tariff id: ', response);
                });
            });
        };
        $scope.ok = function () {
            $uibModalInstance.close();
        };
    });

})();
