(function () {

    'use strict';

    angular.module('adminportal.subsystems.reporting.reports.services.rbt', []);

    var ReportingReportsRBTModule = angular.module('adminportal.subsystems.reporting.reports.services.rbt');

    ReportingReportsRBTModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.reporting.reports.services.rbt', {
            abstract: true,
            url: "/ring-back-tone",
            templateUrl: 'subsystems/reporting/reports/reporting.main.html',
            data: {
                pageHeaderKey: 'Subsystems.Reporting.ServiceReports.RBT',
                onDemandState: 'subsystems.reporting.reports.services.rbt.report',
                scheduleState: 'subsystems.reporting.reports.services.rbt.schedule',
                permissions: [
                    'SERVICES_RBT'
                ]
            },
            resolve: {
                organizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByType(0, DEFAULT_REST_QUERY_LIMIT, 'NetworkOperator,Partner');
                }
            }
        }).state('subsystems.reporting.reports.services.rbt.report', {
            url: "/on-demand",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.ondemand.html',
            controller: 'ReportingReportsRBTCtrl'
        }).state('subsystems.reporting.reports.services.rbt.schedule', {
            url: "/schedule",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.schedule.html',
            controller: 'ReportingReportsRBTScheduleCtrl'
        });

    });

    ReportingReportsRBTModule.controller('ReportingReportsRBTCtrl', function ($scope, $log, $controller, $filter, Restangular, UtilService, organizations) {
        $log.debug("ReportingReportsRBTCtrl");

        $controller('ReportingReportsAbstractCtrl', {$scope: $scope});

        var organizationList = Restangular.stripRestangular(organizations).organizations;
        $scope.organizationList = $filter('orderBy')(organizationList, ['orgType', 'name']);

        var RBT_Overview_Report = UtilService.defineReportsAsDHM(':home:vcp:RBT:RBT_Overview_Report.prpt');
        var RBT_Failure_Reason_Report = UtilService.defineReportsAsDHM(':home:vcp:RBT:RBT_Failure_Reason_Report.prpt');
        var RBT_Signature_Overview_Report = UtilService.defineReportsAsDHM(':home:vcp:RBT:RBT_Signature_Overview_Report.prpt');
        var RBT_PrayerTimes_SMS_Service_Overview_Report = UtilService.defineReportsAsDHM(':home:vcp:RBT:RBT_PrayerTimes_SMS_Service_Overview_Report.prpt');
        var RBT_Play_SystemWide_Report = UtilService.defineReportsAsDHM(':home:vcp:RBT:RBT_Play_SystemWide_Report.prpt');

        var RBT_Play_by_Partner_Report = [{name: 'ALL', url: ':home:vcp:RBT:RBT_Play_by_Partner_Report.prpt'}];
        var RBT_Play_by_Partner_per_Period_Report = UtilService.defineReportsAsDHM(':home:vcp:RBT:RBT_Play_by_Partner_per_Period_Report.prpt');

        var RBT_Play_by_Artist_Report = [{name: 'ALL', url: ':home:vcp:RBT:RBT_Play_by_Artist_Report.prpt'}];
        var RBT_Play_by_Artist_per_Period_Report = UtilService.defineReportsAsDHM(':home:vcp:RBT:RBT_Play_by_Artist_per_Period_Report.prpt');
        var RBT_Preview_by_Artist_Report = UtilService.defineReportsAsDHM(':home:vcp:RBT:RBT_Preview_by_Artist_Report.prpt');

        var RBT_Play_by_SingleTone_Report = [{name: 'ALL', url: ':home:vcp:RBT:RBT_Play_by_SingleTone_Report.prpt'}];
        var RBT_Play_by_SingleTone_per_Period_Report = UtilService.defineReportsAsDHM(':home:vcp:RBT:RBT_Play_by_SingleTone_per_Period_Report.prpt');
        var RBT_Preview_by_SingleTone_Report = [{
            name: 'ALL',
            url: ':home:vcp:RBT:RBT_Preview_by_SingleTone_Report.prpt'
        }];
        var RBT_Preview_by_SingleTone_per_Period_Report = UtilService.defineReportsAsDHM(':home:vcp:RBT:RBT_Preview_by_SingleTone_per_Period_Report.prpt');

        var RBT_CP_Based_Tone_Preview_Report = [{
            name: 'ALL',
            url: ':home:vcp:RBT:RBT_CP_Based_Tone_Preview_Report.prpt'
        }];

        $scope.csvFormat = [
            {name: 'CSV', value: 'table/csv;page-mode=stream', inline: false}
        ];

        $scope.withoutPdfFormats = [
            {name: 'HTML', value: 'table/html;page-mode=stream', inline: true},
            {name: 'CSV', value: 'table/csv;page-mode=stream', inline: false},
            {name: 'MS EXCEL', value: 'table/excel;page-mode=flow', inline: false}
        ];

        $scope.REPORTS = [
            {
                label: 'Ring Back Tone Overview Report',
                intervals: RBT_Overview_Report
            },
            {
                label: 'Ring Back Tone Failure Reason Report',
                intervals: RBT_Failure_Reason_Report
            },
            {
                label: 'Ring Back Tone Signature Overview Report',
                intervals: RBT_Signature_Overview_Report
            },
            {
                label: 'Ring Back Tone Prayer Times SMS Service Overview Report',
                intervals: RBT_PrayerTimes_SMS_Service_Overview_Report
            },
            {
                label: 'Ring Back Tone Systemwide Play Report',
                intervals: RBT_Play_SystemWide_Report
            },
            {
                label: 'Ring Back Tone Play by Partner Report',
                intervals: RBT_Play_by_Partner_Report,
                additionalFields: ['topNSelectMandatory']
            },
            {
                label: 'Ring Back Tone Play by Partner per Period Report',
                intervals: RBT_Play_by_Partner_per_Period_Report,
                additionalFields: ['topNSelectMandatory'],
                formats: $scope.csvFormat
            },
            {
                label: 'Ring Back Tone Play by Artist Report',
                intervals: RBT_Play_by_Artist_Report,
                additionalFields: ['organizationId', 'topNSelect'],
                formats: $scope.withoutPdfFormats
            },
            {
                label: 'Ring Back Tone Play by Artist per Period Report',
                intervals: RBT_Play_by_Artist_per_Period_Report,
                additionalFields: ['organizationId', 'topNSelectMandatory'],
                formats: $scope.csvFormat
            },
            {
                label: 'Ring Back Tone Preview by Artist Report',
                intervals: RBT_Preview_by_Artist_Report,
                additionalFields: ['organizationId'],
                formats: $scope.csvFormat
            },
            {
                label: 'Ring Back Tone Play by Single Tone Report',
                intervals: RBT_Play_by_SingleTone_Report,
                additionalFields: ['organizationId', 'topNSelect'],
                formats: $scope.csvFormat
            },
            {
                label: 'Ring Back Tone Play by Single Tone per Period Report',
                intervals: RBT_Play_by_SingleTone_per_Period_Report,
                additionalFields: ['organizationId', 'topNSelectMandatory'],
                formats: $scope.csvFormat
            },
            {
                label: 'Ring Back Tone Preview by Single Tone Report',
                intervals: RBT_Preview_by_SingleTone_Report,
                additionalFields: ['organizationId', 'topNSelect']
            },
            {
                label: 'Ring Back Tone Preview by Single Tone per Period Report',
                intervals: RBT_Preview_by_SingleTone_per_Period_Report,
                additionalFields: ['organizationId', 'topNSelectMandatory'],
                formats: $scope.csvFormat
            },
            {
                label: 'Ring Back Tone Preview by Partner Report',
                intervals: RBT_CP_Based_Tone_Preview_Report,
                additionalFields: ['organizationId'],
                formats: $scope.csvFormat
            }
        ];

        $scope.formatPentaho = $scope.csvFormat[0];
        $scope.reportCategory = $scope.REPORTS[0];
        $scope.interval = $scope.reportCategory.intervals[0];
        $scope.permanentParams = {};
        $scope.additionalParams = {
            organizationId: null,
            topN: 0
        };

        var checkDateRange = function (dateFieldName) {
            var start = moment($scope.dateHolder.startDate);
            var end = moment($scope.dateHolder.endDate);
            var duration = moment.duration(end.diff(start));

            UtilService.setError($scope.form, 'startDate', 'hourlyReport1DailyIntervalError', true);
            UtilService.setError($scope.form, 'startDate', 'dailyReportMonthlyIntervalError', true);
            UtilService.setError($scope.form, 'startDate', 'hourlyReport5DailyIntervalError', true);

            UtilService.setError($scope.form, 'endDate', 'hourlyReport1DailyIntervalError', true);
            UtilService.setError($scope.form, 'endDate', 'dailyReportMonthlyIntervalError', true);
            UtilService.setError($scope.form, 'endDate', 'hourlyReport5DailyIntervalError', true);

            if ($scope.interval.reportType == 'Hourly') {
                if ($scope.reportCategory.label.indexOf('per Period') > -1 && duration.asDays() > 1) {
                    UtilService.setError($scope.form, dateFieldName, 'hourlyReport1DailyIntervalError', false);
                } else if(duration.asDays() > 5) {
                    UtilService.setError($scope.form, dateFieldName, 'hourlyReport5DailyIntervalError', false);
                }
            } else if ($scope.interval.reportType == 'Daily' && duration.asMonths() > 2) {
                UtilService.setError($scope.form, dateFieldName, 'dailyReportMonthlyIntervalError', false);
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

        $scope.$watch('reportCategory', function (newValue, oldValue) {
            if (newValue) {
                $scope.formatPentaho = newValue.formats ? newValue.formats[0] : $scope.FORMATS_PENTAHO[0];
            }
        });

        $scope.topNRanges = [
            "0-1000", "1000-2000", "2000-3000", "3000-4000", "4000-5000",
            "5000-6000", "6000-7000", "7000-8000", "8000-9000", "9000-10000"
        ]
    });

    ReportingReportsRBTModule.controller('ReportingReportsRBTScheduleCtrl', function ($scope, $log, $controller, organizations) {
        $log.debug("ReportingReportsRBTScheduleCtrl");

        $controller('ReportingReportsRBTCtrl', {
            $scope: $scope,
            organizations: organizations
        });

        $controller('ReportingReportsScheduleCommonCtrl', {$scope: $scope});

        $scope.schedule.formatPentahoSchedule = $scope.csvFormat[0];

        $scope.$watch('reportCategory', function (newValue, oldValue) {
            if (newValue) {
                $scope.schedule.formatPentahoSchedule = newValue.formats ? newValue.formats[0] : $scope.FORMATS_PENTAHO_SCHEDULE[0];
            }
        });
    });

})();
