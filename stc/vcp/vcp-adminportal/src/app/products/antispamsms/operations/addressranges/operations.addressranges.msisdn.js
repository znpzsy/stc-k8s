(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.addressranges.msisdn', [
        "adminportal.products.antispamsms.operations.addressranges.msisdn.addressranges"
    ]);

    var AntiSpamSMSOperationsAddressRangesMsisdnModule = angular.module('adminportal.products.antispamsms.operations.addressranges.msisdn');

    AntiSpamSMSOperationsAddressRangesMsisdnModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations.addressranges.msisdn', {
            url: "/address-range",
            template: '<div ui-view></div>'
        }).state('products.antispamsms.operations.addressranges.msisdn.list', {
            url: "/list",
            templateUrl: "products/antispamsms/operations/addressranges/operations.addressranges.html",
            controller: 'AntiSpamSMSOperationsAddressRangesMsisdnCtrl',
            data: {
                permissions: [
                    'READ_ANTISPAM_ADDRESSRANGE_OPERATIONS'
                ]
            },
            resolve: {
                msisdnRanges: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getMsisdnRangeList();
                }
            }
        }).state('products.antispamsms.operations.addressranges.msisdn.new', {
            url: "/new",
            templateUrl: "products/antispamsms/operations/addressranges/operations.addressranges.msisdn.detail.html",
            controller: 'AntiSpamSMSOperationsAddressRangesNewMsisdnCtrl',
            data: {
                permissions: [
                    'CREATE_ANTISPAM_ADDRESSRANGE_OPERATIONS'
                ]
            },
        });

    });

    AntiSpamSMSOperationsAddressRangesMsisdnModule.controller('AntiSpamSMSOperationsAddressRangesMsisdnCommonCtrl', function ($scope, $log) {
        $log.debug('AntiSpamSMSOperationsAddressRangesMsisdnCommonCtrl');

        $scope.listState = "products.antispamsms.operations.addressranges.msisdn.list";
        $scope.newState = "products.antispamsms.operations.addressranges.msisdn.new";
        $scope.updateState = "products.antispamsms.operations.addressranges.msisdn.update";
    });

    AntiSpamSMSOperationsAddressRangesMsisdnModule.controller('AntiSpamSMSOperationsAddressRangesMsisdnCtrl', function ($scope, $log, $controller, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                        SMSAntiSpamConfigService, msisdnRanges) {
        $log.debug('AntiSpamSMSOperationsAddressRangesMsisdnCtrl');

        $controller('AntiSpamSMSOperationsAddressRangesMsisdnCommonCtrl', {$scope: $scope});

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'name',
                    headerKey: 'Products.AntiSpamSMS.Operations.AddressRanges.TableColumns.Name'
                }
            ]
        };

        // Address range name list
        $scope.msisdnRangeList = {
            list: msisdnRanges.msisdnRangeList,
            tableParams: {}
        };

        $scope.msisdnRangeList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "name": 'asc'
            }
        }, {
            total: $scope.msisdnRangeList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.msisdnRangeList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.msisdnRangeList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Address range name list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.msisdnRangeList.tableParams.settings().$scope.filterText = filterText;
            $scope.msisdnRangeList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.msisdnRangeList.tableParams.page(1);
            $scope.msisdnRangeList.tableParams.reload();
        }, 750);

        $scope.remove = function (entry) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing msisdn range list entry: ', entry);

                SMSAntiSpamConfigService.deleteMsisdnRangeListEntry(entry.name).then(function (response) {
                    $log.debug('Removed msisdn range list entry: ', entry, ', response: ', response);
                    var txt = $translate.instant('Products.AntiSpamSMS.Operations.AddressRanges.Messages.EntryReferencedError', {name: entry.name}) + '\n' + response.message;

                    if(response.value === "REFERENCE_FOUND") {
                        notification({
                            type: 'warning',
                            text: txt
                        });

                    } else {

                        var deletedListItem = _.findWhere($scope.msisdnRangeList.list, {name: entry.name});
                        $scope.msisdnRangeList.list = _.without($scope.msisdnRangeList.list, deletedListItem);

                        $scope.msisdnRangeList.tableParams.reload();

                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });

                    }
                }, function (response) {
                    $log.debug('Cannot delete msisdn range list entry: ', entry, ', response: ', response);
                });
            });
        };

        $scope.setAddressRange = function (msisdnRange) {
            $uibModal.open({
                templateUrl: 'products/antispamsms/operations/addressranges/operations.addressranges.addressranges.modal.html',
                controller: 'AntiSpamSMSOperationsAddressRangesMsisdnAddressRangesCtrl',
                size: 'lg',
                resolve: {
                    msisdnRange: function () {
                        return SMSAntiSpamConfigService.getMsisdnRangeListEntry(msisdnRange.name);
                    }
                }
            });
        };
    });

    AntiSpamSMSOperationsAddressRangesMsisdnModule.controller('AntiSpamSMSOperationsAddressRangesNewMsisdnCtrl', function ($scope, $log, $state, $controller, $translate, notification, SMSAntiSpamConfigService) {
        $log.debug('AntiSpamSMSOperationsAddressRangesNewMsisdnCtrl');

        $controller('AntiSpamSMSOperationsAddressRangesMsisdnCommonCtrl', {$scope: $scope});

        $scope.save = function (entry) {
            var entryItem = angular.copy(entry);

            SMSAntiSpamConfigService.createMsisdnRangeListEntry(entryItem).then(function (response) {
                if (response && response.value === "ALREADY_SUBSCRIBED") {
                    $log.debug('Cannot add msisdn range list entry: ', entryItem, ', response: ', response);

                    notification({
                        type: 'warning',
                        text: $translate.instant('Products.AntiSpamSMS.Operations.AddressRanges.Messages.EntryAlreadyDefinedError', {name: entryItem.name})
                    });
                } else {
                    $log.debug('Added msisdn range list entry: ', entryItem);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $state.go($scope.listState);
                }
            }, function (response) {
                $log.debug('Cannot add msisdn range list entry: ', entryItem, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($scope.listState);
        };
    });

})();
