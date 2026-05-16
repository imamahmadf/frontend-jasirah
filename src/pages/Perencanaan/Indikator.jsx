import React, { useEffect, useState } from "react";
import axios from "axios";
import { userRedux } from "../../Redux/Reducers/auth";
import LayoutPerencanaan from "../../Componets/perencanaan/LayoutPerencanaan";
import ReactPaginate from "react-paginate";
import "../../Style/pagination.css";
import {
  Box,
  Container,
  Heading,
  Text,
  useColorMode,
  VStack,
  HStack,
  Badge,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Icon,
  Spinner,
  Center,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useDisclosure,
  useToast,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  IconButton,
  Tooltip,
  Textarea,
  Select,
} from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FaFileAlt,
  FaEdit,
  FaPlus,
  FaTrash,
  FaArrowLeft,
  FaSearch,
} from "react-icons/fa";
import { Select as Select2, AsyncSelect } from "chakra-react-select";

function Indikator(props) {
  const { colorMode } = useColorMode();
  const history = useHistory();
  const [dataIndikator, setDataIndikator] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useSelector(userRedux);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isTambahOpen,
    onOpen: onTambahOpen,
    onClose: onTambahClose,
  } = useDisclosure();
  const {
    isOpen: isHapusOpen,
    onOpen: onHapusOpen,
    onClose: onHapusClose,
  } = useDisclosure();
  const [selectedIndikator, setSelectedIndikator] = useState(null);
  const [indikatorToDelete, setIndikatorToDelete] = useState(null);
  const [editForm, setEditForm] = useState({
    indikator: "",
    satuanIndikatorId: null,
    subKegPerId: null,
    kegiatanId: null,
    programId: null,
    unitKerjaId: null,
    pegawaiId: null,
  });
  const [tambahForm, setTambahForm] = useState({
    indikator: "",
    satuanIndikatorId: null,
    subKegPerId: null,
    kegiatanId: null,
    programId: null,
    unitKerjaId: null,
    pegawaiId: null,
  });
  const [isLoadingSeed, setIsLoadingSeed] = useState(false);
  const [errors, setErrors] = useState({});
  const [tambahErrors, setTambahErrors] = useState({});
  const toast = useToast();

  // Data untuk dropdown
  const [dataSatuanIndikator, setDataSatuanIndikator] = useState([]);
  const [dataUnitKerja, setDataUnitKerja] = useState([]);

  // Pagination state
  const [page, setPage] = useState(0);
  const [limit] = useState(50);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPage, setTotalPage] = useState(0);

  // Filter state
  const [filterIndikator, setFilterIndikator] = useState("");
  const [filterSatuanIndikatorId, setFilterSatuanIndikatorId] = useState("");
  const [filterProgramId, setFilterProgramId] = useState("");
  const [filterKegiatanId, setFilterKegiatanId] = useState("");
  const [filterSubKegPerId, setFilterSubKegPerId] = useState("");
  const [filterUnitKerjaId, setFilterUnitKerjaId] = useState("");
  const [filterPegawaiId, setFilterPegawaiId] = useState("");
  const [selectedFilterPegawai, setSelectedFilterPegawai] = useState(null);
  const [selectedEditPegawai, setSelectedEditPegawai] = useState(null);
  const [selectedTambahPegawai, setSelectedTambahPegawai] = useState(null);
  // Selected options untuk filter
  const [selectedFilterProgram, setSelectedFilterProgram] = useState(null);
  const [selectedFilterKegiatan, setSelectedFilterKegiatan] = useState(null);
  const [selectedFilterSubKegiatan, setSelectedFilterSubKegiatan] =
    useState(null);
  // Selected options untuk edit
  const [selectedEditProgram, setSelectedEditProgram] = useState(null);
  const [selectedEditKegiatan, setSelectedEditKegiatan] = useState(null);
  const [selectedEditSubKegiatan, setSelectedEditSubKegiatan] = useState(null);
  // Selected options untuk tambah
  const [selectedTambahProgram, setSelectedTambahProgram] = useState(null);
  const [selectedTambahKegiatan, setSelectedTambahKegiatan] = useState(null);
  const [selectedTambahSubKegiatan, setSelectedTambahSubKegiatan] =
    useState(null);
  const [sortTime, setSortTime] = useState("ASC");

  const token = localStorage.getItem("token");

  // Fetch data indikator
  async function fetchIndikator() {
    try {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        time: sortTime,
      });

      if (filterIndikator) {
        params.append("indikator", filterIndikator);
      }
      if (filterSatuanIndikatorId) {
        params.append("satuanIndikatorId", filterSatuanIndikatorId);
      }
      if (filterProgramId) {
        params.append("programId", filterProgramId);
      }
      if (filterKegiatanId) {
        params.append("kegiatanId", filterKegiatanId);
      }
      if (filterSubKegPerId) {
        params.append("subKegPerId", filterSubKegPerId);
      }
      if (filterUnitKerjaId) {
        params.append("unitKerjaId", filterUnitKerjaId);
      }
      if (filterPegawaiId) {
        params.append("pegawaiId", filterPegawaiId);
      }

      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/indikator/get?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setDataIndikator(res.data.result || []);
      setTotalRows(res.data.totalRows || 0);
      setTotalPage(res.data.totalPage || 0);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data indikator");
      toast({
        title: "Gagal",
        description: err.response?.data?.message || "Gagal memuat data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Fetch data untuk dropdown
  async function fetchSeedData() {
    try {
      setIsLoadingSeed(true);

      // Fetch satuan indikator
      const satuanRes = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/satuan-indikator/get`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const satuanData = satuanRes.data?.result;
      setDataSatuanIndikator(Array.isArray(satuanData) ? satuanData : []);

      // Fetch unit kerja
      const seedRes = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/admin-perencanaan/get/seed/program/${
          user[0]?.unitKerja_profile?.indukUnitKerja?.id
        }`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const unitKerjaData = seedRes.data?.resultUnitKerja;
      setDataUnitKerja(Array.isArray(unitKerjaData) ? unitKerjaData : []);
    } catch (err) {
      console.error(err);
      toast({
        title: "Gagal",
        description: "Gagal memuat data dropdown",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingSeed(false);
    }
  }

  useEffect(() => {
    fetchIndikator();
  }, [
    page,
    limit,
    filterIndikator,
    filterSatuanIndikatorId,
    filterProgramId,
    filterKegiatanId,
    filterSubKegPerId,
    filterUnitKerjaId,
    filterPegawaiId,
    sortTime,
  ]);

  useEffect(() => {
    fetchSeedData();
  }, []);

  const handleEdit = (item) => {
    setSelectedIndikator(item);
    setEditForm({
      indikator: item.indikator || "",
      satuanIndikatorId: item.satuanIndikatorId || null,
      subKegPerId: item.subKegPerId || null,
      kegiatanId: item.kegiatanId || null,
      programId: item.programId || null,
      unitKerjaId: item.unitKerjaId || null,
      pegawaiId: item.pegawaiId || null,
    });
    // Set selected pegawai untuk edit
    if (item.pegawai && item.pegawaiId) {
      setSelectedEditPegawai({
        value: item.pegawaiId,
        label: `${item.pegawai.nip || ""} - ${item.pegawai.nama || ""}`,
      });
    } else {
      setSelectedEditPegawai(null);
    }
    // Set selected program untuk edit
    if (item.program && item.programId) {
      setSelectedEditProgram({
        value: item.programId,
        label: `${item.program.kode || ""} - ${item.program.nama || ""}`,
      });
    } else {
      setSelectedEditProgram(null);
    }
    // Set selected kegiatan untuk edit
    if (item.kegiatan && item.kegiatanId) {
      setSelectedEditKegiatan({
        value: item.kegiatanId,
        label: `${item.kegiatan.kode || ""} - ${item.kegiatan.nama || ""}`,
      });
    } else {
      setSelectedEditKegiatan(null);
    }
    // Set selected sub kegiatan untuk edit
    if (item.subKegPer && item.subKegPerId) {
      setSelectedEditSubKegiatan({
        value: item.subKegPerId,
        label: `${item.subKegPer.kode || ""} - ${item.subKegPer.nama || ""}`,
      });
    } else {
      setSelectedEditSubKegiatan(null);
    }
    setErrors({});
    onOpen();
  };

  const validateForm = () => {
    const newErrors = {};
    if (!editForm.indikator.trim()) {
      newErrors.indikator = "Indikator harus diisi";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!selectedIndikator) return;
    if (!validateForm()) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/indikator/update/${
          selectedIndikator.id
        }`,
        {
          indikator: editForm.indikator.trim(),
          satuanIndikatorId: editForm.satuanIndikatorId || null,
          subKegPerId: editForm.subKegPerId || null,
          kegiatanId: editForm.kegiatanId || null,
          programId: editForm.programId || null,
          unitKerjaId: editForm.unitKerjaId || null,
          pegawaiId: editForm.pegawaiId || null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast({
        title: "Berhasil",
        description: "Indikator berhasil diperbarui",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onClose();
      setSelectedIndikator(null);
      fetchIndikator();
    } catch (err) {
      console.error(err);
      toast({
        title: "Gagal",
        description:
          err.response?.data?.message || "Gagal memperbarui indikator",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedIndikator(null);
    setEditForm({
      indikator: "",
      satuanIndikatorId: null,
      subKegPerId: null,
      kegiatanId: null,
      programId: null,
      unitKerjaId: null,
      pegawaiId: null,
    });
    setSelectedEditPegawai(null);
    setSelectedEditProgram(null);
    setSelectedEditKegiatan(null);
    setSelectedEditSubKegiatan(null);
    setErrors({});
  };

  const handleHapusClick = (item) => {
    setIndikatorToDelete(item);
    onHapusOpen();
  };

  const handleHapusClose = () => {
    onHapusClose();
    setIndikatorToDelete(null);
  };

  const handleDelete = async () => {
    if (!indikatorToDelete) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/indikator/delete/${
          indikatorToDelete.id
        }`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast({
        title: "Berhasil",
        description: "Indikator berhasil dihapus",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      handleHapusClose();
      fetchIndikator();
    } catch (err) {
      console.error(err);
      toast({
        title: "Gagal",
        description: err.response?.data?.message || "Gagal menghapus indikator",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleTambahOpen = () => {
    setTambahForm({
      indikator: "",
      satuanIndikatorId: null,
      subKegPerId: null,
      kegiatanId: null,
      programId: null,
      unitKerjaId: null,
      pegawaiId: null,
    });
    setSelectedTambahPegawai(null);
    setSelectedTambahProgram(null);
    setSelectedTambahKegiatan(null);
    setSelectedTambahSubKegiatan(null);
    setTambahErrors({});
    onTambahOpen();
  };

  const handleTambahClose = () => {
    onTambahClose();
    setTambahForm({
      indikator: "",
      satuanIndikatorId: null,
      subKegPerId: null,
      kegiatanId: null,
      programId: null,
      unitKerjaId: null,
      pegawaiId: null,
    });
    setSelectedTambahPegawai(null);
    setSelectedTambahProgram(null);
    setSelectedTambahKegiatan(null);
    setSelectedTambahSubKegiatan(null);
    setTambahErrors({});
  };

  const validateTambahForm = () => {
    const newErrors = {};
    if (!tambahForm.indikator.trim()) {
      newErrors.indikator = "Indikator harus diisi";
    }
    setTambahErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTambah = async () => {
    if (!validateTambahForm()) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/indikator/post`,
        {
          indikator: tambahForm.indikator.trim(),
          satuanIndikatorId: tambahForm.satuanIndikatorId || null,
          subKegPerId: tambahForm.subKegPerId || null,
          kegiatanId: tambahForm.kegiatanId || null,
          programId: tambahForm.programId || null,
          unitKerjaId: tambahForm.unitKerjaId || null,
          pegawaiId: tambahForm.pegawaiId || null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast({
        title: "Berhasil",
        description: "Indikator berhasil ditambahkan",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      handleTambahClose();
      fetchIndikator();
    } catch (err) {
      console.error(err);
      toast({
        title: "Gagal",
        description:
          err.response?.data?.message || "Gagal menambahkan indikator",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSearch = () => {
    setPage(0);
    fetchIndikator();
  };

  const handleResetFilter = () => {
    setFilterIndikator("");
    setFilterSatuanIndikatorId("");
    setFilterProgramId("");
    setFilterKegiatanId("");
    setFilterSubKegPerId("");
    setFilterUnitKerjaId("");
    setFilterPegawaiId("");
    setSelectedFilterPegawai(null);
    setSelectedFilterProgram(null);
    setSelectedFilterKegiatan(null);
    setSelectedFilterSubKegiatan(null);
    setPage(0);
  };

  const changePage = ({ selected }) => {
    setPage(selected);
  };

  // Format options untuk Select2
  const satuanOptions = Array.isArray(dataSatuanIndikator)
    ? dataSatuanIndikator.map((item) => ({
        value: item.id,
        label: item.satuan,
      }))
    : [];

  const unitKerjaOptions = Array.isArray(dataUnitKerja)
    ? dataUnitKerja.map((item) => ({
        value: item.id,
        label: item.unitKerja,
      }))
    : [];

  return (
    <LayoutPerencanaan>
      <Box
        bg={colorMode === "dark" ? "gray.800" : "gray.100"}
        minH="100vh"
        pb="40px"
        px={{ base: 3, md: 6 }}
      >
        <Container maxW="1400px" py="8">
          <HStack mb={6} justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Heading
                size="lg"
                color={colorMode === "dark" ? "white" : "gray.800"}
              >
                Daftar Indikator
              </Heading>
              <Text fontSize="sm" color="gray.500">
                Kelola indikator kinerja untuk perencanaan dan pengukuran
              </Text>
            </VStack>
            <HStack spacing={3}>
              <Button
                leftIcon={<FaPlus />}
                colorScheme="green"
                size="sm"
                onClick={handleTambahOpen}
              >
                Tambah Indikator
              </Button>
              <Button
                leftIcon={<FaArrowLeft />}
                variant="outline"
                colorScheme="blue"
                size="sm"
                onClick={() => history.goBack()}
              >
                Kembali
              </Button>
            </HStack>
          </HStack>

          {/* Filter Section */}
          <Card
            width="100vw"
            mb={6}
            bg={colorMode === "dark" ? "gray.700" : "white"}
            borderRadius="lg"
            boxShadow="md"
            mx={{ base: -3, md: -6 }}
            px={{ base: 3, md: 6 }}
            position="relative"
            left="50%"
            right="50%"
            marginLeft={{
              base: "calc(-50vw + 3px)",
              md: "calc(-50vw + 6px)",
            }}
            marginRight={{
              base: "calc(-50vw + 3px)",
              md: "calc(-50vw + 6px)",
            }}
          >
            <CardHeader pb={4}>
              <Heading
                size="md"
                color={colorMode === "dark" ? "white" : "gray.700"}
              >
                Filter & Pencarian
              </Heading>
            </CardHeader>
            <CardBody pt={0}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold">
                    Cari Indikator
                  </FormLabel>
                  <Input
                    placeholder="Masukkan nama indikator..."
                    value={filterIndikator}
                    onChange={(e) => setFilterIndikator(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                      }
                    }}
                    bg={colorMode === "dark" ? "gray.600" : "white"}
                    borderColor={colorMode === "dark" ? "gray.500" : "gray.200"}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold">
                    Satuan Indikator
                  </FormLabel>
                  <Select2
                    options={satuanOptions}
                    placeholder="Pilih satuan..."
                    value={
                      filterSatuanIndikatorId
                        ? satuanOptions.find(
                            (opt) =>
                              opt.value.toString() ===
                              filterSatuanIndikatorId.toString()
                          )
                        : null
                    }
                    onChange={(selected) =>
                      setFilterSatuanIndikatorId(selected?.value || "")
                    }
                    isClearable
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold">
                    Program
                  </FormLabel>
                  <AsyncSelect
                    loadOptions={async (inputValue) => {
                      if (!inputValue) return [];
                      try {
                        const unitKerjaId =
                          filterUnitKerjaId ||
                          user[0]?.unitKerja_profile?.indukUnitKerja?.id ||
                          "";
                        const res = await axios.get(
                          `${
                            import.meta.env.VITE_REACT_APP_API_BASE_URL
                          }/indikator/search/program?q=${inputValue}&unitKerjaId=${unitKerjaId}`,
                          {
                            headers: { Authorization: `Bearer ${token}` },
                          }
                        );
                        const filtered = res.data?.result || [];
                        return filtered.map((val) => ({
                          value: val.id,
                          label: `${val.kode || ""} - ${val.nama || ""}`,
                        }));
                      } catch (err) {
                        console.error("Failed to load options:", err.message);
                        return [];
                      }
                    }}
                    placeholder="Ketik nama program..."
                    value={selectedFilterProgram}
                    onChange={(selectedOption) => {
                      setSelectedFilterProgram(selectedOption);
                      setFilterProgramId(selectedOption?.value || "");
                    }}
                    components={{
                      DropdownIndicator: () => null,
                      IndicatorSeparator: () => null,
                    }}
                    isClearable
                    chakraStyles={{
                      container: (provided) => ({
                        ...provided,
                        borderRadius: "6px",
                      }),
                      control: (provided) => ({
                        ...provided,
                        backgroundColor:
                          colorMode === "dark" ? "#4A5568" : "white",
                        border: `1px solid ${
                          colorMode === "dark" ? "#718096" : "#E2E8F0"
                        }`,
                        minHeight: "40px",
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        bg: state.isFocused
                          ? colorMode === "dark"
                            ? "blue.600"
                            : "blue.500"
                          : colorMode === "dark"
                          ? "gray.700"
                          : "white",
                        color: state.isFocused ? "white" : "inherit",
                      }),
                    }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold">
                    Kegiatan
                  </FormLabel>
                  <AsyncSelect
                    loadOptions={async (inputValue) => {
                      if (!inputValue) return [];
                      try {
                        const unitKerjaId =
                          filterUnitKerjaId ||
                          user[0]?.unitKerja_profile?.indukUnitKerja?.id ||
                          "";
                        const res = await axios.get(
                          `${
                            import.meta.env.VITE_REACT_APP_API_BASE_URL
                          }/indikator/search/kegiatan?q=${inputValue}&unitKerjaId=${unitKerjaId}`,
                          {
                            headers: { Authorization: `Bearer ${token}` },
                          }
                        );
                        const filtered = res.data?.result || [];
                        return filtered.map((val) => ({
                          value: val.id,
                          label: `${val.kode || ""} - ${val.nama || ""}`,
                        }));
                      } catch (err) {
                        console.error("Failed to load options:", err.message);
                        return [];
                      }
                    }}
                    placeholder="Ketik nama kegiatan..."
                    value={selectedFilterKegiatan}
                    onChange={(selectedOption) => {
                      setSelectedFilterKegiatan(selectedOption);
                      setFilterKegiatanId(selectedOption?.value || "");
                    }}
                    components={{
                      DropdownIndicator: () => null,
                      IndicatorSeparator: () => null,
                    }}
                    isClearable
                    chakraStyles={{
                      container: (provided) => ({
                        ...provided,
                        borderRadius: "6px",
                      }),
                      control: (provided) => ({
                        ...provided,
                        backgroundColor:
                          colorMode === "dark" ? "#4A5568" : "white",
                        border: `1px solid ${
                          colorMode === "dark" ? "#718096" : "#E2E8F0"
                        }`,
                        minHeight: "40px",
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        bg: state.isFocused
                          ? colorMode === "dark"
                            ? "blue.600"
                            : "blue.500"
                          : colorMode === "dark"
                          ? "gray.700"
                          : "white",
                        color: state.isFocused ? "white" : "inherit",
                      }),
                    }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold">
                    Sub Kegiatan
                  </FormLabel>
                  <AsyncSelect
                    loadOptions={async (inputValue) => {
                      if (!inputValue) return [];
                      try {
                        const unitKerjaId =
                          filterUnitKerjaId ||
                          user[0]?.unitKerja_profile?.indukUnitKerja?.id ||
                          "";
                        const res = await axios.get(
                          `${
                            import.meta.env.VITE_REACT_APP_API_BASE_URL
                          }/indikator/search/sub-keg-per?q=${inputValue}&unitKerjaId=${unitKerjaId}`,
                          {
                            headers: { Authorization: `Bearer ${token}` },
                          }
                        );
                        const filtered = res.data?.result || [];
                        return filtered.map((val) => ({
                          value: val.id,
                          label: `${val.kode || ""} - ${val.nama || ""}`,
                        }));
                      } catch (err) {
                        console.error("Failed to load options:", err.message);
                        return [];
                      }
                    }}
                    placeholder="Ketik nama sub kegiatan..."
                    value={selectedFilterSubKegiatan}
                    onChange={(selectedOption) => {
                      setSelectedFilterSubKegiatan(selectedOption);
                      setFilterSubKegPerId(selectedOption?.value || "");
                    }}
                    components={{
                      DropdownIndicator: () => null,
                      IndicatorSeparator: () => null,
                    }}
                    isClearable
                    chakraStyles={{
                      container: (provided) => ({
                        ...provided,
                        borderRadius: "6px",
                      }),
                      control: (provided) => ({
                        ...provided,
                        backgroundColor:
                          colorMode === "dark" ? "#4A5568" : "white",
                        border: `1px solid ${
                          colorMode === "dark" ? "#718096" : "#E2E8F0"
                        }`,
                        minHeight: "40px",
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        bg: state.isFocused
                          ? colorMode === "dark"
                            ? "blue.600"
                            : "blue.500"
                          : colorMode === "dark"
                          ? "gray.700"
                          : "white",
                        color: state.isFocused ? "white" : "inherit",
                      }),
                    }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold">
                    Unit Kerja
                  </FormLabel>
                  <Select2
                    options={unitKerjaOptions}
                    placeholder="Pilih unit kerja..."
                    value={
                      filterUnitKerjaId
                        ? unitKerjaOptions.find(
                            (opt) =>
                              opt.value.toString() ===
                              filterUnitKerjaId.toString()
                          )
                        : null
                    }
                    onChange={(selected) =>
                      setFilterUnitKerjaId(selected?.value || "")
                    }
                    isClearable
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold">
                    Pegawai
                  </FormLabel>
                  <AsyncSelect
                    loadOptions={async (inputValue) => {
                      if (!inputValue) return [];
                      try {
                        const res = await axios.get(
                          `${
                            import.meta.env.VITE_REACT_APP_API_BASE_URL
                          }/pegawai/search?q=${inputValue}`,
                          {
                            headers: { Authorization: `Bearer ${token}` },
                          }
                        );
                        const filtered = res.data?.result || [];
                        return filtered.map((val) => ({
                          value: val.id,
                          label: `${val.nip || ""} - ${val.nama || ""}`,
                        }));
                      } catch (err) {
                        console.error("Failed to load options:", err.message);
                        return [];
                      }
                    }}
                    placeholder="Ketik nama pegawai..."
                    value={selectedFilterPegawai}
                    onChange={(selectedOption) => {
                      setSelectedFilterPegawai(selectedOption);
                      setFilterPegawaiId(selectedOption?.value || "");
                    }}
                    components={{
                      DropdownIndicator: () => null,
                      IndicatorSeparator: () => null,
                    }}
                    isClearable
                    chakraStyles={{
                      container: (provided) => ({
                        ...provided,
                        borderRadius: "6px",
                      }),
                      control: (provided) => ({
                        ...provided,
                        backgroundColor:
                          colorMode === "dark" ? "#4A5568" : "white",
                        border: `1px solid ${
                          colorMode === "dark" ? "#718096" : "#E2E8F0"
                        }`,
                        minHeight: "40px",
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        bg: state.isFocused
                          ? colorMode === "dark"
                            ? "blue.600"
                            : "blue.500"
                          : colorMode === "dark"
                          ? "gray.700"
                          : "white",
                        color: state.isFocused ? "white" : "inherit",
                      }),
                    }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold">
                    Urutkan
                  </FormLabel>
                  <select
                    value={sortTime}
                    onChange={(e) => setSortTime(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "6px",
                      backgroundColor:
                        colorMode === "dark" ? "#4A5568" : "white",
                      color: colorMode === "dark" ? "white" : "black",
                      border: `1px solid ${
                        colorMode === "dark" ? "#718096" : "#E2E8F0"
                      }`,
                    }}
                  >
                    <option value="ASC">Terbaru</option>
                    <option value="DESC">Terlama</option>
                  </select>
                </FormControl>
              </SimpleGrid>
              <HStack mt={4} justify="flex-end">
                <Button
                  leftIcon={<FaSearch />}
                  colorScheme="blue"
                  size="sm"
                  onClick={handleSearch}
                >
                  Cari
                </Button>
                <Button variant="outline" size="sm" onClick={handleResetFilter}>
                  Reset
                </Button>
              </HStack>
            </CardBody>
          </Card>

          {/* Data Table */}
          {isLoading ? (
            <Center py={16}>
              <Spinner size="xl" />
            </Center>
          ) : error ? (
            <Center py={16}>
              <VStack spacing={3}>
                <Text color="red.500" fontWeight="medium">
                  {error}
                </Text>
                <Button size="sm" onClick={fetchIndikator}>
                  Muat Ulang
                </Button>
              </VStack>
            </Center>
          ) : dataIndikator.length === 0 ? (
            <Center py={16}>
              <VStack spacing={4}>
                <Icon as={FaFileAlt} boxSize={12} color="gray.400" />
                <Text color="gray.500">Belum ada indikator</Text>
              </VStack>
            </Center>
          ) : (
            <>
              <Box
                width="100vw"
                mb={4}
                overflowX="auto"
                bg={colorMode === "dark" ? "gray.700" : "white"}
                borderRadius="lg"
                boxShadow="md"
                p={4}
                mx={{ base: -3, md: -6 }}
                px={{ base: 3, md: 6 }}
                position="relative"
                left="50%"
                right="50%"
                marginLeft={{
                  base: "calc(-50vw + 3px)",
                  md: "calc(-50vw + 6px)",
                }}
                marginRight={{
                  base: "calc(-50vw + 3px)",
                  md: "calc(-50vw + 6px)",
                }}
              >
                <Table variant="simple" width="100%">
                  <Thead>
                    <Tr>
                      <Th>No</Th>
                      <Th minW="400px" w="30%">
                        Indikator
                      </Th>
                      <Th>Satuan</Th>
                      <Th>Program</Th>
                      <Th>Kegiatan</Th>
                      <Th>Sub Kegiatan</Th>
                      <Th>Unit Kerja</Th>
                      <Th>Pegawai</Th>
                      <Th textAlign="center">Aksi</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {dataIndikator.map((item, index) => (
                      <Tr key={item.id}>
                        <Td>{page * limit + index + 1}</Td>
                        <Td minW="400px" w="30%">
                          <Text>{item.indikator}</Text>
                        </Td>
                        <Td>
                          {item.satuanIndikator ? (
                            <Badge
                              colorScheme="blue"
                              borderRadius="full"
                              px={3}
                              py={1}
                            >
                              {item.satuanIndikator.satuan}
                            </Badge>
                          ) : (
                            "-"
                          )}
                        </Td>
                        <Td>
                          {item.program ? (
                            <Text fontSize="sm">
                              {item.program.kode} - {item.program.nama}
                            </Text>
                          ) : (
                            "-"
                          )}
                        </Td>
                        <Td>
                          {item.kegiatan ? (
                            <Text fontSize="sm">
                              {item.kegiatan.kode} - {item.kegiatan.nama}
                            </Text>
                          ) : (
                            "-"
                          )}
                        </Td>
                        <Td>
                          {item.subKegPer ? (
                            <Text fontSize="sm">
                              {item.subKegPer.kode} - {item.subKegPer.nama}
                            </Text>
                          ) : (
                            "-"
                          )}
                        </Td>
                        <Td>
                          {item.daftarUnitKerja ? (
                            <Text fontSize="sm">
                              {item.daftarUnitKerja.unitKerja}
                            </Text>
                          ) : (
                            "-"
                          )}
                        </Td>
                        <Td>
                          {item.pegawai ? (
                            <Text fontSize="sm">
                              {item.pegawai.nip} - {item.pegawai.nama}
                            </Text>
                          ) : (
                            "-"
                          )}
                        </Td>
                        <Td>
                          <HStack spacing={2} justify="center">
                            <Tooltip label="Edit">
                              <IconButton
                                icon={<FaEdit />}
                                colorScheme="blue"
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(item)}
                              />
                            </Tooltip>
                            <Tooltip label="Hapus">
                              <IconButton
                                icon={<FaTrash />}
                                colorScheme="red"
                                size="sm"
                                variant="outline"
                                onClick={() => handleHapusClick(item)}
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>

              {/* Pagination */}
              <Box
                mt={6}
                display="flex"
                flexDirection={{ base: "column", md: "row" }}
                justifyContent="space-between"
                alignItems="center"
                gap={4}
              >
                <Text fontSize="sm" color="gray.500">
                  Menampilkan {page * limit + 1} -{" "}
                  {Math.min((page + 1) * limit, totalRows)} dari {totalRows}{" "}
                  data
                </Text>
                <ReactPaginate
                  previousLabel={"←"}
                  nextLabel={"→"}
                  pageCount={totalPage || 1}
                  onPageChange={changePage}
                  forcePage={page}
                  activeClassName={"item active "}
                  breakClassName={"item break-me "}
                  breakLabel={"..."}
                  containerClassName={"pagination"}
                  disabledClassName={"disabled-page"}
                  marginPagesDisplayed={1}
                  nextClassName={"item next "}
                  pageClassName={"item pagination-page "}
                  pageRangeDisplayed={2}
                  previousClassName={"item previous"}
                />
              </Box>
            </>
          )}
        </Container>
      </Box>

      {/* Modal Edit Indikator */}
      <Modal isOpen={isOpen} onClose={handleClose} size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderRadius="xl"
        >
          <ModalHeader>
            <HStack>
              <Icon as={FaEdit} color="blue.500" />
              <Text>Edit Indikator</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <Divider />
          <ModalBody py={6}>
            <VStack spacing={5} align="stretch">
              <FormControl isInvalid={!!errors.indikator}>
                <FormLabel>Indikator *</FormLabel>
                <Textarea
                  placeholder="Masukkan indikator"
                  value={editForm.indikator}
                  onChange={(e) => {
                    setEditForm({ ...editForm, indikator: e.target.value });
                    setErrors({ ...errors, indikator: "" });
                  }}
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                  rows={3}
                />
                <FormErrorMessage>{errors.indikator}</FormErrorMessage>
              </FormControl>
              <FormControl>
                <FormLabel>Satuan Indikator</FormLabel>
                <Select2
                  options={satuanOptions}
                  placeholder="Pilih satuan indikator..."
                  value={
                    editForm.satuanIndikatorId
                      ? satuanOptions.find(
                          (opt) =>
                            opt.value.toString() ===
                            editForm.satuanIndikatorId?.toString()
                        )
                      : null
                  }
                  onChange={(selected) =>
                    setEditForm({
                      ...editForm,
                      satuanIndikatorId: selected?.value || null,
                    })
                  }
                  isClearable
                />
              </FormControl>
              <FormControl>
                <FormLabel>Program</FormLabel>
                <AsyncSelect
                  loadOptions={async (inputValue) => {
                    if (!inputValue) return [];
                    try {
                      const unitKerjaId =
                        editForm.unitKerjaId ||
                        user[0]?.unitKerja_profile?.indukUnitKerja?.id ||
                        "";
                      const res = await axios.get(
                        `${
                          import.meta.env.VITE_REACT_APP_API_BASE_URL
                        }/indikator/search/program?q=${inputValue}&unitKerjaId=${unitKerjaId}`,
                        {
                          headers: { Authorization: `Bearer ${token}` },
                        }
                      );
                      const filtered = res.data?.result || [];
                      return filtered.map((val) => ({
                        value: val.id,
                        label: `${val.kode || ""} - ${val.nama || ""}`,
                      }));
                    } catch (err) {
                      console.error("Failed to load options:", err.message);
                      return [];
                    }
                  }}
                  placeholder="Ketik nama program..."
                  value={selectedEditProgram}
                  onChange={(selectedOption) => {
                    setSelectedEditProgram(selectedOption);
                    setEditForm({
                      ...editForm,
                      programId: selectedOption?.value || null,
                    });
                  }}
                  components={{
                    DropdownIndicator: () => null,
                    IndicatorSeparator: () => null,
                  }}
                  isClearable
                  chakraStyles={{
                    container: (provided) => ({
                      ...provided,
                      borderRadius: "6px",
                    }),
                    control: (provided) => ({
                      ...provided,
                      backgroundColor:
                        colorMode === "dark" ? "#2D3748" : "white",
                      border: `1px solid ${
                        colorMode === "dark" ? "#4A5568" : "#E2E8F0"
                      }`,
                      minHeight: "40px",
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      bg: state.isFocused
                        ? colorMode === "dark"
                          ? "blue.600"
                          : "blue.500"
                        : colorMode === "dark"
                        ? "gray.700"
                        : "white",
                      color: state.isFocused ? "white" : "inherit",
                    }),
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Kegiatan</FormLabel>
                <AsyncSelect
                  loadOptions={async (inputValue) => {
                    if (!inputValue) return [];
                    try {
                      const unitKerjaId =
                        editForm.unitKerjaId ||
                        user[0]?.unitKerja_profile?.indukUnitKerja?.id ||
                        "";
                      const res = await axios.get(
                        `${
                          import.meta.env.VITE_REACT_APP_API_BASE_URL
                        }/indikator/search/kegiatan?q=${inputValue}&unitKerjaId=${unitKerjaId}`,
                        {
                          headers: { Authorization: `Bearer ${token}` },
                        }
                      );
                      const filtered = res.data?.result || [];
                      return filtered.map((val) => ({
                        value: val.id,
                        label: `${val.kode || ""} - ${val.nama || ""}`,
                      }));
                    } catch (err) {
                      console.error("Failed to load options:", err.message);
                      return [];
                    }
                  }}
                  placeholder="Ketik nama kegiatan..."
                  value={selectedEditKegiatan}
                  onChange={(selectedOption) => {
                    setSelectedEditKegiatan(selectedOption);
                    setEditForm({
                      ...editForm,
                      kegiatanId: selectedOption?.value || null,
                    });
                  }}
                  components={{
                    DropdownIndicator: () => null,
                    IndicatorSeparator: () => null,
                  }}
                  isClearable
                  chakraStyles={{
                    container: (provided) => ({
                      ...provided,
                      borderRadius: "6px",
                    }),
                    control: (provided) => ({
                      ...provided,
                      backgroundColor:
                        colorMode === "dark" ? "#2D3748" : "white",
                      border: `1px solid ${
                        colorMode === "dark" ? "#4A5568" : "#E2E8F0"
                      }`,
                      minHeight: "40px",
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      bg: state.isFocused
                        ? colorMode === "dark"
                          ? "blue.600"
                          : "blue.500"
                        : colorMode === "dark"
                        ? "gray.700"
                        : "white",
                      color: state.isFocused ? "white" : "inherit",
                    }),
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Sub Kegiatan</FormLabel>
                <AsyncSelect
                  loadOptions={async (inputValue) => {
                    if (!inputValue) return [];
                    try {
                      const unitKerjaId =
                        editForm.unitKerjaId ||
                        user[0]?.unitKerja_profile?.indukUnitKerja?.id ||
                        "";
                      const res = await axios.get(
                        `${
                          import.meta.env.VITE_REACT_APP_API_BASE_URL
                        }/indikator/search/sub-keg-per?q=${inputValue}&unitKerjaId=${unitKerjaId}`,
                        {
                          headers: { Authorization: `Bearer ${token}` },
                        }
                      );
                      const filtered = res.data?.result || [];
                      return filtered.map((val) => ({
                        value: val.id,
                        label: `${val.kode || ""} - ${val.nama || ""}`,
                      }));
                    } catch (err) {
                      console.error("Failed to load options:", err.message);
                      return [];
                    }
                  }}
                  placeholder="Ketik nama sub kegiatan..."
                  value={selectedEditSubKegiatan}
                  onChange={(selectedOption) => {
                    setSelectedEditSubKegiatan(selectedOption);
                    setEditForm({
                      ...editForm,
                      subKegPerId: selectedOption?.value || null,
                    });
                  }}
                  components={{
                    DropdownIndicator: () => null,
                    IndicatorSeparator: () => null,
                  }}
                  isClearable
                  chakraStyles={{
                    container: (provided) => ({
                      ...provided,
                      borderRadius: "6px",
                    }),
                    control: (provided) => ({
                      ...provided,
                      backgroundColor:
                        colorMode === "dark" ? "#2D3748" : "white",
                      border: `1px solid ${
                        colorMode === "dark" ? "#4A5568" : "#E2E8F0"
                      }`,
                      minHeight: "40px",
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      bg: state.isFocused
                        ? colorMode === "dark"
                          ? "blue.600"
                          : "blue.500"
                        : colorMode === "dark"
                        ? "gray.700"
                        : "white",
                      color: state.isFocused ? "white" : "inherit",
                    }),
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Unit Kerja</FormLabel>
                <Select2
                  options={unitKerjaOptions}
                  placeholder="Pilih unit kerja..."
                  value={
                    editForm.unitKerjaId
                      ? unitKerjaOptions.find(
                          (opt) =>
                            opt.value.toString() ===
                            editForm.unitKerjaId?.toString()
                        )
                      : null
                  }
                  onChange={(selected) =>
                    setEditForm({
                      ...editForm,
                      unitKerjaId: selected?.value || null,
                    })
                  }
                  isClearable
                />
              </FormControl>
              <FormControl>
                <FormLabel>Pegawai</FormLabel>
                <AsyncSelect
                  loadOptions={async (inputValue) => {
                    if (!inputValue) return [];
                    try {
                      const res = await axios.get(
                        `${
                          import.meta.env.VITE_REACT_APP_API_BASE_URL
                        }/pegawai/search?q=${inputValue}`,
                        {
                          headers: { Authorization: `Bearer ${token}` },
                        }
                      );
                      const filtered = res.data?.result || [];
                      return filtered.map((val) => ({
                        value: val.id,
                        label: `${val.nip || ""} - ${val.nama || ""}`,
                      }));
                    } catch (err) {
                      console.error("Failed to load options:", err.message);
                      return [];
                    }
                  }}
                  placeholder="Ketik nama pegawai..."
                  value={selectedEditPegawai}
                  onChange={(selectedOption) => {
                    setSelectedEditPegawai(selectedOption);
                    setEditForm({
                      ...editForm,
                      pegawaiId: selectedOption?.value || null,
                    });
                  }}
                  components={{
                    DropdownIndicator: () => null,
                    IndicatorSeparator: () => null,
                  }}
                  isClearable
                  chakraStyles={{
                    container: (provided) => ({
                      ...provided,
                      borderRadius: "6px",
                    }),
                    control: (provided) => ({
                      ...provided,
                      backgroundColor:
                        colorMode === "dark" ? "#2D3748" : "white",
                      border: `1px solid ${
                        colorMode === "dark" ? "#4A5568" : "#E2E8F0"
                      }`,
                      minHeight: "40px",
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      bg: state.isFocused
                        ? colorMode === "dark"
                          ? "blue.600"
                          : "blue.500"
                        : colorMode === "dark"
                        ? "gray.700"
                        : "white",
                      color: state.isFocused ? "white" : "inherit",
                    }),
                  }}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <Divider />
          <ModalFooter>
            <Button mr={3} variant="ghost" onClick={handleClose}>
              Batal
            </Button>
            <Button colorScheme="blue" onClick={handleUpdate}>
              Simpan Perubahan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Tambah Indikator */}
      <Modal
        isOpen={isTambahOpen}
        onClose={handleTambahClose}
        size="xl"
        isCentered
      >
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderRadius="xl"
        >
          <ModalHeader>
            <HStack>
              <Icon as={FaPlus} color="green.500" />
              <Text>Tambah Indikator</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <Divider />
          <ModalBody py={6}>
            <VStack spacing={5} align="stretch">
              <FormControl isInvalid={!!tambahErrors.indikator}>
                <FormLabel>Indikator *</FormLabel>
                <Textarea
                  placeholder="Masukkan indikator"
                  value={tambahForm.indikator}
                  onChange={(e) => {
                    setTambahForm({ ...tambahForm, indikator: e.target.value });
                    setTambahErrors({ ...tambahErrors, indikator: "" });
                  }}
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                  rows={3}
                />
                <FormErrorMessage>{tambahErrors.indikator}</FormErrorMessage>
              </FormControl>
              <FormControl>
                <FormLabel>Satuan Indikator</FormLabel>
                <Select2
                  options={satuanOptions}
                  placeholder="Pilih satuan indikator..."
                  value={
                    tambahForm.satuanIndikatorId
                      ? satuanOptions.find(
                          (opt) =>
                            opt.value.toString() ===
                            tambahForm.satuanIndikatorId?.toString()
                        )
                      : null
                  }
                  onChange={(selected) =>
                    setTambahForm({
                      ...tambahForm,
                      satuanIndikatorId: selected?.value || null,
                    })
                  }
                  isClearable
                />
              </FormControl>
              <FormControl>
                <FormLabel>Program</FormLabel>
                <AsyncSelect
                  loadOptions={async (inputValue) => {
                    if (!inputValue) return [];
                    try {
                      const unitKerjaId =
                        tambahForm.unitKerjaId ||
                        user[0]?.unitKerja_profile?.indukUnitKerja?.id ||
                        "";
                      const res = await axios.get(
                        `${
                          import.meta.env.VITE_REACT_APP_API_BASE_URL
                        }/indikator/search/program?q=${inputValue}&unitKerjaId=${unitKerjaId}`,
                        {
                          headers: { Authorization: `Bearer ${token}` },
                        }
                      );
                      const filtered = res.data?.result || [];
                      return filtered.map((val) => ({
                        value: val.id,
                        label: `${val.kode || ""} - ${val.nama || ""}`,
                      }));
                    } catch (err) {
                      console.error("Failed to load options:", err.message);
                      return [];
                    }
                  }}
                  placeholder="Ketik nama program..."
                  value={selectedTambahProgram}
                  onChange={(selectedOption) => {
                    setSelectedTambahProgram(selectedOption);
                    setTambahForm({
                      ...tambahForm,
                      programId: selectedOption?.value || null,
                    });
                  }}
                  components={{
                    DropdownIndicator: () => null,
                    IndicatorSeparator: () => null,
                  }}
                  isClearable
                  chakraStyles={{
                    container: (provided) => ({
                      ...provided,
                      borderRadius: "6px",
                    }),
                    control: (provided) => ({
                      ...provided,
                      backgroundColor:
                        colorMode === "dark" ? "#2D3748" : "white",
                      border: `1px solid ${
                        colorMode === "dark" ? "#4A5568" : "#E2E8F0"
                      }`,
                      minHeight: "40px",
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      bg: state.isFocused
                        ? colorMode === "dark"
                          ? "blue.600"
                          : "blue.500"
                        : colorMode === "dark"
                        ? "gray.700"
                        : "white",
                      color: state.isFocused ? "white" : "inherit",
                    }),
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Kegiatan</FormLabel>
                <AsyncSelect
                  loadOptions={async (inputValue) => {
                    if (!inputValue) return [];
                    try {
                      const unitKerjaId =
                        tambahForm.unitKerjaId ||
                        user[0]?.unitKerja_profile?.indukUnitKerja?.id ||
                        "";
                      const res = await axios.get(
                        `${
                          import.meta.env.VITE_REACT_APP_API_BASE_URL
                        }/indikator/search/kegiatan?q=${inputValue}&unitKerjaId=${unitKerjaId}`,
                        {
                          headers: { Authorization: `Bearer ${token}` },
                        }
                      );
                      const filtered = res.data?.result || [];
                      return filtered.map((val) => ({
                        value: val.id,
                        label: `${val.kode || ""} - ${val.nama || ""}`,
                      }));
                    } catch (err) {
                      console.error("Failed to load options:", err.message);
                      return [];
                    }
                  }}
                  placeholder="Ketik nama kegiatan..."
                  value={selectedTambahKegiatan}
                  onChange={(selectedOption) => {
                    setSelectedTambahKegiatan(selectedOption);
                    setTambahForm({
                      ...tambahForm,
                      kegiatanId: selectedOption?.value || null,
                    });
                  }}
                  components={{
                    DropdownIndicator: () => null,
                    IndicatorSeparator: () => null,
                  }}
                  isClearable
                  chakraStyles={{
                    container: (provided) => ({
                      ...provided,
                      borderRadius: "6px",
                    }),
                    control: (provided) => ({
                      ...provided,
                      backgroundColor:
                        colorMode === "dark" ? "#2D3748" : "white",
                      border: `1px solid ${
                        colorMode === "dark" ? "#4A5568" : "#E2E8F0"
                      }`,
                      minHeight: "40px",
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      bg: state.isFocused
                        ? colorMode === "dark"
                          ? "blue.600"
                          : "blue.500"
                        : colorMode === "dark"
                        ? "gray.700"
                        : "white",
                      color: state.isFocused ? "white" : "inherit",
                    }),
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Sub Kegiatan</FormLabel>
                <AsyncSelect
                  loadOptions={async (inputValue) => {
                    if (!inputValue) return [];
                    try {
                      const unitKerjaId =
                        tambahForm.unitKerjaId ||
                        user[0]?.unitKerja_profile?.indukUnitKerja?.id ||
                        "";
                      const res = await axios.get(
                        `${
                          import.meta.env.VITE_REACT_APP_API_BASE_URL
                        }/indikator/search/sub-keg-per?q=${inputValue}&unitKerjaId=${unitKerjaId}`,
                        {
                          headers: { Authorization: `Bearer ${token}` },
                        }
                      );
                      const filtered = res.data?.result || [];
                      return filtered.map((val) => ({
                        value: val.id,
                        label: `${val.kode || ""} - ${val.nama || ""}`,
                      }));
                    } catch (err) {
                      console.error("Failed to load options:", err.message);
                      return [];
                    }
                  }}
                  placeholder="Ketik nama sub kegiatan..."
                  value={selectedTambahSubKegiatan}
                  onChange={(selectedOption) => {
                    setSelectedTambahSubKegiatan(selectedOption);
                    setTambahForm({
                      ...tambahForm,
                      subKegPerId: selectedOption?.value || null,
                    });
                  }}
                  components={{
                    DropdownIndicator: () => null,
                    IndicatorSeparator: () => null,
                  }}
                  isClearable
                  chakraStyles={{
                    container: (provided) => ({
                      ...provided,
                      borderRadius: "6px",
                    }),
                    control: (provided) => ({
                      ...provided,
                      backgroundColor:
                        colorMode === "dark" ? "#2D3748" : "white",
                      border: `1px solid ${
                        colorMode === "dark" ? "#4A5568" : "#E2E8F0"
                      }`,
                      minHeight: "40px",
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      bg: state.isFocused
                        ? colorMode === "dark"
                          ? "blue.600"
                          : "blue.500"
                        : colorMode === "dark"
                        ? "gray.700"
                        : "white",
                      color: state.isFocused ? "white" : "inherit",
                    }),
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Unit Kerja</FormLabel>
                <Select2
                  options={unitKerjaOptions}
                  placeholder="Pilih unit kerja..."
                  value={
                    tambahForm.unitKerjaId
                      ? unitKerjaOptions.find(
                          (opt) =>
                            opt.value.toString() ===
                            tambahForm.unitKerjaId?.toString()
                        )
                      : null
                  }
                  onChange={(selected) =>
                    setTambahForm({
                      ...tambahForm,
                      unitKerjaId: selected?.value || null,
                    })
                  }
                  isClearable
                />
              </FormControl>
              <FormControl>
                <FormLabel>Pegawai</FormLabel>
                <AsyncSelect
                  loadOptions={async (inputValue) => {
                    if (!inputValue) return [];
                    try {
                      const res = await axios.get(
                        `${
                          import.meta.env.VITE_REACT_APP_API_BASE_URL
                        }/pegawai/search?q=${inputValue}`,
                        {
                          headers: { Authorization: `Bearer ${token}` },
                        }
                      );
                      const filtered = res.data?.result || [];
                      return filtered.map((val) => ({
                        value: val.id,
                        label: `${val.nip || ""} - ${val.nama || ""}`,
                      }));
                    } catch (err) {
                      console.error("Failed to load options:", err.message);
                      return [];
                    }
                  }}
                  placeholder="Ketik nama pegawai..."
                  value={selectedTambahPegawai}
                  onChange={(selectedOption) => {
                    setSelectedTambahPegawai(selectedOption);
                    setTambahForm({
                      ...tambahForm,
                      pegawaiId: selectedOption?.value || null,
                    });
                  }}
                  components={{
                    DropdownIndicator: () => null,
                    IndicatorSeparator: () => null,
                  }}
                  isClearable
                  chakraStyles={{
                    container: (provided) => ({
                      ...provided,
                      borderRadius: "6px",
                    }),
                    control: (provided) => ({
                      ...provided,
                      backgroundColor:
                        colorMode === "dark" ? "#2D3748" : "white",
                      border: `1px solid ${
                        colorMode === "dark" ? "#4A5568" : "#E2E8F0"
                      }`,
                      minHeight: "40px",
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      bg: state.isFocused
                        ? colorMode === "dark"
                          ? "blue.600"
                          : "blue.500"
                        : colorMode === "dark"
                        ? "gray.700"
                        : "white",
                      color: state.isFocused ? "white" : "inherit",
                    }),
                  }}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <Divider />
          <ModalFooter>
            <Button mr={3} variant="ghost" onClick={handleTambahClose}>
              Batal
            </Button>
            <Button colorScheme="green" onClick={handleTambah}>
              Tambah Indikator
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Konfirmasi Hapus */}
      <Modal
        isOpen={isHapusOpen}
        onClose={handleHapusClose}
        size="md"
        isCentered
      >
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderRadius="xl"
        >
          <ModalHeader>
            <HStack>
              <Icon as={FaTrash} color="red.500" />
              <Text>Konfirmasi Hapus</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <Divider />
          <ModalBody py={6}>
            <VStack spacing={4} align="stretch">
              <Text color={colorMode === "dark" ? "gray.300" : "gray.700"}>
                Apakah Anda yakin ingin menghapus indikator berikut?
              </Text>
              {indikatorToDelete && (
                <Box
                  p={4}
                  borderRadius="md"
                  bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                  border="1px"
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                >
                  <VStack align="start" spacing={2}>
                    <Text fontWeight="medium">
                      {indikatorToDelete.indikator}
                    </Text>
                    {indikatorToDelete.satuanIndikator && (
                      <Badge
                        colorScheme="blue"
                        borderRadius="full"
                        px={3}
                        py={1}
                      >
                        {indikatorToDelete.satuanIndikator.satuan}
                      </Badge>
                    )}
                  </VStack>
                </Box>
              )}
              <Text
                fontSize="sm"
                color="red.500"
                fontWeight="medium"
                fontStyle="italic"
              >
                Tindakan ini tidak dapat dibatalkan!
              </Text>
            </VStack>
          </ModalBody>
          <Divider />
          <ModalFooter>
            <Button mr={3} variant="ghost" onClick={handleHapusClose}>
              Batal
            </Button>
            <Button colorScheme="red" onClick={handleDelete}>
              Hapus
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </LayoutPerencanaan>
  );
}

export default Indikator;
