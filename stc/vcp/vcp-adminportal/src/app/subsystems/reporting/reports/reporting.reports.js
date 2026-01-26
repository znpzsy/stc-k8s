(function () {

    'use strict';

    angular.module('adminportal.subsystems.reporting.reports', [
        // Product Reports
        "adminportal.subsystems.reporting.reports.products.smsc",
        "adminportal.subsystems.reporting.reports.products.antispamsms",
        "adminportal.subsystems.reporting.reports.products.mmsc",
        "adminportal.subsystems.reporting.reports.products.usc",
        "adminportal.subsystems.reporting.reports.products.ussi",
        "adminportal.subsystems.reporting.reports.products.smsf",
        // DSP Related Product Reports
        "adminportal.subsystems.reporting.reports.products.apimanager",
        "adminportal.subsystems.reporting.reports.products.bulkmessaging",
        "adminportal.subsystems.reporting.reports.products.obivr",
        "adminportal.subsystems.reporting.reports.products.charginggw",
        "adminportal.subsystems.reporting.reports.products.messaginggw",
        // Service Reports
        "adminportal.subsystems.reporting.reports.services.collectcall",
        "adminportal.subsystems.reporting.reports.services.mca",
        "adminportal.subsystems.reporting.reports.services.cmb",
        "adminportal.subsystems.reporting.reports.services.voicemail",
        "adminportal.subsystems.reporting.reports.services.voicesms",
        "adminportal.subsystems.reporting.reports.services.rbt",
        // DSP Related Subsystem Reports
        "adminportal.subsystems.reporting.reports.subsystems.ssm",
        "adminportal.subsystems.reporting.reports.invoicereports.invoice",
        // Others
        "adminportal.subsystems.reporting.reports.reporttemplate"
    ]);

    var ReportingReportsModule = angular.module('adminportal.subsystems.reporting.reports');

    ReportingReportsModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.reporting.reports', {
            abstract: true,
            url: "/reports",
            template: "<div ui-view></div>"
        }).state('subsystems.reporting.reports.dashboards', {
            url: "/dashboard",
            templateUrl: 'subsystems/reporting/reports/reporting.reports.html'
        }).state('subsystems.reporting.reports.products', {
            url: "/product-reports",
            templateUrl: 'subsystems/reporting/reports/reporting.reports.html',
            data: {
                pageParentHeaderKey: 'Subsystems.Reporting.ProductReports.Title'
            }
        }).state('subsystems.reporting.reports.services', {
            url: "/service-reports",
            templateUrl: 'subsystems/reporting/reports/reporting.reports.html',
            data: {
                pageParentHeaderKey: 'Subsystems.Reporting.ServiceReports.Title'
            }
        }).state('subsystems.reporting.reports.subsystems', {
            url: "/subsystem-reports",
            templateUrl: 'subsystems/reporting/reports/reporting.reports.html',
            data: {
                pageParentHeaderKey: 'Subsystems.Reporting.SubsystemReports.Title'
            }
        }).state('subsystems.reporting.reports.revenuereports', {
            url: "/revenue-reports",
            templateUrl: 'subsystems/reporting/reports/reporting.reports.html',
            data: {
                pageParentHeaderKey: 'Subsystems.Reporting.RevenueReports.Title'
            }
        }).state('subsystems.reporting.reports.workflows', {
            url: "/workflows",
            templateUrl: 'subsystems/reporting/reports/reporting.reports.html',
            data: {
                pageParentHeaderKey: 'Subsystems.Reporting.WorkflowsReports.Title'
            }
        });

    });

    ReportingReportsModule.controller('ReportingReportsAbstractCtrl', function ($scope, $state, $log, $q, $timeout, $controller, $filter, $window, $http,UtilService, $translate, notification,
                                                                                DateTimeConstants, PentahoRestangular, AdmPortalMainPromiseTracker, ReportingExportService) {
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
            {name: 'MS EXCEL', value: 'table/excel;page-mode=flow', inline: false}
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
            if ($state.includes($state.current.data.onDemandState)) {
                $scope.getTemplatesForUserAccountByCategory($scope.interval);
                $scope.formatPentaho = reportCategory.reportFormats ? reportCategory.reportFormats[0] : $scope.FORMATS_PENTAHO[0];
            } else {
                $scope.schedule.formatPentahoSchedule = reportCategory.reportScheduleFormats ? reportCategory.reportScheduleFormats[0] : $scope.FORMATS_PENTAHO_SCHEDULE[0];
            }

            $scope.$emit('ReportCategoryChanged', $scope.reportCategory);
        };

        $scope.exportEdrReport = function (reportId, date, additionalParams) {
            var srcUrl = '/smsc-edr-reporting-rest/edr2report/report?engineName=SMSC';
            srcUrl += '&reportId=' + reportId;
            srcUrl += '&day=' + $filter('date')(date, 'yyyyMMdd')

            _.each(additionalParams, function (value, name) {
                if (!_.isUndefined(value) && value !== null) {
                    srcUrl += '&' + name + '=' + value;
                }
            });

            srcUrl += '&ts=' + new Date().getTime();

            $log.debug('Downloading SMSC Edr records by a specific report type. URL: ', srcUrl);

            ReportingExportService.showReport(srcUrl, 'CSV');
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
            srcUrl += encodeURIComponent(interval.url) + '/generatedContent?';
            srcUrl += 'ts=' + new Date().getTime();
            srcUrl += '&startDate=' + startDateTimeStr;
            srcUrl += '&endDate=' + endDateTimeStr;
            srcUrl += '&output-target=' + format.value;
            srcUrl += '&accepted-page=-1';
            srcUrl += '&showParameters=false';
            srcUrl += '&htmlProportionalWidth=true';

            if (!_.isUndefined(interval.reportType)) {
                srcUrl += '&reportType=' + interval.reportType;
                // For all SMSC Peak reports, the collection should be peak, regardless of the interval selection.
                if(interval.url.includes('vcp:SMSC') && interval.url.includes('_Peak_')) {
                    srcUrl += '&collection=statistics';

                } else {

                    var iscurrentDate = moment(dateFilter.startDate).isSame(new Date(), "day");

                    if (iscurrentDate) {
                        srcUrl += '&collection=statistics';
                    } else if (interval.reportType === 'Hourly') {
                        srcUrl += '&collection=statistics_hourly';
                    } else if (interval.reportType === 'Daily' || interval.reportType === 'Monthly') {
                        srcUrl += '&collection=statistics_daily';
                    }
                }
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
                if (!_.isUndefined(value) && value !== null && value.toString().trim() !== '') {
                        srcUrl += '&' + name + '=' + value;
                }
            });

            if (!_.isUndefined(reportCategory.constantParams)) {
                srcUrl += '&' + jQuery.param(reportCategory.constantParams);
            }


            $timeout(function () {
                var deferredPentahoAuth = $q.defer();

                AdmPortalMainPromiseTracker.addPromise(deferredPentahoAuth.promise);

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

        $scope.export = function (reportCategory, interval, format, dateHolder, permanentParams, additionalParams) {
            try {
                // All limits temporarily removed.
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
        if ($state.includes($state.current.data.onDemandState)) {
            $controller('ReportingReportsReportTemplateCtrl', {$scope: $scope});
        }

        var checkDateRange = function (dateFieldName) {
            var start = moment($scope.dateHolder.startDate);
            var end = moment($scope.dateHolder.endDate);
            var duration = moment.duration(end.diff(start));

            UtilService.setError($scope.form, 'startDate', 'hourlyReportIntervalError', true);
            UtilService.setError($scope.form, 'startDate', 'dailyReportIntervalError', true);
            UtilService.setError($scope.form, 'startDate', 'monthlyReport6MonthlyIntervalError', true);

            UtilService.setError($scope.form, 'endDate', 'hourlyReportIntervalError', true);
            UtilService.setError($scope.form, 'endDate', 'dailyReportIntervalError', true);
            UtilService.setError($scope.form, 'endDate', 'monthlyReport6MonthlyIntervalError', true);

            // Below reports include crosstab control.
            // Therefore, the range of these reports is different from the other reports.
            var customReports = ["RBT_Play_by_Partner_per_Period_Report","RBT_Play_by_SingleTone_per_Period_Report","RBT_Play_by_Artist_per_Period_Report"]
            var dayCount = 31;
            var hourCount = 48

            _.each(customReports, function (customReport) {
                if (s.contains($scope.interval.url,customReport)){
                    hourCount=24,
                    dayCount=2
                }
            });

            $scope.dayCount = dayCount;
            $scope.hourCount = hourCount;

            if ($scope.interval.reportType == 'Hourly' && duration.asHours() > hourCount) {
                UtilService.setError($scope.form, dateFieldName, 'hourlyReportIntervalError', false);
            } else if ($scope.interval.reportType == 'Daily' && duration.asDays() > dayCount) {
                UtilService.setError($scope.form, dateFieldName, 'dailyReportIntervalError', false);
            } else if ($scope.interval.reportType == 'Monthly' && duration.asMonths() > 6) {
                UtilService.setError($scope.form, dateFieldName, 'monthlyReport6MonthlyIntervalError', false);
            }
        };

        $scope.$watch('interval', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                checkDateRange('startDate');
            }
        });

        $scope.$watch('dateHolder.startDate', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                checkDateRange('startDate');
            }
        });

        $scope.$watch('dateHolder.endDate', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                checkDateRange('endDate');
            }
        });
    });

    ReportingReportsModule.controller('ReportingReportsScheduleCommonCtrl', function ($scope, $log, $controller, $filter, $translate, notification, UtilService, DateTimeConstants, PentahoApiService,
                                                                                      REPORTING_SCHEDULE_RECURRENCE, REPORTING_QUALIFIERS, DAYS_OF_WEEK) {
        $log.debug("ReportingReportsScheduleCommonCtrl");

        $scope.dateHolder.startDate = new Date();
        $scope.dateHolder.startTime = new Date();

        $scope.startDateOptions = _.clone($scope.dateOptions);
        $scope.startDateOptions.minDate = null;
        $scope.startDateOptions.maxDate = null;

        $scope.endDateOptions = _.clone($scope.dateOptions);
        $scope.endDateOptions.minDate = $scope.dateHolder.startDate;
        $scope.endDateOptions.maxDate = null;

        // Remove some of the formats from the scheduling format selection array.
        $scope.FORMATS_PENTAHO_SCHEDULE = _.without($scope.FORMATS_PENTAHO, _.findWhere($scope.FORMATS_PENTAHO, {name: 'HTML'}));

        $scope.REPORTING_SCHEDULE_RECURRENCE = REPORTING_SCHEDULE_RECURRENCE;
        $scope.REPORTING_QUALIFIERS = REPORTING_QUALIFIERS;
        $scope.DAYS_OF_WEEK = DAYS_OF_WEEK;

        var scheduleName = $scope.reportCategory.label;
        $scope.schedule = {
            scheduleName: scheduleName,
            recurrence: $scope.REPORTING_SCHEDULE_RECURRENCE[0],
            qualifier: $scope.REPORTING_QUALIFIERS[0],
            dayOfWeek: $scope.DAYS_OF_WEEK[0],
            dayOfWeekRecurrences: 1,
            isEndDate: false,
            formatPentahoSchedule: $scope.FORMATS_PENTAHO_SCHEDULE[0]
        };

        // Listen report category changes in order to set schedule name from interval url.
        $scope.$on('ReportCategoryChanged', function (event, reportCategory) {
            $scope.schedule.scheduleName = reportCategory.label;
        });

        $scope.selectDayOfWeek = function (day) {
            $scope.schedule.dayOfWeek = day;
        };

        $scope.selectQualifier = function (qualifier) {
            $scope.schedule.qualifier = qualifier;
        };

        $scope.save = function (reportCategory, interval, schedule, dateHolder, permanentParams, additionalParams) {
            var reportUrl = interval.url.replace(/:/g, '/');

            var jobTriggerName, jobTriggerObj;
            var reportType, scheduleDataFrame;

            if (schedule.recurrence === 'DAILY') {
                reportType = 'Hourly';
                scheduleDataFrame = 'LastDay';

                if (schedule.recurrencePattern === 'xday') {
                    jobTriggerName = 'simpleJobTrigger';

                    var dailyRepeatIntervalDaySecond = (Number(schedule.dailyRepeatIntervalDay) * 24 * 60 * 60);
                    jobTriggerObj = {
                        repeatInterval: dailyRepeatIntervalDaySecond,
                        repeatCount: -1
                    };
                } else {
                    jobTriggerName = 'complexJobTrigger';

                    jobTriggerObj = {
                        daysOfWeek: ["1", "2", "3", "4", "5"]
                    };
                }
            } else if (schedule.recurrence === 'WEEKLY') {
                reportType = 'Daily';
                scheduleDataFrame = 'LastWeek';
                jobTriggerName = 'complexJobTrigger';

                jobTriggerObj = {
                    daysOfWeek: [String(schedule.dayOfWeekRecurrences - 1)]
                };
            } else if (schedule.recurrence === 'MONTHLY') {
                reportType = 'Daily';
                scheduleDataFrame = 'LastMonth';
                jobTriggerName = 'complexJobTrigger';

                if (schedule.recurrencePattern === 'day') {
                    jobTriggerObj = {
                        daysOfMonth: [String(schedule.dayOfMonthRecurrences)]
                    };
                } else {
                    jobTriggerObj = {
                        weeksOfMonth: [String(schedule.qualifier.id)],
                        daysOfWeek: [String(schedule.dayOfWeek.id - 1)]
                    };
                }
            }

            // Job recurrence
            jobTriggerObj.uiPassParam = schedule.recurrence;

            // Date time preparation
            jobTriggerObj.startTime = $filter('date')(dateHolder.startDate, 'yyyy-MM-dd\'T\'HH:mm:ss.sss' + DateTimeConstants.OFFSET_WITH_COLON);
            // If end date enabled then put a variable for it.
            jobTriggerObj.endTime = schedule.isEndDate ? $filter('date')(dateHolder.endDate, 'yyyy-MM-dd\'T\'HH:mm:ss.sss' + DateTimeConstants.OFFSET_WITH_COLON) : null;

            // Job parameters prepare method
            var createParameterString = function (name, value) {
                return '{ "name": "' + name + '", "stringValue": [ "' + value + '" ], "type": "string" }';
            };

            var additionalParamsJSONArr = [];

            // If there are some category specific permanent parameters, add them to the main permanent parameters object.
            if (reportCategory.permanentParams) {
                permanentParams = _.extend(permanentParams, reportCategory.permanentParams);
            }

            // Prepare permanent parameters to add
            if (permanentParams) {
                _.each(permanentParams, function (value, key) {
                    if (value) {
                        additionalParamsJSONArr.push(createParameterString(key, value));
                    }
                });
            }

            // Prepare constant parameters of the report category to add
            if (reportCategory.constantParams) {
                _.each(reportCategory.constantParams, function (value, key) {
                    if (value) {
                        additionalParamsJSONArr.push(createParameterString(key, value));
                    }
                });
            }

            // Prepare additional parameters to add
            if (additionalParams) {
                _.each(additionalParams, function (value, key) {
                    if (value) {
                        additionalParamsJSONArr.push(createParameterString(key, value));
                    }
                });
            }

            var additionalParamsJSONStr = '';
            if (additionalParamsJSONArr.length > 0) {
                additionalParamsJSONStr = ', ' + additionalParamsJSONArr.join(',');
            }

            // Add all items to the main string and prepare latest job parameters object string
            var jobParametersJSONStr = '"jobParameters": [ ' +
                createParameterString('reportType', reportType) + ', ' +
                createParameterString('scheduleDataFrame', scheduleDataFrame) + ', ' +
                createParameterString('output-target', schedule.formatPentahoSchedule.value) + ', ' +
                createParameterString('accepted-page', '0') + ', ' +
                createParameterString('showParameters', 'true') + ', ' +
                createParameterString('renderMode', 'XML') + ', ' +
                createParameterString('htmlProportionalWidth', 'false') + ', ' +
                // Email parameters
                createParameterString('_SCH_EMAIL_TO', schedule.mailTo) + ', ' +
                createParameterString('_SCH_EMAIL_CC', '') + ', ' +
                createParameterString('_SCH_EMAIL_BCC', '') + ', ' +
                createParameterString('_SCH_EMAIL_SUBJECT', schedule.mailSubject) + ', ' +
                createParameterString('_SCH_EMAIL_ATTACHMENT_NAME', schedule.scheduleName) + ', ' +
                createParameterString('_SCH_EMAIL_MESSAGE', (schedule.mailText ? schedule.mailText : '')) +
                // Additional parameters
                additionalParamsJSONStr +
                ' ]';

            // The main payload is preparing to convert JSON object.
            var payloadJSONStr = '{ ' +
                '"jobName": "' + schedule.scheduleName + '", ' +
                '"inputFile": "' + reportUrl + '", ' +
                '"outputFile": "' + PentahoApiService.OUTPUT_FILE + '", ' +
                '' + jobParametersJSONStr +
                ' }';

            var payloadJSON = JSON.parse(payloadJSONStr);
            payloadJSON[jobTriggerName] = jobTriggerObj;

            PentahoApiService.createJob(payloadJSON).then(function (response) {
                $log.debug('Pentaho report job created successfully: ', payloadJSON, ', Response: ', response);

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $scope.go('subsystems.reporting.schedules');
            }, function (response) {
                $log.debug('Cannot create Pentaho report job: ', payloadJSON, ', Response: ', response);

                notification({
                    type: 'warning',
                    text: response.data
                });
            });

        };

    });

})();
