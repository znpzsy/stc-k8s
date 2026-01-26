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
        }).state('logout', {
            url: "/logout",
            template: '<div></div>',
            controller: 'LogoutCtrl',
        });

    });

    LoginModule.controller('LoginCtrl', function ($rootScope, $scope, $log, $http, $timeout, $interval, $window, CMPFService, notification, $translate, $state, $stateParams,
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

        $scope.refreshCaptcha = _.throttle(function () {
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

                        // Set the current user id to a global variable.
                        $rootScope.systemUserId = uid;

                        AuthorizationService.getPermissions(uid).then(function (authorizeResponse) {
                            $log.debug('Permissions of user [', user.username, '], Authorize response: ', authorizeResponse);

                            // Check CC Portal permissions first. If there is a permission allowed, redirect user to the cc portal directly.
                            var customerCarePortalPermissions = AuthorizationService.getCustomerCarePermissions(authorizeResponse);
                            var adminPortalPermissions = AuthorizationService.extractUserRights(authorizeResponse);

                            if (!_.isEmpty(customerCarePortalPermissions) && _.isEmpty(adminPortalPermissions)) {
                                $log.debug('User logged in successfully [', user.username, '], Extracted user rights for cc portal: ', customerCarePortalPermissions);

                                $rootScope.showPage = false;

                                // Put the user authentication response again with the keys belonging to the cc portal.
                                SessionService.setAuthorizationHeader(authenticateResponse.token);
                                UtilService.putToSessionStore(UtilService.COMMON_SESSION_KEY, authenticateResponse);
                                UtilService.putToSessionStore(UtilService.COMMON_USERNAME_KEY, user.username);
                                AuthorizationService.storeUserRights(customerCarePortalPermissions, UtilService.COMMON_USER_RIGHTS, CMPFService.CUSTOMER_CARE_PORTAL_RESOURCE);

                                $timeout(function () {
                                    window.location.href = '/ccportal/app.html?referrer=adminportal#!/login';
                                }, 0);
                            } else if (!_.isEmpty(adminPortalPermissions)) {
                                $log.debug('User logged in successfully [', user.username, '], Extracted user rights for admin portal: ', adminPortalPermissions);

                                // If no permission allowed, continue to the check list for admin portal.
                                // Get groups of the user.
                                CMPFService.getUserAccountGroups(uid, 0, DEFAULT_REST_QUERY_LIMIT).then(function (accountGroupsResponse) {
                                    UtilService.putToSessionStore(UtilService.USER_GROUPS_KEY, accountGroupsResponse.userGroups);

                                    // Check if Admin group member
                                    var userAdminGroup = _.findWhere(accountGroupsResponse.userGroups, {name: CMPFService.DSP_ADMIN_GROUP});
                                    $rootScope.isAdminUser = !_.isUndefined(userAdminGroup);
                                    UtilService.putToSessionStore(UtilService.USER_ADMIN_KEY, $rootScope.isAdminUser);

                                    // Check if BMS Admin group member
                                    var userBMSAdminGroup = _.findWhere(accountGroupsResponse.userGroups, {name: CMPFService.DSP_BMS_ADMIN_GROUP});
                                    $rootScope.isBMSAdminUser = !_.isUndefined(userBMSAdminGroup);
                                    UtilService.putToSessionStore(UtilService.USER_BMS_ADMIN_KEY, $rootScope.isBMSAdminUser);

                                    // Check if Business Admin group member
                                    var userBusinessAdminGroup = _.findWhere(accountGroupsResponse.userGroups, {name: CMPFService.DSP_BUSINESS_ADMIN_GROUP});
                                    $rootScope.isBusinessAdminUser = !_.isUndefined(userBusinessAdminGroup);

                                    // Check if Marketing Admin group member
                                    var userMarketingAdminGroup = _.findWhere(accountGroupsResponse.userGroups, {name: CMPFService.DSP_MARKETING_ADMIN_GROUP});
                                    $rootScope.isMarketingAdminUser = !_.isUndefined(userMarketingAdminGroup);

                                    // Check if IT Admin group member
                                    var userITAdminGroup = _.findWhere(accountGroupsResponse.userGroups, {name: CMPFService.DSP_IT_ADMIN_GROUP});
                                    $rootScope.isITAdminUser = !_.isUndefined(userITAdminGroup);
                                });

                                AuthorizationService.storeUserRights(adminPortalPermissions);

                                // Start idle watch.
                                IdleServiceFactory.idleWatch();

                                // Get user account from the rest service
                                CMPFService.getUserAccount(uid, true).then(function (userAccount) {
                                    // Set the current user organization id to a global variable.
                                    $rootScope.systemUserOrganizationId = userAccount.organizationId;
                                    UtilService.putToSessionStore(UtilService.USER_ORGANIZATION_ID_KEY, $rootScope.systemUserOrganizationId);

                                    $rootScope.systemUserOrganizationName = userAccount.organization.name;
                                    UtilService.putToSessionStore(UtilService.USER_ORGANIZATION_NAME_KEY, $rootScope.systemUserOrganizationName);

                                    // Save organization value.
                                    SessionService.setSessionOrganization(userAccount.organization);
                                }, function (response) {
                                    $log.error('Error on getting restricted content view permissions: ', response);
                                });

                                $rootScope.redirectLatestState();
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
                        unauthenticated(user, response);
                    } else {
                        $log.debug('Error: ', response);
                    }
                });
            }
        };

    });

    LoginModule.controller('LogoutCtrl', function ($rootScope) {
        $rootScope.logout();
    });

})();
