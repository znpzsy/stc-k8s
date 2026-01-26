(function () {

    'use strict';

    angular.module('adminportal.products.apimanager.troubleshooting', []);

    var ApiManagerTroubleshootingModule = angular.module('adminportal.products.apimanager.troubleshooting');

    ApiManagerTroubleshootingModule.config(function ($stateProvider) {

        $stateProvider.state('products.apimanager.troubleshooting', {
            url: "/troubleshooting",
            templateUrl: "products/apimanager/troubleshooting/troubleshooting.html",
            controller: "ApiManagerTroubleshootingCtrl",
            data: {
                permissions: [
                    'ALL__TROUBLESHOOTING_READ'
                ]
            },
            resolve: {
                apis: function (ApiManagerProvService) {
                    return ApiManagerProvService.getApis();
                },
                developers: function (ApiManagerProvService) {
                    return ApiManagerProvService.getDevelopers();
                }
            }
        });

    });

    ApiManagerTroubleshootingModule.controller("ApiManagerTroubleshootingCtrl", function ($scope, $q, $log, $controller, $timeout, $filter, Restangular,
                                                                                          DateTimeConstants, apis, developers, ApiManagerProvService,
                                                                                          $uibModal, NgTableParams, GeneralESService) {
        $log.debug('ApiManagerTroubleshootingCtrl');

        // Calling the date time controller which initializes date/time pickers and necessary functions.
        $controller('GenericDateTimeCtrl', {$scope: $scope});

        $scope.apiList = [];
        $scope.apis = Restangular.stripRestangular(apis);
        $scope.apis = $filter('orderBy')($scope.apis, ['name']);
        var i = 0;
        _.each($scope.apis, function (api) {
            _.each(api.versions, function (version) {
                $scope.apiList[i] = {
                    versionId: version.id,
                    apiId: api.id,
                    apiName: api.name,
                    versionName: version.version,
                    apiNameVersion: api.name + '-' + version.version,
                    methods: version.methods,
                    index: i
                };
                i++;
            });
        });

        $scope.developerList = Restangular.stripRestangular(developers);
        $scope.developerList = $filter('orderBy')($scope.developerList, ['name']);

        $scope.filter = {};

        $scope.getApplications = function (devId) {
            $scope.filter.appId = null;
            $scope.applicationList = [];
            if (devId) {
                var devName = _.findWhere($scope.developerList, {id: devId}).name;
                ApiManagerProvService.getApplications(devName).then(function (response) {
                    $scope.applicationList = Restangular.stripRestangular(response);
                    $scope.applicationList = $filter('orderBy')($scope.applicationList, ['name']);
                });
            }
        };

        $scope.setApiProperties = function (api) {
            $scope.filter.apiId = null;
            $scope.filter.apiVersion = null;
            $scope.filter.apiMethod = null;
            if (api) {
                $scope.filter.apiId = api.apiId;
                $scope.filter.apiVersion = api.versionName;
            }
        };

        $scope.reloadTable = function (tableParams, isAskService, _pageNumber) {
            tableParams.settings().$scope.askService = isAskService;
            var pageNumber = _pageNumber ? _pageNumber : 1;
            if (tableParams.page() === pageNumber) {
                tableParams.reload();
            } else {
                $timeout(function () {
                    tableParams.page(pageNumber);
                }, 0);
            }
        };

        $scope.prepareFilter = function (dateFilter, tableParams) {
            var result = {};

            var startDateIso = $filter('date')(dateFilter.startDate, 'yyyy-MM-dd\'T\'HH:mm:ss.sss' + DateTimeConstants.OFFSET);
            var endDateIso = $filter('date')(dateFilter.endDate, 'yyyy-MM-dd\'T\'HH:mm:ss.sss' + DateTimeConstants.OFFSET);

            result.filter = {
                startDate: startDateIso,
                endDate: endDateIso
            };

            result.additionalFilterFields = {
                msisdn: $scope.filter.msisdn,
                apiId: $scope.filter.apiId,
                devId: $scope.filter.devId,
                apiVersion: $scope.filter.apiVersion,
                apiMethod: $scope.filter.apiMethod,
                clientAddress: $scope.filter.clientAddress,
                httpUri: $scope.filter.httpUri,
                clientTrxId: $scope.filter.clientTrxId,
                serverTrxId: $scope.filter.serverTrxId
            };

            if (tableParams) {
                result.filter.sortFieldName = s.words(tableParams.orderBy()[0], /\-|\+/)[0];
                result.filter.sortOrder = s.include(tableParams.orderBy()[0], '+') ? '"asc"' : '"desc"';
                result.filter.limit = tableParams.count();
                result.filter.offset = (tableParams.page() - 1) * tableParams.count();

                result.filter.queryString = tableParams.settings().$scope.quickSearchText;
                result.filter.quickSearchColumns = tableParams.settings().$scope.quickSearchColumns;
            }

            return result;
        };

        $scope.throttledReloadTable = _.throttle(function () {
            $scope.filterText = undefined;
            $scope.activityHistory.tableParams.settings().$scope.quickSearchText = undefined;
            $scope.reloadTable($scope.activityHistory.tableParams, true);
        }, 500);

        $scope.filterTable = _.debounce(function (text, columns) {
            // Get the Bulk SMS data
            $scope.activityHistory.tableParams.settings().$scope.quickSearchText = text;
            $scope.activityHistory.tableParams.settings().$scope.quickSearchColumns = columns;

            $scope.reloadTable($scope.activityHistory.tableParams, true);
        }, 500);

        // Activity history list of current scope definitions
        $scope.activityHistory = {
            list: [],
            showTable: false,
            tableParams: {}
        };

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'trxTimestamp',
                    headerKey: 'Products.ApiManager.Troubleshooting.TableColumns.Date',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'edrTimestamp',
                    headerKey: 'Products.ApiManager.Troubleshooting.TableColumns.EdrDate',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'transactionId',
                    headerKey: 'Products.ApiManager.Troubleshooting.TableColumns.TransactionId'
                },
                {
                    fieldName: 'edrType',
                    headerKey: 'Products.ApiManager.Troubleshooting.TableColumns.EdrType'
                },
                {
                    fieldName: 'duration',
                    headerKey: 'Products.ApiManager.Troubleshooting.TableColumns.Duration'
                },
                {
                    fieldName: 'host',
                    headerKey: 'Products.ApiManager.Troubleshooting.TableColumns.Host'
                },
                {
                    fieldName: 'organizationId',
                    headerKey: 'Products.ApiManager.Troubleshooting.TableColumns.OrganizationId'
                },
                {
                    fieldName: 'organizationName',
                    headerKey: 'Products.ApiManager.Troubleshooting.TableColumns.Organization'
                },
                {
                    fieldName: 'apiMethod',
                    headerKey: 'Products.ApiManager.Troubleshooting.TableColumns.ApiMethod'
                },
                {
                    fieldName: 'apiId',
                    headerKey: 'Products.ApiManager.Troubleshooting.TableColumns.ApiId'
                },
                {
                    fieldName: 'apiName',
                    headerKey: 'Products.ApiManager.Troubleshooting.TableColumns.Api'
                },
                {
                    fieldName: 'apiVersion',
                    headerKey: 'Products.ApiManager.Troubleshooting.TableColumns.ApiVersion'
                },
                {
                    fieldName: 'apiNameVersion',
                    headerKey: 'Products.ApiManager.Troubleshooting.TableColumns.ApiNameVersion'
                },
                {
                    fieldName: 'endpoint',
                    headerKey: 'Products.ApiManager.Troubleshooting.TableColumns.Endpoint'
                },
                {
                    fieldName: 'devId',
                    headerKey: 'Products.ApiManager.Troubleshooting.TableColumns.DeveloperId'
                },
                {
                    fieldName: 'devName',
                    headerKey: 'Products.ApiManager.Troubleshooting.TableColumns.Developer'
                },
                {
                    fieldName: 'appId',
                    headerKey: 'Products.ApiManager.Troubleshooting.TableColumns.ApplicationId'
                },
                {
                    fieldName: 'appName',
                    headerKey: 'Products.ApiManager.Troubleshooting.TableColumns.Application'
                },
                {
                    fieldName: 'subscriptionId',
                    headerKey: 'Products.ApiManager.Troubleshooting.TableColumns.SubscriptionId'
                },
                {
                    fieldName: 'offerId',
                    headerKey: 'Products.ApiManager.Troubleshooting.TableColumns.OfferId'
                },
                {
                    fieldName: 'offerName',
                    headerKey: 'Products.ApiManager.Troubleshooting.TableColumns.Offer'
                },
                {
                    fieldName: 'clientAddress',
                    headerKey: 'Products.ApiManager.Troubleshooting.TableColumns.ClientAddress'
                },
                {
                    fieldName: 'deviceType',
                    headerKey: 'Products.ApiManager.Troubleshooting.TableColumns.DeviceType'
                },
                {
                    fieldName: 'contentType',
                    headerKey: 'Products.ApiManager.Troubleshooting.TableColumns.ContentType'
                },
                {
                    fieldName: 'totalContentLength',
                    headerKey: 'Products.ApiManager.Troubleshooting.TableColumns.TotalContentLength'
                },
                {
                    fieldName: 'httpMethod',
                    headerKey: 'Products.ApiManager.Troubleshooting.TableColumns.HttpMethod'
                },
                {
                    fieldName: 'httpProtocol',
                    headerKey: 'Products.ApiManager.Troubleshooting.TableColumns.HttpProtocol'
                },
                {
                    fieldName: 'httpUri',
                    headerKey: 'Products.ApiManager.Troubleshooting.TableColumns.HttpUri'
                },
                {
                    fieldName: 'soapAction',
                    headerKey: 'Products.ApiManager.Troubleshooting.TableColumns.SoapAction'
                },
                {
                    fieldName: 'httpStatusCode',
                    headerKey: 'Products.ApiManager.Troubleshooting.TableColumns.HttpStatusCode'
                },
                {
                    fieldName: 'errorCode',
                    headerKey: 'Products.ApiManager.Troubleshooting.TableColumns.ErrorCode'
                },
                {
                    fieldName: 'endpointsTotalDuration',
                    headerKey: 'Products.ApiManager.Troubleshooting.TableColumns.EndpointsTotalDuration'
                },
                {
                    fieldName: 'requestContentLength',
                    headerKey: 'Products.ApiManager.Troubleshooting.TableColumns.RequestContentLength'
                },
                {
                    fieldName: 'responseContentLength',
                    headerKey: 'Products.ApiManager.Troubleshooting.TableColumns.ResponseContentLength'
                },
                {
                    fieldName: 'endpointsTotalRequestContentLength',
                    headerKey: 'Products.ApiManager.Troubleshooting.TableColumns.EndpointsTotalRequestContentLength'
                },
                {
                    fieldName: 'endpointsTotalResponseContentLength',
                    headerKey: 'Products.ApiManager.Troubleshooting.TableColumns.EndpointsTotalResponseContentLength'
                },
                {
                    fieldName: 'endpointsTotalContentLength',
                    headerKey: 'Products.ApiManager.Troubleshooting.TableColumns.EndpointsTotalContentLength'
                },
                {
                    fieldName: 'https',
                    headerKey: 'Products.ApiManager.Troubleshooting.TableColumns.Https'
                },
                {
                    fieldName: 'msg',
                    headerKey: 'Products.ApiManager.Troubleshooting.TableColumns.Message'
                }
            ]
        };

        //Products.ApiManager.Troubleshooting.TableColumns. + titleKey
        //Products.ApiManager.Troubleshooting.TableColumnsTooltips. + titleKey
        $scope.columns = [
            {
                titleKey: 'Date',
                field: 'trxTimestamp',
                popover: true
            },
            {
                titleKey: 'Developer',
                field: 'devId'
            },
            {
                titleKey: 'Application',
                field: 'appName'
            },
            {
                titleKey: 'Api',
                field: 'apiNameVersion'
            },
            {
                titleKey: 'Method',
                field: 'apiMethod'
            },
            {
                titleKey: 'EventType',
                field: 'edrType'
            },
            {
                titleKey: 'Status',
                field: 'errorCode'
            }
        ];

        $scope.activityHistory.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "trxTimestamp": 'desc'
            },
        }, {
            $scope: $scope,
            getData: function ($defer, params) {
                var preparedFilter = $scope.prepareFilter($scope.dateFilter, params);

                var filter = preparedFilter.filter;
                var additionalFilterFields = preparedFilter.additionalFilterFields;

                var deferredRecordsQuery = $q.defer();
                if (params.settings().$scope.askService) {
                    GeneralESService.findAPIManagerHistory(filter, additionalFilterFields).then(function (response) {
                        $log.debug("Found records: ", response);

                        deferredRecordsQuery.resolve(response);
                    }, function (error) {
                        deferredRecordsQuery.reject(error);
                    });
                }

                // Listen the response of the above query.
                deferredRecordsQuery.promise.then(function (response) {
                    $scope.activityHistory.list = response.hits.hits;

                    // Hide the filter form.
                    $scope.filterFormLayer.isFilterFormOpen = false;

                    $scope.activityHistory.showTable = true;

                    params.total(response.hits.total);
                    $defer.resolve($scope.activityHistory.list);
                }, function (error) {
                    $log.debug('Error: ', error);

                    // Hide the filter form.
                    $scope.filterFormLayer.isFilterFormOpen = false;

                    $scope.activityHistory.showTable = true;

                    params.total(0);
                    $defer.resolve([]);
                });
            }
        });
        // END - Activity history list definitions

        $scope.sort = function (field) {
            var sortData = {};
            sortData[field] = $scope.activityHistory.tableParams.isSortBy(field, 'asc') ? 'desc' : 'asc';
            $scope.activityHistory.tableParams.sorting(sortData);
        };

        // Details modal window.
        $scope.showDetails = function (edrRecord) {
            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'products/apimanager/troubleshooting/troubleshooting.edr.details.html',
                controller: function ($scope, $uibModalInstance, edrRecord) {
                    edrRecord.rowSelected = true;

                    $scope.edrRecord = edrRecord;

                    $scope.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'lg',
                resolve: {
                    edrRecord: function () {
                        return edrRecord;
                    }
                }
            });

            modalInstance.result.then(function () {
                edrRecord.rowSelected = false;
            }, function () {
                edrRecord.rowSelected = false;
            });
        };

        var troubleshootEdrHistoryList = {
            list: [],
            tableParams: {}
        };
        troubleshootEdrHistoryList.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "_source.trxTimestamp": 'desc' // initial sorting
            }
        }, {
            $scope: $scope,
            getData: function ($defer, params) {
                var orderedData = params.sorting() ? $filter('orderBy')(troubleshootEdrHistoryList.list, params.orderBy()) : troubleshootEdrHistoryList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

        $scope.showHistory = function (edrRecord) {
            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'products/apimanager/troubleshooting/troubleshooting.edr.history.html',
                size: 'lg',
                resolve: {
                    exportOptions: function () {
                        return $scope.exportOptions;
                    },
                    edrHistory: function (GeneralESService) {
                        return GeneralESService.findAPIManagerDetailedHistory(edrRecord._source.transactionId);
                    },
                    edrRecord: function () {
                        return edrRecord;
                    },
                    troubleshootEdrHistoryList: function () {
                        return troubleshootEdrHistoryList;
                    }
                },
                controller: function ($scope, $uibModalInstance, edrHistory, edrRecord, troubleshootEdrHistoryList, exportOptions) {
                    edrRecord.rowSelected = true;
                    $scope.columns = [
                        {
                            //Products.ApiManager.Troubleshooting.TableColumns. + titleKey
                            //Products.ApiManager.Troubleshooting.TableColumnsTooltips. + titleKey
                            titleKey: 'Date',
                            field: '_source.edrTimestamp',
                            popover: true
                        },
                        {
                            titleKey: 'Developer',
                            field: '_source.devId'
                        },
                        {
                            titleKey: 'Application',
                            field: '_source.appName'
                        },
                        {
                            titleKey: 'Api',
                            field: '_source.apiNameVersion'
                        },
                        {
                            titleKey: 'Method',
                            field: '_source.apiMethod'
                        },
                        {
                            titleKey: 'EventType',
                            field: '_source.edrType'
                        },
                        {
                            titleKey: 'Status',
                            field: '_source.httpStatusCode'
                        }

                    ];

                    $scope.historyExportOptions = exportOptions;

                    $scope.edrRecord = edrRecord;
                    $scope.troubleshootEdrHistoryList = troubleshootEdrHistoryList;

                    $scope.troubleshootEdrHistoryList.list = edrHistory.hits.hits;

                    $scope.troubleshootEdrHistoryList.tableParams.page(1);
                    $scope.troubleshootEdrHistoryList.tableParams.reload();

                    $scope.sort = function (field) {
                        var sortData = {};
                        sortData[field] = $scope.troubleshootEdrHistoryList.tableParams.isSortBy(field, 'asc') ? 'desc' : 'asc';
                        $scope.troubleshootEdrHistoryList.tableParams.sorting(sortData);
                    };

                    $scope.sort('_source.edrTimestamp');

                    $scope.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    };

                    $scope.showDetails = function (edrRecord) {
                        var modalInstance = $uibModal.open({
                            animation: false,
                            templateUrl: 'products/apimanager/troubleshooting/troubleshooting.edr.details.html',
                            controller: function ($scope, $uibModalInstance, edrRecord) {
                                edrRecord.rowSelected = true;

                                $scope.edrRecord = edrRecord;

                                $scope.close = function () {
                                    $uibModalInstance.dismiss('cancel');
                                };
                            },
                            size: 'lg',
                            resolve: {
                                edrRecord: function () {
                                    return edrRecord;
                                }
                            }
                        });

                        modalInstance.result.then(function () {
                            edrRecord.rowSelected = false;
                        }, function () {
                            edrRecord.rowSelected = false;
                        });
                    };

                    // Content modal window.
                    $scope.viewContent = function (edrRecord) {
                        $uibModal.open({
                            animation: false,
                            templateUrl: 'products/apimanager/troubleshooting/troubleshooting.edr.details.content.html',
                            controller: function ($scope, $uibModalInstance, edrRecord, content) {

                                $scope.edrRecord = edrRecord;
                                $scope.content = content;

                                $scope.close = function () {
                                    $uibModalInstance.dismiss('cancel');
                                };
                            },
                            size: 'lg',
                            resolve: {
                                edrRecord: function () {
                                    return edrRecord;
                                },
                                content: function () {
                                    var msg = edrRecord._source.msg.replaceAll('\"\"', '\"').replaceAll('\\n', '\n').replace(/^\"(.+)/, "$1").replace(/(.+)\"$/, "$1");

                                    var expression1 = /^([\s\S]*?)\n\n([\s\S]*?)$/g;
                                    var expression2 = /^([\s\S]*?)\\n\\n([\s\S]*?)$/g;
                                    var result = expression1.exec(msg);
                                    if (!result) {
                                        result = expression2.exec(msg);
                                    }
                                    return {
                                        header: result ? result[1] : '',
                                        body: result ? js_beautify(result[2]) : ''
                                    }
                                }
                            }
                        });
                    };
                }
            });

            modalInstance.result.then(function () {
                edrRecord.rowSelected = false;
            }, function () {
                edrRecord.rowSelected = false;
            });
        };
    });

})();
