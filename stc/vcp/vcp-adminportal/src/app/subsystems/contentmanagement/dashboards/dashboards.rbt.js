(function () {

    'use strict';

    angular.module('adminportal.subsystems.contentmanagement.dashboards.rbt', []);

    var ContentManagementDashboardsRBTModule = angular.module('adminportal.subsystems.contentmanagement.dashboards.rbt');

    ContentManagementDashboardsRBTModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.contentmanagement.dashboards.rbt', {
            url: "/rbt",
            templateUrl: "subsystems/contentmanagement/dashboards/dashboards.rbt.html",
            controller: 'ContentManagementDashboardsRBTCtrl'
        });

    });

    ContentManagementDashboardsRBTModule.controller('ContentManagementDashboardsRBTCtrl', function ($scope, $log, $controller, $interval, $q, $state, $filter, Restangular, AdmPortalDashboardPromiseTracker,
                                                                                                    PlotService, ContentManagementService) {
        $log.debug("ContentManagementDashboardsRBTCtrl");

        var initialize = function () {
            $scope.tiles = {
                totalCategories: 0,
                totalMoods: 0,
                totalArtists: 0,
                totalPlaylists: 0,
                totalTones: 0
            };

            $scope.data1 = [];
            $scope.data2 = [];
            $scope.data3 = [];
            $scope.data4 = [];
            $scope.data5 = [];
            $scope.data6 = [];
            $scope.data7 = [];
            $scope.data8 = [];
            $scope.data9 = [];
            $scope.data10 = [];
            $scope.data11 = [];
            $scope.data12 = [];
            $scope.data13 = [];
            $scope.data14 = [];
            $scope.data15 = [];
        };

        initialize();

        var dashboarding = function () {
            ContentManagementService.getDashboardRBT(AdmPortalDashboardPromiseTracker).then(function (response) {
                if (response) {
                    // Tiles
                    $scope.tiles.totalCategories = response.totalCategories ? response.totalCategories : 0;
                    $scope.tiles.totalMoods = response.totalMoods ? response.totalMoods : 0;
                    $scope.tiles.totalArtists = response.totalArtists ? response.totalArtists : 0;
                    $scope.tiles.totalPlaylists = response.totalPlaylists ? response.totalPlaylists : 0;
                    $scope.tiles.totalTones = response.totalTones ? response.totalTones : 0;

                    // Pie Charts
                    // TODO - implemented in future
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
