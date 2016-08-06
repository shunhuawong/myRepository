define('jira/util/users/logged-in-user', [
    'jira/util/data/meta'
], function(
    meta
) {
    /**
     * A namespace containing functions to handle users,
     * groups and roles in JIRA.
     *
     * @exports jira/util/users/logged-in-user
     */
    var User = {};

    /**
     * Retrieves the user name the user that is currently logged in JIRA.
     *
     * @return {String} A {@link String} containing the user name.
     */
    User.username = function() {
        return meta.get("remote-user");
    };

    /**
     * Retrieves the full name the user that is currently logged in JIRA.
     *
     * @returns {String} a {@link String} containing the full name of the user.
     */
    User.fullName = function() {
        return meta.get('remote-user-fullname');
    };

    /**
     * Whether the user that is currently logged in JIRA is anonymous or not.
     *
     * @return {Boolean} true if the currently logged in user is anonymous; otherwise false.
     */
    User.isAnonymous = function() {
        return meta.get("remote-user") === "";
    };

    /**
     * Determine whether the current user is a system administrator.
     *
     * @returns {boolean} true if the currently logged in user is a sysadmin; otherwise false.
     */
    User.isSysadmin = function () {
        return !!meta.getBoolean("is-sysadmin");
    };

    /**
     * Determine whether the current user is an admin.
     *
     * @returns {boolean} true if the currently logged in user is an admin; otherwise false.
     */
    User.isAdmin = function() {
        return !!meta.getBoolean("is-admin");
    };

    return User;
});
