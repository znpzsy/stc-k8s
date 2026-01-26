(function () {

    'use strict';

    angular.module('adminportal.products.bulkmessaging.campaigns', []);

    var BulkMessagingCampaignsModule = angular.module('adminportal.products.bulkmessaging.campaigns');

    BulkMessagingCampaignsModule.config(function ($stateProvider) {

        $stateProvider.state('products.bulkmessaging.campaigns', {
            url: "/campaigns",
            templateUrl: "products/bulkmessaging/campaigns/campaigns.html",
            controller: 'BulkMessagingCampaignsCtrl',
            data: {
                permissions: [
                    'BMS__CAMPAIGNS_READ'
                ]
            },
            resolve: {
                organizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizations(false, true, [CMPFService.OPERATOR_PROFILE]);
                }
            }
        });

    });

    BulkMessagingCampaignsModule.controller('BulkMessagingCampaignsCtrl', function ($scope, $log, $q, $interval, BulkMessagingDashboardService, Restangular, PlotService,
                                                                                    AdmPortalDashboardPromiseTracker, organizations) {
        $log.debug("BulkMessagingCampaignsCtrl");

        // Organization list
        $scope.organizationList = organizations.organizations;

        var initialize = function () {
            $scope.tileInfo = {
                executing: 0,
                completed: 0,
                paused: 0,
                cancelled: 0,
                scheduled: 0,
                reserved: 0
            };

            $scope.campaignsByOrganizationData = {active: [], scheduled: [], completed: [], cancelled: []};
            $scope.campaignsByUserData = {active: [], scheduled: [], completed: [], cancelled: []};
            $scope.campaignsByTypeData = {active: [], scheduled: [], completed: [], cancelled: []};
        };

        var preparePieChartData = function (dataArray, keyField, list) {
            var pieChartArray = {
                active: [],
                scheduled: [],
                completed: [],
                cancelled: []
            };

            for (var i = 0; i < dataArray.length; i++) {
                var entry = dataArray[i];

                var label = 'N/A';
                if (list) {
                    var organization = _.findWhere(list, {id: Number(entry[keyField])});
                    if (organization) {
                        label = organization.name;
                    }
                } else {
                    label = entry[keyField];
                }
                label = s(label).trim().value();

                if (entry.active > 0) {
                    pieChartArray.active.push({
                        label: label,
                        data: Number(entry.active)
                    });
                }

                if (entry.scheduled > 0) {
                    pieChartArray.scheduled.push({
                        label: label,
                        data: Number(entry.scheduled)
                    });
                }

                if (entry.completed > 0) {
                    pieChartArray.completed.push({
                        label: label,
                        data: Number(entry.completed)
                    });
                }

                if (entry.cancelled > 0) {
                    pieChartArray.cancelled.push({
                        label: label,
                        data: Number(entry.cancelled)
                    });
                }
            }

            return pieChartArray;
        };

        initialize();

        var dashboarding = function (promiseTracker) {
            BulkMessagingDashboardService.getCampaignsDashboard(promiseTracker).then(function (response) {
                $log.debug('Campaigns Dashboard: ', response);

                $scope.tileInfo = _.defaults(response.campaignsMetric, $scope.tileInfo);

                $scope.campaignsByOrganizationData = {active: [], scheduled: [], completed: [], cancelled: []};
                $scope.campaignsByUserData = {active: [], scheduled: [], completed: [], cancelled: []};
                $scope.campaignsByTypeData = {active: [], scheduled: [], completed: [], cancelled: []};

                // Pie chart data
                $scope.campaignsByOrganizationData = preparePieChartData(response.organizations, 'organizationId', $scope.organizationList);
                $scope.campaignsByOrganizationData.active = PlotService.getLargeDataGroupByValue($scope.campaignsByOrganizationData.active, 10);
                PlotService.drawPie('#pie-chart10', $scope.campaignsByOrganizationData.active, true);
                $scope.campaignsByOrganizationData.scheduled = PlotService.getLargeDataGroupByValue($scope.campaignsByOrganizationData.scheduled, 10);
                PlotService.drawPie('#pie-chart1', $scope.campaignsByOrganizationData.scheduled, true);
                $scope.campaignsByOrganizationData.completed = PlotService.getLargeDataGroupByValue($scope.campaignsByOrganizationData.completed, 10);
                PlotService.drawPie('#pie-chart4', $scope.campaignsByOrganizationData.completed, true);
                $scope.campaignsByOrganizationData.cancelled = PlotService.getLargeDataGroupByValue($scope.campaignsByOrganizationData.cancelled, 10);
                PlotService.drawPie('#pie-chart7', $scope.campaignsByOrganizationData.cancelled, true);

                $scope.campaignsByUserData = preparePieChartData(response.userAccounts, 'userName');
                $scope.campaignsByUserData.active = PlotService.getLargeDataGroupByValue($scope.campaignsByUserData.active, 10);
                PlotService.drawPie('#pie-chart11', $scope.campaignsByUserData.active, true);
                $scope.campaignsByUserData.scheduled = PlotService.getLargeDataGroupByValue($scope.campaignsByUserData.scheduled, 10);
                PlotService.drawPie('#pie-chart2', $scope.campaignsByUserData.scheduled, true);
                $scope.campaignsByUserData.completed = PlotService.getLargeDataGroupByValue($scope.campaignsByUserData.completed, 10);
                PlotService.drawPie('#pie-chart5', $scope.campaignsByUserData.completed, true);
                $scope.campaignsByUserData.cancelled = PlotService.getLargeDataGroupByValue($scope.campaignsByUserData.cancelled, 10);
                PlotService.drawPie('#pie-chart8', $scope.campaignsByUserData.cancelled, true);

                $scope.campaignsByTypeData = preparePieChartData(response.campaignTypes, 'campaignType');
                $scope.campaignsByTypeData.active = PlotService.getLargeDataGroupByValue($scope.campaignsByTypeData.active, 10);
                PlotService.drawPie('#pie-chart12', $scope.campaignsByTypeData.active, true);
                $scope.campaignsByTypeData.scheduled = PlotService.getLargeDataGroupByValue($scope.campaignsByTypeData.scheduled, 10);
                PlotService.drawPie('#pie-chart3', $scope.campaignsByTypeData.scheduled, true);
                $scope.campaignsByTypeData.completed = PlotService.getLargeDataGroupByValue($scope.campaignsByTypeData.completed, 10);
                PlotService.drawPie('#pie-chart6', $scope.campaignsByTypeData.completed, true);
                $scope.campaignsByTypeData.cancelled = PlotService.getLargeDataGroupByValue($scope.campaignsByTypeData.cancelled, 10);
                PlotService.drawPie('#pie-chart9', $scope.campaignsByTypeData.cancelled, true);
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
