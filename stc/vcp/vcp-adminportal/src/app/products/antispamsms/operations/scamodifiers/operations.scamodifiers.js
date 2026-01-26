(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.scamodifiers', []);

    var AntiSpamSMSOperationsSCAModifiersModule = angular.module('adminportal.products.antispamsms.operations.scamodifiers');

    AntiSpamSMSOperationsSCAModifiersModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations.scamodifiers', {
            url: "/mca-modifiers",
            template: '<div ui-view></div>'
        }).state('products.antispamsms.operations.scamodifiers.list', {
            url: "/list",
            templateUrl: "products/antispamsms/operations/scamodifiers/operations.scamodifiers.html",
            controller: 'AntiSpamSMSOperationsSCAModifiersCtrl',
            data: {
                permissions: [
                    'READ_ANTISPAM_SCAMODIFIERS_OPERATIONS'
                ]
            },
            resolve: {
                scaModifiers: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getSCAModifierList();
                }
            }
        }).state('products.antispamsms.operations.scamodifiers.new', {
            url: "/new",
            templateUrl: "products/antispamsms/operations/scamodifiers/operations.scamodifiers.detail.html",
            controller: 'AntiSpamSMSOperationsSCAModifiersNewCtrl',
            data: {
                permissions: [
                    'CREATE_ANTISPAM_SCAMODIFIERS_OPERATIONS'
                ]
            }
        }).state('products.antispamsms.operations.scamodifiers.update', {
            url: "/update/:callingGt/:mscGt",
            templateUrl: "products/antispamsms/operations/scamodifiers/operations.scamodifiers.detail.html",
            controller: 'AntiSpamSMSOperationsSCAModifiersUpdateCtrl',
            data: {
                permissions: [
                    'READ_ANTISPAM_SCAMODIFIERS_OPERATIONS'
                ]
            },
            resolve: {
                entry: function ($stateParams, SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getSCAModifierListEntry($stateParams.callingGt, $stateParams.mscGt);
                }
            }
        });

    });

    AntiSpamSMSOperationsSCAModifiersModule.controller('AntiSpamSMSOperationsSCAModifiersCommonCtrl', function ($scope, $log) {
        $log.debug('AntiSpamSMSOperationsSCAModifiersCommonCtrl');

        $scope.listState = "products.antispamsms.operations.scamodifiers.list";
        $scope.newState = "products.antispamsms.operations.scamodifiers.new";
        $scope.updateState = "products.antispamsms.operations.scamodifiers.update";
        $scope.pageHeaderKey = "Products.AntiSpamSMS.Operations.SCAModifiers.Title";
    });

    AntiSpamSMSOperationsSCAModifiersModule.controller('AntiSpamSMSOperationsSCAModifiersCtrl', function ($scope, $log, $controller, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                          SMSAntiSpamConfigService, scaModifiers) {
        $log.debug('AntiSpamSMSOperationsSCAModifiersCtrl');

        $controller('AntiSpamSMSOperationsSCAModifiersCommonCtrl', {$scope: $scope});

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'callingGT',
                    headerKey: 'Products.AntiSpamSMS.Operations.SCAModifiers.CallingGT'
                },
                {
                    fieldName: 'mscGT',
                    headerKey: 'Products.AntiSpamSMS.Operations.SCAModifiers.MSCGT'
                },
                {
                    fieldName: 'status',
                    headerKey: 'CommonLabels.State',
                    filter: {name: 'StatusTypeFilter'}
                }
            ]
        };

        // MCA Modifiers list
        $scope.scaModifiers = {
            list: scaModifiers && scaModifiers.allScaModifierEntries ? scaModifiers.allScaModifierEntries : [],
            tableParams: {}
        };

        $scope.scaModifiers.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "callingGt": 'asc'
            }
        }, {
            total: 0,
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.scaModifiers.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.scaModifiers.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - MCA Modifiers list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.scaModifiers.tableParams.settings().$scope.filterText = filterText;
            $scope.scaModifiers.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.scaModifiers.tableParams.page(1);
            $scope.scaModifiers.tableParams.reload();
        }, 500);

        $scope.remove = function (entry) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing MCA Modifier entry: ', entry);

                SMSAntiSpamConfigService.deleteSCAModifierListEntry(entry.callingGt, entry.mscGt).then(function (response) {
                    $log.debug('Removed MCA Modifier entry: ', entry, ', response: ', response);

                    var deletedListItem = _.findWhere($scope.scaModifiers.list, {callingGt: entry.callingGt, mscGt: entry.mscGt});
                    $scope.scaModifiers.list = _.without($scope.scaModifiers.list, deletedListItem);

                    $scope.scaModifiers.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete MCA Modifier entry: ', entry, ', response: ', response);
                });
            });
        };
    });

    AntiSpamSMSOperationsSCAModifiersModule.controller('AntiSpamSMSOperationsSCAModifiersNewCtrl', function ($scope, $log, $state, $controller, $translate, notification, STATES, SMSAntiSpamConfigService) {
        $controller('AntiSpamSMSOperationsSCAModifiersCommonCtrl', {$scope: $scope});

        $scope.STATES = STATES;

        $scope.entry = {
            status: $scope.STATES[0]
        };

        $scope.isNotChanged = function () {
            return false;
        };

        $scope.save = function (entry) {
            var entryItem = angular.copy(entry);
            entryItem.status = (entryItem.status === $scope.STATES[0]);

            SMSAntiSpamConfigService.createSCAModifierListEntry(entryItem).then(function (response) {
                if (response && response.value === "ALREADY_SUBSCRIBED") {
                    $log.debug('Cannot add MCA Modifier entry: ', entryItem, ', response: ', response);

                    notification({
                        type: 'warning',
                        text: $translate.instant('Products.AntiSpamSMS.Operations.SCAModifiers.Messages.EntryAlreadyDefinedError', {callingGt: entryItem.callingGt})
                    });
                } else {
                    $log.debug('Added MCA Modifier entry: ', entryItem);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $state.go($scope.listState);
                }
            }, function (response) {
                $log.debug('Cannot add MCA Modifier entry: ', entryItem, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($scope.listState);
        };
    });

    AntiSpamSMSOperationsSCAModifiersModule.controller('AntiSpamSMSOperationsSCAModifiersUpdateCtrl', function ($scope, $log, $state, $controller, $translate, notification, STATES, SMSAntiSpamConfigService, entry) {
        $controller('AntiSpamSMSOperationsSCAModifiersCommonCtrl', {$scope: $scope});

        $scope.STATES = STATES;

        $scope.entry = entry;
        $scope.entry.id = $scope.entry.prefix;
        $scope.entry.status = ($scope.entry.status ? $scope.STATES[0] : $scope.STATES[1]);

        $scope.originalEntry = angular.copy($scope.entry);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalEntry, $scope.entry);
        };

        $scope.save = function (entry) {
            var entryItem = angular.copy(entry);
            entryItem.status = (entryItem.status === $scope.STATES[0]);
            delete entryItem.id;

            SMSAntiSpamConfigService.updateSCAModifierListEntry(entryItem).then(function (response) {
                $log.debug('Updated MCA Modifier entry: ', entryItem);

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $state.go($scope.listState);

            }, function (response) {
                $log.debug('Cannot update MCA Modifier entry: ', entryItem, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($scope.listState);
        };
    });


})();
