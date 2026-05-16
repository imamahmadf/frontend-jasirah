import React, { useEffect, useState } from "react";
import axios from "axios";
import { userRedux, selectRole } from "../../Redux/Reducers/auth";
import LayoutPerencanaan from "../../Componets/perencanaan/LayoutPerencanaan";
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
  Select,
} from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FaFileAlt,
  FaBuilding,
  FaFolderOpen,
  FaArrowLeft,
  FaEdit,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import { Select as Select2, AsyncSelect } from "chakra-react-select";

function AdminSubKegiatan(props) {
  const { colorMode } = useColorMode();
  const history = useHistory();
  const [dataSubKegiatan, setDataSubKegiatan] = useState([]);
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
  const {
    isOpen: isTambahIndikatorOpen,
    onOpen: onTambahIndikatorOpen,
    onClose: onTambahIndikatorClose,
  } = useDisclosure();
  const [selectedSubKegiatan, setSelectedSubKegiatan] = useState(null);
  const [subKegiatanToDelete, setSubKegiatanToDelete] = useState(null);
  const [selectedSubKegiatanForIndikator, setSelectedSubKegiatanForIndikator] =
    useState(null);
  const [indikatorForm, setIndikatorForm] = useState({
    indikator: "",
    satuanIndikatorId: "",
    unitKerjaId: null,
    pegawaiId: null,
  });
  const [indikatorErrors, setIndikatorErrors] = useState({});
  const [selectedIndikatorPegawai, setSelectedIndikatorPegawai] =
    useState(null);
  const token = localStorage.getItem("token");
  const [editForm, setEditForm] = useState({
    kode: "",
    nama: "",
    kegiatanId: "",
    unitKerjaId: "",
  });
  const [tambahForm, setTambahForm] = useState({
    kode: "",
    nama: "",
    kegiatanId: "",
    unitKerjaId: "",
  });
  const [dataKegiatan, setDataKegiatan] = useState([]);
  const [dataUnitKerja, setDataUnitKerja] = useState([]);
  const [dataSatuan, setDataSatuan] = useState([]);
  const [isLoadingKegiatan, setIsLoadingKegiatan] = useState(false);
  const [errors, setErrors] = useState({});
  const [tambahErrors, setTambahErrors] = useState({});
  const toast = useToast();
  async function fetchSubKegiatan() {
    try {
      setIsLoading(true);
      setError(null);
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/admin-perencanaan/get/sub-kegiatan/${
          user[0]?.unitKerja_profile?.indukUnitKerja?.id
        }`
      );
      console.log(res.data);
      setDataSubKegiatan(res.data.result || []);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data sub kegiatan");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchSubKegiatan();
  }, []);

  async function fetchKegiatan() {
    try {
      setIsLoadingKegiatan(true);
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/admin-perencanaan/get/seed/sub-kegiatan/${
          user[0]?.unitKerja_profile?.indukUnitKerja?.id
        }`
      );
      setDataKegiatan(res.data.resultKegiatan || []);
      setDataUnitKerja(res.data.resultUnitKerja || []);
      setDataSatuan(res.data.resultSatuan || []);
    } catch (err) {
      console.error(err);
      toast({
        title: "Gagal",
        description: "Gagal memuat daftar kegiatan",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingKegiatan(false);
    }
  }

  const handleEdit = (item) => {
    setSelectedSubKegiatan(item);
    setEditForm({
      kode: item.kode || "",
      nama: item.nama || "",
      kegiatanId: item.kegiatan?.id || "",
      unitKerjaId: item.daftarUnitKerja?.id || "",
    });
    setErrors({});
    fetchKegiatan(); // Fetch data unit kerja dan kegiatan saat edit dibuka
    onOpen();
  };

  const validateForm = () => {
    const newErrors = {};
    if (!editForm.kode.trim()) {
      newErrors.kode = "Kode sub kegiatan harus diisi";
    }
    if (!editForm.nama.trim()) {
      newErrors.nama = "Nama sub kegiatan harus diisi";
    }
    if (!editForm.kegiatanId) {
      newErrors.kegiatanId = "Kegiatan harus dipilih";
    }
    if (!editForm.unitKerjaId) {
      newErrors.unitKerjaId = "Unit kerja harus dipilih";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!selectedSubKegiatan) return;
    if (!validateForm()) return;

    try {
      await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/admin-perencanaan/edit/sub-kegiatan/${selectedSubKegiatan.id}`,
        {
          kode: editForm.kode.trim(),
          nama: editForm.nama.trim(),
          kegiatanId: editForm.kegiatanId,
          unitKerjaId: editForm.unitKerjaId,
        }
      );

      toast({
        title: "Berhasil",
        description: "Sub kegiatan berhasil diperbarui",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onClose();
      setSelectedSubKegiatan(null);
      fetchSubKegiatan();
    } catch (err) {
      console.error(err);
      toast({
        title: "Gagal",
        description:
          err.response?.data?.message || "Gagal memperbarui sub kegiatan",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedSubKegiatan(null);
    setEditForm({ kode: "", nama: "", kegiatanId: "", unitKerjaId: "" });
    setErrors({});
  };

  const handleHapusClick = (item) => {
    setSubKegiatanToDelete(item);
    onHapusOpen();
  };

  const handleHapusClose = () => {
    onHapusClose();
    setSubKegiatanToDelete(null);
  };

  const handleDelete = async () => {
    if (!subKegiatanToDelete) return;

    try {
      await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/admin-perencanaan/delete/sub-kegiatan/${subKegiatanToDelete.id}`
      );

      toast({
        title: "Berhasil",
        description: "Sub kegiatan berhasil dihapus",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      handleHapusClose();
      fetchSubKegiatan();
    } catch (err) {
      console.error(err);
      toast({
        title: "Gagal",
        description:
          err.response?.data?.message || "Gagal menghapus sub kegiatan",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleTambahOpen = () => {
    setTambahForm({ kode: "", nama: "", kegiatanId: "", unitKerjaId: "" });
    setTambahErrors({});
    fetchKegiatan();
    onTambahOpen();
  };

  const handleTambahClose = () => {
    onTambahClose();
    setTambahForm({ kode: "", nama: "", kegiatanId: "", unitKerjaId: "" });
    setTambahErrors({});
  };

  const validateTambahForm = () => {
    const newErrors = {};
    if (!tambahForm.kode.trim()) {
      newErrors.kode = "Kode sub kegiatan harus diisi";
    }
    if (!tambahForm.nama.trim()) {
      newErrors.nama = "Nama sub kegiatan harus diisi";
    }
    if (!tambahForm.kegiatanId) {
      newErrors.kegiatanId = "Kegiatan harus dipilih";
    }
    if (!tambahForm.unitKerjaId) {
      newErrors.unitKerjaId = "Unit kerja harus dipilih";
    }
    setTambahErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTambah = async () => {
    if (!validateTambahForm()) return;

    try {
      await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/admin-perencanaan/post/sub-kegiatan`,
        {
          kode: tambahForm.kode.trim(),
          nama: tambahForm.nama.trim(),
          kegiatanId: tambahForm.kegiatanId,
          unitKerjaId: tambahForm.unitKerjaId,
        }
      );

      toast({
        title: "Berhasil",
        description: "Sub kegiatan berhasil ditambahkan",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      handleTambahClose();
      fetchSubKegiatan();
    } catch (err) {
      console.error(err);
      toast({
        title: "Gagal",
        description:
          err.response?.data?.message || "Gagal menambahkan sub kegiatan",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleTambahIndikatorOpen = (item) => {
    setSelectedSubKegiatanForIndikator(item);
    setIndikatorForm({
      indikator: "",
      satuanIndikatorId: "",
      unitKerjaId: item.daftarUnitKerja?.id || null,
      pegawaiId: null,
    });
    setSelectedIndikatorPegawai(null);
    setIndikatorErrors({});
    fetchKegiatan(); // Fetch data satuan saat modal dibuka
    onTambahIndikatorOpen();
  };

  const handleTambahIndikatorClose = () => {
    onTambahIndikatorClose();
    setSelectedSubKegiatanForIndikator(null);
    setIndikatorForm({
      indikator: "",
      satuanIndikatorId: "",
      unitKerjaId: null,
      pegawaiId: null,
    });
    setSelectedIndikatorPegawai(null);
    setIndikatorErrors({});
  };

  const validateIndikatorForm = () => {
    const newErrors = {};
    if (!indikatorForm.indikator.trim()) {
      newErrors.indikator = "Nama indikator harus diisi";
    }
    if (!indikatorForm.satuanIndikatorId) {
      newErrors.satuanIndikatorId = "Satuan indikator harus dipilih";
    }
    setIndikatorErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTambahIndikator = async () => {
    if (!validateIndikatorForm()) return;
    if (!selectedSubKegiatanForIndikator) return;

    try {
      await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/admin-perencanaan/post/indikator`,
        {
          indikatorFE: indikatorForm.indikator.trim(),
          subKegPerId: selectedSubKegiatanForIndikator.id,
          satuanIndikatorId: indikatorForm.satuanIndikatorId,
          unitKerjaId: indikatorForm.unitKerjaId || null,
          pegawaiId: indikatorForm.pegawaiId || null,
        }
      );

      toast({
        title: "Berhasil",
        description: "Indikator berhasil ditambahkan",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      handleTambahIndikatorClose();
      fetchSubKegiatan();
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

  return (
    <LayoutPerencanaan>
      <Box
        bg={colorMode === "dark" ? "gray.800" : "gray.100"}
        minH="100vh"
        pb="40px"
        px={{ base: 3, md: 6 }}
      >
        <Container maxW="1280px" py="8">
          <HStack mb={6} justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Heading
                size="lg"
                color={colorMode === "dark" ? "white" : "gray.800"}
              >
                Daftar Sub Kegiatan
              </Heading>
              <Text fontSize="sm" color="gray.500">
                Data sub kegiatan berdasarkan unit kerja yang dipilih
              </Text>
            </VStack>
            <HStack spacing={3}>
              <Button
                leftIcon={<FaPlus />}
                colorScheme="green"
                size="sm"
                onClick={handleTambahOpen}
              >
                Tambah Sub Kegiatan
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
                <Button size="sm" onClick={fetchSubKegiatan}>
                  Muat Ulang
                </Button>
              </VStack>
            </Center>
          ) : dataSubKegiatan.length === 0 ? (
            <Center py={16}>
              <VStack spacing={4}>
                <Icon as={FaFileAlt} boxSize={12} color="gray.400" />
                <Text color="gray.500">Belum ada sub kegiatan</Text>
              </VStack>
            </Center>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {dataSubKegiatan.map((item) => (
                <Card
                  key={item.id}
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  borderRadius="lg"
                  boxShadow="md"
                  _hover={{
                    boxShadow: "lg",
                    transform: "translateY(-2px)",
                    transition: "all 0.2s",
                  }}
                >
                  <CardHeader pb={2}>
                    <HStack spacing={3} align="start">
                      <Box
                        p={2}
                        borderRadius="full"
                        bg={colorMode === "dark" ? "blue.900" : "blue.50"}
                      >
                        <Icon as={FaFileAlt} color="blue.500" />
                      </Box>
                      <VStack align="start" spacing={1}>
                        {/* Kode lengkap sub kegiatan: program.kode + kegiatan.kode + subKegPer.kode */}
                        <HStack spacing={2}>
                          <Badge colorScheme="blue" borderRadius="full">
                            {`${item.kegiatan?.program?.kode}.${item.kegiatan?.kode}.${item.kode}`}
                          </Badge>
                        </HStack>
                        <Text
                          fontWeight="semibold"
                          color={colorMode === "dark" ? "white" : "gray.800"}
                        >
                          {item.nama}
                        </Text>
                      </VStack>
                    </HStack>
                  </CardHeader>
                  <CardBody pt={1}>
                    <VStack align="start" spacing={2} fontSize="sm">
                      {/* Unit Kerja */}
                      {item.daftarUnitKerja ? (
                        <HStack spacing={2}>
                          <Icon as={FaBuilding} color="gray.400" />
                          <Text color="gray.600">
                            {item.daftarUnitKerja?.unitKerja || "-"}
                          </Text>
                        </HStack>
                      ) : null}

                      {/* Program */}
                      {item.kegiatan?.program && (
                        <HStack spacing={2}>
                          <Icon as={FaFolderOpen} color="purple.400" />
                          <Text color="gray.600">
                            <Text as="span" fontWeight="semibold">
                              Program:
                            </Text>{" "}
                            {item.kegiatan.program.kode} -{" "}
                            {item.kegiatan.program.nama}
                          </Text>
                        </HStack>
                      )}

                      {/* Kegiatan */}
                      {item.kegiatan && (
                        <HStack spacing={2}>
                          <Icon as={FaFolderOpen} color="green.400" />
                          <Text color="gray.600">
                            <Text as="span" fontWeight="semibold">
                              Kegiatan:
                            </Text>{" "}
                            {item.kegiatan.kode} - {item.kegiatan.nama}
                          </Text>
                        </HStack>
                      )}

                      {/* Sub Kegiatan (tampilkan format kode lengkap juga) */}
                      <HStack spacing={2}>
                        <Icon as={FaFileAlt} color="blue.400" />
                        <Text color="gray.600">
                          <Text as="span" fontWeight="semibold">
                            Sub Kegiatan:
                          </Text>{" "}
                          {(item.kegiatan?.program?.kode || "") +
                            (item.kegiatan?.kode || "") +
                            (item.kode || "")}{" "}
                          - {item.nama}
                        </Text>
                      </HStack>

                      {/* Indikator */}
                      <Box w="100%">
                        <HStack spacing={2} mb={2} justify="space-between">
                          <HStack spacing={2}>
                            <Icon as={FaFolderOpen} color="orange.400" />
                            <Text
                              color="gray.600"
                              fontWeight="semibold"
                              fontSize="sm"
                            >
                              Indikator (
                              {(item.indikators && item.indikators.length) || 0}
                              ):
                            </Text>
                          </HStack>
                          <Button
                            size="xs"
                            colorScheme="orange"
                            variant="ghost"
                            leftIcon={<FaPlus />}
                            onClick={() => handleTambahIndikatorOpen(item)}
                          >
                            Tambah
                          </Button>
                        </HStack>
                        {item.indikators && item.indikators.length > 0 ? (
                          <VStack
                            align="start"
                            spacing={1.5}
                            pl={6}
                            maxH="150px"
                            overflowY="auto"
                            w="100%"
                          >
                            {item.indikators.map((indikator) => (
                              <Box
                                key={indikator.id}
                                w="100%"
                                p={2}
                                borderRadius="md"
                                bg={
                                  colorMode === "dark" ? "gray.600" : "gray.50"
                                }
                                border="1px"
                                borderColor={
                                  colorMode === "dark" ? "gray.500" : "gray.200"
                                }
                              >
                                <VStack align="start" spacing={1} w="100%">
                                  <HStack spacing={2} align="start" w="100%">
                                    <Icon
                                      as={FaFileAlt}
                                      color="orange.400"
                                      size="xs"
                                    />
                                    <Text
                                      fontSize="xs"
                                      color={
                                        colorMode === "dark"
                                          ? "gray.300"
                                          : "gray.700"
                                      }
                                      flex={1}
                                    >
                                      {indikator.indikator}
                                    </Text>
                                  </HStack>
                                  {/* Info Unit Kerja dan Pegawai jika ada */}
                                  {(indikator.daftarUnitKerja ||
                                    indikator.pegawai) && (
                                    <HStack
                                      spacing={3}
                                      pl={5}
                                      fontSize="2xs"
                                      color="gray.500"
                                    >
                                      {indikator.daftarUnitKerja && (
                                        <Text>
                                          Unit:{" "}
                                          {indikator.daftarUnitKerja.unitKerja}
                                        </Text>
                                      )}
                                      {indikator.pegawai && (
                                        <Text>
                                          PIC: {indikator.pegawai.nama} (
                                          {indikator.pegawai.nip})
                                        </Text>
                                      )}
                                    </HStack>
                                  )}
                                </VStack>
                              </Box>
                            ))}
                          </VStack>
                        ) : (
                          <Text
                            fontSize="xs"
                            color="gray.500"
                            fontStyle="italic"
                            pl={6}
                          >
                            Belum ada indikator
                          </Text>
                        )}
                      </Box>

                      {/* Tombol Edit dan Hapus */}
                      <HStack spacing={2} mt={3} w="100%">
                        <Button
                          leftIcon={<FaEdit />}
                          colorScheme="blue"
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(item)}
                          flex={1}
                        >
                          Edit
                        </Button>
                        <Button
                          leftIcon={<FaTrash />}
                          colorScheme="red"
                          size="sm"
                          variant="outline"
                          onClick={() => handleHapusClick(item)}
                          flex={1}
                        >
                          Hapus
                        </Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </Container>
      </Box>

      {/* Modal Edit Sub Kegiatan */}
      <Modal isOpen={isOpen} onClose={handleClose} size="lg" isCentered>
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderRadius="xl"
        >
          <ModalHeader>
            <HStack>
              <Icon as={FaEdit} color="blue.500" />
              <Text>Edit Sub Kegiatan</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <Divider />
          <ModalBody py={6}>
            <VStack spacing={5} align="stretch">
              {/* Info Program (Read-only) */}
              {selectedSubKegiatan?.kegiatan?.program && (
                <Box
                  p={4}
                  borderRadius="md"
                  bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                  border="1px"
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                >
                  <VStack align="start" spacing={2} fontSize="sm">
                    <HStack spacing={2}>
                      <Icon as={FaFolderOpen} color="purple.400" />
                      <Text color="gray.600">
                        <Text as="span" fontWeight="semibold">
                          Program:
                        </Text>{" "}
                        {selectedSubKegiatan.kegiatan.program.kode} -{" "}
                        {selectedSubKegiatan.kegiatan.program.nama}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>
              )}

              {/* Select Kegiatan */}
              <FormControl isInvalid={!!errors.kegiatanId}>
                <FormLabel>Kegiatan</FormLabel>
                <Select
                  placeholder="Pilih Kegiatan"
                  value={editForm.kegiatanId}
                  onChange={(e) => {
                    setEditForm({
                      ...editForm,
                      kegiatanId: e.target.value,
                    });
                    setErrors({ ...errors, kegiatanId: "" });
                  }}
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                  isLoading={isLoadingKegiatan}
                >
                  {dataKegiatan.map((kegiatan) => (
                    <option key={kegiatan.id} value={kegiatan.id}>
                      {kegiatan.nama}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.kegiatanId}</FormErrorMessage>
              </FormControl>

              {/* Select Unit Kerja */}
              <FormControl isInvalid={!!errors.unitKerjaId}>
                <FormLabel>Unit Kerja</FormLabel>
                <Select
                  placeholder="Pilih Unit Kerja"
                  value={editForm.unitKerjaId}
                  onChange={(e) => {
                    setEditForm({
                      ...editForm,
                      unitKerjaId: e.target.value,
                    });
                    setErrors({ ...errors, unitKerjaId: "" });
                  }}
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                  isLoading={isLoadingKegiatan}
                >
                  {dataUnitKerja.map((unitKerja) => (
                    <option key={unitKerja.id} value={unitKerja.id}>
                      {unitKerja.unitKerja}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.unitKerjaId}</FormErrorMessage>
              </FormControl>

              {/* Kode Lengkap (Read-only) */}
              <FormControl>
                <FormLabel>Kode Lengkap</FormLabel>
                <Input
                  value={
                    (dataKegiatan.find((k) => k.id === editForm.kegiatanId)
                      ?.program?.kode ||
                      selectedSubKegiatan?.kegiatan?.program?.kode ||
                      "") +
                    (dataKegiatan.find((k) => k.id === editForm.kegiatanId)
                      ?.kode || "") +
                    (editForm.kode || "")
                  }
                  isReadOnly
                  bg={colorMode === "dark" ? "gray.700" : "gray.100"}
                  cursor="not-allowed"
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Format: program.kode + kegiatan.kode + subKegPer.kode
                </Text>
              </FormControl>

              {/* Input Kode Sub Kegiatan */}
              <FormControl isInvalid={!!errors.kode}>
                <FormLabel>Kode Sub Kegiatan</FormLabel>
                <Input
                  placeholder="Masukkan kode sub kegiatan"
                  value={editForm.kode}
                  onChange={(e) => {
                    setEditForm({ ...editForm, kode: e.target.value });
                    setErrors({ ...errors, kode: "" });
                  }}
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                />
                <FormErrorMessage>{errors.kode}</FormErrorMessage>
              </FormControl>

              {/* Input Nama Sub Kegiatan */}
              <FormControl isInvalid={!!errors.nama}>
                <FormLabel>Nama Sub Kegiatan</FormLabel>
                <Input
                  placeholder="Masukkan nama sub kegiatan"
                  value={editForm.nama}
                  onChange={(e) => {
                    setEditForm({ ...editForm, nama: e.target.value });
                    setErrors({ ...errors, nama: "" });
                  }}
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                />
                <FormErrorMessage>{errors.nama}</FormErrorMessage>
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

      {/* Modal Tambah Sub Kegiatan */}
      <Modal
        isOpen={isTambahOpen}
        onClose={handleTambahClose}
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
              <Icon as={FaPlus} color="green.500" />
              <Text>Tambah Sub Kegiatan</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <Divider />
          <ModalBody py={6}>
            <VStack spacing={5} align="stretch">
              {/* Select Unit Kerja */}
              <FormControl isInvalid={!!tambahErrors.unitKerjaId}>
                <FormLabel>Unit Kerja</FormLabel>
                <Select
                  placeholder="Pilih Unit Kerja"
                  value={tambahForm.unitKerjaId}
                  onChange={(e) => {
                    setTambahForm({
                      ...tambahForm,
                      unitKerjaId: e.target.value,
                    });
                    setTambahErrors({ ...tambahErrors, unitKerjaId: "" });
                  }}
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                  isLoading={isLoadingKegiatan}
                >
                  {dataUnitKerja.map((unitKerja) => (
                    <option key={unitKerja.id} value={unitKerja.id}>
                      {unitKerja.unitKerja}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{tambahErrors.unitKerjaId}</FormErrorMessage>
              </FormControl>

              {/* Select Kegiatan */}
              <FormControl isInvalid={!!tambahErrors.kegiatanId}>
                <FormLabel>Kegiatan</FormLabel>
                <Select
                  placeholder="Pilih Kegiatan"
                  value={tambahForm.kegiatanId}
                  onChange={(e) => {
                    setTambahForm({
                      ...tambahForm,
                      kegiatanId: e.target.value,
                    });
                    setTambahErrors({ ...tambahErrors, kegiatanId: "" });
                  }}
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                  isLoading={isLoadingKegiatan}
                >
                  {dataKegiatan.map((kegiatan) => (
                    <option key={kegiatan.id} value={kegiatan.id}>
                      {kegiatan.nama}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{tambahErrors.kegiatanId}</FormErrorMessage>
              </FormControl>

              {/* Input Kode Sub Kegiatan */}
              <FormControl isInvalid={!!tambahErrors.kode}>
                <FormLabel>Kode Sub Kegiatan</FormLabel>
                <Input
                  placeholder="Masukkan kode sub kegiatan"
                  value={tambahForm.kode}
                  onChange={(e) => {
                    setTambahForm({ ...tambahForm, kode: e.target.value });
                    setTambahErrors({ ...tambahErrors, kode: "" });
                  }}
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                />
                <FormErrorMessage>{tambahErrors.kode}</FormErrorMessage>
              </FormControl>

              {/* Input Nama Sub Kegiatan */}
              <FormControl isInvalid={!!tambahErrors.nama}>
                <FormLabel>Nama Sub Kegiatan</FormLabel>
                <Input
                  placeholder="Masukkan nama sub kegiatan"
                  value={tambahForm.nama}
                  onChange={(e) => {
                    setTambahForm({ ...tambahForm, nama: e.target.value });
                    setTambahErrors({ ...tambahErrors, nama: "" });
                  }}
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                />
                <FormErrorMessage>{tambahErrors.nama}</FormErrorMessage>
              </FormControl>
            </VStack>
          </ModalBody>
          <Divider />
          <ModalFooter>
            <Button mr={3} variant="ghost" onClick={handleTambahClose}>
              Batal
            </Button>
            <Button colorScheme="green" onClick={handleTambah}>
              Tambah Sub Kegiatan
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
                Apakah Anda yakin ingin menghapus sub kegiatan berikut?
              </Text>
              {subKegiatanToDelete && (
                <Box
                  p={4}
                  borderRadius="md"
                  bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                  border="1px"
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                >
                  <VStack align="start" spacing={2}>
                    <HStack spacing={2}>
                      <Badge colorScheme="blue" borderRadius="full">
                        {`${
                          subKegiatanToDelete.kegiatan?.program?.kode || ""
                        }.${subKegiatanToDelete.kegiatan?.kode || ""}.${
                          subKegiatanToDelete.kode || ""
                        }`}
                      </Badge>
                    </HStack>
                    <Text
                      fontWeight="semibold"
                      color={colorMode === "dark" ? "white" : "gray.800"}
                    >
                      {subKegiatanToDelete.nama}
                    </Text>
                    {subKegiatanToDelete.kegiatan && (
                      <Text fontSize="sm" color="gray.600">
                        Kegiatan: {subKegiatanToDelete.kegiatan.nama}
                      </Text>
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

      {/* Modal Tambah Indikator */}
      <Modal
        isOpen={isTambahIndikatorOpen}
        onClose={handleTambahIndikatorClose}
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
              <Icon as={FaPlus} color="orange.500" />
              <Text>Tambah Indikator</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <Divider />
          <ModalBody py={6}>
            <VStack spacing={4} align="stretch">
              {selectedSubKegiatanForIndikator && (
                <Box
                  p={3}
                  borderRadius="md"
                  bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                  border="1px"
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                >
                  <VStack align="start" spacing={1} fontSize="sm">
                    <Text color="gray.600">
                      <Text as="span" fontWeight="semibold">
                        Sub Kegiatan:
                      </Text>{" "}
                      {selectedSubKegiatanForIndikator.kegiatan?.program
                        ?.kode || ""}
                      {selectedSubKegiatanForIndikator.kegiatan?.kode || ""}
                      {selectedSubKegiatanForIndikator.kode || ""} -{" "}
                      {selectedSubKegiatanForIndikator.nama}
                    </Text>
                  </VStack>
                </Box>
              )}

              <FormControl isInvalid={!!indikatorErrors.indikator}>
                <FormLabel>Nama Indikator</FormLabel>
                <Input
                  placeholder="Masukkan nama indikator"
                  value={indikatorForm.indikator}
                  onChange={(e) => {
                    setIndikatorForm({
                      ...indikatorForm,
                      indikator: e.target.value,
                    });
                    setIndikatorErrors({ ...indikatorErrors, indikator: "" });
                  }}
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                />
                <FormErrorMessage>{indikatorErrors.indikator}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!indikatorErrors.satuanIndikatorId}>
                <FormLabel>Satuan Indikator</FormLabel>
                <Select
                  placeholder="Pilih Satuan Indikator"
                  value={indikatorForm.satuanIndikatorId}
                  onChange={(e) => {
                    setIndikatorForm({
                      ...indikatorForm,
                      satuanIndikatorId: e.target.value,
                    });
                    setIndikatorErrors({
                      ...indikatorErrors,
                      satuanIndikatorId: "",
                    });
                  }}
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                  isLoading={isLoadingKegiatan}
                >
                  {dataSatuan.map((satuan) => (
                    <option key={satuan.id} value={satuan.id}>
                      {satuan.satuan || satuan.nama || satuan.namaSatuan}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>
                  {indikatorErrors.satuanIndikatorId}
                </FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Unit Kerja</FormLabel>
                <Select2
                  options={dataUnitKerja.map((unit) => ({
                    value: unit.id,
                    label: unit.unitKerja,
                  }))}
                  placeholder="Pilih unit kerja..."
                  value={
                    indikatorForm.unitKerjaId
                      ? dataUnitKerja
                          .map((unit) => ({
                            value: unit.id,
                            label: unit.unitKerja,
                          }))
                          .find(
                            (opt) =>
                              opt.value.toString() ===
                              indikatorForm.unitKerjaId?.toString()
                          )
                      : null
                  }
                  onChange={(selected) =>
                    setIndikatorForm({
                      ...indikatorForm,
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
                  value={selectedIndikatorPegawai}
                  onChange={(selectedOption) => {
                    setSelectedIndikatorPegawai(selectedOption);
                    setIndikatorForm({
                      ...indikatorForm,
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
            <Button mr={3} variant="ghost" onClick={handleTambahIndikatorClose}>
              Batal
            </Button>
            <Button colorScheme="orange" onClick={handleTambahIndikator}>
              Tambah Indikator
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </LayoutPerencanaan>
  );
}

export default AdminSubKegiatan;
