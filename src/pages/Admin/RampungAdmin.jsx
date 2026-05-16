import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../Componets/Layout";
import { useDisclosure } from "@chakra-ui/react";
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Center,
  Td,
  Flex,
  Textarea,
  Input,
  Spacer,
  useToast,
  FormControl,
  FormLabel,
  Select,
  HStack,
  VStack,
  Heading,
  Badge,
  Divider,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardHeader,
  IconButton,
  Tooltip,
  Alert,
  AlertIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
} from "@chakra-ui/react";
import { BsImage, BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Loading from "../../Componets/Loading";
import { useSelector } from "react-redux";
import {
  selectIsAuthenticated,
  userRedux,
  selectRole,
} from "../../Redux/Reducers/auth";

function RampungAdmin(props) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isGalleryOpen,
    onOpen: onGalleryOpen,
    onClose: onGalleryClose,
  } = useDisclosure();
  const {
    isOpen: isUndanganOpen,
    onOpen: onUndanganOpen,
    onClose: onUndanganClose,
  } = useDisclosure();
  const {
    isOpen: isModalNonaktifOpen,
    onOpen: onModalNonaktifOpen,
    onClose: onModalNonaktifClose,
  } = useDisclosure();
  const toast = useToast();
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [detailPerjalanan, setDetailPerjalanan] = useState([]);
  const [isModalBatalOpen, setIsModalBatalOpen] = useState(false);
  const [alasanBatal, setAlasanBatal] = useState("");
  const [listDalamKotaNonaktif, setListDalamKotaNonaktif] = useState([]);
  const [dataTemplate, setDataTemplate] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const user = useSelector(userRedux);
  const [templateId, setTemplateId] = useState(null);

  // Debug modal state
  useEffect(() => {
    console.log("Modal state:", { isOpen, selectedImage });
  }, [isOpen, selectedImage]);

  // Test modal function
  const testModal = () => {
    console.log("Testing modal...");
    setSelectedImage(Foto);
    console.log("Selected image set to:", Foto);
    onOpen();
    console.log("Modal opened");
  };

  const daftarTempat = detailPerjalanan.tempats?.map(
    (tempat, index) =>
      `${
        detailPerjalanan.jenisPerjalanan?.tipePerjalananId === 1
          ? tempat.dalamKota.nama
          : tempat.tempat
      }${index < detailPerjalanan.tempats.length - 1 ? `, ` : ``}`
  );

  const handleDownload = async (fileName) => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/template/download-undangan`,
        {
          params: { fileName },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast({
        title: "Gagal Mengunduh",
        description: "Terjadi kesalahan saat mengunduh file",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getDalamKotaNonaktif = (perjalanan) => {
    if (!perjalanan?.tempats?.length) return [];
    const nonaktif = perjalanan.tempats.filter((t) => {
      if (!t?.dalamKota) return false;
      const s = String(t.dalamKota.status || "").toLowerCase();
      return s === "nonaktif" || s === "non aktif";
    });
    return nonaktif.map((t) => ({
      id: t.dalamKota.id,
      nama: t.dalamKota.nama,
      status: t.dalamKota.status,
      uangTransport: t.dalamKota.uangTransport,
    }));
  };

  const [loadingVerifDalamKotaId, setLoadingVerifDalamKotaId] = useState(null);
  const updateStatusDalamKota = (dalamKotaId) => {
    setLoadingVerifDalamKotaId(dalamKotaId);
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/dalam-kota/update-status`,
        { id: dalamKotaId }
      )
      .then(() => {
        toast({
          title: "Berhasil",
          description: "Status tujuan dalam kota berhasil diubah menjadi aktif",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setListDalamKotaNonaktif((prev) =>
          prev.filter((dk) => dk.id !== dalamKotaId)
        );
        fetchDataPerjalanan();
      })
      .catch(() => {
        toast({
          title: "Gagal",
          description: "Gagal mengubah status tujuan dalam kota",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      })
      .finally(() => setLoadingVerifDalamKotaId(null));
  };

  const handleKlikVerifikasi = (item) => {
    const isDalamKota =
      detailPerjalanan?.jenisPerjalanan?.tipePerjalananId === 1;
    if (isDalamKota) {
      const listNonaktif = getDalamKotaNonaktif(detailPerjalanan);
      if (listNonaktif.length > 0) {
        setListDalamKotaNonaktif(listNonaktif);
        onModalNonaktifOpen();
        return;
      }
    }
    terimaVerifikasi(item.id);
  };

  const terimaVerifikasi = (personilId) => {
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/kwitansi/verifikasi/terima`,
        { personilId }
      )
      .then((res) => {
        console.log(res.data);
        fetchDataPerjalanan();
        toast({
          title: "Berhasil!",
          description: "Verifikasi berhasil diterima",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error!",
          description: "Gagal menerima verifikasi",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const batalkanVerifikasi = () => {
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/kwitansi/verifikasi/tolak`,
        { personilId: selectedItemId, catatan: alasanBatal }
      )
      .then((res) => {
        console.log(res.data);
        fetchDataPerjalanan();
        setIsModalBatalOpen(false);
        setAlasanBatal("");
        setSelectedItemId(null);
        toast({
          title: "Berhasil!",
          description: "Verifikasi berhasil dibatalkan",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error!",
          description: "Gagal membatalkan verifikasi",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  async function fetchDataPerjalanan() {
    await axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/admin/get/detail-perjalanan/${props.match.params.id}`
      )
      .then((res) => {
        setDetailPerjalanan(res.data.result);
        setDataTemplate(res.data.template);
        if (res.data.result?.template?.[0]?.id) {
          setTemplateId(res.data.result.template[0].id);
        } else if (res.data.template?.[0]?.id) {
          setTemplateId(res.data.template[0].id);
        }
        console.log(res.data.result);
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error!",
          description: "Gagal mengambil data perjalanan",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  }

  const totalDurasi =
    detailPerjalanan?.tempats?.reduce(
      (total, tempat) => total + (tempat?.dalamKota?.durasi || 0),
      0
    ) || 0;

  const cetak = (val) => {
    if (!templateId) {
      toast({
        title: "Error!",
        description:
          "Template belum dipilih. Silakan pilih template terlebih dahulu.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsPrinting(true);
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/kwitansi/post/cetak-kwitansi`,
        {
          indukUnitKerja:
            user[0]?.unitKerja_profile?.indukUnitKerja?.indukUnitKerja,
          nomorSPD: val?.nomorSPD,
          nomorST: detailPerjalanan?.noSuratTugas,
          pegawaiNama: val?.pegawai?.nama,
          pegawaiNip: val?.pegawai?.nip,
          pegawaiJabatan: val?.pegawai?.jabatan,
          untuk: detailPerjalanan?.untuk,
          PPTKNama: detailPerjalanan?.PPTK?.pegawai_PPTK?.nama,
          PPTKNip: detailPerjalanan?.PPTK?.pegawai_PPTK?.nip,
          KPANama: detailPerjalanan?.KPA?.pegawai_KPA?.nama,
          KPANip: detailPerjalanan?.KPA?.pegawai_KPA?.nip,
          KPAJabatan: detailPerjalanan?.KPA?.jabatan,
          foto: detailPerjalanan?.fotoPerjalanans || [],
          templateId,
          subKegiatan: detailPerjalanan?.daftarSubKegiatan?.subKegiatan,
          kodeRekening: `${
            detailPerjalanan?.daftarSubKegiatan?.kodeRekening || ""
          }${detailPerjalanan?.jenisPerjalanan?.kodeRekening || ""}`,
          rincianBPD: val?.rincianBPDs,
          tanggalPengajuan: detailPerjalanan?.tanggalPengajuan,
          totalDurasi,
          jenis: detailPerjalanan?.jenisId,
          tempat: detailPerjalanan?.tempats,
          jenisPerjalanan: detailPerjalanan?.jenisPerjalanan?.jenis,
          dataBendahara: detailPerjalanan?.bendahara,
          tahun: detailPerjalanan?.tanggalPengajuan
            ? new Date(detailPerjalanan.tanggalPengajuan).getFullYear()
            : new Date().getFullYear(),
        },
        {
          responseType: "blob",
        }
      )
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `kuitansi_${val?.pegawai?.nama}${props.match.params.id}.docx`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();

        toast({
          title: "Berhasil!",
          description: "File berhasil diunduh.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error!",
          description: "Gagal mengunduh file.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      })
      .finally(() => {
        setIsPrinting(false);
      });
  };

  function renderTemplate() {
    return dataTemplate?.map((val) => {
      return (
        <option key={val.id} value={val.id}>
          {val.nama}
        </option>
      );
    });
  }

  const getStatusColor = (statusId) => {
    switch (statusId) {
      case 1:
        return "gray";
      case 2:
        return "blue";
      case 3:
        return "purple";
      case 4:
        return "orange";
      case 5:
        return "green";
      default:
        return "gray";
    }
  };

  const getStatusText = (statusId) => {
    switch (statusId) {
      case 1:
        return "Pending";
      case 2:
        return "Menunggu Verifikasi";
      case 3:
        return "Diverifikasi";
      case 4:
        return "Diproses";
      case 5:
        return "Selesai";
      default:
        return "Unknown";
    }
  };

  useEffect(() => {
    fetchDataPerjalanan();
  }, []);

  if (!detailPerjalanan || Object.keys(detailPerjalanan).length === 0) {
    return (
      <Layout>
        <Box p={8}>
          <Center>
            <Loading />
          </Center>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      {isPrinting && <Loading />}
      <Box bg="gray.50" minH="100vh" py={8}>
        <Container maxW="1400px" px={4}>
          {/* Header Section */}
          <Box mb={8}>
            <Flex justify="space-between" align="center">
              <Box>
                <Heading size="lg" color="gray.800" mb={2}>
                  Detail Perjalanan Dinas
                </Heading>
              </Box>
            </Flex>
          </Box>

          {/* Main Content Grid */}
          <Grid
            templateColumns={{ base: "1fr", lg: "1fr 400px" }}
            gap={8}
            mb={8}
          >
            {/* Left Column - Image and Details */}
            <GridItem>
              <Card shadow="lg" borderRadius="xl" overflow="hidden">
                <CardHeader bg="primary" color="white" py={6}>
                  <Flex justify="space-between" align="center">
                    <Heading size="md">Foto Bukti Kegiatan</Heading>
                    {detailPerjalanan?.fotoPerjalanans?.length > 0 && (
                      <Badge
                        colorScheme="whiteAlpha"
                        fontSize="md"
                        px={3}
                        py={1}
                      >
                        {detailPerjalanan.fotoPerjalanans.length} Foto
                      </Badge>
                    )}
                  </Flex>
                </CardHeader>
                <CardBody p={0}>
                  {detailPerjalanan?.fotoPerjalanans?.length > 0 ? (
                    <Box>
                      {/* Foto utama (foto pertama) */}
                      <Box
                        cursor="pointer"
                        onClick={() => {
                          setSelectedImageIndex(0);
                          onGalleryOpen();
                        }}
                        position="relative"
                        overflow="hidden"
                      >
                        <Image
                          borderRadius="lg"
                          alt="foto kegiatan"
                          width="100%"
                          height="500px"
                          objectFit="cover"
                          src={
                            import.meta.env.VITE_REACT_APP_API_BASE_URL +
                            detailPerjalanan.fotoPerjalanans[0].foto
                          }
                          transition="transform 0.3s ease"
                          _hover={{ transform: "scale(1.02)" }}
                        />
                        {/* Overlay untuk hover effect */}
                        <Box
                          position="absolute"
                          top={0}
                          left={0}
                          right={0}
                          bottom={0}
                          bg="blackAlpha.400"
                          opacity={0}
                          _hover={{ opacity: 1 }}
                          transition="opacity 0.3s"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Text
                            color="white"
                            fontWeight="semibold"
                            fontSize="lg"
                          >
                            Klik untuk melihat semua foto
                          </Text>
                        </Box>
                      </Box>

                      {/* Grid foto tambahan di bawah */}
                      {detailPerjalanan.fotoPerjalanans.length > 1 && (
                        <SimpleGrid
                          columns={{ base: 2, md: 4 }}
                          spacing={3}
                          p={3}
                        >
                          {detailPerjalanan.fotoPerjalanans
                            .slice(1, 5)
                            .map((foto, index) => (
                              <Box
                                key={foto.id}
                                cursor="pointer"
                                onClick={() => {
                                  // Index + 1 karena ini adalah foto ke-2, 3, 4, atau 5 (index 0 adalah foto pertama)
                                  setSelectedImageIndex(index + 1);
                                  onGalleryOpen();
                                }}
                                position="relative"
                                overflow="hidden"
                                borderRadius="md"
                                shadow="sm"
                                _hover={{
                                  shadow: "md",
                                  transform: "translateY(-2px)",
                                }}
                                transition="all 0.2s"
                              >
                                <Image
                                  borderRadius="md"
                                  alt={`foto kegiatan ${index + 2}`}
                                  width="100%"
                                  height="120px"
                                  objectFit="cover"
                                  src={
                                    import.meta.env
                                      .VITE_REACT_APP_API_BASE_URL + foto.foto
                                  }
                                />
                              </Box>
                            ))}
                        </SimpleGrid>
                      )}

                      {/* Indicator jika ada lebih dari 5 foto */}
                      {detailPerjalanan.fotoPerjalanans.length > 5 && (
                        <Center pb={3}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedImageIndex(0);
                              onGalleryOpen();
                            }}
                            colorScheme="blue"
                          >
                            Lihat {detailPerjalanan.fotoPerjalanans.length - 5}{" "}
                            foto lainnya →
                          </Button>
                        </Center>
                      )}
                    </Box>
                  ) : (
                    <Box position="relative">
                      <Image
                        borderRadius="lg"
                        alt="foto kegiatan"
                        width="100%"
                        height="500px"
                        objectFit="cover"
                        src={Foto}
                        opacity={0.7}
                      />
                      <Center
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                        flexDirection="column"
                        gap={2}
                      >
                        <BsImage size={48} color="gray" />
                        <Text color="gray.500" fontWeight="medium">
                          Belum ada foto
                        </Text>
                      </Center>
                    </Box>
                  )}
                </CardBody>
              </Card>

              <Flex gap={"20px"}>
                {/* Template Selection - Dipindahkan ke bawah foto */}
                <Card shadow="md" borderRadius="lg" mt={6} width={"50%"}>
                  <CardHeader bg="orange.50" py={4}>
                    <Heading size="sm" color="orange.700">
                      Pilih Template
                    </Heading>
                  </CardHeader>
                  <CardBody>
                    <FormControl>
                      <Select
                        size="lg"
                        bg="white"
                        borderRadius="md"
                        borderColor="gray.300"
                        value={templateId || ""}
                        onChange={(e) => setTemplateId(e.target.value)}
                        _focus={{
                          borderColor: "blue.500",
                          boxShadow: "outline",
                        }}
                      >
                        <option value="">Pilih Template</option>
                        {renderTemplate()}
                      </Select>
                    </FormControl>
                  </CardBody>
                </Card>

                {/* Undangan Download - Dipindahkan ke bawah foto */}
                {detailPerjalanan?.undangan && (
                  <Card width={"50%"} shadow="md" borderRadius="lg" mt={6}>
                    <CardHeader bg="teal.50" py={4}>
                      <Heading size="sm" color="teal.700">
                        File Undangan
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={3}>
                        <Button
                          colorScheme="teal"
                          size="md"
                          w="100%"
                          onClick={onUndanganOpen}
                          leftIcon={<Box as="span">👁️</Box>}
                        >
                          Lihat Undangan
                        </Button>
                        <Button
                          variant="outline"
                          colorScheme="teal"
                          size="md"
                          w="100%"
                          onClick={() =>
                            handleDownload(detailPerjalanan?.undangan)
                          }
                          leftIcon={<Box as="span">📥</Box>}
                        >
                          Download Undangan
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                )}
              </Flex>
            </GridItem>

            {/* Right Column - Information */}
            <GridItem>
              <VStack spacing={6} align="stretch">
                {/* Basic Info Card */}
                <Card shadow="md" borderRadius="lg">
                  <CardHeader bg="gray.50" py={4}>
                    <Heading size="sm" color="gray.700">
                      Informasi Dasar
                    </Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={3} align="stretch">
                      <Box>
                        <Text
                          fontWeight="semibold"
                          color="gray.600"
                          fontSize="sm"
                        >
                          Asal
                        </Text>
                        <Text fontSize="md">
                          {detailPerjalanan.asal || "-"}
                        </Text>
                      </Box>
                      <Box>
                        <Text
                          fontWeight="semibold"
                          color="gray.600"
                          fontSize="sm"
                        >
                          Dasar
                        </Text>
                        <Text fontSize="md">
                          {detailPerjalanan.dasar || "-"}
                        </Text>
                      </Box>
                      <Box>
                        <Text
                          fontWeight="semibold"
                          color="gray.600"
                          fontSize="sm"
                        >
                          No. Surat Tugas
                        </Text>
                        <Text fontSize="md" fontFamily="mono">
                          {detailPerjalanan.noSuratTugas || "-"}
                        </Text>
                      </Box>
                      <Box>
                        <Text
                          fontWeight="semibold"
                          color="gray.600"
                          fontSize="sm"
                        >
                          No. Nota Dinas
                        </Text>
                        <Text fontSize="md" fontFamily="mono">
                          {detailPerjalanan.isNotaDinas
                            ? detailPerjalanan.noNotaDinas
                            : "-"}
                        </Text>
                      </Box>
                      <Box>
                        <Text
                          fontWeight="semibold"
                          color="gray.600"
                          fontSize="sm"
                        >
                          No. Telaahan Staf
                        </Text>
                        <Text fontSize="md" fontFamily="mono">
                          {detailPerjalanan.isNotaDinas
                            ? "-"
                            : detailPerjalanan.noNotaDinas || "-"}
                        </Text>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Date Info Card */}
                <Card shadow="md" borderRadius="lg">
                  <CardHeader bg="green.50" py={4}>
                    <Heading size="sm" color="green.700">
                      Informasi Tanggal
                    </Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={3} align="stretch">
                      <Box>
                        <Text
                          fontWeight="semibold"
                          color="gray.600"
                          fontSize="sm"
                        >
                          Tanggal Pengajuan
                        </Text>
                        <Text fontSize="md">
                          {detailPerjalanan.tanggalPengajuan
                            ? new Date(
                                detailPerjalanan.tanggalPengajuan
                              ).toLocaleDateString("id-ID", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })
                            : "-"}
                        </Text>
                      </Box>
                      <Box>
                        <Text
                          fontWeight="semibold"
                          color="gray.600"
                          fontSize="sm"
                        >
                          Tanggal Berangkat
                        </Text>
                        <Text fontSize="md">
                          {detailPerjalanan.tempats?.[0]?.tanggalBerangkat
                            ? new Date(
                                detailPerjalanan.tempats[0].tanggalBerangkat
                              ).toLocaleDateString("id-ID", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })
                            : "-"}
                        </Text>
                      </Box>
                      <Box>
                        <Text
                          fontWeight="semibold"
                          color="gray.600"
                          fontSize="sm"
                        >
                          Tanggal Pulang
                        </Text>
                        <Text fontSize="md">
                          {detailPerjalanan.tempats?.[
                            detailPerjalanan.tempats?.length - 1
                          ]?.tanggalPulang
                            ? new Date(
                                detailPerjalanan.tempats[
                                  detailPerjalanan.tempats.length - 1
                                ].tanggalPulang
                              ).toLocaleDateString("id-ID", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })
                            : "-"}
                        </Text>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Financial Info Card */}
                <Card shadow="md" borderRadius="lg">
                  <CardHeader bg="purple.50" py={4}>
                    <Heading size="sm" color="purple.700">
                      Informasi Keuangan
                    </Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={3} align="stretch">
                      <Box>
                        <Text
                          fontWeight="semibold"
                          color="gray.600"
                          fontSize="sm"
                        >
                          Sumber Dana
                        </Text>
                        <Text fontSize="md">
                          {detailPerjalanan?.bendahara?.sumberDana?.sumber ||
                            "-"}
                        </Text>
                      </Box>
                      <Box>
                        <Text
                          fontWeight="semibold"
                          color="gray.600"
                          fontSize="sm"
                          mb={2}
                        >
                          Tujuan
                        </Text>
                        {detailPerjalanan?.jenisPerjalanan?.tipePerjalananId ===
                        1 ? (
                          <VStack align="stretch" spacing={2}>
                            {(detailPerjalanan?.tempats || []).map(
                              (t, i) =>
                                t?.dalamKota && (
                                  <HStack key={i} spacing={2} align="center">
                                    <Text fontSize="md" color="gray.700">
                                      {t.dalamKota.nama || `Tujuan ${i + 1}`}
                                    </Text>
                                    <Badge
                                      colorScheme={
                                        (
                                          t.dalamKota.status || ""
                                        ).toLowerCase() === "aktif"
                                          ? "green"
                                          : "orange"
                                      }
                                      fontSize="sm"
                                    >
                                      {t.dalamKota.status ?? "-"}
                                    </Badge>
                                  </HStack>
                                )
                            )}
                            {!(detailPerjalanan?.tempats || []).some(
                              (t) => t?.dalamKota
                            ) && (
                              <Text fontSize="md" color="gray.500">
                                -
                              </Text>
                            )}
                          </VStack>
                        ) : (
                          <Text fontSize="md">{daftarTempat || "-"}</Text>
                        )}
                      </Box>
                      {detailPerjalanan?.jenisPerjalanan?.tipePerjalananId ===
                        1 && (
                        <Box>
                          <Text
                            fontWeight="semibold"
                            color="gray.600"
                            fontSize="sm"
                          >
                            Uang Transport
                          </Text>
                          <Text
                            fontSize="md"
                            fontFamily="mono"
                            color="green.600"
                          >
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                            }).format(
                              Math.max(
                                ...(detailPerjalanan?.tempats || []).map(
                                  (t) => t?.dalamKota?.uangTransport ?? 0
                                )
                              )
                            )}
                          </Text>
                        </Box>
                      )}
                      <Box>
                        <Text
                          fontWeight="semibold"
                          color="gray.600"
                          fontSize="sm"
                        >
                          Kode Rekening
                        </Text>
                        <Text fontSize="md" fontFamily="mono">
                          {`${
                            detailPerjalanan?.daftarSubKegiatan?.kodeRekening ||
                            ""
                          }${
                            detailPerjalanan?.jenisPerjalanan?.kodeRekening ||
                            ""
                          }`}
                        </Text>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </GridItem>
          </Grid>

          {/* Personnel List Section */}
          <Box mb={8}>
            <Heading size="lg" color="gray.800" mb={6}>
              Daftar Personil
            </Heading>
            {detailPerjalanan?.personils?.map((item, index) => (
              <Card
                key={index}
                shadow="lg"
                borderRadius="xl"
                mb={6}
                overflow="hidden"
              >
                <CardHeader bg="gray.50" py={4}>
                  <Flex justify="space-between" align="center">
                    <HStack spacing={3} align="start">
                      {item?.pegawai?.profiles?.[0]?.profilePic ? (
                        <Image
                          src={`${import.meta.env.VITE_REACT_APP_API_BASE_URL}${
                            item.pegawai.profiles[0].profilePic
                          }`}
                          alt={item?.pegawai?.nama || "Foto"}
                          width="80px"
                          height="80px"
                          objectFit="cover"
                          borderRadius="md"
                          bg="gray.200"
                        />
                      ) : (
                        <Box
                          width="80px"
                          height="80px"
                          bg="primary"
                          borderRadius="md"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          color="white"
                          fontWeight="bold"
                          fontSize="lg"
                          flexShrink={0}
                        >
                          {item?.pegawai?.nama?.charAt(0).toUpperCase() || "-"}
                        </Box>
                      )}
                      <VStack spacing={1} align="start">
                        <Heading size="md" color="gray.800">
                          {item?.pegawai?.nama}
                        </Heading>
                        <Text color="gray.600" fontSize="sm">
                          NIP: {item?.pegawai?.nip}
                        </Text>
                        <Text color="gray.600" fontSize="sm">
                          Nomor SPD: {item?.nomorSPD}
                        </Text>
                      </VStack>
                    </HStack>
                    <Badge
                      colorScheme={getStatusColor(item.statusId)}
                      size="lg"
                      px={4}
                      py={2}
                      borderRadius="full"
                    >
                      {getStatusText(item.statusId)}
                    </Badge>
                  </Flex>
                </CardHeader>
                <CardBody>
                  {/* Rincian BPD Table */}
                  <Box mb={6}>
                    <Heading size="sm" color="gray.700" mb={4}>
                      Rincian Biaya Perjalanan Dinas
                    </Heading>
                    <Box overflowX="auto">
                      <Table variant="simple" size="sm">
                        <Thead bg="green.50">
                          <Tr>
                            <Th>Jenis</Th>
                            <Th>Item</Th>
                            <Th isNumeric>Nilai</Th>
                            <Th isNumeric>Qty</Th>
                            <Th>Satuan</Th>
                            <Th isNumeric>Total</Th>
                            <Th>Bukti</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {item.rincianBPDs?.map((val, idx) => (
                            <React.Fragment key={idx}>
                              <Tr>
                                <Td fontWeight="medium">
                                  {val.jenisRincianBPD?.jenis}
                                </Td>
                                <Td>{val.item}</Td>
                                <Td isNumeric fontFamily="mono">
                                  {new Intl.NumberFormat("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                  }).format(val.nilai)}
                                </Td>
                                <Td isNumeric>{val.qty}</Td>
                                <Td>{val.satuan}</Td>
                                <Td fontFamily="mono" isNumeric>
                                  {new Intl.NumberFormat("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                  }).format(val.nilai * val.qty)}
                                </Td>
                                <Td>
                                  <Image
                                    src={
                                      val.bukti
                                        ? import.meta.env
                                            .VITE_REACT_APP_API_BASE_URL +
                                          val.bukti
                                        : Foto
                                    }
                                    alt="Bukti"
                                    w="80px"
                                    h="60px"
                                    objectFit="cover"
                                    borderRadius="md"
                                    cursor="pointer"
                                    onClick={() => {
                                      console.log(
                                        "Foto bukti diklik:",
                                        val.bukti
                                      );
                                      if (val.bukti) {
                                        const imageUrl =
                                          import.meta.env
                                            .VITE_REACT_APP_API_BASE_URL +
                                          val.bukti;
                                        console.log("URL gambar:", imageUrl);
                                        setSelectedImage(imageUrl);
                                        onOpen();
                                      } else {
                                        console.log("Tidak ada bukti");
                                        toast({
                                          title: "Info",
                                          description:
                                            "Tidak ada bukti untuk ditampilkan",
                                          status: "info",
                                          duration: 2000,
                                          isClosable: true,
                                        });
                                      }
                                    }}
                                    _hover={{ opacity: 0.8 }}
                                    transition="opacity 0.2s"
                                  />
                                </Td>
                              </Tr>
                              {val.rills?.length > 0 && (
                                <Tr>
                                  <Td colSpan={7}>
                                    <Box bg="gray.50" p={3} borderRadius="md">
                                      <Text
                                        fontWeight="semibold"
                                        mb={2}
                                        color="gray.700"
                                      >
                                        Detail Rincian:
                                      </Text>
                                      <Table size="sm" variant="unstyled">
                                        <Thead>
                                          <Tr>
                                            <Th>Item</Th>
                                            <Th isNumeric>Nilai</Th>
                                          </Tr>
                                        </Thead>
                                        <Tbody>
                                          {val.rills.map((rill, rillIndex) => (
                                            <Tr key={rillIndex}>
                                              <Td pl={6}>{rill.item}</Td>
                                              <Td isNumeric fontFamily="mono">
                                                {new Intl.NumberFormat(
                                                  "id-ID",
                                                  {
                                                    style: "currency",
                                                    currency: "IDR",
                                                  }
                                                ).format(rill.nilai)}
                                              </Td>
                                            </Tr>
                                          ))}
                                        </Tbody>
                                      </Table>
                                    </Box>
                                  </Td>
                                </Tr>
                              )}
                            </React.Fragment>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  </Box>

                  {/* Total Per Personil */}
                  <Box
                    bg="green.50"
                    p={4}
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="green.200"
                    mb={4}
                  >
                    <Stat>
                      <StatLabel color="green.700" fontWeight="semibold">
                        Total Uang Perjalanan {item?.pegawai?.nama}
                      </StatLabel>
                      <StatNumber color="green.800" fontSize="xl">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }).format(
                          item.rincianBPDs?.reduce((total, val) => {
                            const rincianTotal = val.nilai * val.qty;
                            const rillTotal =
                              val.rills?.reduce(
                                (rillSum, rill) => rillSum + rill.nilai,
                                0
                              ) || 0;
                            return total + rincianTotal;
                          }, 0) || 0
                        )}
                      </StatNumber>
                    </Stat>
                  </Box>

                  {/* Action Buttons */}
                  <Flex gap={3} flexWrap="wrap">
                    {item.statusId === 2 && (
                      <>
                        <Button
                          colorScheme="green"
                          size="md"
                          onClick={() => handleKlikVerifikasi(item)}
                          leftIcon={<Box as="span">✅</Box>}
                        >
                          Verifikasi
                        </Button>
                      </>
                    )}
                    <Button
                      colorScheme="blue"
                      size="md"
                      onClick={() => {
                        setSelectedItemId(item.id);
                        setSelectedData(item);
                        cetak(item);
                      }}
                      leftIcon={<Box as="span">🖨️</Box>}
                      isDisabled={!templateId}
                    >
                      Cetak Kwitansi
                    </Button>{" "}
                    <Button
                      colorScheme="red"
                      size="md"
                      onClick={() => {
                        setSelectedItemId(item.id);
                        setIsModalBatalOpen(true);
                      }}
                      leftIcon={<Box as="span">❌</Box>}
                    >
                      Batalkan
                    </Button>
                  </Flex>
                </CardBody>
              </Card>
            ))}
          </Box>

          {/* Total Summary */}
          <Card
            shadow="xl"
            borderRadius="xl"
            bg="gradient-to-r"
            bgGradient="linear(to-r, green.400, blue.500)"
          >
            <CardBody p={8}>
              <Stat textAlign="center">
                <StatLabel color="white" fontSize="lg" fontWeight="semibold">
                  Total Uang Perjalanan Semua Pegawai
                </StatLabel>
                <StatNumber color="white" fontSize="3xl" fontWeight="bold">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  }).format(
                    detailPerjalanan?.personils?.reduce(
                      (totalPersonil, item) => {
                        const personilTotal =
                          item.rincianBPDs?.reduce((total, val) => {
                            const rincianTotal = val.nilai * val.qty;

                            return total + rincianTotal;
                          }, 0) || 0;
                        return totalPersonil + personilTotal;
                      },
                      0
                    ) || 0
                  )}
                </StatNumber>
                <StatHelpText color="white" fontSize="md">
                  Total keseluruhan biaya perjalanan dinas
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </Container>

        {/* Image Modal - Untuk bukti di tabel */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent maxW="90vw" maxH="90vh">
            <ModalHeader>Preview Gambar</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box textAlign="center" p={4}>
                <Image
                  src={selectedImage || Foto}
                  alt="Preview"
                  maxW="100%"
                  maxH="70vh"
                  objectFit="contain"
                  fallbackSrc={Foto}
                />
              </Box>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" onClick={onClose}>
                Tutup
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Gallery Modal untuk melihat semua foto perjalanan */}
        {detailPerjalanan?.fotoPerjalanans?.length > 0 && (
          <Modal
            isOpen={isGalleryOpen}
            onClose={onGalleryClose}
            size="full"
            isCentered
          >
            <ModalOverlay bg="blackAlpha.900" backdropFilter="blur(4px)" />
            <ModalContent bg="blackAlpha.950" borderRadius={0} m={0} h="100vh">
              <ModalHeader
                color="white"
                borderBottom="1px solid"
                borderColor="whiteAlpha.200"
                py={4}
              >
                <HStack>
                  <BsImage />
                  <Text>Foto Bukti Kegiatan</Text>
                  <Badge colorScheme="blue" ml={2}>
                    {detailPerjalanan.fotoPerjalanans.length} Foto
                  </Badge>
                </HStack>
              </ModalHeader>
              <ModalCloseButton color="white" size="lg" />
              <ModalBody pb={6} pt={4}>
                <Flex direction="column" align="center" h="calc(100vh - 180px)">
                  {/* Foto utama yang dipilih */}
                  <Box
                    flex="1"
                    w="100%"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    position="relative"
                  >
                    <Image
                      src={
                        import.meta.env.VITE_REACT_APP_API_BASE_URL +
                        detailPerjalanan.fotoPerjalanans[selectedImageIndex]
                          ?.foto
                      }
                      alt={`Foto ${selectedImageIndex + 1}`}
                      maxH="75vh"
                      maxW="100%"
                      objectFit="contain"
                      borderRadius="lg"
                      shadow="2xl"
                    />
                    {/* Navigasi dengan icon di kiri kanan foto */}
                    {detailPerjalanan.fotoPerjalanans.length > 1 && (
                      <>
                        <IconButton
                          aria-label="Foto sebelumnya"
                          icon={<BsChevronLeft />}
                          position="absolute"
                          left="20px"
                          size="lg"
                          colorScheme="blue"
                          borderRadius="full"
                          onClick={() =>
                            setSelectedImageIndex(
                              selectedImageIndex > 0
                                ? selectedImageIndex - 1
                                : detailPerjalanan.fotoPerjalanans.length - 1
                            )
                          }
                          shadow="lg"
                        />
                        <IconButton
                          aria-label="Foto selanjutnya"
                          icon={<BsChevronRight />}
                          position="absolute"
                          right="20px"
                          size="lg"
                          colorScheme="blue"
                          borderRadius="full"
                          onClick={() =>
                            setSelectedImageIndex(
                              selectedImageIndex <
                                detailPerjalanan.fotoPerjalanans.length - 1
                                ? selectedImageIndex + 1
                                : 0
                            )
                          }
                          shadow="lg"
                        />
                      </>
                    )}
                  </Box>

                  {/* Counter dan navigasi */}
                  <Flex justify="center" align="center" w="100%" mt={4} gap={4}>
                    <Text
                      color="white"
                      fontWeight="semibold"
                      fontSize="lg"
                      bg="blackAlpha.500"
                      px={4}
                      py={2}
                      borderRadius="full"
                    >
                      {selectedImageIndex + 1} /{" "}
                      {detailPerjalanan.fotoPerjalanans.length}
                    </Text>
                  </Flex>

                  {/* Thumbnail grid di bawah */}
                  {detailPerjalanan.fotoPerjalanans.length > 1 && (
                    <Box
                      mt={4}
                      w="100%"
                      maxH="140px"
                      overflowX="auto"
                      overflowY="hidden"
                      css={{
                        "&::-webkit-scrollbar": {
                          height: "8px",
                        },
                        "&::-webkit-scrollbar-track": {
                          background: "rgba(255,255,255,0.1)",
                          borderRadius: "4px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                          background: "rgba(255,255,255,0.3)",
                          borderRadius: "4px",
                        },
                      }}
                    >
                      <HStack spacing={3} align="flex-start">
                        {detailPerjalanan.fotoPerjalanans.map((foto, index) => (
                          <Box
                            key={foto.id}
                            cursor="pointer"
                            border={
                              selectedImageIndex === index
                                ? "3px solid"
                                : "2px solid"
                            }
                            borderColor={
                              selectedImageIndex === index
                                ? "blue.400"
                                : "whiteAlpha.300"
                            }
                            borderRadius="lg"
                            overflow="hidden"
                            onClick={() => setSelectedImageIndex(index)}
                            _hover={{
                              borderColor: "blue.300",
                              transform: "scale(1.05)",
                            }}
                            transition="all 0.2s"
                            flexShrink={0}
                            shadow={selectedImageIndex === index ? "lg" : "md"}
                          >
                            <Image
                              src={
                                import.meta.env.VITE_REACT_APP_API_BASE_URL +
                                foto.foto
                              }
                              alt={`Thumbnail ${index + 1}`}
                              width="120px"
                              height="120px"
                              objectFit="cover"
                            />
                          </Box>
                        ))}
                      </HStack>
                    </Box>
                  )}
                </Flex>
              </ModalBody>
            </ModalContent>
          </Modal>
        )}

        {/* Modal Preview Undangan PDF */}
        {detailPerjalanan?.undangan && (
          <Modal
            isOpen={isUndanganOpen}
            onClose={onUndanganClose}
            size="6xl"
            isCentered
          >
            <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
            <ModalContent maxW="90vw" h="90vh" borderRadius="xl">
              <ModalHeader
                bg="teal.50"
                borderTopRadius="xl"
                py={4}
                borderBottom="1px solid"
                borderColor="gray.200"
              >
                <HStack>
                  <Box as="span">📄</Box>
                  <Text>Preview Undangan</Text>
                </HStack>
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody p={0} position="relative">
                <Box
                  w="100%"
                  h="calc(90vh - 80px)"
                  position="relative"
                  bg="gray.100"
                >
                  <iframe
                    src={
                      import.meta.env.VITE_REACT_APP_API_BASE_URL +
                      detailPerjalanan.undangan +
                      "#toolbar=0"
                    }
                    width="100%"
                    height="100%"
                    style={{
                      border: "none",
                      borderRadius: "0 0 12px 12px",
                    }}
                    title="Preview Undangan PDF"
                  />
                </Box>
              </ModalBody>
              <ModalFooter
                borderTop="1px solid"
                borderColor="gray.200"
                bg="gray.50"
              >
                <HStack spacing={3}>
                  <Button variant="outline" onClick={onUndanganClose}>
                    Tutup
                  </Button>
                  <Button
                    colorScheme="teal"
                    onClick={() => handleDownload(detailPerjalanan?.undangan)}
                    leftIcon={<Box as="span">📥</Box>}
                  >
                    Download PDF
                  </Button>
                </HStack>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}

        {/* Debug Info */}
        {process.env.NODE_ENV === "development" && (
          <Box
            position="fixed"
            bottom={4}
            right={4}
            bg="black"
            color="white"
            p={2}
            borderRadius="md"
            fontSize="xs"
          >
            <Text>Modal State: {isOpen ? "Open" : "Closed"}</Text>
            <Text>Selected Image: {selectedImage ? "Yes" : "No"}</Text>
          </Box>
        )}

        {/* Modal Pemberitahuan Dalam Kota Nonaktif */}
        <Modal
          isOpen={isModalNonaktifOpen}
          onClose={onModalNonaktifClose}
          isCentered
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader color="orange.600">Tidak Dapat Verifikasi</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Alert status="warning" borderRadius="md" mb={4}>
                <AlertIcon />
                <Box>
                  <Text fontWeight="semibold">
                    Terdapat tujuan dalam kota yang berstatus nonaktif.
                  </Text>
                  <Text fontSize="sm" mt={1}>
                    Verifikasi tidak dapat dilakukan hingga data tujuan
                    diperbarui.
                  </Text>
                </Box>
              </Alert>
              <Text fontWeight="semibold" mb={2}>
                Daftar tujuan dalam kota nonaktif:
              </Text>
              <VStack align="stretch" spacing={2}>
                {listDalamKotaNonaktif.map((dk, i) => (
                  <HStack
                    key={dk.id ?? i}
                    p={3}
                    bg="gray.50"
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor="gray.200"
                    justify="space-between"
                    flexWrap="wrap"
                    spacing={3}
                  >
                    <Text fontWeight="medium">{dk.nama || "–"}</Text>
                    <HStack spacing={3}>
                      <Text fontSize="sm" fontFamily="mono" color="green.600">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }).format(dk.uangTransport ?? 0)}
                      </Text>
                      <Badge colorScheme="red" variant="subtle">
                        {dk.status || "nonaktif"}
                      </Badge>
                      <Button
                        size="sm"
                        colorScheme="green"
                        onClick={() => updateStatusDalamKota(dk.id)}
                        isLoading={loadingVerifDalamKotaId === dk.id}
                        isDisabled={!dk.id}
                      >
                        Verif
                      </Button>
                    </HStack>
                  </HStack>
                ))}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button onClick={onModalNonaktifClose}>Tutup</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Cancel Modal */}
        <Modal
          isOpen={isModalBatalOpen}
          onClose={() => setIsModalBatalOpen(false)}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Alasan Pembatalan</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl>
                <FormLabel>Masukkan alasan pembatalan:</FormLabel>
                <Textarea
                  value={alasanBatal}
                  onChange={(e) => setAlasanBatal(e.target.value)}
                  placeholder="Tuliskan alasan pembatalan verifikasi..."
                  rows={4}
                  resize="vertical"
                />
              </FormControl>
            </ModalBody>
            <ModalFooter gap={3}>
              <Button
                colorScheme="red"
                onClick={() => batalkanVerifikasi(selectedItemId)}
                isDisabled={!alasanBatal.trim()}
              >
                Batalkan Verifikasi
              </Button>
              <Button
                variant="ghost"
                onClick={() => setIsModalBatalOpen(false)}
              >
                Tutup
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Layout>
  );
}

export default RampungAdmin;
