(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning.operations.services.ondemandi18n', []);

    var ProvisioningOperationsOnDemandi18nModule = angular.module('adminportal.subsystems.provisioning.operations.services.ondemandi18n');

    ProvisioningOperationsOnDemandi18nModule.controller('ProvisioningOperationsOnDemandi18nCtrl', function ($scope, $log, $uibModal, $filter, $translate, CMPFService) {
        $log.debug('ProvisioningOperationsOnDemandi18nCtrl');

        $scope.shortCodeList = [];

        var prepareOnDemandi18nProfiles = function (service) {
            // OnDemandi18nProfile
            var onDemandi18nProfiles = CMPFService.getProfileAttributes(service.profiles, CMPFService.SERVICE_ON_DEMAND_I18N_PROFILE);
            if (onDemandi18nProfiles && onDemandi18nProfiles.length > 0) {
                service.onDemandi18nProfiles = onDemandi18nProfiles;
            }

            return service;
        };

        var prepareSMSPortali18nProfiles = function (offer) {
            // SMSPortali18nProfile
            var smsPortali18nProfiles = CMPFService.getProfileAttributes(offer.profiles, CMPFService.SMS_PORTAL_I18N_PROFILE);
            if (smsPortali18nProfiles && smsPortali18nProfiles.length > 0) {
                offer.smsPortali18nProfiles = smsPortali18nProfiles;
            }

            return offer;
        };

        // OnDemandi18nProfiles managing methods.
        $scope.addOnDemandi18nProfile = function (service) {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/services/operations.services.modal.ondemandi18n.html',
                controller: function ($scope, $log, $uibModalInstance, shortCodeList, offersOfPartner, servicesOfPartner, PROVISIONING_LANGUAGES) {
                    $scope.service = service;

                    $scope.PROVISIONING_LANGUAGES = PROVISIONING_LANGUAGES;

                    $scope.shortCodeList = shortCodeList;

                    $scope.offersOfPartner = [];
                    _.each(offersOfPartner.offers, function (offer) {
                        var preparedOffer = prepareSMSPortali18nProfiles(offer);
                        if (preparedOffer.smsPortali18nProfiles) {
                            $scope.offersOfPartner.push(preparedOffer);
                        }
                    });

                    $scope.servicesOfPartner = [];
                    _.each(servicesOfPartner.services, function (service) {
                        var preparedService = prepareOnDemandi18nProfiles(service);
                        if (preparedService.onDemandi18nProfiles) {
                            $scope.servicesOfPartner.push(preparedService);
                        }
                    });

                    // OnDemandShortCode watcher.
                    $scope.IsOnDemandCommandsMandatory = false;
                    $scope.$watch('onDemandi18nProfile.OnDemandShortCode', function (newVal, oldVal) {
                        if (!angular.equals(newVal, oldVal)) {
                            $scope.onDemandi18nProfile.OnDemandCommands = null;

                            try {
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
                                            $scope.onDemandCommandsAvailabilityMessage = $translate.instant('Subsystems.Provisioning.Services.OnDemandi18nProfile.OnDemandThisCommandAlreadyUsed', {
                                                command: onDemandCommandIntersection.join(';')
                                            });

                                            throw new Error();
                                        }
                                    }
                                });

                                // Check other services.
                                _.each($scope.servicesOfPartner, function (service) {
                                    _.each(service.onDemandi18nProfiles, function (onDemandi18nProfile) {
                                        if ($scope.onDemandi18nProfile.OnDemandShortCode === onDemandi18nProfile.OnDemandShortCode) {
                                            var onDemandCommandsArray = onDemandi18nProfile.OnDemandCommands ? onDemandi18nProfile.OnDemandCommands.toString().toLowerCase().split(';') : [];

                                            var onDemandCommandIntersection = _.intersection(onDemandCommandsArray, newValueArray);

                                            if (onDemandCommandIntersection.length > 0) {
                                                $scope.form.OnDemandCommands.$setValidity('availabilityCheck', false);
                                                $scope.onDemandCommandsAvailabilityMessage = $translate.instant('Subsystems.Provisioning.Services.OnDemandi18nProfile.OnDemandCommandAlreadyUsed', {
                                                    command: onDemandCommandIntersection.join(';'),
                                                    serviceName: service.name
                                                });

                                                throw new Error();
                                            }
                                        }
                                    });
                                });

                                // Check other offers.
                                _.each($scope.offersOfPartner, function (offer) {
                                    _.each(offer.smsPortali18nProfiles, function (smsPortali18nProfile) {
                                        if ($scope.onDemandi18nProfile.OnDemandShortCode === smsPortali18nProfile.SubUnsubShortCode) {
                                            var subCommandsArray = smsPortali18nProfile.SubCommands ? smsPortali18nProfile.SubCommands.toString().toLowerCase().split(';') : [];
                                            var unsubCommandsArray = smsPortali18nProfile.UnsubCommands ? smsPortali18nProfile.UnsubCommands.toString().toLowerCase().split(';') : [];

                                            var subCommandIntersection = _.intersection(subCommandsArray, newValueArray);
                                            var unsubCommandIntersection = _.intersection(unsubCommandsArray, newValueArray);

                                            if (subCommandIntersection.length > 0 || unsubCommandIntersection.length > 0) {
                                                $scope.form.OnDemandCommands.$setValidity('availabilityCheck', false);
                                                $scope.onDemandCommandsAvailabilityMessage = $translate.instant('Subsystems.Provisioning.Services.OnDemandi18nProfile.OnDemandCommandAlreadyUsedByOffer', {
                                                    command: subCommandIntersection.length > 0 ? subCommandIntersection.join(';') : unsubCommandIntersection.join(';'),
                                                    offerName: offer.name
                                                });

                                                throw new Error();
                                            }
                                        }
                                    });
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
                    offersOfPartner: function (CMPFService) {
                        if ($scope.service.organization) {
                            return CMPFService.getAllOffersByOrganizationId($scope.service.organizationId, false, false, true, null, [CMPFService.SMS_PORTAL_I18N_PROFILE]);
                        } else {
                            return {offers: []};
                        }
                    },
                    servicesOfPartner: function (CMPFService) {
                        if ($scope.service.organization) {
                            return CMPFService.getAllServicesByOrganizationId($scope.service.organizationId, false, true, null, [CMPFService.SERVICE_ON_DEMAND_I18N_PROFILE]);
                        } else {
                            return {services: []};
                        }
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
                templateUrl: 'subsystems/provisioning/operations/services/operations.services.modal.ondemandi18n.html',
                controller: function ($scope, $log, $uibModalInstance, shortCodeList, offersOfPartner, servicesOfPartner, PROVISIONING_LANGUAGES) {
                    $scope.service = service;

                    $scope.PROVISIONING_LANGUAGES = PROVISIONING_LANGUAGES;

                    $scope.shortCodeList = shortCodeList;

                    $scope.offersOfPartner = [];
                    _.each(offersOfPartner.offers, function (offer) {
                        var preparedOffer = prepareSMSPortali18nProfiles(offer);
                        if (preparedOffer.smsPortali18nProfiles) {
                            $scope.offersOfPartner.push(preparedOffer);
                        }
                    });

                    $scope.servicesOfPartner = [];
                    _.each(servicesOfPartner.services, function (service) {
                        var preparedService = prepareOnDemandi18nProfiles(service);
                        if (preparedService.onDemandi18nProfiles) {
                            $scope.servicesOfPartner.push(preparedService);
                        }
                    });

                    // OnDemandShortCode watcher.
                    $scope.IsOnDemandCommandsMandatory = false;
                    $scope.$watch('onDemandi18nProfile.OnDemandShortCode', function (newVal, oldVal) {
                        if (!angular.equals(newVal, oldVal)) {
                            $scope.onDemandi18nProfile.OnDemandCommands = null;

                            try {
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
                                            $scope.onDemandCommandsAvailabilityMessage = $translate.instant('Subsystems.Provisioning.Services.OnDemandi18nProfile.OnDemandThisCommandAlreadyUsed', {
                                                command: onDemandCommandIntersection.join(';')
                                            });

                                            throw new Error();
                                        }
                                    }
                                });

                                // Check other services.
                                _.each($scope.servicesOfPartner, function (service) {
                                    if ($scope.service.id !== service.id) {
                                        _.each(service.onDemandi18nProfiles, function (onDemandi18nProfile) {
                                            if ($scope.onDemandi18nProfile.OnDemandShortCode === onDemandi18nProfile.OnDemandShortCode) {
                                                var onDemandCommandsArray = onDemandi18nProfile.OnDemandCommands ? onDemandi18nProfile.OnDemandCommands.toString().toLowerCase().split(';') : [];

                                                var onDemandCommandIntersection = _.intersection(onDemandCommandsArray, newValueArray);

                                                if (onDemandCommandIntersection.length > 0) {
                                                    $scope.form.OnDemandCommands.$setValidity('availabilityCheck', false);
                                                    $scope.onDemandCommandsAvailabilityMessage = $translate.instant('Subsystems.Provisioning.Services.OnDemandi18nProfile.OnDemandCommandAlreadyUsed', {
                                                        command: onDemandCommandIntersection.join(';'),
                                                        serviceName: service.name
                                                    });

                                                    throw new Error();
                                                }
                                            }
                                        });
                                    }
                                });

                                // Check other offers.
                                _.each($scope.offersOfPartner, function (offer) {
                                    _.each(offer.smsPortali18nProfiles, function (smsPortali18nProfile) {
                                        if ($scope.onDemandi18nProfile.OnDemandShortCode === smsPortali18nProfile.SubUnsubShortCode) {
                                            var subCommandsArray = smsPortali18nProfile.SubCommands ? smsPortali18nProfile.SubCommands.toString().toLowerCase().split(';') : [];
                                            var unsubCommandsArray = smsPortali18nProfile.UnsubCommands ? smsPortali18nProfile.UnsubCommands.toString().toLowerCase().split(';') : [];

                                            var subCommandIntersection = _.intersection(subCommandsArray, newValueArray);
                                            var unsubCommandIntersection = _.intersection(unsubCommandsArray, newValueArray);

                                            if (subCommandIntersection.length > 0 || unsubCommandIntersection.length > 0) {
                                                $scope.form.OnDemandCommands.$setValidity('availabilityCheck', false);
                                                $scope.onDemandCommandsAvailabilityMessage = $translate.instant('Subsystems.Provisioning.Services.OnDemandi18nProfile.OnDemandCommandAlreadyUsedByOffer', {
                                                    command: subCommandIntersection.length > 0 ? subCommandIntersection.join(';') : unsubCommandIntersection.join(';'),
                                                    offerName: offer.name
                                                });

                                                throw new Error();
                                            }
                                        }
                                    });
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
                    offersOfPartner: function (CMPFService) {
                        if ($scope.service.organization) {
                            return CMPFService.getAllOffersByOrganizationId($scope.service.organizationId, false, false, true, null, [CMPFService.SMS_PORTAL_I18N_PROFILE]);
                        } else {
                            return {offers: []};
                        }
                    },
                    servicesOfPartner: function (CMPFService) {
                        if ($scope.service.organization) {
                            return CMPFService.getAllServicesByOrganizationId($scope.service.organizationId, false, true, null, [CMPFService.SERVICE_ON_DEMAND_I18N_PROFILE]);
                        } else {
                            return {services: []};
                        }
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
