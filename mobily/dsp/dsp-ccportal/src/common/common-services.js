(function () {
    'use strict';

    /* Services */
    angular.module('Application.services', []);

    var ApplicationServices = angular.module('Application.services');

    ApplicationServices.factory('UtilService', function ($window, $log, notification, $translate, $timeout, CCPortalMainPromiseTracker,
                                                         cfpLoadingBar) {
        var calculateDaysAgo = function (dayCount) {
            return moment().startOf('day').subtract(dayCount, 'days').toDate();
        };

        return {
            COUNTRY_CODE: "966",
            SESSION_KEY: '_sa_mb_dsp_c_sk',
            USERNAME_KEY: '_sa_mb_dsp_c_un',
            USER_RIGHTS: '_sa_mb_dsp_c_ur',
            // Common keys
            COMMON_SESSION_KEY: '_sa_mb_dsp_common_sk',
            COMMON_USERNAME_KEY: '_sa_mb_dsp_common_un',
            COMMON_USER_RIGHTS: '_sa_mb_dsp_common_ur',
            // ---
            SITE_INFORMATION_KEY: '_sa_mb_dsp_c_si',
            MSISDN_KEY: '_sa_mb_dsp_c_mk',
            LATEST_STATE: '_sa_mb_dsp_c_lst',
            USER_IS_ADMIN_KEY: '_sa_mb_dsp_c_uiak',
            CMPF_SUBSCRIBER_KEY: '_sa_mb_dsp_c_csk',
            SUBSCRIBER_PROFILE_KEY: '_sa_mb_dsp_c_spk',
            USER_ORGANIZATION_KEY: '_sa_mb_dsp_c_uok',
            USER_ORGANIZATION_ID_KEY: '_sa_mb_dsp_c_uoik',
            USER_ORGANIZATION_NAME_KEY: '_sa_mb_dsp_c_onk',
            USER_ADMIN_KEY: '_sa_mb_dsp_c_uak',
            // Created with this command: node -e "console.log(require('crypto').randomBytes(32).toString('hex'));"
            CHARLIE_PARKER: "22545fa9eef57e2909c6f48bbc07a17a6bd55c0d80899a65dee421e4ef8066b5",
            Validators: {
                Msisdn: /^[0-9]{0,15}$/,
                ScreeningListValidPhoneNumber: /^[0-9]{1,30}(\*){0,1}$/,
                ScreeningListValidNumericRange: /^([0-9]{1,30}-[0-9]{1,30})?([0-9]{1,30})?$/,
                ScreeningListValidLongNumericRange: /^([0-9]{1,50}-[0-9]{1,50})?([0-9]{1,50})?$/,
                ScreeningListValidAlphanumericRange: /^[a-zA-Z0-9]{1,30}-[a-zA-Z0-9]{1,30}$/,
                ScreeningListValidNumericPrefix: /^[\d]+[*]{0,1}$/,
                IntegerNumber: /^[0-9]+$/,
                UserPassword: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=.\-_*])([a-zA-Z0-9@#$%^&+=*.\-_]){8,}$/
            },
            isThereMSISDN: function (requestParams) {
                return !_.isEmpty(requestParams.msisdn);
            },
            isThereRedirectUrl: function (requestParams) {
                return !_.isEmpty(requestParams.redirect);
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
                cfpLoadingBar.set(10);
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
                    var bytes = CryptoJS.AES.decrypt(objectCipherText, this.CHARLIE_PARKER);
                    var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

                    return decryptedData;
                } catch (error) {
                    return {};
                }
            },
            putToSessionStore: function (key, object) {
                var jsonStringOfObj = JSON.stringify(object);

                // Encrypt
                var objectCipherText = CryptoJS.AES.encrypt(jsonStringOfObj, this.CHARLIE_PARKER);

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
            getSubscriberSan: function () {
                var _self = this;

                var subscriberAttributes = _self.getFromSessionStore(_self.SUBSCRIBER_PROFILE_KEY);
                var subscriberAccountNumber = subscriberAttributes.subscriberAccountNumber;

                return subscriberAccountNumber;
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
            convertPeriodStringToSimpleObject: function (string) {
                var periodAndTime = s.words(s.words(string, 'P'), 'T');

                var period = periodAndTime[0];
                var year = s.toNumber(s.strLeft(period, 'Y'));
                if (year) {
                    return {unit: DURATION_UNITS[3].key, duration: year};
                }
                var month = s.toNumber(s.strLeft(s.strRight(period, 'Y'), 'M'));
                if (month) {
                    return {unit: DURATION_UNITS[2].key, duration: month};
                }
                var day = s.toNumber(s.strLeft(s.strRight(period, 'M'), 'D'));
                if (day) {
                    return {unit: DURATION_UNITS[0].key, duration: day};
                }

                var time = periodAndTime[1];
                var hour = s.toNumber(s.strLeft(time, 'H'));
                if (hour) {
                    return {unit: DURATION_UNITS[4].key, duration: hour};
                }
                var minute = s.toNumber(s.strLeft(s.strRight(time, 'H'), 'M'));
                if (minute) {
                    return {unit: DURATION_UNITS[5].key, duration: minute};
                }
                var second = s.toNumber(s.strLeft(s.strRight(time, 'M'), 'S'));
                if (second) {
                    return {unit: DURATION_UNITS[6].key, duration: second};
                }

                return {duration: 0, unit: DURATION_UNITS[0].key};
            },
            convertSimpleObjectToPeriod: function (obj) {
                var year = '000';
                var day = '000';
                var month = '000';
                var hour = '00';
                var minute = '00';
                var second = '00';

                if (obj.unit === 'Days') {
                    day = obj.duration;
                } else if (obj.unit === 'Weeks') {
                    day = obj.duration * 7;
                } else if (obj.unit === 'Months') {
                    month = obj.duration;
                } else if (obj.unit === 'Hours') {
                    hour = obj.duration;
                } else if (obj.unit === 'Minutes') {
                    minute = obj.duration;
                } else if (obj.unit === 'Seconds') {
                    second = obj.duration;
                } else {
                    year = obj.duration;
                }

                year = s.lpad(year, 3, '0');
                day = s.lpad(day, 3, '0');
                month = s.lpad(month, 3, '0');

                hour = s.lpad(hour, 2, '0');
                minute = s.lpad(minute, 2, '0');
                second = s.lpad(second, 2, '0');

                return 'P' + year + 'Y' + month + 'M' + day + 'D' + 'T' + hour + 'H' + minute + 'M' + second + 'S';
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
            },
            generateObjectId: function () {
                return (new ObjectId()).toString();
            },
            getQueryStringObject: function (location) {
                return _.chain(location.search.slice(1).split('&'))
                    .map(function (item) {
                        if (item) {
                            return item.split('=');
                        }
                    })
                    .compact()
                    .object()
                    .value();
            }
        };
    });

    ApplicationServices.factory('FileDownloadService', function ($log, $q, $window, $timeout, SERVICES_BASE, RESOURCE_NAME, SessionService, UtilService) {
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
                xhr.setRequestHeader("Channel", 'CC-Portal');
                xhr.setRequestHeader("Username", SessionService.getUsername());
                xhr.setRequestHeader("TransactionId", new Date().getTime());
                xhr.setRequestHeader("ServiceLabel", 'Download Service');
                xhr.setRequestHeader("ResourceName", RESOURCE_NAME);
                xhr.responseType = "blob";
                xhr.onreadystatechange = function () {
                    UtilService.showDummySpinner();

                    if (callback && (this.readyState == this.DONE)) {
                        UtilService.hideDummySpinner();

                        if (this.status === 200) {
                            var contentDisposition = this.getResponseHeader('content-disposition');
                            var fileName = _self.extractFileNameFromContentDisposition(contentDisposition);

                            callback(this.response, fileName, this.status);
                        } else {
                            callback(null, null, this.status);
                        }
                    }
                };
                xhr.send(null);
            },
            downloadFileAndGetBlob: function (srcUrl, callback) {
                this.downloadFile(srcUrl, function (blob, fileName, status) {
                    callback(blob, fileName, status);
                });
            },
            downloadFileAndGenerateUrl: function (srcUrl, callback, bloblUrlTtl) {
                this.downloadFile(srcUrl, function (blob, fileName) {
                    var _URL = $window.URL || $window.webkitURL || $window.mozURL;
                    var url = _URL.createObjectURL(blob);

                    // Revoke the url after 3 minutes.
                    $timeout(function () {
                        // Add this url to the url revoke queue.
                        _URL.revokeObjectURL(url);
                    }, bloblUrlTtl || 3 * 60 * 1000);

                    callback(url, fileName);
                });
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

    ApplicationServices.service('SessionService', function ($rootScope, $log, $window, $http, $timeout, $state, UtilService, RESOURCE_NAME) {
        return {
            getSessionKey: function (sessionKeyConst) {
                var sessionKey = UtilService.getFromSessionStore(sessionKeyConst || UtilService.SESSION_KEY);

                return sessionKey;
            },
            getUsername: function (usernameKeyConst) {
                var username = UtilService.getFromSessionStore(usernameKeyConst || UtilService.USERNAME_KEY);

                return username;
            },
            getUserId: function (sessionKeyConst) {
                var sessionKey = this.getSessionKey(sessionKeyConst);

                var jwt = UtilService.parseJwt(sessionKey.token);

                return jwt.sub.cmpfToken.uid;
            },
            isUserAdmin: function () {
                var isAdmin = UtilService.getFromSessionStore(UtilService.USER_IS_ADMIN_KEY);

                return isAdmin;
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

                return subscriberProfile.state ? subscriberProfile.state.currentState : 'N/A';
            },
            getSessionUserRights: function (userRightsKeyConstant) {
                var userRights = UtilService.getFromSessionStore(userRightsKeyConstant || UtilService.USER_RIGHTS);

                return userRights;
            },
            setResourceNameHeader: function () {
                $http.defaults.headers.common.ResourceName = RESOURCE_NAME;
            },
            setAuthorizationHeader: function (token) {
                $http.defaults.headers.common.Authorization = 'Bearer ' + token;
            },
            getSessionOrganization: function () {
                var organization = UtilService.getFromSessionStore(UtilService.USER_ORGANIZATION_KEY);

                return organization;
            },
            getSessionOrganizationId: function () {
                var organization = this.getSessionOrganization();

                return organization.id;
            },
            saveUserAttributesInSession: function (username, authenticateResponse) {
                this.setAuthorizationHeader(authenticateResponse.token);

                UtilService.putToSessionStore(UtilService.SESSION_KEY, authenticateResponse);
                UtilService.putToSessionStore(UtilService.USERNAME_KEY, username);
            },
            isSessionValid: function (sessionKeyConstant, usernameKeyConstant, userRightsKeyConstant) {
                var sessionUserRights = this.getSessionUserRights(userRightsKeyConstant);
                if (sessionUserRights && sessionUserRights.resourceName === RESOURCE_NAME) {
                    // Check the session key, username and user rights only to be sure there is a valid session. The portal will be
                    // used the tokens that saved in the session key to be able to go to the restful services.
                    return !_.isEmpty(this.getSessionKey(sessionKeyConstant)) && !_.isEmpty(this.getUsername(usernameKeyConstant)) && !_.isEmpty(sessionUserRights.rights);
                }

                return false;
            },
            logout: function () {
                angular.element(document.querySelector('body')).addClass('hidden');

                this.sessionInvalidate();

                if ($rootScope.queryStringParams.referrer && $rootScope.queryStringParams.referrer === 'adminportal') {
                    window.location.href = '/adminportal/app.html#!/logout';
                } else {
                    $timeout(function () {
                        $window.location.href = 'app.html#!/login';
                        $window.location.reload();
                    }, 0);
                }
            },
            cleanValues: function () {
                UtilService.removeFromSessionStore(UtilService.SESSION_KEY);
                UtilService.removeFromSessionStore(UtilService.SITE_INFORMATION_KEY);
                UtilService.removeFromSessionStore(UtilService.USERNAME_KEY);
                UtilService.removeFromSessionStore(UtilService.MSISDN_KEY);
                UtilService.removeFromSessionStore(UtilService.USER_RIGHTS);
                UtilService.removeFromSessionStore(UtilService.USER_IS_ADMIN_KEY);
                UtilService.removeFromSessionStore(UtilService.SUBSCRIBER_PROFILE_KEY);
                UtilService.removeFromSessionStore(UtilService.USER_ORGANIZATION_KEY);
                UtilService.removeFromSessionStore(UtilService.USER_ORGANIZATION_ID_KEY);
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

    // SSM Services
    ApplicationServices.factory('SSMSubscribersService', function ($log, $q, $translate, notification, UtilService, SSMMobilySubscribersRestangular, SSMSubscriptionsRestangular, CSSMSubscriptionsRestangular) {
        var getTheErrorMessage = function (message) {
            var errorMsg = message;
            var errorMsgPos = message.indexOf('ErrorMsg');
            if (errorMsgPos > -1) {
                var errorMsgEndPos = message.indexOf(' Msisdn:');
                errorMsg = message.substring(errorMsgPos + 9, errorMsgEndPos).trim();
            }

            return errorMsg;
        };

        return {
            showApiError: function (response) {
                var type = 'warning', message;

                if (response) {
                    if (response.message) {
                        var errorMsg = getTheErrorMessage(response.message);
                        message = errorMsg.split(':')[0] + '...';
                    } else if (response.data) {
                        if (response.data.message) {
                            var errorMsg = getTheErrorMessage(response.data.message);
                            message = errorMsg.split(':')[0] + '...';
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
            prepareSubscriberProfile: function (subscriber) {
                var subscriberProfile = {
                    id: subscriber.id,
                    activationDate: subscriber.activationDate ? subscriber.activationDate : 'N/A',
                    msisdn: subscriber.msisdn ? subscriber.msisdn : 'N/A',
                    imsi: subscriber.imsi ? subscriber.imsi : 'N/A',
                    subscriberAccountNumber: subscriber.subscriberAccountNumber ? subscriber.subscriberAccountNumber : 'N/A',
                    billingAccountNumber: subscriber.billingAccountNumber,
                    corporateAccountNumber: subscriber.corporateAccountNumber,
                    lang: subscriber.lang,
                    paymentType: subscriber.paymentType,
                    state: subscriber.state,
                    subscriptions: subscriber.subscriptions,
                    contentSubscriptions: subscriber.contentSubscriptions,
                    attributes: subscriber.attributes
                };

                return subscriberProfile;
            },
            // Subscriber Operations
            getSubscriberByMsisdn: function (msisdn, getRealSubscriber) {
                var _self = this;

                var deferredFindSubscriber = $q.defer();

                var promise = SSMMobilySubscribersRestangular.one('/' + msisdn).get();
                promise.then(function (response) {
                    // If there is no subscriber with specified MSISDN
                    if (_.isEmpty(response) || !response.msisdn) {
                        $log.debug('Subscriber not found with the msisdn: ', msisdn);

                        deferredFindSubscriber.reject(response);
                    } else { // Found a subscriber as per specified MSISDN and put it to the session store.
                        $log.debug('Subscriber found by the msisdn: ', msisdn, ', Response: ', response);

                        var subscriberProfile = _self.prepareSubscriberProfile(response);
                        $log.debug('Prepared subscriber profile for the msisdn: ', msisdn, ', SubscriberProfile: ', subscriberProfile);

                        // Here is writing application styled json object to the current session
                        UtilService.putToSessionStore(UtilService.SUBSCRIBER_PROFILE_KEY, subscriberProfile);
                        // Store msisdn on the session.
                        UtilService.putToSessionStore(UtilService.MSISDN_KEY, response.msisdn);

                        deferredFindSubscriber.resolve(getRealSubscriber ? response : subscriberProfile);
                    }
                }, function (response) {
                    $log.debug('Error: ', response);

                    deferredFindSubscriber.reject(response);
                });

                UtilService.addPromiseToTracker(deferredFindSubscriber.promise);

                return deferredFindSubscriber.promise;
            },
            updateSubscriber: function (subscriber) {
                var promise = SSMMobilySubscribersRestangular.all('').customPUT(subscriber);

                UtilService.addPromiseToTracker(promise, undefined);

                return promise;
            },
            // Subscription methods
            createSubscription: function (msisdn, subscription) {
                var promise = SSMSubscriptionsRestangular.all(msisdn + '/subscriptions').post(subscription);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateSubscription: function (msisdn, state) {
                var promise = SSMSubscriptionsRestangular.all(msisdn + '/subscriptions').customPUT(state);

                UtilService.addPromiseToTracker(promise, undefined);

                return promise;
            },
            // CSSM Subscription methods
            createCSSMContentSubscription: function (subscription) {
                var promise = CSSMSubscriptionsRestangular.all('/content/v1').post(subscription);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateCSSMContentSubscriptionByMsisdn: function (offerSubscriptionPayload) {
                var promise = CSSMSubscriptionsRestangular.all('/contentOfferSubscriptions/v1').customPUT(offerSubscriptionPayload);

                UtilService.addPromiseToTracker(promise, undefined);

                return promise;
            },
            updateCSSMContentSubscriptionBySubscriptionId: function (subscriptionId, offerSubscriptionPayload) {
                var promise = CSSMSubscriptionsRestangular.all('/contentOfferSubscriptions/v1/' + subscriptionId).customPUT(offerSubscriptionPayload);

                UtilService.addPromiseToTracker(promise, undefined);

                return promise;
            },
            createCSSMServiceOfferSubscription: function (subscription) {
                var promise = CSSMSubscriptionsRestangular.all('/offer/v1').post(subscription);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateCSSMServiceOfferSubscriptionByMsisdn: function (offerSubscriptionPayload) {
                var promise = CSSMSubscriptionsRestangular.all('/serviceOfferSubscriptions/v1').customPUT(offerSubscriptionPayload);

                UtilService.addPromiseToTracker(promise, undefined);

                return promise;
            },
            updateCSSMServiceOfferSubscriptionBySubscriptionId: function (subscriptionId, offerSubscriptionPayload) {
                var promise = CSSMSubscriptionsRestangular.all('/serviceOfferSubscriptions/v1/' + subscriptionId).customPUT(offerSubscriptionPayload);

                UtilService.addPromiseToTracker(promise, undefined);

                return promise;
            }
        }
    });

    // CMPF Services
    ApplicationServices.factory('CMPFService', function ($log, $q, $filter, $translate, notification, UtilService, CMPFAuthRestangular, CMPFSSOAuthRestangular, CMPFRestangular,
                                                         SessionService, DEFAULT_REST_QUERY_LIMIT, BATCH_SIZE, CURRENCY) {
        return {
            DEFAULT_ORGANIZATION_NAME: "Mobily",
            DEFAULT_RBT_ORGANIZATION_NAME: "MobilyRBT",
            DEFAULT_SDP_SERVICE_NAME: "SDP",
            // Subscriber related profiles
            SUBSCRIBER_PROFILE: 'SubscriberProfile',
            // Organization related profiles
            OPERATOR_PROFILE: 'OperatorProfile',
            ORGANIZATION_MAIN_SERVICE_CATEGORY_PROFILE: 'ServiceMainCategoryProfile',
            ORGANIZATION_SUB_SERVICE_CATEGORY_PROFILE: 'ServiceSubCategoryProfile',
            ORGANIZATION_SERVICE_LABEL_PROFILE: 'ServiceLabelProfile',
            ORGANIZATION_SETTLEMENT_TYPE_PROFILE: 'SettlementTypeProfile',
            ORGANIZATION_BUSINESS_TYPE_PROFILE: 'BusinessTypeProfile',
            // Service provider related profiles
            SERVICE_PROVIDER_I18N_PROFILE: 'Provideri18nProfile',
            // Service related profiles
            SERVICE_PROFILE: 'ServiceProfile',
            SERVICE_LEGACY_ID_PROFILE: "ServiceLegacyIDProfile",
            SERVICE_I18N_PROFILE: 'Servicei18nProfile',
            SERVICE_CAPABILITY_ACCESS_PROFILE: 'ServiceCapabilityAccessProfile',
            SERVICE_ALERT_TEMPLATE_PROFILE: 'AlertTemplateProfile',
            SERVICE_ON_DEMAND_TEMPLATE_PROFILE: 'OnDemandTemplateProfile',
            SERVICE_OTHER_TEMPLATE_PROFILE: 'OtherTemplateProfile',
            SERVICE_SMS_SLA_PROFILE: 'SMSSLAProfile',
            SERVICE_MMS_SLA_PROFILE: 'MMSSLAProfile',
            SERVICE_WEB_WAP_SLA_PROFILE: 'WEBWAPSLAProfile',
            SERVICE_PRODUCT_PROFILE: 'ProductProfile',
            SERVICE_MO_CHARGING_PROFILE: 'MOChargingProfile',
            SERVICE_MT_CHARGING_PROFILE: 'MTChargingProfile',
            SERVICE_SENDER_ID_PROFILE: 'SenderIdProfile',
            SERVICE_KEYWORD_CHAPTER_MAPPING_PROFILE: 'KeywordChapterMappingProfile',
            SERVICE_ON_DEMAND_I18N_PROFILE: 'OnDemandi18nProfile',
            SERVICE_SUBSCRIPTION_NOTIFICATION_PROFILE: 'SubscriptionNotificationProfile',
            SERVICE_COPYRIGHT_FILE_PROFILE: 'ServiceCopyrightFileProfile',
            SERVICE_VAT_PROFILE: 'ServiceVATProfile',
            SERVICE_CONTENT_BASED_SETTLEMENT_PROFILE: 'ServiceContentBasedSettlementProfile',
            // Service DCB related profiles
            SERVICE_DCB_PROFILE: 'DCBProfile',
            SERVICE_DCB_SERVICE_PROFILE: 'DCBServiceProfile',
            // Offer related profiles
            OFFER_I18N_PROFILE: "Offeri18nProfile",
            XSM_OFFER_PROFILE: "XsmOfferProfile",
            XSM_CHARGING_PROFILE: "XsmChargingProfile",
            SMS_PORTAL_I18N_PROFILE: "SMSPortali18nProfile",
            OFFER_ELIGIBILITY_PROFILE: "OfferEligibilityProfile",
            // Generic profile names
            ENTITY_AUDIT_PROFILE: 'EntityAuditProfile',
            // User group related definitions
            DSP_CUSTOMER_CARE_ADMIN_GROUP: 'DSP Customer Care Admin',
            DSP_CUSTOMER_CARE_USER_GROUP_PREFIX: 'DSP Customer Care',
            // User related profiles
            USER_PROFILE_NAME: 'UserProfile',
            RELATED_RESOURCES: ['DSP Customer Care Portal'],
            // Organization names
            DEFAULT_DCB_SETTINGS_ORGANIZATION_NAME: "Mobily DCB Settings",
            DEFAULT_SERVICE_CATEGORIES_ORGANIZATION_NAME: "Mobily Service Categories",
            DEFAULT_BUSINESS_TYPES_ORGANIZATION_NAME: "Mobily Business Types",
            ERROR_CODES: {
                DUPLICATE_USER_NAME: 5025801
            },
            // Methods
            prepareProfileListValuesJSON: function (array) {
                var objArray = [];
                _.each(array, function (value) {
                    objArray.push({value: (_.isObject(value) ? String(value.value) : value)});
                });

                return objArray;
            },
            prepareProfile: function (updatedProfile, originalProfile) {
                // First we delete the profileId since it is for internal usage.
                delete updatedProfile.profileId;

                var attrArray = [];

                // Check the all fields of the updated object and put them into the new array
                // or the previous one.
                _.each(updatedProfile, function (value, key) {
                    var attr;
                    if (originalProfile) {
                        attrArray = originalProfile.attributes;
                        attr = _.find(attrArray, function (attribute) {
                            return attribute.name === key;
                        });
                    }

                    if (attr) {
                        if (value && _.isArray(value)) {
                            attr.listValues = value;
                        } else {
                            attr.value = value;
                        }
                    } else {
                        if (value && _.isArray(value)) {
                            attrArray.push({
                                "name": key,
                                "listValues": value
                            });
                        } else {
                            attrArray.push({
                                "name": key,
                                "value": value
                            });
                        }
                    }
                });

                return attrArray;
            },
            showApiError: function (response) {
                var type = 'warning', message;

                if (response) {
                    if (response.errorCode) {
                        message = response.errorCode + ' - ' + response.errorDescription
                    } else if (response.data) {
                        if (response.data.errorCode) {
                            message = response.data.errorCode + ' - ' + response.data.errorDescription
                        } else {
                            type = 'danger';
                            message = $translate.instant('CommonMessages.GenericServerError');
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
            authenticateSSO: function (credential) {
                var authenticateProm = CMPFSSOAuthRestangular.all('authenticate').post(credential);
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
            getAllOrganizations: function (withchildren, withprofiles, resultProfileDefNames) {
                var _self = this;
                var mainDeferred = $q.defer();
                var deferred = $q.defer();

                _self.getOrganizations(0, BATCH_SIZE, withchildren, withprofiles, resultProfileDefNames).then(function (firstResponse) {
                    if (firstResponse) {
                        if (firstResponse.metaData.totalCount < BATCH_SIZE) {
                            deferred.resolve(firstResponse);
                        } else {
                            var promises = [];

                            for (var offset = BATCH_SIZE; offset < firstResponse.metaData.totalCount; offset = offset + BATCH_SIZE) {
                                promises.push(_self.getOrganizations(offset, BATCH_SIZE, withchildren, withprofiles, resultProfileDefNames));
                            }

                            $q.all(promises).then(function (totalResponses) {
                                totalResponses.forEach(function (totalResponse) {
                                    firstResponse.organizations = firstResponse.organizations.concat(totalResponse.organizations);
                                });

                                deferred.resolve(firstResponse);
                            });
                        }
                    } else {
                        deferred.reject(firstResponse);
                    }
                }, function (respose) {
                    deferred.reject(response);
                });

                // Listen the inner promise and prepare the main deferred response.
                deferred.promise.then(function (response) {
                    var filteredOrganizations = _.filter(response.organizations, function (organization) {
                        // OperatorProfile
                        var operatorProfiles = _self.getProfileAttributes(organization.profiles, _self.OPERATOR_PROFILE);
                        if (operatorProfiles.length > 0) {
                            return !operatorProfiles[0].IsInternal;
                        }

                        return true;
                    });

                    mainDeferred.resolve({
                        metaData: {
                            limit: response.metaData.limit,
                            offset: response.metaData.offset,
                            totalCount: filteredOrganizations.length
                        },
                        organizations: filteredOrganizations
                    });
                }, function (response) {
                    mainDeferred.reject(response);
                });

                UtilService.addPromiseToTracker(mainDeferred.promise);

                return mainDeferred.promise;
            },
            getOrganizations: function (offset, limit, withchildren, withprofiles, resultProfileDefNames, promiseTracker) {
                var url = 'organizations?offset=' + offset + '&limit=' + limit + '&withchildren=' + (withchildren ? withchildren : false) + '&withprofiles=' + (withprofiles ? withprofiles : false);

                // Add the profile names as comma separated string to get the response only with the specified profile names.
                if (resultProfileDefNames && resultProfileDefNames.length > 0) {
                    url += '&resultProfileDefNames=' + resultProfileDefNames.join(',');
                }

                var prom = CMPFRestangular.one(url).get();

                return prom;
            },
            getAllOrganizationsByName: function (offset, limit, name, promiseTracker) {
                var url = 'organizations?withprofiles=true&offset=' + offset + '&limit=' + limit + '&name=%25' + name + '%25';

                var promise = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getOrganizationById: function (organizationsId) {
                var promise = CMPFRestangular.one('networkoperators/' + organizationsId + '?withchildren=true&withprofiles=true').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Services
            getAllServicesByOrganizationId: function (organizationId, withchildren, withprofiles, state, resultProfileDefNames) {
                var _self = this;
                var deferred = $q.defer();

                _self.getServicesByOrganizationId(0, BATCH_SIZE, organizationId, withchildren, withprofiles, state, resultProfileDefNames).then(function (firstResponse) {

                    if (firstResponse) {
                        if (firstResponse.metaData.totalCount < BATCH_SIZE) {
                            deferred.resolve(firstResponse);
                        } else {
                            var promises = [];

                            for (var offset = BATCH_SIZE; offset < firstResponse.metaData.totalCount; offset = offset + BATCH_SIZE) {
                                promises.push(_self.getServicesByOrganizationId(offset, BATCH_SIZE, organizationId, withchildren, withprofiles, state, resultProfileDefNames));
                            }

                            $q.all(promises).then(function (totalResponses) {
                                totalResponses.forEach(function (totalResponse) {
                                    firstResponse.services = firstResponse.services.concat(totalResponse.services);
                                });

                                deferred.resolve(firstResponse);
                            });
                        }
                    } else {
                        deferred.reject(firstResponse);
                    }
                }, function (respose) {
                    deferred.reject(response);
                });

                UtilService.addPromiseToTracker(deferred.promise);

                return deferred.promise;
            },
            getServicesByOrganizationId: function (offset, limit, organizationId, withchildren, withprofiles, state, resultProfileDefNames) {
                var url = 'services?offset=' + offset + '&limit=' + limit + '&organizationId=' + organizationId + '&withchildren=' + (withchildren ? withchildren : false) + '&withprofiles=' + (withprofiles ? withprofiles : false);
                if (state) {
                    url += '&state=' + state;
                }

                // Add the profile names as comma separated string to get the response only with the specified profile names.
                if (resultProfileDefNames && resultProfileDefNames.length > 0) {
                    url += '&resultProfileDefNames=' + resultProfileDefNames.join(',');
                }

                var prom = CMPFRestangular.one(url).get();

                UtilService.addPromiseToTracker(prom);

                return prom;
            },
            getAllServices: function (withchildren, withprofiles, resultProfileDefNames, profileDefName, nameValues) {
                var _self = this;
                var deferred = $q.defer();

                _self.getServices(0, BATCH_SIZE, withchildren, withprofiles, resultProfileDefNames, profileDefName, nameValues).then(function (firstResponse) {
                    if (firstResponse) {
                        if (firstResponse.metaData.totalCount < BATCH_SIZE) {
                            deferred.resolve(firstResponse);
                        } else {
                            var promises = [];

                            for (var offset = BATCH_SIZE; offset < firstResponse.metaData.totalCount; offset = offset + BATCH_SIZE) {
                                promises.push(_self.getServices(offset, BATCH_SIZE, withchildren, withprofiles, resultProfileDefNames, profileDefName, nameValues));
                            }

                            $q.all(promises).then(function (totalResponses) {
                                totalResponses.forEach(function (totalResponse) {
                                    firstResponse.services = firstResponse.services.concat(totalResponse.services);
                                });

                                deferred.resolve(firstResponse);
                            });
                        }
                    } else {
                        deferred.reject(firstResponse);
                    }
                }, function (respose) {
                    deferred.reject(response);
                });

                UtilService.addPromiseToTracker(deferred.promise);

                return deferred.promise;
            },
            getServices: function (offset, limit, withchildren, withprofiles, resultProfileDefNames, profileDefName, nameValues) {
                var url = 'services?offset=' + offset + '&limit=' + limit + '&withchildren=' + (withchildren ? withchildren : false) + '&withprofiles=' + (withprofiles ? withprofiles : false);

                // Add the profile names as comma separated string to get the response only with the specified profile names.
                if (resultProfileDefNames && resultProfileDefNames.length > 0) {
                    url += '&resultProfileDefNames=' + resultProfileDefNames.join(',');
                }

                // Add the profileDefName only with the specified profile name.
                if (profileDefName) {
                    url += '&profileDefName=' + profileDefName;
                }

                // Add the name and values in order to filter by attribute names
                if (nameValues) {
                    _.each(nameValues, function (value, name) {
                        if (!_.isUndefined(value) && value !== null) {
                            url += '&' + name + '=' + value;
                        }
                    });
                }

                var prom = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(prom);

                return prom;
            },
            getService: function (id) {
                var prom = CMPFRestangular.one('services/' + id + '?withchildren=true&withprofiles=true').get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            getServiceByName: function (name, withchildren, withprofiles) {
                var prom = CMPFRestangular.one('services?name=' + name + '&withchildren=' + (withchildren ? withchildren : false) + '&withprofiles=' + (withprofiles ? withprofiles : false)).get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            getServiceByCategory: function (categoryId, offset, limit, withchildren, withprofiles) {
                var url = 'services?offset=' + offset + '&limit=' + limit + '&profileDefName=ServiceProfile&CategoryID=' + categoryId + '&withchildren=' + (withchildren ? withchildren : false) + '&withprofiles=' + (withprofiles ? withprofiles : false);

                var promise = CMPFRestangular.one(url).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getServiceByType: function (typeName, offset, limit, withchildren, withprofiles) {
                var url = 'services?offset=' + offset + '&limit=' + limit + '&profileDefName=ServiceProfile&Type=' + typeName + '&withchildren=' + (withchildren ? withchildren : false) + '&withprofiles=' + (withprofiles ? withprofiles : false);

                var promise = CMPFRestangular.one(url).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Offers
            getAllOffers: function (withchildren, withorganization, withprofiles, state, resultProfileDefNames, name) {
                var _self = this;
                var deferred = $q.defer();

                _self.getOffers(0, BATCH_SIZE, withchildren, withorganization, withprofiles, state, resultProfileDefNames, name).then(function (firstResponse) {
                    if (firstResponse) {
                        if (firstResponse.metaData.totalCount < BATCH_SIZE) {
                            deferred.resolve(firstResponse);
                        } else {
                            var promises = [];

                            for (var offset = BATCH_SIZE; offset < firstResponse.metaData.totalCount; offset = offset + BATCH_SIZE) {
                                promises.push(_self.getOffers(offset, BATCH_SIZE, withchildren, withorganization, withprofiles, state, resultProfileDefNames, name));
                            }

                            $q.all(promises).then(function (totalResponses) {
                                totalResponses.forEach(function (totalResponse) {
                                    firstResponse.offers = firstResponse.offers.concat(totalResponse.offers);
                                });

                                deferred.resolve(firstResponse);
                            });
                        }
                    } else {
                        deferred.reject(firstResponse);
                    }
                }, function (respose) {
                    deferred.reject(response);
                });

                UtilService.addPromiseToTracker(deferred.promise);

                return deferred.promise;

            },
            getOffers: function (offset, limit, withchildren, withorganization, withprofiles, state, resultProfileDefNames, name) {
                var url = 'offers?offset=' + offset + '&limit=' + limit +
                    '&withchildren=' + (withchildren ? withchildren : false) +
                    '&withorganization=' + (withorganization ? withorganization : false) +
                    '&withprofiles=' + (withprofiles ? withprofiles : false) +
                    (name ? '&name=%25' + name + '%25' : '');

                if (state) {
                    url += '&state=' + state;
                }

                // Add the profile names as comma separated string to get the response only with the specified profile names.
                if (resultProfileDefNames && resultProfileDefNames.length > 0) {
                    url += '&resultProfileDefNames=' + resultProfileDefNames.join(',');
                }

                var prom = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(prom);

                return prom;
            },
            getOffer: function (id) {
                var prom = CMPFRestangular.one('offers/' + id + '?withchildren=true&withprofiles=true').get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            getActiveOffersByService: function (offset, limit, serviceName, withchildren, withprofiles, promiseTracker) {
                var prom = CMPFRestangular.one('offers?state=ACTIVE&offset=' + offset + '&limit=' + limit + '&serviceName=' + serviceName + '&withchildren=' + (withchildren ? withchildren : false) + '&withprofiles=' + (withprofiles ? withprofiles : false)).get();
                UtilService.addPromiseToTracker(prom, promiseTracker);

                return prom;
            },
            findOfferByName: function (offerName) {
                var activeOffersByServiceProm = CMPFRestangular.one('offers?withchildren=true&withprofiles=true&name=' + offerName).get();
                UtilService.addPromiseToTracker(activeOffersByServiceProm);

                return activeOffersByServiceProm;
            },
            getOffersByServiceName: function (offset, limit, serviceName) {
                var prom = CMPFRestangular.one('offers?withchildren=true&offset=' + offset + '&limit=' + limit + '&serviceName=' + serviceName).get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            // User accounts
            getUserAccount: function (userId, withchildren, withprofiles) {
                var promise = CMPFRestangular.one('useraccounts/' + userId + '?withchildren=' + (withchildren ? withchildren : false) + '&withprofiles=' + (withprofiles ? withprofiles : false)).get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            getUserAccountRights: function (id) {
                var _self = this;
                var deferred = $q.defer();

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
            getUserAccountsByOrganizationId: function (offset, limit, organizationId) {
                var promise = CMPFRestangular.one('useraccounts?withchildren=true&withprofiles=true&offset=' + offset + '&limit=' + limit + '&organizationId=' + organizationId).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getUserAccountGroups: function (id, offset, limit) {
                var prom = CMPFRestangular.one('useraccounts/' + id + '/usergroups?withchildren=true&offset=' + offset + '&limit=' + limit).get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            getUserAccountGroupsByName: function (name) {
                var promise = CMPFRestangular.one('usergroups?withchildren=false&name=%25' + name + '%25').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createUserAccount: function (newItem) {
                var promise = CMPFRestangular.all('useraccounts').post(newItem);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateUserAccount: function (account) {
                var promise = CMPFRestangular.all('useraccounts/' + account.id).customPUT(account);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteUserAccount: function (account) {
                var promise = CMPFRestangular.one('useraccounts/' + account.id).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            addNewAccountsToUserGroup: function (group, userAccounts) {
                var promise = CMPFRestangular.one('usergroups/' + group.id + '/useraccounts').customPUT(userAccounts);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            removeAccountFromUserGroup: function (group, userAccount) {
                var promise = CMPFRestangular.one('usergroups/' + group.id + '/useraccounts/' + userAccount.id).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Profile operations
            getOrphanProfilesByProfileDefName: function (profileDefName, withchildren) {
                var url = 'profiles/orphan?profileDefName=' + profileDefName + '&withchildren=' + (withchildren ? withchildren : false);

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
            },
            getServiceLabels: function (organization) {
                return this.getProfileAttributes(organization.profiles, this.ORGANIZATION_SERVICE_LABEL_PROFILE);
            },
            getSettlementTypes: function (organization) {
                return this.getProfileAttributes(organization.profiles, this.ORGANIZATION_SETTLEMENT_TYPE_PROFILE);
            },
            getBusinessTypes: function (organization) {
                return this.getProfileAttributes(organization.profiles, this.ORGANIZATION_BUSINESS_TYPE_PROFILE);
            },
            // EntityAuditProfile
            checkEntityAuditProfile: function (profiles) {
                // EntityAuditProfile
                var entityAuditProfiles = this.getProfileAttributes(profiles, this.ENTITY_AUDIT_PROFILE);
                if (!entityAuditProfiles || entityAuditProfiles.length === 0) {
                    var sessionOrganization = SessionService.getSessionOrganization();
                    var username = SessionService.getUsername();
                    var currentTimestamp = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');

                    // EntityAuditProfile
                    var entityAuditProfile = {
                        CreatedBy: username,
                        CreatedOn: currentTimestamp,
                        CreateApprovedBy: username,
                        CreateApprovedOn: currentTimestamp,
                        LastUpdatedBy: username,
                        LastUpdatedOn: currentTimestamp,
                        LastUpdateApprovedBy: username,
                        LastUpdateApprovedOn: currentTimestamp
                    };
                    var entityAuditProfile = this.prepareNewEntityAuditProfile(entityAuditProfile);
                    profiles.push(entityAuditProfile);
                }
            },
            prepareNewEntityAuditProfile: function (entityAuditProfile) {
                var emptyProfile = {
                    "name": this.ENTITY_AUDIT_PROFILE,
                    "profileDefinitionName": this.ENTITY_AUDIT_PROFILE,
                    "attributes": [
                        {
                            "name": "CreatedBy",
                            "value": entityAuditProfile.CreatedBy
                        },
                        {
                            "name": "CreatedOn",
                            "value": entityAuditProfile.CreatedOn
                        },
                        {
                            "name": "CreateApprovedBy",
                            "value": entityAuditProfile.CreateApprovedBy
                        },
                        {
                            "name": "CreateApprovedOn",
                            "value": entityAuditProfile.CreateApprovedOn
                        },
                        {
                            "name": "LastUpdatedBy",
                            "value": entityAuditProfile.LastUpdatedBy
                        },
                        {
                            "name": "LastUpdatedOn",
                            "value": entityAuditProfile.LastUpdatedOn
                        },
                        {
                            "name": "LastUpdateApprovedBy",
                            "value": entityAuditProfile.LastUpdateApprovedBy
                        },
                        {
                            "name": "LastUpdateApprovedOn",
                            "value": entityAuditProfile.LastUpdateApprovedOn
                        }
                    ]
                };

                return emptyProfile;
            },
            getMainServiceCategories: function (organization) {
                return this.getProfileAttributes(organization.profiles, this.ORGANIZATION_MAIN_SERVICE_CATEGORY_PROFILE);
            },
            getSubServiceCategories: function (organization) {
                return this.getProfileAttributes(organization.profiles, this.ORGANIZATION_SUB_SERVICE_CATEGORY_PROFILE);
            }
        };
    });

    // DCB Services
    ApplicationServices.factory('DCBService', function ($log, UtilService, DCBRestangular) {
        /*
        curl --location --request POST 'http://10.35.36.194:9077/api/Associate/{service-id}' \
        --header 'Content-Type: application/json' \
        --data-raw ' {
                "accountInfo": {
                        "accountId": "966560329071",
                        "accountIdType": "MSISDN"
                }
        }'
        */
        /*
        curl --location --request POST 'http://10.35.36.194:9077/api/ProvisioningEvent' \
        --header 'Content-Type: application/json' \
        --data-raw '{
                "msisdn": "966560329071",
                "accountNumber": "992011062246373260",
                "eventType": "DISCONNECT"
        }'
        */

        return {
            GENERIC_DCB_ALL_SERVICE_ID: -11,
            GENERIC_DCB_SERVICE_ID: -1,
            // Subscriber api methods
            getSubscriberStatistics: function (msisdn, accountNumber) {
                var url = 'Statistics?msisdn=' + msisdn + '&account_number=' + accountNumber;

                var promise = DCBRestangular.one(url).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getSubscriberSettings: function (msisdn, accountNumber) {
                var url = 'Subscriber?msisdn=' + msisdn + '&account_number=' + accountNumber;

                var promise = DCBRestangular.one(url).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateSubscriberSettings: function (msisdn, accountNumber, settings) {
                var url = 'Subscriber?msisdn=' + msisdn + '&account_number=' + accountNumber;

                var promise = DCBRestangular.all(url).customPUT(settings);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            associate: function (serviceId, accountInfo) {
                var url = 'Associate/' + serviceId;

                var promise = DCBRestangular.all(url).post(accountInfo);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            dissociate: function (serviceId, accountInfo) {
                var url = 'Dissociate/' + serviceId;

                var promise = DCBRestangular.all(url).post(accountInfo);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Subscriber capping methods,
            getSubscriberCapping: function (msisdn, accountNumber, serviceId) {
                var url = 'SubscriberCapping?msisdn=' + msisdn + '&account_number=' + accountNumber;
                if (serviceId) {
                    url += '&service_id=' + serviceId;
                }

                var promise = DCBRestangular.one(url).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createSubscriberCapping: function (subscriberCappingRule) {
                var promise = DCBRestangular.all('SubscriberCapping').post(subscriberCappingRule);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateSubscriberCapping: function (subscriberCappingRule) {
                var promise = DCBRestangular.all('SubscriberCapping').customPUT(subscriberCappingRule);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteSubscriberCapping: function (uuid) {
                var promise = DCBRestangular.all('SubscriberCapping?uuid=' + uuid).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        }
    });

    ApplicationServices.factory('DCBConfigService', function ($log, UtilService, DCBConfigRestangular) {
        return {
            getLimit: function () {
                var promise = DCBConfigRestangular.one('limit').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        }
    });

    // Messaging Gateway Services
    ApplicationServices.factory('MessagingGwService', function ($log, MessagingGwRestangular, UtilService) {
        return {
            // Checking for is service alive
            checkStatus: function (promiseTracker) {
                var promise = MessagingGwRestangular.one('/ping').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            }
        };
    });

    ApplicationServices.factory('MessagingGwProvService', function ($log, MessagingGwProvRestangular, UtilService) {
        var getApplications = function (serviceKey) {
            var promise = MessagingGwProvRestangular.all('applications/' + serviceKey).getList();
            UtilService.addPromiseToTracker(promise);

            return promise;
        };
        var getApplication = function (serviceKey, serviceId) {
            var promise = MessagingGwProvRestangular.one('applications/' + serviceKey + '/' + serviceId).get();
            UtilService.addPromiseToTracker(promise);

            return promise;
        };
        var createApplication = function (serviceKey, service) {
            var promise = MessagingGwProvRestangular.all('applications/' + serviceKey).post(service);
            UtilService.addPromiseToTracker(promise);

            return promise;
        };
        var updateApplication = function (serviceKey, service) {
            var promise = MessagingGwProvRestangular.all('applications/' + serviceKey).customPUT(service);
            UtilService.addPromiseToTracker(promise);

            return promise;
        };
        var deleteApplication = function (serviceKey, serviceId) {
            var promise = MessagingGwProvRestangular.all('applications/' + serviceKey + '/' + serviceId).remove();
            UtilService.addPromiseToTracker(promise);

            return promise;
        };

        return {
            getServicesEligibleToCreate: function () {
                var promise = MessagingGwProvRestangular.all('applications/eligible-to-create').getList();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // SMPP
            getSMPPApplications: function () {
                return getApplications('smpp');
            },
            getSMPPApplication: function (serviceId) {
                return getApplication('smpp', serviceId);
            },
            createSMPPApplication: function (service) {
                return createApplication('smpp', service);
            },
            updateSMPPApplication: function (service) {
                return updateApplication('smpp', service);
            },
            deleteSMPPApplication: function (serviceId) {
                return deleteApplication('smpp', serviceId);
            },
            getLiveConnectionsByApplication: function (serviceId) {
                var promise = MessagingGwProvRestangular.all('applications/smpp/connections/' + serviceId).getList();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // WebService
            getWebServiceApplications: function () {
                return getApplications('webservice');
            },
            getWebServiceApplication: function (serviceId) {
                return getApplication('webservice', serviceId);
            },
            createWebServiceApplication: function (service) {
                return createApplication('webservice', service);
            },
            updateWebServiceApplication: function (service) {
                return updateApplication('webservice', service);
            },
            deleteWebServiceApplication: function (serviceId) {
                return deleteApplication('webservice', serviceId);
            },
            // Application Charging
            getApplicationChargingConf: function (serviceId) {
                var promise = MessagingGwProvRestangular.one('applications/' + serviceId + '/nawras_charging').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateApplicationChargingConf: function (serviceId, conf) {
                var promise = MessagingGwProvRestangular.all('applications/' + serviceId + '/nawras_charging').customPUT(conf);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Routings
            getSMPPApplicationRoutingByRange: function (serviceId, rangeStart, rangeEnd) {
                var getCallUrl = 'routing/application/' + serviceId + '/' + encodeURIComponent(rangeStart) + '/' + encodeURIComponent(rangeEnd);

                var promise = MessagingGwProvRestangular.one(getCallUrl).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getSMPPApplicationRoutings: function () {
                var promise = MessagingGwProvRestangular.all('routing/application').getList();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteSMPPApplicationRouting: function (serviceId, rangeStart, rangeEnd) {
                var deleteCallUrl = 'routing/application/' + serviceId + '/' + encodeURIComponent(rangeStart) + '/' + encodeURIComponent(rangeEnd);

                var promise = MessagingGwProvRestangular.all(deleteCallUrl).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createSMPPApplicationRouting: function (rangeItem) {
                var promise = MessagingGwProvRestangular.all('routing/application').post(rangeItem);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            addSMPPApplicationRoutingPattern: function (serviceId, rangeStart, rangeEnd, patternItem) {
                var addUrl = 'routing/application/pattern/' + serviceId + '/' + encodeURIComponent(rangeStart) + '/' + encodeURIComponent(rangeEnd);

                var promise = MessagingGwProvRestangular.all(addUrl).post(patternItem);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteSMPPApplicationRoutingPattern: function (serviceId, rangeStart, rangeEnd, pattern) {
                var deleteCallUrl = 'routing/application/pattern/' + serviceId + '/' + encodeURIComponent(rangeStart) + '/' + encodeURIComponent(rangeEnd) + '?pattern=' + encodeURIComponent(pattern);

                var promise = MessagingGwProvRestangular.all(deleteCallUrl).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Routing test methods
            getSMPPApplicationRoutingTest: function (address, text) {
                var promise = MessagingGwProvRestangular.one('routing/application/test?address=' + encodeURIComponent(address) + '&text=' + encodeURIComponent(text)).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        };
    });

    ApplicationServices.factory('MessagingGwConfService', function ($q, $log, MessagingGwConfRestangular, MessagingGwProvRestangular, UtilService) {
        var prepareUrl = function (slaItemKey, serviceId) {
            var url = serviceId ? 'applications/' + serviceId + '/sla-items/' : 'sla-templates/toygun_apps/';
            url += slaItemKey;

            return url;
        };
        var getSLAItem = function (slaItemKey, serviceId) {
            var restangularService = serviceId ? MessagingGwProvRestangular : MessagingGwConfRestangular;

            var deferred = $q.defer();

            restangularService.one(prepareUrl(slaItemKey, serviceId)).get().then(function (response) {
                deferred.resolve(response ? response : {});
            }, function (response) {
                deferred.reject(response);
            });

            UtilService.addPromiseToTracker(deferred.promise);

            return deferred.promise;
        };
        var createSLAItem = function (slaItem, slaItemKey, serviceId) {
            var restangularService = serviceId ? MessagingGwProvRestangular : MessagingGwConfRestangular;
            var promise = restangularService.all(prepareUrl(slaItemKey, serviceId)).post(slaItem);
            UtilService.addPromiseToTracker(promise);

            return promise;
        };
        var deleteSLAItem = function (slaItemKey, serviceId) {
            var restangularService = serviceId ? MessagingGwProvRestangular : MessagingGwConfRestangular;
            var promise = restangularService.all(prepareUrl(slaItemKey, serviceId)).remove();
            UtilService.addPromiseToTracker(promise);

            return promise;
        };

        return {
            // SLA Items
            // Black Hour
            getBlackHour: function (serviceId) {
                return getSLAItem('blackhour', serviceId);
            },
            createBlackHour: function (slaItem, serviceId) {
                return createSLAItem(slaItem, 'blackhour', serviceId);
            },
            deleteBlackHour: function (serviceId) {
                return deleteSLAItem('blackhour', serviceId);
            },
            // Duplicate Message
            getDuplicateMessage: function (serviceId) {
                return getSLAItem('duplicate-sm', serviceId);
            },
            createDuplicateMessage: function (slaItem, serviceId) {
                return createSLAItem(slaItem, 'duplicate-sm', serviceId);
            },
            deleteDuplicateMessage: function (serviceId) {
                return deleteSLAItem('duplicate-sm', serviceId);
            },
            // Input Rate
            getInputRate: function (serviceId) {
                return getSLAItem('input-rate', serviceId);
            },
            createInputRate: function (slaItem, serviceId) {
                return createSLAItem(slaItem, 'input-rate', serviceId);
            },
            deleteInputRate: function (serviceId) {
                return deleteSLAItem('input-rate', serviceId);
            },
            // Message Length
            getMessageLength: function (serviceId) {
                return getSLAItem('message-length', serviceId);
            },
            createMessageLength: function (slaItem, serviceId) {
                return createSLAItem(slaItem, 'message-length', serviceId);
            },
            deleteMessageLength: function (serviceId) {
                return deleteSLAItem('message-length', serviceId);
            },
            // Quota
            getQuota: function (serviceId) {
                return getSLAItem('quota', serviceId);
            },
            createQuota: function (slaItem, serviceId) {
                return createSLAItem(slaItem, 'quota', serviceId);
            },
            deleteQuota: function (serviceId) {
                return deleteSLAItem('quota', serviceId);
            },
            // Sender Address
            getSenderAddress: function (serviceId) {
                return getSLAItem('sender-address', serviceId);
            },
            createSenderAddress: function (slaItem, serviceId) {
                return createSLAItem(slaItem, 'sender-address', serviceId);
            },
            deleteSenderAddress: function (serviceId) {
                return deleteSLAItem('sender-address', serviceId);
            },
            // Throttler
            getThrottler: function (serviceId) {
                return getSLAItem('throttler', serviceId);
            },
            createThrottler: function (slaItem, serviceId) {
                return createSLAItem(slaItem, 'throttler', serviceId);
            },
            deleteThrottler: function (serviceId) {
                return deleteSLAItem('throttler', serviceId);
            },
            // Keyword Screening
            getKeywordScreening: function (serviceId) {
                return getSLAItem('keyword-screening', serviceId);
            },
            createKeywordScreening: function (slaItem, serviceId) {
                return createSLAItem(slaItem, 'keyword-screening', serviceId);
            },
            deleteKeywordScreening: function (serviceId) {
                return deleteSLAItem('keyword-screening', serviceId);
            }
        };
    });

    // Charging Gateway Services
    ApplicationServices.factory('ChargingGwService', function ($log, ChargingGwRestangular, UtilService) {
        return {
            // Checking for is service alive
            checkStatus: function (promiseTracker) {
                var promise = ChargingGwRestangular.one('/dashboard/ping').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getDashboard: function (promiseTracker) {
                var promise = ChargingGwRestangular.one('/dashboard').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            // Refund methods
            getRefundRecords: function (transactionId) {
                var promise = ChargingGwRestangular.all('refund-records/' + transactionId).getList();
                UtilService.addPromiseToTracker(promise, undefined);

                return promise;
            },
            refund: function (serviceId, refundItem) {
                var promise = ChargingGwRestangular.all('direct-debit/refund/' + serviceId).customPUT(refundItem, undefined, undefined, {'Channel': 'CC-Portal'});
                UtilService.addPromiseToTracker(promise, undefined);

                return promise;
            }
        };
    });

    ApplicationServices.factory('ChargingGwConfService', function ($log, $q, ChargingGwConfRestangular, UtilService) {
        return {
            // Subscriber Preferences
            getSubscriberPreferences: function (msisdn) {
                // Passing nullable=true because of we want the service return a response if there is no subscriber record.
                /*
                var promise = ChargingGwConfRestangular.one('/subscriberPreferences/' + msisdn + '?nullable=true').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
                */

                var deferred = $q.defer();

                deferred.resolve({"defaultLimit": 35, "limit": 50, "msisdn": msisdn});

                return deferred.promise;
            },
            updateSubscriberPreferences: function (preferences) {
                var promise = ChargingGwConfRestangular.all('/subscriberPreferences').customPUT(preferences);
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        };
    });

    // Bulk Messaging Services
    ApplicationServices.factory('BulkMessagingOperationsService', function ($log, BulkMessagingOperationsGrRestangular, UtilService) {
        var getGlobalBlackLists = function (key) {
            var promise = BulkMessagingOperationsGrRestangular.one('dlists/gbl/' + key).get();
            UtilService.addPromiseToTracker(promise);
            return promise;
        };

        return {
            // Global lists
            getGlobalSMSBlackLists: function () {
                return getGlobalBlackLists('sms');
            },
            getGlobalMMSBlackLists: function () {
                return getGlobalBlackLists('mms');
            },
            getGlobalIVRBlackLists: function () {
                return getGlobalBlackLists('ivr');
            },
            getGlobalScreeningListByMsisdn: function (type, nameOfTheFile, msisdn) {
                var promise = BulkMessagingOperationsGrRestangular.one('dlists/gbl/msisdn?type=' + type + '&listName=' + nameOfTheFile + '&msisdn=' + msisdn).get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            createGlobalScreeningListByMsisdn: function (type, nameOfTheFile, msisdn) {
                var promise = BulkMessagingOperationsGrRestangular.all('dlists/gbl/msisdn?type=' + type + '&listName=' + nameOfTheFile + '&msisdn=' + msisdn).post();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            deleteGlobalScreeningListByMsisdn: function (type, nameOfTheFile, msisdn) {
                var promise = BulkMessagingOperationsGrRestangular.all('dlists/gbl/msisdn?type=' + type + '&listName=' + nameOfTheFile + '&msisdn=' + msisdn).remove();
                UtilService.addPromiseToTracker(promise);
                return promise;
            }
        }
    });

    // Screening Manager Services
    ApplicationServices.factory('ScreeningManagerV2Service', function ($log, ScreeningManagerV2Restangular, Restangular, notification, $translate, UtilService) {
        var CHANNEL_TYPE = 'CC-Portal';

        return {
            serviceNames: {
                SSM: "ssmservice",
                SUBSCRIBER: "subscriber"
            },
            scopes: {
                // Main service scopes
                GLOBAL_SCOPE_KEY: 'global',
                MSISDN_SCOPE_KEY: 'msisdn',
                SAN_SCOPE_KEY: 'san',
                SERVICE_SCOPE_KEY: 'service'
            },
            errorCodes: {
                AUTHORIZATION_FAILED: 3001,
                API_NOT_SUPPORTED: 3011,
                STORAGE_ERROR: 3021,
                QUOTA_ERROR: 3031,
                WRONG_REQUEST_ERROR: 3041,
                SUBSCRIBER_NOT_FOUND: 3051,
                SCOPE_NOT_FOUND: 3061
            },
            getScreeningListsByScopeAndService: function (serviceName, scopeSubscriberKey, scopeKey, promiseTracker) {
                var promise = ScreeningManagerV2Restangular.one(CHANNEL_TYPE + '/' + serviceName + '/screenings/' + scopeSubscriberKey + '/' + scopeKey).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            deleteListItem: function (serviceName, scopeSubscriberKey, scopeKey, listKey, screenableEntryId) {
                var requestUri = CHANNEL_TYPE + '/' + serviceName + '/screenings/' + scopeSubscriberKey + '/' + scopeKey + '/' + listKey + '/' + screenableEntryId;
                var promise = ScreeningManagerV2Restangular.one(requestUri).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            addNewListItem: function (serviceName, scopeSubscriberKey, scopeKey, listKey, screenableEntry) {
                var screeningRequest = {
                    "screeningRequest": {
                        "screenableEntry": [screenableEntry],
                        "requestCorrelator": new Date().getTime()
                    }
                };

                var requestUri = CHANNEL_TYPE + '/' + serviceName + '/screenings/' + scopeSubscriberKey + '/' + scopeKey + '/' + listKey;
                var promise = ScreeningManagerV2Restangular.all(requestUri).post(screeningRequest);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateScreeningRule: function (serviceName, scopeSubscriberKey, scopeKey, screeningRule) {
                var screeningModeRequest = {
                    screeningScopeRequest: {
                        selectedScreeningModeType: screeningRule
                    }
                };

                $log.debug('Screening rule update request body: ', screeningModeRequest);

                var requestUri = CHANNEL_TYPE + '/' + serviceName + '/screenings/' + scopeSubscriberKey + '/' + scopeKey;
                var promise = ScreeningManagerV2Restangular.all(requestUri).customPUT(screeningModeRequest);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getAllowance: function (serviceName, scopeSubscriberKey, scopeKey, listKey) {
                var requestUri = CHANNEL_TYPE + '/' + serviceName + '/screenings/' + scopeSubscriberKey + '/' + scopeKey + '/allowance/' + listKey;

                var promise = ScreeningManagerV2Restangular.one(requestUri).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        }
    });

    // Content Management Services
    ApplicationServices.factory('ContentManagementService', function ($q, $log, $translate, notification, ContentManagementRestangular, UtilService, SessionService, BATCH_SIZE) {
        var getRBTContentListByName = function (baseUrl, page, size, name, organizationId, isPromoted) {
            var url = baseUrl;

            url += '?page=' + (page ? page : 0);
            url += '&size=' + (size ? size : 10);

            url += '&orderBy=name&orderDirection=ASC';

            url += name ? '&name=' + name : '';

            url += organizationId ? '&organizationId=' + organizationId : '';

            url += isPromoted ? '&promoted=' + isPromoted : '';

            var promise = ContentManagementRestangular.one(url).get();

            UtilService.addPromiseToTracker(promise);

            return promise;
        };

        return {
            showApiError: function (response) {
                var type = 'warning', message;

                if (response) {
                    if (response.message) {
                        message = response.message;
                    } else if (response.detail) {
                        message = response.detail;
                    } else if (response.data) {
                        if (response.data.message) {
                            message = response.data.message;
                        } else if (response.data.detail) {
                            message = response.data.detail;
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
            generateFilePath: function (objectId) {
                return '/content-management-rest/cms/file/' + objectId + '?ts=' + new Date().getTime();
            },
            // Content Offers
            getAllContentOffers: function (expand, promiseTracker) {
                var _self = this;
                var deferred = $q.defer();

                _self.getContentOffers(0, BATCH_SIZE, expand, promiseTracker).then(function (firstResponse) {
                    if (firstResponse) {
                        if (firstResponse.totalCount < BATCH_SIZE) {
                            deferred.resolve(firstResponse);
                        } else {
                            var promises = [];

                            for (var page = 1; (page * BATCH_SIZE) < firstResponse.totalCount; page++) {
                                promises.push(_self.getContentOffers(page, BATCH_SIZE, expand, promiseTracker));
                            }

                            $q.all(promises).then(function (totalResponses) {
                                totalResponses.forEach(function (totalResponse) {
                                    firstResponse.items = firstResponse.items.concat(totalResponse.items);
                                });

                                deferred.resolve(firstResponse);
                            });
                        }
                    } else {
                        deferred.reject(firstResponse);
                    }
                }, function (respose) {
                    deferred.reject(response);
                });

                UtilService.addPromiseToTracker(deferred.promise, promiseTracker);

                return deferred.promise;
            },
            getContentOffers: function (page, size, expand, promiseTracker) {
                var url = 'rbt/offers?page=' + page + '&size=' + size +
                    '&expand=' + (expand ? expand : false);

                var prom = ContentManagementRestangular.one(url).get();

                UtilService.addPromiseToTracker(prom, promiseTracker);

                return prom;
            },
            // Tones
            // Content Metadata
            getContentMetadatas: function (filter) {
                var queryString = angular.element.param(filter);

                var promise = ContentManagementRestangular.one('content/metadata?' + queryString).get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            // Content Categories
            getContentCategoryRBT: function (id) {
                var promise = ContentManagementRestangular.one('/rbt/categories/' + id).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            searchContentCategoriesRBT: function (page, size, name, organizationId) {
                var url = '/rbt/categories';

                return getRBTContentListByName(url, page, size, name, organizationId);
            },
            // Content Metadata
            // Artists
            getArtist: function (artistId) {
                var promise = ContentManagementRestangular.one('/rbt/artists/' + artistId).get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            searchArtists: function (page, size, name, organizationId) {
                var url = '/rbt/artists';

                return getRBTContentListByName(url, page, size, name, organizationId);
            },
            // Albums
            getAlbum: function (albumId) {
                var promise = ContentManagementRestangular.one('/rbt/albums/' + albumId).get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            searchAlbums: function (page, size, name, organizationId) {
                var url = '/rbt/albums';

                return getRBTContentListByName(url, page, size, name, organizationId);
            },
            // Tones
            getTone: function (toneId) {
                var promise = ContentManagementRestangular.one('/rbt/tones/' + toneId).get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            searchTones: function (page, size, name, organizationId, isPromoted) {
                var url = '/rbt/tones';

                return getRBTContentListByName(url, page, size, name, organizationId, isPromoted);
            },
            // Moods
            getMood: function (moodId) {
                var promise = ContentManagementRestangular.one('/rbt/moods/' + moodId).get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            searchMoods: function (page, size, name, organizationId) {
                var url = '/rbt/moods';

                return getRBTContentListByName(url, page, size, name, organizationId);
            }
        };
    });

    ApplicationServices.factory('RBTContentManagementService', function ($log, $translate, notification, RBTContentManagementRestangular, UtilService, SessionService) {
        var username = SessionService.getUsername();
        var headers = {
            'X-Channel': 'DSPAdminPortal',
            'X-Username': username
        };

        return {
            showApiError: function (response) {
                var type = 'warning', message = $translate.instant('CommonMessages.GenericServerError');

                if (response) {
                    if (response.message) {
                        message = response.message;
                    } else if (response.data) {
                        if (response.data.message) {
                            message = response.data.message;
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
            // Special Conditions
            getSpecialConditions: function () {
                var promise = RBTContentManagementRestangular.one('rbt/specialconditions').get(null, headers);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Special Condition Assignment
            getSpecialConditionAssignment: function (msisdn) {
                var promise = RBTContentManagementRestangular.one('rbt/specialconditionassignment').get(null, _.extend({
                    'X-Msisdn': msisdn
                }, headers));

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateAssignmentProfileTone: function (msisdn, specialConditionAssignment) {
                var promise = RBTContentManagementRestangular.all('rbt/assignments/profiletone').customPUT(specialConditionAssignment, null, null, _.extend({
                    'X-Msisdn': msisdn,
                    'X-TransactionId': new Date().getTime()
                }, headers));

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteAssignmentProfileTone: function (msisdn) {
                var promise = RBTContentManagementRestangular.one('rbt/assignments/profiletone').remove(null, _.extend({
                    'X-Msisdn': msisdn,
                    'X-TransactionId': new Date().getTime()
                }, headers));

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Active Default Tone
            getActiveDefaultTone: function (msisdn) {
                var promise = RBTContentManagementRestangular.one('rbt/subscribers/my/activedefaulttone').get(null, _.extend({
                    'X-Msisdn': msisdn
                }, headers));

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateActiveDefaultTone: function (msisdn, activeDefaultTone) {
                var promise = RBTContentManagementRestangular.all('rbt/subscribers/my/activedefaulttone').customPUT(activeDefaultTone, null, null, _.extend({
                    'X-Msisdn': msisdn,
                    'X-TransactionId': new Date().getTime()
                }, headers));

                UtilService.addPromiseToTracker(promise, undefined);

                return promise;
            },
            updateAssignmentDefaultTone: function (msisdn, defaultToneAssignment) {
                var promise = RBTContentManagementRestangular.all('rbt/assignments/defaulttone').customPUT(defaultToneAssignment, null, null, _.extend({
                    'X-Msisdn': msisdn,
                    'X-TransactionId': new Date().getTime()
                }, headers));

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteAssignmentDefaultTone: function (msisdn) {
                var promise = RBTContentManagementRestangular.one('rbt/assignments/defaulttone').remove(null, _.extend({
                    'X-Msisdn': msisdn,
                    'X-TransactionId': new Date().getTime()
                }, headers));

                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        }
    });

    ApplicationServices.factory('RBTSCGatewayService', function ($q, $log, $translate, notification, RBTSCGatewayRestangular, UtilService, SessionService) {
        var username = SessionService.getUsername();
        var headers = {
            'X-Channel': 'OTHER',
            'X-Username': username
        };

        return {
            showApiError: function (response) {
                var type = 'warning', message = $translate.instant('CommonMessages.GenericServerError');

                if (response) {
                    if (response.message) {
                        message = response.message;
                    } else if (response.data) {
                        if (response.data.message) {
                            message = response.data.message;
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
            // Content Offer Subscriptions
            getContentOfferSubscriptions: function (msisdn) {
                var promise = RBTSCGatewayRestangular.one('contentOfferSubscriptions').get(null, _.extend({
                    'X-Msisdn': msisdn,
                    'X-Language': 'EN'
                }, headers));
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        }
    });

    // General Elastic Search Services
    ApplicationServices.factory('GeneralESService', function ($log, $filter, ChargingGwESAdapterClient, MessagingGwESAdapterClient, ESClient, SessionService, UtilService) {
        var requestTimeout = 90000;

        var findHistoryRecords = function (esClient, index, type, filter, payload) {
            // The range filters for using navigation
            var offset = filter.offset,
                limit = filter.limit;

            var esQueryPromise = esClient.search({
                requestTimeout: requestTimeout,
                headers: {
                    'Username': SessionService.getUsername(),
                    'TransactionId': new Date().getTime(),
                    'SubscriberNumber': UtilService.getSubscriberMsisdn(),
                    'ServiceLabel': 'Elastic Search'
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
                    'Username': SessionService.getUsername(),
                    'TransactionId': new Date().getTime(),
                    'SubscriberNumber': UtilService.getSubscriberMsisdn(),
                    'ServiceLabel': 'Elastic Search'
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

                // Msisdn field matchers
                var msisdnShouldFilter = {
                    "bool": {
                        "minimum_should_match": 1,
                        "should": []
                    }
                };
                _.each(msisdnFields, function (msisdnFieldName) {
                    msisdnShouldFilter.bool.should.push(JSON.parse('{ "regexp" : { "' + msisdnFieldName + '" : ".*' + msisdn + '" } }'));
                });
                payload.query.bool.must.push(msisdnShouldFilter);

                // Clean the query string text
                queryString = s.clean(queryString);
                queryString = UtilService.escapeRegExp(queryString);

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

                // If there is at least one clause in the should, then add minimum_should_match parameter to the bool.
                if (payload.query.bool.should.length > 0) {
                    payload.query.bool.minimum_should_match = 1;
                }

                return payload;
            },
            // Service and product methods.
            // Service Subscription Manager
            findSSMHistory: function (filter, additionalFilterFields) {
                var index = 'ssm-main-read', type = 'ssm';

                // Filter these events:
                // SUBSCRIBE_TO_OFFER_SUCCESS(2), SUBSCRIBE_TO_OFFER_FAIL(3), UNSUBSCRIBE_FROM_OFFER_SUCCESS(5), UNSUBSCRIBE_FROM_OFFER_FAIL(6)
                var termFilterJSON = {
                    "must": [
                        {
                            "terms": {
                                "event": [
                                    2, 3, 5, 6
                                ]
                            }
                        }
                    ]
                };

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['msisdn'], 'timestamp', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            findSSMDetailedHistory: function (subscriptionId, eventType) {
                var index = 'ssm-detail-read', type = 'ssm';
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
                // PAUSE_OFFER_SUBS_SUCCESS(107), PAUSE_OFFER_SUBS_FAIL(108)
                // UNPAUSE_OFFER_SUBS_SUCCESS(110), UNPAUSE_OFFER_SUBS_FAIL(111)
                // RECEIVE_HLR_FLAG_SUCCESS(128), RECEIVE_HLR_FLAG_FAIL(129)
                //
                // For SUBSCRIBE_TO_OFFER_FAIL(3)
                // Query: CHARGING_FAIL(9), SETTING_HLR_FLAG_FAILED(55)
                //
                // For UNSUBSCRIBE_FROM_OFFER_SUCCESS(5)
                // Query: CLEAR_HLR_FLAG_SUCCESS(94), CLEAR_HLR_FLAG_FAIL(95)
                // RECEIVE_HLR_FLAG_SUCCESS(128), RECEIVE_HLR_FLAG_FAIL(129)
                //
                // For UNSUBSCRIBE_FROM_OFFER_FAIL(6)
                // Query: CLEAR_HLR_FLAG_FAIL(95)
                // RECEIVE_HLR_FLAG_SUCCESS(128), RECEIVE_HLR_FLAG_FAIL(129)
                var eventTypeTerms = {
                    "terms": {
                        "event": []
                    }
                };
                if (eventType === 2) {
                    eventTypeTerms.terms.event = [2, 8, 9, 32, 33, 41, 42, 54, 55, 57, 58, 60, 61, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 94, 95, 107, 108, 110, 111, 128, 129];
                } else if (eventType === 3) {
                    eventTypeTerms.terms.event = [3, 9, 55];
                } else if (eventType === 5) {
                    eventTypeTerms.terms.event = [5, 94, 95, 128, 129];
                } else if (eventType === 6) {
                    eventTypeTerms.terms.event = [6, 95, 128, 129];
                }

                var filter = {offset: 0, limit: 1000};
                var payload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "subscriptionId": subscriptionId
                                    }
                                },
                                eventTypeTerms
                            ]
                        }
                    }
                };

                return findHistoryRecords(ESClient, index, type, filter, payload);
            },
            // Content Subscription Manager
            findCSMHistory: function (filter, additionalFilterFields) {
                var index = 'ssm-main-read', type = 'ssm';

                // Filter these events:
                // SUBSCRIBE_TO_CONTENT_SUCCESS(104), SUBSCRIBE_TO_CONTENT_FAIL(105), UNSUBSCRIBE_FROM_CONTENT_SUCCESS(116), UNSUBSCRIBE_FROM_CONTENT_FAIL(117)
                var termFilterJSON = {
                    "must": [
                        {
                            "terms": {
                                "event": [
                                    104, 105, 116, 117
                                ]
                            }
                        }
                    ]
                };

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['msisdn'], 'timestamp', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            findCSMDetailedHistory: function (subscriptionId, eventType) {
                var index = 'ssm-detail-read', type = 'ssm';
                eventType = Number(eventType); // Convert event type to number.

                // Make a decision for event types according to the main event type.
                //
                // For SUBSCRIBE_TO_CONTENT_SUCCESS(104)
                // Query: CHARGING_SUCCESS(8), CHARGING_FAIL(9), RENEW_SUBSCRIPTION_SUCCESS(32), RENEW_SUBSCRIPTION_FAIL(33), PROCESS_CONFIRMATION_SUCCESS(41),
                // PROCESS_CONFIRMATION_FAIL(42), SETTING_HLR_FLAG_SUCCESS(54), SETTING_HLR_FLAG_FAILED(55), SUBSCRIBE_TO_OFFER_AFTER_TRIAL_PERIOD_SUCCESS(57),
                // SUBSCRIBE_TO_OFFER_AFTER_TRIAL_PERIOD_FAIL(58), TERMINATE_TRIAL_SUBSCRIPTION_SUCCESS(60), TERMINATE_TRIAL_SUBSCRIPTION_FAIL(61),
                // OFFER_SUBSCRIPTION_STATE_CHANGE_ACTIVE_TO_GRACE(70), OFFER_SUBSCRIPTION_STATE_CHANGE_ACTIVE_TO_SUSPEND(71), OFFER_SUBSCRIPTION_STATE_CHANGE_ACTIVE_TO_INACTIVE(72),
                // OFFER_SUBSCRIPTION_STATE_CHANGE_GRACE_TO_SUSPEND(73), OFFER_SUBSCRIPTION_STATE_CHANGE_GRACE_TO_ACTIVE(74), OFFER_SUBSCRIPTION_STATE_CHANGE_GRACE_TO_INACTIVE(75),
                // OFFER_SUBSCRIPTION_STATE_CHANGE_SUSPEND_TO_ACTIVE(76), OFFER_SUBSCRIPTION_STATE_CHANGE_SUSPEND_TO_INACTIVE(77), OFFER_SUBSCRIPTION_STATE_CHANGE_SUSPEND_TO_GRACE(78),
                // OFFER_SUBSCRIPTION_STATE_CHANGE_INACTIVE_TO_ACTIVE(79), OFFER_SUBSCRIPTION_STATE_CHANGE_INACTIVE_TO_SUSPEND(80), OFFER_SUBSCRIPTION_STATE_CHANGE_INACTIVE_TO_GRACE(81),
                // CLEAR_HLR_FLAG_SUCCESS(94), CLEAR_HLR_FLAG_FAIL(95), FORCE_RENEWAL_SUCCES(96),
                // PAUSE_CONTENT_SUBS_SUCCESS(119), PAUSE_CONTENT_SUBS_FAIL(120),
                // UNPAUSE_CONTENT_SUBS_SUCCESS(122), UNPAUSE_CONTENT_SUBS_FAIL(123),
                // ACTIVATE_CONTENT_SUBS_SUCCESS(125), ACTIVATE_CONTENT_SUBS_FAIL(126),
                // RECEIVE_HLR_FLAG_SUCCESS(128), RECEIVE_HLR_FLAG_FAIL(129),
                // CONTENT_GIFT_SUCCESS(131), CONTENT_GIFT_FAIL(132),
                // RENEW_CONTENT_SUBSCRIPTION_SUCCESS(134), RENEW_CONTENT_SUBSCRIPTION_FAIL(135)
                //
                // For SUBSCRIBE_TO_CONTENT_FAIL(105)
                // Query: CHARGING_FAIL(9), SETTING_HLR_FLAG_FAILED(55)
                //
                // For UNSUBSCRIBE_FROM_CONTENT_SUCCESS(116)
                // Query: CLEAR_HLR_FLAG_SUCCESS(94), CLEAR_HLR_FLAG_FAIL(95), RECEIVE_HLR_FLAG_SUCCESS(128), RECEIVE_HLR_FLAG_FAIL(129)
                //
                // For UNSUBSCRIBE_FROM_CONTENT_FAIL(117)
                // Query: SETTING_HLR_FLAG_FAILED(95), RECEIVE_HLR_FLAG_SUCCESS(128), RECEIVE_HLR_FLAG_FAIL(129)
                var eventTypeTerms = {
                    "terms": {
                        "event": []
                    }
                };
                if (eventType === 104) {
                    eventTypeTerms.terms.event = [104, 8, 9, 32, 33, 41, 42, 54, 55, 57, 58, 60, 61, 70, 71, 72, 73, 74,
                        75, 76, 77, 78, 79, 80, 81, 94, 95, 96, 119, 120, 122, 123, 125, 126, 128, 129, 131, 132, 134, 135];
                } else if (eventType === 105) {
                    eventTypeTerms.terms.event = [105, 9, 55];
                } else if (eventType === 116) {
                    eventTypeTerms.terms.event = [116, 94, 95, 128, 129];
                } else if (eventType === 117) {
                    eventTypeTerms.terms.event = [117, 95, 128, 129];
                }

                var filter = {offset: 0, limit: 1000};
                var payload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "subscriptionId": subscriptionId
                                    }
                                },
                                eventTypeTerms
                            ]
                        }
                    }
                };

                return findHistoryRecords(ESClient, index, type, filter, payload);
            },
            // Charging Gw
            findChargingGwRecords: function (filter, additionalFilterFields) {
                var index = 'elastic-search-adapter', type = '';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['msisdn'], 'date', additionalFilterFields);

                return findHistoryRecords(ChargingGwESAdapterClient, index, type, filter, bodyPayload);
            },
            // MessagingGw SMS
            findMessagingGwSMSRecords: function (filter, additionalFilterFields) {
                var index = 'elastic-search-adapter', type = 'sms_edr';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['origAddress', 'destAddress'], 'date', additionalFilterFields);

                return findHistoryRecords(MessagingGwESAdapterClient, index, type, filter, bodyPayload);
            },
            findMessagingGwSMSMessageParts: function (origAddress, destAddress, partRef, timestamp) {
                var index = 'msggw-sms-read', type = 'sms';

                var beginDate = moment(timestamp).subtract(2, 'hours').toISOString();
                var endDate = moment(timestamp).add(2, 'hours').toISOString();

                var filter = {offset: 0, limit: 1000};
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
                                        "date": {
                                            "gt": beginDate,
                                            "lt": endDate
                                        }
                                    }
                                }
                            ]
                        }
                    }
                };

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            findMessagingGwSMSDeliveryReports: function (cdrKey) {
                var index = 'msggw-dr-sms-read', type = 'sms_dr';

                var filter = {offset: 0, limit: 1000};
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

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            // MessagingGw MMS
            findMessagingGwMMSRecords: function (filter, additionalFilterFields) {
                var index = 'elastic-search-adapter', type = 'mms_edr';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['origAddress', 'destAddress'], 'date', additionalFilterFields);

                return findHistoryRecords(MessagingGwESAdapterClient, index, type, filter, bodyPayload);
            },
            findMessagingGwMMSDeliveryReports: function (cdrKey) {
                var index = 'msggw-dr-mms-read', type = 'mms_dr';

                var filter = {offset: 0, limit: 1000};
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

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            // Dcb
            findDcbRecords: function (filter, additionalFilterFields) {
                var index = 'dcb-charge-read', type = 'dcb-charge';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['msisdn'], 'chargeDate', additionalFilterFields);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            findDcbRefundHistory: function (chargeUuid) {
                var index = 'dcb-refund-read', type = 'dcb-refund';

                var filter = {offset: 0, limit: 1000};
                var payload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "chargeUuid": chargeUuid
                                    }
                                }
                            ]
                        }
                    }
                };

                return findHistoryRecords(ESClient, index, type, filter, payload);
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
            },
            // Audit Logs
            findAuditLogs: function (filter, additionalFilterFields) {
                var index = 'a3gw-read', type = 'auditlog';

                var termFilterJSON = {
                    "must": [
                        {
                            "terms": {
                                "method": ["PUT", "POST", "DELETE"]
                            }
                        }
                    ],
                    "must_not": [
                        {
                            "exists": {
                                "field": "status"
                            }
                        }
                    ]
                };

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['subscriberNumber'], 'timestamp', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            findAuditLogsDetailedHistory: function (transactionId) {
                var index = 'a3gw-read', type = 'auditlog';

                var filter = {offset: 0, limit: 1000};
                var payload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "transactionId": transactionId
                                    }
                                }
                            ]
                        }
                    }
                };

                return findHistoryRecords(ESClient, index, type, filter, payload);
            }
        };
    });

})();
