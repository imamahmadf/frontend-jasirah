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

function NaikJenjang() {
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
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/naik-jenjang/get/${
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
        }/naik-jenjang/update/status`,
        {
          id: dataProfile.pegawai.usulanNaikJenjangs[0].id,
          status: "diusulkan",
        }
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
    formulir: Yup.mixed()
      .required("Formulir Usulan Naik Jenjang wajib diunggah")
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
    ukom: Yup.mixed()
      .required("Sertifikat UKOM wajib diunggah")
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
    SKPangkat: Yup.mixed()
      .required("SK Pangkat wajib diunggah")
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
    SKJafung: Yup.mixed()
      .required("SK Jafung wajib diunggah")
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
    SKP: Yup.mixed()
      .required("SKP wajib diunggah")
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
    STR: Yup.mixed()
      .required("STR wajib diunggah")
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
    SIP: Yup.mixed()
      .required("SIP wajib diunggah")
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
    rekom: Yup.mixed()
      .required("Surat Rekomendasi wajib diunggah")
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
    petaJabatan: Yup.mixed()
      .required("Peta Jabatan wajib diunggah")
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
    SKMutasi: Yup.mixed()
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
      name: "formulir",
      label: "Formulir Usulan Naik Jenjang",
      wajib: true,
      icon: FaFileAlt,
      color: "blue",
    },
    {
      name: "ukom",
      label: "Sertifikat UKOM",
      wajib: true,
      icon: FaCertificate,
      color: "green",
    },
    {
      name: "SKPangkat",
      label: "SK Pangkat",
      wajib: true,
      icon: FaFileContract,
      color: "purple",
    },
    {
      name: "SKJafung",
      label: "SK Jafung",
      wajib: true,
      icon: FaGraduationCap,
      color: "cyan",
    },
    {
      name: "SKP",
      label: "SKP",
      wajib: true,
      icon: FaFileAlt,
      color: "pink",
    },
    {
      name: "STR",
      label: "STR",
      wajib: true,
      icon: FaCertificate,
      color: "indigo",
    },
    {
      name: "SIP",
      label: "SIP",
      wajib: true,
      icon: FaFileContract,
      color: "teal",
    },
    {
      name: "rekom",
      label: "Surat Rekomendasi",
      wajib: true,
      icon: FaFileSignature,
      color: "orange",
    },
    {
      name: "petaJabatan",
      label: "Peta Jabatan",
      wajib: true,
      icon: FaFileInvoiceDollar,
      color: "yellow",
    },
    {
      name: "SKMutasi",
      label: "SK Mutasi",
      wajib: false,
      icon: FaFileSignature,
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
      formulir: "formulir",
      ukom: "ukom",
      SKPangkat: "SKPangkat",
      SKMutasi: "SKMutasi",
      SKJafung: "SKJafung",
      SKP: "SKP",
      STR: "STR",
      SIP: "SIP",
      rekom: "rekom",
      petaJabatan: "petaJabatan",
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
    const usulanId = dataProfile?.pegawai?.usulanNaikJenjangs[0]?.id;
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
    const usulanPegawai = dataProfile?.pegawai?.usulanNaikJenjangs[0];
    const namaFileLama = getNamaFileLama(fieldName, usulanPegawai);

    // Menambahkan nama file dokumen yang lama
    formData.append("nama_file_lama", namaFileLama);

    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/naik-jenjang/post/naik-jenjang`,
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
    formulir: {
      label: "Formulir Pengusulan",
      endpoint: "/usulan/upload/formulir",
      field: "formulir",
    },
    ukom: {
      label: "Sertifikat UKOM",
      endpoint: "/usulan/upload/ukom",
      field: "ukom",
    },
    SKPangkat: {
      label: "SK Pangkat",
      endpoint: "/usulan/upload/skpangkat",
      field: "SKPangkat",
    },
    SKMutasi: {
      label: "SK Mutasi",
      endpoint: "/usulan/upload/skmutasi",
      field: "SKMutasi",
    },
    SKJafung: {
      label: "SK Jafung",
      endpoint: "/usulan/upload/skjafung",
      field: "SKJafung",
    },
    SKP: {
      label: "SKP",
      endpoint: "/usulan/upload/skp",
      field: "SKP",
    },
    STR: {
      label: "STR",
      endpoint: "/usulan/upload/str",
      field: "STR",
    },
    SIP: {
      label: "SIP",
      endpoint: "/usulan/upload/sip",
      field: "SIP",
    },
    rekom: {
      label: "Surat Rekomendasi",
      endpoint: "/usulan/upload/rekom",
      field: "rekom",
    },
    petaJabatan: {
      label: "Peta Jabatan",
      endpoint: "/usulan/upload/petajabatan",
      field: "petaJabatan",
    },
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "diusulkan":
        return {
          text: "Menunggu Verifikasi",
          color: "orange",
          icon: FaClock,
          description: "Usulan Anda sedang dalam proses verifikasi oleh admin",
        };
      case "diterima":
        return {
          text: "Diterima",
          color: "green",
          icon: FaCheckCircle,
          description: "Selamat! Usulan Anda telah diterima dan disetujui",
        };
      case "ditolak":
        return {
          text: "Ditolak",
          color: "red",
          icon: FaTimesCircle,
          description:
            "Usulan naik jenjang Anda ditolak. Silakan upload ulang dokumen yang diperlukan",
        };
      default:
        return {
          text: "Belum Ada Usulan",
          color: "gray",
          icon: FaInfoCircle,
          description: "Anda belum mengajukan usulan naik jenjang",
        };
    }
  };

  const statusInfo = getStatusInfo(
    dataProfile?.pegawai?.usulanNaikJenjangs[0]?.status
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
                          {dataProfile?.pegawai?.daftarPangkat.pangkat}/
                          {dataProfile?.pegawai?.daftarGolongan.golongan}
                        </Text>
                      </HStack>
                    </HStack>
                    <HStack spacing={4} color="gray.600" fontSize="sm" mt={2}>
                      <HStack>
                        <Icon as={FaBuilding} />
                        <Text>
                          {dataProfile?.pegawai?.daftarUnitKerja.unitKerja}
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
                      colorScheme={statusInfo.color}
                      px={4}
                      py={2}
                      borderRadius="full"
                      fontSize="md"
                    >
                      <HStack spacing={2}>
                        <Icon as={statusInfo.icon} />
                        <Text>{statusInfo.text}</Text>
                      </HStack>
                    </Badge>

                    <Text
                      fontSize="sm"
                      color="gray.600"
                      maxW="300px"
                      textAlign="center"
                    >
                      {statusInfo.description}
                    </Text>
                  </VStack>
                </Box>
              </Flex>
            </CardBody>
          </Card>

          {/* Documents Section */}
          {dataProfile?.pegawai?.usulanNaikJenjangs[0]?.status === "ditolak" ? (
            <Card
              shadow="xl"
              border="1px"
              borderColor="gray.200"
              bg="white"
              borderRadius="xl"
            >
              <CardHeader bg="gray.50" borderTopRadius="xl">
                <Heading size="md" color="gray.800">
                  📋 Upload Ulang Dokumen Naik Jenjang
                </Heading>
                <Text color="gray.600" fontSize="sm">
                  Usulan naik jenjang Anda ditolak. Silakan upload ulang dokumen
                  yang diperlukan untuk naik jenjang. Pastikan semua dokumen
                  lengkap dan valid.
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
                          dataProfile?.pegawai.usulanNaikJenjangs[0].formulir
                        )
                      }
                      onUpload={() =>
                        setUploadModal({
                          open: true,
                          label: uploadConfig.formulir.label,
                          endpoint: uploadConfig.formulir.endpoint,
                          field: uploadConfig.formulir.field,
                          fileName: "formulir",
                        })
                      }
                      color="blue"
                      hasFile={
                        !!dataProfile?.pegawai.usulanNaikJenjangs[0].formulir
                      }
                    />
                    <DocumentUploadItem
                      title="Sertifikat UKOM"
                      icon={FaCertificate}
                      onPreview={() =>
                        handlePreview(
                          dataProfile?.pegawai.usulanNaikJenjangs[0].ukom
                        )
                      }
                      onUpload={() =>
                        setUploadModal({
                          open: true,
                          label: uploadConfig.ukom.label,
                          endpoint: uploadConfig.ukom.endpoint,
                          field: uploadConfig.ukom.field,
                          fileName: "ukom",
                        })
                      }
                      color="green"
                      hasFile={
                        !!dataProfile?.pegawai.usulanNaikJenjangs[0].ukom
                      }
                    />
                    <DocumentUploadItem
                      title="SK Pangkat"
                      icon={FaFileContract}
                      onPreview={() =>
                        handlePreview(
                          dataProfile?.pegawai.usulanNaikJenjangs[0].SKPangkat
                        )
                      }
                      onUpload={() =>
                        setUploadModal({
                          open: true,
                          label: uploadConfig.SKPangkat.label,
                          endpoint: uploadConfig.SKPangkat.endpoint,
                          field: uploadConfig.SKPangkat.field,
                          fileName: "SKPangkat",
                        })
                      }
                      color="purple"
                      hasFile={
                        !!dataProfile?.pegawai.usulanNaikJenjangs[0].SKPangkat
                      }
                    />
                    <DocumentUploadItem
                      title="SK Jafung"
                      icon={FaGraduationCap}
                      onPreview={() =>
                        handlePreview(
                          dataProfile?.pegawai.usulanNaikJenjangs[0].SKJafung
                        )
                      }
                      onUpload={() =>
                        setUploadModal({
                          open: true,
                          label: uploadConfig.SKJafung.label,
                          endpoint: uploadConfig.SKJafung.endpoint,
                          field: uploadConfig.SKJafung.field,
                          fileName: "SKJafung",
                        })
                      }
                      color="cyan"
                      hasFile={
                        !!dataProfile?.pegawai.usulanNaikJenjangs[0].SKJafung
                      }
                    />
                    <DocumentUploadItem
                      title="SK Mutasi"
                      icon={FaFileSignature}
                      onPreview={() =>
                        handlePreview(
                          dataProfile?.pegawai.usulanNaikJenjangs[0].SKMutasi
                        )
                      }
                      onUpload={() =>
                        setUploadModal({
                          open: true,
                          label: uploadConfig.SKMutasi.label,
                          endpoint: uploadConfig.SKMutasi.endpoint,
                          field: uploadConfig.SKMutasi.field,
                          fileName: "SKMutasi",
                        })
                      }
                      color="teal"
                      hasFile={
                        !!dataProfile?.pegawai.usulanNaikJenjangs[0].SKMutasi
                      }
                    />
                  </VStack>

                  {/* Right Column */}
                  <VStack spacing={4} align="stretch">
                    <DocumentUploadItem
                      title="SKP"
                      icon={FaFileAlt}
                      onPreview={() =>
                        handlePreview(
                          dataProfile?.pegawai.usulanNaikJenjangs[0].SKP
                        )
                      }
                      onUpload={() =>
                        setUploadModal({
                          open: true,
                          label: uploadConfig.SKP.label,
                          endpoint: uploadConfig.SKP.endpoint,
                          field: uploadConfig.SKP.field,
                          fileName: "SKP",
                        })
                      }
                      color="pink"
                      hasFile={!!dataProfile?.pegawai.usulanNaikJenjangs[0].SKP}
                    />
                    <DocumentUploadItem
                      title="STR"
                      icon={FaCertificate}
                      onPreview={() =>
                        handlePreview(
                          dataProfile?.pegawai.usulanNaikJenjangs[0].STR
                        )
                      }
                      onUpload={() =>
                        setUploadModal({
                          open: true,
                          label: uploadConfig.STR.label,
                          endpoint: uploadConfig.STR.endpoint,
                          field: uploadConfig.STR.field,
                          fileName: "STR",
                        })
                      }
                      color="indigo"
                      hasFile={!!dataProfile?.pegawai.usulanNaikJenjangs[0].STR}
                    />
                    <DocumentUploadItem
                      title="SIP"
                      icon={FaFileContract}
                      onPreview={() =>
                        handlePreview(
                          dataProfile?.pegawai.usulanNaikJenjangs[0].SIP
                        )
                      }
                      onUpload={() =>
                        setUploadModal({
                          open: true,
                          label: uploadConfig.SIP.label,
                          endpoint: uploadConfig.SIP.endpoint,
                          field: uploadConfig.SIP.field,
                          fileName: "SIP",
                        })
                      }
                      color="teal"
                      hasFile={!!dataProfile?.pegawai.usulanNaikJenjangs[0].SIP}
                    />
                    <DocumentUploadItem
                      title="Surat Rekomendasi"
                      icon={FaFileSignature}
                      onPreview={() =>
                        handlePreview(
                          dataProfile?.pegawai.usulanNaikJenjangs[0].rekom
                        )
                      }
                      onUpload={() =>
                        setUploadModal({
                          open: true,
                          label: uploadConfig.rekom.label,
                          endpoint: uploadConfig.rekom.endpoint,
                          field: uploadConfig.rekom.field,
                          fileName: "rekom",
                        })
                      }
                      color="orange"
                      hasFile={
                        !!dataProfile?.pegawai.usulanNaikJenjangs[0].rekom
                      }
                    />
                    <DocumentUploadItem
                      title="Peta Jabatan"
                      icon={FaFileInvoiceDollar}
                      onPreview={() =>
                        handlePreview(
                          dataProfile?.pegawai.usulanNaikJenjangs[0].petaJabatan
                        )
                      }
                      onUpload={() =>
                        setUploadModal({
                          open: true,
                          label: uploadConfig.petaJabatan.label,
                          endpoint: uploadConfig.petaJabatan.endpoint,
                          field: uploadConfig.petaJabatan.field,
                          fileName: "petaJabatan",
                        })
                      }
                      color="yellow"
                      hasFile={
                        !!dataProfile?.pegawai.usulanNaikJenjangs[0].petaJabatan
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
          ) : dataProfile?.pegawai?.usulanNaikJenjangs[0]?.status ===
            "diusulkan" ? (
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
                      Usulan Naik Jenjang Sedang Diproses
                    </Heading>
                    <Text color="gray.600" textAlign="center">
                      Usulan naik jenjang Anda sedang dalam proses verifikasi
                      oleh admin. Silakan tunggu notifikasi selanjutnya.
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
          ) : dataProfile?.pegawai?.usulanNaikJenjangs[0]?.status ===
            "diterima" ? (
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
                      Usulan Naik Jenjang Diterima!
                    </Heading>{" "}
                    <Badge colorScheme="blue" fontSize={"20px"} px={4} py={2}>
                      {`NOMOR PERMOHONAN:  ${dataProfile?.pegawai?.usulanNaikJenjangs[0]?.nomorUsulan}`}
                    </Badge>
                    <Text color="gray.600" textAlign="center">
                      Selamat! Usulan naik jenjang Anda telah disetujui dan
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
                            dataProfile?.pegawai?.usulanNaikJenjangs[0]
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
                          dataProfile?.pegawai?.usulanNaikJenjangs[0]
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
                  📤 Ajukan Usulan Naik Jenjang
                </Heading>
                <Text color="gray.600" fontSize="sm">
                  Upload dokumen yang diperlukan untuk mengajukan usulan naik
                  jenjang. Pastikan semua dokumen lengkap dan valid sesuai
                  persyaratan yang berlaku.
                </Text>
              </CardHeader>
              <CardBody p={8}>
                <Formik
                  initialValues={{
                    formulir: null,
                    ukom: null,
                    SKPangkat: null,
                    SKJafung: null,
                    SKP: null,
                    STR: null,
                    SIP: null,
                    rekom: null,
                    petaJabatan: null,
                    SKMutasi: null,
                  }}
                  validationSchema={validationSchema}
                  onSubmit={async (values, { setSubmitting, resetForm }) => {
                    const formData = new FormData();
                    // Append semua field wajib (sudah divalidasi pasti ada)
                    formData.append("formulir", values.formulir);
                    formData.append("ukom", values.ukom);
                    formData.append("SKPangkat", values.SKPangkat);
                    formData.append("SKJafung", values.SKJafung);
                    formData.append("SKP", values.SKP);
                    formData.append("STR", values.STR);
                    formData.append("SIP", values.SIP);
                    formData.append("rekom", values.rekom);
                    formData.append("petaJabatan", values.petaJabatan);
                    formData.append("pegawaiId", user[0].pegawaiId);
                    // Append field opsional jika ada
                    if (values.SKMutasi)
                      formData.append("SKMutasi", values.SKMutasi);
                    try {
                      await axios.post(
                        `${
                          import.meta.env.VITE_REACT_APP_API_BASE_URL
                        }/naik-jenjang/post/naik-jenjang`,
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
                            !values.formulir ||
                            !values.ukom ||
                            !values.SKPangkat ||
                            !values.SKJafung ||
                            !values.SKP ||
                            !values.STR ||
                            !values.SIP ||
                            !values.rekom ||
                            !values.petaJabatan
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
                        dataProfile?.pegawai?.usulanNaikJenjangs[0];
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

export default NaikJenjang;
