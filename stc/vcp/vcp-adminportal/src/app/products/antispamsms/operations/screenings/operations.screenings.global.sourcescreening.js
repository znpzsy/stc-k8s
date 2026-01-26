(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.screenings.global.sourcescreening', []);

    var AntiSpamSMSOperationsScreeningsGlobalSourceScreeningModule = angular.module('adminportal.products.antispamsms.operations.screenings.global.sourcescreening');

    AntiSpamSMSOperationsScreeningsGlobalSourceScreeningModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations.screenings.global.sourcescreening', {
            url: "/sourcescreening",
            templateUrl: 'products/antispamsms/operations/screenings/operations.screenings.global.sourcescreening.container.html',
            controller: 'AntiSpamSMSOperationsScreeningsGlobalSourceScreeningCommonCtrl'
        }).state('products.antispamsms.operations.screenings.global.sourcescreening.configuration', {
            url: "/configuration",
            templateUrl: "products/antispamsms/operations/screenings/operations.screenings.global.sourcescreening.html",
            controller: "AntiSpamSMSOperationsScreeningsGlobalSourceScreeningConfigurationCtrl",
            data: {
                permissions: [
                    'READ_ANTISPAM_SCREENINGLISTS_OPERATIONS'
                ]
            },
            resolve: {
                globalSourceScreeningConf: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getGlobalSourceScreening();
                }
            }
        }).state('products.antispamsms.operations.screenings.global.sourcescreening.msisdnrange', {
            url: "/msisdnRange",
            templateUrl: "products/antispamsms/operations/screenings/operations.screenings.global.sourcescreening.range.html",
            controller: "AntiSpamSMSOperationsScreeningsGlobalSourceScreeningRangeCtrl",
            data: {
                permissions: [
                    'READ_ANTISPAM_SCREENINGLISTS_OPERATIONS'
                ]
            },
            resolve: {
                addressRangeList: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getGlobalSourceScreeningMsisdnRange();
                },
                rangeType: function () {
                    return "msisdn";
                }
            }
        }).state('products.antispamsms.operations.screenings.global.sourcescreening.mcarange', {
            url: "/mcarange",
            templateUrl: "products/antispamsms/operations/screenings/operations.screenings.global.sourcescreening.range.html",
            controller: "AntiSpamSMSOperationsScreeningsGlobalSourceScreeningRangeCtrl",
            data: {
                permissions: [
                    'READ_ANTISPAM_SCREENINGLISTS_OPERATIONS'
                ]
            },
            resolve: {
                addressRangeList: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getGlobalSourceScreeningMscRange();
                },
                rangeType: function () {
                    return "msc";
                }
            }
        });
        // Add state configuration

    });

    AntiSpamSMSOperationsScreeningsGlobalSourceScreeningModule.controller('AntiSpamSMSOperationsScreeningsGlobalSourceScreeningCommonCtrl', function ($scope, $state, $log, $uibModal, $filter, $translate, notification, SMSAntiSpamConfigService) {
        $log.debug('AntiSpamSMSOperationsScreeningsGlobalSourceScreeningCommonCtrl');
        $scope.onTabSelected = function (state) {
            $state.go(state);
        };

        $scope.$on('$stateChangeSuccess', function () {
            switch ($state.current.name) {
                case 'products.antispamsms.operations.screenings.global.sourcescreening.configuration':
                    $scope.activeTab = 0;
                    break;
                case 'products.antispamsms.operations.screenings.global.sourcescreening.mcarange':
                    $scope.activeTab = 1;
                    break;
                case 'products.antispamsms.operations.screenings.global.sourcescreening.msisdnrange':
                    $scope.activeTab = 2;
                    break;
            }
        });

    });


    AntiSpamSMSOperationsScreeningsGlobalSourceScreeningModule.controller('AntiSpamSMSOperationsScreeningsGlobalSourceScreeningConfigurationCtrl', function ($scope, $state, $log, $uibModal, $filter, $translate, notification, SMSAntiSpamConfigService,
                                                                                                                                                SMS_ANTISPAM_GLOBAL_SOURCE_MSC_SCREENING_TYPE, SMS_ANTISPAM_GLOBAL_SOURCE_MSISDN_SCREENING_TYPE,
                                                                                                                                                SMS_ANTISPAM_GLOBAL_SOURCE_REJECT_CODE, SMS_ANTISPAM_REJECT_METHODS_2, globalSourceScreeningConf) {
        $log.debug('AntiSpamSMSOperationsScreeningsGlobalSourceScreeningConfigurationCtrl');

        $scope.globalSourceScreeningConf = globalSourceScreeningConf || {};
        $scope.globalSourceScreeningConfOriginal = angular.copy($scope.globalSourceScreeningConf);

        $scope.SMS_ANTISPAM_REJECT_METHODS_2 = SMS_ANTISPAM_REJECT_METHODS_2;
        $scope.SMS_ANTISPAM_GLOBAL_SOURCE_MSC_SCREENING_TYPE = SMS_ANTISPAM_GLOBAL_SOURCE_MSC_SCREENING_TYPE;
        $scope.SMS_ANTISPAM_GLOBAL_SOURCE_MSISDN_SCREENING_TYPE = SMS_ANTISPAM_GLOBAL_SOURCE_MSISDN_SCREENING_TYPE;
        $scope.SMS_ANTISPAM_GLOBAL_SOURCE_REJECT_CODE = SMS_ANTISPAM_GLOBAL_SOURCE_REJECT_CODE;

        $scope.isNotChanged = function () {
            return angular.equals($scope.globalSourceScreeningConf, $scope.globalSourceScreeningConfOriginal);
        }
        
        $scope.save = function (entry){
            SMSAntiSpamConfigService.updateGlobalSourceScreening(entry).then(function (result) {
                if (result && result.value) {
                    $log.debug('Cannot update global source screening configuration: ', entry, ', result: ', result);

                    notification({
                        type: 'warning',
                        text: result.value
                    });
                } else {
                    $log.debug('Updated global source screening configuration: ', entry);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                    $state.go($state.$current, null, {reload: true});
                }
            },function (response) {

                $log.debug('Cannot update global source screening configuration: ', response);
                
            });
        }
    });

    AntiSpamSMSOperationsScreeningsGlobalSourceScreeningModule.controller('AntiSpamSMSOperationsScreeningsGlobalSourceScreeningRangeCtrl', function ($scope, $log, $filter, $uibModal, $translate, notification,
                                                                                                                                                          NgTableParams, NgTableService, SMSAntiSpamConfigService,
                                                                                                                                                          addressRangeList, rangeType) {
        $log.debug('AntiSpamSMSOperationsScreeningsGlobalSourceScreeningRangeCtrl');

        var RANGE_FIELD_MAP = {
            msisdn: { start: 'msisdnRangeStart', end: 'msisdnRangeEnd' },
            msc:    { start: 'mscRangeStart',    end: 'mscRangeEnd' }
        }

        var normalizeRanges = function (apiList, rangeType) {
            var map = RANGE_FIELD_MAP[rangeType];
            if (!map) {
                return [];
            }
            return _.map(apiList, function (item) {
                return {
                    start: item[map.start],
                    end: item[map.end]
                };
            });

        }

        var denormalizeRange = function (item) {
            var rangeType = $scope.rangeType;
            var map = RANGE_FIELD_MAP[rangeType];
            if (!map) { return {}; }

            var payloadItem = {};
            payloadItem[map.start] = String(item.start);
            payloadItem[map.end] = String(item.end);
            return payloadItem;
        }

        $scope.rangeType = (rangeType || '').toLowerCase();
        $scope.rangeList = normalizeRanges(addressRangeList, $scope.rangeType);

        $scope.newAddressRange = {};

        // Address range list
        $scope.addressRangeList = {
            list: $scope.rangeList,
            tableParams: {}
        };

        $scope.addressRangeList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "start": 'asc'
            }
        }, {
            total: $scope.addressRangeList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.addressRangeList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.addressRangeList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Address range list

        var tableScope = $scope.addressRangeList.tableParams.settings().$scope;

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            tableScope.filterText = filterText;
            tableScope.filterColumns = filterColumns;
            $scope.addressRangeList.tableParams.page(1);
            $scope.addressRangeList.tableParams.reload();
        }, 750);

        // Combined validation function
        function validateAddressRange() {
            var form = tableScope.rangeForm;
            if (!form || !tableScope.newAddressRange) return;

            var start = String(tableScope.newAddressRange.start || '');
            var end   = String(tableScope.newAddressRange.end || '');

            if (!start || !end) return;

            // check for exact duplicate
            var foundItem = _.find($scope.addressRangeList.list, function (item) {
                return item.start === start && item.end === end;
            });
            var isAvailable = _.isUndefined(foundItem);

            // range order - start should be smaller than end
            var startNum = Number(start);
            var endNum = Number(end);
            // If one of the values is not a number, we cannot validate the order, so we consider it valid
            var isValidOrder = (!isNaN(startNum) && !isNaN(endNum) && startNum <= endNum) || (isNaN(startNum) || isNaN(endNum));


            form.start.$setValidity('availabilityCheck', isAvailable);
            form.start.$setValidity('rangeOrder', isValidOrder);

            form.end.$setValidity('availabilityCheck', isAvailable);
            form.end.$setValidity('rangeOrder', isValidOrder);
        }

        // Watch both fields with combined validation
        tableScope.$watch('newAddressRange.start', validateAddressRange);
        tableScope.$watch('newAddressRange.end', validateAddressRange);


        var addNewPromise = function (addressRange) {

            var payload = denormalizeRange(addressRange);
            if ($scope.rangeType === 'msc')
                return SMSAntiSpamConfigService.createGlobalSourceScreeningMscRange(payload);
            else
                return SMSAntiSpamConfigService.createGlobalSourceScreeningMsisdnRange(payload);
        };

        var deletePromise = function (addressRange) {

            var payload = denormalizeRange(addressRange);
            if ($scope.rangeType === 'msc')
                return SMSAntiSpamConfigService.deleteGlobalSourceScreeningMscRange(payload);
            else
                return SMSAntiSpamConfigService.deleteGlobalSourceScreeningMsisdnRange(payload);
        };

        // Add address range
        $scope.addNewAddressRange = function (newAddressRange) {
            var listItem = angular.copy(newAddressRange);
            $log.debug('Trying to add range list entry range: ', newAddressRange, ', listItem: ', listItem);

            addNewPromise(listItem).then(function (response) {
                if (response && response.value) {
                    $log.debug('Cannot add range list entry range: ', listItem, ', response: ', response);

                    notification({
                        type: 'warning',
                        text: response.value
                    });
                } else {
                    $log.debug('Added range list entry range: ', listItem, ', response: ', response);

                    $scope.addressRangeList.list.push(listItem);
                    $scope.addressRangeList.tableParams.reload();

                    tableScope.rangeForm.$setPristine();
                    tableScope.newAddressRange.start = '';
                    tableScope.newAddressRange.end = '';
                }
            }, function (response) {
                $log.debug('Cannot add range list entry range: ', listItem, ', response: ', response);
            });
        };

        // Remove address range
        $scope.removeAddressRange = function (addressRangeItem) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing range list entry range: ', addressRangeItem);

                deletePromise(addressRangeItem).then(function (response) {
                    if (response && response.value) {
                        $log.debug('Cannot add range list entry range: ', addressRangeItem, ', response: ', response);

                        notification({
                            type: 'warning',
                            text: response.value
                        });
                    } else {
                        $log.debug('Deleted range list entry range: ', addressRangeItem, ', response: ', response);

                        var deletedListItem = _.findWhere($scope.addressRangeList.list, {
                            start: addressRangeItem.start,
                            end: addressRangeItem.end
                        });
                        $scope.addressRangeList.list = _.without($scope.addressRangeList.list, deletedListItem);

                        $scope.addressRangeList.tableParams.reload();

                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });
                    }
                }, function (response) {
                    $log.debug('Cannot delete range list entry range: ', addressRangeItem, ', response: ', response);
                });
            });
        };


    });

})();
