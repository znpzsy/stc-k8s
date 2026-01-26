(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.counters.mtsmscounter', []);

    var AntiSpamSMSOperationsCountersMTSMSCounterModule = angular.module('adminportal.products.antispamsms.operations.counters.mtsmscounter');

    var direction = 'MT';

    var prepareData = function (participant, type) {
        return {
            participant: participant,
            participantStateKey: s.classify(participant).toLowerCase(),
            type: type,
            typeStateKey: s.classify(s.humanize(type)).toLowerCase(),
            pageHeaderTypeKey: 'Products.AntiSpamSMS.Operations.Counters.' + s.classify(s.humanize(type))
        }
    };

    var mtSMSCounterListStateDef = function (participant, type) {
        return {
            url: "/list",
            templateUrl: "products/antispamsms/operations/operations.counters.html",
            controller: 'AntiSpamSMSOperationsCountersMTSMSCounterCtrl',
            data: prepareData(participant, type),
            resolve: {
                mtSMSCounters: ['SMSAntiSpamConfigService', function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getCountersList(direction, participant, type);
                }]
            }
        };
    };
    var mtSMSCounterNewStateDef = function (participant, type) {
        return {
            url: "/new",
            templateUrl: "products/antispamsms/operations/operations.counters.detail.html",
            controller: 'AntiSpamSMSOperationsCountersNewMTSMSCounterCtrl',
            data: prepareData(participant, type)
        };
    };
    var mtSMSCounterUpdateStateDef = function (participant, type) {
        return {
            url: "/update/:name",
            templateUrl: "products/antispamsms/operations/operations.counters.detail.html",
            controller: 'AntiSpamSMSOperationsCountersUpdateMTSMSCounterCtrl',
            data: prepareData(participant, type),
            resolve: {
                mtSMSCountersEntry: ['$stateParams', 'SMSAntiSpamConfigService', function ($stateParams, SMSAntiSpamConfigService) {
                    var name = $stateParams.name;

                    return SMSAntiSpamConfigService.getCountersEntry(direction, participant, type, name);
                }]
            }
        };
    };

    AntiSpamSMSOperationsCountersMTSMSCounterModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations.counters.mtsmscounter', {
            abstract: true,
            url: "/mtsmscounter",
            template: '<div ui-view></div>',
            data: {
                pageHeaderKey: 'Products.AntiSpamSMS.Operations.Counters.MTSMSCounter.PageHeader'
            }
        }).state('products.antispamsms.operations.counters.mtsmscounter.aparty', {
            abstract: true,
            url: "",
            template: '<div ui-view></div>',
            data: {
                pageHeaderDirectionKey: 'CommonLabels.AParty'
            }
        }).state('products.antispamsms.operations.counters.mtsmscounter.bparty', {
            abstract: true,
            url: "",
            template: '<div ui-view></div>',
            data: {
                pageHeaderDirectionKey: 'CommonLabels.BParty'
            }
        });

        // AParty
        $stateProvider.state('products.antispamsms.operations.counters.mtsmscounter.aparty.simple', {
            abstract: true,
            url: "/simple/aparty",
            template: '<div ui-view></div>'
        }).state('products.antispamsms.operations.counters.mtsmscounter.aparty.simple.list', mtSMSCounterListStateDef('A_PARTY', 'SIMPLE')
        ).state('products.antispamsms.operations.counters.mtsmscounter.aparty.simple.new', mtSMSCounterNewStateDef('A_PARTY', 'SIMPLE')
        ).state('products.antispamsms.operations.counters.mtsmscounter.aparty.simple.update', mtSMSCounterUpdateStateDef('A_PARTY', 'SIMPLE'));

        $stateProvider.state('products.antispamsms.operations.counters.mtsmscounter.aparty.distinct', {
            abstract: true,
            url: "/distinct/aparty",
            template: '<div ui-view></div>'
        }).state('products.antispamsms.operations.counters.mtsmscounter.aparty.distinct.list', mtSMSCounterListStateDef('A_PARTY', 'DISTINCT')
        ).state('products.antispamsms.operations.counters.mtsmscounter.aparty.distinct.new', mtSMSCounterNewStateDef('A_PARTY', 'DISTINCT')
        ).state('products.antispamsms.operations.counters.mtsmscounter.aparty.distinct.update', mtSMSCounterUpdateStateDef('A_PARTY', 'DISTINCT'));

        $stateProvider.state('products.antispamsms.operations.counters.mtsmscounter.aparty.contentsensitivesinglerecipient', {
            abstract: true,
            url: "/contentsensitivesinglerecipient/aparty",
            template: '<div ui-view></div>'
        }).state('products.antispamsms.operations.counters.mtsmscounter.aparty.contentsensitivesinglerecipient.list', mtSMSCounterListStateDef('A_PARTY', 'CONTENT_SENSITIVE_SINGLE_RECIPIENT')
        ).state('products.antispamsms.operations.counters.mtsmscounter.aparty.contentsensitivesinglerecipient.new', mtSMSCounterNewStateDef('A_PARTY', 'CONTENT_SENSITIVE_SINGLE_RECIPIENT')
        ).state('products.antispamsms.operations.counters.mtsmscounter.aparty.contentsensitivesinglerecipient.update', mtSMSCounterUpdateStateDef('A_PARTY', 'CONTENT_SENSITIVE_SINGLE_RECIPIENT'));

        $stateProvider.state('products.antispamsms.operations.counters.mtsmscounter.aparty.contentsensitivemultiplerecipient', {
            abstract: true,
            url: "/contentsensitivemultiplerecipient/aparty",
            template: '<div ui-view></div>'
        }).state('products.antispamsms.operations.counters.mtsmscounter.aparty.contentsensitivemultiplerecipient.list', mtSMSCounterListStateDef('A_PARTY', 'CONTENT_SENSITIVE_MULTIPLE_RECIPIENT')
        ).state('products.antispamsms.operations.counters.mtsmscounter.aparty.contentsensitivemultiplerecipient.new', mtSMSCounterNewStateDef('A_PARTY', 'CONTENT_SENSITIVE_MULTIPLE_RECIPIENT')
        ).state('products.antispamsms.operations.counters.mtsmscounter.aparty.contentsensitivemultiplerecipient.update', mtSMSCounterUpdateStateDef('A_PARTY', 'CONTENT_SENSITIVE_MULTIPLE_RECIPIENT'));

        // BParty
        $stateProvider.state('products.antispamsms.operations.counters.mtsmscounter.bparty.simple', {
            abstract: true,
            url: "/simple/bparty",
            template: '<div ui-view></div>'
        }).state('products.antispamsms.operations.counters.mtsmscounter.bparty.simple.list', mtSMSCounterListStateDef('B_PARTY', 'SIMPLE')
        ).state('products.antispamsms.operations.counters.mtsmscounter.bparty.simple.new', mtSMSCounterNewStateDef('B_PARTY', 'SIMPLE')
        ).state('products.antispamsms.operations.counters.mtsmscounter.bparty.simple.update', mtSMSCounterUpdateStateDef('B_PARTY', 'SIMPLE'));
    });

    AntiSpamSMSOperationsCountersMTSMSCounterModule.controller('AntiSpamSMSOperationsCountersMTSMSCounterCommonCtrl', function ($scope, $log, $state, SMS_ANTISPAM_COUNTER_TYPES, STATES, SMS_ANTISPAM_RANGE_POLICIES, SMS_ANTISPAM_REJECT_METHODS_3) {
        $log.debug('AntiSpamSMSOperationsCountersMTSMSCounterCommonCtrl');

        var participantStateKey = $state.current.data.participantStateKey;
        var typeStateKey = $state.current.data.typeStateKey;

        $scope.listState = "products.antispamsms.operations.counters.mtsmscounter." + participantStateKey + "." + typeStateKey + ".list";
        $scope.newState = "products.antispamsms.operations.counters.mtsmscounter." + participantStateKey + "." + typeStateKey + ".new";
        $scope.updateState = "products.antispamsms.operations.counters.mtsmscounter." + participantStateKey + "." + typeStateKey + ".update";

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

    AntiSpamSMSOperationsCountersMTSMSCounterModule.controller('AntiSpamSMSOperationsCountersMTSMSCounterCtrl', function ($scope, $log, $controller, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                          SMSAntiSpamConfigService, mtSMSCounters) {
        $log.debug('AntiSpamSMSOperationsCountersMTSMSCounterCtrl');

        $controller('AntiSpamSMSOperationsCountersMTSMSCounterCommonCtrl', {
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

        var counters = mtSMSCounters.counters ? mtSMSCounters.counters : [];

        // MT SMS Counter list
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
        // END - MT SMS Counter list

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
                $log.debug('Removing mt sms counters entry: ', entry);

                SMSAntiSpamConfigService.deleteCountersEntry($scope.direction, $scope.participant, $scope.type, entry.name).then(function (response) {
                    $log.debug('Removed mt sms counters entry: ', entry, ', response: ', response);

                    var deletedListItem = _.findWhere($scope.counterList.list, {name: entry.name});
                    $scope.counterList.list = _.without($scope.counterList.list, deletedListItem);

                    $scope.counterList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete mt sms counters entry: ', entry, ', response: ', response);
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

    AntiSpamSMSOperationsCountersMTSMSCounterModule.controller('AntiSpamSMSOperationsCountersNewMTSMSCounterCtrl', function ($scope, $log, $controller, $state, $translate, notification, SMSAntiSpamConfigService) {
        $log.debug('AntiSpamSMSOperationsCountersNewMTSMSCounterCtrl');

        $controller('AntiSpamSMSOperationsCountersMTSMSCounterCommonCtrl', {
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
                    $log.debug('Cannot add mt sms counters entry: ', entryItem, ', response: ', response);

                    notification({
                        type: 'warning',
                        text: $translate.instant('Products.AntiSpamSMS.Operations.Counters.Messages.EntryAlreadyDefinedError', {name: entryItem.name})
                    });
                } else if (response && response.value === "TEMPORARY_RESERVED_KEYWORD" && response.message.indexOf('cannot use') > 1) {
                    $log.debug('Cannot add mt sms counters entry so the name temporary reserved: ', entryItem, ', response: ', response);

                    notification({
                        type: 'warning',
                        text: $translate.instant('Products.AntiSpamSMS.Operations.Counters.Messages.EntryTemporaryReservedError', {name: entryItem.name})
                    });
                } else {
                    $log.debug('Added mt sms counters entry: ', entryItem);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $state.go($scope.listState);
                }
            }, function (response) {
                $log.debug('Cannot add mt sms counters entry: ', entryItem, ', response: ', response);
            });
        };
    });

    AntiSpamSMSOperationsCountersMTSMSCounterModule.controller('AntiSpamSMSOperationsCountersUpdateMTSMSCounterCtrl', function ($scope, $log, $controller, $state, $translate, notification, SMSAntiSpamConfigService, mtSMSCountersEntry) {
        $log.debug('AntiSpamSMSOperationsCountersUpdateMTSMSCounterCtrl');

        $controller('AntiSpamSMSOperationsCountersMTSMSCounterCommonCtrl', {
            $scope: $scope
        });

        $scope.entry = mtSMSCountersEntry;
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
                $log.debug('Updated mt sms counters entry: ', entryItem, ', response: ', response);

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $state.go($scope.listState);
            }, function (response) {
                $log.debug('Cannot update mt sms counters entry: ', entryItem, ', response: ', response);
            });
        };
    });

})();
