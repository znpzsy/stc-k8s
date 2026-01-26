(function () {

    'use strict';

    angular.module('adminportal.products.smsc.operations.translationtables.addresses.contentfiltering', []);

    var SmscTranslationTablesAddressesContentFilteringOperationsModule = angular.module('adminportal.products.smsc.operations.translationtables.addresses.contentfiltering');

    SmscTranslationTablesAddressesContentFilteringOperationsModule.controller('SmscTranslationTablesAddressesContentFilteringOperationsCtrl', function ($scope, $log, $uibModalInstance, $controller, Restangular,
                                                                                                                                                                      addressTranslationKey, addressTranslation, selectedSMPPApplication) {
        $log.debug('SmscTranslationTablesAddressesContentFilteringOperationsCtrl');

        $scope.addressTranslationKey = addressTranslationKey;
        $scope.selectedSMPPApplication = selectedSMPPApplication;

        $scope.addressTranslation = Restangular.stripRestangular(addressTranslation);

        $scope.close = function () {
            $uibModalInstance.close();
        };

        $controller('SmscTranslationTablesAddressesContentFilteringTonNpiOperationsCtrl', {$scope: $scope});
        $controller('SmscTranslationTablesAddressesContentFilteringPatternOperationsCtrl', {$scope: $scope});
        $controller('SmscTranslationTablesAddressesContentFilteringOtherAddressPatternOperationsCtrl', {$scope: $scope});
    });

    SmscTranslationTablesAddressesContentFilteringOperationsModule.controller('SmscTranslationTablesAddressesContentFilteringTonNpiOperationsCtrl', function ($scope, $log, $filter, $uibModal, NgTableParams, NgTableService, Restangular,
                                                                                                                                                                            SMPP_APPS_NPI, SMPP_APPS_TON, EQUAL_NOTEQUAL,
                                                                                                                                                                            $translate, notification, SmscConfService) {
        $log.debug('SmscTranslationTablesAddressesContentFilteringTonNpiOperationsCtrl');

        $scope.SMPP_APPS_NPI = SMPP_APPS_NPI;
        $scope.SMPP_APPS_TON = SMPP_APPS_TON;
        $scope.EQUAL_NOTEQUAL = EQUAL_NOTEQUAL;

        $scope.newTonNpi = {
            ton: null,
            tonEquality: $scope.EQUAL_NOTEQUAL[0],
            npi: null,
            npiEquality: $scope.EQUAL_NOTEQUAL[0]
        };

        // SMPP address translation matching content ton npi list definitions
        $scope.tonNpiList = {
            list: $scope.addressTranslation.matchingTonNpiList,
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
        // END - SMPP address translation matching content ton npi list definitions

        // Add new ton npi
        $scope.addNewTonNpi = function (newTonNpi) {
            var newTonNpiItem = {
                "ton": (newTonNpi.ton === '' || newTonNpi.ton === null) ? -1 : newTonNpi.ton,
                "tonEquality": newTonNpi.tonEquality.value,
                "npi": (newTonNpi.npi === '' || newTonNpi.npi === null) ? -1 : newTonNpi.npi,
                "npiEquality": newTonNpi.npiEquality.value
            };

            SmscConfService.addAddressTranslationMessageContentTonNpiCriteria($scope.addressTranslationKey, $scope.addressTranslation.name, newTonNpiItem, $scope.selectedSMPPApplication ? $scope.selectedSMPPApplication.id : null).then(function (response) {
                $log.debug('Added matching content ton npi: ', newTonNpiItem, ", response: ", response);

                var apiResponse = Restangular.stripRestangular(response);

                if (apiResponse.errorCode) {
                    var message = '', messageType = 'danger';

                    if (apiResponse.errorMsg) {
                        if (apiResponse.errorMsg.indexOf('already') > -1) {
                            message = $translate.instant('Products.SMSC.Operations.TranslationTables.ContentFiltering.Messages.TonNpiAlreadyDefinedError');

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
                    $scope.tonNpiList.list.push(newTonNpiItem);
                    $scope.tonNpiList.tableParams.reload();

                    angular.element('#tonNpiForm').scope().tonNpiForm.$setPristine();
                    angular.element('#tonNpiForm').scope().newTonNpi = {
                        ton: null,
                        tonEquality: $scope.EQUAL_NOTEQUAL[0],
                        npi: null,
                        npiEquality: $scope.EQUAL_NOTEQUAL[0]
                    };

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

                SmscConfService.deleteAddressTranslationMessageContentTonNpiCriteria($scope.addressTranslationKey, $scope.addressTranslation.name, tonNpi.ton, tonNpi.tonEquality,
                    tonNpi.npi, tonNpi.npiEquality, $scope.selectedSMPPApplication ? $scope.selectedSMPPApplication.id : null).then(function (response) {
                    $log.debug('Removed matching content ton mpi: ', response);

                    var deletedListItem = _.findWhere($scope.tonNpiList.list, {
                        ton: tonNpi.ton,
                        tonEquality: tonNpi.tonEquality,
                        npi: tonNpi.npi,
                        npiEquality: tonNpi.npiEquality
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

    SmscTranslationTablesAddressesContentFilteringOperationsModule.controller('SmscTranslationTablesAddressesContentFilteringPatternOperationsCtrl', function ($scope, $log, $filter, $uibModal, NgTableParams, NgTableService, Restangular,
                                                                                                                                                                             $translate, notification, SmscConfService) {
        $log.debug('SmscTranslationTablesAddressesContentFilteringPatternOperationsCtrl');

        // SMPP address translation matching content pattern list definitions
        $scope.patternList = {
            list: $scope.addressTranslation.matchingContentPatternList,
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
        // END - SMPP address translation matching content pattern list definitions

        // Add new pattern
        $scope.addNewPattern = function (regex) {
            var newPatternItem = {
                "regex": regex
            };

            SmscConfService.addAddressTranslationMessageContentPatternCriteria($scope.addressTranslationKey, $scope.addressTranslation.name, newPatternItem, $scope.selectedSMPPApplication ? $scope.selectedSMPPApplication.id : null).then(function (response) {
                $log.debug('Added matching content pattern: ', newPatternItem, ", response: ", response);

                var apiResponse = Restangular.stripRestangular(response);

                if (apiResponse.errorCode) {
                    var message = '', messageType = 'danger';

                    if (apiResponse.errorMsg) {
                        if (apiResponse.errorMsg.indexOf('already') > -1) {
                            message = $translate.instant('Products.SMSC.Operations.TranslationTables.ContentFiltering.Messages.PatternAlreadyDefinedError');

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
                    $scope.patternList.list.push({
                        regex: newPatternItem.regex
                    });
                    $scope.patternList.tableParams.reload();

                    angular.element('#patternForm').scope().patternForm.$setPristine();
                    delete angular.element('#patternForm [name=regex]').scope().regex;

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

                SmscConfService.deleteAddressTranslationMessageContentPatternCriteria($scope.addressTranslationKey, $scope.addressTranslation.name, pattern.regex, $scope.selectedSMPPApplication ? $scope.selectedSMPPApplication.id : null).then(function (response) {
                    $log.debug('Removed matching content pattern: ', response);

                    var deletedListItem = _.findWhere($scope.patternList.list, {
                        regex: pattern.regex
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

    SmscTranslationTablesAddressesContentFilteringOperationsModule.controller('SmscTranslationTablesAddressesContentFilteringOtherAddressPatternOperationsCtrl', function ($scope, $log, $filter, $uibModal, NgTableParams, NgTableService, Restangular,
                                                                                                                                                                                         $translate, notification, SmscConfService) {
        $log.debug('SmscTranslationTablesAddressesContentFilteringOtherAddressPatternOperationsCtrl');

        // SMPP address translation matching content other address pattern list definitions
        $scope.otherAddressPatternList = {
            list: $scope.addressTranslation.matchingOtherAddressPatternList,
            tableParams: {}
        };

        $scope.filterOtherAddressPatternTable = _.debounce(function (filterText, filterColumns) {
            $scope.otherAddressPatternList.tableParams.settings().$scope.filterText = filterText;
            $scope.otherAddressPatternList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.otherAddressPatternList.tableParams.page(1);
            $scope.otherAddressPatternList.tableParams.reload();
        }, 750);

        $scope.otherAddressPatternList.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "regex": 'asc' // initial sorting
            }
        }, {
            total: $scope.otherAddressPatternList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.otherAddressPatternList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.otherAddressPatternList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - SMPP address translation matching content other address pattern list definitions

        // Add new other address pattern
        $scope.addNewOtherAddressPattern = function (regex) {
            var newOtherAddressPatternItem = {
                "regex": regex
            };

            SmscConfService.addAddressTranslationMessageContentOtherAddressPatternCriteria($scope.addressTranslationKey, $scope.addressTranslation.name, newOtherAddressPatternItem, $scope.selectedSMPPApplication ? $scope.selectedSMPPApplication.id : null).then(function (response) {
                $log.debug('Added matching content other address pattern: ', newOtherAddressPatternItem, ", response: ", response);

                var apiResponse = Restangular.stripRestangular(response);

                if (apiResponse.errorCode) {
                    var message = '', messageType = 'danger';

                    if (apiResponse.errorMsg) {
                        if (apiResponse.errorMsg.indexOf('already') > -1) {
                            message = $translate.instant('Products.SMSC.Operations.TranslationTables.ContentFiltering.Messages.PatternAlreadyDefinedError');

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
                    $scope.otherAddressPatternList.list.push({
                        regex: newOtherAddressPatternItem.regex
                    });
                    $scope.otherAddressPatternList.tableParams.reload();

                    angular.element('#otherAddressPatternForm').scope().otherAddressPatternForm.$setPristine();
                    delete angular.element('#otherAddressPatternForm [name=regex]').scope().regex;

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }
            }, function (response) {
                $log.debug('Cannot add matching content other address pattern: ', response);
            });
        };

        // Remove other address pattern
        $scope.removeOtherAddressPattern = function (otherAddressPattern) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing matching content other address pattern: ', otherAddressPattern);

                SmscConfService.deleteAddressTranslationMessageContentOtherAddressPatternCriteria($scope.addressTranslationKey, $scope.addressTranslation.name, otherAddressPattern.regex, $scope.selectedSMPPApplication ? $scope.selectedSMPPApplication.id : null).then(function (response) {
                    $log.debug('Removed matching content other address pattern: ', response);

                    var deletedListItem = _.findWhere($scope.otherAddressPatternList.list, {
                        regex: otherAddressPattern.regex
                    });
                    $scope.otherAddressPatternList.list = _.without($scope.otherAddressPatternList.list, deletedListItem);

                    $scope.otherAddressPatternList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete matching content other address pattern: ', response);
                });
            });
        };
    });

})();
