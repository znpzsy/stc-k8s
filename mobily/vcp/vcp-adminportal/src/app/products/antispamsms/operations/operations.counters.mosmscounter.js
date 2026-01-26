(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.counters.mosmscounter', []);

    var AntiSpamSMSOperationsCountersMOSMSCounterModule = angular.module('adminportal.products.antispamsms.operations.counters.mosmscounter');

    var direction = 'MO';

    var prepareData = function (participant, type) {
        return {
            participant: participant,
            participantStateKey: s.classify(participant).toLowerCase(),
            type: type,
            typeStateKey: s.classify(s.humanize(type)).toLowerCase(),
            pageHeaderTypeKey: 'Products.AntiSpamSMS.Operations.Counters.' + s.classify(s.humanize(type))
        }
    };

    var moSMSCounterListStateDef = function (participant, type) {
        return {
            url: "/list",
            templateUrl: "products/antispamsms/operations/operations.counters.html",
            controller: 'AntiSpamSMSOperationsCountersMOSMSCounterCtrl',
            data: prepareData(participant, type),
            resolve: {
                moSMSCounters: ['SMSAntiSpamConfigService', function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getCountersList(direction, participant, type);
                }]
            }
        };
    };
    var moSMSCounterNewStateDef = function (participant, type) {
        return {
            url: "/new",
            templateUrl: "products/antispamsms/operations/operations.counters.detail.html",
            controller: 'AntiSpamSMSOperationsCountersNewMOSMSCounterCtrl',
            data: prepareData(participant, type)
        };
    };
    var moSMSCounterUpdateStateDef = function (participant, type) {
        return {
            url: "/update/:name",
            templateUrl: "products/antispamsms/operations/operations.counters.detail.html",
            controller: 'AntiSpamSMSOperationsCountersUpdateMOSMSCounterCtrl',
            data: prepareData(participant, type),
            resolve: {
                moSMSCountersEntry: ['$stateParams', 'SMSAntiSpamConfigService', function ($stateParams, SMSAntiSpamConfigService) {
                    var name = $stateParams.name;

                    return SMSAntiSpamConfigService.getCountersEntry(direction, participant, type, name);
                }]
            }
        };
    };

    AntiSpamSMSOperationsCountersMOSMSCounterModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations.counters.mosmscounter', {
            abstract: true,
            url: "/mosmscounter",
            template: '<div ui-view></div>',
            data: {
                pageHeaderKey: 'Products.AntiSpamSMS.Operations.Counters.MOSMSCounter.PageHeader'
            }
        }).state('products.antispamsms.operations.counters.mosmscounter.aparty', {
            abstract: true,
            url: "",
            template: '<div ui-view></div>',
            data: {
                pageHeaderDirectionKey: 'CommonLabels.AParty'
            }
        }).state('products.antispamsms.operations.counters.mosmscounter.bparty', {
            abstract: true,
            url: "",
            template: '<div ui-view></div>',
            data: {
                pageHeaderDirectionKey: 'CommonLabels.BParty'
            }
        });

        // AParty
        $stateProvider.state('products.antispamsms.operations.counters.mosmscounter.aparty.simple', {
            abstract: true,
            url: "/simple/aparty",
            template: '<div ui-view></div>'
        }).state('products.antispamsms.operations.counters.mosmscounter.aparty.simple.list', moSMSCounterListStateDef('A_PARTY', 'SIMPLE')
        ).state('products.antispamsms.operations.counters.mosmscounter.aparty.simple.new', moSMSCounterNewStateDef('A_PARTY', 'SIMPLE')
        ).state('products.antispamsms.operations.counters.mosmscounter.aparty.simple.update', moSMSCounterUpdateStateDef('A_PARTY', 'SIMPLE'));

        $stateProvider.state('products.antispamsms.operations.counters.mosmscounter.aparty.distinct', {
            abstract: true,
            url: "/distinct/aparty",
            template: '<div ui-view></div>'
        }).state('products.antispamsms.operations.counters.mosmscounter.aparty.distinct.list', moSMSCounterListStateDef('A_PARTY', 'DISTINCT')
        ).state('products.antispamsms.operations.counters.mosmscounter.aparty.distinct.new', moSMSCounterNewStateDef('A_PARTY', 'DISTINCT')
        ).state('products.antispamsms.operations.counters.mosmscounter.aparty.distinct.update', moSMSCounterUpdateStateDef('A_PARTY', 'DISTINCT'));

        $stateProvider.state('products.antispamsms.operations.counters.mosmscounter.aparty.contentsensitivesinglerecipient', {
            abstract: true,
            url: "/contentsensitivesinglerecipient/aparty",
            template: '<div ui-view></div>'
        }).state('products.antispamsms.operations.counters.mosmscounter.aparty.contentsensitivesinglerecipient.list', moSMSCounterListStateDef('A_PARTY', 'CONTENT_SENSITIVE_SINGLE_RECIPIENT')
        ).state('products.antispamsms.operations.counters.mosmscounter.aparty.contentsensitivesinglerecipient.new', moSMSCounterNewStateDef('A_PARTY', 'CONTENT_SENSITIVE_SINGLE_RECIPIENT')
        ).state('products.antispamsms.operations.counters.mosmscounter.aparty.contentsensitivesinglerecipient.update', moSMSCounterUpdateStateDef('A_PARTY', 'CONTENT_SENSITIVE_SINGLE_RECIPIENT'));

        $stateProvider.state('products.antispamsms.operations.counters.mosmscounter.aparty.contentsensitivemultiplerecipient', {
            abstract: true,
            url: "/contentsensitivemultiplerecipient/aparty",
            template: '<div ui-view></div>'
        }).state('products.antispamsms.operations.counters.mosmscounter.aparty.contentsensitivemultiplerecipient.list', moSMSCounterListStateDef('A_PARTY', 'CONTENT_SENSITIVE_MULTIPLE_RECIPIENT')
        ).state('products.antispamsms.operations.counters.mosmscounter.aparty.contentsensitivemultiplerecipient.new', moSMSCounterNewStateDef('A_PARTY', 'CONTENT_SENSITIVE_MULTIPLE_RECIPIENT')
        ).state('products.antispamsms.operations.counters.mosmscounter.aparty.contentsensitivemultiplerecipient.update', moSMSCounterUpdateStateDef('A_PARTY', 'CONTENT_SENSITIVE_MULTIPLE_RECIPIENT'));

        // BParty
        $stateProvider.state('products.antispamsms.operations.counters.mosmscounter.bparty.simple', {
            abstract: true,
            url: "/simple/bparty",
            template: '<div ui-view></div>'
        }).state('products.antispamsms.operations.counters.mosmscounter.bparty.simple.list', moSMSCounterListStateDef('B_PARTY', 'SIMPLE')
        ).state('products.antispamsms.operations.counters.mosmscounter.bparty.simple.new', moSMSCounterNewStateDef('B_PARTY', 'SIMPLE')
        ).state('products.antispamsms.operations.counters.mosmscounter.bparty.simple.update', moSMSCounterUpdateStateDef('B_PARTY', 'SIMPLE'));
    });

    AntiSpamSMSOperationsCountersMOSMSCounterModule.controller('AntiSpamSMSOperationsCountersMOSMSCounterCommonCtrl', function ($scope, $log, $state, SMS_ANTISPAM_COUNTER_TYPES, STATES, SMS_ANTISPAM_RANGE_POLICIES, SMS_ANTISPAM_REJECT_METHODS_3) {
        $log.debug('AntiSpamSMSOperationsCountersMOSMSCounterCommonCtrl');

        var participantStateKey = $state.current.data.participantStateKey;
        var typeStateKey = $state.current.data.typeStateKey;

        $scope.listState = "products.antispamsms.operations.counters.mosmscounter." + participantStateKey + "." + typeStateKey + ".list";
        $scope.newState = "products.antispamsms.operations.counters.mosmscounter." + participantStateKey + "." + typeStateKey + ".new";
        $scope.updateState = "products.antispamsms.operations.counters.mosmscounter." + participantStateKey + "." + typeStateKey + ".update";

        $scope.direction = direction;
        $scope.participant = $state.current.data.participant;
        $scope.type = $state.current.data.type;
        $scope.pageHeaderKey = $state.current.data.pageHeaderKey;
        $scope.pageHeaderDirectionKey = $state.current.data.pageHeaderDirectionKey;
        $scope.pageHeaderTypeKey = $state.current.data.pageHeaderTypeKey;

        $scope.COUNTER_TYPES = SMS_ANTISPAM_COUNTER_TYPES;
        $scope.STATES = STATES;
        $scope.SMS_ANTISPAM_RANGE_POLICIES = SMS_ANTISPAM_RANGE_POLICIES;
        $scope.SMS_ANTISPAM_REJECT_METHODS_3 = SMS_ANTISPAM_REJECT_METHODS_3;

        $scope.cancel = function () {
            $state.go($scope.listState);
        };
    });

    AntiSpamSMSOperationsCountersMOSMSCounterModule.controller('AntiSpamSMSOperationsCountersMOSMSCounterCtrl', function ($scope, $log, $controller, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                          SMSAntiSpamConfigService, moSMSCounters) {
        $log.debug('AntiSpamSMSOperationsCountersMOSMSCounterCtrl');

        $controller('AntiSpamSMSOperationsCountersMOSMSCounterCommonCtrl', {
            $scope: $scope
        });

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'name',
                    headerKey: 'Products.AntiSpamSMS.Operations.Counters.TableColumns.Name'
                },
                {
                    fieldName: 'rangePolicy',
                    headerKey: 'Products.AntiSpamSMS.Operations.Counters.TableColumns.RangePolicy'
                },
                {
                    fieldName: 'status',
                    headerKey: 'CommonLabels.State'
                },
                {
                    fieldName: 'monitoringDuration',
                    headerKey: 'Products.AntiSpamSMS.Operations.Counters.TableColumns.MonitoringDuration'
                },
                {
                    fieldName: 'blockingDuration',
                    headerKey: 'Products.AntiSpamSMS.Operations.Counters.TableColumns.BlockingDuration'
                },
                {
                    fieldName: 'maxMessages',
                    headerKey: 'Products.AntiSpamSMS.Operations.Counters.TableColumns.MaxNumberOfMessages'
                },
                {
                    fieldName: 'rejectMethod',
                    headerKey: 'Products.AntiSpamSMS.Operations.Counters.TableColumns.RejectMethod',
                    filter: {name: 'AntiSpamSMSRejectMethodFilter'}
                }
            ]
        };

        if ($scope.type === 'DISTINCT' || $scope.type === 'CONTENT_SENSITIVE_MULTIPLE_RECIPIENT') {
            $scope.exportOptions.columns.push(
                {
                    fieldName: 'maxNumberOfDistinctRecipients',
                    headerKey: 'Products.AntiSpamSMS.Operations.Counters.TableColumns.MaxNumberOfDistinctRecipients'
                }
            );
        }

        var counters = moSMSCounters.counters ? moSMSCounters.counters : [];

        // MO SMS Counter list
        $scope.counterList = {
            list: counters,
            tableParams: {}
        };

        $scope.counterList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "name": 'asc'
            }
        }, {
            total: $scope.counterList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.counterList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.counterList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - MO SMS Counter list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.counterList.tableParams.settings().$scope.filterText = filterText;
            $scope.counterList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.counterList.tableParams.page(1);
            $scope.counterList.tableParams.reload();
        }, 750);

        $scope.remove = function (entry) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing mo sms counters entry: ', entry);

                SMSAntiSpamConfigService.deleteCountersEntry($scope.direction, $scope.participant, $scope.type, entry.name).then(function (response) {
                    $log.debug('Removed mo sms counters entry: ', entry, ', response: ', response);

                    var deletedListItem = _.findWhere($scope.counterList.list, {name: entry.name});
                    $scope.counterList.list = _.without($scope.counterList.list, deletedListItem);

                    $scope.counterList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete mo sms counters entry: ', entry, ', response: ', response);
                });
            });
        };

        $scope.setAddressRange = function (entry) {
            $uibModal.open({
                templateUrl: 'products/antispamsms/operations/operations.counters.addressranges.modal.html',
                controller: 'AntiSpamSMSOperationsCountersAddressRangesCtrl',
                size: 'lg',
                resolve: {
                    countersEntry: function () {
                        return entry;
                    },
                    direction: function () {
                        return $scope.direction;
                    },
                    participant: function () {
                        return $scope.participant;
                    },
                    type: function () {
                        return $scope.type;
                    },
                    msisdnRanges: function (SMSAntiSpamConfigService) {
                        return SMSAntiSpamConfigService.getMsisdnRangeList();
                    },
                    addressRanges: function () {
                        return SMSAntiSpamConfigService.getCountersEntryRangeList($scope.direction, $scope.participant, $scope.type, entry.name);
                    }
                }
            });
        };
    });

    AntiSpamSMSOperationsCountersMOSMSCounterModule.controller('AntiSpamSMSOperationsCountersNewMOSMSCounterCtrl', function ($scope, $log, $controller, $state, $translate, notification, SMSAntiSpamConfigService) {
        $log.debug('AntiSpamSMSOperationsCountersNewMOSMSCounterCtrl');

        $controller('AntiSpamSMSOperationsCountersMOSMSCounterCommonCtrl', {
            $scope: $scope
        });

        $scope.entry = {
            state: $scope.STATES[0],
            rangePolicy: $scope.SMS_ANTISPAM_RANGE_POLICIES[0].value,
            rejectMethod: $scope.SMS_ANTISPAM_REJECT_METHODS_3[2].value
        };

        $scope.isNotChanged = function () {
            return false;
        };

        $scope.save = function (entry) {
            var entryItem = angular.copy(entry);
            entryItem.type = $scope.type;

            SMSAntiSpamConfigService.createCountersEntry($scope.direction, $scope.participant, $scope.type, entryItem).then(function (response) {
                if (response && response.value === "TEMPORARY_RESERVED_KEYWORD" && response.message.indexOf('must be unique') > 1) {
                    $log.debug('Cannot add mo sms counters entry: ', entryItem, ', response: ', response);

                    notification({
                        type: 'warning',
                        text: $translate.instant('Products.AntiSpamSMS.Operations.Counters.Messages.EntryAlreadyDefinedError', {name: entryItem.name})
                    });
                } else if (response && response.value === "TEMPORARY_RESERVED_KEYWORD" && response.message.indexOf('cannot use') > 1) {
                    $log.debug('Cannot add mo sms counters entry so the name temporary reserved: ', entryItem, ', response: ', response);

                    notification({
                        type: 'warning',
                        text: $translate.instant('Products.AntiSpamSMS.Operations.Counters.Messages.EntryTemporaryReservedError', {name: entryItem.name})
                    });
                } else {
                    $log.debug('Added mo sms counters entry: ', entryItem);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $state.go($scope.listState);
                }
            }, function (response) {
                $log.debug('Cannot add mo sms counters entry: ', entryItem, ', response: ', response);
            });
        };
    });

    AntiSpamSMSOperationsCountersMOSMSCounterModule.controller('AntiSpamSMSOperationsCountersUpdateMOSMSCounterCtrl', function ($scope, $log, $controller, $state, $translate, notification, SMSAntiSpamConfigService, moSMSCountersEntry) {
        $log.debug('AntiSpamSMSOperationsCountersUpdateMOSMSCounterCtrl');

        $controller('AntiSpamSMSOperationsCountersMOSMSCounterCommonCtrl', {
            $scope: $scope
        });

        $scope.entry = moSMSCountersEntry;
        $scope.entry.id = $scope.entry.name;

        $scope.originalEntry = angular.copy($scope.entry);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalEntry, $scope.entry);
        };

        $scope.save = function (entry) {
            var entryItem = angular.copy(entry);
            entryItem.type = $scope.type;
            delete entryItem.id;

            SMSAntiSpamConfigService.updateCountersEntry($scope.direction, $scope.participant, $scope.type, entryItem).then(function (response) {
                $log.debug('Updated mo sms counters entry: ', entryItem, ', response: ', response);

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $state.go($scope.listState);
            }, function (response) {
                $log.debug('Cannot update mo sms counters entry: ', entryItem, ', response: ', response);
            });
        };
    });

})();
