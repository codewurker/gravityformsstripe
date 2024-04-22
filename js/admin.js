/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./js/src/admin.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./js/src/admin.js":
/*!*************************!*\
  !*** ./js/src/admin.js ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Admin Script
 */

/* global jQuery, gforms_stripe_admin_strings */

window.GFStripeAdmin = null;

(function ($) {
    var GFStripeAdminClass = function GFStripeAdminClass() {

        var self = this;

        this.accountSettingsLocked = false;
        this.deauthActionable = false;
        this.inputContainerPrefix = gforms_stripe_admin_strings.input_container_prefix;
        this.inputPrefix = gforms_stripe_admin_strings.input_prefix;
        this.liveDependencySupported = gforms_stripe_admin_strings.liveDependencySupported;
        this.apiMode = gforms_stripe_admin_strings.apiMode;
        this.init = function () {
            this.initKeyStatus('live_publishable_key');
            this.initKeyStatus('live_secret_key');
            this.initKeyStatus('test_publishable_key');
            this.initKeyStatus('test_secret_key');
            this.bindDeauthorize();

            if (!this.liveDependencySupported) {
                this.bindAPIModeChange();
            }

            this.maybeLockAccountSettings();
            this.bindWebhookAlert();

            this.bindRefund();
            this.bindCapture();
        };

        this.validateKey = function (keyName, key) {

            if (key.length == 0) {
                this.setKeyStatus(keyName, "");
                return;
            }

            $('#' + keyName).val(key.trim());

            this.setKeyStatusIcon(keyName, "<img src='" + gforms_stripe_admin_strings.spinner + "'/>");

            if (keyName == "live_publishable_key" || keyName == "test_publishable_key") this.validatePublishableKey(keyName, key);else this.validateSecretKey(keyName, key);
        };

        this.validateSecretKey = function (keyName, key) {
            $.post(ajaxurl, {
                action: "gf_validate_secret_key",
                keyName: keyName,
                key: key,
                nonce: gforms_stripe_admin_strings.ajax_nonce
            }, function (response) {

                response = response.trim();

                if (response == "valid") {
                    self.setKeyStatus(keyName, "1");
                } else if (response == "invalid") {
                    self.setKeyStatus(keyName, "0");
                } else {
                    self.setKeyStatusIcon(keyName, gforms_stripe_admin_strings.validation_error);
                }
            });
        };

        this.validatePublishableKey = function (keyName, key) {
            this.setKeyStatusIcon(keyName, "<img src='" + gforms_stripe_admin_strings.spinner + "'/>");

            cc = {
                number: "4916433572511762",
                exp_month: "01",
                exp_year: new Date().getFullYear() + 1,
                cvc: "111",
                name: "Test Card"
            };

            Stripe.setPublishableKey(key);
            Stripe.card.createToken(cc, function (status, response) {

                if (status == 200) {
                    self.setKeyStatus(keyName, "1");
                } else if ((status == 400 || status == 402) && keyName == "live_publishable_key") {
                    //Live publishable key will return a 400 or 402 status when the key is valid, but the account isn't setup to run live transactions
                    self.setKeyStatus(keyName, "1");
                } else {
                    self.setKeyStatus(keyName, "0");
                }
            });
        };

        this.initKeyStatus = function (keyName) {
            var is_valid = $('#' + keyName + '_is_valid');
            var key = $('#' + keyName);

            if (is_valid.length > 0) {
                this.setKeyStatus(keyName, is_valid.val());
            } else if (key.length > 0) {
                this.validateKey(keyName, key.val());
            }
        };

        this.setKeyStatus = function (keyName, is_valid) {
            $('#' + keyName + '_is_valid').val(is_valid);

            var iconMarkup = "";
            if (is_valid == "1") iconMarkup = "<i class=\"fa icon-check fa-check gf_valid\"></i>";else if (is_valid == "0") iconMarkup = "<i class=\"fa icon-remove fa-times gf_invalid\"></i>";

            this.setKeyStatusIcon(keyName, iconMarkup);
        };

        this.setKeyStatusIcon = function (keyName, iconMarkup) {
            var icon = $('#' + keyName + "_status_icon");
            if (icon.length > 0) icon.remove();

            $('#' + keyName).after("<span id='" + keyName + "_status_icon'>&nbsp;&nbsp;" + iconMarkup + "</span>");
        };

        this.bindDeauthorize = function () {
            // De-Authorize from Stripe.
            $('.gform_stripe_deauth_button').on('click', function (e) {
                e.preventDefault();

                if (self.accountSettingsLocked) {
                    // do a reload to trigger beforeunload event.
                    window.location.reload();
                    return false;
                }

                // Get button.
                var deauthButton = $('#gform_stripe_deauth_button'),
                    deauthScope = $('#deauth_scope'),
                    disconnectMessage = gforms_stripe_admin_strings.disconnect,
                    apiMode = $(this).data('mode'),
                    feedId = $(this).data('fid');

                if (!self.deauthActionable) {
                    $('.gform_stripe_deauth_button').eq(0).hide();
                    if (feedId !== '') {
                        $('.connected_to_stripe_text').hide();
                    }

                    deauthScope.show(0, function () {
                        self.deauthActionable = true;
                    });
                } else {
                    var deauthScopeVal = $('#' + apiMode + '_deauth_scope0').is(':checked') ? 'site' : 'account',
                        message = deauthScopeVal === 'site' && feedId !== '' ? disconnectMessage['feed'] : disconnectMessage[deauthScopeVal];

                    // Confirm deletion.
                    if (!confirm(message)) {
                        return false;
                    }

                    // Set disabled state.
                    deauthButton.attr('disabled', 'disabled');

                    // De-Authorize.
                    $.ajax({
                        async: false,
                        url: ajaxurl,
                        dataType: 'json',
                        method: 'POST',
                        data: {
                            action: 'gfstripe_deauthorize',
                            scope: deauthScopeVal,
                            fid: feedId,
                            id: $(this).data('id'),
                            mode: apiMode,
                            nonce: gforms_stripe_admin_strings.ajax_nonce
                        },
                        success: function (response) {
                            if (response.success) {
                                window.location.reload();
                            } else {
                                alert(response.data.message);
                            }

                            deauthButton.removeAttr('disabled');
                        }
                    });
                }
            });
        };

        this.bindAPIModeChange = function () {
            if (this.apiMode === '' || typeof this.apiMode === "undefined") {
                this.apiMode = 'live';
                $('#api_mode0').prop('checked', true);
            }
            var hideMode = this.apiMode === 'live' ? 'test' : 'live';

            // display the Stripe Connect button in corresponding mode.
            $('#' + this.inputContainerPrefix + this.apiMode + '_auth_token').show();
            $('#' + this.inputContainerPrefix + hideMode + '_auth_token').hide();
            // Switch Stripe Connect button between live and test mode.
            $('#tab_gravityformsstripe input[name="' + this.inputPrefix + '_api_mode"]').on('click', function (e) {
                self.apiMode = $(this).val();
                hideMode = self.apiMode === 'live' ? 'test' : 'live';
                $('#' + self.inputContainerPrefix + hideMode + '_auth_token').hide();
                $('#' + self.inputContainerPrefix + self.apiMode + '_auth_token').show();
            });
        };

        this.maybeLockAccountSettings = function () {
            var apiRows = $('#' + this.inputContainerPrefix + 'connected_to').siblings('#' + this.inputContainerPrefix + 'api_mode, #' + this.inputContainerPrefix + 'live_auth_token, #' + this.inputContainerPrefix + 'test_auth_token');
            // Display the Connect To field and hide the other Stripe Account settings (only for feed settings).
            apiRows.hide();

            // When clicked on the Switch Accounts button, show other fields and disable the button itself.
            $('#gform_stripe_change_account').on('click', function () {
                if ($(this).data('disabled')) {
                    alert(gforms_stripe_admin_strings.switch_account_disabled_message);
                } else {
                    $('#' + self.inputContainerPrefix + 'api_mode').show();
                    var hideMode = self.apiMode === 'live' ? 'test' : 'live';
                    $('#' + self.inputContainerPrefix + hideMode + '_auth_token').hide();
                    $('#' + self.inputContainerPrefix + self.apiMode + '_auth_token').show();
                    $(this).off('click').addClass('disabled');
                }
            });

            // Track if the feed settings were changed.
            $('table.gforms_form_settings').on('change', 'input, select', function () {
                var inputName = $(this).attr('name');
                if (inputName !== self.inputPrefix + '_api_mode' && inputName !== 'deauth_scope' && inputName !== self.inputPrefix + '_transactionType') {
                    self.accountSettingsLocked = true;
                }
            });

            // When the Update Settings button clicked, unlock the form.
            $('#gform-settings-save').on('click', function () {
                $('.error.below-h2').remove();
                self.accountSettingsLocked = false;
            });

            // Use the built-in "beforeunload" event to throw the confirmation when redirecting.
            window.addEventListener('beforeunload', function (e) {
                if (self.accountSettingsLocked) {
                    // Cancel the event
                    e.preventDefault();
                    // Chrome requires returnValue to be set
                    e.returnValue = '';
                }
            });
        };

        this.bindWebhookAlert = function () {
            if ($('#gform_stripe_change_account').length && $('#' + this.apiMode + '_signing_secret').val() === '') {
                $('#webhooks_enabled').focus();

                $([document.documentElement, document.body]).animate({
                    scrollTop: $("#" + self.inputContainerPrefix + "api_mode").offset().top + 20
                }, 1000);
            }
        };

        /**
         * Handles refund button click and sends a refund ajax request.
         *
         * @since 1.3 //@todo - version
         */
        this.bindRefund = function () {
            $('.stripe-refund').on('click', function (e) {
                e.preventDefault();
                var refundButton = $('.stripe_refund'),
                    refundWaitContainer = $('#refund_wait_container'),
                    transactionId = $(this).data('tid');
                entryId = $(this).data('lid');
                if (!window.confirm(gforms_stripe_admin_strings.refund)) {
                    return false;
                }

                // Set disabled state.
                refundButton.prop('disabled', true);
                refundWaitContainer.fadeIn();
                wp.a11y.speak(gforms_stripe_admin_strings.refund_processing, 'assertive');

                $.ajax({
                    async: true,
                    url: ajaxurl,
                    dataType: 'json',
                    method: 'POST',
                    data: {
                        action: 'gfstripe_refund',
                        transaction_id: transactionId,
                        entry_id: entryId,
                        nonce: gforms_stripe_admin_strings.refund_nonce
                    },
                    success: function (response) {
                        if (response.success) {
                            window.location.reload();
                        } else {
                            wp.a11y.speak(response.data.message, 'assertive');
                            $('.gform_stripe_refund_alert').show().html(response.data.message);
                        }
                    },
                    complete: function () {
                        wp.a11y.speak(gforms_stripe_admin_strings.refund_complete, 'assertive');
                        refundButton.prop('disabled', false);
                        refundWaitContainer.hide();
                    }
                }).fail(function (jqXHR, textStatus, error) {
                    window.alert(error);
                    refundButton.prop('disabled', false);
                    refundWaitContainer.hide();
                });
            });
        };

        this.bindCapture = function () {
            $('.stripe-capture').on('click keypress', function (e) {

                e.preventDefault();

                var captureButton = $('.stripe-capture'),
                    captureWaitContainer = $('#capture_wait_container');
                errorContainer = $('.gform_stripe_capture_alert');

                if (!window.confirm(gforms_stripe_admin_strings.capture_confirm)) {
                    return false;
                }

                // Set disabled state
                captureWaitContainer.fadeIn();
                captureButton.prop('disabled', true);
                errorContainer.hide();
                wp.a11y.speak(gforms_stripe_admin_strings.capture_processing, 'assertive');

                var requestData = captureButton.data('ajax');

                $.ajax({
                    url: ajaxurl,
                    method: 'POST',
                    data: {
                        action: 'gfstripe_capture_action',
                        transaction_id: requestData.transaction_id,
                        entry_id: requestData.entry_id,
                        nonce: requestData.nonce
                    },
                    success: function (response) {

                        if (response.success) {
                            wp.a11y.speak(gforms_stripe_admin_strings.capture_complete, 'assertive');
                            // Success. Reload page.
                            window.location.reload();
                        } else {
                            wp.a11y.speak(response.data, 'assertive');
                            errorContainer.show().html(response.data);

                            captureButton.prop('disabled', false);
                            captureWaitContainer.hide();
                        }
                    }
                }).fail(function (jqXHR, textStatus, error) {
                    wp.a11y.speak(error, 'assertive');
                    errorContainer.show().html(error);

                    captureButton.prop('disabled', false);
                    captureWaitContainer.hide();
                });
            });
        };

        this.init();
    };

    $(document).ready(function () {
        GFStripeAdmin = new GFStripeAdminClass();
    });
})(jQuery);

/***/ })

/******/ });
//# sourceMappingURL=admin.js.map