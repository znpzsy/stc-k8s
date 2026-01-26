(function () {

    'use strict';

    angular.module('partnerportal.firsttimelogin', []);

    var FirstTimeLoginModule = angular.module('partnerportal.firsttimelogin');

    FirstTimeLoginModule.config(function ($stateProvider) {

        $stateProvider.state('firsttimelogin', {
            abstract: true,
            url: "",
            template: "<div ui-view></div>",
            data: {
                headerKey: 'PartnerInfo.PageHeader'
            }
        }).state('firsttimelogin.changepassword', {
            url: "/change-password",
            templateUrl: 'login/firsttimelogin.changepassword.details.html',
            controller: 'FirstTimeLoginChangePasswordCtrl',
            resolve: {
                userAccount: function (SessionService, CMPFService) {
                    var userId = SessionService.getUserId();

                    return CMPFService.getUserAccount(userId, true, true);
                }
            }
        });

    });

    FirstTimeLoginModule.controller('FirstTimeLoginChangePasswordCtrl', function ($scope, $log, $q, $state, $filter, $translate, notification, userAccount, IdleServiceFactory,
                                                                                  SessionService, CMPFService) {
        $log.debug('FirstTimeLoginChangePasswordCtrl');

        var userProfiles = CMPFService.getProfileAttributes(userAccount.profiles, CMPFService.USER_PROFILE_NAME);
        var userProfile;
        if (userProfiles.length > 0) {
            userProfile = userProfiles[0];
        }

        var updateUserAccount = function (userProfileOriginal, userAccountOriginal) {
            var deferred = $q.defer();

            var currentTimestamp = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');

            $log.debug('Trying update user account: ', userProfileOriginal, userAccountOriginal);

            // Update the last update time for create first time or for update everytime.
            userProfileOriginal.LastUpdateTime = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');

            var userAccountItem = {
                id: userAccountOriginal.id,
                userName: userAccountOriginal.userName,
                password: userAccountOriginal.password,
                // Profiles
                profiles: angular.copy(userAccountOriginal.profiles)
            };

            var originalUserAccountProfiles = CMPFService.findProfilesByName(userAccountItem.profiles, CMPFService.USER_PROFILE_NAME);

            var updatedUserAccountProfile = JSON.parse(angular.toJson(userProfileOriginal));
            updatedUserAccountProfile.LastUpdateTime = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');
            updatedUserAccountProfile.IsPwdResetForcedAtFirstLogin = false;

            var originalDepartmentProfile = _.findWhere(originalUserAccountProfiles, {id: updatedUserAccountProfile.profileId});

            var userAccountProfileAttrArray = CMPFService.prepareProfile(updatedUserAccountProfile, originalDepartmentProfile);
            // ---
            if (originalDepartmentProfile) {
                originalDepartmentProfile.attributes = userAccountProfileAttrArray;
            } else {
                var userAccountProfile = {
                    name: CMPFService.USER_PROFILE_NAME,
                    profileDefinitionName: CMPFService.USER_PROFILE_NAME,
                    attributes: userAccountProfileAttrArray
                };

                userAccountItem.profiles.push(userAccountProfile);
            }

            // EntityAuditProfile
            var originalEntityAuditProfile = CMPFService.findProfileByName(userAccountItem.profiles, CMPFService.ENTITY_AUDIT_PROFILE);
            userAccount.entityAuditProfile = {
                LastUpdatedBy: SessionService.getUsername(),
                LastUpdatedOn: currentTimestamp,
                LastUpdateApprovedBy: SessionService.getUsername(),
                LastUpdateApprovedOn: currentTimestamp
            };
            var updatedEntityAuditProfile = JSON.parse(angular.toJson(userAccount.entityAuditProfile));
            var entityAuditProfileArray = CMPFService.prepareProfile(updatedEntityAuditProfile, originalEntityAuditProfile);
            // ---
            if (originalEntityAuditProfile) {
                originalEntityAuditProfile.attributes = entityAuditProfileArray;
            } else {
                var entityAuditProfile = {
                    name: CMPFService.ENTITY_AUDIT_PROFILE,
                    profileDefinitionName: CMPFService.ENTITY_AUDIT_PROFILE,
                    attributes: entityAuditProfileArray
                };

                userAccountItem.profiles.push(entityAuditProfile);
            }

            CMPFService.updateUserAccount(userAccountItem).then(function (response) {
                $log.debug('Update Success. Response: ', response);

                if (response && response.errorCode) {
                    deferred.reject(response)
                } else {
                    deferred.resolve(response)
                }
            }, function (response) {
                $log.debug('Cannot save the organization. Error: ', response);

                deferred.reject(response)
            });

            return deferred.promise;
        };

        $scope.save = function (password) {
            userAccount.password = password;

            updateUserAccount(userProfile, userAccount).then(function (response) {
                notification.flash({
                    type: 'success',
                    text: $translate.instant('FirstTimeLogin.OperationSuccessful')
                });

                // Stop idle watch.
                IdleServiceFactory.idleUnwatch();

                // Invalidate session.
                SessionService.sessionInvalidate();

                // Redirect to the login again.
                $state.go('login');
            }, function (response) {
                $log.debug('Cannot update user account password. Error: ', response);

                notification({
                    type: 'danger',
                    text: $translate.instant('FirstTimeLogin.OperationError')
                });
            });
        };
    });

})();
