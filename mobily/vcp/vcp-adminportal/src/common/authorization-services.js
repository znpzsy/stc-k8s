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

                // Configuration
                READ_CONFIGURATION: "Configuration:All:Read",
                UPDATE_CONFIGURATION: "Configuration:All:Update",

                // Generic Operations
                CREATE_OPERATIONS: "Operations:All:Create",
                READ_OPERATIONS: "Operations:All:Read",
                UPDATE_OPERATIONS: "Operations:All:Update",
                DELETE_OPERATIONS: "Operations:All:Delete",

                // Offer
                CREATE_OPERATIONS_OFFER: "Operations:Provisioning:Offer:Create",
                READ_OPERATIONS_OFFER: "Operations:Provisioning:Offer:Read",
                UPDATE_OPERATIONS_OFFER: "Operations:Provisioning:Offer:Update",
                DELETE_OPERATIONS_OFFER: "Operations:Provisioning:Offer:Delete",

                // Operator
                CREATE_OPERATIONS_OPERATOR: "Operations:Provisioning:Operator:Create",
                READ_OPERATIONS_OPERATOR: "Operations:Provisioning:Operator:Read",
                UPDATE_OPERATIONS_OPERATOR: "Operations:Provisioning:Operator:Update",
                DELETE_OPERATIONS_OPERATOR: "Operations:Provisioning:Operator:Delete",

                // Service
                CREATE_OPERATIONS_SERVICE: "Operations:Provisioning:Service:Create",
                READ_OPERATIONS_SERVICE: "Operations:Provisioning:Service:Read",
                UPDATE_OPERATIONS_SERVICE: "Operations:Provisioning:Service:Update",
                DELETE_OPERATIONS_SERVICE: "Operations:Provisioning:Service:Delete",

                // Service Provider
                CREATE_OPERATIONS_SERVICE_PROVIDER: "Operations:Provisioning:ServiceProvider:Create",
                READ_OPERATIONS_SERVICE_PROVIDER: "Operations:Provisioning:ServiceProvider:Read",
                UPDATE_OPERATIONS_SERVICE_PROVIDER: "Operations:Provisioning:ServiceProvider:Update",
                DELETE_OPERATIONS_SERVICE_PROVIDER: "Operations:Provisioning:ServiceProvider:Delete",

                // Subscriber
                CREATE_OPERATIONS_SUBSCRIBER: "Operations:Provisioning:Subscriber:Create",
                READ_OPERATIONS_SUBSCRIBER: "Operations:Provisioning:Subscriber:Read",
                UPDATE_OPERATIONS_SUBSCRIBER: "Operations:Provisioning:Subscriber:Update",
                DELETE_OPERATIONS_SUBSCRIBER: "Operations:Provisioning:Subscriber:Delete",

                // Subscription
                READ_OPERATIONS_SUBSCRIPTION: "Operations:Provisioning:Subscription:Read",

                // User Account
                CREATE_OPERATIONS_USERACCOUNT: "Operations:Provisioning:UserAccount:Create",
                READ_OPERATIONS_USERACCOUNT: "Operations:Provisioning:UserAccount:Read",
                UPDATE_OPERATIONS_USERACCOUNT: "Operations:Provisioning:UserAccount:Update",
                DELETE_OPERATIONS_USERACCOUNT: "Operations:Provisioning:UserAccount:Delete",

                // User Group
                CREATE_OPERATIONS_USERGROUP: "Operations:Provisioning:UserGroup:Create",
                READ_OPERATIONS_USERGROUP: "Operations:Provisioning:UserGroup:Read",
                UPDATE_OPERATIONS_USERGROUP: "Operations:Provisioning:UserGroup:Update",
                DELETE_OPERATIONS_USERGROUP: "Operations:Provisioning:UserGroup:Delete",

                // Products
                PRODUCTS_SMSC: "Products:SMSC",
                PRODUCTS_ANTISPAM: "Products:AntiSpam",
                PRODUCTS_MMSC: "Products:MMSC",
                PRODUCTS_USC: "Products:USC",
                // TODO: This operation right only exists in local test for now.
                // Please use the correct operation right when it is available on live site. (will have to be defined directly on CMPF db, via script.)
                PRODUCTS_USSI: "Products:USSI",
                PRODUCTS_SMSF: "Products:SMSF",

                // Reports
                READ_REPORTS_ONDEMAND: "Reports:OnDemand:Read",
                CREATE_REPORTS_SCHEDULED: "Reports:Scheduled:Create",
                READ_REPORTS_SCHEDULED: "Reports:Scheduled:Read",
                UPDATE_REPORTS_SCHEDULED: "Reports:Scheduled:Update",
                DELETE_REPORTS_SCHEDULED: "Reports:Scheduled:Delete",

                // Screening Lists
                CREATE_SCREENING_LISTS: "ScreeningLists:All:Create",
                READ_SCREENING_LISTS: "ScreeningLists:All:Read",
                UPDATE_SCREENING_LISTS: "ScreeningLists:All:Update",
                DELETE_SCREENING_LISTS: "ScreeningLists:All:Delete",

                // Services
                SERVICES_CC: "Services:CC",
                SERVICES_MCN: "Services:MCN",
                SERVICES_PC: "Services:PC",
                SERVICES_NM: "Services:NM",
                SERVICES_VM: "Services:VM",
                SERVICES_RBT: "Services:RBT",

                // Subsystems
                SUBSYSTEMS_DIAGNOSTICS: "Subsystems:Diagnostics",
                SUBSYSTEMS_LICENSEMGMT: "Subsystems:LicenseMgmt",
                SUBSYSTEMS_PROVISIONING: "Subsystems:Provisioning",
                SUBSYSTEMS_REPORTGENERATION: "Subsystems:ReportGeneration",
                SUBSYSTEMS_SCREENINGMGMT: "Subsystems:ScreeningMgmt",

                // Templates related permissions
                CREATE_TEMPLATES: "Templates:All:Create",
                READ_TEMPLATES: "Templates:All:Read",
                UPDATE_TEMPLATES: "Templates:All:Update",
                DELETE_TEMPLATES: "Templates:All:Delete",

                // Advertisements related permissions
                CREATE_ADVERTISEMENTS: "Advertisements:All:Create",
                READ_ADVERTISEMENTS: "Advertisements:All:Read",
                UPDATE_ADVERTISEMENTS: "Advertisements:All:Update",
                DELETE_ADVERTISEMENTS: "Advertisements:All:Delete",

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
                USSD_P2A_PEEK_TROUBLESHOOTING: "Troubleshooting:USC:P2A:Peek"
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
            canChargingAllRefund: function () {
                return this.canDo(this.permissions.CHARGING_ALL_REFUND);
            },
            // Configuration
            canReadConfiguration: function () {
                return this.canDo(this.permissions.READ_CONFIGURATION);
            },
            canUpdateConfiguration: function () {
                return this.canDo(this.permissions.UPDATE_CONFIGURATION);
            },
            // Generic Operation
            canCreate: function () {
                return this.canDo(this.permissions.CREATE_OPERATIONS);
            },
            canRead: function () {
                return this.canDo(this.permissions.READ_OPERATIONS);
            },
            canUpdate: function () {
                return this.canDo(this.permissions.UPDATE_OPERATIONS);
            },
            canDelete: function () {
                return this.canDo(this.permissions.DELETE_OPERATIONS);
            },
            // Offer
            canCreateOffer: function () {
                return this.canDo(this.permissions.CREATE_OPERATIONS_OFFER);
            },
            canReadOffer: function () {
                return this.canDo(this.permissions.READ_OPERATIONS_OFFER);
            },
            canUpdateOffer: function () {
                return this.canDo(this.permissions.UPDATE_OPERATIONS_OFFER);
            },
            canDeleteOffer: function () {
                return this.canDo(this.permissions.DELETE_OPERATIONS_OFFER);
            },
            // Operator
            canCreateOperator: function () {
                return this.canDo(this.permissions.CREATE_OPERATIONS_OPERATOR);
            },
            canReadOperator: function () {
                return this.canDo(this.permissions.READ_OPERATIONS_OPERATOR);
            },
            canUpdateOperator: function () {
                return this.canDo(this.permissions.UPDATE_OPERATIONS_OPERATOR);
            },
            canDeleteOperator: function () {
                return this.canDo(this.permissions.DELETE_OPERATIONS_OPERATOR);
            },
            // Service
            canCreateService: function () {
                return this.canDo(this.permissions.CREATE_OPERATIONS_SERVICE);
            },
            canReadService: function () {
                return this.canDo(this.permissions.READ_OPERATIONS_SERVICE);
            },
            canUpdateService: function () {
                return this.canDo(this.permissions.UPDATE_OPERATIONS_SERVICE);
            },
            canDeleteService: function () {
                return this.canDo(this.permissions.DELETE_OPERATIONS_SERVICE);
            },
            // ServiceProvider
            canCreateServiceProvider: function () {
                return this.canDo(this.permissions.CREATE_OPERATIONS_SERVICE_PROVIDER);
            },
            canReadServiceProvider: function () {
                return this.canDo(this.permissions.READ_OPERATIONS_SERVICE_PROVIDER);
            },
            canUpdateServiceProvider: function () {
                return this.canDo(this.permissions.UPDATE_OPERATIONS_SERVICE_PROVIDER);
            },
            canDeleteServiceProvider: function () {
                return this.canDo(this.permissions.DELETE_OPERATIONS_SERVICE_PROVIDER);
            },
            // Subscriber
            canCreateSubscriber: function () {
                return this.canDo(this.permissions.CREATE_OPERATIONS_SUBSCRIBER);
            },
            canReadSubscriber: function () {
                return this.canDo(this.permissions.READ_OPERATIONS_SUBSCRIBER);
            },
            canUpdateSubscriber: function () {
                return this.canDo(this.permissions.UPDATE_OPERATIONS_SUBSCRIBER);
            },
            canDeleteSubscriber: function () {
                return this.canDo(this.permissions.DELETE_OPERATIONS_SUBSCRIBER);
            },
            // Subscription
            canReadSubscription: function () {
                return this.canDo(this.permissions.READ_OPERATIONS_SUBSCRIPTION);
            },
            // User Account
            canCreateUserAccount: function () {
                return this.canDo(this.permissions.CREATE_OPERATIONS_USERACCOUNT);
            },
            canReadUserAccount: function () {
                return this.canDo(this.permissions.READ_OPERATIONS_USERACCOUNT);
            },
            canUpdateUserAccount: function () {
                return this.canDo(this.permissions.UPDATE_OPERATIONS_USERACCOUNT);
            },
            canDeleteUserAccount: function () {
                return this.canDo(this.permissions.DELETE_OPERATIONS_USERACCOUNT);
            },
            // User Group
            canCreateUserGroup: function () {
                return this.canDo(this.permissions.CREATE_OPERATIONS_USERGROUP);
            },
            canReadUserGroup: function () {
                return this.canDo(this.permissions.READ_OPERATIONS_USERGROUP);
            },
            canUpdateUserGroup: function () {
                return this.canDo(this.permissions.UPDATE_OPERATIONS_USERGROUP);
            },
            canDeleteUserGroup: function () {
                return this.canDo(this.permissions.DELETE_OPERATIONS_USERGROUP);
            },
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
            // Reports
            canReadReportOnDemand: function () {
                return this.canDo(this.permissions.READ_REPORTS_ONDEMAND);
            },
            canCreateReportSchedule: function () {
                return this.canDo(this.permissions.CREATE_REPORTS_SCHEDULED);
            },
            canReadReportSchedule: function () {
                return this.canDo(this.permissions.READ_REPORTS_SCHEDULED);
            },
            canUpdateReportSchedule: function () {
                return this.canDo(this.permissions.UPDATE_REPORTS_SCHEDULED);
            },
            canDeleteReportSchedule: function () {
                return this.canDo(this.permissions.DELETE_REPORTS_SCHEDULED);
            },
            // Screening List
            canCreateScreeningLists: function () {
                return this.canDo(this.permissions.CREATE_SCREENING_LISTS);
            },
            canReadScreeningLists: function () {
                return this.canDo(this.permissions.READ_SCREENING_LISTS);
            },
            canUpdateScreeningLists: function () {
                return this.canDo(this.permissions.UPDATE_SCREENING_LISTS);
            },
            canDeleteScreeningLists: function () {
                return this.canDo(this.permissions.DELETE_SCREENING_LISTS);
            },
            // Services
            canSeeCC: function () {
                return this.canDo(this.permissions.SERVICES_CC);
            },
            canSeeMCN: function () {
                return this.canDo(this.permissions.SERVICES_MCN);
            },
            canSeePokeCall: function () {
                return this.canDo(this.permissions.SERVICES_PC);
            },
            canSeeNotifyMe: function () {
                return this.canDo(this.permissions.SERVICES_NM);
            },
            canSeeVM: function () {
                return this.canDo(this.permissions.SERVICES_VM);
            },
            canSeeRBT: function () {
                return this.canDo(this.permissions.SERVICES_RBT);
            },
            // Subsystems
            canSeeProvisioning: function () {
                return this.canDo(this.permissions.SUBSYSTEMS_PROVISIONING);
            },
            canSeeScreeningMgmt: function () {
                return this.canDo(this.permissions.SUBSYSTEMS_SCREENINGMGMT);
            },
            canSeeDiagnostics: function () {
                return this.canDo(this.permissions.SUBSYSTEMS_DIAGNOSTICS);
            },
            canSeeLicenseMgmt: function () {
                return this.canDo(this.permissions.SUBSYSTEMS_LICENSEMGMT);
            },
            canSeeReportGeneration: function () {
                return this.canDo(this.permissions.SUBSYSTEMS_REPORTGENERATION);
            },
            // Templates
            canCreateTemplates: function () {
                return this.canDo(this.permissions.CREATE_TEMPLATES);
            },
            canReadTemplates: function () {
                return this.canDo(this.permissions.READ_TEMPLATES);
            },
            canUpdateTemplates: function () {
                return this.canDo(this.permissions.UPDATE_TEMPLATES);
            },
            canDeleteTemplates: function () {
                return this.canDo(this.permissions.DELETE_TEMPLATES);
            },
            // Advertisements
            canCreateAdvertisements: function () {
                return true;
                //return this.canDo(this.permissions.CREATE_ADVERTISEMENTS);
            },
            canReadAdvertisements: function () {
                return true;
                //return this.canDo(this.permissions.READ_ADVERTISEMENTS);
            },
            canUpdateAdvertisements: function () {
                return true;
                //return this.canDo(this.permissions.UPDATE_ADVERTISEMENTS);
            },
            canDeleteAdvertisements: function () {
                return true;
                //return this.canDo(this.permissions.DELETE_ADVERTISEMENTS);
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
                var UNKNOWN = 0, APPLICATION = 1, PEER = 3;

                var isPermitted = false;
                if (origAgentType === APPLICATION && (destAgentType === PEER || destAgentType === UNKNOWN)) {
                    isPermitted = this.canDo(this.permissions.SMSC_A2P_PEEK_TROUBLESHOOTING);
                } else if (origAgentType === PEER && destAgentType === APPLICATION) {
                    isPermitted = this.canDo(this.permissions.SMSC_P2A_PEEK_TROUBLESHOOTING);
                } else if (origAgentType === PEER && (destAgentType === PEER || destAgentType === UNKNOWN)) {
                    isPermitted = this.canDo(this.permissions.SMSC_P2P_PEEK_TROUBLESHOOTING);
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
            }
        };
    });

})();
