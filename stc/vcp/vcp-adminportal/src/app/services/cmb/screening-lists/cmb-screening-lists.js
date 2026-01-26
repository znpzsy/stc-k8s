(function () {

    'use strict';

    angular.module('adminportal.services.cmb.screening-lists', [
        'adminportal.services.cmb.screening-lists.lists',
        'adminportal.services.cmb.screening-lists.cmb-global'
    ]);

    var CMBScreeningListsModule = angular.module('adminportal.services.cmb.screening-lists');

    CMBScreeningListsModule.config(function ($stateProvider) {

        $stateProvider.state('services.cmb.screening-lists', {
            url: "/screening-lists",
            templateUrl: 'services/cmb/screening-lists/cmb-screening-lists.html'
        }).state('services.cmb.screening-lists.incoming', {
            abstract: true,
            url: "/incoming",
            templateUrl: "partials/simple.abstract.html"
        }).state('services.cmb.screening-lists.outgoing', {
            abstract: true,
            url: "/outgoing",
            templateUrl: "partials/simple.abstract.html"
        });

    });

    CMBScreeningListsModule.factory('CMBScreeningListsFactory', function ($log, $q, notification, ScreeningManagerService, SCREENING_MANAGER_RULES,
                                                                          CMB_SCREENING_IDENTIFIERS) {
        var getScopeLists = function (promises, direction, scopeSubscriberKey) {
            var deferred = $q.defer();

            var selectedScreeningModeTypes = {
                MSISDN: SCREENING_MANAGER_RULES[0]
            };

            var cmbScopesBlackLists = [];

            $q.all(promises).then(function (results) {
                // Concatenate each arrays to new one to be able to show in a table in view layer.
                _.each(results, function (list) {
                    // Separating each value on the called screening list url to this for example: ["3", "cc", "screenings", "__SERVICE_cmb_incoming", "global"]
                    var restRouteSegments = list.route.split('/');
                    var scopeKey = restRouteSegments[4];
                    var identifier = CMB_SCREENING_IDENTIFIERS[0];

                    if (!angular.isUndefined(list) && !angular.isUndefined(list.errorCode) && list.errorCode !== 0) {
                        if (list.errorCode !== ScreeningManagerService.errorCodes.SCOPE_NOT_FOUND &&
                            list.errorCode !== ScreeningManagerService.errorCodes.SUBSCRIBER_NOT_FOUND) {
                            notification({
                                type: 'danger',
                                text: scopeSubscriberKey + '/' + scopeKey + ': ' + list.message + ' [' + list.errorCode + ']'
                            });
                        }
                    } else {
                        _.map(list.screeningScope.blackList, function (blackListItem) {
                            blackListItem.identifier = identifier;
                            blackListItem.scopeSubscriberKey = scopeSubscriberKey;
                            blackListItem.scopeKey = scopeKey;
                            return blackListItem;
                        });

                        cmbScopesBlackLists = cmbScopesBlackLists.concat(list.screeningScope.blackList);

                        selectedScreeningModeTypes[identifier.value] = _.findWhere(SCREENING_MANAGER_RULES, {value: list.screeningScope.selectedScreeningModeType});
                    }
                });

                deferred.resolve({
                    scopeSubscriberKey: scopeSubscriberKey,
                    screeningRules: selectedScreeningModeTypes,
                    direction: direction,
                    blackList: cmbScopesBlackLists
                });
            });

            return deferred.promise;
        };

        return {
            getGlobalIncomingLists: function () {
                var globalIncomingListsPromises = [
                    ScreeningManagerService.getScreeningListsByScopeAndService(ScreeningManagerService.scopes.COC_SCOPE_KEY, ScreeningManagerService.lists.CMB_GLOBAL_INCOMING_LIST_KEY, ScreeningManagerService.scopes.GLOBAL_SCOPE_KEY)
                ];

                return getScopeLists(globalIncomingListsPromises, 'incoming', ScreeningManagerService.lists.CMB_GLOBAL_INCOMING_LIST_KEY);
            },
            getGlobalOutgoingLists: function () {
                var globalOutgoingListsPromises = [
                    ScreeningManagerService.getScreeningListsByScopeAndService(ScreeningManagerService.scopes.COC_SCOPE_KEY, ScreeningManagerService.lists.CMB_GLOBAL_OUTGOING_LIST_KEY, ScreeningManagerService.scopes.GLOBAL_SCOPE_KEY)
                ];

                return getScopeLists(globalOutgoingListsPromises, 'outgoing', ScreeningManagerService.lists.CMB_GLOBAL_OUTGOING_LIST_KEY);
            }
        };
    });

})();
