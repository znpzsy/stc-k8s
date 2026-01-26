(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.simfarmcontrol.contentcounters.contentranges', []);

    var AntiSpamSMSOperationsSimFarmControlContentRangesModule = angular.module('adminportal.products.antispamsms.operations.simfarmcontrol.contentcounters.contentranges');

    AntiSpamSMSOperationsSimFarmControlContentRangesModule.controller('AntiSpamSMSOperationsSimFarmControlContentRangesCtrl', function ($scope, $uibModalInstance, $log, $filter, $uibModal, $translate, notification, NgTableParams, NgTableService,
                                                                                                                            SMSAntiSpamConfigService, SMS_ANTISPAM_APPLICABLE_RANGES, msisdnRanges, addressRanges, contentFiltersEntry) {
        $log.debug("AntiSpamSMSOperationsSimFarmControlContentRangesCtrl");

        addressRanges = addressRanges ? addressRanges : [];

        $scope.countersEntryName = contentFiltersEntry.name;
        $scope.msisdnRanges = msisdnRanges.msisdnRangeList;
        $scope.msisdnRanges = $filter('orderBy')($scope.msisdnRanges, 'name');
        $scope.SMS_ANTISPAM_APPLICABLE_RANGES = SMS_ANTISPAM_APPLICABLE_RANGES;

        $scope.newAddressRange = {};

        // Address range list
        $scope.addressRangeList = {
            list: addressRanges,
            tableParams: {}
        };

        $scope.addressRangeList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "name": 'asc'
            }
        }, {
            total: $scope.addressRangeList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.addressRangeList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.addressRangeList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Address range list

        var tableScope = $scope.addressRangeList.tableParams.settings().$scope;

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            tableScope.filterText = filterText;
            tableScope.filterColumns = filterColumns;
            $scope.addressRangeList.tableParams.page(1);
            $scope.addressRangeList.tableParams.reload();
        }, 750);

        // The watchers to check availability on the list.
        tableScope.$watch('newAddressRange.name', function (newVal) {
            if (newVal) {
                var foundItem = _.find($scope.addressRangeList.list, function (item) {
                    return (String(item.name) === String(newVal));
                });

                tableScope.form.name.$setValidity('availabilityCheck', _.isUndefined(foundItem));
            }
        });

        // Add address range
        $scope.addNewAddressRange = function (addressRange) {
            var addressRangeItem = angular.copy(addressRange);

            $log.debug("addressRangeItem", addressRangeItem);
            //addressRangeItem.msisdnRangeListName = addressRangeItem.name;

            SMSAntiSpamConfigService.createContentCountersEntryRange($scope.countersEntryName, addressRangeItem).then(function (response) {
                if(response && response.value === "GENERAL_ERROR") {

                    $log.debug('Cannot add msisdn range list name: ', addressRangeItem, ', response: ', response);

                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.GenericServerError')
                    });

                } else if (response && response.value === "ALREADY_SUBSCRIBED") {

                    $log.debug('Cannot add msisdn range list name: ', addressRangeItem, ', response: ', response);

                    notification({
                        type: 'warning',
                        text: $translate.instant('Products.AntiSpamSMS.Operations.AddressRanges.Messages.RangeAlreadyDefinedError', {
                            msisdnRangeName: addressRangeItem.name
                        })
                    });
                } else {
                    $log.debug('Added msisdn range list name: ', addressRangeItem);

                    $scope.addressRangeList.list.push(addressRangeItem);
                    $scope.addressRangeList.tableParams.reload();

                    tableScope.form.$setPristine();
                    tableScope.newAddressRange.name = null;
                    tableScope.newAddressRange.applicableRange = null;
                }
            }, function (response) {
                $log.debug('Cannot add msisdn range list name: ', addressRangeItem, ', response: ', response);
            });
        };

        // Remove address range
        $scope.removeAddressRange = function (addressRangeItem) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing msisdn range list name: ', addressRangeItem);

                SMSAntiSpamConfigService.deleteContentCountersEntryRange($scope.countersEntryName, addressRangeItem.name).then(function (response) {
                    $log.debug('Deleted msisdn range list name: ', addressRangeItem, ', response: ', response);

                    var deletedListItem = _.findWhere($scope.addressRangeList.list, {
                        name: addressRangeItem.name
                    });
                    $scope.addressRangeList.list = _.without($scope.addressRangeList.list, deletedListItem);

                    $scope.addressRangeList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete msisdn range list name: ', addressRangeItem, ', response: ', response);
                });
            });
        };

        $scope.ok = function () {
            $uibModalInstance.close();
        };
    });

})();
