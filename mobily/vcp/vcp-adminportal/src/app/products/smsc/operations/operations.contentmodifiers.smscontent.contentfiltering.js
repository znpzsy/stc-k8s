(function () {

    'use strict';

    angular.module('adminportal.products.smsc.operations.contentmodifiers.smscontent.contentfiltering', []);

    var SmscContentModifiersSMSContentContentFilteringOperationsModule = angular.module('adminportal.products.smsc.operations.contentmodifiers.smscontent.contentfiltering');

    SmscContentModifiersSMSContentContentFilteringOperationsModule.controller('SmscContentModifiersSMSContentContentFilteringOperationsCtrl', function ($scope, $log, $uibModalInstance, $controller, Restangular, contentModifier,
                                                                                                                                                                      matchingContentPatterns, matchingTonNpis) {
        $log.debug('SmscContentModifiersSMSContentContentFilteringOperationsCtrl');

        $scope.contentModifier = Restangular.stripRestangular(contentModifier);

        $scope.close = function () {
            $uibModalInstance.close();
        };

        $controller('SmscContentModifiersSMSContentContentFilteringPatternOperationsCtrl', {
            $scope: $scope,
            matchingContentPatterns: matchingContentPatterns
        });
        $controller('SmscContentModifiersSMSContentContentFilteringTonNpiOperationsCtrl', {
            $scope: $scope,
            matchingTonNpis: matchingTonNpis
        });
    });

    SmscContentModifiersSMSContentContentFilteringOperationsModule.controller('SmscContentModifiersSMSContentContentFilteringPatternOperationsCtrl', function ($scope, $log, $filter, $uibModal, NgTableParams, NgTableService, Restangular,
                                                                                                                                                                             $translate, notification, SmscConfService, matchingContentPatterns) {
        $log.debug('SmscContentModifiersSMSContentContentFilteringPatternOperationsCtrl');

        $scope.matchingContentPatterns = Restangular.stripRestangular(matchingContentPatterns);

        // SMPP content modifier matching content pattern list definitions
        $scope.patternList = {
            list: $scope.matchingContentPatterns,
            tableParams: {}
        };

        $scope.filterPatternTable = _.debounce(function (filterText, filterColumns) {
            $scope.patternList.tableParams.settings().$scope.filterText = filterText;
            $scope.patternList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.patternList.tableParams.page(1);
            $scope.patternList.tableParams.reload();
        }, 750);

        $scope.patternList.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "regex": 'asc' // initial sorting
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
        // END - SMPP content modifier matching content pattern list definitions

        // Add new pattern
        $scope.addNewPattern = function (newPattern) {
            var patternItem = {
                regex: newPattern.regex,
                target: newPattern.target
            };

            var foundPattern = _.findWhere($scope.patternList.list, patternItem);

            if (foundPattern) {
                var message = $translate.instant('Products.SMSC.Operations.ContentModifiers.ContentFiltering.Messages.PatternAlreadyDefinedError');

                notification({
                    type: 'warning',
                    text: message
                });

                return;
            }

            SmscConfService.addContentModifierPattern($scope.contentModifier.addressRangeStart, $scope.contentModifier.addressRangeEnd, patternItem).then(function (response) {
                $log.debug('Added matching content pattern: ', patternItem, ", response: ", response);

                var apiResponse = Restangular.stripRestangular(response);

                if (apiResponse.errorCode) {
                    var message = '', messageType = 'danger';

                    if (apiResponse.errorMsg) {
                        if (apiResponse.errorMsg.indexOf('already') > -1) {
                            message = $translate.instant('Products.SMSC.Operations.ContentModifiers.ContentFiltering.Messages.PatternAlreadyDefinedError');

                            messageType = 'warning';
                        } else {
                            message = $translate.instant('CommonMessages.GenericServerError');
                        }
                    }

                    notification({
                        type: messageType,
                        text: message
                    });
                } else {
                    $scope.patternList.list.push(patternItem);
                    $scope.patternList.tableParams.reload();

                    $scope.patternList.tableParams.settings().$scope.form.$setPristine();
                    delete $scope.patternList.tableParams.settings().$scope.newPattern;

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }
            }, function (response) {
                $log.debug('Cannot add matching content pattern: ', response);
            });
        };

        // Remove pattern
        $scope.removePattern = function (pattern) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing matching content pattern: ', pattern);

                SmscConfService.deleteContentModifierPattern($scope.contentModifier.addressRangeStart, $scope.contentModifier.addressRangeEnd, pattern.regex).then(function (response) {
                    $log.debug('Removed matching content pattern: ', response);

                    var deletedListItem = _.findWhere($scope.patternList.list, {
                        regex: pattern.regex,
                        target: pattern.target
                    });
                    $scope.patternList.list = _.without($scope.patternList.list, deletedListItem);

                    $scope.patternList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete matching content pattern: ', response);
                });
            });
        };

    });

    SmscContentModifiersSMSContentContentFilteringOperationsModule.controller('SmscContentModifiersSMSContentContentFilteringTonNpiOperationsCtrl', function ($scope, $log, $filter, $uibModal, NgTableParams, NgTableService, Restangular,
                                                                                                                                                                            SMPP_APPS_NPI, SMPP_APPS_TON, $translate, EQUAL_NOTEQUAL,
                                                                                                                                                                            notification, SmscConfService, matchingTonNpis) {
        $log.debug('SmscContentModifiersSMSContentContentFilteringTonNpiOperationsCtrl');

        $scope.matchingTonNpis = Restangular.stripRestangular(matchingTonNpis);

        $scope.SMPP_APPS_NPI = SMPP_APPS_NPI;
        $scope.SMPP_APPS_TON = SMPP_APPS_TON;

        // Use the EQUAL_NOTEQUAL constant when equality prorperties added for ton and npi values.
        $scope.EQUAL_NOTEQUAL = [{value: true, label: 'CommonLabels.Equal'}];

        $scope.newTonNpi = {
            ton: null,
            tonEquality: true,
            npi: null,
            npiEquality: true
        };

        // SMPP content modifier matching content ton npi list definitions
        $scope.tonNpiList = {
            list: $scope.matchingTonNpis,
            tableParams: {}
        };

        $scope.filterTonNpiTable = _.debounce(function (filterText, filterColumns) {
            $scope.tonNpiList.tableParams.settings().$scope.filterText = filterText;
            $scope.tonNpiList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.tonNpiList.tableParams.page(1);
            $scope.tonNpiList.tableParams.reload();
        }, 750);

        $scope.tonNpiList.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "ton": 'asc' // initial sorting
            }
        }, {
            total: $scope.tonNpiList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.tonNpiList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.tonNpiList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - SMPP content modifier matching content ton npi list definitions

        // Add new ton npi
        $scope.addNewTonNpi = function (newTonNpi) {
            var tonNpiItem = {
                "ton": (newTonNpi.ton === '' || newTonNpi.ton === null) ? -1 : newTonNpi.ton,
                "tonEquality": newTonNpi.tonEquality,
                "npi": (newTonNpi.npi === '' || newTonNpi.npi === null) ? -1 : newTonNpi.npi,
                "npiEquality": newTonNpi.npiEquality
            };

            var foundTonNpi = _.findWhere($scope.tonNpiList.list, tonNpiItem);

            if (foundTonNpi) {
                var message = $translate.instant('Products.SMSC.Operations.ContentModifiers.ContentFiltering.Messages.TonNpiAlreadyDefinedError');

                notification({
                    type: 'warning',
                    text: message
                });

                return;
            }

            SmscConfService.addContentModifierTonNpi($scope.contentModifier.addressRangeStart, $scope.contentModifier.addressRangeEnd, tonNpiItem).then(function (response) {
                $log.debug('Added matching content ton npi: ', tonNpiItem, ", response: ", response);

                var apiResponse = Restangular.stripRestangular(response);

                if (apiResponse.errorCode) {
                    var message = '', messageType = 'danger';

                    if (apiResponse.errorMsg) {
                        if (apiResponse.errorMsg.indexOf('already') > -1) {
                            message = $translate.instant('Products.SMSC.Operations.ContentModifiers.ContentFiltering.Messages.TonNpiAlreadyDefinedError');

                            messageType = 'warning';
                        } else {
                            message = $translate.instant('CommonMessages.GenericServerError');
                        }
                    }

                    notification({
                        type: messageType,
                        text: message
                    });
                } else {
                    $scope.tonNpiList.list.push(tonNpiItem);
                    $scope.tonNpiList.tableParams.reload();

                    $scope.tonNpiList.tableParams.settings().$scope.tonNpiForm.$setPristine();
                    delete $scope.tonNpiList.tableParams.settings().$scope.newTonNpi;

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }
            }, function (response) {
                $log.debug('Cannot add matching content tonNpi: ', response);
            });
        };

        // Remove ton npi
        $scope.removeTonNpi = function (tonNpi) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing matching content ton npi: ', tonNpi);

                SmscConfService.deleteContentModifierTonNpi($scope.contentModifier.addressRangeStart, $scope.contentModifier.addressRangeEnd, tonNpi.ton, tonNpi.npi).then(function (response) {
                    $log.debug('Removed matching content ton mpi: ', response);

                    var deletedListItem = _.findWhere($scope.tonNpiList.list, {
                        ton: tonNpi.ton,
                        npi: tonNpi.npi
                    });
                    $scope.tonNpiList.list = _.without($scope.tonNpiList.list, deletedListItem);

                    $scope.tonNpiList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete matching content ton npi: ', response);
                });
            });
        };
    });

})();
