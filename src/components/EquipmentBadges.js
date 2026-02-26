import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Composant réutilisable pour afficher les badges d'équipement
 * Élimine la duplication de 14+ lignes identiques
 */
export default function EquipmentBadges({ equipment }) {
  const { t } = useTranslation();

  if (!equipment || !Object.values(equipment).some(v => v === true)) {
    return null;
  }

  const equipmentList = [
    { key: 'doubleBed', emoji: '🛏️', label: 'double_bed' },
    { key: 'fridge', emoji: '🧊', label: 'fridge' },
    { key: 'gasStove', emoji: '🔥', label: 'gas_stove' },
    { key: 'sink', emoji: '🚰', label: 'sink' },
    { key: 'toilet', emoji: '🚽', label: 'toilet' },
    { key: 'solarPanel', emoji: '☀️', label: 'solar_panel' },
    { key: 'leisureBattery', emoji: '🔋', label: 'leisure_battery' },
    { key: 'heater', emoji: '🌡️', label: 'heater' },
    { key: 'hotWater', emoji: '♨️', label: 'boiler' },
    { key: 'outdoorShower', emoji: '🚿', label: 'outdoor_shower' },
    { key: 'indoorShower', emoji: '🛁', label: 'indoor_shower' },
    { key: 'awning', emoji: '⛺', label: 'awning' },
    { key: 'reverseCamera', emoji: '📷', label: 'reverse_camera' },
    { key: 'bluetooth', emoji: '📊', label: 'bluetooth' },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {equipmentList.map(item => (
        equipment[item.key] && (
          <div
            key={item.key}
            className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg text-sm"
          >
            {item.emoji} {t(`equipment.${item.label}`)}
          </div>
        )
      ))}
    </div>
  );
}
