(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.suspiciousmessages.frauddetection', []);

    var AntiSuspiciousMessagesFraudDetectionModule = angular.module('adminportal.products.antispamsms.operations.suspiciousmessages.frauddetection');

    AntiSuspiciousMessagesFraudDetectionModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations.suspiciousmessages.frauddetection', {
            url: "/frauddetection",
            template: '<div ui-view></div>'
        }).state('products.antispamsms.operations.suspiciousmessages.frauddetection.list', {
            url: "/list",
            templateUrl: "products/antispamsms/operations/suspiciousmessages/operations.suspiciousmessages.frauddetection.html",
            controller: 'AntiSpamSuspiciousMessagesFraudDetectionCtrl',
            resolve: {
                frauddetection: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getFraudDetectionLogAndAccept(3);
                },
                localIncomingConf: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getLocalIncomingMOFilteringConfiguration();
                }
            }
        });

    });

    AntiSuspiciousMessagesFraudDetectionModule.controller('AntiSpamSuspiciousMessagesFraudDetectionCommonCtrl', function ($scope, $log) {
        $log.debug('AntiSpamSuspiciousMessagesFraudDetectionCommonCtrl');

        $scope.populatedResults = false;
    });

    AntiSuspiciousMessagesFraudDetectionModule.controller('AntiSpamSuspiciousMessagesFraudDetectionCtrl', function ($scope, $state, $log, $controller, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                            SMSAntiSpamConfigService, Restangular, frauddetection, localIncomingConf) {
        $log.debug('AntiSpamSuspiciousMessagesFraudDetectionCtrl');

        // Prepare combined list - fraud detection and screening conf records
        var combinedlist = [];
        _.each(frauddetection, function (record) {
            var item = {
                "name": record.greyListConfBean.name,
                "rejectCode": record.greyListConfBean.rejectCode,
                "rejectMethod": record.greyListConfBean.rejectMethod,
                "checkingParameters": record.greyListConfBean.checkingParameters,
                "status": record.greyListConfBean.status,
                "listType": record.greyListType,
                "type": "frauddetection"
            };
            combinedlist.push(item);
        });

        if(localIncomingConf && localIncomingConf.rejectMethod === "LOG_AND_ACCEPT"){

            var item = {
                "name": localIncomingConf.name,
                "rejectCode": localIncomingConf.rejectCode,
                "rejectMethod": localIncomingConf.rejectMethod,
                "status": localIncomingConf.enableMscBasedScreening,
                "listType": localIncomingConf.mscScreeningType,
                "type": "screening"
            };
            combinedlist.push(item);
        }

        $controller('AntiSpamSuspiciousMessagesFraudDetectionCommonCtrl', {$scope: $scope});

        $scope.entry = {};
        $scope.tsHeaderKey = 'Products.AntiSpamSMS.Operations.SuspiciousMessages.FraudDetection.TroubleshootingModalTitle';
        $scope.tsFilterField = 'opContentFilter';

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'name',
                    headerKey: 'Products.AntiSpamSMS.Operations.SuspiciousMessages.TableColumns.Name'
                },
                {
                    fieldName: 'listType',
                    headerKey: 'Products.AntiSpamSMS.Operations.SuspiciousMessages.TableColumns.ListType'
                }
            ]
        };

        // FraudDetection
        $scope.frauddetection = {
            list: combinedlist ? combinedlist : [],
            tableParams: {}
        };

        $scope.frauddetection.tableParams = new NgTableParams({
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
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.frauddetection.list);

                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.frauddetection.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);

                }
                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - FraudDetection  list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.frauddetection.tableParams.settings().$scope.filterText = filterText;
            $scope.frauddetection.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.frauddetection.tableParams.page(1);
            $scope.frauddetection.tableParams.reload();
        }, 500);

        var openDetailModal = function (data) {
            return $uibModal.open({
                templateUrl: 'products/antispamsms/operations/suspiciousmessages/operations.suspiciousmessages.frauddetection.detail.modal.html',
                controller: 'AntiSpamSuspiciousMessagesFraudDetectionUpdateCtrl',
                resolve: {
                    data: function () {
                        return data;
                    },
                    entry: function () {
                        if(data.type === 'screening'){
                            return data;
                        } else {
                            return SMSAntiSpamConfigService.getFraudDetectionByType(data.listType);
                        }
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

    AntiSuspiciousMessagesFraudDetectionModule.controller('AntiSpamSuspiciousMessagesFraudDetectionUpdateCtrl', function ($scope, $log, $uibModalInstance, $translate, notification, SMSAntiSpamConfigService,
                                                                                                                        SMS_ANTISPAM_REJECT_METHODS_2, SMS_ANTISPAM_REJECTION_ERROR_CODES, SMS_ANTISPAM_CHECKING_PARAMETERS, data, entry) {
        $log.debug('AntiSpamSuspiciousMessagesFraudDetectionUpdateCtrl');

        $scope.data = data ? data : {};
        $log.debug('entry: ', entry);
        $log.debug('data: ', data);
        //$scope.SMS_ANTISPAM_REJECT_METHODS_3 = SMS_ANTISPAM_REJECT_METHODS_3;
        $scope.SMS_ANTISPAM_REJECT_METHODS_2 = SMS_ANTISPAM_REJECT_METHODS_2;
        $scope.SMS_ANTISPAM_REJECTION_ERROR_CODES = SMS_ANTISPAM_REJECTION_ERROR_CODES;
        $scope.SMS_ANTISPAM_CHECKING_PARAMETERS = SMS_ANTISPAM_CHECKING_PARAMETERS;


        $scope.pageHeaderKey = 'Products.AntiSpamSMS.Operations.SuspiciousMessages.FraudDetection.UpdateEntryModalTitle';

        $scope.entry = entry;

        $scope.originalEntry = angular.copy($scope.entry);

        $scope.isNotChanged = function () {
            return angular.equals($scope.originalEntry, $scope.entry);
        };

        var promise = function (entryItem) {
            if (entryItem.type == 'screening') {
                var item = {
                    name: entryItem.name,
                    enableMscBasedScreening: entryItem.status,
                    mscScreeningType: entryItem.listType,
                    rejectCode: entryItem.rejectCode,
                    rejectMethod: entryItem.rejectMethod
                };
                return SMSAntiSpamConfigService.updateLocalIncomingMOFilteringConfiguration(item);
            }
            else {
                return SMSAntiSpamConfigService.updateFraudDetectionByType($scope.data.listType, entryItem);
            }
        };

        // Save entry
        $scope.save = function (entry) {
            var entryItem = angular.copy(entry);
            entryItem.name = $scope.originalEntry.name;

            promise(entryItem).then(function (response) {
                if (response && response.value) {
                    $log.debug('Cannot add fraud detection entry: ', entryItem, ', response: ', response);

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
                    $log.debug('Added fraud detection entry: ', entryItem);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $uibModalInstance.close(entryItem);
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
