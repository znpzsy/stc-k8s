(function () {

    'use strict';

    angular.module('adminportal.products.messaginggw.operations.routingtables.applicationrouting.routingpattern', []);

    var MessagingGwOperationsRoutingTablesApplicationRoutingPatternModule = angular.module('adminportal.products.messaginggw.operations.routingtables.applicationrouting.routingpattern');

    MessagingGwOperationsRoutingTablesApplicationRoutingPatternModule.controller('MessagingGwOperationsRoutingTablesApplicationRoutingPatternCtrl', function ($scope, $log, $uibModal, $uibModalInstance, $controller, $filter, $translate, notification, NgTableParams,
                                                                                                                                                              NgTableService, Restangular, MessagingGwProvService, smppApplicationRouting, applicationName) {
        $log.debug('MessagingGwOperationsRoutingTablesApplicationRoutingPatternCtrl');

        $scope.smppApplicationRouting = Restangular.stripRestangular(smppApplicationRouting);
        $scope.smppApplicationRouting.service = applicationName;

        var patterns = $scope.smppApplicationRouting.patterns;

        // New pattern object initialization
        $scope.newPattern = {};

        // SMPP Application Routing pattern list definitions
        $scope.patternList = {
            list: patterns,
            tableParams: {}
        };

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.patternList.tableParams.settings().$scope.filterText = filterText;
            $scope.patternList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.patternList.tableParams.page(1);
            $scope.patternList.tableParams.reload();
        }, 500);

        $scope.patternList.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "pattern": 'asc'
            }
        }, {
            total: $scope.patternList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.patternList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.patternList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - SMPP Application Routing pattern list definitions

        var showPatternAlreadyDefinedNotification = function (pattern) {
            var message = $translate.instant('Products.MessagingGw.Operations.RoutingTables.Messages.RoutingPatternAlreadyDefinedError', {
                "pattern": pattern.pattern
            });

            notification({
                type: 'warning',
                text: message
            });
        };

        // Add new routing pattern
        $scope.addNewPattern = function (smppApplicationRouting, newPattern) {
            var patternItem = {
                "pattern": newPattern.pattern
            };

            var foundPattern = _.findWhere($scope.patternList.list, patternItem);
            if (foundPattern) {
                showPatternAlreadyDefinedNotification(patternItem);

                return;
            }

            MessagingGwProvService.addSMPPApplicationRoutingPattern(smppApplicationRouting.applicationId, smppApplicationRouting.rangeStart, smppApplicationRouting.rangeEnd, patternItem).then(function (response) {
                $log.debug('Adding Smpp Application Routing Pattern: ', patternItem, ', for the routing: ', smppApplicationRouting.rangeStart, '-', smppApplicationRouting.rangeEnd);

                var apiResponse = Restangular.stripRestangular(response);

                if (apiResponse.errorCode) {
                    if (apiResponse.errorMsg) {
                        if (apiResponse.errorMsg.indexOf('already') > -1) {
                            showPatternAlreadyDefinedNotification(patternItem);
                        } else {
                            notification({
                                type: 'warning',
                                text: apiResponse.errorMsg
                            });
                        }
                    } else {
                        notification({
                            type: 'danger',
                            text: $translate.instant('CommonMessages.GenericServerError')
                        });
                    }
                } else {
                    // Assign generated pattern value to the used item.
                    patternItem.pattern = response.pattern;

                    $scope.patternList.list.push(patternItem);
                    $scope.patternList.tableParams.reload();

                    $scope.patternList.tableParams.settings().$scope.form.$setPristine();
                    delete $scope.patternList.tableParams.settings().$scope.newPattern;
                    $scope.newPattern = {};

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }
            }, function (response) {
                $log.debug('Smpp Application Routing Pattern: ', response);
            });
        };

        $scope.removePattern = function (smppApplicationRouting, pattern) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: function ($scope, $uibModalInstance, $translate, $controller, $sce) {
                    var message = $translate.instant('CommonLabels.ConfirmationRemoveMessage');
                    message = message + ' [' + pattern.pattern + ']';
                    $scope.confirmationMessage = $sce.trustAsHtml(message);

                    $controller('ConfirmationModalInstanceCtrl', {
                        $scope: $scope,
                        $uibModalInstance: $uibModalInstance
                    });
                },
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing Smpp Application Routing Pattern: ', pattern, ', for the routing: ', smppApplicationRouting.rangeStart, '-', smppApplicationRouting.rangeEnd);

                MessagingGwProvService.deleteSMPPApplicationRoutingPattern(smppApplicationRouting.applicationId, smppApplicationRouting.rangeStart, smppApplicationRouting.rangeEnd, pattern.pattern).then(function (response) {
                    $log.debug('Removed Smpp Application Routing Pattern: ', response);

                    var deletedListItem = _.findWhere($scope.patternList.list, {
                        pattern: pattern.pattern
                    });
                    $scope.patternList.list = _.without($scope.patternList.list, deletedListItem);

                    $scope.patternList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete Smpp Application Routing Pattern: ', response);
                });
            });
        };

        $scope.close = function () {
            $uibModalInstance.close();
        };
    });

})();
