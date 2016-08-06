<%@ taglib uri="webwork" prefix="ww" %>
<ww:param name="'workflowMode'" value="workflow/mode" />
<ww:param name="'workflowName'" value="workflow/name" />
<ww:if test="project != null">
    <ww:param name="'project'" value="project" />
</ww:if>
<ww:if test="issueType != null">
    <ww:param name="'issueType'" value="issueType" />
</ww:if>
<ww:if test="descriptorTab != null && descriptorTab/length > 0">
    <ww:param name="'descriptorTab'" value="descriptorTab" />
</ww:if>