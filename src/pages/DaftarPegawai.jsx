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
import "../Style/pagination.css";
import { Link, useHistory } from "react-router-dom";
import Loading from "../Componets/Loading";
import { Select as Select2 } from "chakra-react-select";
import axios from "axios";
import Layout from "../Componets/Layout";
import { useSelector } from "react-redux";
import { userRedux, selectRole } from "../Redux/Reducers/auth";
import LayoutPegawai from "../Componets/Pegawai/LayoutPegawai";
import {
  getSelect2Styles,
  getSelect2Components,
  getSelect2FocusColor,
} from "../Style/Components/select2Styles";

function DaftarPegawai() {
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
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const tambahPegawai = async () => {
    setIsSubmitting(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/pegawai/post`,
        {
          nama,
          nip,
          nik,
          jabatan,
          pangkatId,
          golonganId,
          tingkatanId,
          unitKerjaId,
          statusPegawaiId,
          profesiId,
          pendidikan,
          tanggalTMT,
          password: "paserkab",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(res.status, res.data, "tessss");
      onTambahClose();
      // Reset form
      setNama("");
      setNip("");
      setNik("");
      setJabatan("");
      setPangkatId(0);
      setGolonganId(0);
      setTingkatanId(0);
      setUnitKerjaId(0);
      setStatusPegawaiId(0);
      setProfesiId(0);
      setPendidikan("");
      setTanggalTMT("");
      // Refresh data
      await fetchDataPegawai();
    } catch (err) {
      console.error(err.message);
      alert("Gagal menambahkan pegawai. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  async function fetchDataPegawai() {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/pegawai/get/daftar?search_query=${keyword}&alfabet=${alfabet}&time=${time}&page=${page}&limit=${limit}&unitKerjaId=${
          filterUnitKerjaId || 0
        }&statusPegawaiId=${filterStatusPegawaiId || 0}&profesiId=${
          filterProfesiId || 0
        }&golonganId=${filtergolonganId || 0}&tingkatanId=${
          filtertingkatanId || 0
        }&pangkatId=${
          filterPangkatId || 0
        }&filterNip=${filterNip}&filterJabatan=${filterJabatan}&filterPendidikan=${filterPendidikan}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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
      'input[type="text"], input[type="name"]'
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

  const downloadExcelPegawai = async (unitKerjaId = null) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/pegawai/get/download`,
        {
          params: unitKerjaId ? { unitKerjaId } : {},
          responseType: "blob", // agar respons dibaca sebagai file
          headers: { Authorization: `Bearer ${token}` },
        }
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
    filtergolonganId,
    filterPangkatId,
    filtertingkatanId,
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
                Pangkat
              </Text>
              <Text
                fontSize="sm"
                color={colorMode === "dark" ? "gray.300" : "gray.700"}
              >
                {item.daftarPangkat?.pangkat || "-"}
              </Text>
            </Box>
            <Box>
              <Text
                fontSize="xs"
                fontWeight="semibold"
                color={colorMode === "dark" ? "gray.400" : "gray.600"}
                mb={1}
              >
                Golongan
              </Text>
              <Text
                fontSize="sm"
                color={colorMode === "dark" ? "gray.300" : "gray.700"}
              >
                {item.daftarGolongan?.golongan || "-"}
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

          <SimpleGrid columns={2} spacing={3}>
            <Box>
              <Text
                fontSize="xs"
                fontWeight="semibold"
                color={colorMode === "dark" ? "gray.400" : "gray.600"}
                mb={1}
              >
                Tingkatan
              </Text>
              <Text
                fontSize="sm"
                color={colorMode === "dark" ? "gray.300" : "gray.700"}
              >
                {item.daftarTingkatan?.tingkatan || "-"}
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
                onClick={() => history.push(`/admin/edit-pegawai/${item.id}`)}
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
                    {isMobile ? "Pegawai" : "Daftar Pegawai"}
                  </Heading>
                  {!isMobile && (
                    <Text
                      color={colorMode === "dark" ? "gray.400" : "gray.600"}
                      fontSize="sm"
                    >
                      Kelola data pegawai dengan mudah dan efisien
                    </Text>
                  )}
                </Box>
                <Flex
                  gap={3}
                  wrap="wrap"
                  w={isMobile ? "100%" : "auto"}
                  justify={isMobile ? "stretch" : "flex-end"}
                >
                  <Button
                    onClick={onTambahOpen}
                    variant={"primary"}
                    leftIcon={<BsPersonPlusFill />}
                    size={isMobile ? "sm" : "md"}
                    fontWeight="semibold"
                    px={isMobile ? 4 : 6}
                    flex={isMobile ? 1 : "auto"}
                    minW={isMobile ? "auto" : "auto"}
                  >
                    {isMobile ? "Tambah" : "Tambah Pegawai"}
                  </Button>
                  <Button
                    onClick={downloadExcelPegawai}
                    variant="outline"
                    leftIcon={<BsFileEarmarkExcel />}
                    size={isMobile ? "sm" : "md"}
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                    _hover={{
                      bg: colorMode === "dark" ? "gray.700" : "gray.50",
                    }}
                    flex={isMobile ? 1 : "auto"}
                    minW={isMobile ? "auto" : "auto"}
                  >
                    {isMobile ? "Excel" : "Download Excel"}
                  </Button>
                </Flex>
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
                        Pangkat
                      </FormLabel>
                      <Select2
                        options={dataSeed?.resultPangkat?.map((val) => ({
                          value: val.id,
                          label: `${val.pangkat}`,
                        }))}
                        placeholder="Pilih Pangkat"
                        focusBorderColor={getSelect2FocusColor(colorMode)}
                        value={getSelectValue(
                          filterPangkatId,
                          dataSeed?.resultPangkat?.map((val) => ({
                            id: val.id,
                            label: val.pangkat,
                            pangkat: val.pangkat,
                          }))
                        )}
                        onChange={(selectedOption) => {
                          setFilterPangkatId(selectedOption?.value || null);
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
                        Golongan
                      </FormLabel>
                      <Select2
                        options={dataSeed?.resultGolongan?.map((val) => ({
                          value: val.id,
                          label: `${val.golongan}`,
                        }))}
                        placeholder="Pilih Golongan"
                        focusBorderColor={getSelect2FocusColor(colorMode)}
                        value={getSelectValue(
                          filtergolonganId,
                          dataSeed?.resultGolongan?.map((val) => ({
                            id: val.id,
                            label: val.golongan,
                            golongan: val.golongan,
                          }))
                        )}
                        onChange={(selectedOption) => {
                          setFilterGolonganId(selectedOption?.value || null);
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
                        Tingkatan
                      </FormLabel>
                      <Select2
                        options={dataSeed?.resultTingkatan?.map((val) => ({
                          value: val.id,
                          label: `${val.tingkatan}`,
                        }))}
                        placeholder="Pilih Tingkatan"
                        focusBorderColor={getSelect2FocusColor(colorMode)}
                        value={getSelectValue(
                          filtertingkatanId,
                          dataSeed?.resultTingkatan?.map((val) => ({
                            id: val.id,
                            label: val.tingkatan,
                            tingkatan: val.tingkatan,
                          }))
                        )}
                        onChange={(selectedOption) => {
                          setFilterTingkatanId(selectedOption?.value || null);
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
                          }))
                        )}
                        onChange={(selectedOption) => {
                          setFilterStatusPegawaiId(
                            selectedOption?.value || null
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
                          }))
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
                          }))
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
                        Pangkat
                        <Box>
                          <FormControl mt={"5px"}>
                            <Select2
                              options={dataSeed?.resultPangkat?.map((val) => ({
                                value: val.id,
                                label: `${val.pangkat}`,
                              }))}
                              placeholder="Pilih Pangkat"
                              focusBorderColor={getSelect2FocusColor(colorMode)}
                              value={getSelectValue(
                                filterPangkatId,
                                dataSeed?.resultPangkat?.map((val) => ({
                                  id: val.id,
                                  label: val.pangkat,
                                  pangkat: val.pangkat,
                                }))
                              )}
                              onChange={(selectedOption) => {
                                setFilterPangkatId(
                                  selectedOption?.value || null
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
                        Golongan
                        <Box>
                          <FormControl mt={"5px"}>
                            <Select2
                              options={dataSeed?.resultGolongan?.map((val) => ({
                                value: val.id,
                                label: `${val.golongan}`,
                              }))}
                              placeholder="Pilih Golongan"
                              focusBorderColor={getSelect2FocusColor(colorMode)}
                              value={getSelectValue(
                                filtergolonganId,
                                dataSeed?.resultGolongan?.map((val) => ({
                                  id: val.id,
                                  label: val.golongan,
                                  golongan: val.golongan,
                                }))
                              )}
                              onChange={(selectedOption) => {
                                setFilterGolonganId(
                                  selectedOption?.value || null
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
                        Jabatan
                        <Box>
                          <FormControl mt={"5px"}>
                            <Input
                              onChange={(e) =>
                                handleSubmitFilterChange(
                                  "jabatan",
                                  e.target.value
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
                        Tingkatan
                        <Box>
                          <FormControl mt={"5px"}>
                            <Select2
                              options={dataSeed?.resultTingkatan?.map(
                                (val) => ({
                                  value: val.id,
                                  label: `${val.tingkatan}`,
                                })
                              )}
                              placeholder="Pilih Tingkatan"
                              focusBorderColor={getSelect2FocusColor(colorMode)}
                              value={getSelectValue(
                                filtertingkatanId,
                                dataSeed?.resultTingkatan?.map((val) => ({
                                  id: val.id,
                                  label: val.tingkatan,
                                  tingkatan: val.tingkatan,
                                }))
                              )}
                              onChange={(selectedOption) => {
                                setFilterTingkatanId(
                                  selectedOption?.value || null
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
                        Unit Kerja
                        <Box>
                          <FormControl mt={"5px"}>
                            <Select2
                              options={dataSeed?.resultUnitKerja?.map(
                                (val) => ({
                                  value: val.id,
                                  label: `${val.unitKerja}`,
                                })
                              )}
                              placeholder="Pilih Unit Kerja"
                              focusBorderColor={getSelect2FocusColor(colorMode)}
                              value={getSelectValue(
                                filterUnitKerjaId,
                                dataSeed?.resultUnitKerja?.map((val) => ({
                                  id: val.id,
                                  label: val.unitKerja,
                                  unitKerja: val.unitKerja,
                                }))
                              )}
                              onChange={(selectedOption) => {
                                setFilterUnitKerjaId(
                                  selectedOption?.value || null
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
                                  e.target.value
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
                                })
                              )}
                              placeholder="Pilih Status"
                              focusBorderColor={getSelect2FocusColor(colorMode)}
                              value={getSelectValue(
                                filterStatusPegawaiId,
                                dataSeed?.resultStatusPegawai?.map((val) => ({
                                  id: val.id,
                                  label: val.status,
                                  status: val.status,
                                }))
                              )}
                              onChange={(selectedOption) => {
                                setFilterStatusPegawaiId(
                                  selectedOption?.value || null
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
                                }))
                              )}
                              onChange={(selectedOption) => {
                                setFilterProfesiId(
                                  selectedOption?.value || null
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
                          {item.nip}
                        </Td>
                        <Td
                          color={colorMode === "dark" ? "gray.300" : "gray.700"}
                        >
                          {item.daftarPangkat?.pangkat || "-"}
                        </Td>
                        <Td
                          color={colorMode === "dark" ? "gray.300" : "gray.700"}
                        >
                          {item.daftarGolongan?.golongan || "-"}
                        </Td>
                        <Td
                          color={colorMode === "dark" ? "gray.300" : "gray.700"}
                        >
                          {item.jabatan || "-"}
                        </Td>
                        <Td
                          color={colorMode === "dark" ? "gray.300" : "gray.700"}
                        >
                          {item.daftarTingkatan?.tingkatan || "-"}
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
                          <Flex gap={2}>
                            <Tooltip label="Lihat Detail" hasArrow>
                              <Button
                                onClick={() =>
                                  history.push(`/admin/edit-pegawai/${item.id}`)
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
                  Tidak ada data pegawai
                </Text>
                <Text fontSize="sm">
                  Coba ubah filter atau tambah pegawai baru
                </Text>
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
        closeOnOverlayClick={false}
        isOpen={isTambahOpen}
        onClose={onTambahClose}
        size={isMobile ? "full" : "xl"}
        scrollBehavior="inside"
      >
        <ModalOverlay
          bg={colorMode === "dark" ? "blackAlpha.700" : "blackAlpha.600"}
        />
        <ModalContent
          borderRadius="12px"
          maxWidth="1200px"
          bg={colorMode === "dark" ? "gray.800" : "white"}
        >
          <ModalHeader
            bg={colorMode === "dark" ? "gray.700" : "gray.50"}
            borderTopRadius="12px"
            pb={4}
          >
            <HStack spacing={3}>
              <Box
                bgColor={"pegawai"}
                width={"40px"}
                height={"40px"}
                borderRadius="8px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={BsPersonPlusFill} color="white" boxSize={5} />
              </Box>
              <Box>
                <Heading
                  color={colorMode === "dark" ? "white" : "gray.800"}
                  size="md"
                  mb={1}
                >
                  Tambah Pegawai Baru
                </Heading>
                <Text
                  fontSize="sm"
                  color={colorMode === "dark" ? "gray.400" : "gray.600"}
                >
                  Lengkapi data pegawai di bawah ini
                </Text>
              </Box>
            </HStack>
          </ModalHeader>
          <ModalCloseButton
            color={colorMode === "dark" ? "white" : "gray.600"}
          />

          <ModalBody>
            <Box>
              <SimpleGrid
                columns={isMobile ? 1 : 2}
                spacing={6}
                p={isMobile ? "15px" : "30px"}
              >
                <FormControl my={"15px"}>
                  <FormLabel
                    fontSize={"18px"}
                    color={colorMode === "dark" ? "white" : "gray.700"}
                    fontWeight="medium"
                  >
                    Nama Pegawai
                  </FormLabel>
                  <Input
                    height={"50px"}
                    bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                    color={colorMode === "dark" ? "white" : "gray.800"}
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                    onChange={(e) => handleSubmitChange("nama", e.target.value)}
                    placeholder="Contoh: Sifulan, SKM"
                    _placeholder={{
                      color: colorMode === "dark" ? "gray.400" : "gray.500",
                    }}
                  />
                </FormControl>
                <FormControl my={"15px"}>
                  <FormLabel
                    fontSize={"18px"}
                    color={colorMode === "dark" ? "white" : "gray.700"}
                    fontWeight="medium"
                  >
                    NIP
                  </FormLabel>
                  <Input
                    height={"50px"}
                    bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                    color={colorMode === "dark" ? "white" : "gray.800"}
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                    onChange={(e) => handleSubmitChange("nip", e.target.value)}
                    placeholder="Contoh: 19330722 195502 1 003"
                    _placeholder={{
                      color: colorMode === "dark" ? "gray.400" : "gray.500",
                    }}
                  />
                </FormControl>

                <FormControl my={"15px"}>
                  <FormLabel
                    fontSize={"18px"}
                    color={colorMode === "dark" ? "white" : "gray.700"}
                    fontWeight="medium"
                  >
                    NIK
                  </FormLabel>
                  <Input
                    height={"50px"}
                    bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                    color={colorMode === "dark" ? "white" : "gray.800"}
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                    onChange={(e) => handleSubmitChange("nik", e.target.value)}
                    placeholder="Contoh: 640002 195502 1 003"
                    _placeholder={{
                      color: colorMode === "dark" ? "gray.400" : "gray.500",
                    }}
                  />
                </FormControl>
                <FormControl my={"15px"}>
                  <FormLabel
                    fontSize={"18px"}
                    color={colorMode === "dark" ? "white" : "gray.700"}
                    fontWeight="medium"
                  >
                    Pangkat
                  </FormLabel>
                  <Select2
                    options={dataSeed?.resultPangkat?.map((val) => ({
                      value: val.id,
                      label: `${val.pangkat}`,
                    }))}
                    placeholder="Pilih Pangkat"
                    focusBorderColor={getSelect2FocusColor(colorMode)}
                    onChange={(selectedOption) => {
                      setPangkatId(selectedOption?.value || 0);
                    }}
                    components={getSelect2Components()}
                    chakraStyles={getSelect2Styles(colorMode, {
                      height: "50px",
                      backgroundColor:
                        colorMode === "dark" ? "gray.700" : "gray.50",
                    })}
                  />
                </FormControl>
                <FormControl my={"15px"}>
                  <FormLabel
                    fontSize={"18px"}
                    color={colorMode === "dark" ? "white" : "gray.700"}
                    fontWeight="medium"
                  >
                    Golongan
                  </FormLabel>
                  <Select2
                    options={dataSeed?.resultGolongan?.map((val) => ({
                      value: val.id,
                      label: `${val.golongan}`,
                    }))}
                    placeholder="Pilih Golongan"
                    focusBorderColor={getSelect2FocusColor(colorMode)}
                    onChange={(selectedOption) => {
                      setGolonganId(selectedOption?.value || 0);
                    }}
                    components={getSelect2Components()}
                    chakraStyles={getSelect2Styles(colorMode, {
                      height: "50px",
                      backgroundColor:
                        colorMode === "dark" ? "gray.700" : "gray.50",
                    })}
                  />
                </FormControl>
                <FormControl my={"15px"}>
                  <FormLabel
                    fontSize={"18px"}
                    color={colorMode === "dark" ? "white" : "gray.700"}
                    fontWeight="medium"
                  >
                    Jabatan
                  </FormLabel>
                  <Input
                    height={"50px"}
                    bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                    color={colorMode === "dark" ? "white" : "gray.800"}
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                    onChange={(e) =>
                      handleSubmitChange("jabatan", e.target.value)
                    }
                    placeholder="Contoh: Bendahara"
                    _placeholder={{
                      color: colorMode === "dark" ? "gray.400" : "gray.500",
                    }}
                  />
                </FormControl>
                <FormControl my={"15px"}>
                  <FormLabel
                    fontSize={"18px"}
                    color={colorMode === "dark" ? "white" : "gray.700"}
                    fontWeight="medium"
                  >
                    Tingkatan
                  </FormLabel>
                  <Select2
                    options={dataSeed?.resultTingkatan?.map((val) => ({
                      value: val.id,
                      label: `${val.tingkatan}`,
                    }))}
                    placeholder="Pilih Tingkatan"
                    focusBorderColor={getSelect2FocusColor(colorMode)}
                    onChange={(selectedOption) => {
                      setTingkatanId(selectedOption?.value || 0);
                    }}
                    components={getSelect2Components()}
                    chakraStyles={getSelect2Styles(colorMode, {
                      height: "50px",
                      backgroundColor:
                        colorMode === "dark" ? "gray.700" : "gray.50",
                    })}
                  />
                </FormControl>
                <FormControl my={"15px"}>
                  <FormLabel
                    fontSize={"18px"}
                    color={colorMode === "dark" ? "white" : "gray.700"}
                    fontWeight="medium"
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
                    onChange={(selectedOption) => {
                      setUnitKerjaId(selectedOption?.value || 0);
                    }}
                    components={getSelect2Components()}
                    chakraStyles={getSelect2Styles(colorMode, {
                      height: "50px",
                      backgroundColor:
                        colorMode === "dark" ? "gray.700" : "gray.50",
                    })}
                  />
                </FormControl>
                <FormControl my={"15px"}>
                  <FormLabel
                    fontSize={"18px"}
                    color={colorMode === "dark" ? "white" : "gray.700"}
                    fontWeight="medium"
                  >
                    Status Pegawai
                  </FormLabel>
                  <Select2
                    options={dataSeed?.resultStatusPegawai?.map((val) => ({
                      value: val.id,
                      label: `${val.status}`,
                    }))}
                    placeholder="Pilih Status Pegawai"
                    focusBorderColor={getSelect2FocusColor(colorMode)}
                    onChange={(selectedOption) => {
                      setStatusPegawaiId(selectedOption?.value || 0);
                    }}
                    components={getSelect2Components()}
                    chakraStyles={getSelect2Styles(colorMode, {
                      height: "50px",
                      backgroundColor:
                        colorMode === "dark" ? "gray.700" : "gray.50",
                    })}
                  />
                </FormControl>
                <FormControl my={"15px"}>
                  <FormLabel
                    fontSize={"18px"}
                    color={colorMode === "dark" ? "white" : "gray.700"}
                    fontWeight="medium"
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
                    onChange={(selectedOption) => {
                      setProfesiId(selectedOption?.value || 0);
                    }}
                    components={getSelect2Components()}
                    chakraStyles={getSelect2Styles(colorMode, {
                      height: "50px",
                      backgroundColor:
                        colorMode === "dark" ? "gray.700" : "gray.50",
                    })}
                  />
                </FormControl>
                <FormControl my={"15px"}>
                  <FormLabel
                    fontSize={"18px"}
                    color={colorMode === "dark" ? "white" : "gray.700"}
                    fontWeight="medium"
                  >
                    Pendidikan
                  </FormLabel>
                  <Input
                    height={"50px"}
                    bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                    color={colorMode === "dark" ? "white" : "gray.800"}
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                    onChange={(e) =>
                      handleSubmitChange("pendidikan", e.target.value)
                    }
                    placeholder="Contoh: S-1 Ekonomi"
                    _placeholder={{
                      color: colorMode === "dark" ? "gray.400" : "gray.500",
                    }}
                  />
                </FormControl>
                <FormControl my={"15px"}>
                  <FormLabel
                    fontSize={"18px"}
                    color={colorMode === "dark" ? "white" : "gray.700"}
                    fontWeight="medium"
                  >
                    Tanggal TMT Golongan
                  </FormLabel>
                  <Input
                    bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                    color={colorMode === "dark" ? "white" : "gray.800"}
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                    height={"50px"}
                    type="date"
                    value={tanggalTMT}
                    onChange={(e) => setTanggalTMT(e.target.value)}
                  />
                </FormControl>
              </SimpleGrid>
            </Box>
          </ModalBody>

          <ModalFooter
            pe={"60px"}
            pb={"30px"}
            bg={colorMode === "dark" ? "gray.800" : "gray.50"}
            borderBottomRadius="12px"
            gap={3}
          >
            <Button
              onClick={onTambahClose}
              variant="ghost"
              size="md"
              color={colorMode === "dark" ? "gray.300" : "gray.600"}
              _hover={{
                bg: colorMode === "dark" ? "gray.700" : "gray.100",
              }}
            >
              Batal
            </Button>
            <Button
              onClick={tambahPegawai}
              variant={"primary"}
              size="md"
              px={8}
              leftIcon={<BsPersonPlusFill />}
              isLoading={isSubmitting}
              loadingText="Menyimpan..."
            >
              Simpan Pegawai
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </LayoutPegawai>
  );
}

export default DaftarPegawai;
