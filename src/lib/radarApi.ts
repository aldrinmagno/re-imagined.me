import { createCrudApi } from './createCrudApi';
import type { RadarItemRecord } from '../types/radar';

const api = createCrudApi<RadarItemRecord>('radar_items');

export const getRadarItems = api.getAll;
export const createRadarItem = api.create;
export const updateRadarItem = api.update;
export const deleteRadarItem = api.remove;
