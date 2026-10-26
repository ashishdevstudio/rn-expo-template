import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

import { AppInput, type AppInputProps } from './AppInput';

type ControlledAppInputProp =
  | 'defaultValue'
  | 'error'
  | 'onBlur'
  | 'onChange'
  | 'onChangeText'
  | 'value';

export type FormInputProps<TFieldValues extends FieldValues> = Omit<
  AppInputProps,
  ControlledAppInputProp
> & {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
};

export function FormInput<TFieldValues extends FieldValues>({
  control,
  name,
  ...inputProps
}: FormInputProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
        <AppInput
          {...inputProps}
          error={typeof error?.message === 'string' ? error.message : undefined}
          onBlur={onBlur}
          onChangeText={onChange}
          value={typeof value === 'string' ? value : ''}
        />
      )}
    />
  );
}
