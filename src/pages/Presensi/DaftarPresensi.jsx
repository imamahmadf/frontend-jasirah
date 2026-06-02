import React, { useState } from "react";
import { Box, Container } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import LayoutPegawai from "../../Componets/Pegawai/LayoutPegawai";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import "moment/locale/id";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

moment.locale("id");
const localizer = momentLocalizer(moment);

const formats = {
  dayFormat: (date, culture, localizer) =>
    format(date, "EEEE", { locale: idLocale }), // Senin, Selasa, ...
  weekdayFormat: (date, culture, localizer) =>
    format(date, "EEEEEE", { locale: idLocale }), // S, S, R, K, ...
  monthHeaderFormat: (date, culture, localizer) =>
    format(date, "MMMM yyyy", { locale: idLocale }), // Juni 2025
  dayHeaderFormat: (date, culture, localizer) =>
    format(date, "EEEE, d MMMM", { locale: idLocale }), // Senin, 16 Juni
};

function DaftarPresensi() {
  const [events, setEvents] = useState([]);
  const history = useHistory();

  const handleSelectDate = (value) => {
    const selectedDate = value?.start || value;
    if (!selectedDate) return;

    const dateParam = format(selectedDate, "yyyy-MM-dd");
    history.push(`/presensi/detail-presensi?tanggal=${dateParam}`);
  };

  return (
    <LayoutPegawai>
      <Box bgColor={"secondary"} pb={"40px"} px={"30px"} minH={"60vh"}>
        <Container maxW={"1280px"} variant={"primary"} p={"30px"} my={"30px"}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            formats={formats}
            selectable
            popup
            onSelectSlot={handleSelectDate}
            onSelectEvent={handleSelectDate}
          />
        </Container>
      </Box>
    </LayoutPegawai>
  );
}

export default DaftarPresensi;
