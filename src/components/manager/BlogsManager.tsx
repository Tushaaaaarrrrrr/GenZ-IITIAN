import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit, Trash2, Save, X, Loader2, Eye, EyeOff, ExternalLink, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { BlogPost } from '../../data/blogsData';

type BlogRow = Partial<BlogPost> & { id?: number };

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const emptyBlog: BlogRow = {
  title: '',
  slug: '',
  category: 'General',
  content: '',
  image: '',
  date: '',
  read_time: '5 min read',
  published: 1,
  seo_title: '',
  seo_description: '',
  seo_keywords: '',
};

const todayLabel = () =>
  new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

/**
 * Blogs admin — lives inside the Manager panel. Full CRUD against the
 * Supabase `blogs` table (see blogs-schema.sql). Resources/Notes stay on the
 * server admin; this only manages blog posts.
 */
export default function BlogsManager() {
  const [blogs, setBlogs] = useState<BlogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<BlogRow | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBlogs = async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) console.error('Failed to load blogs:', err.message);
    setBlogs(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const openCreate = () => {
    setError(null);
    setSlugTouched(false);
    setEditing({ ...emptyBlog, date: todayLabel() });
  };

  const openEdit = (blog: BlogRow) => {
    setError(null);
    setSlugTouched(true); // never auto-overwrite an existing slug
    setEditing({ ...blog });
  };

  const setField = (key: keyof BlogRow, value: string | number) => {
    setEditing((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const onTitleChange = (value: string) => {
    setEditing((prev) => {
      if (!prev) return prev;
      const next = { ...prev, title: value };
      if (!slugTouched) next.slug = slugify(value);
      return next;
    });
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.title?.trim()) { setError('Title is required.'); return; }
    const slug = (editing.slug?.trim() || slugify(editing.title)).trim();
    if (!slug) { setError('A valid slug is required.'); return; }

    setSaving(true);
    setError(null);

    const payload = {
      title: editing.title.trim(),
      slug,
      category: editing.category?.trim() || 'General',
      content: editing.content || '',
      image: editing.image?.trim() || '',
      date: editing.date?.trim() || todayLabel(),
      read_time: editing.read_time?.trim() || '5 min read',
      published: Number(editing.published) ? 1 : 0,
      seo_title: editing.seo_title?.trim() || null,
      seo_description: editing.seo_description?.trim() || null,
      seo_keywords: editing.seo_keywords?.trim() || null,
    };

    let err;
    if (editing.id) {
      ({ error: err } = await supabase.from('blogs').update(payload).eq('id', editing.id));
    } else {
      ({ error: err } = await supabase.from('blogs').insert(payload));
    }

    setSaving(false);

    if (err) {
      setError(
        err.code === '23505'
          ? 'That slug is already used by another post. Pick a unique slug.'
          : err.message,
      );
      return;
    }

    setEditing(null);
    fetchBlogs();
  };

  const handleDelete = async (blog: BlogRow) => {
    if (!blog.id) return;
    const { error: err } = await supabase.from('blogs').delete().eq('id', blog.id);
    if (err) {
      alert('Failed to delete blog: ' + err.message);
    }
    fetchBlogs();
  };

  const filtered = blogs.filter((b) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (b.title || '').toLowerCase().includes(q) || (b.category || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-8">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="bg-white border-[4px] border-[#0b1120] rounded-[2rem] px-4 py-3 flex gap-3 items-center shadow-[6px_6px_0px_#0b1120] flex-grow">
          <Search className="w-5 h-5 text-gray-400 shrink-0 ml-1" />
          <input
            type="text"
            placeholder="Search blogs by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full font-black outline-none text-base text-[#0b1120] placeholder:text-gray-300"
          />
        </div>
        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-[#10b981] text-[#0b1120] rounded-2xl font-black border-[3px] border-[#0b1120] shadow-[6px_6px_0px_#0b1120] hover:translate-y-1 hover:shadow-none transition-all shrink-0"
        >
          <Plus className="w-6 h-6" /> Create Blog
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-24 text-gray-300 animate-pulse font-black text-2xl uppercase tracking-widest">
          Loading Blogs...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border-[4px] border-dashed border-gray-200 rounded-[2rem] p-16 text-center">
          <h3 className="text-2xl font-black text-[#0b1120] mb-2">No blogs yet</h3>
          <p className="text-gray-500 font-bold">Click “Create Blog” to publish your first post. New posts use the same card UI as the public Blog page.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((blog) => (
            <div
              key={blog.id}
              className="bg-white border-[4px] border-[#0b1120] rounded-[2rem] overflow-hidden shadow-[8px_8px_0px_#0b1120] flex flex-col"
            >
              <div className="relative aspect-video bg-[#0b1120] border-b-[4px] border-[#0b1120]">
                {blog.image ? (
                  <img src={blog.image} alt={blog.title} className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 font-black">No thumbnail</div>
                )}
                <span className="absolute top-3 left-3 px-3 py-1 bg-white text-[#0b1120] font-black text-xs rounded-full border-2 border-[#0b1120]">
                  {blog.category}
                </span>
                <span
                  className={`absolute top-3 right-3 px-3 py-1 font-black text-xs rounded-full border-2 border-[#0b1120] flex items-center gap-1 ${
                    Number(blog.published) ? 'bg-[#10b981] text-white' : 'bg-amber-400 text-[#0b1120]'
                  }`}
                >
                  {Number(blog.published) ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {Number(blog.published) ? 'Published' : 'Draft'}
                </span>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex items-center gap-3 text-xs font-bold text-gray-500 mb-2">
                  <span>{blog.date}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  <span>{blog.read_time}</span>
                </div>
                <h3 className="text-lg font-black text-[#0b1120] leading-tight mb-4 line-clamp-2">{blog.title}</h3>
                <div className="mt-auto flex items-center gap-3">
                  <button
                    onClick={() => openEdit(blog)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0b1120] text-white rounded-xl font-black text-sm border-[2px] border-[#0b1120] hover:bg-gray-800 transition-colors"
                  >
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                  <a
                    href={`/blog/${blog.slug || blog.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 bg-white text-[#0b1120] rounded-xl border-[2px] border-[#0b1120] hover:bg-gray-50 transition-colors"
                    title="View post"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(blog)}
                    className="flex items-center justify-center w-10 h-10 bg-red-50 text-red-600 rounded-xl border-[2px] border-red-400 hover:bg-red-100 transition-colors"
                    title="Delete post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor modal */}
      <AnimatePresence>
        {editing && (
          <div className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 py-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="bg-white border-[4px] border-[#0b1120] rounded-[2rem] shadow-[12px_12px_0px_#0b1120] w-full max-w-3xl"
            >
              <div className="flex items-center justify-between px-8 py-6 border-b-[3px] border-gray-100">
                <h2 className="text-3xl font-black text-[#0b1120]">{editing.id ? 'Edit Blog' : 'Create Blog'}</h2>
                <button onClick={() => setEditing(null)} className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-[#0b1120] hover:bg-gray-50">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-8 py-6 space-y-5">
                {error && (
                  <div className="bg-red-50 border-2 border-red-300 text-red-700 rounded-xl px-4 py-3 font-bold text-sm">{error}</div>
                )}

                <Field label="Title">
                  <input
                    value={editing.title || ''}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder="Eye-catching blog title"
                    className={inputCls}
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Slug (URL)">
                    <input
                      value={editing.slug || ''}
                      onChange={(e) => { setSlugTouched(true); setField('slug', slugify(e.target.value)); }}
                      placeholder="auto-generated-from-title"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Category">
                    <input
                      value={editing.category || ''}
                      onChange={(e) => setField('category', e.target.value)}
                      placeholder="e.g. IIT Madras BS Degree"
                      className={inputCls}
                    />
                  </Field>
                </div>

                <Field label="Thumbnail Image URL">
                  <input
                    value={editing.image || ''}
                    onChange={(e) => setField('image', e.target.value)}
                    placeholder="/Image/your-thumbnail.png or https://..."
                    className={inputCls}
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <Field label="Display Date">
                    <input value={editing.date || ''} onChange={(e) => setField('date', e.target.value)} placeholder="May 15, 2026" className={inputCls} />
                  </Field>
                  <Field label="Read Time">
                    <input value={editing.read_time || ''} onChange={(e) => setField('read_time', e.target.value)} placeholder="7 min read" className={inputCls} />
                  </Field>
                  <Field label="Status">
                    <button
                      type="button"
                      onClick={() => setField('published', Number(editing.published) ? 0 : 1)}
                      className={`w-full flex items-center justify-center gap-2 rounded-xl border-[2px] border-[#0b1120] px-4 py-3 font-black text-sm ${
                        Number(editing.published) ? 'bg-[#10b981] text-white' : 'bg-amber-400 text-[#0b1120]'
                      }`}
                    >
                      {Number(editing.published) ? <><Eye className="w-4 h-4" /> Published</> : <><EyeOff className="w-4 h-4" /> Draft</>}
                    </button>
                  </Field>
                </div>

                <Field label="Content (HTML)">
                  <textarea
                    value={editing.content || ''}
                    onChange={(e) => setField('content', e.target.value)}
                    rows={12}
                    placeholder="<p>Write your post using HTML. Use <h2> for sections, <a href> for links, <strong> for emphasis.</p>"
                    className={`${inputCls} font-mono text-sm leading-relaxed resize-y`}
                  />
                  <p className="text-xs font-bold text-gray-400 mt-1">
                    Tip: paste HTML. <code>&lt;h2&gt;</code> headings, <code>&lt;p&gt;</code> paragraphs and <code>&lt;a&gt;</code> links are styled automatically on the live post.
                  </p>
                </Field>

                <div className="border-t-[3px] border-gray-100 pt-5 space-y-5">
                  <h3 className="text-sm font-black uppercase tracking-wider text-gray-400">SEO (optional)</h3>
                  <Field label="SEO Title">
                    <input value={editing.seo_title || ''} onChange={(e) => setField('seo_title', e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="SEO Description">
                    <textarea value={editing.seo_description || ''} onChange={(e) => setField('seo_description', e.target.value)} rows={2} className={`${inputCls} resize-y`} />
                  </Field>
                  <Field label="SEO Keywords (comma separated)">
                    <input value={editing.seo_keywords || ''} onChange={(e) => setField('seo_keywords', e.target.value)} className={inputCls} />
                  </Field>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 px-8 py-6 border-t-[3px] border-gray-100">
                <button onClick={() => setEditing(null)} className="px-6 py-3 rounded-xl border-[2px] border-[#0b1120] font-black hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-8 py-3 bg-[#10b981] text-[#0b1120] rounded-xl font-black border-[3px] border-[#0b1120] shadow-[4px_4px_0px_#0b1120] hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {editing.id ? 'Save Changes' : 'Publish Blog'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputCls =
  'w-full rounded-xl border-[2px] border-[#0b1120] bg-white px-4 py-3 font-bold text-[#0b1120] text-sm placeholder:text-gray-300 placeholder:font-medium focus:outline-none focus:ring-2 focus:ring-[#10b981]';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">{label}</span>
      {children}
    </label>
  );
}
