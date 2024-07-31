import DatePicker from "react-multi-date-picker";
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { useMemo } from "react";
import transition from "react-element-popper/animations/transition";
import opacity from "react-element-popper/animations/opacity";


const CustomDatePicker = ({ setter, defaultDate }) => {
  const handleChange = (value) => {
    let date = value.toDate();
    let ISODate = date.toISOString().split("T")[0];

    setter(ISODate);
  };


  // Memoize the date object to avoid unnecessary re-renders
  const date = useMemo(() => new DateObject({ calendar: persian, locale: persian_fa, value: defaultDate }), [defaultDate]);

  let today = date.value


  return (
    <DatePicker
      calendar={persian}
      locale={persian_fa}
      value={today}
      onChange={(e) => handleChange(e)}
      animations={[
        opacity(),
        transition({
          from: 40,
          transition: "all 400ms cubic-bezier(0.335, 0.010, 0.030, 1.360)",
        }),
      ]}
      render={(value, openCalendar) => (
        <div className="text-lg cursor-pointer" onClick={openCalendar}>
          {value}
        </div>
      )}
      calendarPosition="bottom-left"
    />
  );
};

export default CustomDatePicker;
