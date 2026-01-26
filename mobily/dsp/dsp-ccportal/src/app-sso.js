(function () {
    'use strict';

    angular.module("ccportal", [
        "ui.router",
        "ui.bootstrap",
        "ui.select",
        "ngSanitize",
        "ngCookies",
        "ngTable",
        "ngTableExport",
        "ngIdle",
        "ngFileUpload",
        "angular-loading-bar",
        "pascalprecht.translate",
        "restangular",
        "notification",
        "elasticsearch",
        "hljs",
        "cfp.loadingBar",
        // Application specific modules
        "Application.constants",
        "Application.controllers",
        "Application.directives",
        "Application.filters",
        "Application.services",
        "Application.rest-services",
        "Application.authorization-services",
        "ccportal.config",
        "ccportal.login",
        "ccportal.loginsso",
        "ccportal.unauthorized",
        "ccportal.users",
        "ccportal.diagnostics",
        "ccportal.dashboard",
        "ccportal.subscriber-info",
        "ccportal.idleservice"
    ]);

    var CCPortalApplicationModule = angular.module('ccportal');

    CCPortalApplicationModule.run(function ($rootScope, $log, $timeout, $translate, $document, $window, $http, $controller, notification, Restangular, SessionService, $sce, $state, $stateParams,
                                            IdleServiceFactory, UtilService, SSMSubscribersService, CMPFService, AuthorizationService, DateTimeConstants, CURRENCY,
                                            CCPortalMainPromiseTracker, DEFAULT_REST_QUERY_LIMIT) {
        $rootScope.showPage = true;

        $rootScope.isSSOApplication = true;

        // Bind all events of the idle service to listen idle events when the application has loaded.
        IdleServiceFactory.bindEvents();

        $rootScope.UtilService = UtilService;

        $rootScope.SessionService = SessionService;

        $rootScope.Validators = UtilService.Validators;

        $rootScope.DateTimeConstants = DateTimeConstants;

        $rootScope.AuthorizationService = AuthorizationService;

        $rootScope.CURRENCY = CURRENCY;

        SessionService.setResourceNameHeader();

        if (SessionService.isSessionValid()) {
            // Start to watch idle state at browser refresh.
            IdleServiceFactory.idleWatch();

            // Get user rights from session storage
            var userRights = SessionService.getSessionUserRights();
            AuthorizationService.setUserRights(userRights.rights);

            // Update current session token
            var sessionKey = SessionService.getSessionKey();
            SessionService.setAuthorizationHeader(sessionKey.token);
            var jwt = UtilService.parseJwt(sessionKey.token);

            $rootScope.systemUserId = jwt.sub.cmpfToken.uid;

            // Get groups of the user.
            CMPFService.getUserAccountGroups($rootScope.systemUserId, 0, DEFAULT_REST_QUERY_LIMIT).then(function (accountGroupsResponse) {
                // Get the group for super admin user. If the user included to this group, then pass the organization id checks.
                // DSP_CUSTOMER_CARE_ADMIN_GROUP: 'DSP Customer Care Admin'
                var userAdminGroup = _.findWhere(accountGroupsResponse.userGroups, {name: CMPFService.DSP_CUSTOMER_CARE_ADMIN_GROUP});

                UtilService.putToSessionStore(UtilService.USER_IS_ADMIN_KEY, !_.isUndefined(userAdminGroup));
            });
        } else {
            // Stop idle watch.
            IdleServiceFactory.idleUnwatch();
        }

        $rootScope.$state = $state;

        $rootScope.$stateParams = $stateParams;

        $rootScope.go = function (route) {
            $state.go(route);
        };

        $rootScope.reload = function () {
            $state.reload();
        };

        $rootScope.isSessionValid = function () {
            return SessionService.isSessionValid();
        };

        $rootScope.logout = function () {
            // Stop idle watch.
            IdleServiceFactory.idleUnwatch();

            return SessionService.logout();
        };

        // Checks whether any subscriber found from cmpf
        $rootScope.isSubscriberFound = function () {
            var subscriberProfile = UtilService.getFromSessionStore(UtilService.SUBSCRIBER_PROFILE_KEY);

            return !_.isEmpty(subscriberProfile);
        };

        // Gets state of current subscriber
        $rootScope.getSubscriberState = function () {
            var subscriberProfile = UtilService.getFromSessionStore(UtilService.SUBSCRIBER_PROFILE_KEY);

            return subscriberProfile.state ? subscriberProfile.state.currentState : 'N/A';
        };

        // Check state of current subscriber
        $rootScope.isSubscriberActive = function () {
            var subscriberProfile = UtilService.getFromSessionStore(UtilService.SUBSCRIBER_PROFILE_KEY);

            return $rootScope.isSubscriberFound() ? (subscriberProfile.state ? subscriberProfile.state.currentState === 'ACTIVE' : false) : false;
        };

        // Gets phone number of current subscriber
        $rootScope.getMsisdn = function () {
            var subscriberProfile = UtilService.getFromSessionStore(UtilService.SUBSCRIBER_PROFILE_KEY);

            return subscriberProfile.msisdn;
        };

        // Gets username of the current logged in user
        $rootScope.getUsername = function () {
            var username = SessionService.getUsername();

            return username;
        };

        // Gets organization name of the current logged in user
        $rootScope.getOrganizationName = function () {
            var organization = SessionService.getSessionOrganization();

            return organization.name;
        };

        // Gets organization id of the current logged in user
        $rootScope.getOrganizationId = function () {
            return SessionService.getSessionOrganizationId();
        };

        var deferreds = [];
        // Shows the main indicator while the loading time of templates.
        $rootScope.$on('$viewContentLoading', function (event, viewConfig) {
            deferreds[event.targetScope.$id] = CCPortalMainPromiseTracker.createPromise();
        });
        $rootScope.$on('$viewContentLoaded', function (event) {
            $timeout(function () {
                deferreds[event.targetScope.$id].resolve();
            }, 1000);
        });

        // State change START event
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            // Parse query string parameters and set it to the root scope.
            $rootScope.queryStringParams = UtilService.getQueryStringObject($window.location);

            if (toState.name === 'unauthorized') {
                event.preventDefault(); // Breaks continue to state changing.

                // Redirect to the unauthorized state directly without question mark if there is.
                if ($window.location.href.indexOf('?') > -1) {
                    $window.location.href = 'app-sso.html#!/unauthorized';
                }

                $state.go(toState.name, toParams, {reload: true, notify: false}).then(function (state) {
                    // Stop idle watch.
                    IdleServiceFactory.idleUnwatch();

                    // Invalidate the session first
                    SessionService.sessionInvalidate();

                    $rootScope.$broadcast('$stateChangeSuccess', state, null);
                });
            } else {
                // Get the sso token id and save it to the session.
                if ($window.location.search && $rootScope.queryStringParams &&
                    $rootScope.queryStringParams.username && $rootScope.queryStringParams.password && $rootScope.queryStringParams.msisdn) {

                    event.preventDefault(); // Breaks continue to state changing.

                    var username = $rootScope.queryStringParams.username;
                    var password = $rootScope.queryStringParams.password;
                    var msisdn = $rootScope.queryStringParams.msisdn;
                    var credentials = {
                        username: username,
                        password: password,
                        msisdn: msisdn
                    };

                    $controller('LoginSSOCtrl', {$scope: event.currentScope});

                    event.currentScope.login(credentials);
                } else {
                    if (!$rootScope.isSessionValid()) {
                        $log.debug("Session is invalid!");

                        if (toState.name !== 'login') {
                            // Save the requested state to the session storage to be able to use it after succeeded login.
                            UtilService.putToSessionStore(UtilService.LATEST_STATE, {
                                state: toState.name,
                                params: toParams,
                                date: new Date()
                            });
                        }

                        event.preventDefault(); // Breaks continue to state changing.

                        $window.location.href = 'app-sso.html#!/unauthorized';
                    } else {
                        // Check the latest state requested by user.
                        var latestState = UtilService.getFromSessionStore(UtilService.LATEST_STATE);
                        if (!_.isEmpty(latestState)) {
                            UtilService.removeFromSessionStore(UtilService.LATEST_STATE);

                            var latestStateDate = new Date(latestState.date);
                            var currentDate = new Date();
                            if ((currentDate.getTime() - latestStateDate.getTime()) < (60 * 60 * 1000)) {
                                event.preventDefault(); // Breaks continue to state changing.

                                $state.go(latestState.state, latestState.params);
                            }
                        } else {
                            event.preventDefault(); // Breaks continue to state changing.

                            var isPermitted = true;

                            AuthorizationService.getPermissions($rootScope.systemUserId).then(function (authorizeResponse) {
                                var extractedUserRights = AuthorizationService.extractUserRights(authorizeResponse);
                                if (!_.isEmpty(extractedUserRights)) {
                                    AuthorizationService.storeUserRights(extractedUserRights);

                                    // Check the permissions of state.
                                    if (toState.data && toState.data.permissions) {
                                        isPermitted = AuthorizationService.checkPermissionList(toState.data.permissions);
                                    }

                                    if (isPermitted) {
                                        var msisdn = UtilService.getSubscriberMsisdn();

                                        // For checking the actual MSISDN on the CMPF and taking general profile attributes of found subscriber.
                                        if (!fromParams.doNotQuerySubscriberAtStateChange && !toState.data.doNotQuerySubscriberAtStateChange) {
                                            SSMSubscribersService.getSubscriberByMsisdn(msisdn).then(function (response) {
                                                // Then continues through the requested state after grabbed the subscriber profile from the CMPF.
                                                $state.go(toState.name, toParams, {
                                                    reload: true,
                                                    notify: false
                                                }).then(function (state) {
                                                    $rootScope.$broadcast('$stateChangeSuccess', state, null);
                                                });
                                            });
                                        } else {
                                            // Then continues through the requested state after grabbed the subscriber profile from the CMPF.
                                            $state.go(toState.name, toParams, {
                                                reload: true,
                                                notify: false
                                            }).then(function (state) {
                                                $rootScope.$broadcast('$stateChangeSuccess', state, null);
                                            });
                                        }
                                    }
                                }
                            });
                        }
                    }
                }
            }
        });

        // State change SUCCESS event
        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            $log.debug('$stateChangeSuccess event: ', event, toState, toParams, fromState, fromParams);

            if (toState.data && toState.data.headerKey !== undefined) {
                $translate(toState.data.headerKey).then(function (header) {
                    toState.data.title = $sce.trustAsHtml(header);

                    $translate('ApplicationTitle').then(function (title) {
                        // Remove the <sup> tag to be able to show in the browser title.
                        var headerPlain = header.replace('<sup>', '').replace('</sup>', '');

                        $document.prop('title', title + ' - ' + headerPlain);
                    });
                });
            }
        });
    });

    CCPortalApplicationModule.config(function ($translateProvider, RestangularProvider, $urlRouterProvider, $logProvider, $qProvider, IdleConfServiceProvider,
                                               IdleProvider, KeepaliveProvider, $httpProvider, cfpLoadingBarProvider, hljsServiceProvider) {
        // Configure JSON highlighter
        hljsServiceProvider.setOptions({});

        // Loading bar settings
        cfpLoadingBarProvider.latencyThreshold = 50;

        // Configure Idle settings
        IdleProvider.idle(IdleConfServiceProvider.conf.idle);
        IdleProvider.timeout(IdleConfServiceProvider.conf.timeout);
        IdleProvider.windowInterrupt(IdleConfServiceProvider.conf.window_interrupt);
        IdleProvider.setLocalStorageKey('dsp-ccp-mobily-sa');
        KeepaliveProvider.interval(IdleConfServiceProvider.conf.keepalive_interval);

        $translateProvider.useStaticFilesLoader({
            prefix: 'i18n/',
            suffix: '.json'
        });

        $translateProvider.preferredLanguage('en');
        $translateProvider.useCookieStorage();
        $translateProvider.useSanitizeValueStrategy(null);
        $translateProvider.storagePrefix('DSP_CCP_MOBILY_SA_');

        // This intercepter overrided in order to be avoiding to send payload with DELETE requests
        // since the rest server throws 405 error.
        RestangularProvider.setRequestInterceptor(function (elem, operation, path, url) {
            if (operation === 'remove' && !s.include(url, "/pentaho/api")) {
                return (_.isEmpty(elem) || (!_.isEmpty(elem) && _.isUndefined(elem.id) && _.isUndefined(elem.state))) ? undefined : elem;
            }
            return elem;
        });

        RestangularProvider.setDefaultHttpFields({timeout: 90000});

        // Debug logs can be make enable/disable according to your desire.
        $logProvider.debugEnabled(false);
        //$logProvider.debugEnabled(true);

        // For any unmatched url, send to the main page
        $urlRouterProvider.otherwise(function ($injector) {
            var $state = $injector.get("$state");
            $state.go("subscriber-info.subscriber-profile");
        });

        $qProvider.errorOnUnhandledRejections(false);

        // General response interceptor for http provider to be able to handle error responses of rest requests.
        $httpProvider.interceptors.push(['$q', '$log', '$location', '$rootScope', 'UtilService', function ($q, $log, $location, $rootScope, UtilService) {
            return {
                'responseError': function (response) {
                    if (response.status === 0) {
                        $log.debug("Connection error...");
                    } else if (response.status === 400) {
                        $log.debug("Bad request...");
                    } else if (response.status === 401) {
                        $log.debug("Unauthorized!");
                    } else if (response.status === 403) {
                        $log.debug("Forbidden!");

                        // Logout the user from active session.
                        $rootScope.logout();
                    } else if (response.status === 404) {
                        $log.debug("Not available or resource not found...");
                    } else if (response.status === 504) {
                        $log.debug("Gateway Timeout...");

                        UtilService.showResponseErrorNotification(response);
                    } else {
                        $log.debug("Response received with HTTP error code: ", response.status);
                    }

                    if (!angular.isObject(response.data)) {
                        if (response.config) {
                            // In order to prevent request errors of pentaho authentication errors.
                            if (((response.config.url.indexOf('pentaho') === -1) && response.status !== 401 && response.status !== 406) || response.status > 500) {
                                UtilService.showResponseErrorNotification(response);
                            }
                        }
                    }

                    return $q.reject(response);
                }
            };
        }]);
    });

    CCPortalApplicationModule.directive('ccportalCommonTemplates', function () {
        return {
            restrict: 'E',
            templateUrl: 'partials/templates.html'
        };
    });

})();
