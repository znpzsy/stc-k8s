(function () {
    'use strict';

    angular.module("partnerportal", [
        "ui.router",
        "ui.bootstrap",
        "ui.select",
        "ngSanitize",
        "ngCookies",
        "ngTable",
        "ngTableExport",
        "pascalprecht.translate",
        "restangular",
        "notification",
        "elasticsearch",
        "hljs",
        "ngFileUpload",
        "ngIdle",
        "angular-loading-bar",
        "cfp.loadingBar",
        // Application specific modules
        "Application.constants",
        "Application.controllers",
        "Application.directives",
        "Application.filters",
        "Application.services",
        "Application.rest-services",
        "Application.authorization-services",
        "partnerportal.login",
        "partnerportal.login",
        "partnerportal.forgotpassword",
        "partnerportal.firsttimelogin",
        "partnerportal.registration",
        "partnerportal.partnerregistration",
        "partnerportal.partner-info",
        "partnerportal.partner-profile",
        "partnerportal.workflows",
        "partnerportal.idleservice"
    ]);

    var PartnerPortalApplicationModule = angular.module('partnerportal');

    var DEFAULT_STATE_NAME = 'partner-info.reporting-dashboards';

    PartnerPortalApplicationModule.run(function ($rootScope, $log, $q, $timeout, $translate, $document, $http, notification, Restangular, SessionService, $sce, $state, $stateParams,
                                                 IdleServiceFactory, UtilService, AuthorizationService, CMPFService, WorkflowsService, DateTimeConstants, cfpLoadingBar,
                                                 PartnerPortalMainPromiseTracker, DEFAULT_REST_QUERY_LIMIT) {
        // Bind all events of the idle service to listen idle events when the application has loaded.
        IdleServiceFactory.bindEvents();

        $rootScope.cfpLoadingBar = cfpLoadingBar;

        $rootScope.Validators = UtilService.Validators;
        $rootScope.setError = UtilService.setError;

        $rootScope.DateTimeConstants = DateTimeConstants;

        $rootScope.AuthorizationService = AuthorizationService;

        $rootScope.SessionService = SessionService;

        $rootScope.DEFAULT_STATE_NAME = DEFAULT_STATE_NAME;
        $rootScope.DEFAULT_ORGANIZATION_NAME = CMPFService.DEFAULT_ORGANIZATION_NAME;

        SessionService.setResourceNameHeader();

        var getAndUpdateUserAccountAndPartnerInformation = function (systemUserId) {
            // Get and write the user account to the session store.
            CMPFService.getUserAccount(systemUserId, true, true).then(function (userAccountResponse) {
                UtilService.putToSessionStore(UtilService.USER_ACCOUNT_KEY, userAccountResponse);

                // Get the organization of the user account and write to the session store.
                CMPFService.getPartnerById(userAccountResponse.organizationId).then(function (partner) {
                    var partnerSimple = Restangular.stripRestangular(partner);

                    UtilService.putToSessionStore(UtilService.USER_ORGANIZATION_KEY, partnerSimple);
                });
            });
        }

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

            // Get user account information from CMPF and its partner details also.
            getAndUpdateUserAccountAndPartnerInformation($rootScope.systemUserId);
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

        $rootScope.getTaskCount = function () {
            return SessionService.getTaskCount();
        };

        $rootScope.isSessionValid = function () {
            return SessionService.isSessionValid();
        };

        $rootScope.logout = function () {
            // Stop idle watch.
            IdleServiceFactory.idleUnwatch();

            return SessionService.logout();
        };

        // Gets username of the current logged in user
        $rootScope.getUsername = function () {
            var username = SessionService.getUsername();

            return username;
        };

        // Gets organization of the current logged in user
        $rootScope.getOrganization = function () {
            return SessionService.getSessionOrganization();
        };

        // Gets organization state of the current organization of logged in user
        $rootScope.getOrganizationState = function () {
            var organization = SessionService.getSessionOrganization();

            return organization.state;
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

        // Check the latest state and redirect there.
        $rootScope.redirectLatestState = function () {
            // Check the latest state requested by user. If there is any state saved then redirect to it instead
            // to redirect dashboard as default.
            var latestState = UtilService.getFromSessionStore(UtilService.LATEST_STATE);
            if (!_.isEmpty(latestState)) {
                UtilService.removeFromSessionStore(UtilService.LATEST_STATE);

                var latestStateDate = new Date(latestState.date);
                var currentDate = new Date();
                if ((currentDate.getTime() - latestStateDate.getTime()) < (60 * 60 * 1000)) {
                    event.preventDefault(); // Breaks continue to state changing.

                    $state.go(latestState.state, latestState.params);
                } else {
                    $state.go(DEFAULT_STATE_NAME, null);
                }
            } else {
                $state.go(DEFAULT_STATE_NAME, null);
            }
        };

        var deferreds = [];
        // Shows the main indicator while the loading time of templates.
        $rootScope.$on('$viewContentLoading', function (event, viewConfig) {
            deferreds[event.targetScope.$id] = PartnerPortalMainPromiseTracker.createPromise();
        });
        $rootScope.$on('$viewContentLoaded', function (event) {
            $timeout(function () {
                deferreds[event.targetScope.$id].resolve();
            }, 1000);
        });

        // State change START event
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            // Check session validity
            if ($rootScope.isSessionValid()) {
                event.preventDefault(); // Breaks continue to state changing.

                var isPermitted = true;
                if (toState.data && toState.data.permissions) {
                    isPermitted = AuthorizationService.checkPermissionList(toState.data.permissions);
                }

                var userAccountResponse = SessionService.getUserAccount();

                var userProfiles = CMPFService.getProfileAttributes(userAccountResponse.profiles, CMPFService.USER_PROFILE_NAME);
                if (userProfiles.length > 0 && userProfiles[0].IsPwdResetForcedAtFirstLogin) {
                    $rootScope.showSessionIdentifiers = true;

                    $state.go('firsttimelogin.changepassword', toParams, {notify: false}).then(function (state) {
                        $rootScope.$broadcast('$stateChangeSuccess', state, null);
                    });
                } else {
                    var partner = SessionService.getSessionOrganization();

                    if (partner && partner.profiles && partner.profiles.length > 0) {
                        // Check the necessary registration profile. If there is no profile attached to the provider, then invalidate the session.
                        var providerRegistrationProfiles = CMPFService.getProfileAttributes(partner.profiles, CMPFService.SERVICE_PROVIDER_REGISTRATION_PROFILE);
                        if (providerRegistrationProfiles.length > 0) {
                            var providerRegistrationProfile = providerRegistrationProfiles[0];
                            if (providerRegistrationProfile.IsEmailVerified && providerRegistrationProfile.IsMobilePhoneVerified) {
                                $rootScope.isRegistrationCompleted = providerRegistrationProfile.IsRegistrationCompleted;

                                if ($rootScope.isRegistrationCompleted) {
                                    $rootScope.showSessionIdentifiers = true;

                                    // Continue if registration completed.
                                    if (toState.name === 'login' || toState.name === 'firsttimelogin.changepassword' || toState.name === 'partnerregistration.register') {
                                        $state.go(DEFAULT_STATE_NAME, null, {notify: false}).then(function (state) {
                                            $rootScope.$broadcast('$stateChangeSuccess', state, null);
                                        });
                                    } else {
                                        // For checking the actual user id on the CMPF and taking general profile attributes of found user account.
                                        if (isPermitted) {
                                            var doDeferred1 = $q.defer();
                                            if (!$rootScope.defaultOrganization) {
                                                CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_ORGANIZATION_NAME).then(function (defaultOrganization) {
                                                    $rootScope.defaultOrganization = defaultOrganization.organizations[0];
                                                    doDeferred1.resolve();
                                                });
                                            } else {
                                                doDeferred1.resolve();
                                            }

                                            var doDeferred2 = $q.defer();
                                            doDeferred1.promise.then(function () {
                                                if (!$rootScope.defaultRBTOrganization) {
                                                    CMPFService.getAllOrganizationsByExactName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_RBT_ORGANIZATION_NAME).then(function (defaultRBTOrganization) {
                                                        $rootScope.defaultRBTOrganization = defaultRBTOrganization.organizations[0];
                                                        if (!$rootScope.defaultRBTOrganization) {
                                                            $rootScope.defaultRBTOrganization = {};
                                                        }
                                                        doDeferred2.resolve();
                                                    });
                                                } else {
                                                    doDeferred2.resolve();
                                                }
                                            });

                                            doDeferred2.promise.then(function () {
                                                // After the above checking, continues to the requested state.
                                                $state.go(toState.name, toParams, {
                                                    reload: true,
                                                    notify: false
                                                }).then(function (state) {
                                                    $rootScope.$broadcast('$stateChangeSuccess', state, null);
                                                });
                                            });
                                        }
                                    }
                                } else {
                                    WorkflowsService.getPendingPartnerTasks(userAccountResponse.userName, partner.name).then(function (tasksResponse) {
                                        var isPendingRegistrationTask = false;
                                        if (tasksResponse && tasksResponse.length > 0) {
                                            isPendingRegistrationTask = (_.findWhere(tasksResponse, {name: 'Partner Register Task'}) !== undefined);
                                        }

                                        if (!isPendingRegistrationTask) {
                                            $rootScope.showSessionIdentifiers = true;

                                            $state.go('partnerregistration.register', toParams, {notify: false}).then(function (state) {
                                                $rootScope.$broadcast('$stateChangeSuccess', state, null);
                                            });
                                        } else {
                                            notification({
                                                type: 'warning',
                                                text: $translate.instant('FirstPartnerRegistration.AlreadyPendingRegistration')
                                            });

                                            SessionService.sessionInvalidate();

                                            $state.go('login', {refresh: UtilService.getCurrentNanoTime()}, {notify: false}).then(function (state) {
                                                $rootScope.$broadcast('$stateChangeSuccess', state, null);
                                            });
                                        }
                                    }, function () {
                                        SessionService.sessionInvalidate();
                                    });
                                }
                            } else {
                                SessionService.sessionInvalidate();
                            }
                        } else {
                            SessionService.sessionInvalidate();
                        }
                    } else {
                        SessionService.sessionInvalidate();
                    }
                }
            } else {
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

    PartnerPortalApplicationModule.config(function ($translateProvider, RestangularProvider, $stateProvider, $urlRouterProvider, $logProvider, $qProvider,
                                                    IdleConfServiceProvider, IdleProvider, KeepaliveProvider, $httpProvider, cfpLoadingBarProvider, hljsServiceProvider) {
        // Configure JSON highlighter
        hljsServiceProvider.setOptions({});

        // Loading bar settings
        cfpLoadingBarProvider.latencyThreshold = 50;

        // Configure Idle settings
        IdleProvider.idle(IdleConfServiceProvider.conf.idle);
        IdleProvider.timeout(IdleConfServiceProvider.conf.timeout);
        IdleProvider.windowInterrupt(IdleConfServiceProvider.conf.window_interrupt);
        IdleProvider.setLocalStorageKey('dsp-pp-mobily-sa');
        KeepaliveProvider.interval(IdleConfServiceProvider.conf.keepalive_interval);

        $translateProvider.useStaticFilesLoader({
            prefix: 'i18n/',
            suffix: '.json'
        });

        $translateProvider.preferredLanguage('en');
        $translateProvider.useCookieStorage();
        $translateProvider.useSanitizeValueStrategy(null);
        $translateProvider.storagePrefix('DSP_PP_MOBILY_SA_');

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

        // For any unmatched url, send to reporting section as default
        $urlRouterProvider.otherwise(function ($injector) {
            var $state = $injector.get("$state");

            $state.go(DEFAULT_STATE_NAME);
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
                            if (((response.config.url.indexOf('pentaho') === -1) &&
                                (response.config.url.indexOf('otp-rest') === -1) &&
                                response.status !== 401 && response.status !== 406) || response.status > 500) {
                                UtilService.showResponseErrorNotification(response);
                            }
                        }
                    }

                    return $q.reject(response);
                }
            };
        }]);
    });

    PartnerPortalApplicationModule.directive('partnerportalCommonTemplates', function () {
        return {
            restrict: 'E',
            templateUrl: 'partials/templates.html'
        };
    });

})();
