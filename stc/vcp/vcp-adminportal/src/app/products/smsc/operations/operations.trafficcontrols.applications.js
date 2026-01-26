(function () {

    'use strict';

    angular.module('adminportal.products.smsc.operations.trafficcontrols.applications', []);

    var SmscApplicationsOperationsModule = angular.module('adminportal.products.smsc.operations.trafficcontrols.applications');

    SmscApplicationsOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('products.smsc.operations.trafficcontrols.applications', {
            abstract: true,
            url: "/per-application",
            template: "<div ui-view></div>",
            resolve: {
                smppApplications: function (SmscProvService) {
                    return SmscProvService.getAllSMPPApplications();
                },
                organizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizations(0, DEFAULT_REST_QUERY_LIMIT);
                }
            }
        }).state('products.smsc.operations.trafficcontrols.applications.list', {
            url: "/{appId:[0-9]*}",
            templateUrl: "products/smsc/operations/operations.trafficcontrols.applications.html",
            controller: 'SmscApplicationsOperationsCtrl',
            resolve: {
                throttlerConfiguration: function ($stateParams, SmscConfService) {
                    var appId = $stateParams.appId;

                    if (appId) {
                        return SmscConfService.getSMPPApplicationThrottler(appId);
                    }

                    return {};
                }
            }
        });

    });

    SmscApplicationsOperationsModule.controller('SmscApplicationsOperationsCtrl', function ($scope, $state, $stateParams, $log, $filter, $translate, notification, Restangular,
                                                                                                          SmscConfService, throttlerConfiguration, smppApplications, organizations) {
        $log.debug('SmscApplicationsOperationsCtrl');

        $scope.throttlerConfiguration = Restangular.stripRestangular(throttlerConfiguration);

        $scope.originalThrottlerConfiguration = angular.copy($scope.throttlerConfiguration);
        $scope.isUnchanged = function () {
            return angular.equals($scope.originalThrottlerConfiguration, $scope.throttlerConfiguration);
        };

        var smppApplicationList = Restangular.stripRestangular(smppApplications);
        var organizationList = Restangular.stripRestangular(organizations).organizations;

        // Initialize application list by taking organization and application names.
        $scope.smppApplicationList = _.filter(smppApplicationList, function (smppApplication) {
            smppApplication.organization = _.findWhere(organizationList, {id: smppApplication.organizationId});

            // Preparing the uib-dropdown content ad "<organization name> - <application name>"
            smppApplication.label = (smppApplication.organization ? smppApplication.organization.name + ' - ' : '') + smppApplication.name;

            $log.debug("Found SMPP Application: ", smppApplication, ", Organization: ", smppApplication.organization);

            return true;
        });
        $scope.smppApplicationList = $filter('orderBy')($scope.smppApplicationList, ['organization.name', 'name']);
        $scope.smppApplication = {};

        if ($stateParams.appId) {
            $scope.showForm = true;
        }

        // Check the if any application selected before and send over URL.
        var selectedSMPPApplication = _.findWhere($scope.smppApplicationList, {id: Number($stateParams.appId)});
        if (selectedSMPPApplication) {
            $scope.smppApplication.selected = selectedSMPPApplication;
        }

        // Triggers when application has changed on the form and takes selected application to use it for getting latest threshold values.
        $scope.changeSMPPApplication = function (selectedSMPPApplication) {
            $log.debug("Selected SMPP Application: ", selectedSMPPApplication);

            $state.transitionTo($state.$current, {appId: selectedSMPPApplication ? selectedSMPPApplication.id : undefined}, {
                reload: false,
                inherit: false,
                notify: true
            });
        };

        $scope.save = function (throttlerConfiguration) {
            $log.debug('Save Vas Application thresholds: ', throttlerConfiguration);

            var throttlerConfigurationItem = {
                "throttleForIncoming": throttlerConfiguration.throttleForIncoming,
                "tps": throttlerConfiguration.tps
            };

            var appId = $scope.smppApplication.selected ? $scope.smppApplication.selected.id : null;

            SmscConfService.updateSMPPApplicationThrottler(appId, throttlerConfigurationItem).then(function (response) {
                $log.debug('Subscribers SMPP traffic threshold updated successfully. Response: ', response);

                $scope.originalThrottlerConfiguration = angular.copy($scope.throttlerConfiguration);

                notification({
                    type: 'success',
                    text: $translate.instant('Products.SMSC.Operations.TrafficControls.Messages.ApplicationBasedUpdatedSuccessfully')
                });
            }, function (response) {
                $log.debug('Cannot update subscribers traffic threshold (SMPP input rates). Error: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };

    });

})();
