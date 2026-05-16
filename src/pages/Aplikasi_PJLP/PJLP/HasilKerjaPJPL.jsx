import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  Button,
  Container,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  useToast,
  Badge,
  VStack,
  Divider,
  Center,
  Spinner,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  FormControl,
  FormLabel,
  useDisclosure,
} from "@chakra-ui/react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import LayoutPegawai from "../../Componets/Pegawai/LayoutPegawai";

function HasilKerjaPJPL(props) {
  const [dataRealisasi, setDataRealisasi] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [capaian, setCapaian] = useState("");
  const [buktiDukung, setBuktiDukung] = useState("");
  const [selectedKinerjaPJPLId, setSelectedKinerjaPJPLId] = useState(null);
  const [realisasiKinerjaPJPLId, setRealisasiKinerjaPJPLId] = useState(null);
  const history = useHistory();
  const toast = useToast();
  const {
    isOpen: isRealisasiOpen,
    onOpen: onRealisasiOpen,
    onClose: onRealisasiClose,
  } = useDisclosure();

  async function fetchDataRealisasi() {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/PJPL/get/realisasi-pjpl/${props.match.params.id}`
      );
      setDataRealisasi(res.data.result);
      console.log(res.data.result);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error!",
        description:
          err.response?.data?.error || "Gagal mengambil data realisasi PJPL",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleOpenModalRealisasi = (kinerjaPJPLId, realisasiKinerjaId) => {
    setSelectedKinerjaPJPLId(kinerjaPJPLId);
    setRealisasiKinerjaPJPLId(realisasiKinerjaId);
    setCapaian("");
    setBuktiDukung("");
    onRealisasiOpen();
  };

  const handleResetFormRealisasi = () => {
    setCapaian("");
    setBuktiDukung("");
    setSelectedKinerjaPJPLId(null);
    setRealisasiKinerjaPJPLId(null);
  };

  const tambahRealisasi = async () => {
    // Validasi form
    if (!capaian || capaian <= 0) {
      toast({
        title: "Error!",
        description: "Masukkan capaian yang valid (harus lebih dari 0)",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!buktiDukung.trim()) {
      toast({
        title: "Error!",
        description: "Masukkan link bukti dukung",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Validasi URL format (opsional, bisa dihapus jika tidak diperlukan)
    try {
      new URL(buktiDukung);
    } catch (e) {
      toast({
        title: "Error!",
        description: "Format link bukti dukung tidak valid",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const payload = {
        realisasiPJPLId: props.match.params.id,
        kinerjaPJPLId: selectedKinerjaPJPLId,
        capaian: parseFloat(capaian),
        buktiDukung: buktiDukung.trim(),
        status: "diajukan",
      };

      // Hanya tambahkan realisasiKinerjaPJPLId jika ada nilainya
      if (realisasiKinerjaPJPLId) {
        payload.realisasiKinerjaPJPLId = realisasiKinerjaPJPLId;
      }

      console.log("Payload yang dikirim:", payload);

      const res = await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/PJPL/post/hasil-kerja-pjpl`,
        payload
      );

      toast({
        title: "Berhasil!",
        description: "Data realisasi berhasil ditambahkan.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      handleResetFormRealisasi();
      onRealisasiClose();
      fetchDataRealisasi();
    } catch (err) {
      console.error(err.message);
      toast({
        title: "Error!",
        description:
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Data gagal ditambahkan",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Fungsi untuk mendapatkan realisasiKinerjaPJPLs berdasarkan kinerjaPJPLId
  const getRealisasiKinerjaPJPLs = (kinerjaPJPLId) => {
    const kinerja = dataRealisasi?.kinerjaPJPLs?.find(
      (k) => k.id === kinerjaPJPLId
    );
    return kinerja?.realisasiKinerjaPJPLs || null;
  };

  // Fungsi untuk mendapatkan realisasiKinerjaPJPLId berdasarkan kinerjaPJPLId
  const getRealisasiKinerjaPJPLId = (kinerjaPJPLId) => {
    // Cari kinerja berdasarkan ID
    const kinerja = dataRealisasi?.kinerjaPJPLs?.find(
      (k) => k.id === kinerjaPJPLId
    );

    // ID relasi ada di realisasiKinerjaPJPLs.id
    if (kinerja?.realisasiKinerjaPJPLs?.id) {
      return kinerja.realisasiKinerjaPJPLs.id;
    }

    return null;
  };

  // Fungsi untuk membuka link di tab baru
  const handleLinkClick = (link) => {
    if (!link) return;
    const validLink =
      link.startsWith("http://") || link.startsWith("https://")
        ? link
        : `https://${link}`;
    window.open(validLink, "_blank");
  };

  useEffect(() => {
    fetchDataRealisasi();
  }, []);

  return (
    <LayoutPegawai>
      <Box bgColor={"secondary"} pb={"40px"} px={"30px"}>
        <Container maxW={"1280px"} variant={"primary"} p={"30px"} my={"30px"}>
          <HStack mb={"30px"}>
            <Button onClick={() => history.goBack()} variant={"outline"}>
              Kembali
            </Button>
          </HStack>

          {isLoading ? (
            <Center py={"50px"}>
              <Spinner size="xl" color="pegawai" />
            </Center>
          ) : dataRealisasi ? (
            <VStack spacing={6} align="stretch">
              {/* Informasi Realisasi PJPL */}
              <Card>
                <CardHeader>
                  <Heading size="md">Informasi Realisasi PJPL</Heading>
                </CardHeader>
                <CardBody>
                  <SimpleGrid columns={2} spacing={4}>
                    <Box>
                      <Text fontWeight="bold" mb={2}>
                        Periode
                      </Text>
                      <Text>
                        {dataRealisasi.tanggalAwal && dataRealisasi.tanggalAkhir
                          ? `${new Date(
                              dataRealisasi.tanggalAwal
                            ).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })} - ${new Date(
                              dataRealisasi.tanggalAkhir
                            ).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}`
                          : "-"}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" mb={2}>
                        Status
                      </Text>
                      <Badge
                        colorScheme={
                          dataRealisasi.status === "diajukan"
                            ? "blue"
                            : dataRealisasi.status === "disetujui"
                            ? "green"
                            : dataRealisasi.status === "ditolak"
                            ? "red"
                            : "gray"
                        }
                      >
                        {dataRealisasi.status || "-"}
                      </Badge>
                    </Box>
                  </SimpleGrid>
                </CardBody>
              </Card>

              {/* Daftar Kinerja PJPL */}
              {dataRealisasi.kinerjaPJPLs &&
                dataRealisasi.kinerjaPJPLs.length > 0 && (
                  <Card>
                    <CardHeader>
                      <Heading size="md">Daftar Kinerja PJPL</Heading>
                    </CardHeader>
                    <CardBody>
                      <Table variant={"pegawai"}>
                        <Thead>
                          <Tr>
                            <Th>No</Th>
                            <Th>Indikator</Th>
                            <Th>Rencana Hasil Kerja</Th>
                            <Th>Target</Th> <Th>Capaian</Th>
                            <Th>Satuan</Th>
                            <Th>Status</Th>
                            <Th>Pegawai Kontrak</Th>
                            <Th>Bukti Dukung</Th>
                            <Th>Realisasi</Th>
                          </Tr>
                        </Thead>
                        <Tbody bgColor={"secondary"}>
                          {dataRealisasi.kinerjaPJPLs.map((item, index) => (
                            <Tr key={item.id}>
                              <Td>{index + 1}</Td>
                              <Td>{item.indikatorPejabat?.indikator || "-"}</Td>
                              <Td>{item.indikator || "-"}</Td>
                              <Td>{item.target || "-"}</Td>{" "}
                              <Td>
                                {item.realisasiKinerjaPJPLs?.hasil || "-"}
                              </Td>
                              <Td>{item.satuan || "-"}</Td>
                              <Td>
                                <Badge
                                  colorScheme={
                                    item.status === "diajukan"
                                      ? "blue"
                                      : item.status === "disetujui"
                                      ? "green"
                                      : item.status === "ditolak"
                                      ? "red"
                                      : "gray"
                                  }
                                >
                                  {item.realisasiKinerjaPJPLs?.status || "-"}
                                </Badge>
                              </Td>
                              <Td>
                                {item.kontrakPJPL?.pegawai?.nama || "-"}
                                <br />
                                <Text fontSize="sm" color="gray.500">
                                  {item.kontrakPJPL?.pegawai?.jabatan || ""}
                                </Text>
                              </Td>
                              <Td>
                                {item.realisasiKinerjaPJPLs?.buktiDukung ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    colorScheme="blue"
                                    onClick={() =>
                                      handleLinkClick(
                                        item.realisasiKinerjaPJPLs.buktiDukung
                                      )
                                    }
                                  >
                                    Lihat Bukti Dukung
                                  </Button>
                                ) : (
                                  "-"
                                )}
                              </Td>
                              <Td>
                                {item.realisasiKinerjaPJPLs?.status ===
                                "diterima" ? (
                                  "-"
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    colorScheme="green"
                                    onClick={() => {
                                      const realisasiKinerjaId =
                                        getRealisasiKinerjaPJPLId(item.id);
                                      console.log("Kinerja ID:", item.id);
                                      console.log(
                                        "Realisasi Kinerja ID:",
                                        realisasiKinerjaId
                                      );
                                      console.log("Item data:", item);
                                      handleOpenModalRealisasi(
                                        item.id,
                                        realisasiKinerjaId
                                      );
                                    }}
                                  >
                                    Input Realisasi
                                  </Button>
                                )}
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </CardBody>
                  </Card>
                )}
            </VStack>
          ) : (
            <Center py={"50px"}>
              <Text>Data tidak ditemukan</Text>
            </Center>
          )}
        </Container>
      </Box>

      {/* Modal Input Realisasi */}
      <Modal
        closeOnOverlayClick={false}
        isOpen={isRealisasiOpen}
        onClose={() => {
          handleResetFormRealisasi();
          onRealisasiClose();
        }}
      >
        <ModalOverlay />
        <ModalContent borderRadius={0} maxWidth="1200px">
          <ModalHeader></ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Box>
              <HStack mb={"30px"}>
                <Box bgColor={"pegawai"} width={"30px"} height={"30px"}></Box>
                <Heading color={"pegawai"}>Input Realisasi</Heading>
              </HStack>

              <SimpleGrid columns={1} spacing={10} p={"30px"}>
                <FormControl>
                  <FormLabel fontSize={"24px"}>Capaian</FormLabel>
                  <Input
                    height={"60px"}
                    bgColor={"terang"}
                    type="number"
                    min="0"
                    step="0.01"
                    value={capaian}
                    onChange={(e) => setCapaian(e.target.value)}
                    placeholder="Contoh: 100"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize={"24px"}>
                    Bukti Dukung (Link Google Drive)
                  </FormLabel>
                  <Input
                    height={"60px"}
                    bgColor={"terang"}
                    type="url"
                    value={buktiDukung}
                    onChange={(e) => setBuktiDukung(e.target.value)}
                    placeholder="https://drive.google.com/..."
                  />
                </FormControl>
              </SimpleGrid>
            </Box>
          </ModalBody>

          <ModalFooter pe={"60px"} pb={"30px"}>
            <Button
              variant={"outline"}
              mr={3}
              onClick={() => {
                handleResetFormRealisasi();
                onRealisasiClose();
              }}
            >
              Batal
            </Button>
            <Button onClick={tambahRealisasi} variant={"primary"}>
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </LayoutPegawai>
  );
}

export default HasilKerjaPJPL;
