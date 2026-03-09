/**
 * Field - Universal field router
 * Reads field type and delegates to the appropriate field component
 */

import type { JSX } from 'react';
import type { FieldConfig } from '../../models/FieldConfig';
import { FieldType } from '../../core/types';
import { isFieldVisible } from '../../core/conditional';
import { useFormKitContext } from '../context/FormKitContext';
import TextField from './TextField';
import PasswordField from './PasswordField';
import TextareaField from './TextareaField';
import SelectField from './SelectField';
import CheckboxField from './CheckboxField';
import RadioGroupField from './RadioGroupField';
import SwitchField from './SwitchField';
import DateField from './DateField';
import FileField from './FileField';
import PhoneField from './PhoneField';
import SliderField from './SliderField';
import RangeSliderField from './RangeSliderField';
import OTPField from './OTPField';
import TagsField from './TagsField';
import RatingField from './RatingField';
import TimeField from './TimeField';
import ArrayField from './ArrayField';

/**
 * Props for Field component
 */
type Props = {
  /** Field configuration */
  config: FieldConfig;
};

/**
 * Universal field router — reads type from config and renders the appropriate field
 * Handles conditional visibility via showWhen/hideWhen
 *
 * @internal — use DynamicForm, not Field directly
 */
export default function Field({ config }: Props): JSX.Element | null {
  const { getValues } = useFormKitContext();

  // Check conditional visibility
  const values = getValues();
  const visible = isFieldVisible(config.showWhen, config.hideWhen, values);

  if (!visible) {
    return null;
  }

  // Column span class
  const colSpanClass = config.colSpan ? `col-span-${config.colSpan}` : '';
  const wrapperClass = `formkit-field ${colSpanClass} ${config.className ?? ''}`.trim();

  // Route to appropriate field component based on type
  const renderField = (): JSX.Element => {
    switch (config.type) {
      case FieldType.TEXT:
      case FieldType.EMAIL:
      case FieldType.NUMBER:
        return <TextField config={config} />;

      case FieldType.PASSWORD:
        return <PasswordField config={config} />;

      case FieldType.TEXTAREA:
        return <TextareaField config={config} />;

      case FieldType.SELECT:
        return <SelectField config={config} />;

      case FieldType.MULTI_SELECT:
        // TODO: Implement MultiSelectField
        return <SelectField config={config} />;

      case FieldType.CHECKBOX:
        return <CheckboxField config={config} />;

      case FieldType.RADIO:
        return <RadioGroupField config={config} />;

      case FieldType.SWITCH:
        return <SwitchField config={config} />;

      case FieldType.DATE:
        return <DateField config={config} />;

      case FieldType.PHONE:
        return <PhoneField config={config} />;

      case FieldType.FILE:
        return <FileField config={config} />;

      case FieldType.SLIDER:
        return <SliderField config={config} />;

      case FieldType.RANGE_SLIDER:
        return <RangeSliderField config={config} />;

      case FieldType.OTP:
        return <OTPField config={config} />;

      case FieldType.TAGS:
        return <TagsField config={config} />;

      case FieldType.RATING:
        return <RatingField config={config} />;

      case FieldType.TIME:
        return <TimeField config={config} />;

      case FieldType.ARRAY:
        return <ArrayField config={config} />;

      default:
        // Fallback to text field
        return <TextField config={config} />;
    }
  };

  return <div className={wrapperClass}>{renderField()}</div>;
}

export type { Props as FieldProps };
