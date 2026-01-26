(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.screenings.localincomingmo', []);

    var AntiSpamSMSOperationsScreeningsLocalIncomingMOModule = angular.module('adminportal.products.antispamsms.operations.screenings.localincomingmo');

    AntiSpamSMSOperationsScreeningsLocalIncomingMOModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations.screenings.localincomingmo', {
            url: "/localincomingmo",
            template: '<div ui-view></div>'
        }).state('products.antispamsms.operations.screenings.localincomingmo.list', {
            url: "/list",
            templateUrl: "products/antispamsms/operations/screenings/operations.screenings.localincomingmo.html",
            controller: "AntiSpamSMSOperationsScreeningsLocalIncomingMOCtrl",
            data: {
                permissions: [
                    'READ_ANTISPAM_SCREENINGLISTS_OPERATIONS'
                ]
            },
            resolve: {
                localIncomingMOList: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getLocalIncomingMOList();
                }
            }
        });

    });

    AntiSpamSMSOperationsScreeningsLocalIncomingMOModule.controller('AntiSpamSMSOperationsScreeningsLocalIncomingMOCtrl', function ($scope, $log, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                                    SMSAntiSpamConfigService, SCREENING_MANAGER_RULES, localIncomingMOList) {
        $log.debug('AntiSpamSMSOperationsScreeningsLocalIncomingMOCtrl');

        localIncomingMOList = localIncomingMOList ? localIncomingMOList : [];
        localIncomingMOList = $filter('orderBy')(localIncomingMOList, 'msc');

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'msc',
                    headerKey: 'Products.AntiSpamSMS.Operations.Screenings.TableColumns.Msc'
                }
            ]
        };

        $scope.SCREENING_MANAGER_RULES = SCREENING_MANAGER_RULES;

        $scope.screeningRule = $scope.SCREENING_MANAGER_RULES[1].value;

        // Local Incoming MO White List list
        $scope.whiteList = {
            list: localIncomingMOList,
            tableParams: {}
        };

        $scope.whiteList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "msc": 'asc'
            }
        }, {
            total: $scope.whiteList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.whiteList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.whiteList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Local Incoming MO White List list

        $scope.filterWhiteList = _.debounce(function (filterText, filterColumns) {
            $scope.whiteList.tableParams.settings().$scope.filterText = filterText;
            $scope.whiteList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.whiteList.tableParams.page(1);
            $scope.whiteList.tableParams.reload();
        }, 750);

        $scope.remove = function (entry) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing local incoming mo filtering entry: ', entry);

                SMSAntiSpamConfigService.deleteLocalIncomingMOListEntry(entry.msc).then(function (response) {
                    $log.debug('Removed local incoming mo filtering entry: ', entry, ', response: ', response);

                    var deletedListItem = _.findWhere($scope.whiteList.list, {
                        msc: entry.msc
                    });
                    $scope.whiteList.list = _.without($scope.whiteList.list, deletedListItem);

                    $scope.whiteList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete local incoming mo filtering entry: ', entry, ', response: ', response);
                });
            });
        };

        var openDetailModal = function (entry) {
            return $uibModal.open({
                templateUrl: 'products/antispamsms/operations/screenings/operations.screenings.localincomingmo.detail.modal.html',
                controller: 'AntiSpamSMSOperationsScreeningsLocalIncomingMODetailCtrl',
                resolve: {
                    localIncomingMOList: function () {
                        return localIncomingMOList;
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
                $scope.whiteList.list.push(entry);

                $scope.whiteList.tableParams.page(1);
                $scope.whiteList.tableParams.reload();
            }, function () {
                // Ignored
            });
        };
    });

    AntiSpamSMSOperationsScreeningsLocalIncomingMOModule.controller('AntiSpamSMSOperationsScreeningsLocalIncomingMODetailCtrl', function ($scope, $log, $uibModalInstance, $translate, notification, SMSAntiSpamConfigService, STATES,
                                                                                                                                          localIncomingMOList) {
        $log.debug('AntiSpamSMSOperationsScreeningsLocalIncomingMODetailCtrl');

        $scope.localIncomingMOList = localIncomingMOList;

        $scope.pageHeaderKey = 'Products.AntiSpamSMS.Operations.Screenings.LocalIncomingMO.AddNewEntryModalTitle';

        $scope.entry = {};

        // The watchers to check availability on the list.
        $scope.$watch('entry.msc', function (newVal) {
            if (newVal) {
                var foundItem = _.find($scope.localIncomingMOList, function (item) {
                    return (String(item.msc) === String(newVal));
                });

                $scope.form.msc.$setValidity('availabilityCheck', _.isUndefined(foundItem));
            }
        });

        // Save entry
        $scope.save = function (entry) {
            var entryItem = angular.copy(entry);

            SMSAntiSpamConfigService.createLocalIncomingMOListEntry(entryItem).then(function (response) {
                if (response && response.value) {
                    $log.debug('Cannot add local incoming mo filtering entry: ', entryItem, ', response: ', response);

                    notification({
                        type: 'warning',
                        text: response.value
                    });
                } else {
                    $log.debug('Added local incoming mo filtering entry: ', entryItem);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $uibModalInstance.close(entryItem);
                }
            }, function (response) {
                $log.debug('Cannot add local incoming mo filtering entry: ', entryItem, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
    });

})();
