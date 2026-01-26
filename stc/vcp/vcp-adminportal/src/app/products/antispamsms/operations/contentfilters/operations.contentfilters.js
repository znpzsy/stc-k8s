(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.contentfilters', [
        "adminportal.products.antispamsms.operations.contentfilters.addressranges",
        "adminportal.products.antispamsms.operations.contentfilters.mosmscontent",
        "adminportal.products.antispamsms.operations.contentfilters.mtsmscontent",
        "adminportal.products.antispamsms.operations.contentfilters.aosmscontent",
        "adminportal.products.antispamsms.operations.contentfilters.substitutions",
        "adminportal.products.antispamsms.operations.contentfilters.fingerprints"
    ]);

    var AntiSpamSMSOperationsContentFiltersModule = angular.module('adminportal.products.antispamsms.operations.contentfilters');

    AntiSpamSMSOperationsContentFiltersModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations.contentfilters', {
            abstract: true,
            url: "/contentfilters",
            template: '<div ui-view></div>',
            controller: 'AntiSpamSMSOperationsContentFiltersCommonCtrl'
        });

    });

    AntiSpamSMSOperationsContentFiltersModule.controller('AntiSpamSMSOperationsContentFiltersCommonCtrl', function ($scope, $log, $q, $uibModal, ContentManagementService, UtilService) {
        $log.debug('AntiSpamSMSOperationsContentFiltersCommonCtrl');


        $scope.setSubstitutions = function (filterName) {
            $uibModal.open({
                templateUrl: 'products/antispamsms/operations/contentfilters/operations.contentfilters.substitutions.modal.html',
                controller: 'AntiSpamSMSOperationsContentFiltersSubstitutionsModalCtrl',
                size: 'lg',
                resolve: {
                    filterName: function () {
                        return filterName;
                    },
                    substitutions: function (SMSAntiSpamConfigService) {
                        return SMSAntiSpamConfigService.getSubstitutionsListByContentFilter(filterName);
                    }
                }
            });
        };
    });

})();
