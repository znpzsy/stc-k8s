(function () {
    'use strict';

    /* Authorization Services */
    angular.module('Application.authorization-services', []);

    var ApplicationAuthorizationServices = angular.module('Application.authorization-services');

    ApplicationAuthorizationServices.factory('AuthorizationService', function ($q, $log, UtilService, CMPFService, Restangular, RESOURCE_NAME) {
        return {
            userRights: [],
            permissions: {
                // Business Process Management (workflows)
                // TODO: These permissions are used in the BPM module, which is not removed from the source yet.
                // When all requirements for Partner Portal is clarified, we might need to remove these permissions.
                BPM__TASK_APPROVE: "BPM::Task:Approve",
                BPM__TASK_ASSIGN: "BPM::Task:Assign",
                BPM__TASK_CREATE: "BPM::Task:Create",
                BPM__TASK_READ: "BPM::Task:Read",
                BPM__TASK_DELETE: "BPM::Task:Delete",
                BPM__TASK_REJECT: "BPM::Task:Reject",

                // Provisioning
                // Account Profile
                PRM__PROFILE_READ: "PRM::Profile:Read",
                // TODO: Account Profile Update is not used in the source code, remove if unnecessary when the requirements are clear.
                //PRM__PROFILE_UPDATE: "PRM::Profile:Update",

                // // Reports
                // PRM__REPORTS_ONDEMAND_READ: "PRM::Reports:OnDemand:Read",
                // // Financial Reports
                // PRM__FINANCIALREPORTS_ONDEMAND_READ: "PRM::FinancialReports:OnDemand:Read",
                //


                // // User account
                // PRM__USERACCOUNT_CREATE: "PRM::UserAccount:Create",
                // PRM__USERACCOUNT_READ: "PRM::UserAccount:Read",
                // PRM__USERACCOUNT_UPDATE: "PRM::UserAccount:Update",
                // PRM__USERACCOUNT_DELETE: "PRM::UserAccount:Delete",
                // // Offer
                // PRM__OFFER_CREATE: "PRM::Offer:Create",
                // PRM__OFFER_READ: "PRM::Offer:Read",
                // PRM__OFFER_UPDATE: "PRM::Offer:Update",
                // PRM__OFFER_DELETE: "PRM::Offer:Delete",
                // // Service
                // PRM__SERVICE_CREATE: "PRM::Service:Create",
                // PRM__SERVICE_READ: "PRM::Service:Read",
                // PRM__SERVICE_UPDATE: "PRM::Service:Update",
                // PRM__SERVICE_DELETE: "PRM::Service:Delete",
                //
                // // Content Management
                // PRM__CONTENT_CREATE: "PRM::Content:Create",
                // PRM__CONTENT_READ: "PRM::Content:Read",
                // PRM__CONTENT_UPDATE: "PRM::Content:Update",
                // PRM__CONTENT_DELETE: "PRM::Content:Delete",


                // RBT Operations
                // // Category
                // RBT__CATEGORY_CREATE: "RBT::Category:Create",
                // RBT__CATEGORY_READ: "RBT::Category:Read",
                // RBT__CATEGORY_UPDATE: "RBT::Category:Update",
                // RBT__CATEGORY_DELETE: "RBT::Category:Delete",
                // // Album
                // RBT__ALBUM_CREATE: "RBT::Album:Create",
                // RBT__ALBUM_READ: "RBT::Album:Read",
                // RBT__ALBUM_UPDATE: "RBT::Album:Update",
                // RBT__ALBUM_DELETE: "RBT::Album:Delete",
                // // Artist
                // RBT__ARTIST_CREATE: "RBT::Artist:Create",
                // RBT__ARTIST_READ: "RBT::Artist:Read",
                // RBT__ARTIST_UPDATE: "RBT::Artist:Update",
                // RBT__ARTIST_DELETE: "RBT::Artist:Delete",
                // // Mood
                // RBT__MOOD_CREATE: "RBT::Mood:Create",
                // RBT__MOOD_READ: "RBT::Mood:Read",
                // RBT__MOOD_UPDATE: "RBT::Mood:Update",
                // RBT__MOOD_DELETE: "RBT::Mood:Delete",

                // Tone - DSP Originally uses RBT::Tone:CRUD format
                RBT__TONE_CREATE: "RBT::Operations:Tone:Create",
                RBT__TONE_READ: "RBT::Operations:Tone:Read",
                RBT__TONE_UPDATE: "RBT::Operations:Tone:Update",
                RBT__TONE_DELETE: "RBT::Operations:Tone:Delete",

                // // Short Codes
                // PRM__SHORT_CODE_CREATE: "PRM::ShortCode:Create",
                // PRM__SHORT_CODE_READ: "PRM::ShortCode:Read",
                // PRM__SHORT_CODE_UPDATE: "PRM::ShortCode:Update",
                // PRM__SHORT_CODE_DELETE: "PRM::ShortCode:Delete"
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
            // Business Process Management (workflows)
            canBpmTaskApprove: function () {
                return this.canDo(this.permissions.BPM__TASK_APPROVE);
            },
            canBpmTaskAssign: function () {
                return this.canDo(this.permissions.BPM__TASK_ASSIGN);
            },
            canBpmTaskCreate: function () {
                return this.canDo(this.permissions.BPM__TASK_CREATE);
            },
            canBpmTaskRead: function () {
                return this.canDo(this.permissions.BPM__TASK_READ);
            },
            canBpmTaskDelete: function () {
                return this.canDo(this.permissions.BPM__TASK_DELETE);
            },
            canBpmTaskReject: function () {
                return this.canDo(this.permissions.BPM__TASK_REJECT);
            },
            // Provisioning
            // Account Profile
            canPrmProfileRead: function () {
                return this.canDo(this.permissions.PRM__PROFILE_READ);
            },
            // canPrmProfileUpdate: function (state) {
            //     return state !== 'PENDING' && this.canDo(this.permissions.PRM__PROFILE_UPDATE);
            // },
            // // Reports
            // canPrmReportsOnDemandRead: function () {
            //     return this.canDo(this.permissions.PRM__REPORTS_ONDEMAND_READ);
            // },
            // // Financial Reports
            // canPrmFinancialReportsOnDemandRead: function () {
            //     return this.canDo(this.permissions.PRM__FINANCIALREPORTS_ONDEMAND_READ);
            // },
            // // User account
            // canPrmUserAccountCreate: function () {
            //     return this.canDo(this.permissions.PRM__USERACCOUNT_CREATE);
            // },
            // canPrmUserAccountRead: function () {
            //     return this.canDo(this.permissions.PRM__USERACCOUNT_READ);
            // },
            // canPrmUserAccountUpdate: function () {
            //     return this.canDo(this.permissions.PRM__USERACCOUNT_UPDATE);
            // },
            // canPrmUserAccountDelete: function () {
            //     return this.canDo(this.permissions.PRM__USERACCOUNT_DELETE);
            // },
            // // Offer
            // canPrmOfferCreate: function () {
            //     return this.canDo(this.permissions.PRM__OFFER_CREATE);
            // },
            // canPrmOfferRead: function () {
            //     return this.canDo(this.permissions.PRM__OFFER_READ);
            // },
            // canPrmOfferUpdate: function (state) {
            //     return state !== 'PENDING' && this.canDo(this.permissions.PRM__OFFER_UPDATE);
            // },
            // canPrmOfferDelete: function () {
            //     return this.canDo(this.permissions.PRM__OFFER_DELETE);
            // },
            // Service

            // canPrmServiceCreate: function () {
            //     return this.canDo(this.permissions.PRM__SERVICE_CREATE);
            // },
            // canPrmServiceRead: function () {
            //     return this.canDo(this.permissions.PRM__SERVICE_READ);
            // },
            // canPrmServiceUpdate: function (state) {
            //     return state !== 'PENDING' && this.canDo(this.permissions.PRM__SERVICE_UPDATE);
            // },
            // canPrmServiceDelete: function () {
            //     return this.canDo(this.permissions.PRM__SERVICE_DELETE);
            // },
            // // Content Management
            // // Content
            // canPrmContentCreate: function () {
            //     return this.canDo(this.permissions.PRM__CONTENT_CREATE);
            // },
            // canPrmContentRead: function () {
            //     return this.canDo(this.permissions.PRM__CONTENT_READ);
            // },
            // canPrmContentUpdate: function (state) {
            //     return state !== 'PENDING' && this.canDo(this.permissions.PRM__CONTENT_UPDATE);
            // },
            // canPrmContentDelete: function () {
            //     return this.canDo(this.permissions.PRM__CONTENT_DELETE);
            // },

            // RBT Operations
            // Category
            canRBTCategoryCreate: function () {
                return this.canDo(this.permissions.RBT__CATEGORY_CREATE);
            },
            canRBTCategoryRead: function () {
                return this.canDo(this.permissions.RBT__CATEGORY_READ);
            },
            canRBTCategoryUpdate: function (state) {
                return state !== 'PENDING' && this.canDo(this.permissions.RBT__CATEGORY_UPDATE);
            },
            canRBTCategoryDelete: function () {
                return this.canDo(this.permissions.RBT__CATEGORY_DELETE);
            },

            // // Album
            // canRBTAlbumCreate: function () {
            //     return this.canDo(this.permissions.RBT__ALBUM_CREATE);
            // },
            // canRBTAlbumRead: function () {
            //     return this.canDo(this.permissions.RBT__ALBUM_READ);
            // },
            // canRBTAlbumUpdate: function (state) {
            //     return state !== 'PENDING' && this.canDo(this.permissions.RBT__ALBUM_UPDATE);
            // },
            // canRBTAlbumDelete: function () {
            //     return this.canDo(this.permissions.RBT__ALBUM_DELETE);
            // },
            // // Artist
            // canRBTArtistCreate: function () {
            //     return this.canDo(this.permissions.RBT__ARTIST_CREATE);
            // },
            // canRBTArtistRead: function () {
            //     return this.canDo(this.permissions.RBT__ARTIST_READ);
            // },
            // canRBTArtistUpdate: function (state) {
            //     return state !== 'PENDING' && this.canDo(this.permissions.RBT__ARTIST_UPDATE);
            // },
            // canRBTArtistDelete: function () {
            //     return this.canDo(this.permissions.RBT__ARTIST_DELETE);
            // },
            // // Mood
            // canRBTMoodCreate: function () {
            //     return this.canDo(this.permissions.RBT__MOOD_CREATE);
            // },
            // canRBTMoodRead: function () {
            //     return this.canDo(this.permissions.RBT__MOOD_READ);
            // },
            // canRBTMoodUpdate: function (state) {
            //     return state !== 'PENDING' && this.canDo(this.permissions.RBT__MOOD_UPDATE);
            // },
            // canRBTMoodDelete: function () {
            //     return this.canDo(this.permissions.RBT__MOOD_DELETE);
            // },
            // Tone

            canRBTToneCreate: function () {
                return this.canDo(this.permissions.RBT__TONE_CREATE);
            },
            canRBTToneRead: function () {
                return this.canDo(this.permissions.RBT__TONE_READ);
            },
            canRBTToneUpdate: function (state) {
                return (state === 'REJECTED') && this.canDo(this.permissions.RBT__TONE_UPDATE);
            },
            canRBTToneDelete: function () {
                return this.canDo(this.permissions.RBT__TONE_DELETE);
            },

            // // Short Codes
            // canPrmShortCodeCreate: function () {
            //     return this.canDo(this.permissions.PRM__SHORT_CODE_CREATE);
            // },
            // canPrmShortCodeRead: function () {
            //     return this.canDo(this.permissions.PRM__SHORT_CODE_READ);
            // },
            // canPrmShortCodeUpdate: function (state) {
            //     return state !== 'PENDING' && this.canDo(this.permissions.PRM__SHORT_CODE_UPDATE);
            // },
            // canPrmShortCodeDelete: function () {
            //     return this.canDo(this.permissions.PRM__SHORT_CODE_DELETE);
            // }
        };
    });

})();
