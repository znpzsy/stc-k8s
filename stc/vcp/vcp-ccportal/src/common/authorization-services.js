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
                CHARGING_ALL_REFUND: "Charging:All:Refund",

                // Preferences
                PREFERENCES_ALL_READ: "Preferences:All:Read",
                PREFERENCES_ALL_UPDATE: "Preferences:All:Update",

                // Screening List
                CREATE_ALL_SCREENINGLISTS: "ScreeningLists:All:Create",
                READ_ALL_SCREENINGLISTS: "ScreeningLists:All:Read",
                UPDATE_ALL_SCREENINGLISTS: "ScreeningLists:All:Update",
                DELETE_ALL_SCREENINGLISTS: "ScreeningLists:All:Delete",

                // // Subscription - Unused here, for now.
                // SUBSCRIPTION_ALL_SUBSCRIBE: "Subscription:All:Subscribe",
                // SUBSCRIPTION_ALL_UNSUBSCRIBE: "Subscription:All:Unsubscribe",

                // Products
                PRODUCTS_SMSC: "Products:SMSC",
                PRODUCTS_MMSC: "Products:MMSC",
                PRODUCTS_USC: "Products:USC",
                PRODUCTS_USSI: "Products:USSI",
                PRODUCTS_SMSF: "Products:SMSF",
                PRODUCTS_ANTISPAM: "Products:AntiSpam",

                // Services
                SERVICES_CC: "Services:CC",
                SERVICES_CMB: "Services:CMB",
                SERVICES_MCN: "Services:MCN",
                SERVICES_VM: "Services:VM",
                SERVICES_VSMS: "Services:VSMS",
                SERVICES_RBT: "Services:RBT",

                // Troubleshooting
                READ_ALL_TROUBLESHOOTING: "Troubleshooting:All:Read",
                UPDATE_ALL_TROUBLESHOOTING: "Troubleshooting:All:Update",
                DELETE_ALL_TROUBLESHOOTING: "Troubleshooting:All:Delete",

                // SMSC Content View
                SMSC_A2P_PEEK_TROUBLESHOOTING: "Troubleshooting:SMSC:A2P:Peek",
                SMSC_P2A_PEEK_TROUBLESHOOTING: "Troubleshooting:SMSC:P2A:Peek",
                SMSC_P2P_PEEK_TROUBLESHOOTING: "Troubleshooting:SMSC:P2P:Peek",

                // AntiSpam Content View
                ANTISPAM_A2P_PEEK_TROUBLESHOOTING: "Troubleshooting:AntiSpam:A2P:Peek",
                ANTISPAM_P2A_PEEK_TROUBLESHOOTING: "Troubleshooting:AntiSpam:P2A:Peek",
                ANTISPAM_P2P_PEEK_TROUBLESHOOTING: "Troubleshooting:AntiSpam:P2P:Peek",

                // MMSC Content View
                MMSC_A2P_PEEK_TROUBLESHOOTING: "Troubleshooting:MMSC:A2P:Peek",
                MMSC_P2A_PEEK_TROUBLESHOOTING: "Troubleshooting:MMSC:P2A:Peek",
                MMSC_P2P_PEEK_TROUBLESHOOTING: "Troubleshooting:MMSC:P2P:Peek",

                // USSD Content View
                USSD_A2P_PEEK_TROUBLESHOOTING: "Troubleshooting:USC:A2P:Peek",
                USSD_P2A_PEEK_TROUBLESHOOTING: "Troubleshooting:USC:P2A:Peek",

                // DSP CC Portal Related

                // Charging
                CC__CHARGING_DEBIT: "CC::Charging:Debit",
                CC__CHARGING_READ: "CC::Charging:Read",
                CC__CHARGING_REFUND: "CC::Charging:Refund",

                // Messaging
                CC__MESSAGING_READ: "CC::Messaging:Read",
                CC__MESSAGING_PEEK: "CC::Messaging:Peek",

                // // Preference
                // // These are basically the same with the main preference permissions.
                // // PREFERENCES_ALL_X: "Preferences:All:X",
                // CC__PREFERENCE_CREATE: "CC::Preference:Create",
                // CC__PREFERENCE_READ: "CC::Preference:Read",
                // CC__PREFERENCE_UPDATE: "CC::Preference:Update",
                // CC__PREFERENCE_DELETE: "CC::Preference:Delete",

                // Screening
                CC__SCREENING_CREATE: "CC::Screening:Create",
                CC__SCREENING_READ: "CC::Screening:Read",
                CC__SCREENING_UPDATE: "CC::Screening:Update",
                CC__SCREENING_DELETE: "CC::Screening:Delete",

                // Subscriber -- Unused
                // CC__SUBSCRIBER_READ: "CC::Subscriber:Read",
                // CC__SUBSCRIBER_UPDATE: "CC::Subscriber:Update",

                // Subscription
                CC__SUBSCRIPTION_CREATE: "CC::Subscription:Create",
                CC__SUBSCRIPTION_READ: "CC::Subscription:Read",
                CC__SUBSCRIPTION_UPDATE: "CC::Subscription:Update",
                CC__SUBSCRIPTION_DELETE: "CC::Subscription:Delete",
                // RBT Subscription Management - Redirection
                CC__SUBSCRIPTION_REDIRECT: "CC::Subscription:Redirect",

                // Offer
                CC__OFFER_READ: "CC::Offer:Read",
                CC__OFFER_UPDATE: "CC::Offer:Update", // Mainly unused

                // Service
                CC__SERVICE_READ: "CC::Service:Read",
                CC__SERVICE_UPDATE: "CC::Service:Update", // Mainly unused

                // // User - Unused
                // CC__USER_CREATE: "CC::User:Create",
                // CC__USER_READ: "CC::User:Read",
                // CC__USER_UPDATE: "CC::User:Update",
                // CC__USER_DELETE: "CC::User:Delete"
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
                UtilService.putToSessionStore(UtilService.USER_RIGHTS, availableRights);
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
            canDo: _.memoize(function (operation) {
                return this.isOperationsPermitted(operation);
            }),
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
            // Specific permission checks.
            // Charging
            canChargingAllRefund: function () {
                return this.canDo(this.permissions.CHARGING_ALL_REFUND);
            },
            // Preferences
            canPreferencesAllRead: function () {
                return this.canDo(this.permissions.PREFERENCES_ALL_READ);
            },
            canPreferencesAllUpdate: function () {
                return this.canDo(this.permissions.PREFERENCES_ALL_UPDATE);
            },
            // Screening List
            canCreateScreeningLists: function () {
                return this.canDo(this.permissions.CREATE_ALL_SCREENINGLISTS);
            },
            canReadScreeningLists: function () {
                return this.canDo(this.permissions.READ_ALL_SCREENINGLISTS);
            },
            canUpdateScreeningLists: function () {
                return this.canDo(this.permissions.UPDATE_ALL_SCREENINGLISTS);
            },
            canDeleteScreeningLists: function () {
                return this.canDo(this.permissions.DELETE_ALL_SCREENINGLISTS);
            },
            // // Subscription - Unused here, for now.
            // canSubscriptionAllSubscribe: function () {
            //     return this.canDo(this.permissions.SUBSCRIPTION_ALL_SUBSCRIBE);
            // },
            // canSubscriptionAllUnsubscribe: function () {
            //     return this.canDo(this.permissions.SUBSCRIPTION_ALL_UNSUBSCRIBE);
            // },
            // Products
            canSeeSMSC: function () {
                return this.canDo(this.permissions.PRODUCTS_SMSC);
            },
            canSeeMMSC: function () {
                return this.canDo(this.permissions.PRODUCTS_MMSC);
            },
            canSeeUSC: function () {
                return this.canDo(this.permissions.PRODUCTS_USC);
            },
            canSeeUSSI: function () {
                return this.canDo(this.permissions.PRODUCTS_USSI);
            },
            canSeeSMSF: function () {
                return this.canDo(this.permissions.PRODUCTS_SMSF);
            },
            canSeeAntiSpam: function () {
                return this.canDo(this.permissions.PRODUCTS_ANTISPAM);
            },
            // Services
            canSeeCC: function () {
                return this.canDo(this.permissions.SERVICES_CC);
            },
            canSeeCMB: function () {
                return this.canDo(this.permissions.SERVICES_CMB);
            },
            canSeeMCN: function () {
                return this.canDo(this.permissions.SERVICES_MCN);
            },
            // canSeePokeCall: function () {
            //     return this.canDo(this.permissions.SERVICES_PC);
            // },
            canSeeVM: function () {
                return this.canDo(this.permissions.SERVICES_VM);
            },
            canSeeVSMS: function () {
                return this.canDo(this.permissions.SERVICES_VSMS);
            },

            canSeeRBT: function () {
                return this.canDo(this.permissions.SERVICES_RBT);
            },
            // Troubleshooting
            canReadTroubleshooting: function () {
                return this.canDo(this.permissions.READ_ALL_TROUBLESHOOTING);
            },
            canUpdateTroubleshooting: function () {
                return this.canDo(this.permissions.UPDATE_ALL_TROUBLESHOOTING);
            },
            canDeleteTroubleshooting: function () {
                return this.canDo(this.permissions.DELETE_ALL_TROUBLESHOOTING);
            },
            // SMSC Content View
            canPeekSMSCTroubleshooting: function (origAgentType, destAgentType) {
                var UNKNOWN = 0, APPLICATION = 1, PEER = 3, INTERCONNECT = 11;

                var isPermitted = false;
                if (origAgentType === APPLICATION && (destAgentType === PEER || destAgentType === INTERCONNECT || destAgentType === APPLICATION || destAgentType === UNKNOWN)) {
                    isPermitted = this.canDo(this.permissions.SMSC_A2P_PEEK_TROUBLESHOOTING);
                } else if (origAgentType === PEER && destAgentType === APPLICATION) {
                    isPermitted = this.canDo(this.permissions.SMSC_P2A_PEEK_TROUBLESHOOTING);
                } else if (origAgentType === PEER && (destAgentType === PEER || destAgentType === INTERCONNECT || destAgentType === UNKNOWN)) {
                    isPermitted = this.canDo(this.permissions.SMSC_P2P_PEEK_TROUBLESHOOTING);
                } else if (origAgentType === INTERCONNECT && (destAgentType === PEER || destAgentType === INTERCONNECT || destAgentType === UNKNOWN)) {
                    isPermitted = this.canDo(this.permissions.SMSC_P2P_PEEK_TROUBLESHOOTING);
                } else if (origAgentType === INTERCONNECT && destAgentType === APPLICATION) {
                    isPermitted = this.canDo(this.permissions.SMSC_P2A_PEEK_TROUBLESHOOTING);
                }

                return isPermitted;
            },
            // AntiSpamSMS Content View
            canPeekAntiSpamSMSTroubleshooting: function (trafficType) {
                // MO (trafficType == 11|12|13)
                // P2P MT (trafficType == 21)
                // A2P MT (trafficType == 22|23)
                // AO (trafficType == 40)
                //
                // A2P = (A2P MT AO)
                // P2P = (MO + P2P MT)

                var A2P = [22, 23, 40];
                var P2P = [11, 12, 13, 21, 24];

                var trafficTypeNumber = s.toNumber(trafficType);

                var isPermitted = false;
                if (_.contains(A2P, trafficTypeNumber)) {
                    isPermitted = this.canDo(this.permissions.ANTISPAM_A2P_PEEK_TROUBLESHOOTING);
                } else if (_.contains(P2P, trafficTypeNumber)) {
                    isPermitted = this.canDo(this.permissions.ANTISPAM_P2A_PEEK_TROUBLESHOOTING) || this.canDo(this.permissions.ANTISPAM_P2P_PEEK_TROUBLESHOOTING);
                }

                return isPermitted;
            },
            // MMSC Content View
            canPeekMMSCTroubleshooting: function (senderAgentType, recipientAgentType) {
                var PEER = 1, APPLICATION = 3, UNKNOWN = 0;

                var isPermitted = false;
                if (Number(senderAgentType) === APPLICATION) {
                    isPermitted = this.canDo(this.permissions.MMSC_A2P_PEEK_TROUBLESHOOTING);
                } else if (Number(recipientAgentType) === APPLICATION) {
                    isPermitted = this.canDo(this.permissions.MMSC_P2A_PEEK_TROUBLESHOOTING);
                } else if (senderAgentType === PEER && (recipientAgentType === PEER || recipientAgentType === UNKNOWN)) {
                    isPermitted = this.canDo(this.permissions.MMSC_P2P_PEEK_TROUBLESHOOTING);
                }

                return isPermitted;
            },
            // USSD Content View
            canPeekUSSDTroubleshooting: function (isServiceInitiated) {
                var isPermitted = false;
                if (isServiceInitiated) {
                    isPermitted = this.canDo(this.permissions.USSD_A2P_PEEK_TROUBLESHOOTING);
                } else {
                    isPermitted = this.canDo(this.permissions.USSD_P2A_PEEK_TROUBLESHOOTING);
                }

                return isPermitted;
            },
            // DSP Related
            // Charging
            canCcChargingDebit: function () {
                return this.canDo(this.permissions.CC__CHARGING_DEBIT); // Unused
            },
            canCcChargingRead: function () {
                return this.canDo(this.permissions.CC__CHARGING_READ); // Navbar
            },
            canCcChargingRefund: function () {
                return this.canDo(this.permissions.CC__CHARGING_REFUND); // Chggw Activity History
            },
            // Messaging
            canCcMessagingRead: function () {
                return this.canDo(this.permissions.CC__MESSAGING_READ);
            },
            canCcMessagingPeek: function () {
                return this.canDo(this.permissions.CC__MESSAGING_PEEK);
            },

            // Preference
            // canCcPreferenceCreate: function () {
            //     return this.canDo(this.permissions.CC__PREFERENCE_CREATE); // Unused
            // },
            // canCcPreferenceRead: function () {
            //     return this.canDo(this.permissions.CC__PREFERENCE_READ); // Unused
            // },
            // canCcPreferenceUpdate: function () {
            //     return this.canDo(this.permissions.CC__PREFERENCE_UPDATE); // Same as PREFERENCES_ALL_UPDATE
            // },
            // canCcPreferenceDelete: function () {
            //     return this.canDo(this.permissions.CC__PREFERENCE_DELETE); // Unused
            // },

            // Screening
            canCcScreeningCreate: function () {
                return this.canDo(this.permissions.CC__SCREENING_CREATE); // Unused
            },
            canCcScreeningRead: function () {
                return this.canDo(this.permissions.CC__SCREENING_READ);
            },
            canCcScreeningUpdate: function () {
                return this.canDo(this.permissions.CC__SCREENING_UPDATE); // Unused
            },
            canCcScreeningDelete: function () {
                return this.canDo(this.permissions.CC__SCREENING_DELETE); // Unused
            },

            // Subscriber
            // canCcSubscriberRead: function () {
            //     return this.canDo(this.permissions.CC__SUBSCRIBER_READ); // Unused
            // },
            // canCcSubscriberUpdate: function () {
            //     return this.canDo(this.permissions.CC__SUBSCRIBER_UPDATE); // Unused
            // },

            // Subscription
            canCcSubscriptionCreate: function () {
                return this.canDo(this.permissions.CC__SUBSCRIPTION_CREATE); // Service subscription
            },
            canCcSubscriptionRead: function () {
                return this.canDo(this.permissions.CC__SUBSCRIPTION_READ); // Service subscription
            },
            canCcSubscriptionUpdate: function () {
                return this.canDo(this.permissions.CC__SUBSCRIPTION_UPDATE); // Service subscription
            },
            canCcSubscriptionDelete: function () {
                return this.canDo(this.permissions.CC__SUBSCRIPTION_DELETE); // Service subscription
            },

            // RBT Subscription Management - Redirection
            canCcRbtSubscriptionRedirect: function () {
                return this.canDo(this.permissions.CC__SUBSCRIPTION_REDIRECT);
            },

            // Offer
            canCcOfferRead: function () {
                return this.canDo(this.permissions.CC__OFFER_READ);
            },
            canCcOfferUpdate: function () {
                return this.canDo(this.permissions.CC__OFFER_UPDATE); // Mainly unused
            },
            // Service
            canCcServiceRead: function () {
                return this.canDo(this.permissions.CC__SERVICE_READ);
            },
            canCcServiceUpdate: function () {
                return this.canDo(this.permissions.CC__SERVICE_UPDATE);
            },
            // // User - Unused
            // canCcUserCreate: function () {
            //     return this.canDo(this.permissions.CC__USER_CREATE);
            // },
            // canCcUserRead: function () {
            //     return this.canDo(this.permissions.CC__USER_READ);
            // },
            // canCcUserUpdate: function () {
            //     return this.canDo(this.permissions.CC__USER_UPDATE);
            // },
            // canCcUserDelete: function () {
            //     return this.canDo(this.permissions.CC__USER_DELETE);
            // },
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
