import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { userRedux } from "../../Redux/Reducers/auth";
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  IconButton,
  Tooltip,
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

function SatuanIndikator(props) {
  const { colorMode } = useColorMode();
  const history = useHistory();
  const [dataSatuanIndikator, setDataSatuanIndikator] = useState([]);
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
  const [selectedSatuan, setSelectedSatuan] = useState(null);
  const [satuanToDelete, setSatuanToDelete] = useState(null);
  const [editForm, setEditForm] = useState({
    satuan: "",
  });
  const [tambahForm, setTambahForm] = useState({
    satuan: "",
  });
  const [isLoadingSeed, setIsLoadingSeed] = useState(false);
  const [errors, setErrors] = useState({});
  const [tambahErrors, setTambahErrors] = useState({});
  const toast = useToast();

  // Pagination state
  const [page, setPage] = useState(0);
  const [limit] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPage, setTotalPage] = useState(0);

  // Filter state
  const [filterSatuan, setFilterSatuan] = useState("");
  const [sortTime, setSortTime] = useState("ASC");
  const timeoutRef = useRef(null);

  const token = localStorage.getItem("token");

  async function fetchSatuanIndikator() {
    try {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        time: sortTime,
      });

      if (filterSatuan) {
        params.append("satuan", filterSatuan);
      }

      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/satuan-indikator/get?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setDataSatuanIndikator(res.data.result || []);
      setTotalRows(res.data.totalRows || 0);
      setTotalPage(res.data.totalPage || 0);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data satuan indikator");
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

  useEffect(() => {
    fetchSatuanIndikator();
  }, [page, limit, sortTime]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleEdit = (item) => {
    setSelectedSatuan(item);
    setEditForm({
      satuan: item.satuan || "",
    });
    setErrors({});
    onOpen();
  };

  const validateForm = () => {
    const newErrors = {};
    if (!editForm.satuan.trim()) {
      newErrors.satuan = "Satuan indikator harus diisi";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!selectedSatuan) return;
    if (!validateForm()) return;

    try {
      await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/satuan-indikator/update/${selectedSatuan.id}`,
        {
          satuan: editForm.satuan.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast({
        title: "Berhasil",
        description: "Satuan Indikator berhasil diperbarui",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onClose();
      setSelectedSatuan(null);
      fetchSatuanIndikator();
    } catch (err) {
      console.error(err);
      toast({
        title: "Gagal",
        description:
          err.response?.data?.message || "Gagal memperbarui satuan indikator",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedSatuan(null);
    setEditForm({ satuan: "" });
    setErrors({});
  };

  const handleHapusClick = (item) => {
    setSatuanToDelete(item);
    onHapusOpen();
  };

  const handleHapusClose = () => {
    onHapusClose();
    setSatuanToDelete(null);
  };

  const handleDelete = async () => {
    if (!satuanToDelete) return;

    try {
      await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/satuan-indikator/delete/${satuanToDelete.id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast({
        title: "Berhasil",
        description: "Satuan Indikator berhasil dihapus",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      handleHapusClose();
      fetchSatuanIndikator();
    } catch (err) {
      console.error(err);
      toast({
        title: "Gagal",
        description:
          err.response?.data?.message || "Gagal menghapus satuan indikator",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleTambahOpen = () => {
    setTambahForm({ satuan: "" });
    setTambahErrors({});
    onTambahOpen();
  };

  const handleTambahClose = () => {
    onTambahClose();
    setTambahForm({ satuan: "" });
    setTambahErrors({});
  };

  const validateTambahForm = () => {
    const newErrors = {};
    if (!tambahForm.satuan.trim()) {
      newErrors.satuan = "Satuan indikator harus diisi";
    }
    setTambahErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTambah = async () => {
    if (!validateTambahForm()) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/satuan-indikator/post`,
        {
          satuan: tambahForm.satuan.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast({
        title: "Berhasil",
        description: "Satuan Indikator berhasil ditambahkan",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      handleTambahClose();
      fetchSatuanIndikator();
    } catch (err) {
      console.error(err);
      toast({
        title: "Gagal",
        description:
          err.response?.data?.message || "Gagal menambahkan satuan indikator",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSearch = () => {
    setPage(0);
    fetchSatuanIndikator();
  };

  const handleResetFilter = () => {
    setFilterSatuan("");
    setPage(0);
  };

  function inputHandler(event, field) {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    const value = event.target.value;
    setFilterSatuan(value);
    timeoutRef.current = setTimeout(() => {
      setPage(0);
      fetchSatuanIndikator();
    }, 2000);
  }

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
                Daftar Satuan Indikator
              </Heading>
              <Text fontSize="sm" color="gray.500">
                Kelola satuan indikator untuk digunakan pada indikator kinerja
              </Text>
            </VStack>
            <HStack spacing={3}>
              <Button
                leftIcon={<FaPlus />}
                colorScheme="green"
                size="sm"
                onClick={handleTambahOpen}
              >
                Tambah Satuan
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
            mb={6}
            bg={colorMode === "dark" ? "gray.700" : "white"}
            borderRadius="lg"
            boxShadow="md"
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
              <HStack spacing={4} wrap="wrap">
                <FormControl maxW="300px">
                  <FormLabel fontSize="sm" fontWeight="semibold">
                    Cari Satuan
                  </FormLabel>
                  <Input
                    placeholder="Masukkan nama satuan..."
                    value={filterSatuan}
                    onChange={(e) => inputHandler(e, "satuan")}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        if (timeoutRef.current) {
                          clearTimeout(timeoutRef.current);
                        }
                        handleSearch();
                      }
                    }}
                    bg={colorMode === "dark" ? "gray.600" : "white"}
                    borderColor={colorMode === "dark" ? "gray.500" : "gray.200"}
                  />
                </FormControl>
                <FormControl maxW="200px">
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
                <VStack align="end" spacing={2} mt="auto">
                  <HStack>
                    <Button
                      leftIcon={<FaSearch />}
                      colorScheme="blue"
                      size="sm"
                      onClick={handleSearch}
                    >
                      Cari
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetFilter}
                    >
                      Reset
                    </Button>
                  </HStack>
                </VStack>
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
                <Button size="sm" onClick={fetchSatuanIndikator}>
                  Muat Ulang
                </Button>
              </VStack>
            </Center>
          ) : dataSatuanIndikator.length === 0 ? (
            <Center py={16}>
              <VStack spacing={4}>
                <Icon as={FaFileAlt} boxSize={12} color="gray.400" />
                <Text color="gray.500">Belum ada satuan indikator</Text>
              </VStack>
            </Center>
          ) : (
            <>
              <Card
                bg={colorMode === "dark" ? "gray.700" : "white"}
                borderRadius="lg"
                boxShadow="md"
                mb={4}
              >
                <CardBody>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>No</Th>
                        <Th>Satuan Indikator</Th>
                        <Th>Tanggal Dibuat</Th>
                        <Th>Tanggal Diupdate</Th>
                        <Th textAlign="center">Aksi</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {dataSatuanIndikator.map((item, index) => (
                        <Tr key={item.id}>
                          <Td>{page * limit + index + 1}</Td>
                          <Td>
                            <Badge
                              colorScheme="blue"
                              borderRadius="full"
                              px={3}
                              py={1}
                            >
                              {item.satuan}
                            </Badge>
                          </Td>
                          <Td>
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString(
                                  "id-ID",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )
                              : "-"}
                          </Td>
                          <Td>
                            {item.updatedAt
                              ? new Date(item.updatedAt).toLocaleDateString(
                                  "id-ID",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )
                              : "-"}
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
                </CardBody>
              </Card>

              {/* Pagination */}
              <HStack justify="space-between" align="center" mt={4}>
                <Text fontSize="sm" color="gray.500">
                  Menampilkan {page * limit + 1} -{" "}
                  {Math.min((page + 1) * limit, totalRows)} dari {totalRows}{" "}
                  data
                </Text>
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    isDisabled={page === 0}
                  >
                    Sebelumnya
                  </Button>
                  <Text fontSize="sm">
                    Halaman {page + 1} dari {totalPage || 1}
                  </Text>
                  <Button
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    isDisabled={page + 1 >= totalPage}
                  >
                    Selanjutnya
                  </Button>
                </HStack>
              </HStack>
            </>
          )}
        </Container>
      </Box>

      {/* Modal Edit Satuan Indikator */}
      <Modal isOpen={isOpen} onClose={handleClose} size="md" isCentered>
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderRadius="xl"
        >
          <ModalHeader>
            <HStack>
              <Icon as={FaEdit} color="blue.500" />
              <Text>Edit Satuan Indikator</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <Divider />
          <ModalBody py={6}>
            <VStack spacing={5} align="stretch">
              <FormControl isInvalid={!!errors.satuan}>
                <FormLabel>Satuan Indikator</FormLabel>
                <Input
                  placeholder="Masukkan satuan indikator"
                  value={editForm.satuan}
                  onChange={(e) => {
                    setEditForm({ ...editForm, satuan: e.target.value });
                    setErrors({ ...errors, satuan: "" });
                  }}
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                />
                <FormErrorMessage>{errors.satuan}</FormErrorMessage>
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

      {/* Modal Tambah Satuan Indikator */}
      <Modal
        isOpen={isTambahOpen}
        onClose={handleTambahClose}
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
              <Icon as={FaPlus} color="green.500" />
              <Text>Tambah Satuan Indikator</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <Divider />
          <ModalBody py={6}>
            <VStack spacing={5} align="stretch">
              <FormControl isInvalid={!!tambahErrors.satuan}>
                <FormLabel>Satuan Indikator</FormLabel>
                <Input
                  placeholder="Masukkan satuan indikator (contoh: Unit, Persen, dll)"
                  value={tambahForm.satuan}
                  onChange={(e) => {
                    setTambahForm({ ...tambahForm, satuan: e.target.value });
                    setTambahErrors({ ...tambahErrors, satuan: "" });
                  }}
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                />
                <FormErrorMessage>{tambahErrors.satuan}</FormErrorMessage>
              </FormControl>
            </VStack>
          </ModalBody>
          <Divider />
          <ModalFooter>
            <Button mr={3} variant="ghost" onClick={handleTambahClose}>
              Batal
            </Button>
            <Button colorScheme="green" onClick={handleTambah}>
              Tambah Satuan
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
                Apakah Anda yakin ingin menghapus satuan indikator berikut?
              </Text>
              {satuanToDelete && (
                <Box
                  p={4}
                  borderRadius="md"
                  bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                  border="1px"
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                >
                  <VStack align="start" spacing={2}>
                    <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
                      {satuanToDelete.satuan}
                    </Badge>
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

export default SatuanIndikator;
