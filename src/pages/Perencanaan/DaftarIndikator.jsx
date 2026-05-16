import React, { useState, useEffect } from "react";
import axios from "axios";
import LayoutPerencanaan from "../../Componets/perencanaan/LayoutPerencanaan";
import {
  Box,
  Container,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Heading,
  Text,
  VStack,
  Button,
  Flex,
  Spacer,
  useColorMode,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  useDisclosure,
  useToast,
  FormControl,
  FormLabel,
  Badge,
  Divider,
  HStack,
  Icon,
  Card,
  CardBody,
  CardHeader,
} from "@chakra-ui/react";
import {
  FiTarget,
  FiCalendar,
  FiDollarSign,
  FiEdit,
  FiTrash2,
  FiPlus,
} from "react-icons/fi";
import { useSelector } from "react-redux";
import { userRedux } from "../../Redux/Reducers/auth";
import { Select as Select2 } from "chakra-react-select";
import { formatRupiah, parseRupiah } from "../../utils/formatRupiah";

function DaftarIndikator() {
  const [DataIndikator, setDataIndikator] = useState([]);
  const [DataIndikatorProgram, setDataIndikatorProgram] = useState([]);
  const [DataIndikatorKegiatan, setDataIndikatorKegiatan] = useState([]);
  const [dataNamatarget, setDataNamaTarget] = useState([]);
  const [selectedIndikator, setSelectedIndikator] = useState(null);
  const [selectedIndikatorType, setSelectedIndikatorType] = useState(null); // 'subKegiatan' | 'program' | 'kegiatan'

  // state untuk form modal
  const [newTargets, setNewTargets] = useState({});
  const [newAnggaran, setNewAnggaran] = useState(null);
  const [newTahun, setNewTahun] = useState(null);
  const [jenisAnggaranId, setJenisAnggaranId] = useState(null);
  const [dataJenisAnggaran, setDataJenisAnggaran] = useState([]);

  // filter
  const [filterJenisAnggaranId, setFilterJenisAnggaranId] = useState(null);
  const [filterTahun, setFilterTahun] = useState(null);

  const { colorMode } = useColorMode();
  const user = useSelector(userRedux);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isApOpen,
    onOpen: onApOpen,
    onClose: onApClose,
  } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  // state untuk edit target
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [editTargets, setEditTargets] = useState({});
  const [editAnggaran, setEditAnggaran] = useState(null);
  const [editTahun, setEditTahun] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  async function fetchIndikator() {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/perencanaan/get/indikator/${user[0]?.unitKerja_profile?.id}?tahun=${
          filterTahun || ""
        }&jenisAnggaranId=${filterJenisAnggaranId || ""}`
      );

      const allIndikators = res.data.result || [];

      // Memisahkan indikator berdasarkan tipenya
      const indikatorProgram = allIndikators.filter(
        (ind) => ind.programId && !ind.kegiatanId && !ind.subKegPerId
      );
      const indikatorKegiatan = allIndikators.filter(
        (ind) => ind.kegiatanId && !ind.subKegPerId && !ind.programId
      );
      const indikatorSubKegiatan = allIndikators.filter(
        (ind) => ind.subKegPerId && !ind.kegiatanId && !ind.programId
      );

      setDataIndikator(indikatorSubKegiatan);
      setDataIndikatorProgram(indikatorProgram);
      setDataIndikatorKegiatan(indikatorKegiatan);
      setDataJenisAnggaran(res.data.resultJenisAnggaran || []);
      setDataNamaTarget(res.data.resultNamaTarget || []);
      console.log("Response API:", res.data);
      console.log("Data Nama Target:", res.data.resultNamaTarget);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchIndikator();
  }, [filterTahun, filterJenisAnggaranId]);

  const handleOpenModal = (indikator, type) => {
    setSelectedIndikator(indikator);
    setSelectedIndikatorType(type);
    setIsEditMode(false);

    // Debug: Log data nama target
    console.log("dataNamatarget saat modal dibuka:", dataNamatarget);

    // Inisialisasi newTargets dengan struktur kosong untuk setiap namaTarget
    const initialTargets = {};
    if (dataNamatarget && dataNamatarget.length > 0) {
      dataNamatarget.forEach((namaTarget) => {
        initialTargets[namaTarget.id] = "";
      });
    }
    setNewTargets(initialTargets);

    onOpen();
  };

  const handleOpenEditModal = (target, indikator, type) => {
    setSelectedTarget(target);
    setSelectedIndikator(indikator);
    setSelectedIndikatorType(type);
    setIsEditMode(true);

    // Debug: Log data
    console.log("Edit modal - target:", target);
    console.log("Edit modal - dataNamatarget:", dataNamatarget);

    // Inisialisasi editTargets dengan nilai dari target triwulan yang ada
    const initialTargets = {};
    if (target.targetTriwulans && target.targetTriwulans.length > 0) {
      target.targetTriwulans.forEach((triwulan) => {
        initialTargets[triwulan.namaTargetId] =
          triwulan.nilai?.toString() || "";
      });
    }
    // Pastikan semua namaTarget ada di initialTargets
    if (dataNamatarget && dataNamatarget.length > 0) {
      dataNamatarget.forEach((namaTarget) => {
        if (!initialTargets[namaTarget.id]) {
          initialTargets[namaTarget.id] = "";
        }
      });
    }
    setEditTargets(initialTargets);

    // Set anggaran dan tahun dari tahun anggaran murni (prioritas) atau yang pertama
    if (target.tahunAnggarans && target.tahunAnggarans.length > 0) {
      const anggaranMurni = target.tahunAnggarans.find(
        (ta) => ta.jenisAnggaranId === 1
      );
      const tahunAnggaran = anggaranMurni || target.tahunAnggarans[0];
      setEditAnggaran(tahunAnggaran.anggaran?.toString() || "");
      setEditTahun(tahunAnggaran.tahun?.toString() || "");
    } else {
      // Jika tidak ada tahunAnggarans, set nilai default
      setEditAnggaran("");
      setEditTahun("");
    }

    onEditOpen();
  };

  const handleAddTarget = async () => {
    // Validasi apakah semua target telah diisi
    const targetValues = Object.values(newTargets);
    const hasEmptyTarget = targetValues.some((value) => !value || value === "");

    if (hasEmptyTarget || !newAnggaran || !newTahun) {
      toast({
        title: "Peringatan",
        description: "Semua field wajib diisi",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Membuat array of object untuk target
      const targetData = dataNamatarget.map((namaTarget) => {
        const targetValue = newTargets[namaTarget.id];
        return {
          namaTargetId: namaTarget.id,
          nilai: parseInt(targetValue),
        };
      });

      // Mengirim single request dengan array of object
      await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/perencanaan/post/target`,
        {
          indikatorId: selectedIndikator.id,
          targets: targetData,
          anggaran: parseInt(newAnggaran),
          tahun: parseInt(newTahun),
          jenisAnggaranId: 1,
        }
      );

      toast({
        title: "Berhasil",
        description: "Target berhasil ditambahkan",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onClose();
      setNewTargets({});
      setNewAnggaran(null);
      setNewTahun(null);
      setJenisAnggaranId(null);

      fetchIndikator();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Gagal menambahkan target",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUpdateTarget = async () => {
    if (!selectedTarget) return;

    // Validasi apakah semua target telah diisi
    const targetValues = Object.values(editTargets);
    const hasEmptyTarget = targetValues.some((value) => !value || value === "");

    // Validasi anggaran - harus lebih dari 0
    const parsedAnggaran = editAnggaran
      ? parseRupiah(editAnggaran.toString())
      : 0;
    const parsedTahun = editTahun ? parseInt(editTahun) : null;

    if (
      hasEmptyTarget ||
      !editAnggaran ||
      parsedAnggaran <= 0 ||
      !editTahun ||
      !parsedTahun ||
      isNaN(parsedTahun) ||
      parsedTahun <= 0
    ) {
      toast({
        title: "Peringatan",
        description: "Semua field wajib diisi dengan nilai yang valid",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validasi indikatorId
    if (!selectedIndikator || !selectedIndikator.id) {
      toast({
        title: "Peringatan",
        description: "Indikator tidak dipilih",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Membuat array of object untuk target triwulan
      const targetData = dataNamatarget.map((namaTarget) => {
        const targetValue = editTargets[namaTarget.id];
        const parsedNilai = parseInt(targetValue);

        // Validasi nilai target
        if (isNaN(parsedNilai) || parsedNilai < 0) {
          throw new Error(`Nilai target ${namaTarget.nama} tidak valid`);
        }

        return {
          namaTargetId: namaTarget.id,
          nilai: parsedNilai,
        };
      });

      // Validasi array targets tidak kosong
      if (!targetData || targetData.length === 0) {
        toast({
          title: "Peringatan",
          description: "Target harus diisi",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Update target
      await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/perencanaan/update/target`,
        {
          targetId: selectedTarget.id,
          targets: targetData,
          anggaran: parsedAnggaran,
          tahun: parsedTahun,
        }
      );

      toast({
        title: "Berhasil",
        description: "Target berhasil diperbarui",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onEditClose();
      setSelectedTarget(null);
      setEditTargets({});
      setEditAnggaran(null);
      setEditTahun(null);
      setIsEditMode(false);

      fetchIndikator();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Gagal memperbarui target",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleTambahAnggaranPerubahan = async (targetId) => {
    try {
      await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/perencanaan/post/anggaran-perubahan`,
        { targetId }
      );

      toast({
        title: "Berhasil",
        description: "Anggaran perubahan berhasil ditambahkan",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      fetchIndikator();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Gagal menambahkan anggaran perubahan",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const [apTargetId, setApTargetId] = useState(null);
  const [apAmount, setApAmount] = useState(0);
  const [apYear, setApYear] = useState(null);

  // state untuk edit anggaran perubahan
  const {
    isOpen: isEditApOpen,
    onOpen: onEditApOpen,
    onClose: onEditApClose,
  } = useDisclosure();
  const [selectedTahunAnggaran, setSelectedTahunAnggaran] = useState(null);
  const [editApAmount, setEditApAmount] = useState(0);
  const [editApYear, setEditApYear] = useState(null);

  const openApModal = (targetId, tahun) => {
    setApTargetId(targetId);
    setApAmount(0);
    setApYear(tahun || filterTahun || new Date().getFullYear());
    onApOpen();
  };

  const openEditApModal = (tahunAnggaran) => {
    setSelectedTahunAnggaran(tahunAnggaran);
    setEditApAmount(tahunAnggaran.anggaran?.toString() || "");
    setEditApYear(tahunAnggaran.tahun?.toString() || "");
    onEditApOpen();
  };

  const submitAnggaranPerubahan = async () => {
    if (!apTargetId || !apAmount || apAmount <= 0 || !apYear) {
      toast({
        title: "Peringatan",
        description: "Isi nominal anggaran dengan benar dan pilih tahun filter",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/perencanaan/post/anggaran-perubahan`,
        {
          targetId: apTargetId,
          anggaran: parseInt(apAmount),
          tahun: parseInt(apYear),
        }
      );
      toast({
        title: "Berhasil",
        description: "Anggaran perubahan disimpan",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onApClose();
      setApTargetId(null);
      setApAmount(0);
      setApYear(null);
      fetchIndikator();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Gagal menyimpan anggaran perubahan",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUpdateAnggaranPerubahan = async () => {
    if (
      !selectedTahunAnggaran ||
      !editApAmount ||
      editApAmount <= 0 ||
      !editApYear
    ) {
      toast({
        title: "Peringatan",
        description: "Isi nominal anggaran dengan benar",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/perencanaan/update/anggaran-perubahan`,
        {
          tahunAnggaranId: selectedTahunAnggaran.id,
          anggaran: parseInt(editApAmount),
          tahun: parseInt(editApYear),
        }
      );
      toast({
        title: "Berhasil",
        description: "Anggaran perubahan berhasil diperbarui",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onEditApClose();
      setSelectedTahunAnggaran(null);
      setEditApAmount(0);
      setEditApYear(null);
      fetchIndikator();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description:
          err.response?.data?.message || "Gagal memperbarui anggaran perubahan",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <LayoutPerencanaan>
      <Box
        bg={colorMode === "dark" ? "gray.700" : "gray.50"}
        pb="40px"
        px="0"
        minH="100vh"
      >
        <Container maxW="container.xl" py={8}>
          {/* Header Section */}
          <Box mb={8}>
            <Heading
              size="xl"
              mb={2}
              color={colorMode === "dark" ? "white" : "gray.800"}
            >
              📊 Target Indikator
            </Heading>
            <Text color="gray.500" fontSize="md">
              Kelola target, anggaran pada Indikator
            </Text>
          </Box>

          {/* Filter Section */}
          <Card mb={8} shadow="sm">
            <CardHeader pb={4}>
              <Heading
                size="md"
                color={colorMode === "dark" ? "white" : "gray.700"}
              >
                🔍 Filter Data
              </Heading>
            </CardHeader>
            <CardBody pt={0}>
              <Flex gap={6} wrap="wrap" align="end">
                <FormControl maxW="200px">
                  <FormLabel
                    fontSize="sm"
                    fontWeight="semibold"
                    color="gray.600"
                  >
                    <Icon as={FiCalendar} mr={2} />
                    Tahun
                  </FormLabel>
                  <Input
                    placeholder="Contoh: 2024"
                    type="number"
                    value={filterTahun || ""}
                    onChange={(e) => setFilterTahun(parseInt(e.target.value))}
                    size="md"
                    borderRadius="lg"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: "blue.400",
                      boxShadow: "0 0 0 1px #3182CE",
                    }}
                  />
                </FormControl>
                <FormControl maxW="250px">
                  <FormLabel
                    fontSize="sm"
                    fontWeight="semibold"
                    color="gray.600"
                  >
                    <Icon as={FiDollarSign} mr={2} />
                    Jenis Anggaran
                  </FormLabel>
                  <Select2
                    options={dataJenisAnggaran.map((val) => ({
                      value: val.id,
                      label: val.jenis,
                    }))}
                    placeholder="Pilih jenis anggaran"
                    onChange={(opt) =>
                      setFilterJenisAnggaranId(opt?.value || null)
                    }
                    chakraStyles={{
                      container: (provided) => ({
                        ...provided,
                        minWidth: "200px",
                      }),
                    }}
                  />
                </FormControl>
              </Flex>
            </CardBody>
          </Card>

          {/* List indikator Program */}
          <Box mb={10}>
            <Card
              mb={6}
              bgGradient={
                colorMode === "dark"
                  ? "linear(to-r, purple.900, purple.800)"
                  : "linear(to-r, purple.50, purple.100)"
              }
              border="2px solid"
              borderColor="purple.300"
              shadow="lg"
            >
              <CardBody>
                <HStack mb={2}>
                  <Box
                    p={3}
                    bg="purple.500"
                    borderRadius="full"
                    color="white"
                    boxShadow="md"
                  >
                    <Icon as={FiTarget} boxSize={6} />
                  </Box>
                  <Box flex={1}>
                    <Heading
                      size="lg"
                      color={colorMode === "dark" ? "white" : "purple.800"}
                      mb={1}
                    >
                      Indikator Program
                    </Heading>
                    <Text
                      fontSize="sm"
                      color={colorMode === "dark" ? "purple.200" : "purple.600"}
                    >
                      Level 1 - Indikator kinerja pada tingkat program
                    </Text>
                  </Box>
                  <Badge
                    colorScheme="purple"
                    fontSize="lg"
                    px={4}
                    py={2}
                    borderRadius="full"
                    variant="solid"
                  >
                    {DataIndikatorProgram.length} Indikator
                  </Badge>
                </HStack>
              </CardBody>
            </Card>

            {DataIndikatorProgram.length > 0 ? (
              <Accordion allowToggle>
                {DataIndikatorProgram.map((indikator) => (
                  <AccordionItem
                    key={indikator.id}
                    mb={4}
                    border="none"
                    borderRadius="lg"
                    overflow="hidden"
                    shadow="md"
                    borderLeft="4px solid"
                    borderLeftColor="purple.500"
                  >
                    <h2>
                      <AccordionButton
                        bg={colorMode === "dark" ? "gray.800" : "white"}
                        _hover={{
                          bg: colorMode === "dark" ? "gray.700" : "purple.50",
                        }}
                        py={6}
                        px={6}
                      >
                        <Box flex="1" textAlign="left">
                          <HStack mb={2}>
                            <Badge
                              colorScheme="purple"
                              variant="solid"
                              fontSize="xs"
                              px={2}
                              py={1}
                            >
                              PROGRAM
                            </Badge>
                          </HStack>
                          <Text fontWeight="bold" fontSize="lg" mb={2}>
                            {indikator.indikator}
                          </Text>
                          <HStack mb={2}>
                            <Text fontSize="sm" color="gray.500">
                              {indikator.program?.nama}
                            </Text>
                          </HStack>
                          {/* Tahun Anggaran, Anggaran, dan Jenis Anggaran */}
                          {indikator.targets &&
                            indikator.targets.length > 0 &&
                            (() => {
                              // Mengumpulkan semua tahun anggaran dari semua targets
                              const allTahunAnggarans = [];
                              indikator.targets.forEach((t) => {
                                if (
                                  t.tahunAnggarans &&
                                  t.tahunAnggarans.length > 0
                                ) {
                                  allTahunAnggarans.push(...t.tahunAnggarans);
                                }
                              });

                              if (allTahunAnggarans.length > 0) {
                                // Mengelompokkan berdasarkan tahun
                                const tahunMap = {};
                                allTahunAnggarans.forEach((th) => {
                                  if (!tahunMap[th.tahun]) {
                                    tahunMap[th.tahun] = [];
                                  }
                                  tahunMap[th.tahun].push(th);
                                });

                                return (
                                  <VStack align="start" spacing={2} mt={2}>
                                    {Object.keys(tahunMap)
                                      .sort((a, b) => b - a)
                                      .map((tahun) => {
                                        const anggarans = tahunMap[tahun];
                                        const anggaranMurni = anggarans.find(
                                          (a) => a.jenisAnggaranId === 1
                                        );
                                        const anggaranPerubahan =
                                          anggarans.find(
                                            (a) => a.jenisAnggaranId === 2
                                          );
                                        const anggaranAktif =
                                          anggaranPerubahan || anggaranMurni;

                                        return (
                                          <HStack
                                            key={tahun}
                                            spacing={3}
                                            flexWrap="wrap"
                                            fontSize="xs"
                                          >
                                            <HStack spacing={1}>
                                              <Icon
                                                as={FiCalendar}
                                                color="purple.500"
                                                boxSize={3}
                                              />
                                              <Text fontWeight="semibold">
                                                {tahun}:
                                              </Text>
                                            </HStack>
                                            <HStack spacing={1}>
                                              <Icon
                                                as={FiDollarSign}
                                                color="green.500"
                                                boxSize={3}
                                              />
                                              <Text>
                                                Rp{" "}
                                                {(
                                                  anggaranAktif?.anggaran || 0
                                                ).toLocaleString()}
                                              </Text>
                                            </HStack>
                                            {anggaranAktif && (
                                              <Badge
                                                colorScheme="purple"
                                                variant="subtle"
                                                fontSize="xs"
                                              >
                                                {
                                                  dataJenisAnggaran.find(
                                                    (ja) =>
                                                      ja.id ===
                                                      anggaranAktif.jenisAnggaranId
                                                  )?.jenis
                                                }
                                              </Badge>
                                            )}
                                          </HStack>
                                        );
                                      })}
                                  </VStack>
                                );
                              }
                              return null;
                            })()}
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel
                      pb={6}
                      bg={colorMode === "dark" ? "gray.900" : "gray.50"}
                      px={6}
                    >
                      <VStack align="start" spacing={4}>
                        {indikator.targets && indikator.targets.length > 0 ? (
                          indikator.targets.map((t) => (
                            <Card
                              key={t.id}
                              w="100%"
                              shadow="sm"
                              border="1px solid"
                              borderColor="purple.200"
                              bg={colorMode === "dark" ? "gray.800" : "white"}
                            >
                              <CardBody>
                                <HStack mb={4}>
                                  <Icon
                                    as={FiTarget}
                                    color="green.500"
                                    boxSize={5}
                                  />
                                  <Text fontWeight="semibold" fontSize="lg">
                                    Target: {t.nilai}
                                  </Text>
                                  <Spacer />
                                  <Badge colorScheme="green" variant="subtle">
                                    Aktif
                                  </Badge>
                                </HStack>

                                {t.tahunAnggarans &&
                                  t.tahunAnggarans.length > 0 && (
                                    <>
                                      <Divider mb={4} />
                                      <VStack align="start" spacing={3}>
                                        {t.tahunAnggarans.map((th) => (
                                          <Box
                                            key={th.id}
                                            p={4}
                                            bg={
                                              colorMode === "dark"
                                                ? "gray.800"
                                                : "white"
                                            }
                                            borderRadius="md"
                                            border="1px solid"
                                            borderColor="purple.200"
                                            w="100%"
                                            position="relative"
                                            _before={{
                                              content: '""',
                                              position: "absolute",
                                              left: 0,
                                              top: 0,
                                              bottom: 0,
                                              width: "4px",
                                              bg: "purple.500",
                                              borderRadius: "0 2px 2px 0",
                                            }}
                                          >
                                            <VStack align="start" spacing={2}>
                                              <HStack>
                                                <Icon
                                                  as={FiCalendar}
                                                  color="purple.500"
                                                  boxSize={4}
                                                />
                                                <Text
                                                  fontSize="sm"
                                                  fontWeight="semibold"
                                                >
                                                  Tahun: {th.tahun}
                                                </Text>
                                              </HStack>
                                              <HStack>
                                                <Icon
                                                  as={FiDollarSign}
                                                  color="green.500"
                                                  boxSize={4}
                                                />
                                                <Text fontSize="sm">
                                                  Anggaran:{" "}
                                                  <Text
                                                    as="span"
                                                    fontWeight="bold"
                                                    color="green.600"
                                                  >
                                                    Rp{" "}
                                                    {th.anggaran.toLocaleString()}
                                                  </Text>
                                                </Text>
                                              </HStack>
                                              <Text fontSize="sm">
                                                Jenis Anggaran:{" "}
                                                <Badge
                                                  colorScheme="purple"
                                                  variant="outline"
                                                  fontSize="xs"
                                                >
                                                  {
                                                    dataJenisAnggaran.find(
                                                      (ja) =>
                                                        ja.id ===
                                                        th.jenisAnggaranId
                                                    )?.jenis
                                                  }
                                                </Badge>
                                              </Text>
                                              <Flex
                                                justify="end"
                                                w="100%"
                                                mt={2}
                                                gap={2}
                                              >
                                                {(() => {
                                                  // Cek apakah sudah ada anggaran murni dan anggaran perubahan untuk tahun yang sama
                                                  const hasAnggaranMurni =
                                                    t.tahunAnggarans?.some(
                                                      (ta) =>
                                                        ta.tahun === th.tahun &&
                                                        ta.jenisAnggaranId === 1
                                                    );
                                                  const anggaranPerubahan =
                                                    t.tahunAnggarans?.find(
                                                      (ta) =>
                                                        ta.tahun === th.tahun &&
                                                        ta.jenisAnggaranId === 2
                                                    );
                                                  const hasAnggaranPerubahan =
                                                    !!anggaranPerubahan;
                                                  const canAddAnggaranPerubahan =
                                                    hasAnggaranMurni &&
                                                    !hasAnggaranPerubahan;

                                                  // Jika ada anggaran perubahan, tampilkan tombol edit
                                                  if (
                                                    hasAnggaranPerubahan &&
                                                    anggaranPerubahan
                                                  ) {
                                                    return (
                                                      <Button
                                                        size="xs"
                                                        colorScheme="orange"
                                                        variant="solid"
                                                        leftIcon={
                                                          <Icon as={FiEdit} />
                                                        }
                                                        onClick={() => {
                                                          openEditApModal(
                                                            anggaranPerubahan
                                                          );
                                                        }}
                                                      >
                                                        Edit Anggaran Perubahan
                                                      </Button>
                                                    );
                                                  }

                                                  // Jika belum ada anggaran perubahan, tampilkan tombol tambah
                                                  if (canAddAnggaranPerubahan) {
                                                    return (
                                                      <Button
                                                        id={String(t.id)}
                                                        size="xs"
                                                        colorScheme="teal"
                                                        variant="outline"
                                                        leftIcon={
                                                          <Icon as={FiEdit} />
                                                        }
                                                        onClick={(e) => {
                                                          const id = parseInt(
                                                            e.currentTarget.id
                                                          );
                                                          openApModal(
                                                            id,
                                                            th.tahun
                                                          );
                                                        }}
                                                      >
                                                        Tambah Anggaran
                                                        Perubahan (Tahun{" "}
                                                        {th.tahun})
                                                      </Button>
                                                    );
                                                  }

                                                  return null;
                                                })()}
                                              </Flex>
                                            </VStack>
                                          </Box>
                                        ))}
                                      </VStack>
                                    </>
                                  )}

                                {/* Target Triwulan */}
                                {t.targetTriwulans &&
                                  t.targetTriwulans.length > 0 && (
                                    <>
                                      <Divider my={4} />
                                      <VStack align="start" spacing={3}>
                                        <HStack>
                                          <Icon
                                            as={FiTarget}
                                            color="orange.500"
                                            boxSize={4}
                                          />
                                          <Text
                                            fontSize="md"
                                            fontWeight="semibold"
                                            color="orange.600"
                                          >
                                            Target Triwulan
                                          </Text>
                                        </HStack>
                                        <Box
                                          w="100%"
                                          p={3}
                                          bg={
                                            colorMode === "dark"
                                              ? "gray.800"
                                              : "orange.50"
                                          }
                                          borderRadius="md"
                                          border="1px solid"
                                          borderColor="orange.200"
                                        >
                                          <VStack spacing={2}>
                                            {t.targetTriwulans.map(
                                              (triwulan) => (
                                                <HStack
                                                  key={triwulan.id}
                                                  w="100%"
                                                  justify="space-between"
                                                >
                                                  <Text
                                                    fontSize="sm"
                                                    fontWeight="medium"
                                                  >
                                                    {triwulan.namaTarget.nama}:
                                                  </Text>
                                                  <Badge
                                                    colorScheme="orange"
                                                    variant="solid"
                                                    fontSize="sm"
                                                    px={3}
                                                    py={1}
                                                  >
                                                    {triwulan.nilai}{" "}
                                                    {indikator.satuanIndikator
                                                      ?.satuan || ""}
                                                  </Badge>
                                                </HStack>
                                              )
                                            )}
                                          </VStack>
                                        </Box>
                                      </VStack>
                                    </>
                                  )}

                                <Divider my={4} />
                                <Flex gap={2} justify="end">
                                  <Button
                                    size="sm"
                                    colorScheme="teal"
                                    variant="outline"
                                    leftIcon={<Icon as={FiEdit} />}
                                    onClick={() =>
                                      handleOpenEditModal(
                                        t,
                                        indikator,
                                        "program"
                                      )
                                    }
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    colorScheme="red"
                                    variant="outline"
                                    leftIcon={<Icon as={FiTrash2} />}
                                  >
                                    Hapus
                                  </Button>
                                </Flex>
                              </CardBody>
                            </Card>
                          ))
                        ) : (
                          <Box
                            textAlign="center"
                            py={8}
                            w="100%"
                            bg={colorMode === "dark" ? "gray.800" : "white"}
                            borderRadius="md"
                            border="2px dashed"
                            borderColor="purple.300"
                          >
                            <Icon
                              as={FiTarget}
                              boxSize={8}
                              color="purple.400"
                              mb={2}
                            />
                            <Text fontSize="sm" color="gray.400">
                              Belum ada target yang ditambahkan
                            </Text>
                          </Box>
                        )}
                      </VStack>

                      <Flex mt={6} justify="end">
                        <Button
                          size="md"
                          colorScheme="purple"
                          leftIcon={<Icon as={FiPlus} />}
                          onClick={() => handleOpenModal(indikator, "program")}
                          borderRadius="lg"
                          shadow="md"
                        >
                          Tambah Target
                        </Button>
                      </Flex>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <Card
                border="2px dashed"
                borderColor="purple.300"
                bg={colorMode === "dark" ? "gray.800" : "purple.50"}
              >
                <CardBody textAlign="center" py={10}>
                  <Icon as={FiTarget} boxSize={12} color="purple.400" mb={4} />
                  <Text fontSize="lg" color="gray.500" fontWeight="medium">
                    Belum ada indikator program
                  </Text>
                </CardBody>
              </Card>
            )}
          </Box>

          {/* List indikator Kegiatan */}
          <Box mb={10}>
            <Card
              mb={6}
              bgGradient={
                colorMode === "dark"
                  ? "linear(to-r, orange.900, orange.800)"
                  : "linear(to-r, orange.50, orange.100)"
              }
              border="2px solid"
              borderColor="orange.300"
              shadow="lg"
            >
              <CardBody>
                <HStack mb={2}>
                  <Box
                    p={3}
                    bg="orange.500"
                    borderRadius="full"
                    color="white"
                    boxShadow="md"
                  >
                    <Icon as={FiTarget} boxSize={6} />
                  </Box>
                  <Box flex={1}>
                    <Heading
                      size="lg"
                      color={colorMode === "dark" ? "white" : "orange.800"}
                      mb={1}
                    >
                      Indikator Kegiatan
                    </Heading>
                    <Text
                      fontSize="sm"
                      color={colorMode === "dark" ? "orange.200" : "orange.600"}
                    >
                      Level 2 - Indikator kinerja pada tingkat kegiatan
                    </Text>
                  </Box>
                  <Badge
                    colorScheme="orange"
                    fontSize="lg"
                    px={4}
                    py={2}
                    borderRadius="full"
                    variant="solid"
                  >
                    {DataIndikatorKegiatan.length} Indikator
                  </Badge>
                </HStack>
              </CardBody>
            </Card>

            {DataIndikatorKegiatan.length > 0 ? (
              <Accordion allowToggle>
                {DataIndikatorKegiatan.map((indikator) => (
                  <AccordionItem
                    key={indikator.id}
                    mb={4}
                    border="none"
                    borderRadius="lg"
                    overflow="hidden"
                    shadow="md"
                    borderLeft="4px solid"
                    borderLeftColor="orange.500"
                  >
                    <h2>
                      <AccordionButton
                        bg={colorMode === "dark" ? "gray.800" : "white"}
                        _hover={{
                          bg: colorMode === "dark" ? "gray.700" : "orange.50",
                        }}
                        py={6}
                        px={6}
                      >
                        <Box flex="1" textAlign="left">
                          <HStack mb={2}>
                            <Badge
                              colorScheme="orange"
                              variant="solid"
                              fontSize="xs"
                              px={2}
                              py={1}
                            >
                              KEGIATAN
                            </Badge>
                          </HStack>
                          <Text fontWeight="bold" fontSize="lg" mb={2}>
                            {indikator.indikator}
                          </Text>
                          {indikator.kegiatan?.nama && (
                            <Text fontSize="sm" color="gray.500" mb={2}>
                              {indikator.kegiatan.nama}
                            </Text>
                          )}
                          {/* Tahun Anggaran, Anggaran, dan Jenis Anggaran */}
                          {indikator.targets &&
                            indikator.targets.length > 0 &&
                            (() => {
                              // Mengumpulkan semua tahun anggaran dari semua targets
                              const allTahunAnggarans = [];
                              indikator.targets.forEach((t) => {
                                if (
                                  t.tahunAnggarans &&
                                  t.tahunAnggarans.length > 0
                                ) {
                                  allTahunAnggarans.push(...t.tahunAnggarans);
                                }
                              });

                              if (allTahunAnggarans.length > 0) {
                                // Mengelompokkan berdasarkan tahun
                                const tahunMap = {};
                                allTahunAnggarans.forEach((th) => {
                                  if (!tahunMap[th.tahun]) {
                                    tahunMap[th.tahun] = [];
                                  }
                                  tahunMap[th.tahun].push(th);
                                });

                                return (
                                  <VStack align="start" spacing={2} mt={2}>
                                    {Object.keys(tahunMap)
                                      .sort((a, b) => b - a)
                                      .map((tahun) => {
                                        const anggarans = tahunMap[tahun];
                                        const anggaranMurni = anggarans.find(
                                          (a) => a.jenisAnggaranId === 1
                                        );
                                        const anggaranPerubahan =
                                          anggarans.find(
                                            (a) => a.jenisAnggaranId === 2
                                          );
                                        const anggaranAktif =
                                          anggaranPerubahan || anggaranMurni;

                                        return (
                                          <HStack
                                            key={tahun}
                                            spacing={3}
                                            flexWrap="wrap"
                                            fontSize="xs"
                                          >
                                            <HStack spacing={1}>
                                              <Icon
                                                as={FiCalendar}
                                                color="orange.500"
                                                boxSize={3}
                                              />
                                              <Text fontWeight="semibold">
                                                {tahun}:
                                              </Text>
                                            </HStack>
                                            <HStack spacing={1}>
                                              <Icon
                                                as={FiDollarSign}
                                                color="green.500"
                                                boxSize={3}
                                              />
                                              <Text>
                                                Rp{" "}
                                                {(
                                                  anggaranAktif?.anggaran || 0
                                                ).toLocaleString()}
                                              </Text>
                                            </HStack>
                                            {anggaranAktif && (
                                              <Badge
                                                colorScheme="orange"
                                                variant="subtle"
                                                fontSize="xs"
                                              >
                                                {
                                                  dataJenisAnggaran.find(
                                                    (ja) =>
                                                      ja.id ===
                                                      anggaranAktif.jenisAnggaranId
                                                  )?.jenis
                                                }
                                              </Badge>
                                            )}
                                          </HStack>
                                        );
                                      })}
                                  </VStack>
                                );
                              }
                              return null;
                            })()}
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel
                      pb={6}
                      bg={colorMode === "dark" ? "gray.900" : "gray.50"}
                      px={6}
                    >
                      <VStack align="start" spacing={4}>
                        {indikator.targets && indikator.targets.length > 0 ? (
                          indikator.targets.map((t) => (
                            <Card
                              key={t.id}
                              w="100%"
                              shadow="sm"
                              border="1px solid"
                              borderColor="orange.200"
                              bg={colorMode === "dark" ? "gray.800" : "white"}
                            >
                              <CardBody>
                                <HStack mb={4}>
                                  <Icon
                                    as={FiTarget}
                                    color="green.500"
                                    boxSize={5}
                                  />
                                  <Text fontWeight="semibold" fontSize="lg">
                                    Target: {t.nilai}
                                  </Text>
                                  <Spacer />
                                  <Badge colorScheme="green" variant="subtle">
                                    Aktif
                                  </Badge>
                                </HStack>

                                {t.tahunAnggarans &&
                                  t.tahunAnggarans.length > 0 && (
                                    <>
                                      <Divider mb={4} />
                                      <VStack align="start" spacing={3}>
                                        {t.tahunAnggarans.map((th) => (
                                          <Box
                                            key={th.id}
                                            p={4}
                                            bg={
                                              colorMode === "dark"
                                                ? "gray.800"
                                                : "white"
                                            }
                                            borderRadius="md"
                                            border="1px solid"
                                            borderColor="orange.200"
                                            w="100%"
                                            position="relative"
                                            _before={{
                                              content: '""',
                                              position: "absolute",
                                              left: 0,
                                              top: 0,
                                              bottom: 0,
                                              width: "4px",
                                              bg: "orange.500",
                                              borderRadius: "0 2px 2px 0",
                                            }}
                                          >
                                            <VStack align="start" spacing={2}>
                                              <HStack>
                                                <Icon
                                                  as={FiCalendar}
                                                  color="orange.500"
                                                  boxSize={4}
                                                />
                                                <Text
                                                  fontSize="sm"
                                                  fontWeight="semibold"
                                                >
                                                  Tahun: {th.tahun}
                                                </Text>
                                              </HStack>
                                              <HStack>
                                                <Icon
                                                  as={FiDollarSign}
                                                  color="green.500"
                                                  boxSize={4}
                                                />
                                                <Text fontSize="sm">
                                                  Anggaran:{" "}
                                                  <Text
                                                    as="span"
                                                    fontWeight="bold"
                                                    color="green.600"
                                                  >
                                                    Rp{" "}
                                                    {th.anggaran.toLocaleString()}
                                                  </Text>
                                                </Text>
                                              </HStack>
                                              <Text fontSize="sm">
                                                Jenis Anggaran:{" "}
                                                <Badge
                                                  colorScheme="orange"
                                                  variant="outline"
                                                  fontSize="xs"
                                                >
                                                  {
                                                    dataJenisAnggaran.find(
                                                      (ja) =>
                                                        ja.id ===
                                                        th.jenisAnggaranId
                                                    )?.jenis
                                                  }
                                                </Badge>
                                              </Text>
                                              <Flex
                                                justify="end"
                                                w="100%"
                                                mt={2}
                                                gap={2}
                                              >
                                                {(() => {
                                                  // Cek apakah sudah ada anggaran murni dan anggaran perubahan untuk tahun yang sama
                                                  const hasAnggaranMurni =
                                                    t.tahunAnggarans?.some(
                                                      (ta) =>
                                                        ta.tahun === th.tahun &&
                                                        ta.jenisAnggaranId === 1
                                                    );
                                                  const anggaranPerubahan =
                                                    t.tahunAnggarans?.find(
                                                      (ta) =>
                                                        ta.tahun === th.tahun &&
                                                        ta.jenisAnggaranId === 2
                                                    );
                                                  const hasAnggaranPerubahan =
                                                    !!anggaranPerubahan;
                                                  const canAddAnggaranPerubahan =
                                                    hasAnggaranMurni &&
                                                    !hasAnggaranPerubahan;

                                                  // Jika ada anggaran perubahan, tampilkan tombol edit
                                                  if (
                                                    hasAnggaranPerubahan &&
                                                    anggaranPerubahan
                                                  ) {
                                                    return (
                                                      <Button
                                                        size="xs"
                                                        colorScheme="orange"
                                                        variant="solid"
                                                        leftIcon={
                                                          <Icon as={FiEdit} />
                                                        }
                                                        onClick={() => {
                                                          openEditApModal(
                                                            anggaranPerubahan
                                                          );
                                                        }}
                                                      >
                                                        Edit Anggaran Perubahan
                                                      </Button>
                                                    );
                                                  }

                                                  // Jika belum ada anggaran perubahan, tampilkan tombol tambah
                                                  if (canAddAnggaranPerubahan) {
                                                    return (
                                                      <Button
                                                        id={String(t.id)}
                                                        size="xs"
                                                        colorScheme="teal"
                                                        variant="outline"
                                                        leftIcon={
                                                          <Icon as={FiEdit} />
                                                        }
                                                        onClick={(e) => {
                                                          const id = parseInt(
                                                            e.currentTarget.id
                                                          );
                                                          openApModal(
                                                            id,
                                                            th.tahun
                                                          );
                                                        }}
                                                      >
                                                        Tambah Anggaran
                                                        Perubahan (Tahun{" "}
                                                        {th.tahun})
                                                      </Button>
                                                    );
                                                  }

                                                  return null;
                                                })()}
                                              </Flex>
                                            </VStack>
                                          </Box>
                                        ))}
                                      </VStack>
                                    </>
                                  )}

                                {/* Target Triwulan */}
                                {t.targetTriwulans &&
                                  t.targetTriwulans.length > 0 && (
                                    <>
                                      <Divider my={4} />
                                      <VStack align="start" spacing={3}>
                                        <HStack>
                                          <Icon
                                            as={FiTarget}
                                            color="orange.500"
                                            boxSize={4}
                                          />
                                          <Text
                                            fontSize="md"
                                            fontWeight="semibold"
                                            color="orange.600"
                                          >
                                            Target Triwulan
                                          </Text>
                                        </HStack>
                                        <Box
                                          w="100%"
                                          p={3}
                                          bg={
                                            colorMode === "dark"
                                              ? "gray.800"
                                              : "orange.50"
                                          }
                                          borderRadius="md"
                                          border="1px solid"
                                          borderColor="orange.200"
                                        >
                                          <VStack spacing={2}>
                                            {t.targetTriwulans.map(
                                              (triwulan) => (
                                                <HStack
                                                  key={triwulan.id}
                                                  w="100%"
                                                  justify="space-between"
                                                >
                                                  <Text
                                                    fontSize="sm"
                                                    fontWeight="medium"
                                                  >
                                                    {triwulan.namaTarget.nama}:
                                                  </Text>
                                                  <Badge
                                                    colorScheme="orange"
                                                    variant="solid"
                                                    fontSize="sm"
                                                    px={3}
                                                    py={1}
                                                  >
                                                    {triwulan.nilai}{" "}
                                                    {indikator.satuanIndikator
                                                      ?.satuan || ""}
                                                  </Badge>
                                                </HStack>
                                              )
                                            )}
                                          </VStack>
                                        </Box>
                                      </VStack>
                                    </>
                                  )}

                                <Divider my={4} />
                                <Flex gap={2} justify="end">
                                  <Button
                                    size="sm"
                                    colorScheme="teal"
                                    variant="outline"
                                    leftIcon={<Icon as={FiEdit} />}
                                    onClick={() =>
                                      handleOpenEditModal(
                                        t,
                                        indikator,
                                        "kegiatan"
                                      )
                                    }
                                  >
                                    Edit
                                  </Button>
                                </Flex>
                              </CardBody>
                            </Card>
                          ))
                        ) : (
                          <Box
                            textAlign="center"
                            py={8}
                            w="100%"
                            bg={colorMode === "dark" ? "gray.800" : "white"}
                            borderRadius="md"
                            border="2px dashed"
                            borderColor="orange.300"
                          >
                            <Icon
                              as={FiTarget}
                              boxSize={8}
                              color="orange.400"
                              mb={2}
                            />
                            <Text fontSize="sm" color="gray.400">
                              Belum ada target yang ditambahkan
                            </Text>
                          </Box>
                        )}
                      </VStack>

                      <Flex mt={6} justify="end">
                        <Button
                          size="md"
                          colorScheme="orange"
                          leftIcon={<Icon as={FiPlus} />}
                          onClick={() => handleOpenModal(indikator, "kegiatan")}
                          borderRadius="lg"
                          shadow="md"
                        >
                          Tambah Target
                        </Button>
                      </Flex>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <Card
                border="2px dashed"
                borderColor="orange.300"
                bg={colorMode === "dark" ? "gray.800" : "orange.50"}
              >
                <CardBody textAlign="center" py={10}>
                  <Icon as={FiTarget} boxSize={12} color="orange.400" mb={4} />
                  <Text fontSize="lg" color="gray.500" fontWeight="medium">
                    Belum ada indikator kegiatan
                  </Text>
                </CardBody>
              </Card>
            )}
          </Box>

          {/* List indikator Sub Kegiatan */}
          <Box mb={8}>
            <Card
              mb={6}
              bgGradient={
                colorMode === "dark"
                  ? "linear(to-r, blue.900, blue.800)"
                  : "linear(to-r, blue.50, blue.100)"
              }
              border="2px solid"
              borderColor="blue.300"
              shadow="lg"
            >
              <CardBody>
                <HStack mb={2}>
                  <Box
                    p={3}
                    bg="blue.500"
                    borderRadius="full"
                    color="white"
                    boxShadow="md"
                  >
                    <Icon as={FiTarget} boxSize={6} />
                  </Box>
                  <Box flex={1}>
                    <Heading
                      size="lg"
                      color={colorMode === "dark" ? "white" : "blue.800"}
                      mb={1}
                    >
                      Indikator Sub Kegiatan
                    </Heading>
                    <Text
                      fontSize="sm"
                      color={colorMode === "dark" ? "blue.200" : "blue.600"}
                    >
                      Level 3 - Indikator kinerja pada tingkat sub kegiatan
                    </Text>
                  </Box>
                  <Badge
                    colorScheme="blue"
                    fontSize="lg"
                    px={4}
                    py={2}
                    borderRadius="full"
                    variant="solid"
                  >
                    {DataIndikator.length} Indikator
                  </Badge>
                </HStack>
              </CardBody>
            </Card>

            {DataIndikator.length > 0 ? (
              <Accordion allowToggle>
                {DataIndikator.map((indikator) => (
                  <AccordionItem
                    key={indikator.id}
                    mb={4}
                    border="none"
                    borderRadius="lg"
                    overflow="hidden"
                    shadow="md"
                    borderLeft="4px solid"
                    borderLeftColor="blue.500"
                  >
                    <h2>
                      <AccordionButton
                        bg={colorMode === "dark" ? "gray.800" : "white"}
                        _hover={{
                          bg: colorMode === "dark" ? "gray.700" : "blue.50",
                        }}
                        py={6}
                        px={6}
                      >
                        <Box flex="1" textAlign="left">
                          <HStack mb={2}>
                            <Badge
                              colorScheme="blue"
                              variant="solid"
                              fontSize="xs"
                              px={2}
                              py={1}
                            >
                              SUB KEGIATAN
                            </Badge>
                          </HStack>
                          <Text fontWeight="bold" fontSize="lg" mb={2}>
                            {indikator.indikator}
                          </Text>
                          <Text fontSize="sm" color="gray.500" mb={2}>
                            {indikator.subKegPer?.nama}
                          </Text>
                          {/* Tahun Anggaran, Anggaran, dan Jenis Anggaran */}
                          {indikator.targets &&
                            indikator.targets.length > 0 &&
                            (() => {
                              // Mengumpulkan semua tahun anggaran dari semua targets
                              const allTahunAnggarans = [];
                              indikator.targets.forEach((t) => {
                                if (
                                  t.tahunAnggarans &&
                                  t.tahunAnggarans.length > 0
                                ) {
                                  allTahunAnggarans.push(...t.tahunAnggarans);
                                }
                              });

                              if (allTahunAnggarans.length > 0) {
                                // Mengelompokkan berdasarkan tahun
                                const tahunMap = {};
                                allTahunAnggarans.forEach((th) => {
                                  if (!tahunMap[th.tahun]) {
                                    tahunMap[th.tahun] = [];
                                  }
                                  tahunMap[th.tahun].push(th);
                                });

                                return (
                                  <VStack align="start" spacing={2} mt={2}>
                                    {Object.keys(tahunMap)
                                      .sort((a, b) => b - a)
                                      .map((tahun) => {
                                        const anggarans = tahunMap[tahun];
                                        const anggaranMurni = anggarans.find(
                                          (a) => a.jenisAnggaranId === 1
                                        );
                                        const anggaranPerubahan =
                                          anggarans.find(
                                            (a) => a.jenisAnggaranId === 2
                                          );
                                        const anggaranAktif =
                                          anggaranPerubahan || anggaranMurni;

                                        return (
                                          <HStack
                                            key={tahun}
                                            spacing={3}
                                            flexWrap="wrap"
                                            fontSize="xs"
                                          >
                                            <HStack spacing={1}>
                                              <Icon
                                                as={FiCalendar}
                                                color="blue.500"
                                                boxSize={3}
                                              />
                                              <Text fontWeight="semibold">
                                                {tahun}:
                                              </Text>
                                            </HStack>
                                            <HStack spacing={1}>
                                              <Icon
                                                as={FiDollarSign}
                                                color="green.500"
                                                boxSize={3}
                                              />
                                              <Text>
                                                Rp{" "}
                                                {(
                                                  anggaranAktif?.anggaran || 0
                                                ).toLocaleString()}
                                              </Text>
                                            </HStack>
                                            {anggaranAktif && (
                                              <Badge
                                                colorScheme="blue"
                                                variant="subtle"
                                                fontSize="xs"
                                              >
                                                {
                                                  dataJenisAnggaran.find(
                                                    (ja) =>
                                                      ja.id ===
                                                      anggaranAktif.jenisAnggaranId
                                                  )?.jenis
                                                }
                                              </Badge>
                                            )}
                                          </HStack>
                                        );
                                      })}
                                  </VStack>
                                );
                              }
                              return null;
                            })()}
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel
                      pb={6}
                      bg={colorMode === "dark" ? "gray.900" : "gray.50"}
                      px={6}
                    >
                      <VStack align="start" spacing={4}>
                        {indikator.targets && indikator.targets.length > 0 ? (
                          indikator.targets.map((t) => (
                            <Card
                              key={t.id}
                              w="100%"
                              shadow="sm"
                              border="1px solid"
                              borderColor="blue.200"
                              bg={colorMode === "dark" ? "gray.800" : "white"}
                            >
                              <CardBody>
                                <HStack mb={4}>
                                  <Icon
                                    as={FiTarget}
                                    color="green.500"
                                    boxSize={5}
                                  />
                                  <Text fontWeight="semibold" fontSize="lg">
                                    Target: {t.nilai}
                                  </Text>
                                  <Spacer />
                                  <Badge colorScheme="green" variant="subtle">
                                    Aktif
                                  </Badge>
                                </HStack>

                                {t.tahunAnggarans &&
                                  t.tahunAnggarans.length > 0 && (
                                    <>
                                      <Divider mb={4} />
                                      <VStack align="start" spacing={3}>
                                        {t.tahunAnggarans.map((th) => (
                                          <Box
                                            key={th.id}
                                            p={4}
                                            bg={
                                              colorMode === "dark"
                                                ? "gray.800"
                                                : "white"
                                            }
                                            borderRadius="md"
                                            border="1px solid"
                                            borderColor="blue.200"
                                            w="100%"
                                            position="relative"
                                            _before={{
                                              content: '""',
                                              position: "absolute",
                                              left: 0,
                                              top: 0,
                                              bottom: 0,
                                              width: "4px",
                                              bg: "blue.500",
                                              borderRadius: "0 2px 2px 0",
                                            }}
                                          >
                                            <VStack align="start" spacing={2}>
                                              <HStack>
                                                <Icon
                                                  as={FiCalendar}
                                                  color="blue.500"
                                                  boxSize={4}
                                                />
                                                <Text
                                                  fontSize="sm"
                                                  fontWeight="semibold"
                                                >
                                                  Tahun: {th.tahun}
                                                </Text>
                                              </HStack>
                                              <HStack>
                                                <Icon
                                                  as={FiDollarSign}
                                                  color="green.500"
                                                  boxSize={4}
                                                />
                                                <Text fontSize="sm">
                                                  Anggaran:{" "}
                                                  <Text
                                                    as="span"
                                                    fontWeight="bold"
                                                    color="green.600"
                                                  >
                                                    Rp{" "}
                                                    {th.anggaran.toLocaleString()}
                                                  </Text>
                                                </Text>
                                              </HStack>
                                              <Text fontSize="sm">
                                                Jenis Anggaran:{" "}
                                                <Badge
                                                  colorScheme="blue"
                                                  variant="outline"
                                                  fontSize="xs"
                                                >
                                                  {
                                                    dataJenisAnggaran.find(
                                                      (ja) =>
                                                        ja.id ===
                                                        th.jenisAnggaranId
                                                    )?.jenis
                                                  }
                                                </Badge>
                                              </Text>
                                              <Flex
                                                justify="end"
                                                w="100%"
                                                mt={2}
                                                gap={2}
                                              >
                                                {(() => {
                                                  // Cek apakah sudah ada anggaran murni dan anggaran perubahan untuk tahun yang sama
                                                  const hasAnggaranMurni =
                                                    t.tahunAnggarans?.some(
                                                      (ta) =>
                                                        ta.tahun === th.tahun &&
                                                        ta.jenisAnggaranId === 1
                                                    );
                                                  const anggaranPerubahan =
                                                    t.tahunAnggarans?.find(
                                                      (ta) =>
                                                        ta.tahun === th.tahun &&
                                                        ta.jenisAnggaranId === 2
                                                    );
                                                  const hasAnggaranPerubahan =
                                                    !!anggaranPerubahan;
                                                  const canAddAnggaranPerubahan =
                                                    hasAnggaranMurni &&
                                                    !hasAnggaranPerubahan;

                                                  // Jika ada anggaran perubahan, tampilkan tombol edit
                                                  if (
                                                    hasAnggaranPerubahan &&
                                                    anggaranPerubahan
                                                  ) {
                                                    return (
                                                      <Button
                                                        size="xs"
                                                        colorScheme="orange"
                                                        variant="solid"
                                                        leftIcon={
                                                          <Icon as={FiEdit} />
                                                        }
                                                        onClick={() => {
                                                          openEditApModal(
                                                            anggaranPerubahan
                                                          );
                                                        }}
                                                      >
                                                        Edit Anggaran Perubahan
                                                      </Button>
                                                    );
                                                  }

                                                  // Jika belum ada anggaran perubahan, tampilkan tombol tambah
                                                  if (canAddAnggaranPerubahan) {
                                                    return (
                                                      <Button
                                                        id={String(t.id)}
                                                        size="xs"
                                                        colorScheme="teal"
                                                        variant="outline"
                                                        leftIcon={
                                                          <Icon as={FiEdit} />
                                                        }
                                                        onClick={(e) => {
                                                          const id = parseInt(
                                                            e.currentTarget.id
                                                          );
                                                          openApModal(
                                                            id,
                                                            th.tahun
                                                          );
                                                        }}
                                                      >
                                                        Tambah Anggaran
                                                        Perubahan (Tahun{" "}
                                                        {th.tahun})
                                                      </Button>
                                                    );
                                                  }

                                                  return null;
                                                })()}
                                              </Flex>
                                            </VStack>
                                          </Box>
                                        ))}
                                      </VStack>
                                    </>
                                  )}

                                {/* Target Triwulan */}
                                {t.targetTriwulans &&
                                  t.targetTriwulans.length > 0 && (
                                    <>
                                      <Divider my={4} />
                                      <VStack align="start" spacing={3}>
                                        <HStack>
                                          <Icon
                                            as={FiTarget}
                                            color="orange.500"
                                            boxSize={4}
                                          />
                                          <Text
                                            fontSize="md"
                                            fontWeight="semibold"
                                            color="orange.600"
                                          >
                                            Target Triwulan
                                          </Text>
                                        </HStack>
                                        <Box
                                          w="100%"
                                          p={3}
                                          bg={
                                            colorMode === "dark"
                                              ? "gray.800"
                                              : "orange.50"
                                          }
                                          borderRadius="md"
                                          border="1px solid"
                                          borderColor="orange.200"
                                        >
                                          <VStack spacing={2}>
                                            {t.targetTriwulans.map(
                                              (triwulan) => (
                                                <HStack
                                                  key={triwulan.id}
                                                  w="100%"
                                                  justify="space-between"
                                                >
                                                  <Text
                                                    fontSize="sm"
                                                    fontWeight="medium"
                                                  >
                                                    {triwulan.namaTarget.nama}:
                                                  </Text>
                                                  <Badge
                                                    colorScheme="orange"
                                                    variant="solid"
                                                    fontSize="sm"
                                                    px={3}
                                                    py={1}
                                                  >
                                                    {triwulan.nilai}{" "}
                                                    {indikator.satuanIndikator
                                                      ?.satuan || ""}
                                                  </Badge>
                                                </HStack>
                                              )
                                            )}
                                          </VStack>
                                        </Box>
                                      </VStack>
                                    </>
                                  )}

                                <Divider my={4} />
                                <Flex gap={2} justify="end">
                                  <Button
                                    size="sm"
                                    colorScheme="teal"
                                    variant="outline"
                                    leftIcon={<Icon as={FiEdit} />}
                                    onClick={() =>
                                      handleOpenEditModal(
                                        t,
                                        indikator,
                                        "subKegiatan"
                                      )
                                    }
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    colorScheme="red"
                                    variant="outline"
                                    leftIcon={<Icon as={FiTrash2} />}
                                  >
                                    Hapus
                                  </Button>
                                </Flex>
                              </CardBody>
                            </Card>
                          ))
                        ) : (
                          <Box
                            textAlign="center"
                            py={8}
                            w="100%"
                            bg={colorMode === "dark" ? "gray.800" : "white"}
                            borderRadius="md"
                            border="2px dashed"
                            borderColor="blue.300"
                          >
                            <Icon
                              as={FiTarget}
                              boxSize={8}
                              color="blue.400"
                              mb={2}
                            />
                            <Text fontSize="sm" color="gray.400">
                              Belum ada target yang ditambahkan
                            </Text>
                          </Box>
                        )}
                      </VStack>

                      <Flex mt={6} justify="end">
                        <Button
                          size="md"
                          colorScheme="blue"
                          leftIcon={<Icon as={FiPlus} />}
                          onClick={() =>
                            handleOpenModal(indikator, "subKegiatan")
                          }
                          borderRadius="lg"
                          shadow="md"
                        >
                          Tambah Target
                        </Button>
                      </Flex>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <Card
                border="2px dashed"
                borderColor="blue.300"
                bg={colorMode === "dark" ? "gray.800" : "blue.50"}
              >
                <CardBody textAlign="center" py={10}>
                  <Icon as={FiTarget} boxSize={12} color="blue.400" mb={4} />
                  <Text fontSize="lg" color="gray.500" fontWeight="medium">
                    Belum ada indikator sub kegiatan
                  </Text>
                </CardBody>
              </Card>
            )}
          </Box>
        </Container>
      </Box>

      {/* Modal Tambah Target */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent borderRadius="xl" shadow="2xl">
          <ModalHeader
            bg={colorMode === "dark" ? "gray.800" : "blue.50"}
            borderTopRadius="xl"
            py={6}
          >
            <HStack>
              <Icon as={FiPlus} color="blue.500" boxSize={6} />
              <Heading
                size="lg"
                color={colorMode === "dark" ? "white" : "gray.800"}
              >
                Tambah Target Baru
              </Heading>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack spacing={6} align="stretch">
              {/* Info Indikator */}
              <Card
                bg={colorMode === "dark" ? "gray.800" : "blue.50"}
                border="1px solid"
                borderColor="blue.200"
              >
                <CardBody>
                  <VStack align="start" spacing={3}>
                    <HStack>
                      <Icon as={FiTarget} color="blue.500" boxSize={5} />
                      <Text fontWeight="semibold" fontSize="lg">
                        {selectedIndikator ? selectedIndikator.indikator : ""}
                      </Text>
                    </HStack>
                    <HStack>
                      <Badge colorScheme="blue" variant="subtle">
                        Satuan:{" "}
                        {selectedIndikator && selectedIndikator.satuanIndikator
                          ? selectedIndikator.satuanIndikator.satuan
                          : "Tidak ada"}
                      </Badge>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Dynamic Target Fields berdasarkan dataNamaTarget */}
              <VStack spacing={4} align="stretch">
                <Heading
                  size="md"
                  color={colorMode === "dark" ? "white" : "gray.700"}
                >
                  Target yang akan ditambahkan:
                </Heading>
                {dataNamatarget && dataNamatarget.length > 0 ? (
                  dataNamatarget.map((namaTarget) => (
                    <FormControl key={namaTarget.id} isRequired>
                      <FormLabel fontWeight="semibold" color="gray.600">
                        Target {namaTarget.nama}
                      </FormLabel>
                      <Input
                        placeholder={`Masukkan target ${namaTarget.nama}`}
                        type="number"
                        value={newTargets[namaTarget.id] || ""}
                        onChange={(e) =>
                          setNewTargets((prev) => ({
                            ...prev,
                            [namaTarget.id]: e.target.value,
                          }))
                        }
                        size="lg"
                        borderRadius="lg"
                        borderColor="gray.300"
                        _focus={{
                          borderColor: "blue.400",
                          boxShadow: "0 0 0 1px #3182CE",
                        }}
                      />
                    </FormControl>
                  ))
                ) : (
                  <Box
                    p={4}
                    bg={colorMode === "dark" ? "gray.800" : "yellow.50"}
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="yellow.300"
                  >
                    <Text color="yellow.700" fontWeight="medium">
                      ⚠️ Data nama target belum tersedia. Silakan refresh
                      halaman atau hubungi administrator.
                    </Text>
                  </Box>
                )}
              </VStack>

              {/* Anggaran dan Tahun */}
              <HStack spacing={4}>
                <FormControl flex={1}>
                  <FormLabel fontWeight="semibold" color="gray.600">
                    <Icon as={FiDollarSign} mr={2} />
                    Anggaran (Rp)
                  </FormLabel>
                  <Input
                    placeholder="Masukkan anggaran (contoh: Rp 1.000.000)"
                    type="text"
                    inputMode="numeric"
                    value={formatRupiah(newAnggaran)}
                    onChange={(e) => {
                      const parsed = parseRupiah(e.target.value);
                      setNewAnggaran(parsed.toString());
                    }}
                    size="lg"
                    borderRadius="lg"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: "blue.400",
                      boxShadow: "0 0 0 1px #3182CE",
                    }}
                  />
                </FormControl>
                <FormControl flex={1}>
                  <FormLabel fontWeight="semibold" color="gray.600">
                    <Icon as={FiCalendar} mr={2} />
                    Tahun
                  </FormLabel>
                  <Input
                    placeholder="Masukkan tahun"
                    type="number"
                    value={newTahun || ""}
                    onChange={(e) => setNewTahun(e.target.value)}
                    size="lg"
                    borderRadius="lg"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: "blue.400",
                      boxShadow: "0 0 0 1px #3182CE",
                    }}
                  />
                </FormControl>
              </HStack>

              {/* Jenis Anggaran */}
              <FormControl>
                <FormLabel fontWeight="semibold" color="gray.600">
                  Jenis Anggaran
                </FormLabel>
                <Box
                  p={3}
                  bg={colorMode === "dark" ? "gray.700" : "gray.100"}
                  borderRadius="lg"
                >
                  <Badge colorScheme="green" fontSize="md" px={3} py={1}>
                    Murni
                  </Badge>
                </Box>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter
            bg={colorMode === "dark" ? "gray.800" : "gray.50"}
            borderBottomRadius="xl"
            py={4}
          >
            <HStack spacing={3}>
              <Button
                variant="ghost"
                onClick={onClose}
                size="lg"
                borderRadius="lg"
              >
                Batal
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleAddTarget}
                size="lg"
                borderRadius="lg"
                leftIcon={<Icon as={FiPlus} />}
              >
                Simpan Target
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Modal Anggaran Perubahan */}
      <Modal isOpen={isApOpen} onClose={onApClose} size="md">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(6px)" />
        <ModalContent borderRadius="xl" shadow="xl">
          <ModalHeader
            bg={colorMode === "dark" ? "gray.800" : "green.50"}
            borderTopRadius="xl"
            py={4}
          >
            <HStack>
              <Icon as={FiDollarSign} color="green.500" boxSize={6} />
              <Heading
                size="md"
                color={colorMode === "dark" ? "white" : "gray.800"}
              >
                Tambah Anggaran Perubahan
              </Heading>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel fontWeight="semibold" color="gray.600">
                  Target ID
                </FormLabel>
                <Input value={apTargetId || ""} isDisabled />
              </FormControl>
              <FormControl>
                <FormLabel fontWeight="semibold" color="gray.600">
                  Anggaran Perubahan (Rp)
                </FormLabel>
                <Input
                  placeholder="Masukkan nominal anggaran (contoh: Rp 1.000.000)"
                  type="text"
                  inputMode="numeric"
                  value={formatRupiah(apAmount)}
                  onChange={(e) => {
                    const parsed = parseRupiah(e.target.value);
                    setApAmount(parsed);
                  }}
                  size="lg"
                  borderRadius="lg"
                  borderColor="gray.300"
                  _focus={{
                    borderColor: "green.400",
                    boxShadow: "0 0 0 1px #38A169",
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontWeight="semibold" color="gray.600">
                  Tahun
                </FormLabel>
                <Input
                  placeholder="Tahun anggaran"
                  type="number"
                  value={apYear || ""}
                  isDisabled
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter bg={colorMode === "dark" ? "gray.800" : "gray.50"}>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onApClose}>
                Batal
              </Button>
              <Button colorScheme="green" onClick={submitAnggaranPerubahan}>
                Simpan
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Edit Target */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent borderRadius="xl" shadow="2xl">
          <ModalHeader
            bg={colorMode === "dark" ? "gray.800" : "teal.50"}
            borderTopRadius="xl"
            py={6}
          >
            <HStack>
              <Icon as={FiEdit} color="teal.500" boxSize={6} />
              <Heading
                size="lg"
                color={colorMode === "dark" ? "white" : "gray.800"}
              >
                Edit Target
              </Heading>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack spacing={6} align="stretch">
              {/* Info Indikator */}
              <Card
                bg={colorMode === "dark" ? "gray.800" : "teal.50"}
                border="1px solid"
                borderColor="teal.200"
              >
                <CardBody>
                  <VStack align="start" spacing={3}>
                    <HStack>
                      <Icon as={FiTarget} color="teal.500" boxSize={5} />
                      <Text fontWeight="semibold" fontSize="lg">
                        {selectedIndikator ? selectedIndikator.indikator : ""}
                      </Text>
                    </HStack>
                    <HStack>
                      <Badge colorScheme="teal" variant="subtle">
                        Satuan:{" "}
                        {selectedIndikator && selectedIndikator.satuanIndikator
                          ? selectedIndikator.satuanIndikator.satuan
                          : "Tidak ada"}
                      </Badge>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Dynamic Target Fields berdasarkan dataNamaTarget */}
              <VStack spacing={4} align="stretch">
                <Heading
                  size="md"
                  color={colorMode === "dark" ? "white" : "gray.700"}
                >
                  Target yang akan diubah:
                </Heading>
                {dataNamatarget && dataNamatarget.length > 0 ? (
                  dataNamatarget.map((namaTarget) => (
                    <FormControl key={namaTarget.id} isRequired>
                      <FormLabel fontWeight="semibold" color="gray.600">
                        Target {namaTarget.nama}
                      </FormLabel>
                      <Input
                        placeholder={`Masukkan target ${namaTarget.nama}`}
                        type="number"
                        value={editTargets[namaTarget.id] || ""}
                        onChange={(e) =>
                          setEditTargets((prev) => ({
                            ...prev,
                            [namaTarget.id]: e.target.value,
                          }))
                        }
                        size="lg"
                        borderRadius="lg"
                        borderColor="gray.300"
                        _focus={{
                          borderColor: "teal.400",
                          boxShadow: "0 0 0 1px #319795",
                        }}
                      />
                    </FormControl>
                  ))
                ) : (
                  <Box
                    p={4}
                    bg={colorMode === "dark" ? "gray.800" : "yellow.50"}
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="yellow.300"
                  >
                    <Text color="yellow.700" fontWeight="medium">
                      ⚠️ Data nama target belum tersedia. Silakan refresh
                      halaman atau hubungi administrator.
                    </Text>
                  </Box>
                )}
              </VStack>

              {/* Anggaran dan Tahun */}
              <HStack spacing={4}>
                <FormControl flex={1}>
                  <FormLabel fontWeight="semibold" color="gray.600">
                    <Icon as={FiDollarSign} mr={2} />
                    Anggaran (Rp)
                  </FormLabel>
                  <Input
                    placeholder="Masukkan anggaran (contoh: Rp 1.000.000)"
                    type="text"
                    inputMode="numeric"
                    value={formatRupiah(editAnggaran)}
                    onChange={(e) => {
                      const parsed = parseRupiah(e.target.value);
                      setEditAnggaran(parsed.toString());
                    }}
                    size="lg"
                    borderRadius="lg"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: "teal.400",
                      boxShadow: "0 0 0 1px #319795",
                    }}
                  />
                </FormControl>
                <FormControl flex={1}>
                  <FormLabel fontWeight="semibold" color="gray.600">
                    <Icon as={FiCalendar} mr={2} />
                    Tahun
                  </FormLabel>
                  <Input
                    placeholder="Masukkan tahun"
                    type="number"
                    value={editTahun || ""}
                    size="lg"
                    borderRadius="lg"
                    borderColor="gray.300"
                    isReadOnly={true}
                    bg={colorMode === "dark" ? "gray.700" : "gray.100"}
                    cursor="not-allowed"
                    _focus={{
                      borderColor: "gray.300",
                      boxShadow: "none",
                    }}
                  />
                </FormControl>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter
            bg={colorMode === "dark" ? "gray.800" : "gray.50"}
            borderBottomRadius="xl"
            py={4}
          >
            <HStack spacing={3}>
              <Button
                variant="ghost"
                onClick={() => {
                  onEditClose();
                  setSelectedTarget(null);
                  setEditTargets({});
                  setEditAnggaran(null);
                  setEditTahun(null);
                  setIsEditMode(false);
                }}
                size="lg"
                borderRadius="lg"
              >
                Batal
              </Button>
              <Button
                colorScheme="teal"
                onClick={handleUpdateTarget}
                size="lg"
                borderRadius="lg"
                leftIcon={<Icon as={FiEdit} />}
              >
                Perbarui Target
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Edit Anggaran Perubahan */}
      <Modal isOpen={isEditApOpen} onClose={onEditApClose} size="md">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(6px)" />
        <ModalContent borderRadius="xl" shadow="xl">
          <ModalHeader
            bg={colorMode === "dark" ? "gray.800" : "orange.50"}
            borderTopRadius="xl"
            py={4}
          >
            <HStack>
              <Icon as={FiEdit} color="orange.500" boxSize={6} />
              <Heading
                size="md"
                color={colorMode === "dark" ? "white" : "gray.800"}
              >
                Edit Anggaran Perubahan
              </Heading>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel fontWeight="semibold" color="gray.600">
                  Tahun Anggaran ID
                </FormLabel>
                <Input
                  value={selectedTahunAnggaran?.id || ""}
                  isDisabled
                  bg={colorMode === "dark" ? "gray.700" : "gray.100"}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontWeight="semibold" color="gray.600">
                  Anggaran Perubahan (Rp)
                </FormLabel>
                <Input
                  placeholder="Masukkan nominal anggaran (contoh: Rp 1.000.000)"
                  type="text"
                  inputMode="numeric"
                  value={formatRupiah(editApAmount)}
                  onChange={(e) => {
                    const parsed = parseRupiah(e.target.value);
                    setEditApAmount(parsed.toString());
                  }}
                  size="lg"
                  borderRadius="lg"
                  borderColor="gray.300"
                  _focus={{
                    borderColor: "orange.400",
                    boxShadow: "0 0 0 1px #DD6B20",
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontWeight="semibold" color="gray.600">
                  Tahun
                </FormLabel>
                <Input
                  placeholder="Tahun anggaran"
                  type="number"
                  value={editApYear || ""}
                  size="lg"
                  borderRadius="lg"
                  borderColor="gray.300"
                  isReadOnly={true}
                  bg={colorMode === "dark" ? "gray.700" : "gray.100"}
                  cursor="not-allowed"
                  _focus={{
                    borderColor: "gray.300",
                    boxShadow: "none",
                  }}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter bg={colorMode === "dark" ? "gray.800" : "gray.50"}>
            <HStack spacing={3}>
              <Button
                variant="ghost"
                onClick={() => {
                  onEditApClose();
                  setSelectedTahunAnggaran(null);
                  setEditApAmount(0);
                  setEditApYear(null);
                }}
              >
                Batal
              </Button>
              <Button
                colorScheme="orange"
                onClick={handleUpdateAnggaranPerubahan}
                leftIcon={<Icon as={FiEdit} />}
              >
                Perbarui
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </LayoutPerencanaan>
  );
}

export default DaftarIndikator;
