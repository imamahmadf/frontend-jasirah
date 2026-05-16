import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import LayoutAset from "../../Componets/Aset/LayoutAset";
import { useHistory } from "react-router-dom";
import {
  Box,
  Text,
  Button,
  Container,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  useToast,
  useColorMode,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  HStack,
  IconButton,
  useDisclosure,
  Select,
  Divider,
  Card,
  CardBody,
  CardHeader,
  Icon,
  Badge,
} from "@chakra-ui/react";
import {
  FaPlus,
  FaArrowLeft,
  FaCog,
  FaShoppingCart,
  FaWallet,
} from "react-icons/fa";
import Loading from "../../Componets/Loading";
import DataKosong from "../../Componets/DataKosong";

function PengaturanBarjas() {
  const [dataJenisBarjas, setDataJenisBarjas] = useState([]);
  const [dataJenisBelanja, setDataJenisBelanja] = useState([]);
  const [dataAkunBelanja, setDataAkunBelanja] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    jenis: "",
    akun: "",
    jenisBelanjaId: "",
  });
  const toast = useToast();
  const { colorMode } = useColorMode();
  const history = useHistory();

  // Modal disclosures
  const {
    isOpen: isJenisBarjasOpen,
    onOpen: onJenisBarjasOpen,
    onClose: onJenisBarjasClose,
  } = useDisclosure();
  const {
    isOpen: isJenisBelanjaOpen,
    onOpen: onJenisBelanjaOpen,
    onClose: onJenisBelanjaClose,
  } = useDisclosure();
  const {
    isOpen: isAkunBelanjaOpen,
    onOpen: onAkunBelanjaOpen,
    onClose: onAkunBelanjaClose,
  } = useDisclosure();

  const fetchPengaturan = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/barjas/get/pengaturan`
      );
      setDataJenisBarjas(res.data.resultJenisBarjas || []);
      setDataJenisBelanja(res.data.resultJenisBelanja || []);
      setDataAkunBelanja(res.data.resultAkunBelanja || []);
      console.log(res.data);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description:
          err.response?.data?.error || "Gagal memuat data pengaturan",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPengaturan();
  }, [fetchPengaturan]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmitJenisBarjas = async () => {
    if (!formData.jenis) {
      toast({
        title: "Error",
        description: "Jenis harus diisi",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/barjas/post/jenis-barjas`,
        {
          jenis: formData.jenis,
        }
      );

      toast({
        title: "Berhasil",
        description: "Jenis Barjas berhasil ditambahkan",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onJenisBarjasClose();
      setFormData((prev) => ({ ...prev, jenis: "" }));
      fetchPengaturan();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description:
          err.response?.data?.error || "Gagal menambahkan jenis barjas",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSubmitJenisBelanja = async () => {
    if (!formData.jenis) {
      toast({
        title: "Error",
        description: "Jenis harus diisi",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/barjas/post/jenis-belanja`,
        null,
        {
          params: {
            jenis: formData.jenis,
          },
        }
      );

      toast({
        title: "Berhasil",
        description: "Jenis Belanja berhasil ditambahkan",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onJenisBelanjaClose();
      setFormData((prev) => ({ ...prev, jenis: "" }));
      fetchPengaturan();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description:
          err.response?.data?.error || "Gagal menambahkan jenis belanja",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSubmitAkunBelanja = async () => {
    if (!formData.akun || !formData.jenisBelanjaId) {
      toast({
        title: "Error",
        description: "Akun dan Jenis Belanja harus diisi",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/barjas/post/akun-belanja`,
        {
          akun: formData.akun,
          jenisBelanjaId: formData.jenisBelanjaId,
        }
      );

      toast({
        title: "Berhasil",
        description: "Akun Belanja berhasil ditambahkan",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onAkunBelanjaClose();
      setFormData((prev) => ({ ...prev, akun: "", jenisBelanjaId: "" }));
      fetchPengaturan();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description:
          err.response?.data?.error || "Gagal menambahkan akun belanja",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return (
      <LayoutAset>
        <Loading />
      </LayoutAset>
    );
  }

  return (
    <LayoutAset>
      <Box bgColor={"secondary"} pb={"40px"} px={"30px"} minH="100vh">
        <Container maxW={"1400px"} py={8}>
          {/* Header Section */}
          <Card
            mb={6}
            bg={colorMode === "dark" ? "gray.800" : "white"}
            boxShadow="md"
            borderRadius="lg"
            borderWidth="1px"
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          >
            <CardBody>
              <HStack justify="space-between" align="center">
                <HStack spacing={3}>
                  <Icon
                    as={FaCog}
                    boxSize={6}
                    color={colorMode === "dark" ? "blue.300" : "blue.500"}
                  />
                  <Heading
                    size="lg"
                    color={colorMode === "dark" ? "white" : "gray.700"}
                    fontWeight="semibold"
                  >
                    Pengaturan Barjas
                  </Heading>
                </HStack>
                <Button
                  onClick={() => history.goBack()}
                  colorScheme="blue"
                  size="md"
                  leftIcon={<FaArrowLeft />}
                  variant="outline"
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "md",
                  }}
                  transition="all 0.2s"
                >
                  Kembali
                </Button>
              </HStack>
            </CardBody>
          </Card>

          {/* Section Jenis Barjas */}
          <Card
            mb={6}
            bg={colorMode === "dark" ? "gray.800" : "white"}
            boxShadow="md"
            borderRadius="lg"
            borderWidth="1px"
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            _hover={{
              boxShadow: "lg",
              transform: "translateY(-2px)",
            }}
            transition="all 0.3s"
          >
            <CardHeader
              pb={3}
              borderBottomWidth="1px"
              borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            >
              <HStack justify="space-between" align="center">
                <HStack spacing={3}>
                  <Icon
                    as={FaShoppingCart}
                    boxSize={5}
                    color={colorMode === "dark" ? "green.300" : "green.500"}
                  />
                  <Heading
                    size="md"
                    color={colorMode === "dark" ? "white" : "gray.700"}
                    fontWeight="semibold"
                  >
                    Jenis Barjas
                  </Heading>
                  <Badge
                    colorScheme="green"
                    variant="subtle"
                    borderRadius="full"
                    px={2}
                    py={1}
                  >
                    {dataJenisBarjas.length} Data
                  </Badge>
                </HStack>
                <Button
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, jenis: "" }));
                    onJenisBarjasOpen();
                  }}
                  colorScheme="green"
                  size="md"
                  leftIcon={<FaPlus />}
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "md",
                  }}
                  transition="all 0.2s"
                >
                  Tambah
                </Button>
              </HStack>
            </CardHeader>
            <CardBody pt={4}>
              {dataJenisBarjas.length === 0 ? (
                <DataKosong message="Tidak ada data jenis barjas" />
              ) : (
                <Box overflowX="auto">
                  <Table variant="simple" size="md" colorScheme="green">
                    <Thead>
                      <Tr bg={colorMode === "dark" ? "gray.700" : "gray.50"}>
                        <Th
                          color={colorMode === "dark" ? "gray.300" : "gray.600"}
                          fontWeight="semibold"
                          textTransform="uppercase"
                          fontSize="xs"
                          letterSpacing="wider"
                        >
                          No
                        </Th>
                        <Th
                          color={colorMode === "dark" ? "gray.300" : "gray.600"}
                          fontWeight="semibold"
                          textTransform="uppercase"
                          fontSize="xs"
                          letterSpacing="wider"
                        >
                          Jenis
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {dataJenisBarjas.map((item, index) => (
                        <Tr
                          key={item.id || index}
                          _hover={{
                            bg: colorMode === "dark" ? "gray.700" : "green.50",
                            transform: "scale(1.01)",
                          }}
                          transition="all 0.2s"
                          cursor="pointer"
                        >
                          <Td
                            fontWeight="medium"
                            color={
                              colorMode === "dark" ? "gray.300" : "gray.700"
                            }
                          >
                            {index + 1}
                          </Td>
                          <Td
                            fontWeight="medium"
                            color={colorMode === "dark" ? "white" : "gray.800"}
                          >
                            {item.jenis || "-"}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </CardBody>
          </Card>

          {/* Section Jenis Belanja */}
          <Card
            mb={6}
            bg={colorMode === "dark" ? "gray.800" : "white"}
            boxShadow="md"
            borderRadius="lg"
            borderWidth="1px"
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            _hover={{
              boxShadow: "lg",
              transform: "translateY(-2px)",
            }}
            transition="all 0.3s"
          >
            <CardHeader
              pb={3}
              borderBottomWidth="1px"
              borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            >
              <HStack justify="space-between" align="center">
                <HStack spacing={3}>
                  <Icon
                    as={FaWallet}
                    boxSize={5}
                    color={colorMode === "dark" ? "blue.300" : "blue.500"}
                  />
                  <Heading
                    size="md"
                    color={colorMode === "dark" ? "white" : "gray.700"}
                    fontWeight="semibold"
                  >
                    Jenis Belanja
                  </Heading>
                  <Badge
                    colorScheme="blue"
                    variant="subtle"
                    borderRadius="full"
                    px={2}
                    py={1}
                  >
                    {dataJenisBelanja.length} Data
                  </Badge>
                </HStack>
                <Button
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, jenis: "" }));
                    onJenisBelanjaOpen();
                  }}
                  colorScheme="blue"
                  size="md"
                  leftIcon={<FaPlus />}
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "md",
                  }}
                  transition="all 0.2s"
                >
                  Tambah
                </Button>
              </HStack>
            </CardHeader>
            <CardBody pt={4}>
              {dataJenisBelanja.length === 0 ? (
                <DataKosong message="Tidak ada data jenis belanja" />
              ) : (
                <Box overflowX="auto">
                  <Table variant="simple" size="md" colorScheme="blue">
                    <Thead>
                      <Tr bg={colorMode === "dark" ? "gray.700" : "gray.50"}>
                        <Th
                          color={colorMode === "dark" ? "gray.300" : "gray.600"}
                          fontWeight="semibold"
                          textTransform="uppercase"
                          fontSize="xs"
                          letterSpacing="wider"
                        >
                          No
                        </Th>
                        <Th
                          color={colorMode === "dark" ? "gray.300" : "gray.600"}
                          fontWeight="semibold"
                          textTransform="uppercase"
                          fontSize="xs"
                          letterSpacing="wider"
                        >
                          Jenis
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {dataJenisBelanja.map((item, index) => (
                        <Tr
                          key={item.id || index}
                          _hover={{
                            bg: colorMode === "dark" ? "gray.700" : "blue.50",
                            transform: "scale(1.01)",
                          }}
                          transition="all 0.2s"
                          cursor="pointer"
                        >
                          <Td
                            fontWeight="medium"
                            color={
                              colorMode === "dark" ? "gray.300" : "gray.700"
                            }
                          >
                            {index + 1}
                          </Td>
                          <Td
                            fontWeight="medium"
                            color={colorMode === "dark" ? "white" : "gray.800"}
                          >
                            {item.jenis || "-"}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </CardBody>
          </Card>

          {/* Section Akun Belanja */}
          <Card
            mb={6}
            bg={colorMode === "dark" ? "gray.800" : "white"}
            boxShadow="md"
            borderRadius="lg"
            borderWidth="1px"
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            _hover={{
              boxShadow: "lg",
              transform: "translateY(-2px)",
            }}
            transition="all 0.3s"
          >
            <CardHeader
              pb={3}
              borderBottomWidth="1px"
              borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            >
              <HStack justify="space-between" align="center">
                <HStack spacing={3}>
                  <Icon
                    as={FaWallet}
                    boxSize={5}
                    color={colorMode === "dark" ? "purple.300" : "purple.500"}
                  />
                  <Heading
                    size="md"
                    color={colorMode === "dark" ? "white" : "gray.700"}
                    fontWeight="semibold"
                  >
                    Akun Belanja
                  </Heading>
                  <Badge
                    colorScheme="purple"
                    variant="subtle"
                    borderRadius="full"
                    px={2}
                    py={1}
                  >
                    {dataAkunBelanja.length} Data
                  </Badge>
                </HStack>
                <Button
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      akun: "",
                      jenisBelanjaId: "",
                    }));
                    onAkunBelanjaOpen();
                  }}
                  colorScheme="purple"
                  size="md"
                  leftIcon={<FaPlus />}
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "md",
                  }}
                  transition="all 0.2s"
                >
                  Tambah
                </Button>
              </HStack>
            </CardHeader>
            <CardBody pt={4}>
              {dataAkunBelanja.length === 0 ? (
                <DataKosong message="Tidak ada data akun belanja" />
              ) : (
                <Box overflowX="auto">
                  <Table variant="simple" size="md" colorScheme="purple">
                    <Thead>
                      <Tr bg={colorMode === "dark" ? "gray.700" : "gray.50"}>
                        <Th
                          color={colorMode === "dark" ? "gray.300" : "gray.600"}
                          fontWeight="semibold"
                          textTransform="uppercase"
                          fontSize="xs"
                          letterSpacing="wider"
                        >
                          No
                        </Th>
                        <Th
                          color={colorMode === "dark" ? "gray.300" : "gray.600"}
                          fontWeight="semibold"
                          textTransform="uppercase"
                          fontSize="xs"
                          letterSpacing="wider"
                        >
                          Akun
                        </Th>
                        <Th
                          color={colorMode === "dark" ? "gray.300" : "gray.600"}
                          fontWeight="semibold"
                          textTransform="uppercase"
                          fontSize="xs"
                          letterSpacing="wider"
                        >
                          Jenis Belanja
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {dataAkunBelanja.map((item, index) => (
                        <Tr
                          key={item.id || index}
                          _hover={{
                            bg: colorMode === "dark" ? "gray.700" : "purple.50",
                            transform: "scale(1.01)",
                          }}
                          transition="all 0.2s"
                          cursor="pointer"
                        >
                          <Td
                            fontWeight="medium"
                            color={
                              colorMode === "dark" ? "gray.300" : "gray.700"
                            }
                          >
                            {index + 1}
                          </Td>
                          <Td
                            fontWeight="medium"
                            color={colorMode === "dark" ? "white" : "gray.800"}
                          >
                            {item.akun || "-"}
                          </Td>
                          <Td
                            fontWeight="medium"
                            color={colorMode === "dark" ? "white" : "gray.800"}
                          >
                            {item.jenisBelanja?.jenis || "-"}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </CardBody>
          </Card>

          {/* Modal Tambah Jenis Barjas */}
          <Modal
            closeOnOverlayClick={false}
            isOpen={isJenisBarjasOpen}
            onClose={onJenisBarjasClose}
            size="md"
            isCentered
          >
            <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
            <ModalContent
              bg={colorMode === "dark" ? "gray.800" : "white"}
              borderRadius="lg"
              boxShadow="xl"
            >
              <ModalHeader
                borderBottomWidth="1px"
                borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                pb={4}
                color={colorMode === "dark" ? "white" : "gray.700"}
                fontWeight="semibold"
              >
                Tambah Jenis Barjas
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6} pt={6}>
                <VStack spacing={5} align="stretch">
                  <FormControl isRequired>
                    <FormLabel
                      color={colorMode === "dark" ? "gray.300" : "gray.600"}
                      fontWeight="medium"
                      mb={2}
                    >
                      Jenis
                    </FormLabel>
                    <Input
                      placeholder="Masukkan jenis barjas"
                      value={formData.jenis}
                      onChange={(e) =>
                        handleInputChange("jenis", e.target.value)
                      }
                      size="md"
                      focusBorderColor="green.500"
                      _hover={{
                        borderColor:
                          colorMode === "dark" ? "gray.600" : "gray.400",
                      }}
                    />
                  </FormControl>
                </VStack>
              </ModalBody>
              <ModalFooter
                borderTopWidth="1px"
                borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                pt={4}
              >
                <Button
                  onClick={onJenisBarjasClose}
                  mr={3}
                  variant="outline"
                  _hover={{
                    bg: colorMode === "dark" ? "gray.700" : "gray.100",
                  }}
                >
                  Batal
                </Button>
                <Button
                  colorScheme="green"
                  onClick={handleSubmitJenisBarjas}
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "md",
                  }}
                  transition="all 0.2s"
                >
                  Simpan
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          {/* Modal Tambah Jenis Belanja */}
          <Modal
            closeOnOverlayClick={false}
            isOpen={isJenisBelanjaOpen}
            onClose={onJenisBelanjaClose}
            size="md"
            isCentered
          >
            <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
            <ModalContent
              bg={colorMode === "dark" ? "gray.800" : "white"}
              borderRadius="lg"
              boxShadow="xl"
            >
              <ModalHeader
                borderBottomWidth="1px"
                borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                pb={4}
                color={colorMode === "dark" ? "white" : "gray.700"}
                fontWeight="semibold"
              >
                Tambah Jenis Belanja
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6} pt={6}>
                <VStack spacing={5} align="stretch">
                  <FormControl isRequired>
                    <FormLabel
                      color={colorMode === "dark" ? "gray.300" : "gray.600"}
                      fontWeight="medium"
                      mb={2}
                    >
                      Jenis
                    </FormLabel>
                    <Input
                      placeholder="Masukkan jenis belanja"
                      value={formData.jenis}
                      onChange={(e) =>
                        handleInputChange("jenis", e.target.value)
                      }
                      size="md"
                      focusBorderColor="blue.500"
                      _hover={{
                        borderColor:
                          colorMode === "dark" ? "gray.600" : "gray.400",
                      }}
                    />
                  </FormControl>
                </VStack>
              </ModalBody>
              <ModalFooter
                borderTopWidth="1px"
                borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                pt={4}
              >
                <Button
                  onClick={onJenisBelanjaClose}
                  mr={3}
                  variant="outline"
                  _hover={{
                    bg: colorMode === "dark" ? "gray.700" : "gray.100",
                  }}
                >
                  Batal
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={handleSubmitJenisBelanja}
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "md",
                  }}
                  transition="all 0.2s"
                >
                  Simpan
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          {/* Modal Tambah Akun Belanja */}
          <Modal
            closeOnOverlayClick={false}
            isOpen={isAkunBelanjaOpen}
            onClose={onAkunBelanjaClose}
            size="md"
            isCentered
          >
            <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
            <ModalContent
              bg={colorMode === "dark" ? "gray.800" : "white"}
              borderRadius="lg"
              boxShadow="xl"
            >
              <ModalHeader
                borderBottomWidth="1px"
                borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                pb={4}
                color={colorMode === "dark" ? "white" : "gray.700"}
                fontWeight="semibold"
              >
                Tambah Akun Belanja
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6} pt={6}>
                <VStack spacing={5} align="stretch">
                  <FormControl isRequired>
                    <FormLabel
                      color={colorMode === "dark" ? "gray.300" : "gray.600"}
                      fontWeight="medium"
                      mb={2}
                    >
                      Akun
                    </FormLabel>
                    <Input
                      placeholder="Masukkan akun belanja"
                      value={formData.akun}
                      onChange={(e) =>
                        handleInputChange("akun", e.target.value)
                      }
                      size="md"
                      focusBorderColor="purple.500"
                      _hover={{
                        borderColor:
                          colorMode === "dark" ? "gray.600" : "gray.400",
                      }}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel
                      color={colorMode === "dark" ? "gray.300" : "gray.600"}
                      fontWeight="medium"
                      mb={2}
                    >
                      Jenis Belanja
                    </FormLabel>
                    <Select
                      placeholder="Pilih jenis belanja"
                      value={formData.jenisBelanjaId}
                      onChange={(e) =>
                        handleInputChange("jenisBelanjaId", e.target.value)
                      }
                      size="md"
                      focusBorderColor="purple.500"
                      _hover={{
                        borderColor:
                          colorMode === "dark" ? "gray.600" : "gray.400",
                      }}
                    >
                      {dataJenisBelanja.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.jenis}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </VStack>
              </ModalBody>
              <ModalFooter
                borderTopWidth="1px"
                borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                pt={4}
              >
                <Button
                  onClick={onAkunBelanjaClose}
                  mr={3}
                  variant="outline"
                  _hover={{
                    bg: colorMode === "dark" ? "gray.700" : "gray.100",
                  }}
                >
                  Batal
                </Button>
                <Button
                  colorScheme="purple"
                  onClick={handleSubmitAkunBelanja}
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "md",
                  }}
                  transition="all 0.2s"
                >
                  Simpan
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Container>
      </Box>
    </LayoutAset>
  );
}

export default PengaturanBarjas;
