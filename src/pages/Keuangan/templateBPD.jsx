import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Container,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  Text,
  useToast,
  useColorMode,
  Collapse,
  IconButton,
  Button,
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
  Select,
  VStack,
  Flex,
  Divider,
  SimpleGrid,
  useDisclosure,
} from "@chakra-ui/react";
import { BsChevronDown, BsChevronUp, BsPlus, BsPencil } from "react-icons/bs";
import axios from "axios";
import { useSelector } from "react-redux";
import { userRedux } from "../../Redux/Reducers/auth";
import Layout from "../../Componets/Layout";
import Loading from "../../Componets/Loading";
import DataKosong from "../../Componets/DataKosong";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "moment/locale/id";

function templateBPD() {
  const [dataTemplateBPD, setDataTemplateBPD] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState({});
  const { colorMode } = useColorMode();
  const toast = useToast();
  const user = useSelector(userRedux);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  // State untuk form tambah templateBPD
  const [namaKota, setNamaKota] = useState("");
  const [uangHarian, setUangHarian] = useState(0);
  const [status, setStatus] = useState("aktif");
  const [templateRills, setTemplateRills] = useState([
    { uraian: "", nilai: 0 },
  ]);

  // State untuk edit
  const [editingId, setEditingId] = useState(null);

  // Format rupiah
  const formatRupiah = (value) => {
    if (value === null || value === undefined || isNaN(value)) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Parse rupiah dari string ke number
  const parseRupiah = (str) => {
    if (!str) return 0;
    const onlyDigits = str.toString().replace(/[^0-9]/g, "");
    return onlyDigits ? parseInt(onlyDigits, 10) : 0;
  };

  // Toggle expand row untuk menampilkan templateRill
  const toggleRow = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Fetch data templateBPD
  async function fetchTemplateBPD() {
    if (!user?.[0]?.unitKerja_profile?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/templateBPD/get/${
          user[0].unitKerja_profile.id
        }`
      );
      setDataTemplateBPD(res.data.result || []);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Gagal memuat data template BPD",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Handle change untuk templateRill
  const handleRillChange = (index, field, value) => {
    const newRills = [...templateRills];
    if (field === "nilai") {
      newRills[index][field] = parseRupiah(value);
    } else {
      newRills[index][field] = value;
    }
    setTemplateRills(newRills);
  };

  // Tambah row templateRill
  const addTemplateRill = () => {
    setTemplateRills([...templateRills, { uraian: "", nilai: 0 }]);
  };

  // Hapus row templateRill
  const removeTemplateRill = (index) => {
    if (templateRills.length > 1) {
      const newRills = templateRills.filter((_, i) => i !== index);
      setTemplateRills(newRills);
    }
  };

  // Reset form
  const resetForm = () => {
    setNamaKota("");
    setUangHarian(0);
    setStatus("aktif");
    setTemplateRills([{ uraian: "", nilai: 0 }]);
    setEditingId(null);
  };

  // Buka modal edit
  const handleEdit = (template) => {
    setEditingId(template.id);
    setNamaKota(template.namaKota || "");
    setUangHarian(template.uangHarian || 0);
    setStatus(template.status || "aktif");
    
    // Set templateRills dari data yang ada
    const rills = template.templateRills || template.templateRill || [];
    if (rills.length > 0) {
      setTemplateRills(
        rills.map((rill) => ({
          uraian: rill.uraian || "",
          nilai: rill.nilai || 0,
        }))
      );
    } else {
      setTemplateRills([{ uraian: "", nilai: 0 }]);
    }
    
    onEditOpen();
  };

  // Submit templateBPD (tambah atau edit)
  const submitTemplateBPD = () => {
    // Validasi
    if (!namaKota.trim()) {
      toast({
        title: "Error",
        description: "Nama kota wajib diisi",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (uangHarian <= 0) {
      toast({
        title: "Error",
        description: "Uang harian harus lebih dari 0",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Filter templateRill yang valid (minimal ada uraian)
    const validRills = templateRills.filter((rill) => rill.uraian.trim());

    if (validRills.length === 0) {
      toast({
        title: "Error",
        description: "Minimal harus ada 1 template Rill dengan uraian",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Siapkan data
    const isEdit = editingId !== null;
    const data = {
      namaKota: namaKota.trim(),
      uangHarian: uangHarian,
      status: status,
      unitKerjaId: user[0].unitKerja_profile.id,
      templateRills: validRills.map((rill) => ({
        uraian: rill.uraian.trim(),
        nilai: rill.nilai || 0,
      })),
    };

    // Jika edit, tambahkan id ke data
    if (isEdit) {
      data.id = editingId;
    }

    // Tentukan URL
    const url = isEdit
      ? `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/templateBPD/update/${editingId}`
      : `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/templateBPD/post`;

    // Submit ke API menggunakan POST untuk semua kasus
    axios.post(url, data)
      .then((res) => {
        toast({
          title: "Berhasil",
          description: isEdit
            ? "Template BPD berhasil diupdate"
            : "Template BPD berhasil ditambahkan",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        resetForm();
        if (isEdit) {
          onEditClose();
        } else {
          onClose();
        }
        fetchTemplateBPD();
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error",
          description:
            err.response?.data?.message ||
            (isEdit
              ? "Gagal mengupdate template BPD"
              : "Gagal menambahkan template BPD"),
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  useEffect(() => {
    if (user?.[0]?.unitKerja_profile?.id) {
      fetchTemplateBPD();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (isLoading) {
    return (
      <Layout>
        <Box bgColor={"secondary"} pb={"40px"} px={"30px"}>
          <Container
            maxWidth={"1280px"}
            style={{ overflowX: "auto" }}
            p={"30px"}
            variant={"primary"}
          >
            <Loading />
          </Container>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box bgColor={"secondary"} pb={"40px"} px={"30px"}>
        <Container
          maxWidth={"1280px"}
          style={{ overflowX: "auto" }}
          p={"30px"}
          variant={"primary"}
        >
          <Flex justify="space-between" align="center" mb={"30px"}>
            <HStack>
              <Box
                bgColor="primary"
                width="30px"
                height="30px"
                borderRadius="4px"
              />
              <Heading color="primary" fontSize="28px" fontWeight="600">
                Template BPD
              </Heading>
            </HStack>
            <Button
              leftIcon={<BsPlus />}
              variant="primary"
              onClick={onOpen}
            >
              Tambah Template BPD
            </Button>
          </Flex>

          {dataTemplateBPD.length === 0 ? (
            <DataKosong />
          ) : (
            <Table variant="primary">
              <Thead>
                <Tr>
                  <Th>No</Th>
                  <Th>Nama Kota</Th>
                  <Th>Uang Harian</Th>
                  <Th>Status</Th>
                  <Th>Template Rill</Th>
                  <Th>Aksi</Th>
                </Tr>
              </Thead>
              <Tbody>
                {dataTemplateBPD.map((template, index) => (
                  <React.Fragment key={template.id}>
                    <Tr>
                      <Td>{index + 1}</Td>
                      <Td fontWeight="medium">{template.namaKota || "-"}</Td>
                      <Td>{formatRupiah(template.uangHarian)}</Td>
                      <Td>
                        <Badge
                          colorScheme={
                            template.status === "aktif" ? "green" : "red"
                          }
                        >
                          {template.status || "-"}
                        </Badge>
                      </Td>
                      <Td>
                        {(template.templateRills || template.templateRill) &&
                        (template.templateRills || template.templateRill).length > 0 ? (
                          <Text>
                            {(template.templateRills || template.templateRill).length} item
                          </Text>
                        ) : (
                          <Text color="gray.500">Tidak ada</Text>
                        )}
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            icon={<BsPencil />}
                            onClick={() => handleEdit(template)}
                            size="sm"
                            variant="ghost"
                            colorScheme="blue"
                            aria-label="Edit"
                          />
                          {(template.templateRills || template.templateRill) &&
                          (template.templateRills || template.templateRill).length > 0 && (
                            <IconButton
                              icon={
                                expandedRows[template.id] ? (
                                  <BsChevronUp />
                                ) : (
                                  <BsChevronDown />
                                )
                              }
                              onClick={() => toggleRow(template.id)}
                              size="sm"
                              variant="ghost"
                              aria-label="Toggle details"
                            />
                          )}
                        </HStack>
                      </Td>
                    </Tr>
                    {expandedRows[template.id] &&
                      (template.templateRills || template.templateRill) &&
                      (template.templateRills || template.templateRill).length > 0 && (
                        <Tr>
                          <Td colSpan={6} p={0}>
                            <Collapse in={expandedRows[template.id]}>
                              <Box
                                p="20px"
                                bg={
                                  colorMode === "dark"
                                    ? "gray.800"
                                    : "gray.50"
                                }
                                borderTop="1px solid"
                                borderColor={
                                  colorMode === "dark"
                                    ? "gray.700"
                                    : "gray.200"
                                }
                              >
                                <Heading size="sm" mb="15px">
                                  Detail Template Rill
                                </Heading>
                                <Table variant="simple" size="sm">
                                  <Thead>
                                    <Tr>
                                      <Th>No</Th>
                                      <Th>Uraian</Th>
                                      <Th>Nilai</Th>
                                    </Tr>
                                  </Thead>
                                  <Tbody>
                                    {(template.templateRills || template.templateRill || []).map(
                                      (rill, rillIndex) => (
                                        <Tr key={rill.id}>
                                          <Td>{rillIndex + 1}</Td>
                                          <Td>{rill.uraian || "-"}</Td>
                                          <Td>{formatRupiah(rill.nilai)}</Td>
                                        </Tr>
                                      )
                                    )}
                                  </Tbody>
                                </Table>
                              </Box>
                            </Collapse>
                          </Td>
                        </Tr>
                      )}
                  </React.Fragment>
                ))}
              </Tbody>
            </Table>
          )}
        </Container>
      </Box>

      {/* Modal Tambah Template BPD */}
      <Modal
        isOpen={isOpen}
        onClose={() => {
          resetForm();
          onClose();
        }}
        size="4xl"
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent borderRadius="lg">
          <ModalHeader>Tambah Template BPD</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={6} align="stretch">
              {/* Form Template BPD */}
              <Box>
                <Heading size="md" mb={4}>
                  Data Template BPD
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Nama Kota</FormLabel>
                    <Input
                      value={namaKota}
                      onChange={(e) => setNamaKota(e.target.value)}
                      placeholder="Masukkan nama kota"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Uang Harian</FormLabel>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={formatRupiah(uangHarian)}
                      onChange={(e) => {
                        const parsed = parseRupiah(e.target.value);
                        setUangHarian(parsed);
                      }}
                      placeholder="Masukkan uang harian"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="aktif">Aktif</option>
                      <option value="nonaktif">Nonaktif</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>
              </Box>

              <Divider />

              {/* Form Template Rill */}
              <Box>
                <Flex justify="space-between" align="center" mb={4}>
                  <Heading size="md">Template Rill</Heading>
                  <Button
                    leftIcon={<BsPlus />}
                    size="sm"
                    variant="outline"
                    onClick={addTemplateRill}
                  >
                    Tambah Rill
                  </Button>
                </Flex>

                <VStack spacing={4} align="stretch">
                  {templateRills.map((rill, index) => (
                    <Box
                      key={index}
                      p={4}
                      border="1px solid"
                      borderColor={
                        colorMode === "dark" ? "gray.600" : "gray.200"
                      }
                      borderRadius="md"
                      bg={
                        colorMode === "dark" ? "gray.800" : "gray.50"
                      }
                    >
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl>
                          <FormLabel>Uraian</FormLabel>
                          <Input
                            value={rill.uraian}
                            onChange={(e) =>
                              handleRillChange(
                                index,
                                "uraian",
                                e.target.value
                              )
                            }
                            placeholder="Masukkan uraian"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Nilai</FormLabel>
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={formatRupiah(rill.nilai)}
                            onChange={(e) =>
                              handleRillChange(
                                index,
                                "nilai",
                                e.target.value
                              )
                            }
                            placeholder="Masukkan nilai"
                          />
                        </FormControl>
                      </SimpleGrid>

                      {templateRills.length > 1 && (
                        <Flex mt={4} justify="flex-end">
                          <Button
                            colorScheme="red"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeTemplateRill(index)}
                          >
                            Hapus
                          </Button>
                        </Flex>
                      )}
                    </Box>
                  ))}
                </VStack>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={() => {
                resetForm();
                onClose();
              }}
            >
              Batal
            </Button>
            <Button variant="primary" onClick={submitTemplateBPD}>
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Edit Template BPD */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => {
          resetForm();
          onEditClose();
        }}
        size="4xl"
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent borderRadius="lg">
          <ModalHeader>Edit Template BPD</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={6} align="stretch">
              {/* Form Template BPD */}
              <Box>
                <Heading size="md" mb={4}>
                  Data Template BPD
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Nama Kota</FormLabel>
                    <Input
                      value={namaKota}
                      onChange={(e) => setNamaKota(e.target.value)}
                      placeholder="Masukkan nama kota"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Uang Harian</FormLabel>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={formatRupiah(uangHarian)}
                      onChange={(e) => {
                        const parsed = parseRupiah(e.target.value);
                        setUangHarian(parsed);
                      }}
                      placeholder="Masukkan uang harian"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="aktif">Aktif</option>
                      <option value="nonaktif">Nonaktif</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>
              </Box>

              <Divider />

              {/* Form Template Rill */}
              <Box>
                <Flex justify="space-between" align="center" mb={4}>
                  <Heading size="md">Template Rill</Heading>
                  <Button
                    leftIcon={<BsPlus />}
                    size="sm"
                    variant="outline"
                    onClick={addTemplateRill}
                  >
                    Tambah Rill
                  </Button>
                </Flex>

                <VStack spacing={4} align="stretch">
                  {templateRills.map((rill, index) => (
                    <Box
                      key={index}
                      p={4}
                      border="1px solid"
                      borderColor={
                        colorMode === "dark" ? "gray.600" : "gray.200"
                      }
                      borderRadius="md"
                      bg={colorMode === "dark" ? "gray.800" : "gray.50"}
                    >
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl>
                          <FormLabel>Uraian</FormLabel>
                          <Input
                            value={rill.uraian}
                            onChange={(e) =>
                              handleRillChange(
                                index,
                                "uraian",
                                e.target.value
                              )
                            }
                            placeholder="Masukkan uraian"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Nilai</FormLabel>
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={formatRupiah(rill.nilai)}
                            onChange={(e) =>
                              handleRillChange(
                                index,
                                "nilai",
                                e.target.value
                              )
                            }
                            placeholder="Masukkan nilai"
                          />
                        </FormControl>
                      </SimpleGrid>

                      {templateRills.length > 1 && (
                        <Flex mt={4} justify="flex-end">
                          <Button
                            colorScheme="red"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeTemplateRill(index)}
                          >
                            Hapus
                          </Button>
                        </Flex>
                      )}
                    </Box>
                  ))}
                </VStack>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={() => {
                resetForm();
                onEditClose();
              }}
            >
              Batal
            </Button>
            <Button variant="primary" onClick={submitTemplateBPD}>
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Layout>
  );
}

export default templateBPD;
