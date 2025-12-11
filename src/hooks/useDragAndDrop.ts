"use client";

import { useSensors, useSensor, PointerSensor, KeyboardSensor, defaultKeyboardCoordinateGetter } from '@dnd-kit/core';

export function useDragAndDrop() {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: defaultKeyboardCoordinateGetter,
    })
  );

  return { sensors };
}