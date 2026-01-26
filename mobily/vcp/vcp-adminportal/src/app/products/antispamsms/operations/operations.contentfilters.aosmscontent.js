(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.contentfilters.aosmscontent', []);

    var AntiSpamSMSOperationsContentFiltersAOSMSContentModule = angular.module('adminportal.products.antispamsms.operations.contentfilters.aosmscontent');

    var direction = 'AO';

    var prepareData = function (participant) {
        return {
            participant: participant,
            participantStateKey: s.classify(participant).toLowerCase(),
            pageHeaderTypeKey: 'Products.AntiSpamSMS.Operations.ContentFilters.ContentFilter'
        }
    };

    var aoSMSContentListStateDef = function (participant) {
        return {
            url: "/list",
            templateUrl: "products/antispamsms/operations/operations.contentfilters.html",
            controller: 'AntiSpamSMSOperationsContentFiltersAOSMSContentCtrl',
            data: prepareData(participant),
            resolve: {
                aoSMSContentFilters: ['SMSAntiSpamConfigService', function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getContentFiltersList(direction, participant);
                }]
            }
        };
    };
    var aoSMSContentNewStateDef = function (participant) {
        return {
            url: "/new",
            templateUrl: "products/antispamsms/operations/operations.contentfilters.detail.html",
            controller: 'AntiSpamSMSOperationsContentFiltersNewAOSMSContentCtrl',
            data: prepareData(participant)
        };
    };
    var aoSMSContentUpdateStateDef = function (participant) {
        return {
            url: "/update/:name",
            templateUrl: "products/antispamsms/operations/operations.contentfilters.detail.html",
            controller: 'AntiSpamSMSOperationsContentFiltersUpdateAOSMSContentCtrl',
            data: prepareData(participant),
            resolve: {
                aoSMSContentFiltersEntry: ['$stateParams', 'SMSAntiSpamConfigService', function ($stateParams, SMSAntiSpamConfigService) {
                    var name = $stateParams.name;

                    return SMSAntiSpamConfigService.getContentFiltersEntry(direction, participant, name);
                }]
            }
        };
    };

    AntiSpamSMSOperationsContentFiltersAOSMSContentModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations.contentfilters.aosmscontent', {
            abstract: true,
            url: "/aosmscontent",
            template: '<div ui-view></div>',
            data: {
                pageHeaderKey: 'Products.AntiSpamSMS.Operations.ContentFilters.AOSMSContent.Title'
            }
        }).state('products.antispamsms.operations.contentfilters.aosmscontent.aparty', {
            abstract: true,
            url: "/aparty",
            template: '<div ui-view></div>',
            data: {
                pageHeaderDirectionKey: 'CommonLabels.AParty'
            }
        });

        // AParty
        $stateProvider.state('products.antispamsms.operations.contentfilters.aosmscontent.aparty.list', aoSMSContentListStateDef('A_PARTY')
        ).state('products.antispamsms.operations.contentfilters.aosmscontent.aparty.new', aoSMSContentNewStateDef('A_PARTY')
        ).state('products.antispamsms.operations.contentfilters.aosmscontent.aparty.update', aoSMSContentUpdateStateDef('A_PARTY'));

    });

    AntiSpamSMSOperationsContentFiltersAOSMSContentModule.controller('AntiSpamSMSOperationsContentFiltersAOSMSContentCommonCtrl', function ($scope, $log, $state, STATES, SMS_ANTISPAM_RANGE_POLICIES, SMS_ANTISPAM_EVALUATION_TYPES, SMS_ANTISPAM_CASE_SENSITIVITY,
                                                                                                                                            SMS_ANTISPAM_REJECT_METHODS_3) {
        $log.debug('AntiSpamSMSOperationsContentFiltersAOSMSContentCommonCtrl');

        var participantStateKey = $state.current.data.participantStateKey;

        $scope.listState = "products.antispamsms.operations.contentfilters.aosmscontent." + participantStateKey + ".list";
        $scope.newState = "products.antispamsms.operations.contentfilters.aosmscontent." + participantStateKey + ".new";
        $scope.updateState = "products.antispamsms.operations.contentfilters.aosmscontent." + participantStateKey + ".update";

        $scope.direction = direction;
        $scope.participant = $state.current.data.participant;
        $scope.pageHeaderKey = $state.current.data.pageHeaderKey;
        $scope.pageHeaderDirectionKey = $state.current.data.pageHeaderDirectionKey;
        $scope.pageHeaderTypeKey = $state.current.data.pageHeaderTypeKey;

        $scope.STATES = STATES;
        $scope.SMS_ANTISPAM_RANGE_POLICIES = SMS_ANTISPAM_RANGE_POLICIES;
        $scope.SMS_ANTISPAM_EVALUATION_TYPES = SMS_ANTISPAM_EVALUATION_TYPES;
        $scope.SMS_ANTISPAM_CASE_SENSITIVITY = SMS_ANTISPAM_CASE_SENSITIVITY;
        $scope.SMS_ANTISPAM_REJECT_METHODS_3 = SMS_ANTISPAM_REJECT_METHODS_3;

        // The watchers to compare values of max number of messages and blocking duration number.
        $scope.$watch('entry.blockingDuration', function (newVal) {
            if (!_.isUndefined(newVal) && $scope.entry) {
                var maxMessageValue = s.toNumber($scope.entry.maxMessage);
                var isAllowed = !(maxMessageValue > 0 && newVal === 0);
                $scope.form.blockingDuration.$setValidity('valueNotAllowed', isAllowed);
                if (isAllowed)
                    $scope.form.maxMessage.$setValidity('valueNotAllowed', isAllowed);
            }
        });
        $scope.$watch('entry.maxMessage', function (newVal) {
            if (!_.isUndefined(newVal) && $scope.entry) {
                var blockingDurationValue = s.toNumber($scope.entry.blockingDuration);
                var isAllowed = !(newVal > 0 && blockingDurationValue === 0);
                $scope.form.maxMessage.$setValidity('valueNotAllowed', isAllowed);
                if (isAllowed)
                    $scope.form.blockingDuration.$setValidity('valueNotAllowed', isAllowed);
            }
        });

        $scope.cancel = function () {
            $state.go($scope.listState);
        };
    });

    AntiSpamSMSOperationsContentFiltersAOSMSContentModule.controller('AntiSpamSMSOperationsContentFiltersAOSMSContentCtrl', function ($scope, $log, $controller, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                                      SMSAntiSpamConfigService, aoSMSContentFilters) {
        $log.debug('AntiSpamSMSOperationsContentFiltersAOSMSContentCtrl');

        $controller('AntiSpamSMSOperationsContentFiltersAOSMSContentCommonCtrl', {$scope: $scope});

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'name',
                    headerKey: 'Products.AntiSpamSMS.Operations.ContentFilters.TableColumns.Name'
                },
                {
                    fieldName: 'contentFilter',
                    headerKey: 'Products.AntiSpamSMS.Operations.ContentFilters.TableColumns.FilterSetting'
                },
                {
                    fieldName: 'evaluationType',
                    headerKey: 'Products.AntiSpamSMS.Operations.ContentFilters.TableColumns.EvalType'
                },
                {
                    fieldName: 'caseSensitive',
                    headerKey: 'Products.AntiSpamSMS.Operations.ContentFilters.TableColumns.CaseSensitivity'
                },
                {
                    fieldName: 'state',
                    headerKey: 'CommonLabels.State'
                },
                {
                    fieldName: 'rangePolicy',
                    headerKey: 'Products.AntiSpamSMS.Operations.ContentFilters.TableColumns.RangePolicy'
                },
                {
                    fieldName: 'blockingDuration',
                    headerKey: 'Products.AntiSpamSMS.Operations.ContentFilters.TableColumns.BlockingDuration'
                },
                {
                    fieldName: 'maxMessage',
                    headerKey: 'Products.AntiSpamSMS.Operations.ContentFilters.TableColumns.MaxNumberOfMessages'
                },
                {
                    fieldName: 'rejectMethod',
                    headerKey: 'Products.AntiSpamSMS.Operations.ContentFilters.TableColumns.RejectMethod',
                    filter: {name: 'AntiSpamSMSRejectMethodFilter'}
                }
            ]
        };

        var contentFilters = aoSMSContentFilters ? aoSMSContentFilters : [];

        // AO SMS Content Filter list
        $scope.contentFilterList = {
            list: contentFilters,
            tableParams: {}
        };

        $scope.contentFilterList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "name": 'asc'
            }
        }, {
            total: $scope.contentFilterList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.contentFilterList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.contentFilterList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - AO SMS Content Filter list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.contentFilterList.tableParams.settings().$scope.filterText = filterText;
            $scope.contentFilterList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.contentFilterList.tableParams.page(1);
            $scope.contentFilterList.tableParams.reload();
        }, 750);

        $scope.remove = function (entry) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing ao sms content filters entry: ', entry);

                SMSAntiSpamConfigService.deleteContentFiltersEntry($scope.direction, $scope.participant, entry.name).then(function (response) {
                    $log.debug('Removed ao sms content filters entry: ', entry, ', response: ', response);

                    var deletedListItem = _.findWhere($scope.contentFilterList.list, {name: entry.name});
                    $scope.contentFilterList.list = _.without($scope.contentFilterList.list, deletedListItem);

                    $scope.contentFilterList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete ao sms content filters entry: ', entry, ', response: ', response);
                });
            });
        };

        $scope.setAddressRange = function (entry) {
            $uibModal.open({
                templateUrl: 'products/antispamsms/operations/operations.contentfilters.addressranges.modal.html',
                controller: 'AntiSpamSMSOperationsContentFiltersAddressRangesCtrl',
                size: 'lg',
                resolve: {
                    contentFiltersEntry: function () {
                        return entry;
                    },
                    direction: function () {
                        return $scope.direction;
                    },
                    participant: function () {
                        return $scope.participant;
                    },
                    msisdnRanges: function (SMSAntiSpamConfigService) {
                        return SMSAntiSpamConfigService.getMsisdnRangeList();
                    },
                    addressRanges: function () {
                        return SMSAntiSpamConfigService.getContentFiltersEntryRangeList($scope.direction, $scope.participant, entry.name);
                    }
                }
            });
        };
    });

    AntiSpamSMSOperationsContentFiltersAOSMSContentModule.controller('AntiSpamSMSOperationsContentFiltersNewAOSMSContentCtrl', function ($scope, $log, $controller, $state, $translate, notification, SMSAntiSpamConfigService) {
        $log.debug('AntiSpamSMSOperationsContentFiltersNewAOSMSContentCtrl');

        $controller('AntiSpamSMSOperationsContentFiltersAOSMSContentCommonCtrl', {$scope: $scope});

        $scope.entry = {
            state: $scope.STATES[0],
            rangePolicy: $scope.SMS_ANTISPAM_RANGE_POLICIES[0].value,
            evaluationType: $scope.SMS_ANTISPAM_EVALUATION_TYPES[0].value,
            caseSensitive: $scope.SMS_ANTISPAM_CASE_SENSITIVITY[1].value,
            maxMessage: 0,
            blockingDuration: 0,
            rejectMethod: $scope.SMS_ANTISPAM_REJECT_METHODS_3[2].value
        };

        $scope.isNotChanged = function () {
            return false;
        };

        $scope.save = function (entry) {
            var entryItem = angular.copy(entry);

            SMSAntiSpamConfigService.createContentFiltersEntry($scope.direction, $scope.participant, entryItem).then(function (response) {
                if (response && response.value === "GENERAL_ERROR") {
                    notification({
                        type: 'danger',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: response.value,
                            errorText: response.message
                        })
                    });
                } else if (response && response.value === "TEMPORARY_RESERVED_KEYWORD" && response.message.indexOf('must be unique') > 1) {
                    $log.debug('Cannot add ao sms content filters entry: ', entryItem, ', response: ', response);

                    notification({
                        type: 'warning',
                        text: $translate.instant('Products.AntiSpamSMS.Operations.ContentFilters.Messages.EntryAlreadyDefinedError', {name: entryItem.name})
                    });
                } else if (response && response.value === "TEMPORARY_RESERVED_KEYWORD" && response.message.indexOf('cannot use') > 1) {
                    $log.debug('Cannot add ao sms content filters entry so the name temporary reserved: ', entryItem, ', response: ', response);

                    notification({
                        type: 'warning',
                        text: $translate.instant('Products.AntiSpamSMS.Operations.ContentFilters.Messages.EntryTemporaryReservedError', {name: entryItem.name})
                    });
                } else {
                    $log.debug('Added ao sms content filters entry: ', entryItem);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $state.go($scope.listState);
                }
            }, function (response) {
                $log.debug('Cannot add ao sms content filters entry: ', entryItem, ', response: ', response);
            });
        };
    });

    AntiSpamSMSOperationsContentFiltersAOSMSContentModule.controller('AntiSpamSMSOperationsContentFiltersUpdateAOSMSContentCtrl', function ($scope, $log, $controller, $state, $translate, notification, SMSAntiSpamConfigService, aoSMSContentFiltersEntry) {
        $log.debug('AntiSpamSMSOperationsContentFiltersUpdateAOSMSContentCtrl');

        $controller('AntiSpamSMSOperationsContentFiltersAOSMSContentCommonCtrl', {$scope: $scope});

        $scope.entry = aoSMSContentFiltersEntry;
        $scope.entry.id = $scope.entry.name;

        $scope.originalEntry = angular.copy($scope.entry);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalEntry, $scope.entry);
        };

        $scope.save = function (entry) {
            var entryItem = angular.copy(entry);
            delete entryItem.id;

            SMSAntiSpamConfigService.updateContentFiltersEntry($scope.direction, $scope.participant, entryItem).then(function (response) {
                $log.debug('Updated ao sms content filters entry: ', entryItem, ', response: ', response);

                if (response && response.value === "GENERAL_ERROR") {
                    notification({
                        type: 'danger',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: response.value,
                            errorText: response.message
                        })
                    });
                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $state.go($scope.listState);
                }
            }, function (response) {
                $log.debug('Cannot update ao sms content filters entry: ', entryItem, ', response: ', response);
            });
        };
    });

})();
