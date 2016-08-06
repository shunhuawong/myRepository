<div class="module toggle-wrap twixi-block" id="<ww:property value="./value/key" />">
    <div class="mod-header">
        <h3 class="toggle-title twixi-trigger" id="<ww:property value="./key/projectObject/id" /><ww:property value="./key/issueTypeObject/id" />">
            <img alt="" src="<ww:url value="'/secure/projectavatar'" atltoken="false"><ww:param name="'pid'" value="./key/projectObject/id" /><ww:param name="'size'" value="'small'" /></ww:url>" height="16" width="16"/>
            <ww:property value="./key/projectObject/name" /> &mdash;
            <ww:component name="'issuetype'" template="constanticon.jsp">
                <ww:param name="'contextPath'"><%= request.getContextPath() %></ww:param>
                <ww:param name="'iconurl'" value="./key/issueType/string('iconurl')" />
                <ww:param name="'alt'"><ww:property value="./key/issueType/string('name')" /></ww:param>
            </ww:component>
            <ww:property value="./key/issueType/string('name')" />
        </h3>
    </div>
    <div class="mod-content twixi-content">
        <ui:soy moduleKey="'com.atlassian.auiplugin:aui-experimental-soy-templates'" template="'aui.message.info'">
            <ui:param name="'content'">
                <p>
                    <ww:if test="./value/parentIssueKeys/size > 0 && ./value/parentIssueKey != null">
                        <ww:text name="'bulk.migrate.confirm.subheading.with.parent'">
                            <ww:param name="'value0'">
                                <strong><ww:property value="./value/selectedIssues/size" /></strong>
                            </ww:param>
                            <ww:param name="'value1'">
                                <ww:iterator value="./value/issueTypeObjects" status="'status'">
                                    <ww:component name="'issuetype'" template="constanticon.jsp">
                                        <ww:param name="'contextPath'"><%= request.getContextPath() %></ww:param>
                                        <ww:param name="'iconurl'" value="./iconUrl" />
                                        <ww:param name="'alt'"><ww:property value="./name" /></ww:param>
                                    </ww:component> <strong><ww:property value="./name" /></strong><ww:if test="@status/last == false">, </ww:if>
                                </ww:iterator>
                            </ww:param>
                            <ww:param name="'value2'">
                                <ww:iterator value="./value/projectObjects" status="'status'">
                                    <strong><ww:property value="./name" /></strong><ww:if test="@status/last == false">, </ww:if>
                                </ww:iterator>
                            </ww:param>
                            <ww:param name="'value3'">
                                <ww:iterator value="./value/parentIssueKeys" status="'status'">
                                    <strong><ww:property value="." /></strong><ww:if test="@status/last == false">, </ww:if>
                                </ww:iterator>
                            </ww:param>
                        </ww:text>
                    </ww:if>
                    <ww:else>
                        <ww:text name="'bulk.migrate.confirm.subheading'">
                            <ww:param name="'value0'">
                                <strong><ww:property value="./value/selectedIssues/size()" /></strong>
                            </ww:param>
                            <ww:param name="'value1'">
                                <ww:iterator value="./value/issueTypeObjects" status="'status'">
                                    <ww:component name="'issuetype'" template="constanticon.jsp">
                                        <ww:param name="'contextPath'"><%= request.getContextPath() %></ww:param>
                                        <ww:param name="'iconurl'" value="./iconUrl" />
                                        <ww:param name="'alt'"><ww:property value="./name" /></ww:param>
                                    </ww:component> <strong><ww:property value="./name" /></strong><ww:if test="@status/last == false">, </ww:if>
                                </ww:iterator>
                            </ww:param>
                            <ww:param name="'value2'">
                                <ww:iterator value="./value/projectObjects" status="'status'">
                                    <strong><ww:property value="./name" /></strong><ww:if test="@status/last == false">, </ww:if>
                                </ww:iterator>
                            </ww:param>
                        </ww:text>
                    </ww:else>
                </p>
            </ui:param>
        </ui:soy>

        <ww:property value="./value">
            <%@include file="/secure/views/bulkedit/confirmationdetails.jsp"%>
        </ww:property>
    </div>
</div>
