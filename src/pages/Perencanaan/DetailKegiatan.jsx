import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { userRedux } from "../../Redux/Reducers/auth";
import LayoutPerencanaan from "../../Componets/perencanaan/LayoutPerencanaan";
import {
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Heading,
  Text,
  VStack,
  useColorMode,
  Button,
  Flex,
  Spacer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  useDisclosure,
  useToast,
  Select,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Icon,
  HStack,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Center,
} from "@chakra-ui/react";
import { Link, useHistory } from "react-router-dom";
import {
  FaArrowLeft,
  FaChartLine,
  FaFileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaPaperclip,
  FaEdit,
  FaDollarSign,
  FaCalendarAlt,
  FaBuilding,
  FaTag,
  FaUser,
} from "react-icons/fa";
import Loading from "../../Componets/Loading";
import { formatRupiah, parseRupiah } from "../../utils/formatRupiah";
function DetailKegiatan(props) {
  const [DataSubKegiatan, setDataSubKegiatan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { colorMode } = useColorMode();
  const history = useHistory();
  const [bulan, setBulan] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [selectedIndikator, setSelectedIndikator] = useState(null);
  const [selectedCapaian, setSelectedCapaian] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [nilai, setNilai] = useState("");
  const [anggaran, setAnggaran] = useState("");
  const [bukti, setBukti] = useState("");
  const [errors, setErrors] = useState({});
  const toast = useToast();
  const user = useSelector(userRedux);

  // Fungsi untuk memeriksa apakah user memiliki unitKerjaId yang sama dengan indikator
  const canInputCapaian = (indikator) => {
    if (!user || !user[0] || !indikator) return false;

    const userUnitKerjaId =
      user[0]?.unitKerja_profile?.id ||
      user[0]?.unitKerja_profile?.indukUnitKerja?.id;
    const indikatorUnitKerjaId =
      indikator?.unitKerjaId || indikator?.daftarUnitKerja?.id;

    // Jika ada daftarUnitKerja, bandingkan dengan id atau nama
    if (indikator?.daftarUnitKerja) {
      // Bandingkan dengan id jika ada
      if (indikator.daftarUnitKerja.id) {
        return (
          userUnitKerjaId &&
          indikator.daftarUnitKerja.id &&
          userUnitKerjaId === indikator.daftarUnitKerja.id
        );
      }
      // Jika tidak ada id, bandingkan dengan nama unit kerja
      if (typeof indikator.daftarUnitKerja.unitKerja === "string") {
        const userUnitKerjaNama =
          user[0]?.unitKerja_profile?.nama ||
          user[0]?.unitKerja_profile?.indukUnitKerja?.nama;
        return userUnitKerjaNama === indikator.daftarUnitKerja.unitKerja;
      }
    }

    // Fallback: bandingkan dengan unitKerjaId langsung
    return (
      userUnitKerjaId &&
      indikatorUnitKerjaId &&
      userUnitKerjaId === indikatorUnitKerjaId
    );
  };

  // Fungsi untuk memeriksa apakah capaian bisa diedit (status pengajuan atau ditolak)
  const canEditCapaian = (capaian) => {
    if (!capaian) return false;
    const status = (capaian.status || "").toLowerCase();
    return status === "pengajuan" || status === "ditolak";
  };
  async function fetchSuratPesanan() {
    try {
      setIsLoading(true);
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/perencanaan/get/detail-kegiatan/${props.match.params.id}`
      );
      setDataSubKegiatan(res.data.result || null);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Gagal memuat data kegiatan",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const resetForm = () => {
    setNilai("");
    setAnggaran("");
    setBulan("");
    setBukti("");
    setErrors({});
    setSelectedIndikator(null);
    setSelectedCapaian(null);
    setIsEditMode(false);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!nilai || isNaN(parseInt(nilai)) || parseInt(nilai) <= 0) {
      newErrors.nilai = "Nilai target harus diisi dan lebih dari 0";
    }
    if (!anggaran || isNaN(parseInt(anggaran)) || parseInt(anggaran) < 0) {
      newErrors.anggaran = "Anggaran harus diisi dan tidak boleh negatif";
    }
    if (!bulan) {
      newErrors.bulan = "Bulan harus dipilih";
    }
    if (!bukti.trim()) {
      newErrors.bukti = "Link bukti harus diisi";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  async function handleSubmit() {
    if (!selectedTarget) return;
    if (!validateForm()) return;

    // Validasi: cek apakah user memiliki unitKerjaId yang sama dengan indikator
    if (!selectedIndikator || !canInputCapaian(selectedIndikator)) {
      toast({
        title: "Akses Ditolak",
        description:
          "Anda tidak memiliki akses untuk menginput capaian pada indikator ini. Hanya user dengan unit kerja yang sama yang dapat menginput capaian.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    // Jika mode edit
    if (isEditMode && selectedCapaian) {
      try {
        await axios.post(
          `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/capaian/edit/${
            selectedCapaian.id
          }`,
          {
            ...selectedCapaian,
            nilai: parseInt(nilai),
            bulan: parseInt(bulan),
            anggaran: parseInt(anggaran),
            bukti: bukti.trim(),
          }
        );
        toast({
          title: "Berhasil",
          description: "Capaian berhasil diperbarui",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        resetForm();
        onEditClose();
        fetchSuratPesanan(); // refresh data
      } catch (err) {
        console.error(err);
        toast({
          title: "Gagal",
          description:
            err.response?.data?.message || "Terjadi kesalahan saat memperbarui",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
      return;
    }

    // Validasi: cek apakah capaian untuk bulan ini sudah ada
    const bulanDipilih = parseInt(bulan);
    const bulanNama = bulanList.find((b) => b.angka === bulanDipilih)?.nama;
    const capaianSudahAda = selectedTarget.capaians?.find(
      (c) => c.bulan === bulanDipilih
    );

    if (capaianSudahAda) {
      toast({
        title: "Gagal",
        description: `Capaian untuk bulan ${bulanNama} sudah ada. Tidak dapat menambahkan capaian baru untuk bulan yang sama.`,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/capaian/post`,
        {
          targetId: selectedTarget.id,
          nilai: parseInt(nilai),
          bulan: parseInt(bulan),
          anggaran: parseInt(anggaran),
          bukti: bukti.trim(),
        }
      );
      toast({
        title: "Berhasil",
        description: "Capaian berhasil disimpan",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      resetForm();
      onClose();
      fetchSuratPesanan(); // refresh data
    } catch (err) {
      console.error(err);
      toast({
        title: "Gagal",
        description:
          err.response?.data?.message || "Terjadi kesalahan saat menyimpan",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }

  // Fungsi untuk membuka modal edit
  const handleEditCapaian = (capaian, target, indikator) => {
    if (!canEditCapaian(capaian)) {
      toast({
        title: "Tidak dapat diedit",
        description:
          "Capaian ini tidak dapat diedit karena statusnya sudah disetujui.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!canInputCapaian(indikator)) {
      toast({
        title: "Akses Ditolak",
        description:
          "Anda tidak memiliki akses untuk mengedit capaian pada indikator ini.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    setSelectedCapaian(capaian);
    setSelectedTarget(target);
    setSelectedIndikator(indikator);
    setNilai(capaian.nilai?.toString() || "");
    setAnggaran(capaian.anggaran?.toString() || "");
    setBulan(capaian.bulan?.toString() || "");
    setBukti(capaian.bukti || "");
    setIsEditMode(true);
    onEditOpen();
  };

  const bulanList = [
    { nama: "Januari", angka: 1 },
    { nama: "Februari", angka: 2 },
    { nama: "Maret", angka: 3 },
    { nama: "April", angka: 4 },
    { nama: "Mei", angka: 5 },
    { nama: "Juni", angka: 6 },
    { nama: "Juli", angka: 7 },
    { nama: "Agustus", angka: 8 },
    { nama: "September", angka: 9 },
    { nama: "Oktober", angka: 10 },
    { nama: "November", angka: 11 },
    { nama: "Desember", angka: 12 },
  ];

  useEffect(() => {
    fetchSuratPesanan();
  }, []);

  if (isLoading) {
    return (
      <LayoutPerencanaan>
        <Loading />
      </LayoutPerencanaan>
    );
  }

  if (!DataSubKegiatan) {
    return (
      <LayoutPerencanaan>
        <Box
          bgGradient={
            colorMode === "dark"
              ? "linear(to-b, gray.800, gray.900)"
              : "linear(to-b, blue.50, gray.50)"
          }
          minH="100vh"
          py={12}
          px={{ base: 4, md: 6, lg: 8 }}
          w="100%"
        >
          <Box w="100%">
            <Center py={12}>
              <VStack spacing={6}>
                <Box
                  p={6}
                  borderRadius="full"
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  boxShadow="xl"
                >
                  <Icon as={FaFileAlt} boxSize={16} color="gray.400" />
                </Box>
                <Text fontSize="xl" color="gray.500" fontWeight="medium">
                  Data kegiatan tidak ditemukan
                </Text>
                <Button
                  leftIcon={<FaArrowLeft />}
                  colorScheme="blue"
                  size="lg"
                  onClick={() => history.push("/perencanaan/daftar-program")}
                >
                  Kembali ke Daftar Program
                </Button>
              </VStack>
            </Center>
          </Box>
        </Box>
      </LayoutPerencanaan>
    );
  }

  return (
    <LayoutPerencanaan>
      <Box
        bgGradient={
          colorMode === "dark"
            ? "linear(to-b, gray.800, gray.900)"
            : "linear(to-b, blue.50, gray.50)"
        }
        minH="100vh"
        w="100%"
        py={{ base: 6, md: 8 }}
        px={{ base: 4, md: 6, lg: 8 }}
      >
        <Box w="100%">
          {/* Breadcrumb */}
          <Box mb={6}>
            <Breadcrumb
              fontSize="sm"
              fontWeight="medium"
              color={colorMode === "dark" ? "gray.400" : "gray.600"}
            >
              <BreadcrumbItem>
                <BreadcrumbLink
                  as={Link}
                  to="/perencanaan/daftar-program"
                  color="blue.500"
                  _hover={{ color: "blue.600", textDecoration: "underline" }}
                >
                  Daftar Program
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <Text color={colorMode === "dark" ? "gray.300" : "gray.500"}>
                  Detail Kegiatan
                </Text>
              </BreadcrumbItem>
            </Breadcrumb>
          </Box>

          {/* Header Section */}
          <Card
            w="100%"
            mb={8}
            bg={colorMode === "dark" ? "gray.800" : "white"}
            boxShadow="2xl"
            borderRadius="xl"
            border="1px"
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            overflow="hidden"
            position="relative"
            _before={{
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              bgGradient: "linear(to-r, blue.400, blue.600)",
            }}
          >
            <CardBody p={{ base: 6, md: 8 }}>
              <Flex
                direction={{ base: "column", md: "row" }}
                align={{ base: "start", md: "center" }}
                justify="space-between"
                gap={4}
              >
                <Box flex="1">
                  <HStack mb={3} spacing={3}>
                    <Box
                      p={2}
                      borderRadius="lg"
                      bg={colorMode === "dark" ? "blue.900" : "blue.100"}
                    >
                      <Icon as={FaFileAlt} color="blue.500" boxSize={6} />
                    </Box>
                    <Heading
                      size="lg"
                      color={colorMode === "dark" ? "white" : "gray.800"}
                      fontWeight="bold"
                    >
                      {DataSubKegiatan.kode} - {DataSubKegiatan.nama}
                    </Heading>
                  </HStack>
                  {DataSubKegiatan.indikators && (
                    <HStack spacing={2} mt={2}>
                      <Badge
                        colorScheme="blue"
                        fontSize="sm"
                        px={3}
                        py={1}
                        borderRadius="full"
                      >
                        {DataSubKegiatan.indikators.length} Indikator
                      </Badge>
                    </HStack>
                  )}
                </Box>
                <Button
                  leftIcon={<FaArrowLeft />}
                  colorScheme="blue"
                  variant="outline"
                  size="md"
                  onClick={() => history.push("/perencanaan/daftar-program")}
                  _hover={{
                    transform: "translateX(-4px)",
                    transition: "all 0.2s",
                  }}
                >
                  Kembali
                </Button>
              </Flex>
            </CardBody>
          </Card>

          {/* Indikator List */}
          {DataSubKegiatan.indikators &&
          DataSubKegiatan.indikators.length > 0 ? (
            <VStack align="stretch" spacing={6}>
              {DataSubKegiatan.indikators.map((indikator, index) => (
                <Card
                  key={indikator.id}
                  w="100%"
                  bg={colorMode === "dark" ? "gray.800" : "white"}
                  boxShadow="xl"
                  borderRadius="xl"
                  overflow="hidden"
                  border="1px"
                  borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                  transition="all 0.3s"
                  _hover={{
                    transform: "translateY(-4px)",
                    boxShadow: "2xl",
                  }}
                >
                  <CardHeader
                    bg={colorMode === "dark" ? "gray.700" : "blue.50"}
                    borderBottom="2px"
                    borderColor={colorMode === "dark" ? "gray.600" : "blue.200"}
                    py={4}
                    px={6}
                  >
                    <VStack align="stretch" spacing={3}>
                      <HStack spacing={3}>
                        <Box
                          p={2}
                          borderRadius="lg"
                          bg={colorMode === "dark" ? "blue.900" : "blue.100"}
                        >
                          <Icon as={FaChartLine} color="blue.500" boxSize={5} />
                        </Box>
                        <Heading
                          size="md"
                          color={colorMode === "dark" ? "white" : "gray.800"}
                          fontWeight="semibold"
                          flex={1}
                        >
                          {indikator.indikator}
                        </Heading>
                      </HStack>
                      {/* Info Unit Kerja, Satuan, dan Pegawai */}
                      <HStack
                        spacing={4}
                        flexWrap="wrap"
                        fontSize="sm"
                        color={colorMode === "dark" ? "gray.300" : "gray.600"}
                        pl={12}
                      >
                        {/* Satuan Indikator */}
                        {indikator.satuanIndikator && (
                          <HStack spacing={2}>
                            <Icon as={FaTag} color="blue.400" boxSize={4} />
                            <Text>
                              <Text as="span" fontWeight="semibold">
                                Satuan:
                              </Text>{" "}
                              {indikator.satuanIndikator.satuan}
                            </Text>
                          </HStack>
                        )}
                        {/* Unit Kerja */}
                        {indikator.daftarUnitKerja && (
                          <HStack spacing={2}>
                            <Icon
                              as={FaBuilding}
                              color="green.400"
                              boxSize={4}
                            />
                            <Text>
                              <Text as="span" fontWeight="semibold">
                                Unit:
                              </Text>{" "}
                              {indikator.daftarUnitKerja.unitKerja}
                            </Text>
                          </HStack>
                        )}
                        {/* Pegawai */}
                        {indikator.pegawai && (
                          <HStack spacing={2}>
                            <Icon as={FaUser} color="purple.400" boxSize={4} />
                            <Text>
                              <Text as="span" fontWeight="semibold">
                                PIC:
                              </Text>{" "}
                              {indikator.pegawai.nama} ({indikator.pegawai.nip})
                            </Text>
                          </HStack>
                        )}
                      </HStack>
                    </VStack>
                  </CardHeader>
                  <CardBody p={{ base: 4, md: 6 }}>
                    <Box
                      w="100%"
                      overflowX="auto"
                      borderRadius="lg"
                      border="1px"
                      borderColor={
                        colorMode === "dark" ? "gray.600" : "gray.200"
                      }
                      bg={colorMode === "dark" ? "gray.800" : "white"}
                      boxShadow="md"
                    >
                      <Table
                        variant="simple"
                        size="sm"
                        colorScheme={colorMode === "dark" ? "gray" : "blue"}
                        w="100%"
                      >
                        <Thead>
                          <Tr
                            bg={colorMode === "dark" ? "blue.800" : "blue.50"}
                          >
                            <Th
                              rowSpan={2}
                              borderColor={
                                colorMode === "dark" ? "gray.600" : "gray.200"
                              }
                              color={
                                colorMode === "dark" ? "white" : "gray.700"
                              }
                              fontWeight="bold"
                            >
                              Tahun
                            </Th>
                            <Th
                              rowSpan={2}
                              borderColor={
                                colorMode === "dark" ? "gray.600" : "gray.200"
                              }
                              color={
                                colorMode === "dark" ? "white" : "gray.700"
                              }
                              fontWeight="bold"
                            >
                              Anggaran Murni
                            </Th>
                            <Th
                              rowSpan={2}
                              isNumeric
                              borderColor={
                                colorMode === "dark" ? "gray.600" : "gray.200"
                              }
                              color={
                                colorMode === "dark" ? "white" : "gray.700"
                              }
                              fontWeight="bold"
                            >
                              Anggaran Perubahan
                            </Th>
                            <Th
                              rowSpan={2}
                              isNumeric
                              borderColor={
                                colorMode === "dark" ? "gray.600" : "gray.200"
                              }
                              color={
                                colorMode === "dark" ? "white" : "gray.700"
                              }
                              fontWeight="bold"
                            >
                              Target
                            </Th>
                            <Th
                              colSpan={12}
                              textAlign="center"
                              borderColor={
                                colorMode === "dark" ? "gray.600" : "gray.200"
                              }
                              color={
                                colorMode === "dark" ? "white" : "gray.700"
                              }
                              fontWeight="bold"
                              bg={
                                colorMode === "dark" ? "blue.700" : "blue.100"
                              }
                            >
                              Bulan
                            </Th>
                            <Th
                              rowSpan={2}
                              borderColor={
                                colorMode === "dark" ? "gray.600" : "gray.200"
                              }
                              color={
                                colorMode === "dark" ? "white" : "gray.700"
                              }
                              fontWeight="bold"
                            >
                              % Capaian
                            </Th>
                            <Th
                              rowSpan={2}
                              borderColor={
                                colorMode === "dark" ? "gray.600" : "gray.200"
                              }
                              color={
                                colorMode === "dark" ? "white" : "gray.700"
                              }
                              fontWeight="bold"
                            >
                              % Anggaran
                            </Th>
                            <Th
                              rowSpan={2}
                              borderColor={
                                colorMode === "dark" ? "gray.600" : "gray.200"
                              }
                              color={
                                colorMode === "dark" ? "white" : "gray.700"
                              }
                              fontWeight="bold"
                            >
                              Aksi
                            </Th>
                          </Tr>
                          <Tr
                            bg={colorMode === "dark" ? "blue.700" : "blue.100"}
                          >
                            {[...Array(12)].map((_, i) => (
                              <Th
                                key={i}
                                textAlign="center"
                                borderColor={
                                  colorMode === "dark" ? "gray.600" : "gray.200"
                                }
                                color={
                                  colorMode === "dark" ? "white" : "gray.700"
                                }
                                fontWeight="semibold"
                                bg={
                                  colorMode === "dark" ? "blue.600" : "blue.100"
                                }
                              >
                                {i + 1}
                              </Th>
                            ))}
                          </Tr>
                        </Thead>
                        <Tbody>
                          {indikator.targets?.map((t) => {
                            const anggaranMurni = t.tahunAnggarans?.find(
                              (ta) => ta.jenisAnggaranId === 1
                            );
                            const anggaranPerubahan = t.tahunAnggarans?.find(
                              (ta) => ta.jenisAnggaranId === 2
                            );

                            // Total capaian nilai
                            const totalCapaian = t.capaians?.reduce(
                              (sum, c) => sum + (c.nilai || 0),
                              0
                            );

                            // Persentase capaian nilai
                            const persentaseCapaian =
                              t.nilai > 0
                                ? ((totalCapaian / t.nilai) * 100).toFixed(2)
                                : 0;

                            // Total capaian anggaran
                            const totalAnggaranCapaian = t.capaians?.reduce(
                              (sum, c) => sum + (c.anggaran || 0),
                              0
                            );

                            // Acuan anggaran (perubahan > murni)
                            const anggaranAcuan =
                              anggaranPerubahan?.anggaran ||
                              anggaranMurni?.anggaran ||
                              0;

                            // Persentase anggaran
                            const persentaseAnggaran =
                              anggaranAcuan > 0
                                ? (
                                    (totalAnggaranCapaian / anggaranAcuan) *
                                    100
                                  ).toFixed(2)
                                : 0;

                            return (
                              <React.Fragment key={t.id}>
                                <Tr
                                  _hover={{
                                    bg:
                                      colorMode === "dark"
                                        ? "gray.700"
                                        : "gray.50",
                                  }}
                                  transition="all 0.2s"
                                >
                                  <Td
                                    rowSpan={2}
                                    borderColor={
                                      colorMode === "dark"
                                        ? "gray.600"
                                        : "gray.200"
                                    }
                                    fontWeight="semibold"
                                    bg={
                                      colorMode === "dark"
                                        ? "gray.750"
                                        : "gray.50"
                                    }
                                  >
                                    {anggaranMurni?.tahun ||
                                      anggaranPerubahan?.tahun}
                                  </Td>
                                  <Td
                                    rowSpan={2}
                                    isNumeric
                                    borderColor={
                                      colorMode === "dark"
                                        ? "gray.600"
                                        : "gray.200"
                                    }
                                    bg={
                                      colorMode === "dark"
                                        ? "gray.750"
                                        : "gray.50"
                                    }
                                  >
                                    {formatRupiah(anggaranMurni?.anggaran)}
                                  </Td>
                                  <Td
                                    rowSpan={2}
                                    isNumeric
                                    borderColor={
                                      colorMode === "dark"
                                        ? "gray.600"
                                        : "gray.200"
                                    }
                                    bg={
                                      colorMode === "dark"
                                        ? "gray.750"
                                        : "gray.50"
                                    }
                                  >
                                    {formatRupiah(anggaranPerubahan?.anggaran)}
                                  </Td>
                                  <Td
                                    rowSpan={2}
                                    isNumeric
                                    borderColor={
                                      colorMode === "dark"
                                        ? "gray.600"
                                        : "gray.200"
                                    }
                                    bg={
                                      colorMode === "dark"
                                        ? "blue.800"
                                        : "blue.50"
                                    }
                                    fontWeight="semibold"
                                  >
                                    {t.nilai}{" "}
                                    {indikator.satuanIndikator?.satuan || ""}
                                  </Td>
                                  {[...Array(12)].map((_, i) => {
                                    const bulanKe = i + 1;
                                    const capaian = t.capaians?.find(
                                      (c) => c.bulan === bulanKe
                                    );
                                    return (
                                      <Td
                                        key={`nilai-${bulanKe}`}
                                        textAlign="center"
                                        borderColor={
                                          colorMode === "dark"
                                            ? "gray.600"
                                            : "gray.200"
                                        }
                                        bg={
                                          colorMode === "dark"
                                            ? "gray.800"
                                            : "white"
                                        }
                                        _hover={{
                                          bg:
                                            colorMode === "dark"
                                              ? "gray.700"
                                              : "gray.50",
                                        }}
                                        transition="all 0.2s"
                                        p={2}
                                        minW="120px"
                                      >
                                        {capaian ? (
                                          <Box
                                            p={3}
                                            borderRadius="lg"
                                            bg={
                                              colorMode === "dark"
                                                ? "gray.700"
                                                : "gray.50"
                                            }
                                            border="1px"
                                            borderColor={
                                              colorMode === "dark"
                                                ? "gray.600"
                                                : "blue.200"
                                            }
                                            boxShadow="sm"
                                            _hover={{
                                              boxShadow: "md",
                                              borderColor:
                                                colorMode === "dark"
                                                  ? "blue.500"
                                                  : "blue.400",
                                            }}
                                            transition="all 0.2s"
                                          >
                                            <VStack
                                              spacing={2.5}
                                              align="stretch"
                                            >
                                              <Box
                                                textAlign="center"
                                                py={1.5}
                                                px={2}
                                                borderRadius="md"
                                                bg={
                                                  colorMode === "dark"
                                                    ? "blue.600"
                                                    : "blue.500"
                                                }
                                              >
                                                <Text
                                                  fontWeight="bold"
                                                  fontSize="md"
                                                  color="white"
                                                >
                                                  {capaian.nilai}{" "}
                                                  {indikator.satuanIndikator
                                                    ?.satuan || ""}
                                                </Text>
                                              </Box>

                                              <Button
                                                size="xs"
                                                colorScheme="blue"
                                                variant="outline"
                                                onClick={() =>
                                                  window.open(
                                                    capaian.bukti,
                                                    "_blank"
                                                  )
                                                }
                                                isDisabled={!capaian.bukti}
                                                leftIcon={<FaPaperclip />}
                                                _hover={{
                                                  bg: "blue.50",
                                                  borderColor: "blue.400",
                                                }}
                                                transition="all 0.2s"
                                                width="100%"
                                                fontSize="xs"
                                                borderColor={
                                                  colorMode === "dark"
                                                    ? "blue.400"
                                                    : "blue.300"
                                                }
                                              >
                                                Bukti
                                              </Button>

                                              <Badge
                                                colorScheme={
                                                  capaian.status === "pengajuan"
                                                    ? "orange"
                                                    : capaian.status ===
                                                      "disetujui"
                                                    ? "green"
                                                    : capaian.status ===
                                                      "ditolak"
                                                    ? "red"
                                                    : "gray"
                                                }
                                                variant="subtle"
                                                borderRadius="md"
                                                px={2}
                                                py={1}
                                                fontSize="xs"
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"
                                                gap={1.5}
                                                fontWeight="medium"
                                              >
                                                {capaian.status ===
                                                  "pengajuan" && (
                                                  <Icon
                                                    as={FaClock}
                                                    boxSize={2.5}
                                                  />
                                                )}
                                                {capaian.status ===
                                                  "disetujui" && (
                                                  <Icon
                                                    as={FaCheckCircle}
                                                    boxSize={2.5}
                                                  />
                                                )}
                                                {capaian.status ===
                                                  "ditolak" && (
                                                  <Icon
                                                    as={FaTimesCircle}
                                                    boxSize={2.5}
                                                  />
                                                )}
                                                <Text textTransform="capitalize">
                                                  {capaian.status}
                                                </Text>
                                              </Badge>

                                              {canEditCapaian(capaian) &&
                                                canInputCapaian(indikator) && (
                                                  <Button
                                                    size="xs"
                                                    colorScheme="orange"
                                                    variant="solid"
                                                    onClick={() =>
                                                      handleEditCapaian(
                                                        capaian,
                                                        t,
                                                        indikator
                                                      )
                                                    }
                                                    leftIcon={<FaEdit />}
                                                    _hover={{
                                                      bg: "orange.600",
                                                    }}
                                                    transition="all 0.2s"
                                                    width="100%"
                                                    fontSize="xs"
                                                  >
                                                    Edit
                                                  </Button>
                                                )}
                                            </VStack>
                                          </Box>
                                        ) : (
                                          <Text
                                            color={
                                              colorMode === "dark"
                                                ? "gray.400"
                                                : "gray.400"
                                            }
                                            fontSize="sm"
                                            fontStyle="italic"
                                          >
                                            -
                                          </Text>
                                        )}
                                      </Td>
                                    );
                                  })}
                                  <Td
                                    rowSpan={2}
                                    isNumeric
                                    borderColor={
                                      colorMode === "dark"
                                        ? "gray.600"
                                        : "gray.200"
                                    }
                                    bg={
                                      colorMode === "dark"
                                        ? "gray.750"
                                        : "gray.50"
                                    }
                                    fontWeight="semibold"
                                  >
                                    <Box
                                      p={2}
                                      borderRadius="md"
                                      bg={
                                        parseFloat(persentaseCapaian) >= 100
                                          ? colorMode === "dark"
                                            ? "green.800"
                                            : "green.100"
                                          : parseFloat(persentaseCapaian) >= 75
                                          ? colorMode === "dark"
                                            ? "yellow.800"
                                            : "yellow.100"
                                          : colorMode === "dark"
                                          ? "red.800"
                                          : "red.100"
                                      }
                                      border="1px"
                                      borderColor={
                                        parseFloat(persentaseCapaian) >= 100
                                          ? colorMode === "dark"
                                            ? "green.600"
                                            : "green.300"
                                          : parseFloat(persentaseCapaian) >= 75
                                          ? colorMode === "dark"
                                            ? "yellow.600"
                                            : "yellow.300"
                                          : colorMode === "dark"
                                          ? "red.600"
                                          : "red.300"
                                      }
                                    >
                                      <Text
                                        fontSize="sm"
                                        fontWeight="bold"
                                        color={
                                          parseFloat(persentaseCapaian) >= 100
                                            ? colorMode === "dark"
                                              ? "green.200"
                                              : "green.700"
                                            : parseFloat(persentaseCapaian) >=
                                              75
                                            ? colorMode === "dark"
                                              ? "yellow.200"
                                              : "yellow.700"
                                            : colorMode === "dark"
                                            ? "red.200"
                                            : "red.700"
                                        }
                                      >
                                        {persentaseCapaian}%
                                      </Text>
                                    </Box>
                                  </Td>
                                  <Td
                                    rowSpan={2}
                                    isNumeric
                                    borderColor={
                                      colorMode === "dark"
                                        ? "gray.600"
                                        : "gray.200"
                                    }
                                    bg={
                                      colorMode === "dark"
                                        ? "gray.750"
                                        : "gray.50"
                                    }
                                    fontWeight="semibold"
                                  >
                                    <Box
                                      p={2}
                                      borderRadius="md"
                                      bg={
                                        parseFloat(persentaseAnggaran) >= 100
                                          ? colorMode === "dark"
                                            ? "green.800"
                                            : "green.100"
                                          : parseFloat(persentaseAnggaran) >= 75
                                          ? colorMode === "dark"
                                            ? "yellow.800"
                                            : "yellow.100"
                                          : colorMode === "dark"
                                          ? "red.800"
                                          : "red.100"
                                      }
                                      border="1px"
                                      borderColor={
                                        parseFloat(persentaseAnggaran) >= 100
                                          ? colorMode === "dark"
                                            ? "green.600"
                                            : "green.300"
                                          : parseFloat(persentaseAnggaran) >= 75
                                          ? colorMode === "dark"
                                            ? "yellow.600"
                                            : "yellow.300"
                                          : colorMode === "dark"
                                          ? "red.600"
                                          : "red.300"
                                      }
                                    >
                                      <Text
                                        fontSize="sm"
                                        fontWeight="bold"
                                        color={
                                          parseFloat(persentaseAnggaran) >= 100
                                            ? colorMode === "dark"
                                              ? "green.200"
                                              : "green.700"
                                            : parseFloat(persentaseAnggaran) >=
                                              75
                                            ? colorMode === "dark"
                                              ? "yellow.200"
                                              : "yellow.700"
                                            : colorMode === "dark"
                                            ? "red.200"
                                            : "red.700"
                                        }
                                      >
                                        {persentaseAnggaran}%
                                      </Text>
                                    </Box>
                                  </Td>
                                  <Td
                                    rowSpan={2}
                                    borderColor={
                                      colorMode === "dark"
                                        ? "gray.600"
                                        : "gray.200"
                                    }
                                    bg={
                                      colorMode === "dark"
                                        ? "gray.750"
                                        : "gray.50"
                                    }
                                  >
                                    <Button
                                      size="sm"
                                      colorScheme="blue"
                                      variant="solid"
                                      onClick={() => {
                                        if (!canInputCapaian(indikator)) {
                                          toast({
                                            title: "Akses Ditolak",
                                            description:
                                              "Anda tidak memiliki akses untuk menginput capaian pada indikator ini. Hanya user dengan unit kerja yang sama yang dapat menginput capaian.",
                                            status: "error",
                                            duration: 4000,
                                            isClosable: true,
                                          });
                                          return;
                                        }
                                        setSelectedTarget(t);
                                        setSelectedIndikator(indikator);
                                        setIsEditMode(false);
                                        onOpen();
                                      }}
                                      leftIcon={<FaEdit />}
                                      width="100%"
                                      fontSize="xs"
                                      isDisabled={!canInputCapaian(indikator)}
                                    >
                                      Input Capaian
                                    </Button>
                                  </Td>
                                </Tr>
                                <Tr>
                                  {[...Array(12)].map((_, i) => {
                                    const bulanKe = i + 1;
                                    const capaian = t.capaians?.find(
                                      (c) => c.bulan === bulanKe
                                    );
                                    return (
                                      <Td
                                        key={`anggaran-${bulanKe}`}
                                        isNumeric
                                        borderColor={
                                          colorMode === "dark"
                                            ? "gray.600"
                                            : "gray.200"
                                        }
                                        bg={
                                          colorMode === "dark"
                                            ? "gray.750"
                                            : "gray.50"
                                        }
                                        color={
                                          capaian && capaian.anggaran
                                            ? colorMode === "dark"
                                              ? "gray.100"
                                              : "gray.700"
                                            : colorMode === "dark"
                                            ? "gray.400"
                                            : "gray.400"
                                        }
                                        fontWeight={
                                          capaian && capaian.anggaran
                                            ? "medium"
                                            : "normal"
                                        }
                                        fontStyle={
                                          capaian && capaian.anggaran
                                            ? "normal"
                                            : "italic"
                                        }
                                      >
                                        {formatRupiah(
                                          capaian && capaian.anggaran
                                            ? capaian.anggaran
                                            : null
                                        )}
                                      </Td>
                                    );
                                  })}
                                </Tr>
                              </React.Fragment>
                            );
                          })}
                        </Tbody>
                      </Table>
                    </Box>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          ) : (
            <Card
              w="100%"
              bg={colorMode === "dark" ? "gray.800" : "white"}
              boxShadow="xl"
              borderRadius="xl"
              border="1px"
              borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            >
              <CardBody>
                <Center py={12}>
                  <VStack spacing={6}>
                    <Box
                      p={6}
                      borderRadius="full"
                      bg={colorMode === "dark" ? "gray.700" : "gray.100"}
                    >
                      <Icon as={FaChartLine} boxSize={12} color="gray.400" />
                    </Box>
                    <Text fontSize="lg" color="gray.500" fontWeight="medium">
                      Belum ada indikator untuk kegiatan ini
                    </Text>
                  </VStack>
                </Center>
              </CardBody>
            </Card>
          )}
        </Box>
      </Box>

      {/* Modal Input Capaian */}
      <Modal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          resetForm();
          setSelectedTarget(null);
        }}
        size="lg"
        isCentered
      >
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderRadius="xl"
        >
          <ModalHeader>
            <HStack>
              <Icon as={FaEdit} color="blue.500" />
              <Text>Input Capaian</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <Divider />
          <ModalBody py={6}>
            <VStack spacing={5} align="stretch">
              <FormControl isInvalid={!!errors.bulan}>
                <FormLabel>
                  <HStack>
                    <Icon as={FaCalendarAlt} color="gray.500" boxSize={4} />
                    <Text>Bulan</Text>
                  </HStack>
                </FormLabel>
                <Select
                  placeholder="Pilih bulan"
                  value={bulan}
                  onChange={(e) => {
                    setBulan(e.target.value);
                    setErrors({ ...errors, bulan: "" });
                  }}
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                  isDisabled={isEditMode}
                >
                  {bulanList
                    .filter((b) => {
                      // Filter bulan yang belum ada capaiannya (hanya untuk mode input baru)
                      if (isEditMode) return true;
                      if (!selectedTarget?.capaians) return true;
                      return !selectedTarget.capaians.find(
                        (c) => c.bulan === b.angka
                      );
                    })
                    .map((b) => (
                      <option key={b.angka} value={b.angka}>
                        {b.nama}
                      </option>
                    ))}
                </Select>
                <FormErrorMessage>{errors.bulan}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.nilai}>
                <FormLabel>
                  <HStack>
                    <Icon as={FaChartLine} color="gray.500" boxSize={4} />
                    <Text>Nilai Target</Text>
                  </HStack>
                </FormLabel>
                <Input
                  type="number"
                  placeholder="Masukkan nilai target"
                  value={nilai}
                  onChange={(e) => {
                    setNilai(e.target.value);
                    setErrors({ ...errors, nilai: "" });
                  }}
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                />
                <FormErrorMessage>{errors.nilai}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.anggaran}>
                <FormLabel>
                  <HStack>
                    <Icon as={FaDollarSign} color="gray.500" boxSize={4} />
                    <Text>Anggaran</Text>
                  </HStack>
                </FormLabel>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="Masukkan anggaran (contoh: Rp 1.000.000)"
                  value={formatRupiah(anggaran)}
                  onChange={(e) => {
                    const parsed = parseRupiah(e.target.value);
                    setAnggaran(parsed.toString());
                    setErrors({ ...errors, anggaran: "" });
                  }}
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                />
                <FormErrorMessage>{errors.anggaran}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.bukti}>
                <FormLabel>
                  <HStack>
                    <Icon as={FaPaperclip} color="gray.500" boxSize={4} />
                    <Text>Link Bukti</Text>
                  </HStack>
                </FormLabel>
                <Input
                  type="url"
                  placeholder="Masukkan link bukti"
                  value={bukti}
                  onChange={(e) => {
                    setBukti(e.target.value);
                    setErrors({ ...errors, bukti: "" });
                  }}
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                />
                <FormErrorMessage>{errors.bukti}</FormErrorMessage>
              </FormControl>
            </VStack>
          </ModalBody>
          <Divider />
          <ModalFooter>
            <Button
              mr={3}
              variant="ghost"
              onClick={() => {
                onClose();
                resetForm();
              }}
            >
              Batal
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              leftIcon={<FaCheckCircle />}
            >
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Edit Capaian */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => {
          onEditClose();
          resetForm();
        }}
        size="lg"
        isCentered
      >
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderRadius="xl"
        >
          <ModalHeader>
            <HStack>
              <Icon as={FaEdit} color="orange.500" />
              <Text>Edit Capaian</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <Divider />
          <ModalBody py={6}>
            <VStack spacing={5} align="stretch">
              <FormControl isInvalid={!!errors.bulan}>
                <FormLabel>
                  <HStack>
                    <Icon as={FaCalendarAlt} color="gray.500" boxSize={4} />
                    <Text>Bulan</Text>
                  </HStack>
                </FormLabel>
                <Select
                  value={bulan}
                  isDisabled
                  bg={colorMode === "dark" ? "gray.700" : "gray.100"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                  opacity={0.7}
                >
                  {bulanList.map((b) => (
                    <option key={b.angka} value={b.angka}>
                      {b.nama}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.bulan}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.nilai}>
                <FormLabel>
                  <HStack>
                    <Icon as={FaChartLine} color="gray.500" boxSize={4} />
                    <Text>Nilai Target</Text>
                  </HStack>
                </FormLabel>
                <Input
                  type="number"
                  placeholder="Masukkan nilai target"
                  value={nilai}
                  onChange={(e) => {
                    setNilai(e.target.value);
                    setErrors({ ...errors, nilai: "" });
                  }}
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                />
                <FormErrorMessage>{errors.nilai}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.anggaran}>
                <FormLabel>
                  <HStack>
                    <Icon as={FaDollarSign} color="gray.500" boxSize={4} />
                    <Text>Anggaran</Text>
                  </HStack>
                </FormLabel>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="Masukkan anggaran (contoh: Rp 1.000.000)"
                  value={formatRupiah(anggaran)}
                  onChange={(e) => {
                    const parsed = parseRupiah(e.target.value);
                    setAnggaran(parsed.toString());
                    setErrors({ ...errors, anggaran: "" });
                  }}
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                />
                <FormErrorMessage>{errors.anggaran}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.bukti}>
                <FormLabel>
                  <HStack>
                    <Icon as={FaPaperclip} color="gray.500" boxSize={4} />
                    <Text>Link Bukti</Text>
                  </HStack>
                </FormLabel>
                <Input
                  type="url"
                  placeholder="Masukkan link bukti"
                  value={bukti}
                  onChange={(e) => {
                    setBukti(e.target.value);
                    setErrors({ ...errors, bukti: "" });
                  }}
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                />
                <FormErrorMessage>{errors.bukti}</FormErrorMessage>
              </FormControl>
            </VStack>
          </ModalBody>
          <Divider />
          <ModalFooter>
            <Button
              mr={3}
              variant="ghost"
              onClick={() => {
                onEditClose();
                resetForm();
              }}
            >
              Batal
            </Button>
            <Button
              colorScheme="orange"
              onClick={handleSubmit}
              leftIcon={<FaCheckCircle />}
            >
              Perbarui
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </LayoutPerencanaan>
  );
}

export default DetailKegiatan;
