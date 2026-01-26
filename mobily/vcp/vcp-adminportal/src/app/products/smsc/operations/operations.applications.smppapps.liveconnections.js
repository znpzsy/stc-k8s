(function () {

    'use strict';

    angular.module('adminportal.products.smsc.operations.applications.smppapps.liveconnections', []);

    var SmscApplicationsSMPPLiveConnectionsOperationsModule = angular.module('adminportal.products.smsc.operations.applications.smppapps.liveconnections');

    SmscApplicationsSMPPLiveConnectionsOperationsModule.controller('SmscApplicationsSMPPLiveConnectionsOperationsCtrl', function ($scope, $uibModalInstance, $log, $filter, NgTableParams,
                                                                                                                                                Restangular, SmscProvService, liveSmppConnections) {
        $log.debug("SMSCApplicationsSMPPLiveConnectionsOperationsCtrl");

        liveSmppConnections = Restangular.stripRestangular(liveSmppConnections);
        _.each(liveSmppConnections, function (liveSmppConnection) {
            liveSmppConnection.localAddress = liveSmppConnection.localIP.replace(/\//g, '');
            liveSmppConnection.remoteAddress = liveSmppConnection.remoteIP.replace(/\//g, '');
        });

        // SMPP live connection list
        $scope.liveSmppConnectionList = {
            list: liveSmppConnections,
            tableParams: {}
        };

        $scope.liveSmppConnectionList.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "connectionEstablishedAt": 'desc' // initial sorting
            }
        }, {
            total: $scope.liveSmppConnectionList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var orderedData = params.sorting() ? $filter('orderBy')($scope.liveSmppConnectionList.list, params.orderBy()) : $scope.liveSmppConnectionList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - SMPP live connection list

        $scope.ok = function () {
            $uibModalInstance.close();
        };
    });

})();
