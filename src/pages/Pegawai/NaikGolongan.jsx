import React, { useRef, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { login } from "../../Redux/Reducers/auth"; // Import action creator
import { Route, Redirect, useHistory } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  Box,
  Center,
  Text,
  Button,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Container,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  Stack,
  Card,
  CardBody,
  CardHeader,
  Input,
  useToast,
  Badge,
  VStack,
  Divider,
  Spacer,
  Image,
  useDisclosure,
  useColorMode,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Avatar,
  IconButton,
  Tooltip,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import {
  selectIsAuthenticated,
  userRedux,
  selectRole,
} from "../../Redux/Reducers/auth";

import LayoutPegawai from "../../Componets/Pegawai/LayoutPegawai";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import axios from "axios";
import {
  FaUser,
  FaIdCard,
  FaGraduationCap,
  FaBuilding,
  FaCalendarAlt,
  FaFileAlt,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaDownload,
  FaEdit,
  FaTrash,
  FaShieldAlt,
  FaCertificate,
  FaFileContract,
  FaFileInvoiceDollar,
  FaUserGraduate,
  FaFileSignature,
  FaUpload,
  FaCloudUploadAlt,
  FaFilePdf,
  FaExclamationTriangle,
  FaInfoCircle,
  FaPaperPlane,
  FaSync,
} from "react-icons/fa";

function NaikGolongan() {
  const [selectedFiles, setSelectedFiles] = useState({});
  const user = useSelector(userRedux);
  const toast = useToast();
  const [dataProfile, setDataProfile] = useState(null);

  const handleLinkClick = (link) => {
    if (!link) return;
    // Pastikan link dimulai dengan http atau https
    const validLink =
      link.startsWith("http://") || link.startsWith("https://")
        ? link
        : `https://${link}`;
    window.open(validLink, "_blank");
  };

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

  const ubahStatus = () => {
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/usulan/update/usulan-pangkat`,
        { id: dataProfile?.pegawai?.usulanPegawais?.[0]?.id, status: 0 }
      )
      .then((res) => {
        console.log(res.data);
        fetchProfile();
        toast({
          title: "Berhasil!",
          description: "Usulan telah dikirim untuk verifikasi.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Gagal!",
          description: "Terjadi kesalahan saat mengirim usulan.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  // Validasi Yup
  const validationSchema = Yup.object().shape({
    formulirUsulan: Yup.mixed()
      .required("Formulir Usulan Naik Pangkat wajib diunggah")
      .test(
        "fileType",
        "Format file harus PDF",
        (value) => value && value.type === "application/pdf"
      )
      .test(
        "fileSize",
        "Ukuran file maksimal 700KB",
        (value) => value && value.size <= 700 * 1024
      ),
    skCpns: Yup.mixed()
      .required("Fotocopy SK CPNS Legalisir wajib diunggah")
      .test(
        "fileType",
        "Format file harus PDF",
        (value) => value && value.type === "application/pdf"
      )
      .test(
        "fileSize",
        "Ukuran file maksimal 700KB",
        (value) => value && value.size <= 700 * 1024
      ),
    skPns: Yup.mixed()
      .required("Fotocopy SK PNS Legalisir wajib diunggah")
      .test(
        "fileType",
        "Format file harus PDF",
        (value) => value && value.type === "application/pdf"
      )
      .test(
        "fileSize",
        "Ukuran file maksimal 700KB",
        (value) => value && value.size <= 700 * 1024
      ),
    PAK: Yup.mixed()
      .required("PAK wajib diunggah")
      .test(
        "fileType",
        "Format file harus PDF",
        (value) => value && value.type === "application/pdf"
      )
      .test(
        "fileSize",
        "Ukuran file maksimal 700KB",
        (value) => value && value.size <= 700 * 1024
      ),
    skJafung: Yup.mixed()
      .required(
        "Fotocopy SK Jafung Pengangkatan Pertama Kali Legalisir wajib diunggah"
      )
      .test(
        "fileType",
        "Format file harus PDF",
        (value) => value && value.type === "application/pdf"
      )
      .test(
        "fileSize",
        "Ukuran file maksimal 700KB",
        (value) => value && value.size <= 700 * 1024
      ),
    skp: Yup.mixed()
      .required("Fotocopy SKP 2 Tahun Terakhir Legalisir wajib diunggah")
      .test(
        "fileType",
        "Format file harus PDF",
        (value) => value && value.type === "application/pdf"
      )
      .test(
        "fileSize",
        "Ukuran file maksimal 700KB",
        (value) => value && value.size <= 700 * 1024
      ),
    skMutasi: Yup.mixed()
      .nullable()
      .test(
        "fileType",
        "Format file harus PDF",
        (value) => !value || value.type === "application/pdf"
      )
      .test(
        "fileSize",
        "Ukuran file maksimal 700KB",
        (value) => !value || value.size <= 700 * 1024
      ),
    STR: Yup.mixed()
      .nullable()
      .test(
        "fileType",
        "Format file harus PDF",
        (value) => !value || value.type === "application/pdf"
      )
      .test(
        "fileSize",
        "Ukuran file maksimal 700KB",
        (value) => !value || value.size <= 700 * 1024
      ),
    suratCuti: Yup.mixed()
      .nullable()
      .test(
        "fileType",
        "Format file harus PDF",
        (value) => !value || value.type === "application/pdf"
      )
      .test(
        "fileSize",
        "Ukuran file maksimal 700KB",
        (value) => !value || value.size <= 700 * 1024
      ),
  });

  const fileFields = [
    {
      name: "formulirUsulan",
      label: "Formulir Usulan Naik Pangkat",
      wajib: true,
      icon: FaFileAlt,
      color: "blue",
    },
    {
      name: "skCpns",
      label: "Fotocopy SK CPNS Legalisir",
      wajib: true,
      icon: FaCertificate,
      color: "green",
    },
    {
      name: "skPns",
      label: "Fotocopy SK PNS Legalisir",
      wajib: true,
      icon: FaFileContract,
      color: "purple",
    },
    {
      name: "PAK",
      label: "PAK",
      wajib: true,
      icon: FaFileInvoiceDollar,
      color: "orange",
    },
    {
      name: "skJafung",
      label: "Fotocopy SK Jafung Pengangkatan Pertama Kali Legalisir",
      wajib: true,
      icon: FaGraduationCap,
      color: "cyan",
    },
    {
      name: "skp",
      label: "Fotocopy SKP 2 Tahun Terakhir Legalisir",
      wajib: true,
      icon: FaFileAlt,
      color: "pink",
    },
    {
      name: "skMutasi",
      label: "Fotocopy SK Mutasi",
      wajib: false,
      icon: FaFileSignature,
      color: "teal",
    },
    {
      name: "STR",
      label: "Fotocopy STR dan SIP aktif Legalisir",
      wajib: false,
      icon: FaCertificate,
      color: "indigo",
    },
    {
      name: "suratCuti",
      label: "Fotocopy surat Cuti jika cuti > 29 hari",
      wajib: false,
      icon: FaFileContract,
      color: "red",
    },
  ];

  const handlePreview = (fileName) => {
    if (!fileName) return;
    const url = `${import.meta.env.VITE_REACT_APP_API_BASE_URL}${fileName}`;
    window.open(url, "_blank");
  };

  // Fungsi helper untuk mendapatkan nama file lama berdasarkan field name
  const getNamaFileLama = (fieldName, usulanPegawai) => {
    if (!usulanPegawai) return "";

    // Mapping field name ke property yang sesuai di data API
    const fieldMapping = {
      formulirUsulan: "formulirUsulan",
      skCpns: "skCpns",
      skPns: "skPns",
      PAK: "PAK",
      skMutasi: "skMutasi",
      skJafung: "skJafung",
      skp: "skp",
      STR: "str",
      suratCuti: "suratCuti",
      gelar: "gelar",
    };

    // Menggunakan mapping untuk mendapatkan nama file lama
    const apiFieldName = fieldMapping[fieldName];
    if (apiFieldName && usulanPegawai[apiFieldName]) {
      return usulanPegawai[apiFieldName];
    }

    return "";
  };

  // Fungsi untuk mengirim file ke API dengan informasi jenis dokumen
  const handleUploadFile = async (file, jenisDokumen, fieldName) => {
    if (!file) return false;
    if (file.size > 700 * 1024) {
      setUploadError("Ukuran file maksimal 700KB.");
      return false;
    }

    setUploadLoading(true);
    const usulanId = dataProfile?.pegawai?.usulanPegawais?.[0]?.id;
    const formData = new FormData();

    // Data file yang akan diupload
    formData.append("id", usulanId);
    formData.append("file", file);

    // Informasi tambahan tentang dokumen yang diupload
    formData.append("jenis_dokumen", jenisDokumen); // Contoh: "SK PNS", "PAK", "Formulir Pengusulan"
    formData.append("nama_file", file.name); // Nama file asli
    formData.append("ukuran_file", file.size); // Ukuran file dalam bytes
    formData.append("tipe_file", file.type); // MIME type file
    formData.append("field_name", fieldName); // Nama field di database

    // Mendapatkan nama file dokumen yang lama (jika ada)
    const usulanPegawai = dataProfile?.pegawai?.usulanPegawais?.[0];
    const namaFileLama = getNamaFileLama(fieldName, usulanPegawai);

    // Menambahkan nama file dokumen yang lama
    formData.append("nama_file_lama", namaFileLama);

    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/usulan/update/usulan-pegawai`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast({
        title: "Sukses!",
        description: `File ${jenisDokumen} berhasil diupload.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Refresh data setelah upload berhasil
      await fetchProfile();
      return true;
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Gagal Upload",
        description: `Terjadi kesalahan saat upload file ${jenisDokumen}.`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    } finally {
      setUploadLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const [uploadFile, setUploadFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadModal, setUploadModal] = useState({
    open: false,
    label: "",
    endpoint: "",
    field: "",
    fileName: "",
  });
  const [uploadError, setUploadError] = useState("");

  // Mapping dokumen ke endpoint dan field
  const uploadConfig = {
    formulirUsulan: {
      label: "Formulir Pengusulan",
      endpoint: "/usulan/upload/formulirusulan",
      field: "formulirUsulan",
    },
    skCpns: {
      label: "SK Cpns",
      endpoint: "/usulan/upload/skcpns",
      field: "skCpns",
    },
    skPns: {
      label: "SK PNS",
      endpoint: "/usulan/upload/skpns",
      field: "skPns",
    },
    PAK: {
      label: "PAK",
      endpoint: "/usulan/upload/PAK",
      field: "PAK",
    },
    skMutasi: {
      label: "SK Mutasi",
      endpoint: "/usulan/upload/skmutasi",
      field: "skMutasi",
    },
    skJafung: {
      label: "SK Jafung",
      endpoint: "/usulan/upload/skjafung",
      field: "skJafung",
    },
    skp: {
      label: "SKP",
      endpoint: "/usulan/upload/skp",
      field: "skp",
    },
    str: {
      label: "STR",
      endpoint: "/usulan/upload/str",
      field: "STR",
    },
    suratCuti: {
      label: "Surat Cuti",
      endpoint: "/usulan/upload/suratcuti",
      field: "suratCuti",
    },
    gelar: {
      label: "SK Pencantuman Gelar",
      endpoint: "/usulan/upload/gelar",
      field: "gelar",
    },
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 0:
        return {
          text: "Menunggu Verifikasi",
          color: "orange",
          icon: FaClock,
          description: "Usulan Anda sedang dalam proses verifikasi oleh admin",
        };
      case 1:
        return {
          text: "Diterima",
          color: "green",
          icon: FaCheckCircle,
          description: "Selamat! Usulan Anda telah diterima dan disetujui",
        };
      case 2:
        return {
          text: "Ditolak",
          color: "red",
          icon: FaTimesCircle,
          description:
            "Usulan Anda ditolak. Silakan upload ulang dokumen yang diperlukan",
        };
      default:
        return {
          text: "Belum Ada Usulan",
          color: "gray",
          icon: FaInfoCircle,
          description: "Anda belum mengajukan usulan naik golongan",
        };
    }
  };

  const statusInfo = getStatusInfo(
    dataProfile?.pegawai?.usulanPegawais?.[0]?.status
  );

  return (
    <LayoutPegawai>
      <Box
        bgGradient="linear(to-br, blue.50, purple.50)"
        minH="70vh"
        py={"80px"}
      >
        <Container maxW="7xl" px={4}>
          {/* Header Section */}
          <Card
            mb={8}
            shadow="xl"
            border="1px"
            borderColor="gray.200"
            bg="white"
            borderRadius="xl"
          >
            <CardBody p={8}>
              <Flex direction={{ base: "column", lg: "row" }} gap={6}>
                {/* Profile Info */}
                <Flex flex={1} gap={4} align="center">
                  <Avatar
                    size="xl"
                    name={dataProfile?.pegawai?.nama}
                    bg="blue.500"
                    color="white"
                    icon={<FaUser />}
                  />
                  <Box>
                    <Heading size="lg" color="gray.800" mb={2}>
                      {dataProfile?.pegawai?.nama}
                    </Heading>
                    <Text
                      fontSize="lg"
                      color="blue.600"
                      fontWeight="semibold"
                      mb={1}
                    >
                      {dataProfile?.pegawai?.jabatan}
                    </Text>
                    <HStack spacing={4} color="gray.600" fontSize="sm">
                      <HStack>
                        <Icon as={FaIdCard} />
                        <Text>{dataProfile?.pegawai?.nip}</Text>
                      </HStack>
                      <HStack>
                        <Icon as={FaShieldAlt} />
                        <Text>
                          {dataProfile?.pegawai?.daftarPangkat?.pangkat}/
                          {dataProfile?.pegawai?.daftarGolongan?.golongan}
                        </Text>
                      </HStack>
                    </HStack>
                    <HStack spacing={4} color="gray.600" fontSize="sm" mt={2}>
                      <HStack>
                        <Icon as={FaBuilding} />
                        <Text>
                          {dataProfile?.pegawai?.daftarUnitKerja?.unitKerja}
                        </Text>
                      </HStack>
                      <HStack>
                        <Icon as={FaCalendarAlt} />
                        <Text>{dataProfile?.pegawai?.tanggalTMT}</Text>
                      </HStack>
                    </HStack>
                  </Box>
                </Flex>

                {/* Status Section */}
                <Box textAlign={{ base: "left", lg: "right" }}>
                  <VStack spacing={3}>
                    <Badge
                      size="lg"
                      colorScheme={statusInfo?.color}
                      px={4}
                      py={2}
                      borderRadius="full"
                      fontSize="md"
                    >
                      <HStack spacing={2}>
                        <Icon as={statusInfo.icon} />
                        <Text>{statusInfo?.text}</Text>
                      </HStack>
                    </Badge>

                    <Text
                      fontSize="sm"
                      color="gray.600"
                      maxW="300px"
                      textAlign="center"
                    >
                      {statusInfo?.description}
                    </Text>
                  </VStack>
                </Box>
              </Flex>
            </CardBody>
          </Card>

          {/* Documents Section */}
          {dataProfile?.pegawai?.usulanPegawais?.[0]?.status === 2 ? (
            <Card
              shadow="xl"
              border="1px"
              borderColor="gray.200"
              bg="white"
              borderRadius="xl"
            >
              <CardHeader bg="gray.50" borderTopRadius="xl">
                <Heading size="md" color="gray.800">
                  📋 Upload Ulang Dokumen
                </Heading>
                <Text color="gray.600" fontSize="sm">
                  Usulan Anda ditolak. Silakan upload ulang dokumen yang
                  diperlukan
                </Text>
              </CardHeader>
              <CardBody p={8}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  {/* Left Column */}
                  <VStack spacing={4} align="stretch">
                    <DocumentUploadItem
                      title="Formulir Pengusulan"
                      icon={FaFileAlt}
                      onPreview={() =>
                        handlePreview(
                          dataProfile?.pegawai?.usulanPegawais?.[0]
                            ?.formulirUsulan
                        )
                      }
                      onUpload={() =>
                        setUploadModal({
                          open: true,
                          label: uploadConfig.formulirUsulan.label,
                          endpoint: uploadConfig.formulirUsulan.endpoint,
                          field: uploadConfig.formulirUsulan.field,
                          fileName: "formulirUsulan",
                        })
                      }
                      color="blue"
                      hasFile={
                        !!dataProfile?.pegawai?.usulanPegawais?.[0]
                          ?.formulirUsulan
                      }
                    />
                    <DocumentUploadItem
                      title="SK CPNS"
                      icon={FaCertificate}
                      onPreview={() =>
                        handlePreview(
                          dataProfile?.pegawai?.usulanPegawais?.[0]?.skCpns
                        )
                      }
                      onUpload={() =>
                        setUploadModal({
                          open: true,
                          label: uploadConfig.skCpns.label,
                          endpoint: uploadConfig.skCpns.endpoint,
                          field: uploadConfig.skCpns.field,
                          fileName: "skCpns",
                        })
                      }
                      color="green"
                      hasFile={
                        !!dataProfile?.pegawai?.usulanPegawais?.[0]?.skCpns
                      }
                    />
                    <DocumentUploadItem
                      title="SK PNS"
                      icon={FaFileContract}
                      onPreview={() =>
                        handlePreview(
                          dataProfile?.pegawai?.usulanPegawais?.[0]?.skPns
                        )
                      }
                      onUpload={() =>
                        setUploadModal({
                          open: true,
                          label: uploadConfig.skPns.label,
                          endpoint: uploadConfig.skPns.endpoint,
                          field: uploadConfig.skPns.field,
                          fileName: "skPns",
                        })
                      }
                      color="purple"
                      hasFile={
                        !!dataProfile?.pegawai?.usulanPegawais?.[0]?.skPns
                      }
                    />
                    <DocumentUploadItem
                      title="PAK"
                      icon={FaFileInvoiceDollar}
                      onPreview={() =>
                        handlePreview(
                          dataProfile?.pegawai?.usulanPegawais?.[0]?.PAK
                        )
                      }
                      onUpload={() =>
                        setUploadModal({
                          open: true,
                          label: uploadConfig.PAK.label,
                          endpoint: uploadConfig.PAK.endpoint,
                          field: uploadConfig.PAK.field,
                          fileName: "PAK",
                        })
                      }
                      color="orange"
                      hasFile={!!dataProfile?.pegawai?.usulanPegawais?.[0]?.PAK}
                    />
                    <DocumentUploadItem
                      title="SK Mutasi"
                      icon={FaFileSignature}
                      onPreview={() =>
                        handlePreview(
                          dataProfile?.pegawai?.usulanPegawais?.[0]?.skMutasi
                        )
                      }
                      onUpload={() =>
                        setUploadModal({
                          open: true,
                          label: uploadConfig.skMutasi.label,
                          endpoint: uploadConfig.skMutasi.endpoint,
                          field: uploadConfig.skMutasi.field,
                          fileName: "skMutasi",
                        })
                      }
                      color="teal"
                      hasFile={
                        !!dataProfile?.pegawai?.usulanPegawais?.[0]?.skMutasi
                      }
                    />
                  </VStack>

                  {/* Right Column */}
                  <VStack spacing={4} align="stretch">
                    <DocumentUploadItem
                      title="SK Jafung"
                      icon={FaGraduationCap}
                      onPreview={() =>
                        handlePreview(
                          dataProfile?.pegawai?.usulanPegawais?.[0]?.skJafung
                        )
                      }
                      onUpload={() =>
                        setUploadModal({
                          open: true,
                          label: uploadConfig.skJafung.label,
                          endpoint: uploadConfig.skJafung.endpoint,
                          field: uploadConfig.skJafung.field,
                          fileName: "skJafung",
                        })
                      }
                      color="cyan"
                      hasFile={
                        !!dataProfile?.pegawai?.usulanPegawais?.[0]?.skJafung
                      }
                    />
                    <DocumentUploadItem
                      title="SKP"
                      icon={FaFileAlt}
                      onPreview={() =>
                        handlePreview(
                          dataProfile?.pegawai?.usulanPegawais?.[0]?.skp
                        )
                      }
                      onUpload={() =>
                        setUploadModal({
                          open: true,
                          label: uploadConfig.skp.label,
                          endpoint: uploadConfig.skp.endpoint,
                          field: uploadConfig.skp.field,
                          fileName: "skp",
                        })
                      }
                      color="pink"
                      hasFile={!!dataProfile?.pegawai?.usulanPegawais?.[0]?.skp}
                    />
                    <DocumentUploadItem
                      title="STR"
                      icon={FaCertificate}
                      onPreview={() =>
                        handlePreview(
                          dataProfile?.pegawai?.usulanPegawais?.[0]?.str
                        )
                      }
                      onUpload={() =>
                        setUploadModal({
                          open: true,
                          label: uploadConfig.str.label,
                          endpoint: uploadConfig.str.endpoint,
                          field: uploadConfig.str.field,
                          fileName: "str",
                        })
                      }
                      color="indigo"
                      hasFile={!!dataProfile?.pegawai?.usulanPegawais?.[0]?.str}
                    />
                    <DocumentUploadItem
                      title="Surat Cuti"
                      icon={FaFileContract}
                      onPreview={() =>
                        handlePreview(
                          dataProfile?.pegawai?.usulanPegawais?.[0]?.suratCuti
                        )
                      }
                      onUpload={() =>
                        setUploadModal({
                          open: true,
                          label: uploadConfig.suratCuti.label,
                          endpoint: uploadConfig.suratCuti.endpoint,
                          field: uploadConfig.suratCuti.field,
                          fileName: "suratCuti",
                        })
                      }
                      color="red"
                      hasFile={
                        !!dataProfile?.pegawai?.usulanPegawais?.[0]?.suratCuti
                      }
                    />
                    <DocumentUploadItem
                      title="SK Pencantuman Gelar"
                      icon={FaUserGraduate}
                      onPreview={() =>
                        handlePreview(
                          dataProfile?.pegawai?.usulanPegawais?.[0]?.gelar
                        )
                      }
                      onUpload={() =>
                        setUploadModal({
                          open: true,
                          label: uploadConfig.gelar.label,
                          endpoint: uploadConfig.gelar.endpoint,
                          field: uploadConfig.gelar.field,
                          fileName: "gelar",
                        })
                      }
                      color="yellow"
                      hasFile={
                        !!dataProfile?.pegawai?.usulanPegawais?.[0]?.gelar
                      }
                    />
                  </VStack>
                </SimpleGrid>

                {/* Action Button */}
                <Box mt={8} pt={6} borderTop="1px" borderColor="gray.200">
                  <Center>
                    <Button
                      leftIcon={<FaPaperPlane />}
                      colorScheme="blue"
                      size="lg"
                      px={8}
                      onClick={ubahStatus}
                      _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                      transition="all 0.2s"
                    >
                      Kirim Usulan
                    </Button>
                  </Center>
                </Box>
              </CardBody>
            </Card>
          ) : dataProfile?.pegawai?.usulanPegawais?.[0]?.status === 0 ? (
            <Card
              shadow="xl"
              border="1px"
              borderColor="gray.200"
              bg="white"
              borderRadius="xl"
            >
              <CardBody p={8}>
                <Center>
                  <VStack spacing={4}>
                    <Icon as={FaClock} boxSize={16} color="orange.500" />
                    <Heading size="md" color="orange.600">
                      Usulan Sedang Diproses
                    </Heading>
                    <Text color="gray.600" textAlign="center">
                      Usulan Anda sedang dalam proses verifikasi oleh admin.
                      Silakan tunggu notifikasi selanjutnya.
                    </Text>
                    <Button
                      leftIcon={<FaSync />}
                      variant="outline"
                      onClick={fetchProfile}
                    >
                      Refresh Status
                    </Button>
                  </VStack>
                </Center>
              </CardBody>
            </Card>
          ) : dataProfile?.pegawai?.usulanPegawais?.[0]?.status === 1 ? (
            <Card
              shadow="xl"
              border="1px"
              borderColor="gray.200"
              bg="white"
              borderRadius="xl"
            >
              <CardBody p={8}>
                <Center>
                  <VStack spacing={4}>
                    <Icon as={FaCheckCircle} boxSize={16} color="green.500" />
                    <Heading size="md" color="green.600">
                      Usulan Diterima!
                    </Heading>{" "}
                    <Badge colorScheme="blue" fontSize={"20px"} px={4} py={2}>
                      {`NOMOR PERMOHONAN:  ${dataProfile?.pegawai?.usulanPegawais?.[0]?.nomorUsulan}`}
                    </Badge>
                    <Text color="gray.600" textAlign="center">
                      Selamat! Usulan naik golongan Anda telah disetujui dan
                      diterima.
                    </Text>
                    <Badge colorScheme="green" size="lg" px={4} py={2}>
                      Status: Diterima
                    </Badge>{" "}
                    <Box mt={4}>
                      <Text fontSize="16px" fontWeight="semibold" mb={2}>
                        Link Sertifikat:
                      </Text>
                      <Button
                        onClick={() =>
                          handleLinkClick(
                            dataProfile?.pegawai?.usulanPegawais?.[0]
                              ?.linkSertifikat
                          )
                        }
                        variant="link"
                        color="blue.500"
                        textDecoration="underline"
                        maxW="100%"
                        wordBreak="break-all"
                        textAlign="left"
                        justifyContent="flex-start"
                        p={2}
                        borderRadius="md"
                        _hover={{ color: "blue.700", bg: "blue.50" }}
                        transition="all 0.2s"
                        h="auto"
                        whiteSpace="normal"
                      >
                        {
                          dataProfile?.pegawai?.usulanPegawais?.[0]
                            ?.linkSertifikat
                        }
                      </Button>
                    </Box>
                  </VStack>
                </Center>
              </CardBody>
            </Card>
          ) : (
            <Card
              shadow="xl"
              border="1px"
              borderColor="gray.200"
              bg="white"
              borderRadius="xl"
            >
              <CardHeader bg="gray.50" borderTopRadius="xl">
                <Heading size="md" color="gray.800">
                  📤 Ajukan Usulan Naik Golongan
                </Heading>
                <Text color="gray.600" fontSize="sm">
                  Upload dokumen yang diperlukan untuk mengajukan usulan naik
                  golongan
                </Text>
              </CardHeader>
              <CardBody p={8}>
                <Formik
                  initialValues={{
                    formulirUsulan: null,
                    skCpns: null,
                    skPns: null,
                    PAK: null,
                    skJafung: null,
                    skp: null,
                    skMutasi: null,
                    STR: null,
                    suratCuti: null,
                  }}
                  validationSchema={validationSchema}
                  onSubmit={async (values, { setSubmitting, resetForm }) => {
                    const formData = new FormData();
                    // Append semua field wajib (sudah divalidasi pasti ada)
                    formData.append("formulirUsulan", values.formulirUsulan);
                    formData.append("skCpns", values.skCpns);
                    formData.append("skPns", values.skPns);
                    formData.append("PAK", values.PAK);
                    formData.append("skJafung", values.skJafung);
                    formData.append("skp", values.skp);
                    formData.append("pegawaiId", user[0].pegawaiId);
                    // Append field opsional jika ada
                    if (values.skMutasi)
                      formData.append("skMutasi", values.skMutasi);
                    if (values.STR) formData.append("STR", values.STR);
                    if (values.suratCuti)
                      formData.append("suratCuti", values.suratCuti);
                    try {
                      await axios.post(
                        `${
                          import.meta.env.VITE_REACT_APP_API_BASE_URL
                        }/usulan/post/golongan`,
                        formData,
                        { headers: { "Content-Type": "multipart/form-data" } }
                      );
                      toast({
                        title: "Sukses!",
                        description: "File berhasil diunggah.",
                        status: "success",
                        duration: 3000,
                        isClosable: true,
                      });
                      resetForm();
                      setSelectedFiles({});
                      fetchProfile();
                    } catch (error) {
                      toast({
                        title: "Gagal Mengunggah",
                        description: "Terjadi kesalahan saat mengunggah file",
                        status: "error",
                        duration: 3000,
                        isClosable: true,
                      });
                    }
                    setSubmitting(false);
                  }}
                >
                  {({
                    setFieldValue,
                    isSubmitting,
                    errors,
                    touched,
                    values,
                  }) => (
                    <Form>
                      <VStack spacing={6} align="stretch">
                        {fileFields.map((field) => (
                          <FormControl
                            key={field.name}
                            isInvalid={
                              errors[field.name] && touched[field.name]
                            }
                            isRequired={field.wajib}
                          >
                            <FormLabel>
                              <HStack spacing={2}>
                                <Box
                                  p={2}
                                  bg={`${field.color}.100`}
                                  color={`${field.color}.600`}
                                  borderRadius="lg"
                                >
                                  <Icon as={field.icon} boxSize={4} />
                                </Box>
                                <Text>
                                  {field.label}{" "}
                                  {field.wajib ? "(wajib)" : "(opsional)"}
                                </Text>
                              </HStack>
                            </FormLabel>
                            <Input
                              type="file"
                              accept="application/pdf"
                              onChange={(event) => {
                                setFieldValue(
                                  field.name,
                                  event.currentTarget.files[0]
                                );
                                setSelectedFiles((prev) => ({
                                  ...prev,
                                  [field.name]: event.currentTarget.files[0],
                                }));
                              }}
                              p={1}
                              borderColor="gray.300"
                              _focus={{
                                borderColor: `${field.color}.400`,
                                boxShadow: `0 0 0 1px ${field.color}.400`,
                              }}
                            />
                            {values[field.name] && (
                              <Box
                                p={3}
                                bg={`${field.color}.50`}
                                borderRadius="md"
                                mt={2}
                              >
                                <HStack spacing={2}>
                                  <Icon
                                    as={FaFilePdf}
                                    color={`${field.color}.600`}
                                  />
                                  <Text
                                    fontSize="sm"
                                    color={`${field.color}.700`}
                                  >
                                    File: {values[field.name].name}
                                  </Text>
                                </HStack>
                              </Box>
                            )}
                            <Text color="red.500" fontSize="sm" mt={1}>
                              {errors[field.name] &&
                                touched[field.name] &&
                                errors[field.name]}
                            </Text>
                          </FormControl>
                        ))}

                        <Button
                          type="submit"
                          colorScheme="blue"
                          size="lg"
                          leftIcon={<FaCloudUploadAlt />}
                          isLoading={isSubmitting}
                          isDisabled={
                            !values.formulirUsulan ||
                            !values.skCpns ||
                            !values.skPns ||
                            !values.PAK ||
                            !values.skJafung
                          }
                          _hover={{
                            transform: "translateY(-2px)",
                            shadow: "lg",
                          }}
                          transition="all 0.2s"
                        >
                          Upload & Kirim Usulan
                        </Button>
                      </VStack>
                    </Form>
                  )}
                </Formik>
              </CardBody>
            </Card>
          )}

          {/* Modal Upload Berkas Dinamis */}
          <Modal
            isOpen={uploadModal.open}
            onClose={() => {
              setUploadModal({ ...uploadModal, open: false });
              setUploadFile(null);
              setUploadError("");
            }}
            size="lg"
          >
            <ModalOverlay backdropFilter="blur(10px)" />
            <ModalContent borderRadius="xl">
              <ModalHeader color="blue.600">
                <HStack>
                  <Icon as={FaCloudUploadAlt} />
                  <Text>Upload {uploadModal.label}</Text>
                </HStack>
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      Jenis Dokumen: {uploadModal.label}
                    </Text>
                    <Text fontSize="sm" color="gray.600" mb={3}>
                      Field: {uploadModal.field}
                    </Text>
                    {/* Menampilkan nama file lama jika ada */}
                    {(() => {
                      const usulanPegawai =
                        dataProfile?.pegawai?.usulanPegawais?.[0];
                      const namaFileLama = getNamaFileLama(
                        uploadModal.field,
                        usulanPegawai
                      );

                      return namaFileLama ? (
                        <Alert status="warning" borderRadius="md">
                          <AlertIcon />
                          <Box>
                            <AlertTitle>File yang akan diganti:</AlertTitle>
                            <AlertDescription>{namaFileLama}</AlertDescription>
                          </Box>
                        </Alert>
                      ) : null;
                    })()}
                  </Box>

                  <FormControl>
                    <FormLabel>Pilih File PDF</FormLabel>
                    <Input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file && file.size > 700 * 1024) {
                          setUploadError("Ukuran file maksimal 700KB.");
                          setUploadFile(null);
                          e.target.value = null;
                        } else {
                          setUploadFile(file);
                          setUploadError("");
                        }
                      }}
                      mb={3}
                      borderColor="gray.300"
                      _focus={{
                        borderColor: "blue.400",
                        boxShadow: "0 0 0 1px blue.400",
                      }}
                    />
                  </FormControl>

                  {uploadFile && (
                    <Box
                      p={4}
                      bg="blue.50"
                      borderRadius="md"
                      border="1px"
                      borderColor="blue.200"
                    >
                      <HStack spacing={3} mb={2}>
                        <Icon as={FaFilePdf} color="blue.600" />
                        <Text fontSize="sm" fontWeight="bold" color="blue.700">
                          File yang dipilih:
                        </Text>
                      </HStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="blue.600">
                          Nama: {uploadFile.name}
                        </Text>
                        <Text fontSize="sm" color="blue.600">
                          Ukuran: {(uploadFile.size / 1024).toFixed(2)} KB
                        </Text>
                        <Text fontSize="sm" color="blue.600">
                          Tipe: {uploadFile.type}
                        </Text>
                      </VStack>
                    </Box>
                  )}

                  {uploadError && (
                    <Alert status="error" borderRadius="md">
                      <AlertIcon />
                      <AlertDescription>{uploadError}</AlertDescription>
                    </Alert>
                  )}
                </VStack>
              </ModalBody>
              <ModalFooter gap={3}>
                <Button
                  onClick={() => {
                    setUploadModal({ ...uploadModal, open: false });
                    setUploadFile(null);
                    setUploadError("");
                  }}
                  variant="outline"
                >
                  Batal
                </Button>
                <Button
                  colorScheme="blue"
                  leftIcon={<FaUpload />}
                  isLoading={uploadLoading}
                  isDisabled={!uploadFile}
                  onClick={async () => {
                    const success = await handleUploadFile(
                      uploadFile,
                      uploadModal.label,
                      uploadModal.field
                    );

                    if (success) {
                      setUploadFile(null);
                      setUploadError("");
                      setUploadModal({ ...uploadModal, open: false });
                    }
                  }}
                >
                  Upload
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Container>
      </Box>
    </LayoutPegawai>
  );
}

// Component untuk item dokumen upload
const DocumentUploadItem = ({
  title,
  icon,
  onPreview,
  onUpload,
  color,
  hasFile,
}) => (
  <Card
    border="1px"
    borderColor={hasFile ? "gray.200" : "gray.100"}
    bg={hasFile ? "white" : "gray.50"}
    _hover={{
      transform: "translateY(-2px)",
      shadow: "lg",
      borderColor: `${color}.300`,
    }}
    transition="all 0.2s"
    cursor="pointer"
  >
    <CardBody p={4}>
      <HStack justify="space-between" align="center">
        <HStack spacing={3}>
          <Box
            p={2}
            bg={`${color}.100`}
            color={`${color}.600`}
            borderRadius="lg"
          >
            <Icon as={icon} boxSize={5} />
          </Box>
          <VStack align="start" spacing={0}>
            <Text fontWeight="medium" color="gray.700">
              {title}
            </Text>
            {hasFile && (
              <Text fontSize="xs" color="green.500">
                ✓ File tersedia
              </Text>
            )}
          </VStack>
        </HStack>
        <HStack spacing={2}>
          {hasFile && (
            <Button
              size="sm"
              colorScheme={color}
              variant="ghost"
              leftIcon={<FaEye />}
              _hover={{ bg: `${color}.100` }}
              onClick={onPreview}
            >
              Lihat
            </Button>
          )}
          <Button
            size="sm"
            colorScheme={color}
            variant="outline"
            leftIcon={<FaUpload />}
            onClick={onUpload}
          >
            {hasFile ? "Ganti" : "Upload"}
          </Button>
        </HStack>
      </HStack>
    </CardBody>
  </Card>
);

export default NaikGolongan;
