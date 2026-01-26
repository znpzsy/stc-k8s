(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.dashboards', []);

    var AntiSpamSMSDashboardsModule = angular.module('adminportal.products.antispamsms.dashboards');

    AntiSpamSMSDashboardsModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.dashboards', {
            url: "/dashboard",
            templateUrl: "products/antispamsms/dashboards/dashboards.html",
            controller: 'AntiSpamSMSDashboardsCtrl'
        });

    });

    AntiSpamSMSDashboardsModule.controller('AntiSpamSMSDashboardsCtrl', function ($scope, $log, $filter, $interval, SMSAntiSpamConfigService, Restangular, PlotService,
                                                                                  AdmPortalDashboardPromiseTracker) {
        $log.debug("AntiSpamSMSDashboardsCtrl");

        $scope.tileInfo = {
            moFsmBlockRatio: 0,
            moFsmRate: 0,
            mtFsmBlockRatio: 0,
            mtFsmRate: 0,
            sriSmMtFsmBlockRatio: 0,
            sriSmRate: 0
        };

        var moRejectCounterFields = [
            {name: 'counter', label: 'Counter'},
            {name: 'screening', label: 'Screening'},
            {name: 'moFraudInboundRoamer', label: 'MO Inbound Roamer Fraud'},
            {name: 'moFraudOutboundRoamer', label: 'MO Outbound Roamer Fraud'}
        ];

        var mtRejectCounterFields = [
            {name: 'counter', label: 'Counter'},
            {name: 'screening', label: 'Screening'},
            {name: 'mtFraud', label: 'MT Fraud'},
            {name: 'fraudMissingSRISM', label: 'Missing SRI-SM'},
            {name: 'internationalAppBasedTraffic', label: 'Intl App Based Traffic'},
            {name: 'internationMtTrafficToInboundRoamer', label: 'Intl MT Traffic to Inbound Roamer'}
        ];

        var sriRejectCounterFields = [
            {name: 'srismFilter', label: 'SRI-SM Filter'},
            {name: 'systemFailure', label: 'System Failure'},
            {name: 'unexpectedDataValue', label: 'Unexpected Data Value'},
            {name: 'facilityNotSupported', label: 'Not Supported'},
            {name: 'smDeliveryFailure', label: 'SM Delivery Failure'},
            {name: 'dataMissing', label: 'Missing Data'},
            {name: 'unidentifiedSubscriber', label: 'Unidentified Subscriber'},
            {name: 'illegalSubscriber', label: 'Illegal Subscriber'},
            {name: 'teleserviceNotProvisioned', label: 'Service Not Provisioned'},
            {name: 'illegalEquipment', label: 'Illegal Equipment'},
            {name: 'callBarred', label: 'Call Barred'},
            {name: 'subscriberBusyForMT', label: 'Subscriber Busy for MT'},
            {name: 'absentSubscriberSM', label: 'Absent Subscriber SM'}
        ];

        var dashboarding = function (promiseTracker) {

            SMSAntiSpamConfigService.getDashboard(promiseTracker).then(function (response) {
                $log.debug('SMS Anti Spam Dashboard: ', response);

                var apiResponse = Restangular.stripRestangular(response);

                // Values of the pie charts.
                $scope.moRejectCounterData = [];
                var moRejectCounter = apiResponse.pieChartInfo.moRejectCounter;
                _.each(moRejectCounterFields, function (field) {
                    var value = moRejectCounter[field.name];
                    if (value) {
                        $scope.moRejectCounterData.push({
                            label: field.label,
                            data: value
                        });
                    }
                });

                $scope.mtRejectCounterData = [];
                var mtRejectCounter = apiResponse.pieChartInfo.mtRejectCounter;
                _.each(mtRejectCounterFields, function (field) {
                    var value = mtRejectCounter[field.name];
                    if (value) {
                        $scope.mtRejectCounterData.push({
                            label: field.label,
                            data: value
                        });
                    }
                });

                $scope.sriRejectCounterData = [];
                var sriRejectCounter = apiResponse.pieChartInfo.sriRejectCounter;
                _.each(sriRejectCounterFields, function (field) {
                    var value = sriRejectCounter[field.name];
                    if (value) {
                        $scope.sriRejectCounterData.push({
                            label: field.label,
                            data: value
                        });
                    }
                });

                // Values of the tiles.
                $scope.tileInfo = apiResponse.tileInfo;

                PlotService.drawPie('#pie-chart1', $scope.moRejectCounterData, true);
                PlotService.drawPie('#pie-chart2', $scope.mtRejectCounterData, true);
                PlotService.drawPie('#pie-chart3', $scope.sriRejectCounterData);
            }, function (response) {
                $scope.moRejectCounterData = [];
                $scope.mtRejectCounterData = [];
                $scope.sriRejectCounterData = [];

                $log.error('Cannot read statistics. Error: ', response);
            });
        };

        dashboarding();

        var rebuild = $interval(function () {
            $log.debug('reloading');
            dashboarding(AdmPortalDashboardPromiseTracker);
        }, 90000);

        $scope.$on('$destroy', function () {
            if (angular.isDefined(rebuild)) {
                $log.debug('Cancelled timer');
                $interval.cancel(rebuild);
                rebuild = undefined;
            }
        });

    });

})();
