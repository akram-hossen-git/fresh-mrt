'use client';

import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { ChoiceOption } from '@/lib/types';

interface ColorOption {
  name: string;
  code: string;
}

export interface VariantSelection {
  /** Backend-format variant string, e.g. "Red-L". */
  variantString: string;
  /** Selected color hex code (with leading #), or '' when no colors. */
  colorCode: string;
  /** Selected choice-option values in order, e.g. ["L", "Cotton"]. */
  choiceValues: string[];
}

interface VariantSelectorProps {
  colors: ColorOption[];
  choiceOptions: ChoiceOption[];
  onVariantChange: (selection: VariantSelection) => void;
}

export default function VariantSelector({
  colors,
  choiceOptions,
  onVariantChange,
}: VariantSelectorProps) {
  const [selectedColor, setSelectedColor] = useState<ColorOption>(colors[0] ?? { name: '', code: '' });
  const [selectedChoices, setSelectedChoices] = useState<Record<number, string>>(
    () => {
      const initial: Record<number, string> = {};
      choiceOptions.forEach((choice) => {
        if (choice.options.length > 0) {
          initial[choice.name] = choice.options[0];
        }
      });
      return initial;
    }
  );

  const buildSelection = useCallback(
    (color: ColorOption, choices: Record<number, string>): VariantSelection => {
      const choiceValues: string[] = [];
      choiceOptions.forEach((choice) => {
        const value = choices[choice.name];
        if (value) {
          choiceValues.push(value);
        }
      });
      // Backend variant key: color name + choice values, spaces stripped, joined by '-'.
      const parts = color.name ? [color.name] : [];
      choiceValues.forEach((v) => parts.push(v));
      const variantString = parts.map((p) => p.replace(/\s/g, '')).join('-');
      return {
        variantString,
        colorCode: color.code || '',
        choiceValues,
      };
    },
    [choiceOptions]
  );

  useEffect(() => {
    onVariantChange(buildSelection(selectedColor, selectedChoices));
  }, [selectedColor, selectedChoices, buildSelection, onVariantChange]);

  const handleColorSelect = (color: ColorOption) => {
    setSelectedColor(color);
  };

  const handleChoiceSelect = (choiceName: number, option: string) => {
    setSelectedChoices((prev) => ({
      ...prev,
      [choiceName]: option,
    }));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Color Swatches */}
      {colors.length > 0 && (
        <div>
          <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Select Color
          </label>
          <div className="flex flex-wrap items-center gap-3">
            {colors.map((color) => {
              const isSelected = selectedColor.name === color.name;
              return (
                <button
                  key={color.code}
                  type="button"
                  aria-label={`Select color ${color.name}`}
                  aria-pressed={isSelected}
                  onClick={() => handleColorSelect(color)}
                  className={cn(
                    'h-9 w-9 rounded-full border border-gray-200 transition-all duration-300 dark:border-gray-600',
                    'hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
                    isSelected && 'ring-2 ring-black ring-offset-2 dark:ring-white dark:ring-offset-gray-900'
                  )}
                  style={{ backgroundColor: color.code }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Choice Options (e.g., Size, Material) */}
      {choiceOptions.map((choice) => (
        <div key={choice.name}>
          <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Select {choice.title}
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {choice.options.map((option) => {
              const isSelected = selectedChoices[choice.name] === option;
              return (
                <button
                  key={option}
                  type="button"
                  aria-label={`Select ${choice.title} ${option}`}
                  aria-pressed={isSelected}
                  onClick={() => handleChoiceSelect(choice.name, option)}
                  className={cn(
                    'rounded-[8px] border px-4 py-2 text-sm font-medium transition-all duration-300',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
                    isSelected
                      ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-700'
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
