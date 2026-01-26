(function () {

    'use strict';

    angular.module('adminportal.services.cmb', [
        "adminportal.services.cmb.dashboards",
        "adminportal.services.cmb.advertisement",
        //"adminportal.services.cmb.operations",
        "adminportal.services.cmb.configuration",
        "adminportal.services.cmb.troubleshooting",
        //"adminportal.services.cmb.screening-lists"
    ]);

    var CmbModule = angular.module('adminportal.services.cmb');


    CmbModule.config(function ($stateProvider) {

        $stateProvider.state('services.cmb', {
            abstract: true,
            url: "/cmb",
            templateUrl: 'services/cmb/cmb.html',
            data: {
                headerKey: 'Services.CMB.CallMeBackTitle',
                permissions: [
                    'SERVICES_CMB'
                ]
            }
        });

    });

    // CmbModule.config(function ($stateProvider) {
    //
    //     $stateProvider.state('services.cmb', {
    //         abstract: true,
    //         url: "/cmb",
    //         templateUrl: 'services/cmb/cmb.html',
    //         controller: 'CmbMainCtrl',
    //         resolve: {
    //             header: function ($rootScope, $translate) {
    //                 $rootScope.headerPromise = $translate('Services.CMB.CallMeBackTitle');
    //                 return;
    //             }
    //         }
    //     });
    //
    // });



})();
