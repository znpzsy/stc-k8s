(function () {

    'use strict';

    angular.module('adminportal.products.smsc.screening-lists.vas-apps', []);

    var SmscVasAppsScreeningListsModule = angular.module('adminportal.products.smsc.screening-lists.vas-apps');

    SmscVasAppsScreeningListsModule.config(function ($stateProvider) {

        // Incoming
        $stateProvider.state('products.smsc.screening-lists.incoming.vas-apps', {
            url: "/vas-apps",
            templateUrl: "products/smsc/screening-lists/smsc-screening-lists.lists.html",
            data: {
                'pageHeaderKey': 'ScreeningLists.Incoming.PageHeader',
                'subPageHeaderKey': 'ScreeningLists.VASApps.PageHeader'
            },
            controller: function ($scope, $rootScope, $controller, $translate, Restangular, smscScopesList) {
                $scope.vasApplicationList = $rootScope.vasApplicationList;
                delete $rootScope.vasApplicationList;

                $controller('SmscScreeningListsListsCtrl', {$scope: $scope, smscScopesList: smscScopesList});
            },
            resolve: {
                smscScopesList: function ($rootScope, $q, $filter, $log, $translate, notification, Restangular, SmscProvService, CMPFService, SmscScreeningListsFactory, DEFAULT_REST_QUERY_LIMIT) {
                    var deferred = $q.defer();

                    // Gets SMPP applications from SMSC provisioning restful service.
                    CMPFService.getAllOrganizations(0, DEFAULT_REST_QUERY_LIMIT).then(function (organizations) {
                        var organizationList = Restangular.stripRestangular(organizations).organizations;

                        SmscProvService.getAllSMPPApplications().then(function (smppApplications) {
                            var smppApplicationList = Restangular.stripRestangular(smppApplications);

                            // Initialize application list by taking organization and application names.
                            $rootScope.vasApplicationList = _.filter(smppApplicationList, function (smppApplication) {
                                smppApplication.organization = _.findWhere(organizationList, {id: smppApplication.organizationId});

                                // Preparing the uib-dropdown content ad "<organization name> - <application name>"
                                smppApplication.label = (smppApplication.organization ? smppApplication.organization.name + ' - ' : '') + smppApplication.name;

                                $log.debug("Found SMPP Application: ", smppApplication, ", Organization: ", smppApplication.organization);

                                return true;
                            });
                            $rootScope.vasApplicationList = $filter('orderBy')($rootScope.vasApplicationList, ['organization.name', 'name']);

                            deferred.resolve(SmscScreeningListsFactory.getVasAppsIncomingLists());
                        }, function (response) {
                            notification({
                                type: 'danger',
                                text: $translate.instant('ScreeningLists.VASApps.Messages.VasAppsNotFound')
                            });

                            $log.debug('Error: ', response);
                        });
                    });

                    return deferred.promise;
                }
            }
        });

        // Outgoing
        $stateProvider.state('products.smsc.screening-lists.outgoing.vas-apps', {
            url: "/vas-apps",
            templateUrl: "products/smsc/screening-lists/smsc-screening-lists.lists.html",
            data: {
                'pageHeaderKey': 'ScreeningLists.Outgoing.PageHeader',
                'subPageHeaderKey': 'ScreeningLists.VASApps.PageHeader'
            },
            controller: function ($scope, $rootScope, $controller, $translate, Restangular, smscScopesList) {
                $scope.vasApplicationList = $rootScope.vasApplicationList;
                delete $rootScope.vasApplicationList;

                $controller('SmscScreeningListsListsCtrl', {$scope: $scope, smscScopesList: smscScopesList});
            },
            resolve: {
                smscScopesList: function ($rootScope, $q, $filter, $log, $translate, notification, Restangular, SmscProvService, CMPFService, SmscScreeningListsFactory, DEFAULT_REST_QUERY_LIMIT) {
                    var deferred = $q.defer();

                    // Gets SMPP applications from SMSC provisioning restful service.
                    CMPFService.getAllOrganizations(0, DEFAULT_REST_QUERY_LIMIT).then(function (organizations) {
                        var organizationList = Restangular.stripRestangular(organizations).organizations;

                        SmscProvService.getAllSMPPApplications().then(function (smppApplications) {
                            var smppApplicationList = Restangular.stripRestangular(smppApplications);

                            // Initialize application list by taking organization and application names.
                            $rootScope.vasApplicationList = _.filter(smppApplicationList, function (smppApplication) {
                                smppApplication.organization = _.findWhere(organizationList, {id: smppApplication.organizationId});

                                // Preparing the uib-dropdown content ad "<organization name> - <application name>"
                                smppApplication.label = (smppApplication.organization ? smppApplication.organization.name + ' - ' : '') + smppApplication.name;

                                $log.debug("Found SMPP Application: ", smppApplication, ", Organization: ", smppApplication.organization);

                                return true;
                            });
                            $rootScope.vasApplicationList = $filter('orderBy')($rootScope.vasApplicationList, ['organization.name', 'name']);

                            deferred.resolve(SmscScreeningListsFactory.getVasAppsOutgoingLists());
                        }, function (response) {
                            notification({
                                type: 'danger',
                                text: $translate.instant('ScreeningLists.VASApps.Messages.VasAppsNotFound')
                            });

                            $log.debug('Error: ', response);
                        });
                    });

                    return deferred.promise;
                }
            }
        });

    });

})();


