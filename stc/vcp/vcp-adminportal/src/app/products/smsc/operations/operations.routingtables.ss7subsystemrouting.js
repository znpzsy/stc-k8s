(function () {

    'use strict';

    angular.module('adminportal.products.smsc.operations.routingtables.ss7subsystemrouting', []);

    var SmscRoutingTablesSS7SubsystemRoutingOperationsModule = angular.module('adminportal.products.smsc.operations.routingtables.ss7subsystemrouting');

    SmscRoutingTablesSS7SubsystemRoutingOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('products.smsc.operations.routingtables.ss7subsystemrouting', {
            url: "/ss7",
            templateUrl: "products/smsc/operations/operations.routingtables.ss7subsystemrouting.html",
            controller: 'SmscRoutingTablesSS7SubsystemRoutingOperationsCtrl',
            resolve: {
                ss7SubsystemRoutings: function (SmscConfService) {
                    return SmscConfService.getSS7SubsystemRoutings();
                }
            }
        }).state('products.smsc.operations.routingtables.ss7subsystemrouting-new', {
            url: "/ss7/new",
            templateUrl: "products/smsc/operations/operations.routingtables.ss7subsystemrouting.details.html",
            controller: 'SmscRoutingTablesNewSS7SubsystemRoutingOperationsCtrl',
            resolve: {
                ss7SubsystemRoutings: function (SmscConfService) {
                    return SmscConfService.getSS7SubsystemRoutings();
                }
            }
        });

    });

    SmscRoutingTablesSS7SubsystemRoutingOperationsModule.controller('SmscRoutingTablesSS7SubsystemRoutingOperationsCtrl', function ($scope, $state, $log, $translate, $filter, notification, $uibModal,
                                                                                                                                                  UtilService, SmscConfService, Restangular, NgTableParams, NgTableService,
                                                                                                                                                  ss7SubsystemRoutings, ReportingExportService) {
        $log.debug('SmscRoutingTablesSS7SubsystemRoutingOperationsCtrl');

        var ss7SubsystemRoutingList = Restangular.stripRestangular(ss7SubsystemRoutings);

        // SMPP Application Routing list
        $scope.ss7SubsystemRoutingList = {
            list: ss7SubsystemRoutingList,
            tableParams: {}
        };

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.ss7SubsystemRoutingList.tableParams.settings().$scope.filterText = filterText;
            $scope.ss7SubsystemRoutingList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.ss7SubsystemRoutingList.tableParams.page(1);
            $scope.ss7SubsystemRoutingList.tableParams.reload();
        }, 750);

        $scope.ss7SubsystemRoutingList.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "addressRangeStart": 'asc' // initial sorting
            }
        }, {
            total: $scope.ss7SubsystemRoutingList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.ss7SubsystemRoutingList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.ss7SubsystemRoutingList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - SMPP Application Routing list

        $scope.remove = function (ss7SubsystemRouting) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing SS7 Subsystem Routing: ', ss7SubsystemRouting);

                SmscConfService.deleteSS7SubsystemRouting(ss7SubsystemRouting.addressRangeStart, ss7SubsystemRouting.addressRangeEnd).then(function (response) {
                    $log.debug('Removed SS7 Subsystem Routing: ', response);

                    var deletedListItem = _.findWhere($scope.ss7SubsystemRoutingList.list, {
                        addressRangeStart: ss7SubsystemRouting.addressRangeStart,
                        addressRangeEnd: ss7SubsystemRouting.addressRangeEnd
                    });
                    $scope.ss7SubsystemRoutingList.list = _.without($scope.ss7SubsystemRoutingList.list, deletedListItem);

                    $scope.ss7SubsystemRoutingList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete SS7 Subsystem Routing: ', response);
                });
            });
        };

        $scope.exportRecords = function (mimeType) {
            var srcUrl = '/smsc-gr-rest/configuration/v1/routing/ss7subsystem/range/export?response-content-type=' + mimeType;

            $log.debug('Downloading SMSC routing tables ss7 routing records. URL: ', srcUrl);

            ReportingExportService.showReport(srcUrl, mimeType.toUpperCase());
        };

    });

    SmscRoutingTablesSS7SubsystemRoutingOperationsModule.controller('SmscRoutingTablesNewSS7SubsystemRoutingOperationsCtrl', function ($scope, $state, $log, $translate, $filter, notification, $uibModal,
                                                                                                                                                     SmscConfService, Restangular, ss7SubsystemRoutings) {
        $log.debug("SMSCRoutingTablesNewSS7SubsystemRoutingOperationsCtrl");

        var ss7SubsystemRoutingList = Restangular.stripRestangular(ss7SubsystemRoutings);
        $scope.ss7SubsystemRoutingList = ss7SubsystemRoutingList;

        $scope.ss7SubsystemRouting = {
            ss7Subsystem: $scope.ss7SubsystemRoutingList[0]
        };

        $scope.$watch('ss7SubsystemRouting.addressRangeStart', function () {
            $scope.form.addressRangeEnd.$setValidity('ngMinValue', true);
        });
        $scope.$watch('ss7SubsystemRouting.addressRangeEnd', function () {
            $scope.form.addressRangeStart.$setValidity('ngMaxValue', true);
        });

        $scope.save = function (ss7SubsystemRouting) {
            var rangeItem = {
                "addressRangeStart": ss7SubsystemRouting.addressRangeStart,
                "addressRangeEnd": ss7SubsystemRouting.addressRangeEnd,
                "statusReportAllowed": true
            };

            SmscConfService.addSS7SubsystemRouting(rangeItem).then(function (response) {
                $log.debug('Added SS7 Subsystem Routing: ', response);

                var apiResponse = Restangular.stripRestangular(response);

                if (apiResponse.errorCode) {
                    var message = '';

                    if (apiResponse.errorMsg) {
                        if (apiResponse.errorMsg.indexOf('already') > -1) {
                            message = $translate.instant('Products.SMSC.Operations.RoutingTables.Messages.AlreadyDefinedError', {
                                range: rangeItem.addressRangeStart + '_' + rangeItem.addressRangeEnd
                            });
                        } else if (apiResponse.errorMsg.indexOf('Overlap') > -1) {
                            var msgObj = _.object(_.compact(_.map(apiResponse.errorMsg.split(';'), function (item) {
                                if (item) return item.split(/=(.+)?/);
                            })));

                            var definedRange = msgObj['ss7SubsystemAddressRange.adressRangeStart'].split(/,.+?=/);
                            var definedRangeStart = definedRange[0];
                            var definedRangeEnd = definedRange[1];

                            message = $translate.instant('Products.SMSC.Operations.RoutingTables.Messages.RangeOverlappedError', {
                                range: definedRangeStart + '_' + definedRangeEnd
                            });
                        } else {
                            message = apiResponse.errorMsg;
                        }
                    } else {
                        message = $translate.instant('CommonMessages.GenericServerError');
                    }

                    notification({
                        type: 'danger',
                        text: message
                    });
                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $state.go('products.smsc.operations.routingtables.ss7subsystemrouting');
                }
            }, function (response) {
                $log.debug('Cannot add SS7 Subsystem Routing: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go('products.smsc.operations.routingtables.ss7subsystemrouting');
        };

    });

})();
