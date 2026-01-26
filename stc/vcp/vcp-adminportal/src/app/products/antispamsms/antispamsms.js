(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms', [
        "adminportal.products.antispamsms.constants",
        "adminportal.products.antispamsms.directives",
        "adminportal.products.antispamsms.filters",
        "adminportal.products.antispamsms.dashboards",
        "adminportal.products.antispamsms.configuration",
        "adminportal.products.antispamsms.operations",
        "adminportal.products.antispamsms.troubleshooting"
    ]);

    var AntiSpamSMSModule = angular.module('adminportal.products.antispamsms');

    AntiSpamSMSModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms', {
            abstract: true,
            url: "/antispam-sms",
            templateUrl: 'products/antispamsms/antispamsms.html',
            controller: 'AntispamShellCtrl',
            controllerAs: 'ops',
            data: {
                headerKey: 'Products.AntiSpamSMS.PageHeader',
                permissions: [
                    'PRODUCTS_ANTISPAM'
                ]
            }
        });
    });

    AntiSpamSMSModule.controller('AntispamShellCtrl', function ($state, $scope, AuthorizationService) {

        $scope.getLandingHref = function () {

            var landingHref = '';
            if (AuthorizationService.canAntispamAddressRangeRead())
                landingHref = 'products.antispamsms.operations.addressranges.msisdn.list';
            else if (AuthorizationService.canAntispamContentFiltersRead())
                landingHref = 'products.antispamsms.operations.contentfilters.mosmscontent.aparty.list';
            else if (AuthorizationService.canAntispamCountersRead())
                landingHref = 'products.antispamsms.operations.counters.mosmscounter.aparty.simple.list';
            else if (AuthorizationService.canAntispamContentCountersRead())
                landingHref = 'products.antispamsms.operations.simfarmcontrol.containerlist';
            else if (AuthorizationService.canAntispamListsRead())
                landingHref = 'products.antispamsms.operations.antispamlists.list';
            else if (AuthorizationService.canAntispamBlackListsRead())
                landingHref = 'products.antispamsms.operations.blacklists.url.list';
            else if (AuthorizationService.canAntispamGreyListsRead())
                landingHref = 'products.antispamsms.operations.greylists.moinboundroamer.list';
            else if (AuthorizationService.canAntispamScreeningListsRead())
                landingHref = 'products.antispamsms.operations.screenings.intltoinboundroamer.list';
            else if (AuthorizationService.canAntispamSCAModifiersRead())
                landingHref = 'products.antispamsms.operations.scamodifiers.list';
            else if (AuthorizationService.canAntispamSMSModificationRead())
                landingHref = 'products.antispamsms.operations.smsbodymodification.list';
            else if (AuthorizationService.canAntispamSuspiciousMessagesRead())
                landingHref = 'products.antispamsms.operations.suspiciousmessages.frauddetection.list';
            else
                landingHref = '';

            return $state.href(landingHref);
        }
    });


})();
