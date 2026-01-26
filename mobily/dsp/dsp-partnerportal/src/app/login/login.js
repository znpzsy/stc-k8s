(function () {

    'use strict';

    angular.module('partnerportal.login', []);

    var LoginModule = angular.module('partnerportal.login');

    LoginModule.config(function ($stateProvider) {

        $stateProvider.state('login', {
            url: "/login?refresh",
            templateUrl: 'login/login.html',
            controller: 'LoginCtrl',
            data: {
                headerKey: 'Login.PageHeader'
            }
        });

    });

    LoginModule.controller('LoginCtrl', function ($scope, $rootScope, $log, $q, $http, $state, $stateParams, $timeout, $interval, $window, notification, $translate, CMPFService,
                                                  IdleServiceFactory, Restangular, UtilService, AuthorizationService, SessionService) {

        // This is a workaround to fix a view problem related to a possible autofill bug of chrome
        if ($window.chrome) {
            $log.debug('Browser is Chrome. Continue to fix autofill bug.');
            $scope.$on('$viewContentLoaded', function () {
                var username = angular.element($scope.loginForm.username)[0].$$element;
                var password = angular.element($scope.loginForm.password)[0].$$element;
                var _interval = $interval(function () {
                    if (password.is(':-webkit-autofill')) {
                        username.removeClass('ng-invalid-required');
                        password.removeClass('ng-invalid-required');

                        $interval.cancel(_interval);
                    }
                }, 50, 10); // 0.5s, 10 times
            });
        }

        $scope.captcha = {
            url: '/img/captcha.png?' + UtilService.getCurrentNanoTime(),
            enableRefresh: true
        };

        var refreshCaptcha = function () {
            if ($scope.loginForm && $scope.user) {
                $scope.loginForm.$setPristine();
                delete $scope.user.captcha;
            }

            $scope.captcha.url = '/img/captcha.png?' + UtilService.getCurrentNanoTime();
        };

        $scope.refreshCaptcha = _.throttle(function ($event) {
            $event.preventDefault();

            $scope.captcha.enableRefresh = false;
            $timeout(function () {
                refreshCaptcha();
                $scope.captcha.enableRefresh = true;
            }, 1500)
        }, 1600);

        var unauthorized = function (user) {
            $log.debug('User has no authorization: ', user.username);

            notification({
                type: 'info',
                text: $translate.instant('Login.Texts.UnauthorizedToLogin')
            });

            SessionService.sessionInvalidate();

            $scope.loginForm.$setPristine();
            delete $scope.user.password;

            refreshCaptcha();
        };

        var unauthenticated = function (user, response) {
            $log.debug('User has no authenticated: ', user.username);

            if (response && response.data && response.data.message === 'Invalid captcha!') {
                notification({
                    type: 'info',
                    text: $translate.instant('Login.Texts.InvalidCaptcha')
                });
            } else if (response && response.data && response.data.errorDescription.startsWith('Internal server error')) {
                notification({
                    type: 'warning',
                    text: response.data.errorDescription.split(': ')[1]
                });
            } else {
                notification({
                    type: 'info',
                    text: $translate.instant('Login.Texts.InvalidUsernamePassword')
                });
            }

            SessionService.sessionInvalidate();

            $scope.loginForm.$setPristine();
            delete $scope.user.password;

            refreshCaptcha();
        };

        $scope.login = function (user) {
            if ($scope.loginForm.$valid) {
                if (_.isEmpty(user)) {
                    return;
                }

                var credential = {
                    "username": user.username,
                    "password": user.password,
                    "captcha": user.captcha
                };

                // In the first step check the username and password specified through form inputs.
                var deferredUserAuthenticate = $q.defer();
                CMPFService.authenticate(credential).then(function (authenticateResponse) {
                    if (!_.isEmpty(authenticateResponse) || !authenticateResponse.token) {
                        deferredUserAuthenticate.resolve(authenticateResponse);
                    } else {
                        unauthenticated(user);
                    }
                }, function (response) {
                    if (!_.isEmpty(response.data) || response.data === '') {
                        unauthenticated(user, response);
                    } else {
                        $log.debug('Error: ', response);
                    }
                });

                // Check the permission of the found user.
                var deferredUserAuthorize = $q.defer();
                deferredUserAuthenticate.promise.then(function (authenticateResponse) {
                    authenticateResponse = Restangular.stripRestangular(authenticateResponse);

                    $log.debug('User has successfully authenticated: ', user.username, ', Response: ', authenticateResponse, ". Now user's permissions will be checked.");

                    // Put the user authentication response to be able to use on the cmpf rest service authentication with restangular requests as basic auth headers.
                    SessionService.saveUserAttributesInSession(user.username, authenticateResponse);

                    var jwt = UtilService.parseJwt(authenticateResponse.token);
                    var uid = jwt.sub.cmpfToken.uid;
                    AuthorizationService.getPermissions(uid).then(function (authorizeResponse) {
                        $log.debug('Permissions of user [', user.username, '], Authorize response: ', authorizeResponse);

                        var extractedUserRights = AuthorizationService.extractUserRights(authorizeResponse);
                        if (!_.isEmpty(extractedUserRights)) {
                            $log.debug('User logged in successfully [', user.username, '], Extracted user rights: ', extractedUserRights, '. Now customer id value will be checked.');

                            deferredUserAuthorize.resolve({
                                uid: uid,
                                extractedUserRights: extractedUserRights
                            });
                        } else {
                            unauthorized(user);
                        }
                    }, function () {
                        unauthorized(user);
                    });
                });

                // If user authenticated and authorized successfully compare user's own and entered organization id values.
                deferredUserAuthorize.promise.then(function (authenticateAndAuthorizeResponse) {
                    var uid = authenticateAndAuthorizeResponse.uid;
                    var extractedUserRights = authenticateAndAuthorizeResponse.extractedUserRights;

                    CMPFService.getUserAccount(uid, true, true).then(function (accountResponse) {
                        $log.debug('Found user account, without profiles and child attributes: ', accountResponse);

                        UtilService.putToSessionStore(UtilService.USER_ACCOUNT_KEY, accountResponse);

                        CMPFService.getUserAccountGroups(uid, false, false).then(function (accountGroupsResponse) {
                            // Get the group for super admin user. If the user included to this group, then pass the organization id checks.
                            // DSP_PARTNER_ADMIN_GROUP: 'DSP Partner Admin'
                            // DSP_PARTNER_USER_GROUP: 'DSP Partner Agent'
                            var userAdminGroup = _.findWhere(accountGroupsResponse.userGroups, {name: CMPFService.DSP_PARTNER_ADMIN_GROUP});
                            var userAgentGroup = _.findWhere(accountGroupsResponse.userGroups, {name: CMPFService.DSP_PARTNER_USER_GROUP});
                            // Unauthenticate the user if not included to any group of the above.
                            if (!userAdminGroup && !userAgentGroup) {
                                return unauthenticated(user);
                            } else {
                                UtilService.putToSessionStore(UtilService.USER_IS_ADMIN_KEY, !_.isUndefined(userAdminGroup));
                            }

                            // If the user successfully get partner of the user then.
                            CMPFService.getPartnerById(accountResponse.organizationId).then(function (partner) {
                                $log.debug('Found Partner: ', partner);

                                // Check the necessary registration profile. If there is no profile attached to the provider, then invalidate the session.
                                var providerRegistrationProfiles = CMPFService.getProfileAttributes(partner.profiles, CMPFService.SERVICE_PROVIDER_REGISTRATION_PROFILE);
                                if (providerRegistrationProfiles.length > 0) {
                                    var providerRegistrationProfile = providerRegistrationProfiles[0];
                                    if (providerRegistrationProfile.IsEmailVerified && providerRegistrationProfile.IsMobilePhoneVerified) {
                                        var partnerSimple = Restangular.stripRestangular(partner);

                                        UtilService.putToSessionStore(UtilService.USER_ORGANIZATION_KEY, partnerSimple);

                                        AuthorizationService.storeUserRights(extractedUserRights);

                                        // Start idle watch.
                                        IdleServiceFactory.idleWatch();

                                        $rootScope.redirectLatestState();
                                    } else {
                                        unauthenticated(user);
                                    }
                                } else {
                                    unauthenticated(user);
                                }
                            }, function () {
                                unauthenticated(user);
                            });
                        }, function () {
                            unauthenticated(user);
                        });
                    }, function () {
                        if (!_.isEmpty(response.data) || response.data === '') {
                            unauthenticated(user);
                        } else {
                            $log.debug('Error: ', response);
                        }
                    });
                });
            }
        };

    });

})();
