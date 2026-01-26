(function () {

    'use strict';

    angular.module('partnerportal.partner-info.reporting.reports', [
        "partnerportal.partner-info.reporting.reports.apimanager",
        "partnerportal.partner-info.reporting.reports.dcb",
        "partnerportal.partner-info.reporting.reports.messaginggw",
        "partnerportal.partner-info.reporting.reports.subscription",
        "partnerportal.partner-info.reporting.reports.revenueshare",
        "partnerportal.partner-info.reporting.reports.invoice",
        // Others
        "partnerportal.partner-info.reporting.reports.reporttemplate"
    ]);

    var ReportingReportsModule = angular.module('partnerportal.partner-info.reporting.reports');

    ReportingReportsModule.config(function ($stateProvider) {

        $stateProvider.state('partner-info.reporting.reports', {
            abstract: true,
            url: "/reports",
            template: '<div ui-view></div>'
        });

    });

    ReportingReportsModule.controller('ReportingReportsAbstractCtrl', function ($scope, $log, $q, $timeout, $controller, $filter, $window, $http, $translate, notification,
                                                                                DateTimeConstants, PentahoRestangular, PartnerPortalMainPromiseTracker, ReportingExportService) {
        $log.debug("ReportingReportsAbstractCtrl");

        $scope.pentaho = {
            restangular: PentahoRestangular,
            path: '/pentaho/'
        };

        // Calling the date time controller which initializes date/time pickers and necessary functions.
        $controller('GenericDateTimeCtrl', {$scope: $scope});

        $scope.FORMATS_PENTAHO = [
            {name: 'PDF', value: 'pageable/pdf', inline: true},
            {name: 'HTML', value: 'table/html;page-mode=stream', inline: true},
            {name: 'CSV', value: 'table/csv;page-mode=stream', inline: false},
            {name: 'MS EXCEL', value: 'table/excel;page-mode=flow', inline: false},
            {
                name: 'EXCEL 2007',
                value: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;page-mode=flow',
                inline: false
            }
        ];
        $scope.formatPentaho = $scope.FORMATS_PENTAHO[0];

        $scope.permanentParams = {};
        $scope.additionalParams = {};

        $scope.changeReportCategory = function (reportCategory) {
            $scope.reportCategory = reportCategory;
            $scope.interval = reportCategory.intervals[0];

            // Reset all parameters' value.
            $scope.additionalParams = _.mapObject($scope.additionalParams, function (val, key) {
                return null;
            });

            // Update the template list by user account.
            $scope.getTemplatesForUserAccountByCategory($scope.interval);

            $scope.formatPentaho = reportCategory.reportFormats ? reportCategory.reportFormats[0] : $scope.FORMATS_PENTAHO[0];

            $scope.$emit('ReportCategoryChanged', $scope.reportCategory);
        };

        var exportPentaho = function (reportCategory, interval, format, dateFilter, permanentParams, additionalParams) {
            var startDate = $filter('date')(dateFilter.startDate, 'yyyy-MM-dd');
            var endDate = $filter('date')(dateFilter.endDate, 'yyyy-MM-dd');
            var startTime = '00:00';
            var endTime = '23:59';
            if (interval.name === 'MINUTELY' || interval.name === 'HOURLY' || interval.name === 'ALL') {
                startTime = $filter('date')(dateFilter.startTime, 'HH:mm');
                endTime = $filter('date')(dateFilter.endTime, 'HH:mm');
            }

            var startDateTimeStr = startDate + ' ' + startTime;
            var endDateTimeStr = endDate + ' ' + endTime;

            var srcUrl = 'api/repos/';
            srcUrl += encodeURIComponent(interval.url) + '/generatedContent?1=1';

            // Add the random nanotime parameter (which is using for by-passing cache) if the end date after current time.
            if (moment(endDateTimeStr).isAfter(new Date())) {
                srcUrl += '&ts=' + new Date().getTime();
            }

            if (interval.name === 'MONTHLY_SPECIAL') {
                var termDate = moment(dateFilter.startDate).startOf('month').format('YYYY-MM-DD');

                srcUrl += '&termDate=' + termDate;
            } else if (interval.name === 'MONTHLY2_SPECIAL') {
                var billingPeriod = moment(dateFilter.startDate).startOf('month').format('YYYYMM');

                srcUrl += '&billingPeriod=' + billingPeriod;
            } else if (interval.name === 'DAILY_SPECIAL') {
                srcUrl += '&startDate=' + startDate + ' ' + startTime;
                srcUrl += '&endDate=' + startDate + ' ' + endTime;
            } else {
                srcUrl += '&startDate=' + startDateTimeStr;
                srcUrl += '&endDate=' + endDateTimeStr;
            }

            srcUrl += '&output-target=' + format.value;
            srcUrl += '&accepted-page=-1';
            srcUrl += '&showParameters=false';
            srcUrl += '&htmlProportionalWidth=true';

            if (!_.isUndefined(interval.reportType)) {
                srcUrl += '&reportType=' + interval.reportType;
            }

            // If there are some category specific permanent parameters, add them to the main permanent parameters object.
            if (reportCategory.permanentParams) {
                permanentParams = _.extend(permanentParams, reportCategory.permanentParams);
            }

            _.each(permanentParams, function (value, name) {
                if (!_.isUndefined(value) && value !== null) {
                    srcUrl += '&' + name + '=' + value;
                }
            });

            _.each(additionalParams, function (value, name) {
                if (!_.isUndefined(value) && value !== null) {
                    srcUrl += '&' + name + '=' + value;
                }
            });

            if (!_.isUndefined(reportCategory.constantParams)) {
                srcUrl += '&' + jQuery.param(reportCategory.constantParams);
            }

            $timeout(function () {
                var deferredPentahoAuth = $q.defer();

                PartnerPortalMainPromiseTracker.addPromise(deferredPentahoAuth.promise);

                // Get session id of the pentaho first and call the report url with that cookie.
                $scope.pentaho.restangular.one('Home').get().then(function (response) {
                    $log.debug('Report download the Pentaho URL: ', srcUrl);

                    ReportingExportService.showReport($scope.pentaho.path + srcUrl, format.name);

                    deferredPentahoAuth.resolve();
                }, function (error) {
                    if (error.status === 401) {
                        $timeout(function () {
                            $scope.pentaho.restangular.one('Home').get().then(function (response) {
                                $log.debug('Report download the Pentaho URL again...: ', srcUrl);

                                ReportingExportService.showReport($scope.pentaho.path + srcUrl, format.name);

                                deferredPentahoAuth.resolve();
                            }, function (error) {
                                deferredPentahoAuth.resolve();
                            });
                        }, 2000);
                    } else {
                        deferredPentahoAuth.resolve();
                    }
                });
            }, 0);
        };

        var validateDateRangesAccordingToReportType = function (intervalName, dateFilter) {
            var startDate = $filter('date')(dateFilter.startDate, 'yyyy/MM/dd');
            var startTime = $filter('date')(dateFilter.startTime, 'HH:mm:ss');
            var endDate = $filter('date')(dateFilter.endDate, 'yyyy/MM/dd');
            var endTime = $filter('date')(dateFilter.endTime, 'HH:mm:ss');
            var startDateTime = new Date($filter('date')(dateFilter.startDate, 'yyyy-MM-dd') + 'T00:00:00.000Z');
            var endDateTime = new Date($filter('date')(dateFilter.endDate, 'yyyy-MM-dd') + 'T23:59:59.999Z');

            var diffMs, diffDays;
            switch (intervalName) {
                case 'DAILY':
                    diffMs = endDateTime - startDateTime;
                    diffDays = Math.round(diffMs / 86400000); // days

                    if (diffDays > 31) {
                        throw {message: $translate.instant('CommonMessages.DailyReportIntervalError', {days: 31})};
                    }

                    break;
                case 'HOURLY':
                    startDateTime = new Date(startDate + ' ' + startTime);
                    endDateTime = new Date(endDate + ' ' + endTime);

                    diffMs = endDateTime - startDateTime;
                    diffHrs = Math.round(diffMs / 3600 / 1000); //in hours

                    if (diffHrs > 72) {
                        throw {message: $translate.instant('CommonMessages.HourlyReportIntervalError', {hours: 72})};
                    }

                    break;
                case 'MONTHLY':
                    diffMs = endDateTime - startDateTime;
                    diffDays = Math.round(diffMs / 86400000); // days

                    if (diffDays > (365 * 2)) {
                        throw {message: $translate.instant('CommonMessages.MonthlyReportIntervalError', {years: 2})};
                    }

                    break;
            }
        };

        $scope.export = function (reportCategory, interval, format, dateHolder, permanentParams, additionalParams) {
            try {
                // All limits temporarily removed.
                //validateDateRangesAccordingToReportType(interval.name, dateFilter);

                exportPentaho(reportCategory, interval, format, dateHolder, permanentParams, additionalParams);
            } catch (exception) {
                notification({
                    type: 'warning',
                    text: exception.message
                });
            }
        };

        $scope.isParamActive = function (additionalParams, paramName) {
            return _.contains(additionalParams, paramName);
        };

        // Calling the template controller.
        $controller('ReportingReportsReportTemplateCtrl', {$scope: $scope});
    });

})();
