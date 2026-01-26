(function () {

    'use strict';

    angular.module('adminportal.services.cmb.screening-lists.cmb-global', []);

    var CMBGlobalScreeningListsModule = angular.module('adminportal.services.cmb.screening-lists.cmb-global');

    CMBGlobalScreeningListsModule.config(function ($stateProvider) {

        // Incoming
        $stateProvider.state('services.cmb.screening-lists.incoming.cmb-global', {
            url: "/global",
            templateUrl: "services/cmb/screening-lists/cmb-screening-lists.lists.html",
            data: {
                'pageHeaderKey': 'ScreeningLists.Incoming.PageHeader',
                'subPageHeaderKey': 'Services.CMB.ScreeningLists.Global.PageHeader'
            },
            controller: function ($scope, $controller, $translate, Restangular, cmbScopesList) {
                $controller('CMBScreeningListsListsCtrl', {$scope: $scope, cmbScopesList: cmbScopesList});
            },
            resolve: {
                cmbScopesList: function ($rootScope, CMBScreeningListsFactory) {
                    return CMBScreeningListsFactory.getGlobalIncomingLists();
                }
            }
        });

        // Outgoing
        $stateProvider.state('services.cmb.screening-lists.outgoing.cmb-global', {
            url: "/global",
            templateUrl: "services/cmb/screening-lists/cmb-screening-lists.lists.html",
            data: {
                'pageHeaderKey': 'ScreeningLists.Outgoing.PageHeader',
                'subPageHeaderKey': 'Services.CMB.ScreeningLists.Global.PageHeader'
            },
            controller: function ($scope, $controller, $translate, Restangular, cmbScopesList) {
                $controller('CMBScreeningListsListsCtrl', {$scope: $scope, cmbScopesList: cmbScopesList});
            },
            resolve: {
                cmbScopesList: function ($rootScope, CMBScreeningListsFactory) {
                    return CMBScreeningListsFactory.getGlobalOutgoingLists();
                }
            }
        });

    });

})();


