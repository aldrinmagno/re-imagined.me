import { getSupabaseClient } from './supabaseClient';

type BaseRecord = { id: string; updated_at: string; user_id: string };

type CreatePayload<T extends BaseRecord> = Omit<T, 'id' | 'updated_at' | 'user_id'>;
type UpdatePayload<T extends BaseRecord> = Partial<CreatePayload<T>>;

export interface CrudApi<T extends BaseRecord> {
  getAll: (userId: string) => Promise<T[]>;
  create: (userId: string, payload: CreatePayload<T>) => Promise<T>;
  update: (userId: string, id: string, payload: UpdatePayload<T>) => Promise<T>;
  remove: (userId: string, id: string) => Promise<void>;
}

export function createCrudApi<T extends BaseRecord>(table: string): CrudApi<T> {
  return {
    async getAll(userId) {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .returns<T[]>();

      if (error) throw new Error(error.message);
      return data ?? [];
    },

    async create(userId, payload) {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(table)
        .insert({ ...payload, user_id: userId })
        .select('*')
        .single<T>();

      if (error) throw new Error(error.message);
      return data;
    },

    async update(userId, id, payload) {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(table)
        .update(payload)
        .eq('id', id)
        .eq('user_id', userId)
        .select('*')
        .single<T>();

      if (error) throw new Error(error.message);
      return data;
    },

    async remove(userId, id) {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from(table).delete().eq('id', id).eq('user_id', userId);

      if (error) throw new Error(error.message);
    }
  };
}
