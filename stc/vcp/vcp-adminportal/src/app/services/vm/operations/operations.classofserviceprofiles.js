(function () {

    'use strict';

    angular.module('adminportal.services.vm.operations.classofserviceprofiles', []);

    var VMOperationsClassOfServiceProfilesModule = angular.module('adminportal.services.vm.operations.classofserviceprofiles');

    VMOperationsClassOfServiceProfilesModule.config(function ($stateProvider) {

        $stateProvider.state('services.vm.operations.classofserviceprofiles', {
            url: "/class-of-service-profiles",
            template: "<div ui-view></div>",
            resolve: {}
        }).state('services.vm.operations.classofserviceprofiles.list', {
            url: "/list",
            templateUrl: "services/vm/operations/operations.classofserviceprofiles.html",
            controller: 'VMOperationsClassOfServiceProfilesCtrl',
            resolve: {
                classOfServiceProfiles: function (VMConfigurationService) {
                    return VMConfigurationService.getCoSProfiles();
                }
            }
        }).state('services.vm.operations.classofserviceprofiles.update', {
            url: "/update/:profileId",
            templateUrl: "services/vm/operations/operations.classofserviceprofiles.detail.html",
            controller: 'VMOperationsClassOfServiceProfilesUpdateCtrl',
            resolve: {
                classOfServiceProfile: function ($stateParams, VMConfigurationService) {
                    var profileId = $stateParams.profileId;

                    return VMConfigurationService.getCoSProfileEntry(profileId);
                }
            }
        });

    });

    VMOperationsClassOfServiceProfilesModule.controller('VMOperationsClassOfServiceProfilesCommonCtrl', function ($scope, $log, $state, UtilService) {
        $log.debug('VMOperationsClassOfServiceProfilesCommonCtrl');

        $scope.listState = "services.vm.operations.classofserviceprofiles.list";
        $scope.newState = "services.vm.operations.classofserviceprofiles.new";
        $scope.updateState = "services.vm.operations.classofserviceprofiles.update";

        $scope.cancel = function () {
            $state.go($scope.listState);
        };
    });

    VMOperationsClassOfServiceProfilesModule.controller('VMOperationsClassOfServiceProfilesCtrl', function ($scope, $log, $controller, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService, DateTimeConstants,
                                                                                                            classOfServiceProfiles) {
        $log.debug('VMOperationsClassOfServiceProfilesCtrl');

        $controller('VMOperationsClassOfServiceProfilesCommonCtrl', {$scope: $scope});

        // ClassOfServiceProfiles list
        $scope.classOfServiceProfileList = {
            list: classOfServiceProfiles,
            tableParams: {}
        };

        $scope.classOfServiceProfileList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "cosName": 'asc'
            }
        }, {
            total: $scope.classOfServiceProfileList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.classOfServiceProfileList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.classOfServiceProfileList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - ClassOfServiceProfiles list

    });

    VMOperationsClassOfServiceProfilesModule.controller('VMOperationsClassOfServiceProfilesUpdateCtrl', function ($scope, $log, $state, $stateParams, $controller, $translate, notification, DateTimeConstants, UtilService,
                                                                                                                  VMConfigurationService, classOfServiceProfile) {
        $log.debug('VMOperationsClassOfServiceProfilesUpdateCtrl');

        $controller('VMOperationsClassOfServiceProfilesCommonCtrl', {$scope: $scope});

        var profileId = $stateParams.profileId;
        $scope.entry = classOfServiceProfile;

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

            VMConfigurationService.updateCoSProfileEntry(profileId, entryItem).then(function (response) {
                $log.debug('Updated ClassOfServiceProfile entry: ', entryItem);

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $state.go($scope.listState);
            }, function (response) {
                $log.debug('Cannot update ClassOfServiceProfile entry: ', entryItem, ', response: ', response);
            });
        };

    });

})();
