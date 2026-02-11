import { createCrudApi } from './createCrudApi';
import type { CvVersionRecord } from '../types/cvVersions';

const api = createCrudApi<CvVersionRecord>('cv_versions');

export const getCvVersions = api.getAll;
export const createCvVersion = api.create;
export const updateCvVersion = api.update;
export const deleteCvVersion = api.remove;
