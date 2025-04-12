import DatePicker from "react-multi-date-picker";
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { useState, useEffect } from "react";
import transition from "react-element-popper/animations/transition";
import opacity from "react-element-popper/animations/opacity";

const CustomDatePicker = ({ setter, defaultDate }) => {
  // Initialize selectedDate with today's date if defaultDate is not provided
  const [selectedDate, setSelectedDate] = useState(() => {
    return defaultDate
      ? new DateObject({ calendar: persian, locale: persian_fa, value: defaultDate })
      : new DateObject({ calendar: persian, locale: persian_fa, value: new Date() }); // Today's date
  });

  // Update selected date when defaultDate changes
  useEffect(() => {
    if (defaultDate) {
      setSelectedDate(new DateObject({ calendar: persian, locale: persian_fa, value: defaultDate }));
    } else {
      setSelectedDate(new DateObject({ calendar: persian, locale: persian_fa, value: new Date() })); // Reset to today's date
    }

    console.log(selectedDate);
  }, [defaultDate]);

  const handleChange = (value) => {
    if (value instanceof DateObject) {
      let ISODate = value.toDate().toISOString().split("T")[0]; // Convert to ISO string
      setSelectedDate(value); // Update local state with the selected value
      setter(ISODate); // Notify parent component
    }
  };

  // Function to handle the unknown date click
  const handleUnknownDateClick = () => {
    setSelectedDate(null); // Update local state to null
    setter(null); // Notify parent component
  };

  return (
    <div>
      <DatePicker
        calendar={persian}
        locale={persian_fa}
        value={selectedDate} // Use selected date directly
        onChange={handleChange} // Handle date change
        animations={[
          opacity(),
          transition({
            from: 40,
            transition: "all 400ms cubic-bezier(0.335, 0.010, 0.030, 1.360)",
          }),
        ]}
        render={(value, openCalendar) => (
          <div className="text-lg cursor-pointer" onClick={openCalendar}>
            {selectedDate ? selectedDate.format("YYYY/MM/DD") : 'تاریخ انتخاب نشده است'} {/* Display formatted date or message */}
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
