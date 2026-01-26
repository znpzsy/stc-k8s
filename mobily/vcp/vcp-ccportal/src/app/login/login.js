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

    LoginModule.controller('LoginCtrl', function ($rootScope, $scope, $log, $http, $interval, $window, CMPFService, notification, $translate, $state, $stateParams, IdleServiceFactory,
                                                  Restangular, UtilService, AuthorizationService, SessionService) {

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

        var unauthenticated = function (user) {
            $log.debug('User has no authenticated: ', user.username);

            notification({
                type: 'info',
                text: $translate.instant('Login.Texts.InvalidUsernamePassword')
            });

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

                CMPFService.authenticate(credential).then(function (authenticateResponse) {
                    // User is successfully authenticated and result information will be put to the session store.
                    if (!_.isEmpty(authenticateResponse) || !authenticateResponse.token) {
                        authenticateResponse = Restangular.stripRestangular(authenticateResponse);

                        $log.debug('User has successfully authenticated: ', user.username, ', Response: ', authenticateResponse);

                        // Put the user authentication response to be able to use on the cmpf rest service authentication with restangular requests as basic auth headers.
                        SessionService.saveUserAttributesInSession(user.username, authenticateResponse);

                        var jwt = UtilService.parseJwt(authenticateResponse.token);
                        var uid = jwt.sub.cmpfToken.uid;
                        AuthorizationService.getPermissions(uid).then(function (authorizeResponse) {
                            $log.debug('Permissions of user [', user.username, '], Authorize response: ', authorizeResponse);

                            // Get groups of the user.
                            CMPFService.getUserAccountGroups(uid, false, false).then(function (accountGroupsResponse) {
                                // Check if Admin group member
                                var userAdminGroup = _.findWhere(accountGroupsResponse.userGroups, {name: CMPFService.VCP_ADMIN_GROUP});
                                $rootScope.isAdminUser = !_.isUndefined(userAdminGroup);
                                UtilService.putToSessionStore(UtilService.USER_ADMIN_KEY, $rootScope.isAdminUser);

                                // Set the current user id to a global variable.
                                $rootScope.systemUserId = uid;
                            });

                            var extractedUserRights = AuthorizationService.extractUserRights(authorizeResponse);
                            if (!_.isEmpty(extractedUserRights)) {
                                $log.debug('User logged in successfully [', user.username, '], Extracted user rights: ', extractedUserRights);

                                AuthorizationService.storeUserRights(extractedUserRights);

                                // Start idle watch.
                                IdleServiceFactory.idleWatch();

                                // Get user account from the rest service
                                CMPFService.getUserAccount(uid, true).then(function (userAccount) {
                                    // Set the current user organization id to a global variable.
                                    $rootScope.systemUserOrganizationId = userAccount.organizationId;
                                    UtilService.putToSessionStore(UtilService.USER_ORGANIZATION_ID_KEY, $rootScope.systemUserOrganizationId);

                                    $rootScope.systemUserOrganizationName = userAccount.organization.name;
                                    UtilService.putToSessionStore(UtilService.USER_ORGANIZATION_NAME_KEY, $rootScope.systemUserOrganizationName);
                                }, function (response) {
                                    $log.error('Error on getting restricted content view permissions: ', response);
                                });

                                $state.go('dashboards');
                            } else {
                                unauthorized(user);
                            }
                        }, function () {
                            unauthorized(user);
                        });
                    } else {
                        unauthenticated(user);
                    }
                }, function (response) {
                    if (!_.isEmpty(response.data) || response.data === '') {
                        unauthenticated(user);
                    } else {
                        $log.debug('Error: ', response);
                    }
                });
            }
        };

    });

})();
