import { createCrudApi } from './createCrudApi';
import type { NetworkContactRecord, NetworkTaskRecord } from '../types/networking';

const contactsApi = createCrudApi<NetworkContactRecord>('network_contacts');

export const getNetworkContacts = contactsApi.getAll;
export const createNetworkContact = contactsApi.create;
export const updateNetworkContact = contactsApi.update;
export const deleteNetworkContact = contactsApi.remove;

const tasksApi = createCrudApi<NetworkTaskRecord>('network_tasks');

export const getNetworkTasks = tasksApi.getAll;
export const createNetworkTask = tasksApi.create;
export const updateNetworkTask = tasksApi.update;
export const deleteNetworkTask = tasksApi.remove;
