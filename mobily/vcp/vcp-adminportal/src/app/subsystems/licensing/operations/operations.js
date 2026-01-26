(function () {

    'use strict';

    angular.module('adminportal.subsystems.licensing.operations', []);

    var LicensingOperationsModule = angular.module('adminportal.subsystems.licensing.operations');

    LicensingOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.licensing.operations', {
            abstract: true,
            url: "/operations",
            templateUrl: 'subsystems/licensing/operations/operations.html',
            resolve: {
                getLicense: function ($q, $log, $stateParams, LicenseManagerService, Restangular) {
                    return function (licenseName) {
                        var deferredLicense = $q.defer();

                        LicenseManagerService.getLicense(licenseName).then(function (response) {
                            $log.debug('License: ', response);

                            var license = Restangular.stripRestangular(response);
                            license.status = license.status.toUpperCase();

                            deferredLicense.resolve(license);
                        }, function (response) {
                            $log.debug('Cannot read license. Error: ', response);

                            deferredLicense.reject(response);
                        });

                        return deferredLicense.promise;
                    };
                }
            }
        });

        // Individual
        $stateProvider.state('subsystems.licensing.operations.individual', {
            url: "/dedicated",
            templateUrl: "subsystems/licensing/operations/operations.individual.html",
            controller: 'LicensingListOperationsCtrl',
            resolve: {
                licenseType: function () {
                    return "dedicated";
                },
                allLicenses: function (LicenseManagerService) {
                    return LicenseManagerService.getAllLicenses();
                }
            }
        }).state('subsystems.licensing.operations.individualupdate', {
            url: "/dedicated/:name",
            templateUrl: "subsystems/licensing/operations/operations.individual.update.html",
            controller: 'LicensingUpdateOperationsCtrl',
            resolve: {
                licenseType: function () {
                    return "dedicated";
                },
                license: function ($stateParams, getLicense) {
                    var licenseName = $stateParams.name;

                    return getLicense(licenseName);
                }
            }
        });

        // Common
        $stateProvider.state('subsystems.licensing.operations.common', {
            url: "/shared",
            templateUrl: "subsystems/licensing/operations/operations.common.html",
            controller: 'LicensingListOperationsCtrl',
            resolve: {
                licenseType: function () {
                    return "shared";
                },
                allLicenses: function (LicenseManagerService) {
                    return LicenseManagerService.getAllLicenses();
                }
            }
        }).state('subsystems.licensing.operations.commonupdate', {
            url: "/shared/:name",
            templateUrl: "subsystems/licensing/operations/operations.common.update.html",
            controller: 'LicensingUpdateOperationsCtrl',
            resolve: {
                licenseType: function () {
                    return "shared";
                },
                license: function ($stateParams, getLicense) {
                    var licenseName = $stateParams.name;

                    return getLicense(licenseName);
                }
            }
        });

    });

    LicensingOperationsModule.controller('LicensingListOperationsCtrl', function ($scope, $log, $uibModal, $timeout, $filter, NgTableParams, NgTableService,
                                                                                  allLicenses, licenseType) {
        $log.debug('LicensingListOperationsCtrl');

        $scope.licenseType = licenseType;
        $scope.licenses = _.where(allLicenses, {type: $scope.licenseType});

        // License list
        $scope.licenseList = {
            list: $scope.licenses,
            tableParams: {}
        };

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.licenseList.tableParams.settings().$scope.filterText = filterText;
            $scope.licenseList.tableParams.settings().$scope.filterColumns = filterColumns;
            if ($scope.licenseList.tableParams.page() === 1) {
                $scope.licenseList.tableParams.reload();
            } else {
                $timeout(function () {
                    $scope.licenseList.tableParams.page(1);
                }, 0);
            }
        }, 500);

        $scope.licenseList.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "name": 'asc'
            }
        }, {
            total: $scope.licenseList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.licenseList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.licenseList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - SMPP Application list definitions

        $scope.showSpecialDays = function (license) {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/licensing/operations/operations.modal.specialdays.html',
                controller: ShowSpecialDaysModalInstanceCtrl,
                size: 'lg',
                resolve: {
                    license: function () {
                        return angular.copy(license);
                    },
                    licenseSpecialDays: function ($q, $log, Restangular, LicenseManagerService) {
                        var deferredLicenseDays = $q.defer();

                        LicenseManagerService.getLicenseSpecialDays(license.name).then(function (response) {
                            var licenseSpecialDays = Restangular.stripRestangular(response);
                            var filteredSpecialDays = [];

                            for (var i = 0; i < license.specialDaysCount; i++) {
                                var isValidDateStr = !_.isUndefined(licenseSpecialDays[i]) && !s.isBlank(licenseSpecialDays[i].day);

                                filteredSpecialDays.push({
                                    id: i,
                                    originalDay: isValidDateStr ? new Date(licenseSpecialDays[i].day) : null,
                                    day: isValidDateStr ? new Date(licenseSpecialDays[i].day) : null,
                                });
                            }

                            $log.debug('Special Days: ', JSON.stringify(filteredSpecialDays));

                            deferredLicenseDays.resolve(filteredSpecialDays);
                        }, function (response) {
                            $log.debug('Cannot read license. Error: ', response);

                            notification({
                                type: 'warning',
                                text: $translate.instant('Subsystems.Licensing.Operations.Messages.SpecialDaysCouldNotBeRead')
                            });

                            deferredLicenseDays.reject(response);
                        });

                        return deferredLicenseDays.promise;
                    }
                }
            });

            modalInstance.result.then(function () {
            }, function () {
            });
        }
    });

    LicensingOperationsModule.controller('LicensingUpdateOperationsCtrl', function ($scope, $state, $log, $q, $stateParams, $uibModal, $filter, $translate, notification,
                                                                                    LicenseManagerService, Restangular, license, licenseType) {
        $log.debug('LicensingUpdateOperationsCtrl');

        $scope.license = license;
        $scope.licenseName = $stateParams.name;

        $scope.originalLicense = angular.copy($scope.license);
        $scope.isConfigurationNotChanged = function () {
            return angular.equals($scope.originalLicense, $scope.license);
        };

        $scope.isIndividual = function () {
            return licenseType === 'dedicated';
        };

        $scope.showProductAttributes = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/licensing/operations/operations.modal.attributes.html',
                controller: ShowProductAttributesModalInstanceCtrl,
                size: 'lg',
                resolve: {
                    originalLicense: function () {
                        return $scope.originalLicense;
                    },
                    license: function () {
                        return angular.copy($scope.license);
                    }
                }
            });

            modalInstance.result.then(function (productLimits) {
                $scope.license.productLicenses = productLimits;

                $scope.productLimits = [];
                for (var i = 0; i < productLimits.entry.length; i++) {
                    var product = productLimits.entry[i];
                    var entry = {
                        name: product.value.name,
                        hardLimitMajorThreshold: product.value.hardLimitMajorThreshold,
                        hardLimitMinorThreshold: product.value.hardLimitMinorThreshold,
                        softLimitMajorThreshold: product.value.softLimitMajorThreshold,
                        softLimitMinorThreshold: product.value.softLimitMinorThreshold,
                        userLimit: product.value.userLimit,
                        userLimitMajorThreshold: product.value.userLimitMajorThreshold,
                        userLimitMinorThreshold: product.value.userLimitMinorThreshold
                    };
                    $scope.productLimits.push(entry);
                }
            }, function () {
                $scope.license = angular.copy($scope.originalLicense);
            });
        };

        $scope.save = function () {
            var licenseThresholds = {
                hardLimitMinorThreshold: parseFloat($scope.license.hardLimitMinorThreshold),
                hardLimitMajorThreshold: parseFloat($scope.license.hardLimitMajorThreshold),
                softLimitMinorThreshold: parseFloat($scope.license.softLimitMinorThreshold),
                softLimitMajorThreshold: parseFloat($scope.license.softLimitMajorThreshold)
            };

            LicenseManagerService.setLicenseThresholds($scope.licenseName, licenseThresholds).then(function (response) {
                $log.debug('Set license thresholds: ', response);

                if ($scope.isIndividual()) {
                    $scope.productLimits = [
                        {
                            name: $scope.license.productLicenses.entry[0].value.name,
                            hardLimitMajorThreshold: 0,
                            hardLimitMinorThreshold: 0,
                            softLimitMajorThreshold: 0,
                            softLimitMinorThreshold: 0,
                            userLimit: parseFloat($scope.license.productLicenses.entry[0].value.userLimit),
                            userLimitMajorThreshold: parseFloat($scope.license.productLicenses.entry[0].value.userLimitMajorThreshold),
                            userLimitMinorThreshold: parseFloat($scope.license.productLicenses.entry[0].value.userLimitMinorThreshold)
                        }
                    ];
                }

                // For Individual update there always are an instance because of we create it just above line block.
                // Deferrer (promise listener) defined for only Individual update so we want to wait for it to be done its job for redirection.
                var productLimitsDeferred = $q.defer();

                if ($scope.productLimits) {
                    for (var i = 0; i < $scope.productLimits.length; i++) {
                        var productLimit = $scope.productLimits[i];
                        LicenseManagerService.setLicenseProductThresholds($scope.licenseName, productLimit).then(function (response) {
                            $log.debug('Set product thresholds: ', response);
                            productLimitsDeferred.resolve(response);
                        }, function (response) {
                            $log.debug('Cannot set product thresholds. Error: ', response);
                            productLimitsDeferred.rejected(response);
                        });
                    }
                }

                if ($scope.isIndividual()) {
                    // If this is an Individual update then listen the created promise.
                    productLimitsDeferred.promise.then(function () {
                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });

                        $state.go('subsystems.licensing.operations.individual');
                    }, function (response) {
                        notification({
                            type: 'warning',
                            text: response.status + ' ' + response.statusText
                        });
                    });
                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $state.go('subsystems.licensing.operations.common');
                }
            }, function (response) {
                $log.debug('Cannot set license thresholds. Error: ', response);
            });
        };

        $scope.cancel = function () {
            if ($scope.isIndividual()) {
                $scope.go('subsystems.licensing.operations.individual');
            } else {
                $state.go('subsystems.licensing.operations.common');
            }
        };
    });

    var ShowProductAttributesModalInstanceCtrl = function ($scope, $uibModalInstance, originalLicense, license, $log) {
        $log.debug('ShowProductAttributesModalInstanceCtrl');

        $scope.originalLicense = originalLicense;
        $scope.license = license;

        $scope.isAttributesNotChanged = function () {
            return angular.equals($scope.originalLicense.productLicenses, $scope.license.productLicenses);
        };

        $scope.ok = function () {
            $uibModalInstance.close($scope.license.productLicenses);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };

    var ShowSpecialDaysModalInstanceCtrl = function ($scope, $q, $uibModalInstance, $log, $filter, $controller, $timeout, $translate,
                                                     notification, UtilService, license, licenseSpecialDays, LicenseManagerService) {
        $log.debug('ShowSpecialDaysModalInstanceCtrl');

        $scope.license = license;
        $scope.days = licenseSpecialDays;

        // Create empty objects to hold date picker statuses.
        $scope.dayPickers = {};
        for (var i = 0; i < $scope.license.specialDaysCount; i++) {
            $scope.dayPickers[i] = {};
        }

        $scope.daysOriginal = angular.copy($scope.days);
        $scope.isNotChanged = function () {
            return angular.equals($scope.days, $scope.daysOriginal);
        };

        // Date picker initialization and function of the opener button.
        $scope.licenseDaysDateFormat = 'yyyy-MM-dd';
        $scope.licenseDaysDateOptions = {
            formatYear: 'yy',
            startingDay: 1,
            showWeeks: true
        };

        $scope.openLicenseDaysDatePicker = function ($event, object) {
            $event.preventDefault();
            $event.stopPropagation();

            if (!_.isUndefined(object)) {
                object.opened = true;
            }
        };

        $scope.validateDayField = function (index) {
            var validating = $scope.form['day_' + index].$modelValue === undefined && $scope.form['day_' + index].$viewValue !== $scope.form['day_' + index].$modelValue;
            UtilService.setError($scope.form, 'day_' + index, 'date', !validating);
            $scope.dayPickers[index].invalidDateErrorMessage = null;
        };

        $scope.save = function (licenseName, specialDays) {
            _.each(specialDays, function (item, index) {
                var oldDayStr = $filter('date')(item.originalDay, 'yyyy-MM-dd');
                var dayStr = $filter('date')(item.day, 'yyyy-MM-dd');

                var promise, successMessageKey;

                if (oldDayStr) {
                    if (!dayStr) {
                        promise = LicenseManagerService.deleteLicenseSpecialDay(licenseName, oldDayStr);
                        successMessageKey = 'Subsystems.Licensing.Operations.Messages.SuccessfullyRemoved';
                    } else if (dayStr && dayStr !== oldDayStr) {
                        promise = LicenseManagerService.updateLicenseSpecialDay(licenseName, oldDayStr, dayStr);
                        successMessageKey = 'Subsystems.Licensing.Operations.Messages.SuccessfullyChanged';
                    }
                } else if (dayStr) {
                    promise = LicenseManagerService.addNewLicenseSpecialDay(licenseName, dayStr);
                    successMessageKey = 'Subsystems.Licensing.Operations.Messages.SuccessfullyDefined';
                }

                if (promise) {
                    promise.then(function (response) {
                        $log.debug('The special days changed successfully. Response: ', response);

                        // Copy to the original copy of the array.
                        item.originalDay = item.day;
                        var dayOriginal = _.findWhere($scope.daysOriginal, {id: item.id});
                        dayOriginal.day = angular.copy(item.day);
                        dayOriginal.originalDay = angular.copy(item.originalDay);

                        notification({
                            type: 'success',
                            text: $translate.instant(successMessageKey, {old_day: oldDayStr, day: dayStr})
                        });
                    }, function (response) {
                        $log.debug('The special days could not be changed. Error: ', response);

                        var errorMessage = $translate.instant('Subsystems.Licensing.Operations.Messages.CouldNotBeChanged', {
                            old_day: oldDayStr,
                            day: dayStr
                        });

                        // Show validation error too.
                        UtilService.setError($scope.form, 'day_' + index, 'date', false);
                        $scope.dayPickers[index].invalidDateErrorMessage = errorMessage;
                    });
                }
            });
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };

})();
