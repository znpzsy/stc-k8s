(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.suspiciousmessages.counters', []);

    var AntiSpamSuspiciousMessagesCountersModule = angular.module('adminportal.products.antispamsms.operations.suspiciousmessages.counters');

    AntiSpamSuspiciousMessagesCountersModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations.suspiciousmessages.counters', {
            url: "/counters",
            template: '<div ui-view></div>'
        }).state('products.antispamsms.operations.suspiciousmessages.counters.list', {
            url: "/list",
            templateUrl: "products/antispamsms/operations/suspiciousmessages/operations.suspiciousmessages.counters.html",
            controller: 'AntiSpamSuspiciousMessagesCountersCtrl',
            resolve: {
                counters: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getCountersLogAndAccept(3);
                }
            }
        }).state('products.antispamsms.operations.suspiciousmessages.counters.update', {
            url: "/update/:listType",
            templateUrl: "products/antispamsms/operations/suspiciousmessages/operations.suspiciousmessages.counters.detail.modal.html",
            controller: 'AntiSpamSuspiciousMessagesCountersUpdateCtrl',
            resolve: {
                entry: function ($stateParams, SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getFraudDetectionByType($stateParams.listType);
                }
            }
        });

    });

    AntiSpamSuspiciousMessagesCountersModule.controller('AntiSpamSuspiciousMessagesCountersCommonCtrl', function ($scope, $log) {
        $log.debug('AntiSpamSuspiciousMessagesCountersCommonCtrl');

        $scope.listState = "products.antispamsms.operations.suspiciousmessages.counters.list";
        $scope.updateState = "products.antispamsms.operations.suspiciousmessages.counters.update";

        $scope.populatedResults = false;
    });

    AntiSpamSuspiciousMessagesCountersModule.controller('AntiSpamSuspiciousMessagesCountersCtrl', function ($scope, $state, $log, $controller, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                            SMSAntiSpamConfigService, Restangular, counters) {
        $log.debug('AntiSpamSuspiciousMessagesCountersCtrl');

        $controller('AntiSpamSuspiciousMessagesCountersCommonCtrl', {$scope: $scope});

        $scope.entry = {};
        $scope.tsHeaderKey = 'Products.AntiSpamSMS.Operations.SuspiciousMessages.Counters.TroubleshootingModalTitle';
        $scope.tsFilterField = 'opContentFilter';

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'greyListConfBean.name',
                    headerKey: 'Products.AntiSpamSMS.Operations.SuspiciousMessages.TableColumns.Name'
                },
                {
                    fieldName: 'greyListType',
                    headerKey: 'Products.AntiSpamSMS.Operations.SuspiciousMessages.TableColumns.ListType'
                }
            ]
        };

        // Counters
        $scope.counters = {
            list: counters ? Restangular.stripRestangular(counters) : [],
            tableParams: {}
        };

        $scope.counters.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "created": 'asc'
            }
        }, {
            total: 0,
            $scope: $scope,
            getData: function ($defer, params) {

                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.counters.list);

                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.counters.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);

                }
                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Counters  list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.counters.tableParams.settings().$scope.filterText = filterText;
            $scope.counters.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.counters.tableParams.page(1);
            $scope.counters.tableParams.reload();
        }, 500);

        var openDetailModal = function (data) {
            return $uibModal.open({
                templateUrl: 'products/antispamsms/operations/suspiciousmessages/operations.suspiciousmessages.counters.detail.modal.html',
                controller: 'AntiSpamSuspiciousMessagesCountersUpdateCtrl',
                resolve: {
                    data: function () {
                        return data;
                    },
                    entry: function () {
                        return SMSAntiSpamConfigService.getCountersEntry(data.direction, data.participant, data.counterBean.type, data.counterBean.name);
                    }
                }
            });
        };

        $scope.updateEntry = function (data) {
            $log.debug('data: ', data);

            var modalInstance = openDetailModal(data);

            modalInstance.result.then(function (entry) {
                $scope.screenings.tableParams.reload();
                $state.go($state.$current, null, {reload: true});
            }, function () {
                // Ignored
            });
        };

    });

    AntiSpamSuspiciousMessagesCountersModule.controller('AntiSpamSuspiciousMessagesCountersUpdateCtrl', function ($scope, $state, $log, $uibModalInstance, $translate, notification, SMSAntiSpamConfigService,
                                                                                                                  SMS_ANTISPAM_COUNTER_TYPES, STATES, SMS_ANTISPAM_RANGE_POLICIES, SMS_ANTISPAM_REJECT_METHODS_3, SMS_ANTISPAM_SIMILARITY_ALGORITHMS, data, entry) {
        $log.debug('AntiSpamSuspiciousMessagesCountersUpdateCtrl');

        $scope.data = data ? data : {};
        $log.debug('entry: ', entry);
        $log.debug('data: ', data);

        $scope.COUNTER_TYPES = SMS_ANTISPAM_COUNTER_TYPES;
        $scope.STATES = STATES;
        $scope.SMS_ANTISPAM_RANGE_POLICIES = SMS_ANTISPAM_RANGE_POLICIES;
        $scope.SMS_ANTISPAM_REJECT_METHODS_3 = SMS_ANTISPAM_REJECT_METHODS_3;
        $scope.SMS_ANTISPAM_SIMILARITY_ALGORITHMS = SMS_ANTISPAM_SIMILARITY_ALGORITHMS;


        $scope.pageHeaderKey = 'Products.AntiSpamSMS.Operations.SuspiciousMessages.Counters.UpdateEntryModalTitle';

        $scope.entry = entry;
        $scope.originalEntry = angular.copy($scope.entry);

        $scope.isNotChanged = function () {
            return angular.equals($scope.originalEntry, $scope.entry);
        };

        // Save entry
        $scope.save = function (entry) {
            var entryItem = angular.copy(entry);
            entryItem.name = $scope.originalEntry.name;
            var direction = $scope.data.direction;
            var participant = $scope.data.participant;
            var type = $scope.originalEntry.type;

            SMSAntiSpamConfigService.updateCountersEntry(direction, participant, type, entryItem).then(function (response) {
                if (response && response.value) {
                    $log.debug('Cannot add counters entry: ', entryItem, ', response: ', response);
                    if (response.message && response.message.indexOf('Invalid Parameter Syntax')) {
                        notification({
                            type: 'warning',
                            text: $translate.instant('Products.AntiSpamSMS.Operations.Screenings.PDUParameter.Messages.InvalidParameterSyntaxError', {
                                screeningParameters: entryItem.checkingParameters
                            })
                        });
                    } else {
                        notification({
                            type: 'warning',
                            text: response.value
                        });
                    }
                } else {
                    $log.debug('Added counters entry: ', entryItem);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $uibModalInstance.close(entryItem);
                    $state.go($state.$current, null, {reload: true});
                }
            }, function (response) {
                $log.debug('Cannot add counters entry: ', entryItem, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
    });

})();
