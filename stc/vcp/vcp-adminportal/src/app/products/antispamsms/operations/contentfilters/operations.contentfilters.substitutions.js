(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.contentfilters.substitutions', []);

    var AntiSpamSMSOperationsContentFiltersSubstitutionsModule = angular.module('adminportal.products.antispamsms.operations.contentfilters.substitutions');

    AntiSpamSMSOperationsContentFiltersSubstitutionsModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations.contentfilters.substitutions', {
            url: "/substitution",
            template: '<div ui-view></div>'
        }).state('products.antispamsms.operations.contentfilters.substitutions.list', {
            url: "/list",
            templateUrl: "products/antispamsms/operations/contentfilters/operations.contentfilters.substitutions.html",
            controller: 'AntiSpamSMSOperationsContentFiltersSubstitutionsCtrl',
            data: {
                permissions: [
                    'READ_ANTISPAM_CONTENTFILTERS_OPERATIONS'
                ]
            },
            resolve: {
                substitutionsList: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getSubstitutionsList();
                }
            }
        }).state('products.antispamsms.operations.contentfilters.substitutions.new', {
            url: "/new",
            templateUrl: "products/antispamsms/operations/contentfilters/operations.contentfilters.substitutions.detail.html",
            controller: 'AntiSpamSMSOperationsContentFiltersSubstitutionsNewCtrl',
            data: {
                permissions: [
                    'CREATE_ANTISPAM_CONTENTFILTERS_OPERATIONS'
                ]
            }
        }).state('products.antispamsms.operations.contentfilters.substitutions.update', {
            url: "/update/:name",
            templateUrl: "products/antispamsms/operations/contentfilters/operations.contentfilters.substitutions.detail.html",
            controller: 'AntiSpamSMSOperationsContentFiltersSubstitutionsUpdateCtrl',
            data: {
                permissions: [
                    'READ_ANTISPAM_CONTENTFILTERS_OPERATIONS' // Let read-only mode
                ]
            },
            resolve: {
                entry: function ($stateParams, SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getSubstitutionsEntry($stateParams.name);
                }
            }
        });

    });

    AntiSpamSMSOperationsContentFiltersSubstitutionsModule.controller('AntiSpamSMSOperationsContentFiltersSubstitutionsCommonCtrl', function ($scope, $log) {
        $log.debug('AntiSpamSMSOperationsContentFiltersSubstitutionsCommonCtrl');

        $scope.listState = "products.antispamsms.operations.contentfilters.substitutions.list";
        $scope.newState = "products.antispamsms.operations.contentfilters.substitutions.new";
        $scope.updateState = "products.antispamsms.operations.contentfilters.substitutions.update";
        $scope.pageHeaderKey = "Products.AntiSpamSMS.Operations.Substitutions.Title";
    });

    AntiSpamSMSOperationsContentFiltersSubstitutionsModule.controller('AntiSpamSMSOperationsContentFiltersSubstitutionsCtrl', function ($scope, $log, $controller, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                          Restangular, SMSAntiSpamConfigService, substitutionsList) {
        $log.debug('AntiSpamSMSOperationsContentFiltersSubstitutionsCtrl');

        $controller('AntiSpamSMSOperationsContentFiltersSubstitutionsCommonCtrl', {$scope: $scope});

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'name',
                    headerKey: 'Products.AntiSpamSMS.Operations.Substitutions.TableColumns.Name'
                },
                {
                    fieldName: 'list',
                    headerKey: 'Products.AntiSpamSMS.Operations.Substitutions.TableColumns.List'
                }
            ]
        };

        // MCA Modifiers list
        $scope.substitutionsList = {
            list: substitutionsList ? Restangular.stripRestangular(substitutionsList) : [],
            tableParams: {}
        };

        $scope.substitutionsList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "name": 'asc'
            }
        }, {
            total: 0,
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.substitutionsList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.substitutionsList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - MCA Modifiers list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.substitutionsList.tableParams.settings().$scope.filterText = filterText;
            $scope.substitutionsList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.substitutionsList.tableParams.page(1);
            $scope.substitutionsList.tableParams.reload();
        }, 500);

        $scope.remove = function (entry) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing MCA Modifier entry: ', entry);

                SMSAntiSpamConfigService.deleteSubstitutionsEntry(entry.name).then(function (response) {
                    $log.debug('Removed MCA Modifier entry: ', entry, ', response: ', response);

                    var deletedListItem = _.findWhere($scope.substitutionsList.list, {name: entry.name});
                    $scope.substitutionsList.list = _.without($scope.substitutionsList.list, deletedListItem);

                    $scope.substitutionsList.tableParams.reload();

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

    AntiSpamSMSOperationsContentFiltersSubstitutionsModule.controller('AntiSpamSMSOperationsContentFiltersSubstitutionsNewCtrl', function ($scope, $log, $state, $controller, $translate, notification, STATES, SMSAntiSpamConfigService) {
        $controller('AntiSpamSMSOperationsContentFiltersSubstitutionsCommonCtrl', {$scope: $scope});

        $scope.STATES = STATES;

        $scope.entry = {
            status: $scope.STATES[0]
        };

        $scope.isNotChanged = function () {
            return false;
        };

        $scope.save = function (entry) {
            var entryItem = angular.copy(entry);

            SMSAntiSpamConfigService.createSubstitutionsEntry(entryItem).then(function (response) {
                if (response && response.value === "ALREADY_SUBSCRIBED") {
                    $log.debug('Cannot add MCA Modifier entry: ', entryItem, ', response: ', response);

                    notification({
                        type: 'warning',
                        text: $translate.instant('Products.AntiSpamSMS.Operations.SCAModifiers.Messages.EntryAlreadyDefinedError', {prefix: entryItem.prefix})
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

    AntiSpamSMSOperationsContentFiltersSubstitutionsModule.controller('AntiSpamSMSOperationsContentFiltersSubstitutionsUpdateCtrl', function ($scope, $log, $state, $controller, $translate, notification, STATES, SMSAntiSpamConfigService, entry) {
        $controller('AntiSpamSMSOperationsContentFiltersSubstitutionsCommonCtrl', {$scope: $scope});

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

            SMSAntiSpamConfigService.updateSubstitutionsEntry(entryItem).then(function (response) {
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



    AntiSpamSMSOperationsContentFiltersSubstitutionsModule.controller('AntiSpamSMSOperationsContentFiltersSubstitutionsModalCtrl', function ($scope, $uibModalInstance, $log, $filter, $uibModal, $translate, notification, NgTableParams, NgTableService,
                                                                                                                                        Restangular, SMSAntiSpamConfigService, filterName, substitutions) {
        $log.debug("AntiSpamSMSOperationsContentFiltersSubstitutionsModalCtrl");

        substitutions = substitutions ? Restangular.stripRestangular(substitutions) : [];

        $scope.contentFiltersEntryName = filterName;

        $scope.newSubstitution = {};

        // Address range list
        $scope.substitutionList = {
            list: substitutions,
            tableParams: {}
        };

        $scope.substitutionList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "name": 'asc'
            }
        }, {
            total: $scope.substitutionList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.substitutionList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.substitutionList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Address range list

        var tableScope = $scope.substitutionList.tableParams.settings().$scope;

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            tableScope.filterText = filterText;
            tableScope.filterColumns = filterColumns;
            $scope.substitutionList.tableParams.page(1);
            $scope.substitutionList.tableParams.reload();
        }, 750);

        // The watchers to check availability on the list.
        tableScope.$watch('newSubstitution.name', function (newVal) {
            if (newVal) {
                var foundItem = _.find($scope.substitutionList.list, function (item) {
                    return (String(item.name) === String(newVal));
                });

                tableScope.form.name.$setValidity('availabilityCheck', _.isUndefined(foundItem));
            }
        });

        // Add address range
        $scope.addNewSubstitution = function (substitution) {
            var substitutionItem = angular.copy(substitution);
            //substitutionItem.name = substitutionItem.name;

            SMSAntiSpamConfigService.createSubstitutionsEntryForContentFilter($scope.contentFiltersEntryName, substitutionItem).then(function (response) {
                if (response && response.value === "ALREADY_SUBSCRIBED") {
                    $log.debug('Cannot add msisdn range list name: ', substitutionItem, ', response: ', response);

                    // notification({
                    //     type: 'warning',
                    //     text: $translate.instant('Products.AntiSpamSMS.Operations.AddressRanges.Messages.RangeAlreadyDefinedError', {
                    //         msisdnRangeName: substitutionItem.name
                    //     })
                    // });
                } else {
                    $log.debug('Added substitution with name: ', substitutionItem);

                    $scope.substitutionList.list.push(substitutionItem);
                    $scope.substitutionList.tableParams.reload();

                    tableScope.form.$setPristine();
                    tableScope.newSubstitution.name = null;
                    tableScope.newSubstitution.list = null;
                }
            }, function (response) {
                $log.debug('Cannot add msisdn range list name: ', substitutionItem, ', response: ', response);
            });
        };

        // Remove address range
        $scope.removeSubstitution = function (substitutionItem) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing msisdn range list name: ', substitutionItem);

                SMSAntiSpamConfigService.deleteSubstitutionsEntryForContentFilter($scope.contentFiltersEntryName, substitutionItem.name).then(function (response) {
                    $log.debug('Deleted msisdn range list name: ', substitutionItem, ', response: ', response);

                    var deletedListItem = _.findWhere($scope.substitutionList.list, {
                        name: substitutionItem.name
                    });
                    $scope.substitutionList.list = _.without($scope.substitutionList.list, deletedListItem);

                    $scope.substitutionList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete msisdn range list name: ', substitutionItem, ', response: ', response);
                });
            });
        };

        $scope.ok = function () {
            $uibModalInstance.close();
        };
    });

})();
