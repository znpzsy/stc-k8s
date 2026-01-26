(function () {
    'use strict';

    /* Services */
    angular.module('Application.services', []);

    var ApplicationServices = angular.module('Application.services');

    // Utility Services
    ApplicationServices.factory('UtilService', function ($window, $log, notification, $translate, $timeout,
                                                         CCPortalMainPromiseTracker, cfpLoadingBar) {
        var calculateDaysAgo = function (dayCount) {
            return moment().startOf('day').subtract(dayCount, 'days').toDate();
        };

        return {
            COUNTRY_CODE: "966",
            SESSION_KEY: '_sa_mb_vcp_c_sk',
            USERNAME_KEY: '_sa_mb_vcp_c_un',
            SITE_INFORMATION_KEY: '_sa_mb_vcp_c_si',
            MSISDN_KEY: '_sa_mb_vcp_c_mk',
            LATEST_STATE: '_sa_mb_vcp_c_lst',
            USER_RIGHTS: '_sa_mb_vcp_c_ur',
            CMPF_SUBSCRIBER_KEY: '_sa_mb_vcp_c_csk',
            SUBSCRIBER_PROFILE_KEY: '_sa_mb_vcp_c_spk',
            USER_ORGANIZATION_KEY: '_sa_mb_vcp_c_uok',
            USER_ORGANIZATION_ID_KEY: '_sa_mb_vcp_c_uoik',
            USER_ORGANIZATION_NAME_KEY: '_sa_mb_vcp_c_onk',
            USER_ADMIN_KEY: '_sa_mb_vcp_c_uak',
            // Created with this command: node -e "console.log(require('crypto').randomBytes(32).toString('hex'));"
            FRANZ_LISZT: "602beb2435b48b18b54030ac1a8847c29f2a67d1c8a2cae31a12101d2ffc1943",
            Validators: {
                Msisdn: /^[0-9]{0,15}$/,
                ScreeningListValidPhoneNumber: /^[0-9]{1,30}(\*){0,1}$/,
                IntegerNumber: /^[0-9]+$/
            },
            getCurrentNanoTime: function () {
                return (new Date()).getTime();
            },
            getOneWeekAgo: function () {
                return calculateDaysAgo(7);
            },
            getOneDayAgo: function () {
                return calculateDaysAgo(1);
            },
            getTodayBegin: function () {
                return moment().startOf('day').toDate();
            },
            getTodayEnd: function () {
                return moment().endOf('day').toDate();
            },
            calculateDate: function (date, hour, minute) {
                var dateObj = new Date(date);
                dateObj.setHours(hour, minute, 0, 0);
                return dateObj;
            },
            showDummySpinner: function () {
                cfpLoadingBar.start();
                cfpLoadingBar.inc();
            },
            hideDummySpinner: function () {
                cfpLoadingBar.complete();
            },
            getFromSessionStore: function (key) {
                var objectCipherText = $window.localStorage.getItem(key);
                if (_.isEmpty(objectCipherText))
                    return {};

                // Decrypt
                try {
                    var bytes = CryptoJS.AES.decrypt(objectCipherText, this.FRANZ_LISZT);
                    var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

                    return decryptedData;
                } catch (error) {
                    return {};
                }
            },
            putToSessionStore: function (key, object) {
                var jsonStringOfObj = JSON.stringify(object);

                // Encrypt
                var objectCipherText = CryptoJS.AES.encrypt(jsonStringOfObj, this.FRANZ_LISZT);

                $window.localStorage.setItem(key, objectCipherText.toString());
            },
            removeFromSessionStore: function (key) {
                $window.localStorage.removeItem(key);
            },
            msisdnWithoutCountryCode: function (msisdn) {
                if (msisdn && msisdn.length > 8) {
                    var searchWord = this.COUNTRY_CODE;

                    if (msisdn.startsWith('0' + searchWord)) {
                        searchWord = '0' + searchWord;
                    } else if (msisdn.startsWith('00' + searchWord)) {
                        searchWord = '00' + searchWord;
                    } else if (msisdn.startsWith('+' + searchWord)) {
                        searchWord = '\\+' + searchWord;
                    }

                    msisdn = msisdn.replace(new RegExp(searchWord), '');
                }

                return msisdn;
            },
            getSubscriberMsisdn: function () {
                var _self = this;

                var subscriberAttributes = _self.getFromSessionStore(_self.SUBSCRIBER_PROFILE_KEY);
                var msisdn = subscriberAttributes.msisdn;

                return msisdn;
            },
            injectStringIntoAText: function (text, string, position) {
                if (!_.isEmpty(text) && !_.isEmpty(text)) {
                    text = text.substr(0, position) + string + text.substr(position);
                }
                return text;
            },
            convertPeriodStringToHumanReadable: function (string) {
                var periodAndTime = s.words(s.words(string, 'P'), 'T');
                var period = periodAndTime[0];
                var year = s.toNumber(s.strLeft(period, 'Y'));
                var month = s.toNumber(s.strLeft(s.strRight(period, 'Y'), 'M'));
                var day = s.toNumber(s.strLeft(s.strRight(period, 'M'), 'D'));

                var time = periodAndTime[1];
                var hour = s.toNumber(s.strLeft(time, 'H'));
                var minute = s.toNumber(s.strLeft(s.strRight(time, 'H'), 'M'));
                var second = s.toNumber(s.strLeft(s.strRight(time, 'M'), 'S'));

                var text = '';
                text += (year !== 0) ? year + ' ' + $translate.instant('Period.Year') + (year > 1 ? 's' : '') : '';
                text += (month !== 0) ? month + ' ' + $translate.instant('Period.Month') + (month > 1 ? 's' : '') : '';
                text += (day !== 0) ? day + ' ' + $translate.instant('Period.Day') + (day > 1 ? 's' : '') : '';
                text += (hour !== 0) ? hour + ' ' + $translate.instant('Period.Hour') + (hour > 1 ? 's' : '') : '';
                text += (minute !== 0) ? minute + ' ' + $translate.instant('Period.Minute') + (minute > 1 ? 's' : '') : '';
                text += (second !== 0) ? second + ' ' + $translate.instant('Period.Second') + (second > 1 ? 's' : '') : '';

                return text === '' ? '0 ' + $translate.instant('Period.Day') : text;
            },
            escapeRegExp: function (text) {
                return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\\\$&');
            },
            setError: function (form, fieldName, validation, validationValue) {
                form[fieldName].$dirty = true;
                form[fieldName].$setValidity(validation, validationValue);
            },
            removeReservedCharacters: function (text) {
                text = text.replace(/\+/g, '');
                text = text.replace(/\-/g, '');
                text = text.replace(/\&/g, '');
                text = text.replace(/\|/g, '');
                text = text.replace(/\!/g, '');
                text = text.replace(/\(/g, '');
                text = text.replace(/\)/g, '');
                text = text.replace(/\{/g, '');
                text = text.replace(/\}/g, '');
                text = text.replace(/\[/g, '');
                text = text.replace(/\]/g, '');
                text = text.replace(/\^/g, '');
                text = text.replace(/\"/g, '');
                text = text.replace(/\~/g, '');

                if (text !== "*")
                    text = text.replace(/\*/g, '');

                text = text.replace(/\?/g, '');
                text = text.replace(/\:/g, '');
                text = text.replace(/\\/g, '');
                text = text.replace(/\//g, '');

                return text;
            },
            addPromiseToTracker: function (promise, promiseTracker) {
                if (_.isUndefined(promiseTracker))
                    CCPortalMainPromiseTracker.addPromise(promise);
                else
                    promiseTracker.addPromise(promise);
            },
            parseJwt: function (token) {
                var base64Url = token.split('.')[1];
                var base64 = base64Url.replace('-', '+').replace('_', '/');

                return JSON.parse(atob(base64));
            },
            showResponseErrorNotification: function (response) {
                var serviceLabel = response.config ? response.config.headers.ServiceLabel : 'N/A';

                $translate("CommonMessages.ServerError", {
                    status: response.status,
                    message: response.statusText + (serviceLabel ? ' (' + serviceLabel + ')' : '')
                }).then(function (message) {
                    notification({
                        type: 'warning',
                        text: message
                    });
                });
            }
        };
    });

    ApplicationServices.factory('FileDownloadService', function ($log, $q, $window, $timeout, SERVICES_BASE, SessionService, UtilService) {
        return {
            extractFileNameFromContentDisposition: function (contentDisposition) {
                var filename = '';

                if (contentDisposition && (contentDisposition.indexOf('inline') !== -1 || contentDisposition.indexOf('attachment') !== -1)) {
                    var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    var matches = filenameRegex.exec(contentDisposition);
                    if (matches != null && matches[1]) {
                        filename = matches[1].trim().replace(/UTF-8|\'|\"/g, '');
                    }
                }

                return filename;
            },
            downloadFile: function (url, callback) {
                var _self = this;

                var sessionKey = SessionService.getSessionKey();

                var xhr = new XMLHttpRequest();
                xhr.open('GET', SERVICES_BASE + url, true);
                xhr.setRequestHeader("Authorization", 'Bearer ' + sessionKey.token);
                xhr.setRequestHeader("Channel", 'CC ');
                xhr.setRequestHeader("Username", SessionService.getUsername());
                xhr.setRequestHeader("TransactionId", new Date().getTime());
                xhr.setRequestHeader("ServiceLabel", 'Download Service');
                xhr.responseType = "blob";
                xhr.onreadystatechange = function () {
                    if (callback && (this.readyState == this.DONE)) {
                        if (this.status === 200) {
                            var contentDisposition = this.getResponseHeader('content-disposition');
                            var fileName = _self.extractFileNameFromContentDisposition(contentDisposition);

                            callback(this.response, fileName);
                        } else {
                            callback(this.response, '');
                        }
                    }
                };
                xhr.send(null);
            }
        }
    });

    ApplicationServices.factory('ReportingExportService', function ($log, $rootScope, $window, $timeout, $translate, notification, FileDownloadService, UtilService) {
        return {
            showReport: function (srcUrl, formatName) {
                var htmlName = 'partials/report.html';
                if (formatName !== 'HTML') {
                    htmlName = 'partials/download.html';
                }

                UtilService.showDummySpinner();

                FileDownloadService.downloadFile(srcUrl, function (blob, fileName) {
                    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                        window.navigator.msSaveOrOpenBlob(blob, fileName);
                    } else {
                        var _URL = $window.URL || $window.webkitURL || $window.mozURL;
                        var url = _URL.createObjectURL(blob);

                        var win = $window.open(htmlName += '?url=' + encodeURIComponent(url));

                        if (!win || win.closed || typeof win.closed == 'undefined') {
                            // Pup-up Blocked
                            notification({
                                type: 'warning',
                                text: $translate.instant('CommonMessages.PopupBlockerDetected')
                            });

                            return;
                        }

                        if (formatName === 'HTML') {
                            // Do nothing if HTML
                        } else if (formatName === 'CSV' || formatName === 'MS EXCEL' || formatName === 'XLS' || formatName === 'WAV') {
                            if (formatName === 'WAV' && blob.type === 'text/html') {
                                notification({
                                    type: 'warning',
                                    text: $translate.instant('CommonMessages.GenericServerError')
                                });

                                // Close the download window if any error occurred.
                                $timeout(function () {
                                    UtilService.hideDummySpinner();
                                    win.close();
                                }, 100);
                            } else {
                                var onload = function (e) {
                                    $timeout(function () {
                                        // Construct an <a> element and give the url to it to be able to give filename
                                        // to the file which want to be downloaded.
                                        var link = win.document.createElement("a");
                                        link.download = fileName;
                                        link.href = url;
                                        win.document.body.appendChild(link);
                                        link.click();

                                        $timeout(function () {
                                            UtilService.hideDummySpinner();

                                            // Close the download window after download modal window has appeared.
                                            win.close();
                                        }, 200);
                                    }, 1000);
                                };

                                angular.element(win).bind('load', onload);
                            }
                        } else {
                            $timeout(function () {
                                UtilService.hideDummySpinner();

                                win.location = url;
                            }, 1000);
                        }

                        // Revoke the url after 3 minutes.
                        $timeout(function () {
                            // Add this url to the url revoke queue.
                            _URL.revokeObjectURL(url);
                        }, 3 * 60 * 1000);
                    }
                });
            }
        };
    });

    ApplicationServices.factory('NgTableService', function ($log, $translate) {
        return {
            filterList: function (filterText, columns, list) {
                var filteredListData;

                if (_.isEmpty(filterText)) {
                    filteredListData = list;
                } else {
                    filteredListData = _.filter(list, function (obj) {
                        for (var i in columns) {
                            // Use {translate} prefix in order to search in translations.
                            var propName = columns[i].split('{translate}');
                            var propValue;
                            try {
                                if (propName.length > 1) {
                                    propValue = $translate.instant(eval('obj.' + propName[1]));
                                } else {
                                    // For evaluating nested object properties like "property.name".
                                    propValue = eval('obj.' + propName[0]);
                                }
                            } catch (e) {
                                // ignore
                            }

                            if (typeof propValue !== 'undefined') {
                                // `~` with `indexOf` means "contains"
                                // `toLowerCase` to discard case of question string
                                var matched = ~String(propValue).toLowerCase().indexOf(filterText.toLowerCase());

                                if (matched)
                                    return true;
                            }
                        }

                        return false;
                    });
                }

                return filteredListData;
            }
        };
    });

    ApplicationServices.service('SessionService', function ($log, $window, $http, $rootScope, $timeout, $state, UtilService, RESOURCE_NAME) {
        return {
            getSessionKey: function () {
                var sessionKey = UtilService.getFromSessionStore(UtilService.SESSION_KEY);

                return sessionKey;
            },
            getUsername: function () {
                var username = UtilService.getFromSessionStore(UtilService.USERNAME_KEY);

                return username;
            },
            getMsisdn: function () {
                var msisdn = UtilService.getFromSessionStore(UtilService.MSISDN_KEY);

                return msisdn;
            },
            subscriberProfile: function () {
                var subscriberProfile = UtilService.getFromSessionStore(UtilService.SUBSCRIBER_PROFILE_KEY);

                return subscriberProfile;
            },
            getSubscriberState: function () {
                var subscriberProfile = UtilService.getFromSessionStore(UtilService.SUBSCRIBER_PROFILE_KEY);

                return subscriberProfile.state;
            },
            getSessionUserRights: function () {
                var userRights = UtilService.getFromSessionStore(UtilService.USER_RIGHTS);

                return userRights;
            },
            setResourceNameHeader: function () {
                $http.defaults.headers.common.ResourceName = RESOURCE_NAME;
            },
            setAuthorizationHeader: function (token) {
                $http.defaults.headers.common.Authorization = 'Bearer ' + token;
            },
            saveUserAttributesInSession: function (username, authenticateResponse) {
                this.setAuthorizationHeader(authenticateResponse.token);

                UtilService.putToSessionStore(UtilService.SESSION_KEY, authenticateResponse);
                UtilService.putToSessionStore(UtilService.USERNAME_KEY, username);
            },
            getSiteInformation: function () {
                var siteInformation = UtilService.getFromSessionStore(UtilService.SITE_INFORMATION_KEY);

                return siteInformation;
            },
            isSessionValid: function () {
                // Check the session key, username and user rights only to be sure there is a valid session. The portal will be
                // used the tokens that saved in the session key to be able to go to the restful services.
                return !_.isEmpty(this.getSessionKey()) && !_.isEmpty(this.getUsername()) && !_.isEmpty(this.getSessionUserRights());
            },
            logout: function () {
                angular.element(document.querySelector('body')).addClass('hidden');

                this.sessionInvalidate();

                $timeout(function () {
                    $window.location.href = 'app.html#!/login';
                    $window.location.reload(true);
                }, 0);
            },
            cleanValues: function () {
                UtilService.removeFromSessionStore(UtilService.SESSION_KEY);
                UtilService.removeFromSessionStore(UtilService.USERNAME_KEY);
                UtilService.removeFromSessionStore(UtilService.SITE_INFORMATION_KEY);
                UtilService.removeFromSessionStore(UtilService.MSISDN_KEY);
                UtilService.removeFromSessionStore(UtilService.USER_RIGHTS);
                UtilService.removeFromSessionStore(UtilService.CMPF_SUBSCRIBER_KEY);
                UtilService.removeFromSessionStore(UtilService.SUBSCRIBER_PROFILE_KEY);
                UtilService.removeFromSessionStore(UtilService.USER_ORGANIZATION_KEY);
                UtilService.removeFromSessionStore(UtilService.USER_ORGANIZATION_ID_KEY);
                UtilService.removeFromSessionStore(UtilService.USER_ORGANIZATION_NAME_KEY);
                UtilService.removeFromSessionStore(UtilService.USER_ADMIN_KEY);
            },
            sessionInvalidate: function () {
                delete $http.defaults.headers.common.Authorization;

                this.cleanValues();
            }
        };
    });

    // Server Configuration and Information Services
    ApplicationServices.factory('ServerConfigurationService', function ($log, $q, ServerInformationRestangular, UtilService) {
        return {
            // The methods which gets data from the free zone.
            getSiteInformation: function (promiseTracker) {
                var promise = ServerInformationRestangular.one('site.json?' + UtilService.getCurrentNanoTime()).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            }
        };
    });

    // CMPF Cache Services
    ApplicationServices.factory('CMPFCacheService', function ($log, $q, CMPFCacheRestangular, UtilService, PROVISIONING_PAYMENT_TYPES) {
        return {
            prepareSubscriberProfile: function (subscriber) {
                var subscriberProfile = angular.copy(subscriber);

                subscriberProfile.languageLabel = subscriberProfile.language ? 'Languages.' + subscriberProfile.language : 'CommonLabels.N/A';

                var paymentTypeAttr = _.findWhere(subscriberProfile.attributes, {name: 'PaymentType'});
                if (paymentTypeAttr) {
                    subscriberProfile.paymentTypeLabel = _.findWhere(PROVISIONING_PAYMENT_TYPES, {cmpf_value: Number(paymentTypeAttr.value)}).label;
                } else {
                    subscriberProfile.paymentTypeLabel = 'CommonLabels.N/A';
                }

                return subscriberProfile;
            },
            getSubscriber: function (msisdn) {
                var _self = this;

                var deferredFindSubscriber = $q.defer();

                var prom = CMPFCacheRestangular.one(msisdn).get();
                prom.then(function (response) {
                    // If there is no subscriber with specified MSISDN
                    if (_.isEmpty(response) || (response && response.state === 'INACTIVE') || (response && !response.msisdn)) {
                        $log.debug('Subscriber not found with the msisdn: ', msisdn);

                        deferredFindSubscriber.reject(response);
                    } else { // Found a subscriber as per specified MSISDN and put it to the session store.
                        $log.debug('Subscriber found by the msisdn: ', msisdn, ', Response: ', response);

                        var subscriberProfile = _self.prepareSubscriberProfile(response);
                        $log.debug('Prepared subscriber profile for the msisdn: ', msisdn, ', SubscriberProfile: ', subscriberProfile);

                        // Here is writing application styled json object to the current session
                        UtilService.putToSessionStore(UtilService.SUBSCRIBER_PROFILE_KEY, subscriberProfile);

                        deferredFindSubscriber.resolve(subscriberProfile);
                    }
                }, function (response) {
                    $log.debug('Error: ', response);

                    deferredFindSubscriber.reject(response);
                });

                UtilService.addPromiseToTracker(deferredFindSubscriber.promise);

                return deferredFindSubscriber.promise;
            }
        };
    });

    // Subscriber Service
    ApplicationServices.factory('SubscriberService', function ($log, UtilService, SubscriberRestangular) {
        return {
            getSubsciptions: function (msisdn) {
                var promise = SubscriberRestangular.one('subscription/' + msisdn).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        };
    });

    // CMPF Services
    ApplicationServices.factory('CMPFService', function ($log, $q, $filter, UtilService, CMPFAuthRestangular, CMPFRestangular, DEFAULT_REST_QUERY_LIMIT, CURRENCY) {
        return {
            DEFAULT_ORGANIZATION_NAME: "Mobily",
            // Subscriber related profiles
            SUBSCRIBER_PROFILE: 'SubscriberProfile',
            // User related profiles
            RELATED_RESOURCES: ['VCP Customer Care Portal'],
            // Predefined group and user names
            VCP_ADMIN_GROUP: 'admin',
            // Methods
            showApiError: function (response) {
                var type = 'warning', message;

                if (response) {
                    if (response.errorDescription) {
                        message = response.errorDescription.split(':')[0] + '...';
                    } else if (response.data) {
                        if (response.data.errorDescription) {
                            message = response.data.errorDescription.split(':')[0] + '...';
                        } else {
                            type = 'danger';
                            message = $translate.instant('CommonMessages.ApiError');
                        }
                    }
                }

                if (message) {
                    notification({
                        type: type,
                        text: message
                    });
                }
            },
            // Authentication
            authenticate: function (credential) {
                var authenticateProm = CMPFAuthRestangular.all('authenticate').post(credential);
                UtilService.addPromiseToTracker(authenticateProm);
                return authenticateProm;
            },
            refreshToken: function (refreshToken) {
                var refreshTokenProm = CMPFAuthRestangular.all('refresh-token').customGET(null, null, {
                    Authorization: 'Bearer ' + refreshToken
                });
                UtilService.addPromiseToTracker(refreshTokenProm);
                return refreshTokenProm;
            },
            // All Organizations without specifying type
            getAllOrganizations: function (offset, limit, withProfile) {
                var url = 'organizations?offset=' + offset + '&limit=' + limit;
                if (withProfile) {
                    url += '&withprofiles=true';
                }

                var prom = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(prom);

                return prom;
            },
            // Only Network Operators
            getAllOperators: function (offset, limit, withProfile) {
                var url = 'organizations?offset=' + offset + '&limit=' + limit + '&type=NetworkOperator';
                if (withProfile) {
                    url += '&withprofiles=true';
                }

                var prom = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(prom);

                return prom;
            },
            // Partner (service provider)
            getPartner: function (id, withprofiles) {
                var url = 'partners/' + id + '?withprofiles=' + withprofiles;

                var prom = CMPFRestangular.one(url).get();

                UtilService.addPromiseToTracker(prom);

                return prom;
            },
            getAllPartners: function (offset, limit, withProfile, promiseTracker) {
                var url = 'partners?offset=' + offset + '&limit=' + limit;
                if (withProfile) {
                    url += '&withprofiles=true';
                }

                var prom = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(prom, promiseTracker);

                return prom;
            },
            // Services
            getServices: function (offset, limit, withchildren, withprofiles, promiseTracker) {
                var prom = CMPFRestangular.one('services?withchildren=' + withchildren + '&withprofiles=' + withprofiles + '&offset=' + offset + '&limit=' + limit).get();

                UtilService.addPromiseToTracker(prom, promiseTracker);

                return prom;
            },
            getServiceByName: function (name, withchildren, withprofiles) {
                var prom = CMPFRestangular.one('services?name=' + name + '&withchildren=' + withchildren + '&withprofiles=' + withprofiles).get();

                UtilService.addPromiseToTracker(prom);

                return prom;
            },
            getServicesByCategory: function (offset, limit, category, promiseTracker) {
                var prom = CMPFRestangular.one('services?withchildren=true&withprofiles=true&offset=' + offset + '&limit=' + limit + '&profileDefName=Service Profile&Category=' + category).get();

                UtilService.addPromiseToTracker(prom, promiseTracker);

                return prom;
            },
            getTopTenServices: function (offset, limit, withchildren, withprofiles) {
                var prom = CMPFRestangular.one('services?profileDefName=ServiceCategoryProfile&topTenService=true&withchildren=' + withchildren + '&withprofiles=' + withprofiles + '&offset=' + offset + '&limit=' + limit).get();

                UtilService.addPromiseToTracker(prom);

                return prom;
            },
            // Offers
            getOffers: function (offset, limit, withchildren, withprofiles, promiseTracker) {
                var prom = CMPFRestangular.one('offers?withchildren=' + withchildren + '&withprofiles=' + withprofiles + '&offset=' + offset + '&limit=' + limit).get();
                UtilService.addPromiseToTracker(prom, promiseTracker);

                return prom;
            },
            getActiveOffers: function (offset, limit, withchildren, withprofiles) {
                var prom = CMPFRestangular.one('offers?state=ACTIVE&withchildren=' + withchildren + '&withprofiles=' + withprofiles + '&offset=' + offset + '&limit=' + limit).get();
                UtilService.addPromiseToTracker(prom);

                return prom;
            },
            getActiveOffersByService: function (offset, limit, serviceName, withchildren, withprofiles, promiseTracker) {
                var prom = CMPFRestangular.one('offers?state=ACTIVE&withchildren=' + withchildren + '&withprofiles=' + withprofiles + '&offset=' + offset + '&limit=' + limit + '&serviceName=' + serviceName).get();
                UtilService.addPromiseToTracker(prom, promiseTracker);

                return prom;
            },
            findOfferByName: function (offerName) {
                var activeOffersByServiceProm = CMPFRestangular.one('offers?withchildren=true&withprofiles=true&name=' + offerName).get();
                UtilService.addPromiseToTracker(activeOffersByServiceProm);

                return activeOffersByServiceProm;
            },
            // User accounts
            getUserAccounts: function (offset, limit, withProfile, promiseTracker) {
                var url = 'useraccounts?withchildren=true&offset=' + offset + '&limit=' + limit;
                if (withProfile) {
                    url += '&withprofiles=true';
                }

                var prom = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(prom, promiseTracker);
                return prom;
            },
            getUserAccount: function (id, withProfile, promiseTracker) {
                var url = 'useraccounts/' + id + '?withchildren=true';
                if (withProfile) {
                    url += '&withprofiles=true';
                }

                var prom = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(prom, promiseTracker);
                return prom;
            },
            getUserAccountRights: function (id) {
                var _self = this;
                var deferred = $q.defer()

                UtilService.addPromiseToTracker(deferred.promise);

                CMPFRestangular.one('useraccounts/' + id + '/rights').get().then(function (response) {
                    if (response) {
                        response = _.filter(response, function (right) {
                            return _.contains(_self.RELATED_RESOURCES, right.resourceName);
                        });
                    }

                    deferred.resolve(response);
                }, function (response) {
                    deferred.reject(response);
                });

                return deferred.promise;
            },
            getUserAccountGroups: function (userId, withchildren, withprofiles) {
                var promise = CMPFRestangular.one('useraccounts/' + userId + '/usergroups?withchildren=' + withchildren + '&withprofiles=' + withprofiles).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Profile operations
            getOrphanProfilesByProfileDefName: function (profileDefName, withchildren) {
                var url = 'profiles/orphan?profileDefName=' + profileDefName;
                if (withchildren) {
                    url += '&withchildren=true';
                }

                var prom = CMPFRestangular.one(url).get();

                UtilService.addPromiseToTracker(prom);

                return prom;
            },
            findProfileByName: function (profiles, profileName) {
                return _.findWhere(profiles, {profileDefinitionName: profileName});
            },
            findProfilesByName: function (profiles, profileName) {
                return _.where(profiles, {profileDefinitionName: profileName});
            },
            getProfileAttributes: function (profileList, profileName) {
                var array = [];

                var profiles = _.where(profileList, {name: profileName});
                angular.forEach(profiles, function (profile) {
                    var obj = {};
                    angular.forEach(profile.attributes, function (attribute) {
                        var value;
                        if (attribute.listValues && attribute.listValues.length > 0) {
                            var value = $filter('orderBy')(attribute.listValues, ['value']);
                        } else {
                            value = attribute.value;
                            if (!_.isEmpty(value) && !_.isUndefined(value)) {
                                var numValue = Number(value);
                                if (!isNaN(numValue)) {
                                    if ((value.length > 1 && !value.startsWith('0')) || (value.length === 1) || value.includes(',') || value.includes('.')) {
                                        value = numValue;
                                    }
                                } else if (value === 'true' || value === 'false') {
                                    value = s.toBoolean(value);
                                }
                            }
                        }

                        obj[attribute.name] = value;
                    });

                    obj.profileId = profile.id;

                    array.push(obj);
                });

                return array;
            }
        };
    });

    // Screening Manager Services
    ApplicationServices.factory('ScreeningManagerService', function ($log, ScreeningManagerRestangular, ScreeningManagerStatsRestangular, Restangular, notification, $translate, UtilService) {
        var CHANNEL_TYPE = 3; // 1: SMS, 2: USSD, 3: CC, 4: Third Party, 5: IVR

        return {
            scopes: {
                // Main service scopes
                GLOBAL_SCOPE_KEY: 'global',
                COC_SCOPE_KEY: 'cc'
            },
            errorCodes: {
                AUTHORIZATION_FAILED: 3001,
                API_NOT_SUPPORTED: 3011,
                STORAGE_ERROR: 3021,
                QUOTA_ERROR: 3031,
                WRONG_REQUEST_ERROR: 3041,
                SERVICE_NOT_FOUND: 3051,
                SCOPE_NOT_FOUND: 3061
            },
            getDefaultModeTypeByScope: function () {
                var defaultModeType = 'RejectBlackList';

                return defaultModeType;
            },
            getScopeByScopeKey: function (scopeKey, msisdn) {
                var scopePromise = ScreeningManagerRestangular.one(CHANNEL_TYPE + '/' + scopeKey + '/screenings/' + msisdn + '/' + scopeKey).get();
                UtilService.addPromiseToTracker(scopePromise);

                return scopePromise;
            },
            deleteListItem: function (scopeKey, $listObj, msisdn, screenableEntryId) {
                var requestUri = CHANNEL_TYPE + '/' + scopeKey + '/screenings/' + msisdn + '/' + scopeKey + '/' + $listObj.listkey + '/' + screenableEntryId;
                var scopeDeleteListItemPromise = ScreeningManagerRestangular.one(requestUri).remove();
                UtilService.addPromiseToTracker(scopeDeleteListItemPromise);

                return scopeDeleteListItemPromise;
            },
            addNewListItem: function (scopeKey, $listObj, msisdn, listItem) {
                var screeningRequest = {
                    "screeningRequest": {
                        "screenableEntry": [listItem],
                        "requestCorrelator": new Date().getTime()
                    }
                };

                var requestUri = CHANNEL_TYPE + '/' + scopeKey + '/screenings/' + msisdn + '/' + scopeKey + '/' + $listObj.listkey;
                var scopeAddItemToListPromise = ScreeningManagerRestangular.all(requestUri).post(screeningRequest);
                UtilService.addPromiseToTracker(scopeAddItemToListPromise);

                return scopeAddItemToListPromise;
            },
            updateScreeningMode: function (scopeKey, msisdn, screeningMode) {
                var screeningModeRequest = {
                    screeningMode: {
                        screeningModeType: screeningMode.modeType
                    }
                };

                if (screeningMode.timeConstraintAvailable) {
                    if (screeningMode.timeConstraintType === 'absolute') {
                        var startDateIso = $filter('date')(screeningMode.absolute.startDate, 'yyyy-MM-dd\'T\'HH:mm:ss' + DateTimeConstants.OFFSET);
                        startDateIso = UtilService.injectStringIntoAText(startDateIso, ':', startDateIso.length - 2);

                        var endDateIso = $filter('date')(screeningMode.absolute.endDate, 'yyyy-MM-dd\'T\'HH:mm:ss' + DateTimeConstants.OFFSET);
                        endDateIso = UtilService.injectStringIntoAText(endDateIso, ':', endDateIso.length - 2);

                        screeningModeRequest.screeningMode.absoluteTimeConstraint = {
                            activated: screeningMode.absolute.active,
                            startDate: startDateIso,
                            endDate: endDateIso
                        };
                    } else if (screeningMode.timeConstraintType === 'recurring') {
                        var startTime = $filter('date')(screeningMode.recurring.startTime, 'HH:mm');
                        var endTime = $filter('date')(screeningMode.recurring.endTime, 'HH:mm');

                        var daysOfWeek = _.filter(screeningMode.recurring.daysOfWeek, function (dayVal) {
                            return dayVal !== 0;
                        });

                        var masks = [];
                        if (!_.isEmpty(screeningMode.recurring.masks)) {
                            if (screeningMode.recurring.masks.daysOfWeek)
                                masks.push("DayOfWeek");

                            if (screeningMode.recurring.masks.hoursOfDay) {
                                masks.push("HourOfDay");
                            } else {
                                startTime = '00:00';
                                endTime = '23:59';
                            }
                        }

                        screeningModeRequest.screeningMode.recurringTimeConstraint = {
                            activated: screeningMode.recurring.active,
                            startTime: startTime,
                            endTime: endTime,
                            daysOfWeek: daysOfWeek,
                            masks: masks,
                            timeExcluded: screeningMode.recurring.timeExcluded
                        };
                    }
                }

                $log.debug('Screening mode update request body: ', screeningModeRequest);

                var requestUri = CHANNEL_TYPE + '/' + scopeKey + '/screenings/' + msisdn + '/' + scopeKey + '/modes';
                var screeningModeUpdatePromise = ScreeningManagerRestangular.all(requestUri).post(screeningModeRequest);
                UtilService.addPromiseToTracker(screeningModeUpdatePromise);

                return screeningModeUpdatePromise;
            }
        };
    });

    // SMSC Services
    var SmscOperationService = ['$log', 'SmscOperationRestangular', 'SmscRemoteOperationRestangular', 'SmscSenderApplicationRestangular', 'SmscRemoteSenderApplicationRestangular', 'UtilService',
        function ($log, SmscOperationRestangular, SmscRemoteOperationRestangular, SmscSenderApplicationRestangular, SmscRemoteSenderApplicationRestangular, UtilService) {
            return {
                resendMessage: function (message, promiseTracker) {
                    var promise = SmscSenderApplicationRestangular.all('').customPUT(message);
                    UtilService.addPromiseToTracker(promise, promiseTracker);

                    return promise;
                },
                deleteBySMSTicket: function (messageId, promiseTracker) {
                    var promise = SmscOperationRestangular.all('sfe/delete-by-sms-ticket?smsTicket=' + messageId).remove();
                    UtilService.addPromiseToTracker(promise, promiseTracker);

                    return promise;
                },
                sendNowBySMSTicket: function (messageId, promiseTracker) {
                    var promise = SmscOperationRestangular.all('sfe/send-now-by-sms-ticket?smsTicket=' + messageId).customPUT({});
                    UtilService.addPromiseToTracker(promise, promiseTracker);

                    return promise;
                },
                // Remote
                resendMessageRemote: function (message, promiseTracker) {
                    var promise = SmscRemoteSenderApplicationRestangular.all('').customPUT(message);
                    UtilService.addPromiseToTracker(promise, promiseTracker);

                    return promise;
                },
                deleteBySMSTicketRemote: function (messageId, promiseTracker) {
                    var promise = SmscRemoteOperationRestangular.all('sfe/delete-by-sms-ticket?smsTicket=' + messageId).remove();
                    UtilService.addPromiseToTracker(promise, promiseTracker);

                    return promise;
                },
                sendNowBySMSTicketRemote: function (messageId, promiseTracker) {
                    var promise = SmscRemoteOperationRestangular.all('sfe/send-now-by-sms-ticket?smsTicket=' + messageId).customPUT({});
                    UtilService.addPromiseToTracker(promise, promiseTracker);

                    return promise;
                }
            };
        }];
    var SmscProvService = ['$log', 'SmscProvRestangular', 'UtilService', function ($log, SmscProvRestangular, UtilService) {
        return {
            getAllSMPPApplications: function (promiseTracker) {
                var promise = SmscProvRestangular.all('applications/smpp').getList();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            }
        };
    }];

    // SMSC Service Definitions
    ApplicationServices.factory('SmscOperationService', function ($injector) {
        return $injector.instantiate(SmscOperationService);
    });
    ApplicationServices.factory('SmscProvService', function ($injector) {
        return $injector.instantiate(SmscProvService);
    });

    // SMSC SFE Services
    ApplicationServices.factory('SfeReportingService', function ($log, SfeReportingRestangular, SfeRemoteReportingRestangular, UtilService) {
        var getEDRs = function (restangular, url) {
            var promise = restangular.one(url).get();
            UtilService.addPromiseToTracker(promise);

            return promise;
        };
        var deleteAllPendingMessages = function (restangular, url) {
            var promise = restangular.one(url).remove();
            UtilService.addPromiseToTracker(promise);

            return promise;
        };
        var findSmscTransientMessageParts = function (restangular, origAddress, destAddress, partRef) {
            var url = '?orig-address=' + origAddress;
            url += '&dest-address=' + destAddress;
            url += '&part-ref=' + partRef;

            var promise = restangular.one(url).get();
            UtilService.addPromiseToTracker(promise);

            return promise;
        };
        var getTransientCount = function (restangular, url) {
            var promise = restangular.one(url).get();
            UtilService.addPromiseToTracker(promise);

            return promise;
        };

        return {
            prepareUrl: function (filter, additionalFilter) {
                var msisdn = filter.msisdn;

                var url = '?date-from=' + filter.startDate.replace(/\+/g, '%2B');
                url += '&date-to=' + filter.endDate.replace(/\+/g, '%2B');

                url += filter.orderBy ? '&order-by=' + filter.orderBy : '';

                url += !_.isUndefined(filter.offset) ? '&paging-from=' + filter.offset : '';
                url += !_.isUndefined(filter.limit) ? '&page-count=' + filter.limit : '';

                url += additionalFilter.origAddress ? '&orig-address=' + additionalFilter.origAddress : '';
                url += additionalFilter.origAgentType ? '&orig-agent-type=' + additionalFilter.origAgentType : '';
                url += additionalFilter.origAgentId ? '&orig-agent-id=' + additionalFilter.origAgentId : '';

                url += additionalFilter.destAddress ? '&dest-address=' + additionalFilter.destAddress : '';
                url += additionalFilter.destAgentType ? '&dest-agent-type=' + additionalFilter.destAgentType : '';
                url += additionalFilter.destAgentId ? '&dest-agent-id=' + additionalFilter.destAgentId : '';

                url += filter.msisdn ? '&orig-or-dest-address=' + msisdn : '';

                url += filter.quickSearchText ? '&inner-search-address=' + filter.quickSearchText : '';

                url += additionalFilter.partRef ? '&part-ref=' + additionalFilter.partRef : '';

                return url;
            },
            // Main site
            getEDRs: function (filter, additionalFilter) {
                var url = this.prepareUrl(filter, additionalFilter);

                return getEDRs(SfeReportingRestangular, url);
            },
            deleteAllPendingMessages: function (filter, additionalFilter) {
                var url = this.prepareUrl(filter, additionalFilter);

                return deleteAllPendingMessages(SfeReportingRestangular, url);
            },
            findSmscTransientMessageParts: function (origAddress, destAddress, partRef) {
                return findSmscTransientMessageParts(SfeReportingRestangular, origAddress, destAddress, partRef);
            },
            getTransientCount: function (filter, additionalFilter) {
                filter.limit = 0;
                delete filter.offset;
                delete filter.orderBy;

                var url = this.prepareUrl(filter, additionalFilter);

                return getTransientCount(SfeReportingRestangular, url);
            },
            // Remote site
            getEDRsRemote: function (filter, additionalFilter) {
                var url = this.prepareUrl(filter, additionalFilter);

                return getEDRs(SfeRemoteReportingRestangular, url);
            },
            deleteAllPendingMessagesRemote: function (filter, additionalFilter) {
                var url = this.prepareUrl(filter, additionalFilter);

                return deleteAllPendingMessages(SfeRemoteReportingRestangular, url);
            },
            findSmscTransientMessagePartsRemote: function (origAddress, destAddress, partRef) {
                return findSmscTransientMessageParts(SfeRemoteReportingRestangular, origAddress, destAddress, partRef);
            },
            getTransientCountRemote: function (filter, additionalFilter) {
                filter.limit = 0;
                delete filter.offset;
                delete filter.orderBy;

                var url = this.prepareUrl(filter, additionalFilter);

                return getTransientCount(SfeRemoteReportingRestangular, url);
            }
        };
    });

    // MMSC Services
    ApplicationServices.factory('MmscTroubleshootingService', function ($log, MmscTroubleshootingRestangular, MmscRemoteTroubleshootingRestangular, UtilService) {
        return {
            getContentIdList: function (msgId) {
                var promise = MmscTroubleshootingRestangular.one(msgId).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getContentById: function (msgId, contentId) {
                var promise = MmscTroubleshootingRestangular.one(msgId + '/' + contentId).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            retryMessage: function (msgId, recipientAddress) {
                var promise = MmscTroubleshootingRestangular.one(msgId + '?recipient=' + recipientAddress).post();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            cancelMessage: function (msgId, recipientAddress) {
                var promise = MmscTroubleshootingRestangular.all(msgId + '?recipient=' + recipientAddress).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Remote
            getContentIdListRemote: function (msgId, promiseTracker) {
                var promise = MmscRemoteTroubleshootingRestangular.one(msgId).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getContentByIdRemote: function (msgId, contentId, promiseTracker) {
                var promise = MmscRemoteTroubleshootingRestangular.one(msgId + '/' + contentId).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            retryMessageRemote: function (msgId, recipientAddress, promiseTracker) {
                var promise = MmscRemoteTroubleshootingRestangular.one(msgId + '?recipient=' + recipientAddress).post();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            cancelMessageRemote: function (msgId, recipientAddress, promiseTracker) {
                var promise = MmscRemoteTroubleshootingRestangular.all(msgId + '?recipient=' + recipientAddress).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            }
        };
    });

    // USSD Browser Services
    ApplicationServices.factory('UssdBrowserService', function ($log, UssdBrowserRestangular, UtilService) {
        return {
            getApplications: function (promiseTracker) {
                var promise = UssdBrowserRestangular.one('web-service-application').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            }
        };
    });

    // MCA Services
    ApplicationServices.factory('MCAProvisioningService', function ($log, MCAProvRestangular, UtilService) {
        return {
            SERVICE_NAME: 'MCNPush',
            errorCodes: {
                MCA_UNKNOWNN_EXCEPTION: 1001,
                MCA_UNKNOWNN_STATE_REQUEST: 1002,
                MCA_SUBSCRIBER_NOT_FOUND: 1003,
                MCA_SUBSCRIPTION_NOT_FOUND: 1004,
                MCA_SUBSCRIPTION_REMOVED: 1005,
                MCA_MESSAGE_TOO_LONG: 1006,
                MCA_MESSAGE_NOT_VALID: 1007,
                MCA_NUMBER_NOT_VALID: 1008
            },
            getMCASubscriber: function (msisdn) {
                var getMCASubscriberPromise = MCAProvRestangular.one('subscriptions/' + msisdn).get();
                UtilService.addPromiseToTracker(getMCASubscriberPromise);

                return getMCASubscriberPromise;
            },
            updateMCASubscriber: function (msisdn, mcsSubscriber) {
                var updateMCASubscriberPromise = MCAProvRestangular.all('subscriptions/' + msisdn).customPUT(mcsSubscriber);
                UtilService.addPromiseToTracker(updateMCASubscriberPromise);

                return updateMCASubscriberPromise;
            }
        };
    });
    ApplicationServices.factory('MCAConfService', function ($log, MCAConfigRestangular, UtilService) {
        return {
            getAutoReplyMessages: function () {
                var promise = MCAConfigRestangular.one('resource-adapter/autoreply-messages').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        };
    });

    // Voice Mail Services
    ApplicationServices.factory('VMConfigurationService', function ($log, $q, VMConfigurationRestangular, UtilService) {
        return {
            // Class of Service Profiles
            getCoSProfiles: function (promiseTracker) {
                var deferred = $q.defer();

                VMConfigurationRestangular.one('/cos-profiles').get().then(function (response) {
                    var classOfServiceProfiles = response;

                    classOfServiceProfiles = _.filter(classOfServiceProfiles, function (classOfServiceProfile) {
                        return (classOfServiceProfile.cosName !== 'Temporary' && classOfServiceProfile.cosName !== 'VoiceSMS');
                    });

                    deferred.resolve(classOfServiceProfiles);
                }, function (response) {
                    deferred.resolve(response);
                });

                UtilService.addPromiseToTracker(deferred.promise, promiseTracker);

                return deferred.promise;
            }
        };
    });
    ApplicationServices.factory('VMProvisioningService', function ($log, VMProvisioningRestangular, UtilService) {
        return {
            SERVICE_NAME: 'VoiceMail',
            getServiceSubscriberPreferences: function (msisdn) {
                var promise = VMProvisioningRestangular.one('messageBoxes/' + msisdn).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateServiceSubscriberPreferences: function (msisdn, subscriberPreferences) {
                var promise = VMProvisioningRestangular.all('messageBoxes/' + msisdn).customPUT(subscriberPreferences);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getAllMessages: function (msisdn) {
                var promise = VMProvisioningRestangular.one('messageBoxes/' + msisdn + '/messages').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateMessageWithId: function (msisdn, messageId, messagePreferences) {
                var promise = VMProvisioningRestangular.all('messageBoxes/' + msisdn + '/messages/' + messageId).customPUT(messagePreferences);
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        };
    });

    // Pay for Me Services
    ApplicationServices.factory('P4MService', function ($log, P4MRestangular, UtilService) {
        var CHANNEL_TYPE = 'CC';

        return {
            // Collect Call
            updateCollectCallRequestLimit: function (msisdn, requestLimit) {
                var promise = P4MRestangular.all('requestLimit/' + CHANNEL_TYPE + '/' + msisdn).customPUT(requestLimit);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getCollectCallRequestLimit: function (msisdn) {
                var promise = P4MRestangular.one('requestLimit/' + CHANNEL_TYPE + '/' + msisdn).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        };
    });

    // General Elastic Search Services
    ApplicationServices.factory('GeneralESService', function ($log, $filter, UtilService, SessionService, ESClient, ESClientRemote,
                                                              SmscESClient, SmscESClientRemote, SmscESAdapterClient, SmscESAdapterClientRemote,
                                                              SMSAntiSpamESClient, SMSAntiSpamESClientRemote, SMSAntiSpamESAdapterClient, SMSAntiSpamESAdapterClientRemote,
                                                              RBTESClient, RBTESClientRemote, RESOURCE_NAME) {
        var requestTimeout = 60000;

        var findHistoryRecords = function (esClient, index, type, filter, payload) {
            // The range filters for using navigation
            var offset = filter.offset,
                limit = filter.limit;

            var esQueryPromise = esClient.search({
                requestTimeout: requestTimeout,
                headers: {
                    'Channel': 'CC',
                    'Username': SessionService.getUsername(),
                    'TransactionId': new Date().getTime(),
                    'ServiceLabel': 'Elastic Search',
                    'ResourceName': RESOURCE_NAME
                },
                index: index,
                type: type,
                from: offset,
                size: limit,
                body: payload
            });

            UtilService.addPromiseToTracker(esQueryPromise);

            return esQueryPromise;
        };

        var getCount = function (esClient, index, type, payload) {
            var esQueryPromise = esClient.count({
                requestTimeout: requestTimeout,
                headers: {
                    'Channel': 'CC',
                    'Username': SessionService.getUsername(),
                    'TransactionId': new Date().getTime(),
                    'ServiceLabel': 'Elastic Search',
                    'ResourceName': RESOURCE_NAME
                },
                index: index,
                type: type,
                body: payload
            });

            UtilService.addPromiseToTracker(esQueryPromise);

            return esQueryPromise;
        };

        return {
            prepareMainEdrQueryPayload: function (filter, msisdnFields, timestampFieldName, additionalFilterFields, termFilterJSON) {
                var msisdn = filter.msisdn,
                    startDate = filter.startDate,
                    endDate = filter.endDate,
                    queryString = filter.queryString,
                    quickSearchColumns = filter.quickSearchColumns,
                    sortFieldName = filter.sortFieldName,
                    sortOrder = filter.sortOrder;

                var mustFilterJSON = [];
                var shouldFilterJSON = [];

                // Msisdn field matchers
                _.each(msisdnFields, function (msisdnFieldName) {
                    shouldFilterJSON.push(JSON.parse('{ "regexp" : { "' + msisdnFieldName + '" : ".*' + msisdn + '" } }'));
                });

                // Clean the query string text
                queryString = s.clean(queryString);
                queryString = UtilService.escapeRegExp(queryString);

                // Prepare the payload now.
                var payload = {
                    "query": {
                        "bool": {
                            "must": [],
                            "must_not": [],
                            "should": [],
                        }
                    },
                    "sort": []
                };

                if (!_.isEmpty(queryString)) {
                    var quickSearchShouldFilterJSON = [];
                    _.each(quickSearchColumns, function (columnName) {
                        var pJson = {};
                        try {
                            pJson = JSON.parse('{ "regexp" : { "' + columnName + '" : ".*' + queryString + '.*" } }');
                        } catch (e) {
                            console.log(e.message);
                        }
                        quickSearchShouldFilterJSON.push(pJson);
                    });

                    payload.query.bool.must.push({
                        "bool": {
                            "minimum_should_match": 1,
                            "should": quickSearchShouldFilterJSON
                        }
                    });
                }

                // Prepares queries for additional filter fields.
                if (additionalFilterFields) {
                    _.each(additionalFilterFields, function (columnValue, columnName) {
                        // It should be considered that a field contains multiple should query if additional the field is an object.
                        if (_.isObject(columnValue)) {
                            if (_.isArray(columnValue)) {
                                var termsArrayQuery = JSON.parse('{ "terms": { "' + columnName + '": [' + columnValue.join(', ') + '] } }');

                                payload.query.bool.must.push(termsArrayQuery);
                            } else {
                                _.each(columnValue, function (subColumnValue, subColumnName) {
                                    var query;
                                    if (!_.isUndefined(subColumnValue) && !s.isBlank(subColumnValue)) {
                                        // Consider that the star character in value of fields.
                                        if (s.include(subColumnValue, "*")) {
                                            query = JSON.parse('{ "regexp": { "' + subColumnName + '": "' + subColumnValue.replace(/\*/g, '.*') + '" } }');
                                        } else {
                                            query = JSON.parse('{ "term": { "' + subColumnName + '": "' + subColumnValue + '"} }');
                                        }

                                        payload.query.bool.must.push(query);
                                    }
                                });
                            }
                        } else {
                            if (!_.isUndefined(columnValue) && !s.isBlank(columnValue)) {
                                var query;
                                // Prepare simple prefix or query_string query if only simple fields have sent in the additionalfields parameter.
                                // Consider that the star character in value of fields.
                                if (s.include(columnValue, "*")) {
                                    query = JSON.parse('{ "regexp": { "' + columnName + '": "' + columnValue.replace(/\*/g, '.*') + '" } }');
                                } else {
                                    query = JSON.parse('{ "term": { "' + columnName + '": "' + columnValue + '"} }');
                                }

                                payload.query.bool.must.push(query);
                            }
                        }
                    });
                }

                if (sortFieldName && sortOrder) {
                    // Parsing sort JSON object
                    var sortJSON = JSON.parse('[ { "' + sortFieldName + '": { "order": ' + sortOrder + ' } } ]');
                    payload.sort = sortJSON;
                }

                // Push the date parameters into the filter.
                if (startDate && endDate) {
                    // Date range field matcher
                    var dateRangeJSON = JSON.parse('{ "range": { "' + timestampFieldName + '": { "gt": "' + startDate + '", "lt": "' + endDate + '" } } }');
                    payload.query.bool.must.push(dateRangeJSON);
                }

                // Main filter query puts in the main payload.
                payload.query.bool.must = payload.query.bool.must.concat(mustFilterJSON);
                payload.query.bool.should = shouldFilterJSON;
                // If there is at least one clause in the should, then add minimum_should_match parameter to the bool.
                if (payload.query.bool.should.length > 0) {
                    payload.query.bool.minimum_should_match = 1;
                }

                // Add passed term filters into into the bool directly since supposing the term json contains any filter (e.g. must or must_not).
                if (termFilterJSON) {
                    _.each(termFilterJSON.must, function (mustItem) {
                        payload.query.bool.must.push(mustItem);
                    });

                    _.each(termFilterJSON.must_not, function (mustNotItem) {
                        payload.query.bool.must_not.push(mustNotItem);
                    });

                    _.each(termFilterJSON.should, function (shouldItem) {
                        payload.query.bool.should.push(shouldItem);
                    });
                }

                return payload;
            },
            // Service and product methods.
            // Subscription Manager
            findSSMHistory: function (filter, additionalFilterFields) {
                var index = 'ssm-read', type = 'ssm';

                // Filter these events: SUBSCRIBE_TO_OFFER_SUCCESS(2), SUBSCRIBE_TO_OFFER_FAIL(3), UNSUBSCRIBE_FROM_OFFER_SUCCESS(5), UNSUBSCRIBE_FROM_OFFER_FAIL(6)
                var termFilterJSON = {
                    "must": [
                        {
                            "terms": {
                                "event": [2, 3, 5, 6]
                            }
                        }
                    ]
                };

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['msisdn'], 'timestamp', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            findSSMDetailedHistory: function (transactionId, eventType) {
                var index = 'ssm-read', type = 'ssm';
                eventType = Number(eventType); // Convert event type to number.

                // Make a decision for event types according to the main event type.
                //
                // For SUBSCRIBE_TO_OFFER_SUCCESS(2)
                // Query: CHARGING_SUCCESS(8), CHARGING_FAIL(9), RENEW_SUBSCRIPTION_SUCCESS(32), RENEW_SUBSCRIPTION_FAIL(33), PROCESS_CONFIRMATION_SUCCESS(41),
                // PROCESS_CONFIRMATION_FAIL(42), SETTING_HLR_FLAG_SUCCESS(54), SETTING_HLR_FLAG_FAILED(55), SUBSCRIBE_TO_OFFER_AFTER_TRIAL_PERIOD_SUCCESS(57),
                // SUBSCRIBE_TO_OFFER_AFTER_TRIAL_PERIOD_FAIL(58), TERMINATE_TRIAL_SUBSCRIPTION_SUCCESS(60), TERMINATE_TRIAL_SUBSCRIPTION_FAIL(61),
                // OFFER_SUBSCRIPTION_STATE_CHANGE_ACTIVE_TO_GRACE(70), OFFER_SUBSCRIPTION_STATE_CHANGE_ACTIVE_TO_SUSPEND(71), OFFER_SUBSCRIPTION_STATE_CHANGE_ACTIVE_TO_INACTIVE(72),
                // OFFER_SUBSCRIPTION_STATE_CHANGE_GRACE_TO_SUSPEND(73), OFFER_SUBSCRIPTION_STATE_CHANGE_GRACE_TO_ACTIVE(74), OFFER_SUBSCRIPTION_STATE_CHANGE_GRACE_TO_INACTIVE(75),
                // OFFER_SUBSCRIPTION_STATE_CHANGE_SUSPEND_TO_ACTIVE(76), OFFER_SUBSCRIPTION_STATE_CHANGE_SUSPEND_TO_INACTIVE(77), OFFER_SUBSCRIPTION_STATE_CHANGE_SUSPEND_TO_GRACE(78),
                // OFFER_SUBSCRIPTION_STATE_CHANGE_INACTIVE_TO_ACTIVE(79), OFFER_SUBSCRIPTION_STATE_CHANGE_INACTIVE_TO_SUSPEND(80), OFFER_SUBSCRIPTION_STATE_CHANGE_INACTIVE_TO_GRACE(81),
                // CLEAR_HLR_FLAG_SUCCESS(94), CLEAR_HLR_FLAG_FAIL(95)
                //
                // For SUBSCRIBE_TO_OFFER_FAIL(3)
                // Query: CHARGING_FAIL(9), SETTING_HLR_FLAG_FAILED(55)
                //
                // For UNSUBSCRIBE_FROM_OFFER_SUCCESS(5)
                // Query: CLEAR_HLR_FLAG_SUCCESS(94), CLEAR_HLR_FLAG_FAIL(95)
                //
                // For UNSUBSCRIBE_FROM_OFFER_FAIL(6)
                // Query: CLEAR_HLR_FLAG_FAIL(95)
                var eventTypeTerms = {
                    "terms": {
                        "event": []
                    }
                };
                if (eventType === 2) {
                    eventTypeTerms.terms.event = [2, 8, 9, 32, 33, 41, 42, 54, 55, 57, 58, 60, 61, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 94, 95];
                } else if (eventType === 3) {
                    eventTypeTerms.terms.event = [3, 9, 55];
                } else if (eventType === 5) {
                    eventTypeTerms.terms.event = [5, 94, 95];
                } else if (eventType === 6) {
                    eventTypeTerms.terms.event = [6, 95];
                }

                var filter = {offset: 0, limit: 1000};
                var payload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "transactionId": transactionId
                                    }
                                },
                                eventTypeTerms
                            ]
                        }
                    }
                };

                return findHistoryRecords(ESClient, index, type, filter, payload);
            },
            // SMSC
            findSmscPermanentEdrs: function (filter, additionalFilterFields) {
                var index = 'elastic-search-adapter', type = 'main_edr';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['origAddress', 'destAddress'], 'date', additionalFilterFields);

                return findHistoryRecords(SmscESAdapterClient, index, type, filter, bodyPayload);
            },
            findSmscHistoryEdrs: function (cdrKey) {
                var index = 'smsc-history-read', type = 'history_edr';

                var bodyPayload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "cdrKey": cdrKey
                                    }
                                }
                            ]
                        }
                    }
                };

                var filter = {offset: 0, limit: 1000};

                return findHistoryRecords(SmscESClient, index, type, filter, bodyPayload);
            },
            findSmscPermanentMessageParts: function (origAddress, destAddress, partRef, scTimestamp) {
                var index = 'smsc-main-read', type = 'main_edr';

                var beginDate = moment(scTimestamp).subtract(2, 'hours').toISOString();
                var endDate = moment(scTimestamp).add(2, 'hours').toISOString();

                var bodyPayload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "origAddress": origAddress
                                    }
                                },
                                {
                                    "term": {
                                        "destAddress": destAddress
                                    }
                                },
                                {
                                    "term": {
                                        "partRef": partRef
                                    }
                                },
                                {
                                    "range": {
                                        "scTimestamp": {
                                            "gt": beginDate,
                                            "lt": endDate
                                        }
                                    }
                                }
                            ]
                        }
                    }
                };

                var filter = {offset: 0, limit: 1000};

                return findHistoryRecords(SmscESClient, index, type, filter, bodyPayload);
            },
            getSmscPermanentCountByFilter: function (filter, additionalFilterFields) {
                var index = 'smsc-main-read', type = 'main_edr';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['origAddress', 'destAddress'], 'date', additionalFilterFields);

                // sort clause is deleting from the query that it is unnecessary for count queries.
                delete bodyPayload.sort;

                return getCount(SmscESClient, index, type, bodyPayload);
            },
            getSmscPermanentDeliveredCount: function (filter, additionalFilterFields) {
                var termFilterJSON = {
                    "must": [
                        {
                            "term": {
                                "result": 0
                            }
                        }
                    ]
                };

                return this.getSmscPermanentCountByFilter(filter, additionalFilterFields, termFilterJSON);
            },
            getSmscPermanentCount: function (filter, additionalFilterFields) {
                return this.getSmscPermanentCountByFilter(filter, additionalFilterFields);
            },
            // SMSC Remote
            findSmscPermanentEdrsRemote: function (filter, additionalFilterFields) {
                var index = 'elastic-search-adapter', type = 'main_edr';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['origAddress', 'destAddress'], 'date', additionalFilterFields);

                return findHistoryRecords(SmscESAdapterClientRemote, index, type, filter, bodyPayload);
            },
            findSmscHistoryEdrsRemote: function (cdrKey) {
                var index = 'smsc-history-read', type = 'history_edr';

                var bodyPayload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "cdrKey": cdrKey
                                    }
                                }
                            ]
                        }
                    }
                };

                var filter = {offset: 0, limit: 1000};

                return findHistoryRecords(SmscESClientRemote, index, type, filter, bodyPayload);
            },
            findSmscPermanentMessagePartsRemote: function (origAddress, destAddress, partRef, scTimestamp) {
                var index = 'smsc-main-read', type = 'main_edr';

                var beginDate = moment(scTimestamp).subtract(2, 'hours').toISOString();
                var endDate = moment(scTimestamp).add(2, 'hours').toISOString();

                var bodyPayload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "origAddress": origAddress
                                    }
                                },
                                {
                                    "term": {
                                        "destAddress": destAddress
                                    }
                                },
                                {
                                    "term": {
                                        "partRef": partRef
                                    }
                                },
                                {
                                    "range": {
                                        "scTimestamp": {
                                            "gt": beginDate,
                                            "lt": endDate
                                        }
                                    }
                                }
                            ]
                        }
                    }
                };

                var filter = {offset: 0, limit: 1000};

                return findHistoryRecords(SmscESClientRemote, index, type, filter, bodyPayload);
            },
            getSmscPermanentCountByFilterRemote: function (filter, additionalFilterFields) {
                var index = 'smsc-main-read', type = 'main_edr';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['origAddress', 'destAddress'], 'date', additionalFilterFields);

                // sort clause is deleting from the query that it is unnecessary for count queries.
                delete bodyPayload.sort;

                return getCount(SmscESClientRemote, index, type, bodyPayload);
            },
            getSmscPermanentDeliveredCountRemote: function (filter, additionalFilterFields) {
                var termFilterJSON = {
                    "must": [
                        {
                            "term": {
                                "result": 0
                            }
                        }
                    ]
                };

                return this.getSmscPermanentCountByFilterRemote(filter, additionalFilterFields, termFilterJSON);
            },
            getSmscPermanentCountRemote: function (filter, additionalFilterFields) {
                return this.getSmscPermanentCountByFilterRemote(filter, additionalFilterFields);
            },
            // SMS AntiSpam
            findSMSAntiSpamEdrs: function (filter, additionalFilterFields) {
                var index = 'elastic-search-adapter', type = 'sms-as';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['origMsisdn', 'destMsisdn'], 'date', additionalFilterFields);

                return findHistoryRecords(SMSAntiSpamESAdapterClient, index, type, filter, bodyPayload);
            },
            findSMSAntiSpamMainEdrs: function (filter, additionalFilterFields) {
                // CDR types filter to differenciate records as main or historical.
                // Main CDR key criteria put into the term filter json.
                // Check the SMS_ANTISPAM_EDR_TYPE constant array for all CDR Types.
                var termFilterJSON = {
                    "must": [
                        {
                            "terms": {
                                "cdrType": [
                                    101, 102,
                                    121, 122,
                                    131, 132, 133,
                                    151, 152,
                                    201
                                ]
                            }
                        }
                    ]
                };

                if (additionalFilterFields.opContentFilter && !_.isEmpty(additionalFilterFields.opContentFilter)) {
                    termFilterJSON.must[0].terms.cdrType = [162];
                }

                return this.findSMSAntiSpamEdrs(filter, additionalFilterFields);
            },
            findSMSAntiSpamHistoricalEdrs: function (cdrKey) {
                var index = 'sms-as-read', type = 'sms-as';

                var filter = {offset: 0, limit: 1000};
                var payload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "cdrKey": cdrKey
                                    }
                                }
                            ]
                        }
                    },
                    "sort": [{"date": {"order": "desc"}}]
                };

                return findHistoryRecords(SMSAntiSpamESClient, index, type, filter, payload);
            },
            findSMSAntiSpamMessageParts: function (origMsisdn, destMsisdn, opPartRef) {
                var index = 'sms-as-read', type = 'sms-as';

                var bodyPayload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "origMsisdn": origMsisdn
                                    }
                                },
                                {
                                    "term": {
                                        "destMsisdn": destMsisdn
                                    }
                                },
                                {
                                    "term": {
                                        "opPartRef": opPartRef
                                    }
                                }
                            ]
                        }
                    }
                };

                var filter = {offset: 0, limit: 1000};

                return findHistoryRecords(SMSAntiSpamESClient, index, type, filter, bodyPayload);
            },
            // SMS AntiSpam Remote
            findSMSAntiSpamEdrsRemote: function (filter, additionalFilterFields) {
                var index = 'elastic-search-adapter', type = 'sms-as';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['origMsisdn', 'destMsisdn'], 'date', additionalFilterFields);

                return findHistoryRecords(SMSAntiSpamESAdapterClientRemote, index, type, filter, bodyPayload);
            },
            findSMSAntiSpamMainEdrsRemote: function (filter, additionalFilterFields) {
                // CDR types filter to differenciate records as main or historical.
                // Main CDR key criteria put into the term filter json.
                // Check the SMS_ANTISPAM_EDR_TYPE constant array for all CDR Types.
                var termFilterJSON = {
                    "must": [
                        {
                            "terms": {
                                "cdrType": [
                                    101, 102,
                                    121, 122,
                                    131, 132, 133,
                                    151, 152,
                                    201
                                ]
                            }
                        }
                    ]
                };

                return this.findSMSAntiSpamEdrsRemote(filter, additionalFilterFields);
            },
            findSMSAntiSpamHistoricalEdrsRemote: function (cdrKey) {
                var index = 'sms-as-read', type = 'sms-as';

                var filter = {offset: 0, limit: 1000};
                var payload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "cdrKey": cdrKey
                                    }
                                }
                            ]
                        }
                    },
                    "sort": [{"date": {"order": "desc"}}]
                };

                return findHistoryRecords(SMSAntiSpamESClientRemote, index, type, filter, payload);
            },
            findSMSAntiSpamMessagePartsRemote: function (origMsisdn, destMsisdn, opPartRef) {
                var index = 'sms-as-read', type = 'sms-as';

                var bodyPayload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "origMsisdn": origMsisdn
                                    }
                                },
                                {
                                    "term": {
                                        "destMsisdn": destMsisdn
                                    }
                                },
                                {
                                    "term": {
                                        "opPartRef": opPartRef
                                    }
                                }
                            ]
                        }
                    }
                };

                var filter = {offset: 0, limit: 1000};

                return findHistoryRecords(SMSAntiSpamESClientRemote, index, type, filter, bodyPayload);
            },
            // MMSC
            findMmscPermanentEdrs: function (filter, additionalFilterFields) {
                var index = 'mmsc-read', type = 'main_edr';

                var termFilterJSON = {
                    "must_not": [
                        {
                            "terms": {
                                "finalStatus": [0, 7]
                            }
                        }
                    ]
                };

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['sender.address', 'recipient.address'], 'eventTime', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            findMmscTransientEdrs: function (filter, additionalFilterFields) {
                var index = 'mmsc-read', type = 'main_edr';

                var termFilterJSON = {
                    "must": [
                        {
                            "terms": {
                                "finalStatus": [0, 7]
                            }
                        }
                    ]
                };

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['sender.address', 'recipient.address'], 'eventTime', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            findMmscHistoryEdrs: function (messageId, destAddress) {
                var index = 'mmsc-read', type = 'history_edr';

                var bodyPayload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "messageID": messageId
                                    }
                                },
                                {
                                    "term": {
                                        "recipient.address": destAddress
                                    }
                                }
                            ]
                        }
                    }
                };

                var filter = {offset: 0, limit: 1000};

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            getMmscRecordCountByFilter: function (filter, additionalFilterFields, termFilterJSON) {
                var index = 'mmsc-read', type = 'main_edr';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['sender.address', 'recipient.address'], 'eventTime', additionalFilterFields, termFilterJSON);

                // sort clause is deleting from the query that it is unnecessary for count queries.
                delete bodyPayload.sort;

                return getCount(ESClient, index, type, bodyPayload);
            },
            getMmscDeliveredCount: function (filter, additionalFilterFields) {
                var termFilterJSON = {
                    "must": [
                        {
                            "term": {
                                "finalStatus": 1
                            }
                        }
                    ]
                };

                return this.getMmscRecordCountByFilter(filter, additionalFilterFields, termFilterJSON);
            },
            getMmscPermanentCount: function (filter, additionalFilterFields) {
                var termFilterJSON = {
                    "must_not": [
                        {
                            "terms": {
                                "finalStatus": [0, 7]
                            }
                        }
                    ]
                };

                return this.getMmscRecordCountByFilter(filter, additionalFilterFields, termFilterJSON);
            },
            getMmscTransientCount: function (filter, additionalFilterFields) {
                var termFilterJSON = {
                    "must": [
                        {
                            "terms": {
                                "finalStatus": [0, 7]
                            }
                        }
                    ]
                };

                return this.getMmscRecordCountByFilter(filter, additionalFilterFields, termFilterJSON);
            },
            // MMSC Remote
            findMmscPermanentEdrsRemote: function (filter, additionalFilterFields) {
                var index = 'mmsc-read', type = 'main_edr';

                var termFilterJSON = {
                    "must_not": [
                        {
                            "terms": {
                                "finalStatus": [0, 7]
                            }
                        }
                    ]
                };

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['sender.address', 'recipient.address'], 'eventTime', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(ESClientRemote, index, type, filter, bodyPayload);
            },
            findMmscTransientEdrsRemote: function (filter, additionalFilterFields) {
                var index = 'mmsc-read', type = 'main_edr';

                var termFilterJSON = {
                    "must": [
                        {
                            "terms": {
                                "finalStatus": [0, 7]
                            }
                        }
                    ]
                };

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['sender.address', 'recipient.address'], 'eventTime', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(ESClientRemote, index, type, filter, bodyPayload);
            },
            findMmscHistoryEdrsRemote: function (messageId, destAddress) {
                var index = 'mmsc-read', type = 'history_edr';

                var bodyPayload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "messageID": messageId
                                    }
                                },
                                {
                                    "term": {
                                        "recipient.address": destAddress
                                    }
                                }
                            ]
                        }
                    }
                };

                var filter = {offset: 0, limit: 1000};

                return findHistoryRecords(ESClientRemote, index, type, filter, bodyPayload);
            },
            getMmscRecordCountByFilterRemote: function (filter, additionalFilterFields, termFilterJSON) {
                var index = 'mmsc-read', type = 'main_edr';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['sender.address', 'recipient.address'], 'eventTime', additionalFilterFields, termFilterJSON);

                // sort clause is deleting from the query that it is unnecessary for count queries.
                delete bodyPayload.sort;

                return getCount(ESClientRemote, index, type, bodyPayload);
            },
            getMmscDeliveredCountRemote: function (filter, additionalFilterFields) {
                var termFilterJSON = {
                    "must": [
                        {
                            "term": {
                                "finalStatus": 1
                            }
                        }
                    ]
                };

                return this.getMmscRecordCountByFilterRemote(filter, additionalFilterFields, termFilterJSON);
            },
            getMmscPermanentCountRemote: function (filter, additionalFilterFields) {
                var termFilterJSON = {
                    "must_not": [
                        {
                            "terms": {
                                "finalStatus": [0, 7]
                            }
                        }
                    ]
                };

                return this.getMmscRecordCountByFilterRemote(filter, additionalFilterFields, termFilterJSON);
            },
            getMmscTransientCountRemote: function (filter, additionalFilterFields) {
                var termFilterJSON = {
                    "must": [
                        {
                            "terms": {
                                "finalStatus": [0, 7]
                            }
                        }
                    ]
                };

                return this.getMmscRecordCountByFilterRemote(filter, additionalFilterFields, termFilterJSON);
            },
            // USC history methods
            findUSSDServiceCenterHistoryInitSessions: function (filter, additionalFilterFields) {
                var index = 'ussdbrowser-main-read', type = 'cc';
                var termFilterJSON = {
                    "must": [
                        {
                            "terms": {
                                "eventtype": ["PssrReq", "MTRequest"]
                            }
                        }
                    ]
                };

                // Escape the * and # characters at the passed input value and add wildcard characters the begin and the end
                // of the string.
                if (additionalFilterFields && additionalFilterFields.input) {
                    termFilterJSON.must.push({
                        "regexp": {
                            "input": '.*' + additionalFilterFields.input.replace(/\*/g, '\\*').replace(/\#/g, '\\#') + '.*'
                        }
                    });

                    delete additionalFilterFields.input;
                }

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['mobileno'], 'timestamp', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            findUSSDServiceCenterHistoryAll: function (sessionId) {
                var index = 'ussdbrowser-main-read', type = 'cc';
                var filter = {
                    sortFieldName: 'timestamp',
                    sortOrder: '"asc"',
                    offset: 0,
                    limit: 1000
                };
                var additionalFilterFields = {sessionId: sessionId};

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, [], 'timestamp', additionalFilterFields);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            findUSSDServiceCenterHistoryDetail: function (sessionId, application, event, timestamp) {
                var index = 'ussdbrowser-detail-read', type = 'brw_detail';
                var filter = {
                    sortFieldName: 'timestamp',
                    sortOrder: '"asc"',
                    offset: 0,
                    limit: 1
                };

                var additionalFilterFields = {
                    sessionId: sessionId,
                    application: application,
                    event: event,
                    timestamp: timestamp
                };

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, [], 'timestamp', additionalFilterFields);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            findUSSDServiceCenterHistoryDetailAll: function (sessionId) {
                var index = 'ussdbrowser-detail-read', type = 'brw_detail';
                var filter = {
                    sortFieldName: 'timestamp',
                    sortOrder: '"asc"',
                    offset: 0,
                    limit: 1000
                };
                var additionalFilterFields = {sessionId: sessionId};

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, [], 'timestamp', additionalFilterFields);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            // USC history methods Remote
            findUSSDServiceCenterHistoryInitSessionsRemote: function (filter, additionalFilterFields) {
                var index = 'ussdbrowser-main-read', type = 'cc';
                var termFilterJSON = {
                    "must": [
                        {
                            "terms": {
                                "eventtype": ["PssrReq", "MTRequest"]
                            }
                        }
                    ]
                };

                // Escape the * and # characters at the passed input value and add wildcard characters the begin and the end
                // of the string.
                if (additionalFilterFields && additionalFilterFields.input) {
                    termFilterJSON.must.push({
                        "regexp": {
                            "input": '.*' + additionalFilterFields.input.replace(/\*/g, '\\*').replace(/\#/g, '\\#') + '.*'
                        }
                    });

                    delete additionalFilterFields.input;
                }

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['mobileno'], 'timestamp', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(ESClientRemote, index, type, filter, bodyPayload);
            },
            findUSSDServiceCenterHistoryAllRemote: function (sessionId) {
                var index = 'ussdbrowser-main-read', type = 'cc';
                var filter = {
                    sortFieldName: 'timestamp',
                    sortOrder: '"asc"',
                    offset: 0,
                    limit: 1000
                };
                var additionalFilterFields = {sessionId: sessionId};

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, [], 'timestamp', additionalFilterFields);

                return findHistoryRecords(ESClientRemote, index, type, filter, bodyPayload);
            },
            findUSSDServiceCenterHistoryDetailRemote: function (sessionId, application, event, timestamp) {
                var index = 'ussdbrowser-detail-read', type = 'brw_detail';
                var filter = {
                    sortFieldName: 'timestamp',
                    sortOrder: '"asc"',
                    offset: 0,
                    limit: 1
                };

                var additionalFilterFields = {
                    sessionId: sessionId,
                    application: application,
                    event: event,
                    timestamp: timestamp
                };

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, [], 'timestamp', additionalFilterFields);

                return findHistoryRecords(ESClientRemote, index, type, filter, bodyPayload);
            },
            findUSSDServiceCenterHistoryDetailAllRemote: function (sessionId) {
                var index = 'ussdbrowser-detail-read', type = 'brw_detail';
                var filter = {
                    sortFieldName: 'timestamp',
                    sortOrder: '"asc"',
                    offset: 0,
                    limit: 1000
                };
                var additionalFilterFields = {sessionId: sessionId};

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, [], 'timestamp', additionalFilterFields);

                return findHistoryRecords(ESClientRemote, index, type, filter, bodyPayload);
            },
            // Voice Mail
            findVMHistory: function (filter, additionalFilterFields) {
                var index = 'voicemail-read', type = 'voicemail';

                var termFilterJSON = {
                    "must": [
                        {
                            "terms": {
                                "eventcode": [
                                    "RUNNING_VM_DEPOSIT_SERVICE",
                                    "RUNNING_VM_RETRIEVAL_SERVICE",
                                    "RUNNING_VM_RETRIEVAL_INDIRECT_SERVICE",
                                    "RUNNING_VM_INDIRECT_SERVICE"
                                ]
                            }
                        }
                    ]
                };

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['origparty', 'destparty', 'origdestparty', 'subsphone'], 'timestamp', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            findVMDetailedHistory: function (sessionid) {
                var index = 'voicemail-read', type = 'voicemail';

                var filter = {offset: 0, limit: 1000};
                var payload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "sessionid": sessionid
                                    }
                                }
                            ]
                        }
                    }
                };

                return findHistoryRecords(ESClient, index, type, filter, payload);
            },
            // Voice Mail Remote
            findVMHistoryRemote: function (filter, additionalFilterFields) {
                var index = 'voicemail-read', type = 'voicemail';

                var termFilterJSON = {
                    "must": [
                        {
                            "terms": {
                                "eventcode": [
                                    "RUNNING_VM_DEPOSIT_SERVICE",
                                    "RUNNING_VM_RETRIEVAL_SERVICE",
                                    "RUNNING_VM_RETRIEVAL_INDIRECT_SERVICE",
                                    "RUNNING_VM_INDIRECT_SERVICE"
                                ]
                            }
                        }
                    ]
                };

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['origparty', 'destparty', 'origdestparty', 'subsphone'], 'timestamp', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(ESClientRemote, index, type, filter, bodyPayload);
            },
            findVMDetailedHistoryRemote: function (sessionid) {
                var index = 'voicemail-read', type = 'voicemail';

                var filter = {offset: 0, limit: 1000};
                var payload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "sessionid": sessionid
                                    }
                                }
                            ]
                        }
                    }
                };

                return findHistoryRecords(ESClientRemote, index, type, filter, payload);
            },
            // Collect Call
            findCCHistory: function (filter, additionalFilterFields) {
                var index = 'payforme-read', type = 'cc';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['aPartyMsisdn', 'bPartyMsisdn'], 'timestamp', additionalFilterFields);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            // Collect Call Remote
            findCCHistoryRemote: function (filter, additionalFilterFields) {
                var index = 'payforme-read', type = 'cc';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['aPartyMsisdn', 'bPartyMsisdn'], 'timestamp', additionalFilterFields);

                return findHistoryRecords(ESClientRemote, index, type, filter, bodyPayload);
            },
            // MCA
            findMCAHistory: function (filter, additionalFilterFields) {
                var index = 'mcn-read', type = 'mcn';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['edrCallingNum', 'edrOrigCalledNum', 'edrRedirectionNum'], 'edrTimestamp', additionalFilterFields);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            // MCA Remote
            findMCAHistoryRemote: function (filter, additionalFilterFields) {
                var index = 'mcn-read', type = 'mcn';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['edrCallingNum', 'edrOrigCalledNum', 'edrRedirectionNum'], 'edrTimestamp', additionalFilterFields);

                return findHistoryRecords(ESClientRemote, index, type, filter, bodyPayload);
            },
            // Poke Call
            findPokeCallHistory: function (filter, additionalFilterFields) {
                var index = 'payforme-read', type = 'poke';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['aPartyMsisdn', 'bPartyMsisdn'], 'timestamp', additionalFilterFields);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            // Poke Call Remote
            findPokeCallHistoryRemote: function (filter, additionalFilterFields) {
                var index = 'payforme-read', type = 'poke';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['aPartyMsisdn', 'bPartyMsisdn'], 'timestamp', additionalFilterFields);

                return findHistoryRecords(ESClientRemote, index, type, filter, bodyPayload);
            },
            // Ring Back Tone
            findRBTHistory: function (filter, additionalFilterFields) {
                var index = 'rbt-event-read', type = '';

                var termFilterJSON = {
                    "must": [
                        {
                            "terms": {
                                "eventcode": [
                                    "101"
                                ]
                            }
                        }
                    ]
                };

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['originatingParty', 'destinationParty'], 'timestamp', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(RBTESClient, index, type, filter, bodyPayload);
            },
            findRBTHistoryRemote: function (filter, additionalFilterFields) {
                var index = 'rbt-event-read', type = '';

                var termFilterJSON = {
                    "must": [
                        {
                            "terms": {
                                "eventcode": [
                                    "101"
                                ]
                            }
                        }
                    ]
                };

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['originatingParty', 'destinationParty'], 'timestamp', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(RBTESClientRemote, index, type, filter, bodyPayload);
            },
            findRBTDetailedHistory: function (sessionid) {
                var index = 'rbt-event-read', type = '';

                var filter = {offset: 0, limit: 1000};
                var payload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "sessionid": sessionid
                                    }
                                }
                            ]
                        }
                    }
                };

                return findHistoryRecords(RBTESClient, index, type, filter, payload);
            },
            findRBTDetailedHistoryRemote: function (sessionid) {
                var index = 'rbt-event-read', type = '';

                var filter = {offset: 0, limit: 1000};
                var payload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "sessionid": sessionid
                                    }
                                }
                            ]
                        }
                    }
                };

                return findHistoryRecords(RBTESClientRemote, index, type, filter, payload);
            },
            // Screening Manager
            findScreeningManagerHistory: function (filter, additionalFilterFields) {
                var index = 'screeningmanager-read', type = 'rest';

                var termFilterJSON = {
                    "should": [
                        {
                            "term": {
                                "otherSubscriberId": filter.msisdn
                            }
                        }
                    ]
                };

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, [], 'timestamp', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            }
        };
    });

})();
