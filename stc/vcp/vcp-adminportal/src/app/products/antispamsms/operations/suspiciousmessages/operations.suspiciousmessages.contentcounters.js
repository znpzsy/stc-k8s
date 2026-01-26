(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.suspiciousmessages.contentcounters', []);

    var AntiSpamSuspiciousMessagesContentCountersModule = angular.module('adminportal.products.antispamsms.operations.suspiciousmessages.contentcounters');

    AntiSpamSuspiciousMessagesContentCountersModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations.suspiciousmessages.contentcounters', {
            url: "/contentcounters",
            template: '<div ui-view></div>'
        }).state('products.antispamsms.operations.suspiciousmessages.contentcounters.list', {
            url: "/list",
            templateUrl: "products/antispamsms/operations/suspiciousmessages/operations.suspiciousmessages.contentcounters.html",
            controller: 'AntiSpamSuspiciousMessagesContentCountersCtrl',
            resolve: {
                contentcounters: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getContentCountersLogAndAccept(3);
                }
            }
        }).state('products.antispamsms.operations.suspiciousmessages.contentcounters.update', {
            url: "/update/:parentName/:name",
            templateUrl: "products/antispamsms/operations/suspiciousmessages/operations.suspiciousmessages.contentcounters.detail.modal.html",
            controller: 'AntiSpamSuspiciousMessagesContentCountersUpdateCtrl',
            resolve: {
                entry: function ($stateParams, SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getContentCountersEntry($stateParams.parentName, $stateParams.name);
                }
            }
        });

    });

    AntiSpamSuspiciousMessagesContentCountersModule.controller('AntiSpamSuspiciousMessagesContentCountersCommonCtrl', function ($scope, $log) {
        $log.debug('AntiSpamSuspiciousMessagesContentCountersCommonCtrl');

        $scope.listState = "products.antispamsms.operations.suspiciousmessages.contentcounters.list";
        $scope.updateState = "products.antispamsms.operations.suspiciousmessages.contentcounters.update";

        $scope.populatedResults = false;
    });

    AntiSpamSuspiciousMessagesContentCountersModule.controller('AntiSpamSuspiciousMessagesContentCountersCtrl', function ($scope, $state, $log, $controller, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                          SMSAntiSpamConfigService, Restangular, contentcounters) {
        $log.debug('AntiSpamSuspiciousMessagesContentCountersCtrl');

        $controller('AntiSpamSuspiciousMessagesContentCountersCommonCtrl', {$scope: $scope});

        $scope.entry = {};
        $scope.tsHeaderKey = 'Products.AntiSpamSMS.Operations.SuspiciousMessages.ContentCounters.TroubleshootingModalTitle';
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

        // ContentCounters
        $scope.contentcounters = {
            list: contentcounters ? Restangular.stripRestangular(contentcounters).counters : [],
            tableParams: {}
        };

        $scope.contentcounters.tableParams = new NgTableParams({
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
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.contentcounters.list);

                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.contentcounters.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);

                }
                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - ContentCounters  list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.contentcounters.tableParams.settings().$scope.filterText = filterText;
            $scope.contentcounters.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.contentcounters.tableParams.page(1);
            $scope.contentcounters.tableParams.reload();
        }, 500);

        var openDetailModal = function (data) {
            return $uibModal.open({
                templateUrl: 'products/antispamsms/operations/suspiciousmessages/operations.suspiciousmessages.contentcounters.detail.modal.html',
                controller: 'AntiSpamSuspiciousMessagesContentCountersUpdateCtrl',
                resolve: {
                    data: function () {
                        return data;
                    },
                    entry: function () {
                        return SMSAntiSpamConfigService.getContentCountersEntry(data.parentName, data.name);
                    }
                }
            });
        };

        $scope.updateEntry = function (data) {
            $log.debug('data: ', data);

            var modalInstance = openDetailModal(data);

            modalInstance.result.then(function (entry) {
                $scope.contentcounters.tableParams.reload();
            }, function () {
                // Ignored
            });
        };

    });

    AntiSpamSuspiciousMessagesContentCountersModule.controller('AntiSpamSuspiciousMessagesContentCountersUpdateCtrl', function ($scope, $state, $log, $uibModalInstance, $translate, notification, SMSAntiSpamConfigService,
                                                                                                                                STATES, SMS_ANTISPAM_RANGE_POLICIES, SMS_ANTISPAM_REJECT_METHODS_3, SMS_ANTISPAM_CONTENT_COUNTER_EVALUATION_TYPES,
                                                                                                                                SMS_ANTISPAM_CONTENT_COUNTER_SIMILARITY_ALGORITHMS, SMS_ANTISPAM_CASE_SENSITIVITY,
                                                                                                                                SMS_ANTISPAM_CONTENT_COUNTER_FLOWS, SMS_ANTISPAM_CONTENT_COUNTER_REJECT_CODES, data, entry) {
        $log.debug('AntiSpamSuspiciousMessagesContentCountersUpdateCtrl');

        $scope.data = data ? data : {};

        $scope.STATES = STATES;
        $scope.SMS_ANTISPAM_RANGE_POLICIES = SMS_ANTISPAM_RANGE_POLICIES;
        $scope.SMS_ANTISPAM_REJECT_METHODS_3 = SMS_ANTISPAM_REJECT_METHODS_3;
        // Content counters 'contentFilterType' field accepts different values than content filters 'contentFilterType' field.
        $scope.SMS_ANTISPAM_CONTENT_COUNTER_EVALUATION_TYPES = SMS_ANTISPAM_CONTENT_COUNTER_EVALUATION_TYPES;
        $scope.SMS_ANTISPAM_CONTENT_COUNTER_SIMILARITY_ALGORITHMS = SMS_ANTISPAM_CONTENT_COUNTER_SIMILARITY_ALGORITHMS;
        $scope.SMS_ANTISPAM_CASE_SENSITIVITY = SMS_ANTISPAM_CASE_SENSITIVITY;
        $scope.SMS_ANTISPAM_CONTENT_COUNTER_REJECT_CODES = SMS_ANTISPAM_CONTENT_COUNTER_REJECT_CODES;
        $scope.SMS_ANTISPAM_CONTENT_COUNTER_FLOWS = SMS_ANTISPAM_CONTENT_COUNTER_FLOWS;

        $scope.pageHeaderKey = 'Products.AntiSpamSMS.Operations.SuspiciousMessages.ContentCounters.UpdateEntryModalTitle';

        $scope.entry = entry;
        $scope.originalEntry = angular.copy($scope.entry);

        $scope.isNotChanged = function () {
            return angular.equals($scope.originalEntry, $scope.entry);
        };

        // Save entry
        $scope.save = function (entry) {
            var entryItem = angular.copy(entry);
            entryItem.name = $scope.originalEntry.name;

            SMSAntiSpamConfigService.updateContentCountersEntry($scope.data.parentName, entryItem).then(function (response) {
                if (response && response.value) {
                    $log.debug('Cannot update fraud detection entry: ', entryItem, ', response: ', response);

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
                    $log.debug('Updated content counter entry: ', entryItem);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $uibModalInstance.close(entryItem);
                    $state.reload();
                }
            }, function (response) {
                $log.debug('Cannot add fraud detection entry: ', entryItem, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
    });

})();
