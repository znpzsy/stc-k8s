(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.suspiciousmessages.screenings', []);

    var AntiSuspiciousMessagesScreeningsModule = angular.module('adminportal.products.antispamsms.operations.suspiciousmessages.screenings');

    AntiSuspiciousMessagesScreeningsModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations.suspiciousmessages.screenings', {
            url: "/screenings",
            template: '<div ui-view></div>'
        }).state('products.antispamsms.operations.suspiciousmessages.screenings.list', {
            url: "/list",
            templateUrl: "products/antispamsms/operations/suspiciousmessages/operations.suspiciousmessages.screenings.html",
            controller: 'AntiSpamSuspiciousMessagesScreeningsCtrl',
            resolve: {
                screenings: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getScreeningsLogAndAccept(3);
                }
            }
        }).state('products.antispamsms.operations.suspiciousmessages.screenings.update', {
            url: "/update/:listType",
            templateUrl: "products/antispamsms/operations/suspiciousmessages/operations.suspiciousmessages.screenings.detail.modal.html",
            controller: 'AntiSpamSuspiciousMessagesScreeningsUpdateCtrl',
            resolve: {
                entry: function ($stateParams, SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getFraudDetectionByType($stateParams.listType);
                }
            }
        });

    });

    AntiSuspiciousMessagesScreeningsModule.controller('AntiSpamSuspiciousMessagesScreeningsCommonCtrl', function ($scope, $log) {
        $log.debug('AntiSpamSuspiciousMessagesScreeningsCommonCtrl');

        $scope.listState = "products.antispamsms.operations.suspiciousmessages.screenings.list";
        $scope.updateState = "products.antispamsms.operations.suspiciousmessages.screenings.update";

        $scope.populatedResults = false;
    });

    AntiSuspiciousMessagesScreeningsModule.controller('AntiSpamSuspiciousMessagesScreeningsCtrl', function ($scope, $state, $log, $controller, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                            SMSAntiSpamConfigService, Restangular, screenings) {
        $log.debug('AntiSpamSuspiciousMessagesScreeningsCtrl');
        $log.debug('screenings: ', screenings);

        $controller('AntiSpamSuspiciousMessagesScreeningsCommonCtrl', {$scope: $scope});

        $scope.entry = {};
        $scope.tsHeaderKey = 'Products.AntiSpamSMS.Operations.SuspiciousMessages.Screenings.TroubleshootingModalTitle';
        $scope.tsFilterField = 'opScreeningName';

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'name',
                    headerKey: 'Products.AntiSpamSMS.Operations.SuspiciousMessages.TableColumns.Name'
                },
                {
                    fieldName: 'screeningParameters',
                    headerKey: 'Products.AntiSpamSMS.Operations.SuspiciousMessages.TableColumns.ScreeningParameters'
                }
            ]
        };

        // FraudDetection
        $scope.screenings = {
            list: screenings ? Restangular.stripRestangular(screenings).allScreenings : [],
            tableParams: {}
        };

        $scope.screenings.tableParams = new NgTableParams({
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
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.screenings.list);

                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.screenings.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);

                }
                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - FraudDetection  list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.screenings.tableParams.settings().$scope.filterText = filterText;
            $scope.screenings.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.screenings.tableParams.page(1);
            $scope.screenings.tableParams.reload();
        }, 500);

        var openDetailModal = function (data) {
            return $uibModal.open({
                templateUrl: 'products/antispamsms/operations/suspiciousmessages/operations.suspiciousmessages.screenings.detail.modal.html',
                controller: 'AntiSpamSuspiciousMessagesScreeningsUpdateCtrl',
                resolve: {
                    data: function () {
                        return data;
                    },
                    entry: function () {
                        return SMSAntiSpamConfigService.getParameterFilteringListEntry(data.name);
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

    AntiSuspiciousMessagesScreeningsModule.controller('AntiSpamSuspiciousMessagesScreeningsUpdateCtrl', function ($scope, $state, $log, $uibModalInstance, $translate, notification, SMSAntiSpamConfigService,
                                                                                                                  SMS_ANTISPAM_REJECT_METHODS_2, SMS_ANTISPAM_REJECTION_ERROR_CODES, SMS_ANTISPAM_ACTIONS, data, entry) {
        $log.debug('AntiSpamSuspiciousMessagesScreeningsUpdateCtrl');

        $scope.data = data ? data : {};
        $log.debug('entry: ', entry);
        $log.debug('data: ', data);

        // $scope.SMS_ANTISPAM_REJECT_METHODS_3 = SMS_ANTISPAM_REJECT_METHODS_3;
        $scope.SMS_ANTISPAM_REJECT_METHODS_2 = SMS_ANTISPAM_REJECT_METHODS_2;
        $scope.SMS_ANTISPAM_REJECTION_ERROR_CODES = SMS_ANTISPAM_REJECTION_ERROR_CODES;
        $scope.SMS_ANTISPAM_ACTIONS = SMS_ANTISPAM_ACTIONS;


        $scope.pageHeaderKey = 'Products.AntiSpamSMS.Operations.SuspiciousMessages.Screenings.UpdateEntryModalTitle';

        $scope.entry = entry;

        $scope.originalEntry = angular.copy($scope.entry);

        $scope.isNotChanged = function () {
            return angular.equals($scope.originalEntry, $scope.entry);
        };

        // Save entry
        $scope.save = function (entry) {
            var entryItem = angular.copy(entry);
            entryItem.name = $scope.originalEntry.name;
            delete entryItem.id;

            SMSAntiSpamConfigService.updateParameterFilteringListEntry(entryItem.name, entryItem).then(function (response) {
                if (response && response.value) {
                    $log.debug('Cannot add screening entry: ', entryItem, ', response: ', response);

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
                    $log.debug('Added screening entry: ', entryItem);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $uibModalInstance.close(entryItem);
                }
            }, function (response) {
                $log.debug('Cannot add screening entry: ', entryItem, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
    });

})();
