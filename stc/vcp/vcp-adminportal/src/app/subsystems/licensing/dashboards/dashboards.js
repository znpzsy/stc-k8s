(function () {

    'use strict';

    angular.module('adminportal.subsystems.licensing.dashboards', [
        'chart.js'
    ]);

    var LicensingDashboardsModule = angular.module('adminportal.subsystems.licensing.dashboards');

    LicensingDashboardsModule.config(function ($stateProvider, ChartJsProvider) {

        $stateProvider.state('subsystems.licensing.dashboards', {
            url: "/dashboard",
            templateUrl: "subsystems/licensing/dashboards/dashboards.html",
            controller: 'LicensingDashboardsCtrl',
            resolve: {
                allLicenses: function (LicenseManagerService) {
                    return LicenseManagerService.getAllLicenses();
                },
                systemInfo: function ($q, $log, allLicenses, Restangular, DateTimeConstants, AdmPortalDashboardPromiseTracker, LicenseManagerService) {
                    var deferred = $q.defer();
                    var licenses = Restangular.stripRestangular(allLicenses);
                    // Check for hourly stats to find out if the system has been upgraded to tps sampling
                    var start = moment().utcOffset(DateTimeConstants.OFFSET).subtract(1, 'hours');
                    var end = moment().utcOffset(DateTimeConstants.OFFSET);
                    var query = 'from=' + start.utc().format("YYYYMMDDTHHmmss") + 'Z' + '&to=' + end.utc().format("YYYYMMDDTHHmmss") + 'Z';

                    var licenseName = licenses[0].name;

                    LicenseManagerService.getConsumptionsByQuery(licenseName, query, AdmPortalDashboardPromiseTracker).then(function (response) {
                        // TODO: For now, we are checking the number of data points returning for the first license in the list. This is not reliable
                        // as the first license might not be actively used. We need to find a better way to check if the system has been upgraded.

                        var consumptionHistory = Restangular.stripRestangular(response);
                        var systemUpgraded = {
                            samplingRate: 60,
                            upgraded: true // Temporarily set to true - testing purposes
                        };

                        if (consumptionHistory && consumptionHistory.length > 61) {
                            systemUpgraded.upgraded = true;
                            systemUpgraded.samplingRate = consumptionHistory[0].samplingPeriod;
                        }

                        $log.debug('systemUpgraded: ', systemUpgraded);

                        deferred.resolve(systemUpgraded);

                    }, function (response) {
                        $log.debug('Cannot read license consumption. Error: ', response);
                        deferred.reject(response);

                    });

                    return deferred.promise;

                }
            }
        });

        Chart.defaults.global.tooltips.mode = 'index';
    });

    LicensingDashboardsModule.controller('LicensingDashboardsCtrl', function ($scope, $log, $filter, $interval, $timeout, $translate, $controller, notification, Restangular, UtilService, LicenseManagerService,
                                                                              DateTimeConstants, AdmPortalDashboardPromiseTracker, allLicenses, systemInfo) {
        $log.debug("LicensingDashboardsCtrl");

        // Calling the date time controller which initializes date/time pickers and necessary functions.
        $controller('GenericDateTimeCtrl', {$scope: $scope});
        // Toggle for detailed queries (filterform shown only if system is upgraded.)
        $scope.detailQueryEnabled = false;

        $scope.chartData = [];
        $scope.rejectionsChartData = [];

        $scope.allLicenses = Restangular.stripRestangular(allLicenses);
        $scope.systemUpgraded = systemInfo.upgraded;

        $scope.exportOptions = {columns: []};

        $scope.viewOption = {
            isYAxisNormalized: false
        };

        // True if the history query is detailed. Result contains sampling period. No Max usage to be displayed, min max avg all the same.
        var isDetailedResult = function () {
            var detailed = false;
            if ($scope.systemUpgraded) {
                if ($scope.specifiedInterval.key === 'hours') {
                    detailed = true
                }
                if ($scope.specifiedInterval.key === 'specified') {
                    var startDateTime = new Date($filter('date')($scope.dateFilter.startDate, 'yyyy-MM-dd') + $filter('date')($scope.dateFilter.startTime, 'THH:mm:ss.000Z'));
                    var endDateTime = new Date($filter('date')($scope.dateFilter.endDate, 'yyyy-MM-dd') + $filter('date')($scope.dateFilter.endTime, 'THH:mm:ss.000Z'));
                    var diffMs = endDateTime - startDateTime;
                    $log.debug("diffMs", diffMs);
                    // if less than one hour diff, the results are expected to be detailed, even if the toggle is not selected.
                    if (diffMs < 3600000 || $scope.detailQueryEnabled)
                        detailed = true;
                }
            }
            return detailed;
        };

        var getMomentDateSubtracted = function (string) {
            return function () {
                return moment().utcOffset(DateTimeConstants.OFFSET).subtract(1, string);
            };
        };

        var getIntervals = function(){
            var intervals = [
                {label: 'Last Hour', key: 'hours', getDate: getMomentDateSubtracted('hours')},
                {label: 'Last Day', key: 'days', getDate: getMomentDateSubtracted('days')},
                {label: 'Last Week', key: 'weeks', getDate: getMomentDateSubtracted('weeks')},
                {label: 'Last Month', key: 'months', getDate: getMomentDateSubtracted('months')},
                {label: 'Last Year', key: 'years', getDate: getMomentDateSubtracted('years')}
            ];

            var specified = {label: 'User Specified Range', key: 'specified', getDate: getMomentDateSubtracted('hours')};
            if($scope.systemUpgraded){
                intervals.push(specified);
            }

            return intervals;
        }

        $scope.INTERVALS = getIntervals();

        $scope.licenseName = 'Specified License';
        $scope.specifiedInterval = $scope.INTERVALS[0];
        // For dedicated licenses, this is the safe way to get the product license type.
        // license.type can contain either shared or dedicated
        // license.uom can contain anything the backend product specifies. (i.e. transaction instead of tps)
        // ---- license.productLicenses.entry[0].value.type is defined as an enum in the licensing server
        // ---- and can only contain tpp, bucket, session, which specifies what is measured.
        $scope.licenseSamplingType = 'tpp';
        $scope.licenseUoM = 'tps';

        // Time controls
        // Filter initializations, date controls
        $scope.initializeDateTimeFields = function () {
            $scope.hstep = 1;
            $scope.mstep = 1;

            $scope.dateFormat = 'MMMM d, y';
            $scope.dateOptions = {
                formatYear: 'yy',
                startingDay: 1,
                showWeeks: false
            };

            $scope.dateFilter = {
                startDate:  new Date(moment().utcOffset(DateTimeConstants.OFFSET).subtract(2, 'days').format('YYYY/MM/DD HH:mm:ss')),
                startTime: UtilService.getTodayBegin(),
                endDate: new Date(moment().utcOffset(DateTimeConstants.OFFSET).subtract(1, 'days').format('YYYY/MM/DD HH:mm:ss')),
                endTime: UtilService.getTodayBegin()
            };

            $scope.openStartDatePicker = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.startDatePicker = {
                    opened: true
                };
            };
            $scope.openEndDatePicker = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.endDatePicker = {
                    opened: true
                };
            };

            $scope.updateStartDate = function () {
                if ($scope.dateFilter.startDate) {
                    $scope.dateFilter.startDate = UtilService.calculateDate($scope.dateFilter.startDate, $scope.dateFilter.startTime.getHours(), $scope.dateFilter.startTime.getMinutes());
                }
                $scope.validateDates();
            };
            $scope.updateStartDateTime = function () {
                $scope.dateFilter.startDate = UtilService.calculateDate($scope.dateFilter.startDate, $scope.dateFilter.startTime.getHours(), $scope.dateFilter.startTime.getMinutes());
                $scope.validateDates();
            };

            $scope.updateEndDate = function () {
                if ($scope.dateFilter.endDate) {
                    $scope.dateFilter.endDate = UtilService.calculateDate($scope.dateFilter.endDate, $scope.dateFilter.endTime.getHours(), $scope.dateFilter.endTime.getMinutes());
                }
                $scope.validateDates();
            };
            $scope.updateEndDateTime = function () {
                $scope.dateFilter.endDate = UtilService.calculateDate($scope.dateFilter.endDate, $scope.dateFilter.endTime.getHours(), $scope.dateFilter.endTime.getMinutes());
                $scope.validateDates();
            };

        };

        $scope.validateDates = function () {

            UtilService.setError($scope.filterForm, 'startDate', 'maxDateExceeded', true);
            UtilService.setError($scope.filterForm, 'startDate', 'maxToday', true);
            UtilService.setError($scope.filterForm, 'startDate', 'hourlyLimit', true);
            UtilService.setError($scope.filterForm, 'startDate', 'dailyLimit', true);

            UtilService.setError($scope.filterForm, 'endDate', 'maxDateExceeded', true);
            UtilService.setError($scope.filterForm, 'endDate', 'maxToday', true);
            UtilService.setError($scope.filterForm, 'endDate', 'hourlyLimit', true);
            UtilService.setError($scope.filterForm, 'endDate', 'dailyLimit', true);

            var startDate = $filter('date')($scope.dateFilter.startDate, 'yyyy-MM-dd');
            var startTime = $filter('date')($scope.dateFilter.startTime, 'THH:mm:ss.000Z');
            var endDate = $filter('date')($scope.dateFilter.endDate, 'yyyy-MM-dd');
            var endTime = $filter('date')($scope.dateFilter.endTime, 'THH:mm:ss.000Z');
            var startDateTime = new Date(startDate + startTime);
            var endDateTime = new Date(endDate + endTime);
            // var today = new Date();

            var diffMs = endDateTime - startDateTime;
            var diffDays = Math.round(diffMs / 86400000); // days

            $log.debug("$scope.dateFilter.endDate", $scope.dateFilter.endDate);
            $log.debug("$scope.dateFilter.startDate", $scope.dateFilter.startDate)

            $log.debug('diffMs', diffMs);
            $log.debug('diffDays', diffDays);

            // if (startDateTime > today) {
            //     UtilService.setError($scope.filterForm, 'startDate', 'maxToday', false);
            // }
            //
            // if (endDateTime > today) {
            //     UtilService.setError($scope.filterForm, 'endDate', 'maxToday', false);
            // }

            if (diffMs < 0) {
                UtilService.setError($scope.filterForm, 'startDate', 'maxDateExceeded', false);
                UtilService.setError($scope.filterForm, 'endDate', 'minDateExceeded', false);
            } else {
                UtilService.setError($scope.filterForm, 'startDate', 'maxDateExceeded', true);
                UtilService.setError($scope.filterForm, 'endDate', 'minDateExceeded', true);
            }


            if ($scope.detailQueryEnabled) {

                // eqv. of 72 hrs / 3 days
                if (diffMs > 259200000) {
                    UtilService.setError($scope.filterForm, 'startDate', 'hourlyLimit', false);
                    UtilService.setError($scope.filterForm, 'endDate', 'hourlyLimit', false);
                }
            }
            else {
                if (diffDays > 31) {
                    UtilService.setError($scope.filterForm, 'startDate', 'dailyLimit', false);
                    UtilService.setError($scope.filterForm, 'endDate', 'dailyLimit', false);
                } else {
                    UtilService.setError($scope.filterForm, 'startDate', 'dailyLimit', true);
                    UtilService.setError($scope.filterForm, 'endDate', 'dailyLimit', true);
                }
            }

        };

        $scope.$watch('detailQueryEnabled', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                $scope.validateDates($scope.dateFilter);
            }
        });

        $scope.initializeDateTimeFields();

        $scope.roundUp = function (value, decimals) {
            return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
            // Number(Number(value).toFixed(decimals));
        }

        // This dummy variable is using to keep key values of products for shared licenses.
        $scope.selectedProductLicenseValues = [];
        $scope.isProductSelected = function (productKey) {
            return _.contains($scope.selectedProductLicenseValues, productKey);
        };


        // Sets visibility of date selection controls for user specified time range option
        $scope.showDateSelection = function(){
            return ($scope.systemUpgraded && ($scope.specifiedInterval.key == 'specified'));
        }

        $scope.toggleProduct = function (productKey) {
            if (!$scope.isProductSelected(productKey)) {
                $scope.selectedProductLicenseValues.push(productKey)
            } else {
                $scope.selectedProductLicenseValues = _.without($scope.selectedProductLicenseValues, productKey);
            }
            $scope.selectedProductLicenseValues = _.sortBy($scope.selectedProductLicenseValues);

            // Draw the chart again according to selected products.
            drawChart($scope.licenseConsumptionList, $scope.viewOption.isYAxisNormalized);
        };

        var addExportOption = function (fieldName, headerKey, filterObject, headerSpecifier) {
            var item = {
                fieldName: headerSpecifier ? fieldName + '_' + headerSpecifier : fieldName,
                headerKey: headerSpecifier ? $translate.instant(headerKey) + ' (' + headerSpecifier + ')' : headerKey
            };

            if (filterObject) {
                item.filter = filterObject
            }

            $scope.exportOptions.columns.push(item);
        };

        var prepareExportOptions = function (selectedProducts) {
            $scope.exportOptions = {columns: []};
            var dateformat = (!isDetailedResult()) ? 'yyyy-MM-dd HH:mm' : 'yyyy-MM-dd HH:mm:ss';

            addExportOption('time', 'Subsystems.Licensing.Dashboard.ConsumptionTime', {
                name: 'date',
                params: [dateformat, DateTimeConstants.OFFSET]
            });

            // Add selected production keys
            if (selectedProducts) {
                _.each(selectedProducts, function (selectedProduct) {
                    // Add columns for each products
                    addExportOption('min', $scope.labels.MinConsumption, null, selectedProduct);
                    addExportOption('max', $scope.labels.MaxConsumption, null, selectedProduct);
                    addExportOption('avg', $scope.labels.AvgConsumption, null, selectedProduct);
                    addExportOption('reject', $scope.labels.Violations, null, selectedProduct);
                });
            }

            // Add general columns if there is no shared license products.
            if(!isDetailedResult()){
                addExportOption('min', $scope.labels.MinConsumption);
                addExportOption('max', $scope.labels.MaxConsumption);
            }
            addExportOption('avg', $scope.labels.AvgConsumption);
            addExportOption('reject', $scope.labels.Violations);

            // Common columns
            addExportOption('soft', $scope.labels.SoftLimitSetting);
            addExportOption('softreject', $scope.labels.SoftLimitViolations);
            addExportOption('hard', $scope.labels.HardLimitSetting);
            addExportOption('hardreject', $scope.labels.HardLimitViolations);
        };

        var prepareExportDataByProduct = function (licenseConsumption, selectedProducts) {
            var licenseConsumptionExportData = {};
            licenseConsumptionExportData.time = licenseConsumption.time;
            _.each(selectedProducts, function (selectedProduct) {
                var productEntry = _.findWhere(licenseConsumption.products, {name: selectedProduct});
                licenseConsumptionExportData['min_' + selectedProduct] = productEntry ? productEntry.min : 0;
                licenseConsumptionExportData['max_' + selectedProduct] = productEntry ? productEntry.max : 0;
                licenseConsumptionExportData['avg_' + selectedProduct] = productEntry ? productEntry.avg : 0;
                licenseConsumptionExportData['reject_' + selectedProduct] = productEntry ? productEntry.reject : 0;
            });
            licenseConsumptionExportData.min = licenseConsumption.min;
            licenseConsumptionExportData.max = licenseConsumption.max;
            licenseConsumptionExportData.avg = licenseConsumption.avg;
            licenseConsumptionExportData.reject = licenseConsumption.reject;
            licenseConsumptionExportData.soft = licenseConsumption.soft;
            licenseConsumptionExportData.softreject = licenseConsumption.softreject;
            licenseConsumptionExportData.hard = licenseConsumption.hard;
            licenseConsumptionExportData.hardreject = licenseConsumption.hardreject;

            return licenseConsumptionExportData;
        };

        $scope.getLabels = function() {
            var samplingUnit;

            switch ($scope.licenseSamplingType) {
                case 'tpp':
                    samplingUnit = 'Subsystems.Licensing.SamplingUnitOfMeasures.TPS';
                    break;
                case 'bucket':
                    samplingUnit = 'Subsystems.Licensing.SamplingUnitOfMeasures.Buckets';
                    break;
                case 'session':
                    samplingUnit = 'Subsystems.Licensing.SamplingUnitOfMeasures.Sessions';
                    break;
                default:
                    samplingUnit = 'Subsystems.Licensing.SamplingUnitOfMeasures.TPS';
                    break;
            }

            // For sampling types other than tpp, check for the uom provided by the product.
            if($scope.licenseSamplingType !== 'tpp' && $scope.licenseUoM){
                samplingUnit = $scope.licenseUoM.slice(-1) !== 's' ? pluralize($scope.licenseUoM) : $scope.licenseUoM;
            } else if ($scope.licenseSamplingType === 'tpp' && $scope.licenseUoM) {
                samplingUnit = $scope.licenseUoM;
            }
            $log.debug('samplingUnit', samplingUnit)

            return {
                UnitOfMeasure: $translate.instant(samplingUnit),
                Raw: $translate.instant('Subsystems.Licensing.Dashboard.ViewOption.Raw') + ' (' + $translate.instant(samplingUnit) + ')',
                ConsumptionTime: $translate.instant('Subsystems.Licensing.Dashboard.ConsumptionTime'),
                Violations: $translate.instant('Subsystems.Licensing.Dashboard.Violations'),
                MinConsumption: $translate.instant('Subsystems.Licensing.Dashboard.MinConsumption') + ' (' + $translate.instant(samplingUnit) + ')',
                MaxConsumption: $translate.instant('Subsystems.Licensing.Dashboard.MaxConsumption') + ' (' + $translate.instant(samplingUnit) + ')',
                AvgConsumption: $translate.instant('Subsystems.Licensing.Dashboard.AvgConsumption') + ' (' + $translate.instant(samplingUnit) + ')',
                SoftLimitSetting: $translate.instant('Subsystems.Licensing.Dashboard.SoftLimitSetting') + ' (' + $translate.instant(samplingUnit) + ')',
                SoftLimitViolations: $translate.instant('Subsystems.Licensing.Dashboard.SoftLimitViolations'),
                HardLimitSetting: $translate.instant('Subsystems.Licensing.Dashboard.HardLimitSetting') + ' (' + $translate.instant(samplingUnit) + ')',
                HardLimitViolations: $translate.instant('Subsystems.Licensing.Dashboard.HardLimitViolations'),
            };
        };

        $scope.chooseLicense = function (chosenLicense) {
            // Clean the selected product names.
            $scope.selectedProductLicenseValues = [];
            $scope.allProductLicenseValues = [];

            $scope.specifiedLicense = chosenLicense;
            $scope.licenseName = $scope.specifiedLicense.name;
            $scope.licenseUoM = $scope.specifiedLicense.uom;
            $scope.licenseSamplingType = $scope.specifiedLicense.productLicenses.entry[0].value.type;
            $scope.labels = $scope.getLabels();

            // Add all production keys if it is a shared license by default.
            if ($scope.specifiedLicense.productLicenses && $scope.specifiedLicense.productLicenses.entry.length > 1) {
                _.each($scope.specifiedLicense.productLicenses.entry, function (productLicense) {
                    $scope.selectedProductLicenseValues.push(productLicense.key);
                });
                // TODO: When Shared license is selected, adapt licenseSamplingType according to 'ulu'
                $scope.selectedProductLicenseValues = _.sortBy($scope.selectedProductLicenseValues);
                $scope.allProductLicenseValues = angular.copy($scope.selectedProductLicenseValues);
            }

            cancelTimer($scope.rebuild);

            $scope.showCurrentStats = false;
            $scope.showViolations = false;
            $scope.showChart = false;
        };

        $scope.chooseInterval = function (chosenInterval) {
            $scope.specifiedInterval = chosenInterval;
            $scope.detailQueryEnabled = false;

            cancelTimer($scope.rebuild);

            $scope.showCurrentStats = false;
            $scope.showChart = false;
            if($scope.systemUpgraded && $scope.specifiedInterval.key !== 'specified'){
                $scope.initializeDateTimeFields();
                $scope.validateDates();
            }
        };

        var getCurrentConsumption = function (licenseName, promiseTracker) {
            return LicenseManagerService.getCurrentConsumption(licenseName, promiseTracker).then(function (response) {
                var currentConsumption = Restangular.stripRestangular(response);
                $scope.currentConsumption = currentConsumption;

                $log.debug('Current license consumption: ', currentConsumption);

                $scope.showCurrentStats = true;

                $scope.hardLimitValue = currentConsumption.hardLimit;
                $scope.softLimitValue = currentConsumption.softLimit;

                $scope.hardLimitConsumption = (currentConsumption.avgConsumption / currentConsumption.hardLimit) * 100;
                $scope.softLimitConsumption = (currentConsumption.avgConsumption / currentConsumption.softLimit) * 100;

                if (currentConsumption.userLimit) {
                    $scope.userLimit = true;
                    $scope.userLimitValue = currentConsumption.userLimit;
                    $scope.userLimitConsumption = (currentConsumption.avgConsumption / currentConsumption.userLimit) * 100;
                }
            }, function (response) {
                $log.error('Cannot read current license consumption. Error: ', response);

                $scope.showCurrentStats = false;
            });
        };

        var setViolationStat = function (violations) {
            $scope.violations = violations;

            $log.debug('Current soft limit violations: ', violations);

            $scope.showViolations = violations.maxAllowed > -1;
            $scope.violationStat = (violations.consumed / violations.maxAllowed) * 100;

            // $scope.consumed = violations.consumed;
            // $scope.maxAllowed = violations.maxAllowed;

            $scope.showCurrentStats = true;
            $scope.showViolations = violations.maxAllowed > -1;
            $scope.violationStat = (violations.consumed / violations.maxAllowed) * 100;

            $scope.pbClass = $scope.violationStat <= 50 ? 'progress-bar progress-bar-secondary' : ($scope.violationStat > 50 && $scope.violationStat <= 80) ? 'progress-bar progress-bar-primary' : 'progress-bar progress-bar-danger';


        }
        var softLimitViolations = function (licenseName, promiseTracker) {
            return LicenseManagerService.getViolations(licenseName, promiseTracker).then(function (response) {


                var violations = Restangular.stripRestangular(response);
                $scope.violations = violations;

                $log.debug('Current soft limit violations: ', violations);
                setViolationStat(violations);

            }, function (response) {
                $log.error('Cannot read current license soft limit violations. Error: ', response);
                var violations = {
                    "consumed": 0,
                    "licenseName": "Something went wrong.",
                    "maxAllowed": -1,
                    "error": true
                };

                setViolationStat(violations);

                notification({
                    type: 'warning',
                    text: $translate.instant('Subsystems.Licensing.Messages.SoftLimitViolationsNotFound', {
                        licenseName: $scope.licenseName
                    })
                });

            });
        };

        var prepareChartData = function (licenseConsumptionList, isYAxisNormalized, selectedProducts) {
            var series = isDetailedResult() ? ['Avg Usage', 'Soft Limit', 'Hard Limit'] : ['Avg Usage', 'Max Usage', 'Soft Limit', 'Hard Limit'];

            var labels = [], maxData = [], avgData = [], softLimitData = [], hardLimitData = [];
            var yAxisMaxLimit = 0;
            $scope.licenseConsumptionExportList = [];

            // Prepare export options according to license and product selection.
            prepareExportOptions(selectedProducts);

            // Preparing maximum and average consumption data
            _.each(licenseConsumptionList, function (entry) {

                // For dedicated licenses,
                // ---- if the license sampling type is tpp
                // -------- if the system is upgraded
                // ------------ if the sampling period is specified, use it, else for tpp the standard is 60s = 1m
                // ---- if the license sampling type is bucket or session, do not use the sampling period, conversion is not necessary
                var period = 1;
                if($scope.licenseSamplingType === 'tpp'){
                    period = ($scope.systemUpgraded && entry.samplingPeriod) ? entry.samplingPeriod : 60
                };

                // TODO: Details on `ulu` param for shared licenses to be discussed, leaving the tpm--> tps conversion as is.
                // A Shared license is a license that is shared among multiple products, which can have different sampling types.
                // How the data points and units will be displayed is not clear at this point.
                if ($scope.specifiedLicense.type === 'shared' && selectedProducts) {
                    entry.avg = 0;
                    entry.min = 0;
                    entry.max = 0;
                    entry.reject = 0;
                    _.each(selectedProducts, function (selectedProduct) {
                        var productEntry = _.findWhere(entry.products, {name: selectedProduct});
                        entry.avg += productEntry ? productEntry.avg : 0;
                        entry.min += productEntry ? productEntry.min : 0;
                        entry.max += productEntry ? productEntry.max : 0;
                        entry.reject += productEntry ? productEntry.reject : 0;
                    });

                    entry.avg = $scope.roundUp(entry.avg / period, 0);
                    entry.min = $scope.roundUp(entry.min / period, 0);
                    entry.max = $scope.roundUp(entry.max / period, 0);
                    entry.reject = $scope.roundUp(entry.reject / period, 0);

                    // Prepare exportable data from the original list by selected product
                    var licenseConsumptionExportData = prepareExportDataByProduct(entry, selectedProducts);
                    $scope.licenseConsumptionExportList.push(licenseConsumptionExportData);
                } else {
                    var dedicatedLicData = angular.copy(entry);
                    dedicatedLicData.avg = $scope.roundUp(entry.avg / period, 0);
                    dedicatedLicData.min = $scope.roundUp(entry.min / period, 0);
                    dedicatedLicData.max = $scope.roundUp(entry.max / period, 0);
                    dedicatedLicData.reject = $scope.roundUp(entry.reject / period, 0);
                    dedicatedLicData.hard = $scope.roundUp(entry.hard / period, 0);
                    dedicatedLicData.hardreject = $scope.roundUp(entry.hardreject / period, 0);
                    dedicatedLicData.soft = $scope.roundUp(entry.soft / period, 0);
                    dedicatedLicData.softreject = $scope.roundUp(entry.softreject / period, 0);
                    // Prepare exportable data from the original list.
                    $scope.licenseConsumptionExportList.push(dedicatedLicData);
                }
                var dateformat = (!isDetailedResult()) ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD HH:mm:ss';
                var dateValue = moment(entry.time).utcOffset(DateTimeConstants.OFFSET).format(dateformat);

                // Remove the precision numbers.
                entry.avg = $scope.roundUp(entry.avg, 0);

                var avgValue = (isYAxisNormalized ? $scope.roundUp((entry.avg / entry.hard) * 100, 0) : $scope.roundUp(entry.avg / period, 0));
                var maxValue = (isYAxisNormalized ? $scope.roundUp((entry.max / entry.hard) * 100, 0) : $scope.roundUp(entry.max / period, 0));

                var softLimitValue = (isYAxisNormalized ? $scope.roundUp((entry.soft / entry.hard) * 100, 0) : $scope.roundUp(entry.soft / period, 0));
                var hardLimitValue = (isYAxisNormalized ? 100 : $scope.roundUp(entry.hard / period, 0));

                // Find maximum hard limit value in the set.
                if (yAxisMaxLimit < hardLimitValue) {
                    yAxisMaxLimit = hardLimitValue;
                }

                labels.push(dateValue);
                avgData.push(avgValue);
                maxData.push(maxValue);
                softLimitData.push(softLimitValue);
                hardLimitData.push(hardLimitValue);
            });

            return {
                series: series,
                labels: labels,
                avgData: avgData,
                maxData: maxData,
                softLimitData: softLimitData,
                hardLimitData: hardLimitData,
                yAxisMaxLimit: yAxisMaxLimit
            };
        };

        var prepareChartOptions = function (isYAxisNormalized, yAxisMaxLimit) {
            var yMin = 0;

            // Find log 10 of the found maximum limit and floor it to the neares integer. Decrease 1 and calculate the power of 10 of it.
            var yMaxIncreaser = Math.pow(10, Math.floor(Math.log10(yAxisMaxLimit)) - 1);
            // // If the increaser lesser than 100 than found the nearest upper integer value of the dividing 1000 and calculate the new limit with it.
            // var calculatedYMax = (yMaxIncreaser <= 100 ? (Math.ceil(yAxisMaxLimit / 1000) * 1000 + 500) : yAxisMaxLimit + yMaxIncreaser);
            var calculatedYMax = yAxisMaxLimit + yMaxIncreaser;
            var yMax = (isYAxisNormalized ? 120 : calculatedYMax);

            var unitLabel = (isYAxisNormalized ? '%' : ' ' + $scope.labels.UnitOfMeasure);

            var chartOptions = {
                legend: {
                    display: true,
                    labels: {
                        fontColor: '#666666'
                    }
                },
                scales: {
                    yAxes: [
                        {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            ticks: {
                                beginAtZero: true,
                                min: yMin,
                                max: yMax
                            }
                        }
                    ],
                    xAxes: [
                        {
                            display: true,
                            position: 'bottom'
                        }
                    ]
                },
                tooltips: {
                    callbacks: {
                        label: function (tooltipItem, data) {
                            var productNames = '';
                            if (data.datasets[tooltipItem.datasetIndex].label.indexOf('Usage') > -1 &&
                                $scope.selectedProductLicenseValues && $scope.selectedProductLicenseValues.length > 0) {
                                productNames = ' [' + $scope.selectedProductLicenseValues.join(', ').toUpperCase() + ']';
                            }

                            return tooltipItem.yLabel + unitLabel + productNames;
                        }
                    }
                },
                elements: {
                    point: {
                        radius: 2,
                        hitRadius: 4,
                        hoverRadius: 4,
                        borderColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            };

            return chartOptions;
        };

        var drawChart = function (licenseConsumptionList, isYAxisNormalized) {
            var data = prepareChartData(licenseConsumptionList, isYAxisNormalized, $scope.selectedProductLicenseValues);
            var chartOptions = prepareChartOptions(isYAxisNormalized, data.yAxisMaxLimit);

            $scope.chartColors = ['#475F77', '#BCBCBC', '#777777'];
            if (!isDetailedResult()) {
                $scope.chartColors = ['#475F77', '#D74B4B', '#BCBCBC', '#777777'];
            }

            $scope.chartSeries = data.series;
            $scope.chartLabels = data.labels;
            $scope.chartData = [data.avgData];
            if (!isDetailedResult()) {
                $scope.chartData.push(data.maxData);
            }
            $scope.chartData.push(data.softLimitData);
            $scope.chartData.push(data.hardLimitData);

            $scope.chartOptions = chartOptions;
        };

        var drawRejectionsChart = function (licenseConsumptionList) {
            var labels = [], rejectionsData = {};
            var yAxisMaxLimit = 0;

            // Generate arrays for each products.
            _.each($scope.specifiedLicense.productLicenses.entry, function (productLicense) {
                rejectionsData[productLicense.key] = []
            });

            // Preparing rejection data
            _.each(licenseConsumptionList, function (entry) {
                _.each($scope.specifiedLicense.productLicenses.entry, function (productLicense) {
                    var productEntry = _.findWhere(entry.products, {name: productLicense.key});

                    var rejectionsValue = 0;
                    if (productEntry) {
                        rejectionsValue = productEntry.reject;
                    }

                    // Add the value of reject for each products one by one.
                    rejectionsData[productLicense.key].push(rejectionsValue);

                    // Find maximum y axis value from the set.
                    if (yAxisMaxLimit < rejectionsValue) {
                        yAxisMaxLimit = rejectionsValue;
                    }
                });

                var dateformat = (!isDetailedResult()) ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD HH:mm:ss';
                var dateValue = moment(entry.time).utcOffset(DateTimeConstants.OFFSET).format(dateformat);

                labels.push(dateValue);
            });

            $scope.rejectionsChartColors = ['#D74B4B', '#475F77', '#BCBCBC', '#777777', '#6685a4', '#E68E8E'];

            // Contains date values.
            $scope.rejectionsChartLabels = labels;

            // The series will be containing the product names.
            $scope.rejectionsSeries = [];
            $scope.rejectionsChartData = [];
            _.each(rejectionsData, function (rejectionsArray, name) {
                $scope.rejectionsSeries.push(name.toUpperCase());
                $scope.rejectionsChartData.push(rejectionsArray);
            });

            $scope.rejectionsChartOptions = {
                legend: {
                    display: true,
                    labels: {
                        fontColor: '#666666'
                    }
                },
                scales: {
                    yAxes: [
                        {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            ticks: {
                                beginAtZero: true,
                                min: 0,
                                max: Math.floor(yAxisMaxLimit + (yAxisMaxLimit / 100 * 10))
                            }
                        }
                    ],
                    xAxes: [
                        {
                            stacked: true,
                            display: true,
                            position: 'bottom',
                            gridLines: {
                                offsetGridLines: true
                            }
                        }
                    ]
                },
                tooltips: {
                    callbacks: {
                        label: function (tooltipItem, data) {
                            return data.datasets[tooltipItem.datasetIndex].label + ' ' + tooltipItem.yLabel;

                        }
                    }
                },
                elements: {
                    point: {
                        radius: 0,
                        hitRadius: 7,
                        hoverRadius: 7
                    }
                }
            };
        };

        var getQueryForConsumption = function () {

            var query = '';

            $scope.fromDate = $scope.specifiedInterval.getDate();
            $scope.currentDate = moment().utcOffset(DateTimeConstants.OFFSET);

            if ($scope.systemUpgraded) {
                if ($scope.specifiedInterval && $scope.specifiedInterval.key === 'specified') {

                    var startDate = $filter('date')($scope.dateFilter.startDate, 'yyyy-MM-dd');
                    var startTime = $filter('date')($scope.dateFilter.startTime, 'THH:mm:ss.000Z');
                    var endDate = $filter('date')($scope.dateFilter.endDate, 'yyyy-MM-dd');
                    var endTime = $filter('date')($scope.dateFilter.endTime, 'THH:mm:ss.000Z');
                    var start  = new Date(startDate + startTime);
                    var end = new Date(endDate + endTime);
                    $scope.fromDate = moment(start).utcOffset(DateTimeConstants.OFFSET);
                    $scope.currentDate = moment(end).utcOffset(DateTimeConstants.OFFSET);
                }
            }

            query = 'from=' + $scope.fromDate.utc().format("YYYYMMDDTHHmmss") + 'Z' + '&to=' + $scope.currentDate.utc().format("YYYYMMDDTHHmmss") + 'Z';

            if($scope.detailQueryEnabled){
                query = query + '&detail=true';
            }

            return query;
        };

        var getConsumptionHistory = function (licenseName, promiseTracker) {
            // var query = 'from='+from+'&to='+to;
            // so the value is a moment() object, format function can be used directly.
            var query = getQueryForConsumption();

            return LicenseManagerService.getConsumptionsByQuery(licenseName, query, promiseTracker).then(function (response) {
                var licenseConsumptionList = Restangular.stripRestangular(response);
                $scope.licenseConsumptionList = licenseConsumptionList;

                $log.debug('License consumption: ', licenseConsumptionList);

                $scope.showChart = true;

                drawChart(licenseConsumptionList, $scope.viewOption.isYAxisNormalized);

                // The second chart that shows rejection values as a bar chart just below the first.
                // Draw only if the selected license is shared.
                if ($scope.specifiedLicense.type === 'shared') {
                    drawRejectionsChart(licenseConsumptionList);
                }
            }, function (response) {
                $scope.showChart = false;

                $log.error('Cannot read license consumption. Error: ', response);
            });
        };

        $scope.changeViewOption = function (isYAxisNormalized) {
            drawChart($scope.licenseConsumptionList, isYAxisNormalized);
        };

        var cancelTimer = function (aFunction) {
            if (angular.isDefined(aFunction)) {
                $log.debug('Cancelled timer');
                $interval.cancel(aFunction);
                aFunction = undefined;
            }
        };

        cancelTimer($scope.rebuild);

        var buildInterval = function () {
            return $interval(function () {
                $log.debug('reloading');

                $scope.search(AdmPortalDashboardPromiseTracker);
            }, 90000);
        };

        $scope.$on('$destroy', function () {
            cancelTimer($scope.rebuild);
        });

        $scope.search = function (promiseTracker) {
            cancelTimer($scope.rebuild);
            $scope.rebuild = buildInterval();

            softLimitViolations($scope.licenseName, promiseTracker);

            getCurrentConsumption($scope.licenseName, promiseTracker).then(function () {
                getConsumptionHistory($scope.licenseName, promiseTracker);
            });
        };

    });

})();
