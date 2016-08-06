<%@ taglib uri="webwork" prefix="ww" %>
<ww:property value="parameters['nameValue']">
<ww:if test=". == null">
    <td><span class="note"><ww:text name="'common.concepts.noissues'"/></span></td>
</ww:if>
<ww:else>
    <ww:iterator value="rows">
        <ww:if test="../percentage(.) != 0" >
            <td class="p_graph" width="<ww:property value="../percentage(.)" />" bgcolor="<ww:property value="color" />" >
                <ww:if test="./statuses">
                    <a href="<ww:url value="'/issues/'" atltoken="false"><ww:param name="'jql'" value="'project='+string('project')+' AND fixVersion='+string('name')+' AND status in (' + /statuses + ')'"/></ww:url>"
                        title="<ww:text name="'percentagegraph.title'">
                                  <ww:param name="'value0'"><ww:property value="description" /></ww:param>
                                  <ww:param name="'value1'"><ww:property value="../percentage(.)" /></ww:param>
                                  <ww:param name="'value2'"><ww:property value="number" /></ww:param>
                              </ww:text>" >
                    <img src="<%= request.getContextPath() %>/images/border/spacer.gif" alt="" class="hideOnPrint"
                         width="<ww:property value="../percentage(.)" />" 
                        title="<ww:text name="'percentagegraph.title'">
                                  <ww:param name="'value0'"><ww:property value="description" /></ww:param>
                                  <ww:param name="'value1'"><ww:property value="../percentage(.)" /></ww:param>
                                  <ww:param name="'value2'"><ww:property value="number" /></ww:param>
                              </ww:text>"></a>
                </ww:if>
                <ww:else>
                    <img src="<%= request.getContextPath() %>/images/border/spacer.gif" alt="" class="hideOnPrint"
                         width="<ww:property value="../percentage(.)" />"
                        title="<ww:text name="'percentagegraph.title'">
                                  <ww:param name="'value0'"><ww:property value="description" /></ww:param>
                                  <ww:param name="'value1'"><ww:property value="../percentage(.)" /></ww:param>
                                  <ww:param name="'value2'"><ww:property value="number" /></ww:param>
                              </ww:text>" >
                </ww:else>
            </td>
        </ww:if>
    </ww:iterator>
</ww:else>
</ww:property>
