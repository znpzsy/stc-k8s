(function () {
    'use strict';

    /* Authorization Services */
    angular.module('Application.authorization-services', []);

    var ApplicationAuthorizationServices = angular.module('Application.authorization-services');

    ApplicationAuthorizationServices.factory('AuthorizationService', function ($rootScope, $q, $log, UtilService, CMPFService, RESOURCE_NAME) {
        return {
            userRights: [],
            permissions: {
                // Generic permissions
                ALL__DASHBOARD_READ: "ALL::Dashboard:Read",
                // Charging
                ALL__CHARGING_DEBIT: "ALL::Charging:Debit",
                ALL__CHARGING_REFUND: "ALL::Charging:Refund",
                // Configuration
                ALL__CONFIGURATION_CREATE: "ALL::Configuration:Create",
                ALL__CONFIGURATION_READ: "ALL::Configuration:Read",
                ALL__CONFIGURATION_UPDATE: "ALL::Configuration:Update",
                ALL__CONFIGURATION_DELETE: "ALL::Configuration:Delete",
                // Diagnostics
                ALL__DIAGNOSTICS_ALARMLOGS: "ALL::Diagnostics:AlarmLogs",
                ALL__DIAGNOSTICS_AUDITLOGS: "ALL::Diagnostics:AuditLogs",
                // Reports
                ALL__REPORTS_ONDEMAND_READ: "ALL::Reports:OnDemand:Read",
                ALL__REPORTS_SCHEDULED_CREATE: "ALL::Reports:Scheduled:Create",
                ALL__REPORTS_SCHEDULED_READ: "ALL::Reports:Scheduled:Read",
                ALL__REPORTS_SCHEDULED_UPDATE: "ALL::Reports:Scheduled:Update",
                ALL__REPORTS_SCHEDULED_DELETE: "ALL::Reports:Scheduled:Delete",
                // Financial Reports
                ALL__FINANCIALREPORTS_ONDEMAND_READ: "ALL::FinancialReports:OnDemand:Read",
                // Templates
                ALL__TEMPLATES_CREATE: "ALL::Templates:Create",
                ALL__TEMPLATES_READ: "ALL::Templates:Read",
                ALL__TEMPLATES_UPDATE: "ALL::Templates:Update",
                ALL__TEMPLATES_DELETE: "ALL::Templates:Delete",
                // Troubleshooting
                ALL__TROUBLESHOOTING_READ: "ALL::Troubleshooting:Read",
                ALL__TROUBLESHOOTING_UPDATE: "ALL::Troubleshooting:Update",
                ALL__TROUBLESHOOTING_PEEK: "ALL::Troubleshooting:Peek",

                // Products
                ALL__PRODUCTS_APIM: "ALL::Products:APIM",
                ALL__PRODUCTS_BMS: "ALL::Products:BMS",
                ALL__PRODUCTS_CHGW: "ALL::Products:CHGW",
                ALL__PRODUCTS_DCB: "ALL::Products:DCB",
                ALL__PRODUCTS_MSGW: "ALL::Products:MSGW",
                ALL__PRODUCTS_OTP: "ALL::Products:OTP",

                // Subsystems
                ALL__SUBSYSTEMS_BIZ: "ALL::Subsystems:BIZ",
                ALL__SUBSYSTEMS_CMPF: "ALL::Subsystems:CMPF",
                ALL__SUBSYSTEMS_DIAG: "ALL::Subsystems:DIAG",
                ALL__SUBSYSTEMS_REP: "ALL::Subsystems:REP",
                ALL__SUBSYSTEMS_SCRM: "ALL::Subsystems:SCRM",
                ALL__SUBSYSTEMS_SSM: "ALL::Subsystems:SSM",
                ALL__SUBSYSTEMS_CMS: "ALL::Subsystems:CMS",

                // Provisioning and subscription management operations
                // Agreement
                BIZ__OPERATIONS_AGREEMENT_CREATE: "BIZ::Operations:Agreement:Create",
                BIZ__OPERATIONS_AGREEMENT_READ: "BIZ::Operations:Agreement:Read",
                BIZ__OPERATIONS_AGREEMENT_UPDATE: "BIZ::Operations:Agreement:Update",
                BIZ__OPERATIONS_AGREEMENT_DELETE: "BIZ::Operations:Agreement:Delete",
                // BusinessType
                BIZ__OPERATIONS_BUSINESSTYPE_CREATE: "BIZ::Operations:BusinessType:Create",
                BIZ__OPERATIONS_BUSINESSTYPE_READ: "BIZ::Operations:BusinessType:Read",
                BIZ__OPERATIONS_BUSINESSTYPE_UPDATE: "BIZ::Operations:BusinessType:Update",
                BIZ__OPERATIONS_BUSINESSTYPE_DELETE: "BIZ::Operations:BusinessType:Delete",
                // Channel
                BIZ__OPERATIONS_CHANNEL_CREATE: "BIZ::Operations:Channel:Create",
                BIZ__OPERATIONS_CHANNEL_READ: "BIZ::Operations:Channel:Read",
                BIZ__OPERATIONS_CHANNEL_UPDATE: "BIZ::Operations:Channel:Update",
                BIZ__OPERATIONS_CHANNEL_DELETE: "BIZ::Operations:Channel:Delete",
                // Project
                BIZ__OPERATIONS_PROJECT_CREATE: "BIZ::Operations:Project:Create",
                BIZ__OPERATIONS_PROJECT_READ: "BIZ::Operations:Project:Read",
                BIZ__OPERATIONS_PROJECT_UPDATE: "BIZ::Operations:Project:Update",
                BIZ__OPERATIONS_PROJECT_DELETE: "BIZ::Operations:Project:Delete",
                // ServiceCategory
                BIZ__OPERATIONS_SERVICECATEGORY_CREATE: "BIZ::Operations:ServiceCategory:Create",
                BIZ__OPERATIONS_SERVICECATEGORY_READ: "BIZ::Operations:ServiceCategory:Read",
                BIZ__OPERATIONS_SERVICECATEGORY_UPDATE: "BIZ::Operations:ServiceCategory:Update",
                BIZ__OPERATIONS_SERVICECATEGORY_DELETE: "BIZ::Operations:ServiceCategory:Delete",
                // ServiceLabel
                BIZ__OPERATIONS_SERVICELABEL_CREATE: "BIZ::Operations:ServiceLabel:Create",
                BIZ__OPERATIONS_SERVICELABEL_READ: "BIZ::Operations:ServiceLabel:Read",
                BIZ__OPERATIONS_SERVICELABEL_UPDATE: "BIZ::Operations:ServiceLabel:Update",
                BIZ__OPERATIONS_SERVICELABEL_DELETE: "BIZ::Operations:ServiceLabel:Delete",
                // ServiceType
                BIZ__OPERATIONS_SERVICETYPE_CREATE: "BIZ::Operations:ServiceType:Create",
                BIZ__OPERATIONS_SERVICETYPE_READ: "BIZ::Operations:ServiceType:Read",
                BIZ__OPERATIONS_SERVICETYPE_UPDATE: "BIZ::Operations:ServiceType:Update",
                BIZ__OPERATIONS_SERVICETYPE_DELETE: "BIZ::Operations:ServiceType:Delete",
                // SettlementType
                BIZ__OPERATIONS_SETTLEMENTTYPE_CREATE: "BIZ::Operations:SettlementType:Create",
                BIZ__OPERATIONS_SETTLEMENTTYPE_READ: "BIZ::Operations:SettlementType:Read",
                BIZ__OPERATIONS_SETTLEMENTTYPE_UPDATE: "BIZ::Operations:SettlementType:Update",
                BIZ__OPERATIONS_SETTLEMENTTYPE_DELETE: "BIZ::Operations:SettlementType:Delete",

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

                // CMPF Operations
                // Department
                CMPF__OPERATIONS_DEPARTMENT_CREATE: "CMPF::Operations:Department:Create",
                CMPF__OPERATIONS_DEPARTMENT_READ: "CMPF::Operations:Department:Read",
                CMPF__OPERATIONS_DEPARTMENT_UPDATE: "CMPF::Operations:Department:Update",
                CMPF__OPERATIONS_DEPARTMENT_DELETE: "CMPF::Operations:Department:Delete",
                // Operator
                CMPF__OPERATIONS_OPERATOR_CREATE: "CMPF::Operations:Operator:Create",
                CMPF__OPERATIONS_OPERATOR_READ: "CMPF::Operations:Operator:Read",
                CMPF__OPERATIONS_OPERATOR_UPDATE: "CMPF::Operations:Operator:Update",
                CMPF__OPERATIONS_OPERATOR_DELETE: "CMPF::Operations:Operator:Delete",
                // Role
                CMPF__OPERATIONS_ROLE_CREATE: "CMPF::Operations:Role:Create",
                CMPF__OPERATIONS_ROLE_READ: "CMPF::Operations:Role:Read",
                CMPF__OPERATIONS_ROLE_UPDATE: "CMPF::Operations:Role:Update",
                CMPF__OPERATIONS_ROLE_DELETE: "CMPF::Operations:Role:Delete",
                // Client
                CMPF__OPERATIONS_CLIENT_CREATE: "CMPF::Operations:Client:Create",
                CMPF__OPERATIONS_CLIENT_READ: "CMPF::Operations:Client:Read",
                CMPF__OPERATIONS_CLIENT_UPDATE: "CMPF::Operations:Client:Update",
                CMPF__OPERATIONS_CLIENT_DELETE: "CMPF::Operations:Client:Delete",
                // Service
                CMPF__OPERATIONS_SERVICE_CREATE: "CMPF::Operations:Service:Create",
                CMPF__OPERATIONS_SERVICE_READ: "CMPF::Operations:Service:Read",
                CMPF__OPERATIONS_SERVICE_UPDATE: "CMPF::Operations:Service:Update",
                CMPF__OPERATIONS_SERVICE_DELETE: "CMPF::Operations:Service:Delete",
                // ServiceProvider
                CMPF__OPERATIONS_SERVICEPROVIDER_CREATE: "CMPF::Operations:ServiceProvider:Create",
                CMPF__OPERATIONS_SERVICEPROVIDER_READ: "CMPF::Operations:ServiceProvider:Read",
                CMPF__OPERATIONS_SERVICEPROVIDER_UPDATE: "CMPF::Operations:ServiceProvider:Update",
                CMPF__OPERATIONS_SERVICEPROVIDER_DELETE: "CMPF::Operations:ServiceProvider:Delete",
                // ShortCode
                CMPF__OPERATIONS_SHORTCODE_CREATE: "CMPF::Operations:ShortCode:Create",
                CMPF__OPERATIONS_SHORTCODE_READ: "CMPF::Operations:ShortCode:Read",
                CMPF__OPERATIONS_SHORTCODE_UPDATE: "CMPF::Operations:ShortCode:Update",
                CMPF__OPERATIONS_SHORTCODE_DELETE: "CMPF::Operations:ShortCode:Delete",
                // Team
                CMPF__OPERATIONS_TEAM_CREATE: "CMPF::Operations:Team:Create",
                CMPF__OPERATIONS_TEAM_READ: "CMPF::Operations:Team:Read",
                CMPF__OPERATIONS_TEAM_UPDATE: "CMPF::Operations:Team:Update",
                CMPF__OPERATIONS_TEAM_DELETE: "CMPF::Operations:Team:Delete",
                // UserAccount
                CMPF__OPERATIONS_USERACCOUNT_CREATE: "CMPF::Operations:UserAccount:Create",
                CMPF__OPERATIONS_USERACCOUNT_READ: "CMPF::Operations:UserAccount:Read",
                CMPF__OPERATIONS_USERACCOUNT_UPDATE: "CMPF::Operations:UserAccount:Update",
                CMPF__OPERATIONS_USERACCOUNT_DELETE: "CMPF::Operations:UserAccount:Delete",
                // UserGroup
                CMPF__OPERATIONS_USERGROUP_CREATE: "CMPF::Operations:UserGroup:Create",
                CMPF__OPERATIONS_USERGROUP_READ: "CMPF::Operations:UserGroup:Read",
                CMPF__OPERATIONS_USERGROUP_UPDATE: "CMPF::Operations:UserGroup:Update",
                CMPF__OPERATIONS_USERGROUP_DELETE: "CMPF::Operations:UserGroup:Delete",

                // Content Management
                // ContentCategory
                CMS__OPERATIONS_CONTENTCATEGORY_CREATE: "CMS::Operations:ContentCategory:Create",
                CMS__OPERATIONS_CONTENTCATEGORY_READ: "CMS::Operations:ContentCategory:Read",
                CMS__OPERATIONS_CONTENTCATEGORY_UPDATE: "CMS::Operations:ContentCategory:Update",
                CMS__OPERATIONS_CONTENTCATEGORY_DELETE: "CMS::Operations:ContentCategory:Delete",
                // ContentFile
                CMS__OPERATIONS_CONTENTFILE_CREATE: "CMS::Operations:ContentFile:Create",
                CMS__OPERATIONS_CONTENTFILE_READ: "CMS::Operations:ContentFile:Read",
                CMS__OPERATIONS_CONTENTFILE_UPDATE: "CMS::Operations:ContentFile:Update",
                CMS__OPERATIONS_CONTENTFILE_DELETE: "CMS::Operations:ContentFile:Delete",
                // ContentMetadata
                CMS__OPERATIONS_CONTENTMETADATA_CREATE: "CMS::Operations:ContentMetadata:Create",
                CMS__OPERATIONS_CONTENTMETADATA_READ: "CMS::Operations:ContentMetadata:Read",
                CMS__OPERATIONS_CONTENTMETADATA_UPDATE: "CMS::Operations:ContentMetadata:Update",
                CMS__OPERATIONS_CONTENTMETADATA_DELETE: "CMS::Operations:ContentMetadata:Delete",
                // ContentType
                CMS__OPERATIONS_CONTENTTYPE_CREATE: "CMS::Operations:ContentType:Create",
                CMS__OPERATIONS_CONTENTTYPE_READ: "CMS::Operations:ContentType:Read",
                CMS__OPERATIONS_CONTENTTYPE_UPDATE: "CMS::Operations:ContentType:Update",
                CMS__OPERATIONS_CONTENTTYPE_DELETE: "CMS::Operations:ContentType:Delete",
                // RBT Operations
                // Category
                RBT__OPERATIONS_CATEGORY_CREATE: "RBT::Operations:Category:Create",
                RBT__OPERATIONS_CATEGORY_READ: "RBT::Operations:Category:Read",
                RBT__OPERATIONS_CATEGORY_UPDATE: "RBT::Operations:Category:Update",
                RBT__OPERATIONS_CATEGORY_DELETE: "RBT::Operations:Category:Delete",
                // Album
                RBT__OPERATIONS_ALBUM_CREATE: "RBT::Operations:Album:Create",
                RBT__OPERATIONS_ALBUM_READ: "RBT::Operations:Album:Read",
                RBT__OPERATIONS_ALBUM_UPDATE: "RBT::Operations:Album:Update",
                RBT__OPERATIONS_ALBUM_DELETE: "RBT::Operations:Album:Delete",
                // Artist
                RBT__OPERATIONS_ARTIST_CREATE: "RBT::Operations:Artist:Create",
                RBT__OPERATIONS_ARTIST_READ: "RBT::Operations:Artist:Read",
                RBT__OPERATIONS_ARTIST_UPDATE: "RBT::Operations:Artist:Update",
                RBT__OPERATIONS_ARTIST_DELETE: "RBT::Operations:Artist:Delete",
                // Mood
                RBT__OPERATIONS_MOOD_CREATE: "RBT::Operations:Mood:Create",
                RBT__OPERATIONS_MOOD_READ: "RBT::Operations:Mood:Read",
                RBT__OPERATIONS_MOOD_UPDATE: "RBT::Operations:Mood:Update",
                RBT__OPERATIONS_MOOD_DELETE: "RBT::Operations:Mood:Delete",
                // Tone
                RBT__OPERATIONS_TONE_CREATE: "RBT::Operations:Tone:Create",
                RBT__OPERATIONS_TONE_READ: "RBT::Operations:Tone:Read",
                RBT__OPERATIONS_TONE_UPDATE: "RBT::Operations:Tone:Update",
                RBT__OPERATIONS_TONE_DELETE: "RBT::Operations:Tone:Delete",
                // Event
                RBT__OPERATIONS_EVENT_CREATE: "RBT::Operations:Event:Create",
                RBT__OPERATIONS_EVENT_READ: "RBT::Operations:Event:Read",
                RBT__OPERATIONS_EVENT_UPDATE: "RBT::Operations:Event:Update",
                RBT__OPERATIONS_EVENT_DELETE: "RBT::Operations:Event:Delete",
                // Signature
                RBT__OPERATIONS_SIGNATURE_CREATE: "RBT::Operations:Signature:Create",
                RBT__OPERATIONS_SIGNATURE_READ: "RBT::Operations:Signature:Read",
                RBT__OPERATIONS_SIGNATURE_UPDATE: "RBT::Operations:Signature:Update",
                RBT__OPERATIONS_SIGNATURE_DELETE: "RBT::Operations:Signature:Delete",
                // Signature Box
                RBT__OPERATIONS_SIGNATURE_BOX_CREATE: "RBT::Operations:SignatureBox:Create",
                RBT__OPERATIONS_SIGNATURE_BOX_READ: "RBT::Operations:SignatureBox:Read",
                RBT__OPERATIONS_SIGNATURE_BOX_UPDATE: "RBT::Operations:SignatureBox:Update",
                RBT__OPERATIONS_SIGNATURE_BOX_DELETE: "RBT::Operations:SignatureBox:Delete",
                // SpecialCondition
                RBT__OPERATIONS_SPECIALCONDITION_CREATE: "RBT::Operations:SpecialCondition:Create",
                RBT__OPERATIONS_SPECIALCONDITION_READ: "RBT::Operations:SpecialCondition:Read",
                RBT__OPERATIONS_SPECIALCONDITION_UPDATE: "RBT::Operations:SpecialCondition:Update",
                RBT__OPERATIONS_SPECIALCONDITION_DELETE: "RBT::Operations:SpecialCondition:Delete",

                // Messaging Gateway
                // RoutingTable
                MSGW__OPERATIONS_ROUTINGTABLE_CREATE: "MSGW::Operations:RoutingTable:Create",
                MSGW__OPERATIONS_ROUTINGTABLE_READ: "MSGW::Operations:RoutingTable:Read",
                MSGW__OPERATIONS_ROUTINGTABLE_UPDATE: "MSGW::Operations:RoutingTable:Update",
                MSGW__OPERATIONS_ROUTINGTABLE_DELETE: "MSGW::Operations:RoutingTable:Delete",
                // ScreeningKeyword
                MSGW__OPERATIONS_SCREENINGKEYWORD_CREATE: "MSGW::Operations:ScreeningKeyword:Create",
                MSGW__OPERATIONS_SCREENINGKEYWORD_READ: "MSGW::Operations:ScreeningKeyword:Read",
                MSGW__OPERATIONS_SCREENINGKEYWORD_UPDATE: "MSGW::Operations:ScreeningKeyword:Update",
                MSGW__OPERATIONS_SCREENINGKEYWORD_DELETE: "MSGW::Operations:ScreeningKeyword:Delete",

                // Screening Management
                // Global
                SCRM__OPERATIONS_GLOBAL_CREATE: "SCRM::Operations:Global:Create",
                SCRM__OPERATIONS_GLOBAL_READ: "SCRM::Operations:Global:Read",
                SCRM__OPERATIONS_GLOBAL_UPDATE: "SCRM::Operations:Global:Update",
                SCRM__OPERATIONS_GLOBAL_DELETE: "SCRM::Operations:Global:Delete",
                // PerService
                SCRM__OPERATIONS_PERSERVICE_CREATE: "SCRM::Operations:PerService:Create",
                SCRM__OPERATIONS_PERSERVICE_READ: "SCRM::Operations:PerService:Read",
                SCRM__OPERATIONS_PERSERVICE_UPDATE: "SCRM::Operations:PerService:Update",
                SCRM__OPERATIONS_PERSERVICE_DELETE: "SCRM::Operations:PerService:Delete",

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
                // ShortCode
                SSM__OPERATIONS_SHORTCODE_CREATE: "SSM::Operations:ShortCode:Create",
                SSM__OPERATIONS_SHORTCODE_READ: "SSM::Operations:ShortCode:Read",
                SSM__OPERATIONS_SHORTCODE_UPDATE: "SSM::Operations:ShortCode:Update",
                SSM__OPERATIONS_SHORTCODE_DELETE: "SSM::Operations:ShortCode:Delete"
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
            getCustomerCarePermissions: function (allRights) {
                var foundUserCustomerCareRights = _.where(allRights, {resourceName: CMPFService.CUSTOMER_CARE_PORTAL_RESOURCE});

                $log.debug("Found resource rights for customer care: ", foundUserCustomerCareRights);

                return foundUserCustomerCareRights;
            },
            storeUserRights: function (userRights, storageKey, resourceName) {
                // Convert to map which contains only rights
                var availableRights = _.map(userRights, _.iteratee('operationName'));

                $log.debug("Found available user rights: ", availableRights);

                // Store session and this service
                UtilService.putToSessionStore(storageKey || UtilService.USER_RIGHTS, {
                    resourceName: resourceName || RESOURCE_NAME,
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
                        var permissionString = _self.permissions[permission];

                        isPermitted = isPermitted && _self.canDo(permissionString);
                    });
                }

                return isPermitted;
            },
            // Generic permissions
            canAllDashboardRead: function () {
                return this.canDo(this.permissions.ALL__DASHBOARD_READ);
            },
            // Charging
            canAllChargingDebit: function () {
                return this.canDo(this.permissions.ALL__CHARGING_DEBIT);
            },
            canAllChargingRefund: function () {
                return this.canDo(this.permissions.ALL__CHARGING_REFUND);
            },
            // Configuration
            canAllConfigurationCreate: function () {
                return this.canDo(this.permissions.ALL__CONFIGURATION_CREATE);
            },
            canAllConfigurationRead: function () {
                return this.canDo(this.permissions.ALL__CONFIGURATION_READ);
            },
            canAllConfigurationUpdate: function () {
                return this.canDo(this.permissions.ALL__CONFIGURATION_UPDATE);
            },
            canAllConfigurationDelete: function () {
                return this.canDo(this.permissions.ALL__CONFIGURATION_DELETE);
            },
            // Diagnostics
            canAllDiagnosticsAlarmLogs: function () {
                return this.canDo(this.permissions.ALL__DIAGNOSTICS_ALARMLOGS);
            },
            canAllDiagnosticsAuditLogs: function () {
                return this.canDo(this.permissions.ALL__DIAGNOSTICS_AUDITLOGS);
            },
            // Reports
            canAllReportsOnDemandRead: function () {
                return this.canDo(this.permissions.ALL__REPORTS_ONDEMAND_READ);
            },
            canAllReportsScheduledCreate: function () {
                return this.canDo(this.permissions.ALL__REPORTS_SCHEDULED_CREATE);
            },
            canAllReportsScheduledRead: function () {
                return this.canDo(this.permissions.ALL__REPORTS_SCHEDULED_READ);
            },
            canAllReportsScheduledUpdate: function () {
                return this.canDo(this.permissions.ALL__REPORTS_SCHEDULED_UPDATE);
            },
            canAllReportsScheduledDelete: function () {
                return this.canDo(this.permissions.ALL__REPORTS_SCHEDULED_DELETE);
            },
            // Financial Reports
            canAllFinancialReportsOnDemandRead: function () {
                return this.canDo(this.permissions.ALL__FINANCIALREPORTS_ONDEMAND_READ);
            },
            // Templates
            canAllTemplatesCreate: function () {
                return this.canDo(this.permissions.ALL__TEMPLATES_CREATE);
            },
            canAllTemplatesRead: function () {
                return this.canDo(this.permissions.ALL__TEMPLATES_READ);
            },
            canAllTemplatesUpdate: function () {
                return this.canDo(this.permissions.ALL__TEMPLATES_UPDATE);
            },
            canAllTemplatesDelete: function () {
                return this.canDo(this.permissions.ALL__TEMPLATES_DELETE);
            },
            // Troubleshooting
            canAllTroubleshootingRead: function () {
                return this.canDo(this.permissions.ALL__TROUBLESHOOTING_READ);
            },
            canAllTroubleshootingUpdate: function () {
                return this.canDo(this.permissions.ALL__TROUBLESHOOTING_UPDATE);
            },
            // MSGGW Content View
            canPeekMSGGWTroubleshooting: function (origAgentType, destAgentType) {
                var APPLICATION = 1, PEER = 8;

                var isPermitted = false;
                if (Number(origAgentType) === APPLICATION) {
                    isPermitted = this.canDo(this.permissions.ALL__TROUBLESHOOTING_PEEK);
                } else if (Number(destAgentType) === APPLICATION) {
                    isPermitted = this.canDo(this.permissions.ALL__TROUBLESHOOTING_PEEK);
                }

                return isPermitted;
            },
            // Provisioning and subscription management operations
            // Agreement
            canBizOperationsAgreementCreate: function () {
                return this.canDo(this.permissions.BIZ__OPERATIONS_AGREEMENT_CREATE);
            },
            canBizOperationsAgreementRead: function () {
                return this.canDo(this.permissions.BIZ__OPERATIONS_AGREEMENT_READ);
            },
            canBizOperationsAgreementUpdate: function () {
                return this.canDo(this.permissions.BIZ__OPERATIONS_AGREEMENT_UPDATE);
            },
            canBizOperationsAgreementDelete: function () {
                return this.canDo(this.permissions.BIZ__OPERATIONS_AGREEMENT_DELETE);
            },
            // BusinessType
            canBizOperationsBusinessTypeCreate: function () {
                return this.canDo(this.permissions.BIZ__OPERATIONS_BUSINESSTYPE_CREATE);
            },
            canBizOperationsBusinessTypeRead: function () {
                return this.canDo(this.permissions.BIZ__OPERATIONS_BUSINESSTYPE_READ);
            },
            canBizOperationsBusinessTypeUpdate: function () {
                return this.canDo(this.permissions.BIZ__OPERATIONS_BUSINESSTYPE_UPDATE);
            },
            canBizOperationsBusinessTypeDelete: function () {
                return this.canDo(this.permissions.BIZ__OPERATIONS_BUSINESSTYPE_DELETE);
            },
            // Channel
            canBizOperationsChannelCreate: function () {
                return this.canDo(this.permissions.BIZ__OPERATIONS_CHANNEL_CREATE);
            },
            canBizOperationsChannelRead: function () {
                return this.canDo(this.permissions.BIZ__OPERATIONS_CHANNEL_READ);
            },
            canBizOperationsChannelUpdate: function () {
                return this.canDo(this.permissions.BIZ__OPERATIONS_CHANNEL_UPDATE);
            },
            canBizOperationsChannelDelete: function () {
                return this.canDo(this.permissions.BIZ__OPERATIONS_CHANNEL_DELETE);
            },
            // Project
            canBizOperationsProjectCreate: function () {
                return this.canDo(this.permissions.BIZ__OPERATIONS_PROJECT_CREATE);
            },
            canBizOperationsProjectRead: function () {
                return this.canDo(this.permissions.BIZ__OPERATIONS_PROJECT_READ);
            },
            canBizOperationsProjectUpdate: function () {
                return this.canDo(this.permissions.BIZ__OPERATIONS_PROJECT_UPDATE);
            },
            canBizOperationsProjectDelete: function () {
                return this.canDo(this.permissions.BIZ__OPERATIONS_PROJECT_DELETE);
            },
            // ServiceCategory
            canBizOperationsServiceCategoryCreate: function () {
                return this.canDo(this.permissions.BIZ__OPERATIONS_SERVICECATEGORY_CREATE);
            },
            canBizOperationsServiceCategoryRead: function () {
                return this.canDo(this.permissions.BIZ__OPERATIONS_SERVICECATEGORY_READ);
            },
            canBizOperationsServiceCategoryUpdate: function () {
                return this.canDo(this.permissions.BIZ__OPERATIONS_SERVICECATEGORY_UPDATE);
            },
            canBizOperationsServiceCategoryDelete: function () {
                return this.canDo(this.permissions.BIZ__OPERATIONS_SERVICECATEGORY_DELETE);
            },
            // ServiceLabel
            canBizOperationsServiceLabelCreate: function () {
                return this.canDo(this.permissions.BIZ__OPERATIONS_SERVICELABEL_CREATE);
            },
            canBizOperationsServiceLabelRead: function () {
                return this.canDo(this.permissions.BIZ__OPERATIONS_SERVICELABEL_READ);
            },
            canBizOperationsServiceLabelUpdate: function () {
                return this.canDo(this.permissions.BIZ__OPERATIONS_SERVICELABEL_UPDATE);
            },
            canBizOperationsServiceLabelDelete: function () {
                return this.canDo(this.permissions.BIZ__OPERATIONS_SERVICELABEL_DELETE);
            },
            // ServiceType
            canBizOperationsServiceTypeCreate: function () {
                return this.canDo(this.permissions.BIZ__OPERATIONS_SERVICETYPE_CREATE);
            },
            canBizOperationsServiceTypeRead: function () {
                return this.canDo(this.permissions.BIZ__OPERATIONS_SERVICETYPE_READ);
            },
            canBizOperationsServiceTypeUpdate: function () {
                return this.canDo(this.permissions.BIZ__OPERATIONS_SERVICETYPE_UPDATE);
            },
            canBizOperationsServiceTypeDelete: function () {
                return this.canDo(this.permissions.BIZ__OPERATIONS_SERVICETYPE_DELETE);
            },
            // SettlementType
            canBizOperationsSettlementTypeCreate: function () {
                return this.canDo(this.permissions.BIZ__OPERATIONS_SETTLEMENTTYPE_CREATE);
            },
            canBizOperationsSettlementTypeRead: function () {
                return this.canDo(this.permissions.BIZ__OPERATIONS_SETTLEMENTTYPE_READ);
            },
            canBizOperationsSettlementTypeUpdate: function () {
                return this.canDo(this.permissions.BIZ__OPERATIONS_SETTLEMENTTYPE_UPDATE);
            },
            canBizOperationsSettlementTypeDelete: function () {
                return this.canDo(this.permissions.BIZ__OPERATIONS_SETTLEMENTTYPE_DELETE);
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
            // CMPF Operations
            // Department
            canCmpfOperationsDepartmentCreate: function () {
                return this.canDo(this.permissions.CMPF__OPERATIONS_DEPARTMENT_CREATE);
            },
            canCmpfOperationsDepartmentRead: function () {
                return this.canDo(this.permissions.CMPF__OPERATIONS_DEPARTMENT_READ);
            },
            canCmpfOperationsDepartmentUpdate: function () {
                return this.canDo(this.permissions.CMPF__OPERATIONS_DEPARTMENT_UPDATE);
            },
            canCmpfOperationsDepartmentDelete: function () {
                return this.canDo(this.permissions.CMPF__OPERATIONS_DEPARTMENT_DELETE);
            },
            // Operator
            canCmpfOperationsOperatorCreate: function () {
                return this.canDo(this.permissions.CMPF__OPERATIONS_OPERATOR_CREATE);
            },
            canCmpfOperationsOperatorRead: function () {
                return this.canDo(this.permissions.CMPF__OPERATIONS_OPERATOR_READ);
            },
            canCmpfOperationsOperatorUpdate: function () {
                return this.canDo(this.permissions.CMPF__OPERATIONS_OPERATOR_UPDATE);
            },
            canCmpfOperationsOperatorDelete: function () {
                return this.canDo(this.permissions.CMPF__OPERATIONS_OPERATOR_DELETE);
            },
            // Role
            canCmpfOperationsRoleCreate: function () {
                return this.canDo(this.permissions.CMPF__OPERATIONS_ROLE_CREATE);
            },
            canCmpfOperationsRoleRead: function () {
                return this.canDo(this.permissions.CMPF__OPERATIONS_ROLE_READ);
            },
            canCmpfOperationsRoleUpdate: function () {
                return this.canDo(this.permissions.CMPF__OPERATIONS_ROLE_UPDATE);
            },
            canCmpfOperationsRoleDelete: function () {
                return this.canDo(this.permissions.CMPF__OPERATIONS_ROLE_DELETE);
            },
            // Client
            canCmpfOperationsClientCreate: function () {
                return this.canDo(this.permissions.CMPF__OPERATIONS_CLIENT_CREATE);
            },
            canCmpfOperationsClientRead: function () {
                return this.canDo(this.permissions.CMPF__OPERATIONS_CLIENT_READ);
            },
            canCmpfOperationsClientUpdate: function () {
                return this.canDo(this.permissions.CMPF__OPERATIONS_CLIENT_UPDATE);
            },
            canCmpfOperationsClientDelete: function () {
                return this.canDo(this.permissions.CMPF__OPERATIONS_CLIENT_DELETE);
            },
            // Service
            canCmpfOperationsServiceCreate: function () {
                return this.canDo(this.permissions.CMPF__OPERATIONS_SERVICE_CREATE);
            },
            canCmpfOperationsServiceRead: function () {
                return this.canDo(this.permissions.CMPF__OPERATIONS_SERVICE_READ);
            },
            canCmpfOperationsServiceUpdate: function (state) {
                if ($rootScope.isAdminUser) {
                    return this.canDo(this.permissions.CMPF__OPERATIONS_SERVICE_UPDATE);
                } else {
                    return state !== 'PENDING' && this.canDo(this.permissions.CMPF__OPERATIONS_SERVICE_UPDATE);
                }
            },
            canCmpfOperationsServiceDelete: function () {
                return this.canDo(this.permissions.CMPF__OPERATIONS_SERVICE_DELETE);
            },
            // ServiceProvider
            canCmpfOperationsServiceProviderCreate: function () {
                return this.canDo(this.permissions.CMPF__OPERATIONS_SERVICEPROVIDER_CREATE);
            },
            canCmpfOperationsServiceProviderRead: function () {
                return this.canDo(this.permissions.CMPF__OPERATIONS_SERVICEPROVIDER_READ);
            },
            canCmpfOperationsServiceProviderUpdate: function (state) {
                if ($rootScope.isAdminUser) {
                    return this.canDo(this.permissions.CMPF__OPERATIONS_SERVICEPROVIDER_UPDATE);
                } else {
                    return state !== 'PENDING' && this.canDo(this.permissions.CMPF__OPERATIONS_SERVICEPROVIDER_UPDATE);
                }
            },
            canCmpfOperationsServiceProviderDelete: function () {
                return this.canDo(this.permissions.CMPF__OPERATIONS_SERVICEPROVIDER_DELETE);
            },
            // ShortCode
            canCmpfOperationsShortCodeCreate: function () {
                return this.canDo(this.permissions.CMPF__OPERATIONS_SHORTCODE_CREATE);
            },
            canCmpfOperationsShortCodeRead: function () {
                return this.canDo(this.permissions.CMPF__OPERATIONS_SHORTCODE_READ);
            },
            canCmpfOperationsShortCodeUpdate: function (state) {
                if ($rootScope.isAdminUser) {
                    return this.canDo(this.permissions.CMPF__OPERATIONS_SHORTCODE_UPDATE);
                } else {
                    return state !== 'PENDING' && this.canDo(this.permissions.CMPF__OPERATIONS_SHORTCODE_UPDATE);
                }
            },
            canCmpfOperationsShortCodeDelete: function () {
                return this.canDo(this.permissions.CMPF__OPERATIONS_SHORTCODE_DELETE);
            },
            // Team
            canCmpfOperationsTeamCreate: function () {
                return this.canDo(this.permissions.CMPF__OPERATIONS_TEAM_CREATE);
            },
            canCmpfOperationsTeamRead: function () {
                return this.canDo(this.permissions.CMPF__OPERATIONS_TEAM_READ);
            },
            canCmpfOperationsTeamUpdate: function () {
                return this.canDo(this.permissions.CMPF__OPERATIONS_TEAM_UPDATE);
            },
            canCmpfOperationsTeamDelete: function () {
                return this.canDo(this.permissions.CMPF__OPERATIONS_TEAM_DELETE);
            },
            // UserAccount
            canCmpfOperationsUserAccountCreate: function () {
                return this.canDo(this.permissions.CMPF__OPERATIONS_USERACCOUNT_CREATE);
            },
            canCmpfOperationsUserAccountRead: function () {
                return this.canDo(this.permissions.CMPF__OPERATIONS_USERACCOUNT_READ);
            },
            canCmpfOperationsUserAccountUpdate: function () {
                return this.canDo(this.permissions.CMPF__OPERATIONS_USERACCOUNT_UPDATE);
            },
            canCmpfOperationsUserAccountDelete: function () {
                return this.canDo(this.permissions.CMPF__OPERATIONS_USERACCOUNT_DELETE);
            },
            // UserGroup
            canCmpfOperationsUserGroupCreate: function () {
                return this.canDo(this.permissions.CMPF__OPERATIONS_USERGROUP_CREATE);
            },
            canCmpfOperationsUserGroupRead: function () {
                return this.canDo(this.permissions.CMPF__OPERATIONS_USERGROUP_READ);
            },
            canCmpfOperationsUserGroupUpdate: function () {
                return this.canDo(this.permissions.CMPF__OPERATIONS_USERGROUP_UPDATE);
            },
            canCmpfOperationsUserGroupDelete: function () {
                return this.canDo(this.permissions.CMPF__OPERATIONS_USERGROUP_DELETE);
            },
            // Content Management
            // ContentCategory
            canCmsOperationsContentCategoryCreate: function () {
                return this.canDo(this.permissions.CMS__OPERATIONS_CONTENTCATEGORY_CREATE);
            },
            canCmsOperationsContentCategoryRead: function () {
                return this.canDo(this.permissions.CMS__OPERATIONS_CONTENTCATEGORY_READ);
            },
            canCmsOperationsContentCategoryUpdate: function () {
                return this.canDo(this.permissions.CMS__OPERATIONS_CONTENTCATEGORY_UPDATE);
            },
            canCmsOperationsContentCategoryDelete: function () {
                return this.canDo(this.permissions.CMS__OPERATIONS_CONTENTCATEGORY_DELETE);
            },
            // ContentFile
            canCmsOperationsContentFileCreate: function () {
                return this.canDo(this.permissions.CMS__OPERATIONS_CONTENTFILE_CREATE);
            },
            canCmsOperationsContentFileRead: function () {
                return this.canDo(this.permissions.CMS__OPERATIONS_CONTENTFILE_READ);
            },
            canCmsOperationsContentFileUpdate: function () {
                return this.canDo(this.permissions.CMS__OPERATIONS_CONTENTFILE_UPDATE);
            },
            canCmsOperationsContentFileDelete: function () {
                return this.canDo(this.permissions.CMS__OPERATIONS_CONTENTFILE_DELETE);
            },
            // ContentMetadata
            canCmsOperationsContentMetadataCreate: function () {
                return this.canDo(this.permissions.CMS__OPERATIONS_CONTENTMETADATA_CREATE);
            },
            canCmsOperationsContentMetadataRead: function () {
                return this.canDo(this.permissions.CMS__OPERATIONS_CONTENTMETADATA_READ);
            },
            canCmsOperationsContentMetadataUpdate: function (state) {
                if ($rootScope.isAdminUser) {
                    return this.canDo(this.permissions.CMS__OPERATIONS_CONTENTMETADATA_UPDATE);
                } else {
                    return state !== 'PENDING' && this.canDo(this.permissions.CMS__OPERATIONS_CONTENTMETADATA_UPDATE);
                }
            },
            canCmsOperationsContentMetadataDelete: function () {
                return this.canDo(this.permissions.CMS__OPERATIONS_CONTENTMETADATA_DELETE);
            },
            // ContentType
            canCmsOperationsContentTypeCreate: function () {
                return this.canDo(this.permissions.CMS__OPERATIONS_CONTENTTYPE_CREATE);
            },
            canCmsOperationsContentTypeRead: function () {
                return this.canDo(this.permissions.CMS__OPERATIONS_CONTENTTYPE_READ);
            },
            canCmsOperationsContentTypeUpdate: function () {
                return this.canDo(this.permissions.CMS__OPERATIONS_CONTENTTYPE_UPDATE);
            },
            canCmsOperationsContentTypeDelete: function () {
                return this.canDo(this.permissions.CMS__OPERATIONS_CONTENTTYPE_DELETE);
            },
            // RBT Operations
            // Category
            canRBTOperationsCategoryCreate: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_CATEGORY_CREATE);
            },
            canRBTOperationsCategoryRead: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_CATEGORY_READ);
            },
            canRBTOperationsCategoryUpdate: function (state) {
                if ($rootScope.isAdminUser) {
                    return this.canDo(this.permissions.RBT__OPERATIONS_CATEGORY_UPDATE);
                } else {
                    return state !== 'PENDING' && this.canDo(this.permissions.RBT__OPERATIONS_CATEGORY_UPDATE);
                }
            },
            canRBTOperationsCategoryDelete: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_CATEGORY_DELETE);
            },
            // Album
            canRBTOperationsAlbumCreate: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_ALBUM_CREATE);
            },
            canRBTOperationsAlbumRead: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_ALBUM_READ);
            },
            canRBTOperationsAlbumUpdate: function (state) {
                if ($rootScope.isAdminUser) {
                    return this.canDo(this.permissions.RBT__OPERATIONS_ALBUM_UPDATE);
                } else {
                    return state !== 'PENDING' && this.canDo(this.permissions.RBT__OPERATIONS_ALBUM_UPDATE);
                }
            },
            canRBTOperationsAlbumDelete: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_ALBUM_DELETE);
            },
            // Artist
            canRBTOperationsArtistCreate: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_ARTIST_CREATE);
            },
            canRBTOperationsArtistRead: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_ARTIST_READ);
            },
            canRBTOperationsArtistUpdate: function (state) {
                if ($rootScope.isAdminUser) {
                    return this.canDo(this.permissions.RBT__OPERATIONS_ARTIST_UPDATE);
                } else {
                    return state !== 'PENDING' && this.canDo(this.permissions.RBT__OPERATIONS_ARTIST_UPDATE);
                }
            },
            canRBTOperationsArtistDelete: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_ARTIST_DELETE);
            },
            // Mood
            canRBTOperationsMoodCreate: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_MOOD_CREATE);
            },
            canRBTOperationsMoodRead: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_MOOD_READ);
            },
            canRBTOperationsMoodUpdate: function (state) {
                if ($rootScope.isAdminUser) {
                    return this.canDo(this.permissions.RBT__OPERATIONS_MOOD_UPDATE);
                } else {
                    return state !== 'PENDING' && this.canDo(this.permissions.RBT__OPERATIONS_MOOD_UPDATE);
                }
            },
            canRBTOperationsMoodDelete: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_MOOD_DELETE);
            },
            // Tone
            canRBTOperationsToneCreate: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_TONE_CREATE);
            },
            canRBTOperationsToneRead: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_TONE_READ);
            },
            canRBTOperationsToneUpdate: function (state) {
                if ($rootScope.isAdminUser) {
                    return this.canDo(this.permissions.RBT__OPERATIONS_TONE_UPDATE);
                } else {
                    return state !== 'PENDING' && this.canDo(this.permissions.RBT__OPERATIONS_TONE_UPDATE);
                }
            },
            canRBTOperationsToneDelete: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_TONE_DELETE);
            },
            // Event
            canRBTOperationsEventCreate: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_EVENT_CREATE);
            },
            canRBTOperationsEventRead: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_EVENT_READ);
            },
            canRBTOperationsEventUpdate: function (state) {
                if ($rootScope.isAdminUser) {
                    return this.canDo(this.permissions.RBT__OPERATIONS_EVENT_UPDATE);
                } else {
                    return state !== 'PENDING' && this.canDo(this.permissions.RBT__OPERATIONS_EVENT_UPDATE);
                }
            },
            canRBTOperationsEventDelete: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_EVENT_DELETE);
            },
            // Signature
            canRBTOperationsSignatureCreate: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_SIGNATURE_CREATE);
            },
            canRBTOperationsSignatureRead: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_SIGNATURE_READ);
            },
            canRBTOperationsSignatureUpdate: function (state) {
                return this.canDo(this.permissions.RBT__OPERATIONS_SIGNATURE_UPDATE);
            },
            canRBTOperationsSignatureDelete: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_SIGNATURE_DELETE);
            },
            // Signature Box
            canRBTOperationsSignatureBoxCreate: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_SIGNATURE_BOX_CREATE);
            },
            canRBTOperationsSignatureBoxRead: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_SIGNATURE_BOX_READ);
            },
            canRBTOperationsSignatureBoxUpdate: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_SIGNATURE_BOX_UPDATE);
            },
            canRBTOperationsSignatureBoxDelete: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_SIGNATURE_BOX_DELETE);
            },
            // SpecialCondition
            canRBTOperationsSpecialConditionCreate: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_SPECIALCONDITION_CREATE);
            },
            canRBTOperationsSpecialConditionRead: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_SPECIALCONDITION_READ);
            },
            canRBTOperationsSpecialConditionUpdate: function (state) {
                return this.canDo(this.permissions.RBT__OPERATIONS_SPECIALCONDITION_UPDATE);
            },
            canRBTOperationsSpecialConditionDelete: function () {
                return this.canDo(this.permissions.RBT__OPERATIONS_SPECIALCONDITION_DELETE);
            },
            // Messaging Gateway
            // RoutingTable
            canMsgwOperationsRoutingTableCreate: function () {
                return this.canDo(this.permissions.MSGW__OPERATIONS_ROUTINGTABLE_CREATE);
            },
            canMsgwOperationsRoutingTableRead: function () {
                return this.canDo(this.permissions.MSGW__OPERATIONS_ROUTINGTABLE_READ);
            },
            canMsgwOperationsRoutingTableUpdate: function () {
                return this.canDo(this.permissions.MSGW__OPERATIONS_ROUTINGTABLE_UPDATE);
            },
            canMsgwOperationsRoutingTableDelete: function () {
                return this.canDo(this.permissions.MSGW__OPERATIONS_ROUTINGTABLE_DELETE);
            },
            // ScreeningKeyword
            canMsgwOperationsScreeningKeywordCreate: function () {
                return this.canDo(this.permissions.MSGW__OPERATIONS_SCREENINGKEYWORD_CREATE);
            },
            canMsgwOperationsScreeningKeywordRead: function () {
                return this.canDo(this.permissions.MSGW__OPERATIONS_SCREENINGKEYWORD_READ);
            },
            canMsgwOperationsScreeningKeywordUpdate: function () {
                return this.canDo(this.permissions.MSGW__OPERATIONS_SCREENINGKEYWORD_UPDATE);
            },
            canMsgwOperationsScreeningKeywordDelete: function () {
                return this.canDo(this.permissions.MSGW__OPERATIONS_SCREENINGKEYWORD_DELETE);
            },
            // Screening Management
            // Global
            canScrmOperationsGlobalCreate: function () {
                return this.canDo(this.permissions.SCRM__OPERATIONS_GLOBAL_CREATE);
            },
            canScrmOperationsGlobalRead: function () {
                return this.canDo(this.permissions.SCRM__OPERATIONS_GLOBAL_READ);
            },
            canScrmOperationsGlobalUpdate: function () {
                return this.canDo(this.permissions.SCRM__OPERATIONS_GLOBAL_UPDATE);
            },
            canScrmOperationsGlobalDelete: function () {
                return this.canDo(this.permissions.SCRM__OPERATIONS_GLOBAL_DELETE);
            },
            // PerService
            canScrmOperationsPerServiceCreate: function () {
                return this.canDo(this.permissions.SCRM__OPERATIONS_PERSERVICE_CREATE);
            },
            canScrmOperationsPerServiceRead: function () {
                return this.canDo(this.permissions.SCRM__OPERATIONS_PERSERVICE_READ);
            },
            canScrmOperationsPerServiceUpdate: function () {
                return this.canDo(this.permissions.SCRM__OPERATIONS_PERSERVICE_UPDATE);
            },
            canScrmOperationsPerServiceDelete: function () {
                return this.canDo(this.permissions.SCRM__OPERATIONS_PERSERVICE_DELETE);
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
            // ShortCode
            canSsmOperationsShortCodeCreate: function () {
                return this.canDo(this.permissions.SSM__OPERATIONS_SHORTCODE_CREATE);
            },
            canSsmOperationsShortCodeRead: function () {
                return this.canDo(this.permissions.SSM__OPERATIONS_SHORTCODE_READ);
            },
            canSsmOperationsShortCodeUpdate: function () {
                return this.canDo(this.permissions.SSM__OPERATIONS_SHORTCODE_UPDATE);
            },
            canSsmOperationsShortCodeDelete: function () {
                return this.canDo(this.permissions.SSM__OPERATIONS_SHORTCODE_DELETE);
            },

            // ******************************************************************************
            // OLD Methods
            // Products
            canSeeApiManager: function () {
                return this.canDo(this.permissions.ALL__PRODUCTS_APIM);
            },
            canSeeBMS: function () {
                return this.canDo(this.permissions.ALL__PRODUCTS_BMS);
            },
            canSeeCHGGW: function () {
                return this.canDo(this.permissions.ALL__PRODUCTS_CHGW);
            },
            canSeeDCB: function () {
                return this.canDo(this.permissions.ALL__PRODUCTS_DCB);
            },
            canSeeOTPServer: function () {
                return this.canDo(this.permissions.ALL__PRODUCTS_OTP);
            },
            canSeeMSGGW: function () {
                return this.canDo(this.permissions.ALL__PRODUCTS_MSGW);
            },
            // Subsystems
            canSeeBusinessMgmt: function () {
                return this.canDo(this.permissions.ALL__SUBSYSTEMS_BIZ);
            },
            canSeeProvisioning: function () {
                return this.canDo(this.permissions.ALL__SUBSYSTEMS_CMPF);
            },
            canSeeScreeningMgmt: function () {
                return this.canDo(this.permissions.ALL__SUBSYSTEMS_SCRM);
            },
            canSeeContentMgmt: function () {
                return this.canDo(this.permissions.ALL__SUBSYSTEMS_CMS);
            },
            canSeeSubscriptionMgmt: function () {
                return this.canDo(this.permissions.ALL__SUBSYSTEMS_SSM);
            },
            canSeeDiagnostics: function () {
                return this.canDo(this.permissions.ALL__SUBSYSTEMS_DIAG);
            },
            canSeeReportGeneration: function () {
                return this.canDo(this.permissions.ALL__SUBSYSTEMS_REP);
            }
        };
    });

})();
