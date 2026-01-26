(function () {

    'use strict';

    angular.module('adminportal.products.mmsc.operations.translationtables.addresses', [
        'adminportal.products.mmsc.operations.translationtables.addresses.translationtest'
    ]);

    var MMSCTranslationTablesAddressesOperationsModule = angular.module('adminportal.products.mmsc.operations.translationtables.addresses');

    MMSCTranslationTablesAddressesOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('products.mmsc.operations.translationtables.destaddress', {
            abstract: true,
            url: "/dest-address",
            templateUrl: "products/mmsc/operations/operations.abstract.html",
            data: {
                "key": "destination",
                "listState": "products.mmsc.operations.translationtables.destaddress.list",
                "newState": "products.mmsc.operations.translationtables.destaddress.new",
                "updateState": "products.mmsc.operations.translationtables.destaddress.update",
                "pageHeaderKey": "Products.MMSC.Operations.TranslationTables.DestAddress.PageHeader"
            }
        }).state('products.mmsc.operations.translationtables.destaddress.list', {
            url: "",
            templateUrl: "products/mmsc/operations/operations.translationtables.addresses.html",
            controller: 'MMSCTranslationTablesAddressesOperationsCtrl',
            resolve: {
                addressTranslations: function (MmscOperationService) {
                    return MmscOperationService.getAddressTranslations('destination');
                }
            }
        }).state('products.mmsc.operations.translationtables.destaddress.new', {
            url: "/new",
            templateUrl: "products/mmsc/operations/operations.translationtables.addresses.details.html",
            controller: 'MMSCTranslationTablesNewAddressesOperationsCtrl'
        }).state('products.mmsc.operations.translationtables.destaddress.update', {
            url: "/update/:addressRangeStart/:addressRangeEnd",
            templateUrl: "products/mmsc/operations/operations.translationtables.addresses.details.html",
            controller: 'MMSCTranslationTablesUpdateAddressesOperationsCtrl',
            resolve: {
                addressTranslation: function ($stateParams, MmscOperationService) {
                    var addressRangeStart = $stateParams.addressRangeStart;
                    var addressRangeEnd = $stateParams.addressRangeEnd;

                    return MmscOperationService.getAddressTranslation('destination', addressRangeStart, addressRangeEnd);
                }
            }
        });

        $stateProvider.state('products.mmsc.operations.translationtables.origaddress', {
            abstract: true,
            url: "/orig-address",
            templateUrl: "products/mmsc/operations/operations.abstract.html",
            data: {
                "key": "source",
                "listState": "products.mmsc.operations.translationtables.origaddress.list",
                "newState": "products.mmsc.operations.translationtables.origaddress.new",
                "updateState": "products.mmsc.operations.translationtables.origaddress.update",
                "pageHeaderKey": "Products.MMSC.Operations.TranslationTables.OrigAddress.PageHeader"
            }
        }).state('products.mmsc.operations.translationtables.origaddress.list', {
            url: "",
            templateUrl: "products/mmsc/operations/operations.translationtables.addresses.html",
            controller: 'MMSCTranslationTablesAddressesOperationsCtrl',
            resolve: {
                addressTranslations: function (MmscOperationService) {
                    return MmscOperationService.getAddressTranslations('source');
                }
            }
        }).state('products.mmsc.operations.translationtables.origaddress.new', {
            url: "/new",
            templateUrl: "products/mmsc/operations/operations.translationtables.addresses.details.html",
            controller: 'MMSCTranslationTablesNewAddressesOperationsCtrl'
        }).state('products.mmsc.operations.translationtables.origaddress.update', {
            url: "/update/:addressRangeStart/:addressRangeEnd",
            templateUrl: "products/mmsc/operations/operations.translationtables.addresses.details.html",
            controller: 'MMSCTranslationTablesUpdateAddressesOperationsCtrl',
            resolve: {
                addressTranslation: function ($stateParams, MmscOperationService) {
                    var addressRangeStart = $stateParams.addressRangeStart;
                    var addressRangeEnd = $stateParams.addressRangeEnd;

                    return MmscOperationService.getAddressTranslation('source', addressRangeStart, addressRangeEnd);
                }
            }
        });

    });

    MMSCTranslationTablesAddressesOperationsModule.controller('MMSCTranslationTablesAddressesOperationsCtrl', function ($scope, $state, $log, $filter, $uibModal, Restangular, $translate, ReportingExportService,
                                                                                                                        notification, NgTableParams, NgTableService, MmscOperationService,
                                                                                                                        UtilService, addressTranslations) {
        $log.debug('MMSCTranslationTablesAddressesOperationsCtrl');

        $scope.key = $state.current.data.key;
        $scope.listState = $state.current.data.listState;
        $scope.newState = $state.current.data.newState;
        $scope.updateState = $state.current.data.updateState;

        addressTranslations = Restangular.stripRestangular(addressTranslations);

        $scope.addressTranslationList = {
            list: addressTranslations,
            tableParams: {}
        };

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.addressTranslationList.tableParams.settings().$scope.filterText = filterText;
            $scope.addressTranslationList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.addressTranslationList.tableParams.page(1);
            $scope.addressTranslationList.tableParams.reload();
        }, 500);

        $scope.addressTranslationList.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "addressRangeStart": 'asc'
            }
        }, {
            total: $scope.addressTranslationList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.addressTranslationList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.addressTranslationList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

        // Opens the address translation test form.
        $scope.showAddressTranslationTestForm = function () {
            $uibModal.open({
                templateUrl: 'products/mmsc/operations/operations.translationtables.addresses.translationtest.modal.html',
                size: 'lg',
                controller: 'MMSCTranslationTablesAddressesTranslationTestOperationsCtrl',
                resolve: {
                    addressTranslationKey: function () {
                        return $scope.key;
                    }
                }
            });
        };

        $scope.remove = function (addressTranslation) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing Address Translation: ', addressTranslation);

                MmscOperationService.deleteAddressTranslation($scope.key, addressTranslation.addressRangeStart, addressTranslation.addressRangeEnd).then(function (response) {
                    $log.debug('Removed Address Translation: ', response);

                    if (response && (response.errorCode || response.code)) {
                        notification({
                            type: 'warning',
                            text: $translate.instant('CommonMessages.ApiError', {
                                errorCode: response.errorCode || response.code,
                                errorText: response.errorMsg || response.message
                            })
                        });
                    } else {
                        var deletedListItem = _.findWhere($scope.addressTranslationList.list, {
                            addressRangeStart: addressTranslation.addressRangeStart,
                            addressRangeEnd: addressTranslation.addressRangeEnd
                        });
                        $scope.addressTranslationList.list = _.without($scope.addressTranslationList.list, deletedListItem);

                        $scope.addressTranslationList.tableParams.reload();

                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });
                    }
                }, function (response) {
                    $log.debug('Cannot delete Address Translation: ', response);
                });
            });
        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };

        $scope.exportRecords = function (mimeType, key) {
            var srcUrl = '/mmsc-operation-gr-rest/v1/address-translation/' + key + '/export?response-content-type=' + mimeType;

            $log.debug('Downloading MMSC translation table records for ' + key + ' addresses. URL: ', srcUrl);

            ReportingExportService.showReport(srcUrl, mimeType.toUpperCase());
        };

    });

    MMSCTranslationTablesAddressesOperationsModule.controller('MMSCTranslationTablesNewAddressesOperationsCtrl', function ($scope, $state, $log, $filter, $translate, notification, Restangular,
                                                                                                                           MmscOperationService, TRANSLATION_TYPES) {
        $log.debug('MMSCTranslationTablesNewAddressesOperationsCtrl');

        $scope.key = $state.current.data.key;
        $scope.listState = $state.current.data.listState;

        $scope.TRANSLATION_TYPES = TRANSLATION_TYPES;
        if ($scope.key === 'source') {
            $scope.TRANSLATION_TYPES = _.without($scope.TRANSLATION_TYPES, $scope.TRANSLATION_TYPES[2]);
        }

        $scope.addressTranslation = {
            digitsRemove: 0,
            digitsRemoveFromEnd: 0,
            translateBySourceAddress: {
                digitsToAdd: 0
            }
        };

        $scope.addressTranslation.prefixAdditionStrategy = $scope.TRANSLATION_TYPES[0];

        $scope.save = function (addressTranslation) {
            var addressTranslationItem = {
                "addressRangeStart": addressTranslation.addressRangeStart,
                "addressRangeEnd": addressTranslation.addressRangeEnd,
                "digitsRemove": addressTranslation.digitsRemove,
                "digitsRemoveFromEnd": addressTranslation.digitsRemoveFromEnd
            };

            if (addressTranslation.prefixAdditionStrategy.id === 'TRANSLATE_BY_SOURCE_ADDRESS') {
                addressTranslationItem.translateBySourceAddress = addressTranslation.translateBySourceAddress
            } else if (addressTranslation.prefixAdditionStrategy.id === 'TRANSLATE_BY_PREFIX') {
                addressTranslationItem.translateByPrefix = addressTranslation.translateByPrefix
            } else {
                delete addressTranslationItem.translateBySourceAddress;
                delete addressTranslationItem.translateByPrefix;
            }

            MmscOperationService.addAddressTranslation($scope.key, addressTranslationItem).then(function (response) {
                $log.debug('Added Address Translation: ', response);

                var apiResponse = Restangular.stripRestangular(response);

                if (apiResponse.errorCode) {
                    var message = '';

                    if (apiResponse.errorMsg) {
                        if (apiResponse.errorMsg.indexOf('already') > -1) {
                            message = $translate.instant('Products.MMSC.Operations.TranslationTables.Messages.AlreadyDefinedError', {
                                range: addressTranslationItem.addressRangeStart + '_' + addressTranslationItem.addressRangeEnd
                            });
                        } else if (apiResponse.errorMsg.indexOf('Overlap') > -1) {
                            var msgObj = _.object(_.compact(_.map(apiResponse.errorMsg.split(';'), function (item) {
                                if (item) return item.split(/=(.+)?/);
                            })));

                            var definedRange = msgObj['translationAddressRange.addressRangeStart'].split(/,.+?=/);
                            var definedRangeStart = definedRange[0];
                            var definedRangeEnd = definedRange[1];

                            message = $translate.instant('Products.MMSC.Operations.TranslationTables.Messages.RangeOverlappedError', {
                                range: definedRangeStart + '_' + definedRangeEnd
                            });
                        } else {
                            message = apiResponse.errorMsg;
                        }
                    } else {
                        message = $translate.instant('CommonMessages.GenericServerError');
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

                    $state.go($scope.listState);
                }
            }, function (response) {
                $log.debug('Cannot add Address Translation: ', response);
            });
        };

        $scope.cancel = function () {
            $state.transitionTo($scope.listState, {}, {
                reload: true,
                inherit: true,
                notify: true
            });
        };
    });

    MMSCTranslationTablesAddressesOperationsModule.controller('MMSCTranslationTablesUpdateAddressesOperationsCtrl', function ($scope, $state, $stateParams, $log, $filter, $translate, notification, Restangular,
                                                                                                                              MmscOperationService, addressTranslation, TRANSLATION_TYPES) {
        $log.debug('MMSCTranslationTablesUpdateAddressesOperationsCtrl');

        $scope.key = $state.current.data.key;
        $scope.listState = $state.current.data.listState;

        $scope.TRANSLATION_TYPES = TRANSLATION_TYPES;
        if ($scope.key === 'source') {
            $scope.TRANSLATION_TYPES = _.without($scope.TRANSLATION_TYPES, $scope.TRANSLATION_TYPES[2]);
        }

        $scope.addressTranslation = Restangular.stripRestangular(addressTranslation);
        $scope.addressTranslation.id = $scope.addressTranslation.addressRangeStart;

        if ($scope.addressTranslation.translateByPrefix) {
            $scope.addressTranslation.prefixAdditionStrategy = $scope.TRANSLATION_TYPES[1];

            $scope.addressTranslation.translateBySourceAddress = {
                digitsToAdd: 0
            }
        } else if ($scope.addressTranslation.translateBySourceAddress) {
            $scope.addressTranslation.prefixAdditionStrategy = $scope.TRANSLATION_TYPES[2];
        } else {
            $scope.addressTranslation.prefixAdditionStrategy = $scope.TRANSLATION_TYPES[0];
        }

        $scope.addressTranslationCodeOriginal = angular.copy($scope.addressTranslation);
        $scope.addressTranslationNotChanged = function () {
            return angular.equals($scope.addressTranslation, $scope.addressTranslationCodeOriginal);
        };

        $scope.save = function (addressTranslation) {
            var addressTranslationItem = {
                "addressRangeStart": $scope.addressTranslationCodeOriginal.addressRangeStart,
                "addressRangeEnd": $scope.addressTranslationCodeOriginal.addressRangeEnd,
                "digitsRemove": addressTranslation.digitsRemove,
                "digitsRemoveFromEnd": addressTranslation.digitsRemoveFromEnd
            };

            if (addressTranslation.prefixAdditionStrategy.id === 'TRANSLATE_BY_SOURCE_ADDRESS') {
                addressTranslationItem.translateBySourceAddress = addressTranslation.translateBySourceAddress
            } else if (addressTranslation.prefixAdditionStrategy.id === 'TRANSLATE_BY_PREFIX') {
                addressTranslationItem.translateByPrefix = addressTranslation.translateByPrefix
            } else {
                delete addressTranslationItem.translateBySourceAddress;
                delete addressTranslationItem.translateByPrefix;
            }

            MmscOperationService.updateAddressTranslation($scope.key, addressTranslationItem).then(function (response) {
                $log.debug('Updated Address Translation: ', response);

                var apiResponse = Restangular.stripRestangular(response);

                if (apiResponse.errorCode) {
                    var message = '';

                    if (apiResponse.errorMsg) {
                        if (apiResponse.errorMsg.indexOf('already') > -1) {
                            message = $translate.instant('Products.MMSC.Operations.TranslationTables.Messages.AlreadyDefinedError', {
                                range: addressTranslationItem.addressRangeStart + '_' + addressTranslationItem.addressRangeEnd
                            });
                        } else if (apiResponse.errorMsg.indexOf('Overlap') > -1) {
                            var msgObj = _.object(_.compact(_.map(apiResponse.errorMsg.split(';'), function (item) {
                                if (item) return item.split(/=(.+)?/);
                            })));

                            var definedRange = msgObj['translationAddressRange.addressRangeStart'].split(/,.+?=/);
                            var definedRangeStart = definedRange[0];
                            var definedRangeEnd = definedRange[1];

                            message = $translate.instant('Products.MMSC.Operations.TranslationTables.Messages.RangeOverlappedError', {
                                range: definedRangeStart + '_' + definedRangeEnd
                            });
                        } else {
                            message = apiResponse.errorMsg;
                        }
                    } else {
                        message = $translate.instant('CommonMessages.GenericServerError');
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

                    $state.go($scope.listState);
                }
            }, function (response) {
                $log.debug('Cannot update Address Translation: ', response);
            });
        };

        $scope.cancel = function () {
            $state.transitionTo($scope.listState, {}, {
                reload: true,
                inherit: true,
                notify: true
            });
        };
    });

})();
