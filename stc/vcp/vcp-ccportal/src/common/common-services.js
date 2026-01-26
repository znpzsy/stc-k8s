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
            SESSION_KEY: '_sa_stc_vcp_c_sk',
            USERNAME_KEY: '_sa_stc_vcp_c_un',
            SITE_INFORMATION_KEY: '_sa_stc_vcp_c_si',
            MSISDN_KEY: '_sa_stc_vcp_c_mk',
            LATEST_STATE: '_sa_stc_vcp_c_lst',
            USER_RIGHTS: '_sa_stc_vcp_c_ur',
            CMPF_SUBSCRIBER_KEY: '_sa_stc_vcp_c_csk',
            SUBSCRIBER_PROFILE_KEY: '_sa_stc_vcp_c_spk',
            USER_ORGANIZATION_KEY: '_sa_stc_vcp_c_uok',
            USER_ORGANIZATION_ID_KEY: '_sa_stc_vcp_c_uoik',
            USER_ORGANIZATION_NAME_KEY: '_sa_stc_vcp_c_onk',
            USER_ADMIN_KEY: '_sa_stc_vcp_c_uak',
            USER_ACCOUNT_KEY: '_sa_stc_vcp_c_uak',
            // Created with this command: node -e "console.log(require('crypto').randomBytes(32).toString('hex'));"
            FRANZ_LISZT: "602beb2435b48b18b54030ac1a8847c29f2a67d1c8a2cae31a12101d2ffc1943",
            JOHANN_SEBASTIAN_BACH: "bb236d7b16001a6a2d8e7c20d20369242098e349b2b5c82e75194aeed6fd4427",
            Validators: {
                Msisdn: /^[0-9]{0,15}$/,
                ValidSubscriberMsisdn: /^(966){1}[0-9]{8,15}$/,
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
            },
            // Redirect to RBT Portal
            // Secret Key Derivation for AES-256
            generateRandomHex: function (len) {
                var random = CryptoJS.lib.WordArray.random(len);
                return CryptoJS.enc.Hex.stringify(random);
            },
            getRandomString: function (len) {
                var allowed = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789~!@#$%^&*()_+";
                return allowed.split("").sort(function () { return Math.random() - Math.random(); }).join("").substr(0, len || 16);
            },
            deriveKey: function (secretKey, salt) {
                return CryptoJS.PBKDF2(secretKey, salt, {
                    keySize: 256 / 32, // keySize is in words, 1 word = 4 bytes, so divide by 32 to get keySize in bytes
                    iterations: 1000
                });
            },
            encryptAES128: function (plainText, secretKey, iv) {
                // Don't forget to parse as UTF-8
                secretKey = CryptoJS.enc.Utf8.parse(secretKey);
                iv = CryptoJS.enc.Utf8.parse(iv);

                var ciphertext = CryptoJS.AES.encrypt(plainText, secretKey, {
                    iv: iv,
                    padding: CryptoJS.pad.Pkcs7,
                    mode: CryptoJS.mode.CBC
                }).toString();
                return ciphertext;
            },
            decryptAES128: function (encryptedText, secretKey, iv) {
                // parse as UTF-8 !!!
                secretKey = CryptoJS.enc.Utf8.parse(secretKey);
                iv = CryptoJS.enc.Utf8.parse(iv);

                var bytes = CryptoJS.AES.decrypt(encryptedText, secretKey, {
                    iv: iv,
                    padding: CryptoJS.pad.Pkcs7,
                    mode: CryptoJS.mode.CBC,
                });
                var originalText = bytes.toString(CryptoJS.enc.Utf8);
                return originalText;
            },
            encryptAES256: function (plainText, secretKey, salt, iv) {

                iv = CryptoJS.enc.Utf8.parse(iv);
                secretKey = CryptoJS.enc.Utf8.parse(secretKey);

                var key = CryptoJS.PBKDF2(secretKey, salt, { keySize: 256 / 32, iterations: 1000 });
                var encryptedText = CryptoJS.AES.encrypt(plainText, key, { iv: iv });
                //return iv.concat(encryptedText.ciphertext).toString(CryptoJS.enc.Base64);
                return (encryptedText.ciphertext).toString(CryptoJS.enc.Base64);
            },
            decryptAES256: function (encryptedText, secretKey, salt, iv) {

                iv = CryptoJS.enc.Utf8.parse(iv);
                secretKey = CryptoJS.enc.Utf8.parse(secretKey);

                var key = CryptoJS.PBKDF2(secretKey, salt, { keySize: 256 / 32, iterations: 1000 });
                var rawData = CryptoJS.enc.Base64.parse(encryptedText);
                //var iv = CryptoJS.lib.WordArray.create(rawData.words.slice(0, 4));
                //var ciphertext = CryptoJS.lib.WordArray.create(rawData.words.slice(4));
                var decryptedText = CryptoJS.AES.decrypt({ ciphertext: rawData }, key, { iv: iv });
                return decryptedText.toString(CryptoJS.enc.Utf8);

                // //var decryptedText = CryptoJS.AES.decrypt({ ciphertext: CryptoJS.enc.Base64.parse(encryptedText) }, key, {
                // var decryptedText = CryptoJS.AES.decrypt(CryptoJS.enc.Base64.parse(encryptedText), key, {
                //     iv: iv,
                //     mode: CryptoJS.mode.CBC,
                //     padding: CryptoJS.pad.Pkcs7,
                //     //hasher: CryptoJS.algo.SHA256 // Use HMAC SHA-256 as the PRF
                // });
                // return decryptedText.toString(CryptoJS.enc.Utf8);


            },
            getRedirectUrl: function(authPayload, RbtPortalUri){
                var urlParams = btoa(JSON.stringify(authPayload));
                // Construct the URL with encrypted data
                var url = RbtPortalUri + '?data=' + encodeURIComponent(urlParams);

                return url;
            },
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
                UtilService.removeFromSessionStore(UtilService.USER_ACCOUNT_KEY);
            },
            sessionInvalidate: function () {
                delete $http.defaults.headers.common.Authorization;

                this.cleanValues();
            },
            // Check if the subscriber has a MawjoodExtraSubscription
            hasMawjoodExtraSubscription: function () {
                var subscriberProfile = UtilService.getFromSessionStore(UtilService.SUBSCRIBER_PROFILE_KEY);
                var isMawjoodExtraSubscriber = false;

                if (subscriberProfile.subscriptions && subscriberProfile.subscriptions.length > 0) {
                    var mawjoodExtraOffer = _.find(subscriberProfile.subscriptions, function(subscription) {
                        return subscription.offerName === 'MawjoodExtra';
                    });

                    if (mawjoodExtraOffer) {
                        isMawjoodExtraSubscriber = true;
                    }
                }

                return isMawjoodExtraSubscriber;
            }
        };
    });



    // Server Configuration and Information Services
    ApplicationServices.factory('ServerConfigurationService', function ($log, $q, ServerInformationRestangular, ServerConfigurationRestangular,UtilService) {
        return {
            // The methods which gets data from the free zone.
            getSiteInformation: function (promiseTracker) {
                var promise = ServerInformationRestangular.one('site.json?' + UtilService.getCurrentNanoTime()).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            // The methods which gets data from the forbidden zone.
            getAndUpdateServerConfiguration: function (promiseTracker) {
                $log.debug( "getAndUpdateServerConfiguration"    );
                var deferred = $q.defer();

                ServerConfigurationRestangular.one('server.json?' + UtilService.getCurrentNanoTime()).get().then(function (response) {
                    UtilService.putToSessionStore(UtilService.SITE_CONFIGURATION_KEY, response);
                    deferred.resolve(response);
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

    // SSM Services
    ApplicationServices.factory('SSMSubscribersService', function ($log, $q, $translate, notification, UtilService, SSMSubscribersRestangular, SSMSubscriptionsRestangular, CSSMSubscriptionsRestangular) {
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

                var promise = SSMSubscribersRestangular.one('/' + msisdn).get();
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
                    if (response && response.data && response.data.errorCode == "2" && response.data.message.endsWith("not found")) {
                        $log.debug('Subscriber not found with the msisdn: ', msisdn);
                        $log.debug('Resuming for non-provisioned STC subscriber');
                        var nonProvisionedMsisdn = {
                            msisdn: msisdn,
                            subscriptions: [],
                            attributes: []
                        };
                        var subscriberProfile = _self.prepareSubscriberProfile(nonProvisionedMsisdn);
                        $log.debug('Prepared subscriber profile for the msisdn (non-provisioned): ', msisdn, ', SubscriberProfile: ', subscriberProfile);

                        // Here is writing application styled json object to the current session
                        UtilService.putToSessionStore(UtilService.SUBSCRIBER_PROFILE_KEY, subscriberProfile);
                        // Store msisdn on the session.
                        UtilService.putToSessionStore(UtilService.MSISDN_KEY, msisdn);
                        deferredFindSubscriber.resolve(subscriberProfile);
                    } else {
                        deferredFindSubscriber.reject(response);
                    }
                });

                UtilService.addPromiseToTracker(deferredFindSubscriber.promise);

                return deferredFindSubscriber.promise;
            },
            updateSubscriber: function (subscriber) {
                var promise = SSMSubscribersRestangular.all('').customPUT(subscriber);

                UtilService.addPromiseToTracker(promise, undefined);

                return promise;
            },
            // Subscription methods
            createSubscription: function (subscription) {
                var promise = SSMSubscriptionsRestangular.all('/subscriptions/offer/').post(subscription);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateSubscription: function (state) {
                var promise = SSMSubscriptionsRestangular.all('/subscriptions/offer/').customPUT(state);

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
            },
            // Subscription Details - (Primarily used by MCN)
            getMCNSubscriptionDetailByMsisdn: function () {
                var msisdn = UtilService.getFromSessionStore(UtilService.MSISDN_KEY);
                var promise = SSMSubscriptionsRestangular.one('/subscriptions/offer/' + msisdn + '?filterInactive=true&offerName=MawjoodExtra').get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
        }
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
    ApplicationServices.factory('CMPFService', function ($log, $q, $filter, UtilService, CMPFAuthRestangular, CMPFRestangular, DEFAULT_REST_QUERY_LIMIT, CURRENCY, BATCH_SIZE) {
        return {
            DEFAULT_ORGANIZATION_NAME: "STC",
            // User related profiles
            USER_PROFILE_NAME: 'UserProfile',
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
            // Password Reset
            requestPasswordReset: function (username) {
                var payload = {
                    "username": username
                };

                var promise = CMPFAuthRestangular.all('authenticate/resetpassword').post(payload);
                UtilService.addPromiseToTracker(promise);

                return promise;
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

                _self.getServicesCustom(0, BATCH_SIZE, withchildren, withprofiles, resultProfileDefNames, profileDefName, nameValues).then(function (firstResponse) {
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
            getServicesCustom: function (offset, limit, withchildren, withprofiles, resultProfileDefNames, profileDefName, nameValues) {
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

            // DSP Offers
            getAllOffers: function (withchildren, withorganization, withprofiles, state, resultProfileDefNames, name) {
                var _self = this;
                var deferred = $q.defer();

                _self.getOffersCustom(0, BATCH_SIZE, withchildren, withorganization, withprofiles, state, resultProfileDefNames, name).then(function (firstResponse) {
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
            getOffersCustom: function (offset, limit, withchildren, withorganization, withprofiles, state, resultProfileDefNames, name) {
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
            getOffersByServiceName: function (offset, limit, serviceName) {
                var prom = CMPFRestangular.one('offers?withchildren=true&offset=' + offset + '&limit=' + limit + '&serviceName=' + serviceName).get();
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
            getUserAccount: function (id, withProfile, promiseTracker) {
                var url = 'useraccounts/' + id + '?withchildren=true';
                if (withProfile) {
                    url += '&withprofiles=true';
                }

                var prom = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(prom, promiseTracker);
                return prom;
            },
            updateUserAccount: function (account) {
                var prom = CMPFRestangular.all('useraccounts/' + account.id).customPUT(account);
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            getUserAccountRights: function (id) {
                var promise = CMPFRestangular.one('useraccounts/' + id + '/rights').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getUserAccountGroups: function (userId, withchildren, withprofiles) {
                var promise = CMPFRestangular.one('useraccounts/' + userId + '/usergroups?withchildren=' + withchildren + '&withprofiles=' + withprofiles).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Profile operations
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
                MMSC_SCOPE_KEY: 'mmsc', // mms center
                SMSC_SCOPE_KEY: 'smsc', // sms center
                ICS_SCOPE_KEY: 'ics', // intelligent call screening
                CMB_SCOPE_KEY: 'cmb', // call me back
                COC_SCOPE_KEY: 'cc', // collect call
                POKE_CALL_SCOPE_KEY: 'poke', // poke call
                COLLECTSMS_SCOPE_KEY: 'collectsms', // collect sms
                MCA_SCOPE_KEY: 'mca', // missed call alert
                PSMS_SCOPE_KEY: 'psms', // personalized sms
                PMMS_SCOPE_KEY: 'pmms', // personalized mms
                VM_SCOPE_KEY: 'vm' // voice mail
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

    // SMS Anti-Spam Services
    ApplicationServices.factory('SMSAntiSpamConfigService', function ($log, $q, $timeout, SMSAntiSpamConfigRestangular, UtilService) {
        return {
            getDashboard: function (promiseTracker) {
                var promise = SMSAntiSpamConfigRestangular.one('/dashboard').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getDecryptedMessageContent: function (encryptedList) {
                var promise = SMSAntiSpamConfigRestangular.all('/content-decryption/decode').post(encryptedList);
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        };
    });

    // MMSC Services
    ApplicationServices.factory('MmscTroubleshootingService', function ($log, MmscTroubleshootingRestangular, UtilService) {
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
            'X-Channel': 'CC',
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
            },
            authenticate: function (msisdn) {
                var promise = RBTSCGatewayRestangular.one('authenticate').get(null, _.extend({
                    'X-Msisdn': msisdn,
                    'X-Portal': 'CC-Portal',
                    'X-Language': 'EN'
                }, headers));
                UtilService.addPromiseToTracker(promise);

                return promise;

            }
        }
    });

    ApplicationServices.factory('RBTBackendService', function ($q, $log, $translate, notification, RBTBackendRestangular, UtilService, SessionService) {
        var username = SessionService.getUsername();
        var msisdn = SessionService.getMsisdn();
        var headers = {
            'X-Channel': 'CC', //'RBTPortal','OTHER',//
            'X-Username': username,
            'X-Msisdn': msisdn,
            'X-Language': 'EN'
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
            // Authentication to RBT Backend
            getToken: function () {
                var promise = RBTBackendRestangular.all('cc/token').customGET(null, null, headers);
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        }
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
                var promise = VMProvisioningRestangular.one('messageBoxes/' + msisdn + '?type=vm').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateServiceSubscriberPreferences: function (msisdn, subscriberPreferences) {
                var promise = VMProvisioningRestangular.all('messageBoxes/' + msisdn + '?type=vm').customPUT(subscriberPreferences);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getAllMessages: function (msisdn) {
                var promise = VMProvisioningRestangular.one('messageBoxes/' + msisdn + '/messages' + '?type=vm').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateMessageWithId: function (msisdn, messageId, messagePreferences) {
                var promise = VMProvisioningRestangular.all('messageBoxes/' + msisdn + '/messages/' + messageId + '?type=vm').customPUT(messagePreferences);
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        };
    });


    // Voice SMS Services
    ApplicationServices.factory('VSMSConfigurationService', function ($log, $q, VSMSConfigurationRestangular, UtilService) {
        return {
            // Subscriber Profiles
            getSubscriberProfiles: function (promiseTracker) {
                var deferred = $q.defer();

                CallCompletionConfigurationRestangular.one('/cos-profiles').get().then(function (response) {
                    var subscriberProfiles = response;

                    subscriberProfiles = _.filter(subscriberProfiles, function (subscriberProfile) {
                        return (subscriberProfile.cosName === 'Temporary');
                    });

                    deferred.resolve(subscriberProfiles);
                }, function (response) {
                    deferred.reject(response);
                });

                UtilService.addPromiseToTracker(deferred.promise, promiseTracker);

                return deferred.promise;
            }
        };
    });

    ApplicationServices.factory('VSMSProvisioningService', function ($log, VSMSProvisioningRestangular, UtilService) {
        return {
            SERVICE_NAME: 'VoiceSMS',
            getServiceSubscriberPreferences: function (msisdn) {
                var promise = VSMSProvisioningRestangular.one('messageBoxes/' + msisdn + '?type=vsms').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateServiceSubscriberPreferences: function (msisdn, subscriberPreferences) {
                var promise = VSMSProvisioningRestangular.all('messageBoxes/' + msisdn + '?type=vsms').customPUT(subscriberPreferences);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getAllMessages: function (msisdn) {
                var promise = VSMSProvisioningRestangular.one('messageBoxes/' + msisdn + '/messages' + '?type=vsms').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateMessageWithId: function (msisdn, messageId, messagePreferences) {
                var promise = VSMSProvisioningRestangular.all('messageBoxes/' + msisdn + '/messages/' + messageId + '?type=vsms').customPUT(messagePreferences);
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        };
    });

    // Pay for Me Services
    ApplicationServices.factory('P4MService', function ($log, P4MRestangular, UtilService) {
        var CHANNEL_TYPE = 'CC';

        var updateRequestLimit = function (method, msisdn, requestLimit) {
            var promise = P4MRestangular.all(method + '/' + msisdn).customPUT(requestLimit);
            UtilService.addPromiseToTracker(promise);

            return promise;
        };

        var getRequestLimit = function (method, msisdn) {
            var promise = P4MRestangular.one(method + '/' + msisdn).get();
            UtilService.addPromiseToTracker(promise);

            return promise;
        };

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
            },
        };
    });

    // General Elastic Search Services
    ApplicationServices.factory('GeneralESService', function ($log, $filter, UtilService, SessionService, ServerConfigurationService, ESClient, DateTimeConstants,
                                                              SmscESClient, SmscESAdapterClient, SMSAntiSpamESClient, SMSAntiSpamESAdapterClient, SmsfESClient,
                                                              ChargingGwESAdapterClient, MessagingGwESAdapterClient, 
                                                              RbtESClient, SsmESClient) {
        var requestTimeout = 60000;

        var findESRemoteEndPoint = function (){
            var serverConfiguration = ServerConfigurationService.getServerConfiguration();
            return  angular.copy(serverConfiguration.ESRemoteEndPoint);
        }
        var findHistoryRecords = function (esClient, index, type, filter, payload, isAdapterClient) {
            // The range filters for using navigation
            var offset = filter.offset,
                limit = filter.limit;

            var url = '/' + index

            if (type) {
                // Do NOT remove type in this method, adapter clients require this.
                url = url + '/' + type;
            }

            if(!isAdapterClient){

                var ESRemoteEndPoint = findESRemoteEndPoint();
                if (!_.isUndefined(ESRemoteEndPoint)) {
                    // ES8 Cross Cluster Search
                    url = url + ',' + ESRemoteEndPoint + ':' + index
                }

            }

            url = url +  '/_search?from=' + offset + '&size=' + limit;

            var esQueryPromise = esClient.all(url).post(payload);

            UtilService.addPromiseToTracker(esQueryPromise);

            return esQueryPromise;
        };

        var getCount = function (esClient, index, type, payload) {
            var url = '/' + index;
            if (type) {
                // Remove the type parameter because the new version of ES does not need it.
                //url = url + '/' + type;
            }
            url = url + '/_count';

            var esQueryPromise = esClient.all(url).post(payload);

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
                var index = 'ssm',  type = null; //type = 'ssm';

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
                var index = 'ssm', type = null; //type = 'ssm';
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

                return findHistoryRecords(SmscESAdapterClient, index, type, filter, bodyPayload, true);
            },
            findSmscHistoryEdrs: function (cdrKey) {
                var index = 'smsc-history', type = null; //type = 'history_edr';

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
                var index = 'smsc-main', type = null; //type = 'main_edr';

                var beginDate = moment(scTimestamp).subtract(2, 'hours').utcOffset(DateTimeConstants.OFFSET).format('YYYY-MM-DDTHH:mm:ss.SSSZZ');
                var endDate = moment(scTimestamp).add(2, 'hours').utcOffset(DateTimeConstants.OFFSET).format('YYYY-MM-DDTHH:mm:ss.SSSZZ');

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
                var index = 'smsc-main', type = null; //type = 'main_edr';

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
            // SMS AntiSpam
            findSMSAntiSpamEdrs: function (filter, additionalFilterFields, termFilterJson) {
                var index = 'elastic-search-adapter', type = 'sms-as';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['origMsisdn', 'destMsisdn'], 'date', additionalFilterFields, termFilterJson);

                return findHistoryRecords(SMSAntiSpamESAdapterClient, index, type, filter, bodyPayload, true);
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
                // var index = 'sms-as-read', type = 'sms-as';
                var index = 'sms-as', type = null;

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
            findSMSAntiSpamEdrsWithIdFilters: function(bodyPayload){
                var index = 'sms-as', type = null; // type = 'sms-as';

                var filter = {offset: 0, limit: 1000};

                return findHistoryRecords(SMSAntiSpamESClient, index, type, filter, bodyPayload);

            },
            findSMSAntiSpamMessageParts: function (origMsisdn, destMsisdn, opPartRef, timestamp) {
                var index = 'sms-as', type = null; // type = 'sms-as';

                var beginDate = moment(timestamp).subtract(2, 'hours').utcOffset(DateTimeConstants.OFFSET).format('YYYY-MM-DDTHH:mm:ss.SSSZZ');
                var endDate = moment(timestamp).add(2, 'hours').utcOffset(DateTimeConstants.OFFSET).format('YYYY-MM-DDTHH:mm:ss.SSSZZ');

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

                var filter = {offset: 0, limit: 1000};

                return findHistoryRecords(SMSAntiSpamESClient, index, type, filter, bodyPayload);
            },
            findSMSAntiSpamSinglePartMessageContentEdrs: function (cdrKey) {
                var promise = SMSAntiSpamESAdapterClient.one('/elastic-search-adapter/sms-as/getMessageContent/' + cdrKey).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            findSMSAntiSpamMultiPartMessageContentEdrs: function (origMsisdn, destMsisdn, opPartRef, timestamp) {
                var payload = {
                    "origMsisdn": origMsisdn,
                    "destMsisdn": destMsisdn,
                    "opPartRef": opPartRef,
                    "date": timestamp
                };
                var promise = SMSAntiSpamESAdapterClient.all('/elastic-search-adapter/sms-as/getMessageContentsWithConcatInfo').post(payload);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // MMSC
            findMmscPermanentEdrs: function (filter, additionalFilterFields) {
                var index = 'mmsc-main', type = null; //type = 'main_edr';

                // var termFilterJSON = {
                //     "must_not": [
                //         {
                //             "terms": {
                //                 "finalStatus": [0, 7]
                //             }
                //         }
                //     ]
                // };

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['sender.address', 'recipient.address'], 'eventTime', additionalFilterFields);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            findMmscTransientEdrs: function (filter, additionalFilterFields) {
                var index = 'mmsc-buffered', type = null; //type = 'main_edr';

                // var termFilterJSON = {
                //     "must": [
                //         {
                //             "terms": {
                //                 "finalStatus": [0, 7]
                //             }
                //         }
                //     ]
                // };

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['sender.address', 'recipient.address'], 'eventTime', additionalFilterFields);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            findMmscHistoryEdrs: function (messageId, destAddress) {
                var index = 'mmsc-history', type = null; //type = 'history_edr';

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
                                    "match_phrase": {
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
            getMmscRecordCountByFilter: function (filter, additionalFilterFields, isPermanent, termFilterJSON) {
                var index = isPermanent ? 'mmsc-main' : 'mmsc-buffered', type = null; //type = 'main_edr';

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
                var isPermanent = true;

                return this.getMmscRecordCountByFilter(filter, additionalFilterFields, isPermanent, termFilterJSON);
            },
            getMmscUndeliveredCount: function (filter, additionalFilterFields) {
                var termFilterJSON = {
                    "must": [
                        {
                            "terms": {
                                "finalStatus": [2, 3, 4, 5, 8]
                            }
                        }
                    ]
                };
                var isPermanent = true;

                return this.getMmscRecordCountByFilter(filter, additionalFilterFields, isPermanent, termFilterJSON);
            },
            getMmscPermanentCount: function (filter, additionalFilterFields) {
                // var termFilterJSON = {
                //     "must_not": [
                //         {
                //             "terms": {
                //                 "finalStatus": [0, 7]
                //             }
                //         }
                //     ]
                // };

                var isPermanent = true;

                return this.getMmscRecordCountByFilter(filter, additionalFilterFields, isPermanent);
            },
            getMmscTransientCount: function (filter, additionalFilterFields) {
                // var termFilterJSON = {
                //     "must": [
                //         {
                //             "terms": {
                //                 "finalStatus": [0, 7]
                //             }
                //         }
                //     ]
                // };

                var isPermanent = false;

                return this.getMmscRecordCountByFilter(filter, additionalFilterFields, isPermanent);
            },
            // USC history methods
            findUSSDServiceCenterHistoryInitSessions: function (filter, additionalFilterFields) {
                var index = 'ussdbrowser-main', type = null;  //type = 'cc';
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
                var index = 'ussdbrowser-main', type = null;  //type = 'cc';
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
                var index = 'ussdbrowser-detail', type = 'brw_detail';
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
                var index = 'ussdbrowser-detail', type = 'brw_detail';
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
            // USSI history methods
            findUSSIGatewayCenterHistoryInitSessions: function (filter, additionalFilterFields) {
                var index = 'ussigw-main', type = null;
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

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['sipMsisdn'], 'timestamp', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            findUSSIGatewayCenterHistoryAll: function (ticket) {
                var msisdn = UtilService.getSubscriberMsisdn();
                var index = 'ussigw-main', type = null;
                var filter = {
                    sortFieldName: 'timestamp',
                    sortOrder: '"asc"',
                    offset: 0,
                    limit: 1000,
                    msisdn: msisdn
                };
                var additionalFilterFields = {ticket: ticket};

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['sipMsisdn'], 'timestamp', additionalFilterFields);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            // SMSF history methods
            findSMSFCenterHistoryInitSessions: function (filter, additionalFilterFields) {
                var index = 'smsf-main', type = null;
                var termFilterJSON = {
                    "must": [
                        {
                            "terms": {
                                "cdrType": [
                                    13, // MESSAGE_REJECTED
                                    15, // MESSAGE_DELIVERY_SUCCESSFUL
                                    16  // MESSAGE_DELIVERY_FAILED
                                ]
                            }
                        }
                    ]
                };

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['origAddress', 'destAddress'], 'timestamp', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(SmsfESClient, index, type, filter, bodyPayload);
            },
            findSMSFCenterHistoryAll: function (ticket) {
                var index = 'smsf-main', type = null;
                var filter = {
                    sortFieldName: 'timestamp',
                    sortOrder: '"asc"',
                    offset: 0,
                    limit: 1000
                };
                var additionalFilterFields = {ticket: ticket};

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['origAddress', 'destAddress'], 'timestamp', additionalFilterFields);

                return findHistoryRecords(SmsfESClient, index, type, filter, bodyPayload);
            },
            // Products DSP - MSGGW CHGGW etc
            // Charging Gw
            findChargingGwRecords: function (filter, additionalFilterFields) {
                var index = 'elastic-search-adapter', type = '';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['msisdn'], 'date', additionalFilterFields);

                return findHistoryRecords(ChargingGwESAdapterClient, index, type, filter, bodyPayload, true);
            },
            // MessagingGw SMS
            findMessagingGwSMSRecords: function (filter, additionalFilterFields) {
                var index = 'elastic-search-adapter', type = 'sms_edr';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['origAddress', 'destAddress'], 'date', additionalFilterFields);

                return findHistoryRecords(MessagingGwESAdapterClient, index, type, filter, bodyPayload, true);
            },
            findMessagingGwSMSMessageParts: function (origAddress, destAddress, partRef, timestamp) {
                var index = 'msggw-sms', type = null;  //type = 'sms';

                var beginDate = moment(timestamp).subtract(2, 'hours').utcOffset(DateTimeConstants.OFFSET).format('YYYY-MM-DDTHH:mm:ss.SSSZZ');
                var endDate = moment(timestamp).add(2, 'hours').utcOffset(DateTimeConstants.OFFSET).format('YYYY-MM-DDTHH:mm:ss.SSSZZ');

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

                return findHistoryRecords(RbtESClient, index, type, filter, bodyPayload);
            },
            findMessagingGwSMSDeliveryReports: function (cdrKey) {
                var index = 'msggw-dr-sms', type = null;  //type = 'sms_dr';

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

                return findHistoryRecords(RbtESClient, index, type, filter, bodyPayload);
            },
            // MessagingGw MMS
            findMessagingGwMMSRecords: function (filter, additionalFilterFields) {
                var index = 'elastic-search-adapter', type = 'mms_edr';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['origAddress', 'destAddress'], 'date', additionalFilterFields);

                return findHistoryRecords(MessagingGwESAdapterClient, index, type, filter, bodyPayload, true);
            },
            findMessagingGwMMSDeliveryReports: function (cdrKey) {
                var index = 'msggw-dr-mms', type = null; //type = 'mms_dr';

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

                return findHistoryRecords(RbtESClient, index, type, filter, bodyPayload);
            },

            // SERVICES
            // CMB
            findCMBHistory: function (filter, additionalFilterFields) {
                var index = 'pcm', type = null;

                var termFilterJSON = {
                    "must": [
                        {
                            "terms": {
                                "eventInfo": [
                                    "Request Received"
                                ]
                            }
                        }
                    ]
                };
                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['aPartyMsisdn', 'bPartyMsisdn'], 'timestamp', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            findCMBDetailedHistory: function (sessionId) {
                var index = 'pcm', type = null;

                var filter = {offset: 0, limit: 1000};
                var payload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "sessionId": sessionId
                                    }
                                }
                            ]
                        }
                    }
                };

                return findHistoryRecords(ESClient, index, type, filter, payload);
            },
            // Voice Mail
            findVMHistory: function (filter, additionalFilterFields) {
                var index = 'voicemail', type = null; // type = 'voicemail';

                var termFilterJSON = {
                    "must": [
                        {
                            "terms": {
                                "eventcode": [
                                    "RUNNING_VM_DEPOSIT_SERVICE",
                                    "RUNNING_VM_RETRIEVAL_SERVICE",
                                    "RUNNING_VM_RETRIEVAL_INDIRECT_SERVICE",
                                    "RUNNING_VM_INDIRECT_SERVICE",
                                    "RUNNING_VM_DEPOSIT_INDIRECT_SERVICE",
                                    "NOTIFICATION_SERVICE_STARTED"
                                ]
                            }
                        }
                    ]
                };

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['origparty', 'destparty', 'origdestparty', 'subsphone'], 'timestamp', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            findVMDetailedHistory: function (sessionid) {
                var index = 'voicemail', type = null; // type = 'voicemail';

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
            // Voice SMS
            findVSMSHistory: function (filter, additionalFilterFields) {
                var index = 'voicesms', type = null; // type = 'voicesms';

                var termFilterJSON = {
                    "must": [
                        {
                            "terms": {
                                "eventcode": [
                                    "RUNNING_VSMS_DEPOSIT_SERVICE",
                                    "RUNNING_VSMS_RETRIEVAL_SERVICE"
                                ]
                            }
                        }
                    ]
                };

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['origparty', 'destparty'], 'timestamp', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            findVSMSDetailedHistory: function (sessionid) {
                var index = 'voicesms', type = null; // type = 'voicesms';
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
            // Collect Call
            findCCHistory: function (filter, additionalFilterFields) {
                var index = 'cc', type = null;
                var termFilterJSON = {
                    "must": [
                        {
                            "terms": {
                                "eventInfo": [
                                    "Session Ended",
                                    "Menu Request Finished"
                                ]
                            }
                        }
                    ]
                };
                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['aPartyMsisdn', 'bPartyMsisdn'], 'timestamp', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            findCCDetailedHistory: function (sessionId) {
                var index = 'cc', type = null;

                var filter = {offset: 0, limit: 1000};
                var payload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "sessionId": sessionId
                                    }
                                }
                            ]
                        }
                    }
                };

                return findHistoryRecords(ESClient, index, type, filter, payload);
            },

            // MCA
            findMCAHistory: function (filter, additionalFilterFields) {
                var index = 'mcn', type = null; // type = 'mcn';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['edrCallingNum', 'edrOrigCalledNum', 'edrRedirectionNum'], 'edrTimestamp', additionalFilterFields);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            // Poke Call
            findPokeCallHistory: function (filter, additionalFilterFields) {
                var index = 'poke', type = null;

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, ['aPartyMsisdn', 'bPartyMsisdn'], 'timestamp', additionalFilterFields);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            // Ring Back Tone
            findRBTHistory: function (filter, additionalFilterFields) {
                var index = 'rbt-event', type = null;

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

                return findHistoryRecords(RbtESClient, index, type, filter, bodyPayload);
            },
            findRBTDetailedHistory: function (sessionid) {
                var index = 'rbt-event', type = null;

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

                return findHistoryRecords(RbtESClient, index, type, filter, payload);
            },
            // Screening Manager
            findScreeningManagerHistory: function (filter, additionalFilterFields) {
                var index = 'screeningmanager', type = 'rest';

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
            // Content Subscription Manager
            findCSMHistory: function (filter, additionalFilterFields) {
                var index = 'ssm-main', type = 'ssm';

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

                return findHistoryRecords(SsmESClient, index, type, filter, bodyPayload);
            },
            findCSMDetailedHistory: function (subscriptionId, eventType) {
                var index = 'ssm-detail', type = 'ssm';
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

                return findHistoryRecords(SsmESClient, index, type, filter, payload);
            },
        };
    });

})();
