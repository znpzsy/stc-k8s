(function () {

    'use strict';

    angular.module('adminportal.subsystems.contentmanagement.dashboards.dsp', []);

    var ContentManagementDashboardsDSPModule = angular.module('adminportal.subsystems.contentmanagement.dashboards.dsp');

    ContentManagementDashboardsDSPModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.contentmanagement.dashboards.dsp', {
            url: "/dsp",
            templateUrl: "subsystems/contentmanagement/dashboards/dashboards.dsp.html",
            controller: 'ContentManagementDashboardsDSPCtrl'
        });

    });

    ContentManagementDashboardsDSPModule.controller('ContentManagementDashboardsDSPCtrl', function ($scope, $log, $controller, $interval, $q, $state, $filter, Restangular, AdmPortalDashboardPromiseTracker,
                                                                                                    PlotService, ContentManagementService) {
        $log.debug("ContentManagementDashboardsDSPCtrl");

        var initialize = function () {
            $scope.tiles = {
                totalCategories: 0,
                totalTypes: 0,
                totalUploads: 0,
                totalContentFiles: 0,
                totalUpdates: 0,
                totalDownloads: 0
            };

            $scope.groupByCategoryData = [];
            $scope.groupByTypeData = [];
            $scope.groupByStatusData = [];
        };

        initialize();

        var dashboarding = function () {
            ContentManagementService.getDashboard(AdmPortalDashboardPromiseTracker).then(function (response) {
                var detail = response.detail;

                if (detail) {
                    // Tiles
                    $scope.tiles.totalCategories = detail.totalCategories ? detail.totalCategories : 0;
                    $scope.tiles.totalTypes = detail.totalTypes ? detail.totalTypes : 0;
                    $scope.tiles.totalUploads = detail.totalUploads ? detail.totalUploads : 0;
                    $scope.tiles.totalContentFiles = detail.totalContentFiles ? detail.totalContentFiles : 0;
                    $scope.tiles.totalUpdates = detail.totalUpdates ? detail.totalUpdates : 0;
                    $scope.tiles.totalDownloads = detail.totalDownloads ? detail.totalDownloads : 0;

                    // Pie Charts
                    $scope.groupByCategoryData = [];
                    _.each(detail.groupByCategory, function (groupByCategory) {
                        if (groupByCategory.count > 0) {
                            $scope.groupByCategoryData.push({
                                label: groupByCategory.key,
                                data: groupByCategory.count
                            });
                        }
                    });

                    $scope.groupByTypeData = [];
                    _.each(detail.groupByType, function (groupByType) {
                        if (groupByType.count > 0) {
                            $scope.groupByTypeData.push({
                                label: groupByType.key,
                                data: groupByType.count
                            });
                        }
                    });

                    $scope.groupByStatusData = [];
                    _.each(detail.groupByStatus, function (groupByStatus) {
                        if (groupByStatus.count > 0) {
                            $scope.groupByStatusData.push({
                                label: groupByStatus.key,
                                data: groupByStatus.count
                            });
                        }
                    });

                    $scope.groupByCategoryData = PlotService.getLargeDataGroupByValue($scope.groupByCategoryData, 10);
                    PlotService.drawPie('#pie-chart1', $scope.groupByCategoryData, true);

                    $scope.groupByTypeData = PlotService.getLargeDataGroupByValue($scope.groupByTypeData, 10);
                    PlotService.drawPie('#pie-chart2', $scope.groupByTypeData, true);

                    $scope.groupByStatusData = PlotService.getLargeDataGroupByValue($scope.groupByStatusData, 10);
                    PlotService.drawPie('#pie-chart3', $scope.groupByStatusData, true);
                } else {
                    initialize();
                }
            }, function (response) {
                initialize();
            });
        };

        dashboarding();

        var rebuild = $interval(function () {
            $log.debug('reloading');
            dashboarding();
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
