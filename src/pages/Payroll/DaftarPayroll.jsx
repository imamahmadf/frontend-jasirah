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
  SimpleGrid,
  Spacer,
  Spinner,
  useColorMode,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  Divider,
  Badge,
  Tooltip,
  useMediaQuery,
  VStack,
  Stack,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  useToast,
} from "@chakra-ui/react";
import { BsCaretRightFill } from "react-icons/bs";
import { BsCaretLeftFill } from "react-icons/bs";
import { BsEyeFill } from "react-icons/bs";
import { BsDownload } from "react-icons/bs";
import { BsFileEarmarkExcel } from "react-icons/bs";
import { BsPersonPlusFill } from "react-icons/bs";
import { BsTrashFill } from "react-icons/bs";
import { BsPeopleFill } from "react-icons/bs";
import { useDisclosure } from "@chakra-ui/react";
import ReactPaginate from "react-paginate";
import "../../Style/pagination.css";
import { Link, useHistory } from "react-router-dom";
import Loading from "../../Componets/Loading";
import { Select as Select2 } from "chakra-react-select";
import axios from "axios";
import Layout from "../../Componets/Layout";
import { useSelector } from "react-redux";
import { userRedux, selectRole } from "../../Redux/Reducers/auth";
import LayoutPegawai from "../../Componets/Pegawai/LayoutPegawai";
import {
  getSelect2Styles,
  getSelect2Components,
  getSelect2FocusColor,
} from "../../Style/Components/select2Styles";

function DaftarPayroll() {
  const [dataPegawai, setDataPegawai] = useState([]);
  const history = useHistory();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);
  const [keyword, setKeyword] = useState("");
  const [alfabet, setAlfabet] = useState("");
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);
  const [dataSeed, setDataSeed] = useState([]);
  const [time, setTime] = useState("");
  const [pangkatId, setPangkatId] = useState(0);
  const [golonganId, setGolonganId] = useState(0);
  const [tingkatanId, setTingkatanId] = useState(0);
  const [statusPegawaiId, setStatusPegawaiId] = useState(0);
  const [profesiId, setProfesiId] = useState(0);
  const [nama, setNama] = useState("");
  const [pendidikan, setPendidikan] = useState("");
  const [nip, setNip] = useState("");
  const [nik, setNik] = useState("");
  const [unitKerjaId, setUnitKerjaId] = useState(0);
  const [jabatan, setJabatan] = useState("");
  const [filterUnitKerjaId, setFilterUnitKerjaId] = useState(null);
  const [filterStatusPegawaiId, setFilterStatusPegawaiId] = useState(null);
  const [filterProfesiId, setFilterProfesiId] = useState(null);
  const [filtergolonganId, setFilterGolonganId] = useState(null);
  const [filtertingkatanId, setFilterTingkatanId] = useState(null);
  const [filterPangkatId, setFilterPangkatId] = useState(null);
  const token = localStorage.getItem("token");
  const [filterPendidikan, setFilterPendidikan] = useState("");
  const [filterNip, setFilterNip] = useState("");
  const [filterJabatan, setFilterJabatan] = useState("");
  const [tanggalTMT, setTanggalTMT] = useState("");
  const {
    isOpen: isTambahOpen,
    onOpen: onTambahOpen,
    onClose: onTambahClose,
  } = useDisclosure();
  const {
    isOpen: isSlipGajiOpen,
    onOpen: onSlipGajiOpen,
    onClose: onSlipGajiClose,
  } = useDisclosure();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPegawaiIds, setSelectedPegawaiIds] = useState([]);
  const getDefaultDateRange = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const monthStr = String(month).padStart(2, "0");
    const lastDay = new Date(year, month, 0).getDate();
    return {
      tanggalAwal: `${year}-${monthStr}-01`,
      tanggalAkhir: `${year}-${monthStr}-${String(lastDay).padStart(2, "0")}`,
    };
  };
  const [tanggalAwal, setTanggalAwal] = useState(
    () => getDefaultDateRange().tanggalAwal,
  );
  const [tanggalAkhir, setTanggalAkhir] = useState(
    () => getDefaultDateRange().tanggalAkhir,
  );
  const [tanggalAwalSlip, setTanggalAwalSlip] = useState(
    () => getDefaultDateRange().tanggalAwal,
  );
  const [tanggalAkhirSlip, setTanggalAkhirSlip] = useState(
    () => getDefaultDateRange().tanggalAkhir,
  );
  const [isSubmittingSlip, setIsSubmittingSlip] = useState(false);
  const toast = useToast();
  const user = useSelector(userRedux);
  const { colorMode, toggleColorMode } = useColorMode();
  const [isMobile] = useMediaQuery("(max-width: 768px)");

  // Helper function untuk mendapatkan value object dari Select2
  const getSelectValue = (id, options) => {
    if (!id || !options || !Array.isArray(options)) return null;
    const found = options.find((val) => val.id === id);
    if (!found) return null;
    return {
      value: found.id,
      label:
        found.label ||
        found.pangkat ||
        found.golongan ||
        found.tingkatan ||
        found.unitKerja ||
        found.status ||
        found.nama,
    };
  };

  const getPayrollBadge = (payrolls) => {
    if (!payrolls?.length) {
      return { label: "Belum ada payroll", colorScheme: "orange" };
    }
    return {
      label: `${payrolls.length} payroll`,
      colorScheme: "green",
    };
  };

  const togglePegawaiSelect = (id) => {
    setSelectedPegawaiIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const pagePegawaiIds =
    dataPegawai?.result?.map((p) => p.id).filter(Boolean) || [];

  const isAllPageSelected =
    pagePegawaiIds.length > 0 &&
    pagePegawaiIds.every((id) => selectedPegawaiIds.includes(id));

  const toggleSelectAllPage = () => {
    if (isAllPageSelected) {
      setSelectedPegawaiIds((prev) =>
        prev.filter((id) => !pagePegawaiIds.includes(id)),
      );
    } else {
      setSelectedPegawaiIds((prev) => [
        ...new Set([...prev, ...pagePegawaiIds]),
      ]);
    }
  };

  const resetTambahModal = () => {
    const range = getDefaultDateRange();
    setTanggalAwal(range.tanggalAwal);
    setTanggalAkhir(range.tanggalAkhir);
    setSelectedPegawaiIds([]);
  };

  const handleOpenTambah = () => {
    if (selectedPegawaiIds.length === 0) {
      toast({
        title: "Pilih pegawai",
        description: "Centang minimal 1 pegawai terlebih dahulu",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    onTambahOpen();
  };

  const handleSubmitPayroll = async () => {
    if (selectedPegawaiIds.length === 0) {
      toast({
        title: "Gagal",
        description: "Minimal pilih 1 pegawai",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    if (!tanggalAwal || !tanggalAkhir) {
      toast({
        title: "Gagal",
        description: "Tanggal awal dan tanggal akhir wajib diisi",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    if (tanggalAwal > tanggalAkhir) {
      toast({
        title: "Gagal",
        description: "Tanggal awal tidak boleh lebih besar dari tanggal akhir",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/payroll/post/payroll`,
        {
          pegawaiId: selectedPegawaiIds,
          tanggalAwal,
          tanggalAkhir,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast({
        title: "Berhasil",
        description: `Payroll ${tanggalAwal} s/d ${tanggalAkhir} berhasil dibuat untuk ${selectedPegawaiIds.length} pegawai`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      resetTambahModal();
      onTambahClose();
      setIsLoadingData(true);
      await fetchDataPegawai();
    } catch (err) {
      console.error(err);
      toast({
        title: "Gagal",
        description:
          err?.response?.data?.message || "Terjadi kesalahan saat membuat payroll",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setIsSubmitting(false);
      setIsLoadingData(false);
    }
  };

  const resetSlipGajiModal = () => {
    const range = getDefaultDateRange();
    setTanggalAwalSlip(range.tanggalAwal);
    setTanggalAkhirSlip(range.tanggalAkhir);
  };

  const handleOpenSlipGaji = () => {
    if (selectedPegawaiIds.length === 0) {
      toast({
        title: "Pilih pegawai",
        description: "Centang minimal 1 pegawai terlebih dahulu",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    const range = getDefaultDateRange();
    setTanggalAwalSlip(range.tanggalAwal);
    setTanggalAkhirSlip(range.tanggalAkhir);
    onSlipGajiOpen();
  };

  const handleSubmitSlipGaji = async () => {
    if (selectedPegawaiIds.length === 0) {
      toast({
        title: "Gagal",
        description: "Minimal pilih 1 pegawai",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    if (!tanggalAwalSlip || !tanggalAkhirSlip) {
      toast({
        title: "Gagal",
        description: "Tanggal awal dan tanggal akhir wajib diisi",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    if (tanggalAwalSlip > tanggalAkhirSlip) {
      toast({
        title: "Gagal",
        description: "Tanggal awal tidak boleh lebih besar dari tanggal akhir",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setIsSubmittingSlip(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/payroll/post/slip-gaji`,
        {
          pegawaiId: selectedPegawaiIds,
          tanggalAwal: tanggalAwalSlip,
          tanggalAkhir: tanggalAkhirSlip,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        },
      );

      const contentType = res.headers["content-type"] || "";
      if (contentType.includes("application/json")) {
        const text = await res.data.text();
        const json = JSON.parse(text);
        throw new Error(json.message || "Gagal generate slip gaji");
      }

      const disposition = res.headers["content-disposition"] || "";
      const filenameMatch = disposition.match(/filename="?([^";\n]+)"?/i);
      const filename = filenameMatch?.[1]?.trim() || "slip-gaji.docx";

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Berhasil",
        description: `File slip gaji berhasil diunduh (${selectedPegawaiIds.length} pegawai)`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      resetSlipGajiModal();
      onSlipGajiClose();
    } catch (err) {
      console.error(err);
      let errorMessage =
        err?.message || "Terjadi kesalahan saat generate slip gaji";
      const data = err?.response?.data;
      if (data instanceof Blob) {
        try {
          const text = await data.text();
          const json = JSON.parse(text);
          errorMessage = json.message || errorMessage;
        } catch {
          // tetap pakai pesan default
        }
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      toast({
        title: "Gagal",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setIsSubmittingSlip(false);
    }
  };

  function inputHandler(event, field) {
    const tes = setTimeout(() => {
      const { value } = event.target;

      setKeyword(value);
    }, 2000);
  }
  async function fetchSeed() {
    axios
      .get(`${import.meta.env.VITE_REACT_APP_API_BASE_URL}/pegawai/get/seed`)
      .then((res) => {
        setDataSeed(res.data);
        console.log(res.data, "DATASEEED");
      })
      .catch((err) => {
        console.error(err);
      });
  }

  async function fetchDataPegawai() {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/payroll/get?search_query=${keyword}&alfabet=${alfabet}&time=${time}&page=${page}&limit=${limit}&unitKerjaId=${
          filterUnitKerjaId || 0
        }&statusPegawaiId=${filterStatusPegawaiId || 0}&profesiId=${
          filterProfesiId || 0
        }&filterNip=${filterNip}&filterJabatan=${filterJabatan}&filterPendidikan=${filterPendidikan}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      console.log(res.status, res.data, "tessss");
      setPage(res.data.page);
      setPages(res.data.totalPage);
      setRows(res.data.totalRows);
      setDataPegawai(res.data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const changePage = ({ selected }) => {
    setPage(selected);
  };
  const resetFilter = () => {
    setPage(0);
    setKeyword("");
    setFilterUnitKerjaId(null);
    setFilterStatusPegawaiId(null);
    setFilterProfesiId(null);
    setFilterGolonganId(null);
    setFilterPangkatId(null);
    setFilterTingkatanId(null);
    setFilterJabatan("");
    setFilterPendidikan("");
    setFilterNip("");

    const inputFields = document.querySelectorAll(
      'input[type="text"], input[type="name"]',
    );
    inputFields.forEach((input) => {
      input.value = "";
    });
  };
  const handleSubmitFilterChange = (field, val) => {
    const tes = setTimeout(() => {
      if (field == "nip") {
        setFilterNip(val);
      } else if (field == "jabatan") {
        setFilterJabatan(val);
      } else if (field == "pendidikan") {
        setFilterPendidikan(val);
      }
    }, 2000);
  };

  const handleSubmitChange = (field, val) => {
    console.log(field, val);
    if (field == "nama") {
      setNama(val);
    } else if (field == "nip") {
      setNip(val);
    } else if (field == "jabatan") {
      setJabatan(val);
    } else if (field == "pendidikan") {
      setPendidikan(val);
    } else if (field == "nik") {
      setNik(val);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchDataPegawai(), fetchSeed()]);
    };
    fetchData();
  }, [
    page,
    keyword,
    filterUnitKerjaId,
    filterStatusPegawaiId,
    filterProfesiId,
    filterJabatan,
    filterPendidikan,
    filterNip,
  ]);

  // Komponen Card untuk Mobile View
  const PegawaiCard = ({ item, index }) => (
    <Card
      key={item.id || index}
      mb={4}
      bg={colorMode === "dark" ? "gray.800" : "white"}
      border="1px solid"
      borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
      borderRadius="12px"
      boxShadow="sm"
      _hover={{
        boxShadow: "md",
        transform: "translateY(-2px)",
        transition: "all 0.2s",
      }}
    >
      <CardHeader
        pb={3}
        borderBottom="1px solid"
        borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
      >
        <Flex justify="space-between" align="center">
          <HStack spacing={3}>
            <Checkbox
              colorScheme="pegawai"
              isChecked={selectedPegawaiIds.includes(item.id)}
              onChange={() => togglePegawaiSelect(item.id)}
            />
            <VStack align="start" spacing={1}>
            <Text
              fontSize="lg"
              fontWeight="bold"
              color={colorMode === "dark" ? "white" : "gray.800"}
            >
              {item.nama}
            </Text>
            <Text
              fontSize="xs"
              color={colorMode === "dark" ? "gray.400" : "gray.500"}
            >
              No. {page * limit + index + 1}
            </Text>
            </VStack>
          </HStack>
          {item?.statusPegawai?.status && (
            <Badge
              colorScheme={
                item?.statusPegawai?.status?.toLowerCase().includes("aktif")
                  ? "green"
                  : item?.statusPegawai?.status
                        ?.toLowerCase()
                        .includes("pensiun")
                    ? "orange"
                    : "gray"
              }
              px={3}
              py={1}
              borderRadius="md"
              fontSize="xs"
            >
              {item?.statusPegawai?.status}
            </Badge>
          )}
        </Flex>
      </CardHeader>
      <CardBody>
        <VStack align="stretch" spacing={3}>
          <Box>
            <Text
              fontSize="xs"
              fontWeight="semibold"
              color={colorMode === "dark" ? "gray.400" : "gray.600"}
              mb={1}
            >
              NIP
            </Text>
            <Text
              fontSize="sm"
              color={colorMode === "dark" ? "gray.300" : "gray.700"}
            >
              {item.nip || "-"}
            </Text>
          </Box>

          <SimpleGrid columns={2} spacing={3}>
            <Box>
              <Text
                fontSize="xs"
                fontWeight="semibold"
                color={colorMode === "dark" ? "gray.400" : "gray.600"}
                mb={1}
              >
                NIK
              </Text>
              <Text
                fontSize="sm"
                color={colorMode === "dark" ? "gray.300" : "gray.700"}
              >
                {item.nik || "-"}
              </Text>
            </Box>
            <Box>
              <Text
                fontSize="xs"
                fontWeight="semibold"
                color={colorMode === "dark" ? "gray.400" : "gray.600"}
                mb={1}
              >
                Profesi
              </Text>
              <Text
                fontSize="sm"
                color={colorMode === "dark" ? "gray.300" : "gray.700"}
              >
                {item?.profesi?.nama || "-"}
              </Text>
            </Box>
          </SimpleGrid>

          <Box>
            <Text
              fontSize="xs"
              fontWeight="semibold"
              color={colorMode === "dark" ? "gray.400" : "gray.600"}
              mb={1}
            >
              Jabatan
            </Text>
            <Text
              fontSize="sm"
              color={colorMode === "dark" ? "gray.300" : "gray.700"}
            >
              {item.jabatan || "-"}
            </Text>
          </Box>

          <Box>
            <Text
              fontSize="xs"
              fontWeight="semibold"
              color={colorMode === "dark" ? "gray.400" : "gray.600"}
              mb={1}
            >
              Payroll
            </Text>
            <Badge
              colorScheme={getPayrollBadge(item.payrolls).colorScheme}
              px={2}
              py={1}
              borderRadius="md"
              fontSize="xs"
            >
              {getPayrollBadge(item.payrolls).label}
            </Badge>
          </Box>

          <Box>
            <Text
              fontSize="xs"
              fontWeight="semibold"
              color={colorMode === "dark" ? "gray.400" : "gray.600"}
              mb={1}
            >
              Unit Kerja
            </Text>
            <Text
              fontSize="sm"
              color={colorMode === "dark" ? "gray.300" : "gray.700"}
            >
              {item?.daftarUnitKerja?.unitKerja || "-"}
            </Text>
          </Box>

          <Box>
            <Text
              fontSize="xs"
              fontWeight="semibold"
              color={colorMode === "dark" ? "gray.400" : "gray.600"}
              mb={1}
            >
              Pendidikan
            </Text>
            <Text
              fontSize="sm"
              color={colorMode === "dark" ? "gray.300" : "gray.700"}
            >
              {item.pendidikan || "-"}
            </Text>
          </Box>

          <Divider
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          />

          <Flex gap={2} justify="flex-end" wrap="wrap">
            <Tooltip label="Lihat Detail" hasArrow>
              <Button
                onClick={() =>
                  history.push(`/admin-pegawai/detail-payroll/${item.id}`)
                }
                variant={"primary"}
                size="sm"
                leftIcon={<BsEyeFill />}
                flex="1"
                minW="120px"
              >
                Detail
              </Button>
            </Tooltip>
            <Tooltip label="Hapus" hasArrow>
              <Button
                variant={"cancle"}
                size="sm"
                leftIcon={<BsTrashFill />}
                flex="1"
                minW="120px"
              >
                Hapus
              </Button>
            </Tooltip>
          </Flex>
        </VStack>
      </CardBody>
    </Card>
  );
  return (
    <LayoutPegawai>
      {isLoading ? (
        <Loading />
      ) : (
        <Box
          bg={colorMode === "dark" ? "gray.900" : "secondary.light"}
          pb={isMobile ? "20px" : "40px"}
          px={isMobile ? "15px" : "30px"}
          minH={"65vh"}
        >
          <Container
            border={"1px"}
            borderRadius={"12px"}
            borderColor={
              colorMode === "dark" ? "gray.700" : "rgba(229, 231, 235, 1)"
            }
            maxW={"2880px"}
            bg={colorMode === "dark" ? "gray.800" : "white"}
            p={isMobile ? "15px" : "30px"}
            boxShadow={colorMode === "dark" ? "lg" : "sm"}
          >
            {/* Header Section */}
            <Box mb={isMobile ? 4 : 6}>
              <Flex
                align="center"
                justify="space-between"
                mb={4}
                wrap="wrap"
                gap={4}
                direction={isMobile ? "column" : "row"}
              >
                <Box flex={1} minW={isMobile ? "100%" : "auto"}>
                  <Heading
                    size={isMobile ? "md" : "lg"}
                    color={colorMode === "dark" ? "white" : "gray.800"}
                    mb={2}
                    display="flex"
                    alignItems="center"
                    gap={3}
                    flexWrap="wrap"
                  >
                    <Icon
                      as={BsPeopleFill}
                      color="pegawai"
                      boxSize={isMobile ? 6 : 8}
                    />
                    {isMobile ? "Payroll" : "Daftar Payroll"}
                  </Heading>
                  {!isMobile && (
                    <Text
                      color={colorMode === "dark" ? "gray.400" : "gray.600"}
                      fontSize="sm"
                    >
                      Kelola data payroll pegawai
                    </Text>
                  )}
                </Box>
                <HStack spacing={2} wrap="wrap">
                  <Button
                    variant="outline"
                    leftIcon={<BsDownload />}
                    onClick={handleOpenSlipGaji}
                    size={isMobile ? "sm" : "md"}
                  >
                    {isMobile ? "Slip Gaji" : "Generate Slip Gaji"}
                    {selectedPegawaiIds.length > 0 &&
                      ` (${selectedPegawaiIds.length})`}
                  </Button>
                  <Button
                    variant="primary"
                    leftIcon={<BsPersonPlusFill />}
                    onClick={handleOpenTambah}
                    size={isMobile ? "sm" : "md"}
                  >
                    Tambah Payroll
                    {selectedPegawaiIds.length > 0 &&
                      ` (${selectedPegawaiIds.length})`}
                  </Button>
                </HStack>
              </Flex>

              <Divider
                mb={6}
                borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
              />
            </Box>

            {/* Filter Section untuk Mobile */}
            {isMobile && (
              <Box
                mb={6}
                p={4}
                borderRadius="8px"
                border="1px solid"
                borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                bg={colorMode === "dark" ? "gray.800" : "white"}
              >
                <VStack spacing={3} align="stretch">
                  <FormControl>
                    <FormLabel
                      fontSize="sm"
                      color={colorMode === "dark" ? "gray.300" : "gray.700"}
                      fontWeight="semibold"
                    >
                      Cari Nama
                    </FormLabel>
                    <Input
                      onChange={inputHandler}
                      type="text"
                      borderRadius="6px"
                      h={"40px"}
                      bg={colorMode === "dark" ? "gray.700" : "white"}
                      color={colorMode === "dark" ? "white" : "gray.800"}
                      borderColor={
                        colorMode === "dark" ? "gray.600" : "gray.200"
                      }
                      _placeholder={{
                        color: colorMode === "dark" ? "gray.400" : "gray.500",
                      }}
                      placeholder="Cari nama..."
                    />
                  </FormControl>

                  <SimpleGrid columns={2} spacing={3}>
                    <FormControl>
                      <FormLabel
                        fontSize="sm"
                        color={colorMode === "dark" ? "gray.300" : "gray.700"}
                        fontWeight="semibold"
                      >
                        NIP
                      </FormLabel>
                      <Input
                        onChange={(e) =>
                          handleSubmitFilterChange("nip", e.target.value)
                        }
                        type="text"
                        borderRadius="6px"
                        h={"40px"}
                        bg={colorMode === "dark" ? "gray.700" : "white"}
                        color={colorMode === "dark" ? "white" : "gray.800"}
                        borderColor={
                          colorMode === "dark" ? "gray.600" : "gray.200"
                        }
                        _placeholder={{
                          color: colorMode === "dark" ? "gray.400" : "gray.500",
                        }}
                        placeholder="Cari NIP..."
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel
                        fontSize="sm"
                        color={colorMode === "dark" ? "gray.300" : "gray.700"}
                        fontWeight="semibold"
                      >
                        Jabatan
                      </FormLabel>
                      <Input
                        onChange={(e) =>
                          handleSubmitFilterChange("jabatan", e.target.value)
                        }
                        type="text"
                        borderRadius="6px"
                        h={"40px"}
                        bg={colorMode === "dark" ? "gray.700" : "white"}
                        color={colorMode === "dark" ? "white" : "gray.800"}
                        borderColor={
                          colorMode === "dark" ? "gray.600" : "gray.200"
                        }
                        _placeholder={{
                          color: colorMode === "dark" ? "gray.400" : "gray.500",
                        }}
                        placeholder="Cari jabatan..."
                      />
                    </FormControl>
                  </SimpleGrid>

                  <FormControl>
                    <FormLabel
                      fontSize="sm"
                      color={colorMode === "dark" ? "gray.300" : "gray.700"}
                      fontWeight="semibold"
                    >
                      Pendidikan
                    </FormLabel>
                    <Input
                      onChange={(e) =>
                        handleSubmitFilterChange("pendidikan", e.target.value)
                      }
                      type="text"
                      borderRadius="6px"
                      h={"40px"}
                      bg={colorMode === "dark" ? "gray.700" : "white"}
                      color={colorMode === "dark" ? "white" : "gray.800"}
                      borderColor={
                        colorMode === "dark" ? "gray.600" : "gray.200"
                      }
                      _placeholder={{
                        color: colorMode === "dark" ? "gray.400" : "gray.500",
                      }}
                      placeholder="Cari pendidikan..."
                    />
                  </FormControl>

                  <SimpleGrid columns={2} spacing={3}>
                    <FormControl>
                      <FormLabel
                        fontSize="sm"
                        color={colorMode === "dark" ? "gray.300" : "gray.700"}
                        fontWeight="semibold"
                      >
                        Status
                      </FormLabel>
                      <Select2
                        options={dataSeed?.resultStatusPegawai?.map((val) => ({
                          value: val.id,
                          label: `${val.status}`,
                        }))}
                        placeholder="Pilih Status"
                        focusBorderColor={getSelect2FocusColor(colorMode)}
                        value={getSelectValue(
                          filterStatusPegawaiId,
                          dataSeed?.resultStatusPegawai?.map((val) => ({
                            id: val.id,
                            label: val.status,
                            status: val.status,
                          })),
                        )}
                        onChange={(selectedOption) => {
                          setFilterStatusPegawaiId(
                            selectedOption?.value || null,
                          );
                        }}
                        isClearable
                        components={getSelect2Components()}
                        chakraStyles={getSelect2Styles(colorMode)}
                      />
                    </FormControl>
                  </SimpleGrid>

                  <SimpleGrid columns={2} spacing={3}>
                    <FormControl>
                      <FormLabel
                        fontSize="sm"
                        color={colorMode === "dark" ? "gray.300" : "gray.700"}
                        fontWeight="semibold"
                      >
                        Unit Kerja
                      </FormLabel>
                      <Select2
                        options={dataSeed?.resultUnitKerja?.map((val) => ({
                          value: val.id,
                          label: `${val.unitKerja}`,
                        }))}
                        placeholder="Pilih Unit Kerja"
                        focusBorderColor={getSelect2FocusColor(colorMode)}
                        value={getSelectValue(
                          filterUnitKerjaId,
                          dataSeed?.resultUnitKerja?.map((val) => ({
                            id: val.id,
                            label: val.unitKerja,
                            unitKerja: val.unitKerja,
                          })),
                        )}
                        onChange={(selectedOption) => {
                          setFilterUnitKerjaId(selectedOption?.value || null);
                        }}
                        isClearable
                        components={getSelect2Components()}
                        chakraStyles={getSelect2Styles(colorMode)}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel
                        fontSize="sm"
                        color={colorMode === "dark" ? "gray.300" : "gray.700"}
                        fontWeight="semibold"
                      >
                        Profesi
                      </FormLabel>
                      <Select2
                        options={dataSeed?.resultProfesi?.map((val) => ({
                          value: val.id,
                          label: `${val.nama}`,
                        }))}
                        placeholder="Pilih Profesi"
                        focusBorderColor={getSelect2FocusColor(colorMode)}
                        value={getSelectValue(
                          filterProfesiId,
                          dataSeed?.resultProfesi?.map((val) => ({
                            id: val.id,
                            label: val.nama,
                            nama: val.nama,
                          })),
                        )}
                        onChange={(selectedOption) => {
                          setFilterProfesiId(selectedOption?.value || null);
                        }}
                        isClearable
                        components={getSelect2Components()}
                        chakraStyles={getSelect2Styles(colorMode)}
                      />
                    </FormControl>
                  </SimpleGrid>

                  <Button
                    onClick={resetFilter}
                    variant={"secondary"}
                    h={"40px"}
                    size="md"
                    width="100%"
                  >
                    Reset Filter
                  </Button>
                </VStack>
              </Box>
            )}

            {/* Desktop Table View */}
            {!isMobile && (
              <Box
                overflowX="auto"
                borderRadius="8px"
                border="1px solid"
                borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                bg={colorMode === "dark" ? "gray.800" : "white"}
              >
                <Table variant={"pegawai"} size="sm">
                  <Thead>
                    <Tr bg={colorMode === "dark" ? "pegawaiGelap" : "pegawai"}>
                      <Th color="white" fontWeight="semibold" w="40px">
                        <Checkbox
                          colorScheme="whiteAlpha"
                          isChecked={isAllPageSelected}
                          isIndeterminate={
                            selectedPegawaiIds.some((id) =>
                              pagePegawaiIds.includes(id),
                            ) && !isAllPageSelected
                          }
                          onChange={toggleSelectAllPage}
                        />
                      </Th>
                      <Th color="white" fontWeight="semibold">
                        No.
                        <Box></Box>
                      </Th>
                      <Th color="white" fontWeight="semibold">
                        Nama
                        <Box>
                          <FormControl mt={"5px"}>
                            <Input
                              onChange={inputHandler}
                              type="text"
                              borderRadius="6px"
                              h={"32px"}
                              bg={colorMode === "dark" ? "gray.700" : "white"}
                              color={
                                colorMode === "dark" ? "white" : "gray.800"
                              }
                              borderColor={
                                colorMode === "dark" ? "gray.600" : "gray.200"
                              }
                              _placeholder={{
                                color:
                                  colorMode === "dark"
                                    ? "gray.400"
                                    : "gray.500",
                              }}
                              placeholder="Cari nama..."
                            />
                          </FormControl>
                        </Box>
                      </Th>
                      <Th
                        textTransform="none"
                        color="white"
                        fontWeight="semibold"
                      >
                        NIP
                        <Box>
                          <FormControl mt={"5px"}>
                            <Input
                              onChange={(e) =>
                                handleSubmitFilterChange("nip", e.target.value)
                              }
                              type="text"
                              borderRadius="6px"
                              h={"32px"}
                              bg={colorMode === "dark" ? "gray.700" : "white"}
                              color={
                                colorMode === "dark" ? "white" : "gray.800"
                              }
                              borderColor={
                                colorMode === "dark" ? "gray.600" : "gray.200"
                              }
                              _placeholder={{
                                color:
                                  colorMode === "dark"
                                    ? "gray.400"
                                    : "gray.500",
                              }}
                              placeholder="Cari NIP..."
                            />
                          </FormControl>
                        </Box>
                      </Th>
                      <Th color="white" fontWeight="semibold">
                        NIK
                        <Box></Box>
                      </Th>
                      <Th color="white" fontWeight="semibold">
                        Jabatan
                        <Box>
                          <FormControl mt={"5px"}>
                            <Input
                              onChange={(e) =>
                                handleSubmitFilterChange(
                                  "jabatan",
                                  e.target.value,
                                )
                              }
                              type="text"
                              borderRadius="6px"
                              h={"32px"}
                              bg={colorMode === "dark" ? "gray.700" : "white"}
                              color={
                                colorMode === "dark" ? "white" : "gray.800"
                              }
                              borderColor={
                                colorMode === "dark" ? "gray.600" : "gray.200"
                              }
                              _placeholder={{
                                color:
                                  colorMode === "dark"
                                    ? "gray.400"
                                    : "gray.500",
                              }}
                              placeholder="Cari jabatan..."
                            />
                          </FormControl>
                        </Box>
                      </Th>
                      <Th color="white" fontWeight="semibold">
                        Unit Kerja
                        <Box>
                          <FormControl mt={"5px"}>
                            <Select2
                              options={dataSeed?.resultUnitKerja?.map(
                                (val) => ({
                                  value: val.id,
                                  label: `${val.unitKerja}`,
                                }),
                              )}
                              placeholder="Pilih Unit Kerja"
                              focusBorderColor={getSelect2FocusColor(colorMode)}
                              value={getSelectValue(
                                filterUnitKerjaId,
                                dataSeed?.resultUnitKerja?.map((val) => ({
                                  id: val.id,
                                  label: val.unitKerja,
                                  unitKerja: val.unitKerja,
                                })),
                              )}
                              onChange={(selectedOption) => {
                                setFilterUnitKerjaId(
                                  selectedOption?.value || null,
                                );
                              }}
                              isClearable
                              components={getSelect2Components()}
                              chakraStyles={getSelect2Styles(colorMode)}
                            />
                          </FormControl>
                        </Box>
                      </Th>
                      <Th color="white" fontWeight="semibold">
                        Pendidikan
                        <Box>
                          <FormControl mt={"5px"}>
                            <Input
                              onChange={(e) =>
                                handleSubmitFilterChange(
                                  "pendidikan",
                                  e.target.value,
                                )
                              }
                              type="text"
                              borderRadius="6px"
                              h={"32px"}
                              bg={colorMode === "dark" ? "gray.700" : "white"}
                              color={
                                colorMode === "dark" ? "white" : "gray.800"
                              }
                              borderColor={
                                colorMode === "dark" ? "gray.600" : "gray.200"
                              }
                              _placeholder={{
                                color:
                                  colorMode === "dark"
                                    ? "gray.400"
                                    : "gray.500",
                              }}
                              placeholder="Cari pendidikan..."
                            />
                          </FormControl>
                        </Box>
                      </Th>
                      <Th color="white" fontWeight="semibold">
                        Status
                        <Box>
                          <FormControl mt={"5px"}>
                            <Select2
                              options={dataSeed?.resultStatusPegawai?.map(
                                (val) => ({
                                  value: val.id,
                                  label: `${val.status}`,
                                }),
                              )}
                              placeholder="Pilih Status"
                              focusBorderColor={getSelect2FocusColor(colorMode)}
                              value={getSelectValue(
                                filterStatusPegawaiId,
                                dataSeed?.resultStatusPegawai?.map((val) => ({
                                  id: val.id,
                                  label: val.status,
                                  status: val.status,
                                })),
                              )}
                              onChange={(selectedOption) => {
                                setFilterStatusPegawaiId(
                                  selectedOption?.value || null,
                                );
                              }}
                              isClearable
                              components={getSelect2Components()}
                              chakraStyles={getSelect2Styles(colorMode)}
                            />
                          </FormControl>
                        </Box>
                      </Th>
                      <Th color="white" fontWeight="semibold">
                        Profesi
                        <Box>
                          <FormControl mt={"5px"}>
                            <Select2
                              options={dataSeed?.resultProfesi?.map((val) => ({
                                value: val.id,
                                label: `${val.nama}`,
                              }))}
                              placeholder="Pilih Profesi"
                              focusBorderColor={getSelect2FocusColor(colorMode)}
                              value={getSelectValue(
                                filterProfesiId,
                                dataSeed?.resultProfesi?.map((val) => ({
                                  id: val.id,
                                  label: val.nama,
                                  nama: val.nama,
                                })),
                              )}
                              onChange={(selectedOption) => {
                                setFilterProfesiId(
                                  selectedOption?.value || null,
                                );
                              }}
                              isClearable
                              components={getSelect2Components()}
                              chakraStyles={getSelect2Styles(colorMode)}
                            />
                          </FormControl>
                        </Box>
                      </Th>
                      <Th color="white" fontWeight="semibold">
                        Payroll
                        <Box></Box>
                      </Th>
                      <Th color="white" fontWeight="semibold">
                        Aksi
                        <Box mt={"5px"}>
                          <Button
                            onClick={resetFilter}
                            variant={"secondary"}
                            h={"32px"}
                            size="sm"
                            width="100%"
                            fontSize="xs"
                          >
                            Reset Filter
                          </Button>
                        </Box>
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {dataPegawai?.result?.map((item, index) => (
                      <Tr
                        key={item.id || index}
                        _hover={{
                          bg: colorMode === "dark" ? "gray.700" : "gray.50",
                        }}
                        transition="background-color 0.2s"
                      >
                        <Td>
                          <Checkbox
                            colorScheme="pegawai"
                            isChecked={selectedPegawaiIds.includes(item.id)}
                            onChange={() => togglePegawaiSelect(item.id)}
                          />
                        </Td>
                        <Td
                          color={colorMode === "dark" ? "gray.300" : "gray.700"}
                          fontWeight="medium"
                        >
                          {page * limit + index + 1}
                        </Td>
                        <Td
                          color={colorMode === "dark" ? "white" : "gray.800"}
                          fontWeight="semibold"
                        >
                          {item.nama}
                        </Td>
                        <Td
                          minWidth={"200px"}
                          color={colorMode === "dark" ? "gray.300" : "gray.700"}
                        >
                          {item.nip || "-"}
                        </Td>
                        <Td
                          color={colorMode === "dark" ? "gray.300" : "gray.700"}
                        >
                          {item.nik || "-"}
                        </Td>
                        <Td
                          color={colorMode === "dark" ? "gray.300" : "gray.700"}
                        >
                          {item.jabatan || "-"}
                        </Td>
                        <Td
                          color={colorMode === "dark" ? "gray.300" : "gray.700"}
                        >
                          {item?.daftarUnitKerja?.unitKerja || "-"}
                        </Td>
                        <Td
                          color={colorMode === "dark" ? "gray.300" : "gray.700"}
                        >
                          {item.pendidikan || "-"}
                        </Td>
                        <Td>
                          {item?.statusPegawai?.status ? (
                            <Badge
                              colorScheme={
                                item?.statusPegawai?.status
                                  ?.toLowerCase()
                                  .includes("aktif")
                                  ? "green"
                                  : item?.statusPegawai?.status
                                        ?.toLowerCase()
                                        .includes("pensiun")
                                    ? "orange"
                                    : "gray"
                              }
                              px={2}
                              py={1}
                              borderRadius="md"
                            >
                              {item?.statusPegawai?.status}
                            </Badge>
                          ) : (
                            <Text
                              color={
                                colorMode === "dark" ? "gray.400" : "gray.500"
                              }
                            >
                              -
                            </Text>
                          )}
                        </Td>
                        <Td
                          color={colorMode === "dark" ? "gray.300" : "gray.700"}
                        >
                          {item?.profesi?.nama || "-"}
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={
                              getPayrollBadge(item.payrolls).colorScheme
                            }
                            px={2}
                            py={1}
                            borderRadius="md"
                          >
                            {getPayrollBadge(item.payrolls).label}
                          </Badge>
                        </Td>
                        <Td>
                          <Flex gap={2}>
                            <Tooltip label="Lihat Detail" hasArrow>
                              <Button
                                onClick={() =>
                                  history.push(
                                    `/admin-pegawai/detail-payroll/${item.id}`,
                                  )
                                }
                                variant={"primary"}
                                size="sm"
                                leftIcon={<BsEyeFill />}
                              >
                                Detail
                              </Button>
                            </Tooltip>
                            <Tooltip label="Hapus" hasArrow>
                              <Button
                                variant={"cancle"}
                                size="sm"
                                leftIcon={<BsTrashFill />}
                              >
                                Hapus
                              </Button>
                            </Tooltip>
                          </Flex>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}

            {/* Mobile Card View */}
            {isMobile && (
              <Box>
                {dataPegawai?.result?.map((item, index) => (
                  <PegawaiCard
                    key={item.id || index}
                    item={item}
                    index={index}
                  />
                ))}
              </Box>
            )}

            {dataPegawai?.result?.length === 0 && (
              <Box
                textAlign="center"
                py={12}
                color={colorMode === "dark" ? "gray.400" : "gray.500"}
              >
                <Icon as={BsPeopleFill} boxSize={16} mb={4} opacity={0.3} />
                <Text fontSize="lg" fontWeight="medium" mb={2}>
                  Tidak ada data payroll
                </Text>
                <Text fontSize="sm">Coba ubah filter pencarian</Text>
              </Box>
            )}
            <Box
              mt={6}
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <ReactPaginate
                previousLabel={<BsCaretLeftFill />}
                nextLabel={<BsCaretRightFill />}
                pageCount={pages}
                onPageChange={changePage}
                activeClassName={"item active "}
                breakClassName={"item break-me "}
                breakLabel={"..."}
                containerClassName={"pagination"}
                disabledClassName={"disabled-page"}
                marginPagesDisplayed={2}
                nextClassName={"item next "}
                pageClassName={"item pagination-page "}
                pageRangeDisplayed={2}
                previousClassName={"item previous"}
              />
            </Box>
          </Container>
        </Box>
      )}
        <Modal
          isOpen={isTambahOpen}
          onClose={() => {
            onTambahClose();
          }}
          isCentered
        >
          <ModalOverlay />
          <ModalContent
            bg={colorMode === "dark" ? "gray.800" : "white"}
            mx={4}
          >
            <ModalHeader color={colorMode === "dark" ? "white" : "gray.800"}>
              Buat Payroll
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack align="stretch" spacing={4}>
                <Text
                  fontSize="sm"
                  color={colorMode === "dark" ? "gray.300" : "gray.600"}
                >
                  {selectedPegawaiIds.length} pegawai dipilih
                </Text>
                <FormControl isRequired>
                  <FormLabel
                    color={colorMode === "dark" ? "gray.300" : "gray.700"}
                  >
                    Tanggal Awal
                  </FormLabel>
                  <Input
                    type="date"
                    value={tanggalAwal}
                    onChange={(e) => setTanggalAwal(e.target.value)}
                    bg={colorMode === "dark" ? "gray.700" : "white"}
                    color={colorMode === "dark" ? "white" : "gray.800"}
                    borderColor={
                      colorMode === "dark" ? "gray.600" : "gray.200"
                    }
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel
                    color={colorMode === "dark" ? "gray.300" : "gray.700"}
                  >
                    Tanggal Akhir
                  </FormLabel>
                  <Input
                    type="date"
                    value={tanggalAkhir}
                    min={tanggalAwal || undefined}
                    onChange={(e) => setTanggalAkhir(e.target.value)}
                    bg={colorMode === "dark" ? "gray.700" : "white"}
                    color={colorMode === "dark" ? "white" : "gray.800"}
                    borderColor={
                      colorMode === "dark" ? "gray.600" : "gray.200"
                    }
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="ghost"
                mr={3}
                onClick={onTambahClose}
                isDisabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                isLoading={isSubmitting}
                onClick={handleSubmitPayroll}
              >
                Simpan
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        <Modal
          isOpen={isSlipGajiOpen}
          onClose={onSlipGajiClose}
          isCentered
        >
          <ModalOverlay />
          <ModalContent
            bg={colorMode === "dark" ? "gray.800" : "white"}
            mx={4}
          >
            <ModalHeader color={colorMode === "dark" ? "white" : "gray.800"}>
              Generate Slip Gaji
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack align="stretch" spacing={4}>
                <Text
                  fontSize="sm"
                  color={colorMode === "dark" ? "gray.300" : "gray.600"}
                >
                  {selectedPegawaiIds.length} pegawai dipilih
                </Text>
                <FormControl isRequired>
                  <FormLabel
                    color={colorMode === "dark" ? "gray.300" : "gray.700"}
                  >
                    Tanggal Awal
                  </FormLabel>
                  <Input
                    type="date"
                    value={tanggalAwalSlip}
                    onChange={(e) => setTanggalAwalSlip(e.target.value)}
                    bg={colorMode === "dark" ? "gray.700" : "white"}
                    color={colorMode === "dark" ? "white" : "gray.800"}
                    borderColor={
                      colorMode === "dark" ? "gray.600" : "gray.200"
                    }
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel
                    color={colorMode === "dark" ? "gray.300" : "gray.700"}
                  >
                    Tanggal Akhir
                  </FormLabel>
                  <Input
                    type="date"
                    value={tanggalAkhirSlip}
                    min={tanggalAwalSlip || undefined}
                    onChange={(e) => setTanggalAkhirSlip(e.target.value)}
                    bg={colorMode === "dark" ? "gray.700" : "white"}
                    color={colorMode === "dark" ? "white" : "gray.800"}
                    borderColor={
                      colorMode === "dark" ? "gray.600" : "gray.200"
                    }
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="ghost"
                mr={3}
                onClick={onSlipGajiClose}
                isDisabled={isSubmittingSlip}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                isLoading={isSubmittingSlip}
                onClick={handleSubmitSlipGaji}
              >
                Generate
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
    </LayoutPegawai>
  );
}

export default DaftarPayroll;
