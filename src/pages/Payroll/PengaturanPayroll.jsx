import React, { useState, useEffect, useCallback } from "react";
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
  ModalCloseButton,
  Container,
  FormControl,
  FormLabel,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  Input,
  Heading,
  useColorMode,
  Icon,
  Divider,
  Badge,
  useMediaQuery,
  VStack,
  Card,
  CardBody,
  CardHeader,
  useToast,
  useDisclosure,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { BsGearFill, BsPlusLg, BsArrowLeft } from "react-icons/bs";
import { FaHandHoldingUsd, FaMinusCircle } from "react-icons/fa";
import { useHistory } from "react-router-dom";
import axios from "axios";
import LayoutPegawai from "../../Componets/Pegawai/LayoutPegawai";
import Loading from "../../Componets/Loading";
import DataKosong from "../../Componets/DataKosong";

const TIPE_OPTIONS = [
  { value: "nominal", label: "Nominal" },
  { value: "presentase", label: "Persentase" },
];

const formatRupiah = (value) => {
  if (value == null || value === "") return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(value));
};

const getTipeLabel = (tipe) => {
  const found = TIPE_OPTIONS.find((o) => o.value === tipe);
  return found?.label || tipe || "-";
};

function PengaturanPayroll() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dataPotongan, setDataPotongan] = useState([]);
  const [dataTunjangan, setDataTunjangan] = useState([]);
  const [formTunjangan, setFormTunjangan] = useState({ nama: "", tipe: "" });
  const [formPotongan, setFormPotongan] = useState({
    nama: "",
    tipe: "",
    nominal: "",
  });
  const { colorMode } = useColorMode();
  const [isMobile] = useMediaQuery("(max-width: 768px)");
  const toast = useToast();
  const history = useHistory();

  const {
    isOpen: isTunjanganOpen,
    onOpen: onTunjanganOpen,
    onClose: onTunjanganClose,
  } = useDisclosure();
  const {
    isOpen: isPotonganOpen,
    onOpen: onPotonganOpen,
    onClose: onPotonganClose,
  } = useDisclosure();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/payroll/get/pengaturan`,
      );
      setDataPotongan(res.data.resultPotongan || []);
      setDataTunjangan(res.data.resultTunjangan || []);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description:
          err.response?.data?.message || "Gagal memuat data pengaturan payroll",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmitTunjangan = async () => {
    if (!formTunjangan.nama.trim() || !formTunjangan.tipe) {
      toast({
        title: "Error",
        description: "Nama dan tipe harus diisi",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/payroll/post/tunjangan`,
        {
          nama: formTunjangan.nama.trim(),
          tipe: formTunjangan.tipe,
        },
      );
      toast({
        title: "Berhasil",
        description: "Tunjangan berhasil ditambahkan",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onTunjanganClose();
      setFormTunjangan({ nama: "", tipe: "" });
      fetchData();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description:
          err.response?.data?.message || "Gagal menambahkan tunjangan",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitPotongan = async () => {
    if (
      !formPotongan.nama.trim() ||
      !formPotongan.tipe ||
      formPotongan.nominal === ""
    ) {
      toast({
        title: "Error",
        description: "Nama, tipe, dan nominal harus diisi",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/payroll/post/potongan`,
        {
          nama: formPotongan.nama.trim(),
          tipe: formPotongan.tipe,
          nominal: Number(formPotongan.nominal),
        },
      );
      toast({
        title: "Berhasil",
        description: "Potongan berhasil ditambahkan",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onPotonganClose();
      setFormPotongan({ nama: "", tipe: "", nominal: "" });
      fetchData();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description:
          err.response?.data?.message || "Gagal menambahkan potongan",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardBg = colorMode === "dark" ? "gray.800" : "white";
  const borderColor = colorMode === "dark" ? "gray.700" : "gray.200";
  const textMuted = colorMode === "dark" ? "gray.400" : "gray.600";
  const textPrimary = colorMode === "dark" ? "white" : "gray.800";
  const thBg = colorMode === "dark" ? "gray.700" : "gray.50";

  if (isLoading) {
    return (
      <LayoutPegawai>
        <Loading />
      </LayoutPegawai>
    );
  }

  return (
    <LayoutPegawai>
      <Box
        bg={colorMode === "dark" ? "gray.900" : "secondary.light"}
        pb={isMobile ? "20px" : "40px"}
        px={isMobile ? "15px" : "30px"}
        minH="65vh"
      >
        <Container
          border="1px"
          borderRadius="12px"
          borderColor={borderColor}
          maxW="1400px"
          bg={cardBg}
          p={isMobile ? "15px" : "30px"}
          boxShadow={colorMode === "dark" ? "lg" : "sm"}
        >
          <Flex
            align="center"
            justify="space-between"
            mb={4}
            wrap="wrap"
            gap={4}
            direction={isMobile ? "column" : "row"}
          >
            <Box flex={1}>
              <Heading
                size={isMobile ? "md" : "lg"}
                color={textPrimary}
                mb={2}
                display="flex"
                alignItems="center"
                gap={3}
              >
                <Icon
                  as={BsGearFill}
                  color="pegawai"
                  boxSize={isMobile ? 6 : 8}
                />
                Pengaturan Payroll
              </Heading>
              <Text color={textMuted} fontSize="sm">
                Kelola master tunjangan dan potongan gaji
              </Text>
            </Box>
            <Button
              variant="outline"
              colorScheme="blue"
              size="sm"
              leftIcon={<BsArrowLeft />}
              onClick={() => history.push("/admin-pegawai/daftar-payroll")}
            >
              Kembali
            </Button>
          </Flex>

          <Divider mb={6} borderColor={borderColor} />

          <VStack spacing={6} align="stretch">
            {/* Tunjangan */}
            <Card
              bg={cardBg}
              borderWidth="1px"
              borderColor={borderColor}
              boxShadow="sm"
              borderRadius="lg"
            >
              <CardHeader
                pb={3}
                borderBottomWidth="1px"
                borderColor={borderColor}
              >
                <Flex
                  justify="space-between"
                  align="center"
                  wrap="wrap"
                  gap={3}
                >
                  <HStack spacing={3}>
                    <Icon
                      as={FaHandHoldingUsd}
                      boxSize={5}
                      color={colorMode === "dark" ? "green.300" : "green.500"}
                    />
                    <Heading size="md" color={textPrimary}>
                      Tunjangan
                    </Heading>
                    <Badge colorScheme="green" borderRadius="full" px={2}>
                      {dataTunjangan.length} data
                    </Badge>
                  </HStack>
                  <Button
                    colorScheme="green"
                    size="sm"
                    leftIcon={<BsPlusLg />}
                    onClick={() => {
                      setFormTunjangan({ nama: "", tipe: "" });
                      onTunjanganOpen();
                    }}
                  >
                    Tambah Tunjangan
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody pt={4}>
                {dataTunjangan.length === 0 ? (
                  <DataKosong message="Belum ada data tunjangan" />
                ) : (
                  <Box overflowX="auto">
                    <Table variant="simple" size="md">
                      <Thead>
                        <Tr bg={thBg}>
                          <Th color={textMuted} w="60px">
                            No
                          </Th>
                          <Th color={textMuted}>Nama</Th>
                          <Th color={textMuted}>Tipe</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {dataTunjangan.map((item, index) => (
                          <Tr
                            key={item.id ?? index}
                            _hover={{
                              bg:
                                colorMode === "dark" ? "gray.700" : "green.50",
                            }}
                          >
                            <Td color={textPrimary}>{index + 1}</Td>
                            <Td color={textPrimary} fontWeight="medium">
                              {item.nama || "-"}
                            </Td>
                            <Td>
                              <Badge
                                colorScheme={
                                  item.tipe === "persen" ? "purple" : "blue"
                                }
                              >
                                {getTipeLabel(item.tipe)}
                              </Badge>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                )}
              </CardBody>
            </Card>

            {/* Potongan */}
            <Card
              bg={cardBg}
              borderWidth="1px"
              borderColor={borderColor}
              boxShadow="sm"
              borderRadius="lg"
            >
              <CardHeader
                pb={3}
                borderBottomWidth="1px"
                borderColor={borderColor}
              >
                <Flex
                  justify="space-between"
                  align="center"
                  wrap="wrap"
                  gap={3}
                >
                  <HStack spacing={3}>
                    <Icon
                      as={FaMinusCircle}
                      boxSize={5}
                      color={colorMode === "dark" ? "red.300" : "red.500"}
                    />
                    <Heading size="md" color={textPrimary}>
                      Potongan
                    </Heading>
                    <Badge colorScheme="red" borderRadius="full" px={2}>
                      {dataPotongan.length} data
                    </Badge>
                  </HStack>
                  <Button
                    colorScheme="red"
                    size="sm"
                    leftIcon={<BsPlusLg />}
                    onClick={() => {
                      setFormPotongan({ nama: "", tipe: "", nominal: "" });
                      onPotonganOpen();
                    }}
                  >
                    Tambah Potongan
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody pt={4}>
                {dataPotongan.length === 0 ? (
                  <DataKosong message="Belum ada data potongan" />
                ) : (
                  <Box overflowX="auto">
                    <Table variant="simple" size="md">
                      <Thead>
                        <Tr bg={thBg}>
                          <Th color={textMuted} w="60px">
                            No
                          </Th>
                          <Th color={textMuted}>Nama</Th>
                          <Th color={textMuted}>Tipe</Th>
                          <Th color={textMuted} isNumeric>
                            Nominal
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {dataPotongan.map((item, index) => (
                          <Tr
                            key={item.id ?? index}
                            _hover={{
                              bg: colorMode === "dark" ? "gray.700" : "red.50",
                            }}
                          >
                            <Td color={textPrimary}>{index + 1}</Td>
                            <Td color={textPrimary} fontWeight="medium">
                              {item.nama || "-"}
                            </Td>
                            <Td>
                              <Badge
                                colorScheme={
                                  item.tipe === "persen" ? "purple" : "blue"
                                }
                              >
                                {getTipeLabel(item.tipe)}
                              </Badge>
                            </Td>
                            <Td isNumeric color={textPrimary}>
                              {item.tipe === "persen"
                                ? `${item.nominal ?? 0}%`
                                : formatRupiah(item.nominal)}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                )}
              </CardBody>
            </Card>
          </VStack>
        </Container>
      </Box>

      {/* Modal Tambah Tunjangan */}
      <Modal
        isOpen={isTunjanganOpen}
        onClose={onTunjanganClose}
        isCentered
        closeOnOverlayClick={false}
      >
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent bg={cardBg} borderRadius="lg">
          <ModalHeader borderBottomWidth="1px" borderColor={borderColor}>
            Tambah Tunjangan
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel color={textMuted}>Nama Tunjangan</FormLabel>
                <Input
                  placeholder="Contoh: Tunjangan Transport"
                  value={formTunjangan.nama}
                  onChange={(e) =>
                    setFormTunjangan((prev) => ({
                      ...prev,
                      nama: e.target.value,
                    }))
                  }
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel color={textMuted}>Tipe</FormLabel>
                <Select
                  placeholder="Pilih tipe"
                  value={formTunjangan.tipe}
                  onChange={(e) =>
                    setFormTunjangan((prev) => ({
                      ...prev,
                      tipe: e.target.value,
                    }))
                  }
                >
                  {TIPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor={borderColor}>
            <Button variant="outline" mr={3} onClick={onTunjanganClose}>
              Batal
            </Button>
            <Button
              colorScheme="green"
              onClick={handleSubmitTunjangan}
              isLoading={isSubmitting}
            >
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Tambah Potongan */}
      <Modal
        isOpen={isPotonganOpen}
        onClose={onPotonganClose}
        isCentered
        closeOnOverlayClick={false}
      >
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent bg={cardBg} borderRadius="lg">
          <ModalHeader borderBottomWidth="1px" borderColor={borderColor}>
            Tambah Potongan
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel color={textMuted}>Nama Potongan</FormLabel>
                <Input
                  placeholder="Contoh: Potongan BPJS"
                  value={formPotongan.nama}
                  onChange={(e) =>
                    setFormPotongan((prev) => ({
                      ...prev,
                      nama: e.target.value,
                    }))
                  }
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel color={textMuted}>Tipe</FormLabel>
                <Select
                  placeholder="Pilih tipe"
                  value={formPotongan.tipe}
                  onChange={(e) =>
                    setFormPotongan((prev) => ({
                      ...prev,
                      tipe: e.target.value,
                    }))
                  }
                >
                  {TIPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel color={textMuted}>
                  {formPotongan.tipe === "persen"
                    ? "Persentase (%)"
                    : "Nominal (Rp)"}
                </FormLabel>
                <NumberInput
                  min={0}
                  value={formPotongan.nominal}
                  onChange={(_, val) =>
                    setFormPotongan((prev) => ({
                      ...prev,
                      nominal: val,
                    }))
                  }
                >
                  <NumberInputField
                    placeholder={
                      formPotongan.tipe === "persen"
                        ? "Contoh: 5"
                        : "Contoh: 500000"
                    }
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor={borderColor}>
            <Button variant="outline" mr={3} onClick={onPotonganClose}>
              Batal
            </Button>
            <Button
              colorScheme="red"
              onClick={handleSubmitPotongan}
              isLoading={isSubmitting}
            >
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </LayoutPegawai>
  );
}

export default PengaturanPayroll;
