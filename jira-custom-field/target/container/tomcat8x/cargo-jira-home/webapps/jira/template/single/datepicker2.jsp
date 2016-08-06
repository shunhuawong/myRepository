<%@ page import="java.util.Calendar" %>
<%@ page import="java.util.Locale" %>
<%@ page import="com.atlassian.jira.component.ComponentAccessor" %>
<%@ page import="com.atlassian.jira.config.properties.APKeys" %>
<%@ page import="com.atlassian.jira.config.properties.ApplicationProperties" %>
<%@ page import="com.atlassian.jira.web.action.util.CalendarResourceIncluder" %>
<%--
  -- WebWork, Web Application Framework
  --
  -- Distributable under LGPL license.
  -- See terms of license at opensource.org
  --
  --
  -- textlabel.jsp
  --
  -- Required Parameters:
  --   * label      - The description that will be used to identfy the control.
  --   * name       - The name of the attribute to put and pull the result from.
  --
  -- Optional Parameters:
  --   * labelposition   - determines were the label will be place in relation
  --                       to the control.  Default is to the left of the control.
  --
  --%>
<%@ taglib uri="webwork" prefix="ww" %>
<jsp:include page="/template/single/controlheader.jsp" />
<input id='date_<ww:property value="parameters['name']"/>' type="text"
       name="<ww:property value="parameters['name']"/>"
      <ww:property value="parameters['size']">
         <ww:if test=".">size="<ww:property value="."/>"</ww:if>
      </ww:property>
      <ww:property value="parameters['maxlength']">
         <ww:if test=".">maxlength="<ww:property value="."/>"</ww:if>
      </ww:property>
      <ww:property value="parameters['nameValue']">
         <ww:if test=".">value="<ww:property value="."/>"</ww:if>
      </ww:property>
      <ww:property value="parameters['disabled']">
         <ww:if test="{parameters['disabled']}">DISABLED</ww:if>
      </ww:property>
      <ww:property value="parameters['readonly']">
         <ww:if test="{parameters['readonly']}">READONLY</ww:if>
      </ww:property>
      <ww:property value="parameters['onkeyup']">
         <ww:if test=".">onkeyup="<ww:property value="."/>"</ww:if>
      </ww:property>
      <ww:property value="parameters['tabindex']">
         <ww:if test=".">tabindex="<ww:property value="."/>"</ww:if>
      </ww:property>
      <ww:property value="parameters['onchange']">
         <ww:if test=".">onchange="<ww:property value="."/>"</ww:if>
      </ww:property>
      <ww:property value="parameters['onfocus']">
         <ww:if test=".">onfocus="<ww:property value="."/>"</ww:if>
      </ww:property>
      <ww:property value="parameters['style']">
         <ww:if test=".">style="<ww:property value="."/>"</ww:if>
      </ww:property>
      <ww:property value="parameters['class']">
         <ww:if test=".">class="<ww:property value="."/>"</ww:if>
      </ww:property>
>
<%
    final ApplicationProperties appProperties = ComponentAccessor.getApplicationProperties();
    final Locale locale = ComponentAccessor.getJiraAuthenticationContext().getI18nHelper().getLocale();
    final CalendarResourceIncluder calendarResourceIncluder = new CalendarResourceIncluder();
    calendarResourceIncluder.includeForLocale(locale);
%>
<span id="<ww:property value="parameters['name']"/>_trigger_c" class="icon-default aui-icon aui-icon-small aui-iconfont-calendar" title="<ww:text name="'date.picker.select.date'"/>"></span>
<script type="text/javascript">
    Calendar.setup({
        firstDay     : <%= Calendar.getInstance(locale).getFirstDayOfWeek()-1 %>,                  // first day of the week
        inputField   : "date_<ww:property value="parameters['name']"/>",     // id of the input field
        button       : "<ww:property value="parameters['name']"/>_trigger_c",  // trigger for the calendar (button ID)
        align        : "Tl",           // alignment (defaults to "Bl")
        date         : "<ww:property value="/currentDateTimeInUsersTimezone"/>",
        todayDate    : "<ww:property value="/currentDateTimeInUsersTimezone"/>",
        singleClick  : true,
        ifFormat     : "<ww:property value="/dateFormat"/>"      // our date only format
        useISO8601WeekNumbers   : <%= appProperties.getOption(APKeys.JIRA_DATE_TIME_PICKER_USE_ISO8601) %> // use ISO8601 date/time standard
    });
</script>

<jsp:include page="/template/single/controlfooter.jsp" />
