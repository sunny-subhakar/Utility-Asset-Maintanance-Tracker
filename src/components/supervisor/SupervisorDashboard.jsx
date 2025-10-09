import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import SupervisorHeader from './SupervisorHeader';
import LoadingSpinner from './LoadingSpinner';
import {
	ChevronDown,
	ChevronRight,
	Database,
	Calendar,
	Clipboard,
	Users,
	BarChart3,
	Plus,
	Search,
	UserCheck,
	TrendingUp,
	FileText
} from 'lucide-react';
import { AssetRegistration, SearchAssets } from './AssetManagement';
import { MaintenancePlan } from './MaintenancePlan';
import { AssignWork } from './AssignWork';
import { ViewAssignments, RegisterTechnician, SearchTechnicians } from './TechnicianManagement';
import { AssetHistory, TechnicianSummary } from './Reports';



const SupervisorDashboard = () => {
	const [activeTab, setActiveTab] = useState('assign-work');
	const [assets, setAssets] = useState([]);
	const [technicians, setTechnicians] = useState([]);
	const [workOrders, setWorkOrders] = useState([]);
	const [expandedMenus, setExpandedMenus] = useState({ workOrder: true });
	const [plans, setPlans] = useState([]);
	const [dataVersion, setDataVersion] = useState(0);
	const [loading, setLoading] = useState(false);
	const [apiCallMade, setApiCallMade] = useState(false);
	const [selectedTechnician, setSelectedTechnician] = useState(null);

	const fetchData = useCallback(async () => {
		setLoading(true);
		try {
			const [assetsRes, techniciansRes, workOrdersRes, plansRes] = await Promise.all([
				axios.get("http://localhost:9092/asset/all"),
				axios.get("http://localhost:9092/user/role/technician"),
				axios.get("http://localhost:9092/workorder/all"),
				axios.get("http://localhost:9092/maintenanceplan/all")
			]);
			
			setAssets(assetsRes.data);
			setTechnicians(techniciansRes.data);
			setWorkOrders(workOrdersRes.data);
			setPlans(plansRes.data);
		} catch (error) {
			console.error("Error fetching data:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData, dataVersion, apiCallMade]);

	const toggleMenu = useCallback((menuKey) => {
		setExpandedMenus(prev => {
			const isCurrentlyOpen = prev[menuKey];
			if (isCurrentlyOpen) {
				return { [menuKey]: false };
			}
			return { [menuKey]: true };
		});
	}, []);

	const handleTabChange = useCallback((tabId) => setActiveTab(tabId), []);

	const handleDataChange = useCallback(() => {
		setDataVersion(prev => prev + 1);
	}, []);

	const menuItems = useMemo(() => [
		{ key: 'assets', label: 'Assets', icon: Database, items: [ { id: 'search-assets', label: 'Search Assets', icon: Search }, { id: 'asset-registration', label: 'Register Asset', icon: Plus } ] },
		{ key: 'maintenance', label: 'Maintenance Plan', icon: Calendar, items: [ { id: 'maintenance-plan', label: 'View Plan', icon: FileText } ] },
		{ key: 'workOrder', label: 'Work Order', icon: Clipboard, items: [ { id: 'assign-work', label: 'Assign Work', icon: UserCheck } ] },
		{ key: 'technician', label: 'Assigned Technician', icon: Users, items: [ { id: 'search-technician', label: 'Search Technician', icon: Search }, { id: 'view-assignments', label: 'View Assignments', icon: FileText }, { id: 'register-technician', label: 'Register Technician', icon: Plus } ] },
		{ key: 'reports', label: 'Reports', icon: BarChart3, items: [ { id: 'asset-history', label: 'Asset History', icon: FileText }, { id: 'technician-summary', label: 'Technician Summary', icon: TrendingUp } ] }
	], []);

	const renderActiveTab = useMemo(() => {
		if (loading) return <LoadingSpinner />;
		
		const tabComponents = {
			'asset-registration': () => <AssetRegistration handleTabChange={handleTabChange} onDataChange={handleDataChange} setApiCallMade={setApiCallMade} />,
			'search-assets': () => <SearchAssets assets={assets} onDataChange={handleDataChange} setApiCallMade={setApiCallMade} />,
			'assign-work': () => <AssignWork workOrders={workOrders} technicians={technicians} onDataChange={handleDataChange} setApiCallMade={setApiCallMade} />,
			'view-assignments': () => <ViewAssignments workOrders={workOrders} selectedTechnician={selectedTechnician} setSelectedTechnician={setSelectedTechnician} setApiCallMade={setApiCallMade} />,
			'asset-history': () => <AssetHistory workOrders={workOrders} setApiCallMade={setApiCallMade} />,
			'technician-summary': () => <TechnicianSummary workOrders={workOrders} setApiCallMade={setApiCallMade} />,
			'search-technician': () => <SearchTechnicians technicians={technicians} handleTabChange={handleTabChange} setSelectedTechnician={setSelectedTechnician} setApiCallMade={setApiCallMade} />,
			'register-technician': () => <RegisterTechnician handleTabChange={handleTabChange} onDataChange={handleDataChange} setApiCallMade={setApiCallMade} />,
			'maintenance-plan': () => <MaintenancePlan plans={plans} setApiCallMade={setApiCallMade} />
		};
		
		return (tabComponents[activeTab] || tabComponents['search-assets'])();
	}, [activeTab, assets, technicians, workOrders, plans, loading, handleTabChange, handleDataChange]);

	return (
		<div className="app-container">
			<aside className="sidebar">
				<div className="sidebar-header">
					<h1 style={{ color: 'var(--status-completed-text)', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Supervisor Panel</h1>
				</div>
				<nav className="sidebar-nav">
					<ul>
						{menuItems.map((menu) => (
							<li key={menu.key} style={{ marginBottom: '0' }}>
								<button
									onClick={() => toggleMenu(menu.key)}
									style={{ width: '100%', textAlign: 'left', backgroundColor: 'transparent', color: 'var(--color-text-on-dark)', border: 'none', padding: '16px 25px', cursor: 'pointer', fontSize: '1em', fontWeight: '500', transition: 'background-color 0.3s ease, color 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px' }}
									onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-hover-dark-bg)'}
									onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
								>
									<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
										<menu.icon size={18} />
										{menu.label}
									</div>
									{expandedMenus[menu.key] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
								</button>
								<AnimatePresence>
									{expandedMenus[menu.key] && (
										<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
											<ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
												{menu.items.map((item) => (
													<li key={item.id}>
														<button
															onClick={() => handleTabChange(item.id)}
															className={activeTab === item.id ? 'active' : ''}
															style={{ width: '100%', textAlign: 'left', backgroundColor: activeTab === item.id ? 'var(--color-active-dark-bg)' : 'transparent', color: 'var(--color-text-on-dark)', border: 'none', padding: '12px 25px 12px 45px', cursor: 'pointer', fontSize: '0.9em', fontWeight: activeTab === item.id ? '600' : '400', transition: 'background-color 0.3s ease, color 0.3s ease', display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}
															onMouseEnter={(e) => { if (activeTab !== item.id) e.target.style.backgroundColor = 'var(--color-hover-dark-bg)'; }}
															onMouseLeave={(e) => { if (activeTab !== item.id) e.target.style.backgroundColor = 'transparent'; }}
														>
															{activeTab === item.id && (
																<div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: 'var(--color-light-primary)' }} />
															)}
															<item.icon size={16} />
															{item.label}
														</button>
													</li>
												))}
											</ul>
										</motion.div>
									)}
								</AnimatePresence>
							</li>
						))}
					</ul>
				</nav>
			</aside>

			<div className="main-content-wrapper">
				<SupervisorHeader />
				<main className="main-content-area" id="supervisor-dashboard-content">{renderActiveTab}</main>
			</div>
		</div>
	);
};

export default SupervisorDashboard;