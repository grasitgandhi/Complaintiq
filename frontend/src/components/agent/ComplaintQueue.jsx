import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, Filter } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

// Severity Badge Component
function SeverityBadge({ severity }) {
  const severityConfig = {
    P1: { bg: '#E83A4A', label: 'P1 - Critical', glow: true },
    P2: { bg: '#F06A1A', label: 'P2 - High', glow: false },
    P3: { bg: '#EDA500', label: 'P3 - Medium', glow: false },
  };

  const config = severityConfig[severity] || severityConfig.P3;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={config.glow ? 'animate-pulse-glow' : ''}
      style={{
        display: 'inline-block',
        backgroundColor: config.bg,
        color: '#fff',
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 600,
        boxShadow: config.glow ? `0 0 10px ${config.bg}80` : 'none',
      }}
    >
      {config.label}
    </motion.div>
  );
}

// Status Badge Component
function StatusBadge({ status }) {
  const statusConfig = {
    new: { bg: '#3B82F6', label: 'New' },
    inprogress: { bg: '#F59E0B', label: 'In Progress' },
    awaitingcustomer: { bg: '#8B5CF6', label: 'Awaiting Customer' },
    draftready: { bg: '#6366F1', label: 'Draft Ready' },
    resolved: { bg: '#10B981', label: 'Resolved' },
    closed: { bg: '#6B7280', label: 'Closed' },
  };

  const normalized = (status || '').toString().toLowerCase().replace(/\s/g, '');
  const config = statusConfig[normalized] || statusConfig.new;

  return (
    <span
      style={{
        display: 'inline-block',
        backgroundColor: config.bg,
        color: '#fff',
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 600,
      }}
    >
      {config.label}
    </span>
  );
}

export default function ComplaintQueue({ complaints = [], loading = false, onOpenComplaint }) {
  const { isDark } = useTheme();
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [productFilter, setProductFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const data = useMemo(() => {
    return (complaints || []).map((c) => ({
      id: c.reference_number || c.id,
      complaintId: c.id,
      referenceNumber: c.reference_number,
      date: c.filed_at || c.created_at,
      customer: c.customer_name || c.customer_account || 'Unknown',
      product: c.product_category || 'OTHER',
      channel: c.channel || 'Online Portal',
      description: c.complaint_text || c.ai_complaint_type || 'No description',
      severity: c.sla_tier || c.ai_severity || 'P3',
      status: c.status || 'New',
      slaDeadline: c.sla_deadline || c.incident_date || c.filed_at,
    }));
  }, [complaints]);

  const products = useMemo(() => {
    const set = new Set(data.map((row) => row.product));
    return Array.from(set).sort();
  }, [data]);

  const statuses = [
    { value: 'new', label: 'New' },
    { value: 'inprogress', label: 'In Progress' },
    { value: 'awaitingcustomer', label: 'Awaiting Customer' },
    { value: 'draftready', label: 'Draft Ready' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
  ];

  // Filtering logic
  const filteredData = useMemo(() => {
    let result = data;

    // Search filter
    if (globalFilter) {
      result = result.filter(
        (row) =>
          row.id.toLowerCase().includes(globalFilter.toLowerCase()) ||
          row.customer.toLowerCase().includes(globalFilter.toLowerCase()) ||
          row.channel.toLowerCase().includes(globalFilter.toLowerCase()) ||
          row.description.toLowerCase().includes(globalFilter.toLowerCase())
      );
    }

    // Product filter
    if (productFilter.length > 0) {
      result = result.filter((row) => productFilter.includes(row.product));
    }

    // Status filter
    if (statusFilter.length > 0) {
      result = result.filter((row) =>
        statusFilter.includes((row.status || '').toString().toLowerCase().replace(/\s/g, ''))
      );
    }

    return result;
  }, [data, globalFilter, productFilter, statusFilter]);

  const columns = [
    {
      accessorKey: 'id',
      header: 'Complaint ID',
      cell: (info) => <span className="font-mono text-sm font-semibold">{info.getValue()}</span>,
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: (info) => {
        const value = info.getValue();
        if (!value) return '—';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '—';
        return date.toLocaleDateString('en-IN', {
          year: '2-digit',
          month: 'short',
          day: '2-digit',
        });
      },
    },
    {
      accessorKey: 'customer',
      header: 'Customer',
      cell: (info) => <span>{info.getValue()}</span>,
    },
    {
      accessorKey: 'product',
      header: 'Product',
      cell: (info) => (
        <span
          style={{
            display: 'inline-block',
            backgroundColor: isDark ? 'rgba(0, 198, 181, 0.2)' : 'rgba(0, 198, 181, 0.1)',
            color: '#00C6B5',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 'medium',
          }}
        >
          {info.getValue()}
        </span>
      ),
    },
    {
      accessorKey: 'channel',
      header: 'Source',
      cell: (info) => (
        <span className="text-sm text-slate-700 dark:text-slate-200">
          {info.getValue()}
        </span>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: (info) => <span className="text-sm">{String(info.getValue()).slice(0, 120)}</span>,
    },
    {
      accessorKey: 'severity',
      header: 'Severity',
      cell: (info) => <SeverityBadge severity={info.getValue()} />,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (info) => <StatusBadge status={info.getValue()} />,
    },
    {
      accessorKey: 'slaDeadline',
      header: 'SLA Deadline',
      cell: (info) => {
        const value = info.getValue();
        if (!value) return '—';
        const deadlineDate = new Date(value);
        if (Number.isNaN(deadlineDate.getTime())) return '—';
        const nextDay = new Date();
        nextDay.setDate(nextDay.getDate() + 1);
        const isDeadlinePassed = deadlineDate < nextDay;

        return (
          <span
            style={{
              color: isDeadlinePassed ? '#E83A4A' : '#10B981',
              fontSize: '12px',
              fontWeight: 'medium',
            }}
          >
            {deadlineDate.toLocaleDateString('en-IN', {
              month: 'short',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Action',
      cell: (info) => {
        const row = info.row.original;
        const complaintKey = row.complaintId || row.referenceNumber || row.id;
        return (
          <button
            onClick={() => onOpenComplaint?.(complaintKey)}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              background: '#00B4A6',
              color: '#FFFFFF',
              border: '1px solid #009688',
              cursor: 'pointer',
            }}
          >
            Open
          </button>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const toggleProduct = (product) => {
    setProductFilter((prev) =>
      prev.includes(product) ? prev.filter((p) => p !== product) : [...prev, product]
    );
  };

  const toggleStatus = (status) => {
    setStatusFilter((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  return (
    <div className="p-6 min-h-screen bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">
          Complaint Queue
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Manage and resolve customer complaints efficiently
        </p>

        {/* Filters Container */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="relative z-30 bg-white/90 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 p-4 mb-6 rounded-lg shadow-glass"
        >
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              />
              <input
                type="text"
                placeholder="Search by Complaint ID, Customer, or Description..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 transition-colors duration-300"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex gap-4 flex-wrap">
              {/* Product Filter */}
              <div className="relative">
                <button
                  onClick={() => setShowProductDropdown(!showProductDropdown)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-300"
                >
                  <Filter size={16} />
                  Product
                  <ChevronDown size={16} />
                </button>

                <AnimatePresence>
                  {showProductDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 rounded-lg shadow-xl p-2 z-50 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                    >
                      {products.map((product) => (
                        <label
                          key={product}
                          className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded hover:bg-slate-50 dark:hover:bg-white/5"
                        >
                          <input
                            type="checkbox"
                            checked={productFilter.includes(product)}
                            onChange={() => toggleProduct(product)}
                            style={{ cursor: 'pointer' }}
                          />
                          <span className="text-slate-800 dark:text-slate-100">
                            {product}
                          </span>
                        </label>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Status Filter */}
              <div className="relative">
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-300"
                >
                  <Filter size={16} />
                  Status
                  <ChevronDown size={16} />
                </button>

                <AnimatePresence>
                  {showStatusDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 rounded-lg shadow-xl p-2 z-50 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                    >
                      {statuses.map((status) => (
                        <label
                          key={status.value}
                          className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded hover:bg-slate-50 dark:hover:bg-white/5"
                        >
                          <input
                            type="checkbox"
                            checked={statusFilter.includes(status.value)}
                            onChange={() => toggleStatus(status.value)}
                            style={{ cursor: 'pointer' }}
                          />
                          <span className="text-slate-800 dark:text-slate-100">
                            {status.label}
                          </span>
                        </label>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Active Filters Display */}
              {(productFilter.length > 0 || statusFilter.length > 0) && (
                <div className="flex gap-2 flex-wrap">
                  {productFilter.map((product) => (
                    <motion.span
                      key={product}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="px-3 py-1 rounded-full flex items-center gap-1 text-xs font-medium"
                      style={{
                        background: 'rgba(0, 198, 181, 0.2)',
                        color: '#00C6B5',
                      }}
                    >
                      {product}
                      <button onClick={() => toggleProduct(product)}>×</button>
                    </motion.span>
                  ))}
                  {statusFilter.map((status) => (
                    <motion.span
                      key={status}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="px-3 py-1 rounded-full flex items-center gap-1 text-xs font-medium"
                      style={{
                        background: 'rgba(100, 200, 255, 0.2)',
                        color: '#64C8FF',
                      }}
                    >
                      {statuses.find((s) => s.value === status)?.label}
                      <button onClick={() => toggleStatus(status)}>×</button>
                    </motion.span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Table Container */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="bg-white/80 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-lg shadow-glass overflow-hidden"
        >
          <div className="table-container overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                  {table.getHeaderGroups()[0].headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-left font-semibold cursor-pointer select-none text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors duration-300"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted()
                          ? header.column.getIsSorted() === 'desc'
                            ? ' 🔽'
                            : ' 🔼'
                          : ''}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-6 py-8 text-center text-slate-500 dark:text-slate-400"
                    >
                      Loading complaints...
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence mode="wait">
                    {table.getRowModel().rows.length > 0 ? (
                      table.getRowModel().rows.map((row, idx) => (
                        <motion.tr
                          key={row.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ delay: idx * 0.05, duration: 0.2 }}
                          className="border-b border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors duration-200 text-slate-900 dark:text-slate-100"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="px-6 py-4">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={columns.length}
                          className="px-6 py-8 text-center text-slate-500 dark:text-slate-400"
                        >
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            No complaints found. Try adjusting your filters.
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-4 text-sm border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 transition-colors duration-300"
          >
            Showing {table.getFilteredRowModel().rows.length} of {data.length} complaints
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
