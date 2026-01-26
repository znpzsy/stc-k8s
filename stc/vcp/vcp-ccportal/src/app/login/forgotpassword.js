(function () {

    'use strict';

    angular.module('ccportal.forgotpassword', []);

    var ForgotPasswordModule = angular.module('ccportal.forgotpassword');

    ForgotPasswordModule.config(function ($stateProvider) {

        $stateProvider.state('forgotpassword', {
            url: "/forgot-password",
            templateUrl: 'login/forgotpassword.html',
            controller: 'ForgotPasswordCtrl',
            data: {
                headerKey: 'Login.ForgotPassword.Title'
            }
        }).state('resetpassword', {
            url: "/reset-password",
            templateUrl: 'login/resetpassword.html',
            controller: 'ResetPasswordCtrl',
            data: {
                headerKey: 'Login.ForgotPassword.Title'
            },
            resolve: {
                userAccount: function (UtilService) {
                    return UtilService.getFromSessionStore(UtilService.USER_ACCOUNT_KEY);
                }
            }
        });

    });

    ForgotPasswordModule.controller('ForgotPasswordCtrl', function ($scope, $log, $state, $interval, $window, $translate, notification, CMPFService) {
        $log.debug('ForgotPasswordCtrl');

        // This is a workaround to fix a view problem related to a possible autofill bug of chrome
        if ($window.chrome) {
            $log.debug('Browser is Chrome. Continue to fix autofill bug.');
            $scope.$on('$viewContentLoaded', function () {
                var username = angular.element($scope.form.username)[0].$$element;
                var _interval = $interval(function () {
                    if (username.is(':-webkit-autofill')) {
                        username.removeClass('ng-invalid-required');

                        $interval.cancel(_interval);
                    }
                }, 50, 10); // 0.5s, 10 times
            });
        }

        $scope.requestPasswordReset = function (userAccount) {
            // Call the password reset method of the CMPF service.
            CMPFService.requestPasswordReset(userAccount.username).then(function (response) {
                $log.debug("CMPFService.requestPasswordReset - response: " , response);
                if (response.data && response.data.errorCode) {
                    //var message= response.data.errorCode + ' - ' + response.data.errorDescription;
                    var message= response.data.errorDescription;

                    notification({
                        type: 'danger',
                        text: $translate.instant('Login.ForgotPassword.Messages.Error', {errorMessage: message})
                    });

                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('Login.ForgotPassword.Messages.Completed')
                    });

                    $state.go('login');
                }
            }, function (response) {
                $log.error('Cannot sent password reset on the flow service. Error: ', response);
                var message= (response.data && response.data.errorDescription) ? response.data.errorDescription :  "Something went wrong";

                notification({
                    type: 'danger',
                    text: $translate.instant('Login.ForgotPassword.Messages.Error', {errorMessage: message})
                });
                $state.go('login');
            });
        }
    });

    ForgotPasswordModule.controller('ResetPasswordCtrl', function ($scope, $log, $state, $stateParams, $interval, $window, $translate, $filter, notification, CMPFService, userAccount) {
        $log.debug('ResetPasswordCtrl');

        $scope.userAccount = userAccount;
        $scope.userAccountOriginal = angular.copy($scope.userAccount);
        $scope.userAccount.selectedOrganization = userAccount.organization;
        $scope.userAccount.confirmpassword = $scope.userAccount.password;

        // UserProfile
        var userProfiles = CMPFService.getProfileAttributes(userAccount.profiles, CMPFService.USER_PROFILE_NAME);
        if (userProfiles.length > 0) {
            $scope.userAccount.userProfile = angular.copy(userProfiles[0]);
        }

        $scope.prepareEmptyUserProfile = function () {
            var profile = {
                "name": CMPFService.USER_PROFILE_NAME,
                "profileDefinitionName": CMPFService.USER_PROFILE_NAME,
                "attributes": [
                    {
                        "name": "Name",
                        "value": ''
                    },
                    {
                        "name": "Surname",
                        "value":  ''
                    },
                    {
                        "name": "Phone",
                        "value":  ''
                    },
                    {
                        "name": "Email",
                        "value":  ''
                    },
                    {
                        "name": "EffectiveDate",
                        "value":  ''
                    },
                    {
                        "name": "ExpiryDate",
                        "value":  ''
                    },
                    {
                        "name": "LastUpdateTime",
                        "value": $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss')
                    },
                    {
                        "name": "LastPasswordChange",
                        "value": $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss')
                    },
                    {
                        "name": "LastFailedLoginAttempt",
                        "value":  ''
                    },
                    {
                        "name": "LastSuccessfulLogin",
                        "value":  ''
                    },
                    {
                        "name": "EnforcePasswordChange",
                        "value": "false"
                    },
                    {
                        "name": "ActiveDirectoryAuthentication",
                        "value": "false"
                    },
                    {
                        "name": "OldPasswordList",
                        "value": ''
                    }
                ]
            };

            return profile;
        };

        $scope.prepareUpdatedAccount = function (account) {
            var userAccountItem = {
                id: $scope.userAccountOriginal.id,
                userName: $scope.userAccountOriginal.userName,
                state: account.state,
                userGroups: account.userGroups,
                organization: account.selectedOrganization,
                organizationId: account.selectedOrganization.id,
                profiles: (account.profiles === undefined ? [] : account.profiles)
            };

            // User Profile
            if (!account.userProfile) {
                account.userProfile = $scope.prepareEmptyUserProfile();
            }

            userAccountItem.oldPassword = account.oldPassword;
            userAccountItem.password = account.password;


            var originalUserProfile = CMPFService.findProfileByName(userAccountItem.profiles, CMPFService.USER_PROFILE_NAME);
            var updatedUserProfile = JSON.parse(angular.toJson(account.userProfile));

            updatedUserProfile.LastPasswordChange = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');
            updatedUserProfile.LastUpdateTime = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');
            updatedUserProfile.EnforcePasswordChange = false;

            var userProfileArray = CMPFService.prepareProfile(updatedUserProfile, originalUserProfile);
            if (originalUserProfile) {
                originalUserProfile.attributes = userProfileArray;
            } else {
                var userProfile = {
                    name: CMPFService.USER_PROFILE_NAME,
                    profileDefinitionName: CMPFService.USER_PROFILE_NAME,
                    attributes: userProfileArray
                };

                userAccountItem.profiles.push(userProfile);
            }

            return userAccountItem;

            return account;
        };

        $scope.confirmPasswordReset = function (userAccount) {
            var updatedAccount = $scope.prepareUpdatedAccount(userAccount);
            $log.debug('Password reset via user update, sending account information: ', updatedAccount);
            // Call the password reset confirmation method of the flow service.
            CMPFService.updateUserAccount(updatedAccount).then(function (response) {
                $log.debug('Received response: ', response);

                if (response) {
                    if (response.errorCode) {
                        notification({
                            type: 'danger',
                            text: $translate.instant('Login.ForgotPassword.Messages.Error', {errorMessage: response.errorCode})
                        });
                    } else {
                        notification({
                            type: 'success',
                            text: $translate.instant('Login.ForgotPassword.Messages.PasswordResetCompleted')
                        });
                        $state.go('login');
                    }
                } else {
                    $log.error('Password reset request, throws error: ', response);
                    throw(new Error($translate.instant('Login.ForgotPassword.Messages.PasswordResetError')));
                }
            }, function (response) {
                $log.error('Password reset request resulted with error: ', response);

                if (response && response.data && response.data.errorCode) {
                    //var errorMsg = response.data.errorCode + ' - ' + response.data.errorDescription;
                    var errorMsg = response.data.errorDescription;
                    notification({
                        type: 'danger',
                        text: $translate.instant('Login.ForgotPassword.Messages.Error', {errorMessage: errorMsg})
                    });
                } else {
                    notification({
                        type: 'danger',
                        text: $translate.instant('Login.ForgotPassword.Messages.PasswordResetError')
                    });
                }

                $state.go('login');
            });
        }

    });

})();
