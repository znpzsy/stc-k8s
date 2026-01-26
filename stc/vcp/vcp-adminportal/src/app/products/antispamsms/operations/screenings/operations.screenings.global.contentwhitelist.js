(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.screenings.global.contentwhitelist', []);

    var AntiSpamSMSOperationsScreeningsGlobalContentWhitelistModule = angular.module('adminportal.products.antispamsms.operations.screenings.global.contentwhitelist');

    AntiSpamSMSOperationsScreeningsGlobalContentWhitelistModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations.screenings.global.contentwhitelist', {
            url: "/contentwhitelist",
            template: '<div ui-view></div>',
            data: {
                "listState": "products.antispamsms.operations.screenings.global.contentwhitelist.list",
                "newState": "products.antispamsms.operations.screenings.global.contentwhitelist.new",
                "updateState": "products.antispamsms.operations.screenings.global.contentwhitelist.update"
            }
        }).state('products.antispamsms.operations.screenings.global.contentwhitelist.list', {
            url: "/list",
            templateUrl: "products/antispamsms/operations/screenings/operations.screenings.global.contentwhitelist.html",
            controller: "AntiSpamSMSOperationsScreeningsGlobalContentWhitelistCtrl",
            data: {
                permissions: [
                    'READ_ANTISPAM_SCREENINGLISTS_OPERATIONS'
                ]
            },
            resolve: {
                globalContentWhitelist: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getGlobalContentWhitelistScreeningList();
                },
                globalContentWhitelistConf: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getGlobalContentWhitelistScreeningConfiguration();
                }
            }
        });
        // Add state configuration

    });

    AntiSpamSMSOperationsScreeningsGlobalContentWhitelistModule.controller('AntiSpamSMSOperationsScreeningsGlobalContentWhitelistCtrl', function ($scope, $state, $log, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                                                  SMS_ANTISPAM_GLOBAL_MAP_OPERATION_TYPE, SMSAntiSpamConfigService,
                                                                                                                                                  globalContentWhitelist, globalContentWhitelistConf) {
        $log.debug('AntiSpamSMSOperationsScreeningsGlobalContentWhitelistCtrl');

        $scope.globalContentWhitelist = globalContentWhitelist || [];

        $scope.globalContentWhitelistConf = globalContentWhitelistConf || {};
        $scope.globalContentWhitelistConfOriginal = angular.copy(globalContentWhitelistConf);

        $scope.SMS_ANTISPAM_GLOBAL_MAP_OPERATION_TYPE = SMS_ANTISPAM_GLOBAL_MAP_OPERATION_TYPE;

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'contentScreening',
                    headerKey: 'Products.AntiSpamSMS.Operations.Screenings.Global.ContentWhitelist.List.TableColumns.ContentScreening'
                },
                {
                    fieldName: 'name',
                    headerKey: 'Products.AntiSpamSMS.Operations.Screenings.Global.ContentWhitelist.List.TableColumns.Name'
                },
                {
                    fieldName: 'screeningType',
                    headerKey: 'Products.AntiSpamSMS.Operations.Screenings.Global.ContentWhitelist.List.TableColumns.ScreeningType',
                    filter: { name: 'AntiSpamSMSContentFilterTypeFilter' }
                },
                {
                    fieldName: 'status',
                    headerKey: 'CommonLabels.State',
                    filter: { name: 'StatusTypeFilter' }
                }
            ]
        };

        // Global Content Whitelist
        $scope.contentwhitelist = {
            list: $scope.globalContentWhitelist,
            tableParams: {}
        };

        $scope.contentwhitelist.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "number": 'asc'
            }
        }, {
            total: $scope.contentwhitelist.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.contentwhitelist.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.contentwhitelist.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Global Content Whitelist

        $scope.filterTableList = _.debounce(function (filterText, filterColumns) {
            $scope.contentwhitelist.tableParams.settings().$scope.filterText = filterText;
            $scope.contentwhitelist.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.contentwhitelist.tableParams.page(1);
            $scope.contentwhitelist.tableParams.reload();
        }, 750);

        $scope.reload = function () {
            $state.go($state.$current, null, {reload: true});
        }

        $scope.remove = function (entry) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing global content whitelist entry: ', entry);

                SMSAntiSpamConfigService.deleteGlobalContentWhitelistScreeningListEntry(entry).then(function (response) {
                    if (response && response.value) {
                        $log.debug('Cannot remove global content whitelist entry: ', entry, ', response: ', response);

                        notification({
                            type: 'warning',
                            text: response.value
                        });
                    } else {
                        $log.debug('Removed global content whitelist entry: ', entry, ', response: ', response);

                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });
                        $scope.reload();
                    }

                }, function (response) {
                    $log.debug('Cannot delete global content whitelist entry: ', entry, ', response: ', response);
                });
            });
        };

        var updateList = function () {
            $scope.contentwhitelist.list = $scope.globalContentWhitelist;
            $scope.contentwhitelist.tableParams.page(1);
            $scope.contentwhitelist.tableParams.reload();
        };

        var openDetailModal = function (entry) {
            return $uibModal.open({
                templateUrl: 'products/antispamsms/operations/screenings/operations.screenings.global.contentwhitelist.detail.modal.html',
                controller: 'AntiSpamSMSOperationsScreeningsGlobalContentWhitelistDetailCtrl',
                resolve: {
                    globalContentWhitelist: function () {
                        return $scope.globalContentWhitelist;
                    },
                    entry: function () {
                        return entry;
                    }
                }
            });
        };

        $scope.addNewEntry = function () {
            var modalInstance = openDetailModal();

            modalInstance.result.then(function (entry) {
                $scope.reload();
            }, function () {
                // Ignored
            });
        };

        $scope.updateEntry = function (entry) {
            var modalInstance = openDetailModal(entry);

            modalInstance.result.then(function (entry) {
                $scope.reload();
            }, function () {
                // Ignored
            });
        };

        $scope.isConfigurationNotChanged = function () {
            return angular.equals($scope.globalContentWhitelistConfOriginal, $scope.globalContentWhitelistConf);
        };

        $scope.updateGlobalWhitelistConfiguration = function (config) {
            $log.debug('Trying to update global content  configuration: ', config);

            SMSAntiSpamConfigService.updateGlobalContentWhitelistScreeningConfiguration(config).then(function (response) {
                if (response && response.value) {
                    $log.debug('Cannot update global source screening configuration: ', config, ', result: ', response);

                    notification({
                        type: 'warning',
                        text: response.value
                    });
                } else {

                    $log.debug('Updated global content  configuration: ', config, 'response: ', response);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $scope.reload();
                }

            }, function (errResponse) {
                $log.debug('Cannot add global content whitelist configuration: ', config, ', errResponse: ', errResponse);});

        }
    });

    AntiSpamSMSOperationsScreeningsGlobalContentWhitelistModule.controller('AntiSpamSMSOperationsScreeningsGlobalContentWhitelistDetailCtrl', function ($scope, $log, $uibModalInstance, $translate, notification, SMSAntiSpamConfigService, SMS_ANTISPAM_GLOBAL_SCREENING_STATES,
                                                                                                                                                        SMS_ANTISPAM_EVALUATION_TYPES, globalContentWhitelist, entry) {
        $log.debug('AntiSpamSMSOperationsScreeningsGlobalContentWhitelistDetailCtrl');

        $scope.globalContentWhitelist = globalContentWhitelist || [];

        $scope.STATES = SMS_ANTISPAM_GLOBAL_SCREENING_STATES;
        $scope.SMS_ANTISPAM_EVALUATION_TYPES = _.filter(SMS_ANTISPAM_EVALUATION_TYPES, function (item) {
            return item.value === 'CONTAINS' || item.value === 'IN_LIST';
        });

        if (entry) {
            $scope.pageHeaderKey = 'Products.AntiSpamSMS.Operations.Screenings.Global.ContentWhitelist.List.UpdateEntryModalTitle';

            $scope.entry = {
                id: _.uniqueId(),
                name: entry.name,
                contentScreening: entry.contentScreening,
                screeningType: entry.screeningType ? entry.screeningType : $scope.SMS_ANTISPAM_EVALUATION_TYPES[0].numericValue,
                state: entry.state === 0 ? entry.state : $scope.STATES[0].numericValue
            };
        } else {
            $scope.pageHeaderKey = 'Products.AntiSpamSMS.Operations.Screenings.Global.ContentWhitelist.List.AddNewEntryModalTitle';

            $scope.entry = {
                contentScreening: '',
                screeningType: $scope.SMS_ANTISPAM_EVALUATION_TYPES[0].numericValue,
                state: $scope.STATES[0].numericValue
            };

            // The watchers to check availability on the list.
            $scope.$watch('entry.name', function (newVal) {
                if (!_.isUndefined(newVal) && $scope.entry) {
                    var foundItem = _.find($scope.globalContentWhitelist, function (item) {
                        return (String(item.name) === String(newVal));
                    });

                    $scope.form.entryName.$setValidity('availabilityCheck', _.isUndefined(foundItem));
                }
            });
        }

        var promise = function (entryItem, isCreate) {
            if (isCreate)
                return SMSAntiSpamConfigService.createGlobalContentWhitelistScreeningListEntry(entryItem);
            else
                return SMSAntiSpamConfigService.updateGlobalContentWhitelistScreeningListEntry(entryItem);
        };

        $scope.originalEntry = angular.copy($scope.entry);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalEntry, $scope.entry);
        };

        // Save entry
        $scope.save = function (entry) {
            var isCreate = _.isUndefined(entry.id);
            var entryItem = angular.copy(entry);

            if (!isCreate) {
                delete entryItem.id;
            }

            promise(entryItem, isCreate).then(function (response) {
                if (response && response.value) {
                    $log.debug('Cannot add global content whitelist entry: ', entryItem, ', response: ', response);

                    notification({
                        type: 'warning',
                        text: response.value
                    });
                } else {
                    $log.debug('Added global content whitelist entry: ', entryItem);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $uibModalInstance.close(entryItem);
                }
            }, function (response) {
                $log.debug('Cannot add global content whitelist entry: ', entryItem, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
    });

})();
