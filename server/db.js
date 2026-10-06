import { supabase } from './supabase.js';

// Helper to mimic SQLite interface using Supabase
const db = {
  allAsync: async (sql, params = []) => {
    // 1. Handle "SELECT * FROM blogs"
    if (sql.includes('FROM blogs')) {
      let query = supabase.from('blogs').select('*');
      if (sql.includes('published = 1')) query = query.eq('published', true);
      if (sql.includes('ORDER BY id DESC')) query = query.order('id', { ascending: false });
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }

    // 2. Handle "SELECT * FROM resources"
    if (sql.includes('FROM resources')) {
      let query = supabase.from('resources').select('*');
      if (sql.includes('published = 1')) query = query.eq('published', true);
      if (sql.includes('ORDER BY')) query = query.order('level').order('subject').order('id', { ascending: false });
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }

    // 3. Handle "SELECT * FROM widgets"
    if (sql.includes('FROM widgets')) {
      let query = supabase.from('widgets').select('*');
      if (sql.includes('published = 1')) query = query.eq('published', true);
      if (sql.includes('ORDER BY position ASC')) query = query.order('position', { ascending: true });
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }

    // 4. Handle "SELECT * FROM settings"
    if (sql.includes('FROM settings')) {
      const { data, error } = await supabase.from('settings').select('*');
      if (error) throw error;
      return data;
    }

    throw new Error(`Unsupported SELECT query: ${sql}`);
  },

  getAsync: async (sql, params = []) => {
    // Handle "SELECT * FROM blogs WHERE slug = ?"
    if (sql.includes('FROM blogs WHERE slug = ?')) {
      const { data, error } = await supabase.from('blogs').select('*').eq('slug', params[0]).single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
    // Handle "SELECT id FROM resources WHERE url = ?"
    if (sql.includes('FROM resources WHERE url = ?')) {
      const { data, error } = await supabase.from('resources').select('id').eq('url', params[0]).single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
    return null;
  },

  runAsync: async (sql, params = []) => {
    // Handle INSERT into blogs
    if (sql.startsWith('INSERT INTO blogs')) {
      const payload = {
        title: params[0], slug: params[1], category: params[2], content: params[3],
        image: params[4], date: params[5], read_time: params[6], published: Boolean(params[7]),
        seo_title: params[8], seo_description: params[9], seo_keywords: params[10]
      };
      const { data, error } = await supabase.from('blogs').insert(payload).select('id').single();
      if (error) throw error;
      return { lastID: data.id };
    }

    // Handle UPDATE blogs
    if (sql.startsWith('UPDATE blogs')) {
      const payload = {
        title: params[0], slug: params[1], category: params[2], content: params[3],
        image: params[4], date: params[5], read_time: params[6], published: Boolean(params[7]),
        seo_title: params[8], seo_description: params[9], seo_keywords: params[10],
        updated_at: new Date().toISOString()
      };
      const id = params[11];
      const { error } = await supabase.from('blogs').update(payload).eq('id', id);
      if (error) throw error;
      return { changes: 1 };
    }

    // Handle DELETE blogs
    if (sql.startsWith('DELETE FROM blogs')) {
      const { error } = await supabase.from('blogs').delete().eq('id', params[0]);
      if (error) throw error;
      return { changes: 1 };
    }

    // Handle INSERT into resources
    if (sql.startsWith('INSERT INTO resources')) {
      const payload = {
        level: params[0], subject: params[1], resource_type: params[2], sub_type: params[3],
        title: params[4], description: params[5], url: params[6], published: Boolean(params[7])
      };
      const { data, error } = await supabase.from('resources').insert(payload).select('id').single();
      if (error) throw error;
      return { lastID: data.id };
    }

    // Handle UPDATE resources
    if (sql.startsWith('UPDATE resources')) {
      const payload = {
        level: params[0], subject: params[1], resource_type: params[2], sub_type: params[3],
        title: params[4], description: params[5], url: params[6], published: Boolean(params[7]),
        updated_at: new Date().toISOString()
      };
      const id = params[8];
      const { error } = await supabase.from('resources').update(payload).eq('id', id);
      if (error) throw error;
      return { changes: 1 };
    }

    // Handle DELETE resources
    if (sql.startsWith('DELETE FROM resources')) {
      const { error } = await supabase.from('resources').delete().eq('id', params[0]);
      if (error) throw error;
      return { changes: 1 };
    }

    // Handle INSERT OR REPLACE settings
    if (sql.includes('INSERT OR REPLACE INTO settings')) {
      const { error } = await supabase.from('settings').upsert({ key: params[0], value: params[1] });
      if (error) throw error;
      return { changes: 1 };
    }

    // Handle widgets
    if (sql.startsWith('INSERT INTO widgets')) {
       const payload = { title: params[0], image: params[1], link: params[2], position: params[3], published: Boolean(params[4]) };
       const { data, error } = await supabase.from('widgets').insert(payload).select('id').single();
       if (error) throw error;
       return { lastID: data.id };
    }
    if (sql.startsWith('UPDATE widgets')) {
       const payload = { title: params[0], image: params[1], link: params[2], position: params[3], published: Boolean(params[4]) };
       const { error } = await supabase.from('widgets').update(payload).eq('id', params[5]);
       if (error) throw error;
       return { changes: 1 };
    }
    if (sql.startsWith('DELETE FROM widgets')) {
       const { error } = await supabase.from('widgets').delete().eq('id', params[0]);
       if (error) throw error;
       return { changes: 1 };
    }

    return { changes: 0 };
  }
};

export default db;
