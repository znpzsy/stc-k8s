(function () {

    'use strict';

    /*
    [
        {
            "enabled": true,
            "endDate": "2025-12-06T21:00:00+03:00",
            "name": "timeConstraint",
            "recurrence": true,
            "startDate": "2025-01-06T01:00:00+03:00"
        }
    ]
    */

    
    angular.module('adminportal.products.mmsc.operations.applications.mm7.blackhourrules', []);

    var MmscApplicationsMM7BlackHourRulesOperationsModule = angular.module('adminportal.products.mmsc.operations.applications.mm7.blackhourrules');

    MmscApplicationsMM7BlackHourRulesOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('products.mmsc.operations.applications.mm7-blackhourrules', {
            abstract: true,
            url: "/blackhourrules",
            template: "<div ui-view></div>",
            data: {
                "listState": "products.mmsc.operations.applications.mm7-blackhourrules.list",
                "newState": "products.mmsc.operations.applications.mm7-blackhourrules.new",
                "updateState": "products.mmsc.operations.applications.mm7-blackhourrules.update",
                "backState": "products.mmsc.operations.applications.mm7"
            }
        }).state('products.mmsc.operations.applications.mm7-blackhourrules.list', {
            url: "/list/:vasId",
            templateUrl: "products/mmsc/operations/operations.applications.mm7.blackhourrules.html",
            controller: 'MmscApplicationsMM7BlackHourRulesOperationsCtrl',
            resolve: {
                vasApplication: function (MmscOperationService, $stateParams) {
                    var vasId = $stateParams.vasId;
                    return MmscOperationService.getVas(vasId);
                },
                configurations: function ($stateParams, MmscOperationService) {
                    var vasId = $stateParams.vasId;
                    return MmscOperationService.getBlackHourRulesConfigurations(vasId);
                }
            }
        }).state('products.mmsc.operations.applications.mm7-blackhourrules.new', {
            url: "/new/:vasId",
            templateUrl: "products/mmsc/operations/operations.applications.mm7.blackhourrules.details.html",
            controller: 'MmscApplicationsMM7BlackHourRulesNewOperationsCtrl',
            resolve: {
                vasApplication: function (MmscOperationService, $stateParams) {
                    var vasId = $stateParams.vasId;
                    return MmscOperationService.getVas(vasId);
                }
            }
        }).state('products.mmsc.operations.applications.mm7-blackhourrules.update', {
            url: "/update/:vasId/:name",
            templateUrl: "products/mmsc/operations/operations.applications.mm7.blackhourrules.details.html",
            controller: 'MmscApplicationsMM7BlackHourRulesUpdateOperationsCtrl',
            resolve: {
                vasApplication: function (MmscOperationService, $stateParams) {
                    var vasId = $stateParams.vasId;
                    return MmscOperationService.getVas(vasId);
                },
                configuration: function ($stateParams, MmscOperationService) {
                    var vasId = $stateParams.vasId;
                    var name = $stateParams.name;

                    return MmscOperationService.getBlackHourRulesConfiguration(vasId, name);
                }
            }
        });

    });

    MmscApplicationsMM7BlackHourRulesOperationsModule.controller('MmscApplicationsMM7BlackHourRulesOperationsCtrl', function ($scope, $log, $filter, $uibModal, notification, $translate, NgTableParams, NgTableService,
                                                                                                                                              MmscOperationService, vasApplication, configurations) {
        $log.debug("MmscApplicationsMM7BlackHourRulesOperationsCtrl");

        $scope.app = vasApplication;

        // MM7 black hours rule configuration list
        $scope.configurationList = {
            list: configurations,
            tableParams: {}
        };

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.configurationList.tableParams.settings().$scope.filterText = filterText;
            $scope.configurationList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.configurationList.tableParams.page(1);
            $scope.configurationList.tableParams.reload();
        }, 750);

        $scope.configurationList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "startDate": 'asc'
            }
        }, {
            total: $scope.configurationList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.configurationList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.configurationList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - MM7 black hours rule configuration list

        // Remove configuration
        $scope.removeConfiguration = function (configuration) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing MM7 black hours rule configuration: ', configuration);

                MmscOperationService.deleteBlackHourRulesConfiguration($scope.app.vasId, configuration.name).then(function (response) {
                    $log.debug('Removed MM7 black hours rule configuration: ', configuration, ', response: ', response);

                    var deletedListItem = _.findWhere($scope.configurationList.list, {name: configuration.name});
                    $scope.configurationList.list = _.without($scope.configurationList.list, deletedListItem);

                    $scope.configurationList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete MM7 black hours rule configuration: ', configuration, ', response: ', response);
                });
            });
        };

    });

    MmscApplicationsMM7BlackHourRulesOperationsModule.controller('MmscApplicationsMM7BlackHourRulesNewOperationsCtrl', function ($scope, $log, $state, $controller, $filter, notification, $translate, UtilService,
                                                                                                                                                 MmscOperationService, STATES, DateTimeConstants, vasApplication) {
        $log.debug("MmscApplicationsMM7BlackHourRulesNewOperationsCtrl");


        // Calling the date time controller which initializes date/time pickers and necessary functions.
        $controller('GenericDateTimeCtrl', {$scope: $scope});

        $scope.STATES = STATES;

        $scope.app = vasApplication;

        // Timepicker preferences
        $scope.hstep = 1;
        $scope.mstep = 1;

        $scope.configuration = {
            name: $scope.app.name,
            enabled: $scope.STATES[0],
            recurrence: $scope.STATES[1],
            startDate: moment($scope.dateHolder.startDate).utcOffset(DateTimeConstants.OFFSET).format("YYYY-MM-DDTHH:mm:ssZ"),
            endDate: moment($scope.dateHolder.endDate).utcOffset(DateTimeConstants.OFFSET).format("YYYY-MM-DDTHH:mm:ssZ")
        };

        $scope.dateHolder = {
            startDate: new Date(moment().utcOffset(DateTimeConstants.OFFSET).subtract(1, 'days')),
            startTime: new Date(moment().utcOffset(DateTimeConstants.OFFSET).subtract(1, 'days')),
            endDate: new Date(),
            endTime: new Date()
        };

        $scope.save = function (configuration) {
            var configurationItem = {
                "name": configuration.name,
                "recurrence": configuration.recurrence,
                "enabled": (configuration.enabled === $scope.STATES[0]),
                "startDate": moment($scope.dateHolder.startDate).utcOffset(DateTimeConstants.OFFSET).format("YYYY-MM-DDTHH:mm:ssZ"),
                "endDate": moment($scope.dateHolder.endDate).utcOffset(DateTimeConstants.OFFSET).format("YYYY-MM-DDTHH:mm:ssZ")
            };

            MmscOperationService.createBlackHourRulesConfiguration($scope.app.vasId, configurationItem).then(function (response) {
                $log.debug('Attempted to Create MMSC Black Hour Rules: ', configurationItem, ', response: ', response);

                if (response && (response.errorCode || response.code)) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: response.errorCode || response.code,
                            errorText: response.errorMsg || response.message
                        })
                    });

                } else {

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }

                $scope.cancel();
            }, function (response) {
                $log.debug('Cannot create MMSC Black Hour Rules: ', configurationItem, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($state.current.data.listState, {vasId: $scope.app.vasId});
        };
    });

    MmscApplicationsMM7BlackHourRulesOperationsModule.controller('MmscApplicationsMM7BlackHourRulesUpdateOperationsCtrl', function ($scope, $log, $state, $controller, $filter, notification, $translate, UtilService,
                                                                                                                                                    MmscOperationService, STATES, DateTimeConstants, vasApplication, configuration) {
        $log.debug("MmscApplicationsMM7BlackHourRulesUpdateOperationsCtrl");

        // Calling the date time controller which initializes date/time pickers and necessary functions.
        $controller('GenericDateTimeCtrl', {$scope: $scope});

        $scope.STATES = STATES;

        $scope.app = vasApplication;

        // Timepicker preferences
        $scope.hstep = 1;
        $scope.mstep = 1;


        $scope.configuration = {
            id: _.uniqueId(),
            name: configuration.name,
            recurrence: configuration.recurrence,
            enabled: (configuration.enabled ? $scope.STATES[0] : $scope.STATES[1]),
            startDate: configuration.startDate,
            endDate: configuration.endDate
        };

        $scope.dateHolder = {
            startDate: ($scope.configuration.startDate ? new Date(moment($scope.configuration.startDate).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss')) : ''),
            endDate: ($scope.configuration.endDate ? new Date(moment($scope.configuration.endDate).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss')) : ''),
            startTime: ($scope.configuration.startDate ? moment($scope.configuration.startDate).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss') : ''),
            endTime: ($scope.configuration.endDate ? moment($scope.configuration.endDate).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss') : '')
        };

        $scope.configurationOriginal = angular.copy($scope.configuration);
        $scope.dateHolderOriginal = angular.copy($scope.dateHolder);

        $scope.isNotChanged = function () {
            return angular.equals($scope.configuration, $scope.configurationOriginal) && angular.equals($scope.dateHolder, $scope.dateHolderOriginal);
        };

        $scope.save = function (configuration) {
            var configurationItem = {
                "name": $scope.configurationOriginal.name,
                "recurrence": configuration.recurrence,
                "enabled": (configuration.enabled === $scope.STATES[0]),
                "startDate": moment($scope.dateHolder.startDate).utcOffset(DateTimeConstants.OFFSET).format("YYYY-MM-DDTHH:mm:ssZ"),
                "endDate": moment($scope.dateHolder.endDate).utcOffset(DateTimeConstants.OFFSET).format("YYYY-MM-DDTHH:mm:ssZ")
            };

            MmscOperationService.updateBlackHourRulesConfiguration($scope.app.vasId, configurationItem).then(function (response) {

                $log.debug('Attempted to Update MMSC Black Hour Rules: ', configurationItem, ', response: ', response);

                if (response && (response.errorCode || response.code)) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: response.errorCode || response.code,
                            errorText: response.errorMsg || response.message
                        })
                    });

                } else {

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }

                $scope.cancel();
            }, function (response) {
                $log.debug('Cannot update MMSC Black Hour Rules: ', configurationItem, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($state.current.data.listState, {vasId: $scope.app.vasId});
        };
    });

})();
