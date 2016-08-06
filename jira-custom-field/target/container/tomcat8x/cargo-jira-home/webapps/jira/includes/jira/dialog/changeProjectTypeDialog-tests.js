AJS.test.require("jira.webresources:init-change-project-type-dialog", function() {
    require(["jira/project/admin/change-project-type-dialog",
        'jquery'
    ], function
     (ChangeProjectTypeDialog,
     $
    ){
        module("ChangeProjectTypeDialog", {
            setup: function () {

                this.server = sinon.fakeServer.create();
                this.projectTypes =
                    [
                        {key:"business",
                            icon:"business-icon",
                            formattedKey:"Business"},
                         {key:"software",
                            icon:"software-icon",
                            formattedKey:"Software"}
                    ];
                this.project = {name:"Business Project", projectTypeKey:"business", key:"B001", avatarUrls:[]} ;
                this.$changeLink = $('<a href="#" rel="project-type-id">Change Project Type</a>');
                this.ChangeProjectTypeDialog = ChangeProjectTypeDialog({
                    trigger: this.$changeLink,
                    projectId:"MIC"
                });
            }
        });

        test("should show the project name and project types in the dialog", function() {
            this.$changeLink.click();
            this.server.requests[0].respond(200, {"Content-Type": "application/json"},
                    JSON.stringify({
                                project: this.project,
                                helpLink: "link",
                                projectTypes:this.projectTypes
                            }));

            ok($(".project-header").text() === "Business Project","project name is shown");
            ok($(".project-type-select").val()[0] === "business", "current project type should be selected by default");

            $(".project-type-select-group").html(JIRA.Templates.project.ChangeType.projectTypeDropdown({
                projectTypeKey: "software",
                projectTypes: this.projectTypes
            }));

            $(".dialog-change-button").click();
            equal(this.server.requests[1].method, 'PUT', 'The change project type request was PUT');
            var expectedUrl = 'rest/api/2/project/MIC/type/s';
            ok(this.server.requests[1].url.indexOf(expectedUrl) > -1);

        });

        test("should show error message when failing to load project information", function(){
            this.$changeLink.click();
            this.server.requests[0].respond(404);
            var errorMessage = $(".aui-message-error").text();
            equal(errorMessage, "admin.projects.change.project.type.data.error");
        });

        test("should show error message when failing to convert project type", function() {
            this.$changeLink.click();
            this.server.requests[0].respond(200, {"Content-Type": "application/json"},
                    JSON.stringify({
                        project: this.project,
                        helpLink: "link",
                        projectTypes:this.projectTypes
                    }));
            $(".project-type-select-group").html(JIRA.Templates.project.ChangeType.projectTypeDropdown({
                projectTypeKey: "software",
                projectTypes: this.projectTypes
            }));

            $(".dialog-change-button").click();
            this.server.requests[1].respond(404);
            var errorMessage = $(".aui-message-error").text();
            equal(errorMessage, "admin.projects.change.project.type.erroradmin.projects.change.project.type.data.error");

        });

    });
});