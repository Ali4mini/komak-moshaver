import DatePicker from "react-multi-date-picker";
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { useState, useEffect } from "react";
import transition from "react-element-popper/animations/transition";
import opacity from "react-element-popper/animations/opacity";

const CustomDatePicker = ({ setter, defaultDate }) => {
  // Initialize selectedDate as null
  const [selectedDate, setSelectedDate] = useState(null);

  // Initialize or update selectedDate when defaultDate changes
  useEffect(() => {
    if (defaultDate) {
      try {
        const dateObj = new DateObject({
          date: defaultDate,
          calendar: persian,
          locale: persian_fa
        });
        setSelectedDate(dateObj);
      } catch (error) {
        console.error("Error creating DateObject:", error);
        setSelectedDate(new DateObject({ calendar: persian, locale: persian_fa }));
      }
    } else {
      setSelectedDate(null);
    }
  }, [defaultDate]);

  const handleChange = (value) => {
    if (value instanceof DateObject) {
      const ISODate = value.toDate().toISOString().split("T")[0];
      setSelectedDate(value);
      setter(ISODate);
    } else if (value === null) {
      setSelectedDate(null);
      setter(null);
    }
  };

  const handleUnknownDateClick = () => {
    setSelectedDate(null);
    setter(null);
  };

  return (
    <div>
      <DatePicker
        calendar={persian}
        locale={persian_fa}
        value={selectedDate}
        onChange={handleChange}
        animations={[
          opacity(),
          transition({
            from: 40,
            transition: "all 400ms cubic-bezier(0.335, 0.010, 0.030, 1.360)",
          }),
        ]}
        render={(value, openCalendar) => (
          <div className="text-lg cursor-pointer" onClick={openCalendar}>
            {selectedDate ? selectedDate.format("YYYY/MM/DD") : 'تاریخ انتخاب نشده است'}
          </div>
        )}
        calendarPosition="bottom-left"
      >
        <button
          className="bg-blue-300 rounded-lg border w-2/3 mb-2 py-1"
          onClick={handleUnknownDateClick}
          type="button"
          id="unknownDate"
        >
          تاریخ نامعلوم
        </button>
      </DatePicker>
    </div>
  );
};

export default CustomDatePicker;
