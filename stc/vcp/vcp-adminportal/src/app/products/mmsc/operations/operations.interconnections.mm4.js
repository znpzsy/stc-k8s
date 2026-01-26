(function () {

    'use strict';

    angular.module('adminportal.products.mmsc.operations.interconnections.mm4', [
        'adminportal.products.mmsc.operations.interconnections.mm4.routing'
    ]);

    var MMSCOperationsInterconnectionsMM4Module = angular.module('adminportal.products.mmsc.operations.interconnections.mm4');

    MMSCOperationsInterconnectionsMM4Module.config(function ($stateProvider) {

        $stateProvider.state('products.mmsc.operations.interconnections.mm4', {
            url: "/mm4",
            templateUrl: "products/mmsc/operations/operations.interconnections.mm4.html",
            controller: 'MMSCOperationsInterconnectionsMM4Ctrl',
            resolve: {
                operators: function (MmscOperationService) {
                    return MmscOperationService.getAllOperatorList();
                }
            }
        }).state('products.mmsc.operations.interconnections.mm4-new', {
            url: "/mm4-new",
            templateUrl: "products/mmsc/operations/operations.interconnections.mm4.details.html",
            controller: 'MMSCOperationsInterconnectionsMM4NewCtrl'
        }).state('products.mmsc.operations.interconnections.mm4-update', {
            url: "/mm4/:opId",
            templateUrl: "products/mmsc/operations/operations.interconnections.mm4.details.html",
            controller: 'MMSCOperationsInterconnectionsMM4UpdateCtrl',
            resolve: {
                operator: function (MmscOperationService, $stateParams) {
                    var appId = $stateParams.opId;
                    return MmscOperationService.getOperator(appId);
                }
            }
        });

    });

    MMSCOperationsInterconnectionsMM4Module.controller('MMSCOperationsInterconnectionsMM4Ctrl', function ($scope, $state, $log, $filter, $uibModal, notification, $translate, NgTableParams, NgTableService,
                                                                                                          ReportingExportService, UtilService, MmscOperationService, operators) {
        $log.debug('MMSCOperationsInterconnectionsMM4Ctrl');

        $scope.operatorList = {
            list: operators.operatorList
        };

        $scope.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "name": 'asc'
            }
        }, {
            total: $scope.operatorList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.operatorList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.operatorList.list;
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

        $scope.remove = function (data) {
            data.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                MmscOperationService.deleteOperator(data.id).then(function (response) {
                    $log.debug('Removed operator. Response: ', response);

                    if (response && (response.errorCode || response.code)) {
                        notification({
                            type: 'warning',
                            text: $translate.instant('CommonMessages.ApiError', {
                                errorCode: response.errorCode || response.code,
                                errorText: response.errorMsg || response.message
                            })
                        });
                    } else {
                        var deletedListItem = _.findWhere($scope.operatorList.list, {id: data.id});
                        $scope.operatorList.list = _.without($scope.operatorList.list, deletedListItem);

                        $scope.tableParams.reload();

                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });
                    }
                }, function (response) {
                    $log.debug('Cannot remove operator. Error: ', response);
                });

                data.rowSelected = false;
            }, function () {
                data.rowSelected = false;
            });
        };

        $scope.showIMSIAddressRouting = function (operator) {
            $uibModal.open({
                templateUrl: 'products/mmsc/operations/operations.interconnections.mm4.routing.modal.html',
                controller: 'MMSCOperationsInterconnectionsMM4RoutingCtrl',
                size: 'lg',
                resolve: {
                    key: function () {
                        return 'imsi';
                    },
                    opRouting: function () {
                        return MmscOperationService.getOperatorRouting('imsi', operator.id);
                    },
                    opIdParameter: function () {
                        return operator.id;
                    },
                    opNameParameter: function () {
                        return operator.name;
                    }
                }
            });
        };

        $scope.showMSISDNAddressRouting = function (operator) {
            $uibModal.open({
                templateUrl: 'products/mmsc/operations/operations.interconnections.mm4.routing.modal.html',
                controller: 'MMSCOperationsInterconnectionsMM4RoutingCtrl',
                size: 'lg',
                resolve: {
                    key: function () {
                        return 'msisdn';
                    },
                    opRouting: function () {
                        return MmscOperationService.getOperatorRouting('msisdn', operator.id);
                    },
                    opIdParameter: function () {
                        return operator.id;
                    },
                    opNameParameter: function () {
                        return operator.name;
                    }
                }
            });
        };

        $scope.exportRecords = function (mimeType) {
            var srcUrl = '/mmsc-operation-gr-rest/v1/operators/export?response-content-type=' + mimeType;

            $log.debug('Downloading MMSC interconnection records. URL: ', srcUrl);

            ReportingExportService.showReport(srcUrl, mimeType.toUpperCase());
        };

    });

    MMSCOperationsInterconnectionsMM4Module.controller('MMSCOperationsInterconnectionsMM4NewCtrl', function ($scope, $state, $log, $filter, $translate, MmscOperationService, STATUS_TYPES, INTERCONNECTIONS, notification, MMSC_DELIVERY_REPORT_POLICY) {
        $log.debug('MMSCOperationsInterconnectionsMM4NewCtrl');
        $scope.statusTypes = STATUS_TYPES;
        $scope.status = STATUS_TYPES[0];
        $scope.interconnections = INTERCONNECTIONS;
        $scope.operator = {
            operatorType: INTERCONNECTIONS[1]
        };
        $scope.deliveryReportPolicies = MMSC_DELIVERY_REPORT_POLICY;
        $scope.deliveryReportMOPolicy = MMSC_DELIVERY_REPORT_POLICY[1];
        $scope.deliveryReportMTPolicy = MMSC_DELIVERY_REPORT_POLICY[1];

        $scope.save = function () {
            if ($scope.status == STATUS_TYPES[0]) {
                $scope.operator.interworking = 'ENABLED';
            } else {
                $scope.operator.interworking = 'DISABLED';
            }
            $scope.operator.sendDeliveryReport = MMSC_DELIVERY_REPORT_POLICY.indexOf($scope.deliveryReportMTPolicy);
            $scope.operator.requestDeliveryReport = MMSC_DELIVERY_REPORT_POLICY.indexOf($scope.deliveryReportMOPolicy);

            MmscOperationService.createOperator($scope.operator).then(function (response) {
                $log.debug('Operator is created. Response: ', response);

                if (response && (response.errorCode || response.code)) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: response.errorCode || response.code,
                            errorText: response.errorMsg || response.message
                        })
                    });
                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                    $scope.go('products.mmsc.operations.interconnections.mm4');
                }
            }, function (response) {
                $log.debug('Cannot create operator. Error: ', response);
            });
        };

        $scope.cancel = function () {
            $scope.go('products.mmsc.operations.interconnections.mm4');
        };
    });

    MMSCOperationsInterconnectionsMM4Module.controller('MMSCOperationsInterconnectionsMM4UpdateCtrl', function ($scope, $state, $log, $filter, $translate, notification, MmscOperationService, operator, STATUS_TYPES, INTERCONNECTIONS, MMSC_DELIVERY_REPORT_POLICY) {
        $log.debug('MMSCOperationsInterconnectionsMM4UpdateCtrl');
        $scope.operator = operator;
        if ($scope.operator.interworking == 'ENABLED') {
            $scope.status = STATUS_TYPES[0];
        } else {
            $scope.status = STATUS_TYPES[1];
        }
        $scope.statusTypes = STATUS_TYPES;
        $scope.interconnections = INTERCONNECTIONS;
        $scope.deliveryReportPolicies = MMSC_DELIVERY_REPORT_POLICY;
        $scope.deliveryReportMOPolicy = MMSC_DELIVERY_REPORT_POLICY[operator.requestDeliveryReport];
        $scope.deliveryReportMTPolicy = MMSC_DELIVERY_REPORT_POLICY[operator.sendDeliveryReport];
        $scope.originalOperator = angular.copy($scope.operator);
        $scope.originalStatus = angular.copy($scope.status);
        $scope.isConfigurationNotChanged = function () {
            return angular.equals($scope.originalOperator, $scope.operator)
                && angular.equals($scope.originalStatus, $scope.status)
                && angular.equals(MMSC_DELIVERY_REPORT_POLICY[operator.sendDeliveryReport], $scope.deliveryReportMTPolicy)
                && angular.equals(MMSC_DELIVERY_REPORT_POLICY[operator.requestDeliveryReport], $scope.deliveryReportMOPolicy);
        };

        $scope.save = function () {
            if ($scope.status == STATUS_TYPES[0]) {
                $scope.operator.interworking = 'ENABLED';
            } else {
                $scope.operator.interworking = 'DISABLED';
            }
            $scope.operator.sendDeliveryReport = MMSC_DELIVERY_REPORT_POLICY.indexOf($scope.deliveryReportMTPolicy);
            $scope.operator.requestDeliveryReport = MMSC_DELIVERY_REPORT_POLICY.indexOf($scope.deliveryReportMOPolicy);
            MmscOperationService.updateOperator($scope.operator.id, $scope.operator).then(function (response) {
                $log.debug('Operator is updated. Response: ', response);

                if (response && (response.errorCode || response.code)) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: response.errorCode || response.code,
                            errorText: response.errorMsg || response.message
                        })
                    });
                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $scope.go('products.mmsc.operations.interconnections.mm4');
                }
            }, function (response) {
                $log.debug('Cannot update operator. Error: ', response);
            });
        };

        $scope.cancel = function () {
            $scope.go('products.mmsc.operations.interconnections.mm4');
        };
    });

    MMSCOperationsInterconnectionsMM4Module.constant('INTERCONNECTIONS', [
        'OWN', 'NATIONAL', 'INTERNATIONAL'
    ]);

})();
