import React, { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import axios from "axios";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  Input,
  Text,
  VStack,
  useToast,
  FormLabel,
  Select,
  Container,
  Flex,
  Thead,
  Tbody,
  Table,
  Tr,
  Center,
  Td,
  Th,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Heading,
  IconButton,
  Tooltip,
  Badge,
  Divider,
  HStack,
  Icon,
  useColorMode,
  SimpleGrid,
} from "@chakra-ui/react";
import { FiDownload, FiEdit2, FiTrash2, FiUpload, FiFile } from "react-icons/fi";
import { useSelector } from "react-redux";
import { userRedux, selectRole } from "../../Redux/Reducers/auth";
import Layout from "../../Componets/Layout";
const TemplateKeuangan = () => {
  const user = useSelector(userRedux);
  const role = useSelector(selectRole);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileAllKwitansi, setSelectedFileAllKwitansi] = useState(null);
  const [dataTemplate, setDataTemplate] = useState([]);
  const [dataGlobal, setDataGlobal] = useState([]);
  const [dataAllKwitansi, setDataAllKwitansi] = useState([]);
  const toast = useToast();
  const { colorMode } = useColorMode();

  // State untuk modal edit
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editItem, setEditItem] = useState(null);
  const [editType, setEditType] = useState(""); // "keuangan", "global", "allKwitansi"
  const [editNama, setEditNama] = useState("");
  const [editFile, setEditFile] = useState(null);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  async function fetchTemplate() {
    await axios
      .get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/template/get-keuangan`
      )
      .then((res) => {
        setDataTemplate(res.data.result);
        setDataGlobal(res.data.resultGlobal);
        console.log(res.data);
      })
      .catch((err) => {
        console.error(err.message);
      });
  }

  async function fetchAllKwitansi() {
    await axios
      .get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/template/get-all-kwitansi`
      )
      .then((res) => {
        setDataAllKwitansi(res.data.result);
        console.log(res.data);
      })
      .catch((err) => {
        console.error(err.message);
      });
  }

  const validationSchema = Yup.object().shape({
    file: Yup.mixed()
      .required("File harus diunggah")
      .test(
        "fileType",
        "Format file tidak valid. Harap unggah file .docx",
        (value) =>
          value &&
          value.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ),
  });

  const handleDelete = async (item) => {
    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/template/delete/template-keuangan/${item.id}`,
        { filename: item.template }
      );
      fetchTemplate();
      toast({
        title: "Sukses!",
        description: response.data.message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Membuat URL untuk file yang akan diunduh
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

  const handleDeleteGlobal = async (item) => {
    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/template/delete/template-keuangan-global/${item.id}`,
        { filename: item.template }
      );
      fetchTemplate();
      toast({
        title: "Sukses!",
        description: response.data.message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Membuat URL untuk file yang akan diunduh
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

  const handleDeleteAllKwitansi = async (item) => {
    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/template/delete/template-all-kwitansi/${item.id}`,
        { fileName: item.template }
      );
      fetchAllKwitansi();
      toast({
        title: "Sukses!",
        description: response.data.message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Gagal Menghapus",
        description: "Terjadi kesalahan saat menghapus template",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDownload = async (fileName) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/template/download`,
        {
          params: { fileName },

          responseType: "blob",
        }
      );

      // Membuat URL untuk file yang akan diunduh
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

  // Fungsi untuk membuka modal edit
  const handleOpenEdit = (item, type) => {
    setEditItem(item);
    setEditType(type);
    setEditNama(item.nama);
    setEditFile(null);
    onOpen();
  };

  // Fungsi untuk menutup modal edit
  const handleCloseEdit = () => {
    setEditItem(null);
    setEditType("");
    setEditNama("");
    setEditFile(null);
    onClose();
  };

  // Fungsi untuk submit edit
  const handleSubmitEdit = async () => {
    if (!editNama.trim()) {
      toast({
        title: "Validasi Gagal",
        description: "Nama template tidak boleh kosong",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsEditSubmitting(true);
    const formData = new FormData();
    formData.append("nama", editNama);
    if (editFile) {
      formData.append("file", editFile);
    }

    let endpoint = "";
    let fetchFunc = null;

    switch (editType) {
      case "keuangan":
        endpoint = `/template/edit-keuangan/${editItem.id}`;
        fetchFunc = fetchTemplate;
        break;
      case "global":
        endpoint = `/template/edit-keuangan-global/${editItem.id}`;
        fetchFunc = fetchTemplate;
        break;
      case "allKwitansi":
        endpoint = `/template/edit-all-kwitansi/${editItem.id}`;
        fetchFunc = fetchAllKwitansi;
        break;
      default:
        setIsEditSubmitting(false);
        return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}${endpoint}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast({
        title: "Sukses!",
        description: response.data.message || "Template berhasil diperbarui",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      fetchFunc();
      handleCloseEdit();
    } catch (error) {
      toast({
        title: "Gagal Memperbarui",
        description: error.response?.data?.message || "Terjadi kesalahan saat memperbarui template",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    setIsEditSubmitting(false);
  };

  useEffect(() => {
    fetchTemplate();
    fetchAllKwitansi();
  }, []);
  return (
    <Layout>
      <Box
        bg={colorMode === "dark" ? "gray.900" : "secondary.light"}
        pb={{ base: "30px", md: "40px" }}
        px={{ base: "15px", md: "30px" }}
        minH="100vh"
      >
        {/* Header Halaman */}
        <Box
          bg={colorMode === "dark" ? "gray.800" : "white"}
          p={{ base: "20px", md: "30px" }}
          borderRadius="10px"
          boxShadow="sm"
          border="1px solid"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          mt={{ base: "20px", md: "30px" }}
          mb={{ base: "20px", md: "30px" }}
        >
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "stretch", md: "center" }}
            gap={4}
          >
            <Box>
              <Heading
                size="lg"
                color={colorMode === "dark" ? "white" : "gray.700"}
              >
                Manajemen Template Keuangan
              </Heading>
              <Text
                color={colorMode === "dark" ? "gray.400" : "gray.600"}
                mt={1}
              >
                Kelola template dokumen keuangan untuk SPPD
              </Text>
            </Box>
            <HStack>
              <Badge colorScheme="blue" fontSize="sm" px={3} py={1}>
                {(dataTemplate?.length || 0) + (dataGlobal?.length || 0) + (dataAllKwitansi?.length || 0)} Total Template
              </Badge>
            </HStack>
          </Flex>
        </Box>

        {/* Section 1: Template Keuangan */}
        <Box
          bg={colorMode === "dark" ? "gray.800" : "white"}
          p={{ base: "20px", md: "30px" }}
          borderRadius="10px"
          boxShadow="sm"
          border="1px solid"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          mb={{ base: "20px", md: "30px" }}
        >
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "stretch", md: "center" }}
            mb={6}
            gap={4}
          >
            <HStack>
              <Icon as={FiFile} color="blue.500" boxSize={5} />
              <Heading
                size="md"
                color={colorMode === "dark" ? "white" : "gray.700"}
              >
                Template Keuangan
              </Heading>
              <Badge colorScheme="blue">
                {dataTemplate?.length || 0} Template
              </Badge>
            </HStack>
          </Flex>

          <Divider mb={6} />

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            {/* Form Upload */}
            <Box
              p={5}
              bg={colorMode === "dark" ? "gray.700" : "gray.50"}
              borderRadius="8px"
            >
              <HStack mb={4}>
                <Icon as={FiUpload} color="blue.500" />
                <Heading
                  size="sm"
                  color={colorMode === "dark" ? "white" : "gray.700"}
                >
                  Upload Template Baru
                </Heading>
              </HStack>
              <Formik
                initialValues={{ file: null, nama: "" }}
                validationSchema={validationSchema}
                onSubmit={async (values, { setSubmitting, resetForm }) => {
                  const formData = new FormData();
                  formData.append("file", values.file);
                  formData.append("nama", values.nama);

                  try {
                    const response = await axios.post(
                      `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/template/upload-keuangan`,
                      formData,
                      { headers: { "Content-Type": "multipart/form-data" } }
                    );

                    toast({
                      title: "Sukses!",
                      description: response.data.message,
                      status: "success",
                      duration: 3000,
                      isClosable: true,
                      position: "top",
                    });

                    resetForm();
                    fetchTemplate();
                    setSelectedFile(null);
                  } catch (error) {
                    toast({
                      title: "Gagal Mengunggah",
                      description: "Terjadi kesalahan saat mengunggah file",
                      status: "error",
                      duration: 3000,
                      isClosable: true,
                      position: "top",
                    });
                  }

                  setSubmitting(false);
                }}
              >
                {({ setFieldValue, isSubmitting, errors, touched }) => (
                  <Form>
                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel
                          fontSize="sm"
                          fontWeight="medium"
                          color={colorMode === "dark" ? "gray.300" : "gray.700"}
                        >
                          Nama Template
                        </FormLabel>
                        <Input
                          type="text"
                          placeholder="Masukkan nama template"
                          bg={colorMode === "dark" ? "gray.800" : "white"}
                          borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                          _hover={{ borderColor: "blue.500" }}
                          _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                          onChange={(event) => {
                            setFieldValue("nama", event.target.value);
                          }}
                        />
                      </FormControl>
                      <FormControl isInvalid={errors.file && touched.file}>
                        <FormLabel
                          fontSize="sm"
                          fontWeight="medium"
                          color={colorMode === "dark" ? "gray.300" : "gray.700"}
                        >
                          File Template (.docx)
                        </FormLabel>
                        <Input
                          type="file"
                          accept=".docx"
                          bg={colorMode === "dark" ? "gray.800" : "white"}
                          borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                          onChange={(event) => {
                            setFieldValue("file", event.currentTarget.files[0]);
                            setSelectedFile(event.currentTarget.files[0]);
                          }}
                          p={1}
                        />
                        <FormErrorMessage>{errors.file}</FormErrorMessage>
                      </FormControl>

                      {selectedFile && (
                        <HStack
                          bg={colorMode === "dark" ? "blue.900" : "blue.50"}
                          p={2}
                          borderRadius="md"
                        >
                          <Icon as={FiFile} color="blue.500" />
                          <Text
                            fontSize="sm"
                            color={colorMode === "dark" ? "blue.200" : "blue.700"}
                            isTruncated
                          >
                            {selectedFile.name}
                          </Text>
                        </HStack>
                      )}

                      <Button
                        type="submit"
                        colorScheme="blue"
                        leftIcon={<FiUpload />}
                        isLoading={isSubmitting}
                        isDisabled={!selectedFile}
                      >
                        Upload Template
                      </Button>
                    </VStack>
                  </Form>
                )}
              </Formik>
            </Box>

            {/* Tabel Template */}
            <Box
              borderRadius="8px"
              border="1px solid"
              borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
              overflow="hidden"
            >
              <Table variant="primary" size="sm">
                <Thead>
                  <Tr>
                    <Th w="50px">No</Th>
                    <Th>Nama Template</Th>
                    <Th w="120px" textAlign="center">Aksi</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {dataTemplate?.length > 0 ? (
                    dataTemplate.map((item, index) => (
                      <Tr
                        key={index}
                        _hover={{ bg: colorMode === "dark" ? "gray.750" : "gray.50" }}
                        transition="background-color 0.2s"
                      >
                        <Td fontWeight="medium">{index + 1}</Td>
                        <Td>
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color={colorMode === "dark" ? "white" : "gray.700"}
                          >
                            {item.nama}
                          </Text>
                        </Td>
                        <Td>
                          <HStack spacing={1} justify="center">
                            <Tooltip label="Download" hasArrow>
                              <IconButton
                                icon={<FiDownload />}
                                size="sm"
                                colorScheme="blue"
                                variant="ghost"
                                onClick={() => handleDownload(item.template)}
                                aria-label="Download"
                              />
                            </Tooltip>
                            <Tooltip label="Edit" hasArrow>
                              <IconButton
                                icon={<FiEdit2 />}
                                size="sm"
                                colorScheme="yellow"
                                variant="ghost"
                                onClick={() => handleOpenEdit(item, "keuangan")}
                                aria-label="Edit"
                              />
                            </Tooltip>
                            <Tooltip label="Hapus" hasArrow>
                              <IconButton
                                icon={<FiTrash2 />}
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => handleDelete(item)}
                                aria-label="Hapus"
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={3}>
                        <Center py={8} color={colorMode === "dark" ? "gray.500" : "gray.400"}>
                          <VStack>
                            <Icon as={FiFile} boxSize={8} />
                            <Text>Belum ada template</Text>
                          </VStack>
                        </Center>
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>
          </SimpleGrid>
        </Box>

        {/* Section 2: Template Kwitansi Global */}
        <Box
          bg={colorMode === "dark" ? "gray.800" : "white"}
          p={{ base: "20px", md: "30px" }}
          borderRadius="10px"
          boxShadow="sm"
          border="1px solid"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          mb={{ base: "20px", md: "30px" }}
        >
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "stretch", md: "center" }}
            mb={6}
            gap={4}
          >
            <HStack>
              <Icon as={FiFile} color="green.500" boxSize={5} />
              <Heading
                size="md"
                color={colorMode === "dark" ? "white" : "gray.700"}
              >
                Template Kwitansi Global
              </Heading>
              <Badge colorScheme="green">
                {dataGlobal?.length || 0} Template
              </Badge>
            </HStack>
          </Flex>

          <Divider mb={6} />

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            {/* Form Upload */}
            <Box
              p={5}
              bg={colorMode === "dark" ? "gray.700" : "gray.50"}
              borderRadius="8px"
            >
              <HStack mb={4}>
                <Icon as={FiUpload} color="green.500" />
                <Heading
                  size="sm"
                  color={colorMode === "dark" ? "white" : "gray.700"}
                >
                  Upload Template Baru
                </Heading>
              </HStack>
              <Formik
                initialValues={{ file: null, nama: "" }}
                validationSchema={validationSchema}
                onSubmit={async (values, { setSubmitting, resetForm }) => {
                  const formData = new FormData();
                  formData.append("file", values.file);
                  formData.append("nama", values.nama);

                  try {
                    const response = await axios.post(
                      `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/template/upload-keuangan-global`,
                      formData,
                      { headers: { "Content-Type": "multipart/form-data" } }
                    );

                    toast({
                      title: "Sukses!",
                      description: response.data.message,
                      status: "success",
                      duration: 3000,
                      isClosable: true,
                      position: "top",
                    });

                    resetForm();
                    fetchTemplate();
                    setSelectedFile(null);
                  } catch (error) {
                    toast({
                      title: "Gagal Mengunggah",
                      description: "Terjadi kesalahan saat mengunggah file",
                      status: "error",
                      duration: 3000,
                      isClosable: true,
                      position: "top",
                    });
                  }

                  setSubmitting(false);
                }}
              >
                {({ setFieldValue, isSubmitting, errors, touched }) => (
                  <Form>
                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel
                          fontSize="sm"
                          fontWeight="medium"
                          color={colorMode === "dark" ? "gray.300" : "gray.700"}
                        >
                          Nama Template
                        </FormLabel>
                        <Input
                          type="text"
                          placeholder="Masukkan nama template"
                          bg={colorMode === "dark" ? "gray.800" : "white"}
                          borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                          _hover={{ borderColor: "green.500" }}
                          _focus={{ borderColor: "green.500", boxShadow: "0 0 0 1px var(--chakra-colors-green-500)" }}
                          onChange={(event) => {
                            setFieldValue("nama", event.target.value);
                          }}
                        />
                      </FormControl>
                      <FormControl isInvalid={errors.file && touched.file}>
                        <FormLabel
                          fontSize="sm"
                          fontWeight="medium"
                          color={colorMode === "dark" ? "gray.300" : "gray.700"}
                        >
                          File Template (.docx)
                        </FormLabel>
                        <Input
                          type="file"
                          accept=".docx"
                          bg={colorMode === "dark" ? "gray.800" : "white"}
                          borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                          onChange={(event) => {
                            setFieldValue("file", event.currentTarget.files[0]);
                            setSelectedFile(event.currentTarget.files[0]);
                          }}
                          p={1}
                        />
                        <FormErrorMessage>{errors.file}</FormErrorMessage>
                      </FormControl>

                      {selectedFile && (
                        <HStack
                          bg={colorMode === "dark" ? "green.900" : "green.50"}
                          p={2}
                          borderRadius="md"
                        >
                          <Icon as={FiFile} color="green.500" />
                          <Text
                            fontSize="sm"
                            color={colorMode === "dark" ? "green.200" : "green.700"}
                            isTruncated
                          >
                            {selectedFile.name}
                          </Text>
                        </HStack>
                      )}

                      <Button
                        type="submit"
                        colorScheme="green"
                        leftIcon={<FiUpload />}
                        isLoading={isSubmitting}
                        isDisabled={!selectedFile}
                      >
                        Upload Template
                      </Button>
                    </VStack>
                  </Form>
                )}
              </Formik>
            </Box>

            {/* Tabel Template */}
            <Box
              borderRadius="8px"
              border="1px solid"
              borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
              overflow="hidden"
            >
              <Table variant="primary" size="sm">
                <Thead>
                  <Tr>
                    <Th w="50px">No</Th>
                    <Th>Nama Template</Th>
                    <Th w="120px" textAlign="center">Aksi</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {dataGlobal?.length > 0 ? (
                    dataGlobal.map((item, index) => (
                      <Tr
                        key={index}
                        _hover={{ bg: colorMode === "dark" ? "gray.750" : "gray.50" }}
                        transition="background-color 0.2s"
                      >
                        <Td fontWeight="medium">{index + 1}</Td>
                        <Td>
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color={colorMode === "dark" ? "white" : "gray.700"}
                          >
                            {item.nama}
                          </Text>
                        </Td>
                        <Td>
                          <HStack spacing={1} justify="center">
                            <Tooltip label="Download" hasArrow>
                              <IconButton
                                icon={<FiDownload />}
                                size="sm"
                                colorScheme="blue"
                                variant="ghost"
                                onClick={() => handleDownload(item.dokumen)}
                                aria-label="Download"
                              />
                            </Tooltip>
                            <Tooltip label="Edit" hasArrow>
                              <IconButton
                                icon={<FiEdit2 />}
                                size="sm"
                                colorScheme="yellow"
                                variant="ghost"
                                onClick={() => handleOpenEdit(item, "global")}
                                aria-label="Edit"
                              />
                            </Tooltip>
                            <Tooltip label="Hapus" hasArrow>
                              <IconButton
                                icon={<FiTrash2 />}
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => handleDeleteGlobal(item)}
                                aria-label="Hapus"
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={3}>
                        <Center py={8} color={colorMode === "dark" ? "gray.500" : "gray.400"}>
                          <VStack>
                            <Icon as={FiFile} boxSize={8} />
                            <Text>Belum ada template</Text>
                          </VStack>
                        </Center>
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>
          </SimpleGrid>
        </Box>

        {/* Section 3: Template All Kwitansi */}
        <Box
          bg={colorMode === "dark" ? "gray.800" : "white"}
          p={{ base: "20px", md: "30px" }}
          borderRadius="10px"
          boxShadow="sm"
          border="1px solid"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          mb={{ base: "20px", md: "30px" }}
        >
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "stretch", md: "center" }}
            mb={6}
            gap={4}
          >
            <HStack>
              <Icon as={FiFile} color="purple.500" boxSize={5} />
              <Heading
                size="md"
                color={colorMode === "dark" ? "white" : "gray.700"}
              >
                Template All Kwitansi
              </Heading>
              <Badge colorScheme="purple">
                {dataAllKwitansi?.length || 0} Template
              </Badge>
            </HStack>
          </Flex>

          <Divider mb={6} />

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            {/* Form Upload */}
            <Box
              p={5}
              bg={colorMode === "dark" ? "gray.700" : "gray.50"}
              borderRadius="8px"
            >
              <HStack mb={4}>
                <Icon as={FiUpload} color="purple.500" />
                <Heading
                  size="sm"
                  color={colorMode === "dark" ? "white" : "gray.700"}
                >
                  Upload Template Baru
                </Heading>
              </HStack>
              <Formik
                initialValues={{ file: null, nama: "" }}
                validationSchema={validationSchema}
                onSubmit={async (values, { setSubmitting, resetForm }) => {
                  const formData = new FormData();
                  formData.append("file", values.file);
                  formData.append("nama", values.nama);

                  try {
                    const response = await axios.post(
                      `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/template/upload-all-kwitansi`,
                      formData,
                      { headers: { "Content-Type": "multipart/form-data" } }
                    );

                    toast({
                      title: "Sukses!",
                      description: response.data.message,
                      status: "success",
                      duration: 3000,
                      isClosable: true,
                      position: "top",
                    });

                    resetForm();
                    fetchAllKwitansi();
                    setSelectedFileAllKwitansi(null);
                  } catch (error) {
                    toast({
                      title: "Gagal Mengunggah",
                      description: "Terjadi kesalahan saat mengunggah file",
                      status: "error",
                      duration: 3000,
                      isClosable: true,
                      position: "top",
                    });
                  }

                  setSubmitting(false);
                }}
              >
                {({ setFieldValue, isSubmitting, errors, touched }) => (
                  <Form>
                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel
                          fontSize="sm"
                          fontWeight="medium"
                          color={colorMode === "dark" ? "gray.300" : "gray.700"}
                        >
                          Nama Template
                        </FormLabel>
                        <Input
                          type="text"
                          placeholder="Masukkan nama template"
                          bg={colorMode === "dark" ? "gray.800" : "white"}
                          borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                          _hover={{ borderColor: "purple.500" }}
                          _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)" }}
                          onChange={(event) => {
                            setFieldValue("nama", event.target.value);
                          }}
                        />
                      </FormControl>
                      <FormControl isInvalid={errors.file && touched.file}>
                        <FormLabel
                          fontSize="sm"
                          fontWeight="medium"
                          color={colorMode === "dark" ? "gray.300" : "gray.700"}
                        >
                          File Template (.docx)
                        </FormLabel>
                        <Input
                          type="file"
                          accept=".docx"
                          bg={colorMode === "dark" ? "gray.800" : "white"}
                          borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                          onChange={(event) => {
                            setFieldValue("file", event.currentTarget.files[0]);
                            setSelectedFileAllKwitansi(event.currentTarget.files[0]);
                          }}
                          p={1}
                        />
                        <FormErrorMessage>{errors.file}</FormErrorMessage>
                      </FormControl>

                      {selectedFileAllKwitansi && (
                        <HStack
                          bg={colorMode === "dark" ? "purple.900" : "purple.50"}
                          p={2}
                          borderRadius="md"
                        >
                          <Icon as={FiFile} color="purple.500" />
                          <Text
                            fontSize="sm"
                            color={colorMode === "dark" ? "purple.200" : "purple.700"}
                            isTruncated
                          >
                            {selectedFileAllKwitansi.name}
                          </Text>
                        </HStack>
                      )}

                      <Button
                        type="submit"
                        colorScheme="purple"
                        leftIcon={<FiUpload />}
                        isLoading={isSubmitting}
                        isDisabled={!selectedFileAllKwitansi}
                      >
                        Upload Template
                      </Button>
                    </VStack>
                  </Form>
                )}
              </Formik>
            </Box>

            {/* Tabel Template */}
            <Box
              borderRadius="8px"
              border="1px solid"
              borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
              overflow="hidden"
            >
              <Table variant="primary" size="sm">
                <Thead>
                  <Tr>
                    <Th w="50px">No</Th>
                    <Th>Nama Template</Th>
                    <Th w="120px" textAlign="center">Aksi</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {dataAllKwitansi?.length > 0 ? (
                    dataAllKwitansi.map((item, index) => (
                      <Tr
                        key={index}
                        _hover={{ bg: colorMode === "dark" ? "gray.750" : "gray.50" }}
                        transition="background-color 0.2s"
                      >
                        <Td fontWeight="medium">{index + 1}</Td>
                        <Td>
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color={colorMode === "dark" ? "white" : "gray.700"}
                          >
                            {item.nama}
                          </Text>
                        </Td>
                        <Td>
                          <HStack spacing={1} justify="center">
                            <Tooltip label="Download" hasArrow>
                              <IconButton
                                icon={<FiDownload />}
                                size="sm"
                                colorScheme="blue"
                                variant="ghost"
                                onClick={() => handleDownload(item.template)}
                                aria-label="Download"
                              />
                            </Tooltip>
                            <Tooltip label="Edit" hasArrow>
                              <IconButton
                                icon={<FiEdit2 />}
                                size="sm"
                                colorScheme="yellow"
                                variant="ghost"
                                onClick={() => handleOpenEdit(item, "allKwitansi")}
                                aria-label="Edit"
                              />
                            </Tooltip>
                            <Tooltip label="Hapus" hasArrow>
                              <IconButton
                                icon={<FiTrash2 />}
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => handleDeleteAllKwitansi(item)}
                                aria-label="Hapus"
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={3}>
                        <Center py={8} color={colorMode === "dark" ? "gray.500" : "gray.400"}>
                          <VStack>
                            <Icon as={FiFile} boxSize={8} />
                            <Text>Belum ada template</Text>
                          </VStack>
                        </Center>
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>
          </SimpleGrid>
        </Box>
      </Box>

      {/* Modal Edit Template */}
      <Modal isOpen={isOpen} onClose={handleCloseEdit} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(2px)" />
        <ModalContent
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderRadius="10px"
        >
          <ModalHeader
            color={colorMode === "dark" ? "white" : "gray.700"}
            borderBottom="1px solid"
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            pb={4}
          >
            <HStack>
              <Icon
                as={FiEdit2}
                color={
                  editType === "keuangan"
                    ? "blue.500"
                    : editType === "global"
                    ? "green.500"
                    : "purple.500"
                }
              />
              <Text>
                Edit Template{" "}
                {editType === "keuangan"
                  ? "Keuangan"
                  : editType === "global"
                  ? "Kwitansi Global"
                  : "All Kwitansi"}
              </Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color={colorMode === "dark" ? "white" : "gray.700"} />
          <ModalBody py={6}>
            <VStack spacing={5} align="stretch">
              <FormControl>
                <FormLabel
                  fontSize="sm"
                  fontWeight="medium"
                  color={colorMode === "dark" ? "gray.300" : "gray.700"}
                >
                  Nama Template
                </FormLabel>
                <Input
                  type="text"
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  placeholder="Masukkan nama template"
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                  _hover={{
                    borderColor:
                      editType === "keuangan"
                        ? "blue.500"
                        : editType === "global"
                        ? "green.500"
                        : "purple.500",
                  }}
                  _focus={{
                    borderColor:
                      editType === "keuangan"
                        ? "blue.500"
                        : editType === "global"
                        ? "green.500"
                        : "purple.500",
                    boxShadow: `0 0 0 1px var(--chakra-colors-${
                      editType === "keuangan"
                        ? "blue"
                        : editType === "global"
                        ? "green"
                        : "purple"
                    }-500)`,
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel
                  fontSize="sm"
                  fontWeight="medium"
                  color={colorMode === "dark" ? "gray.300" : "gray.700"}
                >
                  File Template (Opsional)
                </FormLabel>
                <Input
                  type="file"
                  accept=".docx"
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                  onChange={(e) => setEditFile(e.currentTarget.files[0])}
                  p={1}
                />
                <Text
                  fontSize="xs"
                  color={colorMode === "dark" ? "gray.400" : "gray.500"}
                  mt={2}
                >
                  Kosongkan jika tidak ingin mengubah file
                </Text>
              </FormControl>
              {editFile && (
                <HStack
                  bg={
                    colorMode === "dark"
                      ? editType === "keuangan"
                        ? "blue.900"
                        : editType === "global"
                        ? "green.900"
                        : "purple.900"
                      : editType === "keuangan"
                      ? "blue.50"
                      : editType === "global"
                      ? "green.50"
                      : "purple.50"
                  }
                  p={3}
                  borderRadius="md"
                >
                  <Icon
                    as={FiFile}
                    color={
                      editType === "keuangan"
                        ? "blue.500"
                        : editType === "global"
                        ? "green.500"
                        : "purple.500"
                    }
                  />
                  <Text
                    fontSize="sm"
                    color={
                      colorMode === "dark"
                        ? editType === "keuangan"
                          ? "blue.200"
                          : editType === "global"
                          ? "green.200"
                          : "purple.200"
                        : editType === "keuangan"
                        ? "blue.700"
                        : editType === "global"
                        ? "green.700"
                        : "purple.700"
                    }
                    isTruncated
                  >
                    File baru: {editFile.name}
                  </Text>
                </HStack>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter
            borderTop="1px solid"
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            pt={4}
          >
            <Button variant="ghost" mr={3} onClick={handleCloseEdit}>
              Batal
            </Button>
            <Button
              colorScheme={
                editType === "keuangan"
                  ? "blue"
                  : editType === "global"
                  ? "green"
                  : "purple"
              }
              leftIcon={<FiEdit2 />}
              onClick={handleSubmitEdit}
              isLoading={isEditSubmitting}
              isDisabled={!editNama.trim()}
            >
              Simpan Perubahan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Layout>
  );
};

export default TemplateKeuangan;
