import { createCrudApi } from './createCrudApi';
import type { ApplicationRecord } from '../types/applications';

const api = createCrudApi<ApplicationRecord>('applications');

export const getApplications = api.getAll;
export const createApplication = api.create;
export const updateApplication = api.update;
export const deleteApplication = api.remove;
