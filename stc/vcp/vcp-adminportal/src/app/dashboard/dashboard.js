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
        $controller('CMPFQueryCtrl', {$scope: $scope});
        $controller('SSMQueryCtrl', {$scope: $scope});
        $controller('ContentManagementQueryCtrl', {$scope: $scope});
        $controller('ProductsAndServicesQueryCtrl', {$scope: $scope});

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

    // Queries CMPF values.
    DashboardModule.controller('CMPFQueryCtrl', function ($scope, $log, Restangular, CMPFService, AuthorizationService) {
        $scope.offers = 0;
        $scope.serviceProviders = 0;
        $scope.services = 0;
        $scope.userAccounts = 0;
        $scope.userGroups = 0;

        var dashboardingCMPF = function (promiseTracker) {
            
            CMPFService.getOffersCustom(0, 0, false, false, false, null, promiseTracker).then(function (response) {
                $scope.offers = Restangular.stripRestangular(response).metaData.totalCount;
            }, function (response) {
                $log.error('Cannot read offers. Error: ', response);
            });

            CMPFService.getPartners(0, 0, promiseTracker).then(function (response) {
                $scope.serviceProviders = Restangular.stripRestangular(response).metaData.totalCount;
            }, function (response) {
                $log.debug('Cannot read service providers. Error: ', response);
            });

            CMPFService.getServices(0, 0, false, false, promiseTracker).then(function (response) {
                $scope.services = Restangular.stripRestangular(response).metaData.totalCount;
            }, function (response) {
                $log.debug('Cannot read services. Error: ', response);
            });

            CMPFService.getUserAccounts(0, 0, false, promiseTracker).then(function (response) {
                $scope.userAccounts = Restangular.stripRestangular(response).metaData.totalCount;
            }, function (response) {
                $log.debug('Cannot read user accounts. Error: ', response);
            });

            CMPFService.getUserGroups(0, 0, promiseTracker).then(function (response) {
                $scope.userGroups = Restangular.stripRestangular(response).metaData.totalCount;
            }, function (response) {
                $log.debug('Cannot read user groups. Error: ', response);
            });
        };

        if (AuthorizationService.canSeeProvisioning()) {
            dashboardingCMPF();

            // Push to the main query array
            $scope.dashboardQueries.push(dashboardingCMPF);
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

    // Queries products and services healthes.
    DashboardModule.controller('ProductsAndServicesQueryCtrl', function ($scope, $log, Restangular, CMPFService, SmscConfService, MmscConfService, UssdGwConfService, UssdBrowserService, UssiCoreConfService, UssiDashboardService,
                                                                         SmsfConfigService, SmsfDashboardService, SMSAntiSpamService, P4MService, MCADashboardService, VMConfigurationService, RBTConfService, ScreeningManagerService,
                                                                         AuthorizationService, OIVRDashboardService, BulkMessagingDashboardService, OTPService, ChargingGwService, MessagingGwService) {
        // Products
        $scope.smsc = 'unknown';
        $scope.antispamsms = 'unknown';
        $scope.mmsc = 'unknown';
        $scope.usc = 'unknown';
        $scope.ussi = 'unknown';
        $scope.smsf = 'unknown';

        // DSP Products
        //$scope.apimanager = 'unknown';
        $scope.bms = 'unknown';
        $scope.oivr = 'unknown';
        $scope.otpserver = 'unknown';
        $scope.charginggw = 'unknown';

        // DSP - Others
        $scope.subscriptionmanagement = 'unknown';
        $scope.contentmanagement = 'unknown';

        // Services
        $scope.collectcall = 'unknown';
        $scope.mca = 'unknown';
        $scope.cmb = 'unknown';
        $scope.vm = 'unknown';
        $scope.vsms = 'unknown';
        $scope.rbt = 'unknown';

        $scope.cmpf = 'unknown';
        $scope.screening = 'unknown';

        // TODO handle error & warning states
        var dashboardingProductsAndServices = function (promiseTracker) {

            // ********
            // PRODUCTS
            // ********

            // SMSC Check
            if (AuthorizationService.canSeeSMSC()) {
                SmscConfService.getSFEStorage(promiseTracker).then(function (apiResponse) {
                    if (apiResponse.statusCode) {
                        $scope.smsc = 'warning';
                    } else {
                        $scope.smsc = 'success';
                    }
                }, function (response) {
                    $log.error('Cannot reach SMSC configuration. Error: ', response);
                    $scope.smsc = 'error';
                });
            }

            // MMSC Check
            if (AuthorizationService.canSeeMMSC()) {
                MmscConfService.getMm1Agent(promiseTracker).then(function (apiResponse) {
                    if (apiResponse.statusCode) {
                        $scope.mmsc = 'warning';
                    } else {
                        $scope.mmsc = 'success';
                    }
                }, function (response) {
                    $log.error('Cannot reach MMSC configuration. Error: ', response);
                    $scope.mmsc = 'error';
                });
            }

            // USC Check
            if (AuthorizationService.canSeeUSC()) {
                UssdGwConfService.getApplicationGateway(promiseTracker).then(function (response) {
                    $log.debug('UssdGw Application Gw config api:', response);
                    $scope.appGw = Restangular.stripRestangular(response);
                    if ($scope.appGw.errorCode) {
                        $scope.usc = 'error';
                    } else {
                        UssdBrowserService.getConfiguration(promiseTracker).then(function (response) {
                            $log.debug('Ussd Browser config api:', response);
                            $scope.usc = 'success';
                        }, function () {
                            $log.error('Cannot reach UssdBrowser Configuration');
                            $scope.usc = 'warning';
                        });
                    }
                }, function () {
                    $log.error('Cannot reach UssdGw Application Gw');
                    $scope.usc = 'error';
                });
            }

            // USSI Check
            if (AuthorizationService.canSeeUSSI()) {
                UssiCoreConfService.getCoreConfig().then(function (apiResponse) {
                    if (apiResponse.statusCode) {
                        $scope.ussi = 'warning';
                    } else {
                        $scope.ussi = 'success';
                    }
                }, function (response) {
                    $log.error('Cannot reach USSI configuration. Error: ', response);
                    $scope.ussi = 'error';
                });
            }

            // SMSF Check
            if (AuthorizationService.canSeeSMSF()) {
                SmsfConfigService.getCoreConfig().then(function (apiResponse) {
                    if (apiResponse.statusCode) {
                        $scope.smsf = 'warning';
                    } else {
                        $scope.smsf = 'success';
                    }
                }, function (response) {
                    $log.error('Cannot reach SMSF configuration. Error: ', response);
                    $scope.smsf = 'error';
                });
            }

            // AntiSpam Check
            if (AuthorizationService.canSeeAntiSpam()) {
                SMSAntiSpamService.getHeartBeat(promiseTracker).then(function (apiResponse) {
                    if (apiResponse && apiResponse.statusCode) {
                        $scope.antispamsms = 'warning';
                    } else {
                        $scope.antispamsms = 'success';
                    }
                }, function (response) {
                    $log.error('Cannot reach AntiSpam heart beat service. Error: ', response);
                    $scope.antispamsms = 'error';
                });
            }

            // ********
            // DSP Originated Products
            // ********
            // // API Manager Check
            // if (AuthorizationService.canSeeApiManager()) {
            //     ApiManagerService.checkStatus(promiseTracker).then(function (apiResponse) {
            //         $scope.apimanager = 'success';
            //     }, function (response) {
            //         $log.error('Cannot reach API Manager status check service. Error: ', response);
            //         $scope.apimanager = 'error';
            //     });
            // }

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
            // OIVR Check
            if (AuthorizationService.canSeeOIVR()) {
                OIVRDashboardService.getDashboardRates(promiseTracker).then(function (apiResponse) {
                    if (apiResponse) {
                        $scope.oivr = 'success';
                    } else {
                        $scope.oivr = 'warning';
                    }
                }, function (response) {
                    $log.error('Cannot reach OIVR status check service. Error: ', response);
                    $scope.oivr = 'error';
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

            // // Messaging Gateway Check
            // if (AuthorizationService.canSeeMSGGW()) {
            //     MessagingGwService.checkStatus(promiseTracker).then(function (apiResponse) {
            //         if (apiResponse.response === 'pong') {
            //             $scope.messaginggw = 'success';
            //         } else {
            //             $scope.messaginggw = 'warning';
            //         }
            //     }, function (response) {
            //         $log.error('Cannot reach Messaging Gateway status check service. Error: ', response);
            //         $scope.messaginggw = 'error';
            //     });
            // }



            // ********
            // SERVICES
            // ********

            // Collect Call health Check
            if (AuthorizationService.canSeeCC()) {
                $scope.collectcall = 'warning';

                P4MService.getCcServiceConfig(promiseTracker).then(function (apiResponse) {
                    if (apiResponse.statusCode) {
                        $scope.collectcall = 'warning';
                    } else {
                        $scope.collectcall = 'success';
                    }
                }, function (response) {
                    $log.error('Cannot reach Collect Call configuration. Error: ', response);
                    $scope.collectcall = 'error';
                });

                // Call Me Back
                P4MService.getPcmDashboard(promiseTracker).then(function (response) {
                    $log.debug('Success. Response: ', response);
                    $scope.serviceProfile = Restangular.stripRestangular(response);
                    $scope.cmb = 'success';
                }, function (response) {
                    $log.debug('Cannot reach PleaseCallMeServiceProfile. Error: ', response);
                    $scope.cmb = 'error';
                });
            }

            // MCA Check
            if (AuthorizationService.canSeeMCN()) {
                MCADashboardService.getStatistics(promiseTracker).then(function (apiResponse) {
                    if (apiResponse.statusCode) {
                        $scope.mca = 'warning';
                    } else {
                        $scope.mca = 'success';
                    }
                }, function (response) {
                    $log.error('Cannot reach MCA configuration. Error: ', response);
                    $scope.mca = 'error';
                });
            }

            // Voice Mail health Check
            // Voice SMS health Check
            if (AuthorizationService.canSeeVM() || AuthorizationService.canSeeVSMS()) {
                VMConfigurationService.getCoSProfiles(promiseTracker).then(function (apiResponse) {
                    if (apiResponse.statusCode) {
                        $scope.vm = 'warning';
                        $scope.vsms = 'warning';
                    } else {
                        $scope.vm = 'success';
                        $scope.vsms = 'success';
                    }
                }, function (response) {
                    $log.error('Cannot reach VM configuration. Error: ', response);
                    $scope.vm = 'error';
                    $scope.vsms = 'error';
                });
            }

            // Ring Back Tone health Check
            if (AuthorizationService.canSeeRBT()) {
                RBTConfService.getRBTServiceProfiles(promiseTracker).then(function (apiResponse) {
                    if (apiResponse.statusCode) {
                        $scope.rbt = 'warning';
                    } else {
                        $scope.rbt = 'success';
                    }
                }, function (response) {
                    $log.error('Cannot reach Ring Back Tone configuration. Error: ', response);
                    $scope.rbt = 'error';
                });
            }

            // OTHERS
            // CMPF
            if (AuthorizationService.canSeeProvisioning()) {
                CMPFService.getAllPartners(0, 0, false, promiseTracker).then(function (response) {
                    $log.debug('Read partners: ', response);
                    $scope.cmpf = 'success';
                }, function (response) {
                    $log.debug('Cannot reach partners. Error: ', response);
                    $scope.cmpf = 'error';
                });
            }

            // Screening manager
            if (AuthorizationService.canSeeScreeningMgmt()) {
                ScreeningManagerService.getScopes(promiseTracker).then(function (response) {
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
