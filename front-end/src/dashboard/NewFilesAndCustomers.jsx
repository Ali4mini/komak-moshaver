import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../common/api.js';

const getAuthToken = () => localStorage.getItem('access_token');

const getFormattedDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Reuse your existing WidgetCard component
const WidgetCard = ({ title, children, onAddClick, className = "" }) => (
  <div className={`bg-white shadow-lg rounded-xl p-6 md:p-8 flex flex-col ${className}`}>
    <div className="flex justify-between items-center mb-5 md:mb-6">
      <h2 className="text-lg lg:text-xl font-semibold text-gray-700">{title}</h2>
      {onAddClick && (
        <button
          onClick={onAddClick}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          + مشاهده همه
        </button>
      )}
    </div>
    {children}
  </div>
);

const FileItem = ({ id, type, owner, address, createdAt }) => {
  const typeIcons = {
    sell: '💰', rent: '🏠', apartment: '🏢', land: '🌱', store: '🏪', vila: '🏡'
  };
  
  const fileTypes = {
    sell: 'فروش', rent: 'اجاره', apartment: 'آپارتمان', land: 'زمین', store: 'مغازه', vila: 'ویلا'
  };

  const icon = typeIcons[type] || typeIcons.sell;
  const typeName = fileTypes[type] || type;

  return (
    <li className="py-3 md:py-4 border-b border-gray-200 last:border-b-0">
      <div className="flex items-start space-x-reverse space-x-3">
        <div className="p-2 bg-gray-100 rounded-full text-lg">
          {icon}
        </div>
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-base font-semibold text-gray-800">
              {typeName} - کد: {id}
            </h4>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
              {new Date(createdAt).toLocaleDateString('fa-IR')}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            مالک: <span className="font-medium">{owner || 'نامشخص'}</span>
          </p>
          <p className="text-sm text-gray-600 mt-1">
            آدرس: <span className="font-medium">{address || 'ثبت نشده'}</span>
          </p>
        </div>
      </div>
    </li>
  );
};

const CustomerItem = ({ id, name, phone, type, createdAt }) => {
  const typeIcons = {
    buy: '🛒', rent: '🏠', company: '🏢', individual: '👤'
  };
  
  const customerTypes = {
    buy: 'خریدار', rent: 'متقاضی اجاره', company: 'شرکت', individual: 'شخصی'
  };

  const icon = typeIcons[type] || typeIcons.individual;
  const typeName = customerTypes[type] || type;

  return (
    <li className="py-3 md:py-4 border-b border-gray-200 last:border-b-0">
      <div className="flex items-start space-x-reverse space-x-3">
        <div className="p-2 bg-gray-100 rounded-full text-lg">
          {icon}
        </div>
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-base font-semibold text-gray-800">
              {name || 'مشتری جدید'}
            </h4>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
              {typeName}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            تلفن: <span className="font-medium">{phone || 'ثبت نشده'}</span>
          </p>
          <p className="text-sm text-gray-600 mt-1">
            تاریخ ثبت: <span className="font-medium">
              {new Date(createdAt).toLocaleDateString('fa-IR')}
            </span>
          </p>
        </div>
      </div>
    </li>
  );
};

const NewFilesAndCustomers = () => {
  const [files, setFiles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('files');
  const [showAll, setShowAll] = useState(false);
  const [personData, setPersonData] = useState({});

const fetchData = useCallback(async () => {
  setIsLoading(true);
  setError(null);
  const token = getAuthToken();
  
  if (!token) {
    setError("نیاز به احراز هویت");
    setIsLoading(false);
    return;
  }

  try {
    const headers = { Authorization: `Bearer ${token}` };
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const formattedToday = getFormattedDate(today)
      const formattedYesterday = getFormattedDate(yesterday)
    
    // Fetch recent files
    const filesResponse = await api.get(`listing/?created__date__gt=${formattedYesterday}&created__date__lte=${formattedToday}`, { headers });
    const filesData = filesResponse.data.results || filesResponse.data;
    setFiles(filesData);
    
    // Fetch recent customers
    const customersResponse = await api.get(`listing/customers/?created__date__gte=${formattedYesterday}&created__date__lte=${formattedToday}`, { headers });
    const customersData = customersResponse.data.results || customersResponse.data;
    setCustomers(customersData);

    // Collect all unique person IDs needed
    const personIds = new Set();
    filesData.forEach(file => file.owner && personIds.add(file.owner));
    customersData.forEach(customer => customer.id && personIds.add(customer.id));

    // Fetch all person data in parallel
    const personResponses = await Promise.all(
      Array.from(personIds).map(id => 
        api.get(`common/persons/${id}`, { headers }).catch(err => null)
      )
    );

    // Store person data in an object with IDs as keys
    const personDataMap = {};
    personResponses.forEach((response, index) => {
      if (response && response.data) {
        personDataMap[Array.from(personIds)[index]] = response.data;
      }
    });
    setPersonData(personDataMap);
    
  } catch (err) {
    setError("خطا در دریافت اطلاعات");
    console.error(err);
  } finally {
    setIsLoading(false);
  }
}, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const MAX_ITEMS_VISIBLE = 3;
  const visibleFiles = showAll ? files : files.slice(0, MAX_ITEMS_VISIBLE);
  const visibleCustomers = showAll ? customers : customers.slice(0, MAX_ITEMS_VISIBLE);

  if (isLoading) {
    return (
      <WidgetCard title="فایل های و مشتریان جدید">
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-500 py-8">در حال بارگیری اطلاعات...</p>
        </div>
      </WidgetCard>
    );
  }

  if (error) {
    return (
      <WidgetCard title="فایل های و مشتریان جدید">
        <div className="flex-grow flex items-center justify-center">
          <p className="text-red-500 py-8">{error}</p>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard 
      title="فایل ها و مشتریان جدید" 
      onAddClick={() => setShowAll(!showAll)}
    >
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'files' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('files')}
        >
          فایل های جدید ({files.length})
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'customers' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('customers')}
        >
          مشتریان جدید ({customers.length})
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'files' ? (
        <>
          {visibleFiles.length > 0 ? (
            <ul className="space-y-0 divide-y divide-gray-200 -mb-3 md:-mb-4 flex-grow overflow-y-auto max-h-[350px] md:max-h-[400px] pr-1">
              {visibleFiles.map((file) => (
                <FileItem
                  key={file.id}
                  id={file.id}
                  type={file.property_type || 'sell'}
                  owner={personData[file.owner]?.last_name || file.owner}
                  address={file.address}
                  createdAt={file.created_at || file.created}
                />
              ))}
            </ul>
          ) : (
            <div className="flex-grow flex items-center justify-center">
              <p className="text-gray-500 py-8 text-center">فایل جدیدی یافت نشد.</p>
            </div>
          )}
        </>
      ) : (
        <>
          {visibleCustomers.length > 0 ? (
            <ul className="space-y-0 divide-y divide-gray-200 -mb-3 md:-mb-4 flex-grow overflow-y-auto max-h-[350px] md:max-h-[400px] pr-1">
              {visibleCustomers.map((customer) => (
                <CustomerItem
                  key={customer.id}
                  id={customer.id}
                  phone={personData[customer.id]?.phone_number}
                  name={personData[customer.id]?.last_name}
                  type={customer.type || (customer.budget ? 'buy' : 'rent')}
                  createdAt={customer.created_at || customer.created}
                />
              ))}
            </ul>
          ) : (
            <div className="flex-grow flex items-center justify-center">
              <p className="text-gray-500 py-8 text-center">مشتری جدیدی یافت نشد.</p>
            </div>
          )}
        </>
      )}

      {(files.length > MAX_ITEMS_VISIBLE || customers.length > MAX_ITEMS_VISIBLE) && (
        <div className="mt-6 text-center pt-4 border-t border-gray-100">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {showAll ? `نمایش کمتر (${MAX_ITEMS_VISIBLE})` : `مشاهده همه (${activeTab === 'files' ? files.length : customers.length})`}
          </button>
        </div>
      )}
    </WidgetCard>
  );
};

export default NewFilesAndCustomers;
