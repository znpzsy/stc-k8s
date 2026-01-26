(function () {

    'use strict';

    angular.module('adminportal.services.vsms.operations.subscriberprofiles', []);

    var VSMSOperationsSubscriberProfilesModule = angular.module('adminportal.services.vsms.operations.subscriberprofiles');

    VSMSOperationsSubscriberProfilesModule.config(function ($stateProvider) {

        $stateProvider.state('services.vsms.operations.subscriberprofiles', {
            url: "/subscriberprofile",
            templateUrl: "partials/simple.abstract.html",
            resolve: {}
        }).state('services.vsms.operations.subscriberprofiles.list', {
            url: "/list",
            templateUrl: "services/vsms/operations/operations.subscriberprofiles.html",
            controller: 'VSMSOperationsSubscriberProfilesCtrl',
            resolve: {
                subscriberProfiles: function (VSMSConfigurationService) {
                    return VSMSConfigurationService.getSubscriberProfiles();
                }
            }
        }).state('services.vsms.operations.subscriberprofiles.update', {
            url: "/update/:profileId",
            templateUrl: "services/vsms/operations/operations.subscriberprofiles.detail.html",
            controller: 'VSMSOperationsSubscriberProfilesUpdateCtrl',
            resolve: {
                subscriberProfile: function ($stateParams, VSMSConfigurationService) {
                    var profileId = $stateParams.profileId;

                    return VSMSConfigurationService.getSubscriberProfileEntry(profileId);
                }
            }
        });

    });

    VSMSOperationsSubscriberProfilesModule.controller('VSMSOperationsSubscriberProfilesCommonCtrl', function ($scope, $log, $state, UtilService) {
        $log.debug('VSMSOperationsSubscriberProfilesCommonCtrl');

        $scope.listState = "services.vsms.operations.subscriberprofiles.list";
        $scope.newState = "services.vsms.operations.subscriberprofiles.new";
        $scope.updateState = "services.vsms.operations.subscriberprofiles.update";

        $scope.cancel = function () {
            $state.go($scope.listState);
        };
    });

    VSMSOperationsSubscriberProfilesModule.controller('VSMSOperationsSubscriberProfilesCtrl', function ($scope, $log, $controller, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService, DateTimeConstants,
                                                                                                        subscriberProfiles) {
        $log.debug('VSMSOperationsSubscriberProfilesCtrl');

        $controller('VSMSOperationsSubscriberProfilesCommonCtrl', {$scope: $scope});

        // SubscriberProfiles list
        $scope.subscriberProfileList = {
            list: subscriberProfiles,
            tableParams: {}
        };

        $scope.subscriberProfileList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "cosName": 'asc'
            }
        }, {
            total: $scope.subscriberProfileList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.subscriberProfileList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.subscriberProfileList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - SubscriberProfiles list

    });

    VSMSOperationsSubscriberProfilesModule.controller('VSMSOperationsSubscriberProfilesUpdateCtrl', function ($scope, $log, $state, $stateParams, $controller, $translate, notification, DateTimeConstants, UtilService,
                                                                                                              VSMSConfigurationService, subscriberProfile) {
        $log.debug('VSMSOperationsSubscriberProfilesUpdateCtrl');

        $controller('VSMSOperationsSubscriberProfilesCommonCtrl', {$scope: $scope});

        var profileId = $stateParams.profileId;
        $scope.entry = subscriberProfile;

        _.defaults($scope.entry, {
            id: _.uniqueId()
        });

        $scope.originalEntry = angular.copy($scope.entry);
        $scope.isNotChanged = function () {
            $log.debug($scope.originalEntry, $scope.entry, angular.equals($scope.originalEntry, $scope.entry));

            return angular.equals($scope.originalEntry, $scope.entry);
        };

        $scope.save = function (entry) {
            var entryItem = _.clone(entry);
            delete entryItem.id;

            VSMSConfigurationService.updateSubscriberProfileEntry(profileId, entryItem).then(function (response) {
                $log.debug('Updated SubscriberProfile entry: ', entryItem);

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $state.go($scope.listState);
            }, function (response) {
                $log.debug('Cannot update SubscriberProfile entry: ', entryItem, ', response: ', response);
            });
        };

    });

})();
