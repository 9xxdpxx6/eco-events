// Импорты всех доступных заглушек
import wateringCan from '../assets/img-plugs/events/watering-can.png';
import windmill from '../assets/img-plugs/events/windmill.png';
import recycle from '../assets/img-plugs/events/trash-truck.png';
import handPlant from '../assets/img-plugs/events/hand-plant.png';
import leaf from '../assets/img-plugs/events/leaf.png';

// Массив всех заглушек
const eventPlaceholders = [
  wateringCan,
  windmill,
  recycle,
  handPlant,
  leaf,
];

/**
 * Возвращает случайную заглушку для события
 * Можно передать eventId для получения стабильной картинки для конкретного события
 */
export const getRandomEventImage = (eventId?: number | string): string => {
  if (eventId) {
    // Если передан ID события, используем его для стабильного выбора картинки
    const hash = typeof eventId === 'string' ? eventId.length : eventId;
    return eventPlaceholders[hash % eventPlaceholders.length];
  }
  
  // Иначе возвращаем случайную картинку
  const randomIndex = Math.floor(Math.random() * eventPlaceholders.length);
  return eventPlaceholders[randomIndex];
};

/**
 * Возвращает стабильную заглушку для события на основе его ID
 * Одно и то же событие всегда будет иметь одну и ту же картинку
 */
export const getEventPlaceholder = (eventId: number | string): string => {
  const hash = typeof eventId === 'string' ? eventId.length : eventId;
  return eventPlaceholders[hash % eventPlaceholders.length];
}; 