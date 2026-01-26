(function () {

    'use strict';

    angular.module('adminportal.subsystems.reporting.reports.invoicereports.invoice', []);

    var ReportingReportsInvoiceModule = angular.module('adminportal.subsystems.reporting.reports.invoicereports.invoice');

    ReportingReportsInvoiceModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.reporting.reports.invoicereports.invoice', {
            abstract: true,
            url: "/invoice",
            templateUrl: 'subsystems/reporting/reports/reporting.main.html',
            data: {
                onDemandState: 'subsystems.reporting.reports.invoicereports.invoice.report',
                scheduleState: 'subsystems.reporting.reports.invoicereports.invoice.schedule',
                approvalsState: 'subsystems.reporting.reports.invoicereports.invoice.approvals'
            },
            resolve: {
                organizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsCustom(false, true, [CMPFService.OPERATOR_PROFILE]);
                }
            }
        }).state('subsystems.reporting.reports.invoicereports.invoice.report', {
            url: "/report",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.ondemand.html',
            controller: 'ReportingReportsInvoiceCtrl',
            data: {
                permissions: [
                    //'ALL__FINANCIALREPORTS_ONDEMAND_READ'
                ]
            }
        }).state('subsystems.reporting.reports.invoicereports.invoice.schedule', {
            url: "/schedule",
            templateUrl: 'subsystems/reporting/reports/reporting.formfields.schedule.html',
            controller: 'ReportingReportsInvoiceScheduleCtrl',
            data: {
                permissions: [
                    //'READ_REPORTS_SCHEDULED'
                ]
            }
        })

        // Approvals related states.
        $stateProvider.state('subsystems.reporting.reports.invoicereports.invoice.approvals', {
            url: "/approvals/:reportingWindow",
            template: '<div ui-view></div>',
            data: {
                permissions: [
                    //'ALL__FINANCIALREPORTS_ONDEMAND_READ'
                ]
            },
            resolve: {}
        }).state('subsystems.reporting.reports.invoicereports.invoice.approvals.list', {
            url: "/list",
            templateUrl: 'subsystems/reporting/reports/reporting.approvals.html',
            controller: 'ReportingReportsInvoiceApprovalsCtrl',
            resolve: {
                invoices: function ($stateParams, ReportsService) {
                    if (!$stateParams.reportingWindow) {
                        $stateParams.reportingWindow = moment().startOf('month').format('YYYYMM');
                    }

                    return ReportsService.getInvoices($stateParams.reportingWindow);
                }
            }
        }).state('subsystems.reporting.reports.invoicereports.invoice.approvals.update', {
            url: "/update/:id",
            templateUrl: 'subsystems/reporting/reports/reporting.approvals.details.html',
            controller: 'ReportingReportsInvoiceApprovalsUpdateCtrl',
            resolve: {
                invoice: function ($stateParams, ReportsService) {
                    if (!$stateParams.reportingWindow) {
                        $stateParams.reportingWindow = moment().startOf('month').format('YYYYMM');
                    }

                    return ReportsService.getInvoice($stateParams.reportingWindow, $stateParams.id);
                }
            }
        });

    });

    ReportingReportsInvoiceModule.controller('ReportingReportsInvoiceCtrl', function ($scope, $log, $controller, $filter, Restangular, CMPFService, UtilService,
                                                                                      organizations) {
        $log.debug("ReportingReportsInvoiceCtrl");

        $scope.$parent.currentReportingWindow = moment().startOf('month').format('YYYYMM');

        var organizationList = Restangular.stripRestangular(organizations).organizations;
        $scope.organizationList = $filter('orderBy')(organizationList, ['name']);

        var DSP_Invoice_Report = [
            {name: 'MONTHLY2_SPECIAL', url: ':home:csp:Revenue:DSP_Invoice_Report.prpt', reportType: 'Monthly'}
        ];

        $scope.REPORTS = [
            {
                group: 'Summary Reports',
                label: 'Invoice Report',
                intervals: DSP_Invoice_Report,
                additionalFields: ['organizationIdMandatory']
            }
        ];

        // Calling the base report controller.
        $controller('ReportingReportsAbstractCtrl', {$scope: $scope});

        $scope.reportCategory = $scope.REPORTS[0];
        $scope.interval = $scope.reportCategory.intervals[0];
        $scope.permanentParams = {
            topN: 0
        };
        $scope.additionalParams = {
            organizationId: null
        };
    });

    ReportingReportsInvoiceModule.controller('ReportingReportsInvoiceScheduleCtrl', function ($scope, $log, $controller, organizations) {
        $log.debug("ReportingReportsInvoiceScheduleCtrl");

        $controller('ReportingReportsInvoiceCtrl', {
            $scope: $scope,
            organizations: organizations
        });

        $controller('ReportingReportsScheduleCommonCtrl', {$scope: $scope});
    });

    ReportingReportsInvoiceModule.controller('ReportingReportsInvoiceApprovalsCtrl', function ($scope, $log, $controller, $filter, $state, $stateParams, NgTableParams, NgTableService, DateTimeConstants,
                                                                                               ReportsService, invoices) {
        $log.debug("ReportingReportsInvoiceApprovalsCtrl");

        $scope.reportingWindow = $stateParams.reportingWindow;
        $scope.reportingWindowDate = moment($scope.reportingWindow, 'YYYYMM').toDate();

        var invoiceList = [];
        if (invoices && invoices.invoices.length > 0) {
            invoiceList = invoices.invoices;
        }

        _.each(invoiceList, function (invoice) {
            invoice.reportingWindowDate = $scope.reportingWindowDate;
        });
        invoiceList = $filter('orderBy')(invoiceList, ['organizationId']);

        $scope.openReportingWindowPicker = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.reportingWindowPicker = {
                opened: true
            };
        };
        $scope.updateReportingWindow = function (reportingWindowDate) {
            $scope.reportingWindowDate = reportingWindowDate;
            $scope.reportingWindow = moment($scope.reportingWindowDate).format('YYYYMM');

            $state.go('subsystems.reporting.reports.invoicereports.invoice.approvals.list', {
                reportingWindow: $scope.reportingWindow
            });
        };

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'reportingWindowDate',
                    headerKey: 'Subsystems.Reporting.Approvals.ReportingWindow',
                    filter: {name: 'date', params: ['MMMM, y', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'organizationId',
                    headerKey: 'Subsystems.Reporting.Approvals.OrganizationId'
                },
                {
                    fieldName: 'organizationName',
                    headerKey: 'Subsystems.Reporting.Approvals.OrganizationName'
                },
                {
                    fieldName: 'paymentStatus',
                    headerKey: 'Subsystems.Reporting.Approvals.InvoiceState'
                },
                {
                    fieldName: 'penaltyAmount',
                    headerKey: 'Subsystems.Reporting.Approvals.PenaltyAmount'
                },
                {
                    fieldName: 'penaltyDescription',
                    headerKey: 'CommonLabels.Description'
                },
                {
                    fieldName: 'partnerShare',
                    headerKey: 'Subsystems.Reporting.Approvals.PartnerShare'
                },
                {
                    fieldName: 'totalRevenue',
                    headerKey: 'Subsystems.Reporting.Approvals.TotalRevenue'
                }
            ]
        };

        // Approval list
        $scope.approvalList = {
            list: invoiceList,
            tableParams: {}
        };

        $scope.approvalList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "organizationId": 'asc'
            }
        }, {
            total: $scope.approvalList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.approvalList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.approvalList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Approval list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.approvalList.tableParams.settings().$scope.filterText = filterText;
            $scope.approvalList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.approvalList.tableParams.page(1);
            $scope.approvalList.tableParams.reload();
        }, 750);
    });

    ReportingReportsInvoiceModule.controller('ReportingReportsInvoiceApprovalsUpdateCtrl', function ($scope, $log, $controller, $filter, $stateParams, $translate, notification, Restangular, ReportsService, REPORTING_APPROVALS_STATUS_TYPES,
                                                                                                     invoice) {
        $log.debug("ReportingReportsInvoiceApprovalsUpdateCtrl");

        $scope.REPORTING_APPROVALS_STATUS_TYPES = REPORTING_APPROVALS_STATUS_TYPES;

        $scope.reportingWindow = $stateParams.reportingWindow;
        $scope.reportingWindowDate = moment($scope.reportingWindow, 'YYYYMM').toDate();

        $scope.invoice = invoice;

        $scope.invoiceOriginal = angular.copy($scope.invoice);
        $scope.isNotChanged = function () {
            return angular.equals($scope.invoice, $scope.invoiceOriginal);
        };

        $scope.save = function (invoice) {
            var invoiceItem = {
                invoiceState: invoice.paymentStatus,
                penaltyAmount: invoice.penaltyAmount,
                penaltyDescription: invoice.penaltyDescription
            };

            $log.debug('Updating Invoice:', invoiceItem);

            ReportsService.updateInvoice($scope.reportingWindow, $scope.invoiceOriginal.organizationId, invoiceItem).then(function (response) {
                $log.debug('Updated Invoice: ', invoiceItem, ', response: ', response);

                notification.flash({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $scope.cancel();
            }, function (response) {
                $log.debug('Cannot update Invoice: ', invoiceItem, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $scope.go('subsystems.reporting.reports.invoicereports.invoice.approvals.list', {reportingWindow: $scope.reportingWindow});
        };
    });

})();
