(function () {

    'use strict';

    angular.module('adminportal.services.cmb.advertisement', []);

    var P4MCmbAdvertsModule = angular.module('adminportal.services.cmb.advertisement');

    P4MCmbAdvertsModule.config(function ($stateProvider) {
        $stateProvider.state('services.cmb.advertisement', {
            url: "/adlistings",
            templateUrl: "services/cmb/advertisement/advertisement.html"
        }).state('services.cmb.advertisement.settings', {
            url: "/list",
            templateUrl: "services/cmb/advertisement/advertisement.settings.html",
            controller: 'P4MCmbAdvertsSettingsCtrl',
            resolve: {
                advertisementConfig: function (P4MService) {
                    return P4MService.getCmbAdvertisementConfig();
                }
            }
        }).state('services.cmb.advertisement.list', {
            url: "/list",
            templateUrl: "services/cmb/advertisement/advertisement.list.html",
            controller: 'P4MCmbAdvertsCtrl',
            resolve: {
                advertisements: function (P4MService) {
                    return P4MService.getCmbAdvertisements();
                }
            }
        }).state('services.cmb.advertisement.update', {
            url: "/update/:language",
            templateUrl: "services/cmb/advertisement/advertisement.detail.html",
            controller: 'P4MCmbAdvertsUpdateCtrl',
            resolve: {
                advertisement: function ($stateParams, P4MService) {
                    return P4MService.getCmbAdvertisement($stateParams.language);
                }
            }
        });

    });


    P4MCmbAdvertsModule.controller('P4MCmbAdvertsCommonCtrl', function ($scope, $log, $state) {
        $log.debug('P4MCmbAdvertsCommonCtrl');

        $scope.listState = "services.cmb.advertisement.list";
        $scope.updateState = "services.cmb.advertisement.update";

        $scope.cancel = function () {
            $state.go($scope.listState);
        };
    });

    P4MCmbAdvertsModule.controller('P4MCmbAdvertsCtrl', function ($scope, $log, $filter, $uibModal, $translate, $controller, $stateParams, notification, Restangular,
                                                                  NgTableParams, NgTableService, advertisements) {
        $log.debug("P4MCmbAdvertsCtrl");

        $controller('P4MCmbAdvertsCommonCtrl', {$scope: $scope});

        advertisements = $filter('orderBy')(advertisements, ['advertLanguage', 'advertContent']);

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'advertLanguage',
                    headerKey: 'Services.CMB.Advertisement.TableColumns.AdName'
                },
                {
                    fieldName: 'advertContent',
                    headerKey: 'Services.CMB.Advertisement.TableColumns.AdContent'
                }
            ]
        };

        // Ad template list
        $scope.advertisementList = {
            list: advertisements,
            tableParams: {}
        };

        $scope.advertisementList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "name": 'asc'
            }
        }, {
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.advertisementList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.advertisementList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Ad template list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.advertisementList.tableParams.settings().$scope.filterText = filterText;
            $scope.advertisementList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.advertisementList.tableParams.page(1);
            $scope.advertisementList.tableParams.reload();
        }, 750);
        
    });

    P4MCmbAdvertsModule.controller('P4MCmbAdvertsUpdateCtrl', function ($scope, $log, $state, $stateParams, $controller, $translate, notification, Restangular,
                                                                        advertisement, P4MService) {
        $log.debug("P4MCmbAdvertsUpdateCtrl");

        $controller('P4MCmbAdvertsCommonCtrl', {$scope: $scope});

        $scope.advertisement = advertisement;
        $scope.entry = {
            advertLanguage: advertisement.advertLanguage,
            advertContent: advertisement.advertContent
        };
        var advertLanguage = $stateParams.language;
        $scope.originalEntry = angular.copy($scope.entry);

        $scope.save = function (entry) {

            P4MService.updateCmbAdvertisement(advertLanguage, entry).then(function (response) {
                $log.debug('Updated ad template ad insertion entry: ', entry);

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $state.go($scope.listState);
            }, function (response) {
                $log.debug('Cannot update ad template ad insertion entry: ', entry, ', response: ', response);
            });
        };

        $scope.isNotChanged = function () {
            $log.debug($scope.originalEntry, $scope.entry, angular.equals($scope.originalEntry, $scope.entry));

            return angular.equals($scope.originalEntry, $scope.entry);
        };
    });

    P4MCmbAdvertsModule.controller('P4MCmbAdvertsSettingsCtrl', function ($scope, $log, $state, $translate, notification, Restangular, P4MService,
                                                                          advertisementConfig) {
        $log.debug("P4MCmbAdvertsSettingsCtrl");

        $scope.serviceProfile = Restangular.stripRestangular(advertisementConfig[0]);
        $scope.originalServiceProfile = angular.copy($scope.serviceProfile);

        $scope.isConfigurationNotChanged = function () {
            return angular.equals($scope.originalServiceProfile, $scope.serviceProfile);
        };

        $scope.save = function (serviceProfile) {
            $log.debug('Save CMB advertisement configuration: ', serviceProfile);

            P4MService.updateCmbAdvertisementConfig(serviceProfile).then(function (response) {
                $log.debug('Success. Response: ', response);

                $scope.serviceProfile = Restangular.stripRestangular(response);

                $scope.originalServiceProfile = angular.copy($scope.serviceProfile);

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });
            }, function (response) {
                $log.debug('Cannot update CMB Advertisement Profile. Error: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });

})();
