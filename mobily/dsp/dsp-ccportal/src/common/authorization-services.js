(function () {
    'use strict';

    /* Authorization Services */
    angular.module('Application.authorization-services', []);

    var ApplicationAuthorizationServices = angular.module('Application.authorization-services');

    ApplicationAuthorizationServices.factory('AuthorizationService', function ($q, $log, UtilService, CMPFService, Restangular, RESOURCE_NAME) {
        return {
            userRights: [],
            permissions: {
                // Charging
                CC__CHARGING_DEBIT: "CC::Charging:Debit",
                CC__CHARGING_READ: "CC::Charging:Read",
                CC__CHARGING_REFUND: "CC::Charging:Refund",

                // Messaging
                CC__MESSAGING_READ: "CC::Messaging:Read",
                CC__MESSAGING_PEEK: "CC::Messaging:Peek",

                // Preference
                CC__PREFERENCE_CREATE: "CC::Preference:Create",
                CC__PREFERENCE_READ: "CC::Preference:Read",
                CC__PREFERENCE_UPDATE: "CC::Preference:Update",
                CC__PREFERENCE_DELETE: "CC::Preference:Delete",

                // Screening
                CC__SCREENING_CREATE: "CC::Screening:Create",
                CC__SCREENING_READ: "CC::Screening:Read",
                CC__SCREENING_UPDATE: "CC::Screening:Update",
                CC__SCREENING_DELETE: "CC::Screening:Delete",

                // Subscriber
                CC__SUBSCRIBER_READ: "CC::Subscriber:Read",
                CC__SUBSCRIBER_UPDATE: "CC::Subscriber:Update",

                // Subscription
                CC__SUBSCRIPTION_CREATE: "CC::Subscription:Create",
                CC__SUBSCRIPTION_READ: "CC::Subscription:Read",
                CC__SUBSCRIPTION_UPDATE: "CC::Subscription:Update",
                CC__SUBSCRIPTION_DELETE: "CC::Subscription:Delete",

                // Offer
                CC__OFFER_READ: "CC::Offer:Read",
                CC__OFFER_UPDATE: "CC::Offer:Update",

                // Service
                CC__SERVICE_READ: "CC::Service:Read",
                CC__SERVICE_UPDATE: "CC::Service:Update",

                // User
                CC__USER_CREATE: "CC::User:Create",
                CC__USER_READ: "CC::User:Read",
                CC__USER_UPDATE: "CC::User:Update",
                CC__USER_DELETE: "CC::User:Delete"
            },
            // Main Methods
            getPermissions: function (uid) {
                return CMPFService.getUserAccountRights(uid);
            },
            extractUserRights: function (allRights) {
                this.removeUserRights();

                var foundUserRights = _.where(allRights, {resourceName: RESOURCE_NAME});

                $log.debug("Found resource rights: ", foundUserRights);

                return foundUserRights;
            },
            storeUserRights: function (userRights) {
                // Convert to map which contains only rights
                var availableRights = _.map(userRights, _.iteratee('operationName'));

                $log.debug("Found available user rights: ", availableRights);

                // Store session and this service
                UtilService.putToSessionStore(UtilService.USER_RIGHTS, {
                    resourceName: RESOURCE_NAME,
                    rights: availableRights
                });

                this.setUserRights(availableRights);
            },
            removeUserRights: function () {
                UtilService.removeFromSessionStore(UtilService.USER_RIGHTS);

                this.canDo.cache = {};
            },
            // User rights getter and setter
            setUserRights: function (userRights) {
                this.userRights = userRights;
            },
            getUserRights: function () {
                return this.userRights;
            },
            // The operationName can be an item or can be an array. This method checks all passed permissions with the argument is defined for our resource.
            isOperationsPermitted: function (operationNames) {
                var userRights = this.getUserRights();

                var operationNameArray = _.isArray(operationNames) ? operationNames : [operationNames];

                var rightIntersection = _.intersection(userRights, operationNameArray);

                //$log.debug("Right intersection: ", rightIntersection);

                return rightIntersection.length === operationNameArray.length;
            },
            canDo: function (operation) {
                return this.isOperationsPermitted(operation);
            },
            // Specific permission checks.
            // Check permission list
            checkPermissionList: function (permissions) {
                var isPermitted = true, _self = this;
                if (permissions && _.isArray(permissions)) {
                    _.each(permissions, function (permission) {
                        var permission = _self.permissions[permission];

                        isPermitted = isPermitted && _self.canDo(permission);
                    });
                }

                return isPermitted;
            },
            // Charging
            canCcChargingDebit: function () {
                return this.canDo(this.permissions.CC__CHARGING_DEBIT);
            },
            canCcChargingRead: function () {
                return this.canDo(this.permissions.CC__CHARGING_READ);
            },
            canCcChargingRefund: function () {
                return this.canDo(this.permissions.CC__CHARGING_REFUND);
            },
            // Messaging
            canCcMessagingRead: function () {
                return this.canDo(this.permissions.CC__MESSAGING_READ);
            },
            canCcMessagingPeek: function () {
                return this.canDo(this.permissions.CC__MESSAGING_PEEK);
            },
            // Preference
            canCcPreferenceCreate: function () {
                return this.canDo(this.permissions.CC__PREFERENCE_CREATE);
            },
            canCcPreferenceRead: function () {
                return this.canDo(this.permissions.CC__PREFERENCE_READ);
            },
            canCcPreferenceUpdate: function () {
                return this.canDo(this.permissions.CC__PREFERENCE_UPDATE);
            },
            canCcPreferenceDelete: function () {
                return this.canDo(this.permissions.CC__PREFERENCE_DELETE);
            },
            // Screening
            canCcScreeningCreate: function () {
                return this.canDo(this.permissions.CC__SCREENING_CREATE);
            },
            canCcScreeningRead: function () {
                return this.canDo(this.permissions.CC__SCREENING_READ);
            },
            canCcScreeningUpdate: function () {
                return this.canDo(this.permissions.CC__SCREENING_UPDATE);
            },
            canCcScreeningDelete: function () {
                return this.canDo(this.permissions.CC__SCREENING_DELETE);
            },
            // Subscriber
            canCcSubscriberRead: function () {
                return this.canDo(this.permissions.CC__SUBSCRIBER_READ);
            },
            canCcSubscriberUpdate: function () {
                return this.canDo(this.permissions.CC__SUBSCRIBER_UPDATE);
            },
            // Subscription
            canCcSubscriptionCreate: function () {
                return this.canDo(this.permissions.CC__SUBSCRIPTION_CREATE);
            },
            canCcSubscriptionRead: function () {
                return this.canDo(this.permissions.CC__SUBSCRIPTION_READ);
            },
            canCcSubscriptionUpdate: function () {
                return this.canDo(this.permissions.CC__SUBSCRIPTION_UPDATE);
            },
            canCcSubscriptionDelete: function () {
                return this.canDo(this.permissions.CC__SUBSCRIPTION_DELETE);
            },
            // Offer
            canCcOfferRead: function () {
                return this.canDo(this.permissions.CC__OFFER_READ);
            },
            canCcOfferUpdate: function () {
                return this.canDo(this.permissions.CC__OFFER_UPDATE);
            },
            // Service
            canCcServiceRead: function () {
                return this.canDo(this.permissions.CC__SERVICE_READ);
            },
            canCcServiceUpdate: function () {
                return this.canDo(this.permissions.CC__SERVICE_UPDATE);
            },
            // User
            canCcUserCreate: function () {
                return this.canDo(this.permissions.CC__USER_CREATE);
            },
            canCcUserRead: function () {
                return this.canDo(this.permissions.CC__USER_READ);
            },
            canCcUserUpdate: function () {
                return this.canDo(this.permissions.CC__USER_UPDATE);
            },
            canCcUserDelete: function () {
                return this.canDo(this.permissions.CC__USER_DELETE);
            },
            // Diagnostics
            canSeeDiagnostics: function () {
                return true;
            },
            // AuditLogs
            canAllDiagnosticsAuditLogs: function () {
                return true;
            }
        };
    });

})();
