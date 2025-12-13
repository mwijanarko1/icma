"use client";

import { useState } from "react";
import BasicDropdown from "@/components/ui/BasicDropdown";

export type NarratorRank = 'sahaba' | 'thiqah' | 'daif' | 'all';

export interface NarratorPresetSearchProps {
  onPresetSearch: (criteria: { query?: string; ranks?: string[]; narratorRanks?: string[]; placesOfResidence?: string[]; isSearchAll?: boolean }) => void;
  activeCriteria?: { ranks?: string[]; narratorRanks?: string[]; placesOfResidence?: string[] };
  className?: string;
}

const RANK_PRESETS = [
  { value: 'sahaba' as const, label: 'Sahaba', description: 'Companions of Prophet Muhammad (صحابي/صحبة)' },
  { value: 'thiqah' as const, label: 'Thiqah', description: 'Reliable narrators (ثقة)' },
  { value: 'saduq' as const, label: 'Saduq', description: 'Truthful narrators (صدوق)' },
  { value: 'daif' as const, label: 'Daif', description: 'Weak narrators (ضعيف)' }
];

const RANKS = [
  { id: '', label: 'All Ranks' },
  { id: 'صحابية|صحابية مشهورة|صحابي|صحابي مشهور|له رؤية', label: 'Sahabah' },
  { id: 'صحابي، وقيل: لا صحبة له|كأنه صحابي، ولم أره مسمى|قيل: له رؤية', label: 'Disputed Sahabah' },
  { id: 'من كبار الثالثة|الثالثة', label: 'Third Generation' },
  { id: 'الرابعة', label: 'Fourth Generation' },
  { id: 'الخامسة', label: 'Fifth Generation' },
  { id: 'السادسة', label: 'Sixth Generation' },
  { id: 'من كبار السابعة|السابعة', label: 'Seventh Generation' },
  { id: 'الثامنة', label: 'Eighth Generation' },
  { id: 'التاسعة', label: 'Ninth Generation' },
  { id: 'العاشرة', label: 'Tenth Generation' },
  { id: 'الحادية عشرة', label: 'Eleventh Generation' },
];

const PLACE_OPTIONS = [
  { id: '', label: 'All Places' },
  { id: 'مكة|الطائف', label: 'Mecca Region' },
  { id: 'المدينة|العرج، الفرع مكان بنواحي المدينة', label: 'Medina Region' },
  { id: 'بغداد|الكوفة|واسط|البصرة|المصيصة', label: 'Iraq Region' },
  { id: 'دمشق|الشام', label: 'Syria Region' },
  { id: 'مصر', label: 'Egypt' },
  { id: 'نيسابور|هراة|مرو', label: 'Khorasan Region' },
  { id: 'سمرقند|الشاش', label: 'Transoxiana Region' },
  { id: 'بيت المقدس|الرملة|عسقلان', label: 'Palestine Region' },
  { id: 'طرسوس', label: 'Tarsus' },
  { id: 'صنعاء', label: 'Sana\'a' },
  { id: 'الشجرة بذي الحليفة', label: 'al-Shajara' },
  { id: 'العرج', label: 'al-Arj' },
  { id: 'الربذة', label: 'al-Rabatha' },
  { id: 'الثغور', label: 'al-Thughur' },
  { id: 'عين زربة', label: 'Ayn Zarba' },
  { id: 'الأزد', label: 'Azd' },
];

export function NarratorPresetSearch({
  onPresetSearch,
  activeCriteria = { ranks: [], narratorRanks: [], placesOfResidence: [] },
  className = ""
}: NarratorPresetSearchProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Quick Search Presets */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
          Quick Search
        </label>
        <p className="text-xs" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.6 }}>
          Click any button below to search for narrators with specific criteria
        </p>
      </div>

      {/* Reliability Presets */}
      <div className="space-y-2">
        <label className="block text-xs font-medium" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
          By Reliability
        </label>
        <div className="flex flex-wrap gap-2">
          {RANK_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => {
                const currentRanks = activeCriteria.ranks || [];
                const isActive = currentRanks.includes(preset.value);
                const newRanks = isActive
                  ? currentRanks.filter(r => r !== preset.value)
                  : [...currentRanks, preset.value];
                onPresetSearch({ ranks: newRanks });
              }}
              className={`px-4 py-2 text-sm rounded-lg border-2 transition-all hover:shadow-md cursor-pointer ${
                (activeCriteria.ranks || []).includes(preset.value)
                  ? 'border-black bg-black text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400'
              }`}
              style={{ fontFamily: 'var(--font-content)' }}
              title={preset.description}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rank Presets */}
      <div className="space-y-2">
        <label className="block text-xs font-medium" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
          By Rank
        </label>
        <div className="flex flex-wrap gap-2">
          {RANKS.slice(1).map((rank) => (
            <button
              key={rank.id}
              onClick={() => {
                const rankId = rank.id.toString();
                const currentNarratorRanks = activeCriteria.narratorRanks || [];
                const isActive = currentNarratorRanks.includes(rankId);
                const newNarratorRanks = isActive
                  ? currentNarratorRanks.filter(r => r !== rankId)
                  : [...currentNarratorRanks, rankId];
                onPresetSearch({ narratorRanks: newNarratorRanks });
              }}
              className={`px-4 py-2 text-sm rounded-lg border-2 transition-all cursor-pointer ${
                (activeCriteria.narratorRanks || []).includes(rank.id.toString())
                  ? 'border-black bg-black text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400'
              }`}
              style={{ fontFamily: 'var(--font-content)' }}
              title={`Search for narrators in ${rank.label}`}
            >
              {rank.label}
            </button>
          ))}
        </div>
      </div>

      {/* Place of Residence Presets */}
      <div className="space-y-2">
        <label className="block text-xs font-medium" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
          By Place of Residence
        </label>
        <div className="flex flex-wrap gap-2">
          {PLACE_OPTIONS.slice(1).map((place) => (
            <button
              key={place.id}
              onClick={() => {
                const placeId = place.id.toString();
                const currentPlacesOfResidence = activeCriteria.placesOfResidence || [];
                const isActive = currentPlacesOfResidence.includes(placeId);
                const newPlacesOfResidence = isActive
                  ? currentPlacesOfResidence.filter(p => p !== placeId)
                  : [...currentPlacesOfResidence, placeId];
                onPresetSearch({ placesOfResidence: newPlacesOfResidence });
              }}
              className={`px-4 py-2 text-sm rounded-lg border-2 transition-all cursor-pointer ${
                (activeCriteria.placesOfResidence || []).includes(place.id.toString())
                  ? 'border-black bg-black text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400'
              }`}
              style={{ fontFamily: 'var(--font-content)' }}
              title={`Search for narrators from ${place.label}`}
            >
              {place.label}
            </button>
          ))}
        </div>
      </div>

      {/* General Search Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={() => onPresetSearch({ query: '*', isSearchAll: true })}
          className="px-6 py-3 text-sm font-medium rounded-lg border-2 border-black bg-black text-white hover:bg-gray-800 transition-all cursor-pointer"
          style={{ fontFamily: 'var(--font-content)' }}
          title="Search for the first 100 narrators"
        >
          Search All Narrators
        </button>
      </div>
    </div>
  );
}