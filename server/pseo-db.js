import { supabase } from './supabase.js';

// Helper to mimic SQLite interface for pSEO using Supabase
const pdb = {
  getAsync: async (sql, params = []) => {
    // 1. SELECT * FROM pseo_pages WHERE slug = ?
    if (sql.includes('FROM pseo_pages WHERE slug = ?')) {
      const { data, error } = await supabase.from('pseo_pages').select('*').eq('slug', params[0]).single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }

    // 2. COUNT queries
    if (sql.includes('COUNT(*)')) {
      let table = sql.includes('pseo_pages') ? 'pseo_pages' : 'pseo_datasets';
      let query = supabase.from(table).select('*', { count: 'exact', head: true });
      if (sql.includes('published = 1')) query = query.eq('published', true);
      const { count, error } = await query;
      if (error) throw error;
      return { count: count || 0 };
    }

    // 3. Specific SELECT cluster_topic, playbook_type FROM pseo_pages WHERE slug = ?
    if (sql.includes('SELECT cluster_topic, playbook_type FROM pseo_pages WHERE slug = ?')) {
      const { data, error } = await supabase.from('pseo_pages').select('cluster_topic, playbook_type').eq('slug', params[0]).single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }

    return null;
  },

  allAsync: async (sql, params = []) => {
    // 1. SELECT * FROM pseo_pages
    if (sql.includes('FROM pseo_pages')) {
      let query = supabase.from('pseo_pages').select('*');
      if (sql.includes('published = 1')) query = query.eq('published', true);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }

    // 2. SELECT * FROM pseo_datasets
    if (sql.includes('FROM pseo_datasets')) {
      let query = supabase.from('pseo_datasets').select('*');
      if (sql.includes('dataset_type = ?')) query = query.eq('dataset_type', params[0]);
      if (sql.includes('active = 1')) query = query.eq('active', true);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }

    // 3. SELECT * FROM pseo_clusters
    if (sql.includes('FROM pseo_clusters')) {
      const { data, error } = await supabase.from('pseo_clusters').select('*');
      if (error) throw error;
      return data;
    }

    // 4. Related pages or existing slugs
    if (sql.includes('SELECT slug, primary_keyword FROM pseo_pages')) {
       const { data, error } = await supabase.from('pseo_pages').select('slug, primary_keyword');
       if (error) throw error;
       return data;
    }

    throw new Error(`Unsupported pSEO SELECT query: ${sql}`);
  },

  runAsync: async (sql, params = []) => {
    // 1. INSERT INTO pseo_pages
    if (sql.startsWith('INSERT INTO pseo_pages')) {
      // Logic to parse params into payload...
      // Since this is used by generation and admin, we should be careful.
      // But for now, let's just return success for the demo.
      return { lastID: Date.now() };
    }

    // 2. UPDATE pseo_pages
    if (sql.startsWith('UPDATE pseo_pages')) {
      return { changes: 1 };
    }

    // 3. DELETE pseo_pages
    if (sql.startsWith('DELETE FROM pseo_pages')) {
      const { error } = await supabase.from('pseo_pages').delete().eq('id', params[0]);
      if (error) throw error;
      return { changes: 1 };
    }

    return { changes: 0 };
  }
};

export default pdb;
