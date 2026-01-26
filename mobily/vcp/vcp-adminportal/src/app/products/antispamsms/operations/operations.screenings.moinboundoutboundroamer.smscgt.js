(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.screenings.moinboundoutboundroamer.smscgt', []);

    var AntiSpamSMSOperationsScreeningsMOInboundOutboundRoamerSMSCGTModule = angular.module('adminportal.products.antispamsms.operations.screenings.moinboundoutboundroamer.smscgt');

    AntiSpamSMSOperationsScreeningsMOInboundOutboundRoamerSMSCGTModule.controller('AntiSpamSMSOperationsScreeningsMOInboundOutboundRoamerSMSCGTCtrl', function ($scope, $uibModalInstance, $log, $filter, $uibModal, $translate, notification, NgTableParams, NgTableService,
                                                                                                                                                                STATES, SMSAntiSpamConfigService, smscGTList, entry) {
        $log.debug("AntiSpamSMSOperationsScreeningsMOInboundOutboundRoamerSMSCGTCtrl");

        smscGTList.exclusionSmsGtList = smscGTList.exclusionSmsGtList ? smscGTList.exclusionSmsGtList : [];
        smscGTList.exclusionSmsGtList = $filter('orderBy')(smscGTList.exclusionSmsGtList, 'smscGT');

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'smscGT',
                    headerKey: 'Products.AntiSpamSMS.Operations.Screenings.TableColumns.SMSCGT'
                },
                {
                    fieldName: 'status',
                    headerKey: 'CommonLabels.State',
                    filter: {name: 'StatusTypeFilter'}
                }
            ]
        };
        $scope.STATES = STATES;

        $scope.entry = entry;

        $scope.newSMSCGT = {
            smscGT: '',
            status: $scope.STATES[0]
        };

        // SMSC GT list
        $scope.smscGTList = {
            list: smscGTList.exclusionSmsGtList,
            tableParams: {}
        };

        $scope.smscGTList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "smscGT": 'asc'
            }
        }, {
            total: $scope.smscGTList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.smscGTList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.smscGTList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - SMSC GT list

        var tableScope = $scope.smscGTList.tableParams.settings().$scope;

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            tableScope.filterText = filterText;
            tableScope.filterColumns = filterColumns;
            $scope.smscGTList.tableParams.page(1);
            $scope.smscGTList.tableParams.reload();
        }, 750);

        // The watchers to check availability on the list.
        tableScope.$watch('newSMSCGT.smscGT', function (newVal) {
            if (newVal) {
                var foundItem = _.find($scope.smscGTList.list, function (item) {
                    return (String(item.smscGT) === String(newVal));
                });

                tableScope.form.smscGT.$setValidity('availabilityCheck', _.isUndefined(foundItem));
            }
        });

        // Add SMSC GT
        $scope.addNewSMSCGT = function (smscGT) {
            var smscGTItem = angular.copy(smscGT);
            smscGTItem.status = (smscGTItem.status === $scope.STATES[0]);

            SMSAntiSpamConfigService.createMOInboundOutboundRoamerFilteringSMSCGT($scope.entry.prefix, smscGTItem).then(function (response) {
                if (response && response.value === "ALREADY_SUBSCRIBED") {
                    $log.debug('Cannot add MO Inbound Outbound Roamer smsc gt: ', smscGTItem, ', response: ', response);

                    notification({
                        type: 'warning',
                        text: $translate.instant('Products.AntiSpamSMS.Operations.Screening.Messages.SMSCGTAlreadyDefinedError', {
                            smscGT: smscGTItem.smscGT
                        })
                    });
                } else {
                    $log.debug('Added MO Inbound Outbound Roamer smsc gt: ', smscGTItem);

                    $scope.smscGTList.list.push(smscGTItem);
                    $scope.smscGTList.tableParams.reload();

                    tableScope.form.$setPristine();
                    tableScope.newSMSCGT.smscGT = '';
                    tableScope.newSMSCGT.status = $scope.STATES[0];
                }
            }, function (response) {
                $log.debug('Cannot add MO Inbound Outbound Roamer smsc gt: ', smscGTItem, ', response: ', response);
            });
        };

        // Remove SMSC GT
        $scope.removeSMSCGT = function (smscGTItem) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing MO Inbound Outbound Roamer smsc gt: ', smscGTItem);

                SMSAntiSpamConfigService.deleteMOInboundOutboundRoamerFilteringSMSCGTList($scope.entry.prefix, smscGTItem.smscGT).then(function (response) {
                    $log.debug('Deleted MO Inbound Outbound Roamer smsc gt: ', smscGTItem, ', response: ', response);

                    var deletedListItem = _.findWhere($scope.smscGTList.list, {
                        smscGT: smscGTItem.smscGT
                    });
                    $scope.smscGTList.list = _.without($scope.smscGTList.list, deletedListItem);

                    $scope.smscGTList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete MO Inbound Outbound Roamer smsc gt: ', smscGTItem, ', response: ', response);
                });
            });
        };

        $scope.ok = function () {
            $uibModalInstance.close();
        };
    });

})();
