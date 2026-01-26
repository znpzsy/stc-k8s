(function () {

    'use strict';

    angular.module('ccportal.login', []);

    var LoginModule = angular.module('ccportal.login');

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

    LoginModule.controller('LoginCtrl', function ($rootScope, $scope, $log, $http, $q, $interval, $window, CMPFService, notification, $translate, $state, $stateParams,
                                                  IdleServiceFactory, Restangular, UtilService, AuthorizationService, SessionService, DEFAULT_REST_QUERY_LIMIT) {
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
            $log.debug('User has no authenticated: ', user.username);

            if (response && response.data && response.data.errorDescription.startsWith('Internal server error')) {
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
        };

        var getAndUpdateUsersGroupInformation = function (uid) {
            var deferred = $q.defer();

            // Get groups of the user.
            CMPFService.getUserAccountGroups(uid, 0, DEFAULT_REST_QUERY_LIMIT).then(function (accountGroupsResponse) {
                // Get the group for super admin user. If the user included to this group, then pass the organization id checks.
                // DSP_CUSTOMER_CARE_ADMIN_GROUP: 'DSP Customer Care Admin'
                var userAdminGroup = _.findWhere(accountGroupsResponse.userGroups, {name: CMPFService.DSP_CUSTOMER_CARE_ADMIN_GROUP});

                UtilService.putToSessionStore(UtilService.USER_IS_ADMIN_KEY, !_.isUndefined(userAdminGroup));

                deferred.resolve(accountGroupsResponse);
            }, function (response) {
                deferred.reject(response);
            });

            return deferred.promise;
        };

        var checkUserPermissions = function (userId, username) {
            var deferred = $q.defer();

            AuthorizationService.getPermissions(userId).then(function (authorizeResponse) {
                $log.debug('Permissions of user [', username, '], Authorize response: ', authorizeResponse);

                // User is successfully authenticated and result information will be put to the session store.
                var extractedUserRights = AuthorizationService.extractUserRights(authorizeResponse);
                if (!_.isEmpty(extractedUserRights)) {
                    $log.debug('User logged in successfully [', username, '], Extracted user rights: ', extractedUserRights);

                    CMPFService.getUserAccount(userId, false, false).then(function (accountResponse) {
                        $log.debug('Found user account, without profiles and child attributes: ', accountResponse);

                        getAndUpdateUsersGroupInformation(userId).then(function (accountGroupsResponse) {

                            // Get and save the organization attributes.
                            CMPFService.getOrganizationById(accountResponse.organizationId).then(function (organization) {
                                $log.debug('Found Organization: ', organization);

                                deferred.resolve({
                                    extractedUserRights: extractedUserRights,
                                    organization: organization
                                });
                            }, function () {
                                deferred.reject();
                            });
                        }, function (response) {
                            deferred.reject();
                        });
                    }, function (response) {
                        deferred.reject();
                    });
                } else {
                    deferred.reject();
                }
            }, function (response) {
                deferred.reject();
            });


            return deferred.promise;
        };

        var updateFinalInformationsAndWelcome = function (extractedUserRights, organization) {
            AuthorizationService.storeUserRights(extractedUserRights);

            UtilService.putToSessionStore(UtilService.USER_ORGANIZATION_KEY, organization);
            UtilService.putToSessionStore(UtilService.USER_ORGANIZATION_ID_KEY, organization.id);

            // Start idle watch.
            IdleServiceFactory.idleWatch();

            $state.go('dashboards');
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

                CMPFService.authenticate(credential).then(function (authenticateResponse) {
                    $log.debug('User has successfully authenticated: ', credential.username, ', Response: ', authenticateResponse);

                    if (!_.isEmpty(authenticateResponse) || !authenticateResponse.token) {
                        authenticateResponse = Restangular.stripRestangular(authenticateResponse);

                        // Put the user authentication response to be able to use on the cmpf rest service authentication with restangular requests as basic auth headers.
                        SessionService.saveUserAttributesInSession(credential.username, authenticateResponse);

                        var jwt = UtilService.parseJwt(authenticateResponse.token);
                        var uid = jwt.sub.cmpfToken.uid;

                        // Set the current user id to a global variable.
                        $rootScope.systemUserId = uid;

                        checkUserPermissions(uid, credential.username).then(function (response) {
                            updateFinalInformationsAndWelcome(response.extractedUserRights, response.organization);
                        }, function (response) {
                            unauthorized(user);
                        });
                    } else {
                        unauthorized(user);
                    }
                }, function (response) {
                    if (!_.isEmpty(response.data) || response.data === '') {
                        unauthenticated(user, response);
                    } else {
                        $log.debug('Error: ', response);
                    }
                });
            }
        };

        // Check if a valid session is available.
        if (SessionService.isSessionValid(UtilService.COMMON_SESSION_KEY, UtilService.COMMON_USERNAME_KEY, UtilService.COMMON_USER_RIGHTS)) {
            $rootScope.showPage = false;

            var sessionKey = SessionService.getSessionKey(UtilService.COMMON_SESSION_KEY);
            var username = SessionService.getUsername(UtilService.COMMON_USERNAME_KEY);
            var userId = SessionService.getUserId(UtilService.COMMON_SESSION_KEY);

            // Put the user authentication token with cc portal's own keys to the session storage.
            SessionService.saveUserAttributesInSession(username, sessionKey);

            // Set the current user id to a global variable.
            $rootScope.systemUserId = userId;

            checkUserPermissions(userId, username).then(function (response) {
                updateFinalInformationsAndWelcome(response.extractedUserRights, response.organization);

                // Remove the common keys from the session storage.
                UtilService.removeFromSessionStore(UtilService.COMMON_SESSION_KEY);
                UtilService.removeFromSessionStore(UtilService.COMMON_USERNAME_KEY);
                UtilService.removeFromSessionStore(UtilService.COMMON_USER_RIGHTS);

                $rootScope.showPage = true;
            }, function (response) {
                unauthorized(user);

                $rootScope.showPage = true;
            });
        }
    });

})();
