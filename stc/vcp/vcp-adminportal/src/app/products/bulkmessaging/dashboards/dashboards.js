(function () {

    'use strict';

    angular.module('adminportal.products.bulkmessaging.dashboards', []);

    var BulkMessagingDashboardsModule = angular.module('adminportal.products.bulkmessaging.dashboards');

    BulkMessagingDashboardsModule.config(function ($stateProvider) {

        $stateProvider.state('products.bulkmessaging.dashboards', {
            url: "/dashboard",
            templateUrl: "products/bulkmessaging/dashboards/dashboards.html",
            controller: 'BulkMessagingDashboardsCtrl',
            data: {
                permissions: [
                    'ALL__DASHBOARD_READ'
                ]
            },
            resolve: {
                organizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsCustom(false, true, [CMPFService.OPERATOR_PROFILE]);
                },
                userAccounts: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getUserAccounts(0, DEFAULT_REST_QUERY_LIMIT, true);
                }
            }
        });

    });

    BulkMessagingDashboardsModule.controller('BulkMessagingDashboardsCtrl', function ($scope, $log, $q, $interval, BulkMessagingDashboardService, Restangular, PlotService,
                                                                                      organizations, userAccounts, AdmPortalDashboardPromiseTracker) {
        $log.debug("BulkMessagingDashboardsCtrl");

        // Organization list
        $scope.organizationList = organizations.organizations;

        // User account list
        $scope.userAccountList = userAccounts.userAccounts;

        var initialize = function () {
            $scope.tileInfo = {
                sms: {
                    submitted: 0,
                    accepted: 0,
                    delivered: 0,
                    failed: 0,
                    queued: 0,
                    tile6: 'TBD'
                },
                mm1: {
                    submitted: 0,
                    accepted: 0,
                    delivered: 0,
                    failed: 0,
                    read: 0,
                    downloaded: 0
                },
                mm7: {
                    submitted: 0,
                    accepted: 0,
                    delivered: 0,
                    failed: 0,
                    read: 0,
                    downloaded: 0
                },
                ivr: {
                    submitted: 0,
                    answered: 0,
                    delivered: 0,
                    failed: 0,
                    queued: 0,
                    tile6: 'TBD'
                }
            };

            $scope.smsOrganizationTrafficData = [];
            $scope.smsUserTrafficData = [];
            $scope.smsMsgErrorData = [];

            $scope.mm1OrganizationTrafficData = [];
            $scope.mm1UserTrafficData = [];
            $scope.mm1MsgErrorData = [];

            $scope.mm7OrganizationTrafficData = [];
            $scope.mm7UserTrafficData = [];
            $scope.mm7MsgErrorData = [];

            $scope.ivrOrganizationTrafficData = [];
            $scope.ivrUserTrafficData = [];
            $scope.ivrMsgErrorData = [];
        };

        var preparePieChartData = function (dataArray, keyField, list, objectProperty) {
            var pieChartArray = [];

            for (var i = 0; i < dataArray.length; i++) {
                var entry = dataArray[i];

                var label = 'N/A';
                if (list) {
                    var object = _.findWhere(list, {id: Number(entry[keyField])});
                    if (object) {
                        label = object[objectProperty];
                    }
                } else {
                    label = entry.key;
                }
                label = s(label).trim().value();

                if (entry.value > 0) {
                    pieChartArray.push({
                        label: label,
                        data: Number(entry.value)
                    });
                }
            }

            return pieChartArray;
        };

        initialize();

        var dashboarding = function (promiseTracker) {
            BulkMessagingDashboardService.getSMSDashboard(promiseTracker).then(function (smsDashboardResponse) {
                $log.debug('SMS Dashboard: ', smsDashboardResponse);

                $scope.smsOrganizationTrafficData = [];
                $scope.smsUserTrafficData = [];
                $scope.smsMsgErrorData = [];

                // SMS Dashboard
                $scope.tileInfo.sms.submitted = smsDashboardResponse.totalSmsMetric.submitted;
                $scope.tileInfo.sms.accepted = smsDashboardResponse.totalSmsMetric.accepted;
                $scope.tileInfo.sms.delivered = smsDashboardResponse.totalSmsMetric.delivered;
                $scope.tileInfo.sms.failed = smsDashboardResponse.totalSmsMetric.failed;
                $scope.tileInfo.sms.queued = smsDashboardResponse.totalSmsMetric.queued;
                // SMS Pie chart data
                $scope.smsOrganizationTrafficData = preparePieChartData(smsDashboardResponse.organizationTraffic, 'key', $scope.organizationList, 'name');
                $scope.smsOrganizationTrafficData = PlotService.getLargeDataGroupByValue($scope.smsOrganizationTrafficData, 10);
                PlotService.drawPie('#pie-sms-chart1', $scope.smsOrganizationTrafficData, true);
                $scope.smsUserTrafficData = preparePieChartData(smsDashboardResponse.userTraffic, 'key', $scope.userAccountList, 'userName');
                $scope.smsUserTrafficData = PlotService.getLargeDataGroupByValue($scope.smsUserTrafficData, 10);
                PlotService.drawPie('#pie-sms-chart2', $scope.smsUserTrafficData, true);
                $scope.smsMsgErrorData = preparePieChartData(smsDashboardResponse.msgError);
                $scope.smsMsgErrorData = PlotService.getLargeDataGroupByValue($scope.smsMsgErrorData, 10);
                PlotService.drawPie('#pie-sms-chart3', $scope.smsMsgErrorData, true);
            }, function () {
                $scope.smsOrganizationTrafficData = [];
                $scope.smsUserTrafficData = [];
                $scope.smsMsgErrorData = [];
            });

            BulkMessagingDashboardService.getMM1Dashboard(promiseTracker).then(function (mm1DashboardResponse) {
                $log.debug('MSG Dashboard: ', mm1DashboardResponse);

                $scope.mm1OrganizationTrafficData = [];
                $scope.mm1UserTrafficData = [];
                $scope.mm1MsgErrorData = [];

                // MM1 Dashboard
                $scope.tileInfo.mm1.submitted = mm1DashboardResponse.totalMmsMetric.submitted;
                $scope.tileInfo.mm1.accepted = mm1DashboardResponse.totalMmsMetric.accepted;
                $scope.tileInfo.mm1.delivered = mm1DashboardResponse.totalMmsMetric.delivered;
                $scope.tileInfo.mm1.failed = mm1DashboardResponse.totalMmsMetric.failed;
                $scope.tileInfo.mm1.read = mm1DashboardResponse.totalMmsMetric.read;
                $scope.tileInfo.mm1.downloaded = mm1DashboardResponse.totalMmsMetric.downloaded;
                // MM1 Pie chart data
                $scope.mm1OrganizationTrafficData = preparePieChartData(mm1DashboardResponse.organizationTraffic, 'key', $scope.organizationList, 'name');
                $scope.mm1OrganizationTrafficData = PlotService.getLargeDataGroupByValue($scope.mm1OrganizationTrafficData, 10);
                PlotService.drawPie('#pie-mm1-chart1', $scope.mm1OrganizationTrafficData, true);
                $scope.mm1UserTrafficData = preparePieChartData(mm1DashboardResponse.userTraffic, 'key', $scope.userAccountList, 'userName');
                $scope.mm1UserTrafficData = PlotService.getLargeDataGroupByValue($scope.mm1UserTrafficData, 10);
                PlotService.drawPie('#pie-mm1-chart2', $scope.mm1UserTrafficData, true);
                $scope.mm1MsgErrorData = preparePieChartData(mm1DashboardResponse.mm1Error);
                $scope.mm1MsgErrorData = PlotService.getLargeDataGroupByValue($scope.mm1MsgErrorData, 10);
                PlotService.drawPie('#pie-mm1-chart3', $scope.mm1MsgErrorData, true);
            }, function () {
                $scope.mm1OrganizationTrafficData = [];
                $scope.mm1UserTrafficData = [];
                $scope.mm1MsgErrorData = [];
            });

            BulkMessagingDashboardService.getMM7Dashboard(promiseTracker).then(function (mm7DashboardResponse) {
                $log.debug('MMS Dashboard: ', mm7DashboardResponse);

                $scope.mm7OrganizationTrafficData = [];
                $scope.mm7UserTrafficData = [];
                $scope.mm7MsgErrorData = [];

                // MM7 Dashboard
                $scope.tileInfo.mm7.submitted = mm7DashboardResponse.totalMmsMetric.submitted;
                $scope.tileInfo.mm7.accepted = mm7DashboardResponse.totalMmsMetric.accepted;
                $scope.tileInfo.mm7.delivered = mm7DashboardResponse.totalMmsMetric.delivered;
                $scope.tileInfo.mm7.failed = mm7DashboardResponse.totalMmsMetric.failed;
                $scope.tileInfo.mm7.read = mm7DashboardResponse.totalMmsMetric.read;
                $scope.tileInfo.mm7.downloaded = mm7DashboardResponse.totalMmsMetric.downloaded;
                // MM7 Pie chart data
                $scope.mm7OrganizationTrafficData = preparePieChartData(mm7DashboardResponse.organizationTraffic, 'key', $scope.organizationList, 'name');
                $scope.mm7OrganizationTrafficData = PlotService.getLargeDataGroupByValue($scope.mm7OrganizationTrafficData, 10);
                PlotService.drawPie('#pie-mm7-chart1', $scope.mm7OrganizationTrafficData, true);
                $scope.mm7UserTrafficData = preparePieChartData(mm7DashboardResponse.userTraffic, 'key', $scope.userAccountList, 'userName');
                $scope.mm7UserTrafficData = PlotService.getLargeDataGroupByValue($scope.mm7UserTrafficData, 10);
                PlotService.drawPie('#pie-mm7-chart2', $scope.mm7UserTrafficData, true);
                $scope.mm7MsgErrorData = preparePieChartData(mm7DashboardResponse.msgError);
                $scope.mm7MsgErrorData = PlotService.getLargeDataGroupByValue($scope.mm7MsgErrorData, 10);
                PlotService.drawPie('#pie-mm7-chart3', $scope.mm7MsgErrorData, true);
            }, function () {
                $scope.mm7OrganizationTrafficData = [];
                $scope.mm7UserTrafficData = [];
                $scope.mm7MsgErrorData = [];
            });

            /*
            BulkMessagingDashboardService.getIVRDashboard(promiseTracker).then(function (ivrDashboardResponse) {
                $log.debug('IVR Dashboard: ', ivrDashboardResponse);

                $scope.ivrOrganizationTrafficData = [];
                $scope.ivrUserTrafficData = [];
                $scope.ivrMsgErrorData = [];

                // IVR Dashboard
                $scope.tileInfo.ivr.submitted = ivrDashboardResponse.totalIvrMetric.submitted;
                $scope.tileInfo.ivr.answered = ivrDashboardResponse.totalIvrMetric.answered;
                $scope.tileInfo.ivr.delivered = ivrDashboardResponse.totalIvrMetric.delivered;
                $scope.tileInfo.ivr.failed = ivrDashboardResponse.totalIvrMetric.failed;
                $scope.tileInfo.ivr.queued = ivrDashboardResponse.totalIvrMetric.queued;
                // IVR Pie chart data
                $scope.ivrOrganizationTrafficData = preparePieChartData(ivrDashboardResponse.organizationTraffic, 'key', $scope.organizationList, 'name');
                $scope.ivrOrganizationTrafficData = PlotService.getLargeDataGroupByValue($scope.ivrOrganizationTrafficData, 10);
                PlotService.drawPie('#pie-ivr-chart1', $scope.ivrOrganizationTrafficData, true);
                $scope.ivrUserTrafficData = preparePieChartData(ivrDashboardResponse.userTraffic, 'key', $scope.userAccountList, 'userName');
                $scope.ivrUserTrafficData = PlotService.getLargeDataGroupByValue($scope.ivrUserTrafficData, 10);
                PlotService.drawPie('#pie-ivr-chart2', $scope.ivrUserTrafficData, true);
                $scope.ivrMsgErrorData = preparePieChartData(ivrDashboardResponse.msgError);
                $scope.ivrMsgErrorData = PlotService.getLargeDataGroupByValue($scope.ivrMsgErrorData, 10);
                PlotService.drawPie('#pie-ivr-chart3', $scope.ivrMsgErrorData, true);
            }, function () {
                $scope.ivrOrganizationTrafficData = [];
                $scope.ivrUserTrafficData = [];
                $scope.ivrMsgErrorData = [];
            });
            */
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
