(function () {

    'use strict';

    angular.module('adminportal.workflows.dashboards', []);

    var WorkflowsDashboardsModule = angular.module('adminportal.workflows.dashboards');

    WorkflowsDashboardsModule.config(function ($stateProvider) {

        $stateProvider.state('workflows.dashboards', {
            url: "/dashboard",
            templateUrl: "workflows/dashboards/dashboards.html",
            controller: 'WorkflowsDashboardsCtrl',
            data: {
                permissions: [
                    'ALL__DASHBOARD_READ'
                ]
            }
        });

    });

    WorkflowsDashboardsModule.controller('WorkflowsDashboardsCtrl', function ($scope, $log, $interval, $q, Restangular, PlotService,
                                                                              AdmPortalDashboardPromiseTracker, WorkflowsService) {
        $log.debug("WorkflowsDashboardsCtrl");

        $scope.tileInfo = {
            initiated: 0,
            pending: 0,
            processed: 0,
            approved: 0,
            rejected: 0,
            cancelled: 0
        };

        var preparePieChartArray = function (dataArray, labelProperty, dataProperty) {
            var pieChartArray = [];

            _.each(dataArray, function (pieChartItem) {
                if (pieChartItem[dataProperty] > 0) {
                    pieChartArray.push({
                        label: pieChartItem[labelProperty],
                        data: pieChartItem[dataProperty]
                    });
                }
            });

            return pieChartArray;
        };

        var dashboarding = function (promiseTracker) {
            WorkflowsService.getDashboard(promiseTracker).then(function (response) {
                $scope.tileInfo.initiated = response.initiated;
                $scope.tileInfo.pending = response.pending;
                $scope.tileInfo.processed = response.processed;
                $scope.tileInfo.approved = response.approved;
                $scope.tileInfo.rejected = response.rejected;
                $scope.tileInfo.cancelled = response.cancelled;

                $scope.tasksByOrganizationData = preparePieChartArray(response.groupByPartner, 'orgId', 'count');
                $scope.tasksByOrganizationData = PlotService.getLargeDataGroupByValue($scope.tasksByOrganizationData, 10);
                PlotService.drawPie('#pie-chart1', $scope.tasksByOrganizationData, true);

                $scope.tasksByUserData = preparePieChartArray(response.groupByUser, 'userId', 'count');
                $scope.tasksByUserData = PlotService.getLargeDataGroupByValue($scope.tasksByUserData, 10);
                PlotService.drawPie('#pie-chart2', $scope.tasksByUserData, true);

                $scope.tasksByTypeData = preparePieChartArray(response.groupByFlow, 'flow', 'count');
                $scope.tasksByTypeData = PlotService.getLargeDataGroupByValue($scope.tasksByTypeData, 10);
                PlotService.drawPie('#pie-chart3', $scope.tasksByTypeData, true);
            }, function (response) {
                $log.debug('Cannot read workflow dashboard. Error: ', response);

                $scope.tasksByOrganizationData = [];
                $scope.tasksByUserData = [];
                $scope.tasksByTypeData = [];
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
