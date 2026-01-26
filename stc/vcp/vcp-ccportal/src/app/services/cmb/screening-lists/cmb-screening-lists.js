(function () {

    'use strict';

    angular.module('ccportal.services.cmb.screening-lists', []);

    var CMBScreeningListsModule = angular.module('ccportal.services.cmb.screening-lists');

    CMBScreeningListsModule.config(function ($stateProvider) {

        $stateProvider.state('services.cmb.screening-lists', {
            url: "/screening-lists",
            templateUrl: "partials/screening-lists/screening-lists.html",
            controller: 'ScreeningListsCtrl',
            data: {
                statePrefix: 'services.cmb.'
            },
            resolve: {
                isWhiteListAvailable: function () {
                    return true;
                },
                isBlackListAvailable: function () {
                    return false;
                },
                showLists: function () {
                    return false;
                },
                showModes: function () {
                    return true;
                },
                ruleTypes: function (SCREENING_LISTS_MODE_TYPES_2) {
                    return SCREENING_LISTS_MODE_TYPES_2;
                },
                scopeKey: function (ScreeningManagerService) {
                    return ScreeningManagerService.scopes.CMB_SCOPE_KEY;
                }
            }
        }).state('services.cmb.screening-lists.mode', {
            url: "/mode",
            templateUrl: "partials/screening-lists/screening-lists.mode.html",
            controller: 'ScreeningListsModeCtrl',
            resolve: {
                currentScope: function (UtilService, ScreeningManagerService) {
                    var msisdn = UtilService.getSubscriberMsisdn();

                    return ScreeningManagerService.getScopeByScopeKey(ScreeningManagerService.scopes.CMB_SCOPE_KEY, msisdn);
                }
            }
        });

    // .state('services.cmb.screening-lists.lists', {
    //         url: "/lists",
    //         templateUrl: "partials/screening-lists/screening-lists.lists.html",
    //         controller: 'ScreeningListsListsCtrl',
    //         resolve: {
    //             currentScope: function (UtilService, ScreeningManagerService) {
    //                 var msisdn = UtilService.getSubscriberMsisdn();
    //
    //                 return ScreeningManagerService.getScopeByScopeKey(ScreeningManagerService.scopes.CMB_SCOPE_KEY, msisdn);
    //             }
    //         }
    //     });

    });

})();


