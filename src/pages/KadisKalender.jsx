import React, { useEffect, useState } from "react";
import { Box, Heading, Spinner, Container } from "@chakra-ui/react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { parseISO, addDays } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import "moment/locale/id"; // Tambahkan ini
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import axios from "axios";
import Layout from "../Componets/Layout";
import { useSelector } from "react-redux";
import { userRedux } from "../Redux/Reducers/auth";

// Set locale ke Bahasa Indonesia
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

function KadisKalender() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector(userRedux);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/perjalanan/get/kadis?unitKerjaId=${user[0]?.unitKerja_profile?.id}`
      );
      const data = response.data;

      const formattedEvents = data.result.map((item) => {
        const startDate = item.tempats[0].tanggalBerangkat
          ? parseISO(item.tempats[0].tanggalBerangkat)
          : new Date();

        const endDate = item.tempats[0].tanggalPulang
          ? addDays(parseISO(item.tempats[0].tanggalPulang), 1)
          : startDate;

        return {
          title:
            item.jenisPerjalanan.tipePerjalanan.id == 1
              ? item.tempats[0].dalamKota.nama
              : item.tempats[0].tempat,
          start: startDate,
          end: endDate,
          allDay: true,
          resource: item,
        };
      });
      console.log(data);
      setEvents(formattedEvents);
    } catch (error) {
      console.error("Gagal mengambil data kalender:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Layout>
      <Box bgColor={"secondary"} pb={"40px"} px={"30px"}>
        <Container
          maxWidth={"1280px"}
          style={{ overflowX: "auto" }}
          p={"30px"}
          variant={"primary"}
        >
          <Heading mb={4}>Kalender Perjalanan Kepala Dinas</Heading>
          {loading ? (
            <Spinner />
          ) : (
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 500 }}
              formats={formats} // Tambahkan ini
            />
          )}
        </Container>
      </Box>
    </Layout>
  );
}

export default KadisKalender;
