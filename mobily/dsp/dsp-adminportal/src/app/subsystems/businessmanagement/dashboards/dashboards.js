(function () {

    'use strict';

    angular.module('adminportal.subsystems.businessmanagement.dashboards', []);

    var BusinessManagementDashboardsModule = angular.module('adminportal.subsystems.businessmanagement.dashboards');

    BusinessManagementDashboardsModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.businessmanagement.dashboards', {
            url: "/dashboard",
            templateUrl: "subsystems/businessmanagement/dashboards/dashboards.html",
            controller: 'BusinessManagementDashboardsCtrl',
            data: {
                permissions: [
                    'ALL__DASHBOARD_READ'
                ]
            }
        });

    });

    BusinessManagementDashboardsModule.controller('BusinessManagementDashboardsCtrl', function ($scope, $log, $controller, $interval, $q, $state, $filter, Restangular, AdmPortalDashboardPromiseTracker,
                                                                                                PlotService, CMPFService, DEFAULT_REST_QUERY_LIMIT) {
        $log.debug("BusinessManagementDashboardsCtrl");

        var initialize = function () {
            $scope.tiles = {
                agreements: 0,
                businessTypes: 0,
                channels: 0,
                projects: 0,
                serviceTypes: 0,
                settlementTypes: 0
            };

            $scope.projectsByPartnerTypeData = [];
            $scope.projectsBySettlementModelData = [];
            $scope.projectsTypesByRevenueSourceData = [];
        };

        initialize();

        var dashboarding = function () {
            CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_ORGANIZATION_NAME, AdmPortalDashboardPromiseTracker).then(function (response) {
                // Tiles
                var agreementsOrganization = _.findWhere(response.organizations, {name: CMPFService.DEFAULT_AGREEMENTS_ORGANIZATION_NAME});
                var agreements = CMPFService.getAgreements(agreementsOrganization);
                $scope.tiles.agreements = agreements.length;

                var businessTypesOrganization = _.findWhere(response.organizations, {name: CMPFService.DEFAULT_BUSINESS_TYPES_ORGANIZATION_NAME});
                var businessTypes = CMPFService.getBusinessTypes(businessTypesOrganization);
                $scope.tiles.businessTypes = businessTypes.length;

                var channelsOrganization = _.findWhere(response.organizations, {name: CMPFService.DEFAULT_CHANNELS_ORGANIZATION_NAME});
                var channels = CMPFService.getChannels(channelsOrganization);
                $scope.tiles.channels = channels.length;

                var projectsOrganization = _.findWhere(response.organizations, {name: CMPFService.DEFAULT_PROJECTS_ORGANIZATION_NAME});
                var projects = CMPFService.getProjects(projectsOrganization);
                $scope.tiles.projects = projects.length;

                var serviceTypesOrganization = _.findWhere(response.organizations, {name: CMPFService.DEFAULT_SERVICE_TYPES_ORGANIZATION_NAME});
                var serviceTypes = CMPFService.getServiceTypes(serviceTypesOrganization);
                $scope.tiles.serviceTypes = serviceTypes.length;

                var settlementTypesOrganization = _.findWhere(response.organizations, {name: CMPFService.DEFAULT_SETTLEMENT_TYPES_ORGANIZATION_NAME});
                var settlementTypes = CMPFService.getSettlementTypes(settlementTypesOrganization);
                $scope.tiles.settlementTypes = settlementTypes.length;

                // Pie charts
                _.each(projects, function (project) {
                    if (!project.PartnerType) {
                        project.PartnerType = 'N/A'
                    }

                    var foundData = _.findWhere($scope.projectsByPartnerTypeData, {label: project.PartnerType});
                    if (foundData) {
                        foundData.data += 1;
                    } else {
                        $scope.projectsByPartnerTypeData.push({
                            label: project.PartnerType,
                            data: 1
                        });
                    }

                    var foundBusinessType = _.findWhere(businessTypes, {profileId: Number(project.BusinessTypeID)});
                    if (foundBusinessType && foundBusinessType.SettlementTypes) {
                        _.each(foundBusinessType.SettlementTypes, function (settlementTypeId) {
                            var foundSettlementType = _.findWhere(settlementTypes, {profileId: Number(settlementTypeId)});

                            // SettlementModel
                            var foundSettlementModelData = _.findWhere($scope.projectsBySettlementModelData, {label: foundSettlementType.SettlementModel});
                            if (foundSettlementModelData) {
                                foundSettlementModelData.data += 1;
                            } else {
                                $scope.projectsBySettlementModelData.push({
                                    label: foundSettlementType.SettlementModel,
                                    data: 1
                                });
                            }

                            // RevenueSource
                            var foundRevenueSourceData = _.findWhere($scope.projectsTypesByRevenueSourceData, {label: foundSettlementType.RevenueSource});
                            if (foundRevenueSourceData) {
                                foundRevenueSourceData.data += 1;
                            } else {
                                $scope.projectsTypesByRevenueSourceData.push({
                                    label: foundSettlementType.RevenueSource,
                                    data: 1
                                });
                            }
                        });
                    }
                });

                $scope.projectsByPartnerTypeData = PlotService.getLargeDataGroupByValue($scope.projectsByPartnerTypeData, 10);
                PlotService.drawPie('#pie-chart1', $scope.projectsByPartnerTypeData, true);

                $scope.projectsBySettlementModelData = PlotService.getLargeDataGroupByValue($scope.projectsBySettlementModelData, 10);
                PlotService.drawPie('#pie-chart2', $scope.projectsBySettlementModelData, true);

                $scope.projectsTypesByRevenueSourceData = PlotService.getLargeDataGroupByValue($scope.projectsTypesByRevenueSourceData, 10);
                PlotService.drawPie('#pie-chart3', $scope.projectsTypesByRevenueSourceData, true);
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
