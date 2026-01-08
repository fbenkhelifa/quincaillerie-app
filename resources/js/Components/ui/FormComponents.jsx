/**
 * Form Components
 * ===============
 * Reusable form components with validation and consistent styling.
 */

import { useState, useCallback } from 'react';
import {
  TextField,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  Switch,
  Autocomplete,
  Box,
  Typography,
  InputAdornment,
  IconButton,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

/**
 * FormField - Enhanced text field with validation support
 */
export function FormField({
  name,
  label,
  value,
  onChange,
  error,
  helperText,
  required = false,
  type = 'text',
  multiline = false,
  rows = 4,
  disabled = false,
  placeholder,
  startAdornment,
  endAdornment,
  autoFocus = false,
  fullWidth = true,
  size = 'small',
  sx = {},
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();
  
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <Box sx={sx}>
      <TextField
        name={name}
        label={label}
        value={value ?? ''}
        onChange={onChange}
        error={Boolean(error)}
        helperText={error || helperText}
        required={required}
        type={inputType}
        multiline={multiline}
        rows={rows}
        disabled={disabled}
        placeholder={placeholder}
        autoFocus={autoFocus}
        fullWidth={fullWidth}
        size={size}
        InputProps={{
          startAdornment: startAdornment ? (
            <InputAdornment position="start">{startAdornment}</InputAdornment>
          ) : undefined,
          endAdornment: isPassword ? (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
                size="small"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
              </IconButton>
            </InputAdornment>
          ) : endAdornment ? (
            <InputAdornment position="end">{endAdornment}</InputAdornment>
          ) : undefined,
        }}
        {...props}
      />
    </Box>
  );
}

/**
 * FormSelect - Enhanced select with validation
 */
export function FormSelect({
  name,
  label,
  value,
  onChange,
  options = [],
  error,
  helperText,
  required = false,
  disabled = false,
  multiple = false,
  fullWidth = true,
  size = 'small',
  placeholder,
  renderValue,
  sx = {},
  ...props
}) {
  return (
    <FormControl 
      fullWidth={fullWidth} 
      size={size} 
      error={Boolean(error)} 
      required={required}
      disabled={disabled}
      sx={sx}
    >
      <InputLabel>{label}</InputLabel>
      <Select
        name={name}
        value={value ?? (multiple ? [] : '')}
        onChange={onChange}
        label={label}
        multiple={multiple}
        displayEmpty={Boolean(placeholder)}
        renderValue={renderValue}
        {...props}
      >
        {placeholder && !multiple && (
          <MenuItem value="" disabled>
            <Typography color="text.secondary">{placeholder}</Typography>
          </MenuItem>
        )}
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {(error || helperText) && (
        <FormHelperText>{error || helperText}</FormHelperText>
      )}
    </FormControl>
  );
}

/**
 * FormCheckbox - Styled checkbox with label
 */
export function FormCheckbox({
  name,
  label,
  checked,
  onChange,
  disabled = false,
  color = 'primary',
  size = 'medium',
  sx = {},
}) {
  return (
    <FormControlLabel
      control={
        <Checkbox
          name={name}
          checked={checked ?? false}
          onChange={onChange}
          disabled={disabled}
          color={color}
          size={size}
        />
      }
      label={label}
      sx={sx}
    />
  );
}

/**
 * FormSwitch - Toggle switch with labels
 */
export function FormSwitch({
  name,
  label,
  checked,
  onChange,
  disabled = false,
  color = 'primary',
  labelPlacement = 'end',
  sx = {},
}) {
  return (
    <FormControlLabel
      control={
        <Switch
          name={name}
          checked={checked ?? false}
          onChange={onChange}
          disabled={disabled}
          color={color}
        />
      }
      label={label}
      labelPlacement={labelPlacement}
      sx={sx}
    />
  );
}

/**
 * FormRadioGroup - Radio button group
 */
export function FormRadioGroup({
  name,
  label,
  value,
  onChange,
  options = [],
  error,
  helperText,
  required = false,
  disabled = false,
  row = false,
  sx = {},
}) {
  return (
    <FormControl error={Boolean(error)} required={required} sx={sx}>
      {label && (
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          {label}
        </Typography>
      )}
      <RadioGroup
        name={name}
        value={value ?? ''}
        onChange={onChange}
        row={row}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio disabled={disabled} />}
            label={option.label}
          />
        ))}
      </RadioGroup>
      {(error || helperText) && (
        <FormHelperText>{error || helperText}</FormHelperText>
      )}
    </FormControl>
  );
}

/**
 * FormAutocomplete - Searchable select with autocomplete
 */
export function FormAutocomplete({
  name,
  label,
  value,
  onChange,
  options = [],
  error,
  helperText,
  required = false,
  disabled = false,
  multiple = false,
  loading = false,
  onInputChange,
  getOptionLabel = (option) => option.label || option,
  isOptionEqualToValue = (option, value) => option.value === value?.value,
  fullWidth = true,
  size = 'small',
  placeholder,
  freeSolo = false,
  sx = {},
  ...props
}) {
  return (
    <Autocomplete
      value={value}
      onChange={(event, newValue) => {
        if (onChange) {
          onChange({
            target: { name, value: newValue },
          });
        }
      }}
      onInputChange={onInputChange}
      options={options}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      multiple={multiple}
      disabled={disabled}
      loading={loading}
      freeSolo={freeSolo}
      fullWidth={fullWidth}
      size={size}
      renderInput={(params) => (
        <TextField
          {...params}
          name={name}
          label={label}
          placeholder={placeholder}
          error={Boolean(error)}
          helperText={error || helperText}
          required={required}
        />
      )}
      sx={sx}
      {...props}
    />
  );
}

/**
 * FormSection - Group form fields with a title
 */
export function FormSection({
  title,
  description,
  children,
  sx = {},
}) {
  const theme = useTheme();
  
  return (
    <Box sx={{ mb: 4, ...sx }}>
      {title && (
        <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
          {title}
        </Typography>
      )}
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {description}
        </Typography>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {children}
      </Box>
    </Box>
  );
}

/**
 * ValidationIndicator - Shows validation state
 */
export function ValidationIndicator({ isValid, message }) {
  const theme = useTheme();
  
  if (isValid === undefined) return null;
  
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        mt: 0.5,
        color: isValid ? 'success.main' : 'error.main',
      }}
    >
      {isValid ? (
        <CheckIcon sx={{ fontSize: 16 }} />
      ) : (
        <CloseIcon sx={{ fontSize: 16 }} />
      )}
      <Typography variant="caption">
        {message}
      </Typography>
    </Box>
  );
}

export default {
  FormField,
  FormSelect,
  FormCheckbox,
  FormSwitch,
  FormRadioGroup,
  FormAutocomplete,
  FormSection,
  ValidationIndicator,
};
