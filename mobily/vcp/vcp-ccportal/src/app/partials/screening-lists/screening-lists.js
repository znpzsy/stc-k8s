(function () {

    'use strict';

    angular.module('ccportal.screening-lists', [
        'ccportal.screening-lists.lists',
        'ccportal.screening-lists.mode',
        'ccportal.screening-lists.directives',
        'ccportal.screening-lists.factories'
    ]);

    var ScreeningListsModule = angular.module('ccportal.screening-lists');

    // Screening List Controller
    ScreeningListsModule.controller('ScreeningListsCtrl', function ($scope, $rootScope, $state, $log, UtilService, $translate, Restangular, ScreeningManagerService, ScreeningManagerHelper,
                                                                    isWhiteListAvailable, notification, scopeKey) {

        var msisdn = UtilService.getSubscriberMsisdn();

        $scope.isWhiteListAvailable = isWhiteListAvailable;

        // Get default mode type as per current scope key.
        var defaultModeType = ScreeningManagerService.getDefaultModeTypeByScope(scopeKey);

        $scope.isTimeConstraintAvailable = function () {
            return (!$state.includes('services.coc') && !$state.includes('services.cmb') && !$state.includes('services.mca'));
        };

        $scope.createScreeningMode = function (screeningMode, currentScope) {
            ScreeningManagerService.updateScreeningMode(scopeKey, msisdn, screeningMode).then(function (response) {
                $log.debug('RESPONSE: ', response);
                $log.debug('Screening mode [', scopeKey, '] has been created successfully.');

                // Reload current state again so we created the wanted scope because of that was not exist.
                $state.params.doNotQuerySubscriberAtStateChange = true;
                $state.transitionTo($state.current, {}, { reload: true, inherit: true, notify: true });

                $log.debug('Scope has been created because of this error [', currentScope.message, ']');
            }, function (response) {
                $log.error('Error: ', response);
            });
        };

        $scope.initializeScreeningManagerScope = function (currentScope) {
            if (!angular.isUndefined(currentScope) && !angular.isUndefined(currentScope.errorCode) &&
                currentScope.errorCode !== 0) {
                if (currentScope.errorCode !== ScreeningManagerService.errorCodes.SCOPE_NOT_FOUND &&
                    currentScope.errorCode !== ScreeningManagerService.errorCodes.SERVICE_NOT_FOUND) {
                    notification({
                        type: 'warning',
                        text: currentScope.errorCode + ' ' + currentScope.message
                    });
                } else {
                    var initialScreeningMode = {
                        modeType: defaultModeType,
                        timeConstraintAvailable: false
                    };

                    $scope.createScreeningMode(initialScreeningMode, currentScope);
                }
            }
        }

    });

})();
