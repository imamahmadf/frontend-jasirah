import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Image,
  ModalCloseButton,
  Container,
  FormControl,
  FormLabel,
  Center,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  Textarea,
  Input,
  Heading,
  useDisclosure,
} from "@chakra-ui/react";
import ReactPaginate from "react-paginate";
import "../../Style/pagination.css";
import { Link, useHistory } from "react-router-dom";
import axios from "axios";
import Layout from "../../Componets/Layout";
import { useSelector } from "react-redux";
import { userRedux, selectRole } from "../../Redux/Reducers/auth";
import Loading from "../../Componets/Loading";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { parseISO, addDays } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import "moment/locale/id"; // Tambahkan ini
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

function DetailPegawaiAdmin(props) {
  const [dataPegawai, setDataPegawai] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedPegawai, setSelectedPegawai] = useState(0);
  const [events, setEvents] = useState([]);
  const hapusPerjalanan = (e) => {
    console.log(e);
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/keuangan/delete/perjalanan/${e}`
      )
      .then((res) => {
        console.log(res.status, res.data, "tessss");
        fetchDataPegawai();
      })
      .catch((err) => {
        console.error(err.message);
      });
  };
  async function fetchDataPegawai() {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/pegawai/get/detail-pegawai/${props.match.params.id}`
      );
      setDataPegawai(res.data.result);
      console.log(res.data.result[0].personils);

      const formattedEvents = res.data.result[0].personils.map((item) => {
        const startDate = item.tanggalBerangkat
          ? parseISO(item.tanggalBerangkat)
          : new Date();

        const endDate = item.tanggalPulang
          ? parseISO(item.tanggalPulang)
          : startDate;

        return {
          title: item.tujuan,
          start: startDate,
          end: endDate,
          allDay: true,
          resource: item,
        };
      });
      setEvents(formattedEvents);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data pegawai");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDataPegawai();
  }, []);

  if (loading) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Center pt="80px" h="100vh">
          <Text color="red.500">{error}</Text>
        </Center>
      </Layout>
    );
  }

  if (!dataPegawai || !dataPegawai.length) {
    return (
      <Layout>
        <Center pt="80px" h="100vh">
          <Text>Data pegawai tidak ditemukan</Text>
        </Center>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box pb={"40px"} px={"30px"}>
        <Container maxW={"1280px"} variant={"primary"} p={"30px"} my={"30px"}>
          <Heading size="md" mb={2}>
            Nama : {dataPegawai[0]?.nama}
          </Heading>
          <Text>NIP. : {dataPegawai[0]?.nip}</Text>
          <Text mb={5}>Jabatan: {dataPegawai[0]?.jabatan}</Text>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            formats={formats} // Tambahkan ini
          />
          <Table variant={"primary"}>
            <Thead>
              <Tr>
                <Th>nomor SPD</Th>
                <Th>Tanggal Berangkat</Th>
                <Th>Tanggal Pulang</Th>
                <Th>Tujuan</Th>
                <Th>Biaya Perjalanan</Th>
                <Th>Aksi</Th>
              </Tr>
            </Thead>
            <Tbody>
              {dataPegawai[0]?.personils?.map((item, index) => (
                <Tr key={index}>
                  <Td>{item?.nomorSPD || "-"}</Td>
                  <Td>
                    {new Date(item?.tanggalBerangkat).toLocaleDateString(
                      "id-ID",
                      {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    ) || "-"}
                  </Td>
                  <Td>
                    {new Date(item?.tanggalPulang).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }) || "-"}
                  </Td>
                  <Td>
                    {item?.tujuan?.map((val, idx) => (
                      <Text key={idx}>{val || "-"}</Text>
                    ))}
                  </Td>
                  <Td>
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    }).format(item?.totaluang) || "-"}
                  </Td>
                  <Td>
                    <Flex gap={"10px"}>
                      <Button variant={"primary"}>detail</Button>
                      <Button
                        variant={"cancle"}
                        onClick={() => {
                          setSelectedPegawai(item.id);
                          onOpen();
                        }}
                      >
                        Hapus
                      </Button>
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Container>{" "}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Konfirmasi Hapus</ModalHeader>
            <ModalCloseButton />

            <ModalBody>Apakah Anda yakin ingin menghapus data ini?</ModalBody>
            <ModalFooter>
              <Button
                colorScheme="red"
                mr={3}
                onClick={() => hapusPerjalanan(selectedPegawai)}
              >
                Ya, Hapus
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Batal
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Layout>
  );
}

export default DetailPegawaiAdmin;
