(function () {

    'use strict';

    angular.module('ccportal.subscriber-info.preferences.subscriberdobsettings', []);

    var SIPreferencesSubscriberDOBSettingsModule = angular.module('ccportal.subscriber-info.preferences.subscriberdobsettings');

    SIPreferencesSubscriberDOBSettingsModule.config(function ($stateProvider) {

        $stateProvider.state('subscriber-info.preferences.subscriberdobsettings', {
            url: "/dcb-settings",
            templateUrl: 'subscriber-info/preferences/preferences.dobsettings.html',
            controller: 'SIPreferencesSubscriberDOBSettingsCtrl',
            data: {
                doNotQuerySubscriberAtStateChange: true
            },
            resolve: {
                subscriber: function (UtilService, SSMSubscribersService) {
                    var msisdn = UtilService.getSubscriberMsisdn();

                    return SSMSubscribersService.getSubscriberByMsisdn(msisdn);
                },
                limit: function (DCBConfigService) {
                    return DCBConfigService.getLimit();
                }
            }
        });

    });

    SIPreferencesSubscriberDOBSettingsModule.controller('SIPreferencesSubscriberDOBSettingsCtrl', function ($scope, $log, $state, $filter, $uibModal, $translate, notification, NgTableParams, NgTableService,
                                                                                                            UtilService, DateTimeConstants, SSMSubscribersService, subscriber, limit) {
        $log.debug('SIPreferencesSubscriberDOBSettingsCtrl');

        $scope.subscriber = subscriber;

        // Set the the default limit.
        $scope.dobChargingDefaultLimit = limit ? limit.dobChargingDefaultLimit : undefined;
        $scope.useDefaultLimit = false;

        var expenseResetTimeAttr = _.findWhere($scope.subscriber.attributes, {name: 'expenseResetTime'});
        if (expenseResetTimeAttr) {
            var expenseResetTimeMoment = moment(expenseResetTimeAttr.value + ':00' + DateTimeConstants.OFFSET);
            $scope.expenseResetTime = expenseResetTimeMoment.toDate();

            $scope.isResetTimeExpired = expenseResetTimeMoment.diff(UtilService.getTodayBegin()) < 0;
        }

        var otherServicesExpenseOnAttr = _.findWhere($scope.subscriber.attributes, {name: 'expenseOn__OTHER_SERVICES'});
        var otherServicesLimitOnAttr = _.findWhere($scope.subscriber.attributes, {name: 'limitOn__OTHER_SERVICES'});
        if (!otherServicesLimitOnAttr) {
            $scope.useDefaultLimit = true;
        }

        var otherServicesAttributes = {
            expenseOn: otherServicesExpenseOnAttr && !$scope.isResetTimeExpired ? otherServicesExpenseOnAttr.value : 0,
            limitOn: otherServicesLimitOnAttr ? otherServicesLimitOnAttr.value : 0
        };

        var otherServicesItem = {
            id: _.uniqueId(),
            isOther: true,
            name: $translate.instant('SubscriberInfo.Preferences.DOBSettings.AllServices'),
            expenseOn: otherServicesAttributes.expenseOn,
            limitOn: otherServicesAttributes.limitOn
        };
        var anyServicesExpenseOn = _.filter($scope.subscriber.attributes, function (attribute) {
            return attribute ? attribute.name.startsWith('expenseOn__SERVICE__') : false;
        });
        var anyServicesLimitOn = _.filter($scope.subscriber.attributes, function (attribute) {
            return attribute ? attribute.name.startsWith('limitOn__SERVICE__') : false;
        });
        if (anyServicesExpenseOn.length > 0 || anyServicesLimitOn.length > 0) {
            otherServicesItem.name = $translate.instant('SubscriberInfo.Preferences.DOBSettings.OtherServices');
        }
        var dobSettingList = [otherServicesItem];

        // Filter out service related attributes and create a record for each service attributes.
        _.each($scope.subscriber.attributes, function (attribute) {
            if (attribute) {
                if (attribute.name.indexOf('limitOn__SERVICE__') > -1) {
                    var serviceName = attribute.name.split('limitOn__SERVICE__')[1];

                    var foundPreviousServiceItem = _.findWhere(dobSettingList, {name: serviceName});
                    if (!foundPreviousServiceItem) {
                        var servicesExpenseOnAttr = _.findWhere($scope.subscriber.attributes, {name: 'expenseOn__SERVICE__' + serviceName});
                        var servicesLimitOnAttr = _.findWhere($scope.subscriber.attributes, {name: 'limitOn__SERVICE__' + serviceName});

                        dobSettingList.push({
                            id: _.uniqueId(),
                            isOther: false,
                            name: serviceName,
                            expenseOn: servicesExpenseOnAttr && !$scope.isResetTimeExpired ? servicesExpenseOnAttr.value : 0,
                            limitOn: servicesLimitOnAttr ? servicesLimitOnAttr.value : 0
                        })
                    }
                }
            }
        });

        $scope.dobSettingList = {
            list: dobSettingList,
            tableParams: {}
        };

        $scope.dobSettingList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "name": 'asc'
            }
        }, {
            $scope: $scope,
            total: 0,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.dobSettingList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.dobSettingList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.dobSettingList.tableParams.settings().$scope.filterText = filterText;
            $scope.dobSettingList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.dobSettingList.tableParams.page(1);
            $scope.dobSettingList.tableParams.reload();
        }, 500);

        var updateSubscriberAttributes = function (dcbSettings, isRemove) {
            $log.debug('Updating subscriber dcb settings: ', dcbSettings);

            var subscriberItem = {
                id: $scope.subscriber.id,
                msisdn: $scope.subscriber.msisdn,
                paymentType: $scope.subscriber.paymentType,
                lang: $scope.subscriber.lang,
                state: {
                    currentState: $scope.subscriber.state ? $scope.subscriber.state.currentState : null
                },
                attributes: ($scope.subscriber.attributes ? angular.copy($scope.subscriber.attributes) : [])
            };

            if (isRemove || dcbSettings.useDefaultLimit) {
                var foundAttribute = _.findWhere(subscriberItem.attributes, {name: dcbSettings.name});

                subscriberItem.attributes = _.without(subscriberItem.attributes, foundAttribute);
            } else {
                var foundAttribute = _.findWhere(subscriberItem.attributes, {name: dcbSettings.name});
                if (foundAttribute) {
                    foundAttribute.value = dcbSettings.value;
                } else {
                    subscriberItem.attributes.push(dcbSettings);
                }
            }

            SSMSubscribersService.updateSubscriber(subscriberItem).then(function (response) {
                $log.debug('Updated subscriber dcb settings: ', response);

                notification.flash({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $state.reload();
            }, function (response) {
                $log.debug('Cannot update the subscriber dcb settings. Error: ', response);

                if (!_.isUndefined(response.data) && !_.isUndefined(response.data.message)) {
                    notification({
                        type: 'danger',
                        text: response.data.message
                    });
                } else {
                    notification({
                        type: 'danger',
                        text: $translate.instant('SubscriberInfo.Preferences.DOBSettings.SubscriberUpdatingError')
                    });
                }
            });
        };

        // DCB settings management methods.
        $scope.createDCBSettings = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'subscriber-info/preferences/preferences.dobsettings.modal.settings.html',
                controller: function ($scope, $log, $filter, $uibModalInstance, Restangular, services, dobSettingList, subscriber) {
                    var serviceList = Restangular.stripRestangular(services).services;
                    $scope.serviceList = $filter('orderBy')(serviceList, 'name');

                    $scope.dobSettingList = dobSettingList;
                    $scope.subscriber = subscriber;

                    $scope.dcbSettings = {
                        limitOn: 0
                    };

                    $scope.save = function (dcbSettings) {
                        var dcbSettingsItem = {
                            name: 'limitOn__SERVICE__' + dcbSettings.name,
                            value: dcbSettings.limitOn
                        };

                        $uibModalInstance.close(dcbSettingsItem);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {
                    services: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getDOBServices(0, DEFAULT_REST_QUERY_LIMIT);
                    },
                    dobSettingList: function () {
                        return $scope.dobSettingList.list;
                    },
                    subscriber: function () {
                        return $scope.subscriber;
                    }
                }
            });

            modalInstance.result.then(function (subscriberAttributes) {
                updateSubscriberAttributes(subscriberAttributes);
            }, function () {
            });
        };

        $scope.updateDCBSettings = function (dcbSettings) {
            dcbSettings.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'subscriber-info/preferences/preferences.dobsettings.modal.settings.html',
                controller: function ($scope, $log, $uibModalInstance, useDefaultLimit, dobChargingDefaultLimit, subscriber) {
                    $scope.dcbSettings = angular.copy(dcbSettings);
                    $scope.dcbSettings.useDefaultLimit = useDefaultLimit;
                    $scope.dobChargingDefaultLimit = dobChargingDefaultLimit;
                    $scope.subscriber = subscriber;

                    $scope.save = function (dcbSettings) {
                        var attrName = 'limitOn__SERVICE__' + dcbSettings.name;
                        var dcbSettingsItem = {
                            name: attrName,
                            value: dcbSettings.limitOn
                        };

                        if (dcbSettings.isOther) {
                            dcbSettingsItem.useDefaultLimit = dcbSettings.useDefaultLimit;
                            dcbSettingsItem.name = 'limitOn__OTHER_SERVICES';
                        }

                        $uibModalInstance.close(dcbSettingsItem);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {
                    useDefaultLimit: function () {
                        return $scope.useDefaultLimit;
                    },
                    dobChargingDefaultLimit: function () {
                        return $scope.dobChargingDefaultLimit;
                    },
                    subscriber: function () {
                        return $scope.subscriber;
                    }
                }
            });

            modalInstance.result.then(function (subscriberAttributes) {
                dcbSettings.rowSelected = false;

                updateSubscriberAttributes(subscriberAttributes);
            }, function () {
                dcbSettings.rowSelected = false;
            });
        };

        $scope.removeDCBSettings = function (dcbSettings) {
            dcbSettings.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                dcbSettings.rowSelected = false;

                $log.debug('Remove BCB Settings.', dcbSettings);

                // Remove limitOn and expenseOn values each.
                var dcbSettingsItem = {
                    name: 'limitOn__SERVICE__' + dcbSettings.name,
                    value: dcbSettings.limitOn
                };

                updateSubscriberAttributes(dcbSettingsItem, true);
            }, function () {
                dcbSettings.rowSelected = false;
            });
        };
    });

})();
