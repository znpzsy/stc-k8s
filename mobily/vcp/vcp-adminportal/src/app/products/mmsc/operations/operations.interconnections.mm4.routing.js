(function () {

    'use strict';

    angular.module('adminportal.products.mmsc.operations.interconnections.mm4.routing', []);

    var MMSCOperationsInterconnectionsMM4RoutingModule = angular.module('adminportal.products.mmsc.operations.interconnections.mm4.routing');

    MMSCOperationsInterconnectionsMM4RoutingModule.controller('MMSCOperationsInterconnectionsMM4RoutingCtrl', function ($scope, $log, $filter, notification, $translate, $uibModal, $uibModalInstance, MmscOperationService, Restangular,
                                                                                                                        NgTableParams, opIdParameter, opNameParameter, opRouting, key) {
        $log.debug('MMSCOperationsInterconnectionsMM4RoutingCtrl');

        $scope.ranges = opRouting.ranges;
        $scope.opName = opNameParameter;
        $scope.key = key;

        $scope.pageHeaderKey = 'Products.MMSC.Operations.Interconnections.Routings.MSISDNPageHeader';
        if ($scope.key === 'imsi') {
            $scope.pageHeaderKey = 'Products.MMSC.Operations.Interconnections.Routings.IMSIPageHeader';
        }

        $scope.range = {start: '', end: ''};

        $log.debug('Operator routing ranges :', $scope.ranges);

        $scope.tableParams = new NgTableParams({
            page: 1,
            count: 10
        }, {
            total: 0,
            $scope: $scope,
            getData: function ($defer, params) {
                var orderedData = params.sorting() ? $filter('orderBy')($scope.ranges, params.orderBy()) : $scope.ranges;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

        $scope.addNewRage = function (start, end) {
            var rangePattern = start + '-' + end;
            MmscOperationService.addOperatorRouting($scope.key, opIdParameter, rangePattern).then(function (response) {
                $log.debug('Added routing :', response, ', key: ', $scope.key);

                var apiResponse = Restangular.stripRestangular(response);

                if (apiResponse.code) {
                    var message = '';

                    if (apiResponse.message) {
                        if (apiResponse.message.indexOf('Overlap') > -1) {
                            var msgObj = _.object(_.compact(_.map(apiResponse.message.split(';'), function (item) {
                                if (item) return item.split(/=(.+)?/);
                            })));

                            var msgObjKey = 'destinationaddressrange.adressRangeStart'
                            if ($scope.key === 'imsi') {
                                msgObjKey = 'destinationImsiRange.imsiRangeStart';
                            }

                            var definedRange = msgObj[msgObjKey].split(/,.+?=/);
                            var definedRangeStart = definedRange[0];
                            var definedRangeEnd = definedRange[1];

                            message = $translate.instant('Products.MMSC.Operations.Interconnections.Routings.Messages.RangeOverlappedError', {
                                range: definedRangeStart + '_' + definedRangeEnd
                            });
                        } else {
                            message = apiResponse.message;
                        }
                    }

                    notification({
                        type: 'warning',
                        text: message
                    });
                } else {
                    $scope.range = {start: '', end: ''};

                    $scope.ranges.push({
                        start: start,
                        end: end
                    })
                    $scope.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }
            }, function (response) {
                $log.debug('Cannot add routing :', response, ', key: ', $scope.key);
            });
        };

        // Remove routing
        $scope.remove = function (routing) {
            routing.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing routing: ', routing);

                var rangePattern = routing.start + '-' + routing.end;
                MmscOperationService.deleteOperatorRouting($scope.key, opIdParameter, rangePattern).then(function (response) {
                    $log.debug('Deleted routing: ', response, ', key: ', $scope.key);

                    var deletedListItem = _.findWhere($scope.ranges, {start: routing.start, end: routing.end});
                    $scope.ranges = _.without($scope.ranges, deletedListItem);

                    $scope.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                }, function (response) {
                    $log.debug('Cannot delete routing: ', response, ', key: ', $scope.key);
                });

                routing.rowSelected = false;
            }, function () {
                routing.rowSelected = false;
            });
        };

        $scope.ok = function () {
            $uibModalInstance.close();
        };
    });

})();
