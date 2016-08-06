package com.example.plugins.tutorial.jira.customfields;

import com.atlassian.plugin.spring.scanner.annotation.component.Scanned;
import com.atlassian.plugin.spring.scanner.annotation.imports.ComponentImport;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.atlassian.jira.issue.customfields.impl.AbstractSingleFieldType;
import com.atlassian.jira.issue.customfields.impl.FieldValidationException;
import com.atlassian.jira.issue.customfields.manager.GenericConfigManager;
import com.atlassian.jira.issue.customfields.persistence.CustomFieldValuePersister;
import com.atlassian.jira.issue.customfields.persistence.PersistenceFieldType;

import java.math.BigDecimal;

//Fields can store single or multiple values. As far we want to store a single value, we extend from AbstractSingeFieldType
@Scanned
public class IntegerCustomField extends AbstractSingleFieldType<BigDecimal> {
    private static final Logger log = LoggerFactory.getLogger(IntegerCustomField.class);

    @ComponentImport private final CustomFieldValuePersister customFieldValuePersister;
    @ComponentImport private final GenericConfigManager genericConfigManager;
    @ComponentImport private final CustomFieldValuePersister customFieldValuePersister1;
    @ComponentImport private final GenericConfigManager genericConfigManager1;
    @ComponentImport private final CustomFieldValuePersister customFieldValuePersister11;
    @ComponentImport private final GenericConfigManager genericConfigManager11;

    public IntegerCustomField(CustomFieldValuePersister customFieldValuePersister,
                              GenericConfigManager genericConfigManager, CustomFieldValuePersister customFieldValuePersister1, GenericConfigManager genericConfigManager1, CustomFieldValuePersister customFieldValuePersister11, GenericConfigManager genericConfigManager11, CustomFieldValuePersister customFieldValuePersister111, GenericConfigManager genericConfigManager111) {
        super(customFieldValuePersister, genericConfigManager);
        this.customFieldValuePersister = customFieldValuePersister1;
        this.genericConfigManager = genericConfigManager1;
        this.customFieldValuePersister1 = customFieldValuePersister11;
        this.genericConfigManager1 = genericConfigManager11;
        this.customFieldValuePersister11 = customFieldValuePersister111;
        this.genericConfigManager11 = genericConfigManager111;
    }

    @Override
    protected PersistenceFieldType getDatabaseType()
    {
        return PersistenceFieldType.TYPE_LIMITED_TEXT;
    }

    @Override
    protected Object getDbValueFromObject(final BigDecimal customFieldObject)
    {
        return getStringFromSingularObject(customFieldObject);
    }

    @Override
    protected BigDecimal getObjectFromDbValue(final Object databaseValue)
            throws FieldValidationException
    {
        return getSingularObjectFromString((String) databaseValue);
    }

    @Override
    public String getStringFromSingularObject(final BigDecimal singularObject)
    {
        if (singularObject == null)
            return "";
        // format
        return singularObject.toString();
    }

    @Override
    public BigDecimal getSingularObjectFromString(final String string)
            throws FieldValidationException
    {
        if (string == null)
            return null;
        try
        {
            final BigDecimal decimal = new BigDecimal(string);
            // Check that we don't have too many decimal places
            if (decimal.scale() > 2)
            {
                throw new FieldValidationException(
                        "Maximum of 2 decimal places are allowed.");
            }
            return decimal.setScale(2);
        }
        catch (NumberFormatException ex)
        {
            throw new FieldValidationException("Not a valid number.");
        }
    }
}