<%@ page import="com.atlassian.jira.license.LicenseBannerHelper" %>
<%@ page import="static com.atlassian.jira.component.ComponentAccessor.getComponentOfType" %>
<%@ page import="static org.apache.commons.lang3.StringEscapeUtils.escapeEcmaScript" %>

<% final LicenseBannerHelper licenseBanner = getComponentOfType(LicenseBannerHelper.class); %>
<script>
require(["jquery", "jira/license-banner"], function ($, licenseBanner) {
    $(function () {
        licenseBanner.showLicenseBanner("<%= escapeEcmaScript(licenseBanner.getExpiryBanner())%>");
        licenseBanner.showLicenseFlag("<%= escapeEcmaScript(licenseBanner.getLicenseFlag())%>");
    });
});
</script>
