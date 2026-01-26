(function () {

    'use strict';

    angular.module('adminportal.login', []);

    var LoginModule = angular.module('adminportal.login');

    LoginModule.config(function ($stateProvider) {

        $stateProvider.state('login', {
            url: "/login",
            templateUrl: 'login/login.html',
            controller: 'LoginCtrl',
            data: {
                headerKey: 'Login.PageHeader'
            }
        });

    });

    LoginModule.controller('LoginCtrl', function ($rootScope, $scope, $log, $q, $http, $interval, $window, CMPFService, notification, $translate, $state, $stateParams, IdleServiceFactory,
                                                  Restangular, UtilService, AuthorizationService, SessionService, DEFAULT_REST_QUERY_LIMIT) {

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

        var unauthorized = function (user) {
            $log.debug('User has no authorization: ', user.username);

            notification({
                type: 'info',
                text: $translate.instant('Login.Texts.UnauthorizedToLogin')
            });

            SessionService.sessionInvalidate();

            $scope.loginForm.$setPristine();
            delete $scope.user.password;
        };

        var unauthenticated = function (user, response) {
            $log.debug('User could not be authenticated: ', user.username);
            var knownErrorCodes = [
                5021100, 5021101, 5021120, 5021121, 5021122, 5021123, 5021124, 5021125, 5021126,
                5022140, 5022141, 5022142, 5022143, 5022144, 5022145, 5022146, 5022147, 5022148,
                5022149, 5022150, 5022151,
                5024120, 5024121, 5024122, 5024123, 5024124
            ];

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
            } else if (response && response.data && response.data.errorDescription.startsWith('Authentication failure')) {
                notification({
                    type: 'info',
                    text: $translate.instant('CommonMessages.AuthenticationFailure')
                });
            } else if (response && response.data && response.data.errorCode && response.data.errorDescription) {

                var code = Number(response.data.errorCode);
                if (_.includes(knownErrorCodes, code)) {
                    notification({
                        type: 'warning',
                        text: response.data.errorDescription
                    });
                } else {
                    // Optionally log or handle unexpected codes
                    $log.debug('Unhandled error code:', code, response.data.errorDescription);
                    notification({
                        type: 'info',
                        text: $translate.instant('CommonMessages.GenericServerError')
                    });
                }
            } else {
                notification({
                    type: 'info',
                    text: $translate.instant('Login.Texts.InvalidUsernamePassword')
                });
            }

            SessionService.sessionInvalidate();

            $scope.loginForm.$setPristine();
            delete $scope.user.password;
        };

        $scope.login = function (user) {
            if ($scope.loginForm.$valid) {
                if (_.isEmpty(user)) {
                    return;
                }

                var credential = {
                    "username": user.username,
                    "password": user.password
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
                        // Set the current user id to a global variable.
                        $rootScope.systemUserId = uid;

                        var extractedUserRights = AuthorizationService.extractUserRights(authorizeResponse);
                        if (!_.isEmpty(extractedUserRights)) {
                            $log.debug('User logged in successfully [', user.username, '], Extracted user rights: ', extractedUserRights);

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

                // If user authenticated and is authorized for adminportal, check user info & store necessary info in local storage.
                deferredUserAuthorize.promise.then(function (authenticateAndAuthorizeResponse) {
                    var uid = authenticateAndAuthorizeResponse.uid;
                    var extractedUserRights = authenticateAndAuthorizeResponse.extractedUserRights;

                    CMPFService.getUserAccount(uid, true).then(function (accountResponse) {
                        $log.debug('Found user account, without profiles and child attributes: ', accountResponse);
                        UtilService.putToSessionStore(UtilService.USER_ACCOUNT_KEY, accountResponse);

                        // Need UserProfile to check if the user needs to change his/her password.
                        var userProfile = CMPFService.getProfileAttributes(accountResponse.profiles, CMPFService.USER_PROFILE_NAME) || [];
                        userProfile = userProfile[0];

                        $log.debug('UserProfile of user [', user.username, ']: ', userProfile);
                        // If user is logged in for the first time (or requested new password and needs to set his own)
                        // Redirect to reset password page
                        if(userProfile && userProfile.EnforcePasswordChange && !userProfile.RemotePasswordControl) {
                            $state.go("resetpassword");
                        } else {
                            // no need to reset password.
                            // Set the current user organization id to a global variable.
                            $rootScope.systemUserOrganizationId = accountResponse.organizationId;
                            UtilService.putToSessionStore(UtilService.USER_ORGANIZATION_ID_KEY, $rootScope.systemUserOrganizationId);

                            $rootScope.systemUserOrganizationName = accountResponse.organization.name;
                            UtilService.putToSessionStore(UtilService.USER_ORGANIZATION_NAME_KEY, $rootScope.systemUserOrganizationName);

                            // Need UserProfile to check if the user needs to change his/her password.
                            if (!_.isEmpty(userProfile)) {
                                // MM Apps Roles set
                                $log.debug('User profile extracted: ', userProfile);
                                if(Number(userProfile.SimotaRoleId) > 0) {
                                    UtilService.putToSessionStore(UtilService.USER_MM_SIMOTA_ID_KEY, userProfile.SimotaRoleId);
                                }
                                if(Number(userProfile.DmcRoleId) > 0) {
                                    UtilService.putToSessionStore(UtilService.USER_MM_DMC_ID_KEY, userProfile.DmcRoleId);
                                }
                                AuthorizationService.clearCachedRedirect(); // Clear cache for memoize function
                            }

                            // If no permission allowed, continue to the check list for admin portal.
                            // Get groups of the user. (fire-and-forget)
                            CMPFService.getUserAccountGroupsCustom(uid, 0, DEFAULT_REST_QUERY_LIMIT).then(function (accountGroupsResponse) {
                                UtilService.putToSessionStore(UtilService.USER_GROUPS_KEY, accountGroupsResponse.userGroups);

                                // Check if Admin group member
                                var userAdminGroup = _.findWhere(accountGroupsResponse.userGroups, {name: CMPFService.VCP_ADMIN_GROUP});
                                $rootScope.isAdminUser = !_.isUndefined(userAdminGroup);
                                UtilService.putToSessionStore(UtilService.USER_ADMIN_KEY, $rootScope.isAdminUser);

                                // TODO: Will these groups be used in STC?
                                // Check if BMS Admin group member
                                var userBMSAdminGroup = _.findWhere(accountGroupsResponse.userGroups, {name: CMPFService.DSP_BMS_ADMIN_GROUP});
                                $rootScope.isBMSAdminUser = !_.isUndefined(userBMSAdminGroup);
                                UtilService.putToSessionStore(UtilService.USER_BMS_ADMIN_KEY, $rootScope.isBMSAdminUser);
                                // TODO: Will these groups be used in STC?
                                // Check if Business Admin group member
                                var userBusinessAdminGroup = _.findWhere(accountGroupsResponse.userGroups, {name: CMPFService.DSP_BUSINESS_ADMIN_GROUP});
                                $rootScope.isBusinessAdminUser = !_.isUndefined(userBusinessAdminGroup);
                                // TODO: Will these groups be used in STC?
                                // Check if Marketing Admin group member
                                var userMarketingAdminGroup = _.findWhere(accountGroupsResponse.userGroups, {name: CMPFService.DSP_MARKETING_ADMIN_GROUP});
                                $rootScope.isMarketingAdminUser = !_.isUndefined(userMarketingAdminGroup);
                                // TODO: Will these groups be used in STC?
                                // Check if IT Admin group member
                                var userITAdminGroup = _.findWhere(accountGroupsResponse.userGroups, {name: CMPFService.DSP_IT_ADMIN_GROUP});
                                $rootScope.isITAdminUser = !_.isUndefined(userITAdminGroup);
                            });

                            // Get default organization to be used in CMS - RBT views (fire-and-forget)
                            CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_RBT_ORGANIZATION_NAME).then(function (defaultOrganization) {
                                // Set the default RBT organization (STC) to a global variable.
                                var organizations = Restangular.stripRestangular(defaultOrganization);
                                var stc = _.find(organizations.organizations, function (org) {
                                    return org.name.toLowerCase() === CMPFService.DEFAULT_RBT_ORGANIZATION_NAME.toLowerCase();
                                });
                                UtilService.putToSessionStore(UtilService.RBT_STC_ORGANIZATION_KEY, stc);

                            }, function (response) {
                                $log.error('Error on getting organization named STC: ', response);
                            });

                            AuthorizationService.storeUserRights(extractedUserRights);

                            // Start idle watch.
                            IdleServiceFactory.idleWatch();
                            $log.debug('Redirecting to latest state: ', $rootScope.redirectLatestState);
                            $rootScope.redirectLatestState();

                        }

                    }, function (response) {
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
