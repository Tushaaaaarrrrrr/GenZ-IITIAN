import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Loader2, Search, AlertCircle, Copy, Check, Database } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import ManagerFullPageSheet from './ManagerFullPageSheet';

interface Employee {
  id?: string;
  employee_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  department: string;
  role: string;
  tenure: string;
  status: string;
}

const DEFAULT_EMPLOYEES: Employee[] = [
  {
    employee_id: 'GENZ-EMP-0000',
    full_name: 'Raj Singh',
    email: 'raj@genziitian.in',
    phone: '+91 98765 43210',
    department: 'Programming',
    role: 'Educator',
    tenure: '25/09/2025 - Present',
    status: 'ACTIVE'
  },
  {
    employee_id: 'GENZ-EMP-0001',
    full_name: 'Vaibhav',
    email: 'vaibhav@genziitian.in',
    phone: '+91 99887 76655',
    department: 'Academics',
    role: 'Educator',
    tenure: '01/06/2025 - Present',
    status: 'ACTIVE'
  },
  {
    employee_id: 'GENZ-EMP-0002',
    full_name: 'Ayush',
    email: 'ayush@genziitian.in',
    phone: '+91 88776 65544',
    department: 'Academics',
    role: 'Educator',
    tenure: '01/07/2025 - Present',
    status: 'ACTIVE'
  },
  {
    employee_id: 'GENZ-EMP-0003',
    full_name: 'Ankit K.',
    email: 'ankit@genziitian.in',
    phone: '+91 77665 54433',
    department: 'Academics',
    role: 'Educator',
    tenure: '01/08/2025 - 15/05/2026',
    status: 'INACTIVE'
  },
  {
    employee_id: 'GENZ-INT-0000N',
    full_name: 'Neha Sharma',
    email: 'neha@genziitian.in',
    phone: '+91 66554 43322',
    department: 'Operations',
    role: 'Intern',
    tenure: '15/05/2025 - 15/11/2025',
    status: 'RESIGNED'
  }
];

const AVAILABLE_ROLES = [
  'Manager',
  'Owner',
  'Founder',
  'CEO',
  'CTO',
  'Educator',
  'Intern',
  'Campus Leader'
];

const AVAILABLE_STATUSES = [
  'ACTIVE',
  'INACTIVE',
  'RESIGNED',
  'REMOVED'
];

const SQL_MIGRATION_CODE = `CREATE TABLE employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    department TEXT NOT NULL,
    role TEXT NOT NULL,
    tenure TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON employees FOR SELECT USING (true);

-- Allow full access to authenticated managers
CREATE POLICY "Allow all access to authenticated users" ON employees FOR ALL USING (auth.role() = 'authenticated');

-- IF THE TABLE ALREADY EXISTS: Run these ALTER statements to add missing columns:
ALTER TABLE employees ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS phone TEXT;`;

export default function EmployeesManager() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showSqlTip, setShowSqlTip] = useState(true);
  const [copiedSql, setCopiedSql] = useState(false);

  // Edit / Create Modal State
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  // Date picker states
  const [startD, setStartD] = useState('');
  const [endD, setEndD] = useState('');
  const [isPresent, setIsPresent] = useState(true);

  // Date parsing helpers
  const parseDateToYmd = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      // DD/MM/YYYY -> YYYY-MM-DD
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return '';
  };

  const formatYmdToDdMmYyyy = (ymd: string) => {
    if (!ymd) return '';
    const parts = ymd.split('-');
    if (parts.length === 3) {
      // YYYY-MM-DD -> DD/MM/YYYY
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return '';
  };

  const getNextEmployeeId = (role: string, name: string) => {
    const initial = name ? name.trim().charAt(0).toUpperCase() : 'X';
    const roleLower = role.toLowerCase();
    
    let prefix = 'GENZ-EMP';
    let suffix = '';
    
    if (roleLower === 'intern') {
      prefix = 'GENZ-INT';
      suffix = initial;
    } else if (roleLower === 'campus leader') {
      prefix = 'GENZ-CLS';
      suffix = initial;
    }

    let maxNum = -1;
    const pattern = new RegExp(`^${prefix}-(\\d{4})`, 'i');
    
    employees.forEach(emp => {
      const match = emp.employee_id.match(pattern);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) {
          maxNum = num;
        }
      }
    });

    const nextNum = maxNum + 1;
    const padded = String(nextNum).padStart(4, '0');
    return `${prefix}-${padded}${suffix}`;
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === 'PGRST116' || error.message?.includes('does not exist') || error.code === '42P01') {
          loadLocalEmployees();
        } else {
          console.error('Failed to load employees from DB:', error);
          loadLocalEmployees();
        }
      } else {
        setEmployees(data || []);
        setIsDemoMode(false);
      }
    } catch (err) {
      console.error('Database query catch block:', err);
      loadLocalEmployees();
    } finally {
      setLoading(false);
    }
  };

  const loadLocalEmployees = () => {
    setIsDemoMode(true);
    const stored = localStorage.getItem('gzi_mock_employees');
    if (stored) {
      try {
        setEmployees(JSON.parse(stored));
      } catch (e) {
        setEmployees(DEFAULT_EMPLOYEES);
      }
    } else {
      localStorage.setItem('gzi_mock_employees', JSON.stringify(DEFAULT_EMPLOYEES));
      setEmployees(DEFAULT_EMPLOYEES);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Audit log helper
  const insertAuditLog = async (action: string, empId: string, empName: string, details: string) => {
    const actorEmail = user?.email || 'unknown';
    try {
      await supabase.from('employee_logs').insert([{
        action_type: action,
        actor_email: actorEmail,
        employee_id: empId,
        employee_name: empName,
        details
      }]);
    } catch (err) {
      console.warn('Audit log insert failed:', err);
    }
    // Also save to local storage
    try {
      const existing = JSON.parse(localStorage.getItem('gzi_employee_logs') || '[]');
      existing.unshift({
        id: 'log-' + Math.random().toString(36).substr(2, 9),
        action_type: action,
        actor_email: actorEmail,
        employee_id: empId,
        employee_name: empName,
        details,
        created_at: new Date().toISOString()
      });
      localStorage.setItem('gzi_employee_logs', JSON.stringify(existing));
    } catch (e) { /* ignore */ }
  };

  const copySql = () => {
    navigator.clipboard.writeText(SQL_MIGRATION_CODE);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const openCreate = () => {
    setErrorMsg('');
    setStartD('');
    setEndD('');
    setIsPresent(true);
    setEditingEmployee({
      employee_id: '',
      full_name: '',
      email: '',
      phone: '',
      department: '',
      role: 'Educator',
      tenure: '',
      status: 'ACTIVE'
    });
  };

  const openEdit = (emp: Employee) => {
    setErrorMsg('');
    
    // Parse tenure dates into calendar selectors
    const tenureParts = emp.tenure.split(' - ');
    setStartD(parseDateToYmd(tenureParts[0] || ''));
    const present = (tenureParts[1] || '').toLowerCase() === 'present';
    setIsPresent(present);
    setEndD(present ? '' : parseDateToYmd(tenureParts[1] || ''));

    setEditingEmployee({ ...emp });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    const isNew = !editingEmployee.id;
    const empId = isNew ? getNextEmployeeId(editingEmployee.role, editingEmployee.full_name) : editingEmployee.employee_id.trim();
    const fullName = editingEmployee.full_name.trim();
    const dept = editingEmployee.department.trim();
    
    if (!startD) {
      setErrorMsg('Start date is required.');
      return;
    }
    if (!isPresent && !endD) {
      setErrorMsg('End date is required if not currently working.');
      return;
    }

    const tenureStr = `${formatYmdToDdMmYyyy(startD)} - ${isPresent ? 'Present' : formatYmdToDdMmYyyy(endD)}`;

    if (!empId || !fullName || !dept) {
      setErrorMsg('All marked fields are required.');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    const payload = {
      employee_id: empId,
      full_name: fullName,
      email: editingEmployee.email?.trim() || '',
      phone: editingEmployee.phone?.trim() || '',
      department: dept,
      role: editingEmployee.role,
      tenure: tenureStr,
      status: editingEmployee.status.toUpperCase()
    };

    try {
      if (isDemoMode) {
        // Save in LocalStorage
        const currentList = [...employees];
        
        // ID uniqueness check
        const duplicate = currentList.find(
          (emp) => 
            emp.employee_id.toLowerCase() === empId.toLowerCase() && 
            emp.id !== editingEmployee.id
        );

        if (duplicate) {
          setErrorMsg('An employee with this ID already exists in the records.');
          setSaving(false);
          return;
        }

        if (editingEmployee.id) {
          // Edit — compute diff for logging
          const oldEmp = employees.find(e => e.id === editingEmployee.id);
          const idx = currentList.findIndex((emp) => emp.id === editingEmployee.id);
          if (idx !== -1) {
            currentList[idx] = { ...editingEmployee, ...payload };
          }
          // Build diff description
          if (oldEmp) {
            const changes: string[] = [];
            if (oldEmp.full_name !== payload.full_name) changes.push(`Name: ${oldEmp.full_name} → ${payload.full_name}`);
            if (oldEmp.department !== payload.department) changes.push(`Dept: ${oldEmp.department} → ${payload.department}`);
            if (oldEmp.role !== payload.role) changes.push(`Role: ${oldEmp.role} → ${payload.role}`);
            if (oldEmp.status !== payload.status) changes.push(`Status: ${oldEmp.status} → ${payload.status}`);
            if (oldEmp.tenure !== payload.tenure) changes.push(`Tenure: ${oldEmp.tenure} → ${payload.tenure}`);
            if (oldEmp.email !== payload.email) changes.push(`Email: ${oldEmp.email || 'N/A'} → ${payload.email || 'N/A'}`);
            if (oldEmp.phone !== payload.phone) changes.push(`Phone: ${oldEmp.phone || 'N/A'} → ${payload.phone || 'N/A'}`);
            await insertAuditLog('UPDATE', payload.employee_id, payload.full_name, changes.length > 0 ? changes.join(', ') : 'No field changes');
          }
        } else {
          // Create
          const newEmp: Employee = {
            id: 'mock-' + Math.random().toString(36).substr(2, 9),
            ...payload
          };
          currentList.unshift(newEmp);
          await insertAuditLog('CREATE', payload.employee_id, payload.full_name, `Created new record — Role: ${payload.role}, Dept: ${payload.department}, Status: ${payload.status}`);
        }

        localStorage.setItem('gzi_mock_employees', JSON.stringify(currentList));
        setEmployees(currentList);
        setEditingEmployee(null);
      } else {
        // Save in Supabase
        if (editingEmployee.id) {
          // Compute diff for update logging
          const oldEmp = employees.find(e => e.id === editingEmployee.id);
          const { error } = await supabase
            .from('employees')
            .update(payload)
            .eq('id', editingEmployee.id);
          if (error) throw error;
          // Build diff description
          if (oldEmp) {
            const changes: string[] = [];
            if (oldEmp.full_name !== payload.full_name) changes.push(`Name: ${oldEmp.full_name} → ${payload.full_name}`);
            if (oldEmp.department !== payload.department) changes.push(`Dept: ${oldEmp.department} → ${payload.department}`);
            if (oldEmp.role !== payload.role) changes.push(`Role: ${oldEmp.role} → ${payload.role}`);
            if (oldEmp.status !== payload.status) changes.push(`Status: ${oldEmp.status} → ${payload.status}`);
            if (oldEmp.tenure !== payload.tenure) changes.push(`Tenure: ${oldEmp.tenure} → ${payload.tenure}`);
            if (oldEmp.email !== payload.email) changes.push(`Email: ${oldEmp.email || 'N/A'} → ${payload.email || 'N/A'}`);
            if (oldEmp.phone !== payload.phone) changes.push(`Phone: ${oldEmp.phone || 'N/A'} → ${payload.phone || 'N/A'}`);
            await insertAuditLog('UPDATE', payload.employee_id, payload.full_name, changes.length > 0 ? changes.join(', ') : 'No field changes');
          }
        } else {
          const { error } = await supabase
            .from('employees')
            .insert([payload]);
          if (error) {
            if (error.code === '23505') {
              setErrorMsg('An employee with this ID already exists in the database.');
              setSaving(false);
              return;
            }
            throw error;
          }
          await insertAuditLog('CREATE', payload.employee_id, payload.full_name, `Created new record — Role: ${payload.role}, Dept: ${payload.department}, Status: ${payload.status}`);
        }
        setEditingEmployee(null);
        fetchEmployees();
      }
    } catch (err: any) {
      console.error('Save error:', err);
      setErrorMsg(err.message || 'An error occurred while saving the record.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      if (isDemoMode) {
        const currentList = employees.filter((emp) => emp.id !== deleteTarget.id);
        localStorage.setItem('gzi_mock_employees', JSON.stringify(currentList));
        setEmployees(currentList);
        await insertAuditLog('DELETE', deleteTarget.employee_id, deleteTarget.full_name, `Deleted record — Role: ${deleteTarget.role}, Status: ${deleteTarget.status}`);
      } else {
        const { error } = await supabase
          .from('employees')
          .delete()
          .eq('id', deleteTarget.id);
        if (error) throw error;
        await insertAuditLog('DELETE', deleteTarget.employee_id, deleteTarget.full_name, `Deleted record — Role: ${deleteTarget.role}, Status: ${deleteTarget.status}`);
        fetchEmployees();
      }
      setDeleteTarget(null);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete employee record.');
    }
  };

  const filtered = employees.filter((emp) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      emp.full_name.toLowerCase().includes(q) ||
      emp.employee_id.toLowerCase().includes(q) ||
      emp.department.toLowerCase().includes(q) ||
      emp.role.toLowerCase().includes(q) ||
      (emp.email && emp.email.toLowerCase().includes(q)) ||
      (emp.phone && emp.phone.includes(q)) ||
      emp.status.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 text-left">
      {/* Demo / Database Warning Banner */}
      {isDemoMode && showSqlTip && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 relative">
          <button 
            onClick={() => setShowSqlTip(false)}
            className="absolute top-4 right-4 text-yellow-600 hover:text-yellow-900"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-start gap-4">
            <div className="p-3 bg-yellow-100 rounded-xl text-yellow-700">
              <Database className="w-6 h-6" />
            </div>
            <div className="space-y-3 flex-grow">
              <h4 className="font-black text-yellow-900 text-lg">Running in Local Demo Mode</h4>
              <p className="text-sm text-yellow-800 font-medium max-w-3xl leading-relaxed">
                The database table <code className="bg-yellow-100 px-1.5 py-0.5 rounded font-mono font-bold">employees</code> was not found. 
                We are falling back to <code className="bg-yellow-100 px-1.5 py-0.5 rounded font-mono font-bold">localStorage</code> so you can test all features.
                To set up the database table, run this SQL in your Supabase SQL Editor:
              </p>
              
              <div className="relative bg-gray-900 text-gray-100 font-mono text-xs p-4 rounded-xl max-h-48 overflow-y-auto max-w-3xl">
                <button 
                  onClick={copySql}
                  className="absolute top-2.5 right-2.5 px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-white flex items-center gap-1.5 transition-colors font-sans font-bold"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSql ? 'Copied!' : 'Copy SQL'}
                </button>
                <pre>{SQL_MIGRATION_CODE}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <input 
            type="text"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 focus:border-blue-500 rounded-xl font-semibold outline-none text-sm transition-all"
          />
        </div>

        {/* Add Button */}
        <button 
          onClick={openCreate}
          className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Add Employee Record
        </button>
      </div>

      {/* Employee List Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-16 text-center text-gray-500 font-bold">
          No employee records found matching your search.
        </div>
      ) : (
        <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">FULL NAME</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">EMAIL</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">PHONE</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">DEPARTMENT</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">ROLE</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">TENURE</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">STATUS</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {filtered.map((emp) => (
                  <tr key={emp.id || emp.employee_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4.5 font-mono text-xs font-bold text-gray-500">{emp.employee_id}</td>
                    <td className="px-6 py-4.5 text-[#0b1120] font-black">{emp.full_name}</td>
                    <td className="px-6 py-4.5 text-gray-600 text-xs font-semibold">{emp.email || '-'}</td>
                    <td className="px-6 py-4.5 text-gray-600 text-xs font-semibold">{emp.phone || '-'}</td>
                    <td className="px-6 py-4.5 text-gray-800">{emp.department}</td>
                    <td className="px-6 py-4.5 text-gray-800 capitalize">{emp.role}</td>
                    <td className="px-6 py-4.5 text-gray-600 font-mono text-xs">{emp.tenure}</td>
                    <td className="px-6 py-4.5">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        emp.status.toUpperCase() === 'ACTIVE' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : emp.status.toUpperCase() === 'RESIGNED'
                          ? 'bg-orange-50 text-orange-700 border border-orange-100'
                          : emp.status.toUpperCase() === 'REMOVED'
                          ? 'bg-red-50 text-red-700 border border-red-100'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEdit(emp)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="Edit Record"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => setDeleteTarget(emp)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Delete Record"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Form — full page */}
      <ManagerFullPageSheet
        open={!!editingEmployee}
        title={editingEmployee?.id ? 'Edit employee' : 'Add employee'}
        subtitle={editingEmployee?.full_name || 'Create or update an employee record'}
        onClose={() => setEditingEmployee(null)}
        onSave={() => (document.getElementById('employee-editor-form') as HTMLFormElement | null)?.requestSubmit()}
        saveLabel="Save record"
        saving={saving}
        maxWidthClass="max-w-4xl"
      >
            <form id="employee-editor-form" onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-sm space-y-6">
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                {/* Left Column */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Full name *
                    </label>
                    <input 
                      required 
                      type="text" 
                      value={editingEmployee?.full_name || ''}
                      onChange={(e) => editingEmployee && setEditingEmployee({ ...editingEmployee, full_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-slate-400 outline-none font-medium text-sm transition-all text-slate-900 placeholder-slate-400" 
                      placeholder="e.g. Raj Singh"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Email address
                    </label>
                    <input 
                      type="email" 
                      value={editingEmployee?.email || ''}
                      onChange={(e) => editingEmployee && setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-slate-400 outline-none font-medium text-sm transition-all text-slate-900 placeholder-slate-400" 
                      placeholder="e.g. raj@genziitian.in"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Department *
                    </label>
                    <input 
                      required 
                      type="text" 
                      value={editingEmployee?.department || ''}
                      onChange={(e) => editingEmployee && setEditingEmployee({ ...editingEmployee, department: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-slate-400 outline-none font-medium text-sm transition-all text-slate-900 placeholder-slate-400" 
                      placeholder="e.g. Programming"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Current status *
                    </label>
                    <select 
                      value={(editingEmployee?.status || 'ACTIVE').toUpperCase()}
                      onChange={(e) => editingEmployee && setEditingEmployee({ ...editingEmployee, status: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-slate-400 outline-none font-medium text-sm transition-all text-slate-900 bg-white"
                    >
                      {AVAILABLE_STATUSES.map(status => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Employee ID
                    </label>
                    <input 
                      disabled 
                      type="text" 
                      value={editingEmployee ? (editingEmployee.id ? editingEmployee.employee_id : getNextEmployeeId(editingEmployee.role, editingEmployee.full_name)) : ''}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none font-mono font-semibold text-sm text-slate-400" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                      PHONE NUMBER
                    </label>
                    <input 
                      type="text" 
                      value={editingEmployee.phone || ''}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none font-semibold text-sm transition-all text-gray-800 placeholder-gray-400" 
                      placeholder="e.g. +91 98765 43210"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                      ROLE *
                    </label>
                    <select 
                      value={editingEmployee.role}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, role: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none font-semibold text-sm transition-all text-gray-800 bg-white"
                    >
                      {AVAILABLE_ROLES.map(role => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tenure Selection with calendar dates */}
                  <div className="bg-gray-50/50 border border-gray-200 rounded-2xl p-4 space-y-4">
                    <div className="text-xs font-black text-gray-500 uppercase tracking-wider">TENURE / DURATION</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1.5">START DATE *</label>
                        <input 
                          required
                          type="date"
                          value={startD}
                          onChange={(e) => setStartD(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none font-semibold text-xs transition-all text-gray-800 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1.5">END DATE</label>
                        <input 
                          disabled={isPresent}
                          required={!isPresent}
                          type="date"
                          value={endD}
                          onChange={(e) => setEndD(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none font-semibold text-xs transition-all text-gray-800 bg-white disabled:bg-gray-100 disabled:text-gray-400"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <input 
                        type="checkbox"
                        id="is-present-checkbox"
                        checked={isPresent}
                        onChange={(e) => {
                          setIsPresent(e.target.checked);
                          if (e.target.checked) setEndD('');
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="is-present-checkbox" className="text-xs text-gray-700 font-bold select-none cursor-pointer">
                        Currently working here (Present)
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons moved to full-page footer */}
            </form>
      </ManagerFullPageSheet>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border-2 border-[#0b1120] max-w-sm w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-black text-[#0b1120]">Delete Record?</h3>
              <p className="text-sm text-gray-500 font-bold leading-relaxed">
                Are you sure you want to delete the employee record for <strong className="text-gray-800">{deleteTarget.full_name}</strong> ({deleteTarget.employee_id})? This action cannot be undone.
              </p>
              
              <div className="flex items-center justify-end gap-3 pt-2">
                <button 
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 border-2 border-gray-200 hover:border-gray-300 text-gray-500 font-black text-xs rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 border-2 border-red-600 text-white font-black text-xs rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
