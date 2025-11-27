import React, { useState, useEffect } from 'react';
import api from '../../config/axios'; // <--- CENTRALIZED API
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend 
} from 'recharts';
import { Eye, X, Receipt, Calendar, User, CreditCard } from 'lucide-react';

const OwnerSales = () => {
  // --- STATE: DASHBOARD ---
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); 
  const [filterType, setFilterType] = useState('monthly'); 
  
  const [data, setData] = useState({
    chartData: [], serviceData: [], recentSales: [], stats: { today: 0, thisMonth: 0, thisYear: 0 }
  });

  // --- STATE: HISTORY TABLE & MODAL ---
  const [historyTransactions, setHistoryTransactions] = useState([]);
  const [historyFilters, setHistoryFilters] = useState({
    startDate: '', endDate: '', category: 'All', paymentMethod: 'All'
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);

  // --- CONSTANTS ---
  const COLORS = ['#F97316', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];
  const months = [
    { val: 1, name: 'January' }, { val: 2, name: 'February' }, { val: 3, name: 'March' },
    { val: 4, name: 'April' }, { val: 5, name: 'May' }, { val: 6, name: 'June' },
    { val: 7, name: 'July' }, { val: 8, name: 'August' }, { val: 9, name: 'September' },
    { val: 10, name: 'October' }, { val: 11, name: 'November' }, { val: 12, name: 'December' }
  ];

  const getPeriodLabel = () => {
    if (filterType === 'daily') {
        const m = months.find(m => m.val == selectedMonth)?.name;
        return `${m} ${selectedYear}`;
    }
    return `${selectedYear}`;
  };

  // --- EFFECTS ---
  useEffect(() => {
    api.get('/api/owner/sales/years').then(res => {
        setYears(res.data);
        if(res.data.length === 0) setYears([new Date().getFullYear()]);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/api/owner/sales', {
          params: { year: selectedYear, month: selectedMonth, filterType: filterType }
        });
        const formattedChart = res.data.chartData.map(i => ({...i, total: parseFloat(i.total)}));
        const formattedService = res.data.serviceData.map(i => ({name: i.name, value: parseFloat(i.value)}));
        setData({ ...res.data, chartData: formattedChart, serviceData: formattedService });
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, [selectedYear, selectedMonth, filterType]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/api/owner/sales/history', { params: historyFilters });
        setHistoryTransactions(res.data);
      } catch (err) { console.error(err); }
    };
    fetchHistory();
  }, [historyFilters]);

  // --- HANDLERS ---
  const handleHistoryFilterChange = (e) => setHistoryFilters({ ...historyFilters, [e.target.name]: e.target.value });
  
  const resetHistoryFilters = () => setHistoryFilters({ startDate: '', endDate: '', category: 'All', paymentMethod: 'All' });

  const handleViewDetails = (transaction) => {
    setSelectedTxn(transaction);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTxn(null);
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen relative">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sales Overview</h1>
        <span className="text-sm text-gray-500">Date: {new Date().toLocaleDateString()}</span>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-green-500">
          <p className="text-gray-500 text-sm font-medium uppercase">Sales Today</p>
          <h2 className="text-3xl font-bold text-gray-800 mt-2">₱{parseFloat(data.stats.today || 0).toLocaleString()}</h2>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm font-medium uppercase">This Month</p>
          <h2 className="text-3xl font-bold text-gray-800 mt-2">₱{parseFloat(data.stats.thisMonth || 0).toLocaleString()}</h2>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-orange-500">
          <p className="text-gray-500 text-sm font-medium uppercase">Total Year</p>
          <h2 className="text-3xl font-bold text-gray-800 mt-2">₱{parseFloat(data.stats.thisYear || 0).toLocaleString()}</h2>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3 items-center">
      {/* YEAR SELECTOR */}
        <select 
          value={selectedYear} 
          onChange={(e) => setSelectedYear(e.target.value)} 
          className="border border-gray-300 text-gray-700 p-2 rounded text-sm font-medium outline-none focus:border-orange-500"
        >
          {years.map(yr => <option key={yr} value={yr}>{yr}</option>)}
        </select>

        {/* MONTH SELECTOR */}
        {filterType === 'daily' && (
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)} 
            className="border border-gray-300 text-gray-700 p-2 rounded text-sm font-medium outline-none focus:border-orange-500"
          >
            {months.map(m => <option key={m.val} value={m.val}>{m.name}</option>)}
          </select>
        )}
      </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {['daily', 'weekly', 'monthly'].map((type) => (
            <button key={type} onClick={() => setFilterType(type)} className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize ${filterType === type ? 'bg-white text-orange-600 shadow' : 'text-gray-500'}`}>{type}</button>
          ))}
        </div>
      </div>

      {/* GRAPHS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Revenue Trend ({getPeriodLabel()})</h2>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{fontSize: 12}} axisLine={false} tickLine={false}/>
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val)=>`₱${val}`}/>
                <RechartsTooltip formatter={(val)=>[ `₱${Number(val).toLocaleString()}`, 'Revenue']}/>
                <Bar dataKey="total" radius={[4,4,0,0]} barSize={40}>{data.chartData.map((_, i) => <Cell key={i} fill="#F97316" />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Sales by Service</h2>
            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={data.serviceData} cx="50%" cy="45%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {data.serviceData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <RechartsTooltip formatter={(val) => `₱${Number(val).toLocaleString()}`} />
                        <Legend verticalAlign="bottom" align="center" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      <div className="border-t border-gray-200 my-10"></div>

      {/* ================= HISTORY TABLE & FILTERS ================= */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Transaction History</h2>
        <p className="text-gray-500 text-sm">View detailed records of all transactions.</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-4 items-end border border-gray-100">
          
          {/* Start Date */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500">Start Date</label>
            <input 
                type="date" 
                name="startDate" 
                value={historyFilters.startDate} 
                onChange={handleHistoryFilterChange} 
                className="border border-gray-300 p-2 rounded text-sm outline-none hover:border-orange-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors cursor-pointer"
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500">End Date</label>
            <input 
                type="date" 
                name="endDate" 
                value={historyFilters.endDate} 
                onChange={handleHistoryFilterChange} 
                className="border border-gray-300 p-2 rounded text-sm outline-none hover:border-orange-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors cursor-pointer"
            />
          </div>
          
          {/* Category Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500">Category</label>
            <select 
                name="category" 
                value={historyFilters.category} 
                onChange={handleHistoryFilterChange} 
                className="border border-gray-300 p-2 rounded text-sm min-w-[150px] outline-none hover:border-orange-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors cursor-pointer"
            >
                <option value="All">All Categories</option>
                <option value="Kubo">Kubo</option>
                <option value="Cabin">Cabin</option>
                <option value="Room">Room</option>
                <option value="Table">Table</option>
                <option value="Pool">Pool</option>
            </select>
          </div>

          {/* Payment Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500">Payment</label>
            <select 
                name="paymentMethod" 
                value={historyFilters.paymentMethod} 
                onChange={handleHistoryFilterChange} 
                className="border border-gray-300 p-2 rounded text-sm min-w-[150px] outline-none hover:border-orange-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors cursor-pointer"
            >
                <option value="All">All</option>
                <option value="Cash">Cash</option>
                <option value="GCash">GCash</option>
                <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          <button onClick={resetHistoryFilters} className="px-4 py-2 bg-gray-100 text-sm rounded hover:bg-gray-200 ml-auto transition-colors font-medium text-gray-600">Reset</button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
            <tr>
              <th className="py-4 pl-6">Date</th>
              <th className="py-4">Service</th>
              <th className="py-4 text-right">Amount</th>
              <th className="py-4 text-center pr-6">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {historyTransactions.length > 0 ? historyTransactions.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="py-3 pl-6 text-gray-700">
                    {new Date(t.date).toLocaleDateString()}
                    <div className="text-xs text-gray-400">{new Date(t.date).toLocaleTimeString()}</div>
                </td>
                <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium 
                        ${t.serviceType === 'Kubo' || t.serviceType === 'Cottage' ? 'bg-green-100 text-green-800' : ''}
                        ${t.serviceType === 'Room' || t.serviceType === 'Cabin' ? 'bg-blue-100 text-blue-800' : ''}
                        ${t.serviceType === 'Table' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${t.serviceType === 'Entrance' ? 'bg-gray-100 text-gray-800' : ''}
                    `}>
                        {t.serviceType}
                    </span>
                </td>
                <td className="py-3 text-right font-bold text-orange-600">₱{parseFloat(t.amount).toLocaleString()}</td>
                <td className="py-3 pr-6 text-center">
                  <button onClick={() => handleViewDetails(t)} className="bg-blue-50 text-blue-600 p-2 rounded-full hover:bg-blue-100 transition"><Eye size={18} /></button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="4" className="text-center py-6 text-gray-400">No records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL - UPDATED OVERLAY ================= */}
      {isModalOpen && selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden relative">
            
            {/* Modal Header - Clean White */}
            <div className="px-4 py-3 md:px-6 md:py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Receipt className="text-orange-500" size={20} />
                <h3 className="font-bold text-gray-800 text-base md:text-lg">Transaction Details</h3>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-4 md:px-8 pb-4 md:pb-8 space-y-4 md:space-y-6">
              
              {/* Total Amount Section - Centered */}
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Total Amount Paid</p>
                <h2 className="text-3xl md:text-4xl font-bold text-orange-600">₱{parseFloat(selectedTxn.amount).toLocaleString()}</h2>
                <div className="mt-3">
                  <span className="inline-block px-4 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full">
                    {selectedTxn.paymentMethod}
                  </span>
                </div>
              </div>

              {/* Details List - Styled Like Cards */}
              <div className="space-y-3">
                
                {/* Customer Name */}
                <div className="flex items-start gap-4 p-3 rounded-lg border border-gray-100">
                    <div className="mt-1"><User className="text-gray-400" size={20}/></div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Customer Name</p>
                        <p className="font-semibold text-gray-800 text-base">{selectedTxn.customer_name || 'Walk-in Guest'}</p>
                    </div>
                </div>

                {/* Date */}
                <div className="flex items-start gap-4 p-3 rounded-lg border border-gray-100">
                    <div className="mt-1"><Calendar className="text-gray-400" size={20}/></div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Transaction Date</p>
                        <p className="font-semibold text-gray-800 text-base">{new Date(selectedTxn.date).toLocaleString()}</p>
                    </div>
                </div>

                {/* Service Type */}
                <div className="flex items-start gap-4 p-3 rounded-lg border border-gray-100">
                    <div className="mt-1"><CreditCard className="text-gray-400" size={20}/></div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Service Type</p>
                        <p className="font-semibold text-gray-800 text-base capitalize">{selectedTxn.serviceType}</p>
                    </div>
                </div>
                
                {/* Divider Line */}
                <div className="border-t border-dashed border-gray-200 my-4"></div>

                {/* Check In/Out - Clean Justified */}
                <div className="flex justify-between items-center px-2">
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">Check-In</p>
                        <p className="font-medium text-gray-700 text-sm mt-0.5">
                            {selectedTxn.checkIn ? new Date(selectedTxn.checkIn).toLocaleDateString() : 'N/A'}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">Check-Out</p>
                        <p className="font-medium text-gray-700 text-sm mt-0.5">
                            {selectedTxn.checkOut ? new Date(selectedTxn.checkOut).toLocaleDateString() : 'N/A'}
                        </p>
                    </div>
                </div>

              </div>
            </div>

            {/* Footer - Clean White with Border Top */}
            <div className="px-4 py-3 md:px-6 md:py-4 flex justify-end border-t border-gray-100">
              <button 
                onClick={closeModal} 
                className="px-6 py-2 bg-white border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};

export default OwnerSales;