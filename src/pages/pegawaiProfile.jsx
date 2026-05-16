import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import Layout from "../Componets/Layout";
import LayoutPegawai from "../Componets/Pegawai/LayoutPegawai";
import { Link, useHistory } from "react-router-dom";
import Rill from "../Componets/Rill";
import { useDisclosure } from "@chakra-ui/react";
import Foto from "../assets/add_photo.png";

import {
  Select as Select2,
  CreatableSelect,
  AsyncSelect,
} from "chakra-react-select";
import { useFormik } from "formik";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import YupPassword from "yup-password";
import {
  Box,
  Text,
  Button,
  Modal,
  ModalOverlay,
  Heading,
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
  Select,
  Td,
  Flex,
  Textarea,
  Alert,
  Toast,
  Input,
  FormHelperText,
  Spacer,
  VStack,
  useToast,
  FormErrorMessage,
  UnorderedList,
  ListItem,
  Grid,
  GridItem,
  Divider,
  Spinner,
  Stack,
  Icon,
  Badge,
  useColorMode,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { chakra } from "@chakra-ui/react";
import {
  FaUser,
  FaIdCard,
  FaBuilding,
  FaCalendarAlt,
  FaBriefcase,
  FaMapMarkerAlt,
  FaFileAlt,
  FaPlus,
  FaCheckCircle,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import {
  selectIsAuthenticated,
  userRedux,
  selectRole,
} from "../Redux/Reducers/auth";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { parseISO, addDays } from "date-fns";
import moment from "moment";
import "moment/locale/id"; // Tambahkan ini
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useColorModeValues } from "../Style/colorModeValues";
import { getCalendarStyles } from "../Style/calendarStyles";

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

const MotionBox = motion(chakra.div);
const MotionContainer = motion(chakra.div);

function pegawaiProfile() {
  const toast = useToast();
  const { colorMode } = useColorMode();
  const user = useSelector(userRedux);
  const role = useSelector(selectRole);
  const [events, setEvents] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dataProfile, setDataProfile] = useState(null);
  const [dataUsulan, setDataUsulan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataIndikator, setDataIndikator] = useState(null);
  const [dataPegawai, setDataPegawai] = useState(null);
  const [error, setError] = useState("");

  // Color mode values
  const {
    boxBg,
    textColor,
    textColorLight,
    borderColor,
    borderColorLight,
    borderColorDark,
    hoverBg,
    drawerBg,
  } = useColorModeValues();

  const [indikator, setIndikator] = useState("");
  const {
    isOpen: isTambahOpen,
    onOpen: onTambahOpen,
    onClose: onTambahClose,
  } = useDisclosure();
  const [fileError, setFileError] = useState("");
  async function fetchDataPegawai() {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/pegawai/get/detail-pegawai/${user[0].pegawaiId}`
      );
      setDataPegawai(res.data.result[0]);
      console.log(res.data.result[0]);

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
  async function fetchProfile() {
    axios
      .get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/user/profile/${
          user[0].id
        }`
      )
      .then((res) => {
        // Tindakan setelah berhasil
        setDataProfile(res.data.result);
        console.log(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  async function fetchUsulan() {
    axios
      .get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/pegawai/get/usulan/${
          user[0].pegawaiId
        }`
      )
      .then((res) => {
        // Tindakan setelah berhasil
        setDataUsulan(res.data.result);
        console.log(res.data.result);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  const tambahIndikator = () => {
    axios
      .post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/PJPL/post/indikator`,
        {
          indikator,
          pejabatVerifikatorId: dataIndikator.id,
        }
      )
      .then((res) => {
        console.log(res.status, res.data, "tessss");
        toast({
          title: "Berhasil!",
          description: "Data berhasil dikirim.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        onTambahClose();
        fetchIndikatorPejabat();
      })
      .catch((err) => {
        console.error(err.message);
        toast({
          title: "Error!",
          description: "Data gagal ditambahkan",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        onTambahClose();
      });
  };

  async function fetchIndikatorPejabat() {
    axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/PJPL/get/indikator-pejabat/${user[0].pegawaiId}`
      )
      .then((res) => {
        // Tindakan setelah berhasil
        setDataIndikator(res.data.result);
        console.log(res.data.result, "tes indikator");
      })
      .catch((err) => {
        console.error(err);
      });
  }

  const validationSchema = Yup.object().shape({
    file: Yup.mixed()
      .required("File harus diunggah")
      .test(
        "fileType",
        "Format file tidak valid. Harap unggah file .pdf",
        (value) => value && value.type === "application/pdf"
      )
      .test(
        "fileSize",
        "Ukuran file maksimal 700KB",
        (value) => value && value.size <= 700 * 1024
      ),
  });
  useEffect(() => {
    fetchProfile();
    fetchUsulan();
    fetchDataPegawai();
    fetchIndikatorPejabat();
  }, []);
  if (loading) {
    return (
      <LayoutPegawai>
        <Box bgColor={"secondary"} pb={"40px"} px={"30px"} minH={"75vh"}>
          <Container
            maxW={"1280px"}
            bgColor={boxBg}
            p={"50px"}
            mt={"30px"}
            borderRadius={"12px"}
            border={"1px"}
            borderColor={borderColor}
            boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
          >
            <Center>
              <VStack spacing={4}>
                <Spinner size="xl" color="pegawai" thickness="4px" />
                <Text color={textColorLight} fontSize="sm">
                  Memuat data...
                </Text>
              </VStack>
            </Center>
          </Container>
        </Box>
      </LayoutPegawai>
    );
  }

  return (
    <LayoutPegawai>
      <Box bgColor={"secondary"} pb={"40px"} px={"30px"}>
        {/* Profil Pegawai */}
        <MotionContainer
          as={Container}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          border={"1px"}
          borderRadius={"12px"}
          borderColor={borderColor}
          maxW={"1280px"}
          bgGradient={`linear(to-br, ${boxBg}, ${drawerBg})`}
          pt={"40px"}
          pb={"40px"}
          px={"40px"}
          mt={"30px"}
          boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
          _hover={{
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            transition: "all 0.3s ease",
          }}
        >
          <VStack align="stretch" spacing={6}>
            <HStack spacing={3} mb={2}>
              <Box
                p={3}
                bgGradient="linear(to-br, pegawai, pegawaiGelap)"
                borderRadius="10px"
                boxShadow="md"
              >
                <Icon as={FaUser} color="white" boxSize={6} />
              </Box>
              <VStack align="start" spacing={0}>
                <Heading size="lg" color="pegawai">
                  {dataProfile?.pegawai?.nama || "-"}
                </Heading>
                <Badge colorScheme="red" variant="subtle" mt={1}>
                  Profil Pegawai
                </Badge>
              </VStack>
            </HStack>
            <Divider borderColor={borderColor} />
            <Grid
              templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
              gap={6}
            >
              <GridItem>
                <Box
                  p={4}
                  bg={boxBg}
                  borderRadius="8px"
                  border="1px solid"
                  borderColor={borderColorLight}
                  _hover={{
                    borderColor: "pegawai",
                    boxShadow: "sm",
                    transform: "translateY(-2px)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <HStack spacing={3} mb={2}>
                    <Icon as={FaBriefcase} color="pegawai" boxSize={4} />
                    <Text
                      fontSize="sm"
                      color={textColorLight}
                      fontWeight="semibold"
                    >
                      Jabatan
                    </Text>
                  </HStack>
                  <Text fontSize="md" fontWeight="medium" color={textColor}>
                    {dataProfile?.pegawai?.jabatan || "-"}
                  </Text>
                </Box>
              </GridItem>
              <GridItem>
                <Box
                  p={4}
                  bg={boxBg}
                  borderRadius="8px"
                  border="1px solid"
                  borderColor={borderColorLight}
                  _hover={{
                    borderColor: "pegawai",
                    boxShadow: "sm",
                    transform: "translateY(-2px)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <HStack spacing={3} mb={2}>
                    <Icon as={FaIdCard} color="pegawai" boxSize={4} />
                    <Text
                      fontSize="sm"
                      color={textColorLight}
                      fontWeight="semibold"
                    >
                      NIP
                    </Text>
                  </HStack>
                  <Text fontSize="md" fontWeight="medium" color={textColor}>
                    {dataProfile?.pegawai?.nip || "-"}
                  </Text>
                </Box>
              </GridItem>
              <GridItem>
                <Box
                  p={4}
                  bg={boxBg}
                  borderRadius="8px"
                  border="1px solid"
                  borderColor={borderColorLight}
                  _hover={{
                    borderColor: "pegawai",
                    boxShadow: "sm",
                    transform: "translateY(-2px)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <HStack spacing={3} mb={2}>
                    <Icon as={FaUser} color="pegawai" boxSize={4} />
                    <Text
                      fontSize="sm"
                      color={textColorLight}
                      fontWeight="semibold"
                    >
                      Pangkat / Golongan
                    </Text>
                  </HStack>
                  <Text fontSize="md" fontWeight="medium" color={textColor}>
                    {dataProfile?.pegawai?.daftarPangkat?.pangkat || "-"} /{" "}
                    {dataProfile?.pegawai?.daftarGolongan?.golongan || "-"}
                  </Text>
                </Box>
              </GridItem>
              <GridItem>
                <Box
                  p={4}
                  bg={boxBg}
                  borderRadius="8px"
                  border="1px solid"
                  borderColor={borderColorLight}
                  _hover={{
                    borderColor: "pegawai",
                    boxShadow: "sm",
                    transform: "translateY(-2px)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <HStack spacing={3} mb={2}>
                    <Icon as={FaBuilding} color="pegawai" boxSize={4} />
                    <Text
                      fontSize="sm"
                      color={textColorLight}
                      fontWeight="semibold"
                    >
                      Unit Kerja
                    </Text>
                  </HStack>
                  <Text fontSize="md" fontWeight="medium" color={textColor}>
                    {dataProfile?.pegawai?.daftarUnitKerja?.unitKerja || "-"}
                  </Text>
                </Box>
              </GridItem>
              <GridItem>
                <Box
                  p={4}
                  bg={boxBg}
                  borderRadius="8px"
                  border="1px solid"
                  borderColor={borderColorLight}
                  _hover={{
                    borderColor: "pegawai",
                    boxShadow: "sm",
                    transform: "translateY(-2px)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <HStack spacing={3} mb={2}>
                    <Icon as={FaCalendarAlt} color="pegawai" boxSize={4} />
                    <Text
                      fontSize="sm"
                      color={textColorLight}
                      fontWeight="semibold"
                    >
                      Tanggal TMT
                    </Text>
                  </HStack>
                  <Text fontSize="md" fontWeight="medium" color={textColor}>
                    {dataProfile?.pegawai?.tanggalTMT
                      ? new Date(
                          dataProfile.pegawai.tanggalTMT
                        ).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "-"}
                  </Text>
                </Box>
              </GridItem>
            </Grid>
          </VStack>
        </MotionContainer>

        {/* Rencana Hasil Kerja */}
        <MotionContainer
          as={Container}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          mt={"30px"}
          border={"1px"}
          borderRadius={"12px"}
          borderColor={borderColor}
          maxW={"1280px"}
          bgColor={boxBg}
          p={"30px"}
          boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
          _hover={{
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            transition: "all 0.3s ease",
          }}
        >
          <Flex justify="space-between" align="center" mb={6}>
            <HStack spacing={3}>
              <Box
                p={2}
                bgGradient="linear(to-br, pegawai, pegawaiGelap)"
                borderRadius="8px"
              >
                <Icon as={FaFileAlt} color="white" boxSize={5} />
              </Box>
              <Heading size="md" color="pegawai">
                Rencana Hasil Kerja Pejabat Verifikator
              </Heading>
            </HStack>
            <Button
              onClick={onTambahOpen}
              variant={"pegawai"}
              px={"30px"}
              leftIcon={<FaPlus />}
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "lg",
              }}
            >
              Tambah
            </Button>
          </Flex>
          <Divider mb={6} borderColor={borderColor} />
          <Box>
            {dataIndikator?.indikatorPejabats &&
            dataIndikator?.indikatorPejabats?.length > 0 ? (
              <VStack align="stretch" spacing={3}>
                {dataIndikator?.indikatorPejabats?.map((val, idx) => (
                  <MotionBox
                    as={Box}
                    key={val.id || idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    p={4}
                    bgGradient={`linear(to-r, ${boxBg}, ${drawerBg})`}
                    borderRadius="8px"
                    borderLeft="4px solid"
                    borderColor="pegawai"
                    boxShadow="sm"
                    _hover={{
                      boxShadow: "md",
                      transform: "translateX(4px)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <HStack spacing={2}>
                      <Icon as={FaCheckCircle} color="pegawai" boxSize={4} />
                      <Text fontWeight="medium" color={textColor}>
                        {val.indikator}
                      </Text>
                    </HStack>
                  </MotionBox>
                ))}
              </VStack>
            ) : (
              <Box
                p={8}
                bgGradient={`linear(to-br, ${drawerBg}, ${hoverBg})`}
                borderRadius="8px"
                textAlign="center"
                border="2px dashed"
                borderColor={borderColorDark}
              >
                <Icon
                  as={FaFileAlt}
                  color={textColorLight}
                  boxSize={8}
                  mb={3}
                  display="block"
                  mx="auto"
                />
                <Text color={textColorLight} fontWeight="medium">
                  Tidak ada indikator tersedia
                </Text>
                <Text color={textColorLight} fontSize="sm" mt={1}>
                  Klik tombol "Tambah" untuk menambahkan indikator baru
                </Text>
              </Box>
            )}
          </Box>
        </MotionContainer>

        {/* Kalender Perjalanan Dinas */}
        <MotionContainer
          as={Container}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          maxW={"1280px"}
          variant={"pegawai"}
          p={"30px"}
          my={"30px"}
          borderRadius={"12px"}
          border={"1px"}
          borderColor={borderColor}
          bgColor={boxBg}
          boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
          _hover={{
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            transition: "all 0.3s ease",
          }}
        >
          <HStack spacing={3} mb={4}>
            <Box
              p={2}
              bgGradient="linear(to-br, pegawai, pegawaiGelap)"
              borderRadius="8px"
            >
              <Icon as={FaCalendarAlt} color="white" boxSize={5} />
            </Box>
            <Heading size="md" color="pegawai">
              Kalender Perjalanan Dinas
            </Heading>
          </HStack>
          <Divider mb={6} borderColor={borderColor} />
          <Box
            mb={6}
            borderRadius="8px"
            overflow="hidden"
            border="1px solid"
            borderColor={borderColor}
            bg={boxBg}
            position="relative"
          >
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 600 }}
              formats={formats}
              eventPropGetter={(event) => {
                return {
                  style: {
                    backgroundColor: "rgba(212, 39, 39, 0.9)",
                    color: "white",
                    borderRadius: "6px",
                    border: "none",
                    padding: "4px 8px",
                    fontSize: "13px",
                    fontWeight: "500",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    cursor: "pointer",
                  },
                };
              }}
            />
            <style>{getCalendarStyles(colorMode)}</style>
          </Box>
        </MotionContainer>

        {/* Tabel Perjalanan Dinas */}
        <MotionContainer
          as={Container}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          maxW={"1280px"}
          variant={"pegawai"}
          p={"30px"}
          my={"30px"}
          borderRadius={"12px"}
          border={"1px"}
          borderColor={borderColor}
          bgColor={boxBg}
          boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
          _hover={{
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            transition: "all 0.3s ease",
          }}
        >
          <HStack spacing={3} mb={4}>
            <Box
              p={2}
              bgGradient="linear(to-br, pegawai, pegawaiGelap)"
              borderRadius="8px"
            >
              <Icon as={FaMapMarkerAlt} color="white" boxSize={5} />
            </Box>
            <Heading size="md" color="pegawai">
              Daftar Perjalanan Dinas
            </Heading>
            {dataPegawai?.personils && dataPegawai.personils.length > 0 && (
              <Badge colorScheme="blue" variant="subtle" fontSize="sm">
                {dataPegawai.personils.length} perjalanan
              </Badge>
            )}
          </HStack>
          <Divider mb={6} borderColor={borderColor} />
          <Box
            overflowX="auto"
            borderRadius="8px"
            border="1px solid"
            borderColor={borderColor}
          >
            <Table variant={"pegawai"}>
              <Thead>
                <Tr>
                  <Th>Nomor SPD</Th>
                  <Th>Tanggal Berangkat</Th>
                  <Th>Tanggal Pulang</Th>
                  <Th>Tujuan</Th>
                  <Th>Biaya Perjalanan</Th>
                </Tr>
              </Thead>
              <Tbody>
                {dataPegawai?.personils && dataPegawai.personils.length > 0 ? (
                  dataPegawai.personils.map((item, index) => (
                    <Tr
                      key={index}
                      _hover={{
                        bg: hoverBg,
                        transition: "background 0.2s ease",
                      }}
                    >
                      <Td fontWeight="medium">{item?.nomorSPD || "-"}</Td>
                      <Td>
                        {item?.tanggalBerangkat
                          ? new Date(item.tanggalBerangkat).toLocaleDateString(
                              "id-ID",
                              {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )
                          : "-"}
                      </Td>
                      <Td>
                        {item?.tanggalPulang
                          ? new Date(item.tanggalPulang).toLocaleDateString(
                              "id-ID",
                              {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )
                          : "-"}
                      </Td>
                      <Td>
                        {item?.tujuan && item.tujuan.length > 0 ? (
                          <VStack align="start" spacing={1}>
                            {item.tujuan.map((val, idx) => (
                              <HStack key={idx} spacing={1}>
                                <Icon
                                  as={FaMapMarkerAlt}
                                  color="pegawai"
                                  boxSize={3}
                                />
                                <Text fontSize="sm">{val || "-"}</Text>
                              </HStack>
                            ))}
                          </VStack>
                        ) : (
                          "-"
                        )}
                      </Td>
                      <Td fontWeight="semibold" color="pegawai">
                        {item?.totaluang
                          ? new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                            }).format(item.totaluang)
                          : "-"}
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={5} textAlign="center" py={10}>
                      <VStack spacing={3}>
                        <Icon
                          as={FaMapMarkerAlt}
                          color={textColorLight}
                          boxSize={10}
                        />
                        <Text color={textColorLight} fontWeight="medium">
                          Tidak ada data perjalanan dinas
                        </Text>
                        <Text color={textColorLight} fontSize="sm">
                          Data perjalanan dinas akan muncul di sini
                        </Text>
                      </VStack>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        </MotionContainer>
      </Box>
      <Modal
        closeOnOverlayClick={false}
        isOpen={isTambahOpen}
        onClose={onTambahClose}
        isCentered
      >
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="12px" maxWidth="800px" boxShadow="2xl">
          <ModalHeader pb={4}>
            <HStack spacing={3}>
              <Box
                p={2}
                bgGradient="linear(to-br, pegawai, pegawaiGelap)"
                borderRadius="8px"
              >
                <Icon as={FaFileAlt} color="white" boxSize={5} />
              </Box>
              <Heading size="md" color="pegawai">
                Tambah Rancangan Hasil Kerja
              </Heading>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody pb={6}>
            <Box>
              <FormControl mb={4}>
                <FormLabel fontWeight="semibold" color={textColor}>
                  Indikator Hasil Kerja
                </FormLabel>
                <Textarea
                  onChange={(e) => {
                    setIndikator(e.target.value);
                  }}
                  minH={"250px"}
                  placeholder="Masukkan indikator hasil kerja..."
                  borderRadius="8px"
                  borderColor={borderColorDark}
                  _hover={{
                    borderColor: "pegawai",
                  }}
                  _focus={{
                    borderColor: "pegawai",
                    boxShadow: "0 0 0 1px var(--chakra-colors-pegawai)",
                  }}
                />
                <FormHelperText color={textColorLight} fontSize="sm">
                  Masukkan indikator hasil kerja yang ingin ditambahkan
                </FormHelperText>
              </FormControl>
            </Box>
          </ModalBody>

          <ModalFooter pe={"40px"} pb={"30px"} pt={0}>
            <HStack spacing={3}>
              <Button
                onClick={onTambahClose}
                variant={"cancle"}
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "md",
                }}
              >
                Batal
              </Button>
              <Button
                onClick={tambahIndikator}
                variant={"pegawai"}
                leftIcon={<FaCheckCircle />}
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "lg",
                }}
              >
                Simpan
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </LayoutPegawai>
  );
}

export default pegawaiProfile;
