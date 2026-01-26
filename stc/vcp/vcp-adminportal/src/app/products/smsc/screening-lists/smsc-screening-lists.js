(function () {

    'use strict';

    angular.module('adminportal.products.smsc.screening-lists', [
        'adminportal.products.smsc.screening-lists.lists',
        'adminportal.products.smsc.screening-lists.smsc-global',
        'adminportal.products.smsc.screening-lists.vas-apps'
    ]);

    var SmscScreeningListsModule = angular.module('adminportal.products.smsc.screening-lists');

    SmscScreeningListsModule.config(function ($stateProvider) {

        $stateProvider.state('products.smsc.screening-lists', {
            url: "/screening-lists",
            templateUrl: 'products/smsc/screening-lists/smsc-screening-lists.html'
        }).state('products.smsc.screening-lists.incoming', {
            abstract: true,
            url: "/incoming",
            template: "<div ui-view></div>"
        }).state('products.smsc.screening-lists.outgoing', {
            abstract: true,
            url: "/outgoing",
            template: "<div ui-view></div>"
        });

    });

    SmscScreeningListsModule.factory('SmscScreeningListsFactory', function ($log, $q, notification, ScreeningManagerService, SCREENING_MANAGER_RULES,
                                                                            SMSC_SCREENING_IDENTIFIERS) {
        var getScopeLists = function (promises, direction, scopeSubscriberKey) {
            var deferred = $q.defer();

            var selectedScreeningModeTypes = {
                MSISDN: SCREENING_MANAGER_RULES[0],
                IMSI: SCREENING_MANAGER_RULES[0],
                MSC: SCREENING_MANAGER_RULES[0],
                HLR: SCREENING_MANAGER_RULES[0]
            };

            var smscScopesWhiteLists = [], smscScopesBlackLists = [];

            $q.all(promises).then(function (results) {
                // Concatenate each arrays to new one to be able to show in a table in view layer.
                _.each(results, function (list) {
                    // Separating each value on the called screening list url to this for example: ["3", "smsc", "screenings", "smsc-smsc", "incoming_msisdn"]
                    // Using the fifth item to decide to idetifier of each records.
                    var restRouteSegments = list.route.split('/');
                    var scopeKey = restRouteSegments[4];
                    var recordTypeIdentifier = (scopeKey.split('_')[1]).toUpperCase();
                    var identifier = _.findWhere(SMSC_SCREENING_IDENTIFIERS, {value: recordTypeIdentifier});

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
                            blackListItem['identifier'] = identifier;
                            blackListItem['scopeSubscriberKey'] = scopeSubscriberKey;
                            blackListItem['scopeKey'] = scopeKey;
                            return blackListItem;
                        });

                        _.map(list.screeningScope.whiteList, function (whiteListItem) {
                            whiteListItem['identifier'] = identifier;
                            whiteListItem['scopeSubscriberKey'] = scopeSubscriberKey;
                            whiteListItem['scopeKey'] = scopeKey;
                            return whiteListItem;
                        });

                        smscScopesWhiteLists = smscScopesWhiteLists.concat(list.screeningScope.whiteList);
                        smscScopesBlackLists = smscScopesBlackLists.concat(list.screeningScope.blackList);

                        selectedScreeningModeTypes[recordTypeIdentifier] = _.findWhere(SCREENING_MANAGER_RULES, {value: list.screeningScope.selectedScreeningModeType});
                    }

                });

                deferred.resolve({
                    scopeSubscriberKey: scopeSubscriberKey,
                    screeningRules: selectedScreeningModeTypes,
                    direction: direction,
                    whiteList: smscScopesWhiteLists,
                    blackList: smscScopesBlackLists
                });
            });

            return deferred.promise;
        };

        return {
            getGlobalIncomingLists: function () {
                var globalIncomingListsPromises = [
                    ScreeningManagerService.getScreeningListsByScopeAndService(ScreeningManagerService.scopes.SMSC_SCOPE_KEY, ScreeningManagerService.lists.SMSC_GLOBAL_KEY, ScreeningManagerService.scopes.SMSC_INCOMING_MSISDN_SCOPE_KEY),
                    ScreeningManagerService.getScreeningListsByScopeAndService(ScreeningManagerService.scopes.SMSC_SCOPE_KEY, ScreeningManagerService.lists.SMSC_GLOBAL_KEY, ScreeningManagerService.scopes.SMSC_INCOMING_IMSI_SCOPE_KEY),
                    ScreeningManagerService.getScreeningListsByScopeAndService(ScreeningManagerService.scopes.SMSC_SCOPE_KEY, ScreeningManagerService.lists.SMSC_GLOBAL_KEY, ScreeningManagerService.scopes.SMSC_INCOMING_MSC_SCOPE_KEY)
                ];

                return getScopeLists(globalIncomingListsPromises, 'incoming', ScreeningManagerService.lists.SMSC_GLOBAL_KEY);
            },
            getGlobalOutgoingLists: function () {
                var globalOutgoingListsPromises = [
                    ScreeningManagerService.getScreeningListsByScopeAndService(ScreeningManagerService.scopes.SMSC_SCOPE_KEY, ScreeningManagerService.lists.SMSC_GLOBAL_KEY, ScreeningManagerService.scopes.SMSC_OUTGOING_MSISDN_SCOPE_KEY),
                    ScreeningManagerService.getScreeningListsByScopeAndService(ScreeningManagerService.scopes.SMSC_SCOPE_KEY, ScreeningManagerService.lists.SMSC_GLOBAL_KEY, ScreeningManagerService.scopes.SMSC_OUTGOING_IMSI_SCOPE_KEY),
                    ScreeningManagerService.getScreeningListsByScopeAndService(ScreeningManagerService.scopes.SMSC_SCOPE_KEY, ScreeningManagerService.lists.SMSC_GLOBAL_KEY, ScreeningManagerService.scopes.SMSC_OUTGOING_MSC_SCOPE_KEY),
                    ScreeningManagerService.getScreeningListsByScopeAndService(ScreeningManagerService.scopes.SMSC_SCOPE_KEY, ScreeningManagerService.lists.SMSC_GLOBAL_KEY, ScreeningManagerService.scopes.SMSC_OUTGOING_HLR_SCOPE_KEY)
                ];

                return getScopeLists(globalOutgoingListsPromises, 'outgoing', ScreeningManagerService.lists.SMSC_GLOBAL_KEY);
            },
            getVasAppsIncomingLists: function (vasId) {
                if (vasId) {
                    var scopeSubscriberKey = ScreeningManagerService.lists.SMSC_PER_APPLICATION_PREFIX_KEY + '-' + vasId;

                    var globalIncomingListsPromises = [
                        ScreeningManagerService.getScreeningListsByScopeAndService(ScreeningManagerService.scopes.SMSC_SCOPE_KEY, scopeSubscriberKey, ScreeningManagerService.scopes.SMSC_INCOMING_MSISDN_SCOPE_KEY),
                        ScreeningManagerService.getScreeningListsByScopeAndService(ScreeningManagerService.scopes.SMSC_SCOPE_KEY, scopeSubscriberKey, ScreeningManagerService.scopes.SMSC_INCOMING_IMSI_SCOPE_KEY),
                        ScreeningManagerService.getScreeningListsByScopeAndService(ScreeningManagerService.scopes.SMSC_SCOPE_KEY, scopeSubscriberKey, ScreeningManagerService.scopes.SMSC_INCOMING_MSC_SCOPE_KEY)
                    ];

                    return getScopeLists(globalIncomingListsPromises, 'incoming', scopeSubscriberKey);
                } else {
                    return getScopeLists([], 'incoming');
                }
            },
            getVasAppsOutgoingLists: function (vasId) {
                if (vasId) {
                    var scopeSubscriberKey = ScreeningManagerService.lists.SMSC_PER_APPLICATION_PREFIX_KEY + '-' + vasId;

                    var globalOutgoingListsPromises = [
                        ScreeningManagerService.getScreeningListsByScopeAndService(ScreeningManagerService.scopes.SMSC_SCOPE_KEY, scopeSubscriberKey, ScreeningManagerService.scopes.SMSC_OUTGOING_MSISDN_SCOPE_KEY),
                        ScreeningManagerService.getScreeningListsByScopeAndService(ScreeningManagerService.scopes.SMSC_SCOPE_KEY, scopeSubscriberKey, ScreeningManagerService.scopes.SMSC_OUTGOING_IMSI_SCOPE_KEY),
                        ScreeningManagerService.getScreeningListsByScopeAndService(ScreeningManagerService.scopes.SMSC_SCOPE_KEY, scopeSubscriberKey, ScreeningManagerService.scopes.SMSC_OUTGOING_MSC_SCOPE_KEY),
                        ScreeningManagerService.getScreeningListsByScopeAndService(ScreeningManagerService.scopes.SMSC_SCOPE_KEY, scopeSubscriberKey, ScreeningManagerService.scopes.SMSC_OUTGOING_HLR_SCOPE_KEY)
                    ];

                    return getScopeLists(globalOutgoingListsPromises, 'outgoing', scopeSubscriberKey);
                } else {
                    return getScopeLists([], 'outgoing');
                }
            }
        };
    });

})();
