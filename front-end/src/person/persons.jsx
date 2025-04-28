import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PersonCards from './personCards.jsx';
import { api } from "../common/api";

// TODO: add sorting for this endpoint on the backend 
const PeopleList = () => {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const response = await api.get('common/persons/');
        setPeople(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPeople();
  }, []);

  const handlePersonClick = (person) => {
    navigate(`/persons/${person.id}`, { state: { person } });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md max-w-md mx-auto mt-8">
        <p>خطا در دریافت اطلاعات: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  if (people.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>هیچ شخصی یافت نشد</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">اشخاص</h1>
      <PersonCards people={people} onPersonClick={handlePersonClick} />
    </div>
  );
};

export default PeopleList;
