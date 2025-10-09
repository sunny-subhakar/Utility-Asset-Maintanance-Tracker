import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { useMemo } from 'react';
import styles from './AssetHistory.module.css';

const getFrequencyString = (days) => {
  switch (days) {
    case 30: return 'Monthly';
    case 90: return 'Quarterly';
    case 365: return 'Yearly';
    default: return days ? `${days} days` : 'N/A';
  }
};

const getStatusClass = (status) => {
  switch (status) {
    case 'Not Assigned': return styles.statusNotAssigned;
    case 'Assigned': return styles.statusAssigned;
    case 'Pending': return styles.statusPending;
    case 'Completed': return styles.statusCompleted;
    default: return styles.statusNotAssigned;
  }
};

const EmptyState = ({ message }) => (
  <div className={styles.emptyState}>
    {/* <FileText size={48} className={styles.emptyStateIcon} /> */}
    <p className={styles.emptyStateText}>{message}</p>
  </div>
);

const RequestCard = ({ request }) => {
  const details = [
    { label: 'Asset ID', value: `AST-${request?.assetId?.id}` || 'N/A' },
    { label: 'Frequency Plan', value: getFrequencyString(request?.frequency) || 'N/A' },
    { label: 'Requested Date', value: request?.requestedDate || 'N/A' },
    { label: 'Submitted By', value: request?.userId?.name || 'N/A' },
    { label: 'Type', value: request?.assetId?.type || 'N/A' }
  ];

  return (
    <div className={styles.requestCard}>
      <div className={styles.requestHeader}>
        <h4 className={styles.requestTitle}>
          {request.assetId?.name || 'N/A'}
        </h4>
        <span className={`${styles.statusBadge} ${getStatusClass(request.status)}`}>
          {request.status}
        </span>
      </div>
      
      <div className={styles.detailsGrid}>
        {details.map(({ label, value }) => (
          <div key={label}>
            <span className={styles.detailLabel}>{label}</span>
            <span className={styles.detailValue}>{value}</span>
          </div>
        ))}
      </div>
      
      {request.desc && (
        <div className={styles.description}>
          <span className={styles.detailLabel}>Description</span>
          <p className={styles.descriptionText}>{request.desc}</p>
        </div>
      )}
    </div>
  );
};

const PastRecordCard = ({ asset }) => {
  const details = [
    { label: 'Asset Name', value: `AST-${asset.assetId?.id}` || 'N/A' },
    { label: 'Asset Type', value: asset.assetId?.type || 'N/A' },
    { label: 'Requested Date', value: asset?.requestedDate || 'N/A' },
    { label: 'Technician', value: asset?.techId?.name || 'N/A' },
    { label: 'Maintenance Date', value: asset?.planId?.nextMaintenanceDate || 'N/A' }
  ];

  return (
    <div className={styles.requestCard}>
      <div className={styles.requestHeader}>
        <h4 className={styles.requestTitle}>
          {asset.assetId?.name || 'N/A'}
        </h4>
        <span className={`${styles.statusBadge} ${getStatusClass(asset.status)}`}>
          {asset.status}
        </span>
      </div>
      
      <div className={styles.detailsGrid}>
        {details.map(({ label, value }) => (
          <div key={label}>
            <span className={styles.detailLabel}>{label}</span>
            <span className={styles.detailValue}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const RequestSection = ({ title, requests, emptyMessage, CardComponent = RequestCard }) => (
  <div className={styles.section}>
    <h3 className={styles.sectionTitle}>{title}</h3>
    {requests.length === 0 ? (
      <EmptyState message={emptyMessage} />
    ) : (
      <div className={styles.requestGrid}>
        {requests.map((request) => (
          <CardComponent key={request.workId} request={request} asset={request} />
        ))}
      </div>
    )}
  </div>
);

const AssetHistory = ({ userHistory }) => {
  const records = useMemo(() => userHistory || [], [userHistory]);
  
  const requestsByStatus = useMemo(() => ({
    notAssigned: records.filter(r => r.status === 'Not Assigned'),
    assigned: records.filter(r => r.status === 'Assigned'),
    pending: records.filter(r => r.status === 'Pending'),
    completed: records.filter(r => r.status === 'Completed')
  }), [records]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card"
    >
      <h2 className={styles.title}>Asset History</h2>
      <p className={styles.subtitle}>
        Your asset requests and past assignment history
      </p>

      <RequestSection
        title="Requests Yet To Be Assigned"
        requests={requestsByStatus.notAssigned}
        emptyMessage="No active asset requests found."
      />

      <RequestSection
        title="Your Assigned Requests"
        requests={requestsByStatus.assigned}
        emptyMessage="No active asset requests found."
      />

      <RequestSection
        title="Your Pending Requests"
        requests={requestsByStatus.pending}
        emptyMessage="No active asset requests found."
      />

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Your Past Asset Records</h3>
        {requestsByStatus.completed.length === 0 ? (
          <EmptyState message="No past asset records found." />
        ) : (
          <div className={styles.requestGrid}>
            {requestsByStatus.completed.map((asset) => (
              <PastRecordCard key={asset.workId} asset={asset} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AssetHistory;