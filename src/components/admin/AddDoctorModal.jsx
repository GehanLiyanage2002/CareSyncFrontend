import React, { useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  User, Mail, Lock, Phone, Stethoscope, Clock, FileText, MapPin,
  CheckCircle2, Camera, Eye, EyeOff, Loader, X, Plus, Trash2,
  CalendarDays, DollarSign
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// ── Reusable field component exactly matching the profile page input style ──
const Field = ({ label, icon: Icon, children, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    <label className="text-sm font-medium text-slate-700">{label}</label>
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon size={18} className="text-slate-400" />
        </div>
      )}
      {children}
    </div>
  </div>
);

const inputCls = (hasIcon = true) =>
  `w-full ${hasIcon ? 'pl-10' : 'pl-4'} pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-slate-800 text-sm placeholder-slate-400`;

// ── Section wrapper exactly like the profile page card ──
const Section = ({ title, children }) => (
  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
    <h2 className="text-xl font-semibold text-slate-800 mb-6">{title}</h2>
    {children}
  </div>
);

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

const AddDoctorModal = ({ token, onClose, onSuccess }) => {
  const fileInputRef = useRef(null);

  // State for each section
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile]       = useState(null);
  const [createdId, setCreatedId]         = useState(null);
  const [showPassword, setShowPassword]   = useState(false);

  const [basic, setBasic] = useState({
    full_name: '', email: '', password: '', mobile_number: ''
  });

  const [professional, setProfessional] = useState({
    specialization: '', experience: '', qualifications: '', bio: '', location: ''
  });

  const [scheduleEntries, setScheduleEntries] = useState([
    { date: new Date(Date.now() + 86400000), start_time: '08:00', end_time: '17:00', slot_duration_minutes: '15' }
  ]);

  const [fee, setFee]                   = useState('');
  const [loading, setLoading]           = useState({ basic: false, image: false, schedule: false, fee: false });

  // ─── Avatar pick ───
  const handleAvatarPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Image must be less than 10MB'); return; }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  // ─── Upload avatar for existing doctor ───
  const uploadAvatar = async (doctorId) => {
    if (!avatarFile) return;
    const fd = new FormData();
    fd.append('image', avatarFile);
    setLoading(p => ({ ...p, image: true }));
    try {
      await axios.put(`http://localhost:5000/api/admin/doctors/${doctorId}/profile-image`, fd, {
        headers: { Authorization: token, 'Content-Type': 'multipart/form-data' }
      });
    } catch (err) {
      toast.error('Profile photo upload failed.');
    } finally {
      setLoading(p => ({ ...p, image: false }));
    }
  };

  // ─── Save Basic Info & Professional Details ───
  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    if (!basic.full_name || !basic.email || !basic.password) {
      toast.error('Full name, email and password are required.'); return;
    }
    if (basic.password.length < 6) {
      toast.error('Password must be at least 6 characters.'); return;
    }
    setLoading(p => ({ ...p, basic: true }));
    try {
      const res = await axios.post('http://localhost:5000/api/admin/doctors', {
        ...basic,
        ...professional,
        consultation_fee: fee || undefined
      }, { headers: { Authorization: token } });

      const id = res.data.doctor.id;
      setCreatedId(id);

      // Upload avatar right after account is created
      if (avatarFile) await uploadAvatar(id);

      toast.success(`Dr. ${basic.full_name} created & approved! ✓`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create doctor.');
    } finally {
      setLoading(p => ({ ...p, basic: false }));
    }
  };

  // ─── Save Schedule ───
  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    if (!createdId) { toast.error('Create the doctor first.'); return; }
    setLoading(p => ({ ...p, schedule: true }));
    try {
      for (const entry of scheduleEntries) {
        const d = entry.date;
        const schedule_date = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        await axios.put(`http://localhost:5000/api/admin/doctors/${createdId}/schedule`, {
          schedule_date,
          start_time: entry.start_time,
          end_time: entry.end_time,
          slot_duration_minutes: parseInt(entry.slot_duration_minutes) || 15
        }, { headers: { Authorization: token } });
      }
      toast.success(`${scheduleEntries.length} schedule(s) saved!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save schedule.');
    } finally {
      setLoading(p => ({ ...p, schedule: false }));
    }
  };

  // ─── Save Fee & finish ───
  const handleSaveFee = async (e) => {
    e.preventDefault();
    if (!createdId) { toast.error('Create the doctor first.'); return; }
    if (!fee || isNaN(fee) || Number(fee) <= 0) { toast.error('Enter a valid fee.'); return; }
    setLoading(p => ({ ...p, fee: true }));
    try {
      await axios.put(`http://localhost:5000/api/admin/doctors/${createdId}/fee`,
        { fee: Number(fee) },
        { headers: { Authorization: token } }
      );
      toast.success('Consultation fee saved! Doctor setup complete. 🎉');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save fee.');
    } finally {
      setLoading(p => ({ ...p, fee: false }));
    }
  };

  const addScheduleEntry = () => {
    const last = scheduleEntries[scheduleEntries.length - 1]?.date || new Date();
    setScheduleEntries([...scheduleEntries, {
      date: new Date(last.getTime() + 86400000),
      start_time: '08:00', end_time: '17:00', slot_duration_minutes: '15'
    }]);
  };

  const removeEntry = (i) => setScheduleEntries(scheduleEntries.filter((_, idx) => idx !== i));
  const updateEntry = (i, k, v) => {
    const next = [...scheduleEntries];
    next[i] = { ...next[i], [k]: v };
    setScheduleEntries(next);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center py-10 px-4">
        <div className="w-full max-w-4xl">

          {/* Modal header — matches EditProfilePage heading style */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Add New Doctor</h1>
              <p className="text-slate-500 mt-2">Fill in the doctor's profile, schedule, and consultation fee details.</p>
            </div>
            <button onClick={onClose}
              className="mt-1 flex items-center gap-2 px-5 py-2.5 bg-white text-slate-600 hover:text-rose-600 font-medium rounded-full shadow-sm hover:shadow-md border border-slate-200 hover:border-rose-200 transition-all duration-300">
              <X size={16} />
              Cancel
            </button>
          </div>

          <div className="space-y-6">

            {/* ── 1. BASIC INFORMATION ── */}
            <Section title="Basic Information">
              <form onSubmit={handleCreateDoctor} className="space-y-6">

                {/* Avatar upload — same UI as profile page */}
                <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold shadow-inner overflow-hidden border-2 border-white">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span>{basic.full_name ? basic.full_name.charAt(0).toUpperCase() : 'D'}</span>
                      )}
                    </div>
                    <button type="button"
                      className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-slate-200 text-slate-600 hover:text-blue-600 transition-colors"
                      title="Upload Photo">
                      {loading.image ? <Loader size={18} className="animate-spin" /> : <Camera size={18} />}
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleAvatarPick}
                      accept="image/png, image/jpeg" className="hidden" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-800 text-lg">{basic.full_name || 'New Doctor'}</h3>
                    <p className="text-slate-500 text-sm">Doctor Account</p>
                    <p className="text-slate-400 text-xs mt-1">Click the camera icon to upload a photo</p>
                  </div>
                </div>

                {/* Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <Field label="Full Name" icon={User}>
                    <input type="text" value={basic.full_name}
                      onChange={e => setBasic({...basic, full_name: e.target.value})}
                      className={inputCls()} placeholder="Dr. John Smith" required disabled={!!createdId} />
                  </Field>

                  <Field label="Contact Number" icon={Phone}>
                    <input type="tel" value={basic.mobile_number}
                      onChange={e => setBasic({...basic, mobile_number: e.target.value})}
                      className={inputCls()} placeholder="+94 7X XXX XXXX" disabled={!!createdId} />
                  </Field>

                  <Field label="Email Address" icon={Mail} className="md:col-span-2">
                    <input type="email" value={basic.email}
                      onChange={e => setBasic({...basic, email: e.target.value})}
                      className={inputCls()} placeholder="doctor@clinic.com" required disabled={!!createdId} />
                  </Field>

                  <Field label="Password" icon={Lock} className="md:col-span-2">
                    <input type={showPassword ? 'text' : 'password'} value={basic.password}
                      onChange={e => setBasic({...basic, password: e.target.value})}
                      className={`${inputCls()} pr-12`} placeholder="Minimum 6 characters" required disabled={!!createdId} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </Field>
                </div>

                <div className="flex justify-end pt-2">
                  {!createdId ? (
                    <button type="submit" disabled={loading.basic}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-sm active:scale-95 disabled:opacity-70">
                      {loading.basic ? 'Creating...' : 'Create Doctor Account'}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl font-medium text-sm">
                      <CheckCircle2 size={18} />
                      Account Created Successfully
                    </div>
                  )}
                </div>
              </form>
            </Section>

            {/* ── 2. PROFESSIONAL DETAILS ── */}
            <Section title="Professional Details">
              <form onSubmit={e => { e.preventDefault(); toast.success('Professional details saved with account.'); }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Specialization" icon={Stethoscope}>
                    <input type="text" value={professional.specialization}
                      onChange={e => setProfessional({...professional, specialization: e.target.value})}
                      className={inputCls()} placeholder="Cardiologist" disabled={!!createdId} />
                  </Field>

                  <Field label="Years of Experience" icon={Clock}>
                    <input type="number" min="0" value={professional.experience}
                      onChange={e => setProfessional({...professional, experience: e.target.value})}
                      className={inputCls()} placeholder="10" disabled={!!createdId} />
                  </Field>

                  <Field label="Qualifications" icon={CheckCircle2} className="md:col-span-2">
                    <input type="text" value={professional.qualifications}
                      onChange={e => setProfessional({...professional, qualifications: e.target.value})}
                      className={inputCls()} placeholder="e.g. MBBS, MD" disabled={!!createdId} />
                  </Field>

                  <Field label="Professional Bio" icon={FileText} className="md:col-span-2">
                    <div className="relative">
                      <div className="absolute top-3 left-3 pointer-events-none">
                        <FileText size={18} className="text-slate-400" />
                      </div>
                      <textarea value={professional.bio}
                        onChange={e => setProfessional({...professional, bio: e.target.value})}
                        rows={4} disabled={!!createdId}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-slate-800 text-sm placeholder-slate-400 resize-none disabled:opacity-60"
                        placeholder="Brief professional biography..." />
                    </div>
                  </Field>

                  <Field label="Clinic Location" icon={MapPin} className="md:col-span-2">
                    <input type="text" value={professional.location}
                      onChange={e => setProfessional({...professional, location: e.target.value})}
                      className={inputCls()} placeholder="e.g. CareSync Hospital, Colombo" disabled={!!createdId} />
                  </Field>
                </div>

                {!createdId && (
                  <p className="text-xs text-slate-400 text-center">Professional details will be saved together with the doctor account above.</p>
                )}
              </form>
            </Section>

            {/* ── 3. SCHEDULE MANAGER ── */}
            <Section title="Schedule Manager">
              <form onSubmit={handleSaveSchedule} className="space-y-4">
                {!createdId && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm font-medium">
                    ⚠️ Create the doctor account above first, then save the schedule.
                  </div>
                )}

                {scheduleEntries.map((entry, idx) => (
                  <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                        <CalendarDays size={16} className="text-blue-500" />
                        Working Day {idx + 1}
                      </p>
                      {scheduleEntries.length > 1 && (
                        <button type="button" onClick={() => removeEntry(idx)}
                          className="text-rose-400 hover:text-rose-600 transition-colors p-1">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-slate-700">Date</label>
                        <DatePicker selected={entry.date}
                          onChange={date => updateEntry(idx, 'date', date)}
                          minDate={new Date()}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm text-slate-800 cursor-pointer"
                          dateFormat="MMMM d, yyyy"
                          wrapperClassName="w-full" />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Start Time</label>
                        <input type="time" value={entry.start_time}
                          onChange={e => updateEntry(idx, 'start_time', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm text-slate-800" />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">End Time</label>
                        <input type="time" value={entry.end_time}
                          onChange={e => updateEntry(idx, 'end_time', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm text-slate-800" />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-slate-700">Appointment Slot Duration</label>
                        <select value={entry.slot_duration_minutes}
                          onChange={e => updateEntry(idx, 'slot_duration_minutes', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm text-slate-800">
                          {[10,15,20,30,45,60].map(m => <option key={m} value={m}>{m} minutes per slot</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}

                <button type="button" onClick={addScheduleEntry}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/40 font-medium text-sm transition-all">
                  <Plus size={16} /> Add Another Day
                </button>

                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={loading.schedule || !createdId}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-sm active:scale-95 disabled:opacity-70">
                    {loading.schedule ? 'Saving...' : 'Save Schedule'}
                  </button>
                </div>
              </form>
            </Section>

            {/* ── 4. CONSULTATION FEE ── */}
            <Section title="Consultation Fee Manager">
              <form onSubmit={handleSaveFee} className="space-y-6">
                {!createdId && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm font-medium">
                    ⚠️ Create the doctor account above first, then set the fee.
                  </div>
                )}

                <div className="space-y-2 max-w-sm">
                  <label className="text-sm font-medium text-slate-700">Consultation Fee (Rs.)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-slate-400 font-bold text-sm">Rs.</span>
                    </div>
                    <input type="number" min="0" value={fee}
                      onChange={e => setFee(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors font-bold text-lg text-slate-800"
                      placeholder="1500" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button type="button" onClick={onClose}
                    className="px-5 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading.fee || !createdId}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-sm active:scale-95 disabled:opacity-70">
                    {loading.fee ? 'Completing...' : 'Save Fee & Complete Setup'}
                  </button>
                </div>
              </form>
            </Section>

          </div>

          {/* Bottom back button — same as EditProfilePage */}
          <div className="mt-12 flex justify-center pb-8">
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-6 py-3 bg-white text-slate-600 hover:text-blue-600 font-medium rounded-full shadow-sm hover:shadow-md border border-slate-200 hover:border-blue-200 transition-all duration-300 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Doctors
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AddDoctorModal;
