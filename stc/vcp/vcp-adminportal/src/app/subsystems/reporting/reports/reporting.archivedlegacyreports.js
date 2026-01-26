(function () {

    'use strict';

    angular.module('adminportal.subsystems.reporting.reports.archivedlegacyreports', []);

    var ReportingReportsArchivedLegacyReportsModule = angular.module('adminportal.subsystems.reporting.reports.archivedlegacyreports');

    ReportingReportsArchivedLegacyReportsModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.reporting.reports.archivedlegacyreports', {
            url: "/archived-legacy-reports",
            templateUrl: 'subsystems/reporting/reports/reporting.reports.html',
            data: {
                pageParentHeaderKey: 'Subsystems.Reporting.ArchivedLegacyReports.Title'
            }
        })

        // Other report sub sections.
        // Audit & RA
        $stateProvider.state('subsystems.reporting.reports.archivedlegacyreports.auditra', {
            abstract: true,
            url: "/audit-and-ra",
            templateUrl: 'subsystems/reporting/reports/reporting.main.html',
            data: {
                onDemandState: 'subsystems.reporting.reports.archivedlegacyreports.auditra.report',
                pageHeaderKey: 'Subsystems.Reporting.ArchivedLegacyReports.AuditRA'
            }
        }).state('subsystems.reporting.reports.archivedlegacyreports.auditra.report', {
            url: "/report",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.archivedreports.html',
            controller: 'ReportingReportsArchivedLegacyReportsAuditRACtrl',
            data: {
                permissions: [
                    'READ_REPORTS_ONDEMAND'
                ]
            }
        });

        // CP & SP
        $stateProvider.state('subsystems.reporting.reports.archivedlegacyreports.cpsp', {
            abstract: true,
            url: "/cp-and-sp",
            templateUrl: 'subsystems/reporting/reports/reporting.main.html',
            data: {
                onDemandState: 'subsystems.reporting.reports.archivedlegacyreports.cpsp.report',
                pageHeaderKey: 'Subsystems.Reporting.ArchivedLegacyReports.CPSP'
            }
        }).state('subsystems.reporting.reports.archivedlegacyreports.cpsp.report', {
            url: "/report",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.archivedreports.html',
            controller: 'ReportingReportsArchivedLegacyReportsCPSPCtrl',
            data: {
                permissions: [
                    'READ_REPORTS_ONDEMAND'
                ]
            }
        });

        // RBT
        $stateProvider.state('subsystems.reporting.reports.archivedlegacyreports.rbt', {
            abstract: true,
            url: "/rbt",
            templateUrl: 'subsystems/reporting/reports/reporting.main.html',
            data: {
                onDemandState: 'subsystems.reporting.reports.archivedlegacyreports.rbt.report',
                pageHeaderKey: 'Subsystems.Reporting.ArchivedLegacyReports.RBT'
            }
        }).state('subsystems.reporting.reports.archivedlegacyreports.rbt.report', {
            url: "/report",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.archivedreports.html',
            controller: 'ReportingReportsArchivedLegacyReportsRBTCtrl',
            data: {
                permissions: [
                    'READ_REPORTS_ONDEMAND'
                ]
            }
        });

    });

    ReportingReportsArchivedLegacyReportsModule.controller('ReportingReportsArchivedLegacyReportsCommonCtrl', function ($scope, $log, $controller, ReportingExportService) {
        $log.debug("ReportingReportsArchivedLegacyReportsCommonCtrl");

        $scope.ARCHIVED_FORMATS_PENTAHO = [
            {name: 'MS EXCEL', value: 'table/excel;page-mode=flow', inline: false}
        ];
        $scope.format = $scope.ARCHIVED_FORMATS_PENTAHO[0];

        // Calling the base report controller.
        $controller('ReportingReportsAbstractCtrl', {$scope: $scope});

        $scope.downloadLegacyReport = function (reportCategory, format, dateHolder) {
            var startDateDayStr = moment(dateHolder.overridedStartDate || dateHolder.startDate).format(reportCategory.dateFormat || 'DDMMYYYY');
            var reportCategoryName = reportCategory.name.replace(/\{date\}/g, startDateDayStr);

            var srcUrl = '/archived-reports' + reportCategory.path + '/' + reportCategoryName;

            $log.debug('Downloading Arcived Report. URL: ', srcUrl);

            ReportingExportService.showReport(srcUrl, 'MS EXCEL', reportCategoryName);
        };
    });

    ReportingReportsArchivedLegacyReportsModule.controller('ReportingReportsArchivedLegacyReportsAuditRACtrl', function ($scope, $log, $controller, $filter, Restangular, CMPFService, UtilService, DateTimeConstants) {
        $log.debug("ReportingReportsArchivedLegacyReportsAuditRACtrl");

        $controller('ReportingReportsArchivedLegacyReportsCommonCtrl', {$scope: $scope});

        $scope.dateHolder.startDate = moment(moment('2020-07-14 00:00:00')).toDate();
        $scope.dateOptions.minDate = $scope.dateHolder.startDate;
        $scope.dateOptions.maxDate = $scope.dateHolder.startDate;

        $scope.REPORTS = [
            {
                label: 'Partners List',
                path: '/Audit and RA/The CPSPs List',
                name: 'sysadmin_TheCPSPsList_Area_{date}_233833.xlsx',
                type: 'DAILY_SPECIAL',
                dateFormat: 'DDMMYYYY',
                isReadOnly: true
            },
            {
                label: 'Partner Short Code List',
                path: '/Audit and RA/The SP Short Code List',
                name: 'sysadmin_TheSPShortCodeList_Area_{date}_234110.xlsx',
                type: 'DAILY_SPECIAL',
                dateFormat: 'DDMMYYYY',
                isReadOnly: true
            },
            {
                label: 'Services List',
                path: '/Audit and RA/The Services List',
                name: 'sysadmin_TheServicesList_Area_{date}_233959.xlsx',
                type: 'DAILY_SPECIAL',
                dateFormat: 'DDMMYYYY',
                isReadOnly: true
            },
            {
                label: 'Services List for Reconciliation',
                path: '/Audit and RA/The Services List for Reconciliation',
                name: 'sysadmin_TheServicesListforReconciliation_Area_{date}_234215.xlsx',
                type: 'DAILY_SPECIAL',
                dateFormat: 'DDMMYYYY',
                isReadOnly: true
            }
        ];

        $scope.reportCategory = $scope.REPORTS[0];
    });

    ReportingReportsArchivedLegacyReportsModule.controller('ReportingReportsArchivedLegacyReportsCPSPCtrl', function ($scope, $log, $controller, $filter, Restangular, CMPFService, UtilService, DateTimeConstants) {
        $log.debug("ReportingReportsArchivedLegacyReportsCPSPCtrl");

        $controller('ReportingReportsArchivedLegacyReportsCommonCtrl', {$scope: $scope});

        $scope.dateHolder.startDate = moment(moment('2018-07-01 00:00:00')).toDate();
        $scope.dateOptions.minDate = $scope.dateHolder.startDate;
        $scope.dateOptions.maxDate = new Date();

        $scope.REPORTS = [
            {
                label: 'Partner Resource Report',
                path: '/CPSP/CP SP Resource Report',
                name: '{date}.xls',
                type: 'DAILY_SPECIAL',
                dateFormat: 'DD-MM-YYYY'
            },
            {
                label: 'Service Statistics Report',
                path: '/CPSP/Services  Statistics  Report',
                name: '{date}.xlsx',
                type: 'MONTHLY',
                dateFormat: 'MM_YYYY'
            },
            {
                label: 'Shared Revenue Report',
                path: '/CPSP/Shared Revenue Report',
                name: '{date}.xlsx',
                type: 'MONTHLY',
                dateFormat: 'MM-YYYY'
            },
            {
                label: 'Top N Contents Report',
                path: '/CPSP/Top  N  Contents',
                name: '{date}.xlsx',
                type: 'MONTHLY',
                dateFormat: 'MM-YYYY'
            }
        ];

        $scope.reportCategory = $scope.REPORTS[0];
    });

    ReportingReportsArchivedLegacyReportsModule.controller('ReportingReportsArchivedLegacyReportsRBTCtrl', function ($scope, $log, $controller, $filter, Restangular, CMPFService, UtilService, DateTimeConstants) {
        $log.debug("ReportingReportsArchivedLegacyReportsRBTCtrl");

        $controller('ReportingReportsArchivedLegacyReportsCommonCtrl', {$scope: $scope});

        $scope.dateHolder.startDate = moment(moment('2018-07-01 00:00:00')).toDate();
        $scope.dateHolder.endDate = moment(moment('2020-07-14 00:00:00')).toDate();
        $scope.dateOptions.minDate = $scope.dateHolder.startDate;
        $scope.dateOptions.maxDate = $scope.dateHolder.endDate;

        $scope.dateHolder.overridedStartDate = moment(moment('2020-07-15 00:00:00')).toDate();

        $scope.REPORTS = [
            {
                label: 'Functional RBT Report',
                path: '/RBT/Functional RBT Report',
                name: 'sysadmin_FunctionalRBTReport_Area_{date}_165052.xlsx',
                type: 'DAILY',
                dateFormat: 'DDMMYYYY',
                isReadOnly: true
            },
            {
                label: 'IVR Calling Report',
                path: '/RBT/IVR Calling Report',
                name: 'sysadmin_IVRCallingReport_Area_{date}_170214.xlsx',
                type: 'DAILY',
                dateFormat: 'DDMMYYYY',
                isReadOnly: true
            },
            {
                label: 'RBT Charging Report',
                path: '/RBT/RBT Charging Report',
                name: 'sysadmin_RBTChargingReport_Area_{date}_164850.xlsx',
                type: 'DAILY',
                dateFormat: 'DDMMYYYY',
                isReadOnly: true
            },
            {
                label: 'RBT Intelligent Charging Report',
                path: '/RBT/RBT Intelligent Charging Report',
                name: 'sysadmin_RBTIntelligentChargingReport_Area_{date}_165202.xlsx',
                type: 'DAILY',
                dateFormat: 'DDMMYYYY',
                isReadOnly: true
            },
            {
                label: 'RBT Revenue Report',
                path: '/RBT/RBT Revenue Report',
                name: 'sysadmin_RBTRevenueReport_Area_{date}_164324.xlsx',
                type: 'DAILY',
                dateFormat: 'DDMMYYYY',
                isReadOnly: true
            },
            {
                label: 'RBT Subscriber Operation Report',
                path: '/RBT/RBT Subscriber Operation Report',
                name: 'sysadmin_RBTSubscriberOperationReport_Area_{date}_170540.xlsx',
                type: 'DAILY',
                dateFormat: 'DDMMYYYY',
                isReadOnly: true
            },
            {
                label: 'RBT Subscribers Report',
                path: '/RBT/RBT Subscribers Report',
                name: 'sysadmin_RBTSubscribersReport_Area_{date}_164851.xlsx',
                type: 'DAILY',
                dateFormat: 'DDMMYYYY',
                isReadOnly: true
            }
        ];

        $scope.reportCategory = $scope.REPORTS[0];
    });

})();
