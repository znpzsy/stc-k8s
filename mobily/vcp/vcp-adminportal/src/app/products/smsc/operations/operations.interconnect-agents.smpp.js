(function () {

    'use strict';

    angular.module('adminportal.products.smsc.operations.interconnect-agents.smpp', [
        'adminportal.products.smsc.operations.interconnect-agents.smpp.connectiondefinitions'
    ]);

    var SmscInterconnectSMPPAgentsOperationsModule = angular.module('adminportal.products.smsc.operations.interconnect-agents.smpp');

    SmscInterconnectSMPPAgentsOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('products.smsc.operations.interconnect-agents.smpp', {
            url: "/smpp",
            templateUrl: "products/smsc/operations/operations.interconnect-agents.smpp.html",
            controller: 'SmscInterconnectSMPPAgentsOperationsCtrl',
            resolve: {
                interconnectSmppAgents: function (SmscConfService) {
                    return SmscConfService.getInterconnectSmppAgents();
                }
            }
        }).state('products.smsc.operations.interconnect-agents.smpp-new', {
            url: "/smpp/new",
            templateUrl: "products/smsc/operations/operations.interconnect-agents.smpp.details.html",
            controller: 'SmscNewInterconnectSMPPAgentOperationsCtrl',
            resolve: {
                interconnectSmppAgents: function (SmscConfService) {
                    return SmscConfService.getInterconnectSmppAgents();
                }
            }
        }).state('products.smsc.operations.interconnect-agents.smpp-update', {
            url: "/smpp/update/:agentName",
            templateUrl: "products/smsc/operations/operations.interconnect-agents.smpp.details.html",
            controller: 'SmscUpdateInterconnectSMPPAgentOperationsCtrl',
            resolve: {
                interconnectSmppAgents: function (SmscConfService) {
                    return SmscConfService.getInterconnectSmppAgents();
                }
            }
        });

    });

    SmscInterconnectSMPPAgentsOperationsModule.controller('SmscInterconnectSMPPAgentsOperationsCtrl', function ($scope, $state, $log, $filter, $uibModal, $translate, notification, Restangular,
                                                                                                                              NgTableParams, NgTableService, SmscConfService, interconnectSmppAgents) {
        $log.debug('SmscInterconnectSMPPAgentsOperationsCtrl');

        var interconnectSmppAgentList = Restangular.stripRestangular(interconnectSmppAgents);
        interconnectSmppAgentList = $filter('orderBy')(interconnectSmppAgentList, 'name');

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'name',
                    headerKey: 'Products.SMSC.Operations.InterconnectAgents.SmppApps.TableColumns.Name'
                },
                {
                    fieldName: 'description',
                    headerKey: 'Products.SMSC.Operations.InterconnectAgents.SmppApps.TableColumns.Description'
                },
                {
                    fieldName: 'outgoingPduTypePolicy',
                    headerKey: 'Products.SMSC.Operations.InterconnectAgents.SmppApps.TableColumns.OutgoingPduTypePolicy',
                    filter: {name: 'SmscPduTypeFilter'}
                },
                {
                    fieldName: 'active',
                    headerKey: 'Products.SMSC.Operations.InterconnectAgents.SmppApps.TableColumns.State',
                    filter: {name: 'StatusTypeFilter'}
                }
            ]
        };

        // Interconnect Smpp Agent list
        $scope.interconnectSmppAgentList = {
            list: interconnectSmppAgentList,
            tableParams: {}
        };

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.interconnectSmppAgentList.tableParams.settings().$scope.filterText = filterText;
            $scope.interconnectSmppAgentList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.interconnectSmppAgentList.tableParams.page(1);
            $scope.interconnectSmppAgentList.tableParams.reload();
        }, 750);

        $scope.interconnectSmppAgentList.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "name": 'asc' // initial sorting
            }
        }, {
            total: $scope.interconnectSmppAgentList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.interconnectSmppAgentList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.interconnectSmppAgentList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Interconnect Smpp Agent list

        $scope.removeInterconnectSmppAgent = function (interconnectSmppAgent) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing Interconnect Smpp Agent: ', interconnectSmppAgent);

                SmscConfService.deleteInterconnectSmppAgent(interconnectSmppAgent.name).then(function (response) {
                    $log.debug('Removed Interconnect Smpp Agent: ', response);

                    var apiResponse = Restangular.stripRestangular(response);

                    if (apiResponse.errorCode) {
                        var message = '';

                        if (apiResponse.errorMsg) {
                            if (apiResponse.errorMsg.indexOf('has subordinates') > -1) {
                                message = $translate.instant('Products.SMSC.Operations.InterconnectAgents.SmppApps.Messages.HasSubordinates');
                            } else {
                                message = apiResponse.errorMsg;
                            }
                        } else {
                            message = $translate.instant('CommonMessages.GenericServerError');
                        }

                        notification({
                            type: 'danger',
                            text: message
                        });
                    } else {
                        var deletedListItem = _.findWhere($scope.interconnectSmppAgentList.list, {
                            name: interconnectSmppAgent.name
                        });
                        $scope.interconnectSmppAgentList.list = _.without($scope.interconnectSmppAgentList.list, deletedListItem);

                        $scope.interconnectSmppAgentList.tableParams.reload();

                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });
                    }
                }, function (response) {
                    $log.debug('Cannot delete Interconnect Smpp Agent: ', response);
                });
            });
        };

    });

    SmscInterconnectSMPPAgentsOperationsModule.controller('SmscNewInterconnectSMPPAgentOperationsCtrl', function ($scope, $state, $log, $filter, $uibModal, $translate, notification, Restangular,
                                                                                                                                NgTableParams, NgTableService, SmscConfService, interconnectSmppAgents,
                                                                                                                                PDU_TYPES, STATUS_TYPES) {
        $log.debug('SmscNewInterconnectSMPPAgentOperationsCtrl');

        $scope.PDU_TYPES = PDU_TYPES;
        $scope.STATUS_TYPES = STATUS_TYPES;

        $scope.interconnectSmppAgentList = Restangular.stripRestangular(interconnectSmppAgents);

        $scope.interconnectSmppAgent = {
            status: STATUS_TYPES[0],
            outgoingPduTypePolicy: PDU_TYPES[0],
            enableStatisticsCollection: false,
            resetStatisticCounters: false
        };

        $scope.save = function (interconnectSmppAgent) {
            var interconnectSmppAgentItem = {
                "name": interconnectSmppAgent.name,
                "description": interconnectSmppAgent.description,
                "active": (interconnectSmppAgent.status.value === 0), // active === 0 means ACTIVE
                "outgoingPduTypePolicy": interconnectSmppAgent.outgoingPduTypePolicy.value,
                "enableStatisticsCollection": interconnectSmppAgent.enableStatisticsCollection,
                "resetStatisticCounters": interconnectSmppAgent.resetStatisticCounters
            };

            SmscConfService.createOrUpdateInterconnectSmppAgent(interconnectSmppAgentItem).then(function (response) {
                $log.debug('Added Interconnect Smpp Agent: ', response);

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
                $log.debug('Cannot add Interconnect Smpp Agent: ', response);
            });
        };

        $scope.cancel = function () {
            $state.transitionTo('products.smsc.operations.interconnect-agents.smpp', {}, {
                reload: true,
                inherit: true,
                notify: true
            });
        };

    });

    SmscInterconnectSMPPAgentsOperationsModule.controller('SmscUpdateInterconnectSMPPAgentOperationsCtrl', function ($scope, $state, $stateParams, $log, $filter, $uibModal, $translate, notification, Restangular,
                                                                                                                                   NgTableParams, NgTableService, SmscConfService, interconnectSmppAgents,
                                                                                                                                   PDU_TYPES, STATUS_TYPES) {
        $log.debug('SmscUpdateInterconnectSMPPAgentOperationsCtrl');

        $scope.PDU_TYPES = PDU_TYPES;
        $scope.STATUS_TYPES = STATUS_TYPES;

        $scope.interconnectSmppAgentList = Restangular.stripRestangular(interconnectSmppAgents);
        $scope.interconnectSmppAgent = _.findWhere($scope.interconnectSmppAgentList, {name: $stateParams.agentName});
        $scope.interconnectSmppAgent.outgoingPduTypePolicy = _.findWhere(PDU_TYPES, {value: Number($scope.interconnectSmppAgent.outgoingPduTypePolicy)});
        $scope.interconnectSmppAgent.status = ($scope.interconnectSmppAgent.active ? STATUS_TYPES[0] : STATUS_TYPES[1]);
        $scope.interconnectSmppAgent.id = $scope.interconnectSmppAgent.name;

        $scope.interconnectSmppAgentOriginal = angular.copy($scope.interconnectSmppAgent);
        $scope.isInterconnectSmppAgentNotChanged = function () {
            return angular.equals($scope.interconnectSmppAgent, $scope.interconnectSmppAgentOriginal);
        };

        $scope.save = function (interconnectSmppAgent) {
            var interconnectSmppAgentItem = {
                "name": $scope.interconnectSmppAgentOriginal.name,
                "description": interconnectSmppAgent.description,
                "active": (interconnectSmppAgent.status.value === 0),
                "outgoingPduTypePolicy": interconnectSmppAgent.outgoingPduTypePolicy.value,
                "enableStatisticsCollection": interconnectSmppAgent.enableStatisticsCollection,
                "resetStatisticCounters": interconnectSmppAgent.resetStatisticCounters
            };

            SmscConfService.createOrUpdateInterconnectSmppAgent(interconnectSmppAgentItem).then(function (response) {
                $log.debug('Updated Interconnect Smpp Agent: ', response);

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
                $log.debug('Cannot update Interconnect Smpp Agent: ', response);
            });
        };

        $scope.cancel = function () {
            $state.transitionTo('products.smsc.operations.interconnect-agents.smpp', {}, {
                reload: true,
                inherit: true,
                notify: true
            });
        };

    });

    SmscInterconnectSMPPAgentsOperationsModule.directive('listInterconnectSmppAgentsAvailabilityCheck', function () {
        var checkAvailability = function (scope, elem, ctrl, value) {
            var currentList = scope.interconnectSmppAgentList;

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
