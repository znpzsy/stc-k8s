(function () {

    'use strict';

    angular.module('adminportal.products.smsc.operations.routingtables.interconnectagentrouting', []);

    var SmscRoutingTablesInterconnectSmppAgentRoutingOperationsModule = angular.module('adminportal.products.smsc.operations.routingtables.interconnectagentrouting');

    SmscRoutingTablesInterconnectSmppAgentRoutingOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('products.smsc.operations.routingtables.interconnectagentrouting', {
            url: "/interconnectagents",
            templateUrl: "products/smsc/operations/operations.routingtables.interconnectagentrouting.html",
            controller: 'SmscRoutingTablesInterconnectSmppAgentRoutingOperationsCtrl',
            resolve: {
                interconnectAgentRoutings: function (SmscConfService) {
                    return SmscConfService.getAllInterconnectSmppAgentRoutings();
                }
            }
        }).state('products.smsc.operations.routingtables.interconnectagentrouting-new', {
            url: "/interconnectagents/new",
            templateUrl: "products/smsc/operations/operations.routingtables.interconnectagentrouting.details.html",
            controller: 'SmscRoutingTablesNewInterconnectSmppAgentRoutingOperationsCtrl',
            resolve: {
                interconnectSmppAgents: function (SmscConfService) {
                    return SmscConfService.getInterconnectSmppAgents();
                }
            }
        });

    });

    SmscRoutingTablesInterconnectSmppAgentRoutingOperationsModule.controller('SmscRoutingTablesInterconnectSmppAgentRoutingOperationsCtrl', function ($scope, $state, $log, $translate, $filter, notification, $uibModal,
                                                                                                                                                                    UtilService, SmscConfService, Restangular, NgTableParams, NgTableService,
                                                                                                                                                                    interconnectAgentRoutings, ReportingExportService) {
        $log.debug('SmscRoutingTablesInterconnectSmppAgentRoutingOperationsCtrl');

        var interconnectAgentRoutingList = Restangular.stripRestangular(interconnectAgentRoutings);

        // SMPP Application Routing list
        $scope.interconnectAgentRoutingList = {
            list: interconnectAgentRoutingList,
            tableParams: {}
        };

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.interconnectAgentRoutingList.tableParams.settings().$scope.filterText = filterText;
            $scope.interconnectAgentRoutingList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.interconnectAgentRoutingList.tableParams.page(1);
            $scope.interconnectAgentRoutingList.tableParams.reload();
        }, 750);

        $scope.interconnectAgentRoutingList.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "name": 'asc' // initial sorting
            }
        }, {
            total: $scope.interconnectAgentRoutingList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.interconnectAgentRoutingList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.interconnectAgentRoutingList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - SMPP Application Routing list

        $scope.remove = function (interconnectAgentRouting) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing Interconnect Smpp Agent Routing: ', interconnectAgentRouting);

                SmscConfService.deleteInterconnectSmppAgentRouting(interconnectAgentRouting.name, interconnectAgentRouting.addRangeStart, interconnectAgentRouting.addRangeEnd).then(function (response) {
                    $log.debug('Removed Interconnect Smpp Agent Routing: ', response);

                    var deletedListItem = _.findWhere($scope.interconnectAgentRoutingList.list, {
                        addRangeStart: interconnectAgentRouting.addRangeStart,
                        addRangeEnd: interconnectAgentRouting.addRangeEnd
                    });
                    $scope.interconnectAgentRoutingList.list = _.without($scope.interconnectAgentRoutingList.list, deletedListItem);

                    $scope.interconnectAgentRoutingList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete Interconnect Smpp Agent Routing: ', response);
                });
            });
        };

        $scope.exportRecords = function (mimeType) {
            var srcUrl = '/smsc-gr-rest/configuration/v1/routing/interconnect-agent/export?response-content-type=' + mimeType;

            $log.debug('Downloading SMSC routing tables interconnect agent records. URL: ', srcUrl);

            ReportingExportService.showReport(srcUrl, mimeType.toUpperCase());
        };

    });

    SmscRoutingTablesInterconnectSmppAgentRoutingOperationsModule.controller('SmscRoutingTablesNewInterconnectSmppAgentRoutingOperationsCtrl', function ($scope, $state, $log, $translate, $filter, notification, $uibModal,
                                                                                                                                                                       SmscConfService, Restangular, interconnectSmppAgents) {
        $log.debug("SMSCRoutingTablesNewInterconnectSmppAgentRoutingOperationsCtrl");

        $scope.interconnectSmppAgentList = Restangular.stripRestangular(interconnectSmppAgents);
        $scope.interconnectAgentRouting = {};

        $scope.$watch('interconnectAgentRouting.addRangeStart', function () {
            $scope.form.addRangeEnd.$setValidity('ngMinValue', true);
        });
        $scope.$watch('interconnectAgentRouting.addRangeEnd', function () {
            $scope.form.addRangeStart.$setValidity('ngMaxValue', true);
        });

        $scope.save = function (interconnectAgentRouting) {
            var rangeItem = {
                "name": interconnectAgentRouting.interconnectAgent.name,
                "addRangeStart": interconnectAgentRouting.addRangeStart,
                "addRangeEnd": interconnectAgentRouting.addRangeEnd
            };

            SmscConfService.addInterconnectSmppAgentRouting(rangeItem).then(function (response) {
                $log.debug('Added Interconnect Smpp Agent Routing: ', response);

                var apiResponse = Restangular.stripRestangular(response);

                if (apiResponse.errorCode) {
                    var message = '';

                    if (apiResponse.errorMsg) {
                        if (apiResponse.errorMsg.indexOf('already') > -1) {
                            message = $translate.instant('Products.SMSC.Operations.RoutingTables.Messages.AlreadyDefinedError', {
                                range: rangeItem.addRangeStart + '_' + rangeItem.addRangeEnd
                            });
                        } else if (apiResponse.errorMsg.indexOf('Overlap') > -1) {
                            var msgObj = _.object(_.compact(_.map(apiResponse.errorMsg.split(';'), function (item) {
                                if (item) return item.split(/=(.+)?/);
                            })));
                            var definedRange = msgObj['forwardDestAddressRange.name'].split(',')[0];

                            message = $translate.instant('Products.SMSC.Operations.RoutingTables.Messages.RangeOverlappedError', {
                                range: definedRange
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

                    $state.go('products.smsc.operations.routingtables.interconnectagentrouting');
                }
            }, function (response) {
                $log.debug('Cannot add Interconnect Smpp Agent Routing: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go('products.smsc.operations.routingtables.interconnectagentrouting');
        };

    });

})();
