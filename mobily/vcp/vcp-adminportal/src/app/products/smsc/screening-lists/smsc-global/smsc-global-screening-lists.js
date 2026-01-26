(function () {

    'use strict';

    angular.module('adminportal.products.smsc.screening-lists.smsc-global', []);

    var SmscGlobalScreeningListsModule = angular.module('adminportal.products.smsc.screening-lists.smsc-global');

    SmscGlobalScreeningListsModule.config(function ($stateProvider) {

        // Incoming
        $stateProvider.state('products.smsc.screening-lists.incoming.smsc-global', {
            url: "/smsc-smsc",
            templateUrl: "products/smsc/screening-lists/smsc-screening-lists.lists.html",
            data: {
                'pageHeaderKey': 'ScreeningLists.Incoming.PageHeader',
                'subPageHeaderKey': 'Products.SMSC.ScreeningLists.Global.PageHeader'
            },
            controller: function ($scope, $controller, $translate, Restangular, smscScopesList) {
                $controller('SmscScreeningListsListsCtrl', {$scope: $scope, smscScopesList: smscScopesList});
            },
            resolve: {
                smscScopesList: function ($rootScope, SmscScreeningListsFactory) {
                    return SmscScreeningListsFactory.getGlobalIncomingLists();
                }
            }
        });

        // Outgoing
        $stateProvider.state('products.smsc.screening-lists.outgoing.smsc-global', {
            url: "/smsc-smsc",
            templateUrl: "products/smsc/screening-lists/smsc-screening-lists.lists.html",
            data: {
                'pageHeaderKey': 'ScreeningLists.Outgoing.PageHeader',
                'subPageHeaderKey': 'Products.SMSC.ScreeningLists.Global.PageHeader'
            },
            controller: function ($scope, $controller, $translate, Restangular, smscScopesList) {
                $controller('SmscScreeningListsListsCtrl', {$scope: $scope, smscScopesList: smscScopesList});
            },
            resolve: {
                smscScopesList: function ($rootScope, SmscScreeningListsFactory) {
                    return SmscScreeningListsFactory.getGlobalOutgoingLists();
                }
            }
        });

    });

})();


