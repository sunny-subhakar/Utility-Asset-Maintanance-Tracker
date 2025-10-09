import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Modal from '../Modal';
import axios from 'axios';

const WorkOrderCard = ({ order, status, onStatusChange, onUpdate, onViewDetails, completionData, onCompletionChange }) => {
  const isCompleted = status === 'Completed';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.3 }}
      className="card"
      style={{ padding: '20px' }}
    >
      <h3 style={{ color: 'var(--color-text-dark)', margin: '0 0 15px 0', fontSize: '1.1rem' }}>
        {order.desc}
      </h3>

      <div style={{ marginBottom: '15px' }}>
        <p><strong>Asset:</strong> {order.assetId?.name}</p>
        <p><strong>Requested By:</strong> {order.userId?.name} (USR-{order.userId?.id})</p>
        <p><strong>Maintenance (Days):</strong> {order.frequency}</p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', alignItems: 'center' }}>
        <select
          value={status || order.status}
          onChange={(e) => onStatusChange(e.target.value)}
          style={{ maxWidth: '200px', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
        >
          <option value="">-- Select Status --</option>
          <option value="Pending">In Progress</option>
          <option value="Completed">Done</option>
        </select>
        <button
          className="btn btn-primary"
          disabled={!status}
          onClick={onUpdate}
        >
          {status === 'Completed' ? status : "Update"}
        </button>
      </div>

      {isCompleted && (
        <div style={{ marginTop: '15px' }}>
          <input
            type="number"
            placeholder="Estimated Hours"
            value={completionData?.hours || ''}
            onChange={(e) => onCompletionChange('hours', e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          <textarea
            placeholder="Work Description"
            value={completionData?.description || ''}
            onChange={(e) => onCompletionChange('description', e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', minHeight: '80px' }}
          />
        </div>
      )}

      <button
        className="btn btn-primary"
        style={{ width: '100%', marginTop: '10px' }}
        onClick={() => onViewDetails(order)}
      >
        View Details
      </button>
    </motion.div>
  );
};

const WorkOrderDetailsModal = ({ isOpen, onClose, order }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={`Work Order ${order?.workId || ''}`} maxWidth="650px">
    {order && (
      <div style={{ display: 'grid', gap: '10px' }}>
        <p><strong>Asset:</strong> {order.assetId?.name}</p>
        <p><strong>Description:</strong> {order.desc}</p>
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Due Date:</strong> {order.planId?.nextMaintenanceDate}</p>
        <p><strong>Requested By:</strong> {order.userId?.name} (USR-{order.userId?.id})</p>
        <p>{order.assetId?.name} was requested by {order.userId?.name} on {order.requestedDate} for {order.frequency} days. The problem is {order.desc} and it's type is {order.assetId?.type}. Complete it by {order.planId?.nextMaintenanceDate}.</p>
      </div>
    )}
  </Modal>
);

const WorkOrders = ({ workorders, setApiCallMade }) => {
  const [orders, setOrders] = useState([]);
  const [statusById, setStatusById] = useState({});
  const [completionData, setCompletionData] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    setOrders(workorders.filter(o => o?.status !== 'Completed'));
  }, [workorders]);

  const handleStatusChange = (order, status) => {
    setStatusById(prev => ({ ...prev, [order.workId]: status }));
  };

  const handleCompletionChange = (workId, field, value) => {
    setCompletionData(prev => ({
      ...prev,
      [workId]: { ...prev[workId], [field]: value }
    }));
  };

  const handleUpdate = async (order) => {
    const status = statusById[order.workId];
    console.log(status);
    try {
      const response = await axios.put(`http://localhost:9092/workorder/updateStatus/${order.workId}`, { status });
      
      if (response.status === 200) {
        if (status === 'Completed') {
          const taskData = {
            descrip: completionData[order.workId]?.description || '',
            estHours: completionData[order.workId]?.hours || '',
            technicianId: order.techId.id,
            workId: order.workId,
            completedDate: new Date().toLocaleDateString('en-CA')
          };
          console.log(taskData);
          await axios.post('http://localhost:9092/task/save', taskData);
          setOrders(prev => prev.filter(o => o.workId !== order.workId));
        }
        setStatusById(prev => {
          const { [order.workId]: removed, ...rest } = prev;
          return rest;
        });
        setApiCallMade(prev => !prev);
      }
    } catch (error) {
      console.error('Error updating work order:', error);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
      <h2>My Work Orders</h2>
      <p style={{ marginBottom: '30px' }}>Manage and update your assigned work orders</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
        {orders.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
            No assigned work orders yet.
          </div>
        ) : (
          orders.map(order => (
            <WorkOrderCard
              key={order.workId}
              order={order}
              status={statusById[order.workId]}
              onStatusChange={(status) => handleStatusChange(order, status)}
              onUpdate={() => handleUpdate(order)}
              onViewDetails={(order) => {
                setSelectedOrder(order);
                setIsDetailsOpen(true);
              }}
              completionData={completionData[order.workId]}
              onCompletionChange={(field, value) => handleCompletionChange(order.workId, field, value)}
            />
          ))
        )}
      </div>

      <WorkOrderDetailsModal 
        isOpen={isDetailsOpen} 
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedOrder(null);
        }} 
        order={selectedOrder} 
      />
    </motion.div>
  );
};

export default WorkOrders;