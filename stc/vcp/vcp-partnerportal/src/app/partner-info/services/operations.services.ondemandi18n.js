(function () {

    'use strict';

    angular.module('partnerportal.partner-info.services.ondemandi18n', []);

    var PartnerInfoOnDemandi18nModule = angular.module('partnerportal.partner-info.services.ondemandi18n');

    PartnerInfoOnDemandi18nModule.controller('PartnerInfoOnDemandi18nCtrl', function ($scope, $log, $uibModal, $filter, $translate, CMPFService) {
        $log.debug('PartnerInfoOnDemandi18nCtrl');

        $scope.shortCodeList = [];

        var prepareOnDemandi18nProfiles = function (service) {
            // OnDemandi18nProfile
            var onDemandi18nProfiles = CMPFService.getProfileAttributes(service.profiles, CMPFService.SERVICE_ON_DEMAND_I18N_PROFILE);
            if (onDemandi18nProfiles && onDemandi18nProfiles.length > 0) {
                service.onDemandi18nProfiles = onDemandi18nProfiles;
            }

            return service;
        };

        // OnDemandi18nProfiles managing methods.
        $scope.addOnDemandi18nProfile = function (service) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partner-info/services/operations.services.modal.ondemandi18n.html',
                controller: function ($rootScope, $scope, $log, $uibModalInstance, shortCodeList, servicesOfPartner, PROVISIONING_LANGUAGES, UtilService) {
                    $scope.service = service;
                    $scope.combinedOnDemandCommandsList = [];

                    $scope.PROVISIONING_LANGUAGES = PROVISIONING_LANGUAGES;

                    $scope.shortCodeList = shortCodeList;

                    $scope.servicesOfPartner = [];
                    _.each(servicesOfPartner.services, function (service) {
                        var preparedService = prepareOnDemandi18nProfiles(service);
                        if (preparedService.onDemandi18nProfiles) {
                            $scope.servicesOfPartner.push(preparedService);
                        }
                    });

                    // OnDemandShortCode watcher.
                    $scope.queryingCommands = false;
                    $scope.IsOnDemandCommandsMandatory = false;
                    $scope.$watch('onDemandi18nProfile.OnDemandShortCode', function (newVal, oldVal) {
                        if (newVal && !angular.equals(newVal, oldVal)) {
                            $scope.onDemandi18nProfile.OnDemandCommands = null;
                            $scope.queryingCommands = true;

                            // Get OnDemandCommands (keywords) list defined on other services & offers for availability check
                            if (newVal && $scope.onDemandi18nProfile.OnDemandShortCode) {

                                // For new service (before the service has been created, there won't be an organizationId) take it from rootScope.
                                var organizationId = ($scope.service.organizationId) ? $scope.service.organizationId : $rootScope.getOrganizationId();
                                CMPFService.getOrganizationShortcodeCommands(organizationId, newVal).then(function (response) {

                                    $scope.combinedOnDemandCommandsList = response.commandList;
                                    $scope.queryingCommands = false;
                                    UtilService.setError($scope.form, 'OnDemandShortCode', 'cmpfQuery', true);

                                }, function (error) {
                                    $log.debug('Error: ', error);
                                    $scope.queryingCommands = true;
                                    UtilService.setError($scope.form, 'OnDemandShortCode', 'cmpfQuery', false);
                                });
                            }

                            try {
                                // If another service exists with the same shortcode attached, the keywords are mandatory
                                var filteredOnDemandi18nProfiles = _.filter($scope.servicesOfPartner, function (service) {
                                    _.each(service.onDemandi18nProfiles, function (onDemandi18nProfile) {
                                        if (String(onDemandi18nProfile.OnDemandShortCode) === String(newVal) && (onDemandi18nProfile.OnDemandCommands === null || onDemandi18nProfile.OnDemandCommands === undefined)) {
                                            throw new Error('Found!');
                                        }
                                    });
                                });

                                $scope.IsOnDemandCommandsMandatory = false;
                            } catch (e) {
                                if (e.message === 'Found!') {
                                    $scope.IsOnDemandCommandsMandatory = true;
                                }
                            }
                        }
                    });

                    // SubCommands watcher.
                    $scope.$watch('onDemandi18nProfile.OnDemandCommands', function (newVal, oldVal) {
                        if ($scope.form.OnDemandCommands) {
                            $scope.form.OnDemandCommands.$setValidity('availabilityCheck', true);
                        }

                        if (!angular.equals(newVal, oldVal)) {
                            var newValueArray = []
                            if (newVal) {
                                newValueArray = newVal.toLowerCase().split(';');
                            }

                            try {
                                _.each(service.onDemandi18nList, function (onDemandi18nProfile) {
                                    if ($scope.onDemandi18nProfile.OnDemandShortCode === onDemandi18nProfile.OnDemandShortCode) {
                                        var onDemandCommandsArray = onDemandi18nProfile.OnDemandCommands ? onDemandi18nProfile.OnDemandCommands.toString().toLowerCase().split(';') : [];

                                        var onDemandCommandIntersection = _.intersection(onDemandCommandsArray, newValueArray);

                                        if (onDemandCommandIntersection.length > 0) {
                                            $scope.form.OnDemandCommands.$setValidity('availabilityCheck', false);
                                            $scope.onDemandCommandsAvailabilityMessage = $translate.instant('PartnerInfo.Services.OnDemandi18nProfile.OnDemandThisCommandAlreadyUsed', {
                                                command: onDemandCommandIntersection.join(';')
                                            });

                                            throw new Error();
                                        }
                                    }
                                });

                                // Check if onDemandCommand has already been defined on other Offers or Services:
                                _.each($scope.combinedOnDemandCommandsList, function (commandItem) {

                                    var onDemandCommandsArray = commandItem.command ? commandItem.command.toString().toLowerCase().split(';') : [];
                                    var onDemandCommandIntersection = _.intersection(onDemandCommandsArray, newValueArray);

                                    if (onDemandCommandIntersection.length > 0) {
                                        $scope.form.OnDemandCommands.$setValidity('availabilityCheck', false);
                                        $scope.onDemandCommandsAvailabilityMessage = $translate.instant('PartnerInfo.Services.OnDemandi18nProfile.OnDemandCommandAlreadyUsedGeneric', {
                                            command: commandItem.command,
                                            owner: commandItem.owner,
                                            type: commandItem.type
                                        });
                                        throw new Error();
                                    }
                                });

                            } catch (e) {
                                // Do nothing.
                            }
                        }
                    });

                    $scope.onDemandi18nProfile = {
                        IsDefault: false
                    };

                    $scope.save = function (onDemandi18nProfile) {
                        $uibModalInstance.close(onDemandi18nProfile);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {
                    shortCodeList: function () {
                        return $scope.shortCodeList;
                    },
                    servicesOfPartner: function ($rootScope, CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        var organizationId = $rootScope.getOrganizationId();

                        return CMPFService.getServicesByOrganizationId(organizationId, true, true, null, [CMPFService.SERVICE_ON_DEMAND_I18N_PROFILE]);
                    }
                }
            });

            modalInstance.result.then(function (onDemandi18nProfile) {
                service.onDemandi18nList = service.onDemandi18nList || [];

                onDemandi18nProfile.id = _.uniqueId();
                service.onDemandi18nList.push(onDemandi18nProfile);
            }, function () {
                //
            });
        };
        $scope.editOnDemandi18nProfile = function (service, onDemandi18nProfile) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partner-info/services/operations.services.modal.ondemandi18n.html',
                controller: function ($rootScope, $scope, $log, $uibModalInstance, shortCodeList, servicesOfPartner, combinedOnDemandCommandsOfPartner, PROVISIONING_LANGUAGES, UtilService) {
                    $scope.service = service;
                    $scope.PROVISIONING_LANGUAGES = PROVISIONING_LANGUAGES;
                    $scope.shortCodeList = shortCodeList;
                    $scope.combinedOnDemandCommandsList = [];

                    _.each(combinedOnDemandCommandsOfPartner.commandList, function (command) {
                        $scope.combinedOnDemandCommandsList.push(command);
                    });

                    $scope.servicesOfPartner = [];
                    _.each(servicesOfPartner.services, function (service) {
                        var preparedService = prepareOnDemandi18nProfiles(service);
                        if (preparedService.onDemandi18nProfiles) {
                            $scope.servicesOfPartner.push(preparedService);
                        }
                    });

                    // OnDemandShortCode watcher.
                    $scope.queryingCommands = false;
                    $scope.IsOnDemandCommandsMandatory = false;

                    $scope.$watch('onDemandi18nProfile.OnDemandShortCode', function (newVal, oldVal) {
                        if (newVal && !angular.equals(newVal, oldVal)) {
                            $scope.onDemandi18nProfile.OnDemandCommands = null;
                            $scope.queryingCommands = true;

                            // Get OnDemandCommands (keywords) list defined on other services & offers for availability check
                            if ($scope.onDemandi18nProfile.OnDemandShortCode) {

                                // For new service (before the service has been created, there won't be an organizationId) take it from rootScope.
                                var organizationId = ($scope.service.organizationId) ? $scope.service.organizationId : $rootScope.getOrganizationId();
                                CMPFService.getOrganizationShortcodeCommands(organizationId, newVal).then(function (response) {

                                    $scope.combinedOnDemandCommandsList = response.commandList;
                                    $scope.queryingCommands = false;
                                    UtilService.setError($scope.form, 'OnDemandShortCode', 'cmpfQuery', true);

                                }, function (error) {
                                    $log.debug('Error: ', error);
                                    $scope.queryingCommands = true;
                                    UtilService.setError($scope.form, 'OnDemandShortCode', 'cmpfQuery', false);
                                });
                            }

                            try {
                                // If another service exists with the same shortcode attached, the keywords are mandatory
                                var filteredOnDemandi18nProfiles = _.filter($scope.servicesOfPartner, function (service) {
                                    if ($scope.service.id !== service.id) {
                                        _.each(service.onDemandi18nProfiles, function (onDemandi18nProfile) {
                                            if (String(onDemandi18nProfile.OnDemandShortCode) === String(newVal) && (onDemandi18nProfile.OnDemandCommands === null || onDemandi18nProfile.OnDemandCommands === undefined)) {
                                                throw new Error('Found!');
                                            }
                                        });
                                    }
                                });

                                $scope.IsOnDemandCommandsMandatory = false;
                            } catch (e) {
                                if (e.message === 'Found!') {
                                    $scope.IsOnDemandCommandsMandatory = true;
                                }
                            }
                        }
                    });

                    // SubCommands watcher.
                    $scope.$watch('onDemandi18nProfile.OnDemandCommands', function (newVal, oldVal) {
                        if ($scope.form.OnDemandCommands) {
                            $scope.form.OnDemandCommands.$setValidity('availabilityCheck', true);
                        }

                        if (!angular.equals(newVal, oldVal)) {
                            var newValueArray = []
                            if (newVal) {
                                newValueArray = newVal.toLowerCase().split(';');
                            }

                            try {
                                _.each(service.onDemandi18nList, function (onDemandi18nProfile) {
                                    if ($scope.onDemandi18nProfile.profileId !== onDemandi18nProfile.profileId &&
                                        $scope.onDemandi18nProfile.OnDemandShortCode === onDemandi18nProfile.OnDemandShortCode) {
                                        var onDemandCommandsArray = onDemandi18nProfile.OnDemandCommands ? onDemandi18nProfile.OnDemandCommands.toString().toLowerCase().split(';') : [];

                                        var onDemandCommandIntersection = _.intersection(onDemandCommandsArray, newValueArray);

                                        if (onDemandCommandIntersection.length > 0) {
                                            $scope.form.OnDemandCommands.$setValidity('availabilityCheck', false);
                                            $scope.onDemandCommandsAvailabilityMessage = $translate.instant('PartnerInfo.Services.OnDemandi18nProfile.OnDemandThisCommandAlreadyUsed', {
                                                command: onDemandCommandIntersection.join(';')
                                            });

                                            throw new Error();
                                        }
                                    }
                                });

                                // Check if onDemandCommand has already been defined on other Offers or Services:
                                _.each($scope.combinedOnDemandCommandsList, function (commandItem) {

                                    var onDemandCommandsArray = commandItem.command ? commandItem.command.toString().toLowerCase().split(';') : [];
                                    var onDemandCommandIntersection = _.intersection(onDemandCommandsArray, newValueArray);

                                    if (onDemandCommandIntersection.length > 0) {
                                        $scope.form.OnDemandCommands.$setValidity('availabilityCheck', false);
                                        $scope.onDemandCommandsAvailabilityMessage = $translate.instant('PartnerInfo.Services.OnDemandi18nProfile.OnDemandCommandAlreadyUsedGeneric', {
                                            command: commandItem.command,
                                            owner: commandItem.owner,
                                            type: commandItem.type
                                        });
                                        throw new Error();
                                    }
                                });

                            } catch (e) {
                                // Do nothing.
                            }
                        }
                    });

                    $scope.onDemandi18nProfile = angular.copy(onDemandi18nProfile);
                    $scope.onDemandi18nProfileOriginal = angular.copy($scope.onDemandi18nProfile);
                    $scope.isNotChanged = function () {
                        return angular.equals($scope.onDemandi18nProfile, $scope.onDemandi18nProfileOriginal);
                    };

                    $scope.save = function (onDemandi18nProfile) {
                        $uibModalInstance.close(onDemandi18nProfile);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {
                    shortCodeList: function () {
                        return $scope.shortCodeList;
                    },
                    servicesOfPartner: function ($rootScope, CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        var organizationId = $rootScope.getOrganizationId();

                        return CMPFService.getServicesByOrganizationId(organizationId, true, true, null, [CMPFService.SERVICE_ON_DEMAND_I18N_PROFILE]);
                    },
                    combinedOnDemandCommandsOfPartner: function ($rootScope, CMPFService) {
                        // For new service (before the service has been created, there won't be an organizationId) take it from rootScope.
                        var organizationId = ($scope.service.organizationId) ? $scope.service.organizationId : $rootScope.getOrganizationId();
                        return CMPFService.getOrganizationShortcodeCommands(organizationId, onDemandi18nProfile.OnDemandShortCode);

                    }
                }
            });

            modalInstance.result.then(function (editedOnDemandi18nProfile) {
                var foundOnDemandi18nProfile = _.findWhere(service.onDemandi18nList, {id: editedOnDemandi18nProfile.id});
                if (foundOnDemandi18nProfile) {
                    foundOnDemandi18nProfile.Language = editedOnDemandi18nProfile.Language;
                    foundOnDemandi18nProfile.IsDefault = editedOnDemandi18nProfile.IsDefault;
                    foundOnDemandi18nProfile.OnDemandResponseMessage = editedOnDemandi18nProfile.OnDemandResponseMessage;
                    foundOnDemandi18nProfile.OnDemandShortCode = editedOnDemandi18nProfile.OnDemandShortCode;
                    foundOnDemandi18nProfile.OnDemandCommands = editedOnDemandi18nProfile.OnDemandCommands;
                }
            }, function () {
            });
        };
        $scope.removeOnDemandi18nProfile = function (service, onDemandi18nProfile) {
            var index = _.indexOf(service.onDemandi18nList, onDemandi18nProfile);
            if (index !== -1) {
                service.onDemandi18nList.splice(index, 1);
            }
        };
        $scope.getOnDemandi18nProfileString = function (onDemandi18nProfile) {
            var languageStr = $translate.instant('Languages.' + onDemandi18nProfile.Language);

            var resultStr = 'Lang.: ' + languageStr;

            if (onDemandi18nProfile.OnDemandShortCode) {
                resultStr += ', Short Code: ' + onDemandi18nProfile.OnDemandShortCode;
            }
            if (onDemandi18nProfile.OnDemandCommands) {
                resultStr += ', Keywords: ' + onDemandi18nProfile.OnDemandCommands;
            }
            if (onDemandi18nProfile.OnDemandResponseMessage) {
                resultStr += ', Response Message: ' + onDemandi18nProfile.OnDemandResponseMessage;
            }

            return resultStr;
        };

    });

})();
