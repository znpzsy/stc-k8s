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
        //"ngFileUpload",
        "angular-loading-bar",
        "pascalprecht.translate",
        "restangular",
        "notification",
        "elasticsearch",
        //"hljs",
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
        "ccportal.usersettings",
        "ccportal.login",
        "ccportal.forgotpassword",
        "ccportal.dashboard",
        "ccportal.screening-lists",
        "ccportal.subscriber-info",
        "ccportal.products",
        "ccportal.services",
        "ccportal.subsystems",
        "ccportal.idleservice"
    ]);

    var CCPortalApplicationModule = angular.module('ccportal');

    CCPortalApplicationModule.run(function ($rootScope, $log, $timeout, $translate, $document, $http, notification, Restangular, SessionService, $sce, $state, $stateParams,
                                            IdleServiceFactory, UtilService, SSMSubscribersService, AuthorizationService, DateTimeConstants, CURRENCY, CCPortalMainPromiseTracker) {
        // Bind all events of the idle service to listen idle events when the application has loaded.
        IdleServiceFactory.bindEvents();

        $rootScope.UtilService = UtilService;

        $rootScope.SessionService = SessionService;

        $rootScope.Validators = UtilService.Validators;

        $rootScope.DateTimeConstants = DateTimeConstants;

        $rootScope.AuthorizationService = AuthorizationService;

        $rootScope.CCPortalMainPromiseTracker = CCPortalMainPromiseTracker;

        $rootScope.CURRENCY = CURRENCY;

        $rootScope.isArray = angular.isArray;

        // Is admin user
        var isAdminUserKey = UtilService.getFromSessionStore(UtilService.USER_ADMIN_KEY);
        $rootScope.isAdminUser = (isAdminUserKey !== null && !_.isUndefined(isAdminUserKey) &&  !_.isEmpty(isAdminUserKey));

        SessionService.setResourceNameHeader();

        if (SessionService.isSessionValid()) {
            // Start to watch idle state at browser refresh.
            IdleServiceFactory.idleWatch();

            // Get user rights from session storage
            var userRights = SessionService.getSessionUserRights();
            AuthorizationService.setUserRights(userRights);

            // Update current session token
            var sessionKey = SessionService.getSessionKey();
            SessionService.setAuthorizationHeader(sessionKey.token);
            var jwt = UtilService.parseJwt(sessionKey.token);

            $rootScope.systemUserId = jwt.sub.cmpfToken.uid;
            $rootScope.systemUserOrganizationId = UtilService.getFromSessionStore(UtilService.USER_ORGANIZATION_ID_KEY);
            $rootScope.systemUserOrganizationName = UtilService.getFromSessionStore(UtilService.USER_ORGANIZATION_NAME_KEY);
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

        // Checks whether any subscriber found or not.
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

            return $rootScope.isSubscriberFound() ? subscriberProfile.state === 'Active' : false;
        };

        // Gets phone number of current subscriber
        $rootScope.getMsisdn = function () {
            var subscriberProfile = UtilService.getFromSessionStore(UtilService.SUBSCRIBER_PROFILE_KEY);

            return subscriberProfile.msisdn;
        };

        // Gets site information
        $rootScope.getSiteInformation = function () {
            var siteInformation = SessionService.getSiteInformation();

            return siteInformation;
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

        // Gets site name by state name.
        $rootScope.getSiteNameByState = function (state) {
            var siteInformation = SessionService.getSiteInformation();

            var isRemote = s.contains(state.current.name, 'remote');

            if (s.contains(siteInformation.name.toLowerCase(), 'riyadh')) {
                return isRemote ? 'Jeddah' : 'Riyadh';
            } else {
                return isRemote ? 'Riyadh' : 'Jeddah';
            }
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
            if ($rootScope.isSessionValid()) {
                if (toState.name === 'login' || (!$rootScope.isSubscriberFound() && !toState.url.startsWith('/dashboard'))) {
                    event.preventDefault(); // Breaks continue to state changing.

                    $state.go('dashboards');
                } else {
                    // Check the latest state requested by user. If there is any state saved then redirect to it instead
                    // to redirect dashboard as default.
                    var latestState = UtilService.getFromSessionStore(UtilService.LATEST_STATE);
                    if (!_.isEmpty(latestState) && !toState.url.startsWith('/dashboard')) {
                        UtilService.removeFromSessionStore(UtilService.LATEST_STATE);

                        var latestStateDate = new Date(latestState.date);
                        var currentDate = new Date();
                        if ((currentDate.getTime() - latestStateDate.getTime()) < (60 * 60 * 1000)) {
                            event.preventDefault(); // Breaks continue to state changing.

                            $state.go(latestState.state, latestState.params);
                        }
                    }

                    if ((!toState.url.startsWith('/dashboard') && !fromState.url.startsWith('/dashboard'))) { // Do not get in here if user go to the '/dashboard' state from same and specifically does not pass the doNotQuerySubscriber parameter.
                        event.preventDefault(); // Breaks continue to state changing.

                        var isPermitted = true;
                        if (toState.data && toState.data.permissions) {
                            isPermitted = AuthorizationService.checkPermissionList(toState.data.permissions);
                        }

                        var msisdn = UtilService.getSubscriberMsisdn();

                        // For checking the actual MSISDN on the CMPF and taking general profile attributes of found subscriber.
                        if (isPermitted) {
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
                }
            } else { // There is no any valid session.
                $log.debug("Session is invalid!");

                event.preventDefault(); // Breaks continue to state changing.

                if (toState.name !== 'forgotpassword' && toState.name !== 'resetpassword') {
                    if (toState.name === 'login') {
                        SessionService.sessionInvalidate();
                    } else {
                        // Save the requested state to the session storage to be able to use it after succeeded login.
                        UtilService.putToSessionStore(UtilService.LATEST_STATE, {
                            state: toState.name,
                            params: toParams,
                            date: new Date()
                        });
                    }
                }

                // User redirected to the login page without notifying if the session is invalid
                if (toState.name !== 'login' && !toState.name.startsWith('registration') && !toState.name.startsWith('forgotpassword') && !toState.name.startsWith('resetpassword')) {
                    $state.go('login', null, {notify: false}).then(function (state) {
                        $rootScope.$broadcast('$stateChangeSuccess', state, null);
                    });
                } else {
                    $state.go(toState.name, toParams, {notify: false}).then(function (state) {
                        $rootScope.$broadcast('$stateChangeSuccess', state, null);
                    });
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

    CCPortalApplicationModule.config(function ($translateProvider, RestangularProvider, $urlRouterProvider, $logProvider, $qProvider,
                                               IdleConfServiceProvider, IdleProvider, KeepaliveProvider, $httpProvider, cfpLoadingBarProvider) {
        
        // // Configure JSON highlighter
        // hljsServiceProvider.setOptions({});

        // Loading bar settings
        cfpLoadingBarProvider.latencyThreshold = 50;

        // Configure Idle settings
        IdleProvider.idle(IdleConfServiceProvider.conf.idle);
        IdleProvider.timeout(IdleConfServiceProvider.conf.timeout);
        IdleProvider.windowInterrupt(IdleConfServiceProvider.conf.window_interrupt);
        IdleProvider.setLocalStorageKey('vcp-ccp-stc-sa');
        KeepaliveProvider.interval(IdleConfServiceProvider.conf.keepalive_interval);

        $translateProvider.useStaticFilesLoader({
            prefix: 'i18n/',
            suffix: '.json'
        });

        $translateProvider.preferredLanguage('en');
        $translateProvider.useCookieStorage();
        $translateProvider.useSanitizeValueStrategy(null);
        $translateProvider.storagePrefix('VCP_CCP_STC_SA_');

        // This intercepter overrided in order to be avoiding to send payload with DELETE requests
        // since the rest server throws 405 error.
        RestangularProvider.setRequestInterceptor(function (elem, operation, path, url) {
            if (operation === 'remove' && !s.include(url, "/pentaho/api")) {
                return (_.isEmpty(elem) || (!_.isEmpty(elem) && _.isUndefined(elem.id) && _.isUndefined(elem.state))) ? undefined : elem;
            }
            return elem;
        });

        RestangularProvider.setDefaultHttpFields({timeout: 60000});

        // Debug logs can be make enable/disable according to your desire.
        $logProvider.debugEnabled(true);
        //$logProvider.debugEnabled(true);

        // For any unmatched url, send to /dashboard
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
                        // In order to prevent request errors of pentaho authentication errors.
                        if (response.config) {
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

    // https://docs.angularjs.org/api/ng/function/angular.toJson
    // The Safari browser throws a RangeError instead of returning null when it tries to stringify a Date object with an invalid date value. The only reliable way to prevent this is to monkeypatch the Date.prototype.toJSON method as follows:
    var _dateToJSON = Date.prototype.toJSON;
    Date.prototype.toJSON = function () {
        try {
            return _dateToJSON.call(this);
        } catch (e) {
            if (e instanceof RangeError) {
                return null;
            }
            throw e;
        }
    };

})();
