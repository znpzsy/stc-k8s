(function () {

    'use strict';

    angular.module('ccportal.users', [
        'ccportal.users.useraccounts'
    ]);

    var UsersModule = angular.module('ccportal.users');

    UsersModule.config(function ($stateProvider) {

        $stateProvider.state('users', {
            abstract: true,
            url: "/users",
            templateUrl: "users/users.html",
            data: {
                headerKey: 'Dashboard.PageHeader',
                doNotQuerySubscriberAtStateChange: true
            },
            resolve: {
                userGroups: function (CMPFService) {
                    return CMPFService.getUserAccountGroupsByName(CMPFService.DSP_CUSTOMER_CARE_USER_GROUP_PREFIX);
                }
            }
        });

    });

})();
