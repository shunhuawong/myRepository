define("jira/setup/setup-language-view", [
    "jquery",
    "backbone",
    "underscore"
], function($, Backbone, _){
    return Backbone.Marionette.ItemView.extend({
        defaultTexts: {
            button: AJS.I18n.getText("common.words.save"),
            cancel: AJS.I18n.getText("common.forms.cancel"),
            connectionWarningContent: AJS.I18n.getText("setup.language.dialog.connection.warning.content"),
            connectionWarningTitle: AJS.I18n.getText("setup.language.dialog.connection.warning.title"),
            langLabel: AJS.I18n.getText("setup.choose.language"),
            langDesc: AJS.I18n.getText("setupdb.server.language.description"),
            header: AJS.I18n.getText("setup.language.dialog.header")
        },

        ui: {
            button: ".jira-setup-language-save-button",
            cancel: ".jira-setup-language-cancel-button",
            footerSpinner: ".jira-setup-language-footer-spinner",
            select: "#jira-setup-language",
            spinner: ".jira-setup-language-spinner",
            warning: ".jira-setup-language-connection-warning"
        },

        events: {
            "click @ui.button": "onButtonClick",
            "click @ui.cancel": "onCancelClick",
            "change @ui.select": "onSelectChange"
        },

        template: JIRA.Templates.Setup.languageDialogContent,
        templateHelpers: {
            locales: [],
            showConnectionWarning: false,
            showSpinner: true,
            texts: {}
        },

        initialize: function(){
            // fallback for default texts when jsI18n transformer doesn't work
            // (see atlassian-plugins-webresource-plugin-mock.xml)
            var defaultTexts = AJS.Meta.get("setup-language-dialog-default-texts");
            if (defaultTexts){
                this.defaultTexts = JSON.parse(defaultTexts);
            }
        },

        showInitial: function(){
            this._formDisabled = false;
            this._defaultLocale = undefined; // the locale selected by default
            this._selectedLocale = undefined;

            this.templateHelpers.showSpinner = true;
            this.templateHelpers.showConnectionWarning = false;

            this.updateTexts();
            this.render();
            this.enableButton(false);
        },

        start: function(){
            this.pullInstalledLocales();
        },

        updateSelected: function(defaultLocale){
            _.each(this.templateHelpers.locales, _.bind(function(localeData){
                localeData.selected = (this._selectedLocale ?
                        localeData.value === this._selectedLocale : localeData.value === defaultLocale);
            }, this));
        },

        updateTexts: function(newTexts){
            var newTexts = newTexts || {};
            this.templateHelpers.texts = _.extend({}, this.defaultTexts, newTexts);
        },

        onButtonClick: function(){
            this.disableForm();

            $.ajax({
                data: {jiraLanguage: this._selectedLocale},
                dataType: "json",
                timeout: 5000,
                type: "POST",
                url: AJS.contextPath() + "/secure/" + this.getCurrectActionName() + "!changeLanguage.jspa",
                complete: _.bind(this._languageChangeComplete, this)
            });
        },

        _languageChangeComplete: function(){
            window.location.reload();
        },

        onCancelClick: function(e){
            e.preventDefault();

            if (!this._formDisabled){
                this.trigger("cancel-requested");
            }
        },

        onSelectChange: function(){
            this._selectedLocale = this.ui.select.val()[0];
            this.disableForm();
            this.ui.cancel.focus();
            this.pullLanguageTexts();
        },

        disableForm: function(){
            this._formDisabled = true;

            this.enableButton(false);

            this.ui.select.prop("disabled", true);
            this.langSingleSelect.disable();

            this.ui.footerSpinner.removeClass("hidden");
        },

        pullInstalledLocales: function(){
            this.templateHelpers.showConnectionWarning = false;

            $.ajax({
                dataType: "json",
                timeout: 5000,
                type: "GET",
                url: AJS.contextPath() + "/secure/" + this.getCurrectActionName() + "!getInstalledLocales.jspa",
                success: _.bind(this._pullInstalledLocalesSuccess, this),
                error: _.bind(this._pullInstalledLocalesError, this)
            });
        },

        _pullInstalledLocalesSuccess: function(data){
            var locales = [];

            _.each(data.locales, _.bind(function(text, value){
                locales.push({
                    text: text,
                    value: value
                })
            }, this));

            this.templateHelpers.locales = _.sortBy(locales, "text");
            this.updateSelected(data.currentLocale);
            this.templateHelpers.showSpinner = false;

            this.render();
            this._defaultLocale = this.ui.select.val()[0];
            this.enableButton(false);
        },

        _pullInstalledLocalesError: function(){
            this.templateHelpers.showSpinner = false;
            this.templateHelpers.showConnectionWarning = true;

            this.render();
        },

        pullLanguageTexts: function(){
            this.templateHelpers.showConnectionWarning = false;

            $.ajax({
                data: {localeForTexts: this._selectedLocale},
                dataType: "json",
                timeout: 5000,
                type: "GET",
                url: AJS.contextPath() + "/secure/" + this.getCurrectActionName() + "!getLanguageTexts.jspa",
                success: _.bind(this._pullLanguageTextsSuccess, this),
                error: _.bind(this._pullLanguageTextsError, this)
            });
        },

        _pullLanguageTextsSuccess: function(data){
            this.updateSelected();
            this.updateTexts(data);
            this.render();

            if (this._selectedLocale === this._defaultLocale){
                this.enableButton(false);
            }
        },

        _pullLanguageTextsError: function(){
            this.templateHelpers.showConnectionWarning = true;

            this.render();
        },

        onRender: function(){
            this._formDisabled = false;
            this.langSingleSelect = new AJS.SingleSelect({
                element: this.ui.select
            });
            this.ui.cancel.focus();
        },

        enableButton: function(enable){
            var enable = enable === undefined ? true : enable;

            this.ui.button.prop("disabled", !enable);
            this.ui.button.attr("aria-disabled", ""+!enable);
        },

        getCurrectActionName: function(){
            var match =  window.location.pathname.replace(AJS.contextPath() + "/secure/", "").match(/^([a-zA-Z]+)/);

            return match ? match[0] : "SetupMode";
        }
    });
});
