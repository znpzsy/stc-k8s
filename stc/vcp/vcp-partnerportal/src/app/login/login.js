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
                                                  ContentManagementService, IdleServiceFactory, Restangular, UtilService, AuthorizationService, SessionService) {

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

                        // Need UserProfile to check if the user needs to change his/her password.
                        var userProfile = CMPFService.getProfileAttributes(accountResponse.profiles, CMPFService.USER_PROFILE_NAME) || [];;
                        $log.debug('UserProfile of user [', user.username, ']: ', userProfile);
                        userProfile = userProfile[0];
                        // If user is logged in for the first time (or requested new password and needs to set his own)
                        // Redirect to reset password page
                        if(userProfile && userProfile.EnforcePasswordChange && !userProfile.RemotePasswordControl){
                            $state.go("resetpassword");
                        } else {
                            // If this is not the first time login after the password change, continue business as usual.
                            CMPFService.getUserAccountGroups(uid, false, false).then(function (accountGroupsResponse) {
                                UtilService.putToSessionStore(UtilService.USER_IS_ADMIN_KEY, true)
                                // If the user successfully get partner of the user then.
                                CMPFService.getPartnerById(accountResponse.organizationId).then(function (partner) {
                                    $log.debug('Found Partner: ', partner);
                                    var partnerSimple = Restangular.stripRestangular(partner);
                                    UtilService.putToSessionStore(UtilService.USER_ORGANIZATION_KEY, partnerSimple);

                                    // Now we have the allowed category profiles
                                    // ProviderAllowedCategoryProfile
                                    var serviceProviderAllowedCategoryProfiles = CMPFService.getProfileTextAttributes(partnerSimple.profiles, CMPFService.SERVICE_PROVIDER_ALLOWED_CATEGORY_PROFILE);
                                    if (serviceProviderAllowedCategoryProfiles.length > 0) {
                                        ContentManagementService.queryAllowedCategorization(serviceProviderAllowedCategoryProfiles).then(function (response) {
                                            $log.debug('Categorization: ', response);

                                            // Map each profile to the matching category and subcategory
                                            var mappedAssignments = _.map(serviceProviderAllowedCategoryProfiles, function (assignment) {

                                                var mainCategory = _.find(response, function (item) {
                                                    return item.category && item.category.id === assignment.MainCategoryID;
                                                });

                                                var subCategory = _.find(response, function (item) {
                                                    return item.subcategory && item.subcategory.id === assignment.SubCategoryID;
                                                });

                                                return _.assign({}, assignment, {
                                                    category: mainCategory ? mainCategory.category : null,
                                                    categoryName: mainCategory ? mainCategory.category.name: 'N/A',
                                                    subcategory: subCategory ? subCategory.subcategory : null,
                                                    subCategoryName: (subCategory ? subCategory.subcategory.name : 'N/A')
                                                });
                                            });
                                            UtilService.putToSessionStore(UtilService.RBT_ALLOWED_CATEGORY_KEY, mappedAssignments);

                                        }, function(error) {
                                            $log.error('Error in getting allowed category profiles: ', error);
                                            UtilService.putToSessionStore(UtilService.RBT_ALLOWED_CATEGORY_KEY, serviceProviderAllowedCategoryProfiles);
                                        });

                                    }
                                    //
                                    AuthorizationService.storeUserRights(extractedUserRights);
                                    // Start idle watch.
                                    $log.debug('Starting Idle Watch: ', IdleServiceFactory);
                                    IdleServiceFactory.idleWatch();
                                    $log.debug('Redirecting to latest state: ', $rootScope.redirectLatestState);
                                    $rootScope.redirectLatestState();

                                }, function () {
                                    unauthenticated(user);
                                });
                            }, function () {
                                unauthenticated(user);
                            });
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
