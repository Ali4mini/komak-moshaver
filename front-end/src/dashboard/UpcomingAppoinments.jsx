import React, { useState, useEffect, useRef, useCallback } from 'react';
// import axios from 'axios'; // Uncomment when ready for API

// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api'; // Uncomment
// const getAuthToken = () => localStorage.getItem('authToken'); // Uncomment and adapt

//TODO: use CustomDatepicker in this component
//TODO: make the time selecter 24h
//TODO: connect to backend server
const WidgetCard = ({ title, children, onAddClick, className = "" }) => (
  <div className={`bg-white shadow-lg rounded-xl p-6 md:p-8 flex flex-col ${className}`}>
    <div className="flex justify-between items-center mb-5 md:mb-6">
      <h2 className="text-xl lg:text-2xl font-semibold text-gray-700">{title}</h2>
      {onAddClick && (
        <button
          onClick={onAddClick}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          + افزودن قرار
        </button>
      )}
    </div>
    {children}
  </div>
);

const AppointmentItem = ({ time, subject, client, type }) => {
  const typeIcons = {
    showing: '🏠', meeting: '🤝', call: '📞', closing: '✍️', general: '🗓️'
  };
  const icon = typeIcons[type] || typeIcons.general;

  return (
    <li className="py-3 md:py-4 border-b border-gray-200 last:border-b-0">
      <div className="flex items-start space-x-reverse space-x-3">
        <div className="p-2 bg-gray-100 rounded-full text-lg">
          {icon}
        </div>
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-base font-semibold text-gray-800">{subject}</h4>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
              {time}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            مشتری: <span className="font-medium">{client}</span>
          </p>
        </div>
      </div>
    </li>
  );
};

const UpcomingAppointments = () => {
  const [appointments, setAppointments] = useState([
    // Initial static data
    { id: 1, time: '۱۴:۳۰ امروز', subject: 'بازدید آپارتمان (کد: ۱۰۲ نیاوران)', client: 'خانم مرادی', type: 'showing', date: new Date().toISOString().split('T')[0] },
    { id: 2, time: 'فردا ۱۰:۰۰', subject: 'جلسه قرارداد (کد: ۲۰۷ ولنجک)', client: 'آقای صالحی', type: 'closing', date: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
    { id: 3, time: 'فردا ۱۶:۰۰', subject: 'تماس پیگیری با آقای نظری', client: 'آقای نظری', type: 'call', date: new Date(Date.now() + 86400000).toISOString().split('T')[0]},
    { id: 4, time: 'پس‌فردا ۱۱:۰۰', subject: 'مشاوره خرید ملک تجاری', client: 'شرکت آواپرداز', type: 'meeting', date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]},
    { id: 5, time: '۲۵ تیر، ۱۷:۰۰', subject: 'بازدید ویلا (کردان)', client: 'خانواده رضایی', type: 'showing', date: '1403-04-25'}, // Jalali string example
    { id: 6, time: '۲۸ تیر، ۰۹:۳۰', subject: 'جلسه با تیم فروش', client: 'داخلی', type: 'meeting', date: '1403-04-28'},
  ]);

  const [isLoading, setIsLoading] = useState(false); // For API calls
  const [error, setError] = useState(null);        // For API calls

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const [newAppointment, setNewAppointment] = useState({
    subject: '',
    client: '',
    date: '', // YYYY-MM-DD
    time: '', // HH:MM
    type: 'general',
  });
  const formInputRef = useRef(null);

  // Placeholder for API fetching logic
  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    // const token = getAuthToken();
    // if (!token) {
    //   setError("Authentication required.");
    //   setIsLoading(false);
    //   return;
    // }
    // try {
    //   const response = await axios.get(`${API_BASE_URL}/appointments/upcoming`, { headers: { Authorization: `Bearer ${token}` } });
    //   setAppointments(response.data.results || response.data);
    // } catch (err) {
    //   setError("Failed to load appointments.");
    //   console.error(err);
    // } finally {
    //   setIsLoading(false);
    // }
    // For now, just simulate loading
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  useEffect(() => {
    // fetchAppointments(); // Call this when ready for API
  }, [fetchAppointments]);


  const handleOpenModal = () => setIsModalOpen(true);

  useEffect(() => {
    if (isModalOpen && formInputRef.current) {
      formInputRef.current.focus();
    }
  }, [isModalOpen]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewAppointment({ subject: '', client: '', date: '', time: '', type: 'general' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAppointment(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAppointment = async (e) => {
    e.preventDefault();
    if (!newAppointment.subject || !newAppointment.date || !newAppointment.time) {
      alert("لطفاً عنوان، تاریخ و زمان قرار را وارد کنید.");
      return;
    }
    const appointmentToAdd = {
      id: Date.now(), // Temporary ID
      subject: newAppointment.subject,
      client: newAppointment.client || 'نامشخص',
      // Combine date and time for display, or store them as backend expects
      // For simplicity in display, we'll create a displayTime. Backend might want full ISO datetime.
      time: `${newAppointment.date} ${newAppointment.time}`, // This needs better formatting based on locale
      type: newAppointment.type,
      date: newAppointment.date, // Store original date for sorting/filtering
    };

    // Placeholder for API call
    // try {
    //   const response = await axios.post(`${API_BASE_URL}/appointments/`, appointmentToAdd, { headers: { Authorization: `Bearer ${getAuthToken()}` } });
    //   setAppointments(prev => [response.data, ...prev].sort((a,b) => new Date(a.date) - new Date(b.date) || a.time.localeCompare(b.time)));
    // } catch (err) {
    //   setError("Failed to add appointment.");
    //   console.error(err);
    //   return; // Don't close modal on error
    // }

    // Optimistic update for now
    setAppointments(prev => [...prev, appointmentToAdd].sort((a,b) => new Date(a.date + ' ' + a.time.split(' ')[1]) - new Date(b.date + ' ' + b.time.split(' ')[1]))); // Simple sort
    handleCloseModal();
  };

  const MAX_APPOINTMENTS_VISIBLE = 3;
  const sortedAppointments = [...appointments].sort((a,b) => new Date(a.date + ' ' + a.time.split(' ')[1]) - new Date(b.date + ' ' + b.time.split(' ')[1])); // Simple sort by date then time
  const visibleAppointments = showAll ? sortedAppointments : sortedAppointments.slice(0, MAX_APPOINTMENTS_VISIBLE);

  if (isLoading) {
    return (
      <WidgetCard title="قرارهای ملاقات پیش رو" onAddClick={handleOpenModal}>
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-500 py-8">در حال بارگیری قرارها...</p>
        </div>
      </WidgetCard>
    );
  }

  if (error) {
     return (
      <WidgetCard title="قرارهای ملاقات پیش رو" onAddClick={handleOpenModal}>
        <div className="flex-grow flex items-center justify-center">
          <p className="text-red-500 py-8">{error}</p>
        </div>
      </WidgetCard>
    );
  }

  return (
    <>
      <WidgetCard title="قرارهای ملاقات پیش رو" onAddClick={handleOpenModal}>
        {visibleAppointments.length > 0 ? (
          <ul className="space-y-0 divide-y divide-gray-200 -mb-3 md:-mb-4 flex-grow overflow-y-auto max-h-[350px] md:max-h-[400px] pr-1">
            {visibleAppointments.map((appt) => (
              <AppointmentItem
                key={appt.id}
                time={appt.time} // This will show date + time if combined in handleAddAppointment
                subject={appt.subject}
                client={appt.client}
                type={appt.type}
              />
            ))}
          </ul>
        ) : (
          <div className="flex-grow flex items-center justify-center">
            <p className="text-gray-500 py-8 text-center">هیچ قرار ملاقاتی برنامه‌ریزی نشده است.</p>
          </div>
        )}
        {appointments.length > MAX_APPOINTMENTS_VISIBLE && (
          <div className="mt-6 text-center pt-4 border-t border-gray-100">
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {showAll ? `نمایش کمتر (${MAX_APPOINTMENTS_VISIBLE})` : `مشاهده همه قرارها (${appointments.length})`}
            </button>
          </div>
        )}
      </WidgetCard>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4" onClick={handleCloseModal}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg transform transition-all" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">ثبت قرار ملاقات جدید</h3>
            <form onSubmit={handleAddAppointment} className="space-y-4">
              <div>
                <label htmlFor="apptSubject" className="block text-sm font-medium text-gray-700 mb-1">عنوان قرار</label>
                <input
                  id="apptSubject"
                  name="subject"
                  ref={formInputRef}
                  type="text"
                  value={newAppointment.subject}
                  onChange={handleInputChange}
                  placeholder="مثال: بازدید ملک نیاوران"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="apptClient" className="block text-sm font-medium text-gray-700 mb-1">مشتری (اختیاری)</label>
                <input
                  id="apptClient"
                  name="client"
                  type="text"
                  value={newAppointment.client}
                  onChange={handleInputChange}
                  placeholder="مثال: آقای رضایی"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="apptDate" className="block text-sm font-medium text-gray-700 mb-1">تاریخ</label>
                  <input
                    id="apptDate"
                    name="date"
                    type="date"
                    value={newAppointment.date}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="apptTime" className="block text-sm font-medium text-gray-700 mb-1">زمان</label>
                  <input
                    id="apptTime"
                    name="time"
                    type="time"
                    value={newAppointment.time}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
               <div>
                <label htmlFor="apptType" className="block text-sm font-medium text-gray-700 mb-1">نوع قرار</label>
                <select
                  id="apptType"
                  name="type"
                  value={newAppointment.type}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="general">عمومی</option>
                  <option value="showing">بازدید ملک</option>
                  <option value="meeting">جلسه حضوری</option>
                  <option value="call">تماس تلفنی</option>
                  <option value="closing">جلسه قرارداد</option>
                </select>
              </div>
              <div className="flex justify-end space-x-reverse space-x-3 pt-4">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">
                  انصراف
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">
                  ذخیره قرار
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UpcomingAppointments;
