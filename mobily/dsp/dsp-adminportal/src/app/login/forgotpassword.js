(function () {

    'use strict';

    angular.module('adminportal.forgotpassword', []);

    var ForgotPasswordModule = angular.module('adminportal.forgotpassword');

    ForgotPasswordModule.config(function ($stateProvider) {

        $stateProvider.state('forgotpassword', {
            url: "/forgot-password",
            templateUrl: 'login/forgotpassword.html',
            controller: 'ForgotPasswordCtrl',
            data: {
                headerKey: 'Login.ForgotPassword.Title'
            }
        }).state('resetpassword', {
            url: "/reset-password/:confirmationCode",
            templateUrl: 'login/resetpassword.html',
            controller: 'ResetPasswordCtrl',
            data: {
                headerKey: 'Login.ForgotPassword.Title'
            }
        });

    });

    ForgotPasswordModule.controller('ForgotPasswordCtrl', function ($scope, $log, $state, $interval, $window, $translate, notification, WorkflowsService) {
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
            // Call the password reset method of the flow service.
            WorkflowsService.requestPasswordReset(userAccount.username).then(function (response) {
                notification.flash({
                    type: 'success',
                    text: $translate.instant('Login.ForgotPassword.Messages.Completed')
                });

                $state.go('login');
            }, function (response) {
                $log.error('Cannot sent password reset on the flow service. Error: ', response);

                notification.flash({
                    type: 'success',
                    text: $translate.instant('Login.ForgotPassword.Messages.Completed')
                });

                $state.go('login');
            });
        }
    });

    ForgotPasswordModule.controller('ResetPasswordCtrl', function ($scope, $log, $state, $stateParams, $interval, $window, $translate, notification, WorkflowsService) {
        $log.debug('ResetPasswordCtrl');

        var confirmationCode = $stateParams.confirmationCode;

        $scope.confirmPasswordReset = function (userAccount) {
            // Call the password reset confirmation method of the flow service.
            WorkflowsService.confirmPasswordReset(userAccount.password, confirmationCode).then(function (response) {
                // {"code": 2001, "description": "Created", "detail": "5e2b25201d5f540f0eb11f45"}
                if (response && response.code === 2000 && response.description === 'OK') {
                    notification.flash({
                        type: 'success',
                        text: $translate.instant('Login.ForgotPassword.Messages.PasswordResetCompleted')
                    });

                    $state.go('login');
                } else {
                    notification.flash({
                        type: 'warning',
                        text: $translate.instant('Login.ForgotPassword.Messages.ConfirmationCodeInvalid')
                    });

                    $state.go('login');
                }
            }, function (response) {
                $log.error('Cannot sent password reset confirmation reqeust on the flow service. Error: ', response);

                notification.flash({
                    type: 'warning',
                    text: $translate.instant('Login.ForgotPassword.Messages.ConfirmationCodeInvalid')
                });

                $state.go('login');
            });
        }
    });

})();
