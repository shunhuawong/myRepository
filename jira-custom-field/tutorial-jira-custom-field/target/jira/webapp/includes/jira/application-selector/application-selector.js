;define("jira/admin/application-selector", [
    "jira/admin/application-selector/application",
    "jira/admin/application-selector/application-critical",
    "jira/admin/application-selector/application-selectable",
    "jira/skate",
    "backbone",
    "underscore",
    "jquery"
], function (
    Application,
    ApplicationCritical,
    ApplicationSelectable,
    skate,
    Backbone,
    _,
    $
) {
    "use strict";
    return Backbone.Marionette.CollectionView.extend({
        itemEvents: _.object([
            [Application.TOGGLE_EVENT, function onApplicationToggle(eventName, toggledApplication) {
                var otherAppsAreChecked = this.numberOfAppsSelectedExcludingCore();
                if (otherAppsAreChecked) {
                    this._makeCoreIncluded();
                } else if (this.hasCore() && this.core !== toggledApplication) {
                    this._makeCoreAvailable();
                }

                this.selectEffectiveApplications();
            }]
        ]),
        initialize: function (options) {
            this.disableEffectiveAccess = options.disableEffectiveAccess;
            this.disableUndefinedWarningDisplaying = options.disableUndefinedWarningDisplaying;

            var $applications = $(options.el).find('.application');
            if (!$applications.length) {
                return;
            }

            skate.init(options.el);

            $applications.each(function forEachApplication(index, applicationElement) {
                var $applicationElement = $(applicationElement);
                var indeterminate = $applicationElement.data("indeterminate");
                var application;
                var applicationOptions = {
                    el: applicationElement.parentNode,
                    disableUndefinedWarningDisplaying: this.disableUndefinedWarningDisplaying
                };
                if ($applicationElement.hasClass("application-warning")) {
                    application = new ApplicationCritical(applicationOptions);
                }
                else {
                    application = new ApplicationSelectable(applicationOptions);
                }

                if (indeterminate) {
                    application.setIndeterminate(true, {silent: indeterminate !== "effective"});
                }
                this.addChildViewEventForwarding(application);
                this.children.add(
                    application,
                    application.getApplicationKey()
                );
            }.bind(this));
            this.core = this.children.findByCustom("jira-core");

            if (this.hasCore()) {
                this.listenTo(this.core, Application.TOGGLE_EVENT, function onCoreToggle(options) {
                    if (options.manual) {
                        this.coreRemainChecked = this.core.isSelected();
                    }
                });

                this.coreRemainDisabled = this.core.isDisabled();
                this.coreRemainChecked = this.core.isSelected();
            }

            if (this.numberOfAppsSelectedExcludingCore() > 0) {
                this._makeCoreIncluded();
            }

            this.selectEffectiveApplications();
        },
        disableAllApplications: function () {
            this.children.each(function disableChild(child){
                child.setDisabled(true);
            });
        },
        selectApplicationsBasedOnURL: function selectApplicationsBasedOnURL(url) {
            var applicationKeysToSelect = this._getApplicationKeysToPreselectFromURL(url);

            if (applicationKeysToSelect.length) {
                this.deselectAll();

                applicationKeysToSelect.forEach(function(applicationKey) {
                    var application = this.getByKey(applicationKey);
                    if (application && !application.isDisabled()) {
                        application.setSelected(true);
                    }
                }.bind(this));
            }

            this.selectEffectiveApplications();
        },
        selectEffectiveApplications: function () {
            if (this.disableEffectiveAccess) {
                return;
            }

            // get list of effective apps
            var effectiveApplications = _.flatten(this.children.toArray()
                .filter(function(application) {
                    return application.isSelected() && !application.isDisabled();
                }).map(function(application) {
                    return application.getEffective();
                }))
                .map(this.getByKey, this);

            // find out application
            this.children.each(function (application) {
                if (!application.isSelected() && effectiveApplications.indexOf(application) >= 0) {
                    application.setIndeterminate(true);
                } else {
                    application.setIndeterminate(false);
                }
            }, this);
        },
        _getApplicationKeysToPreselectFromURL: function _getApplicationKeysToPreselectFromURL(url) {
            var applications = [];
            url = url || location.search;
            var paramsString = url.split("?")[1];
            if (paramsString) {
                var params = paramsString.split("&");
                params.forEach(function (paramString) {
                    var param = paramString.split("=");
                    var application;
                    if (param[0] === "application") {
                        applications.push(param[1]);
                    }
                }.bind(this));
            }
            return applications;
        },
        numberOfAppsSelectedExcludingCore: function numberOfAppsSelectedExcludingCore() {
            var numberOfOtherAppsSelected = 0;
            var instance = this;
            this.children.each(function (application) {
                if (instance.hasCore() && application !== instance.core && (application.isSelected() || application.isIndeterminateButNotEffective())) {
                    numberOfOtherAppsSelected += 1;
                }
            });
            return numberOfOtherAppsSelected;
        },
        deselectAll: function() {
            this.getAll().each(function (application) {
                application.setSelected(false);
            });
        },
        getAll: function getAll() {
            return this.children;
        },
        getByKey: function getApplicationByKey(applicationKey) {
            return this.children.findByCustom(applicationKey);
        },
        hasCore: function hasCore() {
            return !!this.core;
        },
        _makeCoreIncluded: function _makeCoreIncluded() {
            if (this.hasCore()) {
                this.core.setDisabled(true);
                this.core.setSelected(true);
            }
        },
        _makeCoreAvailable: function _makeCoreAvailable() {
            if (this.hasCore()) {
                if(!this.coreRemainDisabled) {
                    this.core.setDisabled(false);
                }
                if(!this.coreRemainChecked) {
                    this.core.setSelected(false);
                }
            }
        }
    });

});
