(function () {

    'use strict';

    angular.module('adminportal.products.smsc.operations.routingtables.applicationrouting', []);

    var SmscRoutingTablesApplicationRoutingOperationsModule = angular.module('adminportal.products.smsc.operations.routingtables.applicationrouting');

    SmscRoutingTablesApplicationRoutingOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('products.smsc.operations.routingtables.applicationrouting', {
            url: "/applications",
            templateUrl: "products/smsc/operations/operations.routingtables.applicationrouting.html",
            controller: 'SmscRoutingTablesApplicationRoutingOperationsCtrl',
            resolve: {
                smppApplicationRoutings: function (SmscConfService) {
                    return SmscConfService.getAllSMPPApplicationRoutings();
                },
                smppApplications: function (SmscProvService) {
                    return SmscProvService.getAllSMPPApplications();
                },
                organizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizations(0, DEFAULT_REST_QUERY_LIMIT);
                }
            }
        }).state('products.smsc.operations.routingtables.applicationrouting-new', {
            url: "/applications/new",
            templateUrl: "products/smsc/operations/operations.routingtables.applicationrouting.details.html",
            controller: 'SmscRoutingTablesNewApplicationRoutingOperationsCtrl',
            resolve: {
                smppApplications: function (SmscProvService) {
                    return SmscProvService.getAllSMPPApplications();
                },
                organizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizations(0, DEFAULT_REST_QUERY_LIMIT);
                }
            }
        });

    });

    SmscRoutingTablesApplicationRoutingOperationsModule.controller('SmscRoutingTablesApplicationRoutingOperationsCtrl', function ($scope, $state, $log, $translate, $filter, notification, $uibModal, UtilService, SmscConfService,
                                                                                                                                        Restangular, NgTableParams, NgTableService, smppApplicationRoutings, smppApplications, organizations,
                                                                                                                                        ReportingExportService) {
        $log.debug('SmscRoutingTablesApplicationRoutingOperationsCtrl');

        var smppApplicationRoutingList = Restangular.stripRestangular(smppApplicationRoutings);
        var smppApplicationList = Restangular.stripRestangular(smppApplications);
        var organizationList = Restangular.stripRestangular(organizations).organizations;

        smppApplicationRoutingList = _.each(smppApplicationRoutingList, function (smppApplicationRouting) {
            // For organization list
            smppApplicationRouting.smppApplication = _.findWhere(smppApplicationList, {id: smppApplicationRouting.applicationId});
            if (!_.isUndefined(smppApplicationRouting.smppApplication)) {
                smppApplicationRouting.organization = _.findWhere(organizationList, {id: smppApplicationRouting.smppApplication.organizationId});

                $log.debug("Found SMPP Application: ", smppApplicationRouting.smppApplication, ", Organization: ", smppApplicationRouting.organization);
            } else {
                $log.debug("SMPP Application cannot found: ", smppApplicationRouting);
            }
        });

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
        }, 750);

        $scope.smppApplicationRoutingList.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "smppApplication.name": 'asc' // initial sorting
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
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing Smpp Application Routing: ', smppApplicationRouting);

                SmscConfService.deleteSmppApplicationRouting(smppApplicationRouting.applicationId, smppApplicationRouting.addRangeStart, smppApplicationRouting.addRangeEnd).then(function (response) {
                    $log.debug('Removed Smpp Application Routing: ', response);

                    var deletedListItem = _.findWhere($scope.smppApplicationRoutingList.list, {
                        addRangeStart: smppApplicationRouting.addRangeStart,
                        addRangeEnd: smppApplicationRouting.addRangeEnd
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

        $scope.exportRecords = function (mimeType) {
            var srcUrl = '/smsc-gr-rest/configuration/v1/routing/application/export?response-content-type=' + mimeType;

            $log.debug('Downloading SMSC routing tables application routing records. URL: ', srcUrl);

            ReportingExportService.showReport(srcUrl, mimeType.toUpperCase());
        };

    });

    SmscRoutingTablesApplicationRoutingOperationsModule.controller('SmscRoutingTablesNewApplicationRoutingOperationsCtrl', function ($scope, $state, $log, $translate, $filter, notification, $uibModal, SmscConfService, Restangular,
                                                                                                                                           smppApplications, organizations) {
        $log.debug("SMSCRoutingTablesNewApplicationRoutingOperationsCtrl");

        var smppApplicationList = Restangular.stripRestangular(smppApplications);
        var organizationList = Restangular.stripRestangular(organizations).organizations;

        // Initialize application list by taking organization and application names.
        $scope.smppApplicationList = _.filter(smppApplicationList, function (smppApplication) {
            smppApplication.organization = _.findWhere(organizationList, {id: smppApplication.organizationId});

            // Preparing the uib-dropdown error code as "<organization name> - <application name>"
            smppApplication.label = (smppApplication.organization ? smppApplication.organization.name + ' - ' : '') + smppApplication.name;

            $log.debug("Found SMPP Application: ", smppApplication, ", Organization: ", smppApplication.organization);

            return true;
        });
        $scope.smppApplicationList = $filter('orderBy')($scope.smppApplicationList, ['organization.name', 'name']);
        $scope.smppApplicationRouting = {};

        $scope.$watch('smppApplicationRouting.addRangeStart', function () {
            $scope.form.addRangeEnd.$setValidity('ngMinValue', true);
        });
        $scope.$watch('smppApplicationRouting.addRangeEnd', function () {
            $scope.form.addRangeStart.$setValidity('ngMaxValue', true);
        });

        $scope.save = function (smppApplicationRouting) {
            var rangeItem = {
                "applicationId": smppApplicationRouting.smppApplication.id,
                "addRangeStart": smppApplicationRouting.addRangeStart,
                "addRangeEnd": smppApplicationRouting.addRangeEnd
            };

            SmscConfService.addSmppApplicationRouting(rangeItem).then(function (response) {
                $log.debug('Added Smpp Application Routing: ', response);

                var apiResponse = Restangular.stripRestangular(response);

                if (apiResponse.errorCode) {
                    var message = '';

                    if (apiResponse.errorMsg) {
                        if (apiResponse.errorMsg.indexOf('already') > -1) {
                            message = $translate.instant('Products.SMSC.Operations.RoutingTables.Messages.AlreadyDefinedError', {
                                range: rangeItem.addRangeStart + '_' + rangeItem.addRangeEnd
                            });
                        } else if (apiResponse.errorMsg.indexOf('Overlap') > -1) {
                            var msgObj = _.object(_.compact(_.map(apiResponse.errorMsg.split(';'), function (item) {
                                if (item) return item.split(/=(.+)?/);
                            })));

                            var definedRange = msgObj['destinationAddressRange.adressRangeStart'].split(/,.+?=/);
                            var definedRangeStart = definedRange[0];
                            var definedRangeEnd = definedRange[1];

                            message = $translate.instant('Products.SMSC.Operations.RoutingTables.Messages.RangeOverlappedError', {
                                range: definedRangeStart + '_' + definedRangeEnd
                            });
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
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $state.go('products.smsc.operations.routingtables.applicationrouting');
                }
            }, function (response) {
                $log.debug('Cannot add Smpp Application Routing: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go('products.smsc.operations.routingtables.applicationrouting');
        };

    });

})();
