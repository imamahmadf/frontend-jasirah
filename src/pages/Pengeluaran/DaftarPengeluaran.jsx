import React, { useState, useEffect, useRef } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import axios from "axios";

import LayoutAset from "../../Componets/Aset/LayoutAset";
import ReactPaginate from "react-paginate";

import "../../Style/pagination.css";
import { useHistory, useLocation } from "react-router-dom";
import { formatRupiah, parseRupiah } from "../../utils/formatRupiah";
import { BsFileEarmarkExcel } from "react-icons/bs";
import Foto from "../../assets/add_photo.png";
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
  FormControl,
  FormLabel,
  FormErrorMessage,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Heading,
  SimpleGrid,
  Th,
  Spacer,
  Td,
  Flex,
  Textarea,
  Input,
  useToast,
  useColorMode,
  VStack,
  Divider,
  Badge,
  Skeleton,
} from "@chakra-ui/react";
import { Select as Select2, AsyncSelect } from "chakra-react-select";
import { useDisclosure } from "@chakra-ui/react";

function DaftarPengeluaran() {
  const [dataPengeluaran, setDataPengeluaran] = useState([]);
  const history = useHistory();
  const location = useLocation();
  const pengeluaranIdFromUrlHandled = useRef(false);
  const token = localStorage.getItem("token");
  const [dataSeed, setDataSeed] = useState(null);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // filter sesuai controller
  const [indukUnitKerjaFilterId, setIndukUnitKerjaFilterId] = useState(0);
  const [unitKerjaFilterId, setUnitKerjaFilterId] = useState(0);
  const [pegawaiFilterId, setPegawaiFilterId] = useState(0);
  const [rekananFilterId, setRekananFilterId] = useState(0);
  const [metodePembayaranFilterId, setMetodePembayaranFilterId] = useState(0);
  const [jenisPengeluaranFilterId, setJenisPengeluaranFilterId] = useState(0);
  const [statusPembayaranFilterId, setStatusPembayaranFilterId] = useState(0);
  const [tanggalAwal, setTanggalAwal] = useState("");
  const [tanggalAkhir, setTanggalAkhir] = useState("");
  const [sortBy, setSortBy] = useState("tanggal");
  const [sortOrder, setSortOrder] = useState("DESC");

  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();

  const {
    isOpen: isTambahOpen,
    onOpen: onTambahOpen,
    onClose: onTambahClose,
  } = useDisclosure();
  const {
    isOpen: isPreviewFotoOpen,
    onOpen: onPreviewFotoOpen,
    onClose: onPreviewFotoClose,
  } = useDisclosure();
  const [previewFotoUrl, setPreviewFotoUrl] = useState("");
  const [selectedPengeluaran, setSelectedPengeluaran] = useState(null);
  const formikRefTambah = useRef(null);
  const dataListRef = useRef(null);

  const initialValuesTambah = {
    tanggal: "",
    jatuhTempo: "",
    deskripsi: "",
    indukUnitKerjaId: null,
    indukUnitKerjaLabel: "",
    unitKerjaId: null,
    unitKerjaLabel: "",
    pegawaiId: null,
    pegawaiLabel: "",
    metodePembayaranId: null,
    jenisPengeluaranId: null,
    statusPembayaranId: null,
    rekananId: null,
    rekananLabel: "",
    nominal: "",
    pic: null,
    fotoExisting: "",
  };

  const downloadExcelPegawai = async (unitKerjaId = null) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/pengeluaran/get/download`,
        {
          params: unitKerjaId ? { unitKerjaId } : {},
          responseType: "blob", // agar respons dibaca sebagai file
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "data-pegawai.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Gagal mengunduh file Excel:", error);
      alert("Terjadi kesalahan saat mengunduh file.");
    }
  };

  const tambahRekanan = (namaRekananBaru, setFieldValue) => {
    axios
      .post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/barjas/post/rekanan`,
        { nama: namaRekananBaru },
      )
      .then((res) => {
        toast({
          title: "Berhasil!",
          description: "Rekanan ditambahkan.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setFieldValue("namaRekananBaru", "");
        setFieldValue("isTambahRekananBaru", false);
      })
      .catch((err) => {
        console.error(err.message);
        toast({
          title: "Error!",
          description: "Gagal Menambahkan",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
  };
  const validationSchemaTambah = Yup.object().shape({
    tanggal: Yup.string().required("Tanggal wajib diisi"),
    jatuhTempo: Yup.string().nullable(),
    deskripsi: Yup.string().required("Deskripsi wajib diisi"),
    indukUnitKerjaId: Yup.mixed()
      .nullable()
      .required("Unit Usaha wajib dipilih"),
    unitKerjaId: Yup.mixed().nullable().required("Proyek wajib dipilih"),
    pegawaiId: Yup.mixed().nullable(),
    metodePembayaranId: Yup.mixed()
      .nullable()
      .required("Metode pembayaran wajib dipilih"),
    jenisPengeluaranId: Yup.mixed()
      .nullable()
      .required("Jenis pengeluaran wajib dipilih"),
    statusPembayaranId: Yup.mixed()
      .nullable()
      .required("Status pembayaran wajib dipilih"),
    nominal: Yup.number()
      .typeError("Nominal harus angka")
      .positive("Nominal harus lebih dari 0")
      .required("Nominal wajib diisi"),
    rekananId: Yup.mixed().nullable(),
  });

  const scrollToDataList = () => {
    dataListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const changePage = ({ selected }) => {
    setPage(selected);
    scrollToDataList();
  };

  const isStatusPaid = (item) => {
    const nama = (
      item?.statusPembayaran?.nama ||
      item?.statusPembayaran?.status ||
      ""
    ).toLowerCase();
    return nama === "paid" || nama.includes("lunas");
  };

  const getSisaHariJatuhTempo = (jatuhTempo) => {
    if (!jatuhTempo) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const jt = new Date(jatuhTempo);
    if (Number.isNaN(jt.getTime())) return null;
    jt.setHours(0, 0, 0, 0);
    return Math.round((jt - today) / (1000 * 60 * 60 * 24));
  };

  const getRowJatuhTempoStyle = (item) => {
    if (!item?.jatuhTempo || isStatusPaid(item)) return {};

    const sisaHari = getSisaHariJatuhTempo(item.jatuhTempo);
    if (sisaHari === null) return {};

    if (sisaHari <= 1) {
      return {
        bg: colorMode === "dark" ? "red.900" : "red.50",
        _hover: { bg: colorMode === "dark" ? "red.800" : "red.100" },
      };
    }
    if (sisaHari <= 7) {
      return {
        bg: colorMode === "dark" ? "yellow.900" : "yellow.50",
        _hover: { bg: colorMode === "dark" ? "yellow.800" : "yellow.100" },
      };
    }
    return {};
  };

  // Reset ke halaman pertama saat filter berubah
  useEffect(() => {
    setPage(0);
  }, [
    indukUnitKerjaFilterId,
    unitKerjaFilterId,
    pegawaiFilterId,
    metodePembayaranFilterId,
    jenisPengeluaranFilterId,
    statusPembayaranFilterId,
    tanggalAwal,
    tanggalAkhir,
    rekananFilterId,
    sortBy,
    sortOrder,
  ]);

  const loadIndukUnitKerjaOptions = async (inputValue) => {
    if (!inputValue) return [];
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/admin/search/induk-unit-kerja?q=${encodeURIComponent(inputValue)}`,
      );
      return (res.data.result || []).map((val) => ({
        value: val.id,
        label: val.indukUnitKerja,
      }));
    } catch (err) {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/induk-unit-kerja/get`,
        );
        return (res.data.result || [])
          .filter((val) =>
            val.indukUnitKerja
              ?.toLowerCase()
              .includes(inputValue.toLowerCase()),
          )
          .map((val) => ({
            value: val.id,
            label: val.indukUnitKerja,
          }));
      } catch (fallbackErr) {
        console.error("Failed to load Unit Usaha:", fallbackErr.message);
        return [];
      }
    }
  };

  const handleCloseModal = (resetForm) => {
    if (resetForm) resetForm();
    setSelectedPengeluaran(null);
    onTambahClose();
  };

  async function fetchSeed() {
    await axios
      .get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/pengeluaran/get/seed`,
      )
      .then((res) => {
        setDataSeed(res.data);
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error!",
          description: "Gagal memuat data seed pengeluaran",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
  }

  async function fetchDataPengeluaran() {
    setIsLoading(true);
    await axios
      .get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/pengeluaran/get?page=${page}&limit=${limit}&indukUnitKerjaId=${indukUnitKerjaFilterId}&unitKerjaId=${unitKerjaFilterId}&pegawaiId=${pegawaiFilterId}&rekananId=${rekananFilterId}&metodePembayaranId=${metodePembayaranFilterId}&jenisPengeluaranId=${jenisPengeluaranFilterId}&statusPembayaranId=${statusPembayaranFilterId}&startDate=${tanggalAwal}&endDate=${tanggalAkhir}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
      )
      .then((res) => {
        setDataPengeluaran(res.data.result || []);
        setPages(res.data.totalPage || 0);
        setRows(res.data.totalRows || 0);
        console.log(res.data);
      })

      .catch((err) => {
        console.error(err);
        toast({
          title: "Error!",
          description: "Gagal memuat data pengeluaran",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      })
      .finally(() => setIsLoading(false));
  }

  const submitTambahPengeluaran = async (
    values,
    { resetForm, setSubmitting },
  ) => {
    try {
      const fd = new FormData();
      fd.append("tanggal", values.tanggal);
      if (values.jatuhTempo) fd.append("jatuhTempo", values.jatuhTempo);
      fd.append("deskripsi", values.deskripsi);
      fd.append("indukUnitKerjaId", values.indukUnitKerjaId);
      fd.append("unitKerjaId", values.unitKerjaId);
      fd.append("metodePembayaranId", values.metodePembayaranId);
      fd.append("jenisPengeluaranId", values.jenisPengeluaranId);
      fd.append("nominal", values.nominal);
      if (values.pegawaiId != null && values.pegawaiId !== "") {
        fd.append("pegawaiId", values.pegawaiId);
      }
      fd.append("statusPembayaranId", values.statusPembayaranId);
      if (values.rekananId != null && values.rekananId !== "") {
        fd.append("rekananId", String(values.rekananId));
      }

      if (values.pic) fd.append("pic", values.pic);

      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/pengeluaran/post`,
        fd,
      );

      toast({
        title: "Berhasil!",
        description: "Data pengeluaran berhasil ditambahkan.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      await fetchDataPengeluaran();
      handleCloseModal(resetForm);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error!",
        description:
          err.response?.data?.message || "Gagal menambahkan data pengeluaran",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const submitEditPengeluaran = async (
    values,
    { resetForm, setSubmitting },
  ) => {
    if (!selectedPengeluaran?.id) return;

    try {
      const fd = new FormData();
      fd.append("tanggal", values.tanggal);
      fd.append("jatuhTempo", values.jatuhTempo || "");
      fd.append("deskripsi", values.deskripsi);
      fd.append("indukUnitKerjaId", values.indukUnitKerjaId);
      fd.append("unitKerjaId", values.unitKerjaId);
      fd.append("metodePembayaranId", values.metodePembayaranId);
      fd.append("jenisPengeluaranId", values.jenisPengeluaranId);
      fd.append("nominal", values.nominal);
      fd.append(
        "pegawaiId",
        values.pegawaiId != null ? String(values.pegawaiId) : "",
      );
      fd.append("statusPembayaranId", values.statusPembayaranId);
      fd.append(
        "rekananId",
        values.rekananId != null ? String(values.rekananId) : "",
      );
      if (values.pic) fd.append("pic", values.pic);

      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/pengeluaran/put/${selectedPengeluaran.id}`,
        fd,
      );

      toast({
        title: "Berhasil!",
        description: "Data pengeluaran berhasil diupdate.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      await fetchDataPengeluaran();
      setSelectedPengeluaran(null);
      handleCloseModal(resetForm);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error!",
        description:
          err.response?.data?.message || "Gagal mengupdate data pengeluaran",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openTambahModal = () => {
    setSelectedPengeluaran(null);
    onTambahOpen();
  };

  const openEditModal = (item) => {
    setSelectedPengeluaran(item);
    onTambahOpen();
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pengeluaranId = params.get("pengeluaranId");
    if (!pengeluaranId) {
      pengeluaranIdFromUrlHandled.current = false;
      return;
    }
    if (!dataPengeluaran.length) return;

    const item = dataPengeluaran.find(
      (p) => String(p.id) === String(pengeluaranId),
    );
    if (item && !pengeluaranIdFromUrlHandled.current) {
      pengeluaranIdFromUrlHandled.current = true;
      openEditModal(item);
      history.replace("/pengeluaran/daftar-pengeluaran");
    }
  }, [dataPengeluaran, location.search, history]);

  useEffect(() => {
    fetchSeed();
  }, []);

  useEffect(() => {
    fetchDataPengeluaran();
  }, [
    page,
    limit,
    indukUnitKerjaFilterId,
    unitKerjaFilterId,
    pegawaiFilterId,
    metodePembayaranFilterId,
    jenisPengeluaranFilterId,
    statusPembayaranFilterId,
    tanggalAwal,
    tanggalAkhir,
    rekananFilterId,
    sortBy,
    sortOrder,
  ]);

  const formatTanggal = (d) =>
    d
      ? new Date(d).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "-";

  const apiBaseUrl = import.meta.env.VITE_REACT_APP_API_BASE_URL;

  const InfoRow = ({ label, value, valueColor }) => (
    <Flex justify="space-between" align="flex-start" py={1.5} gap={3}>
      <Text fontSize="sm" color="gray.500" flexShrink={0}>
        {label}
      </Text>
      <Text
        fontSize="sm"
        fontWeight="semibold"
        textAlign="right"
        color={valueColor}
        flex={1}
      >
        {value}
      </Text>
    </Flex>
  );

  const renderMobileCards = () => {
    if (isLoading) {
      return Array.from({ length: 3 }).map((_, idx) => (
        <Box
          key={idx}
          mb={4}
          p={4}
          borderRadius="lg"
          border="1px solid"
          borderColor="gray.200"
          bg={colorMode === "dark" ? "gray.700" : "white"}
        >
          <Skeleton height="24px" mb={3} />
          <Skeleton height="16px" mb={2} />
          <Skeleton height="16px" mb={2} />
          <Skeleton height="40px" mt={4} />
        </Box>
      ));
    }

    if (!dataPengeluaran?.length) {
      return (
        <Box
          py={10}
          px={4}
          textAlign="center"
          bg={colorMode === "dark" ? "gray.700" : "gray.50"}
          borderRadius="md"
        >
          <VStack spacing={2}>
            <Text fontSize="md" color="gray.500">
              Tidak ada data pengeluaran
            </Text>
            <Text fontSize="sm" color="gray.400">
              Klik tombol &quot;Tambah&quot; untuk menambahkan data baru
            </Text>
          </VStack>
        </Box>
      );
    }

    return dataPengeluaran.map((item) => {
      const rowStyle = getRowJatuhTempoStyle(item);
      const statusLabel =
        item?.statusPembayaran?.nama || item?.statusPembayaran?.status || "-";

      return (
        <Box
          key={item.id}
          mb={4}
          borderRadius="lg"
          border="1px solid"
          borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
          overflow="hidden"
          bg={rowStyle.bg || (colorMode === "dark" ? "gray.700" : "white")}
          boxShadow="sm"
        >
          <Box px={4} py={3}>
            <Flex justify="space-between" align="flex-start" gap={3} mb={2}>
              <Box flex={1} minW={0}>
                <Text fontSize="lg" fontWeight="bold" color="green.600">
                  {formatRupiah(item?.nominal)}
                </Text>
                <Text fontSize="sm" color="gray.600" mt={1} noOfLines={2}>
                  {item?.deskripsi || "-"}
                </Text>
              </Box>
              <Badge colorScheme="green" variant="subtle" flexShrink={0}>
                {statusLabel}
              </Badge>
            </Flex>

            <HStack spacing={2} flexWrap="wrap" mb={3}>
              <Badge colorScheme="purple" variant="subtle" fontSize="xs">
                {item?.metodePembayaran?.nama ||
                  item?.metodePembayaran?.metode ||
                  "-"}
              </Badge>
              <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                {item?.jenisPengeluaran?.nama ||
                  item?.jenisPengeluaran?.jenis ||
                  "-"}
              </Badge>
            </HStack>

            <InfoRow label="Tanggal" value={formatTanggal(item?.tanggal)} />
            <InfoRow
              label="Jatuh Tempo"
              value={formatTanggal(item?.jatuhTempo)}
            />
            <InfoRow
              label="Proyek"
              value={item?.daftarUnitKerja?.unitKerja || "-"}
            />
            <InfoRow label="Pegawai" value={item?.pegawai?.nama || "-"} />
            <InfoRow label="Rekanan" value={item?.rekanan?.nama || "-"} />

            {item?.foto && (
              <Box mt={3}>
                <Text fontSize="xs" color="gray.500" mb={2}>
                  Foto
                </Text>
                <Image
                  src={`${apiBaseUrl}${item.foto}`}
                  alt="foto pengeluaran"
                  boxSize="72px"
                  objectFit="cover"
                  borderRadius="8px"
                  border="1px solid"
                  borderColor="gray.200"
                  cursor="pointer"
                  onClick={() => {
                    setPreviewFotoUrl(`${apiBaseUrl}${item.foto}`);
                    onPreviewFotoOpen();
                  }}
                />
              </Box>
            )}

            <HStack mt={4} spacing={2}>
              <Button
                flex={1}
                size="sm"
                variant="outline"
                colorScheme="blue"
                onClick={() => openEditModal(item)}
              >
                Edit
              </Button>
              <Button
                flex={1}
                size="sm"
                variant="outline"
                colorScheme="teal"
                onClick={() =>
                  history.push(`/pengeluaran/detail-pengeluaran/${item.id}`)
                }
              >
                Detail
              </Button>
            </HStack>
          </Box>
        </Box>
      );
    });
  };

  return (
    <>
      <LayoutAset>
        <Box
          bgColor={"secondary"}
          pb={{ base: "20px", md: "40px" }}
          px={{ base: "12px", md: "30px" }}
          pt={{ base: "16px", md: "30px" }}
        >
          <Box
            bgColor={"white"}
            p={{ base: "16px", md: "30px" }}
            borderRadius={{ base: "8px", md: "10px" }}
            bg={colorMode === "dark" ? "gray.800" : "white"}
            boxShadow="sm"
          >
            {/* Header */}
            <Flex
              direction={{ base: "column", md: "row" }}
              align={{ base: "stretch", md: "center" }}
              mb={{ base: 4, md: "30px" }}
              gap={4}
            >
              <VStack align="start" spacing={1}>
                <Heading
                  size={{ base: "md", md: "lg" }}
                  color={colorMode === "dark" ? "gray.100" : "gray.700"}
                >
                  Daftar Pengeluaran
                </Heading>
                <Text fontSize="sm" color="gray.500">
                  Total: {rows} data
                </Text>
              </VStack>
              <Spacer />
              <Button
                onClick={openTambahModal}
                variant={"primary"}
                px={{ base: 4, md: "30px" }}
                size={{ base: "sm", md: "md" }}
                w={{ base: "full", md: "auto" }}
                leftIcon={<Text fontSize="lg">+</Text>}
              >
                <Text as="span" display={{ base: "inline", md: "none" }}>
                  Tambah
                </Text>
                <Text as="span" display={{ base: "none", md: "inline" }}>
                  Tambah Pengeluaran
                </Text>
              </Button>{" "}
              <Button
                onClick={downloadExcelPegawai}
                variant="outline"
                leftIcon={<BsFileEarmarkExcel />}
                borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                _hover={{
                  bg: colorMode === "dark" ? "gray.700" : "gray.50",
                }}
                flex={"auto"}
                maxW={"200px"}
              >
                {"Download Excel"}
              </Button>
            </Flex>

            <Divider mb={{ base: 4, md: "30px" }} />

            {/* Filter */}
            <Box mb={{ base: 4, md: "30px" }}>
              <Heading
                size={{ base: "sm", md: "md" }}
                mb={{ base: 3, md: "20px" }}
                color={colorMode === "dark" ? "gray.100" : "gray.700"}
              >
                Filter Pencarian
              </Heading>
              <SimpleGrid
                columns={{ base: 1, md: 2, lg: 3 }}
                spacing={{ base: 4, md: 5 }}
              >
                <FormControl>
                  <FormLabel
                    fontSize={{ base: "sm", md: "16px" }}
                    fontWeight="medium"
                  >
                    Unit Usaha
                  </FormLabel>
                  <AsyncSelect
                    loadOptions={loadIndukUnitKerjaOptions}
                    placeholder="Ketik Nama Unit Usaha"
                    onChange={(selectedOption) => {
                      setIndukUnitKerjaFilterId(selectedOption?.value || 0);
                    }}
                    components={{
                      DropdownIndicator: () => null,
                      IndicatorSeparator: () => null,
                    }}
                    chakraStyles={{
                      container: (provided) => ({
                        ...provided,
                        borderRadius: "6px",
                      }),
                      control: (provided) => ({
                        ...provided,
                        backgroundColor: "terang",
                        border: "0px",
                        height: "60px",
                        _hover: { borderColor: "yellow.700" },
                        minHeight: "40px",
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        bg: state.isFocused ? "aset" : "white",
                        color: state.isFocused ? "white" : "black",
                      }),
                    }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize={"16px"} fontWeight="medium">
                    Proyek
                  </FormLabel>
                  <AsyncSelect
                    loadOptions={async (inputValue) => {
                      if (!inputValue) return [];
                      try {
                        const res = await axios.get(
                          `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/admin/search/unit-kerja?q=${inputValue}`,
                        );
                        return (res.data.result || []).map((val) => ({
                          value: val.id,
                          label: val.unitKerja,
                        }));
                      } catch (err) {
                        console.error("Failed to load options:", err.message);
                        return [];
                      }
                    }}
                    placeholder="Ketik Nama Proyek"
                    onChange={(selectedOption) => {
                      setUnitKerjaFilterId(selectedOption?.value || 0);
                    }}
                    components={{
                      DropdownIndicator: () => null,
                      IndicatorSeparator: () => null,
                    }}
                    chakraStyles={{
                      container: (provided) => ({
                        ...provided,
                        borderRadius: "6px",
                      }),
                      control: (provided) => ({
                        ...provided,
                        backgroundColor: "terang",
                        border: "0px",
                        height: "60px",
                        _hover: { borderColor: "yellow.700" },
                        minHeight: "40px",
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        bg: state.isFocused ? "aset" : "white",
                        color: state.isFocused ? "white" : "black",
                      }),
                    }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize={"16px"} fontWeight="medium">
                    Pegawai
                  </FormLabel>
                  <AsyncSelect
                    loadOptions={async (inputValue) => {
                      if (!inputValue) return [];
                      try {
                        const res = await axios.get(
                          `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/pegawai/search?q=${inputValue}`,
                        );
                        return (res.data.result || []).map((val) => ({
                          value: val.id,
                          label: val.nama || val.name || `Pegawai #${val.id}`,
                        }));
                      } catch (err) {
                        console.error("Failed to load options:", err.message);
                        return [];
                      }
                    }}
                    placeholder="Ketik Nama Pegawai"
                    onChange={(selectedOption) => {
                      setPegawaiFilterId(selectedOption?.value || 0);
                    }}
                    components={{
                      DropdownIndicator: () => null,
                      IndicatorSeparator: () => null,
                    }}
                    chakraStyles={{
                      container: (provided) => ({
                        ...provided,
                        borderRadius: "6px",
                      }),
                      control: (provided) => ({
                        ...provided,
                        backgroundColor: "terang",
                        border: "0px",
                        height: "60px",
                        _hover: { borderColor: "yellow.700" },
                        minHeight: "40px",
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        bg: state.isFocused ? "aset" : "white",
                        color: state.isFocused ? "white" : "black",
                      }),
                    }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize={"16px"} fontWeight="medium">
                    Rekanan
                  </FormLabel>
                  <AsyncSelect
                    loadOptions={async (inputValue) => {
                      if (!inputValue) return [];
                      try {
                        const res = await axios.get(
                          `${
                            import.meta.env.VITE_REACT_APP_API_BASE_URL
                          }/barjas/get/rekanan/search?q=${inputValue}`,
                        );

                        const filtered = res.data.result;

                        return filtered.map((val) => ({
                          value: val.id,
                          label: val.nama,
                        }));
                      } catch (err) {
                        console.error("Failed to load options:", err.message);
                        return [];
                      }
                    }}
                    placeholder="Ketik Nama Rekanan"
                    onChange={(selectedOption) => {
                      setRekananFilterId(selectedOption?.value || 0);
                    }}
                    components={{
                      DropdownIndicator: () => null,
                      IndicatorSeparator: () => null,
                    }}
                    chakraStyles={{
                      container: (provided) => ({
                        ...provided,
                        borderRadius: "6px",
                      }),
                      control: (provided) => ({
                        ...provided,
                        backgroundColor: "terang",
                        border: "0px",
                        height: "60px",
                        _hover: { borderColor: "yellow.700" },
                        minHeight: "40px",
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        bg: state.isFocused ? "aset" : "white",
                        color: state.isFocused ? "white" : "black",
                      }),
                    }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize={"16px"} fontWeight="medium">
                    Metode Pembayaran
                  </FormLabel>
                  <Select2
                    options={(dataSeed?.resultMetodePembayaran || []).map(
                      (val) => ({
                        value: val.id,
                        label: val.nama || val.metode || `Metode #${val.id}`,
                      }),
                    )}
                    placeholder="Pilih Metode Pembayaran"
                    onChange={(selectedOption) =>
                      setMetodePembayaranFilterId(selectedOption?.value || 0)
                    }
                    components={{
                      DropdownIndicator: () => null,
                      IndicatorSeparator: () => null,
                    }}
                    chakraStyles={{
                      container: (provided) => ({
                        ...provided,
                        borderRadius: "6px",
                      }),
                      control: (provided) => ({
                        ...provided,
                        backgroundColor: "terang",
                        border: "0px",
                        height: "60px",
                        _hover: { borderColor: "yellow.700" },
                        minHeight: "40px",
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        bg: state.isFocused ? "aset" : "white",
                        color: state.isFocused ? "white" : "black",
                      }),
                    }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize={"16px"} fontWeight="medium">
                    Jenis Pengeluaran
                  </FormLabel>
                  <Select2
                    options={(dataSeed?.reslutJenisPengeluaran || []).map(
                      (val) => ({
                        value: val.id,
                        label: val.nama || val.jenis || `Jenis #${val.id}`,
                      }),
                    )}
                    placeholder="Pilih Jenis Pengeluaran"
                    onChange={(selectedOption) =>
                      setJenisPengeluaranFilterId(selectedOption?.value || 0)
                    }
                    components={{
                      DropdownIndicator: () => null,
                      IndicatorSeparator: () => null,
                    }}
                    chakraStyles={{
                      container: (provided) => ({
                        ...provided,
                        borderRadius: "6px",
                      }),
                      control: (provided) => ({
                        ...provided,
                        backgroundColor: "terang",
                        border: "0px",
                        height: "60px",
                        _hover: { borderColor: "yellow.700" },
                        minHeight: "40px",
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        bg: state.isFocused ? "aset" : "white",
                        color: state.isFocused ? "white" : "black",
                      }),
                    }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize={"16px"} fontWeight="medium">
                    Status Pembayaran
                  </FormLabel>
                  <Select2
                    options={(dataSeed?.resultStatusPembayaran || []).map(
                      (val) => ({
                        value: val.id,
                        label: val.nama || val.status || `Status #${val.id}`,
                      }),
                    )}
                    placeholder="Pilih Status Pembayaran"
                    onChange={(selectedOption) =>
                      setStatusPembayaranFilterId(selectedOption?.value || 0)
                    }
                    components={{
                      DropdownIndicator: () => null,
                      IndicatorSeparator: () => null,
                    }}
                    chakraStyles={{
                      container: (provided) => ({
                        ...provided,
                        borderRadius: "6px",
                      }),
                      control: (provided) => ({
                        ...provided,
                        backgroundColor: "terang",
                        border: "0px",
                        height: "60px",
                        _hover: { borderColor: "yellow.700" },
                        minHeight: "40px",
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        bg: state.isFocused ? "aset" : "white",
                        color: state.isFocused ? "white" : "black",
                      }),
                    }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize={"16px"} fontWeight="medium">
                    Tanggal Awal
                  </FormLabel>
                  <Input
                    bgColor={"terang"}
                    height={"50px"}
                    type="date"
                    value={tanggalAwal}
                    onChange={(e) => setTanggalAwal(e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize={"16px"} fontWeight="medium">
                    Tanggal Akhir
                  </FormLabel>
                  <Input
                    bgColor={"terang"}
                    height={"50px"}
                    type="date"
                    value={tanggalAkhir}
                    onChange={(e) => setTanggalAkhir(e.target.value)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize={"16px"} fontWeight="medium">
                    Urutkan Berdasarkan
                  </FormLabel>
                  <Select2
                    options={[
                      { value: "tanggal", label: "Tanggal" },
                      { value: "nominal", label: "Nominal" },
                    ]}
                    value={{
                      value: sortBy,
                      label: sortBy === "nominal" ? "Nominal" : "Tanggal",
                    }}
                    onChange={(selectedOption) =>
                      setSortBy(selectedOption?.value || "tanggal")
                    }
                    components={{
                      DropdownIndicator: () => null,
                      IndicatorSeparator: () => null,
                    }}
                    chakraStyles={{
                      container: (provided) => ({
                        ...provided,
                        borderRadius: "6px",
                      }),
                      control: (provided) => ({
                        ...provided,
                        backgroundColor: "terang",
                        border: "0px",
                        height: "60px",
                        _hover: { borderColor: "yellow.700" },
                        minHeight: "40px",
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        bg: state.isFocused ? "aset" : "white",
                        color: state.isFocused ? "white" : "black",
                      }),
                    }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize={"16px"} fontWeight="medium">
                    Urutan
                  </FormLabel>
                  <Select2
                    options={
                      sortBy === "nominal"
                        ? [
                            { value: "DESC", label: "Nominal Terbesar" },
                            { value: "ASC", label: "Nominal Terkecil" },
                          ]
                        : [
                            { value: "DESC", label: "Tanggal Terbaru" },
                            { value: "ASC", label: "Tanggal Terlama" },
                          ]
                    }
                    value={{
                      value: sortOrder,
                      label:
                        sortBy === "nominal"
                          ? sortOrder === "ASC"
                            ? "Nominal Terkecil"
                            : "Nominal Terbesar"
                          : sortOrder === "ASC"
                            ? "Tanggal Terlama"
                            : "Tanggal Terbaru",
                    }}
                    onChange={(selectedOption) =>
                      setSortOrder(selectedOption?.value || "DESC")
                    }
                    components={{
                      DropdownIndicator: () => null,
                      IndicatorSeparator: () => null,
                    }}
                    chakraStyles={{
                      container: (provided) => ({
                        ...provided,
                        borderRadius: "6px",
                      }),
                      control: (provided) => ({
                        ...provided,
                        backgroundColor: "terang",
                        border: "0px",
                        height: "60px",
                        _hover: { borderColor: "yellow.700" },
                        minHeight: "40px",
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        bg: state.isFocused ? "aset" : "white",
                        color: state.isFocused ? "white" : "black",
                      }),
                    }}
                  />
                </FormControl>
              </SimpleGrid>

              {(indukUnitKerjaFilterId ||
                unitKerjaFilterId ||
                pegawaiFilterId ||
                rekananFilterId ||
                metodePembayaranFilterId ||
                jenisPengeluaranFilterId ||
                statusPembayaranFilterId ||
                tanggalAwal ||
                tanggalAkhir ||
                sortBy !== "tanggal" ||
                sortOrder !== "DESC") && (
                <Button
                  mt={4}
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  onClick={() => {
                    setIndukUnitKerjaFilterId(0);
                    setUnitKerjaFilterId(0);
                    setPegawaiFilterId(0);
                    setRekananFilterId(0);
                    setMetodePembayaranFilterId(0);
                    setJenisPengeluaranFilterId(0);
                    setStatusPembayaranFilterId(0);
                    setTanggalAwal("");
                    setTanggalAkhir("");
                    setSortBy("tanggal");
                    setSortOrder("DESC");
                  }}
                >
                  Reset Filter
                </Button>
              )}
            </Box>

            <Divider mb={{ base: 4, md: "30px" }} />

            <Box ref={dataListRef} scrollMarginTop="88px">
            {/* Mobile: kartu daftar */}
            <Box display={{ base: "block", md: "none" }} mb={4}>
              {renderMobileCards()}
            </Box>

            {/* Desktop: tabel */}
            <Box
              display={{ base: "none", md: "block" }}
              borderRadius="8px"
              overflow="hidden"
              overflowX="auto"
              border="1px solid"
              borderColor="gray.200"
            >
              <Table variant="simple" size="md">
                <Thead bg={colorMode === "dark" ? "gray.700" : "gray.50"}>
                  <Tr>
                    <Th fontWeight="bold" textTransform="capitalize">
                      Tanggal
                    </Th>
                    <Th fontWeight="bold" textTransform="capitalize">
                      Jatuh Tempo
                    </Th>
                    <Th fontWeight="bold" textTransform="capitalize">
                      Deskripsi
                    </Th>
                    <Th fontWeight="bold" textTransform="capitalize">
                      Proyek
                    </Th>
                    <Th fontWeight="bold" textTransform="capitalize">
                      Pegawai
                    </Th>
                    <Th fontWeight="bold" textTransform="capitalize">
                      Rekanan
                    </Th>
                    <Th fontWeight="bold" textTransform="capitalize">
                      Metode
                    </Th>
                    <Th fontWeight="bold" textTransform="capitalize">
                      Jenis
                    </Th>
                    <Th fontWeight="bold" textTransform="capitalize">
                      Status
                    </Th>
                    <Th fontWeight="bold" textTransform="capitalize" isNumeric>
                      Nominal
                    </Th>
                    <Th fontWeight="bold" textTransform="capitalize">
                      Foto
                    </Th>
                    <Th fontWeight="bold" textTransform="capitalize">
                      Aksi
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <Tr key={idx}>
                        {Array.from({ length: 11 }).map((__, i) => (
                          <Td key={i}>
                            <Skeleton height="20px" />
                          </Td>
                        ))}
                      </Tr>
                    ))
                  ) : dataPengeluaran?.length > 0 ? (
                    dataPengeluaran.map((item) => {
                      const rowStyle = getRowJatuhTempoStyle(item);
                      return (
                        <Tr
                          key={item.id}
                          bg={rowStyle.bg}
                          _hover={
                            rowStyle._hover ?? {
                              bg: colorMode === "dark" ? "gray.700" : "gray.50",
                            }
                          }
                          transition="all 0.2s"
                        >
                          <Td>
                            {item?.tanggal
                              ? new Date(item?.tanggal).toLocaleDateString(
                                  "id-ID",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )
                              : "-"}
                          </Td>
                          <Td>
                            {item?.jatuhTempo
                              ? new Date(item.jatuhTempo).toLocaleDateString(
                                  "id-ID",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )
                              : "-"}
                          </Td>
                          <Td>
                            <Text fontSize="sm" noOfLines={2}>
                              {item?.deskripsi || "-"}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm">
                              {item?.daftarUnitKerja?.unitKerja || "-"}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm">
                              {item?.pegawai?.nama || "-"}
                            </Text>
                          </Td>{" "}
                          <Td>
                            <Text fontSize="sm">
                              {item?.rekanan?.nama || "-"}
                            </Text>
                          </Td>
                          <Td>
                            <Badge colorScheme="purple" variant="subtle">
                              {item?.metodePembayaran?.nama ||
                                item?.metodePembayaran?.metode ||
                                "-"}
                            </Badge>
                          </Td>
                          <Td>
                            <Badge colorScheme="blue" variant="subtle">
                              {item?.jenisPengeluaran?.nama ||
                                item?.jenisPengeluaran?.jenis ||
                                "-"}
                            </Badge>
                          </Td>
                          <Td>
                            <Badge colorScheme="green" variant="subtle">
                              {item?.statusPembayaran?.nama ||
                                item?.statusPembayaran?.status ||
                                "-"}
                            </Badge>
                          </Td>
                          <Td isNumeric>
                            <Text fontWeight="bold" color="green.600">
                              Rp{" "}
                              {Number(item?.nominal || 0).toLocaleString(
                                "id-ID",
                              )}
                            </Text>
                          </Td>
                          <Td>
                            {item?.foto ? (
                              <Image
                                src={`${import.meta.env.VITE_REACT_APP_API_BASE_URL}${item.foto}`}
                                alt="foto pengeluaran"
                                boxSize="56px"
                                objectFit="cover"
                                borderRadius="8px"
                                border="1px solid"
                                borderColor="gray.200"
                                cursor="pointer"
                                onClick={() => {
                                  setPreviewFotoUrl(
                                    `${import.meta.env.VITE_REACT_APP_API_BASE_URL}${item.foto}`,
                                  );
                                  onPreviewFotoOpen();
                                }}
                              />
                            ) : (
                              "-"
                            )}
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              <Button
                                size="sm"
                                variant="outline"
                                colorScheme="blue"
                                onClick={() => openEditModal(item)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                colorScheme="teal"
                                onClick={() =>
                                  history.push(
                                    `/pengeluaran/detail-pengeluaran/${item.id}`,
                                  )
                                }
                              >
                                Detail
                              </Button>
                            </HStack>
                          </Td>
                        </Tr>
                      );
                    })
                  ) : (
                    <Tr>
                      <Td colSpan={11} textAlign="center" py={10}>
                        <VStack spacing={2}>
                          <Text fontSize="lg" color="gray.500">
                            Tidak ada data pengeluaran
                          </Text>
                          <Text fontSize="sm" color="gray.400">
                            Klik tombol "Tambah Pengeluaran" untuk menambahkan
                            data baru
                          </Text>
                        </VStack>
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>
            </Box>

            {rows > 0 && (
              <Flex
                className="pengeluaran-pagination"
                mt={{ base: 4, md: 6 }}
                pt={4}
                borderTop="1px solid"
                borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                direction={{ base: "column", md: "row" }}
                justify={{ base: "center", md: "space-between" }}
                align="center"
                gap={{ base: 3, md: 4 }}
                w="full"
              >
                <Text
                  fontSize="sm"
                  textAlign={{ base: "center", md: "left" }}
                  color={colorMode === "dark" ? "gray.400" : "gray.600"}
                >
                  Menampilkan {page * limit + 1}–
                  {Math.min((page + 1) * limit, rows)} dari {rows} data
                  {pages > 1 && (
                    <>
                      {" "}
                      · Halaman {page + 1} dari {pages}
                    </>
                  )}
                </Text>
                {pages > 1 && (
                  <Box
                    w={{ base: "full", md: "auto" }}
                    overflowX="auto"
                    display="flex"
                    justifyContent={{ base: "center", md: "flex-end" }}
                    py={1}
                  >
                    <ReactPaginate
                      previousLabel={"←"}
                      nextLabel={"→"}
                      pageCount={pages}
                      onPageChange={changePage}
                      forcePage={page}
                      activeClassName="item active"
                      breakClassName="item break-me"
                      breakLabel="..."
                      containerClassName="pagination"
                      disabledClassName="disabled-page"
                      marginPagesDisplayed={1}
                      nextClassName="item next"
                      pageClassName="item pagination-page"
                      pageRangeDisplayed={2}
                      previousClassName="item previous"
                    />
                  </Box>
                )}
              </Flex>
            )}
          </Box>
        </Box>
      </LayoutAset>

      {/* Modal Preview Foto */}
      <Modal
        isOpen={isPreviewFotoOpen}
        onClose={onPreviewFotoClose}
        isCentered
        size={{ base: "full", md: "3xl" }}
      >
        <ModalOverlay />
        <ModalContent
          maxW={{ base: "100%", md: "900px" }}
          m={{ base: 0, md: 4 }}
        >
          <ModalHeader>Preview Foto Pengeluaran</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Flex justify="center">
              <Image
                src={previewFotoUrl}
                alt="preview foto pengeluaran"
                maxH="70vh"
                maxW="100%"
                objectFit="contain"
                borderRadius="8px"
              />
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal Tambah Pengeluaran */}
      <Modal
        closeOnOverlayClick={false}
        isOpen={isTambahOpen}
        onClose={() =>
          handleCloseModal(() => formikRefTambah.current?.resetForm())
        }
        size={{ base: "full", md: "6xl" }}
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent
          borderRadius={{ base: 0, md: "md" }}
          maxW={{ base: "100%", md: "1100px" }}
          m={{ base: 0, md: 4 }}
          maxH={{ base: "100dvh", md: "90vh" }}
          display="flex"
          flexDirection="column"
          overflow="hidden"
        >
          <Formik
            innerRef={formikRefTambah}
            initialValues={
              selectedPengeluaran
                ? {
                    tanggal: selectedPengeluaran?.tanggal
                      ? String(selectedPengeluaran.tanggal).slice(0, 10)
                      : "",
                    jatuhTempo: selectedPengeluaran?.jatuhTempo
                      ? String(selectedPengeluaran.jatuhTempo).slice(0, 10)
                      : "",
                    deskripsi: selectedPengeluaran?.deskripsi || "",
                    indukUnitKerjaId:
                      selectedPengeluaran?.indukUnitKerjaId ??
                      selectedPengeluaran?.indukUnitKerja?.id ??
                      null,
                    indukUnitKerjaLabel:
                      selectedPengeluaran?.indukUnitKerja?.indukUnitKerja || "",
                    unitKerjaId: selectedPengeluaran?.unitKerjaId || null,
                    unitKerjaLabel:
                      selectedPengeluaran?.daftarUnitKerja?.unitKerja || "",
                    pegawaiId: selectedPengeluaran?.pegawaiId || null,
                    pegawaiLabel: selectedPengeluaran?.pegawai?.nama || "",
                    metodePembayaranId:
                      selectedPengeluaran?.metodePembayaranId || null,
                    jenisPengeluaranId:
                      selectedPengeluaran?.jenisPengeluaranId || null,
                    statusPembayaranId:
                      selectedPengeluaran?.statusPembayaranId || null,
                    rekananId:
                      selectedPengeluaran?.rekananId ??
                      selectedPengeluaran?.rekanan?.id ??
                      null,
                    rekananLabel: selectedPengeluaran?.rekanan?.nama || "",
                    nominal: selectedPengeluaran?.nominal || "",
                    pic: null,
                    fotoExisting: selectedPengeluaran?.foto || "",
                  }
                : initialValuesTambah
            }
            validationSchema={validationSchemaTambah}
            onSubmit={
              selectedPengeluaran
                ? submitEditPengeluaran
                : submitTambahPengeluaran
            }
            enableReinitialize
            validateOnBlur={true}
            validateOnChange={true}
          >
            {(formik) => (
              <Box
                as="form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const keys = Object.keys(initialValuesTambah);
                  const touched = {};
                  keys.forEach((k) => {
                    touched[k] = true;
                  });
                  formik.setTouched(touched);
                  formik.handleSubmit(e);
                }}
                display="flex"
                flexDirection="column"
                flex="1"
                minH={0}
                overflow="hidden"
                w="full"
              >
                <ModalHeader></ModalHeader>
                <ModalCloseButton
                  onClick={() => handleCloseModal(formik.resetForm)}
                />
                <ModalBody
                  overflowY="auto"
                  flex="1"
                  minH={0}
                  px={{ base: 4, md: 6 }}
                  py={{ base: 4, md: 6 }}
                >
                  <Box>
                    <HStack mb={{ base: 4, md: 6 }} spacing={3}>
                      <Box
                        bgColor={"aset"}
                        width={"4px"}
                        height={"30px"}
                        borderRadius="2px"
                      ></Box>
                      <Heading size={{ base: "md", md: "lg" }} color={"aset"}>
                        {selectedPengeluaran
                          ? "Edit Pengeluaran"
                          : "Tambah Pengeluaran"}
                      </Heading>
                    </HStack>

                    <SimpleGrid
                      columns={{ base: 1, md: 2 }}
                      spacing={{ base: 4, md: 6 }}
                      p={{ base: 0, md: "10px" }}
                    >
                      <FormControl
                        isInvalid={
                          formik.touched.tanggal && formik.errors.tanggal
                        }
                      >
                        <FormLabel fontSize={"16px"} fontWeight="medium">
                          Tanggal
                        </FormLabel>
                        <Input
                          bgColor={"terang"}
                          height={"50px"}
                          type="date"
                          name="tanggal"
                          value={formik.values.tanggal}
                          onChange={(e) =>
                            formik.setFieldValue("tanggal", e.target.value)
                          }
                          onBlur={() => formik.setFieldTouched("tanggal", true)}
                        />
                        <FormErrorMessage>
                          {formik.errors.tanggal}
                        </FormErrorMessage>
                      </FormControl>
                      <FormControl
                        isInvalid={
                          formik.touched.jatuhTempo && formik.errors.jatuhTempo
                        }
                      >
                        <FormLabel fontSize={"16px"} fontWeight="medium">
                          Jatuh Tempo{" "}
                          <Text as="span" fontWeight="normal" color="gray.500">
                            (opsional)
                          </Text>
                        </FormLabel>
                        <Input
                          bgColor={"terang"}
                          height={"50px"}
                          type="date"
                          name="jatuhTempo"
                          value={formik.values.jatuhTempo}
                          onChange={(e) =>
                            formik.setFieldValue("jatuhTempo", e.target.value)
                          }
                          onBlur={() =>
                            formik.setFieldTouched("jatuhTempo", true)
                          }
                        />
                        <FormErrorMessage>
                          {formik.errors.jatuhTempo}
                        </FormErrorMessage>
                      </FormControl>
                      <FormControl
                        isInvalid={
                          formik.touched.nominal && formik.errors.nominal
                        }
                      >
                        <FormLabel fontSize={"16px"} fontWeight="medium">
                          Nominal
                        </FormLabel>
                        <Input
                          bgColor={"terang"}
                          height={"50px"}
                          type="text"
                          inputMode="numeric"
                          name="nominal"
                          placeholder="Contoh: Rp 250.000"
                          value={
                            formik.values.nominal !== "" &&
                            formik.values.nominal != null
                              ? formatRupiah(formik.values.nominal)
                              : ""
                          }
                          onChange={(e) => {
                            const parsed = parseRupiah(e.target.value);
                            formik.setFieldValue(
                              "nominal",
                              e.target.value.replace(/[^0-9]/g, "") === ""
                                ? ""
                                : parsed,
                            );
                          }}
                          onBlur={() => formik.setFieldTouched("nominal", true)}
                        />
                        <FormErrorMessage>
                          {formik.errors.nominal}
                        </FormErrorMessage>
                      </FormControl>
                      <FormControl
                        isInvalid={
                          formik.touched.deskripsi && formik.errors.deskripsi
                        }
                      >
                        <FormLabel fontSize={"16px"} fontWeight="medium">
                          Deskripsi
                        </FormLabel>
                        <Textarea
                          bgColor={"terang"}
                          name="deskripsi"
                          placeholder="Tulis deskripsi pengeluaran"
                          value={formik.values.deskripsi}
                          onChange={(e) =>
                            formik.setFieldValue("deskripsi", e.target.value)
                          }
                          onBlur={() =>
                            formik.setFieldTouched("deskripsi", true)
                          }
                        />
                        <FormErrorMessage>
                          {formik.errors.deskripsi}
                        </FormErrorMessage>
                      </FormControl>
                      <FormControl
                        isInvalid={
                          formik.touched.indukUnitKerjaId &&
                          formik.errors.indukUnitKerjaId
                        }
                      >
                        <FormLabel fontSize={"16px"} fontWeight="medium">
                          Unit Usaha
                        </FormLabel>
                        <AsyncSelect
                          loadOptions={loadIndukUnitKerjaOptions}
                          placeholder="Ketik Nama Unit Usaha"
                          value={
                            formik.values.indukUnitKerjaId
                              ? {
                                  value: formik.values.indukUnitKerjaId,
                                  label:
                                    formik.values.indukUnitKerjaLabel ||
                                    "Unit Usaha",
                                }
                              : null
                          }
                          onChange={(selectedOption) => {
                            formik.setFieldValue(
                              "indukUnitKerjaId",
                              selectedOption?.value ?? null,
                            );
                            formik.setFieldValue(
                              "indukUnitKerjaLabel",
                              selectedOption?.label ?? "",
                            );
                          }}
                          onBlur={() =>
                            formik.setFieldTouched("indukUnitKerjaId", true)
                          }
                          components={{
                            DropdownIndicator: () => null,
                            IndicatorSeparator: () => null,
                          }}
                          chakraStyles={{
                            container: (provided) => ({
                              ...provided,
                              borderRadius: "6px",
                            }),
                            control: (provided) => ({
                              ...provided,
                              backgroundColor: "terang",
                              border: "0px",
                              height: "60px",
                              _hover: { borderColor: "yellow.700" },
                              minHeight: "40px",
                            }),
                            option: (provided, state) => ({
                              ...provided,
                              bg: state.isFocused ? "aset" : "white",
                              color: state.isFocused ? "white" : "black",
                            }),
                          }}
                        />
                        <FormErrorMessage>
                          {formik.errors.indukUnitKerjaId}
                        </FormErrorMessage>
                      </FormControl>
                      <FormControl
                        isInvalid={
                          formik.touched.unitKerjaId &&
                          formik.errors.unitKerjaId
                        }
                      >
                        <FormLabel fontSize={"16px"} fontWeight="medium">
                          Proyek
                        </FormLabel>
                        <AsyncSelect
                          loadOptions={async (inputValue) => {
                            if (!inputValue) return [];
                            try {
                              const res = await axios.get(
                                `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/admin/search/unit-kerja?q=${inputValue}`,
                              );
                              return (res.data.result || []).map((val) => ({
                                value: val.id,
                                label: val.unitKerja,
                              }));
                            } catch (err) {
                              console.error(
                                "Failed to load options:",
                                err.message,
                              );
                              return [];
                            }
                          }}
                          placeholder="Ketik Nama Proyek"
                          value={
                            formik.values.unitKerjaId
                              ? {
                                  value: formik.values.unitKerjaId,
                                  label:
                                    formik.values.unitKerjaLabel || "Proyek",
                                }
                              : null
                          }
                          onChange={(selectedOption) => {
                            formik.setFieldValue(
                              "unitKerjaId",
                              selectedOption?.value ?? null,
                            );
                            formik.setFieldValue(
                              "unitKerjaLabel",
                              selectedOption?.label ?? "",
                            );
                          }}
                          onBlur={() =>
                            formik.setFieldTouched("unitKerjaId", true)
                          }
                          components={{
                            DropdownIndicator: () => null,
                            IndicatorSeparator: () => null,
                          }}
                          chakraStyles={{
                            container: (provided) => ({
                              ...provided,
                              borderRadius: "6px",
                            }),
                            control: (provided) => ({
                              ...provided,
                              backgroundColor: "terang",
                              border: "0px",
                              height: "60px",
                              _hover: { borderColor: "yellow.700" },
                              minHeight: "40px",
                            }),
                            option: (provided, state) => ({
                              ...provided,
                              bg: state.isFocused ? "aset" : "white",
                              color: state.isFocused ? "white" : "black",
                            }),
                          }}
                        />
                        <FormErrorMessage>
                          {formik.errors.unitKerjaId}
                        </FormErrorMessage>
                      </FormControl>
                      <FormControl
                        isInvalid={
                          formik.touched.pegawaiId && formik.errors.pegawaiId
                        }
                      >
                        <FormLabel fontSize={"16px"} fontWeight="medium">
                          Pegawai{" "}
                          <Text as="span" fontWeight="normal" color="gray.500">
                            (opsional)
                          </Text>
                        </FormLabel>
                        <AsyncSelect
                          isClearable
                          loadOptions={async (inputValue) => {
                            if (!inputValue) return [];
                            try {
                              const res = await axios.get(
                                `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/pegawai/search?q=${inputValue}`,
                              );
                              return (res.data.result || []).map((val) => ({
                                value: val.id,
                                label:
                                  val.nama || val.name || `Pegawai #${val.id}`,
                              }));
                            } catch (err) {
                              console.error(
                                "Failed to load options:",
                                err.message,
                              );
                              return [];
                            }
                          }}
                          placeholder="Ketik Nama Pegawai"
                          value={
                            formik.values.pegawaiId
                              ? {
                                  value: formik.values.pegawaiId,
                                  label:
                                    formik.values.pegawaiLabel || "Pegawai",
                                }
                              : null
                          }
                          onChange={(selectedOption) => {
                            formik.setFieldValue(
                              "pegawaiId",
                              selectedOption?.value ?? null,
                            );
                            formik.setFieldValue(
                              "pegawaiLabel",
                              selectedOption?.label ?? "",
                            );
                          }}
                          onBlur={() =>
                            formik.setFieldTouched("pegawaiId", true)
                          }
                          components={{
                            DropdownIndicator: () => null,
                            IndicatorSeparator: () => null,
                          }}
                          chakraStyles={{
                            container: (provided) => ({
                              ...provided,
                              borderRadius: "6px",
                            }),
                            control: (provided) => ({
                              ...provided,
                              backgroundColor: "terang",
                              border: "0px",
                              height: "60px",
                              _hover: { borderColor: "yellow.700" },
                              minHeight: "40px",
                            }),
                            option: (provided, state) => ({
                              ...provided,
                              bg: state.isFocused ? "aset" : "white",
                              color: state.isFocused ? "white" : "black",
                            }),
                          }}
                        />
                        <FormErrorMessage>
                          {formik.errors.pegawaiId}
                        </FormErrorMessage>
                      </FormControl>
                      <FormControl
                        isInvalid={
                          formik.touched.metodePembayaranId &&
                          formik.errors.metodePembayaranId
                        }
                      >
                        <FormLabel fontSize={"16px"} fontWeight="medium">
                          Metode Pembayaran
                        </FormLabel>
                        <Select2
                          options={(dataSeed?.resultMetodePembayaran || []).map(
                            (val) => ({
                              value: val.id,
                              label:
                                val.nama || val.metode || `Metode #${val.id}`,
                            }),
                          )}
                          placeholder="Pilih Metode Pembayaran"
                          value={
                            formik.values.metodePembayaranId
                              ? {
                                  value: formik.values.metodePembayaranId,
                                  label:
                                    (
                                      dataSeed?.resultMetodePembayaran || []
                                    ).find(
                                      (v) =>
                                        v.id ===
                                        formik.values.metodePembayaranId,
                                    )?.nama ||
                                    (
                                      dataSeed?.resultMetodePembayaran || []
                                    ).find(
                                      (v) =>
                                        v.id ===
                                        formik.values.metodePembayaranId,
                                    )?.metode ||
                                    "Metode Pembayaran",
                                }
                              : null
                          }
                          onChange={(selectedOption) =>
                            formik.setFieldValue(
                              "metodePembayaranId",
                              selectedOption?.value ?? null,
                            )
                          }
                          onBlur={() =>
                            formik.setFieldTouched("metodePembayaranId", true)
                          }
                          components={{
                            DropdownIndicator: () => null,
                            IndicatorSeparator: () => null,
                          }}
                          chakraStyles={{
                            container: (provided) => ({
                              ...provided,
                              borderRadius: "6px",
                            }),
                            control: (provided) => ({
                              ...provided,
                              backgroundColor: "terang",
                              border: "0px",
                              height: "60px",
                              _hover: { borderColor: "yellow.700" },
                              minHeight: "40px",
                            }),
                            option: (provided, state) => ({
                              ...provided,
                              bg: state.isFocused ? "aset" : "white",
                              color: state.isFocused ? "white" : "black",
                            }),
                          }}
                        />
                        <FormErrorMessage>
                          {formik.errors.metodePembayaranId}
                        </FormErrorMessage>
                      </FormControl>
                      <FormControl
                        isInvalid={
                          formik.touched.jenisPengeluaranId &&
                          formik.errors.jenisPengeluaranId
                        }
                      >
                        <FormLabel fontSize={"16px"} fontWeight="medium">
                          Jenis Pengeluaran
                        </FormLabel>
                        <Select2
                          options={(dataSeed?.reslutJenisPengeluaran || []).map(
                            (val) => ({
                              value: val.id,
                              label:
                                val.nama || val.jenis || `Jenis #${val.id}`,
                            }),
                          )}
                          placeholder="Pilih Jenis Pengeluaran"
                          value={
                            formik.values.jenisPengeluaranId
                              ? {
                                  value: formik.values.jenisPengeluaranId,
                                  label:
                                    (
                                      dataSeed?.reslutJenisPengeluaran || []
                                    ).find(
                                      (v) =>
                                        v.id ===
                                        formik.values.jenisPengeluaranId,
                                    )?.nama ||
                                    (
                                      dataSeed?.reslutJenisPengeluaran || []
                                    ).find(
                                      (v) =>
                                        v.id ===
                                        formik.values.jenisPengeluaranId,
                                    )?.jenis ||
                                    "Jenis Pengeluaran",
                                }
                              : null
                          }
                          onChange={(selectedOption) =>
                            formik.setFieldValue(
                              "jenisPengeluaranId",
                              selectedOption?.value ?? null,
                            )
                          }
                          onBlur={() =>
                            formik.setFieldTouched("jenisPengeluaranId", true)
                          }
                          components={{
                            DropdownIndicator: () => null,
                            IndicatorSeparator: () => null,
                          }}
                          chakraStyles={{
                            container: (provided) => ({
                              ...provided,
                              borderRadius: "6px",
                            }),
                            control: (provided) => ({
                              ...provided,
                              backgroundColor: "terang",
                              border: "0px",
                              height: "60px",
                              _hover: { borderColor: "yellow.700" },
                              minHeight: "40px",
                            }),
                            option: (provided, state) => ({
                              ...provided,
                              bg: state.isFocused ? "aset" : "white",
                              color: state.isFocused ? "white" : "black",
                            }),
                          }}
                        />
                        <FormErrorMessage>
                          {formik.errors.jenisPengeluaranId}
                        </FormErrorMessage>
                      </FormControl>
                      <FormControl
                        isInvalid={
                          formik.touched.statusPembayaranId &&
                          formik.errors.statusPembayaranId
                        }
                      >
                        <FormLabel fontSize={"16px"} fontWeight="medium">
                          Status Pembayaran
                        </FormLabel>
                        <Select2
                          options={(dataSeed?.resultStatusPembayaran || []).map(
                            (val) => ({
                              value: val.id,
                              label:
                                val.nama || val.status || `Status #${val.id}`,
                            }),
                          )}
                          placeholder="Pilih Status Pembayaran"
                          value={
                            formik.values.statusPembayaranId
                              ? {
                                  value: formik.values.statusPembayaranId,
                                  label:
                                    (
                                      dataSeed?.resultStatusPembayaran || []
                                    ).find(
                                      (v) =>
                                        v.id ===
                                        formik.values.statusPembayaranId,
                                    )?.nama ||
                                    (
                                      dataSeed?.resultStatusPembayaran || []
                                    ).find(
                                      (v) =>
                                        v.id ===
                                        formik.values.statusPembayaranId,
                                    )?.status ||
                                    "Status Pembayaran",
                                }
                              : null
                          }
                          onChange={(selectedOption) =>
                            formik.setFieldValue(
                              "statusPembayaranId",
                              selectedOption?.value ?? null,
                            )
                          }
                          onBlur={() =>
                            formik.setFieldTouched("statusPembayaranId", true)
                          }
                          components={{
                            DropdownIndicator: () => null,
                            IndicatorSeparator: () => null,
                          }}
                          chakraStyles={{
                            container: (provided) => ({
                              ...provided,
                              borderRadius: "6px",
                            }),
                            control: (provided) => ({
                              ...provided,
                              backgroundColor: "terang",
                              border: "0px",
                              height: "60px",
                              _hover: { borderColor: "yellow.700" },
                              minHeight: "40px",
                            }),
                            option: (provided, state) => ({
                              ...provided,
                              bg: state.isFocused ? "aset" : "white",
                              color: state.isFocused ? "white" : "black",
                            }),
                          }}
                        />
                        <FormErrorMessage>
                          {formik.errors.statusPembayaranId}
                        </FormErrorMessage>
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize={"16px"} fontWeight="medium">
                          Foto (opsional)
                        </FormLabel>
                        <Flex gap={4} align="center" flexWrap="wrap">
                          <Box>
                            <Image
                              src={
                                formik.values.pic
                                  ? URL.createObjectURL(formik.values.pic)
                                  : formik.values.fotoExisting
                                    ? `${import.meta.env.VITE_REACT_APP_API_BASE_URL}${formik.values.fotoExisting}`
                                    : Foto
                              }
                              alt="preview"
                              boxSize="90px"
                              objectFit="cover"
                              borderRadius="8px"
                              border="1px solid"
                              borderColor="gray.200"
                            />
                          </Box>
                          <Box>
                            <Input
                              type="file"
                              accept="image/*"
                              bgColor={"terang"}
                              height={"50px"}
                              p={2}
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                formik.setFieldValue("pic", file);
                              }}
                            />
                            {formik.values.pic && (
                              <Button
                                mt={2}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                type="button"
                                onClick={() =>
                                  formik.setFieldValue("pic", null)
                                }
                              >
                                Hapus Foto
                              </Button>
                            )}
                          </Box>
                        </Flex>
                      </FormControl>{" "}
                      <FormControl
                        isInvalid={
                          formik.touched.rekananId && formik.errors.rekananId
                        }
                      >
                        <FormLabel fontSize={"16px"} fontWeight="medium">
                          Rekanan{" "}
                          <Text as="span" fontWeight="normal" color="gray.500">
                            (opsional)
                          </Text>
                        </FormLabel>
                        <AsyncSelect
                          isClearable
                          loadOptions={async (inputValue) => {
                            if (!inputValue) return [];
                            try {
                              const res = await axios.get(
                                `${
                                  import.meta.env.VITE_REACT_APP_API_BASE_URL
                                }/barjas/get/rekanan/search?q=${inputValue}`,
                              );

                              const filtered = res.data.result;

                              return filtered.map((val) => ({
                                value: val.id,
                                label: val.nama,
                              }));
                            } catch (err) {
                              console.error(
                                "Failed to load options:",
                                err.message,
                              );
                              return [];
                            }
                          }}
                          placeholder="Ketik Nama Rekanan"
                          value={
                            formik.values.rekananId
                              ? {
                                  value: formik.values.rekananId,
                                  label:
                                    formik.values.rekananLabel || "Rekanan",
                                }
                              : null
                          }
                          onChange={(selectedOption) => {
                            formik.setFieldValue(
                              "rekananId",
                              selectedOption?.value ?? null,
                            );
                            formik.setFieldValue(
                              "rekananLabel",
                              selectedOption?.label ?? "",
                            );
                          }}
                          onBlur={() =>
                            formik.setFieldTouched("rekananId", true)
                          }
                          components={{
                            DropdownIndicator: () => null,
                            IndicatorSeparator: () => null,
                          }}
                          chakraStyles={{
                            container: (provided) => ({
                              ...provided,
                              borderRadius: "6px",
                            }),
                            control: (provided) => ({
                              ...provided,
                              backgroundColor: "terang",
                              border: "0px",
                              height: "60px",
                              _hover: { borderColor: "yellow.700" },
                              minHeight: "40px",
                            }),
                            option: (provided, state) => ({
                              ...provided,
                              bg: state.isFocused ? "aset" : "white",
                              color: state.isFocused ? "white" : "black",
                            }),
                          }}
                        />
                        <FormErrorMessage>
                          {formik.errors.rekananId}
                        </FormErrorMessage>
                        <Button
                          mt={4}
                          size="sm"
                          variant="outline"
                          colorScheme="blue"
                          type="button"
                          onClick={() =>
                            formik.setFieldValue(
                              "isTambahRekananBaru",
                              !formik.values.isTambahRekananBaru,
                            )
                          }
                        >
                          {formik.values.isTambahRekananBaru
                            ? "Batalkan"
                            : "Tambah Rekanan"}
                        </Button>
                        {formik.values.isTambahRekananBaru && (
                          <>
                            <Flex>
                              <Input
                                height={"50px"}
                                bgColor={"terang"}
                                me={"10px"}
                                placeholder="Nama Rekanan Baru"
                                name="namaRekananBaru"
                                value={formik.values.namaRekananBaru}
                                onChange={(e) =>
                                  formik.setFieldValue(
                                    "namaRekananBaru",
                                    e.target.value,
                                  )
                                }
                              />{" "}
                              <Button
                                type="button"
                                variant="outline"
                                colorScheme="blue"
                                height={"50px"}
                                onClick={() =>
                                  tambahRekanan(
                                    formik.values.namaRekananBaru,
                                    formik.setFieldValue,
                                  )
                                }
                              >
                                +
                              </Button>
                            </Flex>
                          </>
                        )}
                      </FormControl>
                    </SimpleGrid>
                  </Box>
                </ModalBody>

                <ModalFooter
                  pe={{ base: "16px", md: "30px" }}
                  pb={{ base: "16px", md: "30px" }}
                  pt={{ base: "12px", md: "20px" }}
                  flexDirection={{ base: "column", md: "row" }}
                  gap={3}
                  flexShrink={0}
                  borderTop="1px solid"
                  borderColor="gray.200"
                >
                  <Button
                    type="button"
                    onClick={() => handleCloseModal(formik.resetForm)}
                    variant="ghost"
                    colorScheme="gray"
                    w={{ base: "full", md: "auto" }}
                    order={{ base: 2, md: 1 }}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    variant={"primary"}
                    size="md"
                    isLoading={formik.isSubmitting}
                    w={{ base: "full", md: "auto" }}
                    order={{ base: 1, md: 2 }}
                  >
                    {selectedPengeluaran
                      ? "Update Pengeluaran"
                      : "Simpan Pengeluaran"}
                  </Button>
                </ModalFooter>
              </Box>
            )}
          </Formik>
        </ModalContent>
      </Modal>
    </>
  );
}

export default DaftarPengeluaran;
