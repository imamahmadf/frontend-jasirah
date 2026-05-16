import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import Layout from "../Componets/Layout";
import { Link, useHistory } from "react-router-dom";
import Rill from "../Componets/Rill";
import { useDisclosure } from "@chakra-ui/react";
import Foto from "../assets/add_photo.png";
import TambahBuktiKegiatan from "../Componets/TambahBuktiKegiatan";
import {
  Select as Select2,
  CreatableSelect,
  AsyncSelect,
} from "chakra-react-select";
import { useFormik } from "formik";
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
  Badge,
  Icon,
  Divider,
  InputGroup,
  InputRightElement,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaUser,
  FaCamera,
} from "react-icons/fa";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { parseISO } from "date-fns";
import moment from "moment";
import "moment/locale/id";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useColorModeValues } from "../Style/colorModeValues";
import { getCalendarStyles } from "../Style/calendarStyles";
import { useColorMode } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import {
  selectIsAuthenticated,
  userRedux,
  selectRole,
} from "../Redux/Reducers/auth";

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

function Profile() {
  const user = useSelector(userRedux);
  const role = useSelector(selectRole);
  const { colorMode } = useColorMode();
  const toast = useToast();
  const [dataProfile, setDataProfile] = useState(null);
  const [dataPegawai, setDataPegawai] = useState(null);
  const [events, setEvents] = useState([]);

  // State untuk modal ganti password
  const {
    isOpen: isOpenGantiPassword,
    onOpen: onOpenGantiPassword,
    onClose: onCloseGantiPassword,
  } = useDisclosure();
  const [passwordLama, setPasswordLama] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [showPasswordLama, setShowPasswordLama] = useState(false);
  const [showPasswordBaru, setShowPasswordBaru] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = localStorage.getItem("token");

  // State untuk edit foto profile
  const {
    isOpen: isOpenEditFoto,
    onOpen: onOpenEditFoto,
    onClose: onCloseEditFoto,
  } = useDisclosure();
  const fileInputRef = useRef(null);
  const [selectedFoto, setSelectedFoto] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);
  const [isUploadingFoto, setIsUploadingFoto] = useState(false);

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
        console.log(res.data, "ini");
      })
      .catch((err) => {
        console.error(err);
      });
  }

  async function fetchDataPegawai() {
    if (!user[0]?.pegawaiId) return;
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/pegawai/get/detail-pegawai/${user[0].pegawaiId}`
      );
      setDataPegawai(res.data.result[0]);
      console.log(res.data.result[0]);

      // Format events untuk kalender
      if (res.data.result[0]?.personils) {
        const formattedEvents = res.data.result[0].personils.map((item) => {
          const startDate = item.tanggalBerangkat
            ? parseISO(item.tanggalBerangkat)
            : new Date();

          const endDate = item.tanggalPulang
            ? parseISO(item.tanggalPulang)
            : startDate;

          return {
            title: Array.isArray(item.tujuan)
              ? item.tujuan.join(", ")
              : item.tujuan || "Perjalanan Dinas",
            start: startDate,
            end: endDate,
            allDay: true,
            resource: item,
          };
        });
        setEvents(formattedEvents);
      }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchProfile();
    fetchDataPegawai();
  }, []);

  // Cleanup preview URL saat komponen unmount
  useEffect(() => {
    return () => {
      if (previewFoto) {
        URL.revokeObjectURL(previewFoto);
      }
    };
  }, [previewFoto]);

  // Function untuk handle edit foto profile
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validasi ukuran file (maksimal 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Ukuran file maksimal 2MB",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Validasi tipe file (hanya gambar)
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: "File harus berupa gambar",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setSelectedFoto(file);
      const preview = URL.createObjectURL(file);
      setPreviewFoto(preview);
    }
  };

  const handleUploadFoto = async () => {
    if (!selectedFoto) {
      toast({
        title: "Error",
        description: "Silakan pilih foto terlebih dahulu",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsUploadingFoto(true);
    try {
      const formData = new FormData();
      formData.append("photo", selectedFoto);
      if (dataProfile?.profilePic) {
        formData.append("old_img", dataProfile.profilePic);
      }

      const res = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/user/profile/photo`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast({
        title: "Berhasil",
        description: res.data.message || "Foto profil berhasil diubah",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Reset state dan tutup modal
      setSelectedFoto(null);
      if (previewFoto) {
        URL.revokeObjectURL(previewFoto);
      }
      setPreviewFoto(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onCloseEditFoto();

      // Refresh data profile
      await fetchProfile();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Gagal mengubah foto profil. Silakan coba lagi.";
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUploadingFoto(false);
    }
  };

  const handleCancelEditFoto = () => {
    setSelectedFoto(null);
    if (previewFoto) {
      URL.revokeObjectURL(previewFoto);
    }
    setPreviewFoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onCloseEditFoto();
  };

  // Function untuk handle ganti password
  const handleChangePassword = async () => {
    // Validasi
    if (!passwordLama || !passwordBaru) {
      toast({
        title: "Error",
        description: "Password lama dan password baru harus diisi",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (passwordBaru.length < 6) {
      toast({
        title: "Error",
        description: "Password baru minimal 6 karakter",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/user/change-password`,
        {
          passwordLama,
          passwordBaru,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast({
        title: "Berhasil",
        description: res.data.message || "Password berhasil diubah",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Reset form dan tutup modal
      setPasswordLama("");
      setPasswordBaru("");
      onCloseGantiPassword();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Gagal mengubah password. Silakan coba lagi.";
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <Box bgColor={"secondary"} pb={"40px"} px={"30px"}>
        <Container
          border={"1px"}
          borderRadius={"6px"}
          borderColor={"rgba(229, 231, 235, 1)"}
          maxW={"1280px"}
          bgColor={"white"}
          pt={"30px"}
          ps={"0px"}
        >
          <Box p={"30px"}>
            {dataProfile ? (
              <>
                <Flex justify="space-between" align="center" mb={"30px"}>
                  <Heading size="lg">Profil Pengguna</Heading>
                </Flex>

                {/* Foto Profile */}
                <Box mb={"30px"}>
                  <Heading size="md" mb={"15px"}>
                    Foto Profile
                  </Heading>
                  <Box
                    border={"1px"}
                    borderColor={"rgba(229, 231, 235, 1)"}
                    borderRadius={"6px"}
                    p={"20px"}
                  >
                    <Flex align="center" gap={6}>
                      <Box position="relative">
                        <Image
                          src={
                            dataProfile.profilePic
                              ? `${
                                  import.meta.env.VITE_REACT_APP_API_BASE_URL
                                }${dataProfile.profilePic}`
                              : previewFoto || Foto
                          }
                          alt="Foto Profile"
                          boxSize="150px"
                          borderRadius="full"
                          objectFit="cover"
                          border="4px solid"
                          borderColor="blue.200"
                        />
                        <IconButton
                          aria-label="Edit foto profile"
                          icon={<FaCamera />}
                          position="absolute"
                          bottom="0"
                          right="0"
                          colorScheme="blue"
                          borderRadius="full"
                          size="sm"
                          onClick={onOpenEditFoto}
                        />
                      </Box>
                      <VStack align="start" spacing={2}>
                        <Text fontSize="md" fontWeight="medium">
                          {dataProfile.nama}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          Klik ikon kamera untuk mengubah foto profile
                        </Text>
                        <Button
                          leftIcon={<Icon as={FaCamera} />}
                          colorScheme="blue"
                          variant="outline"
                          size="sm"
                          onClick={onOpenEditFoto}
                        >
                          Ubah Foto
                        </Button>
                      </VStack>
                    </Flex>
                  </Box>
                </Box>

                {/* Informasi Dasar */}
                <Box mb={"30px"}>
                  <Heading size="md" mb={"15px"}>
                    Informasi Dasar
                  </Heading>
                  <Box
                    border={"1px"}
                    borderColor={"rgba(229, 231, 235, 1)"}
                    borderRadius={"6px"}
                    p={"20px"}
                  >
                    <Table variant="simple">
                      <Tbody>
                        <Tr>
                          <Th width={"30%"}>Nama</Th>
                          <Td>{dataProfile.nama}</Td>
                        </Tr>
                        <Tr>
                          <Th>Unit Kerja</Th>
                          <Td>
                            {dataProfile.unitKerja_profile?.unitkerja || "-"}
                          </Td>
                        </Tr>
                        <Tr>
                          <Th>Kode Unit Kerja</Th>
                          <Td>{dataProfile.unitKerja_profile?.kode || "-"}</Td>
                        </Tr>
                        <Tr>
                          <Th>Induk Unit Kerja</Th>
                          <Td>
                            {dataProfile.unitKerja_profile?.indukUnitKerja
                              ?.indukUnitKerja || "-"}
                          </Td>
                        </Tr>
                        <Tr>
                          <Th>Kode Induk Unit Kerja</Th>
                          <Td>
                            {dataProfile.unitKerja_profile?.indukUnitKerja
                              ?.kodeInduk || "-"}
                          </Td>
                        </Tr>
                      </Tbody>
                    </Table>
                  </Box>
                </Box>

                {/* Informasi User */}
                {dataProfile.user && (
                  <Box mb={"30px"}>
                    <HStack justify="space-between" mb={"15px"}>
                      <Heading size="md">Informasi User</Heading>
                      <Button
                        colorScheme="blue"
                        leftIcon={<Icon as={FaLock} />}
                        onClick={onOpenGantiPassword}
                      >
                        Ganti Password
                      </Button>
                    </HStack>
                    <Box
                      border={"1px"}
                      borderColor={"rgba(229, 231, 235, 1)"}
                      borderRadius={"6px"}
                      p={"20px"}
                    >
                      <Table variant="simple">
                        <Tbody>
                          <Tr>
                            <Th width={"30%"}>Nama Pengguna</Th>
                            <Td>{dataProfile.user.namaPengguna}</Td>
                          </Tr>
                          <Tr>
                            <Th>Roles</Th>
                            <Td>
                              {dataProfile.user.userRoles?.map(
                                (userRole, index) => (
                                  <Text
                                    key={index}
                                    as="span"
                                    mr={"10px"}
                                    px={"10px"}
                                    py={"5px"}
                                    bgColor={"blue.100"}
                                    borderRadius={"4px"}
                                    display={"inline-block"}
                                    mb={"5px"}
                                  >
                                    {userRole.role.nama}
                                  </Text>
                                )
                              ) || "-"}
                            </Td>
                          </Tr>
                        </Tbody>
                      </Table>
                    </Box>
                  </Box>
                )}

                {/* Informasi Pegawai */}
                {dataProfile.pegawai && (
                  <Box mb={"30px"}>
                    <Heading size="md" mb={"15px"}>
                      Informasi Pegawai
                    </Heading>
                    <Box
                      border={"1px"}
                      borderColor={"rgba(229, 231, 235, 1)"}
                      borderRadius={"6px"}
                      p={"20px"}
                    >
                      <Table variant="simple">
                        <Tbody>
                          <Tr>
                            <Th width={"30%"}>Nama</Th>
                            <Td>{dataProfile.pegawai.nama}</Td>
                          </Tr>
                          <Tr>
                            <Th>NIP</Th>
                            <Td>{dataProfile.pegawai.nip}</Td>
                          </Tr>
                          <Tr>
                            <Th>Pendidikan</Th>
                            <Td>{dataProfile.pegawai.pendidikan}</Td>
                          </Tr>
                          <Tr>
                            <Th>Jabatan</Th>
                            <Td>{dataProfile.pegawai.jabatan}</Td>
                          </Tr>
                          <Tr>
                            <Th>Tanggal TMT</Th>
                            <Td>
                              {dataProfile.pegawai.tanggalTMT
                                ? new Date(
                                    dataProfile.pegawai.tanggalTMT
                                  ).toLocaleDateString("id-ID")
                                : "-"}
                            </Td>
                          </Tr>
                          <Tr>
                            <Th>Tingkatan</Th>
                            <Td>
                              {dataProfile.pegawai.daftarTingkatan?.tingkatan ||
                                "-"}
                            </Td>
                          </Tr>
                          <Tr>
                            <Th>Golongan</Th>
                            <Td>
                              {dataProfile.pegawai.daftarGolongan?.golongan ||
                                "-"}
                            </Td>
                          </Tr>
                          <Tr>
                            <Th>Pangkat</Th>
                            <Td>
                              {dataProfile.pegawai.daftarPangkat?.pangkat ||
                                "-"}
                            </Td>
                          </Tr>
                          <Tr>
                            <Th>Profesi</Th>
                            <Td>{dataProfile.pegawai.profesi?.nama || "-"}</Td>
                          </Tr>
                          <Tr>
                            <Th>Status Pegawai</Th>
                            <Td>
                              {dataProfile.pegawai.statusPegawai?.status || "-"}
                            </Td>
                          </Tr>
                          <Tr>
                            <Th>Unit Kerja</Th>
                            <Td>
                              {dataProfile.pegawai.daftarUnitKerja?.unitKerja ||
                                "-"}
                            </Td>
                          </Tr>
                        </Tbody>
                      </Table>
                    </Box>
                  </Box>
                )}

                {/* Kalender Perjalanan Dinas */}
                <Box mb={"30px"}>
                  <HStack spacing={3} mb={4}>
                    <Box
                      p={2}
                      bgGradient="linear(to-br, blue.400, blue.600)"
                      borderRadius="8px"
                    >
                      <Icon as={FaCalendarAlt} color="white" boxSize={5} />
                    </Box>
                    <Heading size="md" color="blue.600">
                      Kalender Perjalanan Dinas
                    </Heading>
                  </HStack>
                  <Divider mb={6} borderColor={"rgba(229, 231, 235, 1)"} />
                  <Box
                    mb={6}
                    borderRadius="8px"
                    overflow="hidden"
                    border="1px solid"
                    borderColor={"rgba(229, 231, 235, 1)"}
                    bg="white"
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
                            backgroundColor: "rgba(59, 130, 246, 0.9)",
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
                </Box>

                {/* Daftar Perjalanan Dinas */}
                <Box mb={"30px"}>
                  <HStack spacing={3} mb={4}>
                    <Box
                      p={2}
                      bgGradient="linear(to-br, blue.400, blue.600)"
                      borderRadius="8px"
                    >
                      <Icon as={FaMapMarkerAlt} color="white" boxSize={5} />
                    </Box>
                    <Heading size="md" color="blue.600">
                      Daftar Perjalanan Dinas
                    </Heading>
                    {dataPegawai?.personils &&
                      dataPegawai.personils.length > 0 && (
                        <Badge
                          colorScheme="blue"
                          variant="subtle"
                          fontSize="sm"
                        >
                          {dataPegawai.personils.length} perjalanan
                        </Badge>
                      )}
                  </HStack>
                  <Divider mb={6} borderColor={"rgba(229, 231, 235, 1)"} />
                  <Box
                    overflowX="auto"
                    borderRadius="8px"
                    border="1px solid"
                    borderColor={"rgba(229, 231, 235, 1)"}
                  >
                    <Table variant="simple">
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
                        {dataPegawai?.personils &&
                        dataPegawai.personils.length > 0 ? (
                          dataPegawai.personils.map((item, index) => (
                            <Tr
                              key={index}
                              _hover={{
                                bg: "gray.50",
                                transition: "background 0.2s ease",
                              }}
                            >
                              <Td fontWeight="medium">
                                {item?.nomorSPD || "-"}
                              </Td>
                              <Td>
                                {item?.tanggalBerangkat
                                  ? new Date(
                                      item.tanggalBerangkat
                                    ).toLocaleDateString("id-ID", {
                                      weekday: "long",
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    })
                                  : "-"}
                              </Td>
                              <Td>
                                {item?.tanggalPulang
                                  ? new Date(
                                      item.tanggalPulang
                                    ).toLocaleDateString("id-ID", {
                                      weekday: "long",
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    })
                                  : "-"}
                              </Td>
                              <Td>
                                {item?.tujuan && item.tujuan.length > 0 ? (
                                  <VStack align="start" spacing={1}>
                                    {item.tujuan.map((val, idx) => (
                                      <HStack key={idx} spacing={1}>
                                        <Icon
                                          as={FaMapMarkerAlt}
                                          color="blue.500"
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
                              <Td fontWeight="semibold" color="blue.600">
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
                                  color="gray.400"
                                  boxSize={10}
                                />
                                <Text color="gray.500" fontWeight="medium">
                                  Tidak ada data perjalanan dinas
                                </Text>
                                <Text color="gray.400" fontSize="sm">
                                  Data perjalanan dinas akan muncul di sini
                                </Text>
                              </VStack>
                            </Td>
                          </Tr>
                        )}
                      </Tbody>
                    </Table>
                  </Box>
                </Box>
              </>
            ) : (
              <Text>Memuat data profil...</Text>
            )}
          </Box>
        </Container>
      </Box>

      {/* Modal Ganti Password */}
      <Modal
        isOpen={isOpenGantiPassword}
        onClose={onCloseGantiPassword}
        size="md"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Ganti Password</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel display="flex" alignItems="center" gap={2}>
                  <Icon as={FaLock} />
                  Password Lama
                </FormLabel>
                <InputGroup>
                  <Input
                    type={showPasswordLama ? "text" : "password"}
                    placeholder="Masukkan password lama"
                    value={passwordLama}
                    onChange={(e) => setPasswordLama(e.target.value)}
                    pr="50px"
                  />
                  <InputRightElement width="50px">
                    <IconButton
                      aria-label={
                        showPasswordLama
                          ? "Sembunyikan password"
                          : "Tampilkan password"
                      }
                      icon={showPasswordLama ? <FaEyeSlash /> : <FaEye />}
                      onClick={() => setShowPasswordLama(!showPasswordLama)}
                      variant="ghost"
                      size="sm"
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <FormControl>
                <FormLabel display="flex" alignItems="center" gap={2}>
                  <Icon as={FaLock} />
                  Password Baru
                </FormLabel>
                <InputGroup>
                  <Input
                    type={showPasswordBaru ? "text" : "password"}
                    placeholder="Masukkan password baru (min. 6 karakter)"
                    value={passwordBaru}
                    onChange={(e) => setPasswordBaru(e.target.value)}
                    pr="50px"
                  />
                  <InputRightElement width="50px">
                    <IconButton
                      aria-label={
                        showPasswordBaru
                          ? "Sembunyikan password"
                          : "Tampilkan password"
                      }
                      icon={showPasswordBaru ? <FaEyeSlash /> : <FaEye />}
                      onClick={() => setShowPasswordBaru(!showPasswordBaru)}
                      variant="ghost"
                      size="sm"
                    />
                  </InputRightElement>
                </InputGroup>
                <FormHelperText>
                  Password baru minimal 6 karakter
                </FormHelperText>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={onCloseGantiPassword}
              isDisabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleChangePassword}
              isLoading={isSubmitting}
              loadingText="Mengubah..."
            >
              Ubah Password
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Edit Foto Profile */}
      <Modal isOpen={isOpenEditFoto} onClose={handleCancelEditFoto} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Ubah Foto Profile</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Pilih Foto</FormLabel>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  display="none"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  leftIcon={<Icon as={FaCamera} />}
                  variant="outline"
                  width="full"
                >
                  Pilih Foto
                </Button>
                <FormHelperText>
                  Format: JPG, PNG, atau GIF. Maksimal 2MB
                </FormHelperText>
              </FormControl>

              {previewFoto && (
                <Box>
                  <Text mb={2} fontSize="sm" fontWeight="medium">
                    Preview:
                  </Text>
                  <Image
                    src={previewFoto}
                    alt="Preview foto"
                    boxSize="200px"
                    borderRadius="full"
                    objectFit="cover"
                    border="2px solid"
                    borderColor="gray.200"
                    mx="auto"
                  />
                </Box>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={handleCancelEditFoto}
              isDisabled={isUploadingFoto}
            >
              Batal
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleUploadFoto}
              isLoading={isUploadingFoto}
              loadingText="Mengupload..."
              isDisabled={!selectedFoto}
            >
              Simpan Foto
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Layout>
  );
}

export default Profile;
