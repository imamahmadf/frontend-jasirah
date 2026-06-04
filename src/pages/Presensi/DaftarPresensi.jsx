import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Spinner,
  Center,
  Text,
  Heading,
  HStack,
  VStack,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  Badge,
  useColorMode,
  Icon,
} from "@chakra-ui/react";
import { FaCalendarAlt, FaUserCheck, FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
import { useHistory } from "react-router-dom";
import LayoutPegawai from "../../Componets/Pegawai/LayoutPegawai";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import "moment/locale/id";
import { addDays, format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { getCalendarStyles } from "../../Style/calendarStyles";

moment.locale("id");
const localizer = momentLocalizer(moment);

const BRAND = "rgba(212, 39, 39, 1)";

const formats = {
  dayFormat: (date) => format(date, "EEEE", { locale: idLocale }),
  weekdayFormat: (date) => format(date, "EEEEEE", { locale: idLocale }),
  monthHeaderFormat: (date) => format(date, "MMMM yyyy", { locale: idLocale }),
  dayHeaderFormat: (date) => format(date, "EEEE, d MMMM", { locale: idLocale }),
};

function parseKalenderEvent(ev) {
  const tanggal = ev.tanggal || String(ev.start).slice(0, 10);
  const start = parseISO(tanggal);
  return {
    ...ev,
    start,
    end: addDays(start, 1),
    allDay: true,
  };
}

function PresensiEvent({ event }) {
  const masuk = event.jumlahMasuk ?? 0;
  const pulang = event.jumlahPulang ?? 0;

  return (
    <Box w="100%" fontSize="11px" lineHeight="1.35" pointerEvents="none">
      <HStack spacing={1} mb={0.5}>
        <Box as="span" color="green.100" fontWeight="700" fontSize="10px">
          M
        </Box>
        <Text as="span" fontWeight="600">
          {masuk}
        </Text>
      </HStack>
      <HStack spacing={1}>
        <Box as="span" color="blue.100" fontWeight="700" fontSize="10px">
          P
        </Box>
        <Text as="span" fontWeight="600">
          {pulang}
        </Text>
      </HStack>
    </Box>
  );
}

function getPresensiCalendarOverrides() {
  return `
    .presensi-calendar .rbc-month-row {
      min-height: 110px;
    }
    .presensi-calendar .rbc-row-content {
      min-height: 72px;
    }
    .presensi-calendar .rbc-event {
      background: linear-gradient(135deg, #15803d 0%, #166534 100%) !important;
      border: none !important;
      border-radius: 8px !important;
      padding: 4px 6px !important;
      min-height: 40px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
    }
    .presensi-calendar .rbc-event-content::before {
      content: none !important;
    }
    .presensi-calendar .rbc-event:hover {
      filter: brightness(1.05);
      transform: translateY(-1px);
    }
    .presensi-calendar .rbc-show-more {
      color: ${BRAND};
      font-weight: 600;
      font-size: 11px;
    }
    .presensi-calendar .rbc-date-cell {
      padding: 6px 8px;
      font-size: 13px;
    }
    .presensi-calendar .rbc-date-cell > a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 28px;
      min-height: 28px;
      border-radius: 50%;
    }
    .presensi-calendar .rbc-date-cell.rbc-now > a {
      background: ${BRAND};
      color: white !important;
    }
    .presensi-calendar .rbc-toolbar button.rbc-active {
      display: none;
    }
    .presensi-calendar .rbc-btn-group:last-child {
      display: none;
    }
  `;
}

function DaftarPresensi() {
  const now = new Date();
  const [bulan, setBulan] = useState(now.getMonth() + 1);
  const [tahun, setTahun] = useState(now.getFullYear());
  const [events, setEvents] = useState([]);
  const [totalPegawaiMingguan, setTotalPegawaiMingguan] = useState(null);
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  const { colorMode } = useColorMode();

  const bulanLabel = useMemo(
    () => format(new Date(tahun, bulan - 1, 1), "MMMM yyyy", { locale: idLocale }),
    [bulan, tahun],
  );

  const ringkasanBulan = useMemo(() => {
    const totalMasuk = events.reduce((s, e) => s + (e.jumlahMasuk || 0), 0);
    const totalPulang = events.reduce((s, e) => s + (e.jumlahPulang || 0), 0);
    const hariTerisi = events.length;
    return { totalMasuk, totalPulang, hariTerisi };
  }, [events]);

  useEffect(() => {
    setLoading(true);
    fetch(
      `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/presensi/get/kalender-pekerja-mingguan?bulan=${bulan}&tahun=${tahun}`,
    )
      .then((res) => res.json())
      .then((data) => {
        const parsed = (data.events || []).map(parseKalenderEvent);
        setEvents(parsed);
        setTotalPegawaiMingguan(data.totalPegawaiMingguan ?? null);
      })
      .catch(() => {
        setEvents([]);
        setTotalPegawaiMingguan(null);
      })
      .finally(() => setLoading(false));
  }, [bulan, tahun]);

  const { defaultDate, views } = useMemo(
    () => ({
      defaultDate: new Date(tahun, bulan - 1, 1),
      views: ["month"],
    }),
    [bulan, tahun],
  );

  const handleNavigate = (date) => {
    setBulan(date.getMonth() + 1);
    setTahun(date.getFullYear());
  };

  const handleSelectDate = (value) => {
    const selectedDate = value?.start || value;
    if (!selectedDate) return;
    const dateParam = format(selectedDate, "yyyy-MM-dd");
    history.push(`/presensi/detail-presensi?tanggal=${dateParam}`);
  };

  const cardBg = colorMode === "dark" ? "gray.800" : "white";
  const cardBorder = colorMode === "dark" ? "gray.600" : "gray.200";

  return (
    <LayoutPegawai>
      <Box bgColor="secondary" pb="40px" px={{ base: "16px", md: "30px" }} minH="60vh">
        <Container maxW="1280px" variant="primary" p={{ base: "20px", md: "30px" }} my="30px">
          <HStack spacing={3} mb={2}>
            <Box p={2.5} bgGradient="linear(to-br, red.500, red.700)" borderRadius="10px">
              <Icon as={FaCalendarAlt} color="white" boxSize={5} />
            </Box>
            <VStack align="start" spacing={0}>
              <Heading size="md" color={colorMode === "dark" ? "white" : "gray.800"}>
                Kalender Presensi Pekerja Harian
              </Heading>
              <Text fontSize="sm" color="gray.500">
                Klik tanggal atau ringkasan harian untuk melihat detail presensi
              </Text>
            </VStack>
          </HStack>

          <Divider my={5} borderColor={cardBorder} />

          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4} mb={6}>
            <Box
              p={4}
              bg={cardBg}
              border="1px solid"
              borderColor={cardBorder}
              borderRadius="12px"
              boxShadow="sm"
            >
              <Stat size="sm">
                <StatLabel color="gray.500">
                  <HStack spacing={1}>
                    <Icon as={FaUserCheck} color={BRAND} />
                    <Text>Pegawai mingguan</Text>
                  </HStack>
                </StatLabel>
                <StatNumber fontSize="2xl" color={BRAND}>
                  {loading ? "—" : (totalPegawaiMingguan ?? 0)}
                </StatNumber>
                <StatHelpText mb={0}>Periode aktif</StatHelpText>
              </Stat>
            </Box>

            <Box
              p={4}
              bg={cardBg}
              border="1px solid"
              borderColor={cardBorder}
              borderRadius="12px"
              boxShadow="sm"
            >
              <Stat size="sm">
                <StatLabel color="gray.500">
                  <HStack spacing={1}>
                    <Icon as={FaSignInAlt} color="green.500" />
                    <Text>Total masuk (bulan)</Text>
                  </HStack>
                </StatLabel>
                <StatNumber fontSize="2xl" color="green.600">
                  {loading ? "—" : ringkasanBulan.totalMasuk}
                </StatNumber>
                <StatHelpText mb={0}>{bulanLabel}</StatHelpText>
              </Stat>
            </Box>

            <Box
              p={4}
              bg={cardBg}
              border="1px solid"
              borderColor={cardBorder}
              borderRadius="12px"
              boxShadow="sm"
            >
              <Stat size="sm">
                <StatLabel color="gray.500">
                  <HStack spacing={1}>
                    <Icon as={FaSignOutAlt} color="blue.500" />
                    <Text>Total pulang (bulan)</Text>
                  </HStack>
                </StatLabel>
                <StatNumber fontSize="2xl" color="blue.600">
                  {loading ? "—" : ringkasanBulan.totalPulang}
                </StatNumber>
                <StatHelpText mb={0}>{bulanLabel}</StatHelpText>
              </Stat>
            </Box>

            <Box
              p={4}
              bg={cardBg}
              border="1px solid"
              borderColor={cardBorder}
              borderRadius="12px"
              boxShadow="sm"
            >
              <Stat size="sm">
                <StatLabel color="gray.500">Hari tercatat</StatLabel>
                <StatNumber fontSize="2xl">{loading ? "—" : ringkasanBulan.hariTerisi}</StatNumber>
                <StatHelpText mb={0}>Dengan data presensi</StatHelpText>
              </Stat>
            </Box>
          </SimpleGrid>

          <HStack spacing={3} mb={4} flexWrap="wrap">
            <Badge
              px={3}
              py={1}
              borderRadius="full"
              bg="green.50"
              color="green.700"
              border="1px solid"
              borderColor="green.200"
            >
              M = Masuk
            </Badge>
            <Badge
              px={3}
              py={1}
              borderRadius="full"
              bg="blue.50"
              color="blue.700"
              border="1px solid"
              borderColor="blue.200"
            >
              P = Pulang
            </Badge>
            <Text fontSize="xs" color="gray.500">
              Angka pada setiap hari menunjukkan jumlah pegawai
            </Text>
          </HStack>

          <Box
            className="presensi-calendar"
            bg={cardBg}
            border="1px solid"
            borderColor={cardBorder}
            borderRadius="12px"
            overflow="hidden"
            boxShadow="md"
            position="relative"
          >
            {loading ? (
              <Center py={24}>
                <Spinner size="lg" color="red.500" thickness="3px" />
              </Center>
            ) : (
              <Box p={{ base: 2, md: 4 }} pt={{ base: 3, md: 5 }}>
                <Calendar
                  localizer={localizer}
                  events={events}
                  defaultDate={defaultDate}
                  date={defaultDate}
                  views={views}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: 680 }}
                  formats={formats}
                  selectable
                  popup
                  onNavigate={handleNavigate}
                  onSelectSlot={handleSelectDate}
                  onSelectEvent={handleSelectDate}
                  components={{ event: PresensiEvent }}
                  eventPropGetter={() => ({
                    style: {
                      cursor: "pointer",
                      border: "none",
                    },
                  })}
                  messages={{
                    today: "Hari ini",
                    previous: "Sebelumnya",
                    next: "Berikutnya",
                    month: "Bulan",
                    week: "Minggu",
                    day: "Hari",
                    agenda: "Agenda",
                    showMore: (total) => `+${total} lainnya`,
                  }}
                />
              </Box>
            )}
            <style>
              {getCalendarStyles(colorMode)}
              {getPresensiCalendarOverrides()}
            </style>
          </Box>
        </Container>
      </Box>
    </LayoutPegawai>
  );
}

export default DaftarPresensi;
