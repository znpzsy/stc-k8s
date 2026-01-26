/**
 * Created by tayfuno on 7/24/14.
 */
(function () {

    'use strict';

    angular.module('adminportal.services.mca.configuration', []);

    var MCAConfigurationModule = angular.module('adminportal.services.mca.configuration');

    MCAConfigurationModule.config(function ($stateProvider) {

        $stateProvider.state('services.mca.configuration', {
            url: "/configurations",
            abstract: true,
            templateUrl: "services/mca/configuration/configuration.html",
            controller: 'MCACommonConfigurationCtrl'
        }).state('services.mca.configuration.mca', {
            url: "/mca",
            templateUrl: "services/mca/configuration/configuration.mca.html",
            controller: 'MCAConfigurationCtrl',
            resolve: {
                mcaRedirectionReasonsServiceConfig: function (MCAConfService) {
                    return MCAConfService.getMcaConfiguration();
                }
            }
        }).state('services.mca.configuration.mcabasic', {
            url: "/mcabasic",
            templateUrl: "services/mca/configuration/configuration.mcabasic.html",
            controller: 'MCABasicConfigurationCtrl',
            resolve: {
                mcaBasicRedirectionReasonsServiceConfig: function (MCAConfService) {
                    return MCAConfService.getMcaConfiguration();
                }
            }
        }).state('services.mca.configuration.notifyme', {
            url: "/notifyme",
            templateUrl: "services/mca/configuration/configuration.notifyme.html",
            controller: 'MCANotifyMeConfigurationCtrl',
            resolve: {
                configuration: function (MCAConfService) {
                    return MCAConfService.getNotifyMeConfiguration();
                }
            }
        }).state('services.mca.configuration.ann', {
            url: "/ann",
            templateUrl: "services/mca/configuration/configuration.ann.html",
            controller: 'MCAAnnConfigurationCtrl',
            resolve: {
                configuration: function (MCAConfService) {
                    return MCAConfService.getANNConfiguration();
                }
            }
        });

    });

    MCAConfigurationModule.controller('MCACommonConfigurationCtrl', function ($scope, $state, $log) {
        $log.debug("MCACommonConfigurationCtrl");

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });

    MCAConfigurationModule.controller('MCAConfigurationCtrl', function ($scope, $log, notification, $translate, Restangular, MCAConfService, mcaRedirectionReasonsServiceConfig) {
        $log.debug("MCAConfigurationCtrl");


        // Copy the service response to a new object to keep the original values.
        $scope.originalMCAConfiguration = angular.copy(mcaRedirectionReasonsServiceConfig);

        // Initialize the form with default values, in case the response doesn't have these set.
        // Mca Basic Redirection Reasons --> serviceConfig.basicMcnAllowedRedirectionReasons
        // whereas Mca Redirection Reasons --> serviceConfig.allowedRedirectionReasons
        $scope.mcaRedirectionFlags = {
            isUndefined: false,
            isUnreachable: false,
            isBusy: false,
            isNoAnswer: false,
            isUnconditional: false
        };

        if (mcaRedirectionReasonsServiceConfig) {
            if(mcaRedirectionReasonsServiceConfig.allowedRedirectionReasons && mcaRedirectionReasonsServiceConfig.allowedRedirectionReasons.length > 0) {
                $scope.mcaRedirectionFlags = {
                    isUndefined: mcaRedirectionReasonsServiceConfig.allowedRedirectionReasons.indexOf('UNDEFINED') > -1,
                    isUnreachable: mcaRedirectionReasonsServiceConfig.allowedRedirectionReasons.indexOf('UNREACHABLE') > -1,
                    isBusy: mcaRedirectionReasonsServiceConfig.allowedRedirectionReasons.indexOf('BUSY') > -1,
                    isNoAnswer: mcaRedirectionReasonsServiceConfig.allowedRedirectionReasons.indexOf('NOANSWER') > -1,
                    isUnconditional: mcaRedirectionReasonsServiceConfig.allowedRedirectionReasons.indexOf('UNCONDITIONAL') > -1
                };
            }
        }

        $scope.originalMcaRedirectionFlags = angular.copy($scope.mcaRedirectionFlags);

        // old code

        $scope.isMCAConfigurationNotChanged = function () {
            return angular.equals($scope.originalMcaRedirectionFlags, $scope.mcaRedirectionFlags);
        };

        $scope.saveMca = function () {
            var payload = $scope.originalMCAConfiguration;

            if ($scope.mcaRedirectionFlags) {
                var redirectionReasonsTextArr = [];

                if ($scope.mcaRedirectionFlags.isUndefined) {
                    redirectionReasonsTextArr.push('UNDEFINED');
                }
                if ($scope.mcaRedirectionFlags.isUnreachable) {
                    redirectionReasonsTextArr.push('UNREACHABLE');
                }
                if ($scope.mcaRedirectionFlags.isBusy) {
                    redirectionReasonsTextArr.push('BUSY');
                }
                if ($scope.mcaRedirectionFlags.isNoAnswer) {
                    redirectionReasonsTextArr.push('NOANSWER');
                }
                if ($scope.mcaRedirectionFlags.isUnconditional) {
                    redirectionReasonsTextArr.push('UNCONDITIONAL');
                }

                payload.allowedRedirectionReasons = redirectionReasonsTextArr.join(',');
            }

            MCAConfService.updateMcaConfiguration(payload).then(function (apiResponse) {
                // NOTES: Successful update operation returns with 200OK but no response body. Errors may vary, doesn't seem standard.
                if (apiResponse && (apiResponse.errorCode || (apiResponse.data && apiResponse.data.errorCode))) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: apiResponse.errorCode || apiResponse.data.errorCode,
                            errorText: apiResponse.message || apiResponse.data.message
                        })
                    });
                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $scope.cancel();
                }
            }, function (response) {
                $log.error('Cannot update MCA Redirection Reasons configuration. Error: ', response);
            });
        };
    });

    MCAConfigurationModule.controller('MCABasicConfigurationCtrl', function ($scope, $log, notification, $translate, Restangular, MCAConfService, mcaBasicRedirectionReasonsServiceConfig) {
        $log.debug("MCABasicConfigurationCtrl");

        // Copy the service response to a new object to keep the original values.
        $scope.originalMCABasicConfiguration = angular.copy(mcaBasicRedirectionReasonsServiceConfig);

        // Initialize the form with default values, in case the response doesn't have these set.
        // Mca Basic Redirection Reasons --> serviceConfig.basicMcnAllowedRedirectionReasons
        // whereas Mca Redirection Reasons --> serviceConfig.allowedRedirectionReasons
        $scope.mcaRedirectionFlags = {
            isUndefined: false,
            isUnreachable: false,
            isBusy: false,
            isNoAnswer: false,
            isUnconditional: false
        };

        if (mcaBasicRedirectionReasonsServiceConfig) {
            if(mcaBasicRedirectionReasonsServiceConfig.basicMcnAllowedRedirectionReasons && mcaBasicRedirectionReasonsServiceConfig.basicMcnAllowedRedirectionReasons.length > 0) {
                $scope.mcaRedirectionFlags = {
                    isUndefined: mcaBasicRedirectionReasonsServiceConfig.basicMcnAllowedRedirectionReasons.indexOf('UNDEFINED') > -1,
                    isUnreachable: mcaBasicRedirectionReasonsServiceConfig.basicMcnAllowedRedirectionReasons.indexOf('UNREACHABLE') > -1,
                    isBusy: mcaBasicRedirectionReasonsServiceConfig.basicMcnAllowedRedirectionReasons.indexOf('BUSY') > -1,
                    isNoAnswer: mcaBasicRedirectionReasonsServiceConfig.basicMcnAllowedRedirectionReasons.indexOf('NOANSWER') > -1,
                    isUnconditional: mcaBasicRedirectionReasonsServiceConfig.basicMcnAllowedRedirectionReasons.indexOf('UNCONDITIONAL') > -1
                };
            }
        }

        $scope.originalMcaRedirectionFlags = angular.copy($scope.mcaRedirectionFlags);

        $scope.isMCAConfigurationNotChanged = function () {
            return angular.equals($scope.originalMcaRedirectionFlags, $scope.mcaRedirectionFlags);
        };

        $scope.saveMca = function () {
            var payload = $scope.originalMCABasicConfiguration;

            if ($scope.mcaRedirectionFlags) {
                var redirectionReasonsTextArr = [];

                if ($scope.mcaRedirectionFlags.isUndefined) {
                    redirectionReasonsTextArr.push('UNDEFINED');
                }
                if ($scope.mcaRedirectionFlags.isUnreachable) {
                    redirectionReasonsTextArr.push('UNREACHABLE');
                }
                if ($scope.mcaRedirectionFlags.isBusy) {
                    redirectionReasonsTextArr.push('BUSY');
                }
                if ($scope.mcaRedirectionFlags.isNoAnswer) {
                    redirectionReasonsTextArr.push('NOANSWER');
                }
                if ($scope.mcaRedirectionFlags.isUnconditional) {
                    redirectionReasonsTextArr.push('UNCONDITIONAL');
                }

                payload.basicMcnAllowedRedirectionReasons = redirectionReasonsTextArr.join(',');
            }

            MCAConfService.updateMcaConfiguration(payload).then(function (apiResponse) {
                // NOTES: Successful update operation returns with 200OK but no response body. Errors may vary, doesn't seem standard.
                if (apiResponse && (apiResponse.errorCode || (apiResponse.data && apiResponse.data.errorCode))) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: apiResponse.errorCode || apiResponse.data.errorCode,
                            errorText: apiResponse.message || apiResponse.data.message
                        })
                    });
                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $scope.cancel();
                }
            }, function (response) {
                $log.error('Cannot update MCA Redirection Reasons configuration. Error: ', response);
            });
        };
    });

    MCAConfigurationModule.controller('MCANotifyMeConfigurationCtrl', function ($scope, $log, notification, $translate, Restangular, MCAConfService, ScreeningManagerService,
                                                                                configuration) {
        $log.debug("MCANotifyMeConfigurationCtrl");

        $scope.originalMCAConfiguration = angular.copy(configuration);

        if (configuration) {
            $scope.notifyMeConfiguration = configuration;
            $scope.notifyMeConfiguration.notifyMeEnabled = configuration.notifyMeEnabled;

            $scope.notifyMeConfiguration.redirectionFlags = {
                isUndefined: false,
                isUnreachable: false,
                isBusy: false,
                isNoAnswer: false,
                isUnconditional: false
            }
            if(configuration.redirectionReasonsForNotifyMe.length > 0) {
                $scope.notifyMeConfiguration.redirectionFlags = {
                    isUndefined: configuration.redirectionReasonsForNotifyMe.indexOf('UNDEFINED') > -1,
                    isUnreachable: configuration.redirectionReasonsForNotifyMe.indexOf('UNREACHABLE') > -1,
                    isBusy: configuration.redirectionReasonsForNotifyMe.indexOf('BUSY') > -1,
                    isNoAnswer: configuration.redirectionReasonsForNotifyMe.indexOf('NOANSWER') > -1,
                    isUnconditional: configuration.redirectionReasonsForNotifyMe.indexOf('UNCONDITIONAL') > -1
                };
            }

            $scope.notifyMeConfiguration.destinationPrefixForNotifyMe = configuration.destinationPrefixForNotifyMe;

        } else {
            $scope.notifyMeConfiguration = {
                notifyMeEnabled: false,
                redirectionFlags: {
                    isUndefined: false,
                    isUnreachable: false,
                    isBusy: false,
                    isNoAnswer: false,
                    isUnconditional: false
                }
            };
        }
        $scope.originalNotifyMeConfiguration = angular.copy($scope.notifyMeConfiguration);

        $scope.isNotifyMeConfigurationNotChanged = function () {
            return angular.equals($scope.originalNotifyMeConfiguration, $scope.notifyMeConfiguration);
        };

        $scope.save = function () {
            var payload = {
                notifyMeEnabled: $scope.notifyMeConfiguration.notifyMeEnabled,
                destinationPrefixForNotifyMe: $scope.notifyMeConfiguration.destinationPrefixForNotifyMe,
                notifyMeNightModeEnabled: $scope.notifyMeConfiguration.notifyMeNightModeEnabled,
                notifyMeNightModeStartTime: $scope.notifyMeConfiguration.notifyMeNightModeStartTime,
                notifyMeNightModeEndTime: $scope.notifyMeConfiguration.notifyMeNightModeEndTime
            };

            if ($scope.notifyMeConfiguration.redirectionFlags) {
                var redirectionReasonsTextArr = [];

                if ($scope.notifyMeConfiguration.redirectionFlags.isUndefined) {
                    redirectionReasonsTextArr.push('UNDEFINED');
                }
                if ($scope.notifyMeConfiguration.redirectionFlags.isUnreachable) {
                    redirectionReasonsTextArr.push('UNREACHABLE');
                }
                if ($scope.notifyMeConfiguration.redirectionFlags.isBusy) {
                    redirectionReasonsTextArr.push('BUSY');
                }
                if ($scope.notifyMeConfiguration.redirectionFlags.isNoAnswer) {
                    redirectionReasonsTextArr.push('NOANSWER');
                }
                if ($scope.notifyMeConfiguration.redirectionFlags.isUnconditional) {
                    redirectionReasonsTextArr.push('UNCONDITIONAL');
                }

                payload.redirectionReasonsForNotifyMe = redirectionReasonsTextArr.join(',');
            }

            MCAConfService.updateNotifyMeConfiguration(payload).then(function (response) {
                // NOTES: Successful update operation returns with 200OK but no response body. Errors may vary, doesn't seem standard.
                if (response && (response.errorCode || (response.data && response.data.errorCode))) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: response.errorCode || response.data.errorCode,
                            errorText: response.message || response.data.message
                        })
                    });
                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $scope.originalNotifyMeConfiguration = angular.copy($scope.notifyMeConfiguration);
                }
            }, function (response) {
                $log.error('Cannot update MCA configuration. Error: ', response);
            });
        };
    });

    MCAConfigurationModule.controller('MCAAnnConfigurationCtrl', function ($scope, $log, notification, $translate, Restangular, MCAConfService, ScreeningManagerService,
                                                                           configuration) {
        $log.debug("MCAAnnConfigurationCtrl");

        $scope.originalMCAConfiguration = angular.copy(configuration);

        var initializeForm = function (mcaConfiguration) {
            $scope.annConfiguration = {
                ANNEnabled: mcaConfiguration.annEnabled,
                ANNSetUnsetSMSEnabled: mcaConfiguration.annSetUnsetEnabled
            };

            $scope.originalANNConfiguration = angular.copy($scope.annConfiguration);
        }

        initializeForm(configuration);

        $scope.isANNConfigurationNotChanged = function () {
            return angular.equals($scope.originalANNConfiguration, $scope.annConfiguration);
        };

        $scope.save = function () {
            var payload = $scope.originalMCAConfiguration;

            payload.annEnabled = $scope.annConfiguration.ANNEnabled;
            payload.annSetUnsetEnabled = $scope.annConfiguration.ANNSetUnsetSMSEnabled;

            MCAConfService.updateANNConfiguration(payload).then(function (response) {

                // NOTES: Successful update operation returns with 200OK but no response body. Errors may vary, doesn't seem standard.
                if (response && (response.errorCode || (response.data && response.data.errorCode))) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: response.errorCode || response.data.errorCode,
                            errorText: response.message || response.data.message
                        })
                    });
                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    initializeForm(payload);
                }
            }, function (response) {
                $log.error('Cannot update MCA configuration. Error: ', response);
            });
        };
    });

})();
