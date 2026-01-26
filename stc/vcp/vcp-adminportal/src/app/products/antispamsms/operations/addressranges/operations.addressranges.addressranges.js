(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.addressranges.msisdn.addressranges', []);

    var AntiSpamSMSOperationsAddressRangesMsisdnAddressRangesModule = angular.module('adminportal.products.antispamsms.operations.addressranges.msisdn.addressranges');

    AntiSpamSMSOperationsAddressRangesMsisdnAddressRangesModule.controller('AntiSpamSMSOperationsAddressRangesMsisdnAddressRangesCtrl', function ($scope, $uibModalInstance, $log, $filter, $uibModal, $translate, notification, NgTableParams, NgTableService,
                                                                                                                                                  SMSAntiSpamConfigService, msisdnRange) {
        $log.debug("AntiSpamSMSOperationsAddressRangesMsisdnAddressRangesCtrl");

        $scope.msisdnRangeName = msisdnRange.name;

        $scope.newAddressRange = {};

        // Address range list
        $scope.addressRangeList = {
            list: msisdnRange.msisdnRangeList,
            tableParams: {}
        };

        $scope.addressRangeList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "start": 'asc'
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

        // Combined validation function
        function validateAddressRange() {
            if (!tableScope.newAddressRange.start || !tableScope.newAddressRange.end) {
                return;
            }

            var start = String(tableScope.newAddressRange.start);
            var end = String(tableScope.newAddressRange.end);

            // check for exact duplicate
            var foundItem = _.find($scope.addressRangeList.list, function (item) {
                return String(item.start) === start && String(item.end) === end;
            });
            var isAvailable = _.isUndefined(foundItem);

            // range order - start should be smaller than end
            var startNum = Number(start);
            var endNum = Number(end);
            // If one of the values is not a number, we cannot validate the order, so we consider it valid
            var isValidOrder = (!isNaN(startNum) && !isNaN(endNum) && startNum <= endNum) || (isNaN(startNum) || isNaN(endNum));

            tableScope.form.start.$setValidity('availabilityCheck', isAvailable);
            tableScope.form.start.$setValidity('rangeOrder', isValidOrder);

            tableScope.form.end.$setValidity('availabilityCheck', isAvailable);
            tableScope.form.end.$setValidity('rangeOrder', isValidOrder);
        }

        // Watch both fields with combined validation
        tableScope.$watch('newAddressRange.start', validateAddressRange);
        tableScope.$watch('newAddressRange.end', validateAddressRange);

        // Add address range
        $scope.addNewAddressRange = function (addressRange) {
            var addressRangeItem = angular.copy(addressRange);

            SMSAntiSpamConfigService.createMsisdnRangeListEntryRange($scope.msisdnRangeName, addressRangeItem).then(function (response) {
                if (response && response.value === "ALREADY_SUBSCRIBED") {
                    $log.debug('Cannot add msisdn range list entry range: ', addressRangeItem, ', response: ', response);

                    notification({
                        type: 'warning',
                        text: $translate.instant('Products.AntiSpamSMS.Operations.AddressRanges.Messages.RangeAlreadyDefinedError', {
                            start: addressRangeItem.start,
                            end: addressRangeItem.end
                        })
                    });
                } else {
                    $log.debug('Added msisdn range list entry range: ', addressRangeItem);

                    $scope.addressRangeList.list.push(addressRangeItem);
                    $scope.addressRangeList.tableParams.reload();

                    tableScope.form.$setPristine();
                    tableScope.newAddressRange.start = '';
                    tableScope.newAddressRange.end = '';
                }
            }, function (response) {
                $log.debug('Cannot add msisdn range list entry range: ', addressRangeItem, ', response: ', response);
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
                $log.debug('Removing msisdn range list entry range: ', addressRangeItem);

                SMSAntiSpamConfigService.deleteMsisdnRangeListEntryRange($scope.msisdnRangeName, addressRangeItem.start, addressRangeItem.end).then(function (response) {
                    $log.debug('Deleted msisdn range list entry range: ', addressRangeItem, ', response: ', response);

                    var deletedListItem = _.findWhere($scope.addressRangeList.list, {
                        start: addressRangeItem.start,
                        end: addressRangeItem.end
                    });
                    $scope.addressRangeList.list = _.without($scope.addressRangeList.list, deletedListItem);

                    $scope.addressRangeList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete msisdn range list entry range: ', addressRangeItem, ', response: ', response);
                });
            });
        };

        $scope.ok = function () {
            $uibModalInstance.close();
        };
    });

})();
