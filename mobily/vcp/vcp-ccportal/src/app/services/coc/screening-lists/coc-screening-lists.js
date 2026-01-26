(function () {

    'use strict';

    angular.module('ccportal.services.coc.screening-lists', []);

    var COCScreeningListsModule = angular.module('ccportal.services.coc.screening-lists');

    COCScreeningListsModule.config(function ($stateProvider) {

        $stateProvider.state('services.coc.screening-lists', {
            url: "/screening-lists",
            templateUrl: "partials/screening-lists/screening-lists.html",
            controller: 'ScreeningListsCtrl',
            data: {
                statePrefix: 'services.coc.'
            },
            resolve: {
                isWhiteListAvailable: function () {
                    return true;
                },
                ruleTypes: function (SCREENING_LISTS_MODE_TYPES) {
                    return SCREENING_LISTS_MODE_TYPES;
                },
                scopeKey: function (ScreeningManagerService) {
                    return ScreeningManagerService.scopes.COC_SCOPE_KEY;
                }
            }
        }).state('services.coc.screening-lists.mode', {
            url: "/mode",
            templateUrl: "partials/screening-lists/screening-lists.mode.html",
            controller: 'ScreeningListsModeCtrl',
            resolve: {
                currentScope: function (UtilService, ScreeningManagerService) {
                    var msisdn = UtilService.getSubscriberMsisdn();

                    return ScreeningManagerService.getScopeByScopeKey(ScreeningManagerService.scopes.COC_SCOPE_KEY, msisdn);
                }
            }
        }).state('services.coc.screening-lists.lists', {
            url: "/lists",
            templateUrl: "partials/screening-lists/screening-lists.lists.html",
            controller: 'ScreeningListsListsCtrl',
            resolve: {
                currentScope: function (UtilService, ScreeningManagerService) {
                    var msisdn = UtilService.getSubscriberMsisdn();

                    return ScreeningManagerService.getScopeByScopeKey(ScreeningManagerService.scopes.COC_SCOPE_KEY, msisdn);
                }
            }
        });

    });

})();
