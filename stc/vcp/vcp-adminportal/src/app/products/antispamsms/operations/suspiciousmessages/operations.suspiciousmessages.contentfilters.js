(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.suspiciousmessages.contentfilters', []);

    var AntiSpamSuspiciousMessagesContentFiltersModule = angular.module('adminportal.products.antispamsms.operations.suspiciousmessages.contentfilters');

    AntiSpamSuspiciousMessagesContentFiltersModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations.suspiciousmessages.contentfilters', {
            url: "/contentfilters",
            template: '<div ui-view></div>'
        }).state('products.antispamsms.operations.suspiciousmessages.contentfilters.list', {
            url: "/list",
            templateUrl: "products/antispamsms/operations/suspiciousmessages/operations.suspiciousmessages.contentfilters.html",
            controller: 'AntiSpamSuspiciousMessagesContentFiltersCtrl',
            resolve: {
                contentfilters: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getContentFiltersLogAndAccept(3);
                }
            }
        });

    });

    AntiSpamSuspiciousMessagesContentFiltersModule.controller('AntiSpamSuspiciousMessagesContentFiltersCommonCtrl', function ($scope, $log) {
        $log.debug('AntiSpamSuspiciousMessagesContentFiltersCommonCtrl');

        $scope.listState = "products.antispamsms.operations.suspiciousmessages.contentfilters.list";
        $scope.updateState = "products.antispamsms.operations.suspiciousmessages.contentfilters.update";

        $scope.populatedResults = false;
    });

    AntiSpamSuspiciousMessagesContentFiltersModule.controller('AntiSpamSuspiciousMessagesContentFiltersCtrl', function ($scope, $state, $log, $controller, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                            SMSAntiSpamConfigService, Restangular, contentfilters) {
        $log.debug('AntiSpamSuspiciousMessagesContentFiltersCtrl');
        $log.debug('contentfilters: ', contentfilters);

        $controller('AntiSpamSuspiciousMessagesContentFiltersCommonCtrl', {$scope: $scope});
        $scope.tsHeaderKey = 'Products.AntiSpamSMS.Operations.SuspiciousMessages.ContentFilters.TroubleshootingModalTitle';
        $scope.tsFilterField = 'opContentFilter';

        $scope.entry = {};

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

        // FraudDetection
        $scope.contentfilters = {
            list: contentfilters ? Restangular.stripRestangular(contentfilters) : [],
            tableParams: {}
        };

        $scope.contentfilters.tableParams = new NgTableParams({
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
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.contentfilters.list);

                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.contentfilters.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);

                }
                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - FraudDetection  list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.contentfilters.tableParams.settings().$scope.filterText = filterText;
            $scope.contentfilters.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.contentfilters.tableParams.page(1);
            $scope.contentfilters.tableParams.reload();
        }, 500);

        var openDetailModal = function (data) {
            return $uibModal.open({
                templateUrl: 'products/antispamsms/operations/suspiciousmessages/operations.suspiciousmessages.contentfilters.detail.modal.html',
                controller: 'AntiSpamSuspiciousMessagesContentFiltersUpdateCtrl',
                resolve: {
                    data: function () {
                        return data;
                    },
                    entry: function () {
                        return SMSAntiSpamConfigService.getContentFiltersEntry(data.direction, data.participant, data.contentFilterBean.name);
                    }
                }
            });
        };

        $scope.updateEntry = function (data) {
            $log.debug('data: ', data);

            var modalInstance = openDetailModal(data);

            modalInstance.result.then(function (entry) {
                $scope.screenings.contentfilters.reload();
            }, function () {
                // Ignored
            });
        };

    });

    AntiSpamSuspiciousMessagesContentFiltersModule.controller('AntiSpamSuspiciousMessagesContentFiltersUpdateCtrl', function ($scope, $state, $log, $uibModalInstance, $translate, notification, SMSAntiSpamConfigService,
                                                                                                                              STATES, SMS_ANTISPAM_RANGE_POLICIES, SMS_ANTISPAM_EVALUATION_TYPES, SMS_ANTISPAM_CASE_SENSITIVITY,
                                                                                                                              SMS_ANTISPAM_REJECT_METHODS_3, SMS_ANTISPAM_FILTERS_SIMILARITY_TYPES, data, entry) {
        $log.debug('AntiSpamSuspiciousMessagesContentFiltersUpdateCtrl');

        $scope.data = data ? data : {};
        $log.debug('entry: ', entry);
        $log.debug('data: ', data);

        $scope.STATES = STATES;
        $scope.SMS_ANTISPAM_RANGE_POLICIES = SMS_ANTISPAM_RANGE_POLICIES;
        $scope.SMS_ANTISPAM_EVALUATION_TYPES = SMS_ANTISPAM_EVALUATION_TYPES;
        $scope.SMS_ANTISPAM_CASE_SENSITIVITY = SMS_ANTISPAM_CASE_SENSITIVITY;
        $scope.SMS_ANTISPAM_REJECT_METHODS_3 = SMS_ANTISPAM_REJECT_METHODS_3;
        $scope.SMS_ANTISPAM_FILTERS_SIMILARITY_TYPES = SMS_ANTISPAM_FILTERS_SIMILARITY_TYPES;


        $scope.pageHeaderKey = 'Products.AntiSpamSMS.Operations.SuspiciousMessages.ContentFilters.UpdateEntryModalTitle';

        $scope.entry = entry;
        $scope.originalEntry = angular.copy($scope.entry);

        $scope.isNotChanged = function () {
            return angular.equals($scope.originalEntry, $scope.entry);
        };

        // Save entry
        $scope.save = function (entry) {
            var entryItem = angular.copy(entry);
            entryItem.name = $scope.originalEntry.name;

            SMSAntiSpamConfigService.updateContentFiltersEntry($scope.data.direction, $scope.data.participant, entryItem).then(function (response) {
                $log.debug('Updated mt sms content filters entry: ', entryItem, ', response: ', response);

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

                    $uibModalInstance.close(entryItem);
                    $state.reload();
                }
            }, function (response) {
                $log.debug('Cannot update content filters entry: ', entryItem, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
    });

})();
