(function () {

    'use strict';

    angular.module('adminportal.subsystems.contentmanagement.operations.rbt.events', []);

    var ContentManagementOperationsEventsRBTModule = angular.module('adminportal.subsystems.contentmanagement.operations.rbt.events');

    ContentManagementOperationsEventsRBTModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.contentmanagement.operations.rbt.events', {
            abstract: true,
            url: "/events",
            template: '<div ui-view></div>',
            data: {
                exportFileName: 'EventsRBT',
                permissions: [
                    'RBT__OPERATIONS_EVENT_READ'
                ]
            },
            resolve: {
                tones: function (ContentManagementService, DEFAULT_REST_QUERY_LIMIT) {
                    return ContentManagementService.getTones(0, DEFAULT_REST_QUERY_LIMIT);
                },
                signatures: function (RBTContentManagementService) {
                    return RBTContentManagementService.getPredefinedSignatures();
                }
            }
        }).state('subsystems.contentmanagement.operations.rbt.events.list', {
            url: "",
            templateUrl: "subsystems/contentmanagement/operations/rbt/operations.events.html",
            controller: 'ContentManagementOperationsEventsRBTCtrl',
            resolve: {
                events: function (RBTContentManagementService) {
                    return RBTContentManagementService.getEvents();
                }
            }
        }).state('subsystems.contentmanagement.operations.rbt.events.new', {
            url: "/new",
            templateUrl: "subsystems/contentmanagement/operations/rbt/operations.events.details.html",
            controller: 'ContentManagementOperationsEventsRBTNewCtrl'
        }).state('subsystems.contentmanagement.operations.rbt.events.update', {
            url: "/update/:id",
            templateUrl: "subsystems/contentmanagement/operations/rbt/operations.events.details.html",
            controller: 'ContentManagementOperationsEventsRBTUpdateCtrl',
            resolve: {
                event: function ($stateParams, RBTContentManagementService) {
                    return RBTContentManagementService.getEvent($stateParams.id);
                }
            }
        });

    });

    ContentManagementOperationsEventsRBTModule.controller('ContentManagementOperationsEventsRBTCommonCtrl', function ($scope, $log, $state, $filter, $uibModal, $controller, tones, signatures) {
        $log.debug('ContentManagementOperationsEventsRBTCommonCtrl');

        $controller('GenericDateTimeCtrl', {$scope: $scope});

        $scope.toneList = tones ? tones.items : [];
        $scope.toneList = $filter('orderBy')($scope.toneList, 'name');

        $scope.signatureList = signatures ? signatures : [];
        $scope.signatureList = $filter('orderBy')($scope.signatureList, 'alias');

        $scope.cancel = function () {
            $state.go('subsystems.contentmanagement.operations.rbt.events.list');
        };
    });

    ContentManagementOperationsEventsRBTModule.controller('ContentManagementOperationsEventsRBTCtrl', function ($scope, $log, $controller, $state, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                Restangular, UtilService, DateTimeConstants, RBTContentManagementService, events) {
        $log.debug('ContentManagementOperationsEventsRBTCtrl');

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'id',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.Events.Id'
                },
                {
                    fieldName: 'name',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.Events.Name'
                },
                {
                    fieldName: 'startDate',
                    headerKey: 'GenericFormFields.StartDate.Label',
                    filter: {name: 'date', params: ['yyyy-MM-dd', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'endDate',
                    headerKey: 'GenericFormFields.EndDate.Label',
                    filter: {name: 'date', params: ['yyyy-MM-dd', DateTimeConstants.OFFSET]}
                }
            ]
        };

        _.each(events, function (event) {
            var startDate = event.startDate;
            if (startDate) {
                if (startDate.year) {
                    event.startDate = UtilService.convertToDate(startDate.year, startDate.monthValue, startDate.dayOfMonth);
                } else {
                    event.startDate = moment(startDate + ' 00:00:00', 'DD-MM-YYYY HH:mm:ss').utcOffset(DateTimeConstants.OFFSET).toDate();
                }
            }

            var endDate = event.endDate;
            if (endDate) {
                if (endDate.year) {
                    event.endDate = UtilService.convertToDate(endDate.year, endDate.monthValue, endDate.dayOfMonth);
                } else {
                    event.endDate = moment(endDate + ' 00:00:00', 'DD-MM-YYYY HH:mm:ss').utcOffset(DateTimeConstants.OFFSET).toDate();
                }
            }
        });

        // Event list
        $scope.eventList = {
            list: events,
            tableParams: {}
        };

        $scope.eventList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "id": 'asc'
            }
        }, {
            total: $scope.eventList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.eventList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.eventList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Event list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.eventList.tableParams.settings().$scope.filterText = filterText;
            $scope.eventList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.eventList.tableParams.page(1);
            $scope.eventList.tableParams.reload();
        }, 750);

        $scope.remove = function (event) {
            event.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                event.rowSelected = false;

                $log.debug('Removing event: ', event);

                RBTContentManagementService.deleteEvent(event).then(function (response) {
                    $log.debug('Removed event: ', event, ', response: ', response);

                    if (response && response.errorCode) {
                        RBTContentManagementService.showApiError(response);
                    } else {
                        var deletedListItem = _.findWhere($scope.eventList.list, {id: event.id});
                        $scope.eventList.list = _.without($scope.eventList.list, deletedListItem);

                        $scope.eventList.tableParams.reload();

                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });
                    }
                }, function (response) {
                    $log.debug('Cannot remove event: ', event, ', response: ', response);

                    RBTContentManagementService.showApiError(response);
                });
            }, function () {
                event.rowSelected = false;
            });
        };
    });

    ContentManagementOperationsEventsRBTModule.controller('ContentManagementOperationsEventsRBTNewCtrl', function ($scope, $log, $controller, $filter, $translate, notification, UtilService, DateTimeConstants,
                                                                                                                   RBTContentManagementService, tones, signatures) {
        $log.debug('ContentManagementOperationsEventsRBTNewCtrl');

        $controller('ContentManagementOperationsEventsRBTCommonCtrl', {
            $scope: $scope,
            tones: tones,
            signatures: signatures
        });

        $scope.dateHolder.startDate = null;
        $scope.dateHolder.endDate = null;

        $scope.event = {};

        $scope.save = function (event) {
            var eventItem = {
                "name": event.name,
                "startDate": ($scope.dateHolder.startDate ? $filter('date')($scope.dateHolder.startDate, 'dd-MM-yyyy') : ''),
                "endDate": ($scope.dateHolder.endDate ? $filter('date')($scope.dateHolder.endDate, 'dd-MM-yyyy') : ''),
                "toneId": event.toneId,
                "signatureId": event.signatureId
            };

            $log.debug('Creating event: ', eventItem);

            RBTContentManagementService.createEvent(eventItem).then(function (response) {
                $log.debug('Created event: ', eventItem, ', response: ', response);

                if (response && response.errorCode) {
                    RBTContentManagementService.showApiError(response);
                } else {
                    notification.flash({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $scope.cancel();
                }
            }, function (response) {
                $log.debug('Cannot create event: ', eventItem, ', response: ', response);

                RBTContentManagementService.showApiError(response);
            });
        };
    });

    ContentManagementOperationsEventsRBTModule.controller('ContentManagementOperationsEventsRBTUpdateCtrl', function ($scope, $log, $controller, $stateParams, $filter, $translate, notification, Restangular, UtilService,
                                                                                                                      DateTimeConstants, RBTContentManagementService, tones, signatures, event) {
        $log.debug('ContentManagementOperationsEventsRBTUpdateCtrl');

        $controller('ContentManagementOperationsEventsRBTCommonCtrl', {
            $scope: $scope,
            tones: tones,
            signatures: signatures
        });

        $scope.event = event;

        $scope.dateHolder = {};
        var startDate = $scope.event.startDate;
        if (startDate) {
            if (startDate.year) {
                $scope.event.startDate = UtilService.convertToDate(startDate.year, startDate.monthValue, startDate.dayOfMonth);
            } else {
                $scope.event.startDate = moment(startDate + ' 00:00:00', 'DD-MM-YYYY HH:mm:ss').utcOffset(DateTimeConstants.OFFSET).toDate();
            }

            $scope.dateHolder.startDate = $scope.event.startDate;
        }

        var endDate = $scope.event.endDate;
        if (endDate) {
            if (endDate.year) {
                $scope.event.endDate = UtilService.convertToDate(endDate.year, endDate.monthValue, endDate.dayOfMonth);
            } else {
                $scope.event.endDate = moment(endDate + ' 00:00:00', 'DD-MM-YYYY HH:mm:ss').utcOffset(DateTimeConstants.OFFSET).toDate();
            }

            $scope.dateHolder.endDate = $scope.event.endDate;
        }

        $scope.originalEvent = angular.copy($scope.event);
        $scope.dateHolderOriginal = angular.copy($scope.dateHolder);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalEvent, $scope.event) &&
                angular.equals($scope.dateHolder, $scope.dateHolderOriginal);
        };

        $scope.save = function (event) {
            var eventItem = {
                "id": $scope.originalEvent.id,
                // Changed values
                "name": event.name,
                "startDate": ($scope.dateHolder.startDate ? $filter('date')($scope.dateHolder.startDate, 'dd-MM-yyyy') : ''),
                "endDate": ($scope.dateHolder.endDate ? $filter('date')($scope.dateHolder.endDate, 'dd-MM-yyyy') : ''),
                "toneId": event.toneId,
                "signatureId": event.signatureId
            };

            $log.debug('Updating event: ', eventItem);

            RBTContentManagementService.updateEvent(eventItem).then(function (response) {
                $log.debug('Updated event: ', eventItem, ', response: ', response);

                if (response && response.errorCode) {
                    RBTContentManagementService.showApiError(response);
                } else {
                    notification.flash({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $scope.cancel();
                }
            }, function (response) {
                $log.debug('Cannot update event: ', eventItem, ', response: ', response);

                RBTContentManagementService.showApiError(response);
            });
        };
    });

})();
