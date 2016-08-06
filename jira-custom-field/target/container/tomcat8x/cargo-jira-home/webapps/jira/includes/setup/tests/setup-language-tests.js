AJS.test.require("jira.webresources:jira-setup", function(){

    var $ = require("jquery");
    var markup = JIRA.Templates.Setup.layoutContent({});
    var View = require("jira/setup/setup-language-view");
    
    var DEFAULT_LOCALE = "en_UK";

    module("JIRA setup language dialog", {
        setup: function(){
            this.sandbox = sinon.sandbox.create({
                useFakeServer: true
            });
            this.lastRequestIndexToRespond = 0;

            $("#qunit-fixture").html(markup);

            this.view = new View({
                el: "#jira-setup-language-dialog",
                reloadFunction: this.reloadFunctionSpy,
                reloadFunctionContext: this.reloadFunctionContext
            });

            this.view.showInitial();
        },

        respondToLastRequest: function(status, data){
            var data = data || {};
            var lastIndex = this.sandbox.server.requests.length - 1;

            equal(lastIndex, this.lastRequestIndexToRespond, "expecting particular number of requests in the queue");

            this.sandbox.server.requests[lastIndex].respond(status, {"Content-Type": "application/json"}, JSON.stringify(data));
            this.lastRequestIndexToRespond++;
        },

        respondToGetInitialListOfInstalledLocales: function(){
            this.respondToLastRequest(200, {
                "currentLocale": DEFAULT_LOCALE,
                "locales": {
                    "de_DE":"Deutsch (Deutschland)",
                    "en_UK":"English (UK)"
                }
            });
        },

        respondToGetInitialListOfInstalledLocalesWithError: function(){
            this.respondToLastRequest(500);
        },

        respondToLocaleChangeWithNewI18nTexts: function(){
            this.respondToLastRequest(200, {
                "button": "button"
            });
        },

        respondToLocaleChangeWithError: function(){
            this.respondToLastRequest(500);
        },

        selectLocale: function(locale){
            var descriptor = this.view.ui.select.find("option[value='"+locale+"']").data("descriptor");

            this.view.langSingleSelect.setSelection(descriptor);
        },

        startView: function(){
            this.view.start();
            this.respondToGetInitialListOfInstalledLocales();
        },

        teardown: function(){
            this.view.remove();
            this.sandbox.restore();
        }
    });

    test("after dialog is open should request installed locales and allow to select a new locale only after successful response", function(){
        // given
        this.view.start();

        // then
        equal(this.view.ui.spinner.length, 1, "spinner is visible");
        equal(this.view.ui.select.length, 0, "language select is not present");

        // when
        this.respondToGetInitialListOfInstalledLocales();

        // then
        equal(this.view.ui.spinner.length, 0, "spinner is not present");
        equal(this.view.ui.select.length, 1, "language select is present");
        equal(this.view.ui.select.val(), DEFAULT_LOCALE, "default locale is selected");
        equal(this.view.ui.button.is(":disabled"), true, "submit button is disabled");
    });

    test("should show a warning if cannot obtain list of installed locales from the server", function(){
        // given
        this.view.start();

        // when
        this.respondToGetInitialListOfInstalledLocalesWithError();

        // then
        equal(this.view.ui.spinner.length, 0, "spinner is not present");
        equal(this.view.ui.button.is(":disabled"), true, "submit button is disabled");
        equal(this.view.ui.warning.length, 1, "warning is present");

        // given
        var handler = this.sandbox.spy();
        this.view.on("cancel-requested", handler);

        // when
        this.view.ui.cancel.click();

        // then
        sinon.assert.calledOnce(handler, "cancel link works as expected");
    });

    test("save button should be enabled only if locale different than current is chosen", function(){
        // given
        this.startView();

        // when
        this.selectLocale(DEFAULT_LOCALE);

        // then
        equal(this.sandbox.server.requests.length, 1, "no request made if the same locale as current selected");
        equal(this.view.ui.button.is(":disabled"), true, "submit button is disabled");

        // when
        this.selectLocale("de_DE");
        this.respondToLocaleChangeWithNewI18nTexts();

        // then
        equal(this.view.ui.button.is(":disabled"), false, "submit button is enabled");

        // when
        this.selectLocale(DEFAULT_LOCALE);
        this.respondToLocaleChangeWithNewI18nTexts();

        // then
        equal(this.view.ui.button.is(":disabled"), true, "submit button is disabled");
    });

    test("after new locale is selected, should get list of texts in new language and apply them", function(){
        // given
        this.startView();

        // then
        equal(this.view.ui.button.text(), "common.words.save", "button has default label");

        // when
        this.selectLocale("de_DE");
        this.respondToLocaleChangeWithNewI18nTexts();

        // then
        equal(this.view.ui.button.text(), "button", "button's label is changed");
    });

    test("should show a warning if cannot obtain list of texts in new language from the server", function(){
        // given
        this.startView();

        // when
        this.selectLocale("de_DE");
        this.respondToLocaleChangeWithError();

        // then
        equal(this.view.ui.footerSpinner.hasClass("hidden"), true, "footer spinner is hidden");
        equal(this.view.ui.button.is(":disabled"), true, "submit button is disabled");
        equal(this.view.ui.warning.length, 1, "warning is present");

        // given
        var handler = this.sandbox.spy();
        this.view.on("cancel-requested", handler);

        // when
        this.view.ui.cancel.click();

        // then
        sinon.assert.calledOnce(handler, "cancel link works as expected");
    });

    test("while making request for texts language select and submit button should be disabled and spinner should be visible", function(){
        // given
        this.startView();

        // when
        this.selectLocale("de_DE");

        // then
        equal(this.view.langSingleSelect.$container.hasClass("aui-disabled"), true, "language select is disabled");
        equal(this.view.ui.button.is(":disabled"), true, "submit button is disabled");
        equal(this.view.ui.footerSpinner.hasClass("hidden"), false, "footer spinner is visible");

        // when
        this.respondToLocaleChangeWithNewI18nTexts();

        // then
        equal(this.view.langSingleSelect.$container.hasClass("aui-disabled"), false, "language select is enabled");
        equal(this.view.ui.button.is(":disabled"), false, "submit button is enabled");
        equal(this.view.ui.footerSpinner.hasClass("hidden"), true, "footer spinner is hidden");
    });

    test("clicking on cancel link raises an event", function(){
        // given
        this.startView();
        var handler = this.sandbox.spy();
        this.view.on("cancel-requested", handler);

        // when
        this.view.ui.cancel.click();

        // then
        sinon.assert.calledOnce(handler, "cancel link works as expected");
    });

    test("saving new locale should disable form, request the server to change the language and finally reload the page", function(){
        // given
        var langChangeHandlerStub = this.sandbox.stub(this.view, "_languageChangeComplete");
        this.startView();

        // when
        this.selectLocale("de_DE");
        this.respondToLocaleChangeWithNewI18nTexts();
        this.view.ui.button.click();

        // then
        equal(this.view.langSingleSelect.$container.hasClass("aui-disabled"), true, "language select is disabled");
        equal(this.view.ui.button.is(":disabled"), true, "submit button is disabled");
        equal(this.view.ui.footerSpinner.hasClass("hidden"), false, "footer spinner is visible");

        // when
        var changeLanguageReq = this.sandbox.server.requests[2];
        changeLanguageReq.respond(200, {"Content-Type": "application/json"}, JSON.stringify({}));

        // then
        notEqual(changeLanguageReq.url.indexOf("!changeLanguage.jspa"), -1, "should call the correct action");
        equal(changeLanguageReq.requestBody, "jiraLanguage=de_DE", "should send chosen locale");
        sinon.assert.calledOnce(langChangeHandlerStub, "should reload page");
    });
});