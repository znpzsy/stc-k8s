(function () {

    'use strict';

    /* Idle Service */
    angular.module('partnerportal.idleservice', []);

    var IdleServiceModule = angular.module('partnerportal.idleservice');

    function idleConfServiceProvider() {
        // Number are in seconds.
        var conf = {
            idle: 30 * 60, // Allow only 30 minutes idle.
            timeout: 30,
            keepalive_interval: 15,
            window_interrupt: 'focus',
            progress: {
                max: 30,
                value: 30
            }
        };

        this.conf = conf;
        this.$get = function () {
            return {
                setProgressValue: function (value) {
                    conf.progress.value = value;
                },
                conf: conf
            };
        };
    }

    IdleServiceModule.provider("IdleConfService", idleConfServiceProvider)

    IdleServiceModule.factory('IdleServiceFactory', function ($rootScope, $log, $timeout, $uibModal, Idle, Keepalive, IdleConfService, SessionService,
                                                              CMPFService, UtilService) {
        var sessionKey, tokenJWT, refreshTokenJWT;

        var warningModal, started;

        var closeModal = function () {
            if (warningModal) {
                warningModal.close();
                warningModal = null;
            }
        };

        var start = function () {
            closeModal();
            Idle.watch();
            started = true;
        };

        var stop = function () {
            closeModal();
            Idle.unwatch();
            started = false;
        };

        return {
            idleWatch: function () {
                sessionKey = SessionService.getSessionKey();
                tokenJWT = UtilService.parseJwt(sessionKey.token);
                refreshTokenJWT = UtilService.parseJwt(sessionKey.refreshToken);

                if (tokenJWT && tokenJWT.idle) {
                    // Override the default idle settings if there are server side values.
                    Idle.setIdle(tokenJWT.idle.idleTimeout);
                    Keepalive.setInterval(tokenJWT.idle.keepaliveInterval);
                }

                start();
            },
            idleUnwatch: function () {
                stop();
            },
            bindEvents: function () {
                var _self = this;

                // Start watching when users successfully login. Starts the Keepalive service by default.
                $rootScope.$on('IdleStart', function () {
                    // The user appears to have gone idle
                    $log.debug('Idle: IdleStart event');

                    closeModal();

                    warningModal = $uibModal.open({
                        templateUrl: 'idle/warning.modal.html',
                        windowClass: 'modal-styled',
                        controller: function ($scope, $uibModalInstance) {
                            $scope.progress = IdleConfService.conf.progress;

                            $scope.close = function () {
                                $uibModalInstance.dismiss();
                            };
                        }
                    });
                });

                $rootScope.$on('IdleEnd', function () {
                    // The user has come back from AFK and is doing stuff. If you are warning them, you can use this to hide the dialog.
                    $log.debug('Idle: IdleEnd event');

                    closeModal();
                });

                $rootScope.$on('IdleWarn', function (e, countdown) {
                    // Follows after the IdleStart event, but includes a countdown until the user is considered timed out
                    // the countdown arg is the number of seconds remaining until then. You can change the title or display
                    // a warning dialog from here. You can let them resume their session by calling Idle.watch().
                    $log.debug('Idle: IdleWarn event. Countdown: ', countdown);

                    // Update progress value.
                    IdleConfService.setProgressValue(countdown);
                });

                $rootScope.$on('IdleTimeout', function () {
                    // The user has timed out (meaning idleDuration + timeout has passed without any activity)
                    // this is where you'd log them.
                    $log.debug('Idle: IdleTimeout event');

                    // Stop idle watch.
                    _self.idleUnwatch();

                    // Logout the user.
                    $rootScope.logout();
                });

                $rootScope.$on('Keepalive', function () {
                    // Fo something to keep the user's session alive.
                    $log.debug('Idle: Keepalive event');

                    if (SessionService.isSessionValid()) {
                        var notBeforeNanoTime = Number(refreshTokenJWT.nbf) * 1000;

                        if (UtilService.getCurrentNanoTime() > notBeforeNanoTime) {
                            CMPFService.refreshToken(sessionKey.refreshToken).then(function (refreshTokenResponse) {
                                $log.debug(refreshTokenResponse);

                                // Update the variables which are keeping in this service.
                                sessionKey = SessionService.getSessionKey();
                                refreshTokenJWT = UtilService.parseJwt(refreshTokenResponse.refreshToken);

                                var username = $rootScope.getUsername();

                                // Put the refresh response to the local storage again for updating the old record.
                                SessionService.saveUserAttributesInSession(username, refreshTokenResponse);
                            });
                        }
                    } else {
                        // Stop idle watch.
                        _self.idleUnwatch();

                        // Logout the user.
                        $rootScope.logout();
                    }
                });
            }
        };
    });

})();
