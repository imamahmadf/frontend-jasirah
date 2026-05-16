import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../Componets/Layout";
import ReactPaginate from "react-paginate";
import { BsFileEarmarkArrowDown } from "react-icons/bs";
import "../../Style/pagination.css";
import { Link, useHistory } from "react-router-dom";
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
  Container,
  FormControl,
  FormLabel,
  Center,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Heading,
  SimpleGrid,
  Th,
  Td,
  Tfoot,
  Divider,
  Flex,
  Textarea,
  Tooltip,
  Input,
  Spacer,
  useToast,
  useColorMode,
  VStack,
  Checkbox,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Badge,
  Icon,
} from "@chakra-ui/react";
import {
  Select as Select2,
  CreatableSelect,
  AsyncSelect,
} from "chakra-react-select";
import { useDisclosure } from "@chakra-ui/react";
import { BsEyeFill } from "react-icons/bs";
import {
  FaFileAlt,
  FaCalendarAlt,
  FaDollarSign,
  FaBoxes,
  FaBuilding,
  FaInfoCircle,
  FaPlus,
  FaList,
  FaTag,
  FaCheckCircle,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { MdDescription, MdAttachMoney, MdInventory2 } from "react-icons/md";
import { useSelector } from "react-redux";
import { userRedux, selectRole } from "../../Redux/Reducers/auth";
import LayoutAset from "../../Componets/Aset/LayoutAset";
function DetailSP(props) {
  const [dataDokumen, setDataDokumen] = useState([]);
  const history = useHistory();
  const [dataJenisBarjas, setDataJenisBarjas] = useState(null);
  const [dataJenisDokumen, setDataJenisDokumen] = useState(null);
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const [jenisDokumenId, setJenisDokumenId] = useState(null);
  const [tanggal, setTanggal] = useState("");
  const [dokumenTanggalEdit, setDokumenTanggalEdit] = useState(null);
  const [tanggalEditValue, setTanggalEditValue] = useState("");
  const [isSavingTanggal, setIsSavingTanggal] = useState(false);
  const [daftarBarjas, setDaftarBarjas] = useState([
    {
      jenisBarjasId: null,
      nama: "",
      harga: 0,
      jumlah: 1,
      SPId: props.match.params.id,
    },
  ]);
  const user = useSelector(userRedux);
  const role = useSelector(selectRole);
  const {
    isOpen: isTambahOpen,
    onOpen: onTambahOpen,
    onClose: onTambahClose,
  } = useDisclosure();
  const {
    isOpen: isPilihBarjasOpen,
    onOpen: onPilihBarjasOpen,
    onClose: onPilihBarjasClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const {
    isOpen: isEditTanggalOpen,
    onOpen: onEditTanggalOpen,
    onClose: onEditTanggalClose,
  } = useDisclosure();
  const [selectedBarjas, setSelectedBarjas] = useState([]);
  const [itemToDelete, setItemToDelete] = useState(null);

  const toDateInputValue = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  };

  const openEditTanggal = (dokumen) => {
    setDokumenTanggalEdit(dokumen);
    setTanggalEditValue(toDateInputValue(dokumen?.tanggal));
    onEditTanggalOpen();
  };

  const closeEditTanggal = () => {
    if (isSavingTanggal) return;
    onEditTanggalClose();
    setDokumenTanggalEdit(null);
    setTanggalEditValue("");
  };

  const submitEditTanggal = () => {
    if (!dokumenTanggalEdit?.id) {
      toast({
        title: "Error!",
        description: "Data dokumen tidak valid",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    if (!tanggalEditValue) {
      toast({
        title: "Error!",
        description: "Tanggal surat wajib diisi",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsSavingTanggal(true);
    axios
      .post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/barjas/edit/dokumen`,
        {
          id: dokumenTanggalEdit.id,
          tanggal: tanggalEditValue,
        },
      )
      .then((res) => {
        toast({
          title: "Berhasil!",
          description: "Tanggal surat berhasil diupdate.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        fetchDataDokumen();
        closeEditTanggal();
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error!",
          description:
            err.response?.data?.message || "Gagal mengupdate tanggal",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      })
      .finally(() => setIsSavingTanggal(false));
  };

  async function fetchDataDokumen() {
    await axios
      .get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/barjas/get/dokumen/${
          props.match.params.id
        }`,
      )
      .then((res) => {
        setDataDokumen(res.data.result);

        console.log(res.data.result);
      })
      .catch((err) => {
        console.error(err);
      });
  }
  const handlePilihBarjas = () => {
    // Validasi form sebelum membuka modal
    if (!jenisDokumenId) {
      toast({
        title: "Error!",
        description: "Pilih jenis surat terlebih dahulu",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    if (!tanggal) {
      toast({
        title: "Error!",
        description: "Pilih tanggal terlebih dahulu",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    // Reset selected barjas dan buka modal
    setSelectedBarjas([]);
    onPilihBarjasOpen();
  };

  const isBarjasSelected = (barjasId) =>
    selectedBarjas.some((b) => b.id === barjasId);

  const getBarjasJumlah = (barjasId) => {
    const found = selectedBarjas.find((b) => b.id === barjasId);
    return found?.jumlah ?? 1;
  };

  const setBarjasJumlah = (barjasId, jumlah) => {
    setSelectedBarjas((prev) =>
      prev.map((b) => (b.id === barjasId ? { ...b, jumlah } : b)),
    );
  };

  const handleToggleBarjas = (barjasId, defaultJumlah = 1) => {
    setSelectedBarjas((prev) => {
      if (prev.some((b) => b.id === barjasId)) {
        return prev.filter((b) => b.id !== barjasId);
      } else {
        return [...prev, { id: barjasId, jumlah: defaultJumlah }];
      }
    });
  };

  const handleSelectAllBarjas = () => {
    if (selectedBarjas.length === (dataDokumen?.barjas?.length || 0)) {
      setSelectedBarjas([]);
    } else {
      setSelectedBarjas(
        (dataDokumen?.barjas || []).map((item) => ({
          id: item.id,
          jumlah: Number(item?.jumlah || 1),
        })),
      );
    }
  };

  const tambahDokumen = () => {
    if (selectedBarjas.length === 0) {
      toast({
        title: "Error!",
        description: "Pilih minimal satu barang dan jasa",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/barjas/post/tambah-dokumen`,
        {
          SPId: props.match.params.id,
          jenisDokumenBarjasId: jenisDokumenId,
          tanggal,
          indukUnitKerjaId: user[0]?.unitKerja_profile?.indukUnitKerja?.id,
          barjasData: selectedBarjas.map((b) => ({
            barjasId: b.id,
            jumlah: b.jumlah,
          })),
        },
      )
      .then((res) => {
        console.log(res.status, res.data, "tessss");
        toast({
          title: "Berhasil!",
          description: "Pengajuan berhasil dikirim.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        fetchDataDokumen();
        onPilihBarjasClose();
        setSelectedBarjas([]);
        setJenisDokumenId(null);
        setTanggal("");
      })
      .catch((err) => {
        console.error(err.message);
        toast({
          title: "Error!",
          description: "Data Kendaraan Tidak Ditemukan",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
  };

  const tambahBarjas = () => {
    axios
      .post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/barjas/post/barjas`,
        {
          data: daftarBarjas,
        },
      )
      .then((res) => {
        console.log(res.status, res.data, "tessss");
        toast({
          title: "Berhasil!",
          description: "Pengajuan berhasil dikirim.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        fetchDataDokumen();
        setDaftarBarjas([
          {
            jenisBarjasId: null,
            nama: "",
            harga: 0,
            jumlah: 1,
            SPId: props.match.params.id,
          },
        ]);
      })
      .catch((err) => {
        console.error(err.message);
        toast({
          title: "Error!",
          description: "Data Kendaraan Tidak Ditemukan",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
  };

  async function fetchSeed() {
    await axios
      .get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/barjas/get/seed-detail`,
      )
      .then((res) => {
        setDataJenisBarjas(res.data.resultJenisBarjas);
        setDataJenisDokumen(res.data.resultJenisDokumenBarjas);

        console.log(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  useEffect(() => {
    fetchDataDokumen();
    fetchSeed();
  }, []);

  const handleBarjasChange = (index, field, value) => {
    setDaftarBarjas((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addBarjasRow = () => {
    setDaftarBarjas((prev) => [
      ...prev,
      {
        jenisBarjasId: null,
        nama: "",
        harga: 0,
        jumlah: 1,
        SPId: props.match.params.id,
      },
    ]);
  };

  const removeBarjasRow = (index) => {
    setDaftarBarjas((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteBarjas = (item) => {
    setItemToDelete(item);
    onDeleteOpen();
  };

  const confirmDeleteBarjas = () => {
    if (!itemToDelete) return;

    axios
      .post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/barjas/delete/barjas`,
        {
          id: itemToDelete.id,
        },
      )
      .then((res) => {
        toast({
          title: "Berhasil!",
          description: "Item berhasil dihapus.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        fetchDataDokumen();
        onDeleteClose();
        setItemToDelete(null);
      })
      .catch((err) => {
        console.error(err.message);
        toast({
          title: "Error!",
          description: err.response?.data?.message || "Gagal menghapus item",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
  };
  const formatRupiah = (value) => {
    if (value === null || value === undefined || isNaN(value)) return "";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const parseRupiah = (str) => {
    if (!str) return 0;
    const onlyDigits = str.toString().replace(/[^0-9]/g, "");
    return onlyDigits ? parseInt(onlyDigits, 10) : 0;
  };
  const formatTanggalIndo = (iso) => {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (_) {
      return iso;
    }
  };
  const totalBerjalan = (daftarBarjas || []).reduce(
    (sum, it) => sum + Number(it?.harga || 0) * Number(it?.jumlah || 0),
    0,
  );

  // Hitung statistik
  const totalDokumen = dataDokumen?.dokumenBarjas?.length || 0;
  const totalItemBarjas = dataDokumen?.barjas?.length || 0;
  const totalNominal = (dataDokumen?.barjas || []).reduce(
    (sum, it) => sum + Number(it?.harga || 0) * Number(it?.jumlah || 0),
    0,
  );
  const totalJumlahBarang = (dataDokumen?.barjas || []).reduce(
    (sum, it) => sum + Number(it?.jumlah || 0),
    0,
  );

  return (
    <>
      <LayoutAset>
        {/* Bagian 1: Informasi Surat Pesanan */}
        <Box pb={{ base: 8, md: 12 }} position="relative">
          <Container
            bgColor={colorMode === "dark" ? "gray.900" : "white"}
            maxW="1280px"
            p={{ base: 4, md: 8 }}
            borderRadius={"12px"}
          >
            {/* Section Header */}
            <Box mb={10}>
              <Flex align="center" gap={4}>
                <Box
                  bgColor="aset"
                  color="white"
                  w="56px"
                  h="56px"
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontWeight="bold"
                  fontSize="2xl"
                  boxShadow="xl"
                  flexShrink={0}
                >
                  1
                </Box>
                <Box flex={1}>
                  <Heading
                    size="xl"
                    color={colorMode === "dark" ? "white" : "gray.800"}
                    mb={2}
                  >
                    Informasi Surat Pesanan
                  </Heading>
                  <Text color="gray.500" fontSize="md">
                    Ringkasan dan statistik surat Pesanan
                  </Text>
                </Box>
              </Flex>
            </Box>
            {/* Statistik Ringkas */}
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
              <Box
                bgColor={colorMode === "dark" ? "gray.700" : "gray.50"}
                p={4}
                borderRadius="12px"
                borderLeft="4px solid"
                borderColor="aset"
                boxShadow="sm"
              >
                <Stat>
                  <StatLabel fontSize="xs" color="gray.600">
                    <Icon as={FaFileAlt} mr={1} color="aset" />
                    Total Dokumen
                  </StatLabel>
                  <StatNumber
                    fontSize="2xl"
                    color={colorMode === "dark" ? "white" : "gray.800"}
                  >
                    {totalDokumen}
                  </StatNumber>
                  <StatHelpText fontSize="xs" color="gray.500">
                    Dokumen Barjas
                  </StatHelpText>
                </Stat>
              </Box>
              <Box
                bgColor={colorMode === "dark" ? "gray.700" : "gray.50"}
                p={4}
                borderRadius="12px"
                borderLeft="4px solid"
                borderColor="aset"
                boxShadow="sm"
              >
                <Stat>
                  <StatLabel fontSize="xs" color="gray.600">
                    <Icon as={MdInventory2} mr={1} color="aset" />
                    Total Item
                  </StatLabel>
                  <StatNumber
                    fontSize="2xl"
                    color={colorMode === "dark" ? "white" : "gray.800"}
                  >
                    {totalItemBarjas}
                  </StatNumber>
                  <StatHelpText fontSize="xs" color="gray.500">
                    Barang & Jasa
                  </StatHelpText>
                </Stat>
              </Box>
              <Box
                bgColor={colorMode === "dark" ? "gray.700" : "gray.50"}
                p={4}
                borderRadius="12px"
                borderLeft="4px solid"
                borderColor="aset"
                boxShadow="sm"
              >
                <Stat>
                  <StatLabel fontSize="xs" color="gray.600">
                    <Icon as={FaBoxes} mr={1} color="aset" />
                    Jumlah Barang
                  </StatLabel>
                  <StatNumber
                    fontSize="2xl"
                    color={colorMode === "dark" ? "white" : "gray.800"}
                  >
                    {totalJumlahBarang.toLocaleString("id-ID")}
                  </StatNumber>
                  <StatHelpText fontSize="xs" color="gray.500">
                    Total Unit
                  </StatHelpText>
                </Stat>
              </Box>
              <Box
                bgColor={colorMode === "dark" ? "gray.700" : "gray.50"}
                p={4}
                borderRadius="12px"
                borderLeft="4px solid"
                borderColor="aset"
                boxShadow="sm"
              >
                <Stat>
                  <StatLabel fontSize="xs" color="gray.600">
                    <Icon as={MdAttachMoney} mr={1} color="aset" />
                    Total Nominal
                  </StatLabel>
                  <StatNumber
                    fontSize="lg"
                    color={colorMode === "dark" ? "white" : "gray.800"}
                  >
                    {formatRupiah(totalNominal).replace("Rp", "").trim()}
                  </StatNumber>
                  <StatHelpText fontSize="xs" color="gray.500">
                    Nilai Total
                  </StatHelpText>
                </Stat>
              </Box>
            </SimpleGrid>

            {/* Ringkasan Surat Card */}
            <Box
              bgColor={colorMode === "dark" ? "gray.800" : "white"}
              p={{ base: 4, md: 6 }}
              borderRadius="12px"
              boxShadow="md"
              mb={6}
              borderLeft="4px solid"
              borderColor="aset"
            >
              <Flex align="center" mb={4}>
                <Icon as={FaInfoCircle} color="aset" mr={2} boxSize={5} />
                <Heading size="md" color="aset">
                  Informasi Surat Pesanan
                </Heading>
              </Flex>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Box
                  p={3}
                  borderRadius="8px"
                  bgColor={colorMode === "dark" ? "gray.700" : "gray.50"}
                >
                  <Flex align="center" mb={2}>
                    <Icon as={FaFileAlt} color="aset" mr={2} />
                    <Text
                      fontSize="xs"
                      color="gray.600"
                      fontWeight="semibold"
                      textTransform="uppercase"
                    >
                      Nomor Surat
                    </Text>
                  </Flex>
                  <Text
                    fontSize="lg"
                    fontWeight="bold"
                    color={colorMode === "dark" ? "white" : "gray.800"}
                  >
                    {dataDokumen?.nomor || "-"}
                  </Text>
                </Box>
                <Box
                  p={3}
                  borderRadius="8px"
                  bgColor={colorMode === "dark" ? "gray.700" : "gray.50"}
                >
                  <Flex align="center" mb={2}>
                    <Icon as={FaCalendarAlt} color="aset" mr={2} />
                    <Text
                      fontSize="xs"
                      color="gray.600"
                      fontWeight="semibold"
                      textTransform="uppercase"
                    >
                      Tanggal Surat
                    </Text>
                  </Flex>
                  <Text
                    fontSize="lg"
                    fontWeight="bold"
                    color={colorMode === "dark" ? "white" : "gray.800"}
                  >
                    {formatTanggalIndo(dataDokumen?.tanggal)}
                  </Text>
                </Box>
                <Box
                  p={3}
                  borderRadius="8px"
                  bgColor={colorMode === "dark" ? "gray.700" : "gray.50"}
                >
                  <Flex align="center" mb={2}>
                    <Icon as={FaTag} color="aset" mr={2} />
                    <Text
                      fontSize="xs"
                      color="gray.600"
                      fontWeight="semibold"
                      textTransform="uppercase"
                    >
                      Akun Belanja
                    </Text>
                  </Flex>
                  <Text
                    fontSize="lg"
                    fontWeight="bold"
                    color={colorMode === "dark" ? "white" : "gray.800"}
                  >
                    {dataDokumen?.akunBelanja?.akun || "-"}
                  </Text>
                </Box>
                <Box
                  p={3}
                  borderRadius="8px"
                  bgColor={colorMode === "dark" ? "gray.700" : "gray.50"}
                >
                  <Flex align="center" mb={2}>
                    <Icon as={MdDescription} color="aset" mr={2} />
                    <Text
                      fontSize="xs"
                      color="gray.600"
                      fontWeight="semibold"
                      textTransform="uppercase"
                    >
                      Sub Kegiatan
                    </Text>
                  </Flex>
                  <Text
                    fontSize="md"
                    fontWeight="semibold"
                    color={colorMode === "dark" ? "white" : "gray.800"}
                    noOfLines={2}
                  >
                    {dataDokumen?.subKegPer?.nama || "-"}
                  </Text>
                </Box>
                <Box
                  gridColumn={{ base: "1 / -1", md: "1 / -1" }}
                  p={3}
                  borderRadius="8px"
                  bgColor={colorMode === "dark" ? "gray.700" : "gray.50"}
                >
                  <Flex align="center" mb={2}>
                    <Icon as={FaBuilding} color="aset" mr={2} />
                    <Text
                      fontSize="xs"
                      color="gray.600"
                      fontWeight="semibold"
                      textTransform="uppercase"
                    >
                      Unit Kerja
                    </Text>
                  </Flex>
                  <Text
                    fontSize="md"
                    fontWeight="semibold"
                    color={colorMode === "dark" ? "white" : "gray.800"}
                  >
                    {dataDokumen?.subKegPer?.daftarUnitKerja?.unitKerja || "-"}
                  </Text>
                </Box>
              </SimpleGrid>
            </Box>
          </Container>
        </Box>

        {/* Bagian 2: Input Barang dan Jasa + Daftar Barang dan Jasa */}
        <Box
          bgColor={"secondary"}
          pb={{ base: 8, md: 12 }}
          px={{ base: 4, md: "30px" }}
          pt={{ base: 8, md: 12 }}
          position="relative"
        >
          <Container
            bgColor={colorMode === "dark" ? "gray.900" : "white"}
            maxW="1280px"
            borderRadius={"12px"}
            p={{ base: 8, md: 12 }}
          >
            {/* Section Header */}
            <Box mb={10}>
              <Flex align="center" gap={4}>
                <Box
                  bgColor="aset"
                  color="white"
                  w="56px"
                  h="56px"
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontWeight="bold"
                  fontSize="2xl"
                  boxShadow="xl"
                  flexShrink={0}
                >
                  2
                </Box>
                <Box flex={1}>
                  <Heading
                    size="xl"
                    color={colorMode === "dark" ? "white" : "gray.800"}
                    mb={2}
                  >
                    Input dan Daftar Barang Jasa
                  </Heading>
                  <Text color="gray.500" fontSize="md">
                    Input dan kelola daftar barang dan jasa
                  </Text>
                </Box>
              </Flex>
            </Box>
            {/* Form Input Barang dan Jasa */}
            <Box
              bgColor={colorMode === "dark" ? "gray.800" : "white"}
              p={{ base: 4, md: 6 }}
              borderRadius="12px"
              boxShadow="md"
              mb={6}
              borderTop="4px solid"
              borderColor="aset"
            >
              <Flex align="center" mb={4}>
                <Icon as={MdInventory2} color="aset" mr={2} boxSize={5} />
                <Heading size="md" color="aset">
                  Input Barang dan Jasa
                </Heading>
              </Flex>

              {daftarBarjas.map((item, index) => (
                <Box
                  key={index}
                  mt={index > 0 ? 4 : 0}
                  p={4}
                  borderWidth="2px"
                  borderRadius="12px"
                  borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                  bg={colorMode === "dark" ? "gray.700" : "terang"}
                >
                  <Flex align="center" mb={4} justify="space-between">
                    <Flex align="center">
                      <Badge
                        colorScheme="gray"
                        variant="subtle"
                        mr={2}
                        fontSize="md"
                        p={2}
                        borderRadius="md"
                      >
                        Item {index + 1}
                      </Badge>
                    </Flex>
                  </Flex>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="medium" mb={2}>
                        Jenis Barang dan Jasa
                      </FormLabel>
                      <Select2
                        value={
                          item.jenisBarjasId
                            ? {
                                value: item.jenisBarjasId,
                                label:
                                  dataJenisBarjas?.find(
                                    (v) => v.id === item.jenisBarjasId,
                                  )?.jenis || "",
                              }
                            : null
                        }
                        options={dataJenisBarjas?.map((val) => ({
                          value: val.id,
                          label: `${val.jenis}`,
                        }))}
                        placeholder="Pilih jenis..."
                        focusBorderColor="aset"
                        onChange={(selectedOption) => {
                          handleBarjasChange(
                            index,
                            "jenisBarjasId",
                            selectedOption?.value || null,
                          );
                        }}
                        components={{
                          DropdownIndicator: () => null,
                          IndicatorSeparator: () => null,
                        }}
                        chakraStyles={{
                          container: (provided) => ({
                            ...provided,
                            borderRadius: "8px",
                          }),
                          control: (provided) => ({
                            ...provided,
                            backgroundColor:
                              colorMode === "dark" ? "gray.600" : "white",
                            border: "1px solid",
                            borderColor:
                              colorMode === "dark" ? "gray.500" : "gray.200",
                            height: "48px",
                            _hover: {
                              borderColor: "aset",
                            },
                            minHeight: "48px",
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
                      <FormLabel fontSize="sm" fontWeight="medium" mb={2}>
                        Nama Barang dan Jasa
                      </FormLabel>
                      <Input
                        bgColor={colorMode === "dark" ? "gray.600" : "white"}
                        height="48px"
                        type="text"
                        value={item.nama}
                        onChange={(e) =>
                          handleBarjasChange(index, "nama", e.target.value)
                        }
                        borderRadius="8px"
                        border="1px solid"
                        borderColor={
                          colorMode === "dark" ? "gray.500" : "gray.200"
                        }
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="medium" mb={2}>
                        Jumlah
                      </FormLabel>
                      <Input
                        bgColor={colorMode === "dark" ? "gray.600" : "white"}
                        height="48px"
                        type="text"
                        inputMode="numeric"
                        value={item.jumlah ?? 0}
                        onChange={(e) => {
                          const digits = e.target.value
                            .toString()
                            .replace(/[^0-9]/g, "");
                          const parsed = digits ? parseInt(digits, 10) : 0;
                          handleBarjasChange(index, "jumlah", parsed);
                        }}
                        borderRadius="8px"
                        border="1px solid"
                        borderColor={
                          colorMode === "dark" ? "gray.500" : "gray.200"
                        }
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="medium" mb={2}>
                        Harga Satuan
                      </FormLabel>
                      <Input
                        bgColor={colorMode === "dark" ? "gray.600" : "white"}
                        height="48px"
                        type="text"
                        inputMode="numeric"
                        value={formatRupiah(item.harga)}
                        onChange={(e) => {
                          const parsed = parseRupiah(e.target.value);
                          handleBarjasChange(index, "harga", parsed);
                        }}
                        borderRadius="8px"
                        border="1px solid"
                        borderColor={
                          colorMode === "dark" ? "gray.500" : "gray.200"
                        }
                      />
                    </FormControl>
                  </SimpleGrid>

                  {daftarBarjas.length > 1 && (
                    <Flex mt={4} justify="flex-end">
                      <Button
                        variant="danger"
                        onClick={() => removeBarjasRow(index)}
                        size="sm"
                      >
                        Hapus Item
                      </Button>
                    </Flex>
                  )}
                </Box>
              ))}

              <Divider my={6} />
              <Flex
                gap={3}
                flexWrap="wrap"
                justify="space-between"
                align="center"
              >
                <Button
                  onClick={addBarjasRow}
                  variant="secondary"
                  flex={{ base: "1 1 100%", md: "0 1 auto" }}
                  leftIcon={<Icon as={FaPlus} />}
                >
                  Tambah Item Baru
                </Button>
                <Flex
                  gap={2}
                  flex={{ base: "1 1 100%", md: "0 1 auto" }}
                  justify="flex-end"
                >
                  {daftarBarjas.length > 0 && (
                    <Badge
                      colorScheme="gray"
                      variant="subtle"
                      fontSize="md"
                      p={2}
                      borderRadius="md"
                      alignSelf="center"
                    >
                      Total: {formatRupiah(totalBerjalan)}
                    </Badge>
                  )}
                  <Button
                    variant="primary"
                    onClick={tambahBarjas}
                    flex={{ base: "1 1 100%", md: "0 1 auto" }}
                  >
                    Simpan Semua Item
                  </Button>
                </Flex>
              </Flex>
            </Box>

            {/* Tabel Daftar Barang dan Jasa */}
            <Box
              bgColor={colorMode === "dark" ? "gray.800" : "white"}
              p={{ base: 4, md: 6 }}
              borderRadius="12px"
              boxShadow="md"
              overflowX="auto"
              borderTop="4px solid"
              borderColor="aset"
            >
              <Flex align="center" justify="space-between" mb={4}>
                <Flex align="center">
                  <Icon as={FaList} color="aset" mr={2} boxSize={5} />
                  <Heading size="md" color="aset">
                    Daftar Barang dan Jasa
                  </Heading>
                </Flex>
                {totalItemBarjas > 0 && (
                  <Badge
                    colorScheme="gray"
                    variant="subtle"
                    fontSize="md"
                    p={2}
                    borderRadius="md"
                  >
                    {totalItemBarjas} Item
                  </Badge>
                )}
              </Flex>
              <Table variant="aset" size="sm">
                <Thead>
                  <Tr>
                    <Th>No</Th>
                    <Th>Nama</Th>
                    <Th>Jenis</Th>
                    <Th isNumeric>Jumlah</Th>
                    <Th isNumeric>Harga Satuan</Th>
                    <Th isNumeric>Subtotal</Th>
                    <Th>Aksi</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {dataDokumen?.barjas?.length > 0 ? (
                    dataDokumen.barjas.map((item, index) => (
                      <Tr key={item.id}>
                        <Td>{index + 1}</Td>
                        <Td>{item?.nama || "-"}</Td>
                        <Td>{item?.jenisBarja?.jenis || "-"}</Td>
                        <Td isNumeric>
                          {Number(item?.jumlah || 0).toLocaleString("id-ID")}
                        </Td>
                        <Td isNumeric>
                          {formatRupiah(Number(item?.harga || 0))}
                        </Td>
                        <Td isNumeric fontWeight="semibold">
                          {formatRupiah(
                            Number(item?.harga || 0) *
                              Number(item?.jumlah || 0),
                          )}
                        </Td>
                        <Td>
                          <Button
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleDeleteBarjas(item)}
                            leftIcon={<Icon as={FaTrash} />}
                          >
                            Hapus
                          </Button>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={7} textAlign="center" py={8}>
                        <VStack spacing={2}>
                          <Icon
                            as={MdInventory2}
                            boxSize={10}
                            color="gray.400"
                          />
                          <Text
                            color="gray.500"
                            fontSize="md"
                            fontWeight="medium"
                          >
                            Belum ada data barang dan jasa
                          </Text>
                          <Text color="gray.400" fontSize="sm">
                            Tambahkan barang dan jasa menggunakan form di atas
                          </Text>
                        </VStack>
                      </Td>
                    </Tr>
                  )}
                </Tbody>
                <Tfoot>
                  <Tr>
                    <Td
                      colSpan={6}
                      textAlign="right"
                      fontWeight="bold"
                      fontSize="md"
                    >
                      Total
                    </Td>
                    <Td
                      isNumeric
                      fontWeight="bold"
                      fontSize="lg"
                      color="aset"
                      bgColor={colorMode === "dark" ? "gray.700" : "gray.50"}
                    >
                      {formatRupiah(
                        (dataDokumen?.barjas || []).reduce(
                          (sum, it) =>
                            sum +
                            Number(it?.harga || 0) * Number(it?.jumlah || 0),
                          0,
                        ),
                      )}
                    </Td>
                  </Tr>
                </Tfoot>
              </Table>
            </Box>
          </Container>
        </Box>

        {/* Bagian 3: Tambah Dokumen Barang dan Jasa + Daftar Dokumen */}
        <Box py={{ base: 8, md: 12 }} position="relative">
          <Container
            borderRadius={"12px"}
            bgColor={colorMode === "dark" ? "gray.900" : "white"}
            maxW="1280px"
            p={{ base: 4, md: 8 }}
          >
            {/* Section Header */}
            <Box mb={10}>
              <Flex align="center" gap={4}>
                <Box
                  bgColor="aset"
                  color="white"
                  w="56px"
                  h="56px"
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontWeight="bold"
                  fontSize="2xl"
                  boxShadow="xl"
                  flexShrink={0}
                >
                  3
                </Box>
                <Box flex={1}>
                  <Heading
                    size="xl"
                    color={colorMode === "dark" ? "white" : "gray.800"}
                    mb={2}
                  >
                    Dokumen Barang dan Jasa
                  </Heading>
                  <Text color="gray.500" fontSize="md">
                    Kelola dan tambahkan dokumen barang dan jasa
                  </Text>
                </Box>
              </Flex>
            </Box>
            {/* Form Tambah Dokumen */}
            <Box
              bgColor={colorMode === "dark" ? "gray.800" : "white"}
              p={{ base: 4, md: 6 }}
              borderRadius="12px"
              boxShadow="md"
              mb={6}
              borderTop="4px solid"
              borderColor="aset"
            >
              <Flex align="center" mb={4}>
                <Icon as={FaPlus} color="aset" mr={2} boxSize={5} />
                <Heading size="md" color="aset">
                  Tambah Dokumen Barang dan Jasa
                </Heading>
              </Flex>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel fontSize="md" fontWeight="medium" mb={2}>
                    Jenis Surat
                  </FormLabel>
                  <Select2
                    options={dataJenisDokumen?.map((val) => ({
                      value: val.id,
                      label: `${val.jenis}`,
                    }))}
                    placeholder="Pilih jenis surat..."
                    focusBorderColor="aset"
                    onChange={(selectedOption) => {
                      setJenisDokumenId(selectedOption.value);
                    }}
                    components={{
                      DropdownIndicator: () => null,
                      IndicatorSeparator: () => null,
                    }}
                    chakraStyles={{
                      container: (provided) => ({
                        ...provided,
                        borderRadius: "8px",
                      }),
                      control: (provided) => ({
                        ...provided,
                        backgroundColor:
                          colorMode === "dark" ? "gray.700" : "terang",
                        border: "1px solid",
                        borderColor:
                          colorMode === "dark" ? "gray.600" : "gray.200",
                        height: "48px",
                        _hover: {
                          borderColor: "aset",
                        },
                        minHeight: "48px",
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
                  <FormLabel fontSize="md" fontWeight="medium" mb={2}>
                    Tanggal
                  </FormLabel>
                  <Input
                    bgColor={colorMode === "dark" ? "gray.700" : "terang"}
                    height="48px"
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    borderRadius="8px"
                    border="1px solid"
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                  />
                </FormControl>
              </SimpleGrid>
              <Button
                onClick={handlePilihBarjas}
                variant="primary"
                mt={4}
                w={{ base: "full", md: "auto" }}
                leftIcon={<Icon as={FaPlus} />}
              >
                Tambah Dokumen
              </Button>
            </Box>

            {/* Daftar Dokumen Card */}
            <Box>
              <Flex align="center" justify="space-between" mb={4}>
                <Flex align="center">
                  <Icon as={FaList} color="aset" mr={2} boxSize={5} />
                  <Heading size="md" color="aset">
                    Daftar Dokumen
                  </Heading>
                </Flex>
                {totalDokumen > 0 && (
                  <Badge
                    colorScheme="gray"
                    variant="subtle"
                    fontSize="md"
                    p={2}
                    borderRadius="md"
                  >
                    {totalDokumen} Dokumen
                  </Badge>
                )}
              </Flex>
              {dataDokumen?.dokumenBarjas?.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {dataDokumen.dokumenBarjas.map((item, index) => {
                    const totalJumlahBarang = (
                      item?.itemDokumenBarjas || []
                    ).reduce((sum, it) => sum + Number(it?.jumlah || 0), 0);
                    const totalNominal = (item?.itemDokumenBarjas || []).reduce(
                      (sum, it) =>
                        sum +
                        Number(it?.jumlah || 0) * Number(it?.barja?.harga || 0),
                      0,
                    );
                    return (
                      <Box
                        key={item.id}
                        bgColor={colorMode === "dark" ? "gray.800" : "white"}
                        p={4}
                        borderRadius="12px"
                        boxShadow="md"
                        borderLeft="4px solid"
                        borderColor="aset"
                        _hover={{
                          boxShadow: "lg",
                          transform: "translateY(-2px)",
                          transition: "all 0.2s",
                        }}
                      >
                        <Flex justify="space-between" align="start" mb={3}>
                          <Badge
                            colorScheme="gray"
                            variant="subtle"
                            fontSize="sm"
                            p={1}
                          >
                            {item?.jenisDokumenBarja?.jenis || "-"}
                          </Badge>
                          <Badge
                            colorScheme="gray"
                            variant="solid"
                            fontSize="xs"
                          >
                            #{index + 1}
                          </Badge>
                        </Flex>

                        <VStack align="stretch" spacing={3}>
                          <Box>
                            <Text fontSize="xs" color="gray.600" mb={1}>
                              Nomor Dokumen
                            </Text>
                            <Text fontSize="md" fontWeight="semibold">
                              {item?.nomor || "-"}
                            </Text>
                          </Box>

                          <SimpleGrid columns={2} spacing={3}>
                            <Box>
                              <Flex
                                align="center"
                                justify="space-between"
                                mb={1}
                              >
                                <Text fontSize="xs" color="gray.600">
                                  Tanggal Surat
                                </Text>
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  color="aset"
                                  leftIcon={<Icon as={FaEdit} />}
                                  onClick={() => openEditTanggal(item)}
                                >
                                  Edit
                                </Button>
                              </Flex>
                              <Text fontSize="sm">
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
                              </Text>
                            </Box>
                            <Box>
                              <Text fontSize="xs" color="gray.600" mb={1}>
                                Tanggal Input
                              </Text>
                              <Text fontSize="sm">
                                {item?.createdAt
                                  ? new Date(
                                      item?.createdAt,
                                    ).toLocaleDateString("id-ID", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : "-"}
                              </Text>
                            </Box>
                          </SimpleGrid>

                          <Divider />

                          <SimpleGrid columns={3} spacing={2}>
                            <Box>
                              <Text fontSize="xs" color="gray.600" mb={1}>
                                Jumlah Item
                              </Text>
                              <Text
                                fontSize="lg"
                                fontWeight="bold"
                                color="aset"
                              >
                                {item?.itemDokumenBarjas?.length || 0}
                              </Text>
                            </Box>
                            <Box>
                              <Text fontSize="xs" color="gray.600" mb={1}>
                                Jumlah Barang
                              </Text>
                              <Text
                                fontSize="lg"
                                fontWeight="bold"
                                color="aset"
                              >
                                {totalJumlahBarang.toLocaleString("id-ID")}
                              </Text>
                            </Box>
                            <Box>
                              <Text fontSize="xs" color="gray.600" mb={1}>
                                Nominal
                              </Text>
                              <Text
                                fontSize="sm"
                                fontWeight="bold"
                                color="aset"
                              >
                                {formatRupiah(totalNominal)}
                              </Text>
                            </Box>
                          </SimpleGrid>

                          {item?.itemDokumenBarjas?.length > 0 && (
                            <>
                              <Divider />
                              <Box>
                                <Text fontSize="xs" color="gray.600" mb={2}>
                                  Rincian Item
                                </Text>
                                <VStack align="stretch" spacing={1}>
                                  {item.itemDokumenBarjas.map((it, idx) => {
                                    const nama = it?.barja?.nama ?? "-";
                                    const qty = Number(
                                      it?.jumlah || 0,
                                    ).toLocaleString("id-ID");
                                    return (
                                      <Text
                                        key={idx}
                                        fontSize="xs"
                                        color="gray.700"
                                        noOfLines={1}
                                      >
                                        • {nama} ({qty})
                                      </Text>
                                    );
                                  })}
                                </VStack>
                              </Box>
                            </>
                          )}
                        </VStack>
                      </Box>
                    );
                  })}
                </SimpleGrid>
              ) : (
                <Box
                  bgColor={colorMode === "dark" ? "gray.800" : "white"}
                  p={8}
                  borderRadius="12px"
                  boxShadow="md"
                  textAlign="center"
                >
                  <VStack spacing={2}>
                    <Icon as={FaFileAlt} boxSize={10} color="gray.400" />
                    <Text color="gray.500" fontSize="md" fontWeight="medium">
                      Belum ada dokumen
                    </Text>
                    <Text color="gray.400" fontSize="sm">
                      Tambahkan dokumen baru menggunakan form di atas
                    </Text>
                  </VStack>
                </Box>
              )}
            </Box>
          </Container>
        </Box>
      </LayoutAset>

      {/* Modal Edit Tanggal Surat */}
      <Modal
        isOpen={isEditTanggalOpen}
        onClose={closeEditTanggal}
        isCentered
        size="md"
      >
        <ModalOverlay />
        <ModalContent bgColor={colorMode === "dark" ? "gray.800" : "white"}>
          <ModalHeader>Edit Tanggal Surat</ModalHeader>
          <ModalCloseButton isDisabled={isSavingTanggal} />
          <ModalBody pb={6}>
            <VStack align="stretch" spacing={3}>
              <Box>
                <Text fontSize="sm" color="gray.600">
                  Nomor Dokumen
                </Text>
                <Text fontSize="md" fontWeight="semibold">
                  {dokumenTanggalEdit?.nomor || "-"}
                </Text>
              </Box>
              <FormControl>
                <FormLabel>Tanggal Surat</FormLabel>
                <Input
                  type="date"
                  value={tanggalEditValue}
                  onChange={(e) => setTanggalEditValue(e.target.value)}
                  isDisabled={isSavingTanggal}
                  bgColor={colorMode === "dark" ? "gray.700" : "terang"}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={closeEditTanggal}
              isDisabled={isSavingTanggal}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={submitEditTanggal}
              isLoading={isSavingTanggal}
              loadingText="Menyimpan"
            >
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Pilih Barjas */}
      <Modal
        isOpen={isPilihBarjasOpen}
        onClose={onPilihBarjasClose}
        size="4xl"
        isCentered
      >
        <ModalOverlay />
        <ModalContent
          bgColor={colorMode === "dark" ? "gray.800" : "white"}
          maxH="90vh"
        >
          <ModalHeader>
            <Flex align="center">
              <Icon as={FaList} color="aset" mr={2} boxSize={5} />
              <Heading size="md" color="aset">
                Pilih Barang dan Jasa
              </Heading>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6} overflowY="auto">
            {dataDokumen?.barjas?.length > 0 ? (
              <>
                <Flex
                  mb={4}
                  justifyContent="space-between"
                  alignItems="center"
                  flexWrap="wrap"
                  gap={2}
                >
                  <Badge
                    colorScheme="gray"
                    variant="subtle"
                    p={2}
                    borderRadius="md"
                  >
                    <Icon as={FaInfoCircle} mr={1} />
                    Pilih barang dan jasa yang akan ditambahkan ke dokumen
                  </Badge>
                  <Checkbox
                    isChecked={
                      selectedBarjas.length === dataDokumen.barjas.length &&
                      dataDokumen.barjas.length > 0
                    }
                    onChange={handleSelectAllBarjas}
                    colorScheme="green"
                    size="lg"
                  >
                    Pilih Semua
                  </Checkbox>
                </Flex>
                <Box
                  borderWidth="1px"
                  borderRadius="8px"
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                  overflowX="auto"
                >
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th width="50px">
                          <Checkbox
                            isChecked={
                              selectedBarjas.length ===
                                dataDokumen.barjas.length &&
                              dataDokumen.barjas.length > 0
                            }
                            onChange={handleSelectAllBarjas}
                            colorScheme="green"
                          />
                        </Th>
                        <Th>No</Th>
                        <Th>Nama</Th>
                        <Th>Jenis</Th>
                        <Th isNumeric>Jumlah</Th>
                        <Th isNumeric>Jumlah Dipilih</Th>
                        <Th isNumeric>Harga Satuan</Th>
                        <Th isNumeric>Subtotal</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {dataDokumen.barjas.map((item, index) => (
                        <Tr
                          key={item.id}
                          bgColor={
                            isBarjasSelected(item.id)
                              ? colorMode === "dark"
                                ? "gray.700"
                                : "gray.50"
                              : "transparent"
                          }
                          _hover={{
                            bgColor:
                              colorMode === "dark" ? "gray.700" : "gray.50",
                          }}
                          cursor="pointer"
                          onClick={() =>
                            handleToggleBarjas(
                              item.id,
                              Number(item?.jumlah || 1),
                            )
                          }
                        >
                          <Td onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              isChecked={isBarjasSelected(item.id)}
                              onChange={() =>
                                handleToggleBarjas(
                                  item.id,
                                  Number(item?.jumlah || 1),
                                )
                              }
                              colorScheme="green"
                            />
                          </Td>
                          <Td>{index + 1}</Td>
                          <Td fontWeight="medium">{item?.nama || "-"}</Td>
                          <Td>{item?.jenisBarja?.jenis || "-"}</Td>
                          <Td isNumeric>
                            {Number(item?.jumlah || 0).toLocaleString("id-ID")}
                          </Td>
                          <Td isNumeric onClick={(e) => e.stopPropagation()}>
                            <Input
                              height="32px"
                              maxW="100px"
                              type="text"
                              inputMode="numeric"
                              value={getBarjasJumlah(item.id)}
                              onChange={(e) => {
                                const digits = e.target.value
                                  .toString()
                                  .replace(/[^0-9]/g, "");
                                const parsed = digits
                                  ? parseInt(digits, 10)
                                  : 0;
                                if (isBarjasSelected(item.id)) {
                                  setBarjasJumlah(item.id, parsed);
                                } else {
                                  handleToggleBarjas(item.id, parsed || 1);
                                }
                              }}
                              isDisabled={!isBarjasSelected(item.id)}
                            />
                          </Td>
                          <Td isNumeric>
                            {formatRupiah(Number(item?.harga || 0))}
                          </Td>
                          <Td isNumeric fontWeight="semibold">
                            {formatRupiah(
                              Number(item?.harga || 0) *
                                Number(item?.jumlah || 0),
                            )}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
                <Box
                  mt={4}
                  p={4}
                  bgColor={colorMode === "dark" ? "gray.700" : "gray.50"}
                  borderRadius="8px"
                  borderLeft="4px solid"
                  borderColor="aset"
                >
                  <Flex
                    align="center"
                    justify="space-between"
                    flexWrap="wrap"
                    gap={2}
                  >
                    <Text fontSize="md" fontWeight="semibold">
                      <Icon as={FaCheckCircle} color="aset" mr={2} />
                      Barang dan Jasa Terpilih:{" "}
                      <Badge
                        colorScheme="gray"
                        variant="subtle"
                        fontSize="md"
                        ml={2}
                      >
                        {selectedBarjas.length} dari {dataDokumen.barjas.length}
                      </Badge>
                    </Text>
                    {selectedBarjas.length > 0 && (
                      <Text fontSize="sm" color="gray.600">
                        Total:{" "}
                        {formatRupiah(
                          selectedBarjas.reduce((sum, b) => {
                            const item = dataDokumen.barjas.find(
                              (bar) => bar.id === b.id,
                            );
                            return (
                              sum +
                              Number(item?.harga || 0) * Number(b.jumlah || 0)
                            );
                          }, 0),
                        )}
                      </Text>
                    )}
                  </Flex>
                </Box>
              </>
            ) : (
              <Center py={8}>
                <VStack spacing={3}>
                  <Icon as={MdInventory2} boxSize={12} color="gray.400" />
                  <Text color="gray.500" fontSize="md" fontWeight="medium">
                    Belum ada data barang dan jasa
                  </Text>
                  <Text color="gray.400" fontSize="sm" textAlign="center">
                    Tambahkan barang dan jasa terlebih dahulu melalui form Input
                    Barang dan Jasa
                  </Text>
                </VStack>
              </Center>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onPilihBarjasClose}>
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={tambahDokumen}
              isDisabled={selectedBarjas.length === 0}
              leftIcon={<Icon as={FaPlus} />}
            >
              Simpan ({selectedBarjas.length})
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Konfirmasi Hapus Barjas */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered>
        <ModalOverlay />
        <ModalContent
          bgColor={colorMode === "dark" ? "gray.800" : "white"}
          borderRadius="12px"
        >
          <ModalHeader>
            <Flex align="center">
              <Icon as={FaTrash} color="red.500" mr={2} boxSize={5} />
              <Heading size="md">Konfirmasi Hapus</Heading>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text mb={4}>Apakah Anda yakin ingin menghapus item berikut?</Text>
            {itemToDelete && (
              <Box
                p={4}
                bgColor={colorMode === "dark" ? "gray.700" : "gray.50"}
                borderRadius="8px"
                mb={4}
              >
                <VStack align="stretch" spacing={2}>
                  <Box>
                    <Text fontSize="xs" color="gray.600" mb={1}>
                      Nama Barang/Jasa
                    </Text>
                    <Text fontSize="md" fontWeight="semibold">
                      {itemToDelete?.nama || "-"}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.600" mb={1}>
                      Jenis
                    </Text>
                    <Text fontSize="sm">
                      {itemToDelete?.jenisBarja?.jenis || "-"}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.600" mb={1}>
                      Jumlah
                    </Text>
                    <Text fontSize="sm">
                      {Number(itemToDelete?.jumlah || 0).toLocaleString(
                        "id-ID",
                      )}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.600" mb={1}>
                      Subtotal
                    </Text>
                    <Text fontSize="sm" fontWeight="semibold" color="aset">
                      {formatRupiah(
                        Number(itemToDelete?.harga || 0) *
                          Number(itemToDelete?.jumlah || 0),
                      )}
                    </Text>
                  </Box>
                </VStack>
              </Box>
            )}
            <Text fontSize="sm" color="red.500" fontWeight="medium">
              Tindakan ini tidak dapat dibatalkan.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>
              Batal
            </Button>
            <Button
              colorScheme="red"
              onClick={confirmDeleteBarjas}
              leftIcon={<Icon as={FaTrash} />}
            >
              Hapus
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default DetailSP;
