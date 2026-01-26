(function () {
    'use strict';

    /* Services */
    angular.module('Application.services', []);

    var ApplicationServices = angular.module('Application.services');

    ApplicationServices.factory('UtilService', function ($window, $log, $translate, notification, $timeout, DURATION_UNITS,
                                                         AdmPortalMainPromiseTracker, cfpLoadingBar) {
        var calculateDaysAgo = function (dayCount) {
            return moment().startOf('day').subtract(dayCount, 'days').toDate();
        };

        return {
            COUNTRY_CODE: "966",
            SESSION_KEY: '_sa_mb_vcp_a_sk',
            USERNAME_KEY: '_sa_mb_vcp_a_un',
            SITE_INFORMATION_KEY: '_sa_mb_vcp_a_si',
            SITE_CONFIGURATION_KEY: '_sa_mb_vcp_a_sc',
            LATEST_STATE: '_sa_mb_vcp_a_lst',
            USER_RIGHTS: '_sa_mb_vcp_a_ur',
            USER_ORGANIZATION_KEY: '_sa_mb_vcp_a_uok',
            USER_ORGANIZATION_ID_KEY: '_sa_mb_vcp_a_uoik',
            USER_ORGANIZATION_NAME_KEY: '_sa_mb_vcp_a_onk',
            // Created with this command: node -e "console.log(require('crypto').randomBytes(32).toString('hex'));"
            FREDERIC_CHOPIN: "d35b9c910a59ccdf10c757c4554eb26f7151647a2161350959c77ca129572c34",
            Validators: {
                Msisdn: /^[0-9]{0,15}$/,
                InternationalPhoneNumber: /^(\+){0,1}[0-9]{0,15}$/,
                ValidPhoneNumber: /^(966){1}[0-9]{0,15}$/,
                ScreeningListValidPhoneNumber: /^[0-9]{1,30}(\*){0,1}$/,
                ScreeningListValidNumericRange: /^[0-9]{1,30}-[0-9]{1,30}$/,
                ScreeningListValidAlphanumericRange: /^[a-zA-Z0-9]{1,30}-[a-zA-Z0-9]{1,30}$/,
                UrlSimple: /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/,
                IntegerNumber: /^[0-9]+$/,
                Alphanumeric: /^[a-zA-Z0-9]+$/,
                AlphanumericWithSpace: /^[a-zA-Z0-9\s]+$/,
                UserPassword: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=.\-_*])([a-zA-Z0-9@#$%^&+=*.\-_]){8,}$/
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
                    var bytes = CryptoJS.AES.decrypt(objectCipherText, this.FREDERIC_CHOPIN);
                    var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

                    return decryptedData;
                } catch (error) {
                    return {};
                }
            },
            putToSessionStore: function (key, object) {
                var jsonStringOfObj = JSON.stringify(object);

                // Encrypt
                var objectCipherText = CryptoJS.AES.encrypt(jsonStringOfObj, this.FREDERIC_CHOPIN);

                $window.localStorage.setItem(key, objectCipherText.toString());
            },
            removeFromSessionStore: function (key) {
                $window.localStorage.removeItem(key);
            },
            injectStringIntoAText: function (text, string, position) {
                if (!_.isEmpty(text) && !_.isEmpty(text)) {
                    text = text.substr(0, position) + string + text.substr(position);
                }
                return text;
            },
            setError: function (form, fieldName, validation, validationValue) {
                form[fieldName].$dirty = true;
                form[fieldName].$setValidity(validation, validationValue);
            },
            getDateByHourMinuteString: function (timeStr) {
                var hmTimeArray = timeStr.split(':');

                var d = new Date();
                d.setHours(hmTimeArray[0]);
                d.setMinutes(hmTimeArray[1]);

                return d;
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

                return {unit: DURATION_UNITS[0].key, duration: 1};
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
            addPromiseToTracker: function (promise, promiseTracker) {
                if (_.isUndefined(promiseTracker))
                    AdmPortalMainPromiseTracker.addPromise(promise);
                else
                    promiseTracker.addPromise(promise);
            },
            dec2bin: function (dec) {
                return (dec >>> 0).toString(2);
            },
            bin2dec: function (bin) {
                return parseInt(bin, 2);
            },
            defineReportsAsDH: function (url) {
                return [
                    {name: 'DAILY', url: url, reportType: 'Daily'},
                    {name: 'HOURLY', url: url, reportType: 'Hourly'}
                ];
            },
            defineReportsAsDM: function (url) {
                return [
                    {name: 'DAILY', url: url, reportType: 'Daily'},
                    {name: 'MONTHLY', url: url, reportType: 'Monthly'}
                ];
            },
            defineReportsAsDHM: function (url) {
                var reports = this.defineReportsAsDH(url);

                reports.push({
                    name: 'MONTHLY', url: url, reportType: 'Monthly'
                });

                return reports;
            },
            defineReportsAsMDHM: function (url) {
                var reports = this.defineReportsAsDHM(url);

                reports.splice(0, 0, {
                    name: 'MINUTELY', url: url, reportType: 'Minutely'
                });

                return reports;
            },
            defineReportsAsAll: function (url) {
                return [
                    {name: 'ALL', url: url}
                ];
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
                UtilService.showDummySpinner();

                var _self = this;

                var sessionKey = SessionService.getSessionKey();

                var xhr = new XMLHttpRequest();
                xhr.open('GET', SERVICES_BASE + url, true);
                xhr.setRequestHeader("Authorization", 'Bearer ' + sessionKey.token);
                xhr.setRequestHeader("Channel", 'CC ');
                xhr.setRequestHeader("Username", SessionService.getUsername());
                xhr.setRequestHeader("TransactionId", new Date().getTime());
                xhr.setRequestHeader("ServiceLabel", 'Download Service');
                xhr.setRequestHeader("ResourceName", RESOURCE_NAME);
                xhr.responseType = "blob";
                xhr.onreadystatechange = function () {
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

    ApplicationServices.factory('ReportingExportService', function ($log, $window, $timeout, $translate, notification, FileDownloadService, UtilService) {
        return {
            showReport: function (srcUrl, formatName, overridedFileName) {
                UtilService.showDummySpinner();

                var htmlName = 'partials/report.html';
                if (formatName !== 'HTML') {
                    htmlName = 'partials/download.html';
                }

                FileDownloadService.downloadFile(srcUrl, function (blob, fileName, responseStatus) {
                    UtilService.hideDummySpinner();

                    if (responseStatus && responseStatus !== 200) {
                        notification({
                            type: 'warning',
                            text: $translate.instant('CommonMessages.FileNotFound')
                        });

                        return;
                    }

                    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                        window.navigator.msSaveOrOpenBlob(blob, overridedFileName || fileName);
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
                        } else if (formatName === 'CSV' || formatName === 'MS EXCEL' || formatName === 'EXCEL 2007' || formatName === 'XLS' || formatName === 'WAV') {
                            if (formatName === 'WAV' && blob.type === 'text/html') {
                                notification({
                                    type: 'warning',
                                    text: $translate.instant('CommonMessages.GenericServerError')
                                });

                                // Close the download window if any error occurred.
                                $timeout(function () {
                                    win.close();
                                }, 100);
                            } else {
                                var onload = function (e) {
                                    $timeout(function () {
                                        // Construct an <a> element and give the url to it to be able to give filename
                                        // to the file which want to be downloaded.
                                        var link = win.document.createElement("a");
                                        link.download = overridedFileName || fileName;
                                        link.href = url;
                                        win.document.body.appendChild(link);
                                        link.click();

                                        $timeout(function () {
                                            // Close the download window after download modal window has appeared.
                                            win.close();
                                        }, 200);
                                    }, 1000);
                                };

                                angular.element(win).bind('load', onload);
                            }
                        } else {
                            $timeout(function () {
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
            setTaskCount: function (count) {
                UtilService.putToSessionStore(UtilService.TASK_COUNT_KEY, count);
            },
            getTaskCount: function () {
                var taskCount = UtilService.getFromSessionStore(UtilService.TASK_COUNT_KEY);
                if (_.isObject(taskCount) && _.isEmpty(taskCount)) {
                    taskCount = 0;
                }

                return Number(taskCount);
            },
            getSessionKey: function () {
                var sessionKey = UtilService.getFromSessionStore(UtilService.SESSION_KEY);

                return sessionKey;
            },
            getSessionUserId: function () {
                var sessionKey = this.getSessionKey();
                var jwt = UtilService.parseJwt(sessionKey.token);
                var uid = jwt.sub.cmpfToken.uid;

                return uid;
            },
            getUsername: function () {
                var username = UtilService.getFromSessionStore(UtilService.USERNAME_KEY);

                return username;
            },
            getSessionUserRights: function () {
                var userRights = UtilService.getFromSessionStore(UtilService.USER_RIGHTS);

                return userRights;
            },
            setSessionOrganization: function (organization) {
                UtilService.putToSessionStore(UtilService.USER_ORGANIZATION_KEY, organization);
            },
            getSessionOrganization: function () {
                return UtilService.getFromSessionStore(UtilService.USER_ORGANIZATION_KEY);
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
                UtilService.removeFromSessionStore(UtilService.SITE_CONFIGURATION_KEY);
                UtilService.removeFromSessionStore(UtilService.USER_RIGHTS);
                UtilService.removeFromSessionStore(UtilService.USER_ORGANIZATION_KEY);
                UtilService.removeFromSessionStore(UtilService.USER_ORGANIZATION_ID_KEY);
                UtilService.removeFromSessionStore(UtilService.USER_ORGANIZATION_NAME_KEY);
            },
            sessionInvalidate: function () {
                delete $http.defaults.headers.common.Authorization;

                this.cleanValues();
            }
        };
    });

    // Server Configuration and Information Services
    ApplicationServices.factory('ServerConfigurationService', function ($log, $q, ServerInformationRestangular, ServerConfigurationRestangular, UtilService, Restangular) {
        return {
            // The methods which gets data from the free zone.
            getSiteInformation: function (promiseTracker) {
                var promise = ServerInformationRestangular.one('site.json?' + UtilService.getCurrentNanoTime()).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            // The methods which gets data from the forbidden zone.
            getAndUpdateServerConfiguration: function (promiseTracker) {
                var deferred = $q.defer();

                ServerConfigurationRestangular.one('server.json?' + UtilService.getCurrentNanoTime()).get().then(function (response) {
                    var serverConfiguration = Restangular.stripRestangular(response);

                    UtilService.putToSessionStore(UtilService.SITE_CONFIGURATION_KEY, serverConfiguration);

                    deferred.resolve(serverConfiguration)
                });

                UtilService.addPromiseToTracker(deferred.promise, promiseTracker);

                return deferred.promise;
            },
            getServerConfiguration: function () {
                return UtilService.getFromSessionStore(UtilService.SITE_CONFIGURATION_KEY);
            },
            cleanServerConfiguration: function () {
                UtilService.removeFromSessionStore(UtilService.SITE_CONFIGURATION_KEY);
            }
        };
    });

    // CMFP Services
    ApplicationServices.factory('CMPFService', function ($log, $q, $filter, notification, $translate, DateTimeConstants, UtilService, CMPFAuthRestangular,
                                                         CMPFRestangular) {
        return {
            DEFAULT_ORGANIZATION_NAME: "Mobily",
            // Subscriber related profiles
            SUBSCRIBER_PROFILE_NAME: 'SubscriberProfile',
            // User related profiles
            USER_PROFILE_NAME: 'UserProfile',
            RELATED_RESOURCES: ['VCP Admin Portal', 'VCP Customer Care Portal'],
            // Service related profiles
            SERVICE_PROFILE_NAME: 'Service Profile',
            // Offer related profiles
            OFFER_TEMPLATE_NAME: "OfferTemplate",
            ENTITY_I18N_PROFILE: "Entityi18nProfile",
            XSM_CHARGING_PROFILE: "XsmChargingProfile",
            XSM_OFFER_PROFILE: "XsmOfferProfile",
            XSM_RENEWAL_PROFILE: "XsmRenewalProfile",
            XSM_TRIAL_PROFILE: "XsmTrialProfile",
            PRICE_GROUP_PROFILE: "PriceGroupProfile",
            OFFER_PROFILE: "OfferProfile",
            // Organization related profiles
            USSD_CODE_PROFILE_NAME: 'USSDCorporateCode',
            // Methods
            prepareProfile: function (updatedProfile, originalProfile) {
                // First we delete the profileId since it is for internal usage.
                delete updatedProfile.profileId;

                var attrArray = [];

                // Check the all fields of the updated object and put them into the new array
                // or the previous one.
                _.each(updatedProfile, function (value, key) {
                    var attr;
                    if (originalProfile) {
                        attrArray = originalProfile.attributes ? originalProfile.attributes : [];
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
            getAllOrganizationsByType: function (offset, limit, types, withProfile, promiseTracker) {
                var url = 'organizations?offset=' + offset + '&limit=' + limit + '&type=' + types;
                if (withProfile) {
                    url += '&withprofiles=true';
                }

                var prom = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(prom, promiseTracker);

                return prom;
            },
            getAllOrganizationsByName: function (offset, limit, name, withprofile) {
                var url = 'organizations?offset=' + offset + '&limit=' + limit + '&name=%25' + name + '%25';
                if (withprofile) {
                    url += '&withprofiles=true';
                }

                var prom = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(prom);

                return prom;
            },
            getOrganizationFile: function (organizationId) {
                var prom = CMPFRestangular.one('organizations/' + organizationId + '/file').get();
                UtilService.addPromiseToTracker(prom);

                return prom;
            },
            deleteOrganizationFile: function (organizationId, organizationFileId) {
                var prom = CMPFRestangular.one('organizations/' + organizationId + '/file/' + organizationFileId).remove();
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
            getAllOperatorsAndVirtualOperators: function (offset, limit, withProfile) {
                var url = 'organizations?offset=' + offset + '&limit=' + limit + '&type=NetworkOperator,VirtualOperator';
                if (withProfile) {
                    url += '&withprofiles=true';
                }

                var prom = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(prom);

                return prom;
            },
            getOperators: function (offset, limit, name) {
                var url = 'networkoperators?offset=' + offset + '&limit=' + limit;
                if (name) {
                    url += '&name=%25' + name + '%25';
                }

                var prom = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(prom);

                return prom;
            },
            getOperator: function (id, withProfile) {
                var url = 'networkoperators/' + id + '?withprofiles=true&withchildren=true';
                if (withProfile) {
                    url += '?withprofiles=true';
                }

                var prom = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(prom);

                return prom;
            },
            // Partners of Network Operators
            getPartnersOfOrganization: function (id, offset, limit) {
                var prom = CMPFRestangular.one('networkoperators/' + id + '/partners?offset=' + offset + '&limit=' + limit).get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            createOperator: function (newOperator) {
                var createOperatorProm = CMPFRestangular.all('networkoperators').post(newOperator);
                UtilService.addPromiseToTracker(createOperatorProm);
                return createOperatorProm;
            },
            updateOperator: function (operator) {
                var prom = CMPFRestangular.all('networkoperators/' + operator.id).customPUT(operator);
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            deleteOperator: function (operator) {
                var deleteOperatorProm = CMPFRestangular.one('networkoperators/' + operator.id).remove();
                UtilService.addPromiseToTracker(deleteOperatorProm);
                return deleteOperatorProm;
            },
            // Partners
            getAllPartners: function (offset, limit, withProfile, promiseTracker) {
                var url = 'partners?offset=' + offset + '&limit=' + limit;
                if (withProfile) {
                    url += '&withprofiles=true';
                }

                var prom = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(prom, promiseTracker);

                return prom;
            },
            getPartners: function (offset, limit, promiseTracker) {
                return this.getAllPartners(offset, limit, true, promiseTracker);
            },
            getPartner: function (id) {
                var prom = CMPFRestangular.one('partners/' + id + '?withprofiles=true').get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            getServicesOfPartner: function (id, offset, limit) {
                var prom = CMPFRestangular.one('partners/' + id + '/services?offset=' + offset + '&limit=' + limit).get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            createPartner: function (newPartner) {
                var createPartnerProm = CMPFRestangular.all('partners').post(newPartner);
                UtilService.addPromiseToTracker(createPartnerProm);
                return createPartnerProm;
            },
            deletePartner: function (partner) {
                var deletePartnerProm = CMPFRestangular.one('partners/' + partner.id).remove();
                UtilService.addPromiseToTracker(deletePartnerProm);
                return deletePartnerProm;
            },
            updatePartner: function (partner) {
                var prom = CMPFRestangular.all('partners/' + partner.id).customPUT(partner);
                UtilService.addPromiseToTracker(prom);
                return prom;
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
            getUserAccountsByName: function (offset, limit, name, promiseTracker) {
                var prom = CMPFRestangular.one('useraccounts?withchildren=true&offset=' + offset + '&limit=' + limit + '&name=%25' + name + '%25').get();
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
            updateUserAccount: function (account) {
                var prom = CMPFRestangular.all('useraccounts/' + account.id).customPUT(account);
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            createUserAccount: function (newItem) {
                var prom = CMPFRestangular.all('useraccounts').post(newItem);
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            deleteUserAccount: function (account) {
                var prom = CMPFRestangular.one('useraccounts/' + account.id).remove();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            getResources: function (offset, limit) {
                var _self = this;
                var deferred = $q.defer()

                UtilService.addPromiseToTracker(deferred.promise);

                CMPFRestangular.one('resources?withchildren=true&offset=' + offset + '&limit=' + limit).get().then(function (response) {
                    if (response && response.resources) {
                        response.resources = _.filter(response.resources, function (resource) {
                            return _.contains(_self.RELATED_RESOURCES, resource.name);
                        });
                    }

                    deferred.resolve(response);
                }, function (response) {
                    deferred.reject(response);
                });

                return deferred.promise;
            },
            // User groups
            getUserGroups: function (offset, limit, promiseTracker) {
                var prom = CMPFRestangular.one('usergroups?withchildren=true&offset=' + offset + '&limit=' + limit).get();
                UtilService.addPromiseToTracker(prom, promiseTracker);
                return prom;
            },
            getUserGroup: function (id) {
                var prom = CMPFRestangular.one('usergroups/' + id).get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            updateUserGroup: function (group) {
                var prom = CMPFRestangular.all('usergroups/' + group.id).customPUT(group);
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            createUserGroup: function (newItem) {
                var prom = CMPFRestangular.all('usergroups').post(newItem);
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            deleteUserGroup: function (group) {
                var prom = CMPFRestangular.one('usergroups/' + group.id).remove();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            addNewAccountsToUserGroup: function (group, userAccounts) {
                var prom = CMPFRestangular.one('usergroups/' + group.id + '/useraccounts').customPUT(userAccounts);
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            removeAccountFromUserGroup: function (group, userAccount) {
                var prom = CMPFRestangular.one('usergroups/' + group.id + '/useraccounts/' + userAccount.id).remove();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            getUserGroupMembers: function (groupId, offset, limit) {
                var prom = CMPFRestangular.one('usergroups/' + groupId + '/useraccounts?withchildren=true&offset=' + offset + '&limit=' + limit).get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            addPermissionsToUserGroup: function (group, permissions) {
                var prom = CMPFRestangular.all('usergroups/' + group.id + '/permissions').post(permissions);
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            removeResourcePermissionFromUserGroup: function (group, resourceId) {
                var prom = CMPFRestangular.one('usergroups/' + group.id + '/permissions/resources/' + resourceId).remove();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            removeOperationPermissionFromUserGroup: function (group, resourceId, operationId) {
                var prom = CMPFRestangular.one('usergroups/' + group.id + '/permissions/resources/' + resourceId + '/operations/' + operationId).remove();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            getUserGroupPermissions: function (groupId) {
                var prom = CMPFRestangular.one('usergroups/' + groupId + '/permissions?limit=200').get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            getUserGroupConstraints: function (groupId) {
                var prom = CMPFRestangular.one('usergroups/' + groupId + '/constraints?limit=200').get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            addConstraintsToUserGroup: function (group, constraints) {
                var prom = CMPFRestangular.all('usergroups/' + group.id + '/constraints').post(constraints);
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            removeResourceConstraintFromUserGroup: function (group, resourceId) {
                var prom = CMPFRestangular.one('usergroups/' + group.id + '/constraints/resources/' + resourceId).remove();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            removeOperationConstraintFromUserGroup: function (group, resourceId, operationId) {
                var prom = CMPFRestangular.one('usergroups/' + group.id + '/constraints/resources/' + resourceId + '/operations/' + operationId).remove();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            // Services
            getServices: function (offset, limit, withchildren, withprofiles, promiseTracker) {
                var prom = CMPFRestangular.one('services?withchildren=' + withchildren + '&withprofiles=' + withprofiles + '&offset=' + offset + '&limit=' + limit).get();

                UtilService.addPromiseToTracker(prom, promiseTracker);

                return prom;
            },
            getService: function (id) {
                var prom = CMPFRestangular.one('services/' + id + '?withchildren=true&withprofiles=true').get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            getServiceByName: function (name, promiseTracker) {
                var prom = CMPFRestangular.one('services?name=' + name).get();
                UtilService.addPromiseToTracker(prom, promiseTracker);
                return prom;
            },
            getServiceByNameWithProfiles: function (name) {
                var prom = CMPFRestangular.one('services?name=' + name + '&withprofiles=true').get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            getServiceSubscriptionsSummary: function (id, offset, limit, msisdn, promiseTracker, doNotShowIndicator) {
                var url = 'services/' + id + '/subscriptions/summary?offset=' + offset + '&limit=' + limit;
                if (msisdn) {
                    url += '&msisdn=%25' + msisdn + '%25';
                }

                var prom = CMPFRestangular.one(url).get();

                if (!doNotShowIndicator) {
                    UtilService.addPromiseToTracker(prom, promiseTracker);
                }

                return prom;
            },
            getServiceSubscriptionsByParameters: function (id, offset, limit, queryParams, promiseTracker) {
                var prom = CMPFRestangular.one('services/' + id + '/subscriptions?withchildren=true&withchildrenprofiles=true&withprofiles=true&offset=' + offset + '&limit=' + limit + '&' + queryParams).get();
                UtilService.addPromiseToTracker(prom, promiseTracker);
                return prom;
            },
            getServicesSubscriptionStats: function (promiseTracker) {
                var prom = CMPFRestangular.one('services/subscriptions').get();
                UtilService.addPromiseToTracker(prom, promiseTracker);
                return prom;
            },
            updateService: function (entry) {
                var prom = CMPFRestangular.one('services/' + entry.id).customPUT(entry);
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            createService: function (newItem) {
                var prom = CMPFRestangular.all('services').post(newItem);
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            deleteService: function (item) {
                var prom = CMPFRestangular.one('services/' + item.id).remove();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            // Offers
            getOffers: function (offset, limit, withchildren, withprofiles, promiseTracker) {
                var prom = CMPFRestangular.one('offers?withchildren=' + withchildren + '&withprofiles=' + withprofiles + '&offset=' + offset + '&limit=' + limit).get();
                UtilService.addPromiseToTracker(prom, promiseTracker);

                return prom;
            },
            getOffersByServiceName: function (offset, limit, serviceName) {
                var prom = CMPFRestangular.one('offers?withchildren=true&offset=' + offset + '&limit=' + limit + '&serviceName=' + serviceName).get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            getOffer: function (id) {
                var prom = CMPFRestangular.one('offers/' + id + '?withchildren=true&withprofiles=true').get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            getOfferTemplateByName: function (templateName) {
                var prom = CMPFRestangular.one('offertemplates?withprofiles=true&name=' + templateName).get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            getOfferSubscriptionsSummary: function (id, offset, limit, msisdn, promiseTracker, doNotShowIndicator) {
                var url = 'offers/' + id + '/subscriptions/summary?offset=' + offset + '&limit=' + limit;
                if (msisdn) {
                    url += '&msisdn=%25' + msisdn + '%25';
                }

                var prom = CMPFRestangular.one(url).get();

                if (!doNotShowIndicator) {
                    UtilService.addPromiseToTracker(prom, promiseTracker);
                }

                return prom;
            },
            getOffersSubscriptions: function (promiseTracker) {
                var prom = CMPFRestangular.one('offers/subscriptions').get();
                UtilService.addPromiseToTracker(prom, promiseTracker);
                return prom;
            },
            updateOffer: function (entry) {
                var prom = CMPFRestangular.all('offers/' + entry.id).customPUT(entry);
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            createOffer: function (newItem) {
                var prom = CMPFRestangular.all('offers').post(newItem);
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            deleteOffer: function (item) {
                var prom = CMPFRestangular.one('offers/' + item.id).remove();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            addServicesToOffer: function (id, services) {
                var prom = CMPFRestangular.all('offers/' + id + '/services').customPUT(services);
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            removeServicesFromOffer: function (id, service) {
                var prom = CMPFRestangular.one('offers/' + id + '/services/' + service.id).remove();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            // Subscribers
            getSubscribersByFilter: function (offset, limit, msisdn, promiseTracker) {
                var url = 'subscribers?withchildren=true&withprofiles=true&offset=' + offset + '&limit=' + limit;
                url += (msisdn !== undefined && !s.isBlank(msisdn) ? '&msisdn=' + msisdn + '%25' : '');

                var prom = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(prom, promiseTracker);

                return prom;
            },
            getSubscribers: function (offset, limit, promiseTracker) {
                return this.getSubscribersByFilter(offset, limit, undefined, undefined, promiseTracker);
            },
            getSubscriber: function (id) {
                var prom = CMPFRestangular.one('subscribers/' + id + '?withchildren=true&withprofiles=true').get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            getSubscriberByMsisdn: function (msisdn) {
                var prom = CMPFRestangular.one('subscribers?withchildren=false&withprofiles=false&msisdn=' + msisdn).get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            updateSubscriber: function (entry) {
                var prom = CMPFRestangular.all('subscribers/' + entry.id).customPUT(entry);
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            createSubscriber: function (newItem) {
                var prom = CMPFRestangular.all('subscribers/msisdn').post(newItem);
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            deleteSubscriber: function (item) {
                var prom = CMPFRestangular.one('subscribers/' + item.id).remove();
                UtilService.addPromiseToTracker(prom);
                return prom;
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
            },
            getUserProfile: function (userAccount) {
                var ussdUserProfileDef = _.findWhere(userAccount.profiles, {profileDefinitionName: this.USER_PROFILE_NAME});

                return ussdUserProfileDef;
            },
            extractUserProfile: function (userAccount) {
                var ussdUserProfileDef = this.getUserProfile(userAccount);

                if (!_.isEmpty(ussdUserProfileDef) && !_.isUndefined(ussdUserProfileDef)) {
                    var nameAttr = _.findWhere(ussdUserProfileDef.attributes, {name: "Name"});
                    var surnameAttr = _.findWhere(ussdUserProfileDef.attributes, {name: "Surname"});
                    var mobilePhoneNoAttr = _.findWhere(ussdUserProfileDef.attributes, {name: "MobilePhoneNo"});
                    var emailAttr = _.findWhere(ussdUserProfileDef.attributes, {name: "EMail"});

                    var ussdUserProfile = {
                        Name: nameAttr ? nameAttr.value : '',
                        Surname: surnameAttr ? surnameAttr.value : '',
                        MobilePhoneNo: mobilePhoneNoAttr ? mobilePhoneNoAttr.value : '',
                        EMail: emailAttr ? emailAttr.value : ''
                    };

                    return ussdUserProfile;
                } else {
                    return {};
                }
            },
            getSubscriberProfile: function (subscriberAccount) {
                return this.findProfileByName(subscriberAccount.profiles, this.SUBSCRIBER_PROFILE_NAME);
            },
            extractSubscriberProfile: function (subscriberAccount) {
                var subscriberProfileDef = this.getSubscriberProfile(subscriberAccount);

                if (!_.isEmpty(subscriberProfileDef) && !_.isUndefined(subscriberProfileDef)) {
                    // And searches necessary attributes in the subscriber profile.
                    var msisdnAttr = _.findWhere(subscriberProfileDef.attributes, {name: "MSISDN"});
                    var paymentTypeAttr = _.findWhere(subscriberProfileDef.attributes, {name: "PaymentType"});
                    var languageAttr = _.findWhere(subscriberProfileDef.attributes, {name: "Language"});
                    var statusAttr = _.findWhere(subscriberProfileDef.attributes, {name: "Status"});

                    return {
                        MSISDN: !_.isUndefined(msisdnAttr) ? msisdnAttr.value : '',
                        PaymentType: !_.isUndefined(paymentTypeAttr) ? (!isNaN(paymentTypeAttr.value) ? Number(paymentTypeAttr.value) : paymentTypeAttr.value) : '',
                        Language: !_.isUndefined(languageAttr) ? languageAttr.value : '',
                        Status: !_.isUndefined(statusAttr) ? statusAttr.value : ''
                    };
                } else {
                    return {};
                }
            },
            getServiceProfile: function (service) {
                return this.findProfileByName(service.profiles, this.SERVICE_PROFILE_NAME);
            },
            extractServiceProfile: function (service) {
                var serviceProfileDef = this.getServiceProfile(service);
                var serviceProfile = {
                    startDate: UtilService.getTodayBegin(),
                    endDate: UtilService.getTodayEnd(),
                    description: '',
                    category: []
                };

                if (!_.isEmpty(serviceProfileDef) && !_.isUndefined(serviceProfileDef)) {
                    var startDateAttr = _.findWhere(serviceProfileDef.attributes, {name: "Start Date"});
                    if (startDateAttr) {
                        serviceProfile.startDate = new Date(startDateAttr.value);
                    }

                    var endDateAttr = _.findWhere(serviceProfileDef.attributes, {name: "End Date"});
                    if (endDateAttr) {
                        serviceProfile.endDate = new Date(endDateAttr.value);
                    }

                    var descriptionAttr = _.findWhere(serviceProfileDef.attributes, {name: "Description"});
                    if (descriptionAttr) {
                        serviceProfile.description = descriptionAttr.value;
                    }

                    var categoryAttr = _.findWhere(serviceProfileDef.attributes, {name: "Category"});
                    if (categoryAttr) {
                        serviceProfile.category = categoryAttr.value;
                    }
                }

                return serviceProfile;
            },
            extractUssdCorporateCodeListProfile: function (organization) {
                var ussdCorporateCodeProfileDefList = _.where(organization.profiles, {profileDefinitionName: this.USSD_CODE_PROFILE_NAME});

                var ussdCorporateCodeListValues = [];
                if (!_.isUndefined(ussdCorporateCodeProfileDefList)) {
                    _.each(ussdCorporateCodeProfileDefList, function (ussdCorporateCodeProfileDef) {
                        var stateAttr = _.findWhere(ussdCorporateCodeProfileDef.attributes, {name: "State"});
                        var ussdCodeAttr = _.findWhere(ussdCorporateCodeProfileDef.attributes, {name: "UssdCode"});

                        ussdCorporateCodeListValues.push({
                            ussdCode: s.toNumber(ussdCodeAttr.value),
                            state: s.toNumber(stateAttr.value)
                        });
                    });
                }
                ussdCorporateCodeListValues = $filter('orderBy')(ussdCorporateCodeListValues, ['state', 'ussdCode']);

                return ussdCorporateCodeListValues;
            }
        };
    });

    // SMSC Services
    var SmscConfService = ['$log', 'SmscConfigRestangular', 'UtilService', function ($log, SmscConfigRestangular, UtilService) {
        var getInputRates = function (key, promiseTracker) {
            var promise = SmscConfigRestangular.all('inputrates/' + key).getList();
            UtilService.addPromiseToTracker(promise, promiseTracker);

            return promise;
        };

        // Generic retry policy operations
        var getRetryPolicies = function (key, promiseTracker) {
            var promise = SmscConfigRestangular.one('retry-policy/' + key).get();
            UtilService.addPromiseToTracker(promise, promiseTracker);

            return promise;
        };
        var addRetryPolicy = function (key, retryPolicy, promiseTracker) {
            var promise = SmscConfigRestangular.all('retry-policy/' + key).post(retryPolicy);
            UtilService.addPromiseToTracker(promise, promiseTracker);

            return promise;
        };
        var updateRetryPolicy = function (key, retryPolicy, promiseTracker) {
            var promise = SmscConfigRestangular.all('retry-policy/' + key).customPUT(retryPolicy);
            UtilService.addPromiseToTracker(promise, promiseTracker);

            return promise;
        };
        var deleteRetryPolicyByPreference = function (key, preference, promiseTracker) {
            var promise = SmscConfigRestangular.all('retry-policy/' + key + '/' + preference).remove();
            UtilService.addPromiseToTracker(promise, promiseTracker);

            return promise;
        };

        return {
            getSS7Gateway: function (promiseTracker) {
                var promise = SmscConfigRestangular.one('ss7gw').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            updateSS7Gateway: function (config, promiseTracker) {
                var promise = SmscConfigRestangular.all('ss7gw').customPUT(config);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getApplicationRouting: function (appId, promiseTracker) {
                var promise = SmscConfigRestangular.one('routing/ussd-application/' + appId).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            addApplicationRouting: function (newRange, promiseTracker) {
                var promise = SmscConfigRestangular.all('routing/ussd-application').post(newRange);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            deleteApplicationRouting: function (appId, routing, promiseTracker) {
                var promise = SmscConfigRestangular.all('routing/ussd-application/' + appId + '/' + routing.addRangeStart + '/' + routing.addRangeEnd).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getSFEStorage: function (promiseTracker) {
                var promise = SmscConfigRestangular.one('sfestorage').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            updateSFEStorage: function (config, promiseTracker) {
                var promise = SmscConfigRestangular.all('sfestorage').customPUT(config);
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            // Input rates and throttling related services
            getSS7InputRates: function (promiseTracker) {
                return getInputRates('SS7', promiseTracker);
            },
            getSMPPApplicationThrottler: function (appId) {
                var promise = SmscConfigRestangular.one('applications/' + appId + '/throttler').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createSMPPApplicationThrottler: function (appId, throttlerConf) {
                var promise = SmscConfigRestangular.all('applications/' + appId + '/throttler').post(throttlerConf);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateSMPPApplicationThrottler: function (appId, throttlerConf) {
                var promise = SmscConfigRestangular.all('applications/' + appId + '/throttler').customPUT(throttlerConf);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            //--
            getAllSMPPApplicationRoutings: function (promiseTracker) {
                var promise = SmscConfigRestangular.all('routing/application').getList();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getSmppApplicationRouting: function (appId, promiseTracker) {
                var promise = SmscConfigRestangular.one('routing/application/' + appId).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            addSmppApplicationRouting: function (rangeItem, promiseTracker) {
                var promise = SmscConfigRestangular.all('routing/application').post(rangeItem);
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            deleteSmppApplicationRouting: function (appId, rangeStart, rangeEnd, promiseTracker) {
                var deleteCallUrl = 'routing/application/' + appId + '?addRangeStart=' + rangeStart + '&addRangeEnd=' + rangeEnd;

                var promise = SmscConfigRestangular.all(deleteCallUrl).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            // Alert Retry Policy
            getRetryPoliciesAlert: function (appId, promiseTracker) {
                return getRetryPolicies((appId ? 'alert/orig-application/' + appId : 'alert/global'), promiseTracker);
            },
            addRetryPolicyAlert: function (retryPolicy, appId, promiseTracker) {
                return addRetryPolicy((appId ? 'alert/orig-application/' + appId : 'alert/global'), retryPolicy, promiseTracker);
            },
            updateRetryPolicyAlert: function (retryPolicy, appId, promiseTracker) {
                return updateRetryPolicy((appId ? 'alert/orig-application/' + appId : 'alert/global'), retryPolicy, promiseTracker);
            },
            deleteRetryPolicyAlertByPreference: function (preference, appId, promiseTracker) {
                return deleteRetryPolicyByPreference((appId ? 'alert/orig-application/' + appId : 'alert/global'), preference, promiseTracker);
            },
            // Destination Application Retry Policy
            getRetryPoliciesDestinationApplication: function (appId, promiseTracker) {
                return getRetryPolicies((appId ? 'destination-application/per-application/' + appId : 'destination-application/default'), promiseTracker);
            },
            addRetryPolicyDestinationApplication: function (retryPolicy, appId, promiseTracker) {
                return addRetryPolicy((appId ? 'destination-application/per-application/' + appId : 'destination-application/default'), retryPolicy, promiseTracker);
            },
            updateRetryPolicyDestinationApplication: function (retryPolicy, appId, promiseTracker) {
                return updateRetryPolicy((appId ? 'destination-application/per-application/' + appId : 'destination-application/default'), retryPolicy, promiseTracker);
            },
            deleteRetryPolicyDestinationApplicationByPreference: function (preference, appId, promiseTracker) {
                return deleteRetryPolicyByPreference((appId ? 'destination-application/per-application/' + appId : 'destination-application/default'), preference, promiseTracker);
            },
            // SS7 Retry Policy
            getRetryPoliciesSS7: function (promiseTracker) {
                return getRetryPolicies('ss7', promiseTracker);
            },
            addRetryPolicySS7: function (retryPolicy, promiseTracker) {
                return addRetryPolicy('ss7', retryPolicy, promiseTracker);
            },
            updateRetryPolicySS7: function (retryPolicy, promiseTracker) {
                return updateRetryPolicy('ss7', retryPolicy, promiseTracker);
            },
            deleteRetryPolicySS7ByPreference: function (preference, promiseTracker) {
                return deleteRetryPolicyByPreference('ss7', preference, promiseTracker);
            },
            // Error Based Retry Policy
            getRetryPoliciesErrorBased: function (appId) {
                return getRetryPolicies((appId ? 'error/orig-application/' + appId : 'error/global'));
            },
            getRetryPolicyErrorBasedByErrorCode: function (contextName, errorCode, appId) {
                var key = (appId ? 'error/orig-application/' + appId : 'error/global');

                var promise = SmscConfigRestangular.one('retry-policy/' + key + '/' + contextName + '/' + errorCode).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            addRetryPolicyErrorBased: function (retryPolicyContent, appId) {
                return addRetryPolicy((appId ? 'error/orig-application/' + appId : 'error/global'), retryPolicyContent);
            },
            updateRetryPolicyErrorBased: function (retryPolicyContent, appId) {
                return updateRetryPolicy((appId ? 'error/orig-application/' + appId : 'error/global'), retryPolicyContent);
            },
            deleteRetryPolicyErrorBasedByErrorCode: function (contextName, errorCode, appId) {
                var key = (appId ? 'error/orig-application/' + appId : 'error/global');

                var promise = SmscConfigRestangular.all('retry-policy/' + key + '/' + contextName + '/' + errorCode).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteRetryPolicyErrorBasedPolicyByPreference: function (contextName, errorCode, preference, appId) {
                var key = (appId ? 'error/orig-application/' + appId : 'error/global');

                var promise = SmscConfigRestangular.all('retry-policy/' + key + '/' + contextName + '/' + errorCode + '/' + preference).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Error Based Sub Errors Retry Policy
            getRetryPoliciesErrorBasedSubErrors: function (errorCode, appId) {
                return getRetryPolicies('sub-error/' + (appId ? appId : 'global') + '/' + errorCode);
            },
            addRetryPolicyErrorBasedSubError: function (errorCode, retryPolicyContent, appId) {
                // Calling update method so there is no POST method implemented on the restful service and PUT makes same thing.
                return updateRetryPolicy('sub-error/' + (appId ? appId : 'global') + '/' + errorCode, retryPolicyContent);
            },
            updateRetryPolicyErrorBasedSubError: function (errorCode, retryPolicyContent, appId) {
                return updateRetryPolicy('sub-error/' + (appId ? appId : 'global') + '/' + errorCode, retryPolicyContent);
            },
            getRetryPolicyErrorBasedBySubErrorCode: function (errorCode, subErrorCode, appId) {
                var key = ('sub-error/' + (appId ? appId : 'global') + '/' + errorCode);

                var promise = SmscConfigRestangular.one('retry-policy/' + key + '/' + subErrorCode).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteRetryPolicyErrorBasedBySubErrorCode: function (errorCode, subErrorCode, appId) {
                var key = ('sub-error/' + (appId ? appId : 'global') + '/' + errorCode);

                var promise = SmscConfigRestangular.all('retry-policy/' + key + '/' + subErrorCode).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteRetryPolicyErrorBasedBySubErrorCodeByPreference: function (errorCode, subErrorCode, preference, appId) {
                var key = ('sub-error/' + (appId ? appId : 'global') + '/' + errorCode);

                var promise = SmscConfigRestangular.all('retry-policy/' + key + '/' + subErrorCode + '/' + preference).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            addRetryPolicyErrorBasedSubErrorPolicy: function (errorCode, subErrorCode, retryPolicyItem, appId) {
                // Calling update method so there is no POST method implemented on the restful service and PUT makes same thing.
                return updateRetryPolicy('sub-error/' + (appId ? appId : 'global') + '/' + errorCode + '/' + subErrorCode, retryPolicyItem);
            },
            updateRetryPolicyErrorBasedSubErrorPolicy: function (errorCode, subErrorCode, retryPolicyItem, appId) {
                return updateRetryPolicy('sub-error/' + (appId ? appId : 'global') + '/' + errorCode + '/' + subErrorCode, retryPolicyItem);
            },
            // Priority Based Retry Policy
            getRetryPoliciesPriorityLevelBased: function (promiseTracker) {
                return getRetryPolicies('priority', promiseTracker);
            },
            getRetryPoliciesPriorityLevelBasedByPolicyName: function (policyName, promiseTracker) {
                return getRetryPolicies('priority/' + policyName, promiseTracker);
            },
            addRetryPolicyPriorityLevelBased: function (retryPolicy, promiseTracker) {
                return addRetryPolicy('priority', retryPolicy, promiseTracker);
            },
            updateRetryPolicyPriorityLevelBased: function (retryPolicy, promiseTracker) {
                return updateRetryPolicy('priority', retryPolicy, promiseTracker);
            },
            deleteRetryPolicyPriorityLevelBasedByPolicyName: function (policyName, promiseTracker) {
                var promise = SmscConfigRestangular.all('retry-policy/priority/' + policyName).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            deleteRetryPolicyPriorityLevelBasedByPreference: function (policyName, preference, promiseTracker) {
                var promise = SmscConfigRestangular.all('retry-policy/priority/' + policyName + '/' + preference).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            // Application Gateway
            getApplicationGateway: function (promiseTracker) {
                var promise = SmscConfigRestangular.one('appgw').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            updateApplicationGateway: function (config, promiseTracker) {
                var promise = SmscConfigRestangular.all('appgw').customPUT(config);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            // Interconnect Smpp Agent
            getInterconnectSmppAgents: function (promiseTracker) {
                var promise = SmscConfigRestangular.all('interconnect-smpp-agent').getList();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            createOrUpdateInterconnectSmppAgent: function (config, promiseTracker) {
                var promise = SmscConfigRestangular.all('interconnect-smpp-agent').customPUT(config);
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            deleteInterconnectSmppAgent: function (agentName, promiseTracker) {
                var promise = SmscConfigRestangular.all('interconnect-smpp-agent/' + agentName).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getInterconnectSmppAgentConnectionDefinitions: function (agentName, promiseTracker) {
                var promise = SmscConfigRestangular.all('interconnect-smpp-agent/' + agentName + '/connection-definition').getList();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            createOrUpdateInterconnectSmppAgentConnectionDefinition: function (agentName, config, promiseTracker) {
                var promise = SmscConfigRestangular.all('interconnect-smpp-agent/' + agentName + '/connection-definition').customPUT(config);
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            deleteInterconnectSmppAgentConnectionDefinition: function (agentName, connectionDefinitionName, promiseTracker) {
                var promise = SmscConfigRestangular.all('interconnect-smpp-agent/' + agentName + '/connection-definition/' + connectionDefinitionName).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getInterconnectSmppAgentEstablishedConnections: function (agentName, promiseTracker) {
                var promise = SmscConfigRestangular.all('interconnect-smpp-agent/' + agentName + '/established-connection').getList();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getAllInterconnectSmppAgentRoutings: function (promiseTracker) {
                var promise = SmscConfigRestangular.all('routing/interconnect-agent').getList();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getAllInterconnectSmppAgentRoutingByAgent: function (agentName, promiseTracker) {
                var promise = SmscConfigRestangular.all('routing/interconnect-agent/' + agentName).getList();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            addInterconnectSmppAgentRouting: function (rangeItem, promiseTracker) {
                var promise = SmscConfigRestangular.all('routing/interconnect-agent').post(rangeItem);
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            deleteInterconnectSmppAgentRouting: function (agentName, rangeStart, rangeEnd, promiseTracker) {
                var deleteCallUrl = 'routing/interconnect-agent/' + agentName + '/' + rangeStart + '/' + rangeEnd;

                var promise = SmscConfigRestangular.all(deleteCallUrl).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getSS7SubsystemRoutings: function (promiseTracker) {
                var promise = SmscConfigRestangular.all('routing/ss7subsystem/range').getList();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            addSS7SubsystemRouting: function (rangeItem, promiseTracker) {
                var promise = SmscConfigRestangular.all('routing/ss7subsystem/range').customPUT(rangeItem);
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            deleteSS7SubsystemRouting: function (rangeStart, rangeEnd, promiseTracker) {
                var deleteCallUrl = 'routing/ss7subsystem/range/' + rangeStart + '/' + rangeEnd;

                var promise = SmscConfigRestangular.all(deleteCallUrl).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            // Languages and Message Templates
            getLanguages: function (promiseTracker) {
                var promise = SmscConfigRestangular.all('language').getList();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            addLanguage: function (language, promiseTracker) {
                var promise = SmscConfigRestangular.all('language').post(language);
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            deleteLanguage: function (languageCode, promiseTracker) {
                var promise = SmscConfigRestangular.all('language/' + languageCode).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getMessageTemplates: function (promiseTracker) {
                var promise = SmscConfigRestangular.all('message-template').getList();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getMessageTemplatesByLanguageCode: function (languageCode, appId, promiseTracker) {
                var promise = SmscConfigRestangular.all((appId ? 'applications/' + appId + '/' : '') + 'message-template/' + languageCode).getList();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            addMessageTemplate: function (messageTemplate, appId, promiseTracker) {
                var promise = SmscConfigRestangular.all((appId ? 'applications/' + appId + '/' : '') + 'message-template').post(messageTemplate);
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            updateMessageTemplate: function (messageTemplate, appId, promiseTracker) {
                var promise = SmscConfigRestangular.all((appId ? 'applications/' + appId + '/' : '') + 'message-template').customPUT(messageTemplate);
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            deleteMessageTemplate: function (languageCode, id, appId, promiseTracker) {
                var promise = SmscConfigRestangular.all((appId ? 'applications/' + appId + '/' : '') + 'message-template/' + languageCode + '/' + id).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            // Address Translation Tables
            getAddressTranslations: function (key, appId, promiseTracker) {
                var promise = SmscConfigRestangular.all('address-translation-matcher/' + key + (appId ? '/orig-app/' + appId : '')).getList();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getAddressTranslation: function (key, name, appId, promiseTracker) {
                var url = 'address-translation-matcher/' + key + (appId ? '/orig-app/' + appId : '') + '/' + encodeURIComponent(name);
                var promise = SmscConfigRestangular.one(url).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            addAddressTranslation: function (key, addressTranslation, appId, promiseTracker) {
                var promise = SmscConfigRestangular.all('address-translation-matcher/' + key + (appId ? '/orig-app/' + appId : '')).post(addressTranslation);
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            updateAddressTranslation: function (key, addressTranslation, appId, promiseTracker) {
                var promise = SmscConfigRestangular.all('address-translation-matcher/' + key + (appId ? '/orig-app/' + appId : '')).customPUT(addressTranslation);
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            deleteAddressTranslation: function (key, name, appId, promiseTracker) {
                var url = 'address-translation-matcher/' + key + (appId ? '/orig-app/' + appId : '') + '/' + encodeURIComponent(name);
                var promise = SmscConfigRestangular.all(url).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            // Content filtering criteria
            addAddressTranslationMessageContentPatternCriteria: function (key, name, pattern, appId, promiseTracker) {
                var url = 'address-translation-matcher/' + key + (appId ? '/orig-app/' + appId : '') + '/' + encodeURIComponent(name) + '/pattern';
                var promise = SmscConfigRestangular.all(url).post(pattern);
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            deleteAddressTranslationMessageContentPatternCriteria: function (key, name, regex, appId, promiseTracker) {
                var url = 'address-translation-matcher/' + key + (appId ? '/orig-app/' + appId : '') + '/' + encodeURIComponent(name);
                url += '/pattern?regex=' + encodeURIComponent(regex);

                var promise = SmscConfigRestangular.all(url).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            // Other address filtering criteria
            addAddressTranslationMessageContentOtherAddressPatternCriteria: function (key, name, pattern, appId, promiseTracker) {
                var url = 'address-translation-matcher/' + key + (appId ? '/orig-app/' + appId : '') + '/' + encodeURIComponent(name) + '/otherAddress';
                var promise = SmscConfigRestangular.all(url).post(pattern);
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            deleteAddressTranslationMessageContentOtherAddressPatternCriteria: function (key, name, regex, appId, promiseTracker) {
                var url = 'address-translation-matcher/' + key + (appId ? '/orig-app/' + appId : '') + '/' + encodeURIComponent(name);
                url += '/otherAddress?otherAddress=' + encodeURIComponent(regex);

                var promise = SmscConfigRestangular.all(url).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            // TON/NPI filtering criteria
            addAddressTranslationMessageContentTonNpiCriteria: function (key, name, tonNpi, appId, promiseTracker) {
                var url = 'address-translation-matcher/' + key + (appId ? '/orig-app/' + appId : '') + '/' + encodeURIComponent(name) + '/ton-npi';
                var promise = SmscConfigRestangular.all(url).post(tonNpi);
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            deleteAddressTranslationMessageContentTonNpiCriteria: function (key, name, ton, tonEquality, npi, npiEquality, appId, promiseTracker) {
                var url = 'address-translation-matcher/' + key + (appId ? '/orig-app/' + appId : '') + '/' + encodeURIComponent(name);
                url += '/ton-npi?ton=' + ton + '&tonEquality=' + tonEquality;
                url += '&npi=' + npi + '&npiEquality=' + npiEquality;

                var promise = SmscConfigRestangular.all(url).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            addressTranslationTest: function (key, address, ton, npi, content, otherAddress, appId) {
                var url = 'address-translation-matcher/' + key + '/test';
                url += '?address=' + encodeURIComponent(address) + '&ton=' + ton + '&npi=' + npi;
                url += content ? '&content=' + encodeURIComponent(content) : '';
                url += otherAddress ? '&otherAddress=' + encodeURIComponent(otherAddress) : '';
                url += ((appId && appId > 0) ? '&orig-app=' + appId : '');

                var promise = SmscConfigRestangular.one(url).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getAddressTranslationNextPrecedence: function (key) {
                var promise = SmscConfigRestangular.one('address-translation-matcher/' + key + '/next-precedence').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Content Modifiers
            getContentModifiers: function () {
                var promise = SmscConfigRestangular.all('content-modifier').getList();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            addContentModifier: function (contentModifier) {
                var promise = SmscConfigRestangular.all('content-modifier').customPUT(contentModifier);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteContentModifier: function (adressRangeStart, adressRangeEnd) {
                var url = 'content-modifier/' + encodeURIComponent(adressRangeStart) + '/' + encodeURIComponent(adressRangeEnd);
                var promise = SmscConfigRestangular.all(url).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getContentModifierPatternList: function (adressRangeStart, adressRangeEnd) {
                var url = 'content-modifier/' + encodeURIComponent(adressRangeStart) + '/' + encodeURIComponent(adressRangeEnd) + '/pattern';
                var promise = SmscConfigRestangular.all(url).getList();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            addContentModifierPattern: function (adressRangeStart, adressRangeEnd, pattern) {
                var url = 'content-modifier/' + encodeURIComponent(adressRangeStart) + '/' + encodeURIComponent(adressRangeEnd) + '/pattern';
                var promise = SmscConfigRestangular.all(url).customPUT(pattern);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteContentModifierPattern: function (adressRangeStart, adressRangeEnd, regex) {
                var url = 'content-modifier/' + encodeURIComponent(adressRangeStart) + '/' + encodeURIComponent(adressRangeEnd);
                url += '/pattern/' + encodeURIComponent(regex);

                var promise = SmscConfigRestangular.all(url).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getContentModifierTonNpiList: function (adressRangeStart, adressRangeEnd) {
                var url = 'content-modifier/' + encodeURIComponent(adressRangeStart) + '/' + encodeURIComponent(adressRangeEnd) + '/ton-npi';
                var promise = SmscConfigRestangular.all(url).getList();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            addContentModifierTonNpi: function (adressRangeStart, adressRangeEnd, tonNpi) {
                var url = 'content-modifier/' + encodeURIComponent(adressRangeStart) + '/' + encodeURIComponent(adressRangeEnd) + '/ton-npi';
                var promise = SmscConfigRestangular.all(url).customPUT(tonNpi);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteContentModifierTonNpi: function (adressRangeStart, adressRangeEnd, ton, npi) {
                var url = 'content-modifier/' + encodeURIComponent(adressRangeStart) + '/' + encodeURIComponent(adressRangeEnd);
                url += '/ton-npi/' + ton + '/' + npi;

                var promise = SmscConfigRestangular.all(url).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Black Hours Rule
            getBlackHourRulesConfigurations: function (appId) {
                var promise = SmscConfigRestangular.one('applications/' + appId + '/blackhour-config').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getBlackHourRulesConfiguration: function (appId, configurationName) {
                var promise = SmscConfigRestangular.one('applications/' + appId + '/blackhour-config/' + encodeURIComponent(configurationName)).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createBlackHourRulesConfiguration: function (appId, configuration) {
                var promise = SmscConfigRestangular.all('applications/' + appId + '/blackhour-config').post(configuration);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateBlackHourRulesConfiguration: function (appId, configuration) {
                var promise = SmscConfigRestangular.all('applications/' + appId + '/blackhour-config').customPUT(configuration);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteBlackHourRulesConfiguration: function (appId, configurationName) {
                var promise = SmscConfigRestangular.all('applications/' + appId + '/blackhour-config/' + encodeURIComponent(configurationName)).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Keyword screening
            // Global
            getGlobalKeywordScreeningList: function () {
                var promise = SmscConfigRestangular.all('keyword-screening/global-black-keyword').getList();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createGlobalKeywordScreening: function (keywordScreeningList) {
                var promise = SmscConfigRestangular.all('keyword-screening/global-black-keyword').post(keywordScreeningList);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteGlobalKeywordScreening: function (pattern) {
                var promise = SmscConfigRestangular.one('keyword-screening/global-black-keyword/' + encodeURIComponent(pattern)).remove();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Per Sender Keyword black list
            getPerSenderKeywordScreeningBlackList: function () {
                var promise = SmscConfigRestangular.all('keyword-screening/per-sender-address-black-keyword-all').getList();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createPerSenderKeywordScreeningBlackList: function (sender, keywordScreeningList) {
                var promise = SmscConfigRestangular.all('keyword-screening/per-sender-address-black-keyword/' + sender).post(keywordScreeningList);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deletePerSenderKeywordScreeningBlackList: function (sender, pattern) {
                var promise = SmscConfigRestangular.all('keyword-screening/per-sender-address-black-keyword/' + sender + '/' + encodeURIComponent(pattern)).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Per Sender Keyword white list
            getPerSenderKeywordScreeningWhiteList: function () {
                var promise = SmscConfigRestangular.all('keyword-screening/per-sender-address-white-keyword-all').getList();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createPerSenderKeywordScreeningWhiteList: function (sender, keywordScreeningList) {
                var promise = SmscConfigRestangular.all('keyword-screening/per-sender-address-white-keyword/' + sender).post(keywordScreeningList);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deletePerSenderKeywordScreeningWhiteList: function (sender, pattern) {
                var promise = SmscConfigRestangular.all('keyword-screening/per-sender-address-white-keyword/' + sender + '/' + encodeURIComponent(pattern)).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        };
    }];
    var SmscOperationService = ['$log', 'SmscConfigRestangular', 'SmscConfService', 'SmscOperationRestangular', 'SmscRemoteOperationRestangular', 'SmscSenderApplicationRestangular', 'SmscRemoteSenderApplicationRestangular', 'UtilService',
        function ($log, SmscConfigRestangular, SmscConfService, SmscOperationRestangular, SmscRemoteOperationRestangular, SmscSenderApplicationRestangular, SmscRemoteSenderApplicationRestangular, UtilService) {
            return {
                getSS7InputRates: function (promiseTracker) {
                    return SmscConfService.getSS7InputRates(promiseTracker);
                },
                updateSS7InputRates: function (ss7InputRate, promiseTracker) {
                    var promise = SmscConfigRestangular.all('inputrates/SS7').customPUT(ss7InputRate);
                    UtilService.addPromiseToTracker(promise, promiseTracker);

                    return promise;
                },
                removeSS7InputRates: function (agentName, promiseTracker) {
                    var promise = SmscConfigRestangular.all('inputrates/SS7/' + agentName).remove();
                    UtilService.addPromiseToTracker(promise, promiseTracker);

                    return promise;
                },
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
    var SmscProvService = ['$log', '$q', '$filter', 'SmscProvRestangular', 'CMPFService', 'DEFAULT_REST_QUERY_LIMIT', 'Restangular', 'UtilService', function ($log, $q, $filter, SmscProvRestangular, CMPFService, DEFAULT_REST_QUERY_LIMIT, Restangular, UtilService) {
        return {
            getAllSMPPApplications: function (promiseTracker) {
                var promise = SmscProvRestangular.all('applications/smpp').getList();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getSmppApplication: function (appId) {
                var promise = SmscProvRestangular.one('applications/smpp/' + appId).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            addSmppApplication: function (app) {
                var promise = SmscProvRestangular.all('applications/smpp').post(app);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateSmppApplication: function (app) {
                var promise = SmscProvRestangular.all('applications/smpp').customPUT(app);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteSmppApplication: function (app) {
                var promise = SmscProvRestangular.all('applications/smpp/' + app.id).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // SMPP Connections
            getLiveSmppConnections: function (appId) {
                var promise = SmscProvRestangular.one('applications/smpp/connections/' + appId).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // SMPP Application Quota
            getSmppApplicationQuota: function (appId) {
                var promise = SmscProvRestangular.one('applications/smpp/' + appId + '/quota').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createSmppApplicationQuota: function (appId, quota) {
                var promise = SmscProvRestangular.all('applications/smpp/' + appId + '/quota').post(quota);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateSmppApplicationQuota: function (appId, quota) {
                var promise = SmscProvRestangular.all('applications/smpp/' + appId + '/quota').customPUT(quota);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteSmppApplicationQuota: function (appId) {
                var promise = SmscProvRestangular.all('applications/smpp/' + appId + '/quota').remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        };
    }];
    var SmscDashboardService = ['$log', 'SmscDashboardRestangular', 'SfeDashboardRestangular', 'UtilService', function ($log, SmscDashboardRestangular, SfeDashboardRestangular, UtilService) {
        return {
            getSmscDashboard: function (promiseTracker) {
                var promise = SmscDashboardRestangular.one('').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getSfeDashboard: function (promiseTracker) {
                var promise = SfeDashboardRestangular.one('').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            }
        };
    }];

    // SMSC Service Definitions
    ApplicationServices.factory('SmscConfService', function ($injector) {
        return $injector.instantiate(SmscConfService);
    });
    ApplicationServices.factory('SmscOperationService', function ($injector) {
        return $injector.instantiate(SmscOperationService);
    });
    ApplicationServices.factory('SmscProvService', function ($injector) {
        return $injector.instantiate(SmscProvService);
    });
    ApplicationServices.factory('SmscDashboardService', function ($injector) {
        return $injector.instantiate(SmscDashboardService);
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
    ApplicationServices.factory('MmscConfService', function ($log, MmscConfigRestangular, UtilService) {
        return {
            getMm1Agent: function (promiseTracker) {
                var agentPromise = MmscConfigRestangular.one('mm1agent').get();
                UtilService.addPromiseToTracker(agentPromise, promiseTracker);
                return agentPromise;
            }, setMm1Agent: function (mm1Agent, promiseTracker) {
                var agentPromise = MmscConfigRestangular.all('mm1agent').customPUT(mm1Agent);
                UtilService.addPromiseToTracker(agentPromise, promiseTracker);
                return agentPromise;
            }, getMm3Agent: function (promiseTracker) {
                var agentPromise = MmscConfigRestangular.one('mm3agent').get();
                UtilService.addPromiseToTracker(agentPromise, promiseTracker);
                return agentPromise;
            }, setMm3Agent: function (mm1Agent, promiseTracker) {
                var agentPromise = MmscConfigRestangular.all('mm3agent').customPUT(mm1Agent);
                UtilService.addPromiseToTracker(agentPromise, promiseTracker);
                return agentPromise;
            }, getMm4Agent: function (promiseTracker) {
                var agentPromise = MmscConfigRestangular.one('mm4agent').get();
                UtilService.addPromiseToTracker(agentPromise, promiseTracker);
                return agentPromise;
            }, setMm4Agent: function (mm1Agent, promiseTracker) {
                var agentPromise = MmscConfigRestangular.all('mm4agent').customPUT(mm1Agent);
                UtilService.addPromiseToTracker(agentPromise, promiseTracker);
                return agentPromise;
            }, getMm7Agent: function (promiseTracker) {
                var agentPromise = MmscConfigRestangular.one('mm7agent').get();
                UtilService.addPromiseToTracker(agentPromise, promiseTracker);
                return agentPromise;
            }, setMm7Agent: function (agent, promiseTracker) {
                var agentPromise = MmscConfigRestangular.all('mm7agent').customPUT(agent);
                UtilService.addPromiseToTracker(agentPromise, promiseTracker);
                return agentPromise;
            }, getRelayServer: function (promiseTracker) {
                var agentPromise = MmscConfigRestangular.one('relayserver').get();
                UtilService.addPromiseToTracker(agentPromise, promiseTracker);
                return agentPromise;
            }, setRelayServer: function (agent, promiseTracker) {
                var agentPromise = MmscConfigRestangular.all('relayserver').customPUT(agent);
                UtilService.addPromiseToTracker(agentPromise, promiseTracker);
                return agentPromise;
            }
        };
    });

    ApplicationServices.factory('MmscContentFilteringService', function ($log, MmscOperationRestangular, UtilService) {
        return {
            getRestrictedMediaTypes: function (promiseTracker) {
                var promise = MmscOperationRestangular.one('restrictedmediatypes').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            addRestrictedMediaType: function (newRestrictedMediaType, promiseTracker) {
                var promise = MmscOperationRestangular.all('restrictedmediatypes').post(newRestrictedMediaType);
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            deleteRestrictedMediaType: function (mainType, subType, promiseTracker) {
                var promise = MmscOperationRestangular.all('restrictedmediatypes/' + mainType + '/' + subType).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            }
        };
    });

    ApplicationServices.factory('MmscOperationService', function ($log, $q, $filter, MmscOperationRestangular, CMPFService, DEFAULT_REST_QUERY_LIMIT, Restangular, UtilService) {
        var getTrafficControlThresholdsByInterface = function (iface, promiseTracker) {
            var promise = MmscOperationRestangular.one('trafficcontrol/' + iface).get();
            UtilService.addPromiseToTracker(promise, promiseTracker);
            return promise;
        };
        var getTrafficControlThresholdsByInterfaceAndId = function (iface, id, promiseTracker) {
            var promise = MmscOperationRestangular.one('trafficcontrol/' + iface + '/' + id).get();
            UtilService.addPromiseToTracker(promise, promiseTracker);
            return promise;
        };
        var updateTrafficControlThresholdsByInterface = function (iface, thresholds, promiseTracker) {
            var promise = MmscOperationRestangular.all('trafficcontrol/' + iface).customPUT(thresholds);
            UtilService.addPromiseToTracker(promise, promiseTracker);
            return promise;
        };
        var updateTrafficControlThresholdsByInterfaceAndId = function (iface, id, thresholds, promiseTracker) {
            var promise = MmscOperationRestangular.all('trafficcontrol/' + iface + '/' + id).customPUT(thresholds);
            UtilService.addPromiseToTracker(promise, promiseTracker);
            return promise;
        };
        var getRetryPolicies = function (agentName, promiseTracker) {
            var promise = MmscOperationRestangular.one('retrypolicies/' + agentName).get();
            UtilService.addPromiseToTracker(promise, promiseTracker);
            return promise;
        };
        var getRetryPolicy = function (agentName, preference, promiseTracker) {
            var promise = MmscOperationRestangular.one('retrypolicies/' + agentName + '/' + preference).get();
            UtilService.addPromiseToTracker(promise, promiseTracker);
            return promise;
        };
        var createRetryPolicy = function (agentName, policy, promiseTracker) {
            var promise = MmscOperationRestangular.all('retrypolicies/' + agentName).post(policy);
            UtilService.addPromiseToTracker(promise, promiseTracker);
            return promise;
        };
        var updateRetryPolicy = function (agentName, policy, promiseTracker) {
            var promise = MmscOperationRestangular.one('retrypolicies/' + agentName + '/' + policy.preference).customPUT(policy);
            UtilService.addPromiseToTracker(promise, promiseTracker);
            return promise;
        };
        var deleteRetryPolicy = function (agentName, preference, promiseTracker) {
            var promise = MmscOperationRestangular.one('retrypolicies/' + agentName + '/' + preference).remove();
            UtilService.addPromiseToTracker(promise, promiseTracker);
            return promise;
        };
        return {
            getTrafficControlMm1Threshold: function (promiseTracker) {
                return getTrafficControlThresholdsByInterface('mm1', promiseTracker);
            },
            updateTrafficControlMm1: function (thresholds, promiseTracker) {
                return updateTrafficControlThresholdsByInterface('mm1', thresholds, promiseTracker);
            },
            getTrafficControlMm3Threshold: function (promiseTracker) {
                return getTrafficControlThresholdsByInterface('mm3', promiseTracker);
            },
            updateTrafficControlMm3: function (thresholds, promiseTracker) {
                return updateTrafficControlThresholdsByInterface('mm3', thresholds, promiseTracker);
            },
            getAllTrafficControlMm4Thresholds: function (promiseTracker) {
                return getTrafficControlThresholdsByInterface('mm4', promiseTracker);
            },
            getTrafficControlMm4Threshold: function (id, promiseTracker) {
                return getTrafficControlThresholdsByInterfaceAndId('mm4', id, promiseTracker);
            },
            updateTrafficControlMm4: function (id, thresholds, promiseTracker) {
                return updateTrafficControlThresholdsByInterfaceAndId('mm4', id, thresholds, promiseTracker);
            },
            getAllTrafficControlMm7Thresholds: function (promiseTracker) {
                return getTrafficControlThresholdsByInterface('mm7', promiseTracker);
            },
            getTrafficControlMm7Threshold: function (id, promiseTracker) {
                return getTrafficControlThresholdsByInterfaceAndId('mm7', id, promiseTracker);
            },
            updateTrafficControlMm7: function (id, thresholds, promiseTracker) {
                return updateTrafficControlThresholdsByInterfaceAndId('mm7', id, thresholds, promiseTracker);
            },
            getVasList: function (promiseTracker) {
                var promise = MmscOperationRestangular.one('services').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            createVas: function (app, promiseTracker) {
                var prom = MmscOperationRestangular.all('/services').post(app);
                UtilService.addPromiseToTracker(prom, promiseTracker);
                return prom;
            },
            createVasTariff: function (vasId, tariff, promiseTracker) {
                var prom = MmscOperationRestangular.all('/services/' + vasId + '/tariffs').post(tariff);
                UtilService.addPromiseToTracker(prom, promiseTracker);
                return prom;
            },
            getVas: function (vasId, promiseTracker) {
                var prom = MmscOperationRestangular.one('/services/' + vasId).get();
                UtilService.addPromiseToTracker(prom, promiseTracker);
                return prom;
            },
            getVasTariffs: function (vasId, promiseTracker) {
                var prom = MmscOperationRestangular.one('/services/' + vasId + '/tariffs').get();
                UtilService.addPromiseToTracker(prom, promiseTracker);
                return prom;
            },
            updateVas: function (vasId, app, promiseTracker) {
                var prom = MmscOperationRestangular.one('/services/' + vasId).customPUT(app);
                UtilService.addPromiseToTracker(prom, promiseTracker);
                return prom;
            },
            deleteVas: function (vasId, promiseTracker) {
                var prom = MmscOperationRestangular.one('/services/' + vasId).remove();
                UtilService.addPromiseToTracker(prom, promiseTracker);
                return prom;
            },
            deleteVasTariff: function (vasId, tariffId, promiseTracker) {
                var prom = MmscOperationRestangular.one('/services/' + vasId + '/tariffs/' + tariffId).remove();
                UtilService.addPromiseToTracker(prom, promiseTracker);
                return prom;
            },
            getAllOperatorList: function (promiseTracker) {
                var promise = MmscOperationRestangular.one('operators').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getOperator: function (opId, promiseTracker) {
                var promise = MmscOperationRestangular.one('operators/' + opId).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            updateOperator: function (opId, operator, promiseTracker) {
                var promise = MmscOperationRestangular.one('operators/' + opId).customPUT(operator);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            createOperator: function (operator, promiseTracker) {
                var promise = MmscOperationRestangular.all('operators').post(operator);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            deleteOperator: function (opId, promiseTracker) {
                var promise = MmscOperationRestangular.all('operators/' + opId).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            // Operator routings
            getOperatorRouting: function (key, opId) {
                var url = '/operators/' + opId + ((key === 'imsi') ? '/imsiranges' : '/ranges');

                var promise = MmscOperationRestangular.one(url).get();

                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            addOperatorRouting: function (key, opId, rangePattern) {
                var url = '/operators/' + opId + ((key === 'imsi') ? '/imsiranges' : '/ranges') + '/' + rangePattern;

                var promise = MmscOperationRestangular.one(url).post();

                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            deleteOperatorRouting: function (key, opId, rangePattern) {
                var url = '/operators/' + opId + ((key === 'imsi') ? '/imsiranges' : '/ranges') + '/' + rangePattern;

                var promise = MmscOperationRestangular.one(url).remove();

                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            // Retry policies
            getMM1AgentRetryPolicies: function (promiseTracker) {
                return getRetryPolicies('mm1agent', promiseTracker);
            },
            getMM1AgentRetryPolicy: function (preference, promiseTracker) {
                return getRetryPolicy('mm1agent', preference, promiseTracker);
            },
            createMM1AgentRetryPolicy: function (policy, promiseTracker) {
                return createRetryPolicy('mm1agent', policy, promiseTracker);
            },
            updateMM1AgentRetryPolicy: function (policy, promiseTracker) {
                return updateRetryPolicy('mm1agent', policy, promiseTracker);
            },
            deleteMM1AgentRetryPolicy: function (preference, promiseTracker) {
                return deleteRetryPolicy('mm1agent', preference, promiseTracker);
            },
            getMM3AgentRetryPolicies: function (promiseTracker) {
                return getRetryPolicies('mm3agent', promiseTracker);
            },
            getMM3AgentRetryPolicy: function (preference, promiseTracker) {
                return getRetryPolicy('mm3agent', preference, promiseTracker);
            },
            createMM3AgentRetryPolicy: function (policy, promiseTracker) {
                return createRetryPolicy('mm3agent', policy, promiseTracker);
            },
            updateMM3AgentRetryPolicy: function (policy, promiseTracker) {
                return updateRetryPolicy('mm3agent', policy, promiseTracker);
            },
            deleteMM3AgentRetryPolicy: function (preference, promiseTracker) {
                return deleteRetryPolicy('mm3agent', preference, promiseTracker);
            },
            getMM4AgentRetryPolicies: function (promiseTracker) {
                return getRetryPolicies('mm4agent', promiseTracker);
            },
            getMM4AgentRetryPolicy: function (preference, promiseTracker) {
                return getRetryPolicy('mm4agent', preference, promiseTracker);
            },
            createMM4AgentRetryPolicy: function (policy, promiseTracker) {
                return createRetryPolicy('mm4agent', policy, promiseTracker);
            },
            updateMM4AgentRetryPolicy: function (policy, promiseTracker) {
                return updateRetryPolicy('mm4agent', policy, promiseTracker);
            },
            deleteMM4AgentRetryPolicy: function (preference, promiseTracker) {
                return deleteRetryPolicy('mm4agent', preference, promiseTracker);
            },
            getMM7AgentRetryPolicies: function (promiseTracker) {
                return getRetryPolicies('mm7agent', promiseTracker);
            },
            getMM7AgentRetryPolicy: function (preference, promiseTracker) {
                return getRetryPolicy('mm7agent', preference, promiseTracker);
            },
            createMM7AgentRetryPolicy: function (policy, promiseTracker) {
                return createRetryPolicy('mm7agent', policy, promiseTracker);
            },
            updateMM7AgentRetryPolicy: function (policy, promiseTracker) {
                return updateRetryPolicy('mm7agent', policy, promiseTracker);
            },
            deleteMM7AgentRetryPolicy: function (preference, promiseTracker) {
                return deleteRetryPolicy('mm7agent', preference, promiseTracker);
            },
            getErrorCodePolicies: function (promiseTracker) {
                return getRetryPolicies('errors', promiseTracker);
            },
            createErrorCodePolicy: function (policy, promiseTracker) {
                return createRetryPolicy('errors', policy, promiseTracker);
            },
            getErrorCodePolicy: function (context, code, promiseTracker) {
                return getRetryPolicy('errors', context + '/' + code, promiseTracker);
            },
            updateErrorCodePolicy: function (context, code, policy, promiseTracker) {
                var promise = MmscOperationRestangular.one('retrypolicies/errors/' + context + '/' + code).customPUT(policy);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            deleteErrorCodePolicy: function (context, code, promiseTracker) {
                return deleteRetryPolicy('errors', context + '/' + code, promiseTracker);
            },
            createErrorCodeRetryPolicy: function (context, code, policy, promiseTracker) {
                return createRetryPolicy('errors/' + context + '/' + code, policy, promiseTracker);
            },
            updateErrorCodeRetryPolicy: function (context, code, policy, promiseTracker) {
                return updateRetryPolicy('errors/' + context + '/' + code, policy, promiseTracker);
            },
            getErrorCodeRetryPolicy: function (context, code, policy, promiseTracker) {
                return getRetryPolicy('errors/' + context + '/' + code, policy, promiseTracker);
            },
            deleteErrorCodeRetryPolicy: function (context, code, promiseTracker) {
                return deleteRetryPolicy('errors/' + context + '/' + code, promiseTracker);
            },
            getAddressTranslations: function (key, promiseTracker) {
                var promise = MmscOperationRestangular.all('address-translation/' + key).getList();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getAddressTranslation: function (key, adressRangeStart, adressRangeEnd, promiseTracker) {
                var url = 'address-translation/' + key + '/' + encodeURIComponent(adressRangeStart) + '/' + encodeURIComponent(adressRangeEnd);
                var promise = MmscOperationRestangular.one(url).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            addAddressTranslation: function (key, addressTranslation, promiseTracker) {
                var promise = MmscOperationRestangular.all('address-translation/' + key).post(addressTranslation);
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            updateAddressTranslation: function (key, addressTranslation, promiseTracker) {
                var promise = MmscOperationRestangular.all('address-translation/' + key).customPUT(addressTranslation);
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            deleteAddressTranslation: function (key, adressRangeStart, adressRangeEnd, promiseTracker) {
                var url = 'address-translation/' + key + '/' + encodeURIComponent(adressRangeStart) + '/' + encodeURIComponent(adressRangeEnd);
                var promise = MmscOperationRestangular.all(url).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            addressTranslationTest: function (key, msisdn) {
                var url = 'address-translation/' + key + '/test?address=' + encodeURIComponent(msisdn);

                var promise = MmscOperationRestangular.one(url).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getOrderedVasApplicationList: function () {
                var deferred = $q.defer();

                this.getVasList().then(function (vasApplications) {
                    // Initialize application list by application names.
                    vasApplications.vasList = _.filter(vasApplications.vasList, function (vasApplication) {
                        // Preparing the dropdown list as "<provider id> - <application name>"
                        vasApplication.label = (vasApplication.vaspId ? vasApplication.vaspId + ' - ' : '') + vasApplication.vasId;

                        $log.debug("Found VAS Application: ", vasApplication);

                        return true;
                    });
                    vasApplications.vasList = $filter('orderBy')(vasApplications.vasList, ['vaspId', 'vasId']);

                    deferred.resolve(vasApplications);
                }, function (response) {
                    deferred.reject(response);
                });

                return deferred.promise;
            }
        };
    });

    ApplicationServices.factory('MmscDashboardService', function ($log, MmscDashboardRestangular, UtilService) {
        return {
            getMmscDashboard: function (promiseTracker) {
                var promise = MmscDashboardRestangular.one('').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getMmscDashboardIncomingTraffic: function (promiseTracker) {
                var promise = MmscDashboardRestangular.one('incoming_traffic').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getMmscDashboardOutgoingTraffic: function (promiseTracker) {
                var promise = MmscDashboardRestangular.one('outgoing_traffic').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            }
        };
    });

    ApplicationServices.factory('MmscTroubleshootingService', function (MmscTroubleshootingRestangular, MmscRemoteTroubleshootingRestangular, UtilService) {
        return {
            getContentIdList: function (msgId, promiseTracker) {
                var promise = MmscTroubleshootingRestangular.one(msgId).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getContentById: function (msgId, contentId, promiseTracker) {
                var promise = MmscTroubleshootingRestangular.one(msgId + '/' + contentId).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            retryMessage: function (msgId, recipientAddress, promiseTracker) {
                var promise = MmscTroubleshootingRestangular.one(msgId + '?recipient=' + recipientAddress).post();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            cancelMessage: function (msgId, recipientAddress, promiseTracker) {
                var promise = MmscTroubleshootingRestangular.all(msgId + '?recipient=' + recipientAddress).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);
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
    ApplicationServices.factory('UssdBrowserService', function ($log, UssdBrowserRestangular, UssdBrowserStatsRestangular, UtilService) {
        return {
            getApplications: function (promiseTracker) {
                var promise = UssdBrowserRestangular.one('web-service-application').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getApplication: function (appName, promiseTracker) {
                var promise = UssdBrowserRestangular.one('web-service-application/' + appName).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            addApplication: function (app, promiseTracker) {
                var promise = UssdBrowserRestangular.all('web-service-application').post(app);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            updateApplication: function (app, promiseTracker) {
                var promise = UssdBrowserRestangular.all('web-service-application').customPUT(app);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            deleteApplication: function (app, promiseTracker) {
                var promise = UssdBrowserRestangular.all('web-service-application/' + app.name).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getTextReplacements: function (promiseTracker) {
                var promise = UssdBrowserRestangular.one('routing-configuration-text-replacement').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getTextReplacement: function (name, promiseTracker) {
                var promise = UssdBrowserRestangular.one('routing-configuration-text-replacement/' + name).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            addTextReplacement: function (text, promiseTracker) {
                var promise = UssdBrowserRestangular.all('routing-configuration-text-replacement').post(text);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            updateTextReplacement: function (text, promiseTracker) {
                var promise = UssdBrowserRestangular.all('/routing-configuration-text-replacement').customPUT(text);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            deleteTextReplacement: function (text, promiseTracker) {
                var promise = UssdBrowserRestangular.all('routing-configuration-text-replacement/' + text.name).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getConfiguration: function (promiseTracker) {
                var promise = UssdBrowserRestangular.one('ussd-browser-configuration').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            setConfiguration: function (conf, promiseTracker) {
                var promise = UssdBrowserRestangular.all('ussd-browser-configuration').customPUT(conf);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getSmppGw: function (promiseTracker) {
                var promise = UssdBrowserRestangular.one('smpp-gw-provider').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getUssdSessions: function (promiseTracker) {
                var promise = UssdBrowserStatsRestangular.one('ussd-browser-application-sessions').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            }
        };
    });

    ApplicationServices.factory('UssdGwConfService', function ($log, UssdGwConfigRestangular, UtilService) {
        return {
            getApplicationGateway: function (promiseTracker) {
                var promise = UssdGwConfigRestangular.one('appgw').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            updateApplicationGateway: function (config, promiseTracker) {
                var promise = UssdGwConfigRestangular.all('appgw').customPUT(config);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getApplicationRouting: function (appId, promiseTracker) {
                var promise = UssdGwConfigRestangular.one('routing/ussd-application/' + appId).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            addApplicationRouting: function (newRange, promiseTracker) {
                var promise = UssdGwConfigRestangular.all('routing/ussd-application').post(newRange);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            deleteApplicationRouting: function (appId, routing, promiseTracker) {
                var promise = UssdGwConfigRestangular.all('routing/ussd-application/' + appId + '/' + routing.addRangeStart + '/' + routing.addRangeEnd).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            }
        };
    });

    ApplicationServices.factory('UssdGwProvService', function ($log, UssdGwProvRestangular, UssdGwStatsRestangular, UssdGwSmppStatsRestangular, UtilService) {
        return {
            getAllUssdApplications: function (promiseTracker) {
                var promise = UssdGwProvRestangular.one('applications/ussd').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getUssdApplication: function (appId, promiseTracker) {
                var promise = UssdGwProvRestangular.one('applications/ussd/' + appId).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            addUssdApplication: function (app, promiseTracker) {
                var promise = UssdGwProvRestangular.all('applications/ussd').post(app);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            updateUssdApplication: function (app, promiseTracker) {
                var promise = UssdGwProvRestangular.all('applications/ussd').customPUT(app);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            deleteUssdApplication: function (app, promiseTracker) {
                var promise = UssdGwProvRestangular.all('applications/ussd/' + app.id).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getAllSessionsSummary: function (promiseTracker) {
                var promise = UssdGwStatsRestangular.one('get-all-sessions-summary').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getSmppConnections: function (promiseTracker) {
                var promise = UssdGwSmppStatsRestangular.one('get-smpp-connections').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getTPS: function (promiseTracker) {
                var promise = UssdGwStatsRestangular.one('tps').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getSessionDuration: function (promiseTracker) {
                var promise = UssdGwStatsRestangular.one('get-session-duration').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            }

        };
    });

    // SMSF Services
    ApplicationServices.factory('SmsfConfigService', function($log, SmsfConfigRestangular, UtilService){
        return {
            getCoreConfig: function () {

                var promise = SmsfConfigRestangular.one('/').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateCoreConfig: function (config) {
                var promise = SmsfConfigRestangular.all('/').customPUT(config);
                UtilService.addPromiseToTracker(promise);
                return promise;
            }
        };
    });

    ApplicationServices.factory('SmsfDashboardService', function($log, SmsfDashboardRestangular, UtilService){
        return {
            getDashboardData: function () {

                var promise = SmsfDashboardRestangular.one('/data').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getDashboardMOFailure: function () {

                var promise = SmsfDashboardRestangular.one('/moFailureReasons').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getDashboardMTFailure: function () {

                var promise = SmsfDashboardRestangular.one('/mtFailureReasons').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        };
    });

    // USSI Services
    // TODO: Edit these with provided Api endpoints
    ApplicationServices.factory('UssiCoreConfService', function($log, UssiGwConfigRestangular, UtilService){
        return {
            getCoreConfig: function () {

                var promise = UssiGwConfigRestangular.one('/').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateCoreConfig: function (config) {
                var promise = UssiGwConfigRestangular.all('/').customPUT(config);
                UtilService.addPromiseToTracker(promise);
                return promise;
            }
        };
    });

    ApplicationServices.factory('UssiDashboardService', function($log, UssiGwDashboardRestangular, UtilService){
        return {
            getDashboardData: function () {

                var promise = UssiGwDashboardRestangular.one('/data').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getDashboardTps: function () {

                var promise = UssiGwDashboardRestangular.one('/tps').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        };
    });

    // SMS AntiSpam Services
    ApplicationServices.factory('SMSAntiSpamService', function ($log, SMSAntiSpamRestangular, UtilService) {
        return {
            getHeartBeat: function (promiseTracker) {
                var promise = SMSAntiSpamRestangular.one('/micro/services/heartbeat').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            }
        };
    });

    ApplicationServices.factory('SMSAntiSpamConfigService', function ($log, $timeout, SMSAntiSpamConfigRestangular, UtilService) {
        return {
            FRAUD_DETECTION_KEYS: {
                MO_IB: 'MO_IB',
                MO_OB: 'MO_OB',
                MT_FRAUD: 'MT_FRAUD',
                MO_AS: 'MO_AS'
            },
            getDashboard: function (promiseTracker) {
                var promise = SMSAntiSpamConfigRestangular.one('/dashboard').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            // Content Filters
            getContentFiltersList: function (direction, participant) {
                var promise = SMSAntiSpamConfigRestangular.one('/content-filter/' + direction + '/' + participant).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getContentFiltersEntry: function (direction, participant, name) {
                var promise = SMSAntiSpamConfigRestangular.one('/content-filter/' + direction + '/' + participant + '/' + name).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createContentFiltersEntry: function (direction, participant, entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/content-filter/' + direction + '/' + participant).post(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateContentFiltersEntry: function (direction, participant, entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/content-filter/' + direction + '/' + participant + '/' + entry.name).customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteContentFiltersEntry: function (direction, participant, name) {
                var promise = SMSAntiSpamConfigRestangular.one('/content-filter/' + direction + '/' + participant + '/' + name).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getContentFiltersEntryRangeList: function (direction, participant, name) {
                var promise = SMSAntiSpamConfigRestangular.one('/content-filter/' + direction + '/' + participant + '/' + name + '/range').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createContentFiltersEntryRange: function (direction, participant, name, range) {
                var promise = SMSAntiSpamConfigRestangular.all('/content-filter/' + direction + '/' + participant + '/' + name + '/range').post(range);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteContentFiltersEntryRange: function (direction, participant, name, rangeName) {
                var promise = SMSAntiSpamConfigRestangular.one('/content-filter/' + direction + '/' + participant + '/' + name + '/range/' + rangeName).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Counters
            getCountersList: function (direction, participant, type) {
                var promise = SMSAntiSpamConfigRestangular.one('/counter/' + direction + '/' + participant + '/' + type).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getCountersEntry: function (direction, participant, type, name) {
                var promise = SMSAntiSpamConfigRestangular.one('/counter/' + direction + '/' + participant + '/' + type + '/' + name).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createCountersEntry: function (direction, participant, type, entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/counter/' + direction + '/' + participant + '/' + type).post(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateCountersEntry: function (direction, participant, type, entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/counter/' + direction + '/' + participant + '/' + type + '/' + entry.name).customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteCountersEntry: function (direction, participant, type, name) {
                var promise = SMSAntiSpamConfigRestangular.one('/counter/' + direction + '/' + participant + '/' + type + '/' + name).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getCountersEntryRangeList: function (direction, participant, type, name) {
                var promise = SMSAntiSpamConfigRestangular.one('/counter/' + direction + '/' + participant + '/' + type + '/' + name + '/range').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createCountersEntryRange: function (direction, participant, type, name, range) {
                var promise = SMSAntiSpamConfigRestangular.all('/counter/' + direction + '/' + participant + '/' + type + '/' + name + '/range').post(range);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteCountersEntryRange: function (direction, participant, type, name, rangeName) {
                var promise = SMSAntiSpamConfigRestangular.one('/counter/' + direction + '/' + participant + '/' + type + '/' + name + '/range/' + rangeName).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Antispam Lists
            getAntispamLists: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/aslist/getall').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getAntispamListEntry: function (listId) {
                var promise = SMSAntiSpamConfigRestangular.one('/aslist/get/' + listId).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createAntispamListEntry: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/aslist/insert').post(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateAntispamListEntry: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/aslist/update').customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteAntispamListEntry: function (listId) {
                var promise = SMSAntiSpamConfigRestangular.one('/aslist/delete/' + listId).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getAntispamListItems: function (listId) {
                var promise = SMSAntiSpamConfigRestangular.one('/aslist/getItems/' + listId).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createAntispamListItem: function (listId, entry) {
                var body = {
                    listItem: entry
                };
                var promise = SMSAntiSpamConfigRestangular.all('/aslist/insertItem/' + listId).post(body);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteAntispamListItem: function (listId, listItem) {
                var promise = SMSAntiSpamConfigRestangular.one('/aslist/deleteItem/' + listId + '/' + listItem).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Black Lists
            getBlackLists: function (key) {
                var promise = SMSAntiSpamConfigRestangular.one('/url-blacklist/pattern/' + key).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getBlackListEntry: function (key) {
                var promise = SMSAntiSpamConfigRestangular.one('/url-blacklist/url/' + key).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createBlackListEntry: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/url-blacklist/insert').post(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateBlackListEntry: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/url-blacklist/update').customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteBlackListEntry: function (key) {
                var promise = SMSAntiSpamConfigRestangular.one('/url-blacklist/url/' + key).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Grey Lists
            getGreyList: function (key) {
                var promise = SMSAntiSpamConfigRestangular.one('/frauddetection/list/entry/' + key).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getGreyListEntry: function (key, prefix) {
                var promise = SMSAntiSpamConfigRestangular.one('/frauddetection/list/entry/' + key + '/' + prefix).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createGreyListEntry: function (key, entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/frauddetection/list/entry/' + key).post(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateGreyListEntry: function (key, entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/frauddetection/list/entry/' + key).customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteGreyListEntry: function (key, prefix) {
                var promise = SMSAntiSpamConfigRestangular.one('/frauddetection/list/entry/' + key + '/' + prefix).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Msisdn Range Lists
            getMsisdnRangeList: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/msisdn-range').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getMsisdnRangeListEntry: function (name) {
                var promise = SMSAntiSpamConfigRestangular.one('/msisdn-range/' + name).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createMsisdnRangeListEntry: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/msisdn-range').post(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteMsisdnRangeListEntry: function (name) {
                var promise = SMSAntiSpamConfigRestangular.one('/msisdn-range/' + name).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createMsisdnRangeListEntryRange: function (name, range) {
                var promise = SMSAntiSpamConfigRestangular.all('/msisdn-range/' + name + '/range').post(range);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteMsisdnRangeListEntryRange: function (name, start, end) {
                var promise = SMSAntiSpamConfigRestangular.one('/msisdn-range/' + name + '/range/' + start + '/' + end).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Application MT Filtering
            getApplicationMTFilteringList: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/applicationfiltering/exclusion/entry').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getApplicationMTFilteringListEntry: function (start, end) {
                var promise = SMSAntiSpamConfigRestangular.one('/applicationfiltering/exclusion/entry/' + start + '/' + end).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createApplicationMTFilteringListEntry: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/applicationfiltering/exclusion/entry').post(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateApplicationMTFilteringListEntry: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/applicationfiltering/exclusion/entry').customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteApplicationMTFilteringListEntry: function (start, end) {
                var promise = SMSAntiSpamConfigRestangular.one('/applicationfiltering/exclusion/entry/' + start + '/' + end).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Application MT Filtering SMSC GT
            getApplicationMTFilteringSMSCGTList: function (start, end) {
                var promise = SMSAntiSpamConfigRestangular.one('/applicationfiltering/exclusion/smsgt/' + start + '/' + end).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createApplicationMTFilteringSMSCGT: function (start, end, smscGT) {
                var promise = SMSAntiSpamConfigRestangular.all('/applicationfiltering/exclusion/smsgt/' + start + '/' + end).post(smscGT);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteApplicationMTFilteringSMSCGTList: function (start, end, smscGTNumber) {
                var promise = SMSAntiSpamConfigRestangular.one('/applicationfiltering/exclusion/smsgt/' + start + '/' + end + '/' + smscGTNumber).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // International to Inbound
            getIntToInboundList: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/inttoinbound/exclusion').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getIntToInboundListEntry: function (number, type) {
                var promise = SMSAntiSpamConfigRestangular.one('/inttoinbound/exclusion/' + number + '/' + type).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createIntToInboundListEntry: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/inttoinbound/exclusion').post(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateIntToInboundListEntry: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/inttoinbound/exclusion').customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteIntToInboundListEntry: function (number, type) {
                var promise = SMSAntiSpamConfigRestangular.one('/inttoinbound/exclusion/' + number + '/' + type).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // MT SMS Hub Filtering
            getMTSMSHubFilteringList: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/trustedsmscgt/list').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getMTSMSHubFilteringListEntry: function (prefix) {
                var promise = SMSAntiSpamConfigRestangular.one('/trustedsmscgt/list/entry/' + prefix).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createMTSMSHubFilteringListEntry: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/trustedsmscgt/list/entry').post(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateMTSMSHubFilteringListEntry: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/trustedsmscgt/list/entry').customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteMTSMSHubFilteringListEntry: function (prefix) {
                var promise = SMSAntiSpamConfigRestangular.one('/trustedsmscgt/list/entry/' + prefix).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // MO Inbound or Outbound Roamer Filtering
            getMOInboundOutboundRoamerFilteringList: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/frauddetection/exclusionlist').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getMOInboundOutboundRoamerFilteringListEntry: function (prefix) {
                var promise = SMSAntiSpamConfigRestangular.one('/frauddetection/exclusionlist/' + prefix).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createMOInboundOutboundRoamerFilteringListEntry: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/frauddetection/exclusionlist').post(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateMOInboundOutboundRoamerFilteringListEntry: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/frauddetection/exclusionlist').customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteMOInboundOutboundRoamerFilteringListEntry: function (prefix) {
                var promise = SMSAntiSpamConfigRestangular.one('/frauddetection/exclusionlist/' + prefix).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // MO Inbound or Outbound Roamer Filtering SMSC GT
            getMOInboundOutboundRoamerFilteringSMSCGTList: function (prefix) {
                var promise = SMSAntiSpamConfigRestangular.one('/frauddetection/exclusionlist/smsgt/' + prefix).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createMOInboundOutboundRoamerFilteringSMSCGT: function (prefix, smscGT) {
                var promise = SMSAntiSpamConfigRestangular.all('/frauddetection/exclusionlist/smsgt/' + prefix).post(smscGT);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteMOInboundOutboundRoamerFilteringSMSCGTList: function (prefix, smscGTNumber) {
                var promise = SMSAntiSpamConfigRestangular.one('/frauddetection/exclusionlist/smsgt/' + prefix + '/' + smscGTNumber).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // MO Inbound or Outbound Roamer Filtering
            getLocalIncomingMOList: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/screeninglists/localincominglist').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createLocalIncomingMOListEntry: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/screeninglists/localincominglist/' + entry.msc).post();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteLocalIncomingMOListEntry: function (msc) {
                var promise = SMSAntiSpamConfigRestangular.one('/screeninglists/localincominglist/' + msc).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Parameter Filtering
            getParameterFilteringList: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/screening').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getParameterFilteringListEntry: function (name) {
                var promise = SMSAntiSpamConfigRestangular.one('/screening/' + name).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createParameterFilteringListEntry: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/screening').post(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateParameterFilteringListEntry: function (name, entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/screening/' + name).customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteParameterFilteringListEntry: function (name) {
                var promise = SMSAntiSpamConfigRestangular.one('/screening/' + name).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // SRI-SM Filtering
            getSRISMFilteringList: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/srifsmfiltering/entry').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getSRISMFilteringListEntry: function (prefix) {
                var promise = SMSAntiSpamConfigRestangular.one('/srifsmfiltering/entry/' + prefix).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createSRISMFilteringListEntry: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/srifsmfiltering/entry').post(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateSRISMFilteringListEntry: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/srifsmfiltering/entry').customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteSRISMFilteringListEntry: function (prefix) {
                var promise = SMSAntiSpamConfigRestangular.one('/srifsmfiltering/entry/' + prefix).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // SRI-FSM Counter
            getSRIFSMCounterConfiguration: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/srifsmcounter/conf').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateSRIFSMCounterConfiguration: function (config) {
                var promise = SMSAntiSpamConfigRestangular.all('/srifsmcounter/conf').customPUT(config);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Filtering
            getMainFilteringConfiguration: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/configuration').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateMainFilteringConfiguration: function (config) {
                var promise = SMSAntiSpamConfigRestangular.all('/configuration').customPUT(config);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getApplicationMTFilteringConfiguration: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/applicationfiltering/exclusion/conf').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateApplicationMTFilteringConfiguration: function (config) {
                var promise = SMSAntiSpamConfigRestangular.all('/applicationfiltering/exclusion/conf').customPUT(config);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getIntlToInboundFilteringConfiguration: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/inttoinbound/config').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateIntlToInboundFilteringConfiguration: function (config) {
                var promise = SMSAntiSpamConfigRestangular.all('/inttoinbound/config').customPUT(config);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getSRISMFilteringConfiguration: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/srifsmfiltering/config').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateSRISMFilteringConfiguration: function (config) {
                var promise = SMSAntiSpamConfigRestangular.all('/srifsmfiltering/config').customPUT(config);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getLocalIncomingMOFilteringConfiguration: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/screeninglists/localincominglist/conf').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateLocalIncomingMOFilteringConfiguration: function (config) {
                var promise = SMSAntiSpamConfigRestangular.all('/screeninglists/localincominglist/conf').customPUT(config);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Fraud detection
            getFraudDetectionConfiguration: function (key) {
                var url = '/frauddetection' + (key ? '/list/conf/' + key : '/conf');

                var promise = SMSAntiSpamConfigRestangular.one(url).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateFraudDetectionConfiguration: function (config, key) {
                var url = '/frauddetection' + (key ? '/list/conf/' + key : '/conf');

                var promise = SMSAntiSpamConfigRestangular.all(url).customPUT(config);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // MO Anti-Spoofing
            getMOAntiSpoofingConfiguration: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/frauddetection/antispoofing').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateMOAntiSpoofingConfiguration: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/frauddetection/antispoofing').customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // IMSI masking
            getIMSIMaskingConfiguration: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/imsimasking').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateIMSIMaskingConfiguration: function (name, config) {
                var promise = SMSAntiSpamConfigRestangular.all('/imsimasking/' + name).customPUT(config);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // SCA modification
            getSCAModificationConfiguration: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/scamodifier/config').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateSCAModificationConfiguration: function (config) {
                var promise = SMSAntiSpamConfigRestangular.all('/scamodifier/config').customPUT(config);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getSCAModifierList: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/scamodifier/entry').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getSCAModifierListEntry: function (callingGt, mscGt) {
                var promise = SMSAntiSpamConfigRestangular.one('/scamodifier/entry/' + callingGt + '/' + mscGt).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createSCAModifierListEntry: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/scamodifier/entry').post(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateSCAModifierListEntry: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/scamodifier/entry').customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteSCAModifierListEntry: function (callingGt, mscGt) {
                var promise = SMSAntiSpamConfigRestangular.one('/scamodifier/entry/' + callingGt + '/' + mscGt).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // SMSC GT
            getSMSCGTConfiguration: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/smscgtcorrection/conf').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateSMSCGTConfiguration: function (config) {
                var promise = SMSAntiSpamConfigRestangular.all('/smscgtcorrection/conf').customPUT(config);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Alarm Notifications. Possible key values are: all, new, old
            getAlarmStatistics: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/alarms/stats').get();
                // Do not set promise tracker so does not need to show indicator for statistic data.

                return promise;
            },
            getAlarmNotifications: function (key, pageSize, offset, promiseTracker) {
                if (offset === 0) {
                    offset = 1;
                }

                var promise = SMSAntiSpamConfigRestangular.one('/alarms/' + key + '?pageSize=' + pageSize + '&offset=' + offset).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getAllAlarmNotifications: function (pageSize, offset, promiseTracker) {
                return this.getAlarmNotifications('all', pageSize, offset, promiseTracker);
            },
            getNewAlarmNotifications: function (pageSize, offset, promiseTracker) {
                return this.getAlarmNotifications('new', pageSize, offset, promiseTracker);
            },
            getOldAlarmNotifications: function (pageSize, offset, promiseTracker) {
                return this.getAlarmNotifications('old', pageSize, offset, promiseTracker);
            },
            getAlarmNotification: function (entryId) {
                var promise = SMSAntiSpamConfigRestangular.one('/alarms/detailed/' + entryId).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteAlarmNotification: function (entryId) {
                var promise = SMSAntiSpamConfigRestangular.one('/alarms/detailed/' + entryId).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateAlarmNotification: function (alarmNotification) {
                var promise = SMSAntiSpamConfigRestangular.all('/alarms/detailed/' + alarmNotification.alarmEntry.entryId).customPUT(alarmNotification);
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        };
    });

    ApplicationServices.factory('SMSAntiSpamAlarmService', function ($log, $q, Restangular, SMSAntiSpamConfigService) {
        return {
            stats: {
                newAlarmsCount: 0,
                totalAlarmsCount: 0
            },
            updateNewAlarmsCount: function () {
                var _self = this;

                var deferred = $q.defer();

                SMSAntiSpamConfigService.getAlarmStatistics().then(function (response) {
                    var apiResponse = Restangular.stripRestangular(response);

                    $log.debug('Anti-Spam SMS alarm notifiation stats: ', apiResponse);

                    _self.stats = apiResponse.alarmStats;

                    deferred.resolve(response);
                });

                return deferred.promise;
            }
        };
    });

    // MCA Services
    ApplicationServices.factory('MCAConfService', function ($log, $filter, MCAConfigRestangular, Restangular, notification, $translate, UtilService,
                                                            P4M_MVNO_NAME) {
        var getMessageTemplates = function (serviceKey) {
            var promise = MCAConfigRestangular.one(serviceKey + '/' + P4M_MVNO_NAME + '/MCN').get();
            UtilService.addPromiseToTracker(promise);
            return promise.then(function (response) {
                var apiResponse = Restangular.stripRestangular(response);
                $log.debug('MCA get messages. Response: ', apiResponse);

                if (apiResponse && apiResponse.errorCode) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: apiResponse.errorCode,
                            errorText: apiResponse.message
                        })
                    });
                } else {
                    return $filter('orderBy')(apiResponse, 'name');
                }
            }, function (response) {
                if (response.data) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: response.data.errorCode,
                            errorText: response.data.message
                        })
                    });
                }

                return [];
            });
        };

        var getMessageTemplateByTemplateName = function (serviceKey, templateName) {
            var promise = MCAConfigRestangular.one(serviceKey + '/' + P4M_MVNO_NAME + '/MCN/' + templateName).get();
            UtilService.addPromiseToTracker(promise);

            return promise;
        };

        return {
            // Message Templates
            // MCA
            getMcaMessageTemplates: function () {
                return getMessageTemplates('messageFormats/mca');
            },
            getMcaMessageTemplateByTemplateName: function (templateName) {
                return getMessageTemplateByTemplateName('messageFormats/mca', templateName);
            },
            updateMcaMessageTemplateByTemplateName: function (templateName, format) {
                var promise = MCAConfigRestangular.all('messageFormats/mca/' + P4M_MVNO_NAME + '/MCN/' + templateName).customPUT(format);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            addNewMcaMessageTemplateByTemplateName: function (format) {
                var promise = MCAConfigRestangular.all('messageFormats/mca/' + P4M_MVNO_NAME + '/MCN').post(format);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteMcaMessageTemplateByTemplateName: function (templateName) {
                var promise = MCAConfigRestangular.all('messageFormats/mca/' + P4M_MVNO_NAME + '/MCN/' + templateName).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Notify Me
            getNotifyMeMessageTemplates: function () {
                return getMessageTemplates('messageFormats/notifyMe');
            },
            getNotifyMeMessageTemplateByTemplateName: function (templateName) {
                return getMessageTemplateByTemplateName('messageFormats/notifyMe', templateName);
            },
            updateNotifyMeMessageTemplateByTemplateName: function (templateName, format) {
                var promise = MCAConfigRestangular.all('messageFormats/notifyMe/' + P4M_MVNO_NAME + '/MCN/' + templateName).customPUT(format);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            addNewNotifyMeMessageTemplateByTemplateName: function (format) {
                var promise = MCAConfigRestangular.all('messageFormats/notifyMe/' + P4M_MVNO_NAME + '/MCN').post(format);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteNotifyMeMessageTemplateByTemplateName: function (templateName) {
                var promise = MCAConfigRestangular.all('messageFormats/notifyMe/' + P4M_MVNO_NAME + '/MCN/' + templateName).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        };
    });

    ApplicationServices.factory('MCADashboardService', function ($log, MCADashboardRestangular, CMPFService, UtilService,
                                                                 P4M_MVNO_NAME) {
        return {
            getStatistics: function (promiseTracker) {
                var promise = MCADashboardRestangular.one('statistics/' + P4M_MVNO_NAME + '/MCN').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            }
        };
    });

    // Voice Mail Services
    ApplicationServices.factory('VMDashboardService', function ($log, VMDashboardRestangular, UtilService) {
        return {
            getVMDashboard: function (promiseTracker) {
                var promise = VMDashboardRestangular.one('voicemail').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            }
        };
    });
    ApplicationServices.factory('VMConfigurationService', function ($log, $q, VMConfigurationRestangular, VMSelfCareRestangular, UtilService) {
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
            },
            getCoSProfileEntry: function (profileId) {
                var promise = VMConfigurationRestangular.one('/cos-profiles/' + profileId).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateCoSProfileEntry: function (profileId, entry) {
                var promise = VMConfigurationRestangular.all('/cos-profiles/' + profileId).customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Retrieve Service Profile
            getServiceProfile: function () {
                var promise = VMConfigurationRestangular.one('/service-profiles/vm').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateServiceProfile: function (entry) {
                var promise = VMConfigurationRestangular.all('/service-profiles/vm').customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getLanguages: function () {
                var promise = VMSelfCareRestangular.one('languages').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Retrieve Notification Text
            getNotificationText: function (languageCode, type) {
                var url = '/texts/static/' + languageCode + '/notification';
                if (type) {
                    url += '?type=' + type;
                }

                var promise = VMConfigurationRestangular.one(url).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateNotificationText: function (languageCode, entry, type) {
                var url = '/texts/static/' + languageCode + '/notification';
                if (type) {
                    url += '?type=' + type;
                }

                var promise = VMConfigurationRestangular.all(url).customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Prompt List
            getPromptList: function (contentType) {
                var contentList = [];

                contentList['common'] = {
                    "contentList": [
                        "VM_BEEP",
                        "VM_FIRST_MSG",
                        "VM_LANGUAGE_MENU",
                        "VM_LAST_MSG",
                        "VM_MSG_DELETED",
                        "VM_MSG_SAVED",
                        "VM_NEW_MSG_PROMPT",
                        "VM_NEW_MSGS_PROMPT",
                        "VM_NEXT_MSG",
                        "VM_NO_MATCH",
                        "VM_NO_MSG_EXISTS",
                        "VM_NO_NEW_MSG_EXISTS",
                        "VM_NO_RESPONSE",
                        "VM_NUMBEROF_PROMPT",
                        "VM_OLD_MSG_PROMPT",
                        "VM_OLD_MSGS_PROMPT",
                        "VM_WRONG_SELECTION"
                    ]
                };
                contentList['deposit'] = {
                    "contentList": [
                        "VM_DESTINATION_MSGBOX_FULL",
                        "VM_MESSAGE_SENT",
                        "VM_RECORD_MSG"
                    ]
                };
                contentList['retrieval'] = {
                    "contentList": [
                        "VM_ALL_FWD_DISABLED",
                        "VM_ALL_MAILBOX_MENU_2",
                        "VM_BUSY_FWD_DISABLED",
                        "VM_BUSY_FWD_ENABLED",
                        "VM_DATE_INFO_PROMPT",
                        "VM_DISABLE_FWD_OPTIONS_MENU",
                        "VM_DISABLE_PASSWORD_MENU",
                        "VM_ENABLE_FWD_OPTIONS_MENU",
                        "VM_ENABLE_PASSWORD_MENU",
                        "VM_ENTER_NEW_PASSWORD",
                        "VM_ENTER_PASSWORD",
                        "VM_ENTER_MOBILY_NUMBER",
                        "VM_FORWARDING_MENU",
                        "VM_GREETING_ACTIVATED",
                        "VM_GREETING_DELETED",
                        "VM_GREETING_EXISTING_MENU",
                        "VM_GREETING_MENU",
                        "VM_GREETING_OPTIONS_MENU",
                        "VM_NA_FWD_DISABLED",
                        "VM_NA_FWD_ENABLED",
                        "VM_NEW_MAILBOX_MENU_2",
                        "VM_OLD_MAILBOX_MENU_2",
                        "VM_PASSWORD",
                        "VM_PASSWORD_ACTIVATED",
                        "VM_PASSWORD_CHANGED",
                        "VM_PASSWORD_CONFIRM_MENU",
                        "VM_PASSWORD_DEACTIVATED",
                        "VM_PASSWORD_INVALID",
                        "VM_PERSONAL_MENU",
                        "VM_PHONE_FAILURE_PROMPT",
                        "VM_RECORD_GREETING",
                        "VM_SENDER_INFO_PROMPT",
                        "VM_SINGLE_MSG_MENU",
                        "VM_START_INFO_PROMPT",
                        "VM_SUBSCRIBER_MSGBOX_FULL",
                        "VM_UNCOND_FWD_DISABLED",
                        "VM_UNCOND_FWD_ENABLED",
                        "VM_UNKNOWN_SENDER_PROMPT",
                        "VM_UNREACHABLE_FWD_DISABLED",
                        "VM_UNREACHABLE_FWD_ENABLED",
                        "VM_YOUR_GREETING",
                        "VM_WELCOME"
                    ]
                };

                return contentList[contentType].contentList;
            }
        };
    });
    ApplicationServices.factory('VMProvisioningService', function ($log, VMProvisioningRestangular, UtilService) {
        return {
            SERVICE_NAME: 'VoiceMail',
            getServicePreferences: function (msisdn) {
                var promise = VMProvisioningRestangular.one('messageBoxes/' + msisdn).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        };
    });

    // PM4 Services
    ApplicationServices.factory('P4MService', function ($log, P4MRestangular, P4M_MVNO_NAME, UtilService) {
        return {
            // Collect Call
            getCcDashboard: function (promiseTracker) {
                var promise = P4MRestangular.one('ccDashboard').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getCcConfigAll: function () {
                var promise = P4MRestangular.one('ccServiceConfig/' + P4M_MVNO_NAME + '/ccCosConfig').get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            getCcConfig: function (cosName) {
                var promise = P4MRestangular.one('ccServiceConfig/' + P4M_MVNO_NAME + '/ccCosConfig/' + cosName).get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            updateCcConfig: function (cosName, profile) {
                var promise = P4MRestangular.all('ccServiceConfig/' + P4M_MVNO_NAME + '/ccCosConfig/' + cosName).customPUT(profile);
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            getCcServiceConfig: function (promiseTracker) {
                var promise = P4MRestangular.one('ccServiceConfig/' + P4M_MVNO_NAME + '/ccLimitConfig').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            updateCcServiceConfig: function (serviceConfig) {
                var promise = P4MRestangular.all('ccServiceConfig/' + P4M_MVNO_NAME + '/ccLimitConfig').customPUT(serviceConfig);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Poke Call
            getPokeCallServiceDashboard: function (promiseTracker) {
                var promise = P4MRestangular.one('pokeDashboard').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getPokeCallServiceConfiguration: function (promiseTracker) {
                var promise = P4MRestangular.one('pokeServiceConfig/' + P4M_MVNO_NAME + '/pokeLimitConfig').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            updatePokeCallServiceConfiguration: function (profile, promiseTracker) {
                var promise = P4MRestangular.all('pokeServiceConfig/' + P4M_MVNO_NAME + '/pokeLimitConfig').customPUT(profile);
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            }
        };
    });

    // RBT Services
    ApplicationServices.factory('RBTDashboardService', function ($log, RBTConfigurationRestangular, UtilService) {
        return {
            getRBTDashboard: function (promiseTracker) {
                var promise = RBTConfigurationRestangular.one('/rbt-dashboard').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            }
        };
    });
    ApplicationServices.factory('RBTConfService', function ($log, RBTConfigurationRestangular, UtilService) {
        return {
            getRBTServiceProfiles: function (promiseTracker) {
                var promise = RBTConfigurationRestangular.one('/rbt-service-profiles').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            updateRBTServiceProfiles: function (config) {
                var promise = RBTConfigurationRestangular.all('/rbt-service-profiles').customPUT(config);
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            getPTServiceProfiles: function () {

                var promise = RBTConfigurationRestangular.one('/pt-service-profiles').get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            updatePTServiceProfiles: function (config) {
                var promise = RBTConfigurationRestangular.all('/pt-service-profiles').customPUT(config);
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            getHangupServiceProfiles: function () {

                var promise = RBTConfigurationRestangular.one('/hangup-profiles').get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            updateHangupServiceProfiles: function (config) {
                var promise = RBTConfigurationRestangular.all('/hangup-profiles').customPUT(config);
                UtilService.addPromiseToTracker(promise);
                return promise;
            }
        };
    });

    // Screening Manager Services
    ApplicationServices.factory('ScreeningManagerService', function ($log, ScreeningManagerRestangular, ScreeningManagerStatsRestangular, Restangular, notification, $translate, UtilService) {
        var CHANNEL_TYPE = 'CC';

        return {
            lists: {
                // SMSC
                SMSC_GLOBAL_KEY: 'MSISDN',
                SMSC_PER_APPLICATION_PREFIX_KEY: 'smpp'
            },
            scopes: {
                // Main service scopes
                GLOBAL_SCOPE_KEY: 'global',
                COC_SCOPE_KEY: 'cc',
                SMSC_SCOPE_KEY: 'smsc',
                // SMSC
                SMSC_INCOMING_MSISDN_SCOPE_KEY: 'incoming_msisdn',
                SMSC_INCOMING_IMSI_SCOPE_KEY: 'incoming_imsi',
                SMSC_INCOMING_MSC_SCOPE_KEY: 'incoming_msc',
                SMSC_OUTGOING_MSISDN_SCOPE_KEY: 'outgoing_msisdn',
                SMSC_OUTGOING_IMSI_SCOPE_KEY: 'outgoing_imsi',
                SMSC_OUTGOING_MSC_SCOPE_KEY: 'outgoing_msc',
                SMSC_OUTGOING_HLR_SCOPE_KEY: 'outgoing_hlr'
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
            getScreenings: function (promiseTracker) {
                var promise = ScreeningManagerStatsRestangular.one('screenings').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getScreeningsByServiceName: function (name, promiseTracker) {
                var promise = ScreeningManagerStatsRestangular.one('screenings/' + name).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getSubscribers: function (promiseTracker) {
                var promise = ScreeningManagerStatsRestangular.one('subscribers').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getConstraints: function (promiseTracker) {
                var promise = ScreeningManagerStatsRestangular.one('constraints').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getConstraintsByServiceName: function (name, promiseTracker) {
                var promise = ScreeningManagerStatsRestangular.one('constraints/' + name).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getScopes: function (promiseTracker) {
                var promise = ScreeningManagerStatsRestangular.one('scopes').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getScopeOrderings: function (promiseTracker) {
                var promise = ScreeningManagerRestangular.one(CHANNEL_TYPE + '/screeningmanager/ordering/scopes').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            addScopeOrdering: function (newOrdering, promiseTracker) {
                var promise = ScreeningManagerRestangular.all(CHANNEL_TYPE + '/screeningmanager/ordering/scopes').post(newOrdering);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getScopeOrdering: function (scope, promiseTracker) {
                var promise = ScreeningManagerRestangular.one(CHANNEL_TYPE + '/' + scope + '/ordering/scopes/' + scope).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise.then(function (response) {
                    var apiResponse = Restangular.stripRestangular(response);
                    $log.debug('Get Scope ordering. Response: ', apiResponse);
                    return apiResponse;
                });
            },
            getLimitConfiguration: function (promiseTracker) {
                var promise = ScreeningManagerRestangular.one(CHANNEL_TYPE + '/screeningmanager/limits/lists').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            setLimitConfiguration: function (limitConf, promiseTracker) {
                var promise = ScreeningManagerRestangular.all(CHANNEL_TYPE + '/screeningmanager/limits/lists').customPUT(limitConf);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getScreeningLists: function (msisdn, promiseTracker) {
                var promise = ScreeningManagerRestangular.one(CHANNEL_TYPE + '/screeningmanager/screenings/' + msisdn).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getScreeningListsByScope: function (msisdn, scopeKey, promiseTracker) {
                return this.getScreeningListsByScopeAndService(scopeKey, msisdn, scopeKey, promiseTracker);
            },
            getScreeningListsByScopeAndService: function (serviceName, scopeSubscriberKey, scopeKey, promiseTracker) {
                var promise = ScreeningManagerRestangular.one(CHANNEL_TYPE + '/' + serviceName + '/screenings/' + scopeSubscriberKey + '/' + scopeKey).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            deleteListItem: function (serviceName, scopeSubscriberKey, scopeKey, listKey, screenableEntryId) {
                var requestUri = CHANNEL_TYPE + '/' + serviceName + '/screenings/' + scopeSubscriberKey + '/' + scopeKey + '/' + listKey + '/' + screenableEntryId;
                var promise = ScreeningManagerRestangular.one(requestUri).remove();
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
                var promise = ScreeningManagerRestangular.all(requestUri).post(screeningRequest);
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
                var promise = ScreeningManagerRestangular.all(requestUri).customPUT(screeningModeRequest);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getAllowance: function (serviceName, scopeSubscriberKey, scopeKey, listKey) {
                var requestUri = CHANNEL_TYPE + '/' + serviceName + '/screenings/' + scopeSubscriberKey + '/' + scopeKey + '/allowance/' + listKey;

                var promise = ScreeningManagerRestangular.one(requestUri).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        };
    });

    // License Manager Services
    ApplicationServices.factory('LicenseManagerService', function ($log, LicenseManagerRestangular, UtilService) {
        return {
            getAllLicenses: function (promiseTracker) {
                var promise = LicenseManagerRestangular.one('licenses').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getLicense: function (name, promiseTracker) {
                var promise = LicenseManagerRestangular.one('licenses/' + name).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            setLicense: function (license, promiseTracker) {
                var promise = LicenseManagerRestangular.one('licenses/' + name).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getLicenseProducts: function (name, promiseTracker) {
                var promise = LicenseManagerRestangular.one('licenses/' + name + '/products').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            // License special days
            getLicenseSpecialDays: function (name, promiseTracker) {
                var promise = LicenseManagerRestangular.one('licenses/' + name + '/specialdays').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            addNewLicenseSpecialDay: function (name, dayStr, promiseTracker) {
                var dayJson = {
                    "day": dayStr
                };

                var promise = LicenseManagerRestangular.all('licenses/' + name + '/specialdays').post(dayJson);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            updateLicenseSpecialDay: function (name, oldDayStr, newDayStr, promiseTracker) {
                var newDayJson = {
                    "day": newDayStr
                };

                var promise = LicenseManagerRestangular.one('licenses/' + name + '/specialdays/' + oldDayStr).customPUT(newDayJson);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            deleteLicenseSpecialDay: function (name, dayStr, promiseTracker) {
                var promise = LicenseManagerRestangular.all('licenses/' + name + '/specialdays/' + dayStr).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            // License thresholds
            setLicenseThresholds: function (name, thresholds, promiseTracker) {
                var promise = LicenseManagerRestangular.one('licenses/' + name + '/threshold').customPUT(thresholds);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            setLicenseProductThresholds: function (name, thresholds, promiseTracker) {
                var promise = LicenseManagerRestangular.all('licenses/' + name + '/productlimits').post(thresholds);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getConsumptions: function (name, promiseTracker) {
                var promise = LicenseManagerRestangular.one('consumptions/' + name + '/summary').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getConsumptionsByQuery: function (name, query, promiseTracker) {
                var promise = LicenseManagerRestangular.one('consumptions/' + name + '/simple?' + query).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getCurrentConsumption: function (name, promiseTracker) {
                var promise = LicenseManagerRestangular.one('consumptions/' + name + '/current').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            }
        };
    });

    // Diagnostic Services
    ApplicationServices.factory('DiagnosticsService', function ($log, DiagnosticsRestangular, UtilService) {
        return {
            getAlarmsByQuery: function (query, promiseTracker) {
                var promise = DiagnosticsRestangular.all('alarm-read/_search').post(query);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getAlarmCountByQuery: function (query, promiseTracker) {
                var promise = DiagnosticsRestangular.all('alarm-read/_count').post(query);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            queryCPUStats: function (query, promiseTracker) {
                var promise = DiagnosticsRestangular.all('hoststats-read/cpustat/_search').post(query);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            queryRAMStats: function (query, promiseTracker) {
                var promise = DiagnosticsRestangular.all('hoststats-read/memstat/_search').post(query);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            }
        };
    });

    // Subscription Management Service
    ApplicationServices.factory('SubscriptionManagementService', function ($log, SubscriptionManagementRestangular, UtilService) {
        return {
            // Price Groups Methods
            getPriceGroups: function (getPriceQuotes) {
                var url = 'bre/price-groups' + (getPriceQuotes ? '?getPriceQuotes=true' : '');

                var promise = SubscriptionManagementRestangular.all(url).getList();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getPriceGroup: function (id) {
                var promise = SubscriptionManagementRestangular.one('bre/price-groups/' + id).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createPriceGroup: function (priceGroup) {
                var promise = SubscriptionManagementRestangular.all('bre/price-groups').post(priceGroup);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updatePriceGroup: function (priceGroup) {
                var promise = SubscriptionManagementRestangular.all('bre/price-groups').customPUT(priceGroup);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deletePriceGroup: function (id) {
                var promise = SubscriptionManagementRestangular.all('bre/price-groups/' + id).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Price Quotes of price groups
            getPriceQuotes: function (priceGroupId) {
                var promise = SubscriptionManagementRestangular.all('bre/price-groups/' + priceGroupId + '/price-quotes').getList();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getPriceQuoteByPriority: function (priceGroupId, priority) {
                var promise = SubscriptionManagementRestangular.one('bre/price-groups/' + priceGroupId + '/price-quotes/' + priority).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createPriceQuote: function (priceGroupId, priceQuote) {
                var promise = SubscriptionManagementRestangular.all('bre/price-groups/' + priceGroupId + '/price-quotes').post(priceQuote);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updatePriceQuoteByPriority: function (priceGroupId, priority, priceQuote) {
                var promise = SubscriptionManagementRestangular.all('bre/price-groups/' + priceGroupId + '/price-quotes/' + priority).customPUT(priceQuote);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deletePriceQuoteByPriority: function (priceGroupId, priority) {
                var promise = SubscriptionManagementRestangular.all('bre/price-groups/' + priceGroupId + '/price-quotes/' + priority).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Price Rules Methods
            getPriceRules: function () {
                var promise = SubscriptionManagementRestangular.all('bre/scripts').getList();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getPriceRule: function (id) {
                var promise = SubscriptionManagementRestangular.one('bre/scripts/' + id).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createPriceRule: function (priceRule) {
                var promise = SubscriptionManagementRestangular.all('bre/scripts').post(priceRule);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updatePriceRule: function (priceRule) {
                var promise = SubscriptionManagementRestangular.all('bre/scripts').customPUT(priceRule);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deletePriceRule: function (id) {
                var promise = SubscriptionManagementRestangular.all('bre/scripts/' + id).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        };
    });

    // Advertisement Configuration Service
    ApplicationServices.factory('AdvertisementConfigurationService', function ($log, AdvertisementConfigurationRestangular, UtilService) {
        return {
            // Ad Insertion methods
            getAdvertisements: function () {
                var promise = AdvertisementConfigurationRestangular.one('ad').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getAdvertisement: function (name) {
                var promise = AdvertisementConfigurationRestangular.one('ad/' + encodeURIComponent(name)).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createAdvertisement: function (advertisement) {
                var promise = AdvertisementConfigurationRestangular.all('ad').post(advertisement);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateAdvertisement: function (advertisement) {
                var promise = AdvertisementConfigurationRestangular.all('ad/' + encodeURIComponent(advertisement.name)).customPUT(advertisement);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteAdvertisement: function (name) {
                var promise = AdvertisementConfigurationRestangular.all('ad/' + encodeURIComponent(name)).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        }
    });

    // Chart Drawing Services
    ApplicationServices.factory('PlotService', function ($log, $filter, UtilService) {
        return {
            getLargeDataGroupByValue: function (dataArray, mainCount) {
                dataArray = $filter('orderBy')(dataArray, ['data'], true);

                var mainArray = [];
                if (dataArray) {
                    mainArray = dataArray.slice(0, mainCount);
                    if (dataArray.length > mainCount) {
                        var othersArray = dataArray.slice(mainCount, dataArray.length + 1);
                        var otherObject = {
                            label: 'Other',
                            data: 0
                        };
                        othersArray.forEach(function (item) {
                            otherObject.data += item.data;
                        });

                        if (otherObject.data > 0) {
                            mainArray.push(otherObject);
                        }
                    }
                }

                return mainArray;
            },
            drawPie: function (holderName, data, showAll, thresholdValue, labelThresholdValue) {
                if (!labelThresholdValue) {
                    labelThresholdValue = thresholdValue;
                }

                var options = {
                    series: {
                        pie: {
                            show: true,
                            innerRadius: 0,
                            stroke: {
                                width: 1
                            },
                            offset: {
                                top: 0,
                                left: 25
                            },
                            radius: 0.9,
                            label: {
                                show: true,
                                radius: 2 / 4,
                                threshold: (!_.isUndefined(labelThresholdValue) ? labelThresholdValue : 0.10),
                                formatter: function (label, series) {
                                    return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">' + Math.round(series.percent) + '%</div>';
                                },
                                background: {
                                    opacity: 0.8
                                }
                            }
                        }
                    },
                    legend: {
                        show: true,
                        position: 'nw',
                        threshold: (!_.isUndefined(thresholdValue) ? thresholdValue : 0.10),
                        labelFormatter: function (label, series) {
                            var labelToView = $filter('limitTo')(label, 15) + (label.length > 15 ? '...' : '');
                            var labelElmId = 'legendLabel' + _.uniqueId();
                            var labelElm = $('<span>', {'id': labelElmId}).html(labelToView);

                            var title = '<span>' + label + ': ' + Math.round(series.percent) + '%</span> <span>(' + $filter('number')(series.data[0][1]) + ')</span>'

                            $(holderName).delegate('#' + labelElmId, "mouseover", function () {
                                $('.flotTip').css({
                                    'left': $(this).offset().left,
                                    'top': $(this).offset().top + 18,
                                    'background-color': series.color,
                                    'color': '#FFF',
                                    'border': '1px solid #777777'
                                }).show().html(title)
                            });

                            $(holderName).delegate('#' + labelElmId, "mouseout", function () {
                                $('.flotTip').hide().html();
                            });

                            var labelHolderElm = $('<div>').append(labelElm);

                            return labelHolderElm.html();
                        }
                    },
                    tooltip: true,
                    tooltipOpts: {
                        onHover: function (flotItem, $tooltipEl) {
                            var percent = parseFloat(flotItem.series.percent).toFixed(0);
                            var rawvalue = $filter('number')(flotItem.series.data[0][1]);
                            var label = flotItem.series.label;

                            $tooltipEl.css('background-color', flotItem.series.color);
                            $tooltipEl.css('border', '1px solid #777777');
                            $tooltipEl.css('color', '#FFF');
                            $tooltipEl.html('<span>' + label + ': ' + percent + '%</span> <span>(' + rawvalue + ')</span>');
                        }
                    },
                    grid: {
                        hoverable: true
                    },
                    colors: mvpready_core.layoutColors,
                    hooks: {
                        bindEvents: function (plot, eventHolder) {
                            eventHolder.mouseleave(function (e) {
                                plot.unhighlight();

                                $('.flotTip').hide().html();
                            });
                        }
                    }
                };

                if (!showAll) {
                    options.series.pie.combine = {
                        color: '#999',
                        threshold: (!_.isUndefined(thresholdValue) ? thresholdValue : 0.10)
                    };
                }

                var holder = $(holderName);

                // Set colors to the data sets manually to avoid to see the default white color on the pie slices.
                _.each(data, function (dataEntry, index) {
                    dataEntry.color = mvpready_core.layoutColors[index % mvpready_core.layoutColors.length];
                });

                var plot;
                if (holder.length && data.length) {
                    plot = $.plot(holder, data, options);
                }
            },
            drawDonut: function (holderName, data, showAll) {
                var options = {
                    series: {
                        pie: {
                            show: true,
                            innerRadius: .4,
                            stroke: {
                                width: 4
                            },
                            radius: 0.85
                        }
                    },
                    legend: {
                        show: false
                    },
                    tooltip: true,
                    tooltipOpts: {
                        onHover: function (flotItem, $tooltipEl) {
                            var percent = parseFloat(flotItem.series.percent).toFixed(0);
                            var rawvalue = $filter('number')(flotItem.series.data[0][1]);
                            var label = flotItem.series.label;

                            $tooltipEl.css('background-color', flotItem.series.color);
                            $tooltipEl.css('border', '1px solid #777777');
                            $tooltipEl.css('color', '#FFF');
                            $tooltipEl.html('<span>' + label + ': ' + percent + '%</span> <span>(' + rawvalue + ')</span>');
                        }
                    },
                    grid: {
                        hoverable: true
                    },
                    colors: mvpready_core.layoutColors
                };

                if (!showAll) {
                    options.series.pie.combine = {
                        color: '#999',
                        threshold: (!_.isUndefined(thresholdValue) ? thresholdValue : 0.10)
                    };
                }

                // Set colors to the data sets manually to avoid to see the default white color on the pie slices.
                _.each(data, function (dataEntry, index) {
                    dataEntry.color = mvpready_core.layoutColors[index % mvpready_core.layoutColors.length];
                });

                var holder = $(holderName);

                var plot;
                if (holder.length && data.length) {
                    plot = $.plot(holder, data, options);
                }
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
            prepareMainEdrQueryPayload: function (filter, timestampFieldName, additionalFilterFields, termFilterJSON) {
                var startDate = filter.startDate,
                    endDate = filter.endDate,
                    queryString = filter.queryString,
                    quickSearchColumns = filter.quickSearchColumns,
                    sortFieldName = filter.sortFieldName,
                    sortOrder = filter.sortOrder;

                var mustFilterJSON = [];
                var shouldFilterJSON = [];

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
            // SMSC
            findSmscPermanentEdrs: function (filter, additionalFilterFields) {
                var index = 'elastic-search-adapter', type = 'main_edr';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'date', additionalFilterFields);

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
            getSmscPermanentCountByFilter: function (filter, additionalFilterFields, termFilterJSON) {
                var index = 'smsc-main-read', type = 'main_edr';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'date', additionalFilterFields, termFilterJSON);

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

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'date', additionalFilterFields);

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
            getSmscPermanentCountByFilterRemote: function (filter, additionalFilterFields, termFilterJSON) {
                var index = 'smsc-main-read', type = 'main_edr';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'date', additionalFilterFields, termFilterJSON);

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
            findSMSAntiSpamEdrs: function (filter, additionalFilterFields, termFilterJSON) {
                var index = 'elastic-search-adapter', type = 'sms-as';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'date', additionalFilterFields, termFilterJSON);

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

                return this.findSMSAntiSpamEdrs(filter, additionalFilterFields, termFilterJSON);
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
            findSMSAntiSpamEdrsRemote: function (filter, additionalFilterFields, termFilterJSON) {
                var index = 'elastic-search-adapter', type = 'sms-as';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'date', additionalFilterFields, termFilterJSON);

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

                return this.findSMSAntiSpamEdrsRemote(filter, additionalFilterFields, termFilterJSON);
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

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'eventTime', additionalFilterFields, termFilterJSON);

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

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'eventTime', additionalFilterFields, termFilterJSON);

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

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'eventTime', additionalFilterFields, termFilterJSON);

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

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'eventTime', additionalFilterFields, termFilterJSON);

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

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'eventTime', additionalFilterFields, termFilterJSON);

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

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'eventTime', additionalFilterFields, termFilterJSON);

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

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields, termFilterJSON);

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

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields);

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

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields);

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

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields);

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

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields, termFilterJSON);

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

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields);

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

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields);

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

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields);

                return findHistoryRecords(ESClientRemote, index, type, filter, bodyPayload);
            },
            // USSI history methods
            findUSSIGatewayCenterHistoryInitSessions: function (filter, additionalFilterFields) {
                var index = 'ussigw-main-read', type = null;
                var termFilterJSON = {
                    "must": [
                        {
                            "terms": {
                                "cdrType": [
                                    31, // MAP_BEGIN_USSR_IND_RECEIVED
                                    34, // MAP_BEGIN_USSN_IND_RECEIVED
                                    49  // SIP_INVITE_RECEIVED
                                ]
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

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            findUSSIGatewayCenterHistoryAll: function (ticket) {
                var index = 'ussigw-main-read', type = null;
                var filter = {
                    sortFieldName: 'timestamp',
                    sortOrder: '"asc"',
                    offset: 0,
                    limit: 1000
                };
                var additionalFilterFields = {ticket: ticket};

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            // USSI history methods remote
            findUSSIGatewayHistoryInitSessionsRemote: function (filter, additionalFilterFields) {
                var index = 'ussigw-main-read', type = null;
                var termFilterJSON = {
                    "must": [
                        {
                            "terms": {
                                "cdrType": [
                                    31, // MAP_BEGIN_USSR_IND_RECEIVED
                                    34, // MAP_BEGIN_USSN_IND_RECEIVED
                                    49  // SIP_INVITE_RECEIVED
                                ]
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

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(ESClientRemote, index, type, filter, bodyPayload);
            },
            findUSSIGatewayCenterHistoryRemote: function (ticket) {
                var index = 'ussigw-main-read', type = null;
                var filter = {
                    sortFieldName: 'timestamp',
                    sortOrder: '"asc"',
                    offset: 0,
                    limit: 1000
                };
                var additionalFilterFields = {ticket: ticket};

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields);

                return findHistoryRecords(ESClientRemote, index, type, filter, bodyPayload);
            },
            // SMSF history methods
            findSMSFCenterHistoryInitSessions: function (filter, additionalFilterFields) {
                var index = 'smsf-main-read', type = null;
                var termFilterJSON = {
                    "must": []
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

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            findSMSFCenterHistoryAll: function (ticket) {
                var index = 'smsf-main-read', type = null;
                var filter = {
                    sortFieldName: 'timestamp',
                    sortOrder: '"asc"',
                    offset: 0,
                    limit: 1000
                };
                var additionalFilterFields = {ticket: ticket};

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            // SMSF history methods remote
            findSMSFCenterHistoryInitSessionsRemote: function (filter, additionalFilterFields) {
                var index = 'smsf-main-read', type = null;
                var termFilterJSON = {
                    "must": []
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

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(ESClientRemote, index, type, filter, bodyPayload);
            },
            findSMSFCenterHistoryAllRemote: function (ticket) {
                var index = 'smsf-main-read', type = null;
                var filter = {
                    sortFieldName: 'timestamp',
                    sortOrder: '"asc"',
                    offset: 0,
                    limit: 1000
                };
                var additionalFilterFields = {ticket: ticket};

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields);

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

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields, termFilterJSON);

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

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields, termFilterJSON);

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

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            // Collect Call Remote
            findCCHistoryRemote: function (filter, additionalFilterFields) {
                var index = 'payforme-read', type = 'cc';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields);

                return findHistoryRecords(ESClientRemote, index, type, filter, bodyPayload);
            },
            // MCA
            findMCAHistory: function (filter, additionalFilterFields) {
                var index = 'mcn-read', type = 'mcn';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'edrTimestamp', additionalFilterFields);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            // MCA Remote
            findMCAHistoryRemote: function (filter, additionalFilterFields) {
                var index = 'mcn-read', type = 'mcn';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'edrTimestamp', additionalFilterFields);

                return findHistoryRecords(ESClientRemote, index, type, filter, bodyPayload);
            },
            // Poke Call
            findPokeCallHistory: function (filter, additionalFilterFields) {
                var index = 'payforme-read', type = 'poke';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            // Poke Call Remote
            findPokeCallHistoryRemote: function (filter, additionalFilterFields) {
                var index = 'payforme-read', type = 'poke';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields);

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

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields, termFilterJSON);

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

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields, termFilterJSON);

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

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            // Alarm Logs
            findAlarmLogs: function (filter, additionalFilterFields) {
                var index = 'alarm-read', type = 'alarm';

                var termFilterJSON = {
                    "must": []
                };

                var filterType = filter.type;
                var filterSeverity = filter.severity;

                if (filterType !== 'ALL') {
                    termFilterJSON.must.push({
                        "term": {
                            "type": filterType
                        }
                    });
                }

                if (filterSeverity !== 'ALL') {
                    termFilterJSON.must.push({
                        "term": {
                            "severity": filterSeverity
                        }
                    });
                }

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields, termFilterJSON);

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

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields, termFilterJSON);

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

    ApplicationServices.factory('PentahoApiService', function ($q, $log, $filter, $locale, PentahoApiRestangular, UtilService, DateTimeConstants, DAYS_OF_WEEK) {
        var simplePostToJob = function (jobId, operationKey) {
            var bodyPayload = {
                "jobId": jobId
            };

            var promise = PentahoApiRestangular.all('scheduler/' + operationKey).post(bodyPayload);
            UtilService.addPromiseToTracker(promise);

            return promise;
        };

        var isAuthenticated = function () {
            var promise = PentahoApiRestangular.one('mantle/isAuthenticated').get();
            UtilService.addPromiseToTracker(promise);

            var deferred = $q.defer();
            promise.then(function (response) {
                deferred.resolve();
            }, function (response) {
                deferred.resolve();
            });

            UtilService.addPromiseToTracker(deferred.promise);

            return deferred.promise;
        };

        return {
            USERNAME: 'vcp',
            OUTPUT_FILE: '/home/scheduled',
            jobTriggerHumanReadable: function (jobTrigger) {
                var triggerHumanReadable;

                var startDateStr = $filter('date')(jobTrigger.startTime, 'HH:mm:ss', DateTimeConstants.OFFSET);

                if (jobTrigger['@type'] === 'complexJobTrigger') {
                    if (jobTrigger.uiPassParam === 'CRON') {
                        triggerHumanReadable = 'CRON: ' + jobTrigger.cronString;
                    } else {
                        // Prepare common qualifiers and recurrences
                        var dayOfWeekStr, qualifier;
                        if (jobTrigger.dayOfWeekRecurrences) {
                            if (jobTrigger.dayOfWeekRecurrences.qualifiedDayOfWeek) {
                                var dayOfWeek = jobTrigger.dayOfWeekRecurrences.qualifiedDayOfWeek.dayOfWeek;
                                var day = _.findWhere(DAYS_OF_WEEK, {shortKey: dayOfWeek});
                                dayOfWeekStr = day.text;

                                qualifier = jobTrigger.dayOfWeekRecurrences.qualifiedDayOfWeek.qualifier.toLowerCase();
                            } else if (jobTrigger.dayOfWeekRecurrences.recurrenceList) {
                                var dayStrArr = [];
                                _.each(jobTrigger.dayOfWeekRecurrences.recurrenceList.values, function (value) {
                                    var day = _.findWhere(DAYS_OF_WEEK, {id: Number(value)});
                                    dayStrArr.push(day.text);
                                });

                                dayOfWeekStr = dayStrArr.join(', ');
                            }
                        }
                        var dayNumberStr;
                        if (jobTrigger.dayOfMonthRecurrences) {
                            dayNumberStr = jobTrigger.dayOfMonthRecurrences.recurrenceList.values[0];
                        }
                        var monthOfYearStr;
                        if (jobTrigger.monthlyRecurrences) {
                            var monthId = jobTrigger.monthlyRecurrences.recurrenceList.values[0];
                            monthOfYearStr = $locale.DATETIME_FORMATS.MONTH[Number(monthId) - 1];
                        }

                        // Check job types and compile the words.
                        if (jobTrigger.uiPassParam === 'DAILY') {
                            if (jobTrigger.dayOfWeekRecurrences) {
                                triggerHumanReadable = 'Every weekday at ' + startDateStr;
                            }
                        } else if (jobTrigger.uiPassParam === 'WEEKLY') {
                            if (jobTrigger.dayOfWeekRecurrences) {
                                triggerHumanReadable = 'Every ' + dayOfWeekStr + ' at ' + startDateStr;
                            }
                        } else if (jobTrigger.uiPassParam === 'MONTHLY') {
                            if (jobTrigger.dayOfMonthRecurrences) {
                                triggerHumanReadable = 'Day ' + dayNumberStr + ' of every month at ' + startDateStr;
                            } else {
                                triggerHumanReadable = 'The ' + qualifier + ' ' + dayOfWeekStr + ' of every month at ' + startDateStr;
                            }
                        } else if (jobTrigger.uiPassParam === 'YEARLY') {
                            if (jobTrigger.dayOfMonthRecurrences) {
                                triggerHumanReadable = 'Every ' + monthOfYearStr + ' ' + dayNumberStr + ' at ' + startDateStr;
                            } else {
                                triggerHumanReadable = 'The ' + qualifier + ' ' + dayOfWeekStr + ' of ' + monthOfYearStr + ' at ' + startDateStr;
                            }
                        }
                    }
                } else {
                    // jobTrigger.repeatInterval value is a second value.
                    if (jobTrigger.uiPassParam === 'RUN_ONCE') {
                        triggerHumanReadable = 'Run Once';
                    } else if (jobTrigger.uiPassParam === 'SECONDS') {
                        triggerHumanReadable = 'Every ' + jobTrigger.repeatInterval + ' seconds'
                    } else if (jobTrigger.uiPassParam === 'MINUTES') {
                        var minutes = (Number(jobTrigger.repeatInterval) / 60);
                        triggerHumanReadable = 'Every ' + minutes + ' minutes'
                    } else if (jobTrigger.uiPassParam === 'HOURS') {
                        var hours = (Number(jobTrigger.repeatInterval) / 60 / 60);
                        triggerHumanReadable = 'Every ' + hours + ' hours'
                    } else if (jobTrigger.uiPassParam === 'DAILY') {
                        var days = (Number(jobTrigger.repeatInterval) / 24 / 60 / 60);
                        triggerHumanReadable = 'Every ' + days + ' days'
                    }

                    triggerHumanReadable = triggerHumanReadable + ' at ' + startDateStr;
                }

                if (_.isEmpty(triggerHumanReadable)) {
                    return '-';
                } else {
                    return triggerHumanReadable;
                }
            },
            // Restful API Methods
            getJobs: function () {
                return isAuthenticated().then(function (response) {
                    var promise = PentahoApiRestangular.one('scheduler/getJobs').get();
                    UtilService.addPromiseToTracker(promise);

                    return promise;
                });
            },
            pauseJob: function (jobId) {
                return isAuthenticated().then(function (response) {
                    return simplePostToJob(jobId, 'pauseJob');
                });
            },
            resumeJob: function (jobId) {
                return isAuthenticated().then(function (response) {
                    return simplePostToJob(jobId, 'resumeJob');
                });
            },
            removeJob: function (jobId) {
                var bodyPayload = {
                    "jobId": jobId
                };

                return isAuthenticated().then(function (response) {
                    var promise = PentahoApiRestangular.one('scheduler/removeJob').customOperation('remove', null, {}, {'Content-Type': 'application/json'}, bodyPayload);
                    UtilService.addPromiseToTracker(promise);

                    return promise;
                });
            },
            createJob: function (payload) {
                return isAuthenticated().then(function (response) {
                    var promise = PentahoApiRestangular.all('scheduler/job').post(payload);
                    UtilService.addPromiseToTracker(promise);

                    return promise;
                });
            }
        };
    });

})();
