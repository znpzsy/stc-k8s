(function () {

    'use strict';

    angular.module('adminportal.products.mmsc.configuration', []); 

    var MmscConfigurationModule = angular.module('adminportal.products.mmsc.configuration');

    MmscConfigurationModule.config(function ($stateProvider) {
        $stateProvider.state('products.mmsc.configuration', {
            url: "/configurations",
            templateUrl: 'products/mmsc/configuration/configuration.html',
        }).state('products.mmsc.configuration.operators', {
            url: "/operators",
            templateUrl: "products/mmsc/configuration/configuration.operators.html",
            controller: 'MmscOperatorsConfigurationCtrl',
            resolve: {
                agent: function (MmscConfService) {
                    return MmscConfService.getMm4Agent();
                }
            }
        }).state('products.mmsc.configuration.externalservers', {
            url: "/externalservers",
            templateUrl: "products/mmsc/configuration/configuration.externalservers.html",
            controller: 'MmscExternalServersConfigurationCtrl',
            resolve: {
                agent: function (MmscConfService) {
                    return MmscConfService.getMm3Agent();
                }
            }
        }).state('products.mmsc.configuration.useragents', {
            url: "/useragents",
            templateUrl: "products/mmsc/configuration/configuration.useragents.html",
            controller: 'MmscUserAgentsConfigurationCtrl',
            resolve: {
                agent: function (MmscConfService) {
                    return MmscConfService.getMm1Agent();
                }
            }
        }).state('products.mmsc.configuration.relayserver', {
            url: "/relayserver",
            templateUrl: "products/mmsc/configuration/configuration.relayserver.html",
            controller: 'MmscRelayServerConfigurationCtrl',
            resolve: {
                relayserver: function (MmscConfService, $log) {
                    return MmscConfService.getRelayServer();
                }, agent: function (MmscConfService) {
                    return MmscConfService.getMm7Agent();
                }

            }
        });

    });

    MmscConfigurationModule.controller('MmscRelayServerConfigurationCtrl', function ($scope, $state, $log, $translate, Restangular, MmscConfService, notification, relayserver, agent) {
        $log.debug('MmscRelayServerConfigurationCtrl');
        $scope.relayServerConf = {
            relayserver: relayserver,
            mm7Agent: agent
        };

        $scope.originalRelayServerConf = angular.copy($scope.relayServerConf);
        $scope.isConfigurationNotChanged = function () {
            return angular.equals($scope.originalRelayServerConf, $scope.relayServerConf);
        };

        $scope.save = function () {
            MmscConfService.setRelayServer($scope.relayServerConf.relayserver).then(function (response) {
                $log.debug('Updated config:', response);

                $scope.relayServerConf.relayserver = Restangular.stripRestangular(response);
                $scope.originalRelayServerConf.relayserver = angular.copy($scope.relayServerConf.relayserver);

                MmscConfService.setMm7Agent($scope.relayServerConf.mm7Agent).then(function (response) {
                    $log.debug('Updated config:', response);

                    $scope.relayServerConf.mm7Agent = Restangular.stripRestangular(response);
                    $scope.originalRelayServerConf.mm7Agent = angular.copy($scope.relayServerConf.mm7Agent);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Error: ', response);
                });

            }, function (response) {
                $log.debug('Error: ', response);
            });
        };
        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });

    MmscConfigurationModule.controller('MmscOperatorsConfigurationCtrl', function ($scope, $state, $log, $translate, Restangular, MmscConfService, notification, agent, SURPLUSRECIPIENTSPOLICY) {
        $log.debug('MmscOperatorsConfigurationCtrl');
        $scope.mm4Agent = agent;
        $scope.policies = SURPLUSRECIPIENTSPOLICY;
        if(agent.policy=='Accept') {
            $scope.policy=SURPLUSRECIPIENTSPOLICY[0];
        } else {
            $scope.policy=SURPLUSRECIPIENTSPOLICY[1];
        }

        $scope.originalmm4Agent = angular.copy($scope.mm4Agent);
        $scope.originalpolicy = angular.copy($scope.policy);
        $scope.isConfigurationNotChanged = function () {
            return angular.equals($scope.originalmm4Agent, $scope.mm4Agent) && angular.equals($scope.originalpolicy, $scope.policy);
        };

        $scope.save = function () {
            if($scope.policy==SURPLUSRECIPIENTSPOLICY[0]) {
                $scope.mm4Agent.policy='Accept';
            } else {
                $scope.mm4Agent.policy='Reject';
            }
            MmscConfService.setMm4Agent($scope.mm4Agent).then(function (response) {
                $log.debug('Updated config:', response);
                var updateResponse = Restangular.stripRestangular(response);
                if (updateResponse.errorCode) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: updateResponse.errorCode,
                            errorText: updateResponse.errorMsg
                        })
                    });
                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                    $scope.mm4Agent = updateResponse;
                    $scope.originalmm4Agent = angular.copy($scope.mm4Agent);
                    $scope.originalpolicy = angular.copy($scope.policy);
                }
            }, function (response) {
                $log.debug('Error: ', response);
            });
        };
        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });

    MmscConfigurationModule.controller('MmscExternalServersConfigurationCtrl', function ($scope, $state, $log, $translate, Restangular, MmscConfService, notification, agent, SURPLUSRECIPIENTSPOLICY, MMSC_DELIVERY_REPORT_POLICY) {
        $log.debug('MmscExternalServersConfigurationCtrl');
        $scope.mm3Agent = agent;
        $scope.policies = SURPLUSRECIPIENTSPOLICY;
        if(agent.policy=='Accept') {
            $scope.policy=SURPLUSRECIPIENTSPOLICY[0];
        } else {
            $scope.policy=SURPLUSRECIPIENTSPOLICY[1];
        }

        $scope.deliveryReportPolicies = MMSC_DELIVERY_REPORT_POLICY.slice(0,2);
        $scope.deliveryReportPolicy = MMSC_DELIVERY_REPORT_POLICY[agent.deliveryReportPolicy];

        $scope.originalmm3Agent = angular.copy($scope.mm3Agent);
        $scope.originalpolicy = angular.copy($scope.policy);
        $scope.isConfigurationNotChanged = function () {
            return angular.equals($scope.originalmm3Agent, $scope.mm3Agent) 
                && angular.equals($scope.originalpolicy, $scope.policy)
                && angular.equals(MMSC_DELIVERY_REPORT_POLICY[agent.deliveryReportPolicy], $scope.deliveryReportPolicy);
        };

        $scope.save = function () {
            if($scope.policy==SURPLUSRECIPIENTSPOLICY[0]) {
                $scope.mm3Agent.policy='Accept';
            } else {
                $scope.mm3Agent.policy='Reject';
            }
            $scope.mm3Agent.deliveryReportPolicy = MMSC_DELIVERY_REPORT_POLICY.indexOf($scope.deliveryReportPolicy);
            MmscConfService.setMm3Agent($scope.mm3Agent).then(function (response) {
                $log.debug('Updated config:', response);
                var updateResponse = Restangular.stripRestangular(response);
                if (updateResponse.errorCode) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: updateResponse.errorCode,
                            errorText: updateResponse.errorMsg
                        })
                    });
                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                    $scope.mm3Agent = updateResponse;
                    $scope.originalmm3Agent = angular.copy($scope.mm3Agent);
                    $scope.originalpolicy = angular.copy($scope.policy);
                }
            }, function (response) {
                $log.debug('Error: ', response);
            });
        };
        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });

    MmscConfigurationModule.controller('MmscUserAgentsConfigurationCtrl', function ($scope, $state, $log, $translate, Restangular, MmscConfService, notification, agent, SURPLUSRECIPIENTSPOLICY, MMSC_DELIVERY_REPORT_POLICY) {
        $log.debug('MmscUserAgentsConfigurationCtrl');
        $scope.mm1Agent = agent;
        $scope.policies = SURPLUSRECIPIENTSPOLICY;
        if(agent.policy=='Accept') {
            $scope.policy=SURPLUSRECIPIENTSPOLICY[0];
        } else {
            $scope.policy=SURPLUSRECIPIENTSPOLICY[1];
        }
        $scope.deliveryReportPolicies = MMSC_DELIVERY_REPORT_POLICY;
        $scope.deliveryReportPolicy = MMSC_DELIVERY_REPORT_POLICY[agent.deliveryReportPolicy]

        $scope.originalmm1Agent = angular.copy($scope.mm1Agent);
        $scope.originalpolicy = angular.copy($scope.policy);
        $scope.isConfigurationNotChanged = function () {
            return angular.equals($scope.originalmm1Agent, $scope.mm1Agent) 
                && angular.equals($scope.originalpolicy, $scope.policy) 
                && angular.equals(MMSC_DELIVERY_REPORT_POLICY[agent.deliveryReportPolicy], $scope.deliveryReportPolicy);
        };

        $scope.save = function () {
            if($scope.policy==SURPLUSRECIPIENTSPOLICY[0]) {
                $scope.mm1Agent.policy='Accept';
            } else {
                $scope.mm1Agent.policy='Reject';
            }
            $scope.mm1Agent.deliveryReportPolicy = MMSC_DELIVERY_REPORT_POLICY.indexOf($scope.deliveryReportPolicy);
            MmscConfService.setMm1Agent($scope.mm1Agent).then(function (response) {
                $log.debug('Updated config:', response);
                var updateResponse = Restangular.stripRestangular(response);
                if (updateResponse.errorCode) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: updateResponse.errorCode,
                            errorText: updateResponse.errorMsg
                        })
                    });
                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                    $scope.mm1Agent = updateResponse;
                    $scope.originalmm1Agent = angular.copy($scope.mm1Agent);
                    $scope.originalpolicy = angular.copy($scope.policy);
                }
            }, function (response) {
                $log.debug('Error: ', response);
            });
        };
        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });

    MmscConfigurationModule.constant('SURPLUSRECIPIENTSPOLICY', [
        'ACCEPT','REJECT'
    ]);

})();
