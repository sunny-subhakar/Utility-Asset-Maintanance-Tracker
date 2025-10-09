import { useState, useCallback, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import StatusBadge from './StatusBadge';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import { SKILLS, REGIONS, LOCATIONS, DEFAULT_PASSWORD } from '../../config/constants';
import LoadingSpinner from './LoadingSpinner';
import './css/TechnicianManagement.css';

const AssignmentCard = memo(({ workOrder }) => {
	const details = useMemo(() => [
		{ label: 'Asset', value: workOrder.assetId?.name || 'N/A' },
		{ label: 'Technician', value: workOrder.techId?.name || 'N/A' },
		{ label: 'Requested By', value: workOrder.userId?.name || 'N/A' },
		{ label: 'Plan', value: `PLN-${workOrder.planId.planId}` },
		{ label: 'Maintenance (days)', value: workOrder.frequency }
	], [workOrder]);

	return (
		<div className="assignment-card">
			<div className="assignment-header">
				<strong className="assignment-id">WO-{workOrder.workId}</strong>
				<StatusBadge status={workOrder.status} />
			</div>
			<div className="assignment-desc">{workOrder.desc}</div>
			<div className="assignment-details">
				{details.map(({ label, value }) => (
					<div key={label}><strong>{label}:</strong> {value}</div>
				))}
			</div>
		</div>
	);
});
AssignmentCard.displayName = 'AssignmentCard';

const ViewAssignments = ({ workOrders = [], selectedTechnician, loading = false }) => {
	const [assigned,setAssigned] = useState(selectedTechnician !== null? workOrders.filter(w => w?.techId?.id === selectedTechnician.id) : workOrders.filter(w => w.techId));

	const handleShowAll = () => {
		setAssigned(workOrders.filter(w => w.techId));
	};

	if (loading) return <LoadingSpinner />;

	return (
		<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card technician-management">
			<div className="header-section">
				<div>
					<h2 className="header-title">Technician Assignments</h2>
					{selectedTechnician && (
						<p className="header-subtitle">Showing assignments for: <strong>{selectedTechnician.name}</strong></p>
					)}
				</div>
				{selectedTechnician && (
					<button onClick={handleShowAll} className="btn btn-secondary">Show All</button>
				)}
			</div>
			<p className="description">Current assignments and their status</p>
			{assigned.length === 0 ? (
				<div className="empty-state">
					{selectedTechnician ? `No assignments found for ${selectedTechnician.name}.` : 'No assignments yet. Assign tasks in the Assign Work tab.'}
				</div>
			) : (
				<div className="grid-container">
					{assigned.map(w => <AssignmentCard key={w.workId} workOrder={w} />)}
				</div>
			)}
		</motion.div>
	);
};

export { ViewAssignments };

const INITIAL_FORM = {
	name: '',
	email: '',
	password: DEFAULT_PASSWORD,
	phno: '',
	region: '',
	pincode: '',
	location: '',
	skill: '',
	role: 'technician'
};

const FormField = memo(({ label, name, type = 'text', value, onChange, options, placeholder, validation }) => (
	<div className="form-group">
		<label className="form-label">{label} *</label>
		{type === 'select' ? (
			<select name={name} value={value} onChange={onChange} className="form-input">
				<option value="">{placeholder}</option>
				{options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
			</select>
		) : (
			<input name={name} type={type} value={value} onChange={onChange} className="form-input" placeholder={placeholder} />
		)}
		{validation && <small className="form-validation">{validation}</small>}
	</div>
));
FormField.displayName = 'FormField';

const RegisterTechnician = ({ handleTabChange, onDataChange, setApiCallMade }) => {
	const [form, setForm] = useState(INITIAL_FORM);
	const [loading, setLoading] = useState(false);

	const handleChange = useCallback((e) => {
		setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
	}, []);

	const validations = useMemo(() => ({
		email: !/^[^\s@]+@[^\s@]+\.(com)$/.test(form.email) && form.email ? 'Please enter a valid email address' : null,
		phno: !/^[6-9]\d{9}$/.test(form.phno) && form.phno ? 'Please enter a valid 10-digit phone number starting with 6-9' : null
	}), [form.email, form.phno]);

	const handleSubmit = useCallback(async (e) => {
		e.preventDefault();
		if (!form.name || !form.email || !form.phno || !form.skill || !form.region || !form.location) return;
		if (isNaN(parseInt(form.phno, 10))) return;

		setLoading(true);
		try {
			await axios.post(API_ENDPOINTS.USER_SAVE, { ...form, phno: parseInt(form.phno, 10) });
			setForm(INITIAL_FORM);
			onDataChange?.();
			setApiCallMade?.(prev => !prev);
			handleTabChange('search-technician');
		} catch (error) {
			if (error.response?.status === 409) alert('Technician with this email already exists!');
		} finally {
			setLoading(false);
		}
	}, [form, handleTabChange, onDataChange, setApiCallMade]);

	return (
		<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card technician-management">
			<h2 className="header-title">Register Technician</h2>
			<p className="description">Add a new technician to the system</p>
			<form onSubmit={handleSubmit}>
				<div className="form-grid">
					<FormField label="Name" name="name" value={form.name} onChange={handleChange} placeholder="Enter full name" />
					<FormField label="Email" name="email" value={form.email} onChange={handleChange} placeholder="Enter email" validation={validations.email} />
					<FormField label="Phone Number" name="phno" value={form.phno} onChange={handleChange} placeholder="Enter phone number" validation={validations.phno} />
					<FormField label="Skill" name="skill" type="select" value={form.skill} onChange={handleChange} options={SKILLS} placeholder="Select skill" />
					<FormField label="Location" name="location" type="select" value={form.location} onChange={handleChange} options={LOCATIONS} placeholder="Select location" />
					<FormField label="Region" name="region" type="select" value={form.region} onChange={handleChange} options={REGIONS} placeholder="Select region" />
					<FormField label="Pincode" name="pincode" value={form.pincode} onChange={handleChange} placeholder="Enter pincode" />
				</div>
				<div className="button-container">
					<motion.button 
						whileHover={{ scale: loading ? 1 : 1.02 }} 
						type="submit" 
						disabled={loading}
						className="btn btn-primary"
						style={{ minWidth: '200px', padding: '12px 24px', fontSize: '16px' }}
					>
						{loading ? 'Registering...' : 'Register'}
					</motion.button>
				</div>
			</form>
		</motion.div>
	);
};

export { RegisterTechnician };

const TechnicianCard = memo(({ technician, onViewAssignments }) => {
	const handleClick = useCallback(() => {
		onViewAssignments(technician);
	}, [technician, onViewAssignments]);

	return (
		<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="technician-card">
			<div className="technician-header">
				<div>
					<h3 className="technician-name">{technician.name}</h3>
					<div className="technician-tags">
						<span className="tag">ID: {technician.id}</span>
						<span className="tag">{technician.skill}</span>
					</div>
				</div>
				<span className="region-badge">{technician.region}</span>
			</div>
			<div className="technician-details">
				<div>
					<div className="detail-label">Technician ID</div>
					<div className="detail-value">TEC-{technician.id}</div>
				</div>
				<div>
					<div className="detail-label">Location</div>
					<div className="detail-value">{technician.location}</div>
				</div>
			</div>
			<motion.button whileHover={{ scale: 1.02 }} className="btn btn-primary" style={{ width: '100%' }} onClick={handleClick}>View Assignments</motion.button>
		</motion.div>
	);
});
TechnicianCard.displayName = 'TechnicianCard';

const SearchTechnicians = ({ technicians = [], handleTabChange, setSelectedTechnician, loading = false }) => {
	const [searchTerm, setSearchTerm] = useState('');

	const filteredTechnicians = useMemo(() => {
		if (!searchTerm) return technicians;
		const term = searchTerm.toLowerCase();
		return technicians.filter(t => 
			[t.id, t.name, t.skill, t.region, t.location]
				.some(v => v && String(v).toLowerCase().includes(term))
		);
	}, [searchTerm, technicians]);

	const handleViewAssignments = useCallback((technician) => {
		setSelectedTechnician(technician);
		handleTabChange('view-assignments');
	}, [setSelectedTechnician, handleTabChange]);

	if (loading) return <LoadingSpinner />;

	return (
		<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card technician-management">
			<h2 className="header-title">Search Technicians</h2>
			<p className="description">Find technicians and view their assignments</p>
			<div className="search-container">
				<input type="text" placeholder="Search by ID, name, skill, region..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
			</div>
			<div className="stats-container">
				<p className="stats-text">
					<strong className="stats-highlight">{filteredTechnicians.length}</strong> 
					{searchTerm ? ` technician${filteredTechnicians.length !== 1 ? 's' : ''} found matching "${searchTerm}"` : ' total technicians available'}
				</p>
			</div>
			{filteredTechnicians.length === 0 ? (
				<div className="no-results">
					<Search size={48} className="no-results-icon" />
					<h3 className="no-results-title">No Technicians Found</h3>
					<p>Try adjusting your search query.</p>
				</div>
			) : (
				<div className="technician-grid">
					{filteredTechnicians.map(t => <TechnicianCard key={t.id} technician={t} onViewAssignments={handleViewAssignments} />)}
				</div>
			)}
		</motion.div>
	);
};

export { SearchTechnicians };