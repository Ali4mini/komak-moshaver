import React from 'react';
import { useNavigate } from 'react-router-dom';

const PersonCards = ({ people, onPersonClick }) => {

  const navigate = useNavigate();

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4'>
      {people.map((person) => (
        <div 
	  key={person.id}
	  onClick={() => navigate(`${person.id}/`)}
	  className={`border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${person.gender_display === 'آقا' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
          <div className="flex items-center space-x-3 mb-3">
            <div>
              <h3 className="font-medium text-gray-900">
                {person.first_name} {person.last_name}
              </h3>
              <p className="text-sm text-gray-500 capitalize">{person.gender_disply}</p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <p>اخرین تماس: <span className="text-gray-900">{new Date(person.last_contact).toLocaleDateString()}</span></p>
          </div>
        </div>
      ))}
    </div>
  );
};


export default PersonCards;
