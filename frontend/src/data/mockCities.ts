import { City } from '../types';


export const mockCities: City[] = [
{ id: 'lisbon', name: 'Лиссабон', country: 'Португалия', lat: 38.7223, lng: -9.1393, avgDailyCost: 95,
mockBudget: { flights: 40, lodging: 30, food: 15, local: 10, buffer: 5 }, image: '' },
{ id: 'istanbul', name: 'Стамбул', country: 'Турция', lat: 41.0082, lng: 28.9784, avgDailyCost: 70,
mockBudget: { flights: 35, lodging: 25, food: 20, local: 10, buffer: 10 }, image: '' },
{ id: 'tbilisi', name: 'Тбилиси', country: 'Грузия', lat: 41.7151, lng: 44.8271, avgDailyCost: 60,
mockBudget: { flights: 30, lodging: 30, food: 20, local: 10, buffer: 10 }, image: '' },
{ id: 'riga', name: 'Рига', country: 'Латвия', lat: 56.9496, lng: 24.1052, avgDailyCost: 80,
mockBudget: { flights: 30, lodging: 35, food: 20, local: 10, buffer: 5 }, image: '' },
{ id: 'yerevan', name: 'Ереван', country: 'Армения', lat: 40.1792, lng: 44.4991, avgDailyCost: 55,
mockBudget: { flights: 35, lodging: 25, food: 20, local: 10, buffer: 10 }, image: '' },
];