(function () {

    'use strict';

    angular.module('adminportal.dashboards', []);

    var DashboardModule = angular.module('adminportal.dashboards');

    DashboardModule.config(function ($stateProvider) {

        $stateProvider.state('dashboards', {
            url: "/dashboard",
            templateUrl: 'dashboard/dashboard.html',
            controller: 'DashboardCtrl',
            data: {
                headerKey: 'Dashboard.PageHeader'
            },
            resolve: {
                serverConfiguration: function (ServerConfigurationService) {
                    return ServerConfigurationService.getAndUpdateServerConfiguration();
                }
            }
        });

    });

    DashboardModule.controller('DashboardCtrl', function ($scope, $log, $controller, $interval, serverConfiguration, ServerConfigurationService, AdmPortalDashboardPromiseTracker) {
        $scope.dashboardQueries = [];

        $controller('AccordionPrepareCtrl', {$scope: $scope, serverConfiguration: serverConfiguration});
        $controller('AccordionQueryCtrl', {$scope: $scope});
        $controller('ProductsAndServicesQueryCtrl', {$scope: $scope});
        $controller('SSMQueryCtrl', {$scope: $scope});
        $controller('ContentManagementQueryCtrl', {$scope: $scope});
        $controller('CMPFQueryCtrl', {$scope: $scope});

        var rebuild = $interval(function () {
            $log.debug('reloading');

            // This server configuration freshener step is available, then it configures the server specific definitions.
            ServerConfigurationService.getAndUpdateServerConfiguration().then(function () {
                _.each($scope.dashboardQueries, function (dashboardQuery) {
                    dashboardQuery(AdmPortalDashboardPromiseTracker);
                });
            });
        }, 90000);

        $scope.$on('$destroy', function () {
            if (angular.isDefined(rebuild)) {
                $log.debug('Cancelled timer');
                $interval.cancel(rebuild);
                rebuild = undefined;
            }
        });
    });

    // Prepares accordion values.
    DashboardModule.controller('AccordionPrepareCtrl', function ($scope, serverConfiguration) {
        $scope.oneAtATime = false;
        $scope.status = {isFirstDisabled: false};

        $scope.hostnames = [];
        var clusters = angular.copy(serverConfiguration.clusters);
        $scope.clusters = [];

        var clustersCount = 0;
        var hostsCount = 0;

        _.each(clusters, function (cluster) {
            if (cluster.hosts) {
                var newCluster = {
                    "name": cluster.name,
                    "hosts": []
                };
                newCluster.hosts = _.map(cluster.hosts, function (host) {
                    hostsCount++;
                    $scope.hostnames.push(host);

                    return {"name": host};
                })
                $scope.clusters.push(newCluster);

                clustersCount++;
            } else if (cluster.virtualClusters) {
                var newVCluster = {
                    "name": cluster.name,
                    "virtualClusters": []
                };

                _.each(cluster.virtualClusters, function (vcluster) {
                    if (vcluster.hosts) {
                        var newVClusterHosts = {
                            "hosts": []
                        };
                        newVClusterHosts.hosts = _.map(vcluster.hosts, function (host) {
                            hostsCount++;
                            $scope.hostnames.push(host);

                            return {"name": host};
                        })
                        newVCluster.virtualClusters.push(newVClusterHosts);
                    }
                    clustersCount++;
                });

                $scope.clusters.push(newVCluster);
            }
        });

        if ($scope.hostnames && $scope.hostnames.length > 0) {
            $scope.hostnames = _.uniq($scope.hostnames);
        }

        $scope.limits = {
            clustersUnknown: -1,
            hostsUnknown: -1,
            allClustersDown: 0,
            allHostsDown: 0,
            clustersCount: clustersCount,
            hostsCount: hostsCount
        };

        $scope.clustersStatus = $scope.limits.clustersUnknown;
        $scope.hostsStatus = $scope.limits.hostsUnknown;
    });

    // Queries clusters and hosts states.
    DashboardModule.controller('AccordionQueryCtrl', function ($scope, $log, Restangular, DiagnosticsService) {
        var resetCounters = function () {
            $scope.aliveClusters = $scope.limits.allClustersDown;
            $scope.aliveHosts = $scope.limits.allHostsDown;
        };

        var fillHostStats = function (host, stats, countAliveHosts) {
            // First comparing the hostname and supposing fqdn value. If the hostname is same with the fqdn value then
            // it will be taking the required values from the set.
            var result = _.filter(stats, function (stat) {
                return stat._source.host.toLowerCase() === host.name.toLowerCase();
            })[0];

            // Checking the first statistics item's cpu.idle variable to be sure the host variable contains is cpu statistic values.
            if (stats.length > 0 && stats[0]._source['cpu.idle']) {
                host.idle = 0;
                host.iowait = 0;

                // Get values related the cpu statistics
                if (result) {
                    host.idle = result._source['cpu.idle'] ? result._source['cpu.idle'] : 0;
                    host.iowait = result._source['cpu.iowait'] ? result._source['cpu.iowait'] : 0;
                }
            }

            // Checking the first statistics item's mem.total variable to be sure the host variable contains is memory statistic values.
            var mem_total = 0, mem_used = 0;
            if (stats.length > 0 && stats[0]._source['mem.total']) {
                host.free = 0;

                // Get values related the mem statistics
                if (result) {
                    mem_total = result._source['mem.total'] ? result._source['mem.total'] : 0;
                    mem_used = result._source['mem.used'] ? result._source['mem.used'] : 0;
                }
            }

            // Calculate the alive host count finally.
            if (result) {
                if ((host.idle || host.iowait || mem_total) && countAliveHosts) {
                    $scope.aliveHosts++;
                }

                if (mem_total) {
                    host.free = ((mem_total - mem_used) / mem_total) * 100;
                }
            }
        };

        var processCluster = function (cluster, stats, countClusters, countAliveHosts) {
            if (cluster.virtualClusters) {
                angular.forEach(cluster.virtualClusters, function (vcluster, index) {
                    processCluster(vcluster, stats, countClusters, countAliveHosts);
                });
            } else {
                angular.forEach(cluster.hosts, function (host, index) {
                    fillHostStats(host, stats, countAliveHosts);
                });

                if (countClusters) {
                    var atLeastOneHostIsUp = _.some(cluster.hosts, function (host) {
                        return !_.isUndefined(host.idle) && host.idle > 0;
                    });

                    if (atLeastOneHostIsUp) {
                        $scope.aliveClusters++;
                    }
                }
            }
        };

        var setFlags = function () {
            if ($scope.cpuStats && $scope.cpuStats.length === 0) {
                $scope.clustersStatus = $scope.limits.clustersUnknown;
                $scope.hostsStatus = $scope.limits.hostsUnknown;
            } else {
                $scope.clustersStatus = $scope.aliveClusters;
                $scope.hostsStatus = $scope.aliveHosts;
            }
        };

        var queryCPU = function (query, promiseTracker) {
            return DiagnosticsService.queryCPUStats(query, promiseTracker).then(function (response) {
                $log.debug('Last Minute CPU Stats : ', response);
                $scope.cpuStats = response.aggregations.filtered.top_hosts_hits.hits.hits;

                angular.forEach($scope.clusters, function (cluster, index) {
                    processCluster(cluster, $scope.cpuStats, true, false);
                });
            }, function (response) {
                $log.error('Cannot read CPU stats. Error: ', response);
            });
        };

        var queryRAM = function (query, promiseTracker) {
            return DiagnosticsService.queryRAMStats(query, promiseTracker).then(function (response) {
                $log.debug('Last Minute RAM Stats : ', response);
                $scope.memStats = response.aggregations.filtered.top_hosts_hits.hits.hits;

                angular.forEach($scope.clusters, function (cluster, index) {
                    processCluster(cluster, $scope.memStats, false, true);
                });
            }, function (response) {
                $log.error('Cannot read RAM stats. Error: ', response);
            });
        };

        var lastTwoMinutesTopQueryMain = {
            "aggs": {
                "filtered": {
                    "filter": {
                        "bool": {
                            "must": [
                                {
                                    "terms": {
                                        "host": $scope.hostnames
                                    }
                                },
                                {
                                    "range": {
                                        "timestamp": {
                                            "from": "now-2m", "to": "now"
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    "aggs": {
                        "top_hosts_hits": {
                            "top_hits": {
                                "sort": [
                                    {
                                        "timestamp": {
                                            "order": "desc"
                                        }
                                    }
                                ],
                                "_source": {
                                    "includes": []
                                },
                                "size": $scope.hostnames.length * 2
                            }
                        }
                    }
                }
            },
            "size": 0
        };

        var lastTwoMinutesTopQueryCpustat = angular.copy(lastTwoMinutesTopQueryMain);
        lastTwoMinutesTopQueryCpustat.aggs.filtered.aggs.top_hosts_hits.top_hits._source.includes = ["cpu.iowait", "cpu.idle", "host", "timestamp"];

        var lastTwoMinutesTopQueryMemstat = angular.copy(lastTwoMinutesTopQueryMain);
        lastTwoMinutesTopQueryMemstat.aggs.filtered.aggs.top_hosts_hits.top_hits._source.includes = ["mem.used", "mem.total", "host", "timestamp"];

        var dashboardingAccordion = function (promiseTracker) {
            resetCounters();

            queryCPU(lastTwoMinutesTopQueryCpustat, promiseTracker).then(function () {
                queryRAM(lastTwoMinutesTopQueryMemstat, promiseTracker).then(setFlags);
            });
        };

        dashboardingAccordion();

        // Push to the main query array
        $scope.dashboardQueries.push(dashboardingAccordion);
    });

    // Queries SSM values.
    DashboardModule.controller('SSMQueryCtrl', function ($scope, $log, SSMSubscribersService, AuthorizationService) {
        $scope.subscribers = 0;
        $scope.offerSubscriptions = 0;

        var dashboardingSSM = function (promiseTracker) {
            SSMSubscribersService.getCounts(promiseTracker).then(function (response) {
                $scope.subscribers = response.subscriberCount;
                $scope.offerSubscriptions = response.subscriptionCount;

                $scope.subscriptionmanagement = 'success';
            }, function (response) {
                $log.debug('Cannot read subscribers. Error: ', response);

                $scope.subscriptionmanagement = 'error';
            });
        };

        if (AuthorizationService.canSeeSubscriptionMgmt()) {
            dashboardingSSM();

            // Push to the main query array
            $scope.dashboardQueries.push(dashboardingSSM);
        }
    });

    // Queries Content Management values.
    DashboardModule.controller('ContentManagementQueryCtrl', function ($scope, $log, ContentManagementService, AuthorizationService) {
        var dashboardingContentManagement = function (promiseTracker) {
            ContentManagementService.checkSystemHealth(promiseTracker).then(function (response) {
                if (response && response.code === 2004) {
                    $scope.contentmanagement = 'success';
                } else {
                    $scope.contentmanagement = 'error';
                }
            }, function (response) {
                $log.debug('Cannot read content management service. Error: ', response);

                $scope.contentmanagement = 'error';
            });
        };

        if (AuthorizationService.canSeeContentMgmt()) {
            dashboardingContentManagement();

            // Push to the main query array
            $scope.dashboardQueries.push(dashboardingContentManagement);
        }
    });

    // Queries CMPF values.
    DashboardModule.controller('CMPFQueryCtrl', function ($scope, $log, Restangular, CMPFService, AuthorizationService, DEFAULT_REST_QUERY_LIMIT) {
        $scope.offers = 0;
        $scope.serviceProviders = 0;
        $scope.services = 0;
        $scope.shortCodes = 0;
        $scope.projects = 0;
        $scope.departments = 0;
        $scope.teams = 0;
        $scope.userAccounts = 0;

        var dashboardingCMPF = function (promiseTracker) {
            CMPFService.getOffers(0, 0, false, false, false, null, promiseTracker).then(function (response) {
                $scope.offers = Restangular.stripRestangular(response).metaData.totalCount;
            }, function (response) {
                $log.error('Cannot read offers. Error: ', response);
            });

            CMPFService.getPartners(0, 0, false, false, null, promiseTracker).then(function (response) {
                $scope.serviceProviders = Restangular.stripRestangular(response).metaData.totalCount;
            }, function (response) {
                $log.debug('Cannot read service providers. Error: ', response);
            });

            CMPFService.getServices(0, 0, false, false, null, null, promiseTracker).then(function (response) {
                $scope.services = Restangular.stripRestangular(response).metaData.totalCount;
            }, function (response) {
                $log.debug('Cannot read services. Error: ', response);
            });

            CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_ORGANIZATION_NAME, promiseTracker).then(function (response) {
                var shortCodesOrganization = _.findWhere(response.organizations, {name: CMPFService.DEFAULT_SHORT_CODES_ORGANIZATION_NAME});
                var shortCodes = CMPFService.getShortCodes(shortCodesOrganization);
                $scope.shortCodes = shortCodes.length;

                var projectsOrganization = _.findWhere(response.organizations, {name: CMPFService.DEFAULT_PROJECTS_ORGANIZATION_NAME});
                var projects = CMPFService.getDepartments(projectsOrganization);
                $scope.projects = projects.length;

                var departmentsOrganization = _.findWhere(response.organizations, {name: CMPFService.DEFAULT_DEPARTMENTS_ORGANIZATION_NAME});
                var departments = CMPFService.getDepartments(departmentsOrganization);
                $scope.departments = departments.length;

                var teamsOrganization = _.findWhere(response.organizations, {name: CMPFService.DEFAULT_TEAMS_ORGANIZATION_NAME});
                var teams = CMPFService.getTeams(teamsOrganization);
                $scope.teams = teams.length;
            }, function (response) {
                $log.debug('Cannot read default organization. Error: ', response);
            });

            CMPFService.getUserAccounts(0, 0, false, promiseTracker).then(function (response) {
                $scope.userAccounts = Restangular.stripRestangular(response).metaData.totalCount;
            }, function (response) {
                $log.debug('Cannot read user accounts. Error: ', response);
            });
        };

        if (AuthorizationService.canSeeProvisioning()) {
            dashboardingCMPF();

            // Push to the main query array
            $scope.dashboardQueries.push(dashboardingCMPF);
        }
    });

    // Queries products and services healthes.
    DashboardModule.controller('ProductsAndServicesQueryCtrl', function ($scope, $log, Restangular, CMPFService, ApiManagerService, BulkMessagingDashboardService, OTPService, ChargingGwService,
                                                                         MessagingGwService, DcbService, ScreeningManagerV3Service, AuthorizationService) {
        // Products
        $scope.apimanager = 'unknown';
        $scope.bms = 'unknown';
        $scope.otpserver = 'unknown';
        $scope.charginggw = 'unknown';
        $scope.messaginggw = 'unknown';
        $scope.dcb = 'unknown';

        // Others
        $scope.cmpf = 'unknown';
        $scope.screening = 'unknown';
        $scope.subscriptionmanagement = 'unknown';
        $scope.contentmanagement = 'unknown';

        // TODO - Check and complete the missing stuff.
        var dashboardingProductsAndServices = function (promiseTracker) {
            // ********
            // PRODUCTS
            // ********
            // API Manager Check
            if (AuthorizationService.canSeeApiManager()) {
                ApiManagerService.checkStatus(promiseTracker).then(function (apiResponse) {
                    $scope.apimanager = 'success';
                }, function (response) {
                    $log.error('Cannot reach API Manager status check service. Error: ', response);
                    $scope.apimanager = 'error';
                });
            }

            // BMS Check
            if (AuthorizationService.canSeeBMS()) {
                BulkMessagingDashboardService.checkStatus(promiseTracker).then(function (apiResponse) {
                    if (apiResponse.statusCode) {
                        $scope.bms = 'warning';
                    } else {
                        $scope.bms = 'success';
                    }
                }, function (response) {
                    $log.error('Cannot reach BMS dashboard service. Error: ', response);
                    $scope.bms = 'error';
                });
            }

            // OTP Check
            if (AuthorizationService.canSeeOTPServer()) {
                OTPService.createOTP(promiseTracker).then(function (apiResponse) {
                    if (apiResponse.statusCode) {
                        $scope.otpserver = 'warning';
                    } else {
                        $scope.otpserver = 'success';
                    }
                }, function (response) {
                    $log.error('Cannot reach OTP server service. Error: ', response);
                    $scope.otpserver = 'error';
                });
            }

            // Charging Gateway Check
            if (AuthorizationService.canSeeCHGGW()) {
                ChargingGwService.checkStatus(promiseTracker).then(function (apiResponse) {
                    $scope.charginggw = 'success';
                }, function (response) {
                    $log.error('Cannot reach Charging Gateway status check service. Error: ', response);
                    $scope.charginggw = 'error';
                });
            }

            // Messaging Gateway Check
            if (AuthorizationService.canSeeMSGGW()) {
                MessagingGwService.checkStatus(promiseTracker).then(function (apiResponse) {
                    if (apiResponse.response === 'pong') {
                        $scope.messaginggw = 'success';
                    } else {
                        $scope.messaginggw = 'warning';
                    }
                }, function (response) {
                    $log.error('Cannot reach Messaging Gateway status check service. Error: ', response);
                    $scope.messaginggw = 'error';
                });
            }

            // Direct Carrier Billing Check
            if (AuthorizationService.canSeeDCB()) {
                DcbService.checkSystemHealth(promiseTracker).then(function (apiResponse) {
                    if (apiResponse.response === 'pong') {
                        $scope.dcb = 'success';
                    } else {
                        $scope.dcb = 'warning';
                    }
                }, function (response) {
                    $log.error('Cannot reach dcb status check service. Error: ', response);
                    $scope.dcb = 'error';
                });
            }

            //

            // OTHERS

            // CMPF
            if (AuthorizationService.canSeeProvisioning()) {
                CMPFService.getServices(0, 0, false, false, null, null, promiseTracker).then(function (response) {
                    $log.debug('Success. Response: ', response);
                    $scope.cmpf = 'success';
                }, function (response) {
                    $log.debug('Cannot reach services. Error: ', response);
                    $scope.cmpf = 'error';
                });
            }

            // Screening manager
            if (AuthorizationService.canSeeScreeningMgmt()) {
                ScreeningManagerV3Service.getScopes(promiseTracker).then(function (response) {
                    $log.debug('Success. Response: ', response);
                    $scope.screening = 'success';
                }, function (response) {
                    $log.debug('Failure. Response: ', response);
                    $scope.screening = 'error';
                });
            }
        };

        dashboardingProductsAndServices();

        // Push to the main query array
        $scope.dashboardQueries.push(dashboardingProductsAndServices);
    });

})();
