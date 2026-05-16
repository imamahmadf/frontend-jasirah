import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
  Center,
  Spinner,
} from "@chakra-ui/react";
import axios from "axios";
import LayoutPegawai from "../../../Componets/Pegawai/LayoutPegawai";

const API_BASE = import.meta.env.VITE_REACT_APP_API_BASE_URL;

function IndikatorKualitatifPJPL() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [indikator, setIndikator] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  async function fetchIndikatorKualitatif() {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE}/PJPL/get/indikator-kualitatif`
      );
      setData(res.data.result || []);
    } catch (err) {
      console.error(err);
      toast({
        title: "Gagal",
        description:
          err.response?.data?.error || "Gagal mengambil data indikator kualitatif PJPL",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchIndikatorKualitatif();
  }, []);

  async function tambahIndikatorKualitatif() {
    const value = (indikator || "").trim();
    if (!value) {
      toast({
        title: "Data belum lengkap",
        description: "Isi indikator terlebih dahulu.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API_BASE}/PJPL/post/indikator-kualitatif`, {
        indikator: value,
      });
      toast({
        title: "Berhasil",
        description: "Indikator kualitatif berhasil ditambahkan.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setIndikator("");
      onClose();
      fetchIndikatorKualitatif();
    } catch (err) {
      console.error(err);
      toast({
        title: "Gagal",
        description:
          err.response?.data?.error || "Gagal menambahkan indikator kualitatif.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  }

  function handleCloseModal() {
    setIndikator("");
    onClose();
  }

  return (
    <LayoutPegawai>
      <Box bgColor={"secondary"} pb={"40px"} px={"30px"}>
        <Container maxW={"1280px"} variant={"primary"} p={"30px"} my={"30px"}>
          <HStack gap={5} mb={"30px"}>
            <Heading>Indikator Kualitatif PJPL</Heading>
            <Button onClick={onOpen} variant={"primary"} px={"50px"}>
              Tambah +
            </Button>
          </HStack>

          {loading ? (
            <Center py={10}>
              <Spinner size="xl" />
            </Center>
          ) : (
            <Table variant={"pegawai"}>
              <Thead>
                <Tr>
                  <Th>No</Th>
                  <Th>Indikator</Th>
                </Tr>
              </Thead>
              <Tbody bgColor={"secondary"}>
                {data && data.length > 0 ? (
                  data.map((item, index) => (
                    <Tr key={item.id ?? index}>
                      <Td>{index + 1}</Td>
                      <Td>{item.indikator ?? "-"}</Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={2}>
                      <Text py={4}>Tidak ada data indikator kualitatif PJPL</Text>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          )}
        </Container>

        <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={handleCloseModal}>
          <ModalOverlay />
          <ModalContent borderRadius={0} maxWidth="600px">
            <ModalHeader />
            <ModalCloseButton />
            <ModalBody>
              <Box>
                <HStack mb={4}>
                  <Box bgColor={"pegawai"} width={"30px"} height={"30px"} />
                  <Heading size="md" color={"pegawai"}>
                    Tambah Indikator Kualitatif
                  </Heading>
                </HStack>
                <FormControl>
                  <FormLabel>Indikator</FormLabel>
                  <Input
                    value={indikator}
                    onChange={(e) => setIndikator(e.target.value)}
                    placeholder="Masukkan indikator kualitatif"
                    bg="terang"
                    border="0px"
                    height="50px"
                  />
                </FormControl>
              </Box>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={handleCloseModal}>
                Batal
              </Button>
              <Button
                variant={"primary"}
                onClick={tambahIndikatorKualitatif}
                isLoading={submitting}
                loadingText="Menyimpan..."
              >
                Simpan
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </LayoutPegawai>
  );
}

export default IndikatorKualitatifPJPL;
