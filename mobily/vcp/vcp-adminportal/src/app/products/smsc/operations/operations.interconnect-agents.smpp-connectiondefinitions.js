(function () {

    'use strict';

    angular.module('adminportal.products.smsc.operations.interconnect-agents.smpp.connectiondefinitions', []);

    var SmscInterconnectSMPPAgentConnectionDefinitionsOperationsModule = angular.module('adminportal.products.smsc.operations.interconnect-agents.smpp.connectiondefinitions');

    SmscInterconnectSMPPAgentConnectionDefinitionsOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('products.smsc.operations.interconnect-agents.smpp-connectiondefinitions', {
            url: "/connectiondefinitions/:agentName",
            templateUrl: "products/smsc/operations/operations.interconnect-agents.smpp-connectiondefinitions.html",
            controller: 'SmscInterconnectSMPPAgentConnectionDefinitionsOperationsCtrl',
            resolve: {
                interconnectSmppAgentConnectionDefinitions: function (SmscConfService, $stateParams) {
                    var agentName = $stateParams.agentName;

                    return SmscConfService.getInterconnectSmppAgentConnectionDefinitions(agentName);
                }
            }
        }).state('products.smsc.operations.interconnect-agents.smpp-connectiondefinitions-new', {
            url: "/connectiondefinitions/new/:agentName",
            templateUrl: "products/smsc/operations/operations.interconnect-agents.smpp-connectiondefinitions.details.html",
            controller: 'SmscNewInterconnectSMPPAgentConnectionDefinitionOperationsCtrl',
            resolve: {
                interconnectSmppAgentConnectionDefinitions: function (SmscConfService, $stateParams) {
                    var agentName = $stateParams.agentName;

                    return SmscConfService.getInterconnectSmppAgentConnectionDefinitions(agentName);
                }
            }
        }).state('products.smsc.operations.interconnect-agents.smpp-connectiondefinitions-update', {
            url: "/connectiondefinitions/update/:agentName/:connectionDefinitionName",
            templateUrl: "products/smsc/operations/operations.interconnect-agents.smpp-connectiondefinitions.details.html",
            controller: 'SmscUpdateInterconnectSMPPAgentConnectionDefinitionOperationsCtrl',
            resolve: {
                interconnectSmppAgentConnectionDefinitions: function (SmscConfService, $stateParams) {
                    var agentName = $stateParams.agentName;

                    return SmscConfService.getInterconnectSmppAgentConnectionDefinitions(agentName);
                }
            }
        });

    });

    SmscInterconnectSMPPAgentConnectionDefinitionsOperationsModule.controller('SmscInterconnectSMPPAgentConnectionDefinitionsOperationsCtrl', function ($scope, $state, $stateParams, $log, $filter, $uibModal, $translate, notification,
                                                                                                                                                                      Restangular, NgTableParams, NgTableService, SmscConfService, interconnectSmppAgentConnectionDefinitions) {
        $log.debug('SmscInterconnectSMPPAgentConnectionDefinitionsOperationsCtrl');

        $scope.agentName = $stateParams.agentName;

        var interconnectSmppAgentConnectionDefinitionList = Restangular.stripRestangular(interconnectSmppAgentConnectionDefinitions);

        _.each(interconnectSmppAgentConnectionDefinitionList, function (interconnectSmppAgentConnectionDefinition) {
            $log.debug("Established Connections: ", interconnectSmppAgentConnectionDefinition.establishedConnections);

            if (interconnectSmppAgentConnectionDefinition.establishedConnections.length > 0) {
                interconnectSmppAgentConnectionDefinition.sessionState = 'ESTABLISHED';
            } else {
                interconnectSmppAgentConnectionDefinition.sessionState = 'UNESTABLISHED';
            }
        });

        // Interconnect Smpp Agent Connection Definition list
        $scope.interconnectSmppAgentConnectionDefinitionList = {
            list: interconnectSmppAgentConnectionDefinitionList,
            tableParams: {}
        };

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.interconnectSmppAgentConnectionDefinitionList.tableParams.settings().$scope.filterText = filterText;
            $scope.interconnectSmppAgentConnectionDefinitionList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.interconnectSmppAgentConnectionDefinitionList.tableParams.page(1);
            $scope.interconnectSmppAgentConnectionDefinitionList.tableParams.reload();
        }, 750);

        $scope.interconnectSmppAgentConnectionDefinitionList.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "name": 'asc' // initial sorting
            }
        }, {
            total: $scope.interconnectSmppAgentConnectionDefinitionList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.interconnectSmppAgentConnectionDefinitionList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.interconnectSmppAgentConnectionDefinitionList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Interconnect Smpp Agent Connection Definition list

        // Queries established connections for current smpp agent definition.
        var getInterconnectSmppAgentEstablishedConnections = function (agentName) {
            return SmscConfService.getInterconnectSmppAgentEstablishedConnections(agentName);
        };


        $scope.removeInterconnectSmppAgentConnectionDefinition = function (interconnectSmppAgentConnectionDefinition) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing Interconnect Smpp Agent: ', interconnectSmppAgentConnectionDefinition);

                SmscConfService.deleteInterconnectSmppAgentConnectionDefinition($scope.agentName, interconnectSmppAgentConnectionDefinition.name).then(function (response) {
                    $log.debug('Removed Interconnect Smpp Agent Connection Definition: ', response);

                    var deletedListItem = _.findWhere($scope.interconnectSmppAgentConnectionDefinitionList.list, {
                        name: interconnectSmppAgentConnectionDefinition.name
                    });
                    $scope.interconnectSmppAgentConnectionDefinitionList.list = _.without($scope.interconnectSmppAgentConnectionDefinitionList.list, deletedListItem);

                    $scope.interconnectSmppAgentConnectionDefinitionList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete Interconnect Smpp Agent Connection Definition: ', response);
                });
            });
        };

    });

    SmscInterconnectSMPPAgentConnectionDefinitionsOperationsModule.controller('SmscNewInterconnectSMPPAgentConnectionDefinitionOperationsCtrl', function ($scope, $state, $stateParams, $log, $filter, $uibModal, $translate, notification,
                                                                                                                                                                        Restangular, NgTableParams, NgTableService, SmscConfService,
                                                                                                                                                                        interconnectSmppAgentConnectionDefinitions, SMPP_APPS_DIRECTIONS, STATUS_TYPES) {
        $log.debug('SmscNewInterconnectSMPPAgentConnectionDefinitionOperationsCtrl');

        $scope.agentName = $stateParams.agentName;
        $scope.SMPP_APPS_DIRECTIONS = SMPP_APPS_DIRECTIONS;
        $scope.STATUS_TYPES = STATUS_TYPES;

        $scope.interconnectSmppAgentConnectionDefinitionList = Restangular.stripRestangular(interconnectSmppAgentConnectionDefinitions);

        $scope.interconnectSmppAgentConnectionDefinition = {
            status: STATUS_TYPES[0],
            direction: SMPP_APPS_DIRECTIONS[0],
            port: 16000
        };

        $scope.save = function (interconnectSmppAgentConnectionDefinition) {
            var interconnectSmppAgentConnectionDefinitionItem = {
                "name": interconnectSmppAgentConnectionDefinition.name,
                "active": (interconnectSmppAgentConnectionDefinition.status.value === 0), // 0 means ACTIVE
                "direction": interconnectSmppAgentConnectionDefinition.direction,
                "remoteIpAddress": interconnectSmppAgentConnectionDefinition.remoteIpAddress,
                "port": interconnectSmppAgentConnectionDefinition.port,
                "systemId": interconnectSmppAgentConnectionDefinition.systemId,
                "password": interconnectSmppAgentConnectionDefinition.password,
                "systemType": interconnectSmppAgentConnectionDefinition.systemType
            };

            SmscConfService.createOrUpdateInterconnectSmppAgentConnectionDefinition($scope.agentName, interconnectSmppAgentConnectionDefinitionItem).then(function (response) {
                $log.debug('Added Interconnect Smpp Agent Connection Definition: ', response);

                var apiResponse = Restangular.stripRestangular(response);

                // If there is an error message appears a notification bar.
                if (apiResponse.errorMsg) {
                    notification({
                        type: 'danger',
                        text: apiResponse.errorMsg
                    });
                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $scope.cancel();
                }
            }, function (response) {
                $log.debug('Cannot add Interconnect Smpp Agent Connection Definition: ', response);
            });
        };

        $scope.cancel = function () {
            $state.transitionTo('products.smsc.operations.interconnect-agents.smpp-connectiondefinitions', {agentName: $scope.agentName}, {
                reload: true,
                inherit: true,
                notify: true
            });
        };

    });

    SmscInterconnectSMPPAgentConnectionDefinitionsOperationsModule.controller('SmscUpdateInterconnectSMPPAgentConnectionDefinitionOperationsCtrl', function ($scope, $state, $stateParams, $log, $filter, $uibModal, $translate, notification,
                                                                                                                                                                           Restangular, NgTableParams, NgTableService, SmscConfService,
                                                                                                                                                                           interconnectSmppAgentConnectionDefinitions, SMPP_APPS_DIRECTIONS, STATUS_TYPES) {
        $log.debug('SmscUpdateInterconnectSMPPAgentConnectionDefinitionOperationsCtrl');

        $scope.agentName = $stateParams.agentName;
        $scope.SMPP_APPS_DIRECTIONS = SMPP_APPS_DIRECTIONS;
        $scope.STATUS_TYPES = STATUS_TYPES;

        $scope.interconnectSmppAgentConnectionDefinitionList = Restangular.stripRestangular(interconnectSmppAgentConnectionDefinitions);
        $scope.interconnectSmppAgentConnectionDefinition = _.findWhere($scope.interconnectSmppAgentConnectionDefinitionList, {name: $stateParams.connectionDefinitionName});
        $scope.interconnectSmppAgentConnectionDefinition.status = ($scope.interconnectSmppAgentConnectionDefinition.active ? STATUS_TYPES[0] : STATUS_TYPES[1]);
        $scope.interconnectSmppAgentConnectionDefinition.id = $scope.interconnectSmppAgentConnectionDefinition.name;

        $scope.interconnectSmppAgentConnectionDefinitionOriginal = angular.copy($scope.interconnectSmppAgentConnectionDefinition);
        $scope.isInterconnectSmppAgentConnectionDefinitionNotChanged = function () {
            return angular.equals($scope.interconnectSmppAgentConnectionDefinition, $scope.interconnectSmppAgentConnectionDefinitionOriginal);
        };

        $scope.save = function (interconnectSmppAgentConnectionDefinition) {
            var interconnectSmppAgentConnectionDefinitionItem = {
                "name": $scope.interconnectSmppAgentConnectionDefinitionOriginal.name,
                "active": (interconnectSmppAgentConnectionDefinition.status.value === 0),
                "direction": interconnectSmppAgentConnectionDefinition.direction,
                "remoteIpAddress": interconnectSmppAgentConnectionDefinition.remoteIpAddress,
                "port": interconnectSmppAgentConnectionDefinition.port,
                "systemId": interconnectSmppAgentConnectionDefinition.systemId,
                "password": interconnectSmppAgentConnectionDefinition.password,
                "systemType": interconnectSmppAgentConnectionDefinition.systemType
            };

            SmscConfService.createOrUpdateInterconnectSmppAgentConnectionDefinition($scope.agentName, interconnectSmppAgentConnectionDefinitionItem).then(function (response) {
                $log.debug('Updated Interconnect Smpp Agent Connection Definition: ', response);

                var apiResponse = Restangular.stripRestangular(response);

                // If there is an error message appears a notification bar.
                if (apiResponse.errorMsg) {
                    notification({
                        type: 'danger',
                        text: apiResponse.errorMsg
                    });
                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $scope.cancel();
                }
            }, function (response) {
                $log.debug('Cannot update Interconnect Smpp Agent Connection Definition: ', response);
            });
        };

        $scope.cancel = function () {
            $state.transitionTo('products.smsc.operations.interconnect-agents.smpp-connectiondefinitions', {agentName: $scope.agentName}, {
                reload: true,
                inherit: true,
                notify: true
            });
        };

    });

    SmscInterconnectSMPPAgentConnectionDefinitionsOperationsModule.directive('listInterconnectSmppAgentsConnectionDefinitionAvailabilityCheck', function () {
        var checkAvailability = function (scope, elem, ctrl, value) {
            var currentList = scope.interconnectSmppAgentConnectionDefinitionList;

            scope.form.name.$setValidity('availabilityCheck', true);

            var indexOf = _.indexOf(_.pluck(currentList, 'name'), value);
            var isAvailable = indexOf > -1;

            ctrl.$setValidity('availabilityCheck', !isAvailable);

            // returns availability value.
            return value;
        };

        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, elem, attr, ctrl) {
                // add a parser that will process each time the value is
                // parsed into the model when input updates it.
                ctrl.$parsers.unshift(function (value) {
                    return checkAvailability(scope, elem, ctrl, value);
                });

                // add a formatter that will process each time the value
                // is updated on the DOM element.
                ctrl.$formatters.unshift(function (value) {
                    return checkAvailability(scope, elem, ctrl, value);
                });
            }
        };
    });

})();
