(function () {

    'use strict';

    angular.module('partnerportal.registration', []);

    var RegistrationModule = angular.module('partnerportal.registration');

    RegistrationModule.config(function ($stateProvider) {

        $stateProvider.state('registration', {
            url: "",
            templateUrl: 'registration/registration.html',
            data: {
                headerKey: 'Registration.Title'
            }
        }).state('registration.howtobeapartner', {
            url: "/registration/how-to-become-a-partner",
            templateUrl: 'registration/registration.howtobeapartner.html'
        }).state('registration.register', {
            url: "/registration/register",
            templateUrl: 'registration/registration.register.html',
            controller: 'RegistrationRegisterCtrl'
        }).state('registration.activation', {
            url: "/activation/:activationCode",
            templateUrl: 'registration/registration.useraccountactivation.html',
            controller: 'RegistrationRegisterUserAccountActivationCtrl'
        });

    });

    RegistrationModule.controller('RegistrationRegisterCtrl', function ($scope, $log, $state, $timeout, $interval, $uibModal, $translate, notification, UtilService, WorkflowsOTPService,
                                                                        WorkflowsService) {
        $log.debug('RegistrationRegisterCtrl');

        // Agreement form.
        $scope.agreement = {
            // Initial value of the agreement checkbox.
            checked: false
        };

        // User account form.
        $scope.accountForm = {};
        $scope.userAccount = {};

        // Verification code form.
        $scope.verificationCodeForm = {};

        // Steps to be used as tabs.
        $scope.steps = [
            {active: true, disabled: false},
            {active: false, disabled: true},
            {active: false, disabled: true}
        ];

        $scope.currentStep = 0;

        // Check agreement.
        $scope.checkAgreement = function (isChecked) {
            $log.debug('AgreementCheckboxChecked: ', isChecked);

            if (!isChecked) {
                $scope.steps[1].disabled = true;
                $scope.steps[2].disabled = true;
            }
        };

        // Step 1 - Open the user information entry form.
        $scope.nextAndEnterUserInformation = function () {
            // Enter and enable the tab of step 2.
            $scope.currentStep = 1;
            $scope.steps[1].disabled = false;
        };

        // Step 2 - Open the third step page. It is for review and mobile phone verification.
        $scope.nextAndReview = function () {
            // Enter and enable the tab of step 3.
            $scope.currentStep = 2;
            $scope.steps[2].disabled = false;
        };

        var finalizeRegistration = function (mobilePhone) {
            $log.debug('RegistrationRegisterFinalizing the registration: ', mobilePhone);

            // Clean forms and userAccount object.
            delete $scope.accountForm;
            delete $scope.userAccount;
            delete $scope.verificationCodeForm;

            // Redirect the user to the login page.
            $state.go('login');
        };

        var startRegisterUserAccountFlow = function (userAccount) {
            $scope.isRegistrationFlowStarted = true;

            var userAccountItem = {
                "username": userAccount.username + '@' + userAccount.companyShortName,
                "password": userAccount.password,
                "applicantName": userAccount.applicantName,
                "position": userAccount.position,
                "email": userAccount.email,
                "mobilePhone": userAccount.mobilePhone
            };

            // Call the register method of the flow service.
            WorkflowsService.registerUserAccount(userAccountItem).then(function (response) {
                // Sample response
                // {"code": 2001, "description": "Created", "detail": "5e2b25201d5f540f0eb11f45"}
                if (response && response.code === 2001 && response.description === 'Created') {
                    notification.flash({
                        type: 'success',
                        text: $translate.instant('Registration.CreateAccount.RegisterFlowStartedSuccessful', {email: userAccount.email})
                    });

                    finalizeRegistration(userAccount.mobilePhone);
                }
            }, function (response) {
                $log.error('User account cannot register on the register flow service. Error: ', response);

                $scope.isRegistrationFlowStarted = false;

                if (response && response.data && response.data.description) {
                    WorkflowsOTPService.showApiError(response);
                } else {
                    notification({
                        type: 'warning',
                        text: $translate.instant('Registration.CreateAccount.RegisterFlowError')
                    });
                }
            });
        };

        var sendOTP = function (userAccount) {
            // Directly send the OTP when the modal opened.
            WorkflowsOTPService.sendOTP(userAccount.mobilePhone).then(function (otpResponse) {
                if (otpResponse && otpResponse.code === 200) {

                    notification({
                        type: 'success',
                        text: $translate.instant('Registration.CreateAccount.OTPSentSuccessful', {mobilePhone: userAccount.mobilePhone})
                    });

                    // Open validation code entry modal.
                    var modalInstance = $uibModal.open({
                        animation: false,
                        templateUrl: 'registration/registration.createaccount.otpvalidation.modal.html',
                        controller: 'RegistrationRegisterVerificationCodeModalCtrl',
                        backdrop: 'static',
                        backdropClass: 'modal-backdrop-dark',
                        resolve: {
                            userAccount: function () {
                                return userAccount;
                            },
                            validityPeriodInSeconds: function () {
                                return otpResponse.validityPeriodInSeconds;
                            }
                        }
                    });

                    modalInstance.result.then(function (response) {
                        startRegisterUserAccountFlow(userAccount);
                    }, function () {
                        // Cancelled.
                    });
                } else {
                    WorkflowsOTPService.showApiError(otpResponse);
                }
            }, function (response) {
                $log.error('OTP cannot sent. Error: ', response);

                if (response && response.status === 500) {
                    WorkflowsOTPService.showApiError(response);
                } else {
                    notification({
                        type: 'warning',
                        text: $translate.instant('Registration.CreateAccount.OTPAlreadySent', {mobilePhone: $scope.mobilePhone})
                    });
                }
            });
        };

        // Step 3 - Final confirmation method.
        $scope.confirm = function (userAccount) {
            //sendOTP(userAccount);
            // Before the application was waiting for OTP confirmation to send request for starting user account registration flow, but for now the OTP sending bypassed.
            startRegisterUserAccountFlow(userAccount);
        };

        // Listen accountForm changes.
        $scope.$on('RegistrationRegisterAccountFormChanged', function (event, formAndObject) {
            $log.debug('RegistrationRegisterAccountFormChanged: ', formAndObject);

            $scope.accountForm = angular.copy(formAndObject.accountForm);

            if (!$scope.steps[1].disabled && !$scope.accountForm.$invalid) {
                $scope.userAccount = angular.copy(formAndObject.userAccount);
            } else {
                $scope.steps[2].disabled = true;

                delete $scope.userAccount;
            }
        });

        // Listen verificationCodeForm changes.
        $scope.$on('RegistrationRegisterVerificationCodeFormChanged', function (event, verificationCodeForm) {
            $log.debug('RegistrationRegisterVerificationCodeFormChanged: ', verificationCodeForm);

            $scope.verificationCodeForm = angular.copy(verificationCodeForm);
        });
    });

    RegistrationModule.controller('RegistrationRegisterCreateAccountFormCtrl', function ($scope, $log) {
        $log.debug('RegistrationRegisterCreateAccountFormCtrl');

        $scope.accountForm = {};
        $scope.userAccount = {};

        $scope.$watch('userAccount', function (newVal, oldVal) {
            if (newVal !== oldVal) {
                $log.debug('RegistrationRegisterAccountFormChanged:emit');

                $scope.$emit('RegistrationRegisterAccountFormChanged', {
                    accountForm: $scope.accountForm,
                    userAccount: $scope.userAccount
                });
            }
        }, true);
    });

    RegistrationModule.controller('RegistrationRegisterVerificationCodeModalCtrl', function ($scope, $log, $uibModalInstance, $interval, $translate, notification, WorkflowsOTPService,
                                                                                             UtilService, userAccount, validityPeriodInSeconds) {
        $log.debug('RegistrationRegisterVerificationCodeModalCtrl');

        $scope.verificationCodeForm = {};

        $scope.verification = {
            code: '',
            userAccount: userAccount
        };

        $scope.mobilePhone = userAccount.mobilePhone;
        $scope.validityPeriodInSeconds = validityPeriodInSeconds;

        // Watch verification code entries to be inform the listeners of the parent controller.
        $scope.$watch('verification.code', function (newVal, oldVal) {
            if (newVal !== oldVal) {
                $log.debug('RegistrationRegisterVerificationCodeFormChanged:emit');

                $scope.$emit('RegistrationRegisterVerificationCodeFormChanged', $scope.verificationCodeForm);
            }
        }, true);

        $scope.resendVerificationCodeButtonEnable = false;
        $scope.resendCounter = {};

        var startCounter = function (validityPeriodInSeconds) {
            $scope.resendVerificationCodeCounter = validityPeriodInSeconds;

            // Cancel the counter interval.
            $interval.cancel($scope.resendCounter);

            $scope.resendCounter = $interval(function () {
                // Reduce 1 second.
                --$scope.resendVerificationCodeCounter;

                // Check if counter is zero or negative.
                if ($scope.resendVerificationCodeCounter <= 0) {
                    $interval.cancel($scope.resendCounter);

                    $scope.resendVerificationCodeButtonEnable = true;
                    delete $scope.resendVerificationCodeCounter;
                }
            }, 1000);
        };

        // Start the counter first.
        startCounter($scope.validityPeriodInSeconds);

        $scope.resendVerificationCode = function () {
            $scope.resendVerificationCodeButtonEnable = false;

            WorkflowsOTPService.sendOTP($scope.mobilePhone).then(function (response) {
                if (response && response.code === 200) {
                    notification({
                        type: 'success',
                        text: $translate.instant('Registration.CreateAccount.OTPResentSuccessful', {mobilePhone: $scope.mobilePhone})
                    });

                    startCounter(response.validityPeriodInSeconds);
                } else {
                    WorkflowsOTPService.showApiError(response);
                }
            }, function (response) {
                $log.error('OTP cannot resent. Error: ', response);

                notification({
                    type: 'warning',
                    text: $translate.instant('Registration.CreateAccount.OTPAlreadySent', {mobilePhone: $scope.mobilePhone})
                });
            });
        };

        $scope.$on('$destroy', function () {
            if (angular.isDefined($scope.resendCounter)) {
                $log.debug('Cancelled verification code timer.');
                $interval.cancel($scope.resendCounter);
            }
        });

        $scope.ok = function (verificationCode) {
            // If the code has entered and clicked the OK button.
            WorkflowsOTPService.verifyOTP($scope.mobilePhone, verificationCode).then(function (response) {
                // Sample response
                // {"code":200,"description":"OTP Verified"}
                if (response && response.code === 200) {
                    $uibModalInstance.close(response);
                } else {
                    WorkflowsOTPService.showApiError(response);
                }

            }, function (response) {
                $log.error('OTP cannot verify. Error: ', response);

                if (response && response.data && response.data.description) {
                    WorkflowsOTPService.showApiError(response);
                } else {
                    notification({
                        type: 'warning',
                        text: $translate.instant('Registration.CreateAccount.OTPInvalid')
                    });
                }
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });

    RegistrationModule.controller('RegistrationRegisterUserAccountActivationCtrl', function ($scope, $log, $stateParams, WorkflowsService) {
        $log.debug('RegistrationRegisterUserAccountActivationCtrl');

        $scope.activationState = 'INITIAL';
        $scope.activationCode = $stateParams.activationCode;

        if ($scope.activationCode) {
            // Call the activate method of the flow service.
            WorkflowsService.activateUserAccount($scope.activationCode).then(function (response) {
                // Sample response
                // {"code": 2000, "description": "OK"}
                if (response && response.code === 2000 && response.description === 'OK') {
                    $scope.activationState = 'COMPLETED';
                } else {
                    $scope.activationState = 'INVALID';
                }
            }, function (response) {
                $log.error('User account cannot activated. Error: ', response);

                $scope.activationState = 'INVALID';
            });
        } else {
            $scope.activationState = 'INVALID';
        }
    });

})();
