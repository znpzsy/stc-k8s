(function () {
    'use strict';

    /* Authorization Services */
    angular.module('Application.authorization-services', []);

    var ApplicationAuthorizationServices = angular.module('Application.authorization-services');

    ApplicationAuthorizationServices.factory('AuthorizationService', function ($q, $log, $rootScope, UtilService, CMPFService, Restangular, RESOURCE_NAME) {
        return {
            userRights: [],
            permissions: {
                // Generic
                ALL__DASHBOARD_READ: "Dashboards:Read", // DSP Related - Dashboards, common permission (ALL::Dashboard:Read)
                // Charging
                CHARGING_ALL_REFUND: "Charging:All:Refund", // DSP named this  ALL__CHARGING_REFUND --> ALL::Charging:Refund
                // Configuration
                READ_CONFIGURATION: "Configuration:All:Read",
                UPDATE_CONFIGURATION: "Configuration:All:Update",
                // Generic Operations
                CREATE_OPERATIONS: "Operations:All:Create",
                READ_OPERATIONS: "Operations:All:Read",
                UPDATE_OPERATIONS: "Operations:All:Update",
                DELETE_OPERATIONS: "Operations:All:Delete",
                // Antispam Operations
                CREATE_ANTISPAM_ADDRESSRANGE_OPERATIONS:  "Operations:AntiSpam:AddressRange:Create",
                READ_ANTISPAM_ADDRESSRANGE_OPERATIONS:    "Operations:AntiSpam:AddressRange:Read",
                UPDATE_ANTISPAM_ADDRESSRANGE_OPERATIONS:  "Operations:AntiSpam:AddressRange:Update",
                DELETE_ANTISPAM_ADDRESSRANGE_OPERATIONS:  "Operations:AntiSpam:AddressRange:Delete",

                CREATE_ANTISPAM_CONTENTFILTERS_OPERATIONS:"Operations:AntiSpam:ContentFilters:Create",
                READ_ANTISPAM_CONTENTFILTERS_OPERATIONS:  "Operations:AntiSpam:ContentFilters:Read",
                UPDATE_ANTISPAM_CONTENTFILTERS_OPERATIONS:"Operations:AntiSpam:ContentFilters:Update",
                DELETE_ANTISPAM_CONTENTFILTERS_OPERATIONS:"Operations:AntiSpam:ContentFilters:Delete",

                CREATE_ANTISPAM_COUNTERS_OPERATIONS:      "Operations:AntiSpam:Counters:Create",
                READ_ANTISPAM_COUNTERS_OPERATIONS:        "Operations:AntiSpam:Counters:Read",
                UPDATE_ANTISPAM_COUNTERS_OPERATIONS:      "Operations:AntiSpam:Counters:Update",
                DELETE_ANTISPAM_COUNTERS_OPERATIONS:      "Operations:AntiSpam:Counters:Delete",

                CREATE_ANTISPAM_CONTENTCOUNTER_OPERATIONS:"Operations:AntiSpam:ContentCounters:Create",
                READ_ANTISPAM_CONTENTCOUNTER_OPERATIONS:  "Operations:AntiSpam:ContentCounters:Read",
                UPDATE_ANTISPAM_CONTENTCOUNTER_OPERATIONS:"Operations:AntiSpam:ContentCounters:Update",
                DELETE_ANTISPAM_CONTENTCOUNTER_OPERATIONS:"Operations:AntiSpam:ContentCounters:Delete",

                CREATE_ANTISPAM_ANTISPAMLISTS_OPERATIONS: "Operations:AntiSpam:AntispamLists:Create",
                READ_ANTISPAM_ANTISPAMLISTS_OPERATIONS:   "Operations:AntiSpam:AntispamLists:Read",
                UPDATE_ANTISPAM_ANTISPAMLISTS_OPERATIONS: "Operations:AntiSpam:AntispamLists:Update",
                DELETE_ANTISPAM_ANTISPAMLISTS_OPERATIONS: "Operations:AntiSpam:AntispamLists:Delete",

                CREATE_ANTISPAM_BLACKLISTS_OPERATIONS:    "Operations:AntiSpam:BlackLists:Create",
                READ_ANTISPAM_BLACKLISTS_OPERATIONS:      "Operations:AntiSpam:BlackLists:Read",
                UPDATE_ANTISPAM_BLACKLISTS_OPERATIONS:    "Operations:AntiSpam:BlackLists:Update",
                DELETE_ANTISPAM_BLACKLISTS_OPERATIONS:    "Operations:AntiSpam:BlackLists:Delete",

                CREATE_ANTISPAM_GREYLISTS_OPERATIONS:     "Operations:AntiSpam:GreyLists:Create",
                READ_ANTISPAM_GREYLISTS_OPERATIONS:       "Operations:AntiSpam:GreyLists:Read",
                UPDATE_ANTISPAM_GREYLISTS_OPERATIONS:     "Operations:AntiSpam:GreyLists:Update",
                DELETE_ANTISPAM_GREYLISTS_OPERATIONS:     "Operations:AntiSpam:GreyLists:Delete",

                CREATE_ANTISPAM_SCREENINGLISTS_OPERATIONS:"Operations:AntiSpam:ScreeningLists:Create",
                READ_ANTISPAM_SCREENINGLISTS_OPERATIONS:  "Operations:AntiSpam:ScreeningLists:Read",
                UPDATE_ANTISPAM_SCREENINGLISTS_OPERATIONS:"Operations:AntiSpam:ScreeningLists:Update",
                DELETE_ANTISPAM_SCREENINGLISTS_OPERATIONS:"Operations:AntiSpam:ScreeningLists:Delete",

                CREATE_ANTISPAM_SCAMODIFIERS_OPERATIONS:  "Operations:AntiSpam:SCAModifiers:Create",
                READ_ANTISPAM_SCAMODIFIERS_OPERATIONS:    "Operations:AntiSpam:SCAModifiers:Read",
                UPDATE_ANTISPAM_SCAMODIFIERS_OPERATIONS:  "Operations:AntiSpam:SCAModifiers:Update",
                DELETE_ANTISPAM_SCAMODIFIERS_OPERATIONS:  "Operations:AntiSpam:SCAModifiers:Delete",

                CREATE_ANTISPAM_SMSMODIFICATION_OPERATIONS:"Operations:AntiSpam:SMSModification:Create",
                READ_ANTISPAM_SMSMODIFICATION_OPERATIONS:  "Operations:AntiSpam:SMSModification:Read",
                UPDATE_ANTISPAM_SMSMODIFICATION_OPERATIONS:"Operations:AntiSpam:SMSModification:Update",
                DELETE_ANTISPAM_SMSMODIFICATION_OPERATIONS:"Operations:AntiSpam:SMSModification:Delete",

                READ_ANTISPAM_SUSPICIOUSMESSAGES_OPERATIONS:  "Operations:AntiSpam:SuspiciousMessages:Read",

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
                PRODUCTS_USSI: "Products:USSI",
                PRODUCTS_SMSF: "Products:SMSF",
                // DSP Related Products
                ALL__PRODUCTS_APIM: "Products:APIM", // Changed naming convention to match with VCP (DSP format "All::Products:APIM")
                ALL__PRODUCTS_BMS: "Products:BMS",
                ALL__PRODUCTS_OIVR: "Products:OIVR",
                ALL__PRODUCTS_CHGW: "Products:CHGW",
                ALL__PRODUCTS_MSGW: "Products:MSGW",
                ALL__PRODUCTS_OTP: "Products:OTP",

                // Reports
                REPORTS_ONDEMAND_SMSC: "Reports:SMSC:OnDemand",
                REPORTS_ONDEMAND_ANTISPAM: "Reports:ANTISPAM:OnDemand",
                REPORTS_ONDEMAND_MMSC: "Reports:MMSC:OnDemand",
                REPORTS_ONDEMAND_USC: "Reports:USC:OnDemand",
                REPORTS_ONDEMAND_USSI: "Reports:USSI:OnDemand",
                REPORTS_ONDEMAND_SMSF: "Reports:SMSF:OnDemand",
                REPORTS_ONDEMAND_BMS: "Reports:BMS:OnDemand",
                REPORTS_ONDEMAND_OIVR: "Reports:OIVR:OnDemand",
                REPORTS_ONDEMAND_CHGW: "Reports:CHGW:OnDemand",
                REPORTS_ONDEMAND_MSGW: "Reports:MSGW:OnDemand",
                REPORTS_ONDEMAND_CC: "Reports:CC:OnDemand",
                REPORTS_ONDEMAND_CMB: "Reports:CMB:OnDemand",
                REPORTS_ONDEMAND_MCN: "Reports:MCN:OnDemand",
                REPORTS_ONDEMAND_VM: "Reports:VM:OnDemand",
                REPORTS_ONDEMAND_RBT: "Reports:RBT:OnDemand",
                REPORTS_ONDEMAND_VSMS: "Reports:VSMS:OnDemand",
                REPORTS_ONDEMAND_SSM: "Reports:SSM:OnDemand",
                // Scheduled Reports
                REPORTS_SCHEDULED_SMSC: "Reports:SMSC:Scheduled",
                REPORTS_SCHEDULED_ANTISPAM: "Reports:ANTISPAM:Scheduled",
                REPORTS_SCHEDULED_MMSC: "Reports:MMSC:Scheduled",
                REPORTS_SCHEDULED_USC: "Reports:USC:Scheduled",
                REPORTS_SCHEDULED_USSI: "Reports:USSI:Scheduled",
                REPORTS_SCHEDULED_SMSF: "Reports:SMSF:Scheduled",
                REPORTS_SCHEDULED_BMS: "Reports:BMS:Scheduled",
                REPORTS_SCHEDULED_OIVR: "Reports:OIVR:Scheduled",
                REPORTS_SCHEDULED_CHGW: "Reports:CHGW:Scheduled",
                REPORTS_SCHEDULED_MSGW: "Reports:MSGW:Scheduled",
                REPORTS_SCHEDULED_CC: "Reports:CC:Scheduled",
                REPORTS_SCHEDULED_CMB: "Reports:CMB:Scheduled",
                REPORTS_SCHEDULED_MCN: "Reports:MCN:Scheduled",
                REPORTS_SCHEDULED_VM: "Reports:VM:Scheduled",
                REPORTS_SCHEDULED_RBT: "Reports:RBT:Scheduled",
                REPORTS_SCHEDULED_VSMS: "Reports:VSMS:Scheduled",
                REPORTS_SCHEDULED_SSM: "Reports:SSM:Scheduled",

                // Screening Lists
                CREATE_SCREENING_LISTS: "ScreeningLists:All:Create",
                READ_SCREENING_LISTS: "ScreeningLists:All:Read",
                UPDATE_SCREENING_LISTS: "ScreeningLists:All:Update",
                DELETE_SCREENING_LISTS: "ScreeningLists:All:Delete",
                // Services
                SERVICES_CC: "Services:CC",
                SERVICES_CMB: "Services:CMB",
                SERVICES_MCN: "Services:MCN",
                SERVICES_VM: "Services:VM",
                SERVICES_RBT: "Services:RBT",
                SERVICES_VSMS: "Services:VSMS",
                // Subsystems
                SUBSYSTEMS_DIAGNOSTICS: "Subsystems:Diagnostics",
                SUBSYSTEMS_LICENSEMGMT: "Subsystems:LicenseMgmt",
                SUBSYSTEMS_PROVISIONING: "Subsystems:Provisioning",
                SUBSYSTEMS_REPORTGENERATION: "Subsystems:ReportGeneration",
                SUBSYSTEMS_SCREENINGMGMT: "Subsystems:ScreeningMgmt",
                SUBSYSTEMS_SUBSCRIPTIONMGMT: "Subsystems:SSM", // Added instead of ALL::Subsystems:SSM
                SUBSYSTEMS_CONTENTMGMT: "Subsystems:CMS", // Added instead of ALL::Subsystems:CMS
                SUBSYSTEMS_BUSINESSTMGMT: "Subsystems:BIZ", // Added instead of ALL::Subsystems:BIZ

                // Templates related permissions
                CREATE_TEMPLATES: "Templates:All:Create", // DSP format ALL__TEMPLATES_CREATE --> ALL::Templates:Create
                READ_TEMPLATES: "Templates:All:Read",
                UPDATE_TEMPLATES: "Templates:All:Update",
                DELETE_TEMPLATES: "Templates:All:Delete",
                // Advertisements related permissions (MCA Module Adverts tab - Not in scope for STC for now)
                // CREATE_ADVERTISEMENTS: "Advertisements:All:Create",
                // READ_ADVERTISEMENTS: "Advertisements:All:Read",
                // UPDATE_ADVERTISEMENTS: "Advertisements:All:Update",
                // DELETE_ADVERTISEMENTS: "Advertisements:All:Delete",
                // Troubleshooting
                READ_ALL_TROUBLESHOOTING: "Troubleshooting:All:Read", // ALL__TROUBLESHOOTING_READ: "ALL::Troubleshooting:Read",
                UPDATE_ALL_TROUBLESHOOTING: "Troubleshooting:All:Update", // ALL__TROUBLESHOOTING_UPDATE: "ALL::Troubleshooting:Update",
                DELETE_ALL_TROUBLESHOOTING: "Troubleshooting:All:Delete",
                // MSGGW Content View
                MSGGW_PEEK_TROUBLESHOOTING: "Troubleshooting:MSGGW:Peek",
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

                /* ---------------------------------------------------------------------- */
                /* ------------------ DSP Related Auth Objects - Start ------------------ */
                /* ---------------------------------------------------------------------- */

                // Bulk Messaging
                // Campaigns
                BMS__CAMPAIGNS_READ: "BMS::Campaigns:Read",
                // Monitoring
                BMS__MONITORING_READ: "BMS::Monitoring:Read",
                BMS__MONITORING_UPDATE: "BMS::Monitoring:Update",
                // Campaign
                BMS__OPERATIONS_CAMPAIGN_CREATE: "BMS::Operations:Campaign:Create",
                BMS__OPERATIONS_CAMPAIGN_READ: "BMS::Operations:Campaign:Read",
                BMS__OPERATIONS_CAMPAIGN_UPDATE: "BMS::Operations:Campaign:Update",
                BMS__OPERATIONS_CAMPAIGN_DELETE: "BMS::Operations:Campaign:Delete",
                // BlackList Global
                BMS__OPERATIONS_BLACKLIST_GLOBAL_CREATE: "BMS::Operations:BlackList:Global:Create",
                BMS__OPERATIONS_BLACKLIST_GLOBAL_READ: "BMS::Operations:BlackList:Global:Read",
                BMS__OPERATIONS_BLACKLIST_GLOBAL_UPDATE: "BMS::Operations:BlackList:Global:Update",
                BMS__OPERATIONS_BLACKLIST_GLOBAL_DELETE: "BMS::Operations:BlackList:Global:Delete",
                // BlackList PerOrganization
                BMS__OPERATIONS_BLACKLIST_PERORGANIZATION_CREATE: "BMS::Operations:BlackList:PerOrganization:Create",
                BMS__OPERATIONS_BLACKLIST_PERORGANIZATION_READ: "BMS::Operations:BlackList:PerOrganization:Read",
                BMS__OPERATIONS_BLACKLIST_PERORGANIZATION_UPDATE: "BMS::Operations:BlackList:PerOrganization:Update",
                BMS__OPERATIONS_BLACKLIST_PERORGANIZATION_DELETE: "BMS::Operations:BlackList:PerOrganization:Delete",
                // BlackList PerUserAccount
                BMS__OPERATIONS_BLACKLIST_PERUSERACCOUNT_CREATE: "BMS::Operations:BlackList:PerUserAccount:Create",
                BMS__OPERATIONS_BLACKLIST_PERUSERACCOUNT_READ: "BMS::Operations:BlackList:PerUserAccount:Read",
                BMS__OPERATIONS_BLACKLIST_PERUSERACCOUNT_UPDATE: "BMS::Operations:BlackList:PerUserAccount:Update",
                BMS__OPERATIONS_BLACKLIST_PERUSERACCOUNT_DELETE: "BMS::Operations:BlackList:PerUserAccount:Delete",
                // DistroList Global
                BMS__OPERATIONS_DISTROLIST_GLOBAL_CREATE: "BMS::Operations:DistroList:Global:Create",
                BMS__OPERATIONS_DISTROLIST_GLOBAL_READ: "BMS::Operations:DistroList:Global:Read",
                BMS__OPERATIONS_DISTROLIST_GLOBAL_UPDATE: "BMS::Operations:DistroList:Global:Update",
                BMS__OPERATIONS_DISTROLIST_GLOBAL_DELETE: "BMS::Operations:DistroList:Global:Delete",
                // DistroList PerOrganization
                BMS__OPERATIONS_DISTROLIST_PERORGANIZATION_CREATE: "BMS::Operations:DistroList:PerOrganization:Create",
                BMS__OPERATIONS_DISTROLIST_PERORGANIZATION_READ: "BMS::Operations:DistroList:PerOrganization:Read",
                BMS__OPERATIONS_DISTROLIST_PERORGANIZATION_UPDATE: "BMS::Operations:DistroList:PerOrganization:Update",
                BMS__OPERATIONS_DISTROLIST_PERORGANIZATION_DELETE: "BMS::Operations:DistroList:PerOrganization:Delete",
                // DistroList PerUserAccount
                BMS__OPERATIONS_DISTROLIST_PERUSERACCOUNT_CREATE: "BMS::Operations:DistroList:PerUserAccount:Create",
                BMS__OPERATIONS_DISTROLIST_PERUSERACCOUNT_READ: "BMS::Operations:DistroList:PerUserAccount:Read",
                BMS__OPERATIONS_DISTROLIST_PERUSERACCOUNT_UPDATE: "BMS::Operations:DistroList:PerUserAccount:Update",
                BMS__OPERATIONS_DISTROLIST_PERUSERACCOUNT_DELETE: "BMS::Operations:DistroList:PerUserAccount:Delete",
                // Business Process Management (workflows)
                BPM__OPERATIONS_TASK_ASSIGN: "BPM::Operations:Task:Assign",
                BPM__OPERATIONS_TASK_APPROVE: "BPM::Operations:Task:Approve",
                BPM__OPERATIONS_TASK_REJECT: "BPM::Operations:Task:Reject",
                BPM__OPERATIONS_TASK_CREATE: "BPM::Operations:Task:Create",
                BPM__OPERATIONS_TASK_READ: "BPM::Operations:Task:Read",
                BPM__OPERATIONS_TASK_DELETE: "BPM::Operations:Task:Delete",
                BPM__OPERATIONS_TASK_NOTIFY: "BPM::Operations:Task:Notify",

                // Content Management
                // CMS - Content Read
                CMS__OPERATIONS_CONTENT_READ: "CMS::Operations:Content:Read",
                // CMS - RBT Operations
                // CMS - RBT Category
                RBT__OPERATIONS_CATEGORY_CREATE: "RBT::Operations:Category:Create",
                RBT__OPERATIONS_CATEGORY_READ: "RBT::Operations:Category:Read",
                RBT__OPERATIONS_CATEGORY_UPDATE: "RBT::Operations:Category:Update",
                RBT__OPERATIONS_CATEGORY_DELETE: "RBT::Operations:Category:Delete",
                // CMS - RBT Subcategory
                RBT__OPERATIONS_SUBCATEGORY_CREATE: "RBT::Operations:Subcategory:Create",
                RBT__OPERATIONS_SUBCATEGORY_READ: "RBT::Operations:Subcategory:Read",
                RBT__OPERATIONS_SUBCATEGORY_UPDATE: "RBT::Operations:Subcategory:Update",
                RBT__OPERATIONS_SUBCATEGORY_DELETE: "RBT::Operations:Subcategory:Delete",
                // CMS - RBT Playlist
                RBT__OPERATIONS_PLAYLIST_CREATE: "RBT::Operations:Playlist:Create",
                RBT__OPERATIONS_PLAYLIST_READ: "RBT::Operations:Playlist:Read",
                RBT__OPERATIONS_PLAYLIST_UPDATE: "RBT::Operations:Playlist:Update",
                RBT__OPERATIONS_PLAYLIST_DELETE: "RBT::Operations:Playlist:Delete",
                // CMS - RBT Artist
                RBT__OPERATIONS_ARTIST_CREATE: "RBT::Operations:Artist:Create",
                RBT__OPERATIONS_ARTIST_READ: "RBT::Operations:Artist:Read",
                RBT__OPERATIONS_ARTIST_UPDATE: "RBT::Operations:Artist:Update",
                RBT__OPERATIONS_ARTIST_DELETE: "RBT::Operations:Artist:Delete",
                // CMS - RBT Tone
                RBT__OPERATIONS_TONE_CREATE: "RBT::Operations:Tone:Create",
                RBT__OPERATIONS_TONE_READ: "RBT::Operations:Tone:Read",
                RBT__OPERATIONS_TONE_UPDATE: "RBT::Operations:Tone:Update",
                RBT__OPERATIONS_TONE_DELETE: "RBT::Operations:Tone:Delete",
                // CMS - RBT Service
                RBT__OPERATIONS_SERVICE_CREATE: "RBT::Operations:Service:Create",
                RBT__OPERATIONS_SERVICE_READ: "RBT::Operations:Service:Read",
                RBT__OPERATIONS_SERVICE_UPDATE: "RBT::Operations:Service:Update",
                RBT__OPERATIONS_SERVICE_DELETE: "RBT::Operations:Service:Delete",
                // CMS - RBT Signature
                RBT__OPERATIONS_SIGNATURE_CREATE: "RBT::Operations:Signature:Create",
                RBT__OPERATIONS_SIGNATURE_READ: "RBT::Operations:Signature:Read",
                RBT__OPERATIONS_SIGNATURE_UPDATE: "RBT::Operations:Signature:Update",
                RBT__OPERATIONS_SIGNATURE_DELETE: "RBT::Operations:Signature:Delete",
                // CMS - RBT DIY
                RBT__OPERATIONS_DIY_CREATE: "RBT::Operations:Diy:Create",
                RBT__OPERATIONS_DIY_READ: "RBT::Operations:Diy:Read",
                RBT__OPERATIONS_DIY_UPDATE: "RBT::Operations:Diy:Update",
                RBT__OPERATIONS_DIY_DELETE: "RBT::Operations:Diy:Delete",

                // RBT Service - Tab Visibility, basic
                // RBT Service - Configuration Tab:
                RBT_SERVICE_CONFIGURATION_READ: "RBTService:Configuration:Read",
                RBT_SERVICE_CONFIGURATION_UPDATE: "RBTService:Configuration:Update",
                // RBT Service - Troubleshooting Tab:
                RBT_SERVICE_TROUBLESHOOTING_READ: "RBTService:Troubleshooting:Read",
                // RBT Service - Screening Lists - VIP Screening Option (VIP Permissions separated)
                RBT_SERVICE_VIP_SCREENINGLISTS_READ: "RBTService:ScreeningLists:VIP:Read",
                // RBT Service - HotCode
                RBT__OPERATIONS_HOTCODE_CREATE: "RBT::Operations:HotCode:Create",
                RBT__OPERATIONS_HOTCODE_UPDATE: "RBT::Operations:HotCode:Update",
                RBT__OPERATIONS_HOTCODE_DELETE: "RBT::Operations:HotCode:Delete",

                // RBT Service - Offer  HappyHour & BOGOF Campaigns
                RBT__CAMPAIGNS_READ : "RBT::Campaigns:Read",
                RBT__CAMPAIGNS_CREATE : "RBT::Campaigns:Create",
                RBT__CAMPAIGNS_UPDATE : "RBT::Campaigns:Update",
                RBT__CAMPAIGNS_DELETE : "RBT::Campaigns:Delete",
                // Subscription Management
                // Offer
                SSM__OPERATIONS_OFFER_CREATE: "SSM::Operations:Offer:Create",
                SSM__OPERATIONS_OFFER_READ: "SSM::Operations:Offer:Read",
                SSM__OPERATIONS_OFFER_UPDATE: "SSM::Operations:Offer:Update",
                SSM__OPERATIONS_OFFER_DELETE: "SSM::Operations:Offer:Delete",
                // Subscriber
                SSM__OPERATIONS_SUBSCRIBER_CREATE: "SSM::Operations:Subscriber:Create",
                SSM__OPERATIONS_SUBSCRIBER_READ: "SSM::Operations:Subscriber:Read",
                SSM__OPERATIONS_SUBSCRIBER_UPDATE: "SSM::Operations:Subscriber:Update",
                SSM__OPERATIONS_SUBSCRIBER_DELETE: "SSM::Operations:Subscriber:Delete",

                /* ---------------------------------------------------------------------- */
                /* ------------------ DSP Related Auth Objects - End -------------------- */
                /* ---------------------------------------------------------------------- */

                /* ------------------------------------------------------------------------ */
                /* ------------------ INTEGRATIONS  - Metamorfox - Start ------------------ */
                /* ------------------------------------------------------------------------ */
                // These are not defined in CMPF yet, Only for demo purposes
                MM_SIMOTA_ACCESS: "MM:Simota:Update",
                MM_DMC_ACCESS: "MM:DMC:Update",
                /* ------------------------------------------------------------------------ */
                /* ------------------ INTEGRATIONS  - Metamorfox - End -------------------- */
                /* ------------------------------------------------------------------------ */

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
            // Generic permissions
            canAllDashboardRead: function () {
                return this.canDo(this.permissions.ALL__DASHBOARD_READ); // DSP Related - Dashboards, common permission (ALL::Dashboard:Read)
            },
            // Charging
            canAllChargingRefund: function () {
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
            // Antispam Operations
            canReadAntispamOperations: function () {
                var canRead = this.canDo(this.permissions.READ_ANTISPAM_ADDRESSRANGE_OPERATIONS)
                    || this.canDo(this.permissions.READ_ANTISPAM_CONTENTFILTERS_OPERATIONS)
                    || this.canDo(this.permissions.READ_ANTISPAM_COUNTERS_OPERATIONS)
                    || this.canDo(this.permissions.READ_ANTISPAM_CONTENTCOUNTER_OPERATIONS)
                    || this.canDo(this.permissions.READ_ANTISPAM_ANTISPAMLISTS_OPERATIONS)
                    || this.canDo(this.permissions.READ_ANTISPAM_BLACKLISTS_OPERATIONS)
                    || this.canDo(this.permissions.READ_ANTISPAM_GREYLISTS_OPERATIONS)
                    || this.canDo(this.permissions.READ_ANTISPAM_SCREENINGLISTS_OPERATIONS)
                    || this.canDo(this.permissions.READ_ANTISPAM_SCAMODIFIERS_OPERATIONS)
                    || this.canDo(this.permissions.READ_ANTISPAM_SMSMODIFICATION_OPERATIONS)
                    || this.canDo(this.permissions.READ_ANTISPAM_SUSPICIOUSMESSAGES_OPERATIONS);

                return canRead;
            },
            // AS Address Ranges
            canAntispamAddressRangeCreate: function () { return this.canDo(this.permissions.CREATE_ANTISPAM_ADDRESSRANGE_OPERATIONS); },
            canAntispamAddressRangeRead: function () { return this.canDo(this.permissions.READ_ANTISPAM_ADDRESSRANGE_OPERATIONS); },
            canAntispamAddressRangeUpdate: function () { return this.canDo(this.permissions.UPDATE_ANTISPAM_ADDRESSRANGE_OPERATIONS); },
            canAntispamAddressRangeDelete: function () { return this.canDo(this.permissions.DELETE_ANTISPAM_ADDRESSRANGE_OPERATIONS); },
            // AS Content Filters
            canAntispamContentFiltersCreate: function () { return this.canDo(this.permissions.CREATE_ANTISPAM_CONTENTFILTERS_OPERATIONS); },
            canAntispamContentFiltersRead: function () { return this.canDo(this.permissions.READ_ANTISPAM_CONTENTFILTERS_OPERATIONS); },
            canAntispamContentFiltersUpdate: function () { return this.canDo(this.permissions.UPDATE_ANTISPAM_CONTENTFILTERS_OPERATIONS); },
            canAntispamContentFiltersDelete: function () { return this.canDo(this.permissions.DELETE_ANTISPAM_CONTENTFILTERS_OPERATIONS); },
            // AS Counters
            canAntispamCountersCreate: function () { return this.canDo(this.permissions.CREATE_ANTISPAM_COUNTERS_OPERATIONS); },
            canAntispamCountersRead: function () { return this.canDo(this.permissions.READ_ANTISPAM_COUNTERS_OPERATIONS); },
            canAntispamCountersUpdate: function () { return this.canDo(this.permissions.UPDATE_ANTISPAM_COUNTERS_OPERATIONS); },
            canAntispamCountersDelete: function () { return this.canDo(this.permissions.DELETE_ANTISPAM_COUNTERS_OPERATIONS); },
            // SIM-Farm Control
            canAntispamContentCountersCreate: function () { return this.canDo(this.permissions.CREATE_ANTISPAM_CONTENTCOUNTER_OPERATIONS); },
            canAntispamContentCountersRead: function (){ return this.canDo(this.permissions.READ_ANTISPAM_CONTENTCOUNTER_OPERATIONS); },
            canAntispamContentCountersUpdate: function () { return this.canDo(this.permissions.UPDATE_ANTISPAM_CONTENTCOUNTER_OPERATIONS); },
            canAntispamContentCountersDelete: function () { return this.canDo(this.permissions.DELETE_ANTISPAM_CONTENTCOUNTER_OPERATIONS); },
            // Antispam Lists
            canAntispamListsCreate: function () { return this.canDo(this.permissions.CREATE_ANTISPAM_ANTISPAMLISTS_OPERATIONS); },
            canAntispamListsRead: function (){ return this.canDo(this.permissions.READ_ANTISPAM_ANTISPAMLISTS_OPERATIONS); },
            canAntispamListsUpdate: function () { return this.canDo(this.permissions.UPDATE_ANTISPAM_ANTISPAMLISTS_OPERATIONS); },
            canAntispamListsDelete: function () { return this.canDo(this.permissions.DELETE_ANTISPAM_ANTISPAMLISTS_OPERATIONS); },
            // Blacklists
            canAntispamBlackListsCreate: function () { return this.canDo(this.permissions.CREATE_ANTISPAM_BLACKLISTS_OPERATIONS); },
            canAntispamBlackListsRead: function () { return this.canDo(this.permissions.READ_ANTISPAM_BLACKLISTS_OPERATIONS); },
            canAntispamBlackListsUpdate: function () { return this.canDo(this.permissions.UPDATE_ANTISPAM_BLACKLISTS_OPERATIONS); },
            canAntispamBlackListsDelete: function () { return this.canDo(this.permissions.DELETE_ANTISPAM_BLACKLISTS_OPERATIONS); },
            // Grey Lists
            canAntispamGreyListsCreate: function () { return this.canDo(this.permissions.CREATE_ANTISPAM_GREYLISTS_OPERATIONS); },
            canAntispamGreyListsRead: function (){ return this.canDo(this.permissions.READ_ANTISPAM_GREYLISTS_OPERATIONS); },
            canAntispamGreyListsUpdate: function () { return this.canDo(this.permissions.UPDATE_ANTISPAM_GREYLISTS_OPERATIONS); },
            canAntispamGreyListsDelete: function () { return this.canDo(this.permissions.DELETE_ANTISPAM_GREYLISTS_OPERATIONS); },
            // Screening Lists
            canAntispamScreeningListsCreate: function () { return this.canDo(this.permissions.CREATE_ANTISPAM_SCREENINGLISTS_OPERATIONS); },
            canAntispamScreeningListsRead: function (){ return this.canDo(this.permissions.READ_ANTISPAM_SCREENINGLISTS_OPERATIONS); },
            canAntispamScreeningListsUpdate: function () { return this.canDo(this.permissions.UPDATE_ANTISPAM_SCREENINGLISTS_OPERATIONS); },
            canAntispamScreeningListsDelete: function () { return this.canDo(this.permissions.DELETE_ANTISPAM_SCREENINGLISTS_OPERATIONS); },
            // SCA Modifiers
            canAntispamSCAModifiersCreate: function () { return this.canDo(this.permissions.CREATE_ANTISPAM_SCAMODIFIERS_OPERATIONS); },
            canAntispamSCAModifiersRead: function (){ return this.canDo(this.permissions.READ_ANTISPAM_SCAMODIFIERS_OPERATIONS); },
            canAntispamSCAModifiersUpdate: function () { return this.canDo(this.permissions.UPDATE_ANTISPAM_SCAMODIFIERS_OPERATIONS); },
            canAntispamSCAModifiersDelete: function () { return this.canDo(this.permissions.DELETE_ANTISPAM_SCAMODIFIERS_OPERATIONS); },
            // SMS Modification
            canAntispamSMSModificationCreate: function () { return this.canDo(this.permissions.CREATE_ANTISPAM_SMSMODIFICATION_OPERATIONS); },
            canAntispamSMSModificationRead: function (){ return this.canDo(this.permissions.READ_ANTISPAM_SMSMODIFICATION_OPERATIONS); },
            canAntispamSMSModificationUpdate: function () { return this.canDo(this.permissions.UPDATE_ANTISPAM_SMSMODIFICATION_OPERATIONS); },
            canAntispamSMSModificationDelete: function () { return this.canDo(this.permissions.DELETE_ANTISPAM_SMSMODIFICATION_OPERATIONS); },
            // Suspicious Messages
            canAntispamSuspiciousMessagesRead: function () { return this.canDo(this.permissions.READ_ANTISPAM_SUSPICIOUSMESSAGES_OPERATIONS); },
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
            // Build "Reports:<viewKey>:<Section>" (e.g. "Reports:SMSC:OnDemand")
            _reportPerm: function (viewKey, section) {
                return 'Reports:' + viewKey + ':' + section;
            },
            // Specific viewKey checks
            viewAllowedFor: function (viewKey) {
                return (this.canReportOnDemandFor(viewKey) || this.canReportScheduledFor(viewKey));
            },
            viewsAllowedFor: function (viewKeys) {
                var self = this;
                var  _allReportViewKeys = ['SMSC','ANTISPAM', 'MMSC', 'USC', 'USSI', 'SMSF', 'BMS', 'OIVR', 'CHGW', 'MSGW', 'CC', 'MCN', 'CMB', 'VM', 'VSMS', 'RBT','SSM'];
                if (viewKeys === 'ALL'){
                    return _.filter(_allReportViewKeys , function (vk) { return self.viewAllowedFor(vk); });
                }
                return _.filter(viewKeys || [], function (vk) { return self.viewAllowedFor(vk); });
            },
            anyViewsAllowedFor: function (viewKeys) {
                var self = this;
                var allowedList = this.viewsAllowedFor(viewKeys);
                return allowedList.length > 0;
            },
            _checkReportsRights: function (section) {
                var userRights = this.getUserRights();
                var scheduleRights = _.filter(userRights, function (right) {
                    return right.indexOf('Reports:') === 0 && right.indexOf(section) !== -1;
                });

                var viewKeys = _.map(scheduleRights, function(right) {
                    var parts = right.split(':');
                    return parts.length >= 2 ? parts[1] : null; // parts[1] is the viewKey
                });

                // Unique viewKeys (no null/undefined)
                return _.compact(_.uniq(viewKeys));
            },
            _getSchedules: function () {
                return this._checkReportsRights('Scheduled');
            },
            _getOnDemand: function () {
                return this._checkReportsRights('OnDemand');
            },
            // Memoized list of allowed reports
            getReportsScheduled: _.memoize(function () {
                return this._getSchedules();
            }),
            getReportsOnDemand: _.memoize(function () {
                return this._getOnDemand();
            }),
            canReportScheduled: function () {
                var allowedSchedules = this.getReportsScheduled();
                return allowedSchedules.length > 0;
            },
            canReportOnDemand: function () {
                var allowedOnDemand = this.getReportsOnDemand();
                return allowedOnDemand.length > 0;
            },
            canReportOnDemandFor: function (viewKey) {
                return this.canDo(this._reportPerm(viewKey, 'OnDemand'));
            },
            canReportScheduledFor: function (viewKey) {
                return this.canDo(this._reportPerm(viewKey, 'Scheduled'));
            },

            // Screening Lists
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
            canSeeCMB: function () {
                return this.canDo(this.permissions.SERVICES_CMB);
            },
            canSeeVM: function () {
                return this.canDo(this.permissions.SERVICES_VM);
            },
            canSeeRBT: function () {
                return this.canDo(this.permissions.SERVICES_RBT);
            },
            canSeeVSMS: function () {
                return this.canDo(this.permissions.SERVICES_VSMS);
            },
            // Subsystems
            canSeeBusinessMgmt: function () {
                return this.canDo(this.permissions.SUBSYSTEMS_BUSINESSTMGMT);
            },
            canSeeProvisioning: function () {
                return this.canDo(this.permissions.SUBSYSTEMS_PROVISIONING);
            },
            canSeeScreeningMgmt: function () {
                return this.canDo(this.permissions.SUBSYSTEMS_SCREENINGMGMT);
            },
            canSeeSubscriptionMgmt: function () {
                return this.canDo(this.permissions.SUBSYSTEMS_SUBSCRIPTIONMGMT);
            },
            canSeeContentMgmt: function () {
                return this.canDo(this.permissions.SUBSYSTEMS_CONTENTMGMT);
            },
            canSeeDiagnostics: function () {
                return this.canDo(this.permissions.SUBSYSTEMS_DIAGNOSTICS);
            },
            canSeeLicenseMgmt: function () {
                return this.canDo(this.permissions.SUBSYSTEMS_LICENSEMGMT);
            },
            canSeeReportGeneration: function () {
                return this.canDo(this.permissions.SUBSYSTEMS_REPORTGENERATION) && this.anyViewsAllowedFor('ALL');
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
            // Advertisements (MCA Module - Not in scope for STC for now)
            // canCreateAdvertisements: function () {
            //     return true;
            //     //return this.canDo(this.permissions.CREATE_ADVERTISEMENTS);
            // },
            // canReadAdvertisements: function () {
            //     return true;
            //     //return this.canDo(this.permissions.READ_ADVERTISEMENTS);
            // },
            // canUpdateAdvertisements: function () {
            //     return true;
            //     //return this.canDo(this.permissions.UPDATE_ADVERTISEMENTS);
            // },
            // canDeleteAdvertisements: function () {
            //     return true;
            //     //return this.canDo(this.permissions.DELETE_ADVERTISEMENTS);
            // },
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
            // MSGGW Content View
            canPeekMSGGWTroubleshooting: function (origAgentType, destAgentType) {
                var APPLICATION = 1, PEER = 8;

                var isPermitted = false;
                if (Number(origAgentType) === APPLICATION) {
                    isPermitted = this.canDo(this.permissions.MSGGW_PEEK_TROUBLESHOOTING);
                } else if (Number(destAgentType) === APPLICATION) {
                    isPermitted = this.canDo(this.permissions.MSGGW_PEEK_TROUBLESHOOTING);
                }

                return isPermitted;
            },

            /* ******************************************************************* */
            /* ******************* DSP  Related Checks / Start ******************* */
            /* ******************************************************************* */

            // Products     
            canSeeApiManager: function () {
                return this.canDo(this.permissions.ALL__PRODUCTS_APIM);
            },
            canSeeBMS: function () {
                return this.canDo(this.permissions.ALL__PRODUCTS_BMS);
            },
            canSeeOIVR: function () {
                return this.canDo(this.permissions.ALL__PRODUCTS_OIVR);
            },
            canSeeCHGGW: function () {
                return this.canDo(this.permissions.ALL__PRODUCTS_CHGW);
            },
            canSeeOTPServer: function () {
                return this.canDo(this.permissions.ALL__PRODUCTS_OTP);
            },
            canSeeMSGGW: function () {
                return this.canDo(this.permissions.ALL__PRODUCTS_MSGW);
            },
            // Content Management

            // ContentCategory
            canCmsOperationsContentRead: function () {
                return this.canDo(this.permissions.CMS__OPERATIONS_CONTENT_READ);
            },

            // RBT Operations

            // Category
            canRBTOperationsCategoryCreate: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_CATEGORY_CREATE);
            },
            canRBTOperationsCategoryRead: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_CATEGORY_READ);
            },
            canRBTOperationsCategoryUpdate: function (state, accessChannel) {
                // Block access outright if channel is specified as IVR.
                // For IVR Categories, only the associated tones list will be editable, no other properties should be changeable.
                if (accessChannel === 'IVR') {
                    return false;
                }

                if ($rootScope.isAdminUser) {
                    return this.canDo(this.permissions.RBT__OPERATIONS_CATEGORY_UPDATE);
                } else {
                    return state !== 'INACTIVE' && this.canDo(this.permissions.RBT__OPERATIONS_CATEGORY_UPDATE);
                }
            },
            canRBTOperationsCategoryDelete: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_CATEGORY_DELETE);
            },
            // Subcategory
            canRBTOperationsSubcategoryCreate: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_SUBCATEGORY_CREATE);
            },
            canRBTOperationsSubcategoryRead: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_SUBCATEGORY_READ);
            },
            canRBTOperationsSubcategoryUpdate: function (state, accessChannel) {
                // Block access outright if channel is specified as IVR.
                // For IVR Categories, only the associated tones list will be editable, no other properties should be changeable.
                if (accessChannel === 'IVR') {
                    return false;
                }

                // Admin users bypass state check
                if ($rootScope.isAdminUser) {
                    return this.canDo(this.permissions.RBT__OPERATIONS_SUBCATEGORY_UPDATE);
                } else {
                    return state !== 'INACTIVE' && this.canDo(this.permissions.RBT__OPERATIONS_SUBCATEGORY_UPDATE);
                }
            },

            canRBTOperationsSubcategoryDelete: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_SUBCATEGORY_DELETE);
            },
            // Playlist
            canRBTOperationsPlaylistCreate: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_PLAYLIST_CREATE);
            },
            canRBTOperationsPlaylistRead: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_PLAYLIST_READ);
            },
            canRBTOperationsPlaylistUpdate: function (state) {
                return state !== 'INACTIVE' && this.canDo(this.permissions.RBT__OPERATIONS_PLAYLIST_UPDATE);
            },
            canRBTOperationsPlaylistDelete: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_PLAYLIST_DELETE);
            },
            // Artist
            canRBTOperationsArtistCreate: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_ARTIST_CREATE);
            },
            canRBTOperationsArtistRead: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_ARTIST_READ);
            },
            canRBTOperationsArtistUpdate: function (state) {
                return state !== 'INACTIVE' && this.canDo(this.permissions.RBT__OPERATIONS_ARTIST_UPDATE);
                /*if ($rootScope.isAdminUser) {
                    return this.canDo(this.permissions.RBT__OPERATIONS_ARTIST_UPDATE);
                } else {
                    return state !== 'PENDING' && this.canDo(this.permissions.RBT__OPERATIONS_ARTIST_UPDATE);
                }*/
            },
            canRBTOperationsArtistDelete: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_ARTIST_DELETE);
            },
            // Tone
            canRBTOperationsToneCreate: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_TONE_CREATE);
            },
            canRBTOperationsToneRead: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_TONE_READ);
            },
            canRBTOperationsToneUpdate: function (state) {

                return state !== 'INACTIVE' && this.canDo(this.permissions.RBT__OPERATIONS_TONE_UPDATE);
                // if ($rootScope.isAdminUser) {
                //     return this.canDo(this.permissions.RBT__OPERATIONS_TONE_UPDATE);
                // } else {
                //     return state !== 'PENDING' && this.canDo(this.permissions.RBT__OPERATIONS_TONE_UPDATE);
                // }
            },
            canRBTOperationsToneDelete: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_TONE_DELETE);
            },
            // Service ** RBT Service
            canRBTOperationsServiceCreate: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_SERVICE_CREATE);
            },
            canRBTOperationsServiceRead: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_SERVICE_READ);
            },
            canRBTOperationsServiceUpdate: function (state) {
                return this.canDo(this.permissions.RBT__OPERATIONS_SERVICE_UPDATE);
            },
            canRBTOperationsServiceDelete: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_SERVICE_DELETE);
            },
            // Signature
            canRBTOperationsSignatureCreate: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_SIGNATURE_CREATE);
            },
            canRBTOperationsSignatureRead: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_SIGNATURE_READ);
            },
            canRBTOperationsSignatureUpdate: function (type) {
                return type !== 'prayer' && this.canDo(this.permissions.RBT__OPERATIONS_SIGNATURE_UPDATE);
            },
            canRBTOperationsSignatureDelete: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_SIGNATURE_DELETE);
            },
            // DIY
            canRBTOperationsDiyCreate: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_DIY_CREATE);
            },
            canRBTOperationsDiyRead: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_DIY_READ);
            },
            canRBTOperationsDiyUpdate: function (state) {
                return this.canDo(this.permissions.RBT__OPERATIONS_DIY_UPDATE);
            },
            canRBTOperationsDiyDelete: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_DIY_DELETE);
            },
            // RBT Service Related - Tab Visibility
            canRBTServiceConfigurationRead: function () {
                return this.canDo(this.permissions.RBT_SERVICE_CONFIGURATION_READ);
            },
            canRBTServiceConfigurationUpdate: function () {
                return this.canDo(this.permissions.RBT_SERVICE_CONFIGURATION_UPDATE);
            },
            canRBTServiceTroubleshootingRead: function () {
                return this.canDo(this.permissions.RBT_SERVICE_TROUBLESHOOTING_READ);
            },
            canRBTServiceVipScreeningListRead: function () {
                return this.canDo(this.permissions.RBT_SERVICE_VIP_SCREENINGLISTS_READ);
            },
            // HotCodes
            canRBTOperationsHotCodeCreate: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_HOTCODE_CREATE);
            },
            canRBTOperationsHotCodeUpdate: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_HOTCODE_UPDATE);
            },
            canRBTOperationsHotCodeDelete: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_HOTCODE_DELETE);
            },

            // OfferCampiagns
            canRBTCampaignsCreate: function () {
                return this.canDo(this.permissions.RBT__CAMPAIGNS_CREATE);
            },
            canRBTCampaignsRead: function () {
                return this.canDo(this.permissions.RBT__CAMPAIGNS_READ);
            },
            canRBTCampaignsUpdate: function () {
                return this.canDo(this.permissions.RBT__CAMPAIGNS_UPDATE);
            },
            canRBTCampaignsDelete: function () {
                return this.canDo(this.permissions.RBT__CAMPAIGNS_DELETE);
            },

            // Business Process Management (workflows)
            canBpmOperationsTaskAssign: function () {
                return this.canDo(this.permissions.BPM__OPERATIONS_TASK_ASSIGN);
            },
            canBpmOperationsTaskApprove: function () {
                return this.canDo(this.permissions.BPM__OPERATIONS_TASK_APPROVE);
            },
            canBpmOperationsTaskReject: function () {
                return this.canDo(this.permissions.BPM__OPERATIONS_TASK_REJECT);
            },
            canBpmOperationsTaskCreate: function () {
                return this.canDo(this.permissions.BPM__OPERATIONS_TASK_CREATE);
            },
            canBpmOperationsTaskRead: function () {
                return this.canDo(this.permissions.BPM__OPERATIONS_TASK_READ);
            },
            canBpmOperationsTaskDelete: function () {
                return this.canDo(this.permissions.BPM__OPERATIONS_TASK_DELETE);
            },
            canBpmOperationsTaskNotify: function () {
                return this.canDo(this.permissions.BPM__OPERATIONS_TASK_NOTIFY);
            },

            // Subscription Management
            // Offer
            canSsmOperationsOfferCreate: function () {
                return this.canDo(this.permissions.SSM__OPERATIONS_OFFER_CREATE);
            },
            canSsmOperationsOfferRead: function () {
                return this.canDo(this.permissions.SSM__OPERATIONS_OFFER_READ);
            },
            canSsmOperationsOfferUpdate: function (state) {
                if ($rootScope.isAdminUser) {
                    return this.canDo(this.permissions.SSM__OPERATIONS_OFFER_UPDATE);
                } else {
                    return state !== 'PENDING' && this.canDo(this.permissions.SSM__OPERATIONS_OFFER_UPDATE);
                }
            },
            canSsmOperationsOfferDelete: function () {
                return this.canDo(this.permissions.SSM__OPERATIONS_OFFER_DELETE);
            },
            // Subscriber
            canSsmOperationsSubscriberCreate: function () {
                return this.canDo(this.permissions.SSM__OPERATIONS_SUBSCRIBER_CREATE);
            },
            canSsmOperationsSubscriberRead: function () {
                return this.canDo(this.permissions.SSM__OPERATIONS_SUBSCRIBER_READ);
            },
            canSsmOperationsSubscriberUpdate: function () {
                return this.canDo(this.permissions.SSM__OPERATIONS_SUBSCRIBER_UPDATE);
            },
            canSsmOperationsSubscriberDelete: function () {
                return this.canDo(this.permissions.SSM__OPERATIONS_SUBSCRIBER_DELETE);
            },

            // Bulk Messaging
            // Campaigns
            canBmsCampaignsRead: function () {
                return this.canDo(this.permissions.BMS__CAMPAIGNS_READ);
            },
            // Monitoring
            canBmsMonitoringRead: function () {
                return this.canDo(this.permissions.BMS__MONITORING_READ);
            },
            canBmsMonitoringUpdate: function () {
                return this.canDo(this.permissions.BMS__MONITORING_UPDATE);
            },
            // Campaign
            canBmsOperationsCampaignCreate: function () {
                return this.canDo(this.permissions.BMS__OPERATIONS_CAMPAIGN_CREATE);
            },
            canBmsOperationsCampaignRead: function () {
                return this.canDo(this.permissions.BMS__OPERATIONS_CAMPAIGN_READ);
            },
            canBmsOperationsCampaignUpdate: function () {
                return this.canDo(this.permissions.BMS__OPERATIONS_CAMPAIGN_UPDATE);
            },
            canBmsOperationsCampaignDelete: function () {
                return this.canDo(this.permissions.BMS__OPERATIONS_CAMPAIGN_DELETE);
            },
            // BlackList
            canBmsOperationsBlackListCreate: function (distListType) {
                var permission = this.permissions.BMS__OPERATIONS_BLACKLIST_GLOBAL_CREATE;
                if (distListType === 'ORGANIZATION') {
                    permission = this.permissions.BMS__OPERATIONS_BLACKLIST_PERORGANIZATION_CREATE;
                }
                if (distListType === 'USER') {
                    permission = this.permissions.BMS__OPERATIONS_BLACKLIST_PERUSERACCOUNT_CREATE;
                }

                return this.canDo(permission);
            },
            canBmsOperationsBlackListRead: function (distListType) {
                var permission = this.permissions.BMS__OPERATIONS_BLACKLIST_GLOBAL_READ;
                if (distListType === 'ORGANIZATION') {
                    permission = this.permissions.BMS__OPERATIONS_BLACKLIST_PERORGANIZATION_READ;
                } else if (distListType === 'USER') {
                    permission = this.permissions.BMS__OPERATIONS_BLACKLIST_PERUSERACCOUNT_READ;
                }

                return this.canDo(permission);
            },
            canBmsOperationsBlackListUpdate: function (distListType) {
                var permission = this.permissions.BMS__OPERATIONS_BLACKLIST_GLOBAL_UPDATE;
                if (distListType === 'ORGANIZATION') {
                    permission = this.permissions.BMS__OPERATIONS_BLACKLIST_PERORGANIZATION_UPDATE;
                } else if (distListType === 'USER') {
                    permission = this.permissions.BMS__OPERATIONS_BLACKLIST_PERUSERACCOUNT_UPDATE;
                }

                return this.canDo(permission);
            },
            canBmsOperationsBlackListDelete: function (distListType) {
                var permission = this.permissions.BMS__OPERATIONS_BLACKLIST_GLOBAL_DELETE;
                if (distListType === 'ORGANIZATION') {
                    permission = this.permissions.BMS__OPERATIONS_BLACKLIST_PERORGANIZATION_DELETE;
                } else if (distListType === 'USER') {
                    permission = this.permissions.BMS__OPERATIONS_BLACKLIST_PERUSERACCOUNT_DELETE;
                }

                return this.canDo(permission);
            },
            // DistroList
            canBmsOperationsDistroListCreate: function (distListType) {
                var permission = this.permissions.BMS__OPERATIONS_DISTROLIST_GLOBAL_CREATE;
                if (distListType === 'ORGANIZATION') {
                    permission = this.permissions.BMS__OPERATIONS_DISTROLIST_PERORGANIZATION_CREATE;
                }
                if (distListType === 'USER') {
                    permission = this.permissions.BMS__OPERATIONS_DISTROLIST_PERUSERACCOUNT_CREATE;
                }

                return this.canDo(permission);
            },
            canBmsOperationsDistroListRead: function (distListType) {
                var permission = this.permissions.BMS__OPERATIONS_DISTROLIST_GLOBAL_READ;
                if (distListType === 'ORGANIZATION') {
                    permission = this.permissions.BMS__OPERATIONS_DISTROLIST_PERORGANIZATION_READ;
                } else if (distListType === 'USER') {
                    permission = this.permissions.BMS__OPERATIONS_DISTROLIST_PERUSERACCOUNT_READ;
                }

                return this.canDo(permission);
            },
            canBmsOperationsDistroListUpdate: function (distListType) {
                var permission = this.permissions.BMS__OPERATIONS_DISTROLIST_GLOBAL_UPDATE;
                if (distListType === 'ORGANIZATION') {
                    permission = this.permissions.BMS__OPERATIONS_DISTROLIST_PERORGANIZATION_UPDATE;
                } else if (distListType === 'USER') {
                    permission = this.permissions.BMS__OPERATIONS_DISTROLIST_PERUSERACCOUNT_UPDATE;
                }

                return this.canDo(permission);
            },
            canBmsOperationsDistroListDelete: function (distListType) {
                var permission = this.permissions.BMS__OPERATIONS_DISTROLIST_GLOBAL_DELETE;
                if (distListType === 'ORGANIZATION') {
                    permission = this.permissions.BMS__OPERATIONS_DISTROLIST_PERORGANIZATION_DELETE;
                } else if (distListType === 'USER') {
                    permission = this.permissions.BMS__OPERATIONS_DISTROLIST_PERUSERACCOUNT_DELETE;
                }

                return this.canDo(permission);
            },

            /* ******************************************************************* */
            /* ******************* DSP  Related Checks / End ********************* */
            /* ******************************************************************* */



            /* ***************************************************************************************** */
            /* ******************* 3rd Party App (Metamorfoz) Related Checks / Start ******************* */
            /* ***************************************************************************************** */
            getMMRoleId: function (applicationName) {
                if(applicationName == 'SIMOTA') {
                    return UtilService.getFromSessionStore(UtilService.USER_MM_SIMOTA_ID_KEY);
                } else if(applicationName == 'DMC') {
                    return UtilService.getFromSessionStore(UtilService.USER_MM_DMC_ID_KEY);
                }
                return 0;
            },
            // Viewing Rights
            canMMSimotaAccess: function () {
                return this.canDo(this.permissions.MM_SIMOTA_ACCESS);
            },
            canMMDMCAccess: function () {
                return this.canDo(this.permissions.MM_DMC_ACCESS);
            },
            canRedirect: _.memoize(function(applicationName) {
                return Number(this.getMMRoleId(applicationName)) > 0;
            }),
            clearCachedRedirect: function () {
                this.canRedirect.cache = {};
            },
            openMMApp: function(mmApp) {
                window.open(UtilService.getRedirectUrl(mmApp), "_blank");
            }
            /* ***************************************************************************************** */
            /* ******************* 3rd Party App (Metamorfoz) Related Checks / End ********************* */
            /* ***************************************************************************************** */

        };
    });

})();
