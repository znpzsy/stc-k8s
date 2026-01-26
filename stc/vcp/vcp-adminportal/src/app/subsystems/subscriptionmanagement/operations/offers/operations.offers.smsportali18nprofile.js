(function () {

    'use strict';

    angular.module('adminportal.subsystems.subscriptionmanagement.operations.offers.smsportali18nprofile', []);

    var SubscriptionManagementOperationsOffersSMSPortali18nProfileModule = angular.module('adminportal.subsystems.subscriptionmanagement.operations.offers.smsportali18nprofile');

    SubscriptionManagementOperationsOffersSMSPortali18nProfileModule.controller('SubscriptionManagementOperationsOffersSMSPortali18nProfileCtrl', function ($scope, $log, $uibModal, $filter, $translate, CMPFService) {
        $log.debug('SubscriptionManagementOperationsOffersSMSPortali18nProfileCtrl');

        $scope.shortCodeList = [];

        // SMSPortali18nProfiles managing methods.
        $scope.addSMSPortali18nProfile = function (offer) {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/subscriptionmanagement/operations/offers/operations.offers.modal.smsportali18nprofile.html',
                controller: function ($scope, $log, $uibModalInstance, shortCodeList, PROVISIONING_LANGUAGES, UtilService) {
                    $scope.offer = offer;
                    $scope.combinedOnDemandCommandsList = [];

                    // OnDemandShortCode watcher.
                    $scope.queryingCommands = false;
                    $scope.IsOnDemandCommandsMandatory = false;


                    $scope.$watch('smsPortali18nProfile.SubUnsubShortCode', function (newVal, oldVal) {

                        if (newVal && !angular.equals(newVal, oldVal)) {
                            $scope.queryingCommands = true;

                            // Get OnDemandCommands (keywords) list defined on other services & offers for availability check
                            if ($scope.smsPortali18nProfile.SubUnsubShortCode) {
                                CMPFService.getOrganizationShortcodeCommands($scope.offer.organizationId, newVal).then(function (response) {

                                    $scope.combinedOnDemandCommandsList = response.commandList;
                                    UtilService.setError($scope.form, 'SubUnsubShortCode', 'cmpfQuery', true);
                                    $scope.queryingCommands = false;

                                }, function (error) {
                                    $log.debug('Error: ', error);
                                    $scope.queryingCommands = true;

                                    UtilService.setError($scope.form, 'SubUnsubShortCode', 'cmpfQuery', false);
                                });
                            }
                        }
                    });

                    // SubCommands watcher.
                    $scope.$watch('smsPortali18nProfile.SubCommands', function (newVal, oldVal) {
                        if ($scope.form) {
                            if ($scope.form.SubCommands) {
                                $scope.form.SubCommands.$setValidity('availabilityCheck', true);
                            }

                            var newValueArray = newVal ? newVal : [];
                            var unsubOtherCommandsArray = $scope.smsPortali18nProfile.UnsubCommands ? $scope.smsPortali18nProfile.UnsubCommands : [];

                            var unsubOtherCommandIntersection = _.intersection(unsubOtherCommandsArray, newValueArray);
                            if (unsubOtherCommandIntersection.length > 0) {
                                $scope.form.SubCommands.$setValidity('availabilityCheck', false);
                                $scope.subCommandsAvailabilityMessage = $translate.instant('Subsystems.SubscriptionManagement.Operations.Offers.SMSPortali18nProfile.SubOtherCommandAlreadyUsed', {
                                    command: unsubOtherCommandIntersection.join(';'),
                                });
                            } else {
                                try {
                                    _.each(offer.smsPortali18nProfileList, function (smsPortali18nProfile) {
                                        if ($scope.smsPortali18nProfile.SubUnsubShortCode === smsPortali18nProfile.SubUnsubShortCode) {
                                            var subCommandsArray = smsPortali18nProfile.SubCommands ? smsPortali18nProfile.SubCommands.toString().toLowerCase().split(';') : [];
                                            var unsubCommandsArray = smsPortali18nProfile.UnsubCommands ? smsPortali18nProfile.UnsubCommands.toString().toLowerCase().split(';') : [];

                                            var subCommandIntersection = _.intersection(subCommandsArray, newValueArray);
                                            var unsubCommandIntersection = _.intersection(unsubCommandsArray, newValueArray);

                                            if (subCommandIntersection.length > 0 || unsubCommandIntersection.length > 0) {
                                                $scope.form.SubCommands.$setValidity('availabilityCheck', false);
                                                $scope.subCommandsAvailabilityMessage = $translate.instant('Subsystems.SubscriptionManagement.Operations.Offers.SMSPortali18nProfile.SubThisCommandAlreadyUsed', {
                                                    command: subCommandIntersection.length > 0 ? subCommandIntersection.join(';') : unsubCommandIntersection.join(';')
                                                });

                                                throw new Error();
                                            }
                                        }
                                    });

                                    // Check if onDemandCommand has already been defined on other Offers or Services:
                                    _.each($scope.combinedOnDemandCommandsList, function (commandItem) {

                                        var subUnsubCommandsArray = commandItem.command ? commandItem.command.toString().toLowerCase().split(';') : [];
                                        var subUnsubCommandsIntersection = _.intersection(subUnsubCommandsArray, newValueArray);

                                        if (subUnsubCommandsIntersection.length > 0 && commandItem.owner !== offer.name) {
                                            $scope.form.SubCommands.$setValidity('availabilityCheck', false);
                                            $scope.subCommandsAvailabilityMessage = $translate.instant('Subsystems.SubscriptionManagement.Operations.Offers.SMSPortali18nProfile.SubCommandAlreadyUsedGeneric', {
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
                        }
                    });

                    // UnsubCommands watcher.
                    $scope.$watch('smsPortali18nProfile.UnsubCommands', function (newVal, oldVal) {
                        if ($scope.form) {
                            if ($scope.form.UnsubCommands) {
                                $scope.form.UnsubCommands.$setValidity('availabilityCheck', true);
                            }

                            var newValueArray = newVal ? newVal : [];
                            var subOtherCommandsArray = $scope.smsPortali18nProfile.SubCommands ? $scope.smsPortali18nProfile.SubCommands : [];

                            var subOtherCommandIntersection = _.intersection(subOtherCommandsArray, newValueArray);
                            if (subOtherCommandIntersection.length > 0) {
                                $scope.form.UnsubCommands.$setValidity('availabilityCheck', false);
                                $scope.unsubCommandsAvailabilityMessage = $translate.instant('Subsystems.SubscriptionManagement.Operations.Offers.SMSPortali18nProfile.UnsubOtherCommandAlreadyUsed', {
                                    command: subOtherCommandIntersection.join(';'),
                                });
                            } else {
                                try {
                                    _.each(offer.smsPortali18nProfileList, function (smsPortali18nProfile) {
                                        if ($scope.smsPortali18nProfile.SubUnsubShortCode === smsPortali18nProfile.SubUnsubShortCode) {
                                            var subCommandsArray = smsPortali18nProfile.SubCommands ? smsPortali18nProfile.SubCommands.toString().toLowerCase().split(';') : [];
                                            var unsubCommandsArray = smsPortali18nProfile.UnsubCommands ? smsPortali18nProfile.UnsubCommands.toString().toLowerCase().split(';') : [];

                                            var subCommandIntersection = _.intersection(subCommandsArray, newValueArray);
                                            var unsubCommandIntersection = _.intersection(unsubCommandsArray, newValueArray);

                                            if (unsubCommandIntersection.length > 0 || subCommandIntersection.length > 0) {
                                                $scope.form.UnsubCommands.$setValidity('availabilityCheck', false);
                                                $scope.unsubCommandsAvailabilityMessage = $translate.instant('Subsystems.SubscriptionManagement.Operations.Offers.SMSPortali18nProfile.UnsubThisCommandAlreadyUsed', {
                                                    command: unsubCommandIntersection.length > 0 ? unsubCommandIntersection.join(';') : subCommandIntersection.join(';')
                                                });

                                                throw new Error();
                                            }
                                        }
                                    });

                                    // Check if onDemandCommand has already been defined on other Offers or Services:
                                    _.each($scope.combinedOnDemandCommandsList, function (commandItem) {

                                        var subUnsubCommandsArray = commandItem.command ? commandItem.command.toString().toLowerCase().split(';') : [];
                                        var subUnsubCommandsIntersection = _.intersection(subUnsubCommandsArray, newValueArray);

                                        if (subUnsubCommandsIntersection.length > 0 && commandItem.owner !== offer.name) {
                                            $scope.form.UnsubCommands.$setValidity('availabilityCheck', false);
                                            $scope.unsubCommandsAvailabilityMessage = $translate.instant('Subsystems.SubscriptionManagement.Operations.Offers.SMSPortali18nProfile.UnSubCommandAlreadyUsedGeneric', {
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
                        }
                    });

                    $scope.PROVISIONING_LANGUAGES = PROVISIONING_LANGUAGES;

                    $scope.shortCodeList = shortCodeList;

                    $scope.smsPortali18nProfile = {
                        IsDefault: false,
                        SubCommands: [],
                        UnsubCommands: []
                    };

                    $scope.save = function (smsPortali18nProfile) {
                        $uibModalInstance.close(smsPortali18nProfile);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {
                    shortCodeList: function () {
                        return $scope.shortCodeList;
                    },
                    // offersOfPartner: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    //     if ($scope.offer.organization) {
                    //         //return CMPFService.getAllOffersByOrganizationId($scope.offer.organizationId, false, false, 'ACTIVE', null);
                    //         return CMPFService.getOffersOfPartner($scope.offer.organizationId, 0, DEFAULT_REST_QUERY_LIMIT, true, true, [CMPFService.SMS_PORTAL_I18N_PROFILE]);
                    //     } else {
                    //         return {offers: []};
                    //     }
                    // },
                    // servicesOfPartner: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    //     if ($scope.offer.organization) {
                    //         //return CMPFService.getAllServicesByOrganizationId($scope.offer.organizationId, false, false, 'ACTIVE', null);
                    //         return CMPFService.getServicesOfPartner($scope.offer.organizationId, 0, DEFAULT_REST_QUERY_LIMIT, true, true, [CMPFService.SERVICE_ON_DEMAND_I18N_PROFILE]);
                    //     } else {
                    //         return {services: []};
                    //     }
                    // }
                },
                size: 'lg'
            });

            modalInstance.result.then(function (smsPortali18nProfile) {
                offer.smsPortali18nProfileList = offer.smsPortali18nProfileList || [];

                var smsPortali18nProfileItem = _.defaults({
                    profileId: _.uniqueId(),
                    SubCommands: smsPortali18nProfile.SubCommands && smsPortali18nProfile.SubCommands.length > 0 ? smsPortali18nProfile.SubCommands.join(';') : '',
                    UnsubCommands: smsPortali18nProfile.UnsubCommands && smsPortali18nProfile.UnsubCommands.length > 0 ? smsPortali18nProfile.UnsubCommands.join(';') : ''
                }, smsPortali18nProfile);

                offer.smsPortali18nProfileList.push(smsPortali18nProfileItem);
            }, function () {
                //
            });
        };
        $scope.editSMSPortali18nProfile = function (offer, smsPortali18nProfile) {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/subscriptionmanagement/operations/offers/operations.offers.modal.smsportali18nprofile.html',
                controller: function ($scope, $log, $uibModalInstance, shortCodeList, combinedOnDemandCommandsOfPartner, PROVISIONING_LANGUAGES, UtilService) {
                    $scope.offer = offer;

                    $scope.combinedOnDemandCommandsList = [];

                    _.each(combinedOnDemandCommandsOfPartner.commandList, function (command) {
                        $scope.combinedOnDemandCommandsList.push(command);
                    });

                    // OnDemandShortCode watcher.
                    $scope.queryingCommands = false;
                    $scope.IsOnDemandCommandsMandatory = false;
                    $scope.$watch('smsPortali18nProfile.SubUnsubShortCode', function (newVal, oldVal) {
                        if (newVal && !angular.equals(newVal, oldVal)) {
                            $scope.queryingCommands = true;

                            // Get OnDemandCommands (keywords) list defined on other services & offers for availability check
                            if ($scope.smsPortali18nProfile.SubUnsubShortCode) {
                                CMPFService.getOrganizationShortcodeCommands($scope.offer.organizationId, newVal).then(function (response) {

                                    $scope.combinedOnDemandCommandsList = response.commandList;
                                    UtilService.setError($scope.form, 'SubUnsubShortCode', 'cmpfQuery', true);
                                    $scope.queryingCommands = false;

                                }, function (error) {
                                    $log.debug('Error: ', error);
                                    $scope.queryingCommands = true;
                                    UtilService.setError($scope.form, 'SubUnsubShortCode', 'cmpfQuery', false);
                                });
                            }
                        }
                    });

                    // SubCommands watcher.
                    $scope.$watch('smsPortali18nProfile.SubCommands', function (newVal, oldVal) {
                        if ($scope.form) {
                            if ($scope.form.SubCommands) {
                                $scope.form.SubCommands.$setValidity('availabilityCheck', true);
                            }

                            var newValueArray = newVal ? newVal : [];
                            var unsubOtherCommandsArray = $scope.smsPortali18nProfile.UnsubCommands ? $scope.smsPortali18nProfile.UnsubCommands : [];

                            var unsubOtherCommandIntersection = _.intersection(unsubOtherCommandsArray, newValueArray);
                            if (unsubOtherCommandIntersection.length > 0) {
                                $scope.form.SubCommands.$setValidity('availabilityCheck', false);
                                $scope.subCommandsAvailabilityMessage = $translate.instant('Subsystems.SubscriptionManagement.Operations.Offers.SMSPortali18nProfile.SubOtherCommandAlreadyUsed', {
                                    command: unsubOtherCommandIntersection.join(';'),
                                });
                            } else {
                                try {
                                    _.each(offer.smsPortali18nProfileList, function (smsPortali18nProfile) {
                                        if ($scope.smsPortali18nProfile.profileId !== smsPortali18nProfile.profileId &&
                                            $scope.smsPortali18nProfile.SubUnsubShortCode === smsPortali18nProfile.SubUnsubShortCode) {
                                            var subCommandsArray = smsPortali18nProfile.SubCommands ? smsPortali18nProfile.SubCommands.toString().toLowerCase().split(';') : [];
                                            var unsubCommandsArray = smsPortali18nProfile.UnsubCommands ? smsPortali18nProfile.UnsubCommands.toString().toLowerCase().split(';') : [];

                                            var subCommandIntersection = _.intersection(subCommandsArray, newValueArray);
                                            var unsubCommandIntersection = _.intersection(unsubCommandsArray, newValueArray);

                                            if (subCommandIntersection.length > 0 || unsubCommandIntersection.length > 0) {
                                                $scope.form.SubCommands.$setValidity('availabilityCheck', false);
                                                $scope.subCommandsAvailabilityMessage = $translate.instant('Subsystems.SubscriptionManagement.Operations.Offers.SMSPortali18nProfile.SubThisCommandAlreadyUsed', {
                                                    command: subCommandIntersection.length > 0 ? subCommandIntersection.join(';') : unsubCommandIntersection.join(';')
                                                });

                                                throw new Error();
                                            }
                                        }
                                    });

                                    // Check if onDemandCommand has already been defined on other Offers or Services:
                                    _.each($scope.combinedOnDemandCommandsList, function (commandItem) {

                                        var subUnsubCommandsArray = commandItem.command ? commandItem.command.toString().toLowerCase().split(';') : [];
                                        var subUnsubCommandsIntersection = _.intersection(subUnsubCommandsArray, newValueArray);

                                        if (subUnsubCommandsIntersection.length > 0 && commandItem.owner !== offer.name) {
                                            $scope.form.SubCommands.$setValidity('availabilityCheck', false);
                                            $scope.subCommandsAvailabilityMessage = $translate.instant('Subsystems.SubscriptionManagement.Operations.Offers.SMSPortali18nProfile.SubCommandAlreadyUsedGeneric', {
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
                        }
                    });

                    // UnsubCommands watcher.
                    $scope.$watch('smsPortali18nProfile.UnsubCommands', function (newVal, oldVal) {
                        if ($scope.form) {
                            if ($scope.form.UnsubCommands) {
                                $scope.form.UnsubCommands.$setValidity('availabilityCheck', true);
                            }

                            var newValueArray = newVal ? newVal : [];
                            var subOtherCommandsArray = $scope.smsPortali18nProfile.SubCommands ? $scope.smsPortali18nProfile.SubCommands : [];

                            var subOtherCommandIntersection = _.intersection(subOtherCommandsArray, newValueArray);
                            if (subOtherCommandIntersection.length > 0) {
                                $scope.form.UnsubCommands.$setValidity('availabilityCheck', false);
                                $scope.unsubCommandsAvailabilityMessage = $translate.instant('Subsystems.SubscriptionManagement.Operations.Offers.SMSPortali18nProfile.UnsubOtherCommandAlreadyUsed', {
                                    command: subOtherCommandIntersection.join(';'),
                                });
                            } else {
                                try {
                                    _.each(offer.smsPortali18nProfileList, function (smsPortali18nProfile) {
                                        if ($scope.smsPortali18nProfile.profileId !== smsPortali18nProfile.profileId &&
                                            $scope.smsPortali18nProfile.SubUnsubShortCode === smsPortali18nProfile.SubUnsubShortCode) {
                                            var subCommandsArray = smsPortali18nProfile.SubCommands ? smsPortali18nProfile.SubCommands.toString().toLowerCase().split(';') : [];
                                            var unsubCommandsArray = smsPortali18nProfile.UnsubCommands ? smsPortali18nProfile.UnsubCommands.toString().toLowerCase().split(';') : [];

                                            var subCommandIntersection = _.intersection(subCommandsArray, newValueArray);
                                            var unsubCommandIntersection = _.intersection(unsubCommandsArray, newValueArray);

                                            if (unsubCommandIntersection.length > 0 || subCommandIntersection.length > 0) {
                                                $scope.form.UnsubCommands.$setValidity('availabilityCheck', false);
                                                $scope.unsubCommandsAvailabilityMessage = $translate.instant('Subsystems.SubscriptionManagement.Operations.Offers.SMSPortali18nProfile.UnsubThisCommandAlreadyUsed', {
                                                    command: unsubCommandIntersection.length > 0 ? unsubCommandIntersection.join(';') : subCommandIntersection.join(';')
                                                });

                                                throw new Error();
                                            }
                                        }
                                    });


                                    // Check if onDemandCommand has already been defined on other Offers or Services:
                                    _.each($scope.combinedOnDemandCommandsList, function (commandItem) {

                                        var subUnsubCommandsArray = commandItem.command ? commandItem.command.toString().toLowerCase().split(';') : [];
                                        var subUnsubCommandsIntersection = _.intersection(subUnsubCommandsArray, newValueArray);

                                        if (subUnsubCommandsIntersection.length > 0 && commandItem.owner !== offer.name) {
                                            $scope.form.UnsubCommands.$setValidity('availabilityCheck', false);
                                            $scope.unsubCommandsAvailabilityMessage = $translate.instant('Subsystems.SubscriptionManagement.Operations.Offers.SMSPortali18nProfile.UnSubCommandAlreadyUsedGeneric', {
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
                        }
                    });

                    $scope.PROVISIONING_LANGUAGES = PROVISIONING_LANGUAGES;

                    $scope.shortCodeList = shortCodeList;

                    $scope.smsPortali18nProfile = angular.copy(smsPortali18nProfile);
                    if ($scope.smsPortali18nProfile.SubCommands) {
                        $scope.smsPortali18nProfile.SubCommands = $scope.smsPortali18nProfile.SubCommands.toString();
                    }
                    if ($scope.smsPortali18nProfile.UnsubCommands) {
                        $scope.smsPortali18nProfile.UnsubCommands = $scope.smsPortali18nProfile.UnsubCommands.toString();
                    }

                    if ($scope.smsPortali18nProfile.SubCommands.indexOf('|') > -1) {
                        $scope.smsPortali18nProfile.SubCommands = $scope.smsPortali18nProfile.SubCommands.split('|');
                    } else {
                        $scope.smsPortali18nProfile.SubCommands = $scope.smsPortali18nProfile.SubCommands.split(';');
                    }
                    if ($scope.smsPortali18nProfile.UnsubCommands.indexOf('|') > -1) {
                        $scope.smsPortali18nProfile.UnsubCommands = $scope.smsPortali18nProfile.UnsubCommands.split('|');
                    } else {
                        $scope.smsPortali18nProfile.UnsubCommands = $scope.smsPortali18nProfile.UnsubCommands.split(';');
                    }

                    $scope.smsPortali18nProfileOriginal = angular.copy($scope.smsPortali18nProfile);
                    $scope.isNotChanged = function () {
                        return angular.equals($scope.smsPortali18nProfile, $scope.smsPortali18nProfileOriginal);
                    };

                    $scope.save = function (smsPortali18nProfile) {
                        $uibModalInstance.close(smsPortali18nProfile);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {
                    shortCodeList: function () {
                        return $scope.shortCodeList;
                    },
                    combinedOnDemandCommandsOfPartner: function (CMPFService) {
                        if ($scope.offer.organization) {
                            return CMPFService.getOrganizationShortcodeCommands($scope.offer.organizationId, smsPortali18nProfile.SubUnsubShortCode);
                        } else {
                            return {commandList: []};
                        }
                    }
                },
                size: 'lg'
            });

            modalInstance.result.then(function (editedSMSPortali18nProfile) {
                var foundSMSPortali18nProfile = _.findWhere(offer.smsPortali18nProfileList, {profileId: editedSMSPortali18nProfile.profileId});
                if (foundSMSPortali18nProfile) {
                    foundSMSPortali18nProfile.Language = editedSMSPortali18nProfile.Language;
                    foundSMSPortali18nProfile.IsDefault = editedSMSPortali18nProfile.IsDefault;
                    foundSMSPortali18nProfile.SubUnsubShortCode = editedSMSPortali18nProfile.SubUnsubShortCode;
                    foundSMSPortali18nProfile.SubCommands = editedSMSPortali18nProfile.SubCommands && editedSMSPortali18nProfile.SubCommands.length > 0 ? editedSMSPortali18nProfile.SubCommands.join(';') : '';
                    foundSMSPortali18nProfile.SubConfirmationMessage = editedSMSPortali18nProfile.SubConfirmationMessage;
                    foundSMSPortali18nProfile.UnsubCommands = editedSMSPortali18nProfile.UnsubCommands && editedSMSPortali18nProfile.UnsubCommands.length > 0 ? editedSMSPortali18nProfile.UnsubCommands.join(';') : '';
                    foundSMSPortali18nProfile.UnsubConfirmationMessage = editedSMSPortali18nProfile.UnsubConfirmationMessage;
                }
            }, function () {
            });
        };
        $scope.removeSMSPortali18nProfile = function (offer, smsPortali18nProfile) {
            var index = _.indexOf(offer.smsPortali18nProfileList, smsPortali18nProfile);
            if (index !== -1) {
                offer.smsPortali18nProfileList.splice(index, 1);
            }
        };
        $scope.getSMSPortali18nProfileString = function (smsPortali18nProfile) {
            var languageStr = smsPortali18nProfile.Language ? $translate.instant('Languages.' + smsPortali18nProfile.Language) : 'N/A';

            var resultStr = 'Lang.: ' + languageStr;

            if (smsPortali18nProfile.SubUnsubShortCode) {
                resultStr += ', Sub. Unsub. Short Code: ' + smsPortali18nProfile.SubUnsubShortCode;
            }
            if (smsPortali18nProfile.SubCommands) {
                resultStr += ', Sub. Commands: ' + smsPortali18nProfile.SubCommands;
            }
            if (smsPortali18nProfile.SubConfirmationMessage) {
                resultStr += ', Sub. Confirmation Message: ' + smsPortali18nProfile.SubConfirmationMessage;
            }
            if (smsPortali18nProfile.UnsubCommands) {
                resultStr += ', Unsub. Commands: ' + smsPortali18nProfile.UnsubCommands;
            }
            if (smsPortali18nProfile.UnsubConfirmationMessage) {
                resultStr += ', Unsub. Confirmation Message: ' + smsPortali18nProfile.UnsubConfirmationMessage;
            }

            return resultStr;
        };

    });

})();
