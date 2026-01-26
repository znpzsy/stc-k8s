(function () {

    'use strict';

    angular.module('adminportal.services.rbt.campaigns', [
        'adminportal.services.rbt.campaigns.happyhour',
        'adminportal.services.rbt.campaigns.xdaysfree',
        'adminportal.services.rbt.campaigns.bogof',
    ]);

    var RBTCampaignsModule = angular.module('adminportal.services.rbt.campaigns');

    RBTCampaignsModule.config(function ($stateProvider) {

        $stateProvider.state('services.rbt.campaigns', {
            abstract: true,
            url: "/campaigns",
            templateUrl: "services/rbt/campaigns/campaigns.html"
        });

    });

})();
