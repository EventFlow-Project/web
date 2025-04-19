import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { PrivacySetting, UserPrivacySettings } from '../types/User';

interface PrivacySettingsProps {
  settings: UserPrivacySettings;
  onSettingsChange: (newSettings: UserPrivacySettings) => void;
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({
  settings,
  onSettingsChange,
}) => {
  const handleChange = (field: keyof UserPrivacySettings) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onSettingsChange({
      ...settings,
      [field]: event.target.value as PrivacySetting,
    });
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Настройки приватности
      </Typography>

      <FormControl component="fieldset" sx={{ mt: 2 }}>
        <FormLabel component="legend">Видимость мероприятий</FormLabel>
        <RadioGroup
          value={settings.eventsVisibility}
          onChange={handleChange('eventsVisibility')}
        >
          <FormControlLabel
            value={PrivacySetting.PUBLIC}
            control={<Radio />}
            label="Публично (видят все пользователи)"
          />
          <FormControlLabel
            value={PrivacySetting.FRIENDS_ONLY}
            control={<Radio />}
            label="Только для друзей"
          />
          <FormControlLabel
            value={PrivacySetting.PRIVATE}
            control={<Radio />}
            label="Приватно (вижу только я)"
          />
        </RadioGroup>
      </FormControl>

      <FormControl component="fieldset" sx={{ mt: 2 }}>
        <FormLabel component="legend">Видимость списка друзей</FormLabel>
        <RadioGroup
          value={settings.friendsListVisibility}
          onChange={handleChange('friendsListVisibility')}
        >
          <FormControlLabel
            value={PrivacySetting.PUBLIC}
            control={<Radio />}
            label="Публично (видят все пользователи)"
          />
          <FormControlLabel
            value={PrivacySetting.FRIENDS_ONLY}
            control={<Radio />}
            label="Только для друзей"
          />
          <FormControlLabel
            value={PrivacySetting.PRIVATE}
            control={<Radio />}
            label="Приватно (вижу только я)"
          />
        </RadioGroup>
      </FormControl>
    </Box>
  );
}; 