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
  Spinner,
  Center,
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
} from "@chakra-ui/react";
import { FaEdit, FaPlus } from "react-icons/fa";
import { useSelector } from "react-redux";
import { userRedux } from "../../Redux/Reducers/auth";
import Loading from "../../Componets/Loading";
import DataKosong from "../../Componets/DataKosong";

function JenisDokumenBarjas(props) {
  const [dataJenisDokumen, setDataJenisDokumen] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    jenis: "",
    nomorSurat: "",
    nomorLoket: "",
  });
  const toast = useToast();
  const { colorMode } = useColorMode();
  const history = useHistory();
  const user = useSelector(userRedux);
  const {
    isOpen: isTambahOpen,
    onOpen: onTambahOpen,
    onClose: onTambahClose,
  } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const fetchJenisDokumen = useCallback(async () => {
    const indukUnitKerjaId = user?.[0]?.unitKerja_profile?.indukUnitKerja?.id;

    if (!indukUnitKerjaId) {
      toast({
        title: "Error",
        description: "Data user tidak ditemukan",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/barjas/get/jenis-dokumen/${indukUnitKerjaId}`
      );
      setDataJenisDokumen(res.data.result || []);
      console.log(res.data.result);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description:
          err.response?.data?.error || "Gagal memuat data jenis dokumen",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user?.[0]?.unitKerja_profile?.indukUnitKerja?.id) {
      fetchJenisDokumen();
    }
  }, [user, fetchJenisDokumen]);

  const handleTambahOpen = () => {
    setFormData({
      jenis: "",
      nomorSurat: "",
      nomorLoket: "",
    });
    setSelectedItem(null);
    onTambahOpen();
  };

  const handleEditOpen = (item) => {
    setSelectedItem(item);
    setFormData({
      jenis: item.jenis || "",
      nomorSurat: item.nomorSurat || "",
      nomorLoket: item.nomorLoket || "",
    });
    onEditOpen();
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmitTambah = async () => {
    const indukUnitKerjaId = user?.[0]?.unitKerja_profile?.indukUnitKerja?.id;

    if (!indukUnitKerjaId) {
      toast({
        title: "Error",
        description: "Data user tidak ditemukan",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.jenis || !formData.nomorSurat) {
      toast({
        title: "Error",
        description: "Jenis dan Nomor Surat harus diisi",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const res = await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/barjas/post/jenis-dokumen`,
        {
          jenis: formData.jenis,
          nomorSurat: formData.nomorSurat,
          indukUnitKerjaId,
        }
      );

      toast({
        title: "Berhasil",
        description: "Jenis dokumen berhasil ditambahkan",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onTambahClose();
      setFormData({
        jenis: "",
        nomorSurat: "",
        nomorLoket: "",
      });
      fetchJenisDokumen();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description:
          err.response?.data?.error || "Gagal menambahkan jenis dokumen",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSubmitEdit = async () => {
    const indukUnitKerjaId = user?.[0]?.unitKerja_profile?.indukUnitKerja?.id;

    if (!indukUnitKerjaId) {
      toast({
        title: "Error",
        description: "Data user tidak ditemukan",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.jenis || !formData.nomorSurat) {
      toast({
        title: "Error",
        description: "Jenis dan Nomor Surat harus diisi",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!selectedItem?.id) {
      toast({
        title: "Error",
        description: "Data tidak valid",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const res = await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/barjas/edit/jenis-dokumen`,
        {
          id: selectedItem.id,
          jenis: formData.jenis,
          nomorSurat: formData.nomorSurat,
          nomorLoket: formData.nomorLoket || 0,
          indukUnitKerjaId,
        }
      );

      toast({
        title: "Berhasil",
        description: "Jenis dokumen berhasil diupdate",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onEditClose();
      setSelectedItem(null);
      setFormData({
        jenis: "",
        nomorSurat: "",
        nomorLoket: "",
      });
      fetchJenisDokumen();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description:
          err.response?.data?.error || "Gagal mengupdate jenis dokumen",
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
      <Box bgColor={"secondary"} pb={"40px"} px={"30px"}>
        <Container
          border={"1px"}
          borderRadius={"6px"}
          borderColor={
            colorMode === "dark" ? "gray.700" : "rgba(229, 231, 235, 1)"
          }
          maxW={"2880px"}
          bgColor={colorMode === "dark" ? "gray.800" : "white"}
          p={"30px"}
        >
          <VStack spacing={4} align="stretch" mb={6}>
            <HStack justify="space-between" align="center">
              <Heading
                size="lg"
                color={colorMode === "dark" ? "white" : "gray.700"}
              >
                Jenis Dokumen Barjas
              </Heading>
              <HStack>
                <Button
                  onClick={handleTambahOpen}
                  colorScheme="green"
                  size="sm"
                  leftIcon={<FaPlus />}
                >
                  Tambah
                </Button>
                <Button
                  onClick={() => history.goBack()}
                  colorScheme="blue"
                  size="sm"
                >
                  Kembali
                </Button>
              </HStack>
            </HStack>
          </VStack>

          {dataJenisDokumen.length === 0 ? (
            <DataKosong message="Tidak ada data jenis dokumen" />
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" size="md">
                <Thead>
                  <Tr>
                    <Th>No</Th>
                    <Th>Jenis</Th>
                    <Th>Nomor Surat</Th>
                    <Th>Nomor Loket</Th>
                    <Th>Aksi</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {dataJenisDokumen.map((item, index) => (
                    <Tr key={item.id || index}>
                      <Td>{index + 1}</Td>
                      <Td>{item.jenis || "-"}</Td>
                      <Td>{item.nomorSurat || "-"}</Td>
                      <Td>{item.nomorLoket || "-"}</Td>
                      <Td>
                        <IconButton
                          icon={<FaEdit />}
                          size="sm"
                          colorScheme="blue"
                          onClick={() => handleEditOpen(item)}
                          aria-label="Edit"
                        />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}

          {/* Modal Tambah */}
          <Modal
            closeOnOverlayClick={false}
            isOpen={isTambahOpen}
            onClose={onTambahClose}
          >
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Tambah Jenis Dokumen</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel>Jenis</FormLabel>
                    <Input
                      placeholder="Masukkan jenis dokumen"
                      value={formData.jenis}
                      onChange={(e) =>
                        handleInputChange("jenis", e.target.value)
                      }
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Nomor Surat</FormLabel>
                    <Input
                      placeholder="Masukkan nomor surat"
                      value={formData.nomorSurat}
                      onChange={(e) =>
                        handleInputChange("nomorSurat", e.target.value)
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Nomor Loket</FormLabel>
                    <Input
                      type="number"
                      placeholder="Masukkan nomor loket"
                      value={formData.nomorLoket}
                      onChange={(e) =>
                        handleInputChange("nomorLoket", e.target.value)
                      }
                    />
                  </FormControl>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="blue" mr={3} onClick={handleSubmitTambah}>
                  Simpan
                </Button>
                <Button onClick={onTambahClose}>Batal</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          {/* Modal Edit */}
          <Modal
            closeOnOverlayClick={false}
            isOpen={isEditOpen}
            onClose={onEditClose}
          >
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Edit Jenis Dokumen</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel>Jenis</FormLabel>
                    <Input
                      placeholder="Masukkan jenis dokumen"
                      value={formData.jenis}
                      onChange={(e) =>
                        handleInputChange("jenis", e.target.value)
                      }
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Nomor Surat</FormLabel>
                    <Input
                      placeholder="Masukkan nomor surat"
                      value={formData.nomorSurat}
                      onChange={(e) =>
                        handleInputChange("nomorSurat", e.target.value)
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Nomor Loket</FormLabel>
                    <Input
                      type="number"
                      placeholder="Masukkan nomor loket"
                      value={formData.nomorLoket}
                      onChange={(e) =>
                        handleInputChange("nomorLoket", e.target.value)
                      }
                    />
                  </FormControl>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="blue" mr={3} onClick={handleSubmitEdit}>
                  Update
                </Button>
                <Button onClick={onEditClose}>Batal</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Container>
      </Box>
    </LayoutAset>
  );
}

export default JenisDokumenBarjas;
