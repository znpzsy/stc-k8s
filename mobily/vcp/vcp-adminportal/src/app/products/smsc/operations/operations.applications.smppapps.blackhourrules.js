(function () {

    'use strict';

    angular.module('adminportal.products.smsc.operations.applications.smppapps.blackhourrules', []);

    var SmscApplicationsSMPPBlackHourRulesOperationsModule = angular.module('adminportal.products.smsc.operations.applications.smppapps.blackhourrules');

    SmscApplicationsSMPPBlackHourRulesOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('products.smsc.operations.applications.smppapps-blackhourrules', {
            abstract: true,
            url: "/blackhourrules",
            template: "<div ui-view></div>",
            data: {
                "listState": "products.smsc.operations.applications.smppapps-blackhourrules.list",
                "newState": "products.smsc.operations.applications.smppapps-blackhourrules.new",
                "updateState": "products.smsc.operations.applications.smppapps-blackhourrules.update",
                "backState": "products.smsc.operations.applications.smppapps"
            }
        }).state('products.smsc.operations.applications.smppapps-blackhourrules.list', {
            url: "/list/:appId",
            templateUrl: "products/smsc/operations/operations.applications.smppapps.blackhourrules.html",
            controller: 'SmscApplicationsSMPPBlackHourRulesOperationsCtrl',
            resolve: {
                smppApplication: function ($stateParams, SmscProvService) {
                    var appId = $stateParams.appId;

                    return SmscProvService.getSmppApplication(appId);
                },
                configurations: function ($stateParams, SmscConfService) {
                    var appId = $stateParams.appId;

                    return SmscConfService.getBlackHourRulesConfigurations(appId);
                }
            }
        }).state('products.smsc.operations.applications.smppapps-blackhourrules.new', {
            url: "/new/:appId",
            templateUrl: "products/smsc/operations/operations.applications.smppapps.blackhourrules.details.html",
            controller: 'SmscApplicationsSMPPBlackHourRulesNewOperationsCtrl',
            resolve: {
                smppApplication: function ($stateParams, SmscProvService) {
                    var appId = $stateParams.appId;

                    return SmscProvService.getSmppApplication(appId);
                }
            }
        }).state('products.smsc.operations.applications.smppapps-blackhourrules.update', {
            url: "/update/:appId/:name",
            templateUrl: "products/smsc/operations/operations.applications.smppapps.blackhourrules.details.html",
            controller: 'SmscApplicationsSMPPBlackHourRulesUpdateOperationsCtrl',
            resolve: {
                smppApplication: function ($stateParams, SmscProvService) {
                    var appId = $stateParams.appId;

                    return SmscProvService.getSmppApplication(appId);
                },
                configuration: function ($stateParams, SmscConfService) {
                    var appId = $stateParams.appId;
                    var name = $stateParams.name;

                    return SmscConfService.getBlackHourRulesConfiguration(appId, name);
                }
            }
        });

    });

    SmscApplicationsSMPPBlackHourRulesOperationsModule.controller('SmscApplicationsSMPPBlackHourRulesOperationsCtrl', function ($scope, $log, $filter, $uibModal, notification, $translate, NgTableParams, NgTableService,
                                                                                                                                              SmscConfService, smppApplication, configurations) {
        $log.debug("SMSCApplicationsSMPPBlackHourRulesOperationsCtrl");

        $scope.app = smppApplication;

        // SMPP black hours rule configuration list
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
                "blackhourStart": 'asc'
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
        // END - SMPP black hours rule configuration list

        // Remove configuration
        $scope.removeConfiguration = function (configuration) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing SMPP black hours rule configuration: ', configuration);

                SmscConfService.deleteBlackHourRulesConfiguration($scope.app.id, configuration.name).then(function (response) {
                    $log.debug('Removed SMPP black hours rule configuration: ', configuration, ', response: ', response);

                    var deletedListItem = _.findWhere($scope.configurationList.list, {name: configuration.name});
                    $scope.configurationList.list = _.without($scope.configurationList.list, deletedListItem);

                    $scope.configurationList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete SMPP black hours rule configuration: ', configuration, ', response: ', response);
                });
            });
        };

    });

    SmscApplicationsSMPPBlackHourRulesOperationsModule.controller('SmscApplicationsSMPPBlackHourRulesNewOperationsCtrl', function ($scope, $log, $state, $filter, notification, $translate, UtilService,
                                                                                                                                                 SmscConfService, STATES, smppApplication) {
        $log.debug("SMSCApplicationsSMPPBlackHourRulesNewOperationsCtrl");

        $scope.STATES = STATES;

        $scope.app = smppApplication;

        // Timepicker preferences
        $scope.hstep = 1;
        $scope.mstep = 1;

        $scope.configuration = {
            enabled: $scope.STATES[0],
            blackhourStart: UtilService.getTodayBegin(),
            blackhourEnd: UtilService.getTodayEnd()
        };

        $scope.save = function (configuration) {
            var configurationItem = {
                "name": _.uniqueId(),
                "enabled": (configuration.enabled === $scope.STATES[0]),
                "blackhourStart": $filter('date')(configuration.blackhourStart, 'HH:mm'),
                "blackhourEnd": $filter('date')(configuration.blackhourEnd, 'HH:mm')
            };

            SmscConfService.createBlackHourRulesConfiguration($scope.app.id, configurationItem).then(function (response) {
                $log.debug('Created SMSC Black Hour Rules: ', configurationItem, ', response: ', response);

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $scope.cancel();
            }, function (response) {
                $log.debug('Cannot create SMSC Black Hour Rules: ', configurationItem, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($state.current.data.listState, {appId: $scope.app.id});
        };
    });

    SmscApplicationsSMPPBlackHourRulesOperationsModule.controller('SmscApplicationsSMPPBlackHourRulesUpdateOperationsCtrl', function ($scope, $log, $state, $filter, notification, $translate, UtilService,
                                                                                                                                                    SmscConfService, STATES, smppApplication, configuration) {
        $log.debug("SMSCApplicationsSMPPBlackHourRulesUpdateOperationsCtrl");

        $scope.STATES = STATES;

        $scope.app = smppApplication;

        // Timepicker preferences
        $scope.hstep = 1;
        $scope.mstep = 1;

        var getDateByHourMinuteString = function (timeStr) {
            var hmTimeArray = timeStr.split(':');

            var d = new Date();
            d.setHours(hmTimeArray[0]);
            d.setMinutes(hmTimeArray[1]);

            return d;
        };

        $scope.configuration = {
            id: _.uniqueId(),
            name: configuration.name,
            enabled: (configuration.enabled ? $scope.STATES[0] : $scope.STATES[1]),
            blackhourStart: getDateByHourMinuteString(configuration.blackhourStart),
            blackhourEnd: getDateByHourMinuteString(configuration.blackhourEnd)
        };

        $scope.configurationOriginal = angular.copy($scope.configuration);
        $scope.isNotChanged = function () {
            return angular.equals($scope.configuration, $scope.configurationOriginal);
        };

        $scope.save = function (configuration) {
            var configurationItem = {
                "name": $scope.configurationOriginal.name,
                "enabled": (configuration.enabled === $scope.STATES[0]),
                "blackhourStart": $filter('date')(configuration.blackhourStart, 'HH:mm'),
                "blackhourEnd": $filter('date')(configuration.blackhourEnd, 'HH:mm')
            };

            SmscConfService.updateBlackHourRulesConfiguration($scope.app.id, configurationItem).then(function (response) {
                $log.debug('Updated SMSC Black Hour Rules: ', configurationItem, ', response: ', response);

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $scope.cancel();
            }, function (response) {
                $log.debug('Cannot update SMSC Black Hour Rules: ', configurationItem, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($state.current.data.listState, {appId: $scope.app.id});
        };
    });

})();
