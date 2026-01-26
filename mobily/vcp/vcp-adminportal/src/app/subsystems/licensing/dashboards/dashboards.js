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
                }
            }
        });

        Chart.defaults.global.tooltips.mode = 'index';
    });

    LicensingDashboardsModule.controller('LicensingDashboardsCtrl', function ($scope, $log, $filter, $interval, $timeout, $translate, Restangular, LicenseManagerService,
                                                                              DateTimeConstants, AdmPortalDashboardPromiseTracker, allLicenses) {
        $log.debug("LicensingDashboardsCtrl");

        $scope.chartData = [];
        $scope.rejectionsChartData = [];

        $scope.allLicenses = Restangular.stripRestangular(allLicenses);

        $scope.exportOptions = {columns: []};

        $scope.viewOption = {
            isYAxisNormalized: false
        };

        var getMomentDateSubtracted = function (string) {
            return function () {
                return moment().utcOffset(DateTimeConstants.OFFSET).subtract(1, string);
            };
        };

        $scope.INTERVALS = [
            {label: 'Last Hour', key: 'hours', getDate: getMomentDateSubtracted('hours')},
            {label: 'Last Day', key: 'days', getDate: getMomentDateSubtracted('days')},
            {label: 'Last Week', key: 'weeks', getDate: getMomentDateSubtracted('weeks')},
            {label: 'Last Month', key: 'months', getDate: getMomentDateSubtracted('months')},
            {label: 'Last Year', key: 'years', getDate: getMomentDateSubtracted('years')}
        ];

        $scope.licenseName = 'Specified License';
        $scope.specifiedInterval = $scope.INTERVALS[0];

        // This dummy variable is using to keep key values of products for shared licenses.
        $scope.selectedProductLicenseValues = [];
        $scope.isProductSelected = function (productKey) {
            return _.contains($scope.selectedProductLicenseValues, productKey);
        };

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

            addExportOption('time', 'Subsystems.Licensing.Dashboard.ConsumptionTime', {
                name: 'date',
                params: ['yyyy-MM-dd HH:mm', DateTimeConstants.OFFSET]
            });

            // Add selected production keys
            if (selectedProducts) {
                _.each(selectedProducts, function (selectedProduct) {
                    // Add columns for each products
                    addExportOption('min', 'Subsystems.Licensing.Dashboard.MinConsumption', null, selectedProduct);
                    addExportOption('max', 'Subsystems.Licensing.Dashboard.MaxConsumption', null, selectedProduct);
                    addExportOption('avg', 'Subsystems.Licensing.Dashboard.AvgConsumption', null, selectedProduct);
                    addExportOption('reject', 'Subsystems.Licensing.Dashboard.Violations', null, selectedProduct);
                });
            }

            // Add general columns if there is no shared license products.
            addExportOption('min', 'Subsystems.Licensing.Dashboard.MinConsumption');
            addExportOption('max', 'Subsystems.Licensing.Dashboard.MaxConsumption');
            addExportOption('avg', 'Subsystems.Licensing.Dashboard.AvgConsumption');
            addExportOption('reject', 'Subsystems.Licensing.Dashboard.Violations');

            // Common columns
            addExportOption('soft', 'Subsystems.Licensing.Dashboard.SoftLimitSetting');
            addExportOption('softreject', 'Subsystems.Licensing.Dashboard.SoftLimitViolations');
            addExportOption('hard', 'Subsystems.Licensing.Dashboard.HardLimitSetting');
            addExportOption('hardreject', 'Subsystems.Licensing.Dashboard.HardLimitViolations');
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

        $scope.chooseLicense = function (chosenLicense) {
            // Clean the selected product names.
            $scope.selectedProductLicenseValues = [];
            $scope.allProductLicenseValues = [];

            $scope.specifiedLicense = chosenLicense;
            $scope.licenseName = $scope.specifiedLicense.name;

            // Add all production keys if it is a shared license by default.
            if ($scope.specifiedLicense.productLicenses && $scope.specifiedLicense.productLicenses.entry.length > 1) {
                _.each($scope.specifiedLicense.productLicenses.entry, function (productLicense) {
                    $scope.selectedProductLicenseValues.push(productLicense.key);
                });

                $scope.selectedProductLicenseValues = _.sortBy($scope.selectedProductLicenseValues);
                $scope.allProductLicenseValues = angular.copy($scope.selectedProductLicenseValues);
            }

            cancelTimer($scope.rebuild);

            $scope.showCurrentStats = false;
            $scope.showChart = false;
        };

        $scope.chooseInterval = function (chosenInterval) {
            $scope.specifiedInterval = chosenInterval;

            cancelTimer($scope.rebuild);

            $scope.showCurrentStats = false;
            $scope.showChart = false;
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

        var prepareChartData = function (licenseConsumptionList, isYAxisNormalized, selectedProducts) {
            var series = ['Avg Usage', 'Soft Limit', 'Hard Limit'];

            if ($scope.specifiedInterval.key !== 'hours') {
                series = ['Avg Usage', 'Max Usage', 'Soft Limit', 'Hard Limit'];
            }

            var labels = [], maxData = [], avgData = [], softLimitData = [], hardLimitData = [];
            var yAxisMaxLimit = 0;
            $scope.licenseConsumptionExportList = [];

            // Prepare export options according to license and product selection.
            prepareExportOptions(selectedProducts);

            // Preparing maximum and average consumption data
            _.each(licenseConsumptionList, function (entry) {
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

                    // Prepare exportable data from the original list by selected product
                    var licenseConsumptionExportData = prepareExportDataByProduct(entry, selectedProducts);
                    $scope.licenseConsumptionExportList.push(licenseConsumptionExportData);
                } else {
                    // Prepare exportable data from the original list.
                    $scope.licenseConsumptionExportList.push(entry);
                }

                var dateValue = moment(entry.time).utcOffset(DateTimeConstants.OFFSET).format('YYYY-MM-DD HH:mm');

                // Remove the precision numbers.
                entry.avg = Number(Number(entry.avg).toFixed(0));

                var avgValue = (isYAxisNormalized ? Number((entry.avg / entry.hard) * 100).toFixed(0) : entry.avg);
                var maxValue = (isYAxisNormalized ? Number((entry.max / entry.hard) * 100).toFixed(0) : entry.max);

                var softLimitValue = (isYAxisNormalized ? Number(Number((entry.soft / entry.hard) * 100).toFixed(0)) : entry.soft);
                var hardLimitValue = (isYAxisNormalized ? 100 : entry.hard);

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
            // If the increaser lesser than 100 than found the nearest upper integer value of the dividing 1000 and calculate the new limit with it.
            var calculatedYMax = (yMaxIncreaser <= 100 ? (Math.ceil(yAxisMaxLimit / 1000) * 1000 + 500) : yAxisMaxLimit + yMaxIncreaser);
            var yMax = (isYAxisNormalized ? 120 : calculatedYMax);

            var unitLabel = (isYAxisNormalized ? '%' : ' tpm');

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
                        radius: 4,
                        hitRadius: 7,
                        hoverRadius: 7,
                        borderColor: 'rgba(0, 0, 0, 0.9)'
                    }
                }
            };

            return chartOptions;
        };

        var drawChart = function (licenseConsumptionList, isYAxisNormalized) {
            var data = prepareChartData(licenseConsumptionList, isYAxisNormalized, $scope.selectedProductLicenseValues);
            var chartOptions = prepareChartOptions(isYAxisNormalized, data.yAxisMaxLimit);

            $scope.chartColors = ['#475F77', '#BCBCBC', '#777777'];
            if ($scope.specifiedInterval.key !== 'hours') {
                $scope.chartColors = ['#475F77', '#D74B4B', '#BCBCBC', '#777777'];
            }

            $scope.chartSeries = data.series;
            $scope.chartLabels = data.labels;
            $scope.chartData = [data.avgData];
            if ($scope.specifiedInterval.key !== 'hours') {
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

                var dateValue = moment(entry.time).utcOffset(DateTimeConstants.OFFSET).format('YYYY-MM-DD HH:mm');

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

        var getConsumptionHistory = function (licenseName, promiseTracker) {
            // var query = 'from='+from+'&to='+to;
            // so the value is a moment() object, format function can be used directly.
            $scope.fromDate = $scope.specifiedInterval.getDate();
            $scope.currentDate = moment().utcOffset(DateTimeConstants.OFFSET);
            var query = 'from=' + $scope.fromDate.utc().format("YYYYMMDDTHHmmss") + 'Z' + '&to=' + $scope.currentDate.utc().format("YYYYMMDDTHHmmss") + 'Z';

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

            getCurrentConsumption($scope.licenseName, promiseTracker).then(function () {
                getConsumptionHistory($scope.licenseName, promiseTracker);
            });
        };

    });

})();
