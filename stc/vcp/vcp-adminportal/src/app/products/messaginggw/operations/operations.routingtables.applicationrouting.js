(function () {

    'use strict';

    angular.module('adminportal.products.messaginggw.operations.routingtables.applicationrouting', [
        'adminportal.products.messaginggw.operations.routingtables.applicationrouting.routingpattern',
        'adminportal.products.messaginggw.operations.routingtables.applicationrouting.routingtest'
    ]);

    var MessagingGwOperationsRoutingTablesApplicationRoutingModule = angular.module('adminportal.products.messaginggw.operations.routingtables.applicationrouting');

    MessagingGwOperationsRoutingTablesApplicationRoutingModule.config(function ($stateProvider) {

        $stateProvider.state('products.messaginggw.operations.routingtables.applicationrouting', {
            url: "/applications",
            templateUrl: "products/messaginggw/operations/operations.routingtables.applicationrouting.html",
            controller: 'MessagingGwOperationsRoutingTablesApplicationRoutingCtrl',
            resolve: {
                smppApplicationRoutings: function (MessagingGwProvService) {
                    return MessagingGwProvService.getSMPPApplicationRoutings();
                },
                services: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllServices();
                },
                organizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizations(false, true, [CMPFService.OPERATOR_PROFILE]);
                }
            }
        }).state('products.messaginggw.operations.routingtables.applicationrouting-new', {
            url: "/applications/new",
            templateUrl: "products/messaginggw/operations/operations.routingtables.applicationrouting.details.html",
            controller: 'MessagingGwRoutingTablesNewApplicationRoutingOperationsCtrl',
            resolve: {
                services: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllServices();
                },
                organizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizations(false, true, [CMPFService.OPERATOR_PROFILE]);
                }
            }
        });

    });

    MessagingGwOperationsRoutingTablesApplicationRoutingModule.controller('MessagingGwOperationsRoutingTablesApplicationRoutingCtrl', function ($scope, $state, $log, $translate, $filter, notification, $uibModal, UtilService,
                                                                                                                                                MessagingGwProvService, Restangular, NgTableParams, NgTableService, smppApplicationRoutings,
                                                                                                                                                services, organizations) {
        $log.debug('MessagingGwOperationsRoutingTablesApplicationRoutingCtrl');

        var smppApplicationRoutingList = Restangular.stripRestangular(smppApplicationRoutings);

        $scope.services = Restangular.stripRestangular(services).services;

        var organizationList = Restangular.stripRestangular(organizations).organizations;

        smppApplicationRoutingList = _.filter(smppApplicationRoutingList, function (smppApplicationRouting) {
            smppApplicationRouting.smppApplication = _.findWhere($scope.services, {id: smppApplicationRouting.applicationId});
            if (!_.isUndefined(smppApplicationRouting.smppApplication)) {
                smppApplicationRouting.organization = _.findWhere(organizationList, {id: smppApplicationRouting.smppApplication.organizationId});

                $log.debug("Found SMPP Application: ", smppApplicationRouting.smppApplication, ", Organization: ", smppApplicationRouting.organization);

                return true;
            } else {
                $log.debug("SMPP Application cannot found: ", smppApplicationRouting);

                return false;
            }
        });
        smppApplicationRoutingList = $filter('orderBy')(smppApplicationRoutingList, ['smppApplication.name']);

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'smppApplication.name',
                    headerKey: 'Products.MessagingGw.Operations.RoutingTables.TableColumns.SMPPApplication'
                },
                {
                    fieldName: 'organization.name',
                    headerKey: 'Products.MessagingGw.Operations.RoutingTables.TableColumns.Organization'
                },
                {
                    fieldName: 'rangeStart',
                    headerKey: 'Products.MessagingGw.Operations.RoutingTables.TableColumns.Start'
                },
                {
                    fieldName: 'rangeEnd',
                    headerKey: 'Products.MessagingGw.Operations.RoutingTables.TableColumns.End'
                }
            ]
        };

        // SMPP Application Routing list
        $scope.smppApplicationRoutingList = {
            list: smppApplicationRoutingList,
            tableParams: {}
        };

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.smppApplicationRoutingList.tableParams.settings().$scope.filterText = filterText;
            $scope.smppApplicationRoutingList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.smppApplicationRoutingList.tableParams.page(1);
            $scope.smppApplicationRoutingList.tableParams.reload();
        }, 500);

        $scope.smppApplicationRoutingList.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "smppApplication.name": 'asc'
            }
        }, {
            total: $scope.smppApplicationRoutingList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.smppApplicationRoutingList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.smppApplicationRoutingList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - SMPP Application Routing list

        $scope.remove = function (smppApplicationRouting) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: function ($scope, $uibModalInstance, $translate, $controller, $sce) {
                    var message = $translate.instant('CommonLabels.ConfirmationRemoveMessage');
                    message = message + ' [' + smppApplicationRouting.smppApplication.name + ', ' + smppApplicationRouting.rangeStart + ', ' + smppApplicationRouting.rangeEnd + ']';
                    $scope.confirmationMessage = $sce.trustAsHtml(message);

                    $controller('ConfirmationModalInstanceCtrl', {
                        $scope: $scope,
                        $uibModalInstance: $uibModalInstance
                    });
                },
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing Smpp Application Routing: ', smppApplicationRouting);

                MessagingGwProvService.deleteSMPPApplicationRouting(smppApplicationRouting.applicationId, smppApplicationRouting.rangeStart, smppApplicationRouting.rangeEnd).then(function (response) {
                    $log.debug('Removed Smpp Application Routing: ', response);

                    var deletedListItem = _.findWhere($scope.smppApplicationRoutingList.list, {
                        rangeStart: smppApplicationRouting.rangeStart,
                        rangeEnd: smppApplicationRouting.rangeEnd
                    });
                    $scope.smppApplicationRoutingList.list = _.without($scope.smppApplicationRoutingList.list, deletedListItem);

                    $scope.smppApplicationRoutingList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete Smpp Application Routing: ', response);
                });
            });
        };

        // Opens the routing pattern management modal.
        $scope.setRoutingPattern = function (smppApplicationRouting) {
            $uibModal.open({
                templateUrl: 'products/messaginggw/operations/operations.routingtables.applicationrouting.routingpattern.modal.html',
                size: 'lg',
                controller: 'MessagingGwOperationsRoutingTablesApplicationRoutingPatternCtrl',
                resolve: {
                    smppApplicationRouting: function (MessagingGwProvService) {
                        return MessagingGwProvService.getSMPPApplicationRoutingByRange(smppApplicationRouting.applicationId, smppApplicationRouting.rangeStart, smppApplicationRouting.rangeEnd);
                    },
                    applicationName: function () {
                        return smppApplicationRouting.smppApplication.name;
                    }
                }
            });
        };

        // Opens the routing test form.
        $scope.showRoutingTestForm = function () {
            $uibModal.open({
                templateUrl: 'products/messaginggw/operations/operations.routingtables.applicationrouting.routingtest.modal.html',
                size: 'lg',
                controller: 'MessagingGwOperationsRoutingTablesApplicationRoutingTestCtrl'
            });
        };

    });

    MessagingGwOperationsRoutingTablesApplicationRoutingModule.controller('MessagingGwRoutingTablesNewApplicationRoutingOperationsCtrl', function ($scope, $state, $log, $translate, $filter, notification, MessagingGwProvService,
                                                                                                                                                   Restangular, services, organizations) {
        $log.debug("MessagingGwRoutingTablesNewApplicationRoutingOperationsCtrl");

        $scope.services = Restangular.stripRestangular(services).services;
        $scope.services = $filter('orderBy')($scope.services, 'name');

        $scope.smppApplicationRouting = {};

        $scope.save = function (smppApplicationRouting) {
            var rangeItem = {
                "applicationId": smppApplicationRouting.smppApplication.id,
                "rangeStart": smppApplicationRouting.rangeStart,
                "rangeEnd": smppApplicationRouting.rangeEnd
            };

            MessagingGwProvService.createSMPPApplicationRouting(rangeItem).then(function (response) {
                $log.debug('Added Smpp Application Routing: ', response);

                var apiResponse = Restangular.stripRestangular(response);

                if (apiResponse.errorCode) {
                    var message = '';

                    if (apiResponse.errorMsg.indexOf('already') > -1) {
                        message = $translate.instant('Products.MessagingGw.Operations.RoutingTables.Messages.AlreadyDefinedError', {
                            range: rangeItem.rangeStart + '_' + rangeItem.rangeEnd
                        });
                    } else if (apiResponse.errorMsg.indexOf('Overlap') > -1) {
                        var msgObj = _.object(_.compact(_.map(apiResponse.errorMsg.split(';'), function (item) {
                            if (item) return item.split(/=(.+)?/);
                        })));

                        var definedRange = msgObj['msggwdestinationAddressRange.adressRangeStart'].split(/,.+?=/);
                        var definedRangeStart = definedRange[0];
                        var definedRangeEnd = definedRange[1];

                        message = $translate.instant('Products.MessagingGw.Operations.RoutingTables.Messages.RangeOverlappedError', {
                            range: definedRangeStart + '_' + definedRangeEnd
                        });
                    } else {
                        message = apiResponse.errorMsg;
                    }

                    notification({
                        type: 'warning',
                        text: message
                    });
                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $state.go('products.messaginggw.operations.routingtables.applicationrouting');
                }
            }, function (response) {
                $log.debug('Cannot add Smpp Application Routing: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go('products.messaginggw.operations.routingtables.applicationrouting');
        };

    });

})();
