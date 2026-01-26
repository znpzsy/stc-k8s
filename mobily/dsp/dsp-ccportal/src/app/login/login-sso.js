(function () {

    'use strict';

    angular.module('ccportal.loginsso', []);

    var LoginSSOModule = angular.module('ccportal.loginsso');

    LoginSSOModule.config(function ($stateProvider) {

        $stateProvider.state('loginsso', {
            url: "/login-sso",
            controller: 'LoginSSOCtrl'
        });

    });

    LoginSSOModule.controller('LoginSSOCtrl', function ($rootScope, $scope, $log, $http, $q, $window, CMPFService, notification, $translate, $state, $stateParams,
                                                        IdleServiceFactory, Restangular, UtilService, AuthorizationService, SessionService, SSMSubscribersService,
                                                        DEFAULT_REST_QUERY_LIMIT) {
        var unauthorized = function (user) {
            $log.debug('User has no authorization: ', user.username);

            SessionService.sessionInvalidate();

            $window.location.href = 'app-sso.html#!/unauthorized';
        };

        var unauthenticated = function (user, response) {
            $log.debug('User has no authenticated: ', user.username);

            SessionService.sessionInvalidate();

            $window.location.href = 'app-sso.html#!/unauthorized';
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

        var updateFinalInformationsAndWelcome = function (extractedUserRights, organization, msisdn) {
            AuthorizationService.storeUserRights(extractedUserRights);

            UtilService.putToSessionStore(UtilService.USER_ORGANIZATION_KEY, organization);
            UtilService.putToSessionStore(UtilService.USER_ORGANIZATION_ID_KEY, organization.id);

            // Start idle watch.
            IdleServiceFactory.idleWatch();

            // Remove subscriber profile information from session store
            UtilService.removeFromSessionStore(UtilService.SUBSCRIBER_PROFILE_KEY);

            // For checking the actual MSISDN on the CMPF and taking general profile attributes of found subscriber.
            SSMSubscribersService.getSubscriberByMsisdn(msisdn).then(function (response) {
                $window.location.href = 'app-sso.html#!/subscriber-info/subscriber-profile';
            });
        };

        $scope.login = function (user) {
            if (_.isEmpty(user)) {
                return;
            }

            var credential = {
                "username": user.username,
                "password": user.password,
                "msisdn": user.msisdn,
            };

            CMPFService.authenticateSSO(credential).then(function (authenticateResponse) {
                $log.debug('User has successfully authenticated: ', credential.username, ', Response: ', authenticateResponse);

                if (!_.isEmpty(authenticateResponse) || !authenticateResponse.token) {
                    authenticateResponse = Restangular.stripRestangular(authenticateResponse);

                    // Put the user authentication response to be able to use on the cmpf rest service authentication with restangular requests as basic auth headers.
                    SessionService.saveUserAttributesInSession(credential.username, authenticateResponse);

                    var jwt = UtilService.parseJwt(authenticateResponse.token);

                    var username = jwt.sub.username;
                    var password = jwt.sub.password;
                    var msisdn = jwt.sub.msisdn;

                    var uid = jwt.sub.cmpfToken.uid;

                    // Set the current user id to a global variable.
                    $rootScope.systemUserId = uid;

                    checkUserPermissions(uid, credential.username).then(function (response) {
                        updateFinalInformationsAndWelcome(response.extractedUserRights, response.organization, msisdn);
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
        };
    });

})();
