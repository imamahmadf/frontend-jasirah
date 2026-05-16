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

function NomorSPBarjas(props) {
  const [dataNomorSP, setDataNomorSP] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
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

  const fetchNomorSP = useCallback(async () => {
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
        }/barjas/get/nomor-sp/?&id=${indukUnitKerjaId}`
      );
      setDataNomorSP(res.data.result || []);
      console.log(res.data.result);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: err.response?.data?.error || "Gagal memuat data nomor SP",
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
      fetchNomorSP();
    }
  }, [user, fetchNomorSP]);

  const handleTambahOpen = () => {
    setFormData({
      nomorSurat: "",
      nomorLoket: "",
    });
    setSelectedItem(null);
    onTambahOpen();
  };

  const handleEditOpen = (item) => {
    setSelectedItem(item);
    setFormData({
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

    if (!formData.nomorSurat) {
      toast({
        title: "Error",
        description: "Nomor Surat harus diisi",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/barjas/post/nomor-sp`,
        {
          indukUnitKerjaId,
          nomorSurat: formData.nomorSurat,
        }
      );

      toast({
        title: "Berhasil",
        description: "Nomor SP berhasil ditambahkan",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onTambahClose();
      setFormData({
        nomorSurat: "",
        nomorLoket: "",
      });
      fetchNomorSP();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: err.response?.data?.error || "Gagal menambahkan nomor SP",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSubmitEdit = async () => {
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

    if (!formData.nomorSurat) {
      toast({
        title: "Error",
        description: "Nomor Surat harus diisi",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/barjas/edit/nomor-sp`,
        {
          id: selectedItem.id,
          nomorSurat: formData.nomorSurat,
          nomorLoket: formData.nomorLoket || 0,
        }
      );

      toast({
        title: "Berhasil",
        description: "Nomor SP berhasil diupdate",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onEditClose();
      setSelectedItem(null);
      setFormData({
        nomorSurat: "",
        nomorLoket: "",
      });
      fetchNomorSP();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: err.response?.data?.error || "Gagal mengupdate nomor SP",
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
                Nomor SP Barjas
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

          {dataNomorSP.length === 0 ? (
            <DataKosong message="Tidak ada data nomor SP" />
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" size="md">
                <Thead>
                  <Tr>
                    <Th>No</Th>
                    <Th>Nomor Surat</Th>
                    <Th>Nomor Loket</Th>
                    <Th>Aksi</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {dataNomorSP.map((item, index) => (
                    <Tr key={item.id || index}>
                      <Td>{index + 1}</Td>
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
              <ModalHeader>Tambah Nomor SP</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                <VStack spacing={4} align="stretch">
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
              <ModalHeader>Edit Nomor SP</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                <VStack spacing={4} align="stretch">
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

export default NomorSPBarjas;
